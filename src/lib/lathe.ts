import { buildScene, type Scene } from "@/lib/scene";

export interface ProfilePoint {
  x: number; // radius, >= 0
  y: number; // height
}

// Revolves a profile curve (radius vs. height, in the x-y half-plane) around
// the Y axis to build a solid-of-revolution wireframe: each profile point
// sweeps out a ring of vertices, "meridian" edges run along the surface from
// ring to ring, and "latitude" edges trace each ring itself.
export function createLatheScene(profile: ProfilePoint[], segments: number): Scene {
  if (profile.length === 0 || segments < 3) {
    return { vertices: [], edges: [], nextVertexId: 0, nextEdgeId: 0 };
  }

  const sorted = [...profile].sort((a, b) => a.y - b.y);
  const positions = [];
  for (const point of sorted) {
    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      positions.push({ x: point.x * Math.cos(angle), y: point.y, z: point.x * Math.sin(angle) });
    }
  }

  const pairs: [number, number][] = [];
  for (let pi = 0; pi < sorted.length; pi++) {
    for (let s = 0; s < segments; s++) {
      const index = pi * segments + s;
      // latitude: ring around the current profile point
      const next = pi * segments + ((s + 1) % segments);
      pairs.push([index, next]);
      // meridian: along the surface to the next profile point
      if (pi < sorted.length - 1) pairs.push([index, index + segments]);
    }
  }

  return buildScene(positions, pairs);
}
