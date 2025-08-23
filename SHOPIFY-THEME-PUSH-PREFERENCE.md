# 🚨 IMPORTANT: Shopify Theme Push Preference

## Theme Push Instructions for Future Agents

**ALWAYS PUSH TO DAWN THEME (LIVE THEME), NOT DEVELOPMENT THEME**

### Workflow:
1. **Pull first**: `shopify theme pull` (select Dawn theme)
2. **Push to Dawn**: `shopify theme push --theme=Dawn`

### Why Dawn Theme?
- The Dawn theme is the **LIVE** theme for this store
- Development theme is not used for production
- All changes should go directly to the live Dawn theme

### Commands:
```bash
# Step 1: Pull current Dawn theme
shopify theme pull
# Select: Dawn (Live theme)

# Step 2: Push changes to Dawn theme
shopify theme push --theme=Dawn
```

### Important Notes:
- ✅ **DO**: Push to Dawn theme (live)
- ❌ **DON'T**: Push to Development theme
- 🔄 **ALWAYS**: Pull before pushing to sync changes
- 📝 **REMEMBER**: This is a live store, so be careful with changes

### Theme IDs:
- **Dawn (Live)**: #153742344404
- **Development**: #900aac-Pulkits-MacBook-Pro (not used)

---
**Last Updated**: Current session
**Store**: 0s3zsa-w1.myshopify.com
