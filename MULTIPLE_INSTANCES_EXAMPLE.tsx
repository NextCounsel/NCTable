import React, { useState, useCallback } from "react";
import {
  NcTable,
  type Column,
  type TableAction,
} from "./src/components/nc-table";

// Sample data types
type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Manager";
  status: "active" | "inactive" | "pending";
  department: string;
  lastLogin: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "available" | "out_of_stock" | "discontinued";
};

type Order = {
  id: number;
  customerName: string;
  productName: string;
  amount: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
};

// Sample data
const usersData: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    department: "Engineering",
    lastLogin: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "inactive",
    department: "Marketing",
    lastLogin: "2024-01-10",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Manager",
    status: "active",
    department: "Sales",
    lastLogin: "2024-01-14",
  },
];

const productsData: Product[] = [
  {
    id: 1,
    name: "Laptop Pro",
    category: "Electronics",
    price: 1299.99,
    stock: 50,
    status: "available",
  },
  {
    id: 2,
    name: "Wireless Mouse",
    category: "Accessories",
    price: 29.99,
    stock: 0,
    status: "out_of_stock",
  },
  {
    id: 3,
    name: "Old Keyboard",
    category: "Accessories",
    price: 19.99,
    stock: 10,
    status: "discontinued",
  },
];

const ordersData: Order[] = [
  {
    id: 1,
    customerName: "Alice Brown",
    productName: "Laptop Pro",
    amount: 1299.99,
    status: "pending",
    orderDate: "2024-01-15",
  },
  {
    id: 2,
    customerName: "Charlie Wilson",
    productName: "Wireless Mouse",
    amount: 29.99,
    status: "shipped",
    orderDate: "2024-01-14",
  },
  {
    id: 3,
    customerName: "Diana Prince",
    productName: "Old Keyboard",
    amount: 19.99,
    status: "delivered",
    orderDate: "2024-01-13",
  },
];

// Column definitions
const userColumns: Column<User>[] = [
  { key: "name", header: "Name", width: "150px" },
  { key: "email", header: "Email", width: "200px" },
  { key: "role", header: "Role", width: "100px" },
  { key: "status", header: "Status", width: "100px" },
  { key: "department", header: "Department", width: "120px" },
  { key: "lastLogin", header: "Last Login", width: "120px" },
];

const productColumns: Column<Product>[] = [
  { key: "name", header: "Product Name", width: "150px" },
  { key: "category", header: "Category", width: "120px" },
  {
    key: "price",
    header: "Price",
    width: "100px",
    render: (item) => `$${item.price}`,
  },
  { key: "stock", header: "Stock", width: "80px" },
  { key: "status", header: "Status", width: "120px" },
];

const orderColumns: Column<Order>[] = [
  { key: "customerName", header: "Customer", width: "150px" },
  { key: "productName", header: "Product", width: "150px" },
  {
    key: "amount",
    header: "Amount",
    width: "100px",
    render: (item) => `$${item.amount}`,
  },
  { key: "status", header: "Status", width: "100px" },
  { key: "orderDate", header: "Order Date", width: "120px" },
];

// Action definitions
const userActions: TableAction<User>[] = [
  {
    label: "Edit",
    icon: "Edit",
    onClick: (user) => console.log("Edit user:", user),
    show: true,
  },
  {
    label: "Activate",
    icon: "User",
    onClick: (user) => console.log("Activate user:", user),
    show: (user) => user.status === "inactive",
  },
  {
    label: "Deactivate",
    icon: "User",
    onClick: (user) => console.log("Deactivate user:", user),
    show: (user) => user.status === "active",
  },
  {
    label: "Delete",
    icon: "Trash",
    onClick: (user) => console.log("Delete user:", user),
    variant: "destructive",
    show: (user) => user.role !== "Admin",
  },
];

const productActions: TableAction<Product>[] = [
  {
    label: "Edit",
    icon: "Edit",
    onClick: (product) => console.log("Edit product:", product),
    show: true,
  },
  {
    label: "Restock",
    icon: "Plus",
    onClick: (product) => console.log("Restock product:", product),
    show: (product) => product.stock === 0,
  },
  {
    label: "Discontinue",
    icon: "X",
    onClick: (product) => console.log("Discontinue product:", product),
    variant: "destructive",
    show: (product) => product.status === "available",
  },
];

