import ReactReconciler from 'react-reconciler';
import { hostConfig } from './host-config';
import { createRenderBridge, type SimpleRenderBridge } from './bridge';

const reconciler = ReactReconciler(hostConfig);

export function createRenderer(): SimpleRenderBridge & { _container?: any } {
  const bridge = createRenderBridge();
  return { ...bridge, _container: undefined };
}

export function render(element: React.ReactElement, bridgeWithContainer: SimpleRenderBridge & { _container?: any }): void {
  // Create container only once, reuse it for subsequent renders
  if (!bridgeWithContainer._container) {
    bridgeWithContainer._container = reconciler.createContainer(
      bridgeWithContainer,
      0, // tag
      null, // hydration callbacks
      false, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      '', // identifierPrefix
      () => {}, // onRecoverableError
      null // transitionCallbacks
    );
  }

  reconciler.updateContainer(element, bridgeWithContainer._container, null, () => {});
}

export { createRenderBridge };

