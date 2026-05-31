'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Modal from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { Alert } from '@/components/shared/Alert';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'success' | 'error' | 'cooldown';

const LS_COOLDOWN_KEY = 'txts_v2_feedbackCooldownUntil';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns ms until cooldown ends, or 0 if not in cooldown. */
function getCooldownRemaining(): number {
  try {
    const until = parseInt(localStorage.getItem(LS_COOLDOWN_KEY) ?? '0', 10);
    const remaining = until - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

function setCooldown(retryAfterMs: number) {
  try {
    localStorage.setItem(LS_COOLDOWN_KEY, String(Date.now() + retryAfterMs));
  } catch {
    // ignore
  }
}

function formatCooldown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.ceil((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownMs, setCooldownMs] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check localStorage cooldown on open
  useEffect(() => {
    if (!open) return;
    const remaining = getCooldownRemaining();
    if (remaining > 0) {
      setCooldownMs(remaining);
      setStatus('cooldown');
    } else {
      setStatus('idle');
      setCooldownMs(0);
    }
  }, [open]);

  // Live countdown ticker
  useEffect(() => {
    if (status !== 'cooldown') {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      const remaining = getCooldownRemaining();
      if (remaining <= 0) {
        setCooldownMs(0);
        setStatus('idle');
        clearInterval(tickRef.current!);
      } else {
        setCooldownMs(remaining);
      }
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status]);

  const isEmailValid = !email.trim() || emailRegex.test(email.trim());

  const canSubmit =
    subject.trim() &&
    message.trim() &&
    isEmailValid &&
    status !== 'sending' &&
    status !== 'cooldown';

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setStatus('sending');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({})) as { error?: string; retryAfterMs?: number };
        const retryAfterMs = data.retryAfterMs ?? 24 * 60 * 60 * 1000;
        setCooldown(retryAfterMs);
        setCooldownMs(retryAfterMs);
        setStatus('cooldown');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          (data as { error?: string }).error ?? 'Failed to send feedback. Please try again.'
        );
        setStatus('error');
        return;
      }

      // Success — store cooldown so they can't submit again for 24h
      setCooldown(24 * 60 * 60 * 1000);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setEmail('');
          setSubject('');
          setMessage('');
          setStatus('idle');
          setErrorMsg(null);
        }, 300);
      }, 1800);
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }, [canSubmit, email, subject, message, onClose]);

  const handleClose = useCallback(() => {
    if (status === 'sending') return;
    onClose();
    setTimeout(() => {
      setEmail('');
      setSubject('');
      setMessage('');
      if (status !== 'cooldown') setStatus('idle');
      setErrorMsg(null);
    }, 300);
  }, [onClose, status]);

  const isCooldown = status === 'cooldown';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Send Feedback"
      size="md"
      persistent={status === 'sending'}
      footer={
        status === 'success' ? undefined : isCooldown ? (
          <Button onClick={handleClose} variant="secondary">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={status === 'sending'} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit} variant="primary">
              {status === 'sending' && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {status === 'sending' ? 'Sending…' : 'Send Feedback'}
            </Button>
          </>
        )
      }
    >
      {status === 'success' ? (
        /* ── Success state ───────────────────────────────────────────────── */
        <div className="text-center py-6" style={{ animation: 'modalSlideUp 0.25s ease-out' }}>
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">Feedback Sent!</h3>
          <p className="text-sm text-on-surface-variant">
            Thank you for your feedback. We appreciate it.
          </p>
        </div>
      ) : isCooldown ? (
        /* ── Cooldown state ──────────────────────────────────────────────── */
        <div className="text-center py-6" style={{ animation: 'modalSlideUp 0.25s ease-out' }}>
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-500"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">
            Feedback already sent today
          </h3>
          <p className="text-sm text-on-surface-variant mb-4">
            You can send another feedback in:
          </p>
          {/* Countdown pill */}
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-full px-5 py-2">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {formatCooldown(cooldownMs)}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-4">
            Limit resets 24 hours after your last submission.
          </p>
        </div>
      ) : (
        /* ── Form state ──────────────────────────────────────────────────── */
        <div className="space-y-4">
          {status === 'error' && errorMsg && (
            <Alert variant="error" message={errorMsg} className="py-2.5 px-3" />
          )}

          {/* Email — optional */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Email{' '}
              <span className="font-normal normal-case tracking-normal text-on-surface-variant/60">
                (optional)
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-[var(--surface-2)] text-sm text-on-surface focus:outline-none focus:ring-2 transition-colors ${
                email.trim() && !emailRegex.test(email.trim())
                  ? 'border-error focus:ring-error/30 focus:border-error'
                  : 'border-outline-variant dark:border-[var(--border)] focus:ring-primary/30 focus:border-primary'
              }`}
            />
            {email.trim() && !emailRegex.test(email.trim()) && (
              <p className="text-[11px] text-error mt-1">Please enter a valid email address.</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Subject <span className="text-error">*</span>
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-[var(--border)] bg-white dark:bg-[var(--surface-2)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Message <span className="text-error">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think…"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant dark:border-[var(--border)] bg-white dark:bg-[var(--surface-2)] text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none custom-scrollbar"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
