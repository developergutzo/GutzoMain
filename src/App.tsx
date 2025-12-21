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
import { Toaster } from "./components/ui/sonner";
import { Loader2, MapPin, Plus, X, Zap } from "lucide-react";
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
import CartStrip from "./components/CartStrip";

function AppContent() {
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
  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [returnToCheckout, setReturnToCheckout] = useState(false);
  const listingsRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { clearCart, items: cartItems } = useCart();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [addressRefreshTrigger, setAddressRefreshTrigger] = useState(0); // Trigger for address updates

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

  // Consolidated Body Scroll Lock Effect
  useEffect(() => {
    const shouldLock = 
      selectedMealPlan !== null || 
      showLoginPanel || 
      showProfilePanel || 
      showCartPanel || 
      showCheckoutPanel || 
      showAddressPanel;

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
  }, [selectedMealPlan, showLoginPanel, showProfilePanel, showCartPanel, showCheckoutPanel, showAddressPanel]);

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
    setProfilePanelContent(content);
    setShowProfilePanel(true);
    if (content !== 'orders') {
      setProfileOrderData(null);
    }
  };
  const handleCloseProfile = () => {
    setShowProfilePanel(false);
    setProfileOrderData(null);
    if (returnToCheckout) {
      setTimeout(() => {
        setShowCheckoutPanel(true);
        setReturnToCheckout(false);
      }, 250);
    }
  };
  const handleShowCart = () => {
    setShowCartPanel(true);
  };
  const handleCloseCart = () => {
    setShowCartPanel(false);
  };
  const handleShowCheckout = () => {
    setShowCartPanel(false);
    setShowCheckoutPanel(true);
  };
  const handleCloseCheckout = () => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gutzo-primary mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Gutzo</h3>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  if (typeof currentRoute === 'string' && currentRoute.startsWith('/vendor/')) {
    return <VendorDetailsPage onShowCart={handleShowCart} />;
  }
  if (typeof currentRoute === 'string' && ['/T&C','/refund_policy','/privacy_policy','/payment-status','/phonepe-soon','/contact','/about'].includes(currentRoute)) {
    switch(currentRoute) {
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
    <div className="min-h-screen bg-gray-50 relative">
      <div className="sm:hidden">
        <AddToHomeScreenPrompt
          onAddToHomeScreen={handleAddToHomeScreen}
          canInstall={canInstall}
        />
      </div>
      {(showLoginPanel || showProfilePanel || showCartPanel || showCheckoutPanel || showAddressPanel) && (
        <div 
          className="fixed inset-0 z-40 transition-all duration-300 ease-out bg-black-50"
          onClick={() => {
            if (showLoginPanel) handleCloseAuth();
            if (showProfilePanel) handleCloseProfile();
            if (showCartPanel) handleCloseCart();
            if (showCheckoutPanel) handleCloseCheckout();
            if (showAddressPanel) setShowAddressPanel(false);
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
      />
      <Inspiration onOptionClick={setSelectedCategory} loading={loading} />
      <WeeklyMealPlansSection onMealPlanClick={plan => setSelectedMealPlan(plan)} />
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
      <main
          className="max-w-7xl mx-auto py-6 md:py-8"
        ref={listingsRef}
      >
          <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2
                className="text-left font-semibold text-3xl md:text-4xl lg:text-5xl tracking-tight w-full font-primary text-main"
              >
                {selectedCategory === "All" 
                  ? "Explore Delicious Choices Near You.." 
                  : `${filteredVendors.length} ${selectedCategory} restaurants`
                }
              </h2>
            </div>
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-full mx-auto w-full">
              {loading ? (
                // Show 4 skeletons while loading
                [...Array(4)].map((_, i) => (
                  <div key={i} className="w-full h-full">
                    <VendorSkeleton />
                  </div>
                ))
              ) : filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <div key={vendor.id} className="flex justify-center items-stretch w-full h-full">
                    <VendorCard
                      vendor={vendor}
                      onClick={handleVendorClick}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 flex flex-col items-center justify-center py-12 text-center">
                   <div className="bg-gray-100 p-6 rounded-full mb-4">
                     <MapPin className="h-10 w-10 text-gray-400" />
                   </div>
                   <h3 className="text-xl font-semibold text-gray-900 mb-2">No Service Available Here</h3>
                   <p className="text-gray-500 max-w-md mx-auto mb-6">
                     We couldn't find any vendors delivering to your current location.
                   </p>
                   <Button 
                     onClick={() => handleShowProfile('address')}
                     className="bg-gutzo-brand hover:bg-gutzo-brand-hover text-white px-6 py-2 rounded-lg font-medium"
                   >
                     Change Location
                   </Button>
                </div>
              )}
            </div>
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
      {/* Show CartStrip only when cart, profile, and login panels are not open, and no meal plan is selected */}
      {!showCartPanel && !showProfilePanel && !showLoginPanel && !showCheckoutPanel && !selectedMealPlan && <CartStrip onShowCart={handleShowCart} />}
      <InstantOrderPanel
        isOpen={showCheckoutPanel}
        onClose={handleCloseCheckout}
        cartItems={cartItems}
        onPaymentSuccess={handlePaymentSuccess}
        onAddAddress={() => {
          setShowAddressModal(true);
        }}
        refreshTrigger={addressRefreshTrigger}
        newAddressId={newlyAddedAddressId}
      />
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
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressAdded}
      />
      <AddressListPanel
        isOpen={showAddressPanel}
        onClose={() => setShowAddressPanel(false)}
        onSelectAddress={handleAddressSelected}
      />
      {/* VendorCartStrip logic may need update if tied to old panel logic */}
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
              <AppContent />
            </CartProvider>
          </LocationProvider>
        </RouterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}