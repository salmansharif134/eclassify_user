import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import useAutoFocus from "../Common/useAutoFocus";
import { toast } from "sonner";
import { t } from "@/utils";
import { authApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { Fcmtoken } from "@/redux/reducer/settingSlice";
import { loadUpdateData } from "@/redux/reducer/authSlice";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const LoginWithEmailForm = ({ OnHide }) => {
  const emailRef = useAutoFocus();
  const fetchFCM = useSelector(Fcmtoken);
  const [loginStates, setLoginStates] = useState({
    email: "",
    password: "",
    IsPasswordVisible: false,
    showLoader: false,
  });

  const { email, password, IsPasswordVisible, showLoader } = loginStates;

  const Signin = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("emailRequired"));
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error(t("emailInvalid"));
      return;
    } else if (!password) {
      toast.error(t("passwordRequired"));
      return;
    } else if (password.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }

    try {
      setLoginStates((prev) => ({ ...prev, showLoader: true }));
      const response = await authApi.login({
        email,
        password,
        fcm_id: fetchFCM ? fetchFCM : "",
      });

      const data = response.data;
      if (data?.error === false || data?.error === "false") {
        loadUpdateData(data);
        toast.success(data.message);
        OnHide();
      } else {
        toast.error(data?.message || t("somethingWentWrong"));
      }
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        (error?.response?.data
          ? JSON.stringify(error.response.data)
          : null);
      console.error("Login error response:", error?.response || error);
      toast.error(serverMessage || t("somethingWentWrong"));
    } finally {
      setLoginStates((prev) => ({ ...prev, showLoader: false }));
    }
  };

  const handleForgotModal = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t("emailRequired"));
      return;
    }
    try {
      await authApi.forgotPassword({ email });
      toast.success(t("resetPassword"));
    } catch (error) {
      toast.error(error?.response?.data?.message || t("somethingWentWrong"));
    }
  };

  return (
    <>
      <form className="flex flex-col gap-6" onSubmit={Signin}>
        <div className="labelInputCont">
          <Label className="requiredInputLabel">{t("email")}</Label>
          <Input
            type="email"
            placeholder={t("enterEmail")}
            value={email}
            onChange={(e) =>
              setLoginStates((prev) => ({ ...prev, email: e.target.value }))
            }
            ref={emailRef}
          />
        </div>
        <div className="labelInputCont">
          <Label className="requiredInputLabel">{t("password")}</Label>
          <div className="flex items-center relative">
            <Input
              type={IsPasswordVisible ? "text" : "password"}
              placeholder={t("enterPassword")}
              className="ltr:pr-9 rtl:pl-9"
              value={password}
              onChange={(e) =>
                setLoginStates((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
            <button
              type="button"
              className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
              onClick={() =>
                setLoginStates((prev) => ({
                  ...prev,
                  IsPasswordVisible: !prev.IsPasswordVisible,
                }))
              }
            >
              {IsPasswordVisible ? (
                <FaRegEye size={20} />
              ) : (
                <FaRegEyeSlash size={20} />
              )}
            </button>
          </div>
          <button
            className="text-right font-semibold text-primary"
            onClick={handleForgotModal}
            type="button"
          >
            {t("forgtPassword")}
          </button>
        </div>
        <Button
          className="text-xl text-white font-light px-4 py-2"
          size="big"
          disabled={showLoader}
        >
          {showLoader ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            t("signIn")
          )}
        </Button>
      </form>
    </>
  );
};

export default LoginWithEmailForm;
