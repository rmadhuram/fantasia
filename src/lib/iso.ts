// Isometric projection engine, built from first principles.
//
// World axes: X right, Y up, Z toward the viewer.
// A view is defined by a yaw (rotation around Y) and a pitch
// (rotation around X) applied to the world before an orthographic
// projection (drop the resulting Z, keep X/Y, flip Y for screen
// space). True isometric view is yaw=45deg, pitch=atan(1/sqrt(2))
// (~35.264deg) — that pair makes all three world axes project
// 120deg apart on screen. Letting yaw/pitch vary turns this into a
// general rotatable orthographic camera.

export const TRUE_ISO_YAW = Math.PI / 4;
export const TRUE_ISO_PITCH = Math.atan(1 / Math.sqrt(2));

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
  depth: number; // camera-space z; larger = closer to viewer
}

function rotateToCamera(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);

  // yaw: rotate around Y axis
  const x1 = p.x * cosYaw + p.z * sinYaw;
  const z1 = -p.x * sinYaw + p.z * cosYaw;
  const y1 = p.y;

  // pitch: rotate around X axis
  const y2 = y1 * cosPitch - z1 * sinPitch;
  const z2 = y1 * sinPitch + z1 * cosPitch;
  const x2 = x1;

  return { x: x2, y: y2, z: z2 };
}

export class Camera {
  constructor(
    public originX: number,
    public originY: number,
    public scale: number,
    public yaw: number = TRUE_ISO_YAW,
    public pitch: number = TRUE_ISO_PITCH
  ) {}

  project(p: Vec3): ScreenPoint {
    const cam = rotateToCamera(p, this.yaw, this.pitch);
    return {
      x: this.originX + cam.x * this.scale,
      y: this.originY - cam.y * this.scale,
      depth: cam.z,
    };
  }
}
