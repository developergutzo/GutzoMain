import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";

interface GSTReportManagerProps {
    vendorId: string;
}

interface GSTSummary {
    total_orders: number;
    total_sales_value: number;
    total_gst_collected_5_percent: number;
    net_settlement_amount: number;
    state_wise_breakup: Record<string, { orders: number; value: number; gst: number }>;
}

interface GSTOrder {
    order_number: string;
    date: string;
    customer_state: string;
    item_total: number;
    gst_on_items: number;
    platform_fee: number;
    gst_on_fees: number;
    gross_amount: number;
    commission: number;
    tds_tcs: number;
    net_settlement: number;
}

interface GSTData {
    vendor: {
        name: string;
        gstin: string;
    };
    period: {
        month: string;
        from: string;
        to: string;
    };
    summary: GSTSummary;
    orders: GSTOrder[];
}

export function GSTReportManager({ vendorId }: GSTReportManagerProps) {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<GSTData | null>(null);
    const [dateRange, setDateRange] = useState('current_month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const getDateRange = () => {
        const today = new Date();

        switch (dateRange) {
            case 'current_month':
                return {
                    from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
                    to: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
                };
            case 'last_month':
                return {
                    from: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0],
                    to: new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
                };
            case 'this_quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                return {
                    from: new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0],
                    to: new Date(today.getFullYear(), quarter * 3 + 3, 0).toISOString().split('T')[0]
                };
            case 'custom':
                return { from: customFrom, to: customTo };
            default:
                return {
                    from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
                    to: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
                };
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const { from, to } = getDateRange();
            const response = await apiService.getVendorGSTReport(vendorId, from, to);

            if (response.success) {
                setReportData(response.data);
            } else {
                toast.error('Failed to fetch GST report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch GST report');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (format: 'pdf' | 'excel') => {
        try {
            const { from, to } = getDateRange();
            const url = `${apiService.baseUrl}/api/vendor-auth/${vendorId}/gst-report?from=${from}&to=${to}&format=${format}`;

            // Open in new tab to trigger download
            window.open(url, '_blank');
            toast.success(`${format.toUpperCase()} download started`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to download report');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">GST Report</h1>
                <p className="text-gray-500">Generate comprehensive GST reports for tax filing</p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Date Range
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'current_month', label: 'This Month' },
                                { id: 'last_month', label: 'Last Month' },
                                { id: 'this_quarter', label: 'This Quarter' },
                                { id: 'custom', label: 'Custom Range' }
                            ].map((option) => (
                                <Button
                                    key={option.id}
                                    variant={dateRange === option.id ? 'default' : 'outline'}
                                    onClick={() => setDateRange(option.id)}
                                    className={dateRange === option.id ? 'bg-gutzo-primary hover:bg-gutzo-primary-hover' : ''}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>

                        {dateRange === 'custom' && (
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">From</label>
                                    <input
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) => setCustomFrom(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gutzo-primary"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">To</label>
                                    <input
                                        type="date"
                                        value={customTo}
                                        onChange={(e) => setCustomTo(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gutzo-primary"
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={fetchReport}
                            disabled={loading || (dateRange === 'custom' && (!customFrom || !customTo))}
                            className="bg-gutzo-primary hover:bg-gutzo-primary-hover"
                        >
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Generate Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {reportData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <SummaryCard
                            label="Total Orders"
                            value={reportData.summary.total_orders}
                            color="bg-blue-500"
                        />
                        <SummaryCard
                            label="Total Sales"
                            value={`₹${reportData.summary.total_sales_value.toFixed(2)}`}
                            color="bg-green-500"
                        />
                        <SummaryCard
                            label="GST @ 5%"
                            value={`₹${reportData.summary.total_gst_collected_5_percent.toFixed(2)}`}
                            color="bg-purple-500"
                        />
                        <SummaryCard
                            label="Net Settlement"
                            value={`₹${reportData.summary.net_settlement_amount.toFixed(2)}`}
                            color="bg-orange-500"
                        />
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => downloadReport('pdf')}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Download PDF
                        </Button>
                        <Button
                            onClick={() => downloadReport('excel')}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Download Excel
                        </Button>
                    </div>

                    {/* State-wise Breakup */}
                    <Card>
                        <CardHeader>
                            <CardTitle>State-wise Sales Breakup</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">State</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Orders</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Sales Value</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">GST @ 5%</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Object.entries(reportData.summary.state_wise_breakup).map(([state, stats]) => (
                                            <tr key={state} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">{state}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{stats.orders}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{stats.value.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{stats.gst.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-green-50 font-semibold">
                                            <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{reportData.summary.total_orders}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{reportData.summary.total_sales_value.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{reportData.summary.total_gst_collected_5_percent.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details ({reportData.orders.length} orders)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Order #</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">State</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Items</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">GST@5%</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Fee</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">GST@18%</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Gross</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Commission</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">TDS/TCS</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Net</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {reportData.orders.map((order, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 text-xs text-gray-900">{new Date(order.date).toLocaleDateString('en-IN')}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900 font-mono">{order.order_number}</td>
                                                <td className="px-3 py-2 text-xs text-gray-600">{order.customer_state}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900 text-right">₹{order.item_total.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900 text-right">₹{order.gst_on_items.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900 text-right">₹{order.platform_fee.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900 text-right">₹{order.gst_on_fees.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-xs text-gray-900 text-right">₹{order.gross_amount.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-xs text-red-600 text-right">-₹{order.commission.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-xs text-red-600 text-right">-₹{order.tds_tcs.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-xs text-green-700 text-right font-semibold">₹{order.net_settlement.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} bg-opacity-10 mb-3`}>
                    <div className={`w-6 h-6 rounded-full ${color}`}></div>
                </div>
                <p className="text-sm text-gray-600 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </CardContent>
        </Card>
    );
}
