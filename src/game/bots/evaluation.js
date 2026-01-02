/**
 * Shared evaluation functions for strong bots
 * 
 * Provides position evaluation with:
 * - Threat counting (win detection, 3-in-a-row, 2-in-a-row)
 * - Gravity awareness (only count reachable positions)
 * - Center control bonus
 */

import { WINNING_LINES, GRID_SIZE } from '../winningLines'

// Score constants
export const SCORES = {
  WIN: 100000,
  THREAT_3: 1000,      // 3 in a row with 1 reachable empty
  THREAT_2: 50,        // 2 in a row with 2 reachable empties
  CENTER_BONUS: 10,
  REACHABLE_BONUS: 5,  // Bonus for having pieces in reachable winning lines
}

/**
 * Check if a position is reachable (can be filled next turn due to gravity)
 * A position is reachable if y=0 or there's a piece directly below
 */
export function isReachable(board, x, y, z) {
  if (y === 0) return true
  return board[x][y - 1][z] !== null
}

/**
 * Check if a position will eventually be reachable (for strategic planning)
 * This counts positions that could be filled in future turns
 */
export function willBeReachable(board, x, y, z) {
  // Check all positions below - they must all be filled or fillable
  for (let checkY = 0; checkY < y; checkY++) {
    if (board[x][checkY][z] === null) {
      return true // There's space below, so eventually reachable
    }
  }
  return board[x][y][z] === null // Position itself must be empty
}

/**
 * Get the drop position for a column (where a piece would land)
 */
export function getDropY(board, x, z) {
  for (let y = 0; y < GRID_SIZE; y++) {
    if (board[x][y][z] === null) {
      return y
    }
  }
  return -1 // Column full
}

/**
 * Check if the game is over (someone won)
 * Returns: { winner: 0|1, line: [...] } or null
 */
export function checkWinner(board) {
  for (const line of WINNING_LINES) {
    const [first] = line
    const [x, y, z] = first
    const player = board[x][y][z]
    
    if (player === null) continue
    
    const allMatch = line.every(([px, py, pz]) => board[px][py][pz] === player)
    if (allMatch) {
      return { winner: player, line }
    }
  }
  return null
}

/**
 * Check if the board is full (draw)
 */
export function isBoardFull(board) {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      if (board[x][GRID_SIZE - 1][z] === null) {
        return false
      }
    }
  }
  return true
}

/**
 * Analyze a winning line for threats
 * Returns: { player0: count, player1: count, empty: count, reachableEmpty: count }
 */
function analyzeLine(board, line) {
  let player0 = 0
  let player1 = 0
  let empty = 0
  let reachableEmpty = 0
  
  for (const [x, y, z] of line) {
    const cell = board[x][y][z]
    if (cell === 0) {
      player0++
    } else if (cell === 1) {
      player1++
    } else {
      empty++
      if (isReachable(board, x, y, z)) {
        reachableEmpty++
      }
    }
  }
  
  return { player0, player1, empty, reachableEmpty }
}

/**
 * Evaluate the board from the perspective of a player
 * Higher scores are better for the player
 * 
 * @param {Array} board - The game board
 * @param {number} player - The player to evaluate for (0 or 1)
 * @returns {number} - Score (positive = good for player, negative = bad)
 */
export function evaluateBoard(board, player) {
  const opponent = player === 0 ? 1 : 0
  
  // Check for terminal states first
  const winResult = checkWinner(board)
  if (winResult) {
    return winResult.winner === player ? SCORES.WIN : -SCORES.WIN
  }
  
  if (isBoardFull(board)) {
    return 0 // Draw
  }
  
  let score = 0
  
  // Analyze each winning line
  for (const line of WINNING_LINES) {
    const analysis = analyzeLine(board, line)
    
    // Skip lines that are blocked (have pieces from both players)
    if (analysis.player0 > 0 && analysis.player1 > 0) {
      continue
    }
    
    const playerCount = player === 0 ? analysis.player0 : analysis.player1
    const opponentCount = player === 0 ? analysis.player1 : analysis.player0
    
    // Evaluate player's threats
    if (opponentCount === 0) {
      if (playerCount === 3 && analysis.reachableEmpty >= 1) {
        // Immediate winning threat (3 with reachable empty)
        score += SCORES.THREAT_3
      } else if (playerCount === 2 && analysis.empty === 2) {
        // Developing threat (2 with room to grow)
        score += SCORES.THREAT_2
      } else if (playerCount === 1 && analysis.empty === 3) {
        // Potential line
        score += SCORES.REACHABLE_BONUS
      }
    }
    
    // Evaluate opponent's threats (negative for us)
    if (playerCount === 0) {
      if (opponentCount === 3 && analysis.reachableEmpty >= 1) {
        // Opponent has immediate winning threat
        score -= SCORES.THREAT_3
      } else if (opponentCount === 2 && analysis.empty === 2) {
        score -= SCORES.THREAT_2
      } else if (opponentCount === 1 && analysis.empty === 3) {
        score -= SCORES.REACHABLE_BONUS
      }
    }
  }
  
  // Center control bonus
  // Center positions in a 4x4x4 are around (1,y,1), (1,y,2), (2,y,1), (2,y,2)
  for (let x = 1; x <= 2; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 1; z <= 2; z++) {
        const cell = board[x][y][z]
        if (cell === player) {
          score += SCORES.CENTER_BONUS
        } else if (cell === opponent) {
          score -= SCORES.CENTER_BONUS
        }
      }
    }
  }
  
  return score
}

/**
 * Get all valid moves (non-full columns)
 */
export function getValidMoves(board) {
  const moves = []
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      if (board[x][GRID_SIZE - 1][z] === null) {
        moves.push({ x, z })
      }
    }
  }
  return moves
}

/**
 * Apply a move to the board (returns new board, doesn't mutate)
 */
export function applyMove(board, x, z, player) {
  const y = getDropY(board, x, z)
  if (y === -1) return null
  
  const newBoard = board.map(layer => layer.map(row => [...row]))
  newBoard[x][y][z] = player
  return newBoard
}

/**
 * Order moves for better alpha-beta pruning
 * Returns moves sorted by estimated value (best first)
 */
export function orderMoves(board, moves, player) {
  const opponent = player === 0 ? 1 : 0
  
  const scored = moves.map(move => {
    const { x, z } = move
    const y = getDropY(board, x, z)
    if (y === -1) return { move, score: -Infinity }
    
    let score = 0
    
    // Check if this move wins
    const testBoard = applyMove(board, x, z, player)
    if (testBoard && checkWinner(testBoard)?.winner === player) {
      return { move, score: 100000 }
    }
    
    // Check if this blocks an opponent win
    const blockBoard = applyMove(board, x, z, opponent)
    if (blockBoard && checkWinner(blockBoard)?.winner === opponent) {
      score += 50000
    }
    
    // Prefer center columns
    const centerDist = Math.abs(x - 1.5) + Math.abs(z - 1.5)
    score += (3 - centerDist) * 100
    
    // Prefer lower positions (more stable)
    score += (GRID_SIZE - y) * 10
    
    return { move, score }
  })
  
  // Sort descending by score
  scored.sort((a, b) => b.score - a.score)
  
  return scored.map(s => s.move)
}

/**
 * Create a hash key for the board state (for transposition table)
 */
export function boardHash(board) {
  let hash = ''
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const cell = board[x][y][z]
        hash += cell === null ? '.' : cell.toString()
      }
    }
  }
  return hash
}

