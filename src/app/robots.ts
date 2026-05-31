import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txt-sanitizer.pages.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/settings', '/history'],
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
