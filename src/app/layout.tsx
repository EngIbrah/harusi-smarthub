import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Harusi SmartHub – Wedding Planning Platform",
  description: "Tanzania's premier wedding planning platform. Connect with trusted vendors, manage budgets, and plan your perfect day.",
  keywords: "wedding, Tanzania, harusi, wedding planner, vendors, Dar es Salaam",
  openGraph: {
    title: "Harusi SmartHub",
    description: "Plan your perfect Tanzanian wedding",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1C1917",
              color: "#FAFAF8",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "var(--font-dm-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
