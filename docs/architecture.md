# Plinko Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Plinko codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements.

### Document Scope

Focused on areas relevant to the enhancement of the Plinko game simulation, as detailed in the `prd.md`.

### Change Log

| Date       | Version | Description                 | Author  |
| :--------- | :------ | :-------------------------- | :------ |
| 2025-09-29 | 1.0     | Initial brownfield analysis | Winston |

### Confirmed Enhancement Inputs and Decisions

- Adapter and Deployment: Use `@sveltejs/adapter-static` (already configured in `svelte.config.js`) to generate a static site for deployment to Vercel as required by NFRs. No changes needed.
- Supabase Integration & Security: Initialize Supabase on the client with the anon key for public reads. Restrict teacher-only writes to the `/admin` surface using an admin key stored as a private environment variable in Vercel project settings. The admin page is protected by a simple password (env-based). No serverless functions required for core gameplay.
- Offline Sync & State: Use `localStorage` to queue failed write operations (e.g., points/chips updates) and retry later automatically or via a manual sync, without blocking gameplay.
- Betting Logic Removal: Remove all betting-related UI/logic from `src/lib/components/Sidebar/Sidebar.svelte`, and scrub related state/behaviors from `src/lib/stores/game.ts` and `src/lib/components/Plinko/PlinkoEngine.ts`. Replace multiplier-based scoring with fixed bin point values per PRD.
- Performance: Preserve current physics behavior; only slightly reduce chip fall speed for visibility. Target visually smooth behavior on Android smartboards and teacher Chromebooks; avoid heavy changes to the engine.

## Existing Project Analysis (Brownfield)

- Primary Purpose: Convert the single-user Plinko game into a classroom competition system with teacher-managed chips and persistent total scores per class period.
- Current Tech Stack: SvelteKit v2, `@sveltejs/adapter-static`, Vite 5, Svelte 4, Tailwind CSS 3, Matter.js 0.19, TypeScript 5.
- Architecture Style: Client-only SSG; no backend/serverless required for core gameplay.
- Deployment Method: Static export via adapter-static, deployed to Vercel.
- Available Documentation: PRD sharded at `docs/prd/`; this architecture document.
- Constraints & Notes:
  - Client-only approach must be preserved (per NFRs).
  - Physics performance and visual smoothness must remain high; minimal impact to engine.
  - Support Android smartboards (display) and teacher Chromebooks (admin).
  - Supabase (free tier) is the persistence layer with RLS; anon reads, authenticated teacher writes on `/admin`.

## Enhancement Scope and Integration Strategy

### Enhancement Overview

**Enhancement Type:** Brownfield feature set — classroom competition system (period selection, persistent scoring, leaderboard, teacher admin).

**Scope:**
- Add pre-game Period Selector UI and show selected period name + remaining chips in HUD.
- Replace multiplier-based scoring with fixed bin point values and slightly slower chip fall speed.
- Remove betting UI/logic (Bet Amount, Risk, Auto) across Sidebar, store(s), and engine hooks.
 - Introduce/expand store(s) for periods (id, nickname, points, chips) and currently selected period; gate chip drop when chips == 0.
- Persist updates to Supabase; auto-sync (especially after last chip) and provide Manual Sync button; queue failed writes via `localStorage`.
- Repurpose Live Stats as a leaderboard (nickname + total points, desc order) with a toggle.
- Add a password-protected `/admin` page for teacher operations (edit nickname, +/− chips, reset daily chips to 5, manual sync).

**Integration Impact:** Medium — touches UI (selector, HUD, leaderboard, admin), stores, and Plinko scoring mapping; minimal physics changes.

### Integration Approach

**Code Integration Strategy:**
- Centralize gameplay outcomes via a single event path: when a chip lands, the engine emits `landedBinIndex`; map to fixed points and update the selected period in the store, decrementing chips on drop.
- Define `BIN_POINTS` mapping in `src/lib/constants/game.ts`; ensure `PlinkoEngine.ts` exposes/uses bin index without multiplier coupling.
- Replace betting triggers with a single Drop action; disable Drop when `selectedPeriod.chips === 0`.
- Expand `src/lib/stores/game.ts` (or create a dedicated periods store) to hold `periods[]`, `selectedPeriodId`, and derived helpers. Batch UI updates to avoid unnecessary re-renders.

