import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { Calendar, Plus, Trash2, Save, X, Utensils, Sun, Moon, Coffee } from "lucide-react";

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
}

interface MealPlanFormProps {
  vendorId: string;
  existingPlan?: MealPlanFormData | null;
  onSuccess: () => void;
  onCancel: () => void;
  onClose?: () => void; // Added for compatibility
}

export function MealPlanForm({ vendorId, existingPlan, onSuccess, onCancel, onClose }: MealPlanFormProps) {
  const handleCancel = onCancel || onClose || (() => {});
  const [formData, setFormData] = useState<MealPlanFormData>(existingPlan || {
    name: "",
    price: 0,
    description: "",
    image_url: "",
    dayMenu: Array.from({ length: 6 }).map((_, i) => ({
      day_of_week: i + 1, // Mon (1) to Sat (6)
      breakfast_item: "",
      lunch_item: "",
      dinner_item: "",
      snack_item: ""
    }))
  });
  
  const [loading, setLoading] = useState(false);

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

        // If creating new or updating
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

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="w-full max-w-4xl mx-auto h-[90vh] flex flex-col">
       <CardHeader>
          <CardTitle>Create Weekly Meal Plan</CardTitle>
          <CardDescription>Define your menu for the week</CardDescription>
       </CardHeader>
       <CardContent className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Plan Title</Label>
                   <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. South Indian Combo" 
                      required 
                   />
                </div>
                <div className="space-y-2">
                   <Label>Weekly Price (₹)</Label>
                   <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                      required 
                   />
                </div>
             </div>

             <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})} 
                />
             </div>

              {/* 
                  Weekly menu is now managed in the dedicated editor after creation.
                  This form is only for the Plan metadata.
              */}

             <div className="flex gap-3 pt-4 border-t bg-white sticky bottom-0 z-10 pb-2">
                 <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
                 <Button type="submit" disabled={loading} className="flex-1 bg-gutzo-primary text-white">
                    {loading ? 'Saving...' : 'Save Meal Plan'}
                 </Button>
             </div>
          </form>
       </CardContent>
    </Card>
  );
}
