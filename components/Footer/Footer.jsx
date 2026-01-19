"use client";
import CustomLink from "@/components/Common/CustomLink";
import { FaFacebook, FaLinkedin, FaPinterest } from "react-icons/fa";
import { FaInstagram, FaSquareXTwitter } from "react-icons/fa6";
import { SlLocationPin } from "react-icons/sl";
import { RiMailSendFill } from "react-icons/ri";
import { BiPhoneCall } from "react-icons/bi";
import { t } from "@/utils";
import { quickLinks } from "@/utils/constants";
import { useSelector } from "react-redux";
import { settingsData } from "@/redux/reducer/settingSlice";
import googleDownload from "../../public/assets/Google Download.png";
import appleDownload from "../../public/assets/iOS Download.png";
import { usePathname } from "next/navigation";
import { CurrentLanguageData } from "@/redux/reducer/languageSlice";
import CustomImage from "../Common/CustomImage";
import Link from "next/link";

export default function Footer() {
  const CurrentLanguage = useSelector(CurrentLanguageData);
  const pathname = usePathname();
  const settings = useSelector(settingsData);
  const currentYear = new Date().getFullYear();
  const showGetInTouchSection =
    settings?.company_address ||
    settings?.company_email ||
    settings?.company_tel1 ||
    settings?.company_tel2;

  const showDownloadLinks =
    settings?.play_store_link && settings?.app_store_link;

  const marginTop = showDownloadLinks ? "mt-[150px]" : "mt-48";

  return (
    <footer className={`bg-[#1a1a1a] text-white ${marginTop}`}>
      <div className="container py-12 relative">
        {showDownloadLinks && (
          <div className="relative bg-[#FF7F50] top-[-140px] lg:top-[-125px] xl:top-[-150px] p-6 xl:p-12 rounded-md flex flex-col lg:flex-row items-center justify-between">
            <h2 className="text-3xl md:text-4xl xl:text-5xl text-center lg:text-left text-balance font-light mb-4 md:mb-0 w-full">
              {t("experienceTheMagic")} {settings?.company_name} {t("app")}
            </h2>
            <div className="flex flex-row lg:flex-row items-center">
              {settings?.app_store_link && (
                <Link href={settings?.play_store_link}>
                  <CustomImage
                    src={googleDownload}
                    alt="google"
                    className="storeIcons"
                    width={235}
                    height={85}
                  />
                </Link>
              )}
              {settings?.app_store_link && (
                <Link href={settings?.app_store_link}>
                  <CustomImage
                    src={appleDownload}
                    alt="apple"
                    className="storeIcons"
                    width={235}
                    height={85}
                  />
                </Link>
              )}
            </div>
          </div>
        )}

        <div
          className={`grid grid-1 sm:grid-cols-12 gap-12 ${
            showDownloadLinks && "mt-[-70px] lg:mt-[-64px] xl:mt-[-75px]"
          }`}
        >
          {/* Company Info */}
          <div className="space-y-6 sm:col-span-12 lg:col-span-4">
            <CustomLink href="/">
              <CustomImage
                src={settings?.sidebar_logo || "/assets/MustangIPLog01.png"}
                alt="MustangIP Logo"
                width={195}
                height={52}
                className="w-full h-[52px] object-contain ltr:object-left rtl:object-right max-w-[195px]"
              />
            </CustomLink>
            <p className="text-gray-300 text-sm max-w-md">
              {settings?.footer_description}
            </p>
            <div className="flex items-center flex-wrap gap-6">
              {settings?.facebook_link && (
                <CustomLink
                  href={settings?.facebook_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <FaFacebook size={22} />
                </CustomLink>
              )}

              {settings?.instagram_link && (
                <Link
                  href={settings?.instagram_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <FaInstagram size={22} />
                </Link>
              )}

              {settings?.x_link && (
                <Link
                  href={settings?.x_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <FaSquareXTwitter size={22} />
                </Link>
              )}

              {settings?.linkedin_link && (
                <Link
                  href={settings?.linkedin_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin size={22} />
                </Link>
              )}

              {settings?.pinterest_link && (
                <Link
                  href={settings?.pinterest_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <FaPinterest size={22} />
                </Link>
              )}
            </div>
          </div>

          <div className="sm:col-span-12 lg:hidden border-t-2 border-dashed border-gray-500 w-full"></div>

          {/* Quick Links */}
          <div className="ltr:lg:border-l-2 rtl:lg:border-r-2 lg:border-dashed lg:border-gray-500 ltr:lg:pl-6 rtl:lg:pr-6 sm:col-span-6 lg:col-span-4">
            <h3 className="text-xl font-semibold mb-6">{t("quickLinks")}</h3>
            <nav className="space-y-4">
              {quickLinks.map((link) => (
                <CustomLink
                  key={link.id}
                  href={link.href}
                  className="group block hover:text-[var(--primary-color)] transition-colors"
                >
                  <span className="relative flex items-center">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-[10px] w-[10px] bg-[var(--primary-color)] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></span>
                    <span className="opacity-65 group-hover:text-[var(--primary-color)] group-hover:opacity-100 group-hover:ml-4 transition-all duration-500">
                      {t(link.labelKey)}
                    </span>
                  </span>
                </CustomLink>
              ))}
            </nav>
          </div>

          {/* Contact Information */}

          <div className="ltr:lg:border-l-2 rtl:lg:border-r-2 lg:border-dashed lg:border-gray-500 ltr:lg:pl-6 rtl:lg:pr-6 sm:col-span-6 lg:col-span-4">
            <h3 className="text-xl font-semibold mb-6">Contact</h3>
            <div className="space-y-6">
              <p className="footerLabel mb-4">
                The world's best marketplace for inventors, sellers, and buyers to connect. Where ideas, innovation, and investments are discussed, traded, and partnerships form.
              </p>

              <div className="flex items-center gap-3">
                <div className="footerContactIcons">
                  <RiMailSendFill size={22} />
                </div>
                <CustomLink
                  href="mailto:info@mustangip.com"
                  className="footerLabel"
                >
                  info@mustangip.com
                </CustomLink>
              </div>

              <div className="flex items-center gap-3">
                <div className="footerContactIcons">
                  <BiPhoneCall size={22} />
                </div>
                <CustomLink
                  href="tel:312-555-1234"
                  className="footerLabel"
                >
                  312-555-1234
                </CustomLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container">
        <div className="py-4 flex flex-wrap gap-3 justify-between items-center border-t-2 border-dashed border-gray-500">
          <p className="footerLabel">
            {t("copyright")} © {"MustangIP"} {currentYear}.{" "}
            {t("allRightsReserved")}
          </p>
          <div className="flex flex-wrap gap-4 whitespace-nowrap">
            <CustomLink href="/privacy-policy" className="footerLabel">
              {t("privacyPolicy")}
            </CustomLink>
            <CustomLink href="/terms-and-condition" className="footerLabel">
              {t("termsConditions")}
            </CustomLink>
            <CustomLink href="/refund-policy" className="footerLabel">
              {t("refundPolicy")}
            </CustomLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
