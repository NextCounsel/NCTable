import { SearchFilter } from "../components";
import { Column } from "../types";

/**
 * Builds a filter string in the format required by the backend:
 * - Single condition: `${column}${operator}${value}`
 * - Multiple conditions: `${column}${operator}${value};And$${column}${operator}${value}`
 *
 * @param filters - Array of search filters
 * @param columns - Array of column definitions (used to resolve searchOverride.key)
 */
export const buildFilterString = (
  filters: SearchFilter[],
  columns?: Column<any>[]
): string => {
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

      // Resolve the actual field name to use for backend query
      let fieldName = column;
      if (columns) {
        const columnDef = columns.find((col) => col.key === column);
        if (columnDef?.searchOverride?.key) {
          fieldName = columnDef.searchOverride.key;
        }
      }

      // Sanitize value to prevent breaking the format
      let sanitizedValue = String(value);

      // Handle special characters that might break the format
      sanitizedValue = sanitizedValue
        .replace(/;/g, "") // Remove semicolons
        .replace(/And\$/g, "") // Remove And$ sequences
        .trim();

      return `${fieldName}${operator}${sanitizedValue}`;
    });

  if (filterParts.length === 0) {
    return "";
  }

  // Single condition: no semicolon
  if (filterParts.length === 1) {
    return filterParts[0];
  }

  // Multiple conditions: join with And$ (no trailing semicolon)
  return filterParts.join(";And$");
};

/**
 * Helper function for testing and debugging - parses a filter string back into components
 */
export const parseFilterString = (
  filterString: string
): Array<{
  column: string;
  operator: string;
  value: string;
}> => {
  if (!filterString || filterString.trim() === "") {
    return [];
  }

  // Remove trailing semicolon
  const cleanString = filterString.replace(/;$/, "");

  // Split by And$
  const parts = cleanString.split(";And$");

  return parts.map((part) => {
    // Parse each part to extract column, operator, and value
    // Match operators in order of specificity (longer operators first)
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

/**
 * Example usage and test cases
 */
export const testFilterStringBuilder = () => {
  console.log("Testing buildFilterString function:");

  // Test Case 1: Single filter
  const singleFilter = [
    { id: 1, column: "name", operator: "~=", value: "John" },
  ];
  console.log("Single filter:", buildFilterString(singleFilter));
  // Expected: "name~=John"

  // Test Case 2: Multiple filters
  const multipleFilters = [
    { id: 1, column: "name", operator: "~=", value: "John" },
    { id: 2, column: "department", operator: "==", value: "Engineering" },
    { id: 3, column: "salary", operator: ">", value: "50000" },
  ];
  console.log("Multiple filters:", buildFilterString(multipleFilters));
  // Expected: "name~=John;And$department==Engineering;And$salary>50000"

  // Test Case 3: Empty filters
  console.log("Empty filters:", buildFilterString([]));
  // Expected: ""

  // Test Case 4: Filters with empty values
  const filtersWithEmpty = [
    { id: 1, column: "name", operator: "~=", value: "John" },
    { id: 2, column: "department", operator: "==", value: "" },
    { id: 3, column: "salary", operator: ">", value: "50000" },
  ];
  console.log(
    "Filters with empty values:",
    buildFilterString(filtersWithEmpty)
  );
  // Expected: "name~=John;And$salary>50000"

  // Test Case 5: Complex values with spaces
  const complexFilters = [
    { id: 1, column: "name", operator: "~=", value: "John Doe" },
    { id: 2, column: "title", operator: "==", value: "Senior Engineer" },
  ];
  console.log("Complex values:", buildFilterString(complexFilters));
  // Expected: "name~=John Doe;And$title==Senior Engineer"
};
