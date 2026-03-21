import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Minimize2, Share2, Phone, AlertCircle, X } from 'lucide-react';
import { OrderTrackingMap } from '../components/OrderTrackingMap';
import { OrderTrackingTimelineSheet } from '../components/OrderTrackingTimelineSheet';
import { useOrderTracking } from '../contexts/OrderTrackingContext';
import { useRouter } from '../components/Router';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { nodeApiService } from '../utils/nodeApi';
import { supabase } from '../utils/supabase/client';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { AnimatePresence } from 'framer-motion';

export function OrderTrackingPage() {
    const { currentRoute, navigate: routerNavigate } = useRouter();
    // Extract orderId from the URL path manually since we aren't using <Route> components
    const pathId = currentRoute ? currentRoute.split('/tracking/')[1] : null;

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

    // Poll for LIVE Shadowfax Status + BROADCAST LISTENER
    useEffect(() => {
        if (!orderId) return;

        // A. BROADCAST LISTENER (Instant)
        const channel = supabase.channel('delivery-updates')
            .on('broadcast', { event: 'status-update' }, (payload: any) => {
                const data = payload.payload;
                if (data.order_id === orderId || data.order_number === orderId) {
                    console.log('📡 Realtime Status Broadcast Received:', data);
                    setLiveTracking((prev: any) => ({
                        ...prev,
                        status: data.status,
                        rider_details: data.rider_details || prev?.rider_details
                    }));
                }
            })
            .subscribe();

        // B. POLLING FALLBACK (Reliability)
        const fetchLiveTracking = async () => {
            try {
                const url = `${nodeApiService.baseUrl}/api/delivery/track/${orderId}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        setLiveTracking(data.data);
                    }
                }
            } catch (e) {
                console.error('Live tracking fetch error:', e);
            }
        };

        fetchLiveTracking();
        const interval = setInterval(fetchLiveTracking, 15000); // Increased to 15s since we have realtime

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    // Locations (Dynamic with strict No-Fallback)
    const storeLocation = useMemo(() => {
        if (localOrder?.vendor?.latitude && localOrder?.vendor?.longitude) {
            return {
                lat: Number(localOrder.vendor.latitude),
                lng: Number(localOrder.vendor.longitude)
            };
        }
        // Fallback to live tracking pickup location
        if (liveTracking?.pickup_details?.latitude && liveTracking?.pickup_details?.longitude) {
            return {
                lat: Number(liveTracking.pickup_details.latitude),
                lng: Number(liveTracking.pickup_details.longitude)
            };
        }
        return null;
    }, [localOrder?.vendor?.latitude, localOrder?.vendor?.longitude, liveTracking?.pickup_details]);

    const userLocation = useMemo(() => {
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
            // Fallback to live tracking drop location
            if (liveTracking?.drop_details?.latitude && liveTracking?.drop_details?.longitude) {
                return {
                    lat: Number(liveTracking.drop_details.latitude),
                    lng: Number(liveTracking.drop_details.longitude)
                };
            }
        } catch (e) {
            console.error("Error parsing delivery address:", e);
        }
        return null;
    }, [localOrder?.delivery_address, liveTracking?.drop_details]);

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
        if (['picked_up', 'out_for_delivery', 'collected'].includes(status)) return 5;
        if (['arrived_at_drop', 'customer_door_step'].includes(status)) return 6;
        if (['delivered', 'completed'].includes(status)) return 7;
        if (['cancelled', 'rejected'].includes(status)) return 8; // Highest priority to override
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
        rider_location: liveTracking?.rider_details?.current_location || liveTracking?.rider_details?.last_location, // Always prefer live location
        status: isCancelled ? 'cancelled' : (useLiveStatus ? liveStatus : dbStatus),
        delivery_otp: liveTracking?.delivery_otp || liveTracking?.verification?.otp || activeDelivery?.delivery_otp || localOrder?.delivery_otp || contextOrder?.delivery_otp
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
        displayStatus = deliveryStatus;
    } else {
        // Standard Order Status Fallback
        if (rawStatus === 'placed' || rawStatus === 'confirmed' || rawStatus === 'paid') {
            displayStatus = 'placed'; // Waiting for Confirmation
        }
        else if (rawStatus === 'preparing' || rawStatus === 'accepted') displayStatus = 'preparing';
        else if (rawStatus === 'ready' || rawStatus === 'ready_for_pickup') displayStatus = 'ready';
        else displayStatus = rawStatus || 'preparing';
    }

    // Mapped Text (Iterative Header Titles)
    const getStatusText = (s: string) => {
        const str = s.toLowerCase();
        switch (str) {
            case 'searching_rider': return 'Finding Delivery Partner...';
            case 'placed': return 'Finding Delivery Partner...';
            case 'accepted':
            case 'driver_assigned':
            case 'rider_assigned':
            case 'allotted':
                return 'Delivery Partner Assigned';
            case 'arrived':
            case 'reached_location':
                return 'Delivery Partner at Vendor';
            case 'collected':
            case 'picked_up':
                return 'Out for Delivery';
            case 'on_way':
                return 'Out for Delivery';
            case 'customer_door_step':
            case 'arrived_at_drop':
                return 'Doorstep Reached';
            case 'delivered':
            case 'completed':
                return 'Order Delivered';
            case 'cancelled': return 'Order Cancelled';
            case 'rejected': return 'Order Rejected';
            default: return 'Order Status';
        }
    };



    // ETA State
    const [eta, setEta] = useState<string>('Updating...');

    // Debug: Log status and driver location
    useEffect(() => {
        console.log('🎯 Map Props - Status:', displayStatus, 'Driver Location:', mergedDelivery?.rider_location || driverLoc);
        console.log('📊 Merged Delivery:', mergedDelivery);
    }, [displayStatus, mergedDelivery, driverLoc]);

    // Stabliize callback to prevent infinite render loop in Map
    const handleDurationUpdate = useCallback((time: string) => {
        setEta(time);
    }, []);

    if (loading) {
        // Skeleton mirrors the exact structure of the real page so the transition
        // feels instant. Vendor name is shown immediately from context (already
        // known from the card the user just tapped) while the API call completes.
        const skeletonVendorName = contextOrder?.vendorName || null;
        return (
            <div className="fixed inset-0 w-full h-full flex flex-col z-[100] overflow-hidden bg-gray-100">
                {/* Green header skeleton — same height and shape as the real header */}
                <div
                    className="px-4 pt-3 pb-4 rounded-b-2xl z-30 shadow-md"
                    style={{ backgroundColor: '#1BA672' }}
                >
                    {/* Top bar */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/20" />
                        <div className="text-white font-semibold text-sm opacity-90">
                            {skeletonVendorName
                                ? skeletonVendorName
                                : <span className="inline-block w-32 h-4 rounded bg-white/30 animate-pulse" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/20" />
                    </div>
                    {/* Status title */}
                    <div className="text-center mb-3">
                        <h1 className="text-white text-xl font-bold mb-3 tracking-wide">Finding your order...</h1>
                        <div className="inline-flex items-center rounded-lg px-3 py-1.5 gap-2" style={{ backgroundColor: '#14885E' }}>
                            <span className="inline-block w-12 h-4 rounded bg-white/30 animate-pulse" />
                            <span className="w-1 h-1 bg-white rounded-full opacity-50" />
                            <span className="text-white font-medium text-sm">On time</span>
                        </div>
                    </div>
                </div>

                {/* Map placeholder — pulsing grey tile grid mimics a real map */}
                <div className="flex-1 w-full relative overflow-hidden bg-gray-200">
                    {/* Faint grid lines to suggest a map */}
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.35 }}>
                        <defs>
                            <pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#map-grid)" />
                    </svg>
                    {/* Centre pulse dot — stands in for the map pin */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#1BA672]/30 flex items-center justify-center animate-pulse">
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: '#1BA672' }} />
                        </div>
                    </div>
                </div>

                {/* Bottom sheet stub — same rounded-top shape as the real timeline sheet */}
                <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 pt-4 pb-6">
                    <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4" />
                    <div className="flex items-center gap-3 py-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                        <div className="flex-1">
                            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-2" />
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="h-px bg-gray-100 my-2" />
                    <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-3" />
                </div>
            </div>
        );
    }

    if (notFound || (!localOrder && !liveTracking)) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                <p className="text-gray-500 mb-6">We couldn't track this order. It may have been cancelled or the link is invalid.</p>
                <Button onClick={() => routerNavigate('/')} className="bg-gutzo-brand hover:bg-gutzo-brand-dark text-white px-8">
                    Go to Home
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isMinimizing ? 0 : 1, scale: isMinimizing ? 0.9 : 1, y: isMinimizing ? '100%' : '0%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed inset-0 w-full h-full flex flex-col z-[100] overflow-hidden transition-colors duration-500 ${
                (localOrder?.status === 'delivered' || (displayStatus as any) === 'delivered') ? 'bg-transparent' : 'bg-gray-50'
            }`}
        >
            {/* Top Green Header Section - Dynamic Color */}
            <AnimatePresence>
                {displayStatus !== 'delivered' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pt-3 pb-4 rounded-b-2xl z-30 shadow-md relative" 
                        style={{ backgroundColor: displayStatus === 'cancelled' ? '#ef4444' : '#1BA672' }}
                    >
                        {/* Top Bar */}
                        <div className="flex justify-between items-center mb-3">
                            {displayStatus === 'cancelled' ? (
                                <div className="w-8 h-8" /> // Empty placeholder
                            ) : (
                                <button 
                                    onClick={handleMinimize} 
                                    className="text-white p-2.5 hover:bg-white/10 active:scale-90 rounded-full transition-all relative z-50 flex items-center justify-center min-w-[44px] min-h-[44px]"
                                >
                                    <Minimize2 size={22} />
                                </button>
                            )}

                            <div className="text-white font-semibold text-sm opacity-90">
                                {localOrder?.vendor?.name || liveTracking?.pickup_details?.name || contextOrder?.vendorName || "Track Order"}
                            </div>
                            {displayStatus === 'cancelled' ? (
                                <button 
                                  onClick={() => routerNavigate('/')} 
                                  className="text-white p-2.5 hover:bg-white/10 active:scale-90 rounded-full transition-all relative z-50 flex items-center justify-center min-w-[44px] min-h-[44px] mt-2 mr-2"
                                >
                                    <X size={22} />
                                </button>
                            ) : (
                                <button className="text-white p-1.5 opacity-60">
                                    <Share2 size={18} />
                                </button>
                            )}
                        </div>

                        {/* Status Title */}
                        <div className="text-center mb-3">
                            <h1 className="text-white text-xl font-bold mb-3 tracking-wide">
                                {getStatusText(displayStatus)}
                            </h1>

                            {/* Time Pill - Hidden if Cancelled or Delivered */}
                            {displayStatus !== 'cancelled' && (
                                <div className="inline-flex items-center rounded-lg px-3 py-1.5 gap-2" style={{ backgroundColor: '#14885E' }}>
                                    <span className="text-white font-semibold text-base">{eta}</span>
                                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                                    <span className="text-white font-medium text-sm">On time</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map Container - Full Height */}
            <AnimatePresence>
                {displayStatus !== 'delivered' && (
                    <motion.div 
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeIn" }}
                        className="flex-1 w-full h-full relative bg-gray-100 z-10"
                    >
                        <OrderTrackingMap
                            storeLocation={storeLocation}
                            userLocation={userLocation}
                            driverLocation={mergedDelivery?.rider_location || driverLoc}
                            status={displayStatus as any}
                            onDurationUpdate={handleDurationUpdate}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Sheet UI */}
            <OrderTrackingTimelineSheet
                status={displayStatus === 'searching_rider' ? 'searching_rider' : (displayStatus as any)}
                vendorStatus={localOrder?.status}
                vendorName={localOrder?.vendor?.name || liveTracking?.pickup_details?.name || contextOrder?.vendorName || "Active Order"}
                vendorPhone={localOrder?.vendor?.phone || contextOrder?.vendorPhone || liveTracking?.pickup_details?.contact_number}
                deliveryOtp={mergedDelivery?.delivery_otp || liveTracking?.verification?.otp}
                driver={(mergedDelivery?.rider_name || activeDelivery?.rider_name) ? {
                    name: mergedDelivery?.rider_name || activeDelivery?.rider_name || contextOrder?.rider_name,
                    phone: mergedDelivery?.rider_phone || activeDelivery?.rider_phone || contextOrder?.rider_phone || ""
                } : undefined}
                orderId={localOrder?.id || localOrder?.order_number || contextOrder?.orderNumber}
                onGoHome={handleGoHome}
            />
        </motion.div>
    );
}
