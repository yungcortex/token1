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
  basePath: process.env.NODE_ENV === 'production' ? '/CodoxTerminal' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/CodoxTerminal/' : '',
}

module.exports = nextConfig 