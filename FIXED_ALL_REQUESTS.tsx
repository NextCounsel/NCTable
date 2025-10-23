/**
 * FIXED VERSION OF YOUR ALL_REQUESTS COMPONENT
 *
 * This shows the correct way to use nc-table-react with your backend response format
 */

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/ui/pagination";
import { useRequestFilters } from "@/hooks/useRequestFilters";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Upload,
  MapPin,
  Building2,
  Users,
  File as FileIcon,
  Scale,
  UserCheck,
  ArrowRightLeft,
  Globe,
  Gavel,
} from "lucide-react";
import requestsApi, { FIRSRequest, RequestStats } from "@/services/requestsApi";
import { useRequests } from "@/hooks/useRequests";
import { getStatusBadge } from "@/components/request/RequestBadges";
import { getTypeIcon } from "@/components/request/RequestTypeIcon";
import { useOrganization } from "@/hooks/useOrganization";
import { RequestType, RequestStatus } from "@/types/firs";
import { NcTable, type Column, type TableAction } from "nc-table-react";
import { useNavigate } from "react-router-dom";

// Interface for NcTable handler parameters
interface NcTableParams {
  PageNumber: number;
  PageSize: number;
  Order?: string;
  Filter?: string;
  [key: string]: unknown;
}

type TabKey =
  | "case"
  | "solicitor_request"
  | "division_transfer"
  | "region_transfer"
  | "legal_opinion_approval"
  | "all";

