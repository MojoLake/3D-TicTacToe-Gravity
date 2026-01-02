/**
 * Expert Bot - Uses iterative deepening with time limit
 * 
 * Strategy:
 * - Iterative deepening search
 * - Alpha-beta pruning with move ordering
 * - Transposition table for caching evaluated positions
 * - 5-second time limit (searches as deep as possible)
 * 
 * Nearly unbeatable - plays close to optimally.
 */

import {
  evaluateBoard,
  checkWinner,
  isBoardFull,
  getValidMoves,
  applyMove,
  orderMoves,
  boardHash,
  SCORES
} from './evaluation'

const TIME_LIMIT_MS = 5000
const MAX_DEPTH = 20 // Safety limit

// Transposition table entry types
const TT_EXACT = 0
const TT_LOWER = 1 // Alpha cutoff (at least this value)
const TT_UPPER = 2 // Beta cutoff (at most this value)

export const ExpertBot = {
  id: 'expert',
  name: 'Expert Bot',
  description: 'Thinks deeply (up to 5s). Nearly unbeatable.',
  
  getMove: (gameState) => {
    const { board, currentPlayer } = gameState
    const validMoves = getValidMoves(board)
    
    if (validMoves.length === 0) {
      return null
    }
    
    // If only one move, take it immediately
    if (validMoves.length === 1) {
      return validMoves[0]
    }
    
    // Check for immediate winning move
    for (const move of validMoves) {
      const testBoard = applyMove(board, move.x, move.z, currentPlayer)
      if (testBoard && checkWinner(testBoard)?.winner === currentPlayer) {
        return move
      }
    }
    
    // Iterative deepening search
    const startTime = Date.now()
    const transpositionTable = new Map()
    
    let bestMove = validMoves[0]
    let lastCompletedDepth = 0
    
    // Order moves initially
    let orderedMoves = orderMoves(board, validMoves, currentPlayer)
    
    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
      const timeElapsed = Date.now() - startTime
      if (timeElapsed > TIME_LIMIT_MS * 0.9) {
        // Stop if we've used 90% of time (leave buffer for this iteration)
        break
      }
      
      const result = searchAtDepth(
        board,
        depth,
        currentPlayer,
        transpositionTable,
        startTime,
        orderedMoves
      )
      
      if (result.timedOut) {
        // Use result from last completed depth
        break
      }
      
      bestMove = result.bestMove
      lastCompletedDepth = depth
      
      // Reorder moves based on scores from this depth (best move first)
      if (result.moveScores && result.moveScores.length > 0) {
        result.moveScores.sort((a, b) => b.score - a.score)
        orderedMoves = result.moveScores.map(ms => ms.move)
      }
      
      // If we found a winning sequence, no need to search deeper
      if (result.bestScore >= SCORES.WIN * 0.5) {
        break
      }
    }
    
    // Log search depth for debugging (in development)
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(`ExpertBot searched to depth ${lastCompletedDepth} in ${Date.now() - startTime}ms`)
    }
    
    return bestMove
  }
}

/**
 * Search at a specific depth with iterative deepening
 */
function searchAtDepth(board, depth, botPlayer, transpositionTable, startTime, orderedMoves) {
  let bestMove = orderedMoves[0]
  let bestScore = -Infinity
  let alpha = -Infinity
  const beta = Infinity
  const moveScores = []
  
  for (const move of orderedMoves) {
    // Check timeout
    if (Date.now() - startTime > TIME_LIMIT_MS) {
      return { bestMove, bestScore, timedOut: true, moveScores }
    }
    
    const newBoard = applyMove(board, move.x, move.z, botPlayer)
    if (!newBoard) continue
    
    const score = minimaxTT(
      newBoard,
      depth - 1,
      -Infinity,
      -alpha, // Negamax-style bounds
      false,
      botPlayer,
      transpositionTable,
      startTime
    )
    
    moveScores.push({ move, score })
    
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
    
    alpha = Math.max(alpha, score)
  }
  
  return { bestMove, bestScore, timedOut: false, moveScores }
}

/**
 * Minimax with alpha-beta pruning and transposition table
 */
function minimaxTT(board, depth, alpha, beta, isMaximizing, botPlayer, tt, startTime) {
  // Check timeout periodically
  if (depth > 2 && Date.now() - startTime > TIME_LIMIT_MS) {
    return 0 // Return neutral score on timeout
  }
  
  // Check transposition table
  const hash = boardHash(board)
  const ttEntry = tt.get(hash)
  
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.type === TT_EXACT) {
      return ttEntry.score
    } else if (ttEntry.type === TT_LOWER && ttEntry.score >= beta) {
      return ttEntry.score
    } else if (ttEntry.type === TT_UPPER && ttEntry.score <= alpha) {
      return ttEntry.score
    }
  }
  
  // Terminal conditions
  const winner = checkWinner(board)
  if (winner) {
    const baseScore = winner.winner === botPlayer ? SCORES.WIN : -SCORES.WIN
    // Adjust for depth - prefer faster wins/slower losses
    return baseScore * (depth + 1) / (MAX_DEPTH + 1)
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
  
  let bestScore
  let ttType
  
  if (isMaximizing) {
    bestScore = -Infinity
    ttType = TT_UPPER
    
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move.x, move.z, currentPlayer)
      if (!newBoard) continue
      
      const score = minimaxTT(newBoard, depth - 1, alpha, beta, false, botPlayer, tt, startTime)
      
      if (score > bestScore) {
        bestScore = score
      }
      
      if (bestScore > alpha) {
        alpha = bestScore
        ttType = TT_EXACT
      }
      
      if (beta <= alpha) {
        ttType = TT_LOWER
        break
      }
    }
  } else {
    bestScore = Infinity
    ttType = TT_LOWER
    
    for (const move of orderedMoves) {
      const newBoard = applyMove(board, move.x, move.z, currentPlayer)
      if (!newBoard) continue
      
      const score = minimaxTT(newBoard, depth - 1, alpha, beta, true, botPlayer, tt, startTime)
      
      if (score < bestScore) {
        bestScore = score
      }
      
      if (bestScore < beta) {
        beta = bestScore
        ttType = TT_EXACT
      }
      
      if (beta <= alpha) {
        ttType = TT_UPPER
        break
      }
    }
  }
  
  // Store in transposition table
  tt.set(hash, {
    depth,
    score: bestScore,
    type: ttType
  })
  
  return bestScore
}

