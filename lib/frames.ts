export interface StageConfig {
  id: number;
  headline?: string;
  subline: string;
  isWordmark?: boolean;
  tag: "h1" | "h2" | "p";
  startFrame: number;
  endFrame: number;
  startP: number;
  endP: number;
}

export const TOTAL_FRAMES = 192;

/**
 * 4 approved stage clips mapped over 192 frames (0 to 191):
 * - Stage 1 (0 to 0.25): frames 0 to 47
 * - Stage 2 (0.25 to 0.5): frames 48 to 95
 * - Stage 3 (0.5 to 0.75): frames 96 to 143
 * - Stage 4 (0.75 to 1.0): frames 144 to 191
 */
export const STAGES: readonly StageConfig[] = [
  {
    id: 1,
    headline: "Drawn on the land.",
    subline: "Every home begins as a plan on the ground.",
    tag: "h1",
    startFrame: 0,
    endFrame: 47,
    startP: 0,
    endP: 0.25,
  },
  {
    id: 2,
    headline: "Rooted in the sand.",
    subline: "Foundations set, steel placed with care.",
    tag: "h2",
    startFrame: 48,
    endFrame: 95,
    startP: 0.25,
    endP: 0.5,
  },
  {
    id: 3,
    headline: "Built, piece by piece.",
    subline: "Walls, windows, and roofs, each set with precision.",
    tag: "h2",
    startFrame: 96,
    endFrame: 143,
    startP: 0.5,
    endP: 0.75,
  },
  {
    id: 4,
    headline: "Cedar Ridge",
    subline: "Homes by the sea. Ready for you.",
    isWordmark: true,
    tag: "p",
    startFrame: 144,
    endFrame: 191,
    startP: 0.75,
    endP: 1.0,
  },
] as const;

/**
 * Maps scroll progress p (clamped 0 to 1) to integer frame index 0..191.
 * target index = round(p * 191)
 */
export function mapProgressToFrame(p: number, isLowEnd = false): number {
  const clamped = Math.max(0, Math.min(1, p));
  let index = Math.round(clamped * 191);
  if (isLowEnd) {
    index = Math.round(index / 2) * 2;
  }
  return Math.min(191, Math.max(0, index));
}

/**
 * Returns the active stage (0 to 3) corresponding to progress p.
 */
export function getActiveStageIndex(p: number): number {
  const clamped = Math.max(0, Math.min(1, p));
  for (let i = 0; i < STAGES.length; i++) {
    if (clamped <= STAGES[i].endP) {
      return i;
    }
  }
  return STAGES.length - 1;
}

/**
 * Formats frame index to file path: /frames/frame_000.webp
 */
export function getFramePath(index: number): string {
  const padded = index.toString().padStart(3, "0");
  return `/frames/frame_${padded}.webp`;
}
