import { getWWAIConfig } from "../../wwai_config.js";
export function getResolvedMediaForVariant(product, variantConfig) {
    if (!product || !Array.isArray(product.media)) {
        console.warn(`⚠️ Invalid product or media array.`);
        return [];
    }

    // No override → fallback to product media
    if (!variantConfig || !variantConfig.customMediaLabel) {
        return product.media;
    }

    const label = variantConfig.customMediaLabel;
    const labeledMedia = getWWAIConfig().WWAI_LABELED_IMAGES?.[label];

    if (!Array.isArray(labeledMedia) || labeledMedia.length === 0) {
        console.warn(`⚠️ No labeled media found for label "${label}". Falling back to product media.`);
        return product.media;
    }

    return labeledMedia;
}

export function getMediaIndexForVariantConfig(variantConfig, productObject, variantObject) {
    const index = variantConfig?.redirectToMediaIndex;
    if (typeof index === 'number' && index >= 0) {
        return index;
    } else {
        console.log("No index found, falling back to product media");
        const featuredMediaSrc = variantObject?.featured_media?.preview_image?.src;
        if (!featuredMediaSrc) {
            console.log("Featured media src not found in variant object.");
            return;
        }
    
        const filteredMedia = (productObject?.media || []).filter(m => m?.src);
        const index = filteredMedia.findIndex(media => media.src === featuredMediaSrc);

        console.log("Index found, returning index", index);
        
        if (index !== -1) {
            return index; // Return the index of the matched media
        } else {
            console.log("No matching media found in product.");
            return;
        }
    }
}