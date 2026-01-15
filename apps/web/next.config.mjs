/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/bff/:path*',
        destination: 'http://localhost:3001/api/bff/:path*',
      },
    ]
  },
}

export default nextConfig
