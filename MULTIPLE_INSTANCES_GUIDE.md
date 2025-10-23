# 🔄 Multiple Table Instances Guide

This guide shows you how to properly use multiple `NcTable` instances in a single file or script while maintaining uniqueness and avoiding conflicts.

## 🚨 Common Issues with Multiple Instances

### ❌ Problems That Can Occur:

1. **Shared State**: Tables interfering with each other's state
2. **Event Handler Conflicts**: Actions from one table affecting another
3. **Selection Conflicts**: Selecting items in one table affects others
4. **Settings Overlap**: Table settings getting mixed up
5. **Memory Leaks**: Event handlers not being properly cleaned up
6. **Performance Issues**: Unnecessary re-renders across all instances

## ✅ Best Practices for Multiple Instances

### 1. **Unique State Management**

```tsx
// ✅ CORRECT: Separate state for each table
const [usersSelectedIds, setUsersSelectedIds] = useState<(string | number)[]>(
  []
);
const [productsSelectedIds, setProductsSelectedIds] = useState<
  (string | number)[]
>([]);
const [ordersSelectedIds, setOrdersSelectedIds] = useState<(string | number)[]>(
  []
);

// ❌ WRONG: Shared state (causes conflicts)
const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
```

### 2. **Unique Event Handlers**

```tsx
// ✅ CORRECT: Separate handlers for each table
const handleUsersSelectionChange = useCallback(
  (selectedIds: (string | number)[]) => {
    console.log("Users selection changed:", selectedIds);
    setUsersSelectedIds(selectedIds);
  },
  []
);

const handleProductsSelectionChange = useCallback(
  (selectedIds: (string | number)[]) => {
    console.log("Products selection changed:", selectedIds);
    setProductsSelectedIds(selectedIds);
  },
  []
);

// ❌ WRONG: Shared handler (causes conflicts)
const handleSelectionChange = (selectedIds: (string | number)[]) => {
  // Which table is this for? Confusion!
  setSelectedIds(selectedIds);
};
```

### 3. **Unique Settings Objects**

```tsx
// ✅ CORRECT: Separate settings for each table
const [usersSettings, setUsersSettings] = useState({
  pageSize: 5,
  sortBy: "name" as string | undefined,
  sortDirection: "Asc" as "Asc" | "Desc",
  columns: {} as Record<string, boolean>,
});

const [productsSettings, setProductsSettings] = useState({
  pageSize: 3,
  sortBy: "price" as string | undefined,
  sortDirection: "Desc" as "Asc" | "Desc",
  columns: {} as Record<string, boolean>,
});

// ❌ WRONG: Shared settings (causes conflicts)
const [settings, setSettings] = useState({
  pageSize: 10,
  sortBy: "name",
  sortDirection: "Asc",
  columns: {},
});
```

### 4. **Unique Props Configuration**

```tsx
// ✅ CORRECT: Each table has unique props including unique ID
<NcTable<User>
  id="users-table" // ✅ Unique ID for this table instance
  data={usersData}
  columns={userColumns}
  actions={userActions}
  idField="id"
  selectedIds={usersSelectedIds}
  onSelectionChange={handleUsersSelectionChange}
  settings={usersSettings}
  onSettingsChange={setUsersSettings}
  showSerialNumber={true}
  pageSize={5}
  searchPlaceholder="Search users..."
  className="users-table"
/>

<NcTable<Product>
  id="products-table" // ✅ Unique ID for this table instance
  data={productsData}
  columns={productColumns}
  actions={productActions}
  idField="id"
  selectedIds={productsSelectedIds}
  onSelectionChange={handleProductsSelectionChange}
  settings={productsSettings}
  onSettingsChange={setProductsSettings}
  showSerialNumber={false}
  pageSize={3}
  searchPlaceholder="Search products..."
  className="products-table"
/>
```

### 5. **Unique ID and CSS Classes**

```tsx
// ✅ CORRECT: Unique ID and className for maximum isolation
<NcTable
  id="users-table"
  className="users-table"
/>
<NcTable
  id="products-table"
  className="products-table"
/>
<NcTable
  id="orders-table"
  className="orders-table"
/>

// CSS targeting specific instances by ID (more specific)
#users-table .table-header { background-color: blue; }
#products-table .table-header { background-color: green; }
#orders-table .table-header { background-color: purple; }

// Or by class
.users-table .table-header { background-color: blue; }
.products-table .table-header { background-color: green; }
.orders-table .table-header { background-color: purple; }
```

