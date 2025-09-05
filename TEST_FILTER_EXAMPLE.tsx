import React, { useEffect } from "react";
import {
  NcTable,
  type Column,
  type TableAction,
} from "./src/components/nc-table";
import { buildFilterString, testFilterStringBuilder } from "./src/components/nc-table/utils/filterUtils";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

// Minimal i18n setup (NcTable uses useTranslation)
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "en",
    resources: { en: { translation: {} } },
    interpolation: { escapeValue: false },
  });
}

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

const mockData: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@company.com",
    department: "Engineering",
    startDate: "2023-01-15",
    isActive: true,
    hasAccess: 1,
    salary: 75000,
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@company.com",
    department: "Marketing",
    startDate: "2022-06-01",
    isActive: false,
    hasAccess: 0,
    salary: 65000,
    status: "inactive",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@company.com",
    department: "Sales",
    startDate: "2023-03-10",
    isActive: true,
    hasAccess: 1,
    salary: 70000,
    status: "pending",
  },
];

const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Name",
    searchable: true,
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
      dataType: "select",
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
      dataType: "date",
    },
    render: (employee) => new Date(employee.startDate).toLocaleDateString(),
  },
  {
    key: "isActive",
    header: "Is Active",
    searchable: true,
    searchOverride: {
      dataType: "boolean",
    },
    render: (employee) => (
      <span className={employee.isActive ? "text-green-600" : "text-red-600"}>
        {employee.isActive ? "Yes" : "No"}
      </span>
    ),
  },
  {
    key: "hasAccess",
    header: "Has Access",
    searchable: true,
    searchOverride: {
      dataType: "YesOrNo",
    },
    render: (employee) => (
      <span
        className={employee.hasAccess === 1 ? "text-green-600" : "text-red-600"}
      >
        {employee.hasAccess === 1 ? "Yes" : "No"}
      </span>
    ),
  },
  {
    key: "salary",
    header: "Salary",
    searchable: true,
    render: (employee) => `$${employee.salary.toLocaleString()}`,
  },
  {
    key: "status",
    header: "Status",
    searchable: true,
    searchOverride: {
      dataType: "select",
      selectOptions: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Pending", value: "pending" },
      ],
    },
    render: (employee) => (
      <span
        className={
          employee.status === "active"
            ? "text-green-600"
            : employee.status === "inactive"
            ? "text-red-600"
            : "text-yellow-600"
        }
      >
        {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
      </span>
    ),
  },
];

const actions: TableAction<Employee>[] = [
  {
    label: "Edit",
    onClick: (employee) => alert(`Editing ${employee.name}`),
  },
  {
    label: "Delete",
    onClick: (employee) => alert(`Deleting ${employee.name}`),
    variant: "destructive",
  },
];

export default function TestFilterExample() {
  useEffect(() => {
    // Test the filter string builder on component mount
    console.log("🧪 Testing Filter String Builder:");
    testFilterStringBuilder();
  }, []);

  const handleAdvancedSearch = (filters: any[]) => {
    console.log("🔍 Advanced search filters received:", filters);
    
    // Generate the filter string using our new function
    const filterString = buildFilterString(filters);
    console.log("🎯 Generated filter string:", filterString);
    
    // Show example backend payload
    const backendPayload = {
      PageNumber: 1,
      PageSize: 10,
      Order: "name;Asc"
    };
    
    if (filterString && filterString.trim() !== '') {
      backendPayload.Filter = filterString;
    }
    
    console.log("📤 Backend payload would be:", JSON.stringify(backendPayload, null, 2));
    
    // Show alert with the filter string for easy viewing
    alert(`Filter String Generated:\n\n${filterString}\n\nCheck console for full details.`);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            🧪 Filter String Test - nc-table
          </h1>
          <p className="text-gray-600 mb-4">
            Test the new filter string format: <code>${"{column}${operator}${value};And$..."}</code>
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Testing Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click the search icon in the table toolbar</li>
              <li>Add multiple search conditions with different data types</li>
              <li>Click "Filter" to apply the search</li>
              <li>Check the console and alert for the generated filter string</li>
            </ol>
          </div>
        </div>

        <NcTable<Employee>
          data={mockData}
          columns={columns}
          actions={actions}
          idField="id"
          showAdvancedSearch={true}
          onAdvancedSearch={handleAdvancedSearch}
          enableInternalSearch={true}
          enableInternalPagination={true}
          enableInternalSettings={true}
          selectable={true}
          searchPlaceholder="Search employees..."
          emptyStateMessage="No employees found"
        />
      </div>
    </I18nextProvider>
  );
}
