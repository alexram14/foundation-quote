# Foundation Quote Builder

A small internal tool for foundation repair sales reps: enter the homeowner, pick the scope of work (piers, wall anchors, crack injection, drain tile, encapsulation…), and get a priced quote in seconds that can be printed or saved as PDF. Works on phones, so reps can quote on site.

**Live demo:** https://foundation-quote.vercel.app

> Demo project with **sample prices**. Not affiliated with any company.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict mode)
- Plain CSS, light and dark mode, print stylesheet
- Deployed on **Vercel** (auto-deploys on every push to `main`)
- **Supabase (Postgres)** to save quotes, protected with Row Level Security

## How it's organized

| File | What it does |
|---|---|
| `lib/services.ts` | Service catalog: name, unit, price, whether quantity must be whole |
| `lib/quote.ts` | Pure quote math: line totals, mobilization fee, discount, tax, validation |
| `lib/quote.test.ts` | Tests for the math (run with `npm test`) |
| `app/page.tsx` | The quote form (client component) |
| `app/actions.ts` | Server Action that validates, **recalculates the total on the server**, and saves to Supabase |
| `app/quotes/page.tsx` | Saved quotes list (server component, reads from Postgres) |
| `lib/supabase.ts` | Server-only Supabase client; keys come from environment variables |
| `app/globals.css` | Styles, phone layout and print layout |

Design decisions:
- **Money in cents** (integers) to avoid floating-point rounding errors.
- **Business logic separated from the UI**, so it can be tested on its own and reused on the server when quotes are saved to the database.
- **Validation where it matters**: you can't quote 2.5 piers, but 10.5 linear ft of drain tile is fine.
- **The server never trusts the browser's total**: it recalculates the quote before saving, so a tampered request can't store a wrong price.
- **Discount before tax**, tax rate defaults per market (Kansas City / Dallas–Fort Worth) and can be overridden.

## Run it

```bash
npm install
cp .env.example .env.local   # add your Supabase URL and publishable key
npm run dev     # http://localhost:3000
npm test        # quote math tests
```

Built with AI-assisted development (Claude), with every piece reviewed and tested.
