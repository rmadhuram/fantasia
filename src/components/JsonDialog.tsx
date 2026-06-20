"use client";

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

const dialogStyle: React.CSSProperties = {
  background: "#1e1e24",
  border: "1px solid #444",
  borderRadius: "8px",
  padding: "1.25rem",
  width: "32rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: "20rem",
  background: "#0e0e12",
  color: "#e8e8ec",
  border: "1px solid #444",
  borderRadius: "4px",
  padding: "0.5rem",
  fontFamily: "monospace",
  fontSize: "0.8rem",
  resize: "vertical",
};

export default function JsonDialog({
  title,
  value,
  onValueChange,
  readOnly,
  error,
  onClose,
  onSubmit,
  submitLabel,
}: {
  title: string;
  value: string;
  onValueChange: (value: string) => void;
  readOnly?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: "1rem", margin: 0 }}>{title}</h2>
        <textarea
          style={textareaStyle}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          autoFocus
        />
        {error && <p style={{ color: "#e74c3c", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button onClick={onClose}>Close</button>
          {onSubmit && <button onClick={onSubmit}>{submitLabel ?? "Apply"}</button>}
        </div>
      </div>
    </div>
  );
}