export default function AllRequests() {
  const [activeTab, setActiveTab] = useState<TabKey>("case");
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [viewRequest, setViewRequest] = useState<FIRSRequest | null>(null);
  const [reviewRequest, setReviewRequest] = useState<FIRSRequest | null>(null);

  const refreshStats = () =>
    requestsApi
      .getRequestStats()
      .then(setStats)
      .catch(() => setStats(null));

  useEffect(() => {
    refreshStats();
  }, []);

  // Define table columns with enhanced rendering
  const requestColumns: Column<FIRSRequest>[] = [
    {
      key: "title",
      header: "Request",
      render: (request) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{request.title}</div>
          <div className="text-sm text-gray-600 line-clamp-2 font-medium">
            {request.requestId}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(request.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
      searchable: true,
    },
    {
      key: "requestType",
      header: "Request Type",
      render: (request) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(request.requestType)}
          <span className="text-sm font-medium text-gray-700">
            {request.requestType}
          </span>
        </div>
      ),
      searchOverride: {
        key: "requestType",
        dataType: "select",
        selectOptions: [
          { text: "Case", value: "case" },
          { text: "Solicitor Request", value: "solicitor_request" },
          { text: "Division Transfer", value: "division_transfer" },
          { text: "Region Transfer", value: "region_transfer" },
          { text: "Legal Opinion Approval", value: "legal_opinion_approval" },
        ],
      },
    },
    {
      key: "status",
      header: "Status",
      render: (request) => (
        <div className="space-y-1">{getStatusBadge(request.status)}</div>
      ),
      searchable: true,
      searchOverride: {
        key: "status",
        dataType: "select",
        selectOptions: [
          { text: "Pending", value: "pending" },
          { text: "Approved", value: "approved" },
          { text: "Declined", value: "declined" },
        ],
      },
    },
    {
      key: "reference",
      header: "Reference",
      render: (request) => <div className="text-sm">{request.reference}</div>,
      searchable: true,
    },
    {
      key: "createdBy.region.name",
      header: "Region",
      render: (request) => (
        <div className="text-sm">{request.createdBy?.region?.name || "—"}</div>
      ),
      searchable: true,
    },
    {
      key: "assignedTo.name",
      header: "Assigned To",
      render: (request) => (
        <div className="text-sm">
          {request.assignedTo?.fullName || "Unassigned"}
        </div>
      ),
    },
  ];

  const RequestsTable = NcTable<FIRSRequest & Record<string, unknown>>;
  const navigate = useNavigate();

  // Table actions
  const requestActions: TableAction<FIRSRequest>[] = [
    {
      label: "Review",
      icon: "eye",
      onClick: (request) => {
        setReviewRequest(request);
      },
    },
    {
      label: "View",
      icon: "file-text",
      onClick: (request) => {
        navigate(`/requests/view/${request.id}`);
      },
    },
  ];

  // ✅ CORRECT: Handler function that returns raw response
  const createHandler = (requestType?: string) => {
    return async (params: NcTableParams) => {
      console.log(
        `🚀 ${requestType || "All"} tab - Sending to backend:`,
        params
      );

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

  // ✅ CORRECT: ResponseConfig that transforms your backend response
  const responseConfig = {
    transformResponse: (response: any) => {
      console.log("🔄 Transform input (your backend response):", response);

      // Transform your backend response to what nc-table-react expects
      const transformed = {
        data: response.data || [], // Your requests array
        count: response.total || 0, // Total count for pagination
        success: response.status === "success", // Convert string to boolean
        message: response.message || "Success",
        statusCode: 200,
        pageNumber: response.page || 1,
        pageSize: response.limit || 10,
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

  const totals = useMemo(() => {
    const total = stats?.total ?? 0;
    const caseCount = stats?.byType?.case ?? 0;
    const solicitorRequestCount = stats?.byType?.solicitor_request ?? 0;
    const divisionTransferCount = stats?.byType?.division_transfer ?? 0;
    const regionTransferCount = stats?.byType?.region_transfer ?? 0;
    const legalOpinionCount = stats?.byType?.legal_opinion_approval ?? 0;
    return {
      total,
      caseCount,
      solicitorRequestCount,
      divisionTransferCount,
      regionTransferCount,
      legalOpinionCount,
    };
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">All Requests</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage all requests across the organization
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totals.caseCount}
            </div>
            <p className="text-xs text-blue-600">Legal case requests</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solicitor Requests
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totals.solicitorRequestCount}
            </div>
            <p className="text-xs text-green-600">Solicitor assignments</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Division Transfers
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totals.divisionTransferCount}
            </div>
            <p className="text-xs text-purple-600">Division transfers</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Region Transfers
            </CardTitle>
            <Globe className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totals.regionTransferCount}
            </div>
            <p className="text-xs text-orange-600">Region transfers</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Legal Opinions
            </CardTitle>
            <Gavel className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {totals.legalOpinionCount}
            </div>
            <p className="text-xs text-indigo-600">Legal opinion approvals</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs with tables */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
        className="space-y-4"
      >
        <TabsList className="w-full grid grid-cols-6">
          <TabsTrigger value="case" className="w-full justify-center">
            Cases
          </TabsTrigger>
          <TabsTrigger
            value="solicitor_request"
            className="w-full justify-center"
          >
            Solicitor Requests
          </TabsTrigger>
          <TabsTrigger
            value="division_transfer"
            className="w-full justify-center"
          >
            Division Transfers
          </TabsTrigger>
          <TabsTrigger
            value="region_transfer"
            className="w-full justify-center"
          >
            Region Transfers
          </TabsTrigger>
          <TabsTrigger
            value="legal_opinion_approval"
            className="w-full justify-center"
          >
            Legal Opinions
          </TabsTrigger>
          <TabsTrigger value="all" className="w-full justify-center">
            All
          </TabsTrigger>
        </TabsList>

        {/* ✅ FIXED: Case Tab */}
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
        </TabsContent>

        {/* ✅ FIXED: Solicitor Request Tab */}
        <TabsContent value="solicitor_request">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Solicitor Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RequestsTable
                id="solicitor-requests-table"
                columns={requestColumns}
                handler={createHandler("solicitor_request")}
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
        </TabsContent>

        {/* ✅ FIXED: Division Transfer Tab */}
        <TabsContent value="division_transfer">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Division Transfer Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RequestsTable
                id="division-transfer-requests-table"
                showSerialNumber={true}
                columns={requestColumns}
                handler={createHandler("division_transfer")}
                responseConfig={responseConfig}
                actions={requestActions}
                searchPlaceholder="Search requests..."
                emptyStateMessage="No requests found"
                selectable={true}
                idField="id"
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
        </TabsContent>

        {/* ✅ FIXED: Region Transfer Tab */}
        <TabsContent value="region_transfer">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Region Transfer Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RequestsTable
                id="region-transfer-requests-table"
                columns={requestColumns}
                handler={createHandler("region_transfer")}
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
        </TabsContent>

        {/* ✅ FIXED: Legal Opinion Tab */}
        <TabsContent value="legal_opinion_approval">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Legal Opinion Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RequestsTable
                id="legal-opinion-requests-table"
                columns={requestColumns}
                handler={createHandler("legal_opinion_approval")}
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
        </TabsContent>

        {/* ✅ FIXED: All Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <RequestsTable
                id="all-requests-table"
                columns={requestColumns}
                handler={createHandler()} // No requestType filter
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
        </TabsContent>
      </Tabs>

      {/* Rest of your dialogs and components remain the same */}
      {/* ... */}
    </div>
  );
}
