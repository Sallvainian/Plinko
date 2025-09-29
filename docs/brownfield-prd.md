# Brownfield Product Requirements Document

## 1. Project Context

### 1.1 Document Purpose
This brownfield PRD documents the existing Plinko game application and defines requirements for transforming it into a classroom competition system with persistent scoring and teacher controls.

### 1.2 Current State Summary
- **Existing Product**: Single-player Plinko game with betting mechanics
- **Tech Stack**: SvelteKit v2, Matter.js physics engine, Tailwind CSS, TypeScript 5
- **Deployment**: Static site generation via @sveltejs/adapter-static
- **Key Features**: Physics-based chip dropping, multiplier-based scoring, betting controls

### 1.3 Business Context
Transform the standalone Plinko game into an educational tool for classroom competitions where:
- Multiple class periods compete for points throughout the day
- Teachers manage chip distribution and track scores
- Students experience gamified learning through physics-based gameplay
- No student authentication required - teacher controls everything

## 2. Enhancement Objectives

### 2.1 Primary Goals
1. Enable multi-period classroom competitions with persistent scoring
2. Replace gambling mechanics with educational point system
3. Add teacher administrative controls for chip and score management
4. Implement real-time leaderboard for competitive engagement
5. Maintain smooth physics performance on classroom hardware

### 2.2 Success Metrics
- Teacher can manage 6-8 class periods within 40-minute sessions
- System handles concurrent usage across multiple classrooms
- Zero data loss with offline resilience and sync recovery
- Maintains 60 FPS physics performance on Android smartboards

### 2.3 Constraints & Limitations
- Must remain client-side static site (no server-side logic)
- Free tier limits: Vercel hosting and Supabase database
- Must work on existing classroom hardware (Android smartboards, Chromebooks)
- Cannot require student authentication or individual accounts

## 3. Stakeholder Analysis

### 3.1 Primary Stakeholders
- **Teachers**: Need simple controls to manage multiple class periods quickly
- **Students**: Experience competitive gameplay without individual accounts
- **School IT**: Require simple deployment without complex infrastructure

### 3.2 User Personas
- **Math Teacher**: Uses game to reinforce probability concepts through competition
- **Science Teacher**: Demonstrates physics principles while maintaining engagement
- **Elementary Teacher**: Manages younger students with simplified scoring system

## 4. Existing System Analysis

### 4.1 Current Architecture
```
src/
├── lib/
│   ├── components/
│   │   ├── Plinko/          # Core game engine and physics
│   │   ├── Sidebar/         # Betting controls (to be removed)
│   │   ├── LiveStatsWindow/ # Stats display (to be repurposed)
│   │   └── ui/              # Reusable UI components
│   ├── stores/              # State management
│   └── constants/           # Game configuration
├── routes/                  # SvelteKit pages
└── app.html                 # Entry point
```

### 4.2 Technical Debt & Constraints
- Betting logic tightly coupled with game mechanics in Sidebar component
- No persistence layer - all state is client-side only
- Live stats component assumes single-player context
- Physics engine optimized for current chip speed

### 4.3 Integration Points
- Matter.js engine emits events for chip landing
- Svelte stores manage reactive state updates
- Tailwind CSS provides consistent styling system
- Static adapter enables Vercel deployment

## 5. Gap Analysis

### 5.1 Functional Gaps
| Current State | Desired State | Gap |
|--------------|---------------|-----|
| Single player only | Multi-period competition | Need period selection and tracking |
| Multiplier scoring | Fixed point values | Scoring system refactor |
| No persistence | Supabase backend | Database integration required |
| Betting controls | Teacher chip management | UI/UX transformation |
| Individual stats | Class leaderboard | Stats aggregation by period |

### 5.2 Technical Gaps
- No backend integration (need Supabase client)
- No authentication system (need admin password protection)
- No offline sync capability (need localStorage queue)
- No period/class management (need new data models)

## 6. Requirements

### 6.1 Functional Requirements

#### Core Game Mechanics
- **FR1**: Fix Plinko board at 9 rows (remove row adjustment controls)
- **FR2**: Replace multipliers with fixed points: [100, 500, 1000, 0, 10,000, 0, 1000, 500, 100]
- **FR3**: Reduce chip falling speed by ~20% for better visibility
- **FR4**: Remove all betting UI elements (bet amount, risk, auto-play)

#### Period Management
- **FR5**: Support multiple class periods identified by number (1-8)
- **FR6**: Each period has: ID, nickname, total points, available chips
- **FR7**: Periods start each day with 5 chips (teacher adjustable)
- **FR8**: Prevent chip drops when period has 0 chips

#### User Interface
- **FR9**: Period selector screen before gameplay begins
- **FR10**: In-game HUD shows selected period name and chip count
- **FR11**: Repurpose Live Stats as sortable leaderboard
- **FR12**: Maintain existing visual design and animations

#### Teacher Administration
- **FR13**: Password-protected admin panel at /admin route
- **FR14**: Edit period nicknames
- **FR15**: Add/remove chips (+1/-1 buttons)
- **FR16**: "Reset Daily Chips" sets all periods to 5 chips
- **FR17**: "Manual Sync" forces database update

#### Data Persistence
- **FR18**: Auto-sync scores after each chip drop
- **FR19**: Queue failed syncs in localStorage for retry
- **FR20**: Log all drops with timestamp, period, bin, points

