"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sellerHubApi } from "@/utils/api";
import { Search, Filter, RefreshCw, Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import { CardHeader, CardTitle } from "@/components/ui/card";
import CustomImage from "@/components/Common/CustomImage";

const ListingsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState([]);
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    ended: 0,
  });

  const resolveImageUrl = (image) => {
    if (!image) return "";
    const raw = image?.url || image?.image_url || image?.image || image;
    if (typeof raw !== "string") return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    const base =
      process.env.NEXT_PUBLIC_WEB_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "";
    if (!base) return raw;
    if (raw.startsWith("/")) return `${base}${raw}`;
    return `${base}/${raw}`;
  };

  const toggleAll = (checked) => {
    if (checked) {
      setSelected(listings.map((item) => item.id));
    } else {
      setSelected([]);
    }
  };

  const toggleOne = (id, checked) => {
    if (checked) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((item) => item !== id));
    }
  };

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getListings({
          page,
          perPage,
          status: statusFilter !== "all" ? statusFilter : undefined,
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
          setListings(list);
          setMeta(nextMeta);
          setSelected([]);
          
          // Calculate dynamic stats
          const calculatedStats = {
            total: list.length,
            active: list.filter(l => (l.status || "").toLowerCase() === "active").length,
            draft: list.filter(l => (l.status || "").toLowerCase() === "draft").length,
            ended: list.filter(l => (l.status || "").toLowerCase() === "ended").length,
          };
          setStats(calculatedStats);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load listings.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchListings();
    return () => {
      isMounted = false;
    };
  }, [page, perPage, refreshToken, statusFilter, query]);

  const handleDeleteClick = (listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    try {
      setIsDeleting(true);
      const itemId = listingToDelete.product_id ?? listingToDelete.id;
      await sellerHubApi.deleteListing(itemId);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
      setRefreshToken((prev) => prev + 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete listing.");
    } finally {
      setIsDeleting(false);
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
          title="Listings"
          description="Create, manage, and optimize your product listings."
          actionLabel="Add listing"
          onAction={() => router.push("/seller-dashboard/listings/new")}
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
              <div className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Ended</p>
              <div className="h-2 w-2 rounded-full bg-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{stats.ended}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
          {selected.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {selected.length} selected
            </Badge>
          )}
        </CardHeader>
        <CardContent className="py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-xs">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Listing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selected.length > 0 && selected.length === listings.length}
                        onCheckedChange={(checked) => toggleAll(checked === true)}
                        aria-label="Select all listings"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Listing</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Qty</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing, index) => {
                    const itemId = listing.product_id ?? listing.id;
                    const displayId = listing.code ?? listing.sku ?? listing.id;
                    const imageUrl = resolveImageUrl(listing.image || listing.image_url || listing.thumbnail || listing.thumbnail_url || listing);
                    return (
                      <TableRow 
                        key={itemId}
                        className="hover:bg-muted/50 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(itemId)}
                            onCheckedChange={(checked) => toggleOne(itemId, checked === true)}
                            aria-label={`Select ${listing.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 border">
                              {imageUrl ? (
                                <CustomImage
                                  src={imageUrl}
                                  alt={listing.title}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{listing.title}</p>
                              <p className="text-xs text-muted-foreground font-mono">{displayId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{listing.sku || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ${Number(listing.price || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{listing.quantity || 0}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(listing.status || "Active")}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" asChild className="gap-1">
                              <Link href={`/seller-dashboard/listings/${itemId}/edit`}>
                                <Edit className="h-3 w-3" />
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(listing)}
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && listings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No listings found</p>
                          <p className="text-sm text-muted-foreground">
                            {statusFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Create your first listing to get started"}
                          </p>
                          {statusFilter === "all" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push("/seller-dashboard/listings/new")}
                              className="mt-2 gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Add Listing
                            </Button>
                          )}
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
                Showing <span className="font-semibold text-foreground">{listings.length}</span> of{" "}
                <span className="font-semibold text-foreground">{meta.total || listings.length}</span> listings
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{listingToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListingsPage;
