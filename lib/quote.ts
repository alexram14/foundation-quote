// Pure quote logic: no React, no database. Easy to test and reuse on the server later.
import { findService, MOBILIZATION_FEE_CENTS, type Service } from "./services.ts";

export interface LineInput {
  serviceId: string;
  quantity: number;
}

export interface QuoteInput {
  lines: LineInput[];
  discountPercent: number; // 0–100
  taxPercent: number; // sales tax rate, e.g. 8.5
}

export interface QuoteLine {
  service: Service;
  quantity: number;
  totalCents: number;
}

export interface QuoteResult {
  lines: QuoteLine[];
  subtotalCents: number; // services + mobilization
  discountCents: number;
  taxCents: number;
  totalCents: number;
  errors: string[];
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const errors: string[] = [];
  const lines: QuoteLine[] = [];

  for (const line of input.lines) {
    const service = findService(line.serviceId);
    if (!service) {
      errors.push(`Unknown service: ${line.serviceId}`);
      continue;
    }
    if (Number.isNaN(line.quantity)) {
      errors.push(`${service.name}: enter a number, like 4 or 10.5`);
      continue;
    }
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) continue; // empty rows are ignored
    if (service.wholeUnits && !Number.isInteger(line.quantity)) {
      errors.push(`${service.name}: quantity must be a whole number`);
      continue;
    }
    lines.push({ service, quantity: line.quantity, totalCents: Math.round(service.unitPriceCents * line.quantity) });
  }

  if (input.discountPercent < 0 || input.discountPercent > 100) errors.push("Discount must be between 0 and 100%");
  if (input.taxPercent < 0 || input.taxPercent > 20) errors.push("Tax rate must be between 0 and 20%");

  const servicesCents = lines.reduce((sum, l) => sum + l.totalCents, 0);
  const subtotalCents = lines.length > 0 ? servicesCents + MOBILIZATION_FEE_CENTS : 0;
  const discount = clamp(input.discountPercent, 0, 100);
  const tax = clamp(input.taxPercent, 0, 20);
  const discountCents = Math.round((subtotalCents * discount) / 100);
  const taxCents = Math.round(((subtotalCents - discountCents) * tax) / 100);

  return {
    lines,
    subtotalCents,
    discountCents,
    taxCents,
    totalCents: subtotalCents - discountCents + taxCents,
    errors,
  };
}

/**
 * Turn what the rep typed into a number. Accepts "10.5" and "10,5" (comma is common in Mexico
 * and on Spanish keyboards). Empty means 0. Anything else returns NaN so it can be reported,
 * instead of being silently turned into another number.
 */
export function parseQuantity(text: string): number {
  const cleaned = text.trim().replace(",", ".");
  if (cleaned === "") return 0;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}

export function formatUSD(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
