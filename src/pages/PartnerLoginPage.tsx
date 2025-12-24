import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "../components/Router";
import { nodeApiService as apiService } from "../utils/nodeApi";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/common/ImageWithFallback";

export function PartnerLoginPage() {
  const { navigate } = useRouter();
  const [formData, setFormData] = useState({ phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Send raw phone number, backend or api utils will handle formatting if needed.
      // Assuming backend expects 10 digit or +91 format logic.
      // Let's send what we have for now, but formatted properly if possible.
      // nodeApi formatPhone logic adds +91 if length >= 10.
      const response = await apiService.vendorLogin({ phone: formData.phone });

      if (response && response.success && response.data) {
          // Success: Vendor found
          localStorage.setItem('vendor_data', JSON.stringify(response.data.vendor));
          toast.success(`Welcome back, ${response.data.vendor.name}!`);
          navigate('/partner/dashboard');
      } else {
         // Should not reach here if backend throws on 404, but just in case
         throw new Error("Vendor not found");
      }
      
    } catch (error: any) {
        // If 404/Vendor not found, redirect to /partner for registration request
        if (error.message && (error.message.includes('Vendor not found') || error.message.includes('404'))) {
            toast.error("Account not found. Redirecting to registration...");
             setTimeout(() => {
                navigate('/partner-with-gutzo', { phone: formData.phone });
             }, 1500);
             return;
        }

        const msg = error.message || "Login failed";
        toast.error(msg);
        setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
       <button
          onClick={() => navigate('/partner-with-gutzo')}
          className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          &larr; Back
        </button>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
           <ImageWithFallback
              src="https://35-194-40-59.nip.io/service/storage/v1/object/public/Gutzo/GUTZO.svg"
              alt="Gutzo"
              className="h-12 w-auto"
            />
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Kitchen Portal</CardTitle>
            <CardDescription>
              Enter your phone number to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input 
                    id="phone" 
                    placeholder="9876543210" 
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // Allow only numbers
                      if (val.length <= 10) {
                         setFormData(prev => ({ ...prev, phone: val }))
                      }
                    }}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center border border-red-100">
                  {errorMsg}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#1BA672' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Having trouble? <a href="mailto:support@gutzo.in" className="font-semibold text-[#1BA672] hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
