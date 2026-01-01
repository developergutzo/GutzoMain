import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, Vendor } from "../types";
import { nodeApiService as apiService } from "../utils/nodeApi";
import { processVendorData } from "../utils/vendors";
import { useLocation } from "../contexts/LocationContext";

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { location: userLocation, locationDisplay } = useLocation();

  const initializeApp = async () => {
    try {
      // console.log("Testing API connection...");
      // await apiService.testConnection();
      // console.log("API connection successful, loading vendors...");
      // We can skip explicit connection test to save time, loadVendors will fail if API is down
      await loadVendors();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      toast.error(
        "Failed to connect to Gutzo marketplace. Please try again later.",
      );
      setVendors([]);
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      // console.log("Starting to load vendors...");
      const response: any = await apiService.getVendors();

      let vendorList: any[] = [];
      if (Array.isArray(response)) {
        vendorList = response;
      } else if (response && Array.isArray(response.data)) {
        vendorList = response.data;
      } else if (
        response && response.vendors && Array.isArray(response.vendors)
      ) {
        vendorList = response.vendors;
      }

      if (vendorList.length === 0) {
        setVendors([]);
        return;
      }

      const processedVendors: Vendor[] = vendorList.map(processVendorData);

      // 1. Filter blacklist
      let validVendors = processedVendors.filter((vendor) =>
        !vendor.isBlacklisted
      );

      // 2. Filter by Serviceability (if location available)
      if (userLocation && userLocation.coordinates) {
        // console.log("Checking serviceability for vendors...");
        const servicedVendors: Vendor[] = [];

        await Promise.all(validVendors.map(async (vendor) => {
          // If vendor doesn't have location, skip or keep? Assuming keep if data missing, but robust check needs coords.
          if (!vendor.latitude || !vendor.longitude) {
            // servicedVendors.push(vendor); // Policy: if missing coords, maybe hide?
            return;
          }

          try {
            const pickup = {
              address: vendor.location,
              latitude: vendor.latitude,
              longitude: vendor.longitude,
            };
            const drop = {
              address: locationDisplay,
              latitude: userLocation.coordinates.latitude,
              longitude: userLocation.coordinates.longitude,
            };

            const res = await apiService.getDeliveryServiceability(
              pickup,
              drop,
            );

            // Check implicit or explicit serviceability
            const isServiceable = res.data &&
              (res.data.is_serviceable !== undefined
                ? res.data.is_serviceable
                : (res.data.value?.is_serviceable ?? true));

            if (isServiceable) {
              servicedVendors.push(vendor);
            } else {
              // console.log(
              //   `Vendor ${vendor.name} is not serviceable at current location.`,
              // );
            }
          } catch (err) {
            console.error(
              `Serviceability check failed for ${vendor.name}`,
              err,
            );
            // On error, do we hide? Safe default is hide to prevent ordering issues.
          }
        }));

        validVendors = servicedVendors;
      } else {
        // console.log(
        //   "No user location found, skipping serviceability check (showing all non-blacklisted).",
        // );
      }

      console.log(`Vendors after filtering: ${validVendors.length}`);

      // Load products for valid vendors
      const vendorsWithProducts = await Promise.all(
        validVendors.map(async (vendor) => {
          try {
            const products = await loadVendorProducts(vendor.id);
            return { ...vendor, products };
          } catch (error) {
            console.error(
              `Failed to load products for vendor ${vendor.name}:`,
              error,
            );
            return { ...vendor, products: [] };
          }
        }),
      );

      setVendors(vendorsWithProducts);
    } catch (error) {
      console.error("Failed to load vendors:", error);
      toast.error("Failed to load vendors.");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVendorProducts = async (vendorId: string): Promise<Product[]> => {
    try {
      const response: any = await apiService.getVendorProducts(vendorId);
      let products: Product[] = [];

      if (Array.isArray(response)) {
        products = response;
      } else if (
        response && response.data && Array.isArray(response.data.products)
      ) {
        products = response.data.products;
      } else if (response && Array.isArray(response.products)) {
        products = response.products;
      } else if (response && Array.isArray(response.data)) {
        products = response.data;
      }

      return products || [];
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    initializeApp();
  }, [userLocation]); // Re-run when location changes

  return {
    vendors,
    loading,
    loadVendorProducts,
  };
};
