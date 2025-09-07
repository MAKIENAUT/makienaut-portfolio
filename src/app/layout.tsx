import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mc Ray Escoto - Full Stack Developer | Orb-Weaver",
  description:
    "Full-Stack Web Developer specializing in modern web applications. Building exceptional experiences, hunting bugs, and delivering quality solutions.",
  keywords:
    "web developer, full stack, React, Next.js, PHP, JavaScript, portfolio",
  authors: [{ name: "Mc Ray Escoto" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Mc Ray Escoto - Full Stack Developer",
    description:
      "Building exceptional web experiences with modern technologies",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
