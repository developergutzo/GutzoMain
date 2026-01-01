
import React, { useState, useEffect } from "react";

import { useOrderTracking } from "../contexts/OrderTrackingContext";
import { useRouter } from "./Router";

const AddToHomeScreenPrompt: React.FC<{ onAddToHomeScreen?: () => void; canInstall?: boolean }> = ({ onAddToHomeScreen, canInstall }) => {
  const [visible, setVisible] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Get tracking state to adjust position
  const { activeOrder } = useOrderTracking();
  const { currentRoute } = useRouter();

  // Determine if we need to shift up because of the floating bar
  // Logic matches ActiveOrderFloatingBar visibility
  const isFloatingBarVisible = activeOrder && 
                               activeOrder.status !== 'delivered' && 
                               !currentRoute.startsWith('/tracking/');

  useEffect(() => {
    // Reset localStorage flag if app is not installed (browser mode)
    if (!(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)) {
      localStorage.removeItem('gutzoA2HSClosed');
    }
    // Hide card if user closed it previously (until refresh)
    if (localStorage.getItem('gutzoA2HSClosed') === 'true') {
      setVisible(false);
    }
    // Check if app is running in standalone mode (already installed)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsStandalone(!!standalone);
    };
    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);


  // Only show card if install prompt is available and app is not installed
  if (isStandalone || !canInstall || !visible) return null;

  return (
    <div>
      <div
        className="fixed left-0 w-full z-50 bg-white shadow-lg border-t border-gray-200 transition-all duration-300 ease-in-out"
        style={{ 
            maxWidth: "100vw", 
            padding: 0,
            bottom: isFloatingBarVisible ? '120px' : '0' 
        }}
      >
        <div className="flex flex-row items-center justify-between px-4 py-6">
          {/* Close button - left, vertically centered */}
          <button
            aria-label="Close"
            className="flex-shrink-0 text-gray-400 text-2xl font-bold focus:outline-none mr-8"
            onClick={() => {
              localStorage.setItem('gutzoA2HSClosed', 'true');
              setVisible(false);
            }}
            style={{ background: "none", border: "none", height: "40px", minWidth: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ×
          </button>
          {/* Prompt text - center, multiline if needed */}
          <span className="flex-1 text-gray-800 text-base font-normal leading-snug">
            Would you like to add <span className="font-medium">Gutzo</span> to your home screen?
          </span>
          {/* ADD button or fallback message */}
          <button
            className="flex-shrink-0 ml-4 px-6 py-2 text-white font-semibold rounded focus:outline-none text-base"
            onClick={() => {
              if (onAddToHomeScreen) {
                onAddToHomeScreen();
              }
              setVisible(false);
            }}
            style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center", background: '#1BA672' }}
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToHomeScreenPrompt;
