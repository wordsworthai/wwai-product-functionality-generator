export function extractUpdatedConfig(containerSelector) {
    const container = document.querySelector(containerSelector);
    const config = {};
  
    if (!container) return config;
  
    container.querySelectorAll('[data-config-key]').forEach(el => {
      const key = el.getAttribute('data-config-key');
      const field = el.querySelector('[data-config-field]');
  
      if (!field) return;
  
      if (field.tagName === 'TEXTAREA') {
        try {
          config[key] = JSON.parse(field.value);
        } catch (e) {
          console.warn(`Invalid JSON in field for key: ${key}`);
          config[key] = null;
        }
      } else if (field.tagName === 'SELECT') {
        config[key] = field.value === "true";
      } else if (field.type === 'number') {
        config[key] = parseFloat(field.value);
      } else {
        config[key] = field.value;
      }
    });
  
    return config;
}

  
// Ensure global snapshot container
window.wwaiConfigSnapshots = window.wwaiConfigSnapshots || {};

export function getUpdatedConfig(containerSelector) {
  return extractUpdatedConfig(containerSelector);
}

export function getConfigDiff(snapshotId, containerSelector) {
  const original = window.wwaiConfigSnapshots[snapshotId] || {};
  const updated = extractUpdatedConfig(containerSelector);
  const diff = {};

  for (const key of new Set([...Object.keys(original), ...Object.keys(updated)])) {
    const orig = JSON.stringify(original[key]);
    const upd = JSON.stringify(updated[key]);
    if (orig !== upd) {
      diff[key] = { before: original[key], after: updated[key] };
    }
  }

  return diff;
}

export function saveUpdatedConfig(snapshotId, containerSelector) {
  const updated = extractUpdatedConfig(containerSelector);
  window.wwaiConfigSnapshots[snapshotId] = structuredClone(updated);
}