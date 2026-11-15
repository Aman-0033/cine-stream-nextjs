'use client';

import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store.js';
import { selectThemeMode } from './themeSlice.js';

/**
 * ThemeEffect
 *
 * Synchronizes the Redux theme slice state with the document root element.
 * Applies 'dark' or 'light' CSS classes and 'data-theme' attributes dynamically.
 */
function ThemeEffect() {
  const mode = useSelector(selectThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [mode]);

  return null;
}

/**
 * ReduxProvider Client Component
 *
 * Houses <Provider>, <PersistGate>, and <ThemeEffect>.
 */
export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeEffect />
        {children}
      </PersistGate>
    </Provider>
  );
}
