import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Optimize for production
  poweredByHeader: false,
  compress: true,
  // Enable strict mode for better debugging
  reactStrictMode: true,
};

export default nextConfig;