### 6. **Benefits of Using Unique IDs**

The `id` prop provides several advantages:

```tsx
// ✅ DOM Targeting - Direct access to specific table instances
const usersTable = document.getElementById("users-table");
const productsTable = document.getElementById("products-table");

// ✅ Testing - Easy to target specific tables in tests
const { getByTestId } = render(<MyComponent />);
const usersTable = getByTestId("users-table");

// ✅ Analytics - Track specific table interactions
const trackTableAction = (tableId: string, action: string) => {
  analytics.track("table_action", { tableId, action });
};

// ✅ Accessibility - Screen readers can identify specific tables
<NcTable id="users-table" aria-label="Users management table" />;
```

## 🏗️ Advanced Patterns

### 1. **Factory Pattern for Multiple Similar Tables**

```tsx
const createTableConfig = <T,>(
  id: string,
  data: T[],
  columns: Column<T>[],
  actions: TableAction<T>[]
) => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [settings, setSettings] = useState({
    pageSize: 10,
    sortBy: undefined as string | undefined,
    sortDirection: "Asc" as "Asc" | "Desc",
    columns: {} as Record<string, boolean>,
  });

  const handleSelectionChange = useCallback(
    (ids: (string | number)[]) => {
      console.log(`${id} selection changed:`, ids);
      setSelectedIds(ids);
    },
    [id]
  );

  const handleSettingsChange = useCallback(
    (newSettings: TableSettings) => {
      console.log(`${id} settings changed:`, newSettings);
      setSettings(newSettings);
    },
    [id]
  );

  return {
    data,
    columns,
    actions,
    selectedIds,
    onSelectionChange: handleSelectionChange,
    settings,
    onSettingsChange: handleSettingsChange,
    className: `${id}-table`,
  };
};

// Usage
const usersConfig = createTableConfig(
  "users",
  usersData,
  userColumns,
  userActions
);
const productsConfig = createTableConfig(
  "products",
  productsData,
  productColumns,
  productActions
);

return (
  <>
    <NcTable {...usersConfig} showSerialNumber={true} />
    <NcTable {...productsConfig} showSerialNumber={false} />
  </>
);
```

### 2. **Custom Hook Pattern**

```tsx
const useTableInstance = <T,>(
  id: string,
  initialData: T[],
  initialColumns: Column<T>[],
  initialActions: TableAction<T>[]
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [settings, setSettings] = useState<TableSettings>({
    pageSize: 10,
    sortBy: undefined,
    sortDirection: "Asc",
    columns: {},
  });

  const handleSelectionChange = useCallback(
    (ids: (string | number)[]) => {
      console.log(`${id} selection:`, ids);
      setSelectedIds(ids);
    },
    [id]
  );

  const handleBulkAction = useCallback(
    (action: string, ids: (string | number)[]) => {
      console.log(`${id} bulk action ${action}:`, ids);
      // Handle bulk actions
    },
    [id]
  );

  const updateData = useCallback((newData: T[]) => {
    setData(newData);
  }, []);

  return {
    data,
    columns: initialColumns,
    actions: initialActions,
    selectedIds,
    onSelectionChange: handleSelectionChange,
    settings,
    onSettingsChange: setSettings,
    onBulkAction: handleBulkAction,
    updateData,
    className: `${id}-table`,
  };
};

// Usage
const usersTable = useTableInstance(
  "users",
  usersData,
  userColumns,
  userActions
);
const productsTable = useTableInstance(
  "products",
  productsData,
  productColumns,
  productActions
);

return (
  <>
    <NcTable {...usersTable} showSerialNumber={true} />
    <NcTable {...productsTable} showSerialNumber={false} />
  </>
);
```

### 3. **Context Pattern for Shared Configuration**

```tsx
interface TableContextValue {
  theme: "light" | "dark";
  defaultPageSize: number;
  enableSerialNumbers: boolean;
  commonActions: TableAction<any>[];
}

const TableContext = createContext<TableContextValue>({
  theme: "light",
  defaultPageSize: 10,
  enableSerialNumbers: true,
  commonActions: [],
});

const useTableContext = () => useContext(TableContext);

// Each table can access shared config while maintaining unique state
const MyTable = <T,>({ data, columns, ...props }: NcTableProps<T>) => {
  const context = useTableContext();

  // Unique state for this instance
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  return (
    <NcTable
      {...props}
      data={data}
      columns={columns}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      showSerialNumber={context.enableSerialNumbers}
      pageSize={context.defaultPageSize}
      className={`${context.theme}-table`}
    />
  );
};
```

