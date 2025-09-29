# Product Requirements Document (PRD)

## Executive Summary

Transform the existing Plinko game into a classroom competition system where different class periods compete for points. The system will track scores by period, provide teacher controls for chip management, and display a real-time leaderboard.

## Epic and Story Structure

### Epic 1: Classroom Competition Transformation

**Epic Goal**: To transform the standalone Plinko game into a multi-period classroom competition system with teacher-managed controls, persistent scoring via a Supabase backend, and a real-time leaderboard.

**Integration Requirements**: All new features must seamlessly integrate with the existing SvelteKit application, maintaining the current visual style and ensuring no degradation of the core physics simulation.

#### Story 1.1: Refactor Core Game Mechanics

**As a teacher**, I want the game's scoring and board layout to be fixed, so that the competition is standardized and fair for all classes.

**Acceptance Criteria**:

- The Plinko board is statically set to 9 rows. All UI controls for changing the row count are removed.
- The score buckets are changed from multipliers to the following fixed point values (from left to right): 100, 500, 1000, 0, 10,000, 0, 1000, 500, 100.
- The falling speed of the chip is slightly reduced to improve visual tracking.
- All existing betting-related UI and logic (Bet Amount, Risk, Auto mode) are completely removed from the Sidebar.svelte component and any related logic.

#### Story 1.2: Set Up Supabase Backend

**As a system administrator**, I want a backend database configured, so that class scores and information can be stored persistently.

**Acceptance Criteria**:

- A new Supabase project is created.
- A database table named `periods` is created with columns for `id` (Primary Key, number), `nickname` (text), `points` (number), and `chips` (number).
- Row Level Security is enabled on the `periods` table, allowing public read access but restricting writes to authenticated users (i.e., the teacher using an admin key).
- Initial data for at least two periods is added to the table for testing purposes.

#### Story 1.3: Integrate Supabase and State Management

**As a developer**, I want the SvelteKit application to connect to Supabase and manage game state, so that data can be fetched from and sent to the database.

**Acceptance Criteria**:

- The Supabase client library is added to the project.
- Environment variables for the Supabase URL and anon key are added and used to initialize the client.
- The Svelte store at `src/lib/stores/game.ts` is created or expanded to manage the state for all periods, including their scores and chip counts.
- The application fetches the initial state of all periods from Supabase on startup and populates the store.

#### Story 1.4: Implement Period Selection

**As a teacher**, I want to select which class period is currently playing, so that scores and chip usage are attributed to the correct class.

**Acceptance Criteria**:

- Before the game board is shown, a UI is presented that allows the teacher to select a class period from a list fetched from Supabase.
- Once a period is selected, the main game view is displayed.
- The selected period's name and current chip count (from the store) are displayed in the game's UI.
- Dropping a chip is disabled until a period is selected.

#### Story 1.5: Connect Gameplay to Scoring and Chip System

**As a teacher**, I want dropping a chip to update the selected period's score and chip count, so that the game state is accurately tracked in real-time.

**Acceptance Criteria**:

- When the selected period drops a chip, their chip count in the store is immediately decremented by one.
- When the chip lands in a bin, the corresponding points are added to that period's total score in the store.
- The updated score and chip count are pushed to the Supabase database.
- The UI correctly reflects the new chip count and total score.
- If a period's chip count is 0, the "drop chip" action is disabled for them.

#### Story 1.6: Implement Leaderboard

**As a teacher**, I want to show a leaderboard of all class scores, so that I can foster friendly competition among periods.

**Acceptance Criteria**:

- The existing "Live Stats" UI component is repurposed to function as the leaderboard.
- The leaderboard displays the nickname and total points for every period, sorted by points in descending order.
- The data is rendered from the real-time Svelte store.
- A button is available on the main game screen to toggle the visibility of the leaderboard.

#### Story 1.7: Create Teacher Admin Panel

**As a teacher**, I want a secure admin panel, so that I can manage class nicknames and chip counts throughout the day.

