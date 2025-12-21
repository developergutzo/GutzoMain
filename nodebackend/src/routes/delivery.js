import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Shadowfax API Config
const SHADOWFAX_API_URL = process.env.SHADOWFAX_API_URL || 'https://flash-api.shadowfax.in';
const SHADOWFAX_API_TOKEN = process.env.SHADOWFAX_API_TOKEN;

router.post('/serviceability', async (req, res) => {
  try {
    const { pickup_details, drop_details } = req.body;

    if (!pickup_details || !drop_details) {
      return res.status(400).json({ success: false, message: 'Pickup and Drop details are required' });
    }

    if (!SHADOWFAX_API_TOKEN) {
      console.warn('SHADOWFAX_API_TOKEN is not set');
      // Return a mock response or error in dev if token missing
      // For now, fail gracefully
      return res.status(503).json({ success: false, message: 'Delivery service configuration missing' });
    }

    const formattedPayload = {
      pickup_details: {
        building_name: pickup_details.building_name || "Vendor Outlet",
        latitude: parseFloat(pickup_details.latitude) || 0,
        longitude: parseFloat(pickup_details.longitude) || 0,
        address: pickup_details.address
      },
      drop_details: {
        building_name: drop_details.building_name || "Customer Location",
        latitude: parseFloat(drop_details.latitude) || 0,
        longitude: parseFloat(drop_details.longitude) || 0,
        address: drop_details.address
      }
    };

    console.log('Sending Serviceability Request:', JSON.stringify(formattedPayload, null, 2));

    const response = await fetch(`${SHADOWFAX_API_URL}/order/serviceability/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SHADOWFAX_API_TOKEN
      },
      body: JSON.stringify(formattedPayload)
    });

    const data = await response.json();

    if (response.ok) {
        // Shadowfax success response
        // data structure: { value: { is_serviceable: true, pickup_eta: "10 Mins", ... } } 
        // Note: The docs say structure varies by example, but standard success is usually inside 'value' or direct keys 
        // depending on if it's Swagger example or real response.
        // Real response usually flat properties or inside a wrapper.
        // Let's pass the whole data back for frontend to parse, or parse here.
        // Docs example: "value": { "is_serviceable": true, "pickup_eta": "10 Mins", ... }
        // Wait, the docs showed "examples" key. The actual response likely just has the fields directly or data wrapper.
        // Let's assume standard response matches the schema: ServiceabilityRequest -> ServiceabilityResponse (implied).
        // I will return the full data.
        res.json({ success: true, data: data });
    } else {
        console.error('Shadowfax Error:', data);
        res.status(response.status).json({ success: false, message: data.message || 'Shadowfax Provider Error', details: data });
    }

  } catch (error) {
    console.error('Delivery Serviceability Route Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
