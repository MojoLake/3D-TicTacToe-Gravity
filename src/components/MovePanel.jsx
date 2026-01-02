import useGameStore from '../store/gameStore'
import { GRID_SIZE } from '../game/winningLines'

export default function MovePanel() {
  const board = useGameStore((state) => state.board)
  const currentPlayer = useGameStore((state) => state.currentPlayer)
  const dropPiece = useGameStore((state) => state.dropPiece)
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  const hoveredColumn = useGameStore((state) => state.hoveredColumn)
  const setHoveredColumn = useGameStore((state) => state.setHoveredColumn)
  
  const gameOver = winner !== null || isDraw

  // Get fill level for each column (how many pieces stacked)
  const getFillLevel = (x, z) => {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (board[x][y][z] === null) {
        return y
      }
    }
    return GRID_SIZE // Column is full
  }

  const handleCellClick = (x, z) => {
    if (!gameOver) {
      dropPiece(x, z)
    }
  }

  const handleCellHover = (x, z) => {
    if (!gameOver) {
      setHoveredColumn({ x, z })
    }
  }

  const handleCellLeave = () => {
    setHoveredColumn(null)
  }

  // Generate the 4x4 grid cells
  const cells = []
  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const fillLevel = getFillLevel(x, z)
      const isFull = fillLevel >= GRID_SIZE
      const isHovered = hoveredColumn?.x === x && hoveredColumn?.z === z
      
      cells.push(
        <button
          key={`cell-${x}-${z}`}
          className={`move-panel-cell player-${currentPlayer} ${isFull ? 'full' : ''} ${gameOver ? 'disabled' : ''} ${isHovered ? 'hovered' : ''}`}
          onClick={() => handleCellClick(x, z)}
          onMouseEnter={() => handleCellHover(x, z)}
          onMouseLeave={handleCellLeave}
          disabled={isFull || gameOver}
          aria-label={`Column ${x + 1}, ${z + 1}${isFull ? ' (full)' : ''}`}
        >
          <div className="fill-indicator">
            {[...Array(GRID_SIZE)].map((_, i) => (
              <span 
                key={i} 
                className={`fill-dot ${i < fillLevel ? (board[x][i][z] === 0 ? 'player-0' : 'player-1') : ''}`}
              />
            ))}
          </div>
        </button>
      )
    }
  }

  return (
    <div className="move-panel">
      <div className="move-panel-header">
        <span>Drop Zone</span>
      </div>
      <div className="move-panel-grid">
        {cells}
      </div>
      <div className="move-panel-labels">
        <span className="axis-label">X →</span>
        <span className="axis-label vertical">Z ↓</span>
      </div>
    </div>
  )
}

