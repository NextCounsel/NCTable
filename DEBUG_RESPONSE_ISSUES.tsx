/**
 * DEBUG RESPONSE ISSUES TOOL
 *
 * Use this component to diagnose why your table isn't receiving data.
 * This will help identify the exact issue with your response handling.
 */

import React, { useState } from "react";
import {
  NcTable,
  type Column,
  type NcTableProps,
} from "./src/components/nc-table";

// Your data type
type Request = {
  id: number;
  title: string;
  status: string;
  created_at: string;
};

// Column definitions
const columns: Column<Request>[] = [
  { key: "title", header: "Title", searchable: true },
  { key: "status", header: "Status", searchable: true },
  { key: "created_at", header: "Created", searchable: true },
];

export const DebugResponseIssues = () => {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>(null);

  const addLog = (message: string) => {
    setDebugLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // Test 1: Simulate your exact response structure
  const testYourResponse = async () => {
    addLog("🧪 Testing your exact response structure...");

    // Simulate what your backend returns
    const mockResponse = {
      data: {
        requests: [
          {
            id: 1,
            title: "Test Request 1",
            status: "pending",
            created_at: "2024-01-01",
          },
          {
            id: 2,
            title: "Test Request 2",
            status: "completed",
            created_at: "2024-01-02",
          },
        ],
        pagination: {
          total: 2,
        },
      },
      status: "success", // ⚠️ This might be the issue - not a boolean!
      message: "Success",
    };

    addLog(`📥 Mock response: ${JSON.stringify(mockResponse, null, 2)}`);

    // Test your transform function
    const transformResponse = (response: any) => ({
      data: response.data.requests,
      count: response.data.pagination.total,
      success: response.status, // ❌ This is a string, not boolean!
      message: response.message,
      statusCode: 200,
    });

    const transformed = transformResponse(mockResponse);
    addLog(`🔄 Transformed: ${JSON.stringify(transformed, null, 2)}`);

    // Check for issues
    const issues = [];

    if (!Array.isArray(transformed.data)) {
      issues.push("❌ data is not an array");
    }
    if (typeof transformed.count !== "number") {
      issues.push("❌ count is not a number");
    }
    if (typeof transformed.success !== "boolean") {
      issues.push(
        "❌ success is not a boolean (it's " + typeof transformed.success + ")"
      );
    }
    if (typeof transformed.message !== "string") {
      issues.push("❌ message is not a string");
    }
    if (typeof transformed.statusCode !== "number") {
      issues.push("❌ statusCode is not a number");
    }

    if (issues.length > 0) {
      addLog("🚨 ISSUES FOUND:");
      issues.forEach((issue) => addLog(issue));
    } else {
      addLog("✅ All fields are correct types");
    }

    setTestResults({ mockResponse, transformed, issues });
  };

  // Test 2: Fixed response with proper types
  const testFixedResponse = async () => {
    addLog("🔧 Testing FIXED response structure...");

    const mockResponse = {
      data: {
        requests: [
          {
            id: 1,
            title: "Fixed Request 1",
            status: "pending",
            created_at: "2024-01-01",
          },
          {
            id: 2,
            title: "Fixed Request 2",
            status: "completed",
            created_at: "2024-01-02",
          },
        ],
        pagination: {
          total: 2,
        },
      },
      status: "success",
      message: "Success",
    };

    // ✅ FIXED transform function
    const transformResponse = (response: any) => ({
      data: response.data.requests,
      count: response.data.pagination.total,
      success: Boolean(response.status), // ✅ Convert to boolean
      message: response.message,
      statusCode: 200,
    });

    const transformed = transformResponse(mockResponse);
    addLog(`✅ Fixed transform: ${JSON.stringify(transformed, null, 2)}`);

    setTestResults({ mockResponse, transformed, issues: [] });
  };

  // Test 3: Handler function test
  const testHandler = async () => {
    addLog("🔍 Testing handler function...");

    const handler: NcTableProps<Request>["handler"] = async (params) => {
      addLog(`📤 Handler called with: ${JSON.stringify(params)}`);

      // Simulate API call
      const mockResponse = {
        data: {
          requests: [
            {
              id: 1,
              title: "Handler Test 1",
              status: "pending",
              created_at: "2024-01-01",
            },
            {
              id: 2,
              title: "Handler Test 2",
              status: "completed",
              created_at: "2024-01-02",
            },
          ],
          pagination: { total: 2 },
        },
        status: "success",
        message: "Success",
      };

      addLog(`📥 Handler returning: ${JSON.stringify(mockResponse)}`);
      return mockResponse;
    };

    // Test the handler
    try {
      const result = await handler({ PageNumber: 1, PageSize: 10 });
      addLog(`✅ Handler result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`❌ Handler error: ${error}`);
    }
  };

  // Test 4: Complete table test
  const testCompleteTable = () => {
    addLog("🎯 Testing complete table setup...");

    const handler: NcTableProps<Request>["handler"] = async (params) => {
      addLog(`📤 Table handler called with: ${JSON.stringify(params)}`);

      return {
        data: {
          requests: [
            {
              id: 1,
              title: "Table Test 1",
              status: "pending",
              created_at: "2024-01-01",
            },
            {
              id: 2,
              title: "Table Test 2",
              status: "completed",
              created_at: "2024-01-02",
            },
          ],
          pagination: { total: 2 },
        },
        status: "success",
        message: "Success",
      };
    };

    const responseConfig = {
      transformResponse: (response: any) => {
        addLog(`🔄 Transform called with: ${JSON.stringify(response)}`);

        const transformed = {
          data: response.data.requests,
          count: response.data.pagination.total,
          success: Boolean(response.status),
          message: response.message,
          statusCode: 200,
        };

        addLog(`✅ Transform returning: ${JSON.stringify(transformed)}`);
        return transformed;
      },
    };

    return (
      <div className="border rounded-lg overflow-hidden">
        <NcTable<Request>
          columns={columns}
          handler={handler}
          responseConfig={responseConfig}
          showSerialNumber={true}
          showAdvancedSearch={true}
          showPagination={true}
          pageSize={2}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">🔍 Debug Response Issues</h1>
        <p className="text-gray-600 mb-6">
          Use these tests to identify what's preventing your table from
          receiving data.
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={testYourResponse}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Your Response
        </button>
        <button
          onClick={testFixedResponse}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Fixed Response
        </button>
        <button
          onClick={testHandler}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Handler
        </button>
        <button
          onClick={() => setDebugLogs([])}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      {/* Debug Logs */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        <h3 className="text-white font-bold mb-2">Debug Logs:</h3>
        {debugLogs.length === 0 ? (
          <p className="text-gray-400">No logs yet. Run a test above.</p>
        ) : (
          debugLogs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Mock Response:</h3>
            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(testResults.mockResponse, null, 2)}
            </pre>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Transformed Result:</h3>
            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(testResults.transformed, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Issues Summary */}
      {testResults?.issues && testResults.issues.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">🚨 Issues Found:</h3>
          <ul className="text-red-700">
            {testResults.issues.map((issue: string, index: number) => (
              <li key={index} className="mb-1">
                • {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Complete Table Test */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🎯 Complete Table Test:</h3>
        {testCompleteTable()}
      </div>

      {/* Common Issues Guide */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">
          🔍 Common Issues Checklist:
        </h3>
        <ul className="text-yellow-700 space-y-1">
          <li>
            • <strong>success field:</strong> Must be boolean, not string/number
          </li>
          <li>
            • <strong>statusCode field:</strong> Required, must be number
          </li>
          <li>
            • <strong>data field:</strong> Must be array, not null/undefined
          </li>
          <li>
            • <strong>count field:</strong> Must be number, not string
          </li>
          <li>
            • <strong>handler function:</strong> Must return the response
          </li>
          <li>
            • <strong>data paths:</strong> response.data.requests must exist
          </li>
          <li>
            • <strong>network errors:</strong> Check browser Network tab
          </li>
          <li>
            • <strong>CORS issues:</strong> Backend must allow your domain
          </li>
        </ul>
      </div>
    </div>
  );
};
