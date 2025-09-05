import React from "react";
import {
  NcTable,
  type Column,
  type TableAction,
} from "../src/components/nc-table";
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
  hasAccess: number; // 1 for yes, 0 for no
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
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@company.com",
    department: "Engineering",
    startDate: "2021-11-20",
    isActive: true,
    hasAccess: 0,
    salary: 80000,
    status: "active",
  },
];

const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Name",
    searchable: true,
    // Default dataType is "text"
  },
  {
    key: "email",
    header: "Email",
    searchable: true,
    // Default dataType is "text"
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
    // Default dataType is "text" for numeric input
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

export default function SearchDataTypesExample() {
  const handleAdvancedSearch = (filters: any[]) => {
    console.log("Advanced search filters:", filters);
    // Here you would typically filter your data based on the search filters
    // For demo purposes, we're just logging the filters
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            NcTable Search Data Types Example
          </h1>
          <p className="text-gray-600 mb-4">
            This example demonstrates all supported search data types:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
            <li>
              <strong>Text:</strong> Name, Email, Salary (default type)
            </li>
            <li>
              <strong>Select:</strong> Department, Status (with custom options)
            </li>
            <li>
              <strong>Date:</strong> Start Date (date picker)
            </li>
            <li>
              <strong>Boolean:</strong> Is Active (Yes/No with true/false
              values)
            </li>
            <li>
              <strong>YesOrNo:</strong> Has Access (Yes/No with 1/0 values)
            </li>
          </ul>
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
