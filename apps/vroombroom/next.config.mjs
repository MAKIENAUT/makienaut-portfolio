/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/vroombroom",
        destination: "/",
      },
      {
        source: "/vroombroom/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
