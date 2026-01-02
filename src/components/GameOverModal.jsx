import useGameStore, { GAME_MODES } from '../store/gameStore'
import { BOTS } from '../game/bots'

export default function GameOverModal() {
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  const resetGame = useGameStore((state) => state.resetGame)
  const gameMode = useGameStore((state) => state.gameMode)
  const botPlayer = useGameStore((state) => state.botPlayer)
  const selectedBotId = useGameStore((state) => state.selectedBotId)
  
  const isSinglePlayer = gameMode === GAME_MODES.SINGLE_PLAYER
  const botName = BOTS[selectedBotId]?.name || 'Bot'
  
  let title = ''
  let subtitle = ''
  let titleClass = ''
  
  if (isDraw) {
    title = "It's a Draw!"
    subtitle = "The board is full with no winner"
    titleClass = 'draw'
  } else if (winner !== null) {
    if (isSinglePlayer) {
      if (winner === botPlayer) {
        title = `${botName} Wins!`
        subtitle = "Better luck next time!"
      } else {
        title = "You Win!"
        subtitle = "Congratulations!"
      }
    } else {
      title = `Player ${winner + 1} Wins!`
      subtitle = "Four in a row!"
    }
    titleClass = `player-${winner}`
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className={titleClass}>{title}</h2>
        <p>{subtitle}</p>
        <button className="play-again-btn" onClick={resetGame}>
          Play Again
        </button>
      </div>
    </div>
  )
}

