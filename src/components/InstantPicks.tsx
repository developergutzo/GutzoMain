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
}

const InstantPicksItem: React.FC<{ product: Product; isLast: boolean; noPadding: boolean; disabled?: boolean }> = ({ product, isLast, noPadding, disabled }) => {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <React.Fragment>
      <div className={`instant-picks-card${noPadding ? ' no-padding' : ''}`} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div className="instant-picks-details" style={{ flex: 1, paddingRight: 24 }}>
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
              {product.image && <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '16px' }} />}
            </div>
            {product.action === "add" && (
              quantity === 0 ? (
                <button
                  className={`instant-picks-btn ${disabled ? 'instant-picks-btn-gray' : 'instant-picks-btn-green'}`}
                  disabled={disabled}
                  onClick={() =>
                    !disabled && addItem(
                      product,
                      {
                        id: product.vendor?.id || product.vendor_id || 'v1',
                        name: product.vendor?.name || 'Vendor',
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
                    )
                  }
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

const InstantPicks: React.FC<InstantPicksProps> = ({ noPadding = false, vendorId, disabled }) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        let response;
        if (vendorId) {
          console.log(`Fetching products for vendor ${vendorId}...`);
          response = await nodeApiService.getVendorProducts(vendorId);
        } else {
          console.log('Fetching instant picks (bestsellers)...');
          response = await nodeApiService.getBestsellerProducts();
        }
        
        if (response.success) {
          let productsList = [];
          if (Array.isArray(response.data)) {
            productsList = response.data;
          } else if (response.data && Array.isArray(response.data.products)) {
            productsList = response.data.products;
          }
          
          if (productsList.length > 0) {
            const mappedProducts = productsList.map((p: any) => ({
              ...p,
              ratingAccount: p.review_count || p.ratingCount || 0, // Handle DB vs Type mismatch
              action: !p.is_available ? 'soldout' : 'add', // Logic for action button
              image: p.image_url || p.image // Handle image_url from DB
            }));
            setProducts(mappedProducts);
          } else {
             console.log('No products found in response');
          }
        } else {
            console.error('Failed to load products:', response);
            // Fallback or empty state
        }
      } catch (error) {
        console.error('Error fetching instant picks:', error);
        toast.error('Failed to load instant picks');
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
      Today's best picks (Instant)
    </h3>
    <div className={`instant-picks-list${noPadding ? ' no-padding' : ''}`}>
      {products.map((product, idx) => (
        <InstantPicksItem 
          key={product.id} 
          product={product} 
          isLast={idx === products.length - 1} 
          noPadding={noPadding} 
          disabled={disabled}
        />
      ))}
    </div>
  </div>
 );
};

export default InstantPicks;
