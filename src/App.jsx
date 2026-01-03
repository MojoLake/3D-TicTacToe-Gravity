import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene'
import HUD from './components/HUD'
import GameOverModal from './components/GameOverModal'
import MovePanel from './components/MovePanel'
import useGameStore from './store/gameStore'
import useBotTurn from './hooks/useBotTurn'

export default function App() {
  const { winner, isDraw, showGameOverModal } = useGameStore()
  const gameOver = winner !== null || isDraw
  
  // Hook to handle bot turns in single player mode
  useBotTurn()

  return (
    <>
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      <div className="ui-overlay">
        <HUD />
        <MovePanel />
        {gameOver && showGameOverModal && <GameOverModal />}
      </div>
    </>
  )
}

