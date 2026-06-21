"use client";

import { useState } from "react";
import IsoCanvas from "@/components/IsoCanvas";
import FunctionEditor from "@/components/FunctionEditor";
import { compileExpression } from "@/lib/expr";
import { createFunctionMeshScene } from "@/lib/mesh";
import type { Edge, Vertex } from "@/lib/scene";

const DEFAULT_FUNCTION = "sin(x) * cos(z)";
const DEFAULT_STEPS = 40;
const MIN_STEPS = 30;
const MAX_STEPS = 120;

const MESH_PRESETS = [
  { label: "Half Sphere", source: "sqrt(9 - x*x - z*z)" },
  { label: "Wave", source: "sin(x) + cos(z)" },
  { label: "Sinc", source: "sin(4*sqrt(x*x+z*z))/sqrt(x*x+z*z)" },
];

function buildMesh(source: string, steps: number) {
  const fn = compileExpression(source);
  const scene = createFunctionMeshScene(fn, { min: -5, max: 5, steps });
  return { vertices: scene.vertices, edges: scene.edges };
}

const initial = buildMesh(DEFAULT_FUNCTION, DEFAULT_STEPS);

export default function MeshesPage() {
  const [functionText, setFunctionText] = useState(DEFAULT_FUNCTION);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [vertices, setVertices] = useState<Vertex[]>(initial.vertices);
  const [edges, setEdges] = useState<Edge[]>(initial.edges);
  const [error, setError] = useState<string | null>(null);

  function rebuild(source: string, stepCount: number) {
    try {
      const mesh = buildMesh(source, stepCount);
      setVertices(mesh.vertices);
      setEdges(mesh.edges);
      setFunctionText(source);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid expression");
    }
  }

  function handleApply(source: string) {
    rebuild(source, steps);
  }

  function handleStepsChange(next: number) {
    setSteps(next);
    rebuild(functionText, next);
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        <div style={{ width: "16rem", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <section
            style={{
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Presets</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {MESH_PRESETS.map((preset) => (
                <button key={preset.label} onClick={() => handleApply(preset.source)}>
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
          <section
            style={{
              border: "1px solid #333",
              borderRadius: "6px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
              Steps: {steps}
              <input
                type="range"
                min={MIN_STEPS}
                max={MAX_STEPS}
                value={steps}
                onChange={(e) => handleStepsChange(Number(e.target.value))}
              />
            </label>
          </section>
          <FunctionEditor value={functionText} error={error} onApply={handleApply} />
        </div>
        <IsoCanvas vertices={vertices} edges={edges} />
      </div>
    </div>
  );
}
