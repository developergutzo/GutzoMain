import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Utensils, ChevronRight, ShoppingBag } from 'lucide-react';
import { useState, useMemo } from 'react';

interface OrderTrackingTimelineSheetProps {
  status: 'created' | 'placed' | 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered' | 'driver_assigned' | 'searching_rider' | 'arrived_at_drop' | 'cancelled' | 'rejected' | string;
  vendorStatus?: string;
  driver?: {
    name: string;
    phone: string;
    image?: string;
  };
  vendorName?: string;
  deliveryOtp?: string;
  orderId?: string;
  onGoHome?: () => void;
}

import { useOrderTracking } from '../contexts/OrderTrackingContext';

export function OrderTrackingTimelineSheet({ status, vendorStatus, driver, vendorName, deliveryOtp, orderId, onGoHome }: OrderTrackingTimelineSheetProps) {
  const { activeOrder } = useOrderTracking();
  
  const isCancelled = status === 'cancelled' || status === 'rejected';
  const isDelivered = status === 'delivered' || status === 'completed';

  // Helper: Get Shadowfax Card Content
  const getShadowfaxConfig = () => {
    switch (status) {
      case 'searching_rider':
      case 'placed':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center animate-spin text-[#1BA672]"><LoadingSpinner /></div>,
          title: "Shadowfax Delivery",
          text: "Waiting for driver assignment",
          isActive: false
        };
      case 'accepted':
      case 'driver_assigned':
      case 'allotted':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">👤</div>,
          title: driver?.name || "Driver Assigned",
          text: "Driver assigned",
          isActive: true
        };
      case 'arrived':
      case 'reached_location':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">👤</div>,
          title: driver?.name || "Driver",
          text: "Reached vendor location",
          isActive: true
        };
      case 'collected':
      case 'picked_up':
      case 'on_way':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">🛵</div>,
          title: driver?.name || "Driver",
          text: "Driver picked up the order",
          isActive: true
        };
      case 'customer_door_step':
      case 'arrived_at_drop':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">👤</div>,
          title: driver?.name || "Driver",
          text: "Driver reached your location",
          isActive: true,
          showCall: true
        };
      default:
        return null;
    }
  };

  // Helper: Get Vendor Card Content
  const getVendorConfig = () => {
    // Priority 1: Check if vendor marked as ready (Independent state)
    if (vendorStatus === 'ready' || vendorStatus === 'ready_for_pickup') {
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">✅</div>,
          text: "Order ready"
        };
    }

    // Priority 2: Follow delivery status enums
    switch (status) {
      case 'searching_rider':
      case 'placed':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">🏢</div>,
          text: "Waiting for vendor to accept"
        };
      case 'accepted':
      case 'driver_assigned':
      case 'allotted':
      case 'preparing':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🍳</div>,
          text: "Order preparing"
        };
      case 'arrived':
      case 'reached_location':
      case 'ready':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">✅</div>,
          text: "Order ready"
        };
      case 'collected':
      case 'picked_up':
      case 'on_way':
      case 'customer_door_step':
      case 'arrived_at_drop':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">📦</div>,
          text: "Food handed over to driver"
        };
      default:
        return null;
    }
  };

  const sfConfig = getShadowfaxConfig();
  const vConfig = getVendorConfig();

  const [isDismissing, setIsDismissing] = useState(false);

  // Confetti particles state
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 - 50, // -50 to 50
      y: Math.random() * -100 - 50, // -150 to -50
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      color: ['#FFD700', '#FF6347', '#00CED1', '#98FB98', '#FF69B4'][i % 5]
    }));
  }, []);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onGoHome?.();
    }, 500);
  };

  if (isDelivered) {
    return (
      <motion.div 
        initial={{ y: 0 }}
        animate={{ y: isDismissing ? '100%' : 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0, 0.67, 0] }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
      >
        {/* Layer 2: Success Green - Expanding from center */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: 'linear-gradient(135deg, #1BA672 0%, #14885E 100%)' }}
          className="absolute inset-0 rounded-full"
        />

        {/* Confetti Celebration */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
          {particles.map((p: any) => (
            <motion.div
              key={p.id}
              initial={{ x: '50%', y: '40%', opacity: 1, scale: 0, rotate: 0 }}
              animate={{ 
                x: `${50 + p.x}%`, 
                y: `${110}%`, 
                opacity: [1, 1, 0],
                rotate: p.rotation + 720,
                scale: p.scale 
              }}
              transition={{ 
                duration: Math.random() * 2 + 1.5, 
                ease: "easeOut",
                delay: Math.random() * 0.2
              }}
              style={{ 
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: p.color,
                borderRadius: '2px',
                zIndex: 205
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
          className="relative z-[210] flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 text-5xl shadow-lg border border-white/30">
            🎉
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Delivered!</h2>
          <p className="text-white/80 mb-8 text-lg font-medium">Hope you enjoy your meal from <br/><span className="text-white font-bold">{vendorName}</span></p>
        </motion.div>
        
        {/* Layer 3: Rating Card - Slide up with bounce */}
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            delay: 0.5, 
            duration: 0.6, 
            type: 'spring', 
            damping: 20, 
            stiffness: 100 
          }}
          className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl border border-white/20 relative z-[210]"
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-6">Rate your experience</p>
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button 
                key={star} 
                whileTap={{ scale: 1.3 }}
                whileHover={{ scale: 1.1 }}
                className="hover:scale-110 active:scale-95 transition-all text-[#E0E0E0]"
              >
                <svg width="42" height="42" viewBox="0 0 24 24" style={{ fill: '#1BA672' }}>
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </motion.button>
            ))}
          </div>
          
          <div className="relative mb-6">
            <textarea 
              placeholder="Tell us what you liked..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#1BA672]/10 focus:border-[#1BA672] transition-all resize-none"
              rows={3}
              onFocus={(e) => {
                // Ensure the view is accessible when keyboard appears
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />
          </div>

          <button 
            onClick={handleDismiss}
            style={{ backgroundColor: '#1BA672' }}
            className="w-full hover:brightness-95 active:brightness-90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-900/10 active:scale-[0.98] transition-all text-base uppercase tracking-wider"
          >
            Go to Home
          </button>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-white/60 text-xs font-medium tracking-wide relative z-[210]"
        >
          SHADOWFAX DELIVERY PARTNER
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 pb-8 safe-area-bottom">
        <div className="w-full flex justify-center pt-4 pb-4">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full opacity-60"/>
        </div>

        <div className="px-5">
            {/* Header with Title & ETA (Gutzo Style) */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-[#1BA672] flex items-center justify-center text-white">
                      <Utensils size={20} />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{vendorName || "Active Order"}</h3>
                      <p className="text-[11px] text-gray-500 font-medium">#{orderId || "Order"}</p>
                   </div>
                </div>
                {sfConfig?.showCall && (
                   <button 
                     onClick={() => window.open(`tel:${driver?.phone}`)}
                     className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-[#1BA672] shadow-sm"
                   >
                     <Phone size={18} fill="currentColor" />
                   </button>
                )}
            </div>

            {/* DUAL CARD UI LAYOUT */}
            <div className="space-y-3 mb-6">
                {/* Shadowfax Delivery Card */}
                {sfConfig && (
                   <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${sfConfig.isActive ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-gray-50/50 border-gray-100'}`}>
                      {sfConfig.icon}
                      <div className="flex-1">
                         <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Delivery Partner</p>
                         <h4 className="font-bold text-gray-900 text-sm">{sfConfig.title}</h4>
                         <p className="text-xs text-gray-500 font-medium">{sfConfig.text}</p>
                      </div>
                      {deliveryOtp && (status === 'picked_up' || status === 'on_way' || status === 'customer_door_step') && (
                         <div className="bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                            <p className="text-[8px] text-blue-600 font-bold text-center mb-0.5">OTP</p>
                            <p className="font-mono font-black text-sm tracking-widest text-gray-900">{deliveryOtp}</p>
                         </div>
                      )}
                   </div>
                )}

                {/* Vendor Status Card */}
                {vConfig && (
                   <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center gap-4">
                      {vConfig.icon}
                      <div className="flex-1">
                         <p className="text-[10px] font-bold text-[#1BA672] uppercase tracking-widest mb-0.5">Merchant Status</p>
                         <h4 className="font-bold text-gray-900 text-sm">{vendorName}</h4>
                         <p className="text-xs text-gray-500 font-medium">{vConfig.text}</p>
                      </div>
                   </div>
                )}
            </div>

            {/* Action List */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-700">
                    <Utensils size={20} className="text-gray-400" />
                    <div className="flex-1 text-sm font-medium">We've asked the restaurant to not send cutlery</div>
                </div>

                <div className="w-full h-px bg-gray-100 my-2"></div>

                {/* Order ID Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingBag size={20} className="text-gray-400" />
                            <div className="space-y-0.5">
                                <p className="text-xs text-gray-500">Order ID <span className="font-bold font-mono tracking-wide ml-2">#{orderId || activeOrder?.orderNumber || activeOrder?.orderId}</span></p>
                                {activeOrder?.trackingData?.sfx_order_id && (
                                    <p className="text-[10px] text-blue-600 font-mono">Shadowfax: {activeOrder.trackingData.sfx_order_id}</p>
                                )}
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
);
