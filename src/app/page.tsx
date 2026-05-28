import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'TxT Sanitizer — Clean & Transform Your Text',
  description: 'A free, fast, browser-based text sanitizer. Remove markdown, bypass platform word filters, and clean your text with custom presets.',
  openGraph: {
    title: 'TxT Sanitizer — Clean & Transform Your Text',
    description: 'A free, fast, browser-based text sanitizer. Remove markdown, bypass platform word filters, and clean your text with custom presets.',
    url: 'https://txt-sanitizer.pages.dev',
    siteName: 'TxT Sanitizer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TxT Sanitizer — Clean & Transform Your Text',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TxT Sanitizer — Clean & Transform Your Text',
    description: 'A free, fast, browser-based text sanitizer. Remove markdown, bypass platform word filters, and clean your text with custom presets.',
    images: ['/og-image.png'],
  },
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'TxT Sanitizer',
    'url': 'https://txt-sanitizer.pages.dev',
    'description': 'A free, fast, browser-based text sanitizer. Remove markdown, bypass platform word filters, and clean your text with custom presets.',
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 support',
    'offers': {
      '@type': 'Offer',
      'price': '0.00',
      'priceCurrency': 'USD',
    },
    'featureList': [
      'Multi-tab workspace',
      'Word and character counters',
      'Highlighted match visualization',
      'Hover-to-restore original segments',
      'Case-sensitive find & replace tool',
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Semantic H1 Tag for SEO (visually hidden) */}
      <h1 className="sr-only">TxT Sanitizer — Clean & Transform Your Text</h1>

      {/* Main client application */}
      <HomeClient />
    </>
  );
}
