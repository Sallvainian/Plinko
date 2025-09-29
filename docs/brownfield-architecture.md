# Brownfield Enhancement Architecture

## Introduction

This document defines the brownfield architecture to add a classroom competition system to the existing SvelteKit Plinko application. It aligns with the PRD’s requirements for period selection, persistent scoring via Supabase, leaderboard, and teacher-admin controls, preserving physics performance and existing UI style while minimizing engine changes and using client-only static generation (SSG).

Confirmed inputs:
- PRD (sharded in `docs/prd/`)
- Existing codebase: SvelteKit + Tailwind CSS + Matter.js (Plinko engine)
- Target infra: Vercel static hosting + Supabase (RLS; anon reads, admin writes)

## Existing Project Analysis (Brownfield)
- Purpose: Convert the single-user Plinko game into a multi-period classroom competition with teacher-managed chips and persistent scores per period
- Tech Stack: SvelteKit v2, `@sveltejs/adapter-static`, Vite 5, Svelte 4, Tailwind 3, Matter.js 0.19, TypeScript 5
- Architecture style: Client-only SSG; no serverless for gameplay
- Deployment: Vercel static
- Constraints:
  - Client-only approach preserved (per NFRs)
  - Physics performance must remain smooth; minimal engine changes
  - Support Android smartboards (display) and teacher Chromebooks (admin)
  - Supabase (free tier) persistence with RLS: anon read-only, admin writes on `/admin`

## Enhancement Scope and Integration Strategy

### Enhancement Overview
- Period Selector (pre-game) and HUD showing selected period nickname and chips
- Replace multipliers with fixed bin points; slightly slower chip fall speed
- Remove betting UI/logic (Bet Amount, Risk, Auto) across Sidebar/store/engine
- Store(s) for `periods[]` (id, nickname, points, chips) and `selectedPeriodId`
- Persist updates to Supabase; auto-sync on key events; localStorage queue for failures; Manual Sync
- Repurpose Live Stats as Leaderboard (nickname + points, desc)
- `/admin` route with password gate: edit nickname, +/- chips, Reset Daily Chips, Manual Sync

Integration impact: Medium (UI, stores, scoring mapping, minimal engine changes)

### Integration Approach
- Engine emits `landedBinIndex`; scoring handled via fixed mapping in store layer
- Define `BIN_POINTS` in `src/lib/constants/game.ts`
- Keep drop action simple; decrement chips at drop if a period is selected and chips > 0
- Do not block drop when no period is selected; instead, log all drops (timestamp, period id if any, bin index, points applied) for audit
- Expand new store `src/lib/stores/periods.ts` for `periods[]`, `selectedPeriodId`, `selectedPeriod`, and a `history` log

### Database Integration (Supabase)
- Table: `periods(id int pk, nickname text, points int, chips int)`
- RLS:
  - anon: `select` allowed
  - admin (service role on `/admin`): CRUD
- Client: `@supabase/supabase-js`; on failure, queue mutations locally and flush later

### UI Integration
- Period Selector in navbar; HUD shows selected nickname/chips
- Leaderboard (reusing Live Stats window) and Drop History table
- `/admin` page password-gated via env; controls as above

### Compatibility Requirements
- API: none to maintain; direct Supabase client only
- DB Schema: additive; `periods` is new and isolated
- UI/UX: keep existing Tailwind styling and components
- Performance: keep engine loop untouched except minor fall speed; debounce/limit network writes

## Tech Stack Alignment

| Category       | Technology                 | Version | Usage                                        | Notes     |
| :------------- | :------------------------- | :------ | :------------------------------------------- | :-------- |
| Framework      | SvelteKit                  | ^2      | App framework, routing, SSG                  | Keep      |
| Adapter (SSG)  | @sveltejs/adapter-static   | ^3      | Static export for Vercel                     | Keep      |
| Language       | TypeScript                 | ^5      | Typing across stores/components/engine       | Keep      |
| Build Tool     | Vite                       | ^5      | Dev/build tooling                            | Keep      |
| UI Runtime     | Svelte                     | ^4      | Components, reactive stores                  | Keep      |
| Styling        | Tailwind CSS               | ^3      | UI styling                                   | Keep      |
| Physics        | matter-js                  | ^0.19   | Plinko physics                               | Keep      |
| Charts         | chart.js                   | ^4      | Optional (if needed)                         | Optional  |
| Drag           | @neodrag/svelte            | ^2      | Window drag                                  | Keep      |
| Supabase       | @supabase/supabase-js      | ^2      | Client reads (anon) and admin writes         | Add       |

