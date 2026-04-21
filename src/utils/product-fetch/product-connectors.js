export const productConnectors = {
    mock: async (handle) => {
      console.log(`[MOCK] Simulated fetch for: /products/${handle}.js`);
      return {
        handle,
        title: `Mock Product for ${handle}`,
        variants: [{ id: `${handle}-variant-1`, title: "Default Variant", available: true }],
        selling_plan_groups: [],
        images: [],
        description: `Mock product.`,
        vendor: "MockVendor",
        product_type: "MockType"
      };
    },
  
    shopify: async (handle) => {
      try {
        const res = await fetch(`/products/${handle}.js`);
        if (!res.ok) {
          console.error(`WWAI-ERROR ❌ Fetch failed for /products/${handle}.js — HTTP ${res.status}`);
          return null;
        }
        return await res.json();
      } catch (err) {
        console.error(`WWAI-ERROR ❌ Error fetching ${handle}:`, err);
        return null;
      }
    },

      // ---- Custom Connectors ----

    wwai_product_connector_custom_static: async (handle) => {
      try {
        if (typeof window === "undefined") {
          console.error("WWAI-ERROR ❌ window not available (server-side).");
          return null;
        }

        const productData = window._WWAI_STATIC_PRODUCT_DATA?.[handle];
        if (!productData) {
          console.warn(`WWAI-WARN ⚠️ No product found in window.PRODUCT_DATA for handle: ${handle}`);
          return null;
        }

        return productData;
      } catch (err) {
        console.error(`WWAI-ERROR ❌ Error accessing window.PRODUCT_DATA for ${handle}:`, err);
        return null;
      }
    },

    wwai_product_connector_custom_dynamic: async (handle) => {
      try {
        if (typeof window === "undefined") {
          console.error("WWAI-ERROR ❌ window not available (server-side).");
          return null;
        }

        if (typeof window._WWAI_DYNAMIC_PRODUCT_DATA_FETCH_FUNCTION !== "function") {
          console.error("WWAI-ERROR ❌ window._WWAI_DYNAMIC_PRODUCT_DATA_FETCH_FUNCTION is not defined or not a function.");
          return null;
        }

        return await window._WWAI_DYNAMIC_PRODUCT_DATA_FETCH_FUNCTION(handle);
      } catch (err) {
        console.error(`WWAI-ERROR ❌ Error calling window._WWAI_DYNAMIC_PRODUCT_DATA_FETCH_FUNCTION for ${handle}:`, err);
        return null;
      }
    }
    // 🚧 You can add more connectors here in future:
    // customApi: (handle) => ...
};
  