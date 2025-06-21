/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  basePath: '/CodoxTerminal',
  assetPrefix: '/CodoxTerminal/',
  images: {
    unoptimized: true,
    domains: ['assets.coingecko.com', 'coin-images.coingecko.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default_value',
  },
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