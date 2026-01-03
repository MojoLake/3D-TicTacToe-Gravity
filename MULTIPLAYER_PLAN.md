# Multiplayer Implementation Plan

## Overview

Add **online 1v1 multiplayer** to the 3D Tic-Tac-Toe game, allowing two players to compete in real-time over the internet.

### Goals

- **No accounts required** - anonymous play with session IDs
- **Shareable invite links** - create game, share URL, opponent clicks to join
- Real-time move synchronization
- Graceful handling of disconnections
- Maintain existing local play modes

### User Flow

```
Player 1                              Player 2
────────                              ────────
Click "Play Online"
     ↓
Click "Create Game"
     ↓
Gets link: game.com/?room=ABC123
     ↓
Shares link via text/Discord/etc ──→ Clicks link
     ↓                                    ↓
Waiting screen...                    Auto-joins game
     ↓                                    ↓
     └────────── Game starts! ───────────┘
```

---

## Recommended Tech Stack

| Component             | Choice            | Rationale                                    |
| --------------------- | ----------------- | -------------------------------------------- |
| **Real-time Backend** | Supabase Realtime | Free tier, simple setup, built-in WebSockets |
| **Alternative**       | Partykit          | Edge-first, even simpler, Cloudflare-based   |
| **Alternative**       | Firebase          | Equally viable, Google ecosystem             |

### Why Supabase?

- ✅ Built-in real-time subscriptions
- ✅ Free tier: 500MB DB, 2GB bandwidth, 50K monthly active users
- ✅ No auth required - can use anonymous session IDs
- ✅ Simple REST API for CRUD operations
- ✅ Self-hostable if needed later

---

## Architecture

### Current Flow (Local)

```
User Click → gameStore.dropPiece() → Local State Update → Re-render
```

### New Flow (Online)

```
User Click → Send to Server → Server Updates DB → Realtime Broadcast → All Clients Update
```

### File Structure Changes

```
src/
├── store/
│   ├── gameStore.js          # Existing (modified)
│   └── multiplayerStore.js   # NEW: connection state, room info
├── multiplayer/
│   ├── supabaseClient.js     # NEW: Supabase initialization
│   └── roomManager.js        # NEW: Create/join room functions
├── components/
│   ├── ...existing...
│   ├── OnlineLobby.jsx       # NEW: Create/join game UI
│   └── OnlineStatus.jsx      # NEW: Connection indicator
└── hooks/
    ├── useBotTurn.js         # Existing
    └── useOnlineGame.js      # NEW: Multiplayer sync hook
```

---

## Anonymous Identity

No sign-in required. Each browser gets a persistent session ID:

```javascript
// src/multiplayer/identity.js
export function getPlayerId() {
  let id = localStorage.getItem("ttt_player_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ttt_player_id", id);
  }
  return id;
}
```

This ID:

- Persists across page refreshes
- Identifies the player in game rooms
- Allows reconnection to ongoing games

---

## Data Model

### Supabase `games` Table

| Column           | Type          | Description                         |
| ---------------- | ------------- | ----------------------------------- |
| `id`             | uuid          | Primary key (auto-generated)        |
| `room_code`      | text (unique) | 6-char code (e.g., "ABC123")        |
| `board`          | jsonb         | 4×4×4 board state                   |
| `current_player` | int           | 0 or 1                              |
| `player_0_id`    | text          | Host's session ID                   |
| `player_1_id`    | text (null)   | Guest's session ID (null = waiting) |
| `winner`         | int (null)    | null, 0, 1, or -1 (draw)            |
| `winning_line`   | jsonb (null)  | Coordinates of winning line         |
| `status`         | text          | 'waiting', 'playing', 'finished'    |
| `created_at`     | timestamptz   | Auto-set on insert                  |

### SQL Schema

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  board JSONB NOT NULL,
  current_player INT NOT NULL DEFAULT 0,
  player_0_id TEXT NOT NULL,
  player_1_id TEXT,
  winner INT,
  winning_line JSONB,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for room code lookups
CREATE INDEX idx_games_room_code ON games(room_code);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- RLS: Allow all operations (no auth)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON games FOR ALL USING (true) WITH CHECK (true);

-- Auto-cleanup old games (run via cron or Supabase Edge Function)
-- DELETE FROM games WHERE created_at < NOW() - INTERVAL '24 hours';
```

### Client State (multiplayerStore.js)

```javascript
import { create } from "zustand";

