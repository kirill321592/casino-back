# Casino backend

A small NestJS server hosting two games: roulette and slots. Each game owns a module under
`src/games/` and picks the transport its rules need — roulette a Socket.IO namespace, since its
rounds are shared and server-timed; slots plain HTTP, since a spin is one request with one answer.

## Run

```bash
npm install
npm run start:dev
```

Copy `.env.example` to `.env` to configure the port, allowed browser origin, bet limit, or round timings.

## Layout

```
src/
  common/            shared across games (env config, RNG, gateway options)
  games/
    games.module.ts  registers every game module
    roulette/        round-based game: /roulette socket namespace
    slots/           request/response game: /slots HTTP routes
```

Adding a third game means adding a folder under `src/games/` and listing its module in `games.module.ts`.

## Roulette protocol

Connect to the `/roulette` namespace. A 15-second betting round spins a number from 0 to 36, publishes
payouts, then opens the next round after 3 seconds. On connection the server emits `round:state`.

| Client event | Payload | Server events |
| --- | --- | --- |
| `bet:place` | `{ roundId, type, amount, number? }` | `bet:accepted` or `bet:rejected` |
| — | — | `round:state`, `round:result` |

Bet types: `straight` (requires `number`, payout ×36), `red`, `black`, `even`, `odd` (payout ×2).
Payouts include the returned stake.

`bet:rejected` covers game rules (closed round, missing number); malformed payloads come back as
`game:error` — see below.

## Slots protocol

Plain HTTP — spins are independent, so there is no shared round and nothing to push.

| Route | Body | Response |
| --- | --- | --- |
| `GET /slots/paytable` | — | `{ reelCount, rtp, symbols: [{ symbol, payout3, payout2 }] }` |
| `POST /slots/spin` | `{ bet }` | `{ reels, bet, multiplier, winnings, balance }` |

Three of a kind pays `payout3`, a pair pays `payout2`, and the best matching line wins. The stake
is debited before the reels turn and `winnings` (`multiplier × bet`) is paid back on top, so a 1×
pair breaks even.

`rtp` is the theoretical return to player as a fraction (currently `0.96`). It is computed exactly
from the symbol weights and payouts in `slots.math.ts`, and `slots.math.spec.ts` fails if a paytable
change moves it outside 95–97%. Roulette's is fixed by the wheel: 36/37 ≈ 97.3% on every bet.

## Errors

Both transports report failures as `{ message }`. Roulette emits it as a `game:error` event; slots
returns it as the body of a 4xx response, e.g. `400 { "message": "bet must not be less than 1" }`.

## Money

The server owns every balance. Each stake goes through `UsersService.debit` and each payout through
`credit`; the client only ever displays the balance the server reports.

## Accounts and responsible gaming

`POST /auth/signup` takes `{ username, password, confirmsAdult: true, acceptsTerms: true }`; both
flags are required and recorded on the account together with the `TERMS_VERSION` accepted.

| Route | Body | Response |
| --- | --- | --- |
| `GET /account/limits` | — | `{ dailyLossLimit, pendingDailyLossLimit, realityCheckMinutes, lossToday, coolingOffHours }` |
| `PUT /account/limits` | `{ dailyLossLimit, realityCheckMinutes }`, `null` turns one off | same as `GET` |
| `POST /account/self-exclusion` | `{ days }`, one of 1, 7, 30, 180 | `204`, and the session cookie is cleared |

- **Daily loss limit**: stakes minus winnings per UTC day. Enforced in `UsersService.debit`, so it
  covers every game. Tightening applies at once; loosening or removing waits 24 hours
  (`pendingDailyLossLimit` shows what is queued).
- **Reality check**: the interval the client reminds the player at. Stored here so it follows the
  account across devices; defaults to 60 minutes.
- **Self-exclusion**: refuses sign-in, ends existing sessions and refuses stakes until it runs out.
  It cannot be shortened.
