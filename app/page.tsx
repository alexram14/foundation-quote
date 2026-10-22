"use client";
// "use client" = this page runs in the browser, so it can react instantly to typing.

import { useMemo, useState } from "react";
import { SERVICES, MOBILIZATION_FEE_CENTS } from "@/lib/services.ts";
import { calculateQuote, formatUSD } from "@/lib/quote.ts";

const MARKETS = {
  "Kansas City": 8.5,
  "Dallas–Fort Worth": 8.25,
} as const; // sample default tax rates; the rep can override them
type Market = keyof typeof MARKETS;

export default function QuotePage() {
  const [customer, setCustomer] = useState({ name: "", address: "", rep: "" });
  const [market, setMarket] = useState<Market>("Kansas City");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [discountPercent, setDiscountPercent] = useState("0");
  const [taxPercent, setTaxPercent] = useState(String(MARKETS["Kansas City"]));

  // Recalculate only when inputs change. The math lives in lib/quote.ts.
  const quote = useMemo(
    () =>
      calculateQuote({
        lines: SERVICES.map((s) => ({ serviceId: s.id, quantity: Number(quantities[s.id] || 0) })),
        discountPercent: Number(discountPercent),
        taxPercent: Number(taxPercent),
      }),
    [quantities, discountPercent, taxPercent],
  );

  const today = new Date();
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  function changeMarket(m: Market) {
    setMarket(m);
    setTaxPercent(String(MARKETS[m]));
  }

  return (
    <main className="wrap">
      <header className="top">
        <div>
          <h1>Foundation Quote Builder</h1>
          <p className="muted">Fill in the job, get a price in seconds, print or save as PDF.</p>
        </div>
        <button className="primary no-print" onClick={() => window.print()} disabled={quote.lines.length === 0}>
          Print / Save PDF
        </button>
      </header>

      <section className="card">
        <h2>Customer</h2>
        <div className="grid">
          <label>
            Homeowner name
            <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          </label>
          <label>
            Property address
            <input value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
          </label>
          <label>
            Sales rep
            <input value={customer.rep} onChange={(e) => setCustomer({ ...customer, rep: e.target.value })} />
          </label>
          <label>
            Market
            <select value={market} onChange={(e) => changeMarket(e.target.value as Market)}>
              {Object.keys(MARKETS).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Scope of work</h2>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th className="num col-price">Unit price</th>
              <th className="num">Quantity</th>
              <th className="num">Line total</th>
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((s) => {
              const line = quote.lines.find((l) => l.service.id === s.id);
              return (
                <tr key={s.id} className={line ? "" : "empty-row"}>
                  <td>
                    {s.name}
                    <span className="tag">{s.category}</span>
                    <span className="price-mobile">
                      {formatUSD(s.unitPriceCents)} / {s.unit}
                    </span>
                  </td>
                  <td className="num col-price">
                    {formatUSD(s.unitPriceCents)} / {s.unit}
                  </td>
                  <td className="num">
                    <input
                      className="qty"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={s.wholeUnits ? 1 : 0.5}
                      value={quantities[s.id] ?? ""}
                      placeholder="0"
                      onChange={(e) => setQuantities({ ...quantities, [s.id]: e.target.value })}
                    />
                  </td>
                  <td className="num">{line ? formatUSD(line.totalCents) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card totals">
        <div className="grid two">
          <label>
            Discount %
            <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
          </label>
          <label>
            Sales tax %
            <input type="number" min={0} max={20} step={0.05} value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </label>
        </div>

        {quote.errors.length > 0 && (
          <ul className="errors" role="alert">
            {quote.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        <dl>
          <dt>Mobilization (crew &amp; equipment)</dt>
          <dd>{quote.lines.length ? formatUSD(MOBILIZATION_FEE_CENTS) : "—"}</dd>
          <dt>Subtotal</dt>
          <dd>{formatUSD(quote.subtotalCents)}</dd>
          <dt>Discount</dt>
          <dd>−{formatUSD(quote.discountCents)}</dd>
          <dt>Tax</dt>
          <dd>{formatUSD(quote.taxCents)}</dd>
          <dt className="grand">Total</dt>
          <dd className="grand">{formatUSD(quote.totalCents)}</dd>
        </dl>
      </section>

      <footer className="muted small">
        Prepared {today.toLocaleDateString("en-US")} for {customer.name || "—"}
        {customer.address && ` · ${customer.address}`}
        {customer.rep && ` · Rep: ${customer.rep}`} · Valid until {validUntil.toLocaleDateString("en-US")}
        <br />
        Demo project with sample prices. Not affiliated with any company.
      </footer>
    </main>
  );
}
