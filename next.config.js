/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
    return [
      {
        source: '/api/security/:path*',
        destination: `${base}/api/v1/network-security/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    return config;
  }
}

module.exports = nextConfig
