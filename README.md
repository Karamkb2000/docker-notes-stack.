# notes-stack — Docker Compose microservices demo

A multi-service app orchestrated with Docker Compose:

```
        ┌─────────── frontend network ───────────┐   ┌──────── backend network ────────┐
browser →  web (nginx, :8080)  →  api (Express, :3000)  →  db (Postgres)   cache (Redis)
                                        └───────────────→──────┘   ↑            ↑
                                                              worker ───────────┘
```

- **web** — nginx serving a static UI, reverse-proxying `/api` to the API. Multi-stage build (node build → nginx).
- **api** — Express API (notes CRUD) using Postgres + Redis. Multi-stage build, non-root, healthcheck.
- **worker** — background process incrementing a Redis counter. Multi-stage build, non-root.
- **db** — Postgres with a named volume + init script.
- **cache** — Redis with a named volume.

Two networks isolate tiers: only `api` sits on both; the database/cache are unreachable from the `frontend` network.

## Run
```bash
cp .env.example .env      # set POSTGRES_PASSWORD
docker compose up --build
```
Open http://localhost:8080

## Useful commands
```bash
docker compose ps                 # service status + health
docker compose logs -f api        # follow a service's logs
docker compose exec db psql -U app -d notes -c "SELECT * FROM notes;"
docker compose down               # stop + remove containers/networks
docker compose down -v            # also remove the named volumes (data)
```
