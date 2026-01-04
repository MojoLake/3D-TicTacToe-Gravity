import { useMemo } from 'react'
import { GRID_SIZE } from '../game/winningLines'
import useThemeStore, { THEMES } from '../store/themeStore'

// Creates the wireframe structure of the 4x4x4 board
export default function Board() {
  const theme = useThemeStore((state) => state.theme)
  const themeConfig = THEMES[theme]
  
  const lines = useMemo(() => {
    const result = []
    const s = GRID_SIZE
    
    // Vertical posts (corners and intersections)
    for (let x = 0; x <= s; x++) {
      for (let z = 0; z <= s; z++) {
        result.push({
          start: [x, 0, z],
          end: [x, s, z],
          key: `v-${x}-${z}`
        })
      }
    }
    
    // Horizontal lines along X (at each Y level)
    for (let y = 0; y <= s; y++) {
      for (let z = 0; z <= s; z++) {
        result.push({
          start: [0, y, z],
          end: [s, y, z],
          key: `hx-${y}-${z}`
        })
      }
    }
    
    // Horizontal lines along Z (at each Y level)
    for (let y = 0; y <= s; y++) {
      for (let x = 0; x <= s; x++) {
        result.push({
          start: [x, y, 0],
          end: [x, y, s],
          key: `hz-${y}-${x}`
        })
      }
    }
    
    return result
  }, [])

  return (
    <group>
      {/* Grid lines */}
      {lines.map(({ start, end, key }) => (
        <Line key={key} start={start} end={end} gridLineColor={themeConfig.gridLineColor} />
      ))}
      
      {/* Level platforms - use polygonOffset to prevent z-fighting with grid lines */}
      {[0, 1, 2, 3, 4].map((y) => (
        <mesh key={`platform-${y}`} position={[2, y - 0.015, 2]} renderOrder={-1}>
          <boxGeometry args={[4, 0.02, 4]} />
          <meshStandardMaterial 
            color={themeConfig.platformColor}
            transparent
            opacity={y === 0 ? 0.95 : 0.4}
            metalness={0.1}
            roughness={0.8}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
      ))}
    </group>
  )
}

// Simple line component using a thin box
function Line({ start, end, gridLineColor }) {
  const [x1, y1, z1] = start
  const [x2, y2, z2] = end
  
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const midZ = (z1 + z2) / 2
  
  const length = Math.sqrt(
    (x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2
  )
  
  // Determine orientation
  let rotation = [0, 0, 0]
  let size = [0.02, 0.02, length]
  
  if (x1 !== x2) {
    size = [length, 0.02, 0.02]
  } else if (y1 !== y2) {
    size = [0.02, length, 0.02]
  }
  
  return (
    <mesh position={[midX, midY, midZ]} renderOrder={1}>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={gridLineColor}
        transparent
        opacity={0.95}
        metalness={0.1}
        roughness={0.8}
        depthWrite={false}
      />
    </mesh>
  )
}

