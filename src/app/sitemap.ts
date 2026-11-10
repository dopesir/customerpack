import { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nobuswork.pages.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${appUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: `${appUrl}/pack/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    }
  ];
}
