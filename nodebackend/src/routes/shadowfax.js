import express from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Shadowfax Config
const USE_MOCK = process.env.USE_MOCK_SHADOWFAX === 'true';
const MOCK_URL = process.env.MOCK_SHADOWFAX_URL || 'http://localhost:3002';
const SHADOWFAX_BASE_URL = USE_MOCK ? MOCK_URL : process.env.SHADOWFAX_API_URL;
const SHADOWFAX_TOKEN = process.env.SHADOWFAX_API_TOKEN;

if (USE_MOCK) {
    console.log('🧪 [Shadowfax Route] MOCK MODE ENABLED - Routing to:', SHADOWFAX_BASE_URL);
}

/**
 * POST /api/shadowfax/create-order
 * Triggered by Vendor when they accept/start preparing an order.
 * Body: { orderId: string }
 */
router.post('/create-order', async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

        // 1. Fetch Order Details from Supabase
        // 1. Fetch Order Details from Supabase
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*, vendor:vendors(*)')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // 1.5 Fetch Delivery Details for OTPs
        const { data: delivery, error: deliveryError } = await supabaseAdmin
            .from('deliveries')
            .select('*')
            .eq('order_id', orderId)
            .single();

        // Check if Shadowfax order already exists
        if (delivery?.external_order_id) {
            console.log(`✅ Shadowfax order already exists for ${orderId}: ${delivery.external_order_id}`);
            return res.json({
                success: true,
                shadowfax_order_id: delivery.external_order_id,
                message: 'Delivery partner already assigned'
            });
        }

        let deliveryOtp = delivery?.delivery_otp;
        let pickupOtp = delivery?.pickup_otp;

        // Generate if missing
        if (!deliveryOtp) deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        if (!pickupOtp) pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // Update DB if we generated new ones
        if (delivery && (!delivery.delivery_otp || !delivery.pickup_otp)) {
            await supabaseAdmin
                .from('deliveries')
                .update({
                    delivery_otp: deliveryOtp,
                    pickup_otp: pickupOtp,
                    updated_at: new Date().toISOString()
                })
                .eq('id', delivery.id);
        }

        // 2. Construct Shadowfax Payload
        // Note: Ensure your environment logic handles parsing coordinates correctly if stored as text or json
        // For now, assuming delivery_address contains valid fields.

        // Mock/Default lat/lng if missing (Safe fallback for dev)
        const pickupLat = Number(order.vendor?.latitude);
        const pickupLng = Number(order.vendor?.longitude);
        const dropLat = order.delivery_address?.latitude;
        const dropLng = order.delivery_address?.longitude;

        const payload = {
            "pickup_details": {
                "name": order.vendor?.name,
                "contact_number": order.vendor?.phone,
                "address": order.vendor?.address ? `${order.vendor.address}${order.vendor.city ? ', ' + order.vendor.city : ''}` : order.vendor?.location,
                "landmark": "",
                "latitude": pickupLat,
                "longitude": pickupLng
            },
            "drop_details": {
                "name": order.delivery_address?.name,
                "contact_number": order.delivery_phone,
                "is_contact_number_masked": false,
                "address": order.delivery_address?.address,
                "landmark": order.delivery_address?.landmark || "",
                "latitude": dropLat,
                "longitude": dropLng
            },
            "order_details": {
                "order_id": order.order_number, // User example uses 'order_id' here
                "is_prepaid": true,
                "cash_to_be_collected": 0,
                "delivery_charge_to_be_collected_from_customer": false,
                "rts_required": true
            },
            "user_details": {
                "contact_number": process.env.SHADOWFAX_CONTACT_NUMBER,
                "credits_key": process.env.SHADOWFAX_CREDITS_KEY // Optional if needed
            },
            "validations": {
                "pickup": {
                    "is_otp_required": true,
                    "otp": pickupOtp
                },
                "drop": {
                    "is_otp_required": true,
                    "otp": deliveryOtp
                },
                "rts": {
                    "is_otp_required": true,
                    "otp": "5678"
                }
            },
            "communications": {
                "send_sms_to_pickup_person": true,
                "send_sms_to_drop_person": true,
                "send_rts_sms_to_pickup_person": true
            }
        };

        console.log('🚀 Creating Shadowfax Order:', JSON.stringify(payload, null, 2));

        // 3. Call Shadowfax API
        const sfResponse = await axios.post(`${SHADOWFAX_BASE_URL}/order/create/`, payload, {
            headers: {
                'Authorization': SHADOWFAX_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        const sfData = sfResponse.data;

        if (sfData.status === 'CREATED' || sfData.order_id) {
            // 4. Update 'deliveries' table (Schema v2)
            // We no longer update 'orders' table for delivery status.

            const initialHistory = [{
                status: 'searching_rider',
                timestamp: new Date().toISOString(),
                note: 'Order Created via API'
            }];

            // Check if delivery record exists (it should, created on order placement)
            // or upsert it.
            const { error: deliveryUpdateError } = await supabaseAdmin
                .from('deliveries')
                .update({
                    external_order_id: sfData.order_id, // Moved from orders.shadowfax_order_id
                    status: 'searching_rider',
                    courier_request_payload: payload, // Store RAW Request (Audit)
                    history: initialHistory,
                    updated_at: new Date().toISOString()
                })
                .eq('order_id', orderId);

            if (deliveryUpdateError) {
                console.error('❌ Failed to update deliveries table:', deliveryUpdateError);
                // Fallback: Try insert if not exists (unlikely given order flow)
            }

            console.log(`✅ Order Created! Shadowfax ID: ${sfData.order_id}`);

            return res.json({ success: true, shadowfax_order_id: sfData.order_id });
        } else {
            console.error('Shadowfax Error:', sfData);
            return res.status(400).json({ error: 'Failed to create Shadowfax order', details: sfData });
        }

    } catch (err) {
        console.error('Shadowfax API Exception:', err.response?.data || err.message);
        res.status(500).json({ error: err.message, details: err.response?.data });
    }
});

/**
 * POST /api/shadowfax/webhook
 * Callback URL configured in Shadowfax Dashboard
 */
router.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        console.log('📥 Shadowfax Webhook:', JSON.stringify(data, null, 2));

        // ADAPTIVE PAYLOAD PARSING
        // OFFICIAL PAYLOAD PARSING (OrderCallbackRequest)
        // Spec: coid, status, action_time, rider_id, rider_contact_number, rider_latitude, rider_longitude, rider_name

        const clientOrderId = data.coid;
        const sfOrderId = data.sfx_order_id; // Keeping just in case, but relying on coid
        const status = data.status;

        if (!clientOrderId && !sfOrderId) return res.status(200).send('OK (No ID detected)');

        console.log(`📥 Webhook: ${status} for ${clientOrderId || 'Unknown'}`);

        // ADAPTIVE STATUS MAPPING (API Spec -> Internal)
        // API: ALLOTTED, ACCEPTED, ARRIVED, COLLECTED, CUSTOMER_DOOR_STEP, DELIVERED
        let internalStatus = status.toLowerCase(); // Default

        if (status === 'ARRIVED') internalStatus = 'reached_location';
        else if (status === 'COLLECTED') internalStatus = 'picked_up';
        else if (status === 'CUSTOMER_DOOR_STEP') internalStatus = 'arrived_at_drop';
        else if (status === 'ALLOTTED') internalStatus = 'allotted';
        else if (status === 'DELIVERED') internalStatus = 'delivered'; // Explicit map

        // Base payload for ORDERS table 
        const orderPayload = {};

        // Sync Major Milestones to ORDERS status
        if (status === 'DELIVERED') {
            orderPayload.status = 'completed';
        } else if (status === 'COLLECTED') {
            // Order is now officially ON THE WAY
            orderPayload.status = 'on_way';
        }

        // Full payload for DELIVERIES table
        const deliveryPayload = {
            status: internalStatus,
            rider_name: data.rider_name,
            rider_phone: data.rider_contact_number,
            rider_id: data.rider_id ? String(data.rider_id) : null,
            rider_coordinates: (data.rider_latitude && data.rider_longitude) ? {
                latitude: data.rider_latitude,
                longitude: data.rider_longitude
            } : null,

            cancellation_reason: data.cancel_reason || data.rts_reason,
            cancelled_by: data.cancelled_by,
            courier_response_payload: data, // Store RAW payload

            updated_at: data.action_time || new Date().toISOString()
        };

        // PREVENT OVERWRITE: Internal OTP generation source of truth
        // if (data.pickup_otp) deliveryPayload.pickup_otp = data.pickup_otp;
        // if (data.delivery_otp) deliveryPayload.delivery_otp = data.delivery_otp;


        // Execute Update on ORDERS table
        // We need to build the query dynamically based on which ID we found
        // ONLY Execute if orderPayload has keys
        let query = supabaseAdmin.from('orders');
        if (Object.keys(orderPayload).length > 0) {
            query = query.update(orderPayload);
        } else {
            // If nothing to update on orders, just select to find the ID
            query = query.select('*, vendor:vendors(*)');
        }

        console.log(`🔍 Webhook Looking up Order via: ${clientOrderId ? 'Client ID: ' + clientOrderId : 'SF ID: ' + sfOrderId}`);

        if (clientOrderId) {
            query = query.eq('order_number', clientOrderId);
        } else if (sfOrderId) {
            query = query.eq('shadowfax_order_id', sfOrderId);
        }

        const { data: updatedOrder, error: updateError } = await query.select('*, vendor:vendors(*)')
            .single();

        if (updateError || !updatedOrder) {
            console.error("❌ Webhook Order Update Failed/Not Found:", updateError?.message || "No order matched ID");
        } else {
            console.log(`✅ FOUND Order ID: ${updatedOrder.id} (Ref: ${updatedOrder.order_number})`);
        }

        // Also Update DELIVERIES table
        if (updatedOrder) {
            console.log(`🔄 Updating DELIVERY table for OrderUUID: ${updatedOrder.id}...`);

            // Fetch current history first to append
            const { data: currentDelivery } = await supabaseAdmin
                .from('deliveries')
                .select('history')
                .eq('order_id', updatedOrder.id)
                .single();

            const newHistoryItem = {
                status: internalStatus,
                timestamp: new Date().toISOString(),
                note: `Webhook Update: ${status} -> ${internalStatus}`
            };

            const updatedHistory = currentDelivery?.history
                ? [...currentDelivery.history, newHistoryItem]
                : [newHistoryItem];

            deliveryPayload.history = updatedHistory;

            const { error: delError } = await supabaseAdmin.from('deliveries')
                .update(deliveryPayload)
                .eq('order_id', updatedOrder.id);

            if (delError) console.error("❌ Delivery Table Update Failed:", delError.message);
            else console.log("✅ Delivery Table Updated Successfully via Schema v2.");
        }

        // NOTIFY VENDOR ON RIDER ALLOCATION
        if (status === 'ALLOTTED' && updatedOrder) {
            console.log(`[Shadowfax Webhook] Rider Allocated for ${updatedOrder.order_number}. Releasing to Vendor...`);

            // 1. UPDATE ORDER STATUS TO 'PLACED' (Visible to Vendor)
            const { error: releaseError } = await supabaseAdmin
                .from('orders')
                .update({
                    status: 'placed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', updatedOrder.id);

            if (releaseError) {
                console.error("❌ Failed to set order status to PLACED:", releaseError);
            } else {
                console.log("✅ Order released to Vendor (Status: PLACED)");
            }

            // 2. Notify Vendor (Push & Email)
            if (updatedOrder.vendor) {
                // Send Email
                import('../utils/emailService.js').then(({ sendVendorOrderNotification }) => {
                    // We fetch the latest order state to ensure consistency if needed, but updatedOrder has vendor info
                    // The vendor notification function usually expects the full order object with items.
                    // Let's refetch deeply to be safe or assuming updatedOrder has what we need if we fetched it above.
                    // The query above was: .select('*, vendor:vendors(*)') which lacks items.
                    // Let's rely on sendVendorOrderNotification handling fetching if it needs items, or safe inspect.

                    // Re-fetch full order with items for the email
                    supabaseAdmin.from('orders').select('*, items:order_items(*), vendor:vendors(*)').eq('id', updatedOrder.id).single()
                        .then(({ data: fullOrder }) => {
                            if (fullOrder) sendVendorOrderNotification(fullOrder.vendor.email, fullOrder);
                        });
                });

                // Send Push
                import('../utils/pushService.js').then(({ sendVendorPush }) => {
                    const msg = `New Order #${updatedOrder.order_number}! Delivery Partner Assigned.`;
                    sendVendorPush(updatedOrder.vendor.id, 'New Order Received 🔔', msg);
                });
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).send('Webhook Error');
    }
});



