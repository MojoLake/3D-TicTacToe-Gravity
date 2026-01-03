// Persistent anonymous player ID
// Stored in localStorage so it persists across sessions

const STORAGE_KEY = 'ttt_player_id'

export function getPlayerId() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

// Clear player ID (for testing/debugging)
export function clearPlayerId() {
  localStorage.removeItem(STORAGE_KEY)
}

