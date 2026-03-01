import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { PhoneSignIn } from "./PhoneSignIn";
import { SignUp } from "./SignUp";
import { OTPVerification } from "./OTPVerification";
import { toast } from "sonner";
import { supabase } from "../../utils/supabase/client";
import { nodeApiService } from "../../utils/nodeApi";
import { Sheet, SheetContent } from "../ui/sheet";

type AuthStep = 'signup' | 'login';
type AuthMode = 'signup' | 'login';

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthComplete: (authData: any) => void;
}

export function LoginPanel({ isOpen, onClose, onAuthComplete }: LoginPanelProps) {
  // TEMP: Dummy login flag and accounts (for PhonePe PG verification)
  const DUMMY_ENABLED = import.meta.env.VITE_DUMMY_LOGIN === 'true';
  const DUMMY_ACCOUNTS: Record<string, string> = {
    '9876543210': '123456'
  };

  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset all auth states when panel opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('login');
      setAuthMode('login');
      setPhoneNumber("");
      setUserInfo({ name: "", email: "" });
      setOtpSent(false);
      setLoading(false);
      setResendLoading(false);
    }
  }, [isOpen]);

  const handleSignUp = async (data: { phoneNumber: string; name: string; email: string }) => {
    setLoading(true);
    try {
      // TEMP: Dummy Login for PhonePe PG verification
      const DUMMY_ENABLED = import.meta.env.VITE_DUMMY_LOGIN === 'true';
      // Map of dummy phone -> otp for temporary verification. Can add more test numbers here.
      const DUMMY_ACCOUNTS: Record<string, string> = {
        // Single dedicated dummy credential for PhonePe verification
        '9876543210': '123456'
      };
      if (DUMMY_ENABLED && DUMMY_ACCOUNTS[data.phoneNumber]) {
        // Treat dummy phone as existing — directly show OTP (skip signup fields)
        setPhoneNumber(data.phoneNumber);
        setOtpSent(true);
        setLoading(false);
        toast.success(`OTP sent to +91 ${data.phoneNumber.replace(/(\d{5})(\d{5})/, '$1-$2')} (dummy)`);
        return;
      }
      // First check if user already exists using nodeApiService
      const checkResult = await nodeApiService.getUser(data.phoneNumber);

      // Node backend returns { success: true, data: { exists: true, user: ... } }
      // We check result.data.exists
      if (checkResult.success && checkResult.data?.exists) {
        toast.error("Account already exists with this phone number. Please login instead.");
        setAuthMode('login');
        setCurrentStep('login');
        setLoading(false);
        return;
      }

      // Store user info temporarily
      setUserInfo({ name: data.name, email: data.email });
      setPhoneNumber(data.phoneNumber);
      
      // Send OTP for signup
      await sendOTP(data.phoneNumber);
    } catch (error: any) {
      console.error("SignUp error:", error);
      toast.error(error.message || "Failed to process signup. Please try again.");
      setLoading(false);
    }
  };

  const handleSendOTP = async (phone: string) => {
    setLoading(true);
    try {
      // TEMP: Dummy Login for PhonePe PG verification
      const DUMMY_ENABLED = import.meta.env.VITE_DUMMY_LOGIN === 'true';
      const DUMMY_ACCOUNTS: Record<string, string> = {
        // Single dedicated dummy credential for PhonePe verification
        '9876543210': '123456'
      };
      // If dummy login is enabled via env and phone matches any test number, skip backend OTP
      if (DUMMY_ENABLED && DUMMY_ACCOUNTS[phone]) {
        // Directly mark OTP as sent for dummy flow (no backend call)
        setPhoneNumber(phone);
        setOtpSent(true);
        setLoading(false);
        toast.success(`OTP sent to +91 ${phone.replace(/(\d{5})(\d{5})/, '$1-$2')} (dummy)`);
        return;
      }
      // For login, check if user exists first
      if (authMode === 'login') {
        const checkResult = await nodeApiService.getUser(phone);

        if (checkResult.success && !checkResult.data?.exists) {
          // Auto-redirect to signup with phone pre-filled
          setPhoneNumber(phone);
          setAuthMode('signup');
          setCurrentStep('signup');
          setLoading(false);
          return;
        }
      }
      
      setPhoneNumber(phone);
      await sendOTP(phone);
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast.error(error.message || "Failed to send OTP. Please try again.");
      setLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      // TEMP: Dummy Login for PhonePe PG verification
      const DUMMY_ENABLED = import.meta.env.VITE_DUMMY_LOGIN === 'true';
      const DUMMY_ACCOUNTS: Record<string, string> = {
        // Single dedicated dummy credential for PhonePe verification
        '9876543210': '123456'
      };
      if (DUMMY_ENABLED && DUMMY_ACCOUNTS[phone]) {
        const formattedPhone = `+91${phone}`;
        setPhoneNumber(phone);
        setOtpSent(true);
        toast.success(`OTP sent to +91 ${phone.replace(/(\d{5})(\d{5})/, '$1-$2')} (dummy)`);
        return;
      }

      const result = await nodeApiService.sendOtp(phone);

      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to send OTP');
      }
      
      setOtpSent(true);
      toast.success(`OTP sent to +91 ${phone.replace(/(\d{5})(\d{5})/, '$1-$2')} via WhatsApp`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    try {
      // TEMP: Dummy Login for PhonePe PG verification
      const DUMMY_ENABLED = import.meta.env.VITE_DUMMY_LOGIN === 'true';
      const DUMMY_ACCOUNTS: Record<string, string> = {
        '9876543210': '123456',
        '9999999999': '654321'
      };

      const formattedPhone = `+91${phoneNumber}`;

      // If dummy mode and phone matches any dummy account, validate OTP locally and skip backend
      if (DUMMY_ENABLED && DUMMY_ACCOUNTS[phoneNumber]) {
        const expected = DUMMY_ACCOUNTS[phoneNumber];
        if (otp !== expected) {
          throw new Error('Invalid OTP');
        }
        // console.log(`✅ Dummy OTP verification successful for ${formattedPhone}`);
      } else {
        // console.log(`🔐 Verifying OTP with server for ${formattedPhone}`);
        const result = await nodeApiService.verifyOtp(phoneNumber, otp);

        if (!result.success) {
          throw new Error(result.error || result.message || 'Invalid OTP');
        }

        // console.log(`✅ OTP verification successful for ${formattedPhone}`);
      }

      if (authMode === 'signup') {
        // For dummy mode, skip server-side user creation to avoid backend calls
        const DUMMY_ENABLED = import.meta.env.VITE_DUMMY_LOGIN === 'true';
        const DUMMY_ACCOUNTS: Record<string, string> = {
          // Single dedicated dummy credential for PhonePe verification
          '9876543210': '123456'
        };
        if (DUMMY_ENABLED && DUMMY_ACCOUNTS[phoneNumber]) {
          // console.log('📝 Skipping create-user in dummy mode');
        } else {
          // console.log('📝 Creating user account for signup...');
          const createResult = await nodeApiService.createUser({
            phone: phoneNumber,
            name: userInfo.name,
            email: userInfo.email,
            verified: true
          });

          if (!createResult.success) {
            throw new Error(createResult.error || createResult.message || 'Failed to create user account');
          }
          // console.log('✅ User account created successfully');
        }
      }
      
      
      // Sanitized phone (10 digits only)
      const cleanPhone = formattedPhone.replace(/[^\d]/g, '').slice(-10);
      
      const authData = {
        phone: `+91${cleanPhone}`, // Store normalized +91 format in Context/LocalStorage
        name: userInfo.name || '',
        email: userInfo.email || '',
        verified: true,
        timestamp: Date.now(),
      };
      
      toast.success(`${authMode === 'signup' ? 'Account created and verified' : 'Phone number verified'} successfully!`);
      
      onAuthComplete(authData);
      onClose();
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Invalid OTP. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const result = await nodeApiService.sendOtp(phoneNumber);

      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to resend OTP');
      }
      
      toast.success("OTP resent successfully via WhatsApp");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
    setCurrentStep('login');
    setPhoneNumber("");
    setUserInfo({ name: "", email: "" });
    setOtpSent(false);
  };

  const handleSwitchToSignup = () => {
    setAuthMode('signup');
    setCurrentStep('signup');
    setOtpSent(false);
  };

  const handleBack = () => {
    onClose();
  };

  const handleClose = () => {
    setCurrentStep('login');
    setAuthMode('login');
    setPhoneNumber("");
    setUserInfo({ name: "", email: "" });
    setOtpSent(false);
    onClose();
  };

  if (!isOpen) return null;

  const loginContent = (
    <>
      {currentStep === 'login' && (
        <div style={{ width: '100%', display: 'block' }}>
          <PhoneSignIn
            onSendOTP={handleSendOTP}
            onVerifyOTP={handleVerifyOTP}
            onResendOTP={handleResendOTP}
            loading={loading}
            resendLoading={resendLoading}
            onClose={handleClose}
            onSwitchToSignup={handleSwitchToSignup}
            otpSent={otpSent}
            isPanel={true}
          />
        </div>
      )}

      {currentStep === 'signup' && (
        <div style={{ width: '100%', display: 'block' }}>
          <SignUp
            onSignUp={handleSignUp}
            onVerifyOTP={handleVerifyOTP}
            onResendOTP={handleResendOTP}
            loading={loading}
            resendLoading={resendLoading}
            onSwitchToLogin={handleSwitchToLogin}
            preFilledPhone={phoneNumber}
            otpSent={otpSent}
            isPanel={true}
          />
        </div>
      )}
    </>
  );

  return (
    <>
      {/* MOBILE: Bottom Sheet - Only renders when isMobile is true */}
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl p-0 w-full max-w-full left-0 right-0 transition-transform duration-300 ease-in-out z-[100]"
            style={{ top: '104px', bottom: 0 }}
          >
            <style>{`
              [data-slot="sheet-content"] > button[class*="absolute"] {
                display: none !important;
              }
            `}</style>
            
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentStep === 'login' ? 'Login' : 'Sign up'}
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                {currentStep === 'login' && (
                  <p className="text-gray-600 text-sm">
                    or <button onClick={handleSwitchToSignup} className="text-gutzo-primary font-semibold hover:underline">create an account</button>
                  </p>
                )}
                {currentStep === 'signup' && (
                  <p className="text-gray-600 text-sm">
                    or <button onClick={handleSwitchToLogin} className="text-gutzo-primary font-semibold hover:underline">login to your account</button>
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loginContent}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        /* DESKTOP: Right Panel - Only renders when isMobile is false */
        <div 
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100%',
            width: '95%',
            maxWidth: '600px',
            backgroundColor: 'white',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.2)',
            zIndex: 100,
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 300ms ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close login panel"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 10
            }}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>

          {/* Scrollable Content */}
          <div style={{ 
            height: '100%', 
            overflowY: 'auto',
            display: 'block',
            width: '100%'
          }}>
            <div style={{ 
              padding: '2rem',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              paddingTop: '5rem',
              margin: '0',
              marginLeft: '0',
              marginRight: 'auto',
              maxWidth: '100%',
              width: '100%'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <h1 style={{ 
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '0.5rem',
                  textAlign: 'left'
                }}>
                  {currentStep === 'login' ? 'Login' : 'Sign up'}
                </h1>
                {currentStep === 'login' && (
                  <p style={{ color: '#4B5563', textAlign: 'left' }}>
                    or <button onClick={handleSwitchToSignup} className="text-gutzo-primary font-semibold hover:underline">create an account</button>
                  </p>
                )}
                {currentStep === 'signup' && (
                  <p style={{ color: '#4B5563', textAlign: 'left' }}>
                    or <button onClick={handleSwitchToLogin} className="text-gutzo-primary font-semibold hover:underline">login to your account</button>
                  </p>
                )}
                
              </div>

              {/* Form Content with Terms below Proceed button */}
              <div style={{ width: '100%', textAlign: 'left', margin: '0' }}>
                {loginContent}
                {/* Removed duplicate disclaimer at the bottom */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}