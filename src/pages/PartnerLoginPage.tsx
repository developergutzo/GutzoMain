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
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.vendorLogin(formData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      // Success
      localStorage.setItem('vendor_data', JSON.stringify(response.data.vendor));
      toast.success(`Welcome back, ${response.data.vendor.name}!`);
      navigate('/partner/dashboard');
      
    } catch (error: any) {
      const msg = error.message || "Invalid credentials";
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
       <button
          onClick={() => navigate('/partner')}
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
              Enter your credentials to manage your kitchen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Kitchen ID</Label>
                <Input 
                  id="username" 
                  placeholder="e.g. delicious_kitchen" 
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
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
                  "Login"
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
