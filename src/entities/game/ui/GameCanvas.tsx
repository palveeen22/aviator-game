// src/entities/game/ui/GameCanvas.tsx
'use client'

import { useRef } from 'react'
import { usePixiCanvas } from '@/shared/hooks/usePixiCanvas'
import { useGameStore } from '@/entities/game/model/store'
import clsx from 'clsx'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  usePixiCanvas(containerRef)

  const { gameState, multiplier, countdown } = useGameStore()

  return (
    <div
      ref={containerRef}
      className="relative flex-1 rounded-xl overflow-hidden border border-game-border bg-game-bg"
      style={{ minHeight: '300px' }}
    >
      {/* Multiplier display */}
      {(gameState === 'flying' || gameState === 'crashed') && (
        <div
          className={clsx(
            'absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none',
            'font-orbitron font-black',
          )}
        >
          <span
            className={clsx(
              'text-5xl md:text-6xl tracking-wider transition-all duration-100',
              gameState === 'crashed'
                ? 'text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.9)] animate-crash-pulse'
                : 'text-white drop-shadow-[0_0_25px_rgba(255,120,60,0.7)]'
            )}
          >
            {multiplier.toFixed(2)}x
          </span>
          {gameState === 'crashed' && (
            <span className="mt-2 text-red-400 text-sm tracking-[4px] font-rajdhani font-semibold opacity-90">
              FLEW AWAY!
            </span>
          )}
        </div>
      )}

      {/* Countdown overlay */}
      {gameState === 'countdown' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-2">
          <span className="font-rajdhani text-gray-500 text-sm tracking-[3px] font-semibold">
            STARTING IN
          </span>
          <span className="font-orbitron font-black text-6xl text-game-green animate-count-pulse drop-shadow-[0_0_20px_rgba(0,255,136,0.6)]">
            {countdown}
          </span>
        </div>
      )}

      {/* Idle */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-rajdhani text-gray-600 text-lg tracking-[4px] font-semibold">
            WAITING...
          </span>
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <div className="w-4 h-4 border-t-2 border-l-2 border-game-border opacity-50" />
      </div>
      <div className="absolute top-3 right-3 pointer-events-none">
        <div className="w-4 h-4 border-t-2 border-r-2 border-game-border opacity-50" />
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <div className="w-4 h-4 border-b-2 border-l-2 border-game-border opacity-50" />
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none">
        <div className="w-4 h-4 border-b-2 border-r-2 border-game-border opacity-50" />
      </div>
    </div>
  )
}
