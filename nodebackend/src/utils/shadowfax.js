import fetch from 'node-fetch';

const SHADOWFAX_API_URL = process.env.SHADOWFAX_API_URL || 'https://flash-api.shadowfax.in';
const SHADOWFAX_API_TOKEN = process.env.SHADOWFAX_API_TOKEN;

export const createShadowfaxOrder = async (order, vendor) => {
    if (!SHADOWFAX_API_TOKEN) {
        console.warn("⚠️ SHADOWFAX_API_TOKEN missing. Skipping delivery creation.");
        return null;
    }

    // Map Order to Shadowfax Payload
    const isPrepaid = order.payment_status === 'paid' || order.payment_status === 'success';
    
    const payload = {
        order_details: {
            client_order_id: order.order_number,
            actual_order_value: Number(order.total_amount),
            paid: isPrepaid, // Legacy field, might be ignored
            is_prepaid: isPrepaid, // Official field
            cash_to_be_collected: isPrepaid ? 0 : Number(order.total_amount),
            payment_mode: isPrepaid ? 'prepaid' : 'cod',
            delivery_charge_to_be_collected_from_customer: 0 // We handle delivery fee internally
        },
        pickup_details: {
            name: vendor.name,
            contact_number: vendor.phone || "9999999999",
            address_line_1: vendor.address,
            city: "Coimbatore",
            state: "Tamil Nadu",
            latitude: Number(vendor.latitude) || 0,
            longitude: Number(vendor.longitude) || 0
        },
        drop_details: {
            name: order.delivery_address.name || "Customer",
            contact_number: order.delivery_phone || "9999999999",
            address_line_1: order.delivery_address.address,
            city: order.delivery_address.city || "Coimbatore",
            state: "Tamil Nadu",
            latitude: Number(order.delivery_address.latitude) || 0,
            longitude: Number(order.delivery_address.longitude) || 0
        },
        user_details: {
            name: order.delivery_address.name || "Customer",
            contact_number: order.delivery_phone || "9999999999"
        }
    };
    
    // console.log("📦 Shadowfax Payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${SHADOWFAX_API_URL}/orders`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${SHADOWFAX_API_TOKEN}`
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (!response.ok) {
            console.error("Shadowfax Order Failed:", data);
            throw new Error(data.message || "Failed to create delivery order");
        }
        
        return data; // Returns Shadowfax Order ID usually
    } catch (e) {
        console.error("Shadowfax Integration Error:", e);
        // Don't block the main flow? Or throw?
        // User probably wants to know if delivery failed.
        return null; 
    }
};

export const trackShadowfaxOrder = async (flashOrderId) => {
    if (!SHADOWFAX_API_TOKEN || !flashOrderId) return null;

    try {
        const response = await fetch(`${SHADOWFAX_API_URL}/orders/${flashOrderId}`, { 
            method: 'GET',
            headers: {
                'Authorization': `Token ${SHADOWFAX_API_TOKEN}`
            }
        });
        
        const data = await response.json();
        if (!response.ok) return null;
        
        // Return relevant tracking info
        // Response Structure based on Docs:
        // { 
        //   status: "ALLOTTED", 
        //   rider_name: "...", 
        //   rider_contact_number: "...",
        //   rider_latitude: 12.34, 
        //   rider_longitude: 77.89,
        //   tracking_url: "https://shadowfax.in/track/..."
        // }
        return {
            status: data.status,
            awb_number: data.awb_number || flashOrderId, // Fallback
            rider_details: {
                name: data.rider_name,
                contact_number: data.rider_contact_number,
                current_location: {
                    lat: data.rider_latitude,
                    lng: data.rider_longitude
                }
            },
            tracking_url: data.tracking_url
        };
    } catch (e) {
        console.error("Shadowfax Tracking Error:", e);
        return null;
    }
};
