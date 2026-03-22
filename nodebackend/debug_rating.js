import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('id, name, rating')
    .ilike('name', '%Coimbatore Cafe%');
  
  if (error) { console.error('Vendor error:', error); return; }
  console.log('Found vendors:', vendors.length);

  for (const vendor of vendors) {
    console.log(`\n--- Vendor: ${vendor.name} (${vendor.id}) ---`);
    console.log('DB Rating:', vendor.rating);

    const { data: products, error: pError } = await supabase
      .from('products')
      .select('id, name, rating, review_count')
      .eq('vendor_id', vendor.id);

    if (pError) { 
      console.error('Product error:', pError); 
      continue; 
    }
    
    console.log('Products:', JSON.stringify(products, null, 2));

    // Also check product averages
    const ratedProducts = products.filter(p => p.rating > 0);
    if (ratedProducts.length > 0) {
      const total = ratedProducts.reduce((sum, p) => sum + p.rating, 0);
      const avg = total / ratedProducts.length;
      console.log('Calculation for this vendor:', {
        total,
        count: ratedProducts.length,
        rawAvg: avg,
        toFixed: avg.toFixed(1),
        asNumber: Number(avg.toFixed(1))
      });
    } else {
      console.log('No products with ratings > 0 found for this vendor.');
    }
  }
}
check();
