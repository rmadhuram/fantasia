"use client";

import { useState } from "react";
import type { Vertex } from "@/lib/scene";

const panelStyle: React.CSSProperties = {
  border: "1px solid #333",
  borderRadius: "6px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const inputStyle: React.CSSProperties = {
  width: "4rem",
  background: "#0e0e12",
  color: "#e8e8ec",
  border: "1px solid #444",
  borderRadius: "4px",
  padding: "0.25rem 0.4rem",
};

const coordInputStyle: React.CSSProperties = {
  ...inputStyle,
  width: "3rem",
  padding: "0.15rem 0.3rem",
};

function VertexRow({
  vertex,
  onUpdate,
  onDelete,
}: {
  vertex: Vertex;
  onUpdate: (id: number, x: number, y: number, z: number) => void;
  onDelete: (id: number) => void;
}) {
  const [x, setX] = useState(vertex.x.toString());
  const [y, setY] = useState(vertex.y.toString());
  const [z, setZ] = useState(vertex.z.toString());

  function commit(nx: string, ny: string, nz: string) {
    const parsedX = Number(nx);
    const parsedY = Number(ny);
    const parsedZ = Number(nz);
    if ([parsedX, parsedY, parsedZ].some(Number.isNaN)) return;
    onUpdate(vertex.id, parsedX, parsedY, parsedZ);
  }

  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0",
        fontSize: "0.85rem",
      }}
    >
      <span style={{ opacity: 0.7 }}>#{vertex.id}</span>
      <input
        style={coordInputStyle}
        value={x}
        onChange={(e) => setX(e.target.value)}
        onBlur={() => commit(x, y, z)}
        aria-label={`vertex ${vertex.id} x`}
      />
      <input
        style={coordInputStyle}
        value={y}
        onChange={(e) => setY(e.target.value)}
        onBlur={() => commit(x, y, z)}
        aria-label={`vertex ${vertex.id} y`}
      />
      <input
        style={coordInputStyle}
        value={z}
        onChange={(e) => setZ(e.target.value)}
        onBlur={() => commit(x, y, z)}
        aria-label={`vertex ${vertex.id} z`}
      />
      <button onClick={() => onDelete(vertex.id)} aria-label={`Delete vertex ${vertex.id}`}>
        ✕
      </button>
    </li>
  );
}

export default function VertexEditor({
  vertices,
  onAdd,
  onUpdate,
  onDelete,
}: {
  vertices: Vertex[];
  onAdd: (x: number, y: number, z: number) => void;
  onUpdate: (id: number, x: number, y: number, z: number) => void;
  onDelete: (id: number) => void;
}) {
  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [z, setZ] = useState("0");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nx = Number(x);
    const ny = Number(y);
    const nz = Number(z);
    if ([nx, ny, nz].some(Number.isNaN)) return;
    onAdd(nx, ny, nz);
  }

  return (
    <section style={panelStyle}>
      <h2 style={{ fontSize: "1rem", margin: 0 }}>Vertices</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <input style={inputStyle} value={x} onChange={(e) => setX(e.target.value)} aria-label="x" />
        <input style={inputStyle} value={y} onChange={(e) => setY(e.target.value)} aria-label="y" />
        <input style={inputStyle} value={z} onChange={(e) => setZ(e.target.value)} aria-label="z" />
        <button type="submit">Add</button>
      </form>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: "12rem", overflowY: "auto" }}>
        {vertices.map((v) => (
          <VertexRow key={v.id} vertex={v} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}
