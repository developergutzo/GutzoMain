import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Storage
const orders = new Map();

// Helper: Generate Mock Shadowfax ID
const generateShadowfaxId = () => `SFX_MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper: Get current timestamp
const timestamp = () => new Date().toISOString();

// ============================================
// MOCK SHADOWFAX API ENDPOINTS
// ============================================

/**
 * POST /order/create/
 * Mimics Shadowfax order creation
 */
app.post('/order/create/', (req, res) => {
    try {
        const payload = req.body;
        const orderId = payload.order_details?.order_id;
        
        if (!orderId) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'order_id is required'
            });
        }

        const shadowfaxId = generateShadowfaxId();
        
        // Store order in memory
        const order = {
            shadowfax_id: shadowfaxId,
            client_order_id: orderId,
            status: 'CREATED',
            awb_number: shadowfaxId,
            created_at: timestamp(),
            updated_at: timestamp(),
            pickup_details: payload.pickup_details,
            drop_details: payload.drop_details,
            order_details: payload.order_details,
            validations: payload.validations,
            rider_details: null,
            history: [{
                status: 'CREATED',
                timestamp: timestamp(),
                note: 'Order created via Mock API'
            }]
        };

        orders.set(shadowfaxId, order);

        console.log(`✅ [Mock Shadowfax] Order Created: ${shadowfaxId} (Client: ${orderId})`);

        res.json({
            is_order_created: true,
            message: 'Order created successfully',
            flash_order_id: shadowfaxId,
            pickup_otp: payload.validations?.pickup?.otp || '1234',
            drop_otp: payload.validations?.drop?.otp || '5678',
            total_amount: 50,
            rain_rider_incentive: 0,
            high_demand_surge: 0
        });

    } catch (error) {
        console.error('❌ [Mock Shadowfax] Create Error:', error);
        res.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
});

/**
 * GET /order/track/:orderId/
 * Mimics Shadowfax order tracking
 */
app.get('/order/track/:orderId/', (req, res) => {
    try {
        const { orderId } = req.params;
        const order = orders.get(orderId);

        if (!order) {
            return res.status(404).json({
                status: 'FAILED',
                message: 'Order not found'
            });
        }

        console.log(`📍 [Mock Shadowfax] Tracking: ${orderId} - Status: ${order.status}`);

        res.json({
            status: order.status,
            awb_number: order.awb_number,
            rider_name: order.rider_details?.name || null,
            rider_contact_number: order.rider_details?.contact_number || null,
            rider_latitude: order.rider_details?.latitude || null,
            rider_longitude: order.rider_details?.longitude || null,
            tracking_url: `http://localhost:${PORT}/?order=${orderId}`
        });

    } catch (error) {
        console.error('❌ [Mock Shadowfax] Track Error:', error);
        res.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
});

/**
 * POST /order/serviceability/
 * Check rider availability and delivery charges
 */
app.post('/order/serviceability/', (req, res) => {
    try {
        const { pickup_details, drop_details } = req.body;
        
        if (!pickup_details?.address || !drop_details?.address) {
            return res.status(400).json({
                message: 'pickup_details.address and drop_details.address are required',
                is_serviceable: false
            });
        }

        // Mock: Always serviceable with random delivery charge
        const baseCharge = 30 + Math.floor(Math.random() * 20);
        const rainIncentive = 0;
        const surge = 0;

        console.log(`📍 [Mock Shadowfax] Serviceability Check: ${pickup_details.address} → ${drop_details.address}`);

        res.json({
            is_serviceable: true,
            total_amount: baseCharge + rainIncentive + surge,
            rain_rider_incentive: rainIncentive,
            high_demand_surge: surge,
            total_distance: 2.5,
            message: 'We are serviceable',
            pickup_eta: '10 Mins'
        });

    } catch (error) {
        console.error('❌ [Mock Shadowfax] Serviceability Error:', error);
        res.status(500).json({
            is_serviceable: false,
            message: error.message
        });
    }
});

/**
 * POST /order/cancel/
 * Mimics Shadowfax order cancellation
 */
app.post('/order/cancel/', (req, res) => {
    try {
        const { order_id, cancellation_reason } = req.body;
        const order = orders.get(order_id);

        if (!order) {
            return res.status(404).json({
                is_cancelled: false,
                message: 'Order not found'
            });
        }

        if (order.status === 'DELIVERED') {
            return res.status(400).json({
                is_cancelled: false,
                message: 'Cannot cancel delivered order'
            });
        }

        order.status = 'CANCELLED';
        order.updated_at = timestamp();
        order.history.push({
            status: 'CANCELLED',
            timestamp: timestamp(),
            note: cancellation_reason || 'Order cancelled'
        });

        console.log(`🚫 [Mock Shadowfax] Order Cancelled: ${order_id}`);

        res.json({
            is_cancelled: true,
            order_id: order_id,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        console.error('❌ [Mock Shadowfax] Cancel Error:', error);
        res.status(500).json({
            is_cancelled: false,
            message: error.message
        });
    }
});

// ============================================
// UI DASHBOARD API ENDPOINTS
// ============================================

/**
 * GET /api/orders
 * Get all orders for UI dashboard
 */
app.get('/api/orders', (req, res) => {
    const orderList = Array.from(orders.values()).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );
    res.json({ orders: orderList });
});

/**
 * POST /api/orders/:orderId/update-status
 * Update order status from UI
 */
app.post('/api/orders/:orderId/update-status', (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, rider_details } = req.body;
        
        const order = orders.get(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update status
        order.status = status;
        order.updated_at = timestamp();
        
        // Update rider details if provided
        if (rider_details) {
            order.rider_details = {
                ...order.rider_details,
                ...rider_details
            };
        }

        // Add to history
        order.history.push({
            status: status,
            timestamp: timestamp(),
            note: `Status updated via UI to ${status}`
        });

        console.log(`🔄 [Mock Shadowfax] Status Updated: ${orderId} → ${status}`);

        res.json({ 
            success: true, 
            order: order 
        });

    } catch (error) {
        console.error('❌ [Mock Shadowfax] Update Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/orders/:orderId/assign-rider
 * Assign rider to order (ALLOTTED status)
 */
app.post('/api/orders/:orderId/assign-rider', (req, res) => {
    try {
        const { orderId } = req.params;
        const order = orders.get(orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Generate mock rider details
        const riderNames = ['Rajesh Kumar', 'Amit Singh', 'Priya Sharma', 'Vikram Patel'];
        const randomName = riderNames[Math.floor(Math.random() * riderNames.length)];
        
        order.status = 'ALLOTTED';
        order.updated_at = timestamp();
        order.rider_details = {
            name: randomName,
            contact_number: `+91${Math.floor(7000000000 + Math.random() * 3000000000)}`,
            latitude: order.pickup_details?.latitude || 12.9716,
            longitude: order.pickup_details?.longitude || 77.5946
        };

        order.history.push({
            status: 'ALLOTTED',
            timestamp: timestamp(),
            note: `Rider ${randomName} assigned`
        });

        console.log(`👤 [Mock Shadowfax] Rider Assigned: ${orderId} → ${randomName}`);

        res.json({ 
            success: true, 
            order: order 
        });

    } catch (error) {
        console.error('❌ [Mock Shadowfax] Assign Rider Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   🚚  MOCK SHADOWFAX API & DASHBOARD  🚚      ║
╠═══════════════════════════════════════════════╣
║  Port:        ${PORT}                              ║
║  Dashboard:   http://localhost:${PORT}/           ║
║  API:         http://localhost:${PORT}/order/...  ║
╚═══════════════════════════════════════════════╝
    `);
});

export default app;
