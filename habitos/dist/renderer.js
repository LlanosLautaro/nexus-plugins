const React = window.React;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to2, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/plugins/shims/react.cjs
var require_react = __commonJS({
  "scripts/plugins/shims/react.cjs"(exports, module) {
    function requireReact() {
      const hostReact = globalThis?.window?.__NEXUS_HOST_REACT__ || globalThis?.window?.React;
      if (!hostReact) {
        throw new Error("Nexus plugins renderer no encontro el React del host en window.__NEXUS_HOST_REACT__.");
      }
      return hostReact;
    }
    module.exports = requireReact();
  }
});

// node_modules/react-is/cjs/react-is.development.js
var require_react_is_development = __commonJS({
  "node_modules/react-is/cjs/react-is.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        var hasSymbol = typeof Symbol === "function" && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.element") : 60103;
        var REACT_PORTAL_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.portal") : 60106;
        var REACT_FRAGMENT_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.fragment") : 60107;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.strict_mode") : 60108;
        var REACT_PROFILER_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.profiler") : 60114;
        var REACT_PROVIDER_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.provider") : 60109;
        var REACT_CONTEXT_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.context") : 60110;
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.async_mode") : 60111;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.concurrent_mode") : 60111;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.forward_ref") : 60112;
        var REACT_SUSPENSE_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.suspense") : 60113;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.suspense_list") : 60120;
        var REACT_MEMO_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.memo") : 60115;
        var REACT_LAZY_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.lazy") : 60116;
        var REACT_BLOCK_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.block") : 60121;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.fundamental") : 60117;
        var REACT_RESPONDER_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.responder") : 60118;
        var REACT_SCOPE_TYPE = hasSymbol ? /* @__PURE__ */ Symbol.for("react.scope") : 60119;
        function isValidElementType(type) {
          return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
          type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
          if (typeof object === "object" && object !== null) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;
                switch (type) {
                  case REACT_ASYNC_MODE_TYPE:
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;
                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
          return void 0;
        }
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element3 = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment = REACT_FRAGMENT_TYPE;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;
        var Suspense = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false;
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
            }
          }
          return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isLazy(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element3;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});

// node_modules/react-is/index.js
var require_react_is = __commonJS({
  "node_modules/react-is/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_is_development();
    }
  }
});

// node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/object-assign/index.js"(exports, module) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from2;
      var to2 = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from2 = Object(arguments[s]);
        for (var key in from2) {
          if (hasOwnProperty.call(from2, key)) {
            to2[key] = from2[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from2);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from2, symbols[i])) {
              to2[symbols[i]] = from2[symbols[i]];
            }
          }
        }
      }
      return to2;
    };
  }
});

// node_modules/prop-types/lib/ReactPropTypesSecret.js
var require_ReactPropTypesSecret = __commonJS({
  "node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module) {
    "use strict";
    var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    module.exports = ReactPropTypesSecret;
  }
});

// node_modules/prop-types/lib/has.js
var require_has = __commonJS({
  "node_modules/prop-types/lib/has.js"(exports, module) {
    module.exports = Function.call.bind(Object.prototype.hasOwnProperty);
  }
});

// node_modules/prop-types/checkPropTypes.js
var require_checkPropTypes = __commonJS({
  "node_modules/prop-types/checkPropTypes.js"(exports, module) {
    "use strict";
    var printWarning = function() {
    };
    if (true) {
      ReactPropTypesSecret = require_ReactPropTypesSecret();
      loggedTypeFailures = {};
      has = require_has();
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    var ReactPropTypesSecret;
    var loggedTypeFailures;
    var has;
    function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
      if (true) {
        for (var typeSpecName in typeSpecs) {
          if (has(typeSpecs, typeSpecName)) {
            var error;
            try {
              if (typeof typeSpecs[typeSpecName] !== "function") {
                var err = Error(
                  (componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                );
                err.name = "Invariant Violation";
                throw err;
              }
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
            } catch (ex) {
              error = ex;
            }
            if (error && !(error instanceof Error)) {
              printWarning(
                (componentName || "React class") + ": type specification of " + location + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
              );
            }
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
              loggedTypeFailures[error.message] = true;
              var stack = getStack ? getStack() : "";
              printWarning(
                "Failed " + location + " type: " + error.message + (stack != null ? stack : "")
              );
            }
          }
        }
      }
    }
    checkPropTypes.resetWarningCache = function() {
      if (true) {
        loggedTypeFailures = {};
      }
    };
    module.exports = checkPropTypes;
  }
});

// node_modules/prop-types/factoryWithTypeCheckers.js
var require_factoryWithTypeCheckers = __commonJS({
  "node_modules/prop-types/factoryWithTypeCheckers.js"(exports, module) {
    "use strict";
    var ReactIs = require_react_is();
    var assign = require_object_assign();
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    var has = require_has();
    var checkPropTypes = require_checkPropTypes();
    var printWarning = function() {
    };
    if (true) {
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    function emptyFunctionThatReturnsNull() {
      return null;
    }
    module.exports = function(isValidElement, throwOnDirectAccess) {
      var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === "function") {
          return iteratorFn;
        }
      }
      var ANONYMOUS = "<<anonymous>>";
      var ReactPropTypes = {
        array: createPrimitiveTypeChecker("array"),
        bigint: createPrimitiveTypeChecker("bigint"),
        bool: createPrimitiveTypeChecker("boolean"),
        func: createPrimitiveTypeChecker("function"),
        number: createPrimitiveTypeChecker("number"),
        object: createPrimitiveTypeChecker("object"),
        string: createPrimitiveTypeChecker("string"),
        symbol: createPrimitiveTypeChecker("symbol"),
        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        elementType: createElementTypeTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker
      };
      function is(x, y) {
        if (x === y) {
          return x !== 0 || 1 / x === 1 / y;
        } else {
          return x !== x && y !== y;
        }
      }
      function PropTypeError(message, data) {
        this.message = message;
        this.data = data && typeof data === "object" ? data : {};
        this.stack = "";
      }
      PropTypeError.prototype = Error.prototype;
      function createChainableTypeChecker(validate) {
        if (true) {
          var manualPropTypeCallCache = {};
          var manualPropTypeWarningCount = 0;
        }
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
          componentName = componentName || ANONYMOUS;
          propFullName = propFullName || propName;
          if (secret !== ReactPropTypesSecret) {
            if (throwOnDirectAccess) {
              var err = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
              );
              err.name = "Invariant Violation";
              throw err;
            } else if (typeof console !== "undefined") {
              var cacheKey = componentName + ":" + propName;
              if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
              manualPropTypeWarningCount < 3) {
                printWarning(
                  "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
                );
                manualPropTypeCallCache[cacheKey] = true;
                manualPropTypeWarningCount++;
              }
            }
          }
          if (props[propName] == null) {
            if (isRequired) {
              if (props[propName] === null) {
                return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
              }
              return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
            }
            return null;
          } else {
            return validate(props, propName, componentName, location, propFullName);
          }
        }
        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);
        return chainedCheckType;
      }
      function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== expectedType) {
            var preciseType = getPreciseType(propValue);
            return new PropTypeError(
              "Invalid " + location + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
              { expectedType }
            );
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunctionThatReturnsNull);
      }
      function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
          }
          var propValue = props[propName];
          if (!Array.isArray(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
          }
          for (var i = 0; i < propValue.length; i++) {
            var error = typeChecker(propValue, i, componentName, location, propFullName + "[" + i + "]", ReactPropTypesSecret);
            if (error instanceof Error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!isValidElement(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!ReactIs.isValidElementType(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
          if (!(props[propName] instanceof expectedClass)) {
            var expectedClassName = expectedClass.name || ANONYMOUS;
            var actualClassName = getClassName(props[propName]);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
          if (true) {
            if (arguments.length > 1) {
              printWarning(
                "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
              );
            } else {
              printWarning("Invalid argument supplied to oneOf, expected an array.");
            }
          }
          return emptyFunctionThatReturnsNull;
        }
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          for (var i = 0; i < expectedValues.length; i++) {
            if (is(propValue, expectedValues[i])) {
              return null;
            }
          }
          var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
            var type = getPreciseType(value);
            if (type === "symbol") {
              return String(value);
            }
            return value;
          });
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
          }
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
          }
          for (var key in propValue) {
            if (has(propValue, key)) {
              var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error instanceof Error) {
                return error;
              }
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
          true ? printWarning("Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
          return emptyFunctionThatReturnsNull;
        }
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];
          if (typeof checker !== "function") {
            printWarning(
              "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i + "."
            );
            return emptyFunctionThatReturnsNull;
          }
        }
        function validate(props, propName, componentName, location, propFullName) {
          var expectedTypes = [];
          for (var i2 = 0; i2 < arrayOfTypeCheckers.length; i2++) {
            var checker2 = arrayOfTypeCheckers[i2];
            var checkerResult = checker2(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
            if (checkerResult == null) {
              return null;
            }
            if (checkerResult.data && has(checkerResult.data, "expectedType")) {
              expectedTypes.push(checkerResult.data.expectedType);
            }
          }
          var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          if (!isNode(props[propName])) {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function invalidValidatorError(componentName, location, propFullName, key, type) {
        return new PropTypeError(
          (componentName || "React class") + ": " + location + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
        );
      }
      function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          for (var key in shapeTypes) {
            var checker = shapeTypes[key];
            if (typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          var allKeys = assign({}, props[propName], shapeTypes);
          for (var key in allKeys) {
            var checker = shapeTypes[key];
            if (has(shapeTypes, key) && typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            if (!checker) {
              return new PropTypeError(
                "Invalid " + location + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
              );
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function isNode(propValue) {
        switch (typeof propValue) {
          case "number":
          case "string":
          case "undefined":
            return true;
          case "boolean":
            return !propValue;
          case "object":
            if (Array.isArray(propValue)) {
              return propValue.every(isNode);
            }
            if (propValue === null || isValidElement(propValue)) {
              return true;
            }
            var iteratorFn = getIteratorFn(propValue);
            if (iteratorFn) {
              var iterator = iteratorFn.call(propValue);
              var step;
              if (iteratorFn !== propValue.entries) {
                while (!(step = iterator.next()).done) {
                  if (!isNode(step.value)) {
                    return false;
                  }
                }
              } else {
                while (!(step = iterator.next()).done) {
                  var entry = step.value;
                  if (entry) {
                    if (!isNode(entry[1])) {
                      return false;
                    }
                  }
                }
              }
            } else {
              return false;
            }
            return true;
          default:
            return false;
        }
      }
      function isSymbol(propType, propValue) {
        if (propType === "symbol") {
          return true;
        }
        if (!propValue) {
          return false;
        }
        if (propValue["@@toStringTag"] === "Symbol") {
          return true;
        }
        if (typeof Symbol === "function" && propValue instanceof Symbol) {
          return true;
        }
        return false;
      }
      function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) {
          return "array";
        }
        if (propValue instanceof RegExp) {
          return "object";
        }
        if (isSymbol(propType, propValue)) {
          return "symbol";
        }
        return propType;
      }
      function getPreciseType(propValue) {
        if (typeof propValue === "undefined" || propValue === null) {
          return "" + propValue;
        }
        var propType = getPropType(propValue);
        if (propType === "object") {
          if (propValue instanceof Date) {
            return "date";
          } else if (propValue instanceof RegExp) {
            return "regexp";
          }
        }
        return propType;
      }
      function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch (type) {
          case "array":
          case "object":
            return "an " + type;
          case "boolean":
          case "date":
          case "regexp":
            return "a " + type;
          default:
            return type;
        }
      }
      function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
          return ANONYMOUS;
        }
        return propValue.constructor.name;
      }
      ReactPropTypes.checkPropTypes = checkPropTypes;
      ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});

// node_modules/prop-types/index.js
var require_prop_types = __commonJS({
  "node_modules/prop-types/index.js"(exports, module) {
    if (true) {
      ReactIs = require_react_is();
      throwOnDirectAccess = true;
      module.exports = require_factoryWithTypeCheckers()(ReactIs.isElement, throwOnDirectAccess);
    } else {
      module.exports = null();
    }
    var ReactIs;
    var throwOnDirectAccess;
  }
});

// scripts/plugins/shims/react-dom.cjs
var require_react_dom = __commonJS({
  "scripts/plugins/shims/react-dom.cjs"(exports, module) {
    function requireReactDom() {
      const hostReactDom = globalThis?.window?.__NEXUS_HOST_REACT_DOM__;
      if (!hostReactDom) {
        throw new Error("Nexus plugins renderer no encontro react-dom del host en window.__NEXUS_HOST_REACT_DOM__.");
      }
      return hostReactDom;
    }
    module.exports = requireReactDom();
  }
});

// node_modules/clsx/dist/clsx.js
var require_clsx = __commonJS({
  "node_modules/clsx/dist/clsx.js"(exports, module) {
    function r2(e2) {
      var o, t, f = "";
      if ("string" == typeof e2 || "number" == typeof e2) f += e2;
      else if ("object" == typeof e2) if (Array.isArray(e2)) {
        var n = e2.length;
        for (o = 0; o < n; o++) e2[o] && (t = r2(e2[o])) && (f && (f += " "), f += t);
      } else for (t in e2) e2[t] && (f && (f += " "), f += t);
      return f;
    }
    function e() {
      for (var e2, o, t = 0, f = "", n = arguments.length; t < n; t++) (e2 = arguments[t]) && (o = r2(e2)) && (f && (f += " "), f += o);
      return f;
    }
    module.exports = e, module.exports.clsx = e;
  }
});

// node_modules/react-draggable/build/cjs/Draggable.js
var require_Draggable = __commonJS({
  "node_modules/react-draggable/build/cjs/Draggable.js"(exports, module) {
    "use strict";
    var __create2 = Object.create;
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __getProtoOf2 = Object.getPrototypeOf;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to2, from2, except, desc) => {
      if (from2 && typeof from2 === "object" || typeof from2 === "function") {
        for (let key of __getOwnPropNames2(from2))
          if (!__hasOwnProp2.call(to2, key) && key !== except)
            __defProp2(to2, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc2(from2, key)) || desc.enumerable });
      }
      return to2;
    };
    var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var Draggable_exports = {};
    __export(Draggable_exports, {
      DraggableCore: () => DraggableCore2,
      default: () => Draggable2
    });
    module.exports = __toCommonJS(Draggable_exports);
    var React23 = __toESM2(require_react());
    var import_prop_types22 = __toESM2(require_prop_types());
    var import_react_dom22 = __toESM2(require_react_dom());
    var import_clsx4 = require_clsx();
    function findInArray2(array, callback2) {
      for (let i = 0, length = array.length; i < length; i++) {
        if (callback2.apply(callback2, [array[i], i, array])) return array[i];
      }
    }
    function isFunction3(func) {
      return typeof func === "function" || Object.prototype.toString.call(func) === "[object Function]";
    }
    function isNum2(num) {
      return typeof num === "number" && !isNaN(num);
    }
    function int2(a) {
      return parseInt(a, 10);
    }
    function dontSetMe2(props, propName, componentName) {
      if (props[propName]) {
        return new Error(`Invalid prop ${propName} passed to ${componentName} - do not set this, set it on the child.`);
      }
    }
    var prefixes2 = ["Moz", "Webkit", "O", "ms"];
    function getPrefix2(prop = "transform") {
      var _a, _b;
      if (typeof window === "undefined") return "";
      const style = (_b = (_a = window.document) == null ? void 0 : _a.documentElement) == null ? void 0 : _b.style;
      if (!style) return "";
      if (prop in style) return "";
      for (let i = 0; i < prefixes2.length; i++) {
        if (browserPrefixToKey2(prop, prefixes2[i]) in style) return prefixes2[i];
      }
      return "";
    }
    function browserPrefixToKey2(prop, prefix) {
      return prefix ? `${prefix}${kebabToTitleCase2(prop)}` : prop;
    }
    function kebabToTitleCase2(str) {
      let out = "";
      let shouldCapitalize = true;
      for (let i = 0; i < str.length; i++) {
        if (shouldCapitalize) {
          out += str[i].toUpperCase();
          shouldCapitalize = false;
        } else if (str[i] === "-") {
          shouldCapitalize = true;
        } else {
          out += str[i];
        }
      }
      return out;
    }
    var getPrefix_default2 = getPrefix2();
    var matchesSelectorFunc2 = "";
    function matchesSelector2(el, selector) {
      var _a;
      if (!matchesSelectorFunc2) {
        matchesSelectorFunc2 = (_a = findInArray2([
          "matches",
          "webkitMatchesSelector",
          "mozMatchesSelector",
          "msMatchesSelector",
          "oMatchesSelector"
        ], function(method) {
          return isFunction3(el[method]);
        })) != null ? _a : "";
      }
      const matchFn = el[matchesSelectorFunc2];
      if (!isFunction3(matchFn)) return false;
      return Boolean(matchFn.call(el, selector));
    }
    function matchesSelectorAndParentsTo2(el, selector, baseNode) {
      let node = el;
      do {
        if (matchesSelector2(node, selector)) return true;
        if (node === baseNode) return false;
        node = node.parentNode;
      } while (node);
      return false;
    }
    function addEvent2(el, event, handler, inputOptions) {
      if (!el) return;
      const options = { capture: true, ...inputOptions };
      const listener = handler;
      if (el.addEventListener) {
        el.addEventListener(event, listener, options);
      } else if (el.attachEvent) {
        el.attachEvent("on" + event, listener);
      } else {
        el["on" + event] = listener;
      }
    }
    function removeEvent2(el, event, handler, inputOptions) {
      if (!el) return;
      const options = { capture: true, ...inputOptions };
      const listener = handler;
      if (el.removeEventListener) {
        el.removeEventListener(event, listener, options);
      } else if (el.detachEvent) {
        el.detachEvent("on" + event, listener);
      } else {
        el["on" + event] = null;
      }
    }
    function outerHeight2(node) {
      let height = node.clientHeight;
      const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
      height += int2(computedStyle.borderTopWidth);
      height += int2(computedStyle.borderBottomWidth);
      return height;
    }
    function outerWidth2(node) {
      let width = node.clientWidth;
      const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
      width += int2(computedStyle.borderLeftWidth);
      width += int2(computedStyle.borderRightWidth);
      return width;
    }
    function innerHeight2(node) {
      let height = node.clientHeight;
      const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
      height -= int2(computedStyle.paddingTop);
      height -= int2(computedStyle.paddingBottom);
      return height;
    }
    function innerWidth2(node) {
      let width = node.clientWidth;
      const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
      width -= int2(computedStyle.paddingLeft);
      width -= int2(computedStyle.paddingRight);
      return width;
    }
    function offsetXYFromParent2(evt, offsetParent, scale) {
      const isBody = offsetParent === offsetParent.ownerDocument.body;
      const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();
      const x = (evt.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale;
      const y = (evt.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale;
      return { x, y };
    }
    function createCSSTransform2(controlPos, positionOffset) {
      const translation = getTranslation2(controlPos, positionOffset, "px");
      return { [browserPrefixToKey2("transform", getPrefix_default2)]: translation };
    }
    function createSVGTransform2(controlPos, positionOffset) {
      const translation = getTranslation2(controlPos, positionOffset, "");
      return translation;
    }
    function getTranslation2({ x, y }, positionOffset, unitSuffix) {
      let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`;
      if (positionOffset) {
        const defaultX = `${typeof positionOffset.x === "string" ? positionOffset.x : positionOffset.x + unitSuffix}`;
        const defaultY = `${typeof positionOffset.y === "string" ? positionOffset.y : positionOffset.y + unitSuffix}`;
        translation = `translate(${defaultX}, ${defaultY})` + translation;
      }
      return translation;
    }
    function getTouch2(e, identifier) {
      return e.targetTouches && findInArray2(e.targetTouches, (t) => identifier === t.identifier) || e.changedTouches && findInArray2(e.changedTouches, (t) => identifier === t.identifier);
    }
    function getTouchIdentifier2(e) {
      if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
      if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
    }
    function addUserSelectStyles2(doc) {
      if (!doc) return;
      let styleEl = doc.getElementById("react-draggable-style-el");
      if (!styleEl) {
        styleEl = doc.createElement("style");
        styleEl.type = "text/css";
        styleEl.id = "react-draggable-style-el";
        styleEl.innerHTML = ".react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n";
        styleEl.innerHTML += ".react-draggable-transparent-selection *::selection {all: inherit;}\n";
        doc.getElementsByTagName("head")[0].appendChild(styleEl);
      }
      if (doc.body) addClassName2(doc.body, "react-draggable-transparent-selection");
    }
    function scheduleRemoveUserSelectStyles2(doc) {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          removeUserSelectStyles2(doc);
        });
      } else {
        removeUserSelectStyles2(doc);
      }
    }
    function removeUserSelectStyles2(doc) {
      if (!doc) return;
      try {
        if (doc.body) removeClassName2(doc.body, "react-draggable-transparent-selection");
        const ieSelection = doc.selection;
        if (ieSelection) {
          ieSelection.empty();
        } else {
          const selection = (doc.defaultView || window).getSelection();
          if (selection && selection.type !== "Caret") {
            selection.removeAllRanges();
          }
        }
      } catch {
      }
    }
    function addClassName2(el, className) {
      if (el.classList) {
        el.classList.add(className);
      } else {
        if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
          el.className += ` ${className}`;
        }
      }
    }
    function removeClassName2(el, className) {
      if (el.classList) {
        el.classList.remove(className);
      } else {
        el.className = el.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`, "g"), "");
      }
    }
    function getBoundPosition2(draggable, x, y) {
      if (!draggable.props.bounds) return [x, y];
      let { bounds } = draggable.props;
      bounds = typeof bounds === "string" ? bounds : cloneBounds2(bounds);
      const node = findDOMNode2(draggable);
      if (typeof bounds === "string") {
        const { ownerDocument } = node;
        const ownerWindow = ownerDocument.defaultView;
        if (!ownerWindow) {
          throw new Error("Cannot resolve the owner window of the draggable node.");
        }
        let boundNode;
        if (bounds === "parent") {
          boundNode = node.parentNode;
        } else {
          const rootNode = node.getRootNode();
          boundNode = rootNode.querySelector(bounds);
        }
        if (!(boundNode instanceof ownerWindow.HTMLElement)) {
          throw new Error('Bounds selector "' + bounds + '" could not find an element.');
        }
        const boundNodeEl = boundNode;
        const nodeStyle = ownerWindow.getComputedStyle(node);
        const boundNodeStyle = ownerWindow.getComputedStyle(boundNodeEl);
        bounds = {
          left: -node.offsetLeft + int2(boundNodeStyle.paddingLeft) + int2(nodeStyle.marginLeft),
          top: -node.offsetTop + int2(boundNodeStyle.paddingTop) + int2(nodeStyle.marginTop),
          right: innerWidth2(boundNodeEl) - outerWidth2(node) - node.offsetLeft + int2(boundNodeStyle.paddingRight) - int2(nodeStyle.marginRight),
          bottom: innerHeight2(boundNodeEl) - outerHeight2(node) - node.offsetTop + int2(boundNodeStyle.paddingBottom) - int2(nodeStyle.marginBottom)
        };
      }
      if (isNum2(bounds.right)) x = Math.min(x, bounds.right);
      if (isNum2(bounds.bottom)) y = Math.min(y, bounds.bottom);
      if (isNum2(bounds.left)) x = Math.max(x, bounds.left);
      if (isNum2(bounds.top)) y = Math.max(y, bounds.top);
      return [x, y];
    }
    function snapToGrid2(grid, pendingX, pendingY) {
      const x = Math.round(pendingX / grid[0]) * grid[0];
      const y = Math.round(pendingY / grid[1]) * grid[1];
      return [x, y];
    }
    function canDragX2(draggable) {
      return draggable.props.axis === "both" || draggable.props.axis === "x";
    }
    function canDragY2(draggable) {
      return draggable.props.axis === "both" || draggable.props.axis === "y";
    }
    function getControlPosition2(e, touchIdentifier, draggableCore) {
      const touchObj = typeof touchIdentifier === "number" ? getTouch2(e, touchIdentifier) : null;
      if (typeof touchIdentifier === "number" && !touchObj) return null;
      const node = findDOMNode2(draggableCore);
      const offsetParent = draggableCore.props.offsetParent || node.offsetParent || node.ownerDocument.body;
      return offsetXYFromParent2(touchObj || e, offsetParent, draggableCore.props.scale);
    }
    function createCoreData2(draggable, x, y) {
      const isStart = !isNum2(draggable.lastX);
      const node = findDOMNode2(draggable);
      if (isStart) {
        return {
          node,
          deltaX: 0,
          deltaY: 0,
          lastX: x,
          lastY: y,
          x,
          y
        };
      } else {
        return {
          node,
          deltaX: x - draggable.lastX,
          deltaY: y - draggable.lastY,
          lastX: draggable.lastX,
          lastY: draggable.lastY,
          x,
          y
        };
      }
    }
    function createDraggableData2(draggable, coreData) {
      const scale = draggable.props.scale;
      return {
        node: coreData.node,
        x: draggable.state.x + coreData.deltaX / scale,
        y: draggable.state.y + coreData.deltaY / scale,
        deltaX: coreData.deltaX / scale,
        deltaY: coreData.deltaY / scale,
        lastX: draggable.state.x,
        lastY: draggable.state.y
      };
    }
    function cloneBounds2(bounds) {
      return {
        left: bounds.left,
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom
      };
    }
    function findDOMNode2(draggable) {
      const node = draggable.findDOMNode();
      if (!node) {
        throw new Error("<DraggableCore>: Unmounted during event!");
      }
      return node;
    }
    var React5 = __toESM2(require_react());
    var import_prop_types3 = __toESM2(require_prop_types());
    var import_react_dom3 = __toESM2(require_react_dom());
    function log2(...args) {
      if (process.env.DRAGGABLE_DEBUG) console.log(...args);
    }
    var eventsFor2 = {
      touch: {
        start: "touchstart",
        move: "touchmove",
        stop: "touchend"
      },
      mouse: {
        start: "mousedown",
        move: "mousemove",
        stop: "mouseup"
      }
    };
    var dragEventFor2 = eventsFor2.mouse;
    var DraggableCore2 = class extends React5.Component {
      constructor() {
        super(...arguments);
        this.dragging = false;
        this.lastX = NaN;
        this.lastY = NaN;
        this.touchIdentifier = null;
        this.mounted = false;
        this.handleDragStart = (e) => {
          this.props.onMouseDown(e);
          if (!this.props.allowAnyClick && (typeof e.button === "number" && e.button !== 0 || e.ctrlKey)) return false;
          const thisNode = this.findDOMNode();
          if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
            throw new Error("<DraggableCore> not mounted on DragStart!");
          }
          const { ownerDocument } = thisNode;
          if (this.props.disabled || !(e.target instanceof ownerDocument.defaultView.Node) || this.props.handle && !matchesSelectorAndParentsTo2(e.target, this.props.handle, thisNode) || this.props.cancel && matchesSelectorAndParentsTo2(e.target, this.props.cancel, thisNode)) {
            return;
          }
          if (e.type === "touchstart" && !this.props.allowMobileScroll) e.preventDefault();
          const touchIdentifier = getTouchIdentifier2(e);
          this.touchIdentifier = touchIdentifier;
          const position = getControlPosition2(e, touchIdentifier, this);
          if (position == null) return;
          const { x, y } = position;
          const coreEvent = createCoreData2(this, x, y);
          log2("DraggableCore: handleDragStart: %j", coreEvent);
          log2("calling", this.props.onStart);
          const shouldUpdate = this.props.onStart(e, coreEvent);
          if (shouldUpdate === false || this.mounted === false) return;
          if (this.props.enableUserSelectHack) addUserSelectStyles2(ownerDocument);
          this.dragging = true;
          this.lastX = x;
          this.lastY = y;
          addEvent2(ownerDocument, dragEventFor2.move, this.handleDrag);
          addEvent2(ownerDocument, dragEventFor2.stop, this.handleDragStop);
        };
        this.handleDrag = (e) => {
          const position = getControlPosition2(e, this.touchIdentifier, this);
          if (position == null) return;
          let { x, y } = position;
          if (Array.isArray(this.props.grid)) {
            let deltaX = x - this.lastX, deltaY = y - this.lastY;
            [deltaX, deltaY] = snapToGrid2(this.props.grid, deltaX, deltaY);
            if (!deltaX && !deltaY) return;
            x = this.lastX + deltaX;
            y = this.lastY + deltaY;
          }
          const coreEvent = createCoreData2(this, x, y);
          log2("DraggableCore: handleDrag: %j", coreEvent);
          const shouldUpdate = this.props.onDrag(e, coreEvent);
          if (shouldUpdate === false || this.mounted === false) {
            try {
              this.handleDragStop(new MouseEvent("mouseup"));
            } catch {
              const event = document.createEvent("MouseEvents");
              event.initMouseEvent("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
              this.handleDragStop(event);
            }
            return;
          }
          this.lastX = x;
          this.lastY = y;
        };
        this.handleDragStop = (e) => {
          if (!this.dragging) return;
          const position = getControlPosition2(e, this.touchIdentifier, this);
          if (position == null) return;
          let { x, y } = position;
          if (Array.isArray(this.props.grid)) {
            let deltaX = x - this.lastX || 0;
            let deltaY = y - this.lastY || 0;
            [deltaX, deltaY] = snapToGrid2(this.props.grid, deltaX, deltaY);
            x = this.lastX + deltaX;
            y = this.lastY + deltaY;
          }
          const coreEvent = createCoreData2(this, x, y);
          const shouldContinue = this.props.onStop(e, coreEvent);
          if (shouldContinue === false || this.mounted === false) return false;
          const thisNode = this.findDOMNode();
          if (thisNode) {
            if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles2(thisNode.ownerDocument);
          }
          log2("DraggableCore: handleDragStop: %j", coreEvent);
          this.dragging = false;
          this.lastX = NaN;
          this.lastY = NaN;
          if (thisNode) {
            log2("DraggableCore: Removing handlers");
            removeEvent2(thisNode.ownerDocument, dragEventFor2.move, this.handleDrag);
            removeEvent2(thisNode.ownerDocument, dragEventFor2.stop, this.handleDragStop);
          }
        };
        this.onMouseDown = (e) => {
          dragEventFor2 = eventsFor2.mouse;
          return this.handleDragStart(e);
        };
        this.onMouseUp = (e) => {
          dragEventFor2 = eventsFor2.mouse;
          return this.handleDragStop(e);
        };
        this.onTouchStart = (e) => {
          dragEventFor2 = eventsFor2.touch;
          return this.handleDragStart(e);
        };
        this.onTouchEnd = (e) => {
          dragEventFor2 = eventsFor2.touch;
          return this.handleDragStop(e);
        };
      }
      componentDidMount() {
        this.mounted = true;
        const thisNode = this.findDOMNode();
        if (thisNode) {
          addEvent2(thisNode, eventsFor2.touch.start, this.onTouchStart, { passive: false });
        }
      }
      componentWillUnmount() {
        this.mounted = false;
        const thisNode = this.findDOMNode();
        if (thisNode) {
          const { ownerDocument } = thisNode;
          removeEvent2(ownerDocument, eventsFor2.mouse.move, this.handleDrag);
          removeEvent2(ownerDocument, eventsFor2.touch.move, this.handleDrag);
          removeEvent2(ownerDocument, eventsFor2.mouse.stop, this.handleDragStop);
          removeEvent2(ownerDocument, eventsFor2.touch.stop, this.handleDragStop);
          removeEvent2(thisNode, eventsFor2.touch.start, this.onTouchStart, { passive: false });
          if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles2(ownerDocument);
        }
      }
      // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
      // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
      findDOMNode() {
        var _a;
        if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
          return this.props.nodeRef.current;
        }
        const legacyReactDOM = import_react_dom3.default;
        if (typeof legacyReactDOM.findDOMNode === "function") {
          return legacyReactDOM.findDOMNode(this);
        }
        log2(
          "react-draggable: ReactDOM.findDOMNode is not available in React 19+. You must provide a nodeRef prop. See: https://github.com/react-grid-layout/react-draggable#noderef"
        );
        return null;
      }
      render() {
        return React5.cloneElement(React5.Children.only(this.props.children), {
          // Note: mouseMove handler is attached to document so it will still function
          // when the user drags quickly and leaves the bounds of the element.
          onMouseDown: this.onMouseDown,
          onMouseUp: this.onMouseUp,
          // onTouchStart is added on `componentDidMount` so they can be added with
          // {passive: false}, which allows it to cancel. See
          // https://developers.google.com/web/updates/2017/01/scrolling-intervention
          onTouchEnd: this.onTouchEnd
        });
      }
    };
    DraggableCore2.displayName = "DraggableCore";
    DraggableCore2.propTypes = {
      /**
       * `allowAnyClick` allows dragging using any mouse button.
       * By default, we only accept the left button.
       *
       * Defaults to `false`.
       */
      allowAnyClick: import_prop_types3.default.bool,
      /**
       * `allowMobileScroll` turns off cancellation of the 'touchstart' event
       * on mobile devices. Only enable this if you are having trouble with click
       * events. Prefer using 'handle' / 'cancel' instead.
       *
       * Defaults to `false`.
       */
      allowMobileScroll: import_prop_types3.default.bool,
      children: import_prop_types3.default.node.isRequired,
      /**
       * `disabled`, if true, stops the <Draggable> from dragging. All handlers,
       * with the exception of `onMouseDown`, will not fire.
       */
      disabled: import_prop_types3.default.bool,
      /**
       * By default, we add 'user-select:none' attributes to the document body
       * to prevent ugly text selection during drag. If this is causing problems
       * for your app, set this to `false`.
       */
      enableUserSelectHack: import_prop_types3.default.bool,
      /**
       * `offsetParent`, if set, uses the passed DOM node to compute drag offsets
       * instead of using the parent node.
       */
      offsetParent: function(props, propName) {
        if (props[propName] && props[propName].nodeType !== 1) {
          throw new Error("Draggable's offsetParent must be a DOM Node.");
        }
      },
      /**
       * `grid` specifies the x and y that dragging should snap to.
       */
      grid: import_prop_types3.default.arrayOf(import_prop_types3.default.number),
      /**
       * `handle` specifies a selector to be used as the handle that initiates drag.
       *
       * Example:
       *
       * ```jsx
       *   let App = React.createClass({
       *       render: function () {
       *         return (
       *            <Draggable handle=".handle">
       *              <div>
       *                  <div className="handle">Click me to drag</div>
       *                  <div>This is some other content</div>
       *              </div>
       *           </Draggable>
       *         );
       *       }
       *   });
       * ```
       */
      handle: import_prop_types3.default.string,
      /**
       * `cancel` specifies a selector to be used to prevent drag initialization.
       *
       * Example:
       *
       * ```jsx
       *   let App = React.createClass({
       *       render: function () {
       *           return(
       *               <Draggable cancel=".cancel">
       *                   <div>
       *                     <div className="cancel">You can't drag from here</div>
       *                     <div>Dragging here works fine</div>
       *                   </div>
       *               </Draggable>
       *           );
       *       }
       *   });
       * ```
       */
      cancel: import_prop_types3.default.string,
      /* If running in React Strict mode, ReactDOM.findDOMNode() is deprecated.
       * Unfortunately, in order for <Draggable> to work properly, we need raw access
       * to the underlying DOM node. If you want to avoid the warning, pass a `nodeRef`
       * as in this example:
       *
       * function MyComponent() {
       *   const nodeRef = React.useRef(null);
       *   return (
       *     <Draggable nodeRef={nodeRef}>
       *       <div ref={nodeRef}>Example Target</div>
       *     </Draggable>
       *   );
       * }
       *
       * This can be used for arbitrarily nested components, so long as the ref ends up
       * pointing to the actual child DOM node and not a custom component.
       */
      nodeRef: import_prop_types3.default.object,
      /**
       * Called when dragging starts.
       * If this function returns the boolean false, dragging will be canceled.
       */
      onStart: import_prop_types3.default.func,
      /**
       * Called while dragging.
       * If this function returns the boolean false, dragging will be canceled.
       */
      onDrag: import_prop_types3.default.func,
      /**
       * Called when dragging stops.
       * If this function returns the boolean false, the drag will remain active.
       */
      onStop: import_prop_types3.default.func,
      /**
       * A workaround option which can be passed if onMouseDown needs to be accessed,
       * since it'll always be blocked (as there is internal use of onMouseDown)
       */
      onMouseDown: import_prop_types3.default.func,
      /**
       * `scale`, if set, applies scaling while dragging an element
       */
      scale: import_prop_types3.default.number,
      /**
       * These properties should be defined on the child, not here.
       */
      className: dontSetMe2,
      style: dontSetMe2,
      transform: dontSetMe2
    };
    DraggableCore2.defaultProps = {
      allowAnyClick: false,
      // by default only accept left click
      allowMobileScroll: false,
      disabled: false,
      enableUserSelectHack: true,
      onStart: function() {
      },
      onDrag: function() {
      },
      onStop: function() {
      },
      onMouseDown: function() {
      },
      scale: 1
    };
    var Draggable2 = class extends React23.Component {
      constructor(props) {
        super(props);
        this.onDragStart = (e, coreData) => {
          log2("Draggable: onDragStart: %j", coreData);
          const shouldStart = this.props.onStart(e, createDraggableData2(this, coreData));
          if (shouldStart === false) return false;
          this.setState({ dragging: true, dragged: true });
        };
        this.onDrag = (e, coreData) => {
          if (!this.state.dragging) return false;
          log2("Draggable: onDrag: %j", coreData);
          const uiData = createDraggableData2(this, coreData);
          const newState = {
            x: uiData.x,
            y: uiData.y,
            slackX: 0,
            slackY: 0
          };
          if (this.props.bounds) {
            const { x, y } = newState;
            newState.x += this.state.slackX;
            newState.y += this.state.slackY;
            const [newStateX, newStateY] = getBoundPosition2(this, newState.x, newState.y);
            newState.x = newStateX;
            newState.y = newStateY;
            newState.slackX = this.state.slackX + (x - newState.x);
            newState.slackY = this.state.slackY + (y - newState.y);
            uiData.x = newState.x;
            uiData.y = newState.y;
            uiData.deltaX = newState.x - this.state.x;
            uiData.deltaY = newState.y - this.state.y;
          }
          const shouldUpdate = this.props.onDrag(e, uiData);
          if (shouldUpdate === false) return false;
          this.setState(newState);
        };
        this.onDragStop = (e, coreData) => {
          if (!this.state.dragging) return false;
          const shouldContinue = this.props.onStop(e, createDraggableData2(this, coreData));
          if (shouldContinue === false) return false;
          log2("Draggable: onDragStop: %j", coreData);
          const newState = {
            dragging: false,
            slackX: 0,
            slackY: 0
          };
          const controlled = Boolean(this.props.position);
          if (controlled) {
            const { x, y } = this.props.position;
            newState.x = x;
            newState.y = y;
          }
          this.setState(newState);
        };
        this.state = {
          // Whether or not we are currently dragging.
          dragging: false,
          // Whether or not we have been dragged before.
          dragged: false,
          // Current transform x and y.
          x: props.position ? props.position.x : props.defaultPosition.x,
          y: props.position ? props.position.y : props.defaultPosition.y,
          prevPropsPosition: { ...props.position },
          // Used for compensating for out-of-bounds drags
          slackX: 0,
          slackY: 0,
          // Can only determine if SVG after mounting
          isElementSVG: false
        };
        if (props.position && !(props.onDrag || props.onStop)) {
          console.warn("A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element.");
        }
      }
      // React 16.3+
      // Arity (props, state)
      static getDerivedStateFromProps({ position }, { prevPropsPosition }) {
        if (position && (!prevPropsPosition || position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y)) {
          log2("Draggable: getDerivedStateFromProps %j", { position, prevPropsPosition });
          return {
            x: position.x,
            y: position.y,
            prevPropsPosition: { ...position }
          };
        }
        return null;
      }
      componentDidMount() {
        if (typeof window.SVGElement !== "undefined" && this.findDOMNode() instanceof window.SVGElement) {
          this.setState({ isElementSVG: true });
        }
      }
      componentWillUnmount() {
        if (this.state.dragging) {
          this.setState({ dragging: false });
        }
      }
      // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
      // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
      findDOMNode() {
        var _a;
        if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
          return this.props.nodeRef.current;
        }
        const legacyReactDOM = import_react_dom22.default;
        if (typeof legacyReactDOM.findDOMNode === "function") {
          return legacyReactDOM.findDOMNode(this);
        }
        return null;
      }
      render() {
        const {
          axis,
          bounds,
          children,
          defaultPosition,
          defaultClassName,
          defaultClassNameDragging,
          defaultClassNameDragged,
          position,
          positionOffset,
          scale,
          ...draggableCoreProps
        } = this.props;
        let style = {};
        let svgTransform = null;
        const controlled = Boolean(position);
        const draggable = !controlled || this.state.dragging;
        const validPosition = position || defaultPosition;
        const transformOpts = {
          // Set left if horizontal drag is enabled
          x: canDragX2(this) && draggable ? this.state.x : validPosition.x,
          // Set top if vertical drag is enabled
          y: canDragY2(this) && draggable ? this.state.y : validPosition.y
        };
        if (this.state.isElementSVG) {
          svgTransform = createSVGTransform2(transformOpts, positionOffset);
        } else {
          style = createCSSTransform2(transformOpts, positionOffset);
        }
        const onlyChild = React23.Children.only(children);
        const className = (0, import_clsx4.clsx)(onlyChild.props.className || "", defaultClassName, {
          [defaultClassNameDragging]: this.state.dragging,
          [defaultClassNameDragged]: this.state.dragged
        });
        return /* @__PURE__ */ React23.createElement(DraggableCore2, { ...draggableCoreProps, onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop }, React23.cloneElement(onlyChild, {
          className,
          style: { ...onlyChild.props.style, ...style },
          transform: svgTransform
        }));
      }
    };
    Draggable2.displayName = "Draggable";
    Draggable2.propTypes = {
      // Accepts all props <DraggableCore> accepts.
      ...DraggableCore2.propTypes,
      /**
       * `axis` determines which axis the draggable can move.
       *
       *  Note that all callbacks will still return data as normal. This only
       *  controls flushing to the DOM.
       *
       * 'both' allows movement horizontally and vertically.
       * 'x' limits movement to horizontal axis.
       * 'y' limits movement to vertical axis.
       * 'none' limits all movement.
       *
       * Defaults to 'both'.
       */
      axis: import_prop_types22.default.oneOf(["both", "x", "y", "none"]),
      /**
       * `bounds` determines the range of movement available to the element.
       * Available values are:
       *
       * 'parent' restricts movement within the Draggable's parent node.
       *
       * Alternatively, pass an object with the following properties, all of which are optional:
       *
       * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
       *
       * All values are in px.
       *
       * Example:
       *
       * ```jsx
       *   let App = React.createClass({
       *       render: function () {
       *         return (
       *            <Draggable bounds={{right: 300, bottom: 300}}>
       *              <div>Content</div>
       *           </Draggable>
       *         );
       *       }
       *   });
       * ```
       */
      bounds: import_prop_types22.default.oneOfType([
        import_prop_types22.default.shape({
          left: import_prop_types22.default.number,
          right: import_prop_types22.default.number,
          top: import_prop_types22.default.number,
          bottom: import_prop_types22.default.number
        }),
        import_prop_types22.default.string,
        import_prop_types22.default.oneOf([false])
      ]),
      defaultClassName: import_prop_types22.default.string,
      defaultClassNameDragging: import_prop_types22.default.string,
      defaultClassNameDragged: import_prop_types22.default.string,
      /**
       * `defaultPosition` specifies the x and y that the dragged item should start at
       *
       * Example:
       *
       * ```jsx
       *      let App = React.createClass({
       *          render: function () {
       *              return (
       *                  <Draggable defaultPosition={{x: 25, y: 25}}>
       *                      <div>I start with transformX: 25px and transformY: 25px;</div>
       *                  </Draggable>
       *              );
       *          }
       *      });
       * ```
       */
      defaultPosition: import_prop_types22.default.shape({
        x: import_prop_types22.default.number,
        y: import_prop_types22.default.number
      }),
      positionOffset: import_prop_types22.default.shape({
        x: import_prop_types22.default.oneOfType([import_prop_types22.default.number, import_prop_types22.default.string]),
        y: import_prop_types22.default.oneOfType([import_prop_types22.default.number, import_prop_types22.default.string])
      }),
      /**
       * `position`, if present, defines the current position of the element.
       *
       *  This is similar to how form elements in React work - if no `position` is supplied, the component
       *  is uncontrolled.
       *
       * Example:
       *
       * ```jsx
       *      let App = React.createClass({
       *          render: function () {
       *              return (
       *                  <Draggable position={{x: 25, y: 25}}>
       *                      <div>I start with transformX: 25px and transformY: 25px;</div>
       *                  </Draggable>
       *              );
       *          }
       *      });
       * ```
       */
      position: import_prop_types22.default.shape({
        x: import_prop_types22.default.number,
        y: import_prop_types22.default.number
      }),
      /**
       * These properties should be defined on the child, not here.
       */
      className: dontSetMe2,
      style: dontSetMe2,
      transform: dontSetMe2
    };
    Draggable2.defaultProps = {
      ...DraggableCore2.defaultProps,
      axis: "both",
      bounds: false,
      defaultClassName: "react-draggable",
      defaultClassNameDragging: "react-draggable-dragging",
      defaultClassNameDragged: "react-draggable-dragged",
      defaultPosition: { x: 0, y: 0 },
      scale: 1
    };
  }
});

// node_modules/react-draggable/build/cjs/cjs.js
var require_cjs = __commonJS({
  "node_modules/react-draggable/build/cjs/cjs.js"(exports, module) {
    "use strict";
    var Draggable2 = require_Draggable();
    var DraggableCore2 = Draggable2.DraggableCore;
    var Default = Draggable2.default || Draggable2;
    module.exports = Default;
    module.exports.default = Default;
    module.exports.DraggableCore = DraggableCore2;
  }
});

// node_modules/react-resizable/build/utils.js
var require_utils = __commonJS({
  "node_modules/react-resizable/build/utils.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.cloneElement = cloneElement3;
    var _react = _interopRequireDefault(require_react());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function ownKeys(e, r2) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r2 && (o = o.filter(function(r3) {
          return Object.getOwnPropertyDescriptor(e, r3).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread(e) {
      for (var r2 = 1; r2 < arguments.length; r2++) {
        var t = null != arguments[r2] ? arguments[r2] : {};
        r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
          _defineProperty(e, r3, t[r3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
          Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
        });
      }
      return e;
    }
    function _defineProperty(e, r2, t) {
      return (r2 = _toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }
    function _toPrimitive(t, r2) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r2 || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r2 ? String : Number)(t);
    }
    function cloneElement3(element, props) {
      if (props.style && element.props.style) {
        props.style = _objectSpread(_objectSpread({}, element.props.style), props.style);
      }
      if (props.className && element.props.className) {
        props.className = element.props.className + " " + props.className;
      }
      return /* @__PURE__ */ _react.default.cloneElement(element, props);
    }
  }
});

// node_modules/react-resizable/build/propTypes.js
var require_propTypes = __commonJS({
  "node_modules/react-resizable/build/propTypes.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.resizableProps = void 0;
    var _propTypes = _interopRequireDefault(require_prop_types());
    var _reactDraggable = require_cjs();
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var resizableProps = exports.resizableProps = {
      /*
      * Restricts resizing to a particular axis (default: 'both')
      * 'both' - allows resizing by width or height
      * 'x' - only allows the width to be changed
      * 'y' - only allows the height to be changed
      * 'none' - disables resizing altogether
      * */
      axis: _propTypes.default.oneOf(["both", "x", "y", "none"]),
      className: _propTypes.default.string,
      /*
      * Require that one and only one child be present.
      * */
      children: _propTypes.default.element.isRequired,
      /*
      * These will be passed wholesale to react-draggable's DraggableCore
      * */
      draggableOpts: _propTypes.default.shape({
        allowAnyClick: _propTypes.default.bool,
        cancel: _propTypes.default.string,
        children: _propTypes.default.node,
        disabled: _propTypes.default.bool,
        enableUserSelectHack: _propTypes.default.bool,
        // #251: Check for Element to support SSR environments where DOM globals don't exist
        offsetParent: typeof Element !== "undefined" ? _propTypes.default.instanceOf(Element) : _propTypes.default.any,
        grid: _propTypes.default.arrayOf(_propTypes.default.number),
        handle: _propTypes.default.string,
        nodeRef: _propTypes.default.object,
        onStart: _propTypes.default.func,
        onDrag: _propTypes.default.func,
        onStop: _propTypes.default.func,
        onMouseDown: _propTypes.default.func,
        scale: _propTypes.default.number
      }),
      /*
      * Initial height
      * */
      height: function() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        const props = args[0];
        if (props.axis === "both" || props.axis === "y") {
          return _propTypes.default.number.isRequired(...args);
        }
        return _propTypes.default.number(...args);
      },
      /*
      * Customize cursor resize handle
      * */
      handle: _propTypes.default.oneOfType([_propTypes.default.node, _propTypes.default.func]),
      /*
      * If you change this, be sure to update your css
      * */
      handleSize: _propTypes.default.arrayOf(_propTypes.default.number),
      lockAspectRatio: _propTypes.default.bool,
      /*
      * Max X & Y measure
      * */
      maxConstraints: _propTypes.default.arrayOf(_propTypes.default.number),
      /*
      * Min X & Y measure
      * */
      minConstraints: _propTypes.default.arrayOf(_propTypes.default.number),
      /*
      * Called on stop resize event
      * */
      onResizeStop: _propTypes.default.func,
      /*
      * Called on start resize event
      * */
      onResizeStart: _propTypes.default.func,
      /*
      * Called on resize event
      * */
      onResize: _propTypes.default.func,
      /*
      * Defines which resize handles should be rendered (default: 'se')
      * 's' - South handle (bottom-center)
      * 'w' - West handle (left-center)
      * 'e' - East handle (right-center)
      * 'n' - North handle (top-center)
      * 'sw' - Southwest handle (bottom-left)
      * 'nw' - Northwest handle (top-left)
      * 'se' - Southeast handle (bottom-right)
      * 'ne' - Northeast handle (top-center)
      * */
      resizeHandles: _propTypes.default.arrayOf(_propTypes.default.oneOf(["s", "w", "e", "n", "sw", "nw", "se", "ne"])),
      /*
      * If `transform: scale(n)` is set on the parent, this should be set to `n`.
      * */
      transformScale: _propTypes.default.number,
      /*
       * Initial width
       */
      width: function() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        const props = args[0];
        if (props.axis === "both" || props.axis === "x") {
          return _propTypes.default.number.isRequired(...args);
        }
        return _propTypes.default.number(...args);
      }
    };
  }
});

// node_modules/react-resizable/build/Resizable.js
var require_Resizable = __commonJS({
  "node_modules/react-resizable/build/Resizable.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.default = void 0;
    var React5 = _interopRequireWildcard(require_react());
    var _reactDraggable = require_cjs();
    var _utils = require_utils();
    var _propTypes = require_propTypes();
    var _excluded = ["children", "className", "draggableOpts", "width", "height", "handle", "handleSize", "lockAspectRatio", "axis", "minConstraints", "maxConstraints", "onResize", "onResizeStop", "onResizeStart", "resizeHandles", "transformScale"];
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r2 = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, default: e2 };
        if (null === e2 || "object" != typeof e2 && "function" != typeof e2) return f;
        if (o = t2 ? n : r2) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (const t3 in e2) "default" !== t3 && {}.hasOwnProperty.call(e2, t3) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, t3)) && (i.get || i.set) ? o(f, t3, i) : f[t3] = e2[t3]);
        return f;
      })(e, t);
    }
    function _extends() {
      return _extends = Object.assign ? Object.assign.bind() : function(n) {
        for (var e = 1; e < arguments.length; e++) {
          var t = arguments[e];
          for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
        }
        return n;
      }, _extends.apply(null, arguments);
    }
    function _objectWithoutPropertiesLoose(r2, e) {
      if (null == r2) return {};
      var t = {};
      for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r2[n];
      }
      return t;
    }
    function ownKeys(e, r2) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r2 && (o = o.filter(function(r3) {
          return Object.getOwnPropertyDescriptor(e, r3).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread(e) {
      for (var r2 = 1; r2 < arguments.length; r2++) {
        var t = null != arguments[r2] ? arguments[r2] : {};
        r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
          _defineProperty(e, r3, t[r3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
          Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
        });
      }
      return e;
    }
    function _defineProperty(e, r2, t) {
      return (r2 = _toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }
    function _toPrimitive(t, r2) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r2 || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r2 ? String : Number)(t);
    }
    var Resizable2 = class extends React5.Component {
      constructor() {
        super(...arguments);
        this.handleRefs = {};
        this.lastHandleRect = null;
        this.slack = null;
        this.lastSize = null;
      }
      componentWillUnmount() {
        this.resetData();
      }
      resetData() {
        this.lastHandleRect = this.slack = this.lastSize = null;
      }
      // Clamp width and height within provided constraints
      runConstraints(width, height) {
        const _this$props = this.props, minConstraints = _this$props.minConstraints, maxConstraints = _this$props.maxConstraints, lockAspectRatio = _this$props.lockAspectRatio;
        if (!minConstraints && !maxConstraints && !lockAspectRatio) return [width, height];
        if (lockAspectRatio) {
          const ratio = this.props.width / this.props.height;
          const deltaW = width - this.props.width;
          const deltaH = height - this.props.height;
          if (Math.abs(deltaW) > Math.abs(deltaH * ratio)) {
            height = width / ratio;
          } else {
            width = height * ratio;
          }
        }
        const oldW = width, oldH = height;
        let _ref = this.slack || [0, 0], slackW = _ref[0], slackH = _ref[1];
        width += slackW;
        height += slackH;
        if (minConstraints) {
          width = Math.max(minConstraints[0], width);
          height = Math.max(minConstraints[1], height);
        }
        if (maxConstraints) {
          width = Math.min(maxConstraints[0], width);
          height = Math.min(maxConstraints[1], height);
        }
        this.slack = [slackW + (oldW - width), slackH + (oldH - height)];
        return [width, height];
      }
      /**
       * Wrapper around drag events to provide more useful data.
       *
       * @param  {String} handlerName Handler name to wrap.
       * @return {Function}           Handler function.
       */
      resizeHandler(handlerName, axis) {
        return (e, _ref2) => {
          var _this$lastSize$width, _this$lastSize, _this$lastSize$height, _this$lastSize2;
          let node = _ref2.node, deltaX = _ref2.deltaX, deltaY = _ref2.deltaY;
          if (handlerName === "onResizeStart") this.resetData();
          const canDragX2 = (this.props.axis === "both" || this.props.axis === "x") && axis !== "n" && axis !== "s";
          const canDragY2 = (this.props.axis === "both" || this.props.axis === "y") && axis !== "e" && axis !== "w";
          if (!canDragX2 && !canDragY2) return;
          const axisV = axis[0];
          const axisH = axis[axis.length - 1];
          const handleRect = node.getBoundingClientRect();
          if (this.lastHandleRect != null) {
            if (axisH === "w") {
              const deltaLeftSinceLast = handleRect.left - this.lastHandleRect.left;
              deltaX += deltaLeftSinceLast;
            }
            if (axisV === "n") {
              const deltaTopSinceLast = handleRect.top - this.lastHandleRect.top;
              deltaY += deltaTopSinceLast;
            }
          }
          this.lastHandleRect = handleRect;
          if (axisH === "w") deltaX = -deltaX;
          if (axisV === "n") deltaY = -deltaY;
          const baseWidth = (_this$lastSize$width = (_this$lastSize = this.lastSize) == null ? void 0 : _this$lastSize.width) != null ? _this$lastSize$width : this.props.width;
          const baseHeight = (_this$lastSize$height = (_this$lastSize2 = this.lastSize) == null ? void 0 : _this$lastSize2.height) != null ? _this$lastSize$height : this.props.height;
          let width = baseWidth + (canDragX2 ? deltaX / this.props.transformScale : 0);
          let height = baseHeight + (canDragY2 ? deltaY / this.props.transformScale : 0);
          var _this$runConstraints = this.runConstraints(width, height);
          width = _this$runConstraints[0];
          height = _this$runConstraints[1];
          if (handlerName === "onResizeStop" && this.lastSize) {
            var _this$lastSize3 = this.lastSize;
            width = _this$lastSize3.width;
            height = _this$lastSize3.height;
          }
          const dimensionsChanged = width !== baseWidth || height !== baseHeight;
          if (handlerName !== "onResizeStop") {
            this.lastSize = {
              width,
              height
            };
          }
          const cb = typeof this.props[handlerName] === "function" ? this.props[handlerName] : null;
          const shouldSkipCb = handlerName === "onResize" && !dimensionsChanged;
          if (cb && !shouldSkipCb) {
            e.persist == null || e.persist();
            cb(e, {
              node,
              size: {
                width,
                height
              },
              handle: axis
            });
          }
          if (handlerName === "onResizeStop") this.resetData();
        };
      }
      // Render a resize handle given an axis & DOM ref. Ref *must* be attached for
      // the underlying draggable library to work properly.
      renderResizeHandle(handleAxis, ref) {
        const handle = this.props.handle;
        if (!handle) {
          return /* @__PURE__ */ React5.createElement("span", {
            className: "react-resizable-handle react-resizable-handle-" + handleAxis,
            ref
          });
        }
        if (typeof handle === "function") {
          return handle(handleAxis, ref);
        }
        const isDOMElement = typeof handle.type === "string";
        const props = _objectSpread({
          ref
        }, isDOMElement ? {} : {
          handleAxis
        });
        return /* @__PURE__ */ React5.cloneElement(handle, props);
      }
      render() {
        const _this$props2 = this.props, children = _this$props2.children, className = _this$props2.className, draggableOpts = _this$props2.draggableOpts, width = _this$props2.width, height = _this$props2.height, handle = _this$props2.handle, handleSize = _this$props2.handleSize, lockAspectRatio = _this$props2.lockAspectRatio, axis = _this$props2.axis, minConstraints = _this$props2.minConstraints, maxConstraints = _this$props2.maxConstraints, onResize = _this$props2.onResize, onResizeStop = _this$props2.onResizeStop, onResizeStart = _this$props2.onResizeStart, resizeHandles = _this$props2.resizeHandles, transformScale = _this$props2.transformScale, p = _objectWithoutPropertiesLoose(_this$props2, _excluded);
        return (0, _utils.cloneElement)(children, _objectSpread(_objectSpread({}, p), {}, {
          className: (className ? className + " " : "") + "react-resizable",
          children: [...React5.Children.toArray(children.props.children), ...resizeHandles.map((handleAxis) => {
            var _this$handleRefs$hand;
            const ref = (_this$handleRefs$hand = this.handleRefs[handleAxis]) != null ? _this$handleRefs$hand : this.handleRefs[handleAxis] = /* @__PURE__ */ React5.createRef();
            return /* @__PURE__ */ React5.createElement(_reactDraggable.DraggableCore, _extends({}, draggableOpts, {
              nodeRef: ref,
              key: "resizableHandle-" + handleAxis,
              onStop: this.resizeHandler("onResizeStop", handleAxis),
              onStart: this.resizeHandler("onResizeStart", handleAxis),
              onDrag: this.resizeHandler("onResize", handleAxis)
            }), this.renderResizeHandle(handleAxis, ref));
          })]
        }));
      }
    };
    exports.default = Resizable2;
    Resizable2.propTypes = _propTypes.resizableProps;
    Resizable2.defaultProps = {
      axis: "both",
      handleSize: [20, 20],
      lockAspectRatio: false,
      minConstraints: [20, 20],
      maxConstraints: [Infinity, Infinity],
      resizeHandles: ["se"],
      transformScale: 1
    };
  }
});

// node_modules/react-resizable/build/ResizableBox.js
var require_ResizableBox = __commonJS({
  "node_modules/react-resizable/build/ResizableBox.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.default = void 0;
    var React5 = _interopRequireWildcard(require_react());
    var _propTypes = _interopRequireDefault(require_prop_types());
    var _Resizable = _interopRequireDefault(require_Resizable());
    var _propTypes2 = require_propTypes();
    var _excluded = ["handle", "handleSize", "onResize", "onResizeStart", "onResizeStop", "draggableOpts", "minConstraints", "maxConstraints", "lockAspectRatio", "axis", "width", "height", "resizeHandles", "style", "transformScale"];
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r2 = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, default: e2 };
        if (null === e2 || "object" != typeof e2 && "function" != typeof e2) return f;
        if (o = t2 ? n : r2) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (const t3 in e2) "default" !== t3 && {}.hasOwnProperty.call(e2, t3) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, t3)) && (i.get || i.set) ? o(f, t3, i) : f[t3] = e2[t3]);
        return f;
      })(e, t);
    }
    function _extends() {
      return _extends = Object.assign ? Object.assign.bind() : function(n) {
        for (var e = 1; e < arguments.length; e++) {
          var t = arguments[e];
          for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
        }
        return n;
      }, _extends.apply(null, arguments);
    }
    function ownKeys(e, r2) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r2 && (o = o.filter(function(r3) {
          return Object.getOwnPropertyDescriptor(e, r3).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread(e) {
      for (var r2 = 1; r2 < arguments.length; r2++) {
        var t = null != arguments[r2] ? arguments[r2] : {};
        r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
          _defineProperty(e, r3, t[r3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
          Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
        });
      }
      return e;
    }
    function _defineProperty(e, r2, t) {
      return (r2 = _toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }
    function _toPrimitive(t, r2) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r2 || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r2 ? String : Number)(t);
    }
    function _objectWithoutPropertiesLoose(r2, e) {
      if (null == r2) return {};
      var t = {};
      for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r2[n];
      }
      return t;
    }
    var ResizableBox = class extends React5.Component {
      constructor() {
        super(...arguments);
        this.state = {
          width: this.props.width,
          height: this.props.height,
          propsWidth: this.props.width,
          propsHeight: this.props.height
        };
        this.onResize = (e, data) => {
          const size = data.size;
          if (this.props.onResize) {
            e.persist == null || e.persist();
            this.setState(size, () => this.props.onResize && this.props.onResize(e, data));
          } else {
            this.setState(size);
          }
        };
      }
      static getDerivedStateFromProps(props, state) {
        if (state.propsWidth !== props.width || state.propsHeight !== props.height) {
          return {
            width: props.width,
            height: props.height,
            propsWidth: props.width,
            propsHeight: props.height
          };
        }
        return null;
      }
      render() {
        const _this$props = this.props, handle = _this$props.handle, handleSize = _this$props.handleSize, onResize = _this$props.onResize, onResizeStart = _this$props.onResizeStart, onResizeStop = _this$props.onResizeStop, draggableOpts = _this$props.draggableOpts, minConstraints = _this$props.minConstraints, maxConstraints = _this$props.maxConstraints, lockAspectRatio = _this$props.lockAspectRatio, axis = _this$props.axis, width = _this$props.width, height = _this$props.height, resizeHandles = _this$props.resizeHandles, style = _this$props.style, transformScale = _this$props.transformScale, props = _objectWithoutPropertiesLoose(_this$props, _excluded);
        return /* @__PURE__ */ React5.createElement(_Resizable.default, {
          axis,
          draggableOpts,
          handle,
          handleSize,
          height: this.state.height,
          lockAspectRatio,
          maxConstraints,
          minConstraints,
          onResizeStart,
          onResize: this.onResize,
          onResizeStop,
          resizeHandles,
          transformScale,
          width: this.state.width
        }, /* @__PURE__ */ React5.createElement("div", _extends({}, props, {
          style: _objectSpread(_objectSpread({}, style), {}, {
            width: this.state.width + "px",
            height: this.state.height + "px"
          })
        })));
      }
    };
    exports.default = ResizableBox;
    ResizableBox.propTypes = _objectSpread(_objectSpread({}, _propTypes2.resizableProps), {}, {
      children: _propTypes.default.element
    });
  }
});

// node_modules/react-resizable/index.js
var require_react_resizable = __commonJS({
  "node_modules/react-resizable/index.js"(exports, module) {
    "use strict";
    module.exports = function() {
      throw new Error("Don't instantiate Resizable directly! Use require('react-resizable').Resizable");
    };
    module.exports.Resizable = require_Resizable().default;
    module.exports.ResizableBox = require_ResizableBox().default;
  }
});

// scripts/plugins/shims/react-jsx-runtime.cjs
var require_react_jsx_runtime = __commonJS({
  "scripts/plugins/shims/react-jsx-runtime.cjs"(exports, module) {
    function requireReactJsxRuntime() {
      const hostJsxRuntime = globalThis?.window?.__NEXUS_HOST_REACT_JSX_RUNTIME__;
      if (!hostJsxRuntime) {
        throw new Error("Nexus plugins renderer no encontro react/jsx-runtime del host en window.__NEXUS_HOST_REACT_JSX_RUNTIME__.");
      }
      return hostJsxRuntime;
    }
    module.exports = requireReactJsxRuntime();
  }
});

// node_modules/fast-equals/dist/fast-equals.js
var require_fast_equals = __commonJS({
  "node_modules/fast-equals/dist/fast-equals.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global["fast-equals"] = {}));
    })(exports, (function(exports2) {
      "use strict";
      function createDefaultIsNestedEqual(comparator) {
        return function isEqual(a, b, _indexOrKeyA, _indexOrKeyB, _parentA, _parentB, meta) {
          return comparator(a, b, meta);
        };
      }
      function createIsCircular(areItemsEqual) {
        return function isCircular(a, b, isEqual, cache) {
          if (!a || !b || typeof a !== "object" || typeof b !== "object") {
            return areItemsEqual(a, b, isEqual, cache);
          }
          var cachedA = cache.get(a);
          var cachedB = cache.get(b);
          if (cachedA && cachedB) {
            return cachedA === b && cachedB === a;
          }
          cache.set(a, b);
          cache.set(b, a);
          var result = areItemsEqual(a, b, isEqual, cache);
          cache.delete(a);
          cache.delete(b);
          return result;
        };
      }
      function merge2(a, b) {
        var merged = {};
        for (var key in a) {
          merged[key] = a[key];
        }
        for (var key in b) {
          merged[key] = b[key];
        }
        return merged;
      }
      function isPlainObject(value) {
        return value.constructor === Object || value.constructor == null;
      }
      function isPromiseLike(value) {
        return typeof value.then === "function";
      }
      function sameValueZeroEqual(a, b) {
        return a === b || a !== a && b !== b;
      }
      var ARGUMENTS_TAG = "[object Arguments]";
      var BOOLEAN_TAG = "[object Boolean]";
      var DATE_TAG = "[object Date]";
      var REG_EXP_TAG = "[object RegExp]";
      var MAP_TAG = "[object Map]";
      var NUMBER_TAG = "[object Number]";
      var OBJECT_TAG = "[object Object]";
      var SET_TAG = "[object Set]";
      var STRING_TAG = "[object String]";
      var toString = Object.prototype.toString;
      function createComparator(_a) {
        var areArraysEqual2 = _a.areArraysEqual, areDatesEqual2 = _a.areDatesEqual, areMapsEqual2 = _a.areMapsEqual, areObjectsEqual2 = _a.areObjectsEqual, areRegExpsEqual2 = _a.areRegExpsEqual, areSetsEqual2 = _a.areSetsEqual, createIsNestedEqual = _a.createIsNestedEqual;
        var isEqual = createIsNestedEqual(comparator);
        function comparator(a, b, meta) {
          if (a === b) {
            return true;
          }
          if (!a || !b || typeof a !== "object" || typeof b !== "object") {
            return a !== a && b !== b;
          }
          if (isPlainObject(a) && isPlainObject(b)) {
            return areObjectsEqual2(a, b, isEqual, meta);
          }
          var aArray = Array.isArray(a);
          var bArray = Array.isArray(b);
          if (aArray || bArray) {
            return aArray === bArray && areArraysEqual2(a, b, isEqual, meta);
          }
          var aTag = toString.call(a);
          if (aTag !== toString.call(b)) {
            return false;
          }
          if (aTag === DATE_TAG) {
            return areDatesEqual2(a, b, isEqual, meta);
          }
          if (aTag === REG_EXP_TAG) {
            return areRegExpsEqual2(a, b, isEqual, meta);
          }
          if (aTag === MAP_TAG) {
            return areMapsEqual2(a, b, isEqual, meta);
          }
          if (aTag === SET_TAG) {
            return areSetsEqual2(a, b, isEqual, meta);
          }
          if (aTag === OBJECT_TAG || aTag === ARGUMENTS_TAG) {
            return isPromiseLike(a) || isPromiseLike(b) ? false : areObjectsEqual2(a, b, isEqual, meta);
          }
          if (aTag === BOOLEAN_TAG || aTag === NUMBER_TAG || aTag === STRING_TAG) {
            return sameValueZeroEqual(a.valueOf(), b.valueOf());
          }
          return false;
        }
        return comparator;
      }
      function areArraysEqual(a, b, isEqual, meta) {
        var index = a.length;
        if (b.length !== index) {
          return false;
        }
        while (index-- > 0) {
          if (!isEqual(a[index], b[index], index, index, a, b, meta)) {
            return false;
          }
        }
        return true;
      }
      var areArraysEqualCircular = createIsCircular(areArraysEqual);
      function areDatesEqual(a, b) {
        return sameValueZeroEqual(a.valueOf(), b.valueOf());
      }
      function areMapsEqual(a, b, isEqual, meta) {
        var isValueEqual = a.size === b.size;
        if (!isValueEqual) {
          return false;
        }
        if (!a.size) {
          return true;
        }
        var matchedIndices = {};
        var indexA = 0;
        a.forEach(function(aValue, aKey) {
          if (!isValueEqual) {
            return;
          }
          var hasMatch = false;
          var matchIndexB = 0;
          b.forEach(function(bValue, bKey) {
            if (!hasMatch && !matchedIndices[matchIndexB] && (hasMatch = isEqual(aKey, bKey, indexA, matchIndexB, a, b, meta) && isEqual(aValue, bValue, aKey, bKey, a, b, meta))) {
              matchedIndices[matchIndexB] = true;
            }
            matchIndexB++;
          });
          indexA++;
          isValueEqual = hasMatch;
        });
        return isValueEqual;
      }
      var areMapsEqualCircular = createIsCircular(areMapsEqual);
      var OWNER = "_owner";
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      function areObjectsEqual(a, b, isEqual, meta) {
        var keysA = Object.keys(a);
        var index = keysA.length;
        if (Object.keys(b).length !== index) {
          return false;
        }
        var key;
        while (index-- > 0) {
          key = keysA[index];
          if (key === OWNER) {
            var reactElementA = !!a.$$typeof;
            var reactElementB = !!b.$$typeof;
            if ((reactElementA || reactElementB) && reactElementA !== reactElementB) {
              return false;
            }
          }
          if (!hasOwnProperty.call(b, key) || !isEqual(a[key], b[key], key, key, a, b, meta)) {
            return false;
          }
        }
        return true;
      }
      var areObjectsEqualCircular = createIsCircular(areObjectsEqual);
      function areRegExpsEqual(a, b) {
        return a.source === b.source && a.flags === b.flags;
      }
      function areSetsEqual(a, b, isEqual, meta) {
        var isValueEqual = a.size === b.size;
        if (!isValueEqual) {
          return false;
        }
        if (!a.size) {
          return true;
        }
        var matchedIndices = {};
        a.forEach(function(aValue, aKey) {
          if (!isValueEqual) {
            return;
          }
          var hasMatch = false;
          var matchIndex = 0;
          b.forEach(function(bValue, bKey) {
            if (!hasMatch && !matchedIndices[matchIndex] && (hasMatch = isEqual(aValue, bValue, aKey, bKey, a, b, meta))) {
              matchedIndices[matchIndex] = true;
            }
            matchIndex++;
          });
          isValueEqual = hasMatch;
        });
        return isValueEqual;
      }
      var areSetsEqualCircular = createIsCircular(areSetsEqual);
      var DEFAULT_CONFIG = Object.freeze({
        areArraysEqual,
        areDatesEqual,
        areMapsEqual,
        areObjectsEqual,
        areRegExpsEqual,
        areSetsEqual,
        createIsNestedEqual: createDefaultIsNestedEqual
      });
      var DEFAULT_CIRCULAR_CONFIG = Object.freeze({
        areArraysEqual: areArraysEqualCircular,
        areDatesEqual,
        areMapsEqual: areMapsEqualCircular,
        areObjectsEqual: areObjectsEqualCircular,
        areRegExpsEqual,
        areSetsEqual: areSetsEqualCircular,
        createIsNestedEqual: createDefaultIsNestedEqual
      });
      var isDeepEqual = createComparator(DEFAULT_CONFIG);
      function deepEqual2(a, b) {
        return isDeepEqual(a, b, void 0);
      }
      var isShallowEqual = createComparator(merge2(DEFAULT_CONFIG, { createIsNestedEqual: function() {
        return sameValueZeroEqual;
      } }));
      function shallowEqual(a, b) {
        return isShallowEqual(a, b, void 0);
      }
      var isCircularDeepEqual = createComparator(DEFAULT_CIRCULAR_CONFIG);
      function circularDeepEqual(a, b) {
        return isCircularDeepEqual(a, b, /* @__PURE__ */ new WeakMap());
      }
      var isCircularShallowEqual = createComparator(merge2(DEFAULT_CIRCULAR_CONFIG, {
        createIsNestedEqual: function() {
          return sameValueZeroEqual;
        }
      }));
      function circularShallowEqual(a, b) {
        return isCircularShallowEqual(a, b, /* @__PURE__ */ new WeakMap());
      }
      function createCustomEqual(getComparatorOptions) {
        return createComparator(merge2(DEFAULT_CONFIG, getComparatorOptions(DEFAULT_CONFIG)));
      }
      function createCustomCircularEqual(getComparatorOptions) {
        var comparator = createComparator(merge2(DEFAULT_CIRCULAR_CONFIG, getComparatorOptions(DEFAULT_CIRCULAR_CONFIG)));
        return (function(a, b, meta) {
          if (meta === void 0) {
            meta = /* @__PURE__ */ new WeakMap();
          }
          return comparator(a, b, meta);
        });
      }
      exports2.circularDeepEqual = circularDeepEqual;
      exports2.circularShallowEqual = circularShallowEqual;
      exports2.createCustomCircularEqual = createCustomCircularEqual;
      exports2.createCustomEqual = createCustomEqual;
      exports2.deepEqual = deepEqual2;
      exports2.sameValueZeroEqual = sameValueZeroEqual;
      exports2.shallowEqual = shallowEqual;
      Object.defineProperty(exports2, "__esModule", { value: true });
    }));
  }
});

// node_modules/@kurkle/color/dist/color.esm.js
function round(v) {
  return v + 0.5 | 0;
}
var lim = (v, l, h) => Math.max(Math.min(v, h), l);
function p2b(v) {
  return lim(round(v * 2.55), 0, 255);
}
function n2b(v) {
  return lim(round(v * 255), 0, 255);
}
function b2n(v) {
  return lim(round(v / 2.55) / 100, 0, 1);
}
function n2p(v) {
  return lim(round(v * 100), 0, 100);
}
var map$1 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 };
var hex = [..."0123456789ABCDEF"];
var h1 = (b) => hex[b & 15];
var h2 = (b) => hex[(b & 240) >> 4] + hex[b & 15];
var eq = (b) => (b & 240) >> 4 === (b & 15);
var isShort = (v) => eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a);
function hexParse(str) {
  var len = str.length;
  var ret;
  if (str[0] === "#") {
    if (len === 4 || len === 5) {
      ret = {
        r: 255 & map$1[str[1]] * 17,
        g: 255 & map$1[str[2]] * 17,
        b: 255 & map$1[str[3]] * 17,
        a: len === 5 ? map$1[str[4]] * 17 : 255
      };
    } else if (len === 7 || len === 9) {
      ret = {
        r: map$1[str[1]] << 4 | map$1[str[2]],
        g: map$1[str[3]] << 4 | map$1[str[4]],
        b: map$1[str[5]] << 4 | map$1[str[6]],
        a: len === 9 ? map$1[str[7]] << 4 | map$1[str[8]] : 255
      };
    }
  }
  return ret;
}
var alpha = (a, f) => a < 255 ? f(a) : "";
function hexString(v) {
  var f = isShort(v) ? h1 : h2;
  return v ? "#" + f(v.r) + f(v.g) + f(v.b) + alpha(v.a, f) : void 0;
}
var HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function hsl2rgbn(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)];
}
function hsv2rgbn(h, s, v) {
  const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)];
}
function hwb2rgbn(h, w, b) {
  const rgb = hsl2rgbn(h, 1, 0.5);
  let i;
  if (w + b > 1) {
    i = 1 / (w + b);
    w *= i;
    b *= i;
  }
  for (i = 0; i < 3; i++) {
    rgb[i] *= 1 - w - b;
    rgb[i] += w;
  }
  return rgb;
}
function hueValue(r2, g, b, d, max) {
  if (r2 === max) {
    return (g - b) / d + (g < b ? 6 : 0);
  }
  if (g === max) {
    return (b - r2) / d + 2;
  }
  return (r2 - g) / d + 4;
}
function rgb2hsl(v) {
  const range = 255;
  const r2 = v.r / range;
  const g = v.g / range;
  const b = v.b / range;
  const max = Math.max(r2, g, b);
  const min = Math.min(r2, g, b);
  const l = (max + min) / 2;
  let h, s, d;
  if (max !== min) {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = hueValue(r2, g, b, d, max);
    h = h * 60 + 0.5;
  }
  return [h | 0, s || 0, l];
}
function calln(f, a, b, c) {
  return (Array.isArray(a) ? f(a[0], a[1], a[2]) : f(a, b, c)).map(n2b);
}
function hsl2rgb(h, s, l) {
  return calln(hsl2rgbn, h, s, l);
}
function hwb2rgb(h, w, b) {
  return calln(hwb2rgbn, h, w, b);
}
function hsv2rgb(h, s, v) {
  return calln(hsv2rgbn, h, s, v);
}
function hue(h) {
  return (h % 360 + 360) % 360;
}
function hueParse(str) {
  const m = HUE_RE.exec(str);
  let a = 255;
  let v;
  if (!m) {
    return;
  }
  if (m[5] !== v) {
    a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
  }
  const h = hue(+m[2]);
  const p1 = +m[3] / 100;
  const p2 = +m[4] / 100;
  if (m[1] === "hwb") {
    v = hwb2rgb(h, p1, p2);
  } else if (m[1] === "hsv") {
    v = hsv2rgb(h, p1, p2);
  } else {
    v = hsl2rgb(h, p1, p2);
  }
  return {
    r: v[0],
    g: v[1],
    b: v[2],
    a
  };
}
function rotate(v, deg) {
  var h = rgb2hsl(v);
  h[0] = hue(h[0] + deg);
  h = hsl2rgb(h);
  v.r = h[0];
  v.g = h[1];
  v.b = h[2];
}
function hslString(v) {
  if (!v) {
    return;
  }
  const a = rgb2hsl(v);
  const h = a[0];
  const s = n2p(a[1]);
  const l = n2p(a[2]);
  return v.a < 255 ? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})` : `hsl(${h}, ${s}%, ${l}%)`;
}
var map = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
};
var names$1 = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function unpack() {
  const unpacked = {};
  const keys = Object.keys(names$1);
  const tkeys = Object.keys(map);
  let i, j, k, ok, nk;
  for (i = 0; i < keys.length; i++) {
    ok = nk = keys[i];
    for (j = 0; j < tkeys.length; j++) {
      k = tkeys[j];
      nk = nk.replace(k, map[k]);
    }
    k = parseInt(names$1[ok], 16);
    unpacked[nk] = [k >> 16 & 255, k >> 8 & 255, k & 255];
  }
  return unpacked;
}
var names;
function nameParse(str) {
  if (!names) {
    names = unpack();
    names.transparent = [0, 0, 0, 0];
  }
  const a = names[str.toLowerCase()];
  return a && {
    r: a[0],
    g: a[1],
    b: a[2],
    a: a.length === 4 ? a[3] : 255
  };
}
var RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function rgbParse(str) {
  const m = RGB_RE.exec(str);
  let a = 255;
  let r2, g, b;
  if (!m) {
    return;
  }
  if (m[7] !== r2) {
    const v = +m[7];
    a = m[8] ? p2b(v) : lim(v * 255, 0, 255);
  }
  r2 = +m[1];
  g = +m[3];
  b = +m[5];
  r2 = 255 & (m[2] ? p2b(r2) : lim(r2, 0, 255));
  g = 255 & (m[4] ? p2b(g) : lim(g, 0, 255));
  b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255));
  return {
    r: r2,
    g,
    b,
    a
  };
}
function rgbString(v) {
  return v && (v.a < 255 ? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})` : `rgb(${v.r}, ${v.g}, ${v.b})`);
}
var to = (v) => v <= 31308e-7 ? v * 12.92 : Math.pow(v, 1 / 2.4) * 1.055 - 0.055;
var from = (v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
function interpolate(rgb1, rgb2, t) {
  const r2 = from(b2n(rgb1.r));
  const g = from(b2n(rgb1.g));
  const b = from(b2n(rgb1.b));
  return {
    r: n2b(to(r2 + t * (from(b2n(rgb2.r)) - r2))),
    g: n2b(to(g + t * (from(b2n(rgb2.g)) - g))),
    b: n2b(to(b + t * (from(b2n(rgb2.b)) - b))),
    a: rgb1.a + t * (rgb2.a - rgb1.a)
  };
}
function modHSL(v, i, ratio) {
  if (v) {
    let tmp = rgb2hsl(v);
    tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
    tmp = hsl2rgb(tmp);
    v.r = tmp[0];
    v.g = tmp[1];
    v.b = tmp[2];
  }
}
function clone(v, proto) {
  return v ? Object.assign(proto || {}, v) : v;
}
function fromObject(input) {
  var v = { r: 0, g: 0, b: 0, a: 255 };
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      v = { r: input[0], g: input[1], b: input[2], a: 255 };
      if (input.length > 3) {
        v.a = n2b(input[3]);
      }
    }
  } else {
    v = clone(input, { r: 0, g: 0, b: 0, a: 1 });
    v.a = n2b(v.a);
  }
  return v;
}
function functionParse(str) {
  if (str.charAt(0) === "r") {
    return rgbParse(str);
  }
  return hueParse(str);
}
var Color = class _Color {
  constructor(input) {
    if (input instanceof _Color) {
      return input;
    }
    const type = typeof input;
    let v;
    if (type === "object") {
      v = fromObject(input);
    } else if (type === "string") {
      v = hexParse(input) || nameParse(input) || functionParse(input);
    }
    this._rgb = v;
    this._valid = !!v;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var v = clone(this._rgb);
    if (v) {
      v.a = b2n(v.a);
    }
    return v;
  }
  set rgb(obj) {
    this._rgb = fromObject(obj);
  }
  rgbString() {
    return this._valid ? rgbString(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? hexString(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? hslString(this._rgb) : void 0;
  }
  mix(color2, weight) {
    if (color2) {
      const c1 = this.rgb;
      const c2 = color2.rgb;
      let w2;
      const p = weight === w2 ? 0.5 : weight;
      const w = 2 * p - 1;
      const a = c1.a - c2.a;
      const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
      w2 = 1 - w1;
      c1.r = 255 & w1 * c1.r + w2 * c2.r + 0.5;
      c1.g = 255 & w1 * c1.g + w2 * c2.g + 0.5;
      c1.b = 255 & w1 * c1.b + w2 * c2.b + 0.5;
      c1.a = p * c1.a + (1 - p) * c2.a;
      this.rgb = c1;
    }
    return this;
  }
  interpolate(color2, t) {
    if (color2) {
      this._rgb = interpolate(this._rgb, color2._rgb, t);
    }
    return this;
  }
  clone() {
    return new _Color(this.rgb);
  }
  alpha(a) {
    this._rgb.a = n2b(a);
    return this;
  }
  clearer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 - ratio;
    return this;
  }
  greyscale() {
    const rgb = this._rgb;
    const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
    rgb.r = rgb.g = rgb.b = val;
    return this;
  }
  opaquer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 + ratio;
    return this;
  }
  negate() {
    const v = this._rgb;
    v.r = 255 - v.r;
    v.g = 255 - v.g;
    v.b = 255 - v.b;
    return this;
  }
  lighten(ratio) {
    modHSL(this._rgb, 2, ratio);
    return this;
  }
  darken(ratio) {
    modHSL(this._rgb, 2, -ratio);
    return this;
  }
  saturate(ratio) {
    modHSL(this._rgb, 1, ratio);
    return this;
  }
  desaturate(ratio) {
    modHSL(this._rgb, 1, -ratio);
    return this;
  }
  rotate(deg) {
    rotate(this._rgb, deg);
    return this;
  }
};

// node_modules/chart.js/dist/chunks/helpers.dataset.js
var uid = /* @__PURE__ */ (() => {
  let id = 0;
  return () => id++;
})();
function isNullOrUndef(value) {
  return value === null || value === void 0;
}
function isArray(value) {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.slice(0, 7) === "[object" && type.slice(-6) === "Array]") {
    return true;
  }
  return false;
}
function isObject(value) {
  return value !== null && Object.prototype.toString.call(value) === "[object Object]";
}
function isNumberFinite(value) {
  return (typeof value === "number" || value instanceof Number) && isFinite(+value);
}
function finiteOrDefault(value, defaultValue) {
  return isNumberFinite(value) ? value : defaultValue;
}
function valueOrDefault(value, defaultValue) {
  return typeof value === "undefined" ? defaultValue : value;
}
var toDimension = (value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 * dimension : +value;
function callback(fn, args, thisArg) {
  if (fn && typeof fn.call === "function") {
    return fn.apply(thisArg, args);
  }
}
function each(loopable, fn, thisArg, reverse) {
  let i, len, keys;
  if (isArray(loopable)) {
    len = loopable.length;
    if (reverse) {
      for (i = len - 1; i >= 0; i--) {
        fn.call(thisArg, loopable[i], i);
      }
    } else {
      for (i = 0; i < len; i++) {
        fn.call(thisArg, loopable[i], i);
      }
    }
  } else if (isObject(loopable)) {
    keys = Object.keys(loopable);
    len = keys.length;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, loopable[keys[i]], keys[i]);
    }
  }
}
function _elementsEqual(a0, a1) {
  let i, ilen, v0, v1;
  if (!a0 || !a1 || a0.length !== a1.length) {
    return false;
  }
  for (i = 0, ilen = a0.length; i < ilen; ++i) {
    v0 = a0[i];
    v1 = a1[i];
    if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
      return false;
    }
  }
  return true;
}
function clone2(source) {
  if (isArray(source)) {
    return source.map(clone2);
  }
  if (isObject(source)) {
    const target = /* @__PURE__ */ Object.create(null);
    const keys = Object.keys(source);
    const klen = keys.length;
    let k = 0;
    for (; k < klen; ++k) {
      target[keys[k]] = clone2(source[keys[k]]);
    }
    return target;
  }
  return source;
}
function isValidKey(key) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(key) === -1;
}
function _merger(key, target, source, options) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    merge(tval, sval, options);
  } else {
    target[key] = clone2(sval);
  }
}
function merge(target, source, options) {
  const sources = isArray(source) ? source : [
    source
  ];
  const ilen = sources.length;
  if (!isObject(target)) {
    return target;
  }
  options = options || {};
  const merger = options.merger || _merger;
  let current;
  for (let i = 0; i < ilen; ++i) {
    current = sources[i];
    if (!isObject(current)) {
      continue;
    }
    const keys = Object.keys(current);
    for (let k = 0, klen = keys.length; k < klen; ++k) {
      merger(keys[k], target, current, options);
    }
  }
  return target;
}
function mergeIf(target, source) {
  return merge(target, source, {
    merger: _mergerIf
  });
}
function _mergerIf(key, target, source) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    mergeIf(tval, sval);
  } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = clone2(sval);
  }
}
var keyResolvers = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (v) => v,
  // default resolvers
  x: (o) => o.x,
  y: (o) => o.y
};
function _splitKey(key) {
  const parts = key.split(".");
  const keys = [];
  let tmp = "";
  for (const part of parts) {
    tmp += part;
    if (tmp.endsWith("\\")) {
      tmp = tmp.slice(0, -1) + ".";
    } else {
      keys.push(tmp);
      tmp = "";
    }
  }
  return keys;
}
function _getKeyResolver(key) {
  const keys = _splitKey(key);
  return (obj) => {
    for (const k of keys) {
      if (k === "") {
        break;
      }
      obj = obj && obj[k];
    }
    return obj;
  };
}
function resolveObjectKey(obj, key) {
  const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
  return resolver(obj);
}
function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
var defined = (value) => typeof value !== "undefined";
var isFunction = (value) => typeof value === "function";
var setsEqual = (a, b) => {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
};
function _isClickEvent(e) {
  return e.type === "mouseup" || e.type === "click" || e.type === "contextmenu";
}
var PI = Math.PI;
var TAU = 2 * PI;
var PITAU = TAU + PI;
var INFINITY = Number.POSITIVE_INFINITY;
var RAD_PER_DEG = PI / 180;
var HALF_PI = PI / 2;
var QUARTER_PI = PI / 4;
var TWO_THIRDS_PI = PI * 2 / 3;
var log10 = Math.log10;
var sign = Math.sign;
function almostEquals(x, y, epsilon) {
  return Math.abs(x - y) < epsilon;
}
function niceNum(range) {
  const roundedRange = Math.round(range);
  range = almostEquals(range, roundedRange, range / 1e3) ? roundedRange : range;
  const niceRange = Math.pow(10, Math.floor(log10(range)));
  const fraction = range / niceRange;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * niceRange;
}
function _factorize(value) {
  const result = [];
  const sqrt = Math.sqrt(value);
  let i;
  for (i = 1; i < sqrt; i++) {
    if (value % i === 0) {
      result.push(i);
      result.push(value / i);
    }
  }
  if (sqrt === (sqrt | 0)) {
    result.push(sqrt);
  }
  result.sort((a, b) => a - b).pop();
  return result;
}
function isNonPrimitive(n) {
  return typeof n === "symbol" || typeof n === "object" && n !== null && !(Symbol.toPrimitive in n || "toString" in n || "valueOf" in n);
}
function isNumber(n) {
  return !isNonPrimitive(n) && !isNaN(parseFloat(n)) && isFinite(n);
}
function almostWhole(x, epsilon) {
  const rounded = Math.round(x);
  return rounded - epsilon <= x && rounded + epsilon >= x;
}
function _setMinAndMaxByKey(array, target, property) {
  let i, ilen, value;
  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}
function toRadians(degrees) {
  return degrees * (PI / 180);
}
function toDegrees(radians) {
  return radians * (180 / PI);
}
function _decimalPlaces(x) {
  if (!isNumberFinite(x)) {
    return;
  }
  let e = 1;
  let p = 0;
  while (Math.round(x * e) / e !== x) {
    e *= 10;
    p++;
  }
  return p;
}
function getAngleFromPoint(centrePoint, anglePoint) {
  const distanceFromXCenter = anglePoint.x - centrePoint.x;
  const distanceFromYCenter = anglePoint.y - centrePoint.y;
  const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
  let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
  if (angle < -0.5 * PI) {
    angle += TAU;
  }
  return {
    angle,
    distance: radialDistanceFromCenter
  };
}
function distanceBetweenPoints(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
function _angleDiff(a, b) {
  return (a - b + PITAU) % TAU - PI;
}
function _normalizeAngle(a) {
  return (a % TAU + TAU) % TAU;
}
function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
  const a = _normalizeAngle(angle);
  const s = _normalizeAngle(start);
  const e = _normalizeAngle(end);
  const angleToStart = _normalizeAngle(s - a);
  const angleToEnd = _normalizeAngle(e - a);
  const startToAngle = _normalizeAngle(a - s);
  const endToAngle = _normalizeAngle(a - e);
  return a === s || a === e || sameAngleIsFullCircle && s === e || angleToStart > angleToEnd && startToAngle < endToAngle;
}
function _limitValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function _int16Range(value) {
  return _limitValue(value, -32768, 32767);
}
function _isBetween(value, start, end, epsilon = 1e-6) {
  return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}
function _lookup(table, value, cmp) {
  cmp = cmp || ((index) => table[index] < value);
  let hi = table.length - 1;
  let lo = 0;
  let mid;
  while (hi - lo > 1) {
    mid = lo + hi >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return {
    lo,
    hi
  };
}
var _lookupByKey = (table, key, value, last) => _lookup(table, value, last ? (index) => {
  const ti = table[index][key];
  return ti < value || ti === value && table[index + 1][key] === value;
} : (index) => table[index][key] < value);
var _rlookupByKey = (table, key, value) => _lookup(table, value, (index) => table[index][key] >= value);
function _filterBetween(values, min, max) {
  let start = 0;
  let end = values.length;
  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }
  return start > 0 || end < values.length ? values.slice(start, end) : values;
}
var arrayEvents = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function listenArrayEvents(array, listener) {
  if (array._chartjs) {
    array._chartjs.listeners.push(listener);
    return;
  }
  Object.defineProperty(array, "_chartjs", {
    configurable: true,
    enumerable: false,
    value: {
      listeners: [
        listener
      ]
    }
  });
  arrayEvents.forEach((key) => {
    const method = "_onData" + _capitalize(key);
    const base = array[key];
    Object.defineProperty(array, key, {
      configurable: true,
      enumerable: false,
      value(...args) {
        const res = base.apply(this, args);
        array._chartjs.listeners.forEach((object) => {
          if (typeof object[method] === "function") {
            object[method](...args);
          }
        });
        return res;
      }
    });
  });
}
function unlistenArrayEvents(array, listener) {
  const stub = array._chartjs;
  if (!stub) {
    return;
  }
  const listeners = stub.listeners;
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
  if (listeners.length > 0) {
    return;
  }
  arrayEvents.forEach((key) => {
    delete array[key];
  });
  delete array._chartjs;
}
function _arrayUnique(items) {
  const set2 = new Set(items);
  if (set2.size === items.length) {
    return items;
  }
  return Array.from(set2);
}
var requestAnimFrame = (function() {
  if (typeof window === "undefined") {
    return function(callback2) {
      return callback2();
    };
  }
  return window.requestAnimationFrame;
})();
function throttled(fn, thisArg) {
  let argsToUse = [];
  let ticking = false;
  return function(...args) {
    argsToUse = args;
    if (!ticking) {
      ticking = true;
      requestAnimFrame.call(window, () => {
        ticking = false;
        fn.apply(thisArg, argsToUse);
      });
    }
  };
}
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    if (delay) {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay, args);
    } else {
      fn.apply(this, args);
    }
    return delay;
  };
}
var _toLeftRightCenter = (align) => align === "start" ? "left" : align === "end" ? "right" : "center";
var _alignStartEnd = (align, start, end) => align === "start" ? start : align === "end" ? end : (start + end) / 2;
function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
  const pointCount = points.length;
  let start = 0;
  let count = pointCount;
  if (meta._sorted) {
    const { iScale, vScale, _parsed } = meta;
    const spanGaps = meta.dataset ? meta.dataset.options ? meta.dataset.options.spanGaps : null : null;
    const axis = iScale.axis;
    const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
    if (minDefined) {
      start = Math.min(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, axis, min).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo
      );
      if (spanGaps) {
        const distanceToDefinedLo = _parsed.slice(0, start + 1).reverse().findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        start -= Math.max(0, distanceToDefinedLo);
      }
      start = _limitValue(start, 0, pointCount - 1);
    }
    if (maxDefined) {
      let end = Math.max(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, iScale.axis, max, true).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1
      );
      if (spanGaps) {
        const distanceToDefinedHi = _parsed.slice(end - 1).findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        end += Math.max(0, distanceToDefinedHi);
      }
      count = _limitValue(end, start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
  }
  return {
    start,
    count
  };
}
function _scaleRangesChanged(meta) {
  const { xScale, yScale, _scaleRanges } = meta;
  const newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
  Object.assign(_scaleRanges, newRanges);
  return changed;
}
var atEdge = (t) => t === 0 || t === 1;
var elasticIn = (t, s, p) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
var elasticOut = (t, s, p) => Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;
var effects = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => -t * (t - 2),
  easeInOutQuad: (t) => (t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (t -= 1) * t * t + 1,
  easeInOutCubic: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2),
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => -((t -= 1) * t * t * t - 1),
  easeInOutQuart: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2),
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => (t -= 1) * t * t * t * t + 1,
  easeInOutQuint: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2),
  easeInSine: (t) => -Math.cos(t * HALF_PI) + 1,
  easeOutSine: (t) => Math.sin(t * HALF_PI),
  easeInOutSine: (t) => -0.5 * (Math.cos(PI * t) - 1),
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
  easeInOutExpo: (t) => atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),
  easeInCirc: (t) => t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1),
  easeOutCirc: (t) => Math.sqrt(1 - (t -= 1) * t),
  easeInOutCirc: (t) => (t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
  easeInElastic: (t) => atEdge(t) ? t : elasticIn(t, 0.075, 0.3),
  easeOutElastic: (t) => atEdge(t) ? t : elasticOut(t, 0.075, 0.3),
  easeInOutElastic(t) {
    const s = 0.1125;
    const p = 0.45;
    return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
  },
  easeInBack(t) {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack(t) {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },
  easeInOutBack(t) {
    let s = 1.70158;
    if ((t /= 0.5) < 1) {
      return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
    }
    return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
  },
  easeInBounce: (t) => 1 - effects.easeOutBounce(1 - t),
  easeOutBounce(t) {
    const m = 7.5625;
    const d = 2.75;
    if (t < 1 / d) {
      return m * t * t;
    }
    if (t < 2 / d) {
      return m * (t -= 1.5 / d) * t + 0.75;
    }
    if (t < 2.5 / d) {
      return m * (t -= 2.25 / d) * t + 0.9375;
    }
    return m * (t -= 2.625 / d) * t + 0.984375;
  },
  easeInOutBounce: (t) => t < 0.5 ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
};
function isPatternOrGradient(value) {
  if (value && typeof value === "object") {
    const type = value.toString();
    return type === "[object CanvasPattern]" || type === "[object CanvasGradient]";
  }
  return false;
}
function color(value) {
  return isPatternOrGradient(value) ? value : new Color(value);
}
function getHoverColor(value) {
  return isPatternOrGradient(value) ? value : new Color(value).saturate(0.5).darken(0.1).hexString();
}
var numbers = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
];
var colors = [
  "color",
  "borderColor",
  "backgroundColor"
];
function applyAnimationsDefaults(defaults2) {
  defaults2.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  });
  defaults2.describe("animation", {
    _fallback: false,
    _indexable: false,
    _scriptable: (name) => name !== "onProgress" && name !== "onComplete" && name !== "fn"
  });
  defaults2.set("animations", {
    colors: {
      type: "color",
      properties: colors
    },
    numbers: {
      type: "number",
      properties: numbers
    }
  });
  defaults2.describe("animations", {
    _fallback: "animation"
  });
  defaults2.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (v) => v | 0
        }
      }
    }
  });
}
function applyLayoutsDefaults(defaults2) {
  defaults2.set("layout", {
    autoPadding: true,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
var intlCache = /* @__PURE__ */ new Map();
function getNumberFormat(locale, options) {
  options = options || {};
  const cacheKey = locale + JSON.stringify(options);
  let formatter = intlCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    intlCache.set(cacheKey, formatter);
  }
  return formatter;
}
function formatNumber(num, locale, options) {
  return getNumberFormat(locale, options).format(num);
}
var formatters = {
  values(value) {
    return isArray(value) ? value : "" + value;
  },
  numeric(tickValue, index, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const locale = this.chart.options.locale;
    let notation;
    let delta = tickValue;
    if (ticks.length > 1) {
      const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
      if (maxTick < 1e-4 || maxTick > 1e15) {
        notation = "scientific";
      }
      delta = calculateDelta(tickValue, ticks);
    }
    const logDelta = log10(Math.abs(delta));
    const numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
    const options = {
      notation,
      minimumFractionDigits: numDecimal,
      maximumFractionDigits: numDecimal
    };
    Object.assign(options, this.options.ticks.format);
    return formatNumber(tickValue, locale, options);
  },
  logarithmic(tickValue, index, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const remain = ticks[index].significand || tickValue / Math.pow(10, Math.floor(log10(tickValue)));
    if ([
      1,
      2,
      3,
      5,
      10,
      15
    ].includes(remain) || index > 0.8 * ticks.length) {
      return formatters.numeric.call(this, tickValue, index, ticks);
    }
    return "";
  }
};
function calculateDelta(tickValue, ticks) {
  let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    delta = tickValue - Math.floor(tickValue);
  }
  return delta;
}
var Ticks = {
  formatters
};
function applyScaleDefaults(defaults2) {
  defaults2.set("scale", {
    display: true,
    offset: false,
    reverse: false,
    beginAtZero: false,
    bounds: "ticks",
    clip: true,
    grace: 0,
    grid: {
      display: true,
      lineWidth: 1,
      drawOnChartArea: true,
      drawTicks: true,
      tickLength: 8,
      tickWidth: (_ctx, options) => options.lineWidth,
      tickColor: (_ctx, options) => options.color,
      offset: false
    },
    border: {
      display: true,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: false,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: false,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: true,
      autoSkip: true,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: Ticks.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: false,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  });
  defaults2.route("scale.ticks", "color", "", "color");
  defaults2.route("scale.grid", "color", "", "borderColor");
  defaults2.route("scale.border", "color", "", "borderColor");
  defaults2.route("scale.title", "color", "", "color");
  defaults2.describe("scale", {
    _fallback: false,
    _scriptable: (name) => !name.startsWith("before") && !name.startsWith("after") && name !== "callback" && name !== "parser",
    _indexable: (name) => name !== "borderDash" && name !== "tickBorderDash" && name !== "dash"
  });
  defaults2.describe("scales", {
    _fallback: "scale"
  });
  defaults2.describe("scale.ticks", {
    _scriptable: (name) => name !== "backdropPadding" && name !== "callback",
    _indexable: (name) => name !== "backdropPadding"
  });
}
var overrides = /* @__PURE__ */ Object.create(null);
var descriptors = /* @__PURE__ */ Object.create(null);
function getScope$1(node, key) {
  if (!key) {
    return node;
  }
  const keys = key.split(".");
  for (let i = 0, n = keys.length; i < n; ++i) {
    const k = keys[i];
    node = node[k] || (node[k] = /* @__PURE__ */ Object.create(null));
  }
  return node;
}
function set(root, scope, values) {
  if (typeof scope === "string") {
    return merge(getScope$1(root, scope), values);
  }
  return merge(getScope$1(root, ""), scope);
}
var Defaults = class {
  constructor(_descriptors2, _appliers) {
    this.animation = void 0;
    this.backgroundColor = "rgba(0,0,0,0.1)";
    this.borderColor = "rgba(0,0,0,0.1)";
    this.color = "#666";
    this.datasets = {};
    this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
    this.elements = {};
    this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ];
    this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    };
    this.hover = {};
    this.hoverBackgroundColor = (ctx, options) => getHoverColor(options.backgroundColor);
    this.hoverBorderColor = (ctx, options) => getHoverColor(options.borderColor);
    this.hoverColor = (ctx, options) => getHoverColor(options.color);
    this.indexAxis = "x";
    this.interaction = {
      mode: "nearest",
      intersect: true,
      includeInvisible: false
    };
    this.maintainAspectRatio = true;
    this.onHover = null;
    this.onClick = null;
    this.parsing = true;
    this.plugins = {};
    this.responsive = true;
    this.scale = void 0;
    this.scales = {};
    this.showLine = true;
    this.drawActiveElementsOnTop = true;
    this.describe(_descriptors2);
    this.apply(_appliers);
  }
  set(scope, values) {
    return set(this, scope, values);
  }
  get(scope) {
    return getScope$1(this, scope);
  }
  describe(scope, values) {
    return set(descriptors, scope, values);
  }
  override(scope, values) {
    return set(overrides, scope, values);
  }
  route(scope, name, targetScope, targetName) {
    const scopeObject = getScope$1(this, scope);
    const targetScopeObject = getScope$1(this, targetScope);
    const privateName = "_" + name;
    Object.defineProperties(scopeObject, {
      [privateName]: {
        value: scopeObject[name],
        writable: true
      },
      [name]: {
        enumerable: true,
        get() {
          const local = this[privateName];
          const target = targetScopeObject[targetName];
          if (isObject(local)) {
            return Object.assign({}, target, local);
          }
          return valueOrDefault(local, target);
        },
        set(value) {
          this[privateName] = value;
        }
      }
    });
  }
  apply(appliers) {
    appliers.forEach((apply) => apply(this));
  }
};
var defaults = /* @__PURE__ */ new Defaults({
  _scriptable: (name) => !name.startsWith("on"),
  _indexable: (name) => name !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: false,
    _indexable: false
  }
}, [
  applyAnimationsDefaults,
  applyLayoutsDefaults,
  applyScaleDefaults
]);
function toFontString(font) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }
  return (font.style ? font.style + " " : "") + (font.weight ? font.weight + " " : "") + font.size + "px " + font.family;
}
function _measureText(ctx, data, gc, longest, string) {
  let textWidth = data[string];
  if (!textWidth) {
    textWidth = data[string] = ctx.measureText(string).width;
    gc.push(string);
  }
  if (textWidth > longest) {
    longest = textWidth;
  }
  return longest;
}
function _longestText(ctx, font, arrayOfThings, cache) {
  cache = cache || {};
  let data = cache.data = cache.data || {};
  let gc = cache.garbageCollect = cache.garbageCollect || [];
  if (cache.font !== font) {
    data = cache.data = {};
    gc = cache.garbageCollect = [];
    cache.font = font;
  }
  ctx.save();
  ctx.font = font;
  let longest = 0;
  const ilen = arrayOfThings.length;
  let i, j, jlen, thing, nestedThing;
  for (i = 0; i < ilen; i++) {
    thing = arrayOfThings[i];
    if (thing !== void 0 && thing !== null && !isArray(thing)) {
      longest = _measureText(ctx, data, gc, longest, thing);
    } else if (isArray(thing)) {
      for (j = 0, jlen = thing.length; j < jlen; j++) {
        nestedThing = thing[j];
        if (nestedThing !== void 0 && nestedThing !== null && !isArray(nestedThing)) {
          longest = _measureText(ctx, data, gc, longest, nestedThing);
        }
      }
    }
  }
  ctx.restore();
  const gcLen = gc.length / 2;
  if (gcLen > arrayOfThings.length) {
    for (i = 0; i < gcLen; i++) {
      delete data[gc[i]];
    }
    gc.splice(0, gcLen);
  }
  return longest;
}
function _alignPixel(chart, pixel, width) {
  const devicePixelRatio = chart.currentDevicePixelRatio;
  const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
  return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
function clearCanvas(canvas, ctx) {
  if (!ctx && !canvas) {
    return;
  }
  ctx = ctx || canvas.getContext("2d");
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
function drawPoint(ctx, options, x, y) {
  drawPointLegend(ctx, options, x, y, null);
}
function drawPointLegend(ctx, options, x, y, w) {
  let type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
  const style = options.pointStyle;
  const rotation = options.rotation;
  const radius = options.radius;
  let rad = (rotation || 0) * RAD_PER_DEG;
  if (style && typeof style === "object") {
    type = style.toString();
    if (type === "[object HTMLImageElement]" || type === "[object HTMLCanvasElement]") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rad);
      ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
      ctx.restore();
      return;
    }
  }
  if (isNaN(radius) || radius <= 0) {
    return;
  }
  ctx.beginPath();
  switch (style) {
    // Default includes circle
    default:
      if (w) {
        ctx.ellipse(x, y, w / 2, radius, 0, 0, TAU);
      } else {
        ctx.arc(x, y, radius, 0, TAU);
      }
      ctx.closePath();
      break;
    case "triangle":
      width = w ? w / 2 : radius;
      ctx.moveTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      ctx.closePath();
      break;
    case "rectRounded":
      cornerRadius = radius * 0.516;
      size = radius - cornerRadius;
      xOffset = Math.cos(rad + QUARTER_PI) * size;
      xOffsetW = Math.cos(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
      yOffset = Math.sin(rad + QUARTER_PI) * size;
      yOffsetW = Math.sin(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
      ctx.arc(x - xOffsetW, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
      ctx.arc(x + yOffsetW, y - xOffset, cornerRadius, rad - HALF_PI, rad);
      ctx.arc(x + xOffsetW, y + yOffset, cornerRadius, rad, rad + HALF_PI);
      ctx.arc(x - yOffsetW, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
      ctx.closePath();
      break;
    case "rect":
      if (!rotation) {
        size = Math.SQRT1_2 * radius;
        width = w ? w / 2 : size;
        ctx.rect(x - width, y - size, 2 * width, 2 * size);
        break;
      }
      rad += QUARTER_PI;
    /* falls through */
    case "rectRot":
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      ctx.closePath();
      break;
    case "crossRot":
      rad += QUARTER_PI;
    /* falls through */
    case "cross":
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      break;
    case "star":
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      rad += QUARTER_PI;
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      break;
    case "line":
      xOffset = w ? w / 2 : Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      break;
    case "dash":
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(rad) * (w ? w / 2 : radius), y + Math.sin(rad) * radius);
      break;
    case false:
      ctx.closePath();
      break;
  }
  ctx.fill();
  if (options.borderWidth > 0) {
    ctx.stroke();
  }
}
function _isPointInArea(point, area, margin) {
  margin = margin || 0.5;
  return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
}
function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}
function unclipArea(ctx) {
  ctx.restore();
}
function _steppedLineTo(ctx, previous, target, flip, mode) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  if (mode === "middle") {
    const midpoint = (previous.x + target.x) / 2;
    ctx.lineTo(midpoint, previous.y);
    ctx.lineTo(midpoint, target.y);
  } else if (mode === "after" !== !!flip) {
    ctx.lineTo(previous.x, target.y);
  } else {
    ctx.lineTo(target.x, previous.y);
  }
  ctx.lineTo(target.x, target.y);
}
function _bezierCurveTo(ctx, previous, target, flip) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
}
function setRenderOpts(ctx, opts) {
  if (opts.translation) {
    ctx.translate(opts.translation[0], opts.translation[1]);
  }
  if (!isNullOrUndef(opts.rotation)) {
    ctx.rotate(opts.rotation);
  }
  if (opts.color) {
    ctx.fillStyle = opts.color;
  }
  if (opts.textAlign) {
    ctx.textAlign = opts.textAlign;
  }
  if (opts.textBaseline) {
    ctx.textBaseline = opts.textBaseline;
  }
}
function decorateText(ctx, x, y, line, opts) {
  if (opts.strikethrough || opts.underline) {
    const metrics = ctx.measureText(line);
    const left = x - metrics.actualBoundingBoxLeft;
    const right = x + metrics.actualBoundingBoxRight;
    const top = y - metrics.actualBoundingBoxAscent;
    const bottom2 = y + metrics.actualBoundingBoxDescent;
    const yDecoration = opts.strikethrough ? (top + bottom2) / 2 : bottom2;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.lineWidth = opts.decorationWidth || 2;
    ctx.moveTo(left, yDecoration);
    ctx.lineTo(right, yDecoration);
    ctx.stroke();
  }
}
function drawBackdrop(ctx, opts) {
  const oldColor = ctx.fillStyle;
  ctx.fillStyle = opts.color;
  ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
  ctx.fillStyle = oldColor;
}
function renderText(ctx, text, x, y, font, opts = {}) {
  const lines = isArray(text) ? text : [
    text
  ];
  const stroke = opts.strokeWidth > 0 && opts.strokeColor !== "";
  let i, line;
  ctx.save();
  ctx.font = font.string;
  setRenderOpts(ctx, opts);
  for (i = 0; i < lines.length; ++i) {
    line = lines[i];
    if (opts.backdrop) {
      drawBackdrop(ctx, opts.backdrop);
    }
    if (stroke) {
      if (opts.strokeColor) {
        ctx.strokeStyle = opts.strokeColor;
      }
      if (!isNullOrUndef(opts.strokeWidth)) {
        ctx.lineWidth = opts.strokeWidth;
      }
      ctx.strokeText(line, x, y, opts.maxWidth);
    }
    ctx.fillText(line, x, y, opts.maxWidth);
    decorateText(ctx, x, y, line, opts);
    y += Number(font.lineHeight);
  }
  ctx.restore();
}
function addRoundedRectPath(ctx, rect) {
  const { x, y, w, h, radius } = rect;
  ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, 1.5 * PI, PI, true);
  ctx.lineTo(x, y + h - radius.bottomLeft);
  ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
  ctx.lineTo(x + w - radius.bottomRight, y + h);
  ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
  ctx.lineTo(x + w, y + radius.topRight);
  ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);
  ctx.lineTo(x + radius.topLeft, y);
}
var LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
var FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function toLineHeight(value, size) {
  const matches = ("" + value).match(LINE_HEIGHT);
  if (!matches || matches[1] === "normal") {
    return size * 1.2;
  }
  value = +matches[2];
  switch (matches[3]) {
    case "px":
      return value;
    case "%":
      value /= 100;
      break;
  }
  return size * value;
}
var numberOrZero = (v) => +v || 0;
function _readValueToProps(value, props) {
  const ret = {};
  const objProps = isObject(props);
  const keys = objProps ? Object.keys(props) : props;
  const read = isObject(value) ? objProps ? (prop) => valueOrDefault(value[prop], value[props[prop]]) : (prop) => value[prop] : () => value;
  for (const prop of keys) {
    ret[prop] = numberOrZero(read(prop));
  }
  return ret;
}
function toTRBL(value) {
  return _readValueToProps(value, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function toTRBLCorners(value) {
  return _readValueToProps(value, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
function toPadding(value) {
  const obj = toTRBL(value);
  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;
  return obj;
}
function toFont(options, fallback) {
  options = options || {};
  fallback = fallback || defaults.font;
  let size = valueOrDefault(options.size, fallback.size);
  if (typeof size === "string") {
    size = parseInt(size, 10);
  }
  let style = valueOrDefault(options.style, fallback.style);
  if (style && !("" + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = void 0;
  }
  const font = {
    family: valueOrDefault(options.family, fallback.family),
    lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
    size,
    style,
    weight: valueOrDefault(options.weight, fallback.weight),
    string: ""
  };
  font.string = toFontString(font);
  return font;
}
function resolve(inputs, context, index, info) {
  let cacheable = true;
  let i, ilen, value;
  for (i = 0, ilen = inputs.length; i < ilen; ++i) {
    value = inputs[i];
    if (value === void 0) {
      continue;
    }
    if (context !== void 0 && typeof value === "function") {
      value = value(context);
      cacheable = false;
    }
    if (index !== void 0 && isArray(value)) {
      value = value[index % value.length];
      cacheable = false;
    }
    if (value !== void 0) {
      if (info && !cacheable) {
        info.cacheable = false;
      }
      return value;
    }
  }
}
function _addGrace(minmax, grace, beginAtZero) {
  const { min, max } = minmax;
  const change = toDimension(grace, (max - min) / 2);
  const keepZero = (value, add) => beginAtZero && value === 0 ? 0 : value + add;
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}
function createContext(parentContext, context) {
  return Object.assign(Object.create(parentContext), context);
}
function _createResolver(scopes, prefixes2 = [
  ""
], rootScopes, fallback, getTarget = () => scopes[0]) {
  const finalRootScopes = rootScopes || scopes;
  if (typeof fallback === "undefined") {
    fallback = _resolve("_fallback", scopes);
  }
  const cache = {
    [Symbol.toStringTag]: "Object",
    _cacheable: true,
    _scopes: scopes,
    _rootScopes: finalRootScopes,
    _fallback: fallback,
    _getTarget: getTarget,
    override: (scope) => _createResolver([
      scope,
      ...scopes
    ], prefixes2, finalRootScopes, fallback)
  };
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(target, prop) {
      delete target[prop];
      delete target._keys;
      delete scopes[0][prop];
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get(target, prop) {
      return _cached(target, prop, () => _resolveWithPrefixes(prop, prefixes2, scopes, target));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(scopes[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(target, prop) {
      return getKeysFromAllScopes(target).includes(prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(target) {
      return getKeysFromAllScopes(target);
    },
    /**
    * A trap for setting property values.
    */
    set(target, prop, value) {
      const storage = target._storage || (target._storage = getTarget());
      target[prop] = storage[prop] = value;
      delete target._keys;
      return true;
    }
  });
}
function _attachContext(proxy, context, subProxy, descriptorDefaults) {
  const cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
    override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
  };
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(target, prop) {
      delete target[prop];
      delete proxy[prop];
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get(target, prop, receiver) {
      return _cached(target, prop, () => _resolveWithContext(target, prop, receiver));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(target, prop) {
      return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? {
        enumerable: true,
        configurable: true
      } : void 0 : Reflect.getOwnPropertyDescriptor(proxy, prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(proxy);
    },
    /**
    * A trap for the in operator.
    */
    has(target, prop) {
      return Reflect.has(proxy, prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(proxy);
    },
    /**
    * A trap for setting property values.
    */
    set(target, prop, value) {
      proxy[prop] = value;
      delete target[prop];
      return true;
    }
  });
}
function _descriptors(proxy, defaults2 = {
  scriptable: true,
  indexable: true
}) {
  const { _scriptable = defaults2.scriptable, _indexable = defaults2.indexable, _allKeys = defaults2.allKeys } = proxy;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}
var readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name;
var needsSubResolver = (prop, value) => isObject(value) && prop !== "adapters" && (Object.getPrototypeOf(value) === null || value.constructor === Object);
function _cached(target, prop, resolve2) {
  if (Object.prototype.hasOwnProperty.call(target, prop) || prop === "constructor") {
    return target[prop];
  }
  const value = resolve2();
  target[prop] = value;
  return value;
}
function _resolveWithContext(target, prop, receiver) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  let value = _proxy[prop];
  if (isFunction(value) && descriptors2.isScriptable(prop)) {
    value = _resolveScriptable(prop, value, target, receiver);
  }
  if (isArray(value) && value.length) {
    value = _resolveArray(prop, value, target, descriptors2.isIndexable);
  }
  if (needsSubResolver(prop, value)) {
    value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors2);
  }
  return value;
}
function _resolveScriptable(prop, getValue, target, receiver) {
  const { _proxy, _context, _subProxy, _stack } = target;
  if (_stack.has(prop)) {
    throw new Error("Recursion detected: " + Array.from(_stack).join("->") + "->" + prop);
  }
  _stack.add(prop);
  let value = getValue(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (needsSubResolver(prop, value)) {
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}
function _resolveArray(prop, value, target, isIndexable) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  if (typeof _context.index !== "undefined" && isIndexable(prop)) {
    return value[_context.index % value.length];
  } else if (isObject(value[0])) {
    const arr = value;
    const scopes = _proxy._scopes.filter((s) => s !== arr);
    value = [];
    for (const item of arr) {
      const resolver = createSubResolver(scopes, _proxy, prop, item);
      value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors2));
    }
  }
  return value;
}
function resolveFallback(fallback, prop, value) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}
var getScope = (key, parent) => key === true ? parent : typeof key === "string" ? resolveObjectKey(parent, key) : void 0;
function addScopes(set2, parentScopes, key, parentFallback, value) {
  for (const parent of parentScopes) {
    const scope = getScope(key, parent);
    if (scope) {
      set2.add(scope);
      const fallback = resolveFallback(scope._fallback, key, value);
      if (typeof fallback !== "undefined" && fallback !== key && fallback !== parentFallback) {
        return fallback;
      }
    } else if (scope === false && typeof parentFallback !== "undefined" && key !== parentFallback) {
      return null;
    }
  }
  return false;
}
function createSubResolver(parentScopes, resolver, prop, value) {
  const rootScopes = resolver._rootScopes;
  const fallback = resolveFallback(resolver._fallback, prop, value);
  const allScopes = [
    ...parentScopes,
    ...rootScopes
  ];
  const set2 = /* @__PURE__ */ new Set();
  set2.add(value);
  let key = addScopesFromKey(set2, allScopes, prop, fallback || prop, value);
  if (key === null) {
    return false;
  }
  if (typeof fallback !== "undefined" && fallback !== prop) {
    key = addScopesFromKey(set2, allScopes, fallback, key, value);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(Array.from(set2), [
    ""
  ], rootScopes, fallback, () => subGetTarget(resolver, prop, value));
}
function addScopesFromKey(set2, allScopes, key, fallback, item) {
  while (key) {
    key = addScopes(set2, allScopes, key, fallback, item);
  }
  return key;
}
function subGetTarget(resolver, prop, value) {
  const parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  const target = parent[prop];
  if (isArray(target) && isObject(value)) {
    return value;
  }
  return target || {};
}
function _resolveWithPrefixes(prop, prefixes2, scopes, proxy) {
  let value;
  for (const prefix of prefixes2) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (typeof value !== "undefined") {
      return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
    }
  }
}
function _resolve(key, scopes) {
  for (const scope of scopes) {
    if (!scope) {
      continue;
    }
    const value = scope[key];
    if (typeof value !== "undefined") {
      return value;
    }
  }
}
function getKeysFromAllScopes(target) {
  let keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}
function resolveKeysFromAllScopes(scopes) {
  const set2 = /* @__PURE__ */ new Set();
  for (const scope of scopes) {
    for (const key of Object.keys(scope).filter((k) => !k.startsWith("_"))) {
      set2.add(key);
    }
  }
  return Array.from(set2);
}
var EPSILON = Number.EPSILON || 1e-14;
var getPoint = (points, i) => i < points.length && !points[i].skip && points[i];
var getValueAxis = (indexAxis) => indexAxis === "x" ? "y" : "x";
function splineCurve(firstPoint, middlePoint, afterPoint, t) {
  const previous = firstPoint.skip ? middlePoint : firstPoint;
  const current = middlePoint;
  const next = afterPoint.skip ? middlePoint : afterPoint;
  const d01 = distanceBetweenPoints(current, previous);
  const d12 = distanceBetweenPoints(next, current);
  let s01 = d01 / (d01 + d12);
  let s12 = d12 / (d01 + d12);
  s01 = isNaN(s01) ? 0 : s01;
  s12 = isNaN(s12) ? 0 : s12;
  const fa = t * s01;
  const fb = t * s12;
  return {
    previous: {
      x: current.x - fa * (next.x - previous.x),
      y: current.y - fa * (next.y - previous.y)
    },
    next: {
      x: current.x + fb * (next.x - previous.x),
      y: current.y + fb * (next.y - previous.y)
    }
  };
}
function monotoneAdjust(points, deltaK, mK) {
  const pointsLen = points.length;
  let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen - 1; ++i) {
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent || !pointAfter) {
      continue;
    }
    if (almostEquals(deltaK[i], 0, EPSILON)) {
      mK[i] = mK[i + 1] = 0;
      continue;
    }
    alphaK = mK[i] / deltaK[i];
    betaK = mK[i + 1] / deltaK[i];
    squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
    if (squaredMagnitude <= 9) {
      continue;
    }
    tauK = 3 / Math.sqrt(squaredMagnitude);
    mK[i] = alphaK * tauK * deltaK[i];
    mK[i + 1] = betaK * tauK * deltaK[i];
  }
}
function monotoneCompute(points, mK, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  let delta, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    const iPixel = pointCurrent[indexAxis];
    const vPixel = pointCurrent[valueAxis];
    if (pointBefore) {
      delta = (iPixel - pointBefore[indexAxis]) / 3;
      pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
      pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i];
    }
    if (pointAfter) {
      delta = (pointAfter[indexAxis] - iPixel) / 3;
      pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
      pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i];
    }
  }
}
function splineCurveMonotone(points, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  const deltaK = Array(pointsLen).fill(0);
  const mK = Array(pointsLen);
  let i, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    if (pointAfter) {
      const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
      deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
    }
    mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : sign(deltaK[i - 1]) !== sign(deltaK[i]) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
  }
  monotoneAdjust(points, deltaK, mK);
  monotoneCompute(points, mK, indexAxis);
}
function capControlPoint(pt, min, max) {
  return Math.max(Math.min(pt, max), min);
}
function capBezierPoints(points, area) {
  let i, ilen, point, inArea, inAreaPrev;
  let inAreaNext = _isPointInArea(points[0], area);
  for (i = 0, ilen = points.length; i < ilen; ++i) {
    inAreaPrev = inArea;
    inArea = inAreaNext;
    inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area);
    if (!inArea) {
      continue;
    }
    point = points[i];
    if (inAreaPrev) {
      point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
      point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
    }
    if (inAreaNext) {
      point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
      point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
    }
  }
}
function _updateBezierControlPoints(points, options, area, loop, indexAxis) {
  let i, ilen, point, controlPoints;
  if (options.spanGaps) {
    points = points.filter((pt) => !pt.skip);
  }
  if (options.cubicInterpolationMode === "monotone") {
    splineCurveMonotone(points, indexAxis);
  } else {
    let prev = loop ? points[points.length - 1] : points[0];
    for (i = 0, ilen = points.length; i < ilen; ++i) {
      point = points[i];
      controlPoints = splineCurve(prev, point, points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen], options.tension);
      point.cp1x = controlPoints.previous.x;
      point.cp1y = controlPoints.previous.y;
      point.cp2x = controlPoints.next.x;
      point.cp2y = controlPoints.next.y;
      prev = point;
    }
  }
  if (options.capBezierPoints) {
    capBezierPoints(points, area);
  }
}
function _isDomSupported() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
function _getParentNode(domNode) {
  let parent = domNode.parentNode;
  if (parent && parent.toString() === "[object ShadowRoot]") {
    parent = parent.host;
  }
  return parent;
}
function parseMaxStyle(styleValue, node, parentProperty) {
  let valueInPixels;
  if (typeof styleValue === "string") {
    valueInPixels = parseInt(styleValue, 10);
    if (styleValue.indexOf("%") !== -1) {
      valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
    }
  } else {
    valueInPixels = styleValue;
  }
  return valueInPixels;
}
var getComputedStyle2 = (element) => element.ownerDocument.defaultView.getComputedStyle(element, null);
function getStyle(el, property) {
  return getComputedStyle2(el).getPropertyValue(property);
}
var positions = [
  "top",
  "right",
  "bottom",
  "left"
];
function getPositionedStyle(styles, style, suffix) {
  const result = {};
  suffix = suffix ? "-" + suffix : "";
  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    result[pos] = parseFloat(styles[style + "-" + pos + suffix]) || 0;
  }
  result.width = result.left + result.right;
  result.height = result.top + result.bottom;
  return result;
}
var useOffsetPos = (x, y, target) => (x > 0 || y > 0) && (!target || !target.shadowRoot);
function getCanvasPosition(e, canvas) {
  const touches = e.touches;
  const source = touches && touches.length ? touches[0] : e;
  const { offsetX, offsetY } = source;
  let box = false;
  let x, y;
  if (useOffsetPos(offsetX, offsetY, e.target)) {
    x = offsetX;
    y = offsetY;
  } else {
    const rect = canvas.getBoundingClientRect();
    x = source.clientX - rect.left;
    y = source.clientY - rect.top;
    box = true;
  }
  return {
    x,
    y,
    box
  };
}
function getRelativePosition(event, chart) {
  if ("native" in event) {
    return event;
  }
  const { canvas, currentDevicePixelRatio } = chart;
  const style = getComputedStyle2(canvas);
  const borderBox = style.boxSizing === "border-box";
  const paddings = getPositionedStyle(style, "padding");
  const borders = getPositionedStyle(style, "border", "width");
  const { x, y, box } = getCanvasPosition(event, canvas);
  const xOffset = paddings.left + (box && borders.left);
  const yOffset = paddings.top + (box && borders.top);
  let { width, height } = chart;
  if (borderBox) {
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  return {
    x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
    y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
  };
}
function getContainerSize(canvas, width, height) {
  let maxWidth, maxHeight;
  if (width === void 0 || height === void 0) {
    const container = canvas && _getParentNode(canvas);
    if (!container) {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    } else {
      const rect = container.getBoundingClientRect();
      const containerStyle = getComputedStyle2(container);
      const containerBorder = getPositionedStyle(containerStyle, "border", "width");
      const containerPadding = getPositionedStyle(containerStyle, "padding");
      width = rect.width - containerPadding.width - containerBorder.width;
      height = rect.height - containerPadding.height - containerBorder.height;
      maxWidth = parseMaxStyle(containerStyle.maxWidth, container, "clientWidth");
      maxHeight = parseMaxStyle(containerStyle.maxHeight, container, "clientHeight");
    }
  }
  return {
    width,
    height,
    maxWidth: maxWidth || INFINITY,
    maxHeight: maxHeight || INFINITY
  };
}
var round1 = (v) => Math.round(v * 10) / 10;
function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
  const style = getComputedStyle2(canvas);
  const margins = getPositionedStyle(style, "margin");
  const maxWidth = parseMaxStyle(style.maxWidth, canvas, "clientWidth") || INFINITY;
  const maxHeight = parseMaxStyle(style.maxHeight, canvas, "clientHeight") || INFINITY;
  const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
  let { width, height } = containerSize;
  if (style.boxSizing === "content-box") {
    const borders = getPositionedStyle(style, "border", "width");
    const paddings = getPositionedStyle(style, "padding");
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  width = Math.max(0, width - margins.width);
  height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
  width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
  height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
  if (width && !height) {
    height = round1(width / 2);
  }
  const maintainHeight = bbWidth !== void 0 || bbHeight !== void 0;
  if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
    height = containerSize.height;
    width = round1(Math.floor(height * aspectRatio));
  }
  return {
    width,
    height
  };
}
function retinaScale(chart, forceRatio, forceStyle) {
  const pixelRatio = forceRatio || 1;
  const deviceHeight = round1(chart.height * pixelRatio);
  const deviceWidth = round1(chart.width * pixelRatio);
  chart.height = round1(chart.height);
  chart.width = round1(chart.width);
  const canvas = chart.canvas;
  if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
    canvas.style.height = `${chart.height}px`;
    canvas.style.width = `${chart.width}px`;
  }
  if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) {
    chart.currentDevicePixelRatio = pixelRatio;
    canvas.height = deviceHeight;
    canvas.width = deviceWidth;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return true;
  }
  return false;
}
var supportsEventListenerOptions = (function() {
  let passiveSupported = false;
  try {
    const options = {
      get passive() {
        passiveSupported = true;
        return false;
      }
    };
    if (_isDomSupported()) {
      window.addEventListener("test", null, options);
      window.removeEventListener("test", null, options);
    }
  } catch (e) {
  }
  return passiveSupported;
})();
function readUsedSize(element, property) {
  const value = getStyle(element, property);
  const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
  return matches ? +matches[1] : void 0;
}
function _pointInLine(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}
function _steppedInterpolation(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: mode === "middle" ? t < 0.5 ? p1.y : p2.y : mode === "after" ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y
  };
}
function _bezierInterpolation(p1, p2, t, mode) {
  const cp1 = {
    x: p1.cp2x,
    y: p1.cp2y
  };
  const cp2 = {
    x: p2.cp1x,
    y: p2.cp1y
  };
  const a = _pointInLine(p1, cp1, t);
  const b = _pointInLine(cp1, cp2, t);
  const c = _pointInLine(cp2, p2, t);
  const d = _pointInLine(a, b, t);
  const e = _pointInLine(b, c, t);
  return _pointInLine(d, e, t);
}
function propertyFn(property) {
  if (property === "angle") {
    return {
      between: _angleBetween,
      compare: _angleDiff,
      normalize: _normalizeAngle
    };
  }
  return {
    between: _isBetween,
    compare: (a, b) => a - b,
    normalize: (x) => x
  };
}
function normalizeSegment({ start, end, count, loop, style }) {
  return {
    start: start % count,
    end: end % count,
    loop: loop && (end - start + 1) % count === 0,
    style
  };
}
function getSegment(segment, points, bounds) {
  const { property, start: startBound, end: endBound } = bounds;
  const { between, normalize } = propertyFn(property);
  const count = points.length;
  let { start, end, loop } = segment;
  let i, ilen;
  if (loop) {
    start += count;
    end += count;
    for (i = 0, ilen = count; i < ilen; ++i) {
      if (!between(normalize(points[start % count][property]), startBound, endBound)) {
        break;
      }
      start--;
      end--;
    }
    start %= count;
    end %= count;
  }
  if (end < start) {
    end += count;
  }
  return {
    start,
    end,
    loop,
    style: segment.style
  };
}
function _boundSegment(segment, points, bounds) {
  if (!bounds) {
    return [
      segment
    ];
  }
  const { property, start: startBound, end: endBound } = bounds;
  const count = points.length;
  const { compare, between, normalize } = propertyFn(property);
  const { start, end, loop, style } = getSegment(segment, points, bounds);
  const result = [];
  let inside = false;
  let subStart = null;
  let value, point, prevValue;
  const startIsBefore = () => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
  const endIsBefore = () => compare(endBound, value) === 0 || between(endBound, prevValue, value);
  const shouldStart = () => inside || startIsBefore();
  const shouldStop = () => !inside || endIsBefore();
  for (let i = start, prev = start; i <= end; ++i) {
    point = points[i % count];
    if (point.skip) {
      continue;
    }
    value = normalize(point[property]);
    if (value === prevValue) {
      continue;
    }
    inside = between(value, startBound, endBound);
    if (subStart === null && shouldStart()) {
      subStart = compare(value, startBound) === 0 ? i : prev;
    }
    if (subStart !== null && shouldStop()) {
      result.push(normalizeSegment({
        start: subStart,
        end: i,
        loop,
        count,
        style
      }));
      subStart = null;
    }
    prev = i;
    prevValue = value;
  }
  if (subStart !== null) {
    result.push(normalizeSegment({
      start: subStart,
      end,
      loop,
      count,
      style
    }));
  }
  return result;
}
function _boundSegments(line, bounds) {
  const result = [];
  const segments = line.segments;
  for (let i = 0; i < segments.length; i++) {
    const sub = _boundSegment(segments[i], line.points, bounds);
    if (sub.length) {
      result.push(...sub);
    }
  }
  return result;
}
function findStartAndEnd(points, count, loop, spanGaps) {
  let start = 0;
  let end = count - 1;
  if (loop && !spanGaps) {
    while (start < count && !points[start].skip) {
      start++;
    }
  }
  while (start < count && points[start].skip) {
    start++;
  }
  start %= count;
  if (loop) {
    end += start;
  }
  while (end > start && points[end % count].skip) {
    end--;
  }
  end %= count;
  return {
    start,
    end
  };
}
function solidSegments(points, start, max, loop) {
  const count = points.length;
  const result = [];
  let last = start;
  let prev = points[start];
  let end;
  for (end = start + 1; end <= max; ++end) {
    const cur = points[end % count];
    if (cur.skip || cur.stop) {
      if (!prev.skip) {
        loop = false;
        result.push({
          start: start % count,
          end: (end - 1) % count,
          loop
        });
        start = last = cur.stop ? end : null;
      }
    } else {
      last = end;
      if (prev.skip) {
        start = end;
      }
    }
    prev = cur;
  }
  if (last !== null) {
    result.push({
      start: start % count,
      end: last % count,
      loop
    });
  }
  return result;
}
function _computeSegments(line, segmentOptions) {
  const points = line.points;
  const spanGaps = line.options.spanGaps;
  const count = points.length;
  if (!count) {
    return [];
  }
  const loop = !!line._loop;
  const { start, end } = findStartAndEnd(points, count, loop, spanGaps);
  if (spanGaps === true) {
    return splitByStyles(line, [
      {
        start,
        end,
        loop
      }
    ], points, segmentOptions);
  }
  const max = end < start ? end + count : end;
  const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
  return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}
function splitByStyles(line, segments, points, segmentOptions) {
  if (!segmentOptions || !segmentOptions.setContext || !points) {
    return segments;
  }
  return doSplitByStyles(line, segments, points, segmentOptions);
}
function doSplitByStyles(line, segments, points, segmentOptions) {
  const chartContext = line._chart.getContext();
  const baseStyle = readStyle(line.options);
  const { _datasetIndex: datasetIndex, options: { spanGaps } } = line;
  const count = points.length;
  const result = [];
  let prevStyle = baseStyle;
  let start = segments[0].start;
  let i = start;
  function addStyle(s, e, l, st) {
    const dir = spanGaps ? -1 : 1;
    if (s === e) {
      return;
    }
    s += count;
    while (points[s % count].skip) {
      s -= dir;
    }
    while (points[e % count].skip) {
      e += dir;
    }
    if (s % count !== e % count) {
      result.push({
        start: s % count,
        end: e % count,
        loop: l,
        style: st
      });
      prevStyle = st;
      start = e % count;
    }
  }
  for (const segment of segments) {
    start = spanGaps ? start : segment.start;
    let prev = points[start % count];
    let style;
    for (i = start + 1; i <= segment.end; i++) {
      const pt = points[i % count];
      style = readStyle(segmentOptions.setContext(createContext(chartContext, {
        type: "segment",
        p0: prev,
        p1: pt,
        p0DataIndex: (i - 1) % count,
        p1DataIndex: i % count,
        datasetIndex
      })));
      if (styleChanged(style, prevStyle)) {
        addStyle(start, i - 1, segment.loop, prevStyle);
      }
      prev = pt;
      prevStyle = style;
    }
    if (start < i - 1) {
      addStyle(start, i - 1, segment.loop, prevStyle);
    }
  }
  return result;
}
function readStyle(options) {
  return {
    backgroundColor: options.backgroundColor,
    borderCapStyle: options.borderCapStyle,
    borderDash: options.borderDash,
    borderDashOffset: options.borderDashOffset,
    borderJoinStyle: options.borderJoinStyle,
    borderWidth: options.borderWidth,
    borderColor: options.borderColor
  };
}
function styleChanged(style, prevStyle) {
  if (!prevStyle) {
    return false;
  }
  const cache = [];
  const replacer = function(key, value) {
    if (!isPatternOrGradient(value)) {
      return value;
    }
    if (!cache.includes(value)) {
      cache.push(value);
    }
    return cache.indexOf(value);
  };
  return JSON.stringify(style, replacer) !== JSON.stringify(prevStyle, replacer);
}
function getSizeForArea(scale, chartArea, field) {
  return scale.options.clip ? scale[field] : chartArea[field];
}
function getDatasetArea(meta, chartArea) {
  const { xScale, yScale } = meta;
  if (xScale && yScale) {
    return {
      left: getSizeForArea(xScale, chartArea, "left"),
      right: getSizeForArea(xScale, chartArea, "right"),
      top: getSizeForArea(yScale, chartArea, "top"),
      bottom: getSizeForArea(yScale, chartArea, "bottom")
    };
  }
  return chartArea;
}
function getDatasetClipArea(chart, meta) {
  const clip = meta._clip;
  if (clip.disabled) {
    return false;
  }
  const area = getDatasetArea(meta, chart.chartArea);
  return {
    left: clip.left === false ? 0 : area.left - (clip.left === true ? 0 : clip.left),
    right: clip.right === false ? chart.width : area.right + (clip.right === true ? 0 : clip.right),
    top: clip.top === false ? 0 : area.top - (clip.top === true ? 0 : clip.top),
    bottom: clip.bottom === false ? chart.height : area.bottom + (clip.bottom === true ? 0 : clip.bottom)
  };
}

// node_modules/chart.js/dist/chart.js
var Animator = class {
  constructor() {
    this._request = null;
    this._charts = /* @__PURE__ */ new Map();
    this._running = false;
    this._lastDate = void 0;
  }
  _notify(chart, anims, date, type) {
    const callbacks = anims.listeners[type];
    const numSteps = anims.duration;
    callbacks.forEach((fn) => fn({
      chart,
      initial: anims.initial,
      numSteps,
      currentStep: Math.min(date - anims.start, numSteps)
    }));
  }
  _refresh() {
    if (this._request) {
      return;
    }
    this._running = true;
    this._request = requestAnimFrame.call(window, () => {
      this._update();
      this._request = null;
      if (this._running) {
        this._refresh();
      }
    });
  }
  _update(date = Date.now()) {
    let remaining = 0;
    this._charts.forEach((anims, chart) => {
      if (!anims.running || !anims.items.length) {
        return;
      }
      const items = anims.items;
      let i = items.length - 1;
      let draw2 = false;
      let item;
      for (; i >= 0; --i) {
        item = items[i];
        if (item._active) {
          if (item._total > anims.duration) {
            anims.duration = item._total;
          }
          item.tick(date);
          draw2 = true;
        } else {
          items[i] = items[items.length - 1];
          items.pop();
        }
      }
      if (draw2) {
        chart.draw();
        this._notify(chart, anims, date, "progress");
      }
      if (!items.length) {
        anims.running = false;
        this._notify(chart, anims, date, "complete");
        anims.initial = false;
      }
      remaining += items.length;
    });
    this._lastDate = date;
    if (remaining === 0) {
      this._running = false;
    }
  }
  _getAnims(chart) {
    const charts = this._charts;
    let anims = charts.get(chart);
    if (!anims) {
      anims = {
        running: false,
        initial: true,
        items: [],
        listeners: {
          complete: [],
          progress: []
        }
      };
      charts.set(chart, anims);
    }
    return anims;
  }
  listen(chart, event, cb) {
    this._getAnims(chart).listeners[event].push(cb);
  }
  add(chart, items) {
    if (!items || !items.length) {
      return;
    }
    this._getAnims(chart).items.push(...items);
  }
  has(chart) {
    return this._getAnims(chart).items.length > 0;
  }
  start(chart) {
    const anims = this._charts.get(chart);
    if (!anims) {
      return;
    }
    anims.running = true;
    anims.start = Date.now();
    anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
    this._refresh();
  }
  running(chart) {
    if (!this._running) {
      return false;
    }
    const anims = this._charts.get(chart);
    if (!anims || !anims.running || !anims.items.length) {
      return false;
    }
    return true;
  }
  stop(chart) {
    const anims = this._charts.get(chart);
    if (!anims || !anims.items.length) {
      return;
    }
    const items = anims.items;
    let i = items.length - 1;
    for (; i >= 0; --i) {
      items[i].cancel();
    }
    anims.items = [];
    this._notify(chart, anims, Date.now(), "complete");
  }
  remove(chart) {
    return this._charts.delete(chart);
  }
};
var animator = /* @__PURE__ */ new Animator();
var transparent = "transparent";
var interpolators = {
  boolean(from2, to2, factor) {
    return factor > 0.5 ? to2 : from2;
  },
  color(from2, to2, factor) {
    const c0 = color(from2 || transparent);
    const c1 = c0.valid && color(to2 || transparent);
    return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to2;
  },
  number(from2, to2, factor) {
    return from2 + (to2 - from2) * factor;
  }
};
var Animation = class {
  constructor(cfg, target, prop, to2) {
    const currentValue = target[prop];
    to2 = resolve([
      cfg.to,
      to2,
      currentValue,
      cfg.from
    ]);
    const from2 = resolve([
      cfg.from,
      currentValue,
      to2
    ]);
    this._active = true;
    this._fn = cfg.fn || interpolators[cfg.type || typeof from2];
    this._easing = effects[cfg.easing] || effects.linear;
    this._start = Math.floor(Date.now() + (cfg.delay || 0));
    this._duration = this._total = Math.floor(cfg.duration);
    this._loop = !!cfg.loop;
    this._target = target;
    this._prop = prop;
    this._from = from2;
    this._to = to2;
    this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(cfg, to2, date) {
    if (this._active) {
      this._notify(false);
      const currentValue = this._target[this._prop];
      const elapsed = date - this._start;
      const remain = this._duration - elapsed;
      this._start = date;
      this._duration = Math.floor(Math.max(remain, cfg.duration));
      this._total += elapsed;
      this._loop = !!cfg.loop;
      this._to = resolve([
        cfg.to,
        to2,
        currentValue,
        cfg.from
      ]);
      this._from = resolve([
        cfg.from,
        currentValue,
        to2
      ]);
    }
  }
  cancel() {
    if (this._active) {
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }
  tick(date) {
    const elapsed = date - this._start;
    const duration = this._duration;
    const prop = this._prop;
    const from2 = this._from;
    const loop = this._loop;
    const to2 = this._to;
    let factor;
    this._active = from2 !== to2 && (loop || elapsed < duration);
    if (!this._active) {
      this._target[prop] = to2;
      this._notify(true);
      return;
    }
    if (elapsed < 0) {
      this._target[prop] = from2;
      return;
    }
    factor = elapsed / duration % 2;
    factor = loop && factor > 1 ? 2 - factor : factor;
    factor = this._easing(Math.min(1, Math.max(0, factor)));
    this._target[prop] = this._fn(from2, to2, factor);
  }
  wait() {
    const promises = this._promises || (this._promises = []);
    return new Promise((res, rej) => {
      promises.push({
        res,
        rej
      });
    });
  }
  _notify(resolved) {
    const method = resolved ? "res" : "rej";
    const promises = this._promises || [];
    for (let i = 0; i < promises.length; i++) {
      promises[i][method]();
    }
  }
};
var Animations = class {
  constructor(chart, config) {
    this._chart = chart;
    this._properties = /* @__PURE__ */ new Map();
    this.configure(config);
  }
  configure(config) {
    if (!isObject(config)) {
      return;
    }
    const animationOptions = Object.keys(defaults.animation);
    const animatedProps = this._properties;
    Object.getOwnPropertyNames(config).forEach((key) => {
      const cfg = config[key];
      if (!isObject(cfg)) {
        return;
      }
      const resolved = {};
      for (const option of animationOptions) {
        resolved[option] = cfg[option];
      }
      (isArray(cfg.properties) && cfg.properties || [
        key
      ]).forEach((prop) => {
        if (prop === key || !animatedProps.has(prop)) {
          animatedProps.set(prop, resolved);
        }
      });
    });
  }
  _animateOptions(target, values) {
    const newOptions = values.options;
    const options = resolveTargetOptions(target, newOptions);
    if (!options) {
      return [];
    }
    const animations = this._createAnimations(options, newOptions);
    if (newOptions.$shared) {
      awaitAll(target.options.$animations, newOptions).then(() => {
        target.options = newOptions;
      }, () => {
      });
    }
    return animations;
  }
  _createAnimations(target, values) {
    const animatedProps = this._properties;
    const animations = [];
    const running = target.$animations || (target.$animations = {});
    const props = Object.keys(values);
    const date = Date.now();
    let i;
    for (i = props.length - 1; i >= 0; --i) {
      const prop = props[i];
      if (prop.charAt(0) === "$") {
        continue;
      }
      if (prop === "options") {
        animations.push(...this._animateOptions(target, values));
        continue;
      }
      const value = values[prop];
      let animation = running[prop];
      const cfg = animatedProps.get(prop);
      if (animation) {
        if (cfg && animation.active()) {
          animation.update(cfg, value, date);
          continue;
        } else {
          animation.cancel();
        }
      }
      if (!cfg || !cfg.duration) {
        target[prop] = value;
        continue;
      }
      running[prop] = animation = new Animation(cfg, target, prop, value);
      animations.push(animation);
    }
    return animations;
  }
  update(target, values) {
    if (this._properties.size === 0) {
      Object.assign(target, values);
      return;
    }
    const animations = this._createAnimations(target, values);
    if (animations.length) {
      animator.add(this._chart, animations);
      return true;
    }
  }
};
function awaitAll(animations, properties) {
  const running = [];
  const keys = Object.keys(properties);
  for (let i = 0; i < keys.length; i++) {
    const anim = animations[keys[i]];
    if (anim && anim.active()) {
      running.push(anim.wait());
    }
  }
  return Promise.all(running);
}
function resolveTargetOptions(target, newOptions) {
  if (!newOptions) {
    return;
  }
  let options = target.options;
  if (!options) {
    target.options = newOptions;
    return;
  }
  if (options.$shared) {
    target.options = options = Object.assign({}, options, {
      $shared: false,
      $animations: {}
    });
  }
  return options;
}
function scaleClip(scale, allowedOverflow) {
  const opts = scale && scale.options || {};
  const reverse = opts.reverse;
  const min = opts.min === void 0 ? allowedOverflow : 0;
  const max = opts.max === void 0 ? allowedOverflow : 0;
  return {
    start: reverse ? max : min,
    end: reverse ? min : max
  };
}
function defaultClip(xScale, yScale, allowedOverflow) {
  if (allowedOverflow === false) {
    return false;
  }
  const x = scaleClip(xScale, allowedOverflow);
  const y = scaleClip(yScale, allowedOverflow);
  return {
    top: y.end,
    right: x.end,
    bottom: y.start,
    left: x.start
  };
}
function toClip(value) {
  let t, r2, b, l;
  if (isObject(value)) {
    t = value.top;
    r2 = value.right;
    b = value.bottom;
    l = value.left;
  } else {
    t = r2 = b = l = value;
  }
  return {
    top: t,
    right: r2,
    bottom: b,
    left: l,
    disabled: value === false
  };
}
function getSortedDatasetIndices(chart, filterVisible) {
  const keys = [];
  const metasets = chart._getSortedDatasetMetas(filterVisible);
  let i, ilen;
  for (i = 0, ilen = metasets.length; i < ilen; ++i) {
    keys.push(metasets[i].index);
  }
  return keys;
}
function applyStack(stack, value, dsIndex, options = {}) {
  const keys = stack.keys;
  const singleMode = options.mode === "single";
  let i, ilen, datasetIndex, otherValue;
  if (value === null) {
    return;
  }
  let found = false;
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    datasetIndex = +keys[i];
    if (datasetIndex === dsIndex) {
      found = true;
      if (options.all) {
        continue;
      }
      break;
    }
    otherValue = stack.values[datasetIndex];
    if (isNumberFinite(otherValue) && (singleMode || value === 0 || sign(value) === sign(otherValue))) {
      value += otherValue;
    }
  }
  if (!found && !options.all) {
    return 0;
  }
  return value;
}
function convertObjectDataToArray(data, meta) {
  const { iScale, vScale } = meta;
  const iAxisKey = iScale.axis === "x" ? "x" : "y";
  const vAxisKey = vScale.axis === "x" ? "x" : "y";
  const keys = Object.keys(data);
  const adata = new Array(keys.length);
  let i, ilen, key;
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    key = keys[i];
    adata[i] = {
      [iAxisKey]: key,
      [vAxisKey]: data[key]
    };
  }
  return adata;
}
function isStacked(scale, meta) {
  const stacked = scale && scale.options.stacked;
  return stacked || stacked === void 0 && meta.stack !== void 0;
}
function getStackKey(indexScale, valueScale, meta) {
  return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
}
function getUserBounds(scale) {
  const { min, max, minDefined, maxDefined } = scale.getUserBounds();
  return {
    min: minDefined ? min : Number.NEGATIVE_INFINITY,
    max: maxDefined ? max : Number.POSITIVE_INFINITY
  };
}
function getOrCreateStack(stacks, stackKey, indexValue) {
  const subStack = stacks[stackKey] || (stacks[stackKey] = {});
  return subStack[indexValue] || (subStack[indexValue] = {});
}
function getLastIndexInStack(stack, vScale, positive, type) {
  for (const meta of vScale.getMatchingVisibleMetas(type).reverse()) {
    const value = stack[meta.index];
    if (positive && value > 0 || !positive && value < 0) {
      return meta.index;
    }
  }
  return null;
}
function updateStacks(controller, parsed) {
  const { chart, _cachedMeta: meta } = controller;
  const stacks = chart._stacks || (chart._stacks = {});
  const { iScale, vScale, index: datasetIndex } = meta;
  const iAxis = iScale.axis;
  const vAxis = vScale.axis;
  const key = getStackKey(iScale, vScale, meta);
  const ilen = parsed.length;
  let stack;
  for (let i = 0; i < ilen; ++i) {
    const item = parsed[i];
    const { [iAxis]: index, [vAxis]: value } = item;
    const itemStacks = item._stacks || (item._stacks = {});
    stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
    stack[datasetIndex] = value;
    stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
    stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
    const visualValues = stack._visualValues || (stack._visualValues = {});
    visualValues[datasetIndex] = value;
  }
}
function getFirstScaleId(chart, axis) {
  const scales = chart.scales;
  return Object.keys(scales).filter((key) => scales[key].axis === axis).shift();
}
function createDatasetContext(parent, index) {
  return createContext(parent, {
    active: false,
    dataset: void 0,
    datasetIndex: index,
    index,
    mode: "default",
    type: "dataset"
  });
}
function createDataContext(parent, index, element) {
  return createContext(parent, {
    active: false,
    dataIndex: index,
    parsed: void 0,
    raw: void 0,
    element,
    index,
    mode: "default",
    type: "data"
  });
}
function clearStacks(meta, items) {
  const datasetIndex = meta.controller.index;
  const axis = meta.vScale && meta.vScale.axis;
  if (!axis) {
    return;
  }
  items = items || meta._parsed;
  for (const parsed of items) {
    const stacks = parsed._stacks;
    if (!stacks || stacks[axis] === void 0 || stacks[axis][datasetIndex] === void 0) {
      return;
    }
    delete stacks[axis][datasetIndex];
    if (stacks[axis]._visualValues !== void 0 && stacks[axis]._visualValues[datasetIndex] !== void 0) {
      delete stacks[axis]._visualValues[datasetIndex];
    }
  }
}
var isDirectUpdateMode = (mode) => mode === "reset" || mode === "none";
var cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached);
var createStack = (canStack, meta, chart) => canStack && !meta.hidden && meta._stacked && {
  keys: getSortedDatasetIndices(chart, true),
  values: null
};
var DatasetController = class {
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(chart, datasetIndex) {
    this.chart = chart;
    this._ctx = chart.ctx;
    this.index = datasetIndex;
    this._cachedDataOpts = {};
    this._cachedMeta = this.getMeta();
    this._type = this._cachedMeta.type;
    this.options = void 0;
    this._parsing = false;
    this._data = void 0;
    this._objectData = void 0;
    this._sharedOptions = void 0;
    this._drawStart = void 0;
    this._drawCount = void 0;
    this.enableOptionSharing = false;
    this.supportsDecimation = false;
    this.$context = void 0;
    this._syncList = [];
    this.datasetElementType = new.target.datasetElementType;
    this.dataElementType = new.target.dataElementType;
    this.initialize();
  }
  initialize() {
    const meta = this._cachedMeta;
    this.configure();
    this.linkScales();
    meta._stacked = isStacked(meta.vScale, meta);
    this.addElements();
    if (this.options.fill && !this.chart.isPluginEnabled("filler")) {
      console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
    }
  }
  updateIndex(datasetIndex) {
    if (this.index !== datasetIndex) {
      clearStacks(this._cachedMeta);
    }
    this.index = datasetIndex;
  }
  linkScales() {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    const chooseId = (axis, x, y, r2) => axis === "x" ? x : axis === "r" ? r2 : y;
    const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, "x"));
    const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, "y"));
    const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, "r"));
    const indexAxis = meta.indexAxis;
    const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
    const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
    meta.xScale = this.getScaleForId(xid);
    meta.yScale = this.getScaleForId(yid);
    meta.rScale = this.getScaleForId(rid);
    meta.iScale = this.getScaleForId(iid);
    meta.vScale = this.getScaleForId(vid);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(scaleID) {
    return this.chart.scales[scaleID];
  }
  _getOtherScale(scale) {
    const meta = this._cachedMeta;
    return scale === meta.iScale ? meta.vScale : meta.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const meta = this._cachedMeta;
    if (this._data) {
      unlistenArrayEvents(this._data, this);
    }
    if (meta._stacked) {
      clearStacks(meta);
    }
  }
  _dataCheck() {
    const dataset = this.getDataset();
    const data = dataset.data || (dataset.data = []);
    const _data = this._data;
    if (isObject(data)) {
      const meta = this._cachedMeta;
      this._data = convertObjectDataToArray(data, meta);
    } else if (_data !== data) {
      if (_data) {
        unlistenArrayEvents(_data, this);
        const meta = this._cachedMeta;
        clearStacks(meta);
        meta._parsed = [];
      }
      if (data && Object.isExtensible(data)) {
        listenArrayEvents(data, this);
      }
      this._syncList = [];
      this._data = data;
    }
  }
  addElements() {
    const meta = this._cachedMeta;
    this._dataCheck();
    if (this.datasetElementType) {
      meta.dataset = new this.datasetElementType();
    }
  }
  buildOrUpdateElements(resetNewElements) {
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    let stackChanged = false;
    this._dataCheck();
    const oldStacked = meta._stacked;
    meta._stacked = isStacked(meta.vScale, meta);
    if (meta.stack !== dataset.stack) {
      stackChanged = true;
      clearStacks(meta);
      meta.stack = dataset.stack;
    }
    this._resyncElements(resetNewElements);
    if (stackChanged || oldStacked !== meta._stacked) {
      updateStacks(this, meta._parsed);
      meta._stacked = isStacked(meta.vScale, meta);
    }
  }
  configure() {
    const config = this.chart.config;
    const scopeKeys = config.datasetScopeKeys(this._type);
    const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
    this.options = config.createResolver(scopes, this.getContext());
    this._parsing = this.options.parsing;
    this._cachedDataOpts = {};
  }
  parse(start, count) {
    const { _cachedMeta: meta, _data: data } = this;
    const { iScale, _stacked } = meta;
    const iAxis = iScale.axis;
    let sorted = start === 0 && count === data.length ? true : meta._sorted;
    let prev = start > 0 && meta._parsed[start - 1];
    let i, cur, parsed;
    if (this._parsing === false) {
      meta._parsed = data;
      meta._sorted = true;
      parsed = data;
    } else {
      if (isArray(data[start])) {
        parsed = this.parseArrayData(meta, data, start, count);
      } else if (isObject(data[start])) {
        parsed = this.parseObjectData(meta, data, start, count);
      } else {
        parsed = this.parsePrimitiveData(meta, data, start, count);
      }
      const isNotInOrderComparedToPrev = () => cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis];
      for (i = 0; i < count; ++i) {
        meta._parsed[i + start] = cur = parsed[i];
        if (sorted) {
          if (isNotInOrderComparedToPrev()) {
            sorted = false;
          }
          prev = cur;
        }
      }
      meta._sorted = sorted;
    }
    if (_stacked) {
      updateStacks(this, parsed);
    }
  }
  parsePrimitiveData(meta, data, start, count) {
    const { iScale, vScale } = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const labels = iScale.getLabels();
    const singleScale = iScale === vScale;
    const parsed = new Array(count);
    let i, ilen, index;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index = i + start;
      parsed[i] = {
        [iAxis]: singleScale || iScale.parse(labels[index], index),
        [vAxis]: vScale.parse(data[index], index)
      };
    }
    return parsed;
  }
  parseArrayData(meta, data, start, count) {
    const { xScale, yScale } = meta;
    const parsed = new Array(count);
    let i, ilen, index, item;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index = i + start;
      item = data[index];
      parsed[i] = {
        x: xScale.parse(item[0], index),
        y: yScale.parse(item[1], index)
      };
    }
    return parsed;
  }
  parseObjectData(meta, data, start, count) {
    const { xScale, yScale } = meta;
    const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
    const parsed = new Array(count);
    let i, ilen, index, item;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index = i + start;
      item = data[index];
      parsed[i] = {
        x: xScale.parse(resolveObjectKey(item, xAxisKey), index),
        y: yScale.parse(resolveObjectKey(item, yAxisKey), index)
      };
    }
    return parsed;
  }
  getParsed(index) {
    return this._cachedMeta._parsed[index];
  }
  getDataElement(index) {
    return this._cachedMeta.data[index];
  }
  applyStack(scale, parsed, mode) {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const value = parsed[scale.axis];
    const stack = {
      keys: getSortedDatasetIndices(chart, true),
      values: parsed._stacks[scale.axis]._visualValues
    };
    return applyStack(stack, value, meta.index, {
      mode
    });
  }
  updateRangeFromParsed(range, scale, parsed, stack) {
    const parsedValue = parsed[scale.axis];
    let value = parsedValue === null ? NaN : parsedValue;
    const values = stack && parsed._stacks[scale.axis];
    if (stack && values) {
      stack.values = values;
      value = applyStack(stack, parsedValue, this._cachedMeta.index);
    }
    range.min = Math.min(range.min, value);
    range.max = Math.max(range.max, value);
  }
  getMinMax(scale, canStack) {
    const meta = this._cachedMeta;
    const _parsed = meta._parsed;
    const sorted = meta._sorted && scale === meta.iScale;
    const ilen = _parsed.length;
    const otherScale = this._getOtherScale(scale);
    const stack = createStack(canStack, meta, this.chart);
    const range = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    const { min: otherMin, max: otherMax } = getUserBounds(otherScale);
    let i, parsed;
    function _skip() {
      parsed = _parsed[i];
      const otherValue = parsed[otherScale.axis];
      return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
    }
    for (i = 0; i < ilen; ++i) {
      if (_skip()) {
        continue;
      }
      this.updateRangeFromParsed(range, scale, parsed, stack);
      if (sorted) {
        break;
      }
    }
    if (sorted) {
      for (i = ilen - 1; i >= 0; --i) {
        if (_skip()) {
          continue;
        }
        this.updateRangeFromParsed(range, scale, parsed, stack);
        break;
      }
    }
    return range;
  }
  getAllParsedValues(scale) {
    const parsed = this._cachedMeta._parsed;
    const values = [];
    let i, ilen, value;
    for (i = 0, ilen = parsed.length; i < ilen; ++i) {
      value = parsed[i][scale.axis];
      if (isNumberFinite(value)) {
        values.push(value);
      }
    }
    return values;
  }
  getMaxOverflow() {
    return false;
  }
  getLabelAndValue(index) {
    const meta = this._cachedMeta;
    const iScale = meta.iScale;
    const vScale = meta.vScale;
    const parsed = this.getParsed(index);
    return {
      label: iScale ? "" + iScale.getLabelForValue(parsed[iScale.axis]) : "",
      value: vScale ? "" + vScale.getLabelForValue(parsed[vScale.axis]) : ""
    };
  }
  _update(mode) {
    const meta = this._cachedMeta;
    this.update(mode || "default");
    meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
  }
  update(mode) {
  }
  draw() {
    const ctx = this._ctx;
    const chart = this.chart;
    const meta = this._cachedMeta;
    const elements = meta.data || [];
    const area = chart.chartArea;
    const active = [];
    const start = this._drawStart || 0;
    const count = this._drawCount || elements.length - start;
    const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
    let i;
    if (meta.dataset) {
      meta.dataset.draw(ctx, area, start, count);
    }
    for (i = start; i < start + count; ++i) {
      const element = elements[i];
      if (element.hidden) {
        continue;
      }
      if (element.active && drawActiveElementsOnTop) {
        active.push(element);
      } else {
        element.draw(ctx, area);
      }
    }
    for (i = 0; i < active.length; ++i) {
      active[i].draw(ctx, area);
    }
  }
  getStyle(index, active) {
    const mode = active ? "active" : "default";
    return index === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index || 0, mode);
  }
  getContext(index, active, mode) {
    const dataset = this.getDataset();
    let context;
    if (index >= 0 && index < this._cachedMeta.data.length) {
      const element = this._cachedMeta.data[index];
      context = element.$context || (element.$context = createDataContext(this.getContext(), index, element));
      context.parsed = this.getParsed(index);
      context.raw = dataset.data[index];
      context.index = context.dataIndex = index;
    } else {
      context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
      context.dataset = dataset;
      context.index = context.datasetIndex = this.index;
    }
    context.active = !!active;
    context.mode = mode;
    return context;
  }
  resolveDatasetElementOptions(mode) {
    return this._resolveElementOptions(this.datasetElementType.id, mode);
  }
  resolveDataElementOptions(index, mode) {
    return this._resolveElementOptions(this.dataElementType.id, mode, index);
  }
  _resolveElementOptions(elementType, mode = "default", index) {
    const active = mode === "active";
    const cache = this._cachedDataOpts;
    const cacheKey = elementType + "-" + mode;
    const cached = cache[cacheKey];
    const sharing = this.enableOptionSharing && defined(index);
    if (cached) {
      return cloneIfNotShared(cached, sharing);
    }
    const config = this.chart.config;
    const scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
    const prefixes2 = active ? [
      `${elementType}Hover`,
      "hover",
      elementType,
      ""
    ] : [
      elementType,
      ""
    ];
    const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
    const names2 = Object.keys(defaults.elements[elementType]);
    const context = () => this.getContext(index, active, mode);
    const values = config.resolveNamedOptions(scopes, names2, context, prefixes2);
    if (values.$shared) {
      values.$shared = sharing;
      cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
    }
    return values;
  }
  _resolveAnimations(index, transition, active) {
    const chart = this.chart;
    const cache = this._cachedDataOpts;
    const cacheKey = `animation-${transition}`;
    const cached = cache[cacheKey];
    if (cached) {
      return cached;
    }
    let options;
    if (chart.options.animation !== false) {
      const config = this.chart.config;
      const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
      const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
      options = config.createResolver(scopes, this.getContext(index, active, transition));
    }
    const animations = new Animations(chart, options && options.animations);
    if (options && options._cacheable) {
      cache[cacheKey] = Object.freeze(animations);
    }
    return animations;
  }
  getSharedOptions(options) {
    if (!options.$shared) {
      return;
    }
    return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
  }
  includeOptions(mode, sharedOptions) {
    return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
  }
  _getSharedOptions(start, mode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const previouslySharedOptions = this._sharedOptions;
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
    this.updateSharedOptions(sharedOptions, mode, firstOpts);
    return {
      sharedOptions,
      includeOptions
    };
  }
  updateElement(element, index, properties, mode) {
    if (isDirectUpdateMode(mode)) {
      Object.assign(element, properties);
    } else {
      this._resolveAnimations(index, mode).update(element, properties);
    }
  }
  updateSharedOptions(sharedOptions, mode, newOptions) {
    if (sharedOptions && !isDirectUpdateMode(mode)) {
      this._resolveAnimations(void 0, mode).update(sharedOptions, newOptions);
    }
  }
  _setStyle(element, index, mode, active) {
    element.active = active;
    const options = this.getStyle(index, active);
    this._resolveAnimations(index, mode, active).update(element, {
      options: !active && this.getSharedOptions(options) || options
    });
  }
  removeHoverStyle(element, datasetIndex, index) {
    this._setStyle(element, index, "active", false);
  }
  setHoverStyle(element, datasetIndex, index) {
    this._setStyle(element, index, "active", true);
  }
  _removeDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;
    if (element) {
      this._setStyle(element, void 0, "active", false);
    }
  }
  _setDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;
    if (element) {
      this._setStyle(element, void 0, "active", true);
    }
  }
  _resyncElements(resetNewElements) {
    const data = this._data;
    const elements = this._cachedMeta.data;
    for (const [method, arg1, arg2] of this._syncList) {
      this[method](arg1, arg2);
    }
    this._syncList = [];
    const numMeta = elements.length;
    const numData = data.length;
    const count = Math.min(numData, numMeta);
    if (count) {
      this.parse(0, count);
    }
    if (numData > numMeta) {
      this._insertElements(numMeta, numData - numMeta, resetNewElements);
    } else if (numData < numMeta) {
      this._removeElements(numData, numMeta - numData);
    }
  }
  _insertElements(start, count, resetNewElements = true) {
    const meta = this._cachedMeta;
    const data = meta.data;
    const end = start + count;
    let i;
    const move = (arr) => {
      arr.length += count;
      for (i = arr.length - 1; i >= end; i--) {
        arr[i] = arr[i - count];
      }
    };
    move(data);
    for (i = start; i < end; ++i) {
      data[i] = new this.dataElementType();
    }
    if (this._parsing) {
      move(meta._parsed);
    }
    this.parse(start, count);
    if (resetNewElements) {
      this.updateElements(data, start, count, "reset");
    }
  }
  updateElements(element, start, count, mode) {
  }
  _removeElements(start, count) {
    const meta = this._cachedMeta;
    if (this._parsing) {
      const removed = meta._parsed.splice(start, count);
      if (meta._stacked) {
        clearStacks(meta, removed);
      }
    }
    meta.data.splice(start, count);
  }
  _sync(args) {
    if (this._parsing) {
      this._syncList.push(args);
    } else {
      const [method, arg1, arg2] = args;
      this[method](arg1, arg2);
    }
    this.chart._dataChanges.push([
      this.index,
      ...args
    ]);
  }
  _onDataPush() {
    const count = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - count,
      count
    ]);
  }
  _onDataPop() {
    this._sync([
      "_removeElements",
      this._cachedMeta.data.length - 1,
      1
    ]);
  }
  _onDataShift() {
    this._sync([
      "_removeElements",
      0,
      1
    ]);
  }
  _onDataSplice(start, count) {
    if (count) {
      this._sync([
        "_removeElements",
        start,
        count
      ]);
    }
    const newCount = arguments.length - 2;
    if (newCount) {
      this._sync([
        "_insertElements",
        start,
        newCount
      ]);
    }
  }
  _onDataUnshift() {
    this._sync([
      "_insertElements",
      0,
      arguments.length
    ]);
  }
};
var LineController = class extends DatasetController {
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: true,
    spanGaps: false
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category"
      },
      _value_: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = true;
    this.supportsDecimation = true;
    super.initialize();
  }
  update(mode) {
    const meta = this._cachedMeta;
    const { dataset: line, data: points = [], _dataset } = meta;
    const animationsDisabled = this.chart._animationsDisabled;
    let { start, count } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
    this._drawStart = start;
    this._drawCount = count;
    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }
    line._chart = this.chart;
    line._datasetIndex = this.index;
    line._decimated = !!_dataset._decimated;
    line.points = points;
    const options = this.resolveDatasetElementOptions(mode);
    if (!this.options.showLine) {
      options.borderWidth = 0;
    }
    options.segment = this.options.segment;
    this.updateElement(line, void 0, {
      animated: !animationsDisabled,
      options
    }, mode);
    this.updateElements(points, start, count, mode);
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const { spanGaps, segment } = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
    const end = start + count;
    const pointsCount = points.length;
    let prevParsed = start > 0 && this.getParsed(start - 1);
    for (let i = 0; i < pointsCount; ++i) {
      const point = points[i];
      const properties = directUpdate ? point : {};
      if (i < start || i >= end) {
        properties.skip = true;
        continue;
      }
      const parsed = this.getParsed(i);
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i];
      }
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
      }
      if (!directUpdate) {
        this.updateElement(point, i, properties, mode);
      }
      prevParsed = parsed;
    }
  }
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    const data = meta.data || [];
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
  draw() {
    const meta = this._cachedMeta;
    meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
    super.draw();
  }
};
function abstract() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
var DateAdapterBase = class _DateAdapterBase {
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(members) {
    Object.assign(_DateAdapterBase.prototype, members);
  }
  options;
  constructor(options) {
    this.options = options || {};
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return abstract();
  }
  parse() {
    return abstract();
  }
  format() {
    return abstract();
  }
  add() {
    return abstract();
  }
  diff() {
    return abstract();
  }
  startOf() {
    return abstract();
  }
  endOf() {
    return abstract();
  }
};
var adapters = {
  _date: DateAdapterBase
};
function binarySearch(metaset, axis, value, intersect) {
  const { controller, data, _sorted } = metaset;
  const iScale = controller._cachedMeta.iScale;
  const spanGaps = metaset.dataset ? metaset.dataset.options ? metaset.dataset.options.spanGaps : null : null;
  if (iScale && axis === iScale.axis && axis !== "r" && _sorted && data.length) {
    const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
    if (!intersect) {
      const result = lookupMethod(data, axis, value);
      if (spanGaps) {
        const { vScale } = controller._cachedMeta;
        const { _parsed } = metaset;
        const distanceToDefinedLo = _parsed.slice(0, result.lo + 1).reverse().findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        result.lo -= Math.max(0, distanceToDefinedLo);
        const distanceToDefinedHi = _parsed.slice(result.hi).findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        result.hi += Math.max(0, distanceToDefinedHi);
      }
      return result;
    } else if (controller._sharedOptions) {
      const el = data[0];
      const range = typeof el.getRange === "function" && el.getRange(axis);
      if (range) {
        const start = lookupMethod(data, axis, value - range);
        const end = lookupMethod(data, axis, value + range);
        return {
          lo: start.lo,
          hi: end.hi
        };
      }
    }
  }
  return {
    lo: 0,
    hi: data.length - 1
  };
}
function evaluateInteractionItems(chart, axis, position, handler, intersect) {
  const metasets = chart.getSortedVisibleDatasetMetas();
  const value = position[axis];
  for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
    const { index, data } = metasets[i];
    const { lo, hi } = binarySearch(metasets[i], axis, value, intersect);
    for (let j = lo; j <= hi; ++j) {
      const element = data[j];
      if (!element.skip) {
        handler(element, index, j);
      }
    }
  }
}
function getDistanceMetricForAxis(axis) {
  const useX = axis.indexOf("x") !== -1;
  const useY = axis.indexOf("y") !== -1;
  return function(pt1, pt2) {
    const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
    const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  };
}
function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
  const items = [];
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return items;
  }
  const evaluationFunc = function(element, datasetIndex, index) {
    if (!includeInvisible && !_isPointInArea(element, chart.chartArea, 0)) {
      return;
    }
    if (element.inRange(position.x, position.y, useFinalPosition)) {
      items.push({
        element,
        datasetIndex,
        index
      });
    }
  };
  evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
  return items;
}
function getNearestRadialItems(chart, position, axis, useFinalPosition) {
  let items = [];
  function evaluationFunc(element, datasetIndex, index) {
    const { startAngle, endAngle } = element.getProps([
      "startAngle",
      "endAngle"
    ], useFinalPosition);
    const { angle } = getAngleFromPoint(element, {
      x: position.x,
      y: position.y
    });
    if (_angleBetween(angle, startAngle, endAngle)) {
      items.push({
        element,
        datasetIndex,
        index
      });
    }
  }
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  let items = [];
  const distanceMetric = getDistanceMetricForAxis(axis);
  let minDistance = Number.POSITIVE_INFINITY;
  function evaluationFunc(element, datasetIndex, index) {
    const inRange = element.inRange(position.x, position.y, useFinalPosition);
    if (intersect && !inRange) {
      return;
    }
    const center = element.getCenterPoint(useFinalPosition);
    const pointInArea = !!includeInvisible || chart.isPointInArea(center);
    if (!pointInArea && !inRange) {
      return;
    }
    const distance = distanceMetric(position, center);
    if (distance < minDistance) {
      items = [
        {
          element,
          datasetIndex,
          index
        }
      ];
      minDistance = distance;
    } else if (distance === minDistance) {
      items.push({
        element,
        datasetIndex,
        index
      });
    }
  }
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return [];
  }
  return axis === "r" && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
}
function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
  const items = [];
  const rangeMethod = axis === "x" ? "inXRange" : "inYRange";
  let intersectsItem = false;
  evaluateInteractionItems(chart, axis, position, (element, datasetIndex, index) => {
    if (element[rangeMethod] && element[rangeMethod](position[axis], useFinalPosition)) {
      items.push({
        element,
        datasetIndex,
        index
      });
      intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
    }
  });
  if (intersect && !intersectsItem) {
    return [];
  }
  return items;
}
var Interaction = {
  evaluateInteractionItems,
  modes: {
    index(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "x";
      const includeInvisible = options.includeInvisible || false;
      const items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      const elements = [];
      if (!items.length) {
        return [];
      }
      chart.getSortedVisibleDatasetMetas().forEach((meta) => {
        const index = items[0].index;
        const element = meta.data[index];
        if (element && !element.skip) {
          elements.push({
            element,
            datasetIndex: meta.index,
            index
          });
        }
      });
      return elements;
    },
    dataset(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      let items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      if (items.length > 0) {
        const datasetIndex = items[0].datasetIndex;
        const data = chart.getDatasetMeta(datasetIndex).data;
        items = [];
        for (let i = 0; i < data.length; ++i) {
          items.push({
            element: data[i],
            datasetIndex,
            index: i
          });
        }
      }
      return items;
    },
    point(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
    },
    nearest(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible);
    },
    x(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, "x", options.intersect, useFinalPosition);
    },
    y(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, "y", options.intersect, useFinalPosition);
    }
  }
};
var STATIC_POSITIONS = [
  "left",
  "top",
  "right",
  "bottom"
];
function filterByPosition(array, position) {
  return array.filter((v) => v.pos === position);
}
function filterDynamicPositionByAxis(array, axis) {
  return array.filter((v) => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
}
function sortByWeight(array, reverse) {
  return array.sort((a, b) => {
    const v0 = reverse ? b : a;
    const v1 = reverse ? a : b;
    return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
  });
}
function wrapBoxes(boxes) {
  const layoutBoxes = [];
  let i, ilen, box, pos, stack, stackWeight;
  for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
    box = boxes[i];
    ({ position: pos, options: { stack, stackWeight = 1 } } = box);
    layoutBoxes.push({
      index: i,
      box,
      pos,
      horizontal: box.isHorizontal(),
      weight: box.weight,
      stack: stack && pos + stack,
      stackWeight
    });
  }
  return layoutBoxes;
}
function buildStacks(layouts2) {
  const stacks = {};
  for (const wrap of layouts2) {
    const { stack, pos, stackWeight } = wrap;
    if (!stack || !STATIC_POSITIONS.includes(pos)) {
      continue;
    }
    const _stack = stacks[stack] || (stacks[stack] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    _stack.count++;
    _stack.weight += stackWeight;
  }
  return stacks;
}
function setLayoutDims(layouts2, params) {
  const stacks = buildStacks(layouts2);
  const { vBoxMaxWidth, hBoxMaxHeight } = params;
  let i, ilen, layout;
  for (i = 0, ilen = layouts2.length; i < ilen; ++i) {
    layout = layouts2[i];
    const { fullSize } = layout.box;
    const stack = stacks[layout.stack];
    const factor = stack && layout.stackWeight / stack.weight;
    if (layout.horizontal) {
      layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
      layout.height = hBoxMaxHeight;
    } else {
      layout.width = vBoxMaxWidth;
      layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
    }
  }
  return stacks;
}
function buildLayoutBoxes(boxes) {
  const layoutBoxes = wrapBoxes(boxes);
  const fullSize = sortByWeight(layoutBoxes.filter((wrap) => wrap.box.fullSize), true);
  const left = sortByWeight(filterByPosition(layoutBoxes, "left"), true);
  const right = sortByWeight(filterByPosition(layoutBoxes, "right"));
  const top = sortByWeight(filterByPosition(layoutBoxes, "top"), true);
  const bottom2 = sortByWeight(filterByPosition(layoutBoxes, "bottom"));
  const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, "x");
  const centerVertical = filterDynamicPositionByAxis(layoutBoxes, "y");
  return {
    fullSize,
    leftAndTop: left.concat(top),
    rightAndBottom: right.concat(centerVertical).concat(bottom2).concat(centerHorizontal),
    chartArea: filterByPosition(layoutBoxes, "chartArea"),
    vertical: left.concat(right).concat(centerVertical),
    horizontal: top.concat(bottom2).concat(centerHorizontal)
  };
}
function getCombinedMax(maxPadding, chartArea, a, b) {
  return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}
function updateMaxPadding(maxPadding, boxPadding) {
  maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
  maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
  maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
  maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
}
function updateDims(chartArea, params, layout, stacks) {
  const { pos, box } = layout;
  const maxPadding = chartArea.maxPadding;
  if (!isObject(pos)) {
    if (layout.size) {
      chartArea[pos] -= layout.size;
    }
    const stack = stacks[layout.stack] || {
      size: 0,
      count: 1
    };
    stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
    layout.size = stack.size / stack.count;
    chartArea[pos] += layout.size;
  }
  if (box.getPadding) {
    updateMaxPadding(maxPadding, box.getPadding());
  }
  const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, "left", "right"));
  const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, "top", "bottom"));
  const widthChanged = newWidth !== chartArea.w;
  const heightChanged = newHeight !== chartArea.h;
  chartArea.w = newWidth;
  chartArea.h = newHeight;
  return layout.horizontal ? {
    same: widthChanged,
    other: heightChanged
  } : {
    same: heightChanged,
    other: widthChanged
  };
}
function handleMaxPadding(chartArea) {
  const maxPadding = chartArea.maxPadding;
  function updatePos(pos) {
    const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
    chartArea[pos] += change;
    return change;
  }
  chartArea.y += updatePos("top");
  chartArea.x += updatePos("left");
  updatePos("right");
  updatePos("bottom");
}
function getMargins(horizontal, chartArea) {
  const maxPadding = chartArea.maxPadding;
  function marginForPositions(positions2) {
    const margin = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    positions2.forEach((pos) => {
      margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
    });
    return margin;
  }
  return horizontal ? marginForPositions([
    "left",
    "right"
  ]) : marginForPositions([
    "top",
    "bottom"
  ]);
}
function fitBoxes(boxes, chartArea, params, stacks) {
  const refitBoxes = [];
  let i, ilen, layout, box, refit, changed;
  for (i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i) {
    layout = boxes[i];
    box = layout.box;
    box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea));
    const { same, other } = updateDims(chartArea, params, layout, stacks);
    refit |= same && refitBoxes.length;
    changed = changed || other;
    if (!box.fullSize) {
      refitBoxes.push(layout);
    }
  }
  return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
}
function setBoxDims(box, left, top, width, height) {
  box.top = top;
  box.left = left;
  box.right = left + width;
  box.bottom = top + height;
  box.width = width;
  box.height = height;
}
function placeBoxes(boxes, chartArea, params, stacks) {
  const userPadding = params.padding;
  let { x, y } = chartArea;
  for (const layout of boxes) {
    const box = layout.box;
    const stack = stacks[layout.stack] || {
      count: 1,
      placed: 0,
      weight: 1
    };
    const weight = layout.stackWeight / stack.weight || 1;
    if (layout.horizontal) {
      const width = chartArea.w * weight;
      const height = stack.size || box.height;
      if (defined(stack.start)) {
        y = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height);
      } else {
        setBoxDims(box, chartArea.left + stack.placed, y, width, height);
      }
      stack.start = y;
      stack.placed += width;
      y = box.bottom;
    } else {
      const height = chartArea.h * weight;
      const width = stack.size || box.width;
      if (defined(stack.start)) {
        x = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, x, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
      } else {
        setBoxDims(box, x, chartArea.top + stack.placed, width, height);
      }
      stack.start = x;
      stack.placed += height;
      x = box.right;
    }
  }
  chartArea.x = x;
  chartArea.y = y;
}
var layouts = {
  addBox(chart, item) {
    if (!chart.boxes) {
      chart.boxes = [];
    }
    item.fullSize = item.fullSize || false;
    item.position = item.position || "top";
    item.weight = item.weight || 0;
    item._layers = item._layers || function() {
      return [
        {
          z: 0,
          draw(chartArea) {
            item.draw(chartArea);
          }
        }
      ];
    };
    chart.boxes.push(item);
  },
  removeBox(chart, layoutItem) {
    const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
    if (index !== -1) {
      chart.boxes.splice(index, 1);
    }
  },
  configure(chart, item, options) {
    item.fullSize = options.fullSize;
    item.position = options.position;
    item.weight = options.weight;
  },
  update(chart, width, height, minPadding) {
    if (!chart) {
      return;
    }
    const padding = toPadding(chart.options.layout.padding);
    const availableWidth = Math.max(width - padding.width, 0);
    const availableHeight = Math.max(height - padding.height, 0);
    const boxes = buildLayoutBoxes(chart.boxes);
    const verticalBoxes = boxes.vertical;
    const horizontalBoxes = boxes.horizontal;
    each(chart.boxes, (box) => {
      if (typeof box.beforeLayout === "function") {
        box.beforeLayout();
      }
    });
    const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) => wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
    const params = Object.freeze({
      outerWidth: width,
      outerHeight: height,
      padding,
      availableWidth,
      availableHeight,
      vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
      hBoxMaxHeight: availableHeight / 2
    });
    const maxPadding = Object.assign({}, padding);
    updateMaxPadding(maxPadding, toPadding(minPadding));
    const chartArea = Object.assign({
      maxPadding,
      w: availableWidth,
      h: availableHeight,
      x: padding.left,
      y: padding.top
    }, padding);
    const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
    fitBoxes(boxes.fullSize, chartArea, params, stacks);
    fitBoxes(verticalBoxes, chartArea, params, stacks);
    if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
      fitBoxes(verticalBoxes, chartArea, params, stacks);
    }
    handleMaxPadding(chartArea);
    placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
    chartArea.x += chartArea.w;
    chartArea.y += chartArea.h;
    placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
    chart.chartArea = {
      left: chartArea.left,
      top: chartArea.top,
      right: chartArea.left + chartArea.w,
      bottom: chartArea.top + chartArea.h,
      height: chartArea.h,
      width: chartArea.w
    };
    each(boxes.chartArea, (layout) => {
      const box = layout.box;
      Object.assign(box, chart.chartArea);
      box.update(chartArea.w, chartArea.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
var BasePlatform = class {
  acquireContext(canvas, aspectRatio) {
  }
  releaseContext(context) {
    return false;
  }
  addEventListener(chart, type, listener) {
  }
  removeEventListener(chart, type, listener) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(element, width, height, aspectRatio) {
    width = Math.max(0, width || element.width);
    height = height || element.height;
    return {
      width,
      height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
    };
  }
  isAttached(canvas) {
    return true;
  }
  updateConfig(config) {
  }
};
var BasicPlatform = class extends BasePlatform {
  acquireContext(item) {
    return item && item.getContext && item.getContext("2d") || null;
  }
  updateConfig(config) {
    config.options.animation = false;
  }
};
var EXPANDO_KEY = "$chartjs";
var EVENT_TYPES = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
};
var isNullOrEmpty = (value) => value === null || value === "";
function initCanvas(canvas, aspectRatio) {
  const style = canvas.style;
  const renderHeight = canvas.getAttribute("height");
  const renderWidth = canvas.getAttribute("width");
  canvas[EXPANDO_KEY] = {
    initial: {
      height: renderHeight,
      width: renderWidth,
      style: {
        display: style.display,
        height: style.height,
        width: style.width
      }
    }
  };
  style.display = style.display || "block";
  style.boxSizing = style.boxSizing || "border-box";
  if (isNullOrEmpty(renderWidth)) {
    const displayWidth = readUsedSize(canvas, "width");
    if (displayWidth !== void 0) {
      canvas.width = displayWidth;
    }
  }
  if (isNullOrEmpty(renderHeight)) {
    if (canvas.style.height === "") {
      canvas.height = canvas.width / (aspectRatio || 2);
    } else {
      const displayHeight = readUsedSize(canvas, "height");
      if (displayHeight !== void 0) {
        canvas.height = displayHeight;
      }
    }
  }
  return canvas;
}
var eventListenerOptions = supportsEventListenerOptions ? {
  passive: true
} : false;
function addListener(node, type, listener) {
  if (node) {
    node.addEventListener(type, listener, eventListenerOptions);
  }
}
function removeListener(chart, type, listener) {
  if (chart && chart.canvas) {
    chart.canvas.removeEventListener(type, listener, eventListenerOptions);
  }
}
function fromNativeEvent(event, chart) {
  const type = EVENT_TYPES[event.type] || event.type;
  const { x, y } = getRelativePosition(event, chart);
  return {
    type,
    chart,
    native: event,
    x: x !== void 0 ? x : null,
    y: y !== void 0 ? y : null
  };
}
function nodeListContains(nodeList, canvas) {
  for (const node of nodeList) {
    if (node === canvas || node.contains(canvas)) {
      return true;
    }
  }
}
function createAttachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.addedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
function createDetachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.removedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
var drpListeningCharts = /* @__PURE__ */ new Map();
var oldDevicePixelRatio = 0;
function onWindowResize() {
  const dpr = window.devicePixelRatio;
  if (dpr === oldDevicePixelRatio) {
    return;
  }
  oldDevicePixelRatio = dpr;
  drpListeningCharts.forEach((resize, chart) => {
    if (chart.currentDevicePixelRatio !== dpr) {
      resize();
    }
  });
}
function listenDevicePixelRatioChanges(chart, resize) {
  if (!drpListeningCharts.size) {
    window.addEventListener("resize", onWindowResize);
  }
  drpListeningCharts.set(chart, resize);
}
function unlistenDevicePixelRatioChanges(chart) {
  drpListeningCharts.delete(chart);
  if (!drpListeningCharts.size) {
    window.removeEventListener("resize", onWindowResize);
  }
}
function createResizeObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const container = canvas && _getParentNode(canvas);
  if (!container) {
    return;
  }
  const resize = throttled((width, height) => {
    const w = container.clientWidth;
    listener(width, height);
    if (w < container.clientWidth) {
      listener();
    }
  }, window);
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    if (width === 0 && height === 0) {
      return;
    }
    resize(width, height);
  });
  observer.observe(container);
  listenDevicePixelRatioChanges(chart, resize);
  return observer;
}
function releaseObserver(chart, type, observer) {
  if (observer) {
    observer.disconnect();
  }
  if (type === "resize") {
    unlistenDevicePixelRatioChanges(chart);
  }
}
function createProxyAndListen(chart, type, listener) {
  const canvas = chart.canvas;
  const proxy = throttled((event) => {
    if (chart.ctx !== null) {
      listener(fromNativeEvent(event, chart));
    }
  }, chart);
  addListener(canvas, type, proxy);
  return proxy;
}
var DomPlatform = class extends BasePlatform {
  acquireContext(canvas, aspectRatio) {
    const context = canvas && canvas.getContext && canvas.getContext("2d");
    if (context && context.canvas === canvas) {
      initCanvas(canvas, aspectRatio);
      return context;
    }
    return null;
  }
  releaseContext(context) {
    const canvas = context.canvas;
    if (!canvas[EXPANDO_KEY]) {
      return false;
    }
    const initial = canvas[EXPANDO_KEY].initial;
    [
      "height",
      "width"
    ].forEach((prop) => {
      const value = initial[prop];
      if (isNullOrUndef(value)) {
        canvas.removeAttribute(prop);
      } else {
        canvas.setAttribute(prop, value);
      }
    });
    const style = initial.style || {};
    Object.keys(style).forEach((key) => {
      canvas.style[key] = style[key];
    });
    canvas.width = canvas.width;
    delete canvas[EXPANDO_KEY];
    return true;
  }
  addEventListener(chart, type, listener) {
    this.removeEventListener(chart, type);
    const proxies = chart.$proxies || (chart.$proxies = {});
    const handlers = {
      attach: createAttachObserver,
      detach: createDetachObserver,
      resize: createResizeObserver
    };
    const handler = handlers[type] || createProxyAndListen;
    proxies[type] = handler(chart, type, listener);
  }
  removeEventListener(chart, type) {
    const proxies = chart.$proxies || (chart.$proxies = {});
    const proxy = proxies[type];
    if (!proxy) {
      return;
    }
    const handlers = {
      attach: releaseObserver,
      detach: releaseObserver,
      resize: releaseObserver
    };
    const handler = handlers[type] || removeListener;
    handler(chart, type, proxy);
    proxies[type] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(canvas, width, height, aspectRatio) {
    return getMaximumSize(canvas, width, height, aspectRatio);
  }
  isAttached(canvas) {
    const container = canvas && _getParentNode(canvas);
    return !!(container && container.isConnected);
  }
};
function _detectPlatform(canvas) {
  if (!_isDomSupported() || typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return BasicPlatform;
  }
  return DomPlatform;
}
var Element2 = class {
  static defaults = {};
  static defaultRoutes = void 0;
  x;
  y;
  active = false;
  options;
  $animations;
  tooltipPosition(useFinalPosition) {
    const { x, y } = this.getProps([
      "x",
      "y"
    ], useFinalPosition);
    return {
      x,
      y
    };
  }
  hasValue() {
    return isNumber(this.x) && isNumber(this.y);
  }
  getProps(props, final) {
    const anims = this.$animations;
    if (!final || !anims) {
      return this;
    }
    const ret = {};
    props.forEach((prop) => {
      ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
    });
    return ret;
  }
};
function autoSkip(scale, ticks) {
  const tickOpts = scale.options.ticks;
  const determinedMaxTicks = determineMaxTicks(scale);
  const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
  const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
  const numMajorIndices = majorIndices.length;
  const first = majorIndices[0];
  const last = majorIndices[numMajorIndices - 1];
  const newTicks = [];
  if (numMajorIndices > ticksLimit) {
    skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
    return newTicks;
  }
  const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
  if (numMajorIndices > 0) {
    let i, ilen;
    const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
    skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
    for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
      skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
    }
    skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
    return newTicks;
  }
  skip(ticks, newTicks, spacing);
  return newTicks;
}
function determineMaxTicks(scale) {
  const offset = scale.options.offset;
  const tickLength = scale._tickSize();
  const maxScale = scale._length / tickLength + (offset ? 0 : 1);
  const maxChart = scale._maxLength / tickLength;
  return Math.floor(Math.min(maxScale, maxChart));
}
function calculateSpacing(majorIndices, ticks, ticksLimit) {
  const evenMajorSpacing = getEvenSpacing(majorIndices);
  const spacing = ticks.length / ticksLimit;
  if (!evenMajorSpacing) {
    return Math.max(spacing, 1);
  }
  const factors = _factorize(evenMajorSpacing);
  for (let i = 0, ilen = factors.length - 1; i < ilen; i++) {
    const factor = factors[i];
    if (factor > spacing) {
      return factor;
    }
  }
  return Math.max(spacing, 1);
}
function getMajorIndices(ticks) {
  const result = [];
  let i, ilen;
  for (i = 0, ilen = ticks.length; i < ilen; i++) {
    if (ticks[i].major) {
      result.push(i);
    }
  }
  return result;
}
function skipMajors(ticks, newTicks, majorIndices, spacing) {
  let count = 0;
  let next = majorIndices[0];
  let i;
  spacing = Math.ceil(spacing);
  for (i = 0; i < ticks.length; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = majorIndices[count * spacing];
    }
  }
}
function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
  const start = valueOrDefault(majorStart, 0);
  const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
  let count = 0;
  let length, i, next;
  spacing = Math.ceil(spacing);
  if (majorEnd) {
    length = majorEnd - majorStart;
    spacing = length / Math.floor(length / spacing);
  }
  next = start;
  while (next < 0) {
    count++;
    next = Math.round(start + count * spacing);
  }
  for (i = Math.max(start, 0); i < end; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = Math.round(start + count * spacing);
    }
  }
}
function getEvenSpacing(arr) {
  const len = arr.length;
  let i, diff;
  if (len < 2) {
    return false;
  }
  for (diff = arr[0], i = 1; i < len; ++i) {
    if (arr[i] - arr[i - 1] !== diff) {
      return false;
    }
  }
  return diff;
}
var reverseAlign = (align) => align === "left" ? "right" : align === "right" ? "left" : align;
var offsetFromEdge = (scale, edge, offset) => edge === "top" || edge === "left" ? scale[edge] + offset : scale[edge] - offset;
var getTicksLimit = (ticksLength, maxTicksLimit) => Math.min(maxTicksLimit || ticksLength, ticksLength);
function sample(arr, numItems) {
  const result = [];
  const increment = arr.length / numItems;
  const len = arr.length;
  let i = 0;
  for (; i < len; i += increment) {
    result.push(arr[Math.floor(i)]);
  }
  return result;
}
function getPixelForGridLine(scale, index, offsetGridLines) {
  const length = scale.ticks.length;
  const validIndex2 = Math.min(index, length - 1);
  const start = scale._startPixel;
  const end = scale._endPixel;
  const epsilon = 1e-6;
  let lineValue = scale.getPixelForTick(validIndex2);
  let offset;
  if (offsetGridLines) {
    if (length === 1) {
      offset = Math.max(lineValue - start, end - lineValue);
    } else if (index === 0) {
      offset = (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      offset = (lineValue - scale.getPixelForTick(validIndex2 - 1)) / 2;
    }
    lineValue += validIndex2 < index ? offset : -offset;
    if (lineValue < start - epsilon || lineValue > end + epsilon) {
      return;
    }
  }
  return lineValue;
}
function garbageCollect(caches, length) {
  each(caches, (cache) => {
    const gc = cache.gc;
    const gcLen = gc.length / 2;
    let i;
    if (gcLen > length) {
      for (i = 0; i < gcLen; ++i) {
        delete cache.data[gc[i]];
      }
      gc.splice(0, gcLen);
    }
  });
}
function getTickMarkLength(options) {
  return options.drawTicks ? options.tickLength : 0;
}
function getTitleHeight(options, fallback) {
  if (!options.display) {
    return 0;
  }
  const font = toFont(options.font, fallback);
  const padding = toPadding(options.padding);
  const lines = isArray(options.text) ? options.text.length : 1;
  return lines * font.lineHeight + padding.height;
}
function createScaleContext(parent, scale) {
  return createContext(parent, {
    scale,
    type: "scale"
  });
}
function createTickContext(parent, index, tick) {
  return createContext(parent, {
    tick,
    index,
    type: "tick"
  });
}
function titleAlign(align, position, reverse) {
  let ret = _toLeftRightCenter(align);
  if (reverse && position !== "right" || !reverse && position === "right") {
    ret = reverseAlign(ret);
  }
  return ret;
}
function titleArgs(scale, offset, position, align) {
  const { top, left, bottom: bottom2, right, chart } = scale;
  const { chartArea, scales } = chart;
  let rotation = 0;
  let maxWidth, titleX, titleY;
  const height = bottom2 - top;
  const width = right - left;
  if (scale.isHorizontal()) {
    titleX = _alignStartEnd(align, left, right);
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleY = scales[positionAxisID].getPixelForValue(value) + height - offset;
    } else if (position === "center") {
      titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
    } else {
      titleY = offsetFromEdge(scale, position, offset);
    }
    maxWidth = right - left;
  } else {
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleX = scales[positionAxisID].getPixelForValue(value) - width + offset;
    } else if (position === "center") {
      titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
    }
    titleY = _alignStartEnd(align, bottom2, top);
    rotation = position === "left" ? -HALF_PI : HALF_PI;
  }
  return {
    titleX,
    titleY,
    maxWidth,
    rotation
  };
}
var Scale = class _Scale extends Element2 {
  constructor(cfg) {
    super();
    this.id = cfg.id;
    this.type = cfg.type;
    this.options = void 0;
    this.ctx = cfg.ctx;
    this.chart = cfg.chart;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.width = void 0;
    this.height = void 0;
    this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.maxWidth = void 0;
    this.maxHeight = void 0;
    this.paddingTop = void 0;
    this.paddingBottom = void 0;
    this.paddingLeft = void 0;
    this.paddingRight = void 0;
    this.axis = void 0;
    this.labelRotation = void 0;
    this.min = void 0;
    this.max = void 0;
    this._range = void 0;
    this.ticks = [];
    this._gridLineItems = null;
    this._labelItems = null;
    this._labelSizes = null;
    this._length = 0;
    this._maxLength = 0;
    this._longestTextCache = {};
    this._startPixel = void 0;
    this._endPixel = void 0;
    this._reversePixels = false;
    this._userMax = void 0;
    this._userMin = void 0;
    this._suggestedMax = void 0;
    this._suggestedMin = void 0;
    this._ticksLength = 0;
    this._borderValue = 0;
    this._cache = {};
    this._dataLimitsCached = false;
    this.$context = void 0;
  }
  init(options) {
    this.options = options.setContext(this.getContext());
    this.axis = options.axis;
    this._userMin = this.parse(options.min);
    this._userMax = this.parse(options.max);
    this._suggestedMin = this.parse(options.suggestedMin);
    this._suggestedMax = this.parse(options.suggestedMax);
  }
  parse(raw, index) {
    return raw;
  }
  getUserBounds() {
    let { _userMin, _userMax, _suggestedMin, _suggestedMax } = this;
    _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
    _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
    _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
    _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
    return {
      min: finiteOrDefault(_userMin, _suggestedMin),
      max: finiteOrDefault(_userMax, _suggestedMax),
      minDefined: isNumberFinite(_userMin),
      maxDefined: isNumberFinite(_userMax)
    };
  }
  getMinMax(canStack) {
    let { min, max, minDefined, maxDefined } = this.getUserBounds();
    let range;
    if (minDefined && maxDefined) {
      return {
        min,
        max
      };
    }
    const metas = this.getMatchingVisibleMetas();
    for (let i = 0, ilen = metas.length; i < ilen; ++i) {
      range = metas[i].controller.getMinMax(this, canStack);
      if (!minDefined) {
        min = Math.min(min, range.min);
      }
      if (!maxDefined) {
        max = Math.max(max, range.max);
      }
    }
    min = maxDefined && min > max ? max : min;
    max = minDefined && min > max ? min : max;
    return {
      min: finiteOrDefault(min, finiteOrDefault(max, min)),
      max: finiteOrDefault(max, finiteOrDefault(min, max))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const data = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
  }
  getLabelItems(chartArea = this.chart.chartArea) {
    const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
    return items;
  }
  beforeLayout() {
    this._cache = {};
    this._dataLimitsCached = false;
  }
  beforeUpdate() {
    callback(this.options.beforeUpdate, [
      this
    ]);
  }
  update(maxWidth, maxHeight, margins) {
    const { beginAtZero, grace, ticks: tickOpts } = this.options;
    const sampleSize = tickOpts.sampleSize;
    this.beforeUpdate();
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, margins);
    this.ticks = null;
    this._labelSizes = null;
    this._gridLineItems = null;
    this._labelItems = null;
    this.beforeSetDimensions();
    this.setDimensions();
    this.afterSetDimensions();
    this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
    if (!this._dataLimitsCached) {
      this.beforeDataLimits();
      this.determineDataLimits();
      this.afterDataLimits();
      this._range = _addGrace(this, grace, beginAtZero);
      this._dataLimitsCached = true;
    }
    this.beforeBuildTicks();
    this.ticks = this.buildTicks() || [];
    this.afterBuildTicks();
    const samplingEnabled = sampleSize < this.ticks.length;
    this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
    this.configure();
    this.beforeCalculateLabelRotation();
    this.calculateLabelRotation();
    this.afterCalculateLabelRotation();
    if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === "auto")) {
      this.ticks = autoSkip(this, this.ticks);
      this._labelSizes = null;
      this.afterAutoSkip();
    }
    if (samplingEnabled) {
      this._convertTicksToLabels(this.ticks);
    }
    this.beforeFit();
    this.fit();
    this.afterFit();
    this.afterUpdate();
  }
  configure() {
    let reversePixels = this.options.reverse;
    let startPixel, endPixel;
    if (this.isHorizontal()) {
      startPixel = this.left;
      endPixel = this.right;
    } else {
      startPixel = this.top;
      endPixel = this.bottom;
      reversePixels = !reversePixels;
    }
    this._startPixel = startPixel;
    this._endPixel = endPixel;
    this._reversePixels = reversePixels;
    this._length = endPixel - startPixel;
    this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    callback(this.options.afterUpdate, [
      this
    ]);
  }
  beforeSetDimensions() {
    callback(this.options.beforeSetDimensions, [
      this
    ]);
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = 0;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = 0;
      this.bottom = this.height;
    }
    this.paddingLeft = 0;
    this.paddingTop = 0;
    this.paddingRight = 0;
    this.paddingBottom = 0;
  }
  afterSetDimensions() {
    callback(this.options.afterSetDimensions, [
      this
    ]);
  }
  _callHooks(name) {
    this.chart.notifyPlugins(name, this.getContext());
    callback(this.options[name], [
      this
    ]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    callback(this.options.beforeTickToLabelConversion, [
      this
    ]);
  }
  generateTickLabels(ticks) {
    const tickOpts = this.options.ticks;
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      tick = ticks[i];
      tick.label = callback(tickOpts.callback, [
        tick.value,
        i,
        ticks
      ], this);
    }
  }
  afterTickToLabelConversion() {
    callback(this.options.afterTickToLabelConversion, [
      this
    ]);
  }
  beforeCalculateLabelRotation() {
    callback(this.options.beforeCalculateLabelRotation, [
      this
    ]);
  }
  calculateLabelRotation() {
    const options = this.options;
    const tickOpts = options.ticks;
    const numTicks = getTicksLimit(this.ticks.length, options.ticks.maxTicksLimit);
    const minRotation = tickOpts.minRotation || 0;
    const maxRotation = tickOpts.maxRotation;
    let labelRotation = minRotation;
    let tickWidth, maxHeight, maxLabelDiagonal;
    if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
      this.labelRotation = minRotation;
      return;
    }
    const labelSizes = this._getLabelSizes();
    const maxLabelWidth = labelSizes.widest.width;
    const maxLabelHeight = labelSizes.highest.height;
    const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
    tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
    if (maxLabelWidth + 6 > tickWidth) {
      tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
      maxHeight = this.maxHeight - getTickMarkLength(options.grid) - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
      maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
      labelRotation = toDegrees(Math.min(Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))));
      labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
    }
    this.labelRotation = labelRotation;
  }
  afterCalculateLabelRotation() {
    callback(this.options.afterCalculateLabelRotation, [
      this
    ]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    callback(this.options.beforeFit, [
      this
    ]);
  }
  fit() {
    const minSize = {
      width: 0,
      height: 0
    };
    const { chart, options: { ticks: tickOpts, title: titleOpts, grid: gridOpts } } = this;
    const display = this._isVisible();
    const isHorizontal = this.isHorizontal();
    if (display) {
      const titleHeight = getTitleHeight(titleOpts, chart.options.font);
      if (isHorizontal) {
        minSize.width = this.maxWidth;
        minSize.height = getTickMarkLength(gridOpts) + titleHeight;
      } else {
        minSize.height = this.maxHeight;
        minSize.width = getTickMarkLength(gridOpts) + titleHeight;
      }
      if (tickOpts.display && this.ticks.length) {
        const { first, last, widest, highest } = this._getLabelSizes();
        const tickPadding = tickOpts.padding * 2;
        const angleRadians = toRadians(this.labelRotation);
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        if (isHorizontal) {
          const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
          minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
        } else {
          const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
          minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
        }
        this._calculatePadding(first, last, sin, cos);
      }
    }
    this._handleMargins();
    if (isHorizontal) {
      this.width = this._length = chart.width - this._margins.left - this._margins.right;
      this.height = minSize.height;
    } else {
      this.width = minSize.width;
      this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
    }
  }
  _calculatePadding(first, last, sin, cos) {
    const { ticks: { align, padding }, position } = this.options;
    const isRotated = this.labelRotation !== 0;
    const labelsBelowTicks = position !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const offsetLeft = this.getPixelForTick(0) - this.left;
      const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
      let paddingLeft = 0;
      let paddingRight = 0;
      if (isRotated) {
        if (labelsBelowTicks) {
          paddingLeft = cos * first.width;
          paddingRight = sin * last.height;
        } else {
          paddingLeft = sin * first.height;
          paddingRight = cos * last.width;
        }
      } else if (align === "start") {
        paddingRight = last.width;
      } else if (align === "end") {
        paddingLeft = first.width;
      } else if (align !== "inner") {
        paddingLeft = first.width / 2;
        paddingRight = last.width / 2;
      }
      this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
      this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
    } else {
      let paddingTop = last.height / 2;
      let paddingBottom = first.height / 2;
      if (align === "start") {
        paddingTop = 0;
        paddingBottom = first.height;
      } else if (align === "end") {
        paddingTop = last.height;
        paddingBottom = 0;
      }
      this.paddingTop = paddingTop + padding;
      this.paddingBottom = paddingBottom + padding;
    }
  }
  _handleMargins() {
    if (this._margins) {
      this._margins.left = Math.max(this.paddingLeft, this._margins.left);
      this._margins.top = Math.max(this.paddingTop, this._margins.top);
      this._margins.right = Math.max(this.paddingRight, this._margins.right);
      this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
    }
  }
  afterFit() {
    callback(this.options.afterFit, [
      this
    ]);
  }
  isHorizontal() {
    const { axis, position } = this.options;
    return position === "top" || position === "bottom" || axis === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(ticks) {
    this.beforeTickToLabelConversion();
    this.generateTickLabels(ticks);
    let i, ilen;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      if (isNullOrUndef(ticks[i].label)) {
        ticks.splice(i, 1);
        ilen--;
        i--;
      }
    }
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let labelSizes = this._labelSizes;
    if (!labelSizes) {
      const sampleSize = this.options.ticks.sampleSize;
      let ticks = this.ticks;
      if (sampleSize < ticks.length) {
        ticks = sample(ticks, sampleSize);
      }
      this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length, this.options.ticks.maxTicksLimit);
    }
    return labelSizes;
  }
  _computeLabelSizes(ticks, length, maxTicksLimit) {
    const { ctx, _longestTextCache: caches } = this;
    const widths = [];
    const heights = [];
    const increment = Math.floor(length / getTicksLimit(length, maxTicksLimit));
    let widestLabelSize = 0;
    let highestLabelSize = 0;
    let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
    for (i = 0; i < length; i += increment) {
      label = ticks[i].label;
      tickFont = this._resolveTickFontOptions(i);
      ctx.font = fontString = tickFont.string;
      cache = caches[fontString] = caches[fontString] || {
        data: {},
        gc: []
      };
      lineHeight = tickFont.lineHeight;
      width = height = 0;
      if (!isNullOrUndef(label) && !isArray(label)) {
        width = _measureText(ctx, cache.data, cache.gc, width, label);
        height = lineHeight;
      } else if (isArray(label)) {
        for (j = 0, jlen = label.length; j < jlen; ++j) {
          nestedLabel = label[j];
          if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
            width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
            height += lineHeight;
          }
        }
      }
      widths.push(width);
      heights.push(height);
      widestLabelSize = Math.max(width, widestLabelSize);
      highestLabelSize = Math.max(height, highestLabelSize);
    }
    garbageCollect(caches, length);
    const widest = widths.indexOf(widestLabelSize);
    const highest = heights.indexOf(highestLabelSize);
    const valueAt = (idx) => ({
      width: widths[idx] || 0,
      height: heights[idx] || 0
    });
    return {
      first: valueAt(0),
      last: valueAt(length - 1),
      widest: valueAt(widest),
      highest: valueAt(highest),
      widths,
      heights
    };
  }
  getLabelForValue(value) {
    return value;
  }
  getPixelForValue(value, index) {
    return NaN;
  }
  getValueForPixel(pixel) {
  }
  getPixelForTick(index) {
    const ticks = this.ticks;
    if (index < 0 || index > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index].value);
  }
  getPixelForDecimal(decimal) {
    if (this._reversePixels) {
      decimal = 1 - decimal;
    }
    const pixel = this._startPixel + decimal * this._length;
    return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
  }
  getDecimalForPixel(pixel) {
    const decimal = (pixel - this._startPixel) / this._length;
    return this._reversePixels ? 1 - decimal : decimal;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min, max } = this;
    return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
  }
  getContext(index) {
    const ticks = this.ticks || [];
    if (index >= 0 && index < ticks.length) {
      const tick = ticks[index];
      return tick.$context || (tick.$context = createTickContext(this.getContext(), index, tick));
    }
    return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
  }
  _tickSize() {
    const optionTicks = this.options.ticks;
    const rot = toRadians(this.labelRotation);
    const cos = Math.abs(Math.cos(rot));
    const sin = Math.abs(Math.sin(rot));
    const labelSizes = this._getLabelSizes();
    const padding = optionTicks.autoSkipPadding || 0;
    const w = labelSizes ? labelSizes.widest.width + padding : 0;
    const h = labelSizes ? labelSizes.highest.height + padding : 0;
    return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin;
  }
  _isVisible() {
    const display = this.options.display;
    if (display !== "auto") {
      return !!display;
    }
    return this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(chartArea) {
    const axis = this.axis;
    const chart = this.chart;
    const options = this.options;
    const { grid, position, border } = options;
    const offset = grid.offset;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const ticksLength = ticks.length + (offset ? 1 : 0);
    const tl = getTickMarkLength(grid);
    const items = [];
    const borderOpts = border.setContext(this.getContext());
    const axisWidth = borderOpts.display ? borderOpts.width : 0;
    const axisHalfWidth = axisWidth / 2;
    const alignBorderValue = function(pixel) {
      return _alignPixel(chart, pixel, axisWidth);
    };
    let borderValue, i, lineValue, alignedLineValue;
    let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
    if (position === "top") {
      borderValue = alignBorderValue(this.bottom);
      ty1 = this.bottom - tl;
      ty2 = borderValue - axisHalfWidth;
      y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
      y2 = chartArea.bottom;
    } else if (position === "bottom") {
      borderValue = alignBorderValue(this.top);
      y1 = chartArea.top;
      y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
      ty1 = borderValue + axisHalfWidth;
      ty2 = this.top + tl;
    } else if (position === "left") {
      borderValue = alignBorderValue(this.right);
      tx1 = this.right - tl;
      tx2 = borderValue - axisHalfWidth;
      x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
      x2 = chartArea.right;
    } else if (position === "right") {
      borderValue = alignBorderValue(this.left);
      x1 = chartArea.left;
      x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
      tx1 = borderValue + axisHalfWidth;
      tx2 = this.left + tl;
    } else if (axis === "x") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      y1 = chartArea.top;
      y2 = chartArea.bottom;
      ty1 = borderValue + axisHalfWidth;
      ty2 = ty1 + tl;
    } else if (axis === "y") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      tx1 = borderValue - axisHalfWidth;
      tx2 = tx1 - tl;
      x1 = chartArea.left;
      x2 = chartArea.right;
    }
    const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength);
    const step = Math.max(1, Math.ceil(ticksLength / limit));
    for (i = 0; i < ticksLength; i += step) {
      const context = this.getContext(i);
      const optsAtIndex = grid.setContext(context);
      const optsAtIndexBorder = border.setContext(context);
      const lineWidth = optsAtIndex.lineWidth;
      const lineColor = optsAtIndex.color;
      const borderDash = optsAtIndexBorder.dash || [];
      const borderDashOffset = optsAtIndexBorder.dashOffset;
      const tickWidth = optsAtIndex.tickWidth;
      const tickColor = optsAtIndex.tickColor;
      const tickBorderDash = optsAtIndex.tickBorderDash || [];
      const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
      lineValue = getPixelForGridLine(this, i, offset);
      if (lineValue === void 0) {
        continue;
      }
      alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
      if (isHorizontal) {
        tx1 = tx2 = x1 = x2 = alignedLineValue;
      } else {
        ty1 = ty2 = y1 = y2 = alignedLineValue;
      }
      items.push({
        tx1,
        ty1,
        tx2,
        ty2,
        x1,
        y1,
        x2,
        y2,
        width: lineWidth,
        color: lineColor,
        borderDash,
        borderDashOffset,
        tickWidth,
        tickColor,
        tickBorderDash,
        tickBorderDashOffset
      });
    }
    this._ticksLength = ticksLength;
    this._borderValue = borderValue;
    return items;
  }
  _computeLabelItems(chartArea) {
    const axis = this.axis;
    const options = this.options;
    const { position, ticks: optionTicks } = options;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const { align, crossAlign, padding, mirror } = optionTicks;
    const tl = getTickMarkLength(options.grid);
    const tickAndPadding = tl + padding;
    const hTickAndPadding = mirror ? -padding : tickAndPadding;
    const rotation = -toRadians(this.labelRotation);
    const items = [];
    let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
    let textBaseline = "middle";
    if (position === "top") {
      y = this.bottom - hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "bottom") {
      y = this.top + hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "left") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (position === "right") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (axis === "x") {
      if (position === "center") {
        y = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
      }
      textAlign = this._getXAxisLabelAlignment();
    } else if (axis === "y") {
      if (position === "center") {
        x = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        x = this.chart.scales[positionAxisID].getPixelForValue(value);
      }
      textAlign = this._getYAxisLabelAlignment(tl).textAlign;
    }
    if (axis === "y") {
      if (align === "start") {
        textBaseline = "top";
      } else if (align === "end") {
        textBaseline = "bottom";
      }
    }
    const labelSizes = this._getLabelSizes();
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      label = tick.label;
      const optsAtIndex = optionTicks.setContext(this.getContext(i));
      pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
      font = this._resolveTickFontOptions(i);
      lineHeight = font.lineHeight;
      lineCount = isArray(label) ? label.length : 1;
      const halfCount = lineCount / 2;
      const color2 = optsAtIndex.color;
      const strokeColor = optsAtIndex.textStrokeColor;
      const strokeWidth = optsAtIndex.textStrokeWidth;
      let tickTextAlign = textAlign;
      if (isHorizontal) {
        x = pixel;
        if (textAlign === "inner") {
          if (i === ilen - 1) {
            tickTextAlign = !this.options.reverse ? "right" : "left";
          } else if (i === 0) {
            tickTextAlign = !this.options.reverse ? "left" : "right";
          } else {
            tickTextAlign = "center";
          }
        }
        if (position === "top") {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = -lineCount * lineHeight + lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
          } else {
            textOffset = -labelSizes.highest.height + lineHeight / 2;
          }
        } else {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
          } else {
            textOffset = labelSizes.highest.height - lineCount * lineHeight;
          }
        }
        if (mirror) {
          textOffset *= -1;
        }
        if (rotation !== 0 && !optsAtIndex.showLabelBackdrop) {
          x += lineHeight / 2 * Math.sin(rotation);
        }
      } else {
        y = pixel;
        textOffset = (1 - lineCount) * lineHeight / 2;
      }
      let backdrop;
      if (optsAtIndex.showLabelBackdrop) {
        const labelPadding = toPadding(optsAtIndex.backdropPadding);
        const height = labelSizes.heights[i];
        const width = labelSizes.widths[i];
        let top = textOffset - labelPadding.top;
        let left = 0 - labelPadding.left;
        switch (textBaseline) {
          case "middle":
            top -= height / 2;
            break;
          case "bottom":
            top -= height;
            break;
        }
        switch (textAlign) {
          case "center":
            left -= width / 2;
            break;
          case "right":
            left -= width;
            break;
          case "inner":
            if (i === ilen - 1) {
              left -= width;
            } else if (i > 0) {
              left -= width / 2;
            }
            break;
        }
        backdrop = {
          left,
          top,
          width: width + labelPadding.width,
          height: height + labelPadding.height,
          color: optsAtIndex.backdropColor
        };
      }
      items.push({
        label,
        font,
        textOffset,
        options: {
          rotation,
          color: color2,
          strokeColor,
          strokeWidth,
          textAlign: tickTextAlign,
          textBaseline,
          translation: [
            x,
            y
          ],
          backdrop
        }
      });
    }
    return items;
  }
  _getXAxisLabelAlignment() {
    const { position, ticks } = this.options;
    const rotation = -toRadians(this.labelRotation);
    if (rotation) {
      return position === "top" ? "left" : "right";
    }
    let align = "center";
    if (ticks.align === "start") {
      align = "left";
    } else if (ticks.align === "end") {
      align = "right";
    } else if (ticks.align === "inner") {
      align = "inner";
    }
    return align;
  }
  _getYAxisLabelAlignment(tl) {
    const { position, ticks: { crossAlign, mirror, padding } } = this.options;
    const labelSizes = this._getLabelSizes();
    const tickAndPadding = tl + padding;
    const widest = labelSizes.widest.width;
    let textAlign;
    let x;
    if (position === "left") {
      if (mirror) {
        x = this.right + padding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x += widest / 2;
        } else {
          textAlign = "right";
          x += widest;
        }
      } else {
        x = this.right - tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x -= widest / 2;
        } else {
          textAlign = "left";
          x = this.left;
        }
      }
    } else if (position === "right") {
      if (mirror) {
        x = this.left + padding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x -= widest / 2;
        } else {
          textAlign = "left";
          x -= widest;
        }
      } else {
        x = this.left + tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x += widest / 2;
        } else {
          textAlign = "right";
          x = this.right;
        }
      }
    } else {
      textAlign = "right";
    }
    return {
      textAlign,
      x
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) {
      return;
    }
    const chart = this.chart;
    const position = this.options.position;
    if (position === "left" || position === "right") {
      return {
        top: 0,
        left: this.left,
        bottom: chart.height,
        right: this.right
      };
    }
    if (position === "top" || position === "bottom") {
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: chart.width
      };
    }
  }
  drawBackground() {
    const { ctx, options: { backgroundColor }, left, top, width, height } = this;
    if (backgroundColor) {
      ctx.save();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(left, top, width, height);
      ctx.restore();
    }
  }
  getLineWidthForValue(value) {
    const grid = this.options.grid;
    if (!this._isVisible() || !grid.display) {
      return 0;
    }
    const ticks = this.ticks;
    const index = ticks.findIndex((t) => t.value === value);
    if (index >= 0) {
      const opts = grid.setContext(this.getContext(index));
      return opts.lineWidth;
    }
    return 0;
  }
  drawGrid(chartArea) {
    const grid = this.options.grid;
    const ctx = this.ctx;
    const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
    let i, ilen;
    const drawLine = (p1, p2, style) => {
      if (!style.width || !style.color) {
        return;
      }
      ctx.save();
      ctx.lineWidth = style.width;
      ctx.strokeStyle = style.color;
      ctx.setLineDash(style.borderDash || []);
      ctx.lineDashOffset = style.borderDashOffset;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    };
    if (grid.display) {
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        const item = items[i];
        if (grid.drawOnChartArea) {
          drawLine({
            x: item.x1,
            y: item.y1
          }, {
            x: item.x2,
            y: item.y2
          }, item);
        }
        if (grid.drawTicks) {
          drawLine({
            x: item.tx1,
            y: item.ty1
          }, {
            x: item.tx2,
            y: item.ty2
          }, {
            color: item.tickColor,
            width: item.tickWidth,
            borderDash: item.tickBorderDash,
            borderDashOffset: item.tickBorderDashOffset
          });
        }
      }
    }
  }
  drawBorder() {
    const { chart, ctx, options: { border, grid } } = this;
    const borderOpts = border.setContext(this.getContext());
    const axisWidth = border.display ? borderOpts.width : 0;
    if (!axisWidth) {
      return;
    }
    const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
    const borderValue = this._borderValue;
    let x1, x2, y1, y2;
    if (this.isHorizontal()) {
      x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2;
      x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2;
      y1 = y2 = borderValue;
    } else {
      y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2;
      y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
      x1 = x2 = borderValue;
    }
    ctx.save();
    ctx.lineWidth = borderOpts.width;
    ctx.strokeStyle = borderOpts.color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  drawLabels(chartArea) {
    const optionTicks = this.options.ticks;
    if (!optionTicks.display) {
      return;
    }
    const ctx = this.ctx;
    const area = this._computeLabelArea();
    if (area) {
      clipArea(ctx, area);
    }
    const items = this.getLabelItems(chartArea);
    for (const item of items) {
      const renderTextOptions = item.options;
      const tickFont = item.font;
      const label = item.label;
      const y = item.textOffset;
      renderText(ctx, label, 0, y, tickFont, renderTextOptions);
    }
    if (area) {
      unclipArea(ctx);
    }
  }
  drawTitle() {
    const { ctx, options: { position, title, reverse } } = this;
    if (!title.display) {
      return;
    }
    const font = toFont(title.font);
    const padding = toPadding(title.padding);
    const align = title.align;
    let offset = font.lineHeight / 2;
    if (position === "bottom" || position === "center" || isObject(position)) {
      offset += padding.bottom;
      if (isArray(title.text)) {
        offset += font.lineHeight * (title.text.length - 1);
      }
    } else {
      offset += padding.top;
    }
    const { titleX, titleY, maxWidth, rotation } = titleArgs(this, offset, position, align);
    renderText(ctx, title.text, 0, 0, font, {
      color: title.color,
      maxWidth,
      rotation,
      textAlign: titleAlign(align, position, reverse),
      textBaseline: "middle",
      translation: [
        titleX,
        titleY
      ]
    });
  }
  draw(chartArea) {
    if (!this._isVisible()) {
      return;
    }
    this.drawBackground();
    this.drawGrid(chartArea);
    this.drawBorder();
    this.drawTitle();
    this.drawLabels(chartArea);
  }
  _layers() {
    const opts = this.options;
    const tz = opts.ticks && opts.ticks.z || 0;
    const gz = valueOrDefault(opts.grid && opts.grid.z, -1);
    const bz = valueOrDefault(opts.border && opts.border.z, 0);
    if (!this._isVisible() || this.draw !== _Scale.prototype.draw) {
      return [
        {
          z: tz,
          draw: (chartArea) => {
            this.draw(chartArea);
          }
        }
      ];
    }
    return [
      {
        z: gz,
        draw: (chartArea) => {
          this.drawBackground();
          this.drawGrid(chartArea);
          this.drawTitle();
        }
      },
      {
        z: bz,
        draw: () => {
          this.drawBorder();
        }
      },
      {
        z: tz,
        draw: (chartArea) => {
          this.drawLabels(chartArea);
        }
      }
    ];
  }
  getMatchingVisibleMetas(type) {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    const axisID = this.axis + "AxisID";
    const result = [];
    let i, ilen;
    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      const meta = metas[i];
      if (meta[axisID] === this.id && (!type || meta.type === type)) {
        result.push(meta);
      }
    }
    return result;
  }
  _resolveTickFontOptions(index) {
    const opts = this.options.ticks.setContext(this.getContext(index));
    return toFont(opts.font);
  }
  _maxDigits() {
    const fontSize = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / fontSize;
  }
};
var TypedRegistry = class {
  constructor(type, scope, override) {
    this.type = type;
    this.scope = scope;
    this.override = override;
    this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(type) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
  }
  register(item) {
    const proto = Object.getPrototypeOf(item);
    let parentScope;
    if (isIChartComponent(proto)) {
      parentScope = this.register(proto);
    }
    const items = this.items;
    const id = item.id;
    const scope = this.scope + "." + id;
    if (!id) {
      throw new Error("class does not have id: " + item);
    }
    if (id in items) {
      return scope;
    }
    items[id] = item;
    registerDefaults(item, scope, parentScope);
    if (this.override) {
      defaults.override(item.id, item.overrides);
    }
    return scope;
  }
  get(id) {
    return this.items[id];
  }
  unregister(item) {
    const items = this.items;
    const id = item.id;
    const scope = this.scope;
    if (id in items) {
      delete items[id];
    }
    if (scope && id in defaults[scope]) {
      delete defaults[scope][id];
      if (this.override) {
        delete overrides[id];
      }
    }
  }
};
function registerDefaults(item, scope, parentScope) {
  const itemDefaults = merge(/* @__PURE__ */ Object.create(null), [
    parentScope ? defaults.get(parentScope) : {},
    defaults.get(scope),
    item.defaults
  ]);
  defaults.set(scope, itemDefaults);
  if (item.defaultRoutes) {
    routeDefaults(scope, item.defaultRoutes);
  }
  if (item.descriptors) {
    defaults.describe(scope, item.descriptors);
  }
}
function routeDefaults(scope, routes) {
  Object.keys(routes).forEach((property) => {
    const propertyParts = property.split(".");
    const sourceName = propertyParts.pop();
    const sourceScope = [
      scope
    ].concat(propertyParts).join(".");
    const parts = routes[property].split(".");
    const targetName = parts.pop();
    const targetScope = parts.join(".");
    defaults.route(sourceScope, sourceName, targetScope, targetName);
  });
}
function isIChartComponent(proto) {
  return "id" in proto && "defaults" in proto;
}
var Registry = class {
  constructor() {
    this.controllers = new TypedRegistry(DatasetController, "datasets", true);
    this.elements = new TypedRegistry(Element2, "elements");
    this.plugins = new TypedRegistry(Object, "plugins");
    this.scales = new TypedRegistry(Scale, "scales");
    this._typedRegistries = [
      this.controllers,
      this.scales,
      this.elements
    ];
  }
  add(...args) {
    this._each("register", args);
  }
  remove(...args) {
    this._each("unregister", args);
  }
  addControllers(...args) {
    this._each("register", args, this.controllers);
  }
  addElements(...args) {
    this._each("register", args, this.elements);
  }
  addPlugins(...args) {
    this._each("register", args, this.plugins);
  }
  addScales(...args) {
    this._each("register", args, this.scales);
  }
  getController(id) {
    return this._get(id, this.controllers, "controller");
  }
  getElement(id) {
    return this._get(id, this.elements, "element");
  }
  getPlugin(id) {
    return this._get(id, this.plugins, "plugin");
  }
  getScale(id) {
    return this._get(id, this.scales, "scale");
  }
  removeControllers(...args) {
    this._each("unregister", args, this.controllers);
  }
  removeElements(...args) {
    this._each("unregister", args, this.elements);
  }
  removePlugins(...args) {
    this._each("unregister", args, this.plugins);
  }
  removeScales(...args) {
    this._each("unregister", args, this.scales);
  }
  _each(method, args, typedRegistry) {
    [
      ...args
    ].forEach((arg) => {
      const reg = typedRegistry || this._getRegistryForType(arg);
      if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
        this._exec(method, reg, arg);
      } else {
        each(arg, (item) => {
          const itemReg = typedRegistry || this._getRegistryForType(item);
          this._exec(method, itemReg, item);
        });
      }
    });
  }
  _exec(method, registry2, component) {
    const camelMethod = _capitalize(method);
    callback(component["before" + camelMethod], [], component);
    registry2[method](component);
    callback(component["after" + camelMethod], [], component);
  }
  _getRegistryForType(type) {
    for (let i = 0; i < this._typedRegistries.length; i++) {
      const reg = this._typedRegistries[i];
      if (reg.isForType(type)) {
        return reg;
      }
    }
    return this.plugins;
  }
  _get(id, typedRegistry, type) {
    const item = typedRegistry.get(id);
    if (item === void 0) {
      throw new Error('"' + id + '" is not a registered ' + type + ".");
    }
    return item;
  }
};
var registry = /* @__PURE__ */ new Registry();
var PluginService = class {
  constructor() {
    this._init = void 0;
  }
  notify(chart, hook, args, filter) {
    if (hook === "beforeInit") {
      this._init = this._createDescriptors(chart, true);
      this._notify(this._init, chart, "install");
    }
    if (this._init === void 0) {
      return;
    }
    const descriptors2 = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
    const result = this._notify(descriptors2, chart, hook, args);
    if (hook === "afterDestroy") {
      this._notify(descriptors2, chart, "stop");
      this._notify(this._init, chart, "uninstall");
      this._init = void 0;
    }
    return result;
  }
  _notify(descriptors2, chart, hook, args) {
    args = args || {};
    for (const descriptor of descriptors2) {
      const plugin = descriptor.plugin;
      const method = plugin[hook];
      const params = [
        chart,
        args,
        descriptor.options
      ];
      if (callback(method, params, plugin) === false && args.cancelable) {
        return false;
      }
    }
    return true;
  }
  invalidate() {
    if (!isNullOrUndef(this._cache)) {
      this._oldCache = this._cache;
      this._cache = void 0;
    }
  }
  _descriptors(chart) {
    if (this._cache) {
      return this._cache;
    }
    const descriptors2 = this._cache = this._createDescriptors(chart);
    this._notifyStateChanges(chart);
    return descriptors2;
  }
  _createDescriptors(chart, all) {
    const config = chart && chart.config;
    const options = valueOrDefault(config.options && config.options.plugins, {});
    const plugins = allPlugins(config);
    return options === false && !all ? [] : createDescriptors(chart, plugins, options, all);
  }
  _notifyStateChanges(chart) {
    const previousDescriptors = this._oldCache || [];
    const descriptors2 = this._cache;
    const diff = (a, b) => a.filter((x) => !b.some((y) => x.plugin.id === y.plugin.id));
    this._notify(diff(previousDescriptors, descriptors2), chart, "stop");
    this._notify(diff(descriptors2, previousDescriptors), chart, "start");
  }
};
function allPlugins(config) {
  const localIds = {};
  const plugins = [];
  const keys = Object.keys(registry.plugins.items);
  for (let i = 0; i < keys.length; i++) {
    plugins.push(registry.getPlugin(keys[i]));
  }
  const local = config.plugins || [];
  for (let i = 0; i < local.length; i++) {
    const plugin = local[i];
    if (plugins.indexOf(plugin) === -1) {
      plugins.push(plugin);
      localIds[plugin.id] = true;
    }
  }
  return {
    plugins,
    localIds
  };
}
function getOpts(options, all) {
  if (!all && options === false) {
    return null;
  }
  if (options === true) {
    return {};
  }
  return options;
}
function createDescriptors(chart, { plugins, localIds }, options, all) {
  const result = [];
  const context = chart.getContext();
  for (const plugin of plugins) {
    const id = plugin.id;
    const opts = getOpts(options[id], all);
    if (opts === null) {
      continue;
    }
    result.push({
      plugin,
      options: pluginOpts(chart.config, {
        plugin,
        local: localIds[id]
      }, opts, context)
    });
  }
  return result;
}
function pluginOpts(config, { plugin, local }, opts, context) {
  const keys = config.pluginScopeKeys(plugin);
  const scopes = config.getOptionScopes(opts, keys);
  if (local && plugin.defaults) {
    scopes.push(plugin.defaults);
  }
  return config.createResolver(scopes, context, [
    ""
  ], {
    scriptable: false,
    indexable: false,
    allKeys: true
  });
}
function getIndexAxis(type, options) {
  const datasetDefaults = defaults.datasets[type] || {};
  const datasetOptions = (options.datasets || {})[type] || {};
  return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || "x";
}
function getAxisFromDefaultScaleID(id, indexAxis) {
  let axis = id;
  if (id === "_index_") {
    axis = indexAxis;
  } else if (id === "_value_") {
    axis = indexAxis === "x" ? "y" : "x";
  }
  return axis;
}
function getDefaultScaleIDFromAxis(axis, indexAxis) {
  return axis === indexAxis ? "_index_" : "_value_";
}
function idMatchesAxis(id) {
  if (id === "x" || id === "y" || id === "r") {
    return id;
  }
}
function axisFromPosition(position) {
  if (position === "top" || position === "bottom") {
    return "x";
  }
  if (position === "left" || position === "right") {
    return "y";
  }
}
function determineAxis(id, ...scaleOptions) {
  if (idMatchesAxis(id)) {
    return id;
  }
  for (const opts of scaleOptions) {
    const axis = opts.axis || axisFromPosition(opts.position) || id.length > 1 && idMatchesAxis(id[0].toLowerCase());
    if (axis) {
      return axis;
    }
  }
  throw new Error(`Cannot determine type of '${id}' axis. Please provide 'axis' or 'position' option.`);
}
function getAxisFromDataset(id, axis, dataset) {
  if (dataset[axis + "AxisID"] === id) {
    return {
      axis
    };
  }
}
function retrieveAxisFromDatasets(id, config) {
  if (config.data && config.data.datasets) {
    const boundDs = config.data.datasets.filter((d) => d.xAxisID === id || d.yAxisID === id);
    if (boundDs.length) {
      return getAxisFromDataset(id, "x", boundDs[0]) || getAxisFromDataset(id, "y", boundDs[0]);
    }
  }
  return {};
}
function mergeScaleConfig(config, options) {
  const chartDefaults = overrides[config.type] || {
    scales: {}
  };
  const configScales = options.scales || {};
  const chartIndexAxis = getIndexAxis(config.type, options);
  const scales = /* @__PURE__ */ Object.create(null);
  Object.keys(configScales).forEach((id) => {
    const scaleConf = configScales[id];
    if (!isObject(scaleConf)) {
      return console.error(`Invalid scale configuration for scale: ${id}`);
    }
    if (scaleConf._proxy) {
      return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
    }
    const axis = determineAxis(id, scaleConf, retrieveAxisFromDatasets(id, config), defaults.scales[scaleConf.type]);
    const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
    const defaultScaleOptions = chartDefaults.scales || {};
    scales[id] = mergeIf(/* @__PURE__ */ Object.create(null), [
      {
        axis
      },
      scaleConf,
      defaultScaleOptions[axis],
      defaultScaleOptions[defaultId]
    ]);
  });
  config.data.datasets.forEach((dataset) => {
    const type = dataset.type || config.type;
    const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
    const datasetDefaults = overrides[type] || {};
    const defaultScaleOptions = datasetDefaults.scales || {};
    Object.keys(defaultScaleOptions).forEach((defaultID) => {
      const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
      const id = dataset[axis + "AxisID"] || axis;
      scales[id] = scales[id] || /* @__PURE__ */ Object.create(null);
      mergeIf(scales[id], [
        {
          axis
        },
        configScales[id],
        defaultScaleOptions[defaultID]
      ]);
    });
  });
  Object.keys(scales).forEach((key) => {
    const scale = scales[key];
    mergeIf(scale, [
      defaults.scales[scale.type],
      defaults.scale
    ]);
  });
  return scales;
}
function initOptions(config) {
  const options = config.options || (config.options = {});
  options.plugins = valueOrDefault(options.plugins, {});
  options.scales = mergeScaleConfig(config, options);
}
function initData(data) {
  data = data || {};
  data.datasets = data.datasets || [];
  data.labels = data.labels || [];
  return data;
}
function initConfig(config) {
  config = config || {};
  config.data = initData(config.data);
  initOptions(config);
  return config;
}
var keyCache = /* @__PURE__ */ new Map();
var keysCached = /* @__PURE__ */ new Set();
function cachedKeys(cacheKey, generate) {
  let keys = keyCache.get(cacheKey);
  if (!keys) {
    keys = generate();
    keyCache.set(cacheKey, keys);
    keysCached.add(keys);
  }
  return keys;
}
var addIfFound = (set2, obj, key) => {
  const opts = resolveObjectKey(obj, key);
  if (opts !== void 0) {
    set2.add(opts);
  }
};
var Config = class {
  constructor(config) {
    this._config = initConfig(config);
    this._scopeCache = /* @__PURE__ */ new Map();
    this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(type) {
    this._config.type = type;
  }
  get data() {
    return this._config.data;
  }
  set data(data) {
    this._config.data = initData(data);
  }
  get options() {
    return this._config.options;
  }
  set options(options) {
    this._config.options = options;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const config = this._config;
    this.clearCache();
    initOptions(config);
  }
  clearCache() {
    this._scopeCache.clear();
    this._resolverCache.clear();
  }
  datasetScopeKeys(datasetType) {
    return cachedKeys(datasetType, () => [
      [
        `datasets.${datasetType}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(datasetType, transition) {
    return cachedKeys(`${datasetType}.transition.${transition}`, () => [
      [
        `datasets.${datasetType}.transitions.${transition}`,
        `transitions.${transition}`
      ],
      [
        `datasets.${datasetType}`,
        ""
      ]
    ]);
  }
  datasetElementScopeKeys(datasetType, elementType) {
    return cachedKeys(`${datasetType}-${elementType}`, () => [
      [
        `datasets.${datasetType}.elements.${elementType}`,
        `datasets.${datasetType}`,
        `elements.${elementType}`,
        ""
      ]
    ]);
  }
  pluginScopeKeys(plugin) {
    const id = plugin.id;
    const type = this.type;
    return cachedKeys(`${type}-plugin-${id}`, () => [
      [
        `plugins.${id}`,
        ...plugin.additionalOptionScopes || []
      ]
    ]);
  }
  _cachedScopes(mainScope, resetCache) {
    const _scopeCache = this._scopeCache;
    let cache = _scopeCache.get(mainScope);
    if (!cache || resetCache) {
      cache = /* @__PURE__ */ new Map();
      _scopeCache.set(mainScope, cache);
    }
    return cache;
  }
  getOptionScopes(mainScope, keyLists, resetCache) {
    const { options, type } = this;
    const cache = this._cachedScopes(mainScope, resetCache);
    const cached = cache.get(keyLists);
    if (cached) {
      return cached;
    }
    const scopes = /* @__PURE__ */ new Set();
    keyLists.forEach((keys) => {
      if (mainScope) {
        scopes.add(mainScope);
        keys.forEach((key) => addIfFound(scopes, mainScope, key));
      }
      keys.forEach((key) => addIfFound(scopes, options, key));
      keys.forEach((key) => addIfFound(scopes, overrides[type] || {}, key));
      keys.forEach((key) => addIfFound(scopes, defaults, key));
      keys.forEach((key) => addIfFound(scopes, descriptors, key));
    });
    const array = Array.from(scopes);
    if (array.length === 0) {
      array.push(/* @__PURE__ */ Object.create(null));
    }
    if (keysCached.has(keyLists)) {
      cache.set(keyLists, array);
    }
    return array;
  }
  chartOptionScopes() {
    const { options, type } = this;
    return [
      options,
      overrides[type] || {},
      defaults.datasets[type] || {},
      {
        type
      },
      defaults,
      descriptors
    ];
  }
  resolveNamedOptions(scopes, names2, context, prefixes2 = [
    ""
  ]) {
    const result = {
      $shared: true
    };
    const { resolver, subPrefixes } = getResolver(this._resolverCache, scopes, prefixes2);
    let options = resolver;
    if (needContext(resolver, names2)) {
      result.$shared = false;
      context = isFunction(context) ? context() : context;
      const subResolver = this.createResolver(scopes, context, subPrefixes);
      options = _attachContext(resolver, context, subResolver);
    }
    for (const prop of names2) {
      result[prop] = options[prop];
    }
    return result;
  }
  createResolver(scopes, context, prefixes2 = [
    ""
  ], descriptorDefaults) {
    const { resolver } = getResolver(this._resolverCache, scopes, prefixes2);
    return isObject(context) ? _attachContext(resolver, context, void 0, descriptorDefaults) : resolver;
  }
};
function getResolver(resolverCache, scopes, prefixes2) {
  let cache = resolverCache.get(scopes);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    resolverCache.set(scopes, cache);
  }
  const cacheKey = prefixes2.join();
  let cached = cache.get(cacheKey);
  if (!cached) {
    const resolver = _createResolver(scopes, prefixes2);
    cached = {
      resolver,
      subPrefixes: prefixes2.filter((p) => !p.toLowerCase().includes("hover"))
    };
    cache.set(cacheKey, cached);
  }
  return cached;
}
var hasFunction = (value) => isObject(value) && Object.getOwnPropertyNames(value).some((key) => isFunction(value[key]));
function needContext(proxy, names2) {
  const { isScriptable, isIndexable } = _descriptors(proxy);
  for (const prop of names2) {
    const scriptable = isScriptable(prop);
    const indexable = isIndexable(prop);
    const value = (indexable || scriptable) && proxy[prop];
    if (scriptable && (isFunction(value) || hasFunction(value)) || indexable && isArray(value)) {
      return true;
    }
  }
  return false;
}
var version = "4.5.1";
var KNOWN_POSITIONS = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function positionIsHorizontal(position, axis) {
  return position === "top" || position === "bottom" || KNOWN_POSITIONS.indexOf(position) === -1 && axis === "x";
}
function compare2Level(l1, l2) {
  return function(a, b) {
    return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1];
  };
}
function onAnimationsComplete(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;
  chart.notifyPlugins("afterRender");
  callback(animationOptions && animationOptions.onComplete, [
    context
  ], chart);
}
function onAnimationProgress(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;
  callback(animationOptions && animationOptions.onProgress, [
    context
  ], chart);
}
function getCanvas(item) {
  if (_isDomSupported() && typeof item === "string") {
    item = document.getElementById(item);
  } else if (item && item.length) {
    item = item[0];
  }
  if (item && item.canvas) {
    item = item.canvas;
  }
  return item;
}
var instances = {};
var getChart = (key) => {
  const canvas = getCanvas(key);
  return Object.values(instances).filter((c) => c.canvas === canvas).pop();
};
function moveNumericKeys(obj, start, move) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const intKey = +key;
    if (intKey >= start) {
      const value = obj[key];
      delete obj[key];
      if (move > 0 || intKey > start) {
        obj[intKey + move] = value;
      }
    }
  }
}
function determineLastEvent(e, lastEvent, inChartArea, isClick) {
  if (!inChartArea || e.type === "mouseout") {
    return null;
  }
  if (isClick) {
    return lastEvent;
  }
  return e;
}
var Chart = class {
  static defaults = defaults;
  static instances = instances;
  static overrides = overrides;
  static registry = registry;
  static version = version;
  static getChart = getChart;
  static register(...items) {
    registry.add(...items);
    invalidatePlugins();
  }
  static unregister(...items) {
    registry.remove(...items);
    invalidatePlugins();
  }
  constructor(item, userConfig) {
    const config = this.config = new Config(userConfig);
    const initialCanvas = getCanvas(item);
    const existingChart = getChart(initialCanvas);
    if (existingChart) {
      throw new Error("Canvas is already in use. Chart with ID '" + existingChart.id + "' must be destroyed before the canvas with ID '" + existingChart.canvas.id + "' can be reused.");
    }
    const options = config.createResolver(config.chartOptionScopes(), this.getContext());
    this.platform = new (config.platform || _detectPlatform(initialCanvas))();
    this.platform.updateConfig(config);
    const context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
    const canvas = context && context.canvas;
    const height = canvas && canvas.height;
    const width = canvas && canvas.width;
    this.id = uid();
    this.ctx = context;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this._options = options;
    this._aspectRatio = this.aspectRatio;
    this._layers = [];
    this._metasets = [];
    this._stacks = void 0;
    this.boxes = [];
    this.currentDevicePixelRatio = void 0;
    this.chartArea = void 0;
    this._active = [];
    this._lastEvent = void 0;
    this._listeners = {};
    this._responsiveListeners = void 0;
    this._sortedMetasets = [];
    this.scales = {};
    this._plugins = new PluginService();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = void 0;
    this.$context = void 0;
    this._doResize = debounce((mode) => this.update(mode), options.resizeDelay || 0);
    this._dataChanges = [];
    instances[this.id] = this;
    if (!context || !canvas) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    animator.listen(this, "complete", onAnimationsComplete);
    animator.listen(this, "progress", onAnimationProgress);
    this._initialize();
    if (this.attached) {
      this.update();
    }
  }
  get aspectRatio() {
    const { options: { aspectRatio, maintainAspectRatio }, width, height, _aspectRatio } = this;
    if (!isNullOrUndef(aspectRatio)) {
      return aspectRatio;
    }
    if (maintainAspectRatio && _aspectRatio) {
      return _aspectRatio;
    }
    return height ? width / height : null;
  }
  get data() {
    return this.config.data;
  }
  set data(data) {
    this.config.data = data;
  }
  get options() {
    return this._options;
  }
  set options(options) {
    this.config.options = options;
  }
  get registry() {
    return registry;
  }
  _initialize() {
    this.notifyPlugins("beforeInit");
    if (this.options.responsive) {
      this.resize();
    } else {
      retinaScale(this, this.options.devicePixelRatio);
    }
    this.bindEvents();
    this.notifyPlugins("afterInit");
    return this;
  }
  clear() {
    clearCanvas(this.canvas, this.ctx);
    return this;
  }
  stop() {
    animator.stop(this);
    return this;
  }
  resize(width, height) {
    if (!animator.running(this)) {
      this._resize(width, height);
    } else {
      this._resizeBeforeDraw = {
        width,
        height
      };
    }
  }
  _resize(width, height) {
    const options = this.options;
    const canvas = this.canvas;
    const aspectRatio = options.maintainAspectRatio && this.aspectRatio;
    const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
    const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
    const mode = this.width ? "resize" : "attach";
    this.width = newSize.width;
    this.height = newSize.height;
    this._aspectRatio = this.aspectRatio;
    if (!retinaScale(this, newRatio, true)) {
      return;
    }
    this.notifyPlugins("resize", {
      size: newSize
    });
    callback(options.onResize, [
      this,
      newSize
    ], this);
    if (this.attached) {
      if (this._doResize(mode)) {
        this.render();
      }
    }
  }
  ensureScalesHaveIDs() {
    const options = this.options;
    const scalesOptions = options.scales || {};
    each(scalesOptions, (axisOptions, axisID) => {
      axisOptions.id = axisID;
    });
  }
  buildOrUpdateScales() {
    const options = this.options;
    const scaleOpts = options.scales;
    const scales = this.scales;
    const updated = Object.keys(scales).reduce((obj, id) => {
      obj[id] = false;
      return obj;
    }, {});
    let items = [];
    if (scaleOpts) {
      items = items.concat(Object.keys(scaleOpts).map((id) => {
        const scaleOptions = scaleOpts[id];
        const axis = determineAxis(id, scaleOptions);
        const isRadial = axis === "r";
        const isHorizontal = axis === "x";
        return {
          options: scaleOptions,
          dposition: isRadial ? "chartArea" : isHorizontal ? "bottom" : "left",
          dtype: isRadial ? "radialLinear" : isHorizontal ? "category" : "linear"
        };
      }));
    }
    each(items, (item) => {
      const scaleOptions = item.options;
      const id = scaleOptions.id;
      const axis = determineAxis(id, scaleOptions);
      const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
      if (scaleOptions.position === void 0 || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
        scaleOptions.position = item.dposition;
      }
      updated[id] = true;
      let scale = null;
      if (id in scales && scales[id].type === scaleType) {
        scale = scales[id];
      } else {
        const scaleClass = registry.getScale(scaleType);
        scale = new scaleClass({
          id,
          type: scaleType,
          ctx: this.ctx,
          chart: this
        });
        scales[scale.id] = scale;
      }
      scale.init(scaleOptions, options);
    });
    each(updated, (hasUpdated, id) => {
      if (!hasUpdated) {
        delete scales[id];
      }
    });
    each(scales, (scale) => {
      layouts.configure(this, scale, scale.options);
      layouts.addBox(this, scale);
    });
  }
  _updateMetasets() {
    const metasets = this._metasets;
    const numData = this.data.datasets.length;
    const numMeta = metasets.length;
    metasets.sort((a, b) => a.index - b.index);
    if (numMeta > numData) {
      for (let i = numData; i < numMeta; ++i) {
        this._destroyDatasetMeta(i);
      }
      metasets.splice(numData, numMeta - numData);
    }
    this._sortedMetasets = metasets.slice(0).sort(compare2Level("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: metasets, data: { datasets } } = this;
    if (metasets.length > datasets.length) {
      delete this._stacks;
    }
    metasets.forEach((meta, index) => {
      if (datasets.filter((x) => x === meta._dataset).length === 0) {
        this._destroyDatasetMeta(index);
      }
    });
  }
  buildOrUpdateControllers() {
    const newControllers = [];
    const datasets = this.data.datasets;
    let i, ilen;
    this._removeUnreferencedMetasets();
    for (i = 0, ilen = datasets.length; i < ilen; i++) {
      const dataset = datasets[i];
      let meta = this.getDatasetMeta(i);
      const type = dataset.type || this.config.type;
      if (meta.type && meta.type !== type) {
        this._destroyDatasetMeta(i);
        meta = this.getDatasetMeta(i);
      }
      meta.type = type;
      meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
      meta.order = dataset.order || 0;
      meta.index = i;
      meta.label = "" + dataset.label;
      meta.visible = this.isDatasetVisible(i);
      if (meta.controller) {
        meta.controller.updateIndex(i);
        meta.controller.linkScales();
      } else {
        const ControllerClass = registry.getController(type);
        const { datasetElementType, dataElementType } = defaults.datasets[type];
        Object.assign(ControllerClass, {
          dataElementType: registry.getElement(dataElementType),
          datasetElementType: datasetElementType && registry.getElement(datasetElementType)
        });
        meta.controller = new ControllerClass(this, i);
        newControllers.push(meta.controller);
      }
    }
    this._updateMetasets();
    return newControllers;
  }
  _resetElements() {
    each(this.data.datasets, (dataset, datasetIndex) => {
      this.getDatasetMeta(datasetIndex).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements();
    this.notifyPlugins("reset");
  }
  update(mode) {
    const config = this.config;
    config.update();
    const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
    const animsDisabled = this._animationsDisabled = !options.animation;
    this._updateScales();
    this._checkEventBindings();
    this._updateHiddenIndices();
    this._plugins.invalidate();
    if (this.notifyPlugins("beforeUpdate", {
      mode,
      cancelable: true
    }) === false) {
      return;
    }
    const newControllers = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let minPadding = 0;
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; i++) {
      const { controller } = this.getDatasetMeta(i);
      const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
      controller.buildOrUpdateElements(reset);
      minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
    }
    minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
    this._updateLayout(minPadding);
    if (!animsDisabled) {
      each(newControllers, (controller) => {
        controller.reset();
      });
    }
    this._updateDatasets(mode);
    this.notifyPlugins("afterUpdate", {
      mode
    });
    this._layers.sort(compare2Level("z", "_idx"));
    const { _active, _lastEvent } = this;
    if (_lastEvent) {
      this._eventHandler(_lastEvent, true);
    } else if (_active.length) {
      this._updateHoverStyles(_active, _active, true);
    }
    this.render();
  }
  _updateScales() {
    each(this.scales, (scale) => {
      layouts.removeBox(this, scale);
    });
    this.ensureScalesHaveIDs();
    this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const options = this.options;
    const existingEvents = new Set(Object.keys(this._listeners));
    const newEvents = new Set(options.events);
    if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
      this.unbindEvents();
      this.bindEvents();
    }
  }
  _updateHiddenIndices() {
    const { _hiddenIndices } = this;
    const changes = this._getUniformDataChanges() || [];
    for (const { method, start, count } of changes) {
      const move = method === "_removeElements" ? -count : count;
      moveNumericKeys(_hiddenIndices, start, move);
    }
  }
  _getUniformDataChanges() {
    const _dataChanges = this._dataChanges;
    if (!_dataChanges || !_dataChanges.length) {
      return;
    }
    this._dataChanges = [];
    const datasetCount = this.data.datasets.length;
    const makeSet = (idx) => new Set(_dataChanges.filter((c) => c[0] === idx).map((c, i) => i + "," + c.splice(1).join(",")));
    const changeSet = makeSet(0);
    for (let i = 1; i < datasetCount; i++) {
      if (!setsEqual(changeSet, makeSet(i))) {
        return;
      }
    }
    return Array.from(changeSet).map((c) => c.split(",")).map((a) => ({
      method: a[1],
      start: +a[2],
      count: +a[3]
    }));
  }
  _updateLayout(minPadding) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: true
    }) === false) {
      return;
    }
    layouts.update(this, this.width, this.height, minPadding);
    const area = this.chartArea;
    const noArea = area.width <= 0 || area.height <= 0;
    this._layers = [];
    each(this.boxes, (box) => {
      if (noArea && box.position === "chartArea") {
        return;
      }
      if (box.configure) {
        box.configure();
      }
      this._layers.push(...box._layers());
    }, this);
    this._layers.forEach((item, index) => {
      item._idx = index;
    });
    this.notifyPlugins("afterLayout");
  }
  _updateDatasets(mode) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode,
      cancelable: true
    }) === false) {
      return;
    }
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this.getDatasetMeta(i).controller.configure();
    }
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._updateDataset(i, isFunction(mode) ? mode({
        datasetIndex: i
      }) : mode);
    }
    this.notifyPlugins("afterDatasetsUpdate", {
      mode
    });
  }
  _updateDataset(index, mode) {
    const meta = this.getDatasetMeta(index);
    const args = {
      meta,
      index,
      mode,
      cancelable: true
    };
    if (this.notifyPlugins("beforeDatasetUpdate", args) === false) {
      return;
    }
    meta.controller._update(mode);
    args.cancelable = false;
    this.notifyPlugins("afterDatasetUpdate", args);
  }
  render() {
    if (this.notifyPlugins("beforeRender", {
      cancelable: true
    }) === false) {
      return;
    }
    if (animator.has(this)) {
      if (this.attached && !animator.running(this)) {
        animator.start(this);
      }
    } else {
      this.draw();
      onAnimationsComplete({
        chart: this
      });
    }
  }
  draw() {
    let i;
    if (this._resizeBeforeDraw) {
      const { width, height } = this._resizeBeforeDraw;
      this._resizeBeforeDraw = null;
      this._resize(width, height);
    }
    this.clear();
    if (this.width <= 0 || this.height <= 0) {
      return;
    }
    if (this.notifyPlugins("beforeDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const layers = this._layers;
    for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
      layers[i].draw(this.chartArea);
    }
    this._drawDatasets();
    for (; i < layers.length; ++i) {
      layers[i].draw(this.chartArea);
    }
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(filterVisible) {
    const metasets = this._sortedMetasets;
    const result = [];
    let i, ilen;
    for (i = 0, ilen = metasets.length; i < ilen; ++i) {
      const meta = metasets[i];
      if (!filterVisible || meta.visible) {
        result.push(meta);
      }
    }
    return result;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(true);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const metasets = this.getSortedVisibleDatasetMetas();
    for (let i = metasets.length - 1; i >= 0; --i) {
      this._drawDataset(metasets[i]);
    }
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(meta) {
    const ctx = this.ctx;
    const args = {
      meta,
      index: meta.index,
      cancelable: true
    };
    const clip = getDatasetClipArea(this, meta);
    if (this.notifyPlugins("beforeDatasetDraw", args) === false) {
      return;
    }
    if (clip) {
      clipArea(ctx, clip);
    }
    meta.controller.draw();
    if (clip) {
      unclipArea(ctx);
    }
    args.cancelable = false;
    this.notifyPlugins("afterDatasetDraw", args);
  }
  isPointInArea(point) {
    return _isPointInArea(point, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(e, mode, options, useFinalPosition) {
    const method = Interaction.modes[mode];
    if (typeof method === "function") {
      return method(this, e, options, useFinalPosition);
    }
    return [];
  }
  getDatasetMeta(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    const metasets = this._metasets;
    let meta = metasets.filter((x) => x && x._dataset === dataset).pop();
    if (!meta) {
      meta = {
        type: null,
        data: [],
        dataset: null,
        controller: null,
        hidden: null,
        xAxisID: null,
        yAxisID: null,
        order: dataset && dataset.order || 0,
        index: datasetIndex,
        _dataset: dataset,
        _parsed: [],
        _sorted: false
      };
      metasets.push(meta);
    }
    return meta;
  }
  getContext() {
    return this.$context || (this.$context = createContext(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    if (!dataset) {
      return false;
    }
    const meta = this.getDatasetMeta(datasetIndex);
    return typeof meta.hidden === "boolean" ? !meta.hidden : !dataset.hidden;
  }
  setDatasetVisibility(datasetIndex, visible) {
    const meta = this.getDatasetMeta(datasetIndex);
    meta.hidden = !visible;
  }
  toggleDataVisibility(index) {
    this._hiddenIndices[index] = !this._hiddenIndices[index];
  }
  getDataVisibility(index) {
    return !this._hiddenIndices[index];
  }
  _updateVisibility(datasetIndex, dataIndex, visible) {
    const mode = visible ? "show" : "hide";
    const meta = this.getDatasetMeta(datasetIndex);
    const anims = meta.controller._resolveAnimations(void 0, mode);
    if (defined(dataIndex)) {
      meta.data[dataIndex].hidden = !visible;
      this.update();
    } else {
      this.setDatasetVisibility(datasetIndex, visible);
      anims.update(meta, {
        visible
      });
      this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : void 0);
    }
  }
  hide(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, false);
  }
  show(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, true);
  }
  _destroyDatasetMeta(datasetIndex) {
    const meta = this._metasets[datasetIndex];
    if (meta && meta.controller) {
      meta.controller._destroy();
    }
    delete this._metasets[datasetIndex];
  }
  _stop() {
    let i, ilen;
    this.stop();
    animator.remove(this);
    for (i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._destroyDatasetMeta(i);
    }
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas, ctx } = this;
    this._stop();
    this.config.clearCache();
    if (canvas) {
      this.unbindEvents();
      clearCanvas(canvas, ctx);
      this.platform.releaseContext(ctx);
      this.canvas = null;
      this.ctx = null;
    }
    delete instances[this.id];
    this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...args) {
    return this.canvas.toDataURL(...args);
  }
  bindEvents() {
    this.bindUserEvents();
    if (this.options.responsive) {
      this.bindResponsiveEvents();
    } else {
      this.attached = true;
    }
  }
  bindUserEvents() {
    const listeners = this._listeners;
    const platform = this.platform;
    const _add = (type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    };
    const listener = (e, x, y) => {
      e.offsetX = x;
      e.offsetY = y;
      this._eventHandler(e);
    };
    each(this.options.events, (type) => _add(type, listener));
  }
  bindResponsiveEvents() {
    if (!this._responsiveListeners) {
      this._responsiveListeners = {};
    }
    const listeners = this._responsiveListeners;
    const platform = this.platform;
    const _add = (type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    };
    const _remove = (type, listener2) => {
      if (listeners[type]) {
        platform.removeEventListener(this, type, listener2);
        delete listeners[type];
      }
    };
    const listener = (width, height) => {
      if (this.canvas) {
        this.resize(width, height);
      }
    };
    let detached;
    const attached = () => {
      _remove("attach", attached);
      this.attached = true;
      this.resize();
      _add("resize", listener);
      _add("detach", detached);
    };
    detached = () => {
      this.attached = false;
      _remove("resize", listener);
      this._stop();
      this._resize(0, 0);
      _add("attach", attached);
    };
    if (platform.isAttached(this.canvas)) {
      attached();
    } else {
      detached();
    }
  }
  unbindEvents() {
    each(this._listeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._listeners = {};
    each(this._responsiveListeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._responsiveListeners = void 0;
  }
  updateHoverStyle(items, mode, enabled) {
    const prefix = enabled ? "set" : "remove";
    let meta, item, i, ilen;
    if (mode === "dataset") {
      meta = this.getDatasetMeta(items[0].datasetIndex);
      meta.controller["_" + prefix + "DatasetHoverStyle"]();
    }
    for (i = 0, ilen = items.length; i < ilen; ++i) {
      item = items[i];
      const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
      if (controller) {
        controller[prefix + "HoverStyle"](item.element, item.datasetIndex, item.index);
      }
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(activeElements) {
    const lastActive = this._active || [];
    const active = activeElements.map(({ datasetIndex, index }) => {
      const meta = this.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error("No dataset found at index " + datasetIndex);
      }
      return {
        datasetIndex,
        element: meta.data[index],
        index
      };
    });
    const changed = !_elementsEqual(active, lastActive);
    if (changed) {
      this._active = active;
      this._lastEvent = null;
      this._updateHoverStyles(active, lastActive);
    }
  }
  notifyPlugins(hook, args, filter) {
    return this._plugins.notify(this, hook, args, filter);
  }
  isPluginEnabled(pluginId) {
    return this._plugins._cache.filter((p) => p.plugin.id === pluginId).length === 1;
  }
  _updateHoverStyles(active, lastActive, replay) {
    const hoverOptions = this.options.hover;
    const diff = (a, b) => a.filter((x) => !b.some((y) => x.datasetIndex === y.datasetIndex && x.index === y.index));
    const deactivated = diff(lastActive, active);
    const activated = replay ? active : diff(active, lastActive);
    if (deactivated.length) {
      this.updateHoverStyle(deactivated, hoverOptions.mode, false);
    }
    if (activated.length && hoverOptions.mode) {
      this.updateHoverStyle(activated, hoverOptions.mode, true);
    }
  }
  _eventHandler(e, replay) {
    const args = {
      event: e,
      replay,
      cancelable: true,
      inChartArea: this.isPointInArea(e)
    };
    const eventFilter = (plugin) => (plugin.options.events || this.options.events).includes(e.native.type);
    if (this.notifyPlugins("beforeEvent", args, eventFilter) === false) {
      return;
    }
    const changed = this._handleEvent(e, replay, args.inChartArea);
    args.cancelable = false;
    this.notifyPlugins("afterEvent", args, eventFilter);
    if (changed || args.changed) {
      this.render();
    }
    return this;
  }
  _handleEvent(e, replay, inChartArea) {
    const { _active: lastActive = [], options } = this;
    const useFinalPosition = replay;
    const active = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition);
    const isClick = _isClickEvent(e);
    const lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick);
    if (inChartArea) {
      this._lastEvent = null;
      callback(options.onHover, [
        e,
        active,
        this
      ], this);
      if (isClick) {
        callback(options.onClick, [
          e,
          active,
          this
        ], this);
      }
    }
    const changed = !_elementsEqual(active, lastActive);
    if (changed || replay) {
      this._active = active;
      this._updateHoverStyles(active, lastActive, replay);
    }
    this._lastEvent = lastEvent;
    return changed;
  }
  _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
    if (e.type === "mouseout") {
      return [];
    }
    if (!inChartArea) {
      return lastActive;
    }
    const hoverOptions = this.options.hover;
    return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
  }
};
function invalidatePlugins() {
  return each(Chart.instances, (chart) => chart._plugins.invalidate());
}
function setStyle(ctx, options, style = options) {
  ctx.lineCap = valueOrDefault(style.borderCapStyle, options.borderCapStyle);
  ctx.setLineDash(valueOrDefault(style.borderDash, options.borderDash));
  ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options.borderDashOffset);
  ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options.borderJoinStyle);
  ctx.lineWidth = valueOrDefault(style.borderWidth, options.borderWidth);
  ctx.strokeStyle = valueOrDefault(style.borderColor, options.borderColor);
}
function lineTo(ctx, previous, target) {
  ctx.lineTo(target.x, target.y);
}
function getLineMethod(options) {
  if (options.stepped) {
    return _steppedLineTo;
  }
  if (options.tension || options.cubicInterpolationMode === "monotone") {
    return _bezierCurveTo;
  }
  return lineTo;
}
function pathVars(points, segment, params = {}) {
  const count = points.length;
  const { start: paramsStart = 0, end: paramsEnd = count - 1 } = params;
  const { start: segmentStart, end: segmentEnd } = segment;
  const start = Math.max(paramsStart, segmentStart);
  const end = Math.min(paramsEnd, segmentEnd);
  const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
  return {
    count,
    start,
    loop: segment.loop,
    ilen: end < start && !outside ? count + end - start : end - start
  };
}
function pathSegment(ctx, line, segment, params) {
  const { points, options } = line;
  const { count, start, loop, ilen } = pathVars(points, segment, params);
  const lineMethod = getLineMethod(options);
  let { move = true, reverse } = params || {};
  let i, point, prev;
  for (i = 0; i <= ilen; ++i) {
    point = points[(start + (reverse ? ilen - i : i)) % count];
    if (point.skip) {
      continue;
    } else if (move) {
      ctx.moveTo(point.x, point.y);
      move = false;
    } else {
      lineMethod(ctx, prev, point, reverse, options.stepped);
    }
    prev = point;
  }
  if (loop) {
    point = points[(start + (reverse ? ilen : 0)) % count];
    lineMethod(ctx, prev, point, reverse, options.stepped);
  }
  return !!loop;
}
function fastPathSegment(ctx, line, segment, params) {
  const points = line.points;
  const { count, start, ilen } = pathVars(points, segment, params);
  const { move = true, reverse } = params || {};
  let avgX = 0;
  let countX = 0;
  let i, point, prevX, minY, maxY, lastY;
  const pointIndex = (index) => (start + (reverse ? ilen - index : index)) % count;
  const drawX = () => {
    if (minY !== maxY) {
      ctx.lineTo(avgX, maxY);
      ctx.lineTo(avgX, minY);
      ctx.lineTo(avgX, lastY);
    }
  };
  if (move) {
    point = points[pointIndex(0)];
    ctx.moveTo(point.x, point.y);
  }
  for (i = 0; i <= ilen; ++i) {
    point = points[pointIndex(i)];
    if (point.skip) {
      continue;
    }
    const x = point.x;
    const y = point.y;
    const truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
      } else if (y > maxY) {
        maxY = y;
      }
      avgX = (countX * avgX + x) / ++countX;
    } else {
      drawX();
      ctx.lineTo(x, y);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
    }
    lastY = y;
  }
  drawX();
}
function _getSegmentMethod(line) {
  const opts = line.options;
  const borderDash = opts.borderDash && opts.borderDash.length;
  const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== "monotone" && !opts.stepped && !borderDash;
  return useFastPath ? fastPathSegment : pathSegment;
}
function _getInterpolationMethod(options) {
  if (options.stepped) {
    return _steppedInterpolation;
  }
  if (options.tension || options.cubicInterpolationMode === "monotone") {
    return _bezierInterpolation;
  }
  return _pointInLine;
}
function strokePathWithCache(ctx, line, start, count) {
  let path = line._path;
  if (!path) {
    path = line._path = new Path2D();
    if (line.path(path, start, count)) {
      path.closePath();
    }
  }
  setStyle(ctx, line.options);
  ctx.stroke(path);
}
function strokePathDirect(ctx, line, start, count) {
  const { segments, options } = line;
  const segmentMethod = _getSegmentMethod(line);
  for (const segment of segments) {
    setStyle(ctx, options, segment.style);
    ctx.beginPath();
    if (segmentMethod(ctx, line, segment, {
      start,
      end: start + count - 1
    })) {
      ctx.closePath();
    }
    ctx.stroke();
  }
}
var usePath2D = typeof Path2D === "function";
function draw(ctx, line, start, count) {
  if (usePath2D && !line.options.segment) {
    strokePathWithCache(ctx, line, start, count);
  } else {
    strokePathDirect(ctx, line, start, count);
  }
}
var LineElement = class extends Element2 {
  static id = "line";
  static defaults = {
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 3,
    capBezierPoints: true,
    cubicInterpolationMode: "default",
    fill: false,
    spanGaps: false,
    stepped: false,
    tension: 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  static descriptors = {
    _scriptable: true,
    _indexable: (name) => name !== "borderDash" && name !== "fill"
  };
  constructor(cfg) {
    super();
    this.animated = true;
    this.options = void 0;
    this._chart = void 0;
    this._loop = void 0;
    this._fullLoop = void 0;
    this._path = void 0;
    this._points = void 0;
    this._segments = void 0;
    this._decimated = false;
    this._pointsUpdated = false;
    this._datasetIndex = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  updateControlPoints(chartArea, indexAxis) {
    const options = this.options;
    if ((options.tension || options.cubicInterpolationMode === "monotone") && !options.stepped && !this._pointsUpdated) {
      const loop = options.spanGaps ? this._loop : this._fullLoop;
      _updateBezierControlPoints(this._points, options, chartArea, loop, indexAxis);
      this._pointsUpdated = true;
    }
  }
  set points(points) {
    this._points = points;
    delete this._segments;
    delete this._path;
    this._pointsUpdated = false;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = _computeSegments(this, this.options.segment));
  }
  first() {
    const segments = this.segments;
    const points = this.points;
    return segments.length && points[segments[0].start];
  }
  last() {
    const segments = this.segments;
    const points = this.points;
    const count = segments.length;
    return count && points[segments[count - 1].end];
  }
  interpolate(point, property) {
    const options = this.options;
    const value = point[property];
    const points = this.points;
    const segments = _boundSegments(this, {
      property,
      start: value,
      end: value
    });
    if (!segments.length) {
      return;
    }
    const result = [];
    const _interpolate = _getInterpolationMethod(options);
    let i, ilen;
    for (i = 0, ilen = segments.length; i < ilen; ++i) {
      const { start, end } = segments[i];
      const p1 = points[start];
      const p2 = points[end];
      if (p1 === p2) {
        result.push(p1);
        continue;
      }
      const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
      const interpolated = _interpolate(p1, p2, t, options.stepped);
      interpolated[property] = point[property];
      result.push(interpolated);
    }
    return result.length === 1 ? result[0] : result;
  }
  pathSegment(ctx, segment, params) {
    const segmentMethod = _getSegmentMethod(this);
    return segmentMethod(ctx, this, segment, params);
  }
  path(ctx, start, count) {
    const segments = this.segments;
    const segmentMethod = _getSegmentMethod(this);
    let loop = this._loop;
    start = start || 0;
    count = count || this.points.length - start;
    for (const segment of segments) {
      loop &= segmentMethod(ctx, this, segment, {
        start,
        end: start + count - 1
      });
    }
    return !!loop;
  }
  draw(ctx, chartArea, start, count) {
    const options = this.options || {};
    const points = this.points || [];
    if (points.length && options.borderWidth) {
      ctx.save();
      draw(ctx, this, start, count);
      ctx.restore();
    }
    if (this.animated) {
      this._pointsUpdated = false;
      this._path = void 0;
    }
  }
};
function inRange$1(el, pos, axis, useFinalPosition) {
  const options = el.options;
  const { [axis]: value } = el.getProps([
    axis
  ], useFinalPosition);
  return Math.abs(pos - value) < options.radius + options.hitRadius;
}
var PointElement = class extends Element2 {
  static id = "point";
  parsed;
  skip;
  stop;
  /**
  * @type {any}
  */
  static defaults = {
    borderWidth: 1,
    hitRadius: 1,
    hoverBorderWidth: 1,
    hoverRadius: 4,
    pointStyle: "circle",
    radius: 3,
    rotation: 0
  };
  /**
  * @type {any}
  */
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(cfg) {
    super();
    this.options = void 0;
    this.parsed = void 0;
    this.skip = void 0;
    this.stop = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  inRange(mouseX, mouseY, useFinalPosition) {
    const options = this.options;
    const { x, y } = this.getProps([
      "x",
      "y"
    ], useFinalPosition);
    return Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2) < Math.pow(options.hitRadius + options.radius, 2);
  }
  inXRange(mouseX, useFinalPosition) {
    return inRange$1(this, mouseX, "x", useFinalPosition);
  }
  inYRange(mouseY, useFinalPosition) {
    return inRange$1(this, mouseY, "y", useFinalPosition);
  }
  getCenterPoint(useFinalPosition) {
    const { x, y } = this.getProps([
      "x",
      "y"
    ], useFinalPosition);
    return {
      x,
      y
    };
  }
  size(options) {
    options = options || this.options || {};
    let radius = options.radius || 0;
    radius = Math.max(radius, radius && options.hoverRadius || 0);
    const borderWidth = radius && options.borderWidth || 0;
    return (radius + borderWidth) * 2;
  }
  draw(ctx, area) {
    const options = this.options;
    if (this.skip || options.radius < 0.1 || !_isPointInArea(this, area, this.size(options) / 2)) {
      return;
    }
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.fillStyle = options.backgroundColor;
    drawPoint(ctx, options, this.x, this.y);
  }
  getRange() {
    const options = this.options || {};
    return options.radius + options.hitRadius;
  }
};
var addIfString = (labels, raw, index, addedLabels) => {
  if (typeof raw === "string") {
    index = labels.push(raw) - 1;
    addedLabels.unshift({
      index,
      label: raw
    });
  } else if (isNaN(raw)) {
    index = null;
  }
  return index;
};
function findOrAddLabel(labels, raw, index, addedLabels) {
  const first = labels.indexOf(raw);
  if (first === -1) {
    return addIfString(labels, raw, index, addedLabels);
  }
  const last = labels.lastIndexOf(raw);
  return first !== last ? index : first;
}
var validIndex = (index, max) => index === null ? null : _limitValue(Math.round(index), 0, max);
function _getLabelForValue(value) {
  const labels = this.getLabels();
  if (value >= 0 && value < labels.length) {
    return labels[value];
  }
  return value;
}
var CategoryScale = class extends Scale {
  static id = "category";
  static defaults = {
    ticks: {
      callback: _getLabelForValue
    }
  };
  constructor(cfg) {
    super(cfg);
    this._startValue = void 0;
    this._valueRange = 0;
    this._addedLabels = [];
  }
  init(scaleOptions) {
    const added = this._addedLabels;
    if (added.length) {
      const labels = this.getLabels();
      for (const { index, label } of added) {
        if (labels[index] === label) {
          labels.splice(index, 1);
        }
      }
      this._addedLabels = [];
    }
    super.init(scaleOptions);
  }
  parse(raw, index) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    const labels = this.getLabels();
    index = isFinite(index) && labels[index] === raw ? index : findOrAddLabel(labels, raw, valueOrDefault(index, raw), this._addedLabels);
    return validIndex(index, labels.length - 1);
  }
  determineDataLimits() {
    const { minDefined, maxDefined } = this.getUserBounds();
    let { min, max } = this.getMinMax(true);
    if (this.options.bounds === "ticks") {
      if (!minDefined) {
        min = 0;
      }
      if (!maxDefined) {
        max = this.getLabels().length - 1;
      }
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const min = this.min;
    const max = this.max;
    const offset = this.options.offset;
    const ticks = [];
    let labels = this.getLabels();
    labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
    this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
    this._startValue = this.min - (offset ? 0.5 : 0);
    for (let value = min; value <= max; value++) {
      ticks.push({
        value
      });
    }
    return ticks;
  }
  getLabelForValue(value) {
    return _getLabelForValue.call(this, value);
  }
  configure() {
    super.configure();
    if (!this.isHorizontal()) {
      this._reversePixels = !this._reversePixels;
    }
  }
  getPixelForValue(value) {
    if (typeof value !== "number") {
      value = this.parse(value);
    }
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getPixelForTick(index) {
    const ticks = this.ticks;
    if (index < 0 || index > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index].value);
  }
  getValueForPixel(pixel) {
    return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
};
function generateTicks$1(generationOptions, dataRange) {
  const ticks = [];
  const MIN_SPACING = 1e-14;
  const { bounds, step, min, max, precision, count, maxTicks, maxDigits, includeBounds } = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const { min: rmin, max: rmax } = dataRange;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [
      {
        value: rmin
      },
      {
        value: rmax
      }
    ];
  }
  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
  }
  if (!isNullOrUndef(precision)) {
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }
  if (bounds === "ticks") {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }
  if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1e3)) {
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    numSpaces = (niceMax - niceMin) / spacing;
    if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1e3)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }
  const decimalPlaces = Math.max(_decimalPlaces(spacing), _decimalPlaces(niceMin));
  factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;
  let j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({
        value: min
      });
      if (niceMin < min) {
        j++;
      }
      if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }
  for (; j < numSpaces; ++j) {
    const tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
    if (maxDefined && tickValue > max) {
      break;
    }
    ticks.push({
      value: tickValue
    });
  }
  if (maxDefined && includeBounds && niceMax !== max) {
    if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({
        value: max
      });
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({
      value: niceMax
    });
  }
  return ticks;
}
function relativeLabelSize(value, minSpacing, { horizontal, minRotation }) {
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 1e-3;
  const length = 0.75 * minSpacing * ("" + value).length;
  return Math.min(minSpacing / ratio, length);
}
var LinearScaleBase = class extends Scale {
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._endValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    if ((typeof raw === "number" || raw instanceof Number) && !isFinite(+raw)) {
      return null;
    }
    return +raw;
  }
  handleTickRangeOptions() {
    const { beginAtZero } = this.options;
    const { minDefined, maxDefined } = this.getUserBounds();
    let { min, max } = this;
    const setMin = (v) => min = minDefined ? min : v;
    const setMax = (v) => max = maxDefined ? max : v;
    if (beginAtZero) {
      const minSign = sign(min);
      const maxSign = sign(max);
      if (minSign < 0 && maxSign < 0) {
        setMax(0);
      } else if (minSign > 0 && maxSign > 0) {
        setMin(0);
      }
    }
    if (min === max) {
      let offset = max === 0 ? 1 : Math.abs(max * 0.05);
      setMax(max + offset);
      if (!beginAtZero) {
        setMin(min - offset);
      }
    }
    this.min = min;
    this.max = max;
  }
  getTickLimit() {
    const tickOpts = this.options.ticks;
    let { maxTicksLimit, stepSize } = tickOpts;
    let maxTicks;
    if (stepSize) {
      maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
      if (maxTicks > 1e3) {
        console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
        maxTicks = 1e3;
      }
    } else {
      maxTicks = this.computeTickLimit();
      maxTicksLimit = maxTicksLimit || 11;
    }
    if (maxTicksLimit) {
      maxTicks = Math.min(maxTicksLimit, maxTicks);
    }
    return maxTicks;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const opts = this.options;
    const tickOpts = opts.ticks;
    let maxTicks = this.getTickLimit();
    maxTicks = Math.max(2, maxTicks);
    const numericGeneratorOptions = {
      maxTicks,
      bounds: opts.bounds,
      min: opts.min,
      max: opts.max,
      precision: tickOpts.precision,
      step: tickOpts.stepSize,
      count: tickOpts.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: tickOpts.minRotation || 0,
      includeBounds: tickOpts.includeBounds !== false
    };
    const dataRange = this._range || this;
    const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  configure() {
    const ticks = this.ticks;
    let start = this.min;
    let end = this.max;
    super.configure();
    if (this.options.offset && ticks.length) {
      const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
      start -= offset;
      end += offset;
    }
    this._startValue = start;
    this._endValue = end;
    this._valueRange = end - start;
  }
  getLabelForValue(value) {
    return formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
};
var LinearScale = class extends LinearScaleBase {
  static id = "linear";
  static defaults = {
    ticks: {
      callback: Ticks.formatters.numeric
    }
  };
  determineDataLimits() {
    const { min, max } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? min : 0;
    this.max = isNumberFinite(max) ? max : 1;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const horizontal = this.isHorizontal();
    const length = horizontal ? this.width : this.height;
    const minRotation = toRadians(this.options.ticks.minRotation);
    const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 1e-3;
    const tickFont = this._resolveTickFontOptions(0);
    return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
  }
  getPixelForValue(value) {
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
  }
};
var log10Floor = (v) => Math.floor(log10(v));
var changeExponent = (v, m) => Math.pow(10, log10Floor(v) + m);
function isMajor(tickVal) {
  const remain = tickVal / Math.pow(10, log10Floor(tickVal));
  return remain === 1;
}
function steps(min, max, rangeExp) {
  const rangeStep = Math.pow(10, rangeExp);
  const start = Math.floor(min / rangeStep);
  const end = Math.ceil(max / rangeStep);
  return end - start;
}
function startExp(min, max) {
  const range = max - min;
  let rangeExp = log10Floor(range);
  while (steps(min, max, rangeExp) > 10) {
    rangeExp++;
  }
  while (steps(min, max, rangeExp) < 10) {
    rangeExp--;
  }
  return Math.min(rangeExp, log10Floor(min));
}
function generateTicks(generationOptions, { min, max }) {
  min = finiteOrDefault(generationOptions.min, min);
  const ticks = [];
  const minExp = log10Floor(min);
  let exp = startExp(min, max);
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  const stepSize = Math.pow(10, exp);
  const base = minExp > exp ? Math.pow(10, minExp) : 0;
  const start = Math.round((min - base) * precision) / precision;
  const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
  let significand = Math.floor((start - offset) / Math.pow(10, exp));
  let value = finiteOrDefault(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
  while (value < max) {
    ticks.push({
      value,
      major: isMajor(value),
      significand
    });
    if (significand >= 10) {
      significand = significand < 15 ? 15 : 20;
    } else {
      significand++;
    }
    if (significand >= 20) {
      exp++;
      significand = 2;
      precision = exp >= 0 ? 1 : precision;
    }
    value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
  }
  const lastTick = finiteOrDefault(generationOptions.max, value);
  ticks.push({
    value: lastTick,
    major: isMajor(lastTick),
    significand
  });
  return ticks;
}
var LogarithmicScale = class extends Scale {
  static id = "logarithmic";
  static defaults = {
    ticks: {
      callback: Ticks.formatters.logarithmic,
      major: {
        enabled: true
      }
    }
  };
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index) {
    const value = LinearScaleBase.prototype.parse.apply(this, [
      raw,
      index
    ]);
    if (value === 0) {
      this._zero = true;
      return void 0;
    }
    return isNumberFinite(value) && value > 0 ? value : null;
  }
  determineDataLimits() {
    const { min, max } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? Math.max(0, min) : null;
    this.max = isNumberFinite(max) ? Math.max(0, max) : null;
    if (this.options.beginAtZero) {
      this._zero = true;
    }
    if (this._zero && this.min !== this._suggestedMin && !isNumberFinite(this._userMin)) {
      this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
    }
    this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const { minDefined, maxDefined } = this.getUserBounds();
    let min = this.min;
    let max = this.max;
    const setMin = (v) => min = minDefined ? min : v;
    const setMax = (v) => max = maxDefined ? max : v;
    if (min === max) {
      if (min <= 0) {
        setMin(1);
        setMax(10);
      } else {
        setMin(changeExponent(min, -1));
        setMax(changeExponent(max, 1));
      }
    }
    if (min <= 0) {
      setMin(changeExponent(max, -1));
    }
    if (max <= 0) {
      setMax(changeExponent(min, 1));
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const opts = this.options;
    const generationOptions = {
      min: this._userMin,
      max: this._userMax
    };
    const ticks = generateTicks(generationOptions, this);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  getLabelForValue(value) {
    return value === void 0 ? "0" : formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const start = this.min;
    super.configure();
    this._startValue = log10(start);
    this._valueRange = log10(this.max) - log10(start);
  }
  getPixelForValue(value) {
    if (value === void 0 || value === 0) {
      value = this.min;
    }
    if (value === null || isNaN(value)) {
      return NaN;
    }
    return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    const decimal = this.getDecimalForPixel(pixel);
    return Math.pow(10, this._startValue + decimal * this._valueRange);
  }
};
function getTickBackdropHeight(opts) {
  const tickOpts = opts.ticks;
  if (tickOpts.display && opts.display) {
    const padding = toPadding(tickOpts.backdropPadding);
    return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height;
  }
  return 0;
}
function measureLabelSize(ctx, font, label) {
  label = isArray(label) ? label : [
    label
  ];
  return {
    w: _longestText(ctx, font.string, label),
    h: label.length * font.lineHeight
  };
}
function determineLimits(angle, pos, size, min, max) {
  if (angle === min || angle === max) {
    return {
      start: pos - size / 2,
      end: pos + size / 2
    };
  } else if (angle < min || angle > max) {
    return {
      start: pos - size,
      end: pos
    };
  }
  return {
    start: pos,
    end: pos + size
  };
}
function fitWithPointLabels(scale) {
  const orig = {
    l: scale.left + scale._padding.left,
    r: scale.right - scale._padding.right,
    t: scale.top + scale._padding.top,
    b: scale.bottom - scale._padding.bottom
  };
  const limits = Object.assign({}, orig);
  const labelSizes = [];
  const padding = [];
  const valueCount = scale._pointLabels.length;
  const pointLabelOpts = scale.options.pointLabels;
  const additionalAngle = pointLabelOpts.centerPointLabels ? PI / valueCount : 0;
  for (let i = 0; i < valueCount; i++) {
    const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i));
    padding[i] = opts.padding;
    const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle);
    const plFont = toFont(opts.font);
    const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
    labelSizes[i] = textSize;
    const angleRadians = _normalizeAngle(scale.getIndexAngle(i) + additionalAngle);
    const angle = Math.round(toDegrees(angleRadians));
    const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
    const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
    updateLimits(limits, orig, angleRadians, hLimits, vLimits);
  }
  scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b);
  scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}
function updateLimits(limits, orig, angle, hLimits, vLimits) {
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));
  let x = 0;
  let y = 0;
  if (hLimits.start < orig.l) {
    x = (orig.l - hLimits.start) / sin;
    limits.l = Math.min(limits.l, orig.l - x);
  } else if (hLimits.end > orig.r) {
    x = (hLimits.end - orig.r) / sin;
    limits.r = Math.max(limits.r, orig.r + x);
  }
  if (vLimits.start < orig.t) {
    y = (orig.t - vLimits.start) / cos;
    limits.t = Math.min(limits.t, orig.t - y);
  } else if (vLimits.end > orig.b) {
    y = (vLimits.end - orig.b) / cos;
    limits.b = Math.max(limits.b, orig.b + y);
  }
}
function createPointLabelItem(scale, index, itemOpts) {
  const outerDistance = scale.drawingArea;
  const { extra, additionalAngle, padding, size } = itemOpts;
  const pointLabelPosition = scale.getPointPosition(index, outerDistance + extra + padding, additionalAngle);
  const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI)));
  const y = yForAngle(pointLabelPosition.y, size.h, angle);
  const textAlign = getTextAlignForAngle(angle);
  const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
  return {
    visible: true,
    x: pointLabelPosition.x,
    y,
    textAlign,
    left,
    top: y,
    right: left + size.w,
    bottom: y + size.h
  };
}
function isNotOverlapped(item, area) {
  if (!area) {
    return true;
  }
  const { left, top, right, bottom: bottom2 } = item;
  const apexesInArea = _isPointInArea({
    x: left,
    y: top
  }, area) || _isPointInArea({
    x: left,
    y: bottom2
  }, area) || _isPointInArea({
    x: right,
    y: top
  }, area) || _isPointInArea({
    x: right,
    y: bottom2
  }, area);
  return !apexesInArea;
}
function buildPointLabelItems(scale, labelSizes, padding) {
  const items = [];
  const valueCount = scale._pointLabels.length;
  const opts = scale.options;
  const { centerPointLabels, display } = opts.pointLabels;
  const itemOpts = {
    extra: getTickBackdropHeight(opts) / 2,
    additionalAngle: centerPointLabels ? PI / valueCount : 0
  };
  let area;
  for (let i = 0; i < valueCount; i++) {
    itemOpts.padding = padding[i];
    itemOpts.size = labelSizes[i];
    const item = createPointLabelItem(scale, i, itemOpts);
    items.push(item);
    if (display === "auto") {
      item.visible = isNotOverlapped(item, area);
      if (item.visible) {
        area = item;
      }
    }
  }
  return items;
}
function getTextAlignForAngle(angle) {
  if (angle === 0 || angle === 180) {
    return "center";
  } else if (angle < 180) {
    return "left";
  }
  return "right";
}
function leftForTextAlign(x, w, align) {
  if (align === "right") {
    x -= w;
  } else if (align === "center") {
    x -= w / 2;
  }
  return x;
}
function yForAngle(y, h, angle) {
  if (angle === 90 || angle === 270) {
    y -= h / 2;
  } else if (angle > 270 || angle < 90) {
    y -= h;
  }
  return y;
}
function drawPointLabelBox(ctx, opts, item) {
  const { left, top, right, bottom: bottom2 } = item;
  const { backdropColor } = opts;
  if (!isNullOrUndef(backdropColor)) {
    const borderRadius = toTRBLCorners(opts.borderRadius);
    const padding = toPadding(opts.backdropPadding);
    ctx.fillStyle = backdropColor;
    const backdropLeft = left - padding.left;
    const backdropTop = top - padding.top;
    const backdropWidth = right - left + padding.width;
    const backdropHeight = bottom2 - top + padding.height;
    if (Object.values(borderRadius).some((v) => v !== 0)) {
      ctx.beginPath();
      addRoundedRectPath(ctx, {
        x: backdropLeft,
        y: backdropTop,
        w: backdropWidth,
        h: backdropHeight,
        radius: borderRadius
      });
      ctx.fill();
    } else {
      ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
    }
  }
}
function drawPointLabels(scale, labelCount) {
  const { ctx, options: { pointLabels } } = scale;
  for (let i = labelCount - 1; i >= 0; i--) {
    const item = scale._pointLabelItems[i];
    if (!item.visible) {
      continue;
    }
    const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
    drawPointLabelBox(ctx, optsAtIndex, item);
    const plFont = toFont(optsAtIndex.font);
    const { x, y, textAlign } = item;
    renderText(ctx, scale._pointLabels[i], x, y + plFont.lineHeight / 2, plFont, {
      color: optsAtIndex.color,
      textAlign,
      textBaseline: "middle"
    });
  }
}
function pathRadiusLine(scale, radius, circular, labelCount) {
  const { ctx } = scale;
  if (circular) {
    ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
  } else {
    let pointPosition = scale.getPointPosition(0, radius);
    ctx.moveTo(pointPosition.x, pointPosition.y);
    for (let i = 1; i < labelCount; i++) {
      pointPosition = scale.getPointPosition(i, radius);
      ctx.lineTo(pointPosition.x, pointPosition.y);
    }
  }
}
function drawRadiusLine(scale, gridLineOpts, radius, labelCount, borderOpts) {
  const ctx = scale.ctx;
  const circular = gridLineOpts.circular;
  const { color: color2, lineWidth } = gridLineOpts;
  if (!circular && !labelCount || !color2 || !lineWidth || radius < 0) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = color2;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(borderOpts.dash || []);
  ctx.lineDashOffset = borderOpts.dashOffset;
  ctx.beginPath();
  pathRadiusLine(scale, radius, circular, labelCount);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
function createPointLabelContext(parent, index, label) {
  return createContext(parent, {
    label,
    index,
    type: "pointLabel"
  });
}
var RadialLinearScale = class extends LinearScaleBase {
  static id = "radialLinear";
  static defaults = {
    display: true,
    animate: true,
    position: "chartArea",
    angleLines: {
      display: true,
      lineWidth: 1,
      borderDash: [],
      borderDashOffset: 0
    },
    grid: {
      circular: false
    },
    startAngle: 0,
    ticks: {
      showLabelBackdrop: true,
      callback: Ticks.formatters.numeric
    },
    pointLabels: {
      backdropColor: void 0,
      backdropPadding: 2,
      display: true,
      font: {
        size: 10
      },
      callback(label) {
        return label;
      },
      padding: 5,
      centerPointLabels: false
    }
  };
  static defaultRoutes = {
    "angleLines.color": "borderColor",
    "pointLabels.color": "color",
    "ticks.color": "color"
  };
  static descriptors = {
    angleLines: {
      _fallback: "grid"
    }
  };
  constructor(cfg) {
    super(cfg);
    this.xCenter = void 0;
    this.yCenter = void 0;
    this.drawingArea = void 0;
    this._pointLabels = [];
    this._pointLabelItems = [];
  }
  setDimensions() {
    const padding = this._padding = toPadding(getTickBackdropHeight(this.options) / 2);
    const w = this.width = this.maxWidth - padding.width;
    const h = this.height = this.maxHeight - padding.height;
    this.xCenter = Math.floor(this.left + w / 2 + padding.left);
    this.yCenter = Math.floor(this.top + h / 2 + padding.top);
    this.drawingArea = Math.floor(Math.min(w, h) / 2);
  }
  determineDataLimits() {
    const { min, max } = this.getMinMax(false);
    this.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
    this.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
  }
  generateTickLabels(ticks) {
    LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
    this._pointLabels = this.getLabels().map((value, index) => {
      const label = callback(this.options.pointLabels.callback, [
        value,
        index
      ], this);
      return label || label === 0 ? label : "";
    }).filter((v, i) => this.chart.getDataVisibility(i));
  }
  fit() {
    const opts = this.options;
    if (opts.display && opts.pointLabels.display) {
      fitWithPointLabels(this);
    } else {
      this.setCenterPoint(0, 0, 0, 0);
    }
  }
  setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
    this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
    this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
    this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
  }
  getIndexAngle(index) {
    const angleMultiplier = TAU / (this._pointLabels.length || 1);
    const startAngle = this.options.startAngle || 0;
    return _normalizeAngle(index * angleMultiplier + toRadians(startAngle));
  }
  getDistanceFromCenterForValue(value) {
    if (isNullOrUndef(value)) {
      return NaN;
    }
    const scalingFactor = this.drawingArea / (this.max - this.min);
    if (this.options.reverse) {
      return (this.max - value) * scalingFactor;
    }
    return (value - this.min) * scalingFactor;
  }
  getValueForDistanceFromCenter(distance) {
    if (isNullOrUndef(distance)) {
      return NaN;
    }
    const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
  }
  getPointLabelContext(index) {
    const pointLabels = this._pointLabels || [];
    if (index >= 0 && index < pointLabels.length) {
      const pointLabel = pointLabels[index];
      return createPointLabelContext(this.getContext(), index, pointLabel);
    }
  }
  getPointPosition(index, distanceFromCenter, additionalAngle = 0) {
    const angle = this.getIndexAngle(index) - HALF_PI + additionalAngle;
    return {
      x: Math.cos(angle) * distanceFromCenter + this.xCenter,
      y: Math.sin(angle) * distanceFromCenter + this.yCenter,
      angle
    };
  }
  getPointPositionForValue(index, value) {
    return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
  }
  getBasePosition(index) {
    return this.getPointPositionForValue(index || 0, this.getBaseValue());
  }
  getPointLabelPosition(index) {
    const { left, top, right, bottom: bottom2 } = this._pointLabelItems[index];
    return {
      left,
      top,
      right,
      bottom: bottom2
    };
  }
  drawBackground() {
    const { backgroundColor, grid: { circular } } = this.options;
    if (backgroundColor) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
      ctx.closePath();
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.restore();
    }
  }
  drawGrid() {
    const ctx = this.ctx;
    const opts = this.options;
    const { angleLines, grid, border } = opts;
    const labelCount = this._pointLabels.length;
    let i, offset, position;
    if (opts.pointLabels.display) {
      drawPointLabels(this, labelCount);
    }
    if (grid.display) {
      this.ticks.forEach((tick, index) => {
        if (index !== 0 || index === 0 && this.min < 0) {
          offset = this.getDistanceFromCenterForValue(tick.value);
          const context = this.getContext(index);
          const optsAtIndex = grid.setContext(context);
          const optsAtIndexBorder = border.setContext(context);
          drawRadiusLine(this, optsAtIndex, offset, labelCount, optsAtIndexBorder);
        }
      });
    }
    if (angleLines.display) {
      ctx.save();
      for (i = labelCount - 1; i >= 0; i--) {
        const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
        const { color: color2, lineWidth } = optsAtIndex;
        if (!lineWidth || !color2) {
          continue;
        }
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color2;
        ctx.setLineDash(optsAtIndex.borderDash);
        ctx.lineDashOffset = optsAtIndex.borderDashOffset;
        offset = this.getDistanceFromCenterForValue(opts.reverse ? this.min : this.max);
        position = this.getPointPosition(i, offset);
        ctx.beginPath();
        ctx.moveTo(this.xCenter, this.yCenter);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  drawBorder() {
  }
  drawLabels() {
    const ctx = this.ctx;
    const opts = this.options;
    const tickOpts = opts.ticks;
    if (!tickOpts.display) {
      return;
    }
    const startAngle = this.getIndexAngle(0);
    let offset, width;
    ctx.save();
    ctx.translate(this.xCenter, this.yCenter);
    ctx.rotate(startAngle);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.ticks.forEach((tick, index) => {
      if (index === 0 && this.min >= 0 && !opts.reverse) {
        return;
      }
      const optsAtIndex = tickOpts.setContext(this.getContext(index));
      const tickFont = toFont(optsAtIndex.font);
      offset = this.getDistanceFromCenterForValue(this.ticks[index].value);
      if (optsAtIndex.showLabelBackdrop) {
        ctx.font = tickFont.string;
        width = ctx.measureText(tick.label).width;
        ctx.fillStyle = optsAtIndex.backdropColor;
        const padding = toPadding(optsAtIndex.backdropPadding);
        ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
      }
      renderText(ctx, tick.label, 0, -offset, tickFont, {
        color: optsAtIndex.color,
        strokeColor: optsAtIndex.textStrokeColor,
        strokeWidth: optsAtIndex.textStrokeWidth
      });
    });
    ctx.restore();
  }
  drawTitle() {
  }
};
var INTERVALS = {
  millisecond: {
    common: true,
    size: 1,
    steps: 1e3
  },
  second: {
    common: true,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: true,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: true,
    size: 36e5,
    steps: 24
  },
  day: {
    common: true,
    size: 864e5,
    steps: 30
  },
  week: {
    common: false,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: true,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: false,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: true,
    size: 3154e7
  }
};
var UNITS = /* @__PURE__ */ Object.keys(INTERVALS);
function sorter(a, b) {
  return a - b;
}
function parse(scale, input) {
  if (isNullOrUndef(input)) {
    return null;
  }
  const adapter = scale._adapter;
  const { parser, round: round2, isoWeekday } = scale._parseOpts;
  let value = input;
  if (typeof parser === "function") {
    value = parser(value);
  }
  if (!isNumberFinite(value)) {
    value = typeof parser === "string" ? adapter.parse(value, parser) : adapter.parse(value);
  }
  if (value === null) {
    return null;
  }
  if (round2) {
    value = round2 === "week" && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, "isoWeek", isoWeekday) : adapter.startOf(value, round2);
  }
  return +value;
}
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
  const ilen = UNITS.length;
  for (let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
    const interval = INTERVALS[UNITS[i]];
    const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
    if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
      return UNITS[i];
    }
  }
  return UNITS[ilen - 1];
}
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
  for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
    const unit = UNITS[i];
    if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
      return unit;
    }
  }
  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
function determineMajorUnit(unit) {
  for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
    if (INTERVALS[UNITS[i]].common) {
      return UNITS[i];
    }
  }
}
function addTick(ticks, time, timestamps) {
  if (!timestamps) {
    ticks[time] = true;
  } else if (timestamps.length) {
    const { lo, hi } = _lookup(timestamps, time);
    const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
    ticks[timestamp] = true;
  }
}
function setMajorTicks(scale, ticks, map2, majorUnit) {
  const adapter = scale._adapter;
  const first = +adapter.startOf(ticks[0].value, majorUnit);
  const last = ticks[ticks.length - 1].value;
  let major, index;
  for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
    index = map2[major];
    if (index >= 0) {
      ticks[index].major = true;
    }
  }
  return ticks;
}
function ticksFromTimestamps(scale, values, majorUnit) {
  const ticks = [];
  const map2 = {};
  const ilen = values.length;
  let i, value;
  for (i = 0; i < ilen; ++i) {
    value = values[i];
    map2[value] = i;
    ticks.push({
      value,
      major: false
    });
  }
  return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map2, majorUnit);
}
var TimeScale = class extends Scale {
  static id = "time";
  static defaults = {
    bounds: "data",
    adapters: {},
    time: {
      parser: false,
      unit: false,
      round: false,
      isoWeekday: false,
      minUnit: "millisecond",
      displayFormats: {}
    },
    ticks: {
      source: "auto",
      callback: false,
      major: {
        enabled: false
      }
    }
  };
  constructor(props) {
    super(props);
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
    this._unit = "day";
    this._majorUnit = void 0;
    this._offsets = {};
    this._normalized = false;
    this._parseOpts = void 0;
  }
  init(scaleOpts, opts = {}) {
    const time = scaleOpts.time || (scaleOpts.time = {});
    const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
    adapter.init(opts);
    mergeIf(time.displayFormats, adapter.formats());
    this._parseOpts = {
      parser: time.parser,
      round: time.round,
      isoWeekday: time.isoWeekday
    };
    super.init(scaleOpts);
    this._normalized = opts.normalized;
  }
  parse(raw, index) {
    if (raw === void 0) {
      return null;
    }
    return parse(this, raw);
  }
  beforeLayout() {
    super.beforeLayout();
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const options = this.options;
    const adapter = this._adapter;
    const unit = options.time.unit || "day";
    let { min, max, minDefined, maxDefined } = this.getUserBounds();
    function _applyBounds(bounds) {
      if (!minDefined && !isNaN(bounds.min)) {
        min = Math.min(min, bounds.min);
      }
      if (!maxDefined && !isNaN(bounds.max)) {
        max = Math.max(max, bounds.max);
      }
    }
    if (!minDefined || !maxDefined) {
      _applyBounds(this._getLabelBounds());
      if (options.bounds !== "ticks" || options.ticks.source !== "labels") {
        _applyBounds(this.getMinMax(false));
      }
    }
    min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
    max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
    this.min = Math.min(min, max - 1);
    this.max = Math.max(min + 1, max);
  }
  _getLabelBounds() {
    const arr = this.getLabelTimestamps();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    if (arr.length) {
      min = arr[0];
      max = arr[arr.length - 1];
    }
    return {
      min,
      max
    };
  }
  buildTicks() {
    const options = this.options;
    const timeOpts = options.time;
    const tickOpts = options.ticks;
    const timestamps = tickOpts.source === "labels" ? this.getLabelTimestamps() : this._generate();
    if (options.bounds === "ticks" && timestamps.length) {
      this.min = this._userMin || timestamps[0];
      this.max = this._userMax || timestamps[timestamps.length - 1];
    }
    const min = this.min;
    const max = this.max;
    const ticks = _filterBetween(timestamps, min, max);
    this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
    this._majorUnit = !tickOpts.major.enabled || this._unit === "year" ? void 0 : determineMajorUnit(this._unit);
    this.initOffsets(timestamps);
    if (options.reverse) {
      ticks.reverse();
    }
    return ticksFromTimestamps(this, ticks, this._majorUnit);
  }
  afterAutoSkip() {
    if (this.options.offsetAfterAutoskip) {
      this.initOffsets(this.ticks.map((tick) => +tick.value));
    }
  }
  initOffsets(timestamps = []) {
    let start = 0;
    let end = 0;
    let first, last;
    if (this.options.offset && timestamps.length) {
      first = this.getDecimalForValue(timestamps[0]);
      if (timestamps.length === 1) {
        start = 1 - first;
      } else {
        start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
      }
      last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
      if (timestamps.length === 1) {
        end = last;
      } else {
        end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
      }
    }
    const limit = timestamps.length < 3 ? 0.5 : 0.25;
    start = _limitValue(start, 0, limit);
    end = _limitValue(end, 0, limit);
    this._offsets = {
      start,
      end,
      factor: 1 / (start + 1 + end)
    };
  }
  _generate() {
    const adapter = this._adapter;
    const min = this.min;
    const max = this.max;
    const options = this.options;
    const timeOpts = options.time;
    const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
    const stepSize = valueOrDefault(options.ticks.stepSize, 1);
    const weekday = minor === "week" ? timeOpts.isoWeekday : false;
    const hasWeekday = isNumber(weekday) || weekday === true;
    const ticks = {};
    let first = min;
    let time, count;
    if (hasWeekday) {
      first = +adapter.startOf(first, "isoWeek", weekday);
    }
    first = +adapter.startOf(first, hasWeekday ? "day" : minor);
    if (adapter.diff(max, min, minor) > 1e5 * stepSize) {
      throw new Error(min + " and " + max + " are too far apart with stepSize of " + stepSize + " " + minor);
    }
    const timestamps = options.ticks.source === "data" && this.getDataTimestamps();
    for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
      addTick(ticks, time, timestamps);
    }
    if (time === max || options.bounds === "ticks" || count === 1) {
      addTick(ticks, time, timestamps);
    }
    return Object.keys(ticks).sort(sorter).map((x) => +x);
  }
  getLabelForValue(value) {
    const adapter = this._adapter;
    const timeOpts = this.options.time;
    if (timeOpts.tooltipFormat) {
      return adapter.format(value, timeOpts.tooltipFormat);
    }
    return adapter.format(value, timeOpts.displayFormats.datetime);
  }
  format(value, format) {
    const options = this.options;
    const formats = options.time.displayFormats;
    const unit = this._unit;
    const fmt = format || formats[unit];
    return this._adapter.format(value, fmt);
  }
  _tickFormatFunction(time, index, ticks, format) {
    const options = this.options;
    const formatter = options.ticks.callback;
    if (formatter) {
      return callback(formatter, [
        time,
        index,
        ticks
      ], this);
    }
    const formats = options.time.displayFormats;
    const unit = this._unit;
    const majorUnit = this._majorUnit;
    const minorFormat = unit && formats[unit];
    const majorFormat = majorUnit && formats[majorUnit];
    const tick = ticks[index];
    const major = majorUnit && majorFormat && tick && tick.major;
    return this._adapter.format(time, format || (major ? majorFormat : minorFormat));
  }
  generateTickLabels(ticks) {
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      tick.label = this._tickFormatFunction(tick.value, i, ticks);
    }
  }
  getDecimalForValue(value) {
    return value === null ? NaN : (value - this.min) / (this.max - this.min);
  }
  getPixelForValue(value) {
    const offsets = this._offsets;
    const pos = this.getDecimalForValue(value);
    return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return this.min + pos * (this.max - this.min);
  }
  _getLabelSize(label) {
    const ticksOpts = this.options.ticks;
    const tickLabelWidth = this.ctx.measureText(label).width;
    const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
    const cosRotation = Math.cos(angle);
    const sinRotation = Math.sin(angle);
    const tickFontSize = this._resolveTickFontOptions(0).size;
    return {
      w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
      h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
    };
  }
  _getLabelCapacity(exampleTime) {
    const timeOpts = this.options.time;
    const displayFormats = timeOpts.displayFormats;
    const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
    const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [
      exampleTime
    ], this._majorUnit), format);
    const size = this._getLabelSize(exampleLabel);
    const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
    return capacity > 0 ? capacity : 1;
  }
  getDataTimestamps() {
    let timestamps = this._cache.data || [];
    let i, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const metas = this.getMatchingVisibleMetas();
    if (this._normalized && metas.length) {
      return this._cache.data = metas[0].controller.getAllParsedValues(this);
    }
    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this));
    }
    return this._cache.data = this.normalize(timestamps);
  }
  getLabelTimestamps() {
    const timestamps = this._cache.labels || [];
    let i, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const labels = this.getLabels();
    for (i = 0, ilen = labels.length; i < ilen; ++i) {
      timestamps.push(parse(this, labels[i]));
    }
    return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
  }
  normalize(values) {
    return _arrayUnique(values.sort(sorter));
  }
};
function interpolate2(table, val, reverse) {
  let lo = 0;
  let hi = table.length - 1;
  let prevSource, nextSource, prevTarget, nextTarget;
  if (reverse) {
    if (val >= table[lo].pos && val <= table[hi].pos) {
      ({ lo, hi } = _lookupByKey(table, "pos", val));
    }
    ({ pos: prevSource, time: prevTarget } = table[lo]);
    ({ pos: nextSource, time: nextTarget } = table[hi]);
  } else {
    if (val >= table[lo].time && val <= table[hi].time) {
      ({ lo, hi } = _lookupByKey(table, "time", val));
    }
    ({ time: prevSource, pos: prevTarget } = table[lo]);
    ({ time: nextSource, pos: nextTarget } = table[hi]);
  }
  const span = nextSource - prevSource;
  return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
var TimeSeriesScale = class extends TimeScale {
  static id = "timeseries";
  static defaults = TimeScale.defaults;
  constructor(props) {
    super(props);
    this._table = [];
    this._minPos = void 0;
    this._tableRange = void 0;
  }
  initOffsets() {
    const timestamps = this._getTimestampsForTable();
    const table = this._table = this.buildLookupTable(timestamps);
    this._minPos = interpolate2(table, this.min);
    this._tableRange = interpolate2(table, this.max) - this._minPos;
    super.initOffsets(timestamps);
  }
  buildLookupTable(timestamps) {
    const { min, max } = this;
    const items = [];
    const table = [];
    let i, ilen, prev, curr, next;
    for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
      curr = timestamps[i];
      if (curr >= min && curr <= max) {
        items.push(curr);
      }
    }
    if (items.length < 2) {
      return [
        {
          time: min,
          pos: 0
        },
        {
          time: max,
          pos: 1
        }
      ];
    }
    for (i = 0, ilen = items.length; i < ilen; ++i) {
      next = items[i + 1];
      prev = items[i - 1];
      curr = items[i];
      if (Math.round((next + prev) / 2) !== curr) {
        table.push({
          time: curr,
          pos: i / (ilen - 1)
        });
      }
    }
    return table;
  }
  _generate() {
    const min = this.min;
    const max = this.max;
    let timestamps = super.getDataTimestamps();
    if (!timestamps.includes(min) || !timestamps.length) {
      timestamps.splice(0, 0, min);
    }
    if (!timestamps.includes(max) || timestamps.length === 1) {
      timestamps.push(max);
    }
    return timestamps.sort((a, b) => a - b);
  }
  _getTimestampsForTable() {
    let timestamps = this._cache.all || [];
    if (timestamps.length) {
      return timestamps;
    }
    const data = this.getDataTimestamps();
    const label = this.getLabelTimestamps();
    if (data.length && label.length) {
      timestamps = this.normalize(data.concat(label));
    } else {
      timestamps = data.length ? data : label;
    }
    timestamps = this._cache.all = timestamps;
    return timestamps;
  }
  getDecimalForValue(value) {
    return (interpolate2(this._table, value) - this._minPos) / this._tableRange;
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return interpolate2(this._table, decimal * this._tableRange + this._minPos, true);
  }
};

// node_modules/react-grid-layout/dist/chunk-76RTO6EO.mjs
function calcGridColWidth(positionParams) {
  const { margin, containerPadding, containerWidth, cols } = positionParams;
  return (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols;
}
function calcGridItemWHPx(gridUnits, colOrRowSize, marginPx) {
  if (!Number.isFinite(gridUnits)) return gridUnits;
  return Math.round(
    colOrRowSize * gridUnits + Math.max(0, gridUnits - 1) * marginPx
  );
}
function calcGridItemPosition(positionParams, x, y, w, h, dragPosition, resizePosition) {
  const { margin, containerPadding, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  let width;
  let height;
  let top;
  let left;
  if (resizePosition) {
    width = Math.round(resizePosition.width);
    height = Math.round(resizePosition.height);
  } else {
    width = calcGridItemWHPx(w, colWidth, margin[0]);
    height = calcGridItemWHPx(h, rowHeight, margin[1]);
  }
  if (dragPosition) {
    top = Math.round(dragPosition.top);
    left = Math.round(dragPosition.left);
  } else if (resizePosition) {
    top = Math.round(resizePosition.top);
    left = Math.round(resizePosition.left);
  } else {
    top = Math.round((rowHeight + margin[1]) * y + containerPadding[1]);
    left = Math.round((colWidth + margin[0]) * x + containerPadding[0]);
  }
  if (!dragPosition && !resizePosition) {
    if (Number.isFinite(w)) {
      const siblingLeft = Math.round(
        (colWidth + margin[0]) * (x + w) + containerPadding[0]
      );
      const actualMarginRight = siblingLeft - left - width;
      if (actualMarginRight !== margin[0]) {
        width += actualMarginRight - margin[0];
      }
    }
    if (Number.isFinite(h)) {
      const siblingTop = Math.round(
        (rowHeight + margin[1]) * (y + h) + containerPadding[1]
      );
      const actualMarginBottom = siblingTop - top - height;
      if (actualMarginBottom !== margin[1]) {
        height += actualMarginBottom - margin[1];
      }
    }
  }
  return { top, left, width, height };
}
function calcXY(positionParams, top, left, w, h) {
  const { margin, containerPadding, cols, rowHeight, maxRows } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  let x = Math.round((left - containerPadding[0]) / (colWidth + margin[0]));
  let y = Math.round((top - containerPadding[1]) / (rowHeight + margin[1]));
  x = clamp(x, 0, cols - w);
  y = clamp(y, 0, maxRows - h);
  return { x, y };
}
function calcXYRaw(positionParams, top, left) {
  const { margin, containerPadding, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  const x = Math.round((left - containerPadding[0]) / (colWidth + margin[0]));
  const y = Math.round((top - containerPadding[1]) / (rowHeight + margin[1]));
  return { x, y };
}
function calcWHRaw(positionParams, width, height) {
  const { margin, rowHeight } = positionParams;
  const colWidth = calcGridColWidth(positionParams);
  const w = Math.max(
    1,
    Math.round((width + margin[0]) / (colWidth + margin[0]))
  );
  const h = Math.max(
    1,
    Math.round((height + margin[1]) / (rowHeight + margin[1]))
  );
  return { w, h };
}
function clamp(num, lowerBound, upperBound) {
  return Math.max(Math.min(num, upperBound), lowerBound);
}
function collides(l1, l2) {
  if (l1.i === l2.i) return false;
  if (l1.x + l1.w <= l2.x) return false;
  if (l1.x >= l2.x + l2.w) return false;
  if (l1.y + l1.h <= l2.y) return false;
  if (l1.y >= l2.y + l2.h) return false;
  return true;
}
function getFirstCollision(layout, layoutItem) {
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0 && collides(item, layoutItem)) {
      return item;
    }
  }
  return void 0;
}
function getAllCollisions(layout, layoutItem) {
  return layout.filter((l) => collides(l, layoutItem));
}
function sortLayoutItems(layout, compactType) {
  if (compactType === "horizontal") {
    return sortLayoutItemsByColRow(layout);
  }
  if (compactType === "vertical") {
    return sortLayoutItemsByRowCol(layout);
  }
  if (compactType === "wrap") {
    return sortLayoutItemsByRowCol(layout);
  }
  return [...layout];
}
function sortLayoutItemsByRowCol(layout) {
  return [...layout].sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
}
function sortLayoutItemsByColRow(layout) {
  return [...layout].sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
}
function bottom(layout) {
  let max = 0;
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0) {
      const bottomY = item.y + item.h;
      if (bottomY > max) max = bottomY;
    }
  }
  return max;
}
function getLayoutItem(layout, id) {
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0 && item.i === id) {
      return item;
    }
  }
  return void 0;
}
function getStatics(layout) {
  return layout.filter((l) => l.static === true);
}
function cloneLayoutItem(layoutItem) {
  return {
    i: layoutItem.i,
    x: layoutItem.x,
    y: layoutItem.y,
    w: layoutItem.w,
    h: layoutItem.h,
    minW: layoutItem.minW,
    maxW: layoutItem.maxW,
    minH: layoutItem.minH,
    maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved),
    static: Boolean(layoutItem.static),
    isDraggable: layoutItem.isDraggable,
    isResizable: layoutItem.isResizable,
    resizeHandles: layoutItem.resizeHandles,
    constraints: layoutItem.constraints,
    isBounded: layoutItem.isBounded
  };
}
function cloneLayout(layout) {
  const newLayout = new Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0) {
      newLayout[i] = cloneLayoutItem(item);
    }
  }
  return newLayout;
}
function modifyLayout(layout, layoutItem) {
  const newLayout = new Array(layout.length);
  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    if (item !== void 0) {
      if (layoutItem.i === item.i) {
        newLayout[i] = layoutItem;
      } else {
        newLayout[i] = item;
      }
    }
  }
  return newLayout;
}
function withLayoutItem(layout, itemKey, cb) {
  let item = getLayoutItem(layout, itemKey);
  if (!item) {
    return [[...layout], null];
  }
  item = cb(cloneLayoutItem(item));
  const newLayout = modifyLayout(layout, item);
  return [newLayout, item];
}
function correctBounds(layout, bounds) {
  const collidesWith = getStatics(layout);
  for (let i = 0; i < layout.length; i++) {
    const l = layout[i];
    if (l === void 0) continue;
    if (l.x + l.w > bounds.cols) {
      l.x = bounds.cols - l.w;
    }
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) {
      collidesWith.push(l);
    } else {
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}
function moveElement(layout, l, x, y, isUserAction, preventCollision, compactType, cols, allowOverlap) {
  if (l.static && l.isDraggable !== true) {
    return [...layout];
  }
  if (l.y === y && l.x === x) {
    return [...layout];
  }
  const oldX = l.x;
  const oldY = l.y;
  if (typeof x === "number") l.x = x;
  if (typeof y === "number") l.y = y;
  l.moved = true;
  let sorted = sortLayoutItems(layout, compactType);
  const movingUp = compactType === "vertical" && typeof y === "number" ? oldY >= y : compactType === "horizontal" && typeof x === "number" ? oldX >= x : false;
  if (movingUp) {
    sorted = sorted.reverse();
  }
  const collisions = getAllCollisions(sorted, l);
  const hasCollisions = collisions.length > 0;
  if (hasCollisions && allowOverlap) {
    return cloneLayout(layout);
  }
  if (hasCollisions && preventCollision) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }
  let resultLayout = [...layout];
  for (let i = 0; i < collisions.length; i++) {
    const collision = collisions[i];
    if (collision === void 0) continue;
    if (collision.moved) continue;
    if (collision.static) {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        collision,
        l,
        isUserAction,
        compactType
      );
    } else {
      resultLayout = moveElementAwayFromCollision(
        resultLayout,
        l,
        collision,
        isUserAction,
        compactType
      );
    }
  }
  return resultLayout;
}
function moveElementAwayFromCollision(layout, collidesWith, itemToMove, isUserAction, compactType, cols) {
  const compactH = compactType === "horizontal";
  const compactV = compactType === "vertical";
  const preventCollision = collidesWith.static;
  if (isUserAction) {
    isUserAction = false;
    const fakeItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: "-1"
    };
    const firstCollision = getFirstCollision(layout, fakeItem);
    const collisionNorth = firstCollision !== void 0 && firstCollision.y + firstCollision.h > collidesWith.y;
    const collisionWest = firstCollision !== void 0 && collidesWith.x + collidesWith.w > firstCollision.x;
    if (!firstCollision) {
      return moveElement(
        layout,
        itemToMove,
        compactH ? fakeItem.x : void 0,
        compactV ? fakeItem.y : void 0,
        isUserAction,
        preventCollision,
        compactType
      );
    }
    if (collisionNorth && compactV) {
      return moveElement(
        layout,
        itemToMove,
        void 0,
        itemToMove.y + 1,
        isUserAction,
        preventCollision,
        compactType
      );
    }
    if (collisionNorth && compactType === null) {
      collidesWith.y = itemToMove.y;
      itemToMove.y = itemToMove.y + itemToMove.h;
      return [...layout];
    }
    if (collisionWest && compactH) {
      return moveElement(
        layout,
        collidesWith,
        itemToMove.x,
        void 0,
        isUserAction,
        preventCollision,
        compactType
      );
    }
  }
  const newX = compactH ? itemToMove.x + 1 : void 0;
  const newY = compactV ? itemToMove.y + 1 : void 0;
  if (newX === void 0 && newY === void 0) {
    return [...layout];
  }
  return moveElement(
    layout,
    itemToMove,
    newX,
    newY,
    isUserAction,
    preventCollision,
    compactType
  );
}

// node_modules/react-grid-layout/dist/chunk-KDANGDDL.mjs
function clamp2(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
var gridBounds = {
  name: "gridBounds",
  constrainPosition(item, x, y, { cols, maxRows }) {
    return {
      x: clamp2(x, 0, Math.max(0, cols - item.w)),
      y: clamp2(y, 0, Math.max(0, maxRows - item.h))
    };
  },
  constrainSize(item, w, h, handle, { cols, maxRows }) {
    const maxW = handle === "w" || handle === "nw" || handle === "sw" ? item.x + item.w : cols - item.x;
    const maxH = handle === "n" || handle === "nw" || handle === "ne" ? item.y + item.h : maxRows - item.y;
    return {
      w: clamp2(w, 1, Math.max(1, maxW)),
      h: clamp2(h, 1, Math.max(1, maxH))
    };
  }
};
var minMaxSize = {
  name: "minMaxSize",
  constrainSize(item, w, h) {
    return {
      w: clamp2(w, item.minW ?? 1, item.maxW ?? Infinity),
      h: clamp2(h, item.minH ?? 1, item.maxH ?? Infinity)
    };
  }
};
var containerBounds = {
  name: "containerBounds",
  constrainPosition(item, x, y, { cols, maxRows, containerHeight, rowHeight, margin }) {
    const visibleRows = containerHeight > 0 ? Math.floor((containerHeight + margin[1]) / (rowHeight + margin[1])) : maxRows;
    return {
      x: clamp2(x, 0, Math.max(0, cols - item.w)),
      y: clamp2(y, 0, Math.max(0, visibleRows - item.h))
    };
  }
};
var defaultConstraints = [gridBounds, minMaxSize];
function applyPositionConstraints(constraints, item, x, y, context) {
  let result = { x, y };
  for (const constraint of constraints) {
    if (constraint.constrainPosition) {
      result = constraint.constrainPosition(item, result.x, result.y, context);
    }
  }
  if (item.constraints) {
    for (const constraint of item.constraints) {
      if (constraint.constrainPosition) {
        result = constraint.constrainPosition(
          item,
          result.x,
          result.y,
          context
        );
      }
    }
  }
  return result;
}
function applySizeConstraints(constraints, item, w, h, handle, context) {
  let result = { w, h };
  for (const constraint of constraints) {
    if (constraint.constrainSize) {
      result = constraint.constrainSize(
        item,
        result.w,
        result.h,
        handle,
        context
      );
    }
  }
  if (item.constraints) {
    for (const constraint of item.constraints) {
      if (constraint.constrainSize) {
        result = constraint.constrainSize(
          item,
          result.w,
          result.h,
          handle,
          context
        );
      }
    }
  }
  return result;
}
function setTransform({
  top,
  left,
  width,
  height
}) {
  const translate = `translate(${left}px,${top}px)`;
  return {
    transform: translate,
    WebkitTransform: translate,
    MozTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}
function setTopLeft({
  top,
  left,
  width,
  height
}) {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute"
  };
}
function perc(num) {
  return num * 100 + "%";
}
function constrainWidth(left, currentWidth, newWidth, containerWidth) {
  return left + newWidth > containerWidth ? currentWidth : newWidth;
}
function constrainHeight(top, currentHeight, newHeight) {
  return top < 0 ? currentHeight : newHeight;
}
function constrainLeft(left) {
  return Math.max(0, left);
}
function constrainTop(top) {
  return Math.max(0, top);
}
var resizeNorth = (currentSize, newSize, _containerWidth) => {
  const { left, height, width } = newSize;
  const top = currentSize.top - (height - currentSize.height);
  return {
    left,
    width,
    height: constrainHeight(top, currentSize.height, height),
    top: constrainTop(top)
  };
};
var resizeEast = (currentSize, newSize, containerWidth) => {
  const { top, left, height, width } = newSize;
  return {
    top,
    height,
    width: constrainWidth(
      currentSize.left,
      currentSize.width,
      width,
      containerWidth
    ),
    left: constrainLeft(left)
  };
};
var resizeWest = (currentSize, newSize, _containerWidth) => {
  const { top, height, width } = newSize;
  const left = currentSize.left + currentSize.width - width;
  if (left < 0) {
    return {
      height,
      width: currentSize.left + currentSize.width,
      top: constrainTop(top),
      left: 0
    };
  }
  return {
    height,
    width,
    top: constrainTop(top),
    left
  };
};
var resizeSouth = (currentSize, newSize, _containerWidth) => {
  const { top, left, height, width } = newSize;
  return {
    width,
    left,
    height: constrainHeight(top, currentSize.height, height),
    top: constrainTop(top)
  };
};
var resizeNorthEast = (currentSize, newSize, containerWidth) => resizeNorth(
  currentSize,
  resizeEast(currentSize, newSize, containerWidth)
);
var resizeNorthWest = (currentSize, newSize, containerWidth) => resizeNorth(
  currentSize,
  resizeWest(currentSize, newSize)
);
var resizeSouthEast = (currentSize, newSize, containerWidth) => resizeSouth(
  currentSize,
  resizeEast(currentSize, newSize, containerWidth)
);
var resizeSouthWest = (currentSize, newSize, containerWidth) => resizeSouth(
  currentSize,
  resizeWest(currentSize, newSize)
);
var resizeHandlerMap = {
  n: resizeNorth,
  ne: resizeNorthEast,
  e: resizeEast,
  se: resizeSouthEast,
  s: resizeSouth,
  sw: resizeSouthWest,
  w: resizeWest,
  nw: resizeNorthWest
};
function resizeItemInDirection(direction, currentSize, newSize, containerWidth) {
  const handler = resizeHandlerMap[direction];
  if (!handler) {
    return newSize;
  }
  return handler(currentSize, { ...currentSize, ...newSize }, containerWidth);
}
var transformStrategy = {
  type: "transform",
  scale: 1,
  calcStyle(pos) {
    return setTransform(pos);
  }
};
var absoluteStrategy = {
  type: "absolute",
  scale: 1,
  calcStyle(pos) {
    return setTopLeft(pos);
  }
};
function createScaledStrategy(scale) {
  return {
    type: "transform",
    scale,
    calcStyle(pos) {
      return setTransform(pos);
    },
    calcDragPosition(clientX, clientY, offsetX, offsetY) {
      return {
        left: (clientX - offsetX) / scale,
        top: (clientY - offsetY) / scale
      };
    }
  };
}
var defaultPositionStrategy = transformStrategy;
var defaultGridConfig = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: null,
  maxRows: Infinity
};
var defaultDragConfig = {
  enabled: true,
  bounded: false,
  threshold: 3
};
var defaultResizeConfig = {
  enabled: true,
  handles: ["se"]
};
var defaultDropConfig = {
  enabled: false,
  defaultItem: { w: 1, h: 1 }
};
function resolveCompactionCollision(layout, item, moveToCoord, axis, hasStatics) {
  const sizeProp = axis === "x" ? "w" : "h";
  item[axis] += 1;
  const itemIndex = layout.findIndex((l) => l.i === item.i);
  const layoutHasStatics = hasStatics ?? getStatics(layout).length > 0;
  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    if (otherItem === void 0) continue;
    if (otherItem.static) continue;
    if (!layoutHasStatics && otherItem.y > item.y + item.h) break;
    if (collides(item, otherItem)) {
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProp],
        axis,
        layoutHasStatics
      );
    }
  }
  item[axis] = moveToCoord;
}
function compactItemVertical(compareWith, l, fullLayout, maxY) {
  l.x = Math.max(l.x, 0);
  l.y = Math.max(l.y, 0);
  l.y = Math.min(maxY, l.y);
  while (l.y > 0 && !getFirstCollision(compareWith, l)) {
    l.y--;
  }
  let collision;
  while ((collision = getFirstCollision(compareWith, l)) !== void 0) {
    resolveCompactionCollision(fullLayout, l, collision.y + collision.h, "y");
  }
  l.y = Math.max(l.y, 0);
  return l;
}
function compactItemHorizontal(compareWith, l, cols, fullLayout) {
  l.x = Math.max(l.x, 0);
  l.y = Math.max(l.y, 0);
  while (l.x > 0 && !getFirstCollision(compareWith, l)) {
    l.x--;
  }
  let collision;
  while ((collision = getFirstCollision(compareWith, l)) !== void 0) {
    resolveCompactionCollision(fullLayout, l, collision.x + collision.w, "x");
    if (l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
      while (l.x > 0 && !getFirstCollision(compareWith, l)) {
        l.x--;
      }
    }
  }
  l.x = Math.max(l.x, 0);
  return l;
}
var verticalCompactor = {
  type: "vertical",
  allowOverlap: false,
  compact(layout, _cols) {
    const compareWith = getStatics(layout);
    let maxY = bottom(compareWith);
    const sorted = sortLayoutItemsByRowCol(layout);
    const out = new Array(layout.length);
    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i];
      if (sortedItem === void 0) continue;
      let l = cloneLayoutItem(sortedItem);
      if (!l.static) {
        l = compactItemVertical(compareWith, l, sorted, maxY);
        maxY = Math.max(maxY, l.y + l.h);
        compareWith.push(l);
      }
      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
    }
    return out;
  }
};
var horizontalCompactor = {
  type: "horizontal",
  allowOverlap: false,
  compact(layout, cols) {
    const compareWith = getStatics(layout);
    const sorted = sortLayoutItemsByColRow(layout);
    const out = new Array(layout.length);
    for (let i = 0; i < sorted.length; i++) {
      const sortedItem = sorted[i];
      if (sortedItem === void 0) continue;
      let l = cloneLayoutItem(sortedItem);
      if (!l.static) {
        l = compactItemHorizontal(compareWith, l, cols, sorted);
        compareWith.push(l);
      }
      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
    }
    return out;
  }
};
var noCompactor = {
  type: null,
  allowOverlap: false,
  compact(layout, _cols) {
    return cloneLayout(layout);
  }
};
var verticalOverlapCompactor = {
  ...verticalCompactor,
  allowOverlap: true,
  compact(layout, _cols) {
    return cloneLayout(layout);
  }
};
var horizontalOverlapCompactor = {
  ...horizontalCompactor,
  allowOverlap: true,
  compact(layout, _cols) {
    return cloneLayout(layout);
  }
};
var noOverlapCompactor = {
  ...noCompactor,
  allowOverlap: true
};
function getCompactor(compactType, allowOverlap = false, preventCollision = false) {
  let baseCompactor;
  if (allowOverlap) {
    if (compactType === "vertical") baseCompactor = verticalOverlapCompactor;
    else if (compactType === "horizontal")
      baseCompactor = horizontalOverlapCompactor;
    else baseCompactor = noOverlapCompactor;
  } else {
    if (compactType === "vertical") baseCompactor = verticalCompactor;
    else if (compactType === "horizontal") baseCompactor = horizontalCompactor;
    else baseCompactor = noCompactor;
  }
  if (preventCollision) {
    return { ...baseCompactor, preventCollision };
  }
  return baseCompactor;
}
function sortBreakpoints(breakpoints) {
  const keys = Object.keys(breakpoints);
  return keys.sort((a, b) => breakpoints[a] - breakpoints[b]);
}
function getBreakpointFromWidth(breakpoints, width) {
  const sorted = sortBreakpoints(breakpoints);
  let matching = sorted[0];
  if (matching === void 0) {
    throw new Error("No breakpoints defined");
  }
  for (let i = 1; i < sorted.length; i++) {
    const breakpointName = sorted[i];
    if (breakpointName === void 0) continue;
    const breakpointWidth = breakpoints[breakpointName];
    if (width > breakpointWidth) {
      matching = breakpointName;
    }
  }
  return matching;
}
function getColsFromBreakpoint(breakpoint, cols) {
  const colCount = cols[breakpoint];
  if (colCount === void 0) {
    throw new Error(
      `ResponsiveReactGridLayout: \`cols\` entry for breakpoint ${String(breakpoint)} is missing!`
    );
  }
  return colCount;
}
function findOrGenerateResponsiveLayout(layouts2, breakpoints, breakpoint, lastBreakpoint, cols, compactTypeOrCompactor) {
  const existingLayout = layouts2[breakpoint];
  if (existingLayout) {
    return cloneLayout(existingLayout);
  }
  let layout = layouts2[lastBreakpoint];
  const breakpointsSorted = sortBreakpoints(breakpoints);
  const breakpointsAbove = breakpointsSorted.slice(
    breakpointsSorted.indexOf(breakpoint)
  );
  for (let i = 0; i < breakpointsAbove.length; i++) {
    const b = breakpointsAbove[i];
    if (b === void 0) continue;
    const layoutForBreakpoint = layouts2[b];
    if (layoutForBreakpoint) {
      layout = layoutForBreakpoint;
      break;
    }
  }
  const clonedLayout = cloneLayout(layout || []);
  const corrected = correctBounds(clonedLayout, { cols });
  const compactor = typeof compactTypeOrCompactor === "object" && compactTypeOrCompactor !== null ? compactTypeOrCompactor : getCompactor(compactTypeOrCompactor);
  return compactor.compact(corrected, cols);
}
function getIndentationValue(value, breakpoint) {
  if (Array.isArray(value)) {
    return value;
  }
  const breakpointMap = value;
  const breakpointValue = breakpointMap[breakpoint];
  if (breakpointValue !== void 0) {
    return breakpointValue;
  }
  const keys = Object.keys(breakpointMap);
  for (const key of keys) {
    const v = breakpointMap[key];
    if (v !== void 0) {
      return v;
    }
  }
  return [10, 10];
}

// node_modules/react-grid-layout/dist/chunk-WGL5FSZH.mjs
var import_react = __toESM(require_react(), 1);

// node_modules/react-draggable/build/cjs/chunk-D5BXCJ5G.mjs
var React2 = __toESM(require_react(), 1);
var import_prop_types = __toESM(require_prop_types(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);

// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var clsx_default = clsx;

// node_modules/react-draggable/build/cjs/chunk-D5BXCJ5G.mjs
var React3 = __toESM(require_react(), 1);
var import_prop_types2 = __toESM(require_prop_types(), 1);
var import_react_dom2 = __toESM(require_react_dom(), 1);
function findInArray(array, callback2) {
  for (let i = 0, length = array.length; i < length; i++) {
    if (callback2.apply(callback2, [array[i], i, array])) return array[i];
  }
}
function isFunction2(func) {
  return typeof func === "function" || Object.prototype.toString.call(func) === "[object Function]";
}
function isNum(num) {
  return typeof num === "number" && !isNaN(num);
}
function int(a) {
  return parseInt(a, 10);
}
function dontSetMe(props, propName, componentName) {
  if (props[propName]) {
    return new Error(`Invalid prop ${propName} passed to ${componentName} - do not set this, set it on the child.`);
  }
}
var prefixes = ["Moz", "Webkit", "O", "ms"];
function getPrefix(prop = "transform") {
  var _a, _b;
  if (typeof window === "undefined") return "";
  const style = (_b = (_a = window.document) == null ? void 0 : _a.documentElement) == null ? void 0 : _b.style;
  if (!style) return "";
  if (prop in style) return "";
  for (let i = 0; i < prefixes.length; i++) {
    if (browserPrefixToKey(prop, prefixes[i]) in style) return prefixes[i];
  }
  return "";
}
function browserPrefixToKey(prop, prefix) {
  return prefix ? `${prefix}${kebabToTitleCase(prop)}` : prop;
}
function kebabToTitleCase(str) {
  let out = "";
  let shouldCapitalize = true;
  for (let i = 0; i < str.length; i++) {
    if (shouldCapitalize) {
      out += str[i].toUpperCase();
      shouldCapitalize = false;
    } else if (str[i] === "-") {
      shouldCapitalize = true;
    } else {
      out += str[i];
    }
  }
  return out;
}
var getPrefix_default = getPrefix();
var matchesSelectorFunc = "";
function matchesSelector(el, selector) {
  var _a;
  if (!matchesSelectorFunc) {
    matchesSelectorFunc = (_a = findInArray([
      "matches",
      "webkitMatchesSelector",
      "mozMatchesSelector",
      "msMatchesSelector",
      "oMatchesSelector"
    ], function(method) {
      return isFunction2(el[method]);
    })) != null ? _a : "";
  }
  const matchFn = el[matchesSelectorFunc];
  if (!isFunction2(matchFn)) return false;
  return Boolean(matchFn.call(el, selector));
}
function matchesSelectorAndParentsTo(el, selector, baseNode) {
  let node = el;
  do {
    if (matchesSelector(node, selector)) return true;
    if (node === baseNode) return false;
    node = node.parentNode;
  } while (node);
  return false;
}
function addEvent(el, event, handler, inputOptions) {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  const listener = handler;
  if (el.addEventListener) {
    el.addEventListener(event, listener, options);
  } else if (el.attachEvent) {
    el.attachEvent("on" + event, listener);
  } else {
    el["on" + event] = listener;
  }
}
function removeEvent(el, event, handler, inputOptions) {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  const listener = handler;
  if (el.removeEventListener) {
    el.removeEventListener(event, listener, options);
  } else if (el.detachEvent) {
    el.detachEvent("on" + event, listener);
  } else {
    el["on" + event] = null;
  }
}
function outerHeight(node) {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  height += int(computedStyle.borderTopWidth);
  height += int(computedStyle.borderBottomWidth);
  return height;
}
function outerWidth(node) {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  width += int(computedStyle.borderLeftWidth);
  width += int(computedStyle.borderRightWidth);
  return width;
}
function innerHeight(node) {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  height -= int(computedStyle.paddingTop);
  height -= int(computedStyle.paddingBottom);
  return height;
}
function innerWidth(node) {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView.getComputedStyle(node);
  width -= int(computedStyle.paddingLeft);
  width -= int(computedStyle.paddingRight);
  return width;
}
function offsetXYFromParent(evt, offsetParent, scale) {
  const isBody = offsetParent === offsetParent.ownerDocument.body;
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();
  const x = (evt.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale;
  const y = (evt.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale;
  return { x, y };
}
function createCSSTransform(controlPos, positionOffset) {
  const translation = getTranslation(controlPos, positionOffset, "px");
  return { [browserPrefixToKey("transform", getPrefix_default)]: translation };
}
function createSVGTransform(controlPos, positionOffset) {
  const translation = getTranslation(controlPos, positionOffset, "");
  return translation;
}
function getTranslation({ x, y }, positionOffset, unitSuffix) {
  let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`;
  if (positionOffset) {
    const defaultX = `${typeof positionOffset.x === "string" ? positionOffset.x : positionOffset.x + unitSuffix}`;
    const defaultY = `${typeof positionOffset.y === "string" ? positionOffset.y : positionOffset.y + unitSuffix}`;
    translation = `translate(${defaultX}, ${defaultY})` + translation;
  }
  return translation;
}
function getTouch(e, identifier) {
  return e.targetTouches && findInArray(e.targetTouches, (t) => identifier === t.identifier) || e.changedTouches && findInArray(e.changedTouches, (t) => identifier === t.identifier);
}
function getTouchIdentifier(e) {
  if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
}
function addUserSelectStyles(doc) {
  if (!doc) return;
  let styleEl = doc.getElementById("react-draggable-style-el");
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.type = "text/css";
    styleEl.id = "react-draggable-style-el";
    styleEl.innerHTML = ".react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n";
    styleEl.innerHTML += ".react-draggable-transparent-selection *::selection {all: inherit;}\n";
    doc.getElementsByTagName("head")[0].appendChild(styleEl);
  }
  if (doc.body) addClassName(doc.body, "react-draggable-transparent-selection");
}
function scheduleRemoveUserSelectStyles(doc) {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => {
      removeUserSelectStyles(doc);
    });
  } else {
    removeUserSelectStyles(doc);
  }
}
function removeUserSelectStyles(doc) {
  if (!doc) return;
  try {
    if (doc.body) removeClassName(doc.body, "react-draggable-transparent-selection");
    const ieSelection = doc.selection;
    if (ieSelection) {
      ieSelection.empty();
    } else {
      const selection = (doc.defaultView || window).getSelection();
      if (selection && selection.type !== "Caret") {
        selection.removeAllRanges();
      }
    }
  } catch {
  }
}
function addClassName(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    if (!el.className.match(new RegExp(`(?:^|\\s)${className}(?!\\S)`))) {
      el.className += ` ${className}`;
    }
  }
}
function removeClassName(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`, "g"), "");
  }
}
function getBoundPosition(draggable, x, y) {
  if (!draggable.props.bounds) return [x, y];
  let { bounds } = draggable.props;
  bounds = typeof bounds === "string" ? bounds : cloneBounds(bounds);
  const node = findDOMNode(draggable);
  if (typeof bounds === "string") {
    const { ownerDocument } = node;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) {
      throw new Error("Cannot resolve the owner window of the draggable node.");
    }
    let boundNode;
    if (bounds === "parent") {
      boundNode = node.parentNode;
    } else {
      const rootNode = node.getRootNode();
      boundNode = rootNode.querySelector(bounds);
    }
    if (!(boundNode instanceof ownerWindow.HTMLElement)) {
      throw new Error('Bounds selector "' + bounds + '" could not find an element.');
    }
    const boundNodeEl = boundNode;
    const nodeStyle = ownerWindow.getComputedStyle(node);
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNodeEl);
    bounds = {
      left: -node.offsetLeft + int(boundNodeStyle.paddingLeft) + int(nodeStyle.marginLeft),
      top: -node.offsetTop + int(boundNodeStyle.paddingTop) + int(nodeStyle.marginTop),
      right: innerWidth(boundNodeEl) - outerWidth(node) - node.offsetLeft + int(boundNodeStyle.paddingRight) - int(nodeStyle.marginRight),
      bottom: innerHeight(boundNodeEl) - outerHeight(node) - node.offsetTop + int(boundNodeStyle.paddingBottom) - int(nodeStyle.marginBottom)
    };
  }
  if (isNum(bounds.right)) x = Math.min(x, bounds.right);
  if (isNum(bounds.bottom)) y = Math.min(y, bounds.bottom);
  if (isNum(bounds.left)) x = Math.max(x, bounds.left);
  if (isNum(bounds.top)) y = Math.max(y, bounds.top);
  return [x, y];
}
function snapToGrid(grid, pendingX, pendingY) {
  const x = Math.round(pendingX / grid[0]) * grid[0];
  const y = Math.round(pendingY / grid[1]) * grid[1];
  return [x, y];
}
function canDragX(draggable) {
  return draggable.props.axis === "both" || draggable.props.axis === "x";
}
function canDragY(draggable) {
  return draggable.props.axis === "both" || draggable.props.axis === "y";
}
function getControlPosition(e, touchIdentifier, draggableCore) {
  const touchObj = typeof touchIdentifier === "number" ? getTouch(e, touchIdentifier) : null;
  if (typeof touchIdentifier === "number" && !touchObj) return null;
  const node = findDOMNode(draggableCore);
  const offsetParent = draggableCore.props.offsetParent || node.offsetParent || node.ownerDocument.body;
  return offsetXYFromParent(touchObj || e, offsetParent, draggableCore.props.scale);
}
function createCoreData(draggable, x, y) {
  const isStart = !isNum(draggable.lastX);
  const node = findDOMNode(draggable);
  if (isStart) {
    return {
      node,
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x,
      y
    };
  } else {
    return {
      node,
      deltaX: x - draggable.lastX,
      deltaY: y - draggable.lastY,
      lastX: draggable.lastX,
      lastY: draggable.lastY,
      x,
      y
    };
  }
}
function createDraggableData(draggable, coreData) {
  const scale = draggable.props.scale;
  return {
    node: coreData.node,
    x: draggable.state.x + coreData.deltaX / scale,
    y: draggable.state.y + coreData.deltaY / scale,
    deltaX: coreData.deltaX / scale,
    deltaY: coreData.deltaY / scale,
    lastX: draggable.state.x,
    lastY: draggable.state.y
  };
}
function cloneBounds(bounds) {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom
  };
}
function findDOMNode(draggable) {
  const node = draggable.findDOMNode();
  if (!node) {
    throw new Error("<DraggableCore>: Unmounted during event!");
  }
  return node;
}
function log(...args) {
  if (process.env.DRAGGABLE_DEBUG) console.log(...args);
}
var eventsFor = {
  touch: {
    start: "touchstart",
    move: "touchmove",
    stop: "touchend"
  },
  mouse: {
    start: "mousedown",
    move: "mousemove",
    stop: "mouseup"
  }
};
var dragEventFor = eventsFor.mouse;
var DraggableCore = class extends React3.Component {
  constructor() {
    super(...arguments);
    this.dragging = false;
    this.lastX = NaN;
    this.lastY = NaN;
    this.touchIdentifier = null;
    this.mounted = false;
    this.handleDragStart = (e) => {
      this.props.onMouseDown(e);
      if (!this.props.allowAnyClick && (typeof e.button === "number" && e.button !== 0 || e.ctrlKey)) return false;
      const thisNode = this.findDOMNode();
      if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
        throw new Error("<DraggableCore> not mounted on DragStart!");
      }
      const { ownerDocument } = thisNode;
      if (this.props.disabled || !(e.target instanceof ownerDocument.defaultView.Node) || this.props.handle && !matchesSelectorAndParentsTo(e.target, this.props.handle, thisNode) || this.props.cancel && matchesSelectorAndParentsTo(e.target, this.props.cancel, thisNode)) {
        return;
      }
      if (e.type === "touchstart" && !this.props.allowMobileScroll) e.preventDefault();
      const touchIdentifier = getTouchIdentifier(e);
      this.touchIdentifier = touchIdentifier;
      const position = getControlPosition(e, touchIdentifier, this);
      if (position == null) return;
      const { x, y } = position;
      const coreEvent = createCoreData(this, x, y);
      log("DraggableCore: handleDragStart: %j", coreEvent);
      log("calling", this.props.onStart);
      const shouldUpdate = this.props.onStart(e, coreEvent);
      if (shouldUpdate === false || this.mounted === false) return;
      if (this.props.enableUserSelectHack) addUserSelectStyles(ownerDocument);
      this.dragging = true;
      this.lastX = x;
      this.lastY = y;
      addEvent(ownerDocument, dragEventFor.move, this.handleDrag);
      addEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
    };
    this.handleDrag = (e) => {
      const position = getControlPosition(e, this.touchIdentifier, this);
      if (position == null) return;
      let { x, y } = position;
      if (Array.isArray(this.props.grid)) {
        let deltaX = x - this.lastX, deltaY = y - this.lastY;
        [deltaX, deltaY] = snapToGrid(this.props.grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = this.lastX + deltaX;
        y = this.lastY + deltaY;
      }
      const coreEvent = createCoreData(this, x, y);
      log("DraggableCore: handleDrag: %j", coreEvent);
      const shouldUpdate = this.props.onDrag(e, coreEvent);
      if (shouldUpdate === false || this.mounted === false) {
        try {
          this.handleDragStop(new MouseEvent("mouseup"));
        } catch {
          const event = document.createEvent("MouseEvents");
          event.initMouseEvent("mouseup", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          this.handleDragStop(event);
        }
        return;
      }
      this.lastX = x;
      this.lastY = y;
    };
    this.handleDragStop = (e) => {
      if (!this.dragging) return;
      const position = getControlPosition(e, this.touchIdentifier, this);
      if (position == null) return;
      let { x, y } = position;
      if (Array.isArray(this.props.grid)) {
        let deltaX = x - this.lastX || 0;
        let deltaY = y - this.lastY || 0;
        [deltaX, deltaY] = snapToGrid(this.props.grid, deltaX, deltaY);
        x = this.lastX + deltaX;
        y = this.lastY + deltaY;
      }
      const coreEvent = createCoreData(this, x, y);
      const shouldContinue = this.props.onStop(e, coreEvent);
      if (shouldContinue === false || this.mounted === false) return false;
      const thisNode = this.findDOMNode();
      if (thisNode) {
        if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles(thisNode.ownerDocument);
      }
      log("DraggableCore: handleDragStop: %j", coreEvent);
      this.dragging = false;
      this.lastX = NaN;
      this.lastY = NaN;
      if (thisNode) {
        log("DraggableCore: Removing handlers");
        removeEvent(thisNode.ownerDocument, dragEventFor.move, this.handleDrag);
        removeEvent(thisNode.ownerDocument, dragEventFor.stop, this.handleDragStop);
      }
    };
    this.onMouseDown = (e) => {
      dragEventFor = eventsFor.mouse;
      return this.handleDragStart(e);
    };
    this.onMouseUp = (e) => {
      dragEventFor = eventsFor.mouse;
      return this.handleDragStop(e);
    };
    this.onTouchStart = (e) => {
      dragEventFor = eventsFor.touch;
      return this.handleDragStart(e);
    };
    this.onTouchEnd = (e) => {
      dragEventFor = eventsFor.touch;
      return this.handleDragStop(e);
    };
  }
  componentDidMount() {
    this.mounted = true;
    const thisNode = this.findDOMNode();
    if (thisNode) {
      addEvent(thisNode, eventsFor.touch.start, this.onTouchStart, { passive: false });
    }
  }
  componentWillUnmount() {
    this.mounted = false;
    const thisNode = this.findDOMNode();
    if (thisNode) {
      const { ownerDocument } = thisNode;
      removeEvent(ownerDocument, eventsFor.mouse.move, this.handleDrag);
      removeEvent(ownerDocument, eventsFor.touch.move, this.handleDrag);
      removeEvent(ownerDocument, eventsFor.mouse.stop, this.handleDragStop);
      removeEvent(ownerDocument, eventsFor.touch.stop, this.handleDragStop);
      removeEvent(thisNode, eventsFor.touch.start, this.onTouchStart, { passive: false });
      if (this.props.enableUserSelectHack) scheduleRemoveUserSelectStyles(ownerDocument);
    }
  }
  // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
  // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
  findDOMNode() {
    var _a;
    if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
      return this.props.nodeRef.current;
    }
    const legacyReactDOM = import_react_dom2.default;
    if (typeof legacyReactDOM.findDOMNode === "function") {
      return legacyReactDOM.findDOMNode(this);
    }
    log(
      "react-draggable: ReactDOM.findDOMNode is not available in React 19+. You must provide a nodeRef prop. See: https://github.com/react-grid-layout/react-draggable#noderef"
    );
    return null;
  }
  render() {
    return React3.cloneElement(React3.Children.only(this.props.children), {
      // Note: mouseMove handler is attached to document so it will still function
      // when the user drags quickly and leaves the bounds of the element.
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      // onTouchStart is added on `componentDidMount` so they can be added with
      // {passive: false}, which allows it to cancel. See
      // https://developers.google.com/web/updates/2017/01/scrolling-intervention
      onTouchEnd: this.onTouchEnd
    });
  }
};
DraggableCore.displayName = "DraggableCore";
DraggableCore.propTypes = {
  /**
   * `allowAnyClick` allows dragging using any mouse button.
   * By default, we only accept the left button.
   *
   * Defaults to `false`.
   */
  allowAnyClick: import_prop_types2.default.bool,
  /**
   * `allowMobileScroll` turns off cancellation of the 'touchstart' event
   * on mobile devices. Only enable this if you are having trouble with click
   * events. Prefer using 'handle' / 'cancel' instead.
   *
   * Defaults to `false`.
   */
  allowMobileScroll: import_prop_types2.default.bool,
  children: import_prop_types2.default.node.isRequired,
  /**
   * `disabled`, if true, stops the <Draggable> from dragging. All handlers,
   * with the exception of `onMouseDown`, will not fire.
   */
  disabled: import_prop_types2.default.bool,
  /**
   * By default, we add 'user-select:none' attributes to the document body
   * to prevent ugly text selection during drag. If this is causing problems
   * for your app, set this to `false`.
   */
  enableUserSelectHack: import_prop_types2.default.bool,
  /**
   * `offsetParent`, if set, uses the passed DOM node to compute drag offsets
   * instead of using the parent node.
   */
  offsetParent: function(props, propName) {
    if (props[propName] && props[propName].nodeType !== 1) {
      throw new Error("Draggable's offsetParent must be a DOM Node.");
    }
  },
  /**
   * `grid` specifies the x and y that dragging should snap to.
   */
  grid: import_prop_types2.default.arrayOf(import_prop_types2.default.number),
  /**
   * `handle` specifies a selector to be used as the handle that initiates drag.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *         return (
   *            <Draggable handle=".handle">
   *              <div>
   *                  <div className="handle">Click me to drag</div>
   *                  <div>This is some other content</div>
   *              </div>
   *           </Draggable>
   *         );
   *       }
   *   });
   * ```
   */
  handle: import_prop_types2.default.string,
  /**
   * `cancel` specifies a selector to be used to prevent drag initialization.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *           return(
   *               <Draggable cancel=".cancel">
   *                   <div>
   *                     <div className="cancel">You can't drag from here</div>
   *                     <div>Dragging here works fine</div>
   *                   </div>
   *               </Draggable>
   *           );
   *       }
   *   });
   * ```
   */
  cancel: import_prop_types2.default.string,
  /* If running in React Strict mode, ReactDOM.findDOMNode() is deprecated.
   * Unfortunately, in order for <Draggable> to work properly, we need raw access
   * to the underlying DOM node. If you want to avoid the warning, pass a `nodeRef`
   * as in this example:
   *
   * function MyComponent() {
   *   const nodeRef = React.useRef(null);
   *   return (
   *     <Draggable nodeRef={nodeRef}>
   *       <div ref={nodeRef}>Example Target</div>
   *     </Draggable>
   *   );
   * }
   *
   * This can be used for arbitrarily nested components, so long as the ref ends up
   * pointing to the actual child DOM node and not a custom component.
   */
  nodeRef: import_prop_types2.default.object,
  /**
   * Called when dragging starts.
   * If this function returns the boolean false, dragging will be canceled.
   */
  onStart: import_prop_types2.default.func,
  /**
   * Called while dragging.
   * If this function returns the boolean false, dragging will be canceled.
   */
  onDrag: import_prop_types2.default.func,
  /**
   * Called when dragging stops.
   * If this function returns the boolean false, the drag will remain active.
   */
  onStop: import_prop_types2.default.func,
  /**
   * A workaround option which can be passed if onMouseDown needs to be accessed,
   * since it'll always be blocked (as there is internal use of onMouseDown)
   */
  onMouseDown: import_prop_types2.default.func,
  /**
   * `scale`, if set, applies scaling while dragging an element
   */
  scale: import_prop_types2.default.number,
  /**
   * These properties should be defined on the child, not here.
   */
  className: dontSetMe,
  style: dontSetMe,
  transform: dontSetMe
};
DraggableCore.defaultProps = {
  allowAnyClick: false,
  // by default only accept left click
  allowMobileScroll: false,
  disabled: false,
  enableUserSelectHack: true,
  onStart: function() {
  },
  onDrag: function() {
  },
  onStop: function() {
  },
  onMouseDown: function() {
  },
  scale: 1
};
var Draggable = class extends React2.Component {
  constructor(props) {
    super(props);
    this.onDragStart = (e, coreData) => {
      log("Draggable: onDragStart: %j", coreData);
      const shouldStart = this.props.onStart(e, createDraggableData(this, coreData));
      if (shouldStart === false) return false;
      this.setState({ dragging: true, dragged: true });
    };
    this.onDrag = (e, coreData) => {
      if (!this.state.dragging) return false;
      log("Draggable: onDrag: %j", coreData);
      const uiData = createDraggableData(this, coreData);
      const newState = {
        x: uiData.x,
        y: uiData.y,
        slackX: 0,
        slackY: 0
      };
      if (this.props.bounds) {
        const { x, y } = newState;
        newState.x += this.state.slackX;
        newState.y += this.state.slackY;
        const [newStateX, newStateY] = getBoundPosition(this, newState.x, newState.y);
        newState.x = newStateX;
        newState.y = newStateY;
        newState.slackX = this.state.slackX + (x - newState.x);
        newState.slackY = this.state.slackY + (y - newState.y);
        uiData.x = newState.x;
        uiData.y = newState.y;
        uiData.deltaX = newState.x - this.state.x;
        uiData.deltaY = newState.y - this.state.y;
      }
      const shouldUpdate = this.props.onDrag(e, uiData);
      if (shouldUpdate === false) return false;
      this.setState(newState);
    };
    this.onDragStop = (e, coreData) => {
      if (!this.state.dragging) return false;
      const shouldContinue = this.props.onStop(e, createDraggableData(this, coreData));
      if (shouldContinue === false) return false;
      log("Draggable: onDragStop: %j", coreData);
      const newState = {
        dragging: false,
        slackX: 0,
        slackY: 0
      };
      const controlled = Boolean(this.props.position);
      if (controlled) {
        const { x, y } = this.props.position;
        newState.x = x;
        newState.y = y;
      }
      this.setState(newState);
    };
    this.state = {
      // Whether or not we are currently dragging.
      dragging: false,
      // Whether or not we have been dragged before.
      dragged: false,
      // Current transform x and y.
      x: props.position ? props.position.x : props.defaultPosition.x,
      y: props.position ? props.position.y : props.defaultPosition.y,
      prevPropsPosition: { ...props.position },
      // Used for compensating for out-of-bounds drags
      slackX: 0,
      slackY: 0,
      // Can only determine if SVG after mounting
      isElementSVG: false
    };
    if (props.position && !(props.onDrag || props.onStop)) {
      console.warn("A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element.");
    }
  }
  // React 16.3+
  // Arity (props, state)
  static getDerivedStateFromProps({ position }, { prevPropsPosition }) {
    if (position && (!prevPropsPosition || position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y)) {
      log("Draggable: getDerivedStateFromProps %j", { position, prevPropsPosition });
      return {
        x: position.x,
        y: position.y,
        prevPropsPosition: { ...position }
      };
    }
    return null;
  }
  componentDidMount() {
    if (typeof window.SVGElement !== "undefined" && this.findDOMNode() instanceof window.SVGElement) {
      this.setState({ isElementSVG: true });
    }
  }
  componentWillUnmount() {
    if (this.state.dragging) {
      this.setState({ dragging: false });
    }
  }
  // React 19 removed ReactDOM.findDOMNode, so nodeRef is now required.
  // For backward compatibility with React 18 and earlier, we still support findDOMNode if available.
  findDOMNode() {
    var _a;
    if ((_a = this.props) == null ? void 0 : _a.nodeRef) {
      return this.props.nodeRef.current;
    }
    const legacyReactDOM = import_react_dom.default;
    if (typeof legacyReactDOM.findDOMNode === "function") {
      return legacyReactDOM.findDOMNode(this);
    }
    return null;
  }
  render() {
    const {
      axis,
      bounds,
      children,
      defaultPosition,
      defaultClassName,
      defaultClassNameDragging,
      defaultClassNameDragged,
      position,
      positionOffset,
      scale,
      ...draggableCoreProps
    } = this.props;
    let style = {};
    let svgTransform = null;
    const controlled = Boolean(position);
    const draggable = !controlled || this.state.dragging;
    const validPosition = position || defaultPosition;
    const transformOpts = {
      // Set left if horizontal drag is enabled
      x: canDragX(this) && draggable ? this.state.x : validPosition.x,
      // Set top if vertical drag is enabled
      y: canDragY(this) && draggable ? this.state.y : validPosition.y
    };
    if (this.state.isElementSVG) {
      svgTransform = createSVGTransform(transformOpts, positionOffset);
    } else {
      style = createCSSTransform(transformOpts, positionOffset);
    }
    const onlyChild = React2.Children.only(children);
    const className = clsx(onlyChild.props.className || "", defaultClassName, {
      [defaultClassNameDragging]: this.state.dragging,
      [defaultClassNameDragged]: this.state.dragged
    });
    return /* @__PURE__ */ React2.createElement(DraggableCore, { ...draggableCoreProps, onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop }, React2.cloneElement(onlyChild, {
      className,
      style: { ...onlyChild.props.style, ...style },
      transform: svgTransform
    }));
  }
};
Draggable.displayName = "Draggable";
Draggable.propTypes = {
  // Accepts all props <DraggableCore> accepts.
  ...DraggableCore.propTypes,
  /**
   * `axis` determines which axis the draggable can move.
   *
   *  Note that all callbacks will still return data as normal. This only
   *  controls flushing to the DOM.
   *
   * 'both' allows movement horizontally and vertically.
   * 'x' limits movement to horizontal axis.
   * 'y' limits movement to vertical axis.
   * 'none' limits all movement.
   *
   * Defaults to 'both'.
   */
  axis: import_prop_types.default.oneOf(["both", "x", "y", "none"]),
  /**
   * `bounds` determines the range of movement available to the element.
   * Available values are:
   *
   * 'parent' restricts movement within the Draggable's parent node.
   *
   * Alternatively, pass an object with the following properties, all of which are optional:
   *
   * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
   *
   * All values are in px.
   *
   * Example:
   *
   * ```jsx
   *   let App = React.createClass({
   *       render: function () {
   *         return (
   *            <Draggable bounds={{right: 300, bottom: 300}}>
   *              <div>Content</div>
   *           </Draggable>
   *         );
   *       }
   *   });
   * ```
   */
  bounds: import_prop_types.default.oneOfType([
    import_prop_types.default.shape({
      left: import_prop_types.default.number,
      right: import_prop_types.default.number,
      top: import_prop_types.default.number,
      bottom: import_prop_types.default.number
    }),
    import_prop_types.default.string,
    import_prop_types.default.oneOf([false])
  ]),
  defaultClassName: import_prop_types.default.string,
  defaultClassNameDragging: import_prop_types.default.string,
  defaultClassNameDragged: import_prop_types.default.string,
  /**
   * `defaultPosition` specifies the x and y that the dragged item should start at
   *
   * Example:
   *
   * ```jsx
   *      let App = React.createClass({
   *          render: function () {
   *              return (
   *                  <Draggable defaultPosition={{x: 25, y: 25}}>
   *                      <div>I start with transformX: 25px and transformY: 25px;</div>
   *                  </Draggable>
   *              );
   *          }
   *      });
   * ```
   */
  defaultPosition: import_prop_types.default.shape({
    x: import_prop_types.default.number,
    y: import_prop_types.default.number
  }),
  positionOffset: import_prop_types.default.shape({
    x: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string]),
    y: import_prop_types.default.oneOfType([import_prop_types.default.number, import_prop_types.default.string])
  }),
  /**
   * `position`, if present, defines the current position of the element.
   *
   *  This is similar to how form elements in React work - if no `position` is supplied, the component
   *  is uncontrolled.
   *
   * Example:
   *
   * ```jsx
   *      let App = React.createClass({
   *          render: function () {
   *              return (
   *                  <Draggable position={{x: 25, y: 25}}>
   *                      <div>I start with transformX: 25px and transformY: 25px;</div>
   *                  </Draggable>
   *              );
   *          }
   *      });
   * ```
   */
  position: import_prop_types.default.shape({
    x: import_prop_types.default.number,
    y: import_prop_types.default.number
  }),
  /**
   * These properties should be defined on the child, not here.
   */
  className: dontSetMe,
  style: dontSetMe,
  transform: dontSetMe
};
Draggable.defaultProps = {
  ...DraggableCore.defaultProps,
  axis: "both",
  bounds: false,
  defaultClassName: "react-draggable",
  defaultClassNameDragging: "react-draggable-dragging",
  defaultClassNameDragged: "react-draggable-dragged",
  defaultPosition: { x: 0, y: 0 },
  scale: 1
};

// node_modules/react-grid-layout/dist/chunk-WGL5FSZH.mjs
var import_react_resizable = __toESM(require_react_resizable(), 1);
var import_jsx_runtime = __toESM(require_react_jsx_runtime(), 1);
var import_fast_equals = __toESM(require_fast_equals(), 1);
function GridItem(props) {
  const {
    children,
    cols,
    containerWidth,
    margin,
    containerPadding,
    rowHeight,
    maxRows,
    isDraggable,
    isResizable,
    isBounded,
    static: isStatic,
    useCSSTransforms = true,
    usePercentages = false,
    transformScale = 1,
    positionStrategy,
    dragThreshold = 0,
    droppingPosition,
    className = "",
    style,
    handle = "",
    cancel = "",
    x,
    y,
    w,
    h,
    minW = 1,
    maxW = Infinity,
    minH = 1,
    maxH = Infinity,
    i,
    resizeHandles,
    resizeHandle,
    constraints = defaultConstraints,
    layoutItem,
    layout = [],
    onDragStart: onDragStartProp,
    onDrag: onDragProp,
    onDragStop: onDragStopProp,
    onResizeStart: onResizeStartProp,
    onResize: onResizeProp,
    onResizeStop: onResizeStopProp
  } = props;
  const [dragging, setDragging] = (0, import_react.useState)(false);
  const [resizing, setResizing] = (0, import_react.useState)(false);
  const elementRef = (0, import_react.useRef)(null);
  const dragPositionRef = (0, import_react.useRef)({ left: 0, top: 0 });
  const resizePositionRef = (0, import_react.useRef)({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });
  const prevDroppingPositionRef = (0, import_react.useRef)(
    void 0
  );
  const layoutRef = (0, import_react.useRef)(layout);
  layoutRef.current = layout;
  const onDragStartRef = (0, import_react.useRef)(null);
  const onDragRef = (0, import_react.useRef)(null);
  const dragPendingRef = (0, import_react.useRef)(false);
  const initialDragClientRef = (0, import_react.useRef)({ x: 0, y: 0 });
  const thresholdExceededRef = (0, import_react.useRef)(false);
  const positionParams = (0, import_react.useMemo)(
    () => ({
      cols,
      containerPadding,
      containerWidth,
      margin,
      maxRows,
      rowHeight
    }),
    [cols, containerPadding, containerWidth, margin, maxRows, rowHeight]
  );
  const constraintContext = (0, import_react.useMemo)(
    () => ({
      cols,
      maxRows,
      containerWidth,
      containerHeight: 0,
      // Auto-height grids don't have a fixed container height
      rowHeight,
      margin,
      // Use empty layout here - the actual layout will be accessed via layoutRef when needed
      // This prevents the context from changing when layout changes, avoiding callback recreation
      layout: []
    }),
    [cols, maxRows, containerWidth, rowHeight, margin]
  );
  const getConstraintContext = (0, import_react.useCallback)(
    () => ({
      ...constraintContext,
      layout: layoutRef.current
    }),
    [constraintContext]
  );
  const effectiveLayoutItem = (0, import_react.useMemo)(
    () => layoutItem ?? {
      i,
      x,
      y,
      w,
      h,
      minW,
      maxW,
      minH,
      maxH
    },
    [layoutItem, i, x, y, w, h, minW, maxW, minH, maxH]
  );
  const createStyle = (0, import_react.useCallback)(
    (pos2) => {
      if (positionStrategy?.calcStyle) {
        return positionStrategy.calcStyle(pos2);
      }
      if (useCSSTransforms) {
        return setTransform(pos2);
      }
      const styleObj = setTopLeft(pos2);
      if (usePercentages) {
        return {
          ...styleObj,
          left: perc(pos2.left / containerWidth),
          width: perc(pos2.width / containerWidth)
        };
      }
      return styleObj;
    },
    [positionStrategy, useCSSTransforms, usePercentages, containerWidth]
  );
  const onDragStart = (0, import_react.useCallback)(
    (e, { node }) => {
      if (!onDragStartProp) return;
      const { offsetParent } = node;
      if (!offsetParent) return;
      const parentRect = offsetParent.getBoundingClientRect();
      const clientRect = node.getBoundingClientRect();
      const cLeft = clientRect.left / transformScale;
      const pLeft = parentRect.left / transformScale;
      const cTop = clientRect.top / transformScale;
      const pTop = parentRect.top / transformScale;
      let newPosition;
      if (positionStrategy?.calcDragPosition) {
        const mouseEvent = e;
        newPosition = positionStrategy.calcDragPosition(
          mouseEvent.clientX,
          mouseEvent.clientY,
          mouseEvent.clientX - clientRect.left,
          mouseEvent.clientY - clientRect.top
        );
      } else {
        newPosition = {
          left: cLeft - pLeft + offsetParent.scrollLeft,
          top: cTop - pTop + offsetParent.scrollTop
        };
      }
      dragPositionRef.current = newPosition;
      if (dragThreshold > 0) {
        const mouseEvent = e;
        initialDragClientRef.current = {
          x: mouseEvent.clientX,
          y: mouseEvent.clientY
        };
        dragPendingRef.current = true;
        thresholdExceededRef.current = false;
        setDragging(true);
        return;
      }
      setDragging(true);
      const rawPos = calcXYRaw(
        positionParams,
        newPosition.top,
        newPosition.left
      );
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        getConstraintContext()
      );
      onDragStartProp(i, newX, newY, {
        e,
        node,
        newPosition
      });
    },
    [
      onDragStartProp,
      transformScale,
      positionParams,
      positionStrategy,
      dragThreshold,
      constraints,
      effectiveLayoutItem,
      getConstraintContext,
      i
    ]
  );
  const onDrag = (0, import_react.useCallback)(
    (e, { node, deltaX, deltaY }) => {
      if (!onDragProp || !dragging) return;
      const mouseEvent = e;
      if (dragPendingRef.current && !thresholdExceededRef.current) {
        const dx = mouseEvent.clientX - initialDragClientRef.current.x;
        const dy = mouseEvent.clientY - initialDragClientRef.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance < dragThreshold) {
          return;
        }
        thresholdExceededRef.current = true;
        dragPendingRef.current = false;
        if (onDragStartProp) {
          const rawPos2 = calcXYRaw(
            positionParams,
            dragPositionRef.current.top,
            dragPositionRef.current.left
          );
          const { x: startX, y: startY } = applyPositionConstraints(
            constraints,
            effectiveLayoutItem,
            rawPos2.x,
            rawPos2.y,
            getConstraintContext()
          );
          onDragStartProp(i, startX, startY, {
            e,
            node,
            newPosition: dragPositionRef.current
          });
        }
      }
      let top = dragPositionRef.current.top + deltaY;
      let left = dragPositionRef.current.left + deltaX;
      if (isBounded) {
        const { offsetParent } = node;
        if (offsetParent) {
          const bottomBoundary = offsetParent.clientHeight - calcGridItemWHPx(h, rowHeight, margin[1]);
          top = clamp(top, 0, bottomBoundary);
          const colWidth2 = calcGridColWidth(positionParams);
          const rightBoundary = containerWidth - calcGridItemWHPx(w, colWidth2, margin[0]);
          left = clamp(left, 0, rightBoundary);
        }
      }
      const newPosition = { top, left };
      dragPositionRef.current = newPosition;
      const rawPos = calcXYRaw(positionParams, top, left);
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        getConstraintContext()
      );
      onDragProp(i, newX, newY, {
        e,
        node,
        newPosition
      });
    },
    [
      onDragProp,
      onDragStartProp,
      dragging,
      dragThreshold,
      isBounded,
      h,
      rowHeight,
      margin,
      positionParams,
      containerWidth,
      w,
      i,
      constraints,
      effectiveLayoutItem,
      getConstraintContext
    ]
  );
  const onDragStop = (0, import_react.useCallback)(
    (e, { node }) => {
      if (!onDragStopProp || !dragging) return;
      const wasPending = dragPendingRef.current;
      dragPendingRef.current = false;
      thresholdExceededRef.current = false;
      initialDragClientRef.current = { x: 0, y: 0 };
      if (wasPending) {
        setDragging(false);
        dragPositionRef.current = { left: 0, top: 0 };
        return;
      }
      const { left, top } = dragPositionRef.current;
      const newPosition = { top, left };
      setDragging(false);
      dragPositionRef.current = { left: 0, top: 0 };
      const rawPos = calcXYRaw(positionParams, top, left);
      const { x: newX, y: newY } = applyPositionConstraints(
        constraints,
        effectiveLayoutItem,
        rawPos.x,
        rawPos.y,
        getConstraintContext()
      );
      onDragStopProp(i, newX, newY, {
        e,
        node,
        newPosition
      });
    },
    [
      onDragStopProp,
      dragging,
      positionParams,
      constraints,
      effectiveLayoutItem,
      getConstraintContext,
      i
    ]
  );
  onDragStartRef.current = onDragStart;
  onDragRef.current = onDrag;
  const onResizeHandler = (0, import_react.useCallback)(
    (e, { node, size, handle: resizeHandle2 }, position, handlerName) => {
      const handler = handlerName === "onResizeStart" ? onResizeStartProp : handlerName === "onResize" ? onResizeProp : onResizeStopProp;
      if (!handler) return;
      let updatedSize;
      if (node) {
        updatedSize = resizeItemInDirection(
          resizeHandle2,
          position,
          size,
          containerWidth
        );
      } else {
        updatedSize = {
          ...size,
          top: position.top,
          left: position.left
        };
      }
      resizePositionRef.current = updatedSize;
      const rawSize = calcWHRaw(
        positionParams,
        updatedSize.width,
        updatedSize.height
      );
      const { w: newW, h: newH } = applySizeConstraints(
        constraints,
        effectiveLayoutItem,
        rawSize.w,
        rawSize.h,
        resizeHandle2,
        getConstraintContext()
      );
      handler(i, newW, newH, {
        e: e.nativeEvent,
        node,
        size: updatedSize,
        handle: resizeHandle2
      });
    },
    [
      onResizeStartProp,
      onResizeProp,
      onResizeStopProp,
      containerWidth,
      positionParams,
      i,
      constraints,
      effectiveLayoutItem,
      getConstraintContext
    ]
  );
  const handleResizeStart = (0, import_react.useCallback)(
    (e, data) => {
      setResizing(true);
      const pos2 = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData = {
        ...data,
        handle: data.handle
      };
      onResizeHandler(e, typedData, pos2, "onResizeStart");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );
  const handleResize = (0, import_react.useCallback)(
    (e, data) => {
      const pos2 = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData = {
        ...data,
        handle: data.handle
      };
      onResizeHandler(e, typedData, pos2, "onResize");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );
  const handleResizeStop = (0, import_react.useCallback)(
    (e, data) => {
      setResizing(false);
      resizePositionRef.current = { top: 0, left: 0, width: 0, height: 0 };
      const pos2 = calcGridItemPosition(positionParams, x, y, w, h);
      const typedData = {
        ...data,
        handle: data.handle
      };
      onResizeHandler(e, typedData, pos2, "onResizeStop");
    },
    [onResizeHandler, positionParams, x, y, w, h]
  );
  (0, import_react.useEffect)(() => {
    if (!droppingPosition) return;
    const node = elementRef.current;
    if (!node) return;
    const prevDroppingPosition = prevDroppingPositionRef.current || {
      left: 0,
      top: 0
    };
    const shouldDrag = dragging && (droppingPosition.left !== prevDroppingPosition.left || droppingPosition.top !== prevDroppingPosition.top);
    if (!dragging) {
      const fakeData = {
        node,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top,
        lastX: 0,
        lastY: 0,
        x: droppingPosition.left,
        y: droppingPosition.top
      };
      onDragStartRef.current?.(
        droppingPosition.e,
        fakeData
      );
    } else if (shouldDrag) {
      const deltaX = droppingPosition.left - dragPositionRef.current.left;
      const deltaY = droppingPosition.top - dragPositionRef.current.top;
      const fakeData = {
        node,
        deltaX,
        deltaY,
        lastX: dragPositionRef.current.left,
        lastY: dragPositionRef.current.top,
        x: droppingPosition.left,
        y: droppingPosition.top
      };
      onDragRef.current?.(
        droppingPosition.e,
        fakeData
      );
    }
    prevDroppingPositionRef.current = droppingPosition;
  }, [droppingPosition, dragging, i]);
  const pos = calcGridItemPosition(
    positionParams,
    x,
    y,
    w,
    h,
    dragging ? dragPositionRef.current : null,
    resizing ? resizePositionRef.current : null
  );
  const child = import_react.default.Children.only(children);
  const colWidth = calcGridColWidth(positionParams);
  const minConstraints = [
    calcGridItemWHPx(minW, colWidth, margin[0]),
    calcGridItemWHPx(minH, rowHeight, margin[1])
  ];
  const maxConstraints = [
    calcGridItemWHPx(maxW, colWidth, margin[0]),
    calcGridItemWHPx(maxH, rowHeight, margin[1])
  ];
  const childProps = child.props;
  const childClassName = childProps["className"];
  const childStyle = childProps["style"];
  let newChild = import_react.default.cloneElement(child, {
    ref: elementRef,
    className: clsx_default("react-grid-item", childClassName, className, {
      static: isStatic,
      resizing,
      "react-draggable": isDraggable,
      "react-draggable-dragging": dragging,
      dropping: Boolean(droppingPosition),
      cssTransforms: useCSSTransforms
    }),
    style: {
      ...style,
      ...childStyle,
      ...createStyle(pos)
    }
  });
  const resizableHandle = resizeHandle;
  newChild = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_react_resizable.Resizable,
    {
      draggableOpts: { disabled: !isResizable },
      className: isResizable ? void 0 : "react-resizable-hide",
      width: pos.width,
      height: pos.height,
      minConstraints,
      maxConstraints,
      onResizeStart: handleResizeStart,
      onResize: handleResize,
      onResizeStop: handleResizeStop,
      transformScale,
      resizeHandles,
      handle: resizableHandle,
      children: newChild
    }
  );
  newChild = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    DraggableCore,
    {
      disabled: !isDraggable,
      onStart: onDragStart,
      onDrag,
      onStop: onDragStop,
      handle,
      cancel: ".react-resizable-handle" + (cancel ? "," + cancel : ""),
      scale: transformScale,
      nodeRef: elementRef,
      children: newChild
    }
  );
  return newChild;
}
var noop2 = () => {
};
var layoutClassName = "react-grid-layout";
var isFirefox = false;
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch {
}
function childrenEqual(a, b) {
  const aArr = import_react.default.Children.toArray(a);
  const bArr = import_react.default.Children.toArray(b);
  if (aArr.length !== bArr.length) return false;
  for (let i = 0; i < aArr.length; i++) {
    const aChild = aArr[i];
    const bChild = bArr[i];
    if (aChild?.key !== bChild?.key) return false;
  }
  return true;
}
function synchronizeLayoutWithChildren(initialLayout, children, cols, compactor) {
  const layout = [];
  const childKeys = /* @__PURE__ */ new Set();
  import_react.default.Children.forEach(children, (child) => {
    if (!import_react.default.isValidElement(child) || child.key === null) return;
    const key = String(child.key);
    childKeys.add(key);
    const existingItem = initialLayout.find((l) => l.i === key);
    if (existingItem) {
      layout.push(cloneLayoutItem(existingItem));
    } else {
      const childProps = child.props;
      const dataGrid = childProps["data-grid"];
      if (dataGrid) {
        layout.push({
          i: key,
          x: dataGrid.x ?? 0,
          y: dataGrid.y ?? 0,
          w: dataGrid.w ?? 1,
          h: dataGrid.h ?? 1,
          minW: dataGrid.minW,
          maxW: dataGrid.maxW,
          minH: dataGrid.minH,
          maxH: dataGrid.maxH,
          static: dataGrid.static,
          isDraggable: dataGrid.isDraggable,
          isResizable: dataGrid.isResizable,
          resizeHandles: dataGrid.resizeHandles,
          isBounded: dataGrid.isBounded
        });
      } else {
        layout.push({
          i: key,
          x: 0,
          y: bottom(layout),
          w: 1,
          h: 1
        });
      }
    }
  });
  const corrected = correctBounds(layout, { cols });
  return compactor.compact(corrected, cols);
}
function GridLayout(props) {
  const {
    // Required
    children,
    width,
    // Composable config interfaces
    gridConfig: gridConfigProp,
    dragConfig: dragConfigProp,
    resizeConfig: resizeConfigProp,
    dropConfig: dropConfigProp,
    positionStrategy = defaultPositionStrategy,
    compactor: compactorProp,
    constraints = defaultConstraints,
    // Layout data
    layout: propsLayout = [],
    droppingItem: droppingItemProp,
    // Container props
    autoSize = true,
    className = "",
    style = {},
    innerRef,
    // Callbacks
    onLayoutChange = noop2,
    onDragStart: onDragStartProp = noop2,
    onDrag: onDragProp = noop2,
    onDragStop: onDragStopProp = noop2,
    onResizeStart: onResizeStartProp = noop2,
    onResize: onResizeProp = noop2,
    onResizeStop: onResizeStopProp = noop2,
    onDrop: onDropProp = noop2,
    onDropDragOver: onDropDragOverProp = noop2
  } = props;
  const gridConfig = (0, import_react.useMemo)(
    () => ({ ...defaultGridConfig, ...gridConfigProp }),
    [gridConfigProp]
  );
  const dragConfig = (0, import_react.useMemo)(
    () => ({ ...defaultDragConfig, ...dragConfigProp }),
    [dragConfigProp]
  );
  const resizeConfig = (0, import_react.useMemo)(
    () => ({ ...defaultResizeConfig, ...resizeConfigProp }),
    [resizeConfigProp]
  );
  const dropConfig = (0, import_react.useMemo)(
    () => ({ ...defaultDropConfig, ...dropConfigProp }),
    [dropConfigProp]
  );
  const { cols, rowHeight, maxRows, margin, containerPadding } = gridConfig;
  const {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel,
    threshold: dragThreshold
  } = dragConfig;
  const {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  } = resizeConfig;
  const {
    enabled: isDroppable,
    defaultItem: defaultDropItem,
    onDragOver: dropConfigOnDragOver
  } = dropConfig;
  const compactor = compactorProp ?? getCompactor("vertical");
  const compactType = compactor.type;
  const allowOverlap = compactor.allowOverlap;
  const preventCollision = compactor.preventCollision ?? false;
  const droppingItem = (0, import_react.useMemo)(
    () => droppingItemProp ?? {
      i: "__dropping-elem__",
      ...defaultDropItem
    },
    [droppingItemProp, defaultDropItem]
  );
  const useCSSTransforms = positionStrategy.type === "transform";
  const transformScale = positionStrategy.scale;
  const effectiveContainerPadding = containerPadding ?? margin;
  const [mounted, setMounted] = (0, import_react.useState)(false);
  const [layout, setLayout] = (0, import_react.useState)(
    () => synchronizeLayoutWithChildren(propsLayout, children, cols, compactor)
  );
  const [activeDrag, setActiveDrag] = (0, import_react.useState)(null);
  const [resizing, setResizing] = (0, import_react.useState)(false);
  const [droppingDOMNode, setDroppingDOMNode] = (0, import_react.useState)(
    null
  );
  const [droppingPosition, setDroppingPosition] = (0, import_react.useState)();
  const oldDragItemRef = (0, import_react.useRef)(null);
  const oldResizeItemRef = (0, import_react.useRef)(null);
  const oldLayoutRef = (0, import_react.useRef)(null);
  const dragEnterCounterRef = (0, import_react.useRef)(0);
  const prevLayoutRef = (0, import_react.useRef)(layout);
  const prevPropsLayoutRef = (0, import_react.useRef)(propsLayout);
  const prevChildrenRef = (0, import_react.useRef)(children);
  const prevCompactTypeRef = (0, import_react.useRef)(compactType);
  const layoutRef = (0, import_react.useRef)(layout);
  layoutRef.current = layout;
  (0, import_react.useEffect)(() => {
    setMounted(true);
    if (!(0, import_fast_equals.deepEqual)(layout, propsLayout)) {
      onLayoutChange(layout);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    if (activeDrag) return;
    if (droppingDOMNode) return;
    const layoutChanged = !(0, import_fast_equals.deepEqual)(propsLayout, prevPropsLayoutRef.current);
    const childrenChanged = !childrenEqual(children, prevChildrenRef.current);
    const compactTypeChanged = compactType !== prevCompactTypeRef.current;
    if (layoutChanged || childrenChanged || compactTypeChanged) {
      const baseLayout = layoutChanged ? propsLayout : layout;
      const newLayout = synchronizeLayoutWithChildren(
        baseLayout,
        children,
        cols,
        compactor
      );
      if (!(0, import_fast_equals.deepEqual)(newLayout, layout)) {
        setLayout(newLayout);
      }
    }
    prevPropsLayoutRef.current = propsLayout;
    prevChildrenRef.current = children;
    prevCompactTypeRef.current = compactType;
  }, [
    propsLayout,
    children,
    cols,
    compactType,
    compactor,
    activeDrag,
    droppingDOMNode,
    layout
  ]);
  (0, import_react.useEffect)(() => {
    if (!activeDrag && !(0, import_fast_equals.deepEqual)(layout, prevLayoutRef.current)) {
      prevLayoutRef.current = layout;
      const publicLayout = layout.filter((l) => l.i !== droppingItem.i);
      onLayoutChange(publicLayout);
    }
  }, [layout, activeDrag, onLayoutChange, droppingItem.i]);
  const containerHeight = (0, import_react.useMemo)(() => {
    if (!autoSize) return void 0;
    const nbRow = bottom(layout);
    const containerPaddingY = effectiveContainerPadding[1];
    return nbRow * rowHeight + (nbRow - 1) * margin[1] + containerPaddingY * 2 + "px";
  }, [autoSize, layout, rowHeight, margin, effectiveContainerPadding]);
  const onDragStart = (0, import_react.useCallback)(
    (i, _x, _y, data) => {
      const currentLayout = layoutRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };
      oldDragItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = currentLayout;
      setActiveDrag(placeholder);
      onDragStartProp(currentLayout, l, l, null, data.e, data.node);
    },
    [onDragStartProp]
  );
  const onDrag = (0, import_react.useCallback)(
    (i, x, y, data) => {
      const currentLayout = layoutRef.current;
      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i
      };
      const newLayout = moveElement(
        currentLayout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );
      onDragProp(newLayout, oldDragItem, l, placeholder, data.e, data.node);
      setLayout(compactor.compact(newLayout, cols));
      setActiveDrag(placeholder);
    },
    [preventCollision, compactType, cols, allowOverlap, compactor, onDragProp]
  );
  const onDragStop = (0, import_react.useCallback)(
    (i, x, y, data) => {
      if (!activeDrag) return;
      const currentLayout = layoutRef.current;
      const oldDragItem = oldDragItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      const newLayout = moveElement(
        currentLayout,
        l,
        x,
        y,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap
      );
      const finalLayout = compactor.compact(newLayout, cols);
      onDragStopProp(finalLayout, oldDragItem, l, null, data.e, data.node);
      const oldLayout = oldLayoutRef.current;
      oldDragItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setLayout(finalLayout);
      if (oldLayout && !(0, import_fast_equals.deepEqual)(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [
      activeDrag,
      preventCollision,
      compactType,
      cols,
      allowOverlap,
      compactor,
      onDragStopProp,
      onLayoutChange
    ]
  );
  const onResizeStart = (0, import_react.useCallback)(
    (i, _w, _h, data) => {
      const currentLayout = layoutRef.current;
      const l = getLayoutItem(currentLayout, i);
      if (!l) return;
      oldResizeItemRef.current = cloneLayoutItem(l);
      oldLayoutRef.current = currentLayout;
      setResizing(true);
      onResizeStartProp(currentLayout, l, l, null, data.e, data.node);
    },
    [onResizeStartProp]
  );
  const onResize = (0, import_react.useCallback)(
    (i, w, h, data) => {
      const currentLayout = layoutRef.current;
      const oldResizeItem = oldResizeItemRef.current;
      const { handle } = data;
      let shouldMoveItem = false;
      let newX;
      let newY;
      const [newLayout, l] = withLayoutItem(currentLayout, i, (item) => {
        newX = item.x;
        newY = item.y;
        if (["sw", "w", "nw", "n", "ne"].includes(handle)) {
          if (["sw", "nw", "w"].includes(handle)) {
            newX = item.x + (item.w - w);
            w = item.x !== newX && newX < 0 ? item.w : w;
            newX = newX < 0 ? 0 : newX;
          }
          if (["ne", "n", "nw"].includes(handle)) {
            newY = item.y + (item.h - h);
            h = item.y !== newY && newY < 0 ? item.h : h;
            newY = newY < 0 ? 0 : newY;
          }
          shouldMoveItem = true;
        }
        if (preventCollision && !allowOverlap) {
          const collisions = getAllCollisions(currentLayout, {
            ...item,
            w,
            h,
            x: newX ?? item.x,
            y: newY ?? item.y
          }).filter((layoutItem) => layoutItem.i !== item.i);
          if (collisions.length > 0) {
            newY = item.y;
            h = item.h;
            newX = item.x;
            w = item.w;
            shouldMoveItem = false;
          }
        }
        item.w = w;
        item.h = h;
        return item;
      });
      if (!l) return;
      let finalLayout = newLayout;
      if (shouldMoveItem && newX !== void 0 && newY !== void 0) {
        finalLayout = moveElement(
          newLayout,
          l,
          newX,
          newY,
          true,
          preventCollision,
          compactType,
          cols,
          allowOverlap
        );
      }
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        i,
        static: true
      };
      onResizeProp(
        finalLayout,
        oldResizeItem,
        l,
        placeholder,
        data.e,
        data.node
      );
      setLayout(compactor.compact(finalLayout, cols));
      setActiveDrag(placeholder);
    },
    [preventCollision, compactType, cols, allowOverlap, compactor, onResizeProp]
  );
  const onResizeStop = (0, import_react.useCallback)(
    (i, _w, _h, data) => {
      const currentLayout = layoutRef.current;
      const oldResizeItem = oldResizeItemRef.current;
      const l = getLayoutItem(currentLayout, i);
      const finalLayout = compactor.compact(currentLayout, cols);
      onResizeStopProp(
        finalLayout,
        oldResizeItem,
        l ?? null,
        null,
        data.e,
        data.node
      );
      const oldLayout = oldLayoutRef.current;
      oldResizeItemRef.current = null;
      oldLayoutRef.current = null;
      setActiveDrag(null);
      setResizing(false);
      setLayout(finalLayout);
      if (oldLayout && !(0, import_fast_equals.deepEqual)(oldLayout, finalLayout)) {
        onLayoutChange(finalLayout);
      }
    },
    [cols, compactor, onResizeStopProp, onLayoutChange]
  );
  const removeDroppingPlaceholder = (0, import_react.useCallback)(() => {
    const currentLayout = layoutRef.current;
    const hasDroppingItem = currentLayout.some((l) => l.i === droppingItem.i);
    if (!hasDroppingItem) {
      setDroppingDOMNode(null);
      setActiveDrag(null);
      setDroppingPosition(void 0);
      return;
    }
    const newLayout = compactor.compact(
      currentLayout.filter((l) => l.i !== droppingItem.i),
      cols
    );
    setLayout(newLayout);
    setDroppingDOMNode(null);
    setActiveDrag(null);
    setDroppingPosition(void 0);
  }, [droppingItem.i, cols, compactor]);
  const handleDragOver = (0, import_react.useCallback)(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isFirefox && !e.nativeEvent.target?.classList.contains(
        layoutClassName
      )) {
        return false;
      }
      const rawResult = dropConfigOnDragOver ? dropConfigOnDragOver(e.nativeEvent) : onDropDragOverProp(e);
      if (rawResult === false) {
        if (droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return false;
      }
      const {
        dragOffsetX = 0,
        dragOffsetY = 0,
        ...onDragOverResult
      } = rawResult ?? {};
      const finalDroppingItem = { ...droppingItem, ...onDragOverResult };
      const gridRect = e.currentTarget.getBoundingClientRect();
      const positionParams = {
        cols,
        margin,
        maxRows,
        rowHeight,
        containerWidth: width,
        containerPadding: effectiveContainerPadding
      };
      const actualColWidth = calcGridColWidth(positionParams);
      const itemPixelWidth = calcGridItemWHPx(
        finalDroppingItem.w,
        actualColWidth,
        margin[0]
      );
      const itemPixelHeight = calcGridItemWHPx(
        finalDroppingItem.h,
        rowHeight,
        margin[1]
      );
      const itemCenterOffsetX = itemPixelWidth / 2;
      const itemCenterOffsetY = itemPixelHeight / 2;
      const rawGridX = e.clientX - gridRect.left + dragOffsetX - itemCenterOffsetX;
      const rawGridY = e.clientY - gridRect.top + dragOffsetY - itemCenterOffsetY;
      const clampedGridX = Math.max(0, rawGridX);
      const clampedGridY = Math.max(0, rawGridY);
      const newDroppingPosition = {
        left: clampedGridX / transformScale,
        top: clampedGridY / transformScale,
        e: e.nativeEvent
      };
      if (!droppingDOMNode) {
        const calculatedPosition = calcXY(
          positionParams,
          clampedGridY,
          clampedGridX,
          finalDroppingItem.w,
          finalDroppingItem.h
        );
        setDroppingDOMNode(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, finalDroppingItem.i));
        setDroppingPosition(newDroppingPosition);
        const baseLayout = layoutRef.current.filter(
          (l) => l.i !== finalDroppingItem.i
        );
        setLayout([
          ...baseLayout,
          {
            ...finalDroppingItem,
            x: calculatedPosition.x,
            y: calculatedPosition.y,
            static: false,
            isDraggable: true
          }
        ]);
      } else if (droppingPosition) {
        const shouldUpdate = droppingPosition.left !== newDroppingPosition.left || droppingPosition.top !== newDroppingPosition.top;
        if (shouldUpdate) {
          setDroppingPosition(newDroppingPosition);
        }
      }
    },
    [
      droppingDOMNode,
      droppingPosition,
      droppingItem,
      dropConfigOnDragOver,
      onDropDragOverProp,
      removeDroppingPlaceholder,
      transformScale,
      cols,
      margin,
      maxRows,
      rowHeight,
      width,
      effectiveContainerPadding
    ]
  );
  const handleDragLeave = (0, import_react.useCallback)(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounterRef.current--;
      if (dragEnterCounterRef.current < 0) {
        dragEnterCounterRef.current = 0;
      }
      if (dragEnterCounterRef.current === 0) {
        removeDroppingPlaceholder();
      }
    },
    [removeDroppingPlaceholder]
  );
  const handleDragEnter = (0, import_react.useCallback)((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounterRef.current++;
  }, []);
  const handleDrop = (0, import_react.useCallback)(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentLayout = layoutRef.current;
      const item = currentLayout.find((l) => l.i === droppingItem.i);
      dragEnterCounterRef.current = 0;
      removeDroppingPlaceholder();
      onDropProp(currentLayout, item, e.nativeEvent);
    },
    [droppingItem.i, removeDroppingPlaceholder, onDropProp]
  );
  const processGridItem = (0, import_react.useCallback)(
    (child, isDroppingItem) => {
      if (!child || !child.key) return null;
      const l = getLayoutItem(layout, String(child.key));
      if (!l) return null;
      const draggable = typeof l.isDraggable === "boolean" ? l.isDraggable : !l.static && isDraggable;
      const resizable = typeof l.isResizable === "boolean" ? l.isResizable : !l.static && isResizable;
      const resizeHandlesOptions = l.resizeHandles || [...resizeHandles];
      const bounded = draggable && isBounded && l.isBounded !== false;
      const resizeHandleElement = resizeHandle;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        GridItem,
        {
          containerWidth: width,
          cols,
          margin,
          containerPadding: effectiveContainerPadding,
          maxRows,
          rowHeight,
          cancel: draggableCancel,
          handle: draggableHandle,
          onDragStart,
          onDrag,
          onDragStop,
          onResizeStart,
          onResize,
          onResizeStop,
          isDraggable: draggable,
          isResizable: resizable,
          isBounded: bounded,
          useCSSTransforms: useCSSTransforms && mounted,
          usePercentages: !mounted,
          transformScale,
          positionStrategy,
          dragThreshold,
          w: l.w,
          h: l.h,
          x: l.x,
          y: l.y,
          i: l.i,
          minH: l.minH,
          minW: l.minW,
          maxH: l.maxH,
          maxW: l.maxW,
          static: l.static,
          droppingPosition: isDroppingItem ? droppingPosition : void 0,
          resizeHandles: resizeHandlesOptions,
          resizeHandle: resizeHandleElement,
          constraints,
          layoutItem: l,
          layout,
          children: child
        },
        l.i
      );
    },
    [
      layout,
      width,
      cols,
      margin,
      effectiveContainerPadding,
      maxRows,
      rowHeight,
      draggableCancel,
      draggableHandle,
      onDragStart,
      onDrag,
      onDragStop,
      onResizeStart,
      onResize,
      onResizeStop,
      isDraggable,
      isResizable,
      isBounded,
      useCSSTransforms,
      mounted,
      transformScale,
      positionStrategy,
      dragThreshold,
      droppingPosition,
      resizeHandles,
      resizeHandle,
      constraints
    ]
  );
  const renderPlaceholder = () => {
    if (!activeDrag) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      GridItem,
      {
        w: activeDrag.w,
        h: activeDrag.h,
        x: activeDrag.x,
        y: activeDrag.y,
        i: activeDrag.i,
        className: `react-grid-placeholder ${resizing ? "placeholder-resizing" : ""}`,
        containerWidth: width,
        cols,
        margin,
        containerPadding: effectiveContainerPadding,
        maxRows,
        rowHeight,
        isDraggable: false,
        isResizable: false,
        isBounded: false,
        useCSSTransforms,
        transformScale,
        constraints,
        layout,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})
      }
    );
  };
  const mergedClassName = clsx_default(layoutClassName, className);
  const mergedStyle = {
    height: containerHeight,
    ...style
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      ref: innerRef,
      className: mergedClassName,
      style: mergedStyle,
      onDrop: isDroppable ? handleDrop : void 0,
      onDragLeave: isDroppable ? handleDragLeave : void 0,
      onDragEnter: isDroppable ? handleDragEnter : void 0,
      onDragOver: isDroppable ? handleDragOver : void 0,
      children: [
        import_react.default.Children.map(children, (child) => {
          if (!import_react.default.isValidElement(child)) return null;
          return processGridItem(child);
        }),
        isDroppable && droppingDOMNode && processGridItem(droppingDOMNode, true),
        renderPlaceholder()
      ]
    }
  );
}
var DEFAULT_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};
var DEFAULT_COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};
var noop22 = () => {
};
function synchronizeLayoutWithChildren2(initialLayout, children, cols, compactor) {
  const layout = [];
  import_react.default.Children.forEach(children, (child) => {
    if (!import_react.default.isValidElement(child) || child.key === null) return;
    const key = String(child.key);
    const existingItem = initialLayout.find((l) => l.i === key);
    if (existingItem) {
      layout.push({
        ...existingItem,
        i: key
      });
    } else {
      const childProps = child.props;
      const dataGrid = childProps["data-grid"];
      if (dataGrid) {
        layout.push({
          i: key,
          x: dataGrid.x ?? 0,
          y: dataGrid.y ?? 0,
          w: dataGrid.w ?? 1,
          h: dataGrid.h ?? 1,
          minW: dataGrid.minW,
          maxW: dataGrid.maxW,
          minH: dataGrid.minH,
          maxH: dataGrid.maxH,
          static: dataGrid.static,
          isDraggable: dataGrid.isDraggable,
          isResizable: dataGrid.isResizable,
          resizeHandles: dataGrid.resizeHandles,
          isBounded: dataGrid.isBounded
        });
      } else {
        layout.push({
          i: key,
          x: 0,
          y: bottom(layout),
          w: 1,
          h: 1
        });
      }
    }
  });
  const corrected = correctBounds(layout, { cols });
  return compactor.compact(corrected, cols);
}
function ResponsiveGridLayout(props) {
  const {
    children,
    width,
    breakpoint: propBreakpoint,
    breakpoints = DEFAULT_BREAKPOINTS,
    cols: colsConfig = DEFAULT_COLS,
    layouts: propsLayouts = {},
    rowHeight = 150,
    maxRows = Infinity,
    margin: propMargin = [10, 10],
    containerPadding: propContainerPadding = null,
    compactor: compactorProp,
    onBreakpointChange = noop22,
    onLayoutChange = noop22,
    onWidthChange = noop22,
    ...restProps
  } = props;
  const compactor = compactorProp ?? getCompactor("vertical");
  const compactType = compactor.type;
  const allowOverlap = compactor.allowOverlap;
  const initialBreakpoint = (0, import_react.useMemo)(() => {
    return propBreakpoint ?? getBreakpointFromWidth(breakpoints, width);
  }, []);
  const initialCols = (0, import_react.useMemo)(() => {
    return getColsFromBreakpoint(initialBreakpoint, colsConfig);
  }, [initialBreakpoint, colsConfig]);
  const initialLayout = (0, import_react.useMemo)(() => {
    return findOrGenerateResponsiveLayout(
      propsLayouts,
      breakpoints,
      initialBreakpoint,
      initialBreakpoint,
      initialCols,
      compactType
    );
  }, []);
  const [breakpoint, setBreakpoint] = (0, import_react.useState)(initialBreakpoint);
  const [cols, setCols] = (0, import_react.useState)(initialCols);
  const [layout, setLayout] = (0, import_react.useState)(initialLayout);
  const [layouts2, setLayouts] = (0, import_react.useState)(propsLayouts);
  const prevWidthRef = (0, import_react.useRef)(width);
  const prevBreakpointRef = (0, import_react.useRef)(propBreakpoint);
  const prevBreakpointsRef = (0, import_react.useRef)(breakpoints);
  const prevColsRef = (0, import_react.useRef)(colsConfig);
  const prevLayoutsRef = (0, import_react.useRef)(propsLayouts);
  const prevCompactTypeRef = (0, import_react.useRef)(compactType);
  const layoutsRef = (0, import_react.useRef)(layouts2);
  (0, import_react.useEffect)(() => {
    layoutsRef.current = layouts2;
  }, [layouts2]);
  const derivedLayout = (0, import_react.useMemo)(() => {
    if (!(0, import_fast_equals.deepEqual)(propsLayouts, prevLayoutsRef.current)) {
      return findOrGenerateResponsiveLayout(
        propsLayouts,
        breakpoints,
        breakpoint,
        breakpoint,
        cols,
        compactor
      );
    }
    return null;
  }, [propsLayouts, breakpoints, breakpoint, cols, compactor]);
  const effectiveLayout = derivedLayout ?? layout;
  (0, import_react.useEffect)(() => {
    if (derivedLayout !== null) {
      setLayout(derivedLayout);
      setLayouts(propsLayouts);
      layoutsRef.current = propsLayouts;
      prevLayoutsRef.current = propsLayouts;
    }
  }, [derivedLayout, propsLayouts]);
  (0, import_react.useEffect)(() => {
    if (compactType !== prevCompactTypeRef.current) {
      const newLayout = compactor.compact(cloneLayout(effectiveLayout), cols);
      const newLayouts = {
        ...layoutsRef.current,
        [breakpoint]: newLayout
      };
      setLayout(newLayout);
      setLayouts(newLayouts);
      layoutsRef.current = newLayouts;
      onLayoutChange(newLayout, newLayouts);
      prevCompactTypeRef.current = compactType;
    }
  }, [
    compactType,
    compactor,
    effectiveLayout,
    cols,
    allowOverlap,
    breakpoint,
    onLayoutChange
  ]);
  (0, import_react.useEffect)(() => {
    const widthChanged = width !== prevWidthRef.current;
    const breakpointPropChanged = propBreakpoint !== prevBreakpointRef.current;
    const breakpointsChanged = !(0, import_fast_equals.deepEqual)(
      breakpoints,
      prevBreakpointsRef.current
    );
    const colsChanged = !(0, import_fast_equals.deepEqual)(colsConfig, prevColsRef.current);
    if (widthChanged || breakpointPropChanged || breakpointsChanged || colsChanged) {
      const newBreakpoint = propBreakpoint ?? getBreakpointFromWidth(breakpoints, width);
      const newCols = getColsFromBreakpoint(newBreakpoint, colsConfig);
      const lastBreakpoint = breakpoint;
      if (lastBreakpoint !== newBreakpoint || breakpointsChanged || colsChanged) {
        const newLayouts = { ...layoutsRef.current };
        if (!newLayouts[lastBreakpoint]) {
          newLayouts[lastBreakpoint] = cloneLayout(layout);
        }
        let newLayout = findOrGenerateResponsiveLayout(
          newLayouts,
          breakpoints,
          newBreakpoint,
          lastBreakpoint,
          newCols,
          compactor
        );
        newLayout = synchronizeLayoutWithChildren2(
          newLayout,
          children,
          newCols,
          compactor
        );
        newLayouts[newBreakpoint] = newLayout;
        setBreakpoint(newBreakpoint);
        setCols(newCols);
        setLayout(newLayout);
        setLayouts(newLayouts);
        layoutsRef.current = newLayouts;
        onBreakpointChange(newBreakpoint, newCols);
        onLayoutChange(newLayout, newLayouts);
      }
      const currentMargin2 = getIndentationValue(
        propMargin,
        newBreakpoint
      );
      const currentPadding = propContainerPadding ? getIndentationValue(
        propContainerPadding,
        newBreakpoint
      ) : null;
      onWidthChange(width, currentMargin2, newCols, currentPadding);
      prevWidthRef.current = width;
      prevBreakpointRef.current = propBreakpoint;
      prevBreakpointsRef.current = breakpoints;
      prevColsRef.current = colsConfig;
    }
  }, [
    width,
    propBreakpoint,
    breakpoints,
    colsConfig,
    breakpoint,
    cols,
    layout,
    children,
    compactor,
    compactType,
    allowOverlap,
    propMargin,
    propContainerPadding,
    onBreakpointChange,
    onLayoutChange,
    onWidthChange
  ]);
  const handleLayoutChange = (0, import_react.useCallback)(
    (newLayout) => {
      const currentLayouts = layoutsRef.current;
      const newLayouts = {
        ...currentLayouts,
        [breakpoint]: newLayout
      };
      setLayout(newLayout);
      setLayouts(newLayouts);
      layoutsRef.current = newLayouts;
      onLayoutChange(newLayout, newLayouts);
    },
    [breakpoint, onLayoutChange]
  );
  const currentMargin = (0, import_react.useMemo)(() => {
    return getIndentationValue(
      propMargin,
      breakpoint
    );
  }, [propMargin, breakpoint]);
  const currentContainerPadding = (0, import_react.useMemo)(() => {
    if (propContainerPadding === null) return null;
    return getIndentationValue(
      propContainerPadding,
      breakpoint
    );
  }, [propContainerPadding, breakpoint]);
  const gridConfig = (0, import_react.useMemo)(
    () => ({
      cols,
      rowHeight,
      maxRows,
      margin: currentMargin,
      containerPadding: currentContainerPadding
    }),
    [cols, rowHeight, maxRows, currentMargin, currentContainerPadding]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    GridLayout,
    {
      ...restProps,
      width,
      gridConfig,
      compactor,
      onLayoutChange: handleLayoutChange,
      layout: effectiveLayout,
      children
    }
  );
}

// node_modules/react-grid-layout/dist/legacy.mjs
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_react_jsx_runtime(), 1);
function ReactGridLayout(props) {
  const {
    // Required
    children,
    width,
    // Grid measurement
    cols = 12,
    rowHeight = 150,
    maxRows = Infinity,
    margin = [10, 10],
    containerPadding = null,
    // Layout data
    layout,
    droppingItem,
    // Compaction
    compactType: compactTypeProp,
    preventCollision = false,
    allowOverlap = false,
    verticalCompact,
    // Drag behavior
    isDraggable = true,
    isBounded = false,
    draggableHandle,
    draggableCancel,
    // Resize behavior
    isResizable = true,
    resizeHandles = ["se"],
    resizeHandle,
    // Drop behavior
    isDroppable = false,
    // Position
    useCSSTransforms = true,
    transformScale = 1,
    // Container props
    autoSize,
    className,
    style,
    innerRef,
    // Callbacks
    onLayoutChange,
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStart,
    onResize,
    onResizeStop,
    onDrop,
    onDropDragOver
  } = props;
  let compactType = compactTypeProp === void 0 ? "vertical" : compactTypeProp;
  if (verticalCompact === false) {
    if (true) {
      console.warn(
        '`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. Use `compactType`: "horizontal" | "vertical" | null.'
      );
    }
    compactType = null;
  }
  const gridConfig = {
    cols,
    rowHeight,
    maxRows,
    margin,
    containerPadding
  };
  const dragConfig = {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel,
    // Set threshold to 0 for backwards compatibility with v1 API
    // v2 API defaults to 3px threshold (fixes #1341, #1401)
    threshold: 0
  };
  const resizeConfig = {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  };
  const dropConfig = {
    enabled: isDroppable
  };
  let positionStrategy;
  if (!useCSSTransforms) {
    positionStrategy = absoluteStrategy;
  } else if (transformScale !== 1) {
    positionStrategy = createScaledStrategy(transformScale);
  } else {
    positionStrategy = transformStrategy;
  }
  const compactor = getCompactor(compactType, allowOverlap, preventCollision);
  const constraints = isBounded ? [...defaultConstraints, containerBounds] : defaultConstraints;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    GridLayout,
    {
      width,
      gridConfig,
      dragConfig,
      resizeConfig,
      dropConfig,
      positionStrategy,
      compactor,
      constraints,
      layout,
      droppingItem,
      autoSize,
      className,
      style,
      innerRef,
      onLayoutChange,
      onDragStart,
      onDrag,
      onDragStop,
      onResizeStart,
      onResize,
      onResizeStop,
      onDrop,
      onDropDragOver,
      children
    }
  );
}
ReactGridLayout.displayName = "ReactGridLayout";
function ResponsiveReactGridLayout(props) {
  const {
    // Required
    children,
    width,
    // Responsive-specific
    breakpoint,
    breakpoints,
    cols,
    layouts: layouts2,
    onBreakpointChange,
    onLayoutChange,
    onWidthChange,
    // Grid measurement
    rowHeight,
    maxRows,
    margin,
    containerPadding,
    // Layout data
    droppingItem,
    // Compaction
    compactType: compactTypeProp,
    preventCollision = false,
    allowOverlap = false,
    verticalCompact,
    // Drag behavior
    isDraggable = true,
    isBounded = false,
    draggableHandle,
    draggableCancel,
    // Resize behavior
    isResizable = true,
    resizeHandles = ["se"],
    resizeHandle,
    // Drop behavior
    isDroppable = false,
    // Position
    useCSSTransforms = true,
    transformScale = 1,
    // Container props
    autoSize,
    className,
    style,
    innerRef,
    // Callbacks
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStart,
    onResize,
    onResizeStop,
    onDrop,
    onDropDragOver
  } = props;
  let compactType = compactTypeProp === void 0 ? "vertical" : compactTypeProp;
  if (verticalCompact === false) {
    if (true) {
      console.warn(
        '`verticalCompact` on <ResponsiveReactGridLayout> is deprecated and will be removed soon. Use `compactType`: "horizontal" | "vertical" | null.'
      );
    }
    compactType = null;
  }
  const dragConfig = {
    enabled: isDraggable,
    bounded: isBounded,
    handle: draggableHandle,
    cancel: draggableCancel
  };
  const resizeConfig = {
    enabled: isResizable,
    handles: resizeHandles,
    handleComponent: resizeHandle
  };
  const dropConfig = {
    enabled: isDroppable
  };
  let positionStrategy;
  if (!useCSSTransforms) {
    positionStrategy = absoluteStrategy;
  } else if (transformScale !== 1) {
    positionStrategy = createScaledStrategy(transformScale);
  } else {
    positionStrategy = transformStrategy;
  }
  const compactor = getCompactor(compactType, allowOverlap, preventCollision);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    ResponsiveGridLayout,
    {
      width,
      breakpoint,
      breakpoints,
      cols,
      layouts: layouts2,
      rowHeight,
      maxRows,
      margin,
      containerPadding,
      compactor,
      dragConfig,
      resizeConfig,
      dropConfig,
      positionStrategy,
      droppingItem,
      autoSize,
      className,
      style,
      innerRef,
      onBreakpointChange,
      onLayoutChange,
      onWidthChange,
      onDragStart,
      onDrag,
      onDragStop,
      onResizeStart,
      onResize,
      onResizeStop,
      onDrop,
      onDropDragOver,
      children
    }
  );
}
ResponsiveReactGridLayout.displayName = "ResponsiveReactGridLayout";
var ResponsiveReactGridLayout_default = ResponsiveReactGridLayout;
var layoutClassName2 = "react-grid-layout";
function WidthProvider(ComposedComponent) {
  function WidthProviderWrapper(props) {
    const { measureBeforeMount = false, className, style, ...rest } = props;
    const [width, setWidth] = (0, import_react2.useState)(1280);
    const [mounted, setMounted] = (0, import_react2.useState)(false);
    const elementRef = (0, import_react2.useRef)(null);
    const resizeObserverRef = (0, import_react2.useRef)(null);
    (0, import_react2.useEffect)(() => {
      setMounted(true);
    }, []);
    (0, import_react2.useEffect)(() => {
      const node = elementRef.current;
      if (!(node instanceof HTMLElement)) return;
      let rafId = null;
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          const newWidth = entries[0].contentRect.width;
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
          }
          rafId = requestAnimationFrame(() => {
            setWidth(newWidth);
            rafId = null;
          });
        }
      });
      observer.observe(node);
      resizeObserverRef.current = observer;
      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        observer.unobserve(node);
        observer.disconnect();
      };
    }, [mounted]);
    if (measureBeforeMount && !mounted) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          className: clsx_default(className, layoutClassName2),
          style,
          ref: elementRef
        }
      );
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      ComposedComponent,
      {
        innerRef: elementRef,
        className,
        style,
        ...rest,
        width
      }
    );
  }
  WidthProviderWrapper.displayName = `WidthProvider(${ComposedComponent.displayName || ComposedComponent.name || "Component"})`;
  return WidthProviderWrapper;
}

// ../nexus-frontend/src/ui/cx.js
function cx(...values) {
  return values.filter(Boolean).join(" ");
}

// ../nexus-frontend/src/ui/WorkspacePage.jsx
function WorkspacePage({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-page", className) }, children);
}
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
}
function SplitLayout({ className = "", variant = "main-aside", children }) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cx(
        "nexus-ui-split",
        variant === "sidebar-detail" ? "nexus-ui-split--sidebar-detail" : "nexus-ui-split--main-aside",
        className
      )
    },
    children
  );
}
function SplitSidebar({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("aside", { className: cx("nexus-ui-split__sidebar", className) }, children);
}
function SplitDetail({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("main", { className: cx("nexus-ui-split__detail", className) }, children);
}
function ScrollRegion({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-scroll-region", className) }, children);
}

// ../nexus-frontend/src/ui/SectionPanel.jsx
function SectionPanel({
  className = "",
  tone = "default",
  padding = "default",
  children
}) {
  return /* @__PURE__ */ React.createElement(
    "section",
    {
      className: cx(
        "nexus-ui-panel",
        tone !== "default" && `nexus-ui-panel--${tone}`,
        padding !== "default" && `nexus-ui-panel--padding-${padding}`,
        className
      )
    },
    children
  );
}
function PanelHeader({ className = "", children, actions = null }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-panel-header", className) }, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-panel-header__copy" }, children), actions ? /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-panel-header__actions" }, actions) : null);
}
function PanelTitle({ eyebrow = "", title = "", description = "" }) {
  return /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-panel-title" }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, title ? /* @__PURE__ */ React.createElement("strong", null, title) : null, description ? /* @__PURE__ */ React.createElement("p", null, description) : null);
}
function PanelStack({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-stack", className) }, children);
}

// ../nexus-frontend/src/ui/Actions.jsx
function Button({
  className = "",
  tone = "secondary",
  iconOnly = false,
  children,
  ...props
}) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      ...props,
      className: cx(
        "nexus-ui-button",
        tone !== "secondary" && `nexus-ui-button--${tone}`,
        iconOnly && "nexus-ui-button--icon",
        className
      )
    },
    children
  );
}
function IconButton({ className = "", tone = "secondary", title = "", children, ...props }) {
  return /* @__PURE__ */ React.createElement(
    Button,
    {
      ...props,
      className,
      tone,
      iconOnly: true,
      title,
      "aria-label": props["aria-label"] || title || void 0
    },
    children
  );
}
function SegmentedControl({
  className = "",
  options = [],
  value,
  onChange,
  ariaLabel = "Selector"
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-segmented", className), role: "tablist", "aria-label": ariaLabel }, options.map((option) => {
    const optionValue = option.value;
    const active = optionValue === value;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: optionValue,
        type: "button",
        role: "tab",
        "aria-selected": active,
        className: cx("nexus-ui-segmented__button", active && "is-active"),
        onClick: () => onChange?.(optionValue)
      },
      option.icon ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__icon" }, option.icon) : null,
      /* @__PURE__ */ React.createElement("span", null, option.label)
    );
  }));
}

// ../nexus-frontend/src/ui/Fields.jsx
function Field({
  className = "",
  label = "",
  description = "",
  wide = false,
  children
}) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-field", wide && "nexus-ui-field--wide", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__label" }, label), description ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__description" }, description) : null, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-field__control" }, children));
}
function FieldGrid({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-field-grid", className) }, children);
}

// ../nexus-frontend/src/ui/States.jsx
function Notice({ className = "", tone = "info", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-notice", `nexus-ui-notice--${tone}`, className) }, children);
}
function StateBlock({
  className = "",
  tone = "default",
  eyebrow = "",
  title = "",
  description = "",
  centered = false,
  children = null
}) {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: cx(
        "nexus-ui-state",
        tone !== "default" && `nexus-ui-state--${tone}`,
        centered && "nexus-ui-state--centered",
        className
      )
    },
    eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null,
    title ? /* @__PURE__ */ React.createElement("strong", null, title) : null,
    description ? /* @__PURE__ */ React.createElement("p", null, description) : null,
    children
  );
}

// ../nexus-frontend/src/utils/devLog.js
var DEV_LOG_BATCH_CHANNEL = "dev-log:append-batch";
var { ipcRenderer } = window.require("electron");
var devLogRawConsole = {
  debug: console.debug.bind(console),
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};
var rendererDevLogState = {
  queue: Array.isArray(window.__NEXUS_DEV_LOG_BUFFER__) ? window.__NEXUS_DEV_LOG_BUFFER__ : [],
  flushTimer: null,
  consoleBridgeInstalled: false,
  ipcBridgeInstalled: false,
  initialized: false,
  verbose: window.localStorage?.getItem("NEXUS_DEV_LOG_VERBOSE") === "1"
};
window.__NEXUS_DEV_LOG_BUFFER__ = rendererDevLogState.queue;
window.__NEXUS_DEV_LOG_RUN_ID__ = window.__NEXUS_DEV_LOG_RUN_ID__ || (globalThis.crypto?.randomUUID?.() || `renderer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
function getRendererRunId() {
  return window.__NEXUS_DEV_LOG_RUN_ID__;
}
function shouldMirrorRendererConsole(level) {
  return level === "warn" || level === "error" || level === "fatal";
}
function resolveRendererScope(scope) {
  const normalizedScope = String(scope || "").trim() || "renderer.startup";
  if (normalizedScope.startsWith("renderer.startup")) {
    return {
      process: "renderer",
      surface: "startup",
      subsystem: normalizedScope,
      shard: "40-renderer-startup.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.store") || normalizedScope.startsWith("renderer.items")) {
    return {
      process: "renderer",
      surface: "store",
      subsystem: normalizedScope,
      shard: "41-renderer-store.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.explorer")) {
    return {
      process: "renderer",
      surface: "explorer",
      subsystem: normalizedScope,
      shard: "42-renderer-explorer.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.editors")) {
    return {
      process: "renderer",
      surface: "editors",
      subsystem: normalizedScope,
      shard: "43-renderer-editors.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.plugins")) {
    return {
      process: "renderer",
      surface: "plugins",
      subsystem: normalizedScope,
      shard: "44-renderer-plugins.jsonl"
    };
  }
  if (normalizedScope.startsWith("renderer.ipc")) {
    return {
      process: "renderer",
      surface: "ipc",
      subsystem: normalizedScope,
      shard: "50-ipc.jsonl"
    };
  }
  return {
    process: "renderer",
    surface: "startup",
    subsystem: normalizedScope,
    shard: "40-renderer-startup.jsonl"
  };
}
function serializeUnknown(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack || null,
      cause: serializeUnknown(value.cause, seen)
    };
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((entry) => serializeUnknown(entry, seen));
  }
  if (value && typeof value === "object") {
    if (seen.has(value)) {
      return "[circular]";
    }
    seen.add(value);
    const serialized = Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeUnknown(entry, seen)])
    );
    seen.delete(value);
    return serialized;
  }
  return value ?? null;
}
function buildRendererEvent(partialEvent = {}) {
  return {
    ts: partialEvent.ts || (/* @__PURE__ */ new Date()).toISOString(),
    rendererRunId: partialEvent.rendererRunId || getRendererRunId(),
    process: "renderer",
    surface: partialEvent.surface || "startup",
    subsystem: partialEvent.subsystem || "renderer.startup",
    level: partialEvent.level || "info",
    event: partialEvent.event || "renderer.unspecified",
    message: partialEvent.message || "",
    durationMs: typeof partialEvent.durationMs === "number" ? Number(partialEvent.durationMs.toFixed(2)) : null,
    requestId: partialEvent.requestId || null,
    data: partialEvent.data ? serializeUnknown(partialEvent.data) : null,
    shard: partialEvent.shard || null
  };
}
function queueRendererDevLogEvent(partialEvent = {}) {
  rendererDevLogState.queue.push(buildRendererEvent(partialEvent));
  if (shouldMirrorRendererConsole(partialEvent.level || "info")) {
    const rawMethod = partialEvent.level === "warn" ? devLogRawConsole.warn : devLogRawConsole.error;
    rawMethod(partialEvent.message || partialEvent.event || "", partialEvent.data || "");
  }
  scheduleRendererDevLogFlush();
}
function scheduleRendererDevLogFlush() {
  if (rendererDevLogState.flushTimer) {
    return;
  }
  rendererDevLogState.flushTimer = window.setTimeout(() => {
    rendererDevLogState.flushTimer = null;
    flushRendererDevLogBuffer();
  }, 80);
}
function flushRendererDevLogBuffer() {
  if (!rendererDevLogState.queue.length) {
    return;
  }
  const events = rendererDevLogState.queue.splice(0, rendererDevLogState.queue.length);
  try {
    ipcRenderer.send(DEV_LOG_BATCH_CHANNEL, {
      events
    });
  } catch (error) {
    rendererDevLogState.queue.unshift(...events);
    devLogRawConsole.error("[dev-log] No se pudo flush-ear el batch del renderer.", error);
  }
}
function createRendererDevLogger(scope) {
  const context = resolveRendererScope(scope);
  return {
    context,
    debug(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "debug", event, message, data });
    },
    info(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "info", event, message, data });
    },
    warn(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "warn", event, message, data });
    },
    error(event, message, data = null) {
      queueRendererDevLogEvent({ ...context, level: "error", event, message, data });
    }
  };
}

// ../nexus-frontend/src/components/icons/iconCatalogClient.js
var { ipcRenderer: ipcRenderer2 } = window.require("electron");
var explorerIconsLogger = createRendererDevLogger("renderer.explorer.icons");
var iconServerInfoPromise = null;
var unifiedIconCatalogPromise = null;
var unifiedIconCatalog = null;
var iconServerInfoLogged = false;
var remoteSvgLoadLoggedCount = 0;
var iconCatalogEntryById = /* @__PURE__ */ new Map();
var iconSvgMarkupCache = /* @__PURE__ */ new Map();
var pendingIconSvgMarkupLoads = /* @__PURE__ */ new Map();
async function getIconServerInfo() {
  if (!iconServerInfoPromise) {
    const startedAt = performance.now();
    iconServerInfoPromise = ipcRenderer2.invoke("icon-server:get-info").then((result) => {
      if (!iconServerInfoLogged) {
        iconServerInfoLogged = true;
        explorerIconsLogger.info(
          "explorer.icons.serverInfoResolved",
          "El renderer obtuvo el origin del icon server.",
          {
            elapsedMs: Number((performance.now() - startedAt).toFixed(2)),
            hasOrigin: Boolean(result?.origin),
            hasCatalogUrl: Boolean(result?.catalogUrl)
          }
        );
      }
      return result;
    }).catch((error) => {
      iconServerInfoPromise = null;
      throw error;
    });
  }
  return iconServerInfoPromise;
}
async function loadUnifiedIconCatalog() {
  if (!unifiedIconCatalogPromise) {
    unifiedIconCatalogPromise = getIconServerInfo().then(async (serverInfo) => {
      if (!serverInfo?.catalogUrl) {
        throw new Error("Icon server no disponible");
      }
      const response = await fetch(serverInfo.catalogUrl);
      if (!response.ok) {
        throw new Error(`No se pudo cargar el catalogo de iconos (${response.status})`);
      }
      const payload = await response.json();
      const icons = Array.isArray(payload?.icons) ? payload.icons : [];
      unifiedIconCatalog = {
        ...payload,
        icons
      };
      iconCatalogEntryById.clear();
      for (const entry of icons) {
        if (entry?.id) {
          iconCatalogEntryById.set(entry.id, entry);
        }
      }
      return unifiedIconCatalog;
    }).catch((error) => {
      unifiedIconCatalogPromise = null;
      throw error;
    });
  }
  return unifiedIconCatalogPromise;
}
function getCachedUnifiedIconEntry(iconId) {
  return iconCatalogEntryById.get(iconId) || null;
}
async function getIconSvgUrl(iconId) {
  const cachedEntry = getCachedUnifiedIconEntry(iconId);
  if (cachedEntry?.svgUrl) {
    return cachedEntry.svgUrl;
  }
  const serverInfo = await getIconServerInfo();
  if (!serverInfo?.origin) {
    throw new Error("Icon server sin origin");
  }
  return `${serverInfo.origin}/icons/by-id/${encodeURIComponent(iconId)}.svg`;
}
function getCachedIconSvgMarkup(iconId) {
  return iconSvgMarkupCache.get(iconId) || null;
}
async function loadIconSvgMarkup(iconId) {
  if (!iconId) {
    return null;
  }
  const cachedMarkup = getCachedIconSvgMarkup(iconId);
  if (cachedMarkup) {
    return cachedMarkup;
  }
  if (pendingIconSvgMarkupLoads.has(iconId)) {
    return pendingIconSvgMarkupLoads.get(iconId);
  }
  const pendingLoad = getIconSvgUrl(iconId).then(async (iconUrl) => {
    const startedAt = performance.now();
    const response = await fetch(iconUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${iconId} (${response.status})`);
    }
    const svgMarkup = await response.text();
    iconSvgMarkupCache.set(iconId, svgMarkup);
    const elapsedMs = Number((performance.now() - startedAt).toFixed(2));
    if (elapsedMs >= 25 || remoteSvgLoadLoggedCount < 8) {
      remoteSvgLoadLoggedCount += 1;
      explorerIconsLogger.info(
        "explorer.icons.remoteSvgLoaded",
        "Se cargo un SVG remoto para iconos del explorer.",
        {
          iconId,
          elapsedMs,
          markupLength: svgMarkup.length
        }
      );
    }
    return svgMarkup;
  }).finally(() => {
    pendingIconSvgMarkupLoads.delete(iconId);
  });
  pendingIconSvgMarkupLoads.set(iconId, pendingLoad);
  return pendingLoad;
}

// ../nexus-plugins/habitos/src/constants.js
var HABITOS_PLUGIN_ID = "nexus.habitos";
var HABITOS_WORKSPACE_VIEW_ID = "nexus.habitos.workspace";
var WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" }
];
var DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID = "mui:Extension";
var DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR = "#8fb3ff";
var HABIT_CATEGORY_PRESETS = [
  { value: "Dejar un mal habito", label: "Dejar un mal habito", iconId: "mui:Block", color: "#ea4335" },
  { value: "Arte", label: "Arte", iconId: "mui:Brush", color: "#ef4f66" },
  { value: "Meditacion", label: "Meditacion", iconId: "mui:SelfImprovement", color: "#cf34b8" },
  { value: "Estudio", label: "Estudio", iconId: "mui:School", color: "#9b5cf6" },
  { value: "Deportes", label: "Deportes", iconId: "mui:DirectionsBike", color: "#4d71f2" },
  { value: "Entretenimiento", label: "Entretenimiento", iconId: "mui:ConfirmationNumber", color: "#42b7c8" },
  { value: "Social", label: "Social", iconId: "mui:Textsms", color: "#34b893" },
  { value: "Finanzas", label: "Finanzas", iconId: "mui:AttachMoney", color: "#4bb86c" },
  { value: "Salud", label: "Salud", iconId: "mui:LocalHospital", color: "#85c93c" },
  { value: "Trabajo", label: "Trabajo", iconId: "mui:Work", color: "#a6bf3f" },
  { value: "Nutricion", label: "Nutricion", iconId: "mui:Restaurant", color: "#ffa20f" },
  { value: "Hogar", label: "Hogar", iconId: "mui:Home", color: "#ff960f" },
  { value: "Aire libre", label: "Aire libre", iconId: "mui:Landscape", color: "#df7a38" },
  { value: "Otros", label: "Otros", iconId: "mui:Widgets", color: "#df6746" }
];
var HABIT_PROGRESS_OPTIONS = [
  {
    value: "yes-no",
    label: "Con un si o un no",
    description: "Si cada dia quieres registrar si tuviste exito o no con tu actividad."
  },
  {
    value: "quantity",
    label: "Con una cantidad",
    description: "Si quieres establecer un valor numerico como meta o limite diario para el habito."
  },
  {
    value: "checklist",
    label: "Con una lista de actividades",
    description: "Si quieres evaluar tu actividad en base a un conjunto de sub-items."
  }
];
var HABIT_QUANTITY_MODE_OPTIONS = [
  { value: "at-least", label: "Al menos" },
  { value: "less-than", label: "Menos de" },
  { value: "exactly", label: "Exactamente" },
  { value: "no-target", label: "Sin objetivo" }
];
var HABIT_EDIT_WIZARD_STEPS = [
  { value: 0, label: "Identidad" },
  { value: 1, label: "Frecuencia" },
  { value: 2, label: "Operativa" }
];
var HABIT_WIZARD_STEPS = [
  { value: 0, label: "Categoria" },
  { value: 1, label: "Evaluacion" },
  { value: 2, label: "Configuracion" },
  { value: 3, label: "Frecuencia" },
  { value: 4, label: "Cuando quieres hacerlo?" }
];

// ../nexus-plugins/habitos/src/icons.jsx
function BaseIcon({ children }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    },
    children
  );
}
function HabitosIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("rect", { x: "4", y: "5", width: "16", height: "15", rx: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M8 10h8" }), /* @__PURE__ */ React.createElement("path", { d: "M8 14h5" }), /* @__PURE__ */ React.createElement("path", { d: "M8 7.5v5" }));
}
function PlusIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "M12 5v14" }), /* @__PURE__ */ React.createElement("path", { d: "M5 12h14" }));
}
function CheckIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "m5 12 4 4 10-10" }));
}
function PencilIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "M12 20h9" }), /* @__PURE__ */ React.createElement("path", { d: "m16.5 3.5 4 4L8 20l-4 1 1-4z" }));
}
function TrashIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "M4 7h16" }), /* @__PURE__ */ React.createElement("path", { d: "M9 7V4h6v3" }), /* @__PURE__ */ React.createElement("path", { d: "M8 10v8" }), /* @__PURE__ */ React.createElement("path", { d: "M12 10v8" }), /* @__PURE__ */ React.createElement("path", { d: "M16 10v8" }));
}
function ChevronLeftIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "m15 18-6-6 6-6" }));
}
function ChevronRightIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("path", { d: "m9 18 6-6-6-6" }));
}
function SettingsIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1 1 0 0 0-.2 1.1V9c0 .4.2.8.6.9H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" }));
}

// ../nexus-plugins/habitos/src/HabitosView.jsx
var React4 = window.React;
var {
  startTransition,
  useEffect: useEffect3,
  useMemo: useMemo2,
  useRef: useRef3,
  useState: useState3
} = React4;
var { ipcRenderer: ipcRenderer3 } = window.require("electron");
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController
);
var ResponsiveGridLayout2 = WidthProvider(ResponsiveReactGridLayout_default);
var HABIT_OUTCOME_RANGE_TICK_LIMITS = {
  "7d": 7,
  "1m": 8,
  "1y": 12
};
var HABITOS_DASHBOARD_LAYOUTS_KEY = "dashboardLayouts";
var HABITOS_CATEGORY_PRESET_OVERRIDES_KEY = "categoryPresetOverrides";
var HABITOS_DASHBOARD_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0
};
var HABITOS_DASHBOARD_COLS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2
};
var HABITOS_DASHBOARD_DEFAULT_LAYOUTS = {
  lg: [
    { i: "daily-queue", x: 0, y: 0, w: 8, h: 13, minW: 4, minH: 7 },
    { i: "habit-outcome", x: 8, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
    { i: "upcoming-tasks", x: 8, y: 7, w: 4, h: 6, minW: 3, minH: 5 }
  ],
  md: [
    { i: "daily-queue", x: 0, y: 0, w: 6, h: 13, minW: 4, minH: 7 },
    { i: "habit-outcome", x: 6, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
    { i: "upcoming-tasks", x: 6, y: 7, w: 4, h: 6, minW: 3, minH: 5 }
  ],
  sm: [
    { i: "daily-queue", x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 7 },
    { i: "habit-outcome", x: 0, y: 12, w: 3, h: 6, minW: 2, minH: 5 },
    { i: "upcoming-tasks", x: 3, y: 12, w: 3, h: 6, minW: 2, minH: 5 }
  ],
  xs: [
    { i: "daily-queue", x: 0, y: 0, w: 4, h: 11, minW: 2, minH: 7 },
    { i: "habit-outcome", x: 0, y: 11, w: 4, h: 6, minW: 2, minH: 5 },
    { i: "upcoming-tasks", x: 0, y: 17, w: 4, h: 6, minW: 2, minH: 5 }
  ],
  xxs: [
    { i: "daily-queue", x: 0, y: 0, w: 2, h: 10, minW: 2, minH: 6 },
    { i: "habit-outcome", x: 0, y: 10, w: 2, h: 6, minW: 2, minH: 5 },
    { i: "upcoming-tasks", x: 0, y: 16, w: 2, h: 6, minW: 2, minH: 5 }
  ]
};
var HABITOS_DASHBOARD_MARGIN = [12, 12];
var HABITOS_DASHBOARD_ROW_HEIGHT = 30;
var HABITOS_DASHBOARD_RESIZE_HANDLES = ["s", "w", "e", "n", "sw", "nw", "se", "ne"];
function normalizeDashboardGridInteger(value, fallbackValue, {
  min = 0,
  max = Number.MAX_SAFE_INTEGER
} = {}) {
  const numericValue = Math.round(Number(value));
  if (!Number.isInteger(numericValue)) {
    return fallbackValue;
  }
  return Math.min(max, Math.max(min, numericValue));
}
function normalizeHabitosDashboardLayoutItem(item, fallbackItem, cols) {
  const minW = normalizeDashboardGridInteger(item?.minW, fallbackItem.minW, {
    min: 1,
    max: cols
  });
  const minH = normalizeDashboardGridInteger(item?.minH, fallbackItem.minH, {
    min: 1
  });
  const w = normalizeDashboardGridInteger(item?.w, fallbackItem.w, {
    min: minW,
    max: cols
  });
  const h = normalizeDashboardGridInteger(item?.h, fallbackItem.h, {
    min: minH
  });
  return {
    i: fallbackItem.i,
    x: normalizeDashboardGridInteger(item?.x, fallbackItem.x, {
      min: 0,
      max: Math.max(0, cols - w)
    }),
    y: normalizeDashboardGridInteger(item?.y, fallbackItem.y, {
      min: 0
    }),
    w,
    h,
    minW,
    minH,
    resizeHandles: HABITOS_DASHBOARD_RESIZE_HANDLES
  };
}
function normalizeHabitosDashboardLayouts(source) {
  const rawLayouts = source && typeof source === "object" ? source : {};
  const normalizedLayouts = {};
  for (const breakpoint of Object.keys(HABITOS_DASHBOARD_DEFAULT_LAYOUTS)) {
    const fallbackItems = HABITOS_DASHBOARD_DEFAULT_LAYOUTS[breakpoint];
    const rawItems = Array.isArray(rawLayouts?.[breakpoint]) ? rawLayouts[breakpoint] : [];
    const rawItemsById = new Map(
      rawItems.map((entry) => [String(entry?.i || ""), entry])
    );
    normalizedLayouts[breakpoint] = fallbackItems.map((fallbackItem) => normalizeHabitosDashboardLayoutItem(
      rawItemsById.get(fallbackItem.i),
      fallbackItem,
      HABITOS_DASHBOARD_COLS[breakpoint]
    ));
  }
  return normalizedLayouts;
}
function getHabitosDashboardLayoutsSignature(layouts2) {
  return JSON.stringify(normalizeHabitosDashboardLayouts(layouts2));
}
function readHabitosDashboardLayouts(settingsValue) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return normalizeHabitosDashboardLayouts(baseSettings[HABITOS_DASHBOARD_LAYOUTS_KEY]);
}
function writeHabitosDashboardLayouts(settingsValue, layouts2) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return {
    ...baseSettings,
    [HABITOS_DASHBOARD_LAYOUTS_KEY]: normalizeHabitosDashboardLayouts(layouts2)
  };
}
function getHabitCategoryPresetId(value) {
  return `preset:${normalizeCategoryNameValue(value)}`;
}
function normalizeHabitCategoryPresetOverrideValue(value, preset) {
  const normalizedValue = value && typeof value === "object" ? value : {};
  return {
    id: getHabitCategoryPresetId(preset.value),
    presetId: getHabitCategoryPresetId(preset.value),
    kind: "preset",
    originalName: preset.value,
    name: String(normalizedValue.name || preset.value).trim() || preset.value,
    iconId: normalizedValue.iconId || preset.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
    color: normalizeHexColorDraftValue(
      normalizedValue.color,
      preset.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR
    ),
    deleted: Boolean(normalizedValue.deleted)
  };
}
function readHabitCategoryPresetOverrides(settingsValue) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  const rawOverrides = baseSettings[HABITOS_CATEGORY_PRESET_OVERRIDES_KEY];
  const normalizedOverrides = {};
  for (const preset of HABIT_CATEGORY_PRESETS) {
    const presetId = getHabitCategoryPresetId(preset.value);
    normalizedOverrides[presetId] = normalizeHabitCategoryPresetOverrideValue(
      rawOverrides?.[presetId],
      preset
    );
  }
  return normalizedOverrides;
}
function writeHabitCategoryPresetOverrides(settingsValue, overrides2) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  const nextOverrides = {};
  for (const preset of HABIT_CATEGORY_PRESETS) {
    const presetId = getHabitCategoryPresetId(preset.value);
    const normalizedOverride = normalizeHabitCategoryPresetOverrideValue(overrides2?.[presetId], preset);
    if (normalizedOverride.name !== preset.value || normalizedOverride.iconId !== preset.iconId || normalizedOverride.color !== preset.color || normalizedOverride.deleted) {
      nextOverrides[presetId] = {
        name: normalizedOverride.name,
        iconId: normalizedOverride.iconId,
        color: normalizedOverride.color,
        deleted: normalizedOverride.deleted
      };
    }
  }
  return {
    ...baseSettings,
    [HABITOS_CATEGORY_PRESET_OVERRIDES_KEY]: nextOverrides
  };
}
function buildEffectivePresetCategories(presetOverrides = {}) {
  return HABIT_CATEGORY_PRESETS.map((preset) => normalizeHabitCategoryPresetOverrideValue(
    presetOverrides[getHabitCategoryPresetId(preset.value)],
    preset
  )).filter((entry) => !entry.deleted).map((entry) => ({
    id: entry.id,
    presetId: entry.presetId,
    kind: "preset",
    originalName: entry.originalName,
    name: entry.name,
    value: entry.name,
    label: entry.name,
    iconId: entry.iconId,
    color: entry.color
  }));
}
function buildManagedHabitCategories(customCategories = [], presetOverrides = {}) {
  return [
    ...buildEffectivePresetCategories(presetOverrides),
    ...customCategories.map((entry) => ({
      ...entry,
      kind: "custom",
      value: entry.name,
      label: entry.name
    }))
  ];
}
function todayLocalDate(baseDate = /* @__PURE__ */ new Date()) {
  const now = baseDate;
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function createTaskDraft(source = null) {
  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    dueDate: source?.dueDate || todayLocalDate(),
    time: source?.time || "",
    priority: String(source?.priority || 1),
    notes: source?.notes || "",
    reminderAt: source?.reminderAt ? String(source.reminderAt).slice(0, 16) : "",
    isPersistent: source?.isPersistent ?? true,
    subitemsBlocking: source?.subitemsBlocking ?? false,
    subitems: Array.isArray(source?.subitems) && source.subitems.length ? source.subitems.map((entry) => ({
      id: entry.id || "",
      title: entry.title || "",
      isCompleted: Boolean(entry.isCompleted)
    })) : []
  };
}
function createDraftChecklistItem(source = null) {
  return {
    id: source?.id || createDraftId("draft-item"),
    title: source?.title || ""
  };
}
function createHabitCategoryDraft(source = null) {
  return {
    id: source?.id || "",
    kind: source?.kind || "custom",
    presetId: source?.presetId || "",
    originalName: source?.originalName || source?.name || "",
    name: source?.name || "",
    iconId: source?.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
    color: source?.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR
  };
}
function normalizeCategoryNameValue(value) {
  return String(value || "").trim().toLowerCase();
}
function normalizeHexColorDraftValue(value, fallbackValue = DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return fallbackValue;
  }
  const prefixedValue = normalized.startsWith("#") ? normalized : `#${normalized}`;
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(prefixedValue) ? prefixedValue : fallbackValue;
}
function tokenizeSearch(value) {
  return String(value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
}
function addDaysToLocalDate(localDate, daysToAdd) {
  const base = /* @__PURE__ */ new Date(`${localDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return todayLocalDate();
  }
  base.setDate(base.getDate() + daysToAdd);
  return todayLocalDate(base);
}
function compareLocalDates(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}
function clampViewDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim()) ? String(value).trim() : todayLocalDate();
}
function getInclusiveDayCount(startDate, endDate) {
  const start = /* @__PURE__ */ new Date(`${startDate}T00:00:00`);
  const end = /* @__PURE__ */ new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 1;
  }
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 864e5) + 1;
}
function normalizeIntegerDraftValue(value, {
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  fallback = ""
} = {}) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }
  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return String(Math.min(max, Math.max(min, Math.round(numericValue))));
}
function createDraftId(prefix = "draft") {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function parseHabitProgressConfigValue(source = null) {
  if (!source?.progressConfigJson) {
    return {};
  }
  if (typeof source.progressConfigJson === "object") {
    return source.progressConfigJson;
  }
  try {
    return JSON.parse(String(source.progressConfigJson));
  } catch {
    return {};
  }
}
function getHabitChecklistItemsValue(source = null) {
  const progressConfig = parseHabitProgressConfigValue(source);
  const itemsSource = Array.isArray(source?.checklistItems) ? source.checklistItems : progressConfig.items;
  return Array.isArray(itemsSource) ? itemsSource.map((entry, index) => {
    const title = String(entry?.title || "").trim();
    if (!title) {
      return null;
    }
    return {
      id: String(entry?.id || createDraftId("habit-item")),
      title,
      sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index
    };
  }).filter(Boolean) : [];
}
function getHabitQuantityConfigValue(source = null) {
  const progressConfig = parseHabitProgressConfigValue(source);
  return {
    quantityMode: source?.quantityMode ?? progressConfig.quantityMode ?? "at-least",
    quantityTarget: source?.quantityTarget ?? progressConfig.quantityTarget ?? "",
    quantityUnit: source?.quantityUnit ?? progressConfig.quantityUnit ?? ""
  };
}
function createHabitDraft(source = null) {
  const startDate = source?.startDate || todayLocalDate();
  const normalizedEndDate = source?.endDate || "";
  const hasEndDate = Boolean(normalizedEndDate);
  const checklistItems = getHabitChecklistItemsValue(source);
  const quantityConfig = getHabitQuantityConfigValue(source);
  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    progressMode: source ? source.progressMode || "yes-no" : "",
    quantityMode: quantityConfig.quantityMode,
    quantityTarget: quantityConfig.quantityTarget === null ? "" : String(quantityConfig.quantityTarget),
    quantityUnit: quantityConfig.quantityUnit || "",
    checklistItems: checklistItems.length ? checklistItems.map((entry) => createDraftChecklistItem(entry)) : [
      createDraftChecklistItem(),
      createDraftChecklistItem()
    ],
    scheduleType: source?.scheduleType || "daily",
    weekdays: Array.isArray(source?.scheduleConfigJson?.weekdays) ? source.scheduleConfigJson.weekdays : [1, 2, 3, 4, 5],
    startDate,
    hasEndDate,
    endDate: hasEndDate ? normalizedEndDate : "",
    durationDays: hasEndDate ? String(getInclusiveDayCount(startDate, normalizedEndDate)) : "1",
    time: source?.time || "",
    priority: String(source?.priority || 1),
    notes: source?.notes || "",
    status: source?.status || "active"
  };
}
async function invoke(channel, payload) {
  const response = await ipcRenderer3.invoke(channel, payload);
  if (!response?.ok) {
    throw new Error(response?.error || "No se pudo completar la operacion.");
  }
  return response.data;
}
function formatLocalDate(value) {
  if (!value) {
    return "Sin fecha";
  }
  const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(parsed);
}
function formatVisibleDateLabel(value) {
  const parsed = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(parsed);
}
function resolveQueueCategoryPresentation(item, categoryCatalog = [], presetOverrides = {}) {
  const normalizedCategory = normalizeCategoryNameValue(item?.category);
  if (normalizedCategory) {
    const customCategory = categoryCatalog.find(
      (entry) => normalizeCategoryNameValue(entry?.name) === normalizedCategory
    );
    if (customCategory) {
      return {
        color: customCategory.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
        iconId: customCategory.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID
      };
    }
    const presetCategory = buildEffectivePresetCategories(presetOverrides).find(
      (entry) => normalizeCategoryNameValue(entry.value) === normalizedCategory
    );
    if (presetCategory) {
      return {
        color: presetCategory.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
        iconId: presetCategory.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID
      };
    }
  }
  return {
    color: DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR,
    iconId: DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID
  };
}
function createEmptyHome() {
  const currentToday = todayLocalDate();
  return {
    today: currentToday,
    actualToday: currentToday,
    tasks: [],
    habits: [],
    categoryCatalog: [],
    habitOutcomeChart: {
      defaultRange: "7d",
      options: [
        { value: "7d", label: "7 dias" },
        { value: "1m", label: "1 mes" },
        { value: "1y", label: "1 ano" }
      ],
      ranges: {
        "7d": {
          value: "7d",
          label: "7 dias",
          rangeStart: currentToday,
          rangeEnd: currentToday,
          labels: [],
          datasets: [
            { id: "completed", label: "Cumplidos", values: [] },
            { id: "failed", label: "Fallidos", values: [] }
          ],
          totals: { completed: 0, failed: 0 }
        },
        "1m": {
          value: "1m",
          label: "1 mes",
          rangeStart: currentToday,
          rangeEnd: currentToday,
          labels: [],
          datasets: [
            { id: "completed", label: "Cumplidos", values: [] },
            { id: "failed", label: "Fallidos", values: [] }
          ],
          totals: { completed: 0, failed: 0 }
        },
        "1y": {
          value: "1y",
          label: "1 ano",
          rangeStart: currentToday,
          rangeEnd: currentToday,
          labels: [],
          datasets: [
            { id: "completed", label: "Cumplidos", values: [] },
            { id: "failed", label: "Fallidos", values: [] }
          ],
          totals: { completed: 0, failed: 0 }
        }
      }
    },
    dailyQueue: [],
    upcomingTasks: [],
    recentHistory: [],
    tasksSummary: {
      queueCount: 0,
      openCount: 0,
      upcomingCount: 0,
      completedTodayCount: 0,
      failedCount: 0
    },
    habitsSummary: {
      activeCount: 0,
      pendingTodayCount: 0,
      completedTodayCount: 0,
      failedCount: 0
    }
  };
}
function resolveChartThemeValue(name, fallbackValue) {
  if (typeof document === "undefined") {
    return fallbackValue;
  }
  const computedStyle = getComputedStyle(document.documentElement);
  const resolvedValue = computedStyle.getPropertyValue(name).trim();
  return resolvedValue || fallbackValue;
}
function DashboardEditOverlay() {
  return /* @__PURE__ */ React4.createElement("div", { className: "habitosDashboard__editOverlay", "aria-hidden": "true" });
}
function DashboardPanelTitle({ title = "", description = "", editMode = false }) {
  return /* @__PURE__ */ React4.createElement(PanelTitle, { title, description });
}
function HabitOutcomeLineChart({
  chartData,
  rangeValue = "7d"
}) {
  const canvasRef = useRef3(null);
  const chartRef = useRef3(null);
  const labels = Array.isArray(chartData?.labels) ? chartData.labels : [];
  const datasets = Array.isArray(chartData?.datasets) ? chartData.datasets : [];
  const completedDataset = datasets.find((entry) => entry.id === "completed") || datasets[0] || null;
  const failedDataset = datasets.find((entry) => entry.id === "failed") || datasets[1] || null;
  const totals = chartData?.totals || {
    completed: 0,
    failed: 0
  };
  const maxTicksLimit = HABIT_OUTCOME_RANGE_TICK_LIMITS[rangeValue] || 7;
  useEffect3(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return void 0;
    }
    const context2d = canvas.getContext("2d");
    if (!context2d) {
      return void 0;
    }
    chartRef.current?.destroy();
    const textMuted = resolveChartThemeValue("--color-text-muted", "rgba(255, 255, 255, 0.72)");
    const gridColor = resolveChartThemeValue("--color-border-default", "rgba(255, 255, 255, 0.12)");
    const completedColor = "#39c88a";
    const completedFill = "rgba(57, 200, 138, 0.16)";
    const failedColor = "#ff6b7a";
    const failedFill = "rgba(255, 107, 122, 0.12)";
    chartRef.current = new Chart(context2d, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: completedDataset?.label || "Cumplidos",
            data: Array.isArray(completedDataset?.values) ? completedDataset.values : [],
            borderColor: completedColor,
            backgroundColor: completedFill,
            borderWidth: 2.4,
            tension: 0.28,
            pointRadius: rangeValue === "1y" ? 0 : 2.2,
            pointHoverRadius: 0,
            pointBackgroundColor: completedColor,
            pointBorderWidth: 0,
            fill: false
          },
          {
            label: failedDataset?.label || "Fallidos",
            data: Array.isArray(failedDataset?.values) ? failedDataset.values : [],
            borderColor: failedColor,
            backgroundColor: failedFill,
            borderWidth: 2.4,
            tension: 0.28,
            pointRadius: rangeValue === "1y" ? 0 : 2.2,
            pointHoverRadius: 0,
            pointBackgroundColor: failedColor,
            pointBorderWidth: 0,
            fill: false
          }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            border: {
              display: false
            },
            ticks: {
              color: textMuted,
              autoSkip: true,
              maxTicksLimit
            }
          },
          y: {
            beginAtZero: true,
            border: {
              display: false
            },
            grid: {
              color: gridColor,
              drawTicks: false
            },
            ticks: {
              color: textMuted,
              precision: 0,
              stepSize: 1
            }
          }
        }
      }
    });
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [completedDataset, failedDataset, labels, maxTicksLimit, rangeValue]);
  return /* @__PURE__ */ React4.createElement("div", { className: "habitosView__trendChartShell" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__trendLegend", "aria-hidden": "true" }, /* @__PURE__ */ React4.createElement("span", { className: "is-completed" }, "Cumplidos"), /* @__PURE__ */ React4.createElement("span", { className: "is-failed" }, "Fallidos"), /* @__PURE__ */ React4.createElement("span", { className: "habitosView__trendTotal" }, "C ", totals.completed), /* @__PURE__ */ React4.createElement("span", { className: "habitosView__trendTotal" }, "F ", totals.failed)), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__trendCanvasWrap" }, /* @__PURE__ */ React4.createElement("canvas", { ref: canvasRef })));
}
function HabitOutcomePanel({ chart, className = "", dashboardEditMode = false }) {
  const defaultRange = chart?.defaultRange || "7d";
  const [rangeValue, setRangeValue] = useState3(defaultRange);
  const rangeOptions = Array.isArray(chart?.options) && chart.options.length ? chart.options : createEmptyHome().habitOutcomeChart.options;
  const selectedChart = chart?.ranges?.[rangeValue] || chart?.ranges?.[defaultRange] || createEmptyHome().habitOutcomeChart.ranges["7d"];
  useEffect3(() => {
    if (!rangeOptions.some((option) => option.value === rangeValue)) {
      setRangeValue(defaultRange);
    }
  }, [defaultRange, rangeOptions, rangeValue]);
  return /* @__PURE__ */ React4.createElement(
    SectionPanel,
    {
      className: [
        "habitosDashboard__widget",
        "habitosView__trendPanel",
        className
      ].filter(Boolean).join(" ")
    },
    /* @__PURE__ */ React4.createElement(
      PanelHeader,
      {
        actions: /* @__PURE__ */ React4.createElement(
          SegmentedControl,
          {
            className: "habitosView__trendRangeControl",
            ariaLabel: "Rango del grafico de habitos",
            options: rangeOptions,
            value: rangeValue,
            onChange: setRangeValue
          }
        )
      },
      /* @__PURE__ */ React4.createElement(DashboardPanelTitle, { title: "Evolucion de habitos", editMode: dashboardEditMode })
    ),
    /* @__PURE__ */ React4.createElement("div", { className: "habitosDashboard__widgetBody habitosView__trendPanelBody" }, /* @__PURE__ */ React4.createElement(HabitOutcomeLineChart, { chartData: selectedChart, rangeValue }))
  );
}
function getDefaultHabitId(habits = []) {
  const activeHabit = habits.find((entry) => entry.status === "active");
  return activeHabit?.id || habits[0]?.id || "";
}
function getPriorityLabel(value) {
  return String(value || 1);
}
function formatLocalDateTime(value) {
  if (!value) {
    return "Sin registro";
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}
function formatHabitSchedule(habit) {
  if (!habit) {
    return "Sin frecuencia";
  }
  if (habit.scheduleType === "weekdays") {
    const weekdayLabels = Array.isArray(habit.scheduleConfigJson?.weekdays) ? habit.scheduleConfigJson.weekdays.map((weekday) => WEEKDAY_OPTIONS.find((option) => option.value === weekday)?.label || null).filter(Boolean) : [];
    return weekdayLabels.length ? `Dias fijos: ${weekdayLabels.join(", ")}` : "Dias fijos";
  }
  return "Todos los dias";
}
function getHabitStatusLabel(status) {
  return status === "active" ? "Activo" : "En pausa";
}
function getHabitProgressOption(value) {
  return HABIT_PROGRESS_OPTIONS.find((option) => option.value === value) || null;
}
function getHabitQuantityModeOption(value) {
  return HABIT_QUANTITY_MODE_OPTIONS.find((option) => option.value === value) || null;
}
function getHabitProgressLabel(habit) {
  return getHabitProgressOption(habit?.progressMode)?.label || "Con un si o un no";
}
function getHabitQuantitySummary(habit) {
  const quantityConfig = getHabitQuantityConfigValue(habit);
  const quantityModeOption = getHabitQuantityModeOption(quantityConfig.quantityMode);
  if (quantityConfig.quantityMode === "no-target") {
    return "Sin objetivo numerico diario.";
  }
  const targetLabel = quantityConfig.quantityTarget ?? "";
  const unitLabel = String(quantityConfig.quantityUnit || "").trim();
  return `${quantityModeOption?.label || "Objetivo"} ${targetLabel}${unitLabel ? ` ${unitLabel}` : ""} en el dia`;
}
function getVisibleDayContext(home) {
  return home?.today === (home?.actualToday || todayLocalDate()) ? "Hoy" : "En este dia";
}
function getHabitTodayOccurrence(home, habitId) {
  return home.dailyQueue.find(
    (entry) => entry.type === "habit" && entry.habit?.id === habitId
  ) || null;
}
function getHabitTodaySummary(home, habit) {
  if (!habit) {
    return "Sin habito seleccionado.";
  }
  if (habit.status !== "active") {
    return "En pausa. No genera ocurrencias.";
  }
  const todayOccurrence = getHabitTodayOccurrence(home, habit.id);
  if (todayOccurrence?.isOverdue) {
    return "Tiene una ocurrencia pendiente desde antes.";
  }
  if (todayOccurrence?.status === "completed") {
    return `${getVisibleDayContext(home)} ya se marco como cumplido.`;
  }
  if (todayOccurrence?.status === "failed") {
    return `${getVisibleDayContext(home)} esta marcado como fallido.`;
  }
  if (todayOccurrence?.status === "recorded") {
    return `${getVisibleDayContext(home)} ya tiene una cantidad registrada.`;
  }
  if (todayOccurrence) {
    return home?.today === (home?.actualToday || todayLocalDate()) ? "Tiene una ocurrencia activa para hoy." : "Tiene una ocurrencia activa para la fecha visible.";
  }
  return home?.today === (home?.actualToday || todayLocalDate()) ? "Hoy no tiene ocurrencia pendiente." : "No tiene ocurrencia pendiente para la fecha visible.";
}
function getLatestHabitHistoryEntry(home, habitId) {
  const todayOccurrence = getHabitTodayOccurrence(home, habitId);
  if (todayOccurrence && todayOccurrence.status !== "pending") {
    return {
      status: todayOccurrence.status,
      statusLabel: todayOccurrence.statusLabel,
      timestamp: todayOccurrence.occurrence?.completedAt || todayOccurrence.occurrence?.updatedAt || null,
      summary: todayOccurrence.status === "completed" ? "Ocurrencia registrada como cumplida." : todayOccurrence.status === "recorded" ? "Se guardo una cantidad para ese dia." : "La ocurrencia de ese dia quedo marcada como fallida."
    };
  }
  return home.recentHistory.find((entry) => entry.type === "habit" && entry.habit?.id === habitId) || null;
}
function buildHabitPayload(source = null, overrides2 = {}) {
  const scheduleType = overrides2.scheduleType ?? source?.scheduleType ?? "daily";
  const progressConfig = parseHabitProgressConfigValue(source);
  const progressMode = overrides2.progressMode ?? source?.progressMode ?? "yes-no";
  const weekdaysSource = overrides2.weekdays ?? overrides2.scheduleConfigJson?.weekdays ?? source?.weekdays ?? source?.scheduleConfigJson?.weekdays ?? [];
  const weekdays = Array.isArray(weekdaysSource) ? weekdaysSource.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry)) : [];
  const checklistItemsSource = Array.isArray(overrides2.checklistItems) ? overrides2.checklistItems : Array.isArray(source?.checklistItems) ? source.checklistItems : progressConfig.items;
  return {
    id: overrides2.id ?? source?.id ?? "",
    title: overrides2.title ?? source?.title ?? "",
    category: overrides2.category ?? source?.category ?? "",
    progressMode,
    quantityMode: overrides2.quantityMode ?? source?.quantityMode ?? progressConfig.quantityMode ?? "at-least",
    quantityTarget: overrides2.quantityTarget ?? source?.quantityTarget ?? progressConfig.quantityTarget ?? "",
    quantityUnit: overrides2.quantityUnit ?? source?.quantityUnit ?? progressConfig.quantityUnit ?? "",
    checklistItems: Array.isArray(checklistItemsSource) ? checklistItemsSource.map((entry, index) => ({
      id: String(entry?.id || createDraftId("habit-item")),
      title: String(entry?.title || ""),
      sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index
    })) : [],
    scheduleType,
    scheduleConfigJson: {
      weekdays: scheduleType === "weekdays" ? weekdays : []
    },
    startDate: overrides2.startDate ?? source?.startDate ?? todayLocalDate(),
    endDate: overrides2.endDate ?? source?.endDate ?? "",
    time: overrides2.time ?? source?.time ?? "",
    priority: normalizeIntegerDraftValue(overrides2.priority ?? source?.priority ?? 1, {
      min: 1,
      max: 100,
      fallback: "1"
    }),
    notes: overrides2.notes ?? source?.notes ?? "",
    status: overrides2.status ?? source?.status ?? "active"
  };
}
function buildUpcomingTaskMenuItem(task) {
  return {
    id: `upcoming-task:${task.id}`,
    type: "task",
    recordId: task.id,
    title: task.title,
    raw: task
  };
}
function shouldShowQueueStatusPill(item) {
  return item?.type === "habit" && item.progressMode !== "yes-no" && item.status && item.status !== "pending";
}
function isQueueItemSettled(item) {
  return ["completed", "failed", "recorded"].includes(String(item?.status || "").trim().toLowerCase());
}
function getQueueToggleMeta(item) {
  if (item.type === "task") {
    return {
      title: item.status === "completed" ? "Reabrir" : "Completar",
      ariaLabel: item.status === "completed" ? "Reabrir tarea" : "Completar tarea",
      isPressed: item.status === "completed",
      className: item.status === "completed" ? "is-completed" : "",
      content: item.status === "completed" ? /* @__PURE__ */ React4.createElement(CheckIcon, null) : null
    };
  }
  if (item.progressMode !== "yes-no") {
    return null;
  }
  if (item.status === "completed") {
    return {
      title: "Marcar fallida",
      ariaLabel: "Marcar habito como fallido",
      isPressed: true,
      className: "is-completed",
      content: /* @__PURE__ */ React4.createElement(CheckIcon, null)
    };
  }
  if (item.status === "failed") {
    return {
      title: "Volver a pendiente",
      ariaLabel: "Volver habito a pendiente",
      isPressed: false,
      className: "is-failed",
      content: /* @__PURE__ */ React4.createElement("span", { className: "habitosView__queueCheckGlyph" }, "x")
    };
  }
  return {
    title: "Marcar cumplida",
    ariaLabel: "Marcar habito como cumplido",
    isPressed: false,
    className: "",
    content: null
  };
}
function getOccurrenceQuantityDraftValue(item) {
  const value = item?.progressDataJson?.value;
  return Number.isInteger(Number(value)) ? String(Number(value)) : "";
}
function parseOccurrenceQuantityDraftValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return {
      isValid: true,
      value: null,
      serialized: ""
    };
  }
  if (!/^\d+$/.test(normalized)) {
    return {
      isValid: false,
      value: null,
      serialized: normalized
    };
  }
  const numericValue = Number(normalized);
  return {
    isValid: Number.isInteger(numericValue) && numericValue >= 0,
    value: Number.isInteger(numericValue) && numericValue >= 0 ? numericValue : null,
    serialized: String(numericValue)
  };
}
function getChecklistProgressSummary(item) {
  const checklistItems = getHabitChecklistItemsValue(item);
  const checkedIds = new Set(
    Array.isArray(item?.progressDataJson?.checkedItemIds) ? item.progressDataJson.checkedItemIds : []
  );
  return `${[...checkedIds].filter((entry) => checklistItems.some((itemEntry) => itemEntry.id === entry)).length}/${checklistItems.length}`;
}
function QueueStatusPill({ status, label }) {
  return /* @__PURE__ */ React4.createElement("span", { className: ["habitosView__queueStatusPill", `is-${status || "pending"}`].join(" ") }, label);
}
function QuantityQueueInput({
  item,
  disabled = false,
  onCommit
}) {
  const committedValue = getOccurrenceQuantityDraftValue(item);
  const [draftValue, setDraftValue] = useState3(committedValue);
  const isCommittingRef = useRef3(false);
  const lastSubmittedValueRef = useRef3(committedValue);
  useEffect3(() => {
    setDraftValue(committedValue);
    lastSubmittedValueRef.current = committedValue;
  }, [committedValue, item.recordId]);
  const commitDraftValue = (rawValue, { resetOnInvalid = false } = {}) => {
    const parsed = parseOccurrenceQuantityDraftValue(rawValue);
    if (!parsed.isValid) {
      if (resetOnInvalid) {
        setDraftValue(committedValue);
      }
      return;
    }
    if (parsed.serialized === lastSubmittedValueRef.current || isCommittingRef.current) {
      return;
    }
    isCommittingRef.current = true;
    lastSubmittedValueRef.current = parsed.serialized;
    Promise.resolve(onCommit?.(parsed.value)).catch(() => {
      lastSubmittedValueRef.current = committedValue;
      setDraftValue(committedValue);
    }).finally(() => {
      isCommittingRef.current = false;
    });
  };
  useEffect3(() => {
    const parsed = parseOccurrenceQuantityDraftValue(draftValue);
    if (!parsed.isValid || disabled || parsed.serialized === lastSubmittedValueRef.current || isCommittingRef.current) {
      return void 0;
    }
    const timeoutId = window.setTimeout(() => {
      commitDraftValue(draftValue);
    }, 420);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [committedValue, disabled, draftValue, onCommit]);
  return /* @__PURE__ */ React4.createElement(
    "input",
    {
      className: "habitosView__queueNumberInput",
      type: "number",
      min: "0",
      step: "1",
      inputMode: "numeric",
      value: draftValue,
      placeholder: "0",
      disabled,
      onChange: (event) => setDraftValue(event.target.value),
      onBlur: () => commitDraftValue(draftValue, { resetOnInvalid: true }),
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitDraftValue(draftValue, { resetOnInvalid: true });
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setDraftValue(committedValue);
        }
      }
    }
  );
}
function QueueItemCard({
  item,
  categoryCatalog = [],
  presetOverrides = {},
  isSelected = false,
  saving = false,
  resultEditable = true,
  onToggle,
  onContextMenu,
  onCommitQuantity,
  onToggleChecklistItem,
  onToggleChecklistExpanded,
  isChecklistExpanded = false
}) {
  const accent = resolveQueueCategoryPresentation(item, categoryCatalog, presetOverrides);
  const toggleMeta = getQueueToggleMeta(item);
  const isSettled = isQueueItemSettled(item);
  const checklistItems = item.type === "habit" && item.progressMode === "checklist" ? getHabitChecklistItemsValue(item) : [];
  const checkedIds = new Set(
    Array.isArray(item?.progressDataJson?.checkedItemIds) ? item.progressDataJson.checkedItemIds : []
  );
  const controlsDisabled = saving || !resultEditable;
  return /* @__PURE__ */ React4.createElement(
    "article",
    {
      className: [
        "habitosView__queueItem",
        item.isOverdue ? "is-overdue" : "",
        isSelected ? "is-selected" : "",
        item.status ? `is-status-${item.status}` : "",
        isSettled ? "is-settled" : ""
      ].filter(Boolean).join(" "),
      onContextMenu: (event) => onContextMenu?.(event, item)
    },
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: "habitosView__queueBadge",
        style: { "--habitos-item-accent": accent.color },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React4.createElement(RemoteCategoryIcon, { iconId: accent.iconId, color: accent.color })
    ),
    /* @__PURE__ */ React4.createElement("div", { className: "habitosView__queueCopy" }, /* @__PURE__ */ React4.createElement("strong", null, item.title)),
    /* @__PURE__ */ React4.createElement("div", { className: "habitosView__queueActions" }, item.type === "habit" && item.progressMode === "quantity" ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, shouldShowQueueStatusPill(item) ? /* @__PURE__ */ React4.createElement(QueueStatusPill, { status: item.status, label: item.statusLabel }) : null, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__queueQuantityControl" }, /* @__PURE__ */ React4.createElement(
      QuantityQueueInput,
      {
        item,
        disabled: controlsDisabled,
        onCommit: (value) => onCommitQuantity?.(item, value)
      }
    ))) : null, item.type === "habit" && item.progressMode === "checklist" ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, shouldShowQueueStatusPill(item) ? /* @__PURE__ */ React4.createElement(QueueStatusPill, { status: item.status, label: item.statusLabel }) : null, /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: ["habitosView__queueExpand", isChecklistExpanded ? "is-expanded" : ""].filter(Boolean).join(" "),
        onClick: () => onToggleChecklistExpanded?.(item.recordId),
        disabled: saving,
        "aria-expanded": isChecklistExpanded ? "true" : "false"
      },
      /* @__PURE__ */ React4.createElement(ChevronRightIcon, null),
      /* @__PURE__ */ React4.createElement("span", null, "Sub-items ", getChecklistProgressSummary(item))
    )) : null, toggleMeta ? /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: ["habitosView__queueCheck", toggleMeta.className].filter(Boolean).join(" "),
        onClick: onToggle,
        "aria-label": toggleMeta.ariaLabel,
        "aria-pressed": toggleMeta.isPressed ? "true" : "false",
        disabled: controlsDisabled
      },
      toggleMeta.content
    ) : null),
    item.type === "habit" && item.progressMode === "checklist" ? /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: [
          "habitosView__queueChecklistRegion",
          isChecklistExpanded ? "is-expanded" : ""
        ].filter(Boolean).join(" "),
        "aria-hidden": isChecklistExpanded ? void 0 : "true"
      },
      /* @__PURE__ */ React4.createElement("div", { className: "habitosView__queueChecklist" }, checklistItems.map((checklistItem) => {
        const isCompleted = checkedIds.has(checklistItem.id);
        return /* @__PURE__ */ React4.createElement(
          "button",
          {
            key: checklistItem.id,
            type: "button",
            className: ["habitosView__queueChecklistItem", isCompleted ? "is-completed" : ""].filter(Boolean).join(" "),
            onClick: () => onToggleChecklistItem?.(item, checklistItem.id),
            disabled: controlsDisabled || !isChecklistExpanded,
            tabIndex: isChecklistExpanded ? 0 : -1
          },
          /* @__PURE__ */ React4.createElement("span", { className: "habitosView__queueChecklistMark", "aria-hidden": "true" }, isCompleted ? /* @__PURE__ */ React4.createElement(CheckIcon, null) : null),
          /* @__PURE__ */ React4.createElement("span", null, checklistItem.title)
        );
      }))
    ) : null
  );
}
function DraftNumberInput({
  value,
  onChange,
  onCommit,
  ...inputProps
}) {
  return /* @__PURE__ */ React4.createElement(
    "input",
    {
      ...inputProps,
      type: "number",
      value,
      onChange: (event) => onChange(event.target.value),
      onBlur: (event) => onCommit?.(event.target.value)
    }
  );
}
function StepperNumberInput({
  value,
  onChange,
  onCommit,
  min,
  max,
  step = 1,
  disabled = false,
  ...inputProps
}) {
  const minValue = Number.isFinite(Number(min)) ? Number(min) : null;
  const maxValue = Number.isFinite(Number(max)) ? Number(max) : null;
  const stepValue = Number.isFinite(Number(step)) && Number(step) > 0 ? Number(step) : 1;
  const currentValue = Number(String(value ?? "").trim());
  const hasNumericValue = Number.isFinite(currentValue);
  const clampValue = (nextValue) => {
    let normalizedValue = nextValue;
    if (minValue !== null) {
      normalizedValue = Math.max(minValue, normalizedValue);
    }
    if (maxValue !== null) {
      normalizedValue = Math.min(maxValue, normalizedValue);
    }
    return Math.round(normalizedValue);
  };
  const commitValue = (rawValue) => {
    onCommit?.(rawValue);
  };
  const adjustValue = (direction) => {
    if (disabled) {
      return;
    }
    const baseValue = hasNumericValue ? currentValue : minValue ?? 0;
    const nextValue = String(clampValue(baseValue + direction * stepValue));
    onChange(nextValue);
    commitValue(nextValue);
  };
  const isDecrementDisabled = disabled || hasNumericValue && minValue !== null && currentValue <= minValue;
  const isIncrementDisabled = disabled || hasNumericValue && maxValue !== null && currentValue >= maxValue;
  return /* @__PURE__ */ React4.createElement("div", { className: ["habitosView__numberStepper", disabled ? "is-disabled" : ""].filter(Boolean).join(" ") }, /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      className: "habitosView__numberStepperButton",
      onClick: () => adjustValue(-1),
      disabled: isDecrementDisabled,
      "aria-label": "Bajar valor"
    },
    /* @__PURE__ */ React4.createElement(ChevronLeftIcon, null)
  ), /* @__PURE__ */ React4.createElement(
    "input",
    {
      ...inputProps,
      type: "number",
      inputMode: "numeric",
      min,
      max,
      step,
      value,
      disabled,
      onChange: (event) => onChange(event.target.value),
      onBlur: (event) => commitValue(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitValue(event.currentTarget.value);
        }
      }
    }
  ), /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      className: "habitosView__numberStepperButton",
      onClick: () => adjustValue(1),
      disabled: isIncrementDisabled,
      "aria-label": "Subir valor"
    },
    /* @__PURE__ */ React4.createElement(ChevronRightIcon, null)
  ));
}
function DateDraftInput({
  value,
  onChange,
  showTodayLabel = false,
  ...inputProps
}) {
  const isTodayDefault = showTodayLabel && value === todayLocalDate();
  return /* @__PURE__ */ React4.createElement("div", { className: ["habitosView__dateField", isTodayDefault ? "is-default-today" : ""].filter(Boolean).join(" ") }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      ...inputProps,
      className: "habitosView__dateFieldInput",
      type: "date",
      value,
      onChange: (event) => onChange(event.target.value)
    }
  ), isTodayDefault ? /* @__PURE__ */ React4.createElement("span", { className: "habitosView__dateFieldGhost", "aria-hidden": "true" }, "Hoy") : null);
}
function FloatingWorkbenchModal({
  isVisible,
  saving = false,
  onClose,
  layout = "centered",
  children
}) {
  if (!isVisible) {
    return null;
  }
  return /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: ["habitosView__modalBackdrop", layout === "drawer" ? "is-drawer" : ""].filter(Boolean).join(" "),
      onClick: () => {
        if (!saving) {
          onClose?.();
        }
      }
    },
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: ["habitosView__modalShell", layout === "drawer" ? "is-drawer" : ""].filter(Boolean).join(" "),
        onClick: (event) => event.stopPropagation()
      },
      children
    )
  );
}
function CreateChooserModal({
  onTask,
  onHabit,
  onCancel
}) {
  return /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Crear nuevo" })), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__createChoiceGrid" }, /* @__PURE__ */ React4.createElement("button", { type: "button", className: "habitosView__createChoice", onClick: onTask }, /* @__PURE__ */ React4.createElement("strong", null, "Tarea"), /* @__PURE__ */ React4.createElement("span", null, "Actividad de instancia unica sin seguimiento en el tiempo.")), /* @__PURE__ */ React4.createElement("button", { type: "button", className: "habitosView__createChoice", onClick: onHabit }, /* @__PURE__ */ React4.createElement("strong", null, "Habito"), /* @__PURE__ */ React4.createElement("span", null, "Actividad que se repite en el tiempo. Posee un seguimiento detallado y estadisticas."))), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onCancel }, "Cancelar")));
}
function buildHabitCategoryOptions(customCategories = [], selectedCategory = "", presetOverrides = {}) {
  const nextOptions = buildEffectivePresetCategories(presetOverrides);
  const knownNames = new Set(nextOptions.map((entry) => normalizeCategoryNameValue(entry.value)));
  for (const entry of customCategories) {
    const normalizedName = normalizeCategoryNameValue(entry?.name);
    if (!normalizedName || knownNames.has(normalizedName)) {
      continue;
    }
    nextOptions.push({
      kind: "custom",
      value: entry.name,
      label: entry.name,
      iconId: entry.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
      color: entry.color || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR
    });
    knownNames.add(normalizedName);
  }
  const normalizedSelectedCategory = normalizeCategoryNameValue(selectedCategory);
  if (normalizedSelectedCategory && !knownNames.has(normalizedSelectedCategory)) {
    nextOptions.push({
      kind: "custom",
      value: selectedCategory,
      label: selectedCategory,
      iconId: DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
      color: DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR
    });
  }
  return nextOptions;
}
function RemoteCategoryIcon({
  iconId,
  color: color2 = "#111111",
  size = "m"
}) {
  const [svgMarkup, setSvgMarkup] = useState3(() => getCachedIconSvgMarkup(iconId));
  useEffect3(() => {
    let isCancelled = false;
    if (!iconId) {
      setSvgMarkup(null);
      return () => {
        isCancelled = true;
      };
    }
    const cachedMarkup = getCachedIconSvgMarkup(iconId);
    if (cachedMarkup) {
      setSvgMarkup(cachedMarkup);
    } else {
      setSvgMarkup(null);
    }
    void loadIconSvgMarkup(iconId).then((markup) => {
      if (!isCancelled) {
        setSvgMarkup(markup || null);
      }
    }).catch(() => {
      if (!isCancelled) {
        setSvgMarkup(null);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [iconId]);
  return /* @__PURE__ */ React4.createElement(
    "span",
    {
      className: ["habitosView__remoteCategoryIcon", `is-${size}`].join(" "),
      style: { color: color2 },
      "aria-hidden": "true"
    },
    svgMarkup ? /* @__PURE__ */ React4.createElement(
      "span",
      {
        className: "app-icon__svg",
        dangerouslySetInnerHTML: { __html: svgMarkup }
      }
    ) : null
  );
}
function HabitCategoryColorControl({
  value,
  disabled = false,
  onChange
}) {
  const normalizedValue = normalizeHexColorDraftValue(value, DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR);
  return /* @__PURE__ */ React4.createElement("label", { className: "habitosView__categoryColorControl" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      className: "habitosView__categoryColorInput",
      type: "color",
      value: normalizedValue,
      disabled,
      onChange: (event) => onChange(event.target.value),
      "aria-label": "Elegir color de categoria"
    }
  ), /* @__PURE__ */ React4.createElement(
    "input",
    {
      className: "habitosView__categoryColorText",
      type: "text",
      value: normalizedValue.toUpperCase(),
      disabled,
      onChange: (event) => onChange(event.target.value),
      "aria-label": "Color hexadecimal de categoria"
    }
  ));
}
function CategoryOptionCard({
  title,
  iconId,
  color: color2,
  isSelected = false,
  isCreate = false,
  onContextMenu,
  onClick
}) {
  return /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      className: [
        "habitosView__categoryOptionCard",
        isSelected ? "is-selected" : "",
        isCreate ? "is-create" : ""
      ].filter(Boolean).join(" "),
      onClick,
      onContextMenu
    },
    /* @__PURE__ */ React4.createElement("strong", null, title),
    /* @__PURE__ */ React4.createElement(
      "span",
      {
        className: "habitosView__categoryOptionIcon",
        style: isCreate ? void 0 : { background: color2 || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React4.createElement(RemoteCategoryIcon, { iconId, size: "xl" })
    )
  );
}
function CustomHabitCategoryBuilder({
  draft,
  saving,
  error = "",
  onChange,
  onCancel,
  onSave
}) {
  const [catalogIcons, setCatalogIcons] = useState3([]);
  const [catalogLoading, setCatalogLoading] = useState3(true);
  const [catalogError, setCatalogError] = useState3("");
  const [iconSearchQuery, setIconSearchQuery] = useState3("");
  const [visibleIconCount, setVisibleIconCount] = useState3(48);
  useEffect3(() => {
    let isActive = true;
    setCatalogLoading(true);
    setCatalogError("");
    void loadUnifiedIconCatalog().then((payload) => {
      if (!isActive) {
        return;
      }
      setCatalogIcons(Array.isArray(payload?.icons) ? payload.icons : []);
      setCatalogLoading(false);
    }).catch((loadError) => {
      if (!isActive) {
        return;
      }
      setCatalogIcons([]);
      setCatalogError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catalogo de iconos.");
      setCatalogLoading(false);
    });
    return () => {
      isActive = false;
    };
  }, []);
  useEffect3(() => {
    setVisibleIconCount(48);
  }, [iconSearchQuery]);
  const searchTokens = tokenizeSearch(iconSearchQuery);
  const filteredIcons = catalogIcons.filter((option) => searchTokens.length === 0 ? true : searchTokens.every((token) => String(option?.searchText || "").includes(token)));
  const visibleIcons = filteredIcons.slice(0, visibleIconCount);
  const showIconLabels = searchTokens.length > 0;
  const selectedColor = normalizeHexColorDraftValue(draft.color, DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR);
  const handleCatalogScroll = (event) => {
    const node = event.currentTarget;
    const remainingScroll = node.scrollHeight - node.scrollTop - node.clientHeight;
    if (remainingScroll > 120 || visibleIconCount >= filteredIcons.length) {
      return;
    }
    setVisibleIconCount((currentValue) => Math.min(currentValue + 48, filteredIcons.length));
  };
  return /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryBuilderPanel" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryBuilderPreview" }, /* @__PURE__ */ React4.createElement(
    "span",
    {
      className: "habitosView__categoryBuilderPreviewIcon",
      style: { background: selectedColor },
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React4.createElement(RemoteCategoryIcon, { iconId: draft.iconId, size: "l" })
  ), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryBuilderPreviewCopy" }, /* @__PURE__ */ React4.createElement("strong", null, String(draft.name || "").trim() || "Nueva categoria"), /* @__PURE__ */ React4.createElement("span", null, draft.iconId.replace(/^[^:]+:/, "")))), /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: draft.name,
      onChange: (event) => onChange("name", event.target.value),
      placeholder: "Nombre de la categoria",
      maxLength: "60"
    }
  ))), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryBuilderTools" }, /* @__PURE__ */ React4.createElement(
    HabitCategoryColorControl,
    {
      value: selectedColor,
      disabled: saving,
      onChange: (value) => onChange("color", value)
    }
  ), /* @__PURE__ */ React4.createElement("label", { className: "habitosView__categoryIconSearch" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "text",
      value: iconSearchQuery,
      onChange: (event) => setIconSearchQuery(event.target.value),
      placeholder: "Buscar icono",
      disabled: saving
    }
  ))), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryIconMeta" }, /* @__PURE__ */ React4.createElement("span", null, catalogLoading ? "Cargando iconos..." : catalogError ? catalogError : `${filteredIcons.length.toLocaleString("es-AR")} iconos`)), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryIconViewport", onScroll: handleCatalogScroll }, /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: [
        "habitosView__categoryIconGrid",
        showIconLabels ? "is-searching" : ""
      ].filter(Boolean).join(" ")
    },
    visibleIcons.map((option) => /* @__PURE__ */ React4.createElement(
      "button",
      {
        key: option.id,
        type: "button",
        className: [
          "habitosView__categoryIconOption",
          draft.iconId === option.id ? "is-selected" : "",
          showIconLabels ? "has-label" : ""
        ].filter(Boolean).join(" "),
        onClick: () => onChange("iconId", option.id),
        disabled: saving,
        "aria-label": option.label || option.name
      },
      /* @__PURE__ */ React4.createElement(
        RemoteCategoryIcon,
        {
          iconId: option.id,
          color: "var(--color-text)",
          size: showIconLabels ? "xl" : "l"
        }
      ),
      showIconLabels ? /* @__PURE__ */ React4.createElement("span", { className: "habitosView__categoryIconOptionLabel" }, option.label || option.name || option.id.replace(/^[^:]+:/, "")) : null
    ))
  )), error ? /* @__PURE__ */ React4.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React4.createElement(
    Button,
    {
      type: "button",
      tone: "primary",
      onClick: onSave,
      disabled: saving || !String(draft.name || "").trim()
    },
    saving ? "Guardando..." : "Crear categoria"
  ), /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar")));
}
function HabitCategoryPicker({
  categories = [],
  presetOverrides = {},
  selectedCategory = "",
  saving = false,
  builderOpen = false,
  builderDraft,
  builderError = "",
  onSelectCategory,
  onOpenBuilder,
  onCloseBuilder,
  onChangeCategoryBuilder,
  onSaveBuilder,
  onOpenCategoryMenu
}) {
  const categoryOptions = buildHabitCategoryOptions(categories, selectedCategory, presetOverrides);
  return /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, "Categoria"), /* @__PURE__ */ React4.createElement("span", null, "Elige una categoria o crea una propia sin salir del wizard.")), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryOptionGrid" }, categoryOptions.map((option) => /* @__PURE__ */ React4.createElement(
    CategoryOptionCard,
    {
      key: option.value,
      title: option.label,
      iconId: option.iconId,
      color: option.color,
      isSelected: selectedCategory === option.value,
      onClick: () => onSelectCategory(option.value),
      onContextMenu: option.kind === "custom" ? (event) => onOpenCategoryMenu?.(event, option) : void 0
    }
  )), /* @__PURE__ */ React4.createElement(
    CategoryOptionCard,
    {
      title: "Crear categoria",
      iconId: "mui:Add",
      isCreate: true,
      isSelected: builderOpen,
      onClick: () => builderOpen ? onCloseBuilder?.() : onOpenBuilder?.()
    }
  )), builderOpen ? /* @__PURE__ */ React4.createElement(
    CustomHabitCategoryBuilder,
    {
      draft: builderDraft,
      saving,
      error: builderError,
      onChange: onChangeCategoryBuilder,
      onCancel: onCloseBuilder,
      onSave: onSaveBuilder
    }
  ) : null);
}
function WizardOptionCard({
  title,
  description,
  isSelected = false,
  disabled = false,
  onClick
}) {
  return /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      className: [
        "habitosView__wizardOptionCard",
        isSelected ? "is-selected" : ""
      ].filter(Boolean).join(" "),
      onClick,
      disabled
    },
    /* @__PURE__ */ React4.createElement("strong", null, title),
    /* @__PURE__ */ React4.createElement("span", null, description),
    disabled ? /* @__PURE__ */ React4.createElement("small", null, "Sin soporte por ahora") : null
  );
}
function SecondaryListCard({
  className = "",
  title,
  items,
  renderItem,
  emptyTitle = "Sin elementos.",
  dashboardEditMode = false
}) {
  return /* @__PURE__ */ React4.createElement(
    SectionPanel,
    {
      className: [
        "habitosDashboard__widget",
        "habitosView__secondaryPanel",
        className
      ].filter(Boolean).join(" ")
    },
    /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(DashboardPanelTitle, { title, editMode: dashboardEditMode })),
    /* @__PURE__ */ React4.createElement("div", { className: "habitosDashboard__widgetBody habitosView__secondaryPanelBody" }, items.length ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__secondaryList" }, items.map(renderItem)) : /* @__PURE__ */ React4.createElement(StateBlock, { title: emptyTitle }))
  );
}
function HabitListItem({
  habit,
  categoryCatalog = [],
  presetOverrides = {},
  isSelected = false,
  onSelect
}) {
  const accent = resolveQueueCategoryPresentation({
    type: "habit",
    title: habit.title,
    category: habit.category
  }, categoryCatalog, presetOverrides);
  const summaryParts = [];
  if (habit.category) {
    summaryParts.push(habit.category);
  }
  summaryParts.push(formatHabitSchedule(habit));
  return /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      className: [
        "habitosView__habitRow",
        isSelected ? "is-selected" : ""
      ].filter(Boolean).join(" "),
      onClick: onSelect
    },
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: "habitosView__habitRowBadge",
        style: { "--habitos-item-accent": accent.color },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React4.createElement(RemoteCategoryIcon, { iconId: accent.iconId, color: accent.color })
    ),
    /* @__PURE__ */ React4.createElement("div", { className: "habitosView__habitRowCopy" }, /* @__PURE__ */ React4.createElement("strong", null, habit.title), /* @__PURE__ */ React4.createElement("span", null, summaryParts.join(" - "))),
    /* @__PURE__ */ React4.createElement("span", { className: ["habitosView__habitStatus", habit.status !== "active" ? "is-paused" : ""].filter(Boolean).join(" ") }, getHabitStatusLabel(habit.status))
  );
}
function HabitsGroup({
  title,
  habits,
  categoryCatalog = [],
  presetOverrides = {},
  selectedHabitId,
  onSelectHabit,
  emptyTitle
}) {
  return /* @__PURE__ */ React4.createElement("div", { className: "habitosView__habitGroup" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__habitGroupHeader" }, /* @__PURE__ */ React4.createElement("strong", null, title), /* @__PURE__ */ React4.createElement("span", null, habits.length)), habits.length ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__habitGroupList" }, habits.map((habit) => /* @__PURE__ */ React4.createElement(
    HabitListItem,
    {
      key: habit.id,
      habit,
      categoryCatalog,
      presetOverrides,
      isSelected: habit.id === selectedHabitId,
      onSelect: () => onSelectHabit(habit.id)
    }
  ))) : /* @__PURE__ */ React4.createElement(StateBlock, { title: emptyTitle }));
}
function HabitDetailsPanel({
  habit,
  home,
  presetOverrides = {},
  saving,
  onEdit,
  onToggleStatus
}) {
  const latestHistoryEntry = getLatestHabitHistoryEntry(home, habit.id);
  const todaySummary = getHabitTodaySummary(home, habit);
  const progressOption = getHabitProgressOption(habit.progressMode);
  const checklistItems = getHabitChecklistItemsValue(habit);
  const accent = resolveQueueCategoryPresentation({
    type: "habit",
    title: habit.title,
    category: habit.category
  }, home?.categoryCatalog || [], presetOverrides);
  const detailItems = [
    { label: "Estado", value: getHabitStatusLabel(habit.status) },
    { label: "Frecuencia", value: formatHabitSchedule(habit) },
    { label: "Inicio", value: formatLocalDate(habit.startDate) },
    { label: "Fin", value: habit.endDate ? formatLocalDate(habit.endDate) : "Sin cierre" },
    { label: "Hora", value: habit.time || "Sin hora" },
    { label: "Prioridad", value: getPriorityLabel(habit.priority) }
  ];
  if (habit.category) {
    detailItems.unshift({
      label: "Categoria",
      value: habit.category
    });
  }
  return /* @__PURE__ */ React4.createElement(ScrollRegion, { className: "habitosView__habitDetailScroll" }, /* @__PURE__ */ React4.createElement(PanelStack, null, /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "habitosView__habitDetailActions" }, /* @__PURE__ */ React4.createElement(
        Button,
        {
          type: "button",
          tone: habit.status === "active" ? "secondary" : "primary",
          onClick: onToggleStatus,
          disabled: saving
        },
        habit.status === "active" ? "Pausar habito" : "Reactivar habito"
      ), /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onEdit, disabled: saving }, /* @__PURE__ */ React4.createElement(PencilIcon, null), /* @__PURE__ */ React4.createElement("span", null, "Editar")))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Habito",
        title: habit.title,
        description: formatHabitSchedule(habit)
      }
    )
  ), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__habitDetailHero" }, /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: "habitosView__habitDetailHeroBadge",
      style: { "--habitos-item-accent": accent.color },
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React4.createElement(RemoteCategoryIcon, { iconId: accent.iconId, color: accent.color, size: "xxl" })
  ), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaList" }, detailItems.map((item) => /* @__PURE__ */ React4.createElement("div", { key: item.label, className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, item.label), /* @__PURE__ */ React4.createElement("strong", null, item.value)))))), /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "soft" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Evaluacion" })), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaList habitosView__detailMetaList--section" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, "Tipo"), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaContent" }, /* @__PURE__ */ React4.createElement("strong", null, getHabitProgressLabel(habit)), progressOption?.description ? /* @__PURE__ */ React4.createElement("small", null, progressOption.description) : null)), habit.progressMode === "quantity" ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, "Objetivo"), /* @__PURE__ */ React4.createElement("strong", null, getHabitQuantitySummary(habit))) : null, habit.progressMode === "checklist" ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaRow is-stack" }, /* @__PURE__ */ React4.createElement("span", null, "Sub-items"), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaContent" }, checklistItems.length ? /* @__PURE__ */ React4.createElement("ul", { className: "habitosView__detailCompactList" }, checklistItems.map((item) => /* @__PURE__ */ React4.createElement("li", { key: item.id }, item.title))) : /* @__PURE__ */ React4.createElement("small", null, "Sin sub-items definidos."))) : null)), /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "soft" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Actividad" })), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaList habitosView__detailMetaList--section" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, "Dia visible"), /* @__PURE__ */ React4.createElement("strong", null, todaySummary)), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, "Ultimo registro"), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__detailMetaContent" }, /* @__PURE__ */ React4.createElement("strong", null, latestHistoryEntry ? latestHistoryEntry.statusLabel : "Sin actividad reciente"), latestHistoryEntry ? /* @__PURE__ */ React4.createElement("small", null, formatLocalDateTime(latestHistoryEntry.timestamp), " - ", latestHistoryEntry.summary) : null)))), habit.notes ? /* @__PURE__ */ React4.createElement(SectionPanel, null, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Notas" })), /* @__PURE__ */ React4.createElement("p", { className: "habitosView__habitNotes" }, habit.notes)) : null));
}
function HabitsSettingsSection({
  habits,
  selectedHabitId,
  home,
  presetOverrides = {},
  saving,
  onCreateHabit,
  onSelectHabit,
  onEditHabit,
  onToggleHabitStatus
}) {
  const activeHabits = habits.filter((habit) => habit.status === "active");
  const pausedHabits = habits.filter((habit) => habit.status !== "active");
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) || null;
  return /* @__PURE__ */ React4.createElement(SplitLayout, { variant: "sidebar-detail", className: "habitosView__habitSplit" }, /* @__PURE__ */ React4.createElement(SplitSidebar, { className: "habitosView__habitSidebar" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__settingsSectionHeader" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__settingsSectionCopy" }, /* @__PURE__ */ React4.createElement("strong", null, "Habitos"), /* @__PURE__ */ React4.createElement("span", null, "Activos y en pausa")), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: onCreateHabit, disabled: saving }, "Nuevo habito")), /* @__PURE__ */ React4.createElement(ScrollRegion, { className: "habitosView__habitSidebarScroll" }, habits.length ? /* @__PURE__ */ React4.createElement(PanelStack, { className: "habitosView__habitSidebarStack" }, /* @__PURE__ */ React4.createElement(
    HabitsGroup,
    {
      title: "Activos",
      habits: activeHabits,
      categoryCatalog: home.categoryCatalog,
      presetOverrides,
      selectedHabitId,
      onSelectHabit,
      emptyTitle: "Sin habitos activos."
    }
  ), /* @__PURE__ */ React4.createElement(
    HabitsGroup,
    {
      title: "En pausa",
      habits: pausedHabits,
      categoryCatalog: home.categoryCatalog,
      presetOverrides,
      selectedHabitId,
      onSelectHabit,
      emptyTitle: "Sin habitos en pausa."
    }
  )) : /* @__PURE__ */ React4.createElement(
    StateBlock,
    {
      title: "Todavia no hay habitos.",
      description: "Crea uno nuevo para administrarlo desde aqui."
    },
    /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: onCreateHabit, disabled: saving }, "Crear habito")
  ))), /* @__PURE__ */ React4.createElement(SplitDetail, { className: "habitosView__habitDetail" }, selectedHabit ? /* @__PURE__ */ React4.createElement(
    HabitDetailsPanel,
    {
      habit: selectedHabit,
      home,
      presetOverrides,
      saving,
      onEdit: () => onEditHabit(selectedHabit),
      onToggleStatus: () => onToggleHabitStatus(selectedHabit)
    }
  ) : /* @__PURE__ */ React4.createElement(
    StateBlock,
    {
      title: habits.length ? "Selecciona un habito." : "Sin detalles por mostrar.",
      description: habits.length ? "Elige un habito de la lista para ver su operativa." : ""
    }
  )));
}
function CategorySettingsListItem({
  category,
  isSelected = false,
  onSelect
}) {
  return /* @__PURE__ */ React4.createElement(
    "button",
    {
      type: "button",
      className: ["habitosView__categorySettingRow", isSelected ? "is-selected" : ""].filter(Boolean).join(" "),
      onClick: onSelect
    },
    /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categorySettingRowCopy" }, /* @__PURE__ */ React4.createElement("strong", null, category.name)),
    /* @__PURE__ */ React4.createElement(
      "span",
      {
        className: "habitosView__categorySettingRowBadge",
        style: { background: category.color },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React4.createElement(RemoteCategoryIcon, { iconId: category.iconId, size: "l" })
    )
  );
}
function CategorySettingsSection({
  categories,
  selectedCategoryId,
  selectedCategory,
  builderOpen,
  builderDraft,
  builderError,
  saving,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onChangeCategoryBuilder,
  onSaveCategoryBuilder,
  onCloseCategoryBuilder
}) {
  return /* @__PURE__ */ React4.createElement(SplitLayout, { variant: "sidebar-detail", className: "habitosView__habitSplit" }, /* @__PURE__ */ React4.createElement(SplitSidebar, { className: "habitosView__habitSidebar" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__settingsSectionHeader" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__settingsSectionCopy" }, /* @__PURE__ */ React4.createElement("strong", null, "Categorias"), /* @__PURE__ */ React4.createElement("span", null, "Color e icono")), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: onCreateCategory, disabled: saving }, "Nueva categoria")), /* @__PURE__ */ React4.createElement(ScrollRegion, { className: "habitosView__habitSidebarScroll" }, categories.length ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categorySettingsList" }, categories.map((category) => /* @__PURE__ */ React4.createElement(
    CategorySettingsListItem,
    {
      key: category.id,
      category,
      isSelected: selectedCategoryId === category.id,
      onSelect: () => onSelectCategory(category.id)
    }
  ))) : /* @__PURE__ */ React4.createElement(
    StateBlock,
    {
      title: "Sin categorias.",
      description: "Crea una categoria para reutilizarla en tus habitos."
    },
    /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: onCreateCategory, disabled: saving }, "Crear categoria")
  ))), /* @__PURE__ */ React4.createElement(SplitDetail, { className: "habitosView__habitDetail" }, builderOpen ? /* @__PURE__ */ React4.createElement(PanelStack, null, /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(
    PanelTitle,
    {
      title: builderDraft?.id ? "Editar categoria" : "Nueva categoria"
    }
  )), /* @__PURE__ */ React4.createElement(
    CustomHabitCategoryBuilder,
    {
      draft: builderDraft,
      saving,
      error: builderError,
      onChange: onChangeCategoryBuilder,
      onCancel: onCloseCategoryBuilder,
      onSave: onSaveCategoryBuilder
    }
  ))) : selectedCategory ? /* @__PURE__ */ React4.createElement(PanelStack, null, /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "habitosView__habitDetailActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => onEditCategory(selectedCategory), disabled: saving }, /* @__PURE__ */ React4.createElement(PencilIcon, null), /* @__PURE__ */ React4.createElement("span", null, "Editar")), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "danger", onClick: () => onDeleteCategory(selectedCategory), disabled: saving }, /* @__PURE__ */ React4.createElement(TrashIcon, null), /* @__PURE__ */ React4.createElement("span", null, "Eliminar")))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        title: selectedCategory.name,
        description: selectedCategory.kind === "preset" ? "Categoria base" : "Categoria personalizada"
      }
    )
  ), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryDetailHero" }, /* @__PURE__ */ React4.createElement(
    "span",
    {
      className: "habitosView__categoryDetailHeroIcon",
      style: { background: selectedCategory.color },
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React4.createElement(RemoteCategoryIcon, { iconId: selectedCategory.iconId, size: "xxl" })
  ), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryMetaList" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, "Nombre"), /* @__PURE__ */ React4.createElement("strong", null, selectedCategory.name)), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, "Color"), /* @__PURE__ */ React4.createElement("strong", null, selectedCategory.color.toUpperCase())), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__categoryMetaRow" }, /* @__PURE__ */ React4.createElement("span", null, "Icono"), /* @__PURE__ */ React4.createElement("strong", null, selectedCategory.iconId.replace(/^[^:]+:/, ""))))))) : /* @__PURE__ */ React4.createElement(
    StateBlock,
    {
      title: categories.length ? "Selecciona una categoria." : "Sin detalles por mostrar.",
      description: categories.length ? "Elige una categoria para editarla o eliminarla." : ""
    }
  )));
}
function SettingsDrawer({
  activeTab,
  habits,
  selectedHabitId,
  home,
  presetOverrides = {},
  saving,
  onClose,
  onChangeTab,
  onCreateHabit,
  onSelectHabit,
  onEditHabit,
  onToggleHabitStatus,
  categories,
  selectedCategoryId,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  categoryBuilderOpen,
  categoryBuilderDraft,
  categoryBuilderError,
  onChangeCategoryBuilder,
  onSaveCategoryBuilder,
  onCloseCategoryBuilder
}) {
  const tabOptions = [
    { id: "habits", label: "Habitos" },
    { id: "categories", label: "Categorias" }
  ];
  return /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel habitosView__drawerPanel" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "habitosView__drawerHeaderActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onClose, disabled: saving }, "Cerrar"))
    },
    /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Configuraciones" })
  ), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__drawerBody" }, /* @__PURE__ */ React4.createElement(SplitLayout, { variant: "sidebar-detail", className: "habitosView__settingsSplit" }, /* @__PURE__ */ React4.createElement(SplitSidebar, { className: "habitosView__settingsSidebar" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__settingsTabs" }, tabOptions.map((tab) => /* @__PURE__ */ React4.createElement(
    "button",
    {
      key: tab.id,
      type: "button",
      className: ["habitosView__settingsTab", activeTab === tab.id ? "is-active" : ""].filter(Boolean).join(" "),
      onClick: () => onChangeTab(tab.id)
    },
    /* @__PURE__ */ React4.createElement("span", null, tab.label)
  )))), /* @__PURE__ */ React4.createElement(SplitDetail, { className: "habitosView__settingsDetail" }, activeTab === "habits" ? /* @__PURE__ */ React4.createElement(
    HabitsSettingsSection,
    {
      habits,
      selectedHabitId,
      home,
      presetOverrides,
      saving,
      onCreateHabit,
      onSelectHabit,
      onEditHabit,
      onToggleHabitStatus
    }
  ) : /* @__PURE__ */ React4.createElement(
    CategorySettingsSection,
    {
      categories,
      selectedCategoryId,
      selectedCategory,
      builderOpen: categoryBuilderOpen,
      builderDraft: categoryBuilderDraft,
      builderError: categoryBuilderError,
      saving,
      onSelectCategory,
      onCreateCategory,
      onEditCategory,
      onDeleteCategory,
      onChangeCategoryBuilder,
      onSaveCategoryBuilder,
      onCloseCategoryBuilder
    }
  )))));
}
function TaskEditor({
  draft,
  advancedOpen,
  saving,
  onChange,
  onSubitemChange,
  onAddSubitem,
  onRemoveSubitem,
  onToggleAdvanced,
  onCommitNumber,
  onSubmit,
  onCancel
}) {
  return /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onToggleAdvanced }, advancedOpen ? "Ocultar avanzado" : "Mostrar avanzado")
    },
    /* @__PURE__ */ React4.createElement(PanelTitle, { title: draft.id ? "Editar tarea" : "Nueva tarea" })
  ), /* @__PURE__ */ React4.createElement("form", { className: "habitosView__editorForm", onSubmit }, /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: draft.title,
      onChange: (event) => onChange("title", event.target.value),
      placeholder: "Ej. Llamar al tecnico",
      required: true
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Categoria" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: draft.category,
      onChange: (event) => onChange("category", event.target.value),
      placeholder: "Trabajo, hogar, estudio..."
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Fecha" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "date",
      value: draft.dueDate,
      onChange: (event) => onChange("dueDate", event.target.value),
      required: true
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React4.createElement(
    StepperNumberInput,
    {
      min: "1",
      max: "100",
      step: "1",
      value: draft.priority,
      onChange: (value) => onChange("priority", value),
      onCommit: (value) => onCommitNumber("priority", value)
    }
  ))), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__subitemEditor" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, "Sub-items")), draft.subitems.length ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__subitemsDraft" }, draft.subitems.map((subitem, index) => /* @__PURE__ */ React4.createElement("div", { key: subitem.id || index, className: "habitosView__subitemDraftRow" }, /* @__PURE__ */ React4.createElement("label", { className: "habitosView__subitemToggle" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(subitem.isCompleted),
      onChange: (event) => onSubitemChange(index, "isCompleted", event.target.checked)
    }
  ), /* @__PURE__ */ React4.createElement("span", null, "Hecho")), /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: subitem.title,
      onChange: (event) => onSubitemChange(index, "title", event.target.value),
      placeholder: `Paso ${index + 1}`
    }
  ), /* @__PURE__ */ React4.createElement(
    IconButton,
    {
      type: "button",
      "aria-label": "Quitar sub-item",
      tone: "danger",
      onClick: () => onRemoveSubitem(index)
    },
    /* @__PURE__ */ React4.createElement(TrashIcon, null)
  )))) : null, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onAddSubitem }, /* @__PURE__ */ React4.createElement(PlusIcon, null), /* @__PURE__ */ React4.createElement("span", null, "Agregar sub-item"))), advancedOpen ? /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "time",
      value: draft.time,
      onChange: (event) => onChange("time", event.target.value)
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Recordatorio" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "datetime-local",
      value: draft.reminderAt,
      onChange: (event) => onChange("reminderAt", event.target.value)
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React4.createElement(
    "textarea",
    {
      rows: "3",
      value: draft.notes,
      onChange: (event) => onChange("notes", event.target.value),
      placeholder: "Contexto breve para esta tarea."
    }
  )), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__booleanGrid" }, /* @__PURE__ */ React4.createElement("label", { className: "habitosView__booleanField" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.isPersistent),
      onChange: (event) => onChange("isPersistent", event.target.checked)
    }
  ), /* @__PURE__ */ React4.createElement("span", null, "Se mostrara todos los dias hasta completarse")), /* @__PURE__ */ React4.createElement("label", { className: "habitosView__booleanField" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.subitemsBlocking),
      onChange: (event) => onChange("subitemsBlocking", event.target.checked)
    }
  ), /* @__PURE__ */ React4.createElement("span", null, "Los sub-items bloquean el completado")))) : null, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : draft.id ? "Guardar tarea" : "Crear tarea"), /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar"))));
}
function HabitEditor({
  draft,
  categories,
  presetOverrides = {},
  step,
  saving,
  wizardError,
  categoryBuilderOpen,
  categoryBuilderDraft,
  categoryBuilderError,
  onChange,
  onSelectExistingCategory,
  onOpenCategoryBuilder,
  onCloseCategoryBuilder,
  onChangeCategoryBuilder,
  onSaveCategoryBuilder,
  onOpenCategoryMenu,
  onSelectCategory,
  onSelectProgressMode,
  onToggleWeekday,
  onBack,
  onNext,
  onCommitNumber,
  onSubmit,
  onCancel
}) {
  const [draggedChecklistIndex, setDraggedChecklistIndex] = useState3(null);
  const [dropChecklistIndex, setDropChecklistIndex] = useState3(null);
  const checklistDragIntentRef = useRef3(null);
  useEffect3(() => {
    checklistDragIntentRef.current = null;
    setDraggedChecklistIndex(null);
    setDropChecklistIndex(null);
  }, [draft.id, draft.progressMode, step]);
  const resetChecklistDragState = () => {
    checklistDragIntentRef.current = null;
    setDraggedChecklistIndex(null);
    setDropChecklistIndex(null);
  };
  const handleChecklistDrop = (targetIndex) => {
    if (draggedChecklistIndex === null || draggedChecklistIndex === targetIndex) {
      resetChecklistDragState();
      return;
    }
    onChange("moveChecklistItem", {
      fromIndex: draggedChecklistIndex,
      toIndex: targetIndex
    });
    resetChecklistDragState();
  };
  if (draft.id) {
    const isLastStep2 = step === HABIT_EDIT_WIZARD_STEPS.length - 1;
    return /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Editar habito" })), /* @__PURE__ */ React4.createElement("form", { className: "habitosView__editorForm", onSubmit }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__modalStep" }, /* @__PURE__ */ React4.createElement("span", null, "Paso ", step + 1, " de ", HABIT_EDIT_WIZARD_STEPS.length), /* @__PURE__ */ React4.createElement("strong", null, HABIT_EDIT_WIZARD_STEPS[step]?.label || "Paso")), step === 0 ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React4.createElement(
      "input",
      {
        value: draft.title,
        onChange: (event) => onChange("title", event.target.value),
        placeholder: "Ej. Leer 20 minutos",
        required: true
      }
    ))), /* @__PURE__ */ React4.createElement(
      HabitCategoryPicker,
      {
        categories,
        presetOverrides,
        selectedCategory: draft.category,
        saving,
        builderOpen: categoryBuilderOpen,
        builderDraft: categoryBuilderDraft,
        builderError: categoryBuilderError,
        onSelectCategory: onSelectExistingCategory,
        onOpenBuilder: onOpenCategoryBuilder,
        onCloseBuilder: onCloseCategoryBuilder,
        onChangeCategoryBuilder,
        onSaveCategoryBuilder,
        onOpenCategoryMenu
      }
    )) : null, step === 1 ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React4.createElement(Field, { label: "Frecuencia" }, /* @__PURE__ */ React4.createElement(
      "select",
      {
        value: draft.scheduleType,
        onChange: (event) => onChange("scheduleType", event.target.value)
      },
      /* @__PURE__ */ React4.createElement("option", { value: "daily" }, "Todos los dias"),
      /* @__PURE__ */ React4.createElement("option", { value: "weekdays" }, "Dias de la semana")
    )), draft.scheduleType === "weekdays" ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__weekdayGrid" }, WEEKDAY_OPTIONS.map((option) => {
      const active = draft.weekdays.includes(option.value);
      return /* @__PURE__ */ React4.createElement(
        "button",
        {
          key: option.value,
          type: "button",
          className: ["habitosView__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" "),
          onClick: () => onToggleWeekday(option.value)
        },
        option.label
      );
    })) : /* @__PURE__ */ React4.createElement(Notice, { tone: "info" }, "Se genera una ocurrencia por dia.")) : null, step === 2 ? /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Inicio" }, /* @__PURE__ */ React4.createElement(
      "input",
      {
        type: "date",
        value: draft.startDate,
        onChange: (event) => onChange("startDate", event.target.value),
        required: true
      }
    )), /* @__PURE__ */ React4.createElement(Field, { label: "Fin opcional" }, /* @__PURE__ */ React4.createElement(
      "input",
      {
        type: "date",
        value: draft.endDate,
        onChange: (event) => onChange("endDate", event.target.value)
      }
    )), /* @__PURE__ */ React4.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React4.createElement(
      "input",
      {
        type: "time",
        value: draft.time,
        onChange: (event) => onChange("time", event.target.value)
      }
    )), /* @__PURE__ */ React4.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React4.createElement(
      StepperNumberInput,
      {
        min: "1",
        max: "100",
        step: "1",
        value: draft.priority,
        onChange: (value) => onChange("priority", value),
        onCommit: (value) => onCommitNumber("priority", value)
      }
    )), /* @__PURE__ */ React4.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React4.createElement(
      "textarea",
      {
        rows: "3",
        value: draft.notes,
        onChange: (event) => onChange("notes", event.target.value),
        placeholder: "Criterio simple de uso diario."
      }
    ))) : null, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorNav" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onBack, disabled: step === 0 || saving }, /* @__PURE__ */ React4.createElement(ChevronLeftIcon, null), /* @__PURE__ */ React4.createElement("span", null, "Atras")), !isLastStep2 ? /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onNext, disabled: saving }, /* @__PURE__ */ React4.createElement("span", null, "Siguiente"), /* @__PURE__ */ React4.createElement(ChevronRightIcon, null)) : null), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorNav" }, isLastStep2 ? /* @__PURE__ */ React4.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : "Guardar habito") : null, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar")))));
  }
  const isLastStep = step === HABIT_WIZARD_STEPS.length - 1;
  return /* @__PURE__ */ React4.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Nuevo habito" })), /* @__PURE__ */ React4.createElement("form", { className: "habitosView__editorForm", onSubmit }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__modalStep" }, /* @__PURE__ */ React4.createElement("span", null, "Paso ", step + 1, " de ", HABIT_WIZARD_STEPS.length), /* @__PURE__ */ React4.createElement("strong", null, HABIT_WIZARD_STEPS[step]?.label || "Paso")), wizardError ? /* @__PURE__ */ React4.createElement(Notice, { tone: "danger" }, wizardError) : null, step === 0 ? /* @__PURE__ */ React4.createElement(
    HabitCategoryPicker,
    {
      categories,
      presetOverrides,
      selectedCategory: draft.category,
      saving,
      builderOpen: categoryBuilderOpen,
      builderDraft: categoryBuilderDraft,
      builderError: categoryBuilderError,
      onSelectCategory,
      onOpenBuilder: onOpenCategoryBuilder,
      onCloseBuilder: onCloseCategoryBuilder,
      onChangeCategoryBuilder,
      onSaveCategoryBuilder,
      onOpenCategoryMenu
    }
  ) : null, step === 1 ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, "Como quieres evaluarlo?")), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardOptionGrid habitosView__wizardOptionGrid--stacked" }, HABIT_PROGRESS_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement(
    WizardOptionCard,
    {
      key: option.value,
      title: option.label,
      description: option.description,
      isSelected: draft.progressMode === option.value,
      onClick: () => onSelectProgressMode(option.value)
    }
  )))) : null, step === 2 ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardStep" }, draft.progressMode === "yes-no" ? /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: draft.title,
      onChange: (event) => onChange("title", event.target.value),
      placeholder: "Nombre del habito",
      required: true
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Descripcion", wide: true }, /* @__PURE__ */ React4.createElement(
    "textarea",
    {
      rows: "3",
      value: draft.notes,
      onChange: (event) => onChange("notes", event.target.value),
      placeholder: "Descripcion (opcional)"
    }
  ))) : null, draft.progressMode === "quantity" ? /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: draft.title,
      onChange: (event) => onChange("title", event.target.value),
      placeholder: "Nombre del habito",
      required: true
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Objetivo diario", wide: true }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__quantitySentence" }, /* @__PURE__ */ React4.createElement(
    "select",
    {
      value: draft.quantityMode,
      onChange: (event) => onChange("quantityMode", event.target.value)
    },
    HABIT_QUANTITY_MODE_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label))
  ), /* @__PURE__ */ React4.createElement(
    DraftNumberInput,
    {
      min: "0",
      step: "1",
      value: draft.quantityTarget,
      onChange: (value) => onChange("quantityTarget", value),
      onCommit: (value) => onCommitNumber("quantityTarget", value),
      placeholder: "Objetivo int",
      disabled: draft.quantityMode === "no-target"
    }
  ), /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: draft.quantityUnit,
      onChange: (event) => onChange("quantityUnit", event.target.value),
      placeholder: "Unidad (opcional)"
    }
  ), /* @__PURE__ */ React4.createElement("span", { className: "habitosView__quantitySuffix" }, "en el dia"))), /* @__PURE__ */ React4.createElement(Field, { label: "Descripcion", wide: true }, /* @__PURE__ */ React4.createElement(
    "textarea",
    {
      rows: "3",
      value: draft.notes,
      onChange: (event) => onChange("notes", event.target.value),
      placeholder: "Descripcion (opcional)"
    }
  ))) : null, draft.progressMode === "checklist" ? /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      value: draft.title,
      onChange: (event) => onChange("title", event.target.value),
      placeholder: "Nombre del habito",
      required: true
    }
  ))), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__subitemEditor" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, "Sub-items")), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__subitemsDraft" }, draft.checklistItems.map((item, index) => /* @__PURE__ */ React4.createElement(
    "div",
    {
      key: item.id || index,
      className: [
        "habitosView__subitemDraftRow",
        draggedChecklistIndex === index ? "is-dragging" : "",
        dropChecklistIndex === index && draggedChecklistIndex !== index ? "is-drop-target" : ""
      ].filter(Boolean).join(" "),
      draggable: draft.checklistItems.length > 1,
      onDragStart: (event) => {
        if (checklistDragIntentRef.current !== index) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        setDraggedChecklistIndex(index);
        setDropChecklistIndex(index);
      },
      onDragEnd: () => {
        resetChecklistDragState();
      },
      onDragOver: (event) => {
        if (draggedChecklistIndex === null) {
          return;
        }
        event.preventDefault();
        if (dropChecklistIndex !== index) {
          setDropChecklistIndex(index);
        }
      },
      onDrop: (event) => {
        event.preventDefault();
        handleChecklistDrop(index);
      }
    },
    /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: "habitosView__subitemDragHandle",
        "aria-label": "Reordenar item",
        draggable: false,
        onPointerDown: () => {
          checklistDragIntentRef.current = index;
        },
        onPointerUp: () => {
          checklistDragIntentRef.current = null;
        },
        onPointerCancel: () => {
          checklistDragIntentRef.current = null;
        }
      },
      /* @__PURE__ */ React4.createElement("span", null),
      /* @__PURE__ */ React4.createElement("span", null)
    ),
    /* @__PURE__ */ React4.createElement(
      "input",
      {
        value: item.title,
        onChange: (event) => onChange("checklistItem", {
          index,
          value: event.target.value
        }),
        placeholder: "item"
      }
    ),
    /* @__PURE__ */ React4.createElement(
      IconButton,
      {
        type: "button",
        "aria-label": "Eliminar item",
        tone: "danger",
        onClick: () => onChange("removeChecklistItem", index)
      },
      /* @__PURE__ */ React4.createElement(TrashIcon, null)
    )
  ))), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__centeredAction" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => onChange("addChecklistItem") }, "Agregar item")))) : null) : null, step === 3 ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, "Frecuencia")), /* @__PURE__ */ React4.createElement(Field, { label: "Frecuencia" }, /* @__PURE__ */ React4.createElement(
    "select",
    {
      value: draft.scheduleType,
      onChange: (event) => onChange("scheduleType", event.target.value)
    },
    /* @__PURE__ */ React4.createElement("option", { value: "daily" }, "Todos los dias"),
    /* @__PURE__ */ React4.createElement("option", { value: "weekdays" }, "Dias de la semana")
  )), draft.scheduleType === "weekdays" ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__weekdayGrid" }, WEEKDAY_OPTIONS.map((option) => {
    const active = draft.weekdays.includes(option.value);
    return /* @__PURE__ */ React4.createElement(
      "button",
      {
        key: option.value,
        type: "button",
        className: ["habitosView__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" "),
        onClick: () => onToggleWeekday(option.value)
      },
      option.label
    );
  })) : null) : null, step === 4 ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, "Cuando quieres hacerlo?")), /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Fecha de inicio" }, /* @__PURE__ */ React4.createElement(
    DateDraftInput,
    {
      value: draft.startDate,
      onChange: (value) => onChange("startDate", value),
      showTodayLabel: true
    }
  )), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__toggleCard" }, /* @__PURE__ */ React4.createElement("label", { className: "habitosView__booleanField habitosView__booleanField--inline" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.hasEndDate),
      onChange: (event) => onChange("hasEndDate", event.target.checked)
    }
  ), /* @__PURE__ */ React4.createElement("span", null, "Fecha de fin")))), draft.hasEndDate ? /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Fecha de fin" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "date",
      value: draft.endDate,
      onChange: (event) => onChange("endDate", event.target.value)
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Duracion" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__durationField" }, /* @__PURE__ */ React4.createElement(
    DraftNumberInput,
    {
      min: "1",
      step: "1",
      value: draft.durationDays,
      onChange: (value) => onChange("durationDays", value),
      onCommit: (value) => onCommitNumber("durationDays", value)
    }
  ), /* @__PURE__ */ React4.createElement("span", { className: "habitosView__quantitySuffix" }, "dias")))) : null, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__inlineHint" }, "Hora y recordatorios: pronto."), /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React4.createElement(
    StepperNumberInput,
    {
      min: "1",
      max: "100",
      step: "1",
      value: draft.priority,
      onChange: (value) => onChange("priority", value),
      onCommit: (value) => onCommitNumber("priority", value)
    }
  )))) : null, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorNav" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onBack, disabled: step === 0 || saving }, /* @__PURE__ */ React4.createElement(ChevronLeftIcon, null), /* @__PURE__ */ React4.createElement("span", null, "Atras")), ![0, 1].includes(step) && !isLastStep ? /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onNext, disabled: saving }, /* @__PURE__ */ React4.createElement("span", null, "Siguiente"), /* @__PURE__ */ React4.createElement(ChevronRightIcon, null)) : null), /* @__PURE__ */ React4.createElement("div", { className: "habitosView__editorNav" }, isLastStep ? /* @__PURE__ */ React4.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : "Crear habito") : null, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar")))));
}
function HabitosView({ ctx, input = null }) {
  const systemToday = todayLocalDate();
  const pluginSettings = ctx.settings.useValue();
  const dashboardEditMode = Boolean(input?.dashboardEditMode);
  const presetCategoryOverrides = useMemo2(
    () => readHabitCategoryPresetOverrides(pluginSettings),
    [pluginSettings]
  );
  const persistedDashboardLayouts = useMemo2(
    () => readHabitosDashboardLayouts(pluginSettings),
    [pluginSettings]
  );
  const persistedDashboardLayoutsSignature = useMemo2(
    () => getHabitosDashboardLayoutsSignature(persistedDashboardLayouts),
    [persistedDashboardLayouts]
  );
  const [home, setHome] = useState3(createEmptyHome);
  const [loading, setLoading] = useState3(true);
  const [saving, setSaving] = useState3(false);
  const [error, setError] = useState3("");
  const [modalMode, setModalMode] = useState3("overview");
  const [isHabitsDrawerOpen, setIsHabitsDrawerOpen] = useState3(false);
  const [settingsTab, setSettingsTab] = useState3("habits");
  const [selectedHabitId, setSelectedHabitId] = useState3("");
  const [selectedCategoryId, setSelectedCategoryId] = useState3("");
  const [taskDraft, setTaskDraft] = useState3(createTaskDraft());
  const [habitDraft, setHabitDraft] = useState3(createHabitDraft());
  const [habitWizardError, setHabitWizardError] = useState3("");
  const [categoryBuilderOpen, setCategoryBuilderOpen] = useState3(false);
  const [categoryBuilderDraft, setCategoryBuilderDraft] = useState3(createHabitCategoryDraft());
  const [categoryBuilderError, setCategoryBuilderError] = useState3("");
  const [taskAdvancedOpen, setTaskAdvancedOpen] = useState3(false);
  const [habitStep, setHabitStep] = useState3(0);
  const [queueMenu, setQueueMenu] = useState3(null);
  const [categoryMenu, setCategoryMenu] = useState3(null);
  const [expandedChecklistIds, setExpandedChecklistIds] = useState3([]);
  const [manualEditableOccurrenceIds, setManualEditableOccurrenceIds] = useState3([]);
  const [renderedDashboardLayouts, setRenderedDashboardLayouts] = useState3(
    () => persistedDashboardLayouts
  );
  const dashboardDraftLayoutsRef = useRef3(persistedDashboardLayouts);
  const dashboardDraftLayoutsSignatureRef = useRef3(
    persistedDashboardLayoutsSignature
  );
  const dashboardPersistTimerRef = useRef3(null);
  const [dashboardMounted, setDashboardMounted] = useState3(false);
  const [viewDate, setViewDate] = useState3(systemToday);
  const viewDatePickerRef = useRef3(null);
  const lastAppliedPersistedDashboardLayoutsSignatureRef = useRef3(
    persistedDashboardLayoutsSignature
  );
  const isEditingHabitDraft = Boolean(habitDraft.id);
  const activeHabitWizardSteps = isEditingHabitDraft ? HABIT_EDIT_WIZARD_STEPS : HABIT_WIZARD_STEPS;
  const lastHabitStepIndex = activeHabitWizardSteps.length - 1;
  const managedCategories = useMemo2(
    () => buildManagedHabitCategories(home.categoryCatalog, presetCategoryOverrides),
    [home.categoryCatalog, presetCategoryOverrides]
  );
  useEffect3(() => {
    setDashboardMounted(true);
  }, []);
  useEffect3(() => {
    setHabitStep((currentValue) => Math.min(Math.max(currentValue, 0), lastHabitStepIndex));
  }, [lastHabitStepIndex]);
  useEffect3(() => {
    if (lastAppliedPersistedDashboardLayoutsSignatureRef.current === persistedDashboardLayoutsSignature) {
      return;
    }
    lastAppliedPersistedDashboardLayoutsSignatureRef.current = persistedDashboardLayoutsSignature;
    dashboardDraftLayoutsRef.current = persistedDashboardLayouts;
    dashboardDraftLayoutsSignatureRef.current = persistedDashboardLayoutsSignature;
    setRenderedDashboardLayouts((currentValue) => getHabitosDashboardLayoutsSignature(currentValue) === persistedDashboardLayoutsSignature ? currentValue : persistedDashboardLayouts);
  }, [persistedDashboardLayouts, persistedDashboardLayoutsSignature]);
  useEffect3(() => {
    return () => {
      if (dashboardPersistTimerRef.current !== null) {
        window.clearTimeout(dashboardPersistTimerRef.current);
      }
    };
  }, []);
  useEffect3(() => {
    if (!queueMenu && !categoryMenu) {
      return void 0;
    }
    const handlePointerDown = () => {
      setQueueMenu(null);
      setCategoryMenu(null);
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setQueueMenu(null);
        setCategoryMenu(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handlePointerDown);
    window.addEventListener("scroll", handlePointerDown, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handlePointerDown);
      window.removeEventListener("scroll", handlePointerDown, true);
    };
  }, [categoryMenu, queueMenu]);
  useEffect3(() => {
    if (!isHabitsDrawerOpen) {
      return;
    }
    if (!home.habits.length) {
      if (selectedHabitId) {
        setSelectedHabitId("");
      }
      return;
    }
    const selectionExists = home.habits.some((habit) => habit.id === selectedHabitId);
    if (!selectionExists) {
      setSelectedHabitId(getDefaultHabitId(home.habits));
    }
  }, [home.habits, isHabitsDrawerOpen, selectedHabitId]);
  useEffect3(() => {
    if (!isHabitsDrawerOpen) {
      return;
    }
    if (!managedCategories.length) {
      if (selectedCategoryId) {
        setSelectedCategoryId("");
      }
      return;
    }
    const selectionExists = managedCategories.some((category) => category.id === selectedCategoryId);
    if (!selectionExists) {
      setSelectedCategoryId(managedCategories[0]?.id || "");
    }
  }, [isHabitsDrawerOpen, managedCategories, selectedCategoryId]);
  useEffect3(() => {
    const visibleChecklistIds = new Set(
      home.dailyQueue.filter((entry) => entry.type === "habit" && entry.progressMode === "checklist").map((entry) => entry.recordId)
    );
    setExpandedChecklistIds((currentValue) => currentValue.filter((entry) => visibleChecklistIds.has(entry)));
  }, [home.dailyQueue]);
  useEffect3(() => {
    const visibleOccurrenceIds = new Set(
      home.dailyQueue.filter((entry) => entry.type === "habit" && !entry.isProjected).map((entry) => entry.recordId)
    );
    setManualEditableOccurrenceIds((currentValue) => currentValue.filter((entry) => visibleOccurrenceIds.has(entry)));
  }, [home.dailyQueue, viewDate]);
  const loadHome = async (requestedDate = systemToday) => {
    setLoading(true);
    setError("");
    try {
      const nextHome = await invoke("habitos:get-home", {
        date: requestedDate
      });
      startTransition(() => {
        setHome(nextHome || createEmptyHome());
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Habitos y tareas.");
    } finally {
      setLoading(false);
    }
  };
  useEffect3(() => {
    void loadHome(viewDate);
  }, [viewDate]);
  const openTaskEditor = (source = null) => {
    setQueueMenu(null);
    setTaskDraft(createTaskDraft(source));
    setTaskAdvancedOpen(Boolean(source?.notes || source?.time || source?.reminderAt || source?.subitems?.length));
    setModalMode("task");
  };
  const openHabitEditor = (source = null) => {
    setQueueMenu(null);
    setHabitDraft(createHabitDraft(source));
    setHabitWizardError("");
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
    setHabitStep(0);
    setModalMode("habit");
  };
  const openCreateChooser = () => {
    setQueueMenu(null);
    setModalMode("create");
  };
  const openHabitsDrawer = () => {
    setQueueMenu(null);
    setCategoryMenu(null);
    setSelectedHabitId((currentValue) => home.habits.some((habit) => habit.id === currentValue) ? currentValue : getDefaultHabitId(home.habits));
    setSelectedCategoryId((currentValue) => managedCategories.some((category) => category.id === currentValue) ? currentValue : managedCategories[0]?.id || "");
    setSettingsTab("habits");
    setIsHabitsDrawerOpen(true);
  };
  const closeHabitsDrawer = () => {
    setIsHabitsDrawerOpen(false);
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
  };
  const closeWorkbench = () => {
    setModalMode("overview");
    setTaskDraft(createTaskDraft());
    setHabitDraft(createHabitDraft());
    setHabitWizardError("");
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
    setTaskAdvancedOpen(false);
    setHabitStep(0);
  };
  const applyHomeUpdate = (nextHome) => {
    startTransition(() => {
      setHome(nextHome || createEmptyHome());
    });
  };
  const runMutation = async (channel, payload, { onSuccess } = {}) => {
    setSaving(true);
    setError("");
    try {
      const nextHome = await invoke(channel, {
        ...payload || {},
        date: viewDate
      });
      applyHomeUpdate(nextHome);
      await onSuccess?.(nextHome);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo completar la operacion.");
    } finally {
      setSaving(false);
    }
  };
  const persistPresetCategoryOverrides = async (nextOverrides) => {
    await ctx.settings.set(writeHabitCategoryPresetOverrides(pluginSettings, nextOverrides));
  };
  const handleOpenCategoryBuilder = (source = null) => {
    setCategoryBuilderError("");
    setCategoryBuilderDraft(createHabitCategoryDraft(source));
    setCategoryBuilderOpen(true);
    setCategoryMenu(null);
  };
  const handleCloseCategoryBuilder = () => {
    setCategoryBuilderOpen(false);
    setCategoryBuilderDraft(createHabitCategoryDraft());
    setCategoryBuilderError("");
  };
  const handleChangeCategoryBuilder = (field, value) => {
    setCategoryBuilderError("");
    setCategoryBuilderDraft((currentValue) => ({
      ...currentValue,
      [field]: field === "color" ? normalizeHexColorDraftValue(value, DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR) : value
    }));
  };
  const handleSelectExistingHabitCategory = (value) => {
    setCategoryBuilderError("");
    setCategoryBuilderOpen(false);
    setCategoryMenu(null);
    setHabitDraft((currentValue) => ({
      ...currentValue,
      category: value
    }));
  };
  const handleSaveCategoryBuilder = async () => {
    const normalizedName = normalizeCategoryNameValue(categoryBuilderDraft.name);
    const editingCategoryId = String(categoryBuilderDraft.id || "").trim();
    const editingPresetId = String(categoryBuilderDraft.presetId || "").trim();
    const previousCategoryName = String(categoryBuilderDraft.originalName || "").trim();
    const knownCategoryNames = new Set(
      managedCategories.filter((entry) => entry.id !== editingCategoryId && entry.id !== editingPresetId).map((entry) => normalizeCategoryNameValue(entry.name || entry.label || entry.value))
    );
    if (!normalizedName) {
      setCategoryBuilderError("El nombre de la categoria es obligatorio.");
      return;
    }
    if (knownCategoryNames.has(normalizedName)) {
      setCategoryBuilderError("Ya existe una categoria con ese nombre.");
      return;
    }
    setCategoryBuilderError("");
    if (categoryBuilderDraft.kind === "preset" && editingPresetId) {
      const nextCategoryName = String(categoryBuilderDraft.name || "").trim();
      const nextOverrides = {
        ...presetCategoryOverrides,
        [editingPresetId]: {
          ...presetCategoryOverrides[editingPresetId],
          name: nextCategoryName,
          iconId: categoryBuilderDraft.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
          color: normalizeHexColorDraftValue(
            categoryBuilderDraft.color,
            DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR
          ),
          deleted: false
        }
      };
      const finalizePresetSave = async () => {
        await persistPresetCategoryOverrides(nextOverrides);
        setHabitDraft((currentValue) => ({
          ...currentValue,
          category: currentValue.category === previousCategoryName || !currentValue.category ? nextCategoryName : currentValue.category
        }));
        setCategoryBuilderOpen(false);
        setCategoryBuilderDraft(createHabitCategoryDraft());
        setCategoryBuilderError("");
        if (!habitDraft.id) {
          setHabitStep(1);
        }
      };
      if (previousCategoryName && previousCategoryName !== nextCategoryName) {
        await runMutation(
          "habitos:rename-category-references",
          {
            previousName: previousCategoryName,
            nextName: nextCategoryName
          },
          {
            onSuccess: finalizePresetSave
          }
        );
        return;
      }
      await finalizePresetSave();
      return;
    }
    await runMutation(
      "habitos:save-category",
      {
        id: editingCategoryId || void 0,
        name: String(categoryBuilderDraft.name || "").trim(),
        iconId: categoryBuilderDraft.iconId || DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID,
        color: normalizeHexColorDraftValue(
          categoryBuilderDraft.color,
          DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR
        )
      },
      {
        onSuccess: (nextHome) => {
          const savedCategory = (nextHome?.categoryCatalog || []).find(
            (entry) => editingCategoryId ? String(entry.id || "") === editingCategoryId : normalizeCategoryNameValue(entry.name) === normalizedName
          );
          const nextCategoryName = savedCategory?.name || String(categoryBuilderDraft.name || "").trim();
          setHabitDraft((currentValue) => ({
            ...currentValue,
            category: currentValue.category === previousCategoryName || !currentValue.category ? nextCategoryName : currentValue.category
          }));
          setCategoryBuilderOpen(false);
          setCategoryBuilderDraft(createHabitCategoryDraft());
          setCategoryBuilderError("");
          if (!habitDraft.id) {
            setHabitStep(1);
          }
        }
      }
    );
  };
  const handleOpenCategoryMenu = (event, option) => {
    event.preventDefault();
    event.stopPropagation();
    setQueueMenu(null);
    setCategoryMenu({
      x: event.clientX,
      y: event.clientY,
      option
    });
  };
  const handleDeleteCategory = async (option) => {
    if (option.kind === "preset" && option.presetId) {
      const nextOverrides = {
        ...presetCategoryOverrides,
        [option.presetId]: {
          ...presetCategoryOverrides[option.presetId],
          deleted: true
        }
      };
      await runMutation(
        "habitos:clear-category-references",
        {
          categoryName: option.value
        },
        {
          onSuccess: async () => {
            await persistPresetCategoryOverrides(nextOverrides);
            setHabitDraft((currentValue) => currentValue.category === option.value ? {
              ...currentValue,
              category: ""
            } : currentValue);
            setCategoryMenu(null);
            setCategoryBuilderOpen(false);
            setCategoryBuilderDraft(createHabitCategoryDraft());
            setCategoryBuilderError("");
          }
        }
      );
      return;
    }
    await runMutation(
      "habitos:delete-category",
      {
        categoryId: option.id
      },
      {
        onSuccess: () => {
          setHabitDraft((currentValue) => currentValue.category === option.value ? {
            ...currentValue,
            category: ""
          } : currentValue);
          setCategoryMenu(null);
          setCategoryBuilderOpen(false);
          setCategoryBuilderDraft(createHabitCategoryDraft());
          setCategoryBuilderError("");
        }
      }
    );
  };
  const handleCreateCategoryFromSettings = () => {
    setSettingsTab("categories");
    handleOpenCategoryBuilder();
  };
  const handleEditCategoryFromSettings = (category) => {
    setSettingsTab("categories");
    setSelectedCategoryId(String(category?.id || ""));
    handleOpenCategoryBuilder(category);
  };
  const handleDeleteCategoryFromSettings = (category) => {
    void handleDeleteCategory(category);
  };
  const handleTaskDraftChange = (field, value) => {
    setTaskDraft((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };
  const handleTaskDraftNumberCommit = (field, value) => {
    if (field !== "priority") {
      return;
    }
    setTaskDraft((currentValue) => ({
      ...currentValue,
      priority: normalizeIntegerDraftValue(value, {
        min: 1,
        max: 100,
        fallback: "1"
      })
    }));
  };
  const handleTaskSubitemChange = (index, field, value) => {
    setTaskDraft((currentValue) => ({
      ...currentValue,
      subitems: currentValue.subitems.map((entry, entryIndex) => entryIndex === index ? {
        ...entry,
        [field]: value
      } : entry)
    }));
  };
  const handleHabitDraftChange = (field, value) => {
    setHabitWizardError("");
    if (field === "addChecklistItem") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        checklistItems: [
          ...currentValue.checklistItems,
          createDraftChecklistItem()
        ]
      }));
      return;
    }
    if (field === "removeChecklistItem") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        checklistItems: currentValue.checklistItems.filter((_, index) => index !== value)
      }));
      return;
    }
    if (field === "moveChecklistItem") {
      setHabitDraft((currentValue) => {
        const fromIndex = Number(value?.fromIndex);
        const toIndex = Number(value?.toIndex);
        if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
          return currentValue;
        }
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= currentValue.checklistItems.length || toIndex >= currentValue.checklistItems.length || fromIndex === toIndex) {
          return currentValue;
        }
        const nextChecklistItems = [...currentValue.checklistItems];
        const [movedItem] = nextChecklistItems.splice(fromIndex, 1);
        nextChecklistItems.splice(toIndex, 0, movedItem);
        return {
          ...currentValue,
          checklistItems: nextChecklistItems.map((entry, index) => ({
            ...entry,
            sortOrder: index
          }))
        };
      });
      return;
    }
    if (field === "checklistItem") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        checklistItems: currentValue.checklistItems.map((entry, index) => index === value.index ? {
          ...entry,
          title: value.value
        } : entry)
      }));
      return;
    }
    if (field === "quantityMode") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        quantityMode: value,
        quantityTarget: value === "no-target" ? "" : currentValue.quantityTarget
      }));
      return;
    }
    if (field === "startDate") {
      setHabitDraft((currentValue) => {
        const nextStartDate = value || todayLocalDate();
        if (!currentValue.hasEndDate) {
          return {
            ...currentValue,
            startDate: nextStartDate
          };
        }
        const durationDays = Math.max(1, Number(currentValue.durationDays || 1));
        return {
          ...currentValue,
          startDate: nextStartDate,
          endDate: addDaysToLocalDate(nextStartDate, durationDays - 1)
        };
      });
      return;
    }
    if (field === "hasEndDate") {
      setHabitDraft((currentValue) => {
        if (!value) {
          return {
            ...currentValue,
            hasEndDate: false,
            endDate: "",
            durationDays: "1"
          };
        }
        return {
          ...currentValue,
          hasEndDate: true,
          endDate: currentValue.endDate || currentValue.startDate,
          durationDays: currentValue.durationDays || "1"
        };
      });
      return;
    }
    if (field === "endDate") {
      setHabitDraft((currentValue) => {
        const nextEndDate = value || currentValue.startDate;
        const safeEndDate = getInclusiveDayCount(currentValue.startDate, nextEndDate) === 1 && nextEndDate < currentValue.startDate ? currentValue.startDate : nextEndDate;
        return {
          ...currentValue,
          endDate: safeEndDate,
          durationDays: String(getInclusiveDayCount(currentValue.startDate, safeEndDate))
        };
      });
      return;
    }
    if (field === "durationDays") {
      setHabitDraft((currentValue) => {
        const rawValue = String(value ?? "");
        const numericValue = Number(rawValue);
        if (!rawValue.trim() || !Number.isFinite(numericValue) || numericValue < 1) {
          return {
            ...currentValue,
            durationDays: rawValue
          };
        }
        const normalizedDuration = Math.round(numericValue);
        return {
          ...currentValue,
          durationDays: rawValue,
          endDate: addDaysToLocalDate(currentValue.startDate, normalizedDuration - 1)
        };
      });
      return;
    }
    if (field === "priority") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        priority: value
      }));
      return;
    }
    setHabitDraft((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };
  const handleHabitDraftNumberCommit = (field, value) => {
    if (field === "durationDays") {
      setHabitDraft((currentValue) => {
        const normalizedDuration = normalizeIntegerDraftValue(value, {
          min: 1,
          fallback: "1"
        });
        return {
          ...currentValue,
          durationDays: normalizedDuration,
          endDate: addDaysToLocalDate(currentValue.startDate, Number(normalizedDuration) - 1)
        };
      });
      return;
    }
    if (field === "quantityTarget") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        quantityTarget: currentValue.quantityMode === "no-target" ? "" : normalizeIntegerDraftValue(value, {
          min: 0,
          fallback: ""
        })
      }));
      return;
    }
    if (field === "priority") {
      setHabitDraft((currentValue) => ({
        ...currentValue,
        priority: normalizeIntegerDraftValue(value, {
          min: 1,
          max: 100,
          fallback: "1"
        })
      }));
    }
  };
  const handleSelectHabitCategory = (value) => {
    setHabitWizardError("");
    handleSelectExistingHabitCategory(value);
    setHabitStep(1);
  };
  const handleSelectHabitProgressMode = (value) => {
    setHabitWizardError("");
    setHabitDraft((currentValue) => ({
      ...currentValue,
      progressMode: value
    }));
    setHabitStep(2);
  };
  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    await runMutation(
      "habitos:save-task",
      {
        ...taskDraft,
        priority: normalizeIntegerDraftValue(taskDraft.priority, {
          min: 1,
          max: 100,
          fallback: "1"
        }),
        reminderAt: taskDraft.reminderAt ? new Date(taskDraft.reminderAt).toISOString() : null
      },
      {
        onSuccess: closeWorkbench
      }
    );
  };
  const handleHabitSubmit = async (event) => {
    event.preventDefault();
    if (habitStep < lastHabitStepIndex) {
      if (!isEditingHabitDraft && habitStep === 0 && !habitDraft.category) {
        setHabitWizardError("Elige una categoria para seguir.");
        return;
      }
      if (!isEditingHabitDraft && habitStep === 1 && !habitDraft.progressMode) {
        setHabitWizardError("Elige como quieres evaluar tu progreso.");
        return;
      }
      if (isEditingHabitDraft && habitStep === 0 || !isEditingHabitDraft && habitStep === 2) {
        const title = String(habitDraft.title || "").trim();
        if (!title) {
          setHabitWizardError("El nombre del habito es obligatorio.");
          return;
        }
        if (!String(habitDraft.category || "").trim()) {
          setHabitWizardError("Elige una categoria para continuar.");
          return;
        }
        if (habitDraft.progressMode === "quantity") {
          if (habitDraft.quantityMode !== "no-target" && String(habitDraft.quantityTarget || "").trim() === "") {
            setHabitWizardError("Define el objetivo numerico para continuar.");
            return;
          }
        }
        if (habitDraft.progressMode === "checklist") {
          const items = habitDraft.checklistItems.map((entry) => String(entry.title || "").trim());
          if (!items.some(Boolean)) {
            setHabitWizardError("Agrega al menos un sub-item.");
            return;
          }
          if (items.some((entry) => !entry)) {
            setHabitWizardError("Completa o elimina los sub-items vacios.");
            return;
          }
        }
      }
      if (isEditingHabitDraft && habitStep === 1 || !isEditingHabitDraft && habitStep === 3) {
        if (habitDraft.scheduleType === "weekdays" && !habitDraft.weekdays.length) {
          setHabitWizardError("Elige al menos un dia de la semana.");
          return;
        }
      }
      setHabitWizardError("");
      setHabitStep((currentValue) => Math.min(currentValue + 1, lastHabitStepIndex));
      return;
    }
    const normalizedTitle = String(habitDraft.title || "").trim();
    if (!normalizedTitle) {
      setHabitWizardError("El nombre del habito es obligatorio.");
      return;
    }
    if (!String(habitDraft.category || "").trim()) {
      setHabitWizardError("Elige una categoria para continuar.");
      return;
    }
    if (habitDraft.scheduleType === "weekdays" && !habitDraft.weekdays.length) {
      setHabitWizardError("Elige al menos un dia de la semana.");
      return;
    }
    if (habitDraft.progressMode === "quantity" && habitDraft.quantityMode !== "no-target" && String(habitDraft.quantityTarget || "").trim() === "") {
      setHabitWizardError("Define el objetivo numerico para guardar.");
      return;
    }
    if (habitDraft.progressMode === "checklist") {
      const items = habitDraft.checklistItems.map((entry) => String(entry.title || "").trim());
      if (!items.some(Boolean)) {
        setHabitWizardError("Agrega al menos un sub-item.");
        return;
      }
      if (items.some((entry) => !entry)) {
        setHabitWizardError("Completa o elimina los sub-items vacios.");
        return;
      }
    }
    setHabitWizardError("");
    const nextHabitId = habitDraft.id || createDraftId("habit");
    const payload = buildHabitPayload(habitDraft, {
      id: nextHabitId
    });
    await runMutation(
      "habitos:save-habit",
      payload,
      {
        onSuccess: () => {
          setSelectedHabitId(nextHabitId);
          closeWorkbench();
        }
      }
    );
  };
  const handleToggleQueueItem = async (item) => {
    setQueueMenu((currentValue) => currentValue?.item?.id === item.id ? null : currentValue);
    if (item.type === "task") {
      if (viewDate !== actualToday) {
        return;
      }
      await runMutation("habitos:toggle-task", {
        taskId: item.recordId
      });
      return;
    }
    if (!canEditOccurrenceResult(item)) {
      return;
    }
    await runMutation("habitos:toggle-occurrence", {
      occurrenceId: item.recordId
    });
  };
  const handleCommitOccurrenceQuantity = async (item, value) => {
    if (!canEditOccurrenceResult(item)) {
      return;
    }
    await runMutation("habitos:set-occurrence-quantity", {
      occurrenceId: item.recordId,
      value
    });
  };
  const handleToggleOccurrenceChecklistItem = async (item, itemId) => {
    if (!canEditOccurrenceResult(item)) {
      return;
    }
    await runMutation("habitos:toggle-occurrence-checklist-item", {
      occurrenceId: item.recordId,
      itemId
    });
  };
  const handleToggleChecklistExpanded = (occurrenceId) => {
    setExpandedChecklistIds((currentValue) => currentValue.includes(occurrenceId) ? currentValue.filter((entry) => entry !== occurrenceId) : [...currentValue, occurrenceId]);
  };
  const enableManualOccurrenceEdit = (occurrenceId) => {
    setManualEditableOccurrenceIds((currentValue) => currentValue.includes(occurrenceId) ? currentValue : [...currentValue, occurrenceId]);
  };
  const disableManualOccurrenceEdit = (occurrenceId) => {
    setManualEditableOccurrenceIds((currentValue) => currentValue.filter((entry) => entry !== occurrenceId));
  };
  const canEditOccurrenceResult = (item) => {
    if (!item || item.type !== "habit" || item.isProjected) {
      return false;
    }
    if (!isPastView) {
      return !isFutureView;
    }
    return manualEditableOccurrenceIds.includes(item.recordId);
  };
  const actualToday = home.actualToday || systemToday;
  const isPastView = compareLocalDates(viewDate, actualToday) < 0;
  const isFutureView = compareLocalDates(viewDate, actualToday) > 0;
  const handleShiftViewDate = (daysToAdd) => {
    setViewDate((currentValue) => clampViewDate(addDaysToLocalDate(currentValue, daysToAdd)));
  };
  const handleSelectViewDate = (nextDate) => {
    setViewDate(clampViewDate(nextDate));
  };
  const handleOpenViewDatePicker = () => {
    const input2 = viewDatePickerRef.current;
    if (!input2) {
      return;
    }
    if (typeof input2.showPicker === "function") {
      input2.showPicker();
      return;
    }
    input2.click();
  };
  const handleDashboardLayoutChange = (_currentLayout, allLayouts) => {
    const nextLayouts = normalizeHabitosDashboardLayouts(allLayouts);
    const nextSignature = getHabitosDashboardLayoutsSignature(nextLayouts);
    if (nextSignature === dashboardDraftLayoutsSignatureRef.current) {
      return;
    }
    dashboardDraftLayoutsRef.current = nextLayouts;
    dashboardDraftLayoutsSignatureRef.current = nextSignature;
  };
  const handleDashboardLayoutCommit = (_currentLayout, allLayouts) => {
    const nextLayouts = normalizeHabitosDashboardLayouts(allLayouts);
    const nextSignature = getHabitosDashboardLayoutsSignature(nextLayouts);
    dashboardDraftLayoutsRef.current = nextLayouts;
    dashboardDraftLayoutsSignatureRef.current = nextSignature;
    setRenderedDashboardLayouts(nextLayouts);
    if (nextSignature === persistedDashboardLayoutsSignature) {
      return;
    }
    if (dashboardPersistTimerRef.current !== null) {
      window.clearTimeout(dashboardPersistTimerRef.current);
    }
    dashboardPersistTimerRef.current = window.setTimeout(() => {
      dashboardPersistTimerRef.current = null;
      void ctx.settings.set(writeHabitosDashboardLayouts(pluginSettings, nextLayouts)).catch((settingsError) => {
        setError(
          settingsError instanceof Error ? settingsError.message : "No se pudo guardar la distribucion del dashboard."
        );
      });
    }, 120);
  };
  const handleDeleteQueueItem = async (item) => {
    if (item.type === "task") {
      await runMutation("habitos:delete-task", {
        taskId: item.raw?.id || item.recordId
      });
      return;
    }
    await runMutation("habitos:delete-habit", {
      habitId: item.habit?.id
    });
  };
  const handleToggleHabitStatus = async (habit) => {
    setSelectedHabitId(habit.id);
    await runMutation(
      "habitos:save-habit",
      buildHabitPayload(habit, {
        status: habit.status === "active" ? "archived" : "active"
      })
    );
  };
  const renderSecondaryTask = (task) => /* @__PURE__ */ React4.createElement(
    "article",
    {
      key: task.id,
      className: [
        "habitosView__secondaryCard",
        queueMenu?.item?.id === `upcoming-task:${task.id}` ? "is-selected" : ""
      ].filter(Boolean).join(" "),
      onContextMenu: (event) => handleOpenQueueMenu(event, buildUpcomingTaskMenuItem(task))
    },
    /* @__PURE__ */ React4.createElement("strong", null, task.title),
    /* @__PURE__ */ React4.createElement("span", null, formatLocalDate(task.dueDate), task.time ? ` - ${task.time}` : "")
  );
  const handleOpenQueueMenu = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setCategoryMenu(null);
    setQueueMenu({
      x: event.clientX,
      y: event.clientY,
      item
    });
  };
  const selectedHabit = home.habits.find((habit) => habit.id === selectedHabitId) || null;
  const selectedCategory = managedCategories.find((category) => category.id === selectedCategoryId) || null;
  const dailyPanelTitle = isPastView ? "Historial del dia" : isFutureView ? "Plan del dia" : "Panel del dia";
  const dailyPanelDescription = isPastView ? "Resultados cerrados por fecha. Usa click derecho para habilitar edicion manual del resultado." : isFutureView ? "Vista previa de tareas y ocurrencias previstas para esa fecha." : "";
  return /* @__PURE__ */ React4.createElement(WorkspacePage, { className: "habitosView" }, /* @__PURE__ */ React4.createElement(WorkspaceBody, null, /* @__PURE__ */ React4.createElement(ScrollRegion, { className: "habitosView__mainScroll" }, /* @__PURE__ */ React4.createElement(PanelStack, { className: "habitosView__dashboardStack" }, error ? /* @__PURE__ */ React4.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React4.createElement(
    ResponsiveGridLayout2,
    {
      className: "habitosDashboard__grid",
      layouts: renderedDashboardLayouts,
      breakpoints: HABITOS_DASHBOARD_BREAKPOINTS,
      cols: HABITOS_DASHBOARD_COLS,
      rowHeight: HABITOS_DASHBOARD_ROW_HEIGHT,
      margin: HABITOS_DASHBOARD_MARGIN,
      containerPadding: [0, 0],
      measureBeforeMount: false,
      autoSize: true,
      resizeHandles: HABITOS_DASHBOARD_RESIZE_HANDLES,
      compactType: null,
      preventCollision: true,
      useCSSTransforms: dashboardMounted,
      isDraggable: dashboardEditMode,
      isResizable: dashboardEditMode,
      draggableHandle: ".habitosDashboard__editOverlay",
      draggableCancel: ".nexus-ui-panel-header__actions, .habitosDashboard__widgetBody, button, input, select, textarea, label, canvas",
      onLayoutChange: handleDashboardLayoutChange,
      onDragStop: handleDashboardLayoutCommit,
      onResizeStop: handleDashboardLayoutCommit
    },
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        key: "daily-queue",
        className: ["habitosDashboard__item", dashboardEditMode ? "is-editing" : ""].filter(Boolean).join(" ")
      },
      /* @__PURE__ */ React4.createElement(SectionPanel, { className: "habitosDashboard__widget habitosView__queuePanel" }, /* @__PURE__ */ React4.createElement(
        PanelHeader,
        {
          actions: /* @__PURE__ */ React4.createElement("div", { className: "habitosView__panelActions" }, /* @__PURE__ */ React4.createElement("div", { className: "habitosView__dayNavigator" }, /* @__PURE__ */ React4.createElement(
            "button",
            {
              type: "button",
              className: "habitosView__dayNavButton",
              onClick: () => handleShiftViewDate(-1),
              disabled: loading || saving,
              "aria-label": "Dia anterior"
            },
            /* @__PURE__ */ React4.createElement(ChevronLeftIcon, null)
          ), /* @__PURE__ */ React4.createElement(
            "button",
            {
              type: "button",
              className: "habitosView__dayNavCurrent",
              onClick: handleOpenViewDatePicker,
              disabled: loading || saving,
              "aria-label": "Elegir fecha"
            },
            /* @__PURE__ */ React4.createElement("span", null, formatVisibleDateLabel(viewDate))
          ), /* @__PURE__ */ React4.createElement(
            "button",
            {
              type: "button",
              className: "habitosView__dayNavButton",
              onClick: () => handleShiftViewDate(1),
              disabled: loading || saving,
              "aria-label": "Dia siguiente"
            },
            /* @__PURE__ */ React4.createElement(ChevronRightIcon, null)
          ), viewDate !== actualToday ? /* @__PURE__ */ React4.createElement(
            Button,
            {
              type: "button",
              tone: "secondary",
              onClick: () => handleSelectViewDate(actualToday),
              disabled: loading || saving
            },
            "Volver a hoy"
          ) : null, /* @__PURE__ */ React4.createElement(
            "input",
            {
              ref: viewDatePickerRef,
              className: "habitosView__datePickerInput",
              type: "date",
              value: viewDate,
              onChange: (event) => handleSelectViewDate(event.target.value),
              tabIndex: "-1",
              "aria-hidden": "true"
            }
          )), /* @__PURE__ */ React4.createElement(
            IconButton,
            {
              type: "button",
              "aria-label": "Configuraciones",
              title: "Configuraciones",
              onClick: openHabitsDrawer
            },
            /* @__PURE__ */ React4.createElement(SettingsIcon, null)
          ), /* @__PURE__ */ React4.createElement(IconButton, { type: "button", tone: "primary", "aria-label": "Crear nuevo", onClick: openCreateChooser }, /* @__PURE__ */ React4.createElement(PlusIcon, null)))
        },
        /* @__PURE__ */ React4.createElement(
          DashboardPanelTitle,
          {
            title: dailyPanelTitle,
            description: dailyPanelDescription,
            editMode: dashboardEditMode
          }
        )
      ), /* @__PURE__ */ React4.createElement("div", { className: "habitosDashboard__widgetBody habitosView__queuePanelBody" }, loading ? /* @__PURE__ */ React4.createElement(StateBlock, { title: "Cargando..." }) : home.dailyQueue.length ? /* @__PURE__ */ React4.createElement("div", { className: "habitosView__queueList" }, home.dailyQueue.map((item) => /* @__PURE__ */ React4.createElement(
        QueueItemCard,
        {
          key: item.id,
          item,
          categoryCatalog: home.categoryCatalog,
          presetOverrides: presetCategoryOverrides,
          isSelected: queueMenu?.item?.id === item.id,
          saving,
          resultEditable: item.type === "task" ? viewDate === actualToday : canEditOccurrenceResult(item),
          onToggle: () => void handleToggleQueueItem(item),
          onContextMenu: handleOpenQueueMenu,
          onCommitQuantity: (queueItem, value) => handleCommitOccurrenceQuantity(queueItem, value),
          onToggleChecklistItem: (queueItem, itemId) => handleToggleOccurrenceChecklistItem(queueItem, itemId),
          onToggleChecklistExpanded: handleToggleChecklistExpanded,
          isChecklistExpanded: expandedChecklistIds.includes(item.recordId)
        }
      ))) : /* @__PURE__ */ React4.createElement(
        StateBlock,
        {
          title: isPastView ? "No hay historial para esta fecha." : isFutureView ? "No hay actividad prevista para esta fecha." : "No hay actividad para hoy."
        }
      ))),
      dashboardEditMode ? /* @__PURE__ */ React4.createElement(DashboardEditOverlay, null) : null
    ),
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        key: "habit-outcome",
        className: ["habitosDashboard__item", dashboardEditMode ? "is-editing" : ""].filter(Boolean).join(" ")
      },
      /* @__PURE__ */ React4.createElement(HabitOutcomePanel, { chart: home.habitOutcomeChart, dashboardEditMode }),
      dashboardEditMode ? /* @__PURE__ */ React4.createElement(DashboardEditOverlay, null) : null
    ),
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        key: "upcoming-tasks",
        className: ["habitosDashboard__item", dashboardEditMode ? "is-editing" : ""].filter(Boolean).join(" ")
      },
      /* @__PURE__ */ React4.createElement(
        SecondaryListCard,
        {
          title: "Tareas proximas",
          items: viewDate === actualToday ? home.upcomingTasks : [],
          emptyTitle: viewDate === actualToday ? "Sin tareas proximas." : "Disponible solo para hoy.",
          renderItem: renderSecondaryTask,
          dashboardEditMode
        }
      ),
      dashboardEditMode ? /* @__PURE__ */ React4.createElement(DashboardEditOverlay, null) : null
    )
  )))), queueMenu?.item ? /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: "habitosView__contextMenu",
      style: {
        position: "fixed",
        top: `${queueMenu.y}px`,
        left: `${queueMenu.x}px`,
        zIndex: 1400
      },
      onMouseDown: (event) => event.stopPropagation(),
      onContextMenu: (event) => event.preventDefault()
    },
    queueMenu.item.type === "habit" && isPastView && !queueMenu.item.isProjected ? /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: () => {
          const occurrenceId = queueMenu.item.recordId;
          setQueueMenu(null);
          if (manualEditableOccurrenceIds.includes(occurrenceId)) {
            disableManualOccurrenceEdit(occurrenceId);
            return;
          }
          enableManualOccurrenceEdit(occurrenceId);
        }
      },
      manualEditableOccurrenceIds.includes(queueMenu.item.recordId) ? "Bloquear resultado" : "Editar resultado"
    ) : null,
    /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: () => {
          setQueueMenu(null);
          if (queueMenu.item.type === "task") {
            openTaskEditor(queueMenu.item.raw);
            return;
          }
          openHabitEditor(queueMenu.item.habit);
        }
      },
      "Editar"
    ),
    /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: () => {
          setQueueMenu(null);
          void handleDeleteQueueItem(queueMenu.item);
        }
      },
      "Eliminar"
    )
  ) : null, categoryMenu?.option ? /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: "habitosView__contextMenu",
      style: {
        position: "fixed",
        top: `${categoryMenu.y}px`,
        left: `${categoryMenu.x}px`,
        zIndex: 1400
      },
      onMouseDown: (event) => event.stopPropagation(),
      onContextMenu: (event) => event.preventDefault()
    },
    /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: () => {
          handleOpenCategoryBuilder({
            id: categoryMenu.option.id,
            name: categoryMenu.option.label,
            iconId: categoryMenu.option.iconId,
            color: categoryMenu.option.color
          });
        }
      },
      "Editar categoria"
    ),
    /* @__PURE__ */ React4.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: () => {
          void handleDeleteCategory(categoryMenu.option);
        }
      },
      "Eliminar categoria"
    )
  ) : null, /* @__PURE__ */ React4.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: isHabitsDrawerOpen,
      saving,
      layout: "drawer",
      onClose: closeHabitsDrawer
    },
    /* @__PURE__ */ React4.createElement(
      SettingsDrawer,
      {
        activeTab: settingsTab,
        habits: home.habits,
        selectedHabitId: selectedHabit?.id || "",
        home,
        presetOverrides: presetCategoryOverrides,
        saving,
        onClose: closeHabitsDrawer,
        onChangeTab: setSettingsTab,
        onCreateHabit: () => openHabitEditor(),
        onSelectHabit: setSelectedHabitId,
        onEditHabit: openHabitEditor,
        onToggleHabitStatus: (habit) => void handleToggleHabitStatus(habit),
        categories: managedCategories,
        selectedCategoryId: selectedCategory?.id || "",
        selectedCategory,
        onSelectCategory: setSelectedCategoryId,
        onCreateCategory: handleCreateCategoryFromSettings,
        onEditCategory: handleEditCategoryFromSettings,
        onDeleteCategory: handleDeleteCategoryFromSettings,
        categoryBuilderOpen,
        categoryBuilderDraft,
        categoryBuilderError,
        onChangeCategoryBuilder: handleChangeCategoryBuilder,
        onSaveCategoryBuilder: () => void handleSaveCategoryBuilder(),
        onCloseCategoryBuilder: handleCloseCategoryBuilder
      }
    )
  ), /* @__PURE__ */ React4.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "create",
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React4.createElement(
      CreateChooserModal,
      {
        onTask: () => {
          openTaskEditor();
        },
        onHabit: () => {
          openHabitEditor();
        },
        onCancel: () => {
          closeWorkbench();
        }
      }
    )
  ), /* @__PURE__ */ React4.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "task",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React4.createElement(
      TaskEditor,
      {
        draft: taskDraft,
        advancedOpen: taskAdvancedOpen,
        saving,
        onChange: handleTaskDraftChange,
        onCommitNumber: handleTaskDraftNumberCommit,
        onSubitemChange: handleTaskSubitemChange,
        onAddSubitem: () => {
          setTaskDraft((currentValue) => ({
            ...currentValue,
            subitems: [
              ...currentValue.subitems,
              {
                id: "",
                title: "",
                isCompleted: false
              }
            ]
          }));
        },
        onRemoveSubitem: (index) => {
          setTaskDraft((currentValue) => ({
            ...currentValue,
            subitems: currentValue.subitems.filter((_, entryIndex) => entryIndex !== index)
          }));
        },
        onToggleAdvanced: () => setTaskAdvancedOpen((currentValue) => !currentValue),
        onSubmit: handleTaskSubmit,
        onCancel: () => closeWorkbench()
      }
    )
  ), /* @__PURE__ */ React4.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "habit",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React4.createElement(
      HabitEditor,
      {
        draft: habitDraft,
        categories: home.categoryCatalog,
        presetOverrides: presetCategoryOverrides,
        step: habitStep,
        saving,
        wizardError: habitWizardError,
        categoryBuilderOpen,
        categoryBuilderDraft,
        categoryBuilderError,
        onChange: handleHabitDraftChange,
        onSelectExistingCategory: handleSelectExistingHabitCategory,
        onOpenCategoryBuilder: handleOpenCategoryBuilder,
        onCloseCategoryBuilder: handleCloseCategoryBuilder,
        onChangeCategoryBuilder: handleChangeCategoryBuilder,
        onSaveCategoryBuilder: () => void handleSaveCategoryBuilder(),
        onOpenCategoryMenu: handleOpenCategoryMenu,
        onCommitNumber: handleHabitDraftNumberCommit,
        onSelectCategory: handleSelectHabitCategory,
        onSelectProgressMode: handleSelectHabitProgressMode,
        onToggleWeekday: (weekday) => {
          setHabitDraft((currentValue) => {
            const exists = currentValue.weekdays.includes(weekday);
            return {
              ...currentValue,
              weekdays: exists ? currentValue.weekdays.filter((entry) => entry !== weekday) : [...currentValue.weekdays, weekday].sort((left, right) => left - right)
            };
          });
        },
        onBack: () => {
          setHabitWizardError("");
          setHabitStep((currentValue) => Math.max(0, currentValue - 1));
        },
        onNext: () => void handleHabitSubmit({ preventDefault() {
        } }),
        onSubmit: handleHabitSubmit,
        onCancel: () => closeWorkbench()
      }
    )
  ));
}

// ../nexus-plugins/habitos/src/renderer.js
var styleElement = null;
function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }
  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = HABITOS_PLUGIN_ID;
  document.head.appendChild(styleElement);
}
function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}
var habitosRendererPlugin = {
  activate(ctx) {
    ensureStylesheet();
    ctx.registerView({
      id: HABITOS_WORKSPACE_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Habitos y tareas",
      icon: HabitosIcon,
      tone: "document",
      surface: "workspace",
      component: (props) => /* @__PURE__ */ React.createElement(HabitosView, { ...props, ctx })
    });
    ctx.registerSideToolbarButton({
      id: "nexus.habitos.workspace-button",
      pluginId: ctx.pluginId,
      order: 270,
      icon: HabitosIcon,
      tone: "document",
      label: "Habitos",
      onClick: () => {
        void ctx.openView({
          viewId: HABITOS_WORKSPACE_VIEW_ID,
          reuse: true,
          sourceId: "nexus.habitos.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === HABITOS_WORKSPACE_VIEW_ID;
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = habitosRendererPlugin;
export {
  renderer_default as default
};
/*! Bundled license information:

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

@kurkle/color/dist/color.esm.js:
  (*!
   * @kurkle/color v0.3.4
   * https://github.com/kurkle/color#readme
   * (c) 2024 Jukka Kurkela
   * Released under the MIT License
   *)

chart.js/dist/chunks/helpers.dataset.js:
chart.js/dist/chart.js:
  (*!
   * Chart.js v4.5.1
   * https://www.chartjs.org
   * (c) 2025 Chart.js Contributors
   * Released under the MIT License
   *)
*/
//# sourceMappingURL=renderer.js.map
