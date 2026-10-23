import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boneless Express | Wholesale Seafood & Logistics",
  description:
    "Wholesale seafood supplier dashboard, order processing, delivery tables, and inventory management.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#080c0b] font-sans text-stone-100 antialiased">
        {children}
      </body>
    </html>
  );
}
