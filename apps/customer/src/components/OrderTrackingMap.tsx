import { useEffect, useRef, useState } from 'react';
import { getGoogleMapsApiKey } from '../utils/googleMapsConfig';

const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();
const BIKE_ICON = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="30">🛵</text></svg>')}`; // Scooter Emoji Icon

interface Coordinates {
  lat: number;
  lng: number;
}

interface OrderTrackingMapProps {
  storeLocation: Coordinates | null;
  userLocation: Coordinates | null;
  driverLocation?: Coordinates | null;
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

  // Custom Polyline Refs
  const activePolylineRef = useRef<any | null>(null);
  const fetchedPathRef = useRef<google.maps.LatLng[]>([]);

  // Internal driver location state for animation
  const animationFrameRef = useRef<number>();

  // Guard: If critical locations are missing, we still run hooks but render fallback at the end.

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
    if (isMapLoaded && mapRef.current && !mapInstanceRef.current && storeLocation && userLocation) {
      // Initialize Map
      const map = new google.maps.Map(mapRef.current, {
        center: storeLocation!, // Assert non-null because of early return
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
        suppressPolylines: true, // we handle polylines manually
        preserveViewport: true, // we handle bounds manually
      });

      // Initialize Custom Polyline
      activePolylineRef.current = new (google.maps as any).Polyline({
        map: map,
        path: [],
        strokeColor: "#1BA672",
        strokeOpacity: 0.8,
        strokeWeight: 5,
        geodesic: true,
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
      // Driver Marker
      // Driver Marker
      driverMarkerRef.current = new google.maps.Marker({
        position: storeLocation,
        map,
        icon: {
          url: BIKE_ICON,
          scaledSize: new google.maps.Size(46, 46),
          anchor: new google.maps.Point(23, 23)
        },
        title: "Driver",
        zIndex: 200, // Ensure driver is on top
        optimized: false // Required for some SVG data URIs
      });

      // Fit bounds to show both points
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(storeLocation);
      bounds.extend(userLocation);
      map.fitBounds(bounds, fitBoundsPadding); // Dynamic padding
    }
  }, [isMapLoaded, storeLocation, userLocation]);

  // Update Driver Marker Position
  // Update Driver Marker Position with Smooth Animation
  // Internal driver location ref to avoid re-renders during animation
  const currentDriverPos = useRef<Coordinates | null>(storeLocation);
  const lastPathIndexRef = useRef<number>(0); // Track progress along the fetched path

