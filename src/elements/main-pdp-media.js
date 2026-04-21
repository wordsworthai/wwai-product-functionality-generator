if (!customElements.get('carousel-slider')) {
    class CarouselSlider extends HTMLElement {
      constructor() {
        super();
        this.activeIndex = 0;
      }
  
      connectedCallback() {
        this.init();
      }
  
      init() {
        this.cacheElements();
        this.bindEvents();
        this.scrollToMediaItem(this.activeIndex);
      }
  
      cacheElements() {
        this.mainMedia = this.querySelector('main-slider');
        this.thumbSlider = this.querySelector('thumb-slider');
        this.thumbVertical = this.thumbSlider?.dataset.vartical;
        this.pagenation = this.querySelector('pagenation');
        this.mediaItems = this.mainMedia?.querySelectorAll('main-slider-slide') || [];
        this.thumbItems = this.thumbSlider?.querySelectorAll('thumb-slider-slide') || [];
        this.pageItems = this.pagenation?.querySelectorAll('button.page-media-item') || [];
      }
  
      bindEvents() {
        const mediaBtnNext = this.querySelector('.media-next');
        const mediaBtnPrev = this.querySelector('.media-prev');
  
        mediaBtnNext?.addEventListener('click', () => this.goToNext());
        mediaBtnPrev?.addEventListener('click', () => this.goToPrev());
  
        // Only add thumbnail event listeners if thumbItems exist
        if (this.thumbItems && this.thumbItems.length > 0) {
          this.thumbItems.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.scrollToMediaItem(index));
          });
        }
      
        this.pageItems.forEach((page, index) => {
          page.addEventListener('click', () => this.scrollToMediaItem(index));
        });
      
        let scrollTimeout = null;
        this.mainMedia?.addEventListener('scroll', () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => this.handleScrollSnap(), 200);
        });
      
        const updateThumbSliderHeight = () => {
          if (this.thumbSlider && this.thumbVertical && window.innerWidth > 768) {
            this.thumbSlider.style.maxHeight = this.mainMedia.offsetHeight + 'px';
          } else if (this.thumbSlider) {
            this.thumbSlider.style.maxHeight = '';
          }
        };
        
        setTimeout(updateThumbSliderHeight, 200);
        
        window.addEventListener('resize', () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(updateThumbSliderHeight, 200);
        });
      }
  
      handleScrollSnap() {
        const scrollLeft = this.mainMedia.scrollLeft;
        const itemWidth = this.mediaItems[0]?.clientWidth || 0;
        const offset = scrollLeft + this.mainMedia.offsetLeft;
  
        let closestIndex = 0;
        let minDiff = Infinity;
        this.mediaItems.forEach((item, i) => {
          const diff = Math.abs(item.offsetLeft - offset);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        });
  
        this.scrollToMediaItem(closestIndex);
      }
  
      goToNext() {
        if (this.activeIndex < this.mediaItems.length - 1) {
          this.scrollToMediaItem(this.activeIndex + 1);
        }
      }
  
      goToPrev() {
        if (this.activeIndex > 0) {
          this.scrollToMediaItem(this.activeIndex - 1);
        }
      }
  
      scrollToMediaItem(index) {
        if (!this.mediaItems.length) return;
      
        this.mediaItems[this.activeIndex]?.classList.remove('active');
        this.thumbItems[this.activeIndex]?.classList.remove('active');
        this.pageItems[this.activeIndex]?.classList.remove('active');
        
        const video_player = this.mediaItems[this.activeIndex].querySelector('video-player');
        
        this.activeIndex = index;
        
        if (video_player) {
          video_player.pauseAllVideo();
        }
      
        this.mediaItems[this.activeIndex]?.classList.add('active');
        this.thumbItems[this.activeIndex]?.classList.add('active');
        this.pageItems[this.activeIndex]?.classList.add('active');
      
        const scrollLeft = this.mediaItems[this.activeIndex].offsetLeft - this.mainMedia.offsetLeft;
        this.mainMedia.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      
        // Only handle thumbnail scrolling if thumbSlider and thumbItems exist
        if (this.thumbSlider && this.thumbItems[this.activeIndex]) {
          const thumbScroll = this.thumbItems[this.activeIndex].offsetLeft - this.thumbSlider.offsetLeft - ((this.thumbSlider.clientWidth / 2) - (this.thumbItems[this.activeIndex].clientHeight / 2));
          this.thumbSlider.scrollTo({ left: thumbScroll, behavior: 'smooth' });
        }
      }
  
      refresh(index = 0) {
        this.activeIndex = index;
        this.cacheElements();
        this.bindEvents();
      }
  
      createCustomCarouselSlide(data, isThumbnail = false) {
        const slideTag = isThumbnail ? 'thumb-slider-slide' : 'main-slider-slide';
        const slideClass = isThumbnail ? 'thumb-media-item' : 'main-media-item';
        const slide = document.createElement(slideTag);
        slide.className = slideClass;
        slide.id = isThumbnail ? undefined : `wwai-media-${data.id}`;
    
        const img = document.createElement('img');
        img.src = isThumbnail ? `${data.src}&width=${data.width}` : data.src;
        img.alt = data.alt || "Image";
        img.width = data.width;
        img.height = data.height;
        img.loading = 'lazy';
        img.className = isThumbnail ? 'thumb-media-img' : 'main-media-img';
    
        const srcset = isThumbnail
          ? `${data.src}&width=${data.width} ${data.width}w`
          : [
              `${data.src}&width=352 352w`,
              `${data.src}&width=832 832w`,
              `${data.src}&width=1200 1200w`,
              `${data.src}&width=1920 1920w`,
              `${data.src}&width=2561 2561w`
            ].join(', ');
    
        img.setAttribute('srcset', srcset);
        img.setAttribute('sizes', '(min-width: 1536px) 1500px,(min-width: 1280px) 1250px,(min-width: 768px) 994px,(min-width: 768px) 708px,(min-width: 640px) 610px,100vw');
    
        if (isThumbnail) {
          slide.setAttribute('data-handle', `media-${data.id}`);
          slide.setAttribute('data-img-id', data.src);
        }
    
        slide.appendChild(img);
        return slide;
      }
  
      gotoSlide(index) {
        if (!this.mediaItems.length) return;
    
        if (index < 0) {
          const resolvedIndex = this.mediaItems.length + index;
          this.scrollToMediaItem(resolvedIndex);
        } else {
          this.scrollToMediaItem(index);
        }
      }
  
      clearSlides() {
        this.mainMedia.innerHTML = '';
        if (this.thumbSlider) {
          this.thumbSlider.innerHTML = '';
        }
        this.mediaItems = [];
        this.thumbItems = [];
        this.activeIndex = 0;
      }
    }
    
    customElements.define('carousel-slider', CarouselSlider);
  }
  