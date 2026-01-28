"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import SalesChart from "@/components/SellerHub/SalesChart";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { Progress } from "@/components/ui/progress";
import { sellerHubApi } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DollarSign, ShoppingCart, Package, RotateCcw, TrendingUp, RefreshCw, Loader2 } from "lucide-react";
import StatCard from "@/components/SellerHub/components/StatCard";
import { StatCardSkeleton, CardSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";

const OverviewPage = () => {
  const searchParams = useSearchParams();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getDashboard({ query: query || undefined });
        const data = response?.data?.data ?? response?.data;
        if (isMounted) {
          setDashboard(data || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [query]);

  const salesSummary = dashboard?.salesSummary || {
    totalSales: 0,
    orders: 0,
    pendingShipments: 0,
    returns: 0,
  };
  const revenueSeries = dashboard?.revenueSeries || { daily: [], weekly: [], monthly: [] };
  const recentOrders = dashboard?.recentOrders || [];
  const topProducts = dashboard?.topProducts || [];
  const performanceMetrics = dashboard?.performanceMetrics || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger refetch
    const response = await sellerHubApi.getDashboard({ query: query || undefined });
    const data = response?.data?.data ?? response?.data;
    setDashboard(data || null);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Overview"
          description="Track sales performance, orders, and buyer activity at a glance."
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
      
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Sales"
            value={`$${Number(salesSummary.totalSales || 0).toLocaleString()}`}
            helper="Last 30 days"
            icon={DollarSign}
            color="green"
          />
          <StatCard 
            label="Orders" 
            value={salesSummary.orders || 0} 
            helper="All channels"
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            label="Pending Shipments"
            value={salesSummary.pendingShipments || 0}
            helper="Awaiting fulfillment"
            icon={Package}
            color="amber"
          />
          <StatCard 
            label="Returns" 
            value={salesSummary.returns || 0} 
            helper="Open cases"
            icon={RotateCcw}
            color="purple"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="lg:col-span-2 border-2 shadow-sm">
            <Tabs defaultValue="daily">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
                <div>
                  <CardTitle className="text-xl">Revenue Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Sales trends across your selected time frame.
                  </p>
                </div>
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="daily">
                  <SalesChart data={revenueSeries.daily} />
                </TabsContent>
                <TabsContent value="weekly">
                  <SalesChart data={revenueSeries.weekly} />
                </TabsContent>
                <TabsContent value="monthly">
                  <SalesChart data={revenueSeries.monthly} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        )}

        {isLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="shadow-sm border-2">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Seller Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Keep metrics under target for premium visibility.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {performanceMetrics.map((metric) => {
                const percentage = (metric.value / metric.target) * 100;
                const isGood = percentage < 100;
                return (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{metric.label}</span>
                      <span className={cn(
                        "text-xs font-semibold",
                        isGood ? "text-emerald-600" : "text-red-600"
                      )}>
                        {metric.value}% / {metric.target}%
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={cn(
                        "h-2.5",
                        isGood ? "" : "bg-red-100"
                      )}
                    />
                  </div>
                );
              })}
              {!isLoading && performanceMetrics.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No performance metrics available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="lg:col-span-2 border-2 shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
              <CardTitle className="text-xl">Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review latest orders and take action quickly.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Buyer</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Payment</TableHead>
                      <TableHead className="font-semibold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order, index) => (
                      <TableRow 
                        key={order.id}
                        className="hover:bg-muted/50 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium font-mono text-sm">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {(order.buyer || "B")[0].toUpperCase()}
                            </div>
                            <span>{order.buyer || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getStatusBadge(order.payment)}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ${Number(order.total || 0).toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && recentOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">No recent orders</p>
                            <p className="text-sm text-muted-foreground">Orders will appear here once received</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="shadow-sm border-2">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top-Selling Products
              </CardTitle>
              <p className="text-sm text-muted-foreground">Best performers this month.</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {topProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="rounded-xl border-2 p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-white shadow-sm transition-transform group-hover:scale-110",
                      index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                      index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-600" :
                      index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800" :
                      "bg-primary/10 text-primary"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                        {product.title}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <ShoppingCart size={12} />
                          {product.sold || 0} sold
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${Number(product.revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!isLoading && topProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package size={32} className="mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No top products yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
