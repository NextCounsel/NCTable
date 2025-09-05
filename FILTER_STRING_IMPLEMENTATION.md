# NcTableSearch Filter String Implementation

## 🎯 Backend Filter Format Requirements

Your backend expects a specific filter string format that needs to be constructed from the search conditions:

### Pattern Format

- **Single condition**: `${column}${operator}${value};`
- **Multiple conditions**: `${column}${operator}${value};And$${column}${operator}${value};And$${column}${operator}${value};`

### Integration with Pagination

```typescript
interface PaginationData {
  PageNumber: number;
  PageSize: number;
  Order?: string;
  Filter?: string; // 🎯 Only include when has value
}
```

## 🔧 Implementation Solution

### 1. Filter String Builder Function

```typescript
// Add this utility function to NcTableSearch or utils
export const buildFilterString = (filters: SearchFilter[]): string => {
  if (!filters || filters.length === 0) {
    return "";
  }

  const filterParts = filters
    .filter((filter) => filter.value && filter.value.toString().trim() !== "")
    .map((filter) => {
      const { column, operator, value } = filter;
      // Ensure value is properly formatted (handle special characters, spaces, etc.)
      const sanitizedValue = String(value).replace(/;/g, ""); // Remove semicolons to avoid breaking format
      return `${column}${operator}${sanitizedValue}`;
    });

  if (filterParts.length === 0) {
    return "";
  }

  // Join with 'And$' separator and add trailing semicolon
  return filterParts.join(";And$") + ";";
};
```

### 2. Enhanced Advanced Search Handler

Update the `handleAdvancedSearch` function in `NcTable.tsx`:

```typescript
// In NcTable.tsx - Replace existing handleAdvancedSearch
const handleAdvancedSearch = useCallback(
  (filters: SearchFilter[]) => {
    setSearchFilters(filters);
    setCurrentPage(1);

    if (onAdvancedSearch) {
      onAdvancedSearch(filters);
    }

    // 🎯 NEW: Build structured filter string for backend
    const filterString = buildFilterString(filters);

    // Update search term for internal state
    setSearchTerm(filterString || "");

    // Use fetchData with the properly formatted filter
    if (handler) {
      fetchData({
        page: 1,
        search: filterString || undefined, // Only pass if has value
      });
    }
  },
  [onAdvancedSearch, handler, fetchData]
);
```

### 3. Updated fetchData Function

Modify the `fetchData` function to properly handle the Filter property:

```typescript
// In NcTable.tsx - Update fetchData function
const fetchData = useCallback(
  async (overrideParams?: {
    page?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "Asc" | "Desc";
    size?: number;
  }) => {
    if (!handler || typeof handler !== "function") return;
    if (isRequestInProgress) return;

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
        // 🎯 Only include Filter if it has a value
        ...(filterValue && { Filter: filterValue }),
      };

      console.log("fetchData called with params:", params);

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

## 📝 Real-World Examples

### Example 1: Single Condition

**User Input:**

- Name contains "John"

**Generated Filter String:**

```
name~=John;
```

**Backend Payload:**

```typescript
{
  PageNumber: 1,
  PageSize: 10,
  Filter: "name~=John;"
}
```

### Example 2: Multiple Conditions

**User Input:**

1. Name contains "John"
2. Department equals "Engineering"
3. Start Date greater than "2023-01-01"
4. Is Active equals "true"
5. Salary greater than "50000"

**Generated Filter String:**

```
name~=John;And$department==Engineering;And$startDate>2023-01-01;And$isActive==true;And$salary>50000;
```

**Backend Payload:**

```typescript
{
  PageNumber: 1,
  PageSize: 10,
  Order: "name;Asc",
  Filter: "name~=John;And$department==Engineering;And$startDate>2023-01-01;And$isActive==true;And$salary>50000;"
}
```

### Example 3: No Filters

**User Input:**

- No search conditions applied

**Backend Payload:**

```typescript
{
  PageNumber: 1,
  PageSize: 10,
  Order: "name;Asc"
  // 🎯 No Filter property included
}
```

## 🔧 Complete Implementation

### 1. Add Utility Function

Create or update `src/components/nc-table/utils/filterUtils.ts`:

```typescript
import { SearchFilter } from "../types";

