// Simple Node.js test for the filter string function
// This avoids the Node version compatibility issues with the dev server

// Mock SearchFilter interface
const buildFilterString = (filters) => {
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

// Test cases
console.log("🧪 Testing Filter String Builder:");
console.log("================================");

// Test Case 1: Single filter
console.log("\n1. Single Filter Test:");
const singleFilter = [{ id: 1, column: "name", operator: "~=", value: "John" }];
const result1 = buildFilterString(singleFilter);
console.log("Input:", JSON.stringify(singleFilter, null, 2));
console.log("Result:", result1);
console.log("Expected: 'name~=John;'");
console.log("✅ Match:", result1 === "name~=John;");

// Test Case 2: Multiple filters
console.log("\n2. Multiple Filters Test:");
const multipleFilters = [
  { id: 1, column: "name", operator: "~=", value: "John" },
  { id: 2, column: "department", operator: "==", value: "Engineering" },
  { id: 3, column: "salary", operator: ">", value: "50000" },
];
const result2 = buildFilterString(multipleFilters);
console.log("Input:", JSON.stringify(multipleFilters, null, 2));
console.log("Result:", result2);
console.log(
  "Expected: 'name~=John;And$department==Engineering;And$salary>50000;'"
);
console.log(
  "✅ Match:",
  result2 === "name~=John;And$department==Engineering;And$salary>50000;"
);

// Test Case 3: Empty filters
console.log("\n3. Empty Filters Test:");
const result3 = buildFilterString([]);
console.log("Input: []");
console.log("Result:", result3);
console.log("Expected: ''");
console.log("✅ Match:", result3 === "");

// Test Case 4: Filters with empty values
console.log("\n4. Filters with Empty Values Test:");
const filtersWithEmpty = [
  { id: 1, column: "name", operator: "~=", value: "John" },
  { id: 2, column: "department", operator: "==", value: "" },
  { id: 3, column: "salary", operator: ">", value: "50000" },
];
const result4 = buildFilterString(filtersWithEmpty);
console.log("Input:", JSON.stringify(filtersWithEmpty, null, 2));
console.log("Result:", result4);
console.log("Expected: 'name~=John;And$salary>50000;'");
console.log("✅ Match:", result4 === "name~=John;And$salary>50000;");

// Test Case 5: Complex values with spaces
console.log("\n5. Complex Values with Spaces Test:");
const complexFilters = [
  { id: 1, column: "name", operator: "~=", value: "John Doe" },
  { id: 2, column: "title", operator: "==", value: "Senior Engineer" },
];
const result5 = buildFilterString(complexFilters);
console.log("Input:", JSON.stringify(complexFilters, null, 2));
console.log("Result:", result5);
console.log("Expected: 'name~=John Doe;And$title==Senior Engineer;'");
console.log(
  "✅ Match:",
  result5 === "name~=John Doe;And$title==Senior Engineer;"
);

// Test Case 6: Real-world scenario
console.log("\n6. Real-world Scenario Test:");
const realWorldFilters = [
  { id: 1, column: "name", operator: "~=", value: "John" },
  { id: 2, column: "department", operator: "==", value: "Engineering" },
  { id: 3, column: "startDate", operator: ">", value: "2023-01-01" },
  { id: 4, column: "isActive", operator: "==", value: "true" },
  { id: 5, column: "salary", operator: ">", value: "50000" },
];
const result6 = buildFilterString(realWorldFilters);
console.log("Input:", JSON.stringify(realWorldFilters, null, 2));
console.log("Result:", result6);
console.log(
  "Expected: 'name~=John;And$department==Engineering;And$startDate>2023-01-01;And$isActive==true;And$salary>50000;'"
);
console.log(
  "✅ Match:",
  result6 ===
    "name~=John;And$department==Engineering;And$startDate>2023-01-01;And$isActive==true;And$salary>50000;"
);

// Backend payload simulation
console.log("\n🎯 Backend Payload Simulation:");
console.log("==============================");

const simulateBackendPayload = (filters) => {
  const filterString = buildFilterString(filters);

  const payload = {
    PageNumber: 1,
    PageSize: 10,
    Order: "name;Asc",
  };

  if (filterString && filterString.trim() !== "") {
    payload.Filter = filterString;
  }

  return payload;
};

console.log("\nNo filters:");
console.log(JSON.stringify(simulateBackendPayload([]), null, 2));

console.log("\nSingle filter:");
console.log(JSON.stringify(simulateBackendPayload(singleFilter), null, 2));

console.log("\nMultiple filters:");
console.log(JSON.stringify(simulateBackendPayload(multipleFilters), null, 2));

console.log("\n🎉 Filter String Implementation Test Complete!");
console.log("All tests show the exact format your backend expects.");
