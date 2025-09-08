## Component Registry (building toward a TS library)

This POC exposes a runtime Component Registry so consumers can register their own Svelte components and render them from React via custom element names.

- Import API: `import { registerComponent } from './src/lib/reconciler'`
- Register at app startup (before rendering React trees):

```ts
// src/custom/register-user-components.ts
import { registerComponent } from '../lib/reconciler'
import MyChip from '../lib/ui-components/Chip.svelte' // or your own Svelte component

registerComponent({
  type: 'plugin-chip',
  svelteComponent: MyChip,
  validateProps: (p) => typeof p?.label === 'string',
  transformProps: (p) => ({ label: p.label ?? '' }),
  displayName: 'Chip'
})
```

- Use from React plugin code:

```tsx
export default function Example() {
  return (
    <>
      <plugin-chip label="Beta" />
      <plugin-divider spacing="sm" />
      <plugin-button label="OK" onClick={() => {}} />
    </>
  )
}
```

See working example in this repo:
- Registration: `src/custom/register-user-components.ts`
- React plugin: `src/plugins/chip-plugin/`

## Library API

Import from the package entry (re-exports at `src/index.ts`):

```ts
import { registerComponent, PluginRegistry, PluginContainer, ReconcilerFactory } from 'svelte-react-render'
```

Key API surface:
- `registerComponent({ type, svelteComponent, validateProps?, transformProps?, getPropsError? })`
- `PluginRegistry` for loading/registering plugins
- `PluginContainer` Svelte component to render a plugin by `pluginId`
- `ReconcilerFactory` if you need manual control over React rendering

Package exports/types (for development) point to `src/index.ts`. For publishing, configure a proper build that emits JS and type declarations, then map `exports` to built files.
