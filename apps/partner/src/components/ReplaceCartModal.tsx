import React from 'react';
import { useMediaQuery } from '../hooks/use-media-query'; // Assuming this hook exists in the project
import { X } from 'lucide-react';

interface ReplaceCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  oldVendorName: string;
  newVendorName: string;
}

const ReplaceCartModal: React.FC<ReplaceCartModalProps> = ({ isOpen, onClose, onConfirm, oldVendorName, newVendorName }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (!isOpen) return null;

  /* 
   * SWIGGY-LIKE UI IMPLEMENTATION 
   * Matches the visual style of the reference image provided.
   */
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div 
        className="relative bg-white w-full max-w-[360px] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
        style={{ borderRadius: '24px' }}
      >
        {/* Close Icon (Top Right) */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 p-2 text-[#6B6B6B] hover:bg-gray-100 rounded-full transition-colors"
        >
           <X size={20} />
        </button>

        <div className="flex flex-col gap-2 mt-2">
          {/* Header */}
          <h3 
            className="text-[#1A1A1A] leading-tight text-left font-primary"
            style={{ fontSize: '20px', fontWeight: 600 }}
          >
             Replace cart item?
          </h3>

          {/* Body Text */}
          <p className="text-[14px] leading-relaxed text-[#6B6B6B] text-left px-1 mt-2 mb-6">
             Your cart has dishes from {oldVendorName}. Do you want to clear it and add dishes from {newVendorName}?
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
             {/* Secondary Action: NO */}
             <button 
                onClick={onClose}
                className="w-full h-12 flex items-center justify-center font-bold text-[16px] uppercase tracking-wide transition-transform active:scale-95"
                style={{ backgroundColor: '#E8F6F1', color: '#1BA672', borderRadius: '10px' }}
             >
                NO
             </button>
             
             {/* Primary Action: REPLACE */}
             <button 
                onClick={onConfirm}
                className="w-full h-12 flex items-center justify-center text-white font-bold text-[16px] uppercase tracking-wide shadow-md transition-transform active:scale-95"
                style={{ backgroundColor: '#1BA672', color: '#ffffff', borderRadius: '10px' }}
             >
                REPLACE
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplaceCartModal;
