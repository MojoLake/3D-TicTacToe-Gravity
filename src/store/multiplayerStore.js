import { create } from 'zustand'
import { getPlayerId } from '../multiplayer/identity'

// LocalStorage key for active room
const ACTIVE_ROOM_KEY = 'ttt_active_room'

// Load saved room from localStorage
function loadSavedRoom() {
  try {
    const saved = localStorage.getItem(ACTIVE_ROOM_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

// Save room to localStorage
function saveRoom(roomCode, roomId, playerSlot) {
  try {
    localStorage.setItem(ACTIVE_ROOM_KEY, JSON.stringify({
      roomCode,
      roomId,
      playerSlot,
      timestamp: Date.now(),
    }))
  } catch {
    // Ignore storage errors
  }
}

// Clear saved room
function clearSavedRoom() {
  try {
    localStorage.removeItem(ACTIVE_ROOM_KEY)
  } catch {
    // Ignore
  }
}

const useMultiplayerStore = create((set, get) => ({
  // Connection state
  isConnected: false,
  connectionError: null,

  // Room state
  roomCode: null,
  roomId: null,

  // Player info
  playerId: getPlayerId(),
  playerSlot: null, // 0 (host/player 1) or 1 (guest/player 2)
  opponentJoined: false,

  // Lobby state
  lobbyState: 'idle', // 'idle' | 'creating' | 'joining' | 'waiting' | 'playing'

  // Reconnection state
  isReconnecting: false,
  savedRoom: loadSavedRoom(),

  // Actions
  setRoom: (room, playerSlot) => {
    const roomCode = room.room_code
    const roomId = room.id
    const opponentJoined = !!room.player_1_id
    
    // Save to localStorage
    saveRoom(roomCode, roomId, playerSlot)
    
    set({
      roomCode,
      roomId,
      playerSlot,
      opponentJoined,
      lobbyState: opponentJoined ? 'playing' : 'waiting',
      savedRoom: { roomCode, roomId, playerSlot, timestamp: Date.now() },
    })
  },

  setOpponentJoined: (joined) => set({ 
    opponentJoined: joined,
    lobbyState: joined ? 'playing' : get().lobbyState,
  }),

  setConnected: (connected) => set({ isConnected: connected }),

  setConnectionError: (error) => set({ connectionError: error }),

  setLobbyState: (state) => set({ lobbyState: state }),

  setReconnecting: (isReconnecting) => set({ isReconnecting }),

  clearRoom: () => {
    clearSavedRoom()
    set({
      roomCode: null,
      roomId: null,
      playerSlot: null,
      opponentJoined: false,
      lobbyState: 'idle',
      connectionError: null,
      savedRoom: null,
      isReconnecting: false,
    })
  },

  // Clear saved room without affecting current state
  clearSavedRoom: () => {
    clearSavedRoom()
    set({ savedRoom: null })
  },

  // Check if it's this player's turn
  isMyTurn: (currentPlayer) => {
    const { playerSlot, opponentJoined } = get()
    return opponentJoined && playerSlot === currentPlayer
  },
}))

export default useMultiplayerStore
