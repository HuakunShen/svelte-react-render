# Testing Guide

This document describes how to test the React-to-Svelte plugin system.

## Running the Application

```bash
# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Features to Test

### 1. Basic TODO List Display
- **Expected**: You should see two initial TODO items:
  - "Write a todo list extension" (uncompleted - circle icon)
  - "Explain it to others" (uncompleted - circle icon)

### 2. List Actions (Global Actions)
- **Action**: Right-click on empty space in the list OR click the create button
- **Expected**: Action panel should appear with "Create Todo" option

### 3. Item-Specific Actions
- **Action**: Click on a TODO item
- **Expected**: Action panel should appear with multiple options:
  - Section 1: "Complete Todo" / "Uncomplete Todo" (toggles based on state)
  - Section 2: "Create Todo", "Delete Todo"

### 4. Toggle TODO Completion
- **Action**: Click a TODO item, then click "Complete Todo"
- **Expected**: 
  - Action panel closes
  - Icon changes from circle (○) to checkmark (✓)
  - Click again and select "Uncomplete Todo" to toggle back

### 5. Delete TODO
- **Action**: Click a TODO item, then click "Delete Todo"
- **Expected**: 
  - Action panel closes
  - TODO item is removed from the list

### 6. Create TODO (Navigation)
- **Action**: Click a TODO item (or global area), then click "Create Todo"
- **Expected**:
  - Navigation occurs - form view appears
  - Form has a "Title" text field
  - Form has "Create Todo" button in actions

### 7. Form Submission
- **Action**: In the create form, type a title and click "Create Todo"
- **Expected**:
  - Navigation pops back to list view
  - New TODO appears in the list with the entered title
  - New TODO is uncompleted (circle icon)

### 8. Navigation Pop
- **Action**: Open create form, then use browser back or ESC
- **Expected**: Should return to list view (currently may need implementation)

## Keyboard Shortcuts

The following shortcuts are defined (may need browser event handling):
- **⌘N**: Create Todo
- **⌃X**: Delete Todo

## Architecture Verification

### React → Svelte Bridge
1. The TODO plugin (`src/plugins/todo.tsx`) is written in pure React
2. It uses the API package (`@svelte-react-render/api`) 
3. The PluginHost component renders it using a custom React reconciler
4. The reconciler creates Svelte component instances
5. ComponentRenderer maps these to actual Svelte UI components

### State Management
- React state (useState) in the plugin controls TODO data
- Form state is managed in ComponentRenderer
- Navigation stack is managed in PluginHost via the render bridge

### Navigation Flow
- Action.Push captures navigation context in React
- Calls bridge.pushNavigation() with target element
- PluginHost renders navigation stack as overlay
- useNavigation().pop() removes from stack

## Known Limitations (MVP)

1. Keyboard shortcuts are displayed but may not be active
2. Action panel positioning is centered (not context-aware)
3. No accessibility keyboard navigation for action panel
4. Limited icon set (using Unicode symbols)
5. Form validation not implemented
6. No persistence (todos reset on refresh)

## Success Criteria

✅ React plugin code works without any Svelte knowledge
✅ State updates in React trigger Svelte re-renders
✅ Navigation stack works (push/pop)
✅ Form submission flows correctly
✅ Actions trigger callbacks in React
✅ UI is rendered entirely with Svelte components

