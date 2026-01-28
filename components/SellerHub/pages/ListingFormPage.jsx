"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sellerHubApi } from "@/utils/api";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ListingFormPage = ({ mode = "create" }) => {
  const { id } = useParams();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shippingProfiles, setShippingProfiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    description: "",
    carrier: "",
    handlingTime: "",
  });
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    compareAt: "",
    cost: "",
    taxRate: "",
    sku: "",
    quantity: "",
    barcode: "",
    warehouse: "",
    weight: "",
    dimensions: "",
    handlingTime: "",
    shippingProfile: "",
    images: [],
  });

  const resolveImageUrl = (image) => {
    if (!image) return "";
    const raw =
      image.url ||
      image.image_url ||
      image.path ||
      image.image ||
      image;
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

  useEffect(() => {
    let isMounted = true;
    const fetchMeta = async () => {
      try {
        const response = await sellerHubApi.getListingMeta();
        const payload = response?.data?.data ?? response?.data;
        if (isMounted) {
          setCategories(payload?.categories || []);
          setShippingProfiles(payload?.shippingProfiles || payload?.shipping_profiles || []);
        }
      } catch (error) {
        if (isMounted) {
          setCategories([]);
          setShippingProfiles([]);
        }
      }
    };
    fetchMeta();
    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    let isMounted = true;
    const fetchListing = async () => {
      if (mode !== "edit" || !id) return;
      try {
        setIsLoading(true);
        const response = await sellerHubApi.getListing(id);
        const payload = response?.data?.data ?? response?.data;
        if (isMounted && payload) {
          const categoryValue =
            payload.category_id ??
            payload.category ??
            "";
          const shippingProfileValue =
            payload.shipping_profile_id ??
            payload.shipping_profile ??
            "";
          setForm((prev) => ({
            ...prev,
            title: payload.title || payload.name || "",
            category: categoryValue ? categoryValue.toString() : "",
            description: payload.description || "",
            price: payload.price || "",
            compareAt: payload.compare_at_price || "",
            cost: payload.cost || "",
            taxRate: payload.tax_rate || "",
            sku: payload.sku || "",
            quantity: payload.quantity || "",
            barcode: payload.barcode || "",
            warehouse: payload.warehouse || "",
            weight: payload.weight || "",
            dimensions: payload.dimensions || "",
            handlingTime: payload.handling_time || "",
            shippingProfile: shippingProfileValue ? shippingProfileValue.toString() : "",
          }));
          const payloadImages =
            payload.images ||
            payload.image ||
            payload.gallery ||
            payload.media ||
            [];
          setExistingImages(Array.isArray(payloadImages) ? payloadImages : [payloadImages]);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load listing.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchListing();
    return () => {
      isMounted = false;
    };
  }, [mode, id]);
  const steps = [
      {
        title: "Basic info",
        description: "Product title, category, and description.",
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listing-title">Product title</Label>
              <Input
                id="listing-title"
                placeholder="Product title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const val = category.id?.toString?.() ?? category.value ?? category.slug ?? category.name ?? "__unknown__";
                    if (val === "") return null;
                    return (
                      <SelectItem
                        key={category.id ?? category.value ?? category.slug ?? category.name ?? val}
                        value={val}
                      >
                        {category.name || category.label || category.title}
                      </SelectItem>
                    );
                  })}
                  {categories.length === 0 && (
                    <SelectItem value="unavailable" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-description">Description</Label>
              <Textarea
                id="listing-description"
                placeholder="Describe your product"
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
          </div>
        ),
      },
      {
        title: "Pricing",
        description: "Set price, promotions, and taxes.",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="listing-price">Price</Label>
              <Input
                id="listing-price"
                placeholder="Price"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-compare">Compare at price</Label>
              <Input
                id="listing-compare"
                placeholder="Compare at price"
                value={form.compareAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, compareAt: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-cost">Cost per item</Label>
              <Input
                id="listing-cost"
                placeholder="Cost per item"
                value={form.cost}
                onChange={(event) => setForm((prev) => ({ ...prev, cost: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-tax">Tax rate (%)</Label>
              <Input
                id="listing-tax"
                placeholder="Tax rate (%)"
                value={form.taxRate}
                onChange={(event) => setForm((prev) => ({ ...prev, taxRate: event.target.value }))}
              />
            </div>
          </div>
        ),
      },
      {
        title: "Inventory",
        description: "Manage stock and SKU details.",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="listing-sku">SKU</Label>
              <Input
                id="listing-sku"
                placeholder="SKU"
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-qty">Quantity</Label>
              <Input
                id="listing-qty"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-barcode">Barcode (optional)</Label>
              <Input
                id="listing-barcode"
                placeholder="Barcode (optional)"
                value={form.barcode}
                onChange={(event) => setForm((prev) => ({ ...prev, barcode: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-warehouse">Warehouse location</Label>
              <Input
                id="listing-warehouse"
                placeholder="Warehouse location"
                value={form.warehouse}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, warehouse: event.target.value }))
                }
              />
            </div>
          </div>
        ),
      },
      {
        title: "Shipping",
        description: "Delivery settings and package details.",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="listing-weight">Weight (lbs)</Label>
              <Input
                id="listing-weight"
                placeholder="Weight (lbs)"
                value={form.weight}
                onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-dimensions">Dimensions (L x W x H)</Label>
              <Input
                id="listing-dimensions"
                placeholder="Dimensions (L x W x H)"
                value={form.dimensions}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dimensions: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-handling">Handling time (days)</Label>
              <Input
                id="listing-handling"
                placeholder="Handling time (days)"
                value={form.handlingTime}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, handlingTime: event.target.value }))
                }
              />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-1">
                <Label>Shipping profile</Label>
                <p className="text-xs text-muted-foreground">
                  Choose a saved shipping profile.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileDialogOpen(true)}
              >
                New profile
              </Button>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Select
                value={form.shippingProfile}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, shippingProfile: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Shipping profile" />
                </SelectTrigger>
                <SelectContent>
                  {shippingProfiles.map((profile) => {
                    const val = profile.id?.toString?.() ?? profile.value ?? profile.slug ?? profile.name ?? "__unknown__";
                    if (val === "") return null;
                    return (
                      <SelectItem
                        key={profile.id ?? profile.value ?? profile.slug ?? profile.name ?? val}
                        value={val}
                      >
                        {profile.name || profile.label || profile.title}
                      </SelectItem>
                    );
                  })}
                  {shippingProfiles.length === 0 && (
                    <SelectItem value="unavailable" disabled>
                      No shipping profiles available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        ),
      },
      {
        title: "Images",
        description: "Upload high-quality images.",
        content: (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Product images</Label>
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Drag and drop product images here, or click to upload.
              </div>
            </div>
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {existingImages.map((image) => {
                  const imageUrl = resolveImageUrl(image);
                  return (
                  <div
                    key={image.id || image.url || image}
                    className="relative h-20 overflow-hidden rounded-md border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Listing"
                      className="h-full w-full object-cover"
                    />
                    {image.id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-6 w-6 rounded-full bg-white/80"
                        onClick={async () => {
                          try {
                            await sellerHubApi.deleteListingImage(image.id);
                            setExistingImages((prev) =>
                              prev.filter((item) => item.id !== image.id)
                            );
                            toast.success("Image removed.");
                          } catch (error) {
                            toast.error("Failed to remove image.");
                          }
                        }}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                );
                })}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="listing-images">Upload images</Label>
              <Input
                id="listing-images"
                type="file"
                multiple
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    images: event.target.files ? Array.from(event.target.files) : [],
                  }))
                }
              />
            </div>
            {form.images.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {form.images.length} new image(s) selected
              </div>
            )}
          </div>
        ),
      },
  ];

  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  const buildPayload = (status) => {
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("name", form.title);
    payload.append("category", form.category);
    payload.append("category_id", form.category);
    payload.append("description", form.description);
    payload.append("price", form.price);
    payload.append("compare_at_price", form.compareAt);
    payload.append("cost", form.cost);
    payload.append("tax_rate", form.taxRate);
    payload.append("sku", form.sku);
    payload.append("quantity", form.quantity);
    payload.append("barcode", form.barcode);
    payload.append("warehouse", form.warehouse);
    payload.append("weight", form.weight);
    payload.append("dimensions", form.dimensions);
    payload.append("handling_time", form.handlingTime);
    payload.append("shipping_profile", form.shippingProfile);
    payload.append("shipping_profile_id", form.shippingProfile);
    if (status) payload.append("status", status);
    form.images.forEach((file, index) => {
      payload.append(`images[${index}]`, file);
    });
    return payload;
  };

  const handleSubmit = async (status) => {
    try {
      setIsSaving(true);
      const payload = buildPayload(status);

      if (mode === "edit" && id) {
        await sellerHubApi.updateListing(id, payload);
        toast.success(status === "draft" ? "Draft updated." : "Listing updated.");
      } else {
        await sellerHubApi.createListing(payload);
        toast.success(status === "draft" ? "Draft saved." : "Listing created.");
      }
      router.push("/seller-dashboard/listings");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save listing.";
      const errors = error?.response?.data?.errors;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === "edit" ? "Edit listing" : "Create listing"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete each step to publish your product.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {step + 1} of {steps.length}: {steps[step].title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {steps[step].description}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className={`h-2 flex-1 rounded-full ${
                  index <= step ? "bg-primary" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {steps[step].content}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button variant="outline" disabled={isFirst} onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button disabled={isLast} onClick={() => setStep(step + 1)}>
                Next
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isSaving}>
                Save as draft
              </Button>
              <Button onClick={() => handleSubmit()} disabled={isSaving || isLoading}>
                {mode === "edit" ? "Update listing" : "Publish"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create shipping profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile name</Label>
              <Input
                id="profile-name"
                placeholder="Profile name"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-carrier">Carrier</Label>
              <Input
                id="profile-carrier"
                placeholder="Carrier (UPS, FedEx, etc.)"
                value={profileForm.carrier}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, carrier: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-handling">Handling time (days)</Label>
              <Input
                id="profile-handling"
                placeholder="Handling time (days)"
                value={profileForm.handlingTime}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, handlingTime: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-description">Description</Label>
              <Textarea
                id="profile-description"
                placeholder="Description"
                rows={3}
                value={profileForm.description}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const response = await sellerHubApi.createShippingProfile({
                    name: profileForm.name,
                    description: profileForm.description,
                    carrier: profileForm.carrier,
                    handling_time: profileForm.handlingTime,
                  });
                  const payload = response?.data?.data ?? response?.data;
                  if (payload) {
                    setShippingProfiles((prev) => [...prev, payload]);
                    setForm((prev) => ({
                      ...prev,
                      shippingProfile:
                        payload.id?.toString?.() ??
                        payload.value ??
                        payload.slug ??
                        payload.name,
                    }));
                  }
                  setProfileDialogOpen(false);
                  setProfileForm({ name: "", description: "", carrier: "", handlingTime: "" });
                  toast.success("Shipping profile created.");
                } catch (error) {
                  toast.error("Failed to create shipping profile.");
                }
              }}
              disabled={!profileForm.name || !profileForm.carrier}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingFormPage;
