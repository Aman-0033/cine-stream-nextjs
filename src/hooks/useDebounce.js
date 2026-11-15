'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a fast-changing value.
 * Designed to prevent per-keystroke API flooding and throttle requests to 500ms.
 *
 * @param {any} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (defaults to 500ms)
 * @returns {{ debouncedValue: any, isDebouncing: boolean }}
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  const isDebouncing = value !== debouncedValue;

  return { debouncedValue, isDebouncing };
}

export default useDebounce;
