# 🔌 NC-Table Backend API Integration Guide

This guide shows you exactly how to integrate nc-table with your backend API, including the specific filter format you requested.

## 🎯 Backend API Contract

### Request Format

Your backend will receive this exact structure:

```typescript
interface PaginationData {
  PageNumber: number; // Current page (1-based)
  PageSize: number; // Items per page
  Order?: string; // "columnName;Asc" or "columnName;Desc"
  Filter?: string; // "column1==value1;And$column2>value2;"
}
```

### Response Format

#### Default Format (IApiResponse)

Your backend should return this format by default:

```typescript
interface IApiResponse<T> {
  Succeeded: boolean; // Operation success status
  Data: T[]; // Array of items for current page
  Count: number; // Total number of items (for pagination)
  Message?: string; // Optional success/error message
}
```

#### Custom Response Formats

**NEW FEATURE**: You can now use any response format by configuring the `responseConfig` prop:

```typescript
// 1. REST API Format
const restApiConfig = {
  dataField: "data",
  countField: "total",
  successField: "success",
  messageField: "message",
  statusCodeField: "status",
};

// 2. Laravel API Resource Format
const laravelConfig = {
  dataField: "data",
  countField: "meta.total",
  successField: "success",
  messageField: "message",
  statusCodeField: "status",
};

// 3. Django REST Framework Format
const djangoConfig = {
  dataField: "results",
  countField: "count",
  successField: "success",
  messageField: "message",
  statusCodeField: "status",
};

// 4. Custom Transform Function
const customConfig = {
  transformResponse: (response) => ({
    data: response.response.users,
    count: response.response.pagination.total_records,
    success: response.status.ok,
    message: response.status.message,
    statusCode: response.status.code,
  }),
};
```

## 🔍 Filter String Format

The table generates filter strings in this exact format:

### Single Condition

```
"name~=John;"
```

### Multiple Conditions

```
"name~=John;And$department==Engineering;And$salary>50000;"
```

### Pattern Breakdown

- **Format**: `${column}${operator}${value};`
- **Multiple**: Joined with `;And$`
- **Always ends**: With semicolon `;`
- **Only included**: When filters exist (conditional property)

## 🚀 Implementation Examples

### 1. Node.js + Express Backend

```javascript
// Backend API endpoint
app.post("/api/employees", async (req, res) => {
  try {
    const { PageNumber, PageSize, Order, Filter } = req.body;

    console.log("Received request:", req.body);

    // Build database query
    let query = Employee.findAll();

    // Apply filtering
    if (Filter) {
      const whereConditions = parseFilterString(Filter);
      query = query.where(whereConditions);
    }

    // Apply sorting
    if (Order) {
      const [column, direction] = Order.split(";");
      query = query.orderBy(column, direction.toLowerCase());
    }

    // Apply pagination
    const offset = (PageNumber - 1) * PageSize;
    const results = await query.offset(offset).limit(PageSize).exec();
    const totalCount = await Employee.countDocuments(whereConditions || {});

    res.json({
      Succeeded: true,
      Data: results,
      Count: totalCount,
      Message: `Retrieved ${results.length} employees`,
    });
  } catch (error) {
    res.status(500).json({
      Succeeded: false,
      Data: [],
      Count: 0,
      Message: error.message,
    });
  }
});

// Filter string parser
function parseFilterString(filterString) {
  if (!filterString) return {};

  // Remove trailing semicolon and split by And$
  const conditions = filterString.replace(/;$/, "").split(";And$");
  const whereConditions = {};

  conditions.forEach((condition) => {
    // Parse each condition: column + operator + value
    const match = condition.match(
      /^(.+?)(==|!=|>=|<=|>|<|~=|!~=|_=|!_=|\|=|!\|=)(.+)$/
    );

    if (match) {
      const [, column, operator, value] = match;

      switch (operator) {
        case "==":
          whereConditions[column] = value;
          break;
        case "!=":
          whereConditions[column] = { $ne: value };
          break;
        case ">":
          whereConditions[column] = { $gt: parseFloat(value) || value };
          break;
        case ">=":
          whereConditions[column] = { $gte: parseFloat(value) || value };
          break;
        case "<":
          whereConditions[column] = { $lt: parseFloat(value) || value };
          break;
        case "<=":
          whereConditions[column] = { $lte: parseFloat(value) || value };
          break;
        case "~=":
          whereConditions[column] = { $regex: value, $options: "i" };
          break;
        case "!~=":
          whereConditions[column] = { $not: { $regex: value, $options: "i" } };
          break;
        case "_=":
          whereConditions[column] = { $regex: `^${value}`, $options: "i" };
          break;
        case "!_=":
          whereConditions[column] = {
            $not: { $regex: `^${value}`, $options: "i" },
          };
          break;
        case "|=":
          whereConditions[column] = { $regex: `${value}$`, $options: "i" };
          break;
        case "!|=":
          whereConditions[column] = {
            $not: { $regex: `${value}$`, $options: "i" },
          };
          break;
      }
    }
  });

  return whereConditions;
}
```

### 2. .NET Core Backend

