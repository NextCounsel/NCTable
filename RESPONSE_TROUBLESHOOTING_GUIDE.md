# 🔍 Response Troubleshooting Guide

## Most Common Issues (In Order of Frequency)

### 1. **Type Mismatches** ⚠️

```typescript
// ❌ WRONG - success is string, not boolean
success: response.status, // "success" (string)

// ✅ CORRECT - convert to boolean
success: Boolean(response.status), // true (boolean)
```

### 2. **Missing Required Fields** ❌

```typescript
// ❌ WRONG - missing statusCode
transformResponse: (response) => ({
  data: response.data.requests,
  count: response.data.pagination.total,
  success: response.status,
  message: response.message,
  // statusCode: 200, // ❌ MISSING!
});

// ✅ CORRECT - all required fields
transformResponse: (response) => ({
  data: response.data.requests,
  count: response.data.pagination.total,
  success: Boolean(response.status),
  message: response.message,
  statusCode: 200, // ✅ REQUIRED!
});
```

### 3. **Wrong Data Paths** 🚫

```typescript
// ❌ WRONG - path doesn't exist
data: response.data.requests, // Maybe it's response.requests?

// ✅ CORRECT - verify the actual structure
console.log('Response structure:', response);
data: response.requests, // Or whatever the actual path is
```

### 4. **Handler Not Returning Response** 🔄

```typescript
// ❌ WRONG - no return statement
const handler = async (params) => {
  const response = await fetch("/api/requests");
  const result = await response.json();
  // Missing return!
};

// ✅ CORRECT - return the response
const handler = async (params) => {
  const response = await fetch("/api/requests");
  const result = await response.json();
  return result; // ✅ Return it!
};
```

### 5. **Data Type Issues** 📊

```typescript
// ❌ WRONG - count is string
count: "100", // String instead of number

// ✅ CORRECT - ensure it's a number
count: Number(response.data.pagination.total) || 0,

// ❌ WRONG - data might be null
data: response.data.requests, // Could be null

// ✅ CORRECT - ensure it's an array
data: Array.isArray(response.data.requests) ? response.data.requests : [],
```

### 6. **Backend Response Structure Mismatch** 🏗️

```typescript
// Your transform assumes:
// { data: { requests: [...], pagination: { total: 100 } } }

// But backend returns:
// { requests: [...], total: 100 } // Different nesting
// { results: [...], count: 100 } // Different field names
// { items: [...], meta: { total: 100 } } // Different structure
```

### 7. **Network/API Issues** 🌐

- **CORS errors** - Backend doesn't allow your domain
- **Authentication** - Missing or invalid auth headers
- **Wrong endpoint** - URL doesn't exist or wrong method
- **Server errors** - Backend returning 500/400 errors
- **Timeout** - Request taking too long

### 8. **Table Configuration Issues** ⚙️

```typescript
// ❌ WRONG - passing both handler and data
<NcTable
  handler={handler}
  data={staticData} // This overrides handler!
/>

// ❌ WRONG - missing responseConfig
<NcTable
  handler={handler}
  // responseConfig={config} // Missing!
/>

// ✅ CORRECT - proper configuration
<NcTable
  handler={handler}
  responseConfig={responseConfig}
/>
```

## 🔧 Debugging Steps

### Step 1: Check Handler Function

```typescript
const handler = async (params) => {
  console.log("🚀 Request params:", params);

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
    console.log("📥 Response data:", result);

    return result; // ✅ Make sure to return
  } catch (error) {
    console.error("❌ Handler error:", error);
    throw error;
  }
};
```

### Step 2: Debug Transform Function

```typescript
const responseConfig = {
  transformResponse: (response) => {
    console.log("🔄 Transform input:", response);

    const transformed = {
      data: response.data?.requests || [],
      count: response.data?.pagination?.total || 0,
      success: Boolean(response.status),
      message: response.message || "",
      statusCode: 200,
    };

    console.log("✅ Transform output:", transformed);

    // Validate types
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
```

### Step 3: Test Backend Directly

```bash
# Test with curl
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{"PageNumber": 1, "PageSize": 10}'
```

### Step 4: Check Browser Network Tab

1. Open Developer Tools → Network tab
2. Make a request from your table
3. Check the request/response
4. Look for errors (red entries)
5. Verify response structure

## 🎯 Quick Fixes

### Fix 1: Convert Success to Boolean

```typescript
// If status is "success"/"error"
success: response.status === "success",

// If status is 1/0
success: response.status === 1,

// If status is any truthy/falsy value
success: Boolean(response.status),
```

### Fix 2: Ensure Required Fields

```typescript
transformResponse: (response) => ({
  data: response.data?.requests || [],
  count: Number(response.data?.pagination?.total) || 0,
  success: Boolean(response.status),
  message: response.message || "",
  statusCode: 200, // ✅ Always include
});
```

### Fix 3: Handle Missing Data

```typescript
transformResponse: (response) => ({
  data: Array.isArray(response.data?.requests) ? response.data.requests : [],
  count:
    typeof response.data?.pagination?.total === "number"
      ? response.data.pagination.total
      : 0,
  success: Boolean(response.status),
  message: String(response.message || ""),
  statusCode: 200,
});
```

## 🚨 Emergency Checklist

- [ ] Handler function returns the response
- [ ] Transform function includes `statusCode: 200`
- [ ] `success` field is boolean, not string
- [ ] `data` field is an array
- [ ] `count` field is a number
- [ ] Data paths match your backend response structure
- [ ] No JavaScript errors in console
- [ ] Network requests are successful (check Network tab)
- [ ] Backend endpoint is working (test with Postman/curl)
- [ ] CORS is configured correctly

## 🔍 Still Not Working?

1. **Use the debug tool** - Run `DEBUG_RESPONSE_ISSUES.tsx`
2. **Check console logs** - Look for error messages
3. **Test backend separately** - Use Postman or curl
4. **Verify response structure** - Log the actual response
5. **Check network errors** - Look at browser Network tab