/**
 * POST /api/shadowfax/mock-create-order
 * DEV ONLY: Simulates Shadowfax order creation
 */
router.post('/mock-create-order', async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: 'Order ID is required' });

        console.log(`🛠️ [Mock Shadowfax] Creating mock order for ${orderId}`);

        // 1. Fetch Order
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*, vendor:vendors(*)')
            .eq('id', orderId)
            .single();

        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Generate Mock Data
        const mockSfId = `SFX_MOCK_${Date.now()}`;
        const pickupOtp = "1234";
        const deliveryOtp = "5678";

        // 2. Update Deliveries Table
        const initialHistory = [{
            status: 'searching_rider',
            timestamp: new Date().toISOString(),
            note: 'Mock Order Created'
        }];

        await supabaseAdmin
            .from('deliveries')
            .upsert({
                order_id: orderId,
                external_order_id: mockSfId,
                partner_id: 'shadowfax',
                status: 'searching_rider',
                pickup_otp: pickupOtp,
                delivery_otp: deliveryOtp,
                history: initialHistory,
                courier_request_payload: { mock: true, timestamp: Date.now() },
                updated_at: new Date().toISOString()
            }, { onConflict: 'order_id' });

        // 3. Update Orders Table
        await supabaseAdmin
            .from('orders')
            .update({
                shadowfax_order_id: mockSfId,
                status: 'searching_rider' // Set status visible to user
            })
            .eq('id', orderId);

        console.log(`✅ [Mock Shadowfax] Created ${mockSfId}`);

        return res.json({
            success: true,
            shadowfax_order_id: mockSfId,
            message: "Mock Shadowfax order created",
            otps: { pickup: pickupOtp, delivery: deliveryOtp }
        });

    } catch (err) {
        console.error('Mock Shadowfax Error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
