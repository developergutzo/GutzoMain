import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocationService } from '../utils/locationService';
import { useAuth } from './AuthContext';
import { AddressApi } from '../utils/addressApi';

interface LocationData {
  city: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

interface LocationContextType {
  location: LocationData | null;
  locationDisplay: string;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
  isInCoimbatore: boolean;
  isDefaultAddress: boolean;
  locationLabel: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDisplay, setLocationDisplay] = useState('Location Unknown');
  
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  
  // Get auth context to check for user's default address
  const { user, isAuthenticated } = useAuth();

  const isInCoimbatore = location ? LocationService.isInCoimbatore(location) : false;

  const loadLocation = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // First, try to get default address if authenticated
      // We do this concurrently or prioritized? 
      // Plan: Load GPS first (as base), then override if default address exists.
      // But to avoid flickering, we might want to check address first if logged in.
      
      const locationData = await LocationService.getLocation();
      setLocation(locationData);
      
      // We let the effect handle the display update and default address checking
      // to keep this function focused on fetching GPS location.
      
      if (locationData) {
        console.log('Location loaded:', LocationService.getLocationDisplay(locationData));
      } else {
        console.log('No location available');
        setError('Location not available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Location error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    // Clear cache and get fresh location
    setIsDefaultAddress(false); // Reset default flag on manual refresh
    LocationService.clearCache();
    await loadLocation();
  };

  // Update locationDisplay logic
  useEffect(() => {
    const updateDisplay = async () => {
      // Base display from GPS location
      let display = location ? LocationService.getLocationDisplay(location) : 'Location Unknown';
      let isDefaultAddressFound = false;

      // If user is authenticated, try to get default address
      if (isAuthenticated && user?.phone) {
        try {
          const result = await AddressApi.getDefaultAddress(user.phone);
          if (result.success && result.data) {
            // Use default address for display
            display = AddressApi.getAddressDisplayText(result.data);
            
            // Extract label
            let label = null;
            if (result.data.type === 'other' && result.data.custom_label) {
                label = result.data.custom_label;
            } else if (result.data.label) {
                label = result.data.label;
            } else {
                // Fallback to type if label is missing
                label = result.data.type ? result.data.type.charAt(0).toUpperCase() + result.data.type.slice(1) : null;
            }
            setLocationLabel(label);
            setLocationLabel(label);
            
            isDefaultAddressFound = true;
            console.log('📍 Using default address for location display:', display, 'Label:', label);

            // CRITICAL FIX: Update the main location object if coordinates exist
            // This ensures hooks like useVendors use the correct override location
            if (result.data.latitude && result.data.longitude) {
               // Verify if we actually need to update to avoid infinite loops if objects are different but values same
               const newLat = result.data.latitude;
               const newLng = result.data.longitude;
               
               // Only update if coords differ significantly from current location state
               // or if current location is null (though we fetched GPS, maybe it failed)
               const currentLat = location?.coordinates?.latitude;
               const currentLng = location?.coordinates?.longitude;

               // Simple epsilon check or direct comparison
               if (currentLat !== newLat || currentLng !== newLng) {
                   console.log('🔄 Syncing Location Context with Default Address Coordinates:', { newLat, newLng });
                   setLocation({
                       city: result.data.city,
                       state: result.data.state,
                       country: 'India', // Defaulting as assumed
                       coordinates: {
                           latitude: newLat,
                           longitude: newLng
                       },
                       timestamp: Date.now()
                   });
               }
            }

          } else {
            setLocationLabel(null);
          }
        } catch (err) {
          console.error('Failed to check default address for location display:', err);
          setLocationLabel(null);
        }
      } else {
        setLocationLabel(null);
      }

      setLocationDisplay(display);
      setIsDefaultAddress(isDefaultAddressFound);
    };

    updateDisplay();
  }, [location, isAuthenticated, user?.phone]);

  // Load location on mount
  useEffect(() => {
    loadLocation();
  }, []);

  // Refresh location periodically (every 30 minutes when tab is active)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        loadLocation(true); // Silent refresh
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Track if we have completed the startup priority check
  const [hasStartupCheckDone, setHasStartupCheckDone] = useState(false);
  
  // Combine internal loading state with startup check requirement
  // If user is authenticated but we haven't checked priority yet, force loading to prevent stale address flash
  const isContextLoading = isLoading || (isAuthenticated && !hasStartupCheckDone);

  // Enforce Home/Work priority on startup/login
  useEffect(() => {
    const enforceDefaultPriority = async () => {
      // If not authenticated, reset check status so it runs again on next login
      if (!isAuthenticated || !user?.phone) {
        setHasStartupCheckDone(false);
        return;
      }

      try {
        const result = await AddressApi.getUserAddresses(user.phone);
        if (result.success && result.data && result.data.length > 0) {
          const addresses = result.data;
          
          // Find current default
          const currentDefault = addresses.find(a => a.is_default);
          
          // Determine target default based on priority: Home -> Work -> Any
          let targetDefault = addresses.find(a => a.type.toLowerCase() === 'home');
          if (!targetDefault) {
             targetDefault = addresses.find(a => a.type.toLowerCase() === 'work');
          }
           if (!targetDefault) {
             targetDefault = addresses[0];
          }

          // Strict Enforcement: If we have a target, and it's NOT the current default, switch it.
          if (targetDefault && (!currentDefault || currentDefault.id !== targetDefault.id)) {
             console.log(`🏠 Enforcing Startup Priority: Switching default to ${targetDefault.type}`);
             await AddressApi.setDefaultAddress(targetDefault.id, user.phone);
             // Trigger display update AND WAIT for it
             await refreshLocation(); 
          }
        }
      } catch (err) {
        console.error('Failed to enforce address priority:', err);
      } finally {
        // Mark check as done - this releases the Shimmer
        setHasStartupCheckDone(true);
      }
    };

    enforceDefaultPriority();
  }, [isAuthenticated, user?.phone]);

  // Reset location to GPS when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🔒 User logged out: Resetting location to detected GPS coordinates');
      // Reset label immediately to avoid UI flash while refreshing
      setLocationLabel(null);
      refreshLocation();
    }
  }, [isAuthenticated]);

  return (
    <LocationContext.Provider
      value={{
        location,
        locationDisplay,
        isLoading: isContextLoading,
        error,
        refreshLocation,
        isInCoimbatore,
        isDefaultAddress,
        locationLabel
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}