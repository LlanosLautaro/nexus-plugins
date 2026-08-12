function requireReactJsxDevRuntime() {
  const hostJsxDevRuntime = globalThis?.window?.__NEXUS_HOST_REACT_JSX_DEV_RUNTIME__;

  if (!hostJsxDevRuntime) {
    throw new Error("Nexus plugins renderer no encontro react/jsx-dev-runtime del host en window.__NEXUS_HOST_REACT_JSX_DEV_RUNTIME__.");
  }

  return hostJsxDevRuntime;
}

module.exports = requireReactJsxDevRuntime();
