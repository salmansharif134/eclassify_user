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
import { Label } from "@/components/ui/label";

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
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

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
    setForm({ name: "", slug: "", parent_id: "", image: null });
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      parent_id: category.parent_id ? String(category.parent_id) : "",
      image: null,
    });
    setImagePreview(category.image || null);
    setDialogOpen(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.slug) {
        formData.append("slug", form.slug);
      }
      if (form.parent_id) {
        formData.append("parent_id", form.parent_id);
      }
      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingCategory) {
        await sellerHubApi.updateSellerCategory(editingCategory.id, formData);
        toast.success("Category updated.");
      } else {
        await sellerHubApi.createSellerCategory(formData);
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
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Icon
                      </div>
                    )}
                  </TableCell>
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
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
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
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="Category name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                placeholder="Slug (optional)"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="parent_id">Parent ID (optional)</Label>
              <Input
                id="parent_id"
                placeholder="Parent ID (optional)"
                value={form.parent_id}
                onChange={(event) => setForm((prev) => ({ ...prev, parent_id: event.target.value }))}
              />
              {parentOptions.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available parents: {parentOptions.map((item) => item.name).join(", ")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="image">Category Icon/Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
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
