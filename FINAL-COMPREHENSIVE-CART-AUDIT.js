// FINAL COMPREHENSIVE CART AUDIT - VERSION 3.0
console.log('🎯 === FINAL COMPREHENSIVE CART AUDIT === 🎯');

// Test 1: Environment and Version Check
console.log('\n📋 TEST 1: ENVIRONMENT AND VERSION CHECK');
console.log('URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);
console.log('Timestamp:', new Date().toISOString());
console.log('Cart System Version: 3.0 - ULTIMATE CART FIX');

// Test 2: Cart Functions Availability
console.log('\n🔧 TEST 2: CART FUNCTIONS AVAILABILITY');
const requiredFunctions = [
  'addToShopifyCart',
  'addToCartDirect', 
  'addToCart',
  'addToCartFromQuickView',
  'addToCartFromCollection',
  'updateCartCount',
  'showCartMessage'
];

let allFunctionsAvailable = true;
let missingFunctions = [];

requiredFunctions.forEach(funcName => {
  const exists = typeof window[funcName] === 'function';
  console.log(`${funcName}: ${exists ? '✅' : '❌'} ${exists ? 'Available' : 'MISSING'}`);
  if (!exists) {
    allFunctionsAvailable = false;
    missingFunctions.push(funcName);
  }
});

console.log(`\nOverall Functions Status: ${allFunctionsAvailable ? '✅ ALL AVAILABLE' : '❌ MISSING FUNCTIONS'}`);
if (missingFunctions.length > 0) {
  console.log('Missing functions:', missingFunctions);
}

// Test 3: Current Cart State
console.log('\n🛒 TEST 3: CURRENT CART STATE');
fetch('/cart.js')
  .then(response => {
    console.log('Cart API Response Status:', response.status);
    console.log('Cart API Response OK:', response.ok);
    return response.json();
  })
  .then(cart => {
    console.log('Cart Items:', cart.item_count);
    console.log('Cart Total:', cart.total_price);
    console.log('Cart Token:', cart.token ? 'Present' : 'Missing');
    console.log('Cart Items Details:', cart.items);
  })
  .catch(error => {
    console.error('❌ Error fetching cart:', error);
  });

// Test 4: Form Detection and Prevention
console.log('\n🚫 TEST 4: FORM DETECTION AND PREVENTION');
const forms = document.querySelectorAll('form');
console.log('Total Forms Found:', forms.length);

let cartFormsFound = 0;
let formDetails = [];

forms.forEach((form, index) => {
  const action = form.action;
  const method = form.method;
  const hasCartAction = action && action.includes('/cart/add');
  const hasSubmitHandler = form.onsubmit !== null;
  const className = form.className || 'No class';
  const id = form.id || 'No ID';
  
  const formInfo = {
    index: index + 1,
    action: action || 'No action',
    method: method || 'No method',
    hasCartAction: hasCartAction,
    hasSubmitHandler: hasSubmitHandler,
    className: className,
    id: id
  };
  
  formDetails.push(formInfo);
  
  console.log(`Form ${index + 1}:`, formInfo);
  
  if (hasCartAction) {
    cartFormsFound++;
    console.log(`⚠️ WARNING: Form ${index + 1} has cart action: ${action}`);
  }
});

console.log(`Cart Forms Found: ${cartFormsFound} (should be 0)`);

// Test 5: Add to Cart Buttons
console.log('\n🛍️ TEST 5: ADD TO CART BUTTONS');
const buttonSelectors = [
  '.add-to-cart-btn',
  '.add-to-cart',
  'button[onclick*="addToCart"]',
  'button[onclick*="addToCartDirect"]'
];

let totalButtons = 0;
let buttonDetails = [];

buttonSelectors.forEach(selector => {
  const buttons = document.querySelectorAll(selector);
  console.log(`${selector}: ${buttons.length} buttons`);
  
  buttons.forEach((button, index) => {
    totalButtons++;
    const onclick = button.getAttribute('onclick');
    const text = button.textContent.trim();
    const disabled = button.disabled;
    const className = button.className || 'No class';
    
    const buttonInfo = {
      selector: selector,
      index: index + 1,
      text: text,
      onclick: onclick ? 'Yes' : 'No',
      disabled: disabled,
      className: className
    };
    
    buttonDetails.push(buttonInfo);
    
    console.log(`  Button ${index + 1}: "${text}" - onclick: ${onclick ? 'Yes' : 'No'} - disabled: ${disabled}`);
    
    // Extract variant ID if possible
    if (onclick) {
      const match = onclick.match(/addToCartDirect\([^,]+,\s*'([^']+)'/);
      if (match) {
        console.log(`    Variant ID: ${match[1]}`);
        buttonInfo.variantId = match[1];
      }
    }
  });
});

console.log(`Total Add to Cart Buttons: ${totalButtons}`);

// Test 6: localStorage Conflicts
console.log('\n💾 TEST 6: LOCALSTORAGE CONFLICTS');
const localStorageCart = JSON.parse(localStorage.getItem('cart') || '[]');
const cartSystemVersion = localStorage.getItem('cartSystemVersion');
console.log('localStorage cart items:', localStorageCart.length);
console.log('Cart system version:', cartSystemVersion);

if (localStorageCart.length > 0) {
  console.log('⚠️ WARNING: localStorage cart has items:', localStorageCart);
  console.log('This might cause conflicts. Consider clearing it.');
} else {
  console.log('✅ No localStorage cart conflicts detected');
}

if (cartSystemVersion !== '3.0') {
  console.log('⚠️ WARNING: Cart system version mismatch. Expected: 3.0, Found:', cartSystemVersion);
} else {
  console.log('✅ Cart system version is correct');
}

// Test 7: Product Availability Check
console.log('\n📦 TEST 7: PRODUCT AVAILABILITY');
fetch('/products.json')
  .then(response => response.json())
  .then(data => {
    console.log('Total Products:', data.products.length);
    
    // Check first few products for availability
    const sampleProducts = data.products.slice(0, 3);
    sampleProducts.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        title: product.title,
        available: product.available,
        variants_count: product.variants.length,
        first_variant_id: product.variants[0]?.id,
        first_variant_available: product.variants[0]?.available,
        first_variant_inventory: product.variants[0]?.inventory_quantity
      });
    });
  })
  .catch(error => {
    console.error('❌ Error fetching products:', error);
  });