const useMultiplayerStore = create((set, get) => ({
  // Connection
  isConnected: false,

  // Room
  roomCode: null,
  roomId: null,

  // Player info
  playerId: null, // This client's session ID
  playerSlot: null, // 0 (host) or 1 (guest)
  opponentJoined: false,

  // Actions
  setRoom: (room) =>
    set({
      roomCode: room.room_code,
      roomId: room.id,
      playerSlot: room.player_1_id ? 1 : 0,
      opponentJoined: !!room.player_1_id,
    }),
  setOpponentJoined: (joined) => set({ opponentJoined: joined }),
  setConnected: (connected) => set({ isConnected: connected }),
  clearRoom: () =>
    set({
      roomCode: null,
      roomId: null,
      playerSlot: null,
      opponentJoined: false,
    }),
}));

export default useMultiplayerStore;
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup (1-2 hours)

**Goal**: Supabase project ready with database and realtime

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run SQL schema (create `games` table)
- [ ] Enable Realtime for `games` table (Database → Replication)
- [ ] Get project URL and anon key
- [ ] Install client: `npm install @supabase/supabase-js`
- [ ] Create `src/multiplayer/supabaseClient.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

- [ ] Create `.env` file (add to `.gitignore`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] Test connection with simple query

---

### Phase 2: Room Management (2-3 hours)

**Goal**: Create and join game rooms via shareable links

- [ ] Create `src/multiplayer/identity.js` (session ID)
- [ ] Create `src/multiplayer/roomManager.js`:

```javascript
import { supabase } from "./supabaseClient";
import { getPlayerId } from "./identity";
import { createEmptyBoard } from "../store/gameStore";

