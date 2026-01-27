import {
  formatDateMonthYear,
  formatPriceAbbreviated,
  formatSalaryRange,
  t,
} from "@/utils/index";
import { FaHeart, FaRegCalendarCheck, FaRegHeart } from "react-icons/fa";
import { manageFavouriteApi, buyerApi } from "@/utils/api";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { getIsLoggedIn } from "@/redux/reducer/authSlice";
import { useSelector } from "react-redux";
import { getCompanyName } from "@/redux/reducer/settingSlice";
import ShareDropdown from "@/components/Common/ShareDropdown";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@/components/Common/useNavigate";

const ProductDetailCard = ({ productDetails, setProductDetails }) => {
  const path = usePathname();
  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${path}`;
  const translated_item = productDetails?.translated_item;
  const isLoggedIn = useSelector(getIsLoggedIn);
  const CompanyName = useSelector(getCompanyName);
  const { navigate } = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const FbTitle =
    (translated_item?.name || productDetails?.name) + " | " + CompanyName;
  const headline = `🚀 Discover the perfect deal! Explore "${
    translated_item?.name || productDetails?.name
  }" from ${CompanyName} and grab it before it's gone. Shop now at`;

  const isJobCategory = Number(productDetails?.category?.is_job_category) === 1;
  const isMyListing = path?.startsWith("/my-listing");

  const handleLikeItem = async () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const response = await manageFavouriteApi.manageFavouriteApi({
        item_id: productDetails?.id,
      });
      if (response?.data?.error === false) {
        setProductDetails((prev) => ({
          ...prev,
          is_liked: !productDetails?.is_liked,
        }));
      }
      toast.success(response?.data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    try {
      setAddingToCart(true);
      const response = await buyerApi.addToCart({
        product_id: productDetails?.id,
        quantity: 1,
      });
      if (response.data.error === false) {
        toast.success("Product added to cart!");
      } else {
        toast.error(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    navigate(`/checkout?product_id=${productDetails?.id}`);
  };

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-lg">
      <div className="flex justify-between max-w-full">
        <div className="flex flex-col gap-2">
          <h1
            className="text-2xl font-medium word-break-all line-clamp-2"
            title={translated_item?.name || productDetails?.name}
          >
            {translated_item?.name || productDetails?.name}
          </h1>
          <h2
            className="text-primary text-3xl font-bold break-all text-balance line-clamp-2"
            title={
              isJobCategory
                ? formatSalaryRange(
                    productDetails?.min_salary,
                    productDetails?.max_salary
                  )
                : formatPriceAbbreviated(productDetails?.price)
            }
          >
            {isJobCategory
              ? formatSalaryRange(
                  productDetails?.min_salary,
                  productDetails?.max_salary
                )
              : formatPriceAbbreviated(productDetails?.price)}
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <button
            className="rounded-full size-10 flex items-center justify-center p-2 border"
            onClick={handleLikeItem}
          >
            {productDetails?.is_liked === true ? (
              <FaHeart size={20} className="text-primary" />
            ) : (
              <FaRegHeart size={20} />
            )}
          </button>
          <ShareDropdown
            url={currentUrl}
            title={FbTitle}
            headline={headline}
            companyName={CompanyName}
            className="rounded-full p-2 border bg-white"
          />
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <FaRegCalendarCheck />
        {t("postedOn")}:{formatDateMonthYear(productDetails?.created_at)}
      </div>
      
      {/* Buy Now and Add to Cart buttons - only show for products (not job categories) and not for own listings */}
      {!isJobCategory && !isMyListing && productDetails?.price && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleBuyNow}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            <CreditCard size={18} className="mr-2" />
            Buy Now
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={addingToCart}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            {addingToCart ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductDetailCard;
