# 🧪 Local Testing Guide for nc-table-react

This guide shows you how to test your nc-table-react component library locally before publishing to npm.

## 🚀 Method 1: Development Server (Recommended for UI Testing)

### Quick Start

```bash
# Start the development server
npm run dev

# The server will start on http://localhost:5173
# Open your browser to see the interactive demo
```

### What You'll See

- **Serial Number Examples**: Tables with and without serial numbers
- **Conditional Actions**: Dynamic action visibility based on item data
- **Interactive Features**: Search, pagination, sorting, selection
- **Real-time Updates**: Changes to code will hot-reload automatically

### Testing Checklist

- [ ] Serial numbers appear correctly (S/No column)
- [ ] Serial numbers hide when `showSerialNumber={false}`
- [ ] Serial numbers calculate correctly across pages
- [ ] Actions show/hide based on `show` property
- [ ] Action column only appears when there are visible actions
- [ ] All existing features still work (search, pagination, etc.)

---

## 🔗 Method 2: npm link (Testing in External Projects)

### Step 1: Create Global Link

```bash
# In your nc-table-react directory
npm link

# This creates a global symlink to your package
```

### Step 2: Create Test Project

```bash
# Create a new test project
npx create-react-app test-nc-table --template typescript
cd test-nc-table

# Or use Vite
npm create vite@latest test-nc-table -- --template react-ts
cd test-nc-table
npm install
```

### Step 3: Link Your Package

```bash
# In your test project directory
npm link nc-table-react

# Install peer dependencies
npm install react-i18next i18next lucide-react clsx class-variance-authority tailwind-merge date-fns
npm install @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-toast
```

### Step 4: Test Your Package

```tsx
// src/App.tsx
import React from "react";
import { NcTable, type Column, type TableAction } from "nc-table-react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

const data: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "inactive",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "active",
  },
];

const columns: Column<User>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
];

const actions: TableAction<User>[] = [
  {
    label: "Edit",
    onClick: (user) => console.log("Edit", user),
    show: true, // Always show
  },
  {
    label: "Activate",
    onClick: (user) => console.log("Activate", user),
    show: (user) => user.status === "inactive", // Only show for inactive users
  },
  {
    label: "Delete",
    onClick: (user) => console.log("Delete", user),
    variant: "destructive",
    show: (user) => user.role !== "Admin", // Hide delete for admins
  },
];

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Testing nc-table-react Locally
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">With Serial Numbers</h2>
        <NcTable
          data={data}
          columns={columns}
          actions={actions}
          idField="id"
          showSerialNumber={true}
          pageSize={2}
          showPagination={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Without Serial Numbers</h2>
        <NcTable
          data={data}
          columns={columns}
          actions={actions}
          idField="id"
          showSerialNumber={false}
          pageSize={2}
          showPagination={true}
        />
      </div>
    </div>
  );
}

export default App;
```

### Step 5: Start Test Project

```bash
# In your test project
npm start
# or
npm run dev
```

### Cleanup

```bash
# When done testing, unlink the package
npm unlink nc-table-react

# In your nc-table-react directory, remove the global link
npm unlink
```

---

## 📦 Method 3: Package Tarball Testing

### Step 1: Build and Pack

```bash
# In your nc-table-react directory
npm run build
npm pack

# This creates nc-table-react-0.3.5.tgz
```

### Step 2: Install in Test Project

```bash
# In your test project directory
npm install /path/to/nc-table-react-0.3.5.tgz

# Or if you're in the same directory
npm install ./nc-table-react-0.3.5.tgz
```

### Step 3: Test and Cleanup

```bash
# Test your package
npm start

# When done, remove the package
npm uninstall nc-table-react
```

---

## 🔍 Testing Checklist

### Serial Number Feature

- [ ] Serial numbers display correctly (1, 2, 3, etc.)
- [ ] Serial numbers hide when `showSerialNumber={false}`
- [ ] Serial numbers continue correctly across pages (Page 2: 6, 7, 8...)
- [ ] Serial number column header shows "S/No"
- [ ] Serial numbers work with different page sizes

### Conditional Actions Feature

- [ ] Actions with `show: true` always appear
- [ ] Actions with `show: false` never appear
- [ ] Actions with `show: (item) => boolean` show/hide based on item data
- [ ] Action column only appears when there are visible actions for that row
- [ ] Multiple conditional actions work together correctly
- [ ] Actions with `separator` property still work correctly

### Integration Testing

- [ ] Serial numbers work with row selection
- [ ] Serial numbers work with sorting
- [ ] Serial numbers work with search/filtering
- [ ] Conditional actions work with row selection
- [ ] Conditional actions work with bulk actions
- [ ] All existing features still work as expected

### Performance Testing

- [ ] Large datasets (1000+ rows) render quickly
- [ ] Serial number calculation doesn't cause performance issues
- [ ] Conditional action evaluation doesn't cause performance issues
- [ ] Memory usage is reasonable

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot resolve module 'nc-table-react'"

**Solution**: Make sure you've run `npm link` in the package directory and `npm link nc-table-react` in your test project.

### Issue: "Module not found: Can't resolve 'react/jsx-runtime'"

**Solution**: This is expected - the JSX runtime is properly externalized. Make sure your test project has React 18+ installed.

### Issue: "Actions not showing/hiding correctly"

**Solution**: Check that your `show` function returns a boolean and handles all possible item states.

### Issue: "Serial numbers not calculating correctly"

**Solution**: Verify that `currentPage` and `pageSize` are being passed correctly to your data handler.

---

## 🚀 Before Publishing

1. **Test All Methods**: Use both development server and npm link testing
2. **Test Different Scenarios**: Various data types, edge cases, large datasets
3. **Cross-browser Testing**: Test in Chrome, Firefox, Safari, Edge
4. **Mobile Testing**: Test responsive behavior on mobile devices
5. **Performance Testing**: Test with large datasets (1000+ rows)
6. **TypeScript Testing**: Ensure all types work correctly
7. **Documentation Review**: Verify all examples in README work correctly

---

## 📝 Quick Commands Reference

```bash
# Development server
npm run dev

# Build for production
npm run build

# Clean build artifacts
npm run clean

# Create npm link
npm link

# Install from link in test project
npm link nc-table-react

# Pack for tarball testing
npm pack

# Publish to npm (when ready)
npm publish
```

Happy testing! 🎉















