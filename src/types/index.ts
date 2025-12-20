// Main application types

export interface Vendor {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  image: string;
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
  cuisineType: string;
  phone: string;
  isActive: boolean;
  isFeatured: boolean;
  created_at: string;
  tags?: string[];
  // Optional fields used in some components / API shapes
  logo_url?: string;
  contact_whatsapp?: string;
  products?: Product[];
  latitude?: number;
  longitude?: number;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  // canonical property names plus common API variants
  image: string;
  image_url?: string;
  is_available: boolean;
  // alias used in many components — keep both to reduce type churn
  available?: boolean;
  is_veg: boolean;
  created_at: string;
  updated_at?: string;
  // InstantPicks specific additions
  rating?: number;
  ratingCount?: number;
  // optional tags used by components
  diet_tags?: string[];
  tags?: string[];
}

// Category and ProductSubscription used by hooks/components
export interface Category {
  id?: string;
  name: string;
  image_url?: string;
}

export interface ProductSubscription {
  id: string;
  product_id: string;
  has_subscription: boolean;
}

export interface CartItem {
  productId: string;
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isVeg: boolean;
}

export interface Address {
  id?: string;
  user_id?: string;
  type: "home" | "work" | "other";
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
  latitude?: number;
  longitude?: number;
  label?: string;
  custom_label?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  created_at: string;
}
