import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler.js';
import { sendVendorOTP } from '../utils/emailService.js';

const router = express.Router();

// ============================================
// VENDOR LOGIN
// POST /api/vendor-auth/login
// ============================================
// ============================================
// CHECK VENDOR STATUS
// POST /api/vendor-auth/check-status
// ============================================
router.post('/check-status', asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, 'Phone number is required');

  // 1. Check vendors table
  const { data: vendor } = await supabaseAdmin
    .from('vendors')
    .select('id, is_active')
    .eq('phone', phone)
    .single();

  if (vendor) {
    if (!vendor.is_active) {
      // Optional: could handle inactive differently, but for now treating as 'vendor' implies password check
      // or we could block here. Let's return status 'vendor' but frontend will hit login and fail on is_active check if we keep that logic there.
      // Actually user request says "password match then show".
      // Let's stick to returning 'vendor'.
    }
    return successResponse(res, { status: 'vendor' });
  }

  // 2. Check vendor_leads table
  const { data: lead } = await supabaseAdmin
    .from('vendor_leads')
    .select('id, status, remarks')
    .eq('phone', phone)
    .single();

  if (lead) {
    return successResponse(res, {
      status: 'lead',
      leadStatus: lead.status,
      leadRemarks: lead.remarks
    });
  }

  // 3. New user
  return successResponse(res, { status: 'new' });
}));

// ============================================
// VENDOR LOGIN
// POST /api/vendor-auth/login
// ============================================
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Check if vendor exists with this email
  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !vendor) {
    throw new ApiError(404, 'Vendor not found'); // Should catch this in check-status theoretically
  }

  if (!vendor.is_active) {
    throw new ApiError(403, 'Account is inactive. Contact Admin.');
  }

  // Verify password (simple exact match for now as stored in DB)
  if (vendor.password !== password) {
    throw new ApiError(401, 'Invalid password');
  }

  // Return success with vendor info
  delete vendor.password; // Don't send password back

  successResponse(res, { vendor }, 'Login successful');
}));

// ============================================
// UPDATE KITCHEN STATUS
// POST /api/vendor-auth/:id/status
// ============================================
router.post('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isOpen } = req.body;

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .update({ is_open: isOpen })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApiError(500, 'Failed to update status');

  successResponse(res, { vendor }, 'Status updated successfully');
}));

// ============================================
// GET VENDOR PRODUCTS (MENU)
// GET /api/vendor-auth/:id/products
// ============================================
router.get('/:id/products', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Fetch products ordered by sort_order or created_at
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('vendor_id', id)
    .order('sort_order', { ascending: true });

  if (error) throw new ApiError(500, 'Failed to fetch menu');

  successResponse(res, { products });
}));

// ============================================
// ADD PRODUCT
// POST /api/vendor-auth/:id/products
// ============================================
// ============================================
// ADD PRODUCT
// POST /api/vendor-auth/:id/products
// ============================================
router.post('/:id/products', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, image_url, category, is_veg, is_available, addon_ids, parent_product_ids } = req.body;

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({
      id: req.body.id, // Use explicit ID if provided (for folder consistency)
      vendor_id: id,
      // Wait, the route is defined as POST /api/vendor-auth/:id/products
      // :id is the VENDOR ID based on usage "router.post('/:id/products'..."
      // So line 147 used 'id' as vendor_id. Correct.
      // We just need to add 'id: req.body.id' to the insert object if it exists.
      vendor_id: id,
      name,
      description,
      price,
      image_url: image_url || image,
      category,
      is_veg: is_veg ?? true,
      is_available: is_available ?? true,
      rating: 0,
      sort_order: 999,
      addon_ids: addon_ids || []
    })
    .select()
    .single();

  if (error) {
    console.error('Create Product Info:', error);
    throw new ApiError(500, `Failed to create product: ${error.message}`);
  }

  // Handle Link as Addon (Parent Products)
  if (parent_product_ids && Array.isArray(parent_product_ids) && parent_product_ids.length > 0) {
    // Fetch current addons of these parents
    const { data: parents } = await supabaseAdmin
      .from('products')
      .select('id, addon_ids')
      .in('id', parent_product_ids);

    if (parents) {
      for (const parent of parents) {
        const currentAddons = parent.addon_ids || [];
        if (!currentAddons.includes(product.id)) {
          await supabaseAdmin
            .from('products')
            .update({ addon_ids: [...currentAddons, product.id] })
            .eq('id', parent.id);
        }
      }
    }
  }

  successResponse(res, { product }, 'Product added successfully');
}));

