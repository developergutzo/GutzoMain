import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouter } from '../components/Router';
import { toast } from 'sonner';
import { useAuth } from './AuthContext'; // Fix: Proper Import

type OrderStatus = 'created' | 'placed' | 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered' | 'rejected' | 'cancelled' | 'searching_rider';

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
  vendorLocation?: string;
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
        if (saved) {
            const parsed = JSON.parse(saved);
            // Auto-clear if older than 12 hours
            if (parsed.startTime && (Date.now() - parsed.startTime > 12 * 60 * 60 * 1000)) {
                return null;
            }
            return parsed;
        }
        return null;
    } catch {
        return null;
    }
  });
  const router = useRouter(); 
  const { user } = useAuth(); // Fix: proper hook usage

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

  // AUTO-RESTORE: If user is logged in but no activeOrder in context, find the latest live order
  useEffect(() => {
      if (!user?.phone) return;
      if (activeOrder) return; // Already tracking something

      const restoreActiveOrder = async () => {
          try {
             // We need to import dynamically to avoid circular deps if any
             const { nodeApiService } = await import('../utils/nodeApi');
             const res = await nodeApiService.getOrders(user.phone);
             if (res.success && res.data && res.data.length > 0) {
                 // Sort by date desc
                 const sorted = res.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                 const latest = sorted[0];

                 // Check if it is "Live"
                 // Strict Check: Status is critical
                 if (!latest.status) {
                     console.error("Skipping invalid order (missing status):", latest.id);
                     return;
                 }

                 const status = latest.status.toLowerCase();
                 const deliveryStatus = latest.delivery_status ? latest.delivery_status.toLowerCase() : null;
                 
                 const isLive = !['delivered', 'completed', 'cancelled', 'rejected'].includes(status) && 
                                (!deliveryStatus || !['delivered', 'completed'].includes(deliveryStatus));

                 if (isLive) {
                     console.log('🔄 Auto-Restoring Active Order:', latest.order_number);
                     // Use order_number (GZ...) instead of UUID if available
                     const trackingId = latest.order_number || latest.id || latest.order_id;
                     startTracking(trackingId);
                 }
             }
          } catch(e) {
              console.error("Auto-restore failed:", e);
          }
      };
      
      restoreActiveOrder();
  }, [user?.phone]); // FIXED: Run only on mount/login, NOT when activeOrder changes (prevents zombie loop)

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
    if (activeOrder) {
      const updated = { ...activeOrder, isMinimized: false };
      setActiveOrder(updated);
      localStorage.setItem('activeOrder', JSON.stringify(updated));
      
      // Navigate using GZ Number if available, fallback to ID
      const targetId = activeOrder.orderNumber || activeOrder.orderId;
      router.navigate(`/tracking/${targetId}`);
    }
  }, [activeOrder, router]);

  const closeTracking = useCallback(() => {
    setActiveOrder(null);
  }, []);

  // Real-time Polling for Active Order
  useEffect(() => {
    // Don't poll if no order, or if order is in terminal state
    if (!activeOrder?.orderId || 
        (activeOrder.status && ['delivered', 'cancelled', 'rejected'].includes(activeOrder.status.toLowerCase()))) {
      return;
    }

    let isMounted = true;
    
    const pollOrder = async () => {
        try {
            // Use user phone from context/closure
            const phone = user?.phone;
            
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
                
                // FORCE: Cancellation Priority
                if (internalStatus === 'cancelled' || internalStatus === 'rejected' || deliveryStatus === 'cancelled') {
                    mappedStatus = 'cancelled';
                } else {
                    // Determine effect status
                    let s = internalStatus;
                    
                    // Allow delivery status to override ONLY if it's significant (post-kitchen)
                    if (['picked_up', 'driver_assigned', 'out_for_delivery', 'on_way', 'allotted', 'reached_location', 'delivered', 'completed'].includes(deliveryStatus)) {
                        s = deliveryStatus;
                    }

                    if (s === 'created') mappedStatus = 'created';
                    else if (s === 'placed' || s === 'pending' || s === 'confirmed' || s === 'paid') mappedStatus = 'placed';
                    else if (s === 'searching_rider') mappedStatus = 'searching_rider';
                    else if (s === 'preparing' || s === 'accepted') mappedStatus = 'preparing';
                    else if (s === 'ready' || s === 'ready_for_pickup') mappedStatus = 'ready';
                    else if (s === 'picked_up' || s === 'driver_assigned' || s === 'out_for_delivery') mappedStatus = 'picked_up';
                    else if (s === 'on_way' || s === 'allotted' || s === 'reached_location' || s === 'arrived_at_drop') mappedStatus = 'on_way';
                    else if (s === 'delivered' || s === 'completed') mappedStatus = 'delivered';
                    else {
                        console.log('⚠️ Unknown status:', s);
                    }
                }

                // Extract Vendor Name securely
                // Check order.vendor object OR order.vendor_name flat field
                const vName = order.vendor?.name || 
                              order.vendor_name || 
                              (order.items && order.items[0]?.product_name ? 'Your Kitchen' : 'Pitchammal\'s Kitchen'); // Last resort fallback

                // Extract Vendor Location
                // console.log('📍 Vendor Data from API:', order.vendor);
                const vLocation = order.vendor?.address || '';

                // Extract Delivery Info
                const activeDelivery = order.delivery && order.delivery.length > 0
                    ? order.delivery.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                    : null;

                const extendedOrder: TrackingState = {
                    ...activeOrder,
                    status: mappedStatus,
                    delivery_otp: activeDelivery?.delivery_otp || order.delivery_otp,
                    rider_name: activeDelivery?.rider_name,
                    rider_phone: activeDelivery?.rider_phone,
                    rider_coordinates: activeDelivery?.rider_coordinates,
                    vendorName: vName,
                    vendorLocation: vLocation,
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
            // ZOMBIE KILLER: If order is 404/Not Found, KILL IT immediately from local storage
            if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('No order'))) {
               console.error('💀 Zombie Order Detected (404). Purging tracking state.');
               setActiveOrder(null);
               localStorage.removeItem('activeOrder');
               return;
            }
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
