// Script to check product availability and variant information
console.log('=== PRODUCT AVAILABILITY CHECK ===');

// Function to check a specific product
function checkProduct(productHandle) {
  console.log(`Checking product: ${productHandle}`);
  
  fetch(`/products/${productHandle}.js`)
    .then(response => response.json())
    .then(product => {
      console.log('Product data:', product);
      console.log('Product available:', product.available);
      console.log('Variants:', product.variants);
      
      product.variants.forEach((variant, index) => {
        console.log(`Variant ${index + 1}:`, {
          id: variant.id,
          title: variant.title,
          available: variant.available,
          inventory_quantity: variant.inventory_quantity,
          inventory_management: variant.inventory_management,
          inventory_policy: variant.inventory_policy,
          price: variant.price
        });
      });
      
      console.log('Selected or first available variant:', product.selected_or_first_available_variant);
    })
    .catch(error => {
      console.error('Error fetching product:', error);
    });
}

// Function to check all products
function checkAllProducts() {
  console.log('Checking all products...');
  
  fetch('/products.json')
    .then(response => response.json())
    .then(data => {
      console.log('Total products:', data.products.length);
      
      data.products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          title: product.title,
          handle: product.handle,
          available: product.available,
          variants_count: product.variants.length,
          first_variant_id: product.variants[0]?.id,
          first_variant_available: product.variants[0]?.available
        });
      });
      
      // Check for Vegetable Cleaning Brush specifically
      const vegetableBrush = data.products.find(product => 
        product.title.toLowerCase().includes('vegetable cleaning brush')
      );
      
      if (vegetableBrush) {
        console.log('\n=== VEGETABLE CLEANING BRUSH DETAILS ===');
        checkProduct(vegetableBrush.handle);
      } else {
        console.log('Vegetable Cleaning Brush not found in products list');
      }
    })
    .catch(error => {
      console.error('Error fetching products:', error);
    });
}

// Function to test cart API with a specific variant
function testCartWithVariant(variantId) {
  console.log(`Testing cart API with variant ID: ${variantId}`);
  
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
}

// Auto-run the checks
checkAllProducts();

// Make functions available globally for manual testing
window.checkProduct = checkProduct;
window.checkAllProducts = checkAllProducts;
window.testCartWithVariant = testCartWithVariant;

console.log('=== PRODUCT CHECK COMPLETE ===');
console.log('Use checkProduct("product-handle") to check a specific product');
console.log('Use testCartWithVariant(variantId) to test cart API with a specific variant'); 