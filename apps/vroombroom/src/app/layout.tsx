import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://orb-weaver.xyz"),
  title: {
    default: "VroomBroom | Independent Helmet Cleaning",
    template: "%s | VroomBroom",
  },
  description:
    "Book careful, appointment-based helmet cleaning with VroomBroom.",
  alternates: {
    canonical: "https://orb-weaver.xyz",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "VroomBroom | Independent Helmet Cleaning",
    description:
      "A simple, care-first helmet cleaning service for everyday riders.",
    url: "https://orb-weaver.xyz",
    siteName: "VroomBroom",
    type: "website",
    images: [
      {
        url: "/vroombroom-og.jpg",
        width: 1024,
        height: 1024,
        alt: "VroomBroom rider logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
