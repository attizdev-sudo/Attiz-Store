import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
