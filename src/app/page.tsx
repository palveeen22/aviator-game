import dynamic from 'next/dynamic'

const GameLayout = dynamic(() => import('@/widgets/game-layout/ui/GameLayout'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
      <div className="font-orbitron text-gray-600 tracking-widest animate-pulse">
        LOADING...
      </div>
    </div>
  ),
})

export default function Home() {
  return <GameLayout />
}
