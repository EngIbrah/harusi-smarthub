import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatTSH, VENDOR_PLACEHOLDER_IMAGES } from "@/lib/utils";
import { Badge, StarRating, Card } from "@/components/ui";
import BookVendorButton from "@/components/marketplace/BookVendorButton";

export default async function VendorDetailPage({ params }: { params: { vendorId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: vendor }, { data: services }, { data: reviews }] = await Promise.all([
    supabase.from("vendors").select("*, category:categories(*), profile:profiles(*)").eq("id", params.vendorId).single(),
    supabase.from("services").select("*").eq("vendor_id", params.vendorId).eq("is_active", true),
    supabase.from("reviews").select("*, profile:profiles(full_name, avatar_url)").eq("vendor_id", params.vendorId).order("created_at", { ascending: false }).limit(10),
  ]);

  if (!vendor) notFound();

  const cat = vendor.category?.slug || "venue";
  const allImages = [
    vendor.cover_image || VENDOR_PLACEHOLDER_IMAGES[cat],
    ...(vendor.images || []),
  ].filter(Boolean).slice(0, 6);

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <Link href="/marketplace" className="text-sm text-harusi-muted hover:text-harusi-dark flex items-center gap-1">
          ← Back to Marketplace
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left */}
        <div className="space-y-6">
          {/* Image gallery */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden h-72">
            <div className="col-span-2 relative">
              <Image src={allImages[0]} alt={vendor.business_name} fill className="object-cover" sizes="50vw" priority />
            </div>
            <div className="grid grid-rows-2 gap-2">
              {allImages.slice(1, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden">
                  <Image src={img} alt="" fill className="object-cover" sizes="20vw" />
                </div>
              ))}
            </div>
          </div>

          {/* Vendor info */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {vendor.category && <Badge variant="default">{vendor.category.icon} {vendor.category.name}</Badge>}
                  {vendor.is_verified && <Badge variant="gold">✓ Verified</Badge>}
                </div>
                <h1 className="font-serif text-3xl font-bold text-harusi-dark">{vendor.business_name}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <StarRating rating={vendor.rating_avg || 0} size="md" />
                  <span className="text-sm text-harusi-muted">{(vendor.rating_avg || 0).toFixed(1)} · {vendor.rating_count || 0} reviews</span>
                  <span className="text-sm text-stone-400">📍 {vendor.location}</span>
                  {vendor.years_experience > 0 && <span className="text-sm text-stone-400">🏆 {vendor.years_experience} years exp.</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-harusi-muted">Starting from</div>
                <div className="font-serif text-3xl font-bold text-amber-700 tabular-nums">{formatTSH(vendor.base_price)}</div>
              </div>
            </div>
          </div>

          {vendor.description && (
            <Card className="p-6">
              <h2 className="font-serif text-lg font-semibold text-harusi-dark mb-3">About</h2>
              <p className="text-sm text-harusi-muted leading-relaxed">{vendor.description}</p>
            </Card>
          )}

          {/* Services */}
          {services && services.length > 0 && (
            <Card className="p-6">
              <h2 className="font-serif text-lg font-semibold text-harusi-dark mb-4">Service Packages</h2>
              <div className="space-y-3">
                {services.map(s => (
                  <div key={s.id} className="flex items-start justify-between gap-4 p-4 bg-stone-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-sm text-harusi-dark">{s.name}</div>
                      {s.description && <p className="text-xs text-harusi-muted mt-1 leading-relaxed">{s.description}</p>}
                    </div>
                    <div className="font-serif font-bold text-amber-700 text-sm tabular-nums flex-shrink-0">{formatTSH(s.price)}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews */}
          <Card className="p-6">
            <h2 className="font-serif text-lg font-semibold text-harusi-dark mb-4">
              Reviews ({vendor.rating_count || 0})
            </h2>
            {!reviews?.length ? (
              <p className="text-sm text-harusi-muted">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white text-xs font-bold">
                        {r.profile?.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-harusi-dark">{r.profile?.full_name || "Anonymous"}</div>
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-harusi-muted leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right – booking card */}
        <div className="sticky top-24">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="font-serif text-3xl font-bold text-amber-700 tabular-nums">{formatTSH(vendor.base_price)}</div>
              <div className="text-xs text-harusi-muted mt-1">Starting price</div>
            </div>
            {user ? (
              <BookVendorButton vendorId={vendor.id} vendorName={vendor.business_name} basePrice={vendor.base_price} />
            ) : (
              <Link href="/login" className="block w-full text-center py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-700 transition-all">
                Sign in to Book
              </Link>
            )}
            <div className="mt-4 space-y-2 text-xs text-harusi-muted">
              <div className="flex items-center gap-2"><span>✓</span><span>Free to enquire</span></div>
              <div className="flex items-center gap-2"><span>✓</span><span>No booking fees</span></div>
              <div className="flex items-center gap-2"><span>✓</span><span>Direct vendor communication</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
