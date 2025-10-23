/**
 * TEST YOUR EXACT RESPONSE FORMAT
 *
 * Use this to test if your response structure works with the transform function
 */

import React, { useState } from "react";

export const TestYourResponse = () => {
  const [testResult, setTestResult] = useState<any>(null);

  // Your exact response structure
  const yourResponse = {
    status: "success",
    message:
      "requests?requestType=solicitor_request&page=1&limit=10 retrieved successfully",
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
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    },
  };

  // The transform function for your response
  const transformResponse = (response: any) => ({
    data: response.data.requests,
    count: response.data.pagination.total,
    success: response.status === "success",
    message: response.message,
    statusCode: 200,
    pageNumber: response.data.pagination.page,
    pageSize: response.data.pagination.limit,
    totalPages: response.data.pagination.totalPages,
  });

  const testTransform = () => {
    console.log("🧪 Testing your response structure...");
    console.log("📥 Input:", yourResponse);

    const transformed = transformResponse(yourResponse);
    console.log("🔄 Transformed:", transformed);

    // Validate the result
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

    setTestResult({
      input: yourResponse,
      output: transformed,
      issues,
      isValid: issues.length === 0,
    });

    if (issues.length === 0) {
      console.log("✅ SUCCESS: Your response structure is valid!");
    } else {
      console.log("❌ ISSUES FOUND:", issues);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">
          🧪 Test Your Response Format
        </h1>
        <p className="text-gray-600 mb-6">
          This tests your exact response structure to see if it works with
          nc-table-react.
        </p>
      </div>

      <button
        onClick={testTransform}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Your Response Structure
      </button>

      {testResult && (
        <div className="space-y-4">
          {/* Input */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">📥 Your Response Input:</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(testResult.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">🔄 Transformed Output:</h3>
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(testResult.output, null, 2)}
            </pre>
          </div>

          {/* Results */}
          {testResult.isValid ? (
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">✅ SUCCESS!</h3>
              <p className="text-green-700">
                Your response structure is valid and should work with
                nc-table-react.
              </p>
            </div>
          ) : (
            <div className="bg-red-100 p-4 rounded-lg">
              <h3 className="font-bold text-red-800 mb-2">❌ ISSUES FOUND:</h3>
              <ul className="text-red-700">
                {testResult.issues.map((issue: string, index: number) => (
                  <li key={index} className="mb-1">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Copy-Paste Ready Code */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">📋 Copy-Paste Ready Code:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {`// Handler function
const handler = async (params) => {
  const response = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.json();
};

// Response config for your exact structure
const responseConfig = {
  transformResponse: (response) => ({
    data: response.data.requests,
    count: response.data.pagination.total,
    success: response.status === "success",
    message: response.message,
    statusCode: 200,
  }),
};

// Use in your table
<NcTable
  columns={columns}
  handler={handler}
  responseConfig={responseConfig}
  showSerialNumber={true}
  showPagination={true}
/>`}
        </pre>
      </div>
    </div>
  );
};
