import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "../components/Router";
import { nodeApiService as apiService } from "../utils/nodeApi";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/common/ImageWithFallback";

type ViewState = 'login' | 'forgot-email' | 'verify-otp' | 'reset-password';

export function PartnerLoginPage() {
  const { navigate } = useRouter();
  
  // View State
  const [view, setView] = useState<ViewState>('login');
  
  // Data State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Helpers
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMsg('');

      if (!validateEmail(email)) {
        setErrorMsg("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      try {
          const response = await apiService.vendorLogin({ email, password });

          if (response && response.success && response.data) {
              localStorage.setItem('vendor_data', JSON.stringify(response.data.vendor));
              toast.success(`Welcome back, ${response.data.vendor.name}!`);
              navigate('/partner/dashboard');
          }
      } catch (error: any) {
          if (error.message === 'Vendor not found' || error.status === 404) {
             setErrorMsg("Account not found. Please register as a partner first.");
          } else {
             setErrorMsg(error.message || "Login failed");
          }
      } finally {
          setIsLoading(false);
      }
  };

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'verify-otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, resendTimer]);

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      await apiService.vendorForgotPassword(email);
      toast.success("OTP sent to your email");
      setView('verify-otp');
      setResendTimer(60); // 60 seconds
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await apiService.vendorVerifyOtp(email, otp);
      toast.success("OTP Verified");
      setView('reset-password');
    } catch (error: any) {
      setErrorMsg(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      await apiService.vendorForgotPassword(email);
      toast.success("OTP resent to your email");
      setResendTimer(60); // Reset timer to 60 seconds
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await apiService.vendorResetPassword(email, otp, newPassword);
      toast.success("Password reset successful. Please login.");
      // Clear sensitive fields
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setView('login');
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Render Helpers
  const renderHeader = () => {
    switch(view) {
      case 'login': return { title: "Kitchen Portal", desc: "Enter your password to login." };
      case 'forgot-email': return { title: "Reset Password", desc: "Enter your email to receive an OTP." };
      case 'verify-otp': return { title: "Verify OTP", desc: `Enter the code sent to ${email}` };
      case 'reset-password': return { title: "New Password", desc: "Create a new password for your account." };
    }
  };

  const headerData = renderHeader();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
       <button
          onClick={() => {
            if (view === 'login') {
              navigate('/');
            } else {
              setErrorMsg('');
              if(view === 'verify-otp') setView('forgot-email');
              else setView('login');
            }
          }}
          className="absolute top-4 left-4 text-[#1A1A1A] hover:opacity-70 transition-opacity"
          style={{ fontSize: 24, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Back"
        >
          &larr;
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
            <CardTitle className="text-2xl font-bold text-gray-900">{headerData.title}</CardTitle>
            <CardDescription>{headerData.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* LOGIN FORM */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="vendor@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button type="button" onClick={() => setView('forgot-email')} className="text-xs text-[#1BA672] hover:underline">Forgot password?</button>
                  </div>
                  <Input 
                      id="password" 
                      type="password"
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  />
                </div>
                {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
                <Button 
                  type="submit" 
                  className="w-full text-white" 
                  style={{ backgroundColor: '#1BA672' }}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                </Button>

              </form>
            )}

            {/* FORGOT EMAIL FORM */}
            {view === 'forgot-email' && (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input 
                    id="reset-email" 
                    type="email"
                    placeholder="vendor@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
                <Button 
                  type="submit" 
                  className="w-full text-white" 
                  style={{ backgroundColor: '#1BA672' }}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                </Button>
              </form>
            )}

            {/* VERIFY OTP FORM */}
            {view === 'verify-otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input 
                    id="otp" 
                    type="text"
                    placeholder="Enter OTP" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-xl tracking-widest placeholder:text-gray-50"
                    maxLength={6}
                    required
                  />
                </div>
                {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
                <Button 
                  type="submit" 
                  className="w-full text-white" 
                  style={{ backgroundColor: '#1BA672' }}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                </Button>

                
                <div className="text-center mt-4">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in <span className="font-medium text-[#1A1A1A]">{formatTime(resendTimer)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm text-[#1BA672] font-semibold hover:underline"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* RESET PASSWORD FORM */}
            {view === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pass">New Password</Label>
                  <Input 
                    id="new-pass" 
                    type="password"
                    placeholder="Min 6 chars"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pass">Confirm Password</Label>
                  <Input 
                    id="confirm-pass" 
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {errorMsg && <div className="text-red-500 text-sm text-center">{errorMsg}</div>}
                <Button 
                  type="submit" 
                  className="w-full text-white" 
                  style={{ backgroundColor: '#1BA672' }}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Having trouble? <a href="mailto:support@gutzo.in" className="font-semibold text-[#1BA672] hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
