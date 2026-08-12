export const MULTIMEDIA_RUNTIME_UNAVAILABLE = "MULTIMEDIA_RUNTIME_UNAVAILABLE";

export function createBooruMediaRuntimeAccess(ctx) {
  let runtimePromise = null;
  let unavailableError = null;

  return {
    async requireRuntime() {
      if (unavailableError) throw unavailableError;
      if (!runtimePromise) {
        runtimePromise = Promise.resolve()
          .then(() => ctx.capabilities.media.requireRuntime())
          .catch((error) => {
            unavailableError = error;
            throw error;
          });
      }
      return runtimePromise;
    },
    isUnavailable() {
      return Boolean(unavailableError);
    },
  };
}

export function isSystemicMediaRuntimeError(error) {
  return error?.code === MULTIMEDIA_RUNTIME_UNAVAILABLE
    || error?.code === "PLUGIN_CAPABILITY_UNAVAILABLE"
    || /runtime multimedia de Nexus no esta disponible/i.test(String(error?.message || ""));
}
