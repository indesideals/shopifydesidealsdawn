// Comprehensive Cart Test Script
console.log('=== COMPREHENSIVE CART AUDIT ===');

// Test 1: Check all cart functions
console.log('\n=== TEST 1: CART FUNCTIONS ===');
const cartFunctions = [
  'addToShopifyCart',
  'addToCartDirect', 
  'addToCart',
  'addToCartFromQuickView',
  'addToCartFromCollection',
  'updateCartCount',
  'showCartMessage'
];

cartFunctions.forEach(funcName => {
  const exists = typeof window[funcName] === 'function';
  console.log(`${funcName}: ${exists ? '✅' : '❌'} ${exists ? 'Available' : 'Missing'}`);
});

// Test 2: Check current cart state
console.log('\n=== TEST 2: CURRENT CART STATE ===');
fetch('/cart.js')
  .then(response => response.json())
  .then(cart => {
    console.log('Cart items:', cart.item_count);
    console.log('Cart total:', cart.total_price);
    console.log('Cart token:', cart.token);
    console.log('Cart items:', cart.items);
  })
  .catch(error => {
    console.error('Error fetching cart:', error);
  });

// Test 3: Check all forms on the page
console.log('\n=== TEST 3: FORMS ON PAGE ===');
const forms = document.querySelectorAll('form');
console.log('Total forms found:', forms.length);

forms.forEach((form, index) => {
  const action = form.action;
  const method = form.method;
  const hasCartAction = action && action.includes('/cart/add');
  
  console.log(`Form ${index + 1}:`, {
    action: action,
    method: method,
    hasCartAction: hasCartAction,
    hasSubmitHandler: form.onsubmit !== null
  });
  
  if (hasCartAction) {
    console.log(`⚠️ WARNING: Form ${index + 1} has cart action: ${action}`);
  }
});

// Test 4: Check all add to cart buttons
console.log('\n=== TEST 4: ADD TO CART BUTTONS ===');
const addToCartSelectors = [
  '.add-to-cart-btn',
  '.add-to-cart',
  'button[onclick*="addToCart"]',
  'button[onclick*="addToCartDirect"]'
];

addToCartSelectors.forEach(selector => {
  const buttons = document.querySelectorAll(selector);
  console.log(`${selector}: ${buttons.length} buttons found`);
  
  buttons.forEach((button, index) => {
    const onclick = button.getAttribute('onclick');
    const text = button.textContent.trim();
    console.log(`  Button ${index + 1}: "${text}" - onclick: ${onclick ? 'Yes' : 'No'}`);
  });
});

// Test 5: Test cart API directly
console.log('\n=== TEST 5: CART API TEST ===');
// Get the first available variant ID
const firstForm = document.querySelector('form[action*="/cart/add"]');
const firstButton = document.querySelector('button[onclick*="addToCartDirect"]');

let testVariantId = null;

if (firstForm) {
  const variantInput = firstForm.querySelector('input[name="id"]');
  if (variantInput) {
    testVariantId = variantInput.value;
  }
} else if (firstButton) {
  const onclick = firstButton.getAttribute('onclick');
  const match = onclick.match(/addToCartDirect\([^,]+,\s*'([^']+)'/);
  if (match) {
    testVariantId = match[1];
  }
}

if (testVariantId) {
  console.log('Testing cart API with variant ID:', testVariantId);
  
  const testData = {
    'items': [{
      'id': parseInt(testVariantId),
      'quantity': 1
    }]
  };
  
  console.log('Sending test data:', testData);
  
  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
  })
  .then(response => {
    console.log('API Response status:', response.status);
    console.log('API Response ok:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('✅ API Test SUCCESS:', data);
  })
  .catch(error => {
    console.error('❌ API Test FAILED:', error);
  });
} else {
  console.log('No variant ID found for testing');
}

// Test 6: Check for any localStorage cart conflicts
console.log('\n=== TEST 6: LOCALSTORAGE CHECK ===');
const localStorageCart = JSON.parse(localStorage.getItem('cart') || '[]');
console.log('localStorage cart items:', localStorageCart.length);
if (localStorageCart.length > 0) {
  console.log('⚠️ WARNING: localStorage cart has items:', localStorageCart);
  console.log('This might cause conflicts. Consider clearing it.');
}

// Test 7: Check for any remaining form submission attempts
console.log('\n=== TEST 7: FORM SUBMISSION MONITORING ===');
let formSubmissionAttempts = 0;

// Monitor for form submissions
const originalSubmit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = function() {
  formSubmissionAttempts++;
  console.log(`🚨 FORM SUBMISSION ATTEMPT ${formSubmissionAttempts}:`, {
    action: this.action,
    method: this.method,
    timestamp: new Date().toISOString()
  });
  
  if (this.action && this.action.includes('/cart/add')) {
    console.log('🚨 BLOCKED: Cart form submission attempt');
    return false;
  }
  
  return originalSubmit.call(this);
};

// Test 8: Check product availability
console.log('\n=== TEST 8: PRODUCT AVAILABILITY ===');
fetch('/products.json')
  .then(response => response.json())
  .then(data => {
    console.log('Total products:', data.products.length);
    
    // Check first few products
    data.products.slice(0, 3).forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        title: product.title,
        available: product.available,
        variants_count: product.variants.length,
        first_variant_id: product.variants[0]?.id,
        first_variant_available: product.variants[0]?.available
      });
    });
  })
  .catch(error => {
    console.error('Error fetching products:', error);
  });

// Test 9: Check for any JavaScript errors
console.log('\n=== TEST 9: JAVASCRIPT ERROR CHECK ===');
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 JAVASCRIPT ERROR DETECTED:', args);
  originalError.apply(console, args);
};

// Test 10: Final summary
setTimeout(() => {
  console.log('\n=== TEST 10: FINAL SUMMARY ===');
  console.log('Form submission attempts detected:', formSubmissionAttempts);
  console.log('Cart system version: 2.0');
  console.log('All tests completed. Check above for any issues.');
  
  if (formSubmissionAttempts > 0) {
    console.log('🚨 ISSUE: Form submissions detected - cart system may not be working properly');
  } else {
    console.log('✅ GOOD: No form submissions detected');
  }
}, 2000);

console.log('\n=== COMPREHENSIVE CART AUDIT COMPLETE ==='); 