import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react';
import { Product, Vendor } from '../types';
import { toast } from 'sonner';
import { nodeApiService as apiService } from '../utils/nodeApi';
import { useAuth } from './AuthContext';
import ReplaceCartModal from '../components/ReplaceCartModal';

export interface CartItem {
  id: string;
  productId: string;
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  vendor: {
    id: string;
    name: string;
    image: string;
  };
  product: {
    image?: string;
    description?: string;
    category?: string;
  };
  variantId?: string;
  addons?: any[];
  specialInstructions?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  // Optimistic update tracking
  optimisticUpdates: Map<string, {
    productId: string;
    previousQuantity: number;
    newQuantity: number;
    timestamp: number;
    retryCount: number;
  }>;
  isLoading: boolean;
  // Cart migration status
  migrationStatus: 'none' | 'pending' | 'completed' | 'failed';
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; vendor: Vendor; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'OPTIMISTIC_UPDATE'; payload: { productId: string; quantity: number; previousQuantity: number } }
  | { type: 'CONFIRM_UPDATE'; payload: { productId: string } }
  | { type: 'ROLLBACK_UPDATE'; payload: { productId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MIGRATION_STATUS'; payload: 'none' | 'pending' | 'completed' | 'failed' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Partial<Omit<CartState, 'optimisticUpdates' | 'migrationStatus'>> }
  | { type: 'MERGE_CART'; payload: { items: CartItem[] } }
  | { type: 'UPDATE_ITEM_ID'; payload: { productId: string; newId: string } };

interface CartContextType extends CartState {
  addItem: (product: Product, vendor: Vendor, quantity: number) => void;
  addItemOptimistic: (product: Product, vendor: Vendor, quantity: number) => Promise<void>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateQuantityOptimistic: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearGuestCart: () => void;
  // For internal/debug use
  clearCartReset: () => void; // Synchronous clear for replace logic
  getItemQuantity: (productId: string) => number;
  isItemInCart: (productId: string) => boolean;
  getVendorItems: (vendorId: string) => CartItem[];
  getCurrentVendor: () => { id: string; name: string } | null;
  hasItemsFromDifferentVendor: (vendorId: string) => boolean;
  // Modal State Exposer
  isReplaceModalOpen: boolean;
  // Guest cart system
  migrateGuestCartOnLogin: (userId: string) => Promise<void>;
  loadUserCartFromDB: (userId: string) => Promise<void>;
  // Force cart reload for authenticated user
  forceCartReload: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'OPTIMISTIC_UPDATE': {
      const { productId, quantity, previousQuantity } = action.payload;
      const updateId = `${productId}_${Date.now()}`;
      
      // Add to optimistic updates tracking
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      newOptimisticUpdates.set(updateId, {
        productId,
        previousQuantity,
        newQuantity: quantity,
        timestamp: Date.now(),
        retryCount: 0
      });

      // Apply the update immediately to the cart
      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.productId !== productId);
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return {
          ...state,
          items: newItems,
          totalItems,
          totalAmount,
          optimisticUpdates: newOptimisticUpdates
        };
      }

      const newItems = state.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
        optimisticUpdates: newOptimisticUpdates
      };
    }

    case 'CONFIRM_UPDATE': {
      const { productId } = action.payload;
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      
      // Remove all optimistic updates for this product
      for (const [key, update] of newOptimisticUpdates.entries()) {
        if (update.productId === productId) {
          newOptimisticUpdates.delete(key);
        }
      }

      return {
        ...state,
        optimisticUpdates: newOptimisticUpdates
      };
    }

    case 'ROLLBACK_UPDATE': {
      const { productId } = action.payload;
      const newOptimisticUpdates = new Map(state.optimisticUpdates);
      
      // Find the most recent optimistic update for this product
      let mostRecentUpdate = null;
      let mostRecentKey = null;
      
      for (const [key, update] of newOptimisticUpdates.entries()) {
        if (update.productId === productId) {
          if (!mostRecentUpdate || update.timestamp > mostRecentUpdate.timestamp) {
            mostRecentUpdate = update;
            mostRecentKey = key;
          }
        }
      }

      if (mostRecentUpdate && mostRecentKey) {
        // Rollback to previous quantity
        const { previousQuantity } = mostRecentUpdate;
        
        // Remove the failed update
        newOptimisticUpdates.delete(mostRecentKey);

        if (previousQuantity <= 0) {
          const newItems = state.items.filter(item => item.productId !== productId);
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          return {
            ...state,
            items: newItems,
            totalItems,
            totalAmount,
            optimisticUpdates: newOptimisticUpdates
          };
        }

        const newItems = state.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: previousQuantity }
            : item
        );

        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return {
          ...state,
          items: newItems,
          totalItems,
          totalAmount,
          optimisticUpdates: newOptimisticUpdates
        };
      }

      return state;
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      };
    }

    case 'SET_MIGRATION_STATUS': {
      return {
        ...state,
        migrationStatus: action.payload
      };
    }

    case 'ADD_ITEM': {
      const { product, vendor, quantity } = action.payload;
      const existingItem = state.items.find(item => item.productId === product.id);

      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `${product.id}_${Date.now()}`,
          productId: product.id,
          vendorId: vendor.id,
          name: product.name,
          price: product.price,
          quantity,
          vendor: {
            id: vendor.id,
            name: vendor.name,
            image: vendor.image
          },
          product: {
            image: product.image,
            description: product.description,
            category: product.category
          }
        };
        newItems = [...state.items, newItem];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount
      };
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount
      };
    }

    case 'UPDATE_ITEM_ID': {
      const { productId, newId } = action.payload;
      const newItems = state.items.map(item =>
        item.productId === productId
          ? { ...item, id: newId }
          : item
      );
      return {
        ...state,
        items: newItems
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload.productId);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }

      const newItems = state.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount
      };
    }

    case 'MERGE_CART': {
      const { items: incomingItems } = action.payload;
      const mergedItems = [...state.items];

      // Merge rules: Same product → qty summed, Different products → added as separate items
      incomingItems.forEach(incomingItem => {
        const existingItemIndex = mergedItems.findIndex(
          item => item.productId === incomingItem.productId
        );

        if (existingItemIndex >= 0) {
          // Same product - sum quantities
          mergedItems[existingItemIndex] = {
            ...mergedItems[existingItemIndex],
            quantity: mergedItems[existingItemIndex].quantity + incomingItem.quantity
          };
        } else {
          // Different product - add as separate item
          mergedItems.push({
            ...incomingItem,
            id: `${incomingItem.productId}_${Date.now()}_merged`
          });
        }
      });

      const totalItems = mergedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...state,
        items: mergedItems,
        totalItems,
        totalAmount
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
        optimisticUpdates: new Map()
      };

    case 'LOAD_CART': {
      const payload = action.payload || {};
      return {
        items: payload.items ?? [],
        totalItems: payload.totalItems ?? 0,
        totalAmount: payload.totalAmount ?? 0,
        optimisticUpdates: new Map(),
        isLoading: false,
        migrationStatus: 'none'
      };
    }

    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  optimisticUpdates: new Map(),
  isLoading: false,
  migrationStatus: 'none'
};

