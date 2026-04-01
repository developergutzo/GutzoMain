import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RefreshCw, ChefHat, Check, X, Clock, MapPin, ChevronDown, ChevronRight, ShoppingBag } from 'lucide-react';
import { nodeApiService } from '../../utils/nodeApi';
import { supabase } from '../../utils/supabase/client';
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
    };
    delivery_status?: string;
    pickup_otp?: string;
    delivery_partner_details?: {
        provider: string;
        pickup_otp?: string;
        drop_otp?: string;
        rider_name?: string;
        rider_phone?: string;
        flash_order_id?: string;
    };
    delivery?: any; // Added for relation access
}



export function OrderManager({ vendorId, isDashboard = false }: { vendorId: string, isDashboard?: boolean }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'active' | 'history'>(isDashboard ? 'active' : 'active');
    const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Preparing' | 'Ready'>('All');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'Today': true });

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };

    // Audio handler
    const playNotification = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => {
                console.error("Audio play error:", e);
                toast.error("Enable audio permissions");
            });
        } catch (e) { console.error("Audio init error", e); }
    };

    const ordersRef = useRef<Order[]>([]); // Track previous orders to detect *new* ones during polling
    const fetchOrders = async () => {
        try {
            // Don't set loading true on background refreshes to avoid flickering
            if (orders.length === 0) setLoading(true);

            // EXCLUDE: searching_rider, placed, paid (Wait for ACCEPTED/confirmed)
            const statuses = tab === 'active'
                ? 'confirmed,preparing,ready,handover_pending,allotted,accepted,arrived,reached_location'
                : 'collected,picked_up,on_way,customer_door_step,arrived_at_drop,delivered,completed,cancelled,rejected';

            const response = await nodeApiService.getVendorOrders(vendorId, statuses);
            // console.log('📦 Orders API Response:', response);

            const newOrders = response?.data?.orders || [];

            // Check for NEW orders that are 'confirmed' or 'paid' compared to previous fetch
            // This is the fallback/primary sound trigger if Realtime is flaky
            if (ordersRef.current.length > 0) {
                const previousIds = new Set(ordersRef.current.map(o => o.id));
                const hasNewConfirmedOrder = newOrders.some((o: Order) =>
                    !previousIds.has(o.id) && ['confirmed'].includes(o.status)
                );

                if (hasNewConfirmedOrder) {
                    console.log("🔔 New confirmed order detected via Polling/Fetch - Playing Sound");
                    playNotification();
                    toast.success("New Order Received! 🔔");
                }
            }

            ordersRef.current = newOrders;
            setOrders(newOrders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // A. REALTIME LISTENER
        const channel = supabase.channel('delivery-updates')
            .on('broadcast', { event: 'status-update' }, (payload: any) => {
                const data = payload.payload;
                console.log('📡 Realtime Order Broadcast Received:', data);

                if (data.status === 'ARRIVED') {
                    toast.info(`Driver arrived for #${data.order_number}!`, {
                        description: `Handover OTP: ${data.pickup_otp || '---'}`,
                        duration: 10000,
                    });
                }

                // Simple refresh for now to avoid complex merge
                fetchOrders();
            })
            .subscribe();

        // Initial fetch
        fetchOrders();

        // B. POLBACK: Poll every 60 seconds as a reliable fallback
        // Increased interval since we have realtime
        let pollInterval: any = null;
        if (tab === 'active') {
            pollInterval = setInterval(() => {
                console.log('🔄 Polling for new orders (Fallback)...');
                fetchOrders();
            }, 60000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, [vendorId, tab]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'placed': 
            case 'confirmed':
            case 'paid': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] font-medium">New</span>;
            case 'preparing': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#185FA5] font-medium">Preparing</span>;
            case 'ready': 
            case 'handover_pending': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56] font-medium">Ready</span>;
            default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {!isDashboard && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-[18px] font-medium text-gray-900">Incoming orders</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {tab === 'active' ? 'View and manage customer orders' : 'View all completed and cancelled orders'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-stretch sm:self-auto">
                        <Button
                            variant={tab === 'active' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTab('active')}
                            className={`flex-1 sm:flex-none ${tab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            style={tab === 'active' ? { backgroundColor: 'white' } : {}}
                        >
                            Active
                        </Button>
                        <Button
                            variant={tab === 'history' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTab('history')}
                            className={`flex-1 sm:flex-none ${tab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            style={tab === 'history' ? { backgroundColor: 'white' } : {}}
                        >
                            History
                        </Button>
                        <div className="w-px h-4 bg-gray-300 mx-1 hidden sm:block"></div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={fetchOrders} 
                            disabled={loading} 
                            className="flex items-center gap-2 text-gray-500 font-normal h-8 px-3 border-[0.5px] border-gray-200 rounded-lg hover:bg-gray-50 transition-all ml-2"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                    </div>
                </div>
            )}

            {isDashboard && (
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-medium text-gray-900">Incoming orders</h2>
                            {orders.length > 0 && (
                                <span className="text-[10px] bg-gutzo-brand-light text-gutzo-brand px-2 py-0.5 rounded-full border border-gutzo-brand-light font-medium">
                                    {orders.filter(o => ['placed', 'confirmed', 'paid', 'preparing', 'ready'].includes(o.status)).length} active
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            {(['All', 'New', 'Preparing', 'Ready'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${statusFilter === f
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 active:scale-95'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {loading && orders.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-xl section-spacing">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{tab === 'active' ? 'No active orders' : 'No order history'}</h3>
                    <p className="text-gray-400 text-sm max-w-sm text-center mt-1">
                        {tab === 'active' ? 'New orders will appear here automatically' : 'You haven\'t completed or cancelled any orders yet.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(
                        orders.reduce((groups, order) => {
                            const date = new Date(order.created_at);
                            const today = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);

                            let key = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                            if (date.toDateString() === today.toDateString()) {
                                key = 'Today';
                            } else if (date.toDateString() === yesterday.toDateString()) {
                                key = 'Yesterday';
                            }

                            if (!groups[key]) {
                                groups[key] = [];
                            }
                            groups[key].push(order);
                            return groups;
                        }, {} as Record<string, Order[]>)
                    ).sort((a, b) => {
                        // Sort keys: Today first, then Yesterday, then others by date descending
                        if (a[0] === 'Today') return -1;
                        if (b[0] === 'Today') return 1;
                        if (a[0] === 'Yesterday') return -1;
                        if (b[0] === 'Yesterday') return 1;
                        return new Date(b[1][0].created_at).getTime() - new Date(a[1][0].created_at).getTime();
                    }).map(([dateLabel, groupOrders]) => {
                        const isExpanded = expandedGroups[dateLabel] ?? (dateLabel === 'Today');

                        return (
                            <div key={dateLabel} className="space-y-4">
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors select-none"
                                    onClick={() => toggleGroup(dateLabel)}
                                >
                                    <button className="p-1 rounded-full hover:bg-gray-200">
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                    </button>
                                    <h3 className="text-lg font-bold text-gray-800">{dateLabel}</h3>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <span className="text-xs text-gray-400 font-medium">{groupOrders.length} orders</span>
                                </div>

                {isExpanded && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {groupOrders
                                            .filter(order => {
                                                if (statusFilter === 'All') return true;
                                                const newStatuses = ['placed', 'confirmed', 'paid', 'accepted'];
                                                if (statusFilter === 'New') return newStatuses.includes(order.status);
                                                if (statusFilter === 'Preparing') return order.status === 'preparing';
                                                if (statusFilter === 'Ready') return order.status === 'ready';
                                                return true;
                                            })
                                            .map(order => {
                                                const getStatusColor = (status: string) => {
                                                    if (['placed', 'confirmed', 'paid', 'accepted'].includes(status)) return 'border-l-[#BA7517]';
                                                    if (status === 'preparing') return 'border-l-[#185FA5]';
                                                    if (status === 'ready') return 'border-l-[#1D9E75]';
                                                    return 'border-l-gray-300';
                                                };

                                                return (
                                                    <Card key={order.id} className={`overflow-hidden border-l-[4px] shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col h-full bg-white ${getStatusColor(order.status)}`}>
                                                        <CardContent className="p-6 flex flex-col h-full">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h3 className="font-medium text-[14px] text-gray-900">Order #{order.order_number}</h3>
                                                                        <span className="text-[11px] text-gray-400 font-normal">
                                                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex flex-col items-end gap-2">
                                                                    {getStatusBadge(order.status)}
                                                                    <div className="font-medium text-[16px] text-gray-900">₹{order.total_amount}</div>
                                                                    <div className="text-xs text-gray-500 uppercase">{order.user?.name || 'Guest'}</div>
                                                                    {order.delivery_status && (
                                                                        <div className="mt-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full inline-block">
                                                                            {order.delivery_status.replace('_', ' ')}
                                                                        </div>
                                                                    )}
                                                                    {/* Show Shadowfax Request Status / Details */}
                                                                    {(order.delivery_partner_details || (order.delivery && (Array.isArray(order.delivery) ? order.delivery[0] : order.delivery))) && (
                                                                        <div className="mt-2 text-right space-y-1">
                                                                            <div className="text-xs text-xs font-semibold text-gray-500">
                                                                                via {(order.delivery_partner_details?.provider) || 'Shadowfax'}
                                                                            </div>
                                                                            {(order.delivery && (Array.isArray(order.delivery) ? order.delivery[0]?.external_order_id : order.delivery?.external_order_id)) && (
                                                                                <div className="text-[10px] text-blue-600 font-mono mb-1">
                                                                                    SFX #{(Array.isArray(order.delivery) ? order.delivery[0]?.external_order_id : order.delivery?.external_order_id)}
                                                                                </div>
                                                                            )}
                                                                            {(order.delivery_partner_details?.pickup_otp || (order.delivery && (Array.isArray(order.delivery) ? order.delivery[0]?.pickup_otp : order.delivery?.pickup_otp))) && (
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Pickup OTP</span>
                                                                                    <div className="font-mono font-bold text-xl text-gutzo-primary bg-green-50 px-3 py-1 rounded-md border border-green-200 shadow-sm">
                                                                                        {order.delivery_partner_details?.pickup_otp || (order.delivery && (Array.isArray(order.delivery) ? order.delivery[0]?.pickup_otp : order.delivery?.pickup_otp))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="bg-gray-50/80 p-5 rounded-xl mb-6 space-y-3">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between text-sm">
                                                                        <div>
                                                                            <span className="font-medium text-gray-900 mr-2">{item.quantity}x</span>
                                                                            <span className="text-gray-700">{item.product_name}</span>
                                                                            {item.customizations && <div className="text-xs text-gray-500 ml-6 mt-1">{item.customizations}</div>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center justify-between mt-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-normal text-gray-400 uppercase tracking-tight">Total Amount</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg font-medium text-gray-900">₹{order.total_amount}</span>
                                                                        <span className="text-xs text-gray-400">• {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                                                                    </div>
                                                                </div>
                                                                {/* Action Buttons */}
                                                                <div className="flex justify-end gap-3">
                                                                    {(() => {
                                                                        const delObj = Array.isArray(order.delivery) ? order.delivery[0] : order.delivery;
                                                                        const sfStatus = delObj?.status;

                                                                        // If status is 'searching_rider' (placed in our system), or if it's 'accepted' in Shadowfax
                                                                        if (['placed', 'paid', 'confirmed', 'searching_rider'].includes(order.status)) {
                                                                            const label = sfStatus === 'accepted' ? 'Accept Order' : 'Start Preparing';
                                                                            return (
                                                                                <Button
                                                                                    onClick={async (e) => {
                                                                                        e.stopPropagation();
                                                                                        try {
                                                                                            await nodeApiService.updateVendorOrderStatus(vendorId, order.id, 'preparing');
                                                                                            toast.success(`Order marked as ${label.toLowerCase()}`);
                                                                                            fetchOrders();
                                                                                        } catch (e) { toast.error("Failed to update status"); }
                                                                                    }}
                                                                                    className="bg-gutzo-brand hover:bg-gutzo-brand-hover active:scale-95 transition-all duration-200 text-white gap-2 font-medium px-6 h-10 shadow-sm rounded-lg flex items-center justify-center">
                                                                                    <ChefHat className="w-4 h-4" /> {label}
                                                                                </Button>
                                                                            );
                                                                        } else if (order.status === 'preparing') {
                                                                            // Show "Food Prepared" or "Ready"
                                                                            return (
                                                                                <div className="flex gap-2">
                                                                                    <Button
                                                                                        onClick={async (e) => {
                                                                                            e.stopPropagation();
                                                                                            try {
                                                                                                await nodeApiService.updateVendorOrderStatus(vendorId, order.id, 'ready');
                                                                                                toast.success("Order marked as ready for delivery");
                                                                                                fetchOrders();
                                                                                            } catch (e) { toast.error("Failed to update status"); }
                                                                                        }}
                                                                                        className="bg-[#185FA5] hover:bg-[#0C447C] text-white text-[11px] font-medium h-8 px-4 rounded-lg">
                                                                                        Mark ready
                                                                                    </Button>
                                                                                </div>
                                                                            );
                                                                        } else if (order.status === 'ready' && sfStatus === 'reached_location') {
                                                                            // Driver arrived, waiting for handover/OTP
                                                                            return (
                                                                                <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                                                                                    <span className="text-yellow-700 font-bold text-sm">Driver at Location - Handover Food</span>
                                                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
