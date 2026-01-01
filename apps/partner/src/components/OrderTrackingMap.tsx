import { useEffect, useRef, useState, useCallback } from 'react';
import { getGoogleMapsApiKey } from '../utils/googleMapsConfig';

const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

interface Coordinates {
  lat: number;
  lng: number;
}

interface OrderTrackingMapProps {
  storeLocation: Coordinates;
  userLocation: Coordinates;
  driverLocation?: Coordinates; // Optional initial driver location
  status: 'placed' | 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered';
  fitBoundsPadding?: number;
}

export function OrderTrackingMap({ 
  storeLocation, 
  userLocation, 
  driverLocation,
  status,
  fitBoundsPadding = 50
}: OrderTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);
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

      // Draw Route
      const routePath = [storeLocation, userLocation];
      routePolylineRef.current = new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: "#222",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: map
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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
