"use client";
import Api from "@/api/AxiosInterceptors";
export const GET_SETTINGS = "get-system-settings";
export const GET_SEO_SETTINGS = "seo-settings";
export const GET_SLIDER = "get-slider";
export const GET_CATEGORIES = "get-categories";
export const GET_PARENT_CATEGORIES = "get-parent-categories";
export const GET_ITEM = "get-item";
export const GET_PACKAGE = "get-package";
export const GET_MEMBERSHIP_PLANS = "membership-plans";
export const GET_BLOGS = "blogs";
export const GET_BLOG_TAGS = "blog-tags";
export const GET_FEATURED_SECTION = "get-featured-section";
export const GET_FAQ = "faq";
export const GET_COUNTRIES = "countries";
export const GET_STATES = "states";
export const GET_CITIES = "cities";
export const GET_AREA = "areas";
export const GET_LANGUAGE = "get-languages";
export const GET_CUSTOM_FIELDS = "get-customfields";
export const MANAGE_FAVOURITE = "manage-favourite";
export const GET_FAVOURITE_ITEMS = "get-favourite-item";
export const GET_MY_ITEMS = "my-items";
export const GET_LIMITS = "get-limits";
export const DELETE_ITEM = "delete-item";
export const UPDATE_ITEM_STATUS = "update-item-status";
export const CREATE_FEATURED_ITEM = "make-item-featured";
export const CONTACT_US = "contact-us";
export const UPDATE_LISTING = "update-item";
export const USER_SIGNUP = "user-signup";
export const UPDATE_PROFILE = "update-profile";
export const DELETE_USER = "delete-user";
export const GET_REPORT_REASONS = "get-report-reasons";
export const ADD_REPORT = "add-reports";
export const GET_NOTIFICATION_LIST = "get-notification-list";
export const CHAT_LIST = "chat-list";
export const CHAT_MESSAGES = "chat-messages";
export const SEND_MESSAGE = "send-message";
export const BLOCK_USER = "block-user";
export const UNBLOCK_USER = "unblock-user";
export const BLOCKED_USERS = "blocked-users";
export const ASSIGN_FREE_PACKAGE = "assign-free-package";
export const GET_PAYMENT_SETTINGS = "get-payment-settings";
export const PAYMENT_INTENT = "payment-intent";
export const SELLER_CALCULATE_ORDER_TOTAL = "sellers/calculate-order-total";
export const SELLER_CREATE_PAYMENT_INTENT = "sellers/create-payment-intent";
export const PAYMENT_TRANSACTIONS = "payment-transactions";
export const TIPS = "tips";
export const ITEM_OFFER = "item-offer";
export const ADD_ITEM = "add-item";
export const GET_SELLER = "get-seller";
export const ITEM_BUYER_LIST = "item-buyer-list";
export const AD_ITEM_REVIEW = "add-item-review";
export const GET_VERIFICATION_FIELDS = "verification-fields";
export const SEND_VERIFICATION_REQUEST = "send-verification-request";
export const GET_VERIFICATION_STATUS = "verification-request";
export const MY_REVIEWS = "my-review";
export const RENEW_ITEM = "renew-item";
export const ADD_REPORT_REVIEW = "add-review-report";
export const BANK_TRANSFER_UPDATE = "bank-transfer-update";
export const JOB_APPLY = "job-apply";
export const MY_JOB_APPLICATIONS = "my-job-applications";
export const GET_JOB_APPLICATIONS = "get-job-applications";
export const UPDATE_JOB_STATUS = "update-job-applications-status";
export const GET_OTP = "get-otp";
export const VERIFY_OTP = "verify-otp";
export const GET_LOCATION = "get-location";
export const GET_USER_INFO = "get-user-info";
export const LOGOUT = "logout";
export const SET_ITEM_TOTAL_CLICK = "set-item-total-click";
export const AUTH_LOGIN = "auth/login";
export const AUTH_REGISTER = "auth/register";
export const AUTH_GOOGLE = "auth/google";
export const AUTH_FORGOT_PASSWORD = "auth/forgot-password";
export const AUTH_RESEND_VERIFICATION = "auth/email/resend";
export const PATENT_LOOKUP = "patents/lookup";
export const SELLER_SIGNUP = "sellers/register";
export const GET_SERVICES = "services";
export const CREATE_SERVICE_ORDER = "service-orders/create";
export const GET_SELLER_DASHBOARD = "sellers/dashboard";
export const ADD_PATENT = "sellers/patents";
export const SELLER_DASHBOARD_OVERVIEW = "seller/dashboard";
export const SELLER_ORDERS = "seller/orders";
export const SELLER_LISTINGS = "seller/listings";
export const SELLER_LISTINGS_META = "seller/listings/meta";
export const SELLER_LISTINGS_CATEGORIES = "seller/listings/categories";
export const SELLER_SHIPPING_PROFILES = "seller/shipping-profiles";
export const SELLER_LISTING_IMAGES = "seller/listings/images";
export const SELLER_CATEGORIES = "seller/categories";
export const SELLER_INVENTORY = "seller/inventory";
export const SELLER_PERFORMANCE = "seller/performance";
export const SELLER_MARKETING = "seller/marketing";
export const SELLER_PAYMENTS = "seller/payments";
export const SELLER_MESSAGES = "seller/messages";
export const SELLER_RETURNS = "seller/returns";
export const SELLER_ME = "seller/me";
export const SELLER_SETTINGS = "seller/settings";
export const BUYER_ORDERS = "buyer/orders";
export const BUYER_CREATE_ORDER = "buyer/orders/create";
export const BUYER_CART = "buyer/cart";
export const BUYER_ADD_TO_CART = "buyer/cart/add";
export const BUYER_REMOVE_FROM_CART = "buyer/cart/remove";
export const BUYER_CHECKOUT = "buyer/checkout";

