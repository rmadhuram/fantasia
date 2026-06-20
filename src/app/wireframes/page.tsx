"use client";

import { useRef, useState } from "react";
import IsoCanvas from "@/components/IsoCanvas";
import VertexEditor from "@/components/VertexEditor";
import EdgeEditor from "@/components/EdgeEditor";
import { PRESET_SCENES, createCubeScene, type Edge, type PresetSceneKey, type Vertex } from "@/lib/scene";

export default function WireframesPage() {
  const initial = useRef(createCubeScene());
  const [vertices, setVertices] = useState<Vertex[]>(initial.current.vertices);
  const [edges, setEdges] = useState<Edge[]>(initial.current.edges);
  const nextVertexId = useRef(initial.current.nextVertexId);
  const nextEdgeId = useRef(initial.current.nextEdgeId);

  function loadPreset(key: PresetSceneKey) {
    const scene = PRESET_SCENES[key].create();
    setVertices(scene.vertices);
    setEdges(scene.edges);
    nextVertexId.current = scene.nextVertexId;
    nextEdgeId.current = scene.nextEdgeId;
  }

  function addVertex(x: number, y: number, z: number) {
    const id = nextVertexId.current++;
    setVertices((prev) => [...prev, { id, x, y, z }]);
  }

  function updateVertex(id: number, x: number, y: number, z: number) {
    setVertices((prev) => prev.map((v) => (v.id === id ? { id, x, y, z } : v)));
  }

  function deleteVertex(id: number) {
    setVertices((prev) => prev.filter((v) => v.id !== id));
    setEdges((prev) => prev.filter((e) => e.a !== id && e.b !== id));
  }

  function addEdge(a: number, b: number) {
    setEdges((prev) => {
      if (prev.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))) return prev;
      return [...prev, { id: nextEdgeId.current++, a, b }];
    });
  }

  function deleteEdge(id: number) {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        <div style={{ width: "16rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
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
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {Object.entries(PRESET_SCENES).map(([key, preset]) => (
                <button key={key} onClick={() => loadPreset(key as PresetSceneKey)}>
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
          <VertexEditor vertices={vertices} onAdd={addVertex} onUpdate={updateVertex} onDelete={deleteVertex} />
          <EdgeEditor vertices={vertices} edges={edges} onAdd={addEdge} onDelete={deleteEdge} />
        </div>
        <IsoCanvas vertices={vertices} edges={edges} />
      </div>
    </div>
  );
}
