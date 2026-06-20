"use client";

import { useEffect, useRef } from "react";

export interface ProfilePoint {
  id: number;
  x: number; // radius, >= 0
  y: number; // height
}

const WIDTH = 260;
const HEIGHT = 480;
const MARGIN_LEFT = 30;
const MARGIN_BOTTOM = 30;
const MARGIN_TOP = 20;
const SCALE = 70;
const HIT_RADIUS = 10;

const originX = MARGIN_LEFT;
const originY = HEIGHT - MARGIN_BOTTOM;

function toScreen(p: { x: number; y: number }) {
  return { sx: originX + p.x * SCALE, sy: originY - p.y * SCALE };
}

function toWorld(sx: number, sy: number) {
  // Only radius is clamped — it must be non-negative to revolve sensibly.
  // Height is left unclamped so a click always places the point exactly
  // under the pointer, even below the axis line.
  return {
    x: Math.max(0, (sx - originX) / SCALE),
    y: (originY - sy) / SCALE,
  };
}

function draw(ctx: CanvasRenderingContext2D, points: ProfilePoint[]) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // axes: radius (horizontal, bottom) and height/rotation axis (vertical, left)
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(originX, MARGIN_TOP);
  ctx.lineTo(originX, originY);
  ctx.lineTo(WIDTH - 5, originY);
  ctx.stroke();

  ctx.fillStyle = "#888";
  ctx.font = "11px sans-serif";
  ctx.fillText("radius", WIDTH - 45, originY - 6);
  ctx.fillText("height", originX + 4, MARGIN_TOP + 10);

  const sorted = [...points].sort((a, b) => a.y - b.y);

  ctx.strokeStyle = "#9bd1f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  sorted.forEach((p, i) => {
    const { sx, sy } = toScreen(p);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.stroke();

  for (const p of points) {
    const { sx, sy } = toScreen(p);
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function ProfileEditor({
  points,
  onChange,
}: {
  points: ProfilePoint[];
  onChange: (points: ProfilePoint[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingId = useRef<number | null>(null);
  const nextId = useRef(Math.max(0, ...points.map((p) => p.id + 1)));

  // Pointerdown/move/up fire as separate native events. If a move lands
  // before React has re-rendered after the preceding onChange, reading the
  // `points` prop directly would operate on stale data and clobber the
  // update in flight. Routing every mutation through this ref — kept in
  // sync after every render — guarantees each handler builds on the latest
  // state regardless of render timing.
  const pointsRef = useRef(points);

  useEffect(() => {
    pointsRef.current = points;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) draw(ctx, points);
  }, [points]);

  function findNearby(sx: number, sy: number): ProfilePoint | undefined {
    return pointsRef.current.find((p) => {
      const { sx: psx, sy: psy } = toScreen(p);
      return Math.hypot(psx - sx, psy - sy) <= HIT_RADIUS;
    });
  }

  // The canvas's rendered (CSS) size doesn't necessarily match its buffer
  // resolution (WIDTH x HEIGHT) — layout, zoom, or device pixel ratio can
  // all stretch it. Scale by the ratio between the two so a click always
  // maps to the correct buffer coordinates, not just the displayed ones.
  function eventToCanvasPos(e: { clientX: number; clientY: number; currentTarget: HTMLCanvasElement }) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    return {
      sx: (e.clientX - rect.left) * scaleX,
      sy: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const { sx, sy } = eventToCanvasPos(e);
    const existing = findNearby(sx, sy);

    if (existing) {
      draggingId.current = existing.id;
    } else {
      const { x, y } = toWorld(sx, sy);
      const id = nextId.current++;
      draggingId.current = id;
      const updated = [...pointsRef.current, { id, x, y }];
      pointsRef.current = updated;
      onChange(updated);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (draggingId.current === null) return;
    const { sx, sy } = eventToCanvasPos(e);
    const { x, y } = toWorld(sx, sy);
    const updated = pointsRef.current.map((p) => (p.id === draggingId.current ? { ...p, x, y } : p));
    pointsRef.current = updated;
    onChange(updated);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    draggingId.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function handleDoubleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const { sx, sy } = eventToCanvasPos(e);
    const existing = findNearby(sx, sy);
    if (existing) {
      const updated = pointsRef.current.filter((p) => p.id !== existing.id);
      pointsRef.current = updated;
      onChange(updated);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      style={{ touchAction: "none", cursor: "crosshair", background: "#14141a", border: "1px solid #333" }}
    />
  );
}
