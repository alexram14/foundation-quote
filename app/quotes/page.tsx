// Saved quotes list. This is a Server Component: it runs on the server,
// reads from Postgres and sends finished HTML to the browser.
import Link from "next/link";
import { getSupabase, type QuoteRow } from "@/lib/supabase.ts";
import { formatUSD } from "@/lib/quote.ts";
import { findService } from "@/lib/services.ts";

export const dynamic = "force-dynamic"; // always show the latest quotes, never a cached copy

export default async function SavedQuotesPage() {
  const supabase = getSupabase();
  let quotes: QuoteRow[] = [];
  let problem: string | null = null;

  if (!supabase) {
    problem = "Saving is not configured yet (missing Supabase keys).";
  } else {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("load quotes failed", error);
      problem = "Could not load saved quotes.";
    } else {
      quotes = data as QuoteRow[];
    }
  }

  return (
    <main className="wrap">
      <header className="top">
        <div>
          <h1>Saved quotes</h1>
          <p className="muted">The 50 most recent quotes, newest first.</p>
        </div>
        <Link href="/" className="primary as-button">
          New quote
        </Link>
      </header>

      {problem && <p className="status error">{problem}</p>}

      {!problem && quotes.length === 0 && (
        <section className="card">
          <p className="muted">No quotes saved yet. Build one and press “Save quote”.</p>
        </section>
      )}

      {quotes.length > 0 && (
        <section className="card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Homeowner</th>
                <th className="col-price">Scope</th>
                <th className="col-price">Market · Rep</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id}>
                  <td>{new Date(q.created_at).toLocaleDateString("en-US", { timeZone: "America/Chicago" })}</td>
                  <td>
                    {q.customer_name}
                    {q.address && <span className="price-mobile">{q.address}</span>}
                  </td>
                  <td className="col-price small">
                    {q.lines.map((l) => `${l.quantity} × ${findService(l.serviceId)?.name ?? l.serviceId}`).join(", ")}
                  </td>
                  <td className="col-price small">
                    {q.market}
                    {q.sales_rep && ` · ${q.sales_rep}`}
                  </td>
                  <td className="num">{formatUSD(q.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="muted small">Demo project with sample prices. Not affiliated with any company.</footer>
    </main>
  );
}
