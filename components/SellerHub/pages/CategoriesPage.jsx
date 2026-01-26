"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SellerHubPageHeader from "@/components/SellerHub/SellerHubPageHeader";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await sellerHubApi.getSellerCategories({ page, perPage, query });
        const payload = response?.data?.data ?? response?.data;
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const nextMeta = payload?.meta || {
          page,
          perPage,
          total: Array.isArray(list) ? list.length : 0,
        };
        if (isMounted) {
          setCategories(list);
          setMeta(nextMeta);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load categories.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [page, perPage, query]);

  const parentOptions = useMemo(
    () =>
      categories.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    [categories]
  );

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ name: "", slug: "", parent_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      parent_id: category.parent_id ? String(category.parent_id) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        parent_id: form.parent_id || null,
      };
      if (editingCategory) {
        await sellerHubApi.updateSellerCategory(editingCategory.id, payload);
        toast.success("Category updated.");
      } else {
        await sellerHubApi.createSellerCategory(payload);
        toast.success("Category created.");
      }
      setDialogOpen(false);
      setPage(1);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save category.";
      const errors = err?.response?.data?.errors;
      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors).flat()?.[0];
        toast.error(firstError || message);
      } else {
        toast.error(message);
      }
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await sellerHubApi.deleteSellerCategory(categoryId);
      toast.success("Category deleted.");
      setPage(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      <SellerHubPageHeader
        title="Categories"
        description="Create and manage listing categories."
        actionLabel="Add category"
        onAction={openCreate}
      />

      <Card>
        <CardContent className="py-5">
          <Input
            placeholder="Search categories"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
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
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug || "-"}</TableCell>
                  <TableCell>{category.parent_name || "-"}</TableCell>
                  <TableCell className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(category)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {categories.length} of {meta.total || categories.length} categories
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit category" : "Create category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Category name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
            />
            <Input
              placeholder="Parent ID (optional)"
              value={form.parent_id}
              onChange={(event) => setForm((prev) => ({ ...prev, parent_id: event.target.value }))}
            />
            {parentOptions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Available parents: {parentOptions.map((item) => item.name).join(", ")}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
