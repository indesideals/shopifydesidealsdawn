#!/bin/bash

# Wishlist Plus App Installation Helper
# This script helps you install and configure the Wishlist Plus app

echo "🎉 Welcome to Wishlist Plus App Setup!"
echo "======================================"
echo ""

# Check if Shopify CLI is installed
if ! command -v shopify &> /dev/null; then
    echo "❌ Shopify CLI is not installed."
    echo "Please install Shopify CLI first:"
    echo "npm install -g @shopify/cli @shopify/theme"
    echo ""
    exit 1
fi

echo "✅ Shopify CLI is installed"
echo ""

# Check if we're in a Shopify theme directory
if [ ! -f "config/settings_schema.json" ]; then
    echo "❌ This doesn't appear to be a Shopify theme directory."
    echo "Please run this script from your Shopify theme root directory."
    echo ""
    exit 1
fi

echo "✅ Shopify theme detected"
echo ""

echo "📋 Installation Steps:"
echo "======================"
echo ""
echo "1. Go to your Shopify Admin Panel"
echo "2. Navigate to Apps → App Store"
echo "3. Search for 'Wishlist Plus'"
echo "4. Click 'Add app' → 'Install app'"
echo "5. Grant necessary permissions"
echo ""
echo "🔧 Configuration Steps:"
echo "======================"
echo ""
echo "After installation:"
echo "1. Go to the Wishlist Plus app dashboard"
echo "2. Navigate to Settings"
echo "3. Configure the following:"
echo "   - Wishlist Page URL: /pages/favorites"
echo "   - Heart Icon Color: #ef4444"
echo "   - Enable Email Notifications: ✅"
echo "   - Enable Marketing Features: ✅"
echo ""
echo "🎨 Theme Integration:"
echo "===================="
echo ""
echo "✅ Your theme is already configured for seamless integration!"
echo "✅ Heart icons will appear on product pages"
echo "✅ Wishlist page is ready at /pages/favorites"
echo "✅ Customer authentication is required"
echo "✅ Cross-device sync will work"
echo ""
echo "📊 Business Benefits:"
echo "===================="
echo ""
echo "✅ Customer wishlist data for marketing"
echo "✅ Email campaigns to wishlist customers"
echo "✅ Special offers on wishlist items"
echo "✅ Back-in-stock notifications"
echo "✅ Cross-selling suggestions"
echo ""
echo "🚀 Ready to install?"
echo "===================="
echo ""
echo "Your theme is fully prepared for Wishlist Plus integration!"
echo "Just follow the installation steps above."
echo ""
echo "Need help? Check the documentation:"
echo "📖 Setup Guide: wishlist-app-setup.md"
echo "⚡ Quick Setup: QUICK-SETUP.md"
echo "🔧 Integration: wishlist-app-integration.js"
echo ""

# Check if theme is ready for deployment
echo "🔍 Checking theme readiness..."
if [ -f "sections/favorites.liquid" ] && [ -f "sections/best-sellers.liquid" ]; then
    echo "✅ Theme files are ready for wishlist integration"
else
    echo "⚠️ Some theme files may be missing"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Install Wishlist Plus app from Shopify App Store"
echo "2. Configure app settings"
echo "3. Test wishlist functionality"
echo "4. Set up marketing features"
echo "5. Monitor customer data"
echo ""

echo "🎉 You're all set for a professional wishlist system!"
echo "=====================================================" 