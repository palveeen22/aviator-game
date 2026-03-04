'use client'

import { useGameStore } from '@/entities/game/model/store'
import clsx from 'clsx'

export default function BetPanel() {
  const {
    balance,
    gameState,
    betAmount,
    currentBet,
    betPlaced,
    cashedOut,
    autoCashout,
    multiplier,
    setBetAmount,
    setAutoCashout,
    placeBet,
    cashOut,
  } = useGameStore()

  const canPlaceBet =
    !betPlaced && (gameState === 'idle' || gameState === 'countdown' || gameState === 'crashed')
  const canCashOut = gameState === 'flying' && betPlaced && !cashedOut
  const inFlight = gameState === 'flying' && (!betPlaced || cashedOut)

  function handleMainButton() {
    if (canCashOut) { cashOut(); return }
    if (canPlaceBet) { placeBet(); return }
  }

  function quickMult(m: number) {
    setBetAmount(Math.min(Math.max(1, Math.round(betAmount * m)), balance))
  }

  const potentialWin = betPlaced && !cashedOut
    ? Math.round(currentBet * multiplier * 100) / 100
    : 0

  return (
    <div className="bg-[#0d1117] rounded-xl border border-game-border p-3 md:p-4">
      <div className="flex flex-wrap gap-3 items-center">

        {/* Bet Amount Input */}
        <div className="flex items-center bg-game-bg border border-game-border rounded-lg overflow-hidden flex-1 min-w-[160px]">
          <span className="px-3 text-gray-600 text-xs font-rajdhani font-semibold tracking-widest whitespace-nowrap">
            BET
          </span>
          <input
            type="number"
            min={1}
            max={balance}
            step={1}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.min(Math.max(1, Number(e.target.value)), balance))}
            disabled={betPlaced || gameState === 'flying'}
            className={clsx(
              'bg-transparent border-none outline-none text-white',
              'font-orbitron font-bold text-base py-2.5 px-2 w-24 text-right',
              'disabled:opacity-50'
            )}
          />
          <span className="px-3 text-gray-600 text-xs">¢</span>
        </div>

        {/* Quick bet buttons */}
        <div className="flex gap-1.5">
          {[
            { label: '½', action: () => quickMult(0.5) },
            { label: '2x', action: () => quickMult(2) },
            { label: 'MAX', action: () => setBetAmount(Math.min(balance, 500)) },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              disabled={betPlaced || gameState === 'flying'}
              className={clsx(
                'px-3 py-2 rounded-lg text-xs font-rajdhani font-bold tracking-wide',
                'bg-[#111827] border border-game-border text-gray-400',
                'hover:bg-[#1e2030] hover:text-white hover:border-gray-600',
                'transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Auto Cashout */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-xs font-rajdhani font-semibold tracking-widest whitespace-nowrap">
            AUTO @
          </span>
          <input
            type="number"
            min={1.01}
            step={0.1}
            value={autoCashout}
            onChange={(e) => setAutoCashout(Math.max(1.01, Number(e.target.value)))}
            disabled={gameState === 'flying'}
            className={clsx(
              'bg-game-bg border border-game-border rounded-lg',
              'text-white font-orbitron font-bold text-sm',
              'py-2 px-3 w-20 text-center outline-none',
              'focus:border-blue-800 transition-colors',
              'disabled:opacity-50'
            )}
          />
          <span className="text-gray-600 text-xs">x</span>
        </div>

        {/* Main CTA Button */}
        <button
          onClick={handleMainButton}
          disabled={inFlight || (!canPlaceBet && !canCashOut)}
          className={clsx(
            'font-orbitron font-bold text-sm tracking-wider',
            'px-7 py-3 rounded-lg border-none cursor-pointer',
            'transition-all duration-200 min-w-[130px]',
            canCashOut && [
              'bg-gradient-to-br from-orange-500 to-red-500 text-white',
              'shadow-[0_0_20px_rgba(255,102,0,0.4)]',
              'hover:shadow-[0_0_35px_rgba(255,102,0,0.7)]',
              'hover:-translate-y-0.5 animate-cashout-glow',
            ],
            canPlaceBet && [
              'bg-gradient-to-br from-emerald-500 to-green-600 text-white',
              'shadow-[0_4px_20px_rgba(0,200,100,0.3)]',
              'hover:shadow-[0_6px_30px_rgba(0,200,100,0.5)]',
              'hover:-translate-y-0.5',
            ],
            (inFlight || (!canPlaceBet && !canCashOut)) && [
              'bg-[#111827] text-gray-600 border border-game-border cursor-not-allowed',
            ]
          )}
        >
          {canCashOut
            ? `${(currentBet * multiplier).toFixed(2)}¢`
            : betPlaced && gameState === 'countdown'
            ? 'BET ✓'
            : inFlight
            ? 'IN FLIGHT'
            : 'BET'}
        </button>
      </div>

      {/* Status bar */}
      <div className="mt-2.5 text-center text-xs font-rajdhani font-semibold tracking-wide min-h-[18px]">
        {canCashOut && (
          <span className="text-orange-400 animate-fade-in">
            🚀 Flying! Tap CASH OUT to collect {potentialWin.toFixed(2)}¢
          </span>
        )}
        {betPlaced && gameState === 'countdown' && (
          <span className="text-blue-400">
            ✓ Bet placed: {currentBet.toFixed(2)}¢ — waiting for round to start
          </span>
        )}
        {cashedOut && gameState === 'flying' && (
          <span className="text-emerald-400">
            ✅ Cashed out successfully! Watching the round...
          </span>
        )}
        {!betPlaced && (gameState === 'countdown' || gameState === 'idle') && (
          <span className="text-gray-600">Place your bet before the round starts</span>
        )}
      </div>
    </div>
  )
}
