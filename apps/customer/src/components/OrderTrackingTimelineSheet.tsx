import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Utensils, ChevronRight, ShoppingBag, User, Loader2, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { nodeApiService } from '../utils/nodeApi';

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
  vendorPhone?: string;
}

import { useOrderTracking } from '../contexts/OrderTrackingContext';

export function OrderTrackingTimelineSheet({ status, vendorStatus, driver, vendorName, deliveryOtp, orderId, onGoHome, vendorPhone }: OrderTrackingTimelineSheetProps) {
  const { activeOrder } = useOrderTracking();
  const { user } = useAuth();
  
  const isCancelled = status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'rejected';
  const isDelivered = status.toLowerCase() === 'delivered' || status.toLowerCase() === 'completed';
  const displayStatus = status.toLowerCase(); 

  // Helper: Get Shadowfax Card Content
  const getShadowfaxConfig = (status: string) => {
    switch (status) {
      case 'searching_rider':
      case 'placed':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User size={20} /></div>,
          title: "Delivery Partner",
          text: "Waiting for delivery partner",
          isActive: false
        };
      case 'accepted':
      case 'driver_assigned':
      case 'allotted':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">👤</div>,
          title: driver?.name || "Delivery Partner Assigned",
          text: "Delivery partner assigned",
          isActive: true,
          showCall: true
        };
      case 'arrived':
      case 'reached_location':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">👤</div>,
          title: driver?.name || "Delivery Partner",
          text: "Reached vendor location",
          isActive: true,
          showCall: true
        };
      case 'collected':
      case 'picked_up':
      case 'on_way':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">🛵</div>,
          title: driver?.name || "Delivery Partner",
          text: "Delivery partner picked up the order",
          isActive: true,
          showCall: true
        };
      case 'customer_door_step':
      case 'arrived_at_drop':
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">👤</div>,
          title: driver?.name || "Delivery Partner",
          text: "Delivery Partner reached your location",
          isActive: true,
          showCall: true
        };
      default:
        return null;
    }
  };

  // Helper: Get Vendor Card Content
  const getVendorConfig = (status: string) => {
    // Priority 1: Check if vendor marked as ready (Independent state)
    if (vendorStatus === 'ready' || vendorStatus === 'ready_for_pickup') {
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">✅</div>,
          text: "Order ready",
          showCall: true
        };
    }

    // Priority 2: Check vendor preparation status specifically
    if (vendorStatus === 'accepted' || vendorStatus === 'preparing') {
        return {
          icon: <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🍳</div>,
          text: "Order preparing",
          showCall: true
        };
    }

    // Priority 3: Check if food handed over (collected/picked up)
    if (['collected', 'picked_up', 'on_way', 'customer_door_step', 'arrived_at_drop'].includes(status.toLowerCase())) {
        return {
          icon: <div className="w-10 h-10 rounded-full bg-[#E8F6F1] flex items-center justify-center text-xl">📦</div>,
          text: "Food handed over to driver",
          showCall: true
        };
    }

    // Default: Waiting for approval
    return {
      icon: <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">🏢</div>,
      text: "Still waiting for approval",
      showCall: true
    };
  };

  const sfConfig = getShadowfaxConfig(displayStatus);
  const vConfig = getVendorConfig(displayStatus);

  const [isDismissing, setIsDismissing] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDismiss = async () => {
    if (isDismissing || isSubmitting) return;

    // Submit rating if available and we have an orderId
    const effectiveOrderId = orderId || activeOrder?.orderId;
    if (rating > 0 && effectiveOrderId && user?.phone && !isSubmitted) {
      setIsSubmitting(true);
      try {
        await nodeApiService.rateOrder(user.phone, effectiveOrderId, {
          rating,
          feedback: feedback.trim()
        });
        
        // Show success state
        setIsSubmitted(true);
        
        // Wait for 2.5 seconds before automatically dismissing
        setTimeout(() => {
          setIsDismissing(true);
          setTimeout(() => {
            onGoHome?.();
          }, 500);
        }, 2500);
        
        return; // Don't proceed to immediate dismiss
      } catch (error) {
        console.error("Failed to submit rating:", error);
        // Fallback: dismiss anyway if API fails
      } finally {
        setIsSubmitting(false);
      }
    }

    // Direct dismiss (if no rating or already submitted/errored)
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
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
      >
        {/* Layer 2: Success Green - Expanding from center */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: 'linear-gradient(180deg, #1D6B44 0%, #2EB271 100%)' }}
          className="absolute inset-0 rounded-full"
        />

        {/* Simple Minimal Tick */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex items-center justify-center opacity-10">
           <div className="w-[400px] h-[400px] bg-white rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring', damping: 15 }}
          className="relative z-[210] flex flex-col items-center"
        >
          {/* Glass-morphic pulsing ring */}
          <div className="relative mb-6">
             <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-white rounded-full blur-xl"
             />
             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center relative border border-white/30 shadow-2xl">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
             </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-[1px]">Order Delivered!</h2>
          <p className="text-white mb-8 text-lg font-medium opacity-100">Hope you enjoy your meal from <br/><span className="text-white font-black">{vendorName}</span></p>
        </motion.div>
        
        {/* Layer 3: Rating Card - Slide up with bounce */}
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            delay: 0.4, 
            duration: 0.7, 
            type: 'spring', 
            damping: 25, 
            stiffness: 80 
          }}
          className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative z-[210] border border-white/20 overflow-hidden"
          style={{ borderRadius: 32 }}
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div 
                key="rating-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[2px] mb-6 text-center">Rate your experience</p>
                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button 
                      key={star} 
                      onClick={() => setRating(star)}
                      whileTap={{ scale: 1.25 }}
                      whileHover={{ scale: 1.15 }}
                      className="hover:scale-115 active:scale-95 transition-all outline-none p-1"
                    >
                      <svg 
                        width="44" 
                        height="44" 
                        viewBox="0 0 24 24" 
                        fill={rating >= star ? '#1BA672' : 'none'}
                        stroke={rating >= star ? '#1BA672' : '#E2E8F0'}
                        strokeWidth="1.5"
                        style={{ 
                          filter: rating >= star ? 'drop-shadow(0 0 12px rgba(27, 166, 114, 0.3))' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </motion.button>
                  ))}
                </div>
                
                <div className="relative mb-6">
                  <textarea 
                    placeholder="Share your feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#1BA672]/10 focus:border-[#1BA672] transition-all resize-none placeholder:text-gray-500 placeholder:font-normal text-gray-800 disabled:opacity-50"
                    rows={3}
                  />
                </div>

                <motion.button 
                  onClick={handleDismiss}
                  initial={false}
                  animate={{ scale: (rating > 0 && !isSubmitting) ? [1, 1.02, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ backgroundColor: '#1BA672' }}
                  disabled={isSubmitting}
                  className="w-full hover:brightness-95 active:brightness-90 text-white font-bold py-4 rounded-xl shadow-xl shadow-green-900/10 active:scale-[0.98] transition-all text-sm uppercase tracking-wider h-[56px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : "Submit"}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="success-message"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="flex flex-col items-center justify-center py-4"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1BA672" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Thank You!</h3>
                <p className="text-gray-500 text-sm font-medium">Feedback submitted successfully.</p>
                <p className="text-gray-400 text-[10px] mt-4 uppercase tracking-widest">Closing shortly...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <div className="mt-8 opacity-0">.</div>

        {/* Close Icon - High-Priority Interaction Layer */}
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ opacity: 1, scale: 1.1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="absolute z-[300] w-14 h-14 flex items-center justify-center bg-black/30 backdrop-blur-xl rounded-full border border-white/30 text-white cursor-pointer transition-all shadow-2xl"
          style={{ 
            top: 48, 
            right: 24, 
            position: 'absolute' 
          }}
        >
          <X size={28} strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 pb-8 safe-area-bottom">
        <div className="w-full flex justify-center pt-4 pb-4">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full opacity-60"/>
        </div>

        <div className="px-5">
            {/* DUAL CARD UI LAYOUT */}
            <div className="space-y-3 mb-6">
                {/* Shadowfax Delivery Card */}
                 {sfConfig && (
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center gap-4 transition-all duration-300">
                       {sfConfig.icon}
                       <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Delivery Partner</p>
                          <h4 className="font-bold text-gray-900 text-sm">{sfConfig.title}</h4>
                          <p className="text-xs text-gray-500 font-medium">{sfConfig.text}</p>
                       </div>

                       <div className="flex items-center gap-3">
                          {deliveryOtp && (['accepted', 'arrived', 'picked_up', 'on_way', 'customer_door_step', 'arrived_at_drop', 'driver_assigned', 'allotted'].includes(displayStatus)) && (
                             <div className="bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                                <p className="text-[8px] text-blue-600 font-bold text-center mb-0.5">OTP</p>
                                <p className="font-mono font-black text-sm tracking-widest text-gray-900">{deliveryOtp}</p>
                             </div>
                          )}

                          {sfConfig.showCall && driver?.phone && (
                             <button 
                               onClick={() => window.open(`tel:${driver.phone}`)}
                               className="w-12 h-12 rounded-full bg-[#E8F6F1] flex items-center justify-center text-[#1BA672] shadow-sm hover:brightness-95 active:scale-90 transition-all"
                             >
                                <Phone size={20} stroke="#1BA672" />
                             </button>
                          )}
                       </div>
                    </div>
                 )}

                {/* Vendor Status Card */}
                 {vConfig && (
                    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center gap-4">
                       {vConfig.icon}
                       <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Kitchen Status</p>
                          <h4 className="font-bold text-gray-900 text-sm">{vendorName}</h4>
                          <p className="text-xs text-gray-500 font-medium">{vConfig.text}</p>
                       </div>

                       {vConfig.showCall && vendorPhone && (
                          <button 
                            onClick={() => window.open(`tel:${vendorPhone}`)}
                            className="w-12 h-12 rounded-full bg-[#E8F6F1] flex items-center justify-center text-[#1BA672] shadow-sm hover:brightness-95 active:scale-90 transition-all shrink-0"
                          >
                             <Phone size={20} stroke="#1BA672" />
                          </button>
                       )}
                    </div>
                 )}
            </div>

             {/* Action List */}
             <div className="space-y-4 px-5">
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
