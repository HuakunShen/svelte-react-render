# Tasks: React Plugin System with Custom Renderer

**Input**: Design documents from `/specs/001-react-plugin-system/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root (per plan.md structure)
- All paths assume repository root as base

## Phase 3.1: Setup
- [ ] T001 Install React plugin system dependencies (react, react-reconciler, @types/react)
- [ ] T002 Configure Vitest testing framework with @testing-library/svelte and @testing-library/react
- [ ] T003 [P] Create src/lib/plugin-system/ directory structure
- [ ] T004 [P] Create src/lib/reconciler/ directory structure  
- [ ] T005 [P] Create src/lib/ui-components/ directory structure
- [ ] T006 [P] Create src/plugins/todo-plugin/ directory structure
- [ ] T007 [P] Create tests/unit/, tests/integration/ directory structure

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (from contracts/)
- [ ] T008 [P] Contract test for PluginRegistryAPI in tests/unit/test_plugin_registry_contract.test.ts
- [ ] T009 [P] Contract test for PluginContainerAPI in tests/unit/test_plugin_container_contract.test.ts
- [ ] T010 [P] Contract test for ReconcilerFactory in tests/unit/test_reconciler_contract.test.ts
- [ ] T011 [P] Contract test for UI component props (Button, ListView, Input) in tests/unit/test_ui_components_contract.test.ts

### Integration Tests (from quickstart scenarios)
- [ ] T012 [P] Integration test: Load TODO plugin and render in tests/integration/test_plugin_loading.test.ts
- [ ] T013 [P] Integration test: React components render through reconciler in tests/integration/test_reconciler_rendering.test.ts
- [ ] T014 [P] Integration test: UI interactions work (button clicks, input changes) in tests/integration/test_ui_interactions.test.ts
- [ ] T015 [P] Integration test: Plugin error boundaries isolate failures in tests/integration/test_error_isolation.test.ts
- [ ] T016 [P] Integration test: Multiple plugins render simultaneously in tests/integration/test_multiple_plugins.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Entity Models (from data-model.md)
- [ ] T017 [P] Plugin entity with metadata validation in src/lib/plugin-system/plugin.ts
- [ ] T018 [P] PluginContainer entity with lifecycle management in src/lib/plugin-system/plugin-container.ts
- [ ] T019 [P] UIComponent entity with prop mapping in src/lib/ui-components/ui-component.ts
- [ ] T020 [P] PluginRegistry entity with loading/unloading in src/lib/plugin-system/plugin-registry.ts

### Svelte UI Components
- [ ] T021 [P] Button component in src/lib/ui-components/Button.svelte
- [ ] T022 [P] ListView component in src/lib/ui-components/ListView.svelte  
- [ ] T023 [P] Input component in src/lib/ui-components/Input.svelte
- [ ] T024 UI components index export in src/lib/ui-components/index.ts

### React Reconciler Implementation
- [ ] T025 Reconciler host config with Svelte component mapping in src/lib/reconciler/host-config.ts
- [ ] T026 Reconciler factory for creating roots in src/lib/reconciler/reconciler-factory.ts
- [ ] T027 Component type mapping (React elements → Svelte components) in src/lib/reconciler/component-mapping.ts
- [ ] T028 Reconciler index export in src/lib/reconciler/index.ts

### Plugin System Services
- [ ] T029 Plugin loader with dynamic imports in src/lib/plugin-system/plugin-loader.ts
- [ ] T030 Plugin registry implementation in src/lib/plugin-system/plugin-registry.ts
- [ ] T031 Plugin container management in src/lib/plugin-system/plugin-container.ts
- [ ] T032 Plugin system index export in src/lib/plugin-system/index.ts

## Phase 3.4: Integration  
- [ ] T033 Connect reconciler to plugin containers in src/lib/plugin-system/plugin-container.ts
- [ ] T034 Error boundary integration for plugin isolation in src/lib/reconciler/error-boundary.ts
- [ ] T035 Plugin registry integration with Svelte App.svelte
- [ ] T036 Theme/styling context for consistent UI in src/lib/reconciler/host-context.ts

## Phase 3.5: Example Plugin
- [ ] T037 [P] TODO plugin React component in src/plugins/todo-plugin/TodoPlugin.tsx
- [ ] T038 [P] TODO plugin metadata in src/plugins/todo-plugin/index.ts  
- [ ] T039 Plugin container component for Svelte in src/lib/PluginContainer.svelte
- [ ] T040 Update main App.svelte to load and render TODO plugin

## Phase 3.6: Polish
- [ ] T041 [P] Unit tests for plugin validation logic in tests/unit/test_plugin_validation.test.ts
- [ ] T042 [P] Unit tests for reconciler component mapping in tests/unit/test_component_mapping.test.ts
- [ ] T043 [P] Performance test: Multiple plugin loading in tests/performance/test_plugin_performance.test.ts
- [ ] T044 [P] Update package.json with new test scripts (test, test:unit, test:integration)
- [ ] T045 [P] Update CLAUDE.md with implementation status
- [ ] T046 Run quickstart.md scenarios for manual validation

## Dependencies

**Phase Dependencies**:
- Setup (T001-T007) before everything else
- Tests (T008-T016) before implementation (T017+)  
- Entity models (T017-T020) before services (T029-T032)
- UI components (T021-T024) before reconciler integration (T025-T028)
- Core implementation before integration (T033-T036)
- Integration before example plugin (T037-T040)
- Everything before polish (T041-T046)

**Specific Dependencies**:
- T025 (host-config) depends on T021-T024 (UI components)
- T029-T032 (plugin system) depends on T017-T020 (entities)
- T033-T036 (integration) depends on T025-T032 (core systems)
- T037-T040 (example plugin) depends on T033-T036 (integration)

## Parallel Example
```bash
# Phase 3.1 Setup (can run together):
Task: "Create src/lib/plugin-system/ directory structure"
Task: "Create src/lib/reconciler/ directory structure" 
Task: "Create src/lib/ui-components/ directory structure"

