# Promotions Aggregator

Scrapes promotions from The Promenade Shops at Briargate, persists them in SQLite,
exposes a typed REST API, and renders a filterable UI with group-by-brand view.

## Prerequisites

- Node.js v20+
- pnpm (`npm install -g pnpm`)

## Setup

```bash
git clone https://github.com/olanikegloria/promotions-aggregator.git
cd promotions-aggregator
pnpm install
npx playwright install chromium
cp .env.example .env
pnpm --filter @promo/shared build
```

## Run

```bash
pnpm dev
```

Starts:
- API at http://localhost:4000
- Web UI at http://localhost:3000

## Trigger a scrape

```bash
curl -X POST http://localhost:4000/scrape
```

Takes 60–120 seconds. Response: `{"scraped": N, "failed": M, "durationMs": N}`

Refresh http://localhost:3000 to see results.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /promotions | Paginated list. Params: search, startDate, endDate, brand, page, pageSize |
| GET | /promotions/:id | Single promotion with brand |
| GET | /brands | All brands with promotion count and metadata |
| POST | /scrape | Trigger a fresh scrape |
| GET | /health | Health check |

## Environment variables

See `.env.example`.

| Var | Default | Description |
|-----|---------|-------------|
| PORT | 4000 | API port |
| DATABASE_URL | ./data/promotions.db | SQLite file path |
| SCRAPER_DELAY_MS | 1000 | Delay between scraper requests (ms) |

## Known limitations

- No Docker setup (see DESIGN.md — trivial to add, SQLite makes it less necessary)
- No automated test suite (would add Vitest for scraper parsing logic first)
- POST /scrape is synchronous — expect a long HTTP timeout (60–120s)
- Detail click-through pages not implemented (bonus feature)