// Generate readable room code
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Create a new game room
export async function createRoom() {
  const playerId = getPlayerId();
  const roomCode = generateRoomCode();

  const { data, error } = await supabase
    .from("games")
    .insert({
      room_code: roomCode,
      board: createEmptyBoard(),
      player_0_id: playerId,
      status: "waiting",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Join an existing room
export async function joinRoom(roomCode) {
  const playerId = getPlayerId();

  // Find the room
  const { data: room, error: findError } = await supabase
    .from("games")
    .select()
    .eq("room_code", roomCode.toUpperCase())
    .single();

  if (findError || !room) {
    throw new Error("Room not found");
  }

  if (room.player_1_id) {
    throw new Error("Room is full");
  }

  if (room.player_0_id === playerId) {
    // Rejoining own room
    return room;
  }

  // Claim player 2 slot
  const { data, error } = await supabase
    .from("games")
    .update({
      player_1_id: playerId,
      status: "playing",
    })
    .eq("id", room.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get shareable link
export function getShareableLink(roomCode) {
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomCode);
  return url.toString();
}
```

- [ ] Create `useMultiplayerStore.js` (state store)
- [ ] Handle URL parameter on app load:

```javascript
// In App.jsx or a hook
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const roomCode = params.get("room");
  if (roomCode) {
    joinRoom(roomCode).then(/* set up game */);
  }
}, []);
```

---

### Phase 3: Real-time Sync (3-4 hours)

**Goal**: Moves sync between players instantly

- [ ] Create `src/hooks/useOnlineGame.js`:

```javascript
import { useEffect, useCallback } from "react";
import { supabase } from "../multiplayer/supabaseClient";
import { getPlayerId } from "../multiplayer/identity";
import useGameStore from "../store/gameStore";
import useMultiplayerStore from "../store/multiplayerStore";

export default function useOnlineGame() {
  const { roomId, playerSlot, setOpponentJoined } = useMultiplayerStore();
  const { syncFromServer } = useGameStore();
  const playerId = getPlayerId();

  // Subscribe to game changes
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`game:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const game = payload.new;

          // Check if opponent joined
          if (
            game.player_1_id &&
            !useMultiplayerStore.getState().opponentJoined
          ) {
            setOpponentJoined(true);
          }

          // Sync game state
          syncFromServer({
            board: game.board,
            currentPlayer: game.current_player,
            winner: game.winner,
            winningLine: game.winning_line,
            isDraw: game.winner === -1,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Send move to server
  const makeMove = useCallback(
    async (x, z, newBoard, newCurrentPlayer, winner, winningLine, isDraw) => {
      if (!roomId) return;

      await supabase
        .from("games")
        .update({
          board: newBoard,
          current_player: newCurrentPlayer,
          winner: isDraw ? -1 : winner,
          winning_line: winningLine,
          status: winner !== null || isDraw ? "finished" : "playing",
        })
        .eq("id", roomId);
    },
    [roomId]
  );

  return {
    makeMove,
    isMyTurn: playerSlot === useGameStore.getState().currentPlayer,
  };
}
```

- [ ] Modify `gameStore.js` to support server sync:

  - Add `syncFromServer(state)` action
  - Add `ONLINE` game mode
  - Modify `dropPiece` to call online sync when in online mode

- [ ] Test with two browser tabs

---

### Phase 4: UI Components (2-3 hours)

**Goal**: Clean interface for creating/joining games

#### 4.1 Online Lobby Component

- [ ] Create `src/components/OnlineLobby.jsx`:
  - "Create Game" button
  - "Join Game" input field
  - Error messages for invalid/full rooms

#### 4.2 Waiting Screen

- [ ] Show room code prominently
- [ ] "Copy Link" button (copies shareable URL)
- [ ] "Waiting for opponent..." with loading animation
- [ ] "Cancel" button

#### 4.3 In-Game Online UI

- [ ] Display "You are Player 1/2"
- [ ] Show "Your turn" / "Opponent's turn"
- [ ] "Leave Game" button
- [ ] "Rematch" button (after game ends)

#### 4.4 Update Mode Selector

- [ ] Add "Online" option to existing mode toggle in HUD
- [ ] Show connection status indicator

---

### Phase 5: Polish & Edge Cases (2-3 hours)

**Goal**: Handle real-world scenarios gracefully

#### 5.1 Reconnection

- [ ] Store active room in localStorage
- [ ] On page load, check for active game and rejoin
- [ ] Resync full state on reconnect

#### 5.2 Disconnection Handling

- [ ] Show "Connection lost" message
- [ ] Auto-reconnect attempts
- [ ] Opponent disconnect notification

#### 5.3 Room Cleanup

- [ ] Client-side: Leave room on tab close (`beforeunload`)
- [ ] Server-side: Auto-delete games older than 24 hours (Supabase cron)

#### 5.4 UX Polish

- [ ] Copy link with visual feedback ("Copied!")
- [ ] Loading states for all async operations
- [ ] Error toasts for failed operations
- [ ] Smooth opponent move animations

---

## Game Modes (Updated)

```javascript
export const GAME_MODES = {
  TWO_PLAYER: "two-player", // Existing: local 2P
  SINGLE_PLAYER: "single-player", // Existing: vs bot
  ONLINE: "online", // NEW: multiplayer
};
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add `.env` to `.gitignore`:

```
.env
.env.local
```

---

## Testing Checklist

### Happy Path

- [ ] Create room → get code
- [ ] Share link → friend joins
- [ ] Moves sync both directions
- [ ] Win detected for both players
- [ ] Draw detected for both players
- [ ] Rematch works

### Edge Cases

- [ ] Invalid room code → error message
- [ ] Full room → error message
- [ ] Refresh during game → rejoin works
- [ ] Opponent leaves → notification shown
- [ ] Slow connection → moves still sync

### Cross-Browser

- [ ] Chrome, Firefox, Safari
- [ ] Mobile browsers

---

## Estimated Timeline

| Phase                    | Effort  | Cumulative |
| ------------------------ | ------- | ---------- |
| Phase 1: Infrastructure  | 1-2 hrs | 1-2 hrs    |
| Phase 2: Room Management | 2-3 hrs | 3-5 hrs    |
| Phase 3: Real-time Sync  | 3-4 hrs | 6-9 hrs    |
| Phase 4: UI Components   | 2-3 hrs | 8-12 hrs   |
| Phase 5: Polish          | 2-3 hrs | 10-15 hrs  |

**Total: ~10-15 hours** of focused development

---

## Quick Start

```bash
# 1. Install Supabase client
npm install @supabase/supabase-js

# 2. Create .env file
echo "VITE_SUPABASE_URL=your-url" >> .env
echo "VITE_SUPABASE_ANON_KEY=your-key" >> .env

# 3. Run SQL in Supabase dashboard (see schema above)

# 4. Start development
npm run dev
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

---

## Future Enhancements (Out of Scope for V1)

- **Random matchmaking**: Queue to play with strangers
- **Account system**: Persistent stats, history
- **Spectator mode**: Watch ongoing games
- **Chat**: In-game messaging
- **Ranked play**: ELO/leaderboards

---

## Notes

- Supabase free tier is plenty for casual usage
- No auth = simpler code, faster to ship
- Room codes auto-expire after 24h to prevent DB bloat
- Session IDs in localStorage allow reconnection without accounts
