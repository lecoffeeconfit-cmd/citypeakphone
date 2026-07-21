# City Information data architecture

The app's City Information screen is intentionally provider-neutral. Its shared
models are in `src/city/types.ts`, provider selection is in
`src/city/registry.ts`, and public-source fetching lives in
`src/city/service.ts`. UI cards only consume the normalized overview model.

## Currently enabled nationwide baseline

- National Weather Service: hourly conditions and active weather alerts for
  catalogued city coordinates.
- U.S. Census ACS 2024 5-year: population, median household income, median
  age, and median home value for catalogued Census places.

The current client fallback uses a 10-second timeout, a 15-minute in-memory
and device-local cache, and in-flight request deduplication. NWS forecast URLs
are restricted to the official HTTPS API host; response size, numeric values,
timestamps, and displayed text are bounded before rendering. A failed refresh
can show a cache entry for up to six hours, but the UI marks it **Cached —
refresh needed**, never current. Failed or unsupported sources render an honest
limited state and do not block the rest of the screen.

This is a resilience layer, not the intended production provider architecture.
It does not replace server-side caching, conditional requests, rate limits, or
scheduled refreshes.

## Enhanced Long Beach configuration

Long Beach is configured in `src/city/registry.ts`, not in the shared UI. The
configuration provides verified city-directory records and clearly labeled
official source links for the City, Police Department, Fire Department, crime
incident map, Go Long Beach service-request dataset, and council meetings.

The in-app officials directory is a manually verified snapshot from the City
of Long Beach officials page. It must not be changed by automated source
checks. `src/city/officials.ts` creates review records for proposed changes and
requires an authenticated administrator ID to approve or reject one. Persist
that review queue and its audit trail in a trusted backend before automating
checks.

The LBPD incident map and Go Long Beach service-request dataset are deliberately
linked, not bulk-loaded into the client. They need a server-side connector that
validates, aggregates, deduplicates, and caches data before CityPeak displays
native metrics. This prevents the app from implying reliable crime comparisons
or live 311 counts before coverage and reporting periods are verified.

## Reusable local normalization

- `src/city/crime.ts` contains configurable CityPeak comparison rules and
  neutral labels. It refuses invalid counts and inadequate coverage.
- `src/city/serviceRequests.ts` normalizes Open311, ArcGIS, Socrata, and
  Opendatasoft-shaped records without treating source fields as trusted. It
  retains the original category and status beside CityPeak's normalized values.
- `src/city/officials.ts` detects sensitive directory changes but never
  publishes them automatically.

## Secure server-side connectors to add before enabling them

No private provider key is present in the Expo app. Add a Firebase Cloud
Function (or the project's chosen authenticated backend) that exposes one
authenticated, rate-limited city-overview endpoint and keeps these server-only
variables in its deployment secret store:

```text
AIRNOW_API_KEY=
FBI_API_KEY=
```

That endpoint should cache normalized data by `cityId` and source metadata
(ETag, Last-Modified, content hash, last checked, source-modified time), honor
provider rate limits, and return the `CityOverviewData` shape. Configure it
before enabling AirNow, FBI, Open311, ArcGIS, Socrata, official-news, or
officials connectors in the registry.

## Operations

- Refresh emergency alerts every few minutes, weather every 15–30 minutes,
  demographics annually, and check crime datasets daily even if published less
  often.
- Cache unchanged responses and use conditional requests server-side.
- Require an admin-only manual-review workflow for officials and source
  configuration. Do not trust scraped text as an official change.
- Store source-status documents separately from user posts. Add indexes only
  once a server-side `cityOverview` collection is introduced; this client-only
  rollout adds no Firestore index or migration.

## Local connector contract

Implement Open311, ArcGIS, Socrata, FBI, local structured APIs, and manual
verified datasets as `CityDataConnector<T>` adapters. Every service request
must carry `official_311`, `community_report`, or `status_unknown`; community
reports must never appear as government records. Crime comparisons must use
only compatible full reporting periods, show coverage and agency, and never
make a city-level safety label.
