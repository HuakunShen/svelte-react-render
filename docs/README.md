# Documentation

This directory contains design documents and architectural proposals for the React-Universal plugin system.

## Architecture Documents

### [Framework-Agnostic API](./framework-agnostic-api.md)
**Goal**: Create a universal React plugin API that works across any frontend framework - Svelte, Vue, Angular, React, and even native platforms like Swift AppKit.

**Key Insight**: The current architecture is already 95% framework-agnostic! The React reconciler outputs a plain component tree (JSON), which any framework can consume and render natively.

**Status**: ✅ Feasible - Minimal refactoring needed

### [Component Registry System](./component-registry-system.md)
**Goal**: Create a Svelte library that allows any Svelte app to register custom components, enabling React plugins to render using the host's components.

**Key Insight**: This enables a plugin marketplace where plugin developers write React code once, and host developers provide their own UI implementations. Same plugin, different designs across different apps.

**Status**: ✅ Highly Feasible - ~2 days implementation

## Vision Summary

These two documents work together to enable a revolutionary plugin ecosystem:

```
┌─────────────────────────────────────────────────────┐
│                Plugin Developer                      │
│         (Writes React code once)                     │
│                                                       │
│  import { Chart, Button } from '@universal/api'      │
└─────────────────────────────────────────────────────┘
                        ↓
                  (via reconciler)
                        ↓
┌─────────────────────────────────────────────────────┐
│              Component Tree (JSON)                   │
│         (Framework-agnostic data)                    │
└─────────────────────────────────────────────────────┘
                        ↓
              (consumed by any framework)
                        ↓
┌─────────────────────────────────────────────────────┐
│  Svelte Host A    Vue Host B    AppKit Host C       │
│  (Custom Chart)   (Custom Chart)  (Native Chart)    │
│                                                       │
│  registry.register('Chart', MyChart)                 │
└─────────────────────────────────────────────────────┘
```

## Benefits

### Write Once, Run Anywhere
- Plugin developers write React code
- Works on Svelte, Vue, Angular, React, AppKit
- No framework-specific code needed

### Host Control
- Hosts define their own UI implementations
- Brand consistency across plugins
- Platform-specific optimizations

### Ecosystem Growth
- Plugin marketplace potential
- Network effects (more plugins → more value)
- Similar to Raycast, Figma, VS Code

## Technical Feasibility

Both designs are **highly feasible**:

| Aspect | Framework-Agnostic API | Component Registry |
|--------|----------------------|-------------------|
| Code Completion | 95% | 90% |
| Implementation Time | 1 week | 2 days |
| Breaking Changes | Minimal | None |
| Risk Level | Low | Low |
| Market Impact | High | High |

## Next Steps

1. **Validate with prototype** - Build Vue adapter to prove pattern
2. **Build registry system** - Implement in current Svelte codebase
3. **Create examples** - Show multiple hosts using same plugins
4. **Documentation site** - Comprehensive guides for both audiences
5. **Community feedback** - Share with early adopters
6. **Publish packages** - Make available on npm

## Real-World Examples

This pattern is proven by successful projects:

- **Raycast** ($400M+ valuation) - React → AppKit
- **React Native** - React → iOS/Android
- **Figma Plugins** - React → Canvas
- **VS Code** - Extension API with custom renderers

## Questions?

For technical discussions or to contribute, see:
- [Main README](../README.md)
- [Architecture Docs](../DUAL_MODE_ARCHITECTURE.md)
- [Development Journal](../.journal/)

