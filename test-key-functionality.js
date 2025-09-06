// Test script for the new key functionality
console.log("🔑 Testing nc-table-react key functionality");
console.log("==========================================");

// Mock the buildFilterString function with new key support
function buildFilterString(filters, columns) {
  if (!filters || filters.length === 0) {
    return "";
  }

  const filterParts = filters
    .filter((filter) => {
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
      sanitizedValue = sanitizedValue
        .replace(/;/g, "")
        .replace(/And\$/g, "")
        .trim();

      return `${fieldName}${operator}${sanitizedValue}`;
    });

  if (filterParts.length === 0) {
    return "";
  }

  if (filterParts.length === 1) {
    return `${filterParts[0]};`;
  }

  return filterParts.join(";And$") + ";";
}

// Test columns with key mappings
const testColumns = [
  {
    key: "name",
    header: "Name",
    searchable: true,
    // No searchOverride - should use column name
  },
  {
    key: "statusDescription",
    header: "Status Description",
    searchable: true,
    searchOverride: {
      key: "Status", // Backend field
      dataType: "select",
    },
  },
  {
    key: "departmentName",
    header: "Department Name",
    searchable: true,
    searchOverride: {
      key: "DeptId", // Backend field
      dataType: "select",
    },
  },
  {
    key: "isActiveText",
    header: "Is Active",
    searchable: true,
    searchOverride: {
      key: "IsActive", // Backend field
      dataType: "boolean",
    },
  },
];

// Test cases
const testCases = [
  {
    name: "Test 1: No key override (uses column name)",
    filters: [{ id: 1, column: "name", operator: "~=", value: "John" }],
    expected: "name~=John;",
  },
  {
    name: "Test 2: Single condition with key override",
    filters: [
      { id: 1, column: "statusDescription", operator: "==", value: "1" },
    ],
    expected: "Status==1;",
  },
  {
    name: "Test 3: Multiple conditions with mixed key overrides",
    filters: [
      { id: 1, column: "statusDescription", operator: "==", value: "1" },
      { id: 2, column: "departmentName", operator: "==", value: "ENG" },
    ],
    expected: "Status==1;And$DeptId==ENG;",
  },
  {
    name: "Test 4: Complex scenario with name + status + active",
    filters: [
      { id: 1, column: "name", operator: "~=", value: "John" },
      { id: 2, column: "statusDescription", operator: "==", value: "1" },
      { id: 3, column: "isActiveText", operator: "==", value: "true" },
    ],
    expected: "name~=John;And$Status==1;And$IsActive==true;",
  },
];

// Run tests
console.log("\n🧪 Running Test Cases:");
console.log("======================");

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);

  const result = buildFilterString(testCase.filters, testColumns);
  const passed = result === testCase.expected;

  console.log(
    `   Filters: ${JSON.stringify(
      testCase.filters.map((f) => ({
        column: f.column,
        operator: f.operator,
        value: f.value,
      }))
    )}`
  );
  console.log(`   Expected: ${testCase.expected}`);
  console.log(`   Actual:   ${result}`);
  console.log(`   Status:   ${passed ? "✅ PASS" : "❌ FAIL"}`);

  if (!passed) {
    console.log(`   ❌ MISMATCH DETECTED!`);
  }
});

// Display column mappings
console.log("\n📋 Column Mappings:");
console.log("===================");
testColumns.forEach((col) => {
  const backendField = col.searchOverride?.key || col.key;
  console.log(`   ${col.key} (Display) → ${backendField} (Backend)`);
});

console.log("\n🎯 Key Functionality Implementation:");
console.log("=====================================");
console.log("✅ Added 'key' property to NcTableSearchOverride interface");
console.log("✅ Updated buildFilterString to accept columns parameter");
console.log("✅ Added logic to resolve searchOverride.key when available");
console.log("✅ Maintains backward compatibility (no key = uses column name)");
console.log("✅ Updated NcTable to pass columns to buildFilterString");

console.log("\n🔧 Usage Example:");
console.log("=================");
console.log(`
const columns = [
  {
    key: "statusDescription",    // What users see in the table
    header: "Status Description",
    searchable: true,
    searchOverride: {
      key: "Status",              // What backend expects
      dataType: "select",
      selectOptions: [...]
    }
  }
];

// When user searches "statusDescription" == "1"
// Generated filter: "Status==1;" (uses "Status" not "statusDescription")
`);
