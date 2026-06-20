import type { Vec3 } from "@/lib/iso";
import { TEAPOT_PATCHES, TEAPOT_VERTICES } from "@/lib/teapot-data";

export interface Vertex extends Vec3 {
  id: number;
}

export interface Edge {
  id: number;
  a: number; // vertex id
  b: number; // vertex id
}

export interface Scene {
  vertices: Vertex[];
  edges: Edge[];
  nextVertexId: number;
  nextEdgeId: number;
}

export function buildScene(positions: Vec3[], pairs: [number, number][]): Scene {
  const vertices: Vertex[] = positions.map((p, id) => ({ id, ...p }));
  const edges: Edge[] = pairs.map(([a, b], id) => ({ id, a, b }));
  return { vertices, edges, nextVertexId: vertices.length, nextEdgeId: edges.length };
}

// Unit cube resting on the ground plane (y = 0), edges connecting adjacent corners.
export function createCubeScene(): Scene {
  const positions: Vec3[] = [
    { x: -1, y: 0, z: -1 },
    { x: 1, y: 0, z: -1 },
    { x: 1, y: 2, z: -1 },
    { x: -1, y: 2, z: -1 },
    { x: -1, y: 0, z: 1 },
    { x: 1, y: 0, z: 1 },
    { x: 1, y: 2, z: 1 },
    { x: -1, y: 2, z: 1 },
  ];

  const pairs: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], // bottom face
    [4, 5], [5, 6], [6, 7], [7, 4], // top face
    [0, 4], [1, 5], [2, 6], [3, 7], // verticals
  ];

  return buildScene(positions, pairs);
}

// Square pyramid resting on the ground plane (y = 0), with an apex above the base.
export function createPyramidScene(): Scene {
  const positions: Vec3[] = [
    { x: -1, y: 0, z: -1 },
    { x: 1, y: 0, z: -1 },
    { x: 1, y: 0, z: 1 },
    { x: -1, y: 0, z: 1 },
    { x: 0, y: 2, z: 0 }, // apex
  ];

  const pairs: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], // base
    [0, 4], [1, 4], [2, 4], [3, 4], // sides to apex
  ];

  return buildScene(positions, pairs);
}

// A box with a pyramid (hip) roof, resting on the ground plane (y = 0).
export function createHouseScene(): Scene {
  const wallHeight = 1.2;
  const roofHeight = 0.8;

  const positions: Vec3[] = [
    { x: -1, y: 0, z: -1 },
    { x: 1, y: 0, z: -1 },
    { x: 1, y: 0, z: 1 },
    { x: -1, y: 0, z: 1 },
    { x: -1, y: wallHeight, z: -1 },
    { x: 1, y: wallHeight, z: -1 },
    { x: 1, y: wallHeight, z: 1 },
    { x: -1, y: wallHeight, z: 1 },
    { x: 0, y: wallHeight + roofHeight, z: 0 }, // roof peak
  ];

  const pairs: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], // ground floor
    [0, 4], [1, 5], [2, 6], [3, 7], // walls
    [4, 5], [5, 6], [6, 7], [7, 4], // eaves
    [4, 8], [5, 8], [6, 8], [7, 8], // roof slopes
  ];

  return buildScene(positions, pairs);
}

// Utah Teapot, rendered as its Bezier control net: each of the 32 patches is
// a 4x4 grid of control points, and we draw the grid lines within each patch,
// deduplicating edges shared between adjacent patches.
export function createTeapotScene(): Scene {
  const positions: Vec3[] = TEAPOT_VERTICES.map(([x, y, z]) => ({ x, y, z }));

  const seen = new Set<string>();
  const pairs: [number, number][] = [];

  function addEdge(a: number, b: number) {
    if (a === b) return;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push([a, b]);
  }

  for (const patch of TEAPOT_PATCHES) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = patch[row * 4 + col];
        if (col < 3) addEdge(current, patch[row * 4 + col + 1]);
        if (row < 3) addEdge(current, patch[(row + 1) * 4 + col]);
      }
    }
  }

  return buildScene(positions, pairs);
}

export const PRESET_SCENES = {
  cube: { label: "Cube", create: createCubeScene },
  pyramid: { label: "Pyramid", create: createPyramidScene },
  house: { label: "House", create: createHouseScene },
  teapot: { label: "Teapot", create: createTeapotScene },
} as const;

export type PresetSceneKey = keyof typeof PRESET_SCENES;
