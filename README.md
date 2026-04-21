# WWAI Product Functionality Generator

A vanilla JavaScript framework that converts static HTML into dynamic, functionality-ready e-commerce product pages via JS annotations.

Instead of writing custom JavaScript for each product page, you declare behavior through HTML attributes and a JSON config object. The framework wires everything together — variant selection, dynamic pricing, add-to-cart flows, subscriptions, media carousels — at runtime.

## What It Does

- **Variant selection** — radio-based product and variant switching with automatic state propagation
- **Dynamic pricing** — real-time price, compare-at, discount percentage, and savings display
- **Add-to-cart interception** — form submission handling with support for one-time and subscription purchases
- **Media carousels** — variant-aware image/media switching
- **Collection grid support** — smart interaction buttons, variant overlays, height equalization
- **Virtual bundles** — multi-product bundle cart payloads
- **Debug tooling** — built-in config panel, DOM validation, and logging for development

The framework is product-source-agnostic. It ships with a Shopify connector but works with any source that provides product data in the same structure.

## Quick Start

```bash
npm install
npm run build   # produces dist/bundle.js
```

Load the bundle on your page:

```html
<script>
  window.__WWAI__ = {
    deployMode: "prod",
    MODE: "prod",
    currency: "USD",
    CONNECTOR_TYPE: "shopify",
    RENDER_WITH_LIQUID: true,
    WWAI_PRODUCT_GROUP_CONFIG: { /* ... */ },
    WWAI_PRODUCT_VARIANT_OVERRIDES: {},
    WWAI_LABELED_IMAGES: {}
  };
</script>
<script src="dist/bundle.js"></script>
```

For development with live reload:

```bash
npm run dev   # serves on port 3000
```

## Documentation

- [Architecture](docs/architecture.md) — system design, pipeline, key abstractions
- [Usage](docs/usage.md) — integration guide, custom elements, configuration reference

## License

MIT — see [LICENSE](./LICENSE).
