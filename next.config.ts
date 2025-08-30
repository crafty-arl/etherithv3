import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For local development, don't use export mode
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  // distDir: 'dist',
  
  images: {
    unoptimized: true,
  },
  
  // Environment variable configuration
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // ESLint configuration to handle warnings
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;