**Database Integration (Supabase):**
- Table `periods(id int pk, nickname text, points int, chips int)` with RLS: public `select` via anon key; teacher writes via admin key on `/admin`.
- Use `@supabase/supabase-js` client for CRUD. Push updates on chip land and after last chip is used. Maintain a `localStorage` queue (e.g., `pendingPeriodMutations`) for retries and offer a Manual Sync to flush.

**API Integration:**
- No custom backend; direct Supabase client use only. No serverless required for gameplay.

 **UI Integration:**
 - Period Selector shown before main board; main HUD displays selected nickname and chips. Leaderboard toggle repurposes Live Stats window. `/admin` route is password-gated (env-based) and reveals controls for nickname edits, chip +/−, reset-daily-chips, and Manual Sync.
 - Drop is NOT blocked when no period is selected. Instead, a local history log records every drop event (timestamp, selected period id if any, bin index, points applied or skipped) for later review.

### Compatibility Requirements

- Existing API: None to maintain; no new app-managed endpoints.
- Database Schema: Additive; `periods` is new and isolated. Migrations not required client-side.
- UI/UX Consistency: Follow existing Tailwind styling and components; preserve look-and-feel.
- Performance: Maintain smooth visuals; keep physics loop untouched except for chip fall speed constant. Avoid heavy computations in reactive paths; debounce network writes if needed.

## Tech Stack Alignment

| Category            | Current Technology                    | Version   | Usage in Enhancement                                   | Notes |
| :------------------ | :------------------------------------ | :-------- | :----------------------------------------------------- | :---- |
| Framework           | SvelteKit                             | ^2        | App framework, routing, SSG via adapter-static         | Keep |
| Adapter (SSG)       | @sveltejs/adapter-static              | ^3        | Static export for Vercel hosting                       | Keep |
| Language            | TypeScript                            | ^5        | Strong typing across stores/components/engine          | Keep |
| Build Tool          | Vite                                  | ^5        | Dev/build tooling                                      | Keep |
| UI Runtime          | Svelte                                | ^4        | Components, reactive stores                            | Keep |
| Styling             | Tailwind CSS                          | ^3        | Consistent UI styling                                  | Keep |
| Physics Engine      | matter-js                             | ^0.19     | Plinko physics; only adjust fall speed param           | Keep |
| Charts (existing)   | chart.js                              | ^4        | Reuse in leaderboard if needed                         | Optional |
| Draggable UI        | @neodrag/svelte                       | ^2        | Existing UI windows (e.g., Live Stats/Leaderboard)     | Keep |
| Persisted Store     | svelte-persisted-store                | ^0.9      | Optional for lightweight persisted UI settings         | Optional |
| Supabase Client     | @supabase/supabase-js                 | latest    | Client reads (anon), admin writes on /admin            | Add |

Additions Rationale: Only `@supabase/supabase-js` is introduced. Everything else leverages the existing stack to minimize complexity and preserve performance.

## Data Models and Schema Changes

### New Data Model: Period

**Purpose:** Represent a classroom period participating in the competition with persistent nickname, chip inventory, and total points.

**Integration:** Client reads via anon key; writes gated to `/admin` with admin key and password prompt.

**Key Attributes:**
- `id: number` — Primary Key; period number (e.g., 1, 2, 3)
- `nickname: string` — Teacher-defined nickname (e.g., "Period 1 - Algebra")
- `points: number` — Total accumulated points (default 0)
- `chips: number` — Remaining chips for the day (default 5)

### Schema Integration Strategy

**Database Changes Required:**
- New table: `periods (id int primary key, nickname text, points int default 0, chips int default 5)`
- New index (optional): `create index periods_points_desc on periods(points desc)` for leaderboard ordering (small dataset; optional)

**Row Level Security (outline):**
- `select`: allow for anon role (public leaderboard/UI reads)
- `insert/update/delete`: restrict to teacher/admin role used by `/admin`

**Backward Compatibility:**
- Additive only; no impact on existing client code paths; gameplay remains client-side

## Component Architecture

### New/Updated Components

1) `PeriodSelector.svelte`
- Responsibility: Pre-game selection of active period; fetches periods list; sets selected period id in store
- Integration Points: `periods` store; navigation to main board after selection

