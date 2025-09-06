import React, { useState } from "react";
import {
  NcTable,
  type Column,
  type TableAction,
} from "./src/components/nc-table";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Minimal i18n setup
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: { translation: {} } } });
}

type TestEmployee = {
  id: number;
  name: string;
  statusDescription: string; // Display field
  departmentName: string; // Display field
  isActiveText: string; // Display field
};

const testData: TestEmployee[] = [
  {
    id: 1,
    name: "John Doe",
    statusDescription: "Active Employee",
    departmentName: "Engineering Department",
    isActiveText: "Yes",
  },
  {
    id: 2,
    name: "Jane Smith",
    statusDescription: "Inactive Employee",
    departmentName: "Marketing Department",
    isActiveText: "No",
  },
  {
    id: 3,
    name: "Bob Johnson",
    statusDescription: "Pending Approval",
    departmentName: "Sales Department",
    isActiveText: "Yes",
  },
];

// Column definitions with key mapping for backend search
const columns: Column<TestEmployee>[] = [
  {
    key: "name",
    header: "Name",
    searchable: true,
    // No searchOverride - uses column name "name" for both display and search
  },
  {
    key: "statusDescription",
    header: "Status Description",
    searchable: true,
    searchOverride: {
      key: "Status", // 🎯 Backend field is "Status", but display shows "statusDescription"
      dataType: "select",
      selectOptions: [
        { text: "Active Employee", value: "1" },
        { text: "Inactive Employee", value: "0" },
        { text: "Pending Approval", value: "2" },
      ],
    },
  },
  {
    key: "departmentName",
    header: "Department Name",
    searchable: true,
    searchOverride: {
      key: "DeptId", // 🎯 Backend field is "DeptId", but display shows "departmentName"
      dataType: "select",
      selectOptions: [
        { text: "Engineering Department", value: "ENG" },
        { text: "Marketing Department", value: "MKT" },
        { text: "Sales Department", value: "SALES" },
      ],
    },
  },
  {
    key: "isActiveText",
    header: "Is Active",
    searchable: true,
    searchOverride: {
      key: "IsActive", // 🎯 Backend field is "IsActive", but display shows "isActiveText"
      dataType: "boolean",
    },
  },
];

export default function KeyFunctionalityTest() {
  const [filterString, setFilterString] = useState<string>("");

  const handleAdvancedSearch = (filters: any[]) => {
    // Import buildFilterString for testing
    const {
      buildFilterString,
    } = require("./src/components/nc-table/utils/filterUtils");
    const generatedFilter = buildFilterString(filters, columns);
    setFilterString(generatedFilter);
    console.log("🎯 Generated Filter String:", generatedFilter);
    console.log("🔍 Original Filters:", filters);
    console.log(
      "📋 Column Mappings:",
      columns.map((col) => ({
        display: col.key,
        backend: col.searchOverride?.key || col.key,
      }))
    );
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔑 Key Functionality Test
          </h1>
          <p className="text-gray-600">
            Testing searchOverride.key property for backend field mapping
          </p>
        </div>

        {/* Filter String Display */}
        {filterString && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ Generated Backend Filter String:
            </h3>
            <code className="text-green-700 bg-green-100 px-2 py-1 rounded text-sm font-mono">
              {filterString}
            </code>
          </div>
        )}

        {/* Column Mapping Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">
            📋 Column Mapping Configuration:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col) => (
              <div key={col.key} className="bg-white p-3 rounded border">
                <div className="font-medium text-sm text-gray-900">
                  {col.header}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Display:{" "}
                  <code className="bg-gray-100 px-1 rounded">{col.key}</code>
                </div>
                <div className="text-xs text-gray-500">
                  Backend:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {col.searchOverride?.key || col.key}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expected vs Actual Examples */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-3">
            🧪 Test Scenarios:
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Scenario 1:</strong> Search "Status Description" = "Active
              Employee"
              <br />
              <span className="text-gray-600">
                Expected: <code>Status==1;</code> (uses "Status" instead of
                "statusDescription")
              </span>
            </div>
            <div>
              <strong>Scenario 2:</strong> Search "Department Name" =
              "Engineering Department" AND "Is Active" = true
              <br />
              <span className="text-gray-600">
                Expected: <code>DeptId==ENG;And$IsActive==true;</code>
              </span>
            </div>
            <div>
              <strong>Scenario 3:</strong> Search "Name" = "John"
              <br />
              <span className="text-gray-600">
                Expected: <code>name~=John;</code> (no key override, uses column
                name)
              </span>
            </div>
          </div>
        </div>

        {/* The Table */}
        <NcTable
          data={testData}
          columns={columns}
          showAdvancedSearch={true}
          onAdvancedSearch={handleAdvancedSearch}
          className="mt-6"
        />
      </div>
    </I18nextProvider>
  );
}
