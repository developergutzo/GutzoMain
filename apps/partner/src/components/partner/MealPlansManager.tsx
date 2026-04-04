import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Loader2, Plus, Calendar, Edit, ChevronRight, X, Search } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";
import { MealPlanForm } from "./MealPlanForm";
import { MealPlanEditor } from "./MealPlanEditor";
import { ImageWithFallback } from "../common/ImageWithFallback";
import {
  Sheet,
  SheetContent,
} from "../ui/sheet";

interface MealPlansManagerProps {
    vendorId: string;
}

export function MealPlansManager({ vendorId }: MealPlansManagerProps) {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (view === 'list') fetchPlans();
    }, [view, vendorId]);

    const fetchPlans = async () => {
        try {
            const res = await apiService.getVendorMenu(vendorId);
            if (res.success && res.data) {
                // Filter for Meal Plans
                const allProducts = res.data.products || [];
                // Identified by category or loose logic
                const mealPlans = allProducts.filter((p: any) =>
                    p.category === 'Meal Plan' ||
                    (p.tags && p.tags.includes('meal_plan')) ||
                    p.dayMenu // Explicit structure check
                );
                setPlans(mealPlans);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        setIsCreating(false);
        fetchPlans();
        toast.success("Plan created successfully!");
    };

    if (view === 'editor' && selectedPlan) {
        return (
            <MealPlanEditor
                vendorId={vendorId}
                plan={selectedPlan}
                onBack={() => { setSelectedPlan(null); setView('list'); }}
                onSave={() => { /* maybe refresh */ }}
            />
        );
    }

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-gutzo-brand" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-[24px] font-bold text-gray-900">Meal Plans</h2>
                    <p className="text-[12px] text-gray-400 mt-0.5">Manage subscription plans and weekly menus</p>
                </div>
                <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-gutzo-brand hover:bg-gutzo-brand-hover text-white h-10 px-6 rounded-xl text-[13px] font-semibold active:scale-95 transition-all shadow-lg shadow-gutzo-brand/20"
                >
                    <Plus className="w-4 h-4 mr-2" /> Create New Plan
                </Button>
            </div>

            <div className="flex flex-col gap-8 pb-32">
                {/* Premium Search Bar - Prominent Height & Proper Padding */}
                <div className="sticky top-[100px] z-40 bg-[#FAFAFA]/95 backdrop-blur-md pb-8 pt-2 flex justify-start">
                    <div 
                        className="relative group w-full" 
                        style={{ maxWidth: '440px' }}
                    >
                        <Search 
                            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gutzo-brand transition-colors z-10" 
                        />
                        <input 
                            type="search" 
                            placeholder="Search for meal plans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ height: '52px', paddingLeft: '56px' }}
                            className="w-full bg-white border border-gray-200 rounded-2xl text-[14px] shadow-sm hover:shadow-md focus:shadow-md focus:ring-4 focus:ring-gutzo-brand/5 transition-all outline-none placeholder:text-gray-400 font-primary"
                        />
                    </div>
                </div>

                {Object.entries(
                    plans
                        .filter(p => !searchQuery || (p.name || p.title).toLowerCase().includes(searchQuery.toLowerCase()))
                        .reduce((acc: Record<string, any[]>, p) => {
                        const cat = p.category || 'Subscription Plans';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(p);
                        return acc;
                    }, {})
                ).map(([category, items]: [string, any[]]) => (
                    <div key={category} className="space-y-4">
                        {/* Category Header - Sticky */}
                        <div className="sticky top-[100px] z-30 bg-white/80 backdrop-blur-md py-4 px-1 flex items-center justify-between border-b-[0.5px] border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-gutzo-brand rounded-full" />
                                <h2 className="text-[18px] font-bold text-gray-900">
                                    {category}
                                    <span className="ml-2 text-[12px] font-medium text-gray-400">({items.length} Plans)</span>
                                </h2>
                            </div>
                            <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-[60px]">
                                <div style={{ width: '100px' }} className="text-right">Price</div>
                                <div style={{ width: '100px' }} className="text-center">Status</div>
                            </div>
                        </div>

                        {/* Unified Category Container */}
                        <div className="bg-white border-[0.5px] border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            {items.map((plan: any, index: number) => {
                                const isLast = index === items.length - 1;
                                return (
                                    <div
                                        key={plan.id}
                                        className={`flex items-center gap-4 p-3 pr-6 hover:bg-gray-50/50 transition-all group cursor-pointer ${!isLast ? 'border-b-[0.5px] border-gray-100' : ''}`}
                                        style={{ height: '76px' }}
                                        onClick={() => { setSelectedPlan(plan); setView('editor'); }}
                                    >
                                         {/* Thumbnail */}
                                         <div 
                                            className="relative overflow-hidden rounded-xl bg-gray-50 flex-shrink-0 border-[0.5px] border-gray-100 shadow-sm"
                                            style={{ width: '60px', height: '60px' }}
                                         >
                                            <ImageWithFallback 
                                                src={plan.image_url || plan.image} 
                                                alt={plan.name} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                            />
                                         </div>

                                     {/* Info Column */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="font-bold text-gray-900 text-[16px] truncate group-hover:text-gutzo-brand transition-colors tracking-tight">{plan.name || plan.title}</h3>
                                        <p className="text-[12px] text-gray-400 truncate mt-0.5">
                                            {plan.description || "Balanced nutrition delivered daily."}
                                        </p>
                                    </div>

                                    {/* Price Column */}
                                    <div style={{ width: '100px' }} className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[15px] font-extrabold text-gray-900">₹{plan.price}</span>
                                            <span className="text-[10px] text-gray-400 tracking-tighter">/ week</span>
                                        </div>
                                    </div>

                                     {/* Status Column */}
                                     <div style={{ width: '100px' }} className="flex justify-center">
                                        <span className="text-[9px] font-bold text-gutzo-brand bg-gutzo-brand-light px-2 py-0.5 rounded uppercase tracking-tight">Active</span>
                                     </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="border-[0.5px] border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-3 p-4 bg-white/50 hover:bg-white hover:border-gutzo-brand hover:text-gutzo-brand transition-all group lg:w-max min-w-[320px] shadow-sm ml-2"
                        style={{ height: '60px' }}
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gutzo-brand-light transition-colors">
                            <Plus className="w-4 h-4 text-gray-400 group-hover:text-gutzo-brand transition-colors" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-500 group-hover:text-gutzo-brand tracking-tight font-primary">Create Your First Meal Plan</span>
                    </button>
                )}
            </div>

            <Sheet open={isCreating} onOpenChange={setIsCreating}>
                <SheetContent side="right" className="w-[500px] sm:max-w-[500px] p-0 overflow-hidden flex flex-col border-l-[0.5px] border-gray-100 shadow-2xl">
                    <MealPlanForm
                        vendorId={vendorId}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setIsCreating(false)}
                        onClose={() => setIsCreating(false)}
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
}
