// Shared content for meal plan next steps panel
import type { MealPlan } from "./components/WeeklyMealPlansSection";
import { MealPlanMenuPreview } from "./components/MealPlanMenuPreview";

// 1-130: Removed Legacy NextStepsContent
import { useState, useRef, useEffect } from "react";
// Responsive hook for media queries
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);
  return matches;
}
import { Header } from "./components/Header";
import { CategoryBar } from "./components/CategoryBar";
import { Inspiration } from "./components/Inspiration";
import WeeklyMealPlansSection from "./components/WeeklyMealPlansSection";
import { VendorCard } from "./components/VendorCard";
import { ResponsiveProductDetails } from "./components/ResponsiveProductDetailsFixed";
import { VendorSkeleton } from "./components/VendorSkeleton";
import { VendorCartStrip } from "./components/VendorCartStrip";
import { Footer } from "./components/Footer";
import { WhatsAppSupport } from "./components/WhatsAppSupport";
import { LocationGate } from "./components/LocationGate";
import { LoginPanel } from "./components/auth/LoginPanel";
import { ProfilePanel } from "./components/auth/ProfilePanel";
import { PaymentSuccessModal } from "./components/PaymentSuccessModal";
import { LocationProvider, useLocation } from "./contexts/LocationContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RouterProvider, useRouter } from "./components/Router";
import { CartPanel } from "./components/CartPanel";
import { InstantOrderPanel } from "./components/InstantOrderPanel";
import MealPlanBottomSheet from "./components/MealPlanBottomSheet";
import { TermsPage } from "./pages/TermsPage";
import { RefundPage } from "./pages/RefundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import PhonePeComingSoon from "./pages/PaytmComingSoon";
// Partner imports removed

import { CheckoutPage } from "./pages/CheckoutPage"; // Added CheckoutPage import
import { OrderTrackingPage } from "./pages/OrderTrackingPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Loader2, MapPin, Plus, X, Zap, Utensils, ChevronRight } from "lucide-react";
import { Vendor } from "./types/index";
import { useVendors } from "./hooks/useVendors";
import { filterVendors, extractCategoriesFromVendors } from "./utils/vendors";
import { useCart } from "./contexts/CartContext";
import { AddressModal } from "./components/auth/AddressModal";
import { AddressListPanel } from "./components/AddressListPanel";
import { Button } from "./components/ui/button";
import AddToHomeScreenPrompt from "./components/AddToHomeScreenPrompt";
import { BrowserRouter } from 'react-router-dom';
import VendorDetailsPage from './components/VendorDetailsPage';
import { LocationBottomSheet } from "./components/LocationBottomSheet";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { OrderTrackingProvider } from "./contexts/OrderTrackingContext";
import { ActiveOrderFloatingBar } from "./components/ActiveOrderFloatingBar";
import { SubscriptionDetailsSheet } from "./components/SubscriptionDetailsSheet";
import { nodeApiService as apiService } from "./utils/nodeApi";


import { useMobileNavigation } from "./hooks/useMobileNavigation";

function AppContent() {
    // Enable mobile navigation (back button handling)
    useMobileNavigation();

    // Use responsive hook for desktop detection
    const isDesktop = useMediaQuery('(min-width: 850px)');

    // Next steps state for meal plan
    const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);

    // Prevent background scroll when panel is open
    useEffect(() => {
      if (selectedMealPlan) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [selectedMealPlan]);
  const { vendors, loading, loadVendorProducts } = useVendors();
  const { isInCoimbatore, isLoading: locationLoading } = useLocation();
  const { currentRoute } = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationGate, setShowLocationGate] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [profilePanelContent, setProfilePanelContent] = useState<'profile' | 'orders' | 'address'>('profile');
  const [profileOrderData, setProfileOrderData] = useState<any>(null);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showCheckoutPanel, setShowCheckoutPanel] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentDetails: {
      paymentId: string;
      subscriptionId: string;
      method: string;
      amount: number;
      date: string;
    };
    orderSummary: {
      items: number;
      vendor: string;
      orderType: string;
      quantity: string;
      estimatedDelivery: string;
    };
  } | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null); // Added state
  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [returnToCheckout, setReturnToCheckout] = useState(false);
  const listingsRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { clearCart, items: cartItems } = useCart();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [addressRefreshTrigger, setAddressRefreshTrigger] = useState(0); // Trigger for address updates
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const returnToLocationSheetRef = useRef(false);

  // Next steps state for meal plan
  // (already declared above, remove duplicate)

  // Prevent background scroll when panel is open
  // Meal plan scroll lock handled in consolidated effect below

  // Right panel and bottom sheet components (reuse from VendorDetailsPage)
