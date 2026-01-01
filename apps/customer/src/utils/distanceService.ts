import { getGoogleMapsApiKey } from "./googleMapsConfig";

export class DistanceService {
    private static service: google.maps.DistanceMatrixService | null = null;
    private static scriptPromise: Promise<void> | null = null;

    private static async loadGoogleMapsScript(): Promise<void> {
        if (window.google?.maps) {
            return Promise.resolve();
        }

        if (this.scriptPromise) {
            return this.scriptPromise;
        }

        this.scriptPromise = new Promise((resolve, reject) => {
            const apiKey = getGoogleMapsApiKey();
            if (!apiKey) {
                reject(new Error("Google Maps API key not found"));
                return;
            }

            const script = document.createElement("script");
            script.src =
                `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = (e) => reject(e);
            document.head.appendChild(script);
        });

        return this.scriptPromise;
    }

    static async getTravelTime(
        origin: { latitude: number; longitude: number },
        destination: { latitude: number; longitude: number },
    ): Promise<string | null> {
        try {
            await this.loadGoogleMapsScript();

            if (!this.service) {
                this.service = new google.maps.DistanceMatrixService();
            }

            const response = await this.service.getDistanceMatrix({
                origins: [{ lat: origin.latitude, lng: origin.longitude }],
                destinations: [{
                    lat: destination.latitude,
                    lng: destination.longitude,
                }],
                travelMode: google.maps.TravelMode.TWO_WHEELER,
                unitSystem: google.maps.UnitSystem.METRIC,
            });

            if (
                response.rows[0]?.elements[0]?.status === "OK" &&
                response.rows[0].elements[0].duration
            ) {
                return response.rows[0].elements[0].duration.text;
            }

            return null;
        } catch (error) {
            console.error("Error calculating travel time:", error);
            return null;
        }
    }

    static parseDurationToMinutes(duration: string): number {
        const match = duration.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }
}
