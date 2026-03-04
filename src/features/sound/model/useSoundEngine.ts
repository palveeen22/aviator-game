'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '@/entities/game/model/store'

// ── Sound Engine Class ────────────────────────────────────────────────────────
// Wraps Web Audio API into a clean interface.
// AudioContext must be resumed after a user gesture (browser autoplay policy).

class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambientNodes: {
    osc: OscillatorNode
    lfoOsc: OscillatorNode
    gain: GainNode
  } | null = null
  private chimeTimer: ReturnType<typeof setTimeout> | null = null
  private muted = false
  private ready = false
  private wantsAmbient = false

  // ── Boot AudioContext on first user interaction ──────────────────────────
  async resume() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.6
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    this.ready = true
    // If ambient was requested before ctx was ready, start it now
    if (this.wantsAmbient && !this.muted) {
      this._startAmbient()
    }
  }

  // ── Ambient lobby sound ──────────────────────────────────────────────────
  startAmbient() {
    this.wantsAmbient = true
    if (this.ready && !this.muted) this._startAmbient()
  }

  private _startAmbient() {
    if (this.ambientNodes || !this.ctx || !this.masterGain) return
    const ctx = this.ctx

    // Low continuous drone with LFO wobble
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const lfoOsc = ctx.createOscillator()
    const lfoGain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = 65
    gain.gain.value = 0.022

    lfoOsc.type = 'sine'
    lfoOsc.frequency.value = 0.35
    lfoGain.gain.value = 7

    lfoOsc.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    lfoOsc.start()

    this.ambientNodes = { osc, lfoOsc, gain }

    // Schedule random chimes for casino ambience
    this._scheduleChime()
  }

  private _scheduleChime() {
    if (this.chimeTimer) clearTimeout(this.chimeTimer)
    if (!this.ambientNodes) return

    this.chimeTimer = setTimeout(() => {
      this._playChime()
      this._scheduleChime()
    }, 1800 + Math.random() * 2400)
  }

  private _playChime() {
    if (!this.ctx || !this.masterGain || this.muted) return
    const ctx = this.ctx
    const now = ctx.currentTime

    // Random note from a pentatonic scale for a pleasant casino feel
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00]
    const freq = freqs[Math.floor(Math.random() * freqs.length)]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.07, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(now)
    osc.stop(now + 1.5)
  }

  stopAmbient() {
    this.wantsAmbient = false
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer)
      this.chimeTimer = null
    }
    if (this.ambientNodes && this.ctx) {
      const { osc, lfoOsc, gain } = this.ambientNodes
      const now = this.ctx.currentTime
      // Fade out gracefully
      gain.gain.setTargetAtTime(0, now, 0.12)
      setTimeout(() => {
        try { osc.stop(); lfoOsc.stop() } catch { /* already stopped */ }
        this.ambientNodes = null
      }, 500)
    }
  }

  // ── Win sound: ascending major arpeggio ──────────────────────────────────
  playWin() {
    if (!this.ready || this.muted || !this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const now = ctx.currentTime

    // C5 → E5 → G5 → C6 — bright ascending chord
    const notes = [523.25, 659.25, 783.99, 1046.50]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.value = freq

      const t = now + i * 0.13
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)

      osc.connect(gain)
      gain.connect(this.masterGain!)
      osc.start(t)
      osc.stop(t + 0.65)
    })

    // Extra shimmer on top
    const shimmer = ctx.createOscillator()
    const shimmerGain = ctx.createGain()
    shimmer.type = 'sine'
    shimmer.frequency.value = 2093 // C7
    shimmerGain.gain.setValueAtTime(0, now + 0.4)
    shimmerGain.gain.linearRampToValueAtTime(0.1, now + 0.43)
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
    shimmer.connect(shimmerGain)
    shimmerGain.connect(this.masterGain!)
    shimmer.start(now + 0.4)
    shimmer.stop(now + 1.1)
  }

  // ── Crash/lose sound: explosion + descending tone ────────────────────────
  playCrash() {
    if (!this.ready || this.muted || !this.ctx || !this.masterGain) return
    const ctx = this.ctx
    const now = ctx.currentTime

    // White noise burst
    const bufSize = Math.floor(ctx.sampleRate * 0.6)
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

    const noise = ctx.createBufferSource()
    noise.buffer = buf

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3500, now)
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.55)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.55, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.masterGain!)
    noise.start(now)

    // Descending sawtooth for the "crash" tone
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(260, now)
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.9)
    oscGain.gain.setValueAtTime(0.28, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

    osc.connect(oscGain)
    oscGain.connect(this.masterGain!)
    osc.start(now)
    osc.stop(now + 1.0)
  }

  // ── Mute / unmute ────────────────────────────────────────────────────────
  setMuted(muted: boolean) {
    this.muted = muted
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : 0.6,
        this.ctx.currentTime,
        0.05
      )
    }
    if (muted) {
      this.stopAmbient()
    } else if (this.wantsAmbient && this.ready) {
      this._startAmbient()
    }
  }

  destroy() {
    this.stopAmbient()
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
    this.ready = false
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSoundEngine() {
  const engineRef = useRef<SoundEngine | null>(null)
  const [muted, setMuted] = useState(false)
  const prevShowToast = useRef(false)

  const { gameState, lastResult, showToast } = useGameStore()

  // Mount / unmount
  useEffect(() => {
    const engine = new SoundEngine()
    engineRef.current = engine

    // Resume AudioContext on first user interaction (browser autoplay policy)
    const handleInteraction = () => {
      engine.resume()
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    return () => {
      engine.destroy()
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [])

  // Lobby ambient sound: plays during idle and countdown phases
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    if (gameState === 'idle' || gameState === 'countdown') {
      engine.startAmbient()
    } else {
      engine.stopAmbient()
    }
  }, [gameState])

  // Win / lose sounds: fire on rising edge of showToast
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !lastResult) return

    if (showToast && !prevShowToast.current) {
      if (lastResult.win) {
        engine.playWin()
      } else {
        engine.playCrash()
      }
    }
    prevShowToast.current = showToast
  }, [showToast, lastResult])

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      engineRef.current?.setMuted(next)
      return next
    })
  }, [])

  return { muted, toggleMute }
}
