// Lightweight global shims for browser globals and external SDKs used in the app
declare const google: any;

declare namespace google {
  namespace maps {
    // Minimal types used by the app; keep as any to avoid heavy @types/google.maps dependency
    type Map = any;
    type Marker = any;
    namespace places {
      type Autocomplete = any;
    }
    class Geocoder { geocode(request: any, callback: (results: any, status: any) => void): void; }
    type GeocoderResult = any;
    const event: any;
    const ControlPosition: any;
  }
}

declare global {
  interface Window {
    google?: any;
    mapCenterTimeout?: any;
    GOOGLE_MAPS_API_KEY?: string;
  }
}

export {};
