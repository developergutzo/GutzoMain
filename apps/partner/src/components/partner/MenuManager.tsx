import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Loader2, Plus, Pencil, Trash2, X, Image as ImageIcon, Check, ChevronsUpDown } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";
import { ImageWithFallback } from "../common/ImageWithFallback";
import { ImageUpload } from "../common/ImageUpload";
import { cn } from "../ui/utils";
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
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  category: string;
  addon_ids?: string[];
  meal_types?: string[]; // Deprecated client-side, using diet_tags
  diet_tags?: string[];
}

interface Category {
  id: string;
  name: string;
}

interface MenuManagerProps {
  vendorId: string;
}

export function MenuManager({ vendorId }: MenuManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [vendorId]);

  const fetchData = async () => {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        apiService.getVendorMenu(vendorId),
        apiService.getCategories()
      ]);

      if (menuRes.success && menuRes.data) {
        setProducts(menuRes.data.products);
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      } else if (Array.isArray(categoriesRes)) {
         setCategories(categoriesRes);
      }
    } catch (error) {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
      try {
        const res = await apiService.getVendorMenu(vendorId);
        if (res.success && res.data) {
            setProducts(res.data.products);
        }
      } catch(e) { console.error(e); }
  };

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await apiService.deleteVendorProduct(vendorId, productToDelete);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete));
        toast.success('Item deleted');
      }
    } catch (error) {
      toast.error('Failed to delete item');
      setProductToDelete(null);
    }
  };

  const toggleAvailability = async (product: Product) => {
    const newStatus = !product.is_available;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: newStatus } : p));
    try {
      const res = await apiService.updateVendorProduct(vendorId, product.id, { is_available: newStatus });
      if (res.success) {
        toast.success(`Item marked as ${newStatus ? 'Available' : 'Unavailable'}`);
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: !newStatus } : p));
      toast.error('Failed to update status');
    }
  };

  const handleAddProduct = () => {
     setEditingProduct(null);
     setIsEditing(true);
  };
  
  if (loading) return <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Your Menu</h2>
           <p className="text-sm text-gray-500">Manage your dishes and prices</p>
        </div>
        <Button 
          onClick={handleAddProduct} 
          className="shadow-sm"
          style={{ backgroundColor: '#1BA672', color: 'white' }}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex gap-4">
              {/* Thumbnail Image */}
              <div className="w-24 h-24 bg-gray-100 relative rounded-lg overflow-hidden shrink-0">
                 <ImageWithFallback src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                 {!product.is_available && (
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-[10px] bg-red-500 px-1 py-0.5 rounded">SOLD OUT</span>
                   </div>
                 )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col">
                 <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                      <p className="text-sm text-[#1BA672] font-semibold mt-0.5">₹{product.price}</p>
                    </div>
                     <div className="flex items-center gap-2">
                          <div className={`shrink-0 w-3 h-3 rounded-full border ${product.is_veg ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'} flex items-center justify-center`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${product.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          </div>
                          {(() => {
                              // Check availability type to disable toggle for Subscription Only items
                              const { tags } = parseTagsFromDescription(product.description || '');
                              const allTags = new Set([...(product.diet_tags || []), ...(product.meal_types || []), ...tags]);
                              const isInstant = allTags.has('Type:Instant');
                              const isSubscription = allTags.has('Type:Subscription');
                              // It is subscription ONLY if it has Subscription tag AND no Instant tag
                              // Legacy items (no tags) are treated as Instant, so we check if tags exist at all
                              const hasAnyType = isInstant || isSubscription;
                              const isSubscriptionOnly = hasAnyType && isSubscription && !isInstant;

                              if (isSubscriptionOnly) return null;

                              return (
                                  <div onClick={(e) => e.stopPropagation()} title="Toggle Availability">
                                    <Switch 
                                        checked={product.is_available} 
                                        onCheckedChange={() => toggleAvailability(product)}
                                        className="scale-75 data-[state=checked]:bg-[#1BA672]"
                                    />
                                  </div>
                              );
                          })()}
                     </div>
                 </div>
                 
                 <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
                 
                 <div className="flex gap-2 mt-auto">
                    <Button variant="outline" size="sm" className="h-8 text-xs flex-1" onClick={() => { setEditingProduct(product); setIsEditing(true); }}>
                       <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDelete(product.id)}>
                       <Trash2 className="w-3 h-3" />
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
             <p className="text-gray-500">No items in your menu yet.</p>
             <Button variant="link" onClick={() => { setEditingProduct(null); setIsEditing(true); }} className="text-[#1BA672]">
                Add your first dish
             </Button>
          </div>
        )}
      </div>

      {/* Edit/Add Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-xl w-full max-w-lg shadow-xl my-8">
              <ProductForm 
                 vendorId={vendorId} 
                 product={editingProduct} 
                 products={products}
                 categories={categories}
                 onClose={() => setIsEditing(false)} 
                 onSuccess={() => { setIsEditing(false); fetchMenu(); }} 
              />
           </div>
        </div>

      )}

      {/* Edit/Add Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-xl w-full max-w-lg shadow-xl my-8">
              <ProductForm 
                 vendorId={vendorId} 
                 product={editingProduct} 
                 products={products}
                 categories={categories}
                 onClose={() => setIsEditing(false)} 
                 onSuccess={() => { setIsEditing(false); fetchMenu(); }} 
              />
           </div>
        </div>

      )}

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white" style={{ backgroundColor: '#dc2626', color: 'white' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const TAG_PREFIX = "[TAGS:";
const TAG_SUFFIX = "]";

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

interface ProductFormProps {
    vendorId: string;
    product: Product | null;
    products?: Product[];
    categories: Category[];
    onClose: () => void;
    onSuccess: () => void;
}

function ProductForm({ vendorId, product, products = [], categories, onClose, onSuccess }: ProductFormProps) {
    // Calculate initial parent links (products that have THIS product as an addon)
    const initialParentIds = product 
      ? products.filter(p => p.addon_ids?.includes(product.id)).map(p => p.id)
      : [];

    // Parse tags from description if present
    const { cleanDescription, tags: descriptionTags } = parseTagsFromDescription(product?.description || '');
    let initialTags = descriptionTags.length > 0 ? descriptionTags : (product?.diet_tags || product?.meal_types || []);
    
    // Backward compatibility: If no availability type is set, assume Instant
    // This ensures existing products show the Add-on/Links section by default
    if (!initialTags.some(t => t === 'Type:Instant' || t === 'Type:Subscription')) {
        initialTags = [...initialTags, 'Type:Instant'];
    }

    const [formData, setFormData] = useState({
        id: product?.id || uuidv4(), // Generate ID if new
        name: product?.name || '',
        description: cleanDescription,
        price: product?.price || '',
        image_url: product?.image_url || '',
        is_veg: product?.is_veg ?? true,
        is_available: product?.is_available ?? true,
        category: product?.category || (categories[0]?.name || 'Main Course'),
        addon_ids: product?.addon_ids || [],
        parent_product_ids: initialParentIds,
        meal_types: [],
        diet_tags: initialTags
    });
    const [loading, setLoading] = useState(false);
    const [openParentSelect, setOpenParentSelect] = useState(false);
    const [openAddonSelect, setOpenAddonSelect] = useState(false);
    const [pendingImage, setPendingImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalImageUrl = formData.image_url;

            if (pendingImage) {
                const res = await apiService.uploadImage(pendingImage, vendorId, formData.id);
                if (res.success && res.data.url) {
                    finalImageUrl = res.data.url;
                } else {
                    throw new Error('Image upload failed');
                }
            }

            // Ensure explicit availability tagging
            // If user unchecks both Instant and Subscription, we mark it as Type:None
            // to distinguish it from legacy products (which have no tags but should default to Instant)
            let effectiveTags = formData.diet_tags || [];
            
            // Remove Type:None if it exists to start fresh
            effectiveTags = effectiveTags.filter(t => t !== 'Type:None');
            
            const hasInstant = effectiveTags.includes('Type:Instant');
            const hasSubscription = effectiveTags.includes('Type:Subscription');
            
            if (!hasInstant && !hasSubscription) {
                effectiveTags.push('Type:None');
            }

            // Append tags to description
            let finalDescription = formData.description;
            if (effectiveTags.length > 0) {
                const uniqueTags = Array.from(new Set(effectiveTags));
                finalDescription = `${finalDescription.trim()} [TAGS:${uniqueTags.join(',')}]`;
            }

            // Create payload WITHOUT diet_tags to avoid backend 500 error
            // We store tags in the description instead
            const { diet_tags, meal_types, ...rest } = formData;
            const payload = { 
                ...rest, 
                description: finalDescription,
                price: Number(formData.price), 
                image_url: finalImageUrl 
            };

            if (product) {
               await apiService.updateVendorProduct(vendorId, product.id, payload);
               toast.success('Product updated');
            } else {
               await apiService.addVendorProduct(vendorId, payload);
               toast.success('Product added');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const toggleMealType = (type: string) => {
        setFormData(prev => {
            const current = (prev.diet_tags || []) as string[];
            if (current.includes(type)) return { ...prev, diet_tags: current.filter(t => t !== type) };
            return { ...prev, diet_tags: [...current, type] };
        });
    };

    const toggleAddonForThis = (id: string) => {
        setFormData(prev => {
            const current = prev.addon_ids || [];
            if (current.includes(id)) return { ...prev, addon_ids: current.filter(x => x !== id) };
            return { ...prev, addon_ids: [...current, id] };
        });
    };

    const toggleLinkToParent = (id: string) => {
        setFormData(prev => {
            const current = prev.parent_product_ids || [];
            if (current.includes(id)) return { ...prev, parent_product_ids: current.filter(x => x !== id) };
            return { ...prev, parent_product_ids: [...current, id] };
        });
    };

    // Eliminate self from lists
    const otherProducts = products.filter(p => !product || p.id !== product.id);

    return (
        <div>
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold text-lg">{product ? 'Edit Item' : 'Add New Item'}</h3>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" required value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Chicken Biryani" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input id="price" type="number" required value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="120" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                            value={formData.category} 
                            onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                                {/* Fallback or Custom option if needed? For now strict select */}
                                {categories.length === 0 && <SelectItem value="Main Course">Main Course</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Ingredients, portion size..." />
                </div>

                <div className="space-y-2">
                    <Label>Product Image</Label>
                    <ImageUpload 
                        value={formData.image_url} 
                        onChange={(val) => {
                            // Only update if clearing (empty string)
                            if (val === '') {
                                setFormData(prev => ({ ...prev, image_url: '' }));
                                setPendingImage(null);
                            } else if (val.startsWith('data:')) {
                                console.warn("Received base64 image in onChange, ignoring in favor of onUpload");
                            } else {
                                setFormData(prev => ({ ...prev, image_url: val }));
                            }
                        }}
                        onUpload={async (file) => {
                             // Create local preview and stage for upload
                             const previewUrl = URL.createObjectURL(file);
                             setFormData(prev => ({ ...prev, image_url: previewUrl }));
                             setPendingImage(file);
                        }}
                        maxSizeMB={5}
                    />
                </div>

                {/* Availability Channel Selection */}
                <div className="space-y-2 border-t pt-4 mt-4">
                    <Label className="font-semibold text-base">Availability Channel</Label>
                    <p className="text-xs text-gray-500 mb-2">Where should this item be sold?</p>
                    <div className="flex gap-6">
                         <div className="flex items-center gap-2">
                             <Checkbox 
                                 id="channel-instant" 
                                 checked={formData.diet_tags?.includes('Type:Instant')} 
                                 onCheckedChange={() => toggleMealType('Type:Instant')} 
                             />
                             <Label htmlFor="channel-instant" className="cursor-pointer font-medium">Instant Order</Label>
                         </div>
                         <div className="flex items-center gap-2">
                             <Checkbox 
                                 id="channel-sub" 
                                 checked={formData.diet_tags?.includes('Type:Subscription')} 
                                 onCheckedChange={() => toggleMealType('Type:Subscription')} 
                             />
                             <Label htmlFor="channel-sub" className="cursor-pointer font-medium">Meal Plan (Subscription)</Label>
                         </div>
                    </div>
                </div>

                {/* Meal Types Selection (Only for Subscription) */}
                {formData.diet_tags?.includes('Type:Subscription') && (
                    <div className="space-y-2 border-t pt-4 mt-4 bg-green-50/50 p-3 rounded-md">
                        <Label className="text-[#1BA672] font-semibold">Meal Plan Settings</Label>
                        <p className="text-xs text-gray-500 mb-2">Select which meal slots this item fits into.</p>
                        <div className="flex flex-wrap gap-4">
                            {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(type => (
                                <div key={type} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={`meal-${type}`} 
                                        checked={formData.diet_tags?.includes(type)} 
                                        onCheckedChange={() => toggleMealType(type)} 
                                    />
                                    <Label htmlFor={`meal-${type}`} className="cursor-pointer">{type}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add-ons Section (Only for Instant) */}
                {formData.diet_tags?.includes('Type:Instant') && (
                <div className="grid md:grid-cols-2 gap-4 border rounded-lg p-3 bg-gray-50 mt-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-gray-500">Add Add-ons to {formData.name || 'this item'}</Label>
                        <Popover open={openAddonSelect} onOpenChange={setOpenAddonSelect} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openAddonSelect}
                                    disabled={formData.parent_product_ids && formData.parent_product_ids.length > 0}
                                    className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formData.addon_ids && formData.addon_ids.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.addon_ids.map(id => {
                                            const p = products.find(prod => prod.id === id);
                                            return p ? (
                                                <span key={id} className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border">
                                                    {p.name}
                                                    <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleAddonForThis(id); }} />
                                                </span>
                                            ) : null
                                        })}
                                    </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">Select add-ons...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0 z-[9999]" align="start">
                                <Command>
                                    <CommandInput placeholder="Search products..." />
                                    <CommandList className="max-h-[200px] overflow-auto">
                                        <CommandEmpty>No product found.</CommandEmpty>
                                        {otherProducts.map((p) => (
                                            <CommandItem
                                                key={p.id}
                                                value={p.name}
                                                onSelect={() => toggleAddonForThis(p.id)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        formData.addon_ids?.includes(p.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {p.name}
                                                <span className="ml-2 text-xs text-gray-400">₹{p.price}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-gray-500">Link {formData.name || 'this item'} to others</Label>
                        <Popover open={openParentSelect} onOpenChange={setOpenParentSelect} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openParentSelect}
                                    disabled={formData.addon_ids && formData.addon_ids.length > 0}
                                    className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formData.parent_product_ids && formData.parent_product_ids.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.parent_product_ids.map(id => {
                                            const p = products.find(prod => prod.id === id);
                                            return p ? (
                                                <span key={id} className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border">
                                                    {p.name}
                                                    <X className="w-3 h-3 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleLinkToParent(id); }} />
                                                </span>
                                            ) : null
                                        })}
                                    </div>
                                    ) : (
                                        <span className="text-gray-500 text-sm">Select products...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0 z-[9999]" align="start">
                                <Command>
                                    <CommandInput placeholder="Search products..." />
                                    <CommandList className="max-h-[200px] overflow-auto">
                                        <CommandEmpty>No product found.</CommandEmpty>
                                        {otherProducts.map((p) => (
                                            <CommandItem
                                                key={p.id}
                                                value={p.name}
                                                onSelect={() => toggleLinkToParent(p.id)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        formData.parent_product_ids?.includes(p.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {p.name}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                )}
                <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                        <Switch id="veg" checked={formData.is_veg} onCheckedChange={c => setFormData(prev => ({ ...prev, is_veg: c }))} />
                        <Label htmlFor="veg" className="cursor-pointer">Veg</Label>
                    </div>
                    <div className="flex items-center gap-2">
                         <Switch id="available" checked={formData.is_available} onCheckedChange={c => setFormData(prev => ({ ...prev, is_available: c }))} />
                        <Label htmlFor="available" className="cursor-pointer">Available</Label>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    style={{ backgroundColor: '#1BA672', color: 'white' }}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : (product ? 'Save Changes' : 'Add Item')}
                </Button>
            </form>
        </div>
    );
}
