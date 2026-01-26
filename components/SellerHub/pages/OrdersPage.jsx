"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OrdersPage = () => {
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

  const handleView = async (orderId) => {
    try {
      setIsDetailLoading(true);
      setDetailOpen(true);
      const response = await sellerHubApi.getOrder(orderId);
      const payload = response?.data?.data ?? response?.data;
      setOrderDetail(payload || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load order details.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Orders"
        description="Manage, ship, and track orders in one place."
      />

      <Card>
        <CardContent className="grid gap-4 py-5 md:grid-cols-4">
          <Input
            placeholder="Search by order ID or buyer"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
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
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.buyer}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getStatusBadge(order.payment)}</TableCell>
                  <TableCell>${Number(order.total || 0).toFixed(2)}</TableCell>
                  <TableCell className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(order.id)}>
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleShip(order.id)}
                      disabled={actionLoading.id === order.id && actionLoading.type === "ship"}
                    >
                      Ship
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefund(order.id)}
                      disabled={actionLoading.id === order.id && actionLoading.type === "refund"}
                    >
                      Refund
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No orders match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredOrders.length} of {meta.total || filteredOrders.length} orders
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
            <DialogDescription>Review buyer info and order items.</DialogDescription>
          </DialogHeader>
          {isDetailLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!isDetailLoading && orderDetail && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Order ID</p>
                  <p className="font-medium">{orderDetail.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Buyer</p>
                  <p className="font-medium">{orderDetail.buyer || "Buyer"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Status</p>
                  <p className="font-medium">{orderDetail.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Payment</p>
                  <p className="font-medium">{orderDetail.payment}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Placed</p>
                  <p className="font-medium">{orderDetail.date || orderDetail.placed_at}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Total</p>
                  <p className="font-medium">
                    ${Number(orderDetail.total || orderDetail.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {orderDetail.items && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Items</p>
                  <div className="mt-2 space-y-2">
                    {orderDetail.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.title || item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                        </div>
                        <p>${Number(item.price || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orderDetail.shipping_address && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Shipping address</p>
                  <p className="font-medium">{orderDetail.shipping_address}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
