#!/bin/bash
# 🚀 Automated Git + Shopify Deployment Script
# This script helps you deploy changes to both Git and Shopify Dawn theme

echo "🚀 Mobile/Desktop Separated Theme Deployment"
echo "============================================"

# Check if we're in the right directory
if [[ ! -f "MOBILE-DESKTOP-SEPARATION-SUMMARY.md" ]]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Get commit message from user
echo "📝 Enter commit message (or press Enter for auto-generated):"
read commit_message

# Generate auto message if none provided
if [[ -z "$commit_message" ]]; then
    commit_message="🔄 Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo ""
echo "Starting deployment with message: $commit_message"
echo ""

# Stage all changes
echo "📦 Staging all changes..."
git add .

if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "$commit_message"
    
    # Push to GitHub
    echo "📤 Pushing to GitHub..."
    if git push origin main; then
        echo "✅ Successfully pushed to GitHub"
    else
        echo "❌ Failed to push to GitHub"
        exit 1
    fi
fi

echo ""
echo "🎯 Next Steps for Shopify Deployment:"
echo "====================================="
echo ""
echo "1. 🧪 Test on development theme first:"
echo "   shopify theme push --development"
echo ""
echo "2. 🔍 Verify your changes work correctly:"
echo "   - Test mobile version (device=mobile)"
echo "   - Test desktop version (device=desktop)"
echo "   - Check cart functionality"
echo "   - Verify device detection"
echo ""
echo "3. 🚀 Deploy to live site when ready:"
echo "   shopify theme push --live"
echo ""
echo "4. 📊 Monitor after deployment:"
echo "   - Check performance"
echo "   - Verify mobile/desktop separation"
echo "   - Test critical user flows"
echo ""

# Ask if user wants to deploy to development theme
echo "❓ Deploy to development theme now? (y/N):"
read deploy_dev

if [[ "$deploy_dev" =~ ^[Yy]$ ]]; then
    echo "🧪 Deploying to development theme..."
    if shopify theme push --development; then
        echo "✅ Successfully deployed to development theme"
        echo "🔗 Check your development theme to test changes"
    else
        echo "❌ Failed to deploy to development theme"
        echo "💡 Make sure Shopify CLI is installed and you're authenticated:"
        echo "   brew install shopify-cli"
        echo "   shopify auth login"
    fi
else
    echo "ℹ️  Skipping development deployment"
fi

echo ""
echo "✅ Git deployment complete!"
echo "📋 See DEPLOYMENT-GUIDE.md for detailed instructions"
echo ""
