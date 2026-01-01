import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "../contexts/CartContext";
import { useState, useEffect } from "react";

interface VendorCartStripProps {
  vendorId: string;
  vendorName: string;
  vendorImage?: string;
  onViewCart: () => void;
  isDrawerOpen?: boolean;
  isCartOpen?: boolean;
  isOpen?: boolean;
}

import { X } from "lucide-react";
import { useRouter } from "./Router";
import ClearCartModal from "./ClearCartModal";

export function VendorCartStrip({ vendorId, vendorName, vendorImage, onViewCart, isDrawerOpen = false, isCartOpen = false, isOpen = true }: VendorCartStripProps) {
  const { navigate } = useRouter();
  const { getVendorItems, clearCart } = useCart();
  const vendorItems = getVendorItems(vendorId);
  const itemCount = vendorItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const [prevItemCount, setPrevItemCount] = useState(itemCount);
  const [prevTotalAmount, setPrevTotalAmount] = useState(totalAmount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Trigger animation when numbers change
  useEffect(() => {
    if (itemCount !== prevItemCount || totalAmount !== prevTotalAmount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 250);
      setPrevItemCount(itemCount);
      setPrevTotalAmount(totalAmount);
      return () => clearTimeout(timer);
    }
  }, [itemCount, totalAmount, prevItemCount, prevTotalAmount]);

  if (itemCount === 0 || isCartOpen) return null;

  return (
    <div 
      className={`fixed bottom-4 z-50 transition-all duration-300 ease-in-out
        left-4 right-4
        lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-full lg:max-w-4xl
        ${isDrawerOpen ? 'lg:translate-x-0 lg:left-auto lg:right-4 lg:w-[400px]' : ''}`}
    >
      <div 
        className="bg-white rounded-xl shadow-xl flex items-center justify-between p-2 md:p-3 border border-gray-100"
      >
        {/* Left Section: Image + Info */}
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden min-w-0 flex-1">
            {vendorImage ? (
               <img src={vendorImage} alt={vendorName} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border border-gray-100 flex-shrink-0" />
            ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg md:text-xl font-bold text-gray-400">{vendorName.charAt(0)}</span>
                </div>
            )}
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-bold text-gray-900 text-base md:text-lg truncate pr-1 leading-tight">
                {vendorName}
              </span>
              <button 
                onClick={() => navigate(`/vendor/${vendorId}`)} // Simple navigation for "View Full Menu"
                className="text-left text-xs md:text-sm text-gray-500 underline decoration-gray-400 underline-offset-2 hover:text-gray-800 transition-colors mt-0.5 font-medium truncate"
              >
                View Full Menu
              </button>
            </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Green Checkout Button */}
            <button
               onClick={isOpen ? onViewCart : undefined}
               className={`rounded-lg px-4 py-2 md:px-6 md:py-3 flex flex-col items-center justify-center min-w-[120px] md:min-w-[150px] transition-colors relative overflow-hidden group active:scale-95 duration-200 flex-shrink-0 ${!isOpen ? 'bg-[#4A4A4A] cursor-not-allowed' : 'bg-[#1BA672] hover:bg-[#14885E]'}`}
               style={{ backgroundColor: !isOpen ? '#4A4A4A' : '#1BA672' }}
               disabled={!isOpen}
            >
               {isOpen ? (
                   <>
                   <div className="text-sm md:text-lg font-normal opacity-95 leading-tight mb-0.5 text-white whitespace-nowrap">
                     {itemCount} item{itemCount !== 1 ? 's' : ''} | ₹{totalAmount}
                   </div>
                   <div className="text-base md:text-lg font-extrabold uppercase tracking-wide leading-tight opacity-90 text-white">
                     Checkout
                   </div>
                   </>
               ) : (
                    <div className="text-base md:text-lg font-extrabold uppercase tracking-wide leading-tight opacity-90 text-white">
                        Closed
                    </div>
               )}
            </button>

            {/* Remove / Close Button */}
            <button
              onClick={() => setShowClearModal(true)}
              className="bg-red-50 hover:bg-red-100 text-red-500 rounded-full w-8 h-8 flex items-center justify-center transition-colors active:scale-95 duration-200 flex-shrink-0"
              aria-label="Remove items"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
        </div>
       </div>
      <ClearCartModal 
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          clearCart();
          setShowClearModal(false);
        }}
        vendorName={vendorName}
      />
    </div>
  );
}