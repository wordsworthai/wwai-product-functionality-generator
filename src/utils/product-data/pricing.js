// Format price using CURRENCY_SYMBOL and CURRENCY_FACTOR defined inside liquid.
import { getWWAIConfig } from "../../wwai_config.js";
export function formatShopifyPrice(price) {
  if (typeof price !== "number" || isNaN(price)) return "";

  const conversionFactor =
    typeof getWWAIConfig().CURRENCY_FACTOR === "number" ? getWWAIConfig().CURRENCY_FACTOR : 0.01;

  const currency = getWWAIConfig().CURRENCY || "USD";
  const actualPrice = price * conversionFactor;

  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(actualPrice);

  return formattedPrice;
}

export function calculateOneTimePriceWithConfig(productLabel, variant, pricingConfig = {}) {
  if (!variant || typeof variant.price !== "number") {
    console.error("WWAI-ERROR ❌ Invalid variant provided.");
    return {
      price: "$0.00",
      compareAtPrice: "$0.00",
      discount_percent: "0.00",
    };
  }
  
  let discountPercent = pricingConfig?.discountPercent ?? 0;
  if (pricingConfig?.productLabelDiscountMapping != undefined && pricingConfig?.productLabelDiscountMapping[productLabel] != undefined) {
    if (pricingConfig?.productLabelDiscountMapping[productLabel]?.discountPercent) {
      discountPercent = pricingConfig?.productLabelDiscountMapping[productLabel]?.discountPercent;
    }
  }

  let basePrice = variant.price;
  let compareAtPrice = variant.compare_at_price || null;

  if (discountPercent > 0) {
    compareAtPrice = Math.max(variant.price, variant.compare_at_price || 0);
    basePrice = variant.price - (variant.price * discountPercent) / 100;
  }

  if (!compareAtPrice) {
    compareAtPrice = variant.price;
  }

  const computedDiscountPercent =
    compareAtPrice > 0
      ? ((compareAtPrice - basePrice) / compareAtPrice) * 100
      : 0;

  const discountPercentInt = parseInt(computedDiscountPercent, 10);
  const discount_percent =
    discountPercentInt === computedDiscountPercent
      ? discountPercentInt
      : computedDiscountPercent.toFixed(2);

  let savings = compareAtPrice - basePrice;
  if (savings < 0) {
    savings = 0;
  }

  return {
    price: formatShopifyPrice(basePrice),
    compareAtPrice: formatShopifyPrice(compareAtPrice),
    discount_percent,
    savings: formatShopifyPrice(savings),
  };
}