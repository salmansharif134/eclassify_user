"use client";

import React, { useEffect, useState } from "react";
import { t } from "@/utils";
import { patentsApi } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Edit2, Loader2, ChevronLeft, ChevronRight, Plus, Eye } from "lucide-react";
import NoData from "@/components/EmptyStates/NoData";
import CustomLink from "@/components/Common/CustomLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MyPatents = () => {
    const [patents, setPatents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState(null);

    const fetchMyPatents = async (page = 1) => {
        try {
            setIsLoading(true);
            const response = await patentsApi.getMyPatents(page);
            if (response.data.error === false) {
                setPatents(response.data.data.patents || []);
                setPagination(response.data.data.pagination || null);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching my patents:", error);
            toast.error(t("somethingWentWrong"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPatents();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("myPatents")}</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your patent listings
                    </p>
                </div>
                {/* <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    List New Patent
                </Button> */}
            </div>

            <Card className="border-none shadow-md">
                <CardContent className="p-0">
                    {patents.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[150px]">{t("patentNumber")}</TableHead>
                                            <TableHead>{t("title")}</TableHead>
                                            <TableHead className="w-[150px]">{t("date")}</TableHead>
                                            <TableHead className="w-[150px]">{t("status")}</TableHead>
                                            <TableHead className="text-right w-[100px] pr-6">{t("actions")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patents.map((patent) => (
                                            <TableRow key={patent.id} className="hover:bg-muted/5">
                                                <TableCell className="font-medium text-primary">
                                                    {patent.patent_number || `#${patent.id}`}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium line-clamp-1" title={patent.title}>
                                                        {patent.title}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {patent.created_at ? new Date(patent.created_at).toLocaleDateString() : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={patent.status === 1 ? "success" : "secondary"}>
                                                        {patent.status === 1 ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex justify-end gap-2">
                                                        <CustomLink href={`/patent/details/${patent.slug}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                <Eye className="h-4 w-4" />
                                                                <span className="sr-only">View</span>
                                                            </Button>
                                                        </CustomLink>
                                                        <CustomLink href={`/patent/edit/${patent.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                <Edit2 className="h-4 w-4" />
                                                                <span className="sr-only">{t("edit")}</span>
                                                            </Button>
                                                        </CustomLink>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {pagination && pagination.last_page > 1 && (
                                <div className="flex justify-between items-center p-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(pagination.current_page - 1) * pagination.per_page + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} entries
                                    </div>
                                    <div className="flex gap-2">
                                        {/* <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchMyPatents(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            {t("previous")}
                                        </Button> */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchMyPatents(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                        >
                                            {t("next")}
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-12">
                            <NoData name={t("patents")} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MyPatents;
