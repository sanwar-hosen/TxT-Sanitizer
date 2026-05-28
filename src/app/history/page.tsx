import type { Metadata } from 'next';
import HistoryClient from './HistoryClient';

export const metadata: Metadata = {
  title: 'History — TxT Sanitizer',
  description: 'Review, copy, and restore your previous text sanitization history entries on TxT Sanitizer.',
  openGraph: {
    title: 'History — TxT Sanitizer',
    description: 'Review, copy, and restore your previous text sanitization history entries on TxT Sanitizer.',
    url: 'https://txt-sanitizer.pages.dev/history',
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
    title: 'History — TxT Sanitizer',
    description: 'Review, copy, and restore your previous text sanitization history entries on TxT Sanitizer.',
    images: ['/og-image.png'],
  },
};

export default function HistoryPage() {
  return <HistoryClient />;
}
