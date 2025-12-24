import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea"; 
import { Loader2, Save } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";

export function ProfileManager({ vendorId, initialData, onUpdate }: { vendorId: string, initialData: any, onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine_type: '',
    address: '',
    phone: '',
    image: '',
    delivery_time: '',
    minimum_order: '',
    delivery_fee: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
        setFormData({
            name: initialData.name || '',
            description: initialData.description || '',
            cuisine_type: initialData.cuisine_type || '',
            address: initialData.address || '',
            phone: initialData.phone || '',
            image: initialData.image || '',
            delivery_time: initialData.delivery_time || '',
            minimum_order: initialData.minimum_order || '',
            delivery_fee: initialData.delivery_fee || ''
        });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await apiService.updateVendorProfile(vendorId, formData);
        toast.success('Profile updated successfully');
        onUpdate();
    } catch (error: any) {
        toast.error(error.message || 'Failed to update profile');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Kitchen Profile</h2>
                <p className="text-sm text-gray-500">Update how your kitchen appears to customers</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4 shadow-sm">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Kitchen Name</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine Type</Label>
                    <Input id="cuisine" value={formData.cuisine_type} onChange={e => setFormData(prev => ({ ...prev, cuisine_type: e.target.value }))} placeholder="e.g. South Indian" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="min-h-[80px]" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Banner Image URL</Label>
                <Input id="image" value={formData.image} onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))} />
                 {formData.image && <img src={formData.image} alt="Preview" className="w-full h-32 object-cover rounded mt-2 bg-gray-100" />}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                 <div className="space-y-2">
                    <Label htmlFor="time">Del. Time</Label>
                    <Input id="time" value={formData.delivery_time} onChange={e => setFormData(prev => ({ ...prev, delivery_time: e.target.value }))} placeholder="30-45 mins" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="min">Min Order (₹)</Label>
                    <Input id="min" type="number" value={formData.minimum_order} onChange={e => setFormData(prev => ({ ...prev, minimum_order: e.target.value }))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="fee">Fee (₹)</Label>
                    <Input id="fee" type="number" value={formData.delivery_fee} onChange={e => setFormData(prev => ({ ...prev, delivery_fee: e.target.value }))} />
                </div>
            </div>

            <Button type="submit" className="w-full bg-[#1BA672] hover:bg-[#14885E] text-white" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
            </Button>
        </form>
    </div>
  );
}
