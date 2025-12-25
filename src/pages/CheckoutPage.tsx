import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../components/Router';
import { nodeApiService as apiService } from '../utils/nodeApi';
import { DistanceService } from '../utils/distanceService';
import { ArrowLeft, Plus, ChevronRight, FileText, Percent, X, ChevronDown, Share, UtensilsCrossed, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { ProfilePanel } from '../components/auth/ProfilePanel';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { LoginPanel } from '../components/auth/LoginPanel';



interface CartItem {
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
    location?: string;
    latitude?: number;
    longitude?: number;
  };
  product: {
    image?: string;
    description?: string;
    category?: string;
  };
}

export function CheckoutPage() {
  const { navigate, goBack } = useRouter();
  const { items, updateQuantityOptimistic, removeItem } = useCart();
  const cartItems = items as unknown as CartItem[];
  

  
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      if (logout) await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleShowProfile = (content: 'profile' | 'orders' | 'address') => {
    setProfilePanelContent(content);
    setShowProfilePanel(true);
  };
   
  
  const [syncedItems, setSyncedItems] = useState<any[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [isServiceable, setIsServiceable] = useState(true);
  const [loadingFee, setLoadingFee] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  
  const [donationAmount, setDonationAmount] = useState(3);
  const [isDonationChecked, setIsDonationChecked] = useState(false);
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [profilePanelContent, setProfilePanelContent] = useState<'profile' | 'orders' | 'address'>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dynamicEta, setDynamicEta] = useState<string | null>(null);

  // Constants
  const ITEMS_GST_RATE = 0.05;
  const FEES_GST_RATE = 0.18;
  const PLATFORM_FEE = 5;

  const vendor = cartItems[0]?.vendor;

  // Initial Sync: Prices
  useEffect(() => {
    window.scrollTo(0, 0);
    async function syncPrices() {
        if (cartItems.length === 0) {
            setSyncedItems([]); 
            return;
        }
        setLoadingPrices(true);
        try {
            const productIds = cartItems.map((item) => item.productId);
            const result = await apiService.getProductsByIds(productIds);
            const products = result.data || [];
            const priceMap: Record<string, number> = {};
            products.forEach((prod: any) => {
              priceMap[prod.id] = prod.price;
            });
            const updated = cartItems.map((item) => ({
              ...item,
              price: priceMap[item.productId] !== undefined ? priceMap[item.productId] : item.price,
            }));
            setSyncedItems(updated);
        } catch (err) {
            setSyncedItems(cartItems);
        } finally {
            setLoadingPrices(false);
        }
    }
    syncPrices();
  }, [cartItems]);

  // Fetch Addresses
  useEffect(() => {
    // Dynamic import to avoid circular dependency issues if any
    if (user?.phone) {
        const phone = user.phone.startsWith('+91') ? user.phone : `+91${user.phone}`;
        import('../utils/addressApi').then(({ AddressApi }) => {
            AddressApi.getUserAddresses(phone).then(res => {
                if (res.success && res.data) {
                    setAddresses(res.data);
                    const defaultAddr = res.data.find((a: any) => a.is_default) || res.data[0];
                    if (defaultAddr) setSelectedAddress(defaultAddr);
                }
            });
        });
    }
  }, [user]);

  // Calculate Delivery Fee
  useEffect(() => {
      async function fetchFee() {
          if (!vendor?.id || !selectedAddress) return;
          
          setLoadingFee(true);
          try {
              let vendorLoc = vendor.location;
              let vendorLat = vendor.latitude;
              let vendorLng = vendor.longitude;

              if (!vendorLat || !vendorLng) {
                  const vRes = await apiService.getVendor(vendor.id);
                  if (vRes.success && vRes.data) {
                      vendorLoc = vRes.data.location;
                      vendorLat = vRes.data.latitude;
                      vendorLng = vRes.data.longitude;
                  }
              }

              const pickup = { 
                  address: vendorLoc || vendor.name || 'Vendor Location', 
                  latitude: vendorLat, 
                  longitude: vendorLng 
              };
              const drop = { 
                  address: selectedAddress.full_address || 'Customer Location', 
                  latitude: selectedAddress.latitude, 
                  longitude: selectedAddress.longitude 
              };
              
              console.log('Serviceability API Request:', { pickup, drop });

              const res = await apiService.getDeliveryServiceability(pickup, drop);
              if (res.success && res.data) {
                   setIsServiceable(res.data.is_serviceable ?? true);
                   setDeliveryFee(res.data.total_amount || 50);
                   
                   // Fetch dynamic ETA
                   const pickupEtaStr = res.data.pickup_eta || res.data.value?.pickup_eta;
                   console.log('Pickup ETA from API:', pickupEtaStr);
                   
                   if (pickupEtaStr && vendorLat && vendorLng && selectedAddress.latitude && selectedAddress.longitude) {
                       try {
                           const travelTimeStr = await DistanceService.getTravelTime(
                               { latitude: vendorLat, longitude: vendorLng },
                               { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
                           );
                           
                           let totalEtaDisplay = pickupEtaStr;
                           if (travelTimeStr) {
                               const pickupMins = DistanceService.parseDurationToMinutes(pickupEtaStr);
                               const travelMins = DistanceService.parseDurationToMinutes(travelTimeStr);
                               
                               if (pickupMins > 0 && travelMins > 0) {
                                   const totalMins = pickupMins + travelMins;
                                   totalEtaDisplay = `${totalMins}-${totalMins + 5} mins`;
                               }
                           }
                           console.log('Setting dynamic ETA:', totalEtaDisplay);
                           setDynamicEta(totalEtaDisplay);
                       } catch (e) {
                           console.error('Failed to calculate ETA:', e);
                           // Fallback to just the pickup ETA if travel time fails
                           console.log('Using pickup ETA as fallback:', pickupEtaStr);
                           setDynamicEta(pickupEtaStr);
                       }
                   } else if (pickupEtaStr) {
                       // If we have pickup ETA but missing coordinates, use it anyway
                       console.log('Using pickup ETA (missing coordinates):', pickupEtaStr);
                       setDynamicEta(pickupEtaStr);
                   }
              } else {
                   setDeliveryFee(50);
              }
          } catch (e) {
              console.error(e);
              setDeliveryFee(50);
          } finally {
              setLoadingFee(false);
          }
      }
      fetchFee();
  }, [selectedAddress, vendor]);

  const displayItems = syncedItems.length > 0 ? syncedItems : cartItems;
  const itemTotal = displayItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const donation = isDonationChecked ? donationAmount : 0;
  const grandTotal = itemTotal + deliveryFee + PLATFORM_FEE + donation;
  const savings = 153; 

  const handleQuantityChange = async (productId: string, newQty: number) => {
    if (newQty <= 0) return removeItem(productId);
    updateQuantityOptimistic(productId, newQty);
  };

  const handlePlaceOrder = async () => {
      if (cartItems.length === 0 || isProcessing || !isServiceable) return;
      
      const userPhone = user?.phone;
      if (!userPhone) {
          setShowLoginPanel(true);
          toast.info("Please login to place your order");
          return;
      }
      if (!selectedAddress) {
        toast.error('Please select a delivery address');
        return;
      }

      setIsProcessing(true);
      try {
        // 1. Create order
        const orderPayload = {
          vendor_id: vendor?.id || cartItems[0].vendorId,
          items: displayItems.map(item => ({
            product_id: item.productId || item.id,
            quantity: item.quantity,
          })),
          delivery_address: selectedAddress,
          delivery_phone: userPhone,
          payment_method: 'wallet', 
          special_instructions: ''
        };

        const orderRes = await apiService.createOrder(userPhone, orderPayload);
        
        if (!orderRes.success || !orderRes.data || !orderRes.data.order) {
           throw new Error(orderRes.message || 'Failed to create order');
        }

        const order = orderRes.data.order;
        const orderId = order.id;
        const amount = order.total_amount || grandTotal;

        // 2. Initiate Payment
        const data = await (apiService as any).initiatePaytmPayment(userPhone, orderId, amount, user?.id || userPhone);
        
        const responseData = data.data || data; 
        const paytmResp = responseData.paytmResponse || responseData.initiateTransactionResponse;
        const token = responseData.txnToken || paytmResp?.body?.txnToken;

        if (data.success && token && paytmResp) {
          const mid = responseData.mid || paytmResp.body.mid || 'xFDrTr50750120794198';
          
          const script = document.createElement('script');
          script.src = `https://securestage.paytmpayments.com/merchantpgpui/checkoutjs/merchants/${mid}.js`;
          script.async = true;
          script.crossOrigin = "anonymous";
          script.onload = () => {
            // @ts-ignore
            if (window.Paytm && window.Paytm.CheckoutJS) {
               // @ts-ignore
               const checkoutJs = window.Paytm.CheckoutJS;
               checkoutJs.onLoad(() => {
                  const config = {
                    merchant: {
                      mid: mid,
                      name: "Gutzo",
                      redirect: false
                    },
                    flow: "DEFAULT",
                    data: {
                      orderId: order.order_number, 
                      token: token,
                      tokenType: "TXN_TOKEN",
                      amount: String(amount)
                    },
                      handler: {
                      notifyMerchant: function(eventName: string, eventData: any) {
                        console.log('Paytm Event:', eventName, eventData);
                      },
                      transactionStatus: function(paymentStatus: any) {
                        // @ts-ignore
                        window.Paytm.CheckoutJS.close();
                        
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = 'http://localhost:3001/api/payments/callback'; 
                        
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
                  };
                  checkoutJs.init(config).then(() => {
                      checkoutJs.invoke();
                  }).catch((err: any) => {
                      console.error('Paytm Init Error:', err);
                      setIsProcessing(false);
                      toast.error('Payment initialization failed');
                  });
               });
            } else {
                setIsProcessing(false);
                toast.error('Payment gateway failed to load');
            }
          };
          script.onerror = () => {
             setIsProcessing(false);
             toast.error('Network error loading payment gateway');
          };
          document.body.appendChild(script);
        } else {
             throw new Error('Invalid payment initiation response');
        }

      } catch (error: any) {
        console.error('Order Placement Error:', error);
        toast.error(error.message || 'Failed to place order');
        setIsProcessing(false);
      }
  };

  if (cartItems.length === 0) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Your cart is empty</h2>
            <Button onClick={() => navigate('/')} className="bg-gutzo-brand text-white">Browse Restaurants</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] pb-32 lg:pb-8">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header 
          onLogout={handleLogout}
          onShowProfile={handleShowProfile}
          onShowAddressList={() => handleShowProfile('address')}
          onShowLogin={() => setShowLoginPanel(true)} // Open login panel instead of redirect
          onShowCart={() => {}} // No-op for now on standalone checkout
          hideInteractive={false}
          hideSearchLocation={true}
          hideCart={true}
        />
      </div>

      {/* Mobile Header */}
      <div className="bg-white sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center px-4 !py-4 justify-between min-h-[64px]">
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <button onClick={goBack} className="p-1 -ml-1 flex-shrink-0">
                    <ArrowLeft className="w-6 h-6 text-gray-800" />
                </button>
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                    <div className="text-[17px] font-extrabold text-gray-600 leading-tight mb-2 truncate">
                        {vendor?.name || 'Restaurant'}
                    </div>
                    
                    {/* Address Selection in Header */}
                    <div onClick={() => {
                      console.log('Address dropdown clicked');
                      setShowProfilePanel(true);
                      setProfilePanelContent('address');
                    }} className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer leading-none group lg:hidden">
                        <span className="text-sm text-gray-600 truncate max-w-[280px]">
                           <span className="font-medium text-gray-900">{dynamicEta || '30-35 mins'} to home</span>
                           <span className="mx-1 text-gray-400">|</span>
                           {selectedAddress ? selectedAddress.full_address : 'Select address'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                    </div>
                </div>
            </div>
            
            <button className="p-2 -mr-2 flex-shrink-0 lg:hidden">
                <Share className="w-5 h-5 text-gray-700" />
            </button>
        </div>
      </div>
      </div>





      <div className="p-3 space-y-3 max-w-7xl mx-auto flex flex-col lg:flex-row lg:gap-10 lg:items-start lg:px-8 lg:space-y-0">
      



        {/* Items List Column */}
        <div className="flex-1 w-full space-y-4">
            {/* Desktop Page Title (Inside Column) */}
            <div className="hidden lg:block pb-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{vendor?.name || 'Restaurant'}</h1>
                {vendor?.location && <p className="text-gray-500 text-base mt-1">{vendor.location}</p>}
            </div>

            {/* Desktop Address Card (Inside Left Column) */}
            <div className="hidden lg:block mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                       <div className="p-3 bg-gray-50 rounded-full">
                           <MapPin className="w-6 h-6 text-gray-700" />
                       </div>
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                               <h3 className="font-bold text-lg text-gray-900">Delivery to {selectedAddress?.address_type || 'Home'}</h3>
                               <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                   {dynamicEta || '30-35 mins'}
                               </span>
                           </div>
                           <p className="text-gray-500 text-sm max-w-2xl truncate">
                               {selectedAddress ? selectedAddress.full_address : 'Select a delivery address to proceed'}
                           </p>
                       </div>
                   </div>
                   <button 
                       onClick={() => {
                           setShowProfilePanel(true);
                           setProfilePanelContent('address');
                       }}
                       className="text-[#1BA672] font-bold text-sm hover:underline hover:text-[#14885E] transition-colors"
                   >
                       CHANGE
                   </button>
                </div>
            </div>

             <h2 className="text-xl font-bold text-gray-800 hidden lg:block">Order Summary</h2>
             <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            {displayItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-start py-0">

                   
                   <div className="flex-1">
                       <div className="flex justify-between items-start">
                           <div className="pr-2">
                               <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{item.name}</h3>


                           </div>
                           <div className="flex flex-col items-end gap-1 flex-shrink-0">
                               <div 
                                 className="flex items-center justify-between px-2 rounded-lg shadow-sm"
                                 style={{ width: '84px', height: '32px', backgroundColor: '#E8F6F1', border: '1px solid #1BA672' }}
                               >
                                   <button 
                                     onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                     className="font-medium text-xl leading-none pb-1 hover:scale-110 transition-transform"
                                     style={{ color: '#1BA672' }}
                                   >−</button>
                                   <span className="text-[15px] font-semibold text-gray-900 leading-none pt-0.5">{item.quantity}</span>
                                   <button 
                                     onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                     className="font-medium text-xl leading-none pb-1 hover:scale-110 transition-transform"
                                     style={{ color: '#1BA672' }}
                                   >+</button>
                               </div>
                               <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-xs font-semibold" style={{ color: '#9CA3AF', textDecoration: 'line-through' }}>₹{(item.price * item.quantity * 1.2).toFixed(0)}</span>
                                    <span className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
            ))}
            
            <div>
                 <button 
                   onClick={() => navigate(`/vendor/${vendor?.id}`)} 
                   className="font-medium text-sm flex items-center gap-2 hover:bg-green-50 px-2 py-1 rounded transition-colors -ml-2"
                   style={{ color: '#1ba672' }}
                 >
                     <Plus className="w-4 h-4" /> Add more items
                 </button>
            </div>
            
            <div className="flex gap-3 pt-1 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden">
                 <Button variant="outline" className="text-xs h-9 px-3 whitespace-nowrap border-gray-200 rounded-xl gap-2 text-gray-600 font-normal hover:border-gray-300 bg-white">
                    <FileText className="w-4 h-4 text-gray-400" /> Add a note for {vendor?.name}
                 </Button>
                 <Button variant="outline" className="text-xs h-9 px-3 whitespace-nowrap border-gray-200 rounded-xl gap-2 text-gray-600 font-normal hover:border-gray-300 bg-white">
                    <UtensilsCrossed className="w-4 h-4 text-gray-400" /> Don't add cutlery
                 </Button>
            </div>
             </div>
        </div>



        {/* Desktop Sidebar (Details + Cancellation + Pay Button) */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-4 lg:sticky lg:top-28 h-fit">
            <h2 className="text-xl font-bold text-gray-800 hidden lg:block">Payment Details</h2>
            {/* Consolidated Details Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm divide-y divide-gray-100/50">
                {/* Delivery Time */}
                <div className="flex gap-4 pb-4">
                    <div className="mt-0.5">
                        <Clock className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-[15px]">Delivery in {dynamicEta || '30-35 mins'}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 border-b border-gray-300 border-dotted inline-block">Want this later? Schedule it</p>
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="flex gap-4 pt-4">
                    <div className="mt-0.5">
                        <FileText className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                 <span className="font-bold text-gray-900 text-[15px]">Total Bill</span>
                                 <span className="text-sm text-gray-400 line-through">₹{(grandTotal + savings).toFixed(2)}</span>
                                 <span className="font-bold text-gray-900 text-[15px]">₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="mt-1.5">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[11px] font-bold">
                                You saved ₹{savings}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Incl. taxes and charges</p>
                    </div>
                </div>
            </div>

            {/* Desktop Pay Button */}
            <div className="hidden lg:block">
                 <button 
                   className={`w-full text-white rounded-lg px-4 py-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform relative overflow-hidden group ${
                      isProcessing || !isServiceable ? 'cursor-not-allowed' : ''
                   }`}
                   style={{ backgroundColor: '#1BA672' }}
                   onClick={handlePlaceOrder}
                   disabled={isProcessing || !isServiceable}
                 >
                     {isProcessing ? (
                         <div className="flex items-center gap-2">
                             <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                             <span className="text-lg font-bold">Processing...</span>
                         </div>
                     ) : (
                         <div className="flex items-center gap-2">
                             <span className="text-lg font-semibold">Proceed to Pay</span>
                              <span className="text-xl">→</span>
                         </div>
                     )}
                 </button>
                 <p className="text-center text-xs text-gray-400 mt-2 font-medium">100% Secure Payments</p>
            </div>

            {/* Cancellation Policy */}
            <div className="px-2 pb-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">CANCELLATION POLICY</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                    Orders cannot be cancelled once placed. No refunds will be provided. Please review your order carefully before confirming.
                </p>
            </div>
        </div>

      </div>



      {/* Fixed Footer (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-50 rounded-t-2xl lg:hidden">

           <div className="px-4 py-3">
                <button 
                  className={`w-full text-white rounded-lg px-4 py-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform relative overflow-hidden group ${
                     isProcessing || !isServiceable ? 'cursor-not-allowed' : ''
                  }`}
                  style={{ backgroundColor: '#1BA672' }}
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !isServiceable}
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            <span className="text-lg font-bold">Processing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                             <span className="text-lg font-semibold">Proceed to Pay</span>
                             <span className="text-xl">→</span>
                        </div>
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2 font-medium">100% Secure Payments</p>
           </div>
      </div>

      {/* ProfilePanel for Address Selection */}
      <ProfilePanel 
        isOpen={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
        onLogout={() => {}}
        content={profilePanelContent}
      />
      
      <LoginPanel 
        isOpen={showLoginPanel} 
        onClose={() => setShowLoginPanel(false)}
        onAuthComplete={() => setShowLoginPanel(false)}
      />
    </div>
  );
}

// Render ProfilePanel for address selection
function CheckoutWithAddressPanel() {
  return (
    <>
      <CheckoutPage />
    </>
  );
}


