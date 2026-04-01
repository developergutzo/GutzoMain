import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Download, FileText, IndianRupee, PieChart, ShoppingBag, Loader2 } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";

export function GSTReportManager({ vendorId, initialData }: { vendorId: string, initialData?: any }) {
    const [dateRange, setDateRange] = useState('this_month');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [hoveredPill, setHoveredPill] = useState<string | null>(null);

    const fetchGSTReport = async () => {
        setLoading(true);
        try {
            let from = '', to = '';
            const now = new Date();
            
            if (dateRange === 'this_month') {
                from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                to = now.toISOString();
            } else if (dateRange === 'last_month') {
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
                to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
            } else if (dateRange === 'this_quarter') {
                const quarter = Math.floor(now.getMonth() / 3);
                from = new Date(now.getFullYear(), quarter * 3, 1).toISOString();
                to = now.toISOString();
            } else if (dateRange === 'custom') {
                if (!customFrom || !customTo) {
                    toast.error('Please select both from and to dates');
                    return;
                }
                from = new Date(customFrom).toISOString();
                to = new Date(customTo).toISOString();
            }

            const data = await apiService.getVendorGSTReport(vendorId, from, to);
            setOrders(data.orders || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch GST report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateRange !== 'custom') {
            fetchGSTReport();
        }
    }, [dateRange]);

    const totalSales = orders.reduce((sum, o) => sum + o.item_total, 0);
    const totalGst = orders.reduce((sum, o) => sum + o.gst_on_items, 0);
    const taxableAmount = totalSales - totalGst;

    const downloadReport = async (format: 'pdf' | 'csv') => {
        toast.info(`Preparing ${format.toUpperCase()} report...`);
        // Mock download logic
        setTimeout(() => toast.success('Report downloaded successfully'), 1500);
    };

    const filterOptions = [
        { id: 'this_month', label: 'This month' },
        { id: 'last_month', label: 'Last month' },
        { id: 'this_quarter', label: 'This quarter' },
        { id: 'custom', label: 'Custom range' }
    ];

    const getPillStyle = (id: string) => {
        const isActive = dateRange === id;
        const isHovered = hoveredPill === id;
        return {
            backgroundColor: isActive ? '#1BA672' : (isHovered ? '#F3F4F6' : '#FFFFFF'),
            color: isActive ? '#FFFFFF' : '#4B5563',
            borderColor: isActive ? '#1BA672' : (isHovered ? '#D1D5DB' : '#E5E7EB'),
            transform: isHovered ? 'translateY(-1px)' : 'none',
            boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
        };
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[20px] font-medium text-gray-900">GST report</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Generate comprehensive GST reports for tax filing</p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => downloadReport('pdf')}
                    className="h-9 px-4 gap-2 text-gray-700 font-medium rounded-lg gutzo-button-ghost active:scale-95 transition-all duration-200"
                >
                    <Download className="w-3.5 h-3.5" /> Download report
                </Button>
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    {filterOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setDateRange(option.id)}
                            onMouseEnter={() => setHoveredPill(option.id)}
                            onMouseLeave={() => setHoveredPill(null)}
                            className={`px-4 py-2 rounded-full text-[12px] font-medium border-[0.5px] outline-none`}
                            style={getPillStyle(option.id)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {dateRange === 'custom' && (
                    <div className="flex flex-col md:flex-row items-end gap-4 bg-white p-4 rounded-xl border-[0.5px] border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-1">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-medium text-gray-400 mb-1.5 block">FROM</label>
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="w-full gutzo-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1BA672]/20"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-medium text-gray-400 mb-1.5 block">TO</label>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="w-full gutzo-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1BA672]/20"
                            />
                        </div>
                        <Button 
                            onClick={fetchGSTReport}
                            className="bg-[#1BA672] hover:bg-[#14885E] text-white h-10 px-6 rounded-xl text-[13px] font-medium active:scale-95 transition-all"
                        >
                            Apply Range
                        </Button>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="flex flex-col md:flex-row gap-4">
                {[
                    { label: 'Total sales', value: `₹${totalSales.toLocaleString()}`, icon: IndianRupee },
                    { label: 'Taxable amount', value: `₹${taxableAmount.toLocaleString()}`, icon: FileText },
                    { label: 'CGST (2.5%)', value: `₹${(totalGst/2).toLocaleString()}`, icon: PieChart },
                    { label: 'SGST (2.5%)', value: `₹${(totalGst/2).toLocaleString()}`, icon: PieChart }
                ].map((stat, i) => (
                    <Card key={i} className="flex-1 border-[0.5px] border-gray-100 shadow-none pb-2">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-[12px] text-gray-400 font-medium">{stat.label}</p>
                                <stat.icon className="w-3.5 h-3.5 text-gray-300" />
                            </div>
                            <p className="text-[18px] font-semibold text-gray-900">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Section */}
            <Card className="border-[0.5px] border-gray-100 overflow-hidden shadow-none bg-white">
                <div className="bg-gray-50/50 px-6 py-4 border-b-[0.5px] border-gray-100">
                    <div className="flex text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        <div style={{ width: '30%' }}>ORDER ID</div>
                        <div style={{ width: '25%' }}>DATE</div>
                        <div style={{ width: '15%' }}>AMOUNT</div>
                        <div style={{ width: '15%' }}>CGST</div>
                        <div style={{ width: '15%' }}>SGST</div>
                    </div>
                </div>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-[#1BA672] animate-spin" />
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {orders.map((order, idx) => (
                                <div key={idx} className="flex px-6 py-4 items-center hover:bg-gray-50/50 transition-colors group">
                                    <div style={{ width: '30%' }} className="text-[13px] font-medium text-gray-900 truncate">#{order.order_number.slice(-6)}</div>
                                    <div style={{ width: '25%' }} className="text-[13px] text-gray-500">
                                        {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                    <div style={{ width: '15%' }} className="text-[13px] text-gray-700 font-medium">₹{order.item_total.toFixed(0)}</div>
                                    <div style={{ width: '15%' }} className="text-[13px] text-gray-500 font-medium">₹{(order.gst_on_items / 2).toFixed(0)}</div>
                                    <div style={{ width: '15%' }} className="text-[13px] text-gray-500 font-medium">₹{(order.gst_on_items / 2).toFixed(0)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-medium text-[15px] mb-1">No transactions yet</h3>
                            <p className="text-gray-400 text-[12px] max-w-xs">Orders {dateRange === 'this_month' ? 'this month' : 'in this period'} will appear here for GST filing.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
