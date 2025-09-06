# nc-table-react

**Flexible React table component with advanced search, actions, settings, selection, and pagination.**

A production-ready, feature-rich table component that supports both static and server-side data with powerful filtering capabilities.

## 🚀 Features

- ✅ **Static & Server-side Data** - Works with local arrays or async data handlers
- ✅ **Advanced Search** - 5 data types with 12 comparison operators
- ✅ **Structured Filter Format** - Backend-friendly `${column}${operator}${value};And$...` format
- ✅ **Row Selection** - Single and multi-row selection with bulk actions
- ✅ **Sorting & Pagination** - Built-in sorting and configurable pagination
- ✅ **CRUD Operations** - Built-in delete functionality with confirmation dialogs
- ✅ **Export Features** - CSV, Excel, PDF export options
- ✅ **Responsive Design** - Mobile-optimized interface
- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **Internationalization** - i18n ready with react-i18next

## 📦 Installation

```bash
npm install nc-table-react
npm install react-i18next i18next lucide-react
```

**Requirements:**

- React 18+
- TypeScript (recommended)

## 🎯 Quick Start

```tsx
import React from "react";
import { NcTable, type Column, type TableAction } from "nc-table-react";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

// Minimal i18n setup
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: { translation: {} } } });
}

type User = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
};

const data: User[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", status: "active" },
  { id: 2, name: "Alan Turing", email: "alan@example.com", status: "inactive" },
];

const columns: Column<User>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  { key: "status", header: "Status" },
];

const actions: TableAction<User>[] = [
  { label: "View", onClick: (u) => alert(`Viewing ${u.name}`) },
];

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <NcTable<User>
        data={data}
        columns={columns}
        actions={actions}
        idField="id"
      />
    </I18nextProvider>
  );
}
```

## 🌐 Server-side Data

```tsx
import type { NcTableProps } from "nc-table-react";

type Item = { id: number; name: string };

const handler: NcTableProps<Item>["handler"] = async (params) => {
  // params: { PageNumber, PageSize, Filter?, Order? }
  console.log("Received params:", params);

  // Example server request
  const response = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  return response.json(); // Returns IApiResponse<Item[]>
};

// Usage
<NcTable<Item> columns={[{ key: "name", header: "Name" }]} handler={handler} />;
```

### Backend Filter Format

The component generates structured filter strings for your backend:

```javascript
// Single condition
"name~=John;"

// Multiple conditions
"name~=John;And$department==Engineering;And$salary>50000;"

// Backend receives:
{
  "PageNumber": 1,
  "PageSize": 10,
  "Filter": "name~=John;And$department==Engineering;And$salary>50000;",
  "Order": "name;Asc"
}
```

## 🔍 Advanced Search & Data Types

### Supported Data Types

#### 1. Text (Default)

```tsx
{
  key: "name",
  header: "Name",
  searchable: true,
  // No searchOverride needed - text is default
}
```

#### 2. Date

```tsx
{
  key: "startDate",
  header: "Start Date",
  searchable: true,
  searchOverride: {
    dataType: "date"
  },
  render: (item) => new Date(item.startDate).toLocaleDateString(),
}
```

#### 3. Select (Dropdown)

```tsx
{
  key: "department",
  header: "Department",
  searchable: true,
  searchOverride: {
    dataType: "select",
    selectOptions: [
      { text: "Engineering", value: "Engineering" },
      { text: "Marketing", value: "Marketing" },
      { text: "Sales", value: "Sales" },
    ]
  }
}
```

#### 4. Boolean (Yes/No with true/false)

```tsx
{
  key: "isActive",
  header: "Is Active",
  searchable: true,
  searchOverride: {
    dataType: "boolean"
  },
  render: (item) => item.isActive ? "Yes" : "No",
}
```

#### 5. YesOrNo (Yes/No with 1/0)

```tsx
{
  key: "hasAccess",
  header: "Has Access",
  searchable: true,
  searchOverride: {
    dataType: "YesOrNo"
  },
  render: (item) => item.hasAccess === 1 ? "Yes" : "No",
}
```

### Search Operators

The component provides 12 powerful comparison operators:

- **Equals** (`==`) - Exact match
- **Not Equals** (`!=`) - Does not match
- **Greater Than** (`>`) - Numeric/date comparison
- **Greater Than or Equals** (`>=`) - Numeric/date comparison
- **Less Than** (`<`) - Numeric/date comparison
- **Less Than or Equals** (`<=`) - Numeric/date comparison
- **Contains** (`~=`) - Substring match
- **Not Contains** (`!~=`) - Does not contain substring
- **Starts With** (`_=`) - Begins with pattern
- **Not Starts With** (`!_=`) - Does not begin with pattern
- **Ends With** (`|=`) - Ends with pattern
- **Not Ends With** (`!|=`) - Does not end with pattern

