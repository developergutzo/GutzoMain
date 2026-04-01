import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { 
  Loader2, Plus, Pencil, Trash2, X, 
  Image as ImageIcon, Check, ChevronsUpDown, 
  ShoppingBag, Calendar, Info, Settings, Calculator, IndianRupee 
} from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";
import { ImageWithFallback } from "../common/ImageWithFallback";
import { ImageUpload } from "../common/ImageUpload";
import { cn } from "../ui/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_pct?: number;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  category: string;
  diet_tags?: string[];
  meal_types?: string[];
  addon_ids?: string[];
}

interface Category {
  id: string;
  name: string;
}

const parseTagsFromDescription = (description: string): { cleanDescription: string, tags: string[] } => {
  if (!description) return { cleanDescription: '', tags: [] };
  const tagRegex = /\[TAGS:(.*?)\]$/;
  const match = description.match(tagRegex);
  if (match) {
    const tagsString = match[1];
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
    const cleanDescription = description.replace(tagRegex, '').trim();
    return { cleanDescription, tags };
  }
  return { cleanDescription: description, tags: [] };
};

export function MenuManager({ vendorId }: { vendorId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Main Course' },
    { id: '2', name: 'Breakfast' },
    { id: '3', name: 'Snacks' },
    { id: '4', name: 'Beverages' },
    { id: '5', name: 'Combos' }
  ]);

  useEffect(() => {
    if (vendorId) fetchMenu();
  }, [vendorId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVendorMenu(vendorId);
      const data = response?.data?.products || [];
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching menu:', error);
      toast.error("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (productId: string, current: boolean) => {
    try {
      await apiService.updateVendorProduct(vendorId, productId, { is_available: !current });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_available: !current } : p));
      toast.success(`Product ${!current ? 'available' : 'unavailable'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsEditing(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditing(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    try {
      await apiService.deleteVendorProduct(vendorId, productToDelete);
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1BA672] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Your Menu</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">Manage your dishes and prices</p>
        </div>
        <Button 
          onClick={handleAddProduct}
          className="bg-gutzo-brand hover:bg-gutzo-brand-hover text-white h-10 px-6 rounded-xl text-[13px] font-semibold active:scale-95 transition-all shadow-lg shadow-gutzo-brand/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const { cleanDescription, tags } = parseTagsFromDescription(product.description);
          return (
            <Card key={product.id} className="overflow-hidden border-[0.5px] border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl group flex flex-col h-full bg-white">
              <div 
                className="relative overflow-hidden w-full flex items-center justify-center bg-gray-50 h-[220px]"
              >
                 <ImageWithFallback 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                 />
                 <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {product.is_veg ? (
                        <span className="bg-white/90 backdrop-blur-sm p-1 rounded border border-green-200">
                            <div className="w-2.5 h-2.5 border-[1.5px] border-green-600 rounded-[2px] flex items-center justify-center">
                                <div className="w-1 h-1 bg-green-600 rounded-full" />
                            </div>
                        </span>
                    ) : (
                        <span className="bg-white/90 backdrop-blur-sm p-1 rounded border border-red-200">
                            <div className="w-2.5 h-2.5 border-[1.5px] border-red-600 rounded-[2px] flex items-center justify-center">
                                <div className="w-1 h-1 bg-red-600 rounded-full" />
                            </div>
                        </span>
                    )}
                 </div>
                 {product.discount_pct && product.discount_pct > 0 && (
                     <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                        {product.discount_pct}% OFF
                     </div>
                 )}
              </div>
              
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-semibold text-gray-900 text-[16px] group-hover:text-[#1BA672] transition-colors">{product.name}</h3>
                   <div className="flex flex-col items-end gap-1">
                    <span className="text-[15px] font-bold text-gray-900">₹{product.price}</span>
                    {product.original_price && product.original_price > product.price && (
                        <span className="text-[11px] text-gray-400 line-through">₹{product.original_price}</span>
                    )}
                   </div>
                </div>
                
                <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {cleanDescription || 'No description provided'}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                   {tags.map((tag: string, idx: number) => {
                       const isInstant = tag.includes('Instant');
                       const isSub = tag.includes('Subscription');
                       return (
                           <span 
                                key={idx} 
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border-[0.5px] h-6 flex items-center transition-all ${
                                    isInstant ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                    isSub ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                    'bg-gutzo-brand-light text-gutzo-brand border-gutzo-brand-light'
                                }`}
                           >
                               {tag.replace('Type:', '')}
                           </span>
                       )
                   })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t-[0.5px] border-gray-100">
                   <div className="flex items-center gap-2">
                    <Switch 
                        checked={product.is_available} 
                        onCheckedChange={() => toggleAvailability(product.id, product.is_available)} 
                        className="data-[state=checked]:bg-gutzo-brand"
                    />
                    <span className="text-[11px] font-medium text-gray-500">Available</span>
                   </div>
                   <div className="flex gap-2">
                    <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-gray-400 hover:text-[#1BA672] hover:bg-[#E8F6F1] rounded-lg transition-all"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setProductToDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                   </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <button 
          onClick={handleAddProduct}
          className="border-[0.5px] border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 bg-gray-50/20 hover:bg-gray-50 hover:border-[#1BA672]/30 transition-all group h-full min-h-[280px]"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm border-[0.5px] border-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-gutzo-brand" />
          </div>
          <p className="text-[13px] font-semibold text-gray-900 mb-1">Add New Item</p>
          <span className="text-[11px] text-gray-400">Expand your kitchen's offerings</span>
        </button>
      </div>

      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent side="right" className="w-[500px] sm:max-w-[500px] p-0 overflow-hidden flex flex-col border-l-[0.5px] border-gray-100 shadow-2xl">
          {isEditing && (
            <ProductForm
              vendorId={vendorId}
              product={editingProduct}
              products={products}
              categories={categories}
              onClose={() => setIsEditing(false)}
              onSuccess={() => { setIsEditing(false); fetchMenu(); }}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-[0.5px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This will permanently remove "{products.find(p => p.id === productToDelete)?.name}" from your digital menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-200 px-6 font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 font-semibold">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ProductFormProps {
  vendorId: string;
  product: Product | null;
  products?: Product[];
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

function ProductForm({ vendorId, product, products = [], categories, onClose, onSuccess }: ProductFormProps) {
  const { cleanDescription, tags: descriptionTags } = parseTagsFromDescription(product?.description || '');
  let initialTags = descriptionTags.length > 0 ? descriptionTags : (product?.diet_tags || product?.meal_types || []);

  if (!initialTags.some((t: string) => t === 'Type:Instant' || t === 'Type:Subscription')) {
    initialTags = [...initialTags, 'Type:Instant'];
  }

  const [formData, setFormData] = useState({
    id: product?.id || uuidv4(),
    name: product?.name || '',
    description: cleanDescription,
    original_price: product?.original_price || product?.price || '',
    discount_pct: product?.discount_pct || 0,
    price: product?.price || 0,
    image_url: product?.image_url || '',
    is_veg: product?.is_veg !== undefined ? product?.is_veg : true,
    is_available: product?.is_available !== undefined ? product?.is_available : true,
    category: product?.category || (categories[0]?.name || ''),
    diet_tags: initialTags,
    addon_ids: product?.addon_ids || []
  });

  const [loading, setLoading] = useState(false);
  const [openAddonSelect, setOpenAddonSelect] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getInputStyle = (fieldId: string) => {
    const isFocused = focusedField === fieldId;
    return {
      backgroundColor: isFocused ? '#FFFFFF' : '#F9F9F9',
      border: isFocused ? '1px solid #1BA672' : '1px solid #D1D5DB',
      boxShadow: isFocused ? '0 0 0 4px rgba(27, 166, 114, 0.08)' : 'none',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.2s ease',
    };
  };

  const labelStyle = "text-[10px] font-medium text-gray-400 uppercase tracking-wider ml-1";

  const goalTagsList = [
    "High Protein", "Low Calorie", "High Fibre", "Gut Friendly", "Detox", "Post Workout"
  ];

  useEffect(() => {
    const original = Number(formData.original_price) || 0;
    const pct = Number(formData.discount_pct) || 0;
    const final = Math.round(original * (1 - pct / 100));
    setFormData(prev => ({ ...prev, price: final }));
  }, [formData.original_price, formData.discount_pct]);

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      const isType = tag.startsWith('Type:');
      let newTags = [...prev.diet_tags];

      if (isType) {
        newTags = newTags.filter(t => !t.startsWith('Type:'));
        newTags.push(tag);
      } else {
        if (newTags.includes(tag)) {
          newTags = newTags.filter(t => t !== tag);
        } else {
          newTags.push(tag);
        }
      }
      return { ...prev, diet_tags: newTags };
    });
  };

  const toggleAddon = (id: string) => {
    setFormData(prev => ({
      ...prev,
      addon_ids: prev.addon_ids.includes(id) 
        ? prev.addon_ids.filter(a => a !== id) 
        : [...prev.addon_ids, id]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.original_price) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      setLoading(true);
      const taggedDescription = `${formData.description} [TAGS:${formData.diet_tags.join(',')}]`.trim();
      const submissionData = {
        ...formData,
        description: taggedDescription,
        price: Number(formData.price),
        original_price: Number(formData.original_price),
        discount_pct: Number(formData.discount_pct)
      };

      if (product) {
        await apiService.updateVendorProduct(vendorId, product.id, submissionData);
        toast.success("Dish updated!");
      } else {
        await apiService.addVendorProduct(vendorId, submissionData);
        toast.success("Dish published!");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save dish");
    } finally {
      setLoading(false);
    }
  };

  const otherProducts = products.filter(p => p.id !== product?.id);

  return (
    <div className="flex flex-col h-full bg-white font-primary">
      <SheetHeader className="p-6 border-b-[0.5px] border-gray-100 flex-shrink-0 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle className="text-[20px] font-medium text-gray-900">Add New Item - Spaced</SheetTitle>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {product ? 'Customize and fine-tune your dish details' : 'List a new masterpiece on your digital menu'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
      </SheetHeader>

        <div className="flex-1 overflow-y-auto pt-8 pb-48 px-6 flex flex-col bg-[#FAFAFA]" style={{ gap: '12px' }}>
        {/* Section 1: Media Hero */}
        <section className="space-y-4 bg-white p-8 rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <Label className={labelStyle}>Product Media</Label>
                <span className="text-[9px] text-gray-300 font-medium uppercase tracking-tight">Optional High-Res Photo</span>
            </div>
            <ImageUpload 
                value={formData.image_url} 
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                className="aspect-video rounded-xl border-dashed border-[1.5px] bg-[#F9F9F9] border-gray-200 hover:border-gutzo-brand/30 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden"
            />
        </section>

        {/* Section 2: Dish Name */}
        <section className="bg-white rounded-2xl border-[0.5px] border-gray-100 p-8 shadow-sm">
           <div className="space-y-2">
              <Label htmlFor="dish-name" className={labelStyle}>Dish Name</Label>
              <Input 
                  id="dish-name" 
                  placeholder="e.g. Classic Paneer Tikka" 
                  value={formData.name}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-11 px-4 text-[13px] font-normal"
                  style={getInputStyle('name')}
              />
           </div>
        </section>

        {/* Section 2b: Description */}
        <section className="bg-white rounded-2xl border-[0.5px] border-gray-100 p-8 shadow-sm">
           <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className={labelStyle}>Brief Description</Label>
                <span className="text-[9px] text-gray-300 font-medium">{formData.description.length}/200</span>
              </div>
              <Textarea 
                  id="description" 
                  placeholder="What makes this dish special? Add ingredients, spices, or notes..." 
                  rows={3} 
                  value={formData.description}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="px-4 py-3 text-[13px] leading-relaxed resize-none"
                  style={{...getInputStyle('description'), minHeight: '100px'}}
              />
           </div>
        </section>

        {/* Section 3: Pricing Calculator */}
        <section className="bg-white p-8 rounded-2xl border-[0.5px] border-gray-100 space-y-8 shadow-sm">
           <div className="flex items-center gap-2">
              <h3 className={labelStyle}>Pricing Calculator</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className={labelStyle}>Original Listing (₹)</Label>
                <div className="relative">
                  <Input 
                      type="number" 
                      value={formData.original_price}
                      onFocus={() => setFocusedField('original_price')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                      className="h-11 px-4 text-[15px] font-semibold"
                      style={getInputStyle('original_price')}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-medium text-[13px]">₹</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelStyle}>Discount (%)</Label>
                <div className="relative">
                  <Input 
                      type="number" 
                      max={100}
                      value={formData.discount_pct}
                      onFocus={() => setFocusedField('discount_pct')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_pct: Number(e.target.value) }))}
                      className="h-11 px-4 text-[15px] font-semibold text-gutzo-cta"
                      style={getInputStyle('discount_pct')}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gutzo-cta/30 font-medium text-[13px]">%</div>
                </div>
              </div>
           </div>

           <div className="pt-4 border-t border-gray-50">
              <div className="bg-[#E8F6F1] rounded-xl p-4 flex items-center justify-between border border-[#CDEBDD]">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#0F6E56] uppercase tracking-tight">Customer Checkout</span>
                  </div>
                  <span className="text-[9px] text-[#0F6E56]/60 font-medium mt-0.5 italic">Final price on marketplace</span>
                </div>
                <div className="flex flex-col items-end text-[#0F6E56]">
                   <div className="flex items-baseline gap-1">
                      <span className="text-[24px] font-bold tracking-tight">₹{formData.price}</span>
                      <span className="text-[9px] font-medium uppercase">Net</span>
                   </div>
                </div>
              </div>
           </div>
        </section>

        {/* Section 4: Configuration Controls */}
        <section className="space-y-10 p-8 bg-white rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
           <div className="space-y-4">
              <Label className={labelStyle}>Food Diet Identifier</Label>
              <div className="bg-[#F9F9F9] p-1 rounded-xl border border-gray-100 flex gap-1 h-11">
                 <button 
                    onClick={() => setFormData(prev => ({ ...prev, is_veg: true }))}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-all ${formData.is_veg ? 'bg-white text-green-600 shadow-sm border-[0.5px] border-gray-100' : 'text-gray-400 grayscale'}`}
                 >
                    <div className={`w-2 h-2 rounded-full ${formData.is_veg ? 'bg-green-600' : 'bg-gray-300'}`} />
                    Veg
                 </button>
                 <button 
                    onClick={() => setFormData(prev => ({ ...prev, is_veg: false }))}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-all ${!formData.is_veg ? 'bg-white text-gray-900 shadow-sm border-[0.5px] border-gray-100' : 'text-gray-400 grayscale'}`}
                 >
                    <div className={`w-2 h-2 rounded-full ${!formData.is_veg ? 'bg-gray-900' : 'bg-gray-300'}`} />
                    Non-Veg
                 </button>
              </div>
           </div>

            <div className="py-6">
               <div className="border-t border-gray-100 border-dashed" />
            </div>

            <div className="space-y-4">
               <div className="flex flex-col gap-1">
                 <Label className={labelStyle}>Menu Category</Label>
                 <p className="text-[10px] text-gray-400 ml-1">Pick one main category</p>
               </div>
               <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                     const isSelected = formData.category === c.name;
                     return (
                         <button
                             key={c.id}
                             type="button"
                             onClick={() => setFormData(prev => ({ ...prev, category: c.name }))}
                             className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-all ${
                                 isSelected 
                                 ? 'bg-gutzo-brand text-white border-gutzo-brand shadow-sm' 
                                 : 'bg-white text-gray-400 border-gray-100 hover:border-gutzo-brand/30'
                             }`}
                         >
                             {c.name}
                         </button>
                     )
                  })}
               </div>
            </div>

            <div className="py-6">
               <div className="border-t border-gray-100 border-dashed" />
            </div>

            <div className="space-y-4">
               <div className="flex flex-col gap-1">
                 <Label className={labelStyle}>Goal Tags</Label>
                 <p className="text-[10px] text-gray-400 ml-1">Attributes that support health goals</p>
               </div>
               <div className="flex flex-wrap gap-2">
                 {goalTagsList.map((tag) => {
                    const isSelected = formData.diet_tags.includes(tag);
                    return (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-all ${
                                isSelected 
                                ? 'bg-gutzo-brand text-white border-gutzo-brand shadow-sm scale-105' 
                                : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                            {tag}
                        </button>
                    )
                 })}
              </div>
           </div>
        </section>

        {/* Section 5: Order Service Types */}
        <section className="space-y-6 p-8 bg-white rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
           <div className="flex items-center gap-2">
             <Label className={labelStyle}>Service Channel</Label>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => toggleTag('Type:Instant')}
                className={`flex flex-col items-start p-6 rounded-2xl border-[1.5px] transition-all relative overflow-hidden h-36 border-2 ${formData.diet_tags.includes('Type:Instant') ? 'border-gutzo-brand bg-[#E8F6F1] shadow-sm' : 'border-gray-50 bg-[#F9F9F9] text-gray-400 hover:border-gray-200'}`}
              >
                {formData.diet_tags.includes('Type:Instant') && (
                    <div className="absolute top-4 right-4 w-7 h-7 bg-gutzo-brand rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                )}
                <div className={`w-11 h-11 rounded-xl mb-auto flex items-center justify-center transition-all ${formData.diet_tags.includes('Type:Instant') ? 'bg-white text-gutzo-brand' : 'bg-white text-gray-300'}`}>
                    <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left mt-2 whitespace-nowrap">
                    <p className={`text-[15px] font-semibold tracking-tight ${formData.diet_tags.includes('Type:Instant') ? 'text-[#0F6E56]' : 'text-gray-400'}`}>Instant Order</p>
                    <p className="text-[10px] font-medium opacity-60">Quick Dispatch</p>
                </div>
              </button>
              
              <button 
                onClick={() => toggleTag('Type:Subscription')}
                className={`flex flex-col items-start p-6 rounded-2xl border-[1.5px] transition-all relative overflow-hidden h-36 border-2 ${formData.diet_tags.includes('Type:Subscription') ? 'border-gutzo-brand bg-[#E8F6F1] shadow-sm' : 'border-gray-50 bg-[#F9F9F9] text-gray-400 hover:border-gray-200'}`}
             >
                {formData.diet_tags.includes('Type:Subscription') && (
                    <div className="absolute top-4 right-4 w-7 h-7 bg-gutzo-brand rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                )}
                <div className={`w-11 h-11 rounded-xl mb-auto flex items-center justify-center transition-all ${formData.diet_tags.includes('Type:Subscription') ? 'bg-white text-gutzo-brand' : 'bg-white text-gray-300'}`}>
                    <Calendar className="w-5 h-5" />
                </div>
                <div className="text-left mt-2 whitespace-nowrap">
                    <p className={`text-[15px] font-semibold tracking-tight ${formData.diet_tags.includes('Type:Subscription') ? 'text-[#0F6E56]' : 'text-gray-400'}`}>Meal Plan</p>
                    <p className="text-[10px] font-medium opacity-60">Scheduled Orders</p>
                </div>
             </button>
          </div>
        </section>

        {/* Section 6: Advanced Add-ons */}
        {formData.diet_tags.includes('Type:Instant') && (
            <section className="space-y-6 p-8 bg-white rounded-2xl border-[0.5px] border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <Label className={labelStyle}>Premium Pairings</Label>
                    <span className="text-[9px] text-gray-300 font-medium uppercase">Cross-Sell Strategy</span>
                </div>
                
                <Popover open={openAddonSelect} onOpenChange={setOpenAddonSelect}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-auto min-h-[56px] rounded-xl border-gray-200 bg-[#F9F9F9] px-6 py-3 hover:bg-gray-50 flex items-center">
                            <div className="flex flex-wrap gap-2">
                                {formData.addon_ids.length ? formData.addon_ids.map((id: string) => (
                                    <div key={id} className="bg-gutzo-brand text-white text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-2 font-semibold shadow-sm">
                                        {products.find(p => p.id === id)?.name}
                                        <button onClick={(e) => { e.stopPropagation(); toggleAddon(id); }} className="hover:bg-white/20 p-0.5 rounded-full">
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                )) : <span className="text-gray-400 font-medium italic text-[13px]">Select complementary dishes...</span>}
                            </div>
                            <Plus className="w-4 h-4 text-gray-300" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-1 shadow-xl rounded-xl border-gray-100" align="end">
                        <Command className="bg-white border-none outline-none">
                            <CommandInput placeholder="Search menu..." className="h-10 px-4 border-none text-[13px] font-medium" />
                            <CommandList className="max-h-[300px] p-1">
                                <CommandEmpty className="py-8 text-center text-xs text-gray-400 font-medium italic">No dishes match your search.</CommandEmpty>
                                <CommandGroup>
                                    {otherProducts.map(p => (
                                        <CommandItem key={p.id} onSelect={() => toggleAddon(p.id)} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-gutzo-brand-light transition-all mb-0.5 last:mb-0">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${formData.addon_ids.includes(p.id) ? 'bg-gutzo-brand border-gutzo-brand' : 'border-gray-200 bg-white'}`}>
                                                {formData.addon_ids.includes(p.id) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <span className="text-[13px] font-semibold text-gray-800 leading-tight">{p.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium uppercase">₹{p.price}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </section>
        )}
      </div>

      <div className="mt-auto p-6 bg-white border-t-[0.5px] border-gray-100 flex flex-row gap-4 flex-shrink-0 z-50 sticky bottom-0 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
        <Button 
            variant="ghost" 
            onClick={onClose} 
            className="flex-1 h-12 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition-all border border-gray-200"
        >
            Discard
        </Button>
        <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-1 h-12 bg-gutzo-brand hover:bg-gutzo-brand-hover text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-gutzo-brand/20"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (product ? 'Update Dish' : 'Publish Dish')}
        </Button>
      </div>
    </div>
  );
}
