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
import { Edit2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import NoData from "@/components/EmptyStates/NoData";
import CustomLink from "@/components/Common/CustomLink";

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
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{t("myPatents")}</h1>
            </div>

            {patents.length > 0 ? (
                <>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("patentNumber")}</TableHead>
                                    <TableHead>{t("title")}</TableHead>
                                    <TableHead>{t("date")}</TableHead>
                                    <TableHead className="text-right">{t("actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patents.map((patent) => (
                                    <TableRow key={patent.id}>
                                        <TableCell className="font-medium">
                                            {patent.patent_number || patent.id}
                                        </TableCell>
                                        <TableCell>{patent.title}</TableCell>
                                        <TableCell>
                                            {patent.created_at ? new Date(patent.created_at).toLocaleDateString() : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <CustomLink href={`/patent/edit/${patent.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Edit2 className="h-4 w-4" />
                                                    <span className="sr-only">{t("edit")}</span>
                                                </Button>
                                            </CustomLink>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchMyPatents(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                {t("previous")}
                            </Button>
                            <span className="text-sm font-medium">
                                {t("page")} {pagination.current_page} {t("of")} {pagination.last_page}
                            </span>
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
                    )}
                </>
            ) : (
                <NoData name={t("patents")} />
            )}
        </div>
    );
};

export default MyPatents;
