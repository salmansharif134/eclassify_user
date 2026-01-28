"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { RotateCcw, RefreshCw, CheckCircle2, XCircle, Search, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import StatCard from "@/components/SellerHub/components/StatCard";
import { StatCardSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";

const ReturnsPage = () => {
  const searchParams = useSearchParams();
  const [returnRequests, setReturnRequests] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({ id: null, type: "" });
  const [refreshToken, setRefreshToken] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchReturns = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getReturns({
          page,
          perPage,
          query: query || undefined,
        });
        const payload = response?.data?.data ?? response?.data;
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const nextMeta = payload?.meta || {
          page,
          perPage,
          total: Array.isArray(list) ? list.length : 0,
        };
        if (isMounted) {
          setReturnRequests(list);
          setMeta(nextMeta);
          
          // Calculate dynamic stats
          const calculatedStats = {
            total: list.length,
            pending: list.filter(r => (r.status || "").toLowerCase() === "pending").length,
            approved: list.filter(r => (r.status || "").toLowerCase() === "approved").length,
            rejected: list.filter(r => (r.status || "").toLowerCase() === "rejected").length,
          };
          setStats(calculatedStats);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load returns.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchReturns();
    return () => {
      isMounted = false;
    };
  }, [page, perPage, refreshToken, query]);

  const handleApprove = async (returnId) => {
    try {
      setActionLoading({ id: returnId, type: "approve" });
      await sellerHubApi.approveReturn(returnId);
      toast.success("Return approved.");
      setRefreshToken((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve return.");
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleReject = async (returnId) => {
    try {
      setActionLoading({ id: returnId, type: "reject" });
      await sellerHubApi.rejectReturn(returnId);
      toast.success("Return rejected.");
      setRefreshToken((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject return.");
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshToken((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Returns"
          description="Approve or reject return requests and track status."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Dynamic Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total Returns"
            value={stats.total}
            helper="All requests"
            icon={RotateCcw}
            color="blue"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            helper="Awaiting action"
            icon={AlertCircle}
            color="amber"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            helper="Accepted returns"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            helper="Declined returns"
            icon={XCircle}
            color="red"
          />
        </div>
      )}

      {/* Search */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Search Returns</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by return ID, order ID, or buyer..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Return Requests</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {returnRequests.length} {returnRequests.length === 1 ? 'request' : 'requests'}
          </Badge>
        </CardHeader>
        <CardContent className="py-4">
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Return ID</TableHead>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Buyer</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnRequests.map((request, index) => {
                    const isPending = (request.status || "").toLowerCase() === "pending";
                    return (
                      <TableRow 
                        key={request.id}
                        className="hover:bg-muted/50 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium font-mono text-sm">{request.id}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{request.orderId || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {(request.buyer || "B")[0].toUpperCase()}
                            </div>
                            <span>{request.buyer || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-2">{request.reason || "No reason provided"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={actionLoading.id === request.id && actionLoading.type === "approve"}
                                className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                              >
                                {actionLoading.id === request.id && actionLoading.type === "approve" ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                disabled={actionLoading.id === request.id && actionLoading.type === "reject"}
                                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {actionLoading.id === request.id && actionLoading.type === "reject" ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No action needed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && returnRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <RotateCcw className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No return requests found</p>
                          <p className="text-sm text-muted-foreground">
                            {query ? "Try adjusting your search" : "Return requests will appear here"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {!isLoading && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{returnRequests.length}</span> of{" "}
                <span className="font-semibold text-foreground">{meta.total || returnRequests.length}</span> requests
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground px-2">
                  Page {page} of {Math.ceil((meta.total || 0) / perPage) || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * perPage >= (meta.total || 0) || isLoading}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnsPage;
