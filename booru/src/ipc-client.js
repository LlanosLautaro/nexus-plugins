let runtimeIpc = null;

export function configurePluginIpc(ipc) {
  runtimeIpc = ipc;
}

function toOperation(channel) {
  return String(channel || "").replace(/^booru:/, "").replace(/:/g, ".");
}

export const pluginIpc = Object.freeze({
  invoke(channel, ...args) {
    if (!runtimeIpc) throw new Error("PLUGIN_IPC_NOT_READY");
    return runtimeIpc.invoke(toOperation(channel), ...args);
  },
});
