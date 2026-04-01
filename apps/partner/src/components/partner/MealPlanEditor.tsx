import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Calendar, Plus, Trash2, Save, X, 
  Utensils, Sun, Moon, Coffee, ChevronLeft, 
  ChevronRight, Check, ChevronsUpDown, Search, 
  Settings, Pencil, ImageIcon, Upload, Sparkles, Clock, Info
} from "lucide-react";
import { toast } from "sonner";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "../ui/utils";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { MealPlanForm } from "./MealPlanForm";

interface Product {
  id: string;
  name: string;
  price: number;
  diet_tags?: string[];
}

interface MealPlanDay {
    menu_date: string; 
    day_name: string;
    breakfast_product_id?: string;
    lunch_product_id?: string;
    dinner_product_id?: string;
    snack_product_id?: string;
    breakfast_name?: string;
    lunch_name?: string;
    dinner_name?: string;
    snack_name?: string;
    [key: string]: any; 
}

interface MealPlanEditorProps {
    vendorId: string;
    plan: any; 
    onBack: () => void;
    onSave?: () => void;
}

export function MealPlanEditor({ vendorId, plan, onBack, onSave }: MealPlanEditorProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [schedule, setSchedule] = useState<Record<string, MealPlanDay>>({});
    const [loading, setLoading] = useState(true);
    const [visibleDays, setVisibleDays] = useState(3);
    const [showSettings, setShowSettings] = useState(false);
    const [localPlan, setLocalPlan] = useState(plan);

    useEffect(() => {
        setLocalPlan(plan);
    }, [plan]);

    useEffect(() => {
        setVisibleDays(3);
    }, [weekStart]);

    useEffect(() => {
        const loadData = async () => {
             try {
                 const res = await apiService.getVendorMenu(vendorId);
                 if (res.success && res.data) {
                     const processedProducts = res.data.products
                     .filter((p: any) => p.category !== 'Meal Plan') 
                     .map((p: any) => {
                         const tagRegex = /\[TAGS:(.*?)\]$/;
                         const match = p.description?.match(tagRegex);
                         let extractedTags: string[] = [];
                         if (match) {
                             extractedTags = match[1].split(',').map((t: string) => t.trim()).filter(Boolean);
                         }
                         const finalTags = Array.from(new Set([...(p.diet_tags || []), ...extractedTags]));
                         return { ...p, diet_tags: finalTags };
                     });
                     setProducts(processedProducts);
                 }
                 
                 const storedMenu = plan.nutritional_info?.day_menu || plan.dayMenu;
                 if (storedMenu) {
                     const map: Record<string, MealPlanDay> = {};
                     storedMenu.forEach((d: any) => {
                         if (d.menu_date) {
                             map[d.menu_date] = {
                                 menu_date: d.menu_date,
                                 day_name: d.day_name,
                                 breakfast_product_id: d.breakfast_product_id,
                                 breakfast_name: d.breakfast_item,
                                 lunch_product_id: d.lunch_product_id,
                                 lunch_name: d.lunch_item,
                                 dinner_product_id: d.dinner_product_id,
                                 dinner_name: d.dinner_item,
                                 snack_product_id: d.snack_product_id,
                                 snack_name: d.snack_item
                             };
                         }
                     });
                     setSchedule(map);
                 }
             } catch (e) {
                 console.error(e);
                 toast.error("Failed to load resources");
             } finally {
                 setLoading(false);
             }
        };
        loadData();
    }, [vendorId, plan]);

    const handleProductSelect = (dateStr: string, slot: 'breakfast' | 'lunch' | 'dinner' | 'snack', productId: string) => {
        const product = products.find(p => p.id === productId);
        setSchedule(prev => {
            const existing = prev[dateStr] || { menu_date: dateStr, day_name: format(new Date(dateStr), 'EEEE') };
            return {
                ...prev,
                [dateStr]: {
                    ...existing,
                    [`${slot}_product_id`]: productId,
                    [`${slot}_name`]: product?.name
                }
            };
        });
    };

    const saveChanges = async () => {
        const dayMenu = Object.values(schedule).map(d => ({
            menu_date: d.menu_date,
            day_name: d.day_name,
            day_of_week: new Date(d.menu_date).getDay(),
            breakfast_item: d.breakfast_name || products.find(p => p.id === d.breakfast_product_id)?.name || "",
            lunch_item: d.lunch_name || products.find(p => p.id === d.lunch_product_id)?.name || "",
            dinner_item: d.dinner_name || products.find(p => p.id === d.dinner_product_id)?.name || "",
            snack_item: d.snack_name || products.find(p => p.id === d.snack_product_id)?.name || "",
            breakfast_product_id: d.breakfast_product_id,
            lunch_product_id: d.lunch_product_id,
            dinner_product_id: d.dinner_product_id,
            snack_product_id: d.snack_product_id
        }));

        try {
            const currentInfo = plan.nutritional_info || {};
            await apiService.updateVendorProduct(vendorId, plan.id, {
                ...plan,
                nutritional_info: {
                    ...currentInfo,
                    day_menu: dayMenu 
                }
            });
            toast.success("Schedule published!");
            if (onSave) onSave();
        } catch (e) {
            toast.error("Failed to save schedule");
        }
    };

    const daysToDisplay = Array.from({ length: visibleDays }).map((_, i) => {
        const d = addDays(weekStart, i);
        return {
            date: d,
            dateStr: format(d, 'yyyy-MM-dd'),
            dayName: format(d, 'EEEE')
        };
    });

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] font-primary">
             {/* Sticky Header */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-40 p-6 border-b-[0.5px] border-gray-100 shadow-sm mb-8">
                 <div className="flex items-center gap-5">
                    <button onClick={onBack} className="p-2.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all text-gray-400 hover:text-gray-900 group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="flex items-center gap-4">
                        {(localPlan.image_url || localPlan.image) && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-white shrink-0 shadow-sm hidden sm:block">
                                <img 
                                    src={localPlan.image_url || localPlan.image} 
                                    alt={localPlan.name || localPlan.title} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        )}
                        <div>
                             <div className="flex items-center gap-2">
                                 <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">{localPlan.name || localPlan.title}</h2>
                                 <button 
                                     className="p-1.5 text-gray-300 hover:text-gutzo-brand hover:bg-gutzo-brand-light transition-all rounded-lg"
                                     onClick={() => setShowSettings(true)}
                                 >
                                     <Pencil size={14} />
                                 </button>
                             </div>
                             <p className="text-[11px] text-gray-400 font-medium tracking-tight mt-0.5 uppercase">Schedule Engine · {visibleDays} Days Visible</p>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={onBack} 
                        className="h-12 px-6 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition-all border border-gray-200"
                    >
                        Discard
                    </Button>
                    <Button 
                        onClick={saveChanges} 
                        className="bg-gutzo-brand hover:bg-gutzo-brand-hover text-white h-12 px-6 rounded-xl text-[13px] font-bold active:scale-95 transition-all shadow-lg shadow-gutzo-brand/20 gap-2 min-w-[140px]"
                    >
                        <Save size={16} /> Sync Rotation
                    </Button>
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto px-6 flex flex-col pb-32" style={{ gap: '12px' }}>
                 {/* Week Navigation & Controls */}
                 <section className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 bg-gray-50/50 p-1 rounded-[14px] border border-gray-100">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                            <ChevronLeft size={16} />
                        </Button>
                        <div className="px-4 flex flex-col items-center">
                            <span className="text-[11px] font-bold text-gray-900 tracking-tight">
                                {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                            <ChevronRight size={16} />
                        </Button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Status</span>
                            <div className="flex items-center gap-1.5 bg-[#E8F6F1] px-2.5 py-1 rounded-full border border-[#CDEBDD]">
                                <div className="w-1.5 h-1.5 rounded-full bg-gutzo-brand animate-pulse" />
                                <span className="text-[10px] font-bold text-gutzo-brand uppercase">Live on App</span>
                            </div>
                        </div>
                    </div>
                 </section>

                 {/* Daily Slots Grid */}
                 <section className="flex flex-col" style={{ gap: '24px' }}>
                     {daysToDisplay.map(({ dateStr, dayName }) => {
                         const dayData = schedule[dateStr] || {};
                         const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                         
                         return (
                             <Card key={dateStr} className={cn(
                                 "overflow-hidden border-[0.5px] shadow-sm rounded-2xl bg-white transition-all duration-300 group",
                                 isToday ? "ring-2 ring-gutzo-brand/20 border-gutzo-brand/30 shadow-md" : "border-gray-100"
                             )}>
                                 <div className="bg-gray-50/50 px-8 py-5 border-b-[0.5px] border-gray-100 flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-bold text-gray-900 tracking-tight">{dayName}</span>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{format(new Date(dateStr), 'MMMM dd, yyyy')}</div>
                                        </div>
                                        {isToday && <span className="bg-gutzo-brand text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm animate-bounce">Today</span>}
                                     </div>
                                     <div className="flex items-center gap-2 text-gray-300">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-[10px] font-medium uppercase italic">Auto-refresh at 12 AM</span>
                                     </div>
                                 </div>
                                 <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {[
                                            { id: 'breakfast', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' },
                                            { id: 'lunch', icon: Utensils, color: 'text-gutzo-brand', bg: 'bg-[#E8F6F1]' },
                                            { id: 'snack', icon: Coffee, color: 'text-purple-500', bg: 'bg-purple-50' },
                                            { id: 'dinner', icon: Moon, color: 'text-blue-500', bg: 'bg-blue-50' }
                                        ].map((slot) => {
                                            const slotTitle = slot.id.charAt(0).toUpperCase() + slot.id.slice(1);
                                            const filteredProducts = products.filter(p => 
                                                !p.diet_tags || p.diet_tags.length === 0 || p.diet_tags.includes(slotTitle)
                                            );
                                            const selectedDish = products.find(p => p.id === dayData[`${slot.id}_product_id`]);
                                            
                                            return (
                                            <div key={slot.id} className="space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                        <slot.icon className={cn("w-3.5 h-3.5", slot.color)} />
                                                        {slot.id}
                                                    </Label>
                                                    {selectedDish && <div className={cn("w-1.5 h-1.5 rounded-full", slot.color)} />}
                                                </div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full h-12 justify-between text-[13px] font-semibold transition-all duration-300 rounded-xl px-4 border shadow-sm group/btn",
                                                                selectedDish 
                                                                    ? "border-gray-300 bg-white text-gray-900" 
                                                                    : "border-gray-200 bg-[#F9F9F9] text-gray-500 hover:bg-white"
                                                            )}
                                                        >
                                                            <span className="truncate">
                                                                {selectedDish ? selectedDish.name : "Select dish..."}
                                                            </span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-20 group-hover/btn:opacity-40 transition-opacity" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[280px] p-0 shadow-2xl rounded-2xl border-gray-100 overflow-hidden" align="start">
                                                        <Command className="bg-white border-none outline-none">
                                                            <div className="relative border-b border-gray-50 flex items-center px-3">
                                                                <Search className="w-4 h-4 text-gray-300" />
                                                                <CommandInput placeholder={`Search ${slot.id}...`} className="h-11 border-none font-medium text-[13px]" />
                                                            </div>
                                                            <CommandList className="max-h-[320px] p-2">
                                                                <CommandEmpty className="py-10 text-center flex flex-col items-center gap-2">
                                                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                                                        <Info className="w-5 h-5 text-gray-200" />
                                                                    </div>
                                                                    <span className="text-xs text-gray-400 font-medium italic">No matches found.</span>
                                                                </CommandEmpty>
                                                                <CommandGroup>
                                                                    <CommandItem
                                                                        value="none"
                                                                        onSelect={() => handleProductSelect(dateStr, slot.id as any, "")}
                                                                        className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-red-50 text-red-400 transition-all font-semibold italic text-[12px] mb-1"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                        Remove Item
                                                                    </CommandItem>
                                                                    {filteredProducts.map((p) => (
                                                                        <CommandItem
                                                                            key={p.id}
                                                                            value={p.name}
                                                                            onSelect={() => handleProductSelect(dateStr, slot.id as any, p.id)}
                                                                            className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-gutzo-brand-light transition-all mb-1 last:mb-0 group/item"
                                                                        >
                                                                            <div className={cn(
                                                                                "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                                                                dayData[`${slot.id}_product_id`] === p.id ? "bg-gutzo-brand border-gutzo-brand" : "border-gray-200 bg-white"
                                                                            )}>
                                                                                {dayData[`${slot.id}_product_id`] === p.id && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                                                            </div>
                                                                            <div className="flex flex-col flex-1 truncate">
                                                                                <span className="text-[13px] font-bold text-gray-800 leading-tight group-hover/item:text-gutzo-brand transition-colors">{p.name}</span>
                                                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Current Menu Price: ₹{p.price}</span>
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            );
                                        })}
                                    </div>
                                 </CardContent>
                             </Card>
                         );
                     })}
                 </section>
                 
                 {visibleDays < 7 && (
                    <button 
                        className="w-full py-10 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gutzo-brand hover:text-gutzo-brand hover:bg-[#E8F6F1]/30 transition-all flex flex-col items-center justify-center gap-2 group"
                        onClick={() => setVisibleDays(prev => Math.min(prev + 1, 7))}
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="text-[14px] font-bold tracking-tight">Expand to {visibleDays + 1} Days</span>
                        <p className="text-[11px] font-medium opacity-60">Add tomorrow's menu to your rotation</p>
                    </button>
                 )}
              </div>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="w-[500px] sm:max-w-[500px] p-0 border-none bg-transparent">
                    <DialogTitle className="sr-only">Edit Meal Plan Details</DialogTitle>
                    <MealPlanForm 
                        vendorId={vendorId}
                        existingPlan={localPlan}
                        onSuccess={() => {
                            setShowSettings(false);
                            // Refresh and verify logic would go here
                        }}
                        onCancel={() => setShowSettings(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
