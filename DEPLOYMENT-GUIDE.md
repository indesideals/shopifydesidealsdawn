# 🚀 Deployment Guide: Git + Shopify Dawn Theme

## 📖 **Overview**
This guide helps you manage your Shopify theme with both Git version control and Dawn theme deployment.

---

## 🔧 **Initial Setup** (One-time)

### 1. **Install Shopify CLI** (if not already installed)
```bash
# On macOS
brew install shopify-cli

# Or using npm
npm install -g @shopify/cli @shopify/theme
```

### 2. **Authenticate with Shopify**
```bash
shopify auth login
```

### 3. **Connect to Your Store**
```bash
# Navigate to your project directory
cd /Users/pulkitsrivasatava/Desktop/shopify-store-project

# Connect to your Shopify store
shopify theme init
```

---

## 🔄 **Development Workflow**

### **For Local Development:**
```bash
# Start local development server
shopify theme dev

# This will:
# ✅ Start local preview server
# ✅ Watch for file changes
# ✅ Automatically sync changes to development theme
# ✅ Provide local URL for testing
```

### **For Making Changes:**
1. **Edit files locally** in your preferred editor
2. **Test changes** using the local dev server
3. **Commit to Git** when satisfied with changes
4. **Push to production** when ready

---

## 📤 **Deployment Process**

### **Option 1: Deploy to Development Theme (for testing)**
```bash
# Push to development theme for testing
shopify theme push --development

# Or create a new theme for testing
shopify theme push --unpublished
```

### **Option 2: Deploy to Live/Production Theme**
```bash
# ⚠️ IMPORTANT: This updates your live website
shopify theme push --live

# Or push to main theme
shopify theme push
```

### **Option 3: Deploy Specific Files**
```bash
# Push only specific files
shopify theme push --only=assets/mobile.css,assets/desktop.css

# Push only templates
shopify theme push --only=templates/

# Push only sections
shopify theme push --only=sections/
```

---

## 📋 **Complete Workflow: Git + Shopify**

### **Daily Development Process:**

1. **Start Development Session:**
```bash
cd /Users/pulkitsrivasatava/Desktop/shopify-store-project
shopify theme dev
```

2. **Make Changes:**
   - Edit your files (mobile.css, desktop.css, etc.)
   - Test locally using the dev server URL
   - Verify mobile/desktop separation works correctly

3. **Commit to Git:**
```bash
git add .
git commit -m "✨ Add feature: [describe your changes]"
git push origin main
```

4. **Deploy to Shopify:**
```bash
# For testing
shopify theme push --development

# For production (when ready)
shopify theme push --live
```

---

## 🎯 **Quick Commands Reference**

### **Git Commands:**
```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature
```

### **Shopify Commands:**
```bash
# Start development
shopify theme dev

# Push to development theme
shopify theme push --development

# Push to live theme
shopify theme push --live

# Download current theme
shopify theme pull

# List all themes
shopify theme list

# Create backup
shopify theme push --unpublished --theme-name="Backup-$(date +%Y%m%d)"
```

---

## 🔄 **Automated Workflow** (Advanced)

### **Create a Deployment Script:**

```bash
#!/bin/bash
# File: deploy.sh

echo "🚀 Starting deployment process..."

# Add all changes to git
echo "📝 Adding changes to git..."
git add .

# Commit with timestamp
echo "💾 Committing changes..."
git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Push to Shopify development theme first
echo "🧪 Deploying to development theme for testing..."
shopify theme push --development

echo "✅ Deployment complete!"
echo "🔗 Test your changes, then run 'shopify theme push --live' when ready"
```

**Make it executable:**
```bash
chmod +x deploy.sh
```

**Use it:**
```bash
./deploy.sh
```

---

## ⚠️ **Important Notes**

### **Before Going Live:**
1. **Always test on development theme first**
2. **Check mobile AND desktop versions**
3. **Verify device detection works**
4. **Test cart functionality on both devices**
5. **Check all critical pages**

### **Backup Strategy:**
```bash
# Create backup before major changes
shopify theme push --unpublished --theme-name="Backup-Mobile-Desktop-Separation-$(date +%Y%m%d)"
```

### **Emergency Rollback:**
```bash
# If something goes wrong, quickly revert
git revert HEAD
shopify theme push --live
```

---

## 📊 **Monitoring Your Deployment**

### **After Deployment, Check:**
- ✅ Mobile version loads correctly
- ✅ Desktop version loads correctly  
- ✅ Device detection works
- ✅ Mobile cart functions properly
- ✅ Desktop cart functions properly
- ✅ Wishlist works on both devices
- ✅ Search functionality works
- ✅ All critical user flows

### **Performance Monitoring:**
```bash
# Check theme size
shopify theme list

# Monitor load times
# Use browser dev tools or online tools like:
# - PageSpeed Insights
# - GTmetrix  
# - WebPageTest
```

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

**1. "Theme not found" error:**
```bash
shopify theme list
shopify theme push --theme-id=YOUR_THEME_ID
```

**2. "Authentication failed":**
```bash
shopify auth logout
shopify auth login
```

**3. "File conflicts":**
```bash
shopify theme pull
# Resolve conflicts manually
git add .
git commit -m "Resolve conflicts"
```

**4. Device detection not working:**
- Check `device-detection.js` is loading
- Verify theme.liquid router logic
- Test URL parameters manually

---

## 🎉 **Success Metrics**

Your deployment is successful when:
- ✅ Git repository is updated
- ✅ GitHub shows latest changes  
- ✅ Shopify theme is live
- ✅ Mobile users get mobile experience
- ✅ Desktop users get desktop experience
- ✅ No code overlap between devices
- ✅ Performance improved (check load times)

---

## 📞 **Quick Support**

If you encounter issues:
1. Check the Shopify CLI docs: https://shopify.dev/tools/cli
2. Verify your theme structure matches Shopify requirements
3. Test locally first: `shopify theme dev`
4. Use development themes for testing before going live

**Remember: Your mobile/desktop separation is now complete! 🎯**
