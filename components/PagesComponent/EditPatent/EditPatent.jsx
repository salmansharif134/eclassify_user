"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { userSignUpData, getIsLoggedIn } from "@/redux/reducer/authSlice";
import { patentsApi } from "@/utils/api";
import { t } from "@/utils";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const EditPatent = ({ id }) => {
    const router = useRouter();
    const userData = useSelector(userSignUpData);
    const isLoggedIn = useSelector(getIsLoggedIn);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [patentData, setPatentData] = useState({
        title: "",
        inventors: [{ first_name: "", last_name: "" }],
        abstract: "",
        issue_date: "",
        assignee: "",
        filing_date: "",
        patent_class: "",
        patent_type: "",
        patent_number: "",
        status: "active",
    });

    const [patentImages, setPatentImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);

    useEffect(() => {
        if (!isLoggedIn) {
            toast.error(t("loginFirst"));
            router.push("/seller-login");
            return;
        }

        const fetchDetails = async () => {
            try {
                setLoading(true);
                const sellerId = userData?.seller_id || userData?.id || userData?.data?.id;
                const response = await patentsApi.getPatentDetailsForEdit(sellerId, id);

                if (response.data.error === false) {
                    const data = response.data.data;
                    const patent = data.patent || data;

                    setPatentData({
                        title: patent.title || "",
                        inventors: patent.inventor || [{ first_name: "", last_name: "" }],
                        abstract: patent.abstract || "",
                        issue_date: patent.issue_date || "",
                        assignee: patent.assignee || "",
                        filing_date: patent.filing_date || "",
                        patent_class: patent.patent_class || "",
                        patent_type: patent.patent_type || "",
                        patent_number: patent.patent_number || "",
                        status: patent.status || "active",
                    });

                    // Handle images if they exist in the response
                    if (patent.images) setExistingImages(patent.images);
                    if (patent.additional_images) setExistingAdditionalImages(patent.additional_images);

                } else {
                    toast.error(response.data.message || t("somethingWentWrong"));
                }
            } catch (error) {
                console.error("Error fetching patent details:", error);
                toast.error(t("somethingWentWrong"));
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, isLoggedIn, userData, router]);

    const handleInventorChange = (index, field, value) => {
        const nextInventors = [...patentData.inventors];
        nextInventors[index] = { ...nextInventors[index], [field]: value };
        setPatentData({ ...patentData, inventors: nextInventors });
    };

    const addInventor = () => {
        setPatentData({
            ...patentData,
            inventors: [...patentData.inventors, { first_name: "", last_name: "" }],
        });
    };

    const removeInventor = (index) => {
        if (patentData.inventors.length > 1) {
            const nextInventors = patentData.inventors.filter((_, i) => i !== index);
            setPatentData({ ...patentData, inventors: nextInventors });
        }
    };

    const handleImageUpload = (files, type) => {
        const fileArray = Array.from(files);
        if (type === "patent") {
            setPatentImages([...patentImages, ...fileArray]);
        } else {
            setAdditionalImages([...additionalImages, ...fileArray]);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            // Validation logic goes here (similar to SellerSignupWizard)

            const sellerId = userData?.seller_id || userData?.id || userData?.data?.id;

            const formData = new FormData();
            // formData.append("_method", "PUT"); // Laravel/Standard convention for PUT with FormData
            formData.append("title", patentData.title);
            formData.append("abstract", patentData.abstract);
            formData.append("issue_date", patentData.issue_date);
            formData.append("assignee", patentData.assignee);
            formData.append("filing_date", patentData.filing_date);
            formData.append("patent_class", patentData.patent_class);
            formData.append("patent_type", patentData.patent_type);
            formData.append("patent_number", patentData.patent_number);
            formData.append("status", patentData.status);

            // Format inventors for submission
            const inventorsPayload = patentData.inventors.map(inv => ({
                firstName: inv.first_name,
                lastName: inv.last_name
            }));
            formData.append("patent_data", JSON.stringify({
                ...patentData,
                inventor: inventorsPayload
            }));

            // Append new images
            patentImages.forEach((img, idx) => {
                formData.append(`patent_images[${idx}]`, img);
            });
            additionalImages.forEach((img, idx) => {
                formData.append(`additional_images[${idx}]`, img);
            });

            const response = await patentsApi.updatePatent(sellerId, id, formData);

            if (response.data.error === false) {
                toast.success(response.data.message || "Patent updated successfully!");
                // No redirect as requested
            } else {
                toast.error(response.data.message || t("somethingWentWrong"));
            }
        } catch (error) {
            console.error("Error saving patent:", error);
            toast.error(t("somethingWentWrong"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <Card className="shadow-xl border-0">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{t("editListing")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <Label>{t("title")}</Label>
                            <Input
                                value={patentData.title}
                                onChange={(e) => setPatentData({ ...patentData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="patent-status"
                                checked={patentData.status === "active"}
                                onCheckedChange={(checked) => setPatentData({ ...patentData, status: checked ? "active" : "inactive" })}
                            />
                            <Label htmlFor="patent-status">{t("status") || "Status"}: {patentData.status === "active" ? (t("active") || "Active") : (t("inactive") || "Inactive")}</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Inventors</Label>
                            {patentData.inventors.map((inv, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        placeholder="First Name"
                                        value={inv.first_name}
                                        onChange={(e) => handleInventorChange(idx, "first_name", e.target.value)}
                                        required
                                    />
                                    <Input
                                        placeholder="Last Name"
                                        value={inv.last_name}
                                        onChange={(e) => handleInventorChange(idx, "last_name", e.target.value)}
                                        required
                                    />
                                    {patentData.inventors.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeInventor(idx)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addInventor}
                                className="mt-2"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t("addInventor") || t("Add Inventor")}
                            </Button>
                        </div>

                        <div>
                            <Label>{t("abstract") || "Abstract (Summary of patent)"}</Label>
                            <textarea
                                className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                                value={patentData.abstract}
                                onChange={(e) => setPatentData({ ...patentData, abstract: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label>Patent or Application Number</Label>
                            <Input
                                value={patentData.patent_number}
                                onChange={(e) => setPatentData({ ...patentData, patent_number: e.target.value })}
                            />
                        </div>

                        <div className="space-y-6 pt-6 border-t">
                            <div>
                                <Label>New Patent Images</Label>
                                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                    <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
                                    <p className="text-sm font-medium">Click or drag to upload new images</p>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e.target.files, "patent")}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                {patentImages.length > 0 && (
                                    <div className="mt-4 grid grid-cols-4 gap-4">
                                        {patentImages.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square">
                                                <img
                                                    src={URL.createObjectURL(img)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setPatentImages(patentImages.filter((_, i) => i !== idx))}
                                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}


                                {existingImages?.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <Label>Existing Images</Label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {existingImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square group">
                                                    <img
                                                        src={img.image_url}
                                                        alt={`Existing ${idx + 1}`}
                                                        className="w-full h-full object-cover rounded-lg border"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.back()}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={saving}
                            >
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}</> : (t("saveChanges") || "Save Changes")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditPatent;
