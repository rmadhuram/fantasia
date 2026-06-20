"use client";

import { useState } from "react";
import IsoCanvas from "@/components/IsoCanvas";
import ProfileEditor, { type ProfilePoint } from "@/components/ProfileEditor";
import { createLatheScene } from "@/lib/lathe";

const DEFAULT_PROFILE: ProfilePoint[] = [
  { id: 0, x: 0.6, y: 0 },
  { id: 1, x: 1, y: 0.4 },
  { id: 2, x: 0.5, y: 1.6 },
  { id: 3, x: 0.9, y: 2.4 },
  { id: 4, x: 0.2, y: 3 },
];

export default function SolidOfRevolutionPage() {
  const [points, setPoints] = useState<ProfilePoint[]>(DEFAULT_PROFILE);
  const [segments, setSegments] = useState(16);

  const scene = createLatheScene(points, segments);

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
            <h2 style={{ fontSize: "1rem", margin: 0 }}>Profile</h2>
            <ProfileEditor points={points} onChange={setPoints} />
            <p style={{ opacity: 0.5, fontSize: "0.75rem", margin: 0 }}>
              Click to add a point, drag to move it, double-click to delete it.
            </p>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.85rem" }}>
              Segments
              <input
                type="number"
                min={3}
                max={48}
                value={segments}
                onChange={(e) => setSegments(Math.max(3, Math.min(48, Number(e.target.value) || 3)))}
                style={{
                  width: "4rem",
                  background: "#0e0e12",
                  color: "#e8e8ec",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  padding: "0.25rem 0.4rem",
                }}
              />
            </label>
            <button onClick={() => setPoints([])}>Clear points</button>
          </section>
        </div>
        <IsoCanvas vertices={scene.vertices} edges={scene.edges} />
      </div>
    </div>
  );
}
