import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import favoritesReducer from './favoritesSlice.js';
import filterReducer from './filterSlice.js';
import themeReducer from './themeSlice.js';

/**
 * SSR-Safe Web Storage engine for Next.js 15 App Router.
 */
const createNoopStorage = () => ({
  getItem(_key) {
    return Promise.resolve(null);
  },
  setItem(_key, value) {
    return Promise.resolve(value);
  },
  removeItem(_key) {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== 'undefined'
    ? {
        getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
        setItem: (key, value) =>
          Promise.resolve(window.localStorage.setItem(key, value)),
        removeItem: (key) =>
          Promise.resolve(window.localStorage.removeItem(key)),
      }
    : createNoopStorage();

/**
 * Redux-Persist configuration.
 * Whitelists both 'favorites' and 'theme' for persistent cross-session retention.
 */
const persistConfig = {
  key: 'cinestream_root',
  storage,
  whitelist: ['favorites', 'theme'],
};

const rootReducer = combineReducers({
  favorites: favoritesReducer,
  filter: filterReducer,
  theme: themeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
