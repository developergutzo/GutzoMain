import CartStrip from "./CartStrip";
import { CartPanel } from "./CartPanel";
import { LoginPanel } from "./auth/LoginPanel";
import { ProfilePanel } from "./auth/ProfilePanel";
import { useAuth } from "../contexts/AuthContext";
import { InstantOrderPanel } from "./InstantOrderPanel";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import { AddressModal } from "./auth/AddressModal";
import { AddressApi } from "../utils/addressApi";
import { nodeApiService as apiService } from "../utils/nodeApi";
import { DistanceService } from "../utils/distanceService";
import { processVendorData } from "../utils/vendors";
import React, { useState, useEffect } from "react";

// Simple right panel for desktop
const RightPanelNextSteps = ({ plan, onClose }: { plan: any; onClose: () => void }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    right: 0,
    width: 400,
    height: '100vh',
    background: '#fff',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
    zIndex: 1000,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  }}>
    <button style={{ alignSelf: 'flex-end', marginBottom: 16 }} onClick={onClose}>Close</button>
    <h2>{plan?.title}</h2>
    <p>Vendor: {plan?.vendor}</p>
    <p>Price: {plan?.price}</p>
    <p>Schedule: {plan?.schedule}</p>
    <ul>
      {plan?.features?.map((f: string, i: number) => <li key={i}>{f}</li>)}
    </ul>
    {/* Add next steps UI here */}
  </div>
);

// Simple bottom sheet for mobile
const BottomSheetNextSteps = ({ plan, onClose }: { plan: any; onClose: () => void }) => (
  <div style={{
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100vw',
    background: '#fff',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
    zIndex: 1000,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  }}>
    <button style={{ float: 'right', marginBottom: 8 }} onClick={onClose}>Close</button>
    <h2>{plan?.title}</h2>
    <p>Vendor: {plan?.vendor}</p>
    <p>Price: {plan?.price}</p>
    <p>Schedule: {plan?.schedule}</p>
    <ul>
      {plan?.features?.map((f: string, i: number) => <li key={i}>{f}</li>)}
    </ul>
    {/* Add next steps UI here */}
  </div>
);
import { motion, AnimatePresence } from "framer-motion";
import { cubicBezier } from "framer-motion";
import { useRouter } from "../components/Router";
import VendorHeader from "./VendorHeader";
import VendorStatusBar from "./VendorStatusBar";
import VendorTabs from "./VendorTabs";
import PlanCards from "./PlanCards";
import InstantPicks from "./InstantPicks";
import { useVendors } from "../hooks/useVendors";
import { useCart } from "../contexts/CartContext";
import { useLocation } from 'react-router-dom';
import { useLocation as useUserLocation } from '../contexts/LocationContext';
import { Header } from "../components/Header";
import WeeklyMealPlansSection from "../components/WeeklyMealPlansSection";
import MealPlanBottomSheet from "./MealPlanBottomSheet";
import VendorDetailsSkeleton from "./VendorDetailsSkeleton";


function getVendorIdFromRoute(route: string) {
  const match = route.match(/\/vendor\/(.+)/);
  return match ? match[1] : null;
}

interface VendorDetailsPageProps {
  vendorId?: string;
  onShowCart?: () => void;
  vendors: any[];
  loading: boolean;
}

