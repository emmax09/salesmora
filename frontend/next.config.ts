import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@salesmora/api-client', '@salesmora/ui'],
};

export default nextConfig;
