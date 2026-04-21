import {generateLiquidProductMappingStr} from '../../utils/product-object-connection-utils';
import {getMergedProductGroupsAcrossSections, getProductLoadFlags} from '../../utils/product-object-connection-utils.js';
import {generateProductGroupConfig} from '../../utils/helper_configs/base-product-config-creation-helper.js';
import {generateProductVariantOverrides} from '../../utils/helper_configs/base-product-variant-config-creation-helper.js';
import { extractAllCarouselMediaData } from '../../utils/helper_configs/fetch-image-carousel-images-helper.js';

function showVariantConfigPopupUIHelper(contentMap, autoOpen) {
  // ✅ Inject popup HTML only once
  if (!document.getElementById('variantDevPopup')) {
    const style = document.createElement('style');
    style.textContent = `
      #variantDevButton {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 10000;
        background: #111;
        color: white;
        padding: 8px 12px;
        font-size: 13px;
        border: 1px solid #666;
        cursor: pointer;
        border-radius: 4px;
      }
      #variantDevPopup {
        position: fixed;
        top: 60px;
        right: 12px;
        width: 600px;
        max-height: 80vh;
        overflow: auto;
        background: #1e1e1e;
        color: #eee;
        padding: 16px;
        z-index: 9999;
        border: 1px solid #555;
        font-family: monospace;
        display: none;
      }
      #variantDevPopup pre {
        white-space: pre-wrap;
        background: #222;
        padding: 12px;
        overflow-x: auto;
        margin: 12px 0 0;
      }
      #variantDevPopup .control-buttons {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      #variantDevPopup button {
        padding: 6px 12px;
        background: #444;
        color: white;
        border: none;
        cursor: pointer;
      }
      #variantDevPopup button.active {
        background: #666;
      }
    `;
    document.head.appendChild(style);

    // Floating trigger button
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'variantDevButton';
    triggerBtn.textContent = 'PDP Config';
    triggerBtn.onclick = () => {
      const popup = document.getElementById('variantDevPopup');
      popup.style.display = 'block';
    };
    document.body.appendChild(triggerBtn);

    // Popup container
    const popup = document.createElement('div');
    popup.id = 'variantDevPopup';

    const controls = document.createElement('div');
    controls.className = 'control-buttons';

    const pre = document.createElement('pre');
    pre.id = 'variantDevOutputBlock';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(pre.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => popup.style.display = 'none';

    // Button definitions
    const buttons = ['Liquid Integration', 'JS Config'];
    const buttonMap = {};

    buttons.forEach((label) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.onclick = () => {
        Object.values(buttonMap).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        pre.textContent = contentMap[label];
      };
      controls.appendChild(btn);
      buttonMap[label] = btn;
    });

    popup.appendChild(controls);
    popup.appendChild(copyBtn);
    popup.appendChild(closeBtn);
    popup.appendChild(pre);
    document.body.appendChild(popup);
  }

  // ✅ Set default content
  setTimeout(() => {
    const pre = document.getElementById('variantDevOutputBlock');
    const firstBtn = document.querySelector('#variantDevPopup .control-buttons button');
    if (firstBtn) {
      firstBtn.click(); // show first block
    }
    if (autoOpen) {
      document.getElementById('variantDevPopup').style.display = 'block';
    }
  }, 0);
}

export function showVariantConfigPopupUI(
  liquid_loaded,
  js_loaded,
  variant_section_data,
  variant_override_data,
  labeled_images,
  autoOpen = false
) {
  const liquid_integration = generateFullIntegrationLiquidString(liquid_loaded);
  const js_integration = generateFullIntegrationConfigString(js_loaded, variant_section_data, variant_override_data, labeled_images);

  const contentMap = {
    'Liquid Integration': liquid_integration,
    'JS Config': js_integration,
  };
  
  showVariantConfigPopupUIHelper(contentMap, autoOpen);
}

