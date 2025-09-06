import React, { useState } from "react";
import { NcTable, type Column } from "./src/components/nc-table";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Minimal i18n setup
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({ lng: "en", resources: { en: { translation: {} } } });
}

type Employee = {
  id: number;
  name: string;
  department: string;
  status: string;
  isActive: boolean;
};

const testData: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    department: "Engineering",
    status: "active",
    isActive: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    department: "Marketing",
    status: "inactive",
    isActive: false,
  },
  {
    id: 3,
    name: "Bob Johnson",
    department: "Sales",
    status: "active",
    isActive: true,
  },
];

const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Name",
    searchable: true,
  },
  {
    key: "department",
    header: "Department",
    searchable: true,
    searchOverride: {
      key: "DeptId", // 🎯 This will use "DeptId" instead of "department" in backend queries
      dataType: "select",
      selectOptions: [
        { text: "Engineering", value: "ENG" },
        { text: "Marketing", value: "MKT" },
        { text: "Sales", value: "SALES" },
      ],
    },
  },
  {
    key: "status",
    header: "Status",
    searchable: true,
    searchOverride: {
      key: "Status", // 🎯 This will use "Status" instead of "status" in backend queries
      dataType: "select",
      selectOptions: [
        { text: "Active", value: "1" },
        { text: "Inactive", value: "0" },
      ],
    },
  },
];

export default function QuickFixTest() {
  const [filterString, setFilterString] = useState<string>("");

  const handleAdvancedSearch = (filters: any[]) => {
    // Import buildFilterString for testing
    const {
      buildFilterString,
    } = require("./src/components/nc-table/utils/filterUtils");
    const generatedFilter = buildFilterString(filters, columns);
    setFilterString(generatedFilter);
    console.log("🎯 Generated Filter String:", generatedFilter);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Quick Fix Test - No Backend Calls
          </h1>
          <p className="text-gray-600">
            This uses static data only - no server requests, no 500 errors
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

        {/* Simple Static Table */}
        <div className="bg-white rounded-lg shadow border">
          <NcTable
            data={testData} // 🎯 Using static data only
            columns={columns}
            showAdvancedSearch={true}
            onAdvancedSearch={handleAdvancedSearch}
            className="mt-6"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            🛠️ How to Fix Your 500 Error:
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>1. Use Static Data First:</strong> Switch your table to
              use <code>data={`{yourArray}`}</code> instead of{" "}
              <code>handler={`{yourFunction}`}</code>
            </p>
            <p>
              <strong>2. Check Server Mode:</strong> If using
              COMPREHENSIVE_EXAMPLE, make sure server mode is OFF
            </p>
            <p>
              <strong>3. Backend Integration:</strong> When ready for backend,
              ensure your API endpoint can handle the new filter format
            </p>
            <p>
              <strong>4. Debug:</strong> Open browser console to see the
              generated filter strings
            </p>
          </div>
        </div>
      </div>
    </I18nextProvider>
  );
}
