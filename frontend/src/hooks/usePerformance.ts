import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for throttling function calls
 * @param callback Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, delay - (now - lastRan.current));
      }
    },
    [callback, delay]
  );
}

/**
 * Custom hook for debouncing function calls
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Custom hook for throttled scroll event listener
 * @param handler Scroll event handler
 * @param delay Throttle delay in milliseconds (default: 100ms)
 */
export function useThrottledScroll(
  handler: (event: Event) => void,
  delay: number = 100
): void {
  const throttledHandler = useThrottle(handler, delay);

  useEffect(() => {
    window.addEventListener('scroll', throttledHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandler);
    };
  }, [throttledHandler]);
}

/**
 * Custom hook for debounced window resize listener
 * @param handler Resize event handler
 * @param delay Debounce delay in milliseconds (default: 150ms)
 */
export function useDebouncedResize(
  handler: (event: Event) => void,
  delay: number = 150
): void {
  const debouncedHandler = useDebounce(handler, delay);

  useEffect(() => {
    window.addEventListener('resize', debouncedHandler, { passive: true });

    return () => {
      window.removeEventListener('resize', debouncedHandler);
    };
  }, [debouncedHandler]);
}
