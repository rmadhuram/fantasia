"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, TRUE_ISO_PITCH, TRUE_ISO_YAW, type ScreenPoint, type Vec3 } from "@/lib/iso";
import type { Edge, Vertex } from "@/lib/scene";

const AXIS_LENGTH = 5;
const MIN_SCALE = 15;
const MAX_SCALE = 220;
const VERTEX_COLOR = "#f1c40f";
const EDGE_COLOR = "#9bd1f0";

function drawLine(ctx: CanvasRenderingContext2D, a: ScreenPoint, b: ScreenPoint, color: string, dashed = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  if (dashed) ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawArrowhead(ctx: CanvasRenderingContext2D, tip: ScreenPoint, from: ScreenPoint, color: string) {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
  const size = 8;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x - size * Math.cos(angle - Math.PI / 6), tip.y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tip.x - size * Math.cos(angle + Math.PI / 6), tip.y - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawAxis(ctx: CanvasRenderingContext2D, camera: Camera, dir: Vec3, color: string, label: string) {
  const origin = camera.project({ x: 0, y: 0, z: 0 });
  const positive = camera.project({ x: dir.x * AXIS_LENGTH, y: dir.y * AXIS_LENGTH, z: dir.z * AXIS_LENGTH });
  const negative = camera.project({ x: -dir.x * AXIS_LENGTH, y: -dir.y * AXIS_LENGTH, z: -dir.z * AXIS_LENGTH });

  drawLine(ctx, negative, positive, color);
  drawArrowhead(ctx, positive, origin, color);

  ctx.fillStyle = color;
  ctx.font = "bold 16px sans-serif";
  const labelPos = camera.project({
    x: dir.x * (AXIS_LENGTH + 0.5),
    y: dir.y * (AXIS_LENGTH + 0.5),
    z: dir.z * (AXIS_LENGTH + 0.5),
  });
  ctx.fillText(label, labelPos.x, labelPos.y);

  for (let i = -AXIS_LENGTH; i <= AXIS_LENGTH; i++) {
    if (i === 0) continue;
    const tick = camera.project({ x: dir.x * i, y: dir.y * i, z: dir.z * i });
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(tick.x, tick.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGroundGrid(ctx: CanvasRenderingContext2D, camera: Camera) {
  const gridColor = "rgba(255,255,255,0.08)";
  for (let i = -AXIS_LENGTH; i <= AXIS_LENGTH; i++) {
    drawLine(ctx, camera.project({ x: i, y: 0, z: -AXIS_LENGTH }), camera.project({ x: i, y: 0, z: AXIS_LENGTH }), gridColor);
    drawLine(ctx, camera.project({ x: -AXIS_LENGTH, y: 0, z: i }), camera.project({ x: AXIS_LENGTH, y: 0, z: i }), gridColor);
  }
}

function plotVertex(ctx: CanvasRenderingContext2D, camera: Camera, vertex: Vertex, showLabel: boolean) {
  const screen = camera.project(vertex);

  ctx.fillStyle = VERTEX_COLOR;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y, showLabel ? 5 : 2, 0, Math.PI * 2);
  ctx.fill();

  if (showLabel) {
    ctx.fillStyle = "#e8e8ec";
    ctx.font = "12px sans-serif";
    ctx.fillText(`#${vertex.id}`, screen.x + 8, screen.y - 8);
  }
}

export default function IsoCanvas({ vertices, edges }: { vertices: Vertex[]; edges: Edge[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState(TRUE_ISO_YAW);
  const [pitch, setPitch] = useState(TRUE_ISO_PITCH);
  const [scale, setScale] = useState(60);
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showEdges, setShowEdges] = useState(true);

  const dragState = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const camera = new Camera(width / 2, height / 2 + height * 0.12, scale, yaw, pitch);

    if (showGrid) {
      drawGroundGrid(ctx, camera);
    }
    if (showAxes) {
      drawAxis(ctx, camera, { x: 1, y: 0, z: 0 }, "#e74c3c", "X");
      drawAxis(ctx, camera, { x: 0, y: 1, z: 0 }, "#2ecc71", "Y");
      drawAxis(ctx, camera, { x: 0, y: 0, z: 1 }, "#3498db", "Z");
    }

    if (showEdges) {
      const verticesById = new Map(vertices.map((v) => [v.id, v]));
      for (const edge of edges) {
        const a = verticesById.get(edge.a);
        const b = verticesById.get(edge.b);
        if (!a || !b) continue;
        drawLine(ctx, camera.project(a), camera.project(b), EDGE_COLOR);
      }
    }

    const showVertexLabels = vertices.length <= 50;
    for (const vertex of vertices) {
      plotVertex(ctx, camera, vertex, showVertexLabels);
    }
  }, [yaw, pitch, scale, showAxes, showGrid, showEdges, vertices, edges]);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    dragState.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    dragState.current = { x: e.clientX, y: e.clientY };

    const ROTATE_SENSITIVITY = 0.005;
    setYaw((prev) => prev + dx * ROTATE_SENSITIVITY);
    setPitch((prev) => {
      const next = prev - dy * ROTATE_SENSITIVITY;
      const limit = Math.PI / 2 - 0.05;
      return Math.min(limit, Math.max(-limit, next));
    });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    dragState.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const ZOOM_SENSITIVITY = 0.0015;
    setScale((prev) => {
      const next = prev * (1 - e.deltaY * ZOOM_SENSITIVITY);
      return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    });
  }

  function resetView() {
    setYaw(TRUE_ISO_YAW);
    setPitch(TRUE_ISO_PITCH);
    setScale(60);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={900}
        height={650}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{ touchAction: "none", cursor: "grab", background: "#14141a", border: "1px solid #333" }}
      />
      <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <button onClick={resetView}>Reset view</button>
        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.9rem" }}>
          <input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} />
          Show axes
        </label>
        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.9rem" }}>
          <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
          Show grid
        </label>
        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.9rem" }}>
          <input type="checkbox" checked={showEdges} onChange={(e) => setShowEdges(e.target.checked)} />
          Show edges
        </label>
        <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>
          Drag to rotate · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
