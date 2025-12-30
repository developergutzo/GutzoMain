import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';

type OrderStatus = 'placed' | 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered';

interface TrackingState {
  orderId: string | null;
  status: OrderStatus;
  startTime: number | null;
  isMinimized: boolean;
  delivery_otp?: string;
  rider_name?: string;
  rider_phone?: string;
  rider_coordinates?: { lat: number, lng: number };
  vendorName?: string;
  orderNumber?: string;
}

interface OrderTrackingContextType {
  activeOrder: TrackingState | null;
  startTracking: (orderId: string, initialData?: Partial<TrackingState>) => void;
  minimizeOrder: () => void;
  maximizeOrder: () => void;
  closeTracking: () => void;
  storeLocation: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
}

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

export function OrderTrackingProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available
  const [activeOrder, setActiveOrder] = useState<TrackingState | null>(() => {
    try {
        const saved = localStorage.getItem('activeOrder');
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
  });
  const router = useRouter(); 

  // Hardcoded locations for demo
  const storeLocation = { lat: 12.9716, lng: 77.5946 }; 
  const userLocation = { lat: 12.9516, lng: 77.6046 }; 

  // Persist to localStorage
  useEffect(() => {
    console.log('Context: activeOrder changed:', activeOrder);
    if (activeOrder) {
        localStorage.setItem('activeOrder', JSON.stringify(activeOrder));
    } else {
        console.log('Context: REMOVING activeOrder from localStorage (State is null)');
        localStorage.removeItem('activeOrder');
    }
  }, [activeOrder]);

  const startTracking = useCallback((orderId: string, initialData?: Partial<TrackingState>) => {
    setActiveOrder({
      orderId,
      status: 'placed', // Default to placed
      startTime: Date.now(),
      isMinimized: false,
      ...initialData
    });
  }, []);

  const minimizeOrder = useCallback(() => {
    if (activeOrder) {
      const updated = { ...activeOrder, isMinimized: true };
      setActiveOrder(updated);
      localStorage.setItem('activeOrder', JSON.stringify(updated));
      router.navigate('/'); // Go home
    }
  }, [activeOrder, router]);

  const maximizeOrder = useCallback(() => {
    if (activeOrder && activeOrder.orderId) {
      const updated = { ...activeOrder, isMinimized: false };
      setActiveOrder(updated);
      localStorage.setItem('activeOrder', JSON.stringify(updated));
      router.navigate(`/tracking/${activeOrder.orderId}`);
    }
  }, [activeOrder, router]);

  const closeTracking = useCallback(() => {
    setActiveOrder(null);
  }, []);

  // Real-time Polling for Active Order
  useEffect(() => {
    if (!activeOrder?.orderId || activeOrder.status === 'delivered') return;

    let isMounted = true;
    
    const pollOrder = async () => {
        try {
            // Get user phone from storage
            let phone = '';
            try {
                const u = localStorage.getItem('gutzo_user');
                if (u) phone = JSON.parse(u).phone;
            } catch(e) {}
            
            if (!phone) return;

            console.log('Poll Order running...', { phone, orderId: activeOrder.orderId });

            const { nodeApiService } = await import('../utils/nodeApi');
            const response = await nodeApiService.getOrder(phone, activeOrder.orderId!);
            
            console.log('Poll Response:', response);

            if (!isMounted) return;

            // Handle potential response structure differences
            const order = response.data || response; // Support both wrapped and unwrapped
            
            if (order && order.id) {
                // Map status
                let mappedStatus: OrderStatus = 'placed'; // Default
                
                const deliveryStatus = (order.delivery_status || '').toLowerCase();
                const internalStatus = (order.status || '').toLowerCase();
                
                // Determine effect status
                let s = internalStatus;
                
                // Allow delivery status to override ONLY if it's significant (post-kitchen)
                if (['picked_up', 'driver_assigned', 'out_for_delivery', 'on_way', 'allotted', 'reached_location', 'delivered', 'completed'].includes(deliveryStatus)) {
                    s = deliveryStatus;
                }

                if (s === 'placed' || s === 'pending' || s === 'confirmed' || s === 'paid') mappedStatus = 'placed';
                else if (s === 'preparing' || s === 'accepted') mappedStatus = 'preparing';
                else if (s === 'ready' || s === 'searching_rider' || s === 'ready_for_pickup') mappedStatus = 'ready';
                else if (s === 'picked_up' || s === 'driver_assigned' || s === 'out_for_delivery') mappedStatus = 'picked_up';
                else if (s === 'on_way' || s === 'allotted' || s === 'reached_location') mappedStatus = 'on_way';
                else if (s === 'delivered' || s === 'completed') mappedStatus = 'delivered';
                else {
                    console.log('⚠️ Unknown status:', s);
                }

                // Extract Vendor Name securely
                // Check order.vendor object OR order.vendor_name flat field
                const vName = order.vendor?.name || 
                              order.vendor_name || 
                              (order.items && order.items[0]?.product_name ? 'Your Kitchen' : 'Pitchammal\'s Kitchen'); // Last resort fallback

                const extendedOrder: TrackingState = {
                    ...activeOrder,
                    status: mappedStatus,
                    delivery_otp: order.delivery_otp,
                    rider_name: order.rider_name || order.riders?.name, // Support internal riders too
                    rider_phone: order.rider_phone || order.riders?.phone,
                    rider_coordinates: order.rider_coordinates,
                    vendorName: vName,
                    orderNumber: order.order_number
                };

                setActiveOrder(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(extendedOrder)) {
                        console.log('🔄 Tracking Update:', extendedOrder);
                        return extendedOrder;
                    }
                    return prev;
                });
            }
        } catch (err: any) {
            console.error("Tracking Poll Error:", err);
            // DEBUG: Show toast on error to verify failure reason
            toast.error(`Polling Error: ${err.message || 'Unknown'}`);
        }
    };

    pollOrder(); 
    const interval = setInterval(() => {
        pollOrder();
    }, 5000); // Faster polling (5s)

    return () => {
        isMounted = false;
        clearInterval(interval);
    };
  }, [activeOrder?.orderId]);

  return (
    <OrderTrackingContext.Provider value={{ 
        activeOrder, 
        startTracking, 
        minimizeOrder, 
        maximizeOrder, 
        closeTracking,
        storeLocation,
        userLocation
    }}>
      {children}
    </OrderTrackingContext.Provider>
  );
}

export function useOrderTracking() {
  const context = useContext(OrderTrackingContext);
  if (context === undefined) {
    throw new Error('useOrderTracking must be used within a OrderTrackingProvider');
  }
  return context;
}
