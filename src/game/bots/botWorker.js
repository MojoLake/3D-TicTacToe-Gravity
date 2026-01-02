/**
 * Web Worker for running bot calculations off the main thread
 * 
 * This prevents the UI from freezing during bot "thinking" time.
 */

import { BOTS, createGameState } from './index'

// Handle messages from the main thread
self.onmessage = function(e) {
  const { type, payload } = e.data
  
  if (type === 'CALCULATE_MOVE') {
    const { botId, board, currentPlayer } = payload
    
    try {
      const bot = BOTS[botId]
      if (!bot) {
        self.postMessage({ 
          type: 'ERROR', 
          payload: { error: `Bot not found: ${botId}` }
        })
        return
      }
      
      // Create game state and calculate move
      const gameState = createGameState(board, currentPlayer)
      const move = bot.getMove(gameState)
      
      self.postMessage({ 
        type: 'MOVE_CALCULATED', 
        payload: { move }
      })
    } catch (error) {
      self.postMessage({ 
        type: 'ERROR', 
        payload: { error: error.message }
      })
    }
  }
}

