/**
 * WORKING EXAMPLE FOR YOUR EXACT RESPONSE FORMAT
 *
 * This shows how to properly transform your backend response to work with nc-table-react
 */

import React from "react";
import {
  NcTable,
  type Column,
  type NcTableProps,
} from "./src/components/nc-table";

// Your data type (adjust fields based on your actual request structure)
type Request = {
  id: number;
  title: string;
  status: string;
  created_at: string;
  // Add other fields that your requests actually have
};

// Column definitions
const columns: Column<Request>[] = [
  { key: "id", header: "ID", searchable: true },
  { key: "title", header: "Title", searchable: true },
  { key: "status", header: "Status", searchable: true },
  { key: "created_at", header: "Created", searchable: true },
];

// ✅ CORRECT Handler Function
const fetchRequests: NcTableProps<Request>["handler"] = async (params) => {
  console.log("🚀 Sending to backend:", params);

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("📥 Raw backend response:", result);

    // ✅ IMPORTANT: Return the raw response - don't transform here!
    return result;
  } catch (error) {
    console.error("❌ Handler error:", error);
    throw error;
  }
};

// ✅ CORRECT ResponseConfig - This transforms your exact response format
const responseConfig = {
  transformResponse: (response: any) => {
    console.log("🔄 Transform input (your response):", response);

    // Extract data from your exact response structure
    const requests = response.data?.requests || [];
    const pagination = response.data?.pagination || {};
    const status = response.status || "";
    const message = response.message || "";

    console.log("📊 Extracted data:", {
      requests: requests.length,
      total: pagination.total,
      status,
      message,
    });

    // ✅ Transform to what nc-table-react expects
    const transformed = {
      data: requests, // Array of request objects
      count: pagination.total || 0, // Total count for pagination
      success: status === "success", // Convert string to boolean
      message: message, // Success/error message
      statusCode: 200, // HTTP status code
      pageNumber: pagination.page || 1, // Current page
      pageSize: pagination.limit || 10, // Items per page
      totalPages: pagination.totalPages || 0, // Total pages
    };

    console.log("✅ Transform output (what table expects):", transformed);

    // ✅ Validate the transformed data
    if (!Array.isArray(transformed.data)) {
      console.error("❌ ERROR: Data is not an array:", transformed.data);
    }
    if (typeof transformed.count !== "number") {
      console.error("❌ ERROR: Count is not a number:", transformed.count);
    }
    if (typeof transformed.success !== "boolean") {
      console.error("❌ ERROR: Success is not a boolean:", transformed.success);
    }

    return transformed;
  },
};

// ✅ COMPLETE WORKING TABLE COMPONENT
export const WorkingExampleYourResponse = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">
          ✅ Working Example for Your Response Format
        </h1>
        <p className="text-gray-600 mb-6">
          This example shows exactly how to transform your backend response to
          work with nc-table-react.
        </p>
      </div>

      {/* Your Response Structure Display */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Your Backend Response Structure:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {`{
  "status": "success",
  "message": "requests retrieved successfully",
  "data": {
    "requests": [
      { "id": 1, "title": "Request 1", "status": "pending", "created_at": "2024-01-01" },
      { "id": 2, "title": "Request 2", "status": "completed", "created_at": "2024-01-02" }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}`}
        </pre>
      </div>

      {/* Transform Configuration Display */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Transform Configuration:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {`const responseConfig = {
  transformResponse: (response) => ({
    data: response.data.requests,           // Your requests array
    count: response.data.pagination.total,  // Total count
    success: response.status === "success", // Convert to boolean
    message: response.message,              // Message
    statusCode: 200,                        // HTTP status
    pageNumber: response.data.pagination.page,
    pageSize: response.data.pagination.limit,
    totalPages: response.data.pagination.totalPages,
  }),
};`}
        </pre>
      </div>

      {/* The Working Table */}
      <div className="border rounded-lg overflow-hidden">
        <NcTable<Request>
          id="working-example-table"
          columns={columns}
          handler={fetchRequests}
          responseConfig={responseConfig}
          showSerialNumber={true}
          showAdvancedSearch={true}
          showPagination={true}
          pageSize={10}
        />
      </div>

      {/* Debug Information */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">
          🔍 Debug Information:
        </h3>
        <ul className="text-yellow-700 space-y-1">
          <li>• Check browser console for detailed logs</li>
          <li>• Verify your backend endpoint returns the expected structure</li>
          <li>• Make sure your Request type matches your actual data fields</li>
          <li>• Check Network tab to see the actual API response</li>
        </ul>
      </div>
    </div>
  );
};

// ✅ MINIMAL WORKING VERSION (Copy this to your project)
export const MinimalWorkingExample = () => {
  const handler: NcTableProps<Request>["handler"] = async (params) => {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return response.json();
  };

  const responseConfig = {
    transformResponse: (response: any) => ({
      data: response.data.requests,
      count: response.data.pagination.total,
      success: response.status === "success",
      message: response.message,
      statusCode: 200,
    }),
  };

  return (
    <NcTable<Request>
      columns={columns}
      handler={handler}
      responseConfig={responseConfig}
      showSerialNumber={true}
      showPagination={true}
      pageSize={10}
    />
  );
};
