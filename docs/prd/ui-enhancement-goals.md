# UI Enhancement Goals

## Integration with Existing UI

The new UI elements will adopt the existing visual design of the Plinko game, maintaining the current look and feel for a cohesive experience. New components will reuse existing styling defined in tailwind.config.js to ensure visual consistency.

## Modified/New Screens and Views

- **Period Selector Screen**: A new view presented before gameplay begins, allowing the teacher to select the active class period.

- **In-Game HUD**: The main game view will be modified to display the currently selected period's name and their remaining chip count.

- **Leaderboard Display**: The existing "Live Stats" window will be repurposed to serve as the leaderboard, displaying period nicknames and total scores. It will remain a toggleable component.

- **Admin Panel**: A new, separate view accessible at the /admin route for all teacher controls.

- **Game Settings**: The existing "Game Settings" button and its panel (for animations, etc.) will be preserved for potential future use.

## UI Consistency Requirements

All new interactive elements must match the styling of the existing UI components. The font, color palette, and general aesthetic must remain consistent with the original game design to provide a seamless user experience.