export const authApi = {
  login: ({ email, password, fcm_id } = {}) => {
    return Api.post(AUTH_LOGIN, { email, password, fcm_id });
  },
  // Accept dynamic payload so we can support both legacy {name,email,password}
  // and new {first_name,last_name,email,password} registration.
  register: (payload = {}) => {
    return Api.post(AUTH_REGISTER, payload);
  },
  googleLogin: ({ token, fcm_id } = {}) => {
    return Api.post(AUTH_GOOGLE, { token, fcm_id });
  },
  forgotPassword: ({ email } = {}) => {
    return Api.post(AUTH_FORGOT_PASSWORD, { email });
  },
  resendVerification: ({ email } = {}) => {
    return Api.post(AUTH_RESEND_VERIFICATION, { email });
  },
};

// 1. SETTINGS API
export const settingsApi = {
  getSettings: ({ type } = {}) => {
    return Api.get(GET_SETTINGS, {
      params: { type },
    });
  },
};

// 2. SLIDER API
export const sliderApi = {
  getSlider: () => {
    return Api.get(GET_SLIDER, { params: {} });
  },
};

// 3. CATEGORY API
export const categoryApi = {
  getCategory: ({ category_id, page, type } = {}) => {
    return Api.get(GET_CATEGORIES, {
      params: {
        category_id,
        page,
        ...(type && { type }) // Add type parameter if provided ('products' or 'patents')
      },
    });
  },
};
// 3. MY ITEMS API
export const getMyItemsApi = {
  getMyItems: ({ sort_by, page, status, id, category_id, slug } = {}) => {
    return Api.get(GET_MY_ITEMS, {
      params: { page, sort_by, status, id, category_id, slug },
    });
  },
};
export const getLimitsApi = {
  getLimits: ({ package_type } = {}) => {
    return Api.get(GET_LIMITS, {
      params: { package_type },
    });
  },
};
export const getSellerApi = {
  getSeller: ({ id, page } = {}) => {
    return Api.get(GET_SELLER, {
      params: { id, page },
    });
  },
};
export const getVerificationStatusApi = {
  getVerificationStatus: () => {
    return Api.get(GET_VERIFICATION_STATUS, {});
  },
};
export const getItemBuyerListApi = {
  getItemBuyerList: ({ item_id } = {}) => {
    return Api.get(ITEM_BUYER_LIST, {
      params: { item_id },
    });
  },
};
export const getVerificationFiledsApi = {
  getVerificationFileds: () => {
    return Api.get(GET_VERIFICATION_FIELDS, {});
  },
};

