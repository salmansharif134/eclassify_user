import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { t } from "@/utils";
import {
  Fcmtoken,
  getOtpServiceProvider,
  settingsData,
} from "@/redux/reducer/settingSlice";
import { useSelector } from "react-redux";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Button } from "../ui/button";
import { authApi, getOtpApi } from "@/utils/api";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import OtpScreen from "./OtpScreen";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import TermsAndPrivacyLinks from "./TermsAndPrivacyLinks";
import RegPasswordForm from "./RegPasswordForm";
import RegisterAuthInputField from "./RegisterAuthInputField";
import { setIsLoginOpen } from "@/redux/reducer/globalStateSlice";
import { Loader2 } from "lucide-react";

const RegisterModal = ({
  setIsMailSentSuccess,
  IsRegisterModalOpen,
  setIsRegisterModalOpen,
}) => {
  // Register with email or mobile checker state
  const [inputType, setInputType] = useState("");

  // Get Global data
  const settings = useSelector(settingsData);
  const auth = getAuth();
  const fetchFCM = useSelector(Fcmtoken);
  const isDemoMode = settings?.demo_mode;
  const otp_service_provider = useSelector(getOtpServiceProvider);

  // Different screens states
  const [IsLoginScreen, setIsLoginScreen] = useState(true);
  const [IsPasswordScreen, setIsPasswordScreen] = useState(false);
  const [IsOTPScreen, setIsOTPScreen] = useState(false);

  // Password visible or not
  const [IsPasswordVisible, setIsPasswordVisible] = useState(false);

  // Common input change value
  const [inputValue, setInputValue] = useState("");

  // Register with mobile number states
  const [number, setNumber] = useState(isDemoMode ? "919876598765" : "");
  const [countryCode, setCountryCode] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Loaders
  const [showLoader, setShowLoader] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Register with email states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Error states
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
  });

  // Active authentication methods
  const mobile_authentication = Number(settings?.mobile_authentication);
  const google_authentication = Number(settings?.google_authentication);
  const email_authentication = Number(settings?.email_authentication);

  // Remove any non-digit characters from the country code
  const countryCodeDigitsOnly = countryCode.replace(/\D/g, "");

  // Check if the entered number starts with the selected country code
  const startsWithCountryCode = number.startsWith(countryCodeDigitsOnly);

  // If the number starts with the country code, remove it
  const formattedNumber = startsWithCountryCode
    ? number.substring(countryCodeDigitsOnly.length)
    : number;

  const handleInputChange = (value, data) => {
    const emailRegexPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const containsOnlyDigits = /^\d+$/.test(value);
    setInputValue(value);
    if (emailRegexPattern.test(value)) {
      setInputType("email");
      setEmail(value);
      setNumber("");
      setCountryCode("");
      setRegionCode("");
    } else if (containsOnlyDigits) {
      setInputType("number");
      setNumber(value);
      setCountryCode("+" + (data?.dialCode || ""));
      setRegionCode(data?.countryCode.toLowerCase() || "");
    } else {
      setInputType("");
    }
  };

  const handleLoginSubmit = (e) => {
    setShowLoader(true);
    e.preventDefault();
    if (inputType === "email") {
      setIsPasswordScreen(true);
      setIsLoginScreen(false);
      setShowLoader(false);
    } else if (inputType === "number") {
      // Perform phone number validation on the formatted number
      if (isValidPhoneNumber(`${countryCode}${formattedNumber}`)) {
        sendOTP();
      } else {
        // Show an error message indicating that the phone number is not valid
        toast.error(t("invalidPhoneNumber"));
        setShowLoader(false);
      }
    } else {
      setShowLoader(false);
      if (email_authentication === 0 && mobile_authentication === 1) {
        toast.error(t("invalidPhoneNumber"));
      } else {
        toast.error(t("invalidPhoneNumberOrEmail"));
      }
    }
  };

  const OnHide = async () => {
    await recaptchaClear();
    setIsRegisterModalOpen(false);
  };
  const generateRecaptcha = () => {
    // Ensure auth object is properly initialized

    if (!window.recaptchaVerifier) {
      // Check if container element exists
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (!recaptchaContainer) {
        console.error("Container element 'recaptcha-container' not found.");
        return null; // Return null if container element not found
      }

      try {
        // Clear any existing reCAPTCHA instance
        recaptchaContainer.innerHTML = "";

        // Initialize RecaptchaVerifier
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
        return window.recaptchaVerifier;
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error.message);
        return null; // Return null if error occurs during initialization
      }
    }
    return window.recaptchaVerifier;
  };

  useEffect(() => {
    generateRecaptcha();

    return () => {
      // Clean up recaptcha container and verifier when component unmounts
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = "";
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null; // Clear the recaptchaVerifier reference
      }
    };
  }, []);

  const recaptchaClear = async () => {
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = "";
    }
    if (window.recaptchaVerifier) {
      window?.recaptchaVerifier?.recaptcha?.reset();
    }
  };

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      setShowLoader(true);
      const response = await authApi.googleLogin({
        token: credentialResponse.credential,
        fcm_id: fetchFCM ? fetchFCM : "",
      });
      const data = response.data;
      if (data?.error === true) {
        toast.error(data?.message);
      } else {
        toast.success(data?.message);
        OnHide();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t("somethingWentWrong"));
    } finally {
      setShowLoader(false);
    }
  };

  const handleGoogleSignupError = (error) => {
    console.error("Google OAuth Error:", error);
    if (error?.type === "popup_closed_by_user") {
      toast.error("Sign up cancelled");
    } else if (error?.error === "popup_blocked") {
      toast.error("Popup blocked. Please allow popups for this site.");
    } else {
      toast.error(
        "Google sign up failed. If you see 'origin_mismatch' error, please add your domain to Google Cloud Console."
      );
    }
  };

  const sendOtpWithTwillio = async (PhoneNumber) => {
    try {
      const response = await getOtpApi.getOtp({ number: PhoneNumber });
      if (response?.data?.error === false) {
        toast.success(t("otpSentSuccess"));
        setIsOTPScreen(true);
        setIsLoginScreen(false);
        setResendTimer(60); // Start the 60-second timer
      } else {
        toast.error(t("failedToSendOtp"));
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setShowLoader(false);
    }
  };

  const sendOtpWithFirebase = async (PhoneNumber) => {
    try {
      const appVerifier = generateRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        PhoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      toast.success(t("otpSentSuccess"));
      setIsOTPScreen(true);
      setIsLoginScreen(false);
    } catch (error) {
      console.log(error);
      const errorCode = error.code;
      handleFirebaseAuthError(errorCode);
    } finally {
      setShowLoader(false);
    }
  };

  const sendOTP = async () => {
    setShowLoader(true);
    const PhoneNumber = `${countryCode}${formattedNumber}`;
    if (otp_service_provider === "twilio") {
      await sendOtpWithTwillio(PhoneNumber);
    } else {
      await sendOtpWithFirebase(PhoneNumber);
    }
  };

  const Signin = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: "",
      username: "",
      password: "",
    };

    let hasErrors = false;

    if (!email) {
      newErrors.email = t("emailRequired") || "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("emailInvalid") || "Invalid email format";
      hasErrors = true;
    }
    if (username?.trim() === "") {
      newErrors.username = t("usernameRequired") || "Username is required";
      hasErrors = true;
    }
    if (!password) {
      newErrors.password = t("passwordRequired") || "Password is required";
      hasErrors = true;
    } else if (password.length < 6) {
      newErrors.password = t("passwordTooShort") || "Password must be at least 6 characters";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) {
      const firstError = Object.values(newErrors).find((error) => error);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    try {
      setShowLoader(true);
      try {
        await authApi.register({
          name: username ? username : "",
          email: email ? email : "",
          password,
        });
        OnHide();
        setIsMailSentSuccess(true);
      } catch (error) {
        // Handle server-side validation errors
        if (error?.response?.data?.errors) {
          const serverErrors = error.response.data.errors;
          const updatedErrors = { ...newErrors };
          
          if (serverErrors.email) {
            updatedErrors.email = Array.isArray(serverErrors.email) 
              ? serverErrors.email[0] 
              : serverErrors.email;
          }
          if (serverErrors.name || serverErrors.username) {
            updatedErrors.username = Array.isArray(serverErrors.name || serverErrors.username) 
              ? (serverErrors.name || serverErrors.username)[0] 
              : (serverErrors.name || serverErrors.username);
          }
          if (serverErrors.password) {
            updatedErrors.password = Array.isArray(serverErrors.password) 
              ? serverErrors.password[0] 
              : serverErrors.password;
          }
          
          setErrors(updatedErrors);
        }
        toast.error(error?.response?.data?.message || t("somethingWentWrong"));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t("somethingWentWrong"));
    } finally {
      setShowLoader(false);
    }
  };

  const handleShowLoginPassword = () => {
    setIsPasswordScreen(false);
    setIsOTPScreen(false);
    setIsLoginScreen(true);
  };
  const handleLoginClick = () => {
    OnHide();
    setIsLoginOpen(true);
  };

  const shouldShowForm =
    !(
      mobile_authentication === 0 &&
      email_authentication === 0 &&
      google_authentication === 1
    ) && IsLoginScreen;

  const showContinueButton =
    IsLoginScreen &&
    !(
      mobile_authentication === 0 &&
      email_authentication === 0 &&
      google_authentication === 1
    );

  const showOrSignInWith =
    IsLoginScreen &&
    !(
      mobile_authentication === 0 &&
      email_authentication === 0 &&
      google_authentication === 1
    ) &&
    google_authentication === 1;

  return (
    <>
      <Dialog open={IsRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="px-[40px] sm:py-[50px] sm:px-[90px]"
        >
          <DialogHeader>
            <DialogTitle className="text-3xl sm:text-4xl font-light">
              {IsPasswordScreen ? (
                t("signUpWithEmail")
              ) : IsOTPScreen ? (
                t("verifyOtp")
              ) : (
                <>
                  {t("welcomeTo")}{" "}
                  <span className="text-primary">{settings?.company_name}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base text-black font-light">
              {IsPasswordScreen ? (
                <>
                  {email}{" "}
                  <span
                    className="text-primary cursor-pointer underline"
                    onClick={handleShowLoginPassword}
                  >
                    {t("change")}
                  </span>
                </>
              ) : IsOTPScreen ? (
                <>
                  {t("sentTo")} {`+${number}`}{" "}
                  <span
                    className="text-primary cursor-pointer underline"
                    onClick={handleShowLoginPassword}
                  >
                    {t("change")}
                  </span>
                </>
              ) : (
                <>
                  {t("haveAccount")}{" "}
                  <span
                    className="text-primary cursor-pointer underline"
                    onClick={handleLoginClick}
                  >
                    {t("logIn")}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-[30px] mt-3.5">
            {shouldShowForm && (
              <form
                className="flex flex-col gap-6"
                onSubmit={handleLoginSubmit}
              >
                {mobile_authentication === 1 && email_authentication === 1 && (
                  <RegisterAuthInputField
                    type={inputType === "number" ? "phone" : "text"}
                    label="emailOrPhoneNumber"
                    placeholder="enterEmailPhone"
                    value={inputType === "number" ? number : inputValue}
                    handleInputChange={handleInputChange}
                    setCountryCode={setCountryCode}
                    t={t}
                  />
                )}
                {email_authentication === 1 && mobile_authentication === 0 && (
                  <RegisterAuthInputField
                    type="email"
                    label="email"
                    placeholder="enterEmail"
                    value={inputValue}
                    handleInputChange={handleInputChange}
                    t={t}
                  />
                )}

                {mobile_authentication === 1 && email_authentication === 0 && (
                  <RegisterAuthInputField
                    type="phone"
                    label="phoneNumber"
                    placeholder="enterPhoneNumber"
                    value={number}
                    handleInputChange={handleInputChange}
                    setCountryCode={setCountryCode}
                    t={t}
                  />
                )}

                {showContinueButton && (
                  <Button
                    type="submit"
                    disabled={showLoader}
                    className="text-xl text-white font-light px-4 py-2"
                    size="big"
                  >
                    {showLoader ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      t("continue")
                    )}
                  </Button>
                )}
              </form>
            )}

            {showOrSignInWith && (
              <div className="flex items-center gap-2">
                <hr className="w-full" />
                <p className="text-nowrap text-sm">{t("orSignInWith")}</p>
                <hr className="w-full" />
              </div>
            )}

            {IsLoginScreen && google_authentication === 1 && (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={handleGoogleSignupError}
                  text="signup_with"
                  theme="outline"
                  size="large"
                />
              </div>
            )}

            {IsLoginScreen && (
              <TermsAndPrivacyLinks t={t} settings={settings} OnHide={OnHide} />
            )}

            {IsPasswordScreen && (
              <RegPasswordForm
                username={username}
                setUsername={(value) => {
                  setUsername(value);
                  if (errors.username) {
                    setErrors((prev) => ({ ...prev, username: "" }));
                  }
                }}
                password={password}
                setPassword={(value) => {
                  setPassword(value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                IsPasswordVisible={IsPasswordVisible}
                setIsPasswordVisible={setIsPasswordVisible}
                showLoader={showLoader}
                Signin={Signin}
                t={t}
                errors={errors}
              />
            )}

            {IsOTPScreen && (
              <OtpScreen
                OnHide={OnHide}
                generateRecaptcha={generateRecaptcha}
                countryCode={countryCode}
                formattedNumber={formattedNumber}
                confirmationResult={confirmationResult}
                setConfirmationResult={setConfirmationResult}
                setResendTimer={setResendTimer}
                resendTimer={resendTimer}
                regionCode={regionCode}
                key={IsOTPScreen + "register-otp"}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegisterModal;
