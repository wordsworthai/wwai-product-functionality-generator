# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build (produces dist/bundle.js)
npm run build

# Development server with live reload (port 3000)
npm run dev
```

No linting or test infrastructure is configured. The build uses Rollup with Babel and Terser for minification.

## Architecture

**Functionality Generator** is a vanilla JavaScript framework that injects dynamic e-commerce behavior (variant selection, pricing, subscriptions, cart) into Shopify product pages via custom web components. It compiles to a single IIFE bundle (`dist/bundle.js`) loaded as a script tag.

### Initialization Flow

```
Page Load
  → Hydrate static product data from JSON scripts in DOM
  → Validate window.__WWAI__ config (currency, connector, product mappings)
  → Enable debug mode (if configured)
  → DOMContentLoaded:
      → Build product group registry (from variant selector elements)
      → Async fetch product objects (Shopify API or custom connector)
      → Initialize each product group
      → Each element wires itself via section_id + product_group attributes
```

### Scoping System

Every element is scoped by two DOM attributes: `section_id` and `product_group`. These two values uniquely identify which set of elements act together on a page. Elements find their siblings via these attributes and communicate via custom DOM events.

### Custom Elements

18 custom web components in `src/elements/`, all extending `WWAIBaseProductElement` (`src/elements/base-product-element.js`). The base class extracts `section_id`/`product_group` from attributes and provides config initializers for pricing, flow, and UX configs.

Key elements:
- `product-variant-selector` — core controller for variant option tracking
- `product-custom-price-selector` — dynamic pricing and discount display
- `product-custom-add-to-cart-button-selector` / `product-custom-submit-interceptor` — cart form wrapping and submission interception
- `product-purchase-type-selector` / `product-subscription-frequency-selector` — subscription handling
- `product-custom-carousel-media-selector` — image carousel with variant sync
- `product-grid-smart-interaction-button-selector` / `product-custom-collection-options-overlay-selector` — collection page interactions

### Global Window API

| Property | Purpose |
|---|---|
| `window.__WWAI__` | Global config object (validated at init) |
| `window.reinitializeFunctionality()` | Re-run initialization after config changes |
| `window.runDispatch` | Manually trigger product group dispatch |
| `window.__WWAI_HAS_DISPATCHED__` | Guard flag preventing double-dispatch |
| `window.FUNCTIONALITY_DEBUG_MODE` | Enables debug panel and logging |

### Key Directories

- `src/elements/` — custom web component implementations
- `src/elements/journey_helpers/` — cart, discount, redirect, side-cart utilities
- `src/product_group/` — product group registry and initialization
- `src/utils/` — product data fetching, DOM querying, connection helpers
- `src/constants/` — selector names and element attribute constants
- `src/config_side_panel/` — developer debug panel (tabs for config view/edit)
- `src/debug/` — debug mode setup and element validation callbacks
- `src/elements_validator/` — validates DOM structure of elements at init
- `html_tests/` — standalone HTML files for local browser testing
- `docs/` — public docs (`architecture.md`, `usage.md`)
- `docs/internal/docs/` — detailed per-selector and per-config reference docs (gitignored)
