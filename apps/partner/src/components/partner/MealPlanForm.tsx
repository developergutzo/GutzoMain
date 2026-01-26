import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { Calendar, Plus, Trash2, Save, X, Utensils, Sun, Moon, Coffee, ImageIcon, Upload } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] w-full overflow-hidden border">
       <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{existingPlan ? 'Edit Meal Plan' : 'Create Weekly Meal Plan'}</h2>
          <p className="text-sm text-gray-500">Update your plan details and image</p>
       </div>
       
       <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-sm font-medium">Plan Title</Label>
                   <Input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. South Indian Combo" 
                      required 
                      className="h-11"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-sm font-medium">Weekly Price (₹)</Label>
                   <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                      required 
                      className="h-11"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea 
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})} 
                   placeholder="Describe what's special about this plan..."
                   className="min-h-[100px] resize-none"
                />
             </div>

             <div className="space-y-4">
                <Label className="text-sm font-medium">Meal Plan Image</Label>
                
                {/* 
                   ROBUST UPLOAD FIX:
                   1. Input is completely separate from the UI trigger (no nesting).
                   2. Input is hidden via sr-only (not display: none) to ensure browser security allows click.
                   3. UI is a standard Div with an explicit click handler.
                   4. stopPropagation() is used to prevent any bubble-up issues.
                */}
                <input 
                    id="meal-plan-image-upload"
                    type="file" 
                    accept="image/*" 
                    className="sr-only" 
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        console.log("File input changed:", file?.name);
                        if (!file) {
                             // User might have cancelled file dialog
                             return;
                        }
                        
                        setLoading(true);
                        const toastId = toast.loading("Uploading image...");
                        
                        try {
                            const productId = formData.id || "new_plan";
                            const response = await apiService.uploadImage(file, vendorId, productId);
                            
                            if (response.success && response.data.url) {
                                setFormData({ ...formData, image_url: response.data.url, image: response.data.url });
                                toast.success("Image uploaded successfully!", { id: toastId });
                            } else {
                                throw new Error("Upload failed");
                            }
                        } catch (error) {
                            console.error("Upload error:", error);
                            toast.error("Failed to upload image", { id: toastId });
                        } finally {
                            setLoading(false);
                        }
                    }}
                />

                <div className="relative group">
                    <div 
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all border-gray-200 hover:border-gutzo-primary min-h-[200px] cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Upload container clicked. Triggering input.");
                            const fileInput = document.getElementById('meal-plan-image-upload');
                            if (fileInput) {
                                fileInput.click();
                            } else {
                                toast.error("Upload interface error: Input not found");
                            }
                        }}
                    >
                        {(formData.image_url || formData.image) ? (
                            <div className="relative pointer-events-none">
                                <div className="w-56 h-56 rounded-xl overflow-hidden border-4 border-white shadow-xl">
                                    <img 
                                        src={formData.image_url || formData.image} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <div className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2 text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                        <ImageIcon size={18} /> Change Image
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm border flex items-center justify-center text-gray-400 group-hover:text-gutzo-primary group-hover:scale-110 transition-all">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-gray-700">Click to upload image</p>
                                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG (Max 5MB)</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 pointer-events-none">
                            <span className="bg-white border border-gray-300 shadow-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2">
                                <Upload size={14} /> Select Image File
                            </span>
                        </div>
                    </div>
                </div>
             </div>


             <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
                 <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 h-12 rounded-xl">Cancel</Button>
                 <Button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl bg-gutzo-primary text-white font-semibold">
                    {loading ? 'Processing...' : (existingPlan ? 'Update Plan' : 'Create Meal Plan')}
                 </Button>
             </div>
          </form>
       </div>
    </div>
  );
}
