/**
 * Supabase Future Backend Adapter & Schema Stub
 * 
 * When ready to connect real Supabase cloud:
 * 1. Install @supabase/supabase-js
 * 2. Populate VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 * 3. Replace local storage calls in RestaurantContext with these async adapters.
 */

/*
SQL Schema for Supabase Migration:

CREATE TABLE tables (
  table_number INT PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  current_order_id TEXT,
  total_loyalty_points INT DEFAULT 0
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  table_number INT REFERENCES tables(table_number),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending_approval',
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  redeemed_points INT DEFAULT 0,
  cgst NUMERIC NOT NULL,
  sgst NUMERIC NOT NULL,
  tip NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  payment_method VARCHAR(20),
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  prep_estimated_minutes INT DEFAULT 15,
  prep_started_at TIMESTAMPTZ,
  prep_elapsed_time_seconds INT DEFAULT 0,
  loyalty_earned INT DEFAULT 0,
  customer_note TEXT
);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  table_number INT,
  order_id TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waiter_calls (
  id TEXT PRIMARY KEY,
  table_number INT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);
*/

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
};

export const supabaseStub = {
  isConfigured: isSupabaseConfigured(),
  note: 'Local fallback active. Connect Supabase credentials in .env to switch to cloud PostgreSQL.',
};
