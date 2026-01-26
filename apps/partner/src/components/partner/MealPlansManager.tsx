import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Loader2, Plus, Calendar, Edit, ChevronRight } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";
import { MealPlanForm } from "./MealPlanForm";
import { MealPlanEditor } from "./MealPlanEditor";
import { ImageWithFallback } from "../common/ImageWithFallback";

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
        toast.success("Plan created! Click on it to manage the schedule.");
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

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-bold text-gray-900">Meal Plans</h2>
                   <p className="text-sm text-gray-500">Manage subscription plans and weekly menus</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-[#1BA672] text-white shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Create New Plan
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plans.map(plan => (
                    <Card 
                        key={plan.id} 
                        className="group cursor-pointer hover:shadow-md transition-all border-gray-200 hover:border-green-200"
                        onClick={() => { setSelectedPlan(plan); setView('editor'); }}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <ImageWithFallback src={plan.image_url} alt={plan.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{plan.name || plan.title}</h3>
                                    <p className="text-sm text-[#1BA672] font-semibold">₹{plan.price}<span className="text-gray-400 font-normal text-xs">/week</span></p>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{plan.description}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1BA672]" />
                            </div>
                            <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{plan.dayMenu ? `${plan.dayMenu.length} days configured` : 'Schedule not set'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {plans.length === 0 && (
                     <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-gray-50">
                         <p className="text-gray-500 mb-2">No meal plans found.</p>
                         <Button variant="link" onClick={() => setIsCreating(true)} className="text-[#1BA672]">Create your first plan</Button>
                     </div>
                )}
            </div>

            {/* Create Modal - Reusing MealPlanForm but ignoring the schedule part ideally, or letting user set initial structure */}
            {isCreating && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
                        {/* We use the same form for creation. User can fill basic details and save. */}
                        <MealPlanForm 
                            vendorId={vendorId} 
                            onSuccess={handleCreateSuccess} 
                            onCancel={() => setIsCreating(false)} 
                            onClose={() => setIsCreating(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
