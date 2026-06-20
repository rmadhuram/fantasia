"use client";

import { useState } from "react";
import IsoCanvas from "@/components/IsoCanvas";
import FunctionEditor from "@/components/FunctionEditor";
import { compileExpression } from "@/lib/expr";
import { createFunctionMeshScene } from "@/lib/mesh";
import type { Edge, Vertex } from "@/lib/scene";

const DEFAULT_FUNCTION = "sin(x) * cos(z)";
const GRID_OPTIONS = { min: -3, max: 3, steps: 24 };

function buildMesh(source: string) {
  const fn = compileExpression(source);
  const scene = createFunctionMeshScene(fn, GRID_OPTIONS);
  return { vertices: scene.vertices, edges: scene.edges };
}

const initial = buildMesh(DEFAULT_FUNCTION);

export default function MeshesPage() {
  const [functionText, setFunctionText] = useState(DEFAULT_FUNCTION);
  const [vertices, setVertices] = useState<Vertex[]>(initial.vertices);
  const [edges, setEdges] = useState<Edge[]>(initial.edges);
  const [error, setError] = useState<string | null>(null);

  function handleApply(source: string) {
    try {
      const mesh = buildMesh(source);
      setVertices(mesh.vertices);
      setEdges(mesh.edges);
      setFunctionText(source);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid expression");
    }
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        <div style={{ width: "16rem", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <FunctionEditor value={functionText} error={error} onApply={handleApply} />
        </div>
        <IsoCanvas vertices={vertices} edges={edges} />
      </div>
    </div>
  );
}
