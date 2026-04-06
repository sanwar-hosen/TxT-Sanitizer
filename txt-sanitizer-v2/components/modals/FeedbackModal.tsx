type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
};

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ background: "#ffffff", padding: "1rem", width: "min(520px, 92vw)" }}>
        <h2>Feedback</h2>
        <p>Feedback form placeholder (email, subject, message).</p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
