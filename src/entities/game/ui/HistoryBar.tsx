'use client'

import { useGameStore } from '@/entities/game/model/store'
import clsx from 'clsx'

function getChipClass(cp: number) {
  if (cp < 2) return 'bg-emerald-950 text-emerald-400 border-emerald-800'
  if (cp < 5) return 'bg-orange-950 text-orange-400 border-orange-800'
  return 'bg-red-950 text-red-400 border-red-800'
}

export default function HistoryBar() {
  const { multiplierHistory } = useGameStore()

  if (multiplierHistory.length === 0) {
    return (
      <div className="h-7 flex items-center px-1">
        <span className="text-gray-700 text-xs font-rajdhani tracking-widest">
          NO HISTORY YET
        </span>
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 overflow-hidden h-7 items-center">
      {multiplierHistory.map((cp, i) => (
        <div
          key={i}
          className={clsx(
            'px-2.5 py-0.5 rounded-full text-[11px] font-orbitron font-bold',
            'border whitespace-nowrap animate-chip-in flex-shrink-0',
            getChipClass(cp)
          )}
        >
          {cp.toFixed(2)}x
        </div>
      ))}
    </div>
  )
}
