'use client'

import { useGameStore } from '@/entities/game/model/store'
import { useEffect, useRef, useState } from 'react'

interface HeaderProps {
  muted: boolean
  onToggleMute: () => void
}

export default function Header({ muted, onToggleMute }: HeaderProps) {
  const { balance } = useGameStore()
  const prevBalance = useRef(balance)
  const [animClass, setAnimClass] = useState('')

  useEffect(() => {
    if (balance !== prevBalance.current) {
      const cls = balance > prevBalance.current ? 'animate-balance-win' : 'text-red-400'
      setAnimClass(cls)
      const t = setTimeout(() => setAnimClass(''), 600)
      prevBalance.current = balance
      return () => clearTimeout(t)
    }
  }, [balance])

  return (
    <header className="flex justify-between items-center px-4 py-2 bg-[#0d1117] rounded-xl border border-game-border">
      {/* Logo */}
      <div className="font-orbitron font-black text-xl tracking-[3px]">
        <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          ✈ AVIATOR
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Demo badge */}
        {/* <span className="text-[10px] font-rajdhani font-bold tracking-[2px] text-yellow-600 bg-yellow-950 border border-yellow-800 px-2 py-0.5 rounded-full">
          DEMO MODE
        </span> */}

        {/* Sound toggle */}
        <button
          onClick={onToggleMute}
          title={muted ? 'Unmute sound' : 'Mute sound'}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-game-bg border border-game-border text-gray-500 hover:text-white hover:border-gray-600 transition-all duration-150 text-sm"
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {/* Balance */}
        <div className="flex items-center gap-2 bg-game-bg border border-game-border px-4 py-1.5 rounded-full">
          <span className="text-gray-600 text-[11px] font-rajdhani font-bold tracking-widest">
            BAL
          </span>
          <span
            className={`font-orbitron font-bold text-base text-game-green transition-all ${animClass}`}
          >
            {balance.toFixed(2)}
          </span>
          <span className="text-gray-600 text-[11px]">¢</span>
        </div>
      </div>
    </header>
  )
}
