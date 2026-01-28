"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useNavigate } from "@/components/Common/useNavigate";
import { Loader2, Search, Filter, RefreshCw, Download, Eye, Truck, RotateCcw, Clock, CheckCircle2, ShoppingCart, DollarSign } from "lucide-react";
import StatCard from "@/components/SellerHub/components/StatCard";
import { StatCardSkeleton, TableSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";

const OrdersPage = () => {
  const { navigate } = useNavigate();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({ id: null, type: "" });
  const [refreshToken, setRefreshToken] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    totalRevenue: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getOrders({
          page,
          perPage,
          status: statusFilter !== "all" ? statusFilter : undefined,
          payment: paymentFilter !== "all" ? paymentFilter : undefined,
          query: query || undefined,
          date: dateFilter || undefined,
        });
        const payload = response?.data?.data ?? response?.data;
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const nextMeta = payload?.meta || {
          page,
          perPage,
          total: Array.isArray(list) ? list.length : 0,
        };
        if (isMounted) {
          setOrders(list);
          setMeta(nextMeta);
          
          // Calculate dynamic stats from orders
          const calculatedStats = {
            total: list.length,
            pending: list.filter(o => (o.status || "").toLowerCase() === "pending").length,
            shipped: list.filter(o => (o.status || "").toLowerCase() === "shipped").length,
            delivered: list.filter(o => (o.status || "").toLowerCase() === "delivered").length,
            totalRevenue: list.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
          };
          setStats(calculatedStats);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load orders.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [page, perPage, refreshToken, statusFilter, paymentFilter, query, dateFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        (order.status || "").toLowerCase() === statusFilter;
      const matchesPayment =
        paymentFilter === "all" ||
        (order.payment || "").toLowerCase() === paymentFilter;
      const matchesQuery =
        !query ||
        (order.id || "").toLowerCase().includes(query.toLowerCase()) ||
        (order.buyer || "").toLowerCase().includes(query.toLowerCase());
      const matchesDate = !dateFilter || order.date === dateFilter;
      return matchesStatus && matchesPayment && matchesQuery && matchesDate;
    });
  }, [orders, paymentFilter, query, statusFilter, dateFilter]);

  const handleShip = async (orderId) => {
    try {
      setActionLoading({ id: orderId, type: "ship" });
      await sellerHubApi.shipOrder(orderId);
      toast.success("Order marked as shipped.");
      setRefreshToken((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark as shipped.");
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleDelivered = async (orderId) => {
    try {
      setActionLoading({ id: orderId, type: "deliver" });
      await sellerHubApi.deliverOrder(orderId);
      toast.success("Order marked as delivered.");
      setRefreshToken((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark as delivered.");
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleRefund = async (orderId) => {
    try {
      setActionLoading({ id: orderId, type: "refund" });
      await sellerHubApi.refundOrder(orderId);
      toast.success("Refund initiated.");
      setRefreshToken((prev) => prev + 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to refund order.");
    } finally {
      setActionLoading({ id: null, type: "" });
    }
  };

  const handleView = (orderId) => {
    try {
      // Remove 'ORD-' prefix if present to get numeric ID
      const numericOrderId = String(orderId).replace(/^ORD-/i, '');
      navigate(`/seller-dashboard/orders/${numericOrderId}`);
    } catch (err) {
      console.error("Error navigating to order details:", err);
      toast.error("Failed to open order details");
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
          title="Orders"
          description="Manage, ship, and track orders in one place."
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

      {/* Dynamic Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Orders"
            value={stats.total}
            helper="All time"
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            helper="Awaiting action"
            icon={Clock}
            color="amber"
          />
          <StatCard
            label="Shipped"
            value={stats.shipped}
            helper="In transit"
            icon={Truck}
            color="indigo"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            helper="Completed"
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            label="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            helper="From orders"
            icon={DollarSign}
            color="purple"
          />
        </div>
      )}

      {/* Enhanced Filters */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or buyer"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={paymentFilter}
            onValueChange={(value) => {
              setPaymentFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Order List</CardTitle>
          <Badge variant="outline" className="text-xs">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
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
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Buyer</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => (
                    <TableRow 
                      key={order.id}
                      className="hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">
                        <span className="font-mono text-sm">{order.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {(order.buyer || "B")[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{order.buyer || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getStatusBadge(order.payment)}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${Number(order.total || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleView(order.id)}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {(() => {
                            const orderStatus = (order.status || "").toLowerCase();
                            const isPending = orderStatus === "pending";
                            const isShipped = orderStatus === "shipped";
                            const isDelivered = orderStatus === "delivered";
                            const isProcessing = actionLoading.id === order.id;
                            const isLoadingShip = isProcessing && actionLoading.type === "ship";
                            const isLoadingDeliver = isProcessing && actionLoading.type === "deliver";
                            const isLoadingRefund = isProcessing && actionLoading.type === "refund";

                            return (
                              <>
                                {/* Ship Button - Only for Pending orders */}
                                {isPending && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleShip(order.id)}
                                    disabled={isLoadingShip}
                                    className="gap-1"
                                  >
                                    {isLoadingShip ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Truck className="h-3 w-3" />
                                    )}
                                    Ship
                                  </Button>
                                )}

                                {/* Delivered Button - Always enabled and visible */}
                                {!isDelivered && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleDelivered(order.id)}
                                    disabled={isLoadingDeliver}
                                    className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isLoadingDeliver ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    Delivered
                                  </Button>
                                )}

                                {/* Delivered Status Indicator - For already delivered orders */}
                                {isDelivered && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Delivered
                                  </Button>
                                )}

                                {/* Refund Button - Always available */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRefund(order.id)}
                                  disabled={isLoadingRefund}
                                  className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {isLoadingRefund ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-3 w-3" />
                                  )}
                                  Refund
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No orders found</p>
                          <p className="text-sm text-muted-foreground">
                            {query || statusFilter !== "all" || paymentFilter !== "all" || dateFilter
                              ? "Try adjusting your filters"
                              : "Orders will appear here once you receive them"}
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
                Showing <span className="font-semibold text-foreground">{filteredOrders.length}</span> of{" "}
                <span className="font-semibold text-foreground">{meta.total || filteredOrders.length}</span> orders
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

export default OrdersPage;
