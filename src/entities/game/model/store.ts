import { create } from 'zustand'
import type { GameStore, GameState, LastResult } from '@/shared/types/game'

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  balance: 1000.00,
  gameState: 'idle',
  multiplier: 1.00,
  crashPoint: 2.00,
  betAmount: 10,
  currentBet: 0,
  betPlaced: false,
  cashedOut: false,
  autoCashout: 2.00,
  countdown: 5,
  multiplierHistory: [],
  lastResult: null,
  showToast: false,

  // Setters
  setBalance: (v) => set({ balance: Math.max(0, Math.round(v * 100) / 100) }),
  setGameState: (s) => set({ gameState: s }),
  setMultiplier: (m) => set({ multiplier: m }),
  setCrashPoint: (c) => set({ crashPoint: c }),
  setBetAmount: (a) => set({ betAmount: a }),
  setCurrentBet: (b) => set({ currentBet: b }),
  setBetPlaced: (b) => set({ betPlaced: b }),
  setCashedOut: (c) => set({ cashedOut: c }),
  setAutoCashout: (a) => set({ autoCashout: a }),
  setCountdown: (n) => set({ countdown: n }),

  addHistory: (cp) =>
    set((state) => ({
      multiplierHistory: [cp, ...state.multiplierHistory].slice(0, 14),
    })),

  setLastResult: (r) => set({ lastResult: r }),
  setShowToast: (v) => set({ showToast: v }),

  // Place bet action
  placeBet: () => {
    const { betAmount, balance, gameState, betPlaced } = get()
    if (betPlaced) return
    if (betAmount <= 0 || betAmount > balance) return

    set({ currentBet: betAmount, betPlaced: true, cashedOut: false })
  },

  // Cash out action
  cashOut: () => {
    const { betPlaced, cashedOut, multiplier, currentBet } = get()
    if (!betPlaced || cashedOut) return

    const winAmount = Math.round(currentBet * multiplier * 100) / 100
    const profit = Math.round((winAmount - currentBet) * 100) / 100

    set((state) => ({
      cashedOut: true,
      balance: Math.round((state.balance + winAmount) * 100) / 100,
      lastResult: { win: true, amount: winAmount, multiplier, profit },
      showToast: true,
    }))

    setTimeout(() => set({ showToast: false }), 2800)
  },
}))
