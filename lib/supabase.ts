import "server-only"; // this file must never be bundled into browser code
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Keys come from environment variables (set in Vercel and in .env.local), never from the code.
// The publishable key is safe for public use; Row Level Security in Postgres decides what it can do.
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface QuoteRow {
  id: string;
  created_at: string;
  customer_name: string;
  address: string | null;
  sales_rep: string | null;
  market: string;
  lines: { serviceId: string; quantity: number }[];
  discount_percent: number;
  tax_percent: number;
  subtotal_cents: number;
  total_cents: number;
}