// 4. ITEM API
export const allItemApi = {
  getItems: ({
    id,
    custom_fields,
    category_id,
    min_price,
    max_price,
    sort_by,
    posted_since,
    featured_section_id,
    status,
    page,
    search,
    country,
    state,
    city,
    slug,
    category_slug,
    featured_section_slug,
    area_id,
    latitude,
    longitude,
    radius,
    user_id,
    popular_items,
    limit,
    current_page,
    item_type, // NEW: 'products' or 'patents'
  } = {}) => {
    const resolvedStatus = status ?? "active";
    return Api.get(GET_ITEM, {
      params: {
        id,
        custom_fields,
        category_id,
        min_price,
        max_price,
        sort_by,
        posted_since,
        featured_section_id,
        status: resolvedStatus,
        page,
        search,
        country,
        state,
        city,
        slug,
        category_slug,
        featured_section_slug,
        area_id,
        latitude,
        longitude,
        radius,
        user_id,
        popular_items,
        limit,
        current_page,
        ...(item_type && { item_type }), // Add item_type parameter if provided
      },
    });
  },
};

// PACKAGE API

export const getPackageApi = {
  getPackage: ({ type } = {}) => {
    return Api.get(GET_PACKAGE, {
      params: {
        type,
      },
    });
  },
};

export const membershipPlansApi = {
  getPlans: () => {
    return Api.get(GET_MEMBERSHIP_PLANS, {
      params: {},
    });
  },
};

// BLOGS API
export const getBlogsApi = {
  getBlogs: ({ slug, category_id, sort_by, tag, page, views } = {}) => {
    return Api.get(GET_BLOGS, {
      params: {
        slug,
        category_id,
        sort_by,
        tag,
        page,
        views,
      },
    });
  },
};
// BLOGS API
export const getBlogTagsApi = {
  getBlogs: ({ } = {}) => {
    return Api.get(GET_BLOG_TAGS, {
      params: {},
    });
  },
};
export const getMyReviewsApi = {
  getMyReviews: ({ page } = {}) => {
    return Api.get(MY_REVIEWS, {
      params: {
        page,
      },
    });
  },
};

// 5. GET_FEATURED_SECTION
export const FeaturedSectionApi = {
  getFeaturedSections: ({
    city,
    state,
    country,
    slug,
    latitude,
    longitude,
    radius,
    area_id,
  } = {}) => {
    return Api.get(GET_FEATURED_SECTION, {
      params: {
        city,
        state,
        country,
        slug,
        latitude,
        longitude,
        radius,
        area_id,
      },
    });
  },
};
// FAQ API

export const getFaqApi = {
  getFaq: () => {
    return Api.get(GET_FAQ, {
      params: {},
    });
  },
};

// COUNTRY API

export const getCoutriesApi = {
  getCoutries: ({ search, page } = {}) => {
    return Api.get(GET_COUNTRIES, {
      params: {
        search,
        page,
      },
    });
  },
};

// STATES API

export const getStatesApi = {
  getStates: ({ country_id, search, page } = {}) => {
    return Api.get(GET_STATES, {
      params: {
        country_id,
        search,
        page,
      },
    });
  },
};

// CITIES API

export const getCitiesApi = {
  getCities: ({ state_id, search, page } = {}) => {
    return Api.get(GET_CITIES, {
      params: {
        state_id,
        search,
        page,
      },
    });
  },
};
export const getAreasApi = {
  getAreas: ({ city_id, search, page } = {}) => {
    return Api.get(GET_AREA, {
      params: {
        city_id,
        search,
        page,
      },
    });
  },
};

// language api

export const getLanguageApi = {
  getLanguage: ({ language_code, type } = {}) => {
    return Api.get(GET_LANGUAGE, {
      params: {
        language_code,
        type,
      },
    });
  },
};

