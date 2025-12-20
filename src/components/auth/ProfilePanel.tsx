import { X, Package, MapPin, LogOut, User, Edit3, Phone, Mail, Check, XIcon, Plus, Home, Briefcase, Building, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";

import { UserAddress } from '../../types/address';
import { AddressModal } from "./AddressModal";
import { OrdersPanel } from "../OrdersPanel";
import { nodeApiService as apiService } from '../../utils/nodeApi';
import { AddressApi } from '../../utils/addressApi';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';

type ProfilePanelContent = 'profile' | 'orders' | 'address';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  content: ProfilePanelContent;
  userInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  } | null;
  onViewOrderDetails?: (orderData: any) => void;
  recentOrderData?: {
    paymentDetails: {
      paymentId: string;
      subscriptionId: string;
      method: string;
      amount: number;
      date: string;
    };
    orderSummary: {
      items: number;
      vendor: string;
      orderType: string;
      quantity: string;
      estimatedDelivery: string;
    };
  } | null;
}

// Helper hook for media queries
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);
  return matches;
}

export function ProfilePanel({ isOpen, onClose, onLogout, content, userInfo, onViewOrderDetails, recentOrderData }: ProfilePanelProps) {
  // Check for desktop view
  const isDesktop = useMediaQuery('(min-width: 850px)');
  
  const { user } = useAuth();
  const { refreshLocation } = useLocation();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  
  // Real user data state
  const [realUserData, setRealUserData] = useState<any>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [realAddresses, setRealAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Profile editing state
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const addressListRef = useRef<HTMLDivElement>(null);

  // Supabase edge function configuration
  //const SUPABASE_URL = 'https://jkafnrpojqzfvertyrwc.supabase.co/functions/v1/make-server-6985f4e9';
  //const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYWZucnBvanF6ZnZlcnR5cndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTA4NDQsImV4cCI6MjA3MzM2Njg0NH0.xLhgq-S8K1Ho40OptegwkcAG-4TCWoJXnHGG1PXLP10';

  // Get user data from localStorage if not provided
  const getUserData = () => {
    if (userInfo) return userInfo;
    
    try {
      const authData = localStorage.getItem('gutzo_auth');
      if (authData) {
        return JSON.parse(authData);
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
    
    return { name: 'User', phone: '', email: '' };
  };

  const userData = getUserData();
  const displayName = realUserData?.name || userData.name || 'User';
  // Robust display: Strip everything, take last 10 digits, add +91
  const rawPhone = (userData.phone || '').replace(/[^\d]/g, '').slice(-10);
  const displayPhone = rawPhone ? `+91 ${rawPhone}` : '';
  const displayEmail = realUserData?.email || userData.email || '';

  // Update temp values when displayName/displayEmail changes
  useEffect(() => {
    setTempName(displayName);
    setTempEmail(displayEmail || '');
  }, [displayName, displayEmail]);

  // Fetch real user profile data using apiService
  const fetchUserProfile = async () => {
    if (!userData.phone) return;
    setUserDataLoading(true);
    try {
      const profileData = await apiService.getUser(userData.phone);
      if (profileData && profileData.name) {
        setRealUserData(profileData);
      } else {
        console.log('ℹ️ User not found or no additional data found');
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
    } finally {
      setUserDataLoading(false);
    }
  };

  // Fetch real orders data using apiService
  const fetchUserOrders = async () => {
    if (!userData.phone) return;
    setOrdersLoading(true);
    try {
      const ordersData = await apiService.getUserCart(userData.phone);
      setRealOrders(ordersData?.items || []);
    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch real addresses data using apiService
  const fetchUserAddresses = async () => {
    if (!userData.phone) return;
    setAddressesLoading(true);
    try {
      // Use dedicated address API to fetch addresses from Supabase edge function
      const response = await apiService.getUserAddresses(userData.phone);
      console.log('[ProfilePanel] API getUserAddresses response:', response);
      if (Array.isArray(response)) {
        setRealAddresses(response);
      } else if (response.success && Array.isArray(response.data)) {
        setRealAddresses(response.data);
      } else {
        setRealAddresses([]);
      }
    } catch (error) {
      console.error('[ProfilePanel] Error fetching user addresses:', error);
      setRealAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Address fetching is handled via apiService

  // Fetch data when panel opens and content changes
  useEffect(() => {
    if (isOpen && userData.phone) {
      if (content === 'profile') {
        fetchUserProfile();
      } else if (content === 'orders') {
        fetchUserOrders();
      } else if (content === 'address') {
        fetchUserAddresses();
      }
    }
  }, [isOpen, content, userData.phone]);

  // Sync addresses with real data
  useEffect(() => {
  console.log('[ProfilePanel] Syncing addresses to local state:', realAddresses);
  setAddresses(realAddresses);
  setLoadingAddresses(addressesLoading);
  }, [realAddresses, addressesLoading]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getContentTitle = () => {
    switch (content) {
      case 'profile':
        return 'My Profile';
      case 'orders':
        return 'My Orders';
      case 'address':
        return 'My Address';
      default:
        return 'Profile';
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim() || !userData.phone) return;
    setIsUpdating(true);
    try {
      await apiService.createUser({ phone: userData.phone, name: tempName.trim(), verified: true, email: realUserData?.email });
      setRealUserData((prev: typeof realUserData) => ({ ...prev, name: tempName.trim() }));
      const authData = localStorage.getItem('gutzo_auth');
      if (authData) {
        const auth = JSON.parse(authData);
        auth.name = tempName.trim();
        localStorage.setItem('gutzo_auth', JSON.stringify(auth));
      }
      setEditingName(false);
    } catch (error) {
      console.error('❌ Error updating name:', error);
      setTempName(displayName); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!tempEmail.trim() || !userData.phone) return;
    setIsUpdating(true);
    try {
      await apiService.createUser({ phone: userData.phone, name: realUserData?.name || userData.name, verified: true, email: tempEmail.trim() });
      setRealUserData((prev: typeof realUserData) => ({ ...prev, email: tempEmail.trim() }));
      const authData = localStorage.getItem('gutzo_auth');
      if (authData) {
        const auth = JSON.parse(authData);
        auth.email = tempEmail.trim();
        localStorage.setItem('gutzo_auth', JSON.stringify(auth));
      }
      setEditingEmail(false);
    } catch (error) {
      console.error('❌ Error updating email:', error);
      setTempEmail(displayEmail || ''); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelName = () => {
    setTempName(displayName);
    setEditingName(false);
  };

  const handleCancelEmail = () => {
    setTempEmail(displayEmail || '');
    setEditingEmail(false);
  };

  const handleSaveAddress = async () => {
    // Only refresh addresses and update UI, never create another address
    try {
      await fetchUserAddresses();
      setShowAddressModal(false);
    } catch (error) {
      console.error('❌ Error refreshing addresses:', error);
      // Optionally, show error to user
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!userData.phone) return;
    setDeletingAddressId(addressId);
    
    // Check if the address being deleted is the default one
    const addressToDelete = realAddresses.find(addr => addr.id === addressId);
    const isDeletingDefault = addressToDelete?.is_default;

    try {
      console.log('🗑️ Deleting address via API service:', addressId);
      await apiService.deleteAddress(userData.phone, addressId);
      
      // Update local state by removing deleted address
      const updatedAddresses = realAddresses.filter(addr => addr.id !== addressId);
      setRealAddresses(updatedAddresses);

      // If we deleted the default address, try to find a new default
      if (isDeletingDefault) {
        // Priority: Home -> Work -> Any (first one)
        let newDefault = updatedAddresses.find(addr => addr.type.toLowerCase() === 'home');
        
        if (!newDefault) {
          newDefault = updatedAddresses.find(addr => addr.type.toLowerCase() === 'work');
        }
        
        if (!newDefault && updatedAddresses.length > 0) {
          newDefault = updatedAddresses[0];
        }

        if (newDefault) {
          console.log(`📍 Priority Fallback: Setting ${newDefault.type} (${newDefault.custom_label || ''}) as new default`);
          const setDefaultResult = await AddressApi.setDefaultAddress(newDefault.id, userData.phone);
          if (setDefaultResult.success) {
            handleSetDefaultAddress(newDefault.id);
          }
        } else {
             // No addresses left, refresh to clear header (will revert to GPS)
             refreshLocation();
        }
      }
    } catch (error) {
      console.error('❌ Error deleting address via API service:', error);
      // toast.error("Failed to delete address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'home':
        return <Home className="h-4 w-4 text-gutzo-primary" />;
      case 'work':
        return <Briefcase className="h-4 w-4 text-gutzo-primary" />;
      case 'hotel':
        return <Building className="h-4 w-4 text-gutzo-primary" />;
      default:
        return <MapPin className="h-4 w-4 text-gutzo-primary" />;
    }
  };

  const renderProfileContent = () => {
    if (userDataLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="h-20 w-20 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="w-20 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-full h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">


        {/* Profile Header */}
        <div className="text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarFallback className="bg-gutzo-primary text-white font-semibold text-xl">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-gray-900">
            {displayName}
          </h3>
          {userDataLoading && (
            <div className="flex items-center justify-center mt-2">
              <Loader2 className="h-4 w-4 animate-spin text-gutzo-primary mr-2" />
              <span className="text-sm text-gray-500">Syncing profile...</span>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          {/* Name Field */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-5 w-5 text-gray-500" />
              <p className="text-sm font-medium text-gray-900">Full Name</p>
            </div>
            
            {editingName ? (
              <div className="space-y-3">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full"
                  placeholder="Enter your full name"
                  disabled={isUpdating}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveName}
                    disabled={!tempName.trim() || isUpdating}
                    className="flex-1 bg-gutzo-primary hover:bg-gutzo-primary-hover text-white h-9"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancelName}
                    variant="outline"
                    disabled={isUpdating}
                    className="flex-1 h-9"
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{displayName}</p>
                <button 
                  onClick={() => setEditingName(true)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          {/* Phone Field */}
          {displayPhone && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">Phone Number</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{displayPhone}</p>
                <div className="px-3 py-1 bg-gutzo-selected text-white text-xs rounded-full">
                  Verified
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <p className="text-sm font-medium text-gray-900">Email Address</p>
            </div>
            
            {editingEmail ? (
              <div className="space-y-3">
                <Input
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  type="email"
                  className="w-full"
                  placeholder="Enter your email address"
                  disabled={isUpdating}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveEmail}
                    disabled={!tempEmail.trim() || isUpdating}
                    className="flex-1 bg-gutzo-primary hover:bg-gutzo-primary-hover text-white h-9"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancelEmail}
                    variant="outline"
                    disabled={isUpdating}
                    className="flex-1 h-9"
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {displayEmail || 'No email address added'}
                </p>
                <button 
                  onClick={() => setEditingEmail(true)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };



  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user?.phone) return;

    // Optimistic Update: Immediately update UI
    const optimisticAddresses = addresses.map(addr => ({
      ...addr,
      is_default: addr.id === addressId
    }));
    setAddresses(optimisticAddresses);

    try {
      const result = await AddressApi.setDefaultAddress(addressId, user.phone);
      if (result.success) {
        // Refresh addresses list from server to be sure
        fetchUserAddresses();
        // Refresh global location context to update header
        refreshLocation();
      } else {
        console.error('Failed to set default address:', result.error);
        // Revert on failure (fetched from server)
        fetchUserAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      fetchUserAddresses();
    }
  };

  const renderOrdersContent = () => {
    if (ordersLoading) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">Loading Orders from Database...</span>
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl p-4 space-y-3">
                <div className="w-full h-4 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">


        <OrdersPanel 
          onViewOrderDetails={onViewOrderDetails} 
          recentOrderData={recentOrderData}
          realOrders={realOrders}
          isLoading={ordersLoading}
        />
      </div>
    );
  };



  const renderAddressContent = () => {
    if (loadingAddresses) {
      return (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-16 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="w-full h-4 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4" ref={addressListRef}>
        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-sm">Saved Addresses</h4>
              <Button 
                onClick={() => setShowAddressModal(true)}
                className="bg-gutzo-primary hover:bg-gutzo-primary-hover text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add New</span>
              </Button>
            </div>
            {addresses.map((address) => (
              <div 
                key={address.id} 
                onClick={() => !address.is_default && handleSetDefaultAddress(address.id)}
                className={`rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                  address.is_default 
                    ? 'bg-[#E8F6F1] border-2 border-[#1BA672] shadow-md' 
                    : 'bg-gray-50 border border-gray-200 hover:border-[#1BA672]/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Address Type Header */}
                    <div className="flex items-center space-x-2 mb-2">
                      {getAddressIcon(address.type)}
                      <span className="font-medium text-sm text-gutzo-primary capitalize">
                        {address.type === 'other' && address.custom_label ? address.custom_label : address.type}
                      </span>
                    </div>

                    {/* Address Details */}
                    <div className="text-sm text-gray-700 space-y-1">
                      {(() => {
                        const displayText = AddressApi.getAddressDisplayText(address);
                        // Clean up full address only if it starts with the display text
                        let cleanFullAddress = address.full_address;
                        if (cleanFullAddress && cleanFullAddress.startsWith(displayText)) {
                          cleanFullAddress = cleanFullAddress.substring(displayText.length).replace(/^[\s,]+/, '').trim();
                        }
                        
                        return (
                          <>
                            <p className="font-medium text-gray-900">{displayText}</p>
                            {address.landmark && (
                              <p className="text-gray-500 text-xs">Landmark: {address.landmark}</p>
                            )}
                            {cleanFullAddress && <p className="text-gray-600">{cleanFullAddress}</p>}
                          </>
                        );
                      })()}
                      {address.postal_code && (
                        <p className="text-gray-500 text-xs">Postal Code: {address.postal_code}</p>
                      )}
                      {address.delivery_instructions && (
                        <p className="text-gray-500 text-xs">Note: {address.delivery_instructions}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      disabled={deletingAddressId === address.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingAddressId === address.id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">No addresses saved yet</h3>
            <p className="text-gray-500 text-sm mb-6">Add your first delivery address to get started with ordering.</p>
            <Button 
              onClick={() => setShowAddressModal(true)}
              className="bg-gutzo-primary hover:bg-gutzo-primary-hover text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Address</span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Early return AFTER all hooks have been called
  if (!isOpen) return null;

  return (
    <>
      {/* Panel */}
      <div 
        className={isDesktop 
          ? `fixed top-0 right-0 h-full w-[95%] max-w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`
          : `fixed bottom-0 left-0 w-full max-h-[85vh] bg-white shadow-2xl z-50 rounded-t-3xl border-t border-gray-100 transform transition-transform duration-300 overflow-hidden flex flex-col ${
              isOpen ? 'translate-y-0' : 'translate-y-full'
            }`
        }
      >
        {/* Close Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close profile panel"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0 pt-16 px-6 pb-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900">
              {getContentTitle()}
            </h2>
            <div className="border-b border-gray-100 mt-4" />
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
            {/* Loading States */}
            {content === 'profile' && userDataLoading && !realUserData && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-700 font-medium">Loading Profile from Database...</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Fetching your profile data from Supabase
                  </p>
                </div>
              </div>
            )}
            
            {content === 'address' && addressesLoading && realAddresses.length === 0 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-700 font-medium">Loading Addresses from Database...</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Fetching your saved addresses from Supabase
                  </p>
                </div>
              </div>
            )}



            {/* Content Rendering */}
            {content === 'profile' && renderProfileContent()}
            {content === 'orders' && renderOrdersContent()}
            {content === 'address' && renderAddressContent()}
          </div>

          {/* Address Modal */}
          <AddressModal 
            isOpen={showAddressModal}
            onClose={() => setShowAddressModal(false)}
          onSave={() => handleSaveAddress()}
          />

          {/* Footer */}

        </div>
      </div>
    </>
  );
}