import { OrbitControls, Environment } from '@react-three/drei'
import Board from './Board'
import Pieces from './Pieces'
import Columns from './Columns'

export default function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00f5ff" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#ff2d95" />
      
      {/* Environment for reflections */}
      <Environment preset="night" />
      
      {/* Game elements */}
      <group position={[-1.5, -1.5, -1.5]}>
        <Board />
        <Pieces />
        <Columns />
      </group>
      
      {/* Floor plane for depth perception */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#0a0a0f" 
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={false}
        minDistance={6}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

