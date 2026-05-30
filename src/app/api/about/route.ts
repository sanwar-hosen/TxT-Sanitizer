/**
 * GET /api/about
 * Returns the About page HTML content from D1.
 * Falls back to static default content if DB not configured.
 */

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

const DEFAULT_ABOUT_HTML = `
<div class="space-y-10">
  
  <!-- Header Hero Section -->
  <div class="text-center max-w-3xl mx-auto space-y-4 py-6">
    <h1 class="text-4xl md:text-5xl font-extrabold text-base-content tracking-tight">
      TxT Sanitizer
    </h1>
    <p class="text-base-content/75 text-base md:text-lg leading-relaxed font-normal">
      A powerful, modern text cleaning and sanitization tool built with React, designed to help users clean, format, and sanitize various types of text content efficiently.
    </p>
  </div>

  <!-- Features Card -->
  <div class="bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
    <h2 class="text-2xl font-bold text-base-content flex items-center gap-3 border-b border-base-300 pb-4 mb-6">
      <span>🚀</span> Features
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">Core Functionality</h3>
        <ul class="space-y-3 text-sm md:text-base text-base-content/85">
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Smart Text Sanitization:</strong> Apply predefined or custom rules to clean and format text.
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Dynamic Preset Tabs:</strong> Fast switching between active rules, showing the last-selected preset first and wrapping the rest in an overflow dropdown.
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Automatic Real-Time Sanitization:</strong> Instant transformation as you type (can be toggled in workspace settings).
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Preset Highlighting &amp; Restore:</strong> Matched and changed words are highlighted in amber. Hovering over a highlight displays a floating button to restore it.
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">History Management:</strong> Review, copy, delete, and sort your last 50 sanitized manual entries.
            </div>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">User Interface</h3>
        <ul class="space-y-3 text-sm md:text-base text-base-content/85">
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Multi-Tab Workspace:</strong> Manage up to 5 concurrent tabs with independent presets and state.
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Dynamic Tab Labels:</strong> Tab names update in real-time based on the first 12 characters of input text.
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Output Find &amp; Replace:</strong> Slide-in tool (🔍 or Ctrl+Shift+F) to search and navigate matches (blue highlighting) and perform single/bulk replacements.
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Character &amp; Word Counts:</strong> Real-time counts for input, output, and matched words.
            </div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div>
              <strong class="text-base-content">Multi-Theme Toggle:</strong> Support for 14+ curated CSS/DaisyUI themes that dynamically update elements.
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- How to Use Card -->
  <div class="bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
    <h2 class="text-2xl font-bold text-base-content flex items-center gap-3 border-b border-base-300 pb-4 mb-6">
      <span>🎯</span> How to Use
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">Basic Usage</h3>
        <ol class="space-y-3 text-sm md:text-base text-base-content/85">
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">1</span>
            <div><strong>Select a Preset:</strong> Choose a preset from tabs or the "More" dropdown.</div>
          </li>
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">2</span>
            <div><strong>Input Text:</strong> Type or paste your text into the left pane.</div>
          </li>
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">3</span>
            <div><strong>Sanitize:</strong> Click "Sanitize" or press <kbd class="kbd kbd-sm bg-base-200">Ctrl+Enter</kbd> (in manual mode).</div>
          </li>
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">4</span>
            <div><strong>Copy Results:</strong> Use the "Copy Text" button to copy the output.</div>
          </li>
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">5</span>
            <div><strong>Reinput:</strong> Click the "Reinput" icon to copy output back to input.</div>
          </li>
        </ol>
      </div>
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">Advanced Features</h3>
        <ol class="space-y-3 text-sm md:text-base text-base-content/85">
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">1</span>
            <div><strong>Find &amp; Replace:</strong> Open the tool (🔍 or Ctrl+Shift+F) to search matches.</div>
          </li>
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">2</span>
            <div><strong>Highlight Restore:</strong> Hover on an amber word and click the button to restore it.</div>
          </li>
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">3</span>
            <div><strong>Tabs Management:</strong> Use workspace tabs (+) to manage up to 5 sessions.</div>
          </li>
          <li class="flex gap-3 items-start">
            <span class="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold mt-0.5">4</span>
            <div><strong>Real-Time Mode:</strong> Enable auto-sanitize in settings to process text on the fly.</div>
          </li>
        </ol>
      </div>
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">History Management</h3>
        <ul class="space-y-3 text-sm md:text-base text-base-content/85">
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div><strong>View:</strong> Access the History page for all past operations (in manual mode).</div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div><strong>Edit:</strong> Click the edit/reload button to move the entry back to your workspace.</div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div><strong>Delete &amp; Sort:</strong> Clear unwanted entries or sort by newest/oldest first.</div>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary mt-1">•</span>
            <div><strong>Clear All:</strong> Wipe your history or reset the application completely in Settings.</div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Technical Details Card -->
  <div class="bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
    <h2 class="text-2xl font-bold text-base-content flex items-center gap-3 border-b border-base-300 pb-4 mb-6">
      <span>🛠️</span> Technical Details
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">Built With</h3>
        <ul class="space-y-2 text-sm text-base-content/85">
          <li><strong>Next.js 14:</strong> React Framework with App Router and SSR support.</li>
          <li><strong>Tailwind CSS &amp; DaisyUI:</strong> Utility-first responsive CSS styling with 14+ themes.</li>
          <li><strong>Cloudflare D1:</strong> Serverless edge SQL database for presets, alert banners, and stats.</li>
          <li><strong>Resend API:</strong> Edge-compatible email delivery for the feedback forms.</li>
          <li><strong>TypeScript:</strong> Type-safety across client code, API routes, and database models.</li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">Architecture</h3>
        <ul class="space-y-2 text-sm text-base-content/85">
          <li><strong>Client-Side Processing:</strong> Text sanitization and search run directly on the client.</li>
          <li><strong>Edge Backend:</strong> Server-side API endpoints run on Cloudflare Pages Functions.</li>
          <li><strong>Local Persistence:</strong> Workspace tabs, settings, history, and system preset overrides are saved in localStorage.</li>
          <li><strong>Device Isolation:</strong> Data remains secure on your specific device.</li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-primary">Key Components</h3>
        <ul class="space-y-2 text-sm text-base-content/85">
          <li><strong>PresetTabs:</strong> Active preset selection bar with "More" overflow.</li>
          <li><strong>WorkspaceTabBar:</strong> Interactive tabs bar supporting up to 5 dynamic sessions.</li>
          <li><strong>FindReplacePanel:</strong> Interactive slide-in output find and replace panel.</li>
          <li><strong>RestoreOverlay:</strong> Floating cursor tracking for instant word restoration.</li>
          <li><strong>NotificationAlert:</strong> Slide-in and hoverable notification banner.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Future Features & Roadmap Card -->
  <div class="bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
    <h2 class="text-2xl font-bold text-base-content flex items-center gap-3 border-b border-base-300 pb-4 mb-6">
      <span>🗺️</span> Future Features &amp; Roadmap
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div class="space-y-4 border-l-2 border-primary/30 pl-4">
        <div class="flex items-center gap-2">
          <span class="badge badge-primary font-semibold text-xs py-2 px-2.5">NEAR TERM</span>
          <span class="font-bold text-base-content">Planned Features</span>
        </div>
        <div class="space-y-3">
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-base-content flex items-center gap-2">
              <span>💾</span> History Export/Import
            </h4>
            <p class="text-xs text-base-content/75">Backup history entries to JSON files or restore them on another device.</p>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-base-content flex items-center gap-2">
              <span>🔀</span> Multiple Preset Selection
            </h4>
            <p class="text-xs text-base-content/75">Chain multiple presets in a custom execution sequence and ordering.</p>
          </div>
        </div>
      </div>
      <div class="space-y-4 border-l-2 border-secondary/30 pl-4">
        <div class="flex items-center gap-2">
          <span class="badge badge-secondary font-semibold text-xs py-2 px-2.5">LONG TERM</span>
          <span class="font-bold text-base-content">Advanced Features</span>
        </div>
        <div class="space-y-3">
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-base-content flex items-center gap-2">
              <span>🔗</span> Public Sharing Links
            </h4>
            <p class="text-xs text-base-content/75">Generate secure shareable public links for text, presets, and configs.</p>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-base-content flex items-center gap-2">
              <span>☁️</span> Cloud Integration
            </h4>
            <p class="text-xs text-base-content/75">Optional account creation with secure backup and cross-device synchronization.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Development Status Bar -->
    <div class="border border-base-200 rounded-xl p-4 bg-base-200/30">
      <h3 class="text-sm font-bold text-base-content mb-4 flex items-center gap-2">
        <span>📋</span> Development Status
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Complete -->
        <div class="bg-base-100 border border-success/30 rounded-lg p-3 text-center transition-all hover:scale-[1.02]">
          <span class="badge badge-success text-success-content text-xs font-bold mb-2">✓ COMPLETE</span>
          <p class="text-[11px] text-base-content/80 leading-snug">Core engine, 5 workspace tabs, dynamic labels, highlights, restore overlay, find/replace, multi-themes, admin console, D1 tables, feedback forms.</p>
        </div>
        <!-- Planning -->
        <div class="bg-base-100 border border-info/30 rounded-lg p-3 text-center transition-all hover:scale-[1.02]">
          <span class="badge badge-info text-info-content text-xs font-bold mb-2">🚧 PLANNING</span>
          <p class="text-[11px] text-base-content/80 leading-snug">Export/import presets and history, sequential preset chaining, and rule drag-to-reorder touch support.</p>
        </div>
        <!-- Future -->
        <div class="bg-base-100 border border-neutral/30 rounded-lg p-3 text-center transition-all hover:scale-[1.02]">
          <span class="badge badge-neutral text-neutral-content text-xs font-bold mb-2">🔮 FUTURE</span>
          <p class="text-[11px] text-base-content/80 leading-snug">Cloud account database syncing, public share urls, collaborative real-time editing, and team dashboards.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Tips & Creator Side-by-Side -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Tips & Tricks Card -->
    <div class="bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
      <h2 class="text-2xl font-bold text-base-content flex items-center gap-3 border-b border-base-300 pb-4 mb-6">
        <span>💡</span> Tips &amp; Tricks
      </h2>
      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-bold text-primary mb-1">Keyboard Shortcuts</h4>
          <p class="text-xs text-base-content/85"><kbd class="kbd kbd-sm bg-base-200">Ctrl+Enter</kbd> runs manual sanitization. <kbd class="kbd kbd-sm bg-base-200">Ctrl+Shift+F</kbd> toggles the Output Find &amp; Replace tool panel.</p>
        </div>
        <div>
          <h4 class="text-sm font-bold text-primary mb-1">Best Practices</h4>
          <ul class="list-disc pl-5 text-xs text-base-content/80 space-y-1">
            <li>Test custom rules on small texts before running on large documents.</li>
            <li>Use the History list to track text modifications and restore previous versions.</li>
            <li>Set higher priority numbers for rules that should execute last (applied sequentially).</li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-bold text-primary mb-1">Performance</h4>
          <p class="text-xs text-base-content/85">Optimized to handle text strings up to 1 MB instantly. Highlighting runs in Web worker or lightweight DOM passes to maintain smooth text entry.</p>
        </div>
      </div>
    </div>

    <!-- About the Creator Card -->
    <div class="bg-base-100 border border-base-300 rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
      <h2 class="text-2xl font-bold text-base-content flex items-center gap-3 border-b border-base-300 pb-4 mb-6">
        <span>👤</span> About the Creator
      </h2>
      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-bold text-primary mb-1">Created by Sano (Sanwar Hosen)</h4>
          <p class="text-xs text-base-content/85">A software developer passionate about building clean, efficient, and user-centric utilities.</p>
          <div class="flex flex-wrap gap-3 mt-3 text-xs">
            <a href="https://github.com/sanwar-hosen" target="_blank" class="link link-primary font-medium flex items-center gap-1">
              <span>GitHub:</span> @sanwar-hosen
            </a>
            <a href="https://www.linkedin.com/in/sanwar-hosen/" target="_blank" class="link link-primary font-medium flex items-center gap-1">
              <span>LinkedIn:</span> Connect with Sano
            </a>
            <a href="https://github.com/sanwar-hosen/txt-sanitizer" target="_blank" class="link link-primary font-medium flex items-center gap-1">
              <span>Repository:</span> TxT-Sanitizer
            </a>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-bold text-primary mb-1">Development Philosophy</h4>
          <ul class="list-disc pl-5 text-xs text-base-content/80 space-y-1">
            <li><strong>Clean Code:</strong> Prioritize structural maintainability.</li>
            <li><strong>User Experience:</strong> Responsive layout, low-latency, and fluid actions.</li>
            <li><strong>Accessibility:</strong> Proper contrast, keyboard handling, and styling.</li>
          </ul>
        </div>
        <div class="pt-2 text-xs border-t border-base-200 flex justify-between items-center text-base-content/60">
          <span>Version 2.0.0</span>
          <span>Updated: May 2026</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Quote Footer -->
  <div class="text-center py-6 border-t border-base-300 mt-8 space-y-2">
    <p class="italic text-base-content/70 text-sm">
      TxT Sanitizer — Making text cleaning simple and efficient 🪄
    </p>
  </div>

</div>
`.trim();

export async function GET() {
  try {
    const db = getDB();

    if (db) {
      const row = await db
        .prepare('SELECT html_content FROM about_content WHERE id = 1')
        .first();

      if (row?.html_content) {
        return NextResponse.json({ html: row.html_content as string });
      }
    }
  } catch {
    // DB not available — fall through
  }

  return NextResponse.json({ html: DEFAULT_ABOUT_HTML });
}
