import { useEffect, useRef, useState } from 'react';
import { getGoogleMapsApiKey } from '../utils/googleMapsConfig';

const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();
const BIKE_ICON = "https://cdn-icons-png.flaticon.com/512/3082/3082383.png"; // Scooter Icon

interface Coordinates {
  lat: number;
  lng: number;
}

interface OrderTrackingMapProps {
  storeLocation: Coordinates;
  userLocation: Coordinates;
  driverLocation?: Coordinates;
  status: 'placed' | 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered' | 'arrived_at_drop' | 'reached_location' | 'driver_assigned' | 'searching_rider';
  fitBoundsPadding?: number; // Not used as much with DirectionsRenderer
  onDurationUpdate?: (duration: string) => void;
}

export function OrderTrackingMap({ 
  storeLocation, 
  userLocation, 
  driverLocation,
  status,
  fitBoundsPadding = 50,
  onDurationUpdate
}: OrderTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Internal driver location state for animation
  const [driverPos, setDriverPos] = useState<Coordinates>(storeLocation);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Load Google Maps Script if not already loaded
    if (!window.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsMapLoaded(true);
    }
    
    return () => {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstanceRef.current) {
      // Initialize Map
      const map = new google.maps.Map(mapRef.current, {
        center: storeLocation,
        zoom: 13,
        disableDefaultUI: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
      mapInstanceRef.current = map;

      // Initialize Directions Service and Renderer
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true, // We'll handle markers ourselves
          polylineOptions: {
              strokeColor: "#222",
              strokeOpacity: 0.8,
              strokeWeight: 4,
          }
      });

      // Add Markers
      // Store Marker
      new google.maps.Marker({
        position: storeLocation,
        map,
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/restaurant.png",
            scaledSize: new google.maps.Size(32, 32)
        },
        title: "Kitchen"
      });

      // User Marker
      new google.maps.Marker({
        position: userLocation,
        map,
        icon: {
             url: "https://maps.google.com/mapfiles/ms/icons/homegardenbusiness.png",
             scaledSize: new google.maps.Size(32, 32)
        },
        title: "Accura"
      });
      
      // Driver Marker
      driverMarkerRef.current = new google.maps.Marker({
          position: storeLocation,
          map,
          icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: "#000",
              fillOpacity: 1,
              strokeWeight: 2,
              rotation: 0,
          },
          title: "Driver"
      });

      // Fit bounds to show both points
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(storeLocation);
      bounds.extend(userLocation);
      map.fitBounds(bounds, fitBoundsPadding); // Dynamic padding
    }
  }, [isMapLoaded, storeLocation, userLocation]);

  // Update Driver Marker Position
  useEffect(() => {
    if (!mapInstanceRef.current || !driverMarkerRef.current || !driverLocation) return;

    const newPos = driverLocation;
    console.log('🗺️ Updating driver marker to:', newPos);
    driverMarkerRef.current.setPosition(newPos);

    // Optional: Calculate heading from previous position if we tracked it, 
    // but for now just pointing it? Or maybe leave rotation alone.
    // Shadowfax might not provide heading.
    
    // If we have a previous position, we could animate/slide to new one, 
    // but direct setPosition is fine for v1.
  }, [driverLocation]);

  // Handle status-based visibility or simulation (Optional: Removed pure simulation to rely on real data)
  useEffect(() => {
      // If no driver location yet but status says on_way, maybe show at store?
     if (!driverLocation && driverMarkerRef.current) {
         driverMarkerRef.current.setPosition(storeLocation);
     }
  }, [status, driverLocation, storeLocation]);

  // 3. Routing Logic (Directions API)
  // 3. Routing & Marker Logic
  useEffect(() => {
      if (!isMapLoaded || !directionsServiceRef.current || !directionsRendererRef.current) return;

      const isSearching = status === 'searching_rider' || status === 'placed' || status === 'preparing' || status === 'ready';
      // Phase 2: ONLY when moving TO the store. Once reached, we show the next leg.
      const isPickUpPhase = ['driver_assigned', 'allotted'].includes(status);
      const isDeliveryPhase = ['picked_up', 'on_way', 'arrived_at_drop', 'out_for_delivery'].includes(status);

      console.log(`🗺️ Map Routing - Status: ${status}, isSearching: ${isSearching}, isPickUpPhase: ${isPickUpPhase}, isDeliveryPhase: ${isDeliveryPhase}`);

      // A. Marker Visibility
      if (driverMarkerRef.current) {
          // Hide rider marker if we are still searching
          driverMarkerRef.current.setVisible(!isSearching);
          console.log(`👁️ Driver marker visible: ${!isSearching}`);
      }

      // B. Routing Logic
      let origin: Coordinates | null = null;
      let destination: Coordinates | null = null;

      if (isSearching) {
          // Phase 1: searching -> Static Path (Store -> User)
          // No rider to track yet.
          origin = storeLocation;
          destination = userLocation;
          console.log('📍 Phase 1 (Searching): Route from Store → User');
      } else if (isPickUpPhase) {
          // Phase 2: Rider Assigned -> Rider is coming to Store
          origin = driverLocation || storeLocation; // Fallback to store if loc missing (e.g. just assigned)
          destination = storeLocation;
          console.log('📍 Phase 2 (Pickup): Route from Driver → Store', { driverLocation, storeLocation });
      } else if (isDeliveryPhase) {
          // Phase 3: Order Picked Up -> Rider is coming to User
          origin = driverLocation || storeLocation; 
          destination = userLocation;
          console.log('📍 Phase 3 (Delivery): Route from Driver → User', { driverLocation, userLocation });
      } else {
           // Completed / Default
           origin = storeLocation;
           destination = userLocation;
           console.log('📍 Default: Route from Store → User');
      }

      if (origin && destination) {
          console.log(`🛫 Calculating route from (${origin.lat}, ${origin.lng}) → (${destination.lat}, ${destination.lng})`);
          directionsServiceRef.current.route({
              origin,
              destination,
              travelMode: google.maps.TravelMode.DRIVING
          }, (result: any, status: any) => {
              if (status === 'OK' && result) {
                  directionsRendererRef.current?.setDirections(result);
                  // Extract Duration
                  const leg = result.routes[0]?.legs[0];
                  if (leg && leg.duration && onDurationUpdate) {
                      console.log(`⏱️ Route duration: ${leg.duration.text}`);
                      onDurationUpdate(leg.duration.text);
                  }
              } else {
                  console.error('❌ Directions request failed:', status);
              }
          });
      }

  }, [isMapLoaded, status, driverLocation, storeLocation, userLocation, onDurationUpdate]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
