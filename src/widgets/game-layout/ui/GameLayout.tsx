// src/widgets/game-layout/ui/GameLayout.tsx
'use client'

import { useEffect } from 'react'
import { useGameEngine } from '@/entities/game/model/engine'
import { useGameStore } from '@/entities/game/model/store'
import { useSoundEngine } from '@/features/sound/model/useSoundEngine'
import Header from '@/entities/game/ui/Header'
import HistoryBar from '@/entities/game/ui/HistoryBar'
import GameCanvas from '@/entities/game/ui/GameCanvas'
import BetPanel from '@/features/bet/ui/BetPanel'
import ResultToast from '@/entities/game/ui/ResultToast'

export default function GameLayout() {
  // Boot game engine
  useGameEngine()

  // Boot sound engine
  const { muted, toggleMute } = useSoundEngine()

  // Keyboard shortcut: Space = bet/cashout
  const { cashOut, placeBet, gameState, betPlaced, cashedOut } = useGameStore()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        if (gameState === 'flying' && betPlaced && !cashedOut) {
          cashOut()
        } else if (!betPlaced) {
          placeBet()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gameState, betPlaced, cashedOut, cashOut, placeBet])

  return (
    <div className="flex flex-col gap-2 md:gap-3 h-screen max-w-4xl mx-auto p-2 md:p-3">
      <Header muted={muted} onToggleMute={toggleMute} />
      <HistoryBar />
      <GameCanvas />
      <BetPanel />
      <ResultToast />
    </div>
  )
}
