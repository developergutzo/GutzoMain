import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { 
  Calendar, Plus, Trash2, Save, X, 
  Utensils, Sun, Moon, Coffee, Info,
  Calculator, IndianRupee, Loader2, Sparkles,
  ShoppingBag, Clock, CheckCircle2
} from "lucide-react";
import { ImageUpload } from "../common/ImageUpload";
import { cn } from "../ui/utils";

interface MealPlanFormData {
  id?: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  dayMenu: Array<{
    day_of_week: number;
    menu_date?: string; 
    breakfast_item: string;
    lunch_item: string;
    dinner_item: string;
    snack_item: string;
  }>;
  image?: string;
}

interface MealPlanFormProps {
  vendorId: string;
  existingPlan?: MealPlanFormData | null;
  onSuccess: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export function MealPlanForm({ vendorId, existingPlan, onSuccess, onCancel, onClose }: MealPlanFormProps) {
  const handleCancel = onCancel || onClose || (() => {});
  const [formData, setFormData] = useState<MealPlanFormData>(existingPlan || {
    name: "",
    price: 0,
    description: "",
    image_url: "",
    dayMenu: Array.from({ length: 6 }).map((_, i) => ({
      day_of_week: i + 1,
      breakfast_item: "",
      lunch_item: "",
      dinner_item: "",
      snack_item: ""
    }))
  });
  
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

    const getInputStyle = (fieldId: string) => {
        const isFocused = focusedField === fieldId;
        return {
            backgroundColor: isFocused ? '#FFFFFF' : '#F9F9F9',
            border: isFocused ? '1px solid #1BA672' : '1px solid #D1D5DB', // Darker border
            boxShadow: isFocused ? '0 0 0 4px rgba(27, 166, 114, 0.08)' : 'none',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.2s ease',
        };
    };

  const labelStyle = "text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const payload = {
            ...formData,
            price: Number(formData.price),
            vendor_id: vendorId,
            category: 'Meal Plan' 
        };

