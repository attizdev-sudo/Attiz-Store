import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint flat config (eslint-config-next) has a compatibility issue during build.
    // Type checking still runs. Run `npm run lint` separately for linting.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'vxdrkxyrucuaunhpoevx.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'jqwitqkpsbgnubsrjwah.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'khaevcmcccmigbhneljk.supabase.co',
      },
    ],
  },
};

export default nextConfig;