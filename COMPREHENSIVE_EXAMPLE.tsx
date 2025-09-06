/**
 * NC-TABLE INTERACTIVE DEMO
 *
 * 🎯 Live demonstration of the nc-table React component package
 *
 * Features showcased:
 * ✅ Advanced Search (5 data types, 12 operators)
 * ✅ Filter String Generation (${column}${operator}${value};And$...)
 * ✅ Row Selection & Bulk Actions
 * ✅ Export Options (CSV, Excel, PDF, JSON)
 * ✅ CRUD Operations with Confirmation
 * ✅ Server-side & Static Data Modes
 * ✅ Responsive Design & Custom Styling
 * ✅ TypeScript Support
 *
 * 🔗 GitHub: https://github.com/NextCounsel/NCTable.git
 * 📦 npm: npm install nc-table-react
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  NcTable,
  type Column,
  type TableAction,
  type BulkAction,
  type ExportOption,
  type CreateAction,
  type ImportAction,
  type SearchFilter,
} from "./src/components/nc-table";
import { buildFilterString } from "./src/components/nc-table/utils/filterUtils";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

// Enhanced i18n setup with custom translations
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "en",
    resources: {
      en: {
        translation: {
          "Search...": "Search employees...",
          "No items found": "No employees found in the system",
          "Loading...": "Loading employee data...",
        },
      },
    },
    interpolation: { escapeValue: false },
  });
}

// Complete Employee type with all possible data types
type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  hasAccess: number; // 1 or 0
  salary: number;
  performanceRating: number; // 1-5
  skills: string[];
  status: "active" | "inactive" | "pending" | "terminated";
  manager?: string;
  location: string;
  workType: "remote" | "hybrid" | "office";
  contractType: "full-time" | "part-time" | "contract" | "intern";
  lastLogin?: string;
  notes?: string;
};

// Mock data with comprehensive examples
const mockEmployees: Employee[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1-555-0101",
    department: "Engineering",
    position: "Senior Software Engineer",
    startDate: "2022-01-15",
    isActive: true,
    hasAccess: 1,
    salary: 95000,
    performanceRating: 5,
    skills: ["React", "TypeScript", "Node.js"],
    status: "active",
    manager: "Jane Smith",
    location: "New York",
    workType: "hybrid",
    contractType: "full-time",
    lastLogin: "2024-01-15T09:30:00Z",
    notes: "Excellent team player and technical leader",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@company.com",
    phone: "+1-555-0102",
    department: "Engineering",
    position: "Engineering Manager",
    startDate: "2021-03-01",
    isActive: true,
    hasAccess: 1,
    salary: 120000,
    performanceRating: 5,
    skills: ["Leadership", "React", "System Design"],
    status: "active",
    location: "San Francisco",
    workType: "office",
    contractType: "full-time",
    lastLogin: "2024-01-15T08:15:00Z",
    notes: "Outstanding leadership and technical vision",
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@company.com",
    phone: "+1-555-0103",
    department: "Marketing",
    position: "Marketing Specialist",
    startDate: "2023-06-01",
    isActive: false,
    hasAccess: 0,
    salary: 55000,
    performanceRating: 3,
    skills: ["SEO", "Content Marketing", "Analytics"],
    status: "inactive",
    manager: "Sarah Wilson",
    location: "Chicago",
    workType: "remote",
    contractType: "full-time",
    lastLogin: "2024-01-10T14:20:00Z",
    notes: "On temporary leave",
  },
  {
    id: 4,
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@company.com",
    phone: "+1-555-0104",
    department: "Marketing",
    position: "Marketing Director",
    startDate: "2020-08-15",
    isActive: true,
    hasAccess: 1,
    salary: 85000,
    performanceRating: 4,
    skills: ["Strategy", "Team Management", "Digital Marketing"],
    status: "active",
    location: "Austin",
    workType: "hybrid",
    contractType: "full-time",
    lastLogin: "2024-01-15T10:45:00Z",
    notes: "Driving major marketing initiatives",
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@company.com",
    phone: "+1-555-0105",
    department: "Sales",
    position: "Sales Representative",
    startDate: "2023-09-01",
    isActive: true,
    hasAccess: 1,
    salary: 60000,
    performanceRating: 4,
    skills: ["CRM", "Negotiation", "Customer Relations"],
    status: "pending",
    manager: "Lisa Garcia",
    location: "Miami",
    workType: "remote",
    contractType: "full-time",
    lastLogin: "2024-01-14T16:30:00Z",
    notes: "New hire in onboarding process",
  },
  {
    id: 6,
    firstName: "Lisa",
    lastName: "Garcia",
    email: "lisa.garcia@company.com",
    phone: "+1-555-0106",
    department: "Sales",
    position: "Sales Manager",
    startDate: "2019-11-20",
    isActive: true,
    hasAccess: 1,
    salary: 75000,
    performanceRating: 5,
    skills: ["Team Leadership", "Sales Strategy", "Client Management"],
    status: "active",
    location: "Los Angeles",
    workType: "office",
    contractType: "full-time",
    lastLogin: "2024-01-15T11:00:00Z",
    notes: "Top performer, exceeded targets consistently",
  },
  {
    id: 7,
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@company.com",
    phone: "+1-555-0107",
    department: "HR",
    position: "HR Coordinator",
    startDate: "2022-05-10",
    endDate: "2024-01-01",
    isActive: false,
    hasAccess: 0,
    salary: 50000,
    performanceRating: 3,
    skills: ["Recruitment", "Employee Relations", "Policy Development"],
    status: "terminated",
    manager: "Emily Davis",
    location: "Seattle",
    workType: "office",
    contractType: "full-time",
    lastLogin: "2023-12-30T17:00:00Z",
    notes: "Contract completed successfully",
  },
  {
    id: 8,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@company.com",
    phone: "+1-555-0108",
    department: "HR",
    position: "HR Manager",
    startDate: "2018-04-02",
    isActive: true,
    hasAccess: 1,
    salary: 70000,
    performanceRating: 4,
    skills: ["HR Strategy", "Compliance", "Employee Development"],
    status: "active",
    location: "Boston",
    workType: "hybrid",
    contractType: "full-time",
    lastLogin: "2024-01-15T09:00:00Z",
    notes: "Leading HR transformation initiatives",
  },
];

// Comprehensive column definitions showcasing all features
const columns: Column<Employee>[] = [
  {
    key: "firstName",
    header: "First Name",
    width: "150px",
    searchable: true,
    render: (emp) => (
      <div className="font-medium text-gray-900">{emp.firstName}</div>
    ),
  },
  {
    key: "lastName",
    header: "Last Name",
    width: "150px",
    searchable: true,
    render: (emp) => (
      <div className="font-medium text-gray-900">{emp.lastName}</div>
    ),
  },
  {
    key: "email",
    header: "Email",
    width: "250px",
    searchable: true,
    render: (emp) => (
      <a
        href={`mailto:${emp.email}`}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {emp.email}
      </a>
    ),
  },
  {
    key: "department",
    header: "Department",
    width: "150px",
    searchable: true,
    searchOverride: {
      key: "DeptId", // 🎯 Backend uses department IDs, not names
      dataType: "select",
      selectOptions: [
        { text: "Engineering", value: "ENG" },
        { text: "Marketing", value: "MKT" },
        { text: "Sales", value: "SALES" },
        { text: "HR", value: "HR" },
        { text: "Finance", value: "FIN" },
        { text: "Operations", value: "OPS" },
      ],
    },
    render: (emp) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          emp.department === "Engineering"
            ? "bg-blue-100 text-blue-800"
            : emp.department === "Marketing"
            ? "bg-green-100 text-green-800"
            : emp.department === "Sales"
            ? "bg-yellow-100 text-yellow-800"
            : emp.department === "HR"
            ? "bg-purple-100 text-purple-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {emp.department}
      </span>
    ),
  },
  {
    key: "position",
    header: "Position",
    width: "200px",
    searchable: true,
    render: (emp) => (
      <div className="text-sm text-gray-600">{emp.position}</div>
    ),
  },
  {
    key: "startDate",
    header: "Start Date",
    width: "120px",
    searchable: true,
    searchOverride: {
      dataType: "date",
    },
    render: (emp) => (
      <div className="text-sm">
        {new Date(emp.startDate).toLocaleDateString()}
      </div>
    ),
  },
  {
    key: "isActive",
    header: "Active",
    width: "100px",
    searchable: true,
    searchOverride: {
      dataType: "boolean",
    },
    render: (emp) => (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          emp.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {emp.isActive ? "Yes" : "No"}
      </span>
    ),
  },
  {
    key: "hasAccess",
    header: "System Access",
    width: "120px",
    searchable: true,
    searchOverride: {
      dataType: "YesOrNo",
    },
    render: (emp) => (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          emp.hasAccess === 1
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {emp.hasAccess === 1 ? "Yes" : "No"}
      </span>
    ),
  },
  {
    key: "salary",
    header: "Salary",
    width: "120px",
    searchable: true,
    render: (emp) => (
      <div className="font-medium text-green-600">
        ${emp.salary.toLocaleString()}
      </div>
    ),
  },
  {
    key: "performanceRating",
    header: "Rating",
    width: "100px",
    searchable: true,
    searchOverride: {
      dataType: "select",
      selectOptions: [
        { text: "⭐ (1)", value: "1" },
        { text: "⭐⭐ (2)", value: "2" },
        { text: "⭐⭐⭐ (3)", value: "3" },
        { text: "⭐⭐⭐⭐ (4)", value: "4" },
        { text: "⭐⭐⭐⭐⭐ (5)", value: "5" },
      ],
    },
    render: (emp) => (
      <div className="flex items-center">
        <span className="text-yellow-400">
          {"⭐".repeat(emp.performanceRating)}
        </span>
        <span className="ml-1 text-sm text-gray-500">
          ({emp.performanceRating})
        </span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "120px",
    searchable: true,
    searchOverride: {
      dataType: "select",
      selectOptions: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Pending", value: "pending" },
        { text: "Terminated", value: "terminated" },
      ],
    },
    render: (emp) => (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          emp.status === "active"
            ? "bg-green-100 text-green-800"
            : emp.status === "inactive"
            ? "bg-yellow-100 text-yellow-800"
            : emp.status === "pending"
            ? "bg-blue-100 text-blue-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
      </span>
    ),
  },
  {
    key: "workType",
    header: "Work Type",
    width: "120px",
    searchable: true,
    searchOverride: {
      dataType: "select",
      selectOptions: [
        { text: "Remote", value: "remote" },
        { text: "Hybrid", value: "hybrid" },
        { text: "Office", value: "office" },
      ],
    },
    render: (emp) => (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          emp.workType === "remote"
            ? "bg-purple-100 text-purple-800"
            : emp.workType === "hybrid"
            ? "bg-indigo-100 text-indigo-800"
            : "bg-orange-100 text-orange-800"
        }`}
      >
        {emp.workType.charAt(0).toUpperCase() + emp.workType.slice(1)}
      </span>
    ),
  },
  {
    key: "location",
    header: "Location",
    width: "150px",
    searchable: true,
    render: (emp) => (
      <div className="text-sm text-gray-600">📍 {emp.location}</div>
    ),
  },
];

// Comprehensive actions demonstrating different types
const actions: TableAction<Employee>[] = [
  {
    label: "View Profile",
    icon: "eye",
    onClick: (emp) => {
      alert(
        `Viewing profile for ${emp.firstName} ${emp.lastName}\n\nDepartment: ${emp.department}\nPosition: ${emp.position}\nEmail: ${emp.email}`
      );
    },
  },
  {
    label: "Edit Employee",
    icon: "edit",
    onClick: (emp) => {
      alert(
        `Edit functionality for ${emp.firstName} ${emp.lastName}\n\nThis would open an edit form.`
      );
    },
  },
  {
    label: "Send Email",
    icon: "mail",
    onClick: (emp) => {
      window.open(
        `mailto:${emp.email}?subject=Hello ${emp.firstName}&body=Hi ${emp.firstName},%0D%0A%0D%0A`
      );
    },
  },
  {
    separator: true,
    label: "Deactivate",
    icon: "userX",
    onClick: (emp) => {
      alert(
        `Deactivate ${emp.firstName} ${emp.lastName}?\n\nThis would disable their account.`
      );
    },
    variant: "destructive",
  },
  {
    label: "Delete Employee",
    icon: "trash",
    onClick: (emp) => {
      alert(
        `Delete ${emp.firstName} ${emp.lastName}?\n\nThis would permanently remove them from the system.`
      );
    },
    variant: "destructive",
  },
];

// Bulk actions for selected employees
const bulkActions: BulkAction[] = [
  {
    value: "export",
    label: "Export Selected",
    icon: <span>📄</span>,
  },
  {
    value: "email",
    label: "Send Bulk Email",
    icon: <span>✉️</span>,
  },
  {
    value: "activate",
    label: "Activate All",
    icon: <span>✅</span>,
  },
  {
    value: "deactivate",
    label: "Deactivate All",
    icon: <span>⏸️</span>,
  },
  {
    value: "delete",
    label: "Delete Selected",
    icon: <span>🗑️</span>,
    variant: "destructive",
  },
];

// Export options
const exportOptions: ExportOption[] = [
  {
    format: "csv",
    label: "Export as CSV",
    icon: <span>📊</span>,
  },
  {
    format: "excel",
    label: "Export as Excel",
    icon: <span>📈</span>,
  },
  {
    format: "pdf",
    label: "Export as PDF",
    icon: <span>📄</span>,
  },
  {
    format: "json",
    label: "Export as JSON",
    icon: <span>⚡</span>,
  },
];

// Create/Import actions
const createAction: CreateAction = {
  label: "Add Employee",
  icon: <span>👤➕</span>,
  onClick: () => {
    alert(
      "Create new employee\n\nThis would open a form to add a new employee to the system."
    );
  },
};

const importActions: ImportAction[] = [
  {
    label: "Import CSV",
    icon: <span>📥</span>,
    onClick: () => {
      alert(
        "Import employees from CSV\n\nThis would open a file dialog to upload a CSV file."
      );
    },
  },
  {
    label: "Import Excel",
    icon: <span>📊</span>,
    onClick: () => {
      alert(
        "Import employees from Excel\n\nThis would open a file dialog to upload an Excel file."
      );
    },
  },
  {
    label: "Download Template",
    icon: <span>📋</span>,
    onClick: () => {
      alert(
        "Download import template\n\nThis would download a template file for importing employees."
      );
    },
  },
];

export default function ComprehensiveExample() {
  // State management
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverMode, setServerMode] = useState(false);

  // Server-side data handler
  const handleServerData = useCallback(async (params: any) => {
    console.log("🌐 Server request with params:", params);

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let filteredData = [...mockEmployees];

    // Apply filter if provided
    if (params.Filter) {
      console.log("🔍 Applying filter:", params.Filter);
      // In real implementation, this would be handled by your backend
      // For demo, we'll do basic filtering
      const filterTerms = params.Filter.split(";And$").map((f: string) =>
        f.replace(/;$/, "")
      );

      filteredData = filteredData.filter((emp) => {
        return filterTerms.some((term: string) => {
          const [, operator, value] =
            term.match(/^(.+?)(==|!=|>|>=|<|<=|~=|!~=|_=|!_=|\|=|!\|=)(.+)$/) ||
            [];
          if (!operator || !value) return false;

          // Simple demo filtering - in real app this would be server-side
          const empValues = Object.values(emp).join(" ").toLowerCase();
          return empValues.includes(value.toLowerCase());
        });
      });
    }

    // Apply sorting if provided
    if (params.Order) {
      const [sortField, sortDirection] = params.Order.split(";");
      filteredData.sort((a: any, b: any) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "Desc" ? -result : result;
      });
    }

    // Apply pagination
    const startIndex = (params.PageNumber - 1) * params.PageSize;
    const endIndex = startIndex + params.PageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setLoading(false);

    return {
      Succeeded: true,
      Data: paginatedData,
      Count: filteredData.length,
      Message: "Data retrieved successfully",
      PageNumber: params.PageNumber,
      PageSize: params.PageSize,
      TotalPages: Math.ceil(filteredData.length / params.PageSize),
    };
  }, []);

  // Advanced search handler
  const handleAdvancedSearch = useCallback(
    (filters: SearchFilter[]) => {
      console.log("🔍 Advanced search applied:", filters);

      const filterString = buildFilterString(filters);
      console.log("🎯 Generated filter string:", filterString);

      if (serverMode) {
        // In server mode, this will trigger the handler automatically
        console.log("Server mode: Filter will be sent to handler");
      } else {
        // In static mode, apply filters locally
        if (filters.length === 0) {
          setEmployees(mockEmployees);
          return;
        }

        const filtered = mockEmployees.filter((emp) => {
          return filters.every((filter) => {
            const empValue = String(
              emp[filter.column as keyof Employee] || ""
            ).toLowerCase();
            const searchValue = String(filter.value).toLowerCase();

            switch (filter.operator) {
              case "==":
                return empValue === searchValue;
              case "!=":
                return empValue !== searchValue;
              case "~=":
                return empValue.includes(searchValue);
              case "!~=":
                return !empValue.includes(searchValue);
              case "_=":
                return empValue.startsWith(searchValue);
              case "!_=":
                return !empValue.startsWith(searchValue);
              case "|=":
                return empValue.endsWith(searchValue);
              case "!|=":
                return !empValue.endsWith(searchValue);
              case ">":
                return parseFloat(empValue) > parseFloat(searchValue);
              case ">=":
                return parseFloat(empValue) >= parseFloat(searchValue);
              case "<":
                return parseFloat(empValue) < parseFloat(searchValue);
              case "<=":
                return parseFloat(empValue) <= parseFloat(searchValue);
              default:
                return empValue.includes(searchValue);
            }
          });
        });

        setEmployees(filtered);
      }
    },
    [serverMode]
  );

  // Bulk action handler
  const handleBulkAction = useCallback(
    (action: string, selectedIds: (string | number)[]) => {
      console.log(`🔄 Bulk action "${action}" on:`, selectedIds);

      const selectedEmployees = employees.filter((emp) =>
        selectedIds.includes(emp.id)
      );
      const employeeNames = selectedEmployees
        .map((emp) => `${emp.firstName} ${emp.lastName}`)
        .join(", ");

      switch (action) {
        case "export":
          alert(
            `📄 Export Selected\n\nExporting ${selectedIds.length} employees:\n${employeeNames}`
          );
          break;
        case "email":
          alert(
            `✉️ Send Bulk Email\n\nSending email to ${selectedIds.length} employees:\n${employeeNames}`
          );
          break;
        case "activate":
          alert(
            `✅ Activate Employees\n\nActivating ${selectedIds.length} employees:\n${employeeNames}`
          );
          break;
        case "deactivate":
          alert(
            `⏸️ Deactivate Employees\n\nDeactivating ${selectedIds.length} employees:\n${employeeNames}`
          );
          break;
        case "delete":
          const confirmDelete = window.confirm(
            `🗑️ Delete Employees\n\nAre you sure you want to delete ${selectedIds.length} employees?\n\n${employeeNames}\n\nThis action cannot be undone.`
          );
          if (confirmDelete) {
            setEmployees((prev) =>
              prev.filter((emp) => !selectedIds.includes(emp.id))
            );
            setSelectedIds([]);
            alert("Employees deleted successfully!");
          }
          break;
        default:
          alert(
            `Action "${action}" triggered for ${selectedIds.length} employees`
          );
      }
    },
    [employees]
  );

  // Export handler
  const handleExport = useCallback(
    (format: string, selectedIds?: (string | number)[]) => {
      console.log(`📤 Export as ${format}:`, selectedIds || "all");

      const dataToExport = selectedIds
        ? employees.filter((emp) => selectedIds.includes(emp.id))
        : employees;

      const exportData = dataToExport.map((emp) => ({
        "Full Name": `${emp.firstName} ${emp.lastName}`,
        Email: emp.email,
        Department: emp.department,
        Position: emp.position,
        "Start Date": emp.startDate,
        Status: emp.status,
        Salary: emp.salary,
        Performance: emp.performanceRating,
        Location: emp.location,
        "Work Type": emp.workType,
      }));

      alert(
        `📊 Export as ${format.toUpperCase()}\n\nExporting ${
          exportData.length
        } employees in ${format} format.\n\nData preview:\n${JSON.stringify(
          exportData.slice(0, 2),
          null,
          2
        )}${exportData.length > 2 ? "\n..." : ""}`
      );
    },
    [employees]
  );

  // Delete handler
  const handleDelete = useCallback(
    async (ids: (string | number)[]) => {
      console.log("🗑️ Delete request for IDs:", ids);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const deletedEmployees = employees.filter((emp) => ids.includes(emp.id));
      const employeeNames = deletedEmployees
        .map((emp) => `${emp.firstName} ${emp.lastName}`)
        .join(", ");

      setEmployees((prev) => prev.filter((emp) => !ids.includes(emp.id)));

      return {
        Succeeded: true,
        Message: `Successfully deleted ${ids.length} employee(s): ${employeeNames}`,
        Data: null,
        Count: ids.length,
      };
    },
    [employees]
  );

  // Selection change handler
  const handleSelectionChange = useCallback(
    (newSelectedIds: (string | number)[]) => {
      console.log("✅ Selection changed:", newSelectedIds);
      setSelectedIds(newSelectedIds);
    },
    []
  );

  return (
    <I18nextProvider i18n={i18n}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  nc-table
                </span>
                <span className="text-gray-700"> Demo</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                The most powerful React table component with advanced search,
                filtering, and CRUD operations. Built for modern applications
                with TypeScript support.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() =>
                    window.open(
                      "https://github.com/NextCounsel/NCTable",
                      "_blank"
                    )
                  }
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <span className="mr-2">🔗</span>
                  View on GitHub
                </button>
                <button
                  onClick={() =>
                    window.open(
                      "https://www.npmjs.com/package/nc-table",
                      "_blank"
                    )
                  }
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <span className="mr-2">📦</span>
                  npm install nc-table-react
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("demo-table")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <span className="mr-2">🚀</span>
                  Try Demo Below
                </button>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-green-600 font-semibold text-sm">
                    Advanced Search
                  </div>
                  <div className="text-green-500 text-xs">5 Data Types</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-blue-600 font-semibold text-sm">
                    Filter Format
                  </div>
                  <div className="text-blue-500 text-xs">Backend Ready</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <div className="text-purple-600 font-semibold text-sm">
                    Bulk Actions
                  </div>
                  <div className="text-purple-500 text-xs">Multi-Select</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <div className="text-yellow-600 font-semibold text-sm">
                    Export
                  </div>
                  <div className="text-yellow-500 text-xs">CSV, Excel, PDF</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-red-600 font-semibold text-sm">
                    CRUD Ops
                  </div>
                  <div className="text-red-500 text-xs">Full Support</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                  <div className="text-indigo-600 font-semibold text-sm">
                    TypeScript
                  </div>
                  <div className="text-indigo-500 text-xs">Type Safe</div>
                </div>
              </div>

              {/* Installation */}
              <div className="bg-gray-900 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">
                    Quick Installation
                  </h3>
                  <button
                    onClick={() =>
                      navigator.clipboard?.writeText("npm install nc-table-react")
                    }
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
                <code className="text-green-400 text-lg font-mono">
                  npm install nc-table-react
                </code>
                <div className="text-gray-400 text-sm mt-2">
                  Also install: react-i18next i18next lucide-react
                </div>
              </div>
            </div>

            {/* Demo Controls */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🧪 Interactive Demo
                  </h2>
                  <p className="text-gray-600">
                    Employee Management System showcasing all features
                  </p>
                </div>

                {/* Demo Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Mode Toggle */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">
                      Data Mode:
                    </span>
                    <button
                      onClick={() => setServerMode(!serverMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        serverMode ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          serverMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-600">
                      {serverMode ? "🌐 Server-side" : "💾 Static"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {employees.length}
                        </span>{" "}
                        Employees
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {selectedIds.length}
                        </span>{" "}
                        Selected
                      </span>
                    </div>
                    {loading && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-yellow-600 font-medium">
                          Loading...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filter String Preview */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Filter String Generation
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-green-800">Single condition:</strong>
                  <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1">
                    name~=John;
                  </div>
                </div>
                <div>
                  <strong className="text-green-800">
                    Multiple conditions:
                  </strong>
                  <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1">
                    name~=John;And$dept==Eng;And$salary&gt;50000;
                  </div>
                </div>
                <div className="text-green-700 text-xs">
                  ✅ Check browser console to see generated filter strings
                </div>
              </div>
            </div>

            {/* Testing Guide */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">🧪</span>
                Try These Features
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
                <li>Click 🔍 for advanced search</li>
                <li>Select rows for bulk actions</li>
                <li>Use row menu (⋮) for actions</li>
                <li>Test export options</li>
                <li>Toggle server/static modes</li>
                <li>Try sorting by clicking headers</li>
              </ul>
            </div>

            {/* Data Types */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                <span className="mr-2">🏷️</span>
                Data Types Supported
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  <span className="text-purple-800">
                    Text (contains, starts with, etc.)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-purple-800">
                    Date (before, after, equals)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-purple-800">
                    Select (dropdown options)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-purple-800">
                    Boolean (Yes/No true/false)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-purple-800">YesOrNo (Yes/No 1/0)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div
            id="demo-table"
            className="bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <NcTable<Employee>
              // Core Data
              data={serverMode ? undefined : employees}
              handler={serverMode ? handleServerData : undefined}
              columns={columns}
              actions={actions}
              idField="id"
              // Search & Filtering
              showAdvancedSearch={true}
              onAdvancedSearch={handleAdvancedSearch}
              enableInternalSearch={!serverMode}
              searchPlaceholder="Search employees by name, email, department..."
              // Selection & Bulk Actions
              selectable={true}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              bulkActions={bulkActions}
              onBulkAction={handleBulkAction}
              // Export Features
              exportOptions={exportOptions}
              onExport={handleExport}
              // Create/Import
              createAction={createAction}
              importActions={importActions}
              // CRUD Operations
              canDelete={true}
              removeItemHandler={handleDelete}
              // Pagination
              enableInternalPagination={!serverMode}
              showPagination={true}
              pageSize={5} // Small page size for demo
              paginationProps={{
                showFirstLast: true,
                showEllipsis: true,
                maxVisiblePages: 5,
                compact: false,
                showingLabel: "Showing",
                ofLabel: "of",
                recordsLabel: "employees",
                recordLabel: "employee",
              }}
              // Settings & Customization
              enableInternalSettings={true}
              defaultSettings={{
                pageSize: 5,
                sortBy: "firstName",
                sortDirection: "Asc",
                columns: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  department: true,
                  position: true,
                  startDate: true,
                  isActive: true,
                  hasAccess: true,
                  salary: true,
                  performanceRating: true,
                  status: true,
                  workType: true,
                  location: false, // Hidden by default
                },
              }}
              // Loading & Messages
              loading={loading}
              emptyStateMessage="No employees found. Try adjusting your search criteria or add new employees."
              // Styling
              className="nc-table-comprehensive-example"
            />
          </div>

          {/* Live Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real-time Debug Console */}
            <div className="bg-gray-900 text-gray-100 rounded-xl p-6 font-mono text-sm">
              <h3 className="font-bold mb-4 text-green-400 flex items-center">
                <span className="mr-2">🔧</span>
                Live Debug Console
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Mode:</span>
                  <span
                    className={serverMode ? "text-blue-400" : "text-purple-400"}
                  >
                    {serverMode ? "🌐 Server-side" : "💾 Static"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Records:</span>
                  <span className="text-green-400">{employees.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Selected Rows:</span>
                  <span className="text-yellow-400">{selectedIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Loading State:</span>
                  <span
                    className={
                      loading ? "text-red-400 animate-pulse" : "text-green-400"
                    }
                  >
                    {loading ? "⏳ Loading..." : "✅ Ready"}
                  </span>
                </div>
                {selectedIds.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-800 rounded">
                    <div className="text-gray-400 text-xs mb-1">
                      Selected IDs:
                    </div>
                    <div className="text-yellow-300 text-xs break-all">
                      [{selectedIds.join(", ")}]
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Package Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold mb-4 text-blue-900 flex items-center">
                <span className="mr-2">📊</span>
                nc-table Package Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Version:</span>
                  <span className="font-mono text-blue-900">v0.1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Bundle Size:</span>
                  <span className="font-mono text-blue-900">~50KB gzipped</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">TypeScript:</span>
                  <span className="text-green-600">✅ Fully Typed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Dependencies:</span>
                  <span className="font-mono text-blue-900">React 18+</span>
                </div>

                <div className="pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        window.open(
                          "https://github.com/NextCounsel/NCTable/blob/main/README.md",
                          "_blank"
                        )
                      }
                      className="text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      📖 Documentation
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          "https://github.com/NextCounsel/NCTable/issues",
                          "_blank"
                        )
                      }
                      className="text-xs bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      🐛 Report Issues
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <span className="text-lg">📊</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">nc-table</div>
                    <div className="text-sm text-gray-600">
                      Advanced React Table Component
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <a
                    href="https://github.com/NextCounsel/NCTable"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.npmjs.com/package/nc-table"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    npm
                  </a>
                  <a
                    href="https://github.com/NextCounsel/NCTable/blob/main/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Documentation
                  </a>
                  <a
                    href="https://github.com/NextCounsel/NCTable/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Issues
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-gray-500 text-sm">
                  Built with ❤️ using React + TypeScript + Tailwind CSS
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  © 2024 nc-table. Open source under MIT License.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </I18nextProvider>
  );
}