// 252-330: Removed Legacy RightPanelNextSteps and BottomSheetNextSteps

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);

  // Check for subscription success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription_success') === 'true') {
        toast.success("Subscription Activated Successfully! 🎉");
        // Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        // Ensure we refresh subscriptions
        if (isAuthenticated) fetchActiveSubscription();
    }
  }, [isAuthenticated]); // Run on mount and auth change

  // Fetch active subscription
  const fetchActiveSubscription = async () => {
    if (!user?.phone) return;
    try {
        // Fetch user's orders that are subscriptions and active
        // Or deeper integration: fetch active subscription endpoint if exists
        // Since we don't have a dedicated endpoint confirmed in nodeApi list for "active subscription"
        // we might fallback to checking orders with metadata.active = true or similar.
        // But let's assume we can fetch orders and find the latest active subscription.
        
        // Actually, looking at nodeApi.ts, we have `getMyMealPlanSubscriptions`:
        // async getMyMealPlanSubscriptions(phone: string)
        
        const res = await apiService.getMyMealPlanSubscriptions(user.phone);
        if (res.success && res.data && res.data.length > 0) {
            // Get the most recent active one
             const active = res.data.find((sub: any) => sub.status === 'active');
             if (active) {
                 setActiveSubscription(active);
             } else {
                 // Fallback: check general orders for now if subscription API not fully ready
                 // This is a temporary bridge if needed.
             }
        }
    } catch (err) {
        console.error("Failed to fetch subscription", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        fetchActiveSubscription();
    } else {
        setActiveSubscription(null);
    }
  }, [isAuthenticated, user?.phone]);

  // Initial Data Fetch - useVendors hooks handles itself
  // Removed redundant loadVendorProducts() call

  useEffect(() => {
    const shouldLock = 
      selectedMealPlan !== null || 
      showLoginPanel || 
      showProfilePanel || 
      showCartPanel || 
      showCheckoutPanel || 
      showAddressPanel ||
      showSubscriptionSheet;

    if (shouldLock) {
      document.body.style.overflow = 'hidden';
      // Only add padding right if it's a modal panel (not necessarily for meal plan if needed, but safe to add)
      if (!selectedMealPlan) {
         document.body.style.paddingRight = '0px'; 
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [selectedMealPlan, showLoginPanel, showProfilePanel, showCartPanel, showCheckoutPanel, showAddressPanel, showSubscriptionSheet]);



  useEffect(() => {
    //if (!locationLoading && !isInCoimbatore) {
    if(false){
      const timer = setTimeout(() => {
        setShowLocationGate(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [locationLoading, isInCoimbatore]);

  const availableCategories = extractCategoriesFromVendors(vendors);
  // Custom vendor data for Explore Delicious Choices
  // Use vendors fetched from API
  let filteredVendors = vendors;
  const isNoService = !loading && filteredVendors.length === 0;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  const handleVendorClick = (vendor: Vendor) => {
    navigate(`/vendor/${vendor.id}`);
  };
  const clearFilters = () => {
    setSelectedCategory("All");
  };
  const handleLocationApproved = () => {
    setShowLocationGate(false);
  };
  const handleAuthComplete = async (authData: any) => {
    try {
      await login(authData);
      setShowLoginPanel(false);
    } catch (error) {
      // Keep the login panel open if authentication fails
    }
  };
  const handleShowLogin = () => {
    setShowLoginPanel(true);
  };
  const handleCloseAuth = () => {
    setShowLoginPanel(false);
  };
  const handleShowProfile = (content: 'profile' | 'orders' | 'address') => {
    if (content === 'address') {
      setShowLocationSheet(true);
      return;
    }
    setProfilePanelContent(content);
    setShowProfilePanel(true);
    if (content !== 'orders') {
      setProfileOrderData(null);
    }
  };
  const handleCloseProfile = () => {
    setShowProfilePanel(false);
    setProfileOrderData(null);
    if (returnToLocationSheetRef.current) {
      setTimeout(() => {
        navigate('/checkout');
        returnToLocationSheetRef.current = false;
      }, 250);
    }
  };
  const handleShowCart = () => {
    // Updated to navigate to CheckoutPage
    navigate('/checkout');
    // setShowCartPanel(true); // Old logic
  };
  const handleCloseCart = () => {
    setShowCartPanel(false);
  };
  const handleShowCheckout = () => {
    // Navigate to full checkout page instead of opening legacy panel
    navigate('/checkout');
    setShowCartPanel(false);
  };
  const handleCloseCheckout = () => {
    // No-op - replaced by route navigation
    setShowCheckoutPanel(false);
  };
  const handleProceedToPayment = (orderData: any) => {
    setCheckoutData(orderData);
    setShowCheckoutPanel(false);
  };
  const handleClosePayment = () => {
    setCheckoutData(null);
  };
  const handleBackToCheckout = () => {
    setShowCheckoutPanel(true);
  };
  const handleLogout = () => {
    logout();
    setShowProfilePanel(false);
  };
  const handlePaymentSuccess = (paymentData: any) => {
    clearCart();
    const paymentSuccessPayload = {
      paymentDetails: {
        paymentId: `PAY_${Date.now()}`,
        subscriptionId: `ORD_${Date.now()}`,
        method: 'Wallet',
        amount: paymentData?.amount || 565,
        date: new Date().toLocaleDateString('en-IN')
      },
      orderSummary: {
        items: paymentData?.items || 3,
        vendor: paymentData?.vendor || 'the fruit bowl co',
        orderType: paymentData?.orderType || 'Instant Delivery',
        quantity: paymentData?.quantity || 'bowl',
        estimatedDelivery: paymentData?.estimatedDelivery || '05:30 pm'
      }
    };
    setPaymentSuccessData(paymentSuccessPayload);
    setShowPaymentSuccess(true);
    setShowCheckoutPanel(false);
    setShowCartPanel(false);
    setCheckoutData(null);
  };
  const handleClosePaymentSuccess = () => {
    setShowPaymentSuccess(false);
    setPaymentSuccessData(null);
  };
  const handleContinueExploringFromSuccess = () => {
    setShowPaymentSuccess(false);
    setPaymentSuccessData(null);
  };
  const handleViewOrdersFromSuccess = () => {
    if (paymentSuccessData) {
      setProfileOrderData(paymentSuccessData);
    }
    setShowPaymentSuccess(false);
    setPaymentSuccessData(null);
    handleShowProfile('orders');
  };
  const handleViewOrderDetailsFromProfile = (orderData: any) => {
    setPaymentSuccessData(orderData);
    setShowPaymentSuccess(true);
    setShowProfilePanel(false);
  };
  const [newlyAddedAddressId, setNewlyAddedAddressId] = useState<string | null>(null);

  const handleAddressAdded = async (address: any) => {
    console.log('🏗️ [App] handleAddressAdded called with:', address);
    // If address has an ID (returned from backend), store it to auto-select
    if (address && address.id) {
      console.log('✅ [App] Setting newlyAddedAddressId to:', address.id);
      setNewlyAddedAddressId(address.id);
    } else {
      console.warn('⚠️ [App] No ID found in added address object!');
    }
    setAddressRefreshTrigger(prev => prev + 1);
    setShowAddressModal(false);
    
    // Check if we need to return to the location sheet
    if (returnToLocationSheetRef.current) {
      setTimeout(() => {
        setShowLocationSheet(true);
        returnToLocationSheetRef.current = false;
      }, 300); // Small delay for smooth transition
    }
  };



  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setShowLocationSheet(false);
    setShowAddressModal(true);
    returnToLocationSheetRef.current = true;
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowLocationSheet(false);
    setShowAddressModal(true);
    returnToLocationSheetRef.current = true;
  };

  const handleShowLocationSheet = () => {
    setShowLocationSheet(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    if (returnToLocationSheetRef.current) {
      // Small delay to ensure modal teardown doesn't conflict with sheet mounting
      setTimeout(() => {
        setShowLocationSheet(true);
        returnToLocationSheetRef.current = false;
      }, 100);
    }
  };
  const handleAddressSelected = (address: any) => {
    setShowAddressPanel(false);
  };
  const handleShowAddressList = () => {
    if (isAuthenticated) {
      handleShowProfile('address');
    } else {
      handleShowLogin();
    }
  };
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
  const canInstall = !!deferredPrompt && !isStandalone;
  const handleAddToHomeScreen = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  if (authLoading) {
    return (
      <LoadingScreen 
        isOpen={true} 
        messages={["Checking authentication...", "Securing your session...", "Almost ready..."]} 
      />
    );
  }
  if (typeof currentRoute === 'string' && currentRoute.startsWith('/vendor/')) {
    return <VendorDetailsPage onShowCart={handleShowCart} vendors={vendors} loading={loading} />;
  }
  if (typeof currentRoute === 'string' && currentRoute.startsWith('/tracking/')) {
    return <OrderTrackingPage />;
  }
  // Added /checkout to the route list
  if (typeof currentRoute === 'string' && ['/T&C','/refund_policy','/privacy_policy','/payment-status','/phonepe-soon','/contact','/about', '/checkout'].includes(currentRoute)) {
    switch(currentRoute) {
      case '/checkout': return <CheckoutPage />;
      case '/T&C': return <TermsPage />;
      case '/refund_policy': return <RefundPage />;
      case '/privacy_policy': return <PrivacyPage />;
      case '/payment-status': return <PaymentStatusPage />;
      case '/phonepe-soon': return <PhonePeComingSoon />;
      case '/contact': return <ContactPage />;
      case '/about': return <AboutPage />;
      default: break;
    }
  }
  if (showLocationGate && !isInCoimbatore) {
    return <LocationGate onLocationApproved={handleLocationApproved} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden flex flex-col">
      <div className="sm:hidden">
        <AddToHomeScreenPrompt
          onAddToHomeScreen={handleAddToHomeScreen}
          canInstall={canInstall}
        />
      </div>
      {(showLoginPanel || showProfilePanel || showCartPanel || showCheckoutPanel || showAddressPanel || showLocationSheet) && (
        <div 
          className="fixed inset-0 z-40 transition-all duration-300 ease-out bg-black-50"
          onClick={() => {
            if (showLoginPanel) handleCloseAuth();
            if (showProfilePanel) handleCloseProfile();
            if (showCartPanel) handleCloseCart();
            if (showCheckoutPanel) handleCloseCheckout();
            if (showCheckoutPanel) handleCloseCheckout();
            if (showAddressPanel) setShowAddressPanel(false);
            if (showLocationSheet) setShowLocationSheet(false);
          }}
        />
      )}
      <Header 
        onShowLogin={handleShowLogin}
        onLogout={handleLogout}
        onShowProfile={handleShowProfile}
        onShowCart={handleShowCart}
        onShowAddressList={handleShowAddressList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onShowLocationSheet={handleShowLocationSheet}
      />
      {!isNoService && <Inspiration onOptionClick={setSelectedCategory} loading={loading} />}
      {!isNoService && (
        <WeeklyMealPlansSection 
          onMealPlanClick={plan => setSelectedMealPlan(plan)} 
          validVendorIds={filteredVendors.map(v => v.id)}
        />
      )}
      {/* Show next steps UI when a meal plan is selected */}
      {selectedMealPlan && (
        <>
          {/* Overlay for right panel */}

          <MealPlanBottomSheet
            plan={selectedMealPlan}
            onClose={() => setSelectedMealPlan(null)}
          />
        </>
      )}

      {/* Subscription Details Sheet */}
      {showSubscriptionSheet && activeSubscription && (
         <SubscriptionDetailsSheet
            isOpen={showSubscriptionSheet}
            onClose={() => setShowSubscriptionSheet(false)}
            subscription={activeSubscription}
            onSkip={() => toast.info("Skip functionality coming soon!")}
            onCancel={() => toast.info("Cancel functionality coming soon!")}
         />
      )}
      <main
          className="w-full py-6 md:py-8 flex-1"
        ref={listingsRef}
      >
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {!isNoService && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="text-left font-semibold text-3xl md:text-4xl lg:text-5xl tracking-tight w-full font-primary text-main"
                >
                  {selectedCategory === "All" 
                    ? "Kitchens Near You" 
                    : `${filteredVendors.length} ${selectedCategory} restaurants`
                  }
                </h2>
              </div>
            </div>
          )}
            {isNoService ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full max-w-lg mx-auto px-6">
                 <div className="bg-green-50 p-6 rounded-full mb-6">
                   <MapPin className="h-12 w-12 text-gutzo-brand" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins' }}>No Service Available Here</h3>
                 <p className="text-gray-500 text-base mb-8 leading-relaxed">
                   We couldn't find any vendors delivering to your current location. Try changing your location to explore delicious choices.
                 </p>
                 <Button 
                   onClick={() => handleShowProfile('address')}
                   className="text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                   style={{ backgroundColor: 'var(--brand-green)', fontSize: '1rem' }}
                 >
                   Change Location
                 </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-full mx-auto w-full">
                {loading ? (
                  // Show 4 skeletons while loading
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-full">
                      <VendorSkeleton />
                    </div>
                  ))
                ) : (
                  filteredVendors.map((vendor) => (
                    <div key={vendor.id} className="flex justify-center items-stretch w-full h-full">
                      <VendorCard
                        vendor={vendor}
                        onClick={handleVendorClick}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
        </div>
      </main>
      <Footer />
      <Toaster position="top-center" />
      <LoginPanel 
        isOpen={showLoginPanel}
        onClose={handleCloseAuth}
        onAuthComplete={handleAuthComplete}
      />
      <ProfilePanel 
        isOpen={showProfilePanel}
        onClose={handleCloseProfile}
        onLogout={handleLogout}
        content={profilePanelContent}
        userInfo={user ? {
          name: user.name,
          phone: user.phone,
          email: user.email
        } : null}
        onViewOrderDetails={handleViewOrderDetailsFromProfile}
        recentOrderData={profileOrderData}
      />
      <CartPanel
        isOpen={showCartPanel}
        onClose={handleCloseCart}
        isAuthenticated={isAuthenticated}
        onShowLogin={handleShowLogin}
        onShowCheckout={handleShowCheckout}
      />
      {/* Show VendorCartStrip (Detailed) only when cart, profile, and login panels are not open, and no meal plan is selected */}
      {!showCartPanel && !showProfilePanel && !showLoginPanel && !showCheckoutPanel && !selectedMealPlan && cartItems.length > 0 && (
          <VendorCartStrip 
            vendorId={cartItems[0].vendorId || cartItems[0].vendor?.id || 'v1'} // Fallback safely
            vendorName={cartItems[0].vendor?.name || 'Vendor'}
            vendorImage={cartItems[0].vendor?.image}
            onViewCart={handleShowCart} 
            isOpen={
                // If vendor not found (e.g. No Service / Location Error), default to TRUE so user can still access cart/checkout
                // This allows them to change location from checkout or view their existing items
                (vendors.find(v => v.id === (cartItems[0].vendorId || cartItems[0].vendor?.id))?.isOpen ?? true)
            }
          />
      )}
      {/* InstantOrderPanel removed - use /checkout route instead */}
      {paymentSuccessData && (
        <PaymentSuccessModal
          isOpen={showPaymentSuccess}
          onClose={handleClosePaymentSuccess}
          paymentDetails={paymentSuccessData.paymentDetails}
          orderSummary={paymentSuccessData.orderSummary}
          onViewOrders={handleViewOrdersFromSuccess}
          onContinueExploring={handleContinueExploringFromSuccess}
        />
      )}
  <AddressModal
        isOpen={showAddressModal}
        onClose={handleCloseAddressModal}
        onSave={handleAddressAdded}
        editingAddress={editingAddress}
      />
      <LocationBottomSheet
        isOpen={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        onAddAddress={handleOpenAddAddress}
        onEditAddress={handleEditAddress}
        refreshTrigger={addressRefreshTrigger}
      />
      <AddressListPanel
        isOpen={showAddressPanel}
        onClose={() => setShowAddressPanel(false)}
        onSelectAddress={handleAddressSelected}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterProvider>
          <LocationProvider>
            <CartProvider>
              <OrderTrackingProvider>
                <AppContent />
                <ActiveOrderFloatingBar />
              </OrderTrackingProvider>
            </CartProvider>
          </LocationProvider>
        </RouterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}