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


  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Listings"
        description="Create, manage, and optimize your product listings."
        actionLabel="Add listing"
        onAction={() => router.push("/seller-dashboard/listings/new")}
      />

      {error && (
        <Card>
          <CardContent className="py-3 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      <Card>
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
          {selected.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span>{selected.length} selected</span>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selected.length > 0 && selected.length === listings.length}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Select all listings"
                  />
                </TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => {
                const itemId = listing.product_id ?? listing.id;
                const displayId = listing.code ?? listing.sku ?? listing.id;
                const imageUrl = resolveImageUrl(listing.image || listing.image_url || listing.thumbnail || listing.thumbnail_url || listing);
                return (
                <TableRow key={itemId}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(itemId)}
                      onCheckedChange={(checked) => toggleOne(itemId, checked === true)}
                      aria-label={`Select ${listing.title}`}
                    />
                  </TableCell>
                  <TableCell className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-slate-100">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{displayId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{listing.sku}</TableCell>
                  <TableCell>${Number(listing.price || 0).toFixed(2)}</TableCell>
                  <TableCell>{listing.quantity}</TableCell>
                  <TableCell>{getStatusBadge(listing.status || "Active")}</TableCell>
                  <TableCell className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/seller-dashboard/listings/${itemId}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(listing)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
              })}
              {!isLoading && listings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No listings available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {listings.length} of {meta.total || listings.length} listings
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
