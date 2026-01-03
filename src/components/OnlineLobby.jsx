import { useState, useEffect } from 'react'
import { createRoom, joinRoom, getShareableLink } from '../multiplayer/roomManager'
import { isSupabaseConfigured } from '../multiplayer/supabaseClient'
import useMultiplayerStore from '../store/multiplayerStore'
import useGameStore, { GAME_MODES } from '../store/gameStore'

export default function OnlineLobby() {
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  
  const {
    roomCode,
    lobbyState,
    setRoom,
    setLobbyState,
    clearRoom,
    opponentJoined,
    isReconnecting,
  } = useMultiplayerStore()
  
  const { initFromServer, setGameMode } = useGameStore()
  
  // Check if Supabase is configured
  const configured = isSupabaseConfigured()
  
  // Handle creating a new game
  const handleCreate = async () => {
    setError(null)
    setLobbyState('creating')
    
    try {
      const room = await createRoom()
      setRoom(room, 0) // Player slot 0 (host)
      initFromServer(room)
    } catch (err) {
      setError(err.message || 'Failed to create game')
      setLobbyState('idle')
    }
  }
  
  // Handle joining an existing game
  const handleJoin = async (code = joinCode) => {
    if (!code.trim()) {
      setError('Please enter a room code')
      return
    }
    
    setError(null)
    setLobbyState('joining')
    
    try {
      const { room, playerSlot } = await joinRoom(code)
      setRoom(room, playerSlot)
      initFromServer(room)
    } catch (err) {
      setError(err.message || 'Failed to join game')
      setLobbyState('idle')
    }
  }
  
  // Handle copying shareable link
  const handleCopyLink = async () => {
    const link = getShareableLink(roomCode)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement('input')
      input.value = link
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Handle canceling/leaving
  const handleCancel = () => {
    clearRoom()
    setGameMode(GAME_MODES.TWO_PLAYER)
  }
  
  // Check URL for room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlRoomCode = params.get('room')
    
    if (urlRoomCode && lobbyState === 'idle') {
      setJoinCode(urlRoomCode)
      handleJoin(urlRoomCode)
      
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('room')
      window.history.replaceState({}, '', url.toString())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Reconnecting state
  if (isReconnecting) {
    return (
      <div className="online-lobby">
        <div className="lobby-card">
          <h2>Reconnecting...</h2>
          <div className="waiting-spinner">
            <div className="spinner"></div>
            <span>Restoring your game session</span>
          </div>
        </div>
      </div>
    )
  }
  
  // Not configured state
  if (!configured) {
    return (
      <div className="online-lobby">
        <div className="lobby-card">
          <h2>Online Multiplayer</h2>
          <div className="lobby-error">
            <p>Supabase is not configured.</p>
            <p className="error-hint">
              Add your Supabase URL and anon key to <code>.env</code> file.
            </p>
          </div>
          <button className="lobby-btn secondary" onClick={handleCancel}>
            Back
          </button>
        </div>
      </div>
    )
  }
  
  // Waiting for opponent
  if (lobbyState === 'waiting') {
    return (
      <div className="online-lobby">
        <div className="lobby-card waiting">
          <h2>Waiting for Opponent</h2>
          
          <div className="room-code-display">
            <span className="room-code-label">Room Code</span>
            <span className="room-code">{roomCode}</span>
          </div>
          
          <p className="waiting-text">
            Share this code or link with a friend
          </p>
          
          <button 
            className={`lobby-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Invite Link
              </>
            )}
          </button>
          
          <div className="waiting-spinner">
            <div className="spinner"></div>
            <span>Waiting for player 2...</span>
          </div>
          
          <button className="lobby-btn secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }
  
  // Game in progress (opponent joined) - don't show lobby
  if (lobbyState === 'playing' || opponentJoined) {
    return null
  }
  
  // Initial lobby state - create or join
  return (
    <div className="online-lobby">
      <div className="lobby-card">
        <h2>Play Online</h2>
        
        {error && (
          <div className="lobby-error">
            <p>{error}</p>
          </div>
        )}
        
        <div className="lobby-section">
          <button 
            className="lobby-btn primary"
            onClick={handleCreate}
            disabled={lobbyState === 'creating'}
          >
            {lobbyState === 'creating' ? (
              <>
                <div className="spinner small"></div>
                Creating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create Game
              </>
            )}
          </button>
          <p className="lobby-hint">Start a new game and invite a friend</p>
        </div>
        
        <div className="lobby-divider">
          <span>or</span>
        </div>
        
        <div className="lobby-section">
          <div className="join-input-group">
            <input
              type="text"
              placeholder="Enter room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              disabled={lobbyState === 'joining'}
            />
            <button 
              className="lobby-btn"
              onClick={() => handleJoin()}
              disabled={lobbyState === 'joining' || !joinCode.trim()}
            >
              {lobbyState === 'joining' ? (
                <div className="spinner small"></div>
              ) : (
                'Join'
              )}
            </button>
          </div>
          <p className="lobby-hint">Join a friend's game with their code</p>
        </div>
        
        <button className="lobby-btn secondary" onClick={handleCancel}>
          Back
        </button>
      </div>
    </div>
  )
}

