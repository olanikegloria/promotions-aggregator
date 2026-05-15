# DESIGN.md

## Scraping approach
Used Playwright instead of plain fetch/axios because the brief explicitly warns the site
is "mildly picky about HTTP clients." Playwright runs a real browser, handles redirects,
JavaScript rendering, and lets us set realistic headers. Cheerio would be faster but less
reliable against real-world portals.

Politeness strategy: 1 second delay between page requests (configurable via
SCRAPER_DELAY_MS env var), realistic Chrome User-Agent, respects the site's structure
without hammering it.

Snapshot: raw HTML from the listing page is saved to data/snapshots/ on first run as
insurance against the site changing mid-build.

## Schema decisions
Two normalized tables: `brands` and `promotions`. Brands are a separate entity because:
- Multiple promotions share the same brand
- Brand metadata (hours, socials, website) is scraped from a different page
- Querying "all brands with promotion counts" is a simple JOIN, not duplicated data

Stable ID: SHA1 hash of canonicalUrl. Canonical URLs are stable across re-scrapes.
This gives deterministic deduplication — re-scraping the same promotion upserts, not inserts.

Missing data strategy: all optional fields typed as `string | null`, never `undefined`.
Reason: null is explicit (we looked, it wasn't there), JSON-serializable, and consistent
across the codebase. undefined disappears in JSON.stringify which causes subtle bugs.

## Persistence
SQLite via Drizzle ORM. Chosen over Postgres to remove the Docker dependency and keep
setup to one command. The Drizzle schema and query API are identical for Postgres —
swapping requires only changing the connection string and one adapter import.

## Search implementation
The `search` query parameter on `GET /promotions` runs a SQL OR across three columns:
`promotions.name`, `promotions.description`, and `brands.name`. This means searching
"bath" returns all Bath & Body Works promotions even if the promotion title doesn't
contain "bath". Implemented with Drizzle's `or()` + `like()` helpers.

## POST /scrape — sync vs async
Synchronous. The scraper runs and the endpoint returns when done, with a summary
{ scraped, failed, durationMs }. An async queue would be over-engineered for a
single-portal MVP. The 60s+ scrape timeout is on the client, per NFR3.

## What I cut for time
- Docker / docker-compose (documented above — trivial to add)
- Formal test suite (would add Vitest unit tests for scraper parsing logic first)
- Detail click-through page (bonus, not required)
- Brand enrichment (store directory pages not scraped — websiteUrl, hours, and
  socialLinks are all null for every brand). The scraper skeleton has the loop and
  try/catch structure in place; the missing piece is navigating to each brand's
  directory page and extracting the fields. Would be the next thing to implement.
