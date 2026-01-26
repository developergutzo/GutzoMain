import './InstantPicks.css';
import React from "react";
import { useCart } from "../contexts/CartContext";
import StarIcon from "./StarIcon";
import { Product as GlobalProduct } from "../types";

import { nodeApiService } from '../utils/nodeApi';
import { toast } from 'sonner';

// Extended Product type for InstantPicks
type Product = GlobalProduct & {
  action?: "add" | "reserve" | "soldout";
  review_count?: number; // From DB
  vendor?: any; // From DB join
};

interface InstantPicksProps {
  noPadding?: boolean;
  vendorId?: string;
  disabled?: boolean;
  isOpen?: boolean;
}

const InstantPicksItem: React.FC<{ product: Product; isLast: boolean; noPadding: boolean; disabled?: boolean; isOpen?: boolean }> = ({ product, isLast, noPadding, disabled, isOpen = true }) => {
  const { addItem, updateQuantity, getItemQuantity, hasItemsFromDifferentVendor, clearCart } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <React.Fragment>
      <div className={`instant-picks-card${noPadding ? ' no-padding' : ''}`} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div className="instant-picks-details" style={{ flex: 1, paddingRight: 24, minWidth: 0 }}>
          <div className="instant-picks-title">{product.name}</div>
          <div className="instant-picks-price">₹{product.price}</div>
          <div className="instant-picks-rating">
            <StarIcon size={16} color="#43A047" className="instant-picks-star" />
            <span className="instant-picks-rating-value">{product.rating}</span>
            <span className="instant-picks-rating-count">({product.review_count || product.ratingCount || 0})</span>
          </div>
          <div className="instant-picks-desc">{product.description}</div>
        </div>
        <div className="instant-picks-image-btn" style={{ width: 160, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="instant-picks-image-wrapper">
            <div className="instant-picks-image">
              {product.image && <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '16px', filter: !isOpen ? 'grayscale(100%)' : 'none' }} />}
            </div>
            {product.action === "add" && isOpen && (
              quantity === 0 ? (
                <button
                  className={`instant-picks-btn ${disabled ? 'instant-picks-btn-gray' : 'instant-picks-btn-green'}`}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    
                    const vendorId = product.vendor?.id || product.vendor_id;
                    
                    addItem(
                      product,
                      {
                        id: vendorId,
                        name: product.vendor?.name,
                        description: product.vendor?.description || '',
                        location: product.vendor?.location || '',
                        rating: product.vendor?.rating || 5,
                        image: product.vendor?.image || '',
                        deliveryTime: product.vendor?.delivery_time || product.vendor?.deliveryTime || '',
                        minimumOrder: product.vendor?.minimum_order || product.vendor?.minimumOrder || 0,
                        deliveryFee: product.vendor?.delivery_fee || product.vendor?.deliveryFee || 0,
                        cuisineType: product.vendor?.cuisine_type || product.vendor?.cuisineType || '',
                        phone: product.vendor?.phone || '',
                        isActive: true, // Assuming active if we are seeing products
                        isFeatured: product.vendor?.is_featured || false,
                        created_at: product.vendor?.created_at || new Date().toISOString(),
                        tags: product.vendor?.tags || []
                      },
                      1
                    );
                  }}
                >{'ADD'}</button>
              ) : (
                <div className="qty-selector">
                  <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity - 1)}>-</button>
                  <span className="qty-count">{quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                </div>
              )
            )}
            {product.action === "soldout" && <button className="instant-picks-btn instant-picks-btn-gray" disabled>SOLD OUT</button>}
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="instant-picks-splitter" />
      )}
    </React.Fragment>
  );
};

