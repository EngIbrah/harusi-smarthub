import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatTSH, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils"; // Added cn import
import { Badge, StarRating, Card, SectionHeader, Empty } from "@/components/ui";
import { Calendar, MessageSquare, Clock, CheckCircle2, XCircle, Info, ArrowRight } from "lucide-react";

// Updated to match your valid Badge variants: "gold" | "default" | "success" | "warning" | "danger" | "info"
const STATUS_CONFIG = {
  pending:   { label: "Pending",   variant: "warning" as const, icon: Clock, color: "text-amber-600" },
  confirmed: { label: "Confirmed", variant: "success" as const, icon: CheckCircle2, color: "text-emerald-600" },
  cancelled: { label: "danger",  variant: "danger"  as const, icon: XCircle, color: "text-red-600" },
  completed: { label: "Completed", variant: "info"    as const, icon: Info, color: "text-brand-tanzanite" },
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, vendor:vendors(*, category:categories(*)), plan:wedding_plans(*)")
    .eq("couple_id", user.id)
    .order("created_at", { ascending: false });

  const grouped = {
    pending:   bookings?.filter(b => b.status === "pending")   || [],
    confirmed: bookings?.filter(b => b.status === "confirmed") || [],
    completed: bookings?.filter(b => b.status === "completed") || [],
    cancelled: bookings?.filter(b => b.status === "cancelled") || [],
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <SectionHeader
        title="My Bookings"
        subtitle="Manage your wedding dream team and tracking service statuses."
      />

      {!bookings?.length ? (
        <Empty 
          icon="📅" 
          title="Your itinerary is empty"
          description="You haven't booked any vendors yet. Let's find the perfect venue or photographer to get started."
          action={
            <Link href="/marketplace" className="px-8 py-3 bg-brand-tanzanite text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-tanzanite/20 hover:bg-brand-tanzanite/90 transition-all">
              Explore Marketplace
            </Link>
          }
        />
      ) : (
        <div className="space-y-12">
          {(Object.entries(grouped) as [string, any[]][]).map(([status, items]) => {
            if (!items?.length) return null;
            const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
            const StatusIcon = cfg.icon;

            return (
              <div key={status} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-brand-ebony/5 pb-2">
                  <StatusIcon className={cn("w-5 h-5", cfg.color)} />
                  <h3 className="font-serif text-2xl font-bold text-brand-ebony">{cfg.label}</h3>
                  <Badge variant={cfg.variant} className="rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-none">
                    {items.length} {items.length === 1 ? 'Booking' : 'Bookings'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {items.map(b => {
                    const cat = b.vendor?.category?.slug || "venue";
                    const imgSrc = b.vendor?.cover_image || b.vendor?.images?.[0] || VENDOR_PLACEHOLDER_IMAGES[cat] || VENDOR_PLACEHOLDER_IMAGES.venue;
                    
                    return (
                      <Card key={b.id} className="group relative p-0 overflow-hidden hover:shadow-2xl hover:shadow-brand-ebony/10 transition-all duration-500 border-brand-ebony/5 bg-white">
                        <div className="flex flex-col sm:flex-row h-full">
                          {/* Image Section - Matches the centering logic from VendorDetail */}
                          <div className="relative w-full sm:w-40 h-48 sm:h-auto overflow-hidden bg-brand-cloud">
                            <Image 
                              src={imgSrc} 
                              alt={b.vendor?.business_name || ""} 
                              fill 
                              className="object-cover object-center group-hover:scale-110 transition-transform duration-700" 
                              sizes="(max-width: 640px) 100vw, 160px" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-ebony/60 to-transparent sm:hidden pointer-events-none" />
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="default" className="text-[9px] uppercase tracking-widest font-bold border border-brand-ebony/10 bg-transparent text-brand-ebony/60 shadow-none">
                                  {b.vendor?.category?.name}
                                </Badge>
                                <div className="text-right tabular-nums">
                                  <div className="font-serif font-bold text-brand-tanzanite text-lg leading-none">
                                    {formatTSH(b.agreed_price || b.vendor?.base_price || 0)}
                                  </div>
                                </div>
                              </div>

                              <h4 className="font-bold text-brand-ebony text-lg group-hover:text-brand-tanzanite transition-colors truncate">
                                {b.vendor?.business_name}
                              </h4>

                              <div className="flex items-center gap-2 mt-1 mb-4">
                                <StarRating rating={b.vendor?.rating_avg || 0} size="sm" />
                                <span className="text-[10px] text-brand-ebony/40 font-bold uppercase tracking-tighter">
                                  {b.vendor?.rating_count || 0} Reviews
                                </span>
                              </div>

                              <div className="space-y-2">
                                {b.event_date && (
                                  <div className="flex items-center gap-2 text-xs text-brand-ebony/60 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                                    {new Date(b.event_date).toLocaleDateString("en-TZ", { dateStyle: "long" })}
                                  </div>
                                )}
                                {b.notes && (
                                  <div className="flex items-start gap-2 text-xs text-brand-ebony/40 italic line-clamp-1">
                                    <MessageSquare className="w-3.5 h-3.5 mt-0.5" />
                                    "{b.notes}"
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-brand-ebony/5 flex items-center justify-between">
                               <span className="text-[9px] text-brand-ebony/30 font-bold uppercase tracking-widest">
                                 Ref: #{b.id.split('-')[0]}
                               </span>
                               <Link 
                                 href={`/marketplace/${b.vendor?.id}`} 
                                 className="flex items-center gap-1 text-[10px] font-bold text-brand-tanzanite uppercase tracking-widest hover:translate-x-1 transition-transform"
                               >
                                 Details <ArrowRight className="w-3 h-3" />
                               </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}