const VendorDetailsPage: React.FC<VendorDetailsPageProps> = ({ vendorId, vendors, loading }) => {
  const [showCartPanel, setShowCartPanel] = useState(false);
  // const { vendors, loading } = useVendors(); // Removed internal fetching

  const { addItem, getItemQuantity, isItemInCart, items: cartItems, totalItems } = useCart();
  const { currentRoute, navigate } = useRouter();
  const location = useLocation();
  const { location: userLocation, locationLabel, locationDisplay } = useUserLocation();
  const vendorFromState = location.state?.vendor;
  const id = vendorId || getVendorIdFromRoute(currentRoute);
  const [fetchedVendor, setFetchedVendor] = useState<any>(null);
  const vendor = vendorFromState || vendors.find(v => v.id === id) || fetchedVendor;
  const [showVendorDetails, setShowVendorDetails] = useState(true);
  const [selectedMealPlan, setSelectedMealPlan] = useState<any | null>(null);
  const { isAuthenticated, user, login, logout } = useAuth();
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  const [showCheckoutPanel, setShowCheckoutPanel] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);
  const [addressRefreshTrigger, setAddressRefreshTrigger] = useState(0);
  const [newlyAddedAddressId, setNewlyAddedAddressId] = useState<string | undefined>(undefined);
  const [profilePanelContent, setProfilePanelContent] = useState<'profile' | 'orders' | 'address'>('profile');
  const [dynamicEta, setDynamicEta] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [isLoadingEta, setIsLoadingEta] = useState<boolean>(true);

  // Fallback: Fetch vendor if not found in list (e.g. refresh or deep link)
  useEffect(() => {
    if (id && !vendor && !loading) {
      const fetchVendor = async () => {
        try {
          const res = await apiService.getVendor(id);
          if (res.success && res.data) {
             setFetchedVendor(processVendorData(res.data));
          } else if (res.vendor) {
             setFetchedVendor(processVendorData(res.vendor));
          }
        } catch (e) {
          console.error("Failed to fetch vendor details", e);
        }
      };
      fetchVendor();
    }
  }, [id, vendor, loading]);

  useEffect(() => {
    const fetchEta = async () => {
      // Ensure vendor has coordinates
      if (!vendor || !vendor.latitude || !vendor.longitude) return;

      let userLat = userLocation?.coordinates?.latitude;
      let userLng = userLocation?.coordinates?.longitude;
      let dropAddress = locationDisplay;

      //// If authenticated, try to use default address coordinates for more precision
      // if (isAuthenticated && user?.phone) {
      //   try {
      //     const res = await AddressApi.getDefaultAddress(user.phone);
      //     if (res.success && res.data) {
      //       if (res.data.latitude && res.data.longitude) {
      //         userLat = res.data.latitude;
      //         userLng = res.data.longitude;
      //       }
      //       // Use precise address string if available
      //       const formattedAddress = AddressApi.getAddressDisplayText(res.data);
      //       if (formattedAddress) {
      //         dropAddress = formattedAddress;
      //       }
      //     }
      //   } catch (e) {
      //     // Fallback to GPS/Context location
      //   }
      // }

      if (userLat && userLng) {
        try {
          const pickup = {
            address: vendor.location,
            latitude: vendor.latitude,
            longitude: vendor.longitude,
          };
          const drop = {
            address: dropAddress,
            latitude: userLat,
            longitude: userLng,
          };

          const res = await apiService.getDeliveryServiceability(pickup, drop);
          
          if (res.data) {
             // Check serviceability explicitly
             const serviceable = res.data.is_serviceable !== undefined ? res.data.is_serviceable : (res.data.value?.is_serviceable ?? true);
             setIsServiceable(serviceable);

             if (serviceable) {
                const pickupEtaStr = res.data.pickup_eta || res.data.value?.pickup_eta;
                
                if (pickupEtaStr) {
                  // Calculate travel time from vendor to customer
                  const travelTimeStr = await DistanceService.getTravelTime(
                    { latitude: vendor.latitude, longitude: vendor.longitude },
                    { latitude: userLat, longitude: userLng }
                  );

                  let totalEtaDisplay = pickupEtaStr;

                  if (travelTimeStr) {
                    const pickupMins = DistanceService.parseDurationToMinutes(pickupEtaStr);
                    const travelMins = DistanceService.parseDurationToMinutes(travelTimeStr);
                    
                    if (pickupMins > 0 && travelMins > 0) {
                      const totalMins = pickupMins + travelMins;
                      // Create a range, e.g., "35-40 mins"
                      totalEtaDisplay = `${totalMins}-${totalMins + 5} mins`;
                    }
                  }
                  
                  setDynamicEta(totalEtaDisplay);
                }
             } else {
                setDynamicEta(null);
             }
          }
        } catch (e) {
          console.error("Failed to fetch dynamic ETA", e);
        } finally {
          setIsLoadingEta(false);
        }
      } else {
        setIsLoadingEta(false);
      }
    };

    fetchEta();
  }, [vendor, isAuthenticated, user?.phone, userLocation]);

  const handleShowLogin = () => setShowLoginPanel(true);
  const handleCloseAuth = () => setShowLoginPanel(false);
  
  const handleAuthComplete = async (authData: any) => {
    try {
      await login(authData);
      setShowLoginPanel(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleShowProfile = (content: 'profile' | 'orders' | 'address') => {
    setProfilePanelContent(content);
    setShowProfilePanel(true);
  };

  const handleLogout = () => {
    logout();
    setShowProfilePanel(false);
  };

  const handleShowCheckout = () => {
    // setShowCartPanel(false);
    // setShowCheckoutPanel(true);
    navigate('/checkout', { from: 'vendor_details' });
  };

  const handlePaymentSuccess = (data: any) => {
    setShowCheckoutPanel(false);
    setPaymentSuccessData(data);
    setShowPaymentSuccess(true);
  };

  const handleAddressAdded = async (address: any) => {
    if (address && address.id) setNewlyAddedAddressId(address.id);
    setAddressRefreshTrigger(prev => prev + 1);
    setShowAddressModal(false);
  };

  // Framer Motion slide variants (fixed for smooth, fast animation)
  const slideVariants = {
    hidden: { x: "100vw", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { ease: cubicBezier(0.77, 0, 0.18, 1), duration: 0.32 } },
    exit: { x: "100vw", opacity: 0, transition: { ease: cubicBezier(0.77, 0, 0.18, 1), duration: 0.18 } }
  };

  const handleClose = () => {
    setShowVendorDetails(false);
    setTimeout(() => {
      navigate("/");
    }, 180); // match exit animation duration
  };

  if (vendor) {
    return (
      <div className="vendor-details-page desktop" style={{ background: '#f7f7fa', minHeight: '100vh' }}>
        {/* Always render header; use CSS for responsive visibility */}
        <div className="hidden lg:block">
          <Header 
            onShowCart={() => navigate('/checkout', { from: 'vendor_details' })} 
            onShowLogin={handleShowLogin}
            onShowProfile={handleShowProfile}
            onLogout={handleLogout}
          />
        </div>
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            paddingLeft: window.innerWidth >= 1024 ? 0 : 16,
            paddingRight: window.innerWidth >= 1024 ? 0 : 16,
            paddingBottom: (totalItems > 0 && !showCartPanel && !showCheckoutPanel) ? 120 : 40,
          }}
        >
          {/* Header Section: back arrow and vendor name, outside card */}
          <VendorHeader
            name={vendor.name}
            rating={vendor.rating}
            reviews={400}
            location={vendor.location}
            deliveryTime={!isServiceable ? "Not Serviceable" : (dynamicEta || vendor.deliveryTime)}
            isLoadingEta={isLoadingEta}
            userAddressLabel={locationDisplay}
            onAddressClick={() => {
              setProfilePanelContent('address');
              setShowProfilePanel(true);
            }}
            cuisineType={vendor.cuisineType}
            tags={vendor.tags || []}
            onBack={handleClose}
            isOpen={vendor.isOpen}
            nextOpenTime={vendor.nextOpenTime}
          />
          {/* Weekly Meal Plans section replaces Select your plans section */}
          <WeeklyMealPlansSection
            noPadding
            onMealPlanClick={plan => setSelectedMealPlan(plan)}
            disabled={!isServiceable || !vendor.isOpen}
            validVendorIds={[vendor.id]}
            isOpen={vendor.isOpen}
            title="Daily Meals"
          />
          {/* Show next steps UI when a meal plan is selected */}
          {selectedMealPlan && (
            window.innerWidth >= 1024 ? (
              <RightPanelNextSteps
                plan={selectedMealPlan}
                onClose={() => setSelectedMealPlan(null)}
              />
            ) : (
                <MealPlanBottomSheet
                plan={selectedMealPlan}
                onClose={() => setSelectedMealPlan(null)}
              />
            )
          )}
          {/* Today's best picks section inside same container */}
          <InstantPicks 
             noPadding 
             vendorId={vendor.id} 
             disabled={!isServiceable || !vendor.isOpen} 
             isOpen={vendor.isOpen}
          />
        </div>
      {(!showCartPanel && !showCheckoutPanel) && (
        <CartStrip 
            onShowCart={() => navigate('/checkout', { from: 'vendor_details' })} 
            isOpen={
              cartItems.length > 0
                ? (cartItems[0].vendorId === vendor.id 
                    ? vendor.isOpen !== false 
                    : (vendors.find(v => v.id === cartItems[0].vendorId)?.isOpen ?? true))
                : true
            }
        />
      )}
      <CartPanel
        isOpen={showCartPanel}
        onClose={() => setShowCartPanel(false)}
        isAuthenticated={isAuthenticated}
        onShowLogin={handleShowLogin}
        onShowCheckout={handleShowCheckout}
      />

      <InstantOrderPanel
        isOpen={showCheckoutPanel}
        onClose={() => setShowCheckoutPanel(false)}
        cartItems={cartItems}
        onPaymentSuccess={handlePaymentSuccess}
        onAddAddress={() => setShowAddressModal(true)}
        refreshTrigger={addressRefreshTrigger}
        newAddressId={newlyAddedAddressId}
        onShowLogin={handleShowLogin}
      />

      {paymentSuccessData && (
        <PaymentSuccessModal
          isOpen={showPaymentSuccess}
          onClose={() => setShowPaymentSuccess(false)}
          paymentDetails={paymentSuccessData.paymentDetails}
          orderSummary={paymentSuccessData.orderSummary}
          onViewOrders={() => {
            setShowPaymentSuccess(false);
            setProfilePanelContent('orders');
            setShowProfilePanel(true);
          }}
          onContinueExploring={() => {
            setShowPaymentSuccess(false);
            navigate('/');
          }}
        />
      )}

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressAdded}
      />
      
      <LoginPanel 
        isOpen={showLoginPanel}
        onClose={handleCloseAuth}
        onAuthComplete={handleAuthComplete}
      />
      
      <ProfilePanel 
        isOpen={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
        onLogout={handleLogout}
        content={profilePanelContent}
        userInfo={user ? {
          name: user.name,
          phone: user.phone,
          email: user.email
        } : null}
      />
    </div>
  );
  }

  if (loading) {
    return <VendorDetailsSkeleton />;
  }

  return <div className="vendor-details-page open"><p>Vendor not found.</p></div>;
};

export default VendorDetailsPage;