```csharp
[HttpPost("employees")]
public async Task<IActionResult> GetEmployees([FromBody] PaginationData request)
{
    try
    {
        Console.WriteLine($"Received request: {JsonSerializer.Serialize(request)}");

        var query = _context.Employees.AsQueryable();

        // Apply filtering
        if (!string.IsNullOrEmpty(request.Filter))
        {
            query = ApplyFilter(query, request.Filter);
        }

        // Apply sorting
        if (!string.IsNullOrEmpty(request.Order))
        {
            var orderParts = request.Order.Split(';');
            var column = orderParts[0];
            var direction = orderParts.Length > 1 ? orderParts[1] : "Asc";

            query = direction == "Desc"
                ? query.OrderByDescending(e => EF.Property<object>(e, column))
                : query.OrderBy(e => EF.Property<object>(e, column));
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply pagination
        var results = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return Ok(new ApiResponse<Employee>
        {
            Succeeded = true,
            Data = results,
            Count = totalCount,
            Message = $"Retrieved {results.Count} employees"
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ApiResponse<Employee>
        {
            Succeeded = false,
            Data = new List<Employee>(),
            Count = 0,
            Message = ex.Message
        });
    }
}

private IQueryable<Employee> ApplyFilter(IQueryable<Employee> query, string filterString)
{
    if (string.IsNullOrEmpty(filterString)) return query;

    // Remove trailing semicolon and split by And$
    var conditions = filterString.TrimEnd(';').Split(";And$");

    foreach (var condition in conditions)
    {
        var match = Regex.Match(condition, @"^(.+?)(==|!=|>=|<=|>|<|~=|!~=|_=|!_=|\|=|!\|=)(.+)$");

        if (match.Success)
        {
            var column = match.Groups[1].Value;
            var op = match.Groups[2].Value;
            var value = match.Groups[3].Value;

            query = op switch
            {
                "==" => query.Where(e => EF.Property<string>(e, column) == value),
                "!=" => query.Where(e => EF.Property<string>(e, column) != value),
                "~=" => query.Where(e => EF.Property<string>(e, column).Contains(value)),
                "!~=" => query.Where(e => !EF.Property<string>(e, column).Contains(value)),
                "_=" => query.Where(e => EF.Property<string>(e, column).StartsWith(value)),
                "!_=" => query.Where(e => !EF.Property<string>(e, column).StartsWith(value)),
                "|=" => query.Where(e => EF.Property<string>(e, column).EndsWith(value)),
                "!|=" => query.Where(e => !EF.Property<string>(e, column).EndsWith(value)),
                ">" => query.Where(e => EF.Property<decimal>(e, column) > decimal.Parse(value)),
                ">=" => query.Where(e => EF.Property<decimal>(e, column) >= decimal.Parse(value)),
                "<" => query.Where(e => EF.Property<decimal>(e, column) < decimal.Parse(value)),
                "<=" => query.Where(e => EF.Property<decimal>(e, column) <= decimal.Parse(value)),
                _ => query
            };
        }
    }

    return query;
}
```

### 3. Python + FastAPI Backend

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import re

class PaginationData(BaseModel):
    PageNumber: int
    PageSize: int
    Order: Optional[str] = None
    Filter: Optional[str] = None

class ApiResponse(BaseModel):
    Succeeded: bool
    Data: List[dict]
    Count: int
    Message: Optional[str] = None