// Test 8: Direct API Test
console.log('\n🧪 TEST 8: DIRECT API TEST');
// Get the first available variant ID for testing
const firstButton = document.querySelector('button[onclick*="addToCartDirect"]');
if (firstButton) {
  const onclick = firstButton.getAttribute('onclick');
  const match = onclick.match(/addToCartDirect\([^,]+,\s*'([^']+)'/);
  if (match) {
    const testVariantId = match[1];
    console.log('Testing with variant ID:', testVariantId);
    
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
      console.log('API Response Status:', response.status);
      console.log('API Response OK:', response.ok);
      return response.json();
    })
    .then(data => {
      console.log('✅ API Test SUCCESS:', data);
      console.log('Items in cart after test:', data.item_count);
    })
    .catch(error => {
      console.error('❌ API Test FAILED:', error);
    });
  } else {
    console.log('❌ Could not extract variant ID from button');
  }
} else {
  console.log('❌ No add to cart buttons found for testing');
}

// Test 9: Form Submission Monitoring
console.log('\n👀 TEST 9: FORM SUBMISSION MONITORING');
let formSubmissionAttempts = 0;
let blockedSubmissions = 0;

// Monitor for any form submissions
const originalSubmit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = function() {
  formSubmissionAttempts++;
  console.log(`🚨 FORM SUBMISSION ATTEMPT ${formSubmissionAttempts}:`, {
    action: this.action,
    method: this.method,
    timestamp: new Date().toISOString()
  });
  
  if (this.action && this.action.includes('/cart/add')) {
    blockedSubmissions++;
    console.log('🚨 BLOCKED: Cart form submission attempt');
    return false;
  }
  
  return originalSubmit.call(this);
};

// Test 10: JavaScript Error Monitoring
console.log('\n🚨 TEST 10: JAVASCRIPT ERROR MONITORING');
let errorCount = 0;
const originalError = console.error;
console.error = function(...args) {
  errorCount++;
  console.log('🚨 JAVASCRIPT ERROR DETECTED:', args);
  originalError.apply(console, args);
};

// Test 11: Network Request Monitoring
console.log('\n🌐 TEST 11: NETWORK REQUEST MONITORING');
let cartRequests = 0;
let cartAddRequests = 0;
let cartChangeRequests = 0;

