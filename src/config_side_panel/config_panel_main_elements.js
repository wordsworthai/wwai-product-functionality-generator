// Create the main toggle button to show the config panel.
export function createToggleButton() {
    const toggleButton = document.createElement("button");
    toggleButton.id = "wwai-toggle-panel-button";
    toggleButton.innerText = "Config";
    Object.assign(toggleButton.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "10001",
        padding: "10px 14px",
        backgroundColor: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        fontSize: "14px",
        fontFamily: "sans-serif"
    });
    return toggleButton;
}

// Create the panel styles.
export function createPanelStyles() {
    return {
        position: "fixed",
        top: "0",
        right: "0",
        width: "480px",
        height: "100vh",
        backgroundColor: "#fff",
        boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.1)",
        zIndex: "10002",
        padding: "0",
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#333",
        borderLeft: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column"
    };
}

export function createPanelHeader() {
    return `
      <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee;">
        <strong>WWAI Config Panel</strong>
        <button id="wwai-close-btn" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
      </div>
    `;
}

export function createPanelFooter() {
    return `
        <div style="padding: 16px; border-top: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label style="font-size: 14px; font-weight: 500; cursor: pointer;">
                        <input type="checkbox" id="wwai-button-highlight-toggle" style="margin-right: 6px;">
                        Button Highlighting
                    </label>
                </div>
                <span id="wwai-highlight-status" style="font-size: 12px; color: #666;"></span>
            </div>
            <button id="wwai-save-btn" style="padding: 8px 12px; background-color: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Preview Changes</button>
            <span id="wwai-save-status" style="margin-left: 10px; font-size: 12px; color: #666;"></span>
        </div>
    `;
}
