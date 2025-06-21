/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    domains: ['assets.coingecko.com', 'coin-images.coingecko.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default_value',
  },
  // Remove basePath and assetPrefix for now to test if that's causing issues
  // basePath: process.env.NODE_ENV === 'production' ? '/CodoxTerminal' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/CodoxTerminal/' : '',
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig 