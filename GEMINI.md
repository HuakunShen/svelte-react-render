# Project: Svelte React Renderer

## Project Overview

This project is a web application that demonstrates a sophisticated plugin architecture. The main application is built with Svelte 5, and it can load and render plugins written in React. This is achieved through a custom React reconciler that maps React components to Svelte components.

The primary goal is to allow developers to extend the application with React-based plugins, which are then rendered seamlessly within the Svelte UI. The project includes a proof-of-concept TODO list plugin to showcase this functionality.

**Key Technologies:**

*   **Frontend Framework:** Svelte 5
*   **Plugin Framework:** React 18
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Testing:** Vitest
*   **Styling:** CSS with some dark mode support

**Architecture:**

The core of the project is the plugin system and the custom React reconciler.

*   **Plugin System:** The `PluginRegistry` is responsible for loading, registering, and managing plugins. Plugins are defined as modules that export a React component and metadata. The contracts for the plugin system are defined in `specs/001-react-plugin-system/contracts/plugin-api.ts`.
*   **React Reconciler:** A custom React reconciler, created using the `react-reconciler` package, is used to render React components. The reconciler's host configuration (`src/lib/reconciler/host-config.ts`) defines how to create and manage Svelte components as the target for the React rendering.
*   **UI Components:** The project defines a set of custom UI components (e.g., `Button`, `ListView`, `Input`) in Svelte. The React plugins use these components, and the reconciler maps the React elements to the corresponding Svelte components.

## Building and Running

The project uses `npm` for package management.

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, and the application will be available at `http://localhost:5173`.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    This will create a production build in the `dist` directory.

*   **Run Tests:**
    ```bash
    npm test
    ```
    This will run all unit and integration tests using Vitest.

    *   **Run Unit Tests:**
        ```bash
        npm run test:unit
        ```

    *   **Run Integration Tests:**
        ```bash
        npm run test:integration
        ```

## Development Conventions

*   **Svelte 5 Syntax:** The project uses the latest Svelte 5 syntax.
*   **TypeScript:** The entire codebase is written in TypeScript.
*   **Plugin Contracts:** The plugin system is based on a set of contracts defined in `specs/001-react-plugin-system/contracts/`. Any new plugin or modification to the plugin system should adhere to these contracts.
*   **Testing:** The project has a `tests` directory with unit and integration tests. New features should be accompanied by corresponding tests.
*   **Component-Based Architecture:** The application is built using a component-based architecture, with a clear separation of concerns between the main application, the plugin system, and the UI components.


Always use svelte 5 syntax, not svelte 4 syntax.
