import { useEffect, useRef } from 'react'
import useGameStore, { GAME_MODES } from '../store/gameStore'
import { BOTS, createGameState } from '../game/bots'
import BotWorker from '../game/bots/botWorker.js?worker'

// Bots that should run in a worker (heavy computation)
const WORKER_BOTS = new Set(['hard', 'expert'])

/**
 * Hook that triggers bot moves when it's the bot's turn
 * Heavy bots (hard, expert) run in a Web Worker to avoid blocking the UI
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
  // Keep worker instance alive
  const workerRef = useRef(null)
  
  // Initialize worker on mount
  useEffect(() => {
    workerRef.current = new BotWorker()
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])
  
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
    
    // Use worker for heavy bots, direct calculation for simple ones
    const useWorker = WORKER_BOTS.has(selectedBotId) && workerRef.current
    
    if (useWorker) {
      // Run in Web Worker (non-blocking)
      const worker = workerRef.current
      
      const handleMessage = (e) => {
        const { type, payload } = e.data
        
        if (type === 'MOVE_CALCULATED') {
          const { move } = payload
          if (move && move.x !== undefined && move.z !== undefined) {
            dropPiece(move.x, move.z)
          } else {
            console.error('Bot returned invalid move:', move)
          }
          isProcessingRef.current = false
          worker.removeEventListener('message', handleMessage)
        } else if (type === 'ERROR') {
          console.error('Bot worker error:', payload.error)
          isProcessingRef.current = false
          worker.removeEventListener('message', handleMessage)
        }
      }
      
      worker.addEventListener('message', handleMessage)
      
      // Small delay so player can see their move first
      const delayTimeoutId = setTimeout(() => {
        worker.postMessage({
          type: 'CALCULATE_MOVE',
          payload: {
            botId: selectedBotId,
            board: JSON.parse(JSON.stringify(board)), // Deep clone for transfer
            currentPlayer
          }
        })
      }, 300)
      
      return () => {
        clearTimeout(delayTimeoutId)
        worker.removeEventListener('message', handleMessage)
        isProcessingRef.current = false
      }
    } else {
      // Run synchronously for simple bots (fast enough)
      const timeoutId = setTimeout(() => {
        const gameState = createGameState(board, currentPlayer)
        const move = bot.getMove(gameState)
        
        if (move && move.x !== undefined && move.z !== undefined) {
          dropPiece(move.x, move.z)
        } else {
          console.error('Bot returned invalid move:', move)
        }
        
        isProcessingRef.current = false
      }, 500)
      
      return () => {
        clearTimeout(timeoutId)
        isProcessingRef.current = false
      }
    }
  }, [board, currentPlayer, gameMode, selectedBotId, botPlayer, winner, isDraw, dropPiece])
}
