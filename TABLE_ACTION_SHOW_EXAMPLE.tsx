import React from "react";
import { NcTable } from "./src/components/nc-table";

// Example data
const sampleData = [
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
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Manager",
    status: "active",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "User",
    status: "pending",
  },
];

// Column definitions
const columns = [
  {
    key: "name",
    header: "Name",
    width: "200px",
  },
  {
    key: "email",
    header: "Email",
    width: "250px",
  },
  {
    key: "role",
    header: "Role",
    width: "150px",
  },
  {
    key: "status",
    header: "Status",
    width: "120px",
  },
];

// Example actions with show property
const actions = [
  {
    label: "Edit",
    icon: "Edit",
    onClick: (item: any) => console.log("Edit", item),
    show: true, // Always show
  },
  {
    label: "Activate",
    icon: "User",
    onClick: (item: any) => console.log("Activate", item),
    show: (item: any) => item.status === "inactive", // Only show for inactive users
  },
  {
    label: "Deactivate",
    icon: "User",
    onClick: (item: any) => console.log("Deactivate", item),
    show: (item: any) => item.status === "active", // Only show for active users
  },
  {
    label: "Delete",
    icon: "Trash",
    onClick: (item: any) => console.log("Delete", item),
    variant: "destructive" as const,
    separator: true,
    show: (item: any) => item.role !== "Admin", // Don't show delete for admins
  },
  {
    label: "Admin Actions",
    icon: "Settings",
    onClick: (item: any) => console.log("Admin Actions", item),
    show: (item: any) => item.role === "Admin", // Only show for admins
  },
];

export const TableActionShowExample = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-xl font-bold mb-4">
          Table Actions with Conditional Visibility
        </h2>
        <p className="text-gray-600 mb-4">
          Actions are shown/hidden based on the{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">show</code> property.
          The <code className="bg-gray-100 px-2 py-1 rounded">show</code>{" "}
          property can be:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>
            <code className="bg-gray-100 px-1 py-0.5 rounded">true</code> -
            Always show the action
          </li>
          <li>
            <code className="bg-gray-100 px-1 py-0.5 rounded">false</code> -
            Never show the action
          </li>
          <li>
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              (item) =&gt; boolean
            </code>{" "}
            - Show based on item data
          </li>
        </ul>
        <p className="text-gray-600 mb-4">In this example:</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>
            <strong>Edit</strong> - Always shown (show: true)
          </li>
          <li>
            <strong>Activate</strong> - Only shown for inactive users
          </li>
          <li>
            <strong>Deactivate</strong> - Only shown for active users
          </li>
          <li>
            <strong>Delete</strong> - Hidden for Admin users
          </li>
          <li>
            <strong>Admin Actions</strong> - Only shown for Admin users
          </li>
        </ul>
        <NcTable
          data={sampleData}
          columns={columns}
          actions={actions}
          idField="id"
          showSerialNumber={true}
          pageSize={5}
          showPagination={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Table without Actions (showSerialNumber: false)
        </h2>
        <p className="text-gray-600 mb-4">
          Same table but with serial numbers hidden.
        </p>
        <NcTable
          data={sampleData}
          columns={columns}
          idField="id"
          showSerialNumber={false}
          pageSize={5}
          showPagination={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Table with All Actions Hidden
        </h2>
        <p className="text-gray-600 mb-4">
          Example with actions that are all conditionally hidden.
        </p>
        <NcTable
          data={sampleData}
          columns={columns}
          actions={[
            {
              label: "Hidden Action",
              icon: "Settings",
              onClick: (item: any) => console.log("Hidden", item),
              show: false, // Never show
            },
          ]}
          idField="id"
          showSerialNumber={true}
          pageSize={5}
          showPagination={true}
        />
      </div>
    </div>
  );
};

export default TableActionShowExample;
































