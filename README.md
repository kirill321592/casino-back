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
| `GET /slots/paytable` | — | `{ reelCount, symbols: [{ symbol, payout3, payout2 }] }` |
| `POST /slots/spin` | `{ bet }` | `{ reels, bet, multiplier, winnings }` |

Three of a kind pays `payout3`, a pair pays `payout2`, and the best matching line wins. Unlike
roulette, `winnings` does **not** include the stake.

## Errors

Both transports report failures as `{ message }`. Roulette emits it as a `game:error` event; slots
returns it as the body of a 4xx response, e.g. `400 { "message": "bet must not be less than 1" }`.

## Money

Both games are stateless with respect to money: the server reports what was won, the client owns the balance.
