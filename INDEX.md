# NC-TABLE - Application Index & Architecture Overview

## 📋 Project Summary

**NC-Table** is a flexible, feature-rich React table component library designed for modern web applications. It provides advanced table functionality including search, filtering, pagination, sorting, bulk actions, and data export capabilities.

**Version:** 0.1.0  
**Type:** React Component Library  
**Build System:** Vite + TypeScript  
**UI Framework:** Radix UI + Tailwind CSS

---

## 🏗️ Architecture Overview

### Core Technologies

- **React 18+** - Component framework
- **TypeScript** - Type safety and development experience
- **Radix UI** - Accessible headless components
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon system
- **React-i18next** - Internationalization
- **Vite** - Build tool and development server

### Library Structure

```
nc-table-r/
├── src/
│   ├── components/
│   │   ├── nc-table/           # Main table component
│   │   │   ├── NcTable.tsx     # Core table component
│   │   │   ├── types.ts        # TypeScript definitions
│   │   │   ├── NcTableConfig.ts # Configuration constants
│   │   │   └── components/     # Sub-components
│   │   │       ├── NcTableActions.tsx    # Toolbar actions
│   │   │       ├── NcTableSearch.tsx     # Advanced search
│   │   │       ├── NcTableSettings.tsx   # Column settings
│   │   │       └── NcTablePagination.tsx # Pagination
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── models/                 # Data models & interfaces
│   └── lib/                    # Utility functions
├── examples/                   # Usage examples
├── dev/                       # Development entry point
└── dist/                      # Built library files
```

---

## 🔧 Core Components

### 1. NcTable (Main Component)

**Location:** `src/components/nc-table/NcTable.tsx`

The primary table component that orchestrates all functionality:

**Key Features:**

- ✅ Static data display
- ✅ Server-side data handling
- ✅ Row selection (single/multiple)
- ✅ Column sorting
- ✅ Advanced search with multiple data types
- ✅ Bulk actions
- ✅ Export functionality
- ✅ Delete confirmation dialogs
- ✅ Loading states with skeleton UI
- ✅ Error handling with retry
- ✅ Responsive design

**Props Interface:** `NcTableProps<T>`

- Supports both controlled and uncontrolled modes
- Extensive customization options
- Type-safe with generics

### 2. NcTableActions

**Location:** `src/components/nc-table/components/NcTableActions.tsx`

Provides the table toolbar with bulk actions, export options, and search controls.

**Features:**

- Bulk action dropdown
- Export functionality (CSV, Excel, PDF)
- Create button with import options
- Advanced search toggle
- Settings panel integration

### 3. NcTableSearch

**Location:** `src/components/nc-table/components/NcTableSearch.tsx`

Advanced search component supporting multiple data types and operators.

**Search Data Types:**

- **Text** - Standard text input with various operators
- **Date** - Date picker with date comparisons
- **Select** - Dropdown with predefined options
- **Boolean** - Yes/No selection (true/false)
- **YesOrNo** - Yes/No selection (1/0 numeric)

**Search Operators:**

- Equals (`==`), Not Equals (`!=`)
- Greater/Less Than (`>`, `<`, `>=`, `<=`)
- Contains (`~=`), Not Contains (`!~=`)
- Starts With (`_=`), Not Starts With (`!_=`)
- Ends With (`|=`), Not Ends With (`!|=`)

### 4. NcTableSettings

**Location:** `src/components/nc-table/components/NcTableSettings.tsx`

Column visibility and table configuration management.

### 5. NcTablePagination

**Location:** `src/components/nc-table/components/NcTablePagination.tsx`

Pagination controls with configurable options.

---

## 📝 Type System

### Core Types

**Location:** `src/components/nc-table/types.ts`

```typescript
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  visible?: boolean;
  searchable?: boolean;
  searchOverride?: NcTableSearchOverride;
}

interface TableAction<T> {
  label: string;
  icon?: ReactNode | string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  className?: string;
  separator?: boolean;
}

type DataHandler<T> = (params: PaginationData) => Promise<IApiResponse<T[]>>;
```

### API Response Interface

**Location:** `src/models/IApiResponse.ts`

```typescript
interface IApiResponse<T> {
  Succeeded: boolean;
  Message: string;
  Data: T;
  Count: number;
  PageNumber?: number;
  PageSize?: number;
  TotalPages?: number;
  // ... additional pagination fields
}
```

---

