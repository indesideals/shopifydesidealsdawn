// Debug script to check variant IDs and cart API
console.log('=== VARIANT ID DEBUG SCRIPT ===');

// Test 1: Check all forms and their variant IDs
console.log('\n=== CHECKING ALL CART FORMS ===');
const forms = document.querySelectorAll('form[action="/cart/add"]');
console.log('Number of cart forms found:', forms.length);

forms.forEach((form, index) => {
  const variantId = form.querySelector('input[name="id"]')?.value;
  const productId = form.getAttribute('data-product-id');
  console.log(`Form ${index + 1}:`, {
    productId: productId,
    variantId: variantId,
    variantIdType: typeof variantId,
    formAction: form.action
  });
});

// Test 2: Check all add to cart buttons and their onclick functions
console.log('\n=== CHECKING ADD TO CART BUTTONS ===');
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn, .add-to-cart');
console.log('Number of add to cart buttons found:', addToCartButtons.length);

addToCartButtons.forEach((button, index) => {
  const onclick = button.getAttribute('onclick');
  console.log(`Button ${index + 1}:`, {
    text: button.textContent.trim(),
    onclick: onclick,
    dataVariantId: button.getAttribute('data-variant-id'),
    dataProductId: button.getAttribute('data-product-id')
  });
});

// Test 3: Test the cart API directly with a sample variant ID
console.log('\n=== TESTING CART API ===');
if (forms.length > 0) {
  const firstForm = forms[0];
  const variantId = firstForm.querySelector('input[name="id"]')?.value;
  
  if (variantId) {
    console.log('Testing cart API with variant ID:', variantId);
    
    const testData = {
      'items': [{
        'id': parseInt(variantId),
        'quantity': 1
      }]
    };
    
    console.log('Sending data:', testData);
    
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      return response.json();
    })
    .then(data => {
      console.log('Success response:', data);
    })
    .catch(error => {
      console.error('Error response:', error);
    });
  } else {
    console.log('No variant ID found in first form');
  }
}

// Test 4: Check current cart state
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

// Test 5: Check if the addToShopifyCart function is working
console.log('\n=== TESTING addToShopifyCart FUNCTION ===');
if (typeof addToShopifyCart === 'function') {
  console.log('addToShopifyCart function is available');
  
  // Test with a sample variant ID if available
  if (forms.length > 0) {
    const variantId = forms[0].querySelector('input[name="id"]')?.value;
    if (variantId) {
      console.log('Testing addToShopifyCart with variant ID:', variantId);
      
      // Note: This will actually add the item to cart
      // Uncomment the line below to test (but be careful!)
      // addToShopifyCart(parseInt(variantId), 1);
    }
  }
} else {
  console.log('ERROR: addToShopifyCart function is not available');
}

console.log('\n=== VARIANT DEBUG COMPLETE ==='); 