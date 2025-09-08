import ChipPlugin from './ChipPlugin'
import type { PluginModule } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

export default ChipPlugin

export const metadata = {
  id: 'chip-plugin',
  name: 'Chip Showcase',
  version: '1.0.0',
  description: 'Demonstrates a user-registered custom component (plugin-chip)',
  author: 'Plugin System Example',
  apiVersion: '1.0.0'
}

const chipPluginModule: PluginModule = {
  default: ChipPlugin,
  metadata
}

export { chipPluginModule }

