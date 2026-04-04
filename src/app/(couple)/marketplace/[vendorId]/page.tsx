import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatTSH, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils";
import { Badge, StarRating, Card, Button } from "@/components/ui";
import BookVendorButton from "@/components/marketplace/BookVendorButton";
import { ChevronLeft, MapPin, Award, ShieldCheck, CheckCircle2, MessageSquare, Info } from "lucide-react";

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
  ].filter(Boolean).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Navigation */}
      <div className="mb-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-ebony/40 hover:text-brand-tanzanite transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-10 items-start">
        
        {/* LEFT COLUMN: CONTENT */}
        <div className="space-y-10 min-w-0">
          
          {/* 1. LUXURY GALLERY */}
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[300px] sm:h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="col-span-3 row-span-2 relative group overflow-hidden">
              <Image 
                src={allImages[0]} 
                alt={vendor.business_name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000" 
                priority 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="col-span-1 grid grid-rows-2 gap-3">
              {allImages.slice(1, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden group">
                  <Image src={img} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>

          {/* 2. VENDOR IDENTITY */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-brand-ebony/5 pb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {vendor.category && (
                    <Badge className="bg-brand-tanzanite/10 text-brand-tanzanite border-none text-[10px] font-black tracking-widest px-3 py-1">
                      {vendor.category.icon} {vendor.category.name}
                    </Badge>
                  )}
                  {vendor.is_verified && (
                    <Badge className="bg-brand-gold text-brand-ebony border-none text-[10px] font-black tracking-widest px-3 py-1">
                      <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED
                    </Badge>
                  )}
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-ebony tracking-tight">
                  {vendor.business_name}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                  <div className="flex items-center gap-2">
                    <StarRating rating={vendor.rating_avg || 0} size="sm" />
                    <span className="text-xs font-bold text-brand-ebony/60">
                      {(vendor.rating_avg || 0).toFixed(1)} ({(vendor.rating_count || 0)} Reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-ebony/40 font-bold text-[10px] uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 text-brand-tanzanite" /> {vendor.location}
                  </div>
                  {vendor.years_experience > 0 && (
                    <div className="flex items-center gap-1.5 text-brand-ebony/40 font-bold text-[10px] uppercase tracking-widest">
                      <Award className="w-3.5 h-3.5 text-brand-gold" /> {vendor.years_experience} Years Excellence
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. ABOUT SECTION */}
          {vendor.description && (
            <section>
              <h2 className="font-serif text-2xl font-bold text-brand-ebony mb-4 flex items-center gap-3">
                <Info className="w-5 h-5 text-brand-gold" /> The Experience
              </h2>
              <div className="prose prose-stone max-w-none">
                <p className="text-brand-ebony/60 leading-relaxed text-sm sm:text-base font-medium">
                  {vendor.description}
                </p>
              </div>
            </section>
          )}

          {/* 4. SERVICE PACKAGES (MENU STYLE) */}
          {services && services.length > 0 && (
            <section className="bg-brand-cloud rounded-[2.5rem] p-8 sm:p-10 border border-brand-ebony/5">
              <h2 className="font-serif text-2xl font-bold text-brand-ebony mb-8">Service Packages</h2>
              <div className="grid gap-4">
                {services.map(s => (
                  <div key={s.id} className="group flex items-start justify-between gap-6 p-6 bg-white rounded-2xl border border-transparent hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-300">
                    <div className="space-y-1">
                      <h4 className="font-bold text-brand-ebony group-hover:text-brand-tanzanite transition-colors">{s.name}</h4>
                      {s.description && <p className="text-xs text-brand-ebony/40 leading-relaxed max-w-md">{s.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-brand-ebony/20 uppercase tracking-widest block mb-1">Package Price</span>
                      <span className="font-serif font-black text-brand-gold text-lg">{formatTSH(s.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. REVIEWS */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-brand-ebony mb-8 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-brand-tanzanite" /> Client Stories
            </h2>
            {!reviews?.length ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-brand-ebony/10">
                <p className="text-sm text-brand-ebony/30 font-bold uppercase tracking-widest">Be the first to share your experience</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reviews.map(r => (
                  <Card key={r.id} className="p-6 border-none bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-brand-ebony flex items-center justify-center text-brand-gold text-sm font-black border-2 border-brand-gold/20">
                        {r.profile?.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-brand-ebony">{r.profile?.full_name || "Guest User"}</div>
                        <StarRating rating={r.rating} size="sm" />
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-brand-ebony/60 italic leading-relaxed">"{r.comment}"</p>}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: BOOKING (STICKY) */}
        <div className="relative">
          <div className="xl:sticky xl:top-24">
            <Card className="p-8 border-none bg-brand-ebony text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl -mr-10 -mt-10" />
              
              <div className="relative z-10">
                <div className="text-center mb-8 pb-8 border-b border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block mb-2">Investment Starts At</span>
                  <div className="font-serif text-4xl font-bold text-brand-gold tabular-nums">{formatTSH(vendor.base_price)}</div>
                </div>

                <div className="space-y-4">
                  {user ? (
                    <BookVendorButton 
                      vendorId={vendor.id} 
                      vendorName={vendor.business_name} 
                      basePrice={vendor.base_price} 
                    />
                  ) : (
                    <Link href="/login" className="w-full py-7 bg-brand-gold text-brand-ebony font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2">
                      Authenticate to Reserve
                    </Link>
                  )}
                  
                  <div className="pt-6 space-y-3">
                    {[
                      "Complimentary Consultation",
                      "Standard Service Agreement",
                      "Direct Vendor Messaging"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold/60" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-center text-white/30 font-medium leading-relaxed uppercase tracking-tight">
                    Secure your date today. Our concierge team handles all logistics after your initial booking request.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}