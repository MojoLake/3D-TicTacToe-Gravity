import { useEffect, useRef } from 'react'
import useGameStore, { GAME_MODES } from '../store/gameStore'
import { BOTS, createGameState } from '../game/bots'

/**
 * Hook that triggers bot moves when it's the bot's turn
 * Place this in a component that's always mounted (like App)
 */
export default function useBotTurn() {
  const board = useGameStore((state) => state.board)
  const currentPlayer = useGameStore((state) => state.currentPlayer)
  const gameMode = useGameStore((state) => state.gameMode)
  const selectedBotId = useGameStore((state) => state.selectedBotId)
  const botPlayer = useGameStore((state) => state.botPlayer)
  const winner = useGameStore((state) => state.winner)
  const isDraw = useGameStore((state) => state.isDraw)
  const dropPiece = useGameStore((state) => state.dropPiece)
  
  // Track if we're currently processing a bot move
  const isProcessingRef = useRef(false)
  
  useEffect(() => {
    // Check if it's the bot's turn
    const isBotTurn = 
      gameMode === GAME_MODES.SINGLE_PLAYER &&
      currentPlayer === botPlayer &&
      winner === null &&
      !isDraw
    
    if (!isBotTurn || isProcessingRef.current) {
      return
    }
    
    // Get the selected bot
    const bot = BOTS[selectedBotId]
    if (!bot) {
      console.error(`Bot not found: ${selectedBotId}`)
      return
    }
    
    // Mark as processing to prevent multiple moves
    isProcessingRef.current = true
    
    // Add a small delay so the player can see what's happening
    const timeoutId = setTimeout(() => {
      // Create game state for the bot
      const gameState = createGameState(board, currentPlayer)
      
      // Get bot's move
      const move = bot.getMove(gameState)
      
      if (move && move.x !== undefined && move.z !== undefined) {
        dropPiece(move.x, move.z)
      } else {
        console.error('Bot returned invalid move:', move)
      }
      
      isProcessingRef.current = false
    }, 500) // 500ms delay for bot "thinking"
    
    return () => {
      clearTimeout(timeoutId)
      isProcessingRef.current = false
    }
  }, [board, currentPlayer, gameMode, selectedBotId, botPlayer, winner, isDraw, dropPiece])
}

