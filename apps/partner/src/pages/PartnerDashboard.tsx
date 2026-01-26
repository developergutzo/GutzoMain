import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Loader2, LogOut, Store, Star, ChefHat, MapPin, TrendingUp, LayoutDashboard, UtensilsCrossed, ShoppingBag, UserCog, CalendarDays } from "lucide-react";
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
import { useRouter } from "../components/Router";
import { nodeApiService as apiService } from "../utils/nodeApi";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/common/ImageWithFallback";
import { MenuManager } from "../components/partner/MenuManager";
import { ProfileManager } from "../components/partner/ProfileManager";
import { OrderManager } from "../components/partner/OrderManager";
import { MealPlansManager } from "../components/partner/MealPlansManager";

interface VendorData {
  id: string;
  name: string;
  is_open: boolean;
  is_active: boolean;
  image: string;
  rating?: number;
  cuisine_type?: string;
  location?: string;
  total_orders?: number;
  description?: string;
  address?: string;
  phone?: string;
  delivery_time?: string;
  minimum_order?: number;
  delivery_fee?: number;
  pincode?: string;
}

export function PartnerDashboard() {
  const { navigate } = useRouter();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'meal-plans' | 'orders' | 'profile'>('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Check auth
    const stored = localStorage.getItem('vendor_data');
    if (!stored) {
      window.location.reload();
      return;
    }
    try {
      setVendor(JSON.parse(stored));
    } catch (e) {
      localStorage.removeItem('vendor_data');
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('vendor_data');
    navigate('/partner/login');
    toast.info("Logged out successfully");
    setShowLogoutConfirm(false);
  };

  const refreshProfile = async () => {
    if(!vendor) return;
    try {
        const res = await apiService.getVendor(vendor.id);
        if(res.success && res.data) {
            setVendor(res.data);
            localStorage.setItem('vendor_data', JSON.stringify(res.data));
        }
    } catch(e) { console.error(e); }
  };

  const toggleStatus = async (checked: boolean) => {
    if (!vendor) return;
    try {
      const response = await apiService.updateVendorStatus(vendor.id, checked);

      if (!response.success) throw new Error(response.message || 'Update failed');

      // Update local state and storage
      const updatedVendor = { ...vendor, is_open: checked };
      setVendor(updatedVendor);
      localStorage.setItem('vendor_data', JSON.stringify(updatedVendor));
      
      toast.success(checked ? "Kitchen is now OPEN" : "Kitchen is now CLOSED");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!vendor) return null;

  const tabs = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
      { id: 'meal-plans', label: 'Meal Plans', icon: CalendarDays },
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'profile', label: 'Profile', icon: UserCog },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r flex flex-col z-20 lg:h-full">
         <div className="h-16 md:h-20 flex items-center px-4 md:px-6 border-b gap-3 flex-shrink-0">
             <ImageWithFallback
                src="https://api.gutzo.in/service/storage/v1/object/public/Gutzo/GUTZO.svg"
                alt="Gutzo"
                className="object-contain block"
                style={{ width: '100px', height: 'auto' }}
              />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Partner</span>
         </div>
         
         <div className="p-2 md:p-4 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 md:gap-2 flex-1 scrollbar-hide">
            {tabs.map(tab => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-auto md:w-full whitespace-nowrap ${
                       activeTab === tab.id 
                       ? 'bg-[#E8F6F1] text-[#1BA672]' 
                       : 'text-gray-600 hover:bg-gray-50'
                   }`}
                >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    {tab.label}
                </button>
            ))}
         </div>

         <div className="p-4 border-t hidden lg:block mt-auto flex-shrink-0 bg-white">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {vendor.image ? <ImageWithFallback src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{vendor.name.charAt(0)}</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-gray-900 truncate">{vendor.name}</p>
                        <p className="text-xs text-gray-500 truncate">{vendor.is_open ? '● Online' : '○ Offline'}</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 gap-2 px-2" onClick={handleLogoutClick}>
                     <LogOut className="w-4 h-4" />
                     <span className="font-medium">Logout</span>
                 </Button>
             </div>
         </div>
      </aside>

      {/* Main Content Actions */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 lg:hidden flex-shrink-0 sticky top-0 z-10">
             <span className="font-bold text-lg">{tabs.find(t => t.id === activeTab)?.label}</span>
             <Button variant="ghost" size="sm" onClick={handleLogoutClick} className="text-red-500">
                <LogOut className="w-5 h-5" />
             </Button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-500">Welcome back, {vendor.name}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm self-start">
                                <span className="text-sm font-medium px-2">Kitchen Status:</span>
                                <div className="flex items-center gap-2">
                                    <Switch checked={vendor.is_open} onCheckedChange={toggleStatus} />
                                    <span className={`text-sm font-bold ${vendor.is_open ? 'text-green-600' : 'text-gray-500'}`}>{vendor.is_open ? 'OPEN' : 'CLOSED'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatsCard label="Total Rating" value={vendor.rating} icon={Star} color="text-yellow-500" />
                            <StatsCard label="Total Orders" value={vendor.total_orders || 0} icon={ShoppingBag} color="text-blue-500" />
                            <StatsCard label="Menu Items" value="Manage" icon={UtensilsCrossed} color="text-orange-500" onClick={() => setActiveTab('menu')} />
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && <MenuManager vendorId={vendor.id} />}
                {activeTab === 'meal-plans' && <MealPlansManager vendorId={vendor.id} />}
                {activeTab === 'profile' && <ProfileManager vendorId={vendor.id} initialData={vendor} onUpdate={refreshProfile} />}
                {activeTab === 'orders' && <OrderManager vendorId={vendor.id} />}
            </div>
        </div>
      </main>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to login again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="text-white hover:opacity-90" style={{ backgroundColor: '#1BA672' }}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, onClick }: any) {
    return (
        <Card className={`hover:shadow-md transition-shadow cursor-pointer ${onClick ? 'active:scale-[0.98]' : ''}`} onClick={onClick}>
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-full bg-gray-50 ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
