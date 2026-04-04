# 💍 Harusi SmartHub

> Tanzania's premier wedding planning platform — connecting couples with trusted vendors through intelligent budgeting, real-time tracking, and a verified marketplace.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

---

## 📦 Installation

### 1. Clone / Extract & Install
```bash
# Navigate to project folder
cd harusi-smarthub

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **Settings → API** and copy your:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

3. Go to **SQL Editor** and run the full schema:
   - Open `supabase/schema.sql`
   - Paste the entire contents into the SQL Editor
   - Click **Run**

4. Enable **Google OAuth** (optional):
   - Go to **Authentication → Providers → Google**
   - Add your Google OAuth credentials

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and fill in your values
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
harusi-smarthub/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register pages
│   │   ├── (couple)/            # Dashboard, Planner, Marketplace, Bookings
│   │   ├── (vendor)/            # Vendor Dashboard, Profile, Services, Bookings
│   │   ├── (admin)/             # Admin Panel (Overview, Vendors, Users, Categories)
│   │   ├── api/                 # Next.js API Routes
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── ui/                  # Shared UI: Button, Input, Badge, Card, Modal...
│   │   ├── layout/              # Navbar
│   │   └── marketplace/         # BookVendorButton
│   ├── hooks/                   # useAuth, useBudget, useVendors
│   ├── lib/
│   │   ├── supabase/            # client.ts, server.ts
│   │   └── utils.ts             # formatTSH, generateBudget, helpers
│   ├── middleware.ts             # RBAC route protection
│   └── types/index.ts           # TypeScript types
└── supabase/
    └── schema.sql               # Full DB schema with RLS policies
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Couple** | Dashboard, Planner (AI + Manual), Marketplace, Bookings |
| **Vendor** | Vendor Dashboard, Profile, Services, Booking Management |
| **Admin** | Full platform: Users, Vendors (approve/suspend), Categories |

---

## 🗺️ Key Pages

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero + gallery |
| `/login` | Email + Google OAuth login |
| `/register` | Role selection (Couple / Vendor) + signup |

### Couple (protected)
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview: budget status, recent bookings, tips |
| `/planner` | AI Mode (auto-allocate) + Manual Mode + vendor selection |
| `/marketplace` | Searchable vendor marketplace with category filters |
| `/marketplace/[id]` | Vendor detail page with gallery, services, reviews, booking |
| `/bookings` | All bookings with status tracking |

### Vendor (protected)
| Route | Description |
|-------|-------------|
| `/vendor/dashboard` | KPIs, trust profile, recent bookings |
| `/vendor/profile` | Edit business info, category, location, pricing |
| `/vendor/services` | Add/edit/pause service packages |
| `/vendor/bookings` | Confirm, decline, complete booking requests |

### Admin (protected)
| Route | Description |
|-------|-------------|
| `/admin` | Platform stats + recent activity |
| `/admin/vendors` | Approve, suspend, delete vendors |
| `/admin/users` | View all users, change roles |
| `/admin/categories` | Add/edit/hide vendor categories |

---

## 🔌 Connecting Supabase

### Make yourself an Admin

After registering your first account, run this in the Supabase SQL editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR-USER-UUID-HERE';
```

Get your UUID from: **Authentication → Users** in Supabase dashboard.

---

## 🌄 Image Setup

The platform uses **Unsplash** for placeholder wedding imagery (no API key needed — direct image URLs).

For real vendor photo uploads, configure **Cloudinary**:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🚢 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## 📱 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Styling | Tailwind CSS |
| UI Components | Custom (Button, Input, Card, Modal, Badge...) |
| Fonts | Cormorant Garamond + DM Sans |
| Images | next/image + Unsplash |
| Notifications | Sonner (toast) |
| State | React hooks + Supabase real-time |

---

## 🔧 Adding Vendors via Admin

1. Sign in as admin
2. Go to `/admin/categories` — verify categories exist
3. Go to `/admin/vendors` — vendors who register appear here as "pending"
4. Click **Approve** to activate a vendor

---

## 🌍 Future Enhancements

- [ ] M-Pesa / Airtel Money payment integration
- [ ] Real-time chat between couples and vendors
- [ ] Vendor analytics charts (recharts)
- [ ] Email notifications (Resend or SendGrid)
- [ ] Vendor image gallery uploads (Cloudinary)
- [ ] Mobile app (React Native)
- [ ] AI recommendations (OpenAI GPT-4)

---

## 🇹🇿 Built for Tanzania

Harusi SmartHub is designed specifically for the Tanzanian wedding market — with TSH currency formatting, local vendor categories, and Swahili-appropriate terminology.

---

*Made with 💍 for beautiful Tanzanian weddings*
