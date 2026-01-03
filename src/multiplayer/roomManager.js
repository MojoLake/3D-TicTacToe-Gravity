import { supabase, isSupabaseConfigured } from './supabaseClient'
import { getPlayerId } from './identity'
import { createEmptyBoard } from '../store/gameStore'

// Generate readable room code (excludes ambiguous chars like 0/O, 1/I/L)
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// Create a new game room
export async function createRoom() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials to .env')
  }

  const playerId = getPlayerId()
  const roomCode = generateRoomCode()

  const { data, error } = await supabase
    .from('games')
    .insert({
      room_code: roomCode,
      board: createEmptyBoard(),
      player_0_id: playerId,
      status: 'waiting',
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation (extremely rare collision)
    if (error.code === '23505') {
      return createRoom() // Retry with new code
    }
    throw error
  }
  
  return data
}

// Join an existing room by code
export async function joinRoom(roomCode) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add your credentials to .env')
  }

  const playerId = getPlayerId()
  const normalizedCode = roomCode.toUpperCase().trim()

  // Find the room
  const { data: room, error: findError } = await supabase
    .from('games')
    .select()
    .eq('room_code', normalizedCode)
    .single()

  if (findError || !room) {
    throw new Error('Room not found')
  }

  // Check if this player is already in the room (reconnecting)
  if (room.player_0_id === playerId) {
    return { room, playerSlot: 0 }
  }
  
  if (room.player_1_id === playerId) {
    return { room, playerSlot: 1 }
  }

  // Check if room is full
  if (room.player_1_id) {
    throw new Error('Room is full')
  }

  // Check if game already finished
  if (room.status === 'finished') {
    throw new Error('Game has already ended')
  }

  // Claim player 2 slot
  const { data, error } = await supabase
    .from('games')
    .update({
      player_1_id: playerId,
      status: 'playing',
    })
    .eq('id', room.id)
    .is('player_1_id', null) // Only update if still empty (prevent race)
    .select()
    .single()

  if (error || !data) {
    throw new Error('Room is full')
  }

  return { room: data, playerSlot: 1 }
}

// Get room by ID (for reconnection)
export async function getRoom(roomId) {
  if (!isSupabaseConfigured()) {
    return null
  }

  const { data, error } = await supabase
    .from('games')
    .select()
    .eq('id', roomId)
    .single()

  if (error) return null
  return data
}

// Get shareable link for a room
export function getShareableLink(roomCode) {
  const url = new URL(window.location.href)
  url.search = '' // Clear existing params
  url.searchParams.set('room', roomCode)
  return url.toString()
}

// Update game state in database
export async function updateGameState(roomId, updates) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured')
  }

  const { error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', roomId)

  if (error) throw error
}

// Subscribe to game changes
export function subscribeToGame(roomId, onUpdate) {
  if (!isSupabaseConfigured()) {
    return () => {}
  }

  const channel = supabase
    .channel(`game:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

