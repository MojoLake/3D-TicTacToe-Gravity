/**
 * Bot API for 3D Tic-Tac-Toe
 * 
 * To create a new bot, implement the Bot interface:
 * 
 * const myBot = {
 *   id: 'my-bot',           // Unique identifier
 *   name: 'My Bot',         // Display name
 *   description: 'A description of how this bot plays',
 *   
 *   // Called when it's the bot's turn
 *   // Returns { x, z } coordinates for the column to drop a piece
 *   getMove: (gameState) => {
 *     const { board, currentPlayer, getValidMoves, getDropPosition } = gameState
 *     const validMoves = getValidMoves()
 *     // ... your logic here ...
 *     return { x, z }
 *   }
 * }
 */

import { GRID_SIZE } from '../winningLines'

// Import bot implementations
import { RandomBot } from './RandomBot'
import { GreedyBot } from './GreedyBot'

/**
 * Get all valid moves (columns that aren't full)
 * @param {Array} board - 4x4x4 game board
 * @returns {Array<{x: number, z: number}>} - Array of valid column coordinates
 */
export function getValidMoves(board) {
  const moves = []
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      // Check if top position is empty (column not full)
      if (board[x][GRID_SIZE - 1][z] === null) {
        moves.push({ x, z })
      }
    }
  }
  return moves
}

/**
 * Get the Y position where a piece would land in a column
 * @param {Array} board - 4x4x4 game board
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {number} - Y position or -1 if column is full
 */
export function getDropPosition(board, x, z) {
  for (let y = 0; y < GRID_SIZE; y++) {
    if (board[x][y][z] === null) {
      return y
    }
  }
  return -1
}

/**
 * Create a deep copy of the board
 * @param {Array} board - 4x4x4 game board
 * @returns {Array} - Copy of the board
 */
export function copyBoard(board) {
  return board.map(layer => layer.map(row => [...row]))
}

/**
 * Simulate a move on a board copy
 * @param {Array} board - 4x4x4 game board (will be copied)
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @param {number} player - Player number (0 or 1)
 * @returns {Array|null} - New board state or null if move invalid
 */
export function simulateMove(board, x, z, player) {
  const y = getDropPosition(board, x, z)
  if (y === -1) return null
  
  const newBoard = copyBoard(board)
  newBoard[x][y][z] = player
  return newBoard
}

/**
 * Create game state object to pass to bots
 * @param {Array} board - Current board state
 * @param {number} currentPlayer - Current player (0 or 1)
 * @returns {Object} - Game state for bot consumption
 */
export function createGameState(board, currentPlayer) {
  return {
    board: copyBoard(board), // Give bot a copy so it can't mutate
    currentPlayer,
    getValidMoves: () => getValidMoves(board),
    getDropPosition: (x, z) => getDropPosition(board, x, z),
    simulateMove: (x, z, player = currentPlayer) => simulateMove(board, x, z, player),
    GRID_SIZE
  }
}

// Registry of available bots
export const BOTS = {
  [RandomBot.id]: RandomBot,
  [GreedyBot.id]: GreedyBot,
}

// Default bot
export const DEFAULT_BOT_ID = RandomBot.id

// Export individual bots for direct import if needed
export { RandomBot, GreedyBot }