2) HUD additions (within existing game view)
- Responsibility: Display selected period nickname and remaining chips; disable Drop when chips == 0
- Integration Points: `periods` store (derived selected), Drop action

3) Leaderboard (repurpose Live Stats)
- Responsibility: Show nickname + points for all periods sorted desc; toggle open/close
- Integration Points: `src/lib/components/LiveStatsWindow/*`; `periods` store

4) `/admin` page
- Responsibility: Password gate; list/edit nickname; chip +/−; Reset Daily Chips (set all to 5); Manual Sync to flush queue
- Integration Points: Supabase client (admin key), `periods` store, localStorage queue

5) Stores
- `periods` store (new) or expansion of `game.ts`: hold `periods[]`, `selectedPeriodId`, helpers; expose `dropChip()` and `applyBinScore(binIndex)` actions
- Integration Points: Plinko engine events; UI components; Supabase client sync layer

6) Plinko Engine integration
- Responsibility: Emit `landedBinIndex` on settle; no multiplier knowledge; scoring is external via mapping
- Integration Points: `BIN_POINTS` mapping; store actions

### Component Interaction Diagram

```mermaid
graph TD
  A[PeriodSelector] -->|select period| S[Periods Store]
  S -->|selected period| HUD[HUD (name/chips)]
  BTN[Drop Button] -->|on click| ENG[PlinkoEngine]
  ENG -->|landedBinIndex| MAP[Scoring Map (BIN_POINTS)]
  MAP -->|points| S
  S -->|updates| LB[Leaderboard (LiveStats)]
  ADM[/admin page/] -->|nickname/chips ops| S
  S -->|mutations| Q[localStorage Queue]
  Q -->|retry/flush| SB[Supabase]
  S -->|initial load| SB
```

## Source Tree Integration

### Existing Structure (relevant parts)

```text
src/
  lib/
    components/
      LiveStatsWindow/
      Plinko/
      Sidebar/
      ui/
    constants/
    stores/
    types/
    utils/
  routes/
    +layout.svelte
    +page.svelte
```

### New File Organization (additions only)

```text
src/
  lib/
    components/
      PeriodSelector.svelte                 # Pre-game selection UI
      LiveStatsWindow/                      # Reused for leaderboard
    constants/
      game.ts                               # Add BIN_POINTS mapping
    stores/
      periods.ts                            # New periods/selection store (or expand game.ts)
    utils/
      syncQueue.ts                          # localStorage-backed mutation queue
    supabase/
      client.ts                             # Supabase client init (anon/admin variants)
  routes/
    admin/
      +page.svelte                          # Password-protected admin panel
```

### Integration Guidelines

- File Naming: Use PascalCase for Svelte components, camelCase for utilities/stores.
- Folder Organization: Keep domain-focused organization (`components`, `stores`, `utils`, `supabase`).
- Imports/Exports: Prefer absolute imports via SvelteKit aliases if configured; otherwise relative paths with shallow depth.

## Infrastructure and Deployment Integration

### Existing Infrastructure

**Current Deployment:** Static export via `@sveltejs/adapter-static`; deployed to Vercel.

**Infrastructure Tools:** Vercel (hosting); Supabase (DB + Auth + RLS) free tier.

**Environments:** Local, Production (Vercel). Staging optional.

### Enhancement Deployment Strategy

**Deployment Approach:**
- Continue SSG builds; no server-side runtime required for gameplay.
- Manage environment variables in Vercel Project Settings:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `ADMIN_SUPABASE_SERVICE_ROLE` (not exposed to client; used only on `/admin` when password authenticated)
  - `ADMIN_PASSWORD` (used for `/admin` gating)

**Infrastructure Changes:** None required beyond adding env vars and Supabase project/table setup.

**Pipeline Integration:** Use existing `pnpm build` → Vercel deploy. Optionally add Previews.

### Rollback Strategy

**Rollback Method:** Re-deploy previous Vercel build. For data-level issues, restore Supabase table snapshot or revert manual changes.

**Risk Mitigation:** Feature-guard `/admin` actions behind password; queue writes locally to avoid gameplay disruption.

**Monitoring:** Supabase dashboard for row changes; Vercel analytics optional. Add basic client-side logging for failed syncs.

## Coding Standards and Conventions

### Existing Standards Compliance

