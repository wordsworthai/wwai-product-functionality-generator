function findSectionElement(sectionId) {
    // Look for Shopify section elements with the pattern shopify-section-template--{timestamp}__{sectionId}
    const sectionElements = document.querySelectorAll('[id*="shopify-section-template"]');

    for (const element of sectionElements) {
        const elementId = element.id;
        // Check if the section ID is part of the element ID
        if (elementId.includes(sectionId)) {
        return element;
        }
    }

    return null;
}

function scrollToSection(sectionId) {
    const sectionElement = findSectionElement(sectionId);
    if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add a brief highlight effect
        sectionElement.style.transition = 'background-color 0.3s ease';
        sectionElement.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
        sectionElement.style.backgroundColor = '';
        }, 2000);
        console.log(`✅ Scrolled to section: ${sectionId}`);
    } else {
        console.warn(`⚠️ Section not found: ${sectionId}`);
        alert(`Section "${sectionId}" not found on the page.`);
    }
}

export function createGoToSectionButton(sectionId) {
    return `
      <button 
        onclick="window.scrollToSection('${sectionId}')" 
        style="
          margin-left: 8px; 
          padding: 2px 6px; 
          font-size: 10px; 
          background-color: #0070f3; 
          color: white; 
          border: none; 
          border-radius: 3px; 
          cursor: pointer;
          vertical-align: middle;
        "
        title="Go to section on page"
      >
        Go
      </button>
    `;
}

// Initialize window.scrollToSection globally
function initScrollToSection() {
    window.scrollToSection = scrollToSection;
}

// Auto-initialize when module loads
initScrollToSection();
