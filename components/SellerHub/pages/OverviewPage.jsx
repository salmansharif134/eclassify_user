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
import { DollarSign, ShoppingCart, Package, RotateCcw, TrendingUp } from "lucide-react";

const SummaryCard = ({ label, value, helper, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };
  
  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <div className={`h-10 w-10 rounded-lg ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
        {helper && <p className="text-xs text-muted-foreground mt-1.5">{helper}</p>}
      </CardContent>
    </Card>
  );
};

const OverviewPage = () => {
  const searchParams = useSearchParams();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Overview"
        description="Track sales performance, orders, and buyer activity at a glance."
      />
      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Sales"
          value={`$${Number(salesSummary.totalSales || 0).toLocaleString()}`}
          helper="Last 30 days"
          icon={DollarSign}
          color="green"
        />
        <SummaryCard 
          label="Orders" 
          value={salesSummary.orders || 0} 
          helper="All channels"
          icon={ShoppingCart}
          color="blue"
        />
        <SummaryCard
          label="Pending Shipments"
          value={salesSummary.pendingShipments || 0}
          helper="Awaiting fulfillment"
          icon={Package}
          color="amber"
        />
        <SummaryCard 
          label="Returns" 
          value={salesSummary.returns || 0} 
          helper="Open cases"
          icon={RotateCcw}
          color="purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Tabs defaultValue="daily">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Revenue</CardTitle>
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
            <CardContent>
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

        <Card className="shadow-sm border-2">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-xl">Seller Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Keep metrics under target for premium visibility.
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{metric.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {metric.value}% (target &lt; {metric.target}%)
                  </span>
                </div>
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="h-2"
                />
              </div>
            ))}
            {!isLoading && performanceMetrics.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No performance metrics available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review latest orders and take action quickly.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.buyer}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getStatusBadge(order.payment)}</TableCell>
                    <TableCell>${Number(order.total || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No recent orders available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-2">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-xl">Top-Selling Products</CardTitle>
            <p className="text-sm text-muted-foreground">Best performers this month.</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {topProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="rounded-xl border-2 p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {product.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShoppingCart size={12} />
                        {product.sold} sold
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
      </div>
    </div>
  );
};

export default OverviewPage;
