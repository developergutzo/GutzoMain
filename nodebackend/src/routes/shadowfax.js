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
                    "otp": "1234"
                },
                "drop": {
                    "is_otp_required": true,
                    "otp": "1234"
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
             // 4. Update Supabase with Shadowfax Order ID
             await supabaseAdmin
                .from('orders')
                .update({ 
                    shadowfax_order_id: sfData.order_id,
                    delivery_status: 'SEARCHING_RIDER' 
                })
                .eq('id', orderId);

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

        // Note: Actual webhook payload structure depends on Shadowfax. 
        // Adapting common patterns: look for client_order_id or shadowfax_order_id
        
        const sfOrderId = data.order_id;
        const status = data.status; // e.g., ALLOTTED, PICKED_UP, DELIVERED
        
        if (!sfOrderId) return res.status(200).send('OK (No ID)');

        const updatePayload = {
            delivery_status: status
            // updated_at: new Date() // Triggered automatically usually
        };

        // Map Rider Details
        if (data.rider_details || data.rider_name) {
            updatePayload.rider_name = data.rider_name || data.rider_details?.name;
            updatePayload.rider_phone = data.rider_contact_number || data.rider_details?.contact;
        }

        // Map Coordinates (Rider Location updates)
        if (data.rider_latitude && data.rider_longitude) {
            updatePayload.rider_coordinates = {
                latitude: data.rider_latitude,
                longitude: data.rider_longitude
            };
        }

        // Map OTPs
        if (data.pickup_otp) updatePayload.pickup_otp = data.pickup_otp;
        if (data.delivery_otp) updatePayload.delivery_otp = data.delivery_otp;

        // Map Specific Statuses to Supabase Order Status
        // If picked_up -> update main status to 'picked_up' (if we have that enum) or keep 'preparing' + delivery_status?
        // Let's assume we map strict milestones.
        if (status === 'PICKED_UP') {
             // updatePayload.status = 'picked_up'; // Only if Schema allows 'picked_up'
             // For now, let's allow custom status 'picked_up' in vendorAuth validation
        } else if (status === 'DELIVERED') {
             updatePayload.status = 'completed'; // or 'delivered'
        }

        // Execute Update
        await supabaseAdmin
            .from('orders')
            .update(updatePayload)
            .eq('shadowfax_order_id', sfOrderId);

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).send('Webhook Error');
    }
});

export default router;
