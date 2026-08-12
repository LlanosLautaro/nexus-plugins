let runtimeIpc = null;

export function configurePluginIpc(ipc) {
  runtimeIpc = ipc;
}

function toOperation(channel) {
  const operation = String(channel || "").replace(/^books:/, "").replace(/:/g, ".");
  return operation === "getByItemId" ? "get-by-item-id" : operation;
}

export const pluginIpc = Object.freeze({
  invoke(channel, ...args) {
    if (!runtimeIpc) throw new Error("PLUGIN_IPC_NOT_READY");
    return runtimeIpc.invoke(toOperation(channel), ...args);
  },
});