  // Update Driver Marker Position with Smooth Animation along the Path
  useEffect(() => {
    if (!mapInstanceRef.current || !driverMarkerRef.current || !driverLocation) return;

    // If this is the first time, set position immediately
    if (!currentDriverPos.current) {
      currentDriverPos.current = driverLocation;
      driverMarkerRef.current.setPosition(driverLocation);
      return;
    }

    const startPos = { ...currentDriverPos.current };
    const endPos = driverLocation;

    // If effectively same position, skip animation
    if (Math.abs(startPos.lat - endPos.lat) < 0.00001 && Math.abs(startPos.lng - endPos.lng) < 0.00001) {
      return;
    }

    // 1. Calculate Waypoints (Path Following)
    let waypoints: google.maps.LatLng[] = [new (google.maps as any).LatLng(startPos)];
    let nextPathIndex = -1;

    // Only try to snap to path if we have geometry loaded and a path
    if (fetchedPathRef.current.length > 0 && (window.google?.maps as any)?.geometry) {
      const endLatLng = new (google.maps as any).LatLng(endPos);

      // Search forward from the last known index
      const checkCount = Math.min(fetchedPathRef.current.length, lastPathIndexRef.current + 50);
      let bestIdx = -1;

      for (let i = lastPathIndexRef.current; i < checkCount; i++) {
        const dist = (google.maps as any).geometry.spherical.computeDistanceBetween(fetchedPathRef.current[i], endLatLng);
        if (dist < 50) { // Found a point close to the target
          bestIdx = i;
          break;
        }
      }

      if (bestIdx !== -1 && bestIdx > lastPathIndexRef.current) {
        // Add intermediate road points
        const roadSegment = fetchedPathRef.current.slice(lastPathIndexRef.current + 1, bestIdx + 1);
        waypoints.push(...roadSegment);
        nextPathIndex = bestIdx;
      }
    }

    // Always add the final actual target
    waypoints.push(new (google.maps as any).LatLng(endPos));

    console.log(`🗺️ Animating along ${waypoints.length} waypoints. Target Path Index: ${nextPathIndex}`);

    // 2. Prepare Animation Data (Distances)
    let totalDist = 0;
    const segmentDists: number[] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const d = (google.maps as any).geometry.spherical.computeDistanceBetween(waypoints[i], waypoints[i + 1]);
      totalDist += d;
      segmentDists.push(d);
    }

    const startTime = performance.now();
    const duration = 2000; // 2 seconds

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (totalDist > 0) {
        // Find current position along the multi-segment path
        const currentDist = totalDist * progress;
        let covered = 0;
        let segIndex = 0;

        while (segIndex < segmentDists.length && covered + segmentDists[segIndex] < currentDist) {
          covered += segmentDists[segIndex];
          segIndex++;
        }

        if (segIndex < segmentDists.length) {
          const segProgress = (currentDist - covered) / segmentDists[segIndex];
          const p1 = waypoints[segIndex];
          const p2 = waypoints[segIndex + 1];

          const currentLat = p1.lat() + (p2.lat() - p1.lat()) * segProgress;
          const currentLng = p1.lng() + (p2.lng() - p1.lng()) * segProgress;

          const newLatLng = { lat: currentLat, lng: currentLng };
          driverMarkerRef.current?.setPosition(newLatLng);

          // Update Polyline
          if (activePolylineRef.current) {
            const remainingWaypoints = waypoints.slice(segIndex + 1);
            const remainingGlobalPath = (nextPathIndex !== -1) ? fetchedPathRef.current.slice(nextPathIndex + 1) : fetchedPathRef.current.slice(lastPathIndexRef.current);

            const dynamicPath = [newLatLng, ...remainingWaypoints, ...remainingGlobalPath];
            activePolylineRef.current.setPath(dynamicPath);
          }
        }
      } else {
        driverMarkerRef.current?.setPosition(endPos);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        currentDriverPos.current = endPos;
        if (nextPathIndex !== -1) {
          lastPathIndexRef.current = nextPathIndex;
        }
      }
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);

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
    // Guard: Critical locations required for routing
    if (!isMapLoaded || !directionsServiceRef.current || !directionsRendererRef.current || !storeLocation || !userLocation) return;

    const isSearching = status === 'searching_rider' || status === 'placed' || status === 'preparing' || status === 'ready';
    // Phase 2: ONLY when moving TO the store. Once reached, we show the next leg.
    const isPickUpPhase = ['driver_assigned', 'allotted', 'accepted', 'arrived'].includes(status);
    const isDeliveryPhase = ['picked_up', 'on_way', 'arrived_at_drop', 'out_for_delivery', 'collected', 'customer_door_step'].includes(status);

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
      // Update Bounds to focus on the active segment
      if (mapInstanceRef.current) {
        const bounds = new google.maps.LatLngBounds();
        // If points are distinct (e.g. we have a driver loc), fit to them.
        // Otherwise (e.g. driver loc same as store or missing), fit entire context (Store -> User)
        const isdistinct = Math.abs(origin.lat - destination.lat) > 0.0001 || Math.abs(origin.lng - destination.lng) > 0.0001;

        if (isdistinct) {
          bounds.extend(origin);
          bounds.extend(destination);
        } else {
          bounds.extend(storeLocation);
          bounds.extend(userLocation);
        }
        // Use asymmetric padding to account for the bottom sheet overlay
        mapInstanceRef.current.fitBounds(bounds, {
          top: 100,
          right: 50,
          left: 50,
          bottom: 400 // Large space for bottom sheet
        });
      }

      console.log(`🛫 Calculating route from (${origin.lat}, ${origin.lng}) → (${destination.lat}, ${destination.lng})`);
      directionsServiceRef.current.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current?.setDirections(result);

          // Store and render the polyline
          const path = result.routes[0]?.overview_path || [];
          fetchedPathRef.current = path;
          activePolylineRef.current?.setPath(path);

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

  // Render Loading/Error state if locations are missing
  if (!storeLocation || !userLocation) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
        <span className="text-sm">Location details unavailable</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
