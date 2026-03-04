
/**
 * Generate a provably-fair-style crash point.
 * Distribution: 3% chance of instant crash, otherwise exponential.
 * House edge ~3%.
 */
export function generateCrashPoint(): number {
  const r = Math.random()
  if (r < 0.03) return 1.00 // 3% instant crash
  // Inverse CDF of exponential: cp = 0.99 / (1 - r)
  const cp = 0.99 / (1 - r)
  return Math.min(Math.round(cp * 100) / 100, 200)
}

/**
 * Calculate multiplier from elapsed seconds.
 * Starts at 1.00x, accelerates over time.
 */
export function calcMultiplier(elapsedSec: number): number {
  const raw = 1 + Math.pow(elapsedSec, 1.85) * 0.38
  return Math.round(raw * 100) / 100
}

/**
 * Get curve progress (0..1) for the flight path based on multiplier / crashPoint.
 */
export function getCurveProgress(multiplier: number, crashPoint: number): number {
  return Math.min(Math.log(multiplier) / Math.log(Math.max(crashPoint, 1.5)), 0.96)
}

/**
 * Get XY position on the parabolic flight curve.
 */
export function getFlightPosition(
  progress: number,
  canvasW: number,
  canvasH: number
): { x: number; y: number } {
  const padL = canvasW * 0.06
  const padR = canvasW * 0.08
  const padB = canvasH * 0.12
  const padT = canvasH * 0.06

  const x = padL + progress * (canvasW - padL - padR)
  const y = canvasH - padB - Math.pow(progress, 1.4) * (canvasH - padB - padT)
  return { x, y }
}
