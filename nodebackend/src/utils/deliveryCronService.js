import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { trackShadowfaxOrder } from './shadowfax.js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Configuration
const CRON_INTERVAL = process.env.DELIVERY_CRON_INTERVAL || 30; // seconds
const ENABLE_CRON = process.env.ENABLE_DELIVERY_CRON !== 'false'; // default enabled
const MAX_ORDERS_PER_RUN = 50;
const API_CALL_DELAY = 100; // ms between API calls

// Helper: Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Map Shadowfax status to internal status
const mapShadowfaxStatus = (apiStatus) => {
    const status = apiStatus.toUpperCase();
    if (status === 'ARRIVED') return 'reached_location';
    if (status === 'COLLECTED') return 'picked_up';
    if (status === 'CUSTOMER_DOOR_STEP') return 'arrived_at_drop';
    if (status === 'ALLOTTED') return 'allotted';
    if (status === 'DELIVERED') return 'delivered';
    return apiStatus.toLowerCase();
};

// Main sync function
async function syncActiveOrders() {
    try {
        console.log('[Delivery Cron] 🔄 Starting sync cycle...');

        // 1. Query active orders
        const { data: activeOrders, error: queryError } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                status,
                vendor_id,
                user_id,
                delivery:deliveries(
                    id,
                    external_order_id,
                    status,
                    history,
                    rider_name,
                    rider_phone,
                    rider_coordinates
                ),
                vendor:vendors(
                    id,
                    name,
                    email
                )
            `)
            .not('status', 'in', '("delivered","completed","cancelled","rejected")')
            .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(MAX_ORDERS_PER_RUN);

        if (queryError) {
            console.error('[Delivery Cron] ❌ Query error:', queryError);
            return;
        }

        if (!activeOrders || activeOrders.length === 0) {
            console.log('[Delivery Cron] ℹ️ No active orders to sync');
            return;
        }

        console.log(`[Delivery Cron] 📦 Found ${activeOrders.length} active orders`);

        // 2. Process each order
        let syncedCount = 0;
        let errorCount = 0;

        for (const order of activeOrders) {
            try {
                // Get delivery record
                const delivery = Array.isArray(order.delivery) && order.delivery.length > 0 
                    ? order.delivery[0] 
                    : null;

                if (!delivery || !delivery.external_order_id) {
                    // No Shadowfax order created yet
                    continue;
                }

                // Skip if already in terminal state
                if (['delivered', 'cancelled'].includes(delivery.status)) {
                    continue;
                }

                // 3. Call Shadowfax tracking API
                const trackingInfo = await trackShadowfaxOrder(delivery.external_order_id);

                if (!trackingInfo || !trackingInfo.status) {
                    console.warn(`[Delivery Cron] ⚠️ No tracking info for ${order.order_number}`);
                    continue;
                }

                const apiStatus = trackingInfo.status.toUpperCase();
                const internalStatus = mapShadowfaxStatus(apiStatus);
                const dbStatus = delivery.status;

                // 4. Check for drift
                if (internalStatus === dbStatus || internalStatus === 'unknown') {
                    // No change
                    continue;
                }

                console.log(`[Delivery Cron] 🔄 Status drift detected for ${order.order_number}: ${dbStatus} → ${internalStatus}`);

                // 5. Update deliveries table
                const newHistoryItem = {
                    status: internalStatus,
                    timestamp: new Date().toISOString(),
                    note: `Cron Sync: ${apiStatus}`
                };

                const updatedHistory = delivery.history 
                    ? [...delivery.history, newHistoryItem] 
                    : [newHistoryItem];

                const deliveryUpdatePayload = {
                    status: internalStatus,
                    rider_name: trackingInfo.rider_details?.name || delivery.rider_name,
                    rider_phone: trackingInfo.rider_details?.contact_number || delivery.rider_phone,
                    rider_coordinates: trackingInfo.rider_details?.current_location || delivery.rider_coordinates,
                    history: updatedHistory,
                    updated_at: new Date().toISOString()
                };

                await supabase
                    .from('deliveries')
                    .update(deliveryUpdatePayload)
                    .eq('id', delivery.id);

                // 6. Update orders table for critical milestones
                const orderUpdatePayload = {};

                if (apiStatus === 'DELIVERED') {
                    orderUpdatePayload.status = 'completed';
                } else if (apiStatus === 'COLLECTED') {
                    orderUpdatePayload.status = 'on_way';
                } else if (apiStatus === 'ALLOTTED' && (dbStatus === 'searching_rider' || dbStatus === 'created')) {
                    orderUpdatePayload.status = 'placed';
                }

                if (Object.keys(orderUpdatePayload).length > 0) {
                    await supabase
                        .from('orders')
                        .update({
                            ...orderUpdatePayload,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', order.id);
                }

                // 7. Trigger notifications
                if (apiStatus === 'ALLOTTED' && (dbStatus === 'searching_rider' || dbStatus === 'created')) {
                    // Rider allocated - notify vendor
                    if (order.vendor) {
                        console.log(`[Delivery Cron] 📧 Notifying vendor for ${order.order_number}`);
                        
                        // Send email
                        import('./emailService.js').then(({ sendVendorOrderNotification }) => {
                            // Fetch full order with items
                            supabase.from('orders')
                                .select('*, items:order_items(*), vendor:vendors(*)')
                                .eq('id', order.id)
                                .single()
                                .then(({ data: fullOrder }) => {
                                    if (fullOrder) {
                                        sendVendorOrderNotification(fullOrder.vendor.email, fullOrder);
                                    }
                                });
                        });

                        // Send push
                        import('./pushService.js').then(({ sendVendorPush }) => {
                            const msg = `Rider Assigned! ${trackingInfo.rider_details?.name || 'Partner'} is on the way.`;
                            sendVendorPush(order.vendor.id, 'Order Update 🔔', msg);
                        });
                    }
                }

                syncedCount++;

                // Rate limiting - delay between API calls
                await sleep(API_CALL_DELAY);

            } catch (orderError) {
                console.error(`[Delivery Cron] ❌ Error syncing order ${order.order_number}:`, orderError.message);
                errorCount++;
                // Continue to next order
            }
        }

        console.log(`[Delivery Cron] ✅ Sync complete: ${syncedCount} updated, ${errorCount} errors`);

    } catch (error) {
        console.error('[Delivery Cron] ❌ Fatal error:', error);
    }
}

// Start cron job
export function startDeliveryCron() {
    if (!ENABLE_CRON) {
        console.log('[Delivery Cron] ⏸️ Cron disabled via ENABLE_DELIVERY_CRON=false');
        return;
    }

    // Cron expression: every N seconds
    const cronExpression = `*/${CRON_INTERVAL} * * * * *`;
    
    console.log(`[Delivery Cron] 🚀 Starting delivery sync cron (every ${CRON_INTERVAL}s)`);
    
    cron.schedule(cronExpression, syncActiveOrders);
    
    // Run once immediately on startup
    syncActiveOrders();
}

// Auto-start if imported
if (ENABLE_CRON) {
    startDeliveryCron();
}
