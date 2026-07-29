var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../nexus-plugins/booru/src/backend.ts
var backend_exports = {};
__export(backend_exports, {
  __booruTestUtils: () => __booruTestUtils,
  default: () => backend_default
});
module.exports = __toCommonJS(backend_exports);
var import_node_fs3 = __toESM(require("node:fs"));
var import_promises4 = __toESM(require("node:fs/promises"));
var import_node_os2 = __toESM(require("node:os"));
var import_node_path2 = __toESM(require("node:path"));
var import_node_crypto = __toESM(require("node:crypto"));
var import_node_child_process = require("node:child_process");
var import_node_sqlite = require("node:sqlite");

// node_modules/chokidar/index.js
var import_node_events = require("node:events");
var import_node_fs2 = require("node:fs");
var import_promises3 = require("node:fs/promises");
var sp2 = __toESM(require("node:path"), 1);

// node_modules/readdirp/index.js
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");
var import_node_stream = require("node:stream");
var EntryTypes = {
  FILE_TYPE: "files",
  DIR_TYPE: "directories",
  FILE_DIR_TYPE: "files_directories",
  EVERYTHING_TYPE: "all"
};
var defaultOptions = {
  root: ".",
  fileFilter: (_entryInfo) => true,
  directoryFilter: (_entryInfo) => true,
  type: EntryTypes.FILE_TYPE,
  lstat: false,
  depth: 2147483648,
  alwaysStat: false,
  highWaterMark: 4096
};
Object.freeze(defaultOptions);
var RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR";
var NORMAL_FLOW_ERRORS = /* @__PURE__ */ new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", RECURSIVE_ERROR_CODE]);
var ALL_TYPES = [
  EntryTypes.DIR_TYPE,
  EntryTypes.EVERYTHING_TYPE,
  EntryTypes.FILE_DIR_TYPE,
  EntryTypes.FILE_TYPE
];
var DIR_TYPES = /* @__PURE__ */ new Set([
  EntryTypes.DIR_TYPE,
  EntryTypes.EVERYTHING_TYPE,
  EntryTypes.FILE_DIR_TYPE
]);
var FILE_TYPES = /* @__PURE__ */ new Set([
  EntryTypes.EVERYTHING_TYPE,
  EntryTypes.FILE_DIR_TYPE,
  EntryTypes.FILE_TYPE
]);
var isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
var wantBigintFsStats = process.platform === "win32";
var emptyFn = (_entryInfo) => true;
var normalizeFilter = (filter) => {
  if (filter === void 0)
    return emptyFn;
  if (typeof filter === "function")
    return filter;
  if (typeof filter === "string") {
    const fl = filter.trim();
    return (entry) => entry.basename === fl;
  }
  if (Array.isArray(filter)) {
    const trItems = filter.map((item) => item.trim());
    return (entry) => trItems.some((f) => entry.basename === f);
  }
  return emptyFn;
};
var ReaddirpStream = class extends import_node_stream.Readable {
  parents;
  reading;
  parent;
  _stat;
  _maxDepth;
  _wantsDir;
  _wantsFile;
  _wantsEverything;
  _root;
  _isDirent;
  _statsProp;
  _rdOptions;
  _fileFilter;
  _directoryFilter;
  constructor(options = {}) {
    super({
      objectMode: true,
      autoDestroy: true,
      highWaterMark: options.highWaterMark
    });
    const opts = { ...defaultOptions, ...options };
    const { root, type } = opts;
    this._fileFilter = normalizeFilter(opts.fileFilter);
    this._directoryFilter = normalizeFilter(opts.directoryFilter);
    const statMethod = opts.lstat ? import_promises.lstat : import_promises.stat;
    if (wantBigintFsStats) {
      this._stat = (path2) => statMethod(path2, { bigint: true });
    } else {
      this._stat = statMethod;
    }
    this._maxDepth = opts.depth != null && Number.isSafeInteger(opts.depth) ? opts.depth : defaultOptions.depth;
    this._wantsDir = type ? DIR_TYPES.has(type) : false;
    this._wantsFile = type ? FILE_TYPES.has(type) : false;
    this._wantsEverything = type === EntryTypes.EVERYTHING_TYPE;
    this._root = (0, import_node_path.resolve)(root);
    this._isDirent = !opts.alwaysStat;
    this._statsProp = this._isDirent ? "dirent" : "stats";
    this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent };
    this.parents = [this._exploreDir(root, 1)];
    this.reading = false;
    this.parent = void 0;
  }
  async _read(batch) {
    if (this.reading)
      return;
    this.reading = true;
    try {
      while (!this.destroyed && batch > 0) {
        const par = this.parent;
        const fil = par && par.files;
        if (fil && fil.length > 0) {
          const { path: path2, depth } = par;
          const slice = fil.splice(0, batch).map((dirent) => this._formatEntry(dirent, path2));
          const awaited = await Promise.all(slice);
          for (const entry of awaited) {
            if (!entry)
              continue;
            if (this.destroyed)
              return;
            const entryType = await this._getEntryType(entry);
            if (entryType === "directory" && this._directoryFilter(entry)) {
              if (depth <= this._maxDepth) {
                this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
              }
              if (this._wantsDir) {
                this.push(entry);
                batch--;
              }
            } else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
              if (this._wantsFile) {
                this.push(entry);
                batch--;
              }
            }
          }
        } else {
          const parent = this.parents.pop();
          if (!parent) {
            this.push(null);
            break;
          }
          this.parent = await parent;
          if (this.destroyed)
            return;
        }
      }
    } catch (error) {
      this.destroy(error);
    } finally {
      this.reading = false;
    }
  }
  async _exploreDir(path2, depth) {
    let files;
    try {
      files = await (0, import_promises.readdir)(path2, this._rdOptions);
    } catch (error) {
      this._onError(error);
    }
    return { files, depth, path: path2 };
  }
  async _formatEntry(dirent, path2) {
    let entry;
    const basename3 = this._isDirent ? dirent.name : dirent;
    try {
      const fullPath = (0, import_node_path.resolve)((0, import_node_path.join)(path2, basename3));
      entry = { path: (0, import_node_path.relative)(this._root, fullPath), fullPath, basename: basename3 };
      entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
    } catch (err) {
      this._onError(err);
      return;
    }
    return entry;
  }
  _onError(err) {
    if (isNormalFlowError(err) && !this.destroyed) {
      this.emit("warn", err);
    } else {
      this.destroy(err);
    }
  }
  async _getEntryType(entry) {
    if (!entry && this._statsProp in entry) {
      return "";
    }
    const stats = entry[this._statsProp];
    if (stats.isFile())
      return "file";
    if (stats.isDirectory())
      return "directory";
    if (stats && stats.isSymbolicLink()) {
      const full = entry.fullPath;
      try {
        const entryRealPath = await (0, import_promises.realpath)(full);
        const entryRealPathStats = await (0, import_promises.lstat)(entryRealPath);
        if (entryRealPathStats.isFile()) {
          return "file";
        }
        if (entryRealPathStats.isDirectory()) {
          const len = entryRealPath.length;
          if (full.startsWith(entryRealPath) && full.substr(len, 1) === import_node_path.sep) {
            const recursiveError = new Error(`Circular symlink detected: "${full}" points to "${entryRealPath}"`);
            recursiveError.code = RECURSIVE_ERROR_CODE;
            return this._onError(recursiveError);
          }
          return "directory";
        }
      } catch (error) {
        this._onError(error);
        return "";
      }
    }
  }
  _includeAsFile(entry) {
    const stats = entry && entry[this._statsProp];
    return stats && this._wantsEverything && !stats.isDirectory();
  }
};
function readdirp(root, options = {}) {
  let type = options.entryType || options.type;
  if (type === "both")
    type = EntryTypes.FILE_DIR_TYPE;
  if (type)
    options.type = type;
  if (!root) {
    throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
  } else if (typeof root !== "string") {
    throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
  } else if (type && !ALL_TYPES.includes(type)) {
    throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
  }
  options.root = root;
  return new ReaddirpStream(options);
}

// node_modules/chokidar/handler.js
var import_node_fs = require("node:fs");
var import_promises2 = require("node:fs/promises");
var import_node_os = require("node:os");
var sp = __toESM(require("node:path"), 1);
var STR_DATA = "data";
var STR_END = "end";
var STR_CLOSE = "close";
var EMPTY_FN = () => {
};
var pl = process.platform;
var isWindows = pl === "win32";
var isMacos = pl === "darwin";
var isLinux = pl === "linux";
var isFreeBSD = pl === "freebsd";
var isIBMi = (0, import_node_os.type)() === "OS400";
var EVENTS = {
  ALL: "all",
  READY: "ready",
  ADD: "add",
  CHANGE: "change",
  ADD_DIR: "addDir",
  UNLINK: "unlink",
  UNLINK_DIR: "unlinkDir",
  RAW: "raw",
  ERROR: "error"
};
var EV = EVENTS;
var THROTTLE_MODE_WATCH = "watch";
var statMethods = { lstat: import_promises2.lstat, stat: import_promises2.stat };
var KEY_LISTENERS = "listeners";
var KEY_ERR = "errHandlers";
var KEY_RAW = "rawEmitters";
var HANDLER_KEYS = [KEY_LISTENERS, KEY_ERR, KEY_RAW];
var binaryExtensions = /* @__PURE__ */ new Set([
  "3dm",
  "3ds",
  "3g2",
  "3gp",
  "7z",
  "a",
  "aac",
  "adp",
  "afdesign",
  "afphoto",
  "afpub",
  "ai",
  "aif",
  "aiff",
  "alz",
  "ape",
  "apk",
  "appimage",
  "ar",
  "arj",
  "asf",
  "au",
  "avi",
  "bak",
  "baml",
  "bh",
  "bin",
  "bk",
  "bmp",
  "btif",
  "bz2",
  "bzip2",
  "cab",
  "caf",
  "cgm",
  "class",
  "cmx",
  "cpio",
  "cr2",
  "cur",
  "dat",
  "dcm",
  "deb",
  "dex",
  "djvu",
  "dll",
  "dmg",
  "dng",
  "doc",
  "docm",
  "docx",
  "dot",
  "dotm",
  "dra",
  "DS_Store",
  "dsk",
  "dts",
  "dtshd",
  "dvb",
  "dwg",
  "dxf",
  "ecelp4800",
  "ecelp7470",
  "ecelp9600",
  "egg",
  "eol",
  "eot",
  "epub",
  "exe",
  "f4v",
  "fbs",
  "fh",
  "fla",
  "flac",
  "flatpak",
  "fli",
  "flv",
  "fpx",
  "fst",
  "fvt",
  "g3",
  "gh",
  "gif",
  "graffle",
  "gz",
  "gzip",
  "h261",
  "h263",
  "h264",
  "icns",
  "ico",
  "ief",
  "img",
  "ipa",
  "iso",
  "jar",
  "jpeg",
  "jpg",
  "jpgv",
  "jpm",
  "jxr",
  "key",
  "ktx",
  "lha",
  "lib",
  "lvp",
  "lz",
  "lzh",
  "lzma",
  "lzo",
  "m3u",
  "m4a",
  "m4v",
  "mar",
  "mdi",
  "mht",
  "mid",
  "midi",
  "mj2",
  "mka",
  "mkv",
  "mmr",
  "mng",
  "mobi",
  "mov",
  "movie",
  "mp3",
  "mp4",
  "mp4a",
  "mpeg",
  "mpg",
  "mpga",
  "mxu",
  "nef",
  "npx",
  "numbers",
  "nupkg",
  "o",
  "odp",
  "ods",
  "odt",
  "oga",
  "ogg",
  "ogv",
  "otf",
  "ott",
  "pages",
  "pbm",
  "pcx",
  "pdb",
  "pdf",
  "pea",
  "pgm",
  "pic",
  "png",
  "pnm",
  "pot",
  "potm",
  "potx",
  "ppa",
  "ppam",
  "ppm",
  "pps",
  "ppsm",
  "ppsx",
  "ppt",
  "pptm",
  "pptx",
  "psd",
  "pya",
  "pyc",
  "pyo",
  "pyv",
  "qt",
  "rar",
  "ras",
  "raw",
  "resources",
  "rgb",
  "rip",
  "rlc",
  "rmf",
  "rmvb",
  "rpm",
  "rtf",
  "rz",
  "s3m",
  "s7z",
  "scpt",
  "sgi",
  "shar",
  "snap",
  "sil",
  "sketch",
  "slk",
  "smv",
  "snk",
  "so",
  "stl",
  "suo",
  "sub",
  "swf",
  "tar",
  "tbz",
  "tbz2",
  "tga",
  "tgz",
  "thmx",
  "tif",
  "tiff",
  "tlz",
  "ttc",
  "ttf",
  "txz",
  "udf",
  "uvh",
  "uvi",
  "uvm",
  "uvp",
  "uvs",
  "uvu",
  "viv",
  "vob",
  "war",
  "wav",
  "wax",
  "wbmp",
  "wdp",
  "weba",
  "webm",
  "webp",
  "whl",
  "wim",
  "wm",
  "wma",
  "wmv",
  "wmx",
  "woff",
  "woff2",
  "wrm",
  "wvx",
  "xbm",
  "xif",
  "xla",
  "xlam",
  "xls",
  "xlsb",
  "xlsm",
  "xlsx",
  "xlt",
  "xltm",
  "xltx",
  "xm",
  "xmind",
  "xpi",
  "xpm",
  "xwd",
  "xz",
  "z",
  "zip",
  "zipx"
]);
var isBinaryPath = (filePath) => binaryExtensions.has(sp.extname(filePath).slice(1).toLowerCase());
var foreach = (val, fn) => {
  if (val instanceof Set) {
    val.forEach(fn);
  } else {
    fn(val);
  }
};
var addAndConvert = (main, prop, item) => {
  let container = main[prop];
  if (!(container instanceof Set)) {
    main[prop] = container = /* @__PURE__ */ new Set([container]);
  }
  container.add(item);
};
var clearItem = (cont) => (key) => {
  const set = cont[key];
  if (set instanceof Set) {
    set.clear();
  } else {
    delete cont[key];
  }
};
var delFromSet = (main, prop, item) => {
  const container = main[prop];
  if (container instanceof Set) {
    container.delete(item);
  } else if (container === item) {
    delete main[prop];
  }
};
var isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
var FsWatchInstances = /* @__PURE__ */ new Map();
function createFsWatchInstance(path2, options, listener, errHandler, emitRaw) {
  const handleEvent = (rawEvent, evPath) => {
    listener(path2);
    emitRaw(rawEvent, evPath, { watchedPath: path2 });
    if (evPath && path2 !== evPath) {
      fsWatchBroadcast(sp.resolve(path2, evPath), KEY_LISTENERS, sp.join(path2, evPath));
    }
  };
  try {
    return (0, import_node_fs.watch)(path2, {
      persistent: options.persistent
    }, handleEvent);
  } catch (error) {
    errHandler(error);
    return void 0;
  }
}
var fsWatchBroadcast = (fullPath, listenerType, val1, val2, val3) => {
  const cont = FsWatchInstances.get(fullPath);
  if (!cont)
    return;
  foreach(cont[listenerType], (listener) => {
    listener(val1, val2, val3);
  });
};
var setFsWatchListener = (path2, fullPath, options, handlers) => {
  const { listener, errHandler, rawEmitter } = handlers;
  let cont = FsWatchInstances.get(fullPath);
  let watcher;
  if (!options.persistent) {
    watcher = createFsWatchInstance(path2, options, listener, errHandler, rawEmitter);
    if (!watcher)
      return;
    return watcher.close.bind(watcher);
  }
  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_ERR, errHandler);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    watcher = createFsWatchInstance(
      path2,
      options,
      fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS),
      errHandler,
      // no need to use broadcast here
      fsWatchBroadcast.bind(null, fullPath, KEY_RAW)
    );
    if (!watcher)
      return;
    watcher.on(EV.ERROR, async (error) => {
      const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
      if (cont)
        cont.watcherUnusable = true;
      if (isWindows && error.code === "EPERM") {
        try {
          const fd = await (0, import_promises2.open)(path2, "r");
          await fd.close();
          broadcastErr(error);
        } catch (err) {
        }
      } else {
        broadcastErr(error);
      }
    });
    cont = {
      listeners: listener,
      errHandlers: errHandler,
      rawEmitters: rawEmitter,
      watcher
    };
    FsWatchInstances.set(fullPath, cont);
  }
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_ERR, errHandler);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      cont.watcher.close();
      FsWatchInstances.delete(fullPath);
      HANDLER_KEYS.forEach(clearItem(cont));
      cont.watcher = void 0;
      Object.freeze(cont);
    }
  };
};
var FsWatchFileInstances = /* @__PURE__ */ new Map();
var setFsWatchFileListener = (path2, fullPath, options, handlers) => {
  const { listener, rawEmitter } = handlers;
  let cont = FsWatchFileInstances.get(fullPath);
  const copts = cont && cont.options;
  if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
    (0, import_node_fs.unwatchFile)(fullPath);
    cont = void 0;
  }
  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    cont = {
      listeners: listener,
      rawEmitters: rawEmitter,
      options,
      watcher: (0, import_node_fs.watchFile)(fullPath, options, (curr, prev) => {
        foreach(cont.rawEmitters, (rawEmitter2) => {
          rawEmitter2(EV.CHANGE, fullPath, { curr, prev });
        });
        const currmtime = curr.mtimeMs;
        if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
          foreach(cont.listeners, (listener2) => listener2(path2, curr));
        }
      })
    };
    FsWatchFileInstances.set(fullPath, cont);
  }
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      FsWatchFileInstances.delete(fullPath);
      (0, import_node_fs.unwatchFile)(fullPath);
      cont.options = cont.watcher = void 0;
      Object.freeze(cont);
    }
  };
};
var NodeFsHandler = class {
  fsw;
  _boundHandleError;
  constructor(fsW) {
    this.fsw = fsW;
    this._boundHandleError = (error) => fsW._handleError(error);
  }
  /**
   * Watch file for changes with fs_watchFile or fs_watch.
   * @param path to file or dir
   * @param listener on fs change
   * @returns closer for the watcher instance
   */
  _watchWithNodeFs(path2, listener) {
    const opts = this.fsw.options;
    const directory = sp.dirname(path2);
    const basename3 = sp.basename(path2);
    const parent = this.fsw._getWatchedDir(directory);
    parent.add(basename3);
    const absolutePath = sp.resolve(path2);
    const options = {
      persistent: opts.persistent
    };
    if (!listener)
      listener = EMPTY_FN;
    let closer;
    if (opts.usePolling) {
      const enableBin = opts.interval !== opts.binaryInterval;
      options.interval = enableBin && isBinaryPath(basename3) ? opts.binaryInterval : opts.interval;
      closer = setFsWatchFileListener(path2, absolutePath, options, {
        listener,
        rawEmitter: this.fsw._emitRaw
      });
    } else {
      closer = setFsWatchListener(path2, absolutePath, options, {
        listener,
        errHandler: this._boundHandleError,
        rawEmitter: this.fsw._emitRaw
      });
    }
    return closer;
  }
  /**
   * Watch a file and emit add event if warranted.
   * @returns closer for the watcher instance
   */
  _handleFile(file, stats, initialAdd) {
    if (this.fsw.closed) {
      return;
    }
    const dirname3 = sp.dirname(file);
    const basename3 = sp.basename(file);
    const parent = this.fsw._getWatchedDir(dirname3);
    let prevStats = stats;
    if (parent.has(basename3))
      return;
    const listener = async (path2, newStats) => {
      if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5))
        return;
      if (!newStats || newStats.mtimeMs === 0) {
        try {
          const newStats2 = await (0, import_promises2.stat)(file);
          if (this.fsw.closed)
            return;
          const at = newStats2.atimeMs;
          const mt = newStats2.mtimeMs;
          if (!at || at <= mt || mt !== prevStats.mtimeMs) {
            this.fsw._emit(EV.CHANGE, file, newStats2);
          }
          if ((isMacos || isLinux || isFreeBSD) && prevStats.ino !== newStats2.ino) {
            this.fsw._closeFile(path2);
            prevStats = newStats2;
            const closer2 = this._watchWithNodeFs(file, listener);
            if (closer2)
              this.fsw._addPathCloser(path2, closer2);
          } else {
            prevStats = newStats2;
          }
        } catch (error) {
          this.fsw._remove(dirname3, basename3);
        }
      } else if (parent.has(basename3)) {
        const at = newStats.atimeMs;
        const mt = newStats.mtimeMs;
        if (!at || at <= mt || mt !== prevStats.mtimeMs) {
          this.fsw._emit(EV.CHANGE, file, newStats);
        }
        prevStats = newStats;
      }
    };
    const closer = this._watchWithNodeFs(file, listener);
    if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
      if (!this.fsw._throttle(EV.ADD, file, 0))
        return;
      this.fsw._emit(EV.ADD, file, stats);
    }
    return closer;
  }
  /**
   * Handle symlinks encountered while reading a dir.
   * @param entry returned by readdirp
   * @param directory path of dir being read
   * @param path of this item
   * @param item basename of this item
   * @returns true if no more processing is needed for this entry.
   */
  async _handleSymlink(entry, directory, path2, item) {
    if (this.fsw.closed) {
      return;
    }
    const full = entry.fullPath;
    const dir = this.fsw._getWatchedDir(directory);
    if (!this.fsw.options.followSymlinks) {
      this.fsw._incrReadyCount();
      let linkPath;
      try {
        linkPath = await (0, import_promises2.realpath)(path2);
      } catch (e) {
        this.fsw._emitReady();
        return true;
      }
      if (this.fsw.closed)
        return;
      if (dir.has(item)) {
        if (this.fsw._symlinkPaths.get(full) !== linkPath) {
          this.fsw._symlinkPaths.set(full, linkPath);
          this.fsw._emit(EV.CHANGE, path2, entry.stats);
        }
      } else {
        dir.add(item);
        this.fsw._symlinkPaths.set(full, linkPath);
        this.fsw._emit(EV.ADD, path2, entry.stats);
      }
      this.fsw._emitReady();
      return true;
    }
    if (this.fsw._symlinkPaths.has(full)) {
      return true;
    }
    this.fsw._symlinkPaths.set(full, true);
  }
  _handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
    directory = sp.join(directory, "");
    const throttleKey = target ? `${directory}:${target}` : directory;
    throttler = this.fsw._throttle("readdir", throttleKey, 1e3);
    if (!throttler)
      return;
    const previous = this.fsw._getWatchedDir(wh.path);
    const current = /* @__PURE__ */ new Set();
    let stream = this.fsw._readdirp(directory, {
      fileFilter: (entry) => wh.filterPath(entry),
      directoryFilter: (entry) => wh.filterDir(entry)
    });
    if (!stream)
      return;
    stream.on(STR_DATA, async (entry) => {
      if (this.fsw.closed) {
        stream = void 0;
        return;
      }
      const item = entry.path;
      let path2 = sp.join(directory, item);
      current.add(item);
      if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path2, item)) {
        return;
      }
      if (this.fsw.closed) {
        stream = void 0;
        return;
      }
      if (item === target || !target && !previous.has(item)) {
        this.fsw._incrReadyCount();
        path2 = sp.join(dir, sp.relative(dir, path2));
        this._addToNodeFs(path2, initialAdd, wh, depth + 1);
      }
    }).on(EV.ERROR, this._boundHandleError);
    return new Promise((resolve3, reject) => {
      if (!stream)
        return reject();
      stream.once(STR_END, () => {
        if (this.fsw.closed) {
          stream = void 0;
          return;
        }
        const wasThrottled = throttler ? throttler.clear() : false;
        resolve3(void 0);
        previous.getChildren().filter((item) => {
          return item !== directory && !current.has(item);
        }).forEach((item) => {
          this.fsw._remove(directory, item);
        });
        stream = void 0;
        if (wasThrottled)
          this._handleRead(directory, false, wh, target, dir, depth, throttler);
      });
    });
  }
  /**
   * Read directory to add / remove files from `@watched` list and re-read it on change.
   * @param dir fs path
   * @param stats
   * @param initialAdd
   * @param depth relative to user-supplied path
   * @param target child path targeted for watch
   * @param wh Common watch helpers for this path
   * @param realpath
   * @returns closer for the watcher instance.
   */
  async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath2) {
    const parentDir = this.fsw._getWatchedDir(sp.dirname(dir));
    const tracked = parentDir.has(sp.basename(dir));
    if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
      this.fsw._emit(EV.ADD_DIR, dir, stats);
    }
    parentDir.add(sp.basename(dir));
    this.fsw._getWatchedDir(dir);
    let throttler;
    let closer;
    const oDepth = this.fsw.options.depth;
    if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath2)) {
      if (!target) {
        await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
        if (this.fsw.closed)
          return;
      }
      closer = this._watchWithNodeFs(dir, (dirPath, stats2) => {
        if (stats2 && stats2.mtimeMs === 0)
          return;
        this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
      });
    }
    return closer;
  }
  /**
   * Handle added file, directory, or glob pattern.
   * Delegates call to _handleFile / _handleDir after checks.
   * @param path to file or ir
   * @param initialAdd was the file added at watch instantiation?
   * @param priorWh depth relative to user-supplied path
   * @param depth Child path actually targeted for watch
   * @param target Child path actually targeted for watch
   */
  async _addToNodeFs(path2, initialAdd, priorWh, depth, target) {
    const ready = this.fsw._emitReady;
    if (this.fsw._isIgnored(path2) || this.fsw.closed) {
      ready();
      return false;
    }
    const wh = this.fsw._getWatchHelpers(path2);
    if (priorWh) {
      wh.filterPath = (entry) => priorWh.filterPath(entry);
      wh.filterDir = (entry) => priorWh.filterDir(entry);
    }
    try {
      const stats = await statMethods[wh.statMethod](wh.watchPath);
      if (this.fsw.closed)
        return;
      if (this.fsw._isIgnored(wh.watchPath, stats)) {
        ready();
        return false;
      }
      const follow = this.fsw.options.followSymlinks;
      let closer;
      if (stats.isDirectory()) {
        const absPath = sp.resolve(path2);
        const targetPath = follow ? await (0, import_promises2.realpath)(path2) : path2;
        if (this.fsw.closed)
          return;
        closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
        if (this.fsw.closed)
          return;
        if (absPath !== targetPath && targetPath !== void 0) {
          this.fsw._symlinkPaths.set(absPath, targetPath);
        }
      } else if (stats.isSymbolicLink()) {
        const targetPath = follow ? await (0, import_promises2.realpath)(path2) : path2;
        if (this.fsw.closed)
          return;
        const parent = sp.dirname(wh.watchPath);
        this.fsw._getWatchedDir(parent).add(wh.watchPath);
        this.fsw._emit(EV.ADD, wh.watchPath, stats);
        closer = await this._handleDir(parent, stats, initialAdd, depth, path2, wh, targetPath);
        if (this.fsw.closed)
          return;
        if (targetPath !== void 0) {
          this.fsw._symlinkPaths.set(sp.resolve(path2), targetPath);
        }
      } else {
        closer = this._handleFile(wh.watchPath, stats, initialAdd);
      }
      ready();
      if (closer)
        this.fsw._addPathCloser(path2, closer);
      return false;
    } catch (error) {
      if (this.fsw._handleError(error)) {
        ready();
        return path2;
      }
    }
  }
};

// node_modules/chokidar/index.js
var SLASH = "/";
var SLASH_SLASH = "//";
var ONE_DOT = ".";
var TWO_DOTS = "..";
var STRING_TYPE = "string";
var BACK_SLASH_RE = /\\/g;
var DOUBLE_SLASH_RE = /\/\//g;
var DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
var REPLACER_RE = /^\.[/\\]/;
function arrify(item) {
  return Array.isArray(item) ? item : [item];
}
var isMatcherObject = (matcher) => typeof matcher === "object" && matcher !== null && !(matcher instanceof RegExp);
function createPattern(matcher) {
  if (typeof matcher === "function")
    return matcher;
  if (typeof matcher === "string")
    return (string) => matcher === string;
  if (matcher instanceof RegExp)
    return (string) => matcher.test(string);
  if (typeof matcher === "object" && matcher !== null) {
    return (string) => {
      if (matcher.path === string)
        return true;
      if (matcher.recursive) {
        const relative3 = sp2.relative(matcher.path, string);
        if (!relative3) {
          return false;
        }
        return !relative3.startsWith("..") && !sp2.isAbsolute(relative3);
      }
      return false;
    };
  }
  return () => false;
}
function normalizePath(path2) {
  if (typeof path2 !== "string")
    throw new Error("string expected");
  path2 = sp2.normalize(path2);
  path2 = path2.replace(/\\/g, "/");
  let prepend = false;
  if (path2.startsWith("//"))
    prepend = true;
  path2 = path2.replace(DOUBLE_SLASH_RE, "/");
  if (prepend)
    path2 = "/" + path2;
  return path2;
}
function matchPatterns(patterns, testString, stats) {
  const path2 = normalizePath(testString);
  for (let index = 0; index < patterns.length; index++) {
    const pattern = patterns[index];
    if (pattern(path2, stats)) {
      return true;
    }
  }
  return false;
}
function anymatch(matchers, testString) {
  if (matchers == null) {
    throw new TypeError("anymatch: specify first argument");
  }
  const matchersArray = arrify(matchers);
  const patterns = matchersArray.map((matcher) => createPattern(matcher));
  if (testString == null) {
    return (testString2, stats) => {
      return matchPatterns(patterns, testString2, stats);
    };
  }
  return matchPatterns(patterns, testString);
}
var unifyPaths = (paths_) => {
  const paths = arrify(paths_).flat();
  if (!paths.every((p) => typeof p === STRING_TYPE)) {
    throw new TypeError(`Non-string provided as watch path: ${paths}`);
  }
  return paths.map(normalizePathToUnix);
};
var toUnix = (string) => {
  let str = string.replace(BACK_SLASH_RE, SLASH);
  let prepend = false;
  if (str.startsWith(SLASH_SLASH)) {
    prepend = true;
  }
  str = str.replace(DOUBLE_SLASH_RE, SLASH);
  if (prepend) {
    str = SLASH + str;
  }
  return str;
};
var normalizePathToUnix = (path2) => toUnix(sp2.normalize(toUnix(path2)));
var normalizeIgnored = (cwd = "") => (path2) => {
  if (typeof path2 === "string") {
    return normalizePathToUnix(sp2.isAbsolute(path2) ? path2 : sp2.join(cwd, path2));
  } else {
    return path2;
  }
};
var getAbsolutePath = (path2, cwd) => {
  if (sp2.isAbsolute(path2)) {
    return path2;
  }
  return sp2.join(cwd, path2);
};
var EMPTY_SET = Object.freeze(/* @__PURE__ */ new Set());
var DirEntry = class {
  path;
  _removeWatcher;
  items;
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = /* @__PURE__ */ new Set();
  }
  add(item) {
    const { items } = this;
    if (!items)
      return;
    if (item !== ONE_DOT && item !== TWO_DOTS)
      items.add(item);
  }
  async remove(item) {
    const { items } = this;
    if (!items)
      return;
    items.delete(item);
    if (items.size > 0)
      return;
    const dir = this.path;
    try {
      await (0, import_promises3.readdir)(dir);
    } catch (err) {
      if (this._removeWatcher) {
        this._removeWatcher(sp2.dirname(dir), sp2.basename(dir));
      }
    }
  }
  has(item) {
    const { items } = this;
    if (!items)
      return;
    return items.has(item);
  }
  getChildren() {
    const { items } = this;
    if (!items)
      return [];
    return [...items.values()];
  }
  dispose() {
    this.items.clear();
    this.path = "";
    this._removeWatcher = EMPTY_FN;
    this.items = EMPTY_SET;
    Object.freeze(this);
  }
};
var STAT_METHOD_F = "stat";
var STAT_METHOD_L = "lstat";
var WatchHelper = class {
  fsw;
  path;
  watchPath;
  fullWatchPath;
  dirParts;
  followSymlinks;
  statMethod;
  constructor(path2, follow, fsw) {
    this.fsw = fsw;
    const watchPath = path2;
    this.path = path2 = path2.replace(REPLACER_RE, "");
    this.watchPath = watchPath;
    this.fullWatchPath = sp2.resolve(watchPath);
    this.dirParts = [];
    this.dirParts.forEach((parts) => {
      if (parts.length > 1)
        parts.pop();
    });
    this.followSymlinks = follow;
    this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
  }
  entryPath(entry) {
    return sp2.join(this.watchPath, sp2.relative(this.watchPath, entry.fullPath));
  }
  filterPath(entry) {
    const { stats } = entry;
    if (stats && stats.isSymbolicLink())
      return this.filterDir(entry);
    const resolvedPath = this.entryPath(entry);
    return this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
  }
  filterDir(entry) {
    return this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
  }
};
var FSWatcher = class extends import_node_events.EventEmitter {
  closed;
  options;
  _closers;
  _ignoredPaths;
  _throttled;
  _streams;
  _symlinkPaths;
  _watched;
  _pendingWrites;
  _pendingUnlinks;
  _readyCount;
  _emitReady;
  _closePromise;
  _userIgnored;
  _readyEmitted;
  _emitRaw;
  _boundRemove;
  _nodeFsHandler;
  // Not indenting methods for history sake; for now.
  constructor(_opts = {}) {
    super();
    this.closed = false;
    this._closers = /* @__PURE__ */ new Map();
    this._ignoredPaths = /* @__PURE__ */ new Set();
    this._throttled = /* @__PURE__ */ new Map();
    this._streams = /* @__PURE__ */ new Set();
    this._symlinkPaths = /* @__PURE__ */ new Map();
    this._watched = /* @__PURE__ */ new Map();
    this._pendingWrites = /* @__PURE__ */ new Map();
    this._pendingUnlinks = /* @__PURE__ */ new Map();
    this._readyCount = 0;
    this._readyEmitted = false;
    const awf = _opts.awaitWriteFinish;
    const DEF_AWF = { stabilityThreshold: 2e3, pollInterval: 100 };
    const opts = {
      // Defaults
      persistent: true,
      ignoreInitial: false,
      ignorePermissionErrors: false,
      interval: 100,
      binaryInterval: 300,
      followSymlinks: true,
      usePolling: false,
      // useAsync: false,
      atomic: true,
      // NOTE: overwritten later (depends on usePolling)
      ..._opts,
      // Change format
      ignored: _opts.ignored ? arrify(_opts.ignored) : arrify([]),
      awaitWriteFinish: awf === true ? DEF_AWF : typeof awf === "object" ? { ...DEF_AWF, ...awf } : false
    };
    if (isIBMi)
      opts.usePolling = true;
    if (opts.atomic === void 0)
      opts.atomic = !opts.usePolling;
    const envPoll = process.env.CHOKIDAR_USEPOLLING;
    if (envPoll !== void 0) {
      const envLower = envPoll.toLowerCase();
      if (envLower === "false" || envLower === "0")
        opts.usePolling = false;
      else if (envLower === "true" || envLower === "1")
        opts.usePolling = true;
      else
        opts.usePolling = !!envLower;
    }
    const envInterval = process.env.CHOKIDAR_INTERVAL;
    if (envInterval)
      opts.interval = Number.parseInt(envInterval, 10);
    let readyCalls = 0;
    this._emitReady = () => {
      readyCalls++;
      if (readyCalls >= this._readyCount) {
        this._emitReady = EMPTY_FN;
        this._readyEmitted = true;
        process.nextTick(() => this.emit(EVENTS.READY));
      }
    };
    this._emitRaw = (...args) => this.emit(EVENTS.RAW, ...args);
    this._boundRemove = this._remove.bind(this);
    this.options = opts;
    this._nodeFsHandler = new NodeFsHandler(this);
    Object.freeze(opts);
  }
  _addIgnoredPath(matcher) {
    if (isMatcherObject(matcher)) {
      for (const ignored of this._ignoredPaths) {
        if (isMatcherObject(ignored) && ignored.path === matcher.path && ignored.recursive === matcher.recursive) {
          return;
        }
      }
    }
    this._ignoredPaths.add(matcher);
  }
  _removeIgnoredPath(matcher) {
    this._ignoredPaths.delete(matcher);
    if (typeof matcher === "string") {
      for (const ignored of this._ignoredPaths) {
        if (isMatcherObject(ignored) && ignored.path === matcher) {
          this._ignoredPaths.delete(ignored);
        }
      }
    }
  }
  // Public methods
  /**
   * Adds paths to be watched on an existing FSWatcher instance.
   * @param paths_ file or file list. Other arguments are unused
   */
  add(paths_, _origAdd, _internal) {
    const { cwd } = this.options;
    this.closed = false;
    this._closePromise = void 0;
    let paths = unifyPaths(paths_);
    if (cwd) {
      paths = paths.map((path2) => {
        const absPath = getAbsolutePath(path2, cwd);
        return absPath;
      });
    }
    paths.forEach((path2) => {
      this._removeIgnoredPath(path2);
    });
    this._userIgnored = void 0;
    if (!this._readyCount)
      this._readyCount = 0;
    this._readyCount += paths.length;
    Promise.all(paths.map(async (path2) => {
      const res = await this._nodeFsHandler._addToNodeFs(path2, !_internal, void 0, 0, _origAdd);
      if (res)
        this._emitReady();
      return res;
    })).then((results) => {
      if (this.closed)
        return;
      results.forEach((item) => {
        if (item)
          this.add(sp2.dirname(item), sp2.basename(_origAdd || item));
      });
    });
    return this;
  }
  /**
   * Close watchers or start ignoring events from specified paths.
   */
  unwatch(paths_) {
    if (this.closed)
      return this;
    const paths = unifyPaths(paths_);
    const { cwd } = this.options;
    paths.forEach((path2) => {
      if (!sp2.isAbsolute(path2) && !this._closers.has(path2)) {
        if (cwd)
          path2 = sp2.join(cwd, path2);
        path2 = sp2.resolve(path2);
      }
      this._closePath(path2);
      this._addIgnoredPath(path2);
      if (this._watched.has(path2)) {
        this._addIgnoredPath({
          path: path2,
          recursive: true
        });
      }
      this._userIgnored = void 0;
    });
    return this;
  }
  /**
   * Close watchers and remove all listeners from watched paths.
   */
  close() {
    if (this._closePromise) {
      return this._closePromise;
    }
    this.closed = true;
    this.removeAllListeners();
    const closers = [];
    this._closers.forEach((closerList) => closerList.forEach((closer) => {
      const promise = closer();
      if (promise instanceof Promise)
        closers.push(promise);
    }));
    this._streams.forEach((stream) => stream.destroy());
    this._userIgnored = void 0;
    this._readyCount = 0;
    this._readyEmitted = false;
    this._watched.forEach((dirent) => dirent.dispose());
    this._closers.clear();
    this._watched.clear();
    this._streams.clear();
    this._symlinkPaths.clear();
    this._throttled.clear();
    this._closePromise = closers.length ? Promise.all(closers).then(() => void 0) : Promise.resolve();
    return this._closePromise;
  }
  /**
   * Expose list of watched paths
   * @returns for chaining
   */
  getWatched() {
    const watchList = {};
    this._watched.forEach((entry, dir) => {
      const key = this.options.cwd ? sp2.relative(this.options.cwd, dir) : dir;
      const index = key || ONE_DOT;
      watchList[index] = entry.getChildren().sort();
    });
    return watchList;
  }
  emitWithAll(event, args) {
    this.emit(event, ...args);
    if (event !== EVENTS.ERROR)
      this.emit(EVENTS.ALL, event, ...args);
  }
  // Common helpers
  // --------------
  /**
   * Normalize and emit events.
   * Calling _emit DOES NOT MEAN emit() would be called!
   * @param event Type of event
   * @param path File or directory path
   * @param stats arguments to be passed with event
   * @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
   */
  async _emit(event, path2, stats) {
    if (this.closed)
      return;
    const opts = this.options;
    if (isWindows)
      path2 = sp2.normalize(path2);
    if (opts.cwd)
      path2 = sp2.relative(opts.cwd, path2);
    const args = [path2];
    if (stats != null)
      args.push(stats);
    const awf = opts.awaitWriteFinish;
    let pw;
    if (awf && (pw = this._pendingWrites.get(path2))) {
      pw.lastChange = /* @__PURE__ */ new Date();
      return this;
    }
    if (opts.atomic) {
      if (event === EVENTS.UNLINK) {
        this._pendingUnlinks.set(path2, [event, ...args]);
        setTimeout(() => {
          this._pendingUnlinks.forEach((entry, path3) => {
            this.emit(...entry);
            this.emit(EVENTS.ALL, ...entry);
            this._pendingUnlinks.delete(path3);
          });
        }, typeof opts.atomic === "number" ? opts.atomic : 100);
        return this;
      }
      if (event === EVENTS.ADD && this._pendingUnlinks.has(path2)) {
        event = EVENTS.CHANGE;
        this._pendingUnlinks.delete(path2);
      }
    }
    if (awf && (event === EVENTS.ADD || event === EVENTS.CHANGE) && this._readyEmitted) {
      const awfEmit = (err, stats2) => {
        if (err) {
          event = EVENTS.ERROR;
          args[0] = err;
          this.emitWithAll(event, args);
        } else if (stats2) {
          if (args.length > 1) {
            args[1] = stats2;
          } else {
            args.push(stats2);
          }
          this.emitWithAll(event, args);
        }
      };
      this._awaitWriteFinish(path2, awf.stabilityThreshold, event, awfEmit);
      return this;
    }
    if (event === EVENTS.CHANGE) {
      const isThrottled = !this._throttle(EVENTS.CHANGE, path2, 50);
      if (isThrottled)
        return this;
    }
    if (opts.alwaysStat && stats === void 0 && (event === EVENTS.ADD || event === EVENTS.ADD_DIR || event === EVENTS.CHANGE)) {
      const fullPath = opts.cwd ? sp2.join(opts.cwd, path2) : path2;
      let stats2;
      try {
        stats2 = await (0, import_promises3.stat)(fullPath);
      } catch (err) {
      }
      if (!stats2 || this.closed)
        return;
      args.push(stats2);
    }
    this.emitWithAll(event, args);
    return this;
  }
  /**
   * Common handler for errors
   * @returns The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
   */
  _handleError(error) {
    const code = error && error.code;
    if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) {
      this.emit(EVENTS.ERROR, error);
    }
    return error || this.closed;
  }
  /**
   * Helper utility for throttling
   * @param actionType type being throttled
   * @param path being acted upon
   * @param timeout duration of time to suppress duplicate actions
   * @returns tracking object or false if action should be suppressed
   */
  _throttle(actionType, path2, timeout) {
    if (!this._throttled.has(actionType)) {
      this._throttled.set(actionType, /* @__PURE__ */ new Map());
    }
    const action = this._throttled.get(actionType);
    if (!action)
      throw new Error("invalid throttle");
    const actionPath = action.get(path2);
    if (actionPath) {
      actionPath.count++;
      return false;
    }
    let timeoutObject;
    const clear = () => {
      const item = action.get(path2);
      const count = item ? item.count : 0;
      action.delete(path2);
      clearTimeout(timeoutObject);
      if (item)
        clearTimeout(item.timeoutObject);
      return count;
    };
    timeoutObject = setTimeout(clear, timeout);
    const thr = { timeoutObject, clear, count: 0 };
    action.set(path2, thr);
    return thr;
  }
  _incrReadyCount() {
    return this._readyCount++;
  }
  /**
   * Awaits write operation to finish.
   * Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
   * @param path being acted upon
   * @param threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
   * @param event
   * @param awfEmit Callback to be called when ready for event to be emitted.
   */
  _awaitWriteFinish(path2, threshold, event, awfEmit) {
    const awf = this.options.awaitWriteFinish;
    if (typeof awf !== "object")
      return;
    const pollInterval = awf.pollInterval;
    let timeoutHandler;
    let fullPath = path2;
    if (this.options.cwd && !sp2.isAbsolute(path2)) {
      fullPath = sp2.join(this.options.cwd, path2);
    }
    const now = /* @__PURE__ */ new Date();
    const writes = this._pendingWrites;
    function awaitWriteFinishFn(prevStat) {
      (0, import_node_fs2.stat)(fullPath, (err, curStat) => {
        if (err || !writes.has(path2)) {
          if (err && err.code !== "ENOENT")
            awfEmit(err);
          return;
        }
        const now2 = Number(/* @__PURE__ */ new Date());
        if (prevStat && curStat.size !== prevStat.size) {
          writes.get(path2).lastChange = now2;
        }
        const pw = writes.get(path2);
        const df = now2 - pw.lastChange;
        if (df >= threshold) {
          writes.delete(path2);
          awfEmit(void 0, curStat);
        } else {
          timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval, curStat);
        }
      });
    }
    if (!writes.has(path2)) {
      writes.set(path2, {
        lastChange: now,
        cancelWait: () => {
          writes.delete(path2);
          clearTimeout(timeoutHandler);
          return event;
        }
      });
      timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval);
    }
  }
  /**
   * Determines whether user has asked to ignore this path.
   */
  _isIgnored(path2, stats) {
    if (this.options.atomic && DOT_RE.test(path2))
      return true;
    if (!this._userIgnored) {
      const { cwd } = this.options;
      const ign = this.options.ignored;
      const ignored = (ign || []).map(normalizeIgnored(cwd));
      const ignoredPaths = [...this._ignoredPaths];
      const list = [...ignoredPaths.map(normalizeIgnored(cwd)), ...ignored];
      this._userIgnored = anymatch(list, void 0);
    }
    return this._userIgnored(path2, stats);
  }
  _isntIgnored(path2, stat4) {
    return !this._isIgnored(path2, stat4);
  }
  /**
   * Provides a set of common helpers and properties relating to symlink handling.
   * @param path file or directory pattern being watched
   */
  _getWatchHelpers(path2) {
    return new WatchHelper(path2, this.options.followSymlinks, this);
  }
  // Directory helpers
  // -----------------
  /**
   * Provides directory tracking objects
   * @param directory path of the directory
   */
  _getWatchedDir(directory) {
    const dir = sp2.resolve(directory);
    if (!this._watched.has(dir))
      this._watched.set(dir, new DirEntry(dir, this._boundRemove));
    return this._watched.get(dir);
  }
  // File helpers
  // ------------
  /**
   * Check for read permissions: https://stackoverflow.com/a/11781404/1358405
   */
  _hasReadPermissions(stats) {
    if (this.options.ignorePermissionErrors)
      return true;
    return Boolean(Number(stats.mode) & 256);
  }
  /**
   * Handles emitting unlink events for
   * files and directories, and via recursion, for
   * files and directories within directories that are unlinked
   * @param directory within which the following item is located
   * @param item      base path of item/directory
   */
  _remove(directory, item, isDirectory) {
    const path2 = sp2.join(directory, item);
    const fullPath = sp2.resolve(path2);
    isDirectory = isDirectory != null ? isDirectory : this._watched.has(path2) || this._watched.has(fullPath);
    if (!this._throttle("remove", path2, 100))
      return;
    if (!isDirectory && this._watched.size === 1) {
      this.add(directory, item, true);
    }
    const wp = this._getWatchedDir(path2);
    const nestedDirectoryChildren = wp.getChildren();
    nestedDirectoryChildren.forEach((nested) => this._remove(path2, nested));
    const parent = this._getWatchedDir(directory);
    const wasTracked = parent.has(item);
    parent.remove(item);
    if (this._symlinkPaths.has(fullPath)) {
      this._symlinkPaths.delete(fullPath);
    }
    let relPath = path2;
    if (this.options.cwd)
      relPath = sp2.relative(this.options.cwd, path2);
    if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
      const event = this._pendingWrites.get(relPath).cancelWait();
      if (event === EVENTS.ADD)
        return;
    }
    this._watched.delete(path2);
    this._watched.delete(fullPath);
    const eventName = isDirectory ? EVENTS.UNLINK_DIR : EVENTS.UNLINK;
    if (wasTracked && !this._isIgnored(path2))
      this._emit(eventName, path2);
    this._closePath(path2);
  }
  /**
   * Closes all watchers for a path
   */
  _closePath(path2) {
    this._closeFile(path2);
    const dir = sp2.dirname(path2);
    this._getWatchedDir(dir).remove(sp2.basename(path2));
  }
  /**
   * Closes only file-specific watchers
   */
  _closeFile(path2) {
    const closers = this._closers.get(path2);
    if (!closers)
      return;
    closers.forEach((closer) => closer());
    this._closers.delete(path2);
  }
  _addPathCloser(path2, closer) {
    if (!closer)
      return;
    let list = this._closers.get(path2);
    if (!list) {
      list = [];
      this._closers.set(path2, list);
    }
    list.push(closer);
  }
  _readdirp(root, opts) {
    if (this.closed)
      return;
    const options = { type: EVENTS.ALL, alwaysStat: true, lstat: true, ...opts, depth: 0 };
    let stream = readdirp(root, options);
    this._streams.add(stream);
    stream.once(STR_CLOSE, () => {
      stream = void 0;
    });
    stream.once(STR_END, () => {
      if (stream) {
        this._streams.delete(stream);
        stream = void 0;
      }
    });
    return stream;
  }
};
function watch(paths, options = {}) {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
}
var chokidar_default = { watch, FSWatcher };

// src/shared/electron.ts
function hasElectronApp(value) {
  return Boolean(value && typeof value === "object" && "app" in value);
}
var processElectronMain = process.__electronMain;
var globalElectronMain = globalThis.__electronMain;
var electronMain = (hasElectronApp(processElectronMain) ? processElectronMain : null) ?? (hasElectronApp(globalElectronMain) ? globalElectronMain : null) ?? (processElectronMain && typeof processElectronMain === "object" && "default" in processElectronMain && hasElectronApp(processElectronMain.default) ? processElectronMain.default : null) ?? (globalElectronMain && typeof globalElectronMain === "object" && "default" in globalElectronMain && hasElectronApp(globalElectronMain.default) ? globalElectronMain.default : null);
if (!electronMain) {
  throw new Error("Electron main API no estA disponible en el runtime ESM");
}

// src/shared/dev-log.ts
var DEV_LOG_RUNTIME_KEY = "__NEXUS_DEV_LOG_RUNTIME__";
function getDevLogRuntime() {
  const runtime = globalThis[DEV_LOG_RUNTIME_KEY];
  if (!runtime || typeof runtime !== "object") {
    return null;
  }
  return runtime;
}
function devLogResolveScope(scope) {
  const normalizedScope = String(scope || "").trim() || "main.runtime";
  if (normalizedScope.startsWith("bootstrap.")) {
    return {
      process: "bootstrap",
      surface: "bootstrap",
      subsystem: normalizedScope,
      shard: "10-bootstrap.jsonl"
    };
  }
  if (normalizedScope.startsWith("main.")) {
    return {
      process: "main",
      surface: "main",
      subsystem: normalizedScope,
      shard: "20-main.jsonl"
    };
  }
  if (normalizedScope.startsWith("backend.preview")) {
    return {
      process: "backend",
      surface: "preview",
      subsystem: normalizedScope,
      shard: "32-preview.jsonl"
    };
  }
  if (normalizedScope.startsWith("backend.plugins")) {
    return {
      process: "backend",
      surface: "plugins",
      subsystem: normalizedScope,
      shard: "33-plugins-backend.jsonl"
    };
  }
  if (normalizedScope.startsWith("backend.vaultRuntime") || normalizedScope.startsWith("backend.filesystem")) {
    return {
      process: "backend",
      surface: "vault-runtime",
      subsystem: normalizedScope,
      shard: "31-vault-runtime.jsonl"
    };
  }
  if (normalizedScope.startsWith("backend.")) {
    return {
      process: "backend",
      surface: "backend",
      subsystem: normalizedScope,
      shard: "30-backend.jsonl"
    };
  }
  if (normalizedScope.startsWith("ipc.")) {
    return {
      process: "main",
      surface: "ipc",
      subsystem: normalizedScope,
      shard: "50-ipc.jsonl"
    };
  }
  if (normalizedScope.startsWith("addon.directoryWatcher")) {
    return {
      process: "addon",
      surface: "directory-watcher",
      subsystem: normalizedScope,
      shard: "60-addons-directory-watcher.jsonl"
    };
  }
  if (normalizedScope.startsWith("addon.safeRecycle")) {
    return {
      process: "addon",
      surface: "safe-recycle",
      subsystem: normalizedScope,
      shard: "61-addons-safe-recycle.jsonl"
    };
  }
  return {
    process: "main",
    surface: "main",
    subsystem: normalizedScope,
    shard: "20-main.jsonl"
  };
}
function devLogNormalizeContext(scopeOrContext) {
  return typeof scopeOrContext === "string" ? devLogResolveScope(scopeOrContext) : scopeOrContext;
}
function devLogAppend(event) {
  const runtime = getDevLogRuntime();
  runtime?.devLogAppendEvent?.(event);
}
function devLogShouldMirrorToConsole(level) {
  return level === "warn" || level === "error" || level === "fatal";
}
function createDevLogger(scopeOrContext) {
  const context = devLogNormalizeContext(scopeOrContext);
  const emit = (level, event, message, data = null) => {
    devLogAppend({
      ...context,
      level,
      event,
      message,
      data,
      mirrorConsole: devLogShouldMirrorToConsole(level)
    });
  };
  return {
    context,
    debug: (event, message, data = null) => emit("debug", event, message, data),
    info: (event, message, data = null) => emit("info", event, message, data),
    warn: (event, message, data = null) => emit("warn", event, message, data),
    error: (event, message, data = null) => emit("error", event, message, data),
    fatal: (event, message, data = null) => emit("fatal", event, message, data)
  };
}

// ../nexus-plugins/booru/src/constants.js
var BOORU_PLUGIN_ID = "nexus.booru";
var BOORU_CLASSIFICATION_LABELS = Object.freeze({
  "unclassified": "Sin clasificar",
  "classified-basic": "Clasificado basico",
  "duplicate-review": "Duplicado en revision"
});
var BOORU_MEDIA_KIND_LABELS = Object.freeze({
  image: "Image",
  video: "Video",
  gif: "GIF"
});
var BOORU_REALITY_LABELS = Object.freeze({
  real: "Real",
  ficticio: "Ficticio"
});
var BOORU_ENTITY_KIND_LABELS = Object.freeze({
  author: "Persona",
  artist: "Artist",
  character: "Character",
  universe: "Universe"
});

// ../nexus-plugins/booru/src/plugin-settings.js
var BOORU_SETTINGS_DEFAULTS = Object.freeze({
  watchFolderPath: "",
  pythonExecutable: ""
});
function normalizeTextSetting(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/^"(.*)"$/, "$1");
}
function normalizeBooruSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...BOORU_SETTINGS_DEFAULTS
    };
  }
  return {
    watchFolderPath: normalizeTextSetting(value.watchFolderPath),
    pythonExecutable: normalizeTextSetting(value.pythonExecutable)
  };
}
function readBooruWatchFolderPath(value) {
  return normalizeBooruSettings(value).watchFolderPath;
}
function readBooruPythonExecutable(value) {
  return normalizeBooruSettings(value).pythonExecutable;
}

// ../nexus-plugins/booru/src/domain/classification-policy.js
var BOORU_REALITY_AUTO = "auto";
var BOORU_REALITY_MANUAL = "manual";
var BOORU_CLASSIFICATION_KINDS = Object.freeze([
  "author",
  "character",
  "universe",
  "artist"
]);
var RECOMMENDATION_KIND_PRIORITY = Object.freeze({
  author: Object.freeze(["author", "character", "universe", "artist"]),
  character: Object.freeze(["universe", "artist", "author", "character"]),
  artist: Object.freeze(["character", "universe", "author", "artist"]),
  universe: Object.freeze(["character", "artist", "author", "universe"]),
  real: Object.freeze(["author", "character", "universe", "artist"]),
  ficticio: Object.freeze(["character", "universe", "artist", "author"]),
  default: BOORU_CLASSIFICATION_KINDS
});
function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}
function normalizeRealitySource(value) {
  return value === BOORU_REALITY_MANUAL ? BOORU_REALITY_MANUAL : BOORU_REALITY_AUTO;
}
function resolveBooruReality({
  reality = null,
  realitySource = BOORU_REALITY_AUTO,
  realityWasEdited = false,
  authors = [],
  artists = [],
  characters = [],
  universes = []
} = {}) {
  const normalizedReality = reality === "real" || reality === "ficticio" ? reality : null;
  if (hasItems(authors)) {
    return { reality: "real", source: BOORU_REALITY_AUTO };
  }
  if (realityWasEdited) {
    if (normalizedReality) {
      return { reality: normalizedReality, source: BOORU_REALITY_MANUAL };
    }
    realitySource = BOORU_REALITY_AUTO;
  }
  if (normalizeRealitySource(realitySource) === BOORU_REALITY_MANUAL && normalizedReality) {
    return { reality: normalizedReality, source: BOORU_REALITY_MANUAL };
  }
  if (hasItems(characters) || hasItems(artists) || hasItems(universes)) {
    return { reality: "ficticio", source: BOORU_REALITY_AUTO };
  }
  return { reality: null, source: BOORU_REALITY_AUTO };
}
function getBooruEssentialState({
  reality = null,
  authors = [],
  artists = [],
  characters = [],
  universes = []
} = {}) {
  const missing = [];
  if (!reality) {
    missing.push("reality");
  } else if (reality === "real") {
    if (!hasItems(authors)) {
      missing.push("author");
    }
  } else if (reality === "ficticio") {
    if (!hasItems(characters)) {
      missing.push("character");
    }
    const hasUniverse = hasItems(universes) || characters.some((character) => Boolean(character?.universe?.id));
    if (!hasUniverse || characters.some((character) => !character?.universe?.id)) {
      missing.push("universe");
    }
    if (!hasItems(artists)) {
      missing.push("artist");
    }
  }
  return {
    complete: missing.length === 0,
    missing,
    classificationState: missing.length ? "unclassified" : "classified-basic"
  };
}
function getBooruRecommendationKindOrder(context = null) {
  const normalizedContext = String(context || "").trim();
  return RECOMMENDATION_KIND_PRIORITY[normalizedContext] || RECOMMENDATION_KIND_PRIORITY.default;
}
function getBooruRecommendationKindRank(context, kind) {
  const index = getBooruRecommendationKindOrder(context).indexOf(kind);
  return index >= 0 ? index : BOORU_CLASSIFICATION_KINDS.length;
}

// ../nexus-plugins/booru/src/domain/details-policy.js
var DETAILS_FIELD_CONFIG = Object.freeze({
  author: Object.freeze({
    kind: "author",
    field: "authors",
    label: "Persona"
  }),
  artist: Object.freeze({
    kind: "artist",
    field: "artists",
    label: "Artists"
  }),
  character: Object.freeze({
    kind: "character",
    field: "characters",
    label: "Characters"
  }),
  universe: Object.freeze({
    kind: "universe",
    field: "universes",
    label: "Universes"
  })
});
var DETAILS_RELATION_KEYS = Object.freeze({
  authors: "authors",
  artists: "artists",
  characters: "characters",
  universes: "directUniverses",
  manualTags: "manualTags"
});
function hasItems2(value) {
  return Array.isArray(value) && value.length > 0;
}
function normalizedItemIds(value) {
  return (Array.isArray(value) ? value : []).map((item) => String(item?.id || "").trim()).filter(Boolean).sort();
}
function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
function hasMixedRelations(resources, resourceKey) {
  const reference = normalizedItemIds(resources[0]?.[resourceKey]);
  return resources.slice(1).some((resource) => !arraysEqual(reference, normalizedItemIds(resource?.[resourceKey])));
}
function getBooruDetailsMixedFields(resources) {
  const normalizedResources = (Array.isArray(resources) ? resources : []).filter(Boolean);
  if (normalizedResources.length < 2) {
    return [];
  }
  const mixedFields = [];
  const referenceReality = normalizedResources[0]?.reality ?? null;
  if (normalizedResources.slice(1).some((resource) => (resource?.reality ?? null) !== referenceReality)) {
    mixedFields.push("reality");
  }
  for (const [fieldName, resourceKey] of Object.entries(DETAILS_RELATION_KEYS)) {
    if (hasMixedRelations(normalizedResources, resourceKey)) {
      mixedFields.push(fieldName);
    }
  }
  return mixedFields;
}
function getBooruDetailsPriorityContext(draft = null) {
  if (hasItems2(draft?.authors)) {
    return "author";
  }
  if (hasItems2(draft?.characters)) {
    return "character";
  }
  if (hasItems2(draft?.artists)) {
    return "artist";
  }
  if (hasItems2(draft?.universes)) {
    return "universe";
  }
  if (draft?.reality === "real" || draft?.reality === "ficticio") {
    return draft.reality;
  }
  return "default";
}
function getFieldDescription(kind, reality) {
  if (kind === "author") {
    return reality === "real" ? "Obligatoria para completar la ruta Real." : "Persona presente en el recurso.";
  }
  if (kind === "character") {
    return reality === "ficticio" ? "Obligatorio para completar la ruta Ficticio; cada Character conserva su Universe." : "Character presente en el recurso.";
  }
  if (kind === "universe") {
    return "Universe asociado directamente; el de cada Character se conserva como relaci\xF3n estructural.";
  }
  return reality === "ficticio" ? "Obligatorio para completar la ruta Ficticio." : "Artist presente en el recurso.";
}
function getBooruDetailsFieldSchema(draft = null) {
  const reality = draft?.reality === "real" || draft?.reality === "ficticio" ? draft.reality : null;
  const context = getBooruDetailsPriorityContext(draft);
  return getBooruRecommendationKindOrder(context).map((kind) => {
    const config = DETAILS_FIELD_CONFIG[kind];
    return {
      ...config,
      required: kind === "author" && reality === "real" || (kind === "character" || kind === "artist") && reality === "ficticio",
      description: getFieldDescription(kind, reality)
    };
  });
}
function getBooruDetailsRealityState(draft = null) {
  const mixedFields = new Set(Array.isArray(draft?.mixedFields) ? draft.mixedFields : []);
  const hasDeterminingEntity = hasItems2(draft?.authors) || hasItems2(draft?.characters) || hasItems2(draft?.artists) || mixedFields.has("authors") || mixedFields.has("characters") || mixedFields.has("artists");
  const value = draft?.reality === "real" || draft?.reality === "ficticio" ? draft.reality : null;
  const mixed = mixedFields.has("reality");
  return {
    mode: hasDeterminingEntity ? "readonly" : "editable",
    value,
    mixed,
    source: draft?.realitySource === "manual" ? "manual" : "auto",
    label: mixed ? "Valores mixtos" : value === "real" ? "Real" : value === "ficticio" ? "Ficticio" : "Sin definir"
  };
}

// ../nexus-plugins/booru/src/domain/entity-visual-policy.js
var DEFAULT_ENTITY_VISUAL_LAYOUT = Object.freeze({
  scale: 1,
  offsetX: 0,
  offsetY: 0
});
function clamp(value, minimum, maximum, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.min(maximum, Math.max(minimum, numericValue)) : fallback;
}
function normalizeBooruEntityVisualLayout(value = null) {
  const rawOffsetX = Number(value?.offsetX);
  const rawOffsetY = Number(value?.offsetY);
  const offsetX = Number.isFinite(rawOffsetX) && Math.abs(rawOffsetX) > 1 ? rawOffsetX / 180 : rawOffsetX;
  const offsetY = Number.isFinite(rawOffsetY) && Math.abs(rawOffsetY) > 1 ? rawOffsetY / 180 : rawOffsetY;
  return {
    scale: clamp(value?.scale, 0.2, 4, DEFAULT_ENTITY_VISUAL_LAYOUT.scale),
    offsetX: clamp(offsetX, -1.5, 1.5, DEFAULT_ENTITY_VISUAL_LAYOUT.offsetX),
    offsetY: clamp(offsetY, -1.5, 1.5, DEFAULT_ENTITY_VISUAL_LAYOUT.offsetY)
  };
}
function normalizeBooruEntityVisualSettings(value = null) {
  return {
    avatar: normalizeBooruEntityVisualLayout(value?.avatar),
    banner: normalizeBooruEntityVisualLayout(value?.banner)
  };
}
function createBooruEntityVisualProjection({
  role = "avatar",
  descriptor = null,
  layout = null,
  selection = "derived"
} = {}) {
  const resourceId = String(descriptor?.sampleResourceId || descriptor?.resourceId || "").trim();
  const pathValue = String(
    descriptor?.originalStoragePath || descriptor?.storagePath || descriptor?.sampleStoragePath || descriptor?.pathValue || ""
  ).trim();
  const previewPath = String(
    descriptor?.sampleStoragePath || descriptor?.storagePath || descriptor?.originalStoragePath || descriptor?.previewPath || ""
  ).trim();
  const mediaKind = String(
    descriptor?.originalMediaKind || descriptor?.mediaKind || descriptor?.sampleMediaKind || "image"
  ).trim() || "image";
  if (!resourceId || !pathValue) {
    return null;
  }
  return {
    role: role === "banner" ? "banner" : "avatar",
    selection: ["avatar", "banner", "cover", "derived"].includes(selection) ? selection : "derived",
    resourceId,
    source: {
      resourceId,
      pathValue,
      previewPath: previewPath || pathValue,
      mediaKind
    },
    layout: normalizeBooruEntityVisualLayout(layout)
  };
}
function getBooruEntityVisualMediaStyle(visualOrLayout = null) {
  const layout = normalizeBooruEntityVisualLayout(visualOrLayout?.layout || visualOrLayout);
  return {
    transform: `translate(${layout.offsetX * 100}%, ${layout.offsetY * 100}%) scale(${layout.scale})`,
    transformOrigin: "center center"
  };
}
function getBooruEntityVisualRenderProps(visual = null) {
  const pathValue = String(visual?.source?.pathValue || "").trim();
  if (!pathValue) {
    return null;
  }
  const mediaKind = String(visual?.source?.mediaKind || "image").trim() || "image";
  return {
    pathValue,
    mediaKind,
    mediaStyle: getBooruEntityVisualMediaStyle(visual),
    objectFit: "contain",
    forceOriginal: true,
    autoplay: mediaKind === "video",
    loop: mediaKind === "video"
  };
}

// ../nexus-plugins/booru/src/domain/contextual-browse.js
var BOORU_BROWSE_DIRECTIONS = Object.freeze({ ASC: "asc", DESC: "desc" });
var BOORU_BROWSE_GROUPINGS = Object.freeze({ CONTINUOUS: "continuous", SECTIONED: "sectioned" });
var BOORU_RESOURCE_SORT_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha de integracion" },
  { value: "author", label: "Persona" },
  { value: "character", label: "Character" },
  { value: "universe", label: "Universe" },
  { value: "artist", label: "Artist" },
  { value: "tag", label: "Tag plana" },
  { value: "random", label: "Aleatorio" }
]);
var BOORU_RESOURCE_GROUP_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha" },
  { value: "author", label: "Persona" },
  { value: "character", label: "Character" },
  { value: "universe", label: "Universe" },
  { value: "artist", label: "Artist" }
]);
var BOORU_RESOURCE_GROUP_ORDER_OPTIONS = Object.freeze([
  { value: "importedAt", label: "Fecha de integraci\xF3n" },
  { value: "alphabetical", label: "Alfab\xE9tico" }
]);
var BOORU_ENTITY_SORT_OPTIONS = Object.freeze([
  { value: "name", label: "Nombre" },
  { value: "createdAt", label: "Fecha de creacion" },
  { value: "resourceCount", label: "Cantidad de recursos" },
  { value: "random", label: "Aleatorio" }
]);
var RESOURCE_SORTS = new Set(BOORU_RESOURCE_SORT_OPTIONS.map((option) => option.value));
var RESOURCE_GROUPS = new Set(BOORU_RESOURCE_GROUP_OPTIONS.map((option) => option.value));
var RESOURCE_GROUP_ORDERS = new Set(BOORU_RESOURCE_GROUP_ORDER_OPTIONS.map((option) => option.value));
var ENTITY_SORTS = /* @__PURE__ */ new Set([...BOORU_ENTITY_SORT_OPTIONS.map((option) => option.value), "universe"]);
function normalizeBooruFreeTextTerms(value) {
  const source = Array.isArray(value) ? value : String(value || "").match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
  const terms = [];
  const seen = /* @__PURE__ */ new Set();
  for (const candidate of source) {
    const term = String(candidate || "").trim().replace(/^"|"$/g, "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR");
    if (!term || seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }
  return terms;
}
function normalizeBooruBrowseQuery(value = null, family = "resource", allowUniverseSort = false) {
  const isEntity = family === "entity";
  const allowedSorts = isEntity ? ENTITY_SORTS : RESOURCE_SORTS;
  const fallbackSort = isEntity ? "name" : "importedAt";
  const fallbackDirection = isEntity ? "asc" : "desc";
  let sortBy = allowedSorts.has(String(value?.sortBy || "")) ? String(value.sortBy) : fallbackSort;
  if (sortBy === "universe" && (!isEntity || !allowUniverseSort)) sortBy = fallbackSort;
  const direction = value?.direction === "asc" || value?.direction === "desc" ? value.direction : fallbackDirection;
  const randomSeed = String(value?.randomSeed || "").trim() || "booru-stable";
  const grouping = sortBy === "random" ? "continuous" : value?.grouping === "sectioned" ? "sectioned" : "continuous";
  let groupBy = String(value?.groupBy || "").trim();
  if (isEntity) {
    if (!ENTITY_SORTS.has(groupBy) || groupBy === "random") {
      groupBy = grouping === "sectioned" && sortBy !== "random" ? sortBy : "name";
    }
    if (groupBy === "universe" && !allowUniverseSort) groupBy = "name";
  } else if (!RESOURCE_GROUPS.has(groupBy)) {
    groupBy = grouping === "sectioned" && RESOURCE_GROUPS.has(sortBy) ? sortBy : "importedAt";
  }
  const groupOrderBy = RESOURCE_GROUP_ORDERS.has(String(value?.groupOrderBy || "")) ? String(value.groupOrderBy) : isEntity ? "alphabetical" : "importedAt";
  return { sortBy, direction, grouping, randomSeed, groupBy, groupOrderBy };
}
function compareText(left, right) {
  return String(left || "").localeCompare(String(right || ""), "es-AR", { sensitivity: "base", numeric: true });
}
function seededRank(id, seed) {
  const value = `${seed}:${id}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function firstName(items) {
  return (Array.isArray(items) ? items : []).map((item) => String(item?.displayName || item?.name || "").trim()).filter(Boolean).sort(compareText)[0] || "";
}
function getResourceSortValue(item, sortBy) {
  if (sortBy === "author") return firstName(item?.authors);
  if (sortBy === "artist") return firstName(item?.artists);
  if (sortBy === "character") return firstName(item?.characters);
  if (sortBy === "universe") return firstName(item?.universes);
  if (sortBy === "tag") return firstName(item?.manualTags);
  return String(item?.importedAt || "");
}
function getEntitySortValue(item, sortBy) {
  if (sortBy === "createdAt") return String(item?.createdAt || "");
  if (sortBy === "resourceCount") return Number(item?.resourceCount || 0);
  if (sortBy === "universe") return String(item?.universe?.displayName || "");
  return String(item?.displayName || "");
}
function sortBooruBrowseItems(items = [], browseValue = null, family = "resource", allowUniverseSort = false) {
  const browse = normalizeBooruBrowseQuery(browseValue, family, allowUniverseSort);
  if (family === "resource" && browse.grouping === "sectioned") {
    return [...Array.isArray(items) ? items : []].sort((left, right) => {
      const importedDifference = compareText(right?.importedAt, left?.importedAt);
      return importedDifference || compareText(left?.id, right?.id);
    });
  }
  const direction = browse.direction === "desc" ? -1 : 1;
  return [...Array.isArray(items) ? items : []].sort((left, right) => {
    if (browse.sortBy === "random") {
      const rankDifference = seededRank(left?.id, browse.randomSeed) - seededRank(right?.id, browse.randomSeed);
      if (rankDifference) return rankDifference;
    } else {
      const leftValue = family === "entity" ? getEntitySortValue(left, browse.sortBy) : getResourceSortValue(left, browse.sortBy);
      const rightValue = family === "entity" ? getEntitySortValue(right, browse.sortBy) : getResourceSortValue(right, browse.sortBy);
      const missingDifference = Number(!leftValue && leftValue !== 0) - Number(!rightValue && rightValue !== 0);
      if (missingDifference) return missingDifference * direction;
      const valueDifference = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : compareText(leftValue, rightValue);
      if (valueDifference) return valueDifference * direction;
    }
    return compareText(left?.id, right?.id);
  });
}
function initialBucket(value) {
  const first = String(value || "").trim().charAt(0).toLocaleUpperCase("es-AR");
  if (/\d/.test(first)) return { key: "initial:0-9", label: "0-9", rank: 1 };
  if (new RegExp("\\p{L}", "u").test(first)) return { key: `initial:${first}`, label: first, rank: 0 };
  return { key: "initial:#", label: "#", rank: 2 };
}
function dateBucket(value, now = /* @__PURE__ */ new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { key: "date:missing", label: "Sin fecha", rank: 6 };
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDifference = Math.floor((startToday.getTime() - startDate.getTime()) / 864e5);
  if (dayDifference <= 0) return { key: "date:today", label: "Hoy", rank: 0 };
  if (dayDifference === 1) return { key: "date:yesterday", label: "Ayer", rank: 1 };
  if (dayDifference < 7) return { key: "date:week", label: "Ultimos 7 dias", rank: 2 };
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return { key: "date:month", label: "Este mes", rank: 3 };
  if (date.getFullYear() === now.getFullYear()) return { key: "date:year", label: "Este ano", rank: 4 };
  return { key: "date:older", label: "Anteriores", rank: 5 };
}
function countBucket(value) {
  const count = Math.max(0, Number(value || 0));
  if (!count) return { key: "count:0", label: "0", rank: 0 };
  if (count < 10) return { key: "count:1-9", label: "1-9", rank: 1 };
  if (count < 50) return { key: "count:10-49", label: "10-49", rank: 2 };
  if (count < 100) return { key: "count:50-99", label: "50-99", rank: 3 };
  return { key: "count:100+", label: "100+", rank: 4 };
}
function exactBuckets(values, missingLabel, includeMissing = true, associationKind = "") {
  const entries = Array.from(new Map((Array.isArray(values) ? values : []).map((item) => ({
    id: String(item?.id || "").trim(),
    name: String(item?.displayName || item?.name || "").trim()
  })).filter((item) => item.name).map((item) => [`${item.id || item.name.normalize("NFKC").toLocaleLowerCase("es-AR")}`, item])).values()).sort((left, right) => compareText(left.name, right.name));
  return entries.length ? entries.map((entry) => ({
    key: `value:${associationKind || "text"}:${entry.id || entry.name.normalize("NFKC").toLocaleLowerCase("es-AR")}`,
    label: entry.name,
    rank: 0,
    association: associationKind && entry.id ? { kind: associationKind, entityId: entry.id } : null
  })) : includeMissing ? [{ key: `missing:${missingLabel}`, label: `Sin ${missingLabel}`, rank: 1 }] : [];
}
function resourceBuckets(item, groupBy, now) {
  if (groupBy === "importedAt") return [dateBucket(item?.importedAt, now)];
  if (groupBy === "author") return exactBuckets(item?.authors, "Persona", false, "author");
  if (groupBy === "artist") return exactBuckets(item?.artists, "Artist", false, "artist");
  if (groupBy === "character") return exactBuckets(item?.characters, "Character", false, "character");
  if (groupBy === "universe") return exactBuckets(item?.universes, "Universe", false, "universe");
  return [];
}
function entityBuckets(item, sortBy, now) {
  if (sortBy === "name") return [initialBucket(item?.displayName)];
  if (sortBy === "createdAt") return [dateBucket(item?.createdAt, now)];
  if (sortBy === "resourceCount") return [countBucket(item?.resourceCount)];
  if (sortBy === "universe") return exactBuckets(item?.universe ? [item.universe] : [], "Universe", true, "universe");
  return [];
}
function createBooruGroupedPlacements(items = [], browseValue = null, family = "resource", allowUniverseSort = false, now = /* @__PURE__ */ new Date()) {
  const browse = normalizeBooruBrowseQuery(browseValue, family, allowUniverseSort);
  if (browse.grouping !== "sectioned" || browse.sortBy === "random") return [];
  const sortedItems = sortBooruBrowseItems(items, browse, family, allowUniverseSort);
  const groupMap = /* @__PURE__ */ new Map();
  for (const item of sortedItems) {
    const buckets = family === "entity" ? entityBuckets(item, browse.groupBy, now) : resourceBuckets(item, browse.groupBy, now);
    for (const bucket of buckets) {
      if (!groupMap.has(bucket.key)) groupMap.set(bucket.key, {
        ...bucket,
        newestImportedAt: "",
        placements: []
      });
      const group = groupMap.get(bucket.key);
      if (family === "resource" && compareText(item?.importedAt, group.newestImportedAt) > 0) {
        group.newestImportedAt = String(item?.importedAt || "");
      }
      group.placements.push({
        placementId: `${bucket.key}:${item.id}`,
        resourceId: family === "resource" ? item.id : null,
        entityId: family === "entity" ? item.id : null,
        groupKey: bucket.key,
        groupLabel: bucket.label,
        association: bucket.association || null
      });
    }
  }
  const directionFactor = browse.direction === "desc" ? -1 : 1;
  const groups = Array.from(groupMap.values()).sort((left, right) => {
    if (family === "resource") {
      const valueDifference = browse.groupOrderBy === "alphabetical" ? compareText(left.label, right.label) : compareText(left.newestImportedAt, right.newestImportedAt);
      if (valueDifference) return valueDifference * directionFactor;
      return compareText(left.label, right.label) * directionFactor;
    }
    const dateSort = browse.groupBy === "createdAt";
    const entityDirectionFactor = directionFactor * (dateSort ? -1 : 1);
    if (left.rank !== right.rank) return (left.rank - right.rank) * entityDirectionFactor;
    return compareText(left.label, right.label) * entityDirectionFactor;
  });
  return groups.flatMap((group) => group.placements);
}
function createBooruIncrementalBrowseResult(items = [], browseValue = null, options = {}) {
  const family = options.family === "entity" ? "entity" : "resource";
  const allowUniverseSort = Boolean(options.allowUniverseSort);
  const offset = Math.max(0, Number(options.offset || 0));
  const limit = Math.max(1, Number(options.limit || 42));
  const browse = normalizeBooruBrowseQuery(browseValue, family, allowUniverseSort);
  const groupableItems = family === "resource" && browse.grouping === "sectioned" ? (Array.isArray(items) ? items : []).filter((item) => resourceBuckets(item, browse.groupBy, options.now).length > 0) : items;
  const sortedItems = sortBooruBrowseItems(groupableItems, browse, family, allowUniverseSort);
  const allPlacements = createBooruGroupedPlacements(sortedItems, browse, family, allowUniverseSort, options.now);
  if (!allPlacements.length) {
    const pageItems = sortedItems.slice(offset, offset + limit);
    return {
      browse,
      items: pageItems,
      placements: [],
      totalCount: sortedItems.length,
      placementCount: sortedItems.length,
      hasMore: offset + pageItems.length < sortedItems.length
    };
  }
  const pagePlacements = allPlacements.slice(offset, offset + limit);
  const pageIds = new Set(pagePlacements.map((placement) => family === "entity" ? placement.entityId : placement.resourceId));
  return {
    browse,
    items: sortedItems.filter((item) => pageIds.has(item.id)),
    placements: pagePlacements,
    totalCount: sortedItems.length,
    placementCount: allPlacements.length,
    hasMore: offset + pagePlacements.length < allPlacements.length
  };
}

// ../nexus-plugins/booru/src/domain/entity-relations.js
var ENTITY_RELATION_TARGETS = Object.freeze({
  author: Object.freeze([]),
  character: Object.freeze(["artist"]),
  artist: Object.freeze(["character", "universe"]),
  universe: Object.freeze(["character", "artist"])
});
var ENTITY_RELATION_TABS = Object.freeze({
  artist: "artists",
  character: "characters",
  universe: "universes"
});
var ENTITY_RELATION_LABELS = Object.freeze({
  artist: "Artists",
  character: "Characters",
  universe: "Universes"
});
function getBooruEntityRelationTargets(sourceKind) {
  return [...ENTITY_RELATION_TARGETS[String(sourceKind || "").trim()] || []];
}
function normalizeBooruEntityRelationRequest(value = null) {
  const sourceKind = String(value?.sourceKind || "").trim();
  const sourceId = String(value?.sourceId || "").trim();
  const relationKind = String(value?.relationKind || "").trim();
  const query = String(value?.query || "").trim();
  const rawOffset = Number(value?.offset);
  const rawLimit = Number(value?.limit);
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(500, Math.floor(rawLimit)) : 42;
  const allowUniverseSort = relationKind === "character" && sourceKind !== "universe";
  const browse = normalizeBooruBrowseQuery(value, "entity", allowUniverseSort);
  if (!sourceId || !getBooruEntityRelationTargets(sourceKind).includes(relationKind)) {
    return null;
  }
  return {
    sourceKind,
    sourceId,
    relationKind,
    query,
    offset,
    limit,
    allowUniverseSort,
    ...browse,
    exactFilters: Array.isArray(value?.exactFilters) ? value.exactFilters.filter(Boolean) : []
  };
}
function createBooruIncrementalEntityResult(items = [], request = null) {
  const normalizedItems = Array.isArray(items) ? items.filter((item) => item?.id) : [];
  const incremental = createBooruIncrementalBrowseResult(normalizedItems, request, {
    family: "entity",
    allowUniverseSort: Boolean(request?.allowUniverseSort),
    offset: request?.offset,
    limit: request?.limit
  });
  return {
    sourceKind: request?.sourceKind || null,
    sourceId: request?.sourceId || null,
    relationKind: request?.relationKind || null,
    query: request?.query || "",
    ...incremental
  };
}

// ../nexus-plugins/booru/src/domain/pending-workflow.js
var BOORU_NO_MISSING_FILTER = "none";
var BOORU_RECOMMENDATION_SCOPES = Object.freeze({
  ALL: "all",
  ESSENTIAL: "essential",
  TAGS: "tags"
});
var ESSENTIAL_MISSING_KINDS = /* @__PURE__ */ new Set(["author", "artist", "character", "universe"]);
function normalizeBooruRecommendationScope(value) {
  if (value === BOORU_RECOMMENDATION_SCOPES.ESSENTIAL) {
    return BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
  }
  if (value === BOORU_RECOMMENDATION_SCOPES.TAGS) {
    return BOORU_RECOMMENDATION_SCOPES.TAGS;
  }
  return BOORU_RECOMMENDATION_SCOPES.ALL;
}
function getBooruRecommendationScope(section, pendingMode) {
  if (section !== "pending") {
    return BOORU_RECOMMENDATION_SCOPES.ALL;
  }
  return pendingMode === "tags" ? BOORU_RECOMMENDATION_SCOPES.TAGS : BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
}
function getBooruImplicitRecommendationMissingKind(scope, realityValue) {
  return normalizeBooruRecommendationScope(scope) === BOORU_RECOMMENDATION_SCOPES.ESSENTIAL && realityValue === "real" ? "author" : null;
}
function buildBooruResourceQuery({
  searchTokens = [],
  freeText = "",
  browse = null,
  mediaKindFilter = "all",
  realityFilter = "all",
  pendingMode = "essential",
  missingFilter = BOORU_NO_MISSING_FILTER
} = {}) {
  let searchReality = null;
  let searchClassificationState = null;
  let searchMissing = null;
  let searchMediaKind = null;
  const includeEntities = [];
  const excludeEntities = [];
  const includeTags = [];
  const excludeTags = [];
  for (const token of Array.isArray(searchTokens) ? searchTokens : []) {
    if (token?.type === "entity") {
      const nextFilter = {
        kind: token.kind,
        id: token.id || null,
        value: token.value,
        label: token.label || token.value
      };
      if (token.negative) {
        excludeEntities.push(nextFilter);
      } else {
        includeEntities.push(nextFilter);
      }
      continue;
    }
    if (token?.type === "tag") {
      const nextFilter = {
        id: token.id || null,
        value: token.value,
        label: token.label || token.value
      };
      if (token.negative) {
        excludeTags.push(nextFilter);
      } else {
        includeTags.push(nextFilter);
      }
      continue;
    }
    if (token?.type === "reality" && !token.negative) {
      searchReality = token.value;
      continue;
    }
    if (token?.type === "missing" && !token.negative) {
      searchMissing = token.value;
      continue;
    }
    if (token?.type === "classification-state" && !token.negative) {
      searchClassificationState = token.value;
      continue;
    }
    if (token?.type === "media-kind" && !token.negative) {
      searchMediaKind = token.value;
    }
  }
  const explicitReality = realityFilter === "real" || realityFilter === "ficticio" ? realityFilter : null;
  const explicitMissing = realityFilter === "untyped" ? "type" : missingFilter !== BOORU_NO_MISSING_FILTER ? missingFilter : null;
  return {
    textTerms: String(freeText || "").trim(),
    mediaKind: mediaKindFilter !== "all" ? mediaKindFilter : searchMediaKind,
    reality: explicitReality || searchReality,
    classificationState: searchClassificationState || null,
    pendingMode: pendingMode === "tags" ? "tags" : "essential",
    includeEntities,
    excludeEntities,
    includeTags,
    excludeTags,
    missing: explicitMissing || searchMissing,
    sortBy: browse?.sortBy || "importedAt",
    groupBy: browse?.groupBy || "importedAt",
    groupOrderBy: browse?.groupOrderBy || "importedAt",
    direction: browse?.direction || "desc",
    grouping: browse?.grouping || "continuous",
    randomSeed: browse?.randomSeed || "booru-stable"
  };
}
function getBooruContextualMissingFilterOptions(realityValue, includeEntityFilters = [], recommendationScope = BOORU_RECOMMENDATION_SCOPES.ALL) {
  const entityKinds = new Set(
    (Array.isArray(includeEntityFilters) ? includeEntityFilters : []).map((filter) => String(filter?.kind || "").trim()).filter(Boolean)
  );
  const disabledValues = /* @__PURE__ */ new Set();
  if (entityKinds.has("author")) {
    disabledValues.add("author");
  }
  if (entityKinds.has("artist")) {
    disabledValues.add("artist");
  }
  if (entityKinds.has("character")) {
    disabledValues.add("character");
    disabledValues.add("universe");
  } else if (entityKinds.has("universe")) {
    disabledValues.add("universe");
  }
  const options = [{ value: BOORU_NO_MISSING_FILTER, label: "Ninguno" }];
  if (realityValue === "real" && normalizeBooruRecommendationScope(recommendationScope) !== BOORU_RECOMMENDATION_SCOPES.ESSENTIAL) {
    options.push({ value: "author", label: "Sin persona" });
  } else if (realityValue === "ficticio") {
    options.push(
      { value: "character", label: "Sin char" },
      { value: "universe", label: "Sin universe" },
      { value: "artist", label: "Sin artist" }
    );
  }
  return options.map((option) => ({
    ...option,
    disabled: option.value !== BOORU_NO_MISSING_FILTER && disabledValues.has(option.value)
  }));
}
function isBooruMissingFilterCompatible(missingFilter, options = []) {
  if (missingFilter === "type") {
    return true;
  }
  if (!ESSENTIAL_MISSING_KINDS.has(missingFilter)) {
    return missingFilter === BOORU_NO_MISSING_FILTER;
  }
  return options.some((option) => option?.value === missingFilter && !option?.disabled);
}
function resourceMatchesBooruPendingMode(resource, pendingMode) {
  if (!resource || typeof resource !== "object") {
    return false;
  }
  return pendingMode === "tags" ? resource.isPending === false : resource.isPending === true;
}
function resourceMatchesBooruSection(resource, section, pendingMode) {
  if (!resource || typeof resource !== "object") {
    return false;
  }
  if (section === "media") {
    return resource.isPending === false;
  }
  if (section === "pending") {
    return resourceMatchesBooruPendingMode(resource, pendingMode);
  }
  return true;
}

// ../nexus-plugins/booru/src/domain/resource-mutations.js
function normalizeBooruResourceMutationResult(value) {
  const source = value && typeof value === "object" ? value : {};
  const legacyResources = Array.isArray(source.resource) ? source.resource : [source.resource].filter(Boolean);
  const updatedResources = (Array.isArray(source.updatedResources) ? source.updatedResources : legacyResources).filter((resource) => resource?.id);
  return {
    revision: String(source.revision || "").trim(),
    reason: String(source.reason || "unknown").trim() || "unknown",
    updatedResources,
    leavingQueryIds: Array.from(new Set(
      (Array.isArray(source.leavingQueryIds) ? source.leavingQueryIds : []).map((resourceId) => String(resourceId || "").trim()).filter(Boolean)
    )),
    enteredQueryIds: Array.from(new Set(
      (Array.isArray(source.enteredQueryIds) ? source.enteredQueryIds : []).map((resourceId) => String(resourceId || "").trim()).filter(Boolean)
    )),
    queryPlacements: (Array.isArray(source.queryPlacements) ? source.queryPlacements : []).map((placement) => ({
      resourceId: String(placement?.resourceId || "").trim(),
      index: Number(placement?.index)
    })).filter((placement) => placement.resourceId && Number.isInteger(placement.index) && placement.index >= 0),
    affectedEntities: (Array.isArray(source.affectedEntities) ? source.affectedEntities : []).map((entity) => ({
      kind: String(entity?.kind || "").trim(),
      id: String(entity?.id || "").trim()
    })).filter((entity) => entity.kind && entity.id),
    totalCountDelta: Number.isFinite(Number(source.totalCountDelta)) ? Number(source.totalCountDelta) : 0
  };
}
function applyBooruMutationToResourceWindow(currentItems, rawMutation) {
  const mutation = normalizeBooruResourceMutationResult(rawMutation);
  const originalItems = (Array.isArray(currentItems) ? currentItems : []).filter((item) => item?.id);
  const originalWindowSize = originalItems.length;
  const updatedById = new Map(mutation.updatedResources.map((resource) => [resource.id, resource]));
  const leavingIds = new Set(mutation.leavingQueryIds);
  const placementById = new Map(
    mutation.queryPlacements.map((placement) => [placement.resourceId, placement.index])
  );
  const touchedIds = /* @__PURE__ */ new Set([
    ...updatedById.keys(),
    ...leavingIds
  ]);
  const nextItems = originalItems.filter((item) => !touchedIds.has(item.id));
  const positionedResources = [];
  for (const resource of mutation.updatedResources) {
    if (leavingIds.has(resource.id)) {
      continue;
    }
    const placement = placementById.get(resource.id);
    const wasLoaded = originalItems.some((item) => item.id === resource.id);
    if (Number.isInteger(placement) && placement >= 0 && placement < originalWindowSize) {
      positionedResources.push({ resource, placement });
    } else if (wasLoaded && placement == null) {
      positionedResources.push({ resource, placement: originalItems.findIndex((item) => item.id === resource.id) });
    }
  }
  positionedResources.sort((left, right) => left.placement - right.placement).forEach(({ resource, placement }) => {
    nextItems.splice(Math.min(placement, nextItems.length), 0, resource);
  });
  return {
    items: nextItems,
    mutation
  };
}
function resolveBooruAnchoredResources(resourceIds, visibleResources, anchoredResources) {
  const visibleById = new Map(
    (Array.isArray(visibleResources) ? visibleResources : []).filter((resource) => resource?.id).map((resource) => [resource.id, resource])
  );
  const anchoredById = new Map(
    (Array.isArray(anchoredResources) ? anchoredResources : []).filter((resource) => resource?.id).map((resource) => [resource.id, resource])
  );
  return (Array.isArray(resourceIds) ? resourceIds : []).map((resourceId) => anchoredById.get(resourceId) || visibleById.get(resourceId) || null).filter(Boolean);
}
function isBooruResourceWindowContextCurrent(requestContext, currentContext) {
  if (!requestContext || !currentContext) {
    return false;
  }
  return Boolean(currentContext.showResourceWorkspace) && String(currentContext.activeResourceSection || "") === String(requestContext.activeResourceSection || "") && String(currentContext.querySignature || "") === String(requestContext.querySignature || "") && Number(currentContext.currentResourcePage || 1) === Number(requestContext.currentResourcePage || 1) && Number(currentContext.itemCount || 0) === Number(requestContext.itemCount || 0);
}

// ../nexus-plugins/booru/src/domain/duplicate-ingest.js
function createBooruKeyedSerialExecutor() {
  const pendingByKey = /* @__PURE__ */ new Map();
  return async function runBooruKeyedTask(rawKey, task) {
    const key = String(rawKey || "").trim();
    if (!key) throw new Error("La clave de ingestion es obligatoria.");
    if (typeof task !== "function") throw new Error("La tarea de ingestion es obligatoria.");
    const previous = pendingByKey.get(key) || Promise.resolve();
    let releaseCurrent;
    const current = new Promise((resolve3) => {
      releaseCurrent = resolve3;
    });
    pendingByKey.set(key, current);
    await previous.catch(() => void 0);
    try {
      return await task();
    } finally {
      releaseCurrent();
      if (pendingByKey.get(key) === current) pendingByKey.delete(key);
    }
  };
}
function createBooruIngestMutation({
  resource,
  createdResourceId = null,
  reusedCanonical = false
} = {}) {
  const resourceId = String(resource?.id || "").trim();
  const createdId = String(createdResourceId || "").trim() || null;
  return {
    reason: reusedCanonical ? "duplicate-reintegrated" : "resource-created",
    resource,
    createdResourceId: createdId,
    reusedCanonical: Boolean(reusedCanonical),
    updatedResourceIds: resourceId ? [resourceId] : [],
    createdResourceIds: createdId ? [createdId] : []
  };
}

// ../nexus-plugins/booru/src/domain/video-preview-policy.js
var BOORU_VIDEO_AUTOPLAY_MAX_ORIGINAL_MS = 15e3;
var BOORU_VIDEO_SHORT_DURATION_SECONDS = 15;
var BOORU_VIDEO_SHORT_VARIANT = "first-15s-muted-v2";
function shouldGenerateBooruVideoShort(mediaKind, durationMs) {
  const duration = Number(durationMs);
  return mediaKind === "video" && Number.isFinite(duration) && duration > BOORU_VIDEO_AUTOPLAY_MAX_ORIGINAL_MS;
}

// ../nexus-plugins/booru/src/booru-utils.js
function normalizeBooruText(value) {
  return String(value ?? "").trim();
}
function normalizeBooruOptionalText(value) {
  const normalized = normalizeBooruText(value);
  return normalized || null;
}
function normalizeBooruComparableText(value) {
  return normalizeBooruText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ");
}
function normalizeBooruSlug(value, fallback = "booru") {
  const source = normalizeBooruText(value || fallback);
  const slug = source.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
}
function normalizeBooruReality(value) {
  const normalized = normalizeBooruComparableText(value);
  if (normalized === "real") {
    return "real";
  }
  if (normalized === "ficticio") {
    return "ficticio";
  }
  return null;
}
function uniqueBooruIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const value of values) {
    const normalized = normalizeBooruText(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}
var BOORU_ENTITY_PREFIX_ALIASES = Object.freeze({
  persona: "author",
  author: "author",
  char: "character",
  character: "character",
  artist: "artist",
  universe: "universe"
});
var BOORU_MISSING_FILTER_ALIASES = Object.freeze({
  type: "type",
  tipo: "type",
  reality: "type",
  persona: "author",
  author: "author",
  artist: "artist",
  char: "character",
  character: "character",
  universe: "universe",
  "char-universe": "universe",
  "character-universe": "universe"
});
var BOORU_MEDIA_KIND_SET = /* @__PURE__ */ new Set(["image", "video", "gif"]);
function normalizeBooruEntityPrefix(prefix) {
  const normalizedPrefix = normalizeBooruComparableText(prefix);
  return BOORU_ENTITY_PREFIX_ALIASES[normalizedPrefix] || null;
}
function normalizeBooruMissingFilter(value) {
  const normalizedValue = normalizeBooruComparableText(value);
  return BOORU_MISSING_FILTER_ALIASES[normalizedValue] || null;
}
function unquoteBooruQueryValue(value) {
  const normalizedValue = normalizeBooruText(value);
  if (normalizedValue.length >= 2 && normalizedValue.startsWith('"') && normalizedValue.endsWith('"')) {
    return normalizedValue.slice(1, -1).replace(/\\"/g, '"');
  }
  return normalizedValue;
}
function tokenizeBooruQuery(value) {
  const normalizedValue = normalizeBooruText(value);
  if (!normalizedValue) {
    return [];
  }
  return normalizedValue.match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
}
function parseBooruSearchSyntax(value) {
  const tokens = [];
  const includeEntities = [];
  const excludeEntities = [];
  const includeTags = [];
  const excludeTags = [];
  let missing = null;
  const rawTokens = tokenizeBooruQuery(value);
  let mediaKind = null;
  let reality = null;
  let classificationState = null;
  for (const rawToken of rawTokens) {
    const trimmedToken = normalizeBooruText(rawToken);
    if (!trimmedToken) {
      continue;
    }
    const negative = trimmedToken.startsWith("-") && trimmedToken.length > 1;
    const normalizedToken = negative ? trimmedToken.slice(1) : trimmedToken;
    const separatorIndex = normalizedToken.indexOf(":");
    if (separatorIndex <= 0) {
      const tokenValue2 = unquoteBooruQueryValue(normalizedToken);
      if (!tokenValue2) {
        continue;
      }
      const item2 = {
        id: null,
        value: tokenValue2,
        label: tokenValue2
      };
      tokens.push({
        raw: trimmedToken,
        type: "tag",
        negative,
        id: null,
        value: tokenValue2
      });
      if (negative) {
        excludeTags.push(item2);
      } else {
        includeTags.push(item2);
      }
      continue;
    }
    const rawPrefix = normalizedToken.slice(0, separatorIndex);
    const rawValue = normalizedToken.slice(separatorIndex + 1);
    const tokenValue = unquoteBooruQueryValue(rawValue);
    if (!tokenValue) {
      continue;
    }
    const entityKind = normalizeBooruEntityPrefix(rawPrefix);
    if (entityKind) {
      const item2 = {
        kind: entityKind,
        id: null,
        value: tokenValue,
        label: tokenValue
      };
      tokens.push({
        raw: trimmedToken,
        type: "entity",
        kind: entityKind,
        negative,
        id: null,
        value: tokenValue
      });
      if (negative) {
        excludeEntities.push(item2);
      } else {
        includeEntities.push(item2);
      }
      continue;
    }
    const normalizedPrefix = normalizeBooruComparableText(rawPrefix);
    if (normalizedPrefix === "tag") {
      const item2 = {
        id: null,
        value: tokenValue,
        label: tokenValue
      };
      tokens.push({
        raw: trimmedToken,
        type: "tag",
        negative,
        id: null,
        value: tokenValue
      });
      if (negative) {
        excludeTags.push(item2);
      } else {
        includeTags.push(item2);
      }
      continue;
    }
    if (normalizedPrefix === "reality") {
      const nextReality = normalizeBooruReality(tokenValue);
      if (!nextReality) {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      reality = nextReality;
      tokens.push({
        raw: trimmedToken,
        type: "reality",
        negative: false,
        value: nextReality
      });
      continue;
    }
    if (normalizedPrefix === "media") {
      const nextMediaKind = normalizeBooruComparableText(tokenValue);
      if (!BOORU_MEDIA_KIND_SET.has(nextMediaKind)) {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      mediaKind = nextMediaKind;
      tokens.push({
        raw: trimmedToken,
        type: "media-kind",
        negative: false,
        value: nextMediaKind
      });
      continue;
    }
    if (normalizedPrefix === "status") {
      const nextStatus = normalizeBooruComparableText(tokenValue);
      if (nextStatus !== "unclassified") {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      classificationState = "unclassified";
      tokens.push({
        raw: trimmedToken,
        type: "classification-state",
        negative: false,
        value: classificationState
      });
      continue;
    }
    if (normalizedPrefix === "missing") {
      const normalizedMissing = normalizeBooruMissingFilter(tokenValue);
      if (!normalizedMissing) {
        const fallbackTagValue2 = unquoteBooruQueryValue(normalizedToken);
        if (!fallbackTagValue2) {
          continue;
        }
        const item2 = {
          id: null,
          value: fallbackTagValue2,
          label: fallbackTagValue2
        };
        tokens.push({
          raw: trimmedToken,
          type: "tag",
          negative,
          id: null,
          value: fallbackTagValue2
        });
        if (negative) {
          excludeTags.push(item2);
        } else {
          includeTags.push(item2);
        }
        continue;
      }
      missing = normalizedMissing;
      tokens.push({
        raw: trimmedToken,
        type: "missing",
        negative: false,
        value: normalizedMissing
      });
      continue;
    }
    const fallbackTagValue = unquoteBooruQueryValue(normalizedToken);
    if (!fallbackTagValue) {
      continue;
    }
    const item = {
      id: null,
      value: fallbackTagValue,
      label: fallbackTagValue
    };
    tokens.push({
      raw: trimmedToken,
      type: "tag",
      negative,
      id: null,
      value: fallbackTagValue
    });
    if (negative) {
      excludeTags.push(item);
    } else {
      includeTags.push(item);
    }
  }
  return {
    raw: normalizeBooruText(value),
    tokens,
    query: {
      mediaKind,
      reality,
      classificationState,
      includeEntities,
      excludeEntities,
      includeTags,
      excludeTags,
      missing
    }
  };
}

// ../nexus-plugins/booru/src/backend.ts
var CLIPBOARD_IMAGE_TEMP_ROOT = import_node_path2.default.join(import_node_os2.default.tmpdir(), "new-nexus", "clipboard-images");
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".bmp",
  ".avif"
]);
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([
  ".mp4",
  ".webm",
  ".mkv",
  ".mov",
  ".avi",
  ".m4v"
]);
var GIF_EXTENSIONS = /* @__PURE__ */ new Set([".gif"]);
var ENTITY_TABLES = {
  author: "booru_authors",
  artist: "booru_artists",
  character: "booru_characters",
  universe: "booru_universes"
};
var ENTITY_VISUAL_COLUMNS = {
  avatar: "avatar_resource_id",
  banner: "banner_resource_id"
};
var RESOURCE_RELATION_TABLES = {
  author: "booru_resource_authors",
  artist: "booru_resource_artists",
  character: "booru_resource_characters"
};
var RESOURCE_RELATION_ENTITY_ID_COLUMNS = {
  author: "author_id",
  artist: "artist_id",
  character: "character_id"
};
var BOORU_RESOURCE_SECTIONS = /* @__PURE__ */ new Set(["media", "pending", "duplicates", "trash", "profile"]);
var BOORU_RESOURCE_MEDIA_KINDS = /* @__PURE__ */ new Set(["image", "video", "gif"]);
var BOORU_RECOMMENDATION_PAGE_SIZE = 24;
var DEFAULT_RESOURCE_PAGE_SIZE = 120;
var MAX_RESOURCE_PAGE_SIZE = 5e3;
var BRAVE_PROFILE_DIRECTORY = "Plugins";
var THUMBNAIL_VARIANT_NAME = "grid";
var THUMBNAIL_MAX_SIDE_PX = 384;
var THUMBNAIL_CONCURRENCY = 2;
var BOORU_RUNTIME_STATE_KEYS = {
  resourcesVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.resourcesVersion`,
  thumbnailsVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.thumbnailsVersion`,
  entitiesVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.entitiesVersion`,
  watcherVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.watcherVersion`,
  metricsVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.metricsVersion`
};
var booruBackendLogger = createDevLogger("backend.plugins.booru");
var runtimeState = null;
var BooruRuntimeCancelledError = class extends Error {
  constructor() {
    super("El runtime de Booru fue cancelado.");
    this.name = "BooruRuntimeCancelledError";
  }
};
function createSuccess(data) {
  return {
    ok: true,
    data
  };
}
function createError(error, fallbackMessage) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage
  };
}
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function truncateDiagnosticText(value, maxLength = 2400) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}
function summarizeIdsForLog(ids, maxCount = 12) {
  return uniqueBooruIds(Array.isArray(ids) ? ids : []).slice(0, maxCount);
}
function logBackendDuration(event, message, durationMs, data = {}) {
  const method = durationMs >= 180 ? "info" : "debug";
  booruBackendLogger[method](event, message, {
    durationMs: Number(durationMs.toFixed(2)),
    ...data
  });
}
function isRuntimeStateActive(state) {
  return Boolean(
    isRuntimeStateCurrent(state) && !state.shuttingDown && !state.abortController.signal.aborted
  );
}
function isRuntimeStateCurrent(state) {
  return Boolean(state && runtimeState === state && state.db);
}
function assertRuntimeStateActive(state) {
  if (!isRuntimeStateActive(state)) {
    throw new BooruRuntimeCancelledError();
  }
}
function assertRuntimeStateCurrent(state) {
  if (!isRuntimeStateCurrent(state)) {
    throw new BooruRuntimeCancelledError();
  }
}
function isRuntimeCancellation(error) {
  return error instanceof BooruRuntimeCancelledError || error instanceof Error && error.name === "AbortError";
}
function trackRuntimeBackgroundTask(state, task) {
  const trackedTask = Promise.resolve(task);
  state.backgroundTasks.add(trackedTask);
  void trackedTask.finally(() => {
    state.backgroundTasks.delete(trackedTask);
  }).catch(() => void 0);
  return task;
}
function scheduleRuntimeInvalidationForState(state, ...keys) {
  if (!isRuntimeStateActive(state)) {
    return;
  }
  keys.forEach((key) => state.pendingInvalidations.add(key));
  const hasNonMetricsInvalidation = Array.from(state.pendingInvalidations).some((key) => key !== "metricsVersion");
  const desiredDelayMs = hasNonMetricsInvalidation ? 40 : 350;
  if (state.invalidationTimer) {
    if (desiredDelayMs >= state.invalidationDelayMs) {
      return;
    }
    clearTimeout(state.invalidationTimer);
    state.invalidationTimer = null;
  }
  state.invalidationDelayMs = desiredDelayMs;
  state.invalidationTimer = setTimeout(() => {
    if (!isRuntimeStateActive(state)) {
      return;
    }
    const pendingKeys = Array.from(state.pendingInvalidations);
    state.pendingInvalidations.clear();
    state.invalidationTimer = null;
    state.invalidationDelayMs = 0;
    if (!pendingKeys.length) {
      return;
    }
    const versionBase = `${Date.now()}-${state.invalidationVersion++}`;
    void Promise.all(
      pendingKeys.map((key) => state.ctx.state.set(
        BOORU_RUNTIME_STATE_KEYS[key],
        `${versionBase}:${key}`
      ))
    ).then(() => {
      booruBackendLogger.debug(
        "booru.runtime-invalidation.flush",
        "Booru publico invalidaciones de runtime para el renderer.",
        {
          keys: pendingKeys,
          versionBase
        }
      );
    }).catch((error) => {
      booruBackendLogger.warn(
        "booru.runtime-invalidation.error",
        "Booru no pudo publicar invalidaciones de runtime.",
        {
          keys: pendingKeys,
          error
        }
      );
    });
  }, desiredDelayMs);
}
function scheduleRuntimeInvalidation(...keys) {
  scheduleRuntimeInvalidationForState(runtimeState, ...keys);
}
function withTransaction(db, callback) {
  db.exec("BEGIN");
  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
function getStoragePaths(ctx) {
  const storageRoot = import_node_path2.default.join(ctx.vault.nexusPath, "plugins-data", BOORU_PLUGIN_ID);
  return {
    storageRoot,
    catalogPath: import_node_path2.default.join(storageRoot, "catalog.db"),
    mediaRoot: import_node_path2.default.join(storageRoot, "media"),
    duplicatesRoot: import_node_path2.default.join(storageRoot, "review", "duplicates"),
    thumbsRoot: import_node_path2.default.join(storageRoot, "thumbs"),
    shortsRoot: import_node_path2.default.join(storageRoot, "shorts")
  };
}
async function ensureStoragePaths(storagePaths) {
  for (const directoryPath of [
    storagePaths.storageRoot,
    storagePaths.mediaRoot,
    storagePaths.duplicatesRoot,
    storagePaths.thumbsRoot,
    storagePaths.shortsRoot
  ]) {
    await import_promises4.default.mkdir(directoryPath, { recursive: true });
  }
}
function ensureCatalogSchema(db) {
  db.function("booru_normalize", { deterministic: true }, (value) => normalizeBooruComparableText(value));
  db.function("booru_seeded_rank", { deterministic: true }, (id, seed) => {
    const digest = import_node_crypto.default.createHash("sha256").update(`${String(seed || "")}:${String(id || "")}`).digest("hex");
    return Number.parseInt(digest.slice(0, 12), 16);
  });
  db.exec(`
    CREATE TABLE IF NOT EXISTS booru_resources (
      id TEXT PRIMARY KEY NOT NULL,
      storage_filename TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      extension TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      media_kind TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      width INTEGER,
      height INTEGER,
      duration_ms INTEGER,
      content_hash TEXT NOT NULL,
      reality TEXT,
      reality_source TEXT NOT NULL DEFAULT 'auto',
      classification_state TEXT NOT NULL DEFAULT 'unclassified',
      canonical_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      source_path TEXT,
      trashed_at TEXT,
      imported_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resources_state
    ON booru_resources (classification_state, imported_at DESC);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_hash
    ON booru_resources (content_hash);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_kind
    ON booru_resources (media_kind, imported_at DESC);

    CREATE TABLE IF NOT EXISTS booru_tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_resource_tags (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS booru_entity_tags (
      entity_kind TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (entity_kind, entity_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS booru_entity_aliases (
      entity_kind TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      alias_name TEXT NOT NULL,
      comparable_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (entity_kind, entity_id, comparable_name)
    );

    CREATE TABLE IF NOT EXISTS booru_social_platforms (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL UNIQUE,
      icon_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      icon_layout_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_entity_social_links (
      id TEXT PRIMARY KEY NOT NULL,
      entity_kind TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      platform_id TEXT NOT NULL REFERENCES booru_social_platforms(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE (entity_kind, entity_id, platform_id, url)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_inherited_tags (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      source_kind TEXT NOT NULL,
      source_entity_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, tag_id, source_kind, source_entity_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_tag_exclusions (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES booru_tags(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_inherited_universes (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      character_id TEXT NOT NULL REFERENCES booru_characters(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, universe_id, character_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_universe_exclusions (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, universe_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_video_shorts (
      resource_id TEXT PRIMARY KEY NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      storage_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      variant TEXT NOT NULL DEFAULT 'legacy-60s-v1',
      generated_at TEXT,
      error_message TEXT
    );

    CREATE TABLE IF NOT EXISTS booru_authors (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_artists (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_characters (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_universes (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS booru_resource_authors (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES booru_authors(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, author_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_authors_resource
    ON booru_resource_authors (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_authors_author
    ON booru_resource_authors (author_id);

    CREATE TABLE IF NOT EXISTS booru_resource_artists (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      artist_id TEXT NOT NULL REFERENCES booru_artists(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, artist_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_artists_resource
    ON booru_resource_artists (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_artists_artist
    ON booru_resource_artists (artist_id);

    CREATE TABLE IF NOT EXISTS booru_resource_characters (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      character_id TEXT NOT NULL REFERENCES booru_characters(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, character_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_characters_resource
    ON booru_resource_characters (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_characters_character
    ON booru_resource_characters (character_id);

    CREATE TABLE IF NOT EXISTS booru_character_universes (
      character_id TEXT NOT NULL REFERENCES booru_characters(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (character_id, universe_id)
    );

    CREATE TABLE IF NOT EXISTS booru_resource_universes (
      resource_id TEXT NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      universe_id TEXT NOT NULL REFERENCES booru_universes(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (resource_id, universe_id)
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_universes_resource
    ON booru_resource_universes (resource_id, sort_order ASC);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_universes_universe
    ON booru_resource_universes (universe_id);

    CREATE TABLE IF NOT EXISTS booru_resource_thumbnails (
      resource_id TEXT PRIMARY KEY NOT NULL REFERENCES booru_resources(id) ON DELETE CASCADE,
      storage_path TEXT,
      mime_type TEXT,
      width INTEGER,
      height INTEGER,
      byte_size INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      source_hash TEXT,
      generated_at TEXT,
      error_message TEXT,
      frame_timestamp_ms INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_booru_resource_thumbnails_status
    ON booru_resource_thumbnails (status, generated_at DESC);
  `);
  const resourceColumns = new Set(
    db.prepare(`PRAGMA table_info(booru_resources)`).all().map((row) => String(row?.name || ""))
  );
  const addedRealitySource = !resourceColumns.has("reality_source");
  if (addedRealitySource) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN reality_source TEXT NOT NULL DEFAULT 'auto'`);
    db.exec(`
      UPDATE booru_resources
      SET reality_source = CASE
        WHEN reality IS NULL THEN 'auto'
        WHEN EXISTS (
          SELECT 1 FROM booru_resource_authors rel
          WHERE rel.resource_id = booru_resources.id
        ) THEN 'auto'
        WHEN reality = 'ficticio' AND (
          EXISTS (
            SELECT 1 FROM booru_resource_artists rel
            WHERE rel.resource_id = booru_resources.id
          )
          OR EXISTS (
            SELECT 1 FROM booru_resource_characters rel
            WHERE rel.resource_id = booru_resources.id
          )
          OR EXISTS (
            SELECT 1 FROM booru_resource_universes rel
            WHERE rel.resource_id = booru_resources.id
          )
        ) THEN 'auto'
        ELSE 'manual'
      END
    `);
  }
  if (!resourceColumns.has("trashed_at")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN trashed_at TEXT`);
  }
  if (!resourceColumns.has("media_info_status")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN media_info_status TEXT NOT NULL DEFAULT 'pending'`);
  }
  if (!resourceColumns.has("media_info_error")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN media_info_error TEXT`);
  }
  const videoShortColumns = new Set(
    db.prepare(`PRAGMA table_info(booru_resource_video_shorts)`).all().map((row) => String(row?.name || ""))
  );
  if (!videoShortColumns.has("variant")) {
    db.exec(`ALTER TABLE booru_resource_video_shorts ADD COLUMN variant TEXT NOT NULL DEFAULT 'legacy-60s-v1'`);
  }
  for (const entityTable of Object.values(ENTITY_TABLES)) {
    const entityColumns = new Set(
      db.prepare(`PRAGMA table_info(${entityTable})`).all().map((row) => String(row?.name || ""))
    );
    if (!entityColumns.has("avatar_resource_id")) {
      db.exec(`
        ALTER TABLE ${entityTable}
        ADD COLUMN avatar_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL
      `);
    }
    if (!entityColumns.has("banner_resource_id")) {
      db.exec(`
        ALTER TABLE ${entityTable}
        ADD COLUMN banner_resource_id TEXT REFERENCES booru_resources(id) ON DELETE SET NULL
      `);
    }
    if (!entityColumns.has("visual_settings_json")) {
      db.exec(`
        ALTER TABLE ${entityTable}
        ADD COLUMN visual_settings_json TEXT
      `);
    }
  }
  db.exec(`
    DELETE FROM booru_character_universes
    WHERE rowid NOT IN (
      SELECT MIN(rowid)
      FROM booru_character_universes
      GROUP BY character_id
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_booru_character_universes_character
    ON booru_character_universes (character_id);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_trashed
    ON booru_resources (trashed_at, imported_at DESC);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_media_info
    ON booru_resources (media_info_status, imported_at DESC);

    CREATE INDEX IF NOT EXISTS idx_booru_entity_aliases_lookup
    ON booru_entity_aliases (entity_kind, comparable_name);

    CREATE INDEX IF NOT EXISTS idx_booru_resource_inherited_tags_resource
    ON booru_resource_inherited_tags (resource_id, tag_id);
  `);
  if (addedRealitySource) {
    db.prepare(`SELECT id FROM booru_resources`).all().forEach((row) => {
      const resourceId = normalizeBooruText(row?.id);
      if (resourceId) reconcileResourceClassificationSync(db, resourceId);
    });
  }
}
function resolveBooruRuntimeAssetPath(...segments) {
  return import_node_path2.default.resolve(__dirname, "..", ...segments);
}
function getBooruMediaWorkerPath() {
  return resolveBooruRuntimeAssetPath("assets", "booru_media_worker.py");
}
function getBooruFfmpegPath() {
  return import_node_path2.default.resolve(__dirname, "vendor", "ffmpeg.exe");
}
function getBooruFfprobePath() {
  return import_node_path2.default.resolve(__dirname, "vendor", "ffprobe.exe");
}
function getThumbnailOutputPaths(thumbsRoot, resourceId) {
  const variantRoot = import_node_path2.default.join(thumbsRoot, THUMBNAIL_VARIANT_NAME);
  const basePath = import_node_path2.default.join(variantRoot, resourceId);
  return {
    basePath,
    webpPath: `${basePath}.webp`,
    jpegPath: `${basePath}.jpg`
  };
}
function normalizeThumbnailStatus(value) {
  const normalized = normalizeBooruText(value).toLowerCase();
  return normalized === "ready" || normalized === "error" ? normalized : "pending";
}
function normalizeMediaInfoStatus(value) {
  const normalized = normalizeBooruText(value).toLowerCase();
  return normalized === "ready" || normalized === "error" ? normalized : "pending";
}
function normalizeThumbnailDescriptor(row) {
  const hasExplicitThumbnailRow = Object.prototype.hasOwnProperty.call(row || {}, "thumbnail_status") || Object.prototype.hasOwnProperty.call(row || {}, "status");
  const status = normalizeThumbnailStatus(row?.thumbnail_status ?? row?.status);
  const storagePath = normalizeBooruOptionalText(row?.thumbnail_storage_path ?? row?.storage_path);
  const mimeType = normalizeBooruOptionalText(row?.thumbnail_mime_type ?? row?.mime_type);
  const width = Number.isFinite(Number(row?.thumbnail_width ?? row?.width)) ? Number(row.thumbnail_width ?? row.width) : null;
  const height = Number.isFinite(Number(row?.thumbnail_height ?? row?.height)) ? Number(row.thumbnail_height ?? row.height) : null;
  const byteSize = Number.isFinite(Number(row?.thumbnail_byte_size ?? row?.byte_size)) ? Number(row.thumbnail_byte_size ?? row.byte_size) : null;
  const sourceHash = normalizeBooruOptionalText(row?.thumbnail_source_hash ?? row?.source_hash);
  const generatedAt = normalizeBooruOptionalText(row?.thumbnail_generated_at ?? row?.generated_at);
  const errorMessage = normalizeBooruOptionalText(row?.thumbnail_error_message ?? row?.error_message);
  const frameTimestampMs = Number.isFinite(Number(row?.thumbnail_frame_timestamp_ms ?? row?.frame_timestamp_ms)) ? Number(row.thumbnail_frame_timestamp_ms ?? row.frame_timestamp_ms) : null;
  if (!hasExplicitThumbnailRow && !storagePath && !errorMessage) {
    return null;
  }
  return {
    status,
    storagePath,
    mimeType,
    width,
    height,
    byteSize,
    sourceHash,
    generatedAt,
    errorMessage,
    frameTimestampMs
  };
}
function getEntityTable(kind) {
  return ENTITY_TABLES[kind];
}
function getResourceRelationTable(kind) {
  return RESOURCE_RELATION_TABLES[kind] || null;
}
function getResourceRelationEntityIdColumn(kind) {
  return RESOURCE_RELATION_ENTITY_ID_COLUMNS[kind] || null;
}
function normalizeLinkedEntityRow(row) {
  return {
    id: String(row?.id || ""),
    displayName: String(row?.display_name || row?.displayName || "").trim(),
    slug: String(row?.slug || "").trim()
  };
}
function normalizeTagRow(row) {
  return {
    id: String(row?.id || ""),
    name: String(row?.name || "").trim(),
    source: String(row?.source || "manual").trim() || "manual"
  };
}
function getDefaultEntityVisualSettings() {
  return normalizeBooruEntityVisualSettings(null);
}
function parseEntityVisualSettings(value) {
  if (typeof value !== "string" || !value.trim()) {
    return getDefaultEntityVisualSettings();
  }
  try {
    return normalizeBooruEntityVisualSettings(JSON.parse(value));
  } catch {
    return getDefaultEntityVisualSettings();
  }
}
function serializeEntityVisualSettings(value) {
  return JSON.stringify(normalizeBooruEntityVisualSettings(value));
}
function normalizeOptionalLinkedEntityRow(row) {
  if (!row) {
    return null;
  }
  const normalizedRow = normalizeLinkedEntityRow(row);
  return normalizedRow.id ? normalizedRow : null;
}
function getCharacterUniverseRecordSync(db, characterId) {
  const statement = db.prepare(`
    SELECT u.id, u.display_name, u.slug
    FROM booru_character_universes rel
    INNER JOIN booru_universes u ON u.id = rel.universe_id
    WHERE rel.character_id = ?
    ORDER BY rel.created_at ASC, u.display_name COLLATE NOCASE ASC
    LIMIT 1
  `);
  return normalizeOptionalLinkedEntityRow(statement.get(characterId) || null);
}
function listResourceEntitiesSync(db, kind, resourceId) {
  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);
  if (!relationTable || !relationEntityIdColumn) {
    return [];
  }
  const statement = db.prepare(`
    SELECT e.id, e.display_name, e.slug
    FROM ${relationTable} rel
    INNER JOIN ${getEntityTable(kind)} e ON e.id = rel.${relationEntityIdColumn}
    WHERE rel.resource_id = ?
    ORDER BY rel.sort_order ASC, e.display_name COLLATE NOCASE ASC
  `);
  return statement.all(resourceId).map((row) => {
    const normalizedRow = normalizeLinkedEntityRow(row);
    if (kind === "character") {
      return {
        ...normalizedRow,
        universe: getCharacterUniverseRecordSync(db, normalizedRow.id)
      };
    }
    return normalizedRow;
  });
}
function listResourceUniversesSync(db, resourceId) {
  const statement = db.prepare(`
    SELECT DISTINCT u.id, u.display_name, u.slug
    FROM booru_universes u
    WHERE (
      EXISTS (
        SELECT 1 FROM booru_resource_universes rel
        WHERE rel.resource_id = ? AND rel.universe_id = u.id
      )
      OR EXISTS (
        SELECT 1 FROM booru_resource_inherited_universes rel
        WHERE rel.resource_id = ? AND rel.universe_id = u.id
      )
    )
      AND NOT EXISTS (
        SELECT 1 FROM booru_resource_universe_exclusions exclusion
        WHERE exclusion.resource_id = ? AND exclusion.universe_id = u.id
      )
    ORDER BY u.display_name COLLATE NOCASE ASC
  `);
  return statement.all(resourceId, resourceId, resourceId).map(normalizeLinkedEntityRow);
}
function listDirectResourceUniversesSync(db, resourceId) {
  return db.prepare(`
    SELECT u.id, u.display_name, u.slug
    FROM booru_resource_universes rel
    INNER JOIN booru_universes u ON u.id = rel.universe_id
    WHERE rel.resource_id = ?
    ORDER BY rel.sort_order ASC, u.display_name COLLATE NOCASE ASC
  `).all(resourceId).map(normalizeLinkedEntityRow);
}
function listResourceTagsSync(db, resourceId) {
  const statement = db.prepare(`
    SELECT DISTINCT t.id, t.name, t.source
    FROM booru_tags t
    WHERE (
      EXISTS (
        SELECT 1 FROM booru_resource_tags rel
        WHERE rel.resource_id = ? AND rel.tag_id = t.id
      )
      OR EXISTS (
        SELECT 1 FROM booru_resource_inherited_tags rel
        WHERE rel.resource_id = ? AND rel.tag_id = t.id
      )
    )
      AND NOT EXISTS (
        SELECT 1 FROM booru_resource_tag_exclusions exclusion
        WHERE exclusion.resource_id = ? AND exclusion.tag_id = t.id
      )
    ORDER BY t.name COLLATE NOCASE ASC
  `);
  return statement.all(resourceId, resourceId, resourceId).map(normalizeTagRow);
}
function listDirectResourceTagsSync(db, resourceId) {
  return db.prepare(`
    SELECT t.id, t.name, t.source
    FROM booru_resource_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.resource_id = ?
    ORDER BY t.name COLLATE NOCASE ASC
  `).all(resourceId).map(normalizeTagRow);
}
function listEntityTagsSync(db, kind, entityId) {
  return db.prepare(`
    SELECT t.id, t.name, t.source
    FROM booru_entity_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.entity_kind = ? AND rel.entity_id = ?
    ORDER BY t.name COLLATE NOCASE ASC
  `).all(kind, entityId).map(normalizeTagRow);
}
function listEntityAliasesSync(db, kind, entityId) {
  return db.prepare(`
    SELECT alias_name
    FROM booru_entity_aliases
    WHERE entity_kind = ? AND entity_id = ?
    ORDER BY alias_name COLLATE NOCASE ASC
  `).all(kind, entityId).map((row) => String(row?.alias_name || "").trim()).filter(Boolean);
}
function listEntitySocialLinksSync(db, kind, entityId) {
  return db.prepare(`
    SELECT rel.id, rel.url, platform.id AS platform_id, platform.display_name AS platform_name,
      platform.icon_resource_id, platform.icon_layout_json
    FROM booru_entity_social_links rel
    INNER JOIN booru_social_platforms platform ON platform.id = rel.platform_id
    WHERE rel.entity_kind = ? AND rel.entity_id = ?
    ORDER BY platform.display_name COLLATE NOCASE ASC, rel.created_at ASC
  `).all(kind, entityId).map((row) => ({
    id: String(row?.id || ""),
    url: String(row?.url || ""),
    platform: {
      id: String(row?.platform_id || ""),
      displayName: String(row?.platform_name || ""),
      iconResourceId: normalizeBooruOptionalText(row?.icon_resource_id),
      iconLayout: parseEntityVisualSettings(row?.icon_layout_json)?.avatar || null
    }
  }));
}
function getPendingReasons(resource) {
  if (resource.classificationState === "duplicate-review" || resource.trashedAt) {
    return {
      isPending: false,
      pendingScore: 0,
      pendingReasons: [],
      essentialCompletionState: "hidden"
    };
  }
  const essential = getBooruEssentialState(resource);
  const reasonWeights = {
    reality: 100,
    author: 60,
    character: 60,
    universe: 40,
    artist: 15
  };
  const reasons = essential.missing.map((missingKind) => `missing-${missingKind}`);
  const pendingScore = essential.missing.reduce(
    (score, missingKind) => score + (reasonWeights[missingKind] || 1),
    0
  );
  if (!reasons.length) {
    return {
      isPending: false,
      pendingScore: 0,
      pendingReasons: [],
      essentialCompletionState: "complete"
    };
  }
  return {
    isPending: true,
    pendingScore: Math.max(1, pendingScore),
    pendingReasons: reasons,
    essentialCompletionState: reasons[0] || "incomplete"
  };
}
function normalizeResourceRow(db, row) {
  if (!row) {
    return null;
  }
  const width = Number.isFinite(Number(row.width)) ? Number(row.width) : null;
  const height = Number.isFinite(Number(row.height)) ? Number(row.height) : null;
  const mediaKind = String(row.media_kind || "");
  const systemTags = [mediaKind];
  const resourceId = String(row.id || "");
  if (width && height) {
    systemTags.push(`resolution:${width}x${height}`);
  }
  const authors = listResourceEntitiesSync(db, "author", resourceId);
  const artists = listResourceEntitiesSync(db, "artist", resourceId);
  const characters = listResourceEntitiesSync(db, "character", resourceId);
  const directUniverses = listDirectResourceUniversesSync(db, resourceId);
  const universes = listResourceUniversesSync(db, resourceId);
  const manualTags = listDirectResourceTagsSync(db, resourceId);
  const tags = listResourceTagsSync(db, resourceId);
  const trashedAt = row.trashed_at == null ? null : String(row.trashed_at);
  const thumbnail = normalizeThumbnailDescriptor(row);
  const pendingState = getPendingReasons({
    reality: normalizeBooruReality(row.reality),
    authors,
    artists,
    characters,
    directUniverses,
    universes,
    manualTags,
    classificationState: String(row.classification_state || "unclassified"),
    trashedAt
  });
  return {
    id: resourceId,
    storageFilename: String(row.storage_filename || ""),
    storagePath: String(row.storage_path || ""),
    originalFilename: String(row.original_filename || ""),
    extension: String(row.extension || ""),
    mimeType: String(row.mime_type || ""),
    mediaKind,
    fileSize: Number(row.file_size || 0),
    width,
    height,
    durationMs: Number.isFinite(Number(row.duration_ms)) ? Number(row.duration_ms) : null,
    mediaInfoStatus: normalizeMediaInfoStatus(row.media_info_status),
    mediaInfoError: normalizeBooruOptionalText(row.media_info_error),
    autoplayStoragePath: normalizeBooruOptionalText(row.video_short_storage_path),
    videoShortStatus: normalizeBooruOptionalText(row.video_short_status),
    videoShortVariant: normalizeBooruOptionalText(row.video_short_variant),
    thumbnail,
    contentHash: String(row.content_hash || ""),
    reality: normalizeBooruReality(row.reality),
    realitySource: normalizeRealitySource(row.reality_source),
    classificationState: String(row.classification_state || "unclassified"),
    canonicalResourceId: row.canonical_resource_id == null ? null : String(row.canonical_resource_id),
    canonicalOriginalFilename: row.canonical_original_filename == null ? null : String(row.canonical_original_filename),
    sourcePath: row.source_path == null ? null : String(row.source_path),
    trashedAt,
    importedAt: String(row.imported_at || ""),
    lastSeenAt: String(row.last_seen_at || ""),
    authors,
    artists,
    characters,
    universes,
    manualTags,
    tags,
    systemTags,
    pendingScore: pendingState.pendingScore,
    pendingReasons: pendingState.pendingReasons,
    isPending: pendingState.isPending,
    essentialCompletionState: pendingState.essentialCompletionState
  };
}
function getCanonicalResourceByHash(db, contentHash) {
  const statement = db.prepare(`
    SELECT id, original_filename
    FROM booru_resources
    WHERE content_hash = ?
      AND classification_state != 'duplicate-review'
      AND trashed_at IS NULL
    ORDER BY rowid ASC
    LIMIT 1
  `);
  return statement.get(contentHash) || null;
}
function getResourceByIdSync(db, resourceId) {
  const statement = db.prepare(`
    SELECT
      r.*,
      c.original_filename AS canonical_original_filename,
      th.storage_path AS thumbnail_storage_path,
      th.mime_type AS thumbnail_mime_type,
      th.width AS thumbnail_width,
      th.height AS thumbnail_height,
      th.byte_size AS thumbnail_byte_size,
      th.status AS thumbnail_status,
      th.source_hash AS thumbnail_source_hash,
      th.generated_at AS thumbnail_generated_at,
      th.error_message AS thumbnail_error_message,
      th.frame_timestamp_ms AS thumbnail_frame_timestamp_ms
      ,vs.storage_path AS video_short_storage_path
      ,vs.status AS video_short_status
      ,vs.variant AS video_short_variant
    FROM booru_resources r
    LEFT JOIN booru_resources c ON c.id = r.canonical_resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    LEFT JOIN booru_resource_video_shorts vs ON vs.resource_id = r.id
    WHERE r.id = ?
    LIMIT 1
  `);
  return normalizeResourceRow(db, statement.get(resourceId) || null);
}
function normalizeResourceSection(value) {
  const normalized = normalizeBooruText(value);
  return BOORU_RESOURCE_SECTIONS.has(normalized) ? normalized : "media";
}
function normalizeResourceEntityFilters(value) {
  const seenKeys = /* @__PURE__ */ new Set();
  const normalizedFilters = [];
  for (const rawValue of Array.isArray(value) ? value : []) {
    const rawFilter = rawValue;
    const rawKind = normalizeBooruText(rawFilter?.kind);
    const kind = ENTITY_TABLES[rawKind] ? rawKind : normalizeBooruEntityPrefix(rawKind);
    const id = normalizeBooruOptionalText(rawFilter?.id);
    const filterValue = normalizeBooruOptionalText(rawFilter?.value);
    const comparableValue = normalizeBooruComparableText(filterValue);
    if (!ENTITY_TABLES[kind] || !id && !comparableValue) {
      continue;
    }
    const dedupeKey = `${kind}:${id || ""}:${comparableValue || ""}`;
    if (seenKeys.has(dedupeKey)) {
      continue;
    }
    seenKeys.add(dedupeKey);
    normalizedFilters.push({
      kind,
      id,
      value: filterValue,
      label: normalizeBooruOptionalText(rawFilter?.label) || filterValue
    });
  }
  return normalizedFilters;
}
function normalizeResourceTagFilters(value) {
  const seenKeys = /* @__PURE__ */ new Set();
  const normalizedFilters = [];
  for (const rawValue of Array.isArray(value) ? value : []) {
    const rawFilter = rawValue;
    const id = normalizeBooruOptionalText(rawFilter?.id);
    const filterValue = normalizeBooruOptionalText(rawFilter?.value);
    const comparableValue = normalizeBooruComparableText(filterValue);
    if (!id && !comparableValue) {
      continue;
    }
    const dedupeKey = `${id || ""}:${comparableValue || ""}`;
    if (seenKeys.has(dedupeKey)) {
      continue;
    }
    seenKeys.add(dedupeKey);
    normalizedFilters.push({
      id,
      value: filterValue,
      label: normalizeBooruOptionalText(rawFilter?.label) || filterValue
    });
  }
  return normalizedFilters;
}
function normalizeResourceMissingFilter(value) {
  if (Array.isArray(value)) {
    for (let index = value.length - 1; index >= 0; index -= 1) {
      const normalizedMissing = normalizeBooruMissingFilter(value[index]);
      if (normalizedMissing) {
        return normalizedMissing;
      }
    }
    return null;
  }
  return normalizeBooruMissingFilter(value);
}
function normalizePendingMode(value) {
  const normalizedValue = normalizeBooruComparableText(value);
  if (normalizedValue === "essential" || normalizedValue === "tags") {
    return normalizedValue;
  }
  return null;
}
function normalizeResourceQuery(value) {
  const rawQuery = value && typeof value === "object" ? value : {};
  const mediaKind = normalizeBooruComparableText(rawQuery?.mediaKind);
  const classificationState = normalizeBooruComparableText(rawQuery?.classificationState);
  const browse = normalizeBooruBrowseQuery(rawQuery, "resource");
  const textTerms = normalizeBooruFreeTextTerms(rawQuery?.textTerms ?? rawQuery?.text);
  return {
    text: normalizeBooruOptionalText(rawQuery?.text),
    textTerms,
    mediaKind: BOORU_RESOURCE_MEDIA_KINDS.has(mediaKind) ? mediaKind : null,
    reality: normalizeBooruReality(rawQuery?.reality),
    classificationState: classificationState === "unclassified" ? "unclassified" : null,
    pendingMode: normalizePendingMode(rawQuery?.pendingMode),
    includeEntities: normalizeResourceEntityFilters(rawQuery?.includeEntities),
    excludeEntities: normalizeResourceEntityFilters(rawQuery?.excludeEntities),
    includeTags: normalizeResourceTagFilters(rawQuery?.includeTags),
    excludeTags: normalizeResourceTagFilters(rawQuery?.excludeTags),
    missing: normalizeResourceMissingFilter(rawQuery?.missing),
    ...browse
  };
}
function normalizePagingNumber(value, fallback, maxValue) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.min(maxValue, Math.floor(parsed));
}
function buildPendingSqlExpressions(alias = "r") {
  const missingReality = `(CASE WHEN ${alias}.reality IS NULL OR TRIM(${alias}.reality) = '' THEN 1 ELSE 0 END)`;
  const missingAuthor = `(CASE WHEN ${alias}.reality = 'real' AND NOT EXISTS (
    SELECT 1 FROM booru_resource_authors rel WHERE rel.resource_id = ${alias}.id
  ) THEN 1 ELSE 0 END)`;
  const missingArtist = `(CASE WHEN ${alias}.reality = 'ficticio' AND NOT EXISTS (
    SELECT 1 FROM booru_resource_artists rel WHERE rel.resource_id = ${alias}.id
  ) THEN 1 ELSE 0 END)`;
  const missingCharacter = `(CASE WHEN ${alias}.reality = 'ficticio'
    AND NOT EXISTS (SELECT 1 FROM booru_resource_characters rel WHERE rel.resource_id = ${alias}.id)
  THEN 1 ELSE 0 END)`;
  const missingUniverse = `(CASE WHEN ${alias}.reality = 'ficticio'
    AND (
      (
        NOT EXISTS (
          SELECT 1
          FROM booru_resource_universes rel
          WHERE rel.resource_id = ${alias}.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM booru_resource_characters rel
          INNER JOIN booru_character_universes cu ON cu.character_id = rel.character_id
          WHERE rel.resource_id = ${alias}.id
        )
      )
      OR EXISTS (
        SELECT 1
        FROM booru_resource_characters rel
        WHERE rel.resource_id = ${alias}.id
          AND NOT EXISTS (
            SELECT 1
            FROM booru_character_universes cu
            WHERE cu.character_id = rel.character_id
          )
      )
    )
  THEN 1 ELSE 0 END)`;
  const manualTagCount = `(
    SELECT COUNT(DISTINCT rel.tag_id)
    FROM booru_resource_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.resource_id = ${alias}.id
      AND t.source = 'manual'
  )`;
  const essentialTagCount = `(
    (CASE WHEN ${alias}.reality IS NULL OR TRIM(${alias}.reality) = '' THEN 0 ELSE 1 END) +
    (SELECT COUNT(DISTINCT rel.author_id) FROM booru_resource_authors rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.artist_id) FROM booru_resource_artists rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.character_id) FROM booru_resource_characters rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.universe_id) FROM booru_resource_universes rel WHERE rel.resource_id = ${alias}.id) +
    (SELECT COUNT(DISTINCT rel.universe_id)
      FROM booru_resource_inherited_universes rel
      WHERE rel.resource_id = ${alias}.id
        AND NOT EXISTS (
          SELECT 1
          FROM booru_resource_universes direct_rel
          WHERE direct_rel.resource_id = ${alias}.id
            AND direct_rel.universe_id = rel.universe_id
        )
    )
  )`;
  const rawScore = `(
    (${missingReality} * 100) +
    (${missingAuthor} * 60) +
    (${missingArtist} * 15) +
    (${missingCharacter} * 60) +
    (${missingUniverse} * 40)
  )`;
  const isPending = `(CASE
    WHEN ${alias}.classification_state = 'duplicate-review' OR ${alias}.trashed_at IS NOT NULL THEN 0
    WHEN ${rawScore} > 0 THEN 1
    ELSE 0
  END)`;
  const pendingScore = `(CASE
    WHEN ${isPending} = 1 THEN MAX(1, ${rawScore})
    ELSE 0
  END)`;
  return {
    isPending,
    pendingScore,
    essentialTagCount,
    manualTagCount
  };
}
function buildEntityFilterSql(alias, filter, resolvedIds = [], negate = false) {
  const parameters = [];
  const filterIds = uniqueBooruIds(resolvedIds.length ? resolvedIds : filter.id ? [filter.id] : []);
  if (filter.kind === "universe") {
    if (filterIds.length) {
      const placeholders = filterIds.map(() => "?").join(", ");
      const directClause = `EXISTS (
        SELECT 1
        FROM booru_resource_universes rel
        WHERE rel.resource_id = ${alias}.id
          AND rel.universe_id IN (${placeholders})
      )`;
      const inheritedClause = `EXISTS (
        SELECT 1
        FROM booru_resource_characters rc
        INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
        WHERE rc.resource_id = ${alias}.id
          AND cu.universe_id IN (${placeholders})
          AND NOT EXISTS (
            SELECT 1
            FROM booru_resource_universe_exclusions excluded
            WHERE excluded.resource_id = ${alias}.id
              AND excluded.universe_id = cu.universe_id
          )
      )`;
      parameters.push(...filterIds, ...filterIds);
      return {
        clause: negate ? `(NOT ${directClause} AND NOT ${inheritedClause})` : `(${directClause} OR ${inheritedClause})`,
        parameters
      };
    }
    return negate ? null : { clause: "0 = 1", parameters: [] };
  }
  const relationTable = getResourceRelationTable(filter.kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(filter.kind);
  const entityTable = getEntityTable(filter.kind);
  if (!relationTable || !relationEntityIdColumn || !entityTable) {
    return null;
  }
  if (filterIds.length) {
    const placeholders = filterIds.map(() => "?").join(", ");
    return {
      clause: `${negate ? "NOT " : ""}EXISTS (
        SELECT 1
        FROM ${relationTable} rel
        WHERE rel.resource_id = ${alias}.id
          AND rel.${relationEntityIdColumn} IN (${placeholders})
      )`,
      parameters: filterIds
    };
  }
  return negate ? null : { clause: "0 = 1", parameters: [] };
}
function buildTagFilterSql(alias, filter, resolvedIds = [], negate = false) {
  const filterIds = uniqueBooruIds(resolvedIds.length ? resolvedIds : filter.id ? [filter.id] : []);
  if (filterIds.length) {
    const placeholders = filterIds.map(() => "?").join(", ");
    return {
      clause: negate ? `(NOT EXISTS (SELECT 1 FROM booru_resource_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})) AND NOT EXISTS (SELECT 1 FROM booru_resource_inherited_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})))` : `(EXISTS (SELECT 1 FROM booru_resource_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})) OR EXISTS (SELECT 1 FROM booru_resource_inherited_tags rel WHERE rel.resource_id = ${alias}.id AND rel.tag_id IN (${placeholders})))`,
      parameters: negate ? [...filterIds, ...filterIds] : [...filterIds, ...filterIds]
    };
  }
  return negate ? null : { clause: "0 = 1", parameters: [] };
}
function buildResourceListSqlParts(db, section, query) {
  const whereClauses = [];
  const parameters = [];
  const pendingSql = buildPendingSqlExpressions("r");
  const pendingMode = section === "pending" && query.pendingMode === "tags" ? "tags" : "essential";
  if (section === "duplicates") {
    whereClauses.push(`r.classification_state = 'duplicate-review'`);
    whereClauses.push(`r.trashed_at IS NULL`);
  } else if (section === "trash") {
    whereClauses.push(`r.trashed_at IS NOT NULL`);
  } else {
    whereClauses.push(`r.classification_state != 'duplicate-review'`);
    whereClauses.push(`r.trashed_at IS NULL`);
    if (section === "media") {
      whereClauses.push(`${pendingSql.isPending} = 0`);
    } else if (section === "pending") {
      whereClauses.push(pendingMode === "tags" ? `${pendingSql.isPending} = 0` : `${pendingSql.isPending} = 1`);
    }
  }
  if (query.textTerms.length) {
    const termClauses = query.textTerms.map((term) => {
      const pattern = `%${term}%`;
      const entitySources = [
        ["author", "booru_resource_authors", "author_id", "booru_authors"],
        ["artist", "booru_resource_artists", "artist_id", "booru_artists"],
        ["character", "booru_resource_characters", "character_id", "booru_characters"],
        ["universe", "booru_resource_universes", "universe_id", "booru_universes"]
      ];
      const clauses = [
        `EXISTS (
          SELECT 1 FROM booru_resource_tags rel
          INNER JOIN booru_tags value ON value.id = rel.tag_id
          WHERE rel.resource_id = r.id AND booru_normalize(value.name) LIKE ?
        )`,
        `EXISTS (
          SELECT 1 FROM booru_resource_inherited_tags rel
          INNER JOIN booru_tags value ON value.id = rel.tag_id
          WHERE rel.resource_id = r.id AND booru_normalize(value.name) LIKE ?
        )`
      ];
      parameters.push(pattern, pattern);
      entitySources.forEach(([kind, relationTable, entityColumn, entityTable]) => {
        clauses.push(`EXISTS (
          SELECT 1 FROM ${relationTable} rel
          INNER JOIN ${entityTable} entity ON entity.id = rel.${entityColumn}
          WHERE rel.resource_id = r.id
            AND (
              booru_normalize(entity.display_name) LIKE ?
              OR EXISTS (
                SELECT 1 FROM booru_entity_aliases alias
                WHERE alias.entity_kind = '${kind}'
                  AND alias.entity_id = entity.id
                  AND alias.comparable_name LIKE ?
              )
            )
        )`);
        parameters.push(pattern, pattern);
      });
      clauses.push(`EXISTS (
        SELECT 1
        FROM booru_resource_characters rc
        INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
        INNER JOIN booru_universes universe ON universe.id = cu.universe_id
        WHERE rc.resource_id = r.id
          AND NOT EXISTS (
            SELECT 1 FROM booru_resource_universe_exclusions excluded
            WHERE excluded.resource_id = r.id AND excluded.universe_id = universe.id
          )
          AND (
            booru_normalize(universe.display_name) LIKE ?
            OR EXISTS (
              SELECT 1 FROM booru_entity_aliases alias
              WHERE alias.entity_kind = 'universe'
                AND alias.entity_id = universe.id
                AND alias.comparable_name LIKE ?
            )
          )
      )`);
      parameters.push(pattern, pattern);
      return `(${clauses.join(" OR ")})`;
    });
    whereClauses.push(`(${termClauses.join(" OR ")})`);
  }
  if (query.classificationState === "unclassified") {
    whereClauses.push(`r.classification_state = 'unclassified'`);
  }
  if (query.mediaKind === "image" || query.mediaKind === "video" || query.mediaKind === "gif") {
    whereClauses.push(`r.media_kind = ?`);
    parameters.push(query.mediaKind);
  }
  if (query.reality === "real" || query.reality === "ficticio") {
    whereClauses.push(`r.reality = ?`);
    parameters.push(query.reality);
  }
  if (query.missing === "type") {
    whereClauses.push(`(r.reality IS NULL OR TRIM(r.reality) = '')`);
  } else if (query.missing === "author") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_authors rel
      WHERE rel.resource_id = r.id
    )`);
  } else if (query.missing === "artist") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_artists rel
      WHERE rel.resource_id = r.id
    )`);
  } else if (query.missing === "character") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_characters rel
      WHERE rel.resource_id = r.id
    )`);
  } else if (query.missing === "universe") {
    whereClauses.push(`NOT EXISTS (
      SELECT 1
      FROM booru_resource_universes rel
      WHERE rel.resource_id = r.id
    ) AND NOT EXISTS (
      SELECT 1
      FROM booru_resource_characters rel
      INNER JOIN booru_character_universes cu ON cu.character_id = rel.character_id
      WHERE rel.resource_id = r.id
    )`);
  }
  for (const entityFilter of query.includeEntities) {
    const resolvedIds = resolveEntityIdsForResourceFilterSync(db, entityFilter);
    const filterSql = buildEntityFilterSql("r", entityFilter, resolvedIds, false);
    if (!filterSql) {
      continue;
    }
    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }
  for (const entityFilter of query.excludeEntities) {
    const resolvedIds = resolveEntityIdsForResourceFilterSync(db, entityFilter);
    const filterSql = buildEntityFilterSql("r", entityFilter, resolvedIds, true);
    if (!filterSql) {
      continue;
    }
    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }
  for (const tagFilter of query.includeTags) {
    const resolvedIds = resolveTagIdsForResourceFilterSync(db, tagFilter);
    const filterSql = buildTagFilterSql("r", tagFilter, resolvedIds, false);
    if (!filterSql) {
      continue;
    }
    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }
  for (const tagFilter of query.excludeTags) {
    const resolvedIds = resolveTagIdsForResourceFilterSync(db, tagFilter);
    const filterSql = buildTagFilterSql("r", tagFilter, resolvedIds, true);
    if (!filterSql) {
      continue;
    }
    whereClauses.push(filterSql.clause);
    parameters.push(...filterSql.parameters);
  }
  if (query.grouping === "sectioned") {
    if (query.groupBy === "author") {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM booru_resource_authors rel WHERE rel.resource_id = r.id
      )`);
    } else if (query.groupBy === "artist") {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM booru_resource_artists rel WHERE rel.resource_id = r.id
      )`);
    } else if (query.groupBy === "character") {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM booru_resource_characters rel WHERE rel.resource_id = r.id
      )`);
    } else if (query.groupBy === "universe") {
      whereClauses.push(`(
        EXISTS (
          SELECT 1 FROM booru_resource_universes rel WHERE rel.resource_id = r.id
        )
        OR EXISTS (
          SELECT 1
          FROM booru_resource_characters rc
          INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
          WHERE rc.resource_id = r.id
            AND NOT EXISTS (
              SELECT 1 FROM booru_resource_universe_exclusions excluded
              WHERE excluded.resource_id = r.id AND excluded.universe_id = cu.universe_id
            )
        )
      )`);
    }
  }
  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join("\n      AND ")}` : "";
  const directionSql = query.grouping === "sectioned" ? "DESC" : query.direction === "asc" ? "ASC" : "DESC";
  const orderParameters = [];
  let orderExpression = "r.imported_at";
  if (query.grouping === "sectioned") {
    orderExpression = "r.imported_at";
  } else if (query.sortBy === "author") {
    orderExpression = `(SELECT MIN(entity.display_name) FROM booru_resource_authors rel INNER JOIN booru_authors entity ON entity.id = rel.author_id WHERE rel.resource_id = r.id)`;
  } else if (query.sortBy === "artist") {
    orderExpression = `(SELECT MIN(entity.display_name) FROM booru_resource_artists rel INNER JOIN booru_artists entity ON entity.id = rel.artist_id WHERE rel.resource_id = r.id)`;
  } else if (query.sortBy === "character") {
    orderExpression = `(SELECT MIN(entity.display_name) FROM booru_resource_characters rel INNER JOIN booru_characters entity ON entity.id = rel.character_id WHERE rel.resource_id = r.id)`;
  } else if (query.sortBy === "universe") {
    orderExpression = `(SELECT MIN(value.display_name) FROM (
      SELECT universe.display_name
      FROM booru_resource_universes rel
      INNER JOIN booru_universes universe ON universe.id = rel.universe_id
      WHERE rel.resource_id = r.id
      UNION
      SELECT universe.display_name
      FROM booru_resource_characters rc
      INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
      INNER JOIN booru_universes universe ON universe.id = cu.universe_id
      WHERE rc.resource_id = r.id
        AND NOT EXISTS (
          SELECT 1 FROM booru_resource_universe_exclusions excluded
          WHERE excluded.resource_id = r.id AND excluded.universe_id = universe.id
        )
    ) value)`;
  } else if (query.sortBy === "tag") {
    orderExpression = `(SELECT MIN(tag.name) FROM booru_resource_tags rel INNER JOIN booru_tags tag ON tag.id = rel.tag_id WHERE rel.resource_id = r.id AND tag.source = 'manual')`;
  } else if (query.sortBy === "random") {
    orderExpression = "booru_seeded_rank(r.id, ?)";
    orderParameters.push(query.randomSeed);
  } else if (section === "trash") {
    orderExpression = "r.trashed_at";
  }
  const orderBySql = query.sortBy === "random" ? `ORDER BY ${orderExpression} ${directionSql}, r.id ASC` : `ORDER BY (${orderExpression}) IS NULL ${directionSql}, ${orderExpression} COLLATE NOCASE ${directionSql}, r.id ASC`;
  return {
    whereSql,
    parameters,
    orderBySql,
    orderParameters
  };
}
function getResourceRowsByIdsSync(db, resourceIds) {
  if (!resourceIds.length) {
    return [];
  }
  const placeholders = resourceIds.map(() => "?").join(", ");
  const rows = db.prepare(`
    SELECT
      r.*,
      c.original_filename AS canonical_original_filename,
      th.storage_path AS thumbnail_storage_path,
      th.mime_type AS thumbnail_mime_type,
      th.width AS thumbnail_width,
      th.height AS thumbnail_height,
      th.byte_size AS thumbnail_byte_size,
      th.status AS thumbnail_status,
      th.source_hash AS thumbnail_source_hash,
      th.generated_at AS thumbnail_generated_at,
      th.error_message AS thumbnail_error_message,
      th.frame_timestamp_ms AS thumbnail_frame_timestamp_ms
      ,vs.storage_path AS video_short_storage_path
      ,vs.status AS video_short_status
      ,vs.variant AS video_short_variant
    FROM booru_resources r
    LEFT JOIN booru_resources c ON c.id = r.canonical_resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    LEFT JOIN booru_resource_video_shorts vs ON vs.resource_id = r.id
    WHERE r.id IN (${placeholders})
  `).all(...resourceIds);
  const rowById = new Map(rows.map((row) => [String(row?.id || ""), row]));
  return resourceIds.map((resourceId) => normalizeResourceRow(db, rowById.get(resourceId) || null)).filter(Boolean);
}
function normalizeResourceMutationView(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const rawView = value;
  return {
    section: normalizeResourceSection(rawView.section),
    query: normalizeResourceQuery(rawView.query)
  };
}
function listOrderedResourceIdsForViewSync(db, view) {
  const sqlParts = buildResourceListSqlParts(db, view.section, view.query);
  return db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
  `).all(...sqlParts.parameters, ...sqlParts.orderParameters).map((row) => String(row?.id || "")).filter(Boolean);
}
function collectAffectedResourceEntities(resources) {
  const affected = /* @__PURE__ */ new Map();
  const fieldKinds = [
    ["authors", "author"],
    ["artists", "artist"],
    ["characters", "character"],
    ["universes", "universe"],
    ["manualTags", "tag"]
  ];
  for (const resource of resources) {
    for (const [fieldName, kind] of fieldKinds) {
      for (const entity of Array.isArray(resource?.[fieldName]) ? resource[fieldName] : []) {
        const id = normalizeBooruOptionalText(entity?.id);
        if (id) {
          affected.set(`${kind}:${id}`, { kind, id });
        }
      }
    }
  }
  return Array.from(affected.values());
}
function createResourceMutationContextSync(db, payload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds, payload?.resourceId);
  const view = normalizeResourceMutationView(payload?.view);
  const beforeResources = getResourceRowsByIdsSync(db, resourceIds);
  const beforeMatchingIds = view ? listOrderedResourceIdsForViewSync(db, view).filter((resourceId) => resourceIds.includes(resourceId)) : [];
  return {
    resourceIds,
    view,
    beforeResources,
    beforeMatchingIds
  };
}
function buildResourceMutationResultSync(db, {
  reason,
  updatedResources: rawUpdatedResources,
  context
}) {
  const updatedResources = (Array.isArray(rawUpdatedResources) ? rawUpdatedResources : [rawUpdatedResources].filter(Boolean)).filter((resource) => resource?.id);
  const changedIds = uniqueBooruIds([
    ...context.resourceIds,
    ...updatedResources.map((resource) => String(resource.id))
  ]);
  const beforeMatchingIds = new Set(context.beforeMatchingIds);
  const orderedAfterIds = context.view ? listOrderedResourceIdsForViewSync(db, context.view) : [];
  const afterIndexById = new Map(orderedAfterIds.map((resourceId, index) => [resourceId, index]));
  const afterMatchingIds = new Set(changedIds.filter((resourceId) => afterIndexById.has(resourceId)));
  const leavingQueryIds = changedIds.filter(
    (resourceId) => beforeMatchingIds.has(resourceId) && !afterMatchingIds.has(resourceId)
  );
  const enteredQueryIds = changedIds.filter(
    (resourceId) => !beforeMatchingIds.has(resourceId) && afterMatchingIds.has(resourceId)
  );
  const queryPlacements = changedIds.filter((resourceId) => afterIndexById.has(resourceId)).map((resourceId) => ({
    resourceId,
    index: Number(afterIndexById.get(resourceId))
  }));
  return {
    revision: `${Date.now()}-${import_node_crypto.default.randomUUID()}`,
    reason: normalizeBooruOptionalText(reason) || "resource-mutated",
    updatedResources,
    leavingQueryIds,
    enteredQueryIds,
    queryPlacements,
    affectedEntities: collectAffectedResourceEntities([
      ...context.beforeResources,
      ...updatedResources
    ]),
    totalCountDelta: enteredQueryIds.length - leavingQueryIds.length
  };
}
function countResourcesSync(db, section, query) {
  const sqlParts = buildResourceListSqlParts(db, section, query);
  const row = db.prepare(`
    SELECT COUNT(*) AS total_count
    FROM booru_resources r
    ${sqlParts.whereSql}
  `).get(...sqlParts.parameters) || {};
  return Number(row?.total_count || 0);
}
function listResourcesSync(db, payload = {}) {
  const section = normalizeResourceSection(payload?.section);
  const query = normalizeResourceQuery(payload?.query);
  const offset = normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER);
  const limit = Math.max(1, normalizePagingNumber(payload?.limit, DEFAULT_RESOURCE_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE));
  const sqlParts = buildResourceListSqlParts(db, section, query);
  const totalCount = countResourcesSync(db, section, query);
  const grouped = query.grouping === "sectioned" && query.sortBy !== "random";
  const requestedLimit = grouped ? Math.max(totalCount, 1) : limit;
  const requestedOffset = grouped ? 0 : offset;
  const resourceIds = db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
    LIMIT ?
    OFFSET ?
  `).all(...sqlParts.parameters, ...sqlParts.orderParameters, requestedLimit, requestedOffset).map((row) => String(row?.id || "")).filter(Boolean);
  const items = getResourceRowsByIdsSync(db, resourceIds);
  if (grouped) {
    return {
      section,
      query,
      ...createBooruIncrementalBrowseResult(items, query, {
        family: "resource",
        offset,
        limit
      })
    };
  }
  return {
    section,
    query,
    items,
    placements: [],
    totalCount,
    placementCount: totalCount,
    hasMore: offset + items.length < totalCount
  };
}
function listAllResourcesForSectionSync(db, section) {
  const emptyQuery = normalizeResourceQuery({});
  const totalCount = countResourcesSync(db, section, emptyQuery);
  if (!totalCount) {
    return [];
  }
  const sqlParts = buildResourceListSqlParts(db, section, emptyQuery);
  const resourceIds = db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
    LIMIT ?
    OFFSET 0
  `).all(...sqlParts.parameters, ...sqlParts.orderParameters, totalCount).map((row) => String(row?.id || "")).filter(Boolean);
  return getResourceRowsByIdsSync(db, resourceIds);
}
function listLibraryRows(db) {
  return listAllResourcesForSectionSync(db, "media");
}
function listPendingRows(db) {
  return listAllResourcesForSectionSync(db, "pending");
}
function listDuplicateRows(db) {
  return listAllResourcesForSectionSync(db, "duplicates");
}
function listTrashRows(db) {
  return listAllResourcesForSectionSync(db, "trash");
}
function readStats(db) {
  const totalRow = db.prepare(`
    SELECT
      COUNT(*) AS totalCount,
      SUM(CASE WHEN classification_state = 'duplicate-review' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS duplicateCount,
      SUM(CASE WHEN classification_state = 'unclassified' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS unclassifiedCount,
      SUM(CASE WHEN classification_state = 'classified-basic' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS classifiedBasicCount,
      SUM(CASE WHEN trashed_at IS NOT NULL THEN 1 ELSE 0 END) AS trashCount,
      SUM(CASE WHEN media_kind = 'image' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS imageCount,
      SUM(CASE WHEN media_kind = 'video' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS videoCount,
      SUM(CASE WHEN media_kind = 'gif' AND trashed_at IS NULL THEN 1 ELSE 0 END) AS gifCount
    FROM booru_resources
  `).get() || {};
  const thumbnailRow = db.prepare(`
    SELECT
      COUNT(*) AS thumbnailCount,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
      SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) AS readyCount,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS errorCount
    FROM booru_resource_thumbnails
  `).get() || {};
  const totalResourceCount = Number(totalRow.totalCount || 0);
  const thumbnailCount = Number(thumbnailRow.thumbnailCount || 0);
  const thumbnailPendingCount = Number(thumbnailRow.pendingCount || 0);
  const thumbnailReadyCount = Number(thumbnailRow.readyCount || 0);
  const thumbnailErrorCount = Number(thumbnailRow.errorCount || 0);
  const missingThumbnailRows = Math.max(0, totalResourceCount - thumbnailCount);
  return {
    totalCount: totalResourceCount,
    duplicateCount: Number(totalRow.duplicateCount || 0),
    pendingCount: countResourcesSync(db, "pending", normalizeResourceQuery({})),
    unclassifiedCount: Number(totalRow.unclassifiedCount || 0),
    classifiedBasicCount: Number(totalRow.classifiedBasicCount || 0),
    trashCount: Number(totalRow.trashCount || 0),
    imageCount: Number(totalRow.imageCount || 0),
    videoCount: Number(totalRow.videoCount || 0),
    gifCount: Number(totalRow.gifCount || 0),
    thumbnailPendingCount,
    thumbnailReadyCount,
    thumbnailErrorCount,
    thumbnailBacklogCount: thumbnailPendingCount + thumbnailErrorCount + missingThumbnailRows
  };
}
function resolveMediaDescriptor(filePath) {
  const extension = import_node_path2.default.extname(filePath || "").toLowerCase();
  if (GIF_EXTENSIONS.has(extension)) {
    return {
      extension,
      mediaKind: "gif",
      mimeType: "image/gif"
    };
  }
  if (IMAGE_EXTENSIONS.has(extension)) {
    return {
      extension,
      mediaKind: "image",
      mimeType: `image/${extension.replace(/^\./, "")}`
    };
  }
  if (VIDEO_EXTENSIONS.has(extension)) {
    const subtype = extension === ".m4v" ? "mp4" : extension.replace(/^\./, "");
    return {
      extension,
      mediaKind: "video",
      mimeType: `video/${subtype}`
    };
  }
  return null;
}
async function computeFileHash(filePath) {
  return new Promise((resolve3, reject) => {
    const hash = import_node_crypto.default.createHash("sha256");
    const stream = import_node_fs3.default.createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => {
      hash.update(chunk);
    });
    stream.on("end", () => {
      resolve3(hash.digest("hex"));
    });
  });
}
async function moveFile(sourcePath, targetPath) {
  await import_promises4.default.mkdir(import_node_path2.default.dirname(targetPath), { recursive: true });
  try {
    await import_promises4.default.rename(sourcePath, targetPath);
    return;
  } catch (error) {
    if (error?.code !== "EXDEV") {
      throw error;
    }
  }
  await import_promises4.default.copyFile(sourcePath, targetPath);
  await import_promises4.default.unlink(sourcePath);
}
function isPathInsideDirectory(parentPath, candidatePath) {
  const normalizedParent = import_node_path2.default.resolve(parentPath);
  const normalizedCandidate = import_node_path2.default.resolve(candidatePath);
  const relativePath = import_node_path2.default.relative(normalizedParent, normalizedCandidate);
  if (!relativePath) {
    return true;
  }
  return !relativePath.startsWith("..") && !import_node_path2.default.isAbsolute(relativePath);
}
function assertClipboardTempFilePath(tempFilePath) {
  const rawPath = String(tempFilePath || "").trim();
  if (!rawPath) {
    throw new Error("No se encontro una imagen temporal valida para Booru.");
  }
  const normalizedPath = import_node_path2.default.resolve(rawPath);
  if (!isPathInsideDirectory(CLIPBOARD_IMAGE_TEMP_ROOT, normalizedPath)) {
    throw new Error("La imagen temporal del portapapeles no pertenece al staging autorizado.");
  }
  return normalizedPath;
}
function buildClipboardImportedFilename() {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  return `clipboard-${timestamp}.png`;
}
function probePythonCommand(command) {
  const result = (0, import_node_child_process.spawnSync)(
    command,
    ["-c", "import sys; print(sys.executable)"],
    {
      encoding: "utf8",
      timeout: 5e3,
      windowsHide: true
    }
  );
  if (result.error || result.status !== 0) {
    return {
      available: false,
      command,
      resolvedExecutable: null,
      error: result.error?.message || String(result.stderr || result.stdout || "No se pudo ejecutar Python.").trim()
    };
  }
  return {
    available: true,
    command,
    resolvedExecutable: String(result.stdout || "").trim() || command,
    error: null
  };
}
function resolvePythonStatus(settingsValue) {
  const explicitPython = readBooruPythonExecutable(settingsValue);
  if (explicitPython) {
    return probePythonCommand(explicitPython);
  }
  return probePythonCommand("python");
}
function getWorkerPythonCommand(state) {
  return state.python.resolvedExecutable || state.python.command || "python";
}
function getThumbnailRowSync(db, resourceId) {
  return db.prepare(`
    SELECT *
    FROM booru_resource_thumbnails
    WHERE resource_id = ?
    LIMIT 1
  `).get(resourceId) || null;
}
function getVideoShortRowSync(db, resourceId) {
  return db.prepare(`
    SELECT *
    FROM booru_resource_video_shorts
    WHERE resource_id = ?
    LIMIT 1
  `).get(resourceId) || null;
}
function ensureThumbnailPendingRowSync(db, resourceId, sourceHash) {
  db.prepare(`
    INSERT INTO booru_resource_thumbnails (
      resource_id,
      storage_path,
      mime_type,
      width,
      height,
      byte_size,
      status,
      source_hash,
      generated_at,
      error_message,
      frame_timestamp_ms
    ) VALUES (?, NULL, NULL, NULL, NULL, NULL, 'pending', ?, NULL, NULL, NULL)
    ON CONFLICT(resource_id) DO UPDATE SET
      status = 'pending',
      source_hash = excluded.source_hash,
      error_message = NULL
  `).run(resourceId, sourceHash);
}
function shouldGenerateThumbnailSync(resource, thumbnailRow, videoShortRow = null) {
  if (!resource?.id || !resource?.storagePath || !resource?.contentHash) {
    return false;
  }
  if (!thumbnailRow) {
    return true;
  }
  const status = normalizeThumbnailStatus(thumbnailRow.status);
  const storagePath = normalizeBooruOptionalText(thumbnailRow.storage_path);
  const sourceHash = normalizeBooruOptionalText(thumbnailRow.source_hash);
  const mediaInfoStatus = normalizeMediaInfoStatus(resource.mediaInfoStatus);
  const metadataReady = resource.width && resource.height && mediaInfoStatus === "ready";
  if (sourceHash !== resource.contentHash) {
    return true;
  }
  if (status !== "ready") {
    return true;
  }
  if (!metadataReady) {
    return true;
  }
  if (!storagePath || !import_node_fs3.default.existsSync(storagePath)) return true;
  if (shouldGenerateBooruVideoShort(resource.mediaKind, resource.durationMs)) {
    const shortPath = normalizeBooruOptionalText(videoShortRow?.storage_path);
    return normalizeBooruOptionalText(videoShortRow?.variant) !== BOORU_VIDEO_SHORT_VARIANT || normalizeThumbnailStatus(videoShortRow?.status) !== "ready" || !shortPath || !import_node_fs3.default.existsSync(shortPath);
  }
  return false;
}
function listThumbnailBacklogResourceIdsSync(db) {
  return db.prepare(`
    SELECT
      r.id,
      r.media_kind,
      r.duration_ms,
      r.media_info_status,
      r.content_hash,
      th.resource_id AS thumbnail_resource_id,
      th.source_hash AS thumbnail_source_hash,
      th.status AS thumbnail_status,
      vs.resource_id AS short_resource_id,
      vs.storage_path AS short_storage_path,
      vs.status AS short_status,
      vs.variant AS short_variant
    FROM booru_resources r
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    LEFT JOIN booru_resource_video_shorts vs ON vs.resource_id = r.id
    WHERE th.resource_id IS NULL
       OR th.source_hash IS NULL
       OR th.source_hash != r.content_hash
       OR th.status != 'ready'
       OR r.media_info_status != 'ready'
       OR (r.media_kind = 'video' AND r.duration_ms > 15000)
    ORDER BY r.imported_at DESC, r.id ASC
  `).all().filter((row) => {
    const thumbnailPending = !row?.thumbnail_resource_id || !row?.thumbnail_source_hash || row.thumbnail_source_hash !== row.content_hash || normalizeThumbnailStatus(row?.thumbnail_status) !== "ready" || normalizeMediaInfoStatus(row?.media_info_status) !== "ready";
    if (thumbnailPending) return true;
    if (!shouldGenerateBooruVideoShort(row?.media_kind, row?.duration_ms)) return false;
    const shortPath = normalizeBooruOptionalText(row?.short_storage_path);
    return !row?.short_resource_id || normalizeThumbnailStatus(row?.short_status) !== "ready" || normalizeBooruOptionalText(row?.short_variant) !== BOORU_VIDEO_SHORT_VARIANT || !shortPath || !import_node_fs3.default.existsSync(shortPath);
  }).map((row) => String(row?.id || "")).filter(Boolean);
}
async function readSpawnedJson(state, command, args) {
  assertRuntimeStateActive(state);
  return new Promise((resolve3, reject) => {
    const startedAt = performance.now();
    const child = (0, import_node_child_process.spawn)(command, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      signal: state.abortController.signal
    });
    state.childProcesses.add(child);
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (callback) => {
      if (settled) {
        return;
      }
      settled = true;
      state.childProcesses.delete(child);
      callback();
    };
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk || "");
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk || "");
    });
    child.on("error", (error) => {
      finish(() => reject(error));
    });
    child.on("close", (code) => {
      const durationMs = Number((performance.now() - startedAt).toFixed(2));
      if (code !== 0) {
        finish(() => reject(Object.assign(
          new Error(String(stderr || stdout || `El proceso termino con codigo ${code}.`).trim()),
          {
            args,
            command,
            durationMs,
            exitCode: Number(code ?? -1),
            stderr,
            stdout
          }
        )));
        return;
      }
      try {
        const result = {
          args,
          command,
          data: JSON.parse(stdout || "{}"),
          durationMs,
          exitCode: Number(code ?? 0),
          stderr,
          stdout
        };
        finish(() => resolve3(result));
      } catch (error) {
        finish(() => reject(Object.assign(
          new Error(`El worker de Booru devolvio JSON invalido. ${error?.message || ""}`.trim()),
          {
            args,
            command,
            durationMs,
            exitCode: Number(code ?? 0),
            stderr,
            stdout
          }
        )));
      }
    });
  });
}
async function removeFileIfExists(filePath) {
  if (!filePath) {
    return;
  }
  try {
    await import_promises4.default.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}
async function runThumbnailWorkerForResource(state, resource) {
  if (!state.python.available) {
    throw new Error(
      state.python.error || "No se encontro Python para Booru. Configura pythonExecutable o asegurate de que python este disponible en PATH."
    );
  }
  const workerPath = getBooruMediaWorkerPath();
  const ffmpegPath = getBooruFfmpegPath();
  const ffprobePath = getBooruFfprobePath();
  if (!import_node_fs3.default.existsSync(workerPath)) {
    throw new Error(`No se encontro el worker Python de Booru en ${workerPath}.`);
  }
  if (!import_node_fs3.default.existsSync(ffmpegPath)) {
    throw new Error(`No se encontro ffmpeg para Booru en ${ffmpegPath}.`);
  }
  if (!import_node_fs3.default.existsSync(ffprobePath)) {
    throw new Error(`No se encontro ffprobe para Booru en ${ffprobePath}.`);
  }
  const outputPaths = getThumbnailOutputPaths(state.thumbsRoot, resource.id);
  const shortPath = import_node_path2.default.join(state.shortsRoot, `${resource.id}.${BOORU_VIDEO_SHORT_VARIANT}.mp4`);
  await import_promises4.default.mkdir(import_node_path2.default.dirname(outputPaths.webpPath), { recursive: true });
  await import_promises4.default.mkdir(import_node_path2.default.dirname(shortPath), { recursive: true });
  return readSpawnedJson(state, getWorkerPythonCommand(state), [
    workerPath,
    "--source-path",
    resource.storagePath,
    "--media-kind",
    resource.mediaKind,
    "--ffmpeg-path",
    ffmpegPath,
    "--ffprobe-path",
    ffprobePath,
    "--thumbnail-webp-path",
    outputPaths.webpPath,
    "--thumbnail-jpeg-path",
    outputPaths.jpegPath,
    "--video-short-path",
    shortPath,
    "--video-short-duration-seconds",
    String(BOORU_VIDEO_SHORT_DURATION_SECONDS),
    "--max-side",
    String(THUMBNAIL_MAX_SIDE_PX)
  ]);
}
function persistThumbnailSuccessSync(db, resourceId, sourceHash, workerResult) {
  const generatedAt = nowIso();
  const thumbnailStoragePath = normalizeBooruOptionalText(workerResult?.thumbnailPath);
  db.prepare(`
    UPDATE booru_resources
    SET width = ?,
        height = ?,
        duration_ms = ?,
        media_info_status = 'ready',
        media_info_error = NULL,
        last_seen_at = ?
    WHERE id = ?
  `).run(
    Number.isFinite(Number(workerResult?.width)) ? Number(workerResult.width) : null,
    Number.isFinite(Number(workerResult?.height)) ? Number(workerResult.height) : null,
    Number.isFinite(Number(workerResult?.durationMs)) ? Number(workerResult.durationMs) : null,
    generatedAt,
    resourceId
  );
  db.prepare(`
    INSERT INTO booru_resource_thumbnails (
      resource_id,
      storage_path,
      mime_type,
      width,
      height,
      byte_size,
      status,
      source_hash,
      generated_at,
      error_message,
      frame_timestamp_ms
    ) VALUES (?, ?, ?, ?, ?, ?, 'ready', ?, ?, NULL, ?)
    ON CONFLICT(resource_id) DO UPDATE SET
      storage_path = excluded.storage_path,
      mime_type = excluded.mime_type,
      width = excluded.width,
      height = excluded.height,
      byte_size = excluded.byte_size,
      status = 'ready',
      source_hash = excluded.source_hash,
      generated_at = excluded.generated_at,
      error_message = NULL,
      frame_timestamp_ms = excluded.frame_timestamp_ms
  `).run(
    resourceId,
    thumbnailStoragePath,
    normalizeBooruOptionalText(workerResult?.thumbnailMimeType),
    Number.isFinite(Number(workerResult?.thumbnailWidth)) ? Number(workerResult.thumbnailWidth) : null,
    Number.isFinite(Number(workerResult?.thumbnailHeight)) ? Number(workerResult.thumbnailHeight) : null,
    Number.isFinite(Number(workerResult?.thumbnailByteSize)) ? Number(workerResult.thumbnailByteSize) : null,
    sourceHash,
    generatedAt,
    Number.isFinite(Number(workerResult?.frameTimestampMs)) ? Number(workerResult.frameTimestampMs) : null
  );
  const shortPath = normalizeBooruOptionalText(workerResult?.shortPath);
  const shortError = normalizeBooruOptionalText(workerResult?.shortError);
  if (shouldGenerateBooruVideoShort("video", workerResult?.durationMs)) {
    db.prepare(`
      INSERT INTO booru_resource_video_shorts (resource_id, storage_path, status, variant, generated_at, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(resource_id) DO UPDATE SET
        storage_path = excluded.storage_path,
        status = excluded.status,
        variant = excluded.variant,
        generated_at = excluded.generated_at,
        error_message = excluded.error_message
    `).run(
      resourceId,
      shortPath,
      shortPath ? "ready" : shortError ? "error" : "pending",
      BOORU_VIDEO_SHORT_VARIANT,
      generatedAt,
      shortError
    );
  } else {
    db.prepare(`DELETE FROM booru_resource_video_shorts WHERE resource_id = ?`).run(resourceId);
  }
}
function persistThumbnailErrorSync(db, resourceId, sourceHash, errorMessage) {
  const normalizedMessage = String(errorMessage || "No se pudo generar la preview.").trim();
  db.prepare(`
    UPDATE booru_resources
    SET media_info_status = 'error',
        media_info_error = ?,
        last_seen_at = ?
    WHERE id = ?
  `).run(normalizedMessage, nowIso(), resourceId);
  db.prepare(`
    INSERT INTO booru_resource_thumbnails (
      resource_id,
      storage_path,
      mime_type,
      width,
      height,
      byte_size,
      status,
      source_hash,
      generated_at,
      error_message,
      frame_timestamp_ms
    ) VALUES (?, NULL, NULL, NULL, NULL, NULL, 'error', ?, ?, ?, NULL)
    ON CONFLICT(resource_id) DO UPDATE SET
      status = 'error',
      source_hash = excluded.source_hash,
      generated_at = excluded.generated_at,
      error_message = excluded.error_message
  `).run(resourceId, sourceHash, nowIso(), normalizedMessage);
}
function queueThumbnailGeneration(resourceIds, priority = "low") {
  const state = runtimeState;
  if (!isRuntimeStateActive(state)) {
    return;
  }
  let queuedAny = false;
  let queuedCount = 0;
  for (const resourceId of uniqueBooruIds(resourceIds)) {
    if (!resourceId || state.thumbnailProcessingIds.has(resourceId)) {
      continue;
    }
    if (state.thumbnailQueuedIds.has(resourceId)) {
      if (priority === "high") {
        state.thumbnailLowPriorityIds = state.thumbnailLowPriorityIds.filter((queuedId) => queuedId !== resourceId);
        if (!state.thumbnailHighPriorityIds.includes(resourceId)) {
          state.thumbnailHighPriorityIds.unshift(resourceId);
        }
      }
      continue;
    }
    const resource = getResourceByIdSync(state.db, resourceId);
    if (!resource || !shouldGenerateThumbnailSync(
      resource,
      getThumbnailRowSync(state.db, resourceId),
      getVideoShortRowSync(state.db, resourceId)
    )) {
      continue;
    }
    state.thumbnailQueuedIds.add(resourceId);
    queuedAny = true;
    queuedCount += 1;
    if (priority === "high") {
      state.thumbnailHighPriorityIds.unshift(resourceId);
    } else {
      state.thumbnailLowPriorityIds.push(resourceId);
    }
  }
  if (queuedAny && state.python.available) {
    if (!state.thumbnailTaskActive) {
      state.thumbnailTaskActive = true;
      state.thumbnailTaskTotal = 0;
      state.thumbnailTaskCompleted = 0;
      state.thumbnailTaskFailed = 0;
      state.ctx.tasks.start({
        id: "booru.thumbnails",
        title: "Creando thumbnails",
        detail: "Preparando previews de Booru",
        progress: {
          current: 0,
          total: queuedCount,
          label: "previews"
        }
      });
    }
    state.thumbnailTaskTotal += queuedCount;
    state.ctx.tasks.update("booru.thumbnails", {
      detail: `${state.thumbnailTaskTotal - state.thumbnailTaskCompleted - state.thumbnailTaskFailed} pendientes`,
      progress: {
        current: state.thumbnailTaskCompleted + state.thumbnailTaskFailed,
        total: state.thumbnailTaskTotal,
        label: "previews"
      }
    });
    booruBackendLogger.debug(
      "booru.thumbnail.queue.enqueued",
      "Booru encolo recursos para generar thumbnails.",
      {
        priority,
        requestedCount: uniqueBooruIds(resourceIds).length,
        queuedHighPriorityCount: state.thumbnailHighPriorityIds.length,
        queuedLowPriorityCount: state.thumbnailLowPriorityIds.length,
        processingCount: state.thumbnailProcessingIds.size,
        sampleIds: summarizeIdsForLog(resourceIds)
      }
    );
    scheduleRuntimeInvalidationForState(state, "metricsVersion");
  }
  void pumpThumbnailQueue();
}
function dequeueNextThumbnailResourceId(state) {
  const nextHighPriorityId = state.thumbnailHighPriorityIds.shift();
  if (nextHighPriorityId) {
    state.thumbnailQueuedIds.delete(nextHighPriorityId);
    return nextHighPriorityId;
  }
  const nextLowPriorityId = state.thumbnailLowPriorityIds.shift();
  if (nextLowPriorityId) {
    state.thumbnailQueuedIds.delete(nextLowPriorityId);
    return nextLowPriorityId;
  }
  return "";
}
async function processThumbnailQueueEntry(state, resourceId) {
  assertRuntimeStateActive(state);
  const resource = getResourceByIdSync(state.db, resourceId);
  if (!resource) {
    return true;
  }
  const thumbnailRow = getThumbnailRowSync(state.db, resourceId);
  const previousVideoShortRow = getVideoShortRowSync(state.db, resourceId);
  if (!shouldGenerateThumbnailSync(resource, thumbnailRow, previousVideoShortRow)) {
    return true;
  }
  ensureThumbnailPendingRowSync(state.db, resourceId, resource.contentHash);
  const outputPaths = getThumbnailOutputPaths(state.thumbsRoot, resourceId);
  const startedAt = performance.now();
  booruBackendLogger.debug(
    "booru.thumbnail.worker.start",
    "Booru inicio el worker de thumbnail para un recurso.",
    {
      resourceId,
      mediaKind: resource.mediaKind,
      storagePath: resource.storagePath,
      originalFilename: resource.originalFilename,
      existingThumbnailStatus: normalizeThumbnailStatus(thumbnailRow?.status),
      outputWebpPath: outputPaths.webpPath,
      outputJpegPath: outputPaths.jpegPath
    }
  );
  try {
    const workerExecution = await runThumbnailWorkerForResource(state, resource);
    assertRuntimeStateActive(state);
    const workerResult = workerExecution.data;
    withTransaction(state.db, () => {
      persistThumbnailSuccessSync(state.db, resourceId, resource.contentHash, workerResult);
    });
    state.thumbnailLastError = "";
    const thumbnailPath = normalizeBooruOptionalText(workerResult?.thumbnailPath);
    if (thumbnailPath !== outputPaths.webpPath) {
      await removeFileIfExists(outputPaths.webpPath);
    }
    if (thumbnailPath !== outputPaths.jpegPath) {
      await removeFileIfExists(outputPaths.jpegPath);
    }
    const nextShortPath = normalizeBooruOptionalText(workerResult?.shortPath);
    const previousShortPath = normalizeBooruOptionalText(previousVideoShortRow?.storage_path);
    if (previousShortPath && previousShortPath !== nextShortPath) {
      await removeFileIfExists(previousShortPath);
    }
    logBackendDuration(
      "booru.thumbnail.worker.done",
      "Booru resolvio el worker de thumbnail para un recurso.",
      performance.now() - startedAt,
      {
        resourceId,
        mediaKind: resource.mediaKind,
        storagePath: resource.storagePath,
        thumbnailPath,
        thumbnailMimeType: normalizeBooruOptionalText(workerResult?.thumbnailMimeType),
        width: Number.isFinite(Number(workerResult?.width)) ? Number(workerResult.width) : null,
        height: Number.isFinite(Number(workerResult?.height)) ? Number(workerResult.height) : null,
        durationMsOriginal: Number.isFinite(Number(workerResult?.durationMs)) ? Number(workerResult.durationMs) : null,
        thumbnailWidth: Number.isFinite(Number(workerResult?.thumbnailWidth)) ? Number(workerResult.thumbnailWidth) : null,
        thumbnailHeight: Number.isFinite(Number(workerResult?.thumbnailHeight)) ? Number(workerResult.thumbnailHeight) : null,
        stderrLength: workerExecution.stderr.length,
        stderrSnippet: /error|invalid|decode|cannot/i.test(workerExecution.stderr || "") ? truncateDiagnosticText(workerExecution.stderr) : ""
      }
    );
    return true;
  } catch (error) {
    if (isRuntimeCancellation(error) || !isRuntimeStateActive(state)) {
      return false;
    }
    const errorMessage = error instanceof Error ? error.message : "No se pudo generar la thumbnail de Booru.";
    withTransaction(state.db, () => {
      persistThumbnailErrorSync(state.db, resourceId, resource.contentHash, errorMessage);
    });
    state.thumbnailLastError = errorMessage;
    const workerFailurePayload = {
      resourceId,
      mediaKind: resource.mediaKind,
      storagePath: resource.storagePath,
      originalFilename: resource.originalFilename,
      outputWebpPath: outputPaths.webpPath,
      outputJpegPath: outputPaths.jpegPath,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      errorMessage,
      command: typeof error?.command === "string" ? error.command : getWorkerPythonCommand(state),
      args: Array.isArray(error?.args) ? error.args : [],
      exitCode: Number.isFinite(Number(error?.exitCode)) ? Number(error.exitCode) : null,
      stderrSnippet: truncateDiagnosticText(error?.stderr),
      stdoutSnippet: truncateDiagnosticText(error?.stdout)
    };
    const systemicFailure = /No se encontro (Python|ffmpeg|ffprobe|worker)|Configura pythonExecutable/i.test(errorMessage);
    booruBackendLogger[systemicFailure ? "warn" : "info"](
      "booru.thumbnail.worker.error",
      "Booru no pudo generar la thumbnail de un recurso.",
      workerFailurePayload
    );
    return false;
  }
}
function syncThumbnailRuntimeTask(state) {
  if (!state.thumbnailTaskActive || !isRuntimeStateActive(state)) {
    return;
  }
  const processedCount = state.thumbnailTaskCompleted + state.thumbnailTaskFailed;
  const pendingCount = Math.max(0, state.thumbnailTaskTotal - processedCount);
  const patch = {
    detail: pendingCount > 0 ? `${pendingCount} ${pendingCount === 1 ? "preview pendiente" : "previews pendientes"}` : state.thumbnailTaskFailed > 0 ? `${state.thumbnailTaskFailed} ${state.thumbnailTaskFailed === 1 ? "preview con error" : "previews con error"}` : "Finalizando previews",
    progress: {
      current: processedCount,
      total: state.thumbnailTaskTotal,
      label: "previews"
    }
  };
  state.ctx.tasks.update("booru.thumbnails", patch);
  if (state.thumbnailTaskFailed > 0) {
    state.ctx.tasks.fail("booru.thumbnails", {
      message: "Algunas thumbnails no pudieron crearse.",
      detail: patch.detail
    });
  }
  const queueEmpty = state.thumbnailHighPriorityIds.length === 0 && state.thumbnailLowPriorityIds.length === 0 && state.thumbnailProcessingIds.size === 0;
  if (!queueEmpty) {
    return;
  }
  if (state.thumbnailTaskFailed === 0) {
    state.ctx.tasks.complete("booru.thumbnails");
  }
  state.thumbnailTaskActive = false;
}
async function pumpThumbnailQueue() {
  const state = runtimeState;
  if (!isRuntimeStateActive(state) || !state.python.available) {
    return;
  }
  if (!state.thumbnailTaskActive && (state.thumbnailHighPriorityIds.length || state.thumbnailLowPriorityIds.length)) {
    state.thumbnailTaskActive = true;
    state.thumbnailTaskTotal = state.thumbnailHighPriorityIds.length + state.thumbnailLowPriorityIds.length;
    state.thumbnailTaskCompleted = 0;
    state.thumbnailTaskFailed = 0;
    state.ctx.tasks.start({
      id: "booru.thumbnails",
      title: "Creando thumbnails",
      detail: `${state.thumbnailTaskTotal} ${state.thumbnailTaskTotal === 1 ? "preview pendiente" : "previews pendientes"}`,
      progress: {
        current: 0,
        total: state.thumbnailTaskTotal,
        label: "previews"
      }
    });
  }
  while (state.thumbnailProcessingIds.size < THUMBNAIL_CONCURRENCY && (state.thumbnailHighPriorityIds.length || state.thumbnailLowPriorityIds.length)) {
    const nextResourceId = dequeueNextThumbnailResourceId(state);
    if (!nextResourceId || state.thumbnailProcessingIds.has(nextResourceId)) {
      continue;
    }
    state.thumbnailProcessingIds.add(nextResourceId);
    scheduleRuntimeInvalidationForState(state, "metricsVersion");
    let workerSucceeded = false;
    const task = processThumbnailQueueEntry(state, nextResourceId).then((succeeded) => {
      workerSucceeded = Boolean(succeeded);
    }).catch((error) => {
      if (!isRuntimeCancellation(error) && isRuntimeStateActive(state)) {
        booruBackendLogger.error(
          "booru.thumbnail.worker.unhandled",
          "Booru encontro un error inesperado en la cola de thumbnails.",
          { resourceId: nextResourceId, error }
        );
      }
    }).finally(() => {
      if (workerSucceeded) {
        state.thumbnailTaskCompleted += 1;
      } else {
        state.thumbnailTaskFailed += 1;
      }
      state.thumbnailProcessingIds.delete(nextResourceId);
      syncThumbnailRuntimeTask(state);
      scheduleRuntimeInvalidationForState(state, "thumbnailsVersion");
      scheduleRuntimeInvalidationForState(state, "metricsVersion");
      if (isRuntimeStateActive(state)) {
        void pumpThumbnailQueue();
      }
    });
    trackRuntimeBackgroundTask(state, task);
  }
}
function createRuntimeState(ctx) {
  const storagePaths = getStoragePaths(ctx);
  return {
    generation: import_node_crypto.default.randomUUID(),
    shuttingDown: false,
    abortController: new AbortController(),
    childProcesses: /* @__PURE__ */ new Set(),
    backgroundTasks: /* @__PURE__ */ new Set(),
    ctx,
    storageRoot: storagePaths.storageRoot,
    catalogPath: storagePaths.catalogPath,
    mediaRoot: storagePaths.mediaRoot,
    duplicatesRoot: storagePaths.duplicatesRoot,
    thumbsRoot: storagePaths.thumbsRoot,
    shortsRoot: storagePaths.shortsRoot,
    watcher: null,
    watcherState: {
      active: false,
      stage: "idle",
      watchedPath: "",
      lastError: "",
      lastIngestedAt: null,
      lastIngestedOriginalFilename: null,
      lastIngestedStoragePath: null,
      pendingCount: 0
    },
    python: {
      available: false,
      command: "python",
      resolvedExecutable: null,
      error: null
    },
    queue: Promise.resolve(),
    queuedPaths: /* @__PURE__ */ new Set(),
    ingestByContentHash: createBooruKeyedSerialExecutor(),
    thumbnailHighPriorityIds: [],
    thumbnailLowPriorityIds: [],
    thumbnailQueuedIds: /* @__PURE__ */ new Set(),
    thumbnailProcessingIds: /* @__PURE__ */ new Set(),
    thumbnailLastError: "",
    thumbnailTaskActive: false,
    thumbnailTaskTotal: 0,
    thumbnailTaskCompleted: 0,
    thumbnailTaskFailed: 0,
    ingestTaskActive: false,
    ingestTaskTotal: 0,
    ingestTaskCompleted: 0,
    ingestTaskFailed: 0,
    invalidationVersion: 1,
    pendingInvalidations: /* @__PURE__ */ new Set(),
    invalidationTimer: null,
    invalidationDelayMs: 0,
    db: null,
    fastClassification: null
  };
}
function buildResourcesSnapshot(ctx, settingsValue) {
  const state = runtimeState;
  if (!state || !state.db) {
    const storagePaths = getStoragePaths(ctx);
    return {
      pluginId: BOORU_PLUGIN_ID,
      settings: normalizeBooruSettings(settingsValue),
      python: {
        available: false,
        command: "python",
        resolvedExecutable: null,
        error: "Booru todavia no inicializo su runtime interno."
      },
      watcher: {
        active: false,
        stage: "idle",
        watchedPath: "",
        lastError: "Booru todavia no inicializo su runtime interno.",
        lastIngestedAt: null,
        lastIngestedOriginalFilename: null,
        lastIngestedStoragePath: null,
        pendingCount: 0
      },
      storage: {
        root: storagePaths.storageRoot,
        catalogPath: storagePaths.catalogPath,
        mediaRoot: storagePaths.mediaRoot,
        duplicatesRoot: storagePaths.duplicatesRoot,
        thumbsRoot: storagePaths.thumbsRoot,
        shortsRoot: storagePaths.shortsRoot
      },
      stats: {
        totalCount: 0,
        duplicateCount: 0,
        pendingCount: 0,
        unclassifiedCount: 0,
        classifiedBasicCount: 0,
        trashCount: 0,
        imageCount: 0,
        videoCount: 0,
        gifCount: 0,
        thumbnailPendingCount: 0,
        thumbnailReadyCount: 0,
        thumbnailErrorCount: 0,
        thumbnailBacklogCount: 0
      },
      derivatives: {
        activeCount: 0,
        highPriorityCount: 0,
        lowPriorityCount: 0,
        lastError: ""
      },
      library: [],
      pending: [],
      duplicates: [],
      trash: []
    };
  }
  return {
    pluginId: BOORU_PLUGIN_ID,
    settings: normalizeBooruSettings(settingsValue),
    python: state.python,
    watcher: {
      ...state.watcherState
    },
    storage: {
      root: state.storageRoot,
      catalogPath: state.catalogPath,
      mediaRoot: state.mediaRoot,
      duplicatesRoot: state.duplicatesRoot,
      thumbsRoot: state.thumbsRoot,
      shortsRoot: state.shortsRoot
    },
    stats: readStats(state.db),
    derivatives: {
      activeCount: state.thumbnailProcessingIds.size,
      highPriorityCount: state.thumbnailHighPriorityIds.length,
      lowPriorityCount: state.thumbnailLowPriorityIds.length,
      lastError: state.thumbnailLastError
    },
    library: [],
    pending: [],
    duplicates: [],
    trash: []
  };
}
function getVisibleResourceDescriptorSync(db, resourceId) {
  const normalizedResourceId = normalizeBooruOptionalText(resourceId);
  if (!normalizedResourceId) {
    return null;
  }
  const row = db.prepare(`
    SELECT
      r.id,
      r.storage_path,
      r.media_kind,
      th.storage_path AS thumbnail_storage_path,
      th.status AS thumbnail_status
    FROM booru_resources AS r
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    WHERE r.id = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
    LIMIT 1
  `).get(normalizedResourceId);
  if (!row) {
    return null;
  }
  const thumbnailReady = normalizeThumbnailStatus(row?.thumbnail_status) === "ready";
  return {
    sampleResourceId: String(row.id || ""),
    originalStoragePath: String(row.storage_path || ""),
    originalMediaKind: normalizeBooruOptionalText(row.media_kind),
    storagePath: String(row.storage_path || ""),
    sampleStoragePath: thumbnailReady ? normalizeBooruOptionalText(row?.thumbnail_storage_path) || String(row.storage_path || "") : String(row.storage_path || ""),
    sampleMediaKind: thumbnailReady ? "image" : normalizeBooruOptionalText(row.media_kind)
  };
}
function buildVisibleResourceDescriptorFromRow(row) {
  if (!row) {
    return {
      sampleResourceId: null,
      originalStoragePath: null,
      originalMediaKind: null,
      storagePath: null,
      sampleStoragePath: null,
      sampleMediaKind: null
    };
  }
  const thumbnailReady = normalizeThumbnailStatus(row?.thumbnail_status) === "ready";
  return {
    sampleResourceId: normalizeBooruOptionalText(row?.id),
    originalStoragePath: normalizeBooruOptionalText(row?.storage_path),
    originalMediaKind: normalizeBooruOptionalText(row?.media_kind),
    storagePath: normalizeBooruOptionalText(row?.storage_path),
    sampleStoragePath: thumbnailReady ? normalizeBooruOptionalText(row?.thumbnail_storage_path) || normalizeBooruOptionalText(row?.storage_path) : normalizeBooruOptionalText(row?.storage_path),
    sampleMediaKind: thumbnailReady ? "image" : normalizeBooruOptionalText(row?.media_kind)
  };
}
function listEntityConsumerResourcesSync(db, kind, entityId) {
  if (kind === "universe") {
    return db.prepare(`
      SELECT DISTINCT
        r.id,
        r.storage_path,
        r.media_kind,
        r.imported_at,
        th.storage_path AS thumbnail_storage_path,
        th.status AS thumbnail_status
      FROM booru_resources r
      LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
      LEFT JOIN booru_resource_universes rru
        ON rru.resource_id = r.id
       AND rru.universe_id = ?
      LEFT JOIN booru_resource_characters rchar
        ON rchar.resource_id = r.id
      LEFT JOIN booru_character_universes cuni
        ON cuni.character_id = rchar.character_id
       AND cuni.universe_id = ?
      WHERE r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
        AND (rru.universe_id IS NOT NULL OR cuni.universe_id IS NOT NULL)
      ORDER BY r.imported_at DESC, r.id ASC
    `).all(entityId, entityId);
  }
  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);
  if (!relationTable || !relationEntityIdColumn) {
    return [];
  }
  return db.prepare(`
    SELECT DISTINCT
      r.id,
      r.storage_path,
      r.media_kind,
      r.imported_at,
      th.storage_path AS thumbnail_storage_path,
      th.status AS thumbnail_status
    FROM ${relationTable} rel
    INNER JOIN booru_resources r ON r.id = rel.resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    WHERE rel.${relationEntityIdColumn} = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
    ORDER BY r.imported_at DESC, rel.sort_order ASC, r.id ASC
  `).all(entityId);
}
function getStableSampleIndex(seed, size) {
  if (!size) {
    return 0;
  }
  let hashValue = 0;
  for (const character of String(seed || "")) {
    hashValue = (hashValue << 5) - hashValue + character.charCodeAt(0);
    hashValue |= 0;
  }
  return Math.abs(hashValue) % size;
}
function getEntitySampleDescriptorSync(db, kind, entityId, coverResourceId) {
  const explicitCover = getVisibleResourceDescriptorSync(db, coverResourceId);
  if (explicitCover) {
    return explicitCover;
  }
  const candidates = listEntityConsumerResourcesSync(db, kind, entityId);
  if (!candidates.length) {
    return {
      sampleResourceId: null,
      sampleStoragePath: null,
      sampleMediaKind: null
    };
  }
  const imageFirstCandidates = candidates.filter((candidate) => String(candidate?.media_kind || "") !== "video");
  const samplePool = imageFirstCandidates.length ? imageFirstCandidates : candidates;
  const selected = samplePool[getStableSampleIndex(entityId, samplePool.length)] || samplePool[0];
  return buildVisibleResourceDescriptorFromRow(selected);
}
function getFirstVisibleResourceDescriptorSync(db, resourceIds) {
  for (const resourceId of resourceIds) {
    const descriptor = getVisibleResourceDescriptorSync(db, normalizeBooruOptionalText(resourceId));
    if (descriptor) {
      return descriptor;
    }
  }
  return null;
}
function pickEntityVisualDescriptorSync(db, kind, entityId, explicitResourceIds, variant) {
  const explicitVisual = getFirstVisibleResourceDescriptorSync(db, explicitResourceIds);
  if (explicitVisual) {
    return explicitVisual;
  }
  const candidates = listEntityConsumerResourcesSync(db, kind, entityId);
  if (!candidates.length) {
    return {
      sampleResourceId: null,
      sampleStoragePath: null,
      sampleMediaKind: null
    };
  }
  const imageFirstCandidates = candidates.filter((candidate) => String(candidate?.media_kind || "") !== "video");
  const samplePool = imageFirstCandidates.length ? imageFirstCandidates : candidates;
  const baseIndex = getStableSampleIndex(`${entityId}:${variant}`, samplePool.length);
  let selected = samplePool[baseIndex] || samplePool[0];
  if (variant === "banner" && samplePool.length > 1) {
    const avatarIndex = getStableSampleIndex(`${entityId}:avatar`, samplePool.length);
    if (avatarIndex === baseIndex) {
      selected = samplePool[(baseIndex + 1) % samplePool.length] || selected;
    }
  }
  return buildVisibleResourceDescriptorFromRow(selected);
}
function resolveEntityVisualProjectionSync(db, kind, entityId, baseRow, role, layout) {
  const explicitCandidates = role === "banner" ? [
    { resourceId: normalizeBooruOptionalText(baseRow?.banner_resource_id), selection: "banner" },
    { resourceId: normalizeBooruOptionalText(baseRow?.cover_resource_id), selection: "cover" }
  ] : [
    { resourceId: normalizeBooruOptionalText(baseRow?.avatar_resource_id), selection: "avatar" },
    { resourceId: normalizeBooruOptionalText(baseRow?.cover_resource_id), selection: "cover" }
  ];
  for (const candidate of explicitCandidates) {
    const descriptor = getVisibleResourceDescriptorSync(db, candidate.resourceId);
    if (descriptor) {
      return createBooruEntityVisualProjection({
        role,
        descriptor,
        layout,
        selection: candidate.selection
      });
    }
  }
  return createBooruEntityVisualProjection({
    role,
    descriptor: pickEntityVisualDescriptorSync(db, kind, entityId, [], role),
    layout,
    selection: "derived"
  });
}
function getEntityBaseRowByIdSync(db, kind, entityId) {
  return getEntityBaseRows(db, kind).find((row) => String(row?.id || "") === entityId) || null;
}
function getUniverseCharacterCountSync(db, universeId) {
  const row = db.prepare(`
    SELECT COUNT(DISTINCT cu.character_id) AS character_count
    FROM booru_character_universes cu
    WHERE cu.universe_id = ?
  `).get(universeId);
  return Number(row?.character_count || 0);
}
function getUniverseDirectResourceCountSync(db, universeId) {
  const row = db.prepare(`
    SELECT COUNT(DISTINCT r.id) AS resource_count
    FROM booru_resource_universes rel
    INNER JOIN booru_resources r ON r.id = rel.resource_id
    WHERE rel.universe_id = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
  `).get(universeId);
  return Number(row?.resource_count || 0);
}
function getUniverseInheritedResourceCountSync(db, universeId) {
  const row = db.prepare(`
    SELECT COUNT(DISTINCT r.id) AS resource_count
    FROM booru_character_universes cu
    INNER JOIN booru_resource_characters rc ON rc.character_id = cu.character_id
    INNER JOIN booru_resources r ON r.id = rc.resource_id
    WHERE cu.universe_id = ?
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM booru_resource_universe_exclusions excluded
        WHERE excluded.resource_id = r.id
          AND excluded.universe_id = cu.universe_id
      )
  `).get(universeId);
  return Number(row?.resource_count || 0);
}
function getEntityProfileSync(db, kind, entityId) {
  const baseRow = getEntityBaseRowByIdSync(db, kind, entityId);
  if (!baseRow) {
    return null;
  }
  const normalizedRow = normalizeEntityRow(db, kind, baseRow);
  const coverResourceId = normalizeBooruOptionalText(baseRow?.cover_resource_id);
  const avatarResourceId = normalizeBooruOptionalText(baseRow?.avatar_resource_id);
  const bannerResourceId = normalizeBooruOptionalText(baseRow?.banner_resource_id);
  const sample = pickEntityVisualDescriptorSync(db, kind, entityId, [coverResourceId], "sample");
  const banner = pickEntityVisualDescriptorSync(
    db,
    kind,
    entityId,
    [bannerResourceId, coverResourceId],
    "banner"
  );
  const avatar = pickEntityVisualDescriptorSync(
    db,
    kind,
    entityId,
    [avatarResourceId, coverResourceId],
    "avatar"
  );
  const createdAt = String(baseRow?.created_at || "");
  const visualSettings = parseEntityVisualSettings(baseRow?.visual_settings_json);
  const avatarVisual = normalizedRow.visual || resolveEntityVisualProjectionSync(
    db,
    kind,
    entityId,
    baseRow,
    "avatar",
    visualSettings.avatar
  );
  const bannerVisual = resolveEntityVisualProjectionSync(
    db,
    kind,
    entityId,
    baseRow,
    "banner",
    visualSettings.banner
  );
  const profile = {
    kind,
    id: normalizedRow.id,
    displayName: normalizedRow.displayName,
    slug: normalizedRow.slug,
    coverResourceId: normalizedRow.coverResourceId,
    avatarResourceId: normalizedRow.avatarResourceId,
    bannerResourceId: normalizedRow.bannerResourceId,
    createdAt,
    resourceCount: normalizedRow.resourceCount,
    sample,
    banner,
    avatar,
    visual: avatarVisual,
    visuals: {
      avatar: avatarVisual,
      banner: bannerVisual
    },
    visualSettings,
    tags: listEntityTagsSync(db, kind, entityId),
    aliases: kind === "author" || kind === "artist" ? listEntityAliasesSync(db, kind, entityId) : [],
    socialLinks: kind === "author" || kind === "artist" ? listEntitySocialLinksSync(db, kind, entityId) : [],
    metadata: {
      createdAt,
      visualSettings
    }
  };
  if (kind === "character") {
    return {
      ...profile,
      universe: normalizedRow.universe || null,
      metadata: {
        ...profile.metadata,
        universe: normalizedRow.universe || null
      }
    };
  }
  if (kind === "universe") {
    const characterCount = getUniverseCharacterCountSync(db, entityId);
    const directResourceCount = getUniverseDirectResourceCountSync(db, entityId);
    const inheritedResourceCount = getUniverseInheritedResourceCountSync(db, entityId);
    return {
      ...profile,
      metadata: {
        ...profile.metadata,
        characterCount,
        directResourceCount,
        inheritedResourceCount
      }
    };
  }
  return profile;
}
function getEntityBaseRows(db, kind) {
  if (kind === "universe") {
    return db.prepare(`
      SELECT
        e.*,
        (
          SELECT COUNT(*)
          FROM (
            SELECT r.id
            FROM booru_resource_universes rru
            INNER JOIN booru_resources r ON r.id = rru.resource_id
            WHERE rru.universe_id = e.id
              AND r.classification_state != 'duplicate-review'
              AND r.trashed_at IS NULL
            UNION
            SELECT r.id
            FROM booru_character_universes cu
            INNER JOIN booru_resource_characters rc ON rc.character_id = cu.character_id
            INNER JOIN booru_resources r ON r.id = rc.resource_id
            WHERE cu.universe_id = e.id
              AND r.classification_state != 'duplicate-review'
              AND r.trashed_at IS NULL
              AND NOT EXISTS (
                SELECT 1
                FROM booru_resource_universe_exclusions excluded
                WHERE excluded.resource_id = r.id
                  AND excluded.universe_id = cu.universe_id
              )
          ) counted
        ) AS resource_count
      FROM booru_universes e
      ORDER BY e.display_name COLLATE NOCASE ASC
    `).all();
  }
  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);
  if (!relationTable || !relationEntityIdColumn) {
    return db.prepare(`
      SELECT
        e.*,
        0 AS resource_count
      FROM ${getEntityTable(kind)} e
      ORDER BY e.display_name COLLATE NOCASE ASC
    `).all();
  }
  return db.prepare(`
    SELECT
      e.*,
      COUNT(DISTINCT rsrc.id) AS resource_count
    FROM ${getEntityTable(kind)} e
    LEFT JOIN ${relationTable} rel ON rel.${relationEntityIdColumn} = e.id
    LEFT JOIN booru_resources rsrc
      ON rsrc.id = rel.resource_id
     AND rsrc.classification_state != 'duplicate-review'
     AND rsrc.trashed_at IS NULL
    GROUP BY e.id
    ORDER BY e.display_name COLLATE NOCASE ASC
  `).all();
}
function normalizeEntityRow(db, kind, row) {
  const sampleDescriptor = getEntitySampleDescriptorSync(
    db,
    kind,
    String(row?.id || ""),
    normalizeBooruOptionalText(row?.cover_resource_id)
  );
  const entityId = String(row?.id || "");
  const visualSettings = parseEntityVisualSettings(row?.visual_settings_json);
  const visual = resolveEntityVisualProjectionSync(
    db,
    kind,
    entityId,
    row,
    "avatar",
    visualSettings.avatar
  );
  const visualSource = visual?.source || null;
  const baseRow = {
    id: entityId,
    kind,
    displayName: String(row?.display_name || "").trim(),
    slug: String(row?.slug || "").trim(),
    coverResourceId: normalizeBooruOptionalText(row?.cover_resource_id),
    avatarResourceId: normalizeBooruOptionalText(row?.avatar_resource_id),
    bannerResourceId: normalizeBooruOptionalText(row?.banner_resource_id),
    createdAt: String(row?.created_at || ""),
    resourceCount: Number(row?.resource_count || 0),
    sampleResourceId: sampleDescriptor.sampleResourceId,
    sampleOriginalStoragePath: sampleDescriptor.originalStoragePath,
    sampleStoragePath: sampleDescriptor.sampleStoragePath,
    sampleMediaKind: sampleDescriptor.sampleMediaKind,
    visual,
    visualSettings,
    cardResourceId: visualSource?.resourceId || null,
    cardStoragePath: visualSource?.pathValue || null,
    cardOriginalStoragePath: visualSource?.pathValue || null,
    cardOriginalMediaKind: visualSource?.mediaKind || null,
    cardPreviewPath: visualSource?.previewPath || null,
    cardMediaKind: visualSource?.mediaKind || null
  };
  if (kind === "character") {
    return {
      ...baseRow,
      universe: getCharacterUniverseRecordSync(db, baseRow.id)
    };
  }
  return baseRow;
}
function getEntityQueryScore(row, comparableQuery, slugQuery) {
  const displayComparable = normalizeBooruComparableText(row?.display_name);
  const rowSlug = normalizeBooruText(row?.slug).toLowerCase();
  if (comparableQuery && displayComparable === comparableQuery) {
    return 300;
  }
  if (slugQuery && rowSlug === slugQuery) {
    return 280;
  }
  if (comparableQuery && displayComparable.startsWith(comparableQuery)) {
    return 220;
  }
  if (slugQuery && rowSlug.startsWith(slugQuery)) {
    return 200;
  }
  if (comparableQuery && displayComparable.includes(comparableQuery)) {
    return 140;
  }
  if (slugQuery && rowSlug.includes(slugQuery)) {
    return 120;
  }
  return 0;
}
function getEntityAliasQueryScoreSync(db, kind, entityId, comparableQuery) {
  if (!comparableQuery) return 0;
  const aliases = listEntityAliasesSync(db, kind, entityId);
  return aliases.reduce((bestScore, alias) => Math.max(bestScore, getEntityQueryScore({ display_name: alias, slug: alias }, comparableQuery, "")), 0);
}
function getEntityTagQueryScoreSync(db, kind, entityId, comparableQuery) {
  if (!comparableQuery) return 0;
  return listEntityTagsSync(db, kind, entityId).reduce((bestScore, tag) => {
    const tagComparable = normalizeBooruComparableText(tag?.name);
    let score = 0;
    if (tagComparable === comparableQuery) score = 180;
    else if (tagComparable.startsWith(comparableQuery)) score = 120;
    else if (tagComparable.includes(comparableQuery)) score = 80;
    return Math.max(bestScore, score);
  }, 0);
}
function getEntitySearchScoreSync(db, kind, row, comparableQuery, slugQuery) {
  const entityId = String(row?.id || "");
  return Math.max(
    getEntityQueryScore(row, comparableQuery, slugQuery),
    getEntityAliasQueryScoreSync(db, kind, entityId, comparableQuery),
    getEntityTagQueryScoreSync(db, kind, entityId, comparableQuery)
  );
}
function listEntitiesSync(db, kind, query = null) {
  const queryTerms = normalizeBooruFreeTextTerms(query);
  const scoreForRow = (row) => queryTerms.reduce((bestScore, term) => Math.max(
    bestScore,
    getEntitySearchScoreSync(db, kind, row, term, normalizeBooruText(normalizeBooruSlug(term, "")).toLowerCase())
  ), 0);
  const rows = getEntityBaseRows(db, kind);
  const filteredRows = queryTerms.length ? rows.filter((row) => scoreForRow(row) > 0).sort((left, right) => {
    const leftScore = scoreForRow(left);
    const rightScore = scoreForRow(right);
    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }
    if (Number(right?.resource_count || 0) !== Number(left?.resource_count || 0)) {
      return Number(right?.resource_count || 0) - Number(left?.resource_count || 0);
    }
    return String(left?.display_name || "").localeCompare(String(right?.display_name || ""), "es-AR");
  }) : rows;
  return filteredRows.map((row) => normalizeEntityRow(db, kind, row));
}
function filterEntitiesByExactFiltersSync(db, kind, items, rawFilters) {
  const filters = Array.isArray(rawFilters) ? rawFilters : [];
  if (!filters.length) return items;
  return items.filter((item) => filters.every((rawFilter) => {
    const type = normalizeBooruText(rawFilter?.type);
    const negative = Boolean(rawFilter?.negative);
    let matches = false;
    if (type === "entity") {
      const filterKind = normalizeBooruText(rawFilter?.kind);
      const filterId = normalizeBooruOptionalText(rawFilter?.id);
      matches = filterKind === kind && Boolean(filterId) && filterId === String(item?.id || "");
    } else if (type === "tag") {
      const tagIds = resolveTagIdsForResourceFilterSync(db, {
        id: normalizeBooruOptionalText(rawFilter?.id),
        value: normalizeBooruOptionalText(rawFilter?.value),
        label: normalizeBooruOptionalText(rawFilter?.label)
      });
      if (tagIds.length) {
        const placeholders = tagIds.map(() => "?").join(", ");
        matches = Boolean(db.prepare(`
          SELECT 1 FROM booru_entity_tags
          WHERE entity_kind = ? AND entity_id = ? AND tag_id IN (${placeholders})
          LIMIT 1
        `).get(kind, item.id, ...tagIds));
      }
    }
    return negative ? !matches : matches;
  }));
}
function listEntityRelationIdsSync(db, sourceKind, sourceId, relationKind) {
  if (sourceKind === "universe" && relationKind === "character") {
    return db.prepare(`
      SELECT DISTINCT cu.character_id AS id
      FROM booru_character_universes cu
      WHERE cu.universe_id = ?
    `).all(sourceId).map((row) => String(row?.id || "")).filter(Boolean);
  }
  if (sourceKind === "universe" && relationKind === "artist") {
    return db.prepare(`
      SELECT DISTINCT ra.artist_id AS id
      FROM booru_resource_artists ra
      INNER JOIN booru_resources r ON r.id = ra.resource_id
      WHERE r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
        AND (
          EXISTS (
            SELECT 1
            FROM booru_resource_universes ru
            WHERE ru.resource_id = r.id
              AND ru.universe_id = ?
          )
          OR EXISTS (
            SELECT 1
            FROM booru_resource_characters rc
            INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
            WHERE rc.resource_id = r.id
              AND cu.universe_id = ?
              AND NOT EXISTS (
                SELECT 1
                FROM booru_resource_universe_exclusions excluded
                WHERE excluded.resource_id = r.id
                  AND excluded.universe_id = cu.universe_id
              )
          )
        )
    `).all(sourceId, sourceId).map((row) => String(row?.id || "")).filter(Boolean);
  }
  if (sourceKind === "character" && relationKind === "artist") {
    return db.prepare(`
      SELECT DISTINCT ra.artist_id AS id
      FROM booru_resource_characters rc
      INNER JOIN booru_resources r ON r.id = rc.resource_id
      INNER JOIN booru_resource_artists ra ON ra.resource_id = r.id
      WHERE rc.character_id = ?
        AND r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
    `).all(sourceId).map((row) => String(row?.id || "")).filter(Boolean);
  }
  if (sourceKind === "artist" && relationKind === "character") {
    return db.prepare(`
      SELECT DISTINCT rc.character_id AS id
      FROM booru_resource_artists ra
      INNER JOIN booru_resources r ON r.id = ra.resource_id
      INNER JOIN booru_resource_characters rc ON rc.resource_id = r.id
      WHERE ra.artist_id = ?
        AND r.classification_state != 'duplicate-review'
        AND r.trashed_at IS NULL
    `).all(sourceId).map((row) => String(row?.id || "")).filter(Boolean);
  }
  if (sourceKind === "artist" && relationKind === "universe") {
    return db.prepare(`
      SELECT DISTINCT related.id
      FROM (
        SELECT ru.universe_id AS id
        FROM booru_resource_artists ra
        INNER JOIN booru_resources r ON r.id = ra.resource_id
        INNER JOIN booru_resource_universes ru ON ru.resource_id = r.id
        WHERE ra.artist_id = ?
          AND r.classification_state != 'duplicate-review'
          AND r.trashed_at IS NULL
        UNION
        SELECT cu.universe_id AS id
        FROM booru_resource_artists ra
        INNER JOIN booru_resources r ON r.id = ra.resource_id
        INNER JOIN booru_resource_characters rc ON rc.resource_id = r.id
        INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
        WHERE ra.artist_id = ?
          AND r.classification_state != 'duplicate-review'
          AND r.trashed_at IS NULL
          AND NOT EXISTS (
            SELECT 1
            FROM booru_resource_universe_exclusions excluded
            WHERE excluded.resource_id = r.id
              AND excluded.universe_id = cu.universe_id
          )
      ) related
    `).all(sourceId, sourceId).map((row) => String(row?.id || "")).filter(Boolean);
  }
  return [];
}
function listEntityRelationsSync(db, payload = {}) {
  const request = normalizeBooruEntityRelationRequest(payload);
  if (!request) {
    throw new Error("La relacion de entidades solicitada no es valida.");
  }
  const sourceKind = request.sourceKind;
  const relationKind = request.relationKind;
  if (!getEntityBaseRowByIdSync(db, sourceKind, request.sourceId)) {
    throw new Error("La entidad de origen ya no existe en Booru.");
  }
  const relatedIds = new Set(listEntityRelationIdsSync(
    db,
    sourceKind,
    request.sourceId,
    relationKind
  ));
  const items = filterEntitiesByExactFiltersSync(
    db,
    relationKind,
    listEntitiesSync(db, relationKind, request.query).filter((item) => relatedIds.has(String(item?.id || ""))),
    request.exactFilters
  );
  return createBooruIncrementalEntityResult(items, request);
}
function getTagQueryScore(row, comparableQuery) {
  const comparableName = normalizeBooruComparableText(row?.name);
  if (comparableQuery && comparableName === comparableQuery) {
    return 300;
  }
  if (comparableQuery && comparableName.startsWith(comparableQuery)) {
    return 220;
  }
  if (comparableQuery && comparableName.includes(comparableQuery)) {
    return 140;
  }
  return 0;
}
function listTagsSync(db, query = null) {
  const comparableQuery = normalizeBooruComparableText(query);
  const rows = db.prepare(`
    SELECT
      t.*,
      COUNT(DISTINCT rel.resource_id) AS resource_count
    FROM booru_tags t
    LEFT JOIN booru_resource_tags rel ON rel.tag_id = t.id
    WHERE t.source = 'manual'
    GROUP BY t.id
    ORDER BY t.name COLLATE NOCASE ASC
  `).all();
  const filteredRows = comparableQuery ? rows.filter((row) => getTagQueryScore(row, comparableQuery) > 0).sort((left, right) => {
    const leftScore = getTagQueryScore(left, comparableQuery);
    const rightScore = getTagQueryScore(right, comparableQuery);
    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }
    if (Number(right?.resource_count || 0) !== Number(left?.resource_count || 0)) {
      return Number(right?.resource_count || 0) - Number(left?.resource_count || 0);
    }
    return String(left?.name || "").localeCompare(String(right?.name || ""), "es-AR");
  }) : rows;
  return filteredRows.map((row) => ({
    ...normalizeTagRow(row),
    resourceCount: Number(row?.resource_count || 0)
  }));
}
function listSearchSuggestionsSync(db, query, payload = {}) {
  const normalizedQuery = normalizeBooruOptionalText(query);
  const requestedKinds = Array.isArray(payload?.allowedKinds) ? new Set(payload.allowedKinds.map((value) => normalizeBooruText(value)).filter((value) => ENTITY_TABLES[value])) : null;
  const kinds = ["author", "character", "artist", "universe"];
  const items = [];
  kinds.forEach((kind) => {
    if (requestedKinds && !requestedKinds.has(kind)) return;
    listEntitiesSync(db, kind, normalizedQuery).slice(0, 12).forEach((entity) => {
      items.push({
        id: `entity:${kind}:${entity.id}`,
        type: "entity",
        kind,
        entityId: entity.id,
        label: entity.displayName,
        detail: kind === "character" && entity?.universe?.displayName ? `${BOORU_ENTITY_KIND_LABELS[kind]} \xB7 ${entity.universe.displayName}` : BOORU_ENTITY_KIND_LABELS[kind]
      });
    });
  });
  listTagsSync(db, normalizedQuery).slice(0, 12).forEach((tag) => {
    items.push({ id: `tag:${tag.id}`, type: "tag", tagId: tag.id, label: tag.name, detail: "Tag" });
  });
  return items.slice(0, 24);
}
function findTagByIdSync(db, tagId) {
  const statement = db.prepare(`
    SELECT *
    FROM booru_tags
    WHERE id = ?
    LIMIT 1
  `);
  return statement.get(tagId) || null;
}
function findTagByExactNameSync(db, value) {
  const normalizedName = normalizeBooruComparableText(value);
  const statement = db.prepare(`
    SELECT *
    FROM booru_tags
    WHERE source = 'manual'
    ORDER BY created_at ASC
  `);
  const rows = statement.all();
  return rows.find((row) => normalizeBooruComparableText(row?.name) === normalizedName) || null;
}
function ensureTagSync(db, name) {
  const normalizedName = normalizeBooruOptionalText(name);
  if (!normalizedName) {
    throw new Error("El nombre de la tag es obligatorio.");
  }
  const existing = findTagByExactNameSync(db, normalizedName);
  if (existing) {
    return {
      created: false,
      tag: {
        ...normalizeTagRow(existing),
        resourceCount: listTagsSync(db, normalizedName).find((tag) => tag.id === String(existing.id || ""))?.resourceCount || 0
      }
    };
  }
  const tagId = import_node_crypto.default.randomUUID();
  const createdAt = nowIso();
  db.prepare(`
    INSERT INTO booru_tags (
      id,
      name,
      source,
      created_at
    ) VALUES (?, ?, 'manual', ?)
  `).run(tagId, normalizedName, createdAt);
  return {
    created: true,
    tag: {
      id: tagId,
      name: normalizedName,
      source: "manual",
      resourceCount: 0
    }
  };
}
function findEntityBySlugSync(db, kind, slug) {
  const statement = db.prepare(`
    SELECT *
    FROM ${getEntityTable(kind)}
    WHERE slug = ?
    LIMIT 1
  `);
  return statement.get(slug) || null;
}
function findEntityByIdSync(db, kind, entityId) {
  const statement = db.prepare(`
    SELECT *
    FROM ${getEntityTable(kind)}
    WHERE id = ?
    LIMIT 1
  `);
  return statement.get(entityId) || null;
}
function getEntityRecordByIdSync(db, kind, entityId) {
  return listEntitiesSync(db, kind).find((entity) => entity.id === entityId) || null;
}
function findEntityByExactNameSync(db, kind, value) {
  const normalizedDisplayName = normalizeBooruComparableText(value);
  const normalizedSlug = normalizeBooruSlug(value, "");
  if (normalizedSlug) {
    const bySlug = findEntityBySlugSync(db, kind, normalizedSlug);
    if (bySlug) {
      return bySlug;
    }
  }
  const statement = db.prepare(`
    SELECT *
    FROM ${getEntityTable(kind)}
    ORDER BY created_at ASC
  `);
  const rows = statement.all();
  return rows.find((row) => normalizeBooruComparableText(row?.display_name) === normalizedDisplayName) || null;
}
function allocateUniqueEntitySlugSync(db, kind, baseSlug, currentId = null) {
  let slug = normalizeBooruSlug(baseSlug, kind);
  let suffix = 2;
  for (; ; ) {
    const existing = findEntityBySlugSync(db, kind, slug);
    if (!existing || String(existing.id || "") === currentId) {
      return slug;
    }
    slug = `${normalizeBooruSlug(baseSlug, kind)}-${suffix}`;
    suffix += 1;
  }
}
function ensureTypedEntityRecordSync(db, kind, name) {
  const displayName = normalizeBooruOptionalText(name);
  if (!displayName) {
    throw new Error(`El nombre para ${kind} es obligatorio.`);
  }
  const existing = findEntityByExactNameSync(db, kind, displayName);
  if (existing) {
    return {
      created: false,
      entity: normalizeEntityRow(db, kind, {
        ...existing,
        resource_count: getEntityRecordByIdSync(db, kind, String(existing.id || ""))?.resourceCount || 0
      })
    };
  }
  const entityId = import_node_crypto.default.randomUUID();
  const createdAt = nowIso();
  const slug = allocateUniqueEntitySlugSync(db, kind, displayName);
  db.prepare(`
    INSERT INTO ${getEntityTable(kind)} (
      id,
      display_name,
      slug,
      cover_resource_id,
      created_at
    ) VALUES (?, ?, ?, ?, ?)
  `).run(
    entityId,
    displayName,
    slug,
    null,
    createdAt
  );
  return {
    created: true,
    entity: normalizeEntityRow(db, kind, {
      id: entityId,
      display_name: displayName,
      slug,
      cover_resource_id: null,
      avatar_resource_id: null,
      banner_resource_id: null,
      created_at: createdAt,
      resource_count: 0
    })
  };
}
function ensureTypedEntitySync(db, kind, name) {
  if (kind === "character") {
    throw new Error("Un character debe crearse junto con su universe.");
  }
  return ensureTypedEntityRecordSync(db, kind, name);
}
function normalizeRecommendationDraftIds(value) {
  return uniqueBooruIds(
    (Array.isArray(value) ? value : []).map((item) => typeof item === "string" ? item : item && typeof item === "object" ? item.id : null)
  );
}
function normalizeRecommendationDraft(value) {
  const rawDraft = value && typeof value === "object" ? value : {};
  return {
    reality: normalizeBooruReality(rawDraft?.reality),
    authors: normalizeRecommendationDraftIds(rawDraft?.authors),
    artists: normalizeRecommendationDraftIds(rawDraft?.artists),
    characters: normalizeRecommendationDraftIds(rawDraft?.characters),
    universes: normalizeRecommendationDraftIds(rawDraft?.universes),
    manualTags: normalizeRecommendationDraftIds(rawDraft?.manualTags)
  };
}
function normalizeRecommendationSearch(value) {
  const parsed = parseBooruSearchSyntax(value);
  const recommendationTokens = parsed.tokens.filter((token) => !token?.negative && (token?.type === "entity" || token?.type === "tag"));
  const explicitToken = recommendationTokens.find((token) => {
    const rawToken = normalizeBooruText(token?.raw);
    const normalizedToken = rawToken.startsWith("-") ? rawToken.slice(1) : rawToken;
    const separatorIndex = normalizedToken.indexOf(":");
    if (separatorIndex <= 0) {
      return false;
    }
    const rawPrefix = normalizedToken.slice(0, separatorIndex);
    const normalizedPrefix = normalizeBooruComparableText(rawPrefix);
    return Boolean(
      normalizeBooruEntityPrefix(rawPrefix) || normalizedPrefix === "tag"
    );
  }) || null;
  const searchText = normalizeBooruOptionalText(
    explicitToken?.value || recommendationTokens.at(-1)?.value || parsed.raw
  );
  return {
    raw: parsed.raw,
    explicitToken,
    searchText
  };
}
function getRecommendationMissingKind(missingFilter) {
  if (missingFilter === "author") {
    return "author";
  }
  if (missingFilter === "artist") {
    return "artist";
  }
  if (missingFilter === "character") {
    return "character";
  }
  if (missingFilter === "universe") {
    return "universe";
  }
  return null;
}
function resolveEntityIdsFromFiltersSync(db, kind, filters = []) {
  const resolvedIds = /* @__PURE__ */ new Set();
  for (const filter of filters) {
    if (filter.kind !== kind) {
      continue;
    }
    if (filter.id) {
      resolvedIds.add(filter.id);
      continue;
    }
    if (!filter.value) {
      continue;
    }
    const comparableFilterValue = normalizeBooruComparableText(filter.value);
    const matchedRows = listEntitiesSync(db, kind, filter.value).filter((row) => normalizeBooruComparableText(row?.displayName) === comparableFilterValue || normalizeBooruComparableText(row?.slug) === comparableFilterValue).slice(0, 6);
    for (const row of matchedRows) {
      if (row?.id) {
        resolvedIds.add(row.id);
      }
    }
  }
  return Array.from(resolvedIds);
}
function resolveEntityIdsForResourceFilterSync(db, filter) {
  if (filter.id) {
    return [filter.id];
  }
  if (!filter.value) {
    return [];
  }
  const comparableFilterValue = normalizeBooruComparableText(filter.value);
  return listEntitiesSync(db, filter.kind, filter.value).filter((row) => normalizeBooruComparableText(row?.displayName) === comparableFilterValue || normalizeBooruComparableText(row?.slug) === comparableFilterValue).slice(0, 6).map((row) => String(row?.id || "").trim()).filter(Boolean);
}
function resolveTagIdsForResourceFilterSync(db, filter) {
  if (filter.id) {
    return [filter.id];
  }
  const tag = findTagByExactNameSync(db, filter.value);
  return tag?.id ? [String(tag.id)] : [];
}
function listRelatedArtistCountsByCharacterIdsSync(db, characterIds) {
  if (!characterIds.length) {
    return /* @__PURE__ */ new Map();
  }
  const placeholders = characterIds.map(() => "?").join(", ");
  const rows = db.prepare(`
    SELECT rel.artist_id AS artist_id, COUNT(DISTINCT rel.resource_id) AS relation_count
    FROM booru_resource_artists rel
    INNER JOIN booru_resource_characters rchar ON rchar.resource_id = rel.resource_id
    INNER JOIN booru_resources r ON r.id = rel.resource_id
    WHERE rchar.character_id IN (${placeholders})
      AND r.classification_state != 'duplicate-review'
      AND r.trashed_at IS NULL
    GROUP BY rel.artist_id
    ORDER BY relation_count DESC, artist_id ASC
  `).all(...characterIds);
  return new Map(
    rows.map((row) => [String(row?.artist_id || ""), Number(row?.relation_count || 0)])
  );
}
function compareRecommendationItems(left, right) {
  const labelCompare = String(left?.label || "").localeCompare(String(right?.label || ""), "es-AR");
  if (labelCompare !== 0) {
    return labelCompare;
  }
  const leftCreates = String(left?.type || "").startsWith("create-");
  const rightCreates = String(right?.type || "").startsWith("create-");
  if (leftCreates !== rightCreates) {
    return leftCreates ? 1 : -1;
  }
  return String(left?.id || "").localeCompare(String(right?.id || ""), "es-AR");
}
function buildRecommendationItemsSync(db, payload = {}) {
  const recommendationSearch = normalizeRecommendationSearch(payload?.query);
  const resourceQuery = normalizeResourceQuery(payload?.resourceQuery);
  const recommendationScope = normalizeBooruRecommendationScope(payload?.scope);
  const draft = normalizeRecommendationDraft(payload?.draft);
  const selectedResourceIds = uniqueBooruIds(payload?.selectedResourceIds);
  const selectedResources = getResourceRowsByIdsSync(db, selectedResourceIds);
  const comparableSearchText = normalizeBooruComparableText(recommendationSearch.searchText);
  const hasSearchText = Boolean(comparableSearchText);
  const explicitKind = recommendationSearch.explicitToken?.type === "entity" ? recommendationSearch.explicitToken.kind : null;
  const explicitTagMode = recommendationSearch.explicitToken?.type === "tag";
  const searchText = recommendationSearch.searchText;
  const selectedRealityValues = Array.from(new Set(
    selectedResources.map((resource) => resource?.reality || null).filter((value) => value === "real" || value === "ficticio")
  ));
  const selectedReality = selectedRealityValues.length === 1 ? selectedRealityValues[0] : null;
  const resourceFilterKinds = Array.from(new Set(resourceQuery.includeEntities.map((filter) => filter.kind)));
  const singleResourceFilterKind = resourceFilterKinds.length === 1 ? resourceFilterKinds[0] : null;
  const filteredUniverseIds = uniqueBooruIds(
    resolveEntityIdsFromFiltersSync(db, "universe", resourceQuery.includeEntities)
  );
  const filteredCharacterIds = uniqueBooruIds(
    resolveEntityIdsFromFiltersSync(db, "character", resourceQuery.includeEntities)
  );
  const selectedUniverseIds = uniqueBooruIds(selectedResources.flatMap((resource) => [
    ...Array.isArray(resource?.universes) ? resource.universes.map((item) => item?.id) : [],
    ...Array.isArray(resource?.characters) ? resource.characters.map((item) => item?.universe?.id) : []
  ]));
  const selectedCharacterIds = uniqueBooruIds(
    selectedResources.flatMap((resource) => Array.isArray(resource?.characters) ? resource.characters.map((item) => item?.id) : [])
  );
  const universeContextIds = uniqueBooruIds([
    ...draft.universes,
    ...filteredUniverseIds,
    ...selectedUniverseIds
  ]);
  const characterContextIds = uniqueBooruIds([
    ...draft.characters,
    ...filteredCharacterIds,
    ...selectedCharacterIds
  ]);
  const relatedArtistCounts = listRelatedArtistCountsByCharacterIdsSync(db, characterContextIds);
  const relatedArtistCountsFromFilters = filteredCharacterIds.length ? listRelatedArtistCountsByCharacterIdsSync(db, filteredCharacterIds) : relatedArtistCounts;
  const effectiveReality = resourceQuery.reality || draft.reality || selectedReality || null;
  const activeMissingFilter = resourceQuery.missing;
  const explicitMissingDrivenKind = getRecommendationMissingKind(activeMissingFilter);
  const missingDrivenKind = explicitMissingDrivenKind || (!explicitKind && !explicitTagMode ? getBooruImplicitRecommendationMissingKind(recommendationScope, effectiveReality) : null);
  const allowEssentialRecommendations = recommendationScope !== BOORU_RECOMMENDATION_SCOPES.TAGS;
  const allowTagRecommendations = recommendationScope !== BOORU_RECOMMENDATION_SCOPES.ESSENTIAL;
  const allEntityKinds = ["author", "artist", "character", "universe"];
  const recommendationContext = (() => {
    if (missingDrivenKind) {
      return missingDrivenKind;
    }
    if (filteredUniverseIds.length) {
      return "universe";
    }
    if (filteredCharacterIds.length) {
      return "character";
    }
    if (singleResourceFilterKind) {
      return singleResourceFilterKind;
    }
    if (universeContextIds.length) {
      return "universe";
    }
    if (characterContextIds.length) {
      return "character";
    }
    return effectiveReality || null;
  })();
  const preferredKinds = getBooruRecommendationKindOrder(recommendationContext);
  const preferredIncludesTags = allowTagRecommendations && Boolean(
    recommendationScope === BOORU_RECOMMENDATION_SCOPES.TAGS || effectiveReality === "ficticio" && !missingDrivenKind && !filteredUniverseIds.length && !filteredCharacterIds.length && !universeContextIds.length && !characterContextIds.length
  );
  const preferredIncludesRealityActions = Boolean(
    allowEssentialRecommendations && !effectiveReality && !explicitKind && !explicitTagMode && !missingDrivenKind
  );
  const hasPreferredBucket = Boolean(
    preferredKinds.length || preferredIncludesTags || preferredIncludesRealityActions
  );
  const needsRealityChoice = !hasSearchText && allowEssentialRecommendations && !effectiveReality && !explicitKind && !explicitTagMode && !missingDrivenKind && !resourceFilterKinds.length && !universeContextIds.length && !characterContextIds.length;
  let narrowKind = null;
  let includeTags = allowTagRecommendations && !explicitKind;
  if (explicitKind) {
    narrowKind = explicitKind;
    includeTags = false;
  } else if (explicitTagMode) {
    narrowKind = null;
    includeTags = allowTagRecommendations;
  } else if (hasSearchText) {
    if (missingDrivenKind) {
      narrowKind = missingDrivenKind;
      includeTags = false;
    } else {
      narrowKind = null;
      includeTags = true;
    }
  } else if (missingDrivenKind) {
    narrowKind = missingDrivenKind;
    includeTags = false;
  }
  const candidateKinds = !allowEssentialRecommendations || explicitTagMode ? [] : narrowKind ? [narrowKind] : allEntityKinds;
  const contextualCreateKind = explicitKind || (!includeTags && candidateKinds.length === 1 ? candidateKinds[0] : null);
  const seenItemIds = /* @__PURE__ */ new Set();
  const items = [];
  const pushItem = (item) => {
    if (!item?.id || seenItemIds.has(item.id)) {
      return;
    }
    seenItemIds.add(item.id);
    items.push(item);
  };
  const pushRealityItems = () => {
    if (!allowEssentialRecommendations || explicitKind || explicitTagMode || missingDrivenKind || effectiveReality) {
      return;
    }
    for (const realityOption of ["real", "ficticio"]) {
      const label = realityOption === "real" ? "Real" : "Ficticio";
      if (comparableSearchText && !normalizeBooruComparableText(label).includes(comparableSearchText)) {
        continue;
      }
      pushItem({
        id: `reality:${realityOption}`,
        type: "reality-action",
        label,
        detail: "Clasificacion base",
        actionLabel: "Aplicar",
        reality: realityOption
      });
    }
  };
  const pushTextModeEntityItems = (kinds) => {
    for (const kind of kinds) {
      listEntitiesSync(db, kind, searchText).forEach((row) => {
        pushItem({
          id: `entity:${kind}:${row.id}`,
          type: "entity",
          kind,
          entityId: row.id,
          label: row.displayName,
          detail: row?.universe?.displayName ? `${BOORU_ENTITY_KIND_LABELS[kind]} \xC2\xB7 ${row.universe.displayName} \xC2\xB7 ${row.resourceCount} recursos` : `${BOORU_ENTITY_KIND_LABELS[kind]} \xC2\xB7 ${row.resourceCount} recursos`,
          actionLabel: "Aplicar",
          resourceCount: Number(row?.resourceCount || 0),
          entity: row,
          dropEnabled: true
        });
      });
    }
  };
  const pushTextModeTagItems = () => {
    listTagsSync(db, searchText).forEach((tag) => {
      pushItem({
        id: `tag:${tag.id}`,
        type: "tag",
        kind: "tag",
        tagId: tag.id,
        label: tag.name,
        detail: `Tag \xC2\xB7 ${tag.resourceCount} recursos`,
        actionLabel: "Aplicar",
        resourceCount: Number(tag?.resourceCount || 0),
        tag
      });
    });
  };
  const pushTextModeCreateItem = () => {
    if (!searchText) {
      return;
    }
    const createKind = explicitKind || missingDrivenKind || null;
    if (createKind) {
      if (!allowEssentialRecommendations) {
        return;
      }
      const exactEntity = findEntityByExactNameSync(db, createKind, searchText);
      if (!exactEntity) {
        pushItem({
          id: `create-entity:${createKind}:${normalizeBooruComparableText(searchText)}`,
          type: "create-entity",
          kind: createKind,
          label: searchText,
          detail: `Crear ${BOORU_ENTITY_KIND_LABELS[createKind]}`,
          actionLabel: "Crear",
          createName: searchText
        });
      }
      return;
    }
    if (!allowTagRecommendations) {
      return;
    }
    const exactTag = findTagByExactNameSync(db, searchText);
    if (!exactTag) {
      pushItem({
        id: `create-tag:${normalizeBooruComparableText(searchText)}`,
        type: "create-tag",
        kind: "tag",
        label: searchText,
        detail: "Crear tag plana",
        actionLabel: "Crear",
        createName: searchText
      });
    }
  };
  const isPreferredItem = (item) => {
    if (item?.type === "reality-action") {
      return preferredIncludesRealityActions;
    }
    if (item?.type === "tag" || item?.type === "create-tag") {
      return preferredIncludesTags;
    }
    const itemKind = String(item?.kind || "").trim();
    if (!preferredKinds.includes(itemKind)) {
      return false;
    }
    if (itemKind === "character") {
      const itemUniverseId = normalizeBooruOptionalText(item?.entity?.universe?.id);
      if (filteredUniverseIds.length) {
        return Boolean(itemUniverseId && filteredUniverseIds.includes(itemUniverseId));
      }
      if (universeContextIds.length) {
        return Boolean(itemUniverseId && universeContextIds.includes(itemUniverseId));
      }
    }
    if (itemKind === "artist") {
      const entityId = normalizeBooruOptionalText(item?.entityId);
      if (!entityId) {
        return false;
      }
      if (filteredCharacterIds.length) {
        return relatedArtistCountsFromFilters.has(entityId);
      }
      if (characterContextIds.length) {
        return relatedArtistCounts.has(entityId);
      }
    }
    return true;
  };
  const compareContextualItems = (left, right) => {
    const preferredCompare = Number(isPreferredItem(right)) - Number(isPreferredItem(left));
    if (preferredCompare !== 0) {
      return preferredCompare;
    }
    const leftKind = String(left?.kind || "").trim();
    const rightKind = String(right?.kind || "").trim();
    const kindRankCompare = getBooruRecommendationKindRank(recommendationContext, leftKind) - getBooruRecommendationKindRank(recommendationContext, rightKind);
    if (kindRankCompare !== 0) {
      return kindRankCompare;
    }
    return compareRecommendationItems(left, right);
  };
  if (hasSearchText) {
    const hardRestrictionKind = explicitKind || missingDrivenKind || null;
    pushRealityItems();
    pushTextModeEntityItems(
      !allowEssentialRecommendations || explicitTagMode ? [] : hardRestrictionKind ? [hardRestrictionKind] : allEntityKinds
    );
    if (allowTagRecommendations && (explicitTagMode || !hardRestrictionKind)) {
      pushTextModeTagItems();
    }
    pushTextModeCreateItem();
    if (!hasPreferredBucket || explicitTagMode) {
      return items.sort(compareRecommendationItems);
    }
    return items.sort(compareContextualItems);
  }
  if (needsRealityChoice) {
    for (const realityOption of ["real", "ficticio"]) {
      const label = realityOption === "real" ? "Real" : "Ficticio";
      if (comparableSearchText && !normalizeBooruComparableText(label).includes(comparableSearchText)) {
        continue;
      }
      pushItem({
        id: `reality:${realityOption}`,
        type: "reality-action",
        label,
        detail: "Clasificacion base",
        actionLabel: "Aplicar",
        reality: realityOption
      });
    }
    return items.sort(compareRecommendationItems);
  }
  for (const kind of candidateKinds) {
    listEntitiesSync(db, kind, searchText).forEach((row) => {
      pushItem({
        id: `entity:${kind}:${row.id}`,
        type: "entity",
        kind,
        entityId: row.id,
        label: row.displayName,
        detail: row?.universe?.displayName ? `${BOORU_ENTITY_KIND_LABELS[kind]} \xB7 ${row.universe.displayName} \xB7 ${row.resourceCount} recursos` : `${BOORU_ENTITY_KIND_LABELS[kind]} \xB7 ${row.resourceCount} recursos`,
        actionLabel: "Aplicar",
        resourceCount: Number(row?.resourceCount || 0),
        entity: row,
        dropEnabled: true
      });
    });
  }
  if (includeTags) {
    listTagsSync(db, searchText).forEach((tag) => {
      pushItem({
        id: `tag:${tag.id}`,
        type: "tag",
        kind: "tag",
        tagId: tag.id,
        label: tag.name,
        detail: `Tag \xB7 ${tag.resourceCount} recursos`,
        actionLabel: "Aplicar",
        resourceCount: Number(tag?.resourceCount || 0),
        tag
      });
    });
  }
  if (searchText) {
    if (contextualCreateKind) {
      const exactEntity = findEntityByExactNameSync(db, contextualCreateKind, searchText);
      if (!exactEntity) {
        pushItem({
          id: `create-entity:${contextualCreateKind}:${normalizeBooruComparableText(searchText)}`,
          type: "create-entity",
          kind: contextualCreateKind,
          label: searchText,
          detail: `Crear ${BOORU_ENTITY_KIND_LABELS[contextualCreateKind]}`,
          actionLabel: "Crear",
          createName: searchText
        });
      }
    } else {
      const exactTag = findTagByExactNameSync(db, searchText);
      if (!exactTag) {
        pushItem({
          id: `create-tag:${normalizeBooruComparableText(searchText)}`,
          type: "create-tag",
          kind: "tag",
          label: searchText,
          detail: "Crear tag plana",
          actionLabel: "Crear",
          createName: searchText
        });
      }
    }
  }
  return items.sort(compareContextualItems);
}
function listRecommendationsSync(db, payload = {}) {
  const offset = normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER);
  const limit = Math.max(1, normalizePagingNumber(payload?.limit, BOORU_RECOMMENDATION_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE));
  const items = buildRecommendationItemsSync(db, payload);
  return {
    items: items.slice(offset, offset + limit),
    totalCount: items.length,
    hasMore: offset + limit < items.length
  };
}
function setEntityVisualSync(db, payload) {
  const kind = normalizeBooruText(payload?.kind);
  const entityId = normalizeBooruText(payload?.entityId);
  const resourceId = normalizeBooruText(payload?.resourceId);
  const visualRole = normalizeBooruText(payload?.visualRole);
  const visualColumn = ENTITY_VISUAL_COLUMNS[visualRole];
  if (!ENTITY_TABLES[kind]) {
    throw new Error("El tipo de entidad solicitado no existe en Booru.");
  }
  if (!entityId) {
    throw new Error("La entidad solicitada no es valida.");
  }
  if (!resourceId) {
    throw new Error("El recurso seleccionado no es valido.");
  }
  if (!visualColumn) {
    throw new Error("El visual solicitado no existe en Booru.");
  }
  const entity = getEntityBaseRowByIdSync(db, kind, entityId);
  if (!entity) {
    throw new Error("La entidad solicitada ya no existe en Booru.");
  }
  const resource = getResourceByIdSync(db, resourceId);
  if (!resource?.id || resource.classificationState === "duplicate-review" || resource.trashedAt) {
    throw new Error("El recurso seleccionado ya no esta disponible en Booru.");
  }
  db.prepare(`
    UPDATE ${getEntityTable(kind)}
    SET ${visualColumn} = ?
    WHERE id = ?
  `).run(resourceId, entityId);
  const profile = getEntityProfileSync(db, kind, entityId);
  if (!profile) {
    throw new Error("No se pudo reconstruir el perfil despues de actualizar la imagen.");
  }
  return profile;
}
function setEntityVisualLayoutSync(db, payload) {
  const kind = normalizeBooruText(payload?.kind);
  const entityId = normalizeBooruText(payload?.entityId);
  const visualRole = normalizeBooruText(payload?.visualRole);
  if (!ENTITY_TABLES[kind]) {
    throw new Error("El tipo de entidad solicitado no existe en Booru.");
  }
  if (!entityId) {
    throw new Error("La entidad solicitada no es valida.");
  }
  if (visualRole !== "avatar" && visualRole !== "banner") {
    throw new Error("El visual solicitado no admite ajuste de encuadre.");
  }
  const entity = getEntityBaseRowByIdSync(db, kind, entityId);
  if (!entity) {
    throw new Error("La entidad solicitada ya no existe en Booru.");
  }
  const currentSettings = parseEntityVisualSettings(entity?.visual_settings_json);
  const nextSettings = normalizeBooruEntityVisualSettings({
    ...currentSettings,
    [visualRole]: {
      scale: payload?.layout?.scale ?? payload?.scale,
      offsetX: payload?.layout?.offsetX ?? payload?.offsetX,
      offsetY: payload?.layout?.offsetY ?? payload?.offsetY
    }
  });
  db.prepare(`
    UPDATE ${getEntityTable(kind)}
    SET visual_settings_json = ?
    WHERE id = ?
  `).run(serializeEntityVisualSettings(nextSettings), entityId);
  const profile = getEntityProfileSync(db, kind, entityId);
  if (!profile) {
    throw new Error("No se pudo reconstruir el perfil despues de actualizar su encuadre.");
  }
  return profile;
}
function setCharacterUniverseSync(db, payload) {
  const characterId = normalizeBooruText(payload?.characterId);
  const universeId = normalizeBooruText(payload?.universeId);
  if (!characterId) {
    throw new Error("El character solicitado no es valido.");
  }
  if (!universeId) {
    throw new Error("Todo character necesita exactamente un universe.");
  }
  const character = findEntityByIdSync(db, "character", characterId);
  if (!character) {
    throw new Error("El character solicitado ya no existe en Booru.");
  }
  const universe = findEntityByIdSync(db, "universe", universeId);
  if (!universe) {
    throw new Error("El universe solicitado ya no existe en Booru.");
  }
  withTransaction(db, () => {
    replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
    syncEntityConsumerInheritanceSync(db, "character", characterId);
  });
  const profile = getEntityProfileSync(db, "character", characterId);
  if (!profile) {
    throw new Error("No se pudo reconstruir el perfil del character despues de actualizar su universe.");
  }
  return profile;
}
function ensureCharacterInUniverseSync(db, payload) {
  const universeId = normalizeBooruText(payload?.universeId);
  const name = normalizeBooruText(payload?.name);
  if (!universeId) {
    throw new Error("Hace falta un universe para crear el character.");
  }
  const universe = findEntityByIdSync(db, "universe", universeId);
  if (!universe) {
    throw new Error("El universe solicitado ya no existe en Booru.");
  }
  const ensured = ensureTypedEntityRecordSync(db, "character", name);
  const characterId = String(ensured?.entity?.id || "").trim();
  if (!characterId) {
    throw new Error("No se pudo asegurar el character.");
  }
  const currentUniverse = getCharacterUniverseRecordSync(db, characterId);
  if (currentUniverse?.id && currentUniverse.id !== universeId) {
    throw new Error(`Ese character ya existe en ${currentUniverse.displayName}.`);
  }
  if (!currentUniverse?.id) {
    withTransaction(db, () => {
      replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
      syncEntityConsumerInheritanceSync(db, "character", characterId);
    });
  }
  return {
    created: Boolean(ensured?.created),
    entity: getEntityRecordByIdSync(db, "character", characterId) || ensured.entity
  };
}
function normalizeUniqueTextList(value) {
  const seen = /* @__PURE__ */ new Set();
  const values = [];
  (Array.isArray(value) ? value : []).forEach((entry) => {
    const text = normalizeBooruOptionalText(entry);
    const comparable = normalizeBooruComparableText(text);
    if (!text || !comparable || seen.has(comparable)) return;
    seen.add(comparable);
    values.push(text);
  });
  return values;
}
function normalizeSocialLinks(value) {
  const seen = /* @__PURE__ */ new Set();
  const links = [];
  (Array.isArray(value) ? value : []).forEach((entry) => {
    const platformId = normalizeBooruOptionalText(entry?.platformId);
    const url = normalizeBooruOptionalText(entry?.url);
    if (!platformId || !url) return;
    const key = `${platformId}:${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ platformId, url });
  });
  return links;
}
function saveEntityProfileSync(db, payload) {
  const kind = normalizeBooruText(payload?.kind);
  const entityId = normalizeBooruOptionalText(payload?.entityId);
  if (!ENTITY_TABLES[kind] || !entityId || !findEntityByIdSync(db, kind, entityId)) {
    throw new Error("La entidad solicitada ya no existe en Booru.");
  }
  const tagIds = Object.prototype.hasOwnProperty.call(payload || {}, "tagIds") ? uniqueBooruIds(payload?.tagIds) : listEntityTagsSync(db, kind, entityId).map((tag) => tag.id);
  assertValidTagIdsSync(db, tagIds);
  const aliases = Object.prototype.hasOwnProperty.call(payload || {}, "aliasNames") ? normalizeUniqueTextList(payload?.aliasNames) : listEntityAliasesSync(db, kind, entityId);
  const socialLinks = Object.prototype.hasOwnProperty.call(payload || {}, "socialLinks") ? normalizeSocialLinks(payload?.socialLinks) : listEntitySocialLinksSync(db, kind, entityId).map((link) => ({ platformId: link?.platform?.id, url: link?.url }));
  if ((aliases.length || socialLinks.length) && kind !== "author" && kind !== "artist") {
    throw new Error("Solo Persona y Artist admiten aliases y redes.");
  }
  socialLinks.forEach((link) => {
    if (!db.prepare(`SELECT id FROM booru_social_platforms WHERE id = ?`).get(link.platformId)) {
      throw new Error("Una plataforma seleccionada ya no existe.");
    }
  });
  withTransaction(db, () => {
    db.prepare(`DELETE FROM booru_entity_tags WHERE entity_kind = ? AND entity_id = ?`).run(kind, entityId);
    const insertTag = db.prepare(`
      INSERT INTO booru_entity_tags (entity_kind, entity_id, tag_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    tagIds.forEach((tagId) => insertTag.run(kind, entityId, tagId, nowIso()));
    if (kind === "author" || kind === "artist") {
      db.prepare(`DELETE FROM booru_entity_aliases WHERE entity_kind = ? AND entity_id = ?`).run(kind, entityId);
      const insertAlias = db.prepare(`
        INSERT INTO booru_entity_aliases (entity_kind, entity_id, alias_name, comparable_name, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      aliases.forEach((alias) => insertAlias.run(kind, entityId, alias, normalizeBooruComparableText(alias), nowIso()));
      db.prepare(`DELETE FROM booru_entity_social_links WHERE entity_kind = ? AND entity_id = ?`).run(kind, entityId);
      const insertLink = db.prepare(`
        INSERT INTO booru_entity_social_links (id, entity_kind, entity_id, platform_id, url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      socialLinks.forEach((link) => insertLink.run(import_node_crypto.default.randomUUID(), kind, entityId, link.platformId, link.url, nowIso()));
    }
    syncEntityConsumerInheritanceSync(db, kind, entityId);
  });
  return getEntityProfileSync(db, kind, entityId);
}
function listSocialPlatformsSync(db) {
  return db.prepare(`
    SELECT p.*, COUNT(DISTINCT rel.id) AS profile_count
    FROM booru_social_platforms p
    LEFT JOIN booru_entity_social_links rel ON rel.platform_id = p.id
    GROUP BY p.id
    ORDER BY p.display_name COLLATE NOCASE ASC
  `).all().map((row) => ({
    id: String(row?.id || ""),
    displayName: String(row?.display_name || ""),
    iconResourceId: normalizeBooruOptionalText(row?.icon_resource_id),
    iconLayout: parseEntityVisualSettings(row?.icon_layout_json)?.avatar || null,
    profileCount: Number(row?.profile_count || 0)
  }));
}
function saveSocialPlatformSync(db, payload) {
  const id = normalizeBooruOptionalText(payload?.id) || import_node_crypto.default.randomUUID();
  const displayName = normalizeBooruOptionalText(payload?.displayName);
  const iconResourceId = normalizeBooruOptionalText(payload?.iconResourceId);
  if (!displayName) throw new Error("El nombre de la plataforma es obligatorio.");
  if (iconResourceId && !getResourceByIdSync(db, iconResourceId)) throw new Error("El icono elegido ya no existe.");
  const currentLayout = normalizeBooruEntityVisualLayout(payload?.iconLayout);
  const layoutJson = serializeEntityVisualSettings({ avatar: currentLayout, banner: normalizeBooruEntityVisualLayout({}) });
  const existing = db.prepare(`SELECT id FROM booru_social_platforms WHERE id = ?`).get(id);
  if (existing) {
    db.prepare(`UPDATE booru_social_platforms SET display_name = ?, icon_resource_id = ?, icon_layout_json = ? WHERE id = ?`).run(displayName, iconResourceId, layoutJson, id);
  } else {
    db.prepare(`INSERT INTO booru_social_platforms (id, display_name, icon_resource_id, icon_layout_json, created_at) VALUES (?, ?, ?, ?, ?)`).run(id, displayName, iconResourceId, layoutJson, nowIso());
  }
  return listSocialPlatformsSync(db).find((platform) => platform.id === id) || null;
}
function deleteSocialPlatformSync(db, payload) {
  const platformId = normalizeBooruOptionalText(payload?.platformId);
  const confirmed = payload?.confirmed === true;
  if (!platformId) throw new Error("La plataforma solicitada no es valida.");
  const consumers = db.prepare(`
    SELECT rel.entity_kind, rel.entity_id, e.display_name
    FROM booru_entity_social_links rel
    LEFT JOIN booru_authors e ON rel.entity_kind = 'author' AND e.id = rel.entity_id
    WHERE rel.platform_id = ? AND rel.entity_kind = 'author'
  `).all(platformId);
  const artistConsumers = db.prepare(`
    SELECT rel.entity_kind, rel.entity_id, e.display_name
    FROM booru_entity_social_links rel
    INNER JOIN booru_artists e ON rel.entity_kind = 'artist' AND e.id = rel.entity_id
    WHERE rel.platform_id = ?
  `).all(platformId);
  const affectedProfiles = [...consumers, ...artistConsumers].map((row) => ({
    kind: String(row?.entity_kind || ""),
    id: String(row?.entity_id || ""),
    displayName: String(row?.display_name || "")
  }));
  if (affectedProfiles.length && !confirmed) return { deleted: false, affectedProfiles };
  db.prepare(`DELETE FROM booru_social_platforms WHERE id = ?`).run(platformId);
  return { deleted: true, affectedProfiles };
}
function excludeResourceTagSync(db, resourceId, tagId) {
  if (!getResourceByIdSync(db, resourceId) || !findTagByIdSync(db, tagId)) throw new Error("La tag o el recurso ya no existe.");
  const isInherited = Boolean(db.prepare(`
    SELECT 1
    FROM booru_resource_inherited_tags
    WHERE resource_id = ? AND tag_id = ?
    LIMIT 1
  `).get(resourceId, tagId));
  withTransaction(db, () => {
    db.prepare(`DELETE FROM booru_resource_tags WHERE resource_id = ? AND tag_id = ?`).run(resourceId, tagId);
    if (isInherited) {
      db.prepare(`INSERT OR IGNORE INTO booru_resource_tag_exclusions (resource_id, tag_id, created_at) VALUES (?, ?, ?)`).run(resourceId, tagId, nowIso());
    } else {
      db.prepare(`DELETE FROM booru_resource_tag_exclusions WHERE resource_id = ? AND tag_id = ?`).run(resourceId, tagId);
    }
  });
  return getResourceByIdSync(db, resourceId);
}
function excludeResourceUniverseSync(db, resourceId, universeId) {
  if (!getResourceByIdSync(db, resourceId) || !findEntityByIdSync(db, "universe", universeId)) throw new Error("El universe o el recurso ya no existe.");
  withTransaction(db, () => {
    db.prepare(`DELETE FROM booru_resource_universes WHERE resource_id = ? AND universe_id = ?`).run(resourceId, universeId);
    db.prepare(`INSERT OR IGNORE INTO booru_resource_universe_exclusions (resource_id, universe_id, created_at) VALUES (?, ?, ?)`).run(resourceId, universeId, nowIso());
    syncResourceInheritanceSync(db, resourceId);
    reconcileResourceClassificationSync(db, resourceId);
  });
  return getResourceByIdSync(db, resourceId);
}
function disassociateResourcesFromEntitySync(db, payload) {
  const kind = normalizeBooruText(payload?.kind);
  const entityId = normalizeBooruOptionalText(payload?.entityId);
  const resourceIds = uniqueBooruIds(payload?.resourceIds);
  if (!ENTITY_TABLES[kind] || !entityId || !resourceIds.length) throw new Error("La entidad y los recursos son obligatorios.");
  const table = kind === "universe" ? "booru_resource_universes" : getResourceRelationTable(kind);
  const column = kind === "universe" ? "universe_id" : getResourceRelationEntityIdColumn(kind);
  if (!table || !column) throw new Error("No se puede desasociar este tipo de entidad.");
  withTransaction(db, () => {
    const unlink = db.prepare(`DELETE FROM ${table} WHERE resource_id = ? AND ${column} = ?`);
    resourceIds.forEach((resourceId) => {
      unlink.run(resourceId, entityId);
      syncResourceInheritanceSync(db, resourceId);
      reconcileResourceClassificationSync(db, resourceId);
    });
    const visualColumnNames = Object.values(ENTITY_VISUAL_COLUMNS);
    visualColumnNames.forEach((columnName) => {
      const placeholders = resourceIds.map(() => "?").join(", ");
      if (placeholders) {
        db.prepare(`UPDATE ${getEntityTable(kind)} SET ${columnName} = NULL WHERE id = ? AND ${columnName} IN (${placeholders})`).run(entityId, ...resourceIds);
      }
    });
  });
  return { resourceIds, profile: getEntityProfileSync(db, kind, entityId) };
}
function replaceResourceEntityAssignmentsSync(db, kind, resourceId, entityIds) {
  const relationTable = getResourceRelationTable(kind);
  const relationEntityIdColumn = getResourceRelationEntityIdColumn(kind);
  if (!relationTable || !relationEntityIdColumn) {
    return;
  }
  db.prepare(`DELETE FROM ${relationTable} WHERE resource_id = ?`).run(resourceId);
  if (!entityIds.length) {
    return;
  }
  const insertStatement = db.prepare(`
    INSERT INTO ${relationTable} (
      resource_id,
      ${relationEntityIdColumn},
      sort_order,
      created_at
    ) VALUES (?, ?, ?, ?)
  `);
  const createdAt = nowIso();
  entityIds.forEach((entityId, index) => {
    insertStatement.run(resourceId, entityId, index, createdAt);
  });
}
function syncResourceInheritanceSync(db, resourceId) {
  db.prepare(`DELETE FROM booru_resource_inherited_tags WHERE resource_id = ?`).run(resourceId);
  db.prepare(`DELETE FROM booru_resource_inherited_universes WHERE resource_id = ?`).run(resourceId);
  const sources = [];
  const addSources = (kind) => {
    const relationTable = getResourceRelationTable(kind);
    const entityColumn = getResourceRelationEntityIdColumn(kind);
    db.prepare(`SELECT ${entityColumn} AS entity_id FROM ${relationTable} WHERE resource_id = ?`).all(resourceId).forEach((row) => sources.push({ kind, entityId: String(row?.entity_id || "") }));
  };
  addSources("author");
  addSources("artist");
  addSources("character");
  db.prepare(`SELECT universe_id FROM booru_resource_universes WHERE resource_id = ?`).all(resourceId).forEach((row) => sources.push({ kind: "universe", entityId: String(row?.universe_id || "") }));
  const inheritedUniverseInsert = db.prepare(`
    INSERT OR IGNORE INTO booru_resource_inherited_universes (
      resource_id, universe_id, character_id, created_at
    ) VALUES (?, ?, ?, ?)
  `);
  const characterUniverseRows = db.prepare(`
    SELECT rc.character_id, cu.universe_id
    FROM booru_resource_characters rc
    INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
    WHERE rc.resource_id = ?
  `).all(resourceId);
  characterUniverseRows.forEach((row) => {
    const characterId = String(row?.character_id || "");
    const universeId = String(row?.universe_id || "");
    if (!characterId || !universeId) return;
    inheritedUniverseInsert.run(resourceId, universeId, characterId, nowIso());
    sources.push({ kind: "universe", entityId: universeId });
  });
  const tagInsert = db.prepare(`
    INSERT OR IGNORE INTO booru_resource_inherited_tags (
      resource_id, tag_id, source_kind, source_entity_id, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `);
  const seenSources = /* @__PURE__ */ new Set();
  sources.forEach(({ kind, entityId }) => {
    if (!entityId) return;
    const key = `${kind}:${entityId}`;
    if (seenSources.has(key)) return;
    seenSources.add(key);
    listEntityTagsSync(db, kind, entityId).forEach((tag) => {
      tagInsert.run(resourceId, tag.id, kind, entityId, nowIso());
    });
  });
}
function syncEntityConsumerInheritanceSync(db, kind, entityId) {
  const resourceIds = /* @__PURE__ */ new Set();
  if (kind === "universe") {
    db.prepare(`SELECT resource_id FROM booru_resource_universes WHERE universe_id = ?`).all(entityId).forEach((row) => resourceIds.add(String(row?.resource_id || "")));
    db.prepare(`
      SELECT rc.resource_id
      FROM booru_resource_characters rc
      INNER JOIN booru_character_universes cu ON cu.character_id = rc.character_id
      WHERE cu.universe_id = ?
    `).all(entityId).forEach((row) => resourceIds.add(String(row?.resource_id || "")));
  } else {
    const table = getResourceRelationTable(kind);
    const column = getResourceRelationEntityIdColumn(kind);
    if (table && column) {
      db.prepare(`SELECT resource_id FROM ${table} WHERE ${column} = ?`).all(entityId).forEach((row) => resourceIds.add(String(row?.resource_id || "")));
    }
  }
  resourceIds.forEach((resourceId) => {
    if (resourceId) {
      syncResourceInheritanceSync(db, resourceId);
      reconcileResourceClassificationSync(db, resourceId);
    }
  });
}
function reconcileResourceClassificationSync(db, resourceId) {
  const resource = getResourceByIdSync(db, resourceId);
  if (!resource || resource.classificationState === "duplicate-review" || resource.trashedAt) {
    return resource;
  }
  const realityPolicy = resolveBooruReality({
    reality: resource.reality,
    realitySource: resource.realitySource,
    authors: resource.authors,
    artists: resource.artists,
    characters: resource.characters,
    universes: resource.universes
  });
  const classificationState = getBooruEssentialState({
    reality: realityPolicy.reality,
    authors: resource.authors,
    artists: resource.artists,
    characters: resource.characters,
    universes: resource.universes
  }).classificationState;
  db.prepare(`
    UPDATE booru_resources
    SET reality = ?, reality_source = ?, classification_state = ?
    WHERE id = ?
  `).run(realityPolicy.reality, realityPolicy.source, classificationState, resourceId);
  return getResourceByIdSync(db, resourceId);
}
function replaceResourceTagAssignmentsSync(db, resourceId, tagIds) {
  db.prepare(`
    DELETE FROM booru_resource_tags
    WHERE resource_id = ?
  `).run(resourceId);
  if (!tagIds.length) {
    return;
  }
  const insertStatement = db.prepare(`
    INSERT INTO booru_resource_tags (
      resource_id,
      tag_id,
      created_at
    ) VALUES (?, ?, ?)
  `);
  const createdAt = nowIso();
  tagIds.forEach((tagId) => {
    insertStatement.run(resourceId, tagId, createdAt);
    db.prepare(`DELETE FROM booru_resource_tag_exclusions WHERE resource_id = ? AND tag_id = ?`).run(resourceId, tagId);
  });
}
function replaceResourceUniverseAssignmentsSync(db, resourceId, universeIds) {
  db.prepare(`
    DELETE FROM booru_resource_universes
    WHERE resource_id = ?
  `).run(resourceId);
  if (!universeIds.length) {
    return;
  }
  const insertStatement = db.prepare(`
    INSERT INTO booru_resource_universes (
      resource_id,
      universe_id,
      sort_order,
      created_at
    ) VALUES (?, ?, ?, ?)
  `);
  const createdAt = nowIso();
  universeIds.forEach((universeId, index) => {
    insertStatement.run(resourceId, universeId, index, createdAt);
    db.prepare(`DELETE FROM booru_resource_universe_exclusions WHERE resource_id = ? AND universe_id = ?`).run(resourceId, universeId);
  });
}
function replaceCharacterUniverseAssignmentSync(db, characterId, universeId) {
  if (!universeId) {
    throw new Error("Todo character necesita exactamente un universe.");
  }
  db.prepare(`
    DELETE FROM booru_character_universes
    WHERE character_id = ?
  `).run(characterId);
  db.prepare(`
    INSERT INTO booru_character_universes (
      character_id,
      universe_id,
      created_at
    ) VALUES (?, ?, ?)
  `).run(characterId, universeId, nowIso());
}
function normalizeCharacterUniverseAssignments(value) {
  const assignmentMap = /* @__PURE__ */ new Map();
  for (const item of Array.isArray(value) ? value : []) {
    const assignment = item;
    const characterId = normalizeBooruOptionalText(assignment?.characterId);
    const universeId = normalizeBooruOptionalText(assignment?.universeId);
    if (!characterId || !universeId) {
      continue;
    }
    assignmentMap.set(characterId, universeId);
  }
  return Array.from(assignmentMap.entries()).map(([characterId, universeId]) => ({
    characterId,
    universeId
  }));
}
function normalizeDirtyFields(value) {
  return new Set(
    (Array.isArray(value) ? value : []).map((entry) => normalizeBooruText(entry)).filter(Boolean)
  );
}
function normalizeAssignmentPatch(value) {
  const patchValue = value;
  return {
    addIds: uniqueBooruIds(patchValue?.addIds),
    removeIds: uniqueBooruIds(patchValue?.removeIds)
  };
}
function applyIdsPatch(currentIds, patch) {
  const nextIds = [...currentIds];
  const removedIds = new Set(patch.removeIds);
  const withoutRemoved = nextIds.filter((entry) => !removedIds.has(entry));
  for (const entry of patch.addIds) {
    if (!withoutRemoved.includes(entry)) {
      withoutRemoved.push(entry);
    }
  }
  return withoutRemoved;
}
function getDerivedClassificationStateSync(reality, authorIds, artistIds, characterRecords, resourceUniverseIds) {
  return getBooruEssentialState({
    reality,
    authors: authorIds,
    artists: artistIds,
    characters: characterRecords,
    universes: resourceUniverseIds
  }).classificationState;
}
function getLinkedEntityRecordByIdSync(db, kind, entityId) {
  const row = findEntityByIdSync(db, kind, entityId);
  return row ? normalizeLinkedEntityRow(row) : null;
}
function assertValidEntityIdsSync(db, kind, entityIds) {
  for (const entityId of entityIds) {
    if (!findEntityByIdSync(db, kind, entityId)) {
      throw new Error(`Uno de los ${kind}s seleccionados ya no existe.`);
    }
  }
}
function assertValidTagIdsSync(db, tagIds) {
  for (const tagId of tagIds) {
    const tag = findTagByIdSync(db, tagId);
    if (!tag || String(tag.source || "manual") !== "manual") {
      throw new Error("Una de las tags manuales seleccionadas ya no existe.");
    }
  }
}
function resolveRelationFieldUpdateMode(payload, dirtyFields, fieldName, replaceKey, patchKey) {
  if (dirtyFields.size) {
    if (!dirtyFields.has(fieldName)) {
      return "keep";
    }
    return payload?.[patchKey] ? "patch" : "replace";
  }
  if (payload && Object.prototype.hasOwnProperty.call(payload, String(patchKey))) {
    return "patch";
  }
  if (payload && Object.prototype.hasOwnProperty.call(payload, String(replaceKey))) {
    return "replace";
  }
  return "keep";
}
function getResourceFieldIds(resource, fieldName) {
  if (!Array.isArray(resource?.[fieldName])) {
    return [];
  }
  return resource[fieldName].map((item) => item.id);
}
function resolveNextResourceDraftSync(db, resource, payload, dirtyFields) {
  const hasRealityField = dirtyFields.size ? dirtyFields.has("reality") : payload && Object.prototype.hasOwnProperty.call(payload, "reality");
  const requestedCharacterUniverses = normalizeCharacterUniverseAssignments(payload?.characterUniverses);
  const requestedReality = hasRealityField ? normalizeBooruReality(payload?.reality) : resource.reality;
  const authorMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "authors", "authorIds", "authorPatch");
  const artistMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "artists", "artistIds", "artistPatch");
  const characterMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "characters", "characterIds", "characterPatch");
  const universeMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "universes", "universeIds", "universePatch");
  const tagMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "manualTags", "tagIds", "tagPatch");
  const currentAuthorIds = getResourceFieldIds(resource, "authors");
  const currentArtistIds = getResourceFieldIds(resource, "artists");
  const currentCharacterIds = getResourceFieldIds(resource, "characters");
  const currentUniverseIds = getResourceFieldIds(resource, "directUniverses");
  const currentTagIds = getResourceFieldIds(resource, "manualTags");
  const authorIds = authorMode === "replace" ? uniqueBooruIds(payload?.authorIds) : authorMode === "patch" ? applyIdsPatch(currentAuthorIds, normalizeAssignmentPatch(payload?.authorPatch)) : currentAuthorIds;
  const artistIds = artistMode === "replace" ? uniqueBooruIds(payload?.artistIds) : artistMode === "patch" ? applyIdsPatch(currentArtistIds, normalizeAssignmentPatch(payload?.artistPatch)) : currentArtistIds;
  const characterIds = characterMode === "replace" ? uniqueBooruIds(payload?.characterIds) : characterMode === "patch" ? applyIdsPatch(currentCharacterIds, normalizeAssignmentPatch(payload?.characterPatch)) : currentCharacterIds;
  const universeIds = universeMode === "replace" ? uniqueBooruIds(payload?.universeIds) : universeMode === "patch" ? applyIdsPatch(currentUniverseIds, normalizeAssignmentPatch(payload?.universePatch)) : currentUniverseIds;
  const tagIds = tagMode === "replace" ? uniqueBooruIds(payload?.tagIds) : tagMode === "patch" ? applyIdsPatch(currentTagIds, normalizeAssignmentPatch(payload?.tagPatch)) : currentTagIds;
  assertValidEntityIdsSync(db, "author", authorIds);
  assertValidEntityIdsSync(db, "artist", artistIds);
  assertValidEntityIdsSync(db, "character", characterIds);
  assertValidEntityIdsSync(db, "universe", universeIds);
  assertValidTagIdsSync(db, tagIds);
  requestedCharacterUniverses.forEach(({ characterId, universeId }) => {
    if (!findEntityByIdSync(db, "character", characterId)) {
      throw new Error("Uno de los characters seleccionados ya no existe.");
    }
    if (!findEntityByIdSync(db, "universe", universeId)) {
      throw new Error("Uno de los universes seleccionados ya no existe.");
    }
  });
  const requestedCharacterUniverseMap = new Map(
    requestedCharacterUniverses.map((assignment) => [assignment.characterId, assignment.universeId])
  );
  const characterRecords = characterIds.map((characterId) => {
    const baseCharacter = getLinkedEntityRecordByIdSync(db, "character", characterId);
    if (!baseCharacter) {
      throw new Error("Uno de los characters seleccionados ya no existe.");
    }
    const assignedUniverseId = requestedCharacterUniverseMap.get(characterId);
    const assignedUniverse = assignedUniverseId ? getLinkedEntityRecordByIdSync(db, "universe", assignedUniverseId) : null;
    return {
      ...baseCharacter,
      universe: assignedUniverse || getCharacterUniverseRecordSync(db, characterId)
    };
  });
  const realityPolicy = resolveBooruReality({
    reality: requestedReality,
    realitySource: resource.realitySource,
    realityWasEdited: Boolean(hasRealityField),
    authors: authorIds,
    artists: artistIds,
    characters: characterIds,
    universes: universeIds
  });
  const reality = realityPolicy.reality;
  return {
    resourceId: resource.id,
    reality,
    realitySource: realityPolicy.source,
    authorIds,
    artistIds,
    characterIds,
    universeIds,
    tagIds,
    requestedCharacterUniverses,
    characterRecords,
    classificationState: getDerivedClassificationStateSync(
      reality,
      authorIds,
      artistIds,
      characterRecords,
      universeIds
    ),
    dirtyFields
  };
}
function assertBasicClassificationCompleteSync(nextDraft) {
  const essential = getBooruEssentialState({
    reality: nextDraft.reality,
    authors: nextDraft.authorIds,
    artists: nextDraft.artistIds,
    characters: nextDraft.characterRecords,
    universes: nextDraft.universeIds
  });
  if (essential.missing.includes("reality")) {
    throw new Error("Debes elegir si el recurso es real o ficticio.");
  }
  if (essential.missing.includes("author")) {
    throw new Error("Un recurso real necesita al menos una Persona.");
  }
  if (essential.missing.includes("character")) {
    throw new Error("Un recurso ficticio necesita al menos un Character.");
  }
  if (essential.missing.includes("universe")) {
    throw new Error("Cada character de un recurso ficticio necesita universe.");
  }
  if (essential.missing.includes("artist")) {
    throw new Error("Un recurso ficticio necesita al menos un Artist.");
  }
}
function saveResourcesSync(db, payload, { requireBasicClassification = false } = {}) {
  const explicitResourceId = normalizeBooruOptionalText(payload?.resourceId);
  const resourceIds = uniqueBooruIds([
    explicitResourceId,
    ...Array.isArray(payload?.resourceIds) ? payload.resourceIds : []
  ]);
  if (!resourceIds.length) {
    throw new Error("resourceId es obligatorio.");
  }
  const dirtyFields = normalizeDirtyFields(payload?.dirtyFields);
  const resources = resourceIds.map((resourceId) => {
    const resource = getResourceByIdSync(db, resourceId);
    if (!resource) {
      throw new Error("No se encontro uno de los recursos que quieres actualizar.");
    }
    if (resource.classificationState === "duplicate-review") {
      throw new Error("Los duplicados exactos no se editan desde este flujo.");
    }
    if (resource.trashedAt) {
      throw new Error("Los recursos en papelera deben restaurarse antes de editarse.");
    }
    return resource;
  });
  const nextDrafts = resources.map((resource) => resolveNextResourceDraftSync(db, resource, payload, dirtyFields));
  if (requireBasicClassification) {
    nextDrafts.forEach(assertBasicClassificationCompleteSync);
  }
  withTransaction(db, () => {
    const requestedCharacterUniverses = normalizeCharacterUniverseAssignments(payload?.characterUniverses);
    requestedCharacterUniverses.forEach(({ characterId, universeId }) => {
      replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
    });
    nextDrafts.forEach((nextDraft) => {
      const dirtyFieldSet = nextDraft.dirtyFields;
      const shouldWriteEverything = !dirtyFieldSet.size;
      if (shouldWriteEverything || dirtyFieldSet.has("authors")) {
        replaceResourceEntityAssignmentsSync(db, "author", nextDraft.resourceId, nextDraft.authorIds);
      }
      if (shouldWriteEverything || dirtyFieldSet.has("artists")) {
        replaceResourceEntityAssignmentsSync(db, "artist", nextDraft.resourceId, nextDraft.artistIds);
      }
      if (shouldWriteEverything || dirtyFieldSet.has("characters")) {
        replaceResourceEntityAssignmentsSync(db, "character", nextDraft.resourceId, nextDraft.characterIds);
      }
      if (shouldWriteEverything || dirtyFieldSet.has("universes")) {
        replaceResourceUniverseAssignmentsSync(db, nextDraft.resourceId, nextDraft.universeIds);
      }
      if (shouldWriteEverything || dirtyFieldSet.has("manualTags")) {
        replaceResourceTagAssignmentsSync(db, nextDraft.resourceId, nextDraft.tagIds);
      }
      syncResourceInheritanceSync(db, nextDraft.resourceId);
      db.prepare(`
        UPDATE booru_resources
        SET reality = ?, reality_source = ?, classification_state = ?, last_seen_at = ?
        WHERE id = ?
      `).run(
        nextDraft.reality,
        nextDraft.realitySource,
        nextDraft.classificationState,
        nowIso(),
        nextDraft.resourceId
      );
      reconcileResourceClassificationSync(db, nextDraft.resourceId);
    });
  });
  const refreshedResources = resourceIds.map((resourceId) => getResourceByIdSync(db, resourceId)).filter(Boolean);
  return refreshedResources.length === 1 ? refreshedResources[0] : refreshedResources;
}
function saveResourceMetadataSync(db, payload) {
  return saveResourcesSync(db, payload, { requireBasicClassification: false });
}
function saveBasicClassificationSync(db, payload) {
  return saveResourcesSync(db, payload, { requireBasicClassification: true });
}
function quickAssignEntitySync(db, payload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds, payload?.resourceId);
  const kind = normalizeBooruText(payload?.kind);
  const entityId = normalizeBooruOptionalText(payload?.entityId);
  if (!resourceIds.length || !entityId) {
    throw new Error("resourceId/resourceIds y entityId son obligatorios.");
  }
  if (kind !== "author" && kind !== "artist" && kind !== "character" && kind !== "universe") {
    throw new Error("El tipo de asignacion rapida no existe en Booru.");
  }
  if (!findEntityByIdSync(db, kind, entityId)) {
    throw new Error("La entidad objetivo ya no existe.");
  }
  const resources = resourceIds.map((resourceId) => {
    const resource = getResourceByIdSync(db, resourceId);
    if (!resource) {
      throw new Error("No se encontro uno de los recursos que quieres actualizar.");
    }
    if (resource.classificationState === "duplicate-review") {
      throw new Error("Los duplicados exactos no se editan desde este flujo.");
    }
    if (resource.trashedAt) {
      throw new Error("Los recursos en papelera deben restaurarse antes de editarse.");
    }
    return resource;
  });
  const updatedResources = resources.map((resource) => {
    if (kind === "author") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        dirtyFields: ["authors"],
        authorPatch: { addIds: [entityId] }
      });
    }
    if (kind === "artist") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        dirtyFields: ["artists"],
        artistPatch: { addIds: [entityId] }
      });
    }
    if (kind === "universe") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        dirtyFields: ["universes"],
        universePatch: { addIds: [entityId] }
      });
    }
    return saveResourceMetadataSync(db, {
      resourceId: resource.id,
      dirtyFields: ["characters"],
      characterPatch: { addIds: [entityId] }
    });
  }).flatMap((resourceValue) => Array.isArray(resourceValue) ? resourceValue : [resourceValue]);
  return updatedResources.length === 1 ? updatedResources[0] : updatedResources;
}
async function pasteClipboardImageToEntitySync(ctx, db, payload) {
  const kind = normalizeBooruText(payload?.kind);
  const entityId = normalizeBooruText(payload?.entityId);
  const tempFilePath = assertClipboardTempFilePath(payload?.tempFilePath);
  if (!ENTITY_TABLES[kind]) {
    throw new Error("El tipo de entidad solicitado no existe en Booru.");
  }
  if (!entityId) {
    throw new Error("La entidad solicitada no es valida.");
  }
  if (!findEntityByIdSync(db, kind, entityId)) {
    throw new Error("La entidad objetivo ya no existe.");
  }
  try {
    const ingestResult = await ingestFile(ctx, tempFilePath, {
      updateWatcherState: false,
      sourcePathOverride: "clipboard://image",
      originalFilenameOverride: buildClipboardImportedFilename()
    });
    if (!ingestResult?.resource?.id) {
      throw new Error("No se pudo importar la imagen del portapapeles a Booru.");
    }
    const resource = quickAssignEntitySync(db, {
      resourceId: ingestResult.resource.id,
      kind,
      entityId
    });
    const profile = getEntityProfileSync(db, kind, entityId);
    if (!profile) {
      throw new Error("No se pudo reconstruir el perfil despues del pegado.");
    }
    return {
      profile,
      resource,
      reusedCanonical: ingestResult.reusedCanonical,
      createdResourceId: ingestResult.createdResourceId,
      reason: ingestResult.reason,
      updatedResourceIds: ingestResult.updatedResourceIds,
      createdResourceIds: ingestResult.createdResourceIds
    };
  } finally {
    await removeFileIfExists(tempFilePath);
  }
}
function resolveClipboardAssociationsSync(db, payload) {
  const candidates = Array.isArray(payload?.associations) && payload.associations.length ? payload.associations : [payload?.association && typeof payload.association === "object" ? payload.association : payload];
  const resolved = [];
  const seen = /* @__PURE__ */ new Set();
  candidates.forEach((association) => {
    const kind = normalizeBooruText(association?.kind);
    let entityId = normalizeBooruText(association?.entityId);
    if (kind !== "tag" && !ENTITY_TABLES[kind]) {
      throw new Error("Eleg\xED una entidad v\xE1lida para asociar el recurso.");
    }
    if (!entityId) {
      const entityName = normalizeBooruText(association?.entityName);
      if (!entityName) throw new Error("Escrib\xED o eleg\xED una entidad antes de pegar.");
      if (kind === "tag") {
        entityId = String(ensureTagSync(db, entityName)?.tag?.id || "");
      } else if (kind === "character") {
        let universeId = normalizeBooruText(association?.universeId);
        if (!universeId) {
          const universeName = normalizeBooruText(association?.universeName);
          if (!universeName) throw new Error("Un Character necesita un Universe.");
          universeId = String(ensureTypedEntitySync(db, "universe", universeName)?.entity?.id || "");
        }
        entityId = String(ensureCharacterInUniverseSync(db, { name: entityName, universeId })?.entity?.id || "");
      } else {
        entityId = String(ensureTypedEntitySync(db, kind, entityName)?.entity?.id || "");
      }
    }
    const targetExists = kind === "tag" ? findTagByIdSync(db, entityId) : findEntityByIdSync(db, kind, entityId);
    if (!entityId || !targetExists) throw new Error("Una de las asociaciones objetivo ya no existe.");
    const identity = `${kind}:${entityId}`;
    if (seen.has(identity)) return;
    seen.add(identity);
    resolved.push({ kind, entityId });
  });
  if (!resolved.length) throw new Error("Eleg\xED al menos una asociaci\xF3n antes de pegar.");
  return resolved;
}
function mergeClipboardAssociationsIntoResourceSync(db, resourceId, associations) {
  const idsByKind = /* @__PURE__ */ new Map();
  associations.forEach(({ kind, entityId }) => {
    idsByKind.set(kind, [...idsByKind.get(kind) || [], entityId]);
  });
  return saveResourceMetadataSync(db, {
    resourceId,
    dirtyFields: [
      ...idsByKind.has("author") ? ["authors"] : [],
      ...idsByKind.has("artist") ? ["artists"] : [],
      ...idsByKind.has("character") ? ["characters"] : [],
      ...idsByKind.has("universe") ? ["universes"] : [],
      ...idsByKind.has("tag") ? ["manualTags"] : []
    ],
    authorPatch: { addIds: idsByKind.get("author") || [] },
    artistPatch: { addIds: idsByKind.get("artist") || [] },
    characterPatch: { addIds: idsByKind.get("character") || [] },
    universePatch: { addIds: idsByKind.get("universe") || [] },
    tagPatch: { addIds: idsByKind.get("tag") || [] }
  });
}
async function pasteClipboardMediaSync(ctx, db, payload) {
  const tempFilePath = assertClipboardTempFilePath(payload?.tempFilePath);
  const associations = resolveClipboardAssociationsSync(db, payload);
  try {
    const ingestResult = await ingestFile(ctx, tempFilePath, {
      updateWatcherState: false,
      sourcePathOverride: "clipboard://image",
      originalFilenameOverride: buildClipboardImportedFilename()
    });
    if (!ingestResult?.resource?.id) {
      throw new Error("No se pudo importar el recurso del portapapeles a Booru.");
    }
    const resource = mergeClipboardAssociationsIntoResourceSync(db, ingestResult.resource.id, associations);
    const profileAssociation = associations.find((association) => association.kind !== "tag") || null;
    return {
      profile: profileAssociation ? getEntityProfileSync(db, profileAssociation.kind, profileAssociation.entityId) : null,
      resource,
      associations,
      reusedCanonical: ingestResult.reusedCanonical,
      createdResourceId: ingestResult.createdResourceId,
      reason: ingestResult.reason,
      updatedResourceIds: ingestResult.updatedResourceIds,
      createdResourceIds: ingestResult.createdResourceIds
    };
  } finally {
    await removeFileIfExists(tempFilePath);
  }
}
function normalizeRequestedResourceIds(value, fallbackResourceId = null) {
  return uniqueBooruIds([
    normalizeBooruOptionalText(fallbackResourceId),
    ...Array.isArray(value) ? value : []
  ]);
}
function trashResourcesSync(db, payload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds);
  if (!resourceIds.length) {
    throw new Error("Necesitas al menos un recurso para enviarlo a la papelera.");
  }
  const trashedAt = nowIso();
  withTransaction(db, () => {
    const updateStatement = db.prepare(`
      UPDATE booru_resources
      SET trashed_at = ?, last_seen_at = ?
      WHERE id = ?
    `);
    resourceIds.forEach((resourceId) => {
      const resource = getResourceByIdSync(db, resourceId);
      if (!resource) {
        throw new Error("Uno de los recursos seleccionados ya no existe.");
      }
      updateStatement.run(trashedAt, trashedAt, resourceId);
    });
  });
  return resourceIds.map((resourceId) => getResourceByIdSync(db, resourceId)).filter(Boolean);
}
function restoreResourcesSync(db, payload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds);
  if (!resourceIds.length) {
    throw new Error("Necesitas al menos un recurso para restaurarlo.");
  }
  withTransaction(db, () => {
    const updateStatement = db.prepare(`
      UPDATE booru_resources
      SET trashed_at = NULL, last_seen_at = ?
      WHERE id = ?
    `);
    resourceIds.forEach((resourceId) => {
      const resource = getResourceByIdSync(db, resourceId);
      if (!resource) {
        throw new Error("Uno de los recursos seleccionados ya no existe.");
      }
      updateStatement.run(nowIso(), resourceId);
    });
  });
  return resourceIds.map((resourceId) => getResourceByIdSync(db, resourceId)).filter(Boolean);
}
async function purgeResourcesSync(db, payload) {
  const resourceIds = normalizeRequestedResourceIds(payload?.resourceIds);
  if (!resourceIds.length) {
    throw new Error("Necesitas al menos un recurso para purgarlo.");
  }
  const resources = resourceIds.map((resourceId) => {
    const resource = getResourceByIdSync(db, resourceId);
    if (!resource) {
      throw new Error("Uno de los recursos seleccionados ya no existe.");
    }
    return {
      resource,
      thumbnailRow: getThumbnailRowSync(db, resourceId)
    };
  });
  withTransaction(db, () => {
    const deleteStatement = db.prepare(`
      DELETE FROM booru_resources
      WHERE id = ?
    `);
    resourceIds.forEach((resourceId) => {
      deleteStatement.run(resourceId);
    });
  });
  await Promise.all(resources.map(async ({ resource, thumbnailRow }) => {
    const normalizedPath = normalizeBooruOptionalText(resource?.storagePath);
    if (!normalizedPath) {
      return;
    }
    try {
      await import_promises4.default.unlink(normalizedPath);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
    const explicitThumbnailPath = normalizeBooruOptionalText(thumbnailRow?.storage_path);
    const outputPaths = runtimeState?.thumbsRoot ? getThumbnailOutputPaths(runtimeState.thumbsRoot, resource.id) : null;
    const thumbnailPaths = /* @__PURE__ */ new Set();
    if (explicitThumbnailPath) {
      thumbnailPaths.add(explicitThumbnailPath);
    }
    if (outputPaths?.webpPath) {
      thumbnailPaths.add(outputPaths.webpPath);
    }
    if (outputPaths?.jpegPath) {
      thumbnailPaths.add(outputPaths.jpegPath);
    }
    await Promise.all(Array.from(thumbnailPaths).map((filePath) => removeFileIfExists(filePath)));
  }));
  if (runtimeState) {
    const trashedIds = new Set(resourceIds);
    runtimeState.thumbnailHighPriorityIds = runtimeState.thumbnailHighPriorityIds.filter((resourceId) => !trashedIds.has(resourceId));
    runtimeState.thumbnailLowPriorityIds = runtimeState.thumbnailLowPriorityIds.filter((resourceId) => !trashedIds.has(resourceId));
    resourceIds.forEach((resourceId) => {
      runtimeState?.thumbnailQueuedIds.delete(resourceId);
    });
  }
  return {
    purgedIds: resourceIds
  };
}
function resolveBraveExecutableCandidatePaths() {
  return [
    process.env.LOCALAPPDATA ? import_node_path2.default.join(process.env.LOCALAPPDATA, "BraveSoftware", "Brave-Browser", "Application", "brave.exe") : "",
    process.env.PROGRAMFILES ? import_node_path2.default.join(process.env.PROGRAMFILES, "BraveSoftware", "Brave-Browser", "Application", "brave.exe") : "",
    process.env["PROGRAMFILES(X86)"] ? import_node_path2.default.join(process.env["PROGRAMFILES(X86)"], "BraveSoftware", "Brave-Browser", "Application", "brave.exe") : "",
    "brave.exe"
  ].filter(Boolean);
}
async function openResourceInBraveSync(db, payload) {
  const resourceId = normalizeBooruOptionalText(payload?.resourceId);
  if (!resourceId) {
    throw new Error("resourceId es obligatorio.");
  }
  const resource = getResourceByIdSync(db, resourceId);
  if (!resource) {
    throw new Error("No se encontro el recurso solicitado.");
  }
  if (resource.mediaKind !== "image" && resource.mediaKind !== "gif") {
    throw new Error("Buscar en Google solo esta disponible para imagenes o GIF.");
  }
  const normalizedStoragePath = normalizeBooruOptionalText(resource.storagePath);
  if (!normalizedStoragePath || !import_node_fs3.default.existsSync(normalizedStoragePath)) {
    throw new Error("No se encontro el archivo que quieres abrir en Brave.");
  }
  const fileUrl = encodeURI(`file:///${normalizedStoragePath.replace(/\\/g, "/")}`);
  const spawnErrors = [];
  for (const executablePath of resolveBraveExecutableCandidatePaths()) {
    try {
      const child = (0, import_node_child_process.spawn)(
        executablePath,
        [`--profile-directory=${BRAVE_PROFILE_DIRECTORY}`, fileUrl],
        {
          detached: true,
          stdio: "ignore",
          windowsHide: true
        }
      );
      child.unref();
      return {
        executablePath,
        fileUrl
      };
    } catch (error) {
      spawnErrors.push(error?.message || String(error));
    }
  }
  throw new Error(
    `No se pudo abrir Brave con el perfil ${BRAVE_PROFILE_DIRECTORY}. ${spawnErrors.join(" | ")}`.trim()
  );
}
function addResourceEntityAssignmentSync(db, resourceId, kind, entityId) {
  const relationTable = kind === "universe" ? "booru_resource_universes" : getResourceRelationTable(kind);
  const relationEntityIdColumn = kind === "universe" ? "universe_id" : getResourceRelationEntityIdColumn(kind);
  if (!relationTable || !relationEntityIdColumn) throw new Error("El tipo de clasificacion rapida no existe.");
  db.prepare(`
    INSERT OR IGNORE INTO ${relationTable} (
      resource_id,
      ${relationEntityIdColumn},
      sort_order,
      created_at
    ) VALUES (
      ?, ?,
      COALESCE((SELECT MAX(sort_order) + 1 FROM ${relationTable} WHERE resource_id = ?), 0),
      ?
    )
  `).run(resourceId, entityId, resourceId, nowIso());
  if (kind === "universe") {
    db.prepare(`DELETE FROM booru_resource_universe_exclusions WHERE resource_id = ? AND universe_id = ?`).run(resourceId, entityId);
  }
}
function reintegrateCanonicalResourceSync(db, resourceId, importedAt, fastTarget = null) {
  const canonical = getResourceByIdSync(db, resourceId);
  if (!canonical || canonical.classificationState === "duplicate-review" || canonical.trashedAt) {
    throw new Error("No se pudo reintegrar el recurso canonico detectado en Booru.");
  }
  withTransaction(db, () => {
    db.prepare(`
      UPDATE booru_resources
      SET imported_at = ?, last_seen_at = ?
      WHERE id = ?
    `).run(importedAt, importedAt, resourceId);
    if (fastTarget && findEntityByIdSync(db, fastTarget.kind, fastTarget.entityId)) {
      addResourceEntityAssignmentSync(db, resourceId, fastTarget.kind, fastTarget.entityId);
    }
    syncResourceInheritanceSync(db, resourceId);
    reconcileResourceClassificationSync(db, resourceId);
  });
  return getResourceByIdSync(db, resourceId);
}
async function ingestHashedFile(state, absoluteFilePath, mediaDescriptor, contentHash, options) {
  assertRuntimeStateCurrent(state);
  const canonicalResource = getCanonicalResourceByHash(state.db, contentHash);
  const importedAt = nowIso();
  const originalFilename = String(
    options.originalFilenameOverride || import_node_path2.default.basename(absoluteFilePath)
  ).trim() || import_node_path2.default.basename(absoluteFilePath);
  const updateWatcherState = options.updateWatcherState !== false;
  if (canonicalResource) {
    const canonicalId = String(canonicalResource.id || "");
    const reusedResource = reintegrateCanonicalResourceSync(
      state.db,
      canonicalId,
      importedAt,
      state.fastClassification
    );
    if (!reusedResource) throw new Error("No se pudo reutilizar el recurso canonico detectado en Booru.");
    if (import_node_path2.default.resolve(reusedResource.storagePath) !== absoluteFilePath) {
      await removeFileIfExists(absoluteFilePath);
      assertRuntimeStateCurrent(state);
    }
    if (updateWatcherState) {
      state.watcherState.lastIngestedAt = importedAt;
      state.watcherState.lastIngestedOriginalFilename = originalFilename;
      state.watcherState.lastIngestedStoragePath = reusedResource.storagePath;
      state.watcherState.lastError = "";
    }
    queueThumbnailGeneration([canonicalId], "high");
    scheduleRuntimeInvalidationForState(state, "resourcesVersion", "entitiesVersion", "watcherVersion");
    return createBooruIngestMutation({ resource: reusedResource, reusedCanonical: true });
  }
  const resourceId = import_node_crypto.default.randomUUID();
  const storageFilename = `${resourceId}${mediaDescriptor.extension}`;
  const storagePath = import_node_path2.default.join(state.mediaRoot, storageFilename);
  const sourcePath = options.sourcePathOverride === void 0 ? absoluteFilePath : options.sourcePathOverride || null;
  await moveFile(absoluteFilePath, storagePath);
  assertRuntimeStateCurrent(state);
  const fileStat = await import_promises4.default.stat(storagePath);
  assertRuntimeStateCurrent(state);
  state.db.prepare(`
    INSERT INTO booru_resources (
      id, storage_filename, storage_path, original_filename, extension, mime_type,
      media_kind, file_size, width, height, duration_ms, content_hash, reality,
      classification_state, canonical_resource_id, source_path, media_info_status,
      media_info_error, imported_at, last_seen_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    resourceId,
    storageFilename,
    storagePath,
    originalFilename,
    mediaDescriptor.extension,
    mediaDescriptor.mimeType,
    mediaDescriptor.mediaKind,
    Number(fileStat.size || 0),
    null,
    null,
    null,
    contentHash,
    null,
    "unclassified",
    null,
    sourcePath,
    "pending",
    null,
    importedAt,
    importedAt
  );
  ensureThumbnailPendingRowSync(state.db, resourceId, contentHash);
  const fastTarget = state.fastClassification;
  if (fastTarget && findEntityByIdSync(state.db, fastTarget.kind, fastTarget.entityId)) {
    quickAssignEntitySync(state.db, {
      resourceId,
      kind: fastTarget.kind,
      entityId: fastTarget.entityId
    });
  }
  if (updateWatcherState) {
    state.watcherState.lastIngestedAt = importedAt;
    state.watcherState.lastIngestedOriginalFilename = originalFilename;
    state.watcherState.lastIngestedStoragePath = storagePath;
    state.watcherState.lastError = "";
  }
  queueThumbnailGeneration([resourceId], "high");
  scheduleRuntimeInvalidationForState(state, "resourcesVersion", "entitiesVersion", "watcherVersion");
  return createBooruIngestMutation({
    resource: getResourceByIdSync(state.db, resourceId),
    createdResourceId: resourceId
  });
}
async function ingestFile(ctx, filePath, options = {}) {
  const state = runtimeState;
  if (!state || !state.db) {
    return null;
  }
  const absoluteFilePath = import_node_path2.default.resolve(filePath);
  const mediaDescriptor = resolveMediaDescriptor(absoluteFilePath);
  if (!mediaDescriptor) {
    return null;
  }
  if (!import_node_fs3.default.existsSync(absoluteFilePath)) {
    return null;
  }
  const contentHash = await computeFileHash(absoluteFilePath);
  assertRuntimeStateCurrent(state);
  return state.ingestByContentHash(contentHash, () => ingestHashedFile(
    state,
    absoluteFilePath,
    mediaDescriptor,
    contentHash,
    options
  ));
}
function queueIngest(ctx, filePath) {
  const state = runtimeState;
  if (!isRuntimeStateActive(state)) {
    return;
  }
  const absoluteFilePath = import_node_path2.default.resolve(String(filePath || ""));
  if (!absoluteFilePath || state.queuedPaths.has(absoluteFilePath)) {
    return;
  }
  state.queuedPaths.add(absoluteFilePath);
  state.watcherState.pendingCount += 1;
  if (!state.ingestTaskActive) {
    state.ingestTaskActive = true;
    state.ingestTaskTotal = 0;
    state.ingestTaskCompleted = 0;
    state.ingestTaskFailed = 0;
    state.ctx.tasks.start({
      id: "booru.ingest",
      title: "Importando medios",
      detail: "Preparando archivos de Booru",
      progress: {
        current: 0,
        total: 1,
        label: "archivos"
      }
    });
  }
  state.ingestTaskTotal += 1;
  state.ctx.tasks.update("booru.ingest", {
    detail: `${state.watcherState.pendingCount} ${state.watcherState.pendingCount === 1 ? "archivo pendiente" : "archivos pendientes"}`,
    progress: {
      current: state.ingestTaskCompleted + state.ingestTaskFailed,
      total: state.ingestTaskTotal,
      label: "archivos"
    }
  });
  scheduleRuntimeInvalidationForState(state, "watcherVersion");
  let ingestFailed = false;
  state.queue = state.queue.then(() => {
    assertRuntimeStateActive(state);
    return ingestFile(ctx, absoluteFilePath);
  }).catch((error) => {
    if (isRuntimeCancellation(error) || !isRuntimeStateActive(state)) {
      return;
    }
    state.watcherState.lastError = error instanceof Error ? error.message : "No se pudo ingerir el archivo.";
    ingestFailed = true;
    state.ingestTaskFailed += 1;
    state.ctx.tasks.update("booru.ingest", {
      detail: state.watcherState.lastError,
      progress: {
        current: state.ingestTaskCompleted + state.ingestTaskFailed,
        total: state.ingestTaskTotal,
        label: "archivos"
      }
    });
    state.ctx.tasks.fail("booru.ingest", {
      message: "No se pudieron importar todos los medios.",
      detail: state.watcherState.lastError
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
  }).finally(() => {
    if (!ingestFailed) {
      state.ingestTaskCompleted += 1;
    }
    state.queuedPaths.delete(absoluteFilePath);
    state.watcherState.pendingCount = Math.max(0, state.watcherState.pendingCount - 1);
    state.ctx.tasks.update("booru.ingest", {
      detail: state.watcherState.pendingCount > 0 ? `${state.watcherState.pendingCount} ${state.watcherState.pendingCount === 1 ? "archivo pendiente" : "archivos pendientes"}` : state.ingestTaskFailed > 0 ? `${state.ingestTaskFailed} ${state.ingestTaskFailed === 1 ? "archivo con error" : "archivos con error"}` : "Finalizando importaci\xF3n",
      progress: {
        current: state.ingestTaskCompleted + state.ingestTaskFailed,
        total: state.ingestTaskTotal,
        label: "archivos"
      }
    });
    if (state.watcherState.pendingCount === 0) {
      if (state.ingestTaskFailed === 0) {
        state.ctx.tasks.complete("booru.ingest");
      }
      state.ingestTaskActive = false;
    }
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
  });
}
async function stopWatcher(state = runtimeState) {
  if (!state?.watcher) {
    if (state) {
      state.watcherState.active = false;
      state.watcherState.stage = "idle";
      scheduleRuntimeInvalidationForState(state, "watcherVersion");
    }
    return;
  }
  await state.watcher.close();
  state.watcher = null;
  state.watcherState.active = false;
  state.watcherState.stage = "idle";
  scheduleRuntimeInvalidationForState(state, "watcherVersion");
}
async function restartWatcher(state, ctx, settingsValue) {
  if (!isRuntimeStateActive(state)) {
    return;
  }
  await stopWatcher(state);
  assertRuntimeStateActive(state);
  state.python = resolvePythonStatus(settingsValue);
  state.watcherState.watchedPath = readBooruWatchFolderPath(settingsValue);
  state.watcherState.lastError = "";
  const watchFolderPath = readBooruWatchFolderPath(settingsValue);
  if (!watchFolderPath) {
    state.watcherState.stage = "idle-no-folder";
    state.ctx.tasks.complete("booru.watcher");
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }
  if (!state.python.available) {
    state.watcherState.stage = "blocked-python";
    state.watcherState.lastError = state.python.error || "No se encontro Python para Booru. Configura pythonExecutable o asegurate de que python este disponible en PATH.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "Booru no puede vigilar la carpeta.",
      detail: state.watcherState.lastError
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }
  if (!import_node_fs3.default.existsSync(watchFolderPath) || !import_node_fs3.default.statSync(watchFolderPath).isDirectory()) {
    state.watcherState.stage = "blocked-folder";
    state.watcherState.lastError = "La carpeta vigilada no existe o no es una carpeta valida.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "Booru no puede vigilar la carpeta.",
      detail: state.watcherState.lastError
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }
  if (watchFolderPath.startsWith(state.storageRoot)) {
    state.watcherState.stage = "blocked-folder";
    state.watcherState.lastError = "La carpeta vigilada no puede apuntar al storage interno de Booru.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "Booru no puede vigilar la carpeta.",
      detail: state.watcherState.lastError
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
    return;
  }
  state.watcherState.stage = "starting";
  scheduleRuntimeInvalidationForState(state, "watcherVersion");
  state.watcher = chokidar_default.watch(watchFolderPath, {
    ignoreInitial: false,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 1500,
      pollInterval: 150
    }
  });
  state.watcher.on("add", (addedPath) => {
    if (isRuntimeStateActive(state)) {
      queueIngest(ctx, addedPath);
    }
  });
  state.watcher.on("ready", () => {
    if (!isRuntimeStateActive(state)) {
      return;
    }
    state.watcherState.active = true;
    state.watcherState.stage = "watching";
    state.ctx.tasks.complete("booru.watcher");
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
  });
  state.watcher.on("error", (error) => {
    if (!isRuntimeStateActive(state)) {
      return;
    }
    state.watcherState.active = false;
    state.watcherState.stage = "error";
    state.watcherState.lastError = error instanceof Error ? error.message : "Error en el watcher de Booru.";
    state.ctx.tasks.start({
      id: "booru.watcher",
      title: "Watcher de Booru",
      detail: state.watcherState.lastError
    });
    state.ctx.tasks.fail("booru.watcher", {
      message: "El watcher de Booru se detuvo.",
      detail: state.watcherState.lastError
    });
    scheduleRuntimeInvalidationForState(state, "watcherVersion");
  });
}
async function rescanWatchFolder(ctx, settingsValue) {
  const state = runtimeState;
  const watchFolderPath = readBooruWatchFolderPath(settingsValue);
  if (!state || !watchFolderPath || !import_node_fs3.default.existsSync(watchFolderPath)) {
    return;
  }
  const entries = await import_promises4.default.readdir(watchFolderPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    queueIngest(ctx, import_node_path2.default.join(watchFolderPath, entry.name));
  }
}
function assertRuntimeDb() {
  const db = runtimeState?.db;
  if (!db) {
    throw new Error("Booru todavia no inicializo su catalogo interno.");
  }
  return db;
}
async function drainRuntimeBackgroundWork(state) {
  state.abortController.abort();
  state.thumbnailHighPriorityIds = [];
  state.thumbnailLowPriorityIds = [];
  state.thumbnailQueuedIds.clear();
  state.fastClassification = null;
  if (state.invalidationTimer) {
    clearTimeout(state.invalidationTimer);
    state.invalidationTimer = null;
  }
  state.pendingInvalidations.clear();
  await stopWatcher(state);
  await Promise.allSettled([state.queue]);
  while (state.backgroundTasks.size) {
    await Promise.allSettled([...state.backgroundTasks]);
  }
  for (const child of state.childProcesses) {
    try {
      child.kill();
    } catch {
    }
  }
  state.childProcesses.clear();
  state.thumbnailProcessingIds.clear();
  state.queuedPaths.clear();
  state.watcherState.pendingCount = 0;
}
async function shutdownRuntimeState(state) {
  if (state.shuttingDown) {
    return;
  }
  const startedAt = performance.now();
  state.shuttingDown = true;
  await drainRuntimeBackgroundWork(state);
  const db = state.db;
  state.db = null;
  db?.close();
  if (runtimeState === state) {
    runtimeState = null;
  }
  booruBackendLogger.info(
    "booru.runtime.shutdown.done",
    "Booru cerro su runtime despues de drenar trabajos asincronos.",
    {
      generation: state.generation,
      durationMs: Number((performance.now() - startedAt).toFixed(2))
    }
  );
}
var booruPlugin = {
  async ensureSchema(ctx) {
    const storagePaths = getStoragePaths(ctx);
    await ensureStoragePaths(storagePaths);
    const db = new import_node_sqlite.DatabaseSync(storagePaths.catalogPath);
    ensureCatalogSchema(db);
    db.close();
  },
  async activate(ctx) {
    const state = createRuntimeState(ctx);
    runtimeState = state;
    await ensureStoragePaths(getStoragePaths(ctx));
    state.db = new import_node_sqlite.DatabaseSync(state.catalogPath);
    ensureCatalogSchema(state.db);
    const applySettings = async (settingsValue) => {
      if (!isRuntimeStateActive(state)) {
        return;
      }
      await restartWatcher(state, ctx, settingsValue);
      if (isRuntimeStateActive(state)) {
        queueThumbnailGeneration(listThumbnailBacklogResourceIdsSync(state.db), "low");
      }
      scheduleRuntimeInvalidationForState(state, "watcherVersion");
    };
    ctx.registerCleanup(async () => {
      await shutdownRuntimeState(state);
    });
    ctx.registerIpc("booru:get-snapshot", async () => {
      const startedAt = performance.now();
      try {
        const snapshot = buildResourcesSnapshot(ctx, await ctx.settings.get());
        const durationMs = Number((performance.now() - startedAt).toFixed(2));
        if (durationMs >= 250) {
          booruBackendLogger.info("booru.snapshot.done", "Snapshot de Booru resuelto en backend.", {
            durationMs,
            watcherStage: String(snapshot?.watcher?.stage || ""),
            watcherPendingCount: Number(snapshot?.watcher?.pendingCount || 0),
            thumbnailActiveCount: Number(snapshot?.derivatives?.activeCount || 0),
            thumbnailBacklogCount: Number(snapshot?.stats?.thumbnailBacklogCount || 0),
            totalCount: Number(snapshot?.stats?.totalCount || 0)
          });
        }
        return createSuccess(snapshot);
      } catch (error) {
        return createError(error, "No se pudo leer el estado actual de Booru.");
      }
    });
    ctx.registerIpc("booru:list-resources", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const result = listResourcesSync(db, payload);
        logBackendDuration(
          "booru.resources.list.done",
          "Booru resolvio una pagina de recursos en backend.",
          performance.now() - startedAt,
          {
            section: result.section,
            query: result.query,
            offset: normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER),
            limit: Math.max(1, normalizePagingNumber(payload?.limit, DEFAULT_RESOURCE_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE)),
            itemCount: result.items.length,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            sampleIds: summarizeIdsForLog(result.items)
          }
        );
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo listar la biblioteca de Booru.");
      }
    });
    ctx.registerIpc("booru:get-resources-by-ids", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const resourceIds = uniqueBooruIds(payload?.resourceIds);
        const items = getResourceRowsByIdsSync(db, resourceIds);
        logBackendDuration(
          "booru.resources.visible-refresh.done",
          "Booru actualizo recursos visibles despues de generar thumbnails.",
          performance.now() - startedAt,
          {
            requestedCount: resourceIds.length,
            itemCount: items.length,
            sampleIds: summarizeIdsForLog(items)
          }
        );
        return createSuccess({ items });
      } catch (error) {
        return createError(error, "No se pudieron actualizar los recursos visibles de Booru.");
      }
    });
    ctx.registerIpc("booru:prime-visible-thumbnails", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const resourceIds = uniqueBooruIds(payload?.resourceIds);
        queueThumbnailGeneration(resourceIds, "high");
        const queuedCount = resourceIds.filter((resourceId) => {
          const resource = getResourceByIdSync(db, resourceId);
          return resource && shouldGenerateThumbnailSync(resource, getThumbnailRowSync(db, resourceId));
        }).length;
        logBackendDuration(
          "booru.thumbnail-prime.done",
          "Booru priorizo thumbnails visibles en backend.",
          performance.now() - startedAt,
          {
            requestedCount: resourceIds.length,
            queuedCount,
            sampleIds: summarizeIdsForLog(resourceIds)
          }
        );
        return createSuccess({
          queuedCount
        });
      } catch (error) {
        return createError(error, "No se pudieron priorizar las thumbnails visibles de Booru.");
      }
    });
    ctx.registerIpc("booru:list-entities", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const kind = normalizeBooruText(payload?.kind);
        const query = normalizeBooruOptionalText(payload?.query);
        if (!ENTITY_TABLES[kind]) {
          throw new Error("El tipo de entidad solicitado no existe en Booru.");
        }
        const allItems = filterEntitiesByExactFiltersSync(db, kind, listEntitiesSync(db, kind, query), payload?.exactFilters);
        const offset = normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER);
        const limit = Math.max(1, normalizePagingNumber(payload?.limit, DEFAULT_RESOURCE_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE));
        const allowUniverseSort = kind === "character";
        const result = createBooruIncrementalBrowseResult(allItems, payload, {
          family: "entity",
          allowUniverseSort,
          offset,
          limit
        });
        logBackendDuration(
          "booru.entities.list.done",
          "Booru resolvio una lista de entidades en backend.",
          performance.now() - startedAt,
          {
            kind,
            query,
            itemCount: result.items.length,
            totalCount: result.totalCount,
            sampleIds: summarizeIdsForLog(result.items)
          }
        );
        return createSuccess({
          kind,
          query,
          ...result
        });
      } catch (error) {
        return createError(error, "No se pudo listar entidades de Booru.");
      }
    });
    ctx.registerIpc("booru:get-entity-profile", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const kind = normalizeBooruText(payload?.kind);
        const entityId = normalizeBooruText(payload?.id);
        if (!ENTITY_TABLES[kind]) {
          throw new Error("El tipo de entidad solicitado no existe en Booru.");
        }
        if (!entityId) {
          throw new Error("Hace falta un id de entidad para abrir el perfil.");
        }
        const profile = getEntityProfileSync(db, kind, entityId);
        if (!profile) {
          throw new Error("La entidad solicitada ya no existe en Booru.");
        }
        logBackendDuration(
          "booru.entity-profile.done",
          "Booru resolvio un perfil de entidad en backend.",
          performance.now() - startedAt,
          {
            kind,
            entityId,
            resourceCount: Number(profile?.resourceCount || 0),
            slug: normalizeBooruOptionalText(profile?.slug)
          }
        );
        return createSuccess(profile);
      } catch (error) {
        return createError(error, "No se pudo cargar el perfil de entidad en Booru.");
      }
    });
    ctx.registerIpc("booru:list-entity-relations", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const result = listEntityRelationsSync(assertRuntimeDb(), payload);
        logBackendDuration(
          "booru.entity-relations.list.done",
          "Booru resolvio relaciones derivadas de un perfil.",
          performance.now() - startedAt,
          {
            sourceKind: result.sourceKind,
            sourceId: result.sourceId,
            relationKind: result.relationKind,
            query: result.query || null,
            itemCount: result.items.length,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            sampleIds: summarizeIdsForLog(result.items)
          }
        );
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudieron cargar las relaciones del perfil.");
      }
    });
    ctx.registerIpc("booru:list-tags", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const query = normalizeBooruOptionalText(payload?.query);
        return createSuccess({
          items: listTagsSync(db, query)
        });
      } catch (error) {
        return createError(error, "No se pudo listar tags de Booru.");
      }
    });
    ctx.registerIpc("booru:list-search-suggestions", async (_event, payload) => {
      try {
        return createSuccess({ items: listSearchSuggestionsSync(assertRuntimeDb(), normalizeBooruOptionalText(payload?.query), payload) });
      } catch (error) {
        return createError(error, "No se pudieron cargar las sugerencias de busqueda.");
      }
    });
    ctx.registerIpc("booru:list-social-platforms", async () => {
      try {
        return createSuccess({ items: listSocialPlatformsSync(assertRuntimeDb()) });
      } catch (error) {
        return createError(error, "No se pudieron cargar las plataformas.");
      }
    });
    ctx.registerIpc("booru:save-social-platform", async (_event, payload) => {
      try {
        const platform = saveSocialPlatformSync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ platform });
      } catch (error) {
        return createError(error, "No se pudo guardar la plataforma.");
      }
    });
    ctx.registerIpc("booru:delete-social-platform", async (_event, payload) => {
      try {
        const result = deleteSocialPlatformSync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo eliminar la plataforma.");
      }
    });
    ctx.registerIpc("booru:import-social-platform-icon", async (_event, payload) => {
      const tempFilePath = assertClipboardTempFilePath(payload?.tempFilePath);
      try {
        const result = await ingestFile(ctx, tempFilePath, {
          updateWatcherState: false,
          sourcePathOverride: "clipboard://social-platform-icon",
          originalFilenameOverride: buildClipboardImportedFilename()
        });
        if (!result?.resource) throw new Error("No se pudo importar el icono.");
        return createSuccess({ resource: result.resource });
      } catch (error) {
        return createError(error, "No se pudo importar el icono de plataforma.");
      } finally {
        await removeFileIfExists(tempFilePath);
      }
    });
    ctx.registerIpc("booru:import-social-platform-icon-file", async (_event, payload) => {
      const sourcePath = normalizeBooruOptionalText(payload?.sourcePath);
      if (!sourcePath || !import_node_fs3.default.existsSync(sourcePath)) return createError(new Error("El archivo elegido ya no existe."), "No se pudo importar el icono de plataforma.");
      const tempFilePath = import_node_path2.default.join(CLIPBOARD_IMAGE_TEMP_ROOT, `${import_node_crypto.default.randomUUID()}${import_node_path2.default.extname(sourcePath) || ".png"}`);
      try {
        await import_promises4.default.mkdir(CLIPBOARD_IMAGE_TEMP_ROOT, { recursive: true });
        await import_promises4.default.copyFile(sourcePath, tempFilePath);
        const result = await ingestFile(ctx, tempFilePath, {
          updateWatcherState: false,
          sourcePathOverride: `platform-icon://${import_node_path2.default.basename(sourcePath)}`,
          originalFilenameOverride: import_node_path2.default.basename(sourcePath)
        });
        if (!result?.resource) throw new Error("No se pudo importar el icono.");
        return createSuccess({ resource: result.resource });
      } catch (error) {
        return createError(error, "No se pudo importar el icono de plataforma.");
      } finally {
        await removeFileIfExists(tempFilePath);
      }
    });
    ctx.registerIpc("booru:list-recommendations", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const result = listRecommendationsSync(db, payload);
        logBackendDuration(
          "booru.recommendations.list.done",
          "Booru resolvio una pagina de recomendaciones.",
          performance.now() - startedAt,
          {
            query: normalizeBooruOptionalText(payload?.query),
            offset: normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER),
            limit: Math.max(1, normalizePagingNumber(payload?.limit, BOORU_RECOMMENDATION_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE)),
            itemCount: result.items.length,
            totalCount: result.totalCount,
            hasMore: result.hasMore,
            sampleIds: summarizeIdsForLog(result.items)
          }
        );
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudieron listar recomendaciones de Booru.");
      }
    });
    ctx.registerIpc("booru:ensure-entity", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const kind = normalizeBooruText(payload?.kind);
        const name = normalizeBooruText(payload?.name);
        if (!ENTITY_TABLES[kind]) {
          throw new Error("El tipo de entidad solicitado no existe en Booru.");
        }
        const result = {
          kind,
          ...ensureTypedEntitySync(db, kind, name)
        };
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo asegurar la entidad en Booru.");
      }
    });
    ctx.registerIpc("booru:set-character-universe", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const profile = setCharacterUniverseSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo actualizar el universe del character en Booru.");
      }
    });
    ctx.registerIpc("booru:ensure-character-in-universe", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const result = ensureCharacterInUniverseSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo crear el character dentro del universe en Booru.");
      }
    });
    ctx.registerIpc("booru:set-entity-visual", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const profile = setEntityVisualSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo actualizar el visual de la entidad en Booru.");
      }
    });
    ctx.registerIpc("booru:set-entity-visual-layout", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const profile = setEntityVisualLayoutSync(db, payload);
        scheduleRuntimeInvalidation("entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo actualizar el encuadre del perfil de entidad en Booru.");
      }
    });
    ctx.registerIpc("booru:save-entity-profile", async (_event, payload) => {
      try {
        const profile = saveEntityProfileSync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        return createSuccess({ profile });
      } catch (error) {
        return createError(error, "No se pudo guardar el perfil de entidad.");
      }
    });
    ctx.registerIpc("booru:disassociate-resources-from-entity", async (_event, payload) => {
      try {
        const result = disassociateResourcesFromEntitySync(assertRuntimeDb(), payload);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudieron desasociar los recursos de la entidad.");
      }
    });
    ctx.registerIpc("booru:exclude-resource-tag", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = excludeResourceTagSync(db, normalizeBooruText(payload?.resourceId), normalizeBooruText(payload?.tagId));
        const mutation = buildResourceMutationResultSync(db, {
          reason: "inherited-tag-excluded",
          updatedResources: resource,
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion");
        return createSuccess(mutation);
      } catch (error) {
        return createError(error, "No se pudo excluir la tag heredada.");
      }
    });
    ctx.registerIpc("booru:exclude-resource-universe", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = excludeResourceUniverseSync(db, normalizeBooruText(payload?.resourceId), normalizeBooruText(payload?.universeId));
        const mutation = buildResourceMutationResultSync(db, {
          reason: "inherited-universe-excluded",
          updatedResources: resource,
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion");
        return createSuccess(mutation);
      } catch (error) {
        return createError(error, "No se pudo excluir el universe heredado.");
      }
    });
    ctx.registerIpc("booru:set-fast-classification", async (_event, payload) => {
      try {
        const state2 = runtimeState;
        const kind = normalizeBooruText(payload?.kind);
        const entityId = normalizeBooruOptionalText(payload?.entityId);
        const scopeId = normalizeBooruOptionalText(payload?.scopeId);
        if (!state2 || !ENTITY_TABLES[kind] || !entityId || !scopeId || !findEntityByIdSync(assertRuntimeDb(), kind, entityId)) {
          throw new Error("El perfil de clasificacion rapida ya no existe.");
        }
        state2.fastClassification = { kind, entityId, scopeId };
        return createSuccess({ active: true });
      } catch (error) {
        return createError(error, "No se pudo activar la clasificacion rapida.");
      }
    });
    ctx.registerIpc("booru:clear-fast-classification", async (_event, payload) => {
      const state2 = runtimeState;
      const scopeId = normalizeBooruOptionalText(payload?.scopeId);
      if (state2?.fastClassification && (!scopeId || state2.fastClassification.scopeId === scopeId)) {
        state2.fastClassification = null;
      }
      return createSuccess({ active: false });
    });
    ctx.registerIpc("booru:ensure-tag", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const name = normalizeBooruText(payload?.name);
        const result = ensureTagSync(db, name);
        scheduleRuntimeInvalidation("metricsVersion");
        return createSuccess(result);
      } catch (error) {
        return createError(error, "No se pudo asegurar la tag en Booru.");
      }
    });
    ctx.registerIpc("booru:save-resource-metadata", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = saveResourceMetadataSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "metadata-saved",
          updatedResources: resource,
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.resource-metadata.save.done",
          "Booru guardo metadata de recursos en backend.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds || [payload?.resourceId]),
            dirtyFields: Array.isArray(payload?.dirtyFields) ? payload.dirtyFields : [],
            resultCount: Array.isArray(resource) ? resource.length : resource ? 1 : 0
          }
        );
        return createSuccess({
          ...mutation,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la metadata del recurso en Booru.");
      }
    });
    ctx.registerIpc("booru:save-basic-classification", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = saveBasicClassificationSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "classification-saved",
          updatedResources: resource,
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.classification.save.done",
          "Booru guardo clasificacion basica en backend.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds || [payload?.resourceId]),
            dirtyFields: Array.isArray(payload?.dirtyFields) ? payload.dirtyFields : [],
            resultCount: Array.isArray(resource) ? resource.length : resource ? 1 : 0
          }
        );
        return createSuccess({
          ...mutation,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo guardar la clasificacion minima de Booru.");
      }
    });
    ctx.registerIpc("booru:quick-assign-entity", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resource = quickAssignEntitySync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "entity-assigned",
          updatedResources: resource,
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.quick-assign.done",
          "Booru aplico una asignacion rapida en backend.",
          performance.now() - startedAt,
          {
            resourceId: normalizeBooruOptionalText(payload?.resourceId),
            resourceIds: summarizeIdsForLog(payload?.resourceIds || [payload?.resourceId]),
            kind: normalizeBooruOptionalText(payload?.kind),
            entityId: normalizeBooruOptionalText(payload?.entityId),
            resultResourceIds: summarizeIdsForLog(Array.isArray(resource) ? resource : [resource])
          }
        );
        return createSuccess({
          ...mutation,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo aplicar la asignacion rapida en Booru.");
      }
    });
    ctx.registerIpc("booru:paste-clipboard-image-to-entity", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const result = await pasteClipboardImageToEntitySync(ctx, db, payload);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.clipboard-paste.done",
          "Booru importo una imagen del portapapeles y la asigno a una entidad.",
          performance.now() - startedAt,
          {
            kind: normalizeBooruOptionalText(payload?.kind),
            entityId: normalizeBooruOptionalText(payload?.entityId),
            createdResourceId: normalizeBooruOptionalText(result?.createdResourceId),
            reusedCanonical: Boolean(result?.reusedCanonical),
            resultResourceIds: summarizeIdsForLog(Array.isArray(result?.resource) ? result.resource : [result?.resource])
          }
        );
        return createSuccess({
          ...result,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo pegar la imagen del portapapeles en Booru.");
      }
    });
    ctx.registerIpc("booru:paste-clipboard-media", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        const result = await pasteClipboardMediaSync(ctx, db, payload);
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        return createSuccess({
          ...result,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo importar el recurso del portapapeles en Booru.");
      }
    });
    ctx.registerIpc("booru:trash-resources", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resources = trashResourcesSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "resources-trashed",
          updatedResources: resources,
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.trash.done",
          "Booru envio recursos a la papelera interna.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds),
            resultCount: Array.isArray(resources) ? resources.length : 0
          }
        );
        return createSuccess({
          ...mutation,
          resources,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo enviar la seleccion a la papelera de Booru.");
      }
    });
    ctx.registerIpc("booru:restore-resources", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const resources = restoreResourcesSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "resources-restored",
          updatedResources: resources,
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.restore.done",
          "Booru restauro recursos desde la papelera interna.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds),
            resultCount: Array.isArray(resources) ? resources.length : 0
          }
        );
        return createSuccess({
          ...mutation,
          resources,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo restaurar la seleccion de Booru.");
      }
    });
    ctx.registerIpc("booru:purge-resources", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const mutationContext = createResourceMutationContextSync(db, payload);
        const result = await purgeResourcesSync(db, payload);
        const mutation = buildResourceMutationResultSync(db, {
          reason: "resources-purged",
          updatedResources: [],
          context: mutationContext
        });
        scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
        logBackendDuration(
          "booru.purge.done",
          "Booru purgo recursos desde la papelera interna.",
          performance.now() - startedAt,
          {
            resourceIds: summarizeIdsForLog(payload?.resourceIds),
            purgedIds: summarizeIdsForLog(result?.purgedIds)
          }
        );
        return createSuccess({
          ...mutation,
          ...result,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo purgar la seleccion de Booru.");
      }
    });
    ctx.registerIpc("booru:open-in-brave", async (_event, payload) => {
      try {
        const db = assertRuntimeDb();
        return createSuccess(await openResourceInBraveSync(db, payload));
      } catch (error) {
        return createError(error, "No se pudo abrir el recurso en Brave.");
      }
    });
    ctx.registerIpc("booru:restart-watcher", async () => {
      try {
        const state2 = runtimeState;
        assertRuntimeStateActive(state2);
        const settingsValue = await ctx.settings.get();
        await restartWatcher(state2, ctx, settingsValue);
        scheduleRuntimeInvalidationForState(state2, "watcherVersion");
        return createSuccess(buildResourcesSnapshot(ctx, settingsValue));
      } catch (error) {
        return createError(error, "No se pudo reiniciar el watcher de Booru.");
      }
    });
    ctx.registerIpc("booru:rescan-watch-folder", async () => {
      try {
        const settingsValue = await ctx.settings.get();
        await rescanWatchFolder(ctx, settingsValue);
        scheduleRuntimeInvalidation("watcherVersion");
        return createSuccess(buildResourcesSnapshot(ctx, settingsValue));
      } catch (error) {
        return createError(error, "No se pudo releer la carpeta vigilada de Booru.");
      }
    });
    ctx.settings.subscribe(
      (settingsValue) => {
        const task = applySettings(normalizeBooruSettings(settingsValue));
        trackRuntimeBackgroundTask(state, task);
        return task;
      },
      { emitCurrent: true }
    );
    queueThumbnailGeneration(listThumbnailBacklogResourceIdsSync(state.db), "low");
  }
};
var __booruTestUtils = {
  applyBooruMutationToResourceWindow,
  createBooruIncrementalEntityResult,
  createBooruEntityVisualProjection,
  getBooruEntityVisualMediaStyle,
  getBooruEntityVisualRenderProps,
  getBooruDetailsFieldSchema,
  getBooruDetailsMixedFields,
  getBooruDetailsPriorityContext,
  getBooruDetailsRealityState,
  buildBooruResourceQuery,
  buildResourceMutationResultSync,
  createResourceMutationContextSync,
  getBooruContextualMissingFilterOptions,
  getBooruImplicitRecommendationMissingKind,
  getBooruRecommendationScope,
  isBooruResourceWindowContextCurrent,
  isBooruMissingFilterCompatible,
  normalizeBooruRecommendationScope,
  normalizeBooruEntityRelationRequest,
  normalizeBooruResourceMutationResult,
  normalizeEntityVisualLayout: normalizeBooruEntityVisualLayout,
  normalizeEntityVisualSettings: normalizeBooruEntityVisualSettings,
  resourceMatchesBooruPendingMode,
  resourceMatchesBooruSection,
  resolveBooruAnchoredResources,
  ensureCatalogSchema,
  ensureTypedEntitySync,
  ensureCharacterInUniverseSync,
  ensureTagSync,
  allocateUniqueEntitySlugSync,
  setCharacterUniverseSync,
  replaceCharacterUniverseAssignmentSync,
  replaceResourceTagAssignmentsSync,
  saveResourceMetadataSync,
  saveBasicClassificationSync,
  quickAssignEntitySync,
  resolveClipboardAssociationsSync,
  mergeClipboardAssociationsIntoResourceSync,
  reintegrateCanonicalResourceSync,
  createBooruIngestMutation,
  createBooruKeyedSerialExecutor,
  listEntitiesSync,
  listEntityRelationsSync,
  getEntityProfileSync,
  listTagsSync,
  listSearchSuggestionsSync,
  saveEntityProfileSync,
  syncResourceInheritanceSync,
  excludeResourceTagSync,
  disassociateResourcesFromEntitySync,
  listLibraryRows,
  listPendingRows,
  listDuplicateRows,
  listTrashRows,
  listThumbnailBacklogResourceIdsSync,
  listResourcesSync,
  listRecommendationsSync,
  setEntityVisualSync,
  setEntityVisualLayoutSync,
  trashResourcesSync,
  restoreResourcesSync,
  purgeResourcesSync,
  getResourceByIdSync,
  buildResourcesSnapshot,
  drainRuntimeBackgroundWork
};
var backend_default = booruPlugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  __booruTestUtils
});
/*! Bundled license information:

chokidar/index.js:
  (*! chokidar - MIT License (c) 2012 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=backend.cjs.map
