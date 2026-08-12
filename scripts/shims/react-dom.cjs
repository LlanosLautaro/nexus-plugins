function requireReactDom() {
  const hostReactDom = globalThis?.window?.__NEXUS_HOST_REACT_DOM__;

  if (!hostReactDom) {
    throw new Error("Nexus plugins renderer no encontro react-dom del host en window.__NEXUS_HOST_REACT_DOM__.");
  }

  return hostReactDom;
}

module.exports = requireReactDom();
