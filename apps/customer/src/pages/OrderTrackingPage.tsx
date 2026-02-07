import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Minimize2, Share2, Phone, AlertCircle } from 'lucide-react';
import { OrderTrackingMap } from '../components/OrderTrackingMap';
import { OrderTrackingTimelineSheet } from '../components/OrderTrackingTimelineSheet';
import { useOrderTracking } from '../contexts/OrderTrackingContext';
import { useRouter } from '../components/Router';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { nodeApiService } from '../utils/nodeApi';

export function OrderTrackingPage() {
    const { currentRoute, navigate: routerNavigate } = useRouter();
    // Extract orderId from the URL path manually since we aren't using <Route> components
    const pathId = currentRoute.split('/tracking/')[1];

    const { activeOrder: contextOrder, startTracking, minimizeOrder } = useOrderTracking();
    const { user } = useAuth();
    const [isMinimizing, setIsMinimizing] = useState(false);

    // LOCAL STATE REWIRING
    const [localOrder, setLocalOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const orderId = pathId || contextOrder?.orderId;
    const [userName, setUserName] = useState('there');

    useEffect(() => {
        if (user?.name) {
            setUserName(user.name.split(' ')[0]);
        } else {
            try {
                const u = localStorage.getItem('gutzo_auth') || localStorage.getItem('gutzo_user');
                if (u) {
                    const parsed = JSON.parse(u);
                    const name = parsed.name || parsed.firstName || '';
                    if (name) setUserName(name.split(' ')[0]);
                }
            } catch (e) { }
        }
    }, [user]);

    const formatPhone = (phone: string) => {
        if (!phone) return "";
        const clean = phone.replace(/[^\d]/g, "");
        if (clean.length >= 10) {
            return `+91${clean.slice(-10)}`;
        }
        return `+91${clean}`;
    };

    // Poll for order details directly
    useEffect(() => {
        if (!orderId) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        // Start context tracking just to keep it in sync for background, 
        // but we use local state for display.
        if (!contextOrder || contextOrder.orderId !== orderId) {
            startTracking(orderId);
        }

        const fetchOrder = async () => {
            try {
                // Get phone for auth
                let phone = user?.phone ? formatPhone(user.phone) : '';

                if (!phone) {
                    try {
                        const u = localStorage.getItem('gutzo_auth') || localStorage.getItem('gutzo_user');
                        if (u) {
                            const parsed = JSON.parse(u);
                            phone = formatPhone(parsed.phone);
                        }
                    } catch (e) { }
                }

                if (!phone) {
                    return;
                }

                const url = `${nodeApiService.baseUrl}/api/orders/${orderId}`;
                const res = await fetch(url, {
                    headers: {
                        'x-user-phone': phone,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.status === 404) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                if (res.ok) {
                    if (data.user?.name) {
                        setUserName(data.user.name.split(' ')[0]);
                    }
                    setLocalOrder(data.data || data);
                } else {
                    console.error("Direct Fetch Error:", data);
                }
            } catch (err: any) {
                console.error("Fetch Order Error:", err);
                if (err?.message?.includes('404') || err?.status === 404) {
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 5000); // 5s polling
        return () => clearInterval(interval);
    }, [orderId, user]);

    const handleMinimize = () => {
        setIsMinimizing(true);
        setTimeout(() => {
            minimizeOrder();
        }, 300);
    };

    const handleGoHome = () => {
        // Clear tracking state if cancelled to prevent floating bar from appearing
        if (displayStatus === 'cancelled') {
            minimizeOrder(); // Or closeTracking? minimizeOrder will take us home.
            // Actually, if it's cancelled, we probably want to properly close it so the floating bar doesn't show "Cancelled" forever.
            // But user said "Go to Home", floating bar might show "Cancelled" for a bit then disappear.
            // Let's stick to router navigate for now, and rely on Context "Live Logic" to hide/show bar correctly.
            routerNavigate('/');
        } else {
            routerNavigate('/');
        }
    };

    // Live Tracking State
    const [liveTracking, setLiveTracking] = useState<any>(null);

    // Poll for LIVE Shadowfax Status
    useEffect(() => {
        if (!orderId) return;
        const fetchLiveTracking = async () => {
            try {
                const url = `${nodeApiService.baseUrl}/api/delivery/track/${orderId}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        console.log('🔴 Live Tracking Data:', data.data);
                        console.log('📍 Driver Location:', data.data.rider_details?.current_location);
                        setLiveTracking(data.data);
                    }
                }
            } catch (e) {
                console.error('Live tracking fetch error:', e);
            }
        };
        fetchLiveTracking();
        const interval = setInterval(fetchLiveTracking, 10000); // 10s polling
        return () => clearInterval(interval);
    }, [orderId]);

    // Locations (Dynamic with strict No-Fallback)
    const getVendorLocation = () => {
        if (localOrder?.vendor?.latitude && localOrder?.vendor?.longitude) {
            return {
                lat: Number(localOrder.vendor.latitude),
                lng: Number(localOrder.vendor.longitude)
            };
        }
        return null;
    };

    const getUserLocation = () => {
        try {
            if (localOrder?.delivery_address) {
                const addr = typeof localOrder.delivery_address === 'string'
                    ? JSON.parse(localOrder.delivery_address)
                    : localOrder.delivery_address;

                if (addr?.latitude && addr?.longitude) {
                    return {
                        lat: Number(addr.latitude),
                        lng: Number(addr.longitude)
                    };
                }
            }
        } catch (e) {
            console.error("Error parsing delivery address:", e);
        }
        return null;
    };

    const storeLocation = getVendorLocation();
    const userLocation = getUserLocation();

    // 1. Extract DB Delivery
    const activeDelivery = localOrder?.delivery && localOrder.delivery.length > 0 ? localOrder.delivery[0] : null;

    // Helper: Define Status Priority to prevent downgrading (e.g. Allotted -> Searching)
    const getStatusPriority = (s: string | undefined | null) => {
        if (!s) return 0;
        const status = s.toLowerCase();
        /*
          Priority Hierarchy:
          0: unknown
          1: created, placed
          2: searching_rider, preparing
          3: allotted, driver_assigned, rider_assigned
          4: arrived, reached_location
          5: picked_up, on_way
          6: delivered, completed
        */
        if (['created', 'placed'].includes(status)) return 1;
        if (['searching_rider', 'preparing', 'accepted'].includes(status)) return 2;
        if (['allotted', 'driver_assigned', 'rider_assigned'].includes(status)) return 3;
        if (['arrived', 'reached_location', 'on_way'].includes(status)) return 4;
        if (['picked_up', 'out_for_delivery', 'arrived_at_drop'].includes(status)) return 5;
        if (['delivered', 'completed'].includes(status)) return 6;
        if (['cancelled', 'rejected'].includes(status)) return 7; // Highest priority to override
        return 0;
    };

    // 2. Merge with Live Tracking (Resilient Logic)
    const dbStatus = activeDelivery?.status;
    const liveStatus = liveTracking?.status;

    // Special Check: If DB status is cancelled, force it (Logic override)
    const isCancelled = dbStatus === 'cancelled' || localOrder?.status === 'rejected' || localOrder?.status === 'cancelled';

    // Only use Live Status if it doesn't downgrade meaningfully (or if it's a cancellation/reset which we handle separately)
    const useLiveStatus = !isCancelled && getStatusPriority(liveStatus) >= getStatusPriority(dbStatus);

    const mergedDelivery = {
        ...activeDelivery,
        rider_name: (useLiveStatus ? liveTracking?.rider_details?.name : activeDelivery?.rider_name) || activeDelivery?.rider_name,
        rider_phone: (useLiveStatus ? liveTracking?.rider_details?.contact_number : activeDelivery?.rider_phone) || activeDelivery?.rider_phone,
        rider_location: liveTracking?.rider_details?.current_location, // Always prefer live location
        status: isCancelled ? 'cancelled' : (useLiveStatus ? liveStatus : dbStatus)
    };

    const isFindingRider = !mergedDelivery.rider_name;
    const driverLoc = mergedDelivery.rider_coordinates || contextOrder?.rider_coordinates;

    // derived status
    const rawStatus = localOrder?.status || contextOrder?.status;
    // Use MERGED delivery status (Live or DB)
    const deliveryStatus = mergedDelivery.status ? mergedDelivery.status.toLowerCase() : (localOrder?.delivery_status || '');

    // Determine Display Status
    let displayStatus = 'placed'; // Default

    if (isCancelled || rawStatus === 'rejected' || rawStatus === 'cancelled' || deliveryStatus === 'cancelled') {
        displayStatus = 'cancelled';
    } else if (rawStatus === 'searching_rider' || deliveryStatus === 'searching_rider' || deliveryStatus === 'created') {
        displayStatus = 'searching_rider';
    } else if (['picked_up', 'driver_assigned', 'rider_assigned', 'allotted', 'accepted', 'arrived', 'out_for_delivery', 'on_way', 'reached_location', 'delivered', 'completed', 'collected', 'customer_door_step'].includes(deliveryStatus)) {

        // Map Raw Shadowfax statuses to Frontend Display Statuses
        if (['driver_assigned', 'rider_assigned', 'allotted', 'accepted', 'arrived'].includes(deliveryStatus)) {
            displayStatus = 'driver_assigned';
        } else if (deliveryStatus === 'collected') {
            displayStatus = 'picked_up';
        } else if (deliveryStatus === 'customer_door_step') {
            displayStatus = 'arrived_at_drop';
        } else {
            displayStatus = deliveryStatus;
        }

        if (deliveryStatus === 'on_way') displayStatus = 'on_way';
        if (deliveryStatus === 'delivered') displayStatus = 'delivered';
    } else {
        // Standard Order Status Fallback
        if (rawStatus === 'placed' || rawStatus === 'confirmed' || rawStatus === 'paid') {
            displayStatus = 'placed'; // Waiting for Confirmation
        }
        else if (rawStatus === 'preparing' || rawStatus === 'accepted') displayStatus = 'preparing';
        else if (rawStatus === 'ready' || rawStatus === 'ready_for_pickup') displayStatus = 'ready';
        else displayStatus = rawStatus || 'preparing';
    }

    // Mapped Text
    const getStatusText = (s: string) => {
        switch (s) {
            case 'searching_rider': return 'Finding Delivery Partner...';
            case 'placed': return 'Waiting for restaurant confirmation';
            case 'preparing': return 'Kitchen Accepted • Preparing Food';
            case 'ready': return 'Food is Ready • Waiting for Pickup';
            case 'picked_up':
            case 'driver_assigned': return 'Driver Assigned';
            case 'on_way':
            case 'reached_location': return 'Order on the way';
            case 'arrived_at_drop': return 'Valet at Doorstep';
            case 'delivered': return 'Order Delivered';
            case 'cancelled': return 'Order Cancelled';
            case 'rejected': return 'Order Rejected';
            default: return s; // Fallback
        }
    };



    // ETA State
    const [eta, setEta] = useState<string>('Updating...');

    // Debug: Log status and driver location
    useEffect(() => {
        console.log('🎯 Map Props - Status:', displayStatus, 'Driver Location:', mergedDelivery?.rider_location || driverLoc);
        console.log('📊 Merged Delivery:', mergedDelivery);
    }, [displayStatus, mergedDelivery, driverLoc]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isMinimizing ? 0 : 1, scale: isMinimizing ? 0.9 : 1, y: isMinimizing ? '100%' : '0%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col z-[100] overflow-hidden"
        >
            {/* Top Green Header Section - Dynamic Color */}
            <div className="px-4 pt-3 pb-4 rounded-b-2xl z-30 shadow-md relative" style={{ backgroundColor: displayStatus === 'cancelled' ? '#ef4444' : '#1BA672' }}>
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-3">
                    {displayStatus === 'cancelled' ? (
                        <div className="w-8 h-8" /> // Empty placeholder
                    ) : (
                        <button onClick={handleMinimize} className="text-white p-1.5 hover:bg-white/10 rounded-full transition-colors relative z-50">
                            <Minimize2 size={20} />
                        </button>
                    )}

                    <div className="text-white font-semibold text-sm opacity-90">
                        {localOrder?.vendor?.name || contextOrder?.vendorName}
                    </div>
                    <button className="text-white p-1.5">
                        <Share2 size={18} />
                    </button>
                </div>

                {/* Status Title */}
                <div className="text-center mb-3">
                    <h1 className="text-white text-xl font-bold mb-3 tracking-wide">
                        {getStatusText(displayStatus)}
                    </h1>

                    {/* Time Pill - Hidden if Cancelled */}
                    {displayStatus !== 'cancelled' && (
                        <div className="inline-flex items-center rounded-lg px-3 py-1.5 gap-2" style={{ backgroundColor: '#14885E' }}>
                            <span className="text-white font-semibold text-base">{eta}</span>
                            <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                            <span className="text-green-100 font-medium text-sm">On time</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container - Full Height */}
            <div className="flex-1 w-full h-full relative bg-gray-100 z-10">
                <OrderTrackingMap
                    storeLocation={storeLocation}
                    userLocation={userLocation}
                    driverLocation={mergedDelivery?.rider_location || driverLoc}
                    status={displayStatus as any}
                    onDurationUpdate={(time) => setEta(time)}
                />
            </div>

            {/* Bottom Sheet UI */}
            <OrderTrackingTimelineSheet
                status={displayStatus === 'searching_rider' ? 'searching_rider' : (displayStatus as any)}
                vendorName={localOrder?.vendor?.name || contextOrder?.vendorName}
                deliveryOtp={mergedDelivery?.delivery_otp || activeDelivery?.delivery_otp || localOrder?.delivery_otp || contextOrder?.delivery_otp}
                driver={displayStatus === 'picked_up' || displayStatus === 'on_way' || displayStatus === 'delivered' || displayStatus === 'driver_assigned' ? {
                    name: mergedDelivery?.rider_name || activeDelivery?.rider_name || contextOrder?.rider_name,
                    phone: mergedDelivery?.rider_phone || activeDelivery?.rider_phone || contextOrder?.rider_phone || ""
                } : undefined}
                orderId={localOrder?.order_number || contextOrder?.orderNumber}
                onGoHome={handleGoHome}
            />
        </motion.div>
    );
}
