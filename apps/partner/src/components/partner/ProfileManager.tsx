import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
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
    delivery_fee: '',
    pincode: '',
    // Business Details
    company_type: '',
    company_reg_no: '',
    owner_name: '',
    owner_aadhar_no: '',
    pan_card_no: '',
    fssai_license: '',
    gst_number: '',
    // Bank Details
    bank_account_no: '',
    ifsc_code: '',
    bank_name: '',
    account_holder_name: ''
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
            delivery_fee: initialData.delivery_fee || '',
            pincode: initialData.pincode || '',
            // Education/Business
            company_type: initialData.company_type || '',
            company_reg_no: initialData.company_reg_no || '',
            owner_name: initialData.owner_name || '',
            owner_aadhar_no: initialData.owner_aadhar_no || '',
            pan_card_no: initialData.pan_card_no || '',
            fssai_license: initialData.fssai_license || '',
            gst_number: initialData.gst_number || '',
            // Bank
            bank_account_no: initialData.bank_account_no || '',
            ifsc_code: initialData.ifsc_code || '',
            bank_name: initialData.bank_name || '',
            account_holder_name: initialData.account_holder_name || ''
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-900">{formData.name || 'Kitchen Profile'}</h2>
            </div>
            {formData.image && (
                <div className="h-16 w-16 rounded-full overflow-hidden border shadow-sm">
                    <img src={formData.image} alt="Profile" className="h-full w-full object-cover" />
                </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4 shadow-sm">


            <div className="space-y-2">
                <Label htmlFor="description">Description (Kitchen Bio)</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="min-h-[280px] text-base" style={{ height: '180px' }} placeholder="Describe your kitchen, your story, or what makes your food special..." disabled />
            </div>



            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} className="min-h-[240px] text-base" style={{ height: '100px' }} disabled />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" value={formData.pincode} onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value }))} maxLength={6} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} disabled />
                </div>
            </div>

            {/* Business Details Section */}
            <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Business Details</h3>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="company_type">Company Type</Label>
                             <Select 
                                value={formData.company_type} 
                                onValueChange={(value) => setFormData(prev => ({ ...prev, company_type: value }))}
                                disabled
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                                    <SelectItem value="Partnership">Partnership</SelectItem>
                                    <SelectItem value="LLP">LLP</SelectItem>
                                    <SelectItem value="Pvt Ltd">Pvt Ltd</SelectItem>
                                    <SelectItem value="OPC">OPC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="owner_name">Owner Name</Label>
                            <Input id="owner_name" value={formData.owner_name} onChange={e => setFormData(prev => ({ ...prev, owner_name: e.target.value }))} placeholder="Full Name" disabled />
                        </div>
                    </div>

                     <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="company_reg_no">Registration No / CIN</Label>
                            <Input id="company_reg_no" value={formData.company_reg_no} onChange={e => setFormData(prev => ({ ...prev, company_reg_no: e.target.value }))} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="owner_aadhar_no">Aadhar Number</Label>
                            <Input id="owner_aadhar_no" value={formData.owner_aadhar_no} onChange={e => setFormData(prev => ({ ...prev, owner_aadhar_no: e.target.value }))} disabled />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="pan_card_no">PAN Number</Label>
                            <Input id="pan_card_no" value={formData.pan_card_no} onChange={e => setFormData(prev => ({ ...prev, pan_card_no: e.target.value }))} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gst_number">GST Number</Label>
                            <Input id="gst_number" value={formData.gst_number} onChange={e => setFormData(prev => ({ ...prev, gst_number: e.target.value }))} disabled />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fssai_license">FSSAI License</Label>
                        <Input id="fssai_license" value={formData.fssai_license} onChange={e => setFormData(prev => ({ ...prev, fssai_license: e.target.value }))} disabled />
                    </div>
                </div>
            </div>

             {/* Bank Details Section */}
             <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                <div className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input id="bank_name" value={formData.bank_name} onChange={e => setFormData(prev => ({ ...prev, bank_name: e.target.value }))} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="account_holder_name">Account Holder Name</Label>
                            <Input id="account_holder_name" value={formData.account_holder_name} onChange={e => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))} disabled />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="bank_account_no">Account Number</Label>
                            <Input id="bank_account_no" value={formData.bank_account_no} onChange={e => setFormData(prev => ({ ...prev, bank_account_no: e.target.value }))} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="ifsc_code">IFSC Code</Label>
                            <Input id="ifsc_code" value={formData.ifsc_code} onChange={e => setFormData(prev => ({ ...prev, ifsc_code: e.target.value }))} disabled />
                        </div>
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full bg-[#1BA672] hover:bg-[#14885E] text-white">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
            </Button>
        </form>
    </div>
  );
}
