import { logoutSuccess } from "@/redux/reducer/authSlice";
import { setIsUnauthorized } from "@/redux/reducer/globalStateSlice";
import { store } from "@/redux/store";
import axios from "axios";

// Use Next.js proxy in development to avoid CORS issues
// In production, use direct backend URL
const getBaseURL = () => {
  if (typeof window === 'undefined') {
    // Server-side: use direct backend URL
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${process.env.NEXT_PUBLIC_END_POINT || '/api/'}`;
  }
  
  // Client-side: use Next.js proxy in development to avoid CORS
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && process.env.NEXT_PUBLIC_API_URL) {
    // Use relative path to proxy through Next.js
    return `${process.env.NEXT_PUBLIC_END_POINT || '/api/'}`;
  }
  
  // Production or no proxy: use direct backend URL
  return `${process.env.NEXT_PUBLIC_API_URL || ''}${process.env.NEXT_PUBLIC_END_POINT || '/api/'}`;
};

const Api = axios.create({
  baseURL: getBaseURL(),
});

let isUnauthorizedToastShown = false;

// List of public endpoints that don't require authentication
const publicEndpoints = [
  'get-system-settings',
  'get-categories',
  'get-item',
  'get-featured-section',
  'get-slider',
  'get-languages',
  'get-package',
  'blogs',
  'faq',
  'countries',
  'states',
  'cities',
  'areas',
  'seo-settings',
  'get-seller',
  'auth/login',
  'auth/register',
  'auth/email/verify',
  'auth/email/resend',
  'auth/forgot-password',
];

// Function to check if token is valid
// - If it looks like a JWT (has dots), validate its structure
// - Otherwise treat it as an opaque token (e.g. Laravel Sanctum) and accept it
function isValidToken(token) {
  if (!token || typeof token !== "string") return false;
  const trimmed = token.trim();
  if (!trimmed) return false;

  // Opaque tokens (no dots) – accept as-is
  if (!trimmed.includes(".")) {
    return true;
  }

  // JWT-style tokens – basic structural validation
  try {
    const parts = trimmed.split(".");
    if (parts.length !== 3) return false;
    // Validate payload segment is decodable base64
    try {
      atob(parts[1]);
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

// Function to check if endpoint is public
function isPublicEndpoint(url) {
  if (!url) return false;
  return publicEndpoints.some(endpoint => url.includes(endpoint));
}

Api.interceptors.request.use(function (config) {
  let token = undefined;
  let langCode = undefined;

  if (typeof window !== "undefined") {
    const state = store.getState();
    token = state?.UserSignup?.data?.token;
    if (!token) {
      token = localStorage.getItem("token");
    }
    
    // Validate token before sending
    if (token && !isValidToken(token)) {
      // Only remove clearly invalid tokens
      console.warn("Invalid token format detected, removing from storage");
      localStorage.removeItem("token");
      token = undefined;
    }
    
    langCode = state?.CurrentLanguage?.language?.code;
  }

  // Only send token if it's valid
  if (token && isValidToken(token)) {
    config.headers.authorization = `Bearer ${token}`;
  }
  
  if (langCode) config.headers["Content-Language"] = langCode;

  return config;
});

// Add a response interceptor
Api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      
      // Clear invalid token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      
      // For public endpoints, don't show unauthorized modal
      // Just clear token and let the request fail gracefully
      if (isPublicEndpoint(url)) {
        logoutSuccess();
        // Don't show modal for public endpoints - they should work without auth
        return Promise.reject(error);
      }
      
      // For protected endpoints, show unauthorized modal only once
      logoutSuccess();
      if (!isUnauthorizedToastShown) {
        store.dispatch(setIsUnauthorized(true));
        isUnauthorizedToastShown = true;
        // Reset the flag after a certain period
        setTimeout(() => {
          isUnauthorizedToastShown = false;
        }, 5000); // 5 seconds delay before allowing another toast
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
