"use client";

import { useState } from "react";
import type { Edge, Vertex } from "@/lib/scene";

const panelStyle: React.CSSProperties = {
  border: "1px solid #333",
  borderRadius: "6px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const selectStyle: React.CSSProperties = {
  background: "#0e0e12",
  color: "#e8e8ec",
  border: "1px solid #444",
  borderRadius: "4px",
  padding: "0.25rem 0.4rem",
};

export default function EdgeEditor({
  vertices,
  edges,
  onAdd,
  onDelete,
}: {
  vertices: Vertex[];
  edges: Edge[];
  onAdd: (a: number, b: number) => void;
  onDelete: (id: number) => void;
}) {
  const [a, setA] = useState<string>(vertices[0]?.id.toString() ?? "");
  const [b, setB] = useState<string>(vertices[1]?.id.toString() ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idA = Number(a);
    const idB = Number(b);
    if (Number.isNaN(idA) || Number.isNaN(idB) || idA === idB) return;
    onAdd(idA, idB);
  }

  return (
    <section style={panelStyle}>
      <h2 style={{ fontSize: "1rem", margin: 0 }}>Edges</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <select style={selectStyle} value={a} onChange={(e) => setA(e.target.value)} aria-label="vertex a">
          {vertices.map((v) => (
            <option key={v.id} value={v.id}>
              #{v.id}
            </option>
          ))}
        </select>
        <span>—</span>
        <select style={selectStyle} value={b} onChange={(e) => setB(e.target.value)} aria-label="vertex b">
          {vertices.map((v) => (
            <option key={v.id} value={v.id}>
              #{v.id}
            </option>
          ))}
        </select>
        <button type="submit" disabled={vertices.length < 2}>
          Add
        </button>
      </form>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: "12rem", overflowY: "auto" }}>
        {edges.map((edge) => (
          <li
            key={edge.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.2rem 0",
              fontSize: "0.85rem",
            }}
          >
            <span>
              #{edge.a} — #{edge.b}
            </span>
            <button onClick={() => onDelete(edge.id)} aria-label={`Delete edge ${edge.id}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
