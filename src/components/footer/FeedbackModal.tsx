'use client';

import { useState, useCallback } from 'react';
import Modal from '@/components/shared/Modal';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const canSubmit = subject.trim() && message.trim() && status !== 'sending';

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setStatus('sending');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim() || undefined, subject: subject.trim(), message: message.trim() }),
      });

      if (res.status === 429) {
        setErrorMsg('Too many requests. Please wait a while before sending again.');
        setStatus('error');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { error?: string }).error ?? 'Failed to send feedback. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
        // Reset after close animation
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
      setStatus('idle');
    }, 300);
  }, [onClose, status]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Send Feedback"
      size="md"
      persistent={status === 'sending'}
      footer={
        status === 'success' ? undefined : (
          <>
            <button
              onClick={handleClose}
              disabled={status === 'sending'}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high border border-outline-variant transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-primary bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
            >
              {status === 'sending' && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {status === 'sending' ? 'Sending…' : 'Send Feedback'}
            </button>
          </>
        )
      }
    >
      {status === 'success' ? (
        <div className="text-center py-6" style={{ animation: 'modalSlideUp 0.25s ease-out' }}>
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">Feedback Sent!</h3>
          <p className="text-sm text-on-surface-variant">Thank you for your feedback. We appreciate it.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {status === 'error' && errorMsg && (
            <div className="px-3 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Email — optional */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Email <span className="font-normal normal-case tracking-normal text-on-surface-variant/60">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
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
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none custom-scrollbar"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
