/** @type {import('next').NextConfig} */
const nextConfig = {
  // Headers para cache e performance
  async headers() {
    return [
      {
        source: '/api/proxy/video',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Range'
          }
        ]
      },
      {
        source: '/api/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600'
          }
        ]
      }
    ]
  },

  // Compressão
  compress: true,

  // Otimizações de bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Otimizar para client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }
    
    return config
  }
}

module.exports = nextConfig 