import useGameStore from '../store/gameStore'

export default function HUD() {
  const currentPlayer = useGameStore((state) => state.currentPlayer)
  const resetGame = useGameStore((state) => state.resetGame)
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  
  const gameOver = winner !== null || isDraw
  
  return (
    <>
      <header className="header">
        <h1 className="title">3D Tic-Tac-Toe</h1>
        
        {!gameOver && (
          <div className="turn-indicator">
            <div className={`piece-preview player-${currentPlayer}`} />
            <span>Player {currentPlayer + 1}'s turn</span>
          </div>
        )}
        
        <button className="restart-btn" onClick={resetGame}>
          Restart
        </button>
      </header>
      
      <div className="instructions">
        <p>
          Click a column to drop your piece • 
          <kbd>Drag</kbd> to rotate • 
          <kbd>Scroll</kbd> to zoom
        </p>
      </div>
    </>
  )
}

