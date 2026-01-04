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
    floorColor: '#c9b896',
    ambientColor: '#fff5e6',
    lightColor: '#ffe8c4',
    // Board & environment colors
    sceneBackground: '#e8dcc8',
    gridLineColor: '#8b7355',
    platformColor: '#d4a86a',
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
    floorColor: '#f8c8d4',
    ambientColor: '#ffe0e8',
    lightColor: '#ffb8cc',
    // Board & environment colors
    sceneBackground: '#f9d5dc',
    gridLineColor: '#e05588',
    platformColor: '#f78fa8',
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
    floorColor: '#a8dff8',
    ambientColor: '#d0f0ff',
    lightColor: '#88d8ff',
    // Board & environment colors
    sceneBackground: '#c8e8f8',
    gridLineColor: '#2a7090',
    platformColor: '#5cc8f0',
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
    floorColor: '#dcc8f8',
    ambientColor: '#f0e0ff',
    lightColor: '#d8b8ff',
    // Board & environment colors
    sceneBackground: '#e8d8f8',
    gridLineColor: '#7c4dbd',
    platformColor: '#b888e8',
    indicatorColor: '#a78bfa',
    highlightColor: '#6b21a8',
  },
  mono: {
    id: 'mono',
    name: 'Mono',
    // CSS variables
    colorBg: '#f0f0f0',
    colorBgSecondary: '#e0e0e0',
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
    floorColor: '#c8c8c8',
    ambientColor: '#ffffff',
    lightColor: '#e8e8e8',
    // Board & environment colors
    sceneBackground: '#d8d8d8',
    gridLineColor: '#505050',
    platformColor: '#909090',
    indicatorColor: '#707070',
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

