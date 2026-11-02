/** Initialize within a request and retry failed starts after a short cooldown. */
export function createRetryableInitializer(
  initialize: () => Promise<void>,
  retryDelayMs = 5000,
  clock = Date.now,
) {
  let promise: Promise<void> | undefined, retryAt: number | undefined;
  return () => {
    if (!promise || (retryAt !== undefined && clock() >= retryAt)) {
      retryAt = undefined;
      promise = Promise.resolve()
        .then(initialize)
        .catch((error) => {
          retryAt = clock() + retryDelayMs;
          throw error;
        });
      // A later request retries; never run unmanaged background retry loops.
      void promise.catch(() => {});
    }
    return promise;
  };
}
