/**
 * MOBILE-ONLY JAVASCRIPT
 * Complete separation from desktop functionality
 */

(function() {
  'use strict';

  // Mobile-specific constants
  const MOBILE_CONFIG = {
    SWIPE_THRESHOLD: 50,
    TAP_TIMEOUT: 300,
    ANIMATION_DURATION: 250,
    SCROLL_THRESHOLD: 50,
    TOUCH_DELAY: 16,
    CART_ANIMATION_DURATION: 400,
    BOTTOM_NAV_HIDE_DELAY: 2000
  };

  // Mobile state management
  const MobileState = {
    isMenuOpen: false,
    isCartOpen: false,
    lastTouchY: 0,
    scrollDirection: 'up',
    isScrolling: false,
    touchStartTime: 0,
    swipeDirection: null,
    bottomNavVisible: true,
    keyboardOpen: false
  };

  // Touch and gesture utilities
  const MobileGestures = {
    // Handle swipe gestures
    handleSwipe: function(element, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown) {
      let startX = 0;
      let startY = 0;
      let startTime = 0;

      element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }, { passive: true });

      element.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const deltaTime = endTime - startTime;
        
        if (deltaTime > 300) return; // Too slow
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > MOBILE_CONFIG.SWIPE_THRESHOLD || absY > MOBILE_CONFIG.SWIPE_THRESHOLD) {
          if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0) {
              onSwipeRight && onSwipeRight();
              MobileState.swipeDirection = 'right';
            } else {
              onSwipeLeft && onSwipeLeft();
              MobileState.swipeDirection = 'left';
            }
          } else {
            // Vertical swipe
            if (deltaY > 0) {
              onSwipeDown && onSwipeDown();
              MobileState.swipeDirection = 'down';
            } else {
              onSwipeUp && onSwipeUp();
              MobileState.swipeDirection = 'up';
            }
          }
        }
      }, { passive: true });
    },

    // Add pull-to-refresh functionality
    addPullToRefresh: function(container, onRefresh) {
      let startY = 0;
      let currentY = 0;
      let pulling = false;
      let threshold = 80;

      const refreshIndicator = document.createElement('div');
      refreshIndicator.className = 'mobile-refresh-indicator';
      refreshIndicator.innerHTML = `
        <div class="mobile-refresh-spinner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83"/>
          </svg>
        </div>
        <div class="mobile-refresh-text">Pull to refresh</div>
      `;
      
      refreshIndicator.style.cssText = `
        position: absolute;
        top: -80px;
        left: 0;
        width: 100%;
        height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--mobile-gradient-subtle);
        color: var(--mobile-text-light);
        font-size: 0.9rem;
        gap: 0.5rem;
        transition: transform ${MOBILE_CONFIG.ANIMATION_DURATION}ms ease;
        z-index: 10;
      `;

      container.style.position = 'relative';
      container.insertBefore(refreshIndicator, container.firstChild);

      container.addEventListener('touchstart', (e) => {
        if (container.scrollTop === 0) {
          startY = e.touches[0].clientY;
          pulling = true;
        }
      }, { passive: true });

      container.addEventListener('touchmove', (e) => {
        if (!pulling) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 0 && container.scrollTop === 0) {
          e.preventDefault();
          const progress = Math.min(diff / threshold, 1);
          refreshIndicator.style.transform = `translateY(${diff}px)`;
          refreshIndicator.style.opacity = progress;
          
          if (progress >= 1) {
            refreshIndicator.querySelector('.mobile-refresh-text').textContent = 'Release to refresh';
          } else {
            refreshIndicator.querySelector('.mobile-refresh-text').textContent = 'Pull to refresh';
          }
        }
      });

      container.addEventListener('touchend', () => {
        if (!pulling) return;
        
        const diff = currentY - startY;
        
        if (diff >= threshold) {
          refreshIndicator.querySelector('.mobile-refresh-text').textContent = 'Refreshing...';
          refreshIndicator.querySelector('.mobile-refresh-spinner').style.animation = 'spin 1s linear infinite';
          
          onRefresh().finally(() => {
            refreshIndicator.style.transform = 'translateY(-80px)';
            refreshIndicator.style.opacity = '0';
            refreshIndicator.querySelector('.mobile-refresh-spinner').style.animation = '';
            refreshIndicator.querySelector('.mobile-refresh-text').textContent = 'Pull to refresh';
          });
        } else {
          refreshIndicator.style.transform = 'translateY(-80px)';
          refreshIndicator.style.opacity = '0';
        }
        
        pulling = false;
        startY = 0;
        currentY = 0;
      }, { passive: true });
    },

    // Add haptic feedback
    vibrate: function(pattern = 10) {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    }
  };

  // Mobile cart system
  const MobileCart = {
    items: [],

    init: function() {
      this.loadFromStorage();
      this.updateDisplay();
      this.bindEvents();
      this.initializeDrawer();
    },

    loadFromStorage: function() {
      try {
        this.items = JSON.parse(localStorage.getItem('mobileCart') || '[]');
      } catch (e) {
        console.warn('Failed to load mobile cart:', e);
        this.items = [];
      }
    },

    saveToStorage: function() {
      try {
        localStorage.setItem('mobileCart', JSON.stringify(this.items));
      } catch (e) {
        console.warn('Failed to save mobile cart:', e);
      }
    },

    addItem: function(productId, variantId, title, price, image, url) {
      console.log('Mobile: Adding to cart', { productId, variantId, title, price });
      
      const existingItem = this.items.find(item => item.variantId === variantId);
      
      if (existingItem) {
        existingItem.quantity += 1;
        this.showToast('Quantity updated!', 'success');
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
        this.showToast('Added to cart!', 'success');
      }

      this.saveToStorage();
      this.updateDisplay();
      this.animateCartButton();
      MobileGestures.vibrate([5, 5, 5]);
    },

    removeItem: function(variantId) {
      this.items = this.items.filter(item => item.variantId !== variantId);
      this.saveToStorage();
      this.updateDisplay();
      this.showToast('Removed from cart', 'info');
      MobileGestures.vibrate(10);
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
      this.showToast('Cart cleared', 'info');
    },

    updateDisplay: function() {
      const counts = document.querySelectorAll('.mobile-cart-count');
      const itemCount = this.getItemCount();
      
      counts.forEach(count => {
        count.textContent = itemCount;
        count.style.display = itemCount > 0 ? 'flex' : 'none';
      });

      this.updateDrawerContent();
    },

    updateDrawerContent: function() {
      const container = document.getElementById('mobileCartItems');
      const footer = document.getElementById('mobileCartFooter');
      const total = document.getElementById('mobileCartTotal');

      if (!container) return;

      if (this.items.length === 0) {
        container.innerHTML = `
          <div class="mobile-cart-empty">
            <div class="mobile-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3>Your cart is empty</h3>
            <p>Browse our products and add something you love!</p>
            <button class="mobile-btn-primary" onclick="closeMobileCart(); window.location.href='/collections/all'">
              Shop Now
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
          <div class="mobile-cart-item">
            <div class="mobile-cart-item-image">
              <img src="${item.image}" alt="${item.title}" loading="lazy">
            </div>
            <div class="mobile-cart-item-info">
              <h4 class="mobile-cart-item-title">${item.title}</h4>
              <div class="mobile-cart-item-price">₹${item.price.toFixed(2)}</div>
              <div class="mobile-cart-item-controls">
                <button class="mobile-qty-btn mobile-qty-minus" 
                        onclick="MobileCart.updateQuantity('${item.variantId}', ${item.quantity - 1})"
                        ${item.quantity <= 1 ? 'disabled' : ''}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <span class="mobile-qty-display">${item.quantity}</span>
                <button class="mobile-qty-btn mobile-qty-plus" 
                        onclick="MobileCart.updateQuantity('${item.variantId}', ${item.quantity + 1})">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="mobile-cart-item-actions">
              <div class="mobile-cart-item-total">₹${itemTotal.toFixed(2)}</div>
              <button class="mobile-remove-btn" onclick="MobileCart.removeItem('${item.variantId}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                </svg>
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = itemsHTML;
      footer.style.display = 'flex';
      
      if (total) {
        total.textContent = `₹${this.getTotal().toFixed(2)}`;
      }
    },

    initializeDrawer: function() {
      if (document.getElementById('mobileCartDrawer')) return;

      const drawer = document.createElement('div');
      drawer.id = 'mobileCartDrawer';
      drawer.className = 'mobile-cart-drawer';
      drawer.innerHTML = `
        <div class="mobile-cart-overlay" onclick="closeMobileCart()"></div>
        <div class="mobile-cart-panel">
          <div class="mobile-cart-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
                <path d="M20 22c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
                <path d="M1 1h4l2.68 13.39c.09.46.46.78.92.78h9.4c.46 0 .83-.32.92-.78L23 6H6"/>
              </svg>
              My Cart
            </h3>
            <button class="mobile-cart-close" onclick="closeMobileCart()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="mobile-cart-items" id="mobileCartItems"></div>
          <div class="mobile-cart-footer" id="mobileCartFooter">
            <div class="mobile-cart-summary">
              <div class="mobile-cart-total-row">
                <span>Total:</span>
                <span id="mobileCartTotal">₹0.00</span>
              </div>
              <div class="mobile-shipping-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16,6 20,6 23,11 23,16 16,16"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Free shipping on orders over ₹299
              </div>
            </div>
            <div class="mobile-cart-actions">
              <button class="mobile-btn-primary mobile-btn-full mobile-checkout-btn" 
                      onclick="proceedToMobileCheckout()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Secure Checkout
              </button>
            </div>
          </div>
        </div>
      `;

      // Add mobile cart styles
      const styles = document.createElement('style');
      styles.textContent = `
        .mobile-cart-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: 10000;
          visibility: hidden;
          opacity: 0;
          transition: all ${MOBILE_CONFIG.CART_ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .mobile-cart-drawer.active {
          visibility: visible;
          opacity: 1;
        }
        
        .mobile-cart-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        
        .mobile-cart-panel {
          position: absolute;
          bottom: -100%;
          left: 0;
          width: 100%;
          max-height: 85vh;
          background: white;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.15);
          transition: all ${MOBILE_CONFIG.CART_ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex;
          flex-direction: column;
        }
        
        .mobile-cart-drawer.active .mobile-cart-panel {
          bottom: 0;
        }
        
        .mobile-cart-header {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        
        .mobile-cart-header::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
        }
        
        .mobile-cart-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--mobile-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .mobile-cart-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--mobile-text-light);
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .mobile-cart-close:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        
        .mobile-cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          -webkit-overflow-scrolling: touch;
        }
        
        .mobile-cart-item {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          margin-bottom: 0.75rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
        }
        
        .mobile-cart-item-image img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          background: #f8fafc;
        }
        
        .mobile-cart-item-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--mobile-primary);
          margin-bottom: 0.25rem;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .mobile-cart-item-price {
          font-size: 0.8rem;
          color: var(--mobile-text-light);
          margin-bottom: 0.5rem;
        }
        
        .mobile-cart-item-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .mobile-qty-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: var(--mobile-primary);
        }
        
        .mobile-qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .mobile-qty-btn:not(:disabled):active {
          transform: scale(0.95);
          background: #f1f5f9;
        }
        
        .mobile-qty-display {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--mobile-primary);
          min-width: 20px;
          text-align: center;
        }
        
        .mobile-cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }
        
        .mobile-cart-item-total {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--mobile-accent);
        }
        
        .mobile-remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .mobile-remove-btn:active {
          background: rgba(239, 68, 68, 0.1);
          transform: scale(0.95);
        }
        
        .mobile-cart-footer {
          padding: 1.5rem;
          border-top: 1px solid #f1f5f9;
          background: #fafbfc;
          border-radius: 0 0 20px 20px;
        }
        
        .mobile-cart-summary {
          margin-bottom: 1.5rem;
        }
        
        .mobile-cart-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--mobile-primary);
          margin-bottom: 0.5rem;
        }
        
        .mobile-shipping-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--mobile-text-light);
        }
        
        .mobile-btn-primary {
          background: linear-gradient(135deg, var(--mobile-accent) 0%, #8b5cf6 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .mobile-btn-primary:active {
          transform: translateY(1px);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
        
        .mobile-btn-full {
          width: 100%;
        }
        
        .mobile-cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
        }
        
        .mobile-empty-icon {
          color: #cbd5e1;
          margin-bottom: 1.5rem;
        }
        
        .mobile-cart-empty h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--mobile-primary);
          margin-bottom: 0.5rem;
        }
        
        .mobile-cart-empty p {
          color: var(--mobile-text-light);
          margin-bottom: 2rem;
          line-height: 1.5;
        }
      `;

      document.head.appendChild(styles);
      document.body.appendChild(drawer);

      // Add swipe-to-close functionality
      MobileGestures.handleSwipe(
        drawer.querySelector('.mobile-cart-panel'),
        null, // left
        null, // right
        null, // up
        () => this.closeDrawer() // down
      );
    },

    openDrawer: function() {
      const drawer = document.getElementById('mobileCartDrawer');
      if (drawer) {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
        MobileState.isCartOpen = true;
        MobileGestures.vibrate(5);
      }
    },

    closeDrawer: function() {
      const drawer = document.getElementById('mobileCartDrawer');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
        MobileState.isCartOpen = false;
      }
    },

    animateCartButton: function() {
      const cartBtns = document.querySelectorAll('.mobile-cart-btn, .bottom-nav-item[onclick*="Cart"]');
      cartBtns.forEach(btn => {
        btn.style.transform = 'scale(1.1)';
        btn.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 200);
      });
    },

    showToast: function(message, type = 'info', duration = 3000) {
      // Remove existing toasts
      const existing = document.querySelectorAll('.mobile-toast');
      existing.forEach(toast => toast.remove());

      const toast = document.createElement('div');
      toast.className = `mobile-toast mobile-toast-${type}`;
      toast.textContent = message;
      
      const bgColor = type === 'success' ? '#10b981' : 
                      type === 'error' ? '#ef4444' : '#3b82f6';
      
      toast.style.cssText = `
        position: fixed;
        top: 120px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: ${bgColor};
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 90vw;
        text-align: center;
      `;

      document.body.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });

      // Auto remove
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.transform = 'translateX(-50%) translateY(-100px)';
          setTimeout(() => {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 300);
        }
      }, duration);
    },

    bindEvents: function() {
      // Close cart with back button
      window.addEventListener('popstate', () => {
        if (MobileState.isCartOpen) {
          this.closeDrawer();
        }
      });
    },

    proceedToCheckout: function() {
      if (this.items.length === 0) {
        this.showToast('Your cart is empty!', 'error');
        return;
      }

      console.log('Mobile: Proceeding to checkout with items:', this.items);
      
      const checkoutBtn = document.querySelector('.mobile-checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.innerHTML = `
          <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83"/>
          </svg>
          Processing...
        `;
        checkoutBtn.disabled = true;
      }

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
          // Redirect to checkout
          MobileGestures.vibrate([10, 10, 10]);
          window.location.href = '/checkout';
        })
        .catch(error => {
          console.error('Mobile checkout error:', error);
          this.showToast('Checkout failed. Please try again.', 'error');
          
          if (checkoutBtn) {
            checkoutBtn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              Secure Checkout
            `;
            checkoutBtn.disabled = false;
          }
        });
    }
  };

  // Mobile menu system
  const MobileMenu = {
    init: function() {
      this.bindEvents();
    },

    toggle: function() {
      if (MobileState.isMenuOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open: function() {
      const menu = document.getElementById('mobile-menu');
      const menuContent = menu?.querySelector('.mobile-menu-content');
      
      if (menu && menuContent) {
        menu.style.display = 'block';
        document.body.style.overflow = 'hidden';
        MobileState.isMenuOpen = true;
        
        // Animate menu slide in
        setTimeout(() => {
          menuContent.style.transform = 'translateX(0)';
        }, 10);
        
        MobileGestures.vibrate(5);
      }
    },

    close: function() {
      const menu = document.getElementById('mobile-menu');
      const menuContent = menu?.querySelector('.mobile-menu-content');
      
      if (menu && menuContent) {
        menuContent.style.transform = 'translateX(-300px)';
        document.body.style.overflow = '';
        MobileState.isMenuOpen = false;
        
        setTimeout(() => {
          menu.style.display = 'none';
        }, MOBILE_CONFIG.ANIMATION_DURATION);
      }
    },

    bindEvents: function() {
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (MobileState.isMenuOpen && 
            !e.target.closest('.mobile-menu-content') && 
            !e.target.closest('[onclick*="toggleMobileMenu"]')) {
          this.close();
        }
      });

      // Close with back button
      window.addEventListener('popstate', () => {
        if (MobileState.isMenuOpen) {
          this.close();
        }
      });
    }
  };

  // Mobile scroll effects
  const MobileScrollEffects = {
    init: function() {
      this.bindEvents();
      this.lastScrollTop = 0;
    },

    bindEvents: function() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    },

    handleScroll: function() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const bottomNav = document.querySelector('.bottom-nav');
      const mobileHeader = document.querySelector('.mobile-header');
      
      if (!bottomNav) return;

      // Determine scroll direction
      if (currentScrollTop > this.lastScrollTop && currentScrollTop > MOBILE_CONFIG.SCROLL_THRESHOLD) {
        // Scrolling down - hide bottom nav
        MobileState.scrollDirection = 'down';
        if (MobileState.bottomNavVisible) {
          bottomNav.style.transform = 'translateY(100%)';
          MobileState.bottomNavVisible = false;
        }
      } else {
        // Scrolling up - show bottom nav
        MobileState.scrollDirection = 'up';
        if (!MobileState.bottomNavVisible) {
          bottomNav.style.transform = 'translateY(0)';
          MobileState.bottomNavVisible = true;
        }
      }

      // Add scroll effect to header
      if (mobileHeader) {
        if (currentScrollTop > MOBILE_CONFIG.SCROLL_THRESHOLD) {
          mobileHeader.style.background = 'rgba(255, 255, 255, 0.95)';
          mobileHeader.style.backdropFilter = 'blur(10px)';
          mobileHeader.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
          mobileHeader.style.background = 'white';
          mobileHeader.style.backdropFilter = 'none';
          mobileHeader.style.boxShadow = 'none';
        }
      }

      this.lastScrollTop = currentScrollTop;
    }
  };

  // Mobile wishlist system
  const MobileWishlist = {
    items: [],

    init: function() {
      this.loadFromStorage();
      this.updateDisplay();
    },

    loadFromStorage: function() {
      try {
        const customerId = window.customerId || 'guest';
        const wishlistKey = `wishlist_${customerId}_mobile`;
        this.items = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      } catch (e) {
        console.warn('Failed to load mobile wishlist:', e);
        this.items = [];
      }
    },

    saveToStorage: function() {
      try {
        const customerId = window.customerId || 'guest';
        const wishlistKey = `wishlist_${customerId}_mobile`;
        localStorage.setItem(wishlistKey, JSON.stringify(this.items));
      } catch (e) {
        console.warn('Failed to save mobile wishlist:', e);
      }
    },

    toggle: function(productId, title, price, image, url) {
      const existingIndex = this.items.findIndex(item => item.id === productId);
      
      if (existingIndex !== -1) {
        this.items.splice(existingIndex, 1);
        MobileCart.showToast('Removed from wishlist!', 'info');
      } else {
        this.items.push({
          id: productId,
          title,
          price,
          image,
          url,
          addedAt: new Date().toISOString()
        });
        MobileCart.showToast('Added to wishlist!', 'success');
      }

      this.saveToStorage();
      this.updateDisplay();
      this.animateWishlistButton();
      MobileGestures.vibrate([5, 5, 5]);
    },

    isInWishlist: function(productId) {
      return this.items.some(item => item.id === productId);
    },

    updateDisplay: function() {
      const counts = document.querySelectorAll('.mobile-wishlist-count');
      const itemCount = this.items.length;
      
      counts.forEach(count => {
        count.textContent = itemCount;
        count.style.display = itemCount > 0 ? 'flex' : 'none';
      });

      // Update wishlist button states
      const wishlistBtns = document.querySelectorAll('.mobile-wishlist-btn[data-product-id]');
      wishlistBtns.forEach(btn => {
        const productId = btn.getAttribute('data-product-id');
        if (this.isInWishlist(productId)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    },

    animateWishlistButton: function() {
      const wishlistBtns = document.querySelectorAll('.mobile-wishlist-btn, .bottom-nav-item[href*="favorites"]');
      wishlistBtns.forEach(btn => {
        btn.style.transform = 'scale(1.1)';
        btn.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 300);
      });
    }
  };

  // Mobile viewport height fix for iOS
  const MobileViewport = {
    init: function() {
      this.setViewportHeight();
      this.bindEvents();
    },

    setViewportHeight: function() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    bindEvents: function() {
      window.addEventListener('resize', () => {
        this.setViewportHeight();
      });

      // Handle keyboard opening/closing
      if ('visualViewport' in window) {
        window.visualViewport.addEventListener('resize', () => {
          const currentHeight = window.visualViewport.height;
          const fullHeight = window.screen.height;
          
          if (currentHeight < fullHeight * 0.75) {
            // Keyboard is likely open
            MobileState.keyboardOpen = true;
            document.body.classList.add('keyboard-open');
          } else {
            // Keyboard is likely closed
            MobileState.keyboardOpen = false;
            document.body.classList.remove('keyboard-open');
          }
        });
      }
    }
  };

  // Global mobile functions (accessible from HTML)
  window.toggleMobileMenu = function() {
    MobileMenu.toggle();
  };

  window.openMobileCart = function() {
    MobileCart.openDrawer();
  };

  window.closeMobileCart = function() {
    MobileCart.closeDrawer();
  };

  window.proceedToMobileCheckout = function() {
    MobileCart.proceedToCheckout();
  };

  window.addToMobileCart = function(productId, variantId, title, price, image, url) {
    MobileCart.addItem(productId, variantId, title, price, image, url);
  };

  window.toggleMobileWishlist = function(productId, title, price, image, url) {
    MobileWishlist.toggle(productId, title, price, image, url);
  };

  // Initialize mobile functionality
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Mobile Experience Initialized');
    
    // Initialize all mobile modules
    MobileCart.init();
    MobileMenu.init();
    MobileScrollEffects.init();
    MobileWishlist.init();
    MobileViewport.init();
    
    // Set mobile-specific classes
    document.body.classList.add('mobile-ready');
    document.body.classList.add('touch-device');
    
    // Add pull-to-refresh to main content
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent) {
      MobileGestures.addPullToRefresh(mainContent, async () => {
        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        location.reload();
      });
    }
    
    // Add touch feedback to buttons
    document.addEventListener('touchstart', (e) => {
      if (e.target.matches('button, .btn, [role="button"]')) {
        e.target.style.transform = 'scale(0.98)';
        e.target.style.transition = 'transform 0.1s ease';
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (e.target.matches('button, .btn, [role="button"]')) {
        setTimeout(() => {
          e.target.style.transform = 'scale(1)';
        }, 100);
      }
    }, { passive: true });
    
    // Performance monitoring
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Mobile page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Track mobile-specific metrics
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          console.log(`Mobile connection: ${connection.effectiveType || 'unknown'}`);
        }
      });
    }
    
    // Make mobile objects globally accessible for debugging
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.search.includes('debug=true'))) {
      window.MobileCart = MobileCart;
      window.MobileWishlist = MobileWishlist;
      window.MobileGestures = MobileGestures;
      window.MobileState = MobileState;
    }
  });

  // Handle device orientation changes
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      MobileViewport.setViewportHeight();
    }, 100);
  });

  // Add CSS variables for dynamic viewport
  if (!document.querySelector('#mobile-viewport-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-viewport-styles';
    style.textContent = `
      .mobile-full-height {
        height: calc(var(--vh, 1vh) * 100);
      }
      
      .keyboard-open .bottom-nav {
        display: none;
      }
      
      .keyboard-open .mobile-cart-panel {
        max-height: calc(var(--vh, 1vh) * 60);
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

})();