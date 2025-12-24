import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { nodeApiService as apiService } from "../utils/nodeApi";
import { Store, User, Phone, MapPin, Utensils, Mail } from "lucide-react";
import { useRouter } from "./Router";

interface VendorInterestFormData {
  kitchen_name: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  food_type: string;
}

export function VendorInterestForm() {
  const { navigate } = useRouter();
  const [formData, setFormData] = useState<VendorInterestFormData>({
    kitchen_name: "",
    contact_name: "",
    phone: history.state?.phone || "",
    email: "",
    city: "Coimbatore", // Default as requested
    food_type: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(history.state?.leadExisting || false);
  const [errors, setErrors] = useState<Partial<VendorInterestFormData>>({});

  const validateField = (field: keyof VendorInterestFormData, value: string) => {
    let error = "";
    
    switch (field) {
      case 'kitchen_name':
        if (value.length < 3) error = "Name must be at least 3 characters.";
        break;
      case 'contact_name':
        if (value.length < 3) error = "Name must be at least 3 characters.";
        break;
      case 'phone':
        if (value.length < 10) error = "Phone must be 10 digits.";
        break;
      case 'email':
        // Strict TLD Whitelist for India context
        const allowedTLDs = ['com', 'in', 'co.in', 'net', 'org', 'edu', 'gov', 'biz', 'info'];
        const emailParts = value.split('.');
        const tld = emailParts[emailParts.length - 1].toLowerCase();
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(value)) {
          error = "Invalid email format.";
        } else if (!allowedTLDs.includes(tld)) {
          error = `.${tld} is not a supported domain extension.`;
        }
        break;
      case 'food_type':
        if (value.length < 10) error = "Description needs to be longer.";
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: keyof VendorInterestFormData) => {
    validateField(field, formData[field]);
  };

  const handleInputChange = (field: keyof VendorInterestFormData, value: string) => {
    let finalValue = value;

    // Strict Input Masking & Limits
    if (field === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'contact_name') {
      finalValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
    } else if (field === 'kitchen_name') {
      finalValue = value.slice(0, 100);
    } else if (field === 'email') {
      finalValue = value.replace(/\s/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    
    // Clear error while typing if it becomes valid (optional, but good UX)
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all before submitting
    const newErrors: Partial<VendorInterestFormData> = {};
    if (formData.kitchen_name.length < 3) newErrors.kitchen_name = "Name must be at least 3 characters.";
    if (formData.contact_name.length < 3) newErrors.contact_name = "Name must be at least 3 characters.";
    if (formData.phone.length < 10) newErrors.phone = "Phone must be 10 digits.";
    
    // Strict TLD check
    const allowedTLDs = ['com', 'in', 'co.in', 'net', 'org', 'edu', 'gov', 'biz', 'info'];
    const tld = formData.email.split('.').pop()?.toLowerCase() || '';
    const emailStrictRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailStrictRegex.test(formData.email)) {
       newErrors.email = "Invalid email format.";
    } else if (!allowedTLDs.includes(tld)) {
       newErrors.email = `.${tld} is not a supported domain extension.`;
    }
    
    if (formData.food_type.length < 10) newErrors.food_type = "Description needs to be longer.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiService.createVendorLead(formData);
      setIsSuccess(true);
      toast.success("Interest received! We'll be in touch.");
    } catch (error: any) {
      console.error("Failed to submit lead:", error);
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
    
  if (isSuccess) {
    return (
      <Card className="w-full max-w-lg mx-auto mt-8 border-green-100 bg-green-50/50">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Store className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Thanks for your interest!</h2>
          <p className="text-gray-600">
            We have received your details. Our onboarding team will contact you shortly on <strong>{formData.phone}</strong>.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="mt-4 w-full"
            style={{ backgroundColor: "#1BA672", color: "white" }}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Partner with Gutzo</CardTitle>
        <CardDescription>
          Start your journey to becoming a managed vendor. Tell us about your kitchen.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kitchen Name */}
          <div className="space-y-2">
            <Label htmlFor="kitchen_name" className="flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500" />
              Kitchen / Brand Name *
            </Label>
            <Input
              id="kitchen_name"
              value={formData.kitchen_name}
              onChange={(e) => handleInputChange("kitchen_name", e.target.value)}
              onBlur={() => handleBlur("kitchen_name")}
              placeholder="e.g. Grandma's Healthy Kitchen"
              className={errors.kitchen_name ? "border-red-500" : ""}
              required
            />
            {errors.kitchen_name && <p className="text-xs text-red-500">{errors.kitchen_name}</p>}
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contact_name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Contact Person Name *
            </Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => handleInputChange("contact_name", e.target.value)}
              onBlur={() => handleBlur("contact_name")}
              placeholder="e.g. John Doe"
              className={errors.contact_name ? "border-red-500" : ""}
              required
            />
            {errors.contact_name && <p className="text-xs text-red-500">{errors.contact_name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
              placeholder="+91 98765 43210"
              className={errors.phone ? "border-red-500" : ""}
              required
            />
             {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
             <Label htmlFor="email" className="flex items-center gap-2">
               <Mail className="h-4 w-4 text-gray-500" />
               Email Address *
             </Label>
             <Input
               id="email"
               type="email"
               required
               value={formData.email}
               onChange={(e) => handleInputChange("email", e.target.value)}
               onBlur={() => handleBlur("email")}
               placeholder="kitchen@example.com"
               className={errors.email ? "border-red-500" : ""}
             />
             {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
           </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              City *
            </Label>
            <Select 
              value={formData.city} 
              onValueChange={(value) => handleInputChange("city", value)}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                <SelectItem value="Bangalore" disabled>Bangalore (Coming Soon)</SelectItem>
                <SelectItem value="Chennai" disabled>Chennai (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Food Type */}
          <div className="space-y-2">
            <Label htmlFor="food_type" className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-gray-500" />
              Type of Food You Cook *
            </Label>
            <Textarea
              id="food_type"
              value={formData.food_type}
              onChange={(e) => handleInputChange("food_type", e.target.value)}
              onBlur={() => handleBlur("food_type")}
              placeholder="e.g. South Indian millet breakfasts, Keto meals, North Indian tiffins..."
              rows={3}
              className={errors.food_type ? "border-red-500" : ""}
              required
            />
            {errors.food_type && <p className="text-xs text-red-500">{errors.food_type}</p>}
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              style={{ backgroundColor: "#1BA672", color: "white" }}
            >
              {isSubmitting ? "Submitting..." : "Submit Interest"}
            </Button>
            
            <p className="text-center text-gray-400" style={{ fontSize: '11px' }}>
              By submitting, you agree to be contacted by Gutzo team.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
