# Massa Blockchain Deployment Checklist

## Pre-Deployment Requirements

### CSS & Styles
- [x] Tailwind CSS compilation working (`npm run css:build`)
- [x] CSS output file generated: `src/output.css` (42KB)
- [x] CSS bundled in production: `dist/assets/index-*.css` (35KB)
- [x] No external CSS imports (all inline)
- [ ] ⚠️ **ACTION REQUIRED**: Remove external font imports before upload
  - Google Fonts CDN cannot be accessed on-chain
  - FontAwesome CDN cannot be accessed on-chain
  - See "Removing External Resources" below

### Build Process
- [x] npm scripts configured for CSS compilation
- [x] Production build script working
- [x] Build artifacts created in `dist/` folder
- [x] No TypeScript errors in build (warnings only)

### Code Review
- [ ] Review components for any external API calls
- [ ] Check for any fetch() or axios calls to external servers
- [ ] Verify all data is stored locally or in contracts

## Removing External Resources (CRITICAL)

### Option 1: Remove External Resources
Edit `frontend/index.html` and remove these lines:

```html
<!-- REMOVE THESE LINES -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
```

Then update `tailwind.config.js` to use web-safe fonts:

```javascript
fontFamily: {
  'display': ['Rajdhani', 'Orbitron', 'sans-serif'],  // Keep custom fonts
  'body': ['Arial', 'Helvetica', 'sans-serif'],       // Use web-safe font
}
```

### Option 2: Self-Host Fonts (Advanced)
1. Download font files
2. Place in `frontend/public/fonts/`
3. Define in CSS:
```css
@font-face {
  font-family: 'Poppins';
  src: url('/fonts/poppins-400.woff2') format('woff2');
}
```

## Build & Upload Process

### 1. Final Build
```bash
# From frontend directory
npm run build

# Should output to dist/
# dist/
# ├── assets/
# │   ├── index-*.js      (1.4MB)
# │   └── index-*.css     (35KB)
# ├── index.html
# ├── tetris.mp3
# ├── tetris.svg
# └── [other assets]
```

### 2. Remove External Resources
```bash
# Edit frontend/index.html
# Delete lines with:
# - fonts.googleapis.com
# - cdnjs.cloudflare.com/ajax/libs/font-awesome
# - gstatic.com
```

### 3. Verify Build Size
```bash
# CSS should be ~35KB (minified)
# JS should be ~1.4MB
# Total with assets: ~3-4MB (depends on media)

# If too large:
# - Remove unused media files
# - Optimize images
# - Check for duplicate dependencies
```

### 4. Upload to Massa DeWeb
```bash
# Using Massa CLI or DeWeb tool
# Upload contents of dist/ folder to blockchain

# Example:
deweb deploy ./dist
```

## Testing Checklist

Before uploading, test locally:

```bash
# 1. Build production version
npm run build

# 2. Preview production build
npm run preview

# Open http://localhost:4173

# 3. Test in browser
- [x] Page loads (no 404s)
- [x] All styles applied correctly
- [x] Dark theme colors visible
- [x] Custom buttons (.btn-cyber) styled
- [x] Cards (.card-cyber) styled with glow
- [x] No console errors
- [x] No failed requests in Network tab
- [x] Responsive on mobile devices

# 4. DevTools Checks
- Network tab: Check that only local files load
- Console: No warnings about missing resources
- Performance: No external requests to CDNs
```

## File Size Reference

### Current Sizes
| File | Size | Notes |
|------|------|-------|
| Tailwind CSS (dev) | 268KB | `src/styles/tailwindcss.css` - OLD, don't use |
| Tailwind CSS (compiled) | 42KB | `src/output.css` - Current |
| Bundle CSS (minified) | 35KB | `dist/assets/index-*.css` - Deployed |
| Bundle JS | 1.4MB | `dist/assets/index-*.js` - React + app code |
| Media files | ~2MB | tetris.mp3, tetris.svg, PDFs |
| **Total** | **~3.5MB** | Acceptable for blockchain |

### Size Optimization Tips
If you need to reduce size:
1. Remove unused media files (PDFs, audio)
2. Remove unused npm packages
3. Use tree-shaking in Vite config
4. Compress images

## Troubleshooting

### Issue: "External fonts not loading"
- **Expected behavior**: Fonts won't load on-chain
- **Solution**: Use web-safe fonts or self-host
- **Files to update**: `tailwind.config.js`, `index.html`

### Issue: "FontAwesome icons missing"
- **Expected behavior**: Icons won't show without CDN
- **Solution**: Replace with Unicode symbols or self-hosted icons
- **Files to update**: Remove FontAwesome CDN, update components

### Issue: "Styles not showing in production"
- **Check**: Did you run `npm run build`?
- **Check**: Is `dist/assets/index-*.css` present?
- **Check**: Does `index.html` reference the CSS file?

### Issue: "Build fails with PostCSS error"
- **Solution**: Ensure `autoprefixer` is installed
- **Command**: `npm install -D autoprefixer`

## Post-Deployment

After uploading to Massa:

- [ ] Test the live URL
- [ ] Verify styles are applied
- [ ] Check browser DevTools for any errors
- [ ] Test all interactive features
- [ ] Test on different devices/browsers
- [ ] Monitor for any blockchain-specific issues

## Important Notes

⚠️ **On-Chain Limitations:**
- Cannot make external HTTP requests (no API calls to non-blockchain services)
- Cannot access Google Fonts or FontAwesome CDN
- Cannot use external JavaScript libraries that require remote resources
- File size should be reasonable for blockchain storage

✓ **What Works:**
- CSS styling and animations
- Local JavaScript execution
- Blockchain interactions (with proper Web3 setup)
- Static assets (images, fonts bundled in dist/)

## File Locations

```
frontend/
├── index.html                          ← Remove external links here
├── src/
│   ├── output.css                      ← Generated CSS (import this)
│   ├── main.tsx                        ← Imports output.css
│   └── styles/                         ← Keep for reference
├── tailwind.config.js                  ← Update fontFamily here
├── dist/                               ← Upload this folder
│   ├── index.html                      ← Final HTML
│   ├── assets/                         ← JS & CSS bundles
│   ├── tetris.svg
│   ├── tetris.mp3
│   └── [other assets]
└── MASSA_DEPLOYMENT_CHECKLIST.md       ← You are here
```

## Commands Reference

```bash
# Development
npm run dev                  # CSS watch + Vite dev server

# Build
npm run build              # Full production build

# Preview
npm run preview            # Test production build locally

# CSS only
npm run css:build          # One-time CSS compilation
npm run css:watch          # CSS watch mode
```

---

**Last Updated**: November 25, 2025
**Status**: Ready for deployment after removing external resources
