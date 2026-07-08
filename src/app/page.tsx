import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txt-sanitizer.pages.dev';

export const metadata: Metadata = {
  title: 'TxT Sanitizer — Clean Text Editor & Fiverr Word Sanitizer',
  description:
    'A free, fast, browser-based text sanitizer and text editor. Clean markdown, bypass Fiverr word filters, sanitize restriction words, and format text with custom rules.',
  keywords: [
    'text sanitizer',
    'text editor',
    'fiverr sanitizer',
    'restriction word sanitizer',
    'bypass fiverr word filter',
    'upwork restriction bypass',
    'custom text rules',
    'clean text online',
    'markdown remover'
  ],
  openGraph: {
    title: 'TxT Sanitizer — Clean Text Editor & Fiverr Word Sanitizer',
    description:
      'A free, fast, browser-based text sanitizer and text editor. Clean markdown, bypass Fiverr word filters, sanitize restriction words, and format text with custom rules.',
    url: siteUrl,
    siteName: 'TxT Sanitizer',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'TxT Sanitizer — Clean Text Editor & Fiverr Word Sanitizer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TxT Sanitizer — Clean Text Editor & Fiverr Word Sanitizer',
    description:
      'A free, fast, browser-based text sanitizer and text editor. Clean markdown, bypass Fiverr word filters, sanitize restriction words, and format text with custom rules.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function Home() {
  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'TxT Sanitizer',
    'url': siteUrl,
    'image': `${siteUrl}/og-image.png`,
    'description':
      'A free, fast, browser-based text sanitizer and clean text editor. Remove formatting, clean markdown, and bypass Fiverr restriction words dynamically.',
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires HTML5 support',
    'author': {
      '@type': 'Person',
      'name': 'Sano (Sanwar Hosen)',
      'url': 'https://github.com/sanwar-hosen'
    },
    'offers': {
      '@type': 'Offer',
      'price': '0.00',
      'priceCurrency': 'USD',
    },
    'featureList': [
      'Multi-tab workspace with dynamic labels',
      'Fiverr restriction word bypass presets',
      'Word and character counter statistics',
      'Matched highlight visualization and restore functionality',
      'Find and replace text editing utility',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is a Text Sanitizer?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'A text sanitizer is a tool designed to clean, transform, and format raw text. It helps remove unwanted characters, strip markdown symbols (like stars or hashtags), fix spacing issues, and replace specific words or phrases using customizable rule presets.',
        },
      },
      {
        '@type': 'Question',
        'name': 'How does a Fiverr word sanitizer work?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'A Fiverr word sanitizer helps freelance professionals avoid terms restricted by platform guidelines (like "email", "phone number", "pay", or external contact words). It replaces these restricted words with bypassed versions (e.g., "em-ail", "pho-ne") to ensure platform policy compliance without manual editing.',
        },
      },
      {
        '@type': 'Question',
        'name': 'What is a restriction word sanitizer?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'A restriction word sanitizer is a utility used to search a block of text for terms that might violate policies, cause filtering, or trigger security blocks on external sites. It automatically edits or masks these words using priority-based replacement rules.',
        },
      },
      {
        '@type': 'Question',
        'name': 'Is TxT Sanitizer a secure text editor?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, TxT Sanitizer is 100% secure. Because it runs entirely in your web browser (client-side), your inputs, text, custom presets, and session history never get sent to any server. Your sensitive data remains completely isolated on your local device.',
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Semantic H1 Tag for SEO (visually hidden) */}
      <h1 className="sr-only">TxT Sanitizer — Clean Text Editor & Fiverr Word Sanitizer</h1>

      {/* Main client application */}
      <HomeClient />

      {/* Semantic HTML FAQ and Content Section for Search Engines & Generative Search Citations (Visually Hidden but fully crawlable) */}
      <section className="sr-only" aria-hidden="false">
        <h2>Frequently Asked Questions</h2>
        <div>
          <h3>What is a Text Sanitizer?</h3>
          <p>A text sanitizer is a utility that automates text cleanup. It lets you write, edit, and clean text by removing code syntax, cleaning double spaces, stripping markdown tags, and applying advanced text replacement rules.</p>
        </div>
        <div>
          <h3>How does a Fiverr sanitizer bypass platform word filters?</h3>
          <p>The Fiverr sanitizer preset scans your text for contact words or payment phrases (such as email, Skype, WhatsApp, paypal, payment) and formats them into safe variations (like em-ail, pay-ment) to keep your communications within policy bounds.</p>
        </div>
        <div>
          <h3>What is a restriction word sanitizer?</h3>
          <p>It is a text filter that checks copy for restriction words. If any flagged words are present, it replaces them instantly. This prevents automated review filters from blocking your messages or documents on platforms with word restrictions.</p>
        </div>
        <div>
          <h3>How does the online text editor work?</h3>
          <p>TxT Sanitizer includes a full multi-tab text editor. You can load multiple documents, check word counts, look up matched terms in real-time, restore text segments, and search/replace text with case-sensitive filters.</p>
        </div>
      </section>
    </>
  );
}
