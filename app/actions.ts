"use server";
// Server Action: runs on the server, not in the browser.
// The browser sends what the rep typed; the server recalculates the price itself,
// so nobody can save a quote with a tampered total.

import { calculateQuote, type LineInput } from "@/lib/quote.ts";
import { isMarket } from "@/lib/markets.ts";
import { getSupabase } from "@/lib/supabase.ts";

export interface SaveQuoteInput {
  customerName: string;
  address: string;
  salesRep: string;
  market: string;
  lines: LineInput[];
  discountPercent: number;
  taxPercent: number;
}

export type SaveQuoteResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveQuote(input: SaveQuoteInput): Promise<SaveQuoteResult> {
  const customerName = input.customerName.trim();
  if (!customerName) return { ok: false, error: "Add the homeowner's name before saving." };
  if (customerName.length > 120) return { ok: false, error: "Homeowner name is too long." };
  if (!isMarket(input.market)) return { ok: false, error: "Unknown market." };

  const quote = calculateQuote({
    lines: input.lines,
    discountPercent: input.discountPercent,
    taxPercent: input.taxPercent,
  });
  if (quote.errors.length > 0) return { ok: false, error: quote.errors[0] };
  if (quote.lines.length === 0) return { ok: false, error: "Add at least one service before saving." };

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "Saving is not configured yet (missing Supabase keys)." };

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      customer_name: customerName,
      address: input.address.trim().slice(0, 200) || null,
      sales_rep: input.salesRep.trim().slice(0, 80) || null,
      market: input.market,
      // store only what was quoted, in a stable shape
      lines: quote.lines.map((l) => ({ serviceId: l.service.id, quantity: l.quantity })),
      discount_percent: input.discountPercent,
      tax_percent: input.taxPercent,
      subtotal_cents: quote.subtotalCents,
      total_cents: quote.totalCents,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("saveQuote failed", error);
    return { ok: false, error: "Could not save the quote. Please try again." };
  }
  return { ok: true, id: data.id };
}
