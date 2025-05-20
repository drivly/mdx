import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['next-mdx-remote'],
  experimental: {
    disableOptimizedLoading: true,
    optimizeCss: false
  }
};

export default nextConfig;
