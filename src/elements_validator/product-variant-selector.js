import {buildProductHierarchyFromSelector} from '../utils/element-selector-utils/product-variant-selector-utils.js';
import {validateExhaustiveOptionsAgainstVariants} from './product-variant-element-product-connect';
import {
  VARIANT_ATTR_OPTION_TYPE,
  VARIANT_ATTR_PRODUCT_LABEL,
  VARIANT_ATTR_VARIANT_LABEL
} from '../constants/elements/variant-selector-constants.js';


export function validateVariantInputAttributes(input) {
  const issues = [];

  const type = input.getAttribute(VARIANT_ATTR_OPTION_TYPE);
  const productLabel = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL);
  const variantLabel = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL);

  if (type !== 'product' && type !== 'product_variant') {
    issues.push(`Invalid type: "${type}". Expected "product" or "product_variant".`);
  }

  if (!productLabel) {
    issues.push(`Missing required attribute: ${VARIANT_ATTR_PRODUCT_LABEL}.`);
  }

  if (type === 'product_variant' && !variantLabel) {
    issues.push(`Missing ${VARIANT_ATTR_VARIANT_LABEL} for product_variant input.`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export function validateAllVariantInputs(selectorElement) {
  const inputs = selectorElement.querySelectorAll('input[type="radio"]');
  const invalidInputs = [];

  if (inputs.length === 0) {
    return {
      isValid: false,
      messages: ['❌ No variant input elements (radio buttons) found in selector.'],
    };
  }

  inputs.forEach(input => {
    const result = validateVariantInputAttributes(input);
    if (!result.valid) {
      invalidInputs.push({
        input,
        debug: getReadableVariantInputDebug(input),
        issues: result.issues
      });
    }
  });

  const messages = invalidInputs.flatMap(({ debug, issues }) =>
    issues.map(issue => `${debug} : ${issue}`)
  );

  return {
    isValid: invalidInputs.length === 0,
    messages
  };
}

export function getReadableVariantInputDebug(input) {
  const type = input.getAttribute(VARIANT_ATTR_OPTION_TYPE) || '(no type)';
  const productLabel = input.getAttribute(VARIANT_ATTR_PRODUCT_LABEL) || '(no product)';
  const variantLabel = input.getAttribute(VARIANT_ATTR_VARIANT_LABEL) || '(no variant)';
  return `type="${type}", product="${productLabel}", variant="${variantLabel}"`;
}

export function checkForConflictingRadioGroups(selectorElement) {
  const sectionId = selectorElement.getAttribute("section_id") || "(unknown)";
  const inputs = selectorElement.querySelectorAll('input[type="radio"]');
  const conflicts = [];
  const messages = [];

  inputs.forEach(input => {
    const name = input.getAttribute("name");
    if (!name) return;

    const sameNameInputs = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
    sameNameInputs.forEach(otherInput => {
      if (!selectorElement.contains(otherInput)) {
        const message = `Conflict: radio group name "${name}" is used both inside (seciton id="${sectionId}") and outside of this selector too.`;

        conflicts.push({ name, input, conflictingElement: otherInput, message });
        messages.push(message);
      }
    });
  });

  return {
    conflicts,
    messages
  };
}

export function checkConsistentOptionTypeInRadioGroups(selectorElement) {
  const sectionId = selectorElement.getAttribute("section_id") || "(unknown)";
  const inputs = selectorElement.querySelectorAll('input[type="radio"]');
  const radioGroups = {};

  inputs.forEach(input => {
    const name = input.getAttribute("name");
    const optionType = input.getAttribute(VARIANT_ATTR_OPTION_TYPE);
    if (!name || !optionType) return;

    radioGroups[name] = radioGroups[name] || new Set();
    radioGroups[name].add(optionType);
  });

  const inconsistencies = [];
  const messages = [];

  Object.entries(radioGroups).forEach(([groupName, types]) => {
    if (types.size > 1) {
      const message = `Inconsistent option types in radio group: "${groupName}" (found types: ${Array.from(types).join(', ')}).`;
      messages.push(message);

      const conflictingInputs = Array.from(inputs).filter(el => el.getAttribute("name") === groupName);
      inconsistencies.push({
        groupName,
        types: Array.from(types),
        inputs: conflictingInputs,
        message
      });
    }
  });

  return {
    inconsistencies,
    messages
  };
}

export function getValidationStatusForSelector(selectorElement, printToLogs = false) {
  const inputValidation = validateAllVariantInputs(selectorElement);
  const { inconsistencies, messages: inconsistencyMessages } = checkConsistentOptionTypeInRadioGroups(selectorElement);
  const { conflicts, messages: conflictMessages } = checkForConflictingRadioGroups(selectorElement);

  const messages = [...inputValidation.messages, ...inconsistencyMessages];
  let hasError = !inputValidation.isValid;
  let hasWarning = inconsistencyMessages.length > 0;

  messages.push(...conflictMessages);
  if (conflicts.length > 0) hasError = true;

  const finalStatus = hasError ? 'error' : hasWarning ? 'warning' : 'valid';

  if (printToLogs) {
    console.log("messages:", messages);
  }

  return {
    status: finalStatus,
    messages: messages
  };
}

export function validateProductVariantSelector(selectorElement) {
  // const hierarchy = buildProductHierarchyFromSelector(selectorElement);
  // console.group(`[ProductVariantSelector] Test Output - ${selectorElement.registryKey}`);
  // console.log('Product Hierarchy:', hierarchy);
  // console.groupEnd();
  const { status, messages } = getValidationStatusForSelector(selectorElement);
  selectorElement.setAttribute('debug_status', status);
  selectorElement.setAttribute('debug_message', JSON.stringify(messages));
}

export function validateProductVariantSelectorProductObjectConnection(selectorElement) {
  const hierarchy = buildProductHierarchyFromSelector(selectorElement);
  if (!selectorElement?.productGroup) {
    console.warn("[WWAI] ⚠️ Product group not found for selector element.");
    return;
  }  
  const mismatches = validateExhaustiveOptionsAgainstVariants(selectorElement.productGroup, hierarchy);
  console.log("mismatches:", mismatches);

  // Load existing debug messages if any
  let existingMessages = [];
  try {
    const raw = selectorElement.getAttribute('debug_message');
    existingMessages = raw ? JSON.parse(raw) : [];
  } catch (e) {
    existingMessages = [];
  }

  const mismatchMessages = (mismatches || []).map(msg => `Product Connect Error: ${msg}`);
  const combinedMessages = [...existingMessages, ...mismatchMessages];

  selectorElement.setAttribute('debug_message', JSON.stringify(combinedMessages));
}