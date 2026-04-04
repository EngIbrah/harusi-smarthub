import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { formatTSHShort, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils";
import { Badge, StarRating } from "@/components/ui";
import { Search, MapPin, ShieldCheck, ArrowUpRight, Filter } from "lucide-react";

interface Props { 
  searchParams: { category?: string; q?: string } 
}

export default async function MarketplacePage({ searchParams }: Props) {
  const supabase = await createClient();
  const { category, q } = searchParams;

  const [{ data: categories }, { data: vendors }] = await Promise.all([
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("vendors")
      .select("*, category:categories(*)")
      .eq("status", "active")
      .order("rating_avg", { ascending: false }),
  ]);

  const filtered = (vendors || []).filter(v => {
    if (category && category !== "all" && v.category?.slug !== category) return false;
    if (q && !v.business_name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-1000">
      
      {/* 1. HERO & SEARCH HEADER */}
      <div className="relative rounded-[2.5rem] bg-brand-ebony p-8 sm:p-12 mb-12 overflow-hidden shadow-2xl">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-tanzanite/10 blur-[100px] rounded-full -ml-20 -mb-20" />
        
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-brand-gold/20 text-brand-gold border-none mb-4 px-3 py-1 font-bold text-[10px] tracking-widest uppercase">
            The Elite Collection
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Discover Tanzania's <span className="text-brand-gold">Finest</span> Vendors
          </h1>
          <p className="text-white/50 text-base mb-8 font-medium">
            Hand-picked professionals dedicated to making your Tanzanian wedding extraordinary.
          </p>

          <form className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-gold transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by business name..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:bg-white/15 backdrop-blur-md transition-all text-sm font-medium"
            />
            {category && <input type="hidden" name="category" value={category} />}
          </form>
        </div>
      </div>

      {/* 2. CATEGORY NAVIGATION */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-brand-ebony flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-tanzanite" />
            Browse Categories
          </h2>
          <span className="text-[10px] font-bold text-brand-ebony/30 uppercase tracking-widest">
            {filtered.length} Experts Available
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
          <Link href="/marketplace"
            className={cn(
              "px-6 py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300",
              !category || category === "all" 
                ? "bg-brand-ebony text-white border-brand-ebony shadow-xl shadow-brand-ebony/10" 
                : "bg-white border-brand-ebony/5 text-brand-ebony/40 hover:border-brand-ebony/20 hover:text-brand-ebony"
            )}>
            All Categories
          </Link>
          {(categories || []).map(cat => (
            <Link key={cat.id} href={`/marketplace?category=${cat.slug}`}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                category === cat.slug 
                  ? "bg-brand-tanzanite text-white border-brand-tanzanite shadow-xl shadow-brand-tanzanite/20" 
                  : "bg-white border-brand-ebony/5 text-brand-ebony/40 hover:border-brand-ebony/20 hover:text-brand-ebony"
              )}>
              <span className="text-base">{cat.icon}</span> {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. VENDOR GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-32 bg-brand-cloud rounded-[3rem] border border-dashed border-brand-ebony/10">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
             <Search className="w-8 h-8 text-brand-ebony/20" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-brand-ebony mb-2">No matches found</h3>
          <p className="text-brand-ebony/40 text-sm max-w-xs mx-auto font-medium">Try adjusting your search terms or exploring all categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(vendor => {
            const cat = vendor.category?.slug || "venue";
            const imgSrc = vendor.cover_image || vendor.images?.[0] || VENDOR_PLACEHOLDER_IMAGES[cat] || VENDOR_PLACEHOLDER_IMAGES.venue;
            
            return (
              <Link key={vendor.id} href={`/marketplace/${vendor.id}`}
                className="group relative flex flex-col bg-white rounded-[2rem] border border-brand-ebony/5 overflow-hidden hover:shadow-2xl hover:shadow-brand-ebony/10 transition-all duration-500">
                
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-brand-cloud">
                  <Image 
                    src={imgSrc} 
                    alt={vendor.business_name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" 
                  />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {vendor.is_verified && (
                      <Badge className="bg-brand-gold text-brand-ebony border-none text-[9px] font-black tracking-widest px-2.5 py-1 shadow-lg flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </Badge>
                    )}
                    {vendor.category && (
                      <Badge className="bg-white/90 backdrop-blur-md text-brand-ebony border-none text-[9px] font-bold px-2.5 py-1 shadow-md">
                        {vendor.category.icon} {vendor.category.name}
                      </Badge>
                    )}
                  </div>

                  {/* Glass Price Overlay on Hover */}
                  <div className="absolute inset-0 bg-brand-ebony/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                     <div className="bg-white text-brand-ebony px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                       View Experience <ArrowUpRight className="w-3 h-3" />
                     </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-lg font-bold text-brand-ebony group-hover:text-brand-tanzanite transition-colors line-clamp-1">
                      {vendor.business_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={vendor.rating_avg || 0} size="sm" />
                    <span className="text-[10px] font-bold text-brand-ebony/30 uppercase tracking-tighter">
                      {(vendor.rating_avg || 0).toFixed(1)} ({vendor.rating_count || 0} Reviews)
                    </span>
                  </div>

                  {vendor.description && (
                    <p className="text-xs text-brand-ebony/50 line-clamp-2 leading-relaxed mb-6 font-medium">
                      {vendor.description}
                    </p>
                  )}

                  <div className="mt-auto pt-6 border-t border-brand-ebony/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-brand-ebony/40">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{vendor.location}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-brand-ebony/20 uppercase tracking-[0.1em]">Starting At</p>
                      <p className="font-serif font-black text-brand-tanzanite text-base tracking-tight">
                        {formatTSHShort(vendor.base_price)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}