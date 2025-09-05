/**
 * BACKEND INTEGRATION EXAMPLE
 *
 * This example shows exactly how to connect nc-table with your backend API
 * using the filter format: ${column}${operator}${value};And$...
 */

import React, { useState } from "react";
import {
  NcTable,
  type Column,
  type NcTableProps,
} from "./src/components/nc-table";

// Your data type
type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  startDate: string;
  isActive: boolean;
  salary: number;
};

// Backend API handler - THIS IS WHAT YOU'LL IMPLEMENT
const backendHandler: NcTableProps<Employee>["handler"] = async (params) => {
  console.log("🚀 Sending to your backend API:", params);

  /*
   * The params object contains:
   * {
   *   PageNumber: 1,
   *   PageSize: 10,
   *   Order?: "name;Asc",
   *   Filter?: "name~=John;And$department==Engineering;And$salary>50000;"
   * }
   */

  try {
    // Replace this URL with your actual backend endpoint
    const response = await fetch("https://your-backend-api.com/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your-auth-token", // If needed
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Received from your backend:", result);

    /*
     * Your backend should return:
     * {
     *   Succeeded: true,
     *   Data: Employee[],      // Array of employees for current page
     *   Count: 156,           // Total number of employees (for pagination)
     *   Message?: string      // Optional success message
     * }
     */

    return result;
  } catch (error) {
    console.error("❌ Backend API Error:", error);

    // Return error response
    return {
      Succeeded: false,
      Data: [],
      Count: 0,
      Message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Column definitions
const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Name",
    searchable: true, // Enable search for this column
  },
  {
    key: "email",
    header: "Email",
    searchable: true,
  },
  {
    key: "department",
    header: "Department",
    searchable: true,
    searchOverride: {
      dataType: "select", // Dropdown search
      selectOptions: [
        { text: "Engineering", value: "Engineering" },
        { text: "Marketing", value: "Marketing" },
        { text: "Sales", value: "Sales" },
        { text: "HR", value: "HR" },
      ],
    },
  },
  {
    key: "startDate",
    header: "Start Date",
    searchable: true,
    searchOverride: {
      dataType: "date", // Date picker search
    },
    render: (emp) => new Date(emp.startDate).toLocaleDateString(),
  },
  {
    key: "isActive",
    header: "Active",
    searchable: true,
    searchOverride: {
      dataType: "boolean", // Yes/No search
    },
    render: (emp) => (emp.isActive ? "Yes" : "No"),
  },
  {
    key: "salary",
    header: "Salary",
    searchable: true, // Numeric search with >, <, >= operators
    render: (emp) => `$${emp.salary.toLocaleString()}`,
  },
];

// Your component using the table
export default function BackendIntegrationExample() {
  const [selectedEmployees, setSelectedEmployees] = useState<
    (string | number)[]
  >([]);

  const handleAdvancedSearch = (filters: any[]) => {
    console.log("🔍 Advanced search applied:", filters);

    // The buildFilterString function automatically generates the backend filter
    // You don't need to do anything here - the handler will be called automatically
  };

  const handleBulkAction = (action: string, ids: (string | number)[]) => {
    console.log(`🔄 Bulk action "${action}" on employee IDs:`, ids);

    // Implement your bulk actions here
    switch (action) {
      case "export":
        // Export selected employees
        break;
      case "activate":
        // Activate selected employees
        break;
      case "deactivate":
        // Deactivate selected employees
        break;
    }
  };

  const handleDelete = async (ids: (string | number)[]) => {
    console.log("🗑️ Delete employees with IDs:", ids);

    // Call your delete API
    try {
      const response = await fetch(
        "https://your-backend-api.com/api/employees/delete",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }
      );

      const result = await response.json();
      return result; // Should return { Succeeded: boolean, Message: string }
    } catch (error) {
      return {
        Succeeded: false,
        Message: error instanceof Error ? error.message : "Delete failed",
      };
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

      <NcTable<Employee>
        // Backend Integration
        handler={backendHandler} // ← Your API handler
        // Table Configuration
        columns={columns}
        idField="id"
        // Search & Filtering
        showAdvancedSearch={true} // Enable advanced search UI
        onAdvancedSearch={handleAdvancedSearch} // Search callback
        searchPlaceholder="Search employees..."
        // Selection & Bulk Actions
        selectable={true}
        selectedIds={selectedEmployees}
        onSelectionChange={setSelectedEmployees}
        bulkActions={[
          { value: "export", label: "Export Selected" },
          { value: "activate", label: "Activate Selected" },
          { value: "deactivate", label: "Deactivate Selected" },
        ]}
        onBulkAction={handleBulkAction}
        // CRUD Operations
        canDelete={true}
        removeItemHandler={handleDelete} // ← Your delete API handler
        // Pagination (handled by backend)
        showPagination={true}
        pageSize={10}
        // Settings
        enableInternalSettings={true}
        defaultSettings={{
          pageSize: 10,
          sortBy: "name",
          sortDirection: "Asc",
        }}
        // Styling
        className="border border-gray-200 rounded-lg"
      />
    </div>
  );
}

/**
 * BACKEND REQUIREMENTS:
 *
 * 1. POST endpoint: /api/employees
 *    - Accepts: { PageNumber, PageSize, Order?, Filter? }
 *    - Returns: { Succeeded, Data, Count, Message? }
 *
 * 2. Filter string format: "column1==value1;And$column2>value2;"
 *    - Single: "name~=John;"
 *    - Multiple: "name~=John;And$department==Engineering;"
 *    - Only included when filters exist
 *
 * 3. Supported operators:
 *    - == (equals)
 *    - != (not equals)
 *    - > (greater than)
 *    - >= (greater than or equal)
 *    - < (less than)
 *    - <= (less than or equal)
 *    - ~= (contains)
 *    - !~= (not contains)
 *    - _= (starts with)
 *    - !_= (not starts with)
 *    - |= (ends with)
 *    - !|= (not ends with)
 *
 * 4. Order format: "columnName;Asc" or "columnName;Desc"
 *
 * 5. DELETE endpoint: /api/employees/delete (optional)
 *    - Accepts: { ids: number[] }
 *    - Returns: { Succeeded, Message }
 */
