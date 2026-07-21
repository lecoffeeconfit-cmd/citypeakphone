# City Information production-readiness audit

Audit date: 2026-07-20

## Overall verdict

**Not production ready.** The reusable client experience is safe to continue
developing, but it is not backed by a trusted city-data service. There are no
backend functions, scheduled jobs, database migrations, Firestore rules, or
Supabase policies in this repository for City Information data. It must not be
described as a production nationwide data system until those controls are
deployed and verified.

## What exists

- One reusable `CityOverviewScreen`; no city-specific screen components.
- A central city catalog with stable IDs, coordinates, state FIPS, and Census
  place FIPS where available.
- Client-side NWS weather/alerts and Census ACS requests with a timeout,
  in-memory deduplication, availability states, and source attribution.
- Data contracts for crime, service requests, officials, and news; Long Beach
  has configuration-driven official source links and manually verified official
  records.
- Existing CityPeak auth, Firestore feed, Supabase media handling, moderation,
  messaging, and Sentry setup remain separate from City Information.

## Confirmed gaps before repair

| Area | Status | Finding |
| --- | --- | --- |
| Architecture | Ready with minor issues | Shared UI and registry exist; the client is still the provider boundary. |
| Geographic correctness | Ready with minor issues | Catalog IDs prevent name-only lookups for known cities; arbitrary typed cities remain unmapped and must show limited data. |
| Provider reliability | Not ready | No server cache, conditional requests, retry policy, provider rate limits, or monitoring. |
| Crime / 311 / news | Not implemented | Only schemas, mapping helpers, and official source links exist; no trusted normalized dataset is displayed. |
| Officials | Ready with minor issues | Manual snapshot and pure review helper exist; no persisted admin review queue or server authorization. |
| Security / data access | Unable to verify | No Firestore rules, Supabase policies, or backend code are included in this repository. |
| Privacy / App Store | Unable to verify | The app already requests location and uses diagnostics, push tokens, user profiles, posts, and media; store disclosures and legal copy are not present for verification. |
| Accessibility | Ready with minor issues | City tabs and source links have accessible roles/names; device and large-text testing is still required. |
| Tests | Not ready | No test runner or automated suite existed. |
| Deployment | Not ready | No deployment artifacts for provider keys, database, jobs, or source monitoring. |

## Repairs in this pass

- Harden public-response parsing, host validation, value/date bounds, alert
  deduplication, expiry filtering, and stale-response protection.
- Add a bounded on-device city-overview cache that marks fallback data stale
  rather than current, and never saves an all-provider failure as a cache hit.
- Add Expo-compatible Jest tooling and mocked tests for provider isolation,
  stale cache disclosure, geographic lookup, calculations, 311 normalization,
  and official-review authorization.
- Update this document and `CITY_DATA.md` with exact non-deployment boundaries.

## Required deployment work

1. Create an authenticated backend endpoint that returns a normalized,
   validated city overview and stores provider secrets server-side.
2. Add least-privilege database rules/policies, indexes, idempotent writes, and
   a persisted official-review queue.
3. Schedule provider refreshes with conditional requests, bounded concurrency,
   backoff, monitoring, and stale-source alert deduplication.
4. Verify current App Store and Google Play disclosures for location,
   diagnostics, push tokens, user-generated content, and city selections.

## Verification performed in this audit

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed |
| `npm run test:ci` | Passed: 6 suites, 17 mocked unit tests |
| `npx expo-doctor` | Passed: 18/18 checks |
| `npx expo export --platform web` | Passed |
| `git diff --check` | Passed |
| `npm audit --omit=dev --audit-level=high` | Passed with no high-severity findings |

`npm audit fix --omit=dev` cleared the previous high-severity transitive
findings. Thirteen moderate findings remain in Expo SDK 54 tooling
dependencies; npm's only listed remediation is a breaking Expo SDK 57 upgrade.
That upgrade was intentionally not applied in this audit pass.

## Security and privacy notes

- `.env.local` is ignored. It contains a Sentry authentication-token variable
  for build tooling and is not tracked; rotate it if it has ever been copied
  outside approved secret storage.
- Firebase's client configuration and Supabase's anonymous client key are
  present in tracked application code. Those are client configuration values,
  not a substitute for access control. This repository contains no Firestore
  rules or Supabase policies, so their protections cannot be verified here.
- City Information caches public city data locally. It does not add precise
  device-location collection, but the existing app already requests location
  and stores a selected city in user data. Legal and store disclosures need a
  human review against the shipping product.
