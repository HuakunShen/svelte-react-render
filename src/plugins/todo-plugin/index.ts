import TodoPlugin from './TodoPlugin'
import type { PluginModule } from '../../../specs/001-react-plugin-system/contracts/plugin-api'

export default TodoPlugin

export const metadata = {
  id: 'todo-plugin',
  name: 'TODO List',
  version: '1.0.0',
  description: 'Simple todo list with add, toggle, and clear functionality',
  author: 'Plugin System Example',
  apiVersion: '1.0.0'
}

// Export as PluginModule for type safety
const todoPluginModule: PluginModule = {
  default: TodoPlugin,
  metadata
}

export { todoPluginModule }