import CartStrip from "./CartStrip";
import { CartPanel } from "./CartPanel";
import { LoginPanel } from "./auth/LoginPanel";
import { ProfilePanel } from "./auth/ProfilePanel";
import { useAuth } from "../contexts/AuthContext";
      <CartStrip />
    import FutureMeals from "./FutureMeals";
    <FutureMeals />
  import MenuCategories from "./MenuCategories";
  <MenuCategories />
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
import { Header } from "../components/Header";
import WeeklyMealPlansSection from "../components/WeeklyMealPlansSection";
import MealPlanBottomSheet from "./MealPlanBottomSheet";

function getVendorIdFromRoute(route: string) {
  const match = route.match(/\/vendor\/(.+)/);
  return match ? match[1] : null;
}

interface VendorDetailsPageProps {
  vendorId?: string;
  onShowCart?: () => void;
}

const VendorDetailsPage: React.FC<VendorDetailsPageProps> = ({ vendorId }) => {
  const [showCartPanel, setShowCartPanel] = useState(false);
  const { vendors, loading } = useVendors();
  const { addItem, getItemQuantity, isItemInCart } = useCart();
  const { currentRoute, navigate } = useRouter();
  const location = useLocation();
  const vendorFromState = location.state?.vendor;
  const id = vendorId || getVendorIdFromRoute(currentRoute);
  const vendor = vendorFromState || vendors.find(v => v.id === id);
  const [showVendorDetails, setShowVendorDetails] = useState(true);
  const [selectedMealPlan, setSelectedMealPlan] = useState<any | null>(null);
  const { isAuthenticated, user, login, logout } = useAuth();
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [profilePanelContent, setProfilePanelContent] = useState<'profile' | 'orders' | 'address'>('profile');

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
            onShowCart={() => setShowCartPanel(true)} 
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
          }}
        >
          {/* Header Section: back arrow and vendor name, outside card */}
          <VendorHeader
            name={vendor.name}
            rating={vendor.rating}
            reviews={400}
            location={vendor.location || vendor.deliveryTime}
            tags={["Vegan Friendly", "High Protein", "Fresh Daily"]}
            onBack={handleClose}
          />
          {/* Weekly Meal Plans section replaces Select your plans section */}
          <WeeklyMealPlansSection
            noPadding
            onMealPlanClick={plan => setSelectedMealPlan(plan)}
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
          <InstantPicks noPadding vendorId={vendor.id} />
        </div>
      {!showCartPanel && <CartStrip onShowCart={() => setShowCartPanel(true)} />}
      <CartPanel
        isOpen={showCartPanel}
        onClose={() => setShowCartPanel(false)}
        isAuthenticated={isAuthenticated}
        onShowLogin={handleShowLogin}
        onShowCheckout={() => {}}
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
    return <div className="vendor-details-page open"><p>Loading vendor details...</p></div>;
  }

  return <div className="vendor-details-page open"><p>Vendor not found.</p></div>;
};

export default VendorDetailsPage;
