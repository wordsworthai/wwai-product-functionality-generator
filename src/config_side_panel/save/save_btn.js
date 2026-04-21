import { showDiffModal } from "./diff_modal.js";

export function setupSaveButton(panel, updateAndSaveCompleteConfig, getConfigDiff, getAllConfigs) {
    const saveBtn = panel.querySelector('#wwai-save-btn');
    const statusSpan = panel.querySelector('#wwai-save-status');
    
    saveBtn.onclick = () => {
      statusSpan.textContent = 'Analyzing changes...';
      statusSpan.style.color = '#0070f3';
      
      try {
        const oldConfig = window.__WWAI__ || {};
        const newConfig = getAllConfigs();
        
        // Debug logging
        console.log('Old config:', oldConfig);
        console.log('New config:', newConfig);
        
        const diff = getConfigDiff();
        console.log('Diff result:', diff);
        
        statusSpan.textContent = '';
        showDiffModal(diff, updateAndSaveCompleteConfig);
        
      } catch (error) {
        console.error('Error analyzing config:', error);
        statusSpan.textContent = '❌ Error: ' + error.message;
        statusSpan.style.color = '#dc3545';
      }
    };
}
