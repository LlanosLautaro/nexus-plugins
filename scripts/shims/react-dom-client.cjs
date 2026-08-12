function requireReactDomClient() {
  const hostReactDomClient = globalThis?.window?.__NEXUS_HOST_REACT_DOM_CLIENT__;

  if (!hostReactDomClient?.createRoot) {
    throw new Error("Nexus plugins renderer no encontro react-dom/client del host en window.__NEXUS_HOST_REACT_DOM_CLIENT__.");
  }

  return hostReactDomClient;
}

module.exports = requireReactDomClient();
