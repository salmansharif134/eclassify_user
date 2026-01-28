"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Plus, Edit, Trash2, RefreshCw, Tags, Loader2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/SellerHub/components/LoadingSkeleton";
import CustomImage from "@/components/Common/CustomImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(true);
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
        toast.success("Category updated successfully.");
      } else {
        await sellerHubApi.createSellerCategory(formData);
        toast.success("Category created successfully.");
      }
      setDialogOpen(false);
      setPage(1);
      // Refresh categories
      const response = await sellerHubApi.getSellerCategories({ page, perPage, query });
      const payload = response?.data?.data ?? response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setCategories(list);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 500);
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
      <div className="flex items-center justify-between">
        <SellerHubPageHeader
          title="Categories"
          description="Create and manage listing categories."
          actionLabel="Add category"
          onAction={openCreate}
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

      {/* Search Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Search Categories</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories by name or slug..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-3 text-sm text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      )}

      <Card className="border-2 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Category List</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </Badge>
        </CardHeader>
        <CardContent className="py-4">
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Icon</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Slug</TableHead>
                    <TableHead className="font-semibold">Parent</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow 
                      key={category.id}
                      className="hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="h-12 w-12 rounded-lg overflow-hidden border bg-slate-100">
                          {category.image ? (
                            <CustomImage
                              src={category.image}
                              alt={category.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {category.slug || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {category.parent_name ? (
                          <Badge variant="secondary">{category.parent_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEdit(category)}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(category.id)}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Tags className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No categories found</p>
                          <p className="text-sm text-muted-foreground">
                            {query ? "Try adjusting your search" : "Create your first category to get started"}
                          </p>
                          {!query && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={openCreate}
                              className="mt-2 gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Add Category
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
              <Label htmlFor="parent_id">Parent Category (optional)</Label>
              <Select
                value={form.parent_id}
                onValueChange={(value) => setForm((prev) => ({ ...prev, parent_id: value }))}
              >
                <SelectTrigger id="parent_id">
                  <SelectValue placeholder="Select parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Top Level)</SelectItem>
                  {parentOptions
                    .filter((item) => !editingCategory || item.id !== editingCategory.id)
                    .map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {parentOptions.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {parentOptions.length} parent {parentOptions.length === 1 ? 'category' : 'categories'} available
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name || isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
