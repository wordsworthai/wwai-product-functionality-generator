# Architecture

## System Overview

**Functionality Generator** is a vanilla JavaScript framework that injects dynamic e-commerce behavior into product pages using browser-native custom web components. It takes a JSON configuration object and a set of custom HTML elements in the page, and makes them reactive — automatically updating prices, images, variant availability, and cart forms when a customer interacts with product options.

The framework is product-source-agnostic: it currently connects to Shopify's product object structure, but any source that provides product data in the same shape will work.

## Pipeline

```
Page Load
  → Hydrate product data from embedded JSON scripts
  → Validate configuration (window.__WWAI__)
  → [Dev mode: validate elements, inject debug panel]
  → Scan DOM → Build product group registry
  → Fetch product data (static embedded or JS API)
  → Validate variant selector ↔ product data connection
  → Initialize each product group (resolve config, prices, availability)
  → Update all UI elements per group
  → Equalize grid card heights

User Interaction (event-driven, post-init):
  Variant changed   → re-init product group → update all elements
  Purchase type changed → update selling plan + prices
  Add to Cart clicked → intercept form → route by deploy mode → cart API → post-add journey
```

## Key Modules

| Module | Responsibility |
|---|---|
| `src/index.js` | Bootstrap and lifecycle. Sequences init phases, guards against double-dispatch, handles BFCache (back button). |
| `src/init_helpers.js` | Three-phase init orchestrator: data hydration, dev mode setup, product group discovery. |
| `src/wwai_config.js` | Validates the `window.__WWAI__` config object before anything runs. |
| `src/product_group/registry.js` | Scans the DOM for all custom elements, groups them by `section_id + product_group`, builds an in-memory registry for O(1) lookup. |
| `src/product_group/init_product_group.js` | Per-group initialization: resolves product data, applies discounts, routes to correct UI update strategy based on scope. |
| `src/elements/base-product-element.js` | Base class all custom elements extend. Extracts scoping attributes, provides config init methods. |
| `src/elements/product-variant-selector.js` | Core controller. Manages variant radio groups, dispatches `variantChange` events. |
| `src/elements/product-custom-submit-interceptor.js` | Intercepts form submission, assembles line items, routes by deploy mode (local/sandbox/prod). |
| `src/utils/product-fetch/product-object-fetch.js` | Orchestrates product data loading — static (embedded JSON) and dynamic (API fetch). |
| `src/elements/journey_helpers/add_to_cart_utils.js` | Post-add-to-cart orchestration: loader, cart API call, post-add journey (redirect, side cart, notification). |
| `src/constants/selector-constants.js` | Single source of truth for all custom element selector names. |
| `src/elements_validator/` | Validates DOM structure of elements at init time. Catches config errors early. |

## Key Abstractions

| Name | What it is |
|---|---|
| **`section_id` + `product_group` scoping** | Two DOM attributes on every custom element that group elements into independent reactive units. A page can have many groups; variant changes in one never affect another. Registry key format: `sectionId__productGroup`. |
| **`WWAIBaseProductElement`** | Base class (`extends HTMLElement`) all 19 custom elements inherit from. Extracts scoping attributes, provides `initPricingConfig`, `initFlowConfig`, `initUXConfig` methods. |
| **`PRODUCT_GROUP_REGISTRY`** | In-memory object built by scanning the DOM. Keyed by `sectionId__productGroup`, values contain all element references grouped by selector name. Built once, read on every variant change. |
| **`window.__WWAI__`** | Global config object injected server-side (e.g., via Liquid). Contains deploy mode, currency, product mappings, group-level configs, variant overrides. Validated at startup. |
| **`window.__WWAI__SECTION_PRODUCT_DATA__`** | Live product data store. Elements never call the product API directly — they read from this store. Populated by static hydration and/or JS fetch. |
| **`wwai-scope`** | Attribute on variant selector (`"pdp"`, `"collection"`, `"virtual_bundle"`) that controls which UI update strategy runs — same elements, different behavior per page context. |
| **`deployMode`** | `"local"` / `"sandbox"` / `"prod"` — controls how form submission is handled: mock popup, sanitized submit, or full cart API flow. |
| **Three-tier config** | (1) Product mapping: group → handle(s). (2) Group config: pricing, UX, flow, default selections per section. (3) Variant overrides: per-variant custom media, labels, carousel index. |

## Data Flow

| Phase | Input | Output |
|---|---|---|
| Hydration | `<script>` tags with JSON in HTML | `window.__WWAI__SECTION_PRODUCT_DATA__` (product store), `window.__WWAI__LIQUID_STATIC_PRODUCT_MAPPING_ARRAY__` |
| Config validation | `window.__WWAI__` | Validated config or thrown error with all issues listed |
| DOM discovery | All custom elements in page | `PRODUCT_GROUP_REGISTRY` keyed by `sectionId__productGroup` |
| Product fetch | Product handles from registry | Product objects merged into `__WWAI__SECTION_PRODUCT_DATA__` |
| Group init | Registry + product store + config | Resolved variant data: `{ variantId, price, compareAtPrice, sellingPlans, isAvailable, discountPercent, savings }` |
| UI update | Resolved variant data | Updated DOM: prices, button state, carousel media, title, selling plan inputs |
| Add to cart | Form hidden inputs | POST to `/cart/add.js` → post-add journey (redirect / side cart / notification) |

## Product Data Loading

Two strategies, chosen per deployment:

| | Static (embedded JSON) | Dynamic (JS fetch) |
|---|---|---|
| Max products | ~20 per page | Unlimited |
| Subscription data | Included | Not available |
| Speed | Instant (no network) | Network latency |

Both can be mixed on the same page. Products that need subscription support must use static loading.

## Extension Points

| Point | How it works |
|---|---|
| **Product source** | The framework expects product objects in Shopify's structure. Any source providing the same shape works — swap the connector in `product-fetch/`. |
| **Carousel component** | `product-custom-carousel-media-selector` controls what media content to display; the actual carousel UI is pluggable. The carousel component must expose `clearSlides()`, `createCustomCarouselSlide()`, and `gotoSlide()`. |
| **Side cart** | The framework calls a connector function to open the theme's side cart after add-to-cart. The cart API call (`/cart/add.js`) is universal; only the open/refresh mechanism is theme-specific. |
| **Post-add-to-cart journey** | Configurable via `flowConfig.destination`: redirect to cart, checkout, custom URL, or open side cart. |
| **Collection grid behavior** | `preAddToCartFlowConfig` controls smart button behavior: direct add-to-cart, redirect to PDP, or open a variant selection overlay. |

## External Services

| Service | Purpose | Used by |
|---|---|---|
| Shopify `/cart/add.js` | Add items to cart | `journey_helpers/add_to_cart_utils.js` |
| Shopify Product API | Fetch product data by handle (dynamic loading) | `product-fetch/product-object-fetch-js.js` |
| Shopify `/discount/{code}` | Apply discount codes to session | `journey_helpers/discount_utils.js` |
| Theme side cart | Open/refresh the cart drawer | `journey_helpers/side_cart_utils.js` (via connector) |
