import React, { useState, useEffect, useRef } from 'react';
import { Package, RefreshCw, Calendar, Clock, MapPin, Phone, MessageCircle, AlertCircle, CheckCircle, XCircle, Pause, Play, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './common/ImageWithFallback';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { nodeApiService as apiService } from '../utils/nodeApi';

// Types for orders
export interface InstantOrder {
  id: string;
  vendorName: string;
  vendorPhone: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDelivery?: Date;
  whatsappOrderId?: string;
}

export interface SubscriptionOrder {
  id: string;
  subscriptionId: string;
  vendorName: string;
  vendorPhone: string;
  productName: string;
  productImage: string;
  mealSlots: string[];
  customTimes: Record<string, string>;
  frequency: 'Daily' | 'Weekly' | 'Custom';
  quantity: number;
  duration: string;
  totalPrice: number;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  startDate: Date;
  endDate?: Date;
  nextDelivery?: Date;
  deliveriesCompleted: number;
  totalDeliveries: number;
  paymentId: string;
  weeklyDays?: string[];
  customDates?: Date[];
}

interface OrdersPanelProps {
  className?: string;
  onViewOrderDetails?: (orderData: any) => void;
  recentOrderData?: {
    paymentDetails: {
      paymentId: string;
      subscriptionId: string;
      method: string;
      amount: number;
      date: string;
    };
    orderSummary: {
      items: number;
      vendor: string;
      orderType: string;
      quantity: string;
      estimatedDelivery: string;
    };
  } | null;
  realOrders?: any[];
  isLoading?: boolean;
}


export function OrdersPanel({ className = "", onViewOrderDetails, recentOrderData, realOrders, isLoading }: OrdersPanelProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const highlightedOrderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.phone) {
      fetchOrders(user.phone);
    }
  }, [user, recentOrderData]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrders = async (phone: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // console.log('Fetching orders for:', phone);
      const resp = await apiService.getOrders(phone);
      // console.log('Orders response:', resp);
      // API returns { success: true, data: [...], pagination: ... }
      // The orders list is in resp.data, not resp.orders
      setOrders(resp.data || []);
      // Debug: log order statuses
      if (resp.data && resp.data.length > 0) {
        console.log('Order statuses:', resp.data.map((o: any) => ({ id: o.id, status: o.status })));
      }
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      const msg = err?.message || 'Failed to load orders';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Set highlighted order and clear it after a delay (optional, can be re-added if needed)

  // Removed localStorage logic. Orders are now fetched from backend.


  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-16 text-red-600">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Error Loading Orders</h3>
          <p>{errorMsg}</p>
          <Button onClick={() => user?.phone && fetchOrders(user.phone)} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 text-sm mb-6">
            Your order history will appear here once you place your first order.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              🛒 Order More Delicious Meals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>
      {loading ? (
        <div>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const expanded = expandedOrderIds.has(order.id);
            return (
              <div
                key={order.id}
                className={`border rounded-xl p-4 bg-white shadow transition-all duration-200 cursor-pointer select-none ${order.status === 'delivered'
                  ? 'border-gutzo-primary bg-gutzo-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={e => {
                  // Prevent toggle if the button is clicked
                  if ((e.target as HTMLElement).closest('button')) return;
                  setExpandedOrderIds(prev => {
                    const next = new Set(prev);
                    if (expanded) {
                      next.delete(order.id);
                    } else {
                      next.add(order.id);
                    }
                    return next;
                  });
                }}
              >
                <div className="flex flex-col gap-4">
                  {/* Top Section: Icon + Main Info + Status */}
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl flex-shrink-0 ${order.status === 'delivered'
                      ? 'bg-gutzo-primary/10 text-gutzo-primary'
                      : 'bg-gray-100 text-gray-500'
                      }`}>
                      <Package className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Flex Row for ID and Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 break-all">
                          #{order.order_number || order.id.slice(0, 8)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide whitespace-nowrap ${order.status === 'delivered' || order.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'cancelled' || order.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'preparing' || order.status === 'arrived_at_drop' || order.status === 'on_way'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                          {order.status === 'confirmed' ? 'Waiting for acceptance' :
                            order.status === 'arrived_at_drop' ? 'Valet at Doorstep' :
                              order.status === 'reached_location' ? 'Rider at Restaurant' :
                                order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Vendor Name */}
                      <h4 className="font-bold text-gray-900 text-base mb-1 truncate">
                        {order.vendor?.name || order.vendor_name || order.vendorName || 'Unknown Vendor'}
                      </h4>

                      {/* Meta Details */}
                      <div className="text-sm text-gray-500 space-y-0.5 mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="font-semibold text-gray-900 text-base mt-2">
                          ₹{order.total_amount !== undefined && order.total_amount !== null ? Number(order.total_amount).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expanded && (
                    <div className="border-t border-dashed pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Items List */}
                      <div className="space-y-2 mb-3">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">
                              <span className="text-xs text-gray-500 mr-2">{item.quantity}x</span>
                              {item.product_name}
                            </span>
                            <span className="text-gray-900">₹{item.total_price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Breakdown */}
                      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1.5">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                        </div>
                        {order.delivery_fee > 0 && (
                          <div className="flex justify-between">
                            <span>Delivery</span>
                            <span>₹{Number(order.delivery_fee).toFixed(2)}</span>
                          </div>
                        )}
                        {order.platform_fee > 0 && (
                          <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span>₹{Number(order.platform_fee).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-1.5 mt-1.5 font-bold text-gray-900 text-sm">
                          <span>Grand Total</span>
                          <span>₹{Number(order.total_amount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom: Action Button */}
                  <div className="pt-2 sm:pt-0 flex gap-2">
                    <Button
                      variant={expanded ? "ghost" : "outline"}
                      size="sm"
                      className={`flex-1 h-10 text-sm font-medium transition-colors ${expanded
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedOrderIds(prev => {
                          const next = new Set(prev);
                          if (expanded) next.delete(order.id);
                          else next.add(order.id);
                          return next;
                        });
                      }}
                    >
                      {expanded ? 'Collapse' : 'Details'}
                    </Button>

                    {(order.status === 'delivered' || order.status === 'completed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            // Fetch invoice as PDF with proper auth headers
                            const url = `${apiService.baseUrl}/api/orders/${order.id}/invoice?format=pdf`;
                            const { data: { session } } = await (await import('../utils/supabase/client')).supabase.auth.getSession();

                            const headers: any = {
                              'x-user-phone': user?.phone || '',
                            };
                            if (session?.access_token) {
                              headers['Authorization'] = `Bearer ${session.access_token}`;
                            }

                            const response = await fetch(url, { headers });
                            if (!response.ok) throw new Error('Failed to fetch invoice');

                            // Download logic for PDF
                            const blob = await response.blob();
                            const blobUrl = URL.createObjectURL(blob);

                            const a = document.createElement('a');
                            a.href = blobUrl;
                            a.download = `Invoice_${order.order_number || order.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);

                            // Clean up blob URL after a short delay
                            setTimeout(() => { URL.revokeObjectURL(blobUrl) }, 1000);
                          } catch (err) {
                            console.error('Invoice error:', err);
                            toast.error('Failed to open invoice');
                          }
                        }}
                      >
                        <FileText className="w-4 h-4" />
                        Invoice
                      </Button>
                    )}

                    {!['cancelled', 'rejected', 'delivered', 'completed'].includes(order.status) && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 h-10 font-medium shadow-sm bg-gutzo-primary hover:bg-gutzo-primary-hover text-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewOrderDetails) {
                            onViewOrderDetails(order); // Keep existing hook just in case
                          }
                          // Navigate to tracking
                          window.location.href = `/tracking/${order.order_number}`;
                        }}
                      >
                        Track Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )
      }
    </div >
  );
}

// <Button
//   variant="outline"
//   size="sm"
//   className="border-gutzo-primary text-gutzo-primary hover:bg-gutzo-primary/10"
//   onClick={() => {/* TODO: Contact vendor logic */}}
// >
//   <MessageCircle className="h-4 w-4 mr-1" />
//   <span className="text-xs">Contact Vendor</span>
// </Button>