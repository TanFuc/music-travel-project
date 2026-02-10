/**
 * Async Context Storage
 * Provides request-scoped context using AsyncLocalStorage
 * Enables correlation ID and request metadata to be available throughout the request lifecycle
 */

import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
  requestId?: string;
  userId?: number;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  startTime?: number;
}

export const asyncContext = new AsyncLocalStorage<RequestContext>();

/**
 * Get the current request context
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncContext.getStore();
}

/**
 * Get the correlation ID from the current context
 */
export function getCorrelationId(): string | undefined {
  const context = getRequestContext();
  return context?.correlationId;
}

/**
 * Set a value in the current request context
 */
export function setContextValue<K extends keyof RequestContext>(
  key: K,
  value: RequestContext[K],
): void {
  const context = getRequestContext();
  if (context) {
    context[key] = value;
  }
}