## 🔍 Testing Multiple Instances

### 1. **State Isolation Testing**

```tsx
// Test that each table maintains its own state
const testStateIsolation = () => {
  // Select items in first table
  selectItemsInTable("users-table", [1, 2, 3]);

  // Verify second table selection is not affected
  expect(getSelectedItems("products-table")).toEqual([]);

  // Select items in second table
  selectItemsInTable("products-table", [4, 5]);

  // Verify first table selection is not affected
  expect(getSelectedItems("users-table")).toEqual([1, 2, 3]);
};
```

### 2. **Event Handler Isolation Testing**

```tsx
// Test that actions from one table don't affect others
const testActionIsolation = () => {
  // Perform action in first table
  clickAction("users-table", "delete", 1);

  // Verify only users data is affected
  expect(usersData).not.toContain({ id: 1 });
  expect(productsData).toContain({ id: 1 }); // Should still exist
};
```

### 3. **Performance Testing**

```tsx
// Test that multiple instances don't cause performance issues
const testPerformance = () => {
  const startTime = performance.now();

  // Render 5 tables with 1000 rows each
  render(<MultipleTablesExample />);

  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(1000); // Should render in < 1s
};
```

## 📋 Checklist for Multiple Instances

### ✅ Before Implementation:

- [ ] Each table has unique state variables
- [ ] Each table has unique event handlers
- [ ] Each table has unique settings objects
- [ ] Each table has unique CSS classes
- [ ] Each table has unique props configuration

### ✅ During Development:

- [ ] Test state isolation between tables
- [ ] Test event handler isolation
- [ ] Test settings independence
- [ ] Test performance with multiple instances
- [ ] Test responsive behavior

### ✅ Before Deployment:

- [ ] Verify no memory leaks
- [ ] Test with large datasets
- [ ] Test with different screen sizes
- [ ] Test with different browsers
- [ ] Performance benchmark with multiple instances

## 🚀 Quick Start Template

```tsx
import React, { useState, useCallback } from "react";
import { NcTable, type Column, type TableAction } from "nc-table-react";

const MultipleTablesExample = () => {
  // ✅ 1. Unique state for each table
  const [table1Selected, setTable1Selected] = useState<(string | number)[]>([]);
  const [table2Selected, setTable2Selected] = useState<(string | number)[]>([]);

  // ✅ 2. Unique handlers for each table
  const handleTable1Selection = useCallback((ids) => {
    setTable1Selected(ids);
  }, []);

  const handleTable2Selection = useCallback((ids) => {
    setTable2Selected(ids);
  }, []);

  // ✅ 3. Unique settings for each table
  const [table1Settings, setTable1Settings] = useState({
    pageSize: 10,
    sortBy: undefined,
    sortDirection: "Asc",
    columns: {},
  });

  const [table2Settings, setTable2Settings] = useState({
    pageSize: 5,
    sortBy: "name",
    sortDirection: "Asc",
    columns: {},
  });

  return (
    <div>
      {/* ✅ 4. Unique props for each table including unique IDs */}
      <NcTable
        id="table-1" // ✅ Unique ID for this table instance
        data={table1Data}
        columns={table1Columns}
        actions={table1Actions}
        idField="id"
        selectedIds={table1Selected}
        onSelectionChange={handleTable1Selection}
        settings={table1Settings}
        onSettingsChange={setTable1Settings}
        className="table-1"
        showSerialNumber={true}
      />

      <NcTable
        id="table-2" // ✅ Unique ID for this table instance
        data={table2Data}
        columns={table2Columns}
        actions={table2Actions}
        idField="id"
        selectedIds={table2Selected}
        onSelectionChange={handleTable2Selection}
        settings={table2Settings}
        onSettingsChange={setTable2Settings}
        className="table-2"
        showSerialNumber={false}
      />
    </div>
  );
};
```

## 🎯 Key Takeaways

1. **Always use unique state** for each table instance
2. **Create separate event handlers** for each table
3. **Maintain separate settings** for each table
4. **Use unique IDs** for each table instance (new in v0.3.6)
5. **Use unique CSS classes** for styling isolation
6. **Test state isolation** thoroughly
7. **Consider performance** with multiple instances
8. **Use patterns like factory functions** for similar tables
9. **Leverage custom hooks** for reusable table logic

Following these practices ensures that your multiple table instances work independently without conflicts! 🚀
