import { Product, Vendor } from "../types";

// Tag mapping for description-based tag generation
const TAG_MAP: { [key: string]: string[] } = {
  healthy: ["Healthy", "Low Calorie", "Fresh"],
  vegan: ["Vegan", "Plant-based", "Healthy"],
  protein: ["High Protein", "Fitness", "Healthy"],
  organic: ["Organic", "Natural", "Healthy"],
  keto: ["Keto", "Low Carb", "High Fat"],
  salad: ["Healthy", "Fresh", "Low Calorie"],
  juice: ["Fresh", "Healthy", "Natural"],
  smoothie: ["Healthy", "Fresh", "Nutritious"],
};

export const generateTagsFromDescription = (description: string): string[] => {
  const lowerDesc = description.toLowerCase();
  for (const [key, tags] of Object.entries(TAG_MAP)) {
    if (lowerDesc.includes(key)) {
      return tags;
    }
  }
  return ["Healthy"];
};

export const processVendorData = (vendor: any): Vendor => ({
  id: vendor.id,
  name: vendor.name || "Unknown Vendor",
  description: vendor.description || "",
  location: vendor.address || "Coimbatore",
  rating: vendor.rating || 4.5,
  image: vendor.image || "",
  deliveryTime: vendor.delivery_time || vendor.deliveryTime || "25-30 mins",
  minimumOrder: vendor.minimum_order || vendor.minimumOrder || 0,
  deliveryFee: vendor.delivery_fee || vendor.deliveryFee || 0,
  cuisineType: vendor.cuisine_type || vendor.cuisineType || "Daily Meals",
  phone: vendor.phone || "",
  isActive: vendor.is_active !== undefined
    ? vendor.is_active
    : (vendor.isActive !== undefined ? vendor.isActive : true),
  isFeatured: vendor.is_featured !== undefined
    ? vendor.is_featured
    : (vendor.isFeatured || false),
  created_at: vendor.created_at || new Date().toISOString(),
  tags: vendor.tags || generateTagsFromDescription(vendor.description || ""),
  latitude: vendor.latitude ? parseFloat(vendor.latitude) : undefined,
  longitude: vendor.longitude ? parseFloat(vendor.longitude) : undefined,
  isBlacklisted: vendor.is_blacklisted || false,
  isOpen: vendor.is_open !== undefined ? vendor.is_open : true,
  nextOpenTime: vendor.next_open_time || vendor.nextOpenTime,
});

// Keep exact category names without normalization
export const normalizeCategory = (category: string): string => {
  // Just trim whitespace and return the exact category name
  return category.trim();
};

// Extract unique categories from all products across all vendors
export const extractCategoriesFromVendors = (vendors: Vendor[]): string[] => {
  const categories = new Set<string>();

  vendors.forEach((vendor) => {
    if (vendor.products) {
      vendor.products.forEach((product) => {
        if (product.category && product.category.trim()) {
          // Use exact category names without normalization
          categories.add(product.category.trim());
        }
      });
    }
  });

  return ["All", ...Array.from(categories).sort()];
};

// Exact category matching only - no fuzzy matching
const categoryMatches = (
  productCategory: string,
  selectedCategory: string,
): boolean => {
  if (!productCategory) return false;

  // Only exact match (case insensitive)
  return productCategory.trim().toLowerCase() ===
    selectedCategory.trim().toLowerCase();
};

// Filter vendors based on category and goal - ENHANCED FOR DYNAMIC FILTERING
export const filterVendors = (
  vendors: Vendor[],
  selectedCategory: string,
  selectedGoal: string = "All",
): Vendor[] => {
  const hasCategoryFilter = selectedCategory !== "All";
  const hasGoalFilter = selectedGoal !== "All";
  const hasFiltersActive = hasCategoryFilter || hasGoalFilter;

  console.log("🔍 FILTERING VENDORS:", {
    total: vendors.length,
    category: selectedCategory,
    goal: selectedGoal,
    filtersActive: hasFiltersActive,
  });

  const filteredVendors = vendors.filter((vendor) => {
    // 1. CATEGORY FILTERING: Must have products in the selected category
    let categoryMatch = true;
    if (hasCategoryFilter) {
      if (!vendor.products || vendor.products.length === 0) {
        categoryMatch = false;
      } else {
        categoryMatch = vendor.products.some((product) => {
          return categoryMatches(product.category || "", selectedCategory);
        });
      }
    }

    // 2. GOAL FILTERING: Vendor or its products must match the goal tag
    let goalMatch = true;
    if (hasGoalFilter) {
      const vendorTags = vendor.tags || [];
      const productTags = vendor.products?.flatMap(p => [...(p.diet_tags || []), ...(p.tags || [])]) || [];
      const allTags = [...new Set([...vendorTags, ...productTags])].map(t => t.toLowerCase());
      
      goalMatch = allTags.some(tag => tag.includes(selectedGoal.toLowerCase()));
    }

    if (hasFiltersActive && categoryMatch && goalMatch) {
      console.log(`✅ "${vendor.name}" - MATCHES filters`);
    }

    return categoryMatch && goalMatch;
  });

  console.log(
    `🎯 VENDOR FILTER RESULT: ${filteredVendors.length}/${vendors.length} vendors shown`,
  );

  return filteredVendors;
};
