'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/entities/game/model/store'
import { getCurveProgress, getFlightPosition } from '@/shared/lib/crashPoint'
import type { FlightPoint } from '@/shared/types/game'

/*
 usePixiCanvas
 Manages the PixiJS Application lifecycle and rendering.

 Architecture analogy: Think of this like a React component's render cycle,
 but running on the GPU canvas instead of the DOM.
 - useEffect (mount) = componentDidMount → create PixiJS app
 - RAF loop         = React re-render → update canvas each frame
 - useEffect cleanup = componentWillUnmount → destroy PixiJS
 */
export function usePixiCanvas(containerRef: React.RefObject<HTMLDivElement>) {
  const appRef = useRef<import('pixi.js').Application | null>(null)
  const layersRef = useRef<{
    stars: import('pixi.js').Graphics
    grid: import('pixi.js').Graphics
    fill: import('pixi.js').Graphics
    curve: import('pixi.js').Graphics
    trail: import('pixi.js').Graphics
    plane: import('pixi.js').Container
  } | null>(null)

  const flightPointsRef = useRef<FlightPoint[]>([])
  const rafRef = useRef<number>(0)
  const prevGameStateRef = useRef<string>('')

  const store = useGameStore()
  const storeRef = useRef(store)
  useEffect(() => { storeRef.current = store }, [store])

  // ── INIT PIXI ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    let app: import('pixi.js').Application
    let destroyed = false

    const init = async () => {
      // Dynamic import so PixiJS doesn't run on the server
      const PIXI = await import('pixi.js')
      if (destroyed) return

      const container = containerRef.current!
      const w = container.clientWidth
      const h = container.clientHeight

      app = new PIXI.Application({
        width: w,
        height: h,
        backgroundColor: 0x050508,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      container.appendChild(app.view as HTMLCanvasElement)
      appRef.current = app

      // ── Starfield ────────────────────────────────────
      const stars = new PIXI.Graphics()
      for (let i = 0; i < 90; i++) {
        const alpha = Math.random() * 0.5 + 0.1
        stars.beginFill(0xffffff, alpha)
        stars.drawCircle(Math.random() * w, Math.random() * h, Math.random() * 1.3)
        stars.endFill()
      }

      // ── Grid ─────────────────────────────────────────
      const grid = new PIXI.Graphics()
      grid.lineStyle(0.5, 0x1a1a3a, 0.5)
      for (let x = 0; x < w; x += 60) { grid.moveTo(x, 0); grid.lineTo(x, h) }
      for (let y = 0; y < h; y += 40) { grid.moveTo(0, y); grid.lineTo(w, y) }

      // ── Dynamic layers ───────────────────────────────
      const fill = new PIXI.Graphics()
      const curve = new PIXI.Graphics()
      const trail = new PIXI.Graphics()

      // ── Plane container ──────────────────────────────
      const plane = new PIXI.Container()
      const body = new PIXI.Graphics()

      // fuselage
      body.beginFill(0xff4444); body.drawEllipse(0, 0, 20, 7); body.endFill()
      // main wing
      body.beginFill(0xcc2222)
      body.moveTo(-5, -1); body.lineTo(12, -1); body.lineTo(7, -13); body.lineTo(-9, -13)
      body.closePath(); body.endFill()
      // tail fin
      body.beginFill(0xaa1111)
      body.moveTo(-15, -1); body.lineTo(-8, -1); body.lineTo(-8, -9); body.lineTo(-15, -9)
      body.closePath(); body.endFill()
      // cockpit
      body.beginFill(0x88ccff, 0.85)
      body.drawEllipse(9, -3, 7, 4); body.endFill()
      // engine glow
      body.beginFill(0xff8844, 0.6)
      body.drawEllipse(-18, 0, 4, 3); body.endFill()

      plane.addChild(body)
      plane.visible = false

      // Add all layers in order
      app.stage.addChild(stars, grid, fill, curve, trail, plane)

      layersRef.current = { stars, grid, fill, curve, trail, plane }

      // ── Resize handler ───────────────────────────────
      const handleResize = () => {
        if (!container || !appRef.current) return
        const nw = container.clientWidth
        const nh = container.clientHeight
        appRef.current.renderer.resize(nw, nh)
        redrawStaticLayers(PIXI, nw, nh)
      }

      window.addEventListener('resize', handleResize)

      // Start render loop
      startRenderLoop(PIXI)

      return () => window.removeEventListener('resize', handleResize)
    }

    init()

    return () => {
      destroyed = true
      cancelAnimationFrame(rafRef.current)
      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, [])

  // ── REDRAW STATIC LAYERS (on resize) ──────────────────
  function redrawStaticLayers(PIXI: typeof import('pixi.js'), w: number, h: number) {
    const layers = layersRef.current
    if (!layers) return

    layers.stars.clear()
    for (let i = 0; i < 90; i++) {
      const alpha = Math.random() * 0.5 + 0.1
      layers.stars.beginFill(0xffffff, alpha)
      layers.stars.drawCircle(Math.random() * w, Math.random() * h, Math.random() * 1.3)
      layers.stars.endFill()
    }

    layers.grid.clear()
    layers.grid.lineStyle(0.5, 0x1a1a3a, 0.5)
    for (let x = 0; x < w; x += 60) { layers.grid.moveTo(x, 0); layers.grid.lineTo(x, h) }
    for (let y = 0; y < h; y += 40) { layers.grid.moveTo(0, y); layers.grid.lineTo(w, y) }
  }

  // ── RENDER LOOP ────────────────────────────────────────
  function startRenderLoop(PIXI: typeof import('pixi.js')) {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      renderFrame()
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  function renderFrame() {
    const app = appRef.current
    const layers = layersRef.current
    if (!app || !layers) return

    const s = storeRef.current
    const w = app.renderer.width / (window.devicePixelRatio || 1)
    const h = app.renderer.height / (window.devicePixelRatio || 1)

    // Reset flight points on new round
    if (prevGameStateRef.current === 'crashed' && s.gameState === 'countdown') {
      flightPointsRef.current = []
      layers.fill.clear()
      layers.curve.clear()
      layers.trail.clear()
      layers.plane.visible = false
    }
    prevGameStateRef.current = s.gameState

    if (s.gameState === 'flying' || s.gameState === 'crashed') {
      const progress = getCurveProgress(s.multiplier, s.crashPoint)
      const pos = getFlightPosition(progress, w, h)

      // Collect flight path
      const pts = flightPointsRef.current
      const last = pts[pts.length - 1]
      if (!last || Math.abs(last.x - pos.x) > 0.5 || Math.abs(last.y - pos.y) > 0.5) {
        pts.push({ x: pos.x, y: pos.y })
        if (pts.length > 400) pts.shift()
      }

      if (pts.length >= 2) {
        drawCurve(layers, pts, h, s.gameState === 'crashed')
        updatePlane(layers, pts, pos, s.gameState === 'crashed')
      }
    }
  }

  function drawCurve(
    layers: NonNullable<typeof layersRef.current>,
    pts: FlightPoint[],
    h: number,
    crashed: boolean
  ) {
    const baseColor = crashed ? 0xff1111 : 0xff4422
    const fillAlpha = crashed ? 0.1 : 0.15
    const groundY = h * 0.9

    // Filled area
    layers.fill.clear()
    layers.fill.beginFill(baseColor, fillAlpha)
    layers.fill.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) layers.fill.lineTo(pts[i].x, pts[i].y)
    layers.fill.lineTo(pts[pts.length - 1].x, groundY)
    layers.fill.lineTo(pts[0].x, groundY)
    layers.fill.closePath()
    layers.fill.endFill()

    // Main curve line
    layers.curve.clear()
    layers.curve.lineStyle(3, baseColor, 1)
    layers.curve.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) layers.curve.lineTo(pts[i].x, pts[i].y)

    // Glow overlay
    layers.curve.lineStyle(8, baseColor, 0.12)
    layers.curve.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length; i++) layers.curve.lineTo(pts[i].x, pts[i].y)

    // Plane trail
    layers.trail.clear()
    const trailLen = Math.min(16, pts.length - 1)
    for (let i = pts.length - trailLen - 1; i < pts.length - 1; i++) {
      if (i < 0) continue
      const t = (i - (pts.length - trailLen - 1)) / trailLen
      layers.trail.lineStyle(2 * t, 0xff8866, 0.35 * t)
      layers.trail.moveTo(pts[i].x, pts[i].y)
      layers.trail.lineTo(pts[i + 1].x, pts[i + 1].y)
    }
  }

  function updatePlane(
    layers: NonNullable<typeof layersRef.current>,
    pts: FlightPoint[],
    pos: FlightPoint,
    crashed: boolean
  ) {
    layers.plane.visible = true
    const prev = pts[pts.length - 2]

    if (crashed) {
      // Nose-dive on crash
      layers.plane.rotation = Math.PI * 0.6
      layers.plane.x = pos.x
      layers.plane.y = pos.y - 10
    } else {
      const angle = Math.atan2(pos.y - prev.y, pos.x - prev.x)
      layers.plane.rotation = angle
      layers.plane.x = pos.x
      layers.plane.y = pos.y - 18
    }
  }
}
