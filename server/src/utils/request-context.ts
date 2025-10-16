import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  requestId: string;
  userId?: string;
};

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function runWithContext(context: RequestContext, fn: () => Promise<void> | void) {
  asyncLocalStorage.run(context, fn);
}

export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}
