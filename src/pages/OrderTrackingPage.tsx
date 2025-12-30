import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Minimize2, Share2 } from 'lucide-react';
import { OrderTrackingMap } from '../components/OrderTrackingMap';
import { OrderTrackingTimelineSheet } from '../components/OrderTrackingTimelineSheet';
import { useOrderTracking } from '../contexts/OrderTrackingContext';

import { useRouter } from '../components/Router';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function OrderTrackingPage() {
  const { currentRoute, navigate: routerNavigate } = useRouter();
  // Extract orderId from the URL path manually since we aren't using <Route> components
  const orderId = currentRoute.split('/tracking/')[1];
  
  const { activeOrder, startTracking, minimizeOrder } = useOrderTracking();
  const [isMinimizing, setIsMinimizing] = useState(false);
  
  // Start tracking if not active or different order
  useEffect(() => {
    if (orderId && (!activeOrder || activeOrder.orderId !== orderId)) {
        startTracking(orderId);
    }
  }, [orderId, activeOrder, startTracking]);

  const handleMinimize = () => {
      setIsMinimizing(true);
      setTimeout(() => {
          minimizeOrder();
      }, 300); // Wait for exit animation
  };

  // Use active status or fallback to preparing while initializing
  const status = activeOrder?.status || 'preparing';
  
  // Locations from context or hardcoded if needed (context has them)
  const storeLocation = { lat: 12.9716, lng: 77.5946 }; 
  const userLocation = { lat: 12.9516, lng: 77.6046 }; 

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
                    Spice of Bangalore
                </div>
                <button className="text-white p-2">
                    <Share2 size={20} />
                </button>
            </div>

            {/* Status Title */}
            <div className="text-center mb-6">
                <h1 className="text-white text-2xl font-bold mb-4 tracking-wide">
                    {status === 'preparing' ? 'Preparing your order' : 
                     status === 'ready' ? 'Food is ready' :
                     status === 'picked_up' ? 'Driver is assigned' :
                     status === 'on_way' ? 'Order picked up' :
                     'Order Delivered'}
                </h1>
                
                {/* Time Pill */}
                <div className="inline-flex items-center rounded-lg px-4 py-2 gap-2" style={{ backgroundColor: '#14885E' }}>
                    <span className="text-white font-semibold text-lg">36 mins</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span className="text-green-100 font-medium">On time</span>
                </div>
            </div>

            {/* Absolute positioned coupon banner (Mock from image) */}
            <div className="absolute -bottom-6 left-4 right-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 z-40 transform translate-y-2">
                 <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center text-xl">🎁</div>
                 <p className="text-xs text-gray-600 leading-tight">
                    Hey Madhan, sit back while we discover hidden coupons near you 💰
                 </p>
            </div>
        </div>

        {/* Map Background - Full Space */}
        <div className="flex-1 w-full h-full relative bg-gray-100 z-10 pt-10">
             <OrderTrackingMap 
                storeLocation={storeLocation}
                userLocation={userLocation}
                status={status}
            />
        </div>

        {/* Bottom Sheet UI */}
        <OrderTrackingTimelineSheet 
            status={status}
            driver={status === 'picked_up' || status === 'on_way' || status === 'delivered' ? {
                name: "Ramesh Kumar",
                phone: "+919876543210"
            } : undefined} 
        />
    </motion.div>
  );
}
