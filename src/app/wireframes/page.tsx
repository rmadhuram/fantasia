"use client";

import { useRef, useState } from "react";
import IsoCanvas from "@/components/IsoCanvas";
import VertexEditor from "@/components/VertexEditor";
import EdgeEditor from "@/components/EdgeEditor";
import JsonDialog from "@/components/JsonDialog";
import { PRESET_SCENES, createCubeScene, type Edge, type PresetSceneKey, type Vertex } from "@/lib/scene";

function isVertex(v: unknown): v is Vertex {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Vertex).id === "number" &&
    typeof (v as Vertex).x === "number" &&
    typeof (v as Vertex).y === "number" &&
    typeof (v as Vertex).z === "number"
  );
}

function isEdge(e: unknown): e is Edge {
  return (
    typeof e === "object" &&
    e !== null &&
    typeof (e as Edge).id === "number" &&
    typeof (e as Edge).a === "number" &&
    typeof (e as Edge).b === "number"
  );
}

function parseWireframeJson(text: string): { vertices: Vertex[]; edges: Edge[] } {
  const data = JSON.parse(text);
  if (!Array.isArray(data?.vertices) || !data.vertices.every(isVertex)) {
    throw new Error("Invalid vertices in file");
  }
  if (!Array.isArray(data?.edges) || !data.edges.every(isEdge)) {
    throw new Error("Invalid edges in file");
  }
  return { vertices: data.vertices, edges: data.edges };
}

export default function WireframesPage() {
  const [initialScene] = useState(createCubeScene);
  const [vertices, setVertices] = useState<Vertex[]>(initialScene.vertices);
  const [edges, setEdges] = useState<Edge[]>(initialScene.edges);
  const nextVertexId = useRef(initialScene.nextVertexId);
  const nextEdgeId = useRef(initialScene.nextEdgeId);
  const [dialog, setDialog] = useState<"export" | "import" | null>(null);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  function loadScene(scene: { vertices: Vertex[]; edges: Edge[] }) {
    setVertices(scene.vertices);
    setEdges(scene.edges);
    nextVertexId.current = Math.max(0, ...scene.vertices.map((v) => v.id + 1));
    nextEdgeId.current = Math.max(0, ...scene.edges.map((e) => e.id + 1));
  }

  function loadPreset(key: PresetSceneKey) {
    const scene = PRESET_SCENES[key].create();
    loadScene(scene);
  }

  function clearAll() {
    loadScene({ vertices: [], edges: [] });
  }

  function openExportDialog() {
    setDialog("export");
  }

  function openImportDialog() {
    setImportText("");
    setImportError(null);
    setDialog("import");
  }

  function handleImportSubmit() {
    try {
      loadScene(parseWireframeJson(importText));
      setDialog(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Invalid JSON");
    }
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
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {Object.entries(PRESET_SCENES).map(([key, preset]) => (
                <button key={key} onClick={() => loadPreset(key as PresetSceneKey)}>
                  {preset.label}
                </button>
              ))}
            </div>
            <button onClick={clearAll}>Clear</button>
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
            <h2 style={{ fontSize: "1rem", margin: 0 }}>File</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={openExportDialog}>Export</button>
              <button onClick={openImportDialog}>Import</button>
            </div>
          </section>
          <VertexEditor vertices={vertices} onAdd={addVertex} onUpdate={updateVertex} onDelete={deleteVertex} />
          <EdgeEditor vertices={vertices} edges={edges} onAdd={addEdge} onDelete={deleteEdge} />
        </div>
        <IsoCanvas vertices={vertices} edges={edges} />
      </div>
      {dialog === "export" && (
        <JsonDialog
          title="Export wireframe"
          value={JSON.stringify({ vertices, edges }, null, 2)}
          onValueChange={() => {}}
          readOnly
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "import" && (
        <JsonDialog
          title="Import wireframe"
          value={importText}
          onValueChange={setImportText}
          error={importError}
          onClose={() => setDialog(null)}
          onSubmit={handleImportSubmit}
          submitLabel="Load"
        />
      )}
    </div>
  );
}
