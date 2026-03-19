import React from 'react';
import { Maximize2, Clock, CheckCircle, ChefHat, Bike, X } from 'lucide-react';
import { useOrderTracking } from '../contexts/OrderTrackingContext';
import { useRouter } from './Router';

export function ActiveOrderFloatingBar() {
  const { activeOrder, activeOrders, maximizeOrder, closeTracking, clearActiveOrder } = useOrderTracking();
  const { currentRoute, navigate } = useRouter();

  // Poll storage for debug and fallback
  const [storageOrder, setStorageOrder] = React.useState<any>(null);

  // 1. Priority: Context Array -> Context Single -> Storage
  // We prefer activeOrders array if populated.
  const displayOrders = activeOrders && activeOrders.length > 0 
      ? activeOrders 
      : (activeOrder ? [activeOrder] : (storageOrder ? [storageOrder] : []));

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
                subtext: 'OTP required at delivery',
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

  // Keep only in home page per user request, hide on other pages (e.g., vendor, checkout, tracking)
  if (currentRoute !== '/' && window.location.pathname !== '/') return null;

  // Render even if delivered (per user request) -> actually hide it
  const validOrders = displayOrders.filter(o => o && !['delivered', 'cancelled', 'rejected'].includes((o.status || '').toLowerCase()));

  // Hide if no valid orders
  if (validOrders.length === 0) return null;

  const showBackgroundAndLabel = validOrders.length >= 3;

  // Render Carousel or Single Card
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out ${showBackgroundAndLabel ? 'border-t' : ''}`}
      style={{
        ...(showBackgroundAndLabel ? {
          backgroundColor: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: '#E0E0E0',
          boxShadow: '0 -6px 24px rgba(0, 0, 0, 0.10)',
        } : {}),
        paddingTop: '14px',
        paddingBottom: '14px',
        pointerEvents: showBackgroundAndLabel ? 'auto' : 'none',
      }}
    >

        {/* Global container — constrains to page layout, flex-col so label + carousel stack */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-2">

          {/* Section label — only shown for 3+ orders */}
          {showBackgroundAndLabel && (
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Active Orders ({validOrders.length})
            </p>
          )}

          {/*
            Carousel alignment:
            - Mobile: justify-start (flex-start) — first card always reachable, no left-clip
            - Desktop (768px+): justify-center — cards balanced in the container
            'aof-carousel' class handles the responsive breakpoint via the inline <style> below,
            since this project uses a pre-compiled CSS and md: Tailwind utilities are not available.
          */}
          <div
            className={[
              'aof-carousel flex overflow-x-auto snap-x snap-mandatory gap-3 hide-scrollbar w-full',
              validOrders.length === 1 ? 'justify-center' : '',
            ].join(' ')}
          >
            {validOrders.map((ord, idx) => {
                const config = getStatusConfig(ord.status);
                
                // Carousel: fixed vw width to allow peek-next. Single: fills container (uncapped on desktop).
                const cardWidthClass = validOrders.length > 1
                  ? 'w-[85vw] max-w-[340px] shrink-0'
                  : 'w-full max-w-sm lg:max-w-none mx-auto';
                
                return (
                    <div 
                        key={ord.orderId || idx}
                        className={`snap-center ${cardWidthClass}`}
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div 
                          className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex overflow-hidden border border-gray-100 h-[100px]"
                        >
                            {/* Left Content Section */}
                            <div className="flex-1 p-4 flex flex-col justify-center gap-1 active:bg-gray-50 transition-colors" 
                                 onClick={() => {
                                     // Navigate using GZ Number if available, fallback to ID
                                     const targetId = ord.orderNumber || ord.orderId;
                                     if(targetId) navigate(`/tracking/${targetId}`);
                                 }}>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight font-primary truncate pr-2">
                                         {ord.vendorName || 'Active Order'}
                                    </h3>
                                    {ord.orderNumber && (
                                        <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                                            #{ord.orderNumber}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`flex items-center gap-1.5 ${config.bg} px-2.5 py-1.5 rounded-md`}>
                                        {config.icon}
                                        <span className={`${config.text} font-bold text-[10px] md:text-xs uppercase tracking-wide`}>
                                            {config.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Action Buttons */}
                            <div className="w-14 flex flex-col items-center justify-center border-l border-gray-100 bg-gray-50/50">
                                {/* Only allow closing if it's the single legacy view, or handle per-order close if needed. For now, we omit close for multiples or route it through Context if needed. We'll keep maximize. */}
                                {validOrders.length === 1 && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeTracking();
                                        }}
                                        className="w-8 h-8 rounded-full mb-1 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const targetId = ord.orderNumber || ord.orderId;
                                        if(targetId) navigate(`/tracking/${targetId}`);
                                    }}
                                    className={`w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#1BA672] hover:bg-[#E8F6F1] transition-colors ${validOrders.length > 1 ? 'w-10 h-10' : ''}`}
                                >
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>{/* end carousel */}
        </div>{/* end global container */}
        
        {/* Component-scoped styles: scrollbar hiding + responsive carousel alignment */}
        <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            /* Multi-order carousel: start on mobile so first card is never clipped;
               center on desktop now that all cards fit without overflowing. */
            .aof-carousel {
                justify-content: flex-start;
            }
            @media (min-width: 768px) {
                .aof-carousel {
                    justify-content: center;
                }
            }
        `}} />
    </div>
  );
}
