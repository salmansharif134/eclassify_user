import {
  formatDate,
  formatPriceAbbreviated,
  formatSalaryRange,
  t,
} from "@/utils";
import { BiBadgeCheck } from "react-icons/bi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import { manageFavouriteApi, buyerApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { userSignUpData, getIsLoggedIn } from "@/redux/reducer/authSlice";
import CustomLink from "@/components/Common/CustomLink";
import { toast } from "sonner";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import CustomImage from "./CustomImage";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ProductCard = ({ item, handleLike }) => {
  const userData = useSelector(userSignUpData);
  const isLoggedIn = useSelector(getIsLoggedIn);
  const [addingToCart, setAddingToCart] = useState(false);
  const isJobCategory = Number(item?.category?.is_job_category) === 1;
  const translated_item = item.translated_item;

  const isHidePrice = isJobCategory
    ? [item?.min_salary, item?.max_salary].every(
        (val) =>
          val === null ||
          val === undefined ||
          (typeof val === "string" && val.trim() === "")
      )
    : item?.price === null ||
      item?.price === undefined ||
      (typeof item?.price === "string" && item?.price.trim() === "");

  // ProductCard is used in buyer-facing contexts (home, search, etc.)
  // Always use /ad-details for buyer view
  // MyAdsCard component handles /my-listing route for seller's own listings
  const productLink = `/ad-details/${item.slug}`;

  const handleLikeItem = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!userData) {
        setIsLoginOpen(true);
        return;
      }
      const response = await manageFavouriteApi.manageFavouriteApi({
        item_id: item?.id,
      });
      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        handleLike(item?.id);
      } else {
        toast.error(t("failedToLike"));
      }
    } catch (error) {
      console.log(error);
      toast.error(t("failedToLike"));
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }

    // Only allow adding products to cart (not job categories)
    if (isJobCategory || isHidePrice) {
      return;
    }

    try {
      setAddingToCart(true);
      const response = await buyerApi.addToCart({
        product_id: item?.product_id || item?.id,
        quantity: 1,
      });
      
      if (response?.data?.error === false) {
        toast.success("Product added to cart!");
      } else {
        toast.error(response?.data?.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="border p-2 rounded-2xl flex flex-col gap-2 h-full">
      <CustomLink href={productLink} className="flex flex-col gap-2 flex-1">
        <div className="relative">
          <CustomImage
            src={item?.image}
            width={288}
            height={249}
            className="w-full aspect-square rounded object-cover"
            alt="Product"
          />
          {item?.is_feature && (
            <div className="flex items-center gap-1 ltr:rounded-tl rtl:rounded-tr py-0.5 px-1 bg-primary absolute top-0 ltr:left-0 rtl:right-0">
              <BiBadgeCheck size={16} color="white" />
              <p className="text-white text-xs sm:text-sm">{t("featured")}</p>
            </div>
          )}

          <div
            onClick={handleLikeItem}
            className="absolute h-10 w-10 ltr:right-2 rtl:left-2 top-2 bg-white p-2 rounded-full flex items-center justify-center text-primary"
          >
            {item?.is_liked ? (
              <button>
                <FaHeart size={24} className="like_icon" />
              </button>
            ) : (
              <button>
                <FaRegHeart size={24} className="like_icon" />
              </button>
            )}
          </div>
        </div>

        <div className="space-between gap-2">
          {isHidePrice ? (
            <p className="text-sm sm:text-base font-medium line-clamp-1">
              {translated_item?.name || item?.name}
            </p>
          ) : (
            <p
              className="text-sm sm:text-lg font-bold break-all text-balance line-clamp-2"
              title={
                isJobCategory
                  ? formatSalaryRange(item?.min_salary, item?.max_salary)
                  : formatPriceAbbreviated(item?.price)
              }
            >
              {isJobCategory
                ? formatSalaryRange(item?.min_salary, item?.max_salary)
                : formatPriceAbbreviated(item?.price)}
            </p>
          )}

          <p className="text-xs sm:text-sm opacity-65 whitespace-nowrap">
            {formatDate(item?.created_at)}&lrm;
          </p>
        </div>

        {!isHidePrice && (
          <p className="text-sm sm:text-base font-medium line-clamp-1">
            {translated_item?.name || item?.name}
          </p>
        )}
        <p className="text-xs sm:text-sm opacity-65 line-clamp-1">
          {item?.translated_address}
        </p>
      </CustomLink>
      
      {/* Add to Cart Button - only show for products (not job categories) */}
      {!isJobCategory && !isHidePrice && (
        <Button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="w-full mt-auto"
          size="sm"
          variant="outline"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {addingToCart ? "Adding..." : "Add to Cart"}
        </Button>
      )}
    </div>
  );
};

export default ProductCard;