// ============================================
// UPDATE PRODUCT
// PUT /api/vendor-auth/:id/products/:productId
// ============================================
router.put('/:id/products/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { addon_ids, parent_product_ids, ...updates } = req.body;

  // Prepare update payload
  const payload = { ...updates };
  if (addon_ids) payload.addon_ids = addon_ids;

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .update(payload)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw new ApiError(500, 'Failed to update product');

  // Handle Link as Addon (Parent Products)
  if (parent_product_ids && Array.isArray(parent_product_ids) && parent_product_ids.length > 0) {
    const { data: parents } = await supabaseAdmin
      .from('products')
      .select('id, addon_ids')
      .in('id', parent_product_ids);

    if (parents) {
      for (const parent of parents) {
        const currentAddons = parent.addon_ids || [];
        if (!currentAddons.includes(productId)) {
          await supabaseAdmin
            .from('products')
            .update({ addon_ids: [...currentAddons, productId] })
            .eq('id', parent.id);
        }
      }
    }
  }

  successResponse(res, { product }, 'Product updated successfully');
}));

// ============================================
// DELETE PRODUCT
// DELETE /api/vendor-auth/:id/products/:productId
// ============================================
router.delete('/:id/products/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw new ApiError(500, 'Failed to delete product');

  successResponse(res, null, 'Product deleted successfully');
}));

// ============================================
// UPDATE VENDOR PROFILE
// PUT /api/vendor-auth/:id/profile
// ============================================
router.put('/:id/profile', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent updating critical fields like id, username, password via this route
  const { id: _, username, password, ...safeUpdates } = req.body;

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApiError(500, 'Failed to update profile');

  successResponse(res, { vendor }, 'Profile updated successfully');
}));

// ============================================
// FORGOT PASSWORD - REQUEST OTP
// POST /api/vendor-auth/forgot-password
// ============================================
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  // Check if vendor exists
  const { data: vendor } = await supabaseAdmin
    .from('vendors')
    .select('id, email')
    .eq('email', email)
    .single();

  if (!vendor) throw new ApiError(404, 'No account found with this email');

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Store in DB (Update vendor record)
  const { error } = await supabaseAdmin
    .from('vendors')
    .update({ otp, otp_expires_at: expiresAt })
    .eq('email', email);

  if (error) throw new ApiError(500, 'Failed to generate OTP');

  // Send Email
  await sendVendorOTP(email, otp);

  successResponse(res, null, 'OTP sent to your email');
}));

// ============================================
// VERIFY OTP
// POST /api/vendor-auth/verify-otp
// ============================================
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, 'Email and OTP required');

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .select('id, otp, otp_expires_at')
    .eq('email', email)
    .single();

  if (error || !vendor) throw new ApiError(400, 'Invalid request');

  // Verify OTP and Expiry
  if (vendor.otp !== otp) throw new ApiError(400, 'Invalid OTP');
  if (new Date(vendor.otp_expires_at) < new Date()) throw new ApiError(400, 'OTP has expired');

  successResponse(res, { valid: true }, 'OTP Verified');
}));

