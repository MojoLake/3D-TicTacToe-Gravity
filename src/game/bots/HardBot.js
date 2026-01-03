/**
 * Hard Bot - Uses minimax with alpha-beta pruning
 * 
 * Strategy:
 * - Fixed depth search (depth 5)
 * - Alpha-beta pruning for efficiency
 * - Move ordering for better pruning
 * - Strong evaluation function
 * 
 * Should beat most casual players but remains beatable by experts.
 * Target response time: < 500ms
 */

import {
  evaluateBoard,
  checkWinner,
  isBoardFull,
  getValidMoves,
  applyMove,
  orderMoves,
  SCORES
} from './evaluation'

const SEARCH_DEPTH = 5

export const HardBot = {
  id: 'hard',
  name: 'Hard',
  description: 'Thinks several moves ahead. A serious challenge.',
  
  getMove: (gameState) => {
    const { board, currentPlayer } = gameState
    const validMoves = getValidMoves(board)
    
    if (validMoves.length === 0) {
      return null
    }
    
    // If only one move, take it
    if (validMoves.length === 1) {
      return validMoves[0]
    }
    
    // Order moves for better pruning
    const orderedMoves = orderMoves(board, validMoves, currentPlayer)
    
    let bestMove = orderedMoves[0]
    let bestScore = -Infinity
    
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move.x, move.z, currentPlayer)
      if (!newBoard) continue
      
      // Check for immediate win
      if (checkWinner(newBoard)?.winner === currentPlayer) {
        return move
      }
      
      const score = minimax(
        newBoard,
        SEARCH_DEPTH - 1,
        -Infinity,
        Infinity,
        false,
        currentPlayer
      )
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    return bestMove
  }
}

/**
 * Minimax with alpha-beta pruning
 * 
 * @param {Array} board - Current board state
 * @param {number} depth - Remaining search depth
 * @param {number} alpha - Best score for maximizer
 * @param {number} beta - Best score for minimizer
 * @param {boolean} isMaximizing - Whether current player is maximizing
 * @param {number} botPlayer - The bot's player number (for evaluation perspective)
 * @returns {number} - Best score found
 */
function minimax(board, depth, alpha, beta, isMaximizing, botPlayer) {
  // Terminal conditions
  const winner = checkWinner(board)
  if (winner) {
    // Return score relative to bot's perspective, adjusted for depth
    // Faster wins are worth more
    const baseScore = winner.winner === botPlayer ? SCORES.WIN : -SCORES.WIN
    return baseScore * (depth + 1) / (SEARCH_DEPTH + 1)
  }
  
  if (isBoardFull(board)) {
    return 0 // Draw
  }
  
  if (depth === 0) {
    return evaluateBoard(board, botPlayer)
  }
  
  const currentPlayer = isMaximizing ? botPlayer : (botPlayer === 0 ? 1 : 0)
  const moves = getValidMoves(board)
  const orderedMoves = orderMoves(board, moves, currentPlayer)
  
  if (isMaximizing) {
    let maxScore = -Infinity
    
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move.x, move.z, currentPlayer)
      if (!newBoard) continue
      
      const score = minimax(newBoard, depth - 1, alpha, beta, false, botPlayer)
      maxScore = Math.max(maxScore, score)
      alpha = Math.max(alpha, score)
      
      if (beta <= alpha) {
        break // Beta cutoff
      }
    }
    
    return maxScore
  } else {
    let minScore = Infinity
    
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move.x, move.z, currentPlayer)
      if (!newBoard) continue
      
      const score = minimax(newBoard, depth - 1, alpha, beta, true, botPlayer)
      minScore = Math.min(minScore, score)
      beta = Math.min(beta, score)
      
      if (beta <= alpha) {
        break // Alpha cutoff
      }
    }
    
    return minScore
  }
}

