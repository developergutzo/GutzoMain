import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Loader2, User, Building2, Landmark, CheckCircle2, MapPin, Phone, ShieldCheck, Mail, Globe, ExternalLink, Camera } from "lucide-react";
import { nodeApiService as apiService } from "../../utils/nodeApi";
import { toast } from "sonner";
import { cn } from "../ui/utils";

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
        company_type: '',
        company_reg_no: '',
        owner_name: '',
        owner_aadhar_no: '',
        pan_card_no: '',
        fssai_license: '',
        gst_number: '',
        bank_account_no: '',
        ifsc_code: '',
        bank_name: '',
        account_holder_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('kitchen');
    const [focusedField, setFocusedField] = useState<string | null>(null);

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
                company_type: initialData.company_type || '',
                company_reg_no: initialData.company_reg_no || '',
                owner_name: initialData.owner_name || '',
                owner_aadhar_no: initialData.owner_aadhar_no || '',
                pan_card_no: initialData.pan_card_no || '',
                fssai_license: initialData.fssai_license || '',
                gst_number: initialData.gst_number || '',
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

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

    const getInputStyle = (fieldId: string) => {
        const isFocused = focusedField === fieldId;
        return {
            backgroundColor: isFocused ? '#FFFFFF' : '#FAFAFA',
            borderColor: isFocused ? '#1BA672' : '#E0E0E0',
            boxShadow: isFocused ? '0 0 0 3px rgba(27, 166, 114, 0.1)' : 'none',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.2s ease',
        };
    };

    const labelStyle = "text-[12px] font-semibold text-[#6B6B6B] uppercase tracking-wide mb-2 block";
    const sectionTitleStyle = "text-[18px] font-bold text-[#1A1A1A] mb-1";
    const sectionSubtitleStyle = "text-[14px] text-[#6B6B6B] mb-8";

    const navItems = [
        { id: 'kitchen', label: 'Kitchen info', icon: User },
        { id: 'business', label: 'Business details', icon: Building2 },
        { id: 'bank', label: 'Bank details', icon: Landmark }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: '"Poppins", system-ui, sans-serif' }}>
            {/* Top Header */}
            <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(250, 250, 250, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E0E0E0', padding: '16px 24px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Profile</h1>
                        <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '4px 0 0 0' }}>Manage your kitchen details and business info</p>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#1BA672] hover:bg-[#14885E] active:scale-95 text-white h-11 px-8 rounded-[12px] text-[15px] font-semibold transition-all shadow-sm"
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" style={{ display: 'inline' }} />}
                        Save changes
                    </Button>
                </div>
            </header>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '40px' }} className="flex-col md:flex-row">
                {/* Fixed Sidebar */}
                <aside style={{ width: '320px', flexShrink: 0 }} className="w-full md:w-[320px]">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Kitchen Card */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E0E0E0', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            <div style={{ position: 'relative', marginBottom: '20px' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#E8F6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: '#1BA672', overflow: 'hidden', border: '4px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {formData.image ? (
                                        <img src={formData.image} alt={formData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : initials}
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <Camera style={{ width: '16px', height: '16px', color: '#6B6B6B' }} />
                                </div>
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, margin: '0 0 8px 0' }}>{formData.name || 'Your Kitchen'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2FCC5A' }}></div>
                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1BA672' }}>Online</span>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E0E0E0', padding: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 20px',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: activeSection === item.id ? '#E8F6F1' : 'transparent',
                                        color: activeSection === item.id ? '#1BA672' : '#6B6B6B',
                                        outline: 'none'
                                    }}
                                    onMouseOver={(e) => {
                                        if (activeSection !== item.id) {
                                            e.currentTarget.style.backgroundColor = '#FAFAFA';
                                            e.currentTarget.style.color = '#1A1A1A';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (activeSection !== item.id) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#6B6B6B';
                                        }
                                    }}
                                >
                                    <item.icon style={{ width: '20px', height: '20px', color: activeSection === item.id ? '#1BA672' : '#9E9E9E' }} />
                                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Content Area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '80px' }}>
                    {/* Kitchen Info Section */}
                    <section id="kitchen" style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E0E0E0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '850px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px 0' }}>Kitchen information</h3>
                        <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 32px 0' }}>Public details that appear on the customer app</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className={labelStyle}>Description (Kitchen Bio)</label>
                                <textarea
                                    value={formData.description}
                                    onFocus={() => setFocusedField('description')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    style={{ ...getInputStyle('description'), minHeight: '120px', padding: '12px 16px', fontSize: '15px', color: '#1A1A1A', lineHeight: 1.6, resize: 'none' }}
                                    placeholder="Tell customers about your ingredients, story, or expertise..."
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className={labelStyle}>Address</label>
                                <textarea
                                    value={formData.address}
                                    onFocus={() => setFocusedField('address')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    style={{ ...getInputStyle('address'), minHeight: '80px', padding: '12px 16px', fontSize: '15px', color: '#1A1A1A', resize: 'none' }}
                                    placeholder="Full street address..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className={labelStyle}>Pincode</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onFocus={() => setFocusedField('pincode')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                                        style={{ ...getInputStyle('pincode'), height: '48px', padding: '0 16px', fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}
                                        placeholder={formData.pincode ? "" : "Not set"}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className={labelStyle}>Contact Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onFocus={() => setFocusedField('phone')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        style={{ ...getInputStyle('phone'), height: '48px', padding: '0 16px', fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}
                                        placeholder={formData.phone ? "" : "Not set"}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Business Details Section */}
                    <section id="business" style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E0E0E0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '850px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px 0' }}>Business details</h3>
                        <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 32px 0' }}>Legal details for compliance and identity</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {[
                                { id: 'company_type', label: 'Company Type', placeholder: 'Not selected' },
                                { id: 'owner_name', label: 'Owner Name', placeholder: 'Not set' },
                                { id: 'company_reg_no', label: 'Registration No / CIN', placeholder: 'Not set' },
                                { id: 'owner_aadhar_no', label: 'Aadhaar Number', placeholder: 'Not set' },
                                { id: 'pan_card_no', label: 'PAN Number', placeholder: 'Not set' },
                                { id: 'gst_number', label: 'GST Number', placeholder: 'Not set' },
                            ].map((field) => (
                                <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className={labelStyle}>{field.label}</label>
                                    <input
                                        type="text"
                                        value={(formData as any)[field.id]}
                                        onFocus={() => setFocusedField(field.id)}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                                        style={{ ...getInputStyle(field.id), height: '48px', padding: '0 16px', fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}
                                        placeholder={(formData as any)[field.id] ? "" : field.placeholder}
                                    />
                                </div>
                            ))}
                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className={labelStyle}>FSSAI License</label>
                                <input
                                    type="text"
                                    value={formData.fssai_license}
                                    onFocus={() => setFocusedField('fssai_license')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={e => setFormData(prev => ({ ...prev, fssai_license: e.target.value }))}
                                    style={{ ...getInputStyle('fssai_license'), height: '48px', padding: '0 16px', fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}
                                    placeholder={formData.fssai_license ? "" : "Not set"}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Bank Details Section */}
                    <section id="bank" style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E0E0E0', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: '850px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px 0' }}>Bank details</h3>
                        <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 32px 0' }}>Settlement account for payouts</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {[
                                { id: 'bank_name', label: 'Bank Name' },
                                { id: 'account_holder_name', label: 'Account Holder' },
                                { id: 'bank_account_no', label: 'Account Number' },
                                { id: 'ifsc_code', label: 'IFSC Code' },
                            ].map((field) => (
                                <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className={labelStyle}>{field.label}</label>
                                    <input
                                        type="text"
                                        value={(formData as any)[field.id]}
                                        onFocus={() => setFocusedField(field.id)}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                                        style={{ ...getInputStyle(field.id), height: '48px', padding: '0 16px', fontSize: '15px', color: '#1A1A1A', fontWeight: 500 }}
                                        placeholder={(formData as any)[field.id] ? "" : "Not set"}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
