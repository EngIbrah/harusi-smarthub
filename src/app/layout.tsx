import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

// We'll keep the metadata professional but culturally resonant
export const metadata: Metadata = {
  title: {
    default: "Harusi SmartHub | Tanzania's Modern Wedding Planner",
    template: "%s | Harusi SmartHub"
  },
  description: "Experience the art of Tanzanian wedding planning. Connect with verified vendors, manage your budget, and orchestrate your perfect day in Dar es Salaam and beyond.",
  keywords: ["wedding planner Tanzania", "Harusi SmartHub", "Tanzanian vendors", "wedding budget app"],
  openGraph: {
    title: "Harusi SmartHub",
    description: "The modern way to plan your Tanzanian wedding.",
    type: "website",
    locale: "en_TZ",
  },
};

export const viewport: Viewport = {
  themeColor: "#F0EDE5", // Cloud Dancer
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen selection:bg-brand-tanzanite/10 selection:text-brand-tanzanite">
        {/* Subtle texture overlay for a premium 'paper' feel */}
        <div className="fixed inset-0 pointer-events-none bg-grain opacity-[0.03] z-[9999]" aria-hidden="true" />
        
        <main className="relative flex flex-col min-h-screen">
          {children}
        </main>

        <Toaster
          position="bottom-right" // Often better for mobile users in TZ
          expand={false}
          richColors
          toastOptions={{
            style: {
              background: "#2B2B2B", // Brand Ebony
              color: "#F0EDE5",      // Cloud Dancer
              border: "1px solid rgba(197, 160, 89, 0.2)", // Subtle Savannah Gold border
              borderRadius: "1rem",
              fontFamily: "var(--font-dm-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}