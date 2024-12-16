import { Quill } from 'react-quill';

class VideoResize {
  constructor(quill, options = {}) {
    // Save references
    this.quill = quill;
    this.options = {
      handleStyles: {
        width: '12px',
        height: '12px',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '50%',
        opacity: '0.3',
        transition: 'all 0.2s'
      },
      overlayStyles: {
        position: 'absolute',
        boxSizing: 'border-box',
        border: '1px dashed #007bff'
      },
      ...options
    };

    // Video aspect ratios
    this.aspectRatios = {
      '16:9': 16/9,
      '4:3': 4/3,
      '1:1': 1
    };
    this.currentRatio = '16:9';
    this.resizing = null;

    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);
    this.checkVideo = this.checkVideo.bind(this);
    this.wrapVideo = this.wrapVideo.bind(this);
    this.setAspectRatio = this.setAspectRatio.bind(this);
    this.updateSizeDisplay = this.updateSizeDisplay.bind(this);

    // Initialize the module
    this.init();
  }

  init() {
    this.quill.root.addEventListener('click', this.handleClick);
    this.quill.root.parentNode.style.position = this.quill.root.parentNode.style.position || 'relative';

    // Create observer for new videos
    this.observer = new MutationObserver((mutations) => {
      let shouldWrapVideos = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'IFRAME' || (node.querySelector && node.querySelector('iframe'))) {
            shouldWrapVideos = true;
          }
        });
      });

      if (shouldWrapVideos) {
        // Wait for Quill to finish its updates
        setTimeout(() => this.wrapVideo(), 0);
      }
    });

    this.observer.observe(this.quill.root, {
      childList: true,
      subtree: true
    });

    // Initial wrap of existing videos
    setTimeout(() => this.wrapVideo(), 0);
  }

  wrapVideo() {
    const iframes = this.quill.root.querySelectorAll('iframe:not(.video-wrapped)');
    
    if (iframes.length === 0) return;

    // Temporarily disable Quill updates
    this.quill.disable();
    
    try {
      iframes.forEach(iframe => {
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'video-container';
        Object.assign(wrapper.style, {
          position: 'relative',
          display: 'inline-block'
        });

        // Add handles, size display, and ratio control
        this.addResizeHandles(wrapper);
        this.addSizeDisplay(wrapper);
        this.addRatioControl(wrapper, iframe);

        // Wrap iframe
        iframe.classList.add('video-wrapped');
        iframe.parentNode.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);

        // Set initial size if not set
        if (!iframe.style.width) {
          iframe.style.width = '640px';
          iframe.style.height = '360px';
        }

        // Update size display
        this.updateSizeDisplay(iframe, wrapper.querySelector('.video-size-display'));
      });
    } finally {
      // Re-enable Quill
      this.quill.enable();
    }
  }

  addResizeHandles(wrapper) {
    ['nw', 'ne', 'se', 'sw'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${pos}`;
      Object.assign(handle.style, {
        position: 'absolute',
        ...this.options.handleStyles,
        ...this.getHandlePosition(pos)
      });

      handle.addEventListener('mousedown', this.handleMousedown);
      wrapper.appendChild(handle);
    });
  }

  getHandlePosition(pos) {
    switch(pos) {
      case 'nw': return { top: '-6px', left: '-6px' };
      case 'ne': return { top: '-6px', right: '-6px' };
      case 'se': return { bottom: '-6px', right: '-6px' };
      case 'sw': return { bottom: '-6px', left: '-6px' };
      default: return {};
    }
  }

  addSizeDisplay(wrapper) {
    const sizeDisplay = document.createElement('div');
    sizeDisplay.className = 'video-size-display';
    Object.assign(sizeDisplay.style, {
      position: 'absolute',
      top: '-25px',
      right: '0',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '3px',
      fontSize: '12px',
      opacity: '0',
      transition: 'opacity 0.2s'
    });
    wrapper.appendChild(sizeDisplay);
  }

  addRatioControl(wrapper, iframe) {
    const ratioControl = document.createElement('div');
    ratioControl.className = 'video-ratio-control';
    Object.assign(ratioControl.style, {
      position: 'absolute',
      top: '-25px',
      left: '0',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '3px',
      fontSize: '12px'
    });

    Object.keys(this.aspectRatios).forEach(ratio => {
      const option = document.createElement('span');
      option.textContent = ratio;
      option.style.padding = '0 4px';
      option.style.cursor = 'pointer';
      option.addEventListener('click', () => this.setAspectRatio(ratio, iframe));
      if (ratio === this.currentRatio) {
        option.style.fontWeight = 'bold';
      }
      ratioControl.appendChild(option);
    });

    wrapper.appendChild(ratioControl);
  }

  handleClick(event) {
    const videoContainer = event.target.closest('.video-container');
    if (videoContainer) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  handleMousedown(event) {
    const handle = event.target;
    const wrapper = handle.closest('.video-container');
    const iframe = wrapper.querySelector('iframe');
    
    if (!iframe) return;

    this.resizing = {
      iframe,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: parseInt(iframe.style.width, 10) || iframe.offsetWidth,
      startHeight: parseInt(iframe.style.height, 10) || iframe.offsetHeight
    };

    document.addEventListener('mousemove', this.handleMousemove);
    document.addEventListener('mouseup', this.handleMouseup);
    event.preventDefault();

    const sizeDisplay = wrapper.querySelector('.video-size-display');
    if (sizeDisplay) {
      sizeDisplay.style.opacity = '1';
    }
  }

  handleMousemove(event) {
    if (!this.resizing) return;

    this.quill.disable();
    try {
      const deltaX = event.clientX - this.resizing.startX;
      let newWidth = this.resizing.startWidth + deltaX;

      // Constraints
      newWidth = Math.min(Math.max(newWidth, 200), 1200);
      const newHeight = newWidth / this.aspectRatios[this.currentRatio];

      this.resizing.iframe.style.width = `${newWidth}px`;
      this.resizing.iframe.style.height = `${newHeight}px`;

      const wrapper = this.resizing.iframe.closest('.video-container');
      if (wrapper) {
        this.updateSizeDisplay(this.resizing.iframe, wrapper.querySelector('.video-size-display'));
      }
    } finally {
      this.quill.enable();
    }
  }

  handleMouseup() {
    if (!this.resizing) return;

    const wrapper = this.resizing.iframe.closest('.video-container');
    if (wrapper) {
      const sizeDisplay = wrapper.querySelector('.video-size-display');
      if (sizeDisplay) {
        setTimeout(() => {
          if (sizeDisplay) {
            sizeDisplay.style.opacity = '0';
          }
        }, 1500);
      }
    }

    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('mouseup', this.handleMouseup);
    this.resizing = null;
  }

  setAspectRatio(ratio, iframe) {
    this.quill.disable();
    try {
      this.currentRatio = ratio;
      if (iframe) {
        const width = parseInt(iframe.style.width, 10);
        const height = width / this.aspectRatios[ratio];
        iframe.style.height = `${height}px`;

        const wrapper = iframe.closest('.video-container');
        if (wrapper) {
          this.updateSizeDisplay(iframe, wrapper.querySelector('.video-size-display'));
          
          const ratioControl = wrapper.querySelector('.video-ratio-control');
          if (ratioControl) {
            Array.from(ratioControl.children).forEach(option => {
              option.style.fontWeight = option.textContent === ratio ? 'bold' : 'normal';
            });
          }
        }
      }
    } finally {
      this.quill.enable();
    }
  }

  updateSizeDisplay(iframe, sizeDisplay) {
    if (sizeDisplay && iframe) {
      const width = Math.round(parseInt(iframe.style.width, 10));
      const height = Math.round(parseInt(iframe.style.height, 10));
      sizeDisplay.textContent = `${width} × ${height}`;
    }
  }

  checkVideo(event) {
    if (event.keyCode === 46 || event.keyCode === 8) {
      const wrapper = event.target.closest('.video-container');
      if (wrapper) {
        this.quill.disable();
        try {
          wrapper.remove();
        } finally {
          this.quill.enable();
        }
      }
    }
  }
}

// Register module with Quill
Quill.register('modules/videoResize', VideoResize);

export default VideoResize;