# Phase 3.2 Contract Tests (independent files):
Task: "Contract test for PluginRegistryAPI in tests/unit/test_plugin_registry_contract.test.ts"
Task: "Contract test for PluginContainerAPI in tests/unit/test_plugin_container_contract.test.ts"
Task: "Contract test for ReconcilerFactory in tests/unit/test_reconciler_contract.test.ts"

# Phase 3.3 Entity Models (different files):
Task: "Plugin entity with metadata validation in src/lib/plugin-system/plugin.ts"
Task: "PluginContainer entity in src/lib/plugin-system/plugin-container.ts"
Task: "UIComponent entity in src/lib/ui-components/ui-component.ts"
```

## Notes
- [P] tasks = different files, no dependencies between them
- Verify ALL tests fail before implementing (TDD requirement)
- Commit after each task completion
- Plugin system follows library-first architecture per constitution
- Use Svelte 5 runes syntax throughout

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - plugin-api.ts → T008, T009 (contract tests) 
   - reconciler-api.ts → T010 (reconciler contract test)
   - UI component interfaces → T011 (component contract test)
   
2. **From Data Model**:
   - Plugin entity → T017
   - PluginContainer entity → T018  
   - UIComponent entity → T019
   - PluginRegistry entity → T020
   
3. **From Quickstart Scenarios**:
   - Plugin loading → T012
   - React rendering → T013
   - UI interactions → T014
   - Error isolation → T015
   - Multiple plugins → T016

4. **Implementation Order**:
   - Setup → Tests → Models → UI Components → Reconciler → Services → Integration → Polish

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T008-T011)
- [x] All entities have model tasks (T017-T020)
- [x] All tests come before implementation (T008-T016 before T017+)
- [x] Parallel tasks truly independent (marked [P] only for different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Quickstart scenarios covered by integration tests
- [x] TDD order enforced (tests MUST fail before implementation)