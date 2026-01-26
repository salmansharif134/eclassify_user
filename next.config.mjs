/** @type {import('next').NextConfig} */
const normalizeBaseUrl = (value) => (value ? value.replace(/\/+$/, "") : "");

const backendBaseUrl = normalizeBaseUrl(
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL
);
const webBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_WEB_URL);

const nextConfig = {
  reactStrictMode: false,
  htmlLimitedBots: /.*/,
  env: {
    // Prefer backend URL; fall back to web URL for proxying.
    NEXT_PUBLIC_API_URL: backendBaseUrl || webBaseUrl,
  },
  async rewrites() {
    if (!backendBaseUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendBaseUrl}/api/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eclassify.thewrteam.in",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
