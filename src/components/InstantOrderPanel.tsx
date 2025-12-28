import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from "./ui/sheet";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { X, Plus, Minus, ShoppingCart, Clock, MapPin, ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle } from 'lucide-react';
import { toast } from "sonner";
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { ImageWithFallback } from './common/ImageWithFallback';
import { Product, Vendor } from '../types/index';
import { nodeApiService as apiService } from '../utils/nodeApi';
import { useRouter } from './Router';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';

export interface CartItem {
  id: string;
  productId: string;
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  vendor: {
    id: string;
    name: string;
    image: string;
  };
  product: {
    image?: string;
    description?: string;
    category?: string;
  };
}

interface InstantOrderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  product?: Product | null;
  vendor?: Vendor | null;
  onConfirmOrder?: (orderData: InstantOrderData) => void;
  onProceedToPayment?: (orderData: InstantOrderData) => void;
  onPaymentSuccess?: (paymentData: any) => void;
  onAddAddress?: () => void;
  refreshTrigger?: number;
  newAddressId?: string | null;
  onShowLogin?: () => void;
}

export interface InstantOrderData {
  cartItems: CartItem[];
  totalPrice: number;
  estimatedDelivery: Date;
  specialInstructions?: string;
  vendor?: Vendor | null;
}

export function InstantOrderPanel({
  isOpen,
  onClose,
  cartItems: initialCartItems,
  product,
  vendor,
  onConfirmOrder,
  onProceedToPayment,
  onPaymentSuccess,
  onAddAddress,
  refreshTrigger = 0,
  newAddressId,
  onShowLogin
}: InstantOrderPanelProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [syncedItems, setSyncedItems] = useState<CartItem[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  // apiService is now imported above
  // Sync prices from backend when cartItems change or panel opens
  useEffect(() => {
    let cancelled = false;
    async function syncPrices() {
      if (!isOpen || cartItems.length === 0) {
        setSyncedItems(cartItems);
        return;
      }
      setLoadingPrices(true);
      try {
        const productIds = cartItems.map(item => item.productId);
        const result = await apiService.getProductsByIds(productIds);
        const products = result.data || [];
        const priceMap: Record<string, number> = {};
        products.forEach((prod: any) => {
          priceMap[prod.id] = prod.price;
        });
        const updated = cartItems.map(item => ({
          ...item,
          price: priceMap[item.productId] !== undefined ? priceMap[item.productId] : item.price
        }));
        if (!cancelled) setSyncedItems(updated);
      } catch (err) {
        if (!cancelled) setSyncedItems(cartItems);
      } finally {
        if (!cancelled) setLoadingPrices(false);
      }
    }
    syncPrices();
    return () => { cancelled = true; };
  }, [isOpen, cartItems]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('upi');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { navigate } = useRouter();
  const { isMobile } = useResponsiveLayout();
  const { location, locationDisplay } = useLocation();

  // GST rules (aligned with cart):
  // - Item prices include 5% GST
  // - Delivery fee is flat ₹50 including 18% GST
  // - Platform fee is flat ₹10 including 18% GST
  const ITEMS_GST_RATE = 0.05; // 5%
  const FEES_GST_RATE = 0.18; // 18%
  const DELIVERY_FEE = 1;
  const PLATFORM_FEE = 5;

  // Digital wallet options
  const digitalWallets = [
    { id: 'phonepe', name: 'PhonePe', icon: '💰', color: 'bg-blue-500' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: '📦', color: 'bg-orange-500' },
    { id: 'mobikwik', name: 'MobiKwik', icon: '💳', color: 'bg-red-500' },
    { id: 'freecharge', name: 'FreeCharge', icon: '⚡', color: 'bg-green-500' },
    { id: 'googlepay', name: 'Google Pay', icon: '🎯', color: 'bg-blue-600' }
  ];

  // Dynamic Delivery Fee State
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [loadingFee, setLoadingFee] = useState<boolean>(false);
  const [serviceabilityError, setServiceabilityError] = useState<string | null>(null);

  // Initialize cart when data changes
  useEffect(() => {
    if (isOpen) {
      if (initialCartItems && initialCartItems.length > 0) {
        // Use cart items from CartContext
        setCartItems(initialCartItems);
        // Get vendor from first cart item
        const firstItem = initialCartItems[0];
        
        // If vendor details are incomplete (e.g. missing location), fetch full details
        // Cast to any to access potential extra properties not in rigid type
        const vendorData = firstItem.vendor as any;
        
        if (!vendorData.location && firstItem.vendorId) {
             apiService.getVendor(firstItem.vendorId).then(res => {
                if (res.success && res.data) {
                    console.log('✅ [InstantOrderPanel] Fetched full vendor details:', res.data);
                    setCurrentVendor(res.data);
                } else {
                    // Fallback to partial data if fetch fails
                    setCurrentVendor({
                      id: firstItem.vendorId,
                      name: firstItem.vendor.name,
                      image: firstItem.vendor.image,
                      // placeholders
                      location: '',
                      rating: 0,
                      deliveryTime: '',
                      minimumOrder: 0,
                      deliveryFee: 0,
                      cuisineType: '',
                      phone: '',
                      description: '', // Added missing field
                      isActive: true,
                      isFeatured: false,
                      created_at: new Date().toISOString(),
                      tags: []
                    } as Vendor);
                }
             }).catch(err => {
                 console.error('❌ [InstantOrderPanel] Failed to fetch vendor:', err);
             });
        } else {
             // Use existing data
             setCurrentVendor({
               id: firstItem.vendorId,
               name: firstItem.vendor.name,
               image: firstItem.vendor.image,
               location: vendorData.location || '',
               latitude: vendorData.latitude,
               longitude: vendorData.longitude,
               description: '', // Default if missing
               rating: vendorData.rating || 0,
               deliveryTime: vendorData.deliveryTime || '',
               minimumOrder: vendorData.minimumOrder || 0,
               deliveryFee: vendorData.deliveryFee || 0,
               cuisineType: vendorData.cuisineType || '',
               phone: vendorData.phone || '',
               isActive: true,
               isFeatured: false,
               created_at: new Date().toISOString(),
               tags: [],
               ...(firstItem.vendor as any) // Spread to catch others, cast to avoid type conflicts
             } as Vendor);
        }

      } else if (product && vendor) {
        // Single product order - vendor object passed in usually full
        setCartItems([{ 
          id: product.id,
          productId: product.id,
          vendorId: vendor.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          vendor: {
            id: vendor.id,
            name: vendor.name,
            image: vendor.image
          },
          product: {
            image: product.image,
            description: product.description,
            category: product.category
          }
        }]);
        setCurrentVendor(vendor);
      }
    }
  }, [initialCartItems, product, vendor, isOpen]);


  // Address selection logic
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  const { user, isAuthenticated } = useAuth(); // Use auth context for reliable user data

  useEffect(() => {
    console.log('🔄 [InstantOrderPanel] sync initiated', { 
      isOpen, 
      refreshTrigger,
      userPhone: user?.phone 
    });

    if (user?.phone) {
      const formatted = user.phone.startsWith('+91') 
        ? user.phone 
        : `+91${user.phone}`;
      
      setUserPhone(formatted);
      
      console.log('📡 [InstantOrderPanel] Fetching addresses for:', formatted);
      
      import('../utils/addressApi').then(({ AddressApi }) => {
        AddressApi.getUserAddresses(formatted).then(res => {
          console.log('📥 [InstantOrderPanel] Address API Response:', res);
          
          if (res.success && Array.isArray(res.data)) {
            setAddresses(res.data);
            
            // LOGIC: Auto-select newly added address OR default
            let addressToSelect = null;
            
            if (newAddressId) {
              console.log('🔍 [InstantOrderPanel] Looking for newAddressId:', newAddressId);
              const newAddr = res.data.find(a => a.id === newAddressId);
              if (newAddr) {
                console.log('✨ [InstantOrderPanel] Auto-selecting new address:', newAddr);
                addressToSelect = newAddr;
              } else {
                 console.warn('⚠️ [InstantOrderPanel] New address ID not found in fetched list:', newAddressId);
                 // Dump IDs for debugging
                 console.log('📋 Available IDs:', res.data.map(a => a.id));
              }
            }
            
            if (!addressToSelect) {
               addressToSelect = res.data.find(a => a.is_default) || res.data[0];
            }
            
            setSelectedAddress(addressToSelect);
            console.log('✅ [InstantOrderPanel] Final Selected address:', addressToSelect);
            
          } else if (res.success && !res.data) {
             console.log('⚠️ [InstantOrderPanel] No addresses found in response data');
             setAddresses([]);
          } else {
             console.error('❌ [InstantOrderPanel] Address fetch failed or invalid format');
          }
        }).catch(err => {
          console.error('❌ [InstantOrderPanel] Address fetch error:', err);
        });
      });
    } else {
      console.log('ℹ️ [InstantOrderPanel] No user phone available, skipping fetch');
      // Fallback to device location if available and no user logged in
      if (location && location.coordinates) {
         console.log('📍 [InstantOrderPanel] Using device location as fallback');
         setSelectedAddress({
           id: 'device_location',
           type: 'Current Location',
           full_address: locationDisplay,
           street: '',
           area: '',
           latitude: location.coordinates.latitude,
           longitude: location.coordinates.longitude,
           is_default: false,
           // Add missing required properties for type compatibility if needed
           label: 'Current Location',
           zip: '',
           city: location.city,
           state: location.state
         });
      }
    }
  }, [isOpen, refreshTrigger, user?.phone, newAddressId, location, locationDisplay]);

  // Calculate Delivery Fee
  useEffect(() => {
    async function fetchDeliveryFee() {
        if (!isOpen || !selectedAddress || !currentVendor) {
            return;
        }

        // We need vendor location to calculate fee
        if (!currentVendor.location && !currentVendor.latitude) {
            console.warn('⚠️ [InstantOrderPanel] Vendor location missing, skipping fee calculation');
            return;
        }

        setLoadingFee(true);
        setServiceabilityError(null);
        
        try {
            const pickup = {
                address: currentVendor.location || "Vendor Location",
                latitude: currentVendor.latitude,
                longitude: currentVendor.longitude
            };
            
            // selectedAddress usually has these, but good to ensure
            const drop = {
                address: selectedAddress.full_address || selectedAddress.street,
                latitude: selectedAddress.latitude,
                longitude: selectedAddress.longitude
            };

            if (!pickup.latitude || !drop.latitude) {
                 console.warn('⚠️ [InstantOrderPanel] Missing coordinates for pickup/drop', { pickup, drop });
                 // Can't calculate without coords usually
            }

            console.log('🛵 [InstantOrderPanel] Checking serviceability...', { pickup, drop });
            const res = await apiService.getDeliveryServiceability(pickup, drop);
            
            if (res.success && res.data) {
                // Check is_serviceable flag
                const serviceable = res.data.is_serviceable ?? true; // Default to true if missing? detailed check needed
                setIsServiceable(serviceable);
                
                if (serviceable) {
                    // Use total_amount as the delivery fee (cost of task)
                    // Or delivery_fee if explicitly provided
                    const fee = res.data.total_amount || res.data.delivery_fee || 50; // Fallback 50
                    setDeliveryFee(fee);
                } else {
                    setServiceabilityError(res.data.reason || "Location not serviceable from this vendor.");
                    setDeliveryFee(0);
                }
            } else {
                 console.error('❌ [InstantOrderPanel] Serviceability check failed', res);
                 setDeliveryFee(50); // Fallback? Or error?
                 // Let's fallback to standard fee but maybe warn?
            }
        } catch (err: any) {
            console.error('❌ [InstantOrderPanel] Error fetching delivery fee:', err);
            // On error within serviceability check, maybe set default but don't block?
            // Or block if strict. For now, constant fee fallback.
            setDeliveryFee(50);
        } finally {
            setLoadingFee(false);
        }
    }

    fetchDeliveryFee();
  }, [isOpen, selectedAddress, currentVendor?.id, currentVendor?.location]); // Dep on vendor ID/Loc to re-trigger


  if (!isOpen) return null;

  const displayVendor = currentVendor || vendor;
  const totalPrice = syncedItems.length > 0 ? syncedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes from now

  // Included GST computations
  // deliveryFee is now dynamic (set by state)
  const platformFee = PLATFORM_FEE;
  const includedGstItems = totalPrice - (totalPrice / (1 + ITEMS_GST_RATE));
  // Use state deliveryFee
  const includedGstDelivery = deliveryFee - (deliveryFee / (1 + FEES_GST_RATE));
  const includedGstPlatform = platformFee - (platformFee / (1 + FEES_GST_RATE));
  const includedGstFees = includedGstDelivery + includedGstPlatform;
  const totalAmount = totalPrice + deliveryFee + platformFee; // All GST-inclusive

  const handleQuantityChange = (productId: string, delta: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.productId === productId || item.id === productId) {
          const newQuantity = Math.max(1, Math.min(10, item.quantity + delta));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId && item.id !== productId));
  };

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      if (onShowLogin) {
        onShowLogin();
        toast.info("Please login to place your order");
      } else {
        toast.error("Please login to place an order");
      }
      return;
    }

    if (selectedPaymentMethod === 'wallet' && !selectedWallet) {
      toast.error('Please select a wallet to continue');
      return;
    }
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const orderData: InstantOrderData = {
        cartItems,
        totalPrice,
        estimatedDelivery,
        specialInstructions: specialInstructions.trim() || undefined,
        vendor: displayVendor
      };
      let paymentMethodName = selectedPaymentMethod;
      if (selectedPaymentMethod === 'wallet' && selectedWallet) {
        const walletName = digitalWallets.find(w => w.id === selectedWallet)?.name;
        paymentMethodName = walletName || 'Digital Wallet';
      } else if (selectedPaymentMethod === 'upi') {
        paymentMethodName = upiId ? `UPI (${upiId})` : 'UPI';
      } else if (selectedPaymentMethod === 'card') {
        paymentMethodName = 'Credit/Debit Card';
      }
      const paymentSuccessData = {
        paymentDetails: {
          paymentId: `PAY_${Date.now()}`,
          subscriptionId: `ORD_${Date.now()}`,
          method: paymentMethodName,
          amount: totalPrice + 5,
          date: new Date().toLocaleDateString('en-IN')
        },
        orderSummary: {
          items: cartItems.length,
          vendor: displayVendor?.name || 'Unknown Vendor',
          orderType: 'Instant Delivery',
          quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0) + ' items',
          estimatedDelivery: estimatedDelivery.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      };
      onClose();
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentSuccessData);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDietTags = (item: CartItem): string[] => {
    // product.tags does not exist on CartItem.product, so return empty array
    return [];
  };

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gutzo-primary/15 to-gutzo-highlight/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gutzo-primary/15 rounded-full">
            <ShoppingCart className="h-5 w-5 text-gutzo-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Review Order</h2>
            <p className="text-sm text-gray-600">Confirm your items before payment</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Delivery Address */}
        <div className="bg-gradient-to-r from-gutzo-primary/10 to-gutzo-highlight/15 rounded-xl p-4 border border-gutzo-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gutzo-primary/15 rounded-full">
              <MapPin className="h-5 w-5 text-gutzo-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
              {selectedAddress ? (
                <div className="text-sm text-gray-700">
                  <p className="font-medium">
                    {selectedAddress.type.toLowerCase() === 'home' ? 'Home' : 
                     selectedAddress.type.toLowerCase() === 'work' ? 'Work' : 
                     (selectedAddress.custom_label || selectedAddress.label || selectedAddress.type)}
                  </p>
                  <p>{selectedAddress.street}{selectedAddress.area ? `, ${selectedAddress.area}` : ""}</p>
                  <p>{selectedAddress.full_address}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedAddress.landmark ? selectedAddress.landmark : userPhone}</p>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                   <p className="text-gray-500 mb-2 text-sm">No address found.</p>
                   <Button 
                     size="sm" 
                     className="bg-gutzo-primary text-white h-8 text-xs"
                     onClick={() => {
                       if (onAddAddress) onAddAddress();
                     }}
                   >
                     + Add Address
                   </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {selectedAddress && addresses.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gutzo-primary border-gutzo-primary hover:bg-gutzo-primary/5 text-xs w-full"
                  onClick={() => setShowAddressPanel(true)}
                >
                  Change
                </Button>
              )}
              {selectedAddress && (
                <Button
                  size="sm"
                  className="bg-gutzo-primary text-white text-xs h-8 px-3"
                  onClick={() => {
                    if (onAddAddress) onAddAddress();
                  }}
                >
                  + Add
                </Button>
              )}
            </div>
          </div>
        </div>
        {showAddressPanel && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h4 className="font-medium text-gray-900 mb-4">Select Delivery Address</h4>
              <div className="space-y-3">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div key={address.id} className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedAddress?.id === address.id ? 'border-gutzo-primary bg-gutzo-primary/5' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => { setSelectedAddress(address); setShowAddressPanel(false); }}>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gutzo-primary" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {address.type.toLowerCase() === 'home' ? 'Home' : 
                             address.type.toLowerCase() === 'work' ? 'Work' : 
                             (address.custom_label || address.label || address.type)}
                          </p>
                          <p className="text-sm">{address.street}{address.area ? `, ${address.area}` : ""}</p>
                          <p className="text-xs text-gray-600">{address.full_address}</p>
                        </div>
                        {selectedAddress?.id === address.id && <span className="text-xs text-gutzo-primary font-semibold">Selected</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 mb-4">No addresses found. Please add a delivery address.</p>
                    <Button
                      className="w-full bg-gutzo-primary text-white font-medium rounded-lg"
                      onClick={() => {
                        setShowAddressPanel(false);
                        if (onAddAddress) onAddAddress();
                      }}
                    >
                      Add Address
                    </Button>
                  </div>
                )}
              </div>
              <Button className="mt-4 w-full" onClick={() => setShowAddressPanel(false)}>Close</Button>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Your Order ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h4>
            <div className="text-sm text-gray-600">
              From <span className="font-medium">{displayVendor?.name}</span>
            </div>
          </div>

          {/* Cart Items List */}
          {loadingPrices ? (
            <div className="text-center py-8 text-gray-500">Updating prices...</div>
          ) : (
            <div className="space-y-3">
              {(syncedItems.length > 0 ? syncedItems : cartItems).map((item) => (
                <Card key={item.id || item.productId} className="overflow-hidden border border-gray-200">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded-xl">
                        <ImageWithFallback
                          src={item.product?.image || ''}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 leading-tight text-sm">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-600">{item.vendor?.name || displayVendor?.name}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gutzo-selected">
                              ₹{item.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">per bowl</div>
                          </div>
                        </div>
                        {/* Diet Tags */}
                        {getDietTags(item).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {getDietTags(item).slice(0, 2).map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs bg-gutzo-highlight/20 text-gutzo-selected"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId || item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0 rounded-full border-2"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-semibold text-sm min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId || item.id, 1)}
                              disabled={item.quantity >= 10}
                              className="h-8 w-8 p-0 rounded-full border-2"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                            {(syncedItems.length > 1 ? syncedItems : cartItems).length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.productId || item.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* GST info per item (included @5%) */}
                        <div className="mt-1 text-right">
                          {(() => {
                            const itemTotal = item.price * item.quantity;
                            const includedGstItem = itemTotal - (itemTotal / (1 + ITEMS_GST_RATE));
                            return (
                              <span className="text-xs text-gray-500">Incl. GST ({(ITEMS_GST_RATE * 100).toFixed(0)}%): ₹{includedGstItem.toFixed(2)}</span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Information */}


        {/* Special Instructions */}



        {/* Only one payment button at the bottom for PhonePe integration (placeholder) */}

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-gutzo-highlight/15 to-gutzo-primary/10 rounded-xl p-5 border border-gutzo-primary/20">
          <h4 className="font-medium text-gray-900 mb-4">Order Summary</h4>
          
          <div className="space-y-3 text-sm">
            {(syncedItems.length > 0 ? syncedItems : cartItems).map((item) => (
              <div key={item.id || item.productId} className="flex justify-between">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-gray-600">
                  Delivery fee (incl. 18% GST)
                  {loadingFee && <span className="ml-2 inline-block animate-spin">⌛</span>}
              </span>
              <span className={`font-medium ${!isServiceable ? 'text-red-500' : 'text-gray-900'}`}>
                  {loadingFee ? '...' : 
                   !isServiceable ? 'Not serviceable' : 
                   `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform fee (incl. 18% GST)</span>
              <span className="font-medium text-gray-900">₹{platformFee.toFixed(2)}</span>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between text-xs text-gray-500">
              <span>GST included in items @5%</span>
              <span>₹{includedGstItems.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>GST included in fees @18%</span>
              <span>₹{includedGstFees.toFixed(2)}</span>
            </div>
            
            {!isServiceable && serviceabilityError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs font-medium">
                    {serviceabilityError}
                </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="font-medium text-gray-900">Total Amount:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-gutzo-selected">
                  ₹{totalAmount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Includes all charges</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Button */}
      <div className="p-6 border-t border-gray-200 bg-gray-50/50">
        <Button
          onClick={async () => {
            if (!isAuthenticated) {
              if (onShowLogin) {
                onShowLogin();
                toast.info("Please login to place your order");
              } else {
                toast.error("Please login to place an order");
              }
              return;
            }

            if (cartItems.length === 0 || isProcessing || !isServiceable) return;
            
            if (!selectedAddress) {
              toast.error('Please select a delivery address');
              return;
            }

            setIsProcessing(true);
            try {
              // 1. Create order first
              const orderPayload = {
                vendor_id: displayVendor?.id || cartItems[0].vendorId, // Fallback if vendor object missing
                items: syncedItems.length > 0 ? syncedItems.map(item => ({
                  product_id: item.productId || item.id,
                  quantity: item.quantity,
                  variant_id: undefined, // Add if variant support needed
                  addons: undefined,     // Add if addons support needed
                  special_instructions: undefined // Add if needed
                })) : cartItems.map(item => ({
                  product_id: item.productId || item.id,
                  quantity: item.quantity
                })),
                delivery_address: selectedAddress,
                delivery_phone: userPhone,
                payment_method: 'wallet', // Map Paytm to 'wallet' for backend validation
                special_instructions: specialInstructions.trim() || undefined
              };

              console.log('📝 Creating order with payload:', orderPayload);
              const orderRes = await apiService.createOrder(userPhone, orderPayload);
              
              if (!orderRes.success || !orderRes.data || !orderRes.data.order) {
                 throw new Error(orderRes.message || 'Failed to create order');
              }

              const order = orderRes.data.order;
              const orderId = order.id; // Real UUID from backend
              const amount = order.total_amount || totalAmount;

              console.log('✅ Order created:', orderId);

              // 2. Initiate Payment with Real Order ID
              const data = await apiService.initiatePaytmPayment(userPhone, orderId, amount, user?.id || userPhone);
              
              // Check for success - the backend might return paytmResponse (new) or initiateTransactionResponse (old)
              // The data object from apiService return might be nested in data.data or root depending on wrapper
              // Based on logs: { success: true, data: { paytmResponse: ... } }
              const responseData = data.data || data; 
              const paytmResp = responseData.paytmResponse || responseData.initiateTransactionResponse;
              const token = responseData.txnToken || paytmResp?.body?.txnToken;

              if (data.success && token && paytmResp) {
                const mid = responseData.mid || paytmResp.body.mid || 'xFDrTr50750120794198';
                console.log('Initializing Paytm with MID:', mid);

                // Load Paytm JS Checkout and invoke payment
                const script = document.createElement('script');
                script.src = `https://secure.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${mid}.js`;
                script.async = true;
                script.crossOrigin = "anonymous"; // Added as per docs
                script.onload = () => {
                  console.log('Paytm script loaded. Checking window.Paytm...');
                  
                  // @ts-ignore
                  if (window.Paytm && window.Paytm.CheckoutJS) {
                     // @ts-ignore
                     const checkoutJs = window.Paytm.CheckoutJS;
                     console.log('Hooking into checkoutJs.onLoad...');

                        // Strict adherence to docs: Wrap init in onLoad
                     checkoutJs.onLoad(() => {
                        console.log('Paytm CheckoutJS.onLoad callback fired. Initializing...');
                        const config = {
                          merchant: {
                            mid: mid,
                            name: "Gutzo", // Optional but good for UI
                            redirect: false
                          },
                          flow: "DEFAULT",
                          data: {
                            orderId: order.order_number, // Use GZ... order number to match backend token generation
                            token: token,
                            tokenType: "TXN_TOKEN",
                            amount: String(amount) // Ensure string
                          },
                            handler: {
                            notifyMerchant: function(eventName: string, eventData: any) {
                              console.log('Paytm Event:', eventName, eventData);
                            },
                            transactionStatus: function(paymentStatus: any) {
                              console.log('Payment Status:', paymentStatus);
                              window.Paytm.CheckoutJS.close();
                              
                              // For localhost/verification: Submit data to backend callback to update DB and redirect
                              if (paymentStatus.STATUS === 'TXN_SUCCESS' || paymentStatus.resultInfo?.resultStatus === 'S') {
                                 const form = document.createElement('form');
                                 form.method = 'POST';
                                 form.action = `${apiService.baseUrl}/api/payments/callback`; // Configured callback URL
                                 
                                 // Flatten object and add fields
                                 Object.keys(paymentStatus).forEach(key => {
                                    const value = paymentStatus[key];
                                    if (typeof value === 'object') return; // skip nested mostly
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = key;
                                    input.value = String(value);
                                    form.appendChild(input);
                                 });
                                 
                                 document.body.appendChild(form);
                                 form.submit();
                               } else {
                                 // Handle failure via callback redirect too? Or just toast
                                 // Ideally redirect to retain robust flow
                                 const form = document.createElement('form');
                                 form.method = 'POST';
                                 form.action = `${apiService.baseUrl}/api/payments/callback`;
                                 Object.keys(paymentStatus).forEach(key => {
                                    const value = paymentStatus[key];
                                    if (typeof value === 'object') return;
                                    const input = document.createElement('input');
                                    input.type = 'hidden';
                                    input.name = key;
                                    input.value = String(value);
                                    form.appendChild(input);
                                 });
                                 document.body.appendChild(form);
                                 form.submit();
                              }
                            }
                          }
                        };

                        checkoutJs.init(config).then(() => {
                            console.log('Paytm init successful. Invoking...');
                            checkoutJs.invoke();
                        }).catch((err: any) => {
                            console.error('Paytm init error:', err);
                            toast.error('Paytm initialization error: ' + (err?.message || String(err)));
                        });
                     });
                  } else {
                     console.error('window.Paytm.CheckoutJS not found on script load');

                     toast.error('Payment gateway unavailable');
                  }
                };
                document.body.appendChild(script);
              } else {
                console.error('Paytm initiation failed data:', data);
                if (data.message) toast.error(data.message);
                else toast.error('Failed to initiate payment');
              }
            } catch (error: any) {
              console.error('Payment failed:', error);
              toast.error(error.message || 'Something went wrong');
            } finally {
              setIsProcessing(false);
            }
          }}
          disabled={cartItems.length === 0 || isProcessing || !selectedAddress || loadingFee || !isServiceable}
          className="w-full bg-gradient-to-r from-gutzo-primary to-gutzo-primary-hover text-white font-medium py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </div>
          ) : cartItems.length > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="w-4 h-4" />
              Pay with PayTm - ₹{totalAmount.toFixed(2)}
            </div>
          ) : (
            'Add items to proceed'
          )}
        </Button>
        <p className="text-gray-500 text-center" style={{ fontSize: '11px', marginTop: '2px' }}>
          By proceeding, you agree to our Terms & Conditions
        </p>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        /* MOBILE: Bottom Sheet */
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent
            side="bottom"
            className="p-0 w-full max-w-full left-0 right-0 transition-transform duration-300 ease-in-out"
            style={{ top: '104px', bottom: 0, height: 'calc(100vh - 104px)' }}
          >
             <style>{`
              [data-slot="sheet-content"] > button[class*="absolute"] {
                display: none !important;
              }
            `}</style>
            {panelContent}
          </SheetContent>
        </Sheet>
      ) : (
        /* DESKTOP: Right Panel */
        <div 
          className="fixed top-0 right-0 h-full w-[95%] bg-white shadow-2xl z-[60] transform transition-transform duration-300 product-details-panel"
          style={{ 
            maxWidth: '600px',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          {panelContent}
        </div>
      )}
    </>
  );
}