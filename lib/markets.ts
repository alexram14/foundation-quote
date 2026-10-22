// Markets the company operates in, with SAMPLE default sales tax rates.
// The rep can override the rate on each quote.
export const MARKETS = {
  "Kansas City": 8.5,
  "Dallas–Fort Worth": 8.25,
} as const;

export type Market = keyof typeof MARKETS;

export function isMarket(value: string): value is Market {
  return Object.hasOwn(MARKETS, value);
}
