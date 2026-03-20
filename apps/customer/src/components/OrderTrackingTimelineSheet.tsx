import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Utensils, ChevronRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface OrderTrackingTimelineSheetProps {
  status: 'created' | 'placed' | 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered' | 'driver_assigned' | 'searching_rider' | 'arrived_at_drop' | 'cancelled' | 'rejected' | string;
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

export function OrderTrackingTimelineSheet({ status, driver, vendorName, deliveryOtp, orderId, onGoHome }: OrderTrackingTimelineSheetProps) {
  const { activeOrder } = useOrderTracking();
  
  const isCancelled = status === 'cancelled' || status === 'rejected';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 pb-6">
        {/* Drag Handle Area */}
        <div className="w-full flex justify-center pt-3 pb-2 mb-2">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full"/>
        </div>

        <div className="px-4">
            {/* Restaurant Info Row */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                        <img src="https://cdn-icons-png.flaticon.com/512/3014/3014520.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{vendorName || activeOrder?.vendorName || "Active Order"}</h3>
                    </div>
                </div>
                <div>
                     <button className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                        <Phone size={20} />
                     </button>
                </div>
            </div>

            {/* Status Banner - Dynamic Color */}
            <div className="border rounded-xl p-4 mb-4 flex items-center justify-between" 
                 style={{ 
                     backgroundColor: isCancelled ? '#fee2e2' : '#e7fdf3', 
                     borderColor: isCancelled ? '#fecaca' : '#d1f7e6' 
                 }}>
                <div>
                    <p className="text-sm font-bold" style={{ color: isCancelled ? '#dc2626' : '#0d8e54' }}>
                        {status === 'created' ? "Waiting for payment" :
                        status === 'placed' ? "Waiting for restaurant confirmation" :
                         status === 'searching_rider' ? "Finding nearby delivery partner" :
                         status === 'preparing' ? "Your order is being prepared" :
                         status === 'ready' ? "Your order is ready at the restaurant" :
                         status === 'picked_up' ? "Order picked up by valet" :
                         status === 'driver_assigned' ? "Food is being prepared" :
                         status === 'on_way' ? "Valet is near your location" :
                         status === 'arrived_at_drop' ? "Valet has arrived at your doorstep" :
                         status === 'delivered' ? "Your order has been delivered" :
                         status === 'cancelled' ? "Order Cancelled" :
                         status === 'rejected' ? "Order Rejected by Restaurant" :
                         "Order Status: " + status}
                    </p>
                </div>
                {(status === 'preparing' || status === 'searching_rider' || status === 'driver_assigned') && (
                  <div className="w-10 h-1 relative">
                       <div className="absolute inset-0 rounded-full overflow-hidden" style={{ backgroundColor: '#b2e8d3' }}>
                          <div className="absolute left-0 top-0 bottom-0 w-1/2 rounded-full animate-pulse" style={{ backgroundColor: '#2ecca0' }}></div>
                       </div>
                  </div>
                )}
            </div>

            {/* Delivered: Rating & Success UI */}
            {status === 'delivered' && (
                <div className="bg-green-50 rounded-2xl p-6 mb-6 text-center border border-green-100 shadow-sm animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-50 text-3xl">
                        🎉
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Delivered Successfully!</h2>
                    <p className="text-sm text-gray-600 mb-6">Hope you enjoy your meal from {vendorName || "the restaurant"}</p>
                    
                    <div className="space-y-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rate your experience</p>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star}
                                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-[#1BA672]"
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        
                        <div className="pt-4">
                            <button 
                                onClick={onGoHome}
                                className="w-full bg-[#1BA672] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_12px_rgba(27,166,114,0.3)] active:scale-95 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancelled: Go to Home Button */}
            {isCancelled && (
                <div className="mb-6">
                    <button 
                        onClick={onGoHome}
                        className="w-full flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98]"
                        style={{
                            backgroundColor: '#1BA672',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(27,166,114,0.4)'
                        }}
                    >
                        <span>Go to Home</span>
                    </button>
                </div>
            )}

            {/* Delivery Partner & Rider Info - Show when driver is assigned */}
            {driver?.name && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-2.5 mb-3">
                    <div className="flex items-center justify-between">
                        {/* Left side: Delivery Partner & Rider */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <span className="text-base">🛵</span>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">Shadowfax • {driver.name}</p>
                                {driver.phone && <p className="text-[10px] text-gray-600 mt-0.5">{driver.phone}</p>}
                            </div>
                        </div>
                        
                        {/* Right side: OTP */}
                        {deliveryOtp && (
                            <div className="text-right">
                                <p className="text-[7px] text-gray-500 uppercase tracking-widest mb-1">OTP</p>
                                <div className="flex gap-1">
                                    {deliveryOtp.toString().split('').map((digit, index) => (
                                        <div key={index} className="w-6 h-7 bg-white border border-gray-300 rounded flex items-center justify-center">
                                            <span className="text-sm font-bold text-gutzo-primary">{digit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delivery OTP - Show only when picked up or on way and NO driver yet */}
            {deliveryOtp && !driver?.name && (status === 'picked_up' || status === 'on_way' || status === 'driver_assigned' || status === 'ready') && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center shadow-sm">
                    <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-0.5">Share with Rider</p>
                        <p className="text-sm text-blue-800">Delivery OTP</p>
                    </div>
                    <div className="text-3xl font-mono font-bold text-gray-900 tracking-widest bg-white px-3 py-1 rounded border border-blue-200">
                        {deliveryOtp}
                    </div>
                </div>
            )}

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
