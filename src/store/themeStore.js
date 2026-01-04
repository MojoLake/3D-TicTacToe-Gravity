import { create } from 'zustand'

// Theme definitions with CSS and 3D colors
export const THEMES = {
  earth: {
    id: 'earth',
    name: 'Earth',
    // CSS variables
    colorBg: '#f5f0e6',
    colorBgSecondary: '#ebe4d6',
    colorPlayer1: '#deb887',
    colorPlayer1Glow: 'rgba(222, 184, 135, 0.5)',
    colorPlayer2: '#5c4033',
    colorPlayer2Glow: 'rgba(92, 64, 51, 0.5)',
    colorText: '#3d2817',
    colorTextDim: '#8b7355',
    colorAccent: '#8b7355',
    colorBorder: '#c4a574',
    // 3D scene colors
    player1Color: '#deb887',
    player1Emissive: '#c4a574',
    player2Color: '#5c4033',
    player2Emissive: '#3d2817',
    floorColor: '#d4c4a8',
    ambientColor: '#fff5e6',
    lightColor: '#fff8f0',
    // Board & environment colors
    sceneBackground: '#f5f0e6',
    gridLineColor: '#8b7355',
    platformColor: '#c4a574',
    indicatorColor: '#a08060',
    highlightColor: '#5c4033',
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    // CSS variables
    colorBg: '#fdf2f4',
    colorBgSecondary: '#fce7eb',
    colorPlayer1: '#f9a8b8',
    colorPlayer1Glow: 'rgba(249, 168, 184, 0.5)',
    colorPlayer2: '#be185d',
    colorPlayer2Glow: 'rgba(190, 24, 93, 0.5)',
    colorText: '#831843',
    colorTextDim: '#d4648a',
    colorAccent: '#d4648a',
    colorBorder: '#f9a8b8',
    // 3D scene colors
    player1Color: '#f9a8b8',
    player1Emissive: '#f472b6',
    player2Color: '#be185d',
    player2Emissive: '#9d174d',
    floorColor: '#fce7eb',
    ambientColor: '#fff5f7',
    lightColor: '#fff0f3',
    // Board & environment colors
    sceneBackground: '#fdf2f4',
    gridLineColor: '#d4648a',
    platformColor: '#f9a8b8',
    indicatorColor: '#e879a9',
    highlightColor: '#be185d',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    // CSS variables
    colorBg: '#f0f9ff',
    colorBgSecondary: '#e0f2fe',
    colorPlayer1: '#38bdf8',
    colorPlayer1Glow: 'rgba(56, 189, 248, 0.5)',
    colorPlayer2: '#0c4a6e',
    colorPlayer2Glow: 'rgba(12, 74, 110, 0.5)',
    colorText: '#0c4a6e',
    colorTextDim: '#4a90a4',
    colorAccent: '#4a90a4',
    colorBorder: '#7dd3fc',
    // 3D scene colors
    player1Color: '#38bdf8',
    player1Emissive: '#0ea5e9',
    player2Color: '#0c4a6e',
    player2Emissive: '#082f49',
    floorColor: '#e0f2fe',
    ambientColor: '#f0f9ff',
    lightColor: '#e0f7ff',
    // Board & environment colors
    sceneBackground: '#f0f9ff',
    gridLineColor: '#4a90a4',
    platformColor: '#7dd3fc',
    indicatorColor: '#67c3dc',
    highlightColor: '#0c4a6e',
  },
  violet: {
    id: 'violet',
    name: 'Violet',
    // CSS variables
    colorBg: '#faf5ff',
    colorBgSecondary: '#f3e8ff',
    colorPlayer1: '#c084fc',
    colorPlayer1Glow: 'rgba(192, 132, 252, 0.5)',
    colorPlayer2: '#6b21a8',
    colorPlayer2Glow: 'rgba(107, 33, 168, 0.5)',
    colorText: '#581c87',
    colorTextDim: '#8b5cf6',
    colorAccent: '#8b5cf6',
    colorBorder: '#d8b4fe',
    // 3D scene colors
    player1Color: '#c084fc',
    player1Emissive: '#a855f7',
    player2Color: '#6b21a8',
    player2Emissive: '#581c87',
    floorColor: '#f3e8ff',
    ambientColor: '#faf5ff',
    lightColor: '#f5f0ff',
    // Board & environment colors
    sceneBackground: '#faf5ff',
    gridLineColor: '#8b5cf6',
    platformColor: '#d8b4fe',
    indicatorColor: '#a78bfa',
    highlightColor: '#6b21a8',
  },
  mono: {
    id: 'mono',
    name: 'Mono',
    // CSS variables
    colorBg: '#f5f5f5',
    colorBgSecondary: '#e5e5e5',
    colorPlayer1: '#fafafa',
    colorPlayer1Glow: 'rgba(250, 250, 250, 0.5)',
    colorPlayer2: '#171717',
    colorPlayer2Glow: 'rgba(23, 23, 23, 0.5)',
    colorText: '#171717',
    colorTextDim: '#666666',
    colorAccent: '#666666',
    colorBorder: '#a3a3a3',
    // 3D scene colors
    player1Color: '#fafafa',
    player1Emissive: '#d4d4d4',
    player2Color: '#171717',
    player2Emissive: '#404040',
    floorColor: '#e5e5e5',
    ambientColor: '#ffffff',
    lightColor: '#ffffff',
    // Board & environment colors
    sceneBackground: '#f5f5f5',
    gridLineColor: '#666666',
    platformColor: '#a3a3a3',
    indicatorColor: '#888888',
    highlightColor: '#171717',
  },
}

const STORAGE_KEY = 'tictactoe-theme'

// Get initial theme from localStorage or default to 'earth'
function getInitialTheme() {
  if (typeof window === 'undefined') return 'earth'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && THEMES[stored]) {
    return stored
  }
  return 'earth'
}

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  
  setTheme: (themeId) => {
    if (!THEMES[themeId]) return
    
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, themeId)
    
    set({ theme: themeId })
  },
  
  // Get current theme config
  getThemeConfig: () => {
    const state = useThemeStore.getState()
    return THEMES[state.theme]
  },
}))

export default useThemeStore

