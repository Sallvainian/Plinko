# Plinko Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Plinko codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements.

### Document Scope

Focused on areas relevant to the enhancement of the Plinko game simulation, as detailed in the `prd.md`.

### Change Log

| Date       | Version | Description                 | Author  |
| :--------- | :------ | :-------------------------- | :------ |
| 2025-09-29 | 1.0     | Initial brownfield analysis | Winston |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

* **Main Entry**: `src/routes/+page.svelte` (Main Svelte component for the game)
* **Configuration**: `src/lib/constants/game.ts` (Game constants and settings)
* **Core Business Logic**: `src/lib/components/Plinko/PlinkoEngine.ts` (Core game logic)
* **API Definitions**: N/A (Client-side application)
* **Database Models**: N/A (Client-side application)
* **Key Algorithms**: `src/lib/components/Plinko/PlinkoEngine.ts` (Plinko ball physics)

### Enhancement Impact Areas

* `src/lib/components/Plinko/Plinko.svelte`
* `src/lib/components/Plinko/PlinkoEngine.ts`
* `src/lib/stores/game.ts`
* `src/lib/components/Sidebar/Sidebar.svelte`

## High Level Architecture

### Technical Summary

The Plinko project is a client-side web application built with SvelteKit. The core of the application is a Plinko game simulation that uses Matter.js for the physics engine. The application is well-structured, with a clear separation of concerns between the UI components and the game logic. The application uses TypeScript for type safety and Tailwind CSS for styling.

### Actual Tech Stack

| Category       | Technology   | Version | Notes                                                       |
| :------------- | :----------- | :------ | :---------------------------------------------------------- |
| Runtime        | Node.js      | 20      | As specified in `.github/workflows/format-check.yaml`      |
| Framework      | SvelteKit    | latest  | As specified in `package.json`                              |
| Physics Engine | Matter.js    | latest  | As specified in `src/lib/components/Plinko/PlinkoEngine.ts` |
| Styling        | Tailwind CSS | latest  | As specified in `tailwind.config.js`                        |
| Language       | TypeScript   | latest  | As specified in `tsconfig.json`                             |

### Repository Structure Reality Check

* **Type**: Monorepo
* **Package Manager**: npm
* **Notable**: The project uses a standard SvelteKit project structure. The core game logic is located in `src/lib/components/Plinko/`.

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

  * **Plinko**: `src/lib/components/Plinko/` - Contains the core Plinko game components and logic.
  * **Stores**: `src/lib/stores/` - Contains the Svelte stores for managing game state.
  * **Constants**: `src/lib/constants/` - Contains the game constants and settings.
  * **Utils**: `src/lib/utils/` - Contains utility functions.

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

  * None observed.

## Integration Points and External Dependencies

### External Services

  * None.

### Internal Integration Points

  * The Plinko game component is integrated into the main page at `src/routes/+page.svelte`.

## Development and Deployment

### Local Development Setup

1.  Run `npm install` to install the dependencies.
2.  Run `npm run dev` to start the development server.

### Build and Deployment Process

  * **Build Command**: `npm run build`
  * **Deployment**: The application can be deployed to any static hosting service.

## Testing Reality

### Current Test Coverage

  * The application does not have any automated tests.

### Running Tests

  * N/A

## If Enhancement PRD Provided - Impact Analysis

### Files That Will Need Modification

  * `src/lib/components/Plinko/Plinko.svelte`
  * `src/lib/components/Plinko/PlinkoEngine.ts`
  * `src/lib/stores/game.ts`
  * `src/lib/components/Sidebar/Sidebar.svelte`

### New Files/Modules Needed

  * None.

### Integration Considerations

  * The new features will need to be integrated with the existing Svelte stores and the Matter.js physics engine.

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm run dev         # Start development server
npm run build       # Production build
npm run preview     # Preview production build
npm run test        # Run tests
npm run lint        # Run linter
npm run format      # Format code
```

### Debugging and Troubleshooting

  * Use the browser's developer tools to debug the application.
  * The Svelte DevTools extension can be used to inspect the Svelte components.