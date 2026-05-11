# Monetization Service

The monetization-service handles creator economy functionality for StreamForge Live, including wallets, gifts, and payouts.

## Responsibilities

- Wallet balances
- Virtual gifts
- Transaction ledgers
- Payout processing
- Fraud detection hooks

## Structure

- `src/app.ts` — Fastify application setup
- `src/server.ts` — Service bootstrap
- `src/modules/` — Domain modules for wallet, gifts, payouts
- `src/services/` — Business logic
- `src/repositories/` — Data persistence stubs
