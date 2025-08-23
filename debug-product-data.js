// Debug script to check product data and cart issues
console.log('=== PRODUCT DATA DEBUG SCRIPT ===');

// Function to check a specific product
function checkProductData(productHandle) {
  console.log(`\n🔍 Checking product: ${productHandle}`);
  
  fetch(`/products/${productHandle}.js`)
    .then(response => {
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      return response.json();
    })
    .then(product => {
      console.log('✅ Product data received:', product);
      console.log('📦 Product available:', product.available);
      console.log('🆔 Product ID:', product.id);
      console.log('📝 Product title:', product.title);
      
      console.log('\n🔧 Variants:');
      product.variants.forEach((variant, index) => {
        console.log(`  Variant ${index + 1}:`, {
          id: variant.id,
          title: variant.title,
          available: variant.available,
          inventory_quantity: variant.inventory_quantity,
          inventory_management: variant.inventory_management,
          inventory_policy: variant.inventory_policy,
          price: variant.price
        });
      });
      
      console.log('\n🎯 Selected variant:', product.selected_or_first_available_variant);
      
      // Test adding this product to cart
      if (product.selected_or_first_available_variant) {
        const variantId = product.selected_or_first_available_variant.id;
        console.log(`\n🧪 Testing cart add with variant ID: ${variantId}`);
        
        const testData = {
          'items': [{
            'id': parseInt(variantId),
            'quantity': 1
          }]
        };
        
        console.log('📤 Sending test data:', testData);
        
        return fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData)
        });
      }
    })
    .then(response => {
      if (response) {
        console.log('📥 Cart add response status:', response.status);
        console.log('📥 Cart add response ok:', response.ok);
        return response.json();
      }
    })
    .then(data => {
      if (data) {
        console.log('✅ Cart add success:', data);
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
    });
}

// Function to check all products
function checkAllProducts() {
  console.log('\n📋 Checking all products...');
  
  fetch('/products.json')
    .then(response => response.json())
    .then(data => {
      console.log(`Found ${data.products.length} products`);
      
      data.products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Available: ${product.available}`);
        console.log(`   Variants: ${product.variants.length}`);
        
        product.variants.forEach((variant, vIndex) => {
          console.log(`     Variant ${vIndex + 1}: ID=${variant.id}, Available=${variant.available}, Inventory=${variant.inventory_quantity}`);
        });
      });
    })
    .catch(error => {
      console.error('❌ Error fetching products:', error);
    });
}

// Function to check current cart
function checkCurrentCart() {
  console.log('\n🛒 Checking current cart...');
  
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      console.log('Current cart:', cart);
      console.log('Item count:', cart.item_count);
      console.log('Items:', cart.items);
    })
    .catch(error => {
      console.error('❌ Error fetching cart:', error);
    });
}

// Auto-run checks
console.log('🚀 Starting product data debug...');

// Check current cart first
checkCurrentCart();

// Check all products
checkAllProducts();

// Check specific product if we can find it
setTimeout(() => {
  // Look for the Winter Warm Set product
  fetch('/products.json')
    .then(response => response.json())
    .then(data => {
      const winterWarmProduct = data.products.find(product => 
        product.title.toLowerCase().includes('winter warm')
      );
      
      if (winterWarmProduct) {
        console.log('\n🎯 Found Winter Warm Set product!');
        checkProductData(winterWarmProduct.handle);
      } else {
        console.log('\n❌ Winter Warm Set product not found in products list');
      }
    })
    .catch(error => {
      console.error('❌ Error searching for Winter Warm Set:', error);
    });
}, 1000);

console.log('\n📝 Debug functions available:');
console.log('- checkProductData("product-handle")');
console.log('- checkAllProducts()');
console.log('- checkCurrentCart()');
