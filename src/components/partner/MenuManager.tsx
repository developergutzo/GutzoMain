import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Loader2, Plus, Pencil, Trash2, X, Image as ImageIcon } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";
import { ImageWithFallback } from "../common/ImageWithFallback";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_veg: boolean;
  is_available: boolean;
  category: string;
}

interface MenuManagerProps {
  vendorId: string;
}

export function MenuManager({ vendorId }: MenuManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchMenu();
  }, [vendorId]);

  const fetchMenu = async () => {
    try {
      const res = await apiService.getVendorMenu(vendorId);
      if (res.success && res.data) {
        setProducts(res.data.products);
      }
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await apiService.deleteVendorProduct(vendorId, productId);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Item deleted');
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  if (loading) return <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-gray-900">Your Menu</h2>
           <p className="text-sm text-gray-500">Manage your dishes and prices</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setIsEditing(true); }} className="bg-[#1BA672] hover:bg-[#14885E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <div className="aspect-video w-full bg-gray-100 relative">
               <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
               {!product.is_available && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-red-500 px-2 py-1 rounded">SOLD OUT</span>
                 </div>
               )}
            </div>
            <CardContent className="p-4">
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-[#1BA672] font-semibold">₹{product.price}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full border ${product.is_veg ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'} flex items-center justify-center`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${product.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </div>
               </div>
               <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{product.description}</p>
               
               <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingProduct(product); setIsEditing(true); }}>
                     <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                     <Trash2 className="w-3 h-3" />
                  </Button>
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
                 onClose={() => setIsEditing(false)} 
                 onSuccess={() => { setIsEditing(false); fetchMenu(); }} 
              />
           </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ vendorId, product, onClose, onSuccess }: { vendorId: string, product: Product | null, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        image: product?.image || '',
        is_veg: product?.is_veg ?? true,
        is_available: product?.is_available ?? true,
        category: product?.category || 'Main Course'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, price: Number(formData.price) };
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
                        <Input id="category" required value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. Starter" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Ingredients, portion size..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <div className="flex gap-2">
                       <Input id="image" value={formData.image} onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
                       {formData.image && <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 shrink-0"><img src={formData.image} className="w-full h-full object-cover" /></div>}
                    </div>
                </div>

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

                <Button type="submit" className="w-full bg-[#1BA672] hover:bg-[#14885E] text-white mt-4" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : (product ? 'Save Changes' : 'Add Item')}
                </Button>
            </form>
        </div>
    );
}
