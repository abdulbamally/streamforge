# Repository Restructure Progress

## Status: Completed (Phase 1 - Safe Layout Normalization)

Restructured the workspace into a standard top-level layout without deleting any project content.

## New Top-Level Structure

- `apps/streamapp`
- `apps/streamforge-mobile`
- `backend/streamforge`
- `packages/api-contract`
- `infra/streamforge-infra`

## What Was Updated

- Moved existing project folders into the new standardized directories.
- Updated infra compose references to the backend location:
  - `infra/streamforge-infra/docker/docker-compose.base.yml`
  - `infra/streamforge-infra/docker/docker-compose.dev.yml`
- Updated deploy workflow path assumption for EC2:
  - `infra/streamforge-infra/.github/workflows/deploy.yml`
  - Now tries `~/streamforge/infra/streamforge-infra` first, then falls back to `~/streamforge-infra`.

## Validation Completed

- `docker compose config` passed for:
  - dev (`base + dev`)
  - staging (`base + staging`)
  - prod (`base + prod`)
- Existing git repo in `apps/streamapp` remains intact and readable.

## Next Phase (Recommended)

- Establish a single monorepo root git history (or planned migration strategy).
- Normalize backend service layout naming (`services/*` vs current `packages/*`) only after CI is green.
- Move environment secrets out of committed `.env.prod` values to managed secrets.
