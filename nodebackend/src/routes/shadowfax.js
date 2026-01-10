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
const SHADOWFAX_BASE_URL = process.env.SHADOWFAX_URL;
const SHADOWFAX_TOKEN = process.env.SHADOWFAX_API_TOKEN;

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
        // Supports both 'order_id' (Shadowfax ID) and 'coid' (Client Order ID)
        // User Docs show: { coid, status, rider_name, ... }
        
        const sfOrderId = data.order_id || data.sfx_order_id;
        const clientOrderId = data.coid; // Client Order ID (e.g. GZ...)
        const status = data.status; 
        
        if (!sfOrderId && !clientOrderId) return res.status(200).send('OK (No ID detected)');

        const updatePayload = {
            delivery_status: status
        };

        // Map Rider Details (Doc shows top-level snake_case)
        if (data.rider_name || data.rider_details) {
            updatePayload.rider_name = data.rider_name || data.rider_details?.name;
            updatePayload.rider_phone = data.rider_contact_number || data.rider_details?.contact || data.rider_details?.contact_number;
        }

        // Map Coordinates
        if (data.rider_latitude && data.rider_longitude) {
            updatePayload.rider_coordinates = {
                latitude: data.rider_latitude,
                longitude: data.rider_longitude
            };
        } else if (data.rider_details?.current_location) {
             updatePayload.rider_coordinates = data.rider_details.current_location;
        }

        // Map OTPs (if present)
        // Note: OTPs usually belong in 'deliveries' table, not 'orders' table
        // We will separate the payloads to avoid "Column not found" errors

        // Map OTPs (if present)
        // Note: OTPs usually belong in 'deliveries' table, not 'orders' table
        // We will separate the payloads to avoid "Column not found" errors

        // Base payload for ORDERS table 
        // INFO: 'orders' table does NOT have delivery_status, rider_name, rider_phone.
        // It likely only has 'status'.
        const orderPayload = {};

        // Only update Main Order Status if it's a major milestone
        if (status === 'DELIVERED') {
             orderPayload.status = 'completed'; 
        } else if (status === 'PICKED_UP') {
             // orderPayload.status = 'on_way'; // Uncomment if schema supports 'on_way'
        }

        // Full payload for DELIVERIES table (Schema v2)
        const deliveryPayload = {
            status: status.toLowerCase(),
            rider_name: data.rider_name || data.rider_details?.name,
            rider_phone: data.rider_contact_number || data.rider_details?.contact || data.rider_details?.contact_number,
            
            // New Schema v2 Fields
            rider_id: data.rider_id ? String(data.rider_id) : null,
            cancellation_reason: data.cancel_reason,
            cancelled_by: data.cancelled_by,
            courier_response_payload: data, // Store RAW payload
            
            updated_at: new Date().toISOString()
        };

        if (data.rider_latitude && data.rider_longitude) {
            deliveryPayload.rider_coordinates = {
                latitude: data.rider_latitude,
                longitude: data.rider_longitude
            };
        } else if (data.rider_details?.current_location) {
             deliveryPayload.rider_coordinates = data.rider_details.current_location;
        }

        if (data.pickup_otp) deliveryPayload.pickup_otp = data.pickup_otp;
        if (data.delivery_otp) deliveryPayload.delivery_otp = data.delivery_otp;


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
                status: status,
                timestamp: new Date().toISOString(),
                note: `Webhook Update: ${status}`
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

export default router;