export function triggerProductIntegrationWithVariantDebugPopup(renderWithLiquid) {
  const {
    merged,
    liquid_loaded,
    js_loaded
  } = getMergedProductGroupsAcrossSections(renderWithLiquid);

  const variant_section_data = generateProductGroupConfig();
  const variant_override_data = generateProductVariantOverrides();
  const labeled_images = extractAllCarouselMediaData();
  showVariantConfigPopupUI(liquid_loaded, js_loaded, variant_section_data, variant_override_data, labeled_images);
}

export function cleanupVariantDebugPopupUI() {
  const popup = document.getElementById('variantDevPopup');
  const triggerBtn = document.getElementById('variantDevButton');

  if (popup) {
    popup.remove();
    console.log("🧹 Removed #variantDevPopup");
  }

  if (triggerBtn) {
    triggerBtn.remove();
    console.log("🧹 Removed #variantDevButton");
  }
}

export function generateFullIntegrationConfigString(
  js_loaded,
  variant_section_data,
  variant_override_data,
  labeled_images,
  use_labeled_images_default = true
) {
  return `window.__WWAI__ = window.__WWAI__ || {};
  
// Environment + Mode Config
// Use metafield-based subscription in sandbox/local
window.__WWAI__.useMockSubscription = true;

// Options: "local" | "sandbox" | "prod"
window.__WWAI__.deployMode = "local";

// Enables dev/debugger mode, values are dev, prod
window.__WWAI__.MODE = "dev";

// Controls Liquid-product rendering
window.__WWAI__.RENDER_WITH_LIQUID = true;

// Which connector to use for hydration
window.__WWAI__.CONNECTOR_TYPE = "shopify";

// Enable logging for grid height debugging
window.__WWAI__.heightEqualizeLogging = true;

// Currency Config
// Active currency from Shopify
window.__WWAI__.CURRENCY = Shopify.currency.active;

// Currency conversion factor
window.__WWAI__.CURRENCY_FACTOR = 0.01;

// Product mapping object
window.__WWAI__.JS_PRODUCT_MAPPING_OBJECT = ${JSON.stringify(js_loaded, null, 2)};

// Product group config
window.__WWAI__.WWAI_PRODUCT_GROUP_CONFIG = ${JSON.stringify(variant_section_data, null, 2)};

// Variant overrides
window.__WWAI__.WWAI_PRODUCT_VARIANT_OVERRIDES = ${JSON.stringify(variant_override_data, null, 2)};

// Labeled images
window.__WWAI__.WWAI_LABELED_IMAGES = ${use_labeled_images_default ? "{}" : JSON.stringify(labeled_images, null, 2)};

// Action buttons
window.__WWAI__.ACTION_BUTTONS = {};
`;
}

export function generateFullIntegrationLiquidString(liquid_loaded){
  const liquid_integration = generateLiquidProductMappingStr(liquid_loaded);

  return `
    ${liquid_integration}
  `;
}


export function generateFullIntegrationLiquidStringDepr(liquid_loaded){
  const liquid_integration = generateLiquidProductMappingStr(liquid_loaded);

  return `<!-- WWAI_PRODUCT_CONNECTOR: Start -->
{% if all_products != blank %}
    ${liquid_integration}

    {% render 'liquid_static_product_connection_json',
      product_mapping_str: product_mapping_str,
      use_mock_subscription: true
    %}
  
    <script src="{{ 'pdp_connect.js' | asset_url }}"></script>  
    <script src="{{ 'functionality-generator.js' | asset_url }}" defer></script>
{% endif %}
<!-- WWAI_PRODUCT_CONNECTOR: End -->
  
{% schema %}
  {
    "name": "Empty Section",
    "class": "empty-section",
    "settings": [],
    "blocks": [],
    "presets": [
      {
        "name": "Default",
        "category": "Custom"
      }
    ]
  }
{% endschema %}`;
}