- **Code Style:** Prettier + ESLint (Svelte plugin) enforced via repo scripts; follow existing configuration.
- **Linting Rules:** `eslint-plugin-svelte`, `eslint-config-prettier` present; keep rule set consistent.
- **Testing Patterns:** Vitest for unit; Playwright for e2e. Extend rather than replace.
- **Documentation Style:** Update `docs/` alongside code changes; keep architectural notes current.

### Critical Integration Rules

- **API Compatibility:** No custom API; direct Supabase client usage only.
- **Database Integration:** All writes batched through a store-driven sync layer; queue on failure; idempotent updates where possible.
- **Error Handling:** Non-blocking UI on sync failures; surface retry affordance (Manual Sync); log details.
- **Logging Consistency:** Use a lightweight client logger util; avoid noisy console in production builds.

## Testing Strategy

### Integrate with Existing Tests

- **Framework:** Vitest (unit), Playwright (e2e)
 - **Organization:** Place unit tests near sources or under `src/lib/utils/__tests__/`; e2e in `tests/`
 - **Coverage Requirements:** Focus on store logic (chips decrement, score apply), sync queue behavior, and history logging of drops (including when no period is selected); continue to enforce disable drop at chips==0

### New Testing Requirements

**Unit Tests (Vitest):**
- Scoring mapping: bin index → expected points
- Store actions: `dropChip()` decrements chips when >0; blocks at 0; `applyBinScore()` adds correct points
- Queue: enqueue on failed write; flush success clears entries; idempotent application guard

**Integration/E2E (Playwright):**
 - Period selection flow → main board shows nickname/chips; dropping before selection is allowed but must be logged in history with no state mutation
- Drop flow: chips decremented; when ball settles, points updated; leaderboard reflects totals
- Admin flow: password gate; nickname edit; chip +/−; Reset Daily Chips; Manual Sync

**Regression:**
- Physics visual sanity: chip falls and settles; no crashes; FPS visually smooth (manual check)

## Security Integration

### Existing Security Measures

- Authentication/Authorization: None required for gameplay; `/admin` gated by simple password
- Data Protection: Supabase RLS on `periods`; anon role read-only; admin role write
- Secrets: Store `ADMIN_PASSWORD` and admin key only in Vercel env; do not expose in client bundle

### Enhancement Security Requirements

- `/admin` password prompt; keep in-memory only; never log
- Validate nickname/chip inputs client-side; bound chips to reasonable ranges (e.g., 0–9999)
- Use parameterized Supabase calls; avoid string interpolation

### Security Testing

- Verify `/admin` denies access with wrong password; no leakage of envs
- Ensure anon key cannot perform writes; RLS policies enforced
- Manual check: page source/bundle does not contain admin secrets

## Checklist Results (Architect)

- Scope requires architecture: Confirmed (multi-feature, persistence, UI/store/engine touchpoints)
- Client-only target respected: Yes (SSG with Supabase client)
- Data model defined: Yes (`periods`)
- Integration points identified: Engine events → store → Supabase/queue; UI surfaces wired
- Risks mitigated: Non-blocking sync, admin gating, minimal engine changes

Status: PASS — proceed to story breakdown and implementation.

## Next Steps

### Story Manager Handoff

- Reference this document for integration boundaries and store-driven sync pattern
- First stories to implement:
  1) Story 1.1 refactor (fixed rows and bin points; remove betting)
  2) Story 1.4 period selector + HUD gating (disable drop until selection)
  3) Story 1.5 connect gameplay to scoring/chips with store + Supabase sync/queue

### Developer Handoff

