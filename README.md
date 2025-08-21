## nc-table

Flexible React table with actions, advanced search, settings, selection, and pagination.

### Install

```bash
npm install nc-table
npm install react-i18next i18next lucide-react
```

Requires React 18+. The component uses `react-i18next` internally.

### Quick start (static data)

```tsx
import React from "react";
import { NcTable, type Column, type TableAction } from "nc-table";
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

### Async/server data (handler)

```tsx
import type { NcTableProps } from "nc-table";

type Item = { id: number; name: string };

const handler: NcTableProps<Item>["handler"] = async (params) => {
  // params: { PageNumber, PageSize, Filter?, Order? }
  const total = 42;
  const start = (params.PageNumber - 1) * params.PageSize;
  const page = Array.from({ length: params.PageSize }, (_, i) => ({
    id: start + i + 1,
    name: `Item ${start + i + 1}`,
  }));
  return { Succeeded: true, Data: page, Count: total, Message: "ok" };
};

// <NcTable<Item> columns={[{ key: 'name', header: 'Name' }]} handler={handler} />
```

### Styling

The UI uses Tailwind-style utility classes and Radix primitives. It works without Tailwind, but looks best in Tailwind projects. You may add global styles to match your design system.

---

### Props

- **data?**: T[] — static data
- **columns**: Column<T>[] — visible columns
- **handler?**: DataHandler<T> — async data function (server mode)
- **actions?**: TableAction<T>[] — row actions menu
- **settings?**: TableSettings — controlled settings
- **onSettingsChange?**: (s: TableSettings) => void
- **onSearch?**: (field: string, query: string) => void
- **onPageChange?**: (page: number) => void
- **onPageSizeChange?**: (size: number) => void
- **totalItems? / currentPage? / pageSize?**: numbers — when controlling pagination externally
- **searchPlaceholder?**: string — default "Search..."
- **emptyStateMessage?**: string
- **selectable?**: boolean — enable row selection
- **onSelectionChange? / selectedIds?**: selection control
- **idField?**: keyof T — identifier field (default `"Id"`)
- **className?**: string
- **loading?**: boolean — external loading flag

State helpers:

- **enableInternalSearch? / enableInternalSettings? / enableInternalPagination?**: boolean
- **defaultSettings?**: Partial<TableSettings>

Toolbar & search:

- **showTableActions?**: boolean
- **bulkActions?**: BulkAction[]; **onBulkAction?**: (action: string, ids: (string|number)[]) => void
- **exportOptions?**: ExportOption[]; **onExport?**: (format: string, ids?: (string|number)[]) => void
- **createAction?**: CreateAction
- **importActions?**: ImportAction[]
- **showAdvancedSearch?**: boolean; **onAdvancedSearch?**: (filters: SearchFilter[]) => void

Pagination:

- **showPagination?**: boolean
- **paginationProps?**: { showFirstLast?, showEllipsis?, maxVisiblePages?, compact?, showingLabel?, ofLabel?, recordsLabel?, recordLabel? }

Deletion:

- **canDelete?**: boolean
- **removeItemHandler?**: (ids: (string|number)[]) => Promise<IApiResponse<unknown>|void> | IApiResponse<unknown> | void

### Core types

```ts
type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  visible?: boolean;
  searchable?: boolean;
};

type TableAction<T> = {
  label: string;
  icon?: React.ReactNode | string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  className?: string;
  separator?: boolean;
};

type TableSettings = {
  columns: Record<string, boolean>;
  pageSize: number;
  sortBy?: string;
  sortDirection?: "Asc" | "Desc";
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
```

All exported types are available from `nc-table`.
