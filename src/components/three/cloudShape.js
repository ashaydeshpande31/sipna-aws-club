// Pure maths for the cloud silhouette (kept separate so it can be tested without WebGL).
// Coordinates are in scene units; the cloud is roughly 5.7 wide x 3.2 tall.

export const CIRCLES = [
  [-1.55, -0.15, 1.05],
  [-0.55, 0.45, 1.45],
  [0.85, 0.3, 1.25],
  [1.9, -0.25, 0.9],
]
export const BOX = { x0: -2.7, x1: 3.0, y0: -1.3, y1: 1.95 }
export const CENTER = { x: 0.15, y: 0.3 }

/** Is (x, y) inside the cloud? `inset` shrinks the shape (used to find the outline ring). */
export function inCloud(x, y, inset = 0) {
  for (const [cx, cy, r] of CIRCLES) {
    const rr = r - inset
    if (rr > 0 && (x - cx) ** 2 + (y - cy) ** 2 < rr * rr) return true
  }
  return x > -2.45 + inset && x < 2.65 - inset && y > -1.15 + inset && y < -0.2
}

const rand = (a, b) => a + Math.random() * (b - a)

/** Random point on the outline ring (wantOutline) or in the inner fill. Returns [x, y] centred on 0. */
export function sampleCloud(wantOutline) {
  for (let k = 0; k < 600; k++) {
    const x = rand(BOX.x0, BOX.x1)
    const y = rand(BOX.y0, BOX.y1)
    if (!inCloud(x, y, 0)) continue
    const inner = inCloud(x, y, 0.15)
    if (wantOutline ? !inner : inner) return [x - CENTER.x, y - CENTER.y]
  }
  return [0, 0]
}