- Follow `BIN_POINTS` mapping, store actions (`dropChip`, `applyBinScore`), queue util, and Supabase client usage
- Keep physics changes minimal (only fall speed constant)
- Implement `/admin` password gate and CRUD operations against `periods`
- Add unit tests for store/queue and e2e for flows listed in Testing Strategy

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/routes/+page.svelte` (Main Svelte component for the game)
- **Configuration**: `src/lib/constants/game.ts` (Game constants and settings)
- **Core Business Logic**: `src/lib/components/Plinko/PlinkoEngine.ts` (Core game logic)
- **API Definitions**: N/A (Client-side application)
- **Database Models**: N/A (Client-side application)
- **Key Algorithms**: `src/lib/components/Plinko/PlinkoEngine.ts` (Plinko ball physics)

### Enhancement Impact Areas

- `src/lib/components/Plinko/Plinko.svelte`
- `src/lib/components/Plinko/PlinkoEngine.ts`
- `src/lib/stores/game.ts`
- `src/lib/components/Sidebar/Sidebar.svelte`

## High Level Architecture

### Technical Summary

The Plinko project is a client-side web application built with SvelteKit. The core of the application is a Plinko game simulation that uses Matter.js for the physics engine. The application is well-structured, with a clear separation of concerns between the UI components and the game logic. The application uses TypeScript for type safety and Tailwind CSS for styling.

### Actual Tech Stack

| Category       | Technology   | Version | Notes                                                       |
| :------------- | :----------- | :------ | :---------------------------------------------------------- |
| Runtime        | Node.js      | 20      | As specified in `.github/workflows/format-check.yaml`       |
| Framework      | SvelteKit    | latest  | As specified in `package.json`                              |
| Physics Engine | Matter.js    | latest  | As specified in `src/lib/components/Plinko/PlinkoEngine.ts` |
| Styling        | Tailwind CSS | latest  | As specified in `tailwind.config.js`                        |
| Language       | TypeScript   | latest  | As specified in `tsconfig.json`                             |

### Repository Structure Reality Check

- **Type**: Monorepo
- **Package Manager**: pnpm
- **Notable**: The project uses a standard SvelteKit project structure. The core game logic is located in `src/lib/components/Plinko/`.

## Source Tree and Module Organization

### Project Structure (Actual)

```text
plinko/
├── src/
│   ├── lib/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Plinko/
│   │   │   │   ├── Plinko.svelte
│   │   │   │   └── PlinkoEngine.ts
│   │   │   └── ...
│   │   ├── constants/
│   │   │   └── game.ts
│   │   ├── stores/
│   │   │   └── game.ts
│   │   └── ...
│   ├── routes/
│   │   └── +page.svelte
│   └── ...
├── static/
└── ...
```

### Key Modules and Their Purpose

- **Plinko**: `src/lib/components/Plinko/` - Contains the core Plinko game components and logic.
- **Stores**: `src/lib/stores/` - Contains the Svelte stores for managing game state.
- **Constants**: `src/lib/constants/` - Contains the game constants and settings.
- **Utils**: `src/lib/utils/` - Contains utility functions.

## Data Models and APIs

### Data Models

The application uses TypeScript interfaces to define the data models. The main data models are located in `src/lib/types/game.ts`.

### API Specifications

The application does not have any external API dependencies.

## Technical Debt and Known Issues

### Critical Technical Debt

1.  **Lack of a dedicated state management library**: The application uses Svelte stores for state management, which is sufficient for the current scope but may become difficult to manage as the application grows.
2.  **No unit tests**: The application does not have any unit tests, which makes it difficult to refactor the code with confidence.

### Workarounds and Gotchas

- None observed.

## Integration Points and External Dependencies

### External Services

- None.

### Internal Integration Points

- The Plinko game component is integrated into the main page at `src/routes/+page.svelte`.

## Development and Deployment

### Local Development Setup

1.  Run `pnpm install` to install the dependencies.
2.  Run `pnpm dev` to start the development server.

### Build and Deployment Process

- **Build Command**: `pnpm build`
- **Deployment**: The application can be deployed to any static hosting service.

## Testing Reality

### Current Test Coverage

- The application does not have any automated tests.

### Running Tests

- N/A

## If Enhancement PRD Provided - Impact Analysis

### Files That Will Need Modification

- `src/lib/components/Plinko/Plinko.svelte`
- `src/lib/components/Plinko/PlinkoEngine.ts`
- `src/lib/stores/game.ts`
- `src/lib/components/Sidebar/Sidebar.svelte`

### New Files/Modules Needed

- None.

### Integration Considerations

- The new features will need to be integrated with the existing Svelte stores and the Matter.js physics engine.

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
pnpm dev            # Start development server
pnpm build          # Production build
pnpm preview        # Preview production build
pnpm test           # Run tests
pnpm lint           # Run linter
pnpm format         # Format code
```

### Debugging and Troubleshooting

- Use the browser's developer tools to debug the application.
- The Svelte DevTools extension can be used to inspect the Svelte components.
