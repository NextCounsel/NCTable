# NcTableSearch Data Structure Analysis

## 📋 Data Structure When User Clicks "Apply" with Multiple Conditions

When a user creates multiple search conditions and clicks "Apply", the system generates an array of `SearchFilter` objects. Here's the complete breakdown:

## 🔍 Current Implementation Structure

### Interface Definitions

```typescript
// Current NcTableSearch interfaces
interface SearchCondition {
  id: number;
  column: string;
  operator: string;
  value: string; // ⚠️ Always string regardless of actual data type
}

interface SearchFilter {
  id: number;
  column: string;
  operator: string;
  value: string; // Same as SearchCondition
}
```

### Example User Scenario

Let's say a user creates these search conditions:

1. **Name** contains "John"
2. **Department** equals "Engineering"
3. **Start Date** is greater than "2023-01-01"
4. **Is Active** equals "true"
5. **Salary** is greater than "50000"

## 📊 Resulting Data Structure

### Current Implementation Output

```typescript
// Array passed to onSearchApplied callback
const filters: SearchFilter[] = [
  {
    id: 1,
    column: "name",
    operator: "~=",
    value: "John",
  },
  {
    id: 2,
    column: "department",
    operator: "==",
    value: "Engineering",
  },
  {
    id: 3,
    column: "startDate",
    operator: ">",
    value: "2023-01-01", // ⚠️ Date as string
  },
  {
    id: 4,
    column: "isActive",
    operator: "==",
    value: "true", // ⚠️ Boolean as string
  },
  {
    id: 5,
    column: "salary",
    operator: ">",
    value: "50000", // ⚠️ Number as string
  },
];
```

### How Data Flows Through the System

```typescript
// 1. In NcTableSearch.tsx - applySearch function
const applySearch = () => {
  const validConditions = searchConditions.filter(
    (condition) => condition.value.trim() !== ""
  );

  if (validConditions.length > 0) {
    const newFilters = [...searchFilters, ...validConditions];
    setSearchFilters(newFilters);
    onSearchApplied(newFilters); // 🎯 This is what gets passed up
  }
};

// 2. In NcTable.tsx - handleAdvancedSearch callback
const handleAdvancedSearch = useCallback(
  (filters: SearchFilter[]) => {
    setSearchFilters(filters);
    setCurrentPage(1);

    if (onAdvancedSearch) {
      onAdvancedSearch(filters); // 🎯 Passed to external handler
    }

    // ⚠️ Current crude conversion for backend
    const searchTermFromFilters = filters
      .map((filter) => filter.value)
      .join(" ");
    setSearchTerm(searchTermFromFilters);

    if (handler) {
      fetchData({ page: 1, search: searchTermFromFilters });
    }
  },
  [onAdvancedSearch, handler, fetchData]
);
```

## 🚨 Issues with Current Structure

### 1. **Type Loss**

```typescript
// ❌ Problem: All values become strings
{
  column: "startDate",
  operator: ">",
  value: "2023-01-01"  // Should be Date object
}

{
  column: "isActive",
  operator: "==",
  value: "true"        // Should be boolean
}
```

### 2. **Backend Conversion Issues**

```typescript
// ❌ Current crude conversion
const searchTermFromFilters = filters
  .map((filter) => filter.value) // "John Engineering 2023-01-01 true 50000"
  .join(" ");

// ❌ Backend receives: "John Engineering 2023-01-01 true 50000"
// Backend has no idea what columns these values belong to!
```

### 3. **Missing Metadata**

- No data type information
- No validation status
- No column configuration reference
- No logical operators (AND/OR) between conditions

## ✅ Enhanced Data Structure (From Our Enhanced Example)

### Enhanced Interface Definitions

```typescript
// Enhanced interfaces with proper typing
interface SearchCondition<T = unknown> {
  id: number;
  column: string;
  operator: SearchOperator;
  value: T; // 🎯 Type-safe value
  dataType: SearchDataType; // 🎯 Metadata
  isValid?: boolean; // 🎯 Validation status
  errorMessage?: string; // 🎯 Error feedback
}

interface SearchFilter<T = unknown> extends SearchCondition<T> {
  appliedAt?: Date; // 🎯 Timestamp
  columnConfig?: ColumnConfig; // 🎯 Reference to column
}
```

### Enhanced Output Example

