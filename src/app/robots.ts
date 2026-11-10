import { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nobuswork.pages.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pack/new'],
        disallow: ['/api/', '/pack/cp_']
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Googlebot', 'Bingbot'],
        allow: ['/', '/pack/new'],
        disallow: ['/api/', '/pack/cp_']
      }
    ],
    sitemap: `${appUrl}/sitemap.xml`
  };
}
