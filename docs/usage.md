# Usage

## Installation

```bash
git clone <repository-url>
cd functionality-generator
npm install
```

## Build

```bash
# Production bundle (dist/bundle.js)
npm run build

# Development server with live reload (port 3000)
npm run dev
```

The build produces a single IIFE bundle (`dist/bundle.js`) that can be loaded as a `<script>` tag on any page.

## Integration

The framework requires two things on the page before the bundle loads:

**1. Configuration object** — injected as a global:

```html
<script>
  window.__WWAI__ = {
    deployMode: "prod",          // "local" | "sandbox" | "prod"
    MODE: "prod",                // "dev" enables debug panel
    currency: "USD",
    CONNECTOR_TYPE: "shopify",
    RENDER_WITH_LIQUID: true,    // true = static product data, false = JS fetch
    WWAI_PRODUCT_GROUP_CONFIG: { /* per-section pricing, UX, flow configs */ },
    WWAI_PRODUCT_VARIANT_OVERRIDES: { /* per-variant custom media/labels */ },
    WWAI_LABELED_IMAGES: { /* custom image sets keyed by scope */ }
  };
</script>
```

**2. Product data** — embedded as JSON script tags:

```html
<script id="wwai-static-product-section-data" type="application/json">
  { "section-id": { "products": { "product-handle": { /* product object */ } } } }
</script>
```

**3. The bundle** — loaded after the above:

```html
<script src="dist/bundle.js"></script>
```

## Custom Elements

Add custom element attributes to your HTML. Each element must have `section_id` and `product_group` attributes to scope it to a reactive group.

```html
<div product-variant-selector section_id="main" product_group="default">
  <input type="radio" data-wwai-product-variant-option-type="product" data-wwai-product-label="my-product">
</div>

<div product-custom-price-selector section_id="main" product_group="default">
  <span data-wwai-product-price-label="price-1" data-wwai-slash-pricing-after></span>
</div>

<div product-custom-add-to-cart-button-selector section_id="main" product_group="default">
  <form>
    <input type="hidden" name="id">
    <button type="submit">
      <span data-wwai-add-to-cart-text>Add to Cart</span>
      <span data-wwai-sold-out-text style="display:none">Sold Out</span>
    </button>
  </form>
</div>
```

All interactive elements (price text, button text, sold-out text) must be pre-rendered in HTML. The framework toggles visibility — it does not inject elements.

## Deploy Modes

| Mode | Behavior |
|---|---|
| `local` | Form submission shows a popup with what would be added. No network calls. |
| `sandbox` | Strips subscription selling plans, shows warning, then submits. |
| `prod` | Full flow: calls `/cart/add.js`, applies discounts, triggers post-add journey. |

## Debug Mode

Set `MODE: "dev"` in the config to enable:
- DOM structure validation for all custom elements
- A collapsible side panel for viewing and live-editing configuration
- Console logging for variant changes and product group initialization
