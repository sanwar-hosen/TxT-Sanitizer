import type { Metadata } from 'next';
import HistoryClient from './HistoryClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txt-sanitizer.pages.dev';

export const metadata: Metadata = {
  title: 'History — TxT Sanitizer',
  description: 'Review, copy, and restore your previous text sanitization history entries on TxT Sanitizer.',
  openGraph: {
    title: 'History — TxT Sanitizer',
    description: 'Review, copy, and restore your previous text sanitization history entries on TxT Sanitizer.',
    url: `${siteUrl}/history`,
    siteName: 'TxT Sanitizer',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
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
    title: 'History — TxT Sanitizer',
    description: 'Review, copy, and restore your previous text sanitization history entries on TxT Sanitizer.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function HistoryPage() {
  return <HistoryClient />;
}
