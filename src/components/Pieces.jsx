import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import useGameStore from "../store/gameStore";
import { GRID_SIZE } from "../game/winningLines";

const PLAYER_COLORS = {
  0: "#deb887", // Light wood (burlywood)
  1: "#5c4033", // Dark wood (brown)
};

const PLAYER_EMISSIVE = {
  0: "#c4a574",
  1: "#3d2817",
};

export default function Pieces() {
  const board = useGameStore((state) => state.board);
  const winningLine = useGameStore((state) => state.winningLine);
  const lastMove = useGameStore((state) => state.lastMove);

  const pieces = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const player = board[x][y][z];
        if (player !== null) {
          const isWinning = winningLine?.some(
            ([wx, wy, wz]) => wx === x && wy === y && wz === z
          );
          const isLastMove =
            lastMove &&
            lastMove.x === x &&
            lastMove.y === y &&
            lastMove.z === z;

          pieces.push(
            <Piece
              key={`${x}-${y}-${z}`}
              position={[x + 0.5, y + 0.5, z + 0.5]}
              player={player}
              isWinning={isWinning}
              isLastMove={isLastMove}
              animate={isLastMove}
              targetY={y + 0.5}
            />
          );
        }
      }
    }
  }

  return <group>{pieces}</group>;
}

function Piece({ position, player, isWinning, isLastMove, animate, targetY }) {
  const meshRef = useRef();
  const materialRef = useRef();
  
  // Animate piece dropping from top
  const { posY } = useSpring({
    from: { posY: animate ? GRID_SIZE + 1 : targetY },
    to: { posY: targetY },
    config: {
      mass: 1,
      tension: 200,
      friction: 20,
    },
  });

  // Pulsing animation using useFrame (immune to re-renders)
  const shouldPulse = isLastMove || isWinning;
  const baseIntensity = isLastMove ? 0.5 : 0.2;
  const pulseSpeed = isWinning ? 4 : 2.5; // radians per second
  
  useFrame((state) => {
    if (shouldPulse && meshRef.current && materialRef.current) {
      const t = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.5 + 0.5; // 0 to 1
      const scale = 1 + t * 0.15; // 1.0 to 1.15
      meshRef.current.scale.setScalar(scale);
      
      const maxIntensity = isWinning ? 1.5 : 0.8;
      materialRef.current.emissiveIntensity = baseIntensity + t * (maxIntensity - baseIntensity);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
      if (materialRef.current) {
        materialRef.current.emissiveIntensity = 0.2;
      }
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position-x={position[0]}
      position-y={posY}
      position-z={position[2]}
      castShadow
    >
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color={PLAYER_COLORS[player]}
        emissive={PLAYER_EMISSIVE[player]}
        emissiveIntensity={shouldPulse ? undefined : 0.2}
        metalness={0.3}
        roughness={0.2}
        envMapIntensity={0.8}
      />
    </animated.mesh>
  );
}
