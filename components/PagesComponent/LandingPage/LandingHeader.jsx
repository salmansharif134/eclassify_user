"use client";
import { t } from "@/utils";
import { useSelector } from "react-redux";
import { settingsData } from "@/redux/reducer/settingSlice";
import LandingMobileMenu from "@/components/PagesComponent/LandingPage/LandingMobileMenu";
import { useState } from "react";
import CustomImage from "@/components/Common/CustomImage";
import CustomLink from "@/components/Common/CustomLink";
import { useNavigate } from "@/components/Common/useNavigate";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

const LandingHeader = () => {
  const settings = useSelector(settingsData);
  const [isShowMobileMenu, setIsShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { navigate } = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-xs">
        <nav className="shadow-md">
          <div className="container py-5 lg:flex lg:items-center lg:justify-between gap-4">
            <div className="flex flex-1 items-center justify-between">
              <CustomLink
                href="/landing#anythingYouWant"
                className="flex-shrink-0"
              >
                <CustomImage
                  src={settings?.header_logo || "/assets/MustangIPLog01.png"}
                  className="w-full h-[52px] object-contain ltr:object-left rtl:object-right max-w-[195px]"
                  alt="MustangIP Logo"
                  width={195}
                  height={52}
                />
              </CustomLink>

              <LandingMobileMenu
                isOpen={isShowMobileMenu}
                setIsOpen={setIsShowMobileMenu}
              />
            </div>
            <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xl">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 border rounded-md py-2 px-3 flex-1"
              >
                <FaSearch size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("searchForPatent")}
                  className="text-sm outline-none w-full bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <CustomLink
                href="/free-evaluation"
                className="text-sm sm:text-base font-medium text-primary hover:underline"
              >
                FREE Evaluation
              </CustomLink>
              <CustomLink
                href="/seller-signup"
                className="bg-primary px-4 py-2 rounded-md text-white flex items-center gap-2 font-medium hover:opacity-90"
              >
                <IoIosAddCircleOutline size={18} />
                List Your Patent
              </CustomLink>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default LandingHeader;
