# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a plugin system implementation that allows React extensions to render within a Svelte 5 application using a custom React renderer/reconciler. The core concept is building a Raycast-like plugin architecture where the host app is in Svelte but plugins can be written in React and rendered through custom Svelte components.

## Key Architecture

- **Host Application**: Built with Svelte 5, using the new runes syntax (`$state`, `$derived`, etc.)
- **Plugin System**: React plugins rendered via custom reconciler into Svelte components
- **Custom Components**: Svelte implementations of basic UI components (button, listview, input) that React plugins can use
- **Target**: Basic TODO list MVP as the initial example

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking and linting
npm run check
```

## Tech Stack

- **Svelte**: 5.38.1+ (always use Svelte 5 syntax, never Svelte 4)
- **React**: 18+ (for plugin development)
- **React Reconciler**: Custom renderer for Svelte integration
- **TypeScript**: ~5.8.3
- **Vite**: 7.1.2+ (build tool and dev server)
- **Vitest**: Testing framework + @testing-library/svelte + @testing-library/react
- **svelte-check**: Type checking for Svelte files

## Important Notes

- Always use Svelte 5 runes syntax (`$state`, `$derived`, `onclick`, etc.)
- The project uses Vite with the official Svelte plugin
- TypeScript is configured for both app and node environments
- Testing framework: Vitest with Testing Library for both React and Svelte
- Plugin architecture: React components rendered through custom reconciler into Svelte components
- Plugin API versioning: Semantic versioning (currently targeting 1.0.0)
- Error isolation: Each plugin runs in its own reconciler tree with error boundaries

## File Structure

```
src/
├── App.svelte              # Main application entry
├── main.ts                 # Application bootstrap
├── lib/
│   ├── plugin-system/      # Plugin registry and loading
│   ├── reconciler/         # Custom React reconciler
│   ├── ui-components/      # Svelte UI components (Button, ListView, Input)
│   └── Counter.svelte      # Example Svelte 5 component
├── plugins/                # Plugin implementations
│   └── todo-plugin/        # Example TODO list plugin
└── assets/                 # Static assets

specs/001-react-plugin-system/  # Feature specification and planning
├── spec.md                     # Feature requirements
├── plan.md                     # Implementation plan
├── research.md                 # Technical research
├── data-model.md               # Data structures and schemas
├── quickstart.md               # Developer guide
└── contracts/                  # API contract definitions
```

## Current Implementation Status

- ✅ Feature specification complete
- ✅ Implementation plan complete  
- ⏳ Plugin system libraries (pending implementation)
- ⏳ Custom React reconciler (pending implementation)
- ⏳ Svelte UI components (pending implementation)
- ⏳ TODO plugin example (pending implementation)

Always use svelte 5 syntax, not svelte 4 syntax.