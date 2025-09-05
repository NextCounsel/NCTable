# Required Code Changes for Filter String Implementation

## 📋 Step-by-Step Implementation Guide

Here are the exact changes you need to make to implement the `${column}${operator}${value};And$` filter format:

## 🔧 Step 1: Add Import to NcTable.tsx

Add this import at the top of `src/components/nc-table/NcTable.tsx`:

```typescript
// Add this import around line 40, after the existing imports
import { buildFilterString } from "./utils/filterUtils";
```

## 🔧 Step 2: Update handleAdvancedSearch Function

Replace the existing `handleAdvancedSearch` function (around lines 240-261) with this:

```typescript
// Advanced search handler
const handleAdvancedSearch = useCallback(
  (filters: SearchFilter[]) => {
    setSearchFilters(filters);
    setCurrentPage(1);

    if (onAdvancedSearch) {
      onAdvancedSearch(filters);
    }

    // 🎯 NEW: Build structured filter string for backend
    const filterString = buildFilterString(filters);
    setSearchTerm(filterString);

    // Use fetchData with the properly formatted filter
    if (handler) {
      fetchData({
        page: 1,
        search: filterString || undefined,
      });
    }
  },
  [onAdvancedSearch, handler, fetchData]
);
```

## 🔧 Step 3: Update fetchData Function

Replace the existing `fetchData` function (around lines 125-199) with this updated version:

```typescript
// Fetch data using the handler
const fetchData = useCallback(
  async (overrideParams?: {
    page?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "Asc" | "Desc";
    size?: number;
  }) => {
    if (!handler || typeof handler !== "function") return;
    if (isRequestInProgress) return; // Prevent multiple simultaneous requests

    setIsRequestInProgress(true);
    setLoading(true);
    setError(null);

    try {
      const filterValue = overrideParams?.search ?? (searchTerm || undefined);

      const params: PaginationData = {
        PageNumber: overrideParams?.page ?? currentPage,
        PageSize: overrideParams?.size ?? effectiveSettings.pageSize,
        Order:
          overrideParams?.sortBy ?? effectiveSettings.sortBy
            ? `${overrideParams?.sortBy ?? effectiveSettings.sortBy};${
                overrideParams?.sortDirection ?? effectiveSettings.sortDirection
              }`
            : undefined,
      };

      // 🎯 Only add Filter property if it has a value
      if (filterValue && filterValue.trim() !== "") {
        params.Filter = filterValue;
      }

      console.log("fetchData called with params:", params);
      console.log("currentPage in fetchData:", params.PageNumber);

      const response = await handler(params);

      if (response && response.Data) {
        setData(response.Data);
        setTotalItems(response.Count || 0);
        setError(null);
      } else {
        setData([]);
        setTotalItems(0);
        setError("No data received from server");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch data";
      console.error("Error fetching table data:", error);

      setData([]);
      setTotalItems(0);
      setError(errorMessage);

      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  },
  [
    handler,
    currentPage,
    effectiveSettings.pageSize,
    effectiveSettings.sortBy,
    effectiveSettings.sortDirection,
    searchTerm,
    isRequestInProgress,
    toast,
  ]
);
```

## 🎯 What These Changes Do

### Before (Current Implementation)

```typescript
// Old crude conversion
const searchTermFromFilters = filters
  .map((filter) => filter.value)
  .join(" ");
// Result: "John Engineering 2023-01-01"

// Old payload
{
  PageNumber: 1,
  PageSize: 10,
  Filter: "John Engineering 2023-01-01", // ❌ No column/operator info
  Order: "name;Asc"
}
```

### After (New Implementation)

```typescript
// New structured conversion
const filterString = buildFilterString(filters);
// Result: "name~=John;And$department==Engineering;And$startDate>2023-01-01;"

// New payload
{
  PageNumber: 1,
  PageSize: 10,
  Filter: "name~=John;And$department==Engineering;And$startDate>2023-01-01;", // ✅ Full structure
  Order: "name;Asc"
}
```

## 📊 Real-World Examples

### Example 1: Single Search Condition

**User searches:** Name contains "John"

**Generated payload:**

```typescript
{
  PageNumber: 1,
  PageSize: 10,
  Filter: "name~=John;"
}
```

### Example 2: Multiple Search Conditions

**User searches:**

1. Name contains "John"
2. Department equals "Engineering"
3. Is Active equals "true"

**Generated payload:**

```typescript
{
  PageNumber: 1,
  PageSize: 10,
  Filter: "name~=John;And$department==Engineering;And$isActive==true;",
  Order: "name;Asc"
}
```

### Example 3: No Search (Reset)

**User clears all filters**

**Generated payload:**

```typescript
{
  PageNumber: 1,
  PageSize: 10,
  Order: "name;Asc"
  // No Filter property included
}
```

## 🧪 Testing Your Implementation

Add this to test the filter string generation:

```typescript
// Add this to your component for testing (remove in production)
useEffect(() => {
  if (process.env.NODE_ENV === "development") {
    // Test the filter string builder
    import("./utils/filterUtils").then(({ testFilterStringBuilder }) => {
      testFilterStringBuilder();
    });
  }
}, []);
```

## 🎯 Expected Console Output

When you implement this and test with multiple search conditions, you should see:

```
fetchData called with params: {
  PageNumber: 1,
  PageSize: 10,
  Filter: "name~=John;And$department==Engineering;And$salary>50000;",
  Order: "name;Asc"
}
```

## ✅ Benefits of This Implementation

1. **Exact Backend Format**: Matches your required `${column}${operator}${value};And$` pattern
2. **Conditional Filter Property**: Only includes `Filter` when there are actual search conditions
3. **Value Sanitization**: Prevents format-breaking characters (semicolons, And$ sequences)
4. **Empty Value Filtering**: Automatically excludes empty/null search conditions
5. **Backward Compatible**: Works with existing NcTable props and handlers
6. **Type Safe**: Maintains TypeScript safety throughout

## 🚨 Important Notes

1. **File Path**: Make sure you create the `filterUtils.ts` file in the correct location: `src/components/nc-table/utils/filterUtils.ts`

2. **Import Path**: The import in `NcTable.tsx` should be: `import { buildFilterString } from './utils/filterUtils';`

3. **Testing**: Test with various combinations of search conditions to ensure the format is correct

4. **Backend Validation**: Make sure your backend can properly parse the `And$` separator and the trailing semicolon

This implementation will give you exactly the filter string format your backend expects!
