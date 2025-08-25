import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/private/',
        '/premium/success',
        '/premium/cancel',
        '/premium/pending',
      ],
    },
    sitemap: [
      'https://cornosbrasil.com/sitemap.xml',
      'https://cornosbrasil.com/sitemap.xml/videos'
    ],
  }
} 