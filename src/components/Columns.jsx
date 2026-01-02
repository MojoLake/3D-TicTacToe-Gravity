import { useState } from 'react'
import { useSpring, animated } from '@react-spring/three'
import useGameStore from '../store/gameStore'
import { GRID_SIZE } from '../game/winningLines'

const PLAYER_COLORS = {
  0: '#00f5ff',
  1: '#ff2d95'
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
  const [hovered, setHovered] = useState(false)
  const dropPiece = useGameStore((state) => state.dropPiece)
  const getDropY = useGameStore((state) => state.getDropY)
  const currentPlayer = useGameStore((state) => state.currentPlayer)
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  
  const dropY = getDropY(x, z)
  const isFull = dropY === -1
  const gameOver = winner !== null || isDraw
  
  // Hover animation for the column highlight
  const { opacity, highlightY } = useSpring({
    opacity: hovered && !isFull && !gameOver ? 0.2 : 0,
    highlightY: (GRID_SIZE / 2),
    config: { tension: 300, friction: 20 }
  })
  
  // Ghost piece animation
  const { ghostOpacity, ghostScale } = useSpring({
    ghostOpacity: hovered && !isFull && !gameOver ? 0.6 : 0,
    ghostScale: hovered && !isFull && !gameOver ? 1 : 0,
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
      setHovered(true)
      document.body.style.cursor = isFull ? 'not-allowed' : 'pointer'
    }
  }
  
  const handlePointerOut = () => {
    setHovered(false)
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
          color={hovered && !isFull && !gameOver ? PLAYER_COLORS[currentPlayer] : '#2d2d44'}
          transparent
          opacity={0.4}
          emissive={hovered && !isFull && !gameOver ? PLAYER_COLORS[currentPlayer] : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
    </group>
  )
}

