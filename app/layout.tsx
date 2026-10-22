import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundation Quote Builder",
  description: "Build foundation repair quotes in the field, in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