**Acceptance Criteria**:

- A new page is created at the `/admin` route.
- The page is protected by a simple password stored as an environment variable.
- The admin panel displays a list of all class periods.
- For each period, the teacher can edit the nickname.
- For each period, the teacher can add or remove chips one at a time using "+1" and "-1" buttons.
- A "Reset Daily Chips" button is available that resets every period's chip count to 5.
- A "Manual Sync" button is available to force-push the current state to Supabase.

## Requirements

### Functional Requirements

- **FR1**: The scoring system shall be changed from multipliers to fixed point values for each of the 9 bins as follows: 100, 500, 1000, 0, 10,000, 0, 1000, 500, 100.

- **FR2**: The system will be controlled entirely by a teacher; no student authentication or login shall be required.

- **FR3**: The system shall manage multiple classes identified by a period number (e.g., "Period 1").

- **FR4**: Each class period must have a customizable nickname, a chip count, and a persistent total point score.

- **FR5**: Each period shall start with 5 chips at the beginning of each day.

- **FR6**: A teacher must be able to add or remove chips for any period in increments of one (+1 / -1).

- **FR7**: The system shall prevent a period from dropping a chip if their chip count is zero.

- **FR8**: A teacher-only admin panel shall be accessible at the /admin route and be protected by a simple password.

- **FR9**: From the admin panel, a teacher must be able to: edit period nicknames, add/remove chips, reset all periods' daily chips to the default, and trigger a manual data sync.

- **FR10**: The UI must include a period selector to choose the active class before gameplay.

- **FR11**: The main game UI must display the current period's name and remaining chip count.

- **FR12**: A leaderboard displaying all period nicknames and total scores shall be available and can be toggled on or off from the main view.

- **FR13**: The admin panel shall be a separate view from the main game board.

- **FR14**: The Plinko board shall be configured to have a static number of 9 rows, and any UI controls for changing the row count must be removed.

- **FR15**: All existing betting-related UI and logic (e.g., "Bet Amount", "Risk" level selector, "Auto" mode) shall be removed and replaced by the teacher-managed chip system.

### Non-Functional Requirements

- **NFR1**: The application shall be a static site deployed to Vercel, utilizing its free tier.

- **NFR2**: All persistent data (scores, nicknames, chip counts) shall be stored in a Supabase database, utilizing its free tier.

- **NFR3**: The application must not require serverless functions for its core client-side game logic.

- **NFR4**: Data will auto-sync to Supabase after a period uses its last chip, with a manual sync option available. Failed syncs will be queued for retry without blocking gameplay.

- **NFR5**: The application must be functional on Android-based smartboards (for display) and teacher Chromebooks (for admin).

- **NFR6**: The system requires a standard internet connection to function.

- **NFR7**: The UI for selecting a period must be quick to operate to support transitions within 40-minute class periods.

- **NFR8**: The falling speed of the Plinko chip shall be adjusted to be slightly slower than the current implementation to improve visual tracking on a smartboard.

## UI Enhancement Goals

### Integration with Existing UI

The new UI elements will adopt the existing visual design of the Plinko game, maintaining the current look and feel for a cohesive experience. New components will reuse existing styling defined in tailwind.config.js to ensure visual consistency.

### Modified/New Screens and Views

- **Period Selector Screen**: A new view presented before gameplay begins, allowing the teacher to select the active class period.

- **In-Game HUD**: The main game view will be modified to display the currently selected period's name and their remaining chip count.

- **Leaderboard Display**: The existing "Live Stats" window will be repurposed to serve as the leaderboard, displaying period nicknames and total scores. It will remain a toggleable component.

- **Admin Panel**: A new, separate view accessible at the /admin route for all teacher controls.

- **Game Settings**: The existing "Game Settings" button and its panel (for animations, etc.) will be preserved for potential future use.

### UI Consistency Requirements

All new interactive elements must match the styling of the existing UI components. The font, color palette, and general aesthetic must remain consistent with the original game design to provide a seamless user experience.
