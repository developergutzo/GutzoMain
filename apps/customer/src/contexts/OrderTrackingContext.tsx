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
  trackingData?: {
    sfx_order_id?: number;
    tracking_url?: string;
    [key: string]: any;
  };
}

interface OrderTrackingContextType {
  activeOrder: TrackingState | null;
  activeOrders: TrackingState[];
  startTracking: (orderId: string, initialData?: Partial<TrackingState>) => void;
  minimizeOrder: () => void;
  maximizeOrder: () => void;
  closeTracking: () => void;
  clearActiveOrder: () => void;
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

  const [activeOrders, setActiveOrders] = useState<TrackingState[]>([]);

  const router = useRouter();
  const { user } = useAuth(); // Fix: proper hook usage

  // Hardcoded locations for demo
  const storeLocation = { lat: 12.9716, lng: 77.5946 };
  const userLocation = { lat: 12.9516, lng: 77.6046 };

  // Persist to localStorage
  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('activeOrder', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('activeOrder');
    }
  }, [activeOrder]);

  // AUTO-RESTORE: Find all live orders
  useEffect(() => {
    if (!user?.phone) return;

    const fetchLiveOrders = async () => {
      try {
        const { nodeApiService } = await import('../utils/nodeApi');
        const res = await nodeApiService.getOrders(user.phone);
        if (res.success && res.data && res.data.length > 0) {
          // Sort by date desc
          const sorted = res.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          const liveOrders: any[] = [];

          for (const order of sorted) {
             if (!order.status) continue;
             const status = order.status.toLowerCase();
             const deliveryStatus = order.delivery_status ? order.delivery_status.toLowerCase() : null;
             const paymentStatus = order.payment_status ? order.payment_status.toLowerCase() : null;

             const isUnpaid = status === 'created' || paymentStatus === 'failed' || paymentStatus === 'pending';
             const isLive = !isUnpaid && 
               !['delivered', 'completed', 'cancelled', 'rejected'].includes(status) &&
               (!deliveryStatus || !['delivered', 'completed'].includes(deliveryStatus));

             if (isLive) {
                 liveOrders.push(order);
             }
          }

          // Convert backend orders to TrackingState
          if (liveOrders.length > 0) {
              const trackingStates: TrackingState[] = liveOrders.map(order => {
                  const trackingId = order.order_number || order.id || order.order_id;
                  const vName = order.vendor?.name || order.vendor_name || 'Gutzo Kitchen';
                  const vLocation = order.vendor?.address || '';
                  
                  return {
                      orderId: trackingId,
                      status: order.status as OrderStatus || 'placed',
                      startTime: new Date(order.created_at).getTime(),
                      isMinimized: true,
                      vendorName: vName,
                      vendorLocation: vLocation,
                      orderNumber: order.order_number
                  };
              });

              setActiveOrders(trackingStates);

              // Set the most recent as the primary activeOrder if none is explicitly focused
              if (!activeOrder && trackingStates.length > 0) {
                  startTracking(trackingStates[0].orderId!);
              }
          } else {
              setActiveOrders([]);
          }
        }
      } catch (e) {
        console.error("Auto-restore multiple orders failed:", e);
      }
    };

    // Run immediately and then poll every 10s for new orders joining the array
    fetchLiveOrders();
    const interval = setInterval(fetchLiveOrders, 10000);
    return () => clearInterval(interval);
  }, [user?.phone, activeOrder]);

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
    localStorage.removeItem('activeOrder');
  }, []);

  const clearActiveOrder = useCallback(() => {
    setActiveOrder(null);
    localStorage.removeItem('activeOrder');
  }, []);

  // Real-time Polling for Active Order
  useEffect(() => {
    // Don't poll if no order, or if order is in terminal state
    if (!activeOrder?.orderId ||
      (activeOrder.status && ['delivered', 'cancelled', 'rejected'].includes(activeOrder.status.toLowerCase()))) {
      return;
    }

    let isMounted = true;

    // Helper: Define Status Priority to prevent downgrading (same as OrderTrackingPage)
    const getStatusPriority = (s: string | undefined | null) => {
      if (!s) return 0;
      const status = s.toLowerCase();
      /*
        Priority Hierarchy:
        0: unknown
        1: created, placed
        2: searching_rider, preparing
        3: allotted, driver_assigned, rider_assigned
        4: arrived, reached_location
        5: picked_up, on_way
        6: delivered, completed
        7: cancelled, rejected
      */
      if (['created', 'placed'].includes(status)) return 1;
      if (['searching_rider', 'preparing', 'accepted'].includes(status)) return 2;
      if (['allotted', 'driver_assigned', 'rider_assigned'].includes(status)) return 3;
      if (['arrived', 'reached_location', 'on_way'].includes(status)) return 4;
      if (['picked_up', 'out_for_delivery', 'arrived_at_drop'].includes(status)) return 5;
      if (['delivered', 'completed'].includes(status)) return 6;
      if (['cancelled', 'rejected'].includes(status)) return 7;
      return 0;
    };

    const pollOrder = async () => {
      try {
        const phone = user?.phone;
        if (!phone) return;

        // console.log('Poll Order running...', { phone, orderId: activeOrder.orderId });

        const { nodeApiService } = await import('../utils/nodeApi');

        // 1. Fetch DB Order
        const response = await nodeApiService.getOrder(phone, activeOrder.orderId!);

        if (!isMounted) return;

        const order = response.data || response;

        if (order && order.id) {
          // 1. Extract DB Delivery
          // Fix: Create a copy to avoid mutation
          const activeDelivery = order.delivery && Array.isArray(order.delivery) && order.delivery.length > 0
            ? [...order.delivery].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : null;


          // 2. Use DB Delivery Status Only (No Live Shadowfax Tracking)
          // OPTIMIZATION: Context doesn't need live Shadowfax data for floating bar
          // Only OrderTrackingPage polls Shadowfax when map is visible
          const dbStatus = activeDelivery?.status;
          const isCancelled = dbStatus === 'cancelled' || order.status === 'rejected' || order.status === 'cancelled';

          // Use DB delivery data directly (no merging with live tracking)
          const mergedDelivery = {
            ...activeDelivery,
            status: isCancelled ? 'cancelled' : dbStatus
          };



          // 3. Derive Display Status (DB-only, no live tracking)
          let displayStatus: OrderStatus = 'placed';

          const rawStatus = (order.status || '').toLowerCase();
          const deliveryStatus = mergedDelivery.status ? mergedDelivery.status.toLowerCase() : (order.delivery_status || '');

          if (isCancelled || rawStatus === 'rejected' || rawStatus === 'cancelled' || deliveryStatus === 'cancelled') {
            displayStatus = 'cancelled';
          } else if (rawStatus === 'searching_rider' || deliveryStatus === 'searching_rider' || deliveryStatus === 'created') {
            displayStatus = 'searching_rider';
          } else if (['picked_up', 'driver_assigned', 'rider_assigned', 'allotted', 'out_for_delivery', 'on_way', 'reached_location', 'delivered', 'completed'].includes(deliveryStatus)) {
            // Strict Mapping to OrderStatus type
            if (['driver_assigned', 'rider_assigned', 'allotted'].includes(deliveryStatus)) {
              displayStatus = 'ready'; // Map to 'ready' (Food Ready, Waiting for Pickup)
            }
            else if (['out_for_delivery', 'picked_up'].includes(deliveryStatus)) {
              displayStatus = 'picked_up';
            }
            else if (['on_way', 'reached_location', 'arrived_at_drop'].includes(deliveryStatus)) {
              displayStatus = 'on_way';
            }
            else if (['delivered', 'completed'].includes(deliveryStatus)) {
              displayStatus = 'delivered';
            }
            else {
              displayStatus = 'picked_up'; // Fallback
            }
          } else {
            // Standard Order Status Fallback
            if (rawStatus === 'placed' || rawStatus === 'confirmed' || rawStatus === 'paid') {
              displayStatus = 'placed';
            }
            else if (rawStatus === 'preparing' || rawStatus === 'accepted') displayStatus = 'preparing';
            else if (rawStatus === 'ready' || rawStatus === 'ready_for_pickup') displayStatus = 'ready';
            else displayStatus = (rawStatus as OrderStatus) || 'preparing';
          }

          const vName = order.vendor?.name || order.vendor_name || 'Gutzo Kitchen';
          const vLocation = order.vendor?.address || '';

          const extendedOrder: TrackingState = {
            ...activeOrder,
            status: displayStatus,
            delivery_otp: mergedDelivery?.delivery_otp || order.delivery_otp,
            rider_name: mergedDelivery?.rider_name,
            rider_phone: mergedDelivery?.rider_phone,
            rider_coordinates: mergedDelivery?.rider_coordinates,
            vendorName: vName,
            vendorLocation: vLocation,
            orderNumber: order.order_number
          };

          setActiveOrder(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(extendedOrder)) {
              console.log('🔄 Context Tracking Update:', extendedOrder.status);
              // Auto-minimize on cancel/delivered?
              return extendedOrder;
            }
            return prev;
          });
        }
      } catch (err: any) {
        console.error("Tracking Poll Error:", err);
        // ZOMBIE KILLER
        if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
          setActiveOrder(null);
          localStorage.removeItem('activeOrder');
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
  }, [activeOrder?.orderId, user?.phone]);

  return (
    <OrderTrackingContext.Provider value={{
      activeOrder,
      activeOrders,
      startTracking,
      minimizeOrder,
      maximizeOrder,
      closeTracking,
      clearActiveOrder,
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
