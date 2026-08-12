export const NEXUS_PLUGIN_API_VERSION = 2;
export { resolveItemLocationFromItemsState } from "./item-location.js";

export class NexusPluginError extends Error {
  constructor(code, message, { retryable = false, cause } = {}) {
    super(message, { cause });
    this.name = "NexusPluginError";
    this.code = code;
    this.retryable = Boolean(retryable);
  }
}

export function definePluginManifest(manifest) {
  if (manifest?.apiVersion !== NEXUS_PLUGIN_API_VERSION) {
    throw new NexusPluginError(
      "PLUGIN_API_VERSION_UNSUPPORTED",
      `Expected apiVersion ${NEXUS_PLUGIN_API_VERSION}.`,
    );
  }
  return Object.freeze({ ...manifest });
}
