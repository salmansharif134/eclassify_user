"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ListingFormPage = ({ mode = "create" }) => {
  const [step, setStep] = useState(0);
  const steps = useMemo(
    () => [
      {
        title: "Basic info",
        description: "Product title, category, and description.",
        content: (
          <div className="space-y-4">
            <Input placeholder="Product title" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="home">Home & living</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Describe your product" rows={5} />
          </div>
        ),
      },
      {
        title: "Pricing",
        description: "Set price, promotions, and taxes.",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Price" />
            <Input placeholder="Compare at price" />
            <Input placeholder="Cost per item" />
            <Input placeholder="Tax rate (%)" />
          </div>
        ),
      },
      {
        title: "Inventory",
        description: "Manage stock and SKU details.",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="SKU" />
            <Input placeholder="Quantity" />
            <Input placeholder="Barcode (optional)" />
            <Input placeholder="Warehouse location" />
          </div>
        ),
      },
      {
        title: "Shipping",
        description: "Delivery settings and package details.",
        content: (
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Weight (lbs)" />
            <Input placeholder="Dimensions (L x W x H)" />
            <Input placeholder="Handling time (days)" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Shipping profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard shipping</SelectItem>
                <SelectItem value="expedited">Expedited shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        title: "Images",
        description: "Upload high-quality images.",
        content: (
          <div className="space-y-3">
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Drag and drop product images here, or click to upload.
            </div>
            <Input type="file" multiple />
          </div>
        ),
      },
    ],
    []
  );

  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

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
              <Button variant="outline">Save as draft</Button>
              <Button>{mode === "edit" ? "Update listing" : "Publish"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingFormPage;
