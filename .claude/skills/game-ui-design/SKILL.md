---
name: game-ui-design
description: "Game interface design for RYST PLAY and other multiplayer, board, party and arcade games - player identity and turn indicators, lobbies and join flows, timers and countdowns, scoreboards and leaderboards, dice and move affordances, game-state feedback (your turn, waiting, captured, winner, draw), HUDs and second-screen phone controllers paired with a shared TV board. Use when designing, adding or fixing a game screen or game rule's on-screen feedback (Ludo, Quiz Night, Memory Match, Tic-tac-toe, claw machine or a new game), or when players are confused about whose turn it is, what just happened or how to play."
---

# Game UI design

You make the game state obvious at a glance from across a pool deck and on a phone in one hand. Players should always know: whose turn it is, what they can do now, what just happened, and who is winning.

## RYST PLAY architecture (inspect before changing)

- `display.html` is the shared TV board; `play.html` is each player's phone controller. Both talk to the villa server (`ryst-109a-proxy`) over WebSocket and read `/game` state. The server owns the rules and state; the screens render it. Never move game rules into the client to "fix" UI.
- Rendering today: Canvas 2D for boards and effects, DOM for scores and text, a lazily loaded self-hosted Three.js r128 (`/assets/vendor/three-r128.min.js`) for the 3D claw machine, inline SVG beach art from `assets/beach-art.js`, Web Audio tones generated in code.
- Games: Ludo (largest), Quiz Night (team trivia), Memory Match, Tic-tac-toe, claw machine.
- Brand: Deep Teal `#07333B`, Champagne Gold `#D8B879`, Warm Ivory `#F6F3EC`, Seafoam `#A9CFC5`. Gold marks the active player and winners.

## Core model: the two screens

| TV (shared, 3-5 m away) | Phone (private, in hand) |
|---|---|
| The board, all players, scores, whose turn, big moments | Your identity, your controls, your private info, confirmation |
| Read-only, no touch | One primary action at a time |
| Large, few elements, motion carries meaning | Compact, fast, thumb-reachable |

Never make a player look at the TV to know what to press, or at the phone to know who is winning.

## Workflow

1. **Map the game loop** from the server state: phases (lobby -> playing -> round end -> game over), turn order, timers, possible actions per phase, events (roll, move, capture, correct answer, match, win).
2. **Write a state table:** for each phase and event, what the TV shows, what each phone shows (active player vs others), and what sound or motion plays. Fill the gaps before writing code.
3. **Design player identity** that works without colour: colour + name + a shape or token symbol + seat position. Keep the same identity on TV and phone.
4. **Design the turn signal:** the active player's area glows Gold and is scaled up slightly on TV; their phone shows the primary action large; other phones show "Waiting for Priya" with what is happening.
5. **Design feedback for every event:** immediate (under 100ms on the phone that acted), shared (TV shows the result within one second), and lasting (the board state reflects it).
6. **Implement** with `premium-ui-ux` standards for controls, `motion-graphics` for event animation, `responsive-tv-design` for TV sizing.
7. **Playtest with `visual-qa`:** screenshot each phase on TV and phone sizes; run a full game where possible.

## Patterns

**Lobby and join** - Big join code or QR on TV; joined players appear as they arrive with a short arrival animation; host sees "Start" only when the minimum players are in; show who is still missing.

**Turn indicator** - Persistent, not just an animation: a highlighted seat, a "Your turn" banner on the active phone, and a name line on TV. Announce turn changes with `aria-live`.

**Timers** - Show remaining time as a shrinking ring or bar plus numerals for the last 10 seconds. Colour shifts from Seafoam to Gold, never to alarm red unless something is lost. Timer must come from server time, not a local count that drifts.

**Dice and moves** - Disable the roll control while the roll resolves. After the roll, highlight only legal pieces; tapping an illegal piece explains why. Show the die value large on both screens.

**Scoreboards** - Sorted, with rank changes animated; leader marked with Gold. Tabular numerals; reserve width so numbers don't shift layout.

**Results** - Winner moment: TV takes over with the winner's name and colour, a short celebration, then a calm summary with "Play again" on phones. Draws and losses get a dignified screen too.

**Errors and reconnection** - If a phone disconnects, the TV marks that seat "reconnecting" instead of freezing; the phone shows a clear rejoin path. Never lose the game state on refresh.

**Rules and onboarding** - A three-line "How to play" on the phone before the first turn; contextual hints when a player hesitates more than ~8 seconds.

## Quality standards

- Whose turn it is can be identified within one second from 4 m on the TV.
- Every server event has visible feedback on both screens.
- Player identity is distinguishable in greyscale (shape/symbol + name).
- No control is active when its action is not legal; illegal taps explain themselves.
- Timers stay in sync with the server across phones (within ~250ms).
- Game can be followed with sound off; sound adds, never carries, information.

## Completion checklist

- [ ] Game loop and server state inspected; state table written for TV and phones.
- [ ] Player identity works without colour and matches across screens.
- [ ] Persistent turn indicator on TV and active/waiting states on phones.
- [ ] Feedback designed for every event, including errors and disconnects.
- [ ] Timers driven by server time.
- [ ] Lobby, results, draw and play-again flows covered.
- [ ] Verified with screenshots of each phase via `visual-qa`.
