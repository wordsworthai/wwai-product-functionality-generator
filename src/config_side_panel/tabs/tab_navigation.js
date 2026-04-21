function createTabButton(tabId, label) {
    return `<button data-tab="${tabId}" class="wwai-tab-btn">${label}</button>`;
}

export function createTabNavigation() {
    const tabs = [
        { id: "general", label: "General Config" },
        { id: "mapping", label: "Product Mapping" },
        { id: "group", label: "Group + Variant Config" },
        { id: "images", label: "Labeled Images" },
        { id: "variant_overrides", label: "Variant Overrides" }
    ];

    return `
        <div style="display: flex; gap: 4px; border-bottom: 1px solid #eee; padding: 8px 16px;">
        ${tabs.map(tab => createTabButton(tab.id, tab.label)).join("")}
        </div>
    `;
}

export function setupTabNavigation(panel) {
    const tabButtons = panel.querySelectorAll(".wwai-tab-btn");
    const tabAreas = panel.querySelectorAll(".wwai-tab-content");

    tabButtons.forEach(btn => {
        btn.onclick = () => {
        const targetId = btn.getAttribute("data-tab");
        tabAreas.forEach(area => {
            area.style.display = area.id === `tab-content-${targetId}` ? "block" : "none";
        });
        tabButtons.forEach(b => b.classList.remove("active-tab"));
        btn.classList.add("active-tab");
        };
    });

    tabButtons[0].click();
}
