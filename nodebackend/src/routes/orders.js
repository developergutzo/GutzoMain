import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, successResponse, paginatedResponse, ApiError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// ============================================
// HELPER: Generate Order Number
// ============================================
const generateOrderNumber = () => {
  const date = new Date();
  const prefix = 'GZ';
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${dateStr}${random}`;
};

// ============================================
// HELPER: Calculate Order Total
// ============================================
const calculateOrderTotal = async (items, vendorId, couponCode = null) => {
  let subtotal = 0;
  const itemDetails = [];

  for (const item of items) {
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, name, price, discount_price')
      .eq('id', item.product_id)
      .single();

    if (!product) continue;

    const price = product.discount_price || product.price;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;

    itemDetails.push({
      product_id: item.product_id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: price,
      total_price: itemTotal,
      variant_id: item.variant_id,
      addons: item.addons,
      special_instructions: item.special_instructions
    });
  }

  // Get vendor details for delivery fee
  const { data: vendor } = await supabaseAdmin
    .from('vendors')
    .select('delivery_fee, minimum_order')
    .eq('id', vendorId)
    .single();

  const deliveryFee = vendor?.delivery_fee || 1; // Default to 1 for testing
  const packagingFee = 0; // Removed separate packaging fee
  const platformFee = 1; // Fixed platform fee to 1 for testing
  let discount = 0;

  // Apply coupon if provided
  if (couponCode) {
    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (coupon) {
      if (subtotal >= coupon.minimum_order) {
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * coupon.discount_value) / 100;
          if (coupon.maximum_discount) {
            discount = Math.min(discount, coupon.maximum_discount);
          }
        } else {
          discount = coupon.discount_value;
        }
      }
    }
  }

  // Calculate included taxes for reporting (approximate based on UI logic)
  // UI logic: 5% on items, 18% on fees. Both are inclusive.
  const itemTax = subtotal - (subtotal / 1.05);
  const feeTax = (deliveryFee + platformFee) - ((deliveryFee + platformFee) / 1.18);
  const totalTax = Math.round(itemTax + feeTax);

  // Total is sum of components (prices are inclusive)
  const total = subtotal + deliveryFee + packagingFee + platformFee - discount;

  return {
    subtotal,
    deliveryFee,
    packagingFee,
    platformFee,
    taxes: totalTax, // Use calculated inclusive tax
    discount,
    total,
    itemDetails
  };
};

// All order routes require authentication
router.use(authenticate);

// ============================================
// CREATE ORDER
// POST /api/orders
// ============================================
router.post('/', validate(schemas.createOrder), asyncHandler(async (req, res) => {
  try {
    const {
      vendor_id,
      items,
      delivery_address,
      delivery_phone,
      coupon_code,
      tip_amount = 0,
      special_instructions,
      payment_method,
      order_source = 'app'
    } = req.body;

    // console.log('📦 Creating Order:', { vendor_id, itemCount: items.length });

    // Verify vendor is open
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendor_id)
      .eq('is_active', true)
      .single();

    if (vendorError) {
        console.error('❌ Vendor Error:', vendorError);
        throw new ApiError(404, 'Vendor not found');
    }
    if (!vendor) {
        console.error('❌ Vendor not found');
        throw new ApiError(404, 'Vendor not found');
    }
    if (!vendor.is_open) throw new ApiError(400, 'Vendor is currently closed');

    // Calculate totals
    // console.log('🧮 Calculating totals...');
    const calculation = await calculateOrderTotal(items, vendor_id, coupon_code);

    // Check minimum order
    // Check minimum order
    /* Disabled as per user request
    if (vendor.minimum_order && calculation.subtotal < vendor.minimum_order) {
      throw new ApiError(400, `Minimum order amount is ₹${vendor.minimum_order}`);
    }
    */

    const orderNumber = generateOrderNumber();
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // console.log('📝 Inserting Order:', orderNumber);

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: req.user.id,
        // user_phone removed as it is not in schema
        vendor_id,
        // vendor_name removed as it is not in schema
        delivery_address: JSON.stringify(delivery_address),
        delivery_phone,
        subtotal: calculation.subtotal,
      delivery_fee: calculation.deliveryFee,
      packaging_fee: calculation.packagingFee,
      platform_fee: calculation.platformFee,
      taxes: calculation.taxes,
      discount_amount: calculation.discount,
      tip_amount,
      total_amount: calculation.total + tip_amount,
      status: 'placed',
      payment_method,
      payment_status: payment_method === 'cod' ? 'pending' : 'pending',
      special_instructions,
      delivery_otp: deliveryOtp,
      order_source,
      coupon_code
    })
    .select()
    .single();

  if (orderError) {
      console.error('❌ DB Error inserting order:', orderError);
      throw new ApiError(500, `Failed to create order: ${orderError.message}`);
  }

  // Create order items
  const orderItems = calculation.itemDetails.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    vendor_id: vendor_id, // Added matching schema
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    // variant_id removed
    customizations: item.addons ? JSON.stringify(item.addons) : null, // Mapped addons to customizations
    special_instructions: item.special_instructions
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('❌ DB Error inserting order items:', itemsError);
    // Rollback order
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    throw new ApiError(500, `Failed to create order items: ${itemsError.message}`);
  }

  // Update coupon usage if used
  if (coupon_code && calculation.discount > 0) {
    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('id, used_count')
      .eq('code', coupon_code.toUpperCase())
      .single();

    if (coupon) {
      await supabaseAdmin
        .from('coupon_usage')
        .insert({
          coupon_id: coupon.id,
          user_id: req.user.id,
          order_id: order.id,
          discount_applied: calculation.discount
        });

      await supabaseAdmin
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', coupon.id);
    }
  }

  // Clear cart for this vendor
  await supabaseAdmin
    .from('cart')
    .delete()
    .eq('user_phone', req.user.phone)
    .eq('vendor_id', vendor_id);

  // Update user stats
  await supabaseAdmin
    .from('users')
    .update({
      total_orders: req.user.total_orders + 1,
      total_spent: (req.user.total_spent || 0) + calculation.total + tip_amount,
      last_order_at: new Date().toISOString()
    })
    .eq('id', req.user.id);

  // Create notification
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: req.user.id,
      type: 'order_placed',
      title: 'Order Placed!',
      message: `Your order #${orderNumber} has been placed successfully.`,
      data: { order_id: order.id, order_number: orderNumber }
    });

  successResponse(res, {
    order,
    items: calculation.itemDetails,
    calculation: {
      subtotal: calculation.subtotal,
      deliveryFee: calculation.deliveryFee,
      discount: calculation.discount,
      tip: tip_amount,
      total: calculation.total + tip_amount
    }
  }, 'Order placed successfully', 201);
  } catch (error) {
     console.error('❌ Create Order Unhandled Error:', error);
     throw error; // Re-throw to be caught by asyncHandler
  }
}));

