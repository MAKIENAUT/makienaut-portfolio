import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://makienaut.github.io"),
  title: "Mc Ray Escoto | Full Stack Developer",
  description:
    "Portfolio of Mc Ray Escoto, a full stack developer building scalable web applications with React.js, Next.js, Laravel, and TypeScript.",
  keywords:
    "Mc Ray Escoto, full stack developer, React.js, Next.js, Laravel, TypeScript, web developer portfolio, Pangasinan Philippines",
  authors: [{ name: "Mc Ray Escoto" }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Mc Ray Escoto | Full Stack Developer",
    description:
      "Full stack developer with experience in enterprise delivery, freelance projects, and modern web application development.",
    type: "website",
    url: "https://makienaut.github.io",
    siteName: "Mc Ray Escoto Portfolio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
