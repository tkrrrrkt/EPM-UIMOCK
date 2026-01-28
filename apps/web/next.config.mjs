/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/bff/:path*',
        destination: 'http://localhost:3001/api/bff/:path*',
      },
      // Route _v0_drop to v0drop (without underscore - Next.js ignores _ prefixed folders)
      {
        source: '/_v0_drop/:path*',
        destination: '/v0drop/:path*',
      },
    ]
  },
}

export default nextConfig
