import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../components/Router';
import { useLocation as useUserLocation } from '../contexts/LocationContext';
import { nodeApiService as apiService } from '../utils/nodeApi';
import { DistanceService } from '../utils/distanceService';
import { ArrowLeft, Plus, ChevronRight, FileText, Percent, X, ChevronDown, Share, UtensilsCrossed, Clock, MapPin, Phone, Calendar, Utensils } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { format } from 'date-fns';
import { ProfilePanel } from '../components/auth/ProfilePanel';
import { Header } from '../components/Header';
import { toast } from 'sonner';
import { LoginPanel } from '../components/auth/LoginPanel';
import { AddressModal } from '../components/auth/AddressModal';
import { LocationBottomSheet } from '../components/LocationBottomSheet';
import { OrderNote } from '../components/OrderNote';



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
        allow_notes?: boolean; // Controls visibility of "Add Note"
    };
    product: {
        image?: string;
        description?: string;
        category?: string;
    };
    metadata?: any;
}

export function CheckoutPage() {
    const { navigate, goBack } = useRouter();
    const { items, updateQuantityOptimistic, removeItem, isLoading, isReplaceModalOpen } = useCart();
    const cartItems = items as unknown as CartItem[];
    const { location: userLocation, locationDisplay, locationLabel } = useUserLocation();



    const { user, login, logout } = useAuth();

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
        if (content === 'address') {
            setShowLocationSheet(true);
            return;
        }
        setProfilePanelContent(content);
        setShowProfilePanel(true);
    };


    const [syncedItems, setSyncedItems] = useState<any[]>([]);
    const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [isServiceable, setIsServiceable] = useState(true);
    const [loadingFee, setLoadingFee] = useState(true); // Default to true to prevent "Success" flash
    const [loadingPrices, setLoadingPrices] = useState(false);

    const [donationAmount, setDonationAmount] = useState(3);
    const [isDonationChecked, setIsDonationChecked] = useState(false);

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [showAddressSheet, setShowAddressSheet] = useState(false);
    const [showLocationSheet, setShowLocationSheet] = useState(false); // Added for New Sheet
    const [addressRefreshTrigger, setAddressRefreshTrigger] = useState(0);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [showLoginPanel, setShowLoginPanel] = useState(false);
    const [profilePanelContent, setProfilePanelContent] = useState<'profile' | 'orders' | 'address'>('address');
    const [showSaveAddressModal, setShowSaveAddressModal] = useState(false);
    const [addressToSave, setAddressToSave] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('Processing...');
    const [dynamicEta, setDynamicEta] = useState<string | null>(null);
    // const [showNoteSheet, setShowNoteSheet] = useState(false); // Managed internally by OrderNote
    const [orderNote, setOrderNote] = useState("");
    const [dontAddCutlery, setDontAddCutlery] = useState(false);
    const [expandedBill, setExpandedBill] = useState(false);
    const [useMockPayment, setUseMockPayment] = useState(false);
    const [useMockShadowfax, setUseMockShadowfax] = useState(true);

    // Constants
    const ITEMS_GST_RATE = 0.05;
    const FEES_GST_RATE = 0.18;
    const PLATFORM_FEE = 10;

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

    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // Fetch Addresses
    const fetchAddresses = () => {
        if (user?.phone) {
            setLoadingAddresses(true);
            const phone = user.phone.startsWith('+91') ? user.phone : `+91${user.phone}`;
            import('../utils/addressApi').then(({ AddressApi }) => {
                AddressApi.getUserAddresses(phone).then(res => {
                    if (res.success && res.data && res.data.length > 0) {
                        setAddresses(res.data);

                        let matchedAddress = null;

                        if (userLocation && userLocation.coordinates) {
                            const { latitude: ctxLat, longitude: ctxLng } = userLocation.coordinates;
                            matchedAddress = res.data.find((addr: any) => {
                                const latDiff = Math.abs((addr.latitude || 0) - ctxLat);
                                const lngDiff = Math.abs((addr.longitude || 0) - ctxLng);
                                return latDiff < 0.0001 && lngDiff < 0.0001;
                            });

                            if (matchedAddress) {
                                // console.log('📍 Synced Address with Header Selection:', matchedAddress.label || matchedAddress.type);
                            } else {
                                // console.log('📍 Using Global Context Location (Transient)');
                                matchedAddress = {
                                    id: 'device_location',
                                    type: locationLabel || locationDisplay,
                                    full_address: locationDisplay,
                                    street: '',
                                    area: '',
                                    latitude: ctxLat,
                                    longitude: ctxLng,
                                    is_default: false,
                                    label: locationLabel || locationDisplay,
                                    address_type: locationLabel || locationDisplay
                                };
                            }
                        }

                        if (!matchedAddress) {
                            matchedAddress = res.data.find((a: any) => a.is_default);
                        }

                        if (!matchedAddress) {
                            matchedAddress = res.data[0];
                        }

                        if (matchedAddress) {
                            setSelectedAddress(matchedAddress);
                        }
                    } else if (res.success && (!res.data || res.data.length === 0)) {
                        if (userLocation && userLocation.coordinates) {
                            const fallbackAddress = {
                                id: 'device_location',
                                type: locationLabel || locationDisplay || 'Current Location',
                                full_address: locationDisplay || 'Detected Location',
                                street: '',
                                area: '',
                                latitude: userLocation.coordinates.latitude,
                                longitude: userLocation.coordinates.longitude,
                                is_default: false,
                                label: locationLabel || locationDisplay || 'Current Location',
                                address_type: locationLabel || locationDisplay || 'Current Location'
                            };
                            setSelectedAddress(fallbackAddress);
                        }
                    }
                }).finally(() => {
                    setLoadingAddresses(false);
                });
            });
        } else if (userLocation && userLocation.coordinates) {
            // Guest user logic
            const fallbackAddress = {
                id: 'device_location',
                type: locationLabel || locationDisplay || 'Current Location',
                full_address: locationDisplay || 'Detected Location',
                street: '',
                area: '',
                latitude: userLocation.coordinates.latitude,
                longitude: userLocation.coordinates.longitude,
                is_default: false,
                label: locationLabel || locationDisplay || 'Current Location',
                address_type: locationLabel || locationDisplay || 'Current Location'
            };
            setSelectedAddress(fallbackAddress);
            setAddresses([]);
            setLoadingAddresses(false);
        } else {
            // Nothing found yet
            setLoadingAddresses(false);
        }
    };

    // Initial Fetch & Sync
    useEffect(() => {
        fetchAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.phone, user?.id, userLocation?.coordinates?.latitude, userLocation?.coordinates?.longitude, locationDisplay]);

    // Calculate Delivery Fee
    useEffect(() => {
        async function fetchFee() {
            // If we don't have necessary data yet, keep loading or stop if we know we won't get it?
            // But actually, we want to show loading UNTIL we have verified serviceability.
            // If selectedAddress is missing because it's loading, keep loadingFee true.
            // If selectedAddress is missing because there are none, we should probably stop loading and show empty/error?
            // For now, let's ensure we don't return early without managing state if we can avoid it.
            // But fetchAddresses is async.

            if (!vendor?.id) {
                setLoadingFee(false);
                return;
            }
            if (!selectedAddress) {
                // Stop loading if no address is selected so the UI can prompt the user
                setLoadingFee(false);
                return;
            }

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
                    address: vendorLoc || vendor.name,
                    latitude: vendorLat,
                    longitude: vendorLng
                };
                const drop = {
                    address: selectedAddress.full_address,
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude
                };

                // console.log('Serviceability API Request:', { pickup, drop });

                const res = await apiService.getDeliveryServiceability(pickup, drop);
                if (res.success && res.data) {
                    // Check serviceability explicitly matching VendorDetailsPage logic
                    const serviceable = res.data.is_serviceable !== undefined ? res.data.is_serviceable : (res.data.value?.is_serviceable ?? true);
                    setIsServiceable(true);

                    if (serviceable) {
                        setDeliveryFee(res.data.total_amount || 100);

                        // Fetch dynamic ETA
                        const pickupEtaStr = res.data.pickup_eta || res.data.value?.pickup_eta;

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
                                setDynamicEta(totalEtaDisplay);
                            } catch (e) {
                                console.error('Failed to calculate ETA:', e);
                                setDynamicEta(pickupEtaStr);
                            }
                        } else if (pickupEtaStr) {
                            setDynamicEta(pickupEtaStr);
                        }
                    } else {
                        // Not serviceable
                        setDeliveryFee(0);
                        setDynamicEta(null);
                    }
                } else {
                    setDeliveryFee(100);
                }
            } catch (e) {
                console.error(e);
                setDeliveryFee(100);
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
    const savings = Math.round(grandTotal * 0.15);

    const handleQuantityChange = async (productId: string, newQty: number) => {
        if (newQty <= 0) return removeItem(productId);
        updateQuantityOptimistic(productId, newQty);
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0 || isProcessing) return;

        const userPhone = user?.phone;
        if (!userPhone) {
            setShowLoginPanel(true);
            toast.info("Please login to place your order");
            return;
        }

        if (!isServiceable) {
            toast.error("Location not serviceable");
            return;
        }
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        setIsProcessing(true);
        setProcessingMessage('Creating order...');
        try {
            // 1. Create order
            const isSubscription = displayItems.some(item => item.metadata?.subscription);

            const orderPayload = {
                vendor_id: vendor?.id || cartItems[0].vendorId,
                items: displayItems.map(item => ({
                    product_id: item.productId || item.id,
                    quantity: item.quantity,
                })),
                delivery_address: selectedAddress,
                delivery_phone: userPhone,
                payment_method: 'wallet',
                special_instructions: `${orderNote || ''}${useMockShadowfax ? ' [MOCK_SFX]' : ''}`.trim() || undefined,
                mock_shadowfax: useMockShadowfax,
                order_source: isSubscription ? 'subscription' : 'app',
                // Send dynamic fees
                delivery_fee: deliveryFee,
                platform_fee: PLATFORM_FEE,
                taxes: 0,
                discount_amount: 0,
                tip_amount: isDonationChecked ? donationAmount : 0
            };

            const orderRes = await apiService.createOrder(userPhone, orderPayload);

            if (!orderRes.success || !orderRes.data || !orderRes.data.order) {
                throw new Error(orderRes.message || 'Failed to create order');
            }

            const order = orderRes.data.order;
            const orderId = order.id;
            const amount = order.total_amount || grandTotal;

            // 2. Initiate Payment
            setProcessingMessage('Initiating secure payment...');
            if (useMockPayment) {
                // Mock Payment Flow
                const mockRes = await (apiService as any).mockSuccessPayment(userPhone, order.order_number, useMockShadowfax);
                if (mockRes.success) {
                    navigate(`/payment-status?orderId=${order.order_number}` as any);
                    toast.success('Mock Payment Successful');
                } else {
                    throw new Error("Mock payment failed");
                }
            } else {
                // Real Payment Flow
                const data = await (apiService as any).initiatePaytmPayment(userPhone, orderId, amount, user?.id || userPhone);
                console.log('[Frontend] Initiate Payment Response:', data);

                const responseData = data.data || data;
                const paytmResp = responseData.paytmResponse || responseData.initiateTransactionResponse;
                const token = responseData.txnToken || paytmResp?.body?.txnToken;

                if (data.success && token && paytmResp) {
                    const mid = responseData.mid || paytmResp.body.mid;
                    const PAYTM_ENV = import.meta.env.VITE_PAYTM_ENV;
                    const PAYTM_BASE_URL = PAYTM_ENV === 'production'
                        ? 'https://secure.paytmpayments.com'
                        : 'https://securestage.paytmpayments.com';

                    setProcessingMessage('Loading payment gateway...');
                    const script = document.createElement('script');
                    script.src = `${PAYTM_BASE_URL}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
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
                                        notifyMerchant: function (eventName: string, eventData: any) {
                                            if (eventName === 'APP_CLOSED') {
                                                setIsProcessing(false);
                                            }
                                        },
                                        transactionStatus: function (paymentStatus: any) {
                                            // @ts-ignore
                                            window.Paytm.CheckoutJS.close();

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
                    script.appendChild(document.createTextNode(''));
                    document.body.appendChild(script);
                } else {
                    throw new Error('Invalid payment initiation response');
                }
            }

        } catch (error: any) {
            console.error('Order Placement Error:', error);
            toast.error(error.message || 'Failed to place order');
            setIsProcessing(false);
        }
    };

    const handleShare = async () => {
        if (!vendor) return;

        const shareData = {
            title: vendor.name,
            text: `Check out ${vendor.name} on Gutzo!`,
            url: `${window.location.origin}/vendor/${vendor.id}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or share failed, ignore
                console.log('Share cancelled');
            }
        } else {
            // Fallback
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast.success('Link copied to clipboard!');
            } catch (err) {
                toast.error('Failed to copy link');
            }
        }
    };

    // Redirect if cart is empty
    /*
    useEffect(() => {
      // Grace period for state hydration or replace modal
      const timer = setTimeout(() => {
         // Only redirect if:
         // 1. Cart is truly empty
         // 2. Not loading initial state
         // 3. Not waiting on a Replace Cart decision
         if (cartItems.length === 0 && !isLoading && !isReplaceModalOpen) {
             const state = window.history.state;
             if (state && state.from === 'vendor_details') {
                 goBack();
             } else {
                 navigate('/');
             }
         }
      }, 600);
      
      return () => clearTimeout(timer);
    }, [cartItems.length, isLoading, isReplaceModalOpen, goBack, navigate]);
    */

    // Force unlock scroll on mount with aggressive reset (fix for lingering modal locks)
    useEffect(() => {
        const unlock = () => {
            // Reset HTML
            document.documentElement.style.overflow = '';
            document.documentElement.style.paddingRight = '';
            document.documentElement.classList.remove('overflow-hidden');

            // Reset Body
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.classList.remove('overflow-hidden');

            // Allow pointer events
            document.body.style.pointerEvents = 'auto';
        };

        // Run immediately
        unlock();

        // And run again after a delay to override any slow cleanup from previous page
        const timer = setTimeout(unlock, 300);

        return () => clearTimeout(timer);
    }, []);

    // NEW: Auto-redirect on empty cart for Mobile/Tablet (<1024px)
    useEffect(() => {
        if (cartItems.length === 0 && !isLoading && !isReplaceModalOpen) {
            // Check viewport width - if mobile/tablet (<1024px), go back
            if (window.innerWidth < 1024) {
                console.log('📱 Mobile/Tablet Empty Cart - Redirecting back...');
                goBack();
            }
        }
    }, [cartItems.length, isLoading, isReplaceModalOpen, navigate, goBack]);

    if (cartItems.length === 0 && !isLoading && !isReplaceModalOpen) {
        console.log('🛒 DEBUG: Cart is empty (checkout render)', { items: cartItems, isLoading, isReplaceModalOpen });
        // Show explicit empty state
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                <p className="text-gray-500 text-center mb-6 max-w-xs">
                    Looks like you haven't added any meal plans yet.
                </p>
                <Button
                    onClick={() => navigate('/')}
                    className="bg-gutzo-primary hover:bg-gutzo-primary-hover text-white rounded-xl px-8 py-6 h-auto text-base font-semibold shadow-lg shadow-green-200 w-full max-w-xs"
                >
                    Find a Meal Plan
                </Button>
            </div>
        );
    }

    const isSubscription = cartItems.some(item => item.metadata?.planType);
    console.log('🛒 Checkout Debug:', { cartItems, isSubscription });

    return (
        <div className="min-h-screen bg-gray-50 pb-64 lg:pb-0 relative overflow-x-hidden">
            {/* Desktop Header */}
            <div className="hidden lg:block">
                <Header
                    onLogout={handleLogout}
                    onShowProfile={handleShowProfile}
                    onShowAddressList={() => handleShowProfile('address')}
                    onShowLogin={() => setShowLoginPanel(true)} // Open login panel instead of redirect
                    onShowCart={() => { }} // No-op for now on standalone checkout
                    hideInteractive={false}
                    hideSearchLocation={true}
                    hideCart={true}
                />
            </div>

            {/* Mobile Header */}
            <div
                className="bg-white sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.05)] lg:hidden"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex items-center px-4 py-3 justify-between min-h-[56px]">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <button onClick={goBack} className="p-1 -ml-1 flex-shrink-0">
                                <ArrowLeft className="w-6 h-6 text-gray-800" />
                            </button>
                            <div className="flex-1 flex flex-col justify-center overflow-hidden">
                                <div className="text-[17px] font-extrabold text-gray-600 leading-tight truncate">
                                    {vendor?.name}
                                </div>

                                {/* Address Selection in Header */}
                                <div onClick={() => {
                                    setShowLocationSheet(true);
                                }} className="flex items-center gap-1 flex-1 min-w-0 cursor-pointer leading-none group lg:hidden mt-0.5">
                                    <span className="text-sm text-gray-600 truncate max-w-[280px]">
                                        <span className={`font-medium ${!isServiceable ? 'text-red-500' : 'text-gray-900'}`}>
                                            {!isServiceable ? (
                                                <>
                                                    Not Serviceable <span className="text-gray-400 mx-1">•</span> <span className="text-gray-500 font-normal">{
                                                        !user ? 'Current Location' : (selectedAddress?.address_line1 || selectedAddress?.full_address || selectedAddress?.label || 'Location')
                                                    }</span>
                                                </>
                                            ) : (
                                                <>
                                                    {dynamicEta} to {
                                                        !user
                                                            ? 'Current Location'
                                                            : (() => {
                                                                if (!selectedAddress) return '';
                                                                // Priority: Street + Area + City (Most precise)
                                                                // Fallback: Full Address (Google)

                                                                // Check for correct fields based on UserAddress type (street, area)
                                                                const preciseParts = [
                                                                    (selectedAddress as any).street || (selectedAddress as any).address_line1,
                                                                    (selectedAddress as any).area || (selectedAddress as any).address_line2,
                                                                    selectedAddress.city
                                                                ].filter(p => p && p.trim().length > 0);

                                                                if (preciseParts.length >= 2) {
                                                                    return preciseParts.join(', ');
                                                                }

                                                                return (selectedAddress as any).full_address ||
                                                                    (selectedAddress as any).formatted_address ||
                                                                    selectedAddress.label ||
                                                                    selectedAddress.type ||
                                                                    'Location';
                                                            })()
                                                    }
                                                </>
                                            )}
                                        </span>
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleShare}
                            className="p-2 -mr-2 flex-shrink-0 lg:hidden text-gray-700 active:scale-95 transition-transform"
                        >
                            <Share className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>





            <div className="p-3 space-y-3 max-w-7xl mx-auto flex flex-col lg:flex-row lg:gap-10 lg:items-start lg:px-8 lg:space-y-0">




                {/* Items List Column */}
                <div className="flex-1 w-full space-y-4">
                    {/* Desktop Page Title (Inside Column) */}
                    <div className="hidden lg:block pb-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{vendor?.name}</h1>
                        {vendor?.location && <p className="text-gray-500 text-base mt-1">{vendor.location}</p>}
                    </div>

                    {/* Address Card (Visible on ALL screens now -> Hidden on Mobile, Visible on Desktop) */}
                    <div className="hidden lg:block mb-4 lg:mb-6">
                        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="p-3 bg-gray-50 rounded-full flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-gray-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-gray-900">Delivery to {selectedAddress?.address_type || 'Home'}</h3>
                                        {dynamicEta && (
                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                                {dynamicEta}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm max-w-2xl truncate">
                                        {selectedAddress ? selectedAddress.full_address : 'Select a delivery address to proceed'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center flex-shrink-0 ml-4">
                                <button
                                    onClick={() => {
                                        setShowProfilePanel(true);
                                        setProfilePanelContent('address');
                                    }}
                                    className="text-[#1BA672] font-bold text-sm hover:underline hover:text-[#14885E] transition-colors"
                                >
                                    CHANGE
                                </button>
                                {selectedAddress?.id === 'device_location' && (
                                    <button
                                        onClick={() => {
                                            // Create a clean address object for pre-filling, removing the transient ID
                                            const { id, ...addr } = selectedAddress;
                                            setAddressToSave(addr);
                                            setShowSaveAddressModal(true);
                                        }}
                                        className="ml-4 text-orange-600 font-bold text-sm hover:underline hover:text-orange-700 transition-colors"
                                    >
                                        SAVE
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 hidden lg:block">Order Summary</h2>
                    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                        {displayItems.map((item) => {
                            // Subscription Detection
                            const subscription = item.metadata?.subscription;

                            // --- SPECIAL UI FOR SUBSCRIPTIONS ---
                            if (subscription) {
                                const isTrial = subscription.planType?.toLowerCase().includes('trial');

                                return (
                                    <div key={item.id} className={`bg-white rounded-2xl border ${isTrial ? 'border-orange-100' : 'border-green-100'} shadow-[0_4px_20px_rgba(0,0,0,0.06)] mb-5 relative overflow-hidden transition-all hover:shadow-lg group`}>
                                        <div className="p-5">
                                            {/* Premium Badge (Static to ensure visibility) */}
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm border ${isTrial
                                                    ? 'bg-orange-100 text-orange-700 border-orange-200'
                                                    : 'bg-green-100 text-green-700 border-green-200'
                                                    }`}>
                                                    {subscription.planType || 'Subscription'}
                                                </span>
                                            </div>

                                            {/* Title & Meta */}
                                            <div className="mb-5 relative">
                                                <h3 className="font-extrabold text-gray-900 text-[18px] leading-snug font-primary">
                                                    {item.name}
                                                </h3>
                                                {!isTrial && (
                                                    <p className="text-green-600 text-xs mt-1.5 font-semibold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        Auto-renewing weekly plan
                                                    </p>
                                                )}
                                            </div>

                                            {/* Rich Data Grid */}
                                            <div className="space-y-4 bg-gray-50/50 rounded-xl p-4 border border-gray-100/50">
                                                {/* Row 1: Dates */}
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-10 h-10 min-w-[2.5rem] rounded-full bg-white border flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 ${isTrial ? 'border-orange-100 text-orange-600' : 'border-green-100 text-[#1BA672]'
                                                        }`}>
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Start Date</p>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[15px] font-bold text-gray-900 leading-tight">
                                                                {format(new Date(subscription.startDate), 'EEE, d MMM')}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                                {subscription.days === 'Mon - Sat' ? '6 Days/Week' : 'Custom Days'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">{subscription.days}</p>
                                                    </div>
                                                </div>

                                                {/* Row 2: Meals */}
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm text-orange-500 mt-0.5">
                                                        <Utensils className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1">Included Meals</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(Array.isArray(subscription.meals) ? subscription.meals : [subscription.meals]).map((meal: string, idx: number) => (
                                                                <span key={idx} className="text-[13px] font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">
                                                                    {meal}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer: Price & Quantity */}
                                            <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[16px] text-gray-400 font-bold" style={{ textDecoration: 'line-through', textDecorationColor: '#6B7280', textDecorationThickness: '2px' }}>₹{(item.price * item.quantity * 1.2).toFixed(0)}</span>
                                                    <span className="text-[18px] font-extrabold text-[#1BA672]">
                                                        ₹{(item.price * item.quantity).toFixed(0)}
                                                        <span className="text-gray-400 text-[11px] font-semibold ml-1">/ plan</span>
                                                    </span>
                                                </div>

                                                {/* Quantity Control Pill */}
                                                <div className="flex items-center justify-between px-1 bg-white border border-gray-200 rounded-lg shadow-sm h-[44px] min-w-[120px]">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                        className="w-12 h-full flex items-center justify-center text-2xl transition-colors pb-1 text-[#1BA672] hover:text-green-700 font-bold"
                                                    >−</button>
                                                    <span className="text-[16px] font-bold text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                        className="w-12 h-full flex items-center justify-center text-[#1BA672] hover:text-green-700 text-2xl transition-colors pb-1"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // --- STANDARD LIST UI (Existing) ---
                            return (
                                <div key={item.id} className="flex justify-between items-start py-4 border-b border-gray-100 last:border-0 last:pb-0 mb-2 last:mb-0">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <h3 className="font-bold text-gray-900 text-[15px] leading-tight flex items-center gap-2">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1 leading-relaxed line-clamp-2">{item.product?.description}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        {/* Stepper */}
                                        <div className="flex items-center justify-between px-1 bg-white border border-gray-200 rounded-lg shadow-sm h-[44px] min-w-[120px]">
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                className="w-12 h-full flex items-center justify-center text-2xl transition-colors pb-1 text-[#1BA672] hover:text-green-700 font-bold"
                                            >−</button>
                                            <span className="text-[16px] font-bold text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                className="w-12 h-full flex items-center justify-center text-[#1BA672] hover:text-green-700 text-2xl transition-colors pb-1"
                                            >+</button>
                                        </div>
                                        {/* Price */}
                                        <div className="flex justify-end items-center gap-1 mt-1">
                                            <span className="text-xs font-semibold" style={{ color: '#9CA3AF', textDecoration: 'line-through' }}>₹{(item.price * item.quantity * 1.2).toFixed(0)}</span>
                                            <span className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Only show 'Add more items' if NOT a subscription cart (to prevent logic conflicts) */}
                        {!cartItems.some(item => item.metadata?.subscription) && (
                            <div>
                                <button
                                    onClick={() => navigate(`/vendor/${vendor?.id}`)}
                                    className="font-medium text-sm flex items-center gap-2 hover:bg-green-50 px-2 py-1 rounded transition-colors -ml-2"
                                    style={{ color: '#1ba672' }}
                                >
                                    <Plus className="w-4 h-4" /> Add more items
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 pt-1 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden items-start">
                            {/* Show "Add Note" button ONLY if vendor allows notes AND no note exists */}
                            {vendor?.allow_notes !== false && !orderNote && (
                                <OrderNote
                                    note={orderNote}
                                    onSave={setOrderNote}
                                    vendorName={vendor?.name}
                                />
                            )}

                            <Button
                                variant="outline"
                                onClick={() => setDontAddCutlery(!dontAddCutlery)}
                                className="text-xs h-9 px-3 whitespace-nowrap rounded-xl gap-2 font-normal transition-colors"
                                style={{
                                    backgroundColor: dontAddCutlery ? '#E8F6F1' : 'white',
                                    borderColor: dontAddCutlery ? '#1BA672' : '#E5E7EB', // E5E7EB is gray-200
                                    color: '#4B5563', // Always gray-600
                                }}
                            >
                                <UtensilsCrossed
                                    className="w-4 h-4"
                                    style={{ color: '#9CA3AF' }} // Always gray-400
                                />
                                Don't add cutlery
                            </Button>
                        </div>

                        {/* If note exists, show it BELOW the buttons */}
                        {orderNote && (
                            <div className="pt-3">
                                <OrderNote
                                    note={orderNote}
                                    onSave={setOrderNote}
                                    vendorName={vendor?.name}
                                />
                            </div>
                        )}
                    </div>
                </div>



                {/* Desktop Sidebar (Details + Cancellation + Pay Button) */}
                <div className="w-full lg:w-[400px] shrink-0 space-y-4 lg:sticky lg:top-28 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 hidden lg:block">Payment Details</h2>
                    {/* Consolidated Details Card */}
                    <div className="bg-white rounded-xl p-4 shadow-sm divide-y divide-gray-100/50">
                        {/* Delivery Time */}
                        {/* Delivery Time - Commented out as per user request (Redundant with header)
                <div className="flex gap-4 pb-4">
                    <div className="mt-0.5">
                        <Clock className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-[15px]">Delivery in {dynamicEta || '30-35 mins'}</h3>
                         <p className="text-sm text-gray-500 mt-0.5 border-b border-gray-300 border-dotted inline-block">Want this later? Schedule it</p> 
                    </div>
                </div>
                */}

                        {/* Bill Summary */}
                        <div className="flex gap-4 pt-4">
                            <div className="mt-0.5">
                                <FileText className="w-5 h-5 text-gray-700" />
                            </div>
                            <div className="flex-1 transition-all duration-300">
                                {/* Header: Click to Toggle */}
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none"
                                    onClick={() => setExpandedBill(!expandedBill)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 text-[15px]">Total Bill</span>
                                        {loadingFee ? (
                                            <span className="text-sm text-gray-400 font-medium animate-pulse">Calculating...</span>
                                        ) : (
                                            <>
                                                <span className="text-sm text-gray-400 line-through">₹{(grandTotal + savings).toFixed(2)}</span>
                                                <span className="font-bold text-gray-900 text-[15px]">₹{grandTotal.toFixed(2)}</span>
                                            </>
                                        )}
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedBill ? 'rotate-180' : ''}`}
                                    />
                                </div>

                                {/* Expandable Details */}
                                {expandedBill && (
                                    <div className="mt-3 space-y-2 pt-2 border-t border-dashed border-gray-200 text-sm text-gray-600 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div className="flex justify-between">
                                            <span>Item Total</span>
                                            <span>₹{itemTotal.toFixed(2)}</span>
                                        </div>

                                        {loadingFee ? (
                                            <div className="flex justify-between items-center w-full">
                                                <span>Delivery Partner Fee</span>
                                                <span className="text-gray-400 animate-pulse text-xs font-semibold">Calculating...</span>
                                            </div>
                                        ) : deliveryFee > 0 ? (
                                            <div className="flex justify-between">
                                                <span>Delivery Partner Fee</span>
                                                <span>₹{deliveryFee.toFixed(2)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between text-green-600">
                                                <span>Delivery Fee</span>
                                                <span>FREE</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span>Platform Fee</span>
                                            <span>₹{PLATFORM_FEE.toFixed(2)}</span>
                                        </div>



                                        {isDonationChecked && (
                                            <div className="flex justify-between">
                                                <span>Feeding India Donation</span>
                                                <span>₹{donationAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                        {(loadingFee || loadingAddresses) ? (
                            <div className="w-full">
                                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg mb-2"></div>
                                <div className="w-32 h-4 bg-gray-200 animate-pulse rounded mx-auto"></div>
                            </div>
                        ) : (!isServiceable || !selectedAddress) ? (
                            <div className="w-full">
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4 flex items-start gap-3">
                                    <div className="p-1.5 bg-white rounded-full shadow-sm mt-0.5">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{!selectedAddress ? 'No Address Selected' : 'Location Unserviceable'}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{!selectedAddress ? 'Please select a delivery address.' : "We don't deliver to this location yet."}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowProfilePanel(true);
                                        setProfilePanelContent('address');
                                    }}
                                    className="w-full text-white rounded-lg px-4 py-4 font-bold shadow-lg active:scale-95 transition-transform"
                                    style={{ backgroundColor: '#E74C3C' }}
                                >
                                    {selectedAddress ? 'Change Delivery Address' : 'Select Delivery Address'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    className={`w-full text-white rounded-lg px-4 py-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform relative overflow-hidden group ${isProcessing || (!!user && !isServiceable) ? 'cursor-not-allowed opacity-70' : ''
                                        }`}
                                    style={{ backgroundColor: isProcessing || (!!user && !isServiceable) ? '#9CA3AF' : '#1BA672' }}
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing || (!!user && !isServiceable)}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            <span className="text-lg font-bold">{processingMessage}</span>
                                        </div>
                                    ) : loadingFee ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold animate-pulse">Calculating fee... 🚚</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold">Pay ₹{grandTotal.toFixed(2)}</span>
                                            <span className="text-xl">→</span>
                                        </div>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2 font-medium">100% Secure Payments</p>
                            </>
                        )}
                    </div>

                    {/* Cancellation Policy */}
                    <div className="px-2 pb-6">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">CANCELLATION POLICY</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            Orders cannot be cancelled once placed. No refunds will be provided. Please review your order carefully before confirming.
                        </p>
                    </div>

                    {/* Explicit Spacer for Fixed Footer Clearance */}
                    <div className="h-48 w-full lg:hidden" aria-hidden="true" />
                </div>

            </div>



            {/* Fixed Footer (Mobile Only) */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-50 rounded-t-2xl lg:hidden"
                style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            >

                <div className="px-4 py-4">
                    {(loadingFee || loadingAddresses) ? (
                        <div className="flex gap-4 items-center mb-2">
                            <div className="flex-1">
                                <span className="font-extrabold text-gray-400 text-[15px] animate-pulse">Calculating...</span>
                            </div>
                            <div className="h-12 w-32 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                                <span className="text-[14px] font-bold text-gray-500">Wait... 🚚</span>
                            </div>
                        </div>
                    ) : (!isServiceable || !selectedAddress) ? (
                        <div className="w-full flex flex-col gap-3">
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                                <div className="p-1 px-1.5 bg-white rounded-full shadow-sm">
                                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{!selectedAddress ? 'No Address Selected' : 'Location Unserviceable'}</h4>
                                    <p className="text-xs text-gray-600 mt-1 leading-normal">{!selectedAddress ? 'Please select a delivery location.' : "Sorry, we don't deliver here yet."}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowLocationSheet(true);
                                }}
                                className="w-full text-white rounded-lg px-4 py-4 flex items-center justify-center font-semibold shadow-md active:scale-95 transition-transform text-[15px] uppercase tracking-wider"
                                style={{ backgroundColor: '#E74C3C' }}
                            >
                                {selectedAddress ? 'Change Delivery Location' : 'Select Location'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <input
                                    type="checkbox"
                                    id="mockPaymentMobile"
                                    checked={useMockPayment}
                                    onChange={(e) => setUseMockPayment(e.target.checked)}
                                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="mockPaymentMobile" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                                    Use Mock Payment (Dev Only)
                                </label>
                            </div>

                            {/* Mock Shadowfax Checkbox */}
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <input
                                    type="checkbox"
                                    id="mockShadowfaxMobile"
                                    checked={useMockShadowfax}
                                    onChange={(e) => setUseMockShadowfax(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="mockShadowfaxMobile" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                                    Mock Shadowfax Order
                                </label>
                            </div>

                            <button
                                className={`w-full text-white rounded-lg px-4 py-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform relative overflow-hidden group ${isProcessing || (!!user && !isServiceable) ? 'cursor-not-allowed opacity-70' : ''
                                    }`}
                                style={{ backgroundColor: isProcessing || (!!user && !isServiceable) ? '#9CA3AF' : '#1BA672' }}
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || (!!user && !isServiceable)}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        <span className="text-[15px] font-bold">{processingMessage}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">Pay ₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2 font-medium">100% Secure Payments</p>
                        </>
                    )}
                </div>
            </div>

            {/* ProfilePanel for Address Selection */}
            <ProfilePanel
                isOpen={showProfilePanel}
                onLogout={() => { }}
                content={profilePanelContent}
                onClose={() => {
                    setShowProfilePanel(false);
                    // Refresh addresses when panel closes (to capture any changes/new defaults)
                    if (profilePanelContent === 'address') {
                        fetchAddresses();
                    }
                }}
                userInfo={user ? {
                    name: user.name,
                    phone: user.phone,
                    email: user.email
                } : null}
            />

            <LocationBottomSheet
                isOpen={showLocationSheet}
                onClose={() => {
                    setShowLocationSheet(false);
                    fetchAddresses();
                }}
                onAddAddress={() => {
                    setAddressToSave(null);
                    setShowSaveAddressModal(true);
                    setShowLocationSheet(false);
                }}
                onEditAddress={(addr) => {
                    setAddressToSave(addr);
                    setShowSaveAddressModal(true);
                    setShowLocationSheet(false);
                }}
                refreshTrigger={addressRefreshTrigger}
            />

            <LoginPanel
                isOpen={showLoginPanel}
                onClose={() => setShowLoginPanel(false)}
                onAuthComplete={async (authData) => {
                    try {
                        if (login) await login(authData);
                        setShowLoginPanel(false);
                        toast.success("Login successful. You can now complete your order.");
                    } catch (error) {
                        toast.error('Failed to sync login state');
                    }
                }}
            />

            <AddressModal
                isOpen={showSaveAddressModal}
                onClose={() => setShowSaveAddressModal(false)}
                editingAddress={addressToSave}
                onSave={async () => {
                    setShowSaveAddressModal(false);
                    fetchAddresses(); // Refresh to get the newly saved address
                    setAddressRefreshTrigger(prev => prev + 1);
                    toast.success("Address saved successfully");
                    // If we came from the sheet (e.g. Add New), maybe re-open sheet?
                    // Usually flows: Sheet -> Add -> Save -> Sheet (to select).
                    // But here we close modal. 
                    // If the user wants to select the new address, they might need the sheet again.
                    // App.tsx logic suggests re-opening sheet.
                    // Let's settle for just updating trigger for now.
                }}
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