Rationale: only add Supabase client; otherwise reuse stack to minimize risk.

## Data Models and Schema Changes

### New Data Model: Period
- `id: number` (pk), `nickname: string`, `points: number` (default 0), `chips: number` (default 5)
- Client reads via anon key; admin writes on `/admin`

### Schema Integration Strategy
- SQL in `docs/qa/setup-notes.md` for table + policies + seed
- RLS policies: allow anon `select`, deny anon writes; admin uses service role (bypasses RLS)
- Backward-compatible and additive

## Component Architecture

### New/Updated Components
1) `PeriodSelector.svelte`: load periods, choose active period
2) HUD additions: show nickname/chips; chip decrement at drop if selected
3) Leaderboard (repurpose Live Stats): nickname + points desc
4) `/admin` page: password gate; nickname, chip +/-; reset; manual sync
5) Stores `periods.ts`: state + history log; actions to update and log
6) Engine hook: emit bin index → store applies fixed points and logs drop

### Component Interaction Diagram
```mermaid
graph TD
  A[PeriodSelector] -->|select period| S[Periods Store]
  S -->|selected period| HUD[HUD (name/chips)]
  BTN[Drop Button] -->|on click| ENG[PlinkoEngine]
  ENG -->|landedBinIndex| MAP[Scoring Map (BIN_POINTS)]
  MAP -->|points| S
  S -->|updates| LB[Leaderboard]
  S -->|append| H[Drop History]
  ADM[/admin page/] -->|nickname/chips ops| S
  S -->|mutations| Q[localStorage Queue]
  Q -->|retry/flush| SB[Supabase]
  S -->|initial load| SB
```

## Source Tree Integration

### Existing Structure (relevant)
```text
src/
  lib/
    components/
    constants/
    stores/
    utils/
    supabase/
  routes/
```

### New Additions (proposed)
```text
src/
  lib/
    components/
      PeriodSelector.svelte
      LiveStatsWindow/Leaderboard.svelte
      LiveStatsWindow/DropHistory.svelte
    constants/
      game.ts                     # add BIN_POINTS mapping
    stores/
      periods.ts                  # periods state + selection + history
    utils/
      syncQueue.ts                # localStorage-backed mutation queue
    supabase/
      client.ts                   # supabase anon client + admin getter
  routes/
    admin/+page.svelte            # password-gated admin panel
```

### Integration Guidelines
- PascalCase for components; camelCase for utilities/stores
- Keep domain-focused folders (`components`, `stores`, `utils`, `supabase`)
- Prefer shallow relative imports

## Infrastructure and Deployment Integration
- Vercel static + Supabase
- Env vars:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `ADMIN_SUPABASE_SERVICE_ROLE` (only on `/admin`)
  - `ADMIN_PASSWORD` (simple gate)
- Pipeline: `pnpm build` → Vercel deploy; previews optional
- Rollback: Re-deploy previous Vercel build; for data issues restore Supabase snapshot
- Monitoring: Supabase dashboard; Vercel analytics optional; basic client-side logging for sync failures

## Coding Standards and Conventions
- Prettier + ESLint (Svelte plugin)
- No custom API; use Supabase client
- Batch writes via store-driven sync; queue on failure; idempotent updates where possible
- Non-blocking UI on sync failures; Manual Sync affordance

## Testing Strategy
- Unit (Vitest):
  - BIN_POINTS mapping
  - Store actions: decrement chips on drop; apply points on settle
  - Queue: enqueue/peek/dequeue/replace and idempotent behavior
- E2E (Playwright):
  - Period select → HUD update
  - Drop before selection gets logged (no state mutation)
  - Drop with selection: chips decrement, points apply, leaderboard updates
  - Admin flows: password gate, nickname edit, chip +/- , reset, manual sync
- Regression: visual physics sanity

## Security Integration
- Gameplay: no auth
- `/admin`: password gate; no secret exposure in client bundle
- RLS: anon select only; admin writes via service role; verify bundle contains no admin secret
- Validate inputs; bound chips [0–9999]

## Checklist Results (Architect)
- Architecture needed: Yes (multi-feature + persistence)
- Client-only target respected: Yes
- Data model defined; integration points identified
- Risks mitigated: non-blocking sync; password-gated admin; minimal engine changes

Status: PASS — proceed to story breakdown and implementation.

## Next Steps
- Story 1.1: fixed rows and bin points; remove betting
- Story 1.4: period selector + HUD
- Story 1.5: connect gameplay to scoring/chips with store + Supabase + queue

