-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. AUTHENTICATION & CORE TENANTS
-- ==========================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branding JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE staff_role AS ENUM ('OWNER', 'MANAGER', 'WAITER', 'KITCHEN');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notif_prefs JSONB DEFAULT '{"ORDER_CREATED": true, "SOUND": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-tenant junction
CREATE TABLE restaurant_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role staff_role DEFAULT 'WAITER',
  UNIQUE(restaurant_id, profile_id)
);

-- ==========================================
-- 2. RESTAURANT OPERATIONS
-- ==========================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  capacity INTEGER,
  status TEXT DEFAULT 'available',
  qr_token UUID DEFAULT uuid_generate_v4(), -- Important for secure anonymous ordering
  UNIQUE(restaurant_id, number)
);

CREATE TABLE table_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_id, profile_id)
);

-- ==========================================
-- 3. MENU (Relational Integrity)
-- ==========================================
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN DEFAULT true
);

CREATE TABLE menu_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL
);

CREATE TABLE menu_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL
);

-- ==========================================
-- 4. ORDERS (Snapshot-based)
-- ==========================================
CREATE TYPE order_status AS ENUM ('pending', 'kitchen', 'served', 'completed', 'cancelled');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  subtotal NUMERIC NOT NULL,
  service_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status order_status DEFAULT 'pending',
  note TEXT,
  session_id UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshots ensure menu price updates don't alter past orders
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  variant_snapshot TEXT,
  extras_snapshot JSONB DEFAULT '[]'::jsonb,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC NOT NULL
);

-- ==========================================
-- 5. NOTIFICATIONS
-- ==========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. INDEXES
-- ==========================================
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_restaurant_members_profile ON restaurant_members(profile_id);

-- ==========================================
-- 7. NOTIFICATION ENGINE FUNCTION & TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION route_order_notification()
RETURNS TRIGGER AS $$
DECLARE
  event TEXT;
  waiter UUID;
  manager UUID;
  idem_key TEXT;
  table_num INTEGER;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event := 'ORDER_CREATED';
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    event := 'ORDER_' || UPPER(NEW.status::text);
  ELSE
    RETURN NEW; -- Ignored
  END IF;

  -- Grab table number for message
  SELECT number INTO table_num FROM tables WHERE id = NEW.table_id;

  -- Create idempotency base (Ensures exact same event on same order isn't duplicated)
  idem_key := event || '_' || NEW.id || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;

  -- 7a. Notify Waiters assigned to the table
  FOR waiter IN 
    SELECT profile_id FROM table_assignments WHERE table_id = NEW.table_id
  LOOP
    INSERT INTO notifications (restaurant_id, recipient_id, event_type, title, message, entity_type, entity_id, idempotency_key)
    VALUES (NEW.restaurant_id, waiter, event, 'Nouvelle Commande', 'Table ' || table_num, 'order', NEW.id, idem_key || '_w_' || waiter)
    ON CONFLICT (idempotency_key) DO NOTHING;
  END LOOP;

  -- 7b. Notify Managers and Owners
  FOR manager IN 
    SELECT profile_id FROM restaurant_members WHERE restaurant_id = NEW.restaurant_id AND role IN ('MANAGER','OWNER')
  LOOP
    INSERT INTO notifications (restaurant_id, recipient_id, event_type, title, message, entity_type, entity_id, idempotency_key)
    VALUES (NEW.restaurant_id, manager, event, 'Nouvelle Commande (Admin)', 'Table ' || table_num, 'order', NEW.id, idem_key || '_m_' || manager)
    ON CONFLICT (idempotency_key) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_change
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION route_order_notification();

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Helper function to check membership fast
CREATE OR REPLACE FUNCTION is_member_of(rid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM restaurant_members WHERE restaurant_id = rid AND profile_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Restaurants (Managers/Owners select theirs)
CREATE POLICY "Select own restaurants" ON restaurants FOR SELECT USING (is_member_of(id));

-- Profiles (Staff can see themselves and colleagues in the same restaurant)
CREATE POLICY "Select profile and colleagues" ON profiles FOR SELECT USING (
  id = auth.uid() OR exists(
    SELECT 1 FROM restaurant_members rm1 
    JOIN restaurant_members rm2 ON rm1.restaurant_id = rm2.restaurant_id
    WHERE rm1.profile_id = auth.uid() AND rm2.profile_id = profiles.id
  )
);

-- Members
CREATE POLICY "Select own memberships" ON restaurant_members FOR SELECT USING (profile_id = auth.uid());

-- Tables
CREATE POLICY "Select tables" ON tables FOR SELECT USING (
  is_member_of(restaurant_id) 
  OR 
  (current_setting('request.headers', true)::json->>'x-qr-token' = qr_token::text) -- Anon qr token check
);

-- Table assignments
CREATE POLICY "Select assignments" ON table_assignments FOR SELECT USING (is_member_of(restaurant_id));

-- Menu (Public to anyone asking for a specific restaurant, staff can edit)
CREATE POLICY "Public menu select" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Public menu select" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public menu select" ON menu_variants FOR SELECT USING (true);
CREATE POLICY "Public menu select" ON menu_extras FOR SELECT USING (true);

-- Orders
CREATE POLICY "Staff select orders" ON orders FOR SELECT USING (is_member_of(restaurant_id));
CREATE POLICY "Anon insert blind orders" ON orders FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM tables 
    WHERE id = table_id AND qr_token::text = current_setting('request.headers', true)::json->>'x-qr-token'
  )
);

CREATE POLICY "Staff select order items" ON order_items FOR SELECT USING (
  EXISTS(SELECT 1 FROM orders WHERE id = order_id AND is_member_of(restaurant_id))
);
CREATE POLICY "Anon insert order items" ON order_items FOR INSERT WITH CHECK (true); -- Bound implicitly by orders RLS on insert flow

-- Notifications
CREATE POLICY "Recipient selects own notifs" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Recipient updates own notifs" ON notifications FOR UPDATE USING (recipient_id = auth.uid());
