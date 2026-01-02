/**
 * Random Bot - Makes completely random valid moves
 * The simplest possible bot implementation
 */

export const RandomBot = {
  id: 'random',
  name: 'Random Bot',
  description: 'Makes random moves. Good for beginners.',
  
  getMove: (gameState) => {
    const validMoves = gameState.getValidMoves()
    
    if (validMoves.length === 0) {
      return null // No valid moves
    }
    
    // Pick a random valid move
    const randomIndex = Math.floor(Math.random() * validMoves.length)
    return validMoves[randomIndex]
  }
}

