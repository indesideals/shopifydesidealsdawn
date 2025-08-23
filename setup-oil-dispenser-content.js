// Script to set up custom content for Oil Dispenser product
// Run this in your browser console on the Shopify admin page

const oilDispenserContent = {
  // One Liner
  one_liner: "CONTROL EVERY DROP, MASTER EVERY DISH",
  
  // Product Description
  product_description: `<p>Transform your cooking experience with our innovative 2-in-1 Oil Brush Glass Dispenser. This premium kitchen tool combines a 250ml glass container with a food-grade silicone brush, allowing you to dispense oil and brush simultaneously for perfect, controlled application.</p>
<p>Perfect for greasing pans, brushing marinades, applying oil to bread, or any cooking task that requires precise oil control. The leak-proof design ensures no mess, while the easy-to-clean construction makes maintenance effortless.</p>`,
  
  // Key Features (separated by |)
  key_features: "250ml glass container with silicone brush|2-in-1 design: dispense oil and brush simultaneously|Food-grade silicone brush head|Leak-proof design prevents spills|Easy to clean and refill|Dishwasher safe components|Perfect for greasing pans and applying marinades",
  
  // How to Use (separated by |)
  how_to_use: "Fill the glass container with your preferred cooking oil|Press the silicone brush gently to dispense oil|Brush oil evenly on your cooking surface or food|For marinades, fill with your marinade mixture|Clean with warm soapy water after each use|Store in a cool, dry place when not in use",
  
  // Customer Reviews (format: "Name|Review||Name|Review")
  customer_reviews: "Priya S.|Amazing oil dispenser! The brush works perfectly and no more messy oil bottles.||Rajesh K.|Perfect for greasing pans! The control is incredible.||Anita M.|Excellent quality glass and silicone brush. Easy to clean.||Suresh P.|This is exactly what I needed for my kitchen. Love the precision.||Meera R.|High quality construction and the oil flow is perfect.||Vikram D.|Great value for money, the 2-in-1 design is brilliant!||Lakshmi N.|Easy to clean and the brush doesn't absorb oil like others.||Arjun S.|Perfect size and the glass container is beautiful.||Kavya M.|Fast shipping and the packaging was excellent.||Rahul K.|Love the design and the oil control is amazing.||Divya P.|Excellent product quality and the brush is so soft.||Amit S.|Great addition to my kitchen tools collection.||Neha R.|Very satisfied with the purchase. No more oil spills!||Karan M.|Highly recommend this oil dispenser! Game changer.||Pooja S.|Best kitchen tool I've bought this year!"
};

console.log('Oil Dispenser Custom Content Setup:');
console.log('=====================================');
console.log('1. Go to your Shopify Admin');
console.log('2. Navigate to Products > Oil Dispenser');
console.log('3. Scroll down to Metafields section');
console.log('4. Add these custom metafields:');
console.log('');

Object.entries(oilDispenserContent).forEach(([key, value]) => {
  console.log(`${key}:`);
  console.log(`Type: Single line text or Multi-line text`);
  console.log(`Value: ${value}`);
  console.log('');
});

console.log('Or use the Shopify CLI to set metafields:');
console.log('shopify metafields set --product-id=YOUR_PRODUCT_ID --namespace=custom --key=one_liner --value="CONTROL EVERY DROP, MASTER EVERY DISH"');
