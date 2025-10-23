/**
 * DEBUG YOUR SPECIFIC ISSUE
 *
 * Copy this component into your project to debug exactly what's happening
 */

import React, { useState } from "react";
import { NcTable, type Column } from "nc-table-react";

// Your data type
type FIRSRequest = {
  id: number;
  title: string;
  requestId: string;
  requestType: string;
  status: string;
  reference?: string;
  createdAt: string;
  createdBy?: {
    region?: { name: string };
    division?: { name: string };
  };
  assignedTo?: {
    fullName: string;
  };
  // Add other fields based on your actual data
};

// Column definitions
const columns: Column<FIRSRequest>[] = [
  { key: "title", header: "Title", searchable: true },
  { key: "requestId", header: "Request ID", searchable: true },
  { key: "requestType", header: "Type", searchable: true },
  { key: "status", header: "Status", searchable: true },
];

export const DebugYourIssue = () => {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>(null);

  const addLog = (message: string) => {
    setDebugLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // Test 1: Test your exact backend response
  const testBackendResponse = async () => {
    addLog("🧪 Testing your backend response...");

    try {
      // Import your requestsApi (adjust import path as needed)
      const { requestsApi } = await import("@/services/requestsApi");

      const params = {
        PageNumber: 1,
        PageSize: 10,
        Order: "title;Asc",
        Filter: "requestType==case",
      };

      addLog(`📤 Sending request: ${JSON.stringify(params)}`);

      const response = await requestsApi.getRequests(params);
      addLog(`📥 Raw response: ${JSON.stringify(response, null, 2)}`);

      setTestResults({
        type: "backend",
        request: params,
        response: response,
        issues: [],
      });
    } catch (error) {
      addLog(`❌ Backend error: ${error}`);
      setTestResults({
        type: "backend",
        error: error,
      });
    }
  };

  // Test 2: Test the transform function
  const testTransformFunction = () => {
    addLog("🔄 Testing transform function...");

    // Your backend response structure (update this based on your actual response)
    const mockResponse = {
      status: "success",
      message: "requests retrieved successfully",
      data: [
        {
          id: 1,
          title: "Test Request 1",
          requestId: "REQ-001",
          requestType: "case",
          status: "pending",
          reference: "REF-001",
          createdAt: "2024-01-01T00:00:00Z",
          createdBy: {
            region: { name: "Test Region" },
            division: { name: "Test Division" },
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    addLog(`📥 Mock response: ${JSON.stringify(mockResponse, null, 2)}`);

    // Your transform function
    const transformResponse = (response: any) => {
      console.log("🔄 Transform input:", response);

      const transformed = {
        data: response.data || [],
        count: response.total || 0,
        success: response.status === "success",
        message: response.message || "Success",
        statusCode: 200,
        pageNumber: response.page || 1,
        pageSize: response.limit || 10,
        totalPages: response.totalPages || 0,
      };

      console.log("✅ Transform output:", transformed);
      return transformed;
    };

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
      issues.push("❌ success is not a boolean");
    }
    if (typeof transformed.message !== "string") {
      issues.push("❌ message is not a string");
    }
    if (typeof transformed.statusCode !== "number") {
      issues.push("❌ statusCode is not a number");
    }

    setTestResults({
      type: "transform",
      input: mockResponse,
      output: transformed,
      issues,
      isValid: issues.length === 0,
    });

    if (issues.length === 0) {
      addLog("✅ Transform function is working correctly!");
    } else {
      addLog("❌ Issues found in transform function");
    }
  };

  // Test 3: Test complete table setup
  const testCompleteTable = () => {
    addLog("🎯 Testing complete table setup...");

    const handler = async (params: any) => {
      addLog(`📤 Handler called with: ${JSON.stringify(params)}`);

      // Mock response based on your structure
      const mockResponse = {
        status: "success",
        message: "requests retrieved successfully",
        data: [
          {
            id: 1,
            title: "Test Request 1",
            requestId: "REQ-001",
            requestType: "case",
            status: "pending",
            reference: "REF-001",
            createdAt: "2024-01-01T00:00:00Z",
            createdBy: {
              region: { name: "Test Region" },
              division: { name: "Test Division" },
            },
          },
          {
            id: 2,
            title: "Test Request 2",
            requestId: "REQ-002",
            requestType: "case",
            status: "approved",
            reference: "REF-002",
            createdAt: "2024-01-02T00:00:00Z",
            createdBy: {
              region: { name: "Test Region" },
              division: { name: "Test Division" },
            },
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      addLog(`📥 Handler returning: ${JSON.stringify(mockResponse)}`);
      return mockResponse;
    };

    const responseConfig = {
      transformResponse: (response: any) => {
        addLog(`🔄 Transform called with: ${JSON.stringify(response)}`);

        const transformed = {
          data: response.data || [],
          count: response.total || 0,
          success: response.status === "success",
          message: response.message || "Success",
          statusCode: 200,
        };

        addLog(`✅ Transform returning: ${JSON.stringify(transformed)}`);
        return transformed;
      },
    };

    return (
      <div className="border rounded-lg overflow-hidden">
        <NcTable<FIRSRequest>
          columns={columns}
          handler={handler}
          responseConfig={responseConfig}
          showSerialNumber={true}
          showPagination={true}
          pageSize={2}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">🔍 Debug Your Issue</h1>
        <p className="text-gray-600 mb-6">
          Use these tests to identify exactly why your table isn't showing data.
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={testBackendResponse}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Backend Response
        </button>
        <button
          onClick={testTransformFunction}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Transform Function
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
        <div className="space-y-4">
          {testResults.type === "backend" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Request Sent:</h3>
                <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(testResults.request, null, 2)}
                </pre>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Backend Response:</h3>
                <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(testResults.response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {testResults.type === "transform" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Transform Input:</h3>
                <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(testResults.input, null, 2)}
                </pre>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Transform Output:</h3>
                <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                  {JSON.stringify(testResults.output, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Issues */}
          {testResults.issues && testResults.issues.length > 0 && (
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
        </div>
      )}

      {/* Complete Table Test */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🎯 Complete Table Test:</h3>
        {testCompleteTable()}
      </div>

      {/* Quick Fixes */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">
          🔧 Quick Fixes to Try:
        </h3>
        <ul className="text-yellow-700 space-y-1">
          <li>
            • <strong>Check your backend response structure</strong> - Make sure
            it matches what the transform expects
          </li>
          <li>
            • <strong>Verify your data field names</strong> - response.data,
            response.total, response.status
          </li>
          <li>
            • <strong>Check if your backend is returning data</strong> - Maybe
            the data array is empty
          </li>
          <li>
            • <strong>Verify your column keys</strong> - Make sure they match
            your data field names
          </li>
          <li>
            • <strong>Check browser Network tab</strong> - See what's actually
            being sent/received
          </li>
        </ul>
      </div>
    </div>
  );
};
