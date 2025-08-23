// Debug script to check product availability
console.log('=== PRODUCT DEBUG SCRIPT ===');

fetch('/products.json')
  .then(response => response.json())
  .then(data => {
    console.log('All products:', data.products);
    
    // Find Mini Garment Steamer
    const miniSteamer = data.products.find(product => 
      product.title.toLowerCase().includes('mini garment steamer')
    );
    
    if (miniSteamer) {
      console.log('=== MINI GARMENT STEAMER DEBUG ===');
      console.log('Product:', miniSteamer);
      console.log('Available:', miniSteamer.available);
      console.log('Variants:', miniSteamer.variants);
      
      miniSteamer.variants.forEach((variant, index) => {
        console.log(`Variant ${index + 1}:`, {
          id: variant.id,
          title: variant.title,
          available: variant.available,
          inventory_quantity: variant.inventory_quantity,
          inventory_management: variant.inventory_management,
          inventory_policy: variant.inventory_policy
        });
      });
      
      console.log('Selected or first available variant:', miniSteamer.selected_or_first_available_variant);
    } else {
      console.log('Mini Garment Steamer not found in products');
    }
  })
  .catch(error => {
    console.error('Error fetching products:', error);
  }); 