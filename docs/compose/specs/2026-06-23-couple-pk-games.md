# Couple PK Games Design

## [S1] Problem
The current FilmDate app lacks interactive gameplay. Users want fun, competitive mini-games they can play together in real-time.

## [S2] Solution Overview
Add a "Couple PK Arena" with 3 mini-games:
1. **Reaction Speed PK** - Who can click faster
2. **Memory PK** - Card matching game
3. **Knowledge PK** - How well do you know each other

## [S3] Game 1: Reaction Speed PK
- Both players enter the game room
- Screen shows "Waiting..." then suddenly changes color
- First to click wins the round
- 5 rounds, best of 5
- Anti-cheat: clicking before color change = lose that round
- Show reaction time in milliseconds

## [S4] Game 2: Memory PK
- 4x4 grid of face-down cards (8 pairs)
- Players take turns flipping 2 cards
- If cards match, player keeps the pair and goes again
- If no match, next player's turn
- Player with more pairs wins

## [S5] Game 3: Knowledge PK
- System asks questions like "What is your partner's favorite food?"
- Each player writes their answer privately
- After both submit, answers are revealed
- Matching answers = 1 point each
- Player with more correct answers wins

## [S6] Technical Architecture
- Real-time sync via Supabase Realtime channels
- Game state stored in `games` table
- Each game has a `room_code` for joining
- Navigation: new "PK" tab in bottom nav

## [S7] Data Model
```
games:
  id, room_code, type (reaction/memory/knowledge),
  player1_id, player2_id, status, winner_id,
  game_state (JSONB), created_at, updated_at
```

## [S8] UI Design
- New page: `/games` - game lobby with 3 game cards
- Each game page: `/games/reaction`, `/games/memory`, `/games/knowledge`
- Retro film theme consistent with rest of app
- Animated transitions and victory effects
