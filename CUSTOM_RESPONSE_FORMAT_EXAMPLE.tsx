/**
 * CUSTOM RESPONSE FORMAT EXAMPLE
 *
 * This example shows how to use nc-table with different backend API response formats
 * using the new responseConfig prop for maximum flexibility.
 */

import React, { useState } from "react";
import {
  NcTable,
  type Column,
  type NcTableProps,
} from "./src/components/nc-table";
import { CommonResponseFormats } from "./src/components/nc-table/utils/responseUtils";

// Your data type
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

// Column definitions
const columns: Column<User>[] = [
  { key: "name", header: "Name", searchable: true },
  { key: "email", header: "Email", searchable: true },
  { key: "role", header: "Role", searchable: true },
  { key: "isActive", header: "Active", searchable: true },
];

export const CustomResponseFormatExample = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>("standard");

  // 1. STANDARD IApiResponse FORMAT (Default)
  const standardHandler: NcTableProps<User>["handler"] = async (params) => {
    console.log("Standard format request:", params);

    // Simulate API call - your backend returns this format
    return {
      Succeeded: true,
      Data: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "Admin",
          isActive: true,
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "User",
          isActive: false,
        },
      ],
      Count: 2,
      Message: "Success",
      StatusCode: 200,
    };
  };

  // 2. REST API FORMAT (Different field names)
  const restApiHandler: NcTableProps<User>["handler"] = async (params) => {
    console.log("REST API format request:", params);

    // Your backend returns this format
    return {
      success: true,
      data: [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "Manager",
          isActive: true,
        },
        {
          id: 2,
          name: "Bob Wilson",
          email: "bob@example.com",
          role: "User",
          isActive: true,
        },
      ],
      total: 2,
      message: "Data retrieved successfully",
      status: 200,
    };
  };

  // 3. GRAPHQL STYLE FORMAT (Nested structure)
  const graphqlHandler: NcTableProps<User>["handler"] = async (params) => {
    console.log("GraphQL format request:", params);

    // Your GraphQL backend returns this format
    return {
      success: true,
      data: {
        items: [
          {
            id: 1,
            name: "Charlie Brown",
            email: "charlie@example.com",
            role: "Developer",
            isActive: true,
          },
          {
            id: 2,
            name: "Diana Prince",
            email: "diana@example.com",
            role: "Designer",
            isActive: false,
          },
        ],
        totalCount: 2,
      },
      message: "Query executed successfully",
      statusCode: 200,
    };
  };

  // 4. LARAVEL API RESOURCE FORMAT
  const laravelHandler: NcTableProps<User>["handler"] = async (params) => {
    console.log("Laravel format request:", params);

    // Your Laravel backend returns this format
    return {
      success: true,
      data: [
        {
          id: 1,
          name: "Eva Green",
          email: "eva@example.com",
          role: "Admin",
          isActive: true,
        },
        {
          id: 2,
          name: "Frank Miller",
          email: "frank@example.com",
          role: "User",
          isActive: true,
        },
      ],
      meta: {
        total: 2,
        current_page: 1,
        per_page: 10,
        last_page: 1,
      },
      message: "Users retrieved successfully",
      status: 200,
    };
  };

  // 5. DJANGO REST FRAMEWORK FORMAT
  const djangoHandler: NcTableProps<User>["handler"] = async (params) => {
    console.log("Django format request:", params);

    // Your Django backend returns this format
    return {
      success: true,
      results: [
        {
          id: 1,
          name: "Grace Hopper",
          email: "grace@example.com",
          role: "Engineer",
          isActive: true,
        },
        {
          id: 2,
          name: "Henry Ford",
          email: "henry@example.com",
          role: "Manager",
          isActive: false,
        },
      ],
      count: 2,
      next: null,
      previous: null,
      message: "Success",
      status: 200,
    };
  };

  // 6. CUSTOM TRANSFORMATION FUNCTION
  const customHandler: NcTableProps<User>["handler"] = async (params) => {
    console.log("Custom format request:", params);

    // Your backend returns a completely custom format
    return {
      response: {
        users: [
          {
            id: 1,
            name: "Ivy Chen",
            email: "ivy@example.com",
            role: "Analyst",
            isActive: true,
          },
          {
            id: 2,
            name: "Jack Sparrow",
            email: "jack@example.com",
            role: "Captain",
            isActive: true,
          },
        ],
        pagination: {
          total_records: 2,
          current_page: 1,
          records_per_page: 10,
        },
      },
      status: {
        ok: true,
        message: "Operation completed",
        code: 200,
      },
    };
  };

  const customTransformConfig = {
    transformResponse: (response: any) => ({
      data: response.response.users,
      count: response.response.pagination.total_records,
      success: response.status.ok,
      message: response.status.message,
      statusCode: response.status.code,
      pageNumber: response.response.pagination.current_page,
      pageSize: response.response.pagination.records_per_page,
    }),
  };

  // Get the appropriate handler and config based on selection
  const getHandlerAndConfig = () => {
    switch (selectedFormat) {
      case "standard":
        return { handler: standardHandler, config: undefined };
      case "rest":
        return {
          handler: restApiHandler,
          config: CommonResponseFormats.restApi,
        };
      case "graphql":
        return {
          handler: graphqlHandler,
          config: CommonResponseFormats.graphql,
        };
      case "laravel":
        return {
          handler: laravelHandler,
          config: CommonResponseFormats.laravel,
        };
      case "django":
        return { handler: djangoHandler, config: CommonResponseFormats.django };
      case "custom":
        return { handler: customHandler, config: customTransformConfig };
      default:
        return { handler: standardHandler, config: undefined };
    }
  };

  const { handler, config } = getHandlerAndConfig();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">
          Custom Response Format Examples
        </h1>
        <p className="text-gray-600 mb-6">
          This example demonstrates how to use nc-table with different backend
          API response formats using the new <code>responseConfig</code> prop.
        </p>
      </div>

      {/* Format Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Select Response Format:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { value: "standard", label: "Standard (IApiResponse)" },
            { value: "rest", label: "REST API" },
            { value: "graphql", label: "GraphQL Style" },
            { value: "laravel", label: "Laravel API Resource" },
            { value: "django", label: "Django REST Framework" },
            { value: "custom", label: "Custom Transform" },
          ].map((format) => (
            <button
              key={format.value}
              onClick={() => setSelectedFormat(format.value)}
              className={`px-3 py-2 text-sm rounded border ${
                selectedFormat === format.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {format.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Configuration Display */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Configuration:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <NcTable<User>
          id="custom-response-table"
          columns={columns}
          handler={handler}
          responseConfig={config}
          showSerialNumber={true}
          showAdvancedSearch={true}
          showPagination={true}
          pageSize={2}
        />
      </div>

      {/* Usage Examples */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Usage Examples:</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">1. Standard Format (Default):</h4>
            <pre className="text-sm bg-white p-2 rounded border mt-1">
              {`<NcTable
  columns={columns}
  handler={standardHandler}
  // No responseConfig needed - uses default IApiResponse format
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium">2. REST API Format:</h4>
            <pre className="text-sm bg-white p-2 rounded border mt-1">
              {`<NcTable
  columns={columns}
  handler={restApiHandler}
  responseConfig={CommonResponseFormats.restApi}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium">3. Custom Transform Function:</h4>
            <pre className="text-sm bg-white p-2 rounded border mt-1">
              {`<NcTable
  columns={columns}
  handler={customHandler}
  responseConfig={{
    transformResponse: (response) => ({
      data: response.response.users,
      count: response.response.pagination.total_records,
      success: response.status.ok,
      message: response.status.message,
      statusCode: response.status.code,
    }),
  }}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
