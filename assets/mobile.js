/**
 * MOBILE JAVASCRIPT - CLEAN AND OPTIMIZED
 * Modern mobile interactions with touch-friendly interfaces
 */

(function() {
  'use strict';

  // Mobile state management
  const MobileState = {
    isMenuOpen: false,
    isCartOpen: false,
    isSearchOpen: false
  };

  // Mobile Menu Functions
  window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileSideMenu');
    if (menu) {
      MobileState.isMenuOpen = !MobileState.isMenuOpen;
      menu.classList.toggle('active', MobileState.isMenuOpen);
      document.body.style.overflow = MobileState.isMenuOpen ? 'hidden' : '';
    }
  };

  window.closeMobileMenu = function() {
    const menu = document.getElementById('mobileSideMenu');
    if (menu) {
      MobileState.isMenuOpen = false;
      menu.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Mobile Search Functions
  window.openMobileSearch = function() {
    const searchOverlay = document.getElementById('mobileSearchOverlay');
    const searchInput = document.getElementById('mobileSearchInput');
    if (searchOverlay) {
      MobileState.isSearchOpen = true;
      searchOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    }
  };

  window.closeMobileSearch = function() {
    const searchOverlay = document.getElementById('mobileSearchOverlay');
    if (searchOverlay) {
      MobileState.isSearchOpen = false;
      searchOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.performMobileSearch = function() {
    const searchInput = document.getElementById('mobileSearchInput');
    if (searchInput && searchInput.value.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.value.trim())}`;
    }
  };

  // Mobile Cart System
  const MobileCart = {
    items: [],
    
    init: function() {
      this.loadFromStorage();
      this.createCartDrawer();
      this.updateDisplay();
    },

    loadFromStorage: function() {
      try {
        const stored = localStorage.getItem('mobile_cart');
        this.items = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error loading cart from storage:', e);
        this.items = [];
      }
    },

    saveToStorage: function() {
      try {
        localStorage.setItem('mobile_cart', JSON.stringify(this.items));
      } catch (e) {
        console.error('Error saving cart to storage:', e);
      }
    },

    addItem: function(productId, variantId, title, price, image, url) {
      const existingItem = this.items.find(item => item.variantId === variantId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({
          productId: productId,
          variantId: variantId,
          title: title,
          price: parseFloat(price),
          image: image,
          url: url,
          quantity: 1
        });
      }
      
      this.saveToStorage();
      this.updateDisplay();
      this.showToast(`${title} added to cart!`);
    },

    removeItem: function(variantId) {
      this.items = this.items.filter(item => item.variantId !== variantId);
      this.saveToStorage();
      this.updateDisplay();
    },

    updateQuantity: function(variantId, quantity) {
      const item = this.items.find(item => item.variantId === variantId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(variantId);
        } else {
          item.quantity = quantity;
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
    },

    updateDisplay: function() {
      const cartCount = document.querySelector('.mobile-cart-count');
      const itemCount = this.getItemCount();
      
      if (cartCount) {
        cartCount.textContent = itemCount;
        cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
      }

      this.updateDrawerContent();
    },

    createCartDrawer: function() {
      const existingDrawer = document.getElementById('mobileCartDrawer');
      if (existingDrawer) return;

      const drawer = document.createElement('div');
      drawer.id = 'mobileCartDrawer';
      drawer.className = 'mobile-cart-drawer';
      drawer.innerHTML = `
        <div class="mobile-cart-overlay" onclick="closeMobileCart()"></div>
        <div class="mobile-cart-content">
          <div class="mobile-cart-header">
            <h3>Shopping Cart</h3>
            <button class="mobile-cart-close" onclick="closeMobileCart()">×</button>
          </div>
          <div class="mobile-cart-body" id="mobileCartBody">
            <!-- Cart items will be inserted here -->
          </div>
          <div class="mobile-cart-footer">
            <div class="mobile-cart-total">
              <strong>Total: ₹<span id="mobileCartTotal">0.00</span></strong>
            </div>
            <button class="mobile-checkout-btn" onclick="MobileCart.proceedToCheckout()">
              Proceed to Checkout
            </button>
          </div>
        </div>
      `;

      // Add CSS for cart drawer
      const style = document.createElement('style');
      style.textContent = `
        .mobile-cart-drawer {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2000;
          display: none;
        }
        .mobile-cart-drawer.active {
          display: block;
        }
        .mobile-cart-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
        }
        .mobile-cart-content {
          position: absolute;
          top: 0;
          right: 0;
          width: 80%;
          max-width: 400px;
          height: 100%;
          background: white;
          box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .mobile-cart-drawer.active .mobile-cart-content {
          transform: translateX(0);
        }
        .mobile-cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .mobile-cart-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        .mobile-cart-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 12px;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mobile-cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .mobile-cart-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .mobile-cart-total {
          text-align: center;
          margin-bottom: 1rem;
          font-size: 18px;
          color: #1f2937;
        }
        .mobile-checkout-btn {
          width: 100%;
          padding: 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 44px;
        }
        .mobile-checkout-btn:active {
          transform: scale(0.98);
          background: #4f46e5;
        }
        .mobile-cart-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .mobile-cart-item:last-child {
          border-bottom: none;
        }
        .mobile-cart-item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .mobile-cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mobile-cart-item-details {
          flex: 1;
        }
        .mobile-cart-item-title {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }
        .mobile-cart-item-price {
          font-size: 14px;
          color: #6366f1;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .mobile-cart-item-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mobile-qty-btn {
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
        .mobile-qty-btn:active {
          background: #e5e7eb;
        }
        .mobile-qty-input {
          width: 50px;
          text-align: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.25rem;
          font-size: 14px;
        }
        .mobile-remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 12px;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          margin-left: auto;
        }
        .mobile-remove-btn:active {
          background: rgba(239, 68, 68, 0.1);
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(drawer);
    },

    updateDrawerContent: function() {
      const cartBody = document.getElementById('mobileCartBody');
      const cartTotal = document.getElementById('mobileCartTotal');
      
      if (!cartBody || !cartTotal) return;

      if (this.items.length === 0) {
        cartBody.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #6b7280;">
            <p>Your cart is empty</p>
            <button onclick="closeMobileCart()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">Continue Shopping</button>
          </div>
        `;
        cartTotal.textContent = '0.00';
        return;
      }

      cartBody.innerHTML = this.items.map(item => `
        <div class="mobile-cart-item">
          <div class="mobile-cart-item-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
          </div>
          <div class="mobile-cart-item-details">
            <div class="mobile-cart-item-title">${item.title}</div>
            <div class="mobile-cart-item-price">₹${item.price.toFixed(2)}</div>
            <div class="mobile-cart-item-controls">
              <button class="mobile-qty-btn" onclick="MobileCart.updateQuantity('${item.variantId}', ${item.quantity - 1})">-</button>
              <input type="number" class="mobile-qty-input" value="${item.quantity}" onchange="MobileCart.updateQuantity('${item.variantId}', parseInt(this.value) || 1)" min="1">
              <button class="mobile-qty-btn" onclick="MobileCart.updateQuantity('${item.variantId}', ${item.quantity + 1})">+</button>
              <button class="mobile-remove-btn" onclick="MobileCart.removeItem('${item.variantId}')">Remove</button>
            </div>
          </div>
        </div>
      `).join('');

      cartTotal.textContent = this.getTotal().toFixed(2);
    },

    proceedToCheckout: function() {
      if (this.items.length === 0) {
        this.showToast('Your cart is empty');
        return;
      }

      // Add items to Shopify cart and redirect to checkout
      const formData = new FormData();
      this.items.forEach(item => {
        formData.append('items[][id]', item.variantId);
        formData.append('items[][quantity]', item.quantity);
      });

      fetch('/cart/add', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        window.location.href = '/checkout';
      })
      .catch(error => {
        console.error('Error adding items to cart:', error);
        this.showToast('Error adding items to cart');
      });
    },

    showToast: function(message) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        z-index: 3000;
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;

      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
        style.remove();
      }, 3000);
    }
  };

  // Mobile Cart Functions
  window.openMobileCart = function() {
    const cartDrawer = document.getElementById('mobileCartDrawer');
    if (cartDrawer) {
      MobileState.isCartOpen = true;
      cartDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeMobileCart = function() {
    const cartDrawer = document.getElementById('mobileCartDrawer');
    if (cartDrawer) {
      MobileState.isCartOpen = false;
      cartDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.addToMobileCart = function(productId, variantId, title, price, image, url) {
    MobileCart.addItem(productId, variantId, title, price, image, url);
  };

  // Initialize mobile functionality
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile experience initialized');
    
    // Add mobile-ready class
    document.body.classList.add('mobile-ready');
    
    // Initialize cart system
    MobileCart.init();
    
    // Handle search input
    const searchInput = document.getElementById('mobileSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          performMobileSearch();
        }
      });
    }

    // Close overlays when clicking outside
    document.addEventListener('click', function(e) {
      // Close search if clicking outside
      if (MobileState.isSearchOpen && !e.target.closest('.mobile-search-container') && !e.target.closest('.mobile-action-btn')) {
        closeMobileSearch();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (MobileState.isSearchOpen) closeMobileSearch();
        if (MobileState.isMenuOpen) closeMobileMenu();
        if (MobileState.isCartOpen) closeMobileCart();
      }
    });

    console.log('Mobile JavaScript loaded successfully');
  });

})();
