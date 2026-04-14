# LinkForge 🔗

A production-grade URL shortener built with Node.js, PostgreSQL, and Redis.
Handles ~1,900 redirects/sec with sub-5ms latency via Redis caching.

## Features

- Shorten any URL with an auto-generated Base62 code
- Custom aliases (e.g. `/myrepo` instead of `/TJSgiF`)
- Link expiry — set a TTL in seconds when creating a link
- Redis cache — repeat redirects never hit the database
- Rate limiting — 10 requests/min per IP on the shorten endpoint
- Async analytics — click count, country, and device tracked via BullMQ queue
- Fully containerised — runs with a single `docker-compose up` command

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express |
| Database | PostgreSQL 15 |
| Cache + Queue | Redis 7 + BullMQ |
| Containerisation | Docker + Docker Compose |

## Getting Started

### Prerequisites

- Docker Desktop

### Run locally

```bash
git clone https://github.com/KTKarthick006/LinkForge.git
cd LinkForge
cp .env.example .env
docker-compose up --build
```

Server runs at `http://localhost:3000`

## API Reference

### Shorten a URL

```
POST /shorten
```

Request body:
```json
{
  "url": "https://github.com/KTKarthick006/LinkForge",
  "alias": "myrepo",
  "expiresIn": 86400
}
```

`alias` and `expiresIn` (seconds) are optional.

Response:
```json
{
  "shortUrl": "http://localhost:3000/myrepo",
  "code": "myrepo",
  "expiresAt": null
}
```

### Redirect

```
GET /:code
```

Redirects to the original URL. Served from Redis cache on repeat visits.

### Analytics

```
GET /stats/:code
```

Response:
```json
{
  "code": "myrepo",
  "totalClicks": 42,
  "byCountry": [{ "country": "IN", "count": "38" }],
  "byDevice": [{ "device": "desktop", "count": "42" }]
}
```

## Architecture

```
Client
  │
  ▼
Express API (Node.js)
  ├── POST /shorten ──► PostgreSQL (write) + Redis (cache)
  ├── GET /:code ──► Redis (cache hit) or PostgreSQL (miss)
  │                   └── BullMQ (async click event)
  │                         └── Analytics Worker ──► PostgreSQL
  └── GET /stats/:code ──► PostgreSQL
```

## Benchmarks

See [BENCHMARKS.md](./BENCHMARKS.md) for full results.

| Endpoint | Req/sec | Avg latency |
|---|---|---|
| `GET /:code` (cache hit) | 1,882 | 4.82 ms |
| `POST /shorten` | 1,769 | 5.15 ms |

## Project Structure

```
src/
├── routes/        # Express route handlers
├── services/      # Business logic (shortener, cache)
├── workers/       # BullMQ analytics worker
├── models/        # PostgreSQL connection and queries
└── middleware/    # Rate limiter
```

## License

MIT