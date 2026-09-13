/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    middlewareClientMaxBodySize: '12mb',
    proxyClientMaxBodySize: '12mb',
  },
}

module.exports = nextConfig