        if (formData.id) {
           await apiService.updateVendorProduct(vendorId, formData.id, payload);
           toast.success("Meal Plan updated!");
        } else {
           await apiService.addVendorProduct(vendorId, payload);
           toast.success("Meal Plan created!");
        }
        onSuccess();
    } catch (error) {
        console.error(error);
        toast.error("Failed to save meal plan");
    } finally {
        setLoading(false);
    }
  };

  const updateDayItem = (dayIndex: number, field: string, value: string) => {
    const newMenu = [...formData.dayMenu];
    // @ts-ignore
    newMenu[dayIndex][field] = value;
    setFormData(prev => ({ ...prev, dayMenu: newMenu }));
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="flex flex-col h-full bg-white font-primary">
      {/* Header */}
      <div className="p-6 border-b-[0.5px] border-gray-100 flex-shrink-0 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-medium text-gray-900">{existingPlan ? 'Update Meal Plan' : 'Create Weekly Subscription'}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Define your weekly menu and pricing strategy</p>
          </div>
          <button onClick={handleCancel} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-8 pb-48 px-6 flex flex-col bg-[#FAFAFA]" style={{ gap: '12px' }}>
        {/* Section 1: Visual Identity */}
        <section className="space-y-4 bg-white p-8 rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <Label className={labelStyle}>Plan Identifier Media</Label>
                <span className="text-[9px] text-gray-300 font-medium uppercase tracking-tight">Required High-Res Photo</span>
            </div>
            <ImageUpload 
                value={formData.image_url || formData.image} 
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url, image: url }))}
                className="aspect-video rounded-xl border-dashed border-[1.5px] bg-[#F9F9F9] border-gray-200 hover:border-gutzo-brand/30 transition-all flex flex-col items-center justify-center overflow-hidden"
                onUpload={async (file) => {
                  setLoading(true);
                  try {
                    const response = await apiService.uploadImage(file, vendorId, formData.id || "new_plan");
                    if (response.success && response.data.url) {
                      setFormData(prev => ({ ...prev, image_url: response.data.url, image: response.data.url }));
                      toast.success("Image uploaded!");
                    }
                  } catch (e) {
                    toast.error("Upload failed");
                  } finally {
                    setLoading(false);
                  }
                }}
            />
        </section>

        {/* Section 2: Basic Details */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
           <div className="space-y-2">
              <Label className={labelStyle}>Plan Title</Label>
              <Input 
                  placeholder="e.g. Traditional South Indian Thali" 
                  value={formData.name}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={getInputStyle('name')}
                  className="h-11 px-4 text-[13px]"
              />
           </div>
           <div className="space-y-2">
              <Label className={labelStyle}>Weekly Price (₹)</Label>
              <div className="relative">
                <Input 
                    type="number" 
                    placeholder="999" 
                    value={formData.price}
                    onFocus={() => setFocusedField('price')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    style={getInputStyle('price')}
                    className="h-11 px-4 text-[15px] font-semibold"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-medium text-[13px]">₹</div>
              </div>
           </div>
        </section>

        {/* Section 3: Description */}
        <section className="bg-white p-8 rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
            <div className="space-y-2">
                <Label className={labelStyle}>Plan Description</Label>
                <Textarea 
                    placeholder="Briefly describe the theme of this meal plan (e.g., balanced macros, home-style spices)..." 
                    value={formData.description}
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    style={{...getInputStyle('description'), minHeight: '100px'}}
                    className="px-4 py-3 text-[13px] leading-relaxed resize-none"
                />
            </div>
        </section>

        {/* Section 4: Weekly Menu Grid */}
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <Label className={labelStyle}>Weekly Rotation Menu</Label>
                <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-gray-300" />
                    <span className="text-[9px] text-gray-300 font-medium uppercase">Sat-Sun excluded by default</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6" style={{ gap: '24px' }}>
                {DAYS.map((day, idx) => (
                    <Card key={day} className="overflow-hidden border-[0.5px] border-gray-100 shadow-sm rounded-2xl bg-white hover:border-gutzo-brand/20 transition-all group">
                        <div className="bg-gray-50/50 px-6 py-3 border-b-[0.5px] border-gray-100 flex items-center justify-between">
                            <span className="text-[12px] font-bold text-gray-700 tracking-tight">{day}</span>
                            <div className="w-2 h-2 rounded-full bg-gutzo-brand shadow-sm"></div>
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-gray-400 font-bold uppercase inline-flex items-center gap-1">
                                        <Coffee className="w-2.5 h-2.5" /> Breakfast
                                    </Label>
                                    <Input 
                                        className="h-10 text-[12px] rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all px-3"
                                        placeholder="Poha..."
                                        value={formData.dayMenu[idx].breakfast_item}
                                        onChange={e => updateDayItem(idx, 'breakfast_item', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-gray-400 font-bold uppercase inline-flex items-center gap-1">
                                        <Sun className="w-2.5 h-2.5" /> Lunch
                                    </Label>
                                    <Input 
                                        className="h-10 text-[12px] rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all px-3"
                                        placeholder="Rice & Dal..."
                                        value={formData.dayMenu[idx].lunch_item}
                                        onChange={e => updateDayItem(idx, 'lunch_item', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-gray-400 font-bold uppercase inline-flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" /> Snacks
                                    </Label>
                                    <Input 
                                        className="h-10 text-[12px] rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all px-3"
                                        placeholder="Fruits..."
                                        value={formData.dayMenu[idx].snack_item}
                                        onChange={e => updateDayItem(idx, 'snack_item', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-gray-400 font-bold uppercase inline-flex items-center gap-1">
                                        <Moon className="w-2.5 h-2.5" /> Dinner
                                    </Label>
                                    <Input 
                                        className="h-10 text-[12px] rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all px-3"
                                        placeholder="Chapati..."
                                        value={formData.dayMenu[idx].dinner_item}
                                        onChange={e => updateDayItem(idx, 'dinner_item', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-auto p-6 bg-white border-t-[0.5px] border-gray-100 flex flex-row gap-4 flex-shrink-0 z-50 sticky bottom-0 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <Button 
            variant="ghost" 
            onClick={onCancel} 
            className="flex-1 h-12 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition-all border border-gray-200"
        >
            Discard
        </Button>
        <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-1 h-12 bg-gutzo-brand hover:bg-gutzo-brand-hover text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-gutzo-brand/20"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (existingPlan ? 'Update Plan' : 'Create Plan')}
        </Button>
      </div>
    </div>
  );
}
