import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'api.dicebear.com' }]
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  // Fail hard on type errors and lint in CI
  typescript:  { ignoreBuildErrors: false },
  eslint:      { ignoreDuringBuilds: false },
};

export default nextConfig;
