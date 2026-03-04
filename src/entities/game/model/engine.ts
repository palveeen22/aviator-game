// src/entities/game/model/engine.ts
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/entities/game/model/store'
import { generateCrashPoint, calcMultiplier } from '@/shared/lib/crashPoint'

/**
 * useGameEngine
 * Controls the game loop: countdown → flying → crashed → repeat.
 * Think of it like a state machine conductor — it drives transitions
 * between game phases and syncs everything into the Zustand store.
 */
export function useGameEngine() {
  const store = useGameStore()
  const rafRef = useRef<number>(0)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const crashPointRef = useRef<number>(2)

  // Keep refs in sync so callbacks don't capture stale closures
  const storeRef = useRef(store)
  useEffect(() => { storeRef.current = store }, [store])

  const clearTimers = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [])

  // ── CRASH ────────────────────────────────────────────
  const handleCrash = useCallback(() => {
    const s = storeRef.current
    const cp = crashPointRef.current

    cancelAnimationFrame(rafRef.current)
    s.setGameState('crashed')
    s.setMultiplier(cp)
    s.addHistory(cp)

    // If bet wasn't cashed out, deduct balance
    if (s.betPlaced && !s.cashedOut) {
      s.setBalance(s.balance - s.currentBet)
      s.setLastResult({ win: false, amount: s.currentBet, multiplier: cp })
      s.setShowToast(true)
      setTimeout(() => s.setShowToast(false), 2800)
    }

    s.setBetPlaced(false)
    s.setCurrentBet(0)
    s.setCashedOut(false)

    // Next round after 3s
    setTimeout(() => startCountdown(), 3000)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── FLY LOOP ─────────────────────────────────────────
  const flyLoop = useCallback(() => {
    const s = storeRef.current
    const elapsed = (performance.now() - startTimeRef.current) / 1000
    const m = calcMultiplier(elapsed)

    s.setMultiplier(m)

    // Auto cashout
    if (s.betPlaced && !s.cashedOut && m >= s.autoCashout) {
      s.cashOut()
    }

    // Check crash
    if (m >= crashPointRef.current) {
      handleCrash()
      return
    }

    rafRef.current = requestAnimationFrame(flyLoop)
  }, [handleCrash])

  // ── START FLIGHT ─────────────────────────────────────
  const startFlight = useCallback(() => {
    const cp = generateCrashPoint()
    crashPointRef.current = cp

    const s = storeRef.current
    s.setGameState('flying')
    s.setMultiplier(1.00)
    s.setCrashPoint(cp)
    s.setCashedOut(false)

    startTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(flyLoop)
  }, [flyLoop])

  // ── COUNTDOWN ────────────────────────────────────────
  const startCountdown = useCallback(() => {
    clearTimers()
    const s = storeRef.current
    s.setGameState('countdown')
    s.setCountdown(5)

    let count = 5
    countdownRef.current = setInterval(() => {
      count--
      storeRef.current.setCountdown(count)
      if (count <= 0) {
        clearInterval(countdownRef.current!)
        startFlight()
      }
    }, 1000)
  }, [clearTimers, startFlight])

  // Boot on mount
  useEffect(() => {
    startCountdown()
    return clearTimers
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
