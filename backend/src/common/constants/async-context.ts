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
export function getRequestContext(): RequestContext | undefined {
  return asyncContext.getStore();
}
export function getCorrelationId(): string | undefined {
  const context = getRequestContext();
  return context?.correlationId;
}
export function setContextValue<K extends keyof RequestContext>(
  key: K,
  value: RequestContext[K],
): void {
  const context = getRequestContext();
  if (context) {
    context[key] = value;
  }
}
