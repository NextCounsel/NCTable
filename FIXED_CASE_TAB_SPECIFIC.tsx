/**
 * FIXED CASE TAB SPECIFIC - Copy this into your AllRequests.tsx file
 *
 * This shows the exact fix for your case tab not showing data
 */

// ✅ ADD THIS AFTER YOUR useEffect hooks (around line 150)

// Handler function that returns raw response
const createHandler = (requestType?: string) => {
  return async (params: NcTableParams) => {
    console.log(`🚀 ${requestType || "All"} tab - Sending to backend:`, params);

    // Convert NcTable parameters to backend format
    const backendParams = {
      ...params,
      Order: "title;Asc",
      ...(requestType && { Filter: `requestType==${requestType}` }),
    };

    try {
      const response = await requestsApi.getRequests(backendParams);
      console.log(
        `📥 ${requestType || "All"} tab - Raw backend response:`,
        response
      );

      // ✅ Return raw response - don't transform here!
      return response;
    } catch (error) {
      console.error(`❌ ${requestType || "All"} tab - Error:`, error);
      throw error;
    }
  };
};

// ResponseConfig that transforms your backend response
const responseConfig = {
  transformResponse: (response: any) => {
    console.log("🔄 Transform input (your backend response):", response);

    // ✅ CRITICAL: Check your actual response structure and adjust these paths
    const transformed = {
      data: response.data || response.requests || [], // Try different field names
      count: response.total || response.totalCount || response.count || 0, // Try different field names
      success: response.status === "success", // Convert string to boolean
      message: response.message || "Success",
      statusCode: 200,
      pageNumber: response.page || response.currentPage || 1,
      pageSize: response.limit || response.pageSize || 10,
      totalPages: response.totalPages || 0,
    };

    console.log("✅ Transform output (what table expects):", transformed);

    // Validate the transformed data
    if (!Array.isArray(transformed.data)) {
      console.error("❌ Data is not an array:", transformed.data);
    }
    if (typeof transformed.count !== "number") {
      console.error("❌ Count is not a number:", transformed.count);
    }
    if (typeof transformed.success !== "boolean") {
      console.error("❌ Success is not a boolean:", transformed.success);
    }

    return transformed;
  },
};

// ✅ REPLACE YOUR CASE TAB CONTENT WITH THIS:

<TabsContent value="case">
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Case Requests</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <RequestsTable
        id="case-requests-table"
        columns={requestColumns}
        handler={createHandler("case")}
        responseConfig={responseConfig}
        actions={requestActions}
        searchPlaceholder="Search requests..."
        emptyStateMessage="No requests found"
        selectable={true}
        idField="id"
        showSerialNumber={true}
        showAdvancedSearch={true}
        enableInternalSearch={true}
        enableInternalSettings={true}
        enableInternalPagination={true}
        defaultSettings={{
          pageSize: 10,
          sortBy: "title",
          sortDirection: "Asc",
        }}
        className="min-h-[400px]"
      />
    </CardContent>
  </Card>
</TabsContent>;

// ✅ ALSO ADD THIS DEBUG CODE TEMPORARILY (after your useEffect hooks):

useEffect(() => {
  const debugCaseTab = async () => {
    try {
      console.log("🔍 DEBUGGING CASE TAB...");

      const params = {
        PageNumber: 1,
        PageSize: 10,
        Order: "title;Asc",
        Filter: "requestType==case",
      };

      console.log("📤 Sending request to backend:", params);
      const response = await requestsApi.getRequests(params);
      console.log("📥 Backend response:", response);
      console.log("📥 Response structure:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data)
          ? response.data.length
          : "not array",
        hasTotal: !!response.total,
        totalValue: response.total,
        hasStatus: !!response.status,
        statusValue: response.status,
        fullResponse: response,
      });

      // Test the transform
      const transformed = responseConfig.transformResponse(response);
      console.log("🔄 Transformed response:", transformed);
      console.log("🔄 Transform validation:", {
        dataIsArray: Array.isArray(transformed.data),
        dataLength: transformed.data.length,
        countIsNumber: typeof transformed.count === "number",
        successIsBoolean: typeof transformed.success === "boolean",
        hasStatusCode: typeof transformed.statusCode === "number",
      });
    } catch (error) {
      console.error("❌ Case tab debug error:", error);
    }
  };

  debugCaseTab();
}, []);

// ✅ IF YOUR BACKEND RESPONSE IS DIFFERENT, UPDATE THE TRANSFORM:

// Option 1: If your backend returns different field names
const responseConfigAlternative1 = {
  transformResponse: (response: any) => {
    console.log("🔄 Alternative transform - input:", response);

    return {
      data: response.requests || response.items || response.results || [], // Try different field names
      count: response.totalCount || response.total || response.count || 0,
      success: response.status === "success" || response.success === true,
      message: response.message || "Success",
      statusCode: 200,
    };
  },
};

// Option 2: If your backend returns nested structure
const responseConfigAlternative2 = {
  transformResponse: (response: any) => {
    console.log("🔄 Nested structure transform - input:", response);

    return {
      data:
        response.data?.requests || response.data?.items || response.data || [],
      count:
        response.data?.pagination?.total ||
        response.data?.total ||
        response.total ||
        0,
      success: response.status === "success",
      message: response.message || "Success",
      statusCode: 200,
    };
  },
};

// Option 3: If your backend returns Laravel-style response
const responseConfigAlternative3 = {
  transformResponse: (response: any) => {
    console.log("🔄 Laravel-style transform - input:", response);

    return {
      data: response.data || [],
      count: response.meta?.total || response.total || 0,
      success: response.success === true || response.status === "success",
      message: response.message || "Success",
      statusCode: 200,
    };
  },
};
