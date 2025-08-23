// Debug script to test cart functionality
console.log('=== CART DEBUG SCRIPT ===');

// Test 1: Check if Shopify cart functions are available
console.log('Testing cart function availability:');
console.log('- addToShopifyCart:', typeof addToShopifyCart);
console.log('- updateCartCount:', typeof updateCartCount);
console.log('- showCartMessage:', typeof showCartMessage);
console.log('- addToCartDirect:', typeof addToCartDirect);
console.log('- submitFormOnce:', typeof submitFormOnce);

// Test 2: Check current cart state
console.log('\n=== CURRENT CART STATE ===');
fetch('/cart.js')
  .then(response => response.json())
  .then(cart => {
    console.log('Cart items:', cart.item_count);
    console.log('Cart total:', cart.total_price);
    console.log('Cart items:', cart.items);
  })
  .catch(error => {
    console.error('Error fetching cart:', error);
  });

// Test 3: Check all forms on the page
console.log('\n=== FORMS ON PAGE ===');
const forms = document.querySelectorAll('form[action="/cart/add"]');
console.log('Number of cart forms found:', forms.length);

forms.forEach((form, index) => {
  const variantId = form.querySelector('input[name="id"]')?.value;
  const productId = form.getAttribute('data-product-id');
  console.log(`Form ${index + 1}:`, {
    productId: productId,
    variantId: variantId,
    formAction: form.action,
    hasSubmitHandler: form.onsubmit !== null
  });
});

// Test 4: Check all add to cart buttons
console.log('\n=== ADD TO CART BUTTONS ===');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn, .add-to-cart');
console.log('Number of add to cart buttons found:', addToCartButtons.length);

addToCartButtons.forEach((button, index) => {
  console.log(`Button ${index + 1}:`, {
    text: button.textContent.trim(),
    onclick: button.onclick !== null,
    type: button.type,
    disabled: button.disabled
  });
});

// Test 5: Check if localStorage cart still exists (should be empty now)
console.log('\n=== LOCALSTORAGE CART CHECK ===');
const localStorageCart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log('localStorage cart items:', localStorageCart.length);
if (localStorageCart.length > 0) {
  console.log('WARNING: localStorage cart still has items:', localStorageCart);
  console.log('This might cause conflicts. Consider clearing it.');
}

// Test 6: Test cart count display
console.log('\n=== CART COUNT DISPLAY ===');
const cartCountElements = document.querySelectorAll('.cart-count');
console.log('Cart count elements found:', cartCountElements.length);
cartCountElements.forEach((element, index) => {
  console.log(`Cart count ${index + 1}:`, {
    text: element.textContent,
    display: element.style.display,
    visible: element.offsetParent !== null
  });
});

// Test 7: Check for any remaining localStorage cart functions
console.log('\n=== REMAINING LOCALSTORAGE FUNCTIONS ===');
const localStorageFunctions = [
  'addToCart',
  'updateCartCount',
  'showCartMessage',
  'addToCartDirect',
  'submitFormOnce'
];

localStorageFunctions.forEach(funcName => {
  if (window[funcName] && window[funcName].toString().includes('localStorage')) {
    console.log(`WARNING: ${funcName} still uses localStorage`);
  }
});

console.log('\n=== CART DEBUG COMPLETE ===');
console.log('If you see any warnings above, those need to be addressed.');
console.log('The cart should now use Shopify\'s native cart system instead of localStorage.'); 