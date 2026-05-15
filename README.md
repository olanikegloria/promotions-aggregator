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
pnpm --filter api exec playwright install chromium
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

## UI features

- **Search** — keyword search across promotion name, description, and brand name simultaneously. Debounced 300ms. Active search shown as a dismissible chip below the filter bar.
- **Date filters** — start and end date inputs; active filters shown as dismissible chips.
- **Sticky filter bar** — filters stay visible while scrolling through results.
- **Group by brand** — toggle switches between flat card grid and brand-section view (each brand section shows name, promotion count, website, hours, and social links).
- **Pagination** — page-number controls with ±2 window around the current page.
- **"Ends soon" badge** — promotion cards display an orange badge when the end date is within 7 days (requires scraped end date to be a parseable date string).
- **Loading skeletons** — animated placeholder cards shown while data is fetching.

## Verification

After setup and running `curl -X POST http://localhost:4000/scrape`:

```bash
# Health check
curl http://localhost:4000/health
# → {"status":"ok"}

# Search matches name, description, AND brand name
curl "http://localhost:4000/promotions?search=bath"
# → 6 results — all Bath & Body Works promotions matched via brand name

curl "http://localhost:4000/promotions?search=off"
# → promotions whose name or description contains "off"

# Pagination
curl "http://localhost:4000/promotions?page=1&pageSize=3"
# → { data: [...], total: 39, page: 1, pageSize: 3, totalPages: 13 }

# Single record with brand nested
curl "http://localhost:4000/promotions/$(curl -s 'http://localhost:4000/promotions?pageSize=1' | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).data[0].id)")"
# → { id, name, brand: { name, ... }, canonicalUrl, ... }

# Brands with counts
curl http://localhost:4000/brands
# → array of 15 brands each with promotionCount > 0

# Validation
curl "http://localhost:4000/promotions?page=abc"
# → 400 { "error": "Invalid query parameters", "issues": [...] }
```

## Known limitations

- No Docker setup (see DESIGN.md — trivial to add, SQLite makes it less necessary)
- No automated test suite (would add Vitest for scraper parsing logic first)
- POST /scrape is synchronous — expect a long HTTP timeout (60–120s)
- Detail click-through pages not implemented (bonus feature)
- `pnpm install` must compile native deps (`better-sqlite3`, etc.); the repo root `package.json` lists `pnpm.onlyBuiltDependencies` so installs are non-interactive. If you remove that block, run `pnpm approve-builds` when prompted.
- Listing scrape stores human-readable end-date text (e.g. "Ends Today"), not ISO dates — API `startDate`/`endDate` filters use string comparison and work best with `YYYY-MM-DD` values when data supports it.
