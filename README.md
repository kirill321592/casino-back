# Roulette WebSocket backend

A small NestJS + Socket.IO roulette server. It runs a 15-second betting round, spins a number from 0 to 36, publishes payouts, then opens the next round after 3 seconds.

## Run

```bash
npm install
npm run start:dev
```

Copy `.env.example` to `.env` to configure the port, allowed browser origin, or round duration.

## Socket.IO protocol

Connect to the `/roulette` namespace. On connection, the server emits `round:state`.

| Client event | Payload | Server events |
| --- | --- | --- |
| `bet:place` | `{ roundId, type, amount, number? }` | `bet:accepted` or `bet:rejected` |
| — | — | `round:state`, `round:result` |

Available bet types: `straight` (requires `number`, payout ×36), `red`, `black`, `even`, and `odd` (payout ×2). Payouts include the returned stake.
