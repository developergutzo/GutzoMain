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

export function OrderTrackingPage() {
  const { currentRoute, navigate: routerNavigate } = useRouter();
  // Extract orderId from the URL path manually since we aren't using <Route> components
  const pathId = currentRoute.split('/tracking/')[1];
  
  const { activeOrder: contextOrder, startTracking, minimizeOrder } = useOrderTracking();
  const [isMinimizing, setIsMinimizing] = useState(false);

  // LOCAL STATE REWIRING
  const [localOrder, setLocalOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const orderId = pathId || contextOrder?.orderId;
  const [userName, setUserName] = useState('there');

  useEffect(() => {
      try {
          const u = localStorage.getItem('gutzo_auth') || localStorage.getItem('gutzo_user');
          if (u) {
              const parsed = JSON.parse(u);
              const name = parsed.name || parsed.firstName || '';
              if (name) setUserName(name.split(' ')[0]); 
          }
      } catch(e) {}
  }, []);
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
            let phone = '';
            try {
                const u = localStorage.getItem('gutzo_auth') || localStorage.getItem('gutzo_user');
                if (u) {
                    const parsed = JSON.parse(u);
                    phone = formatPhone(parsed.phone);
                    
                    // If name is missing in local storage, fetch it
                    if (!parsed.name && phone) {
                         import('../utils/nodeApi').then(({ nodeApiService }) => {
                             nodeApiService.getUser(phone.replace('+91', '')).then(res => {
                                 if (res.success && res.data?.user?.name) {
                                     setUserName(res.data.user.name.split(' ')[0]);
                                     // Optionally update local storage
                                     parsed.name = res.data.user.name;
                                     localStorage.setItem('gutzo_auth', JSON.stringify(parsed));
                                 }
                             });
                         });
                    }
                }
            } catch(e) {}
            
            // console.log("Fetching order with phone:", phone);

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
    const interval = setInterval(fetchOrder, 3000); // 3s polling
    return () => clearInterval(interval);
  }, [orderId]);

  const handleMinimize = () => {
      setIsMinimizing(true);
      setTimeout(() => {
          minimizeOrder();
      }, 300); 
  };

  // derived status
  // If we have localOrder, use its status. Otherwise fallback to context.
  // DEFAULT to 'preparing' if loading to avoid flash of "placed"
  const rawStatus = localOrder?.status || contextOrder?.status;
  const deliveryStatus = localOrder?.delivery_status || contextOrder?.status || '';

  // Determine Display Status
  let displayStatus = 'preparing';
  
  // LOGIC MATCHING CONTEXT BUT SIMPLER
  if (['picked_up', 'driver_assigned', 'out_for_delivery', 'on_way', 'allotted', 'reached_location', 'delivered', 'completed'].includes(deliveryStatus)) {
      displayStatus = deliveryStatus === 'driver_assigned' ? 'picked_up' : deliveryStatus; // Map driver_assigned to picked_up bucket for now
      if (deliveryStatus === 'on_way') displayStatus = 'on_way';
      if (deliveryStatus === 'delivered') displayStatus = 'delivered';
  } else {
      if (rawStatus === 'placed' || rawStatus === 'confirmed' || rawStatus === 'paid') displayStatus = 'placed';
      else if (rawStatus === 'preparing' || rawStatus === 'accepted') displayStatus = 'preparing';
      else if (rawStatus === 'ready' || rawStatus === 'ready_for_pickup') displayStatus = 'ready';
      else displayStatus = rawStatus;
  }
  
  // Mapped Text
  const getStatusText = (s: string) => {
      switch(s) {
          case 'placed': return 'Waiting for restaurant confirmation';
          case 'preparing': return 'Kitchen Accepted • Requesting Delivery Partner...';
          case 'ready': return 'Food is Ready • Waiting for Pickup';
          case 'picked_up': 
          case 'driver_assigned': return 'Driver Assigned';
          case 'on_way': return 'Order on the way';
          case 'delivered': return 'Order Delivered';
          default: return s; // Fallback
      }
  };

  // Locations
  const storeLocation = { lat: 12.9716, lng: 77.5946 }; 
  const userLocation = { lat: 12.9516, lng: 77.6046 }; 
  
  // Extract active delivery from localOrder if available
  const activeDelivery = localOrder?.delivery && localOrder.delivery.length > 0 
      ? localOrder.delivery[0] 
      : null;

  const driverLoc = activeDelivery?.rider_coordinates || contextOrder?.rider_coordinates;

  if (notFound) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm mb-6 max-w-sm w-full">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Order Details Not Found</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    We couldn't find the order #{orderId?.slice(0,8)}. It may have been cancelled or belongs to a different account.
                </p>
                <Button 
                    onClick={() => window.location.href = '/home'} 
                    className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white"
                >
                    Go to Home
                </Button>
            </div>
        </div>
      );
  }

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isMinimizing ? 0 : 1, scale: isMinimizing ? 0.9 : 1, y: isMinimizing ? '100%' : '0%' }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full h-screen bg-gray-50 flex flex-col overflow-hidden"
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
                
                {/* Debug Info (Hidden in Prod) */}
                {/* <div className="text-xs text-white/50 mt-2">Status: {rawStatus} | Delivery: {deliveryStatus}</div> */}
            </div>
        </div>

        {/* Absolute positioned coupon banner - MOVED OUTSIDE HEADER FOR Z-INDEX FIX - TEMPORARILY DISABLED
        <div className="absolute top-[180px] left-4 right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 z-[60]">
                <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center text-xl">🎁</div>
                <p className="text-xs text-gray-600 leading-tight">
                Hey {userName}, sit back while we discover hidden coupons near you 💰
                </p>
        </div>
        */}

        {/* Map Background - Full Space */}
        <div className="flex-1 w-full h-full relative bg-gray-100 z-10 pt-10">
             <OrderTrackingMap 
                storeLocation={storeLocation}
                userLocation={userLocation}
                driverLocation={driverLoc}
                status={displayStatus as any}
            />
        </div>

        {/* Bottom Sheet UI */}
        <OrderTrackingTimelineSheet 
            status={displayStatus as any}
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
