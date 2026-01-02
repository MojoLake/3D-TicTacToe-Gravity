# 3D Tic-Tac-Toe with Gravity - Implementation Plan

## Game Concept

A 3D variant of Tic-Tac-Toe played on a **4×4×4 cube** where:

- Two players take turns dropping pieces into columns
- **Gravity** pulls pieces down to the lowest available position (like Connect Four)
- First player to get **4 in a row** wins (horizontally, vertically, or diagonally in any dimension)
- The 3D aspect creates **76 possible winning lines**

---

## Tech Stack

| Component    | Technology                       |
| ------------ | -------------------------------- |
| Framework    | **React**                        |
| 3D Rendering | **React Three Fiber** + **drei** |
| Animations   | **@react-spring/three**          |
| State        | **Zustand**                      |
| Build Tool   | **Vite**                         |
| Styling      | CSS with custom properties       |

---

## Architecture

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Main app component
├── index.css             # Global styles
├── store/
│   └── gameStore.js      # Zustand store (state, actions)
├── game/
│   └── winningLines.js   # Pre-computed 76 winning lines
└── components/
    ├── Scene.jsx         # Three.js scene setup
    ├── Board.jsx         # 3D board wireframe
    ├── Pieces.jsx        # Player piece rendering
    ├── Columns.jsx       # Clickable columns + hover
    ├── HUD.jsx           # Turn indicator, restart
    └── GameOverModal.jsx # Win/draw screen
```

---

## Implementation Phases

### Phase 1: Project Setup & Core Game Logic ✅

**Goal**: Working game state without visuals

- [x] Initialize Vite project with React Three Fiber
- [x] Create 4×4×4 grid data structure
- [x] Implement piece placement with gravity
- [x] Build win detection algorithm (check all 76 lines)
- [x] Add turn management and draw detection

**Key Data Structure:**

```javascript
// 3D array: board[x][y][z] where y=0 is bottom
// null = empty, 0 = player 1, 1 = player 2
```

### Phase 2: 3D Scene & Board Rendering ✅

**Goal**: Visual representation of the game board

- [x] Set up Three.js scene, camera, lighting
- [x] Render transparent cube frame/wireframe
- [x] Add grid lines or subtle level indicators
- [x] Implement orbital camera controls
- [x] Create visual column indicators (16 columns)

### Phase 3: Piece Rendering & Animations ✅

**Goal**: Visual pieces with satisfying feedback

- [x] Design distinct pieces for each player (spheres/colors)
- [x] Implement drop animation with easing
- [x] Add "landing" effect (spring physics)
- [x] Highlight winning line on victory (pulsing glow)

### Phase 4: User Interaction ✅

**Goal**: Intuitive piece placement

- [x] Implement raycasting for column detection
- [x] Add hover preview (ghost piece at drop position)
- [x] Visual feedback for clickable columns
- [x] Handle full columns (no placement allowed)

### Phase 5: UI & Polish ✅

**Goal**: Complete user experience

- [x] Current player indicator with piece preview
- [x] Restart game button
- [x] Win/draw announcements
- [x] Mobile touch support
- [ ] Optional: Move history / undo

### Phase 6: Enhancements (Optional)

**Goal**: Extra features for engagement

- [ ] Simple AI opponent (minimax or heuristic)
- [ ] Local multiplayer toggle
- [ ] Sound effects
- [ ] Theme customization
- [ ] Tutorial/rules modal

---

## Win Detection Strategy

The 76 winning lines in a 4×4×4 grid consist of:

| Type            | Count | Description                               |
| --------------- | ----- | ----------------------------------------- |
| Rows            | 16    | Along X-axis (4 per level × 4 levels)     |
| Columns         | 16    | Along Y-axis (4×4 grid of vertical lines) |
| Pillars         | 16    | Along Z-axis (4 per level × 4 levels)     |
| XY Diagonals    | 8     | In XY planes                              |
| XZ Diagonals    | 8     | In XZ planes                              |
| YZ Diagonals    | 8     | In YZ planes                              |
| Space Diagonals | 4     | Corner to corner through cube             |

**Implementation**: Pre-compute all 76 lines as coordinate arrays, check after each move.

---

## Visual Design Goals

- **Clean, modern aesthetic** - dark background, glowing elements
- **Clear depth perception** - subtle grid, lighting, and shadows
- **Distinct player colors** - e.g., Cyan vs Magenta (neon aesthetic)
- **Smooth animations** - 60fps drop animations, subtle idle movements
- **Responsive** - works on desktop and tablet

---

## Interaction Flow

```
1. Game Start
   └─> Player 1's turn (indicated in UI)

2. Hover over board
   └─> Column highlights
   └─> Ghost piece shows drop position

3. Click column
   └─> Piece drops with animation
   └─> Check win condition
   └─> If win → Show winner, offer restart
   └─> If draw → Show draw, offer restart
   └─> Else → Switch turns

4. Restart
   └─> Clear board, reset to Player 1
```

---

## Development Priorities

1. **Playability first** - Core mechanics working before polish
2. **Clear visuals** - Understanding the 3D space is crucial
3. **Satisfying feedback** - Animations and sounds reward actions
4. **Mobile support** - Touch-friendly interactions

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Notes

- Camera should default to an isometric-ish angle showing all levels
- Consider adding "floor shadows" to help perceive piece heights
- The gravity mechanic simplifies interaction (only 16 choices vs 64)
- Full column handling: dim/disable that column visually
