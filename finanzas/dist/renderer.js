const React = window.React;

// ../nexus-plugins/finanzas/src/icons.jsx
var React2 = window.React;

// ../nexus-plugins/finanzas/src/PersonalFinanceView.jsx
var {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} = window.React;
var { ipcRenderer } = window.require("electron");
var CURRENCY_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
var LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium"
});
var DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short"
});
var MONTH_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  month: "short",
  year: "2-digit"
});

// ../nexus-plugins/finanzas/src/renderer.js
var finanzasRendererPlugin = {
  activate() {
  },
  deactivate() {
  }
};
var renderer_default = finanzasRendererPlugin;
export {
  renderer_default as default
};
//# sourceMappingURL=renderer.js.map
