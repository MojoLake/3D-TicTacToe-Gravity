import { useEffect, useCallback, useRef } from 'react'
import { subscribeToGame, updateGameState, getRoom } from '../multiplayer/roomManager'
import useGameStore, { GAME_MODES } from '../store/gameStore'
import useMultiplayerStore from '../store/multiplayerStore'

/**
 * Hook that manages online multiplayer game synchronization
 * - Subscribes to real-time updates from Supabase
 * - Sends moves to the server
 * - Handles opponent joining
 * - Handles reconnection on page refresh
 */
export default function useOnlineGame() {
  const gameMode = useGameStore((state) => state.gameMode)
  const syncFromServer = useGameStore((state) => state.syncFromServer)
  const initFromServer = useGameStore((state) => state.initFromServer)
  const setGameMode = useGameStore((state) => state.setGameMode)
  const setOnlineMoveCallback = useGameStore((state) => state.setOnlineMoveCallback)
  
  const roomId = useMultiplayerStore((state) => state.roomId)
  const playerSlot = useMultiplayerStore((state) => state.playerSlot)
  const savedRoom = useMultiplayerStore((state) => state.savedRoom)
  const setRoom = useMultiplayerStore((state) => state.setRoom)
  const setOpponentJoined = useMultiplayerStore((state) => state.setOpponentJoined)
  const setConnected = useMultiplayerStore((state) => state.setConnected)
  const setReconnecting = useMultiplayerStore((state) => state.setReconnecting)
  const clearRoom = useMultiplayerStore((state) => state.clearRoom)
  
  // Track if we're currently sending a move (to avoid processing our own updates)
  const isSendingRef = useRef(false)
  
  // Attempt reconnection on mount if there's a saved room
  useEffect(() => {
    const attemptReconnection = async () => {
      // Skip if already in a room or no saved room
      if (roomId || !savedRoom) return
      
      // Check if saved room is recent (within 24 hours)
      const age = Date.now() - savedRoom.timestamp
      if (age > 24 * 60 * 60 * 1000) {
        useMultiplayerStore.getState().clearSavedRoom()
        return
      }
      
      setReconnecting(true)
      
      try {
        const room = await getRoom(savedRoom.roomId)
        
        if (!room) {
          // Room no longer exists
          clearRoom()
          return
        }
        
        // Check if game is finished
        if (room.status === 'finished') {
          clearRoom()
          return
        }
        
        // Reconnect to the room
        setGameMode(GAME_MODES.ONLINE)
        setRoom(room, savedRoom.playerSlot)
        initFromServer(room)
      } catch (error) {
        console.error('Reconnection failed:', error)
        clearRoom()
      } finally {
        setReconnecting(false)
      }
    }
    
    attemptReconnection()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Callback to send move to server
  const makeMove = useCallback(async (gameState) => {
    if (!roomId) return
    
    isSendingRef.current = true
    
    try {
      await updateGameState(roomId, {
        board: gameState.board,
        current_player: gameState.currentPlayer,
        winner: gameState.isDraw ? -1 : gameState.winner,
        winning_line: gameState.winningLine,
        status: gameState.winner !== null || gameState.isDraw ? 'finished' : 'playing',
      })
    } catch (error) {
      console.error('Failed to send move:', error)
    } finally {
      // Small delay to let our own update propagate
      setTimeout(() => {
        isSendingRef.current = false
      }, 100)
    }
  }, [roomId])
  
  // Set up the move callback when entering online mode
  useEffect(() => {
    if (gameMode === GAME_MODES.ONLINE && roomId) {
      setOnlineMoveCallback(makeMove)
    } else {
      setOnlineMoveCallback(null)
    }
    
    return () => {
      setOnlineMoveCallback(null)
    }
  }, [gameMode, roomId, makeMove, setOnlineMoveCallback])
  
  // Subscribe to game updates
  useEffect(() => {
    if (gameMode !== GAME_MODES.ONLINE || !roomId) {
      return
    }
    
    setConnected(true)
    
    const unsubscribe = subscribeToGame(roomId, (game) => {
      // Skip if this is our own update
      if (isSendingRef.current) return
      
      // Check if opponent just joined
      if (game.player_1_id && game.status === 'playing') {
        setOpponentJoined(true)
      }
      
      // Sync game state
      syncFromServer({
        board: game.board,
        currentPlayer: game.current_player,
        winner: game.winner === -1 ? null : game.winner,
        winningLine: game.winning_line,
        isDraw: game.winner === -1,
      })
    })
    
    return () => {
      unsubscribe()
      setConnected(false)
    }
  }, [gameMode, roomId, syncFromServer, setOpponentJoined, setConnected])
  
  // Handle page unload - clear room on navigate away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Note: We keep the room saved for reconnection
      // The room will auto-expire on the server after 24 hours
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])
  
  // Return helper to check if it's this player's turn
  const currentPlayer = useGameStore((state) => state.currentPlayer)
  const opponentJoined = useMultiplayerStore((state) => state.opponentJoined)
  
  const isMyTurn = gameMode === GAME_MODES.ONLINE && opponentJoined && playerSlot === currentPlayer
  const canPlay = gameMode !== GAME_MODES.ONLINE || isMyTurn
  
  return {
    isMyTurn,
    canPlay,
    playerSlot,
  }
}
