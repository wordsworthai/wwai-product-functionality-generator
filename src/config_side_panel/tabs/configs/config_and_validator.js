export const pricingConfigSchema = {
    discountPercent: "number",
    subscriptionDiscountPercent: "number",
    defaultSubscriptionOption: "string|null",
    discountCodeToApply: "array<string>",
    roundDiscount: "boolean",
    addOffSuffixToDiscount: "boolean"
};

export const flowConfigSchema = {
    destination: ["checkout", "cart", "side-cart"],
    loader: ["add-to-cart-submit-button", "media-gallery"],
    showSuccessNotification: "boolean",
    showErrorNotification: "boolean",
    sideCartLabel: ["", "littlewords", "rco", "nwkw", "kitsch", "puracy", "drmtlgy", "dose", "idriss"],
    successNotificationMessage: "string",
    errorNotificationMessage: "string",
    notificationOptions: {
        backgroundColor: "string",
        textColor: "string",
        borderColor: "string",
        fontFamily: "string"
    }
};

export const uxConfigSchema = {
    variantOptionRemovePrefix: "string",
    defaultPurchaseType: ["onetime", "subscription"],
    variantUXConfig: {
        hideSingleLengthVariants: "boolean",
        onlyShowVariantsWithLabelContains: ["string", "null"],
        refreshUxOnVariantChange: "boolean"
    },
    preAddToCartFlowConfig: {
        journeyType: ["custom-redirect", "direct-add", "redirect", "overlay", "na"],
        overlayContents: ["array<string>", "null"],
        postSelectionAction: ["add-to-cart", "redirect", "na"],
        postSelectionActionParams: {
            custom_url: ["string", "null"],
            redirect_variant_options: ["array<string>", "null"]
        }
    }
};

export const variantDispatchConfigSchema = {
    defaultProduct: "string",
    defaultVariantOption1: ["string", "null"],
    defaultVariantOption2: ["string", "null"],
    defaultVariantOption3: ["string", "null"],
    allProducts: "string",
    allOptions: {
        option1: "string",  // You can optionally validate pipe-separated string if needed
        option2: "string",
        option3: "string"
    }
};


function isType(value, type) {
    if (type === "string") return typeof value === "string";
    if (type === "number") return typeof value === "number";
    if (type === "boolean") return typeof value === "boolean";
    if (type === "null") return value === null;
    if (type === "string|null") return typeof value === "string" || value === null;
    if (type === "array<string>") return Array.isArray(value) && value.every(v => typeof v === "string");
    return false;
}

// Helper function to check if an array contains type definitions
function isTypeUnion(rule) {
    if (!Array.isArray(rule)) return false;
    const typeKeywords = ["string", "number", "boolean", "null", "array<string>"];
    return rule.every(item => typeKeywords.includes(item));
}

// Helper function to check if an array contains literal values (enum)
function isLiteralEnum(rule) {
    if (!Array.isArray(rule)) return false;
    const typeKeywords = ["string", "number", "boolean", "null", "array<string>"];
    return rule.every(item => !typeKeywords.includes(item));
}

// Common validation banner function
export function makeValidationBanner(errors, configName) {
    if (errors.length === 0) {
        return `<div style="color: green; font-weight: bold; margin-bottom: 8px;">${configName} is valid.</div>`;
    }
    return `<div style="color: red; font-weight: bold; margin-bottom: 8px;">Invalid ${configName}:<br>${errors.join("<br>")}</div>`;
}
  
export function validateAgainstSchema(obj, schema, path = "") {
    const errors = [];

    // Check for extra keys not defined in schema
    if (obj && typeof obj === "object") {
        for (const key in obj) {
            if (!(key in schema)) {
                const fullPath = path ? `${path}.${key}` : key;
                errors.push(`${fullPath} is not a valid field in the schema`);
            }
        }
    }

    for (const key in schema) {
        const fullPath = path ? `${path}.${key}` : key;
        const rule = schema[key];
        const val = obj?.[key];

        if (Array.isArray(rule)) {
            if (isTypeUnion(rule)) {
                // Type union (e.g., ["string", "null"])
                const valid = rule.some(typeDef => isType(val, typeDef));
                if (!valid) {
                    errors.push(`${fullPath} must be one of types: ${rule.join(", ")}`);
                }
            } else if (isLiteralEnum(rule)) {
                // Literal enum (e.g., ["onetime", "subscription"])
                const valid = rule.includes(val);
                if (!valid) {
                    errors.push(`${fullPath} must be one of: ${rule.join(", ")}`);
                }
            } else {
                // Fallback to original behavior
                const valid = rule.includes(val);
                if (!valid) {
                    errors.push(`${fullPath} must be one of: ${rule.join(", ")}`);
                }
            }
        } else if (typeof rule === "string") {
            if (!isType(val, rule)) {
                errors.push(`${fullPath} must be of type ${rule}`);
            }
        } else if (typeof rule === "object") {
            if (typeof val !== "object" || val == null) {
                errors.push(`${fullPath} must be an object`);
            } else {
                errors.push(...validateAgainstSchema(val, rule, fullPath));
            }
        }
    }

    return errors;
}