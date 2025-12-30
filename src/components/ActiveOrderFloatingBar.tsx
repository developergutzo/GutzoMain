import React from 'react';
import { Maximize2, Clock, CheckCircle, ChefHat, Bike } from 'lucide-react';
import { useOrderTracking } from '../contexts/OrderTrackingContext';
import { useRouter } from './Router';
import { OrderTrackingMap } from './OrderTrackingMap';

export function ActiveOrderFloatingBar() {
  const { activeOrder, maximizeOrder, storeLocation, userLocation } = useOrderTracking();
  const { currentRoute } = useRouter();

  // Poll storage for debug and fallback
  const [storageOrder, setStorageOrder] = React.useState<any>(null);

  React.useEffect(() => {
    const checkStorage = () => {
        const s = localStorage.getItem('activeOrder');
        if (s) {
            try { setStorageOrder(JSON.parse(s)); } catch(e) {}
        } else {
            setStorageOrder(null);
        }
    };
    checkStorage(); // Init
    const interval = setInterval(checkStorage, 1000); // Poll
    return () => clearInterval(interval);
  }, []);

  // Use context order OR storage order (fallback)
  const displayOrder = activeOrder || storageOrder;
  
  // Helper to get status UI
  const getStatusConfig = (status: string) => {
    switch (status) {
        case 'preparing':
            return {
                title: 'Preparing your food',
                subtext: 'Kitchen is working on it',
                icon: <ChefHat size={14} className="text-orange-600" />,
                bg: 'bg-orange-50',
                text: 'text-orange-600',
                label: 'PREPARING'
            };
        case 'ready':
        case 'picked_up':
            return {
                title: 'Order Picked Up',
                subtext: 'Driver is on the way',
                icon: <Bike size={14} className="text-[#1BA672]" />,
                bg: 'bg-green-50',
                text: 'text-[#1BA672]',
                label: 'PICKED UP'
            };
        case 'on_way':
             // Simulation for "Late": Randomly or based on time? 
             // For demo, let's keep it clean Green unless explicitly late.
             // User asked for "if late means little late".
             // We'll just stick to standard "ARRIVING" for now as we don't have 'expectedTime' in simulation.
            return {
                title: 'Order Arriving',
                subtext: 'Arriving in 12 mins',
                icon: <Clock size={14} className="text-[#1BA672]" />,
                bg: 'bg-green-50',
                text: 'text-[#1BA672]',
                label: 'ARRIVING • 12 MINS'
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
        default:
            return {
                title: 'Spice of Bangalore',
                subtext: 'Order Status',
                icon: <Clock size={14} className="text-gray-500" />,
                bg: 'bg-gray-50',
                text: 'text-gray-600',
                label: 'UPDATING...'
            };
    }
  };

  // Hide on tracking page
  if (currentRoute.startsWith('/tracking/')) return null;

  // Render even if delivered (per user request)
  // if (displayOrder?.status === 'delivered') return null;

  // Hide if no order
  if (!displayOrder) return null;

  const config = getStatusConfig(displayOrder.status);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[1000] transition-all duration-300 ease-in-out">
        <div 
          className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex overflow-hidden border border-gray-100"
          style={{ height: '100px' }}
        >
                {/* Left Content Section */}
                <div className="flex-1 p-4 flex flex-col justify-center gap-1" onClick={maximizeOrder}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-base leading-tight font-primary truncate pr-2">
                             {/* Show Restaurant Name usually, but maybe Title if important? 
                                 Let's keep Restaurant Name as standard anchor, and use pill for status 
                             */}
                             Spice of Bangalore
                        </h3>
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

                {/* Right Map Section (Moved to Middle) */}
                <div className="w-[100px] h-full relative border-l border-gray-100 bg-gray-200 flex-shrink-0">
                    <OrderTrackingMap 
                        storeLocation={storeLocation}
                        userLocation={userLocation}
                        status={displayOrder.status}
                        fitBoundsPadding={20} 
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 z-10 cursor-pointer" onClick={maximizeOrder} />
                </div>

                {/* Middle Maximize Button Area (Moved to Right) */}
                <div className="w-14 flex items-center justify-center border-l border-gray-100 bg-white" onClick={maximizeOrder}>
                    <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1BA672] transition-colors">
                        <Maximize2 size={16} />
                    </button>
                </div>
        </div>
    </div>
  );
}
