// Example of user-land component registration
import Chip from '../lib/ui-components/Chip.svelte'
import { registerComponent } from '../lib/reconciler'

registerComponent({
  type: 'plugin-chip',
  svelteComponent: Chip,
  validateProps: (p: any) => typeof p?.label === 'string' && (!p?.variant || ['info','success','warning','danger'].includes(p.variant)),
  getPropsError: (p: any) => {
    if (typeof p?.label !== 'string') return 'Chip requires string "label" prop'
    if (p?.variant && !['info','success','warning','danger'].includes(p.variant)) return 'Chip "variant" must be info|success|warning|danger'
    return null
  },
  transformProps: (p: any) => ({ label: p.label ?? '', variant: p.variant ?? 'info' }),
  displayName: 'Chip'
})

