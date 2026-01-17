import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import settingsReducer from "../reducer/settingSlice";
import categoryReducer from '../reducer/categorySlice'
import BreadcrumbPathReducer from '../reducer/breadCrumbSlice'
import CurrentLanguageReducer from '../reducer/languageSlice'
import locationReducer from '../reducer/locationSlice';
import globalStateReducer from '../reducer/globalStateSlice';
import authReducer from '../reducer/authSlice'

// Create a noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Use localStorage only on client side, noop storage on server
let storage;
if (typeof window !== 'undefined') {
  storage = require('redux-persist/lib/storage').default;
} else {
  storage = createNoopStorage();
}

const persistConfig = {
  key: 'root',
  storage,
  manualPersisting: true,
};


const rootReducer = combineReducers({
  Settings: settingsReducer,
  Category: categoryReducer,
  UserSignup: authReducer,
  BreadcrumbPath: BreadcrumbPathReducer,
  CurrentLanguage: CurrentLanguageReducer,
  Location: locationReducer,
  GlobalState: globalStateReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      serializableCheck: false,
    }),
  ],
});

export const persistor = persistStore(store);
