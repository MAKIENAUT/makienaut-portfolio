/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development artifacts separate from production builds. This prevents
  // an active `next dev` process from reading a partially rewritten `.next`
  // directory when `next build` runs in another terminal.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async headers() {
    const cacheablePublicImages = [
      "athena.png",
      "favicon.ico",
      "favicon.png",
      "orb-weaver-logo.png",
      "upang.png",
      "vroombroom.png",
      "vroombroom-og.jpg",
      "vroombroom-thumb.webp",
      "wma.png",
    ];

    return cacheablePublicImages.map((asset) => ({
      source: `/${asset}`,
      headers: [
        {
          key: "Cache-Control",
          value:
            "public, max-age=604800, stale-while-revalidate=2592000",
        },
      ],
    }));
  },
  async redirects() {
    return [
      {
        source: "/orb-weaver",
        destination: "/vroombroom",
        permanent: true,
      },
      {
        source: "/orb-weaver/:path*",
        destination: "/vroombroom/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