export const buildFilterString = (filters: SearchFilter[]): string => {
  if (!filters || filters.length === 0) {
    return "";
  }

  const filterParts = filters
    .filter((filter) => {
      // Only include filters with non-empty values
      const value = filter.value;
      return (
        value !== null && value !== undefined && String(value).trim() !== ""
      );
    })
    .map((filter) => {
      const { column, operator, value } = filter;

      // Sanitize value to prevent breaking the format
      let sanitizedValue = String(value);

      // Handle special characters that might break the format
      sanitizedValue = sanitizedValue
        .replace(/;/g, "") // Remove semicolons
        .replace(/And\$/g, "") // Remove And$ sequences
        .trim();

      // Handle spaces in values (you might want to encode them)
      if (sanitizedValue.includes(" ")) {
        // Option 1: Replace spaces with underscores
        // sanitizedValue = sanitizedValue.replace(/ /g, '_');
        // Option 2: URL encode spaces
        // sanitizedValue = sanitizedValue.replace(/ /g, '%20');
        // Option 3: Keep spaces as-is (depends on your backend)
        // Leave as-is
      }

      return `${column}${operator}${sanitizedValue}`;
    });

  if (filterParts.length === 0) {
    return "";
  }

  // Single condition: just add semicolon
  if (filterParts.length === 1) {
    return `${filterParts[0]};`;
  }

  // Multiple conditions: join with And$ and add trailing semicolon
  return filterParts.join(";And$") + ";";
};

// Helper function for testing
export const parseFilterString = (
  filterString: string
): Array<{ column: string; operator: string; value: string }> => {
  if (!filterString || filterString.trim() === "") {
    return [];
  }

  // Remove trailing semicolon
  const cleanString = filterString.replace(/;$/, "");

  // Split by And$
  const parts = cleanString.split(";And$");

  return parts.map((part) => {
    // Parse each part to extract column, operator, and value
    // This is a simple implementation - you might need more sophisticated parsing
    const match = part.match(
      /^(.+?)(==|!=|>=|<=|>|<|~=|!~=|_=|!_=|\|=|!\|=)(.+)$/
    );

    if (match) {
      const [, column, operator, value] = match;
      return { column, operator, value };
    }

    // Fallback if parsing fails
    return { column: "", operator: "", value: part };
  });
};
```

### 2. Update NcTable.tsx

```typescript
// Add import at the top
import { buildFilterString } from "./utils/filterUtils";

// Update the handleAdvancedSearch function (around line 240)
const handleAdvancedSearch = useCallback(
  (filters: SearchFilter[]) => {
    setSearchFilters(filters);
    setCurrentPage(1);

    if (onAdvancedSearch) {
      onAdvancedSearch(filters);
    }

    // 🎯 Build structured filter string for backend
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

// Update fetchData function (around line 125)
const fetchData = useCallback(
  async (overrideParams?: {
    page?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "Asc" | "Desc";
    size?: number;
  }) => {
    if (!handler || typeof handler !== "function") return;
    if (isRequestInProgress) return;

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

## 🧪 Testing Examples

### Test Case 1: Single Filter

```typescript
const filters = [{ id: 1, column: "name", operator: "~=", value: "John" }];
const result = buildFilterString(filters);
// Expected: "name~=John;"
```

### Test Case 2: Multiple Filters

```typescript
const filters = [
  { id: 1, column: "name", operator: "~=", value: "John" },
  { id: 2, column: "department", operator: "==", value: "Engineering" },
  { id: 3, column: "salary", operator: ">", value: "50000" },
];
const result = buildFilterString(filters);
// Expected: "name~=John;And$department==Engineering;And$salary>50000;"
```

### Test Case 3: Empty Filters

```typescript
const filters = [];
const result = buildFilterString(filters);
// Expected: ""
```

### Test Case 4: Filters with Empty Values

```typescript
const filters = [
  { id: 1, column: "name", operator: "~=", value: "John" },
  { id: 2, column: "department", operator: "==", value: "" }, // Empty value
  { id: 3, column: "salary", operator: ">", value: "50000" },
];
const result = buildFilterString(filters);
// Expected: "name~=John;And$salary>50000;" (empty value filtered out)
```

## 🎯 Key Benefits

1. **Exact Backend Format**: Matches your required `${column}${operator}${value};` pattern
2. **Multiple Condition Support**: Properly joins with `And$` separator
3. **Conditional Filter Property**: Only includes `Filter` in payload when there are actual filters
4. **Value Sanitization**: Prevents format-breaking characters
5. **Empty Value Handling**: Filters out empty/null values automatically
6. **Backward Compatible**: Works with existing NcTable structure

This implementation will generate the exact filter string format your backend expects while maintaining the current NcTableSearch functionality!
