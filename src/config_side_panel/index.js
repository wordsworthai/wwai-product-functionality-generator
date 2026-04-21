import { getWWAIConfig } from "../wwai_config.js";
import { createToggleButton, createPanelStyles } from "./config_panel_main_elements.js";
import { createPanelContent } from "./tabs/tab_content.js";
import { setupTabNavigation } from "./tabs/tab_navigation.js";
import { setupSaveButton } from "./save/save_btn.js";
import { updateAndSaveCompleteConfig, getConfigDiff, getAllConfigs } from "./config_manager.js";
import { printAllSelectorsWithSectionIdsAndProductGroups } from "./debug/debug_elements.js";

function extractConfigData() {
  const {
    JS_PRODUCT_MAPPING_OBJECT,
    WWAI_PRODUCT_GROUP_CONFIG,
    WWAI_PRODUCT_VARIANT_OVERRIDES,
    WWAI_LABELED_IMAGES,
    ...filteredConfig
  } = getWWAIConfig() || {};
  
  return {
    JS_PRODUCT_MAPPING_OBJECT,
    WWAI_PRODUCT_GROUP_CONFIG,
    WWAI_PRODUCT_VARIANT_OVERRIDES,
    WWAI_LABELED_IMAGES,
    filteredConfig
  };
}

function insertPanelOpenBtnInDom() {

  function setupPanelEventListeners(panel) {
    panel.querySelector("#wwai-close-btn").onclick = () => panel.remove();
    setupTabNavigation(panel);
    setupSaveButton(panel, updateAndSaveCompleteConfig, getConfigDiff, getAllConfigs);
    
    // Setup button highlighting toggle for action buttons.
    const toggle = panel.querySelector("#wwai-button-highlight-toggle");
    const statusSpan = panel.querySelector("#wwai-highlight-status");
    
    if (toggle && statusSpan) {
      // Set initial state
      toggle.checked = window.wwaiIsButtonHighlightingActive ? window.wwaiIsButtonHighlightingActive() : false;
      updateHighlightStatus(statusSpan, toggle.checked);
      
      // Add event listener
      toggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        if (window.wwaiToggleButtonHighlighting) {
          window.wwaiToggleButtonHighlighting(isEnabled);
          updateHighlightStatus(statusSpan, isEnabled);
        }
      });
    }
  }
  
  function updateHighlightStatus(statusSpan, isEnabled) {
    if (statusSpan) {
      statusSpan.textContent = isEnabled ? "🟢 Active" : "⚪ Inactive";
      statusSpan.style.color = isEnabled ? "#28a745" : "#666";
    }
  }

  function createBottomLeftButton() {
    const button = document.createElement("button");
    button.textContent = "Debug Button";
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 10000;
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    button.onclick = () => {
      printAllSelectorsWithSectionIdsAndProductGroups();
    };
    
    return button;
  }

  function openConfigPanel() {
    if (document.getElementById("wwai-config-side-panel")) return;

    const panel = document.createElement("div");
    panel.id = "wwai-config-side-panel";
    Object.assign(panel.style, createPanelStyles());

    const configData = extractConfigData();
    panel.innerHTML = createPanelContent(configData);

    setupPanelEventListeners(panel);
    document.body.appendChild(panel);
  }

  if (!document.getElementById("wwai-toggle-panel-button")) {
    const toggleButton = createToggleButton();
    toggleButton.onclick = () => openConfigPanel();
    document.body.appendChild(toggleButton);
  }
  
  // Add bottom left button
  if (!document.getElementById("wwai-bottom-left-button")) {
    const bottomLeftButton = createBottomLeftButton();
    bottomLeftButton.id = "wwai-bottom-left-button";
    document.body.appendChild(bottomLeftButton);
  }
}

export function createWWAISidePanel() {
  if (window.__WWAI__.MODE === "dev") {
    insertPanelOpenBtnInDom();
  }
}