export const userSignUpApi = {
  userSignup: ({
    name,
    email,
    mobile,
    fcm_id,
    firebase_id,
    type,
    profile,
    country_code,
    registration,
    region_code,
  } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (name) formData.append("name", name);
    if (email) formData.append("email", email);
    if (mobile) formData.append("mobile", mobile);
    if (fcm_id) formData.append("fcm_id", fcm_id);
    if (firebase_id) formData.append("firebase_id", firebase_id);
    if (type) formData.append("type", type);
    if (region_code) formData.append("region_code", region_code);

    // Assuming `profile` is a file object. If it's a URL or other type, handle accordingly.
    if (profile) {
      formData.append("profile", profile);
    }
    if (country_code) formData.append("country_code", country_code);
    if (registration) formData.append("registration", registration);

    return Api.post(USER_SIGNUP, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export const logoutApi = {
  logoutApi: ({ fcm_token } = {}) => {
    const formData = new FormData();
    if (fcm_token) formData.append("fcm_token", fcm_token);
    return Api.post(LOGOUT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const sendVerificationReqApi = {
  sendVerificationReq: ({
    verification_field_translations,
    verification_field_files,
  } = {}) => {
    const formData = new FormData();

    if (verification_field_translations)
      formData.append(
        "verification_field_translations",
        verification_field_translations
      );

    verification_field_files.forEach(({ key, files }) => {
      const file = Array.isArray(files) ? files[0] : files;
      if (file) {
        formData.append(`verification_field_files[${key}]`, file);
      }
    });

    return Api.post(SEND_VERIFICATION_REQUEST, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export const updateProfileApi = {
  updateProfile: ({
    name,
    email,
    mobile,
    fcm_id,
    address,
    profile,
    notification,
    show_personal_details,
    country_code,
    region_code,
  } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (name) formData.append("name", name);
    if (email) formData.append("email", email);
    formData.append("mobile", mobile);
    if (fcm_id) formData.append("fcm_id", fcm_id);
    if (address) formData.append("address", address);
    if (country_code) formData.append("country_code", country_code);

    // Assuming `profile` is a file object. If it's a URL or other type, handle accordingly.
    if (profile) {
      formData.append("profile", profile);
    }
    formData.append("notification", notification);
    formData.append("show_personal_details", show_personal_details);
    formData.append("region_code", region_code);

    return Api.post(UPDATE_PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// GET NOTIFICATION API

export const getNotificationList = {
  getNotification: ({ page } = {}) => {
    return Api.get(GET_NOTIFICATION_LIST, {
      params: {
        page: page,
      },
    });
  },
};

// ASSIGN FREE PACKAGE
export const assigFreePackageApi = {
  assignFreePackage: ({ package_id } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (package_id) formData.append("package_id", package_id);

    return Api.post(ASSIGN_FREE_PACKAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const addItemReviewApi = {
  addItemReview: ({ review, ratings, item_id } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (review) formData.append("review", review);
    if (ratings) formData.append("ratings", ratings);
    if (item_id) formData.append("item_id", item_id);

    return Api.post(AD_ITEM_REVIEW, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export const renewItemApi = {
  renewItem: ({ item_ids, package_id } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_ids) formData.append("item_ids", item_ids);
    if (package_id) formData.append("package_id", package_id);

    return Api.post(RENEW_ITEM, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// DELETE ITEM API

export const deleteItemApi = {
  deleteItem: ({ item_id, item_ids } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);
    if (item_ids) formData.append("item_ids", item_ids);
    return Api.post(DELETE_ITEM, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const chanegItemStatusApi = {
  changeItemStatus: ({ item_id, status, sold_to } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);
    if (status) formData.append("status", status);
    if (sold_to) formData.append("sold_to", sold_to);

    return Api.post(UPDATE_ITEM_STATUS, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export const createFeaturedItemApi = {
  createFeaturedItem: ({ item_id, positions } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);
    if (positions) formData.append("positions", positions);

    return Api.post(CREATE_FEATURED_ITEM, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
// getPackageSettingsApi
export const getPaymentSettingsApi = {
  getPaymentSettings: () => {
    return Api.get(GET_PAYMENT_SETTINGS, {
      params: {},
    });
  },
};
// createPaymentIntentApi
export const createPaymentIntentApi = {
  createIntent: ({ package_id, payment_method, platform_type } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (package_id) formData.append("package_id", package_id);
    if (payment_method) formData.append("payment_method", payment_method);
    if (platform_type) formData.append("platform_type", platform_type);

    return Api.post(PAYMENT_INTENT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export const sellerOrderApi = {
  calculateOrderTotal: ({ membership_plan, selected_services } = {}) => {

    return Api.post(SELLER_CALCULATE_ORDER_TOTAL, {
      membership_plan,
      selected_services,
    });
  },
  createPaymentIntent: ({ membership_plan, selected_services, payment_method } = {}) => {
    return Api.post(SELLER_CREATE_PAYMENT_INTENT, {
      membership_plan,
      selected_services,
      payment_method,
    });
  },
};
// deleteUserApi
export const deleteUserApi = {
  deleteUser: () => {
    return Api.delete(DELETE_USER, {
      params: {},
    });
  },
};
// paymentTransactionApi
export const paymentTransactionApi = {
  transaction: ({ page }) => {
    return Api.get(PAYMENT_TRANSACTIONS, {
      params: {
        page: page,
      },
    });
  },
};

// custom field api

export const getCustomFieldsApi = {
  getCustomFields: ({ category_ids, filter } = {}) => {
    return Api.get(GET_CUSTOM_FIELDS, {
      params: {
        category_ids,
        ...(filter !== undefined ? { filter } : {}),
      },
    });
  },
};

export const tipsApi = {
  tips: ({ } = {}) => {
    return Api.get(TIPS, {
      params: {},
    });
  },
};

export const itemOfferApi = {
  offer: ({ item_id, amount } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);
    if (amount) formData.append("amount", amount);

    return Api.post(ITEM_OFFER, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const chatListApi = {
  chatList: ({ type, page } = {}) => {
    return Api.get(CHAT_LIST, {
      params: {
        type,
        page,
      },
    });
  },
};

export const getMessagesApi = {
  chatMessages: ({ item_offer_id, page } = {}) => {
    return Api.get(CHAT_MESSAGES, {
      params: {
        item_offer_id,
        page,
      },
    });
  },
};
// add item api

export const addItemApi = {
  addItem: ({
    name,
    slug,
    description,
    category_id,
    all_category_ids,
    price,
    contact,
    video_link,
    custom_fields,
    image,
    gallery_images = [],
    address,
    latitude,
    longitude,
    custom_field_files = [],
    area_id,
    country,
    state,
    city,
    min_salary,
    max_salary,
    translations,
    custom_field_translations,
    region_code,
  } = {}) => {
    const formData = new FormData();
    // Append only if the value is defined and not an empty string

    if (name) formData.append("name", name);
    if (slug) formData.append("slug", slug);
    if (description) formData.append("description", description);
    if (category_id) formData.append("category_id", category_id);
    if (all_category_ids) formData.append("all_category_ids", all_category_ids);
    if (price) formData.append("price", price);
    if (contact) formData.append("contact", contact);
    if (video_link) formData.append("video_link", video_link);

    if (custom_fields)
      formData.append("custom_fields", JSON.stringify(custom_fields));

    if (image) formData.append("image", image);
    if (gallery_images.length > 0) {
      gallery_images.forEach((gallery_image, index) => {
        formData.append(`gallery_images[${index}]`, gallery_image);
      });
    }
    if (address) formData.append("address", address);
    if (latitude) formData.append("latitude", latitude);
    if (longitude) formData.append("longitude", longitude);

    // Append custom field files
    custom_field_files.forEach(({ key, files }) => {
      if (Array.isArray(files)) {
        files.forEach((file, index) =>
          formData.append(`custom_field_files[${key}]`, file)
        );
      } else {
        formData.append(`custom_field_files[${key}]`, files);
      }
    });

    if (country) formData.append("country", country);
    if (state) formData.append("state", state);
    if (city) formData.append("city", city);
    if (area_id) formData.append("area_id", area_id);
    if (min_salary) formData.append("min_salary", min_salary);
    if (max_salary) formData.append("max_salary", max_salary);
    if (region_code) formData.append("region_code", region_code);

    if (custom_field_translations)
      formData.append("custom_field_translations", custom_field_translations);

    if (translations) formData.append("translations", translations);

    return Api.post(ADD_ITEM, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Edit item API
export const editItemApi = {
  editItem: ({
    id,
    name,
    slug,
    description,
    category_id,
    all_category_ids,
    price,
    contact,
    video_link,
    custom_fields,
    image,
    gallery_images = [],
    address,
    latitude,
    longitude,
    custom_field_files = [],
    area_id,
    country,
    state,
    city,
    delete_item_image_id,
    min_salary,
    max_salary,
    translations,
    custom_field_translations,
    region_code,
    // expiry_date,
  } = {}) => {
    const formData = new FormData();
    // Append only if the value is defined and not an empty string
    if (id) formData.append("id", id);
    if (name) formData.append("name", name);
    if (slug) formData.append("slug", slug);
    if (description) formData.append("description", description);
    if (category_id) formData.append("category_id", category_id);
    if (all_category_ids) formData.append("all_category_ids", all_category_ids);
    if (price) formData.append("price", price);
    if (delete_item_image_id)
      formData.append("delete_item_image_id", delete_item_image_id);
    if (contact) formData.append("contact", contact);
    if (video_link) formData.append("video_link", video_link);
    if (latitude) formData.append("latitude", latitude);
    if (longitude) formData.append("longitude", longitude);
    if (custom_fields)
      formData.append("custom_fields", JSON.stringify(custom_fields));
    if (address) formData.append("address", address);
    if (contact) formData.append("contact", contact);
    if (country) formData.append("country", country);
    if (state) formData.append("state", state);
    // if (custom_field_files) formData.append("custom_field_files", custom_field_files)
    if (area_id) formData.append("area_id", area_id);
    if (city) formData.append("city", city);
    if (image != null) formData.append("image", image);
    if (gallery_images.length > 0) {
      gallery_images.forEach((gallery_image, index) => {
        formData.append(`gallery_images[${index}]`, gallery_image);
      });
    }
    if (region_code) formData.append("region_code", region_code);

    formData.append("min_salary", min_salary);
    formData.append("max_salary", max_salary);
    // if (expiry_date) formData.append("expiry_date", expiry_date);

    custom_field_files.forEach(({ key, files }) => {
      if (Array.isArray(files)) {
        files.forEach((file, index) =>
          formData.append(`custom_field_files[${key}]`, file)
        );
      } else {
        formData.append(`custom_field_files[${key}]`, files);
      }
    });

    if (custom_field_translations)
      formData.append("custom_field_translations", custom_field_translations);

    if (translations) formData.append("translations", translations);
    return Api.post(UPDATE_LISTING, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const sendMessageApi = {
  sendMessage: ({ item_offer_id, message, file, audio } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_offer_id) formData.append("item_offer_id", item_offer_id);
    if (message) formData.append("message", message);
    if (file) formData.append("file", file);
    if (audio) formData.append("audio", audio);

    return Api.post(SEND_MESSAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// favorite API
export const manageFavouriteApi = {
  manageFavouriteApi: ({ item_id } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);

    return Api.post(MANAGE_FAVOURITE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const getFavouriteApi = {
  getFavouriteApi: ({ page } = {}) => {
    return Api.get(GET_FAVOURITE_ITEMS, {
      params: {
        page,
      },
    });
  },
};

export const getReportReasonsApi = {
  reportReasons: ({ } = {}) => {
    return Api.get(GET_REPORT_REASONS, {
      params: {},
    });
  },
};

export const addReportReasonApi = {
  addReport: ({ item_id, report_reason_id, other_message } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);
    if (report_reason_id) formData.append("report_reason_id", report_reason_id);
    if (other_message) formData.append("other_message", other_message);

    return Api.post(ADD_REPORT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export const addReportReviewApi = {
  addReportReview: ({ seller_review_id, report_reason } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (seller_review_id) formData.append("seller_review_id", seller_review_id);
    if (report_reason) formData.append("report_reason", report_reason);

    return Api.post(ADD_REPORT_REVIEW, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const blockUserApi = {
  blockUser: ({ blocked_user_id } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (blocked_user_id) formData.append("blocked_user_id", blocked_user_id);

    return Api.post(BLOCK_USER, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export const unBlockUserApi = {
  unBlockUser: ({ blocked_user_id } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (blocked_user_id) formData.append("blocked_user_id", blocked_user_id);

    return Api.post(UNBLOCK_USER, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const getBlockedUsers = {
  blockedUsers: ({ } = {}) => {
    return Api.get(BLOCKED_USERS, {
      params: {},
    });
  },
};

export const contactUsApi = {
  contactUs: ({ name, email, subject, message } = {}) => {
    const formData = new FormData();
    // Append only if the value is defined and not an empty string
    if (name) formData.append("name", name);
    if (email) formData.append("email", email);
    if (subject) formData.append("subject", subject);
    if (message) formData.append("message", message);
    return Api.post(CONTACT_US, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
// get parent cate api
export const getParentCategoriesApi = {
  getPaymentCategories: ({ child_category_id, tree, slug } = {}) => {
    return Api.get(GET_PARENT_CATEGORIES, {
      params: {
        child_category_id,
        tree,
        slug,
      },
    });
  },
};

export const updateBankTransferApi = {
  updateBankTransfer: ({ payment_transection_id, payment_receipt } = {}) => {
    const formData = new FormData();
    if (payment_transection_id)
      formData.append("payment_transection_id", payment_transection_id);
    if (payment_receipt) formData.append("payment_receipt", payment_receipt);

    return Api.post(BANK_TRANSFER_UPDATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const jobApplyApi = {
  jobApply: ({ item_id, full_name, email, mobile, resume } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);
    if (full_name) formData.append("full_name", full_name);
    if (email) formData.append("email", email);
    if (mobile) formData.append("mobile", mobile);
    if (resume) formData.append("resume", resume);

    return Api.post(JOB_APPLY, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const getMyJobApplicationsList = {
  getMyJobApplications: ({ page } = {}) => {
    return Api.get(MY_JOB_APPLICATIONS, {
      params: {
        page: page,
      },
    });
  },
};

export const getAdJobApplicationsApi = {
  getAdJobApplications: ({ page, item_id } = {}) => {
    return Api.get(GET_JOB_APPLICATIONS, {
      params: {
        page: page,
        item_id: item_id,
      },
    });
  },
};

export const updateJobStatusApi = {
  updateJobStatus: ({ job_id, status } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (job_id) formData.append("job_id", job_id);
    if (status) formData.append("status", status);

    return Api.post(UPDATE_JOB_STATUS, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const verifyOtpApi = {
  verifyOtp: ({ number, otp } = {}) => {
    return Api.get(VERIFY_OTP, {
      params: {
        number: number,
        otp: otp,
      },
    });
  },
};
export const getOtpApi = {
  getOtp: ({ number } = {}) => {
    return Api.get(GET_OTP, {
      params: {
        number: number,
      },
    });
  },
};

export const getLocationApi = {
  getLocation: ({ lat, lng, lang, search, place_id, session_id } = {}) => {
    return Api.get(GET_LOCATION, {
      params: { lat, lng, lang, search, place_id, session_id },
    });
  },
};

export const getUserInfoApi = {
  getUserInfo: () => {
    return Api.get(GET_USER_INFO);
  },
};

export const setItemTotalClickApi = {
  setItemTotalClick: ({ item_id } = {}) => {
    const formData = new FormData();

    // Append only if the value is defined and not an empty string
    if (item_id) formData.append("item_id", item_id);

    return Api.post(SET_ITEM_TOTAL_CLICK, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// PATENT LOOKUP API
export const patentLookupApi = {
  lookup: ({ patent_number } = {}) => {
    return Api.post(PATENT_LOOKUP, { patent_number });
  },
};

// SELLER SIGNUP API
export const sellerSignupApi = {
  submit: (formData) => {
    return Api.post(SELLER_SIGNUP, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// SERVICES API
export const servicesApi = {
  getServices: () => {
    return Api.get(GET_SERVICES);
  },
  createOrder: (orderData) => {
    return Api.post(CREATE_SERVICE_ORDER, orderData);
  },
};

// SELLER DASHBOARD API
export const sellerDashboardApi = {
  getDashboard: (seller_id) => {
    return Api.get(`${GET_SELLER_DASHBOARD}/${seller_id}`);
  },
  addPatent: (seller_id, formData) => {
    return Api.post(`${ADD_PATENT}/${seller_id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// SELLER HUB (DYNAMIC) API
export const sellerHubApi = {
  getDashboard: ({ query } = {}) => Api.get(SELLER_DASHBOARD_OVERVIEW, { params: { query } }),
  getOrders: ({ page, perPage, status, payment, query, date } = {}) =>
    Api.get(SELLER_ORDERS, { params: { page, perPage, status, payment, query, date } }),
  getOrder: (orderId) => Api.get(`${SELLER_ORDERS}/${orderId}`),
  shipOrder: (orderId) => Api.post(`${SELLER_ORDERS}/${orderId}/ship`),
  deliverOrder: (orderId) => Api.post(`${SELLER_ORDERS}/${orderId}/deliver`),
  refundOrder: (orderId) => Api.post(`${SELLER_ORDERS}/${orderId}/refund`),
  getListings: ({ page, perPage, status, query } = {}) =>
    Api.get(SELLER_LISTINGS, { params: { page, perPage, status, query } }),
  getListing: (productId) => Api.get(`${SELLER_LISTINGS}/${productId}`),
  getListingMeta: () => Api.get(SELLER_LISTINGS_META),
  searchCategories: ({ query } = {}) =>
    Api.get(SELLER_LISTINGS_CATEGORIES, { params: { query } }),
  getSellerCategories: ({ page, perPage, query } = {}) =>
    Api.get(SELLER_CATEGORIES, { params: { page, perPage, query } }),
  createSellerCategory: (payload) => {
    const config = payload instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return Api.post(SELLER_CATEGORIES, payload, config);
  },
  updateSellerCategory: (categoryId, payload) => {
    const config = payload instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return Api.put(`${SELLER_CATEGORIES}/${categoryId}`, payload, config);
  },
  deleteSellerCategory: (categoryId) => Api.delete(`${SELLER_CATEGORIES}/${categoryId}`),
  createListing: (payload) => Api.post(SELLER_LISTINGS, payload),
  updateListing: (productId, payload) => Api.put(`${SELLER_LISTINGS}/${productId}`, payload),
  deleteListing: (productId) => Api.delete(`${SELLER_LISTINGS}/${productId}`),
  endListing: (productId) => Api.post(`${SELLER_LISTINGS}/${productId}/end`),
  duplicateListing: (productId) => Api.post(`${SELLER_LISTINGS}/${productId}/duplicate`),
  deleteListingImage: (imageId) => Api.delete(`${SELLER_LISTING_IMAGES}/${imageId}`),
  createShippingProfile: (payload) => Api.post(SELLER_SHIPPING_PROFILES, payload),
  getInventory: ({ page, perPage, lowStock, query } = {}) =>
    Api.get(SELLER_INVENTORY, { params: { page, perPage, lowStock, query } }),
  adjustInventory: (itemId, payload) => Api.post(`${SELLER_INVENTORY}/${itemId}/adjust`, payload),
  getPerformance: ({ query } = {}) => Api.get(SELLER_PERFORMANCE, { params: { query } }),
  getMarketing: ({ query } = {}) => Api.get(SELLER_MARKETING, { params: { query } }),
  getPayments: ({ page, perPage, query } = {}) =>
    Api.get(SELLER_PAYMENTS, { params: { page, perPage, query } }),
  getMessages: ({ page, perPage, query } = {}) =>
    Api.get(SELLER_MESSAGES, { params: { page, perPage, query } }),
  getThread: (threadId, { page, perPage } = {}) =>
    Api.get(`${SELLER_MESSAGES}/${threadId}`, { params: { page, perPage } }),
  sendMessage: (payload) => Api.post(SELLER_MESSAGES, payload),
  getReturns: ({ page, perPage, query } = {}) =>
    Api.get(SELLER_RETURNS, { params: { page, perPage, query } }),
  approveReturn: (returnId) => Api.post(`${SELLER_RETURNS}/${returnId}/approve`),
  rejectReturn: (returnId) => Api.post(`${SELLER_RETURNS}/${returnId}/reject`),
  getMe: () => Api.get(SELLER_ME),
  getSettings: () => Api.get(SELLER_SETTINGS),
  updateSettings: (payload) => Api.put(SELLER_SETTINGS, payload),
};

// BUYER API
export const buyerApi = {
  getOrders: ({ page, perPage, status, query } = {}) =>
    Api.get(BUYER_ORDERS, { params: { page, perPage, status, query } }),
  getOrder: (orderId) => Api.get(`${BUYER_ORDERS}/${orderId}`),
  createOrder: (payload) => Api.post(BUYER_CREATE_ORDER, payload),
  getCart: () => Api.get(BUYER_CART),
  addToCart: (payload) => Api.post(BUYER_ADD_TO_CART, payload),
  removeFromCart: (itemId) => Api.delete(`${BUYER_REMOVE_FROM_CART}/${itemId}`),
  updateCartItem: (itemId, payload) => Api.put(`${BUYER_CART}/${itemId}`, payload),
  checkout: (payload) => Api.post(BUYER_CHECKOUT, payload),
};
