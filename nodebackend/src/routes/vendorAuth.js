import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler.js';

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
    .select('id')
    .eq('phone', phone)
    .single();

  if (lead) {
    return successResponse(res, { status: 'lead' });
  }

  // 3. New user
  return successResponse(res, { status: 'new' });
}));

// ============================================
// VENDOR LOGIN
// POST /api/vendor-auth/login
// ============================================
router.post('/login', asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new ApiError(400, 'Phone and password are required');
  }

  // Check if vendor exists with this phone number
  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('phone', phone)
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
  router.post('/:id/products', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image, category, is_veg, is_available } = req.body;
  
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        vendor_id: id,
        name,
        description,
        price,
        image,
        category,
        is_veg: is_veg ?? true,
        is_available: is_available ?? true,
        rating: 0,
        sort_order: 999 
      })
      .select()
      .single();
  
    if (error) throw new ApiError(500, 'Failed to create product');
  
    successResponse(res, { product }, 'Product added successfully');
  }));
  
  // ============================================
  // UPDATE PRODUCT
  // PUT /api/vendor-auth/:id/products/:productId
  // ============================================
  router.put('/:id/products/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(req.body)
      .eq('id', productId)
      .select()
      .single();
  
    if (error) throw new ApiError(500, 'Failed to update product');
  
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

export default router;
