import { useState, useEffect } from 'react';
import { ShoppingBag, ClipboardList, Utensils, Calendar, Calculator, User, LogOut, IndianRupee, Star, TrendingUp } from 'lucide-react';
import { OrderManager } from '../components/partner/OrderManager';
import { MenuManager } from '../components/partner/MenuManager';
import { MealPlansManager } from '../components/partner/MealPlansManager';
import { GSTReportManager } from '../components/partner/GSTReportManager';
import { ProfileManager } from '../components/partner/ProfileManager';
import { nodeApiService as apiService } from "../utils/nodeApi";
import { Card, CardContent } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

// Dashboard Overview Component (Restored & Modernized)
function DashboardOverview({ vendorId, onNavigate }: { vendorId: string, onNavigate: (tab: any) => void }) {
  const [stats, setStats] = useState({
    todayOrders: 0,
    revenue: 0,
    rating: 4.8
  });

  useEffect(() => {
    // Fetch basic stats for the dashboard
    const fetchStats = async () => {
      try {
        const response = await apiService.getVendorOrders(vendorId, 'delivered,completed');
        const orders = response?.data?.orders || [];
        const total = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
        setStats(prev => ({ ...prev, todayOrders: orders.length, revenue: total }));
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      }
    };
    fetchStats();
  }, [vendorId]);

  const statCards = [
    { id: 'orders', label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, color: '#1BA672', bg: '#E8F6F1' },
    { id: 'revenue', label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: '#E85A1C', bg: '#FFF4ED' },
    { id: 'rating', label: "Average Rating", value: stats.rating, icon: Star, color: '#F59E0B', bg: '#FFFBEB' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.id} className="border-[0.5px] border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-[24px] font-semibold text-gray-900">{stat.value}</h3>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                  style={{ backgroundColor: stat.bg }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-[#1BA672]" />
                <span className="text-[10px] font-medium text-[#1BA672]">+12.5% from yesterday</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Orders Section */}
      <div className="bg-white border-[0.5px] border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-medium text-gray-900">Recent Activity</h3>
          <button
            onClick={() => onNavigate('orders')}
            className="text-[11px] font-medium text-[#1BA672] hover:underline"
          >
            View all orders
          </button>
        </div>
        <OrderManager vendorId={vendorId} isDashboard={true} />
      </div>
    </div>
  );
}

export function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'meal_plans' | 'gst' | 'profile'>('dashboard');
  const [isKitchenOpen, setIsKitchenOpen] = useState(true);
  const getStoredVendor = () => {
    const stored = localStorage.getItem('vendor_data');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  };

  // UUID validation helper
  const isUUID = (id: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(id);
  };

  const storedVendor = getStoredVendor();
  const [vendorData, setVendorData] = useState<any>(storedVendor);
  const [vendorId] = useState(storedVendor?.id || storedVendor?._id || '');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  useEffect(() => {
    // If no vendorId OR it's a mock ID (not a valid UUID), redirect to login
    if (!vendorId || !isUUID(vendorId)) {
      if (vendorId) {
        console.warn('Invalid mock vendor ID detected:', vendorId);
        localStorage.removeItem('vendor_data');
      }
      window.location.href = '/login';
    }
  }, [vendorId]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'meal_plans', label: 'Meal Plans', icon: Calendar },
    { id: 'gst', label: 'GST', icon: Calculator },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  useEffect(() => {
    if (!vendorId) {
      window.location.href = '/login';
      return;
    }
    fetchVendorData();
  }, [vendorId]);

  const fetchVendorData = async () => {
    try {
      const data = await apiService.getVendor(vendorId);
      setVendorData(data);
      setIsKitchenOpen(data.is_open);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    }
  };

  const handleToggleKitchen = async () => {
    const newState = !isKitchenOpen;
    setIsKitchenOpen(newState);
    try {
      await apiService.updateVendorProfile(vendorId, { is_open: newState });
    } catch (error) {
      console.error('Error toggling kitchen:', error);
      setIsKitchenOpen(!newState);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendor_data');
    window.location.href = '/login';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview vendorId={vendorId} onNavigate={setActiveTab} />;
      case 'orders': return <OrderManager vendorId={vendorId} />;
      case 'menu': return <MenuManager vendorId={vendorId} />;
      case 'meal_plans': return <MealPlansManager vendorId={vendorId} />;
      case 'gst': return <GSTReportManager vendorId={vendorId} />;
      case 'profile': return <ProfileManager vendorId={vendorId} initialData={vendorData} onUpdate={fetchVendorData} />;
      default: return <DashboardOverview vendorId={vendorId} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-primary">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white border-b-[0.5px] border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1BA672] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">G</div>
              <span className="text-[17px] font-semibold text-gray-900 tracking-tight">GUTZO <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded ml-1 border-[0.5px] border-gray-100">Partner</span></span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 max-w-[calc(100vw-300px)] lg:max-w-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isHovered = hoveredTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-medium transition-all duration-200 outline-none ${isActive ? 'bg-gutzo-brand-light text-gutzo-brand' : 'text-gray-500 hover:bg-gray-50'}`}
                    style={{
                      transform: isHovered && !isActive ? 'translateY(-1px)' : 'none'
                    }}
                  >
                    <tab.icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-gutzo-brand' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[13px] font-medium text-gray-900">{vendorData?.name || 'Coimbatore Cafe'}</span>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-[11px] font-medium text-[#1BA672] hover:text-[#14885E] transition-colors"
              >
                View Profile
              </button>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-200 border-[0.5px] border-gray-300 overflow-hidden shadow-sm">
              <img src={vendorData?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120"} alt="Vendor" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={() => setShowLogoutDialog(true)}
              onMouseEnter={() => setIsLogoutHovered(true)}
              onMouseLeave={() => setIsLogoutHovered(null as any)}
              style={{
                padding: '8px',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isLogoutHovered ? '#FFF5F5' : 'transparent',
                color: isLogoutHovered ? '#E74C3C' : '#9E9E9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none'
              }}
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent
            style={{
              maxWidth: '420px',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              backgroundColor: 'white'
            }}
          >
            <AlertDialogHeader style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <AlertDialogTitle style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, textAlign: 'left', margin: 0 }}>
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription style={{ fontSize: '15px', color: '#6B6B6B', fontWeight: 500, textAlign: 'left', margin: 0 }}>
                You will need to login again to access your dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px' }}>
              <AlertDialogCancel
                style={{
                  height: '48px',
                  padding: '0 32px',
                  borderRadius: '12px',
                  border: '1px solid #E0E0E0',
                  color: '#6B6B6B',
                  fontSize: '15px',
                  fontWeight: 600,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '120px'
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                style={{
                  height: '48px',
                  padding: '0 40px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  color: '#fb2c36',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: '1px solid #fb2c36',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(251,44,54,0.05)',
                  minWidth: '120px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Kitchen Status Banner (Fixed below nav) */}
        <div className={`w-full h-11 px-6 flex items-center justify-between transition-colors duration-300 border-t-[0.5px] ${isKitchenOpen ? 'bg-gutzo-brand-light border-gutzo-border' : 'bg-gray-50 border-gray-100'}`}>
          <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isKitchenOpen ? 'bg-gutzo-brand' : 'bg-gray-400'}`}></div>
              <span className={`text-[12px] font-medium ${isKitchenOpen ? 'text-gutzo-brand' : 'text-gray-500'}`}>
                {isKitchenOpen ? 'Kitchen is open — accepting orders' : 'Kitchen is closed — not accepting orders'}
              </span>
              <span className="hidden md:inline text-[11px] text-gray-400 ml-2">Orders will appear below automatically</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[12px] font-medium transition-colors ${isKitchenOpen ? 'text-gutzo-brand' : 'text-gray-500'}`}>{isKitchenOpen ? 'Open' : 'Closed'}</span>
              <Switch
                checked={isKitchenOpen}
                onCheckedChange={handleToggleKitchen}
                className="data-[state=checked]:bg-gutzo-brand"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-6 animate-in slide-in-from-bottom-2 duration-400">
        {renderContent()}
      </main>
    </div>
  );
}
