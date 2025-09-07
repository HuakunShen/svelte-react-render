import SettingsPlugin from './SettingsPlugin'
import type { PluginModule } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

export default SettingsPlugin

export const metadata = {
  id: 'settings-plugin',
  name: 'Settings Panel',
  version: '1.0.0',
  description: 'Demo plugin using toggle, badge, and divider components',
  author: 'Plugin System Example',
  apiVersion: '1.0.0'
}

const settingsPluginModule: PluginModule = {
  default: SettingsPlugin,
  metadata
}

export { settingsPluginModule }

