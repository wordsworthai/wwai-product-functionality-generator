function injectLoadingOverlayStyles() {
  // Prevent injecting styles multiple times
  if (document.getElementById('wwai-overlay-styles')) return;

  const styles = `
    /* White overlay */
    .overlay-spinner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }

    /* Positioning wrapper */
    product-media-gallery-for-grids {
      position: relative;
    }
  `;

  const keyframes = `
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.id = 'wwai-overlay-styles';
  styleSheet.innerText = styles + keyframes;
  document.head.appendChild(styleSheet);
}

/**
 * Shows a loading overlay with a spinner inside a product-media-gallery-for-grids
 */
function showLoadingOverlayOnProductMediaGallery(sectionId, productGroup) {
  injectLoadingOverlayStyles();

  const productMediaGallery = document.querySelector(
    `product-media-gallery-for-grids[section_id="${sectionId}"][product_group="${productGroup}"]`
  );

  if (!productMediaGallery) {
    console.error("WWAI-ERROR ❌ product-media-gallery-for-grids not found for", sectionId, productGroup);
    return;
  }

  // Prevent duplicate overlays
  if (productMediaGallery.querySelector(`.overlay-spinner[data-overlay-id="${sectionId}__${productGroup}"]`)) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'overlay-spinner';
  overlay.setAttribute('data-overlay-id', `${sectionId}__${productGroup}`);

  // Inline spinner with full styling to avoid CSS override issues
  overlay.innerHTML = `
    <div style="
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-top-color: #333;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: block;
    "></div>
  `;

  productMediaGallery.appendChild(overlay);
}

/**
 * Hides the loading overlay for the given section and product group
 */
function hideLoadingOverlayOnProductMediaGallery(sectionId, productGroup, suppressWarning = false) {
  const overlay = document.querySelector(
    `.overlay-spinner[data-overlay-id="${sectionId}__${productGroup}"]`
  );

  if (overlay) {
    overlay.remove();
    console.log(`✅ Overlay removed for ${sectionId} / ${productGroup}`);
  } else if (!suppressWarning) {
    console.warn(`⚠️ No overlay found for ${sectionId} / ${productGroup}`);
  }
}


function showLoadingOverlayOnAddtoCartSubmitButton(sectionId, productGroup) {
  const productCustomSubmitInterceptors = document.querySelectorAll(
    `product-custom-submit-interceptor[section_id="${sectionId}"][product_group="${productGroup}"]`
  );

  if (!productCustomSubmitInterceptors || productCustomSubmitInterceptors.length === 0) {
    console.error("WWAI-ERROR ❌ product-custom-submit-interceptor not found for", sectionId, productGroup);
    return;
  }

  productCustomSubmitInterceptors.forEach((interceptor) => {
    interceptor.submitButton?.classList.add("loading");
  });

  console.log(`✅ Loading state added to ${productCustomSubmitInterceptors.length} submit interceptors for [${sectionId} / ${productGroup}]`);
}

function hideLoadingOverlayOnAddtoCartSubmitButton(sectionId, productGroup, suppressWarning = false) {
  const productCustomSubmitInterceptors = document.querySelectorAll(
    `product-custom-submit-interceptor[section_id="${sectionId}"][product_group="${productGroup}"]`
  );

  if (!productCustomSubmitInterceptors || productCustomSubmitInterceptors.length === 0) {
    if (!suppressWarning) {
      console.error("WWAI-ERROR ❌ product-custom-submit-interceptor not found for", sectionId, productGroup);
    }
    return;
  }

  productCustomSubmitInterceptors.forEach((interceptor) => {
    interceptor.submitButton?.classList.remove("loading");
  });

  console.log(`✅ Loading state removed from ${productCustomSubmitInterceptors.length} submit interceptors for [${sectionId} / ${productGroup}]`);
}


export function addLoadingOverlay(sectionId, productGroup, overlay_type) {
  switch (overlay_type) {
    case 'none':
      break;

    case 'media-gallery':
      showLoadingOverlayOnProductMediaGallery(sectionId, productGroup);
      break;

    case 'add-to-cart-submit-button':
      showLoadingOverlayOnAddtoCartSubmitButton(sectionId, productGroup);
      break;

    default:
      console.warn(`⚠️ Unknown overlay_type "${overlay_type}" passed to addLoadingOverlay`);
  }
}

export function removeLoadingOverlay(sectionId, productGroup, overlay_type, suppressWarning = false) {
  switch (overlay_type) {
    case 'none':
      break;

    case 'media-gallery':
      hideLoadingOverlayOnProductMediaGallery(sectionId, productGroup, suppressWarning);
      break;

    case 'add-to-cart-submit-button':
      hideLoadingOverlayOnAddtoCartSubmitButton(sectionId, productGroup, suppressWarning);
      break;

    default:
      console.warn(`⚠️ Unknown overlay_type "${overlay_type}" passed to removeLoadingOverlay`);
  }
}


function cleanUpAllLoadingOverlaysFromDOM() {
  const elements = document.querySelectorAll('product-variant-selector');
  const seen = new Set();

  elements.forEach((el) => {
    const sectionId = el.getAttribute('section_id');
    const productGroup = el.getAttribute('product_group');

    // Avoid duplicates if same combo exists more than once
    const key = `${sectionId}::${productGroup}`;
    if (seen.has(key)) return;
    seen.add(key);

    // Run cleanup for all supported loader types
    // Suppress warnings during bfcache cleanup
    removeLoadingOverlay(sectionId, productGroup, 'media-gallery', true);
    removeLoadingOverlay(sectionId, productGroup, 'add-to-cart-submit-button', true);
  });
}


export function initLoaderCleanupListeners() {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.log("🔁 Page restored from bfcache — cleaning up loaders...");
      cleanUpAllLoadingOverlaysFromDOM();
    } else {
      console.log("✅ Page shown normally (not from bfcache).");
    }
  });

  window.addEventListener('load', () => {
    console.log("📦 Full page load — running loader cleanup just in case...");
    cleanUpAllLoadingOverlaysFromDOM();
  });
}