import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Edit, Trash2, Image as ImageIcon, Check, ShoppingBag, Calendar, UploadCloud, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../common/ImageWithFallback";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../ui/utils";
import * as React from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_pct?: number;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  category: string;
  diet_tags?: string[];
}

interface MenuTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleAvailability: (productId: string, current: boolean) => void;
  showCategoryHeaders?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
}

const parseDescription = (desc: string) => {
  if (!desc) return '';
  return desc.replace(/\[TAGS:.*\]/g, '').trim();
};

export function MenuTable({ 
  products, 
  onEdit, 
  onDelete, 
  onToggleAvailability, 
  showCategoryHeaders = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}: MenuTableProps) {
  const groupedRows = showCategoryHeaders ? products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>) : { 'All Items': products };

  const allProductIds = products.map(p => p.id);
  const isAllSelected = allProductIds.length > 0 && allProductIds.every(id => selectedIds.has(id));
  const isSomeSelected = allProductIds.some(id => selectedIds.has(id)) && !isAllSelected;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 overflow-x-auto scrollbar-hide">
      <Table className="border-collapse min-w-[950px]">
        <TableHeader className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md border-b border-gray-100">
          <TableRow className="hover:bg-transparent border-none h-12">
            <TableHead className="w-[340px] text-[10px] font-black uppercase tracking-widest text-gray-400 py-3 px-6 border-r border-gray-50" style={{ padding: '12px 24px' }}>
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Checkbox 
                  checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                  onCheckedChange={() => onToggleSelectAll(allProductIds)}
                  className="data-[state=checked]:bg-gutzo-brand data-[state=checked]:border-gutzo-brand"
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '0.1em' }}>Item Identity</span>
              </div>
            </TableHead>
            <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest text-gray-400 py-3 px-6 text-right border-r border-gray-50">Price</TableHead>
            <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest text-gray-400 py-3 px-6 text-center border-r border-gray-50">Status</TableHead>
            <TableHead className="min-w-[200px] text-[10px] font-black uppercase tracking-widest text-gray-400 py-3 px-6 border-r border-gray-50">Description</TableHead>
            <TableHead className="w-[120px] text-[10px] font-black uppercase tracking-widest text-gray-400 py-3 px-6 text-center">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedRows).map(([category, items]) => (
            <React.Fragment key={category}>
              {showCategoryHeaders && (
                <TableRow className="bg-[#FBFCFD] h-9 sticky top-12 z-20 border-b border-gray-100/50">
                   <TableCell colSpan={5} className="py-0 px-6">
                      <div className="flex items-center gap-2.5">
                         <div className="w-1.5 h-3.5 bg-gutzo-brand rounded-full shadow-[0_0_8px_rgba(27,166,114,0.3)]" />
                         <span className="text-[12px] font-black text-gray-800 uppercase tracking-tight">{category}</span>
                         <span className="text-[9px] text-gray-400 font-bold bg-white px-2 py-0.5 rounded-full border border-gray-100">{items.length} items</span>
                      </div>
                   </TableCell>
                </TableRow>
              )}
              {items.map((product) => {
                const serviceChannels = product.diet_tags?.filter(t => t.startsWith('Type:')) || [];
                const goalTags = product.diet_tags?.filter(t => !t.startsWith('Type:')) || [];
                
                return (
                  <TableRow 
                    key={product.id} 
                    className={cn(
                      "group even:bg-gray-50/20 hover:bg-gutzo-brand-light/10 border-b border-gray-50 transition-all duration-300",
                      selectedIds.has(product.id) && "bg-gutzo-brand-light/20"
                    )}
                  >
                    <TableCell className="px-6 py-4 border-r border-gray-50" style={{ padding: '16px 24px', verticalAlign: 'middle' }}>
                      <div className="flex items-center" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Checkbox 
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={() => onToggleSelect(product.id)}
                          className="data-[state=checked]:bg-gutzo-brand data-[state=checked]:border-gutzo-brand shadow-sm flex-shrink-0"
                          style={{ margin: 0, padding: 0 }}
                        />
                        <div className="relative flex-shrink-0" style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm" style={{ width: '48px', height: '48px', position: 'relative' }}>
                            {product.image_url ? (
                              <ImageWithFallback src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[12px] font-black text-gray-300">
                                {product.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className={cn(
                            "absolute -top-1.5 -left-1.5 w-4 h-4 border-2 rounded bg-white flex items-center justify-center shadow-lg",
                            product.is_veg ? "border-green-500" : "border-red-500"
                          )} style={{ position: 'absolute', top: '-6px', left: '-6px', zIndex: 10 }}>
                             <div className={cn("w-1.5 h-1.5 rounded-full", product.is_veg ? "bg-green-500" : "bg-red-500")} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, marginLeft: '8px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
                              <span className="font-extrabold text-gray-900 text-[14px] truncate tracking-tight">{product.name}</span>
                              {serviceChannels.map(sc => (
                                <div key={sc} className="text-gray-300">
                                  {sc === 'Type:Instant' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                                </div>
                              ))}
                           </div>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {goalTags.map(tag => (
                                <Badge key={tag} variant="outline" className="h-5 px-2 text-[9px] font-black text-gray-400 bg-white border-gray-100 uppercase tracking-widest">
                                  {tag}
                                </Badge>
                              ))}
                           </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 text-right border-r border-gray-50">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                          {product.discount_pct && product.discount_pct > 0 && (
                            <span className="text-[10px] font-black text-green-600 italic tracking-widest">Sale</span>
                          )}
                          <span className="text-[16px] font-black text-gray-900">₹{product.price}</span>
                        </div>
                        <span className="text-[10px] text-gray-300 font-bold tracking-tighter">#{product.id.slice(-4).toUpperCase()}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 border-r border-gray-50 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                         <Switch 
                            checked={product.is_available} 
                            onCheckedChange={() => onToggleAvailability(product.id, product.is_available)}
                            className="scale-[0.8] data-[state=checked]:bg-gutzo-brand shadow-lg"
                         />
                         <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.1em]",
                            product.is_available ? "text-gutzo-brand" : "text-gray-300"
                         )}>
                            {product.is_available ? 'Live' : 'Hidden'}
                         </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 border-r border-gray-50 max-w-[240px]">
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-2 italic leading-relaxed">
                        {parseDescription(product.description || 'Professional menu item details...')}
                      </p>
                    </TableCell>

                    <TableCell className="px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onEdit(product)}
                          className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-gutzo-brand hover:border-gutzo-brand transition-all shadow-sm"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)}
                          className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