// ============================================
// GET USER ORDERS
// GET /api/orders
// ============================================
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `, { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) query = query.eq('status', status);

  const { data: orders, error, count } = await query;

  // console.log(`[DEBUG] GET /orders for User ${req.user.id} (${req.user.phone}) - Found: ${count}`);
  if (orders && orders.length > 0) {
      // console.log(`[DEBUG] First order ID: ${orders[0].id} Status: ${orders[0].status}`);
  } else {
      // console.log(`[DEBUG] No orders found for query details.`);
  }

  if (error) throw new ApiError(500, 'Failed to fetch orders');

  paginatedResponse(res, orders, page, limit, count);
}));

// ============================================
// GET ORDER BY ID
// GET /api/orders/:id
// ============================================
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      vendor:vendors(id, name, image, phone, whatsapp_number)
    `)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !order) throw new ApiError(404, 'Order not found');

  successResponse(res, order);
}));

// ============================================
// GET ORDER BY ORDER NUMBER
// GET /api/orders/number/:orderNumber
// ============================================
router.get('/number/:orderNumber', asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('order_number', orderNumber)
    .eq('user_id', req.user.id)
    .single();

  if (error || !order) throw new ApiError(404, 'Order not found');

  successResponse(res, order);
}));

// ============================================
// CANCEL ORDER
// POST /api/orders/:id/cancel
// ============================================
router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !order) throw new ApiError(404, 'Order not found');

  // Can only cancel if order is in initial stages
  const cancelableStatuses = ['placed', 'confirmed'];
  if (!cancelableStatuses.includes(order.status)) {
    throw new ApiError(400, `Cannot cancel order in '${order.status}' status`);
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_by: 'user',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw new ApiError(500, 'Failed to cancel order');

  // Create notification
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: req.user.id,
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `Your order #${order.order_number} has been cancelled.`,
      data: { order_id: id, order_number: order.order_number }
    });

  successResponse(res, updated, 'Order cancelled successfully');
}));

// ============================================
// REORDER (Create order from previous order)
// POST /api/orders/:id/reorder
// ============================================
router.post('/:id/reorder', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: previousOrder, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !previousOrder) throw new ApiError(404, 'Order not found');

  // Convert order items to cart format
  const items = previousOrder.items.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    variant_id: item.variant_id,
    addons: item.addons ? JSON.parse(item.addons) : null,
    special_instructions: item.special_instructions
  }));

  successResponse(res, {
    vendor_id: previousOrder.vendor_id,
    items,
    delivery_address: previousOrder.delivery_address,
    message: 'Items ready for checkout. Complete the order by calling POST /orders'
  });
}));

// ============================================
// RATE ORDER
// POST /api/orders/:id/rate
// ============================================
router.post('/:id/rate', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !order) throw new ApiError(404, 'Order not found');

  if (order.status !== 'delivered') {
    throw new ApiError(400, 'Can only rate delivered orders');
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      rating,
      feedback,
      feedback_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw new ApiError(500, 'Failed to submit rating');

  successResponse(res, updated, 'Thank you for your feedback!');
}));

// ============================================
// TRACK ORDER (Get live status)
// GET /api/orders/:id/track
// ============================================
router.get('/:id/track', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, order_number, status, 
      estimated_delivery_time, actual_delivery_time,
      rider_id, riders(name, phone, current_lat, current_lng),
      vendor:vendors(id, name, latitude, longitude)
    `)
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();

  if (error || !order) throw new ApiError(404, 'Order not found');

  const statusFlow = [
    { status: 'placed', label: 'Order Placed', icon: '📝' },
    { status: 'confirmed', label: 'Confirmed', icon: '✅' },
    { status: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { status: 'ready', label: 'Ready for Pickup', icon: '📦' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴' },
    { status: 'delivered', label: 'Delivered', icon: '✨' }
  ];

  const currentIndex = statusFlow.findIndex(s => s.status === order.status);

  successResponse(res, {
    order_number: order.order_number,
    current_status: order.status,
    status_flow: statusFlow.map((s, i) => ({
      ...s,
      completed: i <= currentIndex,
      current: i === currentIndex
    })),
    estimated_delivery: order.estimated_delivery_time,
    rider: order.riders,
    vendor_location: order.vendor ? {
      lat: order.vendor.latitude,
      lng: order.vendor.longitude
    } : null
  });
}));

export default router;
