function requireReactJsxRuntime() {
  const hostJsxRuntime = globalThis?.window?.__NEXUS_HOST_REACT_JSX_RUNTIME__;

  if (!hostJsxRuntime) {
    throw new Error("Nexus plugins renderer no encontro react/jsx-runtime del host en window.__NEXUS_HOST_REACT_JSX_RUNTIME__.");
  }

  return hostJsxRuntime;
}

module.exports = requireReactJsxRuntime();
