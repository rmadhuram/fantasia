import { buildScene, type Scene } from "@/lib/scene";
import type { CompiledExpr } from "@/lib/expr";

const Y_CLAMP = 8;

export interface FunctionMeshOptions {
  min: number;
  max: number;
  steps: number; // grid divisions per axis
}

// Samples y = f(x, z) over a square grid in the x/z plane and connects each
// sample to its row/column neighbors, producing a wireframe surface mesh.
export function createFunctionMeshScene(fn: CompiledExpr, options: FunctionMeshOptions): Scene {
  const { min, max, steps } = options;
  const pointsPerSide = steps + 1;
  const step = (max - min) / steps;

  const positions = [];
  for (let row = 0; row < pointsPerSide; row++) {
    const z = min + row * step;
    for (let col = 0; col < pointsPerSide; col++) {
      const x = min + col * step;
      const raw = fn(x, z);
      const y = Number.isFinite(raw) ? Math.max(-Y_CLAMP, Math.min(Y_CLAMP, raw)) : 0;
      positions.push({ x, y, z });
    }
  }

  const pairs: [number, number][] = [];
  for (let row = 0; row < pointsPerSide; row++) {
    for (let col = 0; col < pointsPerSide; col++) {
      const index = row * pointsPerSide + col;
      if (col < pointsPerSide - 1) pairs.push([index, index + 1]);
      if (row < pointsPerSide - 1) pairs.push([index, index + pointsPerSide]);
    }
  }

  return buildScene(positions, pairs);
}
