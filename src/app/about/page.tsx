import type { Metadata } from 'next';
import { getDB } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About — TxT Sanitizer',
  description: 'Learn how TxT Sanitizer helps you clean, sanitize, and transform text using custom presets, bypass word filters, and manage rules.',
  openGraph: {
    title: 'About — TxT Sanitizer',
    description: 'Learn how TxT Sanitizer helps you clean, sanitize, and transform text using custom presets, bypass word filters, and manage rules.',
    url: 'https://txt-sanitizer.pages.dev/about',
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
    title: 'About — TxT Sanitizer',
    description: 'Learn how TxT Sanitizer helps you clean, sanitize, and transform text using custom presets, bypass word filters, and manage rules.',
    images: ['/og-image.png'],
  },
};

const DEFAULT_ABOUT_HTML = `
<h2>About TxT Sanitizer</h2>
<p>TxT Sanitizer is a lightweight, fast text processing utility that helps you clean and transform text using customizable preset rules.</p>
<p>Built for freelancers, content creators, and anyone who needs to sanitize or format text quickly.</p>
<h3>Features</h3>
<ul>
  <li>Custom preset rules with find &amp; replace</li>
  <li>Multi-tab workspace</li>
  <li>Highlighted match visualization</li>
  <li>Hover-to-restore modified segments</li>
  <li>Output Find &amp; Replace tool</li>
  <li>Persistent history (up to 50 entries)</li>
</ul>
`.trim();

async function getAboutContent(): Promise<string> {
  try {
    const db = getDB();
    if (db) {
      const row = await db
        .prepare('SELECT html_content FROM about_content WHERE id = 1')
        .first();
      if (row?.html_content) {
        return row.html_content as string;
      }
    }
  } catch (err) {
    console.error('Error fetching about content from D1:', err);
  }
  return DEFAULT_ABOUT_HTML;
}

export default async function AboutPage() {
  const html = await getAboutContent();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'About TxT Sanitizer',
    'url': 'https://txt-sanitizer.pages.dev/about',
    'description': 'Learn how TxT Sanitizer helps you clean, sanitize, and transform text using custom presets, bypass word filters, and manage rules.',
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://txt-sanitizer.pages.dev',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'About',
          'item': 'https://txt-sanitizer.pages.dev/about',
        },
      ],
    },
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-[800px] w-full mx-auto bg-white dark:bg-[var(--surface)] rounded-xl border border-outline-variant dark:border-[var(--border)] shadow-sm p-6 md:p-10">
        <h1 className="text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant dark:border-[var(--border)] pb-4">
          About TxT Sanitizer
        </h1>
        <article
          className="about-content text-on-surface-variant leading-relaxed text-sm md:text-base space-y-4
            [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-on-surface [&>h2]:mt-6 [&>h2]:mb-2
            [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-on-surface [&>h3]:mt-4 [&>h3]:mb-2
            [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-1.5 [&>li]:text-on-surface-variant
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-1.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