## 🎯 Usage Patterns

### Static Data Example

```typescript
const columns: Column<User>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
  {
    key: "status",
    header: "Status",
    render: (u) => <StatusBadge status={u.status} />,
  },
];

<NcTable<User>
  data={users}
  columns={columns}
  actions={[{ label: "Edit", onClick: handleEdit }]}
  idField="id"
/>;
```

### Server-side Data Example

```typescript
const handler: DataHandler<User> = async (params) => {
  const response = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.json();
};

<NcTable<User>
  handler={handler}
  columns={columns}
  showAdvancedSearch={true}
  canDelete={true}
  removeItemHandler={handleDelete}
/>;
```

### Advanced Search Configuration

```typescript
const columns: Column<Employee>[] = [
  {
    key: "department",
    header: "Department",
    searchable: true,
    searchOverride: {
      dataType: "select",
      selectOptions: [
        { text: "Engineering", value: "Engineering" },
        { text: "Marketing", value: "Marketing" },
      ],
    },
  },
  {
    key: "startDate",
    header: "Start Date",
    searchable: true,
    searchOverride: { dataType: "date" },
  },
];
```

---

## 🛠️ Development Setup

### Installation

```bash
npm install nc-table
npm install react-i18next i18next lucide-react
```

### Required Peer Dependencies

- React 18+
- React DOM 18+
- Lucide React 0.400.0+
- React-i18next 15+

### Build Configuration

**Location:** `vite.config.ts`

- Library mode with ES modules and CommonJS exports
- External dependencies properly configured
- TypeScript declaration files generated
- Source maps included for debugging

### Development Server

```bash
npm run dev    # Start development server
npm run build  # Build library for production
```

---

## 🎨 Styling & Theming

### CSS Framework

- **Tailwind CSS** utility classes for styling
- **Radix UI** provides accessible base components
- Custom CSS variables for theme customization

### Component Styling

- Responsive design with mobile-first approach
- Dark mode compatible (via Tailwind utilities)
- Customizable via className props
- Consistent spacing and typography

### Key Style Features

- Skeleton loading states
- Hover effects and transitions
- Focus indicators for accessibility
- Error and success state styling

---

## 🔌 Integration Points

### Internationalization

- Uses `react-i18next` for text content
- Supports custom translations
- RTL layout compatible

### Icon System

- Lucide React for consistent iconography
- String-based icon names supported
- Custom icon components accepted

### State Management

- Internal state management for simplicity
- Controlled component pattern support
- External state synchronization hooks

---

## 📊 Key Features Summary

| Feature                  | Status | Description                       |
| ------------------------ | ------ | --------------------------------- |
| **Data Handling**        | ✅     | Static & server-side data support |
| **Search & Filter**      | ✅     | Advanced search with 5 data types |
| **Pagination**           | ✅     | Configurable pagination controls  |
| **Sorting**              | ✅     | Column-based sorting              |
| **Selection**            | ✅     | Single & multi-row selection      |
| **Bulk Actions**         | ✅     | Configurable bulk operations      |
| **Export**               | ✅     | CSV, Excel, PDF export options    |
| **CRUD Operations**      | ✅     | Delete with confirmation dialogs  |
| **Responsive Design**    | ✅     | Mobile-optimized interface        |
| **Accessibility**        | ✅     | ARIA labels & keyboard navigation |
| **TypeScript**           | ✅     | Full type safety                  |
| **Internationalization** | ✅     | i18n ready                        |

---

## 🚀 Production Readiness

### Performance

- Optimized rendering with React best practices
- Lazy loading for large datasets
- Debounced search functionality
- Efficient state updates

### Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Error Handling

- Graceful error states
- Retry mechanisms
- User-friendly error messages
- Loading state management

### Browser Support

- Modern browsers (ES2020+)
- Mobile browsers
- Progressive enhancement

---

## 📚 Documentation

### Available Documentation

- **README.md** - Complete usage guide with examples
- **TypeScript Definitions** - Full type documentation
- **Example Files** - Working demonstrations
- **Inline Comments** - Component-level documentation

### Examples Provided

1. **StaticDataExample.tsx** - Basic static data usage
2. **SearchDataTypesExample.tsx** - Advanced search demonstration

---

This index provides a comprehensive overview of the nc-table library architecture, features, and usage patterns. The library is well-structured, type-safe, and production-ready for modern React applications requiring advanced table functionality.
