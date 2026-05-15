# ASSUMPTIONS.md

## Stable ID strategy
Promotion IDs are SHA1 hashes of their canonical URL. Assumption: canonical URLs are
stable between scrapes. If a promotion's URL changes, it will appear as a new record.
This is preferable to silent overwrites of changed data.

## Null vs undefined
All optional fields use `string | null`, never `undefined` or the `?` optional modifier.
Reason: `undefined` disappears in JSON.stringify, causing subtle bugs in API responses.
`null` is explicit — it means "we looked, this wasn't there."

## Missing brand fields
Some brands may not have a websiteUrl, hours, or social links listed on their directory
page. These are set to `null` (for single values) or all-null object (for SocialLinks).
This is consistent throughout — never a missing key.

## Sync POST /scrape
POST /scrape runs synchronously and returns when the scrape is complete. An async job
queue would be more scalable but is over-engineered for a single-portal MVP. The client
should set a 120s+ timeout.

## Operating hours format
Hours are stored as a JSON object mapping day names to time strings, e.g.
{"Monday": "10:00 AM – 9:00 PM"}. If hours are not available in a structured format,
we store the raw string under an "All" key.

## SQLite instead of Postgres
Chose SQLite to eliminate Docker as a dependency. The Drizzle ORM schema and query API
are identical for Postgres. Swapping requires changing DATABASE_URL and one adapter
import in apps/api/src/db/index.ts.

## Site structure
Scraped on 2026-05-15. If the site changes structure between scraping
and review, the snapshots in data/snapshots/ show what was actually returned.
