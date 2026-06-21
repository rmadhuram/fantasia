"use client";

import { useState } from "react";

const panelStyle: React.CSSProperties = {
  border: "1px solid #333",
  borderRadius: "6px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0e0e12",
  color: "#e8e8ec",
  border: "1px solid #444",
  borderRadius: "4px",
  padding: "0.4rem 0.5rem",
  fontFamily: "monospace",
};

export default function FunctionEditor({
  value,
  error,
  onApply,
}: {
  value: string;
  error: string | null;
  onApply: (source: string) => void;
}) {
  const [text, setText] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onApply(text);
  }

  return (
    <section style={panelStyle}>
      <h2 style={{ fontSize: "1rem", margin: 0 }}>Function</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontSize: "0.85rem", opacity: 0.8 }}>y = f(x, z) =</label>
        <input
          style={inputStyle}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="function of x and z"
          spellCheck={false}
        />
        <button type="submit">Apply</button>
      </form>
      {error && <p style={{ color: "#e74c3c", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
      <p style={{ opacity: 0.5, fontSize: "0.75rem", margin: 0 }}>
        Supports + - * / ^, parentheses, sin/cos/tan/sqrt/abs/exp/log/pow/min/max/hypot, and constants pi, e.
      </p>
    </section>
  );
}
