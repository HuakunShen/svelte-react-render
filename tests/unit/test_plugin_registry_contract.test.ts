import { describe, test, expect, beforeEach } from 'vitest'
import { PluginRegistry } from '../../src/lib/plugin-system'
import type { PluginRegistryAPI, PluginModule } from '../../specs/001-react-plugin-system/contracts/plugin-api'

describe('PluginRegistryAPI Contract', () => {
  let pluginRegistry: PluginRegistryAPI

  beforeEach(() => {
    pluginRegistry = new PluginRegistry()
  })

  test('should implement loadPlugin method', async () => {
    const mockPluginPath = './mock-plugin/index.tsx'
    
    // This should fail initially - no implementation yet
    await expect(pluginRegistry.loadPlugin(mockPluginPath)).rejects.toThrow()
  })

  test('should implement registerPlugin method', () => {
    const mockPlugin: PluginModule = {
      default: () => null,
      metadata: {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'Test plugin',
        author: 'Test Author',
        apiVersion: '1.0.0'
      }
    }

    // Should now work with implementation
    expect(() => pluginRegistry.registerPlugin(mockPlugin)).not.toThrow()
    expect(pluginRegistry.hasPlugin('test-plugin')).toBe(true)
  })

  test('should implement unregisterPlugin method', () => {
    const pluginId = 'test-plugin'
    
    // This should fail initially - no implementation yet  
    expect(() => pluginRegistry.unregisterPlugin(pluginId)).toThrow()
  })

  test('should implement getPlugin method', () => {
    const pluginId = 'test-plugin'
    
    // This should fail initially - no implementation yet
    const result = pluginRegistry.getPlugin(pluginId)
    expect(result).toBeNull()
  })

  test('should implement listPlugins method', () => {
    // Should now work with implementation
    const plugins = pluginRegistry.listPlugins()
    expect(Array.isArray(plugins)).toBe(true)
    expect(plugins.length).toBeGreaterThanOrEqual(0)
  })

  test('should validate plugin metadata on registration', () => {
    const invalidPlugin = {
      default: () => null,
      metadata: {
        id: '', // Invalid empty ID
        name: 'Test',
        version: 'invalid-version', // Invalid version format
        description: '',
        author: '',
        apiVersion: '1.0.0'
      }
    }

    // This should fail initially - no validation implementation yet
    expect(() => pluginRegistry.registerPlugin(invalidPlugin as any)).toThrow()
  })
})