// Guest cart storage keys
const GUEST_CART_KEY = 'gutzo_guest_cart';
const CART_MIGRATION_KEY = 'gutzo_cart_migrated';

// Helper function to transform API cart response to frontend format (with fresh product data)
const transformCartFromAPI = (apiCart: any): { items: CartItem[]; totalItems: number; totalAmount: number } => {
  // console.log('🔄 Transforming cart from API (with fresh product data):', { apiCart });
  
  if (!apiCart || !apiCart.items) {
    console.log('📭 API cart is empty or invalid');
    return { items: [], totalItems: 0, totalAmount: 0 };
  }

  // Handle new lean cart structure with fresh product data from API
  const items: CartItem[] = apiCart.items.map((item: any, index: number) => {
    // console.log(`🔄 Transforming cart item ${index + 1} with fresh product data:`, item);
    
    const transformedItem = {
      // Use the actual database ID if available, otherwise generate one (for guest/optimistic)
      // This is CRITICAL for updates/deletes to work against the backend
      id: item.id || `${item.productId || item.product_id}_${Date.now()}_api`,
      productId: item.productId || item.product_id,
      vendorId: item.vendorId || item.vendor_id,
      // Fresh product data from products table
      name: item.name || item.product?.name,
      price: item.price || item.product?.price,
      quantity: item.quantity,
      vendor: {
        id: item.vendorId || item.vendor_id,
        name: item.vendorName || item.vendor?.name || 'Unknown Vendor',
        image: item.vendor?.image || ''
      },
      product: {
        image: item.image,
        description: item.product?.description || '',
        category: item.category
      }
    };
    
    // console.log(`✅ Transformed cart item ${index + 1} with fresh data:`, transformedItem);
    return transformedItem;
  });

  const result = {
    items,
    totalItems: apiCart.totalItems || items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: apiCart.totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };
  
  // console.log('✅ Final transformed cart with fresh product data:', result);
  return result;
};