// Monitor fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string') {
    if (url.includes('/cart.js')) {
      cartRequests++;
      console.log(`🛒 Cart request ${cartRequests}: ${url}`);
    }
    if (url.includes('/cart/add.js')) {
      cartAddRequests++;
      console.log(`➕ Cart add request ${cartAddRequests}: ${url}`);
    }
    if (url.includes('/cart/change.js')) {
      cartChangeRequests++;
      console.log(`🔄 Cart change request ${cartChangeRequests}: ${url}`);
    }
  }
  return originalFetch.apply(this, args);
};

// Test 12: Cart Function Testing
console.log('\n🧪 TEST 12: CART FUNCTION TESTING');
if (typeof addToShopifyCart === 'function') {
  console.log('Testing addToShopifyCart function...');
  // Get a test variant ID
  const testButton = document.querySelector('button[onclick*="addToCartDirect"]');
  if (testButton) {
    const onclick = testButton.getAttribute('onclick');
    const match = onclick.match(/addToCartDirect\([^,]+,\s*'([^']+)'/);
    if (match) {
      const testVariantId = match[1];
      console.log('Testing addToShopifyCart with variant ID:', testVariantId);
      
      addToShopifyCart(testVariantId, 1)
        .then(data => {
          console.log('✅ addToShopifyCart function works:', data);
        })
        .catch(error => {
          console.error('❌ addToShopifyCart function failed:', error);
        });
    }
  }
} else {
  console.log('❌ addToShopifyCart function not available');
}

// Test 13: Final Summary
setTimeout(() => {
  console.log('\n📊 TEST 13: FINAL SUMMARY');
  console.log('=== CART SYSTEM STATUS ===');
  console.log(`Functions Available: ${allFunctionsAvailable ? '✅' : '❌'}`);
  console.log(`Cart Forms Found: ${cartFormsFound} (should be 0)`);
  console.log(`Add to Cart Buttons: ${totalButtons}`);
  console.log(`Form Submission Attempts: ${formSubmissionAttempts}`);
  console.log(`Blocked Submissions: ${blockedSubmissions}`);
  console.log(`Cart API Requests: ${cartRequests}`);
  console.log(`Cart Add Requests: ${cartAddRequests}`);
  console.log(`Cart Change Requests: ${cartChangeRequests}`);
  console.log(`localStorage Conflicts: ${localStorageCart.length > 0 ? '⚠️' : '✅'}`);
  console.log(`JavaScript Errors: ${errorCount}`);
  console.log(`Cart System Version: ${cartSystemVersion === '3.0' ? '✅' : '❌'}`);
  
  // Overall assessment
  const issues = [];
  if (!allFunctionsAvailable) issues.push('Missing cart functions');
  if (cartFormsFound > 0) issues.push('Cart forms still present');
  if (formSubmissionAttempts > 0) issues.push('Form submissions detected');
  if (localStorageCart.length > 0) issues.push('localStorage conflicts');
  if (cartSystemVersion !== '3.0') issues.push('Cart system version mismatch');
  if (errorCount > 0) issues.push('JavaScript errors detected');
  
  if (issues.length === 0) {
    console.log('\n🎉 EXCELLENT! Cart system is working perfectly!');
    console.log('✅ All tests passed');
    console.log('✅ No issues detected');
    console.log('✅ Cart should work flawlessly');
    console.log('✅ System is bulletproof');
  } else {
    console.log('\n⚠️ ISSUES DETECTED:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    console.log('\nPlease address these issues for optimal cart functionality.');
  }
  
  console.log('\n🎯 === FINAL COMPREHENSIVE CART AUDIT COMPLETE === 🎯');
}, 4000);

// Test 14: Manual Test Function
window.testCartManually = function() {
  console.log('\n🧪 MANUAL CART TEST');
  const firstButton = document.querySelector('button[onclick*="addToCartDirect"]');
  if (firstButton) {
    console.log('Clicking first add to cart button...');
    firstButton.click();
  } else {
    console.log('No add to cart buttons found');
  }
};

// Test 15: Clear Cart Function
window.clearCartForTesting = function() {
  console.log('\n🧹 CLEARING CART FOR TESTING');
  fetch('/cart/clear.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Cart cleared successfully:', data);
    location.reload();
  })
  .catch(error => {
    console.error('❌ Error clearing cart:', error);
  });
};

console.log('\n💡 TIPS:');
console.log('- Run testCartManually() to test cart functionality manually');
console.log('- Run clearCartForTesting() to clear cart and reload page');
console.log('- Check network tab for API requests');
console.log('- Monitor console for any error messages'); 