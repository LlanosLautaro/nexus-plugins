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

// ../nexus-plugins/booru/src/backend.ts
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
var BOORU_RESOURCE_SECTIONS = /* @__PURE__ */ new Set(["media", "pending", "duplicates", "trash"]);
var BOORU_RESOURCE_QUICK_FILTERS = /* @__PURE__ */ new Set(["all", "unclassified", "image", "video", "gif"]);
var DEFAULT_RESOURCE_PAGE_SIZE = 120;
var MAX_RESOURCE_PAGE_SIZE = 5e3;
var BRAVE_PROFILE_DIRECTORY = "Plugins";
var THUMBNAIL_VARIANT_NAME = "grid";
var THUMBNAIL_MAX_SIDE_PX = 384;
var THUMBNAIL_CONCURRENCY = 2;
var BOORU_RUNTIME_STATE_KEYS = {
  resourcesVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.resourcesVersion`,
  entitiesVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.entitiesVersion`,
  watcherVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.watcherVersion`,
  metricsVersion: `plugins.runtimeState.${BOORU_PLUGIN_ID}.metricsVersion`
};
var booruBackendLogger = createDevLogger("backend.plugins.booru");
var runtimeState = null;
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
function scheduleRuntimeInvalidation(...keys) {
  const state = runtimeState;
  if (!state) {
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
    const nextState = runtimeState;
    if (!nextState) {
      return;
    }
    const pendingKeys = Array.from(nextState.pendingInvalidations);
    nextState.pendingInvalidations.clear();
    nextState.invalidationTimer = null;
    nextState.invalidationDelayMs = 0;
    if (!pendingKeys.length) {
      return;
    }
    const versionBase = `${Date.now()}-${nextState.invalidationVersion++}`;
    void Promise.all(
      pendingKeys.map((key) => nextState.ctx.state.set(
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
  }, 40);
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
    thumbsRoot: import_node_path2.default.join(storageRoot, "thumbs")
  };
}
async function ensureStoragePaths(storagePaths) {
  for (const directoryPath of [
    storagePaths.storageRoot,
    storagePaths.mediaRoot,
    storagePaths.duplicatesRoot,
    storagePaths.thumbsRoot
  ]) {
    await import_promises4.default.mkdir(directoryPath, { recursive: true });
  }
}
function ensureCatalogSchema(db) {
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
  if (!resourceColumns.has("trashed_at")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN trashed_at TEXT`);
  }
  if (!resourceColumns.has("media_info_status")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN media_info_status TEXT NOT NULL DEFAULT 'pending'`);
  }
  if (!resourceColumns.has("media_info_error")) {
    db.exec(`ALTER TABLE booru_resources ADD COLUMN media_info_error TEXT`);
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
  }
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_booru_resources_trashed
    ON booru_resources (trashed_at, imported_at DESC);

    CREATE INDEX IF NOT EXISTS idx_booru_resources_media_info
    ON booru_resources (media_info_status, imported_at DESC);
  `);
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
function toSqlLikePattern(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return `%${normalized.replace(/[%_]/g, (match) => `\\${match}`)}%`;
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
    SELECT u.id, u.display_name, u.slug
    FROM booru_resource_universes rel
    INNER JOIN booru_universes u ON u.id = rel.universe_id
    WHERE rel.resource_id = ?
    ORDER BY rel.sort_order ASC, u.display_name COLLATE NOCASE ASC
  `);
  return statement.all(resourceId).map(normalizeLinkedEntityRow);
}
function listResourceTagsSync(db, resourceId) {
  const statement = db.prepare(`
    SELECT t.id, t.name, t.source
    FROM booru_resource_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.resource_id = ?
    ORDER BY t.name COLLATE NOCASE ASC
  `);
  return statement.all(resourceId).map(normalizeTagRow);
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
  const reasons = [];
  let pendingScore = 0;
  if (!resource.reality) {
    reasons.push("missing-reality");
    pendingScore += 100;
  }
  if (resource.reality === "real" && !resource.authors.length) {
    reasons.push("missing-author");
    pendingScore += 60;
  }
  if (resource.reality === "ficticio" && !resource.characters.length && !resource.universes.length) {
    reasons.push("missing-fiction-subject");
    pendingScore += 60;
  }
  if (resource.reality === "ficticio") {
    if (!resource.artists.length) {
      reasons.push("missing-artist");
      pendingScore += 15;
    }
    const charactersMissingUniverse = resource.characters.filter((character) => !character?.universe?.id).length;
    if (charactersMissingUniverse > 0) {
      reasons.push("missing-character-universe");
      pendingScore += 40 * charactersMissingUniverse;
    }
  }
  if (!resource.manualTags.length) {
    reasons.push("missing-manual-tags");
    pendingScore += 10;
  }
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
  const universes = listResourceUniversesSync(db, resourceId);
  const manualTags = listResourceTagsSync(db, resourceId);
  const trashedAt = row.trashed_at == null ? null : String(row.trashed_at);
  const thumbnail = normalizeThumbnailDescriptor(row);
  const pendingState = getPendingReasons({
    reality: normalizeBooruReality(row.reality),
    authors,
    artists,
    characters,
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
    thumbnail,
    contentHash: String(row.content_hash || ""),
    reality: normalizeBooruReality(row.reality),
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
    ORDER BY imported_at ASC
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
    FROM booru_resources r
    LEFT JOIN booru_resources c ON c.id = r.canonical_resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    WHERE r.id = ?
    LIMIT 1
  `);
  return normalizeResourceRow(db, statement.get(resourceId) || null);
}
function normalizeResourceSection(value) {
  const normalized = normalizeBooruText(value);
  return BOORU_RESOURCE_SECTIONS.has(normalized) ? normalized : "media";
}
function normalizeQuickFilter(value) {
  const normalized = normalizeBooruText(value).toLowerCase();
  return BOORU_RESOURCE_QUICK_FILTERS.has(normalized) ? normalized : "all";
}
function normalizeResourceEntityFilters(value) {
  const seenKeys = /* @__PURE__ */ new Set();
  const normalizedFilters = [];
  for (const rawValue of Array.isArray(value) ? value : []) {
    const rawFilter = rawValue;
    const kind = normalizeBooruText(rawFilter?.kind);
    const id = normalizeBooruOptionalText(rawFilter?.id);
    if (!ENTITY_TABLES[kind] || !id) {
      continue;
    }
    const dedupeKey = `${kind}:${id}`;
    if (seenKeys.has(dedupeKey)) {
      continue;
    }
    seenKeys.add(dedupeKey);
    normalizedFilters.push({
      kind,
      id,
      label: normalizeBooruOptionalText(rawFilter?.label)
    });
  }
  return normalizedFilters;
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
  const missingFictionSubject = `(CASE WHEN ${alias}.reality = 'ficticio'
    AND NOT EXISTS (SELECT 1 FROM booru_resource_characters rel WHERE rel.resource_id = ${alias}.id)
    AND NOT EXISTS (SELECT 1 FROM booru_resource_universes rel WHERE rel.resource_id = ${alias}.id)
  THEN 1 ELSE 0 END)`;
  const missingCharacterUniverseCount = `(
    SELECT COUNT(*)
    FROM booru_resource_characters rel
    LEFT JOIN booru_character_universes cu ON cu.character_id = rel.character_id
    WHERE rel.resource_id = ${alias}.id
      AND cu.universe_id IS NULL
  )`;
  const missingManualTags = `(CASE WHEN NOT EXISTS (
    SELECT 1
    FROM booru_resource_tags rel
    INNER JOIN booru_tags t ON t.id = rel.tag_id
    WHERE rel.resource_id = ${alias}.id
      AND t.source = 'manual'
  ) THEN 1 ELSE 0 END)`;
  const rawScore = `(
    (${missingReality} * 100) +
    (${missingAuthor} * 60) +
    (${missingArtist} * 15) +
    (${missingFictionSubject} * 60) +
    (${missingCharacterUniverseCount} * 40) +
    (${missingManualTags} * 10)
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
    pendingScore
  };
}
function buildResourceListSqlParts(section, quickFilter, searchValue, entityFilters = []) {
  const whereClauses = [];
  const parameters = [];
  const pendingSql = buildPendingSqlExpressions("r");
  if (section === "duplicates") {
    whereClauses.push(`r.classification_state = 'duplicate-review'`);
    whereClauses.push(`r.trashed_at IS NULL`);
  } else if (section === "trash") {
    whereClauses.push(`r.trashed_at IS NOT NULL`);
  } else {
    whereClauses.push(`r.classification_state != 'duplicate-review'`);
    whereClauses.push(`r.trashed_at IS NULL`);
    if (section === "pending") {
      whereClauses.push(`${pendingSql.isPending} = 1`);
    }
  }
  if (quickFilter === "unclassified") {
    whereClauses.push(`r.classification_state = 'unclassified'`);
  } else if (quickFilter === "image" || quickFilter === "video" || quickFilter === "gif") {
    whereClauses.push(`r.media_kind = ?`);
    parameters.push(quickFilter);
  }
  const likePattern = toSqlLikePattern(searchValue);
  if (likePattern) {
    const escapedPattern = likePattern;
    const searchableFragments = [
      `LOWER(COALESCE(r.original_filename, '')) LIKE ? ESCAPE '\\'`,
      `LOWER(COALESCE(r.media_kind, '')) LIKE ? ESCAPE '\\'`,
      `LOWER(COALESCE(r.classification_state, '')) LIKE ? ESCAPE '\\'`,
      `LOWER(COALESCE(r.reality, '')) LIKE ? ESCAPE '\\'`,
      `LOWER(CASE WHEN r.width IS NOT NULL AND r.height IS NOT NULL THEN 'resolution:' || r.width || 'x' || r.height ELSE '' END) LIKE ? ESCAPE '\\'`,
      `EXISTS (
        SELECT 1
        FROM booru_resource_authors rel
        INNER JOIN booru_authors e ON e.id = rel.author_id
        WHERE rel.resource_id = r.id
          AND LOWER(COALESCE(e.display_name, '')) LIKE ? ESCAPE '\\'
      )`,
      `EXISTS (
        SELECT 1
        FROM booru_resource_artists rel
        INNER JOIN booru_artists e ON e.id = rel.artist_id
        WHERE rel.resource_id = r.id
          AND LOWER(COALESCE(e.display_name, '')) LIKE ? ESCAPE '\\'
      )`,
      `EXISTS (
        SELECT 1
        FROM booru_resource_characters rel
        INNER JOIN booru_characters e ON e.id = rel.character_id
        WHERE rel.resource_id = r.id
          AND LOWER(COALESCE(e.display_name, '')) LIKE ? ESCAPE '\\'
      )`,
      `EXISTS (
        SELECT 1
        FROM booru_resource_universes rel
        INNER JOIN booru_universes e ON e.id = rel.universe_id
        WHERE rel.resource_id = r.id
          AND LOWER(COALESCE(e.display_name, '')) LIKE ? ESCAPE '\\'
      )`,
      `EXISTS (
        SELECT 1
        FROM booru_resource_characters rel
        INNER JOIN booru_character_universes cu ON cu.character_id = rel.character_id
        INNER JOIN booru_universes e ON e.id = cu.universe_id
        WHERE rel.resource_id = r.id
          AND LOWER(COALESCE(e.display_name, '')) LIKE ? ESCAPE '\\'
      )`,
      `EXISTS (
        SELECT 1
        FROM booru_resource_tags rel
        INNER JOIN booru_tags t ON t.id = rel.tag_id
        WHERE rel.resource_id = r.id
          AND LOWER(COALESCE(t.name, '')) LIKE ? ESCAPE '\\'
      )`
    ];
    whereClauses.push(`(${searchableFragments.join("\n      OR ")})`);
    parameters.push(
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern,
      escapedPattern
    );
  }
  for (const entityFilter of entityFilters) {
    if (entityFilter.kind === "author") {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM booru_resource_authors rel
        WHERE rel.resource_id = r.id
          AND rel.author_id = ?
      )`);
      parameters.push(entityFilter.id);
      continue;
    }
    if (entityFilter.kind === "artist") {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM booru_resource_artists rel
        WHERE rel.resource_id = r.id
          AND rel.artist_id = ?
      )`);
      parameters.push(entityFilter.id);
      continue;
    }
    if (entityFilter.kind === "character") {
      whereClauses.push(`EXISTS (
        SELECT 1
        FROM booru_resource_characters rel
        WHERE rel.resource_id = r.id
          AND rel.character_id = ?
      )`);
      parameters.push(entityFilter.id);
      continue;
    }
    whereClauses.push(`(
      EXISTS (
        SELECT 1
        FROM booru_resource_universes rel
        WHERE rel.resource_id = r.id
          AND rel.universe_id = ?
      )
      OR EXISTS (
        SELECT 1
        FROM booru_resource_characters rel
        INNER JOIN booru_character_universes cu ON cu.character_id = rel.character_id
        WHERE rel.resource_id = r.id
          AND cu.universe_id = ?
      )
    )`);
    parameters.push(entityFilter.id, entityFilter.id);
  }
  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join("\n      AND ")}` : "";
  const orderBySql = section === "pending" ? `ORDER BY ${pendingSql.pendingScore} DESC, r.imported_at DESC, r.id ASC` : section === "trash" ? `ORDER BY r.trashed_at DESC, r.imported_at DESC, r.id ASC` : `ORDER BY r.imported_at DESC, r.id ASC`;
  return {
    whereSql,
    parameters,
    orderBySql
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
    FROM booru_resources r
    LEFT JOIN booru_resources c ON c.id = r.canonical_resource_id
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    WHERE r.id IN (${placeholders})
  `).all(...resourceIds);
  const rowById = new Map(rows.map((row) => [String(row?.id || ""), row]));
  return resourceIds.map((resourceId) => normalizeResourceRow(db, rowById.get(resourceId) || null)).filter(Boolean);
}
function countResourcesSync(db, section, quickFilter, searchValue, entityFilters = []) {
  const sqlParts = buildResourceListSqlParts(section, quickFilter, searchValue, entityFilters);
  const row = db.prepare(`
    SELECT COUNT(*) AS total_count
    FROM booru_resources r
    ${sqlParts.whereSql}
  `).get(...sqlParts.parameters) || {};
  return Number(row?.total_count || 0);
}
function listResourcesSync(db, payload = {}) {
  const section = normalizeResourceSection(payload?.section);
  const quickFilter = normalizeQuickFilter(payload?.quickFilter);
  const search = normalizeBooruOptionalText(payload?.search);
  const entityFilters = normalizeResourceEntityFilters(payload?.entityFilters);
  const offset = normalizePagingNumber(payload?.offset, 0, Number.MAX_SAFE_INTEGER);
  const limit = Math.max(1, normalizePagingNumber(payload?.limit, DEFAULT_RESOURCE_PAGE_SIZE, MAX_RESOURCE_PAGE_SIZE));
  const sqlParts = buildResourceListSqlParts(section, quickFilter, search, entityFilters);
  const totalCount = countResourcesSync(db, section, quickFilter, search, entityFilters);
  const resourceIds = db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
    LIMIT ?
    OFFSET ?
  `).all(...sqlParts.parameters, limit, offset).map((row) => String(row?.id || "")).filter(Boolean);
  const items = getResourceRowsByIdsSync(db, resourceIds);
  return {
    section,
    entityFilters,
    items,
    totalCount,
    hasMore: offset + items.length < totalCount
  };
}
function listAllResourcesForSectionSync(db, section) {
  const totalCount = countResourcesSync(db, section, "all", null);
  if (!totalCount) {
    return [];
  }
  const sqlParts = buildResourceListSqlParts(section, "all", null);
  const resourceIds = db.prepare(`
    SELECT r.id
    FROM booru_resources r
    ${sqlParts.whereSql}
    ${sqlParts.orderBySql}
    LIMIT ?
    OFFSET 0
  `).all(...sqlParts.parameters, totalCount).map((row) => String(row?.id || "")).filter(Boolean);
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
    pendingCount: countResourcesSync(db, "pending", "all", null),
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
function shouldGenerateThumbnailSync(resource, thumbnailRow) {
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
  return !storagePath || !import_node_fs3.default.existsSync(storagePath);
}
function listThumbnailBacklogResourceIdsSync(db) {
  return db.prepare(`
    SELECT r.id
    FROM booru_resources r
    LEFT JOIN booru_resource_thumbnails th ON th.resource_id = r.id
    WHERE th.resource_id IS NULL
       OR th.source_hash IS NULL
       OR th.source_hash != r.content_hash
       OR th.status != 'ready'
       OR r.media_info_status != 'ready'
    ORDER BY r.imported_at DESC, r.id ASC
  `).all().map((row) => String(row?.id || "")).filter(Boolean);
}
async function readSpawnedJson(command, args) {
  return new Promise((resolve3, reject) => {
    const startedAt = performance.now();
    const child = (0, import_node_child_process.spawn)(command, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk || "");
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk || "");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const durationMs = Number((performance.now() - startedAt).toFixed(2));
      if (code !== 0) {
        reject(Object.assign(
          new Error(String(stderr || stdout || `El proceso termino con codigo ${code}.`).trim()),
          {
            args,
            command,
            durationMs,
            exitCode: Number(code ?? -1),
            stderr,
            stdout
          }
        ));
        return;
      }
      try {
        resolve3({
          args,
          command,
          data: JSON.parse(stdout || "{}"),
          durationMs,
          exitCode: Number(code ?? 0),
          stderr,
          stdout
        });
      } catch (error) {
        reject(Object.assign(
          new Error(`El worker de Booru devolvio JSON invalido. ${error?.message || ""}`.trim()),
          {
            args,
            command,
            durationMs,
            exitCode: Number(code ?? 0),
            stderr,
            stdout
          }
        ));
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
  await import_promises4.default.mkdir(import_node_path2.default.dirname(outputPaths.webpPath), { recursive: true });
  return readSpawnedJson(getWorkerPythonCommand(state), [
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
  if (!state?.db) {
    return;
  }
  let queuedAny = false;
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
    if (!resource || !shouldGenerateThumbnailSync(resource, getThumbnailRowSync(state.db, resourceId))) {
      continue;
    }
    state.thumbnailQueuedIds.add(resourceId);
    queuedAny = true;
    if (priority === "high") {
      state.thumbnailHighPriorityIds.unshift(resourceId);
    } else {
      state.thumbnailLowPriorityIds.push(resourceId);
    }
  }
  if (queuedAny) {
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
    scheduleRuntimeInvalidation("metricsVersion");
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
  if (!state.db) {
    return;
  }
  const resource = getResourceByIdSync(state.db, resourceId);
  if (!resource) {
    return;
  }
  const thumbnailRow = getThumbnailRowSync(state.db, resourceId);
  if (!shouldGenerateThumbnailSync(resource, thumbnailRow)) {
    return;
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
  } catch (error) {
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
  }
  scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion");
}
async function pumpThumbnailQueue() {
  const state = runtimeState;
  if (!state?.db || !state.python.available) {
    return;
  }
  while (state.thumbnailProcessingIds.size < THUMBNAIL_CONCURRENCY && (state.thumbnailHighPriorityIds.length || state.thumbnailLowPriorityIds.length)) {
    const nextResourceId = dequeueNextThumbnailResourceId(state);
    if (!nextResourceId || state.thumbnailProcessingIds.has(nextResourceId)) {
      continue;
    }
    state.thumbnailProcessingIds.add(nextResourceId);
    scheduleRuntimeInvalidation("metricsVersion");
    void processThumbnailQueueEntry(state, nextResourceId).finally(() => {
      state.thumbnailProcessingIds.delete(nextResourceId);
      scheduleRuntimeInvalidation("metricsVersion");
      void pumpThumbnailQueue();
    });
  }
}
function createRuntimeState(ctx) {
  const storagePaths = getStoragePaths(ctx);
  return {
    ctx,
    storageRoot: storagePaths.storageRoot,
    catalogPath: storagePaths.catalogPath,
    mediaRoot: storagePaths.mediaRoot,
    duplicatesRoot: storagePaths.duplicatesRoot,
    thumbsRoot: storagePaths.thumbsRoot,
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
    thumbnailHighPriorityIds: [],
    thumbnailLowPriorityIds: [],
    thumbnailQueuedIds: /* @__PURE__ */ new Set(),
    thumbnailProcessingIds: /* @__PURE__ */ new Set(),
    thumbnailLastError: "",
    invalidationVersion: 1,
    pendingInvalidations: /* @__PURE__ */ new Set(),
    invalidationTimer: null,
    invalidationDelayMs: 0,
    db: null
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
        thumbsRoot: storagePaths.thumbsRoot
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
      thumbsRoot: state.thumbsRoot
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
    storagePath: String(row.storage_path || ""),
    sampleStoragePath: thumbnailReady ? normalizeBooruOptionalText(row?.thumbnail_storage_path) || String(row.storage_path || "") : String(row.storage_path || ""),
    sampleMediaKind: thumbnailReady ? "image" : normalizeBooruOptionalText(row.media_kind)
  };
}
function buildVisibleResourceDescriptorFromRow(row) {
  if (!row) {
    return {
      sampleResourceId: null,
      storagePath: null,
      sampleStoragePath: null,
      sampleMediaKind: null
    };
  }
  const thumbnailReady = normalizeThumbnailStatus(row?.thumbnail_status) === "ready";
  return {
    sampleResourceId: normalizeBooruOptionalText(row?.id),
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
    metadata: {
      createdAt
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
  const cardDescriptor = pickEntityVisualDescriptorSync(
    db,
    kind,
    String(row?.id || ""),
    [
      normalizeBooruOptionalText(row?.avatar_resource_id),
      normalizeBooruOptionalText(row?.cover_resource_id)
    ],
    "avatar"
  );
  const baseRow = {
    id: String(row?.id || ""),
    kind,
    displayName: String(row?.display_name || "").trim(),
    slug: String(row?.slug || "").trim(),
    coverResourceId: normalizeBooruOptionalText(row?.cover_resource_id),
    avatarResourceId: normalizeBooruOptionalText(row?.avatar_resource_id),
    bannerResourceId: normalizeBooruOptionalText(row?.banner_resource_id),
    createdAt: String(row?.created_at || ""),
    resourceCount: Number(row?.resource_count || 0),
    sampleResourceId: sampleDescriptor.sampleResourceId,
    sampleStoragePath: sampleDescriptor.sampleStoragePath,
    sampleMediaKind: sampleDescriptor.sampleMediaKind,
    cardResourceId: cardDescriptor.sampleResourceId,
    cardStoragePath: cardDescriptor.storagePath,
    cardPreviewPath: cardDescriptor.sampleStoragePath,
    cardMediaKind: cardDescriptor.sampleMediaKind
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
function listEntitiesSync(db, kind, query = null) {
  const comparableQuery = normalizeBooruComparableText(query);
  const slugQuery = normalizeBooruText(normalizeBooruSlug(query || "", "")).toLowerCase();
  const rows = getEntityBaseRows(db, kind);
  const filteredRows = comparableQuery || slugQuery ? rows.filter((row) => getEntityQueryScore(row, comparableQuery, slugQuery) > 0).sort((left, right) => {
    const leftScore = getEntityQueryScore(left, comparableQuery, slugQuery);
    const rightScore = getEntityQueryScore(right, comparableQuery, slugQuery);
    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }
    if (Number(right?.resource_count || 0) !== Number(left?.resource_count || 0)) {
      return Number(right?.resource_count || 0) - Number(left?.resource_count || 0);
    }
    return String(left?.display_name || "").localeCompare(String(right?.display_name || ""), "es-AR");
  }).slice(0, 24) : rows.slice(0, 240);
  return filteredRows.map((row) => normalizeEntityRow(db, kind, row));
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
  }).slice(0, 24) : rows.slice(0, 240);
  return filteredRows.map((row) => ({
    ...normalizeTagRow(row),
    resourceCount: Number(row?.resource_count || 0)
  }));
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
function ensureTypedEntitySync(db, kind, name) {
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
    throw new Error("La imagen seleccionada no es valida.");
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
    throw new Error("La imagen seleccionada ya no esta disponible en Booru.");
  }
  if (resource.mediaKind === "video") {
    throw new Error("Solo puedes usar imagenes o gifs como perfil o banner.");
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
function setCharacterUniverseSync(db, payload) {
  const characterId = normalizeBooruText(payload?.characterId);
  const universeId = normalizeBooruOptionalText(payload?.universeId);
  if (!characterId) {
    throw new Error("El character solicitado no es valido.");
  }
  const character = findEntityByIdSync(db, "character", characterId);
  if (!character) {
    throw new Error("El character solicitado ya no existe en Booru.");
  }
  if (universeId) {
    const universe = findEntityByIdSync(db, "universe", universeId);
    if (!universe) {
      throw new Error("El universe solicitado ya no existe en Booru.");
    }
  }
  replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
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
  const ensured = ensureTypedEntitySync(db, "character", name);
  const characterId = String(ensured?.entity?.id || "").trim();
  if (!characterId) {
    throw new Error("No se pudo asegurar el character.");
  }
  const currentUniverse = getCharacterUniverseRecordSync(db, characterId);
  if (currentUniverse?.id && currentUniverse.id !== universeId) {
    throw new Error(`Ese character ya existe en ${currentUniverse.displayName}.`);
  }
  if (!currentUniverse?.id) {
    replaceCharacterUniverseAssignmentSync(db, characterId, universeId);
  }
  return {
    created: Boolean(ensured?.created),
    entity: getEntityRecordByIdSync(db, "character", characterId) || ensured.entity
  };
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
  });
}
function replaceCharacterUniverseAssignmentSync(db, characterId, universeId) {
  db.prepare(`
    DELETE FROM booru_character_universes
    WHERE character_id = ?
  `).run(characterId);
  if (!universeId) {
    return;
  }
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
  if (!reality) {
    return "unclassified";
  }
  if (reality === "real") {
    return authorIds.length ? "classified-basic" : "unclassified";
  }
  if (!characterRecords.length && !resourceUniverseIds.length) {
    return "unclassified";
  }
  const hasMissingUniverse = characterRecords.some((character) => !character?.universe?.id);
  return hasMissingUniverse ? "unclassified" : "classified-basic";
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
  const reality = hasRealityField ? normalizeBooruReality(payload?.reality) : resource.reality;
  const authorMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "authors", "authorIds", "authorPatch");
  const artistMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "artists", "artistIds", "artistPatch");
  const characterMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "characters", "characterIds", "characterPatch");
  const universeMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "universes", "universeIds", "universePatch");
  const tagMode = resolveRelationFieldUpdateMode(payload, dirtyFields, "manualTags", "tagIds", "tagPatch");
  const currentAuthorIds = getResourceFieldIds(resource, "authors");
  const currentArtistIds = getResourceFieldIds(resource, "artists");
  const currentCharacterIds = getResourceFieldIds(resource, "characters");
  const currentUniverseIds = getResourceFieldIds(resource, "universes");
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
  return {
    resourceId: resource.id,
    reality,
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
  if (!nextDraft.reality) {
    throw new Error("Debes elegir si el recurso es real o ficticio.");
  }
  if (nextDraft.reality === "real" && !nextDraft.authorIds.length) {
    throw new Error("Un recurso real necesita al menos un author.");
  }
  if (nextDraft.reality === "ficticio" && !nextDraft.characterIds.length && !nextDraft.universeIds.length) {
    throw new Error("Un recurso ficticio necesita al menos un character o universe directo.");
  }
  if (nextDraft.reality === "ficticio" && nextDraft.characterRecords.some((character) => !character?.universe?.id)) {
    throw new Error("Cada character de un recurso ficticio necesita universe.");
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
      db.prepare(`
        UPDATE booru_resources
        SET reality = ?, classification_state = ?, last_seen_at = ?
        WHERE id = ?
      `).run(
        nextDraft.reality,
        nextDraft.classificationState,
        nowIso(),
        nextDraft.resourceId
      );
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
    const currentAuthorIds = Array.isArray(resource.authors) ? resource.authors.map((item) => item.id) : [];
    const currentArtistIds = Array.isArray(resource.artists) ? resource.artists.map((item) => item.id) : [];
    const currentCharacterIds = Array.isArray(resource.characters) ? resource.characters.map((item) => item.id) : [];
    const currentUniverseIds = Array.isArray(resource.universes) ? resource.universes.map((item) => item.id) : [];
    if (kind === "author") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        reality: resource.reality || "real",
        authorIds: uniqueBooruIds([...currentAuthorIds, entityId])
      });
    }
    if (kind === "artist") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        artistIds: uniqueBooruIds([...currentArtistIds, entityId])
      });
    }
    if (kind === "universe") {
      return saveResourceMetadataSync(db, {
        resourceId: resource.id,
        reality: resource.reality === "real" ? "real" : resource.reality || "ficticio",
        universeIds: uniqueBooruIds([...currentUniverseIds, entityId])
      });
    }
    return saveResourceMetadataSync(db, {
      resourceId: resource.id,
      reality: resource.reality === "real" ? "real" : resource.reality || "ficticio",
      characterIds: uniqueBooruIds([...currentCharacterIds, entityId])
    });
  }).flatMap((resourceValue) => Array.isArray(resourceValue) ? resourceValue : [resourceValue]);
  return updatedResources.length === 1 ? updatedResources[0] : updatedResources;
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
async function ingestFile(ctx, filePath) {
  const state = runtimeState;
  if (!state || !state.db) {
    return;
  }
  const absoluteFilePath = import_node_path2.default.resolve(filePath);
  const mediaDescriptor = resolveMediaDescriptor(absoluteFilePath);
  if (!mediaDescriptor) {
    return;
  }
  if (!import_node_fs3.default.existsSync(absoluteFilePath)) {
    return;
  }
  const contentHash = await computeFileHash(absoluteFilePath);
  const canonicalResource = getCanonicalResourceByHash(state.db, contentHash);
  const importedAt = nowIso();
  const resourceId = import_node_crypto.default.randomUUID();
  const originalFilename = import_node_path2.default.basename(absoluteFilePath);
  const targetRoot = canonicalResource ? state.duplicatesRoot : state.mediaRoot;
  const storageFilename = `${resourceId}${mediaDescriptor.extension}`;
  const storagePath = import_node_path2.default.join(targetRoot, storageFilename);
  await moveFile(absoluteFilePath, storagePath);
  const fileStat = await import_promises4.default.stat(storagePath);
  state.db.prepare(`
    INSERT INTO booru_resources (
      id,
      storage_filename,
      storage_path,
      original_filename,
      extension,
      mime_type,
      media_kind,
      file_size,
      width,
      height,
      duration_ms,
      content_hash,
      reality,
      classification_state,
      canonical_resource_id,
      source_path,
      media_info_status,
      media_info_error,
      imported_at,
      last_seen_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
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
    canonicalResource ? "duplicate-review" : "unclassified",
    canonicalResource ? String(canonicalResource.id || "") : null,
    absoluteFilePath,
    "pending",
    null,
    importedAt,
    importedAt
  );
  ensureThumbnailPendingRowSync(state.db, resourceId, contentHash);
  queueThumbnailGeneration([resourceId], "high");
  state.watcherState.lastIngestedAt = importedAt;
  state.watcherState.lastIngestedOriginalFilename = originalFilename;
  state.watcherState.lastIngestedStoragePath = storagePath;
  state.watcherState.lastError = "";
  scheduleRuntimeInvalidation("resourcesVersion", "entitiesVersion", "watcherVersion");
}
function queueIngest(ctx, filePath) {
  const state = runtimeState;
  if (!state) {
    return;
  }
  const absoluteFilePath = import_node_path2.default.resolve(String(filePath || ""));
  if (!absoluteFilePath || state.queuedPaths.has(absoluteFilePath)) {
    return;
  }
  state.queuedPaths.add(absoluteFilePath);
  state.watcherState.pendingCount += 1;
  scheduleRuntimeInvalidation("watcherVersion");
  state.queue = state.queue.then(() => ingestFile(ctx, absoluteFilePath)).catch((error) => {
    state.watcherState.lastError = error instanceof Error ? error.message : "No se pudo ingerir el archivo.";
    scheduleRuntimeInvalidation("watcherVersion");
  }).finally(() => {
    state.queuedPaths.delete(absoluteFilePath);
    state.watcherState.pendingCount = Math.max(0, state.watcherState.pendingCount - 1);
    scheduleRuntimeInvalidation("watcherVersion");
  });
}
async function stopWatcher() {
  const state = runtimeState;
  if (!state?.watcher) {
    if (state) {
      state.watcherState.active = false;
      state.watcherState.stage = "idle";
      scheduleRuntimeInvalidation("watcherVersion");
    }
    return;
  }
  await state.watcher.close();
  state.watcher = null;
  state.watcherState.active = false;
  state.watcherState.stage = "idle";
  scheduleRuntimeInvalidation("watcherVersion");
}
async function restartWatcher(ctx, settingsValue) {
  const state = runtimeState;
  if (!state) {
    return;
  }
  await stopWatcher();
  state.python = resolvePythonStatus(settingsValue);
  state.watcherState.watchedPath = readBooruWatchFolderPath(settingsValue);
  state.watcherState.lastError = "";
  const watchFolderPath = readBooruWatchFolderPath(settingsValue);
  if (!watchFolderPath) {
    state.watcherState.stage = "idle-no-folder";
    scheduleRuntimeInvalidation("watcherVersion");
    return;
  }
  if (!state.python.available) {
    state.watcherState.stage = "blocked-python";
    state.watcherState.lastError = state.python.error || "No se encontro Python para Booru. Configura pythonExecutable o asegurate de que python este disponible en PATH.";
    scheduleRuntimeInvalidation("watcherVersion");
    return;
  }
  if (!import_node_fs3.default.existsSync(watchFolderPath) || !import_node_fs3.default.statSync(watchFolderPath).isDirectory()) {
    state.watcherState.stage = "blocked-folder";
    state.watcherState.lastError = "La carpeta vigilada no existe o no es una carpeta valida.";
    scheduleRuntimeInvalidation("watcherVersion");
    return;
  }
  if (watchFolderPath.startsWith(state.storageRoot)) {
    state.watcherState.stage = "blocked-folder";
    state.watcherState.lastError = "La carpeta vigilada no puede apuntar al storage interno de Booru.";
    scheduleRuntimeInvalidation("watcherVersion");
    return;
  }
  state.watcherState.stage = "starting";
  scheduleRuntimeInvalidation("watcherVersion");
  state.watcher = chokidar_default.watch(watchFolderPath, {
    ignoreInitial: false,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 1500,
      pollInterval: 150
    }
  });
  state.watcher.on("add", (addedPath) => {
    queueIngest(ctx, addedPath);
  });
  state.watcher.on("ready", () => {
    state.watcherState.active = true;
    state.watcherState.stage = "watching";
    scheduleRuntimeInvalidation("watcherVersion");
  });
  state.watcher.on("error", (error) => {
    state.watcherState.active = false;
    state.watcherState.stage = "error";
    state.watcherState.lastError = error instanceof Error ? error.message : "Error en el watcher de Booru.";
    scheduleRuntimeInvalidation("watcherVersion");
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
var booruPlugin = {
  async ensureSchema(ctx) {
    const storagePaths = getStoragePaths(ctx);
    await ensureStoragePaths(storagePaths);
    const db = new import_node_sqlite.DatabaseSync(storagePaths.catalogPath);
    ensureCatalogSchema(db);
    db.close();
  },
  async activate(ctx) {
    runtimeState = createRuntimeState(ctx);
    await ensureStoragePaths(getStoragePaths(ctx));
    runtimeState.db = new import_node_sqlite.DatabaseSync(runtimeState.catalogPath);
    ensureCatalogSchema(runtimeState.db);
    const applySettings = async (settingsValue) => {
      await restartWatcher(ctx, settingsValue);
      if (runtimeState?.db) {
        queueThumbnailGeneration(listThumbnailBacklogResourceIdsSync(runtimeState.db), "low");
      }
      scheduleRuntimeInvalidation("watcherVersion");
    };
    ctx.registerCleanup(async () => {
      await stopWatcher();
      if (runtimeState?.invalidationTimer) {
        clearTimeout(runtimeState.invalidationTimer);
      }
      runtimeState?.db?.close();
      runtimeState = null;
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
            search: normalizeBooruOptionalText(payload?.search),
            quickFilter: normalizeQuickFilter(payload?.quickFilter),
            entityFilterCount: result.entityFilters.length,
            entityFilters: result.entityFilters.map((filter) => ({
              kind: filter.kind,
              id: filter.id,
              label: filter.label
            })),
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
        const items = listEntitiesSync(db, kind, query);
        logBackendDuration(
          "booru.entities.list.done",
          "Booru resolvio una lista de entidades en backend.",
          performance.now() - startedAt,
          {
            kind,
            query,
            itemCount: items.length,
            sampleIds: summarizeIdsForLog(items)
          }
        );
        return createSuccess({
          kind,
          items
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
        return createError(error, "No se pudo actualizar la imagen del perfil de entidad en Booru.");
      }
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
        const resource = saveResourceMetadataSync(db, payload);
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
          resource,
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
        const resource = saveBasicClassificationSync(db, payload);
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
          resource,
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
        const resource = quickAssignEntitySync(db, payload);
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
          resource,
          snapshot: buildResourcesSnapshot(ctx, await ctx.settings.get())
        });
      } catch (error) {
        return createError(error, "No se pudo aplicar la asignacion rapida en Booru.");
      }
    });
    ctx.registerIpc("booru:trash-resources", async (_event, payload) => {
      const startedAt = performance.now();
      try {
        const db = assertRuntimeDb();
        const resources = trashResourcesSync(db, payload);
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
        const resources = restoreResourcesSync(db, payload);
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
        const result = await purgeResourcesSync(db, payload);
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
        const settingsValue = await ctx.settings.get();
        await restartWatcher(ctx, settingsValue);
        scheduleRuntimeInvalidation("watcherVersion");
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
        void applySettings(normalizeBooruSettings(settingsValue));
      },
      { emitCurrent: true }
    );
    queueThumbnailGeneration(listThumbnailBacklogResourceIdsSync(runtimeState.db), "low");
  }
};
var __booruTestUtils = {
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
  listEntitiesSync,
  getEntityProfileSync,
  listTagsSync,
  listLibraryRows,
  listPendingRows,
  listDuplicateRows,
  listTrashRows,
  listResourcesSync,
  trashResourcesSync,
  restoreResourcesSync,
  purgeResourcesSync,
  getResourceByIdSync,
  buildResourcesSnapshot
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