const orderActions: TableAction<Order>[] = [
  {
    label: "View Details",
    icon: "Eye",
    onClick: (order) => console.log("View order:", order),
    show: true,
  },
  {
    label: "Ship Order",
    icon: "Truck",
    onClick: (order) => console.log("Ship order:", order),
    show: (order) => order.status === "pending",
  },
  {
    label: "Mark Delivered",
    icon: "Check",
    onClick: (order) => console.log("Mark delivered:", order),
    show: (order) => order.status === "shipped",
  },
  {
    label: "Cancel Order",
    icon: "X",
    onClick: (order) => console.log("Cancel order:", order),
    variant: "destructive",
    show: (order) => order.status === "pending",
  },
];

export const MultipleInstancesExample = () => {
  // ✅ BEST PRACTICE 1: Unique state for each table instance
  const [usersSelectedIds, setUsersSelectedIds] = useState<(string | number)[]>(
    []
  );
  const [productsSelectedIds, setProductsSelectedIds] = useState<
    (string | number)[]
  >([]);
  const [ordersSelectedIds, setOrdersSelectedIds] = useState<
    (string | number)[]
  >([]);

  // ✅ BEST PRACTICE 2: Unique handlers for each table instance
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

  const handleOrdersSelectionChange = useCallback(
    (selectedIds: (string | number)[]) => {
      console.log("Orders selection changed:", selectedIds);
      setOrdersSelectedIds(selectedIds);
    },
    []
  );

  // ✅ BEST PRACTICE 3: Unique bulk action handlers
  const handleUsersBulkAction = useCallback(
    (action: string, selectedIds: (string | number)[]) => {
      console.log(`Users bulk action: ${action}`, selectedIds);
      // Handle users bulk actions
    },
    []
  );

  const handleProductsBulkAction = useCallback(
    (action: string, selectedIds: (string | number)[]) => {
      console.log(`Products bulk action: ${action}`, selectedIds);
      // Handle products bulk actions
    },
    []
  );

  const handleOrdersBulkAction = useCallback(
    (action: string, selectedIds: (string | number)[]) => {
      console.log(`Orders bulk action: ${action}`, selectedIds);
      // Handle orders bulk actions
    },
    []
  );

  // ✅ BEST PRACTICE 4: Unique search handlers
  const handleUsersSearch = useCallback((field: string, query: string) => {
    console.log("Users search:", field, query);
    // Handle users search
  }, []);

  const handleProductsSearch = useCallback((field: string, query: string) => {
    console.log("Products search:", field, query);
    // Handle products search
  }, []);

  const handleOrdersSearch = useCallback((field: string, query: string) => {
    console.log("Orders search:", field, query);
    // Handle orders search
  }, []);

  // ✅ BEST PRACTICE 5: Unique settings for each table
  const [usersSettings, setUsersSettings] = useState({
    pageSize: 5,
    sortBy: "name" as string | undefined,
    sortDirection: "Asc" as "Asc" | "Desc",
    columns: {} as Record<string, boolean>,
  });

  const [productsSettings, setProductsSettings] = useState({
    pageSize: 3,
    sortBy: "name" as string | undefined,
    sortDirection: "Asc" as "Asc" | "Desc",
    columns: {} as Record<string, boolean>,
  });

  const [ordersSettings, setOrdersSettings] = useState({
    pageSize: 4,
    sortBy: "orderDate" as string | undefined,
    sortDirection: "Desc" as "Asc" | "Desc",
    columns: {} as Record<string, boolean>,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Multiple Table Instances
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Proper Isolation and State Management
          </p>
          <p className="text-gray-500">
            Each table maintains its own state, settings, and event handlers
          </p>
        </div>

        {/* ✅ Users Table - Instance 1 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Users Management
            </h2>
            <div className="text-sm text-gray-500">
              Selected: {usersSelectedIds.length} users
            </div>
          </div>
          <NcTable<User>
            // ✅ Unique props for this instance
            id="users-table"
            data={usersData}
            columns={userColumns}
            actions={userActions}
            idField="id"
            // ✅ Unique state management
            selectedIds={usersSelectedIds}
            onSelectionChange={handleUsersSelectionChange}
            settings={usersSettings}
            onSettingsChange={setUsersSettings}
            onSearch={handleUsersSearch}
            onBulkAction={handleUsersBulkAction}
            // ✅ Unique configuration
            showSerialNumber={true}
            pageSize={usersSettings.pageSize}
            searchPlaceholder="Search users..."
            emptyStateMessage="No users found"
            bulkActions={[
              { value: "export", label: "Export Selected Users" },
              { value: "activate", label: "Activate Selected" },
              { value: "deactivate", label: "Deactivate Selected" },
            ]}
            // ✅ Unique styling
            className="users-table"
            canDelete={true}
            removeItemHandler={async (ids) => {
              console.log("Delete users:", ids);
              return { Succeeded: true, Message: "Users deleted successfully" };
            }}
          />
        </div>

        {/* ✅ Products Table - Instance 2 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Products Inventory
            </h2>
            <div className="text-sm text-gray-500">
              Selected: {productsSelectedIds.length} products
            </div>
          </div>
          <NcTable<Product>
            // ✅ Unique props for this instance
            id="products-table"
            data={productsData}
            columns={productColumns}
            actions={productActions}
            idField="id"
            // ✅ Unique state management
            selectedIds={productsSelectedIds}
            onSelectionChange={handleProductsSelectionChange}
            settings={productsSettings}
            onSettingsChange={setProductsSettings}
            onSearch={handleProductsSearch}
            onBulkAction={handleProductsBulkAction}
            // ✅ Unique configuration
            showSerialNumber={false} // Different from users table
            pageSize={productsSettings.pageSize}
            searchPlaceholder="Search products..."
            emptyStateMessage="No products found"
            bulkActions={[
              { value: "export", label: "Export Selected Products" },
              { value: "restock", label: "Restock Selected" },
              { value: "discontinue", label: "Discontinue Selected" },
            ]}
            // ✅ Unique styling
            className="products-table"
            canDelete={true}
            removeItemHandler={async (ids) => {
              console.log("Delete products:", ids);
              return {
                Succeeded: true,
                Message: "Products deleted successfully",
              };
            }}
          />
        </div>

        {/* ✅ Orders Table - Instance 3 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Orders Tracking
            </h2>
            <div className="text-sm text-gray-500">
              Selected: {ordersSelectedIds.length} orders
            </div>
          </div>
          <NcTable<Order>
            // ✅ Unique props for this instance
            id="orders-table"
            data={ordersData}
            columns={orderColumns}
            actions={orderActions}
            idField="id"
            // ✅ Unique state management
            selectedIds={ordersSelectedIds}
            onSelectionChange={handleOrdersSelectionChange}
            settings={ordersSettings}
            onSettingsChange={setOrdersSettings}
            onSearch={handleOrdersSearch}
            onBulkAction={handleOrdersBulkAction}
            // ✅ Unique configuration
            showSerialNumber={true}
            pageSize={ordersSettings.pageSize}
            searchPlaceholder="Search orders..."
            emptyStateMessage="No orders found"
            bulkActions={[
              { value: "export", label: "Export Selected Orders" },
              { value: "ship", label: "Ship Selected" },
              { value: "cancel", label: "Cancel Selected" },
            ]}
            // ✅ Unique styling
            className="orders-table"
            canDelete={false} // Orders cannot be deleted
          />
        </div>

        {/* ✅ State Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current State Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Users Table</h4>
              <p className="text-sm text-blue-700">
                Selected: {usersSelectedIds.length} | Page Size:{" "}
                {usersSettings.pageSize} | Sort: {usersSettings.sortBy} (
                {usersSettings.sortDirection})
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Products Table</h4>
              <p className="text-sm text-green-700">
                Selected: {productsSelectedIds.length} | Page Size:{" "}
                {productsSettings.pageSize} | Sort: {productsSettings.sortBy} (
                {productsSettings.sortDirection})
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900">Orders Table</h4>
              <p className="text-sm text-purple-700">
                Selected: {ordersSelectedIds.length} | Page Size:{" "}
                {ordersSettings.pageSize} | Sort: {ordersSettings.sortBy} (
                {ordersSettings.sortDirection})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleInstancesExample;
