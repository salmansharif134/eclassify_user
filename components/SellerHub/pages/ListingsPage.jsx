"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { listings } from "@/components/SellerHub/sellerHubData";
import { getStatusBadge } from "@/components/SellerHub/statusUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ListingsPage = () => {
  const router = useRouter();
  const [selected, setSelected] = useState([]);

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

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Listings"
        description="Create, manage, and optimize your product listings."
        actionLabel="Add listing"
        onAction={() => router.push("/seller-dashboard/listings/new")}
      />

      <Card>
        <CardContent className="py-4">
          {selected.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span>{selected.length} selected</span>
              <Button variant="outline" size="sm">
                End listings
              </Button>
              <Button variant="outline" size="sm">
                Duplicate
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selected.length === listings.length}
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
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(listing.id)}
                      onCheckedChange={(checked) => toggleOne(listing.id, checked === true)}
                      aria-label={`Select ${listing.title}`}
                    />
                  </TableCell>
                  <TableCell className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-slate-100" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">{listing.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>{listing.sku}</TableCell>
                  <TableCell>${listing.price.toFixed(2)}</TableCell>
                  <TableCell>{listing.quantity}</TableCell>
                  <TableCell>{getStatusBadge(listing.status)}</TableCell>
                  <TableCell className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/seller-dashboard/listings/${listing.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      End listing
                    </Button>
                    <Button variant="ghost" size="sm">
                      Duplicate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingsPage;
