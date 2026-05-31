import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txt-sanitizer.pages.dev';

export const metadata: Metadata = {
  title: 'Settings — TxT Sanitizer',
  description: 'Configure your custom text sanitization presets, import/export rules, and manage workspace preferences.',
  openGraph: {
    title: 'Settings — TxT Sanitizer',
    description: 'Configure your custom text sanitization presets, import/export rules, and manage workspace preferences.',
    url: `${siteUrl}/settings`,
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
    title: 'Settings — TxT Sanitizer',
    description: 'Configure your custom text sanitization presets, import/export rules, and manage workspace preferences.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