const InstantPicks: React.FC<InstantPicksProps> = ({ noPadding = false, vendorId, disabled, isOpen = true }) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true); // Reset loading state on vendor change
        setError(null); // Clear previous errors
        let result;
        if (vendorId) {
          // console.log(`Fetching products for vendor ${vendorId}...`);
          result = await nodeApiService.getVendorProducts(vendorId);
        } else {
          // console.log('Fetching instant picks (bestsellers)...');
          result = await nodeApiService.getBestsellerProducts();
        }
        
        if (result.success) {
          let responseProducts = [];
          if (Array.isArray(result.data)) {
            responseProducts = result.data;
          } else if (result.data && Array.isArray(result.data.products)) {
            responseProducts = result.data.products;
          }
          
          if (responseProducts.length > 0) {
            const mappedProducts = responseProducts.map((p: any) => {
              // Parse tags from description (Fallback mechanism)
              const tagRegex = /\[TAGS:(.*?)\]$/;
              const match = p.description?.match(tagRegex);
              let extractedTags: string[] = [];
              if (match) {
                  extractedTags = match[1].split(',').map((t: string) => t.trim()).filter(Boolean);
              }
              const allTags = Array.from(new Set([...(p.diet_tags || []), ...(p.meal_types || []), ...extractedTags]));

              return {
                ...p,
                allTags, // Store for filtering
                ratingAccount: p.review_count || p.ratingCount || 0, // Handle DB vs Type mismatch
                action: !p.is_available ? 'soldout' : 'add', // Logic for action button
                image: p.image_url || p.image // Handle image_url from DB
              };
            });

            // Filter: Show if Type:Instant OR if no Availability Type tags present (Backward Compat)
            // AND exclude 'Meal Plan' category (which belongs in the Daily Meals section)
            const filteredProducts = mappedProducts.filter((p: any) => {
                if (p.category === 'Meal Plan') return false;

                const hasInstant = p.allTags.includes('Type:Instant');
                const hasSubscription = p.allTags.includes('Type:Subscription');
                const hasNone = p.allTags.includes('Type:None');
                
                // If explicitly marked as None (hidden from all), hide
                if (hasNone) return false;

                // If explicitly marked as Instant, show
                if (hasInstant) return true;
                
                // If marked ONLY as Subscription, hide
                if (hasSubscription && !hasInstant) return false;
                
                // If no type tags (Legacy product), show
                return true;
            });

            setProducts(filteredProducts);
          } else {
             // console.log('No products found in response');
             setError('No instant picks available at the moment.');
             setProducts([]); // Clear products if none found
          }
        } else {
            console.error('Failed to load products:', result);
            setError(result.message || 'Failed to load instant picks.');
            setProducts([]); // Clear on error/failure
        }
      } catch (error) {
        console.error('Error fetching instant picks:', error);
        toast.error('Failed to load instant picks');
        setProducts([]); // Clear on exception
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [vendorId]);

  if (loading) {
    return (
      <div className={noPadding ? "mt-8 w-full" : "mt-8 mx-4"}>
        <div className="space-y-6"> {/* Increased gap to match splitter */}
           {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center w-full animate-pulse">
                {/* Left: Details */}
                <div className="flex-1 pr-6 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div> {/* Title */}
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div> {/* Price */}
                  <div className="flex gap-2"> {/* Rating */}
                    <div className="h-4 w-4 bg-gray-100 rounded-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-12"></div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div> {/* Desc */}
                </div>
                {/* Right: Image */}
                <div className="w-[160px] flex flex-col items-end">
                  <div className="w-[160px] h-[140px] bg-gray-100 rounded-[16px]"></div>
                </div>
              </div>
           ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
  <div className={noPadding ? "mt-8 -mr-4 lg:mr-0 w-[calc(100%+16px)] lg:w-full" : "mt-8 mx-4"}>
    <h3
      className="instant-picks-heading text-left font-medium tracking-tight w-full mb-3"
    >
      Pick Your Food
    </h3>
    <div className={`instant-picks-list${noPadding ? ' no-padding' : ''}`}>
      {products.map((product, idx) => (
        <InstantPicksItem 
          key={product.id} 
          product={product} 
          isLast={idx === products.length - 1} 
          noPadding={noPadding} 
          disabled={disabled}
          isOpen={isOpen}
        />
      ))}
    </div>
  </div>
 );
};

export default InstantPicks;
