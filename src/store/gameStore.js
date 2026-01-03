import { create } from 'zustand'
import { WINNING_LINES, GRID_SIZE } from '../game/winningLines'
import { DEFAULT_BOT_ID } from '../game/bots'

// Game modes
export const GAME_MODES = {
  TWO_PLAYER: 'two-player',
  SINGLE_PLAYER: 'single-player',
  ONLINE: 'online',
}

// Create empty 4x4x4 board (exported for multiplayer room creation)
export function createEmptyBoard() {
  const board = []
  for (let x = 0; x < GRID_SIZE; x++) {
    board[x] = []
    for (let y = 0; y < GRID_SIZE; y++) {
      board[x][y] = []
      for (let z = 0; z < GRID_SIZE; z++) {
        board[x][y][z] = null
      }
    }
  }
  return board
}

// Check if a player has won
function checkWinner(board) {
  for (const line of WINNING_LINES) {
    const [first, ...rest] = line
    const [x, y, z] = first
    const player = board[x][y][z]
    
    if (player === null) continue
    
    const allMatch = rest.every(([px, py, pz]) => board[px][py][pz] === player)
    
    if (allMatch) {
      return { winner: player, winningLine: line }
    }
  }
  return null
}

// Check if board is full (draw)
function isBoardFull(board) {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      // Check if top position of each column is empty
      if (board[x][GRID_SIZE - 1][z] === null) {
        return false
      }
    }
  }
  return true
}

// Get the Y position where a piece would land in a column
function getDropPosition(board, x, z) {
  for (let y = 0; y < GRID_SIZE; y++) {
    if (board[x][y][z] === null) {
      return y
    }
  }
  return -1 // Column is full
}

const useGameStore = create((set, get) => ({
  board: createEmptyBoard(),
  currentPlayer: 0, // 0 = player 1, 1 = player 2/bot
  winner: null,
  winningLine: null,
  isDraw: false,
  hoveredColumn: null, // { x, z }
  lastMove: null, // { x, y, z, player }
  isHoveringBoard: false, // Track if user is hovering over the board
  autoRotateEnabled: true, // Toggle for auto-rotation
  showGameOverModal: true, // Whether to show the game over modal
  
  // Game mode settings
  gameMode: GAME_MODES.TWO_PLAYER, // 'two-player', 'single-player', or 'online'
  selectedBotId: DEFAULT_BOT_ID, // Which bot to use in single player
  botPlayer: 1, // Which player the bot controls (0 or 1)
  
  // Online game callback (set by useOnlineGame hook)
  onlineMoveCallback: null,
  
  // Set the hovered column for preview
  setHoveredColumn: (column) => {
    set({ hoveredColumn: column })
  },
  
  // Set board hover state (for disabling auto-rotate)
  setIsHoveringBoard: (isHovering) => {
    set({ isHoveringBoard: isHovering })
  },
  
  // Toggle auto-rotation on/off
  toggleAutoRotate: () => {
    set((state) => ({ autoRotateEnabled: !state.autoRotateEnabled }))
  },
  
  // Dismiss the game over modal to view the board
  dismissGameOverModal: () => {
    set({ showGameOverModal: false })
  },
  
  // Set game mode
  setGameMode: (mode) => {
    set({ gameMode: mode })
    get().resetGame()
  },
  
  // Set which bot to use
  setSelectedBot: (botId) => {
    set({ selectedBotId: botId })
  },
  
  // Set which player the human plays as (bot gets the other)
  setHumanPlayer: (player) => {
    set({ botPlayer: player === 0 ? 1 : 0 })
    get().resetGame()
  },
  
  // Set online move callback
  setOnlineMoveCallback: (callback) => {
    set({ onlineMoveCallback: callback })
  },
  
  // Check if it's currently the bot's turn
  isBotTurn: () => {
    const state = get()
    return (
      state.gameMode === GAME_MODES.SINGLE_PLAYER &&
      state.currentPlayer === state.botPlayer &&
      state.winner === null &&
      !state.isDraw
    )
  },
  
  // Get where a piece would land in a column
  getDropY: (x, z) => {
    return getDropPosition(get().board, x, z)
  },
  
  // Drop a piece into a column
  dropPiece: (x, z) => {
    const state = get()
    
    // Can't play if game is over
    if (state.winner !== null || state.isDraw) return false
    
    const y = getDropPosition(state.board, x, z)
    
    // Column is full
    if (y === -1) return false
    
    // Create new board with the piece
    const newBoard = state.board.map(layer => 
      layer.map(row => [...row])
    )
    newBoard[x][y][z] = state.currentPlayer
    
    // Check for winner
    const result = checkWinner(newBoard)
    
    // Check for draw
    const draw = !result && isBoardFull(newBoard)
    
    const newCurrentPlayer = state.currentPlayer === 0 ? 1 : 0
    
    set({
      board: newBoard,
      currentPlayer: newCurrentPlayer,
      winner: result?.winner ?? null,
      winningLine: result?.winningLine ?? null,
      isDraw: draw,
      lastMove: { x, y, z, player: state.currentPlayer }
    })
    
    // If online mode, send move to server
    if (state.gameMode === GAME_MODES.ONLINE && state.onlineMoveCallback) {
      state.onlineMoveCallback({
        board: newBoard,
        currentPlayer: newCurrentPlayer,
        winner: result?.winner ?? null,
        winningLine: result?.winningLine ?? null,
        isDraw: draw,
      })
    }
    
    return true
  },
  
  // Sync state from server (for online multiplayer)
  syncFromServer: (serverState) => {
    const state = get()
    
    // Only sync if we're in online mode
    if (state.gameMode !== GAME_MODES.ONLINE) return
    
    // Calculate lastMove by comparing boards
    let lastMove = null
    if (serverState.board) {
      const oldBoard = state.board
      const newBoard = serverState.board
      
      // Find the new piece (if any)
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let z = 0; z < GRID_SIZE; z++) {
            if (oldBoard[x][y][z] === null && newBoard[x][y][z] !== null) {
              lastMove = { x, y, z, player: newBoard[x][y][z] }
              break
            }
          }
          if (lastMove) break
        }
        if (lastMove) break
      }
    }
    
    set({
      board: serverState.board ?? state.board,
      currentPlayer: serverState.currentPlayer ?? state.currentPlayer,
      winner: serverState.winner,
      winningLine: serverState.winningLine ?? null,
      isDraw: serverState.isDraw ?? false,
      lastMove: lastMove ?? state.lastMove,
      showGameOverModal: serverState.winner !== null || serverState.isDraw ? true : state.showGameOverModal,
    })
  },
  
  // Initialize game from server state (when joining a room)
  initFromServer: (serverState) => {
    set({
      board: serverState.board,
      currentPlayer: serverState.current_player,
      winner: serverState.winner,
      winningLine: serverState.winning_line,
      isDraw: serverState.winner === -1,
      lastMove: null,
      hoveredColumn: null,
      isHoveringBoard: false,
      showGameOverModal: serverState.winner !== null,
    })
  },
  
  // Reset the game (preserves game mode and bot settings)
  resetGame: () => {
    set({
      board: createEmptyBoard(),
      currentPlayer: 0,
      winner: null,
      winningLine: null,
      isDraw: false,
      hoveredColumn: null,
      lastMove: null,
      isHoveringBoard: false,
      autoRotateEnabled: true,
      showGameOverModal: true
      // gameMode, selectedBotId, and botPlayer are preserved
    })
  }
}))

export default useGameStore
