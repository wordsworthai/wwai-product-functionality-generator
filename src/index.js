// Import all elements.
import "./elements/index.js";
import {
  initializeStaticProductDataAndConfigs, 
  enableFunctionalityDevMode,
  runDispatchAndInitProductGroups
} from "./init_helpers.js";
import { createWWAISidePanel } from "./config_side_panel/index.js";
import { applyWwaiActions } from "./config_side_panel/action_buttons/apply_actions.js";
import './config_side_panel/action_buttons/index.js';

// ✅ CRITICAL: Hydrate the static product data from JSON scripts FIRST, before ANY other initialization
// This must run before any other functions that might depend on this data
let staticProductDataAndConfigInitialized = false;
let dataInitStartTime = Date.now();
const MAX_DATA_INIT_WAIT = 5000; // 5 seconds max wait


// ✅ DEFINE THIS IMMEDIATELY - before any event listeners, useful for editors
// When we reload the config and want to rerun.
window.reinitializeFunctionality = () => {
  console.log("🔄 Reinitializing functionality with updated config...");
  
  // 1️⃣ Reinitialize static product data and configs
  initializeStaticProductDataAndConfigs();
  
  // 2️⃣ Re-run dispatch and init product groups
  runDispatchAndInitProductGroups();
  
  console.log("✅ Functionality reinitialized successfully");
};



// Run product data hydration immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeStaticProductDataAndConfigs();
    staticProductDataAndConfigInitialized = true;
  });
} else {
  initializeStaticProductDataAndConfigs();
  staticProductDataAndConfigInitialized = true;
}

window.addEventListener("DOMContentLoaded", () => {
  // ✅ Ensure product data is initialized even if DOMContentLoaded fires before our initialization
  if (!staticProductDataAndConfigInitialized) {
    console.log("🔄 DOMContentLoaded fired before data initialization, ensuring data is ready...");
    initializeStaticProductDataAndConfigs();
    staticProductDataAndConfigInitialized = true;
  }

  // ✅ Enable functionality debug mode
  enableFunctionalityDevMode();

  // ✅ Create the side panel
  createWWAISidePanel();
});

// ✅ Initialize Product Groups and Variant Configurations
window.runDispatch = runDispatchAndInitProductGroups;

window.__WWAI_HAS_DISPATCHED__ = window.__WWAI_HAS_DISPATCHED__ || false;

function safeRunDispatchOncePerPageView() {
  if (window.__WWAI_HAS_DISPATCHED__) return;
  
  // ✅ CRITICAL: Wait for product data to be initialized before running dispatch
  if (!staticProductDataAndConfigInitialized) {
    const waitTime = Date.now() - dataInitStartTime;
    
    if (waitTime > MAX_DATA_INIT_WAIT) {
      console.warn(`⚠️ Product data initialization timeout after ${waitTime}ms - proceeding with dispatch anyway`);
      staticProductDataAndConfigInitialized = true; // Force proceed
    } else {
      console.log(`⏳ Waiting for product data initialization (${waitTime}ms elapsed)...`);
      // Check again in a short interval
      setTimeout(safeRunDispatchOncePerPageView, 100);
      return;
    }
  }
  
  window.__WWAI_HAS_DISPATCHED__ = true;
  window.runDispatch();
  console.log("Applying actions");
  applyWwaiActions();
}

if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  safeRunDispatchOncePerPageView();
} else {
  document.addEventListener("DOMContentLoaded", safeRunDispatchOncePerPageView);
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    console.log("🔄 BFCache restore inside script");
    window.__WWAI_HAS_DISPATCHED__ = false;
    requestAnimationFrame(safeRunDispatchOncePerPageView);
  }
});

// Fallback polling
const fallbackInterval = setInterval(() => {
  if (window.__WWAI_HAS_DISPATCHED__) {
    clearInterval(fallbackInterval);
  } else if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    console.log("⏱️ Fallback Dispatch Triggered");
    clearInterval(fallbackInterval);
    safeRunDispatchOncePerPageView();
  }
}, 200);
