import React from "react";
import { NcTable } from "./src/components/nc-table";

// Example data
const sampleData = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Manager" },
  { id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "User" },
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
];

export const SerialNumberExample = () => {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-xl font-bold mb-4">
          Table with Serial Numbers (Default)
        </h2>
        <p className="text-gray-600 mb-4">
          By default, showSerialNumber is true, so serial numbers are displayed.
        </p>
        <NcTable
          data={sampleData}
          columns={columns}
          idField="id"
          showSerialNumber={true}
          pageSize={3}
          showPagination={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Table without Serial Numbers</h2>
        <p className="text-gray-600 mb-4">
          Set showSerialNumber to false to hide the serial number column.
        </p>
        <NcTable
          data={sampleData}
          columns={columns}
          idField="id"
          showSerialNumber={false}
          pageSize={3}
          showPagination={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Table with Custom Page Size</h2>
        <p className="text-gray-600 mb-4">
          Serial numbers are calculated based on current page and position:
          (page - 1) × pageSize + index + 1
        </p>
        <NcTable
          data={sampleData}
          columns={columns}
          idField="id"
          showSerialNumber={true}
          pageSize={2}
          showPagination={true}
        />
      </div>
    </div>
  );
};

export default SerialNumberExample;
