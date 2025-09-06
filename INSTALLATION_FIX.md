# 🔧 Installation Fix for createSlot Error

**🎉 FIXED in v0.2.2+**: This error should no longer occur with `nc-table-react@0.2.2` and later versions, as we've externalized all Radix UI dependencies.

If you still encounter this error with older versions:

```
ERROR: No matching export in "node_modules/@radix-ui/react-slot/dist/index.mjs" for import "createSlot"
```

## 🎯 Quick Fix

Update to the latest version:

```bash
npm install nc-table-react@latest
```

## 🔄 Complete Solution

1. **Install the package with peer dependencies:**

```bash
npm install nc-table-react @radix-ui/react-slot@^1.0.2
```

2. **If you already have nc-table-react installed:**

```bash
npm install @radix-ui/react-slot@^1.0.2
npm install nc-table-react@latest
```

3. **For existing projects with conflicting radix-ui versions:**

```bash
npm update @radix-ui/react-slot
```

## 📋 Required Peer Dependencies

Make sure you have these installed:

```bash
npm install react@^18 react-dom@^18 react-i18next@^15 lucide-react@^0.400.0 @radix-ui/react-slot@^1.0.2
```

## ✅ Verification

After installation, verify it works:

```tsx
import { NcTable } from "nc-table-react";
// Should work without errors
```

## 🐛 Still Having Issues?

If the error persists:

1. **Clear your node_modules:**

```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check your package.json dependencies** for conflicting versions of `@radix-ui/*` packages

3. **Use the exact version that works:**

```bash
npm install @radix-ui/react-slot@1.0.2 --save-exact
```

## 📞 Support

If you're still having trouble, please open an issue at: https://github.com/NextCounsel/NCTable/issues
