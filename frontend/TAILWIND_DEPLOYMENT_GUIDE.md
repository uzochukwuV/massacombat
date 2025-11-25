# Tailwind CSS On-Chain Deployment Guide

## Overview
Your frontend has been configured to generate a **self-contained CSS bundle** suitable for on-chain deployment on the Massa blockchain. This eliminates external CSS dependencies that cannot be fetched on-chain.

## Setup Summary

### What Changed
1. **Created `src/input.css`** - Entry point for Tailwind CSS compilation using `@import "tailwindcss"`
2. **Updated `tailwind.config.js`** - Added safelist for custom component classes that might be dynamically applied
3. **Updated `package.json`** - Added CSS build scripts:
   - `npm run css:build` - One-time CSS compilation
   - `npm run css:watch` - Watch mode for development
   - `npm run dev` - Runs CSS watcher + Vite dev server
   - `npm run build` - Builds CSS first, then compiles TypeScript and bundles with Vite
4. **Updated `src/main.tsx`** - Now imports compiled `output.css` instead of the raw Tailwind directives

### Generated Output
- **`src/output.css`** - Compiled CSS file (42KB)
  - Contains all Tailwind utilities scanned from your component files
  - Includes your custom color theme (Unreal Engine dark theme)
  - Includes all custom component classes (.btn-cyber, .card-cyber, etc.)
  - **Fully self-contained** - no external imports

## Development Workflow

### Start Development
```bash
npm run dev
```
This starts both:
- CSS watch mode (rebuilds output.css on file changes)
- Vite dev server (with HMR)

### Build for Production
```bash
npm run build
```
This:
1. Compiles Tailwind CSS → `src/output.css`
2. Compiles TypeScript → JavaScript
3. Bundles everything with Vite → `dist/`

## On-Chain Deployment Checklist

### Before Uploading to Massa
- [ ] Run `npm run build` to generate optimized bundles
- [ ] Verify `src/output.css` exists and contains all styles
- [ ] Check that Vite output in `dist/` includes references to inlined styles
- [ ] Ensure no CSS files are being imported via URL (only inline)
- [ ] Test the built version locally: `npm run preview`

### CSS File Inclusion
The compiled CSS is automatically bundled into your React app:
- When you `import './output.css'` in `main.tsx`
- Vite will include it in your final JavaScript bundle
- **Result**: All styles are embedded in your JS, not as separate HTTP requests

### Handling Dynamic Classes
If you use dynamic class names that Tailwind can't detect statically:
```javascript
// BAD - Tailwind can't scan for this
const className = `text-${color}-500`;

// GOOD - Tailwind can detect these
const className = color === 'red' ? 'text-red-500' : 'text-blue-500';
```

If you must use dynamic classes, add them to the `safelist` in `tailwind.config.js`:
```javascript
safelist: [
  'text-red-500',
  'text-blue-500',
  { pattern: /^text-(red|blue|green)-/ }
]
```

## Troubleshooting

### Styles not showing up after build
1. Make sure you ran `npm run css:build` or `npm run build`
2. Verify `src/output.css` was generated
3. Check that `import './output.css'` is in `src/main.tsx`
4. Look in browser DevTools for the compiled CSS

### CSS file size is too large
The current output is 42KB (good for on-chain). If it grows:
1. Check for unused component dependencies
2. Remove unused Tailwind plugins
3. Review your `content` paths in `tailwind.config.js`

### Custom classes not working
Add them to the `safelist` in `tailwind.config.js`:
```javascript
safelist: [
  { pattern: /^(btn-|badge-|card-|stat-|text-glow|spinner|table-|clip-)/ },
  // Add more patterns as needed
]
```

## File Structure
```
frontend/
├── src/
│   ├── input.css           (NEW) Entry point for Tailwind
│   ├── output.css          (NEW) Generated compiled CSS
│   ├── main.tsx            (UPDATED) Now imports output.css
│   ├── styles/
│   │   ├── globals.css     (Still used - your custom base styles)
│   │   ├── tailwindcss.css (Still exists - no longer imported)
│   │   └── dashboard.css
│   └── ... (rest of components)
├── tailwind.config.js      (UPDATED) Added safelist
├── vite.config.ts
├── postcss.config.js       (Unchanged)
└── package.json            (UPDATED) Added CSS build scripts
```

## Next Steps
1. Test the dev environment: `npm run dev`
2. Build for production: `npm run build`
3. Test the production build: `npm run preview`
4. Deploy to Massa blockchain
