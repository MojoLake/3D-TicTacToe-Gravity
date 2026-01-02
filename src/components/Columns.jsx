import { useSpring, animated } from '@react-spring/three'
import useGameStore from '../store/gameStore'
import { GRID_SIZE } from '../game/winningLines'

const PLAYER_COLORS = {
  0: '#deb887', // Light maple wood
  1: '#5c4033'  // Dark walnut wood
}

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
  
  const dropY = getDropY(x, z)
  const isFull = dropY === -1
  const gameOver = winner !== null || isDraw
  
  // Check if this column is hovered (either directly or via 2D panel)
  const isHovered = hoveredColumn?.x === x && hoveredColumn?.z === z
  
  // Hover animation for the column highlight
  const { opacity, highlightY } = useSpring({
    opacity: isHovered && !isFull && !gameOver ? 0.3 : 0,
    highlightY: (GRID_SIZE / 2),
    config: { tension: 300, friction: 20 }
  })
  
  // Ghost piece animation
  const { ghostOpacity, ghostScale } = useSpring({
    ghostOpacity: isHovered && !isFull && !gameOver ? 0.6 : 0,
    ghostScale: isHovered && !isFull && !gameOver ? 1 : 0,
    config: { tension: 400, friction: 25 }
  })
  
  const handleClick = (e) => {
    e.stopPropagation()
    if (!isFull && !gameOver) {
      dropPiece(x, z)
    }
  }
  
  const handlePointerOver = (e) => {
    e.stopPropagation()
    if (!gameOver) {
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
      {/* Invisible clickable area */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.95, GRID_SIZE, 0.95]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Column highlight when hovered */}
      <animated.mesh position-y={highlightY}>
        <boxGeometry args={[0.9, GRID_SIZE, 0.9]} />
        <animated.meshBasicMaterial
          color={PLAYER_COLORS[currentPlayer]}
          transparent
          opacity={opacity}
        />
      </animated.mesh>
      
      {/* Ghost piece showing where it will land */}
      {dropY >= 0 && (
        <animated.mesh 
          position={[0, dropY + 0.5, 0]}
          scale={ghostScale}
        >
          <sphereGeometry args={[0.35, 16, 16]} />
          <animated.meshStandardMaterial
            color={PLAYER_COLORS[currentPlayer]}
            transparent
            opacity={ghostOpacity}
            emissive={PLAYER_COLORS[currentPlayer]}
            emissiveIntensity={0.3}
          />
        </animated.mesh>
      )}
      
      {/* Bottom indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial
          color={isHovered && !isFull && !gameOver ? PLAYER_COLORS[currentPlayer] : '#a08060'}
          transparent
          opacity={0.5}
          emissive={isHovered && !isFull && !gameOver ? PLAYER_COLORS[currentPlayer] : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>
    </group>
  )
}

