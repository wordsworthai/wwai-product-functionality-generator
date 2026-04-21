export function createEmptyStateMessage(message) {
    return `<p style="color: #888; text-align: center; padding: 20px;">${message}</p>`;
}

function createConfigSection(key, value) {
  if (typeof value === "object" && value !== null) {
    return `
      <details style="margin-bottom: 8px; border: 1px solid #eee; border-radius: 4px;" data-config-key="${key}">
        <summary style="padding: 8px; cursor: pointer; font-weight: bold; background-color: #f8f9fa;">
          ${key}
        </summary>
        <div style="padding: 8px;">
          <textarea rows="4" data-config-field style="
            width: 100%;
            font-family: monospace;
            font-size: 12px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            resize: vertical;
            background-color: #fafafa;
          ">${JSON.stringify(value, null, 2)}</textarea>
        </div>
      </details>
    `;
  }

  let inputHtml = "";

  if (typeof value === "string") {
    inputHtml = `<input type="text" data-config-field value="${value}" style="width: 300px; padding: 6px 10px; font-family: monospace; font-size: 12px;" />`;
  } else if (typeof value === "number") {
    inputHtml = `<input type="number" data-config-field value="${value}" style="width: 150px; padding: 6px 10px; font-family: monospace; font-size: 12px;" />`;
  } else if (typeof value === "boolean") {
    inputHtml = `
      <select data-config-field style="padding: 6px 10px; font-family: monospace; font-size: 12px;">
        <option value="true" ${value ? "selected" : ""}>true</option>
        <option value="false" ${!value ? "selected" : ""}>false</option>
      </select>
    `;
  } else {
    inputHtml = `<span style="color: red;">Unsupported type</span>`;
  }

  return `
    <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;" data-config-key="${key}">
      <label style="font-weight: bold; font-family: monospace; font-size: 12px; min-width: 200px;">${key}</label>
      ${inputHtml}
    </div>
  `;
}

export function renderConfigSections(data, emptyMessage, snapshotId = null) {
  const entries = Object.entries(data || {});
  const sections = entries.map(([key, value]) => createConfigSection(key, value)).join('');

  if (snapshotId) {
    window.wwaiConfigSnapshots = window.wwaiConfigSnapshots || {};
    window.wwaiConfigSnapshots[snapshotId] = structuredClone(data);
  }

  return sections || createEmptyStateMessage(emptyMessage);
}