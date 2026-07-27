# Casino WebSocket backend

A small NestJS + Socket.IO server hosting two games: roulette and slots. Each game owns a Socket.IO
namespace and a module under `src/games/`.

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
    roulette/        round-based game: /roulette namespace
    slots/           request/response game: /slots namespace
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

Connect to the `/slots` namespace. Spins are independent — there is no shared round. On connection the
server emits `slots:paytable` with the symbols and their multipliers.

| Client event | Payload | Server events |
| --- | --- | --- |
| `slots:spin` | `{ bet }` | `slots:result` |
| — | — | `slots:paytable` (on connect) |

`slots:result` returns `{ reels, bet, multiplier, winnings }`. Three of a kind pays `payout3`, a pair pays
`payout2`, and the best matching line wins. Unlike roulette, `winnings` does **not** include the stake.

## Errors

Any namespace emits `game:error` with `{ message }` when a payload fails validation, e.g.
`{ "message": "bet must not be less than 1" }`.

## Money

Both games are stateless with respect to money: the server reports what was won, the client owns the balance.
