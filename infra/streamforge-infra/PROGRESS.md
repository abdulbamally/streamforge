# StreamForge Infra Progress

## Completed

- Created `docker/`, `environments/`, `nginx/`, `scripts/`, `monitoring/`, and `github-actions/`.
- Added shared Docker stack in `docker/docker-compose.base.yml`.
- Added environment-specific overrides:
  - `docker/docker-compose.dev.yml`
  - `docker/docker-compose.staging.yml`
  - `docker/docker-compose.prod.yml`
- Added env files:
  - `environments/.env.dev`
  - `environments/.env.staging`
  - `environments/.env.prod`
- Added Nginx production config at `nginx/nginx.prod.conf`.
- Added deployment and provisioning scripts:
  - `scripts/deploy.sh`
  - `scripts/setup-ec2.sh`
- Added GitHub Actions deployment workflow:
  - `github-actions/deploy.yml`
  - `.github/workflows/deploy.yml`
- Hardened compose startup behavior:
  - Added healthchecks for `postgres` and `redis`.
  - Updated `auth-service` and `media-service` to wait for healthy dependencies.
- Hardened deploy behavior:
  - `scripts/deploy.sh` now pins production compose files and exports `ENVIRONMENT=prod`.
  - Workflow deploy step now runs compose with `ENVIRONMENT=prod`.

## Run Commands

### Development

```bash
ENVIRONMENT=dev docker compose \
-f docker/docker-compose.base.yml \
-f docker/docker-compose.dev.yml up
```

### Staging

```bash
ENVIRONMENT=staging docker compose \
-f docker/docker-compose.base.yml \
-f docker/docker-compose.staging.yml up -d
```

### Production

```bash
ENVIRONMENT=prod docker compose \
-f docker/docker-compose.base.yml \
-f docker/docker-compose.prod.yml up -d
```

## Notes

- `scripts/deploy.sh` is intended for server-side execution after pulling updates.
- GitHub Action uses SSH to run production compose on EC2.
- `monitoring/` is scaffolded and ready for Prometheus/Grafana/logging setup in the next step.
- GitHub only auto-runs workflows from `.github/workflows/`.
