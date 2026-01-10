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
          } catch(e) {}
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
                } catch(e) {}
            }
            
            if (!phone) {
                // console.warn("No phone found for auth, skipping fetch");
                return;
            }

            const res = await fetch(`/api/orders/${orderId}`, {
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
                // console.log("🔥 Direct Fetch Success:", data.status);
                if (data.user?.name) {
                    setUserName(data.user.name.split(' ')[0]);
                }
                setLocalOrder(data.data || data);
            } else {
                console.error("Direct Fetch Error:", data);
            }
        } catch (err) {
            console.error("Fetch Network Error:", err);
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

    // Live Tracking State
    const [liveTracking, setLiveTracking] = useState<any>(null);

    // Poll for LIVE Shadowfax Status
    useEffect(() => {
        if (!orderId) return;
        const fetchLiveTracking = async () => {
            try {
                const res = await fetch(`/api/delivery/track/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        setLiveTracking(data.data);
                    }
                }
            } catch (e) {}
        };
        fetchLiveTracking();
        const interval = setInterval(fetchLiveTracking, 10000); // 10s polling
        return () => clearInterval(interval);
    }, [orderId]);

   // Locations (Moved up)
   const storeLocation = { lat: 12.9716, lng: 77.5946 }; 
   const userLocation = { lat: 12.9516, lng: 77.6046 }; 

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
       if (['arrived', 'reached_location'].includes(status)) return 4;
       if (['picked_up', 'out_for_delivery', 'on_way'].includes(status)) return 5;
       if (['delivered', 'completed'].includes(status)) return 6;
       return 0;
   };

   // 2. Merge with Live Tracking (Resilient Logic)
   const dbStatus = activeDelivery?.status;
   const liveStatus = liveTracking?.status;
   
   // Only use Live Status if it doesn't downgrade meaningfully (or if it's a cancellation/reset which we handle separately)
   // For the purpose of this simulation fix + reliability: Trust the 'Advanced' status.
   const useLiveStatus = getStatusPriority(liveStatus) >= getStatusPriority(dbStatus);

   const mergedDelivery = {
        ...activeDelivery,
        rider_name: (useLiveStatus ? liveTracking?.rider_details?.name : activeDelivery?.rider_name) || activeDelivery?.rider_name,
        rider_phone: (useLiveStatus ? liveTracking?.rider_details?.contact_number : activeDelivery?.rider_phone) || activeDelivery?.rider_phone,
        rider_location: liveTracking?.rider_details?.current_location, // Always prefer live location
        status: useLiveStatus ? liveStatus : dbStatus
    };

    const isFindingRider = !mergedDelivery.rider_name;
    const driverLoc = mergedDelivery.rider_coordinates || contextOrder?.rider_coordinates;

  // derived status
  const rawStatus = localOrder?.status || contextOrder?.status;
  // Use MERGED delivery status (Live or DB)
  const deliveryStatus = mergedDelivery.status ? mergedDelivery.status.toLowerCase() : (localOrder?.delivery_status || '');

  // Determine Display Status
  let displayStatus = 'placed'; // Default
  
  if (rawStatus === 'searching_rider' || deliveryStatus === 'searching_rider' || deliveryStatus === 'created') {
      displayStatus = 'searching_rider';
  } else if (['picked_up', 'driver_assigned', 'rider_assigned', 'allotted', 'out_for_delivery', 'on_way', 'reached_location', 'delivered', 'completed'].includes(deliveryStatus)) {
      displayStatus = (deliveryStatus === 'driver_assigned' || deliveryStatus === 'rider_assigned' || deliveryStatus === 'allotted') ? 'driver_assigned' : deliveryStatus;
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
      switch(s) {
          case 'searching_rider': return 'Finding Delivery Partner...';
          case 'placed': return 'Waiting for restaurant confirmation';
          case 'preparing': return 'Kitchen Accepted • Preparing Food';
          case 'ready': return 'Food is Ready • Waiting for Pickup';
          case 'picked_up': 
          case 'driver_assigned': return 'Driver Assigned';
          case 'on_way': return 'Order on the way';
          case 'delivered': return 'Order Delivered';
          default: return s; // Fallback
      }
  };



  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isMinimizing ? 0 : 1, scale: isMinimizing ? 0.9 : 1, y: isMinimizing ? '100%' : '0%' }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col z-[100] overflow-hidden"
    >
        {/* Top Green Header Section */}
        <div className="px-4 pt-4 pb-6 rounded-b-3xl z-30 shadow-md relative" style={{ backgroundColor: '#1BA672' }}>
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={handleMinimize} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors relative z-50">
                    <Minimize2 size={24} />
                </button>
                <div className="text-white font-semibold text-base opacity-90">
                    {localOrder?.vendor?.name || contextOrder?.vendorName}
                </div>
                <button className="text-white p-2">
                    <Share2 size={20} />
                </button>
            </div>

            {/* Status Title */}
            <div className="text-center mb-6">
                <h1 className="text-white text-2xl font-bold mb-4 tracking-wide">
                    {getStatusText(displayStatus)}
                </h1>
                
                {/* Time Pill */}
                <div className="inline-flex items-center rounded-lg px-4 py-2 gap-2" style={{ backgroundColor: '#14885E' }}>
                    <span className="text-white font-semibold text-lg">36 mins</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span className="text-green-100 font-medium">On time</span>
                </div>
            </div>
        </div>

        {/* Tracking Details Overlay */}
        <div className="flex-1 w-full h-full relative bg-gray-100 z-10 pt-10">
             <OrderTrackingMap 
                storeLocation={storeLocation}
                userLocation={userLocation}
                driverLocation={mergedDelivery?.rider_location || driverLoc}
                status={displayStatus as any}
            />

            {/* Shadowfax Order Details Card - Updated Visibility */}
            <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4 z-40">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Live Delivery Updates
                    </h3>
                    {mergedDelivery?.partner_order_id && (
                        <span className="text-[10px] text-gray-400 font-mono">ID: {mergedDelivery.partner_order_id}</span>
                    )}
                </div>
                
                <div className="space-y-3">
                    {/* Delivery Partner Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                            <span className="text-xl">🛵</span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Delivery Partner</p>
                            <p className="text-sm font-semibold text-gray-900">Shadowfax</p>
                        </div>
                    </div>

                    {/* Rider Info (Live from Tracking API) */}
                    {!isFindingRider ? (
                        <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500">Rider</p>
                                <p className="text-sm font-medium">{mergedDelivery.rider_name}</p>
                                {mergedDelivery.rider_phone && <p className="text-xs text-gray-400">{mergedDelivery.rider_phone}</p>}
                            </div>
                            {mergedDelivery.delivery_otp && (
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Share OTP</p>
                                    <p className="text-lg font-bold text-gutzo-primary">{mergedDelivery.delivery_otp}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-amber-700 italic">Finding nearest delivery partner...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Bottom Sheet UI */}
        <OrderTrackingTimelineSheet 
            status={displayStatus === 'searching_rider' ? 'searching_rider' : (displayStatus as any)}
            vendorName={localOrder?.vendor?.name || contextOrder?.vendorName}
            deliveryOtp={activeDelivery?.delivery_otp || localOrder?.delivery_otp || contextOrder?.delivery_otp}
            driver={displayStatus === 'picked_up' || displayStatus === 'on_way' || displayStatus === 'delivered' || displayStatus === 'driver_assigned' ? {
                name: activeDelivery?.rider_name || contextOrder?.rider_name,
                phone: activeDelivery?.rider_phone || contextOrder?.rider_phone || ""
            } : undefined} 
        />
    </motion.div>
  );
}
