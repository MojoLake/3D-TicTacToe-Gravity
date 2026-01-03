import { useSpring, animated } from '@react-spring/three'
import useGameStore, { GAME_MODES } from '../store/gameStore'
import useMultiplayerStore from '../store/multiplayerStore'
import { GRID_SIZE } from '../game/winningLines'

const PLAYER_COLORS = {
  0: '#deb887', // Light maple wood
  1: '#5c4033'  // Dark walnut wood
}

const HIGHLIGHT_COLOR = '#5c4033' // Dark walnut for both players

export default function Columns() {
  const columns = []
  
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      columns.push(
        <Column key={`col-${x}-${z}`} x={x} z={z} />
      )
    }
  }
  
  return <group>{columns}</group>
}

function Column({ x, z }) {
  const dropPiece = useGameStore((state) => state.dropPiece)
  const getDropY = useGameStore((state) => state.getDropY)
  const currentPlayer = useGameStore((state) => state.currentPlayer)
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  const setIsHoveringBoard = useGameStore((state) => state.setIsHoveringBoard)
  const hoveredColumn = useGameStore((state) => state.hoveredColumn)
  const setHoveredColumn = useGameStore((state) => state.setHoveredColumn)
  const gameMode = useGameStore((state) => state.gameMode)
  const botPlayer = useGameStore((state) => state.botPlayer)
  
  // Online multiplayer state
  const playerSlot = useMultiplayerStore((state) => state.playerSlot)
  const opponentJoined = useMultiplayerStore((state) => state.opponentJoined)
  
  const dropY = getDropY(x, z)
  const isFull = dropY === -1
  const gameOver = winner !== null || isDraw
  
  // Check if it's the bot's turn (human can't interact)
  const isBotTurn = gameMode === GAME_MODES.SINGLE_PLAYER && currentPlayer === botPlayer
  
  // Check if it's opponent's turn in online mode
  const isOnline = gameMode === GAME_MODES.ONLINE
  const isOpponentTurn = isOnline && opponentJoined && playerSlot !== currentPlayer
  const isWaitingForOpponent = isOnline && !opponentJoined
  
  // Can't interact if it's not our turn
  const cantInteract = isBotTurn || isOpponentTurn || isWaitingForOpponent
  
  // Check if this column is hovered (either directly or via 2D panel)
  const isHovered = hoveredColumn?.x === x && hoveredColumn?.z === z
  
  // Hover animation for the column highlight
  const { opacity } = useSpring({
    opacity: isHovered && !isFull && !gameOver && !cantInteract ? 0.3 : 0,
    config: { tension: 300, friction: 20 }
  })
  
  // Ghost piece animation
  const { ghostOpacity, ghostScale } = useSpring({
    ghostOpacity: isHovered && !isFull && !gameOver && !cantInteract ? 0.6 : 0,
    ghostScale: isHovered && !isFull && !gameOver && !cantInteract ? 1 : 0,
    config: { tension: 400, friction: 25 }
  })
  
  const handleClick = (e) => {
    e.stopPropagation()
    if (!isFull && !gameOver && !cantInteract) {
      dropPiece(x, z)
    }
  }
  
  const handlePointerOver = (e) => {
    e.stopPropagation()
    if (!gameOver && !cantInteract) {
      setHoveredColumn({ x, z })
      setIsHoveringBoard(true)
      document.body.style.cursor = isFull ? 'not-allowed' : 'pointer'
    }
  }
  
  const handlePointerOut = () => {
    setHoveredColumn(null)
    setIsHoveringBoard(false)
    document.body.style.cursor = 'auto'
  }
  
  return (
    <group position={[x + 0.5, 0, z + 0.5]}>
      {/* Invisible clickable area - positioned to cover all 4 blocks */}
      <mesh
        position={[0, GRID_SIZE / 2, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.95, GRID_SIZE, 0.95]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Column highlight when hovered - full 4 blocks tall */}
      <animated.mesh position={[0, GRID_SIZE / 2, 0]} renderOrder={10}>
        <boxGeometry args={[0.9, GRID_SIZE, 0.9]} />
        <animated.meshBasicMaterial
          color={HIGHLIGHT_COLOR}
          transparent
          opacity={opacity}
          depthWrite={false}
          depthTest={false}
        />
      </animated.mesh>
      
      {/* Ghost piece showing where it will land */}
      {dropY >= 0 && (
        <animated.mesh 
          position={[0, dropY + 0.5, 0]}
          scale={ghostScale}
          renderOrder={100}
        >
          <sphereGeometry args={[0.35, 16, 16]} />
          <animated.meshStandardMaterial
            color={PLAYER_COLORS[currentPlayer]}
            transparent
            opacity={ghostOpacity}
            emissive={PLAYER_COLORS[currentPlayer]}
            emissiveIntensity={0.5}
            depthTest={false}
          />
        </animated.mesh>
      )}
      
      {/* Bottom indicator - raised above platform to avoid z-fighting */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial
          color={isHovered && !isFull && !gameOver && !cantInteract ? PLAYER_COLORS[currentPlayer] : '#a08060'}
          transparent
          opacity={0.5}
          emissive={isHovered && !isFull && !gameOver && !cantInteract ? PLAYER_COLORS[currentPlayer] : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
    </group>
  )
}
