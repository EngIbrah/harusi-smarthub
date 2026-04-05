-- ============================================================
-- Harusi SmartHub – Full Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ───────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('couple', 'vendor', 'admin');
CREATE TYPE vendor_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE plan_mode AS ENUM ('ai', 'manual');

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'couple',
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT DEFAULT '🎊',
  description TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
  ('Venue',        'venue',        '🏛️', 'Wedding halls, gardens, and event spaces', 1),
  ('Catering',     'catering',     '🍽️', 'Food, beverages, and full service catering', 2),
  ('Photography',  'photography',  '📸', 'Photography and videography services', 3),
  ('Decoration',   'decoration',   '✨', 'Floral, lighting, and full venue decoration', 4),
  ('MC / DJ',      'mc-dj',        '🎵', 'Master of ceremonies and music entertainment', 5),
  ('Flowers',      'flowers',      '🌸', 'Fresh floral arrangements and bouquets', 6),
  ('Makeup',       'makeup',       '💄', 'Bridal makeup and beauty services', 7),
  ('Transport',    'transport',    '🚗', 'Wedding car hire and guest transport', 8);

-- ─── VENDORS ─────────────────────────────────────────────────
CREATE TABLE vendors (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id    UUID NOT NULL REFERENCES categories(id),
  business_name  TEXT NOT NULL,
  description    TEXT,
  base_price     NUMERIC(12,2) NOT NULL DEFAULT 0,
  location       TEXT DEFAULT 'Dar es Salaam',
  images         TEXT[] DEFAULT '{}',
  cover_image    TEXT,
  is_verified    BOOLEAN DEFAULT FALSE,
  status         vendor_status DEFAULT 'pending',
  rating_avg     NUMERIC(3,2) DEFAULT 0,
  rating_count   INT DEFAULT 0,
  years_experience INT DEFAULT 0,
  social_links   JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SERVICES ────────────────────────────────────────────────
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id   UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WEDDING PLANS ───────────────────────────────────────────
CREATE TABLE wedding_plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT DEFAULT 'My Wedding',
  wedding_date     DATE,
  guest_count      INT DEFAULT 100,
  total_budget     NUMERIC(12,2) NOT NULL DEFAULT 0,
  mode             plan_mode DEFAULT 'manual',
  allocation_json  JSONB DEFAULT '{}',
  notes            TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BOOKINGS ────────────────────────────────────────────────
CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id       UUID NOT NULL REFERENCES wedding_plans(id) ON DELETE CASCADE,
  vendor_id     UUID NOT NULL REFERENCES vendors(id),
  service_id    UUID REFERENCES services(id),
  couple_id     UUID NOT NULL REFERENCES profiles(id),
  status        booking_status DEFAULT 'pending',
  agreed_price  NUMERIC(12,2),
  event_date    DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(id),
  couple_id   UUID NOT NULL REFERENCES profiles(id),
  vendor_id   UUID NOT NULL REFERENCES vendors(id),
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FUNCTION: auto-create profile on signup ─────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'couple'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── FUNCTION: update vendor rating ──────────────────────────
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors SET
    rating_avg   = (SELECT AVG(rating) FROM reviews WHERE vendor_id = NEW.vendor_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = NEW.vendor_id)
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own profile, admins see all
CREATE POLICY "profiles_self"   ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_admin"  ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories: anyone can read
CREATE POLICY "categories_read" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Vendors: public read for active, vendors manage own, admins manage all
CREATE POLICY "vendors_read"   ON vendors FOR SELECT USING (status = 'active' OR profile_id = auth.uid());
CREATE POLICY "vendors_self"   ON vendors FOR ALL   USING (profile_id = auth.uid());
CREATE POLICY "vendors_admin"  ON vendors FOR ALL   USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Services: public read, vendor manage own
CREATE POLICY "services_read"  ON services FOR SELECT USING (TRUE);
CREATE POLICY "services_self"  ON services FOR ALL USING (
  vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Wedding plans: couples see own
CREATE POLICY "plans_self" ON wedding_plans FOR ALL USING (couple_id = auth.uid());
CREATE POLICY "plans_admin" ON wedding_plans FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings: couples and vendors see their own
CREATE POLICY "bookings_couple" ON bookings FOR ALL USING (couple_id = auth.uid());
CREATE POLICY "bookings_vendor" ON bookings FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "bookings_vendor_update" ON bookings FOR UPDATE USING (
  vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "bookings_admin" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews: public read, couple write own
CREATE POLICY "reviews_read"   ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_write"  ON reviews FOR INSERT  WITH CHECK (couple_id = auth.uid());

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_vendors_category   ON vendors(category_id);
CREATE INDEX idx_vendors_status     ON vendors(status);
CREATE INDEX idx_bookings_couple    ON bookings(couple_id);
CREATE INDEX idx_bookings_vendor    ON bookings(vendor_id);
CREATE INDEX idx_bookings_plan      ON bookings(plan_id);
CREATE INDEX idx_plans_couple       ON wedding_plans(couple_id);




--------------------------------------------------


-- Add payment tracking to bookings
ALTER TABLE bookings 
ADD COLUMN payment_status TEXT DEFAULT 'unpaid',
ADD CONSTRAINT valid_payment_status 
    CHECK (payment_status IN ('unpaid', 'deposit_paid', 'fully_paid'));

-- Prevent double-booking: Only one 'confirmed' booking per vendor per date
CREATE UNIQUE INDEX idx_prevent_double_booking 
ON bookings (vendor_id, event_date) 
WHERE (status = 'confirmed');



-- Add a running total for budget spent
ALTER TABLE wedding_plans 
ADD COLUMN budget_spent NUMERIC(12,2) DEFAULT 0;

-- Function to sync wedding plan budget when a booking is confirmed or price changes
CREATE OR REPLACE FUNCTION sync_plan_budget()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wedding_plans
  SET budget_spent = (
    SELECT COALESCE(SUM(agreed_price), 0) 
    FROM bookings 
    WHERE plan_id = COALESCE(NEW.plan_id, OLD.plan_id) 
    AND status = 'confirmed'
  )
  WHERE id = COALESCE(NEW.plan_id, OLD.plan_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_booking_budget_change
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION sync_plan_budget();


-- Add constraint to reviews: must be a completed booking
-- Note: This requires a trigger because it checks a value in a related table
CREATE OR REPLACE FUNCTION validate_review_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT status FROM bookings WHERE id = NEW.booking_id) != 'completed' THEN
        RAISE EXCEPTION 'You can only review a service after the booking is marked as completed.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_review_status
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION validate_review_status();


-- Drop the old trigger first
DROP TRIGGER IF EXISTS on_review_created ON reviews;

-- Updated function to handle NEW and OLD (for deletes)
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_id UUID;
BEGIN
    v_id := COALESCE(NEW.vendor_id, OLD.vendor_id);
    
    UPDATE vendors SET
      rating_avg   = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE vendor_id = v_id),
      rating_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = v_id)
    WHERE id = v_id;
    
    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();


-- Performance for the marketplace filters
CREATE INDEX IF NOT EXISTS idx_vendors_price_range ON vendors(base_price);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_vendors_location_city ON vendors(location);

ALTER TABLE profiles ADD COLUMN is_onboarded BOOLEAN DEFAULT FALSE;

UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    -- Ensure the role is valid or default to 'couple'
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role') IN ('couple', 'vendor', 'admin') 
      THEN (NEW.raw_user_meta_data->>'role')::user_role 
      ELSE 'couple'::user_role 
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- 1. Drop the problematic circular policies
DROP POLICY IF EXISTS "profiles_admin" ON profiles;
DROP POLICY IF EXISTS "categories_admin" ON categories;
DROP POLICY IF EXISTS "vendors_admin" ON vendors;
DROP POLICY IF EXISTS "plans_admin" ON wedding_plans;
DROP POLICY IF EXISTS "bookings_admin" ON bookings;

-- 2. Use a more efficient check for Admin
-- We check the JWT (auth.jwt()) metadata instead of querying the table again
CREATE POLICY "profiles_admin" ON profiles FOR SELECT USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "categories_admin" ON categories FOR ALL USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "vendors_admin" ON vendors FOR ALL USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "plans_admin" ON wedding_plans FOR SELECT USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "bookings_admin" ON bookings FOR ALL USING (
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
);



-- 1. Update the Profile table (This controls what the app sees)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'PASTE_YOUR_UUID_HERE';

-- 2. Update the Auth metadata (This controls RLS and JWT-based permissions)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE id = 'PASTE_YOUR_UUID_HERE';




ALTER TABLE wedding_plans 
ADD COLUMN IF NOT EXISTS ai_strategy_notes TEXT,
ADD COLUMN IF NOT EXISTS market_comparison_json JSONB,
ADD COLUMN IF NOT EXISTS priority_focus VARCHAR(50) DEFAULT 'balanced';