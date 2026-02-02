"use client";
import { t } from "@/utils";
import CustomLink from "@/components/Common/CustomLink";
import CustomImage from "./CustomImage";

const PatentCard = ({ item }) => {
    // Use the first image if available, otherwise a placeholder could be used
    // The structure based on user request: item.images[0].image_url
    const imageUrl = item?.images?.[0]?.image_url || item?.image;

    // Link to patent details - assuming a route structure. 
    // If patents are treated as ads, it might still be /ad-details, but generic /patent-details is safer given the distinct API.
    // Using id as slug might not be available in the provided JSON snippet.
    const patentLink = `/patent-details/${item?.id}`;

    return (
        <div className="border p-4 rounded-2xl flex flex-col gap-3 h-full bg-card hover:shadow-md transition-shadow">
            <CustomLink href={patentLink} className="flex flex-col gap-3 flex-1">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                    <CustomImage
                        src={imageUrl}
                        width={288}
                        height={216}
                        className="w-full h-full object-cover"
                        alt={item?.title || "Patent Image"}
                    />
                    {item?.patent_type && (
                        <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded shadow-sm opacity-90">
                            {item.patent_type}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg line-clamp-2" title={item?.title}>
                        {item?.title}
                    </h3>

                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {item?.patent_number && (
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-foreground">Patent #:</span>
                                {item.patent_number}
                            </p>
                        )}

                        {item?.patent_class && (
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-foreground">Class:</span>
                                {item.patent_class}
                            </p>
                        )}

                        {item?.inventor && (
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-foreground">Inventor:</span>
                                {item.inventor}
                            </p>
                        )}

                        {item?.assignee && (
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-foreground">Assignee:</span>
                                {item.assignee}
                            </p>
                        )}

                        {item?.filing_date && (
                            <p className="flex items-center gap-2">
                                <span className="font-medium text-foreground">Filed:</span>
                                {item.filing_date}
                            </p>
                        )}
                    </div>
                </div>
            </CustomLink>
        </div>
    );
};

export default PatentCard;
