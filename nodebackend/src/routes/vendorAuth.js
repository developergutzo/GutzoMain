import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, successResponse, ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

// ============================================
// VENDOR LOGIN
// POST /api/vendor-auth/login
// ============================================
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  // MVP: Check username and password directly (Plain text for MVP only)
  // TODO: Use bcrypt for production
  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !vendor) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Simple password check
  if (vendor.password !== password) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!vendor.is_active) {
    throw new ApiError(403, 'Account is inactive. Contact Admin.');
  }

  // Return success with vendor info (avoid sending password back)
  delete vendor.password;
  
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
