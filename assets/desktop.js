/**
 * DESKTOP-ONLY JAVASCRIPT
 * Complete separation from mobile functionality
 */

(function() {
  'use strict';

  // Desktop-specific constants
  const DESKTOP_CONFIG = {
    ANIMATION_DURATION: 400,
    SEARCH_DEBOUNCE: 300,
    HOVER_DELAY: 150,
    CART_ANIMATION_DURATION: 500,
    SCROLL_THRESHOLD: 100,
    SEARCH_MIN_CHARS: 2
  };

  // Desktop state management
  const DesktopState = {
    isMenuOpen: false,
    isSearchFocused: false,
    isCartOpen: false,
    currentHoverElement: null,
    searchCache: new Map(),
    scrollDirection: 'up',
    lastScrollTop: 0
  };

  // Desktop utility functions
  const DesktopUtils = {
    // Animation helpers
    fadeIn: function(element, duration = DESKTOP_CONFIG.ANIMATION_DURATION) {
      element.style.opacity = '0';
      element.style.display = 'block';
      element.style.transition = `opacity ${duration}ms ease`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });
    },

    fadeOut: function(element, duration = DESKTOP_CONFIG.ANIMATION_DURATION) {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = '0';
      
      setTimeout(() => {
        element.style.display = 'none';
      }, duration);
    },

    // Smooth animations
    slideDown: function(element, duration = DESKTOP_CONFIG.ANIMATION_DURATION) {
      element.style.height = '0px';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease`;
      element.style.display = 'block';
      
      const height = element.scrollHeight;
      requestAnimationFrame(() => {
        element.style.height = height + 'px';
      });
      
      setTimeout(() => {
        element.style.height = '';
        element.style.overflow = '';
      }, duration);
    },

    slideUp: function(element, duration = DESKTOP_CONFIG.ANIMATION_DURATION) {
      element.style.transition = `height ${duration}ms ease`;
      element.style.height = element.offsetHeight + 'px';
      
      requestAnimationFrame(() => {
        element.style.height = '0px';
      });
      
      setTimeout(() => {
        element.style.display = 'none';
        element.style.height = '';
      }, duration);
    },

    // Debounce function
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function for scroll events
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Smooth scroll to element
    smoothScrollTo: function(element, offset = 0) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    },

    // Format currency
    formatCurrency: function(amount, currency = 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(amount);
    }
  };

  // Desktop cart system
  const DesktopCart = {
    items: [],

    init: function() {
      this.loadFromStorage();
      this.updateDisplay();
      this.bindEvents();
      this.initializeDrawer();
    },

    loadFromStorage: function() {
      try {
        this.items = JSON.parse(localStorage.getItem('desktopCart') || '[]');
      } catch (e) {
        console.warn('Failed to load desktop cart:', e);
        this.items = [];
      }
    },

    saveToStorage: function() {
      try {
        localStorage.setItem('desktopCart', JSON.stringify(this.items));
      } catch (e) {
        console.warn('Failed to save desktop cart:', e);
      }
    },

    addItem: function(productId, variantId, title, price, image, url) {
      console.log('Desktop: Adding to cart', { productId, variantId, title, price });
      
      const existingItem = this.items.find(item => item.variantId === variantId);
      
      if (existingItem) {
        existingItem.quantity += 1;
        this.showNotification('Quantity updated in cart!', 'success');
      } else {
        this.items.push({
          productId,
          variantId,
          title,
          price: parseFloat(price),
          image,
          url,
          quantity: 1,
          addedAt: new Date().toISOString()
        });
        this.showNotification('Product added to cart!', 'success');
      }

      this.saveToStorage();
      this.updateDisplay();
      this.openDrawer();
      this.animateCartIcon();
    },

    removeItem: function(variantId) {
      this.items = this.items.filter(item => item.variantId !== variantId);
      this.saveToStorage();
      this.updateDisplay();
      this.showNotification('Product removed from cart!', 'info');
    },

    updateQuantity: function(variantId, quantity) {
      const item = this.items.find(item => item.variantId === variantId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(variantId);
        } else {
          item.quantity = parseInt(quantity);
          this.saveToStorage();
          this.updateDisplay();
        }
      }
    },

    getTotal: function() {
      return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getItemCount: function() {
      return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    clear: function() {
      this.items = [];
      this.saveToStorage();
      this.updateDisplay();
      this.showNotification('Cart cleared!', 'info');
    },

    updateDisplay: function() {
      const counts = document.querySelectorAll('.desktop-cart-count');
      const itemCount = this.getItemCount();
      
      counts.forEach(count => {
        count.textContent = itemCount;
        count.style.display = itemCount > 0 ? 'flex' : 'none';
      });

      this.updateDrawerContent();
    },

    updateDrawerContent: function() {
      const itemsContainer = document.getElementById('desktopCartItems');
      const footer = document.getElementById('desktopCartFooter');
      const total = document.getElementById('desktopCartTotal');

      if (!itemsContainer) return;

      if (this.items.length === 0) {
        itemsContainer.innerHTML = `
          <div class="desktop-cart-empty">
            <div class="desktop-empty-illustration">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3>Your cart is empty</h3>
            <p>Discover amazing products and add them to your cart!</p>
            <button class="desktop-btn desktop-btn-primary" onclick="closeDesktopCart()">
              Continue Shopping
            </button>
          </div>
        `;
        footer.style.display = 'none';
        return;
      }

      let itemsHTML = '';
      this.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        itemsHTML += `
          <div class="desktop-cart-item">
            <div class="desktop-cart-item-image">
              <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="desktop-cart-item-details">
              <h4 class="desktop-cart-item-title">${item.title}</h4>
              <div class="desktop-cart-item-price">₹${item.price.toFixed(2)} each</div>
              <div class="desktop-cart-item-controls">
                <button class="desktop-qty-btn" onclick="DesktopCart.updateQuantity('${item.variantId}', ${item.quantity - 1})">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <input type="number" value="${item.quantity}" min="1" 
                       onchange="DesktopCart.updateQuantity('${item.variantId}', this.value)"
                       class="desktop-qty-input">
                <button class="desktop-qty-btn" onclick="DesktopCart.updateQuantity('${item.variantId}', ${item.quantity + 1})">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="desktop-cart-item-actions">
              <div class="desktop-cart-item-total">₹${itemTotal.toFixed(2)}</div>
              <button class="desktop-remove-btn" onclick="DesktopCart.removeItem('${item.variantId}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Remove
              </button>
            </div>
          </div>
        `;
      });

      itemsContainer.innerHTML = itemsHTML;
      footer.style.display = 'block';
      
      if (total) {
        total.textContent = `₹${this.getTotal().toFixed(2)}`;
      }
    },

    initializeDrawer: function() {
      if (document.getElementById('desktopCartDrawer')) return;

      const drawer = document.createElement('div');
      drawer.id = 'desktopCartDrawer';
      drawer.className = 'desktop-cart-drawer';
      drawer.innerHTML = `
        <div class="desktop-cart-overlay" onclick="closeDesktopCart()"></div>
        <div class="desktop-cart-panel">
          <div class="desktop-cart-header">
            <h3>Shopping Cart</h3>
            <button class="desktop-cart-close" onclick="closeDesktopCart()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="desktop-cart-items" id="desktopCartItems"></div>
          <div class="desktop-cart-footer" id="desktopCartFooter">
            <div class="desktop-cart-summary">
              <div class="desktop-cart-subtotal">
                <span>Subtotal: </span>
                <span id="desktopCartTotal">₹0.00</span>
              </div>
              <div class="desktop-cart-shipping">
                <small>🚚 Free shipping on orders over ₹299</small>
              </div>
            </div>
            <div class="desktop-cart-actions">
              <button class="desktop-btn desktop-btn-primary desktop-btn-full desktop-checkout-btn" 
                      onclick="proceedToDesktopCheckout()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
                  <path d="M20 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
                  <path d="M1 1h4l2.68 13.39c.09.46.46.78.92.78h9.4c.46 0 .83-.32.92-.78L23 6H6"/>
                </svg>
                Proceed to Secure Checkout
              </button>
              <button class="desktop-btn desktop-btn-secondary desktop-btn-full" onclick="closeDesktopCart()">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      `;

      // Add styles
      const styles = document.createElement('style');
      styles.textContent = `
        .desktop-cart-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: 10000;
          visibility: hidden;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .desktop-cart-drawer.active {
          visibility: visible;
          opacity: 1;
        }
        
        .desktop-cart-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
        }
        
        .desktop-cart-panel {
          position: absolute;
          top: 0;
          right: -500px;
          width: 500px;
          height: 100%;
          background: white;
          box-shadow: -10px 0 40px rgba(0,0,0,0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        
        .desktop-cart-drawer.active .desktop-cart-panel {
          right: 0;
        }
        
        .desktop-cart-header {
          padding: 2rem;
          border-bottom: 1px solid var(--desktop-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--desktop-gradient-subtle);
        }
        
        .desktop-cart-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--desktop-primary);
          margin: 0;
        }
        
        .desktop-cart-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--desktop-text-light);
          padding: 0.5rem;
          border-radius: 50%;
          transition: var(--desktop-transition);
        }
        
        .desktop-cart-close:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          transform: scale(1.1);
        }
        
        .desktop-cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        
        .desktop-cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid var(--desktop-border);
          transition: var(--desktop-transition);
        }
        
        .desktop-cart-item:hover {
          background: rgba(99, 102, 241, 0.05);
        }
        
        .desktop-cart-item-image img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }
        
        .desktop-cart-item-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--desktop-primary);
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        
        .desktop-cart-item-price {
          font-size: 0.9rem;
          color: var(--desktop-text-light);
          margin-bottom: 1rem;
        }
        
        .desktop-cart-item-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .desktop-qty-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--desktop-border);
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--desktop-transition);
        }
        
        .desktop-qty-btn:hover {
          border-color: var(--desktop-accent);
          background: rgba(99, 102, 241, 0.1);
        }
        
        .desktop-qty-input {
          width: 50px;
          height: 32px;
          text-align: center;
          border: 1px solid var(--desktop-border);
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .desktop-cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
        }
        
        .desktop-cart-item-total {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--desktop-accent);
        }
        
        .desktop-remove-btn {
          background: none;
          border: none;
          color: var(--desktop-text-light);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: var(--desktop-transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        
        .desktop-remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        
        .desktop-cart-footer {
          padding: 2rem;
          border-top: 1px solid var(--desktop-border);
          background: var(--desktop-gradient-subtle);
        }
        
        .desktop-cart-summary {
          margin-bottom: 2rem;
        }
        
        .desktop-cart-subtotal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--desktop-primary);
          margin-bottom: 0.5rem;
        }
        
        .desktop-cart-shipping {
          text-align: center;
          color: var(--desktop-text-light);
        }
        
        .desktop-cart-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .desktop-cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }
        
        .desktop-empty-illustration {
          color: var(--desktop-border);
          margin-bottom: 2rem;
        }
        
        .desktop-cart-empty h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--desktop-primary);
          margin-bottom: 1rem;
        }
        
        .desktop-cart-empty p {
          color: var(--desktop-text-light);
          margin-bottom: 2rem;
          max-width: 300px;
          line-height: 1.5;
        }
      `;

      document.head.appendChild(styles);
      document.body.appendChild(drawer);
    },

    openDrawer: function() {
      const drawer = document.getElementById('desktopCartDrawer');
      if (drawer) {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
        DesktopState.isCartOpen = true;
      }
    },

    closeDrawer: function() {
      const drawer = document.getElementById('desktopCartDrawer');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
        DesktopState.isCartOpen = false;
      }
    },

    animateCartIcon: function() {
      const cartBtn = document.querySelector('.desktop-cart-btn');
      if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        cartBtn.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
          cartBtn.style.transform = 'scale(1)';
        }, 200);
      }
    },

    showNotification: function(message, type = 'info', duration = 4000) {
      // Remove existing notifications
      const existing = document.querySelectorAll('.desktop-notification');
      existing.forEach(notification => notification.remove());

      // Create new notification
      const notification = document.createElement('div');
      notification.className = `desktop-notification desktop-notification-${type}`;
      notification.innerHTML = `
        <div class="desktop-notification-content">
          <div class="desktop-notification-icon">
            ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
          </div>
          <div class="desktop-notification-message">${message}</div>
          <button class="desktop-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;
      
      notification.style.cssText = `
        position: fixed;
        top: 140px;
        right: 30px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 12px;
        box-shadow: var(--desktop-shadow-lg);
        z-index: 10001;
        transform: translateX(100%);
        transition: var(--desktop-transition);
        min-width: 320px;
        max-width: 400px;
      `;

      const contentStyles = `
        .desktop-notification-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
        }
        .desktop-notification-icon {
          font-size: 1.2rem;
          font-weight: bold;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
        }
        .desktop-notification-message {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 500;
        }
        .desktop-notification-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.5rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s ease;
        }
        .desktop-notification-close:hover {
          background: rgba(255,255,255,0.2);
        }
      `;

      if (!document.querySelector('#desktop-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'desktop-notification-styles';
        style.textContent = contentStyles;
        document.head.appendChild(style);
      }

      document.body.appendChild(notification);

      // Animate in
      requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
      });

      // Auto remove
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, DESKTOP_CONFIG.ANIMATION_DURATION);
        }
      }, duration);
    },

    bindEvents: function() {
      // Close cart with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DesktopState.isCartOpen) {
          this.closeDrawer();
        }
      });
    },

    proceedToCheckout: function() {
      if (this.items.length === 0) {
        this.showNotification('Your cart is empty!', 'error');
        return;
      }

      console.log('Desktop: Proceeding to checkout with items:', this.items);
      
      // Clear Shopify cart first
      fetch('/cart/clear.js', { method: 'POST' })
        .then(() => {
          // Add items to Shopify cart
          const cartItems = this.items.map(item => ({
            id: parseInt(item.variantId),
            quantity: item.quantity
          }));

          return fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems })
          });
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to add items to cart');
          return response.json();
        })
        .then(() => {
          // Show loading state
          const checkoutBtn = document.querySelector('.desktop-checkout-btn');
          if (checkoutBtn) {
            checkoutBtn.innerHTML = '<svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83"/></svg> Processing...';
            checkoutBtn.disabled = true;
          }
          
          // Redirect to checkout
          setTimeout(() => {
            window.location.href = '/checkout';
          }, 500);
        })
        .catch(error => {
          console.error('Desktop checkout error:', error);
          this.showNotification('Checkout failed. Please try again.', 'error');
          
          const checkoutBtn = document.querySelector('.desktop-checkout-btn');
          if (checkoutBtn) {
            checkoutBtn.innerHTML = 'Proceed to Secure Checkout';
            checkoutBtn.disabled = false;
          }
        });
    }
  };

  // Desktop search functionality
  const DesktopSearch = {
    searchInput: null,
    suggestionsContainer: null,
    searchDebounced: null,

    init: function() {
      this.bindEvents();
      this.searchDebounced = DesktopUtils.debounce(this.showSuggestions.bind(this), DESKTOP_CONFIG.SEARCH_DEBOUNCE);
      this.initializeElements();
    },

    initializeElements: function() {
      this.searchInput = document.getElementById('desktopSearchInput');
      this.suggestionsContainer = document.getElementById('desktopSearchSuggestions');
    },

    showSearchInput: function() {
      console.log('Showing search input...');
      // Create search input if it doesn't exist
      if (!this.searchInput) {
        this.createSearchInput();
      }
      
      if (this.searchInput) {
        this.searchInput.style.display = 'block';
        this.searchInput.focus();
        console.log('Search input shown and focused');
      } else {
        console.log('Failed to create search input');
      }
    },

             createSearchInput: function() {
           // Find the header and logo area
           const header = document.querySelector('.desktop-header');
           const logoArea = document.querySelector('.desktop-logo');
           
           if (!header || !logoArea) {
             console.log('Header or logo area not found');
             return;
           }
           
           // Store original logo HTML for restoration
           this.originalLogoHTML = logoArea.outerHTML;
           
           // Create search input container
           const searchContainer = document.createElement('div');
           searchContainer.id = 'desktopSearchContainer';
           searchContainer.style.cssText = `
             position: relative;
             background: white;
             border: 2px solid #ddd;
             border-radius: 25px;
             box-shadow: 0 2px 10px rgba(0,0,0,0.1);
             z-index: 1002;
             padding: 0.5rem;
             color: black;
             width: 100%;
             max-width: 400px;
             margin: 0 auto;
           `;

                 // Create search input
           this.searchInput = document.createElement('input');
           this.searchInput.id = 'desktopSearchInput';
           this.searchInput.type = 'search';
           this.searchInput.placeholder = 'Search products...';
           this.searchInput.style.cssText = `
             width: 100%;
             padding: 0.5rem 1rem;
             border: none;
             outline: none;
             font-family: 'Poppins', sans-serif;
             font-size: 1rem;
             background: transparent;
             color: black;
             transition: border-color 0.3s ease;
           `;

                 // Create suggestions container
           this.suggestionsContainer = document.createElement('div');
           this.suggestionsContainer.id = 'desktopSearchSuggestions';
           this.suggestionsContainer.style.cssText = `
             position: absolute;
             top: 100%;
             left: 0;
             right: 0;
             max-height: 400px;
             overflow-y: auto;
             background: white;
             color: black;
             border: 1px solid #eee;
             border-radius: 8px;
             margin-top: 0.5rem;
             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
             z-index: 1003;
           `;

      // Add close button
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '✕';
      closeButton.style.cssText = `
        position: absolute;
        top: 50%;
        right: 0.5rem;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #666;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background-color 0.3s ease;
      `;
      closeButton.addEventListener('click', () => this.hideSearchInput());
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.backgroundColor = '#f0f0f0';
      });
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.backgroundColor = 'transparent';
      });

      // Add elements to container
      searchContainer.appendChild(this.searchInput);
      searchContainer.appendChild(this.suggestionsContainer);
      searchContainer.appendChild(closeButton);
      
      // Replace logo area with search container
      const headerCenter = document.querySelector('.desktop-header-center');
      if (headerCenter) {
        headerCenter.innerHTML = '';
        headerCenter.appendChild(searchContainer);
      }
      
      // Show all products by default
      this.showAllProducts();

      // Bind events
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        console.log('Search input:', query);
        
        if (query.length >= 2) {
          this.showSuggestions();
        } else if (query.length === 0) {
          this.showAllProducts();
        } else {
          this.hideSuggestions();
        }
      });
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.hideSearchInput();
        }
      });
      this.searchInput.addEventListener('focus', () => {
        this.searchInput.style.borderColor = '#007bff';
      });
      this.searchInput.addEventListener('blur', () => {
        this.searchInput.style.borderColor = '#ddd';
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !e.target.closest('.desktop-search-toggle')) {
          this.hideSearchInput();
        }
      });
    },

    hideSearchInput: function() {
      if (this.searchInput) {
        this.searchInput.style.display = 'none';
        this.searchInput.value = '';
        if (this.suggestionsContainer) {
          this.suggestionsContainer.style.display = 'none';
        }
      }
      
      // Restore original logo
      const headerCenter = document.querySelector('.desktop-header-center');
      const searchContainer = document.getElementById('desktopSearchContainer');
      
      if (headerCenter && searchContainer && this.originalLogoHTML) {
        headerCenter.innerHTML = this.originalLogoHTML;
        searchContainer.remove();
      }
    },

    showAllProducts: function() {
      if (!this.suggestionsContainer) return;
      
      this.suggestionsContainer.style.display = 'block';
      this.suggestionsContainer.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: black;">Loading all products...</div>
      `;
      
      fetch('/collections/all/products.json')
        .then(response => response.json())
        .then(data => {
          const products = data.products || [];
          this.displayProductSuggestions(products);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          this.suggestionsContainer.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: black;">Error loading products</div>
          `;
        });
    },

    hideSuggestions: function() {
      if (this.suggestionsContainer) {
        this.suggestionsContainer.style.display = 'none';
      }
    },

    performSearch: function() {
      if (!this.searchInput || !this.searchInput.value.trim()) return;

      const query = this.searchInput.value.trim();
      console.log('Desktop search:', query);
      
      // Store search in cache for quick access
      DesktopState.searchCache.set(query.toLowerCase(), Date.now());
      
      // Redirect to search results
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    },

    showSuggestions: function() {
      if (!this.searchInput || !this.suggestionsContainer) return;
      
      const query = this.searchInput.value.trim();
      console.log('Showing suggestions for:', query);
      
      if (query.length < 2) {
        this.hideSuggestions();
        return;
      }

      // Show loading state
      this.suggestionsContainer.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: black;">Loading products...</div>
      `;
      this.suggestionsContainer.style.display = 'block';

      // Fetch real products from Shopify
      this.fetchProducts(query);
    },

    fetchProducts: function(query) {
      fetch('/collections/all/products.json')
        .then(response => response.json())
        .then(data => {
          const products = data.products || [];
          const filtered = products.filter(product => 
            product.title.toLowerCase().includes(query.toLowerCase())
          );
          this.displayProductSuggestions(filtered);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          this.suggestionsContainer.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: black;">Error loading products</div>
          `;
        });
    },

    displayProductSuggestions: function(products) {
      if (!this.suggestionsContainer) return;
      
      if (products.length === 0) {
        this.suggestionsContainer.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: black;">No products found</div>
        `;
        return;
      }
      
      const suggestionsHTML = products.slice(0, 8).map(product => {
        const image = product.images && product.images.length > 0 ? product.images[0].src : '';
        const price = product.variants && product.variants.length > 0 ? product.variants[0].price : '0';
        const comparePrice = product.variants && product.variants.length > 0 ? product.variants[0].compare_at_price : null;
        const productUrl = `/products/${product.handle}`;
        
        return `
          <div style="display: flex; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid #eee; cursor: pointer; color: black;" 
               onclick="window.location.href='${productUrl}'">
            <img src="${image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 1rem; border-radius: 4px;">
            <div style="flex: 1;">
              <div style="font-weight: 500; margin-bottom: 0.25rem; font-size: 0.9rem;">${product.title}</div>
              <div style="color: #666; font-size: 0.8rem;">
                ${comparePrice ? `<span style="text-decoration: line-through; margin-right: 0.5rem;">₹${comparePrice}</span>` : ''}
                ₹${price}
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      this.suggestionsContainer.innerHTML = suggestionsHTML;
    },

    renderSuggestions: function(query) {
      if (!this.suggestionsContainer) return;

      // Mock suggestions (replace with real search API)
      const suggestions = [
        { type: 'product', title: `Search for "${query}"`, action: () => this.performSearch() },
        { type: 'category', title: 'Kitchen & Dining', action: () => window.location.href = '/collections/kitchen' },
        { type: 'category', title: 'Home & Garden', action: () => window.location.href = '/collections/home' },
        { type: 'recent', title: 'Recent: Oil Dispenser', action: () => this.searchFor('Oil Dispenser') }
      ];

      let suggestionsHTML = '';
      suggestions.forEach(suggestion => {
        const icon = suggestion.type === 'product' ? '🔍' : 
                    suggestion.type === 'category' ? '📂' : '🕐';
        
        suggestionsHTML += `
          <div class="desktop-suggestion-item" onclick="this.click()">
            <span class="desktop-suggestion-icon">${icon}</span>
            <span class="desktop-suggestion-text">${suggestion.title}</span>
            <svg class="desktop-suggestion-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        `;
      });

      this.suggestionsContainer.innerHTML = suggestionsHTML;
      this.suggestionsContainer.style.display = 'block';

      // Add styles if not already added
      if (!document.querySelector('#desktop-search-styles')) {
        const style = document.createElement('style');
        style.id = 'desktop-search-styles';
        style.textContent = `
          .desktop-search-loading {
            padding: 1rem;
            text-align: center;
            color: var(--desktop-text-light);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          
          .desktop-suggestion-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: var(--desktop-transition);
            border-bottom: 1px solid var(--desktop-border);
          }
          
          .desktop-suggestion-item:hover {
            background: var(--desktop-gradient-subtle);
            transform: translateX(4px);
          }
          
          .desktop-suggestion-item:last-child {
            border-bottom: none;
          }
          
          .desktop-suggestion-icon {
            font-size: 1rem;
          }
          
          .desktop-suggestion-text {
            flex: 1;
            font-size: 0.9rem;
            color: var(--desktop-text);
          }
          
          .desktop-suggestion-arrow {
            color: var(--desktop-text-light);
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          
          .desktop-suggestion-item:hover .desktop-suggestion-arrow {
            opacity: 1;
          }
          
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    },

    hideSuggestions: function() {
      if (this.suggestionsContainer) {
        DesktopUtils.fadeOut(this.suggestionsContainer, 200);
      }
    },

    searchFor: function(query) {
      if (this.searchInput) {
        this.searchInput.value = query;
        this.performSearch();
      }
    },

    bindEvents: function() {
      // Search input events
      document.addEventListener('input', (e) => {
        if (e.target.id === 'desktopSearchInput') {
          this.searchDebounced();
        }
      });

      document.addEventListener('keypress', (e) => {
        if (e.target.id === 'desktopSearchInput' && e.key === 'Enter') {
          e.preventDefault();
          this.performSearch();
        }
      });

      document.addEventListener('focus', (e) => {
        if (e.target.id === 'desktopSearchInput') {
          DesktopState.isSearchFocused = true;
          if (e.target.value.length >= DESKTOP_CONFIG.SEARCH_MIN_CHARS) {
            this.searchDebounced();
          }
        }
      });

      document.addEventListener('blur', (e) => {
        if (e.target.id === 'desktopSearchInput') {
          DesktopState.isSearchFocused = false;
          setTimeout(() => {
            if (!DesktopState.isSearchFocused) {
              this.hideSuggestions();
            }
          }, 200);
        }
      });

      // Click outside to close suggestions
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.desktop-search-container')) {
          this.hideSuggestions();
        }
      });
    }
  };

  // Desktop menu functionality
  const DesktopMenu = {
    init: function() {
      this.bindEvents();
    },

    toggle: function() {
      if (DesktopState.isMenuOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function() {
      const menu = document.getElementById('desktopSideMenu');
      if (menu) {
        menu.classList.add('active');
        document.body.style.overflow = 'hidden';
        DesktopState.isMenuOpen = true;
      }
    },

    close: function() {
      const menu = document.getElementById('desktopSideMenu');
      if (menu) {
        menu.classList.remove('active');
        document.body.style.overflow = '';
        DesktopState.isMenuOpen = false;
      }
    },

    bindEvents: function() {
      // Menu overlay close
      const overlay = document.querySelector('.desktop-menu-overlay');
      if (overlay) {
        overlay.addEventListener('click', () => this.close());
      }

      // Close with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DesktopState.isMenuOpen) {
          this.close();
        }
      });
    }
  };

  // Desktop scroll effects
  const DesktopScrollEffects = {
    init: function() {
      this.bindEvents();
      this.handleScroll = DesktopUtils.throttle(this.handleScroll.bind(this), 16);
    },

    bindEvents: function() {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
    },

    handleScroll: function() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const header = document.querySelector('.desktop-header');
      
      if (!header) return;

      // Determine scroll direction
      if (currentScrollTop > DesktopState.lastScrollTop) {
        DesktopState.scrollDirection = 'down';
      } else {
        DesktopState.scrollDirection = 'up';
      }

      // Add scroll effect to header
      if (currentScrollTop > DESKTOP_CONFIG.SCROLL_THRESHOLD) {
        header.classList.add('scrolled');
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
      } else {
        header.classList.remove('scrolled');
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
      }

      DesktopState.lastScrollTop = currentScrollTop;
    }
  };

  // Desktop wishlist functionality
  const DesktopWishlist = {
    items: [],

    init: function() {
      this.loadFromStorage();
      this.updateDisplay();
    },

    loadFromStorage: function() {
      try {
        const customerId = window.customerId || 'guest';
        const wishlistKey = `wishlist_${customerId}_desktop`;
        this.items = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      } catch (e) {
        console.warn('Failed to load desktop wishlist:', e);
        this.items = [];
      }
    },

    saveToStorage: function() {
      try {
        const customerId = window.customerId || 'guest';
        const wishlistKey = `wishlist_${customerId}_desktop`;
        localStorage.setItem(wishlistKey, JSON.stringify(this.items));
      } catch (e) {
        console.warn('Failed to save desktop wishlist:', e);
      }
    },

    toggle: function(productId, title, price, image, url) {
      const existingIndex = this.items.findIndex(item => item.id === productId);
      
      if (existingIndex !== -1) {
        this.items.splice(existingIndex, 1);
        DesktopCart.showNotification('Removed from wishlist!', 'info');
      } else {
        this.items.push({
          id: productId,
          title,
          price,
          image,
          url,
          addedAt: new Date().toISOString()
        });
        DesktopCart.showNotification('Added to wishlist!', 'success');
      }

      this.saveToStorage();
      this.updateDisplay();
      this.animateWishlistIcon();
    },

    isInWishlist: function(productId) {
      return this.items.some(item => item.id === productId);
    },

    updateDisplay: function() {
      const counts = document.querySelectorAll('.desktop-wishlist-count');
      const itemCount = this.items.length;
      
      counts.forEach(count => {
        count.textContent = itemCount;
        count.style.display = itemCount > 0 ? 'flex' : 'none';
      });

      // Update wishlist button states
      const wishlistBtns = document.querySelectorAll('.desktop-wishlist-btn[data-product-id]');
      wishlistBtns.forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        if (this.isInWishlist(productId)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    animateWishlistIcon: function() {
      const wishlistBtn = document.querySelector('.desktop-wishlist-btn');
      if (wishlistBtn) {
        wishlistBtn.style.transform = 'scale(1.1)';
        wishlistBtn.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
          wishlistBtn.style.transform = 'scale(1)';
        }, 300);
      }
    }
  };

  // Global desktop functions (accessible from HTML)
  window.toggleDesktopMenu = function() {
    DesktopMenu.toggle();
  };

  window.closeDesktopMenu = function() {
    DesktopMenu.close();
  };

  window.performDesktopSearch = function() {
    DesktopSearch.performSearch();
  };

  window.toggleSearch = function() {
    console.log('toggleSearch called');
    if (DesktopSearch && DesktopSearch.showSearchInput) {
      DesktopSearch.showSearchInput();
    } else {
      console.log('DesktopSearch not available');
    }
  };

  window.openDesktopCart = function() {
    DesktopCart.openDrawer();
  };

  window.closeDesktopCart = function() {
    DesktopCart.closeDrawer();
  };

  window.proceedToDesktopCheckout = function() {
    DesktopCart.proceedToCheckout();
  };

  window.addToDesktopCart = function(productId, variantId, title, price, image, url) {
    DesktopCart.addItem(productId, variantId, title, price, image, url);
  };

  window.toggleDesktopWishlist = function(productId, title, price, image, url) {
    DesktopWishlist.toggle(productId, title, price, image, url);
  };

  // Initialize desktop functionality - Show content immediately
  function initializeDesktop() {
    console.log('🖥️ Desktop Experience Initialized');
    
    // Show content immediately
    document.body.classList.add('desktop-ready');
    document.body.style.visibility = 'visible';
    
    // Initialize all desktop modules
    DesktopCart.init();
    DesktopSearch.init();
    DesktopMenu.init();
    DesktopScrollEffects.init();
    DesktopWishlist.init();
  }

  // Call initialization function
  document.addEventListener('DOMContentLoaded', initializeDesktop);
  
  // Fallback - call immediately if DOM is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDesktop);
  } else {
    initializeDesktop();
  }
  
  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Desktop page loaded in ${loadTime.toFixed(2)}ms`);
      
      // Track Core Web Vitals
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            console.log(`Desktop ${entry.name}: ${entry.value.toFixed(2)}`);
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      }
    });
  }
  
  // Make desktop objects globally accessible for debugging
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.search.includes('debug=true'))) {
    window.DesktopCart = DesktopCart;
    window.DesktopWishlist = DesktopWishlist;
    window.DesktopUtils = DesktopUtils;
    window.DesktopState = DesktopState;
  }
  
  // Add smooth scrolling to all internal links
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          DesktopUtils.smoothScrollTo(target, 120);
        }
      });
    });
  });

  // Handle window resize
  window.addEventListener('resize', DesktopUtils.debounce(() => {
    // Re-calculate any layout-dependent functionality
    console.log('Desktop: Window resized');
  }, 250));

})();
