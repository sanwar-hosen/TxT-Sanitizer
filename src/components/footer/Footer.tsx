'use client';

import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] py-4">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-3 px-5 text-xs text-[var(--text-muted)]">
          <span>
            Made with{" "}
            <span className="text-[var(--brand)]">💙</span> by{" "}
            <span className="font-semibold text-[var(--brand)]">Sano</span>
          </span>

          <div className="flex items-center gap-4">
            {/* Feedback link — opens modal */}
            <button
              onClick={() => setFeedbackOpen(true)}
              className="transition hover:text-[var(--brand)] hover:underline"
            >
              Send Feedback
            </button>

            <span className="text-[var(--border)]">|</span>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition hover:text-[var(--brand)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>

            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition hover:text-[var(--brand)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.448 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
              </svg>
              Telegram
            </a>
          </div>
        </div>
      </footer>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
