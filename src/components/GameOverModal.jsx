import useGameStore, { GAME_MODES } from '../store/gameStore'
import useMultiplayerStore from '../store/multiplayerStore'
import { BOTS } from '../game/bots'

export default function GameOverModal() {
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  const resetGame = useGameStore((state) => state.resetGame)
  const dismissGameOverModal = useGameStore((state) => state.dismissGameOverModal)
  const gameMode = useGameStore((state) => state.gameMode)
  const botPlayer = useGameStore((state) => state.botPlayer)
  const selectedBotId = useGameStore((state) => state.selectedBotId)
  const setGameMode = useGameStore((state) => state.setGameMode)
  
  const { playerSlot, clearRoom } = useMultiplayerStore()
  
  const isSinglePlayer = gameMode === GAME_MODES.SINGLE_PLAYER
  const isOnline = gameMode === GAME_MODES.ONLINE
  const botName = BOTS[selectedBotId]?.name || 'Bot'
  
  let title = ''
  let subtitle = ''
  let titleClass = ''
  
  if (isDraw) {
    title = "It's a Draw!"
    subtitle = 'The board is full with no winner'
    titleClass = 'draw'
  } else if (winner !== null) {
    if (isOnline) {
      if (winner === playerSlot) {
        title = 'You Win!'
        subtitle = 'Congratulations!'
      } else {
        title = 'You Lose!'
        subtitle = 'Better luck next time!'
      }
    } else if (isSinglePlayer) {
      if (winner === botPlayer) {
        title = `${botName} Wins!`
        subtitle = 'Better luck next time!'
      } else {
        title = 'You Win!'
        subtitle = 'Congratulations!'
      }
    } else {
      title = `Player ${winner + 1} Wins!`
      subtitle = 'Four in a row!'
    }
    titleClass = `player-${winner}`
  }
  
  // Handle leaving online game
  const handleLeaveOnline = () => {
    clearRoom()
    setGameMode(GAME_MODES.TWO_PLAYER)
  }
  
  // For online games, show "New Game" instead of "Play Again" 
  // since we'd need to create a new room
  const handlePlayAgain = () => {
    if (isOnline) {
      // Leave current room and go back to lobby
      clearRoom()
      // Stay in online mode so they can create a new game
    }
    resetGame()
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className={titleClass}>{title}</h2>
        <p>{subtitle}</p>
        <div className="modal-buttons">
          {isOnline ? (
            <>
              <button className="play-again-btn" onClick={handlePlayAgain}>
                New Game
              </button>
              <button className="view-board-btn" onClick={dismissGameOverModal}>
                View Board
              </button>
              <button className="leave-game-btn" onClick={handleLeaveOnline}>
                Leave
              </button>
            </>
          ) : (
            <>
              <button className="play-again-btn" onClick={resetGame}>
                Play Again
              </button>
              <button className="view-board-btn" onClick={dismissGameOverModal}>
                View Board
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
