import { SELECTORS } from '../constants/selector-constants.js';
import { getWWAIConfig } from '../wwai_config.js';

export class ProductGridHeightEqualizerSelector extends HTMLElement {
    constructor() {
        super();
        this.sectionId = this.getAttribute('section_id');
        this.expectedCards = parseInt(this.getAttribute('data-expected-cards')) || 0;
        this.equalizationReady = false;
        this.expectedRoles = this.discoverRoles();
    }

    connectedCallback() {
        console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ connectedCallback triggered`);

        // 1) Run an immediate check to handle server-rendered / pre-existing cards.
        // 2) If that doesn’t find everything, fall back to the MutationObserver below
        //    to catch cards that load in later via JS.
        this.checkIfCardsAreReady('init');

        // Observes any DOM changes after initial render and equalizes once all cards appear. This can happen in case 
        // of swiper, or any other JS-based loading of cards, where all cards are not loaded initially.
        this.initMutationObserver();
    
        // Re-runs equalization when the section becomes visible in the viewport (e.g., during scroll)
        this.initIntersectionObserver();
    
        // Listens for browser resize or orientation change events, and triggers equalization if ready
        this.initResizeListeners();
    
        // Observes actual size changes to the section (e.g., due to font load, image load) and re-equalizes
        this.initResizeObserver();
    
        // Sets up cleanup logic to disconnect observers and listeners when the element is removed from the DOM
        this.initCleanupHandler();
    }

    checkIfCardsAreReady(triggerSource = 'manual') {
      const cards = this.querySelectorAll('[data-wwai-container-card]');
      const cardsWithAllRoles = Array.from(cards).filter(card => {
          const roles = card.querySelectorAll('[data-wwai-container-card-role]');
          if (roles.length < this.expectedRoles.length) return false;
          return Array.from(roles).some(roleEl => roleEl.innerHTML.trim() !== '');
      });
  
      console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] 🕵️ ${triggerSource} check: found ${cards.length} cards, ${cardsWithAllRoles.length} with roles, expecting ${this.expectedCards}`);
  
