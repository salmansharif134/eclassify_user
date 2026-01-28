import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/redux/store/providers";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import Script from "next/script";

const manrope = Manrope({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const generateMetadata = () => {
  const defaultTitle = "Mustang IP";
  const title = process.env.NEXT_PUBLIC_META_TITLE 
    ? process.env.NEXT_PUBLIC_META_TITLE.replace(/eClassify/gi, "Mustang IP")
    : defaultTitle;
  
  return {
    title: title,
    description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
    keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    openGraph: {
      title: title,
      description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
      keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
    },
  };
};

export default function RootLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Validate Google Client ID
  if (typeof window !== "undefined" && !googleClientId) {
    console.warn(
      "⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work."
    );
  }

  return (
    <html
      lang="en"
      web-version={process.env.NEXT_PUBLIC_WEB_VERSION}
      className="scroll-smooth"
    >
      <head>
        {/* <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxx"
          crossOrigin="anonymous" strategy="afterInteractive" /> */}
      </head>
      <body className={`${manrope.className} !pointer-events-auto`}>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <Providers>
              {children}
              <Toaster position="top-center" />
            </Providers>
          </GoogleOAuthProvider>
        ) : (
          <Providers>
            {children}
            <Toaster position="top-center" />
          </Providers>
        )}
        <div id="recaptcha-container"></div>
      </body>
    </html>
  );
}