### 6.2 Non-Functional Requirements

#### Performance
- **NFR1**: Maintain 60 FPS on Android smartboards
- **NFR2**: Page load under 3 seconds on school networks
- **NFR3**: Smooth animations on Chromebooks

#### Infrastructure
- **NFR4**: Deploy as static site to Vercel (free tier)
- **NFR5**: Use Supabase free tier for persistence
- **NFR6**: No serverless functions required
- **NFR7**: Client-side only architecture

#### Reliability
- **NFR8**: Offline-capable with sync recovery
- **NFR9**: No data loss during network interruptions
- **NFR10**: Graceful degradation without database

#### Usability
- **NFR11**: Period selection under 10 seconds
- **NFR12**: Teacher controls intuitive without training
- **NFR13**: Works on touch screens and mouse input

## 7. Technical Architecture

### 7.1 System Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Game Board    │────▶│  Svelte Stores   │────▶│    Supabase     │
│  (SvelteKit)    │     │  (State Mgmt)    │     │   (Database)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Period Selector │     │   Local Queue    │     │      RLS        │
│     (UI)        │     │  (localStorage)  │     │  (Row Security) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### 7.2 Data Flow
1. Teacher selects period → Store updates → UI reflects selection
2. Chip dropped → Physics calculates → Store updates points → Sync to Supabase
3. Failed sync → Queue in localStorage → Retry on next action
4. Admin changes → Direct Supabase write with service key → Store refresh

### 7.3 Security Model
- Public read access to all period data (anon key)
- Admin writes require service role key (server-side only)
- Admin panel protected by environment variable password
- No student authentication required

## 8. UI/UX Specifications

### 8.1 Modified Screens

#### Period Selector
- Centered modal on game load
- Grid of period buttons with nicknames
- Selected period highlighted
- "Continue" button to start game

#### Game HUD Updates
- Top bar shows: "Period X: [Nickname] - Chips: Y"
- Chip count updates immediately on drop
- Visual indicator when chips depleted

#### Leaderboard (Live Stats)
- Table format: Rank | Period | Nickname | Total Points
- Sorted by points descending
- Current period highlighted
- Toggle button to show/hide

### 8.2 New Screens

#### Admin Panel (/admin)
- Password prompt on access
- Period management table
- Inline editing for nicknames
- +/- buttons for chip management
- Action buttons: Reset Chips, Manual Sync

### 8.3 Visual Consistency
- Maintain existing dark theme
- Use current button styles and animations
- Keep phosphor-icons for UI elements
- Preserve responsive design patterns

## 9. Implementation Priorities

### 9.1 Phase 1: Core Refactoring (Stories 1.1-1.3)
1. Remove betting mechanics
2. Implement fixed scoring
3. Set up Supabase backend
4. Create period data models

### 9.2 Phase 2: Period Management (Stories 1.4-1.5)
1. Build period selector UI
2. Connect gameplay to scoring
3. Implement chip management
4. Add persistence layer

### 9.3 Phase 3: Teacher Features (Stories 1.6-1.7)
1. Transform Live Stats to leaderboard
2. Create admin panel
3. Add teacher controls
4. Implement sync mechanisms

## 10. Risk Analysis

### 10.1 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase free tier limits | High | Implement efficient queries, batch updates |
| Network reliability in schools | High | Robust offline queue, manual sync option |
| Performance on old hardware | Medium | Optimize animations, reduce particle effects |

### 10.2 Implementation Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Tight coupling of betting logic | Medium | Careful refactoring with tests |
| State management complexity | Medium | Clear store architecture, TypeScript |
| Teacher adoption | Low | Simple UI, clear documentation |

## 11. Migration Strategy

### 11.1 Database Setup
1. Create Supabase project
2. Define periods table schema
3. Configure RLS policies
4. Seed initial test data

### 11.2 Code Migration
1. Branch from current state
2. Remove betting features
3. Add period management
4. Integrate Supabase
5. Deploy to staging

### 11.3 Rollout Plan
1. Internal testing with sample classes
2. Pilot with one teacher
3. Gather feedback and iterate
4. Full deployment

## 12. Success Criteria

### 12.1 Technical Success
- [ ] All tests passing
- [ ] 60 FPS maintained
- [ ] Offline sync working
- [ ] No console errors

### 12.2 User Success
- [ ] Teachers can manage periods in < 1 minute
- [ ] Students engaged with competition
- [ ] Scores persist reliably
- [ ] Admin controls intuitive

### 12.3 Business Success
- [ ] Increased classroom engagement
- [ ] Positive teacher feedback
- [ ] Adoption across multiple classes
- [ ] Feature requests for enhancements

## Appendices

### A. Existing File Structure
- See Section 4.1 for current architecture
- Key files: PlinkoEngine.ts, Sidebar.svelte, game.ts (store)

### B. Database Schema
```sql
CREATE TABLE periods (
  id INTEGER PRIMARY KEY,
  nickname TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  chips INTEGER DEFAULT 5
);

-- RLS Policies
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON periods FOR SELECT USING (true);
```

### C. Environment Variables
- `PUBLIC_SUPABASE_URL`: Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `ADMIN_SUPABASE_SERVICE_ROLE`: Admin service key (server-side only)
- `ADMIN_PASSWORD`: Simple password for /admin access