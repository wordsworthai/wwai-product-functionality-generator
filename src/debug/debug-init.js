import { ELEMENT_CLASS_REGISTRY } from '../elements/element-class-registry.js';

export function enableAllDebugging(registry) {
    Object.entries(registry).forEach(([selector, debugFn]) => {
        document.querySelectorAll(selector).forEach(el => {
        debugFn(el);
        });
    });
}
  
export function enableDebugFor(selectorTag, registry) {
    const fn = registry[selectorTag];
    if (!fn) {
        console.warn(`[WWAI] No debug function registered for selector: ${selectorTag}`);
        return;
    }

    document.querySelectorAll(selectorTag).forEach(el => {
        fn(el);
    });
}

export function validateAllElementInstances() {
  Object.entries(ELEMENT_CLASS_REGISTRY).forEach(([tag, expectedClass]) => {
    document.querySelectorAll(tag).forEach(el => {
      if (!(el instanceof expectedClass)) {
        console.warn(`[WWAI] Element <${tag}> is NOT an instance of its expected class.`);
      } else {
        ;
      }
    });
  });
}
