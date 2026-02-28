import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RefreshCw, ChefHat, Check, X, Clock, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
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



export function OrderManager({ vendorId }: { vendorId: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
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

            // Show only orders where payment is successful (confirmed/paid) OR newly placed
            const response = await nodeApiService.getVendorOrders(vendorId, 'placed,confirmed,paid,preparing,ready');
            // console.log('📦 Orders API Response:', response);

            const newOrders = response?.data?.orders || [];

            // Check for NEW orders that are 'confirmed' or 'paid' compared to previous fetch
            // This is the fallback/primary sound trigger if Realtime is flaky
            if (ordersRef.current.length > 0) {
                const previousIds = new Set(ordersRef.current.map(o => o.id));
                const hasNewConfirmedOrder = newOrders.some((o: Order) =>
                    !previousIds.has(o.id) && ['placed', 'confirmed', 'paid'].includes(o.status)
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
        // Initial fetch
        fetchOrders();

        // POLBACK: Poll every 30 seconds as a reliable fallback
        const pollInterval = setInterval(() => {
            console.log('🔄 Polling for new orders...');
            fetchOrders();
        }, 30000);

        return () => {
            console.log('🔌 Disconnecting Polling...');
            clearInterval(pollInterval);
        };
    }, [vendorId]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'placed': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">New</Badge>;
            case 'confirmed':
            case 'paid': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">New</Badge>;
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
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders} disabled={loading} className="gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {loading && orders.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed rounded-xl">
                    <img src="https://cdn-icons-png.flaticon.com/512/10839/10839485.png" alt="Empty" className="w-24 h-24 opacity-20 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Active Orders</h3>
                    <p className="text-gray-500 text-sm max-w-sm text-center">New orders will appear here automatically. Make sure your kitchen status is "Online".</p>
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
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                        {groupOrders.map(order => (
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
                                                            <>
                                                                <Button
                                                                    onClick={async (e) => {
                                                                        e.stopPropagation();
                                                                        try {
                                                                            // 1. Update status to 'preparing'
                                                                            await nodeApiService.updateVendorOrderStatus(vendorId, order.id, 'preparing');
                                                                            toast.success("Order marked as preparing");

                                                                            fetchOrders();
                                                                        } catch (e) { toast.error("Failed to update status"); }
                                                                    }}
                                                                    className="bg-gutzo-primary hover:bg-gutzo-primary-hover text-white gap-2">
                                                                    <ChefHat className="w-4 h-4" /> Start Preparing
                                                                </Button>
                                                            </>
                                                        ) : order.status === 'preparing' ? (
                                                            <Button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        await nodeApiService.updateVendorOrderStatus(vendorId, order.id, 'ready');
                                                                        toast.success("Order marked as ready");
                                                                        fetchOrders();
                                                                    } catch (e) { toast.error("Failed to update status"); }
                                                                }}
                                                                className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                                                <Check className="w-4 h-4" /> Food Prepared
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
                    })}
                </div>
            )}
        </div>
    );
}
