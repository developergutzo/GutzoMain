// Ambient (lightweight) Google Maps declarations used across the app.
// Kept minimal to avoid adding @types/google.maps dependency during quick fixes.

declare namespace google {
  namespace maps {
    type LatLngLiteral = { lat: number; lng: number };
    // Provide both value-level constructors and type interfaces so code can
    // use `google.maps.Map` as a value (constructor) and `google.maps.Map` as a type.
    interface Map { [key: string]: any }
    var Map: {
      new (el: Element, opts?: any): Map;
      prototype: Map;
    };

    interface Marker { [key: string]: any }
    var Marker: {
      new (opts?: any): Marker;
      prototype: Marker;
    };

    interface Geocoder { geocode(request: any, callback: (results: any, status: any) => void): void }
    var Geocoder: {
      new (): Geocoder;
      prototype: Geocoder;
    };

    var event: any;
    var ControlPosition: any;

    namespace places {
      interface Autocomplete { [key: string]: any }
      var Autocomplete: { new (el: Element, opts?: any): Autocomplete; prototype: Autocomplete };
      var PlacesService: any;
    }

    type GeocoderResult = any;
  }
}

declare var google: any;
