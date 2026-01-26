import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, Plus, Trash2, Save, X, Utensils, Sun, Moon, Coffee, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "../ui/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  diet_tags?: string[];
}

interface MealPlanDay {
    menu_date: string; // '2025-01-27'
    day_name: string;
    breakfast_product_id?: string;
    lunch_product_id?: string;
    dinner_product_id?: string;
    snack_product_id?: string;
    // UI display helpers not stored
    breakfast_name?: string;
    lunch_name?: string;
    dinner_name?: string;
    snack_name?: string;
    [key: string]: any; // Allow dynamic access
}

interface MealPlanEditorProps {
    vendorId: string;
    plan: any; // Full plan object
    onBack: () => void;
    onSave?: () => void;
}

export function MealPlanEditor({ vendorId, plan, onBack, onSave }: MealPlanEditorProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    // We maintain a local map of date -> meals
    const [schedule, setSchedule] = useState<Record<string, MealPlanDay>>({});
    const [loading, setLoading] = useState(true);
    const [visibleDays, setVisibleDays] = useState(3);

    useEffect(() => {
        setVisibleDays(3);
    }, [weekStart]);

    useEffect(() => {
        // Fetch vendor products for the dropdowns
        const loadData = async () => {
             try {
                 const res = await apiService.getVendorMenu(vendorId);
                 if (res.success && res.data) {
                     // Parse tags from description for fallback compatibility
                     const processedProducts = res.data.products
                     .filter((p: any) => p.category !== 'Meal Plan') // Exclude Meal Plans from dish selection
                     .map((p: any) => {
                         const tagRegex = /\[TAGS:(.*?)\]$/;
                         const match = p.description?.match(tagRegex);
                         let extractedTags: string[] = [];
                         if (match) {
                             extractedTags = match[1].split(',').map((t: string) => t.trim()).filter(Boolean);
                         }
                         
                         // Merge with existing diet_tags if any and deduplicate
                         const finalTags = Array.from(new Set([...(p.diet_tags || []), ...extractedTags]));
                         
                         return { ...p, diet_tags: finalTags };
                     });
                     setProducts(processedProducts);
                 }
                 
                 // Initialize schedule from plan.nutritional_info?.day_menu or plan.dayMenu (legacy/fallback)
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
                    // We will sync 'item' strings on save
                }
            };
        });
    };

    const saveChanges = async () => {
        // Convert schedule map to array
        const dayMenu = Object.values(schedule).map(d => ({
            menu_date: d.menu_date,
            day_name: d.day_name,
            day_of_week: new Date(d.menu_date).getDay(),
            breakfast_item: d.breakfast_name || products.find(p => p.id === d.breakfast_product_id)?.name || "",
            lunch_item: d.lunch_name || products.find(p => p.id === d.lunch_product_id)?.name || "",
            dinner_item: d.dinner_name || products.find(p => p.id === d.dinner_product_id)?.name || "",
            snack_item: d.snack_name || products.find(p => p.id === d.snack_product_id)?.name || "",
            // Store IDs for future editing if backend supports it
            breakfast_product_id: d.breakfast_product_id,
            lunch_product_id: d.lunch_product_id,
            dinner_product_id: d.dinner_product_id,
            snack_product_id: d.snack_product_id
        }));

        try {
            // Store dayMenu inside nutritional_info to avoid schema errors
            // Ensure we preserve existing nutritional_info
            const currentInfo = plan.nutritional_info || {};

            await apiService.updateVendorProduct(vendorId, plan.id, {
                ...plan,
                nutritional_info: {
                    ...currentInfo,
                    day_menu: dayMenu // Use day_menu (snake_case) inside JSON
                }
            });
            toast.success("Meal Plan updated successfully!");
            if (onSave) onSave();
        } catch (e) {
            toast.error("Failed to save plan");
        }
    };

    // Generate days for view
    const daysToDisplay = Array.from({ length: visibleDays }).map((_, i) => {
        const d = addDays(weekStart, i);
        return {
            date: d,
            dateStr: format(d, 'yyyy-MM-dd'),
            dayName: format(d, 'EEEE')
        };
    });

    return (
        <div className="flex flex-col h-full bg-gray-50/50 p-4 rounded-xl">
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <Button variant="ghost" onClick={onBack} size="sm" className="pl-0 gap-1 text-gray-500 hover:text-gray-900">
                        <ChevronLeft size={16} /> Back to Plans
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900 mt-1">{plan.name || plan.title}</h2>
                    <p className="text-sm text-gray-500">Manage daily menu items</p>
                 </div>
                 <Button onClick={saveChanges} className="bg-gutzo-primary text-white gap-2">
                     <Save size={16} /> Save Changes
                 </Button>
             </div>

             {/* Week Navigation */}
             <div className="flex items-center gap-4 mb-4 bg-white p-2 rounded-lg border w-fit">
                 <Button variant="ghost" size="icon" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
                     <ChevronLeft size={16} />
                 </Button>
                 <span className="font-medium text-sm">
                     {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                 </span>
                 <Button variant="ghost" size="icon" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
                     <ChevronRight size={16} />
                 </Button>
             </div>

             <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-10">
                 {daysToDisplay.map(({ dateStr, dayName }) => {
                     const dayData = schedule[dateStr] || {};
                     return (
                         <Card key={dateStr} className="overflow-hidden">
                             <CardHeader className="py-3 px-4 bg-gray-50 border-b flex flex-row items-center justify-between">
                                 <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{dayName}</span>
                                    <div className="text-lg font-bold text-gray-900">{format(new Date(dateStr), 'd MMM')}</div>
                                 </div>
                             </CardHeader>
                             <CardContent className="p-4 flex flex-row gap-4">
                                {['breakfast', 'lunch', 'snack', 'dinner'].map((slot: any) => {
                                    const slotTitle = slot.charAt(0).toUpperCase() + slot.slice(1);
                                    const filteredProducts = products.filter(p => 
                                        !p.diet_tags || p.diet_tags.length === 0 || p.diet_tags.includes(slotTitle)
                                    );
                                    
                                    return (
                                    <div key={slot} className="space-y-1.5 flex-1 min-w-0">
                                        <Label className="text-xs text-gray-500 font-medium uppercase flex items-center gap-1.5">
                                            {slot === 'breakfast' && <Sun size={12}/>}
                                            {slot === 'lunch' && <Utensils size={12}/>}
                                            {slot === 'snack' && <Coffee size={12}/>}
                                            {slot === 'dinner' && <Moon size={12}/>}
                                            {slot}
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full h-9 justify-between text-sm font-normal"
                                                >
                                                    <span className="truncate">
                                                        {dayData[`${slot}_product_id`] ? 
                                                            products.find(p => p.id === dayData[`${slot}_product_id`])?.name : 
                                                            "None"
                                                        }
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder={`Search ${slot}...`} className="h-8" />
                                                    <CommandList>
                                                        <CommandEmpty>No {slot} item found.</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandItem
                                                                value="none"
                                                                onSelect={() => {
                                                                    handleProductSelect(dateStr, slot, "");
                                                                }}
                                                                className="italic text-gray-400"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        !dayData[`${slot}_product_id`] ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                None
                                                            </CommandItem>
                                                            {filteredProducts.map((p) => (
                                                                <CommandItem
                                                                    key={p.id}
                                                                    value={p.name}
                                                                    onSelect={() => {
                                                                        handleProductSelect(dateStr, slot, p.id);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            dayData[`${slot}_product_id`] === p.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <span className="truncate">{p.name}</span>
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
                             </CardContent>
                         </Card>
                     );
                 })}
             </div>
             
             {visibleDays < 7 && (
                <Button 
                    variant="outline" 
                    className="w-full mt-4 border-dashed border-2 py-6 text-gray-500 hover:border-gutzo-primary hover:text-gutzo-primary"
                    onClick={() => setVisibleDays(prev => Math.min(prev + 1, 7))}
                >
                    <Plus size={20} className="mr-2" /> Add Next Day
                </Button>
             )}
        </div>
    );
}
