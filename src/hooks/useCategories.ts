import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Category } from "../types";
import { nodeApiService as apiService } from "../utils/nodeApi";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      // console.log("Loading categories from database...");
      // Using nodeApiService via alias
      const response = await apiService.getCategories();

      // Node backend response wrapper check
      const data = response.success ? response.data : response;

      // console.log(
      //   "Loaded categories from API:",
      //   Array.isArray(data) ? data.length : 0,
      // );

      if (!data || !Array.isArray(data)) {
        // console.log("No categories received from API");
        setCategories([]);
        return;
      }

      setCategories(data);
      // console.log("Categories loaded successfully:", data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error(
        `Failed to load categories: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
  };
};
