import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Updated to your Tanzanite & Savannah Gold palette
        brand: {
          tanzanite: "#4F5285", // Primary actions
          gold:      "#C5A059", // Premium/Verified
          hibiscus:  "#D23641", // CTAs/Passion
          sage:      "#87A96B", // Success
          ebony:     "#2B2B2B", // Deep text
          cloud:     "#F0EDE5", // Soft background
        },
        harusi: {
          // Maintaining 'harusi' key but updating values to match new vibe
          dark:    "#2B2B2B",
          darker:  "#1A1A1A",
          gold:    "#C5A059",
          cream:   "#F0EDE5",
          muted:   "#6B6B6B",
          border:  "#E5E1D8", // Lighter, more elegant border
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease-out forwards",
        "fade-in":    "fadeIn 0.4s ease-out forwards",
        "shimmer":    "shimmer 2s linear infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseSoft: { "0%,100%": { opacity: "0.8" }, "50%": { opacity: "1" } },
      },
    },
  },
  plugins: [],
};
export default config;