@app.post("/api/employees")
async def get_employees(request: PaginationData):
    try:
        print(f"Received request: {request.dict()}")

        # Start with base query
        query = db.session.query(Employee)

        # Apply filtering
        if request.Filter:
            query = apply_filter(query, request.Filter)

        # Apply sorting
        if request.Order:
            column, direction = request.Order.split(';')
            if direction.lower() == 'desc':
                query = query.order_by(getattr(Employee, column).desc())
            else:
                query = query.order_by(getattr(Employee, column))

        # Get total count
        total_count = query.count()

        # Apply pagination
        offset = (request.PageNumber - 1) * request.PageSize
        results = query.offset(offset).limit(request.PageSize).all()

        return ApiResponse(
            Succeeded=True,
            Data=[employee.to_dict() for employee in results],
            Count=total_count,
            Message=f"Retrieved {len(results)} employees"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def apply_filter(query, filter_string):
    if not filter_string:
        return query

    # Remove trailing semicolon and split by And$
    conditions = filter_string.rstrip(';').split(';And$')

    for condition in conditions:
        match = re.match(r'^(.+?)(==|!=|>=|<=|>|<|~=|!~=|_=|!_=|\|=|!\|=)(.+)$', condition)

        if match:
            column, operator, value = match.groups()

            if operator == '==':
                query = query.filter(getattr(Employee, column) == value)
            elif operator == '!=':
                query = query.filter(getattr(Employee, column) != value)
            elif operator == '~=':
                query = query.filter(getattr(Employee, column).contains(value))
            elif operator == '!~=':
                query = query.filter(~getattr(Employee, column).contains(value))
            elif operator == '_=':
                query = query.filter(getattr(Employee, column).startswith(value))
            elif operator == '!_=':
                query = query.filter(~getattr(Employee, column).startswith(value))
            elif operator == '|=':
                query = query.filter(getattr(Employee, column).endswith(value))
            elif operator == '!|=':
                query = query.filter(~getattr(Employee, column).endswith(value))
            elif operator == '>':
                query = query.filter(getattr(Employee, column) > float(value))
            elif operator == '>=':
                query = query.filter(getattr(Employee, column) >= float(value))
            elif operator == '<':
                query = query.filter(getattr(Employee, column) < float(value))
            elif operator == '<=':
                query = query.filter(getattr(Employee, column) <= float(value))

    return query
```

## 🎯 Frontend Integration

### Basic Setup (Default Format)

```typescript
import { NcTable, type NcTableProps } from "nc-table";

type Employee = {
  id: number;
  name: string;
  department: string;
  startDate: string;
  isActive: boolean;
  salary: number;
};

const handler: NcTableProps<Employee>["handler"] = async (params) => {
  console.log("📤 Sending to backend:", params);

  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("📥 Received from backend:", result);

  return result;
};

// Use the table with default IApiResponse format
<NcTable<Employee>
  columns={columns}
  handler={handler}
  showAdvancedSearch={true}
  selectable={true}
  // No responseConfig needed - uses default format
/>;
```

### Custom Response Format Setup

```typescript
import { CommonResponseFormats } from "nc-table/utils/responseUtils";

// For REST API format
const restApiHandler: NcTableProps<Employee>["handler"] = async (params) => {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  // Your backend returns: { success: true, data: [...], total: 100 }
  return response.json();
};

// Use with REST API format
<NcTable<Employee>
  columns={columns}
  handler={restApiHandler}
  responseConfig={CommonResponseFormats.restApi}
  showAdvancedSearch={true}
/>;

// For Laravel API Resource format
const laravelHandler: NcTableProps<Employee>["handler"] = async (params) => {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  // Your Laravel backend returns: { success: true, data: [...], meta: { total: 100 } }
  return response.json();
};

// Use with Laravel format
<NcTable<Employee>
  columns={columns}
  handler={laravelHandler}
  responseConfig={CommonResponseFormats.laravel}
  showAdvancedSearch={true}
/>;

// For completely custom format with transform function
const customHandler: NcTableProps<Employee>["handler"] = async (params) => {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  // Your backend returns any custom format
  return response.json();
};

// Use with custom transform
<NcTable<Employee>
  columns={columns}
  handler={customHandler}
  responseConfig={{
    transformResponse: (response) => ({
      data: response.response.users,
      count: response.response.pagination.total_records,
      success: response.status.ok,
      message: response.status.message,
      statusCode: response.status.code,
    }),
  }}
  showAdvancedSearch={true}
/>;
```

### Advanced Configuration

```typescript
// With error handling and loading states
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handler: NcTableProps<Employee>["handler"] = async (params) => {
  setLoading(true);
  setError(null);

  try {
    console.log("🔄 API Request:", {
      url: "/api/employees",
      method: "POST",
      body: params,
    });

    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`, // If needed
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.Succeeded) {
      throw new Error(result.Message || "API request failed");
    }

    console.log("✅ API Response:", result);
    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    setError(errorMessage);
    console.error("❌ API Error:", errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
};
```

## 🔧 Testing Your Integration

### 1. Test the Filter Generation

```typescript
import { buildFilterString } from "nc-table/utils";

const testFilters = [
  { id: 1, column: "name", operator: "~=", value: "John" },
  { id: 2, column: "department", operator: "==", value: "Engineering" },
  { id: 3, column: "salary", operator: ">", value: "50000" },
];

console.log("Generated filter:", buildFilterString(testFilters));
// Output: "name~=John;And$department==Engineering;And$salary>50000;"
```

### 2. Backend Testing

Test your backend with this exact payload:

```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "PageNumber": 1,
    "PageSize": 10,
    "Order": "name;Asc",
    "Filter": "name~=John;And$department==Engineering;And$salary>50000;"
  }'
```

Expected response:

```json
{
  "Succeeded": true,
  "Data": [...],
  "Count": 156,
  "Message": "Retrieved 10 employees"
}
```

## 🚨 Important Notes

1. **Filter Property**: Only included when filters exist (not empty)
2. **Null Safety**: Handle cases where Filter is undefined/null
3. **Value Sanitization**: Values are pre-sanitized (no semicolons or And$ sequences)
4. **Operator Support**: All 12 operators are supported
5. **Type Safety**: Use TypeScript interfaces for better development experience

## 🎉 Your Table is Ready!

The nc-table component is **production-ready** and will seamlessly integrate with your backend API using the exact filter format you specified. The demo at http://localhost:5173 shows all features working, including:

- ✅ **Server-side mode** toggle
- ✅ **Live filter string generation**
- ✅ **Real-time API simulation**
- ✅ **All CRUD operations**
- ✅ **Advanced search with 5 data types**
- ✅ **12 search operators**
- ✅ **Responsive design**

Simply replace the demo `handleServerData` function with your actual API endpoint, and you're ready to go! 🚀
