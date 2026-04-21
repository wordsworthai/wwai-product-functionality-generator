export function extractAllCarouselMediaData() {
    const selectors = document.querySelectorAll('product-custom-carousel-media-selector');
    const result = {};

    selectors.forEach((selector) => {
        const sectionId = selector.getAttribute('section_id') || '';
        const productGroup = selector.getAttribute('product_group') || '';
        const key = `${sectionId}__${productGroup}`;

        const slides = selector.querySelectorAll('main-slider-slide');
        const mediaData = [];

        slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        const rawId = slide.id || slide.getAttribute('id');

        if (img && img.src) {
            // ✅ Use URL API to cleanly remove `v` param
            let cleanedUrl;
            try {
            const url = new URL(img.src, window.location.origin);
            url.searchParams.delete('v');
            cleanedUrl = url.toString();
            } catch {
            cleanedUrl = img.src; // fallback
            }

            // Extract width (leave it in the URL)
            const widthMatch = img.src.match(/[?&]width=(\d+)/);
            const width = widthMatch ? parseInt(widthMatch[1], 10) : img.width || 0;

            const htmlWidth = img.width;
            const htmlHeight = img.height;
            const aspectRatio = htmlWidth && htmlHeight
            ? +(htmlWidth / htmlHeight).toFixed(3)
            : 1;

            const height = width && aspectRatio ? Math.round(width / aspectRatio) : 0;

            const fallbackId = `${sectionId}__${productGroup}__${index + 1}`;
            const parsedId = parseInt(rawId?.split('_').pop(), 10);
            const id = isNaN(parsedId) ? fallbackId : parsedId;

            mediaData.push({
            alt: img.getAttribute('alt') || null,
            id,
            position: index + 1,
            preview_image: {
                aspect_ratio: aspectRatio,
                height,
                width,
                src: cleanedUrl
            },
            aspect_ratio: aspectRatio,
            height,
            media_type: "image",
            src: cleanedUrl,
            width
            });
        }
        });

        result[key] = mediaData;
    });

    return result;
}