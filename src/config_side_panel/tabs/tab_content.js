import { createPanelHeader } from "../config_panel_main_elements.js";
import { createPanelFooter } from "../config_panel_main_elements.js";

import { createTabNavigation } from "./tab_navigation.js";

// Tab content tabs.
import { renderGeneralConfigTab } from "./content_tab_general_config.js";
import { renderProductMappingTab } from "./content_tab_product_mapping.js";
import { renderGroupedSectionConfigsTab } from "./content_tab_section_group_config.js";
import { renderLabeledImagesTab } from "./content_tab_label_images.js";
import { renderVariantOverridesTab } from "./content_tab_variant_overrides.js";

export function createPanelContent(configData) {
    const tabContents = [
        renderGeneralConfigTab(configData.filteredConfig),
        renderProductMappingTab(configData.JS_PRODUCT_MAPPING_OBJECT),
        renderGroupedSectionConfigsTab(configData.WWAI_PRODUCT_GROUP_CONFIG),
        renderLabeledImagesTab(configData.WWAI_LABELED_IMAGES),
        renderVariantOverridesTab(configData.WWAI_PRODUCT_VARIANT_OVERRIDES)
    ].join("");

    return `
        ${createPanelHeader()}
        ${createTabNavigation()}
        <div id="wwai-tab-container" style="flex: 1; padding: 16px; overflow-y: auto;">
        ${tabContents}
        </div>
        ${createPanelFooter()}
    `;
}