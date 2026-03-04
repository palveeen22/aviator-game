export type GameState = 'idle' | 'countdown' | 'flying' | 'crashed'

export interface GameStore {
  // State
  balance: number
  gameState: GameState
  multiplier: number
  crashPoint: number
  betAmount: number
  currentBet: number
  betPlaced: boolean
  cashedOut: boolean
  autoCashout: number
  countdown: number
  multiplierHistory: number[]
  lastResult: LastResult | null
  showToast: boolean

  // Actions
  setBalance: (v: number) => void
  setGameState: (s: GameState) => void
  setMultiplier: (m: number) => void
  setCrashPoint: (c: number) => void
  setBetAmount: (a: number) => void
  setCurrentBet: (b: number) => void
  setBetPlaced: (b: boolean) => void
  setCashedOut: (c: boolean) => void
  setAutoCashout: (a: number) => void
  setCountdown: (n: number) => void
  addHistory: (cp: number) => void
  setLastResult: (r: LastResult | null) => void
  setShowToast: (v: boolean) => void

  // Game actions
  placeBet: () => void
  cashOut: () => void
}

export interface LastResult {
  win: boolean
  amount: number
  multiplier: number
  profit?: number
}

export interface FlightPoint {
  x: number
  y: number
}
