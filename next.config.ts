import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. Tell Turbopack to ignore the ffmpeg binary packages
  experimental: {
    serverComponentsExternalPackages: ['@ffmpeg-installer/ffmpeg', '@ffmpeg-installer/linux-x64'],
  },
  turbopack: {
    resolveAlias: {
      '@': './src',
      '@public': './public',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    qualities: [75, 100],
  },
};

export default nextConfig;