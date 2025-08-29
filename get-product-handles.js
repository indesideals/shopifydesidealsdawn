// Script to get actual product handles from Shopify store
// Run this in browser console on your store

console.log('=== GETTING ACTUAL PRODUCT HANDLES ===');

// Get all product links
const productLinks = document.querySelectorAll('a[href*="/products/"]');
const productHandles = new Set();

productLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href && href.includes('/products/')) {
    const handle = href.split('/products/')[1];
    if (handle && !handle.includes('/')) {
      productHandles.add(handle);
    }
  }
});

console.log('Found product handles:');
Array.from(productHandles).forEach(handle => {
  console.log(`'${handle}',`);
});

console.log('Total products found:', productHandles.size);
