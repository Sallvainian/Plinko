# Epic and Story Structure

## Epic 1: Classroom Competition Transformation

**Epic Goal**: To transform the standalone Plinko game into a multi-period classroom competition system with teacher-managed controls, persistent scoring via a Supabase backend, and a real-time leaderboard.

**Integration Requirements**: All new features must seamlessly integrate with the existing SvelteKit application, maintaining the current visual style and ensuring no degradation of the core physics simulation.

### Story 1.1: Refactor Core Game Mechanics

**As a teacher**, I want the game's scoring and board layout to be fixed, so that the competition is standardized and fair for all classes.

**Acceptance Criteria**:

- The Plinko board is statically set to 9 rows. All UI controls for changing the row count are removed.
- The score buckets are changed from multipliers to the following fixed point values (from left to right): 100, 500, 1000, 0, 10,000, 0, 1000, 500, 100.
- The falling speed of the chip is slightly reduced to improve visual tracking.
- All existing betting-related UI and logic (Bet Amount, Risk, Auto mode) are completely removed from the Sidebar.svelte component and any related logic.

### Story 1.2: Set Up Supabase Backend

**As a system administrator**, I want a backend database configured, so that class scores and information can be stored persistently.

**Acceptance Criteria**:

- A new Supabase project is created.
- A database table named `periods` is created with columns for `id` (Primary Key, number), `nickname` (text), `points` (number), and `chips` (number).
- Row Level Security is enabled on the `periods` table, allowing public read access but restricting writes to authenticated users (i.e., the teacher using an admin key).
- Initial data for at least two periods is added to the table for testing purposes.

### Story 1.3: Integrate Supabase and State Management

**As a developer**, I want the SvelteKit application to connect to Supabase and manage game state, so that data can be fetched from and sent to the database.

**Acceptance Criteria**:

- The Supabase client library is added to the project.
- Environment variables for the Supabase URL and anon key are added and used to initialize the client.
- The Svelte store at `src/lib/stores/game.ts` is created or expanded to manage the state for all periods, including their scores and chip counts.
- The application fetches the initial state of all periods from Supabase on startup and populates the store.

### Story 1.4: Implement Period Selection

**As a teacher**, I want to select which class period is currently playing, so that scores and chip usage are attributed to the correct class.

**Acceptance Criteria**:

- Before the game board is shown, a UI is presented that allows the teacher to select a class period from a list fetched from Supabase.
- Once a period is selected, the main game view is displayed.
- The selected period's name and current chip count (from the store) are displayed in the game's UI.
- Dropping a chip is disabled until a period is selected.

### Story 1.5: Connect Gameplay to Scoring and Chip System

**As a teacher**, I want dropping a chip to update the selected period's score and chip count, so that the game state is accurately tracked in real-time.

**Acceptance Criteria**:

- When the selected period drops a chip, their chip count in the store is immediately decremented by one.
- When the chip lands in a bin, the corresponding points are added to that period's total score in the store.
- The updated score and chip count are pushed to the Supabase database.
- The UI correctly reflects the new chip count and total score.
- If a period's chip count is 0, the "drop chip" action is disabled for them.

### Story 1.6: Implement Leaderboard

**As a teacher**, I want to show a leaderboard of all class scores, so that I can foster friendly competition among periods.

**Acceptance Criteria**:

- The existing "Live Stats" UI component is repurposed to function as the leaderboard.
- The leaderboard displays the nickname and total points for every period, sorted by points in descending order.
- The data is rendered from the real-time Svelte store.
- A button is available on the main game screen to toggle the visibility of the leaderboard.

### Story 1.7: Create Teacher Admin Panel

**As a teacher**, I want a secure admin panel, so that I can manage class nicknames and chip counts throughout the day.

**Acceptance Criteria**:

- A new page is created at the `/admin` route.
- The page is protected by a simple password stored as an environment variable.
- The admin panel displays a list of all class periods.
- For each period, the teacher can edit the nickname.
- For each period, the teacher can add or remove chips one at a time using "+1" and "-1" buttons.
- A "Reset Daily Chips" button is available that resets every period's chip count to 5.
- A "Manual Sync" button is available to force-push the current state to Supabase.
