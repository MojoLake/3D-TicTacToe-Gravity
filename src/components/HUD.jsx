import useGameStore, { GAME_MODES } from '../store/gameStore'
import { BOTS } from '../game/bots'

export default function HUD() {
  const currentPlayer = useGameStore((state) => state.currentPlayer)
  const resetGame = useGameStore((state) => state.resetGame)
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  const autoRotateEnabled = useGameStore((state) => state.autoRotateEnabled)
  const toggleAutoRotate = useGameStore((state) => state.toggleAutoRotate)
  const gameMode = useGameStore((state) => state.gameMode)
  const setGameMode = useGameStore((state) => state.setGameMode)
  const selectedBotId = useGameStore((state) => state.selectedBotId)
  const setSelectedBot = useGameStore((state) => state.setSelectedBot)
  const botPlayer = useGameStore((state) => state.botPlayer)
  const setHumanPlayer = useGameStore((state) => state.setHumanPlayer)
  
  const showGameOverModal = useGameStore((state) => state.showGameOverModal)
  
  const gameOver = winner !== null || isDraw
  const isSinglePlayer = gameMode === GAME_MODES.SINGLE_PLAYER
  const isBotThinking = isSinglePlayer && currentPlayer === botPlayer && !gameOver
  const showPlayAgainInHUD = gameOver && !showGameOverModal
  
  // Get turn label
  const getTurnLabel = () => {
    if (isSinglePlayer) {
      if (currentPlayer === botPlayer) {
        return `${BOTS[selectedBotId]?.name || 'Bot'} is thinking...`
      }
      return "Your turn"
    }
    return `Player ${currentPlayer + 1}'s turn`
  }
  
  return (
    <>
      <header className="header">
        <h1 className="title">3D Tic-Tac-Toe</h1>
        
        {!gameOver && (
          <div className="turn-indicator">
            <div className={`piece-preview player-${currentPlayer} ${isBotThinking ? 'thinking' : ''}`} />
            <span>{getTurnLabel()}</span>
          </div>
        )}
        
        <div className="header-buttons">
          <button 
            className={`rotate-toggle-btn ${autoRotateEnabled ? 'active' : ''}`} 
            onClick={toggleAutoRotate}
            title={autoRotateEnabled ? 'Stop rotation' : 'Start rotation'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          {showPlayAgainInHUD ? (
            <button className="play-again-hud-btn" onClick={resetGame}>
              Play Again
            </button>
          ) : (
            <button className="restart-btn" onClick={resetGame}>
              Restart
            </button>
          )}
        </div>
      </header>
      
      <div className="game-settings">
        <div className="mode-selector">
          <button 
            className={`mode-btn ${gameMode === GAME_MODES.TWO_PLAYER ? 'active' : ''}`}
            onClick={() => setGameMode(GAME_MODES.TWO_PLAYER)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            2 Players
          </button>
          <button 
            className={`mode-btn ${gameMode === GAME_MODES.SINGLE_PLAYER ? 'active' : ''}`}
            onClick={() => setGameMode(GAME_MODES.SINGLE_PLAYER)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            vs Bot
          </button>
        </div>
        
        {isSinglePlayer && (
          <div className="single-player-settings">
            <div className="color-selector">
              <label>Play as:</label>
              <div className="color-buttons">
                <button
                  className={`color-btn light ${botPlayer === 1 ? 'active' : ''}`}
                  onClick={() => setHumanPlayer(0)}
                  title="Play as Light (first)"
                >
                  <span className="color-piece light-piece" />
                </button>
                <button
                  className={`color-btn dark ${botPlayer === 0 ? 'active' : ''}`}
                  onClick={() => setHumanPlayer(1)}
                  title="Play as Dark (second)"
                >
                  <span className="color-piece dark-piece" />
                </button>
              </div>
            </div>
            <div className="bot-selector">
              <label>Bot:</label>
              <select 
                value={selectedBotId} 
                onChange={(e) => setSelectedBot(e.target.value)}
              >
                {Object.values(BOTS).map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
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

