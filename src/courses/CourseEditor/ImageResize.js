import { Quill } from 'react-quill';

class ImageResize {
  constructor(quill, options = {}) {
    this.quill = quill;
    this.options = {
      handleStyles: {
        width: '8px',
        height: '8px',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '50%'
      },
      overlayStyles: {
        position: 'absolute',
        boxSizing: 'border-box',
        border: '1px dashed #007bff'
      },
      ...options
    };

    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.handleMousedown = this.handleMousedown.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
    this.handleMouseup = this.handleMouseup.bind(this);
    this.checkImage = this.checkImage.bind(this);
    
    // Track timeout for size display
    this.hideDisplayTimeout = null;

    // Initialize
    this.init();
  }

  init() {
    // Add click handler to the editor
    this.quill.root.addEventListener('click', this.handleClick);

    // Make sure the editor's parent container is positioned
    this.quill.root.parentNode.style.position = this.quill.root.parentNode.style.position || 'relative';
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, this.options.overlayStyles);

    // Add resize handle
    this.handle = document.createElement('div');
    Object.assign(this.handle.style, {
      position: 'absolute',
      bottom: '-4px',
      right: '-4px',
      cursor: 'se-resize',
      zIndex: 100,
      ...this.options.handleStyles
    });

    // Add size display
    this.sizeDisplay = document.createElement('div');
    Object.assign(this.sizeDisplay.style, {
      position: 'absolute',
      top: '-20px',
      right: '0',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '2px 4px',
      fontSize: '12px',
      borderRadius: '3px',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.2s',
      zIndex: 100
    });

    this.overlay.appendChild(this.handle);
    this.overlay.appendChild(this.sizeDisplay);
  }

  handleClick(event) {
    if (event.target && event.target.tagName === 'IMG') {
      if (this.img === event.target) return;
      
      if (this.img) {
        // we were just focused on another image
        this.hide();
      }
      // clicked on an image inside the editor
      this.show(event.target);
    } else if (this.img) {
      // clicked on a non image
      this.hide();
    }
  }

  show(img) {
    // keep track of this img element
    this.img = img;

    // Create and add the overlay
    this.createOverlay();
    this.quill.root.parentNode.appendChild(this.overlay);
    
    // Position overlay and handle
    this.repositionElements();

    // Add resize handle listener
    this.handle.addEventListener('mousedown', this.handleMousedown);

    // prevent spurious text selection
    this.setUserSelect('none');

    // listen for image deletion
    document.addEventListener('keyup', this.checkImage, true);
    this.quill.root.addEventListener('input', this.checkImage, true);
  }

  hide() {
    // Clear any pending timeout
    if (this.hideDisplayTimeout) {
      clearTimeout(this.hideDisplayTimeout);
      this.hideDisplayTimeout = null;
    }

    if (this.overlay) {
      // Remove the overlay
      this.quill.root.parentNode.removeChild(this.overlay);
      this.overlay = undefined;
      this.handle = undefined;
      this.sizeDisplay = undefined;

      // stop listening for image deletion or movement
      document.removeEventListener('keyup', this.checkImage);
      this.quill.root.removeEventListener('input', this.checkImage);

      // reset user-select
      this.setUserSelect('');
    }
    this.img = undefined;
  }

  repositionElements() {
    if (!this.overlay || !this.img) return;

    // position the overlay over the image
    const parent = this.quill.root.parentNode;
    const imgRect = this.img.getBoundingClientRect();
    const containerRect = parent.getBoundingClientRect();

    Object.assign(this.overlay.style, {
      left: `${imgRect.left - containerRect.left - 1 + parent.scrollLeft}px`,
      top: `${imgRect.top - containerRect.top + parent.scrollTop}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
    });
  }

  handleMousedown(event) {
    this.resizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.img.width;
    this.startHeight = this.img.height;
    this.aspectRatio = this.img.naturalWidth / this.img.naturalHeight;
    
    document.addEventListener('mousemove', this.handleMousemove);
    document.addEventListener('mouseup', this.handleMouseup);
    event.preventDefault();

    // Show size display
    if (this.sizeDisplay) {
      this.updateSizeDisplay();
    }
  }

  handleMousemove(event) {
    if (!this.resizing) return;

    const deltaX = event.clientX - this.startX;
    let newWidth = this.startWidth + deltaX;
    let newHeight = newWidth / this.aspectRatio;

    // Minimum size constraint
    const minSize = 50;
    if (newWidth < minSize) {
      newWidth = minSize;
      newHeight = minSize / this.aspectRatio;
    }

    // Maximum size constraint
    const maxSize = 1200;
    if (newWidth > maxSize) {
      newWidth = maxSize;
      newHeight = maxSize / this.aspectRatio;
    }

    this.img.width = Math.round(newWidth);
    this.img.height = Math.round(newHeight);
    
    // Update overlay position and size display
    this.repositionElements();
    this.updateSizeDisplay();
  }

  handleMouseup() {
    this.resizing = false;
    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('mouseup', this.handleMouseup);

    // Clear any existing timeout
    if (this.hideDisplayTimeout) {
      clearTimeout(this.hideDisplayTimeout);
    }

    // Set new timeout and store the reference
    if (this.sizeDisplay) {
      this.hideDisplayTimeout = setTimeout(() => {
        // Check if sizeDisplay still exists and we're not resizing
        if (this.sizeDisplay && !this.resizing) {
          this.sizeDisplay.style.opacity = '0';
        }
      }, 1500);
    }
  }

  updateSizeDisplay() {
    if (this.sizeDisplay && this.img) {
      this.sizeDisplay.textContent = `${Math.round(this.img.width)} × ${Math.round(this.img.height)}`;
      this.sizeDisplay.style.opacity = '1';
    }
  }

  setUserSelect(value) {
    ['userSelect', 'mozUserSelect', 'webkitUserSelect', 'msUserSelect']
      .forEach(prop => {
        this.quill.root.style[prop] = value;
        document.documentElement.style[prop] = value;
      });
  }

  checkImage(event) {
    if (this.img) {
      if (event.keyCode == 46 || event.keyCode == 8) {
        window.Quill.find(this.img).deleteAt(0);
      }
      this.hide();
    }
  }
}

// Register module with Quill
Quill.register('modules/imageResize', ImageResize);

export default ImageResize;