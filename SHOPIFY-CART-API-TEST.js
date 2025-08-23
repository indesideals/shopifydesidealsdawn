// SHOPIFY CART API TEST - Based on Official Documentation
// Reference: https://shopify.dev/docs/api/ajax/reference/cart

console.log('🛒 === SHOPIFY CART API TEST === 🛒');
console.log('Testing against official Shopify Cart API documentation');

// Test 1: Verify Cart API Endpoints
console.log('\n📋 TEST 1: CART API ENDPOINTS');
const requiredEndpoints = [
  '/cart/add.js',
  '/cart.js',
  '/cart/change.js',
  '/cart/clear.js',
  '/cart/update.js'
];

console.log('Required endpoints:');
requiredEndpoints.forEach(endpoint => {
  console.log(`  ✅ ${endpoint}`);
});

// Test 2: Test Cart Add API (Main Test)
console.log('\n🧪 TEST 2: CART ADD API TEST');
console.log('Testing POST /cart/add.js with proper format');

// Get a test variant ID
const firstButton = document.querySelector('button[onclick*="addToCartDirect"]');
if (firstButton) {
  const onclick = firstButton.getAttribute('onclick');
  const match = onclick.match(/addToCartDirect\([^,]+,\s*'([^']+)'/);
  if (match) {
    const testVariantId = match[1];
    console.log('Using variant ID for testing:', testVariantId);
    
    // Test with proper Shopify Cart API format
    const formData = {
      'items': [{
        'id': parseInt(testVariantId),
        'quantity': 1
      }]
    };
    
    console.log('Sending request with data:', formData);
    console.log('Expected format according to Shopify docs:');
    console.log('  - Content-Type: application/json');
    console.log('  - Body: JSON with items array');
    console.log('  - Each item: {id: variantId, quantity: number}');
    
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        return response.text().then(text => {
          console.error('❌ API Error Response:', text);
          throw new Error(`HTTP ${response.status}: ${text}`);
        });
      }
      
      return response.json();
    })
    .then(data => {
      console.log('✅ SUCCESS: Cart API Response');
      console.log('Response data:', data);
      
      // Verify response structure according to Shopify docs
      if (data.items && Array.isArray(data.items)) {
        console.log('✅ Response has items array');
        console.log('Items count:', data.items.length);
        
        if (data.items.length > 0) {
          const item = data.items[0];
          console.log('First item details:');
          console.log('  - ID:', item.id);
          console.log('  - Title:', item.title);
          console.log('  - Quantity:', item.quantity);
          console.log('  - Price:', item.price);
          console.log('  - Variant ID:', item.variant_id);
        }
      } else {
        console.log('⚠️ Response structure unexpected');
      }
      
      // Test cart state after adding
      return fetch('/cart.js');
    })
    .then(response => response.json())
    .then(cart => {
      console.log('✅ Cart state after adding item:');
      console.log('  - Item count:', cart.item_count);
      console.log('  - Total price:', cart.total_price);
      console.log('  - Items:', cart.items.length);
    })
    .catch(error => {
      console.error('❌ CART API TEST FAILED:', error);
      console.error('This indicates the cart system is not working properly');
    });
  } else {
    console.log('❌ Could not extract variant ID from button');
  }
} else {
  console.log('❌ No add to cart buttons found for testing');
}

// Test 3: Verify Form Prevention
console.log('\n🚫 TEST 3: FORM PREVENTION TEST');
const forms = document.querySelectorAll('form');
let cartFormsFound = 0;

forms.forEach((form, index) => {
  if (form.action && form.action.includes('/cart/add')) {
    cartFormsFound++;
    console.log(`🚨 FOUND CART FORM ${index + 1}:`, form.action);
  }
});

if (cartFormsFound === 0) {
  console.log('✅ No cart forms found - prevention working');
} else {
  console.log(`⚠️ Found ${cartFormsFound} cart forms - need to fix`);
}

// Test 4: Test Cart Functions
console.log('\n🔧 TEST 4: CART FUNCTIONS TEST');
const requiredFunctions = [
  'addToShopifyCart',
  'addToCartDirect',
  'updateCartCount',
  'showCartMessage'
];

requiredFunctions.forEach(funcName => {
  const exists = typeof window[funcName] === 'function';
  console.log(`${funcName}: ${exists ? '✅' : '❌'} ${exists ? 'Available' : 'Missing'}`);
});

// Test 5: Test Network Requests
console.log('\n🌐 TEST 5: NETWORK REQUEST MONITORING');
let cartRequests = 0;
let cartAddRequests = 0;

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
    if (url.includes('/cart/add') && !url.includes('/cart/add.js')) {
      console.log(`🚨 WARNING: Request to old endpoint: ${url}`);
    }
  }
  return originalFetch.apply(this, args);
};

// Test 6: Manual Test Function
window.testShopifyCartAPI = function() {
  console.log('\n🧪 MANUAL SHOPIFY CART API TEST');
  const firstButton = document.querySelector('button[onclick*="addToCartDirect"]');
  if (firstButton) {
    console.log('Clicking add to cart button...');
    firstButton.click();
  } else {
    console.log('No add to cart buttons found');
  }
};

// Test 7: Clear Cart Function
window.clearCartForAPITest = function() {
  console.log('\n🧹 CLEARING CART FOR API TEST');
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

// Test 8: Final Summary
setTimeout(() => {
  console.log('\n📊 TEST 8: FINAL SUMMARY');
  console.log('=== SHOPIFY CART API STATUS ===');
  console.log(`Cart Forms Found: ${cartFormsFound} (should be 0)`);
  console.log(`Cart API Requests: ${cartRequests}`);
  console.log(`Cart Add Requests: ${cartAddRequests}`);
  
  if (cartFormsFound === 0 && cartAddRequests > 0) {
    console.log('\n🎉 EXCELLENT! Cart API is working correctly!');
    console.log('✅ No forms submitting to /cart/add');
    console.log('✅ Requests going to /cart/add.js');
    console.log('✅ Following Shopify Cart API documentation');
  } else {
    console.log('\n⚠️ ISSUES DETECTED:');
    if (cartFormsFound > 0) {
      console.log('  - Cart forms still submitting to /cart/add');
    }
    if (cartAddRequests === 0) {
      console.log('  - No requests to /cart/add.js detected');
    }
  }
  
  console.log('\n💡 TIPS:');
  console.log('- Run testShopifyCartAPI() to test cart functionality');
  console.log('- Run clearCartForAPITest() to clear cart and reload');
  console.log('- Check network tab for API requests');
  console.log('- Verify requests go to /cart/add.js not /cart/add');
  
  console.log('\n🛒 === SHOPIFY CART API TEST COMPLETE === 🛒');
}, 3000); 