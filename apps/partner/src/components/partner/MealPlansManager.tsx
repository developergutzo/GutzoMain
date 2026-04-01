import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Loader2, Plus, Calendar, Edit, ChevronRight, X } from "lucide-react";
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card
                        key={plan.id}
                        className="overflow-hidden border-[0.5px] border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl group flex flex-col h-full bg-white cursor-pointer"
                        onClick={() => { setSelectedPlan(plan); setView('editor'); }}
                    >
                         <div className="relative h-[200px] overflow-hidden bg-gray-50">
                            <ImageWithFallback 
                                src={plan.image_url || plan.image} 
                                alt={plan.name} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">
                                <span className="text-[13px] font-bold text-gutzo-brand">₹{plan.price}</span>
                                <span className="text-gray-400 text-[10px] ml-1 font-medium">/ week</span>
                            </div>
                         </div>
                        <CardContent className="p-5 flex-1 flex flex-col">
                            <h3 className="font-semibold text-gray-900 text-[16px] group-hover:text-[#1BA672] transition-colors mb-2">{plan.name || plan.title}</h3>
                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                                {plan.description || "Balanced nutrition delivered daily."}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t-[0.5px] border-gray-100">
                                <div className="flex gap-1.5">
                                    <div className="px-2 py-0.5 rounded-md bg-gutzo-brand-light text-gutzo-brand text-[10px] font-bold uppercase tracking-tight">
                                        6 Days
                                    </div>
                                    <div className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                                        Active
                                    </div>
                                </div>
                                <div className="p-2 text-gray-300 group-hover:text-gutzo-brand transition-all group-hover:translate-x-1">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {plans.length === 0 && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="border-[0.5px] border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 bg-gray-50/20 hover:bg-gray-50 hover:border-[#1BA672]/30 transition-all group h-full min-h-[280px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm border-[0.5px] border-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-gutzo-brand" />
                        </div>
                        <p className="text-[13px] font-semibold text-gray-900 mb-1">Create Your First Plan</p>
                        <span className="text-[11px] text-gray-400">Launch a weekly subscription for your kitchen</span>
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
