"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";

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

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Inventory"
        description="Monitor stock levels and prevent sell-outs."
        actionLabel="Update inventory"
        onAction={() => router.push("/seller-dashboard/listings")}
      />

      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Switch checked={lowStockOnly} onCheckedChange={setLowStockOnly} />
              <span>Show low stock only</span>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reorder point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdjustItem(item);
                        setAdjustQuantity("");
                        setAdjustOpen(true);
                      }}
                    >
                      Adjust stock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Product</p>
              <p className="font-medium">{adjustItem?.title}</p>
            </div>
            <Input
              type="number"
              placeholder="New quantity"
              value={adjustQuantity}
              onChange={(event) => setAdjustQuantity(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsAdjusting(true);
                  await sellerHubApi.adjustInventory(adjustItem?.id, {
                    quantity: Number(adjustQuantity),
                  });
                  toast.success("Inventory updated.");
                  setAdjustOpen(false);
                  setRefreshToken((prev) => prev + 1);
                } catch (err) {
                  toast.error(err?.response?.data?.message || "Failed to update inventory.");
                } finally {
                  setIsAdjusting(false);
                }
              }}
              disabled={!adjustQuantity || isAdjusting}
            >
              {isAdjusting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
