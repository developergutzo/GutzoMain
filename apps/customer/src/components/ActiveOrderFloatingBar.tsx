import React from 'react';
import { Maximize2, Clock, CheckCircle, ChefHat, Bike, X } from 'lucide-react';
import { useOrderTracking } from '../contexts/OrderTrackingContext';
import { useRouter } from './Router';

export function ActiveOrderFloatingBar() {
  const { activeOrder, maximizeOrder, closeTracking, clearActiveOrder } = useOrderTracking();
  const { currentRoute } = useRouter();

  // Poll storage for debug and fallback
  const [storageOrder, setStorageOrder] = React.useState<any>(null);

  // 1. Priority: Context -> Storage
  // If context has an order, use it. If not, fall back to storage (but verify it's not cancelled)
  const order = activeOrder || storageOrder;

  // 2. Clear Storage if Context says Cancelled
  React.useEffect(() => {
      if (activeOrder && (activeOrder.status === 'cancelled' || activeOrder.status === 'rejected')) {
           console.log('FloatingBar: Order is cancelled. Clearing storage.');
           setStorageOrder(null);
           localStorage.removeItem('activeOrder');
           clearActiveOrder(); // Ensure context is also cleared
      }
  }, [activeOrder, clearActiveOrder]);

  // 3. Load from Storage ONLY if context is empty
  React.useEffect(() => {
      if (!activeOrder) {
          const saved = localStorage.getItem('activeOrder');
          if (saved) {
              try {
                  const parsed = JSON.parse(saved);
                  // Double check if this saved order is actually old/cancelled
                  if (parsed && parsed.status !== 'cancelled' && parsed.status !== 'rejected') {
                       setStorageOrder(parsed);
                  } else {
                       localStorage.removeItem('activeOrder');
                  }
              } catch (e) {
                  localStorage.removeItem('activeOrder');
              }
          }
      }
  }, [activeOrder]);

  // Helper to get status UI
  const getStatusConfig = (status: string) => {
    switch (status) {
        case 'placed':
        case 'confirmed':
        case 'paid':
            return {
                title: 'Order Placed',
                subtext: 'Waiting for restaurant confirmation',
                icon: <Clock size={14} className="text-blue-600" />,
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                label: 'PLACED'
            };
        case 'searching_rider':
            return {
                title: 'Finding Delivery Partner',
                subtext: 'Looking for nearby riders...',
                icon: <Bike size={14} className="text-amber-600" />,
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                label: 'SEARCHING'
            };
        case 'preparing':
            return {
                title: 'Kitchen Accepted',
                subtext: 'Requesting Delivery Partner...',
                icon: <ChefHat size={14} className="text-orange-600" />,
                bg: 'bg-orange-50',
                text: 'text-orange-600',
                label: 'PREPARING'
            };
        case 'ready':
             return {
                 title: 'Food is Ready',
                 subtext: 'Waiting for Rider to Pickup',
                 icon: <Bike size={14} className="text-[#1BA672]" />,
                 bg: 'bg-green-50',
                 text: 'text-[#1BA672]',
                 label: 'READY'
             };
        case 'picked_up':
            return {
                title: 'Order Picked Up',
                subtext: (order?.delivery_otp) ? `Sharing OTP: ${order.delivery_otp}` : 'Rider is on the way',
                icon: <Bike size={14} className="text-[#1BA672]" />,
                bg: 'bg-green-50',
                text: 'text-[#1BA672]',
                label: 'PICKED UP'
            };

        case 'reached_location':
        case 'arrived_at_drop':
        case 'on_way':
            return {
                title: status === 'arrived_at_drop' ? 'Valet at Doorstep' : 'Order Arriving',
                subtext: status === 'arrived_at_drop' ? 'Valet has arrived!' : 'Rider is nearby',
                icon: <Clock size={14} className="text-[#1BA672]" />,
                bg: 'bg-green-50',
                text: 'text-[#1BA672]',
                label: status === 'arrived_at_drop' ? 'AT DOORSTEP' : 'ARRIVING'
            };
        case 'delivered':
            return {
                title: 'Order Delivered',
                subtext: 'Enjoy your meal!',
                icon: <CheckCircle size={14} className="text-green-700" />,
                bg: 'bg-green-100',
                text: 'text-green-700',
                label: 'DELIVERED'
            };
        case 'rejected':
            return {
                title: 'Order Rejected',
                subtext: 'Refund Initiated',
                icon: <X size={14} className="text-red-600" />,
                bg: 'bg-red-50',
                text: 'text-red-600',
                label: 'REFUND INITIATED'
            };
        case 'cancelled':
            return {
                title: 'Order Cancelled',
                subtext: 'This order was cancelled',
                icon: <X size={14} className="text-red-500" />,
                bg: 'bg-red-50',
                text: 'text-red-500',
                label: 'CANCELLED'
            };
        default:
            return {
                title: 'Loading Order...',
                subtext: 'Order Status',
                icon: <Clock size={14} className="text-gray-500" />,
                bg: 'bg-gray-50',
                text: 'text-gray-600',
                label: 'UPDATING...'
            };
    }
  };

  // Hide on tracking page and partner dashboard
  const isTrackingPage = currentRoute.startsWith('/tracking/') || window.location.pathname.includes('/tracking/');
  const isPartnerPage = currentRoute.startsWith('/partner/') || window.location.pathname.includes('/partner/');
  
  if (isTrackingPage || isPartnerPage) return null;

  // Render even if delivered (per user request) -> actually hide it
  if (order?.status && ['delivered', 'cancelled', 'rejected'].includes(order.status.toLowerCase())) return null;

  // Hide if no order
  if (!order) return null;

  const config = getStatusConfig(order.status);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[1000] transition-all duration-300 ease-in-out">
        <div 
          className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex overflow-hidden border border-gray-100"
          style={{ height: '100px' }}
        >
                {/* Left Content Section */}
                <div className="flex-1 p-4 flex flex-col justify-center gap-1" onClick={maximizeOrder}>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight font-primary truncate pr-2">
                             {order.vendorName || 'Active Order'}
                        </h3>
                        {order.orderNumber && (
                            <span className="text-[10px] text-gray-500 font-medium">
                                #{order.orderNumber}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`flex items-center gap-1.5 ${config.bg} px-2.5 py-1.5 rounded-md`}>
                            {config.icon}
                            <span className={`${config.text} font-bold text-xs uppercase tracking-wide`}>
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="w-14 flex flex-col items-center justify-center border-l border-gray-100 bg-white">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            closeTracking();
                        }}
                        className="w-8 h-8 rounded-full mb-1 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <button 
                        onClick={maximizeOrder}
                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1BA672] transition-colors"
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>
        </div>
    </div>
  );
}