```typescript
// Enhanced array with proper types and metadata
const enhancedFilters: SearchFilter[] = [
  {
    id: 1,
    column: "name",
    operator: "~=",
    value: "John", // string (correct)
    dataType: "text",
    isValid: true,
    appliedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: 2,
    column: "department",
    operator: "==",
    value: "Engineering", // string (correct)
    dataType: "select",
    isValid: true,
    appliedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: 3,
    column: "startDate",
    operator: ">",
    value: new Date("2023-01-01"), // 🎯 Actual Date object
    dataType: "date",
    isValid: true,
    appliedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: 4,
    column: "isActive",
    operator: "==",
    value: true, // 🎯 Actual boolean
    dataType: "boolean",
    isValid: true,
    appliedAt: new Date("2024-01-15T10:30:00Z"),
  },
  {
    id: 5,
    column: "salary",
    operator: ">",
    value: 50000, // 🎯 Actual number
    dataType: "number",
    isValid: true,
    appliedAt: new Date("2024-01-15T10:30:00Z"),
  },
];
```

## 🔄 Backend Serialization Options

### Option 1: Structured JSON Format

```typescript
// Better backend format
interface BackendSearchFilter {
  column: string;
  operator: string;
  value: unknown;
  dataType: string;
  metadata?: {
    originalValue?: unknown;
    format?: string;
    timezone?: string;
  };
}

// Example backend payload
const backendFilters: BackendSearchFilter[] = [
  {
    column: "name",
    operator: "~=",
    value: "John",
    dataType: "text",
  },
  {
    column: "startDate",
    operator: ">",
    value: "2023-01-01T00:00:00.000Z", // ISO string for dates
    dataType: "date",
    metadata: {
      originalValue: "2023-01-01",
      format: "YYYY-MM-DD",
      timezone: "UTC",
    },
  },
  {
    column: "isActive",
    operator: "==",
    value: true,
    dataType: "boolean",
  },
];
```

### Option 2: Query String Format

```typescript
// Alternative: Structured query string
const queryString = filters
  .map((filter) => {
    const { column, operator, value, dataType } = filter;
    return `${column}${operator}${encodeValue(value, dataType)}`;
  })
  .join("&");

// Result: "name~=John&startDate>2023-01-01&isActive==true"
```

### Option 3: SQL-like Format

```typescript
// SQL-like structured format
const sqlLikeFilter = filters
  .map((filter) => {
    const { column, operator, value, dataType } = filter;
    const formattedValue = formatValueForSql(value, dataType);
    return `${column} ${operator} ${formattedValue}`;
  })
  .join(" AND ");

// Result: "name LIKE '%John%' AND startDate > '2023-01-01' AND isActive = true"
```

## 📝 Real-World Usage Examples

### Frontend Handler

```typescript
// How your app would handle the search filters
const handleAdvancedSearch = (filters: SearchFilter[]) => {
  console.log("🔍 Search filters applied:", filters);

  // Example: Send to backend
  const backendPayload = {
    filters: filters.map((f) => ({
      column: f.column,
      operator: f.operator,
      value: f.value,
      dataType: f.dataType,
    })),
    pagination: {
      page: 1,
      size: 10,
    },
  };

  // API call
  fetchDataWithFilters(backendPayload);

  // Example: Local filtering (for static data)
  const filteredData = applyFiltersToData(originalData, filters);
  setFilteredData(filteredData);
};
```

### Backend Processing

```typescript
// How backend might process the filters
interface ApiSearchRequest {
  filters: BackendSearchFilter[];
  pagination: {
    page: number;
    size: number;
  };
}

const processSearchFilters = (filters: BackendSearchFilter[]) => {
  return filters.map((filter) => {
    switch (filter.dataType) {
      case "date":
        return {
          ...filter,
          value: new Date(filter.value as string),
        };
      case "boolean":
        return {
          ...filter,
          value: Boolean(filter.value),
        };
      case "number":
        return {
          ...filter,
          value: Number(filter.value),
        };
      default:
        return filter;
    }
  });
};
```

## 🎯 Key Takeaways

### Current Implementation

- ✅ **Simple structure** - Easy to understand
- ✅ **Accumulative filters** - Previous filters persist
- ❌ **Type unsafe** - All values are strings
- ❌ **Poor backend integration** - Crude string concatenation
- ❌ **No metadata** - Missing important context

### Enhanced Implementation Benefits

- ✅ **Type safety** - Preserves actual data types
- ✅ **Rich metadata** - Includes validation and configuration info
- ✅ **Better backend integration** - Structured, meaningful data
- ✅ **Extensible** - Easy to add new features
- ✅ **Debuggable** - Clear data flow and error tracking

### Migration Path

1. **Phase 1**: Add data type awareness to existing structure
2. **Phase 2**: Implement proper value typing
3. **Phase 3**: Enhance backend serialization
4. **Phase 4**: Add advanced metadata and features

The current implementation works for basic use cases, but the enhanced structure provides much better developer experience, type safety, and backend integration capabilities.
