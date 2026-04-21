const OVERLAY_OFFSET_MAP = {
  'product-purchase-type-selector': 40,       // 🟢 outermost
  'product-subscription-frequency-selector': 30,
  'product-variant-custom-labeled-text': 20,
  'product-custom-price-selector': 10,
  'product-custom-submit-interceptor': 10
};

function getContentsBoundingBox(selectorElement, padding = 32) {
  const tagName = selectorElement.tagName.toLowerCase();
  const elementWisePadding = OVERLAY_OFFSET_MAP[tagName] || padding;

  const allVisibleDescendants = Array.from(selectorElement.querySelectorAll('*')).filter(
    el => el.offsetParent !== null
  );

  if (allVisibleDescendants.length === 0) return null;

  let top = Infinity, left = Infinity, bottom = -Infinity, right = -Infinity;

  allVisibleDescendants.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    top = Math.min(top, rect.top);
    left = Math.min(left, rect.left);
    bottom = Math.max(bottom, rect.bottom);
    right = Math.max(right, rect.right);
  });

  if (top === Infinity) return null;

  const scrollTop = window.scrollY;
  const scrollLeft = window.scrollX;
  const pageWidth = document.documentElement.clientWidth;

  const finalLeft = Math.max(0, left + scrollLeft - elementWisePadding);
  const finalTop = Math.max(0, top + scrollTop - elementWisePadding);
  const maxRight = Math.min(pageWidth, right + scrollLeft + elementWisePadding);
  const finalWidth = maxRight - finalLeft;
  const finalHeight = bottom - top + 2 * elementWisePadding;

  return {
    top: finalTop,
    left: finalLeft,
    width: finalWidth,
    height: finalHeight
  };
}

export function removeFloatingDebugLayer(selectorElement) {
    const id = selectorElement.dataset.debugId;
    if (!id) return;

    const overlay = document.querySelector(`[data-debug-for="${id}"]`);
    if (overlay) overlay.remove();
}

export function injectFloatingDebugLayer(selectorElement, layerColor = 'green') {
  const tagName = selectorElement.tagName.toLowerCase();
  const offsetY = OVERLAY_OFFSET_MAP[tagName] || 0;

  if (document.querySelector(`[data-debug-for="${selectorElement.dataset.debugId}"]`)) return;

  const rect = getContentsBoundingBox(selectorElement);
  if (!rect) return;

  const id = selectorElement.dataset.debugId || `${tagName}-debug-${Date.now()}`;
  selectorElement.dataset.debugId = id;

  const overlay = document.createElement('div');
  overlay.setAttribute('data-debug-for', id);
  overlay.style.position = 'absolute';
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top + offsetY}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.border = '2px dashed ' + layerColor;
  overlay.style.zIndex = 9998;
  overlay.style.pointerEvents = 'none';

  const icon = document.createElement('div');
  icon.style.position = 'absolute';
  icon.style.top = `${4}px`;
  icon.style.right = '4px';
  icon.style.width = '12px';
  icon.style.height = '12px';
  icon.style.borderRadius = '50%';
  icon.style.zIndex = '10001';
  icon.style.cursor = 'pointer';
  icon.style.pointerEvents = 'auto';

  const status = selectorElement.getAttribute('debug_status') || 'none';
  icon.style.background = {
    valid: 'limegreen',
    warning: 'orange',
    error: 'red'
  }[status] || 'gray';

  const tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '10px 14px';
  tooltip.style.background = '#2c2c2c';
  tooltip.style.color = '#fff';
  tooltip.style.fontSize = '13px';
  tooltip.style.borderRadius = '6px';
  tooltip.style.zIndex = '10002';
  tooltip.style.display = 'none';
  tooltip.style.width = '360px';
  tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
  tooltip.style.lineHeight = '1.5';
  tooltip.style.whiteSpace = 'normal';
  tooltip.style.wordBreak = 'break-word';
  tooltip.style.overflowWrap = 'break-word';
  tooltip.style.border = '1px solid #444';

  // Add tag name heading
  const heading = document.createElement('div');
  heading.textContent = `<${tagName}>`;
  heading.style.fontWeight = 'bold';
  heading.style.fontSize = '14px';
  heading.style.marginBottom = '8px';
  tooltip.appendChild(heading);

  const ul = document.createElement('ul');
  ul.style.margin = 0;
  ul.style.paddingLeft = '18px';
  ul.style.listStyle = 'disc';
  tooltip.appendChild(ul);

  icon.addEventListener('mouseenter', () => {
    const raw = selectorElement.getAttribute('debug_message') || '[]';
    let messageList = [];

    try {
      messageList = JSON.parse(raw);
    } catch (e) {
      messageList = [raw];
    }
    if (!Array.isArray(messageList) || messageList.length === 0) {
      messageList = ['valid'];
    }    

    ul.innerHTML = ''; // Clear previous
    messageList.forEach(msg => {
      const li = document.createElement('li');
      li.textContent = msg;
      li.style.marginBottom = '8px';
      li.style.paddingLeft = '2px';
      ul.appendChild(li);
    });

    const { right } = icon.getBoundingClientRect();
    const isNearRightEdge = right + 320 > window.innerWidth;
    tooltip.style.left = isNearRightEdge ? '-320px' : '20px';
    tooltip.style.top = '0px';
    tooltip.style.display = 'block';
  });

  icon.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  icon.appendChild(tooltip);
  overlay.appendChild(icon);
  document.body.appendChild(overlay);
}