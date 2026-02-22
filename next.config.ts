import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use the new key 'serverExternalPackages' directly under nextConfig
  // Add fluent-ffmpeg to the external packages list
  serverExternalPackages: [
    '@ffmpeg-installer/ffmpeg',
    '@ffmpeg-installer/linux-x64',
    'fluent-ffmpeg'
  ],

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