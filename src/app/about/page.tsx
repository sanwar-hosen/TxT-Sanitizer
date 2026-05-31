import type { Metadata } from 'next';
import { getDB } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txt-sanitizer.pages.dev';

export const metadata: Metadata = {
  title: 'About TxT Sanitizer — Text Editor & Fiverr Sanitizer Guide',
  description: 'Learn how TxT Sanitizer cleans and formats text. Discover custom presets, Fiverr word sanitizer rule configuration, and restriction filters.',
  openGraph: {
    title: 'About TxT Sanitizer — Text Editor & Fiverr Sanitizer Guide',
    description: 'Learn how TxT Sanitizer cleans and formats text. Discover custom presets, Fiverr word sanitizer rule configuration, and restriction filters.',
    url: `${siteUrl}/about`,
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
    title: 'About TxT Sanitizer — Text Editor & Fiverr Sanitizer Guide',
    description: 'Learn how TxT Sanitizer cleans and formats text. Discover custom presets, Fiverr word sanitizer rule configuration, and restriction filters.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const DEFAULT_ABOUT_HTML = `
<div class="space-y-10">
  
  <!-- Header Hero Section -->
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold text-base-content mb-4">TxT Sanitizer</h1>
    <p class="text-xl text-base-content/75 w-full max-w-4xl mx-auto">
      A powerful, modern text cleaning and sanitization tool built with Next.js, designed to help users clean, format, and sanitize various types of text content efficiently.
    </p>
  </div>

  <!-- Features Card -->
  <div class="bg-base-100 rounded-lg border border-base-300 p-8 mb-8">
    <h2 class="text-2xl font-bold text-base-content mb-6 flex items-center">
      <span class="text-2xl mr-2">🚀</span>Features
    </h2>
    <div class="grid md:grid-cols-2 gap-8">
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Core Functionality</h3>
        <ul class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Smart Text Sanitization:</strong> Apply predefined or custom rules to clean and format text</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Dynamic Preset Tabs:</strong> Swappable rules with the last-selected preset shown first and others in an overflow dropdown</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Automatic Real-Time Sanitization:</strong> Toggle automatic processing to transform text instantly as you type</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Preset Highlighting &amp; Restore:</strong> Changed words are highlighted in amber. Hovering displays a floating button to restore individual segments</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>History Management:</strong> Review, copy, delete, and sort your last 50 manual sanitized operations</span>
          </li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">User Interface</h3>
        <ul class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Multi-Tab Workspace:</strong> Manage up to 5 concurrent tabs with independent state</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Dynamic Tab Labels:</strong> Tab labels update in real-time using the first 12 characters of input text</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Output Find &amp; Replace:</strong> Slide-in tool (🔍 or <kbd class="bg-base-200 px-1 rounded text-xs border border-base-300">Ctrl+Shift+F</kbd>) to search and replace text in the output pane</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Character &amp; Word Count:</strong> Real-time counts for input character+word, output character, and matched words</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Multi-Theme Toggle:</strong> 14+ gorgeous DaisyUI themes that instantly adjust accents and backgrounds</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- How to Use Card -->
  <div class="bg-base-100 rounded-lg border border-base-300 p-8 mb-8">
    <h2 class="text-2xl font-bold text-base-content mb-6 flex items-center">
      <span class="text-2xl mr-2">🎯</span>How to Use
    </h2>
    <div class="grid md:grid-cols-2 gap-8">
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Basic Usage</h3>
        <ol class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">1</span>
            <span><strong>Select a Preset:</strong> Choose a preset from tabs or the "More" dropdown.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">2</span>
            <span><strong>Input Text:</strong> Type or paste your text in the active workspace tab.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">3</span>
            <span><strong>Sanitize:</strong> Click "Sanitize" button or press <kbd class="bg-base-200 px-1 rounded text-sm border border-base-300">Ctrl+Enter</kbd> (in manual mode).</span>
          </li>
          <li class="flex items-start">
            <span class="bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">4</span>
            <span><strong>Copy Results:</strong> Use "Copy Text" button to copy the output.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">5</span>
            <span><strong>Reinput:</strong> Click the "Reinput" icon to copy output back to input for further processing.</span>
          </li>
        </ol>

        <h3 class="text-lg font-semibold text-base-content/90 mb-3 mt-6">Workspace Settings</h3>
        <ol class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="bg-warning text-warning-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">1</span>
            <span><strong>Custom Presets:</strong> Add, edit, delete, and drag-reorder custom preset rules in settings.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-warning text-warning-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">2</span>
            <span><strong>Toggle Real-Time:</strong> Switch between automatic real-time sanitization or manual sanitize mode.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-warning text-warning-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">3</span>
            <span><strong>Import &amp; Export:</strong> Save your custom presets to a JSON file or restore backup configs.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-warning text-warning-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">4</span>
            <span><strong>Wipe Storage:</strong> Clear history entries or perform a complete application reset.</span>
          </li>
        </ol>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Advanced Workflow</h3>
        <ol class="space-y-2 text-base-content/75 mb-6">
          <li class="flex items-start">
            <span class="bg-secondary text-secondary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">1</span>
            <span><strong>Find &amp; Replace:</strong> Toggle the 🔍 icon or <kbd class="bg-base-200 px-1 rounded text-sm border border-base-300">Ctrl+Shift+F</kbd> to search and replace.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-secondary text-secondary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">2</span>
            <span><strong>Restore Highlights:</strong> Hover on amber preset highlights and click the popup button to restore text.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-secondary text-secondary-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">3</span>
            <span><strong>Workspace Tabs:</strong> Use the tab bar to run up to 5 parallel sanitization processes.</span>
          </li>
        </ol>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">History Management</h3>
        <ol class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="bg-success text-success-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">1</span>
            <span><strong>View:</strong> Navigate to History page for all manual operations (needs manual mode enabled).</span>
          </li>
          <li class="flex items-start">
            <span class="bg-success text-success-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">2</span>
            <span><strong>Edit:</strong> Click the reload button to move a history entry back to the active tab.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-success text-success-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">3</span>
            <span><strong>Delete:</strong> Remove specific history entries to clean up your logs.</span>
          </li>
          <li class="flex items-start">
            <span class="bg-success text-success-content rounded-full w-5 h-5 flex items-center justify-center text-sm mr-3 mt-0.5 flex-shrink-0 font-semibold">4</span>
            <span><strong>Sort:</strong> Reorder history entries by date (newest/oldest first).</span>
          </li>
        </ol>
      </div>
    </div>
  </div>

  <!-- Key Concepts & Use Cases Card -->
  <div class="bg-base-100 rounded-lg border border-base-300 p-8 mb-8">
    <h2 class="text-2xl font-bold text-base-content mb-6 flex items-center">
      <span class="text-2xl mr-2">💡</span>Key Concepts &amp; Use Cases
    </h2>
    <div class="grid md:grid-cols-2 gap-8">
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Fiverr Word Sanitizer</h3>
        <p class="text-base-content/75 mb-3 text-sm">
          Freelancers working on platforms like Fiverr often run into restrictions regarding terms like email, skype, pay, WhatsApp, or phone numbers. The <strong>Fiverr Sanitizer</strong> preset allows you to automatically detect potentially problematic contact words and apply formatting bypasses (e.g. em-ail, pho-ne, sky-pe) to avoid platform restriction flags while maintaining legibility for clients.
        </p>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Restriction Word Sanitizer</h3>
        <p class="text-base-content/75 mb-3 text-sm">
          A <strong>restriction word sanitizer</strong> scans text documents to filter out terms that violate specific forum or marketplace platform guidelines. By configuring custom find-and-replace rules in this online text editor, you can automatically replace or sanitize restricted phrases, ensuring compliance with automatic automated submission filters.
        </p>
      </div>
    </div>
  </div>

  <!-- Technical Details Card -->
  <div class="bg-base-100 rounded-lg border border-base-300 p-8 mb-8">
    <h2 class="text-2xl font-bold text-base-content mb-6 flex items-center">
      <span class="text-2xl mr-2">🛠️</span>Technical Details
    </h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Built With</h3>
        <ul class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Next.js 14:</strong> React Framework with App Router and SSR support</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Tailwind CSS &amp; DaisyUI:</strong> Utility-first responsive CSS styling with 14+ themes</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Cloudflare D1:</strong> Serverless edge SQL database for preset configurations</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Resend API:</strong> Edge-compatible email delivery for feedback forms</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>TypeScript:</strong> Type-safety across client code, API routes, and database models</span>
          </li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Architecture</h3>
        <ul class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Component-Based:</strong> Modular, reusable React components</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Local Storage:</strong> Client-side data persistence for user settings and custom presets</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Device Isolation:</strong> Data remains private and secure on your specific device</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><strong>Clean Code Principles:</strong> Highly readable, modular, and maintainable codebase</span>
          </li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-3">Key Components</h3>
        <ul class="space-y-2 text-base-content/75">
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><code>PresetTabs</code>: Preset selection interface with "More" dropdown</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><code>WorkspaceTabBar</code>: Managing multiple document tabs (up to 5)</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><code>FindReplacePanel</code>: Interactive slide-in search and replacement overlay</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><code>RestoreOverlay</code>: Cursor-tracking overlay for reversing specific preset matches</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary mr-2">•</span>
            <span><code>NotificationAlert</code>: Slide-in alert bar controlled via D1 configurations</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Future Features & Roadmap Card -->
  <div class="bg-base-100 rounded-lg border border-base-300 p-8 mb-8">
    <h2 class="text-2xl font-bold text-base-content mb-6 flex items-center">
      <span class="text-2xl mr-2">🚧</span>Future Features &amp; Roadmap
    </h2>
    <div class="space-y-8">
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-4 flex items-center">
          <span class="bg-primary/15 text-primary px-2 py-1 rounded-md text-sm mr-2 font-semibold">NEAR TERM</span>Planned Features
        </h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="border-l-4 border-primary pl-4">
            <h4 class="font-semibold text-base-content mb-2">📥 History Export/Import</h4>
            <p class="text-base-content/75 text-sm mb-2">Export your sanitization history to JSON files for backup, sharing, or importing on other devices.</p>
            <ul class="text-base-content/60 text-xs space-y-1">
              <li>• Export entire history or selected entries</li>
              <li>• Import history from other TxT Sanitizer instances</li>
              <li>• Merge or replace existing history</li>
            </ul>
          </div>
          <div class="border-l-4 border-primary pl-4">
            <h4 class="font-semibold text-base-content mb-2">🎯 Multiple Preset Selection</h4>
            <p class="text-base-content/75 text-sm mb-2">Apply multiple presets in sequence with custom prioritization and ordering.</p>
            <ul class="text-base-content/60 text-xs space-y-1">
              <li>• Multi-select preset interface</li>
              <li>• Drag-and-drop preset ordering</li>
              <li>• Chain multiple sanitization rules</li>
            </ul>
          </div>
        </div>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-base-content/90 mb-4 flex items-center">
          <span class="bg-secondary/15 text-secondary px-2 py-1 rounded-md text-sm mr-2 font-semibold">LONG TERM</span>Advanced Features
        </h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="border-l-4 border-secondary pl-4">
            <h4 class="font-semibold text-base-content mb-2">🔗 Public Sharing Links</h4>
            <p class="text-base-content/75 text-sm mb-2">Generate shareable public links for text content, presets, and settings.</p>
            <ul class="text-base-content/60 text-xs space-y-1">
              <li>• Share processed text with custom URLs</li>
              <li>• Export and share custom presets</li>
              <li>• Collaborative text processing workflows</li>
              <li>• Optional password protection</li>
            </ul>
          </div>
          <div class="border-l-4 border-secondary pl-4">
            <h4 class="font-semibold text-base-content mb-2">☁️ Cloud Integration</h4>
            <p class="text-base-content/75 text-sm mb-2">Account creation with Google Drive sync for cross-device access and backup.</p>
            <ul class="text-base-content/60 text-xs space-y-1">
              <li>• User accounts with secure authentication</li>
              <li>• Google Drive automatic sync</li>
              <li>• Cross-device history and settings</li>
              <li>• Cloud backup and restore</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Development Status Bar -->
      <div class="bg-base-200/50 rounded-lg pt-4 pb-6 px-6 border-2 border-dashed border-base-300">
        <h3 class="text-lg font-semibold text-base-content/90 mb-6 flex items-center">
          <span class="text-lg mr-2">📋</span>Development Status
        </h3>
        <div class="grid md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="bg-success/15 text-success rounded-full px-3 py-1 text-sm font-semibold mb-1 inline-block">✅ COMPLETE</div>
            <p class="text-xs text-base-content/75">Core sanitization engine, preset system, history management</p>
          </div>
          <div class="text-center">
            <div class="bg-info/15 text-info rounded-full px-3 py-1 text-sm font-semibold mb-1 inline-block">🚧 PLANNING</div>
            <p class="text-xs text-base-content/75">Export/import functionality, multiple preset selection</p>
          </div>
          <div class="text-center">
            <div class="bg-secondary/15 text-secondary rounded-full px-3 py-1 text-sm font-semibold mb-1 inline-block">🔮 FUTURE</div>
            <p class="text-xs text-base-content/75">Cloud integration, public sharing, collaborative features</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Side-by-Side Tips & Creator Card -->
  <div class="grid md:grid-cols-2 gap-8">
    <div class="bg-base-100 rounded-lg border border-base-300 p-8">
      <h2 class="text-2xl font-bold text-base-content mb-6 flex items-center">
        <span class="text-2xl mr-2">💡</span>Tips &amp; Tricks
      </h2>
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold text-base-content/90 mb-2">Keyboard Shortcuts</h3>
          <p class="text-base-content/75"><kbd class="bg-base-200 px-2 py-1 rounded text-sm border border-base-300">Ctrl+Enter</kbd> - Sanitize text</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-base-content/90 mb-2">Best Practices</h3>
          <ul class="space-y-1 text-base-content/75 text-sm">
            <li>• Test rules before applying to important text</li>
            <li>• Use history feature to track changes</li>
            <li>• Keep original files as backup before processing</li>
            <li>• Lower priority numbers execute first</li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-base-content/90 mb-2">Performance</h3>
          <ul class="space-y-1 text-base-content/75 text-sm">
            <li>• Payload capacity: Optimized to handle up to 1MB text</li>
            <li>• Designed for rapid large text processing</li>
            <li>• Real-time word and character counting</li>
            <li>• Efficient client-side storage management</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="bg-base-100 rounded-lg border border-base-300 p-8">
      <h2 class="text-2xl font-bold mb-6 flex items-center text-base-content text-gray-900">
        <span class="text-2xl mr-2">🤝</span>About the Creator
      </h2>
      <div class="space-y-4">
        <div>
          <h3 class="text-lg font-semibold text-base-content/90 mb-2">Created by Sano (Sanwar Hosen)</h3>
          <ul class="space-y-1 text-base-content/75">
            <li>• GitHub: <a href="https://github.com/sanwar-hosen" class="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">@sanwar-hosen</a></li>
            <li>• LinkedIn: <a href="https://www.linkedin.com/in/sanwar-hosen/" class="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">Connect with Sano</a></li>
            <li>• Repository: <a href="https://github.com/sanwar-hosen/TxT-Sanitizer" class="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">TxT-Sanitizer</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-base-content/90 mb-2">Development Philosophy</h3>
          <ul class="space-y-1 text-base-content/75 text-sm">
            <li>• <strong>Clean Code:</strong> Prioritizing readability and maintainability</li>
            <li>• <strong>User Experience:</strong> Intuitive interface design</li>
            <li>• <strong>Performance:</strong> Fast, responsive interactions</li>
            <li>• <strong>Accessibility:</strong> Following web accessibility guidelines</li>
          </ul>
        </div>
        <div class="pt-4 border-t border-base-300">
          <p class="text-sm text-base-content/60"><strong>Version:</strong> 2.0.0 • <strong>Updated:</strong> May 2026</p>
          <p class="text-sm text-base-content/60 mt-1">Available for personal and educational use under Non-Commercial License</p>
        </div>
      </div>
    </div>
  </div>

  <div class="text-center mt-12 pt-8 border-t border-base-300">
    <p class="text-base-content/60 italic">TxT Sanitizer - Making text cleaning simple and efficient ✨</p>
  </div>
</div>
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
    'url': `${siteUrl}/about`,
    'description': 'Learn how TxT Sanitizer helps you clean, sanitize, and transform text using custom presets, bypass word filters, and manage rules.',
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl,
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'About',
          'item': `${siteUrl}/about`,
        },
      ],
    },
  };

  return (
    <div className="flex-1 flex flex-col py-6 px-4 md:px-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-[1200px] w-full mx-auto">
        <article
          className="about-content text-base-content leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
