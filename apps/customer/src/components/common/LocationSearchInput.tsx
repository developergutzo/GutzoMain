import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getGoogleMapsApiKey } from "../../utils/googleMapsConfig";

// Global script loading state
let isScriptLoading = false;
let isScriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

export function LocationSearchInput({ 
  onLocationSelect, 
  onSearchChange,
  onPredictionsChange,
  className = "",
  placeholder = "Search for area, street name..."
}: {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onSearchChange?: (value: string) => void;
  onPredictionsChange?: (predictions: google.maps.places.AutocompletePrediction[]) => void;
  className?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        return;
      }

      const apiKey = getGoogleMapsApiKey();
      if (!apiKey) return;

      const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
      if (existingScript) {
        if ((window as any).google?.maps) {
           setIsLoaded(true);
        } else {
           const interval = setInterval(() => {
             if ((window as any).google?.maps) {
               clearInterval(interval);
               setIsLoaded(true);
             }
           }, 200);
        }
        return;
      }

      if (isScriptLoaded) {
          setIsLoaded(true);
          return;
      }

      if (isScriptLoading && scriptLoadPromise) {
        await scriptLoadPromise;
        setIsLoaded(true);
        return;
      }

      isScriptLoading = true;
      scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const callbackName = `initGoogleMapsSearch_${Math.random().toString(36).substr(2, 9)}`;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=${callbackName}`;
        script.async = true;
        script.defer = true;

        (window as any)[callbackName] = () => {
          isScriptLoaded = true;
          isScriptLoading = false;
          setIsLoaded(true);
          delete (window as any)[callbackName];
          resolve();
        };

        script.onerror = (err) => {
          isScriptLoading = false;
          reject(err);
        };

        document.head.appendChild(script);
      });

      try {
        await scriptLoadPromise;
      } catch (e) {
        console.error(e);
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize Maps (Widget or Service)
  useEffect(() => {
    if (isLoaded && inputRef.current && window.google?.maps?.places) {
      if (onPredictionsChange) {
        // HEADLESS MODE: Use AutocompleteService
        if (!serviceRef.current) {
          serviceRef.current = new google.maps.places.AutocompleteService();
        }
        // No widget initialization here
      } else {
        // WIDGET MODE: Use Autocomplete Widget (Legacy/AddressModal)
        if (!autocompleteRef.current) {
          try {
            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
              types: ['geocode', 'establishment'],
              componentRestrictions: { country: 'IN' },
              fields: ['formatted_address', 'geometry', 'name']
            });

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || place.name || '';
                
                onLocationSelect({ lat, lng, address });
              }
            });

            autocompleteRef.current = autocomplete;
          } catch (e) {
            console.error('Failed to init autocomplete', e);
          }
        }
      }
    }
  }, [isLoaded, onPredictionsChange, onLocationSelect]);

  // Handle Input Change for Headless Mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange?.(value);

    // Only fetch predictions if in headless mode
    if (onPredictionsChange && serviceRef.current && isLoaded) {
      if (!value.trim()) {
        onPredictionsChange([]);
        return;
      }

      // Simple debounce could be added here if needed, but for now direct call
      // Google's service limits are generous enough for typing, but good practice to debounce
      // Using a small timeout to debounce
      const fetchPredictions = async () => {
         try {
           serviceRef.current?.getPlacePredictions({
             input: value,
             componentRestrictions: { country: 'IN' },
             types: ['geocode', 'establishment']
           }, (predictions, status) => {
             if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
               onPredictionsChange(predictions);
             } else {
               onPredictionsChange([]);
             }
           });
         } catch (err) {
           console.error("Prediction fetch failed", err);
           onPredictionsChange([]);
         }
      };
      
      // Debounce logic (simple)
      // Note: In a real app use useDebounce hook. Here relying on rapid React updates isn't ideal for API.
      // Implementing a lightweight debounce ref
      if ((window as any)._searchTimeout) clearTimeout((window as any)._searchTimeout);
      (window as any)._searchTimeout = setTimeout(fetchPredictions, 300);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200">
        {isLoaded ? (
          <Search className="h-5 w-5 text-gutzo-primary" />
        ) : (
          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>
      <input
        ref={inputRef}
        placeholder={placeholder}
        disabled={!isLoaded}
        onChange={handleInputChange}
        className="w-full pl-16 pr-4 h-16 bg-white border border-gray-200 rounded-2xl outline-none focus:border-gutzo-primary focus:ring-1 focus:ring-gutzo-primary transition-all duration-200 font-medium text-lg text-gray-700 placeholder:text-gray-400 shadow-sm hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      {/* Force Google Maps Autocomplete dropdown to appear above the sheet/modal (z-index 1100+) */}
      {/* Only apply this style if NOT using onPredictionsChange (classic widget mode) */}
      {!onPredictionsChange && (
        <style>{`
          .pac-container {
            z-index: 9999 !important;
            border-radius: 12px;
            margin-top: 8px;
            border: 1px solid #E0E0E0;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            font-family: inherit;
          }
          .pac-item {
            padding: 12px 16px;
            cursor: pointer;
          }
          .pac-item:hover {
            background-color: #F8F9FA;
          }
          .pac-icon {
            margin-right: 12px;
          }
        `}</style>
      )}
    </div>
  );
}
