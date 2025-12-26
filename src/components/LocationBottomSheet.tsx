import { MapPin, Loader2, AlertCircle, X, Navigation, Plus, ChevronRight, LocateFixed, Home, Building2, Search, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

import { Button } from "./ui/button";
import { useLocation } from "../contexts/LocationContext";
import { useAuth } from "../contexts/AuthContext";
import colors from "../styles/colors";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getGoogleMapsApiKey } from "../utils/googleMapsConfig";
import { AddressApi } from "../utils/addressApi";
import { UserAddress } from "../types/address";
import { LocationSearchInput } from "./common/LocationSearchInput";

import { useAddresses } from "../hooks/useAddresses";

export interface LocationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAddress?: () => void;
  onEditAddress?: (address: UserAddress) => void;
  refreshTrigger?: number;
}

export function LocationBottomSheet({ isOpen, onClose, onAddAddress, onEditAddress, refreshTrigger }: LocationBottomSheetProps) {
  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses,
    refreshAvailableTypes,
    defaultAddress
  } = useAddresses();
  const {
    location,
    locationDisplay,
    locationLabel,
    isLoading: locationLoading,
    refreshLocation,
    error: locationError
  } = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isOpen) {
       refreshAddresses();
    }
  }, [isOpen, refreshTrigger, refreshAddresses]);




  const navigate = useNavigate();

  // Close menu on outside click




  const handleAddAddress = () => {
    onAddAddress?.();
  };

  const handleDetectLocation = async () => {
    await refreshLocation();
    onClose();
    navigate('/');
  };

  const [selectingAddressId, setSelectingAddressId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const handleSelectAddress = async (address: UserAddress) => {
      if (user?.phone) {
          try {
            setSelectingAddressId(address.id);
            // Set as default address
            await setDefaultAddress(address.id);
            // Refresh location context
            await refreshLocation();
            onClose();
            navigate('/'); // Ensure we land in the app
          } catch (error) {
            console.error("Failed to select address:", error);
          } finally {
            setSelectingAddressId(null);
          }
      }
  };



  /* 
     State to track if user is searching.
     We start searching as soon as they type.
  */
  const [searchText, setSearchText] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const isSearching = searchText.trim().length > 0;

  // Use a ref for PlacesService to avoid re-creating it
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
     if (!window.google?.maps?.places) return;

     if (!placesServiceRef.current) {
        // Create a dummy div for the service (as required by the API)
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
     }

     const request = {
        placeId: prediction.place_id,
        fields: ['name', 'geometry', 'formatted_address', 'address_components']
     };

     placesServiceRef.current.getDetails(request, async (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
             const lat = place.geometry.location.lat();
             const lng = place.geometry.location.lng();
             const address = place.formatted_address || place.name || '';
             
             // Extract City and State for logic (like isInCoimbatore)
             let city = '';
             let state = '';
             let country = 'India';

             if (place.address_components) {
                for (const component of place.address_components) {
                    if (component.types.includes('locality')) {
                        city = component.long_name;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                    if (component.types.includes('country')) {
                        country = component.long_name;
                    }
                }
             }

             // Construct LocationData object
             const selectedLocation = {
                city,
                state,
                country,
                formatted_address: address, // This will be used for display
                coordinates: {
                  latitude: lat,
                  longitude: lng
                },
                timestamp: Date.now()
             };

            console.log("📍 Location details fetched:", selectedLocation);

            // Override location in context
            if (context?.overrideLocation) {
                await context.overrideLocation(selectedLocation);
            } else {
                console.error("overrideLocation missing in context");
            }

            onClose();
        } else {
            console.error("Failed to fetch place details:", status);
        }
     });
  };

  const handleSearchSelect = (loc: any) => {
     // Legacy handler, unused now if we use predictions, 
     // but kept null op to satisfy interface if needed
  }; 

  // Safe access to context (though hook ensures it exists)
  const context = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl p-0 w-full max-w-full left-0 right-0 transition-transform duration-300 ease-in-out"
        style={{ top: '104px', bottom: 0, height: 'calc(100vh - 104px)', position: 'fixed', zIndex: 1100 }}
      >
        <style>{`
          [data-slot="sheet-content"] > button[class*="absolute"] {
            display: none !important;
          }
          [data-slot="sheet-content"][data-state="closed"] {
            animation: slideDown 300ms ease-in-out;
          }
          [data-slot="sheet-content"][data-state="open"] {
            animation: slideUp 300ms ease-in-out;
          }
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(100%);
            }
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Select Location</SheetTitle>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors -mr-2"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <LocationSearchInput
            onSearchChange={setSearchText}
            onLocationSelect={() => {}} // Disabled as we handle it via predictions
            onPredictionsChange={setPredictions}
          />
        </SheetHeader>

        <div className="px-6 pb-6 pt-2 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
          {/* Use Current Location Row - Always Visible */}
          <button
            onClick={handleDetectLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-between p-4 rounded-[0.8rem] border border-gray-100 bg-white shadow-sm transition-colors hover:bg-gray-50 text-left group"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="p-2 bg-gutzo-primary/10 rounded-full flex-shrink-0 group-hover:bg-gutzo-primary/20 transition-colors">
                {locationLoading ? (
                   <Loader2 className="h-5 w-5 text-gutzo-primary animate-spin" />
                ) : (
                   <LocateFixed className="h-5 w-5 text-gutzo-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gutzo-primary">Use current location</h4>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                   {locationDisplay}
                </p>
              </div>
            </div>

            {/* Arrow - Centered vertically */}
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-4" />
          </button>

          {/* Search Results List (Visible when searching) */}
          {isSearching && predictions.length > 0 && (
            <div className="space-y-3">
               <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">
                  Search Results
               </h3>
               {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    onClick={() => handlePredictionSelect(prediction)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                     <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                     <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                           {prediction.structured_formatting?.main_text || prediction.description}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                           {prediction.structured_formatting?.secondary_text}
                        </p>
                     </div>
                  </button>
               ))}
               <div className="flex justify-end p-2">
                   <span className="text-[10px] text-gray-400">powered by Google</span>
               </div>
            </div>
          )}

          {/* Manage Addresses (Hide when searching) */}
          {!isSearching && isAuthenticated && (
            <>
              <Button
                onClick={handleAddAddress}
                className="w-full bg-gutzo-primary hover:bg-gutzo-primary-hover text-white rounded-xl py-6 flex items-center justify-center gap-3 shadow-sm"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add/Manage Addresses</span>
              </Button>

              {/* Saved Addresses Section */}
              <div className="pt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Addresses</h3>

                {addressesLoading ? (
                  /* Loading Skeletons */
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative p-4 rounded-xl border border-gray-100 bg-white">
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 bg-gray-100 rounded animate-pulse flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : addresses.length > 0 ? (
                  /* Address List */
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const Icon = addr.type === 'home' ? Home : addr.type === 'work' ? Building2 : MapPin;
                      const label = addr.custom_label || (addr.type.charAt(0).toUpperCase() + addr.type.slice(1));
                      const isSelecting = selectingAddressId === addr.id;

                      return (
                        <div
                          key={addr.id}
                          className={`relative p-4 rounded-xl border bg-white transition-colors group cursor-pointer ${
                             isSelecting ? 'border-gutzo-primary bg-gutzo-primary/5' : 'border-gray-200 hover:border-gutzo-primary'
                          }`}
                          onClick={() => !isSelecting && handleSelectAddress(addr)}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-gutzo-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                                {label}
                                {addr.is_default && (
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
                                    style={{
                                      backgroundColor: '#E8F6F1',
                                      color: '#1BA672',
                                      borderColor: '#1BA672'
                                    }}
                                  >
                                    Selected
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                {addr.full_address}
                              </p>
                              {addr.postal_code && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {addr.state} {addr.postal_code}, {addr.country || 'India'}
                                </p>
                              )}
                            </div>

                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault(); // Also prevent default
                              }}
                              onPointerDown={(e) => e.stopPropagation()} // Stop pointer down propagation too
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2 outline-none h-8 w-8 flex items-center justify-center cursor-pointer"
                                  >
                                    <MoreVertical className="h-5 w-5 text-gray-500" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 bg-white rounded-xl shadow-lg border-gray-100 p-1 z-[9999]">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium outline-none"
                                    onClick={() => {
                                      onEditAddress?.(addr);
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-700 text-sm font-medium outline-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmationId(addr.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No saved addresses found.
                  </div>
                )}
              </div>

              <AlertDialog open={!!deleteConfirmationId} onOpenChange={(open) => !open && setDeleteConfirmationId(null)}>
                <AlertDialogContent 
                  className="p-6 border-0 shadow-xl bg-white gap-0 overflow-hidden outline-none"
                  style={{ 
                    borderRadius: '24px',
                    width: '90vw',
                    maxWidth: '360px'
                  }}
                >
                  {/* Close Icon (Top Right) */}
                  <button 
                    onClick={() => setDeleteConfirmationId(null)}
                    className="absolute right-4 top-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors outline-none"
                  >
                     <X size={20} strokeWidth={2.5} />
                  </button>

                  <div className="flex flex-col gap-2 mt-2">
                    <AlertDialogHeader className="space-y-0">
                      <AlertDialogTitle 
                        className="text-left text-gray-900 leading-tight"
                        style={{ fontSize: '20px', fontWeight: 600 }}
                      >
                        Delete Address?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-left text-[14px] text-gray-600 font-normal leading-relaxed mt-2 mb-6">
                        Are you sure you want to delete this address?
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button 
                        className="w-full h-12 flex items-center justify-center font-bold text-[16px] uppercase tracking-wide transition-transform active:scale-95 outline-none"
                        style={{ 
                          backgroundColor: '#E8F6F1',
                          color: '#1BA672',
                          borderRadius: '10px'
                        }}
                        onClick={() => setDeleteConfirmationId(null)}
                      >
                        No
                      </button>
                      
                      <button
                        className="w-full h-12 flex items-center justify-center text-white font-bold text-[16px] uppercase tracking-wide shadow-md transition-transform active:scale-95 outline-none"
                        style={{ 
                           backgroundColor: '#1BA672',
                           borderRadius: '10px'
                        }}
                        onClick={async () => {
                          if (deleteConfirmationId) {
                            await deleteAddress(deleteConfirmationId);
                            setDeleteConfirmationId(null);
                          }
                        }}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )} 

          {/* Search Results would go here if we were rendering a custom list, 
              but Google Maps Autocomplete renders its own dropdown attached to the input.
              We just hide the other content to reduce clutter. 
          */}
        </div>
      </SheetContent>

      {/* Global Full Screen App Loader */}
      {(selectingAddressId || locationLoading) && createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    {/* Pulsing Logo */}
                    <div className="absolute inset-0 bg-gutzo-primary/20 rounded-full blur-xl animate-pulse scale-150"></div>
                    <img
                        src="https://35-194-40-59.nip.io/service/storage/v1/object/public/Gutzo/GUTZO.svg"
                        alt="Gutzo"
                        className="w-40 h-auto relative z-10 animate-bounce-slight"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                    />
                </div>
                
                <div className="flex flex-col items-center gap-3 mt-8">
                     <p className="text-lg font-semibold text-gray-700">
                             {locationLoading ? "Finding your spot..." : "Setting your location..."}
                        </p>
                     </div>

            </div>
        </div>,
        document.body
      )}

    </Sheet>
  );
}

// LocationSearchInput moved to components/common/LocationSearchInput.tsx