// ============================================
// RESET PASSWORD
// POST /api/vendor-auth/reset-password
// ============================================
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new ApiError(400, 'All fields required');

  // Verify OTP again (double check)
  const { data: vendor } = await supabaseAdmin
    .from('vendors')
    .select('id, otp, otp_expires_at')
    .eq('email', email)
    .single();

  if (!vendor || vendor.otp !== otp || new Date(vendor.otp_expires_at) < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  // Update Password and Clear OTP
  const { error: updateError } = await supabaseAdmin
    .from('vendors')
    .update({
      password: newPassword,
      otp: null,
      otp_expires_at: null
    })
    .eq('email', email);

  if (updateError) throw new ApiError(500, 'Failed to reset password');

  successResponse(res, null, 'Password reset successful. Please login.');
}));

// ============================================
// GET VENDOR ORDERS
// GET /api/vendor-auth/:id/orders
// ============================================
router.get('/:id/orders', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, limit = 50 } = req.query;

  let query = supabaseAdmin
    .from('orders')
    .select(`
        *,
        items:order_items(*),
        delivery:deliveries(*)
      `)
    .eq('vendor_id', id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    // Support comma separated statuses e.g. "placed,confirmed,preparing"
    const statuses = status.split(',');
    query = query.in('status', statuses);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error('❌ Vendor Orders Error:', error);
    throw new ApiError(500, `Failed to fetch vendor orders: ${error.message}`);
  }

  successResponse(res, { orders });
}));

// ============================================
// UPDATE VENDOR ORDER STATUS
// PATCH /api/vendor-auth/:id/orders/:orderId/status
// ============================================
router.patch('/:id/orders/:orderId/status', asyncHandler(async (req, res) => {
  const { id, orderId } = req.params;
  const { status } = req.body;

  if (!['preparing', 'ready', 'completed', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status update');
  }

  // Verify order belongs to vendor
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('vendor_id', id)
    .select()
    .single();

  if (error || !order) throw new ApiError(404, 'Order not found or update failed');

  // Send Notification to User if needed (e.g. "Your food is being prepared")
  if (status === 'preparing') {
    await supabaseAdmin.from('notifications').insert({
      user_id: order.user_id,
      type: 'order_update',
      title: 'Order Preparing 🍳',
      message: `The kitchen has started preparing your order #${order.order_number}`,
      data: { order_id: order.id }
    });



  } else if (status === 'ready') {
    await supabaseAdmin.from('notifications').insert({
      user_id: order.user_id,
      type: 'order_update',
      title: 'Order Ready! 🍽️',
      message: `Your order #${order.order_number} is ready for pickup/delivery`,
      data: { order_id: order.id }
    });
  } else if (status === 'rejected') {
    // 🚀 TRIGGER SHADOWFAX CANCELLATION
    // Use Client Order ID (order_number) as 'order_id' for cancellation
    try {
      const { cancelShadowfaxOrder } = await import('../utils/shadowfax.js');
      // send order_number e.g. "GZ2026..." which was sent as 'order_id' during creation
      const cancelResp = await cancelShadowfaxOrder(order.order_number, "Rejected by Vendor");
      if (cancelResp.success) {
        console.log("✅ Shadowfax Order Cancelled due to Vendor Rejection");
        // Update local delivery status to cancelled so UI updates
        await supabaseAdmin
          .from('deliveries')
          .update({ status: 'cancelled' })
          .eq('order_id', orderId);
        // ALSO update the orders table to keep data in sync
        await supabaseAdmin
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
      }
    } catch (err) {
      console.error("❌ Failed to cancel Shadowfax order:", err);
    }

    // 💰 REFUND LOGIC (Placeholder)
    // Currently, refunds are handled MANUALLY via the Paytm Dashboard.
    // Future: specific logic to auto-call Paytm Refund API can be added here.
    if (order.payment_status === 'paid') {
      console.log(`ℹ️ Order ${order.order_number} Rejected. Please refund manually on Paytm Dashboard.`);
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: order.user_id,
      type: 'refund_initiated',
      title: 'Order Rejected & Refund Initiated',
      message: `We're sorry, but vendor rejected your order #${order.order_number}. A refund has been initiated to your source payment method.`,
      data: { order_id: order.id }
    });
  }

  successResponse(res, { order });
}));


export default router;
