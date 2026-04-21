import { generateConfigString } from "../config_manager.js";

export function renderDiffModalContentHtml(diff) {
    const diffEntries = Object.entries(diff);
    const hasChanges = diffEntries.some(([configType, configDiff]) => 
        configDiff && Object.keys(configDiff).length > 0
    );

    const diffHtml = hasChanges ? diffEntries.map(([configType, configDiff]) => {
        if (!configDiff || Object.keys(configDiff).length === 0) {
            return '';
        }

        const configChanges = Object.entries(configDiff).map(([path, change]) => {
            const { before, after } = change;
            let changeText = '';
            let changeType = '';
            
            if (before === undefined && after !== undefined) {
                changeText = `Added: ${JSON.stringify(after, null, 2)}`;
                changeType = 'added';
            } else if (before !== undefined && after === undefined) {
                changeText = `Removed: ${JSON.stringify(before, null, 2)}`;
                changeType = 'removed';
            } else if (JSON.stringify(before) !== JSON.stringify(after)) {
                changeText = `Modified: ${JSON.stringify(before, null, 2)} => ${JSON.stringify(after, null, 2)}`;
                changeType = 'modified';
            } else {
                return ''; // No change
            }
            
            return `
            <div style="margin-bottom: 8px; padding: 8px; border-radius: 4px; background-color: #f8f9fa; border-left: 3px solid #0070f3;">
                <strong style="color: #0070f3;">${path}</strong>
                <div style="margin-top: 4px; font-family: monospace; font-size: 11px; color: #666;">
                ${changeText}
                </div>
            </div>
            `;
        }).filter(html => html !== '').join('');

        if (configChanges === '') {
            return '';
        }

        return `
        <div style="margin-bottom: 16px; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: bold;">
                ${getConfigTypeDisplayName(configType)}
            </h4>
            ${configChanges}
        </div>
        `;
    }).filter(html => html !== '').join('') : '<p style="color: #666; text-align: center; padding: 20px;">No changes detected - configs are identical</p>';

    const totalChanges = diffEntries.reduce((total, [configType, configDiff]) => {
        if (!configDiff) return total;
        return total + Object.keys(configDiff).length;
    }, 0);

    const configString = generateConfigString();

    return `
        <div id="wwai-diff-modal" style="
        position: fixed; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%); 
        background: white; 
        border: 1px solid #ddd; 
        border-radius: 8px; 
        padding: 20px; 
        width: 800px; 
        max-height: 80vh; 
        overflow-y: auto; 
        z-index: 10003;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0;">Config Management</h3>
            <button id="wwai-close-diff" style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 4px;">&times;</button>
        </div>
        
        <!-- Tab Navigation -->
        <div style="display: flex; gap: 4px; border-bottom: 1px solid #eee; padding: 8px 0; margin-bottom: 16px;">
            <button id="wwai-tab-diff" class="wwai-modal-tab-btn active" style="background: #0070f3; color: white; border: none; padding: 8px 16px; border-radius: 4px 4px 0 0; cursor: pointer; font-size: 13px;">Diff & Save</button>
            <button id="wwai-tab-config" class="wwai-modal-tab-btn" style="background: #f0f0f0; color: #333; border: none; padding: 8px 16px; border-radius: 4px 4px 0 0; cursor: pointer; font-size: 13px;">Config String</button>
        </div>
        
        <!-- Diff Tab Content -->
        <div id="wwai-tab-content-diff" class="wwai-modal-tab-content">
            <div style="margin-bottom: 16px;">
                <strong>Total Changes: ${totalChanges}</strong>
            </div>
            
            <div style="margin-bottom: 20px; max-height: 400px; overflow-y: auto;">
                ${diffHtml}
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button id="wwai-cancel-diff" style="padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                ${hasChanges ? `<button id="wwai-confirm-diff" style="padding: 8px 16px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply Changes</button>` : ''}
            </div>
        </div>
        
        <!-- Config String Tab Content -->
        <div id="wwai-tab-content-config" class="wwai-modal-tab-content" style="display: none;">
            <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
                <div style="font-weight: bold; margin-bottom: 12px; color: #495057;">Config String Actions</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button id="wwai-copy-config-string" 
                            style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        Copy to Clipboard
                    </button>
                    <button id="wwai-log-config-string" 
                            style="background: #ffc107; color: #212529; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        Log to Console
                    </button>
                </div>
            </div>
            
            <div style="margin-top: 16px;">
                <label for="wwai-config-string-textarea" style="display: block; margin-bottom: 10px; font-weight: bold;">Current Config String:</label>
                <textarea 
                    id="wwai-config-string-textarea" 
                    style="width: 100%; height: 400px; font-family: monospace; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px;"
                    readonly
                >${configString}</textarea>
            </div>
        </div>
        </div>
        <div id="wwai-diff-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10002;"></div>
    `;
}

function getConfigTypeDisplayName(configType) {
    const displayNames = {
        'groupedSectionConfig': 'Group & Variant Config',
        'productMappingConfig': 'Product Mapping',
        'labeledImagesConfig': 'Labeled Images',
        'variantOverridesConfig': 'Variant Overrides',
        'generalConfig': 'General Config'
    };
    
    return displayNames[configType] || configType;
}

function setupModalTabs() {
    const tabButtons = document.querySelectorAll('.wwai-modal-tab-btn');
    const tabContents = document.querySelectorAll('.wwai-modal-tab-content');
    
    tabButtons.forEach(btn => {
        btn.onclick = () => {
            const targetId = btn.getAttribute('id').replace('wwai-tab-', '');
            
            // Update tab buttons
            tabButtons.forEach(b => {
                b.style.background = '#f0f0f0';
                b.style.color = '#333';
            });
            btn.style.background = '#0070f3';
            btn.style.color = 'white';
            
            // Update tab contents
            tabContents.forEach(content => {
                content.style.display = content.id === `wwai-tab-content-${targetId}` ? 'block' : 'none';
            });
        };
    });
}

export function showDiffModal(diff, updateAndSaveCompleteConfig) {
    const modalHtml = renderDiffModalContentHtml(diff);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('wwai-diff-modal');
    const overlay = document.getElementById('wwai-diff-overlay');
    
    // Setup modal tabs
    setupModalTabs();
    
    // Close modal handlers
    const closeModal = () => {
      if (modal) modal.remove();
      if (overlay) overlay.remove();
    };
    
    // Set up close button
    const closeBtn = document.getElementById('wwai-close-diff');
    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }
    
    // Set up cancel button
    const cancelBtn = document.getElementById('wwai-cancel-diff');
    if (cancelBtn) {
      cancelBtn.onclick = closeModal;
    }
    
    // Apply changes handler
    const confirmBtn = document.getElementById('wwai-confirm-diff');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const success = updateAndSaveCompleteConfig();
        if (success) {
          closeModal();
          // Update status in the main panel
          const statusSpan = document.querySelector('#wwai-save-status');
          if (statusSpan) {
            statusSpan.textContent = '✅ Applied successfully!';
            statusSpan.style.color = '#28a745';
            setTimeout(() => {
              statusSpan.textContent = '';
            }, 3000);
          }
        }
      };
    }
    
    // Copy config string handler
    const copyConfigBtn = document.getElementById('wwai-copy-config-string');
    if (copyConfigBtn) {
      copyConfigBtn.onclick = () => {
        const textarea = document.getElementById('wwai-config-string-textarea');
        if (textarea) {
          textarea.select();
          textarea.setSelectionRange(0, 99999);
          
          try {
            document.execCommand('copy');
            console.log("✅ Config string copied to clipboard");
            
            // Show temporary success message
            const originalText = copyConfigBtn.textContent;
            copyConfigBtn.textContent = "Copied!";
            copyConfigBtn.style.background = "#28a745";
            
            setTimeout(() => {
              copyConfigBtn.textContent = originalText;
              copyConfigBtn.style.background = "#007bff";
            }, 2000);
          } catch (err) {
            console.error("❌ Failed to copy to clipboard:", err);
          }
        }
      };
    }
    
    // Log config string handler
    const logConfigBtn = document.getElementById('wwai-log-config-string');
    if (logConfigBtn) {
      logConfigBtn.onclick = () => {
        const textarea = document.getElementById('wwai-config-string-textarea');
        if (textarea) {
          console.log("📋 Current Config String:", textarea.value);
        }
      };
    }
    
    // Close on overlay click
    if (overlay) {
      overlay.onclick = closeModal;
    }
    
    // Close on Escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
}
