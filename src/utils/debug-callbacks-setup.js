const debugCallbacks = [];

export function setupFunctionalityDebugToggle(applyDebugFn) {
  debugCallbacks.push(applyDebugFn);

  if (!window._hasFunctionalityDebugToggleSetup) {
    let firstSet = true;

    Object.defineProperty(window, 'FUNCTIONALITY_DEBUG_MODE', {
      set(value) {
        this._FUNCTIONALITY_DEBUG_MODE = value;
        console.log(`FUNCTIONALITY_DEBUG_MODE set to: ${value}`);
        debugCallbacks.forEach(fn => fn(value, { isFirstSet: firstSet }));
        firstSet = false;
      },
      get() {
        return this._FUNCTIONALITY_DEBUG_MODE;
      },
      configurable: true
    });

    window._hasFunctionalityDebugToggleSetup = true;
  }
}