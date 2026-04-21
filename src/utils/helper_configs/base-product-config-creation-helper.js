import {buildProductHierarchyFromSelector} from '../../utils/element-selector-utils/product-variant-selector-utils.js';
import { SELECTORS } from '../../constants/selector-constants.js';


export function generateProductGroupConfig() {
    const selectors = [
      SELECTORS.PRODUCT_GROUP.VARIANT,
      SELECTORS.PRODUCT_GROUP.VARIANT_PURCHASE_TYPE_COMBO
    ].filter(Boolean).join(', ');
    
    const allSelectors = document.querySelectorAll(selectors);
    const SECTION_DATA = {};

    const DEFAULTS = {
        pricingConfig: {
          discountPercent: 0,
          subscriptionDiscountPercent: 0,
          defaultSubscriptionOption: null,
          useVariantCompareAtPriceForSubscription: true,
          discountCodeToApply: [],
          roundDiscount: true,
          addOffSuffixToDiscount: false
        },
        uxConfig: {
          variantOptionRemovePrefix: "Every",
          defaultPurchaseType: "onetime",
          imageCarouselConfig: {
            useCustomImages: false
          },
          variantUXConfig: {
            hideSingleLengthVariants: false,
            onlyShowVariantsWithLabelContains: null,
            refreshUxOnVariantChange: true
          },
          preAddToCartFlowConfig: {
            journeyType: "overlay", // "direct-add", "redirect", "overlay"
            overlayContents: [],
            postSelectionAction: "na", // "add-to-cart", "redirect", "na"
            postSelectionActionParams: {
              custom_url: null,
              redirect_variant_options: null,
            }
          }
        },
        flowConfig: {
          destination: "side-cart", // e.g., "checkout", "side-cart"
          loader: "add-to-cart-submit-button", // add-to-cart-submit-button
          showSuccessNotification: false,
          showErrorNotification: false,
          sideCartLabel: "",
          successNotificationMessage: "✅ Added to cart!",
          errorNotificationMessage: "Oops, couldn't add item.",
          notificationOptions: {
            backgroundColor: "#E8DDFA",
            textColor: "#000000",
            borderColor: "transparent",
            fontFamily: "sans-serif"
          }
        }
      };

    allSelectors.forEach(selector => {
        const productGroup = selector.productGroup;
        const rawSectionId = selector.sectionId;


        let sectionId = rawSectionId;
        if (rawSectionId.includes("__")) {
            sectionId = rawSectionId.split("__")[1];
        }
        else if (rawSectionId.includes("--")) {
            sectionId = rawSectionId.split("--")[1];
        }

        const hierarchy = buildProductHierarchyFromSelector(selector);
        const firstProductLabel = hierarchy.productLabels?.[0]?.trim() || null;
        const defaultOptions = hierarchy.variants?.[firstProductLabel] || {};

        const allOptions = { option1: new Set(), option2: new Set(), option3: new Set() };

        for (const productLabel of hierarchy.productLabels || []) {
        const variantMap = hierarchy.variants?.[productLabel] || {};
        ["option1", "option2", "option3"].forEach(optionKey => {
            (variantMap[optionKey] || []).forEach(value =>
            allOptions[optionKey].add(value.trim())
            );
        });
        }

        const toPipeString = (set) => [...set].join(" | ") || "";

        const variantDispatchConfig = {
        defaultProduct: firstProductLabel,
        defaultVariantOption1: defaultOptions.option1?.[0]?.trim() || null,
        defaultVariantOption2: defaultOptions.option2?.[0]?.trim() || null,
        defaultVariantOption3: defaultOptions.option3?.[0]?.trim() || null,
        allProducts: (hierarchy.productLabels || []).map(p => p.trim()).join(" | "),
        allOptions: {
            option1: toPipeString(allOptions.option1),
            option2: toPipeString(allOptions.option2),
            option3: toPipeString(allOptions.option3)
        }
        };

        SECTION_DATA[sectionId] = SECTION_DATA[sectionId] || {
        defaults: JSON.parse(JSON.stringify(DEFAULTS)) // clone
        };

        SECTION_DATA[sectionId][productGroup] = {
        pricingConfig: null,
        uxConfig: null,
        flowConfig: null,
        variantDispatchConfig
        };
    });

    return SECTION_DATA;
}
  
  