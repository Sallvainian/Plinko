# Product Requirements Document (PRD)
## Plinko Classroom Competition System

### Executive Summary
Transform the existing Plinko game into a classroom competition system where different class periods compete for points. The system will track scores by period, provide teacher controls for chip management, and display a real-time leaderboard.

### Key Requirements from Discussion

#### 1. Scoring System Changes
**Current State**: Uses multipliers (e.g., 5.6x, 2x, 1.6x)
**New System**: Fixed point values for bins

**Bin Point Values (9 bins, left to right)**:
- Position 1: 100 points
- Position 2: 500 points
- Position 3: 1000 points
- Position 4: 0 points (penalty)
- Position 5: 10,000 points (center jackpot)
- Position 6: 0 points (penalty)
- Position 7: 1000 points
- Position 8: 500 points
- Position 9: 100 points

#### 2. Class Period Management
- **No student authentication required** - Teacher controls everything
- Classes identified by period number (Period 1, Period 2, etc.)
- Each period has:
  - Unique ID (period number)
  - Customizable nickname (teacher can edit)
  - Chip count (starts at 5 per day)
  - Total points (persistent)

#### 3. Chip System
**Behavior Management Through Chips**:
- Each period starts with 5 chips daily
- Teacher can add/remove chips (+1/-1 buttons)
- Used for classroom behavior incentives
- Chips spent by dropping in game
- Counter shows remaining chips
- Blocks play when chips = 0

#### 4. Teacher Admin Controls
**Simple Admin Panel**:
- Password-protected (simple password or environment variable)
- Edit period nicknames
- Add/remove chips per period (+1/-1 buttons only)
- View all period scores
- Reset daily chips
- Manual sync to cloud

**Display Setup**:
- Game displays on classroom smartboard (Android-based)
- Teacher controls from separate device (Chromebook)
- Admin panel accessible at `/admin` route
- Both connect to same online instance

#### 5. Technical Architecture

**Hosting**:
- Deploy to Vercel (free tier sufficient)
- Client-side game logic (no serverless functions needed)
- Static site with Supabase for backend

**Database (Supabase)**:
- Store period scores and nicknames
- Track chip counts
- Real-time leaderboard updates
- Free tier sufficient (500MB database)

**Sync Strategy**:
- Auto-sync after each period completes their chips
- Manual sync button for teacher
- Background sync doesn't block gameplay
- Queue failed syncs for retry

#### 6. UI Modifications
- Add period selector before game starts
- Display current period and chips remaining
- Show leaderboard (can be toggled visible/hidden)
- Keep existing game board visual design
- Admin panel separate from main game view

### Implementation Priority
1. **Phase 1**: Change scoring from multipliers to points
2. **Phase 2**: Add period selection and chip tracking
3. **Phase 3**: Implement Supabase backend and leaderboard
4. **Phase 4**: Create admin panel with controls
5. **Phase 5**: UI polish and refinements

### Technical Constraints
- Must work on Android-based smartboards
- Must work on Chromebooks for admin access
- Internet connection required (school network)
- Simple enough for quick period transitions (40-minute classes)

### Success Criteria
- Teachers can manage chips in real-time during class
- Scores persist across sessions
- Leaderboard shows current standings
- System handles multiple periods per day
- No student login required
- Quick setup at start of each period

### Out of Scope
- Individual student tracking
- Parent portal access
- Historical data analytics
- Complex authentication systems
- Mobile app versions

### Notes from Discussion
- Package manager: pnpm (not npm as architecture suggests)
- Consider fixing lint/test issues before major changes
- BMAD workflow being used for documentation
- Repository already set up with GitHub Actions