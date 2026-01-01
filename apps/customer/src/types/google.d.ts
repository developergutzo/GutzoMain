declare namespace google.maps {
    class DistanceMatrixService {
        getDistanceMatrix(
            request: DistanceMatrixRequest,
        ): Promise<DistanceMatrixResponse>;
    }

    interface DistanceMatrixRequest {
        origins: (string | LatLng | LatLngLiteral | Place)[];
        destinations: (string | LatLng | LatLngLiteral | Place)[];
        travelMode: TravelMode;
        unitSystem?: UnitSystem;
        avoidHighways?: boolean;
        avoidTolls?: boolean;
    }

    interface DistanceMatrixResponse {
        destinationAddresses: string[];
        originAddresses: string[];
        rows: DistanceMatrixResponseRow[];
    }

    interface DistanceMatrixResponseRow {
        elements: DistanceMatrixResponseElement[];
    }

    interface DistanceMatrixResponseElement {
        distance: Distance;
        duration: Duration;
        status: DistanceMatrixElementStatus;
    }

    interface Distance {
        text: string;
        value: number;
    }

    interface Duration {
        text: string;
        value: number;
    }

    type DistanceMatrixElementStatus = "OK" | "NOT_FOUND" | "ZERO_RESULTS";

    enum TravelMode {
        DRIVING = "DRIVING",
        BICYCLING = "BICYCLING",
        TRANSIT = "TRANSIT",
        WALKING = "WALKING",
        TWO_WHEELER = "TWO_WHEELER",
    }

    enum UnitSystem {
        METRIC = 0,
        IMPERIAL = 1,
    }

    interface LatLng {
        lat: () => number;
        lng: () => number;
    }

    interface LatLngLiteral {
        lat: number;
        lng: number;
    }

    interface Place {
        location?: LatLng | LatLngLiteral;
        placeId?: string;
        query?: string;
    }
}
