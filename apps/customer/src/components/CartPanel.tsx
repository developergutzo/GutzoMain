
import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent } from "./ui/sheet";
import { useCart } from "../contexts/CartContext";
import { ImageWithFallback } from "./common/ImageWithFallback";
import { nodeApiService as apiService } from "../utils/nodeApi";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";



interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
  onShowLogin?: () => void;
  onShowCheckout?: () => void;
}

export function CartPanel({ isOpen, onClose, isAuthenticated = false, onShowLogin, onShowCheckout }: CartPanelProps) {
  const { isMobile } = useResponsiveLayout();
  const { items, totalItems, totalAmount, updateQuantityOptimistic, removeItem, clearCart, clearGuestCart } = useCart();

  const [syncedItems, setSyncedItems] = useState<typeof items>(items);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(false);

  useEffect(() => {
    async function syncPrices() {
      if (!isOpen || items.length === 0) return setSyncedItems(items);
      setLoadingPrices(true);
      try {
        const productIds = items.map((item) => item.productId);
        const result = await apiService.getProductsByIds(productIds);
        const products = result.data || [];
        const priceMap: Record<string, number> = {};
        products.forEach((prod) => {
          priceMap[prod.id] = prod.price;
        });
        const updated = items.map((item) => ({
          ...item,
          price: priceMap[item.productId] !== undefined ? priceMap[item.productId] : item.price,
        }));
        setSyncedItems(updated);
      } catch (err) {
        setSyncedItems(items);
      } finally {
        setLoadingPrices(false);
      }
    }
    syncPrices();
  }, [isOpen, items]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await updateQuantityOptimistic(productId, 0); // This will remove the item via API
    } else {
      await updateQuantityOptimistic(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    await updateQuantityOptimistic(productId, 0); // Remove via API by setting quantity to 0
  };

  const handleClearCart = () => {
    if (isAuthenticated) {
      clearCart(); // This will sync with API for authenticated users
    } else {
      clearGuestCart(); // This clears localStorage for guests
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated && onShowLogin) {
      onClose(); // Close cart panel before showing login
      onShowLogin();
      return;
    }
    if (onShowCheckout) {
      onShowCheckout();
    }
  };

  // GST configuration per your rules:
  // - Item prices include 5% GST
  // - Delivery fee is flat ₹50 including 18% GST
  // - Platform fee is flat ₹10 including 18% GST
  const ITEMS_GST_RATE = 0.05; // 5%
  const FEES_GST_RATE = 0.18; // 18%
  const DELIVERY_FEE = 50;
  const PLATFORM_FEE = 10;



  // Group items by vendor (use syncedItems)
  const itemsByVendor = syncedItems.reduce<Record<string, { vendor: any; items: typeof syncedItems }>>((groups, item) => {
    const vendorId = item.vendorId;
    if (!groups[vendorId]) {
      groups[vendorId] = {
        vendor: item.vendor,
        items: []
      };
    }
    groups[vendorId].items.push(item);
    return groups;
  }, {});

  if (!isOpen) return null;

  // Cart content - shared between mobile and desktop
  const cartContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Cart {totalItems > 0 && `(${totalItems} items)`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {syncedItems.length === 0 ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Add some delicious everyday meals to get started
            </p>
            <Button
              onClick={onClose}
              className="bg-gutzo-primary hover:bg-gutzo-primary-hover text-white"
            >
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
                {/* Cart Items by Vendor */}
                {Object.values(itemsByVendor).map((group) => (
                  <div key={group.vendor.id} className="bg-gray-50 rounded-xl p-4">
                    {/* Vendor Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={group.vendor.image}
                          alt={group.vendor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{group.vendor.name}</h4>
                        <p className="text-sm text-gray-600">{group.items.length} item{group.items.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.product.image ? (
                                <ImageWithFallback
                                  src={item.product.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm truncate">{item.name}</h5>
                              <p className="text-sm text-gray-600">₹{item.price}</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Minus className="h-3 w-3 text-gray-600" />
                                </button>
                                <span className="min-w-[1.5rem] text-center font-medium text-gray-900 text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="h-3 w-3 text-gray-600" />
                                </button>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="mt-2 flex justify-end">
                            <span className="font-medium text-gray-900 text-sm">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {/* GST info per item (included @5%) */}
                          <div className="mt-1 flex justify-end">
                            {(() => {
                              const itemTotal = item.price * item.quantity;
                              const includedGstItem = itemTotal - (itemTotal / (1 + ITEMS_GST_RATE));
                              return (
                                <span className="text-xs text-gray-500">
                                  Incl. GST ({(ITEMS_GST_RATE * 100).toFixed(0)}%): ₹{includedGstItem.toFixed(2)}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

      {/* Footer with Order Summary */}
      {syncedItems.length > 0 && (
        <div className="bg-white p-6 flex-shrink-0">
          {/* Order Summary */}
          <div className="space-y-2 text-sm mb-4">
            {(() => {
              // Compute values once for clarity and consistency
              const subtotal = syncedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const deliveryFee = DELIVERY_FEE;
              const platformFee = PLATFORM_FEE;
              // Included GST: items at 5%
              const includedGstItems = subtotal - (subtotal / (1 + ITEMS_GST_RATE));
              // Included GST in fees at 18%
              const includedGstDelivery = deliveryFee - (deliveryFee / (1 + FEES_GST_RATE));
              const includedGstPlatform = platformFee - (platformFee / (1 + FEES_GST_RATE));
              const includedGstFees = includedGstDelivery + includedGstPlatform;
              const total = subtotal; // Fees only shown in Review Order page
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({totalItems})</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Fees removed from Cart view as per request - displayed in Review Order/Checkout only */}
                  
                  <div className="pt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gutzo-primary">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <Button
            onClick={handleProceedToCheckout}
            className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white h-11 flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-gray-500 text-center" style={{ fontSize: '11px', marginTop: '2px' }}>
            By placing this order, you agree to our Terms & Conditions
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* MOBILE: Bottom Sheet */}
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent
            side="bottom"
            className="p-0 w-full max-w-full left-0 right-0 transition-transform duration-300 ease-in-out"
            style={{ top: '104px', bottom: 0 }}
          >
            <style>{`
              [data-slot="sheet-content"] > button[class*="absolute"] {
                display: none !important;
              }
            `}</style>
            {cartContent}
          </SheetContent>
        </Sheet>
      ) : (
        /* DESKTOP: Right Panel */
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
            zIndex: 50,
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 300ms ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
          }}
        >
          {cartContent}
        </div>
      )}
    </>
  );
}