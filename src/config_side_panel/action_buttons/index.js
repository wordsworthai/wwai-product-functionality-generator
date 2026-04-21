(() => {
    let isHighlightEnabled = false;
    let modalListeners = new Map();

    function enableButtonHighlighting() {
        if (isHighlightEnabled) return; // Already enabled
        
        // Check if highlighter is active
        if (window.wwaiHighlighter && window.wwaiHighlighter.isActive && window.wwaiHighlighter.isActive()) {
            console.log("⚠️ Cannot enable button highlighting - highlighter is active");
            return;
        }
        
        console.log("🔍 Enabling button highlighting...");
        isHighlightEnabled = true;
        
        // Highlight all links
        document.querySelectorAll('a').forEach(a => {
            a.style.outline = '2px solid red';
            a.style.backgroundColor = 'yellow';
        });
        
        // Add click listeners for XPath and actions
        document.querySelectorAll('a').forEach(a => {
            const listener = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                showActionModal(a);
                return false;
            };
            modalListeners.set(a, listener);
            a.addEventListener('click', listener, true); // Use capture phase
        });
        
        console.log("✅ Button highlighting enabled - Click any link to configure actions");
    }

    function disableButtonHighlighting() {
        if (!isHighlightEnabled) return; // Already disabled
        
        console.log("🔍 Disabling button highlighting...");
        isHighlightEnabled = false;
        
        // Remove highlighting
        document.querySelectorAll('a').forEach(a => {
            a.style.outline = '';
            a.style.backgroundColor = '';
        });
        
        // Remove click listeners
        modalListeners.forEach((listener, element) => {
            element.removeEventListener('click', listener, true); // Remove with capture phase
        });
        modalListeners.clear();
        
        // Remove any existing modals
        document.querySelectorAll('.wwai-action-modal, .wwai-modal-backdrop').forEach(el => el.remove());
        
        console.log("✅ Button highlighting disabled");
    }

    // Global function to control highlighting
    window.wwaiToggleButtonHighlighting = function(enable) {
        if (enable) {
            enableButtonHighlighting();
        } else {
            disableButtonHighlighting();
        }
    };

    // Function to check if button highlighting is active
    window.wwaiIsButtonHighlightingActive = function() {
        return isHighlightEnabled;
    };

    // Auto-disable when highlighter becomes active
    function setupHighlighterConflictDetection() {
        // Check periodically for highlighter activation
        setInterval(() => {
            if (isHighlightEnabled && window.wwaiHighlighter && window.wwaiHighlighter.isActive && window.wwaiHighlighter.isActive()) {
                console.log("🔄 Auto-disabling button highlighting - highlighter is active");
                disableButtonHighlighting();
            }
        }, 1000); // Check every second
    }

    // Setup conflict detection
    setupHighlighterConflictDetection();

    function getXPath(el) {
        // Find closest Shopify section
        let container = el.closest('div[id^="shopify-section-template--"], section[id^="shopify-section-template--"]');
        if (!container) {
          return '(no Shopify section found)';
        }
      
        const containerId = container.getAttribute('id');
        const relativePath = [];
      
        let current = el;
        while (current && current !== container) {
          let index = 1;
          let sibling = current.previousSibling;
          while (sibling) {
            if (sibling.nodeType === 1 && sibling.nodeName === current.nodeName) {
              index++;
            }
            sibling = sibling.previousSibling;
          }
          relativePath.unshift(`${current.nodeName.toLowerCase()}[${index}]`);
          current = current.parentNode;
        }
      
        return `//div[@id="${containerId}"]//${relativePath.join('/')}`;
    }

    function showActionModal(a) {
        window.__WWAI__ = window.__WWAI__ || {};
        window.__WWAI__.WWAI_ACTION_BUTTONS = window.__WWAI__.WWAI_ACTION_BUTTONS || {};
        

        const text = a.innerText.trim() || '(no text)';
        const href = a.getAttribute('href') || '(no href)';
        const xpath = getXPath(a);

        const savedConfig = window.__WWAI__.WWAI_ACTION_BUTTONS[xpath];

        const backdrop = document.createElement('div');
        backdrop.className = 'wwai-modal-backdrop';
        Object.assign(backdrop.style, {
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 9998
        });

        const modal = document.createElement('div');
        modal.className = 'wwai-action-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            zIndex: 9999,
            width: '90%',
            maxWidth: '600px',
            fontFamily: 'monospace',
            maxHeight: '80vh',
            overflowY: 'auto'
        });

        modal.innerHTML = `
            <h2 style="margin-top:0;">Link Action Configuration</h2>
            <div style="margin-bottom: 15px;">
                <strong>Text:</strong> ${text}<br>
                <strong>Current Href:</strong> ${href}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>XPath:</strong><br>
                <code style="word-break: break-all; background: #f5f5f5; padding: 8px; display: block; margin: 5px 0;">${xpath}</code>
                <button id="wwai-copy-xpath" style="margin-top: 5px; padding: 4px 8px; font-size: 12px;">Copy XPath</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong>Action Type:</strong>
                <select id="wwai-action-type" style="width: 100%; padding: 6px; margin-top: 5px;">
                    <option value="no-action">No Action (Prevent Default)</option>
                    <option value="custom-url">Custom URL</option>
                    <option value="scroll-to">Scroll to Element</option>
                    <option value="console-log">Console Log</option>
                    <option value="alert">Alert Message</option>
                </select>
            </div>
            
            <div id="wwai-action-input" style="margin-bottom: 15px;"></div>

            <div style="display: flex; gap: 10px;">
                <button id="wwai-apply-action" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;">Apply Action</button>
                <button id="wwai-close-modal" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px;">Close</button>
            </div>
        `;

        const inputArea = modal.querySelector('#wwai-action-input');
        const select = modal.querySelector('#wwai-action-type');

        const renderInput = () => {
            inputArea.innerHTML = '';
            const val = select.value;

            if (val === 'custom-url') {
                inputArea.innerHTML = `
                    <strong>Custom URL:</strong><br>
                    <input id="wwai-custom-url" placeholder="https://example.com" style="width:100%; padding:6px; margin-top: 5px;">
                `;
            } else if (val === 'scroll-to') {
                const ids = Array.from(document.querySelectorAll('[id^="shopify-section-template--"]')).map(el => el.id);
                if (ids.length === 0) {
                    inputArea.innerHTML = `<p style="color: #666;">No matching Shopify section IDs found on this page.</p>`;
                } else {
                    const options = ids.map(id => `<option value="${id}">${id}</option>`).join('');
                    inputArea.innerHTML = `
                        <strong>Scroll to Section:</strong><br>
                        <select id="wwai-scroll-target" style="width:100%; padding:6px; margin-top: 5px;">
                            ${options}
                        </select>
                    `;
                }
            } else if (val === 'console-log') {
                inputArea.innerHTML = `
                    <strong>Console Message:</strong><br>
                    <input id="wwai-console-message" placeholder="Message to log" style="width:100%; padding:6px; margin-top: 5px;">
                `;
            } else if (val === 'alert') {
                inputArea.innerHTML = `
                    <strong>Alert Message:</strong><br>
                    <input id="wwai-alert-message" placeholder="Message to show" style="width:100%; padding:6px; margin-top: 5px;">
                `;
            }
        };

        renderInput();
        select.addEventListener('change', renderInput);

        // Preselect saved action type if exists
        if (savedConfig?.actionType) {
            select.value = savedConfig.actionType;
            renderInput(); // Re-render to show the correct input field
        }

        // Prepopulate input fields if saved config exists
        if (savedConfig?.value) {
            const tryFill = () => {
                const type = select.value;
                if (type === 'custom-url') {
                    const input = modal.querySelector('#wwai-custom-url');
                    if (input) input.value = savedConfig.value;
                } else if (type === 'scroll-to') {
                    const selectInput = modal.querySelector('#wwai-scroll-target');
                    if (selectInput) selectInput.value = savedConfig.value;
                } else if (type === 'console-log') {
                    const input = modal.querySelector('#wwai-console-message');
                    if (input) input.value = savedConfig.value;
                } else if (type === 'alert') {
                    const input = modal.querySelector('#wwai-alert-message');
                    if (input) input.value = savedConfig.value;
                }
            };

            // Delay to ensure input renders
            setTimeout(tryFill, 50);
        }

        // Copy XPath functionality
        modal.querySelector('#wwai-copy-xpath').addEventListener('click', () => {
            navigator.clipboard.writeText(xpath).then(() => {
                const btn = modal.querySelector('#wwai-copy-xpath');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy XPath', 2000);
            });
        });

        // Apply action functionality
        modal.querySelector('#wwai-apply-action').addEventListener('click', () => {
            const type = select.value;
            
            if (type === 'no-action') {
                a.setAttribute('href', 'javascript:void(0)');
                a.onclick = (e) => e.preventDefault();
            } else if (type === 'custom-url') {
                const url = modal.querySelector('#wwai-custom-url')?.value.trim();
                if (url) {
                    a.setAttribute('href', url);
                    a.onclick = null;
                }
            } else if (type === 'scroll-to') {
                const selectedId = modal.querySelector('#wwai-scroll-target')?.value;
                if (selectedId) {
                    a.setAttribute('href', 'javascript:void(0)');
                    a.onclick = (e) => {
                        e.preventDefault();
                        const el = document.getElementById(selectedId);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    };
                }
            } else if (type === 'console-log') {
                const message = modal.querySelector('#wwai-console-message')?.value.trim() || 'Link clicked';
                a.setAttribute('href', 'javascript:void(0)');
                a.onclick = (e) => {
                    e.preventDefault();
                    console.log(message);
                };
            } else if (type === 'alert') {
                const message = modal.querySelector('#wwai-alert-message')?.value.trim() || 'Link clicked';
                a.setAttribute('href', 'javascript:void(0)');
                a.onclick = (e) => {
                    e.preventDefault();
                    alert(message);
                };
            }
            
            // Save configuration to window.__WWAI__.WWAI_ACTION_BUTTONS
            let value = null;
            if (type === 'custom-url') {
                value = modal.querySelector('#wwai-custom-url')?.value.trim();
            } else if (type === 'scroll-to') {
                value = modal.querySelector('#wwai-scroll-target')?.value;
            } else if (type === 'console-log') {
                value = modal.querySelector('#wwai-console-message')?.value.trim();
            } else if (type === 'alert') {
                value = modal.querySelector('#wwai-alert-message')?.value.trim();
            }

            window.__WWAI__.WWAI_ACTION_BUTTONS[xpath] = {
                actionType: type,
                value: value || null
            };
            
            modal.remove();
            backdrop.remove();
        });

        // Close modal functionality
        modal.querySelector('#wwai-close-modal').addEventListener('click', () => {
            modal.remove();
            backdrop.remove();
        });

        backdrop.addEventListener('click', () => {
            modal.remove();
            backdrop.remove();
        });

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
    }

    // Initialize with highlighting disabled
    disableButtonHighlighting();
})();

// Usage:
// window.wwaiToggleButtonHighlighting(true);   // Enable highlighting
// window.wwaiToggleButtonHighlighting(false);  // Disable highlighting
// window.wwaiIsButtonHighlightingActive();     // Check if active