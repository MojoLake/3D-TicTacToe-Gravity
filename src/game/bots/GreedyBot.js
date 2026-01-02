/**
 * Greedy Bot - Evaluates each move and picks the best one
 * 
 * Strategy:
 * 1. If can win, win
 * 2. If opponent can win, block
 * 3. Prefer moves that create more threats
 * 4. Prefer center columns
 */

import { WINNING_LINES, GRID_SIZE } from '../winningLines'

export const GreedyBot = {
  id: 'greedy',
  name: 'Greedy Bot',
  description: 'Looks one move ahead. A reasonable challenge.',
  
  getMove: (gameState) => {
    const { board, currentPlayer } = gameState
    const validMoves = gameState.getValidMoves()
    const opponent = currentPlayer === 0 ? 1 : 0
    
    if (validMoves.length === 0) {
      return null
    }
    
    let bestMove = null
    let bestScore = -Infinity
    
    for (const move of validMoves) {
      const score = evaluateMove(board, move.x, move.z, currentPlayer, opponent)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    return bestMove || validMoves[0]
  }
}

/**
 * Evaluate a potential move
 */
function evaluateMove(board, x, z, player, opponent) {
  // Find where piece would land
  let y = -1
  for (let i = 0; i < GRID_SIZE; i++) {
    if (board[x][i][z] === null) {
      y = i
      break
    }
  }
  
  if (y === -1) return -Infinity // Column full
  
  // Simulate the move
  const newBoard = board.map(layer => layer.map(row => [...row]))
  newBoard[x][y][z] = player
  
  let score = 0
  
  // Check if this move wins
  if (checkWinAt(newBoard, x, y, z, player)) {
    return 10000 // Winning move - highest priority
  }
  
  // Check if opponent would win at this position (blocking)
  const blockBoard = board.map(layer => layer.map(row => [...row]))
  blockBoard[x][y][z] = opponent
  if (checkWinAt(blockBoard, x, y, z, opponent)) {
    score += 5000 // Blocking move - very high priority
  }
  
  // Count threats created (lines with 3 of our pieces and 1 empty)
  score += countThreats(newBoard, player) * 100
  
  // Count opponent threats we might be enabling
  score -= countThreats(newBoard, opponent) * 50
  
  // Prefer center positions
  const centerDist = Math.abs(x - 1.5) + Math.abs(z - 1.5)
  score += (3 - centerDist) * 10
  
  // Slight preference for lower positions (more stable)
  score += (GRID_SIZE - y) * 5
  
  // Add small random factor to avoid predictability
  score += Math.random() * 2
  
  return score
}

/**
 * Check if placing at position creates a win
 */
function checkWinAt(board, px, py, pz, player) {
  for (const line of WINNING_LINES) {
    // Check if this position is part of the line
    const isInLine = line.some(([x, y, z]) => x === px && y === py && z === pz)
    if (!isInLine) continue
    
    // Check if all positions in line belong to player
    const allMatch = line.every(([x, y, z]) => board[x][y][z] === player)
    if (allMatch) return true
  }
  return false
}

/**
 * Count number of "threat" lines (3 pieces + 1 empty that can be filled)
 */
function countThreats(board, player) {
  let threats = 0
  
  for (const line of WINNING_LINES) {
    let playerCount = 0
    let emptyCount = 0
    let emptyPos = null
    
    for (const [x, y, z] of line) {
      if (board[x][y][z] === player) {
        playerCount++
      } else if (board[x][y][z] === null) {
        emptyCount++
        emptyPos = { x, y, z }
      }
    }
    
    // It's a threat if we have 3 pieces and 1 empty
    if (playerCount === 3 && emptyCount === 1 && emptyPos) {
      // Check if the empty position can actually be filled (gravity check)
      // The position can be filled if it's at y=0 or there's a piece below
      const { x, y, z } = emptyPos
      if (y === 0 || board[x][y - 1][z] !== null) {
        threats++
      }
    }
  }
  
  return threats
}

