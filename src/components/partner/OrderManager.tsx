import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RefreshCw, ChefHat, Check, X, Clock, MapPin } from 'lucide-react';
import { nodeApiService } from '../../utils/nodeApi';
import { toast } from 'sonner';

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    special_instructions?: string;
    customizations?: string;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    items: OrderItem[];
    created_at: string;
    delivery_address: any;
    user: {
        name: string;
        phone: string;
    }
}

import { supabase } from '../../utils/supabase/client';

export function OrderManager({ vendorId }: { vendorId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // Don't set loading true on background refreshes to avoid flickering
      if (orders.length === 0) setLoading(true);
      const data = await nodeApiService.getVendorOrders(vendorId, 'placed,confirmed,paid,preparing,ready');
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to Realtime Changes
    const channel = supabase
      .channel('vendor-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendorId}`
        },
        async (payload) => {
          console.log('⚡️ New Order Received:', payload.new);
          toast.success("New Order Received! 🔔");
          
          // Fetch full details (fresh data with items)
          await fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendorId}`
        },
        async (payload) => {
            console.log('⚡️ Order Updated:', payload.new);
            // Refresh to get status changes
            await fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log(`🔌 Realtime Status for vendor ${vendorId}:`, status);
        if (status === 'SUBSCRIBED') {
            toast.success("Connected to Live Updates 🟢");
        }
      });

    return () => {
      console.log('🔌 Disconnecting Realtime...');
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'placed': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">New</Badge>;
          case 'confirmed': 
          case 'paid': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Confirmed</Badge>;
          case 'preparing': return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Preparing</Badge>;
          case 'ready': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Ready</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Incoming Orders</h2>
                <p className="text-sm text-gray-500">View and manage customer orders</p>
            </div>
             <Button variant="outline" onClick={fetchOrders} disabled={loading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
             </Button>
        </div>

        {loading && orders.length === 0 ? (
             <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
             </div>
        ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed rounded-xl">
                 <img src="https://cdn-icons-png.flaticon.com/512/10839/10839485.png" alt="Empty" className="w-24 h-24 opacity-20 mb-4" />
                 <h3 className="text-lg font-medium text-gray-900">No Active Orders</h3>
                 <p className="text-gray-500 text-sm max-w-sm text-center">New orders will appear here automatically. Make sure your kitchen status is "Online".</p>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map(order => (
                    <Card key={order.id} className="overflow-hidden border-l-4 border-l-gutzo-primary">
                        <CardContent className="p-6">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg">#{order.order_number}</h3>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">₹{order.total_amount}</div>
                                    <div className="text-xs text-gray-500 uppercase">{order.user?.name || 'Guest'}</div>
                                </div>
                             </div>

                             <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <div>
                                            <span className="font-medium mr-2">{item.quantity}x</span>
                                            {item.product_name}
                                            {item.customizations && <div className="text-xs text-gray-500 ml-6">{item.customizations}</div>}
                                        </div>
                                    </div>
                                ))}
                             </div>

                             {/* Action Buttons */}
                             <div className="flex justify-end gap-3">
                                {order.status === 'placed' || order.status === 'paid' || order.status === 'confirmed' ? (
                                    <Button 
                                        onClick={async () => {
                                            try {
                                                await nodeApiService.updateVendorOrderStatus(vendorId, order.id, 'preparing');
                                                toast.success("Order marked as preparing");
                                                // Realtime will auto-update the UI, but we can optimistically update too if needed
                                            } catch(e) { toast.error("Failed to update status"); }
                                        }}
                                        className="bg-gutzo-primary hover:bg-gutzo-primary-hover text-white gap-2">
                                        <ChefHat className="w-4 h-4" /> Start Preparing
                                    </Button>
                                ) : order.status === 'preparing' ? (
                                    <Button 
                                        onClick={async () => {
                                            try {
                                                await nodeApiService.updateVendorOrderStatus(vendorId, order.id, 'ready');
                                                toast.success("Order marked as ready");
                                            } catch(e) { toast.error("Failed to update status"); }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                        <Check className="w-4 h-4" /> Mark Ready
                                    </Button>
                                ) : null}
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}
