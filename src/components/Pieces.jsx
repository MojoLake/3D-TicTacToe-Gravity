import { useRef } from "react";
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

  // Animate piece dropping from top
  const { posY, scale } = useSpring({
    from: {
      posY: animate ? GRID_SIZE + 1 : targetY,
      scale: animate ? 0 : 1,
    },
    to: {
      posY: targetY,
      scale: 1,
    },
    config: {
      mass: 1,
      tension: 200,
      friction: 20,
    },
  });

  // Determine emissive intensity based on state
  // Winning: pulsing glow, Last move: subtle highlight, Normal: base glow
  const baseIntensity = isLastMove ? 0.6 : 0.2;
  
  // Winning animation - pulsing glow
  const { emissiveIntensity } = useSpring({
    from: { emissiveIntensity: isWinning ? 0.5 : baseIntensity },
    to: { emissiveIntensity: isWinning ? 1.5 : baseIntensity },
    loop: isWinning ? { reverse: true } : false,
    config: { duration: 500 },
  });

  // Last move ring scale animation (subtle pulse)
  const { ringScale, ringOpacity } = useSpring({
    from: { ringScale: 0.8, ringOpacity: 0 },
    to: { ringScale: isLastMove && !isWinning ? 1.2 : 0.8, ringOpacity: isLastMove && !isWinning ? 0.8 : 0 },
    loop: isLastMove && !isWinning ? { reverse: true } : false,
    config: { duration: 800 },
  });

  return (
    <group>
      <animated.mesh
        ref={meshRef}
        position-x={position[0]}
        position-y={posY}
        position-z={position[2]}
        scale={scale}
        castShadow
      >
        <sphereGeometry args={[0.35, 32, 32]} />
        <animated.meshStandardMaterial
          color={PLAYER_COLORS[player]}
          emissive={PLAYER_EMISSIVE[player]}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.2}
          envMapIntensity={0.8}
        />
      </animated.mesh>
      
      {/* Last move indicator ring */}
      {isLastMove && !isWinning && (
        <animated.mesh
          position-x={position[0]}
          position-y={posY}
          position-z={position[2]}
          scale={ringScale}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.45, 0.03, 8, 32]} />
          <animated.meshBasicMaterial
            color={player === 0 ? "#ffd700" : "#ffa500"}
            transparent
            opacity={ringOpacity}
            depthWrite={false}
          />
        </animated.mesh>
      )}
    </group>
  );
}
