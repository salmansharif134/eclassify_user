"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

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

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Returns"
        description="Approve or reject return requests and track status."
      />

      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.orderId}</TableCell>
                  <TableCell>{request.buyer}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={actionLoading.id === request.id && actionLoading.type === "approve"}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading.id === request.id && actionLoading.type === "reject"}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && returnRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No return requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {returnRequests.length} of {meta.total || returnRequests.length} requests
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * perPage >= (meta.total || 0)}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnsPage;