      if (cards.length >= this.expectedCards && cardsWithAllRoles.length >= this.expectedCards && this.expectedCards > 0) {
          console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] 🟢 Cards ready, triggering equalize via: ${triggerSource}`);
          this.equalizationReady = true;
          this.equalize(triggerSource);
  
          if (this.mutationObserver) {
              this.mutationObserver.disconnect();
          }
      } else {
          console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ⏳ Waiting for cards... (${triggerSource})`);
      }
  }

  initMutationObserver() {
    console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] 🧬 initMutationObserver set up`);

    this.mutationObserver = new MutationObserver(() => {
        console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ mutationObserver triggered`);
        this.checkIfCardsAreReady('mutation-observer');
    });

    this.mutationObserver.observe(this, { childList: true, subtree: true });
  }
    
    initIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(entries => {
            console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ intersectionObserver triggered`);
            if (entries.some(entry => entry.isIntersecting)) {
                if (this.equalizationReady) {
                    console.info(`[${this.sectionId}] 📡 Section entered viewport, re-running equalize`);
                    this.equalize("intersection");
                }
            }
        }, { threshold: 0.1 });
    
        this.intersectionObserver.observe(this);
    }
    
    initResizeListeners() {
        window.addEventListener('resize', () => {
            console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ resizeListener triggered`);
            if (this.equalizationReady) this.debouncedEqualize('resize');
        });
    
        window.addEventListener('orientationchange', () => {
            console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ orientationchangeListener triggered`);
            if (this.equalizationReady) this.equalize('orientationchange');
        });
    }
    
    initResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ resizeObserver triggered`);
            if (this.equalizationReady) this.equalize('resize-observer');
        });
    
        this.resizeObserver.observe(this);
    }
    
    initCleanupHandler() {
        this.disconnectedCallback = () => {
            console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ disconnectedCallback triggered`);
            window.removeEventListener('resize', this.debouncedEqualize);
            window.removeEventListener('orientationchange', this.equalize);
            this.resizeObserver.disconnect();
            this.mutationObserver.disconnect();
        };
    }    
        
    debouncedEqualize(source = 'resize') {
        clearTimeout(this._resizeTimeout);
        this._resizeTimeout = setTimeout(() => this.equalize(source), 300);
    }

    getCards() {
        return this.querySelectorAll('[data-wwai-container-card]');
    }

    discoverRoles() {
        const firstCard = this.querySelector('[data-wwai-container-card]');
        if (!firstCard) return [];

        return Array.from(firstCard.querySelectorAll('[data-wwai-container-card-role]'))
            .map(el => el.getAttribute('data-wwai-container-card-role'))
            .filter(role => !!role);
    }

    validateCards(roles) {
        const cards = this.getCards();
        cards.forEach(card => {
            roles.forEach(role => {
                if (!card.querySelector(`[data-wwai-container-card-role="${role}"]`)) {
                    getWWAIConfig().heightEqualizeLogging && console.log(`"[${this.sectionId}]"❌ Missing role "${role}" in card with label:`, card.dataset.wwaiContainerCardLabel);
                    getWWAIConfig().heightEqualizeLogging && console.log(card);
                }
            });
        });
    }

    generateEqualizedHeightMap() {
        const cards = this.getCards();
        const roles = this.discoverRoles();
        const rows = {};
        const tempHeightMap = new Map(); // ⏳ Stores pre-cleared heights for fallback
      
        // STEP 1: Store current heights before clearing min-heights
        cards.forEach(card => {
          roles.forEach(role => {
            const el = card.querySelector(`[data-wwai-container-card-role="${role}"]`);
            if (el) {
              const height = el.offsetHeight;
              tempHeightMap.set(el, height);
              el.style.minHeight = ''; // Clear cached minHeight for fresh measurement
            }
          });
        });
      
        // STEP 2: Group cards by top offset (row-wise)
        cards.forEach(card => {
          const top = Math.round(card.getBoundingClientRect().top);
          if (!rows[top]) rows[top] = [];
          rows[top].push(card);
        });
      
        const sortedTops = Object.keys(rows).map(Number).sort((a, b) => a - b);
        const rowHeightMap = [];
      
        // STEP 3: Calculate max height per role for each row
        sortedTops.forEach((top, rowIndex) => {
          const rowCards = rows[top];
          const heights = {};
      
          roles.forEach(role => {
            let maxHeight = 0;
      
            rowCards.forEach(card => {
              const el = card.querySelector(`[data-wwai-container-card-role="${role}"]`);
              if (el) {
                let height = el.offsetHeight;
      
                if (height < 5 && tempHeightMap.has(el)) {
                  // Fallback to earlier height if current one is invalid
                  height = tempHeightMap.get(el);
                  getWWAIConfig().heightEqualizeLogging && console.log(`[${this.sectionId}] ⚠️ Using fallback height for role "${role}" due to suspect value: ${height}px`);
                }
      
                if (height > 5) {
                  maxHeight = Math.max(maxHeight, height + 1);
                }
              }
            });
      
            heights[role] = maxHeight;
          });
      
          rowHeightMap.push({ rowIndex, heights });
        });
      
        return {
          section_id: this.sectionId,
          roles,
          rowCount: rowHeightMap.length,
          rows: rowHeightMap
        };
      }
            
    /**
     * Fills in missing or zero heights in a height map by copying the last known
     * valid height for each role (e.g., media, title, etc.).
     * 
     * This is useful in cases where dynamic content (like images or Swiper-loaded
     * elements) may not have rendered yet when the initial height map was generated,
     * resulting in some role heights being 0.
     * 
     * Example:
     * If row 2 has media height = 0, it will reuse media height from row 1 if available.
     * This improves layout stability when applying cached heights.
    */
    fillMissingHeights(heightMap) {
        const roles = heightMap.roles;
        let lastValidHeights = {};
    
        heightMap.rows.forEach(row => {
        roles.forEach(role => {
            const currentHeight = row.heights[role];
            if (!currentHeight || currentHeight === 0) {
            row.heights[role] = lastValidHeights[role] || 0;
            } else {
            lastValidHeights[role] = row.heights[role];
            }
        });
        });
    
        return heightMap;
    }
    applyHeightMap(heightMap) {
        const cards = this.getCards();
        const roles = heightMap.roles;
        
        // Fill in any missing heights (e.g., dynamic content not loaded yet)
        heightMap = this.fillMissingHeights(heightMap);

        // Reconstruct row groups from card positions
        const rowMap = {};
        cards.forEach(card => {
          const top = Math.round(card.getBoundingClientRect().top);
          if (!rowMap[top]) rowMap[top] = [];
          rowMap[top].push(card);
        });
      
        const sortedTops = Object.keys(rowMap).map(Number).sort((a, b) => a - b);
        const rowGroups = sortedTops.map(top => rowMap[top]);
      
        // Loop over row groups + apply heights
        heightMap.rows.forEach((rowEntry, idx) => {
          const rowCards = rowGroups[idx];
          if (!rowCards) return;
      
          roles.forEach(role => {
            const height = rowEntry.heights[role];
            rowCards.forEach(card => {
              const el = card.querySelector(`[data-wwai-container-card-role="${role}"]`);
              if (el) el.style.minHeight = `${height}px`;
            });
          });
        });
    }
    
    equalize(source = 'unknown') {
        console.log(`HEIGHT_EQUALIZER: [${this.sectionId}] ✅ equalize triggered with height map by: ${source}`);
        getWWAIConfig().heightEqualizeLogging && console.log(`[${this.sectionId}] ⚡ Equalize triggered with height map by: ${source}`);
        
        const cards = this.getCards();
        const roles = this.discoverRoles();
      
        if (!cards.length || !roles.length) return;
      
        this.validateCards(roles); // still useful for debugging
      
        const heightMap = this.generateEqualizedHeightMap();
        this.applyHeightMap(heightMap);
    }
}

customElements.define(SELECTORS.OTHER.PRODUCT_GRID_HEIGHT_EQUALIZER, ProductGridHeightEqualizerSelector);

window.generateAllEqualizedHeightMapsForDevice = function () {
    const allEqualizers = document.querySelectorAll('product-grid-height-equalizer-selector');
    const mapping = {};
  
    allEqualizers.forEach(el => {
      if (typeof el.generateEqualizedHeightMap === 'function') {
        const heightMap = el.generateEqualizedHeightMap();
  
        // Extract clean section ID
        const rawId = heightMap.section_id || '';
        const cleanedId = rawId.split('__')[1] || rawId;
  
        mapping[cleanedId] = {
          ...heightMap,
          section_id: cleanedId
        };
      }
    });
  
    // Device detection
    const isMobile = window.innerWidth < 768;
    const key = isMobile ? 'CACHED_HEIGHTS_MOBILE' : 'CACHED_HEIGHTS_DESKTOP';
  
    // Store globally
    window[key] = mapping;
  
    // Generate output string with <script> block
    const scriptString = `<script>\nwindow.${key} = ${JSON.stringify(mapping, null, 2)};\n</script>`;
  
    console.log(`✅ Cached height mappings generated for ${isMobile ? 'mobile' : 'desktop'}.\nCopy-paste this into your config:`);
    console.log(scriptString);
  
    return mapping;
};

window.applyCachedHeightsOnLoad = function () {
    const isMobile = window.innerWidth < 768;
    const cache = isMobile ? window.CACHED_HEIGHTS_MOBILE : window.CACHED_HEIGHTS_DESKTOP;
  
    if (!cache) {
      console.warn(`[Equalizer] No cached heights found for ${isMobile ? 'mobile' : 'desktop'}. Skipping initial height application.`);
      return;
    }
  
    const allEqualizers = document.querySelectorAll('product-grid-height-equalizer-selector');
  
    allEqualizers.forEach(el => {
      const rawId = el.sectionId;
      const cleanedId = rawId.includes('__')
        ? rawId.split('__')[1]
        : rawId.split('--')[1] || rawId;
  
      const heightMap = cache[cleanedId];
      if (heightMap && typeof el.applyHeightMap === 'function') {
        el.applyHeightMap(heightMap);
        getWWAIConfig().heightEqualizeLogging && console.log(`[${cleanedId}] 🚀 Applied cached height map from config.`);
      }
    });
};  