// Helper function to transform frontend cart to API format (lean structure)
const transformCartToAPI = (cartItems: CartItem[]) => {
  // console.log('🔄 Transforming cart to lean API format:', cartItems);
  
  const leanCartItems = cartItems.map(item => {
    // Validate critical fields
    if (!item.productId) console.warn('⚠️ Missing productId in cart item:', item);
    if (!item.vendorId) console.warn('⚠️ Missing vendorId in cart item:', item);

    return {
      product_id: item.productId,
      vendor_id: item.vendorId,
      quantity: item.quantity,
      variant_id: item.variantId || null,
      addons: item.addons || null,
      special_instructions: item.specialInstructions || null
    };
  });
  
  return leanCartItems;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  useEffect(() => {
    // console.log('[CartProvider] totalItems:', state.totalItems, 'items:', state.items);
  }, [state.totalItems, state.items]);
  const { isAuthenticated, user } = useAuth();

  // Load appropriate cart on mount and auth state changes
  useEffect(() => {
    const loadInitialCart = async () => {
      // console.log('🛒 Loading initial cart state...', { isAuthenticated, user: user?.phone });

      if (isAuthenticated && user) {
        // User is logged in - check if cart migration is needed
        await handleAuthenticatedCartLoad(user.phone);
      } else {
        // User is not logged in - load guest cart
        loadGuestCart();
      }
    };

    loadInitialCart();
  }, [isAuthenticated, user?.phone]);

  // Handle cart loading for authenticated users - enhanced for immediate sync
  const handleAuthenticatedCartLoad = async (userPhone: string) => {
    try {
      const hasGuestCart = localStorage.getItem(GUEST_CART_KEY);
      // We don't check for previous migration ("hasMigrated") anymore.
      // If a guest cart exists in localStorage, it means we have new items to merge,
      // because we strictly delete GUEST_CART_KEY after every successful migration.

      // console.log('🔍 Checking cart migration status:', {
      //   hasGuestCart: !!hasGuestCart,
      //   userPhone,
      //   guestCartContent: hasGuestCart ? JSON.parse(hasGuestCart) : null
      // });

      if (hasGuestCart) {
        // console.log('🚀 Starting cart migration process...');
        await migrateGuestCartOnLogin(userPhone);
        
        // Clear guest cart after successful migration
        // console.log('🧹 Clearing guest cart after successful migration');
        localStorage.removeItem(GUEST_CART_KEY);
      } else {
        // console.log('📥 Loading user cart from database...');
        await loadUserCartFromDB(userPhone);
      }
    } catch (error) {
      console.error('❌ Error handling authenticated cart load:', error);
      // Fallback to guest cart if user cart fails
      // console.log('🔄 Falling back to guest cart due to error');
      loadGuestCart();
    }
  };

  // Load guest cart from localStorage
  const loadGuestCart = () => {
    // console.log('👤 Loading guest cart from localStorage...');
    const savedGuestCart = localStorage.getItem(GUEST_CART_KEY);
    
    if (savedGuestCart) {
      try {
        const cartData = JSON.parse(savedGuestCart);
        // console.log('✅ Guest cart loaded:', { items: cartData.items?.length || 0 });
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('❌ Error loading guest cart:', error);
        localStorage.removeItem(GUEST_CART_KEY);
      }
    } else {
      // console.log('📝 No guest cart found, starting with empty cart');
    }
  };

  // Save cart to appropriate storage
  useEffect(() => {
    const saveCart = () => {
      const { optimisticUpdates, migrationStatus, ...cartToSave } = state;
      
      if (isAuthenticated && user) {
        // For authenticated users, we don't save to localStorage
        // Cart is managed in the database
        // console.log('🔒 User authenticated - cart managed in database');
        return;
      } else {
        // For guests, save to localStorage
        if (state.items.length > 0 || localStorage.getItem(GUEST_CART_KEY)) {
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartToSave));
          // console.log('💾 Guest cart saved to localStorage:', { items: state.items.length });
        }
      }
    };

    saveCart();
  }, [state, isAuthenticated, user]);

  // Clear guest cart (used on logout)
  const clearGuestCart = useCallback(() => {
    // console.log('🧹 Clearing guest cart from localStorage...');
    localStorage.removeItem(GUEST_CART_KEY);
    // Also clear migration flags
    const migrationKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(CART_MIGRATION_KEY)
    );
    migrationKeys.forEach(key => localStorage.removeItem(key));
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Clear cart with API sync for authenticated users
  const clearCart = useCallback(async () => {
    // console.log('🧹 Clearing cart...', { isAuthenticated, userPhone: user?.phone });
    
    // Set loading state
    dispatch({ type: 'SET_LOADING', payload: true });

    // Clear guest cart storage just in case (to prevent fallbacks)
    localStorage.removeItem(GUEST_CART_KEY);
    const migrationKeys = Object.keys(localStorage).filter(key => 
      key.startsWith(CART_MIGRATION_KEY)
    );
    migrationKeys.forEach(key => localStorage.removeItem(key));

    // Clear local state immediately
    dispatch({ type: 'CLEAR_CART' });
    
    // If user is authenticated, also clear from database
    if (isAuthenticated && user) {
      try {
        await apiService.clearUserCart(user.phone);
        console.log('✅ Cart cleared from database successfully');
      } catch (error) {
        console.error('❌ Error clearing cart from database:', error);
        // Don't rollback local clear - user still wants cart cleared locally
        toast.error('Cart cleared locally, but database sync failed');
      }
    } else {
      // For guests, we already cleared localStorage above
      // Ensure specific keys are definitely gone
      localStorage.removeItem(GUEST_CART_KEY); 
    }
    
    // Stop loading state
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [isAuthenticated, user]);

  // Track previous authentication state to detect actual logout events
  const prevAuthStateRef = useRef(isAuthenticated);
  
  // Handle logout - clear guest cart only on actual logout (auth state change from true to false)
  useEffect(() => {
    const wasAuthenticated = prevAuthStateRef.current;
    const isNowAuthenticated = isAuthenticated;
    
    // Update the ref for next comparison
    prevAuthStateRef.current = isAuthenticated;
    
    // Only clear cart if user was authenticated and is now not authenticated (actual logout)
    if (wasAuthenticated && !isNowAuthenticated && state.items.length > 0) {
      // console.log('👋 User logged out (auth state changed from true to false) - clearing cart...');
      clearGuestCart();
    }
  }, [isAuthenticated, clearGuestCart, state.items.length]);

  // Save authenticated user's cart to database when cart changes
  // Save authenticated user's cart to database when cart changes
  // DISABLED: This causes a race condition where the background sync (which wipes and recreates the cart)
  // changes all the IDs while we are trying to update specific items via PUT/DELETE.
  // Granular updates (addItem, updateQuantity, etc.) now handle their own API sync.
  /*
  useEffect(() => {
    const saveAuthenticatedCart = async () => {
      if (isAuthenticated && user && state.items.length > 0 && state.migrationStatus !== 'pending') {
        await saveCartToDB(user.phone, state.items);
      }
    };

    // Debounce cart saves to avoid too many API calls
    const timeoutId = setTimeout(saveAuthenticatedCart, 1000);
    return () => clearTimeout(timeoutId);
  }, [state.items, state.migrationStatus, isAuthenticated, user]);
  */

  // Migrate guest cart on login - enhanced for immediate sync
  const migrateGuestCartOnLogin = useCallback(async (userId: string) => {
    // console.log('🔄 Starting guest cart migration for user:', userId);
    dispatch({ type: 'SET_MIGRATION_STATUS', payload: 'pending' });

    try {
      const guestCartData = localStorage.getItem(GUEST_CART_KEY);
      if (!guestCartData) {
        // console.log('📭 No guest cart to migrate');
        dispatch({ type: 'SET_MIGRATION_STATUS', payload: 'completed' });
        await loadUserCartFromDB(userId);
        return;
      }

      const guestCart = JSON.parse(guestCartData);
      // console.log('📦 Guest cart found:', { 
      //   items: guestCart.items?.length || 0,
      //   guestCartStructure: guestCart
      // });

      // Validate guest cart structure
      if (!guestCart.items || !Array.isArray(guestCart.items) || guestCart.items.length === 0) {
        // console.log('📭 Guest cart is empty or invalid, loading user cart...');
        dispatch({ type: 'SET_MIGRATION_STATUS', payload: 'completed' });
        await loadUserCartFromDB(userId);
        return;
      }

  // Check if user has existing cart in database using apiService
  let existingCartData: { items: CartItem[]; totalItems: number; totalAmount: number } = { items: [], totalItems: 0, totalAmount: 0 };
      try {
        const existingCartResponse = await apiService.getUserCart(userId);
        // Correctly unwrap API response
        existingCartData = transformCartFromAPI(existingCartResponse.data || existingCartResponse);
        // console.log('🔍 Existing user cart check:', {
        //   hasExistingCart: existingCartData.items.length > 0,
        //   existingItems: existingCartData.items.length
        // });
      } catch (error) {
        // console.log('📭 No existing user cart found (expected for new users)');
        existingCartData = { items: [], totalItems: 0, totalAmount: 0 };
      }

      // Prepare the final cart to migrate
      let finalCartToMigrate = guestCart;

      if (existingCartData.items && existingCartData.items.length > 0) {
        // console.log('🔗 Existing user cart found, merging carts...', {
        //   guestItems: guestCart.items.length,
        //   existingItems: existingCartData.items.length
        // });
        
  // Merge carts manually to get the final result
  const mergedItems: CartItem[] = [...existingCartData.items];
        
        guestCart.items.forEach((guestItem: any) => {
          const existingIndex = mergedItems.findIndex((item: any) => item.productId === guestItem.productId);
          
          if (existingIndex >= 0) {
            // Same product - sum quantities
            mergedItems[existingIndex] = {
              ...mergedItems[existingIndex],
              quantity: mergedItems[existingIndex].quantity + guestItem.quantity
            };
          } else {
            // Different product - add as separate item
            mergedItems.push({
              ...guestItem,
              id: `${guestItem.productId}_${Date.now()}_merged`
            });
          }
        });

        const totalItems = mergedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const totalAmount = mergedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        finalCartToMigrate = {
          items: mergedItems,
          totalItems,
          totalAmount
        };
        
        // console.log('✅ Carts merged, final cart:', { items: finalCartToMigrate.items.length });
        toast.success('Cart merged successfully! 🛒');
      } else {
        // console.log('📝 No existing user cart, migrating guest cart as-is...');
        toast.success('Welcome back! Your cart has been restored. 🛒');
      }

      // Apply the migrated cart immediately
      dispatch({ type: 'LOAD_CART', payload: finalCartToMigrate });
      
      // Save to database immediately 
      // console.log('💾 Saving migrated cart to database...');
      if (finalCartToMigrate.items && finalCartToMigrate.items.length > 0) {
        try {
          await saveCartToDB(userId, finalCartToMigrate.items);
          // console.log('✅ Migrated cart saved to database');
          
          // CRITICAL: Reload from DB to replace synthetic IDs with real DB UUIDs
          // This prevents "Cart item not found" errors on subsequent updates
          // console.log('🔄 Reloading cart to sync real IDs...');
          await loadUserCartFromDB(userId);
        } catch (saveError) {
          console.error('❌ Error saving migrated cart:', saveError);
        }
      }

      dispatch({ type: 'SET_MIGRATION_STATUS', payload: 'completed' });
      // console.log('✅ Cart migration completed successfully');

    } catch (error) {
      console.error('❌ Error migrating guest cart:', error);
      dispatch({ type: 'SET_MIGRATION_STATUS', payload: 'failed' });
      toast.error('Cart migration failed, but you can continue shopping');
      
      // Fallback - load guest cart anyway
      try {
        const fallbackGuestCartData = localStorage.getItem(GUEST_CART_KEY);
        if (fallbackGuestCartData) {
          const fallbackGuestCart = JSON.parse(fallbackGuestCartData);
          if (fallbackGuestCart.items && fallbackGuestCart.items.length > 0) {
            // console.log('🔄 Loading guest cart as fallback...');
            dispatch({ type: 'LOAD_CART', payload: fallbackGuestCart });
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback guest cart load failed:', fallbackError);
        // Final fallback - just start fresh
        await loadUserCartFromDB(userId);
      }
    }
  }, []);

  // Load user cart from database
  const loadUserCartFromDB = useCallback(async (userId: string) => {
    // console.log('📥 Loading user cart from database for:', userId);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const cartResponse = await apiService.getUserCart(userId);
      // Backend returns { success: true, data: { items: [...] } }
      // We must pass the inner 'data' object to the transformer
      const cartData = transformCartFromAPI(cartResponse.data || cartResponse);

      
      if (cartData.items && cartData.items.length > 0) {
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } else {
        // console.log('📭 User cart is empty, starting fresh');
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('❌ Error loading user cart from database:', error);
      // console.log('📭 No user cart found in database or API error, starting with empty cart');
      dispatch({ type: 'CLEAR_CART' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save cart to database (helper function)
  // NOTE: This is ONLY for cart persistence (shopping cart),
  // NOT for saving orders after payment. Order saving is handled separately.
  const saveCartToDB = async (userId: string, items: CartItem[]) => {
    try {
      // console.log('💾 Saving cart to database...', { userId, items: items.length });
      const apiItems = transformCartToAPI(items);
      await apiService.saveUserCart(userId, apiItems);
      console.log('✅ Cart saved to database successfully');
    } catch (error) {
      console.error('❌ Error saving cart to database:', error);
    }
  };

  // Force cart reload for authenticated user
  const forceCartReload = useCallback(async () => {
    if (isAuthenticated && user) {
      // console.log('🔄 Forcing cart reload for authenticated user:', user.phone);
      await handleAuthenticatedCartLoad(user.phone);
    } else {
      // console.log('🔄 Forcing guest cart reload');
      loadGuestCart();
    }
  }, [isAuthenticated, user]);

  // Enhanced addItem with direct persistence
  const addItem = (product: Product, vendor: Vendor, quantity: number = 1) => {
    // Redirect to optimistic version which handles API sync
    addItemOptimistic(product, vendor, quantity);
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  // Enhanced updateQuantity with direct persistence
  const updateQuantity = (productId: string, quantity: number) => {
    // Redirect to optimistic version which handles API sync
    updateQuantityOptimistic(productId, quantity);
  };

  // Optimistic quantity update with background sync
  const updateQuantityOptimistic = useCallback(async (productId: string, quantity: number) => {
    const currentItem = state.items.find(item => item.productId === productId);
    const previousQuantity = currentItem ? currentItem.quantity : 0;

    // console.log('🔄 Optimistic quantity update:', { productId, quantity, previousQuantity });

    // Apply optimistic update immediately
    dispatch({ 
      type: 'OPTIMISTIC_UPDATE', 
      payload: { productId, quantity, previousQuantity } 
    });

    // Only sync with API if user is authenticated
    if (isAuthenticated && user) {
      if (!currentItem) {
        console.error('❌ Cannot update: Item not found in cart for product:', productId);
        dispatch({ type: 'ROLLBACK_UPDATE', payload: { productId } });
        return;
      }

      let cartItemId = currentItem.id;

      // Check if we have a synthetic ID (temporary local ID)
      if (typeof cartItemId === 'string' && cartItemId.includes('_')) {
        // console.log('⚠️ Detected synthetic ID for update. Attempting to resolve real DB ID...', cartItemId);
        
        try {
          // Attempt to fetch fresh cart data to find the real ID
          const cartResponse = await apiService.getUserCart(user.phone);
          const freshData = transformCartFromAPI(cartResponse.data || cartResponse);
          const freshItem = freshData.items.find(i => i.productId === productId);
          
          if (freshItem && freshItem.id && !freshItem.id.includes('_')) {
            // console.log('✅ Resolved real ID from server:', freshItem.id);
            cartItemId = freshItem.id;
            
            // Update local state with the real ID for future operations
            dispatch({ 
              type: 'UPDATE_ITEM_ID', 
              payload: { productId, newId: cartItemId } 
            });
          } else {
             // If we still can't find it, it means the ADD operation hasn't completed or failed.
             // We can't update what doesn't exist in DB.
             console.warn('⏳ Real ID not found yet (add op pending?). Queueing retry...');
             // Simple delay retry or just fail silently/rollback?
             // For now, let's wait a bit and try one more time
             await new Promise(resolve => setTimeout(resolve, 1000));
             
             const retryResponse = await apiService.getUserCart(user.phone);
             const retryData = transformCartFromAPI(retryResponse.data || retryResponse);
             const retryItem = retryData.items.find(i => i.productId === productId);
             
             if (retryItem && retryItem.id && !retryItem.id.includes('_')) {
                cartItemId = retryItem.id;
                dispatch({ type: 'UPDATE_ITEM_ID', payload: { productId, newId: cartItemId } });
             } else {
                console.error('❌ Failed to resolve real ID. Item might not be in DB yet.');
                dispatch({ type: 'ROLLBACK_UPDATE', payload: { productId } });
                toast.error('Syncing... please try again in a moment.');
                return;
             }
          }
        } catch (resolveError) {
          console.error('❌ Error resolving real ID:', resolveError);
          dispatch({ type: 'ROLLBACK_UPDATE', payload: { productId } });
          return;
        }
      }

      try {
        // console.log('🔄 Syncing update with API using Cart Item ID:', cartItemId);
        const success = await apiService.updateCartItem(user.phone, cartItemId, { quantity });
        
        if (success) {
          console.log('✅ Cart item update synced with API successfully');
          dispatch({ type: 'CONFIRM_UPDATE', payload: { productId } });
        } else {
          throw new Error('Update failed');
        }
      } catch (error: any) {
        console.error('❌ API sync failed for cart update:', error);
        
        // Aggressive Self-Healing: If 404, invalid ID, or mismatch
        // catch (500) which usually happens on invalid UUID syntax
        if (
             error.message?.includes('404') || 
             error.message?.includes('not found') || 
             error.message?.includes('invalid input syntax') ||
             error.message?.includes('500')
           ) {
            // console.log('⚠️ Cart item issue identified (ID mismatch/Invalid). Recovering...');
            
            try {
                // 1. Fetch fresh cart directly
                const cartResponse = await apiService.getUserCart(user.phone);
                const freshData = transformCartFromAPI(cartResponse.data || cartResponse);
                
                // 2. Find the item by Product ID (which is constant)
                const freshItem = freshData.items.find(i => i.productId === productId);
                
                if (freshItem && freshItem.id) {
                     // console.log('✅ Found fresh item in DB:', { oldId: cartItemId, newId: freshItem.id });
                     
                     // 3. Update local state with the correct ID
                     dispatch({ 
                       type: 'UPDATE_ITEM_ID', 
                       payload: { productId, newId: freshItem.id } 
                     });
                     
                     // 4. Retry the update with the fresh ID
                     // console.log('🔄 Retrying update with fresh ID...');
                     const retrySuccess = await apiService.updateCartItem(user.phone, freshItem.id, { quantity });
                     
                     if (retrySuccess) {
                        // console.log('✅ Retry successful! Cart synced.');
                        dispatch({ type: 'CONFIRM_UPDATE', payload: { productId } });
                        return; // Exit successfully
                     }
                } else {
                    // console.log('❌ Item not found in fresh cart - it must have been deleted.');
                    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
                    return;
                }
            } catch (retryError) {
                console.error('❌ Retry failed:', retryError);
            }
        }

        // Fallback for other errors or failed retry
        dispatch({ type: 'ROLLBACK_UPDATE', payload: { productId } });
        toast.error('Failed to update cart. Please refresh.');
      }
    } else {
      // For guest users, confirm immediately (no API sync needed)
      dispatch({ type: 'CONFIRM_UPDATE', payload: { productId } });
    }
  }, [isAuthenticated, user, state.items]);

  // Optimistic item addition with background sync
  // ---------------------------------------------------------------------------
  // Replace Cart Logic
  // ---------------------------------------------------------------------------
  const [isReplaceModalOpen, setReplaceModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<{product: Product, vendor: Vendor, quantity: number} | null>(null);
  
  const closeReplaceModal = () => {
    setReplaceModalOpen(false);
    setPendingItem(null);
  }

  const confirmReplaceCart = () => {
    if (pendingItem) {
      // 1. Clear existing cart (UI first)
      dispatch({ type: 'CLEAR_CART' });
      
      // 2. Add the new item
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          product: pendingItem.product, 
          vendor: pendingItem.vendor, 
          quantity: pendingItem.quantity 
        } 
      });

      // 3. Sync with backend (optional: force full sync or just add new item)
      // Since we clear locally, the next sync call in addItemOptimistic logic below might be tricky.
      // So we call the internal logic of addItem here.
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart'); // Hard clear storage too
      }
      
      // Re-trigger the optimistic add (this will now pass the check as cart is empty)
      // Actually, we can just call our internal sync logic if we want, or just let the dispatch handle UI
      // and let the next effect cycle handle persistence if we persist via effects.
      
      // Better approach: Call our sync API to clear backend, then add.
      if (isAuthenticated && user) {
        apiService.clearUserCart(user.phone)
            .then(() => apiService.addToCart(user.phone, { product_id: pendingItem.product.id, quantity: pendingItem.quantity, vendor_id: pendingItem.vendor.id }))
            .catch(err => console.error("Sync error during replace", err));
      }

      closeReplaceModal();
      toast.success(`Cart replaced with items from ${pendingItem.vendor.name}`);
    }
  };


  const addItemOptimistic = useCallback(async (product: Product, vendor: Vendor, quantity: number = 1) => {
    // -------------------------------------------------------------------------
    // VENDOR CONFLICT CHECK
    // -------------------------------------------------------------------------
    const currentVendor = getCurrentVendor();
    if (currentVendor && currentVendor.id !== vendor.id && state.items.length > 0) {
       setPendingItem({ product, vendor, quantity });
       setReplaceModalOpen(true);
       return; // STOP here
    }

    // Apply optimistic addition immediately
    dispatch({ type: 'ADD_ITEM', payload: { product, vendor, quantity } });

    // Only sync with API if user is authenticated
    if (isAuthenticated && user) {
      const existingItem = state.items.find(item => item.productId === product.id);
      
      try {
        if (existingItem && existingItem.id && !existingItem.id.includes('_')) { // Changed from endsWith('_api') to includes('_') for consistency
             // Case 1: Item exists and has a real DB ID -> Update Quantity
             const newQuantity = existingItem.quantity + quantity;
             const success = await apiService.updateCartItem(user.phone, existingItem.id, { quantity: newQuantity });
             
             if (success) {
               // console.log('✅ Cart item update synced with API successfully');
             } else {
               throw new Error('Update failed');
             }
        } else {
             // Case 2: New item OR existing item with temp ID -> Add to Cart (POST)
             // Using POST /cart will either create a new item or increment if it exists (depending on backend logic)
             // But backend generally expects POST for add.
             const response = await apiService.addToCart(user.phone, {
                product_id: product.id,
                quantity: quantity,
                vendor_id: vendor.id
             });
             
             // Extract real ID from response
             // Response might be wrapped in { success: true, data: { id: ... } } or just return data
             const responseData = response.data || response;
             
             if (responseData && (responseData.id || responseData.cart_id)) {
                const realId = responseData.id || responseData.cart_id;
                // console.log('✅ Added to cart, got real ID:', realId);
                
                // CRITICAL: Update local state with real ID so next update uses it
                dispatch({ 
                   type: 'UPDATE_ITEM_ID', 
                   payload: { productId: product.id, newId: realId } 
                });
             }
        }

      } catch (error) {
        console.error('❌ API sync failed for cart addition:', error);
        // Rollback on error
        const currentQuantity = state.items.find(item => item.productId === product.id)?.quantity || 0;
        const rollbackQuantity = Math.max(0, currentQuantity - quantity);
        if (rollbackQuantity === 0) {
             dispatch({ type: 'REMOVE_ITEM', payload: { productId: product.id } });
        } else {
             dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: product.id, quantity: rollbackQuantity } });
        }
        toast.error('Failed to add item. Please check your connection.');
      }
    }
  }, [isAuthenticated, user, state.items]);

  // Handle remove item with API sync for authenticated users
  const handleRemoveItem = useCallback(async (productId: string) => {
    // console.log('🗑️ Removing item:', { productId });

    // Remove immediately from local state
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });

    // Only sync with API if user is authenticated
    if (isAuthenticated && user) {
      try {
        const success = await apiService.updateCartItem(user.phone, productId, { quantity: 0 });
        if (!success) {
          console.error('❌ Failed to remove item from database');
          toast.error('Failed to remove item. Please try again.');
        }
      } catch (error) {
        console.error('❌ API sync failed for item removal:', error);
        toast.error('Failed to remove item. Please check your connection.');
      }
    }
  }, [isAuthenticated, user]);

  // Handle clear cart with API sync for authenticated users
  const handleClearCart = useCallback(async () => {
    // console.log('🧹 Clearing all cart items...');

    // Clear immediately from local state
    dispatch({ type: 'CLEAR_CART' });

    // Only sync with API if user is authenticated
    if (isAuthenticated && user) {
      try {
        await apiService.clearUserCart(user.phone);
        console.log('✅ Cart cleared from database successfully');
      } catch (error) {
        console.error('❌ Error clearing cart from database:', error);
        toast.error('Cart cleared locally, but database sync failed');
      }
    }
  }, [isAuthenticated, user]);

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const isItemInCart = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };

  const getVendorItems = (vendorId: string): CartItem[] => {
    return state.items.filter(item => item.vendorId === vendorId);
  };

  const getCurrentVendor = (): { id: string; name: string } | null => {
    if (state.items.length === 0) return null;
    const firstItem = state.items[0];
    return {
      id: firstItem.vendorId,
      name: firstItem.vendor.name
    };
  };

  const hasItemsFromDifferentVendor = (vendorId: string): boolean => {
    return state.items.some(item => item.vendorId !== vendorId);
  };

  const value: CartContextType = {
    ...state,
    addItem,
    addItemOptimistic,
    removeItem: handleRemoveItem,
    updateQuantity,
    updateQuantityOptimistic,
    clearCart: handleClearCart,
    clearCartReset: () => dispatch({ type: 'CLEAR_CART' }),
    clearGuestCart,
    getItemQuantity,
    isItemInCart,
    getVendorItems,
    getCurrentVendor,
    hasItemsFromDifferentVendor,
    isReplaceModalOpen,
    migrateGuestCartOnLogin,
    loadUserCartFromDB,
    forceCartReload
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <ReplaceCartModal 
        isOpen={isReplaceModalOpen}
        onClose={closeReplaceModal}
        onConfirm={confirmReplaceCart}
        oldVendorName={getCurrentVendor()?.name || 'Existing Vendor'}
        newVendorName={pendingItem?.vendor.name || 'New Vendor'}
      />
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};