import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene'
import HUD from './components/HUD'
import GameOverModal from './components/GameOverModal'
import MovePanel from './components/MovePanel'
import OnlineLobby from './components/OnlineLobby'
import useGameStore, { GAME_MODES } from './store/gameStore'
import useMultiplayerStore from './store/multiplayerStore'
import useBotTurn from './hooks/useBotTurn'
import useOnlineGame from './hooks/useOnlineGame'

export default function App() {
  const { winner, isDraw, showGameOverModal, gameMode } = useGameStore()
  const { lobbyState, opponentJoined } = useMultiplayerStore()
  
  const gameOver = winner !== null || isDraw
  
  // Hook to handle bot turns in single player mode
  useBotTurn()
  
  // Hook to handle online game synchronization
  useOnlineGame()
  
  // Check if we should show the online lobby
  const isOnline = gameMode === GAME_MODES.ONLINE
  const showLobby = isOnline && !opponentJoined && lobbyState !== 'playing'

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
        {showLobby && <OnlineLobby />}
        {gameOver && showGameOverModal && <GameOverModal />}
      </div>
    </>
  )
}
