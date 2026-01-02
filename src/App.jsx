import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene'
import HUD from './components/HUD'
import GameOverModal from './components/GameOverModal'
import MovePanel from './components/MovePanel'
import useGameStore from './store/gameStore'

export default function App() {
  const { winner, isDraw } = useGameStore()
  const gameOver = winner !== null || isDraw

  return (
    <>
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      <div className="ui-overlay">
        <HUD />
        <MovePanel />
        {gameOver && <GameOverModal />}
      </div>
    </>
  )
}

