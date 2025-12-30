import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouter } from '../components/Router'; // Assuming you use this or react-router directly

type OrderStatus = 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered';

interface TrackingState {
  orderId: string | null;
  status: OrderStatus;
  startTime: number | null;
  isMinimized: boolean;
}

interface OrderTrackingContextType {
  activeOrder: TrackingState | null;
  startTracking: (orderId: string) => void;
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

  const startTracking = useCallback((orderId: string) => {
    setActiveOrder({
      orderId,
      status: 'preparing',
      startTime: Date.now(),
      isMinimized: false
    });
  }, []);

  const minimizeOrder = useCallback(() => {
    if (activeOrder) {
      const updated = { ...activeOrder, isMinimized: true };
      setActiveOrder(updated);
      // Force sync save to prevent race condition on nav
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

  // Simulation Logic
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;

    // Sequence with delays
    const timeline = [
        { state: 'preparing', delay: 4000 },
        { state: 'ready', delay: 8000 }, 
        { state: 'picked_up', delay: 12000 }, 
        { state: 'on_way', delay: 20000 }, 
        { state: 'delivered', delay: 35000 }
    ];

    // Find next step based on elapsed time? 
    // Or just simple timeouts that check if we are still active.
    // Since we need to persist progress even if component re-renders context (unlikely but safe),
    // let's use a robust approach relative to startTime.
    
    // Actually, simple timeout chain is fine as long as we don't reset state on navigation. 
    // But since this useEffect depends on `activeOrder`, if activeOrder changes (e.g. isMinimized), it might re-run?
    // No, we should use a separate effect for simulation that doesn't depend on isMinimized.
    
    // Better: Only start this once when orderId changes.
  }, [activeOrder?.orderId]); // Only restart if orderId changes

  // Actually, to keep it simple and robust for the demo:
  // We'll use a `useEffect` that listens to `activeOrder.orderId` and sets up the whole sequence.
  useEffect(() => {
    if (!activeOrder?.orderId) return;

    console.log("Starting Tracking Simulation for", activeOrder.orderId);

    const timeline = [
        { state: 'preparing', delay: 0 },
        { state: 'ready', delay: 30000 },       // 30s
        { state: 'picked_up', delay: 60000 },    // 1 min
        { state: 'on_way', delay: 120000 },      // 2 mins
        { state: 'delivered', delay: 300000 }    // 5 mins
    ];

    let timeouts: NodeJS.Timeout[] = [];

    timeline.forEach((item) => {
        const t = setTimeout(() => {
            setActiveOrder(prev => {
                if (!prev || prev.orderId !== activeOrder.orderId) return prev;
                return { ...prev, status: item.state as OrderStatus };
            });
        }, item.delay);
        timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
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
