# Tasks: React Plugin System

**Input**: Design documents from `/specs/001-react-plugin-system/`

## Phase 3.1: Setup & Contract Tests
- [ ] T001 [P] Create `tests/unit/test_plugin_registry_contract.test.ts` to validate the `PluginRegistryAPI` contract defined in `specs/001-react-plugin-system/contracts/plugin-api.ts`.
- [ ] T002 [P] Create `tests/unit/test_reconciler_contract.test.ts` to validate the `ReconcilerFactory` contract defined in `specs/001-react-plugin-system/contracts/reconciler-api.ts`.
- [ ] T003 [P] Create `tests/unit/test_ui_components_contract.test.ts` to validate the props contracts for `Button`, `ListView`, and `Input` components as defined in `specs/001-react-plugin-system/contracts/plugin-api.ts`.

## Phase 3.2: Core Implementation
- [ ] T004 Implement `PluginRegistry` class in `src/lib/plugin-system/plugin-registry.ts`.
- [ ] T005 Implement `ReconcilerFactory` class in `src/lib/reconciler/reconciler-factory.ts`.
- [ ] T006 Implement `host-config.ts` for the React reconciler in `src/lib/reconciler/host-config.ts`.
- [ ] T007 Implement `component-mapping.ts` in `src/lib/reconciler/component-mapping.ts`.
- [ ] T008 Implement `PluginContainer` class in `src/lib/plugin-system/plugin-container.ts`.
- [ ] T009 Implement `PluginContainer.svelte` component in `src/lib/PluginContainer.svelte`.
- [ ] T010 Implement `TodoPlugin.tsx` as a functional component in `src/plugins/todo-plugin/TodoPlugin.tsx`.
- [ ] T011 Implement `App.svelte` to load and render the plugin in `src/App.svelte`.

## Phase 3.3: Integration Tests
- [ ] T012 [P] Create `tests/integration/test_plugin_loading.test.ts` to test dynamic plugin loading and registration.
- [ ] T013 [P] Create `tests/integration/test_reconciler_rendering.test.ts` to test if React components are correctly rendered as Svelte components.
- [ ] T014 [P] Create `tests/integration/test_ui_interactions.test.ts` to test interactions between React plugins and Svelte UI components.
- [ ] T015 [P] Create `tests/integration/test_error_isolation.test.ts` to test error boundaries and plugin error handling.
- [ ] T016 [P] Create `tests/integration/test_multiple_plugins.test.ts` to test the system with multiple plugins loaded.

## Phase 3.4: Polish & Documentation
- [ ] T017 [P] Add unit tests for `plugin-registry.ts` in `tests/unit`.
- [ ] T018 [P] Add unit tests for `reconciler-factory.ts` in `tests/unit`.
- [ ] T019 [P] Add unit tests for `host-config.ts` in `tests/unit`.
- [ ] T020 [P] Add unit tests for `component-mapping.ts` in `tests/unit`.
- [ ] T021 [P] Add unit tests for `plugin-container.ts` in `tests/unit`.
- [ ] T022 Update `GEMINI.md` with the latest information about the project structure and how to run tests.

## Dependencies
- `T001`, `T002`, `T003` should be done before the implementation tasks.
- `T004` to `T011` are the core implementation tasks.
- `T012` to `T016` are integration tests that can be worked on after the core implementation.
- `T017` to `T022` are polish tasks.

## Parallel Example

```
# Launch T001, T002, T003 together:
Task: "Create tests/unit/test_plugin_registry_contract.test.ts ..."
Task: "Create tests/unit/test_reconciler_contract.test.ts ..."
Task: "Create tests/unit/test_ui_components_contract.test.ts ..."
```