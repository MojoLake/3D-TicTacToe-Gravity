import useGameStore from '../store/gameStore'

export default function GameOverModal() {
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  const resetGame = useGameStore((state) => state.resetGame)
  
  let title = ''
  let subtitle = ''
  let titleClass = ''
  
  if (isDraw) {
    title = "It's a Draw!"
    subtitle = "The board is full with no winner"
    titleClass = 'draw'
  } else if (winner !== null) {
    title = `Player ${winner + 1} Wins!`
    subtitle = "Four in a row!"
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

