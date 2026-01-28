"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { sellerHubApi } from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package, RefreshCw, AlertTriangle, TrendingDown, Search, Loader2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import StatCard from "@/components/SellerHub/components/StatCard";
import { StatCardSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import { cn } from "@/lib/utils";

const InventoryPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    inStock: 0,
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
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getInventory({
          page,
          perPage,
          lowStock: lowStockOnly ? 1 : undefined,
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
          setInventory(list);
          setMeta(nextMeta);
          
          // Calculate dynamic stats
          const calculatedStats = {
            total: list.length,
            lowStock: list.filter(i => (i.stock || 0) <= (i.reorderPoint || 0) && (i.stock || 0) > 0).length,
            outOfStock: list.filter(i => (i.stock || 0) === 0).length,
            inStock: list.filter(i => (i.stock || 0) > (i.reorderPoint || 0)).length,
          };
          setStats(calculatedStats);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load inventory.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchInventory();
    return () => {
      isMounted = false;
    };
  }, [page, perPage, lowStockOnly, query, refreshToken]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshToken((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Inventory"
          description="Monitor stock levels and prevent sell-outs."
          actionLabel="Update inventory"
          onAction={() => router.push("/seller-dashboard/listings")}
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
            label="Total Items"
            value={stats.total}
            helper="All products"
            icon={Package}
            color="blue"
          />
          <StatCard
            label="In Stock"
            value={stats.inStock}
            helper="Above reorder point"
            icon={Package}
            color="green"
          />
          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            helper="Needs attention"
            icon={AlertTriangle}
            color="amber"
          />
          <StatCard
            label="Out of Stock"
            value={stats.outOfStock}
            helper="Requires restocking"
            icon={TrendingDown}
            color="red"
          />
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Inventory Items</CardTitle>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Switch checked={lowStockOnly} onCheckedChange={setLowStockOnly} id="low-stock-filter" />
            <Label htmlFor="low-stock-filter" className="cursor-pointer text-muted-foreground">
              Show low stock only
            </Label>
          </div>
        </CardHeader>
        <CardContent className="py-4">
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Reorder Point</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item, index) => {
                    const stock = item.stock || 0;
                    const reorderPoint = item.reorderPoint || 0;
                    const isLowStock = stock <= reorderPoint && stock > 0;
                    const isOutOfStock = stock === 0;
                    return (
                      <TableRow 
                        key={item.id}
                        className={cn(
                          "hover:bg-muted/50 transition-colors",
                          isOutOfStock && "bg-red-50/50 dark:bg-red-950/10",
                          isLowStock && !isOutOfStock && "bg-amber-50/50 dark:bg-amber-950/10"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            {item.sku && (
                              <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{item.sku || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-semibold",
                              isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-emerald-600"
                            )}>
                              {stock}
                            </span>
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                            {isOutOfStock && (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reorderPoint}</Badge>
                        </TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge className="bg-red-500 hover:bg-red-600">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600">Low Stock</Badge>
                          ) : (
                            getStatusBadge(item.status)
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAdjustItem(item);
                              setAdjustQuantity(String(item.stock || ""));
                              setAdjustOpen(true);
                            }}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && inventory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No inventory items found</p>
                          <p className="text-sm text-muted-foreground">
                            {lowStockOnly ? "No low stock items" : "Inventory will appear here"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {inventory.length} of {meta.total || inventory.length} items
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

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Product</Label>
              <p className="font-semibold text-lg mt-1">{adjustItem?.title}</p>
              {adjustItem?.sku && (
                <p className="text-sm text-muted-foreground font-mono">SKU: {adjustItem.sku}</p>
              )}
            </div>
            <div>
              <Label htmlFor="quantity">Current Stock: {adjustItem?.stock || 0}</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter new quantity"
                value={adjustQuantity}
                onChange={(event) => setAdjustQuantity(event.target.value)}
                className="mt-2"
                min="0"
              />
              {adjustItem?.reorderPoint && (
                <p className="text-xs text-muted-foreground mt-1">
                  Reorder point: {adjustItem.reorderPoint}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)} disabled={isAdjusting}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsAdjusting(true);
                  await sellerHubApi.adjustInventory(adjustItem?.id, {
                    quantity: Number(adjustQuantity),
                  });
                  toast.success("Inventory updated successfully.");
                  setAdjustOpen(false);
                  setRefreshToken((prev) => prev + 1);
                } catch (err) {
                  toast.error(err?.response?.data?.message || "Failed to update inventory.");
                } finally {
                  setIsAdjusting(false);
                }
              }}
              disabled={!adjustQuantity || isAdjusting || Number(adjustQuantity) < 0}
              className="gap-2"
            >
              {isAdjusting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
