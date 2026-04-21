// Common input rendering functions
export function renderTextInput(label, path, value, allowNull = false) {
    return `
        <div style="margin-bottom: 10px;">
            <label style="font-weight: bold; font-size: 12px;">${label}:</label>
            <input type="text" value="${value ?? ''}" data-config-path="${path}" data-allow-null="${allowNull}" onchange="window.wwaiProductGroupConfigOnChangeHandler(this)" />
        </div>
    `;
}

export function renderNumberInput(label, path, value) {
    return `
        <div style="margin-bottom: 10px;">
            <label style="font-weight: bold; font-size: 12px;">${label}:</label>
            <input type="number" value="${value}" data-config-path="${path}" onchange="window.wwaiProductGroupConfigOnChangeHandler(this)" />
        </div>
    `;
}

export function renderBooleanSelect(label, path, value) {
    return `
        <div style="margin-bottom: 10px;">
            <label style="font-weight: bold; font-size: 12px;">${label}:</label>
            <select data-config-path="${path}" onchange="window.wwaiProductGroupConfigOnChangeHandler(this)">
                <option value="true" ${value ? "selected" : ""}>true</option>
                <option value="false" ${!value ? "selected" : ""}>false</option>
            </select>
        </div>
    `;
}

export function renderEnumSelect(label, path, value, options) {
    return `
        <div style="margin-bottom: 10px;">
            <label style="font-weight: bold; font-size: 12px;">${label}:</label>
            <select data-config-path="${path}" onchange="window.wwaiProductGroupConfigOnChangeHandler(this)">
                ${options.map(opt => `<option value="${opt}" ${opt === value ? "selected" : ""}>${opt || "(empty)"}</option>`).join("")}
            </select>
        </div>
    `;
}

export function renderArrayInput(label, path, value, allowNull = false, description = "") {
    const displayValue = value ? value.join(", ") : '';
    return `
        <div style="margin-bottom: 10px;">
            <label style="font-weight: bold; font-size: 12px;">${label}:</label>
            <input type="text" value="${displayValue}" data-config-path="${path}" data-allow-null="${allowNull}" data-is-array="true" onchange="window.wwaiProductGroupConfigOnChangeHandler(this)" />
            ${description ? `<div style="font-size: 11px; color: #666;">${description}</div>` : ''}
        </div>
    `;
}

export function renderTextarea(label, path, value) {
    return `
        <div style="margin-bottom: 10px;">
            <label style="font-weight: bold; font-size: 12px;">${label}:</label>
            <textarea rows="3" data-config-path="${path}" onchange="window.wwaiProductGroupConfigOnChangeHandler(this)">${JSON.stringify(value, null, 2)}</textarea>
        </div>
    `;
}

export function renderFieldset(legend, content) {
    return `
        <fieldset style="margin-top: 20px; padding: 10px; border: 1px solid #ccc;">
            <legend><strong>${legend}</strong></legend>
            ${content}
        </fieldset>
    `;
}

export function renderNestedFieldset(legend, content) {
    return `
        <fieldset style="margin-top: 12px; padding: 8px; border: 1px dashed #999;">
            <legend><strong>${legend}</strong></legend>
            ${content}
        </fieldset>
    `;
}

// Generic schema object renderer
export function renderSchemaObject(obj, schema, pathPrefix, options = {}) {
    const fields = [];
    
    for (const [fieldName, fieldValue] of Object.entries(obj || {})) {
        const fieldSchema = schema[fieldName];
        if (!fieldSchema) continue;
        
        if (typeof fieldSchema === "object" && !Array.isArray(fieldSchema)) {
            // Nested object
            if (fieldValue) {
                const nestedFields = renderSchemaObject(fieldValue, fieldSchema, `${pathPrefix}.${fieldName}`, options);
                fields.push(renderNestedFieldset(fieldName, nestedFields.join('')));
            }
        } else {
            // Simple field
            fields.push(renderSchemaField(fieldName, fieldValue, schema, pathPrefix));
        }
    }
    
    return fields;
}

// Schema-aware rendering functions
export function renderSchemaField(fieldName, fieldValue, schema, pathPrefix) {
    const fullPath = `${pathPrefix}.${fieldName}`;
    const fieldSchema = schema[fieldName];
    
    if (typeof fieldSchema === "string") {
        // Simple type - use a more dynamic approach
        const typeMappings = {
            "string": () => renderTextInput(fieldName, fullPath, fieldValue),
            "number": () => renderNumberInput(fieldName, fullPath, fieldValue),
            "boolean": () => renderBooleanSelect(fieldName, fullPath, fieldValue),
            "string|null": () => renderTextInput(fieldName, fullPath, fieldValue, true),
            "array<string>": () => renderArrayInput(fieldName, fullPath, fieldValue, false, "Comma-separated list")
        };
        
        return typeMappings[fieldSchema] ? typeMappings[fieldSchema]() : renderTextInput(fieldName, fullPath, fieldValue);
    } else if (Array.isArray(fieldSchema)) {
        // Check if it's a type union or enum
        const typeKeywords = ["string", "number", "boolean", "null", "array<string>", "string|null"];
        const isTypeUnion = fieldSchema.every(item => typeKeywords.includes(item));
        
        if (isTypeUnion) {
            // Type union - handle based on the first non-null type
            const primaryType = fieldSchema.find(type => type !== "null");
            if (primaryType === "array<string>") {
                return renderArrayInput(fieldName, fullPath, fieldValue, true);
            } else {
                return renderTextInput(fieldName, fullPath, fieldValue, true);
            }
        } else {
            // Enum
            return renderEnumSelect(fieldName, fullPath, fieldValue, fieldSchema);
        }
    } else if (typeof fieldSchema === "object") {
        // Nested object - render as textarea for now
        return renderTextarea(fieldName, fullPath, fieldValue);
    }
    
    return renderTextInput(fieldName, fullPath, fieldValue);
}