## 🎛️ Complete Feature Example

```tsx
import React, { useState } from "react";
import { NcTable, type Column, type TableAction } from "nc-table-react";

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  startDate: string;
  isActive: boolean;
  hasAccess: number;
  salary: number;
  status: "active" | "inactive" | "pending";
};

const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Name",
    searchable: true,
  },
  {
    key: "department",
    header: "Department",
    searchable: true,
    searchOverride: {
      dataType: "select",
      selectOptions: [
        { text: "Engineering", value: "Engineering" },
        { text: "Marketing", value: "Marketing" },
        { text: "Sales", value: "Sales" },
      ],
    },
  },
  {
    key: "startDate",
    header: "Start Date",
    searchable: true,
    searchOverride: { dataType: "date" },
    render: (emp) => new Date(emp.startDate).toLocaleDateString(),
  },
  {
    key: "isActive",
    header: "Is Active",
    searchable: true,
    searchOverride: { dataType: "boolean" },
    render: (emp) => (emp.isActive ? "Active" : "Inactive"),
  },
  {
    key: "salary",
    header: "Salary",
    searchable: true,
    render: (emp) => `$${emp.salary.toLocaleString()}`,
  },
];

const actions: TableAction<Employee>[] = [
  {
    label: "Edit",
    onClick: (emp) => console.log("Edit", emp),
    icon: "edit",
  },
  {
    label: "Delete",
    onClick: (emp) => console.log("Delete", emp),
    variant: "destructive",
    icon: "trash",
  },
];

export default function AdvancedExample() {
  const [employees, setEmployees] = useState<Employee[]>([
    // ... your data
  ]);

  const handleAdvancedSearch = (filters) => {
    console.log("Search filters:", filters);
    // Handle filtering logic
  };

  const handleBulkAction = (
    action: string,
    selectedIds: (string | number)[]
  ) => {
    console.log(`Bulk ${action} on:`, selectedIds);
  };

  const handleExport = (format: string, selectedIds?: (string | number)[]) => {
    console.log(`Export as ${format}:`, selectedIds || "all");
  };

  const handleDelete = async (ids: (string | number)[]) => {
    // Delete implementation
    console.log("Deleting:", ids);
    return { Succeeded: true, Message: "Deleted successfully" };
  };

  return (
    <NcTable<Employee>
      // Data
      data={employees}
      columns={columns}
      actions={actions}
      idField="id"
      // Search & Filtering
      showAdvancedSearch={true}
      onAdvancedSearch={handleAdvancedSearch}
      enableInternalSearch={true}
      // Selection & Bulk Actions
      selectable={true}
      bulkActions={[
        { value: "export", label: "Export Selected" },
        { value: "archive", label: "Archive Selected" },
        { value: "delete", label: "Delete Selected", variant: "destructive" },
      ]}
      onBulkAction={handleBulkAction}
      // Export
      exportOptions={[
        { format: "csv", label: "Export as CSV" },
        { format: "excel", label: "Export as Excel" },
        { format: "pdf", label: "Export as PDF" },
      ]}
      onExport={handleExport}
      // CRUD Operations
      canDelete={true}
      removeItemHandler={handleDelete}
      // Pagination
      enableInternalPagination={true}
      pageSize={10}
      paginationProps={{
        showFirstLast: true,
        showEllipsis: true,
        maxVisiblePages: 5,
      }}
      // Settings
      enableInternalSettings={true}
      defaultSettings={{
        pageSize: 10,
        sortBy: "name",
        sortDirection: "Asc",
      }}
      // Customization
      searchPlaceholder="Search employees..."
      emptyStateMessage="No employees found"
      className="my-custom-table"
    />
  );
}
```

## 📖 API Reference

### Core Props

| Prop       | Type               | Description                               |
| ---------- | ------------------ | ----------------------------------------- |
| `data?`    | `T[]`              | Static data array                         |
| `columns`  | `Column<T>[]`      | Table column definitions                  |
| `handler?` | `DataHandler<T>`   | Async data function for server-side data  |
| `actions?` | `TableAction<T>[]` | Row action menu items                     |
| `idField?` | `keyof T`          | Unique identifier field (default: `"Id"`) |

### Search & Filtering

| Prop                    | Type                                | Description                             |
| ----------------------- | ----------------------------------- | --------------------------------------- |
| `showAdvancedSearch?`   | `boolean`                           | Enable advanced search UI               |
| `onAdvancedSearch?`     | `(filters: SearchFilter[]) => void` | Advanced search callback                |
| `enableInternalSearch?` | `boolean`                           | Enable internal search state management |
| `searchPlaceholder?`    | `string`                            | Search input placeholder                |

### Selection & Bulk Actions

| Prop                 | Type                                                  | Description                            |
| -------------------- | ----------------------------------------------------- | -------------------------------------- |
| `selectable?`        | `boolean`                                             | Enable row selection (default: `true`) |
| `selectedIds?`       | `(string \| number)[]`                                | Controlled selected IDs                |
| `onSelectionChange?` | `(ids: (string \| number)[]) => void`                 | Selection change callback              |
| `bulkActions?`       | `BulkAction[]`                                        | Bulk action definitions                |
| `onBulkAction?`      | `(action: string, ids: (string \| number)[]) => void` | Bulk action callback                   |

### Export Features

| Prop             | Type                                                   | Description           |
| ---------------- | ------------------------------------------------------ | --------------------- |
| `exportOptions?` | `ExportOption[]`                                       | Export format options |
| `onExport?`      | `(format: string, ids?: (string \| number)[]) => void` | Export callback       |

### CRUD Operations

| Prop                 | Type                                                            | Description                 |
| -------------------- | --------------------------------------------------------------- | --------------------------- |
| `canDelete?`         | `boolean`                                                       | Enable delete functionality |
| `removeItemHandler?` | `(ids: (string \| number)[]) => Promise<IApiResponse<unknown>>` | Delete handler              |

### Pagination

| Prop                        | Type              | Description                                |
| --------------------------- | ----------------- | ------------------------------------------ |
| `enableInternalPagination?` | `boolean`         | Enable internal pagination                 |
| `showPagination?`           | `boolean`         | Show pagination controls                   |
| `pageSize?`                 | `number`          | Items per page                             |
| `currentPage?`              | `number`          | Current page (controlled)                  |
| `totalItems?`               | `number`          | Total item count (for external pagination) |
| `paginationProps?`          | `PaginationProps` | Pagination customization                   |

### Settings & Customization

| Prop                      | Type                                | Description                |
| ------------------------- | ----------------------------------- | -------------------------- |
| `enableInternalSettings?` | `boolean`                           | Enable settings management |
| `settings?`               | `TableSettings`                     | Controlled settings        |
| `onSettingsChange?`       | `(settings: TableSettings) => void` | Settings change callback   |
| `defaultSettings?`        | `Partial<TableSettings>`            | Default settings           |
| `className?`              | `string`                            | Custom CSS class           |
| `loading?`                | `boolean`                           | External loading state     |

### Core Types

```typescript
type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  visible?: boolean;
  searchable?: boolean;
  searchOverride?: NcTableSearchOverride;
};

type TableAction<T> = {
  label: string;
  icon?: React.ReactNode | string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  className?: string;
  separator?: boolean;
};

type DataHandler<T> = (params: {
  PageNumber: number;
  PageSize: number;
  Filter?: string;
  Order?: string;
}) => Promise<IApiResponse<T[]>>;

interface IApiResponse<T> {
  Succeeded: boolean;
  Data: T;
  Count: number;
  Message?: string;
}

type NcTableSearchDataType = "text" | "date" | "select" | "boolean" | "YesOrNo";

interface NcTableSearchOverride {
  dataType: NcTableSearchDataType;
  selectOptions?: Array<{ text: string; value: unknown }>;
}
```

## 🎨 Styling

The component uses Tailwind CSS utility classes and is designed to work seamlessly in Tailwind projects. It also works without Tailwind, using sensible defaults.

### Custom Styling

```tsx
<NcTable
  className="my-custom-table"
  // ... other props
/>
```

### Responsive Design

The table is fully responsive and adapts to different screen sizes:

- Mobile: Stacked layout with horizontal scrolling
- Tablet: Optimized column widths
- Desktop: Full feature display

## 🌍 Internationalization

The component is i18n ready and uses `react-i18next` for translations:

```tsx
// Add translations to your i18n resources
const resources = {
  en: {
    translation: {
      "Search...": "Search...",
      "No items found": "No items found",
      // ... other translations
    },
  },
};
```

## 🧪 Testing

The package includes comprehensive test coverage. To run tests:

```bash
npm test
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📞 Support

- 📚 **Documentation**: This README
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

---

## 🔗 Repository

- **GitHub**: [NextCounsel/NCTable](https://github.com/NextCounsel/NCTable)
- **npm**: [nc-table-react](https://www.npmjs.com/package/nc-table-react)

**Built with ❤️ for modern React applications**
