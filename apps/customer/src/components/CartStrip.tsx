

import React from "react";
import { useCart } from "../contexts/CartContext";
import { ShoppingBag } from "lucide-react";

interface CartStripProps {
  onShowCart?: () => void;
  isOpen?: boolean;
}

const CartStrip: React.FC<CartStripProps> = ({ onShowCart, isOpen = true }) => {
  const { totalItems, totalAmount } = useCart();
  React.useEffect(() => {
    console.log('[CartStrip] totalItems:', totalItems);
  }, [totalItems]);
  if (!totalItems || totalItems === 0) return null;

  return (
    <>
      <style>{`
        .gutzo-cart-strip-fixed {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 16px; 
          z-index: 100;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .gutzo-cart-strip-inner {
          background: ${!isOpen ? '#4A4A4A' : '#1BA672'};
          color: #fff;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-radius: 12px;
          width: calc(100% - 32px);
          max-width: 800px;
          margin: 0 auto;
          pointer-events: auto;
        }
        /* No media query override needed for radius, keeping consistent style */
      `}</style>
      <div className="gutzo-cart-strip-fixed">
        <div className="gutzo-cart-strip-inner">
          <span style={{ fontSize: '15px' }}>{totalItems} item{totalItems > 1 ? 's' : ''} added</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              letterSpacing: 'normal',
              textTransform: 'none', 
              color: '#fff',
              gap: 4,
            }}
            onClick={isOpen ? onShowCart : undefined}
          >
            {isOpen ? (
                <>
                View Cart
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>&gt;</span>
                </>
            ) : (
                <span style={{ fontSize: '15px', fontWeight: 600, textTransform: 'none' }}>
                    Closed
                </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartStrip;
