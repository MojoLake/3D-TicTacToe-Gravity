import { OrbitControls, Environment } from '@react-three/drei'
import Board from './Board'
import Pieces from './Pieces'
import Columns from './Columns'
import useGameStore from '../store/gameStore'
import useThemeStore, { THEMES } from '../store/themeStore'

export default function Scene() {
  const isHoveringBoard = useGameStore((state) => state.isHoveringBoard)
  const autoRotateEnabled = useGameStore((state) => state.autoRotateEnabled)
  const theme = useThemeStore((state) => state.theme)
  
  const themeConfig = THEMES[theme]
  
  return (
    <>
      {/* Scene background color */}
      <color attach="background" args={[themeConfig.sceneBackground]} />
      
      {/* Lighting - themed tones */}
      <ambientLight intensity={0.8} color={themeConfig.ambientColor} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.2} 
        color={themeConfig.lightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.4} color={themeConfig.lightColor} />
      <pointLight position={[5, 5, 5]} intensity={0.4} color={themeConfig.lightColor} />
      
      {/* Environment for reflections */}
      <Environment preset="apartment" />
      
      {/* Game elements */}
      <group position={[-1.5, -1.5, -1.5]}>
        <Board />
        <Pieces />
        <Columns />
      </group>
      
      {/* Floor plane - themed surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow renderOrder={-10}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color={themeConfig.floorColor} 
          metalness={0.05}
          roughness={0.9}
        />
      </mesh>
      
      {/* Camera controls - disable auto-rotate when hovering or toggled off */}
      <OrbitControls 
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={autoRotateEnabled && !isHoveringBoard}
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

