import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { formatTSH, VENDOR_PLACEHOLDER_IMAGES } from "@/lib/utils";
import { Badge, StarRating, Card, SectionHeader, Empty } from "@/components/ui";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   variant: "warning" as const },
  confirmed: { label: "Confirmed", variant: "success" as const },
  cancelled: { label: "Cancelled", variant: "danger"  as const },
  completed: { label: "Completed", variant: "info"    as const },
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
    <div className="animate-fade-in">
      <SectionHeader
        title="My Bookings"
        subtitle="Track all your vendor bookings and their status."
      />

      {!bookings?.length ? (
        <Empty icon="📅" title="No bookings yet"
          description="Browse our marketplace and book your first vendor."
          action={<a href="/marketplace" className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-semibold text-sm">Browse Vendors</a>}
        />
      ) : (
        <div className="space-y-8">
          {(Object.entries(grouped) as [string, typeof bookings][]).map(([status, items]) => {
            if (!items?.length) return null;
            const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-serif text-lg font-semibold text-harusi-dark">{cfg.label}</h3>
                  <Badge variant={cfg.variant} className="text-xs">{items.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {items.map(b => {
                    const cat = b.vendor?.category?.slug || "venue";
                    const imgSrc = b.vendor?.cover_image || b.vendor?.images?.[0] || VENDOR_PLACEHOLDER_IMAGES[cat] || VENDOR_PLACEHOLDER_IMAGES.venue;
                    return (
                      <Card key={b.id} className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                            <Image src={imgSrc} alt={b.vendor?.business_name || ""} fill className="object-cover" sizes="64px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-semibold text-harusi-dark text-sm">{b.vendor?.business_name}</h4>
                              {b.vendor?.category && <Badge variant="default" className="text-[10px]">{b.vendor.category.icon} {b.vendor.category.name}</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <StarRating rating={b.vendor?.rating_avg || 0} />
                              <span className="text-xs text-harusi-muted">({b.vendor?.rating_count || 0})</span>
                            </div>
                            {b.event_date && (
                              <p className="text-xs text-stone-400 mt-1">📅 {new Date(b.event_date).toLocaleDateString("en-TZ", { dateStyle: "long" })}</p>
                            )}
                            {b.notes && <p className="text-xs text-stone-400 mt-1 line-clamp-1">💬 {b.notes}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-serif font-bold text-amber-700 text-base tabular-nums">{formatTSH(b.agreed_price || b.vendor?.base_price || 0)}</div>
                            <Badge variant={cfg.variant} className="mt-1 text-[10px]">{cfg.label}</Badge>
                            <div className="text-[10px] text-stone-400 mt-1">{new Date(b.created_at).toLocaleDateString()}</div>
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
