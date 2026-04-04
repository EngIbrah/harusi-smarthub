import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { formatTSHShort, VENDOR_PLACEHOLDER_IMAGES } from "@/lib/utils";
import { Badge, StarRating, SectionHeader } from "@/components/ui";

interface Props { searchParams: { category?: string; q?: string } }

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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-harusi-dark mb-2">Vendor Marketplace</h1>
        <p className="text-harusi-muted text-sm">Discover trusted wedding vendors across Tanzania.</p>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative max-w-lg">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg">🔍</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search vendors by name…"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
          />
          {category && <input type="hidden" name="category" value={category} />}
        </div>
      </form>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
        <Link href="/marketplace"
          className={`px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${!category || category === "all" ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-harusi-muted hover:border-stone-300"}`}>
          All
        </Link>
        {(categories || []).map(cat => (
          <Link key={cat.id} href={`/marketplace?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${category === cat.slug ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-harusi-muted hover:border-stone-300"}`}>
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-harusi-muted mb-5">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Vendor grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-serif text-xl font-semibold text-harusi-dark mb-2">No vendors found</h3>
          <p className="text-harusi-muted text-sm">Try a different category or search term.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(vendor => {
            const cat = vendor.category?.slug || "venue";
            const imgSrc = vendor.cover_image || vendor.images?.[0] || VENDOR_PLACEHOLDER_IMAGES[cat] || VENDOR_PLACEHOLDER_IMAGES.venue;
            return (
              <Link key={vendor.id} href={`/marketplace/${vendor.id}`}
                className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <Image src={imgSrc} alt={vendor.business_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {vendor.is_verified && <Badge variant="gold" className="text-[10px] shadow-sm">✓ Verified</Badge>}
                    {vendor.category && <Badge variant="default" className="text-[10px] bg-white/90 shadow-sm">{vendor.category.icon} {vendor.category.name}</Badge>}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-harusi-dark text-sm mb-1">{vendor.business_name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={vendor.rating_avg || 0} />
                    <span className="text-xs text-harusi-muted">{(vendor.rating_avg || 0).toFixed(1)} ({vendor.rating_count || 0})</span>
                  </div>
                  {vendor.description && (
                    <p className="text-xs text-harusi-muted line-clamp-2 leading-relaxed mb-3">{vendor.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <span className="text-xs text-stone-400">📍 {vendor.location}</span>
                    <span className="font-serif font-bold text-amber-700 text-sm tabular-nums">
                      From {formatTSHShort(vendor.base_price)}
                    </span>
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
