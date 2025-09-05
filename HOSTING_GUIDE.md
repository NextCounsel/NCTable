# 🚀 NC-Table Demo Hosting Guide

This guide shows you how to deploy the nc-table demo to various hosting platforms.

## 📦 Build for Production

First, build the demo for production:

```bash
npm run build
```

This creates a `dist/` folder with optimized static files.

## 🌐 Hosting Options

### 1. **Vercel** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Or** connect your GitHub repository to Vercel for automatic deployments.

### 2. **Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Or** drag and drop the `dist/` folder to netlify.com

### 3. **GitHub Pages**

1. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://NextCounsel.github.io/NCTable"
}
```

3. Deploy:

```bash
npm run build
npm run deploy
```

### 4. **Surge.sh**

```bash
# Install Surge
npm install -g surge

# Deploy
cd dist
surge
```

### 5. **Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init hosting

# Deploy
npm run build
firebase deploy
```

## ⚙️ Configuration

### Vite Config for Hosting

Update `vite.config.ts` for specific hosting needs:

```typescript
export default defineConfig({
  // For GitHub Pages
  base: "/nc-table/",

  // For subdirectory hosting
  base: "/demo/",

  // For custom domain
  base: "/",
});
```

### Environment Variables

For production, you might want to set:

```bash
VITE_APP_TITLE="nc-table Demo"
VITE_GITHUB_URL="https://github.com/your-username/nc-table"
VITE_NPM_URL="https://www.npmjs.com/package/nc-table"
```

## 📋 Pre-deployment Checklist

- [x] Update GitHub URLs in `COMPREHENSIVE_EXAMPLE.tsx`
- [ ] Update npm package URLs
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Verify all links work
- [ ] Check responsive design
- [ ] Test all table features
- [ ] Ensure analytics are set up (if needed)

## 🔄 Continuous Deployment

### GitHub Actions (for GitHub Pages)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🎯 Demo URLs

Once deployed, your demo will showcase:

- ✅ Live interactive table with real data
- ✅ Advanced search with all data types
- ✅ Filter string generation for backends
- ✅ All CRUD operations
- ✅ Export functionality
- ✅ Responsive design
- ✅ Real-time debug console
- ✅ Installation instructions
- ✅ Links to documentation and GitHub

## 📊 Analytics (Optional)

Add Google Analytics to track demo usage:

```html
<!-- Add to index.html -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

## 🔧 Troubleshooting

### Build Issues

If build fails:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routing Issues

For SPA routing, add redirects:

**Netlify** (`public/_redirects`):

```
/*    /index.html   200
```

**Vercel** (`vercel.json`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Your nc-table demo is now ready to impress users worldwide! 🌟
