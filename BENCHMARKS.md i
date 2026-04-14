# LinkForge — Benchmarks

Tested locally using [autocannon](https://github.com/mcollina/autocannon) with 10 concurrent connections over 10 seconds.

## Redirect endpoint — `GET /:code` (Redis cache hit)

`autocannon -c 10 -d 10 http://localhost:3000/bench`

| Metric | Value |
|---|---|
| Requests/sec (avg) | 1,882 |
| Requests/sec (peak) | 2,175 |
| Avg latency | 4.82 ms |
| Total requests | 19k in 10s |

## Shorten endpoint — `POST /shorten`

`autocannon -c 10 -d 10 -m POST -H "Content-Type: application/json" -b '{"url":"https://github.com"}' http://localhost:3000/shorten`

| Metric | Value |
|---|---|
| Requests/sec (avg) | 1,769 |
| Requests/sec (peak) | 2,051 |
| Avg latency | 5.15 ms |
| Total requests | 18k in 10s |

## Key observations

- Redirect endpoint serves ~1,900 req/sec at under 5ms average latency, achieved by serving all repeat lookups directly from Redis without touching PostgreSQL.
- Shorten endpoint handles ~1,770 req/sec despite writing to both PostgreSQL and Redis on every request.
- Rate limiter kicks in at 10 requests/min per IP, protecting the database under sustained load.

## Environment

- Node.js 20 (Alpine)
- PostgreSQL 15
- Redis 7
- All services running via Docker on local machine