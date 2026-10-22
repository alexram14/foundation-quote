// Service catalog. Prices are SAMPLE values in USD cents, for demo only.
// Money is stored in cents (integers) to avoid floating-point rounding errors.

export type Unit = "pier" | "anchor" | "strap" | "crack" | "linear ft" | "sq ft" | "each";

export interface Service {
  id: string;
  name: string;
  category: "Foundation" | "Walls" | "Waterproofing" | "Crawl space";
  unit: Unit;
  unitPriceCents: number;
  /** true when the quantity must be a whole number (you can't install half a pier) */
  wholeUnits: boolean;
}

export const SERVICES: Service[] = [
  { id: "push-pier", name: "Steel push pier", category: "Foundation", unit: "pier", unitPriceCents: 145000, wholeUnits: true },
  { id: "helical-pier", name: "Helical pier", category: "Foundation", unit: "pier", unitPriceCents: 165000, wholeUnits: true },
  { id: "wall-anchor", name: "Wall anchor", category: "Walls", unit: "anchor", unitPriceCents: 75000, wholeUnits: true },
  { id: "carbon-strap", name: "Carbon fiber wall strap", category: "Walls", unit: "strap", unitPriceCents: 55000, wholeUnits: true },
  { id: "crack-injection", name: "Polyurethane crack injection", category: "Walls", unit: "crack", unitPriceCents: 45000, wholeUnits: true },
  { id: "drain-tile", name: "Interior drain tile", category: "Waterproofing", unit: "linear ft", unitPriceCents: 6500, wholeUnits: false },
  { id: "sump-pump", name: "Sump pump installation", category: "Waterproofing", unit: "each", unitPriceCents: 120000, wholeUnits: true },
  { id: "encapsulation", name: "Crawl space encapsulation", category: "Crawl space", unit: "sq ft", unitPriceCents: 550, wholeUnits: false },
];

/** Flat fee charged once per job to bring crew and equipment to the site. */
export const MOBILIZATION_FEE_CENTS = 35000;

export function findService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
