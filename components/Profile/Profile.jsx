"use client";
import { t } from "@/utils";
import { MdAddPhotoAlternate, MdVerifiedUser } from "react-icons/md";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { loadUpdateUserData, userSignUpData } from "@/redux/reducer/authSlice";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Button, buttonVariants } from "../ui/button";
import { Fcmtoken, settingsData } from "@/redux/reducer/settingSlice";
import {
  getUserInfoApi,
  getVerificationStatusApi,
  updateProfileApi,
} from "@/utils/api";
import { toast } from "sonner";
import CustomLink from "@/components/Common/CustomLink";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidPhoneNumber } from "libphonenumber-js/max";

import ChangePasswordModal from "./ChangePasswordModal";

const Profile = () => {
  const UserData = useSelector(userSignUpData);
  const IsLoggedIn = UserData !== undefined && UserData !== null;
  const settings = useSelector(settingsData);
  const placeholder_image = settings?.placeholder_image;
  const [profileImage, setProfileImage] = useState("");
  const fetchFCM = useSelector(Fcmtoken);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    notification: 1,
    show_personal_details: 0,
    region_code: "",
    country_code: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [VerificationStatus, setVerificationStatus] = useState("");
  const [RejectionReason, setRejectionReason] = useState("");

  const getVerificationProgress = async () => {
    try {
      const res = await getVerificationStatusApi.getVerificationStatus();
      if (res?.data?.error === true) {
        setVerificationStatus("not applied");
      } else {
        const status = res?.data?.data?.status;
        const rejectReason = res?.data?.data?.rejection_reason;
        setVerificationStatus(status);
        setRejectionReason(rejectReason);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserDetails = async () => {
    try {
      const res = await getUserInfoApi.getUserInfo();
      if (res?.data?.error === false) {
        const region = (
          res?.data?.data?.region_code ||
          process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ||
          "in"
        ).toLowerCase();

        const countryCode =
          res?.data?.data?.country_code?.replace("+", "") || "91";

        setFormData({
          first_name: res?.data?.data?.first_name || "",
          last_name: res?.data?.data?.last_name || "",
          email: res?.data?.data?.email || "",
          phone: res?.data?.data?.mobile || "",
          address: res?.data?.data?.address || "",
          notification: res?.data?.data?.notification,
          show_personal_details: Number(res?.data?.data?.show_personal_details),
          region_code: region,
          country_code: countryCode,
        });
        setProfileImage(res?.data?.data?.profile || placeholder_image);
        const currentFcmId = UserData?.fcm_id;
        if (!res?.data?.data?.fcm_id && currentFcmId) {
          const updatedData = { ...res?.data?.data, fcm_id: currentFcmId };
          loadUpdateUserData(updatedData);
        } else {
          loadUpdateUserData(res?.data?.data);
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (IsLoggedIn) {
      const fetchData = async () => {
        setIsPending(true);
        try {
          await Promise.all([getVerificationProgress(), getUserDetails()]);
        } catch (error) {
          console.log("Error in parallel API calls:", error);
        } finally {
          setIsPending(false);
        }
      };
      fetchData();
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handlePhoneChange = (value, data) => {
    const dial = data?.dialCode || "";
    const iso2 = data?.countryCode || ""; // region code (in, us, ae)

    setFormData((prev) => {
      const pureMobile = value.startsWith(dial)
        ? value.slice(dial.length)
        : value;
      return {
        ...prev,
        phone: pureMobile,
        country_code: dial,
        region_code: iso2,
      };
    });
  };

  const handleSwitchChange = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: prevData[id] === 1 ? 0 : 1,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log("Image selected:", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log("FileReader loaded image preview");
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        console.log("Starting image upload API call...");
        setIsLoading(true);
        const response = await updateProfileApi.updateProfileImage({
          profile: file,
        });
        console.log("Image upload response:", response);
        const data = response.data;
        if (data.error !== true) {
          const currentFcmId = UserData?.fcm_id;
          if (!data?.data?.fcm_id && currentFcmId) {
            const updatedData = { ...data?.data, fcm_id: currentFcmId };
            loadUpdateUserData(updatedData);
          } else {
            loadUpdateUserData(data?.data);
          }
          toast.success(data.message);
        } else {
          console.error("API returned error:", data.message);
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(t("imageUploadFailed"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData?.first_name.trim() || !formData?.address.trim()) {
        toast.error(t("emptyFieldNotAllowed"));
        return;
      }
      const mobileNumber = formData.phone || "";

      // ✅ Validate phone number ONLY if user entered one as it is optional
      if (
        Boolean(mobileNumber) &&
        !isValidPhoneNumber(`+${formData.country_code}${mobileNumber}`)
      ) {
        toast.error(t("invalidPhoneNumber"));
        return;
      }
      setIsLoading(true);
      const response = await updateProfileApi.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile: mobileNumber,
        address: formData.address,
        fcm_id: fetchFCM ? fetchFCM : "",
        notification: formData.notification,
        country_code: formData.country_code,
        show_personal_details: formData?.show_personal_details,
        region_code: formData.region_code.toUpperCase(),
      });

      const data = response.data;
      if (data.error !== true) {
        const currentFcmId = UserData?.fcm_id;
        if (!data?.data?.fcm_id && currentFcmId) {
          const updatedData = { ...data?.data, fcm_id: currentFcmId };
          loadUpdateUserData(updatedData);
        } else {
          loadUpdateUserData(data?.data);
        }
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loader when pending is true
  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="relative w-12 h-12">
          <div className="absolute w-12 h-12 bg-primary rounded-full animate-ping"></div>
          <div className="absolute w-12 h-12 bg-primary rounded-full animate-ping delay-1000"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center sm:justify-between gap-4 md:border md:py-6 md:px-4 md:rounded">
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
          <div className="relative">
            {/* use next js image directly here */}
            {profileImage && (
              <Image
                src={profileImage}
                alt="User profile"
                width={120}
                height={120}
                className="w-[120px] h-auto aspect-square rounded-full border-muted border-4"
              />
            )}

            <div className="flex items-center justify-center p-1 absolute size-10 rounded-full top-20 right-0 bg-primary border-4 border-[#efefef] text-white cursor-pointer">
              <input
                type="file"
                id="profileImageUpload"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label htmlFor="profileImageUpload" className="cursor-pointer">
                <MdAddPhotoAlternate size={22} />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h1
              className="text-xl text-center ltr:md:text-left rtl:md:text-right font-medium break-words line-clamp-2"
              title={`${UserData?.first_name} ${UserData?.last_name}`}
            >
              {UserData?.first_name} {UserData?.last_name}
            </h1>
            <p className="break-all text-center ltr:md:text-left rtl:md:text-right">
              {UserData?.email}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:border md:py-6 md:px-4 md:rounded">
        <h1 className="col-span-full text-xl font-medium">
          {t("personalInfo")}
        </h1>

        <div className="labelInputCont">
          <Label htmlFor="first_name" className="requiredInputLabel">
            {t("firstName")}
          </Label>
          <Input
            type="text"
            id="first_name"
            placeholder={t("enterFirstName")}
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>

        <div className="labelInputCont">
          <Label htmlFor="last_name" className="requiredInputLabel">
            {t("lastName")}
          </Label>
          <Input
            type="text"
            id="last_name"
            placeholder={t("enterLastName")}
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>


        <div className="labelInputCont">
          <Label htmlFor="email" className="requiredInputLabel">
            {t("email")}
          </Label>
          <Input
            type="email"
            id="email"
            placeholder={t("enterEmail")}
            value={formData.email}
            onChange={handleChange}
            readOnly={
              UserData?.type === "email" || UserData?.type === "google"
                ? true
                : false
            }
          />
        </div>

        <div className="labelInputCont">
          <Label htmlFor="phone" className="font-semibold">
            {t("phoneNumber")}
          </Label>
          <PhoneInput
            country={"us"}
            value={`${formData.country_code}${formData.phone}`}
            onChange={(phone, data) => handlePhoneChange(phone, data)}
            inputProps={{
              name: "phone",
            }}
            enableLongNumbers
            disabled={UserData?.type === "phone"}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="w-1/2 flex flex-col justify-between gap-3">
            <Label className="font-semibold" htmlFor="notification-mode">
              {t("notification")}
            </Label>
            <Switch
              className="rtl:[direction:rtl]"
              id="notification-mode"
              checked={Number(formData.notification) === 1}
              onCheckedChange={() => handleSwitchChange("notification")}
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between gap-3">
            <Label className="font-semibold" htmlFor="showPersonal-mode">
              {t("showContactInfo")}
            </Label>
            <Switch
              id="showPersonal-mode"
              checked={Number(formData.show_personal_details) === 1}
              onCheckedChange={() =>
                handleSwitchChange("show_personal_details")
              }
            />
          </div>
        </div>
      </div>

      <div className="md:border md:py-6 md:px-4 md:rounded">
        <h1 className="col-span-full mb-6 text-xl font-medium">
          {t("address")}
        </h1>
        <div className="labelInputCont">
          <Label htmlFor="address" className="requiredInputLabel">
            {t("address")}
          </Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <ChangePasswordModal>
          <Button variant="outline" type="button">
            {t("changePassword")}
          </Button>
        </ChangePasswordModal>
        <Button disabled={isLoading} className="w-fit">
          {isLoading ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
};

export default Profile;
