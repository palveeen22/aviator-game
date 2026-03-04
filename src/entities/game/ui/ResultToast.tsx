'use client'

import { useGameStore } from '@/entities/game/model/store'
import clsx from 'clsx'

export default function ResultToast() {
  const { showToast, lastResult } = useGameStore()

  if (!lastResult) return null

  return (
    <div
      className={clsx(
        'fixed top-5 left-1/2 z-50 pointer-events-none',
        'font-orbitron font-bold text-sm md:text-base tracking-wider',
        'px-6 py-3 rounded-full border',
        'transition-all duration-300',
        showToast
          ? '-translate-x-1/2 translate-y-0 opacity-100 animate-toast-in'
          : '-translate-x-1/2 -translate-y-16 opacity-0',
        lastResult.win
          ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(0,200,100,0.4)]'
          : 'bg-red-950 border-red-600 text-red-400 shadow-[0_0_30px_rgba(255,50,50,0.4)]'
      )}
    >
      {lastResult.win
        ? `✈ CASHED OUT ${lastResult.multiplier.toFixed(2)}x  +${lastResult.profit?.toFixed(2)}¢`
        : `💥 FLEW AWAY at ${lastResult.multiplier.toFixed(2)}x  -${lastResult.amount.toFixed(2)}¢`}
    </div>
  )
}
