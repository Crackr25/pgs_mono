/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.pinoyglobalsupply.com/api',
  },
  images: {
    domains: ['localhost', 'api.pinoyglobalsupply.com', 'pinoyglobalsupply.com'],
    unoptimized: true
  }
}

module.exports = nextConfig
