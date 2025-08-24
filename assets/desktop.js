/**
 * DESKTOP JAVASCRIPT - CLEAN AND OPTIMIZED
 * Modern desktop interactions with hover effects and animations
 */

(function() {
  'use strict';

  // Desktop state management
  const DesktopState = {
    isMenuOpen: false,
    isSearchOpen: false,
    isCartOpen: false
  };

  // Desktop Search System
  const DesktopSearch = {
    searchInput: null,
    suggestionsContainer: null,
    originalLogoHTML: '',

    showSearchInput: function() {
      const headerCenter = document.querySelector('.desktop-header-center');
      const logoArea = document.querySelector('.desktop-logo');
      
      if (!headerCenter || !logoArea) return;

      // Remove any existing search
      this.hideSearchInput();

      // Store original logo HTML
      this.originalLogoHTML = logoArea.outerHTML;
      
      // Hide logo
      logoArea.style.display = 'none';

      // Create search container
      const searchContainer = document.createElement('div');
      searchContainer.id = 'desktopSearchContainer';
      searchContainer.style.cssText = `
        position: relative;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
      `;

      // Create search input
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.id = 'desktopSearchInput';
      searchInput.placeholder = 'Search products...';
      searchInput.style.cssText = `
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        border: 2px solid #6366f1;
        border-radius: 12px;
        font-size: 16px;
        outline: none;
        background: white;
        color: #1f2937;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      `;

      // Create close button
      const closeButton = document.createElement('button');
      closeButton.id = 'desktopSearchCloseButton';
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 6px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      closeButton.onclick = () => this.hideSearchInput();

      // Create suggestions container
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.id = 'desktopSearchSuggestions';
      suggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        margin-top: 0.5rem;
        max-height: 400px;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        display: none;
      `;

      // Assemble search container
      searchContainer.appendChild(searchInput);
      searchContainer.appendChild(closeButton);
      searchContainer.appendChild(suggestionsContainer);
      headerCenter.appendChild(searchContainer);

      // Store references
      this.searchInput = searchInput;
      this.suggestionsContainer = suggestionsContainer;

      // Focus and show all products
      searchInput.focus();
      this.showAllProducts();

      // Add event listeners
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 1) {
          this.showSuggestions(query);
        } else {
          this.showAllProducts();
        }
      });

      // Close on outside click
      setTimeout(() => {
        const outsideClickHandler = (e) => {
          if (!searchContainer.contains(e.target)) {
            this.hideSearchInput();
            document.removeEventListener('click', outsideClickHandler);
          }
        };
        document.addEventListener('click', outsideClickHandler);
      }, 100);

      DesktopState.isSearchOpen = true;
    },

    hideSearchInput: function() {
      const searchContainer = document.getElementById('desktopSearchContainer');
      const headerCenter = document.querySelector('.desktop-header-center');
      
      if (searchContainer) {
        searchContainer.remove();
      }

      // Restore the logo properly
      if (headerCenter && this.originalLogoHTML) {
        headerCenter.innerHTML = this.originalLogoHTML;
      }

      this.searchInput = null;
      this.suggestionsContainer = null;
      this.originalLogoHTML = null; // Clear the stored HTML
      DesktopState.isSearchOpen = false;
    },

    showAllProducts: function() {
      if (!this.suggestionsContainer) return;
      
      this.suggestionsContainer.style.display = 'block';
      this.suggestionsContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: #6b7280;">Loading all products...</div>';
      
      this.fetchProducts().then(products => {
        this.displayProductSuggestions(products);
      });
    },

    showSuggestions: function(query) {
      if (!this.suggestionsContainer) return;
      
      if (query.length < 1) {
        this.showAllProducts();
        return;
      }

      this.fetchProducts().then(products => {
        const filteredProducts = products.filter(product => 
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.price.toString().includes(query)
        );
        this.displayProductSuggestions(filteredProducts);
      });
    },

    fetchProducts: function() {
      return fetch('/collections/all/products.json')
        .then(response => response.json())
        .then(data => data.products || [])
        .catch(error => {
          console.error('Error fetching products:', error);
          return [];
        });
    },

    displayProductSuggestions: function(products) {
      if (!this.suggestionsContainer) return;

      if (products.length === 0) {
        this.suggestionsContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: #6b7280;">No products found</div>';
        this.suggestionsContainer.style.display = 'block';
        return;
      }

      const html = products.slice(0, 10).map(product => {
        const image = product.images && product.images[0] ? product.images[0] : '';
        const price = product.variants && product.variants[0] ? product.variants[0].price : 0;
        const comparePrice = product.variants && product.variants[0] && product.variants[0].compare_at_price ? product.variants[0].compare_at_price : null;
        
        return `
          <div style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.2s;" 
               onmouseover="this.style.background='#f9fafb'" 
               onmouseout="this.style.background='white'"
               onclick="window.location.href='/products/${product.handle}'">
            <img src="${image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 1rem;" loading="lazy">
            <div style="flex: 1;">
              <div style="font-size: 14px; font-weight: 500; color: #1f2937; margin-bottom: 0.25rem;">${product.title}</div>
              <div style="font-size: 14px; color: #6366f1; font-weight: 600;">
                ${comparePrice && comparePrice > price ? `<span style="text-decoration: line-through; color: #9ca3af; margin-right: 0.5rem;">₹${comparePrice}</span>` : ''}
                ₹${price}
              </div>
            </div>
          </div>
        `;
      }).join('');

      this.suggestionsContainer.innerHTML = html;
      this.suggestionsContainer.style.display = 'block';
    }
  };

  // Desktop Menu System
  const DesktopMenu = {
    toggleBurgerMenu: function() {
      const burgerMenu = document.getElementById('burgerMenu');
      const burgerOverlay = document.getElementById('burgerOverlay');
      
      if (burgerMenu && burgerOverlay) {
        DesktopState.isMenuOpen = !DesktopState.isMenuOpen;
        burgerMenu.classList.toggle('active', DesktopState.isMenuOpen);
        burgerOverlay.classList.toggle('active', DesktopState.isMenuOpen);
        document.body.style.overflow = DesktopState.isMenuOpen ? 'hidden' : '';
      }
    },

    closeBurgerMenu: function() {
      const burgerMenu = document.getElementById('burgerMenu');
      const burgerOverlay = document.getElementById('burgerOverlay');
      
      if (burgerMenu && burgerOverlay) {
        DesktopState.isMenuOpen = false;
        burgerMenu.classList.remove('active');
        burgerOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  };

  // Desktop Cart System
  const DesktopCart = {
    items: [],
    
    init: function() {
      this.loadFromStorage();
      this.initializeDrawer();
      this.updateDisplay();
    },

    loadFromStorage: function() {
      try {
        const stored = localStorage.getItem('desktop_cart');
        this.items = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error loading cart from storage:', e);
        this.items = [];
      }
    },

    saveToStorage: function() {
      try {
        localStorage.setItem('desktop_cart', JSON.stringify(this.items));
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
      this.showNotification(`${title} added to cart!`);
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
      const counts = document.querySelectorAll('.desktop-cart-count');
      const itemCount = this.getItemCount();
      
      counts.forEach(count => {
        count.textContent = itemCount;
        count.style.display = itemCount > 0 ? 'flex' : 'none';
      });

      this.updateDrawerContent();
      
      // Call global update function if available
      if (window.updateGlobalCartCount) {
        window.updateGlobalCartCount();
      }
    },

    initializeDrawer: function() {
      const existingPanel = document.getElementById('desktop-cart-panel');
      if (existingPanel) return;

      const panel = document.createElement('div');
      panel.id = 'desktop-cart-panel';
      panel.innerHTML = `
        <div class="desktop-cart-overlay" onclick="DesktopCart.closeDrawer()"></div>
        <div class="desktop-cart-drawer">
          <div class="desktop-cart-header">
            <h3>Shopping Cart</h3>
            <button class="desktop-cart-close" onclick="DesktopCart.closeDrawer()">×</button>
          </div>
          <div class="desktop-cart-body" id="desktop-cart-body">
            <!-- Cart items will be inserted here -->
          </div>
          <div class="desktop-cart-footer">
            <div class="desktop-cart-total">
              <strong>Total: ₹<span id="desktop-cart-total">0.00</span></strong>
            </div>
            <button class="desktop-checkout-btn" onclick="DesktopCart.proceedToCheckout()">
              Proceed to Checkout
            </button>
          </div>
        </div>
      `;

      // Add CSS for cart drawer
      const style = document.createElement('style');
      style.textContent = `
        #desktop-cart-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2000;
          display: none;
        }
        #desktop-cart-panel.active {
          display: block;
        }
        .desktop-cart-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
        }
        .desktop-cart-drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: 20%;
          min-width: 350px;
          max-width: 500px;
          height: 100%;
          background: white;
          box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        #desktop-cart-panel.active .desktop-cart-drawer {
          transform: translateX(0);
        }
        .desktop-cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .desktop-cart-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
        .desktop-cart-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
        }
        .desktop-cart-close:hover {
          background: #e5e7eb;
        }
        .desktop-cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        .desktop-cart-footer {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .desktop-cart-total {
          text-align: center;
          margin-bottom: 1rem;
          font-size: 18px;
          color: #1f2937;
        }
        .desktop-checkout-btn {
          width: 100%;
          padding: 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .desktop-checkout-btn:hover {
          background: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(panel);
    },

    updateDrawerContent: function() {
      const cartBody = document.getElementById('desktop-cart-body');
      const cartTotal = document.getElementById('desktop-cart-total');
      
      if (!cartBody || !cartTotal) return;

      if (this.items.length === 0) {
        cartBody.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #6b7280;">
            <p>Your cart is empty</p>
            <button onclick="DesktopCart.closeDrawer()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">Continue Shopping</button>
          </div>
        `;
        cartTotal.textContent = '0.00';
        return;
      }

      cartBody.innerHTML = this.items.map(item => `
        <div style="display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #e5e7eb;">
          <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" loading="lazy">
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: 500; color: #1f2937; margin-bottom: 0.25rem;">${item.title}</div>
            <div style="font-size: 14px; color: #6366f1; font-weight: 600; margin-bottom: 0.5rem;">₹${item.price.toFixed(2)}</div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button onclick="DesktopCart.updateQuantity('${item.variantId}', ${item.quantity - 1})" style="background: #f3f4f6; border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer;">-</button>
              <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
              <button onclick="DesktopCart.updateQuantity('${item.variantId}', ${item.quantity + 1})" style="background: #f3f4f6; border: none; width: 30px; height: 30px; border-radius: 6px; cursor: pointer;">+</button>
              <button onclick="DesktopCart.removeItem('${item.variantId}')" style="background: none; border: none; color: #ef4444; font-size: 12px; cursor: pointer; margin-left: auto;">Remove</button>
            </div>
          </div>
        </div>
      `).join('');

      cartTotal.textContent = this.getTotal().toFixed(2);
    },

    openDrawer: function() {
      const panel = document.getElementById('desktop-cart-panel');
      if (panel) {
        DesktopState.isCartOpen = true;
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeDrawer: function() {
      const panel = document.getElementById('desktop-cart-panel');
      if (panel) {
        DesktopState.isCartOpen = false;
        panel.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    proceedToCheckout: function() {
      if (this.items.length === 0) {
        this.showNotification('Your cart is empty');
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
        this.showNotification('Error adding items to cart');
      });
    },

    showNotification: function(message) {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 3000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;

      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 3000);
    }
  };

  // Global functions
  window.toggleSearch = function() {
    if (DesktopState.isSearchOpen) {
      DesktopSearch.hideSearchInput();
    } else {
      DesktopSearch.showSearchInput();
    }
  };

  window.toggleBurgerMenu = function() {
    DesktopMenu.toggleBurgerMenu();
  };

  window.closeBurgerMenu = function() {
    DesktopMenu.closeBurgerMenu();
  };

  window.openDesktopCart = function() {
    DesktopCart.openDrawer();
  };

  window.addToDesktopCart = function(productId, variantId, title, price, image, url) {
    DesktopCart.addItem(productId, variantId, title, price, image, url);
  };

  // Make all objects available globally
  window.DesktopCart = DesktopCart;
  window.DesktopMenu = DesktopMenu;
  window.DesktopSearch = DesktopSearch;

  // Initialize desktop functionality
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Desktop experience initialized');
    
    // Add desktop-ready class
    document.body.classList.add('desktop-ready');
    
    // Initialize cart system
    DesktopCart.init();
    
    // Handle escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (DesktopState.isSearchOpen) DesktopSearch.hideSearchInput();
        if (DesktopState.isMenuOpen) DesktopMenu.closeBurgerMenu();
        if (DesktopState.isCartOpen) DesktopCart.closeDrawer();
      }
    });

    console.log('Desktop JavaScript loaded successfully');
  });

})();
