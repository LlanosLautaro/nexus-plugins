const React = window.React;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
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

// <define:process>
var init_define_process = __esm({
  "<define:process>"() {
  }
});

// scripts/shims/react.cjs
var require_react = __commonJS({
  "scripts/shims/react.cjs"(exports, module) {
    init_define_process();
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

// scripts/shims/react-dom.cjs
var require_react_dom = __commonJS({
  "scripts/shims/react-dom.cjs"(exports, module) {
    init_define_process();
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

// life-tracker/src/renderer.js
init_define_process();

// life-tracker/src/LifeTrackerView.jsx
init_define_process();

// node_modules/chart.js/dist/chart.js
init_define_process();

// node_modules/chart.js/dist/chunks/helpers.dataset.js
init_define_process();

// node_modules/@kurkle/color/dist/color.esm.js
init_define_process();
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
function hueValue(r, g, b, d, max) {
  if (r === max) {
    return (g - b) / d + (g < b ? 6 : 0);
  }
  if (g === max) {
    return (b - r) / d + 2;
  }
  return (r - g) / d + 4;
}
function rgb2hsl(v) {
  const range = 255;
  const r = v.r / range;
  const g = v.g / range;
  const b = v.b / range;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h, s, d;
  if (max !== min) {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = hueValue(r, g, b, d, max);
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
  let r, g, b;
  if (!m) {
    return;
  }
  if (m[7] !== r) {
    const v = +m[7];
    a = m[8] ? p2b(v) : lim(v * 255, 0, 255);
  }
  r = +m[1];
  g = +m[3];
  b = +m[5];
  r = 255 & (m[2] ? p2b(r) : lim(r, 0, 255));
  g = 255 & (m[4] ? p2b(g) : lim(g, 0, 255));
  b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255));
  return {
    r,
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
  const r = from(b2n(rgb1.r));
  const g = from(b2n(rgb1.g));
  const b = from(b2n(rgb1.b));
  return {
    r: n2b(to(r + t * (from(b2n(rgb2.r)) - r))),
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
    const bottom = y + metrics.actualBoundingBoxDescent;
    const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
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
function _createResolver(scopes, prefixes = [
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
    ], prefixes, finalRootScopes, fallback)
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
      return _cached(target, prop, () => _resolveWithPrefixes(prop, prefixes, scopes, target));
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
function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
  let value;
  for (const prefix of prefixes) {
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
  let t, r, b, l;
  if (isObject(value)) {
    t = value.top;
    r = value.right;
    b = value.bottom;
    l = value.left;
  } else {
    t = r = b = l = value;
  }
  return {
    top: t,
    right: r,
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
    const chooseId = (axis, x, y, r) => axis === "x" ? x : axis === "r" ? r : y;
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
    const prefixes = active ? [
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
    const values = config.resolveNamedOptions(scopes, names2, context, prefixes);
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
  const bottom = sortByWeight(filterByPosition(layoutBoxes, "bottom"));
  const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, "x");
  const centerVertical = filterDynamicPositionByAxis(layoutBoxes, "y");
  return {
    fullSize,
    leftAndTop: left.concat(top),
    rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
    chartArea: filterByPosition(layoutBoxes, "chartArea"),
    vertical: left.concat(right).concat(centerVertical),
    horizontal: top.concat(bottom).concat(centerHorizontal)
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
  const { top, left, bottom, right, chart } = scale;
  const { chartArea, scales } = chart;
  let rotation = 0;
  let maxWidth, titleX, titleY;
  const height = bottom - top;
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
    titleY = _alignStartEnd(align, bottom, top);
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
  resolveNamedOptions(scopes, names2, context, prefixes = [
    ""
  ]) {
    const result = {
      $shared: true
    };
    const { resolver, subPrefixes } = getResolver(this._resolverCache, scopes, prefixes);
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
  createResolver(scopes, context, prefixes = [
    ""
  ], descriptorDefaults) {
    const { resolver } = getResolver(this._resolverCache, scopes, prefixes);
    return isObject(context) ? _attachContext(resolver, context, void 0, descriptorDefaults) : resolver;
  }
};
function getResolver(resolverCache, scopes, prefixes) {
  let cache = resolverCache.get(scopes);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    resolverCache.set(scopes, cache);
  }
  const cacheKey = prefixes.join();
  let cached = cache.get(cacheKey);
  if (!cached) {
    const resolver = _createResolver(scopes, prefixes);
    cached = {
      resolver,
      subPrefixes: prefixes.filter((p) => !p.toLowerCase().includes("hover"))
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
  const { left, top, right, bottom } = item;
  const apexesInArea = _isPointInArea({
    x: left,
    y: top
  }, area) || _isPointInArea({
    x: left,
    y: bottom
  }, area) || _isPointInArea({
    x: right,
    y: top
  }, area) || _isPointInArea({
    x: right,
    y: bottom
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
  const { left, top, right, bottom } = item;
  const { backdropColor } = opts;
  if (!isNullOrUndef(backdropColor)) {
    const borderRadius = toTRBLCorners(opts.borderRadius);
    const padding = toPadding(opts.backdropPadding);
    ctx.fillStyle = backdropColor;
    const backdropLeft = left - padding.left;
    const backdropTop = top - padding.top;
    const backdropWidth = right - left + padding.width;
    const backdropHeight = bottom - top + padding.height;
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
    const { left, top, right, bottom } = this._pointLabelItems[index];
    return {
      left,
      top,
      right,
      bottom
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

// packages/nexus-ui/src/index.js
init_define_process();

// packages/nexus-ui/src/components/Button/Button.jsx
init_define_process();

// packages/nexus-ui/src/utils/cx.js
init_define_process();
function cx(...values) {
  return values.filter(Boolean).join(" ");
}

// packages/nexus-ui/src/components/Button/Button.jsx
function Button({
  className = "",
  tone = "secondary",
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
        className
      )
    },
    children
  );
}

// packages/nexus-ui/src/components/CyberIconButton/CyberIconButton.jsx
init_define_process();
var import_react = __toESM(require_react(), 1);

// packages/nexus-ui/src/components/Tooltip/Tooltip.jsx
init_define_process();
function Tooltip({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("span", { className: cx("nexus-ui-tooltip", className) }, children);
}

// packages/nexus-ui/src/components/CyberIconButton/CyberIconButton.jsx
function CyberIconButton({
  active = false,
  className = "",
  children,
  label,
  title,
  tone = "neutral",
  ref,
  onClick,
  onPointerLeave,
  ...props
}) {
  const [tooltipDismissed, setTooltipDismissed] = (0, import_react.useState)(false);
  const accessibleLabel = props["aria-label"] || label || title;
  const tooltipLabel = label || title;
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      ...props,
      ref,
      type: props.type || "button",
      className: cx(
        "nexus-ui-cyber-icon-button",
        active && "is-active",
        tone !== "neutral" && `nexus-ui-cyber-icon-button--${tone}`,
        tooltipDismissed && "is-tooltip-dismissed",
        className
      ),
      "aria-label": accessibleLabel,
      onClick: (event) => {
        setTooltipDismissed(true);
        onClick?.(event);
      },
      onPointerLeave: (event) => {
        setTooltipDismissed(false);
        onPointerLeave?.(event);
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-cyber-icon-button__icon" }, children),
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-cyber-icon-button__glare", "aria-hidden": "true" }),
    tooltipLabel ? /* @__PURE__ */ React.createElement(Tooltip, null, tooltipLabel) : null
  );
}

// packages/nexus-ui/src/components/SegmentedControl/SegmentedControl.jsx
init_define_process();
function readOptionValue(option) {
  return option?.value ?? option?.id;
}
function SegmentedControl({
  ariaLabel = "Selector",
  className = "",
  flush = false,
  iconOnly = false,
  onChange,
  options = [],
  orientation = "horizontal",
  renderIcon,
  value,
  variant = "default"
}) {
  const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
  const activeIndex = Math.max(
    0,
    normalizedOptions.findIndex((option) => readOptionValue(option) === value)
  );
  const isCyber = variant === "cyber" || iconOnly;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "aria-label": ariaLabel,
      className: cx(
        "nexus-ui-segmented",
        `nexus-ui-segmented--${orientation}`,
        variant !== "default" && `nexus-ui-segmented--${variant}`,
        isCyber && "nexus-ui-segmented--icon-only",
        flush && "nexus-ui-segmented--flush",
        normalizedOptions.length && "has-active",
        className
      ),
      role: "radiogroup",
      style: {
        "--segment-count": Math.max(1, normalizedOptions.length),
        "--active-index": activeIndex
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__highlight", "aria-hidden": "true" }),
    normalizedOptions.map((option) => {
      const optionValue = readOptionValue(option);
      const active = optionValue === value;
      const disabled = Boolean(option.disabled);
      const icon = renderIcon?.(option) ?? option.icon ?? null;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          "aria-checked": active,
          "aria-label": iconOnly ? option.label : void 0,
          className: cx(
            "nexus-ui-segmented__button",
            active && "is-active",
            disabled && "is-disabled"
          ),
          disabled,
          key: optionValue,
          role: "radio",
          type: "button",
          onClick: () => {
            if (!disabled) {
              onChange?.(optionValue);
            }
          }
        },
        icon ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__icon" }, icon) : null,
        isCyber ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__glare", "aria-hidden": "true" }) : null,
        !iconOnly ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-segmented__label" }, option.label) : null,
        iconOnly ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-tooltip" }, option.label) : null
      );
    })
  );
}

// packages/nexus-ui/src/components/ActionMenu/ActionMenu.jsx
init_define_process();
var import_react2 = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);
var VIEWPORT_MARGIN = 8;
function ActionMenu({
  align = "end",
  anchorRef,
  ariaLabel,
  className = "",
  groups = [],
  onAction,
  onClose,
  x,
  y
}) {
  const menuRef = (0, import_react2.useRef)(null);
  const [position, setPosition] = (0, import_react2.useState)({
    ready: false,
    submenusLeft: false,
    x: x ?? 0,
    y: y ?? 0
  });
  (0, import_react2.useEffect)(() => {
    const handlePointerDown = (event) => {
      const clickedAnchor = anchorRef?.current?.contains?.(event.target);
      if (!menuRef.current?.contains(event.target) && !clickedAnchor) {
        onClose?.();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    const closeOnViewportChange = () => onClose?.();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [anchorRef, onClose]);
  (0, import_react2.useLayoutEffect)(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const menuRect = menu.getBoundingClientRect();
    const anchorRect = anchorRef?.current?.getBoundingClientRect();
    const requestedX = Number.isFinite(x) ? x : align === "start" ? anchorRect?.left ?? VIEWPORT_MARGIN : (anchorRect?.right ?? VIEWPORT_MARGIN) - menuRect.width;
    const requestedY = Number.isFinite(y) ? y : (anchorRect?.bottom ?? VIEWPORT_MARGIN) + 7;
    setPosition({
      ready: true,
      submenusLeft: requestedX + menuRect.width + 224 > window.innerWidth,
      x: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedX, window.innerWidth - menuRect.width - VIEWPORT_MARGIN)
      ),
      y: Math.max(
        VIEWPORT_MARGIN,
        Math.min(requestedY, window.innerHeight - menuRect.height - VIEWPORT_MARGIN)
      )
    });
  }, [align, anchorRef, groups, x, y]);
  const renderActions = (actions, depth = 0) => actions.map((action) => {
    const children = Array.isArray(action.children) ? action.children : [];
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: cx(
          "nexus-ui-action-menu__item",
          children.length && "has-children"
        ),
        key: action.id
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          "aria-checked": action.checked,
          "aria-haspopup": children.length ? "menu" : void 0,
          className: cx(
            action.danger && "is-danger",
            action.checked && "is-selected"
          ),
          disabled: action.disabled,
          role: action.role || "menuitem",
          type: "button",
          onClick: () => {
            if (children.length) return;
            onAction?.(action);
            action.onClick?.();
            if (!action.keepOpen) onClose?.();
          }
        },
        action.icon ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-action-menu__icon" }, action.icon) : null,
        /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-action-menu__copy" }, /* @__PURE__ */ React.createElement("strong", null, action.label), action.description ? /* @__PURE__ */ React.createElement("small", null, action.description) : null),
        /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-action-menu__end" }, children.length ? "\u203A" : action.end)
      ),
      children.length ? /* @__PURE__ */ React.createElement(
        "div",
        {
          "aria-label": action.label,
          className: "nexus-ui-action-menu nexus-ui-action-menu__submenu",
          role: "menu",
          style: { "--submenu-depth": depth + 1 }
        },
        renderActions(children, depth + 1)
      ) : null
    );
  });
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ React.createElement(
      "div",
      {
        "aria-label": ariaLabel,
        className: cx(
          "nexus-ui-action-menu",
          position.submenusLeft && "has-submenus-left",
          className
        ),
        ref: menuRef,
        role: "menu",
        style: {
          left: `${position.x}px`,
          top: `${position.y}px`,
          visibility: position.ready ? "visible" : "hidden"
        }
      },
      groups.map((group, groupIndex) => /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-action-menu__group", key: group.id || groupIndex }, renderActions(group.items || [])))
    ),
    document.body
  );
}

// packages/nexus-ui/src/components/Input/Input.jsx
init_define_process();
var import_react3 = __toESM(require_react(), 1);
var Input = (0, import_react3.forwardRef)(function Input2({ className = "", type = "text", ...props }, ref) {
  return /* @__PURE__ */ React.createElement(
    "input",
    {
      ...props,
      ref,
      className: cx("nexus-ui-input", className),
      type
    }
  );
});

// packages/nexus-ui/src/components/Select/Select.jsx
init_define_process();
var import_react4 = __toESM(require_react(), 1);
var Select = (0, import_react4.forwardRef)(function Select2({ className = "", children, ...props }, ref) {
  return /* @__PURE__ */ React.createElement(
    "select",
    {
      ...props,
      ref,
      className: cx("nexus-ui-select", className)
    },
    children
  );
});

// packages/nexus-ui/src/components/SearchField/SearchField.jsx
init_define_process();
var import_react5 = __toESM(require_react(), 1);
function DefaultSearchIcon() {
  return /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { cx: "10.5", cy: "10.5", r: "6.5" }), /* @__PURE__ */ React.createElement("path", { d: "m15.5 15.5 4 4" }));
}
var SearchField = (0, import_react5.forwardRef)(function SearchField2({
  className = "",
  endAction = null,
  icon,
  inputClassName = "",
  ...props
}, ref) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-search-field", className) }, icon !== null ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-search-field__icon" }, icon === void 0 ? /* @__PURE__ */ React.createElement(DefaultSearchIcon, null) : icon) : null, /* @__PURE__ */ React.createElement(
    "input",
    {
      ...props,
      ref,
      className: cx("nexus-ui-search-field__input", inputClassName),
      type: "search"
    }
  ), endAction ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-search-field__action" }, endAction) : null);
});

// packages/nexus-ui/src/components/Gallery/Gallery.jsx
init_define_process();
var import_react6 = __toESM(require_react(), 1);
function normalizeColumnCount(value, fallback = null) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? Math.round(numericValue) : fallback;
}
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && typeof ref === "object") {
    ref.current = value;
  }
}
var GalleryGrid = (0, import_react6.forwardRef)(function GalleryGrid2({
  as: Component = "div",
  className = "",
  compact = false,
  virtual = false,
  columns,
  defaultColumns,
  minColumns = 1,
  maxColumns = 12,
  adjustableColumns = true,
  onColumnsChange,
  style,
  children,
  ...props
}, ref) {
  const nodeRef = (0, import_react6.useRef)(null);
  const leftControlPressedRef = (0, import_react6.useRef)(false);
  const [uncontrolledColumns, setUncontrolledColumns] = (0, import_react6.useState)(
    () => normalizeColumnCount(defaultColumns)
  );
  const controlledColumns = normalizeColumnCount(columns);
  const activeColumns = controlledColumns ?? uncontrolledColumns;
  const normalizedMinColumns = normalizeColumnCount(minColumns, 1);
  const normalizedMaxColumns = Math.max(
    normalizedMinColumns,
    normalizeColumnCount(maxColumns, 12)
  );
  const setNodeRef = (0, import_react6.useCallback)((node) => {
    nodeRef.current = node;
    assignRef(ref, node);
  }, [ref]);
  (0, import_react6.useEffect)(() => {
    if (!adjustableColumns || !activeColumns || !nodeRef.current) {
      return void 0;
    }
    const handleKeyDown = (event) => {
      if (event.code === "ControlLeft") {
        leftControlPressedRef.current = true;
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "ControlLeft") {
        leftControlPressedRef.current = false;
      }
    };
    const handleBlur = () => {
      leftControlPressedRef.current = false;
    };
    const handleWheel = (event) => {
      if (!leftControlPressedRef.current || !Number(event.deltaY)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const direction = Number(event.deltaY) < 0 ? -1 : 1;
      const nextColumns = Math.min(
        normalizedMaxColumns,
        Math.max(normalizedMinColumns, activeColumns + direction)
      );
      if (nextColumns === activeColumns) {
        return;
      }
      if (controlledColumns == null) {
        setUncontrolledColumns(nextColumns);
      }
      onColumnsChange?.(nextColumns);
    };
    const node = nodeRef.current;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      node.removeEventListener("wheel", handleWheel);
    };
  }, [
    activeColumns,
    adjustableColumns,
    controlledColumns,
    normalizedMaxColumns,
    normalizedMinColumns,
    onColumnsChange
  ]);
  const resolvedStyle = activeColumns && !virtual ? {
    ...style,
    gridTemplateColumns: `repeat(${activeColumns}, minmax(0, 1fr))`
  } : style;
  return /* @__PURE__ */ React.createElement(
    Component,
    {
      ...props,
      ref: setNodeRef,
      "data-gallery-columns": activeColumns || void 0,
      style: resolvedStyle,
      className: cx(
        "nexus-ui-gallery",
        activeColumns && adjustableColumns && "nexus-ui-gallery--columns-adjustable",
        compact && "nexus-ui-gallery--compact",
        virtual && "nexus-ui-gallery--virtual",
        className
      )
    },
    children
  );
});
var GalleryCard = (0, import_react6.forwardRef)(function GalleryCard2({
  as: Component = "article",
  className = "",
  interactive,
  selected = false,
  children,
  ...props
}, ref) {
  const isInteractive = interactive ?? (Component === "button" || Component === "a");
  return /* @__PURE__ */ React.createElement(
    Component,
    {
      ...props,
      ref,
      className: cx(
        "nexus-ui-gallery-card",
        isInteractive && "nexus-ui-gallery-card--interactive",
        selected && "is-selected",
        className
      )
    },
    children
  );
});
function GalleryCardMedia({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-gallery-card__media", className) }, children);
}
function GalleryCardBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-gallery-card__body", className) }, children);
}
function GalleryCardTitle({ as: Component = "strong", className = "", children }) {
  return /* @__PURE__ */ React.createElement(Component, { className: cx("nexus-ui-gallery-card__title", className) }, children);
}
function GalleryCardMeta({ as: Component = "span", className = "", children }) {
  return /* @__PURE__ */ React.createElement(Component, { className: cx("nexus-ui-gallery-card__meta", className) }, children);
}

// packages/nexus-ui/src/legacy/Fields.jsx
init_define_process();
function Field({ className = "", label = "", description = "", wide = false, children }) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-field", wide && "nexus-ui-field--wide", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__label" }, label), description ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-field__description" }, description) : null, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-field__control" }, children));
}
function InlineField({ className = "", label = "", children, grow = false }) {
  return /* @__PURE__ */ React.createElement("label", { className: cx("nexus-ui-inline-field", grow && "nexus-ui-inline-field--grow", className) }, /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-inline-field__label" }, label), /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-inline-field__control" }, children));
}
function FieldGrid({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-field-grid", className) }, children);
}

// packages/nexus-ui/src/legacy/Panels.jsx
init_define_process();
function SectionPanel({ className = "", tone = "default", padding = "default", children }) {
  return /* @__PURE__ */ React.createElement("section", { className: cx(
    "nexus-ui-panel",
    tone !== "default" && `nexus-ui-panel--${tone}`,
    padding !== "default" && `nexus-ui-panel--padding-${padding}`,
    className
  ) }, children);
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

// packages/nexus-ui/src/legacy/States.jsx
init_define_process();
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
  return /* @__PURE__ */ React.createElement("div", { className: cx(
    "nexus-ui-state",
    tone !== "default" && `nexus-ui-state--${tone}`,
    centered && "nexus-ui-state--centered",
    className
  ) }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, title ? /* @__PURE__ */ React.createElement("strong", null, title) : null, description ? /* @__PURE__ */ React.createElement("p", null, description) : null, children);
}
function MetricCard({
  className = "",
  tone = "default",
  eyebrow = "",
  value = "",
  description = "",
  children = null
}) {
  return /* @__PURE__ */ React.createElement("div", { className: cx(
    "nexus-ui-metric",
    tone !== "default" && `nexus-ui-metric--${tone}`,
    className
  ) }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, /* @__PURE__ */ React.createElement("strong", null, value), description ? /* @__PURE__ */ React.createElement("p", null, description) : null, children);
}

// packages/nexus-ui/src/legacy/Workspace.jsx
init_define_process();
function WorkspacePage({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-page", className) }, children);
}
function WorkspaceTopbar({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-topbar", className) }, children);
}
function WorkspaceTitle({ className = "", eyebrow = "", title = "", description = "", aside = null }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-title", className) }, /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-title__copy" }, eyebrow ? /* @__PURE__ */ React.createElement("span", { className: "nexus-ui-eyebrow" }, eyebrow) : null, title ? /* @__PURE__ */ React.createElement("strong", null, title) : null, description ? /* @__PURE__ */ React.createElement("p", null, description) : null), aside ? /* @__PURE__ */ React.createElement("div", { className: "nexus-ui-title__aside" }, aside) : null);
}
function ToolbarActions({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-toolbar-actions", className) }, children);
}
function WorkspaceBody({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-body", className) }, children);
}
function SplitLayout({ className = "", variant = "main-aside", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx(
    "nexus-ui-split",
    variant === "sidebar-detail" ? "nexus-ui-split--sidebar-detail" : "nexus-ui-split--main-aside",
    className
  ) }, children);
}
function SplitMain({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("div", { className: cx("nexus-ui-split__main", className) }, children);
}
function SplitAside({ className = "", children }) {
  return /* @__PURE__ */ React.createElement("aside", { className: cx("nexus-ui-split__aside", className) }, children);
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

// life-tracker/src/finance/PersonalFinanceView.jsx
init_define_process();

// life-tracker/src/finance/constants.js
init_define_process();
var FINANCE_CASH_DENOMINATIONS = [50, 100, 200, 500, 1e3, 2e3, 1e4, 2e4];
var FINANCE_PRESETS = [
  {
    id: "expense-posted",
    kind: "expense",
    status: "posted",
    label: "Gasto realizado",
    shortLabel: "Gasto real"
  },
  {
    id: "expense-planned",
    kind: "expense",
    status: "planned",
    label: "Gasto pendiente",
    shortLabel: "Gasto pendiente"
  },
  {
    id: "income-posted",
    kind: "income",
    status: "posted",
    label: "Ingreso realizado",
    shortLabel: "Ingreso real"
  },
  {
    id: "income-planned",
    kind: "income",
    status: "planned",
    label: "Ingreso pendiente",
    shortLabel: "Ingreso pendiente"
  }
];
var FINANCE_PERIOD_FILTERS = [
  { value: "all", label: "Todo" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "365d", label: "12 meses" }
];

// life-tracker/src/finance/icons.jsx
init_define_process();
var React2 = window.React;
function BaseIcon({ children, size = 18, strokeWidth = 1.8 }) {
  return /* @__PURE__ */ React2.createElement(
    "svg",
    {
      "aria-hidden": "true",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    children
  );
}
function WalletIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4.75 8.25a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M16.5 12h2.75v2.5H16.5a1.25 1.25 0 0 1 0-2.5Z" }), /* @__PURE__ */ React2.createElement("path", { d: "M7.5 6.25V5.5a1.75 1.75 0 0 1 1.75-1.75H17" }));
}
function RefreshIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M20 6v5h-5" }), /* @__PURE__ */ React2.createElement("path", { d: "M4 18v-5h5" }), /* @__PURE__ */ React2.createElement("path", { d: "M18 11a7 7 0 0 0-12-3" }), /* @__PURE__ */ React2.createElement("path", { d: "M6 13a7 7 0 0 0 12 3" }));
}
function PencilIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" }), /* @__PURE__ */ React2.createElement("path", { d: "m13 7 4 4" }));
}
function TrashIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M4.5 7.5h15" }), /* @__PURE__ */ React2.createElement("path", { d: "M9.5 7.5V5.75A1.75 1.75 0 0 1 11.25 4h1.5a1.75 1.75 0 0 1 1.75 1.75V7.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M7 7.5 8 19a1.5 1.5 0 0 0 1.49 1.37h5.02A1.5 1.5 0 0 0 16 19l1-11.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M10 11v5" }), /* @__PURE__ */ React2.createElement("path", { d: "M14 11v5" }));
}
function ArrowInIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 18V6" }), /* @__PURE__ */ React2.createElement("path", { d: "m7.5 10.5 4.5-4.5 4.5 4.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M5 19.25h14" }));
}
function ArrowOutIcon(props) {
  return /* @__PURE__ */ React2.createElement(BaseIcon, { ...props }, /* @__PURE__ */ React2.createElement("path", { d: "M12 6v12" }), /* @__PURE__ */ React2.createElement("path", { d: "m16.5 13.5-4.5 4.5-4.5-4.5" }), /* @__PURE__ */ React2.createElement("path", { d: "M5 4.75h14" }));
}

// life-tracker/src/ipc-client.js
init_define_process();
var runtimeIpc = null;
function configurePluginIpc(ipc) {
  runtimeIpc = ipc;
}
function toOperation(channel) {
  return String(channel || "").replace(/^life-tracker:/, "").replace(/:/g, ".");
}
var pluginIpc = Object.freeze({
  invoke(channel, ...args) {
    if (!runtimeIpc) throw new Error("PLUGIN_IPC_NOT_READY");
    return runtimeIpc.invoke(toOperation(channel), ...args);
  }
});

// life-tracker/src/finance/PersonalFinanceView.jsx
var {
  startTransition,
  useDeferredValue,
  useEffect: useEffect3,
  useMemo,
  useRef: useRef3,
  useState: useState4
} = window.React;
var ipcRenderer = pluginIpc;
var LIFE_TRACKER_FINANCE_CHANNEL_PREFIX = "life-tracker:finance";
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
var FINANCE_WORKBENCH_TABS = [
  { value: "compose", label: "Registrar" },
  { value: "cash", label: "Efectivo" },
  { value: "reports", label: "Reportes" }
];
function todayLocalDate() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function buildEmptyFormState(presetId = "expense-posted") {
  const preset = FINANCE_PRESETS.find((entry) => entry.id === presetId) || FINANCE_PRESETS[0];
  return {
    id: "",
    presetId: preset.id,
    kind: preset.kind,
    status: preset.status,
    title: "",
    amount: "",
    movementDate: todayLocalDate(),
    category: "",
    platform: "",
    counterparty: "",
    notes: ""
  };
}
function buildFormStateFromMovement(movement) {
  const preset = FINANCE_PRESETS.find(
    (entry) => entry.kind === movement?.kind && entry.status === movement?.status
  ) || FINANCE_PRESETS[0];
  return {
    id: movement?.id || "",
    presetId: preset.id,
    kind: preset.kind,
    status: preset.status,
    title: movement?.title || "",
    amount: Number.isFinite(Number(movement?.amountCents)) ? (Number(movement.amountCents) / 100).toFixed(2) : "",
    movementDate: movement?.movementDate || todayLocalDate(),
    category: movement?.category || "",
    platform: movement?.platform || "",
    counterparty: movement?.counterparty || "",
    notes: movement?.notes || ""
  };
}
function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function getSignedAmountCents(movement) {
  const amountCents = Math.max(0, Math.round(Number(movement?.amountCents || 0)));
  return movement?.kind === "expense" ? -amountCents : amountCents;
}
function formatCurrency(cents) {
  return CURRENCY_FORMATTER.format((Number(cents) || 0) / 100);
}
function formatSignedCurrency(cents) {
  const absoluteValue = formatCurrency(Math.abs(Number(cents) || 0));
  return `${Number(cents) < 0 ? "-" : "+"}${absoluteValue}`;
}
function formatDateLabel(value) {
  if (!value) {
    return "Sin fecha";
  }
  const date = /* @__PURE__ */ new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : LONG_DATE_FORMATTER.format(date);
}
function formatMonthLabel(value) {
  const date = /* @__PURE__ */ new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : MONTH_FORMATTER.format(date);
}
function formatDateTimeLabel(value) {
  if (!value) {
    return "Sin registro";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_TIME_FORMATTER.format(date);
}
function formatDenominationLabel(value) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}
function getPresetById(presetId) {
  return FINANCE_PRESETS.find((entry) => entry.id === presetId) || FINANCE_PRESETS[0];
}
function getMovementStatusLabel(status) {
  return status === "planned" ? "Pendiente" : "Realizado";
}
function getMovementKindLabel(kind) {
  return kind === "income" ? "Ingreso" : "Gasto";
}
function buildCashCountFormState(denominations, sourceCounts = {}) {
  return Object.fromEntries(
    denominations.map((denomination) => [
      String(denomination),
      String(sourceCounts?.[String(denomination)] ?? "")
    ])
  );
}
function normalizeCashCountValue(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.max(0, Math.round(numericValue));
}
function calculateCashCountTotalCents(denominations, counts) {
  return denominations.reduce((total, denomination) => {
    return total + 100 * normalizeCashCountValue(counts?.[String(denomination)]);
  }, 0);
}
function compareMovementsByDate(left, right) {
  const leftKey = `${left?.movementDate || ""}:${left?.updatedAt || ""}:${left?.createdAt || ""}`;
  const rightKey = `${right?.movementDate || ""}:${right?.updatedAt || ""}:${right?.createdAt || ""}`;
  return leftKey.localeCompare(rightKey);
}
function resolvePeriodStart(period) {
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  if (period === "30d") {
    now.setDate(now.getDate() - 29);
    return now;
  }
  if (period === "90d") {
    now.setDate(now.getDate() - 89);
    return now;
  }
  if (period === "365d") {
    now.setDate(now.getDate() - 364);
    return now;
  }
  return null;
}
function isMovementAfterStart(movement, startDate) {
  if (!startDate) {
    return true;
  }
  const movementDate = /* @__PURE__ */ new Date(`${movement?.movementDate || ""}T00:00:00`);
  if (Number.isNaN(movementDate.getTime())) {
    return false;
  }
  return movementDate >= startDate;
}
function calculatePortfolioSummary(movements) {
  let actualBalanceCents = 0;
  let projectedBalanceCents = 0;
  let plannedExpenseCents = 0;
  let plannedIncomeCents = 0;
  for (const movement of movements) {
    const signedAmount = getSignedAmountCents(movement);
    if (movement?.status === "posted") {
      actualBalanceCents += signedAmount;
      projectedBalanceCents += signedAmount;
      continue;
    }
    projectedBalanceCents += signedAmount;
    if (movement?.kind === "expense") {
      plannedExpenseCents += Math.abs(signedAmount);
    } else {
      plannedIncomeCents += Math.abs(signedAmount);
    }
  }
  return {
    actualBalanceCents,
    projectedBalanceCents,
    plannedExpenseCents,
    plannedIncomeCents
  };
}
function buildTimelineSeries(movements, period) {
  const startDate = resolvePeriodStart(period);
  const sortedMovements = [...movements].sort(compareMovementsByDate);
  const groupedByDate = /* @__PURE__ */ new Map();
  let actualSeed = 0;
  let projectedSeed = 0;
  for (const movement of sortedMovements) {
    const signedAmount = getSignedAmountCents(movement);
    const isPosted = movement?.status === "posted";
    if (!isMovementAfterStart(movement, startDate)) {
      projectedSeed += signedAmount;
      if (isPosted) {
        actualSeed += signedAmount;
      }
      continue;
    }
    const dateKey = String(movement?.movementDate || "");
    const bucket = groupedByDate.get(dateKey) || {
      actualDelta: 0,
      projectedDelta: 0
    };
    bucket.projectedDelta += signedAmount;
    if (isPosted) {
      bucket.actualDelta += signedAmount;
    }
    groupedByDate.set(dateKey, bucket);
  }
  let actualRunningBalance = actualSeed;
  let projectedRunningBalance = projectedSeed;
  const points = [...groupedByDate.entries()].map(([dateKey, bucket]) => {
    actualRunningBalance += bucket.actualDelta;
    projectedRunningBalance += bucket.projectedDelta;
    return {
      date: dateKey,
      actualBalanceCents: actualRunningBalance,
      projectedBalanceCents: projectedRunningBalance
    };
  });
  return {
    points,
    actualSeed,
    projectedSeed
  };
}
function buildMonthlyFlowRows(movements, period) {
  const startDate = resolvePeriodStart(period);
  const buckets = /* @__PURE__ */ new Map();
  for (const movement of movements) {
    if (!isMovementAfterStart(movement, startDate)) {
      continue;
    }
    const movementDate = String(movement?.movementDate || "");
    const monthKey = movementDate.slice(0, 7);
    if (!monthKey) {
      continue;
    }
    const bucket = buckets.get(monthKey) || {
      monthKey,
      postedIncomeCents: 0,
      plannedIncomeCents: 0,
      postedExpenseCents: 0,
      plannedExpenseCents: 0
    };
    const amountCents = Math.max(0, Number(movement?.amountCents || 0));
    if (movement?.kind === "income") {
      if (movement?.status === "posted") {
        bucket.postedIncomeCents += amountCents;
      } else {
        bucket.plannedIncomeCents += amountCents;
      }
    } else if (movement?.status === "posted") {
      bucket.postedExpenseCents += amountCents;
    } else {
      bucket.plannedExpenseCents += amountCents;
    }
    buckets.set(monthKey, bucket);
  }
  const rows = [...buckets.values()].sort(
    (left, right) => String(left.monthKey).localeCompare(String(right.monthKey))
  );
  const maxValue = rows.reduce((highest, row) => {
    return Math.max(
      highest,
      row.postedIncomeCents + row.plannedIncomeCents,
      row.postedExpenseCents + row.plannedExpenseCents
    );
  }, 0);
  return {
    rows,
    maxValue
  };
}
function buildLinePath(points, valueKey, chartWidth, chartHeight, minValue, maxValue) {
  if (!points.length) {
    return "";
  }
  const safeRange = Math.max(1, maxValue - minValue);
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;
  return points.map((point, index) => {
    const x = points.length > 1 ? index * stepX : chartWidth / 2;
    const y = chartHeight - (Number(point?.[valueKey] || 0) - minValue) / safeRange * chartHeight;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}
function BalanceTimelineChart({ points }) {
  if (!points.length) {
    return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__emptyChart" }, "Sin movimientos para graficar en este rango.");
  }
  const allValues = points.flatMap((point) => [
    Number(point.actualBalanceCents || 0),
    Number(point.projectedBalanceCents || 0)
  ]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const chartWidth = 100;
  const chartHeight = 58;
  const actualPath = buildLinePath(points, "actualBalanceCents", chartWidth, chartHeight, minValue, maxValue);
  const projectedPath = buildLinePath(
    points,
    "projectedBalanceCents",
    chartWidth,
    chartHeight,
    minValue,
    maxValue
  );
  const zeroY = chartHeight - (0 - minValue) / Math.max(1, maxValue - minValue) * chartHeight;
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__timeline" }, /* @__PURE__ */ React.createElement(
    "svg",
    {
      className: "financeDashboard__timelineSvg",
      viewBox: `0 0 ${chartWidth} ${chartHeight}`,
      preserveAspectRatio: "none",
      role: "img",
      "aria-label": "Evolucion del balance actual y proyectado"
    },
    /* @__PURE__ */ React.createElement(
      "line",
      {
        x1: "0",
        y1: zeroY.toFixed(2),
        x2: chartWidth,
        y2: zeroY.toFixed(2),
        className: "financeDashboard__timelineAxis"
      }
    ),
    /* @__PURE__ */ React.createElement("path", { d: projectedPath, className: "financeDashboard__timelineProjected" }),
    /* @__PURE__ */ React.createElement("path", { d: actualPath, className: "financeDashboard__timelineActual" })
  ), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__timelineLegend" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "financeDashboard__legendSwatch financeDashboard__legendSwatch--actual" }), "Actual"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("i", { className: "financeDashboard__legendSwatch financeDashboard__legendSwatch--projected" }), "Proyectado")), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__timelineTicks" }, /* @__PURE__ */ React.createElement("span", null, formatDateLabel(points[0]?.date)), /* @__PURE__ */ React.createElement("span", null, formatDateLabel(points.at(-1)?.date))));
}
function MonthlyFlowChart({ rows, maxValue }) {
  if (!rows.length || !maxValue) {
    return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__emptyChart" }, "Aun no hay flujo suficiente para este rango.");
  }
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowRows" }, rows.map((row) => {
    const incomeTotal = row.postedIncomeCents + row.plannedIncomeCents;
    const expenseTotal = row.postedExpenseCents + row.plannedExpenseCents;
    return /* @__PURE__ */ React.createElement("div", { key: row.monthKey, className: "financeDashboard__flowRow" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowMonth" }, formatMonthLabel(row.monthKey)), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowMetric" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowLabel" }, "Ingresos"), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowTrack" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--income",
        style: {
          width: `${Math.max(0, row.postedIncomeCents) / maxValue * 100}%`
        }
      }
    ), row.plannedIncomeCents > 0 ? /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--incomePlanned",
        style: {
          width: `${Math.max(0, incomeTotal) / maxValue * 100}%`
        }
      }
    ) : null), /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowValue" }, formatCurrency(incomeTotal))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowMetric" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowLabel" }, "Gastos"), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__flowTrack" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--expense",
        style: {
          width: `${Math.max(0, row.postedExpenseCents) / maxValue * 100}%`
        }
      }
    ), row.plannedExpenseCents > 0 ? /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "financeDashboard__flowFill financeDashboard__flowFill--expensePlanned",
        style: {
          width: `${Math.max(0, expenseTotal) / maxValue * 100}%`
        }
      }
    ) : null), /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__flowValue" }, formatCurrency(expenseTotal))));
  }));
}
function MovementRow({ movement, onEdit, onDelete, deleting }) {
  const signedAmountCents = getSignedAmountCents(movement);
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementRow" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementMain" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementTitleRow" }, /* @__PURE__ */ React.createElement("strong", null, movement?.title || "Movimiento"), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: [
        "financeDashboard__movementAmount",
        movement?.kind === "income" ? "financeDashboard__movementAmount--income" : "financeDashboard__movementAmount--expense"
      ].join(" ")
    },
    formatSignedCurrency(signedAmountCents)
  )), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementMeta" }, /* @__PURE__ */ React.createElement("span", null, formatDateLabel(movement?.movementDate)), /* @__PURE__ */ React.createElement("span", null, movement?.category || "Sin categoria"), /* @__PURE__ */ React.createElement("span", null, movement?.platform || "Sin plataforma"), movement?.counterparty ? /* @__PURE__ */ React.createElement("span", null, movement.counterparty) : null), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementPills" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__pill" }, getMovementKindLabel(movement?.kind)), /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__pill" }, getMovementStatusLabel(movement?.status))), movement?.notes ? /* @__PURE__ */ React.createElement("p", { className: "financeDashboard__movementNotes" }, movement.notes) : null), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementActions" }, /* @__PURE__ */ React.createElement(CyberIconButton, { type: "button", className: "financeDashboard__iconButton", onClick: onEdit, title: "Editar movimiento" }, /* @__PURE__ */ React.createElement(PencilIcon, { size: 15 })), /* @__PURE__ */ React.createElement(
    CyberIconButton,
    {
      type: "button",
      className: "financeDashboard__iconButton financeDashboard__iconButton--danger",
      tone: "danger",
      onClick: onDelete,
      disabled: deleting,
      title: "Borrar movimiento"
    },
    /* @__PURE__ */ React.createElement(TrashIcon, { size: 15 })
  )));
}
function CashCountHistoryRow({ cashCount }) {
  const varianceIsPositive = Number(cashCount?.varianceCents || 0) > 0;
  const varianceIsNegative = Number(cashCount?.varianceCents || 0) < 0;
  return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashHistoryRow" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashHistoryMain" }, /* @__PURE__ */ React.createElement("strong", null, formatDateTimeLabel(cashCount?.countedAt)), /* @__PURE__ */ React.createElement("span", null, "Contado:", " ", formatCurrency(cashCount?.totalCountedCents))), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: [
        "financeDashboard__cashVariance",
        varianceIsPositive && "financeDashboard__cashVariance--positive",
        varianceIsNegative && "financeDashboard__cashVariance--negative"
      ].filter(Boolean).join(" ")
    },
    formatSignedCurrency(cashCount?.varianceCents || 0)
  ));
}
function PersonalFinanceView({
  shellMode = "workspace",
  showTopbar = true
} = {}) {
  const titleInputRef = useRef3(null);
  const [movements, setMovements] = useState4([]);
  const [cashAudit, setCashAudit] = useState4({
    counts: [],
    denominations: FINANCE_CASH_DENOMINATIONS,
    latestCashCount: null,
    currentExpectedCents: 0,
    currentCountedCents: null,
    currentVarianceCents: null
  });
  const [loading, setLoading] = useState4(true);
  const [refreshing, setRefreshing] = useState4(false);
  const [saving, setSaving] = useState4(false);
  const [savingCashCount, setSavingCashCount] = useState4(false);
  const [deletingId, setDeletingId] = useState4("");
  const [error, setError] = useState4("");
  const [searchValue, setSearchValue] = useState4("");
  const [periodFilter, setPeriodFilter] = useState4("90d");
  const [kindFilter, setKindFilter] = useState4("all");
  const [statusFilter, setStatusFilter] = useState4("all");
  const [formState, setFormState] = useState4(() => buildEmptyFormState());
  const [showAdvancedForm, setShowAdvancedForm] = useState4(false);
  const [workbenchTab, setWorkbenchTab] = useState4("compose");
  const [cashCountForm, setCashCountForm] = useState4(
    () => buildCashCountFormState(FINANCE_CASH_DENOMINATIONS)
  );
  const deferredSearchValue = useDeferredValue(searchValue);
  const loadMovements = async () => {
    setError("");
    setRefreshing(true);
    try {
      const response = await ipcRenderer.invoke(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:list`);
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudieron cargar los movimientos.");
      }
      startTransition(() => {
        setMovements(Array.isArray(response?.data?.movements) ? response.data.movements : []);
        const nextCashAudit = response?.data?.cashAudit || null;
        const nextDenominations = Array.isArray(nextCashAudit?.denominations) && nextCashAudit.denominations.length ? nextCashAudit.denominations : FINANCE_CASH_DENOMINATIONS;
        const nextLatestCashCount = nextCashAudit?.latestCashCount || null;
        setCashAudit({
          counts: Array.isArray(nextCashAudit?.counts) ? nextCashAudit.counts : [],
          denominations: nextDenominations,
          latestCashCount: nextLatestCashCount,
          currentExpectedCents: Number(nextCashAudit?.currentExpectedCents || 0),
          currentCountedCents: nextCashAudit?.currentCountedCents == null ? null : Number(nextCashAudit.currentCountedCents),
          currentVarianceCents: nextCashAudit?.currentVarianceCents == null ? null : Number(nextCashAudit.currentVarianceCents)
        });
        setCashCountForm(buildCashCountFormState(nextDenominations, nextLatestCashCount?.counts));
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "No se pudieron cargar los movimientos."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect3(() => {
    void loadMovements();
  }, []);
  const categories = useMemo(() => {
    return [...new Set(movements.map((movement) => movement?.category).filter(Boolean))].sort(
      (left, right) => String(left).localeCompare(String(right), void 0, { sensitivity: "base" })
    );
  }, [movements]);
  const platforms = useMemo(() => {
    return [...new Set(movements.map((movement) => movement?.platform).filter(Boolean))].sort(
      (left, right) => String(left).localeCompare(String(right), void 0, { sensitivity: "base" })
    );
  }, [movements]);
  const summary = useMemo(() => calculatePortfolioSummary(movements), [movements]);
  const cashDenominations = useMemo(() => {
    return Array.isArray(cashAudit?.denominations) && cashAudit.denominations.length ? cashAudit.denominations : FINANCE_CASH_DENOMINATIONS;
  }, [cashAudit?.denominations]);
  const queryFilteredMovements = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredSearchValue);
    return movements.filter((movement) => {
      if (kindFilter !== "all" && movement?.kind !== kindFilter) {
        return false;
      }
      if (statusFilter !== "all" && movement?.status !== statusFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      const searchableText = normalizeSearchText(
        [
          movement?.title,
          movement?.category,
          movement?.platform,
          movement?.counterparty,
          movement?.notes
        ].filter(Boolean).join(" ")
      );
      return searchableText.includes(normalizedQuery);
    });
  }, [deferredSearchValue, kindFilter, movements, statusFilter]);
  const visibleMovements = useMemo(() => {
    const startDate = resolvePeriodStart(periodFilter);
    return queryFilteredMovements.filter((movement) => isMovementAfterStart(movement, startDate));
  }, [periodFilter, queryFilteredMovements]);
  const timelineSeries = useMemo(
    () => buildTimelineSeries(queryFilteredMovements, periodFilter),
    [periodFilter, queryFilteredMovements]
  );
  const monthlyFlow = useMemo(
    () => buildMonthlyFlowRows(queryFilteredMovements, periodFilter),
    [periodFilter, queryFilteredMovements]
  );
  const editingMovement = Boolean(formState.id);
  const activePreset = getPresetById(formState.presetId);
  const cashCountPreview = useMemo(() => {
    const totalCountedCents = calculateCashCountTotalCents(cashDenominations, cashCountForm);
    const expectedCents = Number(cashAudit?.currentExpectedCents || 0);
    return {
      totalCountedCents,
      expectedCents,
      varianceCents: totalCountedCents - expectedCents
    };
  }, [cashAudit?.currentExpectedCents, cashCountForm, cashDenominations]);
  const recentCashCounts = useMemo(
    () => Array.isArray(cashAudit?.counts) ? cashAudit.counts.slice(0, 4) : [],
    [cashAudit?.counts]
  );
  const updateFormState = (patch) => {
    setFormState((current) => ({
      ...current,
      ...patch
    }));
  };
  const applyPreset = (presetId) => {
    const preset = getPresetById(presetId);
    setFormState((current) => ({
      ...current,
      presetId: preset.id,
      kind: preset.kind,
      status: preset.status
    }));
    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  };
  const resetForm = () => {
    setFormState(buildEmptyFormState(activePreset?.id));
    setShowAdvancedForm(false);
    setWorkbenchTab("compose");
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const numericAmount = Number(formState.amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("Ingresa un monto valido mayor a cero.");
      }
      const response = await ipcRenderer.invoke(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:save-movement`, {
        id: formState.id || void 0,
        kind: formState.kind,
        status: formState.status,
        title: formState.title,
        amount: numericAmount,
        movementDate: formState.movementDate,
        category: formState.category,
        platform: formState.platform,
        counterparty: formState.counterparty,
        notes: formState.notes
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar el movimiento.");
      }
      resetForm();
      await loadMovements();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo guardar el movimiento."
      );
    } finally {
      setSaving(false);
    }
  };
  const handleEditMovement = (movement) => {
    setFormState(buildFormStateFromMovement(movement));
    setShowAdvancedForm(true);
    setWorkbenchTab("compose");
    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  };
  const handleDeleteMovement = async (movement) => {
    const movementId = String(movement?.id || "");
    if (!movementId) {
      return;
    }
    const confirmed = window.confirm(`Borrar "${movement?.title || "este movimiento"}"?`);
    if (!confirmed) {
      return;
    }
    setDeletingId(movementId);
    setError("");
    try {
      const response = await ipcRenderer.invoke(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:delete-movement`, {
        id: movementId
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo borrar el movimiento.");
      }
      if (formState.id === movementId) {
        resetForm();
      }
      await loadMovements();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "No se pudo borrar el movimiento."
      );
    } finally {
      setDeletingId("");
    }
  };
  const handleCashCountFieldChange = (denomination, nextValue) => {
    setCashCountForm((current) => ({
      ...current,
      [String(denomination)]: nextValue
    }));
  };
  const handleSaveCashCount = async () => {
    setSavingCashCount(true);
    setError("");
    try {
      const countsPayload = Object.fromEntries(
        cashDenominations.map((denomination) => [
          String(denomination),
          normalizeCashCountValue(cashCountForm[String(denomination)])
        ])
      );
      const response = await ipcRenderer.invoke(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:save-cash-count`, {
        counts: countsPayload
      });
      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar el arqueo.");
      }
      await loadMovements();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo guardar el arqueo de efectivo."
      );
    } finally {
      setSavingCashCount(false);
    }
  };
  const hasAnyMovement = movements.length > 0;
  const cashVarianceIsPositive = cashCountPreview.varianceCents > 0;
  const cashVarianceIsNegative = cashCountPreview.varianceCents < 0;
  const workbenchTitle = workbenchTab === "cash" ? "Arqueo de efectivo" : workbenchTab === "reports" ? "Reportes compactos" : editingMovement ? "Editar movimiento" : "Nuevo movimiento";
  const workbenchDescription = workbenchTab === "cash" ? "Compara el efectivo contado contra el saldo esperado en movimientos realizados con plataforma `Efectivo`." : workbenchTab === "reports" ? "Lectura rapida de balance y flujo sin salir del dashboard." : "Registra ingresos y gastos con un flujo corto por defecto y detalles opcionales solo cuando hacen falta.";
  const pageContent = /* @__PURE__ */ React.createElement(React.Fragment, null, showTopbar ? /* @__PURE__ */ React.createElement(WorkspaceTopbar, null, /* @__PURE__ */ React.createElement(
    WorkspaceTitle,
    {
      eyebrow: "Life Tracker",
      title: "Finanzas",
      description: "Movimientos como centro del flujo diario, con arqueo y reportes como herramientas auxiliares."
    }
  ), /* @__PURE__ */ React.createElement(ToolbarActions, null, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      tone: "primary",
      onClick: () => {
        resetForm();
        setWorkbenchTab("compose");
        window.requestAnimationFrame(() => titleInputRef.current?.focus());
      }
    },
    "Nuevo movimiento"
  ), /* @__PURE__ */ React.createElement(
    CyberIconButton,
    {
      type: "button",
      onClick: () => void loadMovements(),
      disabled: refreshing,
      title: "Recargar movimientos"
    },
    /* @__PURE__ */ React.createElement(RefreshIcon, { size: 16 })
  ))) : null, /* @__PURE__ */ React.createElement(WorkspaceBody, { className: "financeDashboard__content" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__summaryRow" }, /* @__PURE__ */ React.createElement(
    MetricCard,
    {
      className: "financeDashboard__summaryCard",
      tone: "highlight",
      eyebrow: "Saldo actual",
      value: formatCurrency(summary.actualBalanceCents),
      description: `Basado solo en movimientos realizados. Quedan ${formatCurrency(summary.plannedIncomeCents)} en ingresos pendientes y ${formatCurrency(summary.plannedExpenseCents)} en gastos pendientes.`
    }
  ), /* @__PURE__ */ React.createElement(
    MetricCard,
    {
      className: "financeDashboard__summaryCard",
      tone: "soft",
      eyebrow: "Saldo proyectado",
      value: formatCurrency(summary.projectedBalanceCents),
      description: "Resultado esperado si se ejecutan todos los pendientes ya cargados."
    }
  ), /* @__PURE__ */ React.createElement(
    MetricCard,
    {
      className: "financeDashboard__summaryCard financeDashboard__summaryCard--variance",
      eyebrow: "Efectivo contado",
      value: formatCurrency(cashCountPreview.totalCountedCents),
      description: `Esperado: ${formatCurrency(cashCountPreview.expectedCents)}. Diferencia: ${formatSignedCurrency(cashCountPreview.varianceCents)}.`
    }
  )), error ? /* @__PURE__ */ React.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React.createElement(SplitLayout, { className: "financeDashboard__workspace" }, /* @__PURE__ */ React.createElement(SplitMain, null, /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--history" }, /* @__PURE__ */ React.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__panelHeaderActions" }, /* @__PURE__ */ React.createElement("span", { className: "financeDashboard__historyCount" }, visibleMovements.length, " ", "visibles"))
    },
    /* @__PURE__ */ React.createElement(
      PanelTitle,
      {
        eyebrow: "Centro de trabajo",
        title: "Movimientos",
        description: "Consulta, filtra y edita ingresos y gastos sin perder el contexto principal."
      }
    )
  ), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__filtersBar" }, /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField financeDashboard__inlineField--search", label: "Buscar", grow: true }, /* @__PURE__ */ React.createElement(
    SearchField,
    {
      value: searchValue,
      onChange: (event) => setSearchValue(event.target.value),
      placeholder: "Titulo, categoria, plataforma o nota",
      "aria-label": "Buscar movimientos"
    }
  )), /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField", label: "Periodo" }, /* @__PURE__ */ React.createElement(Select, { value: periodFilter, onChange: (event) => setPeriodFilter(event.target.value) }, FINANCE_PERIOD_FILTERS.map((option) => /* @__PURE__ */ React.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField", label: "Tipo" }, /* @__PURE__ */ React.createElement(Select, { value: kindFilter, onChange: (event) => setKindFilter(event.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "Todos"), /* @__PURE__ */ React.createElement("option", { value: "expense" }, "Gastos"), /* @__PURE__ */ React.createElement("option", { value: "income" }, "Ingresos"))), /* @__PURE__ */ React.createElement(InlineField, { className: "financeDashboard__inlineField", label: "Estado" }, /* @__PURE__ */ React.createElement(Select, { value: statusFilter, onChange: (event) => setStatusFilter(event.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "Todos"), /* @__PURE__ */ React.createElement("option", { value: "posted" }, "Realizados"), /* @__PURE__ */ React.createElement("option", { value: "planned" }, "Pendientes")))), /* @__PURE__ */ React.createElement(ScrollRegion, { className: "financeDashboard__movementRegion" }, loading ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      eyebrow: "Cargando",
      title: "Estamos leyendo tus movimientos",
      description: "En un momento veras el historial filtrable."
    }
  ) : !hasAnyMovement ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      centered: true,
      eyebrow: "Sin actividad",
      title: "Todavia no hay movimientos",
      description: "Empieza con un gasto o ingreso desde el panel lateral."
    }
  ) : visibleMovements.length === 0 ? /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      centered: true,
      eyebrow: "Sin resultados",
      title: "No hay movimientos para esos filtros",
      description: "Prueba con otro periodo o limpia la busqueda."
    }
  ) : /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__movementList" }, visibleMovements.map((movement) => /* @__PURE__ */ React.createElement(
    MovementRow,
    {
      key: movement.id,
      movement,
      deleting: deletingId === movement.id,
      onEdit: () => handleEditMovement(movement),
      onDelete: () => void handleDeleteMovement(movement)
    }
  )))))), /* @__PURE__ */ React.createElement(SplitAside, { className: "financeDashboard__aside" }, /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--workbench" }, /* @__PURE__ */ React.createElement(PanelStack, null, /* @__PURE__ */ React.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React.createElement(
        SegmentedControl,
        {
          ariaLabel: "Zona de trabajo de finanzas",
          options: FINANCE_WORKBENCH_TABS,
          value: workbenchTab,
          onChange: setWorkbenchTab
        }
      )
    },
    /* @__PURE__ */ React.createElement(PanelTitle, { title: workbenchTitle, description: workbenchDescription })
  ), workbenchTab === "compose" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__presetGrid", role: "tablist", "aria-label": "Tipo de movimiento" }, FINANCE_PRESETS.map((preset) => /* @__PURE__ */ React.createElement(
    Button,
    {
      key: preset.id,
      type: "button",
      className: [
        "financeDashboard__presetButton",
        formState.presetId === preset.id && "is-active",
        preset.kind === "income" ? "financeDashboard__presetButton--income" : "financeDashboard__presetButton--expense"
      ].filter(Boolean).join(" "),
      onClick: () => applyPreset(preset.id)
    },
    preset.kind === "income" ? /* @__PURE__ */ React.createElement(ArrowInIcon, { size: 16 }) : /* @__PURE__ */ React.createElement(ArrowOutIcon, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, preset.shortLabel)
  ))), /* @__PURE__ */ React.createElement("form", { className: "financeDashboard__form", onSubmit: handleSubmit }, /* @__PURE__ */ React.createElement(FieldGrid, null, /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--wide", label: "Titulo", wide: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: titleInputRef,
      type: "text",
      value: formState.title,
      onChange: (event) => updateFormState({ title: event.target.value }),
      placeholder: activePreset.kind === "income" ? "Ej. sueldo, venta, transferencia" : "Ej. supermercado, alquiler, cuota",
      required: true
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--amount", label: "Monto", wide: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      min: "0",
      step: "0.01",
      value: formState.amount,
      onChange: (event) => updateFormState({ amount: event.target.value }),
      placeholder: "0.00",
      required: true
    }
  )), showAdvancedForm ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field", label: "Fecha" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      value: formState.movementDate,
      onChange: (event) => updateFormState({ movementDate: event.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field", label: "Categoria" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      list: "finanzas-categories",
      value: formState.category,
      onChange: (event) => updateFormState({ category: event.target.value }),
      placeholder: "Comida, transporte, sueldo..."
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field", label: "Plataforma" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      list: "finanzas-platforms",
      value: formState.platform,
      onChange: (event) => updateFormState({ platform: event.target.value }),
      placeholder: "Efectivo, Mercado Pago, banco..."
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--wide", label: "Origen o lugar", wide: true }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: formState.counterparty,
      onChange: (event) => updateFormState({ counterparty: event.target.value }),
      placeholder: "Comercio, persona, empresa o contexto"
    }
  )), /* @__PURE__ */ React.createElement(Field, { className: "financeDashboard__field financeDashboard__field--wide", label: "Notas", wide: true }, /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: formState.notes,
      onChange: (event) => updateFormState({ notes: event.target.value }),
      placeholder: "Detalle opcional"
    }
  ))) : null), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__formActions" }, /* @__PURE__ */ React.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : editingMovement ? "Guardar cambios" : "Agregar movimiento"), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      onClick: () => setShowAdvancedForm((current) => !current),
      disabled: saving
    },
    showAdvancedForm ? "Ocultar avanzado" : "Mostrar avanzado"
  ), editingMovement ? /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      onClick: resetForm,
      disabled: saving
    },
    "Cancelar edicion"
  ) : null)), /* @__PURE__ */ React.createElement("datalist", { id: "finanzas-categories" }, categories.map((category) => /* @__PURE__ */ React.createElement("option", { key: category, value: category }))), /* @__PURE__ */ React.createElement("datalist", { id: "finanzas-platforms" }, platforms.map((platform) => /* @__PURE__ */ React.createElement("option", { key: platform, value: platform })))) : null, workbenchTab === "cash" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStats" }, /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStat" }, /* @__PURE__ */ React.createElement("span", null, "Esperado"), /* @__PURE__ */ React.createElement("strong", null, formatCurrency(cashCountPreview.expectedCents))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStat" }, /* @__PURE__ */ React.createElement("span", null, "Contado"), /* @__PURE__ */ React.createElement("strong", null, formatCurrency(cashCountPreview.totalCountedCents))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashStat" }, /* @__PURE__ */ React.createElement("span", null, "Diferencia"), /* @__PURE__ */ React.createElement(
    "strong",
    {
      className: [
        cashVarianceIsPositive && "financeDashboard__cashVariance--positive",
        cashVarianceIsNegative && "financeDashboard__cashVariance--negative"
      ].filter(Boolean).join(" ")
    },
    formatSignedCurrency(cashCountPreview.varianceCents)
  ))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashGrid" }, cashDenominations.map((denomination) => /* @__PURE__ */ React.createElement(Field, { key: denomination, className: "financeDashboard__cashField", label: `${formatDenominationLabel(denomination)} ARS` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      inputMode: "numeric",
      pattern: "[0-9]*",
      value: cashCountForm[String(denomination)] ?? "",
      onChange: (event) => handleCashCountFieldChange(denomination, event.target.value),
      placeholder: "0"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__formActions" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      tone: "primary",
      onClick: () => void handleSaveCashCount(),
      disabled: savingCashCount
    },
    savingCashCount ? "Guardando arqueo..." : "Registrar arqueo"
  )), /* @__PURE__ */ React.createElement(
    StateBlock,
    {
      className: "financeDashboard__cashHint",
      title: cashAudit?.latestCashCount ? "Ultimo arqueo registrado" : "Todavia no hay arqueos",
      description: cashAudit?.latestCashCount ? formatDateTimeLabel(cashAudit.latestCashCount.countedAt) : "Registra el primero para comparar el efectivo real con lo cargado."
    }
  ), recentCashCounts.length ? /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__cashHistory" }, recentCashCounts.map((cashCount) => /* @__PURE__ */ React.createElement(CashCountHistoryRow, { key: cashCount.id, cashCount }))) : null) : null, workbenchTab === "reports" ? /* @__PURE__ */ React.createElement("div", { className: "financeDashboard__chartsGrid" }, /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--chart", tone: "soft" }, /* @__PURE__ */ React.createElement(PanelHeader, { actions: /* @__PURE__ */ React.createElement(WalletIcon, { size: 18 }) }, /* @__PURE__ */ React.createElement(PanelTitle, { eyebrow: "Grafico", title: "Nivel de dinero en el tiempo" })), /* @__PURE__ */ React.createElement(BalanceTimelineChart, { points: timelineSeries.points })), /* @__PURE__ */ React.createElement(SectionPanel, { className: "financeDashboard__panel financeDashboard__panel--chart", tone: "soft" }, /* @__PURE__ */ React.createElement(PanelHeader, null, /* @__PURE__ */ React.createElement(PanelTitle, { eyebrow: "Flujo", title: "Ingresos y egresos por mes" })), /* @__PURE__ */ React.createElement(MonthlyFlowChart, { rows: monthlyFlow.rows, maxValue: monthlyFlow.maxValue }))) : null))))));
  if (shellMode === "embedded") {
    return /* @__PURE__ */ React.createElement("div", { className: "financeDashboard financeDashboard--embedded" }, pageContent);
  }
  return /* @__PURE__ */ React.createElement(WorkspacePage, { className: "financeDashboard" }, pageContent);
}

// life-tracker/src/training/TrainingView.jsx
init_define_process();

// life-tracker/src/training/training-utils.js
init_define_process();

// life-tracker/src/training/training-muscles.js
init_define_process();
function normalizeComparableText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
var MUSCLE_NOTE_METADATA = Object.freeze({
  "pectoralis-major-clavicular": {
    movementSummary: "Ayuda a llevar el brazo al frente y hacia adentro, sobre todo en empujes con inclinacion.",
    worksWith: ["pectoralis-major-sternal", "deltoid-anterior", "serratus-anterior", "triceps-lateral-medial"]
  },
  "pectoralis-major-sternal": {
    movementSummary: "Empuja el brazo hacia delante y hacia adentro en presses, flexiones y abrazos fuertes.",
    worksWith: ["pectoralis-major-clavicular", "deltoid-anterior", "triceps-lateral-medial", "serratus-anterior"]
  },
  "pectoralis-minor": {
    movementSummary: "Ayuda a mover y estabilizar la escapula cuando empujas o llevas los hombros hacia delante.",
    worksWith: ["serratus-anterior", "pectoralis-major-sternal", "deltoid-anterior", "trapezius-middle-lower"]
  },
  "deltoid-anterior": {
    movementSummary: "Eleva el brazo al frente y ayuda en casi todo empuje por encima o delante del cuerpo.",
    worksWith: ["pectoralis-major-clavicular", "pectoralis-major-sternal", "triceps-lateral-medial", "serratus-anterior"]
  },
  "deltoid-lateral": {
    movementSummary: "Se encarga de separar el brazo del cuerpo hacia el costado.",
    worksWith: ["deltoid-anterior", "deltoid-posterior", "trapezius-middle-lower", "serratus-anterior"]
  },
  "deltoid-posterior": {
    movementSummary: "Lleva el brazo hacia atras y ayuda a abrirlo y estabilizar el hombro.",
    worksWith: ["rhomboids", "trapezius-middle-lower", "latissimus-dorsi", "teres-major"]
  },
  "latissimus-dorsi": {
    movementSummary: "Tira del brazo hacia abajo y hacia el cuerpo en dominadas, remos y gestos de trepa.",
    worksWith: ["teres-major", "rhomboids", "biceps-brachii", "trapezius-middle-lower"]
  },
  "teres-major": {
    movementSummary: "Ayuda a llevar el brazo hacia atras y pegado al torso, muy cerca del trabajo del dorsal.",
    worksWith: ["latissimus-dorsi", "rhomboids", "deltoid-posterior", "biceps-brachii"]
  },
  "rhomboids": {
    movementSummary: "Juntan las escapulas y ayudan a mantener el pecho abierto en remos y otras tracciones.",
    worksWith: ["trapezius-middle-lower", "deltoid-posterior", "latissimus-dorsi", "teres-major"]
  },
  "trapezius-middle-lower": {
    movementSummary: "Baja y acomoda las escapulas para dar una base estable a hombros y espalda.",
    worksWith: ["rhomboids", "serratus-anterior", "deltoid-posterior", "latissimus-dorsi"]
  },
  "trapezius-upper": {
    movementSummary: "Eleva la escapula y ayuda a sostener el hombro cuando cargas o elevas los brazos.",
    worksWith: ["levator-scapulae", "serratus-anterior", "trapezius-middle-lower", "deltoid-lateral"]
  },
  "levator-scapulae": {
    movementSummary: "Eleva la escapula y ayuda a inclinar o girar el cuello en movimientos cortos.",
    worksWith: ["trapezius-upper", "rhomboids", "trapezius-middle-lower", "deltoid-posterior"]
  },
  "biceps-brachii": {
    movementSummary: "Flexiona el codo y ayuda a supinar el antebrazo y a tirar del brazo hacia el cuerpo.",
    worksWith: ["brachialis", "brachioradialis", "latissimus-dorsi", "teres-major"]
  },
  brachialis: {
    movementSummary: "Flexiona el codo con casi cualquier agarre y da mucha base al tiron del brazo.",
    worksWith: ["biceps-brachii", "brachioradialis", "forearm-flexors", "latissimus-dorsi"]
  },
  "triceps-long-head": {
    movementSummary: "Extiende el codo y tambien ayuda cuando llevas el brazo hacia atras.",
    worksWith: ["triceps-lateral-medial", "deltoid-anterior", "pectoralis-major-sternal", "latissimus-dorsi"]
  },
  "triceps-lateral-medial": {
    movementSummary: "Extienden el codo en presses, flexiones y bloqueos del brazo.",
    worksWith: ["triceps-long-head", "pectoralis-major-sternal", "deltoid-anterior", "serratus-anterior"]
  },
  brachioradialis: {
    movementSummary: "Ayuda a flexionar el codo cuando el agarre es neutro o prono.",
    worksWith: ["biceps-brachii", "brachialis", "forearm-flexors", "forearm-extensors"]
  },
  "forearm-flexors": {
    movementSummary: "Cierran la mano y ayudan a sostener agarres, barras y apoyos de manos.",
    worksWith: ["brachioradialis", "forearm-extensors", "biceps-brachii"]
  },
  "forearm-extensors": {
    movementSummary: "Abren y estabilizan la muneca y los dedos cuando agarras o apoyas la mano.",
    worksWith: ["brachioradialis", "forearm-flexors", "deltoid-posterior"]
  },
  "rectus-abdominis": {
    movementSummary: "Flexiona el tronco y ayuda a acercar costillas y pelvis.",
    worksWith: ["transverse-abdominis", "obliques", "hip-flexors"]
  },
  "transverse-abdominis": {
    movementSummary: "Aprieta el abdomen como una faja y estabiliza la cintura antes de mover brazos o piernas.",
    worksWith: ["rectus-abdominis", "obliques", "erector-spinae", "serratus-anterior"]
  },
  obliques: {
    movementSummary: "Giran e inclinan el tronco y ayudan a resistir rotaciones no deseadas.",
    worksWith: ["transverse-abdominis", "rectus-abdominis", "serratus-anterior", "gluteus-medius"]
  },
  "serratus-anterior": {
    movementSummary: "Empuja y rota la escapula hacia delante y arriba para que el hombro se mueva limpio.",
    worksWith: ["trapezius-middle-lower", "trapezius-upper", "pectoralis-minor", "deltoid-anterior"]
  },
  "erector-spinae": {
    movementSummary: "Mantienen la espalda extendida y sostienen el tronco cuando te inclinas o cargas.",
    worksWith: ["transverse-abdominis", "gluteus-maximus", "hamstrings", "rhomboids"]
  },
  "gluteus-maximus": {
    movementSummary: "Extiende la cadera al ponerte de pie, saltar o empujar el cuerpo hacia delante.",
    worksWith: ["hamstrings", "erector-spinae", "quadriceps", "gluteus-medius"]
  },
  "gluteus-medius": {
    movementSummary: "Estabiliza la pelvis y separa la pierna del cuerpo, clave al apoyar una sola pierna.",
    worksWith: ["abductors", "obliques", "gluteus-maximus", "quadriceps"]
  },
  quadriceps: {
    movementSummary: "Extienden la rodilla en sentadillas, pasos, saltos y al ponerse de pie.",
    worksWith: ["vastus-medialis", "gluteus-maximus", "gastrocnemius", "hip-flexors"]
  },
  "vastus-medialis": {
    movementSummary: "Ayuda en la extension final de la rodilla y a que la rodilla siga una linea estable.",
    worksWith: ["quadriceps", "gluteus-medius", "gastrocnemius", "hamstrings"]
  },
  hamstrings: {
    movementSummary: "Llevan la cadera hacia atras y doblan la rodilla en bisagras, puentes y carrera.",
    worksWith: ["gluteus-maximus", "erector-spinae", "gastrocnemius", "quadriceps"]
  },
  gastrocnemius: {
    movementSummary: "Empuja el tobillo hacia abajo al caminar, correr, saltar y ponerte de puntas.",
    worksWith: ["soleus", "hamstrings", "quadriceps"]
  },
  soleus: {
    movementSummary: "Ayuda a empujar el suelo con el tobillo, sobre todo con rodilla flexionada y en aguantes largos.",
    worksWith: ["gastrocnemius", "quadriceps", "hamstrings"]
  },
  adductors: {
    movementSummary: "Acercan la pierna hacia el centro y ayudan a estabilizar pelvis y rodilla.",
    worksWith: ["gluteus-medius", "gluteus-maximus", "quadriceps", "hamstrings"]
  },
  abductors: {
    movementSummary: "Separan la pierna del cuerpo y ayudan a mantener estable la pelvis.",
    worksWith: ["gluteus-medius", "obliques", "quadriceps", "adductors"]
  },
  "hip-flexors": {
    movementSummary: "Llevan la rodilla o el muslo hacia el pecho y ayudan a fijar la pelvis en el core.",
    worksWith: ["rectus-abdominis", "transverse-abdominis", "quadriceps", "adductors"]
  }
});
var REGION_DEFINITIONS = [
  {
    id: "upper",
    title: "Tren superior",
    groups: [
      {
        id: "chest",
        title: "Pecho",
        muscles: [
          {
            id: "pectoralis-major-clavicular",
            title: "Pectoral superior",
            aliases: ["pectoral clavicular", "upper chest", "upper pec"]
          },
          {
            id: "pectoralis-major-sternal",
            title: "Pectoral medio",
            aliases: ["pectoral", "pecho", "middle chest", "chest"]
          },
          {
            id: "pectoralis-minor",
            title: "Pectoral menor",
            aliases: ["lower chest", "inner chest"]
          }
        ]
      },
      {
        id: "shoulders",
        title: "Hombros",
        muscles: [
          {
            id: "deltoid-anterior",
            title: "Deltoides frontal",
            aliases: ["deltoides anterior", "front delt"]
          },
          {
            id: "deltoid-lateral",
            title: "Deltoides lateral",
            aliases: ["deltoides medio", "side delt"]
          },
          {
            id: "deltoid-posterior",
            title: "Deltoides posterior",
            aliases: ["rear delt", "deltoides trasero"]
          }
        ]
      },
      {
        id: "back",
        title: "Espalda",
        muscles: [
          {
            id: "latissimus-dorsi",
            title: "Dorsal ancho",
            aliases: ["lats", "dorsales", "lat"]
          },
          {
            id: "teres-major",
            title: "Redondo mayor",
            aliases: ["teres major"]
          },
          {
            id: "rhomboids",
            title: "Romboides",
            aliases: ["rhomboid", "romboide"]
          },
          {
            id: "trapezius-middle-lower",
            title: "Trapecio medio e inferior",
            aliases: ["lower traps", "mid traps", "trapecio bajo"]
          }
        ]
      },
      {
        id: "traps-neck",
        title: "Trapecios",
        muscles: [
          {
            id: "trapezius-upper",
            title: "Trapecio superior",
            aliases: ["upper traps", "trapecio alto"]
          },
          {
            id: "levator-scapulae",
            title: "Elevador de la escapula",
            aliases: ["neck support", "levator scapulae"]
          }
        ]
      },
      {
        id: "biceps",
        title: "Biceps",
        muscles: [
          {
            id: "biceps-brachii",
            title: "Biceps braquial",
            aliases: ["biceps", "bicep"]
          },
          {
            id: "brachialis",
            title: "Braquial",
            aliases: ["brachialis"]
          }
        ]
      },
      {
        id: "triceps",
        title: "Triceps",
        muscles: [
          {
            id: "triceps-long-head",
            title: "Triceps cabeza larga",
            aliases: ["triceps long head"]
          },
          {
            id: "triceps-lateral-medial",
            title: "Triceps lateral y medial",
            aliases: ["triceps", "triceps lateral", "triceps medial"]
          }
        ]
      },
      {
        id: "forearms",
        title: "Antebrazos",
        muscles: [
          {
            id: "brachioradialis",
            title: "Braquiorradial",
            aliases: ["brachioradialis"]
          },
          {
            id: "forearm-flexors",
            title: "Flexores del antebrazo",
            aliases: ["forearm flexors", "flexores"]
          },
          {
            id: "forearm-extensors",
            title: "Extensores del antebrazo",
            aliases: ["forearm extensors", "extensores"]
          }
        ]
      }
    ]
  },
  {
    id: "core",
    title: "Core",
    groups: [
      {
        id: "abs",
        title: "Abdomen",
        muscles: [
          {
            id: "rectus-abdominis",
            title: "Recto abdominal",
            aliases: ["abs", "abdominales", "six pack"]
          },
          {
            id: "transverse-abdominis",
            title: "Transverso abdominal",
            aliases: ["core profundo", "transverse abs"]
          }
        ]
      },
      {
        id: "obliques",
        title: "Oblicuos",
        muscles: [
          {
            id: "obliques",
            title: "Oblicuos",
            aliases: ["oblique", "serrato lateral"]
          },
          {
            id: "serratus-anterior",
            title: "Serrato anterior",
            aliases: ["serratus", "boxer muscle"]
          }
        ]
      },
      {
        id: "lumbar",
        title: "Zona lumbar",
        muscles: [
          {
            id: "erector-spinae",
            title: "Erectores espinales",
            aliases: ["lumbar", "espalda baja", "lower back"]
          }
        ]
      }
    ]
  },
  {
    id: "lower",
    title: "Tren inferior",
    groups: [
      {
        id: "glutes",
        title: "Gluteos",
        muscles: [
          {
            id: "gluteus-maximus",
            title: "Gluteo mayor",
            aliases: ["glute max", "gluteo"]
          },
          {
            id: "gluteus-medius",
            title: "Gluteo medio",
            aliases: ["glute med", "abductor gluteo"]
          }
        ]
      },
      {
        id: "quads",
        title: "Cuadriceps",
        muscles: [
          {
            id: "quadriceps",
            title: "Cuadriceps",
            aliases: ["quads", "quad"]
          },
          {
            id: "vastus-medialis",
            title: "Vasto medial",
            aliases: ["teardrop quad", "vmo"]
          }
        ]
      },
      {
        id: "hamstrings",
        title: "Isquiotibiales",
        muscles: [
          {
            id: "hamstrings",
            title: "Isquiotibiales",
            aliases: ["hamstrings", "hams", "femorales"]
          }
        ]
      },
      {
        id: "calves",
        title: "Pantorrillas",
        muscles: [
          {
            id: "gastrocnemius",
            title: "Gemelos",
            aliases: ["gastrocnemius", "calves", "pantorrilla"]
          },
          {
            id: "soleus",
            title: "Soleo",
            aliases: ["soleus"]
          }
        ]
      },
      {
        id: "hips",
        title: "Cadera",
        muscles: [
          {
            id: "adductors",
            title: "Aductores",
            aliases: ["adductor", "inner thigh"]
          },
          {
            id: "abductors",
            title: "Abductores",
            aliases: ["abductor", "outer thigh"]
          },
          {
            id: "hip-flexors",
            title: "Flexores de cadera",
            aliases: ["hip flexor", "psoas"]
          }
        ]
      }
    ]
  }
];
var TRAINING_MUSCLE_REGIONS = REGION_DEFINITIONS.map((region) => ({
  id: region.id,
  title: region.title
}));
var TRAINING_MUSCLE_GROUPS = REGION_DEFINITIONS.flatMap(
  (region) => region.groups.map((group) => ({
    id: group.id,
    title: group.title,
    regionId: region.id,
    regionTitle: region.title
  }))
);
var TRAINING_MUSCLE_CATALOG = REGION_DEFINITIONS.flatMap(
  (region) => region.groups.flatMap(
    (group) => group.muscles.map((muscle) => {
      const noteMetadata = MUSCLE_NOTE_METADATA[muscle.id] || null;
      const aliases = Array.isArray(muscle.aliases) ? [...new Set([muscle.title, ...muscle.aliases].map((entry) => String(entry).trim()).filter(Boolean))] : [muscle.title];
      return {
        id: muscle.id,
        title: muscle.title,
        slug: muscle.id,
        aliases,
        regionId: region.id,
        regionTitle: region.title,
        groupId: group.id,
        groupTitle: group.title,
        movementSummary: noteMetadata?.movementSummary || "",
        relatedMuscleIds: Array.isArray(noteMetadata?.worksWith) ? [...noteMetadata.worksWith] : [],
        searchText: normalizeComparableText([muscle.id, muscle.title, region.title, group.title, ...aliases].join(" "))
      };
    })
  )
);
var MUSCLE_BY_ID = new Map(TRAINING_MUSCLE_CATALOG.map((muscle) => [muscle.id, muscle]));
var MUSCLE_BY_ALIAS = /* @__PURE__ */ new Map();
for (const muscle of TRAINING_MUSCLE_CATALOG) {
  for (const alias of muscle.aliases) {
    MUSCLE_BY_ALIAS.set(normalizeComparableText(alias), muscle);
  }
}
function getTrainingMuscleById(muscleId) {
  return MUSCLE_BY_ID.get(String(muscleId || "").trim()) || null;
}

// life-tracker/src/training/training-schedule.js
init_define_process();
function todayLocalDate2(baseDate = /* @__PURE__ */ new Date()) {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function normalizeLocalDate(value, fallbackValue = todayLocalDate2()) {
  const normalized = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackValue;
  }
  return todayLocalDate2(parsed);
}
function normalizeTimeValue(value) {
  const normalized = String(value ?? "").trim();
  return /^\d{2}:\d{2}$/.test(normalized) ? normalized : null;
}
function normalizeWeekdays(value) {
  if (!Array.isArray(value)) {
    return [1, 2, 3, 4, 5];
  }
  const uniqueValues = new Set(
    value.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6)
  );
  return [...uniqueValues].sort((left, right) => left - right);
}

// life-tracker/src/training/training-utils.js
function normalizeText(value) {
  return String(value ?? "").trim();
}
function normalizeComparableText2(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
function toFiniteNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const normalized = String(value).replace(",", ".");
  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) {
    return null;
  }
  return numericValue;
}
function cloneJson(value) {
  if (value == null) {
    return null;
  }
  return JSON.parse(JSON.stringify(value));
}
function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}
function parseJsonObject(value, fallback = {}) {
  if (value == null || value === "") {
    return { ...fallback };
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return { ...fallback };
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return { ...fallback };
}
function normalizeMetricBlock(value, { includeRestSeconds = true } = {}) {
  const source = parseJsonObject(value, {});
  const normalized = {};
  const numberFields = ["sets", "reps", "seconds", "distance", "weight", "rounds"];
  for (const field of numberFields) {
    const numericValue = toFiniteNumber(source[field]);
    if (numericValue != null) {
      normalized[field] = numericValue;
    }
  }
  if (includeRestSeconds) {
    const restSeconds = toFiniteNumber(source.restSeconds);
    if (restSeconds != null) {
      normalized.restSeconds = restSeconds;
    }
  }
  const mode = normalizeOptionalText(source.mode);
  if (mode) {
    normalized.mode = mode;
  }
  const distanceUnit = normalizeOptionalText(source.distanceUnit);
  if (distanceUnit) {
    normalized.distanceUnit = distanceUnit;
  }
  const weightUnit = normalizeOptionalText(source.weightUnit);
  if (weightUnit) {
    normalized.weightUnit = weightUnit;
  }
  const unit = normalizeOptionalText(source.unit);
  if (unit) {
    normalized.unit = unit;
  }
  const tempo = normalizeOptionalText(source.tempo);
  if (tempo) {
    normalized.tempo = tempo;
  }
  const notes = normalizeOptionalText(source.notes);
  if (notes) {
    normalized.notes = notes;
  }
  if (source.extra && typeof source.extra === "object" && !Array.isArray(source.extra)) {
    normalized.extra = cloneJson(source.extra);
  }
  return normalized;
}
function normalizeTrainingMeasurement(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: false });
}
function normalizeTrainingPrescription(value) {
  return normalizeMetricBlock(value, { includeRestSeconds: true });
}
var TRAINING_MEASUREMENT_MODE_LABELS = {
  reps: "Repeticiones",
  time: "Tiempo",
  distance: "Distancia",
  weight: "Peso"
};
var TRAINING_EXERCISE_TYPE_LABELS = Object.freeze({
  exercise: "Ejercicio",
  stretch: "Estiramiento",
  warmup: "Calentamiento",
  coordination: "Coordinaci\xF3n"
});
var TRAINING_MEASUREMENT_CATEGORY_LABELS = Object.freeze({
  strength: "Fuerza",
  cardio: "Cardio",
  balance: "Equilibrio",
  flexibility: "Flexibilidad"
});
var TRAINING_EXERCISE_TAG_LABELS = Object.freeze({
  strength: "Fuerza",
  cardio: "Cardio",
  balance: "Equilibrio",
  flexibility: "Flexibilidad",
  endurance: "Resistencia",
  "motor-control": "Motricidad",
  isometric: "Isom\xE9trico",
  unilateral: "Unilateral",
  explosive: "Explosivo"
});
var TRAINING_EXERCISE_TAG_ORDER = Object.freeze([
  "strength",
  "cardio",
  "balance",
  "flexibility",
  "endurance",
  "motor-control",
  "isometric",
  "unilateral",
  "explosive"
]);
function normalizeTrainingExerciseType(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(TRAINING_EXERCISE_TYPE_LABELS, normalized) ? normalized : "exercise";
}
function normalizeTrainingMeasurementCategory(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(TRAINING_MEASUREMENT_CATEGORY_LABELS, normalized) ? normalized : "strength";
}
function normalizeTrainingExerciseTags(value, options = {}) {
  const source = Array.isArray(value) ? value : [];
  const uniqueTags = /* @__PURE__ */ new Set();
  const measurementCategory = normalizeOptionalText(options.measurementCategory) ? normalizeTrainingMeasurementCategory(options.measurementCategory) : null;
  for (const entry of source) {
    const rawValue = entry && typeof entry === "object" ? entry.id || entry.value || entry.tag : entry;
    const normalizedTag = normalizeOptionalText(rawValue)?.toLowerCase() || null;
    if (!normalizedTag || !Object.prototype.hasOwnProperty.call(TRAINING_EXERCISE_TAG_LABELS, normalizedTag)) {
      continue;
    }
    if (measurementCategory && normalizedTag === measurementCategory) {
      continue;
    }
    uniqueTags.add(normalizedTag);
  }
  return TRAINING_EXERCISE_TAG_ORDER.filter((tagId) => uniqueTags.has(tagId));
}
function resolveTrainingExerciseTags(tags, measurementCategory) {
  const normalizedMeasurementCategory = normalizeOptionalText(measurementCategory) ? normalizeTrainingMeasurementCategory(measurementCategory) : null;
  const explicitTags = normalizeTrainingExerciseTags(tags, {
    measurementCategory: normalizedMeasurementCategory
  });
  const uniqueTags = new Set(explicitTags);
  if (normalizedMeasurementCategory && Object.prototype.hasOwnProperty.call(TRAINING_EXERCISE_TAG_LABELS, normalizedMeasurementCategory)) {
    uniqueTags.add(normalizedMeasurementCategory);
  }
  return TRAINING_EXERCISE_TAG_ORDER.filter((tagId) => uniqueTags.has(tagId));
}
function buildTrainingExerciseTypeSummary(value) {
  const normalized = normalizeTrainingExerciseType(value);
  return TRAINING_EXERCISE_TYPE_LABELS[normalized] || "";
}
function buildTrainingMeasurementCategorySummary(value) {
  const normalized = normalizeTrainingMeasurementCategory(value);
  return TRAINING_MEASUREMENT_CATEGORY_LABELS[normalized] || "";
}
function buildTrainingExerciseTagSummary(tags, options = {}) {
  const normalizedMeasurementCategory = normalizeOptionalText(options.measurementCategory) ? normalizeTrainingMeasurementCategory(options.measurementCategory) : null;
  const normalizedTags = resolveTrainingExerciseTags(tags, normalizedMeasurementCategory).filter((tagId) => options.omitMeasurementCategory && normalizedMeasurementCategory ? tagId !== normalizedMeasurementCategory : true);
  const maxItems = Math.max(0, Number(options.maxItems || 0)) || null;
  const visibleTags = maxItems ? normalizedTags.slice(0, maxItems) : normalizedTags;
  return visibleTags.map((tagId) => TRAINING_EXERCISE_TAG_LABELS[tagId] || tagId).join(", ");
}
function buildTrainingMeasurementUnitSummary(measurement) {
  const data = parseJsonObject(measurement, {});
  const mode = normalizeOptionalText(data.mode);
  return mode ? TRAINING_MEASUREMENT_MODE_LABELS[mode] || mode : "";
}
function buildTrainingMetricSummary(metric) {
  const data = parseJsonObject(metric, {});
  const parts = [];
  const mode = normalizeOptionalText(data.mode);
  if (mode === "time") {
    if (data.seconds != null) {
      parts.push(`${data.seconds}s`);
    }
  } else if (mode === "distance") {
    if (data.distance != null) {
      const distanceUnit = data.distanceUnit || data.unit || "m";
      parts.push(`${data.distance} ${distanceUnit}`.trim());
    }
  } else if (mode === "weight") {
    if (data.weight != null) {
      const weightUnit = data.weightUnit || data.unit || "kg";
      parts.push(`${data.weight} ${weightUnit}`.trim());
    }
  } else if (data.sets != null && data.reps != null) {
    parts.push(`${data.sets}x${data.reps}`);
  } else if (data.reps != null) {
    parts.push(`${data.reps} reps`);
  } else if (data.seconds != null) {
    parts.push(`${data.seconds}s`);
  } else if (data.distance != null) {
    const distanceUnit = data.distanceUnit || data.unit || "m";
    parts.push(`${data.distance} ${distanceUnit}`.trim());
  } else if (data.weight != null) {
    const weightUnit = data.weightUnit || data.unit || "kg";
    parts.push(`${data.weight} ${weightUnit}`.trim());
  } else if (mode === "reps") {
    parts.push("reps");
  } else if (mode) {
    parts.push(mode);
  }
  if (data.restSeconds != null) {
    parts.push(`rest ${data.restSeconds}s`);
  }
  if (data.tempo) {
    parts.push(`tempo ${data.tempo}`);
  }
  if (!parts.length && data.mode) {
    parts.push(data.mode);
  }
  return parts.join(" - ");
}
function buildTrainingMuscleLoadSummary(muscleLoads) {
  const list = Array.isArray(muscleLoads) ? muscleLoads : [];
  return list.slice(0, 4).map((entry) => `${entry.title || getTrainingMuscleById(entry.muscleId)?.title || entry.muscleId} ${entry.percentage}%`).join(", ");
}
function buildTrainingExerciseSummary(exercise) {
  const parts = [];
  const typeId = normalizeTrainingExerciseType(exercise?.exerciseType);
  const typeSummary = buildTrainingExerciseTypeSummary(typeId);
  const categorySummary = buildTrainingMeasurementCategorySummary(exercise?.measurementCategory);
  const measurementSummary = buildTrainingMeasurementUnitSummary(exercise?.measurement);
  const tagSummary = buildTrainingExerciseTagSummary(exercise?.tags, {
    measurementCategory: exercise?.measurementCategory,
    omitMeasurementCategory: true,
    maxItems: 2
  });
  if (typeSummary && typeId !== "exercise") {
    parts.push(typeSummary);
  }
  if (categorySummary) {
    parts.push(categorySummary);
  }
  if (measurementSummary) {
    parts.push(measurementSummary);
  }
  if (tagSummary) {
    parts.push(tagSummary);
  }
  const muscleSummary = buildTrainingMuscleLoadSummary(exercise?.muscleLoads);
  if (muscleSummary) {
    parts.push(muscleSummary);
  }
  return parts.join(" - ");
}
function normalizeRoutineStepKind(value) {
  return normalizeOptionalText(value) === "rest" ? "rest" : "exercise";
}
function normalizeExerciseSnapshot(rawExercise, rawSegment) {
  return {
    id: normalizeOptionalText(rawExercise?.id || rawSegment?.exerciseId || rawSegment?.exercise_id),
    title: normalizeOptionalText(rawExercise?.title || rawSegment?.exerciseTitleSnapshot || rawSegment?.exercise_title_snapshot) || "Ejercicio",
    slug: normalizeOptionalText(rawExercise?.slug),
    measurement: normalizeTrainingMeasurement(
      rawExercise?.measurement || rawSegment?.exerciseMeasurementSnapshot || rawSegment?.exercise_measurement_snapshot
    )
  };
}
function normalizeStructureStep(step, exerciseLookup = /* @__PURE__ */ new Map(), stepIndex = 0) {
  const raw = step && typeof step === "object" ? step : {};
  const stepKind = normalizeRoutineStepKind(raw.stepKind || raw.kind);
  const exerciseId = stepKind === "rest" ? null : normalizeOptionalText(raw.exerciseId || raw.exercise_id);
  const exercise = exerciseId ? exerciseLookup.get(exerciseId) : null;
  return {
    id: normalizeOptionalText(raw.id) || `step-${stepIndex + 1}`,
    type: "step",
    stepKind,
    exerciseId,
    exerciseTitleSnapshot: stepKind === "exercise" ? exercise?.title || normalizeOptionalText(raw.exerciseTitleSnapshot || raw.exercise_title_snapshot) || "Ejercicio" : null,
    exerciseMeasurementSnapshot: stepKind === "exercise" ? normalizeTrainingMeasurement(
      exercise?.measurement || raw.exerciseMeasurementSnapshot || raw.exercise_measurement_snapshot
    ) : {},
    prescription: normalizeTrainingPrescription(raw.prescription || raw.metric || raw.payload || raw.measurement),
    resolvedExercise: stepKind === "exercise" ? normalizeExerciseSnapshot(exercise, raw) : null
  };
}
function normalizeStructureBlock(block, exerciseLookup = /* @__PURE__ */ new Map(), blockIndex = 0) {
  const raw = block && typeof block === "object" ? block : {};
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const repeatCount = Math.max(1, Math.round(Number(raw.repeatCount || raw.rounds || 1)) || 1);
  return {
    id: normalizeOptionalText(raw.id) || `block-${blockIndex + 1}`,
    type: "block",
    title: normalizeOptionalText(raw.title) || `Bloque ${blockIndex + 1}`,
    repeatCount,
    steps: rawSteps.map((step, index) => normalizeStructureStep(step, exerciseLookup, index))
  };
}
function normalizeStructureSegment(segment, exerciseLookup = /* @__PURE__ */ new Map(), index = 0) {
  const raw = segment && typeof segment === "object" ? segment : {};
  const type = normalizeOptionalText(raw.type);
  return type === "block" ? normalizeStructureBlock(raw, exerciseLookup, index) : normalizeStructureStep(raw, exerciseLookup, index);
}
function migrateLegacyTrainingSteps(steps2, exerciseLookup = /* @__PURE__ */ new Map()) {
  const source = Array.isArray(steps2) ? steps2 : [];
  return source.map((step, index) => normalizeStructureStep(step, exerciseLookup, index));
}
function normalizeTrainingStructure(value, exerciseLookup = /* @__PURE__ */ new Map()) {
  const source = Array.isArray(value) ? value : Array.isArray(value?.segments) ? value.segments : [];
  return source.map((segment, index) => normalizeStructureSegment(segment, exerciseLookup, index));
}
function flattenTrainingStructureSteps(structure, options = {}) {
  const segments = Array.isArray(structure) ? structure : [];
  const includeBlocks = Boolean(options.includeBlocks);
  const flattened = [];
  for (const segment of segments) {
    if (!segment) {
      continue;
    }
    if (segment.type === "block") {
      if (includeBlocks) {
        flattened.push({
          id: segment.id,
          type: "block",
          title: segment.title,
          repeatCount: segment.repeatCount
        });
      }
      for (const step of Array.isArray(segment.steps) ? segment.steps : []) {
        flattened.push({
          ...step,
          parentBlockId: segment.id,
          parentBlockTitle: segment.title,
          parentBlockRepeatCount: segment.repeatCount
        });
      }
      continue;
    }
    flattened.push(segment);
  }
  return flattened;
}
function buildTrainingRoutineStepSummary(step, exerciseLookup = {}) {
  if (!step) {
    return "";
  }
  const stepKind = normalizeRoutineStepKind(step.stepKind || step.kind);
  if (stepKind === "rest") {
    const prescription = parseJsonObject(step.prescription, {});
    const restSeconds = toFiniteNumber(prescription.restSeconds);
    const notes = normalizeOptionalText(prescription.notes);
    const parts = [restSeconds != null ? `Rest ${restSeconds}s` : "Rest"];
    if (notes) {
      parts.push(notes);
    }
    return parts.join(" - ");
  }
  const exerciseId = normalizeOptionalText(step.exerciseId || step.exercise_id);
  const exercise = exerciseId ? exerciseLookup[exerciseId] : null;
  const title = normalizeOptionalText(
    step.exerciseTitleSnapshot || step.exercise_title_snapshot || step.title || exercise?.title || step.resolvedExercise?.title || "Ejercicio"
  );
  const metricSummary = buildTrainingMetricSummary(step.prescription || step.metric);
  return [title, metricSummary].filter(Boolean).join(" - ");
}
function buildTrainingRoutineSummary(routine, exerciseLookup = {}) {
  const structure = Array.isArray(routine?.structure) ? routine.structure : Array.isArray(routine?.steps) ? migrateLegacyTrainingSteps(routine.steps) : [];
  const flattenedSteps = flattenTrainingStructureSteps(structure).filter((entry) => entry.type === "step");
  const exerciseSteps = flattenedSteps.filter((step) => normalizeRoutineStepKind(step.stepKind || step.kind) !== "rest");
  const blockCount = structure.filter((segment) => segment?.type === "block").length;
  const preview = flattenedSteps.slice(0, 2).map((step) => buildTrainingRoutineStepSummary(step, exerciseLookup)).filter(Boolean).join(" - ");
  const parts = [`${flattenedSteps.length} pasos`, `${exerciseSteps.length} ejercicios`];
  if (blockCount) {
    parts.push(`${blockCount} bloques`);
  }
  if (preview) {
    parts.push(preview);
  }
  return parts.join(" - ");
}
function buildTrainingStructureSummary(structure, exerciseLookup = {}) {
  return buildTrainingRoutineSummary({ structure }, exerciseLookup);
}
function normalizeTrainingCompletionMode(value, fallback = "yes-no") {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "detailed" ? "detailed" : fallback;
}
function normalizeTrainingAssignmentInput(payload = {}, options = {}) {
  const existingAssignment = options.existingAssignment || null;
  const routineId = normalizeOptionalText(payload?.routineId ?? existingAssignment?.routineId);
  const startDate = normalizeLocalDate(payload?.startDate ?? existingAssignment?.startDate);
  const endDateValue = normalizeOptionalText(payload?.endDate ?? existingAssignment?.endDate);
  const scheduleType = String(payload?.scheduleType ?? existingAssignment?.scheduleType ?? "daily").trim().toLowerCase();
  const normalizedScheduleType = scheduleType === "weekdays" ? "weekdays" : "daily";
  const scheduleConfigJson = normalizedScheduleType === "weekdays" ? { weekdays: normalizeWeekdays(payload?.scheduleConfigJson?.weekdays ?? existingAssignment?.scheduleConfigJson?.weekdays) } : {};
  const priority = Math.min(100, Math.max(1, Math.round(Number(payload?.priority ?? existingAssignment?.priority ?? 1)) || 1));
  if (!routineId) {
    throw new Error("Selecciona una rutina.");
  }
  return {
    routineId,
    scheduleType: normalizedScheduleType,
    scheduleConfigJson,
    startDate,
    endDate: endDateValue ? normalizeLocalDate(endDateValue, startDate) : null,
    time: normalizeTimeValue(payload?.time ?? existingAssignment?.time),
    priority,
    status: normalizeOptionalText(payload?.status ?? existingAssignment?.status) === "archived" ? "archived" : "active",
    completionMode: normalizeTrainingCompletionMode(payload?.completionMode ?? existingAssignment?.completionMode)
  };
}
function isComparableTextMatch(value, query) {
  const normalizedValue = normalizeComparableText2(value);
  const normalizedQuery = normalizeComparableText2(query);
  if (!normalizedQuery) {
    return true;
  }
  return normalizedValue.includes(normalizedQuery);
}

// life-tracker/src/training/icons.jsx
init_define_process();
var React3 = window.React;
function BaseIcon2({ children, size = 18, strokeWidth = 1.8 }) {
  return /* @__PURE__ */ React3.createElement(
    "svg",
    {
      "aria-hidden": "true",
      viewBox: "0 0 24 24",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    children
  );
}
function PlusIcon(props) {
  return /* @__PURE__ */ React3.createElement(BaseIcon2, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M12 5.5v13" }), /* @__PURE__ */ React3.createElement("path", { d: "M5.5 12h13" }));
}
function DeleteIcon(props) {
  return /* @__PURE__ */ React3.createElement(BaseIcon2, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M5.5 7.5h13" }), /* @__PURE__ */ React3.createElement("path", { d: "M9 7.5V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V7.5" }), /* @__PURE__ */ React3.createElement("path", { d: "M8 10.25v6.25" }), /* @__PURE__ */ React3.createElement("path", { d: "M12 10.25v6.25" }), /* @__PURE__ */ React3.createElement("path", { d: "M16 10.25v6.25" }), /* @__PURE__ */ React3.createElement("path", { d: "M7 7.5l.75 10A1.5 1.5 0 0 0 9.25 19h5.5a1.5 1.5 0 0 0 1.5-1.5l.75-10" }));
}
function RefreshIcon2(props) {
  return /* @__PURE__ */ React3.createElement(BaseIcon2, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "M20 6v5h-5" }), /* @__PURE__ */ React3.createElement("path", { d: "M4 18v-5h5" }), /* @__PURE__ */ React3.createElement("path", { d: "M18 11a7 7 0 0 0-12-3" }), /* @__PURE__ */ React3.createElement("path", { d: "M6 13a7 7 0 0 0 12 3" }));
}
function ImageIcon(props) {
  return /* @__PURE__ */ React3.createElement(BaseIcon2, { ...props }, /* @__PURE__ */ React3.createElement("rect", { x: "4", y: "5", width: "16", height: "14", rx: "1.5" }), /* @__PURE__ */ React3.createElement("circle", { cx: "9", cy: "10", r: "1.5" }), /* @__PURE__ */ React3.createElement("path", { d: "m6.5 17 4.25-4.25 2.5 2.5 1.75-1.75 2.5 3.5" }));
}
function ArrowUpIcon(props) {
  return /* @__PURE__ */ React3.createElement(BaseIcon2, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "m8 12 4-4 4 4" }), /* @__PURE__ */ React3.createElement("path", { d: "M12 8v8" }));
}
function ArrowDownIcon(props) {
  return /* @__PURE__ */ React3.createElement(BaseIcon2, { ...props }, /* @__PURE__ */ React3.createElement("path", { d: "m8 12 4 4 4-4" }), /* @__PURE__ */ React3.createElement("path", { d: "M12 8v8" }));
}

// life-tracker/src/training/training-cover.js
init_define_process();
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([
  "avif",
  "bmp",
  "gif",
  "ico",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp"
]);
var TRAINING_COVER_PROPERTY_REF = Object.freeze({
  namespace: "note",
  key: "cover",
  valueType: "link",
  valueShape: "scalar"
});
function responseErrorMessage(response, fallback) {
  if (typeof response?.error === "string" && response.error.trim()) {
    return response.error;
  }
  if (typeof response?.error?.message === "string" && response.error.message.trim()) {
    return response.error.message;
  }
  return fallback;
}
function normalizeExtension(value) {
  return String(value || "").replace(/^\./, "").trim().toLowerCase();
}
function isImageItem(item) {
  const extension = normalizeExtension(item?.extension || String(item?.path || "").split(".").at(-1));
  return IMAGE_EXTENSIONS.has(extension);
}
function getTrainingCoverValue(doc) {
  const value = doc?.frontmatter?.cover;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
function hasTrainingCoverProperty(doc) {
  if (!Object.prototype.hasOwnProperty.call(doc?.frontmatter || {}, "cover")) return false;
  const value = doc.frontmatter.cover;
  return value != null && (typeof value !== "string" || Boolean(value.trim()));
}
function buildTrainingCoverLink(relativePath) {
  const normalizedPath = String(relativePath || "").trim().replace(/\\/g, "/");
  return normalizedPath ? `[[${normalizedPath}]]` : "";
}
function cleanTrainingCoverTarget(value) {
  let target = String(value || "").trim();
  const markdownMatch = target.match(/^\[[^\]]*\]\((.+)\)$/);
  if (markdownMatch) target = markdownMatch[1].trim();
  if (target.startsWith("[[") && target.endsWith("]]")) target = target.slice(2, -2);
  if (target.includes("|")) target = target.split("|", 1)[0];
  if (target.includes("#")) target = target.split("#", 1)[0];
  if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
  return target.trim().replace(/\\/g, "/");
}
function isTrainingTextEntryElement(target) {
  const element = typeof Element !== "undefined" && target instanceof Element ? target : null;
  if (!element) return false;
  return Boolean(
    element.closest("input, textarea, select, [contenteditable='true'], [role='textbox']")
  );
}
async function itemToImageUrl(item, ipcRenderer5, pathToFileUrl2) {
  if (!item || !isImageItem(item)) return "";
  const filePath = item.path || (await ipcRenderer5.invoke("items:resolve-location", { itemId: item.id }))?.path;
  return filePath ? pathToFileUrl2(filePath) : "";
}
async function resolveTrainingCoverImageUrl(doc, { ipcRenderer: ipcRenderer5, pathToFileUrl: pathToFileUrl2 }) {
  const rawCover = getTrainingCoverValue(doc);
  const target = cleanTrainingCoverTarget(rawCover);
  if (!target) return "";
  if (/^https?:\/\//i.test(target)) return target;
  const sourceFolder = String(doc?.relativePath || "").replace(/\\/g, "/").split("/").slice(0, -1).join("/");
  const candidates = [target, sourceFolder ? `${sourceFolder}/${target}` : target];
  for (const relativePath of [...new Set(candidates)]) {
    const item = await ipcRenderer5.invoke("items:get-by-relative-path", { relativePath });
    const url = await itemToImageUrl(item, ipcRenderer5, pathToFileUrl2);
    if (url) return url;
  }
  return "";
}
async function pasteTrainingCover({
  doc,
  muscleId,
  ipcRenderer: ipcRenderer5,
  captureImage
}) {
  if (!doc?.itemId) {
    throw new Error("Este musculo todavia no tiene una nota Markdown asociada.");
  }
  const capture = await captureImage("life-tracker-muscle-cover");
  if (!capture?.grantId) {
    throw new Error("El portapapeles no contiene una imagen.");
  }
  const importedResponse = await ipcRenderer5.invoke("markdown:media:import", {
    sourceKind: "clipboard",
    sourceGrant: capture.grantId,
    preferredName: `${String(muscleId || "muscle").trim() || "muscle"}-cover`
  });
  if (!importedResponse?.ok) {
    throw new Error(responseErrorMessage(importedResponse, "No se pudo importar la imagen al vault."));
  }
  if (importedResponse.mediaKind !== "image" || !importedResponse.relativePath) {
    throw new Error("El recurso importado no es una imagen valida.");
  }
  const sourceResponse = await ipcRenderer5.invoke("items:source-load", { itemId: doc.itemId });
  if (!sourceResponse?.ok || !sourceResponse.data?.sourceHash) {
    throw new Error(responseErrorMessage(sourceResponse, "No se pudo preparar la nota para editarla."));
  }
  const coverLink = buildTrainingCoverLink(importedResponse.relativePath);
  const editResponse = await ipcRenderer5.invoke("views:item-edit", {
    itemId: doc.itemId,
    expectedHash: sourceResponse.data.sourceHash,
    property: TRAINING_COVER_PROPERTY_REF,
    operation: {
      kind: "set",
      value: coverLink,
      replaceIncompatible: hasTrainingCoverProperty(doc)
    },
    writerId: "life-tracker:training:muscle-cover"
  });
  if (!editResponse?.ok) {
    throw new Error(responseErrorMessage(editResponse, "La nota cambio antes de guardar la portada."));
  }
  return {
    coverLink,
    itemId: doc.itemId,
    relativePath: importedResponse.relativePath,
    sourceHash: editResponse.data?.sourceHash || sourceResponse.data.sourceHash
  };
}

// life-tracker/src/training/TrainingView.jsx
var MarkdownLiveEditor;
var MarkdownReadSurface;
function configureTrainingHostUi(ui) {
  MarkdownLiveEditor = ui.markdown.EmbeddedMarkdownLiveEditor;
  MarkdownReadSurface = ui.markdown.EmbeddedMarkdownReadSurface;
}
var LIFE_TRACKER_TRAINING_CHANNEL_PREFIX = "life-tracker:training";
var ipcRenderer2 = pluginIpc;
var { pathToFileUrl } = window.nexus.urls;
var React4 = window.React;
var { useEffect: useEffect4, useMemo: useMemo2, useRef: useRef4, useState: useState5 } = React4;
var TRAINING_METRIC_MODE_OPTIONS = [
  { value: "reps", label: "Repeticiones" },
  { value: "time", label: "Tiempo" },
  { value: "distance", label: "Distancia" },
  { value: "weight", label: "Peso" }
];
var TRAINING_EXERCISE_TYPE_OPTIONS = Object.entries(TRAINING_EXERCISE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));
var TRAINING_MEASUREMENT_CATEGORY_OPTIONS = Object.entries(TRAINING_MEASUREMENT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label
}));
var TRAINING_EXERCISE_TAG_OPTIONS = TRAINING_EXERCISE_TAG_ORDER.map((value) => ({
  value,
  label: TRAINING_EXERCISE_TAG_LABELS[value]
}));
var ASSIGNMENT_STATUS_OPTIONS = [
  { value: "active", label: "Activa" },
  { value: "archived", label: "Archivada" }
];
var COMPLETION_MODE_OPTIONS = [
  { value: "yes-no", label: "Si/No" },
  { value: "detailed", label: "Detallada" }
];
var SCHEDULE_TYPE_OPTIONS = [
  { value: "daily", label: "Diaria" },
  { value: "weekdays", label: "Dias fijos" }
];
var WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" }
];
function createId(prefix = "training") {
  return window.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function normalizeMetricDraftForMode(metricDraft, context = "exercise") {
  const normalized = {
    mode: metricDraft?.mode || "reps",
    reps: metricDraft?.reps ?? "",
    seconds: metricDraft?.seconds ?? "",
    distance: metricDraft?.distance ?? "",
    distanceUnit: metricDraft?.distanceUnit || "m",
    weight: metricDraft?.weight ?? "",
    weightUnit: metricDraft?.weightUnit || "kg",
    tempo: metricDraft?.tempo || "",
    notes: metricDraft?.notes || "",
    restSeconds: metricDraft?.restSeconds ?? ""
  };
  if (context === "rest") {
    return {
      ...normalized,
      mode: "time",
      reps: "",
      seconds: "",
      distance: "",
      distanceUnit: "m",
      weight: "",
      weightUnit: "kg",
      tempo: ""
    };
  }
  if (normalized.mode === "reps") {
    normalized.seconds = "";
    normalized.distance = "";
    normalized.distanceUnit = "m";
  } else if (normalized.mode === "time") {
    normalized.reps = "";
    normalized.distance = "";
    normalized.distanceUnit = "m";
    normalized.weight = "";
  } else if (normalized.mode === "distance") {
    normalized.reps = "";
    normalized.seconds = "";
    normalized.weight = "";
  } else if (normalized.mode === "weight") {
    normalized.reps = "";
    normalized.seconds = "";
    normalized.distance = "";
    normalized.distanceUnit = "m";
  }
  return normalized;
}
function createExerciseMeasurementDraft(measurement = {}) {
  const normalized = normalizeTrainingMeasurement(measurement);
  return {
    mode: normalized.mode || "reps"
  };
}
function createPrescriptionDraft(metric = {}, context = "exercise") {
  const normalized = normalizeTrainingPrescription(metric);
  return normalizeMetricDraftForMode({
    mode: normalized.mode || "reps",
    reps: normalized.reps == null ? "" : String(normalized.reps),
    seconds: normalized.seconds == null ? "" : String(normalized.seconds),
    distance: normalized.distance == null ? "" : String(normalized.distance),
    distanceUnit: normalized.distanceUnit || normalized.unit || "m",
    weight: normalized.weight == null ? "" : String(normalized.weight),
    weightUnit: normalized.weightUnit || normalized.unit || "kg",
    tempo: normalized.tempo || "",
    notes: normalized.notes || "",
    restSeconds: normalized.restSeconds == null ? "" : String(normalized.restSeconds)
  }, context);
}
function draftMetricToPayload(metricDraft, context = "exercise") {
  if (context === "measurement") {
    return normalizeTrainingMeasurement({
      mode: metricDraft?.mode || "reps"
    });
  }
  if (context === "rest") {
    return normalizeTrainingPrescription({
      restSeconds: metricDraft?.restSeconds,
      notes: metricDraft?.notes
    });
  }
  return normalizeTrainingPrescription({
    mode: metricDraft?.mode,
    reps: metricDraft?.reps,
    seconds: metricDraft?.seconds,
    distance: metricDraft?.distance,
    distanceUnit: metricDraft?.distanceUnit,
    weight: metricDraft?.weight,
    weightUnit: metricDraft?.weightUnit,
    tempo: metricDraft?.tempo,
    notes: metricDraft?.notes
  });
}
function createExerciseDraft() {
  return {
    id: null,
    title: "",
    exerciseType: "exercise",
    measurementCategory: "strength",
    tags: [],
    measurement: createExerciseMeasurementDraft(),
    muscleLoads: [],
    legacyWarnings: [],
    templateKey: null,
    personalDifficultyScore: ""
  };
}
function sumDraftMusclePercentages(muscleLoads = []) {
  return muscleLoads.reduce((sum, entry) => sum + Math.max(0, Number(entry?.percentage || 0)), 0);
}
function createStructureStepDraft(kind = "exercise") {
  return {
    id: createId("step"),
    type: "step",
    stepKind: kind === "rest" ? "rest" : "exercise",
    exerciseId: "",
    metric: createPrescriptionDraft({}, kind === "rest" ? "rest" : "exercise")
  };
}
function createStructureBlockDraft() {
  return {
    id: createId("block"),
    type: "block",
    title: "",
    repeatCount: "2",
    steps: [
      createStructureStepDraft("exercise")
    ]
  };
}
function createRoutineDraft() {
  return {
    id: null,
    title: "",
    summary: "",
    structure: []
  };
}
function createAssignmentDraft(source = null) {
  return {
    id: source?.id || null,
    routineId: source?.routineId || source?.routine?.id || "",
    scheduleType: source?.scheduleType || "daily",
    weekdays: Array.isArray(source?.scheduleConfigJson?.weekdays) ? source.scheduleConfigJson.weekdays : [1, 2, 3, 4, 5],
    startDate: source?.startDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    endDate: source?.endDate || "",
    time: source?.time || "",
    priority: String(source?.priority || 1),
    status: source?.status || "active",
    completionMode: normalizeTrainingCompletionMode(source?.completionMode, "yes-no")
  };
}
function exerciseRecordToDraft(exercise) {
  if (!exercise) {
    return createExerciseDraft();
  }
  return {
    id: exercise.id,
    title: exercise.title || "",
    exerciseType: exercise.exerciseType || "exercise",
    measurementCategory: exercise.measurementCategory || "strength",
    tags: Array.isArray(exercise.tags) ? [...exercise.tags] : [],
    measurement: createExerciseMeasurementDraft(exercise.measurement),
    muscleLoads: Array.isArray(exercise.muscleLoads) ? exercise.muscleLoads.map((entry) => ({
      muscleId: entry.muscleId,
      title: entry.title,
      regionId: entry.regionId,
      regionTitle: entry.regionTitle,
      groupId: entry.groupId,
      groupTitle: entry.groupTitle,
      percentage: Number(entry.percentage || 0)
    })) : [],
    legacyWarnings: Array.isArray(exercise.legacyWarnings) ? exercise.legacyWarnings : [],
    templateKey: exercise.templateKey || null,
    personalDifficultyScore: exercise.personalDifficultyScore == null ? "" : String(exercise.personalDifficultyScore)
  };
}
function getExerciseEffectiveTags(exercise) {
  return resolveTrainingExerciseTags(exercise?.tags || [], exercise?.measurementCategory);
}
function buildExerciseTypeAndDifficultyMeta(exercise) {
  const parts = [];
  if (exercise?.exerciseType && exercise.exerciseType !== "exercise") {
    parts.push(buildTrainingExerciseTypeSummary(exercise.exerciseType));
  }
  if (exercise?.personalDifficultyScore != null) {
    parts.push(`Dificultad ${exercise.personalDifficultyScore}`);
  }
  return parts.join(" \xB7 ");
}
function buildExerciseTaxonomyMetaItems(exercise) {
  return [
    { label: "Tipo", value: buildTrainingExerciseTypeSummary(exercise?.exerciseType) || "Ejercicio" },
    { label: "Perfil", value: buildTrainingMeasurementCategorySummary(exercise?.measurementCategory) || "Fuerza" },
    {
      label: "Tags",
      value: buildTrainingExerciseTagSummary(exercise?.tags || [], {
        measurementCategory: exercise?.measurementCategory
      }) || "Sin tags"
    }
  ];
}
function buildMuscleMaxLoadLookup(exercises = []) {
  const nextLookup = /* @__PURE__ */ new Map();
  for (const exercise of Array.isArray(exercises) ? exercises : []) {
    for (const entry of Array.isArray(exercise?.muscleLoads) ? exercise.muscleLoads : []) {
      const muscleId = normalizeOptionalText(entry?.muscleId);
      const percentage = Math.max(0, Number(entry?.percentage || 0));
      if (!muscleId) {
        continue;
      }
      const currentMax = nextLookup.get(muscleId) || 0;
      if (percentage > currentMax) {
        nextLookup.set(muscleId, percentage);
      }
    }
  }
  return nextLookup;
}
function buildMuscleMaxLoadSummary(muscleId, maxLoadLookup) {
  const maxLoad = Math.max(0, Number(maxLoadLookup?.get?.(muscleId) || 0));
  if (maxLoad <= 0) {
    return "Foco max. sin registro";
  }
  return `Foco max. ${maxLoad}%`;
}
function structureSegmentToDraft(segment) {
  if (segment?.type === "block") {
    return {
      id: segment.id || createId("block"),
      type: "block",
      title: segment.title || "",
      repeatCount: String(segment.repeatCount || 2),
      steps: Array.isArray(segment.steps) ? segment.steps.map((step) => structureSegmentToDraft(step)) : []
    };
  }
  return {
    id: segment?.id || createId("step"),
    type: "step",
    stepKind: segment?.stepKind || segment?.kind || "exercise",
    exerciseId: segment?.exerciseId || "",
    metric: createPrescriptionDraft(segment?.prescription || {}, (segment?.stepKind || segment?.kind) === "rest" ? "rest" : "exercise")
  };
}
function routineRecordToDraft(routine) {
  if (!routine) {
    return createRoutineDraft();
  }
  return {
    id: routine.id,
    title: routine.title || "",
    summary: routine.summary || "",
    structure: Array.isArray(routine.structure) ? routine.structure.map((segment) => structureSegmentToDraft(segment)) : []
  };
}
function invoke(channel, payload) {
  return ipcRenderer2.invoke(channel, payload).then((response) => {
    if (!response?.ok) {
      throw new Error(response?.error || "No se pudo ejecutar la operacion.");
    }
    return response.data;
  });
}
async function readTrainingMarkdownFile(filePath) {
  if (!filePath) {
    return "";
  }
  try {
    return await window.nexus.files.readText(filePath);
  } catch (error) {
    console.error("[training] No se pudo leer la nota asociada:", error);
    return "";
  }
}
function quoteYamlScalar(value) {
  return JSON.stringify(String(value || ""));
}
function buildTrainingMarkdownFrontmatter({
  title,
  summary,
  kind
}) {
  return [
    "---",
    "nexus:",
    "  defaultView: read",
    "  card:",
    `    title: ${quoteYamlScalar(title)}`,
    `    summary: ${quoteYamlScalar(summary || "")}`,
    "fitness:",
    "  domain: training",
    `  kind: ${kind}`,
    "---",
    ""
  ].join("\n");
}
function buildExerciseMarkdownTemplate({
  title = "Nuevo ejercicio",
  summary = ""
} = {}) {
  const resolvedTitle = normalizeOptionalText(title) || "Nuevo ejercicio";
  const resolvedSummary = normalizeOptionalText(summary) || "Describe el patron general, la tecnica y cualquier referencia util para ejecutar este ejercicio.";
  return [
    buildTrainingMarkdownFrontmatter({
      title: resolvedTitle,
      summary: normalizeOptionalText(summary) || "",
      kind: "exercise"
    }),
    `# ${resolvedTitle}`,
    "",
    resolvedSummary,
    "",
    "## Tecnica",
    "",
    "## Videos / embeds",
    "",
    "## Relacionados",
    "",
    "## Notas",
    ""
  ].join("\n");
}
function buildMuscleMarkdownTemplate(muscle) {
  const title = normalizeOptionalText(muscle?.title) || "Musculo";
  const summary = [muscle?.groupTitle, muscle?.regionTitle].filter(Boolean).join(" - ");
  return [
    buildTrainingMarkdownFrontmatter({
      title,
      summary,
      kind: "muscle"
    }),
    `# ${title}`,
    "",
    summary || "Describe la funcion principal de este musculo y como se siente cuando trabaja.",
    "",
    "## Funcion",
    "",
    "## Tecnica / ubicacion",
    "",
    "## Videos / embeds",
    "",
    "## Relacionados",
    "",
    "## Notas",
    ""
  ].join("\n");
}
async function readTrainingDocMarkdown(doc, fallbackContent = "") {
  const source = await readTrainingMarkdownFile(doc?.itemPath);
  return source || fallbackContent;
}
function formatTrainingCount(count, singular, plural = `${singular}s`) {
  const safeCount = Math.max(0, Number(count) || 0);
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
}
async function resolveTrainingDocItem(ctx, doc) {
  if (!doc?.itemId) {
    return null;
  }
  const itemsState = ctx?.getItems?.();
  const ensured = await itemsState?.ensureItemLoaded?.(doc.itemId);
  if (ensured?.item?.id) {
    return ensured.item;
  }
  if (!doc.relativePath) {
    return null;
  }
  const resolved = await ipcRenderer2.invoke("items:get-by-relative-path", {
    relativePath: doc.relativePath
  });
  if (resolved?.id) {
    itemsState?.materializeItems?.([resolved]);
    return resolved;
  }
  return null;
}
async function openTrainingDoc(ctx, doc) {
  if (!ctx?.actions?.openFile) {
    throw new Error("El runtime del plugin no expuso la accion para abrir notas.");
  }
  const item = await resolveTrainingDocItem(ctx, doc);
  if (!item?.id) {
    throw new Error("No se pudo abrir la nota asociada.");
  }
  await ctx.actions.openFile({
    item,
    sourceId: "life-tracker.training.doc",
    reuse: false
  });
}
function buildExerciseEditorDescription(exercise) {
  return exercise?.searchSummary || "Define el nombre corto, la unidad base y que musculos trabaja.";
}
function buildRoutineEditorDescription(routine) {
  return routine?.searchSummary || routine?.summary || "Combina pasos y bloques sin salir de una sola rutina.";
}
function findExerciseById(exercises, exerciseId) {
  return exercises.find((exercise) => exercise.id === exerciseId) || null;
}
function findRoutineById(routines, routineId) {
  return routines.find((routine) => routine.id === routineId) || null;
}
function TrainingDocumentCard({
  title = "Nota",
  description = "",
  markdown = "",
  mode = "preview",
  editorKey = "",
  onChange = null,
  headerActions = null
}) {
  return /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card trainingPlugin__documentCard" }, /* @__PURE__ */ React4.createElement(PanelHeader, { actions: headerActions }, /* @__PURE__ */ React4.createElement(PanelTitle, { title, description })), /* @__PURE__ */ React4.createElement("div", { className: ["trainingPlugin__documentPreview", mode === "edit" ? "is-edit" : "is-preview"].join(" ") }, mode === "edit" ? /* @__PURE__ */ React4.createElement(
    MarkdownLiveEditor,
    {
      key: editorKey,
      filePath: "",
      value: markdown,
      onChange: (nextMarkdown) => onChange?.(nextMarkdown),
      persistToDisk: false
    }
  ) : /* @__PURE__ */ React4.createElement(MarkdownReadSurface, { value: markdown, compact: true })));
}
var TRAINING_SECTION_OPTIONS = [
  { value: "exercises", label: "Ejercicios", countKey: "exercises" },
  { value: "muscles", label: "Musculos", countKey: "muscles" },
  { value: "routines", label: "Rutinas", countKey: "routines" },
  { value: "assignments", label: "Programadas", countKey: "assignments" }
];
function TrainingSectionRail({
  mode,
  catalog,
  onChange,
  onRefresh,
  showRefresh = true
}) {
  return /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__railPanel", padding: "tight" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__railList" }, TRAINING_SECTION_OPTIONS.map((option) => {
    const count = Array.isArray(catalog?.[option.countKey]) ? catalog[option.countKey].length : 0;
    return /* @__PURE__ */ React4.createElement(
      "button",
      {
        key: option.value,
        type: "button",
        className: ["trainingPlugin__railButton", mode === option.value ? "is-active" : ""].filter(Boolean).join(" "),
        onClick: () => onChange(option.value)
      },
      /* @__PURE__ */ React4.createElement("strong", null, option.label),
      /* @__PURE__ */ React4.createElement("span", null, count)
    );
  })), showRefresh ? /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__railFooter" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: () => void onRefresh?.() }, /* @__PURE__ */ React4.createElement(RefreshIcon2, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Refrescar"))) : null);
}
function TrainingGalleryHeader({
  eyebrow = "",
  title,
  countLabel,
  searchValue = "",
  searchPlaceholder = "Buscar",
  onSearchChange,
  actions = null,
  filters = null
}) {
  return /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__galleryHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(PanelHeader, { actions }, /* @__PURE__ */ React4.createElement(PanelTitle, { eyebrow, title, description: countLabel })), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__galleryToolbar" }, typeof onSearchChange === "function" ? /* @__PURE__ */ React4.createElement(InlineField, { className: "trainingPlugin__gallerySearch", label: "Buscar", grow: true }, /* @__PURE__ */ React4.createElement(
    SearchField,
    {
      value: searchValue,
      onChange: (event) => onSearchChange(event.target.value),
      placeholder: searchPlaceholder,
      "aria-label": searchPlaceholder
    }
  )) : null, filters));
}
function TrainingGalleryCard({
  title,
  summary,
  meta = "",
  active = false,
  media = null,
  editMode = false,
  busy = false,
  onClick
}) {
  return /* @__PURE__ */ React4.createElement(
    GalleryCard,
    {
      as: "button",
      type: "button",
      className: ["trainingPlugin__galleryCard", active ? "is-active" : ""].filter(Boolean).join(" "),
      selected: active,
      "aria-pressed": editMode ? active : void 0,
      "aria-busy": busy || void 0,
      onClick
    },
    media,
    /* @__PURE__ */ React4.createElement(GalleryCardBody, null, /* @__PURE__ */ React4.createElement(GalleryCardTitle, null, title), summary ? /* @__PURE__ */ React4.createElement(GalleryCardMeta, { className: "trainingPlugin__galleryCardSummary" }, summary) : null, meta ? /* @__PURE__ */ React4.createElement(GalleryCardMeta, { className: "trainingPlugin__galleryCardMeta" }, meta) : null)
  );
}
function TrainingCoverMedia({ doc, title, editMode = false, selected = false, busy = false }) {
  const coverValue = getTrainingCoverValue(doc);
  const hasCoverProperty = hasTrainingCoverProperty(doc);
  const requestKey = `${doc?.itemId || "missing"}:${coverValue}`;
  const [media, setMedia] = useState5({ key: "", source: "", failed: false });
  useEffect4(() => {
    let cancelled = false;
    if (!coverValue) {
      setMedia({ key: requestKey, source: "", failed: false });
      return () => {
        cancelled = true;
      };
    }
    void resolveTrainingCoverImageUrl(doc, { ipcRenderer: ipcRenderer2, pathToFileUrl }).then((source) => {
      if (!cancelled) setMedia({ key: requestKey, source, failed: false });
    }).catch(() => {
      if (!cancelled) setMedia({ key: requestKey, source: "", failed: true });
    });
    return () => {
      cancelled = true;
    };
  }, [coverValue, doc, requestKey]);
  const hasImage = media.key === requestKey && media.source && !media.failed;
  const editLabel = busy ? "Guardando portada..." : hasCoverProperty ? "Ctrl+V para reemplazar" : "Ctrl+V para anadir";
  return /* @__PURE__ */ React4.createElement(GalleryCardMedia, { className: "trainingPlugin__galleryCardMedia" }, hasImage ? /* @__PURE__ */ React4.createElement(
    "img",
    {
      alt: `Portada de ${title}`,
      draggable: "false",
      src: media.source,
      onError: () => setMedia((current) => ({ ...current, failed: true }))
    }
  ) : /* @__PURE__ */ React4.createElement("span", { className: "trainingPlugin__galleryCardMediaPlaceholder", "aria-hidden": "true" }, /* @__PURE__ */ React4.createElement(ImageIcon, { size: 24 })), editMode && selected ? /* @__PURE__ */ React4.createElement("span", { className: "trainingPlugin__galleryCardMediaEdit" }, editLabel) : null);
}
function TrainingMetaPanel({
  title,
  items = [],
  className = ""
}) {
  const visibleItems = items.filter((entry) => normalizeOptionalText(entry?.value));
  return /* @__PURE__ */ React4.createElement(SectionPanel, { className: ["trainingPlugin__card", "trainingPlugin__metaPanel", className].filter(Boolean).join(" ") }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title })), visibleItems.length ? /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__metaList" }, visibleItems.map((entry) => /* @__PURE__ */ React4.createElement("div", { key: entry.label, className: "trainingPlugin__metaListRow" }, /* @__PURE__ */ React4.createElement("span", null, entry.label), /* @__PURE__ */ React4.createElement("strong", null, entry.value)))) : /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__mutedBlock" }, "Sin datos."));
}
function ExercisePreview({
  exercise,
  markdown,
  onBack,
  onEdit,
  onOpenDoc
}) {
  if (!exercise) {
    return /* @__PURE__ */ React4.createElement(
      StateBlock,
      {
        eyebrow: "Ejercicios",
        title: "No encontramos ese ejercicio."
      }
    );
  }
  return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__detailHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: onBack }, "Volver"), exercise.doc ? /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: () => void onOpenDoc?.(exercise.doc) }, "Abrir nota") : null, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: onEdit }, "Editar"))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Ejercicio",
        title: exercise.title,
        description: buildTrainingExerciseSummary(exercise) || buildExerciseEditorDescription(exercise)
      }
    )
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailColumns" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailMain" }, /* @__PURE__ */ React4.createElement(
    TrainingDocumentCard,
    {
      title: "Nota",
      markdown,
      mode: "preview"
    }
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailAside" }, /* @__PURE__ */ React4.createElement(
    TrainingMetaPanel,
    {
      title: "Taxonomia",
      items: buildExerciseTaxonomyMetaItems(exercise)
    }
  ), /* @__PURE__ */ React4.createElement(
    TrainingMetaPanel,
    {
      title: "Medida",
      items: [
        { label: "Unidad", value: buildTrainingMeasurementUnitSummary(exercise.measurement) || "Sin definir" },
        { label: "Dificultad", value: exercise.personalDifficultyScore == null ? "" : String(exercise.personalDifficultyScore) }
      ]
    }
  ), /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card trainingPlugin__metaPanel" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Musculos" })), Array.isArray(exercise.muscleLoads) && exercise.muscleLoads.length ? /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__chipGrid" }, exercise.muscleLoads.map((entry) => /* @__PURE__ */ React4.createElement("div", { key: entry.muscleId, className: "trainingPlugin__muscleChip is-static" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__muscleChipCopy" }, /* @__PURE__ */ React4.createElement("strong", null, entry.title), /* @__PURE__ */ React4.createElement("span", null, entry.groupTitle)), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__muscleChipControls" }, /* @__PURE__ */ React4.createElement("strong", null, `${entry.percentage}%`))))) : /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__mutedBlock" }, "Sin musculos vinculados.")))));
}
function MusclePreview({
  muscle,
  markdown,
  onBack,
  onEdit,
  onOpenDoc
}) {
  if (!muscle) {
    return /* @__PURE__ */ React4.createElement(
      StateBlock,
      {
        eyebrow: "Musculos",
        title: "No encontramos ese musculo."
      }
    );
  }
  return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__detailHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: onBack }, "Volver"), muscle.doc ? /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: () => void onOpenDoc?.(muscle.doc) }, "Abrir nota") : null, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: onEdit }, "Editar"))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Musculo",
        title: muscle.title,
        description: [muscle.groupTitle, muscle.regionTitle].filter(Boolean).join(" - ")
      }
    )
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailColumns trainingPlugin__detailColumns--muscle" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailMain" }, /* @__PURE__ */ React4.createElement(
    TrainingDocumentCard,
    {
      title: "Nota",
      markdown,
      mode: "preview"
    }
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailAside" }, /* @__PURE__ */ React4.createElement(
    TrainingMetaPanel,
    {
      title: "Catalogo",
      items: [
        { label: "Region", value: muscle.regionTitle },
        { label: "Grupo", value: muscle.groupTitle },
        { label: "Id", value: muscle.id }
      ]
    }
  ))));
}
function RoutinePreview({
  routine,
  exercises,
  onBack,
  onEdit,
  onAssign
}) {
  const exerciseLookup = useMemo2(
    () => Object.fromEntries((exercises || []).map((exercise) => [exercise.id, exercise])),
    [exercises]
  );
  const flattenedSteps = useMemo2(
    () => flattenTrainingStructureSteps(normalizeTrainingStructure(routine?.structure || []), { includeBlocks: true }),
    [routine?.structure]
  );
  if (!routine) {
    return /* @__PURE__ */ React4.createElement(
      StateBlock,
      {
        eyebrow: "Rutinas",
        title: "No encontramos esa rutina."
      }
    );
  }
  return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__detailHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: onBack }, "Volver"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: () => onAssign?.(routine) }, "Asignar"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: onEdit }, "Editar"))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Rutina",
        title: routine.title,
        description: routine.searchSummary || routine.summary || buildTrainingStructureSummary(routine.structure, exerciseLookup)
      }
    )
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailColumns" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailMain" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Estructura", description: buildTrainingRoutineSummary(routine, exerciseLookup) })), flattenedSteps.length ? /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__structurePreview" }, flattenedSteps.map((entry, index) => entry.type === "block" ? /* @__PURE__ */ React4.createElement("div", { key: entry.id || `block-${index + 1}`, className: "trainingPlugin__structureRow is-block" }, /* @__PURE__ */ React4.createElement("strong", null, entry.title || `Bloque ${index + 1}`), /* @__PURE__ */ React4.createElement("span", null, `${entry.repeatCount || 1} vueltas`)) : /* @__PURE__ */ React4.createElement("div", { key: entry.id || `step-${index + 1}`, className: "trainingPlugin__structureRow" }, /* @__PURE__ */ React4.createElement("strong", null, `${index + 1}. ${buildTrainingRoutineStepSummary(entry, exerciseLookup) || "Paso"}`), entry.parentBlockTitle ? /* @__PURE__ */ React4.createElement("span", null, `${entry.parentBlockTitle} x${entry.parentBlockRepeatCount || 1}`) : null))) : /* @__PURE__ */ React4.createElement(StateBlock, { centered: true, title: "Sin estructura" }))), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailAside" }, /* @__PURE__ */ React4.createElement(
    TrainingMetaPanel,
    {
      title: "Resumen",
      items: [
        { label: "Titulo corto", value: routine.title },
        { label: "Descripcion", value: routine.summary || "" }
      ]
    }
  ))));
}
function TrainingMeasurementUnitEditor({
  value,
  onChange
}) {
  const currentMode = value?.mode || "reps";
  return /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__measureCard" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, "Unidad base"), /* @__PURE__ */ React4.createElement("span", null, "El ejercicio define el tipo de medida. La carga concreta se guarda en la rutina o en la captura diaria.")), /* @__PURE__ */ React4.createElement(Field, { label: "Medida" }, /* @__PURE__ */ React4.createElement("select", { value: currentMode, onChange: (event) => onChange({ mode: event.target.value }) }, TRAINING_METRIC_MODE_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__measurePreview" }, /* @__PURE__ */ React4.createElement("span", null, "Lectura"), /* @__PURE__ */ React4.createElement("strong", null, buildTrainingMeasurementUnitSummary(value) || "Sin definir")));
}
function TrainingMetricEditor({
  label,
  value,
  onChange,
  context = "exercise"
}) {
  const currentValue = normalizeMetricDraftForMode(value, context);
  const isRest = context === "rest";
  const mode = currentValue.mode || "reps";
  const updateField = (fieldName) => (event) => {
    onChange({
      ...currentValue,
      [fieldName]: event.target.value
    });
  };
  return /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__metricEditor" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__sectionIntro" }, /* @__PURE__ */ React4.createElement("strong", null, label), /* @__PURE__ */ React4.createElement("span", null, isRest ? "Descanso de este paso." : "Carga concreta del paso.")), isRest ? /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Segundos" }, /* @__PURE__ */ React4.createElement("input", { type: "number", min: "0", value: currentValue.restSeconds, onChange: updateField("restSeconds"), placeholder: "90" })), /* @__PURE__ */ React4.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: currentValue.notes, onChange: updateField("notes"), placeholder: "Opcional" }))) : /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Modo" }, /* @__PURE__ */ React4.createElement("select", { value: mode, onChange: (event) => onChange(normalizeMetricDraftForMode({ ...currentValue, mode: event.target.value }, context)) }, TRAINING_METRIC_MODE_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label)))), mode === "reps" ? /* @__PURE__ */ React4.createElement(Field, { label: "Reps" }, /* @__PURE__ */ React4.createElement("input", { type: "number", min: "0", value: currentValue.reps, onChange: updateField("reps"), placeholder: "8" })) : null, mode === "time" ? /* @__PURE__ */ React4.createElement(Field, { label: "Segundos" }, /* @__PURE__ */ React4.createElement("input", { type: "number", min: "0", value: currentValue.seconds, onChange: updateField("seconds"), placeholder: "45" })) : null, mode === "distance" ? /* @__PURE__ */ React4.createElement(Field, { label: "Distancia" }, /* @__PURE__ */ React4.createElement("input", { type: "number", min: "0", step: "0.01", value: currentValue.distance, onChange: updateField("distance"), placeholder: "1.5" })) : null, mode === "weight" ? /* @__PURE__ */ React4.createElement(Field, { label: "Peso" }, /* @__PURE__ */ React4.createElement("input", { type: "number", min: "0", step: "0.01", value: currentValue.weight, onChange: updateField("weight"), placeholder: "20" })) : null), mode === "distance" || mode === "weight" || mode === "reps" ? /* @__PURE__ */ React4.createElement(FieldGrid, null, mode === "distance" ? /* @__PURE__ */ React4.createElement(Field, { label: "Unidad distancia" }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: currentValue.distanceUnit, onChange: updateField("distanceUnit"), placeholder: "m" })) : null, mode === "weight" || mode === "reps" ? /* @__PURE__ */ React4.createElement(Field, { label: "Unidad peso" }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: currentValue.weightUnit, onChange: updateField("weightUnit"), placeholder: "kg" })) : null, /* @__PURE__ */ React4.createElement(Field, { label: "Tempo", wide: true }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: currentValue.tempo, onChange: updateField("tempo"), placeholder: "Opcional" }))) : null, /* @__PURE__ */ React4.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: currentValue.notes, onChange: updateField("notes"), placeholder: "Opcional" }))));
}
function MuscleLoadEditor({
  catalog,
  draft,
  setDraft,
  muscleSearch,
  setMuscleSearch,
  regionFilter,
  setRegionFilter,
  groupFilter,
  setGroupFilter,
  onOpenDoc
}) {
  const selectedById = new Map((draft.muscleLoads || []).map((entry) => [String(entry.muscleId), entry]));
  const totalPercentage = sumDraftMusclePercentages(draft.muscleLoads || []);
  const remainingPercentage = 100 - totalPercentage;
  const filteredMuscles = useMemo2(() => {
    return (catalog.muscles || []).filter((muscle) => {
      if (regionFilter && muscle.regionId !== regionFilter) {
        return false;
      }
      if (groupFilter && muscle.groupId !== groupFilter) {
        return false;
      }
      if (!muscleSearch) {
        return true;
      }
      return isComparableTextMatch(muscle.searchText, muscleSearch);
    });
  }, [catalog.muscles, groupFilter, muscleSearch, regionFilter]);
  function addMuscle(muscle) {
    setDraft((current) => {
      if (current.muscleLoads.some((entry) => entry.muscleId === muscle.id)) {
        return current;
      }
      const currentTotal = sumDraftMusclePercentages(current.muscleLoads || []);
      const defaultPercentage = currentTotal >= 100 ? 1 : Math.min(25, Math.max(1, 100 - currentTotal));
      return {
        ...current,
        muscleLoads: [
          ...current.muscleLoads,
          {
            muscleId: muscle.id,
            title: muscle.title,
            regionId: muscle.regionId,
            regionTitle: muscle.regionTitle,
            groupId: muscle.groupId,
            groupTitle: muscle.groupTitle,
            percentage: defaultPercentage
          }
        ]
      };
    });
  }
  function removeMuscle(muscleId) {
    setDraft((current) => ({
      ...current,
      muscleLoads: current.muscleLoads.filter((entry) => entry.muscleId !== muscleId)
    }));
  }
  function updatePercentage(muscleId, nextPercentage) {
    setDraft((current) => ({
      ...current,
      muscleLoads: current.muscleLoads.map((entry) => entry.muscleId !== muscleId ? entry : {
        ...entry,
        percentage: Math.min(100, Math.max(1, Number(nextPercentage) || 1))
      })
    }));
  }
  return /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card trainingPlugin__card--aside" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(
    PanelTitle,
    {
      title: "Musculos"
    }
  )), draft.legacyWarnings?.length ? /* @__PURE__ */ React4.createElement(Notice, { tone: "warning" }, `Quedaron musculos legacy sin mapear: ${draft.legacyWarnings.map((entry) => entry.sourceTitle).join(", ")}.`) : null, /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: [
        "trainingPlugin__muscleLoadSummary",
        totalPercentage === 100 ? "is-valid" : "",
        totalPercentage > 100 ? "is-over" : totalPercentage < 100 ? "is-under" : ""
      ].filter(Boolean).join(" ")
    },
    /* @__PURE__ */ React4.createElement("strong", null, `Total ${totalPercentage}%`),
    /* @__PURE__ */ React4.createElement("span", null, remainingPercentage === 0 ? "Listo para guardar." : remainingPercentage > 0 ? `Faltan ${remainingPercentage}%.` : `Sobran ${Math.abs(remainingPercentage)}%.`)
  ), /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Buscar", wide: true }, /* @__PURE__ */ React4.createElement(SearchField, { value: muscleSearch, onChange: (event) => setMuscleSearch(event.target.value), placeholder: "Pecho, trapecio, core...", "aria-label": "Buscar musculos" })), /* @__PURE__ */ React4.createElement(Field, { label: "Region" }, /* @__PURE__ */ React4.createElement(Select, { value: regionFilter, onChange: (event) => setRegionFilter(event.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Todas"), (catalog.regions || []).map((region) => /* @__PURE__ */ React4.createElement("option", { key: region.id, value: region.id }, region.title)))), /* @__PURE__ */ React4.createElement(Field, { label: "Grupo" }, /* @__PURE__ */ React4.createElement(Select, { value: groupFilter, onChange: (event) => setGroupFilter(event.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Todos"), (catalog.groups || []).filter((group) => !regionFilter || group.regionId === regionFilter).map((group) => /* @__PURE__ */ React4.createElement("option", { key: group.id, value: group.id }, group.title))))), (draft.muscleLoads || []).length ? /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__chipGrid" }, draft.muscleLoads.map((entry) => /* @__PURE__ */ React4.createElement("div", { key: entry.muscleId, className: "trainingPlugin__muscleChip" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__muscleChipCopy" }, /* @__PURE__ */ React4.createElement("strong", null, entry.title), /* @__PURE__ */ React4.createElement("span", null, entry.groupTitle)), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__muscleChipControls" }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "number",
      min: "1",
      max: "100",
      value: String(entry.percentage ?? 0),
      onChange: (event) => updatePercentage(entry.muscleId, event.target.value)
    }
  ), /* @__PURE__ */ React4.createElement("span", { className: "trainingPlugin__muscleChipSuffix" }, "%"), /* @__PURE__ */ React4.createElement("button", { type: "button", className: "trainingPlugin__chipRemove", onClick: () => removeMuscle(entry.muscleId), "aria-label": `Quitar ${entry.title}` }, "x"))))) : /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__mutedBlock" }, "Todavia no hay musculos seleccionados."), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__selectorList" }, filteredMuscles.slice(0, 36).map((muscle) => /* @__PURE__ */ React4.createElement("div", { key: muscle.id, className: "trainingPlugin__selectorItem" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__selectorItemMain" }, /* @__PURE__ */ React4.createElement("strong", null, muscle.title), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__selectorItemMeta" }, /* @__PURE__ */ React4.createElement("span", null, `${muscle.regionTitle} / ${muscle.groupTitle}`)), /* @__PURE__ */ React4.createElement("span", null, muscle.regionTitle, " - ", muscle.groupTitle)), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__selectorItemActions" }, /* @__PURE__ */ React4.createElement(
    Button,
    {
      type: "button",
      tone: selectedById.has(muscle.id) ? "secondary" : "primary",
      onClick: () => selectedById.has(muscle.id) ? removeMuscle(muscle.id) : addMuscle(muscle)
    },
    selectedById.has(muscle.id) ? "Quitar" : "Seleccionar"
  ), /* @__PURE__ */ React4.createElement(
    Button,
    {
      type: "button",
      tone: "secondary",
      disabled: !muscle.doc,
      onClick: () => muscle.doc ? onOpenDoc?.(muscle.doc) : null
    },
    "Abrir"
  ))))));
}
function ExerciseEditor(props) {
  const {
    selectedExercise,
    exerciseDraft,
    setExerciseDraft,
    exerciseMarkdown,
    setExerciseMarkdown,
    editorKey,
    handleSaveExercise,
    handleDeleteExercise,
    handleOpenDoc,
    onCancel,
    catalog,
    muscleSearch,
    setMuscleSearch,
    regionFilter,
    setRegionFilter,
    groupFilter,
    setGroupFilter
  } = props;
  const effectiveTags = getExerciseEffectiveTags(exerciseDraft);
  function handleExerciseTypeChange(nextType) {
    setExerciseDraft((current) => ({
      ...current,
      exerciseType: nextType || "exercise"
    }));
  }
  function handleMeasurementCategoryChange(nextCategory) {
    setExerciseDraft((current) => ({
      ...current,
      measurementCategory: nextCategory || "strength",
      tags: normalizeTrainingExerciseTags(current.tags || [], {
        measurementCategory: nextCategory || "strength"
      })
    }));
  }
  function toggleExerciseTag(tagId) {
    if (!tagId || tagId === exerciseDraft.measurementCategory) {
      return;
    }
    setExerciseDraft((current) => {
      const nextTags = Array.isArray(current.tags) && current.tags.includes(tagId) ? current.tags.filter((entry) => entry !== tagId) : [...Array.isArray(current.tags) ? current.tags : [], tagId];
      return {
        ...current,
        tags: normalizeTrainingExerciseTags(nextTags, {
          measurementCategory: current.measurementCategory
        })
      };
    });
  }
  return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack trainingPlugin__editor trainingPlugin__editor--exercise" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__detailHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: onCancel }, selectedExercise?.id ? "Cancelar" : "Volver"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: () => void handleSaveExercise() }, "Guardar ejercicio"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "danger", disabled: !exerciseDraft.id, onClick: () => void handleDeleteExercise() }, /* @__PURE__ */ React4.createElement(DeleteIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Eliminar")))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Ejercicio",
        title: selectedExercise?.title || "Nuevo ejercicio",
        description: selectedExercise?.id ? buildExerciseEditorDescription(selectedExercise) : "Crea el ejercicio, define su taxonomia y prepara la nota antes de persistirla."
      }
    )
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailColumns" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailMain" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card trainingPlugin__card--main" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Base", description: "Nombre corto, taxonomia, unidad base y dificultad." })), /* @__PURE__ */ React4.createElement(FieldGrid, { className: "trainingPlugin__singleColumnGrid" }, /* @__PURE__ */ React4.createElement(Field, { label: "Titulo", wide: true }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: exerciseDraft.title, onChange: (event) => setExerciseDraft((current) => ({ ...current, title: event.target.value })), placeholder: "Nombre del ejercicio" })), /* @__PURE__ */ React4.createElement(Field, { label: "Tipo" }, /* @__PURE__ */ React4.createElement("select", { value: exerciseDraft.exerciseType, onChange: (event) => handleExerciseTypeChange(event.target.value) }, TRAINING_EXERCISE_TYPE_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React4.createElement(Field, { label: "Perfil principal" }, /* @__PURE__ */ React4.createElement("select", { value: exerciseDraft.measurementCategory, onChange: (event) => handleMeasurementCategoryChange(event.target.value) }, TRAINING_MEASUREMENT_CATEGORY_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React4.createElement(Field, { label: "Dificultad personal", wide: true }, /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "number",
      min: "0",
      step: "1",
      value: exerciseDraft.personalDifficultyScore,
      onChange: (event) => setExerciseDraft((current) => ({ ...current, personalDifficultyScore: event.target.value })),
      placeholder: "Opcional, 0 a 100"
    }
  )), /* @__PURE__ */ React4.createElement(Field, { label: "Tags", wide: true }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__tagToggleGrid" }, TRAINING_EXERCISE_TAG_OPTIONS.map((option) => {
    const active = effectiveTags.includes(option.value);
    const locked = exerciseDraft.measurementCategory === option.value;
    return /* @__PURE__ */ React4.createElement(
      "button",
      {
        key: option.value,
        type: "button",
        className: [
          "trainingPlugin__tagToggle",
          active ? "is-active" : "",
          locked ? "is-locked" : ""
        ].filter(Boolean).join(" "),
        onClick: () => toggleExerciseTag(option.value),
        disabled: locked,
        "aria-pressed": active
      },
      /* @__PURE__ */ React4.createElement("span", null, option.label),
      locked ? /* @__PURE__ */ React4.createElement("strong", null, "Perfil") : null
    );
  })))), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__sectionIntro trainingPlugin__sectionIntro--compact" }, /* @__PURE__ */ React4.createElement("span", null, `${buildTrainingMeasurementCategorySummary(exerciseDraft.measurementCategory) || "Fuerza"} tambien se aplica como tag principal.`), /* @__PURE__ */ React4.createElement("span", null, "Valor personal opcional. La unidad base del ejercicio sigue definiendose por separado.")), /* @__PURE__ */ React4.createElement(
    TrainingMeasurementUnitEditor,
    {
      value: exerciseDraft.measurement,
      onChange: (nextMeasurement) => setExerciseDraft((current) => ({
        ...current,
        measurement: createExerciseMeasurementDraft(nextMeasurement)
      }))
    }
  )), /* @__PURE__ */ React4.createElement(
    TrainingDocumentCard,
    {
      title: "Nota",
      description: selectedExercise?.id ? "Editor embebido" : "La nota real del vault se crea cuando guardas el ejercicio.",
      markdown: exerciseMarkdown,
      mode: "edit",
      editorKey,
      onChange: setExerciseMarkdown
    }
  )), /* @__PURE__ */ React4.createElement(
    MuscleLoadEditor,
    {
      catalog,
      draft: exerciseDraft,
      setDraft: setExerciseDraft,
      muscleSearch,
      setMuscleSearch,
      regionFilter,
      setRegionFilter,
      groupFilter,
      setGroupFilter,
      onOpenDoc: handleOpenDoc
    }
  )));
}
function MuscleEditor({
  muscle,
  markdown,
  editorKey,
  onChangeMarkdown,
  onCancel,
  onSave,
  onOpenDoc
}) {
  return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack trainingPlugin__editor" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__detailHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: onCancel }, "Cancelar"), muscle?.doc ? /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: () => void onOpenDoc?.(muscle.doc) }, "Abrir nota") : null, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: () => void onSave?.() }, "Guardar nota"))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Musculo",
        title: muscle?.title || "Musculo",
        description: [muscle?.groupTitle, muscle?.regionTitle].filter(Boolean).join(" - ")
      }
    )
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailColumns trainingPlugin__detailColumns--muscle" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailMain" }, /* @__PURE__ */ React4.createElement(
    TrainingDocumentCard,
    {
      title: "Nota",
      description: "Editor embebido",
      markdown,
      mode: "edit",
      editorKey,
      onChange: onChangeMarkdown
    }
  )), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__detailAside" }, /* @__PURE__ */ React4.createElement(
    TrainingMetaPanel,
    {
      title: "Catalogo",
      items: [
        { label: "Region", value: muscle?.regionTitle },
        { label: "Grupo", value: muscle?.groupTitle },
        { label: "Id", value: muscle?.id }
      ]
    }
  ))));
}
function StructureStepCard({
  step,
  exercises,
  onChange,
  onMove,
  onRemove
}) {
  const selectedExercise = step.exerciseId ? findExerciseById(exercises, step.exerciseId) : null;
  const summary = buildTrainingMetricSummary(draftMetricToPayload(step.metric, step.stepKind === "rest" ? "rest" : "exercise"));
  return /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__stepCard" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__stepHeader" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__stepTitle" }, /* @__PURE__ */ React4.createElement("strong", null, step.stepKind === "rest" ? "Descanso" : selectedExercise?.title || "Paso de ejercicio"), /* @__PURE__ */ React4.createElement("span", null, summary || "Sin carga definida")), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__stepActions" }, /* @__PURE__ */ React4.createElement(CyberIconButton, { type: "button", "aria-label": "Subir paso", onClick: () => onMove(-1) }, /* @__PURE__ */ React4.createElement(ArrowUpIcon, { size: 14 })), /* @__PURE__ */ React4.createElement(CyberIconButton, { type: "button", "aria-label": "Bajar paso", onClick: () => onMove(1) }, /* @__PURE__ */ React4.createElement(ArrowDownIcon, { size: 14 })), /* @__PURE__ */ React4.createElement(CyberIconButton, { type: "button", tone: "danger", "aria-label": "Quitar paso", onClick: onRemove }, /* @__PURE__ */ React4.createElement(DeleteIcon, { size: 14 })))), /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Tipo" }, /* @__PURE__ */ React4.createElement(
    "select",
    {
      value: step.stepKind,
      onChange: (event) => onChange({
        ...step,
        stepKind: event.target.value === "rest" ? "rest" : "exercise",
        exerciseId: event.target.value === "rest" ? "" : step.exerciseId,
        metric: createPrescriptionDraft({}, event.target.value === "rest" ? "rest" : "exercise")
      })
    },
    /* @__PURE__ */ React4.createElement("option", { value: "exercise" }, "Ejercicio"),
    /* @__PURE__ */ React4.createElement("option", { value: "rest" }, "Descanso")
  )), step.stepKind === "exercise" ? /* @__PURE__ */ React4.createElement(Field, { label: "Ejercicio", wide: true }, /* @__PURE__ */ React4.createElement(
    "select",
    {
      value: step.exerciseId,
      onChange: (event) => {
        const nextExercise = findExerciseById(exercises, event.target.value);
        onChange({
          ...step,
          exerciseId: event.target.value,
          metric: nextExercise ? createPrescriptionDraft(nextExercise.measurement || {}, "exercise") : createPrescriptionDraft({}, "exercise")
        });
      }
    },
    /* @__PURE__ */ React4.createElement("option", { value: "" }, "Selecciona un ejercicio"),
    exercises.map((exercise) => /* @__PURE__ */ React4.createElement("option", { key: exercise.id, value: exercise.id }, exercise.title))
  )) : null), /* @__PURE__ */ React4.createElement(
    TrainingMetricEditor,
    {
      label: step.stepKind === "rest" ? "Descanso" : "Carga",
      value: step.metric,
      context: step.stepKind === "rest" ? "rest" : "exercise",
      onChange: (nextMetric) => onChange({
        ...step,
        metric: normalizeMetricDraftForMode(nextMetric, step.stepKind === "rest" ? "rest" : "exercise")
      })
    }
  ));
}
function StructureBlockCard({
  block,
  exercises,
  onChange,
  onMove,
  onRemove
}) {
  const blockSummary = buildTrainingRoutineSummary({ structure: [normalizeTrainingStructure([block])[0]] }, Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise])));
  function updateStep(stepId, updater) {
    onChange({
      ...block,
      steps: block.steps.map((step) => step.id === stepId ? updater(step) : step)
    });
  }
  function moveStep(stepId, direction) {
    const index = block.steps.findIndex((step) => step.id === stepId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= block.steps.length) {
      return;
    }
    const nextSteps = [...block.steps];
    const [moved] = nextSteps.splice(index, 1);
    nextSteps.splice(nextIndex, 0, moved);
    onChange({ ...block, steps: nextSteps });
  }
  return /* @__PURE__ */ React4.createElement("details", { className: "trainingPlugin__blockCard", open: true }, /* @__PURE__ */ React4.createElement("summary", { className: "trainingPlugin__blockSummary" }, /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__stepTitle" }, /* @__PURE__ */ React4.createElement("strong", null, block.title || "Bloque"), /* @__PURE__ */ React4.createElement("span", null, blockSummary)), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__stepActions" }, /* @__PURE__ */ React4.createElement(CyberIconButton, { type: "button", "aria-label": "Subir bloque", onClick: (event) => {
    event.preventDefault();
    onMove(-1);
  } }, /* @__PURE__ */ React4.createElement(ArrowUpIcon, { size: 14 })), /* @__PURE__ */ React4.createElement(CyberIconButton, { type: "button", "aria-label": "Bajar bloque", onClick: (event) => {
    event.preventDefault();
    onMove(1);
  } }, /* @__PURE__ */ React4.createElement(ArrowDownIcon, { size: 14 })), /* @__PURE__ */ React4.createElement(CyberIconButton, { type: "button", tone: "danger", "aria-label": "Quitar bloque", onClick: (event) => {
    event.preventDefault();
    onRemove();
  } }, /* @__PURE__ */ React4.createElement(DeleteIcon, { size: 14 })))), /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Titulo" }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: block.title, onChange: (event) => onChange({ ...block, title: event.target.value }), placeholder: "Superserie, circuito..." })), /* @__PURE__ */ React4.createElement(Field, { label: "Repeticiones" }, /* @__PURE__ */ React4.createElement("input", { type: "number", min: "1", value: block.repeatCount, onChange: (event) => onChange({ ...block, repeatCount: event.target.value }) }))), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__inlineActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => onChange({ ...block, steps: [...block.steps, createStructureStepDraft("exercise")] }) }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Ejercicio")), /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => onChange({ ...block, steps: [...block.steps, createStructureStepDraft("rest")] }) }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Descanso"))), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__steps" }, block.steps.map((step) => /* @__PURE__ */ React4.createElement(
    StructureStepCard,
    {
      key: step.id,
      step,
      exercises,
      onChange: (nextStep) => updateStep(step.id, () => nextStep),
      onMove: (direction) => moveStep(step.id, direction),
      onRemove: () => onChange({ ...block, steps: block.steps.filter((entry) => entry.id !== step.id) })
    }
  ))));
}
function RoutineEditor({
  selectedRoutine,
  routineDraft,
  setRoutineDraft,
  catalog,
  handleSaveRoutine,
  handleDeleteRoutine,
  openAssignmentFromRoutine,
  onCancel
}) {
  const exerciseLookup = useMemo2(
    () => Object.fromEntries((catalog.exercises || []).map((exercise) => [exercise.id, exercise])),
    [catalog.exercises]
  );
  function updateSegment(segmentId, nextSegment) {
    setRoutineDraft((current) => ({
      ...current,
      structure: current.structure.map((segment) => segment.id === segmentId ? nextSegment : segment)
    }));
  }
  function moveSegment(segmentId, direction) {
    setRoutineDraft((current) => {
      const index = current.structure.findIndex((segment) => segment.id === segmentId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.structure.length) {
        return current;
      }
      const nextStructure = [...current.structure];
      const [moved] = nextStructure.splice(index, 1);
      nextStructure.splice(nextIndex, 0, moved);
      return { ...current, structure: nextStructure };
    });
  }
  const normalizedStructure = normalizeTrainingStructure(routineDraft.structure || []);
  const routineSummary = buildTrainingRoutineSummary({ structure: normalizedStructure }, exerciseLookup);
  return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack trainingPlugin__editor trainingPlugin__editor--routine" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__detailHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: onCancel }, selectedRoutine?.id ? "Cancelar" : "Volver"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: () => void handleSaveRoutine() }, "Guardar rutina"), /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => openAssignmentFromRoutine(selectedRoutine || { id: routineDraft.id, title: routineDraft.title }), disabled: !routineDraft.id && !routineDraft.title }, "Asignar rutina"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "danger", disabled: !routineDraft.id, onClick: () => void handleDeleteRoutine() }, /* @__PURE__ */ React4.createElement(DeleteIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Eliminar")))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Rutina",
        title: selectedRoutine?.title || "Nueva rutina",
        description: selectedRoutine?.id ? buildRoutineEditorDescription(selectedRoutine) : "Crea la rutina y define su estructura dentro del mismo detalle."
      }
    )
  )), /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card trainingPlugin__card--summary" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Resumen", description: "Nombre breve y lectura compacta." })), /* @__PURE__ */ React4.createElement(FieldGrid, { className: "trainingPlugin__singleColumnGrid" }, /* @__PURE__ */ React4.createElement(Field, { label: "Titulo", wide: true }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: routineDraft.title, onChange: (event) => setRoutineDraft((current) => ({ ...current, title: event.target.value })), placeholder: "Nombre de la rutina" })), /* @__PURE__ */ React4.createElement(Field, { label: "Resumen", wide: true }, /* @__PURE__ */ React4.createElement("input", { type: "text", value: routineDraft.summary, onChange: (event) => setRoutineDraft((current) => ({ ...current, summary: event.target.value })), placeholder: "Contexto breve" }))), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__mutedBlock" }, routineSummary || "Todavia no hay estructura definida.")), /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card trainingPlugin__card--steps" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: () => setRoutineDraft((current) => ({ ...current, structure: [...current.structure, createStructureStepDraft("exercise")] })) }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Paso")), /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => setRoutineDraft((current) => ({ ...current, structure: [...current.structure, createStructureStepDraft("rest")] })) }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Descanso")), /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => setRoutineDraft((current) => ({ ...current, structure: [...current.structure, createStructureBlockDraft()] })) }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Bloque")))
    },
    /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Estructura", description: "Pasos sueltos o bloques repetibles." })
  ), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__steps" }, routineDraft.structure.map((segment) => segment.type === "block" ? /* @__PURE__ */ React4.createElement(
    StructureBlockCard,
    {
      key: segment.id,
      block: segment,
      exercises: catalog.exercises,
      onChange: (nextBlock) => updateSegment(segment.id, nextBlock),
      onMove: (direction) => moveSegment(segment.id, direction),
      onRemove: () => setRoutineDraft((current) => ({ ...current, structure: current.structure.filter((entry) => entry.id !== segment.id) }))
    }
  ) : /* @__PURE__ */ React4.createElement(
    StructureStepCard,
    {
      key: segment.id,
      step: segment,
      exercises: catalog.exercises,
      onChange: (nextStep) => updateSegment(segment.id, nextStep),
      onMove: (direction) => moveSegment(segment.id, direction),
      onRemove: () => setRoutineDraft((current) => ({ ...current, structure: current.structure.filter((entry) => entry.id !== segment.id) }))
    }
  )), !routineDraft.structure.length ? /* @__PURE__ */ React4.createElement(
    StateBlock,
    {
      className: "trainingPlugin__empty",
      centered: true,
      eyebrow: "Sin estructura",
      title: "Agrega pasos o bloques",
      description: "La rutina final queda lista para asignarse cuando guardes."
    }
  ) : null)));
}
function AssignmentEditor({
  selectedAssignment,
  assignmentDraft,
  setAssignmentDraft,
  routines,
  handleSaveAssignment,
  handleDeleteAssignment,
  onCancel
}) {
  const selectedRoutine = findRoutineById(routines, assignmentDraft.routineId);
  return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack trainingPlugin__editor trainingPlugin__editor--assignment" }, /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__detailHeader", tone: "highlight", padding: "tight" }, /* @__PURE__ */ React4.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__headerActions" }, /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "secondary", onClick: onCancel }, selectedAssignment?.id ? "Cancelar" : "Volver"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: () => void handleSaveAssignment() }, "Guardar programacion"), /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "danger", disabled: !assignmentDraft.id, onClick: () => void handleDeleteAssignment() }, /* @__PURE__ */ React4.createElement(DeleteIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Eliminar")))
    },
    /* @__PURE__ */ React4.createElement(
      PanelTitle,
      {
        eyebrow: "Programada",
        title: selectedAssignment?.routine?.title || selectedRoutine?.title || "Nueva programacion",
        description: selectedAssignment?.searchSummary || "Asocia una rutina existente a una recurrencia concreta."
      }
    )
  )), /* @__PURE__ */ React4.createElement(SectionPanel, { className: "trainingPlugin__card trainingPlugin__card--summary" }, /* @__PURE__ */ React4.createElement(PanelHeader, null, /* @__PURE__ */ React4.createElement(PanelTitle, { title: "Configuracion", description: "Rutina, calendario y forma de completar." })), /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Rutina", wide: true }, /* @__PURE__ */ React4.createElement("select", { value: assignmentDraft.routineId, onChange: (event) => setAssignmentDraft((current) => ({ ...current, routineId: event.target.value })) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Selecciona una rutina"), routines.map((routine) => /* @__PURE__ */ React4.createElement("option", { key: routine.id, value: routine.id }, routine.title)))), /* @__PURE__ */ React4.createElement(Field, { label: "Recurrencia" }, /* @__PURE__ */ React4.createElement("select", { value: assignmentDraft.scheduleType, onChange: (event) => setAssignmentDraft((current) => ({ ...current, scheduleType: event.target.value })) }, SCHEDULE_TYPE_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React4.createElement(Field, { label: "Completicion" }, /* @__PURE__ */ React4.createElement("select", { value: assignmentDraft.completionMode, onChange: (event) => setAssignmentDraft((current) => ({ ...current, completionMode: event.target.value })) }, COMPLETION_MODE_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label))))), assignmentDraft.scheduleType === "weekdays" ? /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__weekdayRow" }, WEEKDAY_OPTIONS.map((weekday) => {
    const active = assignmentDraft.weekdays.includes(weekday.value);
    return /* @__PURE__ */ React4.createElement(
      "button",
      {
        key: weekday.value,
        type: "button",
        className: ["trainingPlugin__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" "),
        onClick: () => setAssignmentDraft((current) => ({
          ...current,
          weekdays: active ? current.weekdays.filter((entry) => entry !== weekday.value) : [...current.weekdays, weekday.value].sort((left, right) => left - right)
        }))
      },
      weekday.label
    );
  })) : null, /* @__PURE__ */ React4.createElement(FieldGrid, null, /* @__PURE__ */ React4.createElement(Field, { label: "Inicio" }, /* @__PURE__ */ React4.createElement("input", { type: "date", value: assignmentDraft.startDate, onChange: (event) => setAssignmentDraft((current) => ({ ...current, startDate: event.target.value })) })), /* @__PURE__ */ React4.createElement(Field, { label: "Fin" }, /* @__PURE__ */ React4.createElement("input", { type: "date", value: assignmentDraft.endDate, onChange: (event) => setAssignmentDraft((current) => ({ ...current, endDate: event.target.value })) })), /* @__PURE__ */ React4.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React4.createElement("input", { type: "time", value: assignmentDraft.time, onChange: (event) => setAssignmentDraft((current) => ({ ...current, time: event.target.value })) })), /* @__PURE__ */ React4.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React4.createElement("input", { type: "number", min: "1", max: "100", value: assignmentDraft.priority, onChange: (event) => setAssignmentDraft((current) => ({ ...current, priority: event.target.value })) })), /* @__PURE__ */ React4.createElement(Field, { label: "Estado" }, /* @__PURE__ */ React4.createElement("select", { value: assignmentDraft.status, onChange: (event) => setAssignmentDraft((current) => ({ ...current, status: event.target.value })) }, ASSIGNMENT_STATUS_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label))))), /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin__mutedBlock" }, selectedRoutine ? selectedRoutine.searchSummary || "Rutina lista para programar." : "Selecciona una rutina para continuar.")));
}
function TrainingView({
  ctx,
  shellMode = "standalone",
  showTopbar = true
}) {
  const isEmbedded = shellMode === "embedded";
  const [mode, setMode] = useState5("exercises");
  const [catalog, setCatalog] = useState5({
    exercises: [],
    routines: [],
    assignments: [],
    muscles: [],
    regions: [],
    groups: []
  });
  const [loading, setLoading] = useState5(true);
  const [error, setError] = useState5("");
  const [exerciseSearch, setExerciseSearch] = useState5("");
  const [routineSearch, setRoutineSearch] = useState5("");
  const [assignmentSearch, setAssignmentSearch] = useState5("");
  const [muscleSearch, setMuscleSearch] = useState5("");
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState5("");
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState5("");
  const [exerciseTagFilter, setExerciseTagFilter] = useState5("");
  const [regionFilter, setRegionFilter] = useState5("");
  const [groupFilter, setGroupFilter] = useState5("");
  const [selectedExerciseId, setSelectedExerciseId] = useState5(null);
  const [selectedMuscleId, setSelectedMuscleId] = useState5(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState5(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState5(null);
  const [exerciseView, setExerciseView] = useState5("gallery");
  const [muscleView, setMuscleView] = useState5("gallery");
  const [routineView, setRoutineView] = useState5("gallery");
  const [assignmentView, setAssignmentView] = useState5("gallery");
  const [exerciseDraft, setExerciseDraft] = useState5(createExerciseDraft);
  const [routineDraft, setRoutineDraft] = useState5(createRoutineDraft);
  const [assignmentDraft, setAssignmentDraft] = useState5(createAssignmentDraft);
  const [exerciseMarkdown, setExerciseMarkdown] = useState5(() => buildExerciseMarkdownTemplate());
  const [muscleMarkdown, setMuscleMarkdown] = useState5("");
  const [exerciseEditorKey, setExerciseEditorKey] = useState5(() => createId("exercise-editor"));
  const [muscleEditorKey, setMuscleEditorKey] = useState5(() => createId("muscle-editor"));
  const [muscleCoverEditMode, setMuscleCoverEditMode] = useState5(false);
  const [muscleCoverTargetId, setMuscleCoverTargetId] = useState5(null);
  const [muscleCoverBusyId, setMuscleCoverBusyId] = useState5(null);
  const [muscleCoverNotice, setMuscleCoverNotice] = useState5("");
  const exerciseMarkdownLoadIdRef = useRef4(0);
  const muscleMarkdownLoadIdRef = useRef4(0);
  const filteredExercises = useMemo2(() => {
    return catalog.exercises.filter((exercise) => {
      if (exerciseTypeFilter && (exercise.exerciseType || "exercise") !== exerciseTypeFilter) {
        return false;
      }
      if (exerciseCategoryFilter && (exercise.measurementCategory || "strength") !== exerciseCategoryFilter) {
        return false;
      }
      if (exerciseTagFilter && !getExerciseEffectiveTags(exercise).includes(exerciseTagFilter)) {
        return false;
      }
      return isComparableTextMatch(
        [exercise.title, exercise.searchSummary].filter(Boolean).join(" "),
        exerciseSearch
      );
    });
  }, [catalog.exercises, exerciseCategoryFilter, exerciseSearch, exerciseTagFilter, exerciseTypeFilter]);
  const filteredRoutines = useMemo2(() => {
    return catalog.routines.filter((routine) => isComparableTextMatch(
      [routine.title, routine.summary, routine.searchSummary].filter(Boolean).join(" "),
      routineSearch
    ));
  }, [catalog.routines, routineSearch]);
  const filteredAssignments = useMemo2(() => {
    return catalog.assignments.filter((assignment) => isComparableTextMatch(
      [assignment.routine?.title, assignment.searchSummary, assignment.status].filter(Boolean).join(" "),
      assignmentSearch
    ));
  }, [catalog.assignments, assignmentSearch]);
  const filteredMuscles = useMemo2(() => {
    return catalog.muscles.filter((muscle) => {
      if (regionFilter && muscle.regionId !== regionFilter) {
        return false;
      }
      if (groupFilter && muscle.groupId !== groupFilter) {
        return false;
      }
      return isComparableTextMatch(muscle.searchText, muscleSearch);
    });
  }, [catalog.muscles, groupFilter, muscleSearch, regionFilter]);
  const selectedExercise = useMemo2(
    () => findExerciseById(catalog.exercises, selectedExerciseId),
    [catalog.exercises, selectedExerciseId]
  );
  const selectedMuscle = useMemo2(
    () => catalog.muscles.find((muscle) => muscle.id === selectedMuscleId) || null,
    [catalog.muscles, selectedMuscleId]
  );
  const selectedRoutine = useMemo2(
    () => findRoutineById(catalog.routines, selectedRoutineId),
    [catalog.routines, selectedRoutineId]
  );
  const selectedAssignment = useMemo2(
    () => catalog.assignments.find((assignment) => assignment.id === selectedAssignmentId) || null,
    [catalog.assignments, selectedAssignmentId]
  );
  const visibleGroupOptions = useMemo2(
    () => (catalog.groups || []).filter((group) => !regionFilter || group.regionId === regionFilter),
    [catalog.groups, regionFilter]
  );
  const muscleMaxLoadLookup = useMemo2(
    () => buildMuscleMaxLoadLookup(catalog.exercises),
    [catalog.exercises]
  );
  async function loadLibrary(preferred = {}, { silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const library = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:list`);
      const nextCatalog = {
        exercises: Array.isArray(library?.exercises) ? library.exercises : [],
        routines: Array.isArray(library?.routines) ? library.routines : [],
        assignments: Array.isArray(library?.assignments) ? library.assignments : [],
        muscles: Array.isArray(library?.muscles) ? library.muscles : [],
        regions: Array.isArray(library?.regions) ? library.regions : [],
        groups: Array.isArray(library?.groups) ? library.groups : []
      };
      const hasOwnPreferred = (key) => Object.prototype.hasOwnProperty.call(preferred, key);
      const nextExerciseId = hasOwnPreferred("exerciseId") ? preferred.exerciseId : selectedExerciseId;
      const nextMuscleId = hasOwnPreferred("muscleId") ? preferred.muscleId : selectedMuscleId;
      const nextRoutineId = hasOwnPreferred("routineId") ? preferred.routineId : selectedRoutineId;
      const nextAssignmentId = hasOwnPreferred("assignmentId") ? preferred.assignmentId : selectedAssignmentId;
      setCatalog(nextCatalog);
      setSelectedExerciseId(nextExerciseId && nextCatalog.exercises.some((exercise) => exercise.id === nextExerciseId) ? nextExerciseId : null);
      setSelectedMuscleId(nextMuscleId && nextCatalog.muscles.some((muscle) => muscle.id === nextMuscleId) ? nextMuscleId : null);
      setSelectedRoutineId(nextRoutineId && nextCatalog.routines.some((routine) => routine.id === nextRoutineId) ? nextRoutineId : null);
      setSelectedAssignmentId(nextAssignmentId && nextCatalog.assignments.some((assignment) => assignment.id === nextAssignmentId) ? nextAssignmentId : null);
      return nextCatalog;
    } catch (loadError) {
      setError(loadError?.message || "No se pudo cargar el modulo de entrenamiento.");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }
  async function handlePasteMuscleCover(muscle) {
    if (!muscle?.id || !muscle.doc?.itemId || muscleCoverBusyId) return;
    const hasCurrentCover = hasTrainingCoverProperty(muscle.doc);
    if (hasCurrentCover && !window.confirm(`Reemplazar la portada de "${muscle.title}"?`)) {
      return;
    }
    setMuscleCoverBusyId(muscle.id);
    setMuscleCoverNotice("");
    setError("");
    try {
      await pasteTrainingCover({
        doc: muscle.doc,
        muscleId: muscle.id,
        ipcRenderer: ipcRenderer2,
        captureImage: (prefix) => window.nexus.clipboard.captureImage(prefix)
      });
      await loadLibrary({ muscleId: selectedMuscleId }, { silent: true });
      setMuscleCoverNotice(`Portada actualizada para ${muscle.title}.`);
    } catch (pasteError) {
      setError(pasteError?.message || "No se pudo guardar la portada del musculo.");
    } finally {
      setMuscleCoverBusyId(null);
    }
  }
  useEffect4(() => {
    void loadLibrary();
  }, []);
  useEffect4(() => {
    if (!muscleCoverEditMode || mode !== "muscles" || muscleView !== "gallery") {
      return void 0;
    }
    const handlePasteShortcut = (event) => {
      if (event.defaultPrevented || !(event.ctrlKey || event.metaKey) || event.altKey || String(event.key || "").toLowerCase() !== "v" || isTrainingTextEntryElement(event.target) || muscleCoverBusyId) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const muscle = catalog.muscles.find((entry) => entry.id === muscleCoverTargetId) || null;
      if (!muscle) {
        setError("Selecciona primero el musculo cuya portada quieres cambiar.");
        return;
      }
      void handlePasteMuscleCover(muscle);
    };
    window.addEventListener("keydown", handlePasteShortcut, true);
    return () => window.removeEventListener("keydown", handlePasteShortcut, true);
  }, [catalog.muscles, mode, muscleCoverBusyId, muscleCoverEditMode, muscleCoverTargetId, muscleView]);
  useEffect4(() => {
    if (selectedExerciseId && !catalog.exercises.some((exercise) => exercise.id === selectedExerciseId)) {
      setSelectedExerciseId(null);
      setExerciseView("gallery");
    }
  }, [catalog.exercises, selectedExerciseId]);
  useEffect4(() => {
    if (selectedMuscleId && !catalog.muscles.some((muscle) => muscle.id === selectedMuscleId)) {
      setSelectedMuscleId(null);
      setMuscleView("gallery");
    }
  }, [catalog.muscles, selectedMuscleId]);
  useEffect4(() => {
    if (selectedRoutineId && !catalog.routines.some((routine) => routine.id === selectedRoutineId)) {
      setSelectedRoutineId(null);
      setRoutineView("gallery");
    }
  }, [catalog.routines, selectedRoutineId]);
  useEffect4(() => {
    if (selectedAssignmentId && !catalog.assignments.some((assignment) => assignment.id === selectedAssignmentId)) {
      setSelectedAssignmentId(null);
      setAssignmentView("gallery");
    }
  }, [catalog.assignments, selectedAssignmentId]);
  async function hydrateExerciseDetail(exercise, nextView = "preview") {
    if (!exercise) {
      setSelectedExerciseId(null);
      setExerciseDraft(createExerciseDraft());
      setExerciseMarkdown(buildExerciseMarkdownTemplate());
      setExerciseView("gallery");
      return;
    }
    setSelectedExerciseId(exercise.id);
    setExerciseDraft(exerciseRecordToDraft(exercise));
    const fallbackMarkdown = buildExerciseMarkdownTemplate({
      title: exercise.title,
      summary: exercise.summary || exercise.searchSummary || ""
    });
    const loadId = exerciseMarkdownLoadIdRef.current + 1;
    exerciseMarkdownLoadIdRef.current = loadId;
    setExerciseMarkdown(fallbackMarkdown);
    setExerciseView(nextView);
    const nextMarkdown = await readTrainingDocMarkdown(
      exercise.doc,
      fallbackMarkdown
    );
    if (exerciseMarkdownLoadIdRef.current !== loadId) {
      return;
    }
    setExerciseMarkdown(nextMarkdown);
  }
  async function hydrateMuscleDetail(muscle, nextView = "preview") {
    if (!muscle) {
      setSelectedMuscleId(null);
      setMuscleMarkdown("");
      setMuscleView("gallery");
      return;
    }
    setSelectedMuscleId(muscle.id);
    const fallbackMarkdown = buildMuscleMarkdownTemplate(muscle);
    const loadId = muscleMarkdownLoadIdRef.current + 1;
    muscleMarkdownLoadIdRef.current = loadId;
    setMuscleMarkdown(fallbackMarkdown);
    setMuscleView(nextView);
    const nextMarkdown = await readTrainingDocMarkdown(muscle.doc, fallbackMarkdown);
    if (muscleMarkdownLoadIdRef.current !== loadId) {
      return;
    }
    setMuscleMarkdown(nextMarkdown);
  }
  function hydrateRoutineDetail(routine, nextView = "preview") {
    if (!routine) {
      setSelectedRoutineId(null);
      setRoutineDraft(createRoutineDraft());
      setRoutineView("gallery");
      return;
    }
    setSelectedRoutineId(routine.id);
    setRoutineDraft(routineRecordToDraft(routine));
    setRoutineView(nextView);
  }
  function hydrateAssignmentDetail(assignment, nextView = "edit") {
    if (!assignment) {
      setSelectedAssignmentId(null);
      setAssignmentDraft(createAssignmentDraft());
      setAssignmentView("gallery");
      return;
    }
    setSelectedAssignmentId(assignment.id);
    setAssignmentDraft(createAssignmentDraft(assignment));
    setAssignmentView(nextView);
  }
  function openExercisePreviewByRecord(exercise) {
    setMode("exercises");
    setError("");
    void hydrateExerciseDetail(exercise, "preview");
  }
  function openExerciseEditByRecord(exercise) {
    setMode("exercises");
    setError("");
    setExerciseEditorKey(createId("exercise-editor"));
    void hydrateExerciseDetail(exercise, "edit");
  }
  function openMusclePreviewByRecord(muscle) {
    setMode("muscles");
    setMuscleCoverEditMode(false);
    setMuscleCoverTargetId(null);
    setMuscleCoverNotice("");
    setError("");
    void hydrateMuscleDetail(muscle, "preview");
  }
  function openMuscleEditByRecord(muscle) {
    setMode("muscles");
    setError("");
    setMuscleEditorKey(createId("muscle-editor"));
    void hydrateMuscleDetail(muscle, "edit");
  }
  function openRoutinePreviewByRecord(routine) {
    setMode("routines");
    setError("");
    hydrateRoutineDetail(routine, "preview");
  }
  function openRoutineEditByRecord(routine) {
    setMode("routines");
    setError("");
    hydrateRoutineDetail(routine, "edit");
  }
  function openAssignmentEditByRecord(assignment) {
    setMode("assignments");
    setError("");
    hydrateAssignmentDetail(assignment, "edit");
  }
  async function handleSaveExercise() {
    const title = normalizeOptionalText(exerciseDraft.title);
    if (!title) {
      setError("El ejercicio necesita un titulo.");
      return;
    }
    const totalPercentage = sumDraftMusclePercentages(exerciseDraft.muscleLoads || []);
    if (totalPercentage !== 100) {
      setError(`La distribucion muscular debe sumar 100%. Ahora suma ${totalPercentage}%.`);
      return;
    }
    try {
      const response = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-exercise`, {
        id: exerciseDraft.id,
        title,
        exerciseType: exerciseDraft.exerciseType,
        measurementCategory: exerciseDraft.measurementCategory,
        tags: exerciseDraft.tags,
        measurement: draftMetricToPayload(exerciseDraft.measurement, "measurement"),
        muscleLoads: exerciseDraft.muscleLoads.map((entry) => ({
          muscleId: entry.muscleId,
          percentage: entry.percentage
        })),
        templateKey: exerciseDraft.templateKey,
        personalDifficultyScore: normalizeOptionalText(exerciseDraft.personalDifficultyScore) == null ? null : Number(exerciseDraft.personalDifficultyScore),
        docMarkdown: exerciseMarkdown
      });
      const savedExercise = response?.exercise || null;
      const nextCatalog = await loadLibrary({
        exerciseId: savedExercise?.id || null,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: selectedAssignmentId
      });
      openExercisePreviewByRecord(findExerciseById(nextCatalog?.exercises || [], savedExercise?.id || null));
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar el ejercicio.");
    }
  }
  async function handleDeleteExercise() {
    if (!exerciseDraft.id) {
      return;
    }
    if (!window.confirm(`Borrar el ejercicio "${exerciseDraft.title}"?`)) {
      return;
    }
    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-exercise`, { id: exerciseDraft.id });
      setSelectedExerciseId(null);
      setExerciseDraft(createExerciseDraft());
      setExerciseMarkdown(buildExerciseMarkdownTemplate());
      setExerciseView("gallery");
      await loadLibrary({
        exerciseId: null,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: selectedAssignmentId
      });
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar el ejercicio.");
    }
  }
  async function handleOpenDoc(doc) {
    try {
      await openTrainingDoc(ctx, doc);
    } catch (openError) {
      setError(openError?.message || "No se pudo abrir la nota asociada.");
    }
  }
  async function handleSaveMuscle() {
    if (!selectedMuscleId) {
      return;
    }
    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-muscle-doc`, {
        muscleId: selectedMuscleId,
        markdown: muscleMarkdown
      });
      const nextCatalog = await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: selectedAssignmentId
      });
      openMusclePreviewByRecord((nextCatalog?.muscles || []).find((muscle) => muscle.id === selectedMuscleId) || null);
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar la nota del musculo.");
    }
  }
  async function handleSaveRoutine() {
    const title = normalizeOptionalText(routineDraft.title);
    if (!title) {
      setError("La rutina necesita un titulo.");
      return;
    }
    try {
      const response = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-routine`, {
        id: routineDraft.id,
        title,
        summary: normalizeOptionalText(routineDraft.summary),
        structure: routineDraft.structure.map((segment) => segment.type === "block" ? {
          id: segment.id,
          type: "block",
          title: normalizeOptionalText(segment.title) || "Bloque",
          repeatCount: Number(segment.repeatCount || 1) || 1,
          steps: segment.steps.map((step) => ({
            id: step.id,
            type: "step",
            stepKind: step.stepKind,
            exerciseId: step.stepKind === "exercise" ? normalizeOptionalText(step.exerciseId) : null,
            prescription: draftMetricToPayload(step.metric, step.stepKind === "rest" ? "rest" : "exercise")
          }))
        } : {
          id: segment.id,
          type: "step",
          stepKind: segment.stepKind,
          exerciseId: segment.stepKind === "exercise" ? normalizeOptionalText(segment.exerciseId) : null,
          prescription: draftMetricToPayload(segment.metric, segment.stepKind === "rest" ? "rest" : "exercise")
        })
      });
      const savedRoutine = response?.routine || null;
      const nextCatalog = await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: savedRoutine?.id || null,
        assignmentId: selectedAssignmentId
      });
      openRoutinePreviewByRecord(findRoutineById(nextCatalog?.routines || [], savedRoutine?.id || null));
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar la rutina.");
    }
  }
  async function handleDeleteRoutine() {
    if (!routineDraft.id) {
      return;
    }
    if (!window.confirm(`Borrar la rutina "${routineDraft.title}"?`)) {
      return;
    }
    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-routine`, { id: routineDraft.id });
      setSelectedRoutineId(null);
      setRoutineDraft(createRoutineDraft());
      setRoutineView("gallery");
      await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: null,
        assignmentId: selectedAssignmentId
      });
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar la rutina.");
    }
  }
  async function handleSaveAssignment() {
    try {
      const payload = normalizeTrainingAssignmentInput({
        id: assignmentDraft.id,
        routineId: assignmentDraft.routineId,
        scheduleType: assignmentDraft.scheduleType,
        scheduleConfigJson: {
          weekdays: assignmentDraft.weekdays
        },
        startDate: assignmentDraft.startDate,
        endDate: assignmentDraft.endDate,
        time: assignmentDraft.time,
        priority: assignmentDraft.priority,
        status: assignmentDraft.status,
        completionMode: assignmentDraft.completionMode
      });
      const response = await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:save-assignment`, {
        id: assignmentDraft.id,
        ...payload
      });
      const savedAssignment = response?.assignment || null;
      const nextCatalog = await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: savedAssignment?.id || null
      });
      openAssignmentEditByRecord(
        (nextCatalog?.assignments || []).find((assignment) => assignment.id === savedAssignment?.id) || null
      );
    } catch (saveError) {
      setError(saveError?.message || "No se pudo guardar la rutina programada.");
    }
  }
  async function handleDeleteAssignment() {
    if (!assignmentDraft.id) {
      return;
    }
    if (!window.confirm("Borrar esta rutina programada?")) {
      return;
    }
    try {
      await invoke(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX}:delete-assignment`, { id: assignmentDraft.id });
      setSelectedAssignmentId(null);
      setAssignmentDraft(createAssignmentDraft());
      setAssignmentView("gallery");
      await loadLibrary({
        exerciseId: selectedExerciseId,
        muscleId: selectedMuscleId,
        routineId: selectedRoutineId,
        assignmentId: null
      });
    } catch (deleteError) {
      setError(deleteError?.message || "No se pudo borrar la rutina programada.");
    }
  }
  function createExercise() {
    setMode("exercises");
    setSelectedExerciseId(null);
    setExerciseDraft(createExerciseDraft());
    setExerciseMarkdown(buildExerciseMarkdownTemplate());
    setExerciseEditorKey(createId("exercise-editor"));
    setExerciseView("edit");
    setError("");
  }
  function createRoutine() {
    setMode("routines");
    setSelectedRoutineId(null);
    setRoutineDraft(createRoutineDraft());
    setRoutineView("edit");
    setError("");
  }
  function createAssignment(prefill = null) {
    setMode("assignments");
    setSelectedAssignmentId(null);
    setAssignmentDraft(createAssignmentDraft(prefill));
    setAssignmentView("edit");
    setError("");
  }
  function openAssignmentFromRoutine(routine) {
    createAssignment({
      routineId: routine?.id || ""
    });
  }
  function activateMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMuscleCoverEditMode(false);
    setMuscleCoverTargetId(null);
    setMuscleCoverNotice("");
    if (nextMode === "exercises") {
      setExerciseView("gallery");
    } else if (nextMode === "muscles") {
      setMuscleView("gallery");
    } else if (nextMode === "routines") {
      setRoutineView("gallery");
    } else {
      setAssignmentView("gallery");
    }
  }
  function renderExerciseGallery() {
    return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack" }, /* @__PURE__ */ React4.createElement(
      TrainingGalleryHeader,
      {
        eyebrow: "Entrenamiento",
        title: "Ejercicios",
        countLabel: formatTrainingCount(filteredExercises.length, "ejercicio"),
        searchValue: exerciseSearch,
        searchPlaceholder: "Buscar ejercicios",
        onSearchChange: setExerciseSearch,
        filters: /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(InlineField, { label: "Tipo" }, /* @__PURE__ */ React4.createElement("select", { value: exerciseTypeFilter, onChange: (event) => setExerciseTypeFilter(event.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Todos"), TRAINING_EXERCISE_TYPE_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React4.createElement(InlineField, { label: "Perfil" }, /* @__PURE__ */ React4.createElement("select", { value: exerciseCategoryFilter, onChange: (event) => setExerciseCategoryFilter(event.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Todos"), TRAINING_MEASUREMENT_CATEGORY_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label)))), /* @__PURE__ */ React4.createElement(InlineField, { label: "Tag" }, /* @__PURE__ */ React4.createElement("select", { value: exerciseTagFilter, onChange: (event) => setExerciseTagFilter(event.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Todos"), TRAINING_EXERCISE_TAG_OPTIONS.map((option) => /* @__PURE__ */ React4.createElement("option", { key: option.value, value: option.value }, option.label))))),
        actions: /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: createExercise }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Nuevo"))
      }
    ), filteredExercises.length ? /* @__PURE__ */ React4.createElement(GalleryGrid, { className: "trainingPlugin__galleryGrid" }, filteredExercises.map((exercise) => /* @__PURE__ */ React4.createElement(
      TrainingGalleryCard,
      {
        key: exercise.id,
        title: exercise.title,
        summary: buildTrainingExerciseSummary(exercise) || "Sin resumen",
        meta: buildExerciseTypeAndDifficultyMeta(exercise),
        active: selectedExerciseId === exercise.id,
        onClick: () => openExercisePreviewByRecord(exercise)
      }
    ))) : /* @__PURE__ */ React4.createElement(StateBlock, { centered: true, title: "Sin ejercicios", description: "Crea el primero desde el boton +." }));
  }
  function renderMuscleGallery() {
    return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack" }, /* @__PURE__ */ React4.createElement(
      TrainingGalleryHeader,
      {
        eyebrow: "Entrenamiento",
        title: "Musculos",
        countLabel: formatTrainingCount(filteredMuscles.length, "musculo", "musculos"),
        searchValue: muscleSearch,
        searchPlaceholder: "Buscar musculos",
        onSearchChange: setMuscleSearch,
        filters: /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement(InlineField, { label: "Region" }, /* @__PURE__ */ React4.createElement("select", { value: regionFilter, onChange: (event) => setRegionFilter(event.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Todas"), (catalog.regions || []).map((region) => /* @__PURE__ */ React4.createElement("option", { key: region.id, value: region.id }, region.title)))), /* @__PURE__ */ React4.createElement(InlineField, { label: "Grupo" }, /* @__PURE__ */ React4.createElement("select", { value: groupFilter, onChange: (event) => setGroupFilter(event.target.value) }, /* @__PURE__ */ React4.createElement("option", { value: "" }, "Todos"), visibleGroupOptions.map((group) => /* @__PURE__ */ React4.createElement("option", { key: group.id, value: group.id }, group.title))))),
        actions: /* @__PURE__ */ React4.createElement(
          Button,
          {
            type: "button",
            tone: muscleCoverEditMode ? "primary" : "secondary",
            onClick: () => {
              setMuscleCoverEditMode((current) => !current);
              setMuscleCoverTargetId(null);
              setMuscleCoverNotice("");
              setError("");
            }
          },
          muscleCoverEditMode ? "Terminar" : "Editar portadas"
        )
      }
    ), muscleCoverEditMode ? /* @__PURE__ */ React4.createElement(Notice, null, "Selecciona un musculo y pega una imagen con Ctrl+V.") : null, muscleCoverNotice ? /* @__PURE__ */ React4.createElement(Notice, { tone: "success" }, muscleCoverNotice) : null, filteredMuscles.length ? /* @__PURE__ */ React4.createElement(GalleryGrid, { className: "trainingPlugin__galleryGrid" }, filteredMuscles.map((muscle) => /* @__PURE__ */ React4.createElement(
      TrainingGalleryCard,
      {
        key: muscle.id,
        title: muscle.title,
        summary: [muscle.groupTitle, muscle.regionTitle].filter(Boolean).join(" - "),
        meta: buildMuscleMaxLoadSummary(muscle.id, muscleMaxLoadLookup),
        active: muscleCoverEditMode ? muscleCoverTargetId === muscle.id : selectedMuscleId === muscle.id,
        editMode: muscleCoverEditMode,
        busy: muscleCoverBusyId === muscle.id,
        media: /* @__PURE__ */ React4.createElement(
          TrainingCoverMedia,
          {
            doc: muscle.doc,
            title: muscle.title,
            editMode: muscleCoverEditMode,
            selected: muscleCoverTargetId === muscle.id,
            busy: muscleCoverBusyId === muscle.id
          }
        ),
        onClick: () => {
          if (muscleCoverEditMode) {
            setMuscleCoverTargetId(muscle.id);
            setMuscleCoverNotice("");
            setError("");
            return;
          }
          openMusclePreviewByRecord(muscle);
        }
      }
    ))) : /* @__PURE__ */ React4.createElement(StateBlock, { centered: true, title: "Sin musculos", description: "Ajusta la busqueda o los filtros." }));
  }
  function renderRoutineGallery() {
    return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack" }, /* @__PURE__ */ React4.createElement(
      TrainingGalleryHeader,
      {
        eyebrow: "Entrenamiento",
        title: "Rutinas",
        countLabel: formatTrainingCount(filteredRoutines.length, "rutina"),
        searchValue: routineSearch,
        searchPlaceholder: "Buscar rutinas",
        onSearchChange: setRoutineSearch,
        actions: /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: createRoutine }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Nuevo"))
      }
    ), filteredRoutines.length ? /* @__PURE__ */ React4.createElement(GalleryGrid, { className: "trainingPlugin__galleryGrid" }, filteredRoutines.map((routine) => /* @__PURE__ */ React4.createElement(
      TrainingGalleryCard,
      {
        key: routine.id,
        title: routine.title,
        summary: routine.searchSummary || routine.summary || buildTrainingRoutineSummary(routine),
        active: selectedRoutineId === routine.id,
        onClick: () => openRoutinePreviewByRecord(routine)
      }
    ))) : /* @__PURE__ */ React4.createElement(StateBlock, { centered: true, title: "Sin rutinas", description: "Crea la primera desde el boton +." }));
  }
  function renderAssignmentGallery() {
    return /* @__PURE__ */ React4.createElement(PanelStack, { className: "trainingPlugin__detailStack" }, /* @__PURE__ */ React4.createElement(
      TrainingGalleryHeader,
      {
        eyebrow: "Entrenamiento",
        title: "Programadas",
        countLabel: formatTrainingCount(filteredAssignments.length, "programada"),
        searchValue: assignmentSearch,
        searchPlaceholder: "Buscar programadas",
        onSearchChange: setAssignmentSearch,
        actions: /* @__PURE__ */ React4.createElement(Button, { type: "button", tone: "primary", onClick: () => createAssignment() }, /* @__PURE__ */ React4.createElement(PlusIcon, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Nueva"))
      }
    ), filteredAssignments.length ? /* @__PURE__ */ React4.createElement(GalleryGrid, { className: "trainingPlugin__galleryGrid" }, filteredAssignments.map((assignment) => /* @__PURE__ */ React4.createElement(
      TrainingGalleryCard,
      {
        key: assignment.id,
        title: assignment.routine?.title || "Rutina programada",
        summary: assignment.searchSummary || assignment.status || "Sin resumen",
        meta: assignment.status === "archived" ? "Archivada" : "Activa",
        active: selectedAssignmentId === assignment.id,
        onClick: () => openAssignmentEditByRecord(assignment)
      }
    ))) : /* @__PURE__ */ React4.createElement(
      StateBlock,
      {
        centered: true,
        title: "Sin programadas",
        description: catalog.routines.length ? "Crea una programacion nueva cuando la necesites." : "Primero crea una rutina."
      }
    ));
  }
  function renderModeContent() {
    if (mode === "exercises") {
      if (exerciseView === "preview") {
        return /* @__PURE__ */ React4.createElement(
          ExercisePreview,
          {
            exercise: selectedExercise,
            markdown: exerciseMarkdown,
            onBack: () => setExerciseView("gallery"),
            onEdit: () => openExerciseEditByRecord(selectedExercise),
            onOpenDoc: handleOpenDoc
          }
        );
      }
      if (exerciseView === "edit") {
        return /* @__PURE__ */ React4.createElement(
          ExerciseEditor,
          {
            selectedExercise,
            exerciseDraft,
            setExerciseDraft,
            exerciseMarkdown,
            setExerciseMarkdown,
            editorKey: exerciseEditorKey,
            handleSaveExercise,
            handleDeleteExercise,
            handleOpenDoc,
            onCancel: () => {
              if (selectedExercise?.id) {
                openExercisePreviewByRecord(selectedExercise);
                return;
              }
              setExerciseView("gallery");
            },
            catalog,
            muscleSearch,
            setMuscleSearch,
            regionFilter,
            setRegionFilter,
            groupFilter,
            setGroupFilter
          }
        );
      }
      return renderExerciseGallery();
    }
    if (mode === "muscles") {
      if (muscleView === "preview") {
        return /* @__PURE__ */ React4.createElement(
          MusclePreview,
          {
            muscle: selectedMuscle,
            markdown: muscleMarkdown,
            onBack: () => setMuscleView("gallery"),
            onEdit: () => openMuscleEditByRecord(selectedMuscle),
            onOpenDoc: handleOpenDoc
          }
        );
      }
      if (muscleView === "edit") {
        return /* @__PURE__ */ React4.createElement(
          MuscleEditor,
          {
            muscle: selectedMuscle,
            markdown: muscleMarkdown,
            editorKey: muscleEditorKey,
            onChangeMarkdown: setMuscleMarkdown,
            onCancel: () => openMusclePreviewByRecord(selectedMuscle),
            onSave: handleSaveMuscle,
            onOpenDoc: handleOpenDoc
          }
        );
      }
      return renderMuscleGallery();
    }
    if (mode === "routines") {
      if (routineView === "preview") {
        return /* @__PURE__ */ React4.createElement(
          RoutinePreview,
          {
            routine: selectedRoutine,
            exercises: catalog.exercises,
            onBack: () => setRoutineView("gallery"),
            onEdit: () => openRoutineEditByRecord(selectedRoutine),
            onAssign: openAssignmentFromRoutine
          }
        );
      }
      if (routineView === "edit") {
        return /* @__PURE__ */ React4.createElement(
          RoutineEditor,
          {
            selectedRoutine,
            routineDraft,
            setRoutineDraft,
            catalog,
            handleSaveRoutine,
            handleDeleteRoutine,
            openAssignmentFromRoutine,
            onCancel: () => {
              if (selectedRoutine?.id) {
                openRoutinePreviewByRecord(selectedRoutine);
                return;
              }
              setRoutineView("gallery");
            }
          }
        );
      }
      return renderRoutineGallery();
    }
    if (assignmentView === "edit") {
      return /* @__PURE__ */ React4.createElement(
        AssignmentEditor,
        {
          selectedAssignment,
          assignmentDraft,
          setAssignmentDraft,
          routines: catalog.routines,
          handleSaveAssignment,
          handleDeleteAssignment,
          onCancel: () => setAssignmentView("gallery")
        }
      );
    }
    return renderAssignmentGallery();
  }
  const pageContent = /* @__PURE__ */ React4.createElement(React4.Fragment, null, showTopbar ? /* @__PURE__ */ React4.createElement(WorkspaceTopbar, null, /* @__PURE__ */ React4.createElement(
    WorkspaceTitle,
    {
      eyebrow: "Life Tracker",
      title: "Entrenamientos"
    }
  ), /* @__PURE__ */ React4.createElement(ToolbarActions, null, /* @__PURE__ */ React4.createElement(Button, { type: "button", onClick: () => void loadLibrary() }, /* @__PURE__ */ React4.createElement(RefreshIcon2, { size: 16 }), /* @__PURE__ */ React4.createElement("span", null, "Refrescar")))) : null, /* @__PURE__ */ React4.createElement(WorkspaceBody, { className: "trainingPlugin__body" }, /* @__PURE__ */ React4.createElement(SplitLayout, { className: "trainingPlugin__content trainingPlugin__content--compact", variant: "sidebar-detail" }, /* @__PURE__ */ React4.createElement(SplitSidebar, { className: "trainingPlugin__rail" }, /* @__PURE__ */ React4.createElement(
    TrainingSectionRail,
    {
      mode,
      catalog,
      onChange: activateMode,
      onRefresh: () => loadLibrary(),
      showRefresh: !showTopbar || isEmbedded
    }
  )), /* @__PURE__ */ React4.createElement(SplitDetail, { className: "trainingPlugin__detail" }, /* @__PURE__ */ React4.createElement(ScrollRegion, { className: "trainingPlugin__detailScroll" }, error ? /* @__PURE__ */ React4.createElement(Notice, { tone: "danger" }, error) : null, loading ? /* @__PURE__ */ React4.createElement(
    StateBlock,
    {
      eyebrow: "Cargando",
      title: "Cargando entrenamiento"
    }
  ) : renderModeContent())))));
  if (isEmbedded) {
    return /* @__PURE__ */ React4.createElement("div", { className: "trainingPlugin trainingPlugin--embedded" }, pageContent);
  }
  return /* @__PURE__ */ React4.createElement(WorkspacePage, { className: "trainingPlugin" }, pageContent);
}
var TrainingView_default = TrainingView;

// life-tracker/src/training/home-modals.jsx
init_define_process();

// life-tracker/src/constants.js
init_define_process();
var LIFE_TRACKER_PLUGIN_ID = "nexus.life-tracker";
var LIFE_TRACKER_WORKSPACE_VIEW_ID = "nexus.life-tracker.workspace";
var LIFE_TRACKER_CANVAS_STATE_KEY = "lifeTrackerCanvases";
var LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY = "lifeTrackerHabitCategoryPresetOverrides";
var LIFE_TRACKER_LEGACY_DASHBOARD_LAYOUTS_KEY = "dashboardLayouts";
var LIFE_TRACKER_LEGACY_HABIT_CATEGORY_PRESET_OVERRIDES_KEY = "categoryPresetOverrides";
var LIFE_TRACKER_DEFAULT_SECTION = "home";
var LIFE_TRACKER_SECTION_OPTIONS = [
  { value: "home", label: "Inicio" },
  { value: "finance", label: "Dinero" },
  { value: "training", label: "Entrenamiento" }
];
var WEEKDAY_OPTIONS2 = [
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
var HABIT_EDITOR_STEPS = [
  { value: 0, label: "Categoria" },
  { value: 1, label: "Evaluacion" },
  { value: 2, label: "Frecuencia" },
  { value: 3, label: "Operativa" }
];

// life-tracker/src/training/home-modals.jsx
var React5 = window.React;
var ASSIGNMENT_STATUS_OPTIONS2 = [
  { value: "active", label: "Activa" },
  { value: "archived", label: "Archivada" }
];
var COMPLETION_MODE_OPTIONS2 = [
  { value: "yes-no", label: "Si/No" },
  { value: "detailed", label: "Detallada" }
];
var SCHEDULE_TYPE_OPTIONS2 = [
  { value: "daily", label: "Diaria" },
  { value: "weekdays", label: "Dias fijos" }
];
function todayDateValue() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function createMetricDraft(source = {}, fallbackMode = "reps") {
  const normalized = normalizeTrainingPrescription(source);
  const mode = normalized.mode || fallbackMode || "reps";
  return {
    mode,
    reps: normalized.reps == null ? "" : String(normalized.reps),
    seconds: normalized.seconds == null ? "" : String(normalized.seconds),
    distance: normalized.distance == null ? "" : String(normalized.distance),
    distanceUnit: normalized.distanceUnit || normalized.unit || "m",
    weight: normalized.weight == null ? "" : String(normalized.weight),
    weightUnit: normalized.weightUnit || normalized.unit || "kg",
    tempo: normalized.tempo || "",
    notes: normalized.notes || ""
  };
}
function metricDraftToPayload(draft = {}) {
  return normalizeTrainingPrescription({
    mode: draft.mode,
    reps: draft.reps,
    seconds: draft.seconds,
    distance: draft.distance,
    distanceUnit: draft.distanceUnit,
    weight: draft.weight,
    weightUnit: draft.weightUnit,
    tempo: draft.tempo,
    notes: draft.notes
  });
}
function hasMeaningfulMetricPayload(payload = {}) {
  return ["reps", "seconds", "distance", "weight", "tempo", "notes"].some((field) => payload?.[field] != null && payload[field] !== "");
}
function findRoutineById2(routines = [], routineId = "") {
  return routines.find((entry) => entry.id === routineId) || null;
}
function normalizeWeekdaysSource(source = null) {
  return Array.isArray(source?.scheduleConfigJson?.weekdays) ? source.scheduleConfigJson.weekdays : [1, 2, 3, 4, 5];
}
function createRoutineAssignmentDraft(source = null) {
  return {
    id: source?.id || "",
    routineId: source?.routineId || source?.routine?.id || "",
    scheduleType: source?.scheduleType || "daily",
    weekdays: normalizeWeekdaysSource(source),
    startDate: source?.startDate || todayDateValue(),
    endDate: source?.endDate || "",
    time: source?.time || "",
    priority: String(source?.priority || 1),
    status: source?.status === "archived" ? "archived" : "active",
    completionMode: normalizeTrainingCompletionMode(source?.completionMode, "yes-no")
  };
}
function buildExistingResultEntryLookup(item = null) {
  const resultEntries = Array.isArray(item?.resultJson?.entries) ? item.resultJson.entries : [];
  const lookup = /* @__PURE__ */ new Map();
  for (const entry of resultEntries) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    if (entry.stepId) {
      lookup.set(`step:${entry.stepId}`, entry);
    }
    if (entry.exerciseId) {
      lookup.set(`exercise:${entry.exerciseId}`, entry);
    }
    if (entry.id) {
      lookup.set(`id:${entry.id}`, entry);
    }
  }
  return lookup;
}
function getDetailedStepMode(step = null) {
  const prescription = normalizeTrainingPrescription(step?.prescription || step?.metric || {});
  const measurement = normalizeTrainingMeasurement(
    step?.resolvedExercise?.measurement || step?.exerciseMeasurementSnapshot || {}
  );
  return prescription.mode || measurement.mode || "reps";
}
function createRoutineCaptureDraft(item = null) {
  const routine = item?.routine || item?.assignment?.routine || null;
  const structure = Array.isArray(routine?.structure) ? routine.structure : [];
  const existingLookup = buildExistingResultEntryLookup(item);
  const steps2 = flattenTrainingStructureSteps(structure).filter((entry) => entry?.type === "step").filter((entry) => String(entry?.stepKind || entry?.kind || "exercise").trim().toLowerCase() !== "rest").map((step, index) => {
    const mode = getDetailedStepMode(step);
    const prescription = normalizeTrainingPrescription(step.prescription || step.metric || { mode });
    const measurement = normalizeTrainingMeasurement(
      step?.resolvedExercise?.measurement || step?.exerciseMeasurementSnapshot || { mode }
    );
    const existingResult = existingLookup.get(`step:${step.id}`) || existingLookup.get(`exercise:${step.exerciseId}`) || existingLookup.get(`id:${step.id}`) || null;
    const existingActual = normalizeTrainingPrescription(existingResult?.actual || {});
    const actualSeed = Object.keys(existingActual).length ? existingActual : prescription;
    return {
      id: String(step.id || `step-${index + 1}`),
      stepId: step.id || null,
      exerciseId: step.exerciseId || step?.resolvedExercise?.id || null,
      title: step?.resolvedExercise?.title || step.exerciseTitleSnapshot || step.title || `Ejercicio ${index + 1}`,
      blockTitle: step.parentBlockTitle || "",
      blockRepeatCount: Number.isFinite(Number(step.parentBlockRepeatCount)) ? Number(step.parentBlockRepeatCount) : null,
      measurement: {
        ...measurement,
        mode
      },
      prescription,
      actual: createMetricDraft(actualSeed, mode)
    };
  });
  return {
    itemId: item?.id || "",
    assignmentId: item?.assignmentId || item?.assignment?.id || "",
    occurrenceDate: item?.raw?.occurrenceDate || item?.date || todayDateValue(),
    title: item?.title || routine?.title || "Rutina programada",
    summary: item?.summary || routine?.searchSummary || "",
    status: item?.status || "pending",
    completionMode: normalizeTrainingCompletionMode(item?.completionMode, "detailed"),
    steps: steps2
  };
}
function serializeRoutineCaptureDraft(draft = null) {
  return {
    mode: "detailed",
    entries: Array.isArray(draft?.steps) ? draft.steps.map((step) => {
      const actual = metricDraftToPayload(step.actual);
      if (!hasMeaningfulMetricPayload(actual)) {
        return null;
      }
      return {
        id: step.id || null,
        stepId: step.stepId || null,
        exerciseId: step.exerciseId || null,
        title: step.title || "Ejercicio",
        actual
      };
    }).filter(Boolean) : []
  };
}
function TrainingMetricFields({ value, onChange }) {
  const mode = value?.mode || "reps";
  const updateField = (field) => (event) => {
    onChange({
      ...value,
      [field]: event.target.value
    });
  };
  return /* @__PURE__ */ React5.createElement(FieldGrid, null, mode === "time" ? /* @__PURE__ */ React5.createElement(Field, { label: "Segundos" }, /* @__PURE__ */ React5.createElement("input", { type: "number", min: "0", value: value.seconds, onChange: updateField("seconds"), placeholder: "60" })) : null, mode === "distance" ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(Field, { label: "Distancia" }, /* @__PURE__ */ React5.createElement("input", { type: "number", min: "0", value: value.distance, onChange: updateField("distance"), placeholder: "500" })), /* @__PURE__ */ React5.createElement(Field, { label: "Unidad" }, /* @__PURE__ */ React5.createElement("input", { type: "text", value: value.distanceUnit, onChange: updateField("distanceUnit"), placeholder: "m" }))) : null, mode === "weight" ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(Field, { label: "Peso" }, /* @__PURE__ */ React5.createElement("input", { type: "number", min: "0", value: value.weight, onChange: updateField("weight"), placeholder: "20" })), /* @__PURE__ */ React5.createElement(Field, { label: "Unidad" }, /* @__PURE__ */ React5.createElement("input", { type: "text", value: value.weightUnit, onChange: updateField("weightUnit"), placeholder: "kg" }))) : null, mode === "reps" ? /* @__PURE__ */ React5.createElement(Field, { label: "Repeticiones" }, /* @__PURE__ */ React5.createElement("input", { type: "number", min: "0", value: value.reps, onChange: updateField("reps"), placeholder: "12" })) : null, mode === "reps" || mode === "weight" ? /* @__PURE__ */ React5.createElement(Field, { label: "Tempo" }, /* @__PURE__ */ React5.createElement("input", { type: "text", value: value.tempo, onChange: updateField("tempo"), placeholder: "2-0-2" })) : null, /* @__PURE__ */ React5.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React5.createElement("input", { type: "text", value: value.notes, onChange: updateField("notes"), placeholder: "Opcional" })));
}
function RoutineAssignmentModal({
  draft,
  routines = [],
  loading = false,
  error = "",
  saving = false,
  onChange,
  onToggleWeekday,
  onSave,
  onDelete,
  onCancel,
  onOpenTrainingSection
}) {
  const selectedRoutine = findRoutineById2(routines, draft?.routineId);
  return /* @__PURE__ */ React5.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel lifeTrackerTrainingModal" }, /* @__PURE__ */ React5.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React5.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React5.createElement(Button, { type: "button", tone: "primary", disabled: loading || saving, onClick: () => void onSave?.() }, "Guardar programacion"), draft?.id ? /* @__PURE__ */ React5.createElement(Button, { type: "button", tone: "danger", disabled: saving, onClick: () => void onDelete?.() }, "Eliminar") : null, /* @__PURE__ */ React5.createElement(Button, { type: "button", disabled: saving, onClick: onCancel }, "Cancelar"))
    },
    /* @__PURE__ */ React5.createElement(
      PanelTitle,
      {
        title: draft?.id ? "Editar rutina programada" : "Rutina de ejercicios",
        description: "Selecciona una rutina existente y define su calendario."
      }
    )
  ), /* @__PURE__ */ React5.createElement("div", { className: "lifeTrackerTrainingModal__content" }, error ? /* @__PURE__ */ React5.createElement(Notice, { tone: "danger" }, error) : null, loading ? /* @__PURE__ */ React5.createElement(StateBlock, { title: "Cargando rutinas...", description: "Estamos preparando el catalogo de entrenamiento." }) : null, !loading && !routines.length ? /* @__PURE__ */ React5.createElement("div", { className: "lifeTrackerTrainingModal__emptyState" }, /* @__PURE__ */ React5.createElement(
    StateBlock,
    {
      title: "Primero necesitamos una rutina",
      description: "Crea al menos una rutina en Entrenamientos para poder programarla desde Life Tracker."
    }
  ), /* @__PURE__ */ React5.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React5.createElement(Button, { type: "button", tone: "secondary", onClick: onOpenTrainingSection }, "Abrir entrenamientos"))) : null, !loading && routines.length ? /* @__PURE__ */ React5.createElement("div", { className: "lifeTrackerTrainingModal__stack" }, /* @__PURE__ */ React5.createElement(FieldGrid, null, /* @__PURE__ */ React5.createElement(Field, { label: "Rutina", wide: true }, /* @__PURE__ */ React5.createElement("select", { value: draft.routineId, onChange: (event) => onChange?.("routineId", event.target.value) }, /* @__PURE__ */ React5.createElement("option", { value: "" }, "Selecciona una rutina"), routines.map((routine) => /* @__PURE__ */ React5.createElement("option", { key: routine.id, value: routine.id }, routine.title))))), /* @__PURE__ */ React5.createElement(FieldGrid, null, /* @__PURE__ */ React5.createElement(Field, { label: "Recurrencia", wide: true }, /* @__PURE__ */ React5.createElement(
    SegmentedControl,
    {
      ariaLabel: "Recurrencia",
      options: SCHEDULE_TYPE_OPTIONS2,
      value: draft.scheduleType,
      onChange: (value) => onChange?.("scheduleType", value)
    }
  )), /* @__PURE__ */ React5.createElement(Field, { label: "Completicion", wide: true }, /* @__PURE__ */ React5.createElement(
    SegmentedControl,
    {
      ariaLabel: "Modo de completicion",
      options: COMPLETION_MODE_OPTIONS2,
      value: draft.completionMode,
      onChange: (value) => onChange?.("completionMode", value)
    }
  ))), draft.scheduleType === "weekdays" ? /* @__PURE__ */ React5.createElement("div", { className: "trainingPlugin__weekdayRow lifeTrackerTrainingModal__weekdayRow" }, WEEKDAY_OPTIONS2.map((weekday) => {
    const active = draft.weekdays.includes(weekday.value);
    return /* @__PURE__ */ React5.createElement(
      "button",
      {
        key: weekday.value,
        type: "button",
        className: ["trainingPlugin__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" "),
        onClick: () => onToggleWeekday?.(weekday.value)
      },
      weekday.label
    );
  })) : null, /* @__PURE__ */ React5.createElement(FieldGrid, null, /* @__PURE__ */ React5.createElement(Field, { label: "Inicio" }, /* @__PURE__ */ React5.createElement("input", { type: "date", value: draft.startDate, onChange: (event) => onChange?.("startDate", event.target.value) })), /* @__PURE__ */ React5.createElement(Field, { label: "Fin" }, /* @__PURE__ */ React5.createElement("input", { type: "date", value: draft.endDate, onChange: (event) => onChange?.("endDate", event.target.value) })), /* @__PURE__ */ React5.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React5.createElement("input", { type: "time", value: draft.time, onChange: (event) => onChange?.("time", event.target.value) })), /* @__PURE__ */ React5.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React5.createElement("input", { type: "number", min: "1", max: "100", value: draft.priority, onChange: (event) => onChange?.("priority", event.target.value) })), /* @__PURE__ */ React5.createElement(Field, { label: "Estado" }, /* @__PURE__ */ React5.createElement("select", { value: draft.status, onChange: (event) => onChange?.("status", event.target.value) }, ASSIGNMENT_STATUS_OPTIONS2.map((option) => /* @__PURE__ */ React5.createElement("option", { key: option.value, value: option.value }, option.label))))), /* @__PURE__ */ React5.createElement("div", { className: "trainingPlugin__mutedBlock" }, selectedRoutine ? selectedRoutine.searchSummary || "Rutina lista para programar." : "Selecciona una rutina para continuar.")) : null));
}
function normalizeRoutineAssignmentPayload(draft = null) {
  return normalizeTrainingAssignmentInput({
    ...draft,
    scheduleConfigJson: {
      weekdays: draft?.scheduleType === "weekdays" ? draft?.weekdays : []
    }
  });
}
function RoutineCaptureModal({
  draft,
  error = "",
  saving = false,
  onChangeStep,
  onSave,
  onClear,
  onCancel
}) {
  const stepCount = Array.isArray(draft?.steps) ? draft.steps.length : 0;
  return /* @__PURE__ */ React5.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel lifeTrackerTrainingModal" }, /* @__PURE__ */ React5.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React5.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React5.createElement(Button, { type: "button", tone: "primary", disabled: !stepCount || saving, onClick: () => void onSave?.() }, "Guardar resultado"), draft?.status === "completed" ? /* @__PURE__ */ React5.createElement(Button, { type: "button", tone: "danger", disabled: saving, onClick: () => void onClear?.() }, "Quitar resultado") : null, /* @__PURE__ */ React5.createElement(Button, { type: "button", disabled: saving, onClick: onCancel }, "Cancelar"))
    },
    /* @__PURE__ */ React5.createElement(
      PanelTitle,
      {
        title: draft?.title || "Rutina detallada",
        description: draft?.occurrenceDate ? `Captura detallada del ${draft.occurrenceDate}.` : "Carga resultados por ejercicio."
      }
    )
  ), /* @__PURE__ */ React5.createElement("div", { className: "lifeTrackerTrainingModal__content" }, error ? /* @__PURE__ */ React5.createElement(Notice, { tone: "danger" }, error) : null, draft?.summary ? /* @__PURE__ */ React5.createElement("div", { className: "trainingPlugin__mutedBlock" }, draft.summary) : null, !stepCount ? /* @__PURE__ */ React5.createElement(
    StateBlock,
    {
      title: "No hay ejercicios para registrar",
      description: "La rutina no tiene pasos de ejercicio disponibles para captura detallada."
    }
  ) : /* @__PURE__ */ React5.createElement("div", { className: "lifeTrackerTrainingModal__captureList" }, draft.steps.map((step, index) => {
    const mode = step?.actual?.mode || step?.measurement?.mode || "reps";
    const prescriptionSummary = buildTrainingMetricSummary(step.prescription);
    const measurementSummary = buildTrainingMeasurementUnitSummary(step.measurement) || mode;
    return /* @__PURE__ */ React5.createElement("section", { key: step.id || `capture-step-${index + 1}`, className: "lifeTrackerTrainingModal__captureCard" }, /* @__PURE__ */ React5.createElement("div", { className: "lifeTrackerTrainingModal__captureHeader" }, /* @__PURE__ */ React5.createElement("div", { className: "trainingPlugin__sectionIntro trainingPlugin__sectionIntro--compact" }, /* @__PURE__ */ React5.createElement("strong", null, step.title), /* @__PURE__ */ React5.createElement("span", null, step.blockTitle ? `${step.blockTitle}${step.blockRepeatCount ? ` x${step.blockRepeatCount}` : ""}` : `Paso ${index + 1}`)), /* @__PURE__ */ React5.createElement("div", { className: "lifeTrackerTrainingModal__captureMeta" }, /* @__PURE__ */ React5.createElement("span", null, measurementSummary), prescriptionSummary ? /* @__PURE__ */ React5.createElement("span", null, prescriptionSummary) : null)), /* @__PURE__ */ React5.createElement(
      TrainingMetricFields,
      {
        value: step.actual,
        onChange: (nextValue) => onChangeStep?.(step.id, {
          ...nextValue,
          mode
        })
      }
    ));
  }))));
}

// life-tracker/src/training/plugin-settings.js
init_define_process();
var TRAINING_SETTINGS_DEFAULTS = Object.freeze({
  muscleConceptsDirectory: "Concepts/Muscles"
});

// life-tracker/src/icons.jsx
init_define_process();
function BaseIcon3({ children }) {
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
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("rect", { x: "4", y: "5", width: "16", height: "15", rx: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M8 10h8" }), /* @__PURE__ */ React.createElement("path", { d: "M8 14h5" }), /* @__PURE__ */ React.createElement("path", { d: "M8 7.5v5" }));
}
function ClockIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "8" }), /* @__PURE__ */ React.createElement("path", { d: "M12 8v4.5" }), /* @__PURE__ */ React.createElement("path", { d: "m12 12.5 3 1.75" }));
}
function PlusIcon2() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("path", { d: "M12 5v14" }), /* @__PURE__ */ React.createElement("path", { d: "M5 12h14" }));
}
function CheckIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("path", { d: "m5 12 4 4 10-10" }));
}
function PencilIcon2() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("path", { d: "M12 20h9" }), /* @__PURE__ */ React.createElement("path", { d: "m16.5 3.5 4 4L8 20l-4 1 1-4z" }));
}
function TrashIcon2() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("path", { d: "M4 7h16" }), /* @__PURE__ */ React.createElement("path", { d: "M9 7V4h6v3" }), /* @__PURE__ */ React.createElement("path", { d: "M8 10v8" }), /* @__PURE__ */ React.createElement("path", { d: "M12 10v8" }), /* @__PURE__ */ React.createElement("path", { d: "M16 10v8" }));
}
function ChevronLeftIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("path", { d: "m15 18-6-6 6-6" }));
}
function ChevronRightIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("path", { d: "m9 18 6-6-6-6" }));
}
function SettingsIcon() {
  return /* @__PURE__ */ React.createElement(BaseIcon3, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1 1 0 0 0-.2 1.1V9c0 .4.2.8.6.9H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" }));
}

// life-tracker/src/home/editors.jsx
init_define_process();

// life-tracker/src/home/drafts.js
init_define_process();
function todayLocalDate3(baseDate = /* @__PURE__ */ new Date()) {
  const now = baseDate;
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function createDraftId(prefix = "draft") {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
    return todayLocalDate3();
  }
  base.setDate(base.getDate() + daysToAdd);
  return todayLocalDate3(base);
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
function createDraftChecklistItem(source = null) {
  return {
    id: source?.id || createDraftId("draft-item"),
    title: source?.title || ""
  };
}
function createTaskDraft(source = null) {
  return {
    id: source?.id || "",
    title: source?.title || "",
    category: source?.category || "",
    dueDate: source?.dueDate || todayLocalDate3(),
    time: source?.time || "",
    priority: String(source?.priority || 1),
    notes: source?.notes || "",
    reminderAt: source?.reminderAt ? String(source.reminderAt).slice(0, 16) : "",
    isPersistent: source?.isPersistent ?? true,
    status: source?.status || "open",
    subitemsBlocking: source?.subitemsBlocking ?? false,
    subitems: Array.isArray(source?.subitems) && source.subitems.length ? source.subitems.map((entry) => ({
      id: entry.id || "",
      title: entry.title || "",
      isCompleted: Boolean(entry.isCompleted)
    })) : []
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
function createHabitDraft(source = null) {
  const startDate = source?.startDate || todayLocalDate3();
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
      sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry?.sortOrder) : index
    })) : [],
    scheduleType,
    scheduleConfigJson: {
      weekdays: scheduleType === "weekdays" ? weekdays : []
    },
    startDate: overrides2.startDate ?? source?.startDate ?? todayLocalDate3(),
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

// life-tracker/src/home/editors.jsx
var React6 = window.React;
var {
  useEffect: useEffect5,
  useRef: useRef5,
  useState: useState6
} = React6;
function EditorSection({
  title,
  description = "",
  children
}) {
  return /* @__PURE__ */ React6.createElement("div", { className: "habitosView__wizardStep" }, title ? /* @__PURE__ */ React6.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React6.createElement("strong", null, title), description ? /* @__PURE__ */ React6.createElement("span", null, description) : null) : null, children);
}
function DraftNumberInput({
  value,
  onChange,
  onCommit,
  ...inputProps
}) {
  return /* @__PURE__ */ React6.createElement(
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
  const hasCurrentValue = Number.isFinite(currentValue);
  const normalizedCurrentValue = hasCurrentValue ? currentValue : Number.isFinite(minValue) ? minValue : 0;
  const isDecrementDisabled = disabled || Number.isFinite(minValue) && normalizedCurrentValue <= minValue && hasCurrentValue;
  const isIncrementDisabled = disabled || Number.isFinite(maxValue) && normalizedCurrentValue >= maxValue && hasCurrentValue;
  const commitValue = (rawValue) => {
    onCommit?.(rawValue);
  };
  const adjustValue = (direction) => {
    if (disabled) {
      return;
    }
    const nextBaseValue = hasCurrentValue ? currentValue : normalizedCurrentValue;
    let nextValue = nextBaseValue + stepValue * direction;
    if (Number.isFinite(minValue)) {
      nextValue = Math.max(minValue, nextValue);
    }
    if (Number.isFinite(maxValue)) {
      nextValue = Math.min(maxValue, nextValue);
    }
    const serializedValue = String(nextValue);
    onChange(serializedValue);
    commitValue(serializedValue);
  };
  return /* @__PURE__ */ React6.createElement("div", { className: "habitosView__numberStepper" }, /* @__PURE__ */ React6.createElement(
    "button",
    {
      type: "button",
      className: "habitosView__numberStepperButton",
      onClick: () => adjustValue(-1),
      disabled: isDecrementDisabled,
      "aria-label": "Bajar valor"
    },
    /* @__PURE__ */ React6.createElement(ChevronLeftIcon, null)
  ), /* @__PURE__ */ React6.createElement(
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
  ), /* @__PURE__ */ React6.createElement(
    "button",
    {
      type: "button",
      className: "habitosView__numberStepperButton",
      onClick: () => adjustValue(1),
      disabled: isIncrementDisabled,
      "aria-label": "Subir valor"
    },
    /* @__PURE__ */ React6.createElement(ChevronRightIcon, null)
  ));
}
function DateDraftInput({
  value,
  onChange,
  showTodayLabel = false,
  ...inputProps
}) {
  const isTodayDefault = showTodayLabel && value === todayLocalDate3();
  return /* @__PURE__ */ React6.createElement("div", { className: ["habitosView__dateField", isTodayDefault ? "is-default-today" : ""].filter(Boolean).join(" ") }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      ...inputProps,
      className: "habitosView__dateFieldInput",
      type: "date",
      value,
      onChange: (event) => onChange(event.target.value)
    }
  ), isTodayDefault ? /* @__PURE__ */ React6.createElement("span", { className: "habitosView__dateFieldGhost", "aria-hidden": "true" }, "Hoy") : null);
}
function useDragReorder(resetKey, onMoveItem) {
  const [draggedIndex, setDraggedIndex] = useState6(null);
  const [dropIndex, setDropIndex] = useState6(null);
  const dragIntentRef = useRef5(null);
  useEffect5(() => {
    dragIntentRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
  }, [resetKey]);
  const resetDragState = () => {
    dragIntentRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
  };
  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      resetDragState();
      return;
    }
    onMoveItem?.(draggedIndex, targetIndex);
    resetDragState();
  };
  return {
    draggedIndex,
    dropIndex,
    dragIntentRef,
    resetDragState,
    handleDrop,
    setDraggedIndex,
    setDropIndex
  };
}
function ChecklistDraftEditor({
  items = [],
  disabled = false,
  addLabel = "Agregar item",
  itemPlaceholder = "Item",
  centeredAction = false,
  onAddItem,
  onChangeItem,
  onRemoveItem,
  onMoveItem
}) {
  const dragResetKey = items.map((item, index) => item.id || `${index}:${item.title || ""}`).join("|");
  const {
    draggedIndex,
    dropIndex,
    dragIntentRef,
    handleDrop,
    resetDragState,
    setDraggedIndex,
    setDropIndex
  } = useDragReorder(dragResetKey, onMoveItem);
  return /* @__PURE__ */ React6.createElement("div", { className: "habitosView__subitemEditor" }, /* @__PURE__ */ React6.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React6.createElement("strong", null, "Sub-items")), items.length ? /* @__PURE__ */ React6.createElement("div", { className: "habitosView__subitemsDraft" }, items.map((item, index) => /* @__PURE__ */ React6.createElement(
    "div",
    {
      key: item.id || index,
      className: [
        "habitosView__subitemDraftRow",
        draggedIndex === index ? "is-dragging" : "",
        dropIndex === index && draggedIndex !== index ? "is-drop-target" : ""
      ].filter(Boolean).join(" "),
      draggable: !disabled && items.length > 1,
      onDragStart: (event) => {
        if (disabled || dragIntentRef.current !== index) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        setDraggedIndex(index);
        setDropIndex(index);
      },
      onDragEnd: resetDragState,
      onDragOver: (event) => {
        if (disabled || draggedIndex === null) {
          return;
        }
        event.preventDefault();
        if (dropIndex !== index) {
          setDropIndex(index);
        }
      },
      onDrop: (event) => {
        event.preventDefault();
        handleDrop(index);
      }
    },
    /* @__PURE__ */ React6.createElement(
      "button",
      {
        type: "button",
        className: "habitosView__subitemDragHandle",
        "aria-label": "Reordenar item",
        draggable: false,
        disabled: disabled || items.length <= 1,
        onPointerDown: () => {
          dragIntentRef.current = index;
        },
        onPointerUp: () => {
          dragIntentRef.current = null;
        },
        onPointerCancel: () => {
          dragIntentRef.current = null;
        }
      },
      /* @__PURE__ */ React6.createElement("span", null),
      /* @__PURE__ */ React6.createElement("span", null)
    ),
    /* @__PURE__ */ React6.createElement(
      "input",
      {
        value: item.title,
        onChange: (event) => onChangeItem?.(index, event.target.value),
        placeholder: typeof itemPlaceholder === "function" ? itemPlaceholder(index) : itemPlaceholder,
        disabled
      }
    ),
    /* @__PURE__ */ React6.createElement(
      CyberIconButton,
      {
        type: "button",
        "aria-label": "Eliminar item",
        tone: "danger",
        onClick: () => onRemoveItem?.(index),
        disabled
      },
      /* @__PURE__ */ React6.createElement(TrashIcon2, null)
    )
  ))) : null, /* @__PURE__ */ React6.createElement("div", { className: centeredAction ? "habitosView__centeredAction" : "" }, /* @__PURE__ */ React6.createElement(Button, { type: "button", onClick: onAddItem, disabled }, /* @__PURE__ */ React6.createElement(PlusIcon2, null), /* @__PURE__ */ React6.createElement("span", null, addLabel))));
}
function CreateChoiceCard({
  title,
  description,
  icon = null,
  onClick
}) {
  return /* @__PURE__ */ React6.createElement("button", { type: "button", className: "habitosView__createChoice", onClick }, icon ? /* @__PURE__ */ React6.createElement("span", { className: "habitosView__createChoiceIcon", "aria-hidden": "true" }, icon) : null, /* @__PURE__ */ React6.createElement("strong", null, title), /* @__PURE__ */ React6.createElement("span", null, description));
}
function FloatingWorkbenchModal({
  isVisible = false,
  saving = false,
  layout = "modal",
  onClose,
  children
}) {
  if (!isVisible) {
    return null;
  }
  return /* @__PURE__ */ React6.createElement(
    "div",
    {
      className: ["habitosView__modalBackdrop", layout === "drawer" ? "is-drawer" : ""].filter(Boolean).join(" "),
      onClick: () => {
        if (!saving) {
          onClose?.();
        }
      }
    },
    /* @__PURE__ */ React6.createElement(
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
  onRoutine,
  onCancel
}) {
  return /* @__PURE__ */ React6.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React6.createElement(PanelHeader, null, /* @__PURE__ */ React6.createElement(PanelTitle, { title: "Crear nuevo" })), /* @__PURE__ */ React6.createElement("div", { className: "habitosView__createChoiceGrid" }, /* @__PURE__ */ React6.createElement(
    CreateChoiceCard,
    {
      title: "Tarea simple",
      description: "Actividad de instancia unica sin repeticion ni seguimiento historico.",
      icon: /* @__PURE__ */ React6.createElement(ClockIcon, null),
      onClick: onTask
    }
  ), /* @__PURE__ */ React6.createElement(
    CreateChoiceCard,
    {
      title: "Habito",
      description: "Actividad recurrente con seguimiento diario y formas de evaluacion distintas.",
      icon: /* @__PURE__ */ React6.createElement(HabitosIcon, null),
      onClick: onHabit
    }
  ), /* @__PURE__ */ React6.createElement(
    CreateChoiceCard,
    {
      title: "Rutina de ejercicios",
      description: "Asigna una rutina existente con recurrencia propia y seguimiento simple o detallado.",
      onClick: onRoutine
    }
  )), /* @__PURE__ */ React6.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React6.createElement(Button, { type: "button", onClick: onCancel }, "Cancelar")));
}
function TaskEditor({
  draft,
  advancedOpen,
  saving,
  renderCategoryPicker,
  onChange,
  onAddSubitem,
  onChangeSubitemTitle,
  onMoveSubitem,
  onRemoveSubitem,
  onToggleAdvanced,
  onCommitNumber,
  onSubmit,
  onCancel
}) {
  const taskIsCompleted = draft.status === "completed";
  return /* @__PURE__ */ React6.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React6.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React6.createElement(Button, { type: "button", onClick: onToggleAdvanced }, advancedOpen ? "Ocultar avanzado" : "Mostrar avanzado")
    },
    /* @__PURE__ */ React6.createElement(PanelTitle, { title: draft.id ? "Editar tarea" : "Nueva tarea" })
  ), /* @__PURE__ */ React6.createElement("form", { className: "habitosView__editorForm", onSubmit }, /* @__PURE__ */ React6.createElement(EditorSection, { title: "Base" }, /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      value: draft.title,
      onChange: (event) => onChange("title", event.target.value),
      placeholder: "Ej. Llamar al tecnico",
      required: true
    }
  )), /* @__PURE__ */ React6.createElement(Field, { label: "Fecha" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "date",
      value: draft.dueDate,
      onChange: (event) => onChange("dueDate", event.target.value),
      required: true
    }
  )), /* @__PURE__ */ React6.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React6.createElement(
    StepperNumberInput,
    {
      min: "1",
      max: "100",
      step: "1",
      value: draft.priority,
      onChange: (value) => onChange("priority", value),
      onCommit: (value) => onCommitNumber("priority", value)
    }
  ))), renderCategoryPicker?.({
    selectedCategory: draft.category,
    onSelectCategory: (value) => onChange("category", value),
    saving
  })), /* @__PURE__ */ React6.createElement(EditorSection, { title: "Sub-items" }, taskIsCompleted ? /* @__PURE__ */ React6.createElement(Notice, { tone: "info" }, "Reabre la tarea para cambiar sus sub-items o su bloqueo.") : null, /* @__PURE__ */ React6.createElement(
    ChecklistDraftEditor,
    {
      items: draft.subitems,
      disabled: saving || taskIsCompleted,
      addLabel: "Agregar sub-item",
      itemPlaceholder: (index) => `Paso ${index + 1}`,
      onAddItem: onAddSubitem,
      onChangeItem: onChangeSubitemTitle,
      onMoveItem: onMoveSubitem,
      onRemoveItem: onRemoveSubitem
    }
  )), advancedOpen ? /* @__PURE__ */ React6.createElement(EditorSection, { title: "Avanzado" }, /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "time",
      value: draft.time,
      onChange: (event) => onChange("time", event.target.value)
    }
  )), /* @__PURE__ */ React6.createElement(Field, { label: "Recordatorio" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "datetime-local",
      value: draft.reminderAt,
      onChange: (event) => onChange("reminderAt", event.target.value)
    }
  )), /* @__PURE__ */ React6.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React6.createElement(
    "textarea",
    {
      rows: "3",
      value: draft.notes,
      onChange: (event) => onChange("notes", event.target.value),
      placeholder: "Contexto breve para esta tarea."
    }
  )), /* @__PURE__ */ React6.createElement("div", { className: "habitosView__booleanGrid" }, /* @__PURE__ */ React6.createElement("label", { className: "habitosView__booleanField" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.isPersistent),
      onChange: (event) => onChange("isPersistent", event.target.checked)
    }
  ), /* @__PURE__ */ React6.createElement("span", null, "Se mostrara todos los dias hasta completarse")), /* @__PURE__ */ React6.createElement("label", { className: "habitosView__booleanField" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.subitemsBlocking),
      onChange: (event) => onChange("subitemsBlocking", event.target.checked),
      disabled: taskIsCompleted
    }
  ), /* @__PURE__ */ React6.createElement("span", null, "Los sub-items bloquean el completado"))))) : null, /* @__PURE__ */ React6.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React6.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : draft.id ? "Guardar tarea" : "Crear tarea"), /* @__PURE__ */ React6.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar"))));
}
function HabitEvaluationFields({
  draft,
  saving,
  quantityModeOptions,
  onChange,
  onCommitNumber
}) {
  if (draft.progressMode === "yes-no") {
    return /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React6.createElement(
      "input",
      {
        value: draft.title,
        onChange: (event) => onChange("title", event.target.value),
        placeholder: "Nombre del habito",
        required: true
      }
    )));
  }
  if (draft.progressMode === "quantity") {
    return /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React6.createElement(
      "input",
      {
        value: draft.title,
        onChange: (event) => onChange("title", event.target.value),
        placeholder: "Nombre del habito",
        required: true
      }
    )), /* @__PURE__ */ React6.createElement(Field, { label: "Objetivo diario", wide: true }, /* @__PURE__ */ React6.createElement("div", { className: "habitosView__quantitySentence" }, /* @__PURE__ */ React6.createElement(
      "select",
      {
        value: draft.quantityMode,
        onChange: (event) => onChange("quantityMode", event.target.value),
        disabled: saving
      },
      quantityModeOptions.map((option) => /* @__PURE__ */ React6.createElement("option", { key: option.value, value: option.value }, option.label))
    ), /* @__PURE__ */ React6.createElement(
      DraftNumberInput,
      {
        min: "0",
        step: "1",
        value: draft.quantityTarget,
        onChange: (value) => onChange("quantityTarget", value),
        onCommit: (value) => onCommitNumber("quantityTarget", value),
        placeholder: "Objetivo",
        disabled: saving || draft.quantityMode === "no-target"
      }
    ), /* @__PURE__ */ React6.createElement(
      "input",
      {
        value: draft.quantityUnit,
        onChange: (event) => onChange("quantityUnit", event.target.value),
        placeholder: "Unidad",
        disabled: saving
      }
    ), /* @__PURE__ */ React6.createElement("span", { className: "habitosView__quantitySuffix" }, "en el dia"))));
  }
  if (draft.progressMode === "checklist") {
    return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React6.createElement(
      "input",
      {
        value: draft.title,
        onChange: (event) => onChange("title", event.target.value),
        placeholder: "Nombre del habito",
        required: true
      }
    ))), /* @__PURE__ */ React6.createElement(
      ChecklistDraftEditor,
      {
        items: draft.checklistItems,
        disabled: saving,
        addLabel: "Agregar item",
        itemPlaceholder: "item",
        centeredAction: true,
        onAddItem: () => onChange("addChecklistItem"),
        onChangeItem: (index, value) => onChange("checklistItem", { index, value }),
        onMoveItem: (fromIndex, toIndex) => onChange("moveChecklistItem", { fromIndex, toIndex }),
        onRemoveItem: (index) => onChange("removeChecklistItem", index)
      }
    ));
  }
  return null;
}
function HabitEditor({
  draft,
  step,
  saving,
  wizardError,
  stepLabels,
  progressOptions,
  quantityModeOptions,
  weekdayOptions,
  renderCategoryPicker,
  onChange,
  onSelectProgressMode,
  onToggleWeekday,
  onBack,
  onNext,
  onCommitNumber,
  onSubmit,
  onCancel
}) {
  const isEditing = Boolean(draft.id);
  const isLastStep = step === stepLabels.length - 1;
  const progressOption = progressOptions.find((option) => option.value === draft.progressMode) || null;
  return /* @__PURE__ */ React6.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel" }, /* @__PURE__ */ React6.createElement(PanelHeader, null, /* @__PURE__ */ React6.createElement(PanelTitle, { title: isEditing ? "Editar habito" : "Nuevo habito" })), /* @__PURE__ */ React6.createElement("form", { className: "habitosView__editorForm", onSubmit }, /* @__PURE__ */ React6.createElement("div", { className: "habitosView__modalStep" }, /* @__PURE__ */ React6.createElement("span", null, "Paso ", step + 1, " de ", stepLabels.length), /* @__PURE__ */ React6.createElement("strong", null, stepLabels[step]?.label || "Paso")), wizardError ? /* @__PURE__ */ React6.createElement(Notice, { tone: "danger" }, wizardError) : null, step === 0 ? renderCategoryPicker?.({
    selectedCategory: draft.category,
    onSelectCategory: (value) => onChange("category", value),
    saving
  }) : null, step === 1 ? /* @__PURE__ */ React6.createElement(
    EditorSection,
    {
      title: "Evaluacion",
      description: isEditing && progressOption ? `Tipo actual: ${progressOption.label}. En esta pasada no se puede convertir.` : "Define como quieres registrar el progreso de este habito."
    },
    !isEditing ? /* @__PURE__ */ React6.createElement("div", { className: "habitosView__wizardOptionGrid habitosView__wizardOptionGrid--stacked" }, progressOptions.map((option) => /* @__PURE__ */ React6.createElement(
      "button",
      {
        key: option.value,
        type: "button",
        className: [
          "habitosView__wizardOptionCard",
          draft.progressMode === option.value ? "is-selected" : ""
        ].filter(Boolean).join(" "),
        onClick: () => onSelectProgressMode(option.value),
        disabled: saving
      },
      /* @__PURE__ */ React6.createElement("strong", null, option.label),
      /* @__PURE__ */ React6.createElement("span", null, option.description)
    ))) : null,
    draft.progressMode ? /* @__PURE__ */ React6.createElement(
      HabitEvaluationFields,
      {
        draft,
        saving,
        quantityModeOptions,
        onChange,
        onCommitNumber
      }
    ) : null
  ) : null, step === 2 ? /* @__PURE__ */ React6.createElement(EditorSection, { title: "Frecuencia" }, /* @__PURE__ */ React6.createElement(Field, { label: "Frecuencia" }, /* @__PURE__ */ React6.createElement(
    "select",
    {
      value: draft.scheduleType,
      onChange: (event) => onChange("scheduleType", event.target.value),
      disabled: saving
    },
    /* @__PURE__ */ React6.createElement("option", { value: "daily" }, "Todos los dias"),
    /* @__PURE__ */ React6.createElement("option", { value: "weekdays" }, "Dias de la semana")
  )), draft.scheduleType === "weekdays" ? /* @__PURE__ */ React6.createElement("div", { className: "habitosView__weekdayGrid" }, weekdayOptions.map((option) => {
    const active = draft.weekdays.includes(option.value);
    return /* @__PURE__ */ React6.createElement(
      "button",
      {
        key: option.value,
        type: "button",
        className: ["habitosView__weekdayButton", active ? "is-active" : ""].filter(Boolean).join(" "),
        onClick: () => onToggleWeekday(option.value),
        disabled: saving
      },
      option.label
    );
  })) : /* @__PURE__ */ React6.createElement(Notice, { tone: "info" }, "Se genera una ocurrencia por dia.")) : null, step === 3 ? /* @__PURE__ */ React6.createElement(EditorSection, { title: "Operativa" }, /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Fecha de inicio" }, /* @__PURE__ */ React6.createElement(
    DateDraftInput,
    {
      value: draft.startDate,
      onChange: (value) => onChange("startDate", value),
      showTodayLabel: true
    }
  )), /* @__PURE__ */ React6.createElement("div", { className: "habitosView__toggleCard" }, /* @__PURE__ */ React6.createElement("label", { className: "habitosView__booleanField habitosView__booleanField--inline" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "checkbox",
      checked: Boolean(draft.hasEndDate),
      onChange: (event) => onChange("hasEndDate", event.target.checked),
      disabled: saving
    }
  ), /* @__PURE__ */ React6.createElement("span", null, "Fecha de fin")))), draft.hasEndDate ? /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Fecha de fin" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "date",
      value: draft.endDate,
      onChange: (event) => onChange("endDate", event.target.value),
      disabled: saving
    }
  )), /* @__PURE__ */ React6.createElement(Field, { label: "Duracion" }, /* @__PURE__ */ React6.createElement("div", { className: "habitosView__durationField" }, /* @__PURE__ */ React6.createElement(
    DraftNumberInput,
    {
      min: "1",
      step: "1",
      value: draft.durationDays,
      onChange: (value) => onChange("durationDays", value),
      onCommit: (value) => onCommitNumber("durationDays", value),
      disabled: saving
    }
  ), /* @__PURE__ */ React6.createElement("span", { className: "habitosView__quantitySuffix" }, "dias")))) : null, /* @__PURE__ */ React6.createElement(FieldGrid, null, /* @__PURE__ */ React6.createElement(Field, { label: "Hora" }, /* @__PURE__ */ React6.createElement(
    "input",
    {
      type: "time",
      value: draft.time,
      onChange: (event) => onChange("time", event.target.value),
      disabled: saving
    }
  )), /* @__PURE__ */ React6.createElement(Field, { label: "Prioridad" }, /* @__PURE__ */ React6.createElement(
    StepperNumberInput,
    {
      min: "1",
      max: "100",
      step: "1",
      value: draft.priority,
      onChange: (value) => onChange("priority", value),
      onCommit: (value) => onCommitNumber("priority", value),
      disabled: saving
    }
  )), /* @__PURE__ */ React6.createElement(Field, { label: "Notas", wide: true }, /* @__PURE__ */ React6.createElement(
    "textarea",
    {
      rows: "3",
      value: draft.notes,
      onChange: (event) => onChange("notes", event.target.value),
      placeholder: "Criterio simple de uso diario.",
      disabled: saving
    }
  )))) : null, /* @__PURE__ */ React6.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React6.createElement("div", { className: "habitosView__editorNav" }, /* @__PURE__ */ React6.createElement(Button, { type: "button", onClick: onBack, disabled: step === 0 || saving }, /* @__PURE__ */ React6.createElement(ChevronLeftIcon, null), /* @__PURE__ */ React6.createElement("span", null, "Atras")), !isLastStep ? /* @__PURE__ */ React6.createElement(Button, { type: "button", onClick: onNext, disabled: saving }, /* @__PURE__ */ React6.createElement("span", null, "Siguiente"), /* @__PURE__ */ React6.createElement(ChevronRightIcon, null)) : null), /* @__PURE__ */ React6.createElement("div", { className: "habitosView__editorNav" }, isLastStep ? /* @__PURE__ */ React6.createElement(Button, { type: "submit", tone: "primary", disabled: saving }, saving ? "Guardando..." : isEditing ? "Guardar habito" : "Crear habito") : null, /* @__PURE__ */ React6.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar")))));
}

// life-tracker/src/home/queue.jsx
init_define_process();
function QueueStatusPill({ status, label }) {
  return /* @__PURE__ */ React.createElement("span", { className: ["habitosView__queueStatusPill", `is-${status || "pending"}`].join(" ") }, label);
}
function QueueItemCard({
  item,
  badge,
  secondaryCopy = "",
  toggleMeta = null,
  isSelected = false,
  isSettled = false,
  saving = false,
  inlineActionLabel = "",
  inlineActionDisabled = false,
  showStatusPill = false,
  quantityControl = null,
  subitems = null,
  onToggle,
  onContextMenu,
  onInlineAction,
  onToggleExpanded,
  onToggleSubitem
}) {
  return /* @__PURE__ */ React.createElement(
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
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "habitosView__queueBadge",
        style: { "--habitos-item-accent": badge?.accentColor },
        "aria-hidden": "true"
      },
      badge?.icon || null
    ),
    /* @__PURE__ */ React.createElement("div", { className: "habitosView__queueCopy" }, /* @__PURE__ */ React.createElement("div", { className: "habitosView__queueCopyText" }, /* @__PURE__ */ React.createElement("strong", null, item.title), secondaryCopy ? /* @__PURE__ */ React.createElement("span", null, secondaryCopy) : null)),
    /* @__PURE__ */ React.createElement("div", { className: "habitosView__queueActions" }, showStatusPill ? /* @__PURE__ */ React.createElement(QueueStatusPill, { status: item.status, label: item.statusLabel }) : null, quantityControl, subitems ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: ["habitosView__queueExpand", subitems.isExpanded ? "is-expanded" : ""].filter(Boolean).join(" "),
        onClick: () => onToggleExpanded?.(item.id),
        disabled: saving,
        "aria-expanded": subitems.isExpanded ? "true" : "false"
      },
      /* @__PURE__ */ React.createElement(ChevronRightIcon, null),
      /* @__PURE__ */ React.createElement("span", null, subitems.label)
    ) : null, inlineActionLabel ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "habitosView__queueInlineAction",
        onClick: onInlineAction || onToggle,
        disabled: saving || inlineActionDisabled
      },
      inlineActionLabel
    ) : null, toggleMeta ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: ["habitosView__queueCheck", toggleMeta.className].filter(Boolean).join(" "),
        onClick: onToggle,
        "aria-label": toggleMeta.ariaLabel,
        "aria-pressed": toggleMeta.isPressed ? "true" : "false",
        disabled: saving || toggleMeta.disabled
      },
      toggleMeta.content
    ) : null),
    subitems ? /* @__PURE__ */ React.createElement(
      "div",
      {
        className: [
          "habitosView__queueChecklistRegion",
          subitems.isExpanded ? "is-expanded" : ""
        ].filter(Boolean).join(" "),
        "aria-hidden": subitems.isExpanded ? void 0 : "true"
      },
      /* @__PURE__ */ React.createElement("div", { className: "habitosView__queueChecklist" }, subitems.items.map((subitem) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: subitem.id,
          type: "button",
          className: ["habitosView__queueChecklistItem", subitem.isCompleted ? "is-completed" : ""].filter(Boolean).join(" "),
          onClick: () => onToggleSubitem?.(item, subitem.id),
          disabled: saving || !subitems.isExpanded || subitems.toggleDisabled,
          tabIndex: subitems.isExpanded ? 0 : -1
        },
        /* @__PURE__ */ React.createElement("span", { className: "habitosView__queueChecklistMark", "aria-hidden": "true" }, subitem.isCompleted ? /* @__PURE__ */ React.createElement(CheckIcon, null) : null),
        /* @__PURE__ */ React.createElement("span", null, subitem.title)
      )))
    ) : null
  );
}

// life-tracker/src/LifeTrackerView.jsx
var React7 = window.React;
var {
  startTransition: startTransition2,
  useEffect: useEffect6,
  useMemo: useMemo3,
  useRef: useRef6,
  useState: useState7
} = React7;
var getCachedIconSvgMarkup;
var loadIconSvgMarkup;
var loadUnifiedIconCatalog;
var CanvasWorkspace;
var createCanvasStateFromLegacyLayouts;
function configureLifeTrackerHostUi(ui) {
  ({ getCachedIconSvgMarkup, loadIconSvgMarkup, loadUnifiedIconCatalog } = ui.icons);
  ({ CanvasWorkspace, createCanvasStateFromLegacyLayouts } = ui.canvas);
}
var ipcRenderer3 = pluginIpc;
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController
);
var HABIT_OUTCOME_RANGE_TICK_LIMITS = {
  "7d": 7,
  "1m": 8,
  "1y": 12
};
var LIFE_TRACKER_HABITS_CHANNEL_PREFIX = "life-tracker:habits";
var LIFE_TRACKER_FINANCE_CHANNEL_PREFIX2 = "life-tracker:finance";
var LIFE_TRACKER_TRAINING_CHANNEL_PREFIX2 = "life-tracker:training";
var LIFE_TRACKER_HABITS_CHANNELS = {
  getHome: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:get-home`,
  saveTask: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-task`,
  toggleTask: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-task`,
  toggleTaskSubitem: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-task-subitem`,
  deleteTask: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-task`,
  saveHabit: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-habit`,
  toggleOccurrence: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence`,
  setOccurrenceQuantity: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:set-occurrence-quantity`,
  toggleOccurrenceChecklistItem: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:toggle-occurrence-checklist-item`,
  deleteHabit: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-habit`,
  saveCategory: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:save-category`,
  deleteCategory: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:delete-category`,
  renameCategoryReferences: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:rename-category-references`,
  clearCategoryReferences: `${LIFE_TRACKER_HABITS_CHANNEL_PREFIX}:clear-category-references`
};
var LIFE_TRACKER_FINANCE_CHANNELS = {
  list: `${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX2}:list`
};
var LIFE_TRACKER_TRAINING_CHANNELS = {
  list: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX2}:list`,
  listAssignments: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX2}:list-assignments`,
  getAssignment: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX2}:get-assignment`,
  saveAssignment: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX2}:save-assignment`,
  deleteAssignment: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX2}:delete-assignment`,
  saveOccurrenceResult: `${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX2}:save-occurrence-result`
};
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
var EMPTY_TRAINING_LIBRARY = {
  exercises: [],
  routines: [],
  assignments: [],
  muscles: [],
  regions: [],
  groups: []
};
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
function readHabitosDashboardLayouts(settingsValue) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return normalizeHabitosDashboardLayouts(baseSettings[LIFE_TRACKER_LEGACY_DASHBOARD_LAYOUTS_KEY]);
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
  const rawOverrides = baseSettings[LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY] || baseSettings[LIFE_TRACKER_LEGACY_HABIT_CATEGORY_PRESET_OVERRIDES_KEY];
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
    [LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY]: nextOverrides
  };
}
function readLifeTrackerCanvasState(settingsValue) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return baseSettings[LIFE_TRACKER_CANVAS_STATE_KEY] || null;
}
function writeLifeTrackerCanvasState(settingsValue, canvasState) {
  const baseSettings = settingsValue && typeof settingsValue === "object" ? settingsValue : {};
  return {
    ...baseSettings,
    [LIFE_TRACKER_CANVAS_STATE_KEY]: canvasState
  };
}
function hasSameCanvasLayouts(leftCanvasState, rightCanvasState) {
  return JSON.stringify(leftCanvasState?.layouts || {}) === JSON.stringify(rightCanvasState?.layouts || {});
}
function hasPluginSettingsOverrides(value, defaults2 = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const relevantKeys = /* @__PURE__ */ new Set([
    ...Object.keys(defaults2 || {}),
    ...Object.keys(value || {})
  ]);
  for (const key of relevantKeys) {
    if (JSON.stringify(value?.[key]) !== JSON.stringify(defaults2?.[key])) {
      return true;
    }
  }
  return false;
}
function createMigratedPluginSettingsApi(ctx, pluginId, {
  defaults: defaults2 = {},
  legacyPluginId = null
} = {}) {
  const currentApi = ctx.createPluginSettingsApi(pluginId, defaults2);
  const legacyApi = legacyPluginId ? ctx.createPluginSettingsApi(legacyPluginId, defaults2) : null;
  const resolveValue = (currentValue, legacyValue) => {
    if (hasPluginSettingsOverrides(currentValue, defaults2)) {
      return currentValue;
    }
    if (legacyApi && hasPluginSettingsOverrides(legacyValue, defaults2)) {
      return legacyValue;
    }
    return currentValue;
  };
  return {
    stateKey: currentApi.stateKey,
    async get() {
      const [currentValue, legacyValue] = await Promise.all([
        currentApi.get(),
        legacyApi ? legacyApi.get() : Promise.resolve(null)
      ]);
      return resolveValue(currentValue, legacyValue);
    },
    async set(value) {
      return currentApi.set(value);
    },
    subscribe(listener, options) {
      return currentApi.subscribe(listener, options);
    },
    useValue() {
      const currentValue = currentApi.useValue();
      const legacyValue = legacyApi ? legacyApi.useValue() : null;
      return resolveValue(currentValue, legacyValue);
    }
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
function compareLocalDates(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}
function clampViewDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim()) ? String(value).trim() : todayLocalDate3();
}
async function invoke2(channel, payload) {
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
  if (item?.type === "routine") {
    return {
      color: "var(--habitos-accent)",
      iconId: DEFAULT_CUSTOM_HABIT_CATEGORY_ICON_ID
    };
  }
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
  const currentToday = todayLocalDate3();
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
function DashboardPanelTitle({ title = "", description = "", editMode = false }) {
  return /* @__PURE__ */ React7.createElement(PanelTitle, { title, description });
}
var FINANCE_WIDGET_CURRENCY_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function formatFinanceWidgetCurrency(cents) {
  return FINANCE_WIDGET_CURRENCY_FORMATTER.format((Number(cents) || 0) / 100);
}
function getFinanceWidgetSignedAmountCents(movement) {
  const amountCents = Math.max(0, Math.round(Number(movement?.amountCents || 0)));
  return movement?.kind === "expense" ? -amountCents : amountCents;
}
function buildFinanceWidgetSummary(snapshot) {
  const movements = Array.isArray(snapshot?.movements) ? snapshot.movements : [];
  const actualBalanceCents = movements.reduce((total, movement) => {
    return movement?.status === "posted" ? total + getFinanceWidgetSignedAmountCents(movement) : total;
  }, 0);
  const projectedBalanceCents = movements.reduce((total, movement) => {
    return total + getFinanceWidgetSignedAmountCents(movement);
  }, 0);
  return {
    actualBalanceCents,
    projectedBalanceCents,
    movementCount: movements.length,
    cashAudit: snapshot?.cashAudit || null,
    latestMovement: movements[0] || null
  };
}
function buildTrainingWidgetSummary(snapshot) {
  const exercises = Array.isArray(snapshot?.exercises) ? snapshot.exercises : [];
  const routines = Array.isArray(snapshot?.routines) ? snapshot.routines : [];
  const assignments = Array.isArray(snapshot?.assignments) ? snapshot.assignments : [];
  const activeAssignments = assignments.filter((entry) => entry?.status === "active");
  return {
    exerciseCount: exercises.length,
    routineCount: routines.length,
    activeAssignmentCount: activeAssignments.length,
    latestExercise: exercises[0] || null,
    latestRoutine: routines[0] || null,
    latestAssignment: activeAssignments[0] || assignments[0] || null
  };
}
function LifeTrackerWidgetValue({ eyebrow = "", value = "", tone = "default" }) {
  return /* @__PURE__ */ React7.createElement("div", { className: ["lifeTrackerWidget__value", tone !== "default" ? `is-${tone}` : ""].filter(Boolean).join(" ") }, /* @__PURE__ */ React7.createElement("span", null, eyebrow), /* @__PURE__ */ React7.createElement("strong", null, value));
}
function LifeTrackerDailyQueueWidget({ widgetContext }) {
  return widgetContext?.renderDailyQueue?.() || null;
}
function LifeTrackerHabitOutcomeWidget({ widgetContext }) {
  return widgetContext?.renderHabitOutcome?.() || null;
}
function LifeTrackerUpcomingTasksWidget({ widgetContext }) {
  return widgetContext?.renderUpcomingTasks?.() || null;
}
function LifeTrackerFinanceSummaryWidget({ widgetContext }) {
  const [snapshot, setSnapshot] = useState7(null);
  const [loading, setLoading] = useState7(true);
  const [error, setError] = useState7("");
  useEffect6(() => {
    let isCancelled = false;
    async function loadFinanceSummary() {
      setLoading(true);
      setError("");
      try {
        const response = await ipcRenderer3.invoke(LIFE_TRACKER_FINANCE_CHANNELS.list);
        if (!response?.ok) {
          throw new Error(response?.error || "No se pudieron cargar los datos de dinero.");
        }
        if (!isCancelled) {
          setSnapshot(response.data || null);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos de dinero.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    void loadFinanceSummary();
    return () => {
      isCancelled = true;
    };
  }, []);
  const summary = useMemo3(() => buildFinanceWidgetSummary(snapshot), [snapshot]);
  return /* @__PURE__ */ React7.createElement(SectionPanel, { className: "habitosDashboard__widget lifeTrackerWidget lifeTrackerWidget--finance" }, /* @__PURE__ */ React7.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React7.createElement(Button, { type: "button", tone: "secondary", onClick: () => widgetContext?.openSection?.("finance") }, "Abrir dinero")
    },
    /* @__PURE__ */ React7.createElement(
      DashboardPanelTitle,
      {
        title: "Dinero",
        description: "Saldo rapido y pulso reciente del modulo financiero."
      }
    )
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosDashboard__widgetBody lifeTrackerWidget__summaryBody" }, loading ? /* @__PURE__ */ React7.createElement(StateBlock, { title: "Cargando dinero..." }) : error ? /* @__PURE__ */ React7.createElement(Notice, { tone: "danger" }, error) : /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("div", { className: "lifeTrackerWidget__valueGrid" }, /* @__PURE__ */ React7.createElement(LifeTrackerWidgetValue, { eyebrow: "Saldo actual", value: formatFinanceWidgetCurrency(summary.actualBalanceCents), tone: "accent" }), /* @__PURE__ */ React7.createElement(LifeTrackerWidgetValue, { eyebrow: "Proyectado", value: formatFinanceWidgetCurrency(summary.projectedBalanceCents) }), /* @__PURE__ */ React7.createElement(
    LifeTrackerWidgetValue,
    {
      eyebrow: "Efectivo esperado",
      value: formatFinanceWidgetCurrency(summary.cashAudit?.currentExpectedCents || 0)
    }
  )), /* @__PURE__ */ React7.createElement("div", { className: "lifeTrackerWidget__metaList" }, /* @__PURE__ */ React7.createElement("span", null, summary.movementCount, " movimientos visibles en el tablero financiero."), /* @__PURE__ */ React7.createElement("span", null, summary.latestMovement?.title ? `Ultimo: ${summary.latestMovement.title}` : "Todavia no hay movimientos cargados.")))));
}
function LifeTrackerTrainingSummaryWidget({ widgetContext }) {
  const [snapshot, setSnapshot] = useState7(null);
  const [loading, setLoading] = useState7(true);
  const [error, setError] = useState7("");
  useEffect6(() => {
    let isCancelled = false;
    async function loadTrainingSummary() {
      setLoading(true);
      setError("");
      try {
        const response = await ipcRenderer3.invoke(LIFE_TRACKER_TRAINING_CHANNELS.list);
        if (!response?.ok) {
          throw new Error(response?.error || "No se pudieron cargar los datos de entrenamiento.");
        }
        if (!isCancelled) {
          setSnapshot(response.data || null);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los datos de entrenamiento.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    void loadTrainingSummary();
    return () => {
      isCancelled = true;
    };
  }, [widgetContext?.trainingRefreshToken]);
  const summary = useMemo3(() => buildTrainingWidgetSummary(snapshot), [snapshot]);
  return /* @__PURE__ */ React7.createElement(SectionPanel, { className: "habitosDashboard__widget lifeTrackerWidget lifeTrackerWidget--training" }, /* @__PURE__ */ React7.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React7.createElement(Button, { type: "button", tone: "secondary", onClick: () => widgetContext?.openSection?.("training") }, "Abrir entrenamiento")
    },
    /* @__PURE__ */ React7.createElement(
      DashboardPanelTitle,
      {
        title: "Entrenamiento",
        description: "Ejercicios, rutinas y programadas activas dentro de Life Tracker."
      }
    )
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosDashboard__widgetBody lifeTrackerWidget__summaryBody" }, loading ? /* @__PURE__ */ React7.createElement(StateBlock, { title: "Cargando entrenamiento..." }) : error ? /* @__PURE__ */ React7.createElement(Notice, { tone: "danger" }, error) : /* @__PURE__ */ React7.createElement(React7.Fragment, null, /* @__PURE__ */ React7.createElement("div", { className: "lifeTrackerWidget__valueGrid" }, /* @__PURE__ */ React7.createElement(LifeTrackerWidgetValue, { eyebrow: "Ejercicios", value: String(summary.exerciseCount), tone: "accent" }), /* @__PURE__ */ React7.createElement(LifeTrackerWidgetValue, { eyebrow: "Rutinas", value: String(summary.routineCount) }), /* @__PURE__ */ React7.createElement(LifeTrackerWidgetValue, { eyebrow: "Programadas activas", value: String(summary.activeAssignmentCount) })), /* @__PURE__ */ React7.createElement("div", { className: "lifeTrackerWidget__metaList" }, /* @__PURE__ */ React7.createElement("span", null, summary.latestRoutine?.title ? `Rutina destacada: ${summary.latestRoutine.title}` : "Todavia no hay rutinas guardadas."), /* @__PURE__ */ React7.createElement("span", null, summary.latestAssignment?.routine?.title ? `Activa: ${summary.latestAssignment.routine.title}` : summary.latestExercise?.title ? `Ejercicio reciente: ${summary.latestExercise.title}` : "Todavia no hay ejercicios cargados.")))));
}
var LIFE_TRACKER_HOME_WIDGET_PROVIDERS = [
  {
    id: "daily-queue",
    title: "Panel del dia",
    order: 100,
    defaultSize: { w: 7, h: 14, minW: 4, minH: 7 },
    defaultPlacement: {
      lg: { x: 0, y: 0, w: 7, h: 14, minW: 4, minH: 7 },
      md: { x: 0, y: 0, w: 6, h: 14, minW: 4, minH: 7 },
      sm: { x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 7 },
      xs: { x: 0, y: 0, w: 4, h: 11, minW: 2, minH: 7 },
      xxs: { x: 0, y: 0, w: 2, h: 10, minW: 2, minH: 6 }
    },
    component: LifeTrackerDailyQueueWidget
  },
  {
    id: "habit-outcome",
    title: "Evolucion de habitos",
    order: 200,
    defaultSize: { w: 5, h: 7, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 7, y: 0, w: 5, h: 7, minW: 3, minH: 6 },
      md: { x: 6, y: 0, w: 4, h: 7, minW: 3, minH: 6 },
      sm: { x: 0, y: 12, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 11, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 10, w: 2, h: 6, minW: 2, minH: 5 }
    },
    component: LifeTrackerHabitOutcomeWidget
  },
  {
    id: "upcoming-tasks",
    title: "Tareas proximas",
    order: 300,
    defaultSize: { w: 5, h: 7, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 7, y: 7, w: 5, h: 7, minW: 3, minH: 5 },
      md: { x: 6, y: 7, w: 4, h: 7, minW: 3, minH: 5 },
      sm: { x: 3, y: 12, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 17, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 16, w: 2, h: 6, minW: 2, minH: 5 }
    },
    component: LifeTrackerUpcomingTasksWidget
  },
  {
    id: "finance-summary",
    title: "Dinero",
    order: 400,
    defaultSize: { w: 6, h: 6, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 0, y: 14, w: 6, h: 6, minW: 3, minH: 5 },
      md: { x: 0, y: 14, w: 5, h: 6, minW: 3, minH: 5 },
      sm: { x: 0, y: 18, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 23, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 22, w: 2, h: 6, minW: 2, minH: 5 }
    },
    component: LifeTrackerFinanceSummaryWidget
  },
  {
    id: "training-summary",
    title: "Entrenamiento",
    order: 500,
    defaultSize: { w: 6, h: 6, minW: 3, minH: 5 },
    defaultPlacement: {
      lg: { x: 6, y: 14, w: 6, h: 6, minW: 3, minH: 5 },
      md: { x: 5, y: 14, w: 5, h: 6, minW: 3, minH: 5 },
      sm: { x: 3, y: 18, w: 3, h: 6, minW: 2, minH: 5 },
      xs: { x: 0, y: 29, w: 4, h: 6, minW: 2, minH: 5 },
      xxs: { x: 0, y: 28, w: 2, h: 6, minW: 2, minH: 5 }
    },
    component: LifeTrackerTrainingSummaryWidget
  }
];
function HabitOutcomeLineChart({
  chartData,
  rangeValue = "7d"
}) {
  const canvasRef = useRef6(null);
  const chartRef = useRef6(null);
  const labels = Array.isArray(chartData?.labels) ? chartData.labels : [];
  const datasets = Array.isArray(chartData?.datasets) ? chartData.datasets : [];
  const completedDataset = datasets.find((entry) => entry.id === "completed") || datasets[0] || null;
  const failedDataset = datasets.find((entry) => entry.id === "failed") || datasets[1] || null;
  const totals = chartData?.totals || {
    completed: 0,
    failed: 0
  };
  const maxTicksLimit = HABIT_OUTCOME_RANGE_TICK_LIMITS[rangeValue] || 7;
  useEffect6(() => {
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
  return /* @__PURE__ */ React7.createElement("div", { className: "habitosView__trendChartShell" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__trendLegend", "aria-hidden": "true" }, /* @__PURE__ */ React7.createElement("span", { className: "is-completed" }, "Cumplidos"), /* @__PURE__ */ React7.createElement("span", { className: "is-failed" }, "Fallidos"), /* @__PURE__ */ React7.createElement("span", { className: "habitosView__trendTotal" }, "C ", totals.completed), /* @__PURE__ */ React7.createElement("span", { className: "habitosView__trendTotal" }, "F ", totals.failed)), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__trendCanvasWrap" }, /* @__PURE__ */ React7.createElement("canvas", { ref: canvasRef })));
}
function HabitOutcomePanel({ chart, className = "", dashboardEditMode = false }) {
  const defaultRange = chart?.defaultRange || "7d";
  const [rangeValue, setRangeValue] = useState7(defaultRange);
  const rangeOptions = Array.isArray(chart?.options) && chart.options.length ? chart.options : createEmptyHome().habitOutcomeChart.options;
  const selectedChart = chart?.ranges?.[rangeValue] || chart?.ranges?.[defaultRange] || createEmptyHome().habitOutcomeChart.ranges["7d"];
  useEffect6(() => {
    if (!rangeOptions.some((option) => option.value === rangeValue)) {
      setRangeValue(defaultRange);
    }
  }, [defaultRange, rangeOptions, rangeValue]);
  return /* @__PURE__ */ React7.createElement(
    SectionPanel,
    {
      className: [
        "habitosDashboard__widget",
        "habitosView__trendPanel",
        className
      ].filter(Boolean).join(" ")
    },
    /* @__PURE__ */ React7.createElement(
      PanelHeader,
      {
        actions: /* @__PURE__ */ React7.createElement(
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
      /* @__PURE__ */ React7.createElement(DashboardPanelTitle, { title: "Evolucion de habitos", editMode: dashboardEditMode })
    ),
    /* @__PURE__ */ React7.createElement("div", { className: "habitosDashboard__widgetBody habitosView__trendPanelBody" }, /* @__PURE__ */ React7.createElement(HabitOutcomeLineChart, { chartData: selectedChart, rangeValue }))
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
    const weekdayLabels = Array.isArray(habit.scheduleConfigJson?.weekdays) ? habit.scheduleConfigJson.weekdays.map((weekday) => WEEKDAY_OPTIONS2.find((option) => option.value === weekday)?.label || null).filter(Boolean) : [];
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
  return home?.today === (home?.actualToday || todayLocalDate3()) ? "Hoy" : "En este dia";
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
    return home?.today === (home?.actualToday || todayLocalDate3()) ? "Tiene una ocurrencia activa para hoy." : "Tiene una ocurrencia activa para la fecha visible.";
  }
  return home?.today === (home?.actualToday || todayLocalDate3()) ? "Hoy no tiene ocurrencia pendiente." : "No tiene ocurrencia pendiente para la fecha visible.";
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
  if (item?.type === "routine") {
    return item.completionMode === "detailed" || item.status === "failed";
  }
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
      content: item.status === "completed" ? /* @__PURE__ */ React7.createElement(CheckIcon, null) : null
    };
  }
  if (item.type === "routine") {
    if (item.completionMode === "detailed") {
      return null;
    }
    if (item.status === "completed") {
      return {
        title: "Quitar resultado",
        ariaLabel: "Quitar resultado de rutina",
        isPressed: true,
        className: "is-completed",
        content: /* @__PURE__ */ React7.createElement(CheckIcon, null)
      };
    }
    return {
      title: "Marcar hecha",
      ariaLabel: "Marcar rutina como completada",
      isPressed: false,
      className: "",
      content: null
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
      content: /* @__PURE__ */ React7.createElement(CheckIcon, null)
    };
  }
  if (item.status === "failed") {
    return {
      title: "Volver a pendiente",
      ariaLabel: "Volver habito a pendiente",
      isPressed: false,
      className: "is-failed",
      content: /* @__PURE__ */ React7.createElement("span", { className: "habitosView__queueCheckGlyph" }, "x")
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
function getRoutineDetailedActionLabel(item) {
  return item?.status === "completed" ? "Editar detalle" : "Registrar detalle";
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
function getTaskSubitemsProgressSummary(task) {
  const subitems = Array.isArray(task?.subitems) ? task.subitems : [];
  const completedCount = subitems.filter((entry) => entry?.isCompleted).length;
  return `${completedCount}/${subitems.length}`;
}
function QuantityQueueInput({
  item,
  disabled = false,
  onCommit
}) {
  const committedValue = getOccurrenceQuantityDraftValue(item);
  const [draftValue, setDraftValue] = useState7(committedValue);
  const isCommittingRef = useRef6(false);
  const lastSubmittedValueRef = useRef6(committedValue);
  useEffect6(() => {
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
  useEffect6(() => {
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
  return /* @__PURE__ */ React7.createElement(
    Input,
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
  const [svgMarkup, setSvgMarkup] = useState7(() => getCachedIconSvgMarkup(iconId));
  useEffect6(() => {
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
  return /* @__PURE__ */ React7.createElement(
    "span",
    {
      className: ["habitosView__remoteCategoryIcon", `is-${size}`].join(" "),
      style: { color: color2 },
      "aria-hidden": "true"
    },
    svgMarkup ? /* @__PURE__ */ React7.createElement(
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
  return /* @__PURE__ */ React7.createElement("label", { className: "habitosView__categoryColorControl" }, /* @__PURE__ */ React7.createElement(
    "input",
    {
      className: "habitosView__categoryColorInput",
      type: "color",
      value: normalizedValue,
      disabled,
      onChange: (event) => onChange(event.target.value),
      "aria-label": "Elegir color de categoria"
    }
  ), /* @__PURE__ */ React7.createElement(
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
  return /* @__PURE__ */ React7.createElement(
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
    /* @__PURE__ */ React7.createElement("strong", null, title),
    /* @__PURE__ */ React7.createElement(
      "span",
      {
        className: "habitosView__categoryOptionIcon",
        style: isCreate ? void 0 : { background: color2 || DEFAULT_CUSTOM_HABIT_CATEGORY_COLOR },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React7.createElement(RemoteCategoryIcon, { iconId, size: "xl" })
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
  const [catalogIcons, setCatalogIcons] = useState7([]);
  const [catalogLoading, setCatalogLoading] = useState7(true);
  const [catalogError, setCatalogError] = useState7("");
  const [iconSearchQuery, setIconSearchQuery] = useState7("");
  const [visibleIconCount, setVisibleIconCount] = useState7(48);
  useEffect6(() => {
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
  useEffect6(() => {
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
  return /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryBuilderPanel" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryBuilderPreview" }, /* @__PURE__ */ React7.createElement(
    "span",
    {
      className: "habitosView__categoryBuilderPreviewIcon",
      style: { background: selectedColor },
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React7.createElement(RemoteCategoryIcon, { iconId: draft.iconId, size: "l" })
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryBuilderPreviewCopy" }, /* @__PURE__ */ React7.createElement("strong", null, String(draft.name || "").trim() || "Nueva categoria"), /* @__PURE__ */ React7.createElement("span", null, draft.iconId.replace(/^[^:]+:/, "")))), /* @__PURE__ */ React7.createElement(FieldGrid, null, /* @__PURE__ */ React7.createElement(Field, { label: "Nombre", wide: true }, /* @__PURE__ */ React7.createElement(
    Input,
    {
      value: draft.name,
      onChange: (event) => onChange("name", event.target.value),
      placeholder: "Nombre de la categoria",
      maxLength: "60"
    }
  ))), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryBuilderTools" }, /* @__PURE__ */ React7.createElement(
    HabitCategoryColorControl,
    {
      value: selectedColor,
      disabled: saving,
      onChange: (value) => onChange("color", value)
    }
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryIconSearch" }, /* @__PURE__ */ React7.createElement(
    SearchField,
    {
      value: iconSearchQuery,
      onChange: (event) => setIconSearchQuery(event.target.value),
      placeholder: "Buscar icono",
      disabled: saving,
      "aria-label": "Buscar icono"
    }
  ))), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryIconMeta" }, /* @__PURE__ */ React7.createElement("span", null, catalogLoading ? "Cargando iconos..." : catalogError ? catalogError : `${filteredIcons.length.toLocaleString("es-AR")} iconos`)), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryIconViewport", onScroll: handleCatalogScroll }, /* @__PURE__ */ React7.createElement(
    "div",
    {
      className: [
        "habitosView__categoryIconGrid",
        showIconLabels ? "is-searching" : ""
      ].filter(Boolean).join(" ")
    },
    visibleIcons.map((option) => /* @__PURE__ */ React7.createElement(
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
      /* @__PURE__ */ React7.createElement(
        RemoteCategoryIcon,
        {
          iconId: option.id,
          color: "var(--color-text)",
          size: showIconLabels ? "xl" : "l"
        }
      ),
      showIconLabels ? /* @__PURE__ */ React7.createElement("span", { className: "habitosView__categoryIconOptionLabel" }, option.label || option.name || option.id.replace(/^[^:]+:/, "")) : null
    ))
  )), error ? /* @__PURE__ */ React7.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__editorActions" }, /* @__PURE__ */ React7.createElement(
    Button,
    {
      type: "button",
      tone: "primary",
      onClick: onSave,
      disabled: saving || !String(draft.name || "").trim()
    },
    saving ? "Guardando..." : "Crear categoria"
  ), /* @__PURE__ */ React7.createElement(Button, { type: "button", onClick: onCancel, disabled: saving }, "Cancelar")));
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
  return /* @__PURE__ */ React7.createElement("div", { className: "habitosView__wizardStep" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__sectionIntro" }, /* @__PURE__ */ React7.createElement("strong", null, "Categoria"), /* @__PURE__ */ React7.createElement("span", null, "Elige una categoria o crea una propia sin salir del wizard.")), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryOptionGrid" }, categoryOptions.map((option) => /* @__PURE__ */ React7.createElement(
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
  )), /* @__PURE__ */ React7.createElement(
    CategoryOptionCard,
    {
      title: "Crear categoria",
      iconId: "mui:Add",
      isCreate: true,
      isSelected: builderOpen,
      onClick: () => builderOpen ? onCloseBuilder?.() : onOpenBuilder?.()
    }
  )), builderOpen ? /* @__PURE__ */ React7.createElement(
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
function SecondaryListCard({
  className = "",
  title,
  items,
  renderItem,
  emptyTitle = "Sin elementos.",
  dashboardEditMode = false
}) {
  return /* @__PURE__ */ React7.createElement(
    SectionPanel,
    {
      className: [
        "habitosDashboard__widget",
        "habitosView__secondaryPanel",
        className
      ].filter(Boolean).join(" ")
    },
    /* @__PURE__ */ React7.createElement(PanelHeader, null, /* @__PURE__ */ React7.createElement(DashboardPanelTitle, { title, editMode: dashboardEditMode })),
    /* @__PURE__ */ React7.createElement("div", { className: "habitosDashboard__widgetBody habitosView__secondaryPanelBody" }, items.length ? /* @__PURE__ */ React7.createElement("div", { className: "habitosView__secondaryList" }, items.map(renderItem)) : /* @__PURE__ */ React7.createElement(StateBlock, { title: emptyTitle }))
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
  return /* @__PURE__ */ React7.createElement(
    "button",
    {
      type: "button",
      className: [
        "habitosView__habitRow",
        isSelected ? "is-selected" : ""
      ].filter(Boolean).join(" "),
      onClick: onSelect
    },
    /* @__PURE__ */ React7.createElement(
      "div",
      {
        className: "habitosView__habitRowBadge",
        style: { "--habitos-item-accent": accent.color },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React7.createElement(RemoteCategoryIcon, { iconId: accent.iconId, color: accent.color })
    ),
    /* @__PURE__ */ React7.createElement("div", { className: "habitosView__habitRowCopy" }, /* @__PURE__ */ React7.createElement("strong", null, habit.title), /* @__PURE__ */ React7.createElement("span", null, summaryParts.join(" - "))),
    /* @__PURE__ */ React7.createElement("span", { className: ["habitosView__habitStatus", habit.status !== "active" ? "is-paused" : ""].filter(Boolean).join(" ") }, getHabitStatusLabel(habit.status))
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
  return /* @__PURE__ */ React7.createElement("div", { className: "habitosView__habitGroup" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__habitGroupHeader" }, /* @__PURE__ */ React7.createElement("strong", null, title), /* @__PURE__ */ React7.createElement("span", null, habits.length)), habits.length ? /* @__PURE__ */ React7.createElement("div", { className: "habitosView__habitGroupList" }, habits.map((habit) => /* @__PURE__ */ React7.createElement(
    HabitListItem,
    {
      key: habit.id,
      habit,
      categoryCatalog,
      presetOverrides,
      isSelected: habit.id === selectedHabitId,
      onSelect: () => onSelectHabit(habit.id)
    }
  ))) : /* @__PURE__ */ React7.createElement(StateBlock, { title: emptyTitle }));
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
  return /* @__PURE__ */ React7.createElement(ScrollRegion, { className: "habitosView__habitDetailScroll" }, /* @__PURE__ */ React7.createElement(PanelStack, null, /* @__PURE__ */ React7.createElement(SectionPanel, { tone: "highlight" }, /* @__PURE__ */ React7.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React7.createElement("div", { className: "habitosView__habitDetailActions" }, /* @__PURE__ */ React7.createElement(
        Button,
        {
          type: "button",
          tone: habit.status === "active" ? "secondary" : "primary",
          onClick: onToggleStatus,
          disabled: saving
        },
        habit.status === "active" ? "Pausar habito" : "Reactivar habito"
      ), /* @__PURE__ */ React7.createElement(Button, { type: "button", onClick: onEdit, disabled: saving }, /* @__PURE__ */ React7.createElement(PencilIcon2, null), /* @__PURE__ */ React7.createElement("span", null, "Editar")))
    },
    /* @__PURE__ */ React7.createElement(
      PanelTitle,
      {
        eyebrow: "Habito",
        title: habit.title,
        description: formatHabitSchedule(habit)
      }
    )
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__habitDetailHero" }, /* @__PURE__ */ React7.createElement(
    "div",
    {
      className: "habitosView__habitDetailHeroBadge",
      style: { "--habitos-item-accent": accent.color },
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React7.createElement(RemoteCategoryIcon, { iconId: accent.iconId, color: accent.color, size: "xxl" })
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaList" }, detailItems.map((item) => /* @__PURE__ */ React7.createElement("div", { key: item.label, className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, item.label), /* @__PURE__ */ React7.createElement("strong", null, item.value)))))), /* @__PURE__ */ React7.createElement(SectionPanel, { tone: "soft" }, /* @__PURE__ */ React7.createElement(PanelHeader, null, /* @__PURE__ */ React7.createElement(PanelTitle, { title: "Evaluacion" })), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaList habitosView__detailMetaList--section" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, "Tipo"), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaContent" }, /* @__PURE__ */ React7.createElement("strong", null, getHabitProgressLabel(habit)), progressOption?.description ? /* @__PURE__ */ React7.createElement("small", null, progressOption.description) : null)), habit.progressMode === "quantity" ? /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, "Objetivo"), /* @__PURE__ */ React7.createElement("strong", null, getHabitQuantitySummary(habit))) : null, habit.progressMode === "checklist" ? /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaRow is-stack" }, /* @__PURE__ */ React7.createElement("span", null, "Sub-items"), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaContent" }, checklistItems.length ? /* @__PURE__ */ React7.createElement("ul", { className: "habitosView__detailCompactList" }, checklistItems.map((item) => /* @__PURE__ */ React7.createElement("li", { key: item.id }, item.title))) : /* @__PURE__ */ React7.createElement("small", null, "Sin sub-items definidos."))) : null)), /* @__PURE__ */ React7.createElement(SectionPanel, { tone: "soft" }, /* @__PURE__ */ React7.createElement(PanelHeader, null, /* @__PURE__ */ React7.createElement(PanelTitle, { title: "Actividad" })), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaList habitosView__detailMetaList--section" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, "Dia visible"), /* @__PURE__ */ React7.createElement("strong", null, todaySummary)), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, "Ultimo registro"), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__detailMetaContent" }, /* @__PURE__ */ React7.createElement("strong", null, latestHistoryEntry ? latestHistoryEntry.statusLabel : "Sin actividad reciente"), latestHistoryEntry ? /* @__PURE__ */ React7.createElement("small", null, formatLocalDateTime(latestHistoryEntry.timestamp), " - ", latestHistoryEntry.summary) : null)))), habit.notes ? /* @__PURE__ */ React7.createElement(SectionPanel, null, /* @__PURE__ */ React7.createElement(PanelHeader, null, /* @__PURE__ */ React7.createElement(PanelTitle, { title: "Notas" })), /* @__PURE__ */ React7.createElement("p", { className: "habitosView__habitNotes" }, habit.notes)) : null));
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
  return /* @__PURE__ */ React7.createElement(SplitLayout, { variant: "sidebar-detail", className: "habitosView__habitSplit" }, /* @__PURE__ */ React7.createElement(SplitSidebar, { className: "habitosView__habitSidebar" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__settingsSectionHeader" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__settingsSectionCopy" }, /* @__PURE__ */ React7.createElement("strong", null, "Habitos"), /* @__PURE__ */ React7.createElement("span", null, "Activos y en pausa")), /* @__PURE__ */ React7.createElement(Button, { type: "button", tone: "primary", onClick: onCreateHabit, disabled: saving }, "Nuevo habito")), /* @__PURE__ */ React7.createElement(ScrollRegion, { className: "habitosView__habitSidebarScroll" }, habits.length ? /* @__PURE__ */ React7.createElement(PanelStack, { className: "habitosView__habitSidebarStack" }, /* @__PURE__ */ React7.createElement(
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
  ), /* @__PURE__ */ React7.createElement(
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
  )) : /* @__PURE__ */ React7.createElement(
    StateBlock,
    {
      title: "Todavia no hay habitos.",
      description: "Crea uno nuevo para administrarlo desde aqui."
    },
    /* @__PURE__ */ React7.createElement(Button, { type: "button", tone: "primary", onClick: onCreateHabit, disabled: saving }, "Crear habito")
  ))), /* @__PURE__ */ React7.createElement(SplitDetail, { className: "habitosView__habitDetail" }, selectedHabit ? /* @__PURE__ */ React7.createElement(
    HabitDetailsPanel,
    {
      habit: selectedHabit,
      home,
      presetOverrides,
      saving,
      onEdit: () => onEditHabit(selectedHabit),
      onToggleStatus: () => onToggleHabitStatus(selectedHabit)
    }
  ) : /* @__PURE__ */ React7.createElement(
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
  return /* @__PURE__ */ React7.createElement(
    "button",
    {
      type: "button",
      className: ["habitosView__categorySettingRow", isSelected ? "is-selected" : ""].filter(Boolean).join(" "),
      onClick: onSelect
    },
    /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categorySettingRowCopy" }, /* @__PURE__ */ React7.createElement("strong", null, category.name)),
    /* @__PURE__ */ React7.createElement(
      "span",
      {
        className: "habitosView__categorySettingRowBadge",
        style: { background: category.color },
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React7.createElement(RemoteCategoryIcon, { iconId: category.iconId, size: "l" })
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
  return /* @__PURE__ */ React7.createElement(SplitLayout, { variant: "sidebar-detail", className: "habitosView__habitSplit" }, /* @__PURE__ */ React7.createElement(SplitSidebar, { className: "habitosView__habitSidebar" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__settingsSectionHeader" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__settingsSectionCopy" }, /* @__PURE__ */ React7.createElement("strong", null, "Categorias"), /* @__PURE__ */ React7.createElement("span", null, "Color e icono")), /* @__PURE__ */ React7.createElement(Button, { type: "button", tone: "primary", onClick: onCreateCategory, disabled: saving }, "Nueva categoria")), /* @__PURE__ */ React7.createElement(ScrollRegion, { className: "habitosView__habitSidebarScroll" }, categories.length ? /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categorySettingsList" }, categories.map((category) => /* @__PURE__ */ React7.createElement(
    CategorySettingsListItem,
    {
      key: category.id,
      category,
      isSelected: selectedCategoryId === category.id,
      onSelect: () => onSelectCategory(category.id)
    }
  ))) : /* @__PURE__ */ React7.createElement(
    StateBlock,
    {
      title: "Sin categorias.",
      description: "Crea una categoria para reutilizarla en tus habitos."
    },
    /* @__PURE__ */ React7.createElement(Button, { type: "button", tone: "primary", onClick: onCreateCategory, disabled: saving }, "Crear categoria")
  ))), /* @__PURE__ */ React7.createElement(SplitDetail, { className: "habitosView__habitDetail" }, builderOpen ? /* @__PURE__ */ React7.createElement(PanelStack, null, /* @__PURE__ */ React7.createElement(SectionPanel, { tone: "highlight" }, /* @__PURE__ */ React7.createElement(PanelHeader, null, /* @__PURE__ */ React7.createElement(
    PanelTitle,
    {
      title: builderDraft?.id ? "Editar categoria" : "Nueva categoria"
    }
  )), /* @__PURE__ */ React7.createElement(
    CustomHabitCategoryBuilder,
    {
      draft: builderDraft,
      saving,
      error: builderError,
      onChange: onChangeCategoryBuilder,
      onCancel: onCloseCategoryBuilder,
      onSave: onSaveCategoryBuilder
    }
  ))) : selectedCategory ? /* @__PURE__ */ React7.createElement(PanelStack, null, /* @__PURE__ */ React7.createElement(SectionPanel, { tone: "highlight" }, /* @__PURE__ */ React7.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React7.createElement("div", { className: "habitosView__habitDetailActions" }, /* @__PURE__ */ React7.createElement(Button, { type: "button", onClick: () => onEditCategory(selectedCategory), disabled: saving }, /* @__PURE__ */ React7.createElement(PencilIcon2, null), /* @__PURE__ */ React7.createElement("span", null, "Editar")), /* @__PURE__ */ React7.createElement(Button, { type: "button", tone: "danger", onClick: () => onDeleteCategory(selectedCategory), disabled: saving }, /* @__PURE__ */ React7.createElement(TrashIcon2, null), /* @__PURE__ */ React7.createElement("span", null, "Eliminar")))
    },
    /* @__PURE__ */ React7.createElement(
      PanelTitle,
      {
        title: selectedCategory.name,
        description: selectedCategory.kind === "preset" ? "Categoria base" : "Categoria personalizada"
      }
    )
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryDetailHero" }, /* @__PURE__ */ React7.createElement(
    "span",
    {
      className: "habitosView__categoryDetailHeroIcon",
      style: { background: selectedCategory.color },
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React7.createElement(RemoteCategoryIcon, { iconId: selectedCategory.iconId, size: "xxl" })
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryMetaList" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, "Nombre"), /* @__PURE__ */ React7.createElement("strong", null, selectedCategory.name)), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, "Color"), /* @__PURE__ */ React7.createElement("strong", null, selectedCategory.color.toUpperCase())), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__categoryMetaRow" }, /* @__PURE__ */ React7.createElement("span", null, "Icono"), /* @__PURE__ */ React7.createElement("strong", null, selectedCategory.iconId.replace(/^[^:]+:/, ""))))))) : /* @__PURE__ */ React7.createElement(
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
  return /* @__PURE__ */ React7.createElement(SectionPanel, { tone: "highlight", className: "habitosView__modalPanel habitosView__drawerPanel" }, /* @__PURE__ */ React7.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React7.createElement("div", { className: "habitosView__drawerHeaderActions" }, /* @__PURE__ */ React7.createElement(Button, { type: "button", onClick: onClose, disabled: saving }, "Cerrar"))
    },
    /* @__PURE__ */ React7.createElement(PanelTitle, { title: "Configuraciones" })
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosView__drawerBody" }, /* @__PURE__ */ React7.createElement(SplitLayout, { variant: "sidebar-detail", className: "habitosView__settingsSplit" }, /* @__PURE__ */ React7.createElement(SplitSidebar, { className: "habitosView__settingsSidebar" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__settingsTabs" }, tabOptions.map((tab) => /* @__PURE__ */ React7.createElement(
    "button",
    {
      key: tab.id,
      type: "button",
      className: ["habitosView__settingsTab", activeTab === tab.id ? "is-active" : ""].filter(Boolean).join(" "),
      onClick: () => onChangeTab(tab.id)
    },
    /* @__PURE__ */ React7.createElement("span", null, tab.label)
  )))), /* @__PURE__ */ React7.createElement(SplitDetail, { className: "habitosView__settingsDetail" }, activeTab === "habits" ? /* @__PURE__ */ React7.createElement(
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
  ) : activeTab === "categories" ? /* @__PURE__ */ React7.createElement(
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
  ) : null))));
}
function LifeTrackerView({ ctx, input = null }) {
  const systemToday = todayLocalDate3();
  const pluginSettings = ctx.settings.useValue();
  const pluginSettingsRef = useRef6(pluginSettings);
  const legacyHabitsSettingsApi = useMemo3(
    () => ctx.createPluginSettingsApi("nexus.habitos"),
    [ctx]
  );
  const legacyHabitsSettings = legacyHabitsSettingsApi.useValue();
  const trainingSettingsApi = useMemo3(
    () => createMigratedPluginSettingsApi(ctx, `${LIFE_TRACKER_PLUGIN_ID}.training`, {
      defaults: TRAINING_SETTINGS_DEFAULTS,
      legacyPluginId: "nexus.training"
    }),
    [ctx]
  );
  const financeSettingsApi = useMemo3(
    () => createMigratedPluginSettingsApi(ctx, `${LIFE_TRACKER_PLUGIN_ID}.finance`, {
      legacyPluginId: "nexus.finanzas"
    }),
    [ctx]
  );
  const activeSection = typeof input?.section === "string" && input.section.trim() ? input.section : LIFE_TRACKER_DEFAULT_SECTION;
  const dashboardEditMode = Boolean(input?.dashboardEditMode);
  useEffect6(() => {
    if (!ctx?.setWorkspaceFrameActions || !ctx?.clearWorkspaceFrameActions) {
      return void 0;
    }
    if (activeSection !== "home") {
      ctx.clearWorkspaceFrameActions(LIFE_TRACKER_WORKSPACE_VIEW_ID);
      return void 0;
    }
    ctx.setWorkspaceFrameActions(LIFE_TRACKER_WORKSPACE_VIEW_ID, [
      {
        id: "life-tracker-edit-canvas",
        placement: "side-toolbar-context",
        icon: PencilIcon2,
        title: dashboardEditMode ? "Salir de edicion del lienzo" : "Editar lienzo",
        active: dashboardEditMode,
        pressed: dashboardEditMode,
        onClick: () => {
          void ctx.openView({
            viewId: LIFE_TRACKER_WORKSPACE_VIEW_ID,
            reuse: true,
            sourceId: "nexus.life-tracker.canvas-edit",
            input: {
              ...input && typeof input === "object" ? input : {},
              section: "home",
              dashboardEditMode: !dashboardEditMode
            }
          });
        }
      }
    ]);
    return () => {
      ctx.clearWorkspaceFrameActions(LIFE_TRACKER_WORKSPACE_VIEW_ID);
    };
  }, [activeSection, ctx, dashboardEditMode, input]);
  useEffect6(() => {
    if (activeSection === "home" || !dashboardEditMode) {
      return;
    }
    void ctx.openView({
      viewId: LIFE_TRACKER_WORKSPACE_VIEW_ID,
      reuse: true,
      sourceId: "nexus.life-tracker.canvas-edit-exit",
      input: {
        ...input && typeof input === "object" ? input : {},
        dashboardEditMode: false
      }
    });
  }, [activeSection, ctx, dashboardEditMode, input]);
  const widgetProviders = ctx.useWidgetProviders();
  const lifeTrackerWidgetProviders = useMemo3(
    () => widgetProviders.filter((provider) => provider?.pluginId === LIFE_TRACKER_PLUGIN_ID).sort((left, right) => Number(left?.order || 0) - Number(right?.order || 0)),
    [widgetProviders]
  );
  const canvasWidgetProviders = useMemo3(() => {
    if (lifeTrackerWidgetProviders.length) {
      return lifeTrackerWidgetProviders;
    }
    return LIFE_TRACKER_HOME_WIDGET_PROVIDERS.map((provider) => ({
      ...provider,
      pluginId: LIFE_TRACKER_PLUGIN_ID
    }));
  }, [lifeTrackerWidgetProviders]);
  const presetCategoryOverrides = useMemo3(
    () => readHabitCategoryPresetOverrides(pluginSettings),
    [pluginSettings]
  );
  const canvasStateValue = useMemo3(
    () => readLifeTrackerCanvasState(pluginSettings),
    [pluginSettings]
  );
  const migratedCanvasState = useMemo3(() => {
    if (canvasStateValue) {
      return canvasStateValue;
    }
    const legacyLayouts = readHabitosDashboardLayouts(legacyHabitsSettings);
    return createCanvasStateFromLegacyLayouts(
      legacyLayouts,
      canvasWidgetProviders,
      {
        breakpoints: HABITOS_DASHBOARD_BREAKPOINTS,
        colsByBreakpoint: HABITOS_DASHBOARD_COLS
      }
    );
  }, [canvasStateValue, canvasWidgetProviders, legacyHabitsSettings]);
  const [home, setHome] = useState7(createEmptyHome);
  const [loading, setLoading] = useState7(true);
  const [saving, setSaving] = useState7(false);
  const [error, setError] = useState7("");
  const [modalMode, setModalMode] = useState7("overview");
  const [isHabitsDrawerOpen, setIsHabitsDrawerOpen] = useState7(false);
  const [settingsTab, setSettingsTab] = useState7("habits");
  const [selectedHabitId, setSelectedHabitId] = useState7("");
  const [selectedCategoryId, setSelectedCategoryId] = useState7("");
  const [taskDraft, setTaskDraft] = useState7(createTaskDraft());
  const [habitDraft, setHabitDraft] = useState7(createHabitDraft());
  const [habitWizardError, setHabitWizardError] = useState7("");
  const [categoryBuilderOpen, setCategoryBuilderOpen] = useState7(false);
  const [categoryBuilderDraft, setCategoryBuilderDraft] = useState7(createHabitCategoryDraft());
  const [categoryBuilderError, setCategoryBuilderError] = useState7("");
  const [taskAdvancedOpen, setTaskAdvancedOpen] = useState7(false);
  const [habitStep, setHabitStep] = useState7(0);
  const [trainingLibrary, setTrainingLibrary] = useState7(EMPTY_TRAINING_LIBRARY);
  const [trainingLibraryLoading, setTrainingLibraryLoading] = useState7(false);
  const [trainingLibraryError, setTrainingLibraryError] = useState7("");
  const [trainingAssignmentDraft, setTrainingAssignmentDraft] = useState7(createRoutineAssignmentDraft());
  const [trainingAssignmentError, setTrainingAssignmentError] = useState7("");
  const [routineCaptureDraft, setRoutineCaptureDraft] = useState7(null);
  const [routineCaptureError, setRoutineCaptureError] = useState7("");
  const [trainingRefreshToken, setTrainingRefreshToken] = useState7(0);
  const [queueMenu, setQueueMenu] = useState7(null);
  const [categoryMenu, setCategoryMenu] = useState7(null);
  const [expandedQueueSubitemIds, setExpandedQueueSubitemIds] = useState7([]);
  const [manualEditableOccurrenceIds, setManualEditableOccurrenceIds] = useState7([]);
  const [viewDate, setViewDate] = useState7(systemToday);
  const viewDatePickerRef = useRef6(null);
  const canvasMigrationSettingsPromiseRef = useRef6(null);
  const lastHabitStepIndex = HABIT_EDITOR_STEPS.length - 1;
  const managedCategories = useMemo3(
    () => buildManagedHabitCategories(home.categoryCatalog, presetCategoryOverrides),
    [home.categoryCatalog, presetCategoryOverrides]
  );
  useEffect6(() => {
    pluginSettingsRef.current = pluginSettings;
  }, [pluginSettings]);
  useEffect6(() => {
    setHabitStep((currentValue) => Math.min(Math.max(currentValue, 0), lastHabitStepIndex));
  }, [lastHabitStepIndex]);
  useEffect6(() => {
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
  useEffect6(() => {
    if (!canvasWidgetProviders.length) {
      return void 0;
    }
    let cancelled = false;
    let settingsPromise = canvasMigrationSettingsPromiseRef.current;
    if (!settingsPromise) {
      settingsPromise = Promise.all([ctx.settings.get(), legacyHabitsSettingsApi.get()]);
      canvasMigrationSettingsPromiseRef.current = settingsPromise;
    }
    void settingsPromise.then(([currentSettings, legacySettings]) => {
      if (cancelled) {
        return;
      }
      const currentCanvasState = readLifeTrackerCanvasState(currentSettings);
      const legacyLayouts = readHabitosDashboardLayouts(legacySettings);
      const canvasOptions = {
        breakpoints: HABITOS_DASHBOARD_BREAKPOINTS,
        colsByBreakpoint: HABITOS_DASHBOARD_COLS
      };
      const defaultCanvasState = createCanvasStateFromLegacyLayouts(
        null,
        canvasWidgetProviders,
        canvasOptions
      );
      const legacyCanvasState = createCanvasStateFromLegacyLayouts(
        legacyLayouts,
        canvasWidgetProviders,
        canvasOptions
      );
      const hasLegacyCustomLayout = !hasSameCanvasLayouts(legacyCanvasState, defaultCanvasState);
      const needsInitialMigration = !currentCanvasState;
      const needsLegacyRecovery = hasLegacyCustomLayout && hasSameCanvasLayouts(currentCanvasState, defaultCanvasState);
      if (!needsInitialMigration && !needsLegacyRecovery) {
        return;
      }
      return ctx.settings.set(
        writeLifeTrackerCanvasState(currentSettings, legacyCanvasState)
      );
    }).catch((migrationError) => {
      if (canvasMigrationSettingsPromiseRef.current === settingsPromise) {
        canvasMigrationSettingsPromiseRef.current = null;
      }
      if (!cancelled) {
        console.warn("[life-tracker] No se pudo migrar el layout del lienzo:", migrationError);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [canvasWidgetProviders, ctx.settings, legacyHabitsSettingsApi]);
  useEffect6(() => {
    const currentCanvasState = readLifeTrackerCanvasState(pluginSettings);
    if (!currentCanvasState || !canvasWidgetProviders.length) {
      return;
    }
    const canvasOptions = {
      breakpoints: HABITOS_DASHBOARD_BREAKPOINTS,
      colsByBreakpoint: HABITOS_DASHBOARD_COLS
    };
    const defaultCanvasState = createCanvasStateFromLegacyLayouts(
      null,
      canvasWidgetProviders,
      canvasOptions
    );
    const legacyCanvasState = createCanvasStateFromLegacyLayouts(
      readHabitosDashboardLayouts(legacyHabitsSettings),
      canvasWidgetProviders,
      canvasOptions
    );
    const hasLegacyCustomLayout = !hasSameCanvasLayouts(legacyCanvasState, defaultCanvasState);
    const needsLegacyRecovery = hasLegacyCustomLayout && hasSameCanvasLayouts(currentCanvasState, defaultCanvasState);
    if (needsLegacyRecovery) {
      void ctx.settings.set(
        writeLifeTrackerCanvasState(pluginSettings, legacyCanvasState)
      );
    }
  }, [canvasWidgetProviders, ctx.settings, legacyHabitsSettings, pluginSettings]);
  useEffect6(() => {
    const baseSettings = pluginSettings && typeof pluginSettings === "object" ? pluginSettings : {};
    if (baseSettings[LIFE_TRACKER_HABIT_CATEGORY_PRESET_OVERRIDES_KEY]) {
      return;
    }
    const legacySettings = legacyHabitsSettings && typeof legacyHabitsSettings === "object" ? legacyHabitsSettings : {};
    if (!legacySettings[LIFE_TRACKER_LEGACY_HABIT_CATEGORY_PRESET_OVERRIDES_KEY]) {
      return;
    }
    void ctx.settings.set(
      writeHabitCategoryPresetOverrides(pluginSettings, readHabitCategoryPresetOverrides(legacySettings))
    );
  }, [ctx.settings, legacyHabitsSettings, pluginSettings]);
  useEffect6(() => {
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
  useEffect6(() => {
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
  useEffect6(() => {
    const visibleExpandableQueueIds = new Set(
      home.dailyQueue.filter((entry) => entry.type === "habit" && entry.progressMode === "checklist" || entry.type === "task" && Array.isArray(entry.subitems) && entry.subitems.length).map((entry) => entry.id)
    );
    setExpandedQueueSubitemIds((currentValue) => currentValue.filter((entry) => visibleExpandableQueueIds.has(entry)));
  }, [home.dailyQueue]);
  useEffect6(() => {
    const visibleOccurrenceIds = new Set(
      home.dailyQueue.filter((entry) => entry.type === "habit" && !entry.isProjected).map((entry) => entry.recordId)
    );
    setManualEditableOccurrenceIds((currentValue) => currentValue.filter((entry) => visibleOccurrenceIds.has(entry)));
  }, [home.dailyQueue, viewDate]);
  const loadHome = async (requestedDate = systemToday) => {
    setLoading(true);
    setError("");
    try {
      const nextHome = await invoke2(LIFE_TRACKER_HABITS_CHANNELS.getHome, {
        date: requestedDate
      });
      startTransition2(() => {
        setHome(nextHome || createEmptyHome());
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Life Tracker.");
    } finally {
      setLoading(false);
    }
  };
  const loadTrainingLibrary = async ({ silent = false } = {}) => {
    if (!silent) {
      setTrainingLibraryLoading(true);
    }
    setTrainingLibraryError("");
    try {
      const nextLibrary = await invoke2(LIFE_TRACKER_TRAINING_CHANNELS.list);
      setTrainingLibrary(nextLibrary || EMPTY_TRAINING_LIBRARY);
      return nextLibrary || EMPTY_TRAINING_LIBRARY;
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "No se pudo cargar la biblioteca de entrenamiento.";
      setTrainingLibraryError(message);
      return null;
    } finally {
      if (!silent) {
        setTrainingLibraryLoading(false);
      }
    }
  };
  useEffect6(() => {
    if (activeSection !== "home") {
      return;
    }
    void loadHome(viewDate);
  }, [activeSection, viewDate]);
  const openLifeTrackerSection = (section) => {
    void ctx.openView({
      viewId: LIFE_TRACKER_WORKSPACE_VIEW_ID,
      reuse: true,
      sourceId: "nexus.life-tracker.section",
      input: {
        ...input && typeof input === "object" ? input : {},
        section,
        dashboardEditMode: section === "home" ? dashboardEditMode : false
      }
    });
  };
  const financeCtx = useMemo3(
    () => ({
      ...ctx,
      pluginId: `${LIFE_TRACKER_PLUGIN_ID}.finance`,
      settings: financeSettingsApi
    }),
    [ctx, financeSettingsApi]
  );
  const trainingCtx = useMemo3(
    () => ({
      ...ctx,
      pluginId: `${LIFE_TRACKER_PLUGIN_ID}.training`,
      settings: trainingSettingsApi
    }),
    [ctx, trainingSettingsApi]
  );
  const openTaskEditor = (source = null) => {
    setQueueMenu(null);
    setError("");
    setTaskDraft(createTaskDraft(source));
    setTaskAdvancedOpen(Boolean(
      source?.notes || source?.time || source?.reminderAt || source?.subitemsBlocking || source?.isPersistent === false
    ));
    setModalMode("task");
  };
  const openHabitEditor = (source = null) => {
    setQueueMenu(null);
    setError("");
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
    setError("");
    setModalMode("create");
  };
  const openRoutineAssignmentEditor = (source = null) => {
    setQueueMenu(null);
    setCategoryMenu(null);
    setError("");
    setTrainingAssignmentError("");
    setTrainingAssignmentDraft(createRoutineAssignmentDraft(source));
    setModalMode("routine-assignment");
    void loadTrainingLibrary();
  };
  const openRoutineCaptureEditor = (item) => {
    setQueueMenu(null);
    setCategoryMenu(null);
    setError("");
    setRoutineCaptureError("");
    setRoutineCaptureDraft(createRoutineCaptureDraft(item));
    setModalMode("routine-capture");
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
    setTrainingAssignmentDraft(createRoutineAssignmentDraft());
    setTrainingAssignmentError("");
    setRoutineCaptureDraft(null);
    setRoutineCaptureError("");
  };
  const applyHomeUpdate = (nextHome) => {
    startTransition2(() => {
      setHome(nextHome || createEmptyHome());
    });
  };
  const runMutation = async (channel, payload, { onSuccess } = {}) => {
    setSaving(true);
    setError("");
    try {
      const nextHome = await invoke2(channel, {
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
  const runTrainingMutation = async (channel, payload, {
    onSuccess,
    refreshHome = true,
    refreshTraining = true
  } = {}) => {
    setSaving(true);
    setError("");
    try {
      const result = await invoke2(channel, payload || {});
      if (refreshHome && activeSection === "home") {
        await loadHome(viewDate);
      }
      if (refreshTraining) {
        await loadTrainingLibrary({ silent: true });
        setTrainingRefreshToken((currentValue) => currentValue + 1);
      }
      await onSuccess?.(result);
      return result;
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "No se pudo completar la operacion.");
      return null;
    } finally {
      setSaving(false);
    }
  };
  const handleTrainingAssignmentDraftChange = (field, value) => {
    setTrainingAssignmentError("");
    setTrainingAssignmentDraft((currentValue) => ({
      ...currentValue,
      [field]: value
    }));
  };
  const handleToggleTrainingWeekday = (weekday) => {
    setTrainingAssignmentError("");
    setTrainingAssignmentDraft((currentValue) => {
      const isActive = currentValue.weekdays.includes(weekday);
      return {
        ...currentValue,
        weekdays: isActive ? currentValue.weekdays.filter((entry) => entry !== weekday) : [...currentValue.weekdays, weekday].sort((left, right) => left - right)
      };
    });
  };
  const handleSaveRoutineAssignment = async () => {
    try {
      const payload = normalizeRoutineAssignmentPayload(trainingAssignmentDraft);
      setTrainingAssignmentError("");
      await runTrainingMutation(
        LIFE_TRACKER_TRAINING_CHANNELS.saveAssignment,
        {
          id: trainingAssignmentDraft.id || void 0,
          ...payload
        },
        {
          onSuccess: () => {
            closeWorkbench();
          }
        }
      );
    } catch (validationError) {
      setTrainingAssignmentError(
        validationError instanceof Error ? validationError.message : "No se pudo validar la programacion."
      );
    }
  };
  const handleDeleteRoutineAssignment = async (assignmentId = trainingAssignmentDraft.id) => {
    if (!assignmentId) {
      closeWorkbench();
      return;
    }
    await runTrainingMutation(
      LIFE_TRACKER_TRAINING_CHANNELS.deleteAssignment,
      {
        assignmentId
      },
      {
        onSuccess: () => {
          closeWorkbench();
        }
      }
    );
  };
  const handleRoutineCaptureStepChange = (stepId, nextActual) => {
    setRoutineCaptureError("");
    setRoutineCaptureDraft((currentValue) => {
      if (!currentValue) {
        return currentValue;
      }
      return {
        ...currentValue,
        steps: currentValue.steps.map((step) => step.id === stepId ? {
          ...step,
          actual: nextActual
        } : step)
      };
    });
  };
  const handleSaveRoutineCapture = async () => {
    if (!routineCaptureDraft?.assignmentId) {
      setRoutineCaptureError("No encontramos la rutina programada.");
      return;
    }
    const serializedResult = serializeRoutineCaptureDraft(routineCaptureDraft);
    if (!serializedResult.entries.length) {
      setRoutineCaptureError("Carga al menos un resultado antes de guardar.");
      return;
    }
    await runTrainingMutation(
      LIFE_TRACKER_TRAINING_CHANNELS.saveOccurrenceResult,
      {
        assignmentId: routineCaptureDraft.assignmentId,
        occurrenceDate: routineCaptureDraft.occurrenceDate,
        result: serializedResult
      },
      {
        onSuccess: () => {
          closeWorkbench();
        }
      }
    );
  };
  const handleClearRoutineCapture = async () => {
    if (!routineCaptureDraft?.assignmentId) {
      setRoutineCaptureError("No encontramos la rutina programada.");
      return;
    }
    await runTrainingMutation(
      LIFE_TRACKER_TRAINING_CHANNELS.saveOccurrenceResult,
      {
        assignmentId: routineCaptureDraft.assignmentId,
        occurrenceDate: routineCaptureDraft.occurrenceDate,
        clear: true
      },
      {
        onSuccess: () => {
          closeWorkbench();
        }
      }
    );
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
  const renderSharedCategoryPicker = ({
    selectedCategory: selectedCategory2 = "",
    onSelectCategory,
    saving: pickerSaving = saving
  } = {}) => /* @__PURE__ */ React7.createElement(
    HabitCategoryPicker,
    {
      categories: home.categoryCatalog,
      presetOverrides: presetCategoryOverrides,
      selectedCategory: selectedCategory2,
      saving: pickerSaving,
      builderOpen: categoryBuilderOpen,
      builderDraft: categoryBuilderDraft,
      builderError: categoryBuilderError,
      onSelectCategory: (value) => {
        setCategoryBuilderError("");
        setCategoryBuilderOpen(false);
        setCategoryMenu(null);
        onSelectCategory?.(value);
      },
      onOpenBuilder: handleOpenCategoryBuilder,
      onCloseBuilder: handleCloseCategoryBuilder,
      onChangeCategoryBuilder: handleChangeCategoryBuilder,
      onSaveBuilder: () => void handleSaveCategoryBuilder(),
      onOpenCategoryMenu: handleOpenCategoryMenu
    }
  );
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
          LIFE_TRACKER_HABITS_CHANNELS.renameCategoryReferences,
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
      LIFE_TRACKER_HABITS_CHANNELS.saveCategory,
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
        LIFE_TRACKER_HABITS_CHANNELS.clearCategoryReferences,
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
      LIFE_TRACKER_HABITS_CHANNELS.deleteCategory,
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
  const handleTaskSubitemTitleChange = (index, value) => {
    setTaskDraft((currentValue) => ({
      ...currentValue,
      subitems: currentValue.subitems.map((entry, entryIndex) => entryIndex === index ? {
        ...entry,
        title: value
      } : entry)
    }));
  };
  const handleTaskSubitemMove = (fromIndex, toIndex) => {
    setTaskDraft((currentValue) => {
      if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || fromIndex < 0 || toIndex < 0 || fromIndex >= currentValue.subitems.length || toIndex >= currentValue.subitems.length || fromIndex === toIndex) {
        return currentValue;
      }
      const nextSubitems = [...currentValue.subitems];
      const [movedItem] = nextSubitems.splice(fromIndex, 1);
      nextSubitems.splice(toIndex, 0, movedItem);
      return {
        ...currentValue,
        subitems: nextSubitems.map((entry, index) => ({
          ...entry,
          sortOrder: index
        }))
      };
    });
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
        const nextStartDate = value || todayLocalDate3();
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
  const handleSelectHabitProgressMode = (value) => {
    setHabitWizardError("");
    setHabitDraft((currentValue) => ({
      ...currentValue,
      progressMode: value
    }));
  };
  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.saveTask,
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
    const validateHabitCategoryStep = () => {
      if (!String(habitDraft.category || "").trim()) {
        setHabitWizardError("Elige una categoria para continuar.");
        return false;
      }
      return true;
    };
    const validateHabitEvaluationStep = () => {
      if (!String(habitDraft.progressMode || "").trim()) {
        setHabitWizardError("Elige como quieres evaluar tu progreso.");
        return false;
      }
      const normalizedTitle = String(habitDraft.title || "").trim();
      if (!normalizedTitle) {
        setHabitWizardError("El nombre del habito es obligatorio.");
        return false;
      }
      if (habitDraft.progressMode === "quantity") {
        if (habitDraft.quantityMode !== "no-target" && String(habitDraft.quantityTarget || "").trim() === "") {
          setHabitWizardError("Define el objetivo numerico para continuar.");
          return false;
        }
      }
      if (habitDraft.progressMode === "checklist") {
        const items = habitDraft.checklistItems.map((entry) => String(entry.title || "").trim());
        if (!items.some(Boolean)) {
          setHabitWizardError("Agrega al menos un sub-item.");
          return false;
        }
        if (items.some((entry) => !entry)) {
          setHabitWizardError("Completa o elimina los sub-items vacios.");
          return false;
        }
      }
      return true;
    };
    const validateHabitFrequencyStep = () => {
      if (habitDraft.scheduleType === "weekdays" && !habitDraft.weekdays.length) {
        setHabitWizardError("Elige al menos un dia de la semana.");
        return false;
      }
      return true;
    };
    if (habitStep < lastHabitStepIndex) {
      if (habitStep === 0 && !validateHabitCategoryStep()) {
        return;
      }
      if (habitStep === 1 && !validateHabitEvaluationStep()) {
        return;
      }
      if (habitStep === 2 && !validateHabitFrequencyStep()) {
        return;
      }
      setHabitWizardError("");
      setHabitStep((currentValue) => Math.min(currentValue + 1, lastHabitStepIndex));
      return;
    }
    if (!validateHabitCategoryStep() || !validateHabitEvaluationStep() || !validateHabitFrequencyStep()) {
      return;
    }
    setHabitWizardError("");
    const nextHabitId = habitDraft.id || createDraftId("habit");
    const payload = buildHabitPayload(habitDraft, {
      id: nextHabitId
    });
    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.saveHabit,
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
      await runMutation(LIFE_TRACKER_HABITS_CHANNELS.toggleTask, {
        taskId: item.recordId
      });
      return;
    }
    if (item.type === "routine") {
      if (!canEditQueueItemResult(item)) {
        return;
      }
      if (item.completionMode === "detailed") {
        openRoutineCaptureEditor(item);
        return;
      }
      await runTrainingMutation(LIFE_TRACKER_TRAINING_CHANNELS.saveOccurrenceResult, {
        assignmentId: item.assignmentId,
        occurrenceDate: item.raw?.occurrenceDate || viewDate,
        clear: item.status === "completed"
      });
      return;
    }
    if (!canEditQueueItemResult(item)) {
      return;
    }
    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.toggleOccurrence, {
      occurrenceId: item.recordId
    });
  };
  const handleCommitOccurrenceQuantity = async (item, value) => {
    if (!canEditQueueItemResult(item)) {
      return;
    }
    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.setOccurrenceQuantity, {
      occurrenceId: item.recordId,
      value
    });
  };
  const handleToggleOccurrenceChecklistItem = async (item, itemId) => {
    if (!canEditQueueItemResult(item)) {
      return;
    }
    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.toggleOccurrenceChecklistItem, {
      occurrenceId: item.recordId,
      itemId
    });
  };
  const handleToggleTaskSubitem = async (item, subitemId) => {
    if (item.type !== "task" || viewDate !== actualToday || item.status === "completed") {
      return;
    }
    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.toggleTaskSubitem, {
      taskId: item.recordId,
      subitemId
    });
  };
  const handleToggleQueueSubitemsExpanded = (queueItemId) => {
    setExpandedQueueSubitemIds((currentValue) => currentValue.includes(queueItemId) ? currentValue.filter((entry) => entry !== queueItemId) : [...currentValue, queueItemId]);
  };
  const enableManualOccurrenceEdit = (occurrenceId) => {
    setManualEditableOccurrenceIds((currentValue) => currentValue.includes(occurrenceId) ? currentValue : [...currentValue, occurrenceId]);
  };
  const disableManualOccurrenceEdit = (occurrenceId) => {
    setManualEditableOccurrenceIds((currentValue) => currentValue.filter((entry) => entry !== occurrenceId));
  };
  const canEditQueueItemResult = (item) => {
    if (!item) {
      return false;
    }
    if (item.type === "routine") {
      return !isFutureView;
    }
    if (item.type !== "habit" || item.isProjected) {
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
  const handleDeleteQueueItem = async (item) => {
    if (item.type === "task") {
      await runMutation(LIFE_TRACKER_HABITS_CHANNELS.deleteTask, {
        taskId: item.raw?.id || item.recordId
      });
      return;
    }
    if (item.type === "routine") {
      await handleDeleteRoutineAssignment(item.assignmentId);
      return;
    }
    await runMutation(LIFE_TRACKER_HABITS_CHANNELS.deleteHabit, {
      habitId: item.habit?.id
    });
  };
  const handleToggleHabitStatus = async (habit) => {
    setSelectedHabitId(habit.id);
    await runMutation(
      LIFE_TRACKER_HABITS_CHANNELS.saveHabit,
      buildHabitPayload(habit, {
        status: habit.status === "active" ? "archived" : "active"
      })
    );
  };
  const renderSecondaryTask = (task) => {
    const accent = resolveQueueCategoryPresentation({
      type: "task",
      title: task.title,
      category: task.category
    }, home.categoryCatalog, presetCategoryOverrides);
    const secondaryParts = [
      task.category || "",
      formatLocalDate(task.dueDate),
      task.time || ""
    ].filter(Boolean);
    return /* @__PURE__ */ React7.createElement(
      "article",
      {
        key: task.id,
        className: [
          "habitosView__secondaryCard",
          queueMenu?.item?.id === `upcoming-task:${task.id}` ? "is-selected" : ""
        ].filter(Boolean).join(" "),
        onContextMenu: (event) => handleOpenQueueMenu(event, buildUpcomingTaskMenuItem(task))
      },
      /* @__PURE__ */ React7.createElement(
        "span",
        {
          className: "habitosView__secondaryCardIcon",
          style: { "--habitos-item-accent": accent.color },
          "aria-hidden": "true"
        },
        /* @__PURE__ */ React7.createElement(ClockIcon, null)
      ),
      /* @__PURE__ */ React7.createElement("div", { className: "habitosView__secondaryCardCopy" }, /* @__PURE__ */ React7.createElement("strong", null, task.title), /* @__PURE__ */ React7.createElement("span", null, secondaryParts.join(" - ")))
    );
  };
  const renderDailyQueueItem = (item) => {
    const accent = resolveQueueCategoryPresentation(item, home.categoryCatalog, presetCategoryOverrides);
    const isTask = item.type === "task";
    const isRoutine = item.type === "routine";
    const isChecklistHabit = item.type === "habit" && item.progressMode === "checklist";
    const isQuantityHabit = item.type === "habit" && item.progressMode === "quantity";
    const toggleDisabled = isTask ? viewDate !== actualToday : !canEditQueueItemResult(item);
    const toggleMeta = getQueueToggleMeta(item);
    const secondaryCopy = isRoutine ? [item.meta, item.summary].filter(Boolean).join(" - ") : isTask ? [item.category, item.meta || item.summary].filter(Boolean).join(" - ") : "";
    let subitems = null;
    if (isChecklistHabit) {
      const checklistItems = getHabitChecklistItemsValue(item);
      const checkedIds = new Set(
        Array.isArray(item?.progressDataJson?.checkedItemIds) ? item.progressDataJson.checkedItemIds : []
      );
      subitems = {
        label: `Sub-items ${getChecklistProgressSummary(item)}`,
        isExpanded: expandedQueueSubitemIds.includes(item.id),
        toggleDisabled,
        items: checklistItems.map((checklistItem) => ({
          id: checklistItem.id,
          title: checklistItem.title,
          isCompleted: checkedIds.has(checklistItem.id)
        }))
      };
    } else if (isTask && Array.isArray(item.subitems) && item.subitems.length) {
      subitems = {
        label: `Sub-items ${getTaskSubitemsProgressSummary(item)}`,
        isExpanded: expandedQueueSubitemIds.includes(item.id),
        toggleDisabled: viewDate !== actualToday || item.status === "completed",
        items: item.subitems.map((subitem) => ({
          id: subitem.id,
          title: subitem.title,
          isCompleted: Boolean(subitem.isCompleted)
        }))
      };
    }
    return /* @__PURE__ */ React7.createElement(
      QueueItemCard,
      {
        key: item.id,
        item,
        badge: {
          accentColor: accent.color,
          icon: isTask ? /* @__PURE__ */ React7.createElement(ClockIcon, null) : /* @__PURE__ */ React7.createElement(RemoteCategoryIcon, { iconId: accent.iconId, color: accent.color })
        },
        secondaryCopy,
        toggleMeta: toggleMeta ? { ...toggleMeta, disabled: toggleDisabled } : null,
        isSelected: queueMenu?.item?.id === item.id,
        isSettled: isQueueItemSettled(item),
        saving,
        showStatusPill: shouldShowQueueStatusPill(item),
        quantityControl: isQuantityHabit ? /* @__PURE__ */ React7.createElement("div", { className: "habitosView__queueQuantityControl" }, /* @__PURE__ */ React7.createElement(
          QuantityQueueInput,
          {
            item,
            disabled: saving || !canEditQueueItemResult(item),
            onCommit: (value) => handleCommitOccurrenceQuantity(item, value)
          }
        )) : null,
        inlineActionLabel: isRoutine && item.completionMode === "detailed" ? getRoutineDetailedActionLabel(item) : "",
        inlineActionDisabled: !canEditQueueItemResult(item),
        subitems,
        onToggle: () => void handleToggleQueueItem(item),
        onInlineAction: () => void handleToggleQueueItem(item),
        onContextMenu: handleOpenQueueMenu,
        onToggleExpanded: handleToggleQueueSubitemsExpanded,
        onToggleSubitem: (queueItem, itemId) => {
          if (queueItem.type === "task") {
            return void handleToggleTaskSubitem(queueItem, itemId);
          }
          return void handleToggleOccurrenceChecklistItem(queueItem, itemId);
        }
      }
    );
  };
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
  const renderDailyQueueWidget = () => /* @__PURE__ */ React7.createElement(SectionPanel, { className: "habitosDashboard__widget habitosView__queuePanel" }, /* @__PURE__ */ React7.createElement(
    PanelHeader,
    {
      actions: /* @__PURE__ */ React7.createElement("div", { className: "habitosView__panelActions" }, /* @__PURE__ */ React7.createElement("div", { className: "habitosView__dayNavigator" }, /* @__PURE__ */ React7.createElement(
        "button",
        {
          type: "button",
          className: "habitosView__dayNavButton",
          onClick: () => handleShiftViewDate(-1),
          disabled: loading || saving,
          "aria-label": "Dia anterior"
        },
        /* @__PURE__ */ React7.createElement(ChevronLeftIcon, null)
      ), /* @__PURE__ */ React7.createElement(
        "button",
        {
          type: "button",
          className: "habitosView__dayNavCurrent",
          onClick: handleOpenViewDatePicker,
          disabled: loading || saving,
          "aria-label": "Elegir fecha"
        },
        /* @__PURE__ */ React7.createElement("span", null, formatVisibleDateLabel(viewDate))
      ), /* @__PURE__ */ React7.createElement(
        "button",
        {
          type: "button",
          className: "habitosView__dayNavButton",
          onClick: () => handleShiftViewDate(1),
          disabled: loading || saving,
          "aria-label": "Dia siguiente"
        },
        /* @__PURE__ */ React7.createElement(ChevronRightIcon, null)
      ), viewDate !== actualToday ? /* @__PURE__ */ React7.createElement(
        Button,
        {
          type: "button",
          tone: "secondary",
          onClick: () => handleSelectViewDate(actualToday),
          disabled: loading || saving
        },
        "Volver a hoy"
      ) : null, /* @__PURE__ */ React7.createElement(
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
      )), /* @__PURE__ */ React7.createElement(
        CyberIconButton,
        {
          type: "button",
          "aria-label": "Configuraciones",
          title: "Configuraciones",
          onClick: openHabitsDrawer
        },
        /* @__PURE__ */ React7.createElement(SettingsIcon, null)
      ), /* @__PURE__ */ React7.createElement(CyberIconButton, { type: "button", tone: "primary", "aria-label": "Crear nuevo", onClick: openCreateChooser }, /* @__PURE__ */ React7.createElement(PlusIcon2, null)))
    },
    /* @__PURE__ */ React7.createElement(
      DashboardPanelTitle,
      {
        title: dailyPanelTitle,
        description: dailyPanelDescription,
        editMode: dashboardEditMode
      }
    )
  ), /* @__PURE__ */ React7.createElement("div", { className: "habitosDashboard__widgetBody habitosView__queuePanelBody" }, loading ? /* @__PURE__ */ React7.createElement(StateBlock, { title: "Cargando..." }) : home.dailyQueue.length ? /* @__PURE__ */ React7.createElement("div", { className: "habitosView__queueList" }, home.dailyQueue.map(renderDailyQueueItem)) : /* @__PURE__ */ React7.createElement(
    StateBlock,
    {
      title: isPastView ? "No hay historial para esta fecha." : isFutureView ? "No hay actividad prevista para esta fecha." : "No hay actividad para hoy."
    }
  )));
  const renderHabitOutcomeWidget = () => /* @__PURE__ */ React7.createElement(HabitOutcomePanel, { chart: home.habitOutcomeChart, dashboardEditMode });
  const renderUpcomingTasksWidget = () => /* @__PURE__ */ React7.createElement(
    SecondaryListCard,
    {
      title: "Tareas proximas",
      items: viewDate === actualToday ? home.upcomingTasks : [],
      emptyTitle: viewDate === actualToday ? "Sin tareas proximas." : "Disponible solo para hoy.",
      renderItem: renderSecondaryTask,
      dashboardEditMode
    }
  );
  const persistHomeCanvasState = async (nextCanvasState) => {
    await ctx.settings.set(
      writeLifeTrackerCanvasState(pluginSettingsRef.current, nextCanvasState)
    );
  };
  const lifeTrackerWidgetContext = {
    openSection: openLifeTrackerSection,
    renderDailyQueue: renderDailyQueueWidget,
    renderHabitOutcome: renderHabitOutcomeWidget,
    renderUpcomingTasks: renderUpcomingTasksWidget,
    trainingRefreshToken
  };
  return /* @__PURE__ */ React7.createElement(WorkspacePage, { className: "habitosView lifeTrackerView" }, activeSection === "home" ? /* @__PURE__ */ React7.createElement(WorkspaceBody, null, /* @__PURE__ */ React7.createElement(ScrollRegion, { className: "habitosView__mainScroll" }, /* @__PURE__ */ React7.createElement(PanelStack, { className: "habitosView__dashboardStack" }, error ? /* @__PURE__ */ React7.createElement(Notice, { tone: "danger" }, error) : null, /* @__PURE__ */ React7.createElement(
    CanvasWorkspace,
    {
      providers: canvasWidgetProviders,
      canvasState: migratedCanvasState,
      onPersistCanvasState: persistHomeCanvasState,
      onPersistError: (settingsError) => {
        setError(
          settingsError instanceof Error ? settingsError.message : "No se pudo guardar el lienzo de Life Tracker."
        );
      },
      editMode: dashboardEditMode,
      widgetContext: lifeTrackerWidgetContext,
      gridClassName: "habitosDashboard__grid",
      itemClassName: "habitosDashboard__item",
      editOverlayClassName: "habitosDashboard__editOverlay",
      draggableCancel: ".nexus-ui-panel-header__actions, .habitosDashboard__widgetBody, button, input, select, textarea, label, canvas",
      breakpoints: HABITOS_DASHBOARD_BREAKPOINTS,
      cols: HABITOS_DASHBOARD_COLS,
      rowHeight: HABITOS_DASHBOARD_ROW_HEIGHT,
      margin: HABITOS_DASHBOARD_MARGIN,
      containerPadding: [0, 0]
    }
  )))) : null, activeSection === "finance" ? /* @__PURE__ */ React7.createElement(PersonalFinanceView, { shellMode: "embedded", showTopbar: false }) : null, activeSection === "training" ? /* @__PURE__ */ React7.createElement(TrainingView_default, { ctx: trainingCtx, shellMode: "embedded", showTopbar: false }) : null, activeSection === "home" && queueMenu?.item ? /* @__PURE__ */ React7.createElement(
    ActionMenu,
    {
      ariaLabel: "Acciones del elemento",
      x: queueMenu.x,
      y: queueMenu.y,
      groups: [{
        id: "queue-actions",
        items: [
          queueMenu.item.type === "habit" && isPastView && !queueMenu.item.isProjected ? {
            id: "toggle-outcome-edit",
            label: manualEditableOccurrenceIds.includes(queueMenu.item.recordId) ? "Bloquear resultado" : "Editar resultado"
          } : null,
          { id: "edit", label: "Editar" },
          { id: "delete", label: "Eliminar", danger: true }
        ].filter(Boolean)
      }],
      onClose: () => setQueueMenu(null),
      onAction: (action) => {
        if (action.id === "toggle-outcome-edit") {
          const occurrenceId = queueMenu.item.recordId;
          if (manualEditableOccurrenceIds.includes(occurrenceId)) {
            disableManualOccurrenceEdit(occurrenceId);
            return;
          }
          enableManualOccurrenceEdit(occurrenceId);
          return;
        }
        if (action.id === "edit") {
          if (queueMenu.item.type === "task") {
            openTaskEditor(queueMenu.item.raw);
            return;
          }
          if (queueMenu.item.type === "routine") {
            openRoutineAssignmentEditor(queueMenu.item.assignment);
            return;
          }
          openHabitEditor(queueMenu.item.habit);
          return;
        }
        if (action.id === "delete") {
          void handleDeleteQueueItem(queueMenu.item);
        }
      }
    }
  ) : null, activeSection === "home" && categoryMenu?.option ? /* @__PURE__ */ React7.createElement(
    ActionMenu,
    {
      ariaLabel: "Acciones de categoria",
      x: categoryMenu.x,
      y: categoryMenu.y,
      groups: [{
        id: "category-actions",
        items: [
          { id: "edit", label: "Editar categoria" },
          { id: "delete", label: "Eliminar categoria", danger: true }
        ]
      }],
      onClose: () => setCategoryMenu(null),
      onAction: (action) => {
        if (action.id === "edit") {
          handleOpenCategoryBuilder({
            id: categoryMenu.option.id,
            name: categoryMenu.option.label,
            iconId: categoryMenu.option.iconId,
            color: categoryMenu.option.color
          });
          return;
        }
        if (action.id === "delete") {
          void handleDeleteCategory(categoryMenu.option);
        }
      }
    }
  ) : null, /* @__PURE__ */ React7.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: isHabitsDrawerOpen,
      saving,
      layout: "drawer",
      onClose: closeHabitsDrawer
    },
    /* @__PURE__ */ React7.createElement(
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
  ), /* @__PURE__ */ React7.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "create",
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React7.createElement(
      CreateChooserModal,
      {
        onTask: () => {
          openTaskEditor();
        },
        onHabit: () => {
          openHabitEditor();
        },
        onRoutine: () => {
          openRoutineAssignmentEditor();
        },
        onCancel: () => {
          closeWorkbench();
        }
      }
    )
  ), /* @__PURE__ */ React7.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "routine-assignment",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React7.createElement(
      RoutineAssignmentModal,
      {
        draft: trainingAssignmentDraft,
        routines: trainingLibrary.routines,
        loading: trainingLibraryLoading,
        error: trainingAssignmentError || trainingLibraryError || error,
        saving,
        onChange: handleTrainingAssignmentDraftChange,
        onToggleWeekday: handleToggleTrainingWeekday,
        onSave: () => void handleSaveRoutineAssignment(),
        onDelete: () => void handleDeleteRoutineAssignment(),
        onCancel: () => closeWorkbench(),
        onOpenTrainingSection: () => {
          closeWorkbench();
          openLifeTrackerSection("training");
        }
      }
    )
  ), /* @__PURE__ */ React7.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "routine-capture",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React7.createElement(
      RoutineCaptureModal,
      {
        draft: routineCaptureDraft,
        error: routineCaptureError || error,
        saving,
        onChangeStep: handleRoutineCaptureStepChange,
        onSave: () => void handleSaveRoutineCapture(),
        onClear: () => void handleClearRoutineCapture(),
        onCancel: () => closeWorkbench()
      }
    )
  ), /* @__PURE__ */ React7.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "task",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React7.createElement(
      TaskEditor,
      {
        draft: taskDraft,
        advancedOpen: taskAdvancedOpen,
        saving,
        renderCategoryPicker: renderSharedCategoryPicker,
        onChange: handleTaskDraftChange,
        onCommitNumber: handleTaskDraftNumberCommit,
        onAddSubitem: () => {
          setTaskDraft((currentValue) => ({
            ...currentValue,
            subitems: [
              ...currentValue.subitems,
              {
                id: createDraftId("task-subitem"),
                title: "",
                isCompleted: false
              }
            ]
          }));
        },
        onChangeSubitemTitle: handleTaskSubitemTitleChange,
        onMoveSubitem: handleTaskSubitemMove,
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
  ), /* @__PURE__ */ React7.createElement(
    FloatingWorkbenchModal,
    {
      isVisible: modalMode === "habit",
      saving,
      onClose: () => {
        closeWorkbench();
      }
    },
    /* @__PURE__ */ React7.createElement(
      HabitEditor,
      {
        draft: habitDraft,
        step: habitStep,
        saving,
        wizardError: habitWizardError,
        stepLabels: HABIT_EDITOR_STEPS,
        progressOptions: HABIT_PROGRESS_OPTIONS,
        quantityModeOptions: HABIT_QUANTITY_MODE_OPTIONS,
        weekdayOptions: WEEKDAY_OPTIONS2,
        renderCategoryPicker: renderSharedCategoryPicker,
        onChange: handleHabitDraftChange,
        onCommitNumber: handleHabitDraftNumberCommit,
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

// life-tracker/src/training/TrainingHostSettingsSection.jsx
init_define_process();
var React8 = window.React;
var { useEffect: useEffect7, useMemo: useMemo4, useState: useState8 } = React8;
var ipcRenderer4 = pluginIpc;
var LIFE_TRACKER_TRAINING_CHANNEL_PREFIX3 = "life-tracker:training";
var TRAINING_MANAGED_DOC_GROUP_ORDER = ["Ejercicios", "Musculos"];
function invoke3(channel, payload) {
  return ipcRenderer4.invoke(channel, payload).then((response) => {
    if (!response?.ok) {
      throw new Error(response?.error || "No se pudo ejecutar la operacion.");
    }
    return response.data;
  });
}
function getTrainingManagedDocStatusLabel(status) {
  if (status === "original") {
    return "Original";
  }
  if (status === "missing") {
    return "Faltante";
  }
  return "Editada";
}
function formatImportSummary(result) {
  const summary = result?.summary || {};
  const muscles = summary.muscles || {};
  const exercises = summary.exercises || {};
  const routines = summary.routines || {};
  return [
    `Musculos ${Number(muscles.updated || 0)} actualizados`,
    `Ejercicios ${Number(exercises.created || 0)} creados / ${Number(exercises.updated || 0)} actualizados`,
    `Rutinas ${Number(routines.created || 0)} creadas / ${Number(routines.updated || 0)} actualizadas`
  ].join(" | ");
}
function TrainingHostSettingsSection() {
  const [library, setLibrary] = useState8({
    exercises: [],
    muscles: [],
    routines: []
  });
  const [managedDocs, setManagedDocs] = useState8([]);
  const [libraryLoading, setLibraryLoading] = useState8(true);
  const [managedDocsLoading, setManagedDocsLoading] = useState8(true);
  const [busy, setBusy] = useState8(false);
  const [error, setError] = useState8("");
  const [notice, setNotice] = useState8("");
  const [warnings, setWarnings] = useState8([]);
  const [singleKind, setSingleKind] = useState8("exercise");
  const [singleId, setSingleId] = useState8("");
  const [importText, setImportText] = useState8("");
  const singleOptions = useMemo4(() => {
    if (singleKind === "muscle") {
      return (library.muscles || []).map((muscle) => ({
        id: muscle.id,
        label: muscle.title
      }));
    }
    if (singleKind === "routine") {
      return (library.routines || []).map((routine) => ({
        id: routine.id,
        label: routine.title
      }));
    }
    return (library.exercises || []).map((exercise) => ({
      id: exercise.id,
      label: exercise.title
    }));
  }, [library.exercises, library.muscles, library.routines, singleKind]);
  const docsByGroup = useMemo4(() => {
    const groups = /* @__PURE__ */ new Map();
    for (const group of TRAINING_MANAGED_DOC_GROUP_ORDER) {
      groups.set(group, []);
    }
    for (const doc of Array.isArray(managedDocs) ? managedDocs : []) {
      const groupKey = TRAINING_MANAGED_DOC_GROUP_ORDER.includes(doc?.group) ? doc.group : TRAINING_MANAGED_DOC_GROUP_ORDER[TRAINING_MANAGED_DOC_GROUP_ORDER.length - 1];
      groups.get(groupKey).push(doc);
    }
    return TRAINING_MANAGED_DOC_GROUP_ORDER.map((group) => ({
      group,
      docs: groups.get(group) || []
    })).filter((entry) => entry.docs.length > 0);
  }, [managedDocs]);
  useEffect7(() => {
    if (singleId && singleOptions.some((option) => option.id === singleId)) {
      return;
    }
    setSingleId("");
  }, [singleId, singleOptions]);
  const loadLibrary = async () => {
    setLibraryLoading(true);
    try {
      const data = await invoke3(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX3}:list`);
      setLibrary({
        exercises: Array.isArray(data?.exercises) ? data.exercises : [],
        muscles: Array.isArray(data?.muscles) ? data.muscles : [],
        routines: Array.isArray(data?.routines) ? data.routines : []
      });
    } finally {
      setLibraryLoading(false);
    }
  };
  const loadManagedDocs = async () => {
    setManagedDocsLoading(true);
    try {
      const data = await invoke3(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX3}:list-managed-docs`);
      setManagedDocs(Array.isArray(data?.managedDocs) ? data.managedDocs : []);
    } finally {
      setManagedDocsLoading(false);
    }
  };
  const loadAll = async () => {
    setError("");
    try {
      await Promise.all([loadLibrary(), loadManagedDocs()]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los ajustes de entrenamiento.");
    }
  };
  useEffect7(() => {
    void loadAll();
  }, []);
  const handleCopyAll = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    setWarnings([]);
    try {
      const data = await invoke3(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX3}:export`, { kind: "all" });
      window.nexus.clipboard.writeText(JSON.stringify(data, null, 2));
      setNotice("JSON copiado.");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "No se pudo copiar el export.");
    } finally {
      setBusy(false);
    }
  };
  const handleCopyOne = async () => {
    if (!singleId) {
      setError("Selecciona un registro para copiar.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setWarnings([]);
    try {
      const data = await invoke3(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX3}:export`, {
        kind: singleKind,
        id: singleId
      });
      window.nexus.clipboard.writeText(JSON.stringify(data, null, 2));
      setNotice("JSON copiado.");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "No se pudo copiar el export.");
    } finally {
      setBusy(false);
    }
  };
  const handlePasteClipboard = () => {
    setImportText(window.nexus.clipboard.readText() || "");
  };
  const handleImport = async () => {
    if (!importText.trim()) {
      setError("Pega un JSON antes de importar.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setWarnings([]);
    try {
      const result = await invoke3(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX3}:import`, {
        text: importText
      });
      setNotice(formatImportSummary(result));
      setWarnings(Array.isArray(result?.warnings) ? result.warnings : []);
      await loadAll();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "No se pudo importar entrenamiento.");
    } finally {
      setBusy(false);
    }
  };
  const handleRestoreDoc = async (doc) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await invoke3(`${LIFE_TRACKER_TRAINING_CHANNEL_PREFIX3}:restore-managed-doc`, {
        id: doc?.id
      });
      setManagedDocs(Array.isArray(result?.managedDocs) ? result.managedDocs : []);
      setNotice("Nota restaurada.");
      await loadLibrary();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "No se pudo restaurar la nota.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings" }, error ? /* @__PURE__ */ React8.createElement(Notice, { tone: "danger" }, error) : null, notice ? /* @__PURE__ */ React8.createElement(Notice, { tone: "success" }, notice) : null, warnings.length ? /* @__PURE__ */ React8.createElement(Notice, { tone: "warning" }, warnings.join(" ")) : null, /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__section" }, /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__sectionHeader" }, /* @__PURE__ */ React8.createElement("strong", null, "Importar / exportar")), /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__actions" }, /* @__PURE__ */ React8.createElement(Button, { type: "button", tone: "secondary", onClick: () => void handleCopyAll(), disabled: busy }, "Copiar todo"), /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__copyRow" }, /* @__PURE__ */ React8.createElement(InlineField, { label: "Tipo" }, /* @__PURE__ */ React8.createElement("select", { value: singleKind, onChange: (event) => setSingleKind(event.target.value), disabled: busy || libraryLoading }, /* @__PURE__ */ React8.createElement("option", { value: "exercise" }, "Ejercicio"), /* @__PURE__ */ React8.createElement("option", { value: "muscle" }, "Musculo"), /* @__PURE__ */ React8.createElement("option", { value: "routine" }, "Rutina"))), /* @__PURE__ */ React8.createElement(InlineField, { label: "Registro", grow: true }, /* @__PURE__ */ React8.createElement("select", { value: singleId, onChange: (event) => setSingleId(event.target.value), disabled: busy || libraryLoading || !singleOptions.length }, /* @__PURE__ */ React8.createElement("option", { value: "" }, "Selecciona uno"), singleOptions.map((option) => /* @__PURE__ */ React8.createElement("option", { key: option.id, value: option.id }, option.label)))), /* @__PURE__ */ React8.createElement(Button, { type: "button", tone: "secondary", onClick: () => void handleCopyOne(), disabled: busy || libraryLoading || !singleOptions.length }, "Copiar uno")), /* @__PURE__ */ React8.createElement(Field, { label: "JSON", wide: true }, /* @__PURE__ */ React8.createElement(
    "textarea",
    {
      rows: "10",
      value: importText,
      onChange: (event) => setImportText(event.target.value),
      placeholder: '{"version":1,"muscles":[],"exercises":[],"routines":[]}',
      disabled: busy
    }
  )), /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__actions lifeTrackerTrainingSettings__actions--inline" }, /* @__PURE__ */ React8.createElement(Button, { type: "button", tone: "secondary", onClick: handlePasteClipboard, disabled: busy }, "Pegar"), /* @__PURE__ */ React8.createElement(Button, { type: "button", tone: "primary", onClick: () => void handleImport(), disabled: busy }, "Importar")))), /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__divider" }), /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__section" }, /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__sectionHeader" }, /* @__PURE__ */ React8.createElement("strong", null, "Notas gestionadas"), /* @__PURE__ */ React8.createElement(Button, { type: "button", tone: "secondary", onClick: () => void loadAll(), disabled: busy || managedDocsLoading }, "Recargar")), managedDocsLoading ? /* @__PURE__ */ React8.createElement(StateBlock, { title: "Cargando notas gestionadas..." }) : docsByGroup.length ? /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__groups" }, docsByGroup.map((entry) => /* @__PURE__ */ React8.createElement("div", { key: entry.group, className: "lifeTrackerTrainingSettings__group" }, /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__groupHeader" }, /* @__PURE__ */ React8.createElement("strong", null, entry.group), /* @__PURE__ */ React8.createElement("span", null, entry.docs.length)), /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__rows" }, entry.docs.map((doc) => /* @__PURE__ */ React8.createElement("div", { key: doc.id, className: "lifeTrackerTrainingSettings__row" }, /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__rowCopy" }, /* @__PURE__ */ React8.createElement("strong", null, doc.label), /* @__PURE__ */ React8.createElement("span", null, doc.currentRelativePath || doc.relativePath)), /* @__PURE__ */ React8.createElement("div", { className: "lifeTrackerTrainingSettings__rowActions" }, /* @__PURE__ */ React8.createElement(
    "span",
    {
      className: [
        "lifeTrackerTrainingSettings__status",
        `is-${doc.status || "edited"}`
      ].join(" ")
    },
    getTrainingManagedDocStatusLabel(doc.status)
  ), /* @__PURE__ */ React8.createElement(Button, { type: "button", tone: "secondary", onClick: () => void handleRestoreDoc(doc), disabled: busy }, "Restaurar")))))))) : /* @__PURE__ */ React8.createElement(StateBlock, { title: "Sin notas gestionadas." })));
}

// life-tracker/src/renderer.js
var styleElement = null;
function ensureStylesheet() {
  if (styleElement || typeof document === "undefined") {
    return;
  }
  const href = new URL("./styles.css", import.meta.url).href;
  styleElement = document.createElement("link");
  styleElement.rel = "stylesheet";
  styleElement.href = href;
  styleElement.dataset.nexusPluginStyles = LIFE_TRACKER_PLUGIN_ID;
  document.head.appendChild(styleElement);
}
function disposeStylesheet() {
  styleElement?.remove();
  styleElement = null;
}
var lifeTrackerRendererPlugin = {
  activate(ctx) {
    configureLifeTrackerHostUi(ctx.ui);
    configureTrainingHostUi(ctx.ui);
    configurePluginIpc(ctx.ipc);
    ensureStylesheet();
    ctx.registerView({
      id: LIFE_TRACKER_WORKSPACE_VIEW_ID,
      pluginId: ctx.pluginId,
      title: "Life Tracker",
      icon: HabitosIcon,
      tone: "document",
      surface: "workspace",
      workspaceFrame: {
        sections: LIFE_TRACKER_SECTION_OPTIONS,
        defaultSection: LIFE_TRACKER_DEFAULT_SECTION
      },
      component: (props) => /* @__PURE__ */ React.createElement(LifeTrackerView, { ...props, ctx })
    });
    LIFE_TRACKER_HOME_WIDGET_PROVIDERS.forEach((provider) => {
      ctx.registerWidgetProvider({
        ...provider,
        pluginId: ctx.pluginId
      });
    });
    ctx.registerSettingsSection({
      id: "nexus.life-tracker.training",
      pluginId: ctx.pluginId,
      title: "Entrenamiento",
      component: () => /* @__PURE__ */ React.createElement(TrainingHostSettingsSection, { ctx })
    });
    ctx.registerSideToolbarButton({
      id: "nexus.life-tracker.workspace-button",
      pluginId: ctx.pluginId,
      order: 270,
      icon: HabitosIcon,
      tone: "document",
      label: "Life Tracker",
      onClick: () => {
        void ctx.openView({
          viewId: LIFE_TRACKER_WORKSPACE_VIEW_ID,
          reuse: true,
          sourceId: "nexus.life-tracker.toolbar"
        });
      },
      isActive: ({ getState }) => {
        const workspaceSurface = getState().data.workspaceSurface;
        return workspaceSurface?.kind === "workspace-view" && workspaceSurface.viewId === LIFE_TRACKER_WORKSPACE_VIEW_ID;
      }
    });
  },
  deactivate() {
    disposeStylesheet();
  }
};
var renderer_default = lifeTrackerRendererPlugin;
export {
  renderer_default as default
};
/*! Bundled license information:

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
