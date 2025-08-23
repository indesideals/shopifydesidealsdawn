// Wishlist functionality for Product Detail Pages
function addToWishlist(productId, productTitle, productPrice, productImage, productUrl) {
  console.log('Adding to wishlist:', productId, productTitle);
  
  // Check if Wishlist Plus app is installed
  if (window.wishlistAppInstalled) {
    // Use app functionality
    if (window.wishlistApp && window.wishlistApp.addToWishlist) {
      window.wishlistApp.addToWishlist(productId);
      updateWishlistButton(productId, true);
    }
  } else {
    // Use localStorage fallback
    const customerId = window.customerId || 'guest';
    const wishlistKey = `wishlist_${customerId}`;
    const favorites = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    
    const product = {
      id: productId,
      title: productTitle,
      price: productPrice,
      image: productImage,
      url: productUrl
    };
    
    // Check if already in wishlist
    const existingIndex = favorites.findIndex(item => item.id === productId);
    if (existingIndex === -1) {
      favorites.push(product);
      updateWishlistButton(productId, true);
      showMessage('Added to wishlist!', 'success');
    } else {
      favorites.splice(existingIndex, 1);
      updateWishlistButton(productId, false);
      showMessage('Removed from wishlist!', 'info');
    }
    
    localStorage.setItem(wishlistKey, JSON.stringify(favorites));
  }
}

function updateWishlistButton(productId, isInWishlist) {
  const button = document.querySelector(`[data-product-id="${productId}"]`);
  if (button) {
    if (isInWishlist) {
      button.classList.add('active');
      button.querySelector('svg').style.fill = '#ef4444';
    } else {
      button.classList.remove('active');
      button.querySelector('svg').style.fill = 'none';
    }
  }
}

function showMessage(message, type) {
  // Create a simple message display
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : '#2196f3'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1000;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Initialize wishlist functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set customer ID if available
  if (typeof window.customerId === 'undefined') {
    window.customerId = 'guest';
  }
  
  // Check for Wishlist Plus app
  const appScript = document.querySelector('script[src*="wishlist-plus"]');
  const appElement = document.querySelector('[data-wishlist-app]');
  
  if (appScript || appElement) {
    console.log('✅ Wishlist Plus app detected - using app functionality');
    window.wishlistAppInstalled = true;
  } else {
    console.log('⚠️ Wishlist Plus app not detected - using localStorage fallback');
    window.wishlistAppInstalled = false;
  }
});
