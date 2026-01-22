/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  htmlLimitedBots: /.*/,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eclassify.thewrteam.in',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
