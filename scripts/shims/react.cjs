function requireReact() {
  const hostReact = globalThis?.window?.__NEXUS_HOST_REACT__ || globalThis?.window?.React;

  if (!hostReact) {
    throw new Error("Nexus plugins renderer no encontro el React del host en window.__NEXUS_HOST_REACT__.");
  }

  return hostReact;
}

module.exports = requireReact();
