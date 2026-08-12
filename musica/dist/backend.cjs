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

// node_modules/strtok3/lib/stream/Errors.js
var defaultMessages, EndOfStreamError, AbortError;
var init_Errors = __esm({
  "node_modules/strtok3/lib/stream/Errors.js"() {
    defaultMessages = "End-Of-Stream";
    EndOfStreamError = class extends Error {
      constructor() {
        super(defaultMessages);
        this.name = "EndOfStreamError";
      }
    };
    AbortError = class extends Error {
      constructor(message = "The operation was aborted") {
        super(message);
        this.name = "AbortError";
      }
    };
  }
});

// node_modules/strtok3/lib/stream/Deferred.js
var init_Deferred = __esm({
  "node_modules/strtok3/lib/stream/Deferred.js"() {
  }
});

// node_modules/strtok3/lib/stream/AbstractStreamReader.js
var AbstractStreamReader;
var init_AbstractStreamReader = __esm({
  "node_modules/strtok3/lib/stream/AbstractStreamReader.js"() {
    init_Errors();
    AbstractStreamReader = class {
      constructor() {
        this.endOfStream = false;
        this.interrupted = false;
        this.peekQueue = [];
      }
      async peek(uint8Array, mayBeLess = false) {
        const bytesRead = await this.read(uint8Array, mayBeLess);
        this.peekQueue.push(uint8Array.subarray(0, bytesRead));
        return bytesRead;
      }
      async read(buffer, mayBeLess = false) {
        if (buffer.length === 0) {
          return 0;
        }
        let bytesRead = this.readFromPeekBuffer(buffer);
        if (!this.endOfStream) {
          bytesRead += await this.readRemainderFromStream(buffer.subarray(bytesRead), mayBeLess);
        }
        if (bytesRead === 0 && !mayBeLess) {
          throw new EndOfStreamError();
        }
        return bytesRead;
      }
      /**
       * Read chunk from stream
       * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
       * @returns Number of bytes read
       */
      readFromPeekBuffer(buffer) {
        let remaining = buffer.length;
        let bytesRead = 0;
        while (this.peekQueue.length > 0 && remaining > 0) {
          const peekData = this.peekQueue.pop();
          if (!peekData)
            throw new Error("peekData should be defined");
          const lenCopy = Math.min(peekData.length, remaining);
          buffer.set(peekData.subarray(0, lenCopy), bytesRead);
          bytesRead += lenCopy;
          remaining -= lenCopy;
          if (lenCopy < peekData.length) {
            this.peekQueue.push(peekData.subarray(lenCopy));
          }
        }
        return bytesRead;
      }
      async readRemainderFromStream(buffer, mayBeLess) {
        let bytesRead = 0;
        while (bytesRead < buffer.length && !this.endOfStream) {
          if (this.interrupted) {
            throw new AbortError();
          }
          const chunkLen = await this.readFromStream(buffer.subarray(bytesRead), mayBeLess);
          if (chunkLen === 0)
            break;
          bytesRead += chunkLen;
        }
        if (!mayBeLess && bytesRead < buffer.length) {
          throw new EndOfStreamError();
        }
        return bytesRead;
      }
    };
  }
});

// node_modules/strtok3/lib/stream/StreamReader.js
var init_StreamReader = __esm({
  "node_modules/strtok3/lib/stream/StreamReader.js"() {
    init_Errors();
    init_Deferred();
    init_AbstractStreamReader();
  }
});

// node_modules/strtok3/lib/stream/WebStreamReader.js
var WebStreamReader;
var init_WebStreamReader = __esm({
  "node_modules/strtok3/lib/stream/WebStreamReader.js"() {
    init_AbstractStreamReader();
    WebStreamReader = class extends AbstractStreamReader {
      constructor(reader) {
        super();
        this.reader = reader;
      }
      async abort() {
        return this.close();
      }
      async close() {
        this.reader.releaseLock();
      }
    };
  }
});

// node_modules/strtok3/lib/stream/WebStreamByobReader.js
var WebStreamByobReader;
var init_WebStreamByobReader = __esm({
  "node_modules/strtok3/lib/stream/WebStreamByobReader.js"() {
    init_WebStreamReader();
    WebStreamByobReader = class extends WebStreamReader {
      /**
       * Read from stream
       * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
       * @param mayBeLess - If true, may fill the buffer partially
       * @protected Bytes read
       */
      async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0)
          return 0;
        const result = await this.reader.read(new Uint8Array(buffer.length), { min: mayBeLess ? void 0 : buffer.length });
        if (result.done) {
          this.endOfStream = result.done;
        }
        if (result.value) {
          buffer.set(result.value);
          return result.value.length;
        }
        return 0;
      }
    };
  }
});

// node_modules/strtok3/lib/stream/WebStreamDefaultReader.js
var WebStreamDefaultReader;
var init_WebStreamDefaultReader = __esm({
  "node_modules/strtok3/lib/stream/WebStreamDefaultReader.js"() {
    init_Errors();
    init_AbstractStreamReader();
    WebStreamDefaultReader = class extends AbstractStreamReader {
      constructor(reader) {
        super();
        this.reader = reader;
        this.buffer = null;
      }
      /**
       * Copy chunk to target, and store the remainder in this.buffer
       */
      writeChunk(target, chunk) {
        const written = Math.min(chunk.length, target.length);
        target.set(chunk.subarray(0, written));
        if (written < chunk.length) {
          this.buffer = chunk.subarray(written);
        } else {
          this.buffer = null;
        }
        return written;
      }
      /**
       * Read from stream
       * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
       * @param mayBeLess - If true, may fill the buffer partially
       * @protected Bytes read
       */
      async readFromStream(buffer, mayBeLess) {
        if (buffer.length === 0)
          return 0;
        let totalBytesRead = 0;
        if (this.buffer) {
          totalBytesRead += this.writeChunk(buffer, this.buffer);
        }
        while (totalBytesRead < buffer.length && !this.endOfStream) {
          const result = await this.reader.read();
          if (result.done) {
            this.endOfStream = true;
            break;
          }
          if (result.value) {
            totalBytesRead += this.writeChunk(buffer.subarray(totalBytesRead), result.value);
          }
        }
        if (!mayBeLess && totalBytesRead === 0 && this.endOfStream) {
          throw new EndOfStreamError();
        }
        return totalBytesRead;
      }
      abort() {
        this.interrupted = true;
        return this.reader.cancel();
      }
      async close() {
        await this.abort();
        this.reader.releaseLock();
      }
    };
  }
});

// node_modules/strtok3/lib/stream/WebStreamReaderFactory.js
function makeWebStreamReader(stream) {
  try {
    const reader = stream.getReader({ mode: "byob" });
    if (reader instanceof ReadableStreamDefaultReader) {
      return new WebStreamDefaultReader(reader);
    }
    return new WebStreamByobReader(reader);
  } catch (error) {
    if (error instanceof TypeError) {
      return new WebStreamDefaultReader(stream.getReader());
    }
    throw error;
  }
}
var init_WebStreamReaderFactory = __esm({
  "node_modules/strtok3/lib/stream/WebStreamReaderFactory.js"() {
    init_WebStreamByobReader();
    init_WebStreamDefaultReader();
  }
});

// node_modules/strtok3/lib/stream/index.js
var init_stream = __esm({
  "node_modules/strtok3/lib/stream/index.js"() {
    init_Errors();
    init_StreamReader();
    init_WebStreamByobReader();
    init_WebStreamDefaultReader();
    init_WebStreamReaderFactory();
  }
});

// node_modules/strtok3/lib/AbstractTokenizer.js
var AbstractTokenizer;
var init_AbstractTokenizer = __esm({
  "node_modules/strtok3/lib/AbstractTokenizer.js"() {
    init_stream();
    AbstractTokenizer = class {
      /**
       * Constructor
       * @param options Tokenizer options
       * @protected
       */
      constructor(options) {
        this.numBuffer = new Uint8Array(8);
        this.position = 0;
        this.onClose = options?.onClose;
        if (options?.abortSignal) {
          options.abortSignal.addEventListener("abort", () => {
            this.abort();
          });
        }
      }
      /**
       * Read a token from the tokenizer-stream
       * @param token - The token to read
       * @param position - If provided, the desired position in the tokenizer-stream
       * @returns Promise with token data
       */
      async readToken(token, position = this.position) {
        const uint8Array = new Uint8Array(token.len);
        const len = await this.readBuffer(uint8Array, { position });
        if (len < token.len)
          throw new EndOfStreamError();
        return token.get(uint8Array, 0);
      }
      /**
       * Peek a token from the tokenizer-stream.
       * @param token - Token to peek from the tokenizer-stream.
       * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
       * @returns Promise with token data
       */
      async peekToken(token, position = this.position) {
        const uint8Array = new Uint8Array(token.len);
        const len = await this.peekBuffer(uint8Array, { position });
        if (len < token.len)
          throw new EndOfStreamError();
        return token.get(uint8Array, 0);
      }
      /**
       * Read a numeric token from the stream
       * @param token - Numeric token
       * @returns Promise with number
       */
      async readNumber(token) {
        const len = await this.readBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
          throw new EndOfStreamError();
        return token.get(this.numBuffer, 0);
      }
      /**
       * Read a numeric token from the stream
       * @param token - Numeric token
       * @returns Promise with number
       */
      async peekNumber(token) {
        const len = await this.peekBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
          throw new EndOfStreamError();
        return token.get(this.numBuffer, 0);
      }
      /**
       * Ignore number of bytes, advances the pointer in under tokenizer-stream.
       * @param length - Number of bytes to ignore.  Must be ≥ 0.
       * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
       */
      async ignore(length) {
        if (length < 0) {
          throw new RangeError("ignore length must be \u2265 0 bytes");
        }
        if (this.fileInfo.size !== void 0) {
          const bytesLeft = this.fileInfo.size - this.position;
          if (length > bytesLeft) {
            this.position += bytesLeft;
            return bytesLeft;
          }
        }
        this.position += length;
        return length;
      }
      async close() {
        await this.abort();
        await this.onClose?.();
      }
      normalizeOptions(uint8Array, options) {
        if (!this.supportsRandomAccess() && options && options.position !== void 0 && options.position < this.position) {
          throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
        }
        return {
          ...{
            mayBeLess: false,
            offset: 0,
            length: uint8Array.length,
            position: this.position
          },
          ...options
        };
      }
      abort() {
        return Promise.resolve();
      }
    };
  }
});

// node_modules/strtok3/lib/ReadStreamTokenizer.js
var maxBufferSize, ReadStreamTokenizer;
var init_ReadStreamTokenizer = __esm({
  "node_modules/strtok3/lib/ReadStreamTokenizer.js"() {
    init_AbstractTokenizer();
    init_stream();
    maxBufferSize = 256e3;
    ReadStreamTokenizer = class extends AbstractTokenizer {
      /**
       * Constructor
       * @param streamReader stream-reader to read from
       * @param options Tokenizer options
       */
      constructor(streamReader, options) {
        super(options);
        this.streamReader = streamReader;
        this.fileInfo = options?.fileInfo ?? {};
      }
      /**
       * Read buffer from tokenizer
       * @param uint8Array - Target Uint8Array to fill with data read from the tokenizer-stream
       * @param options - Read behaviour options
       * @returns Promise with number of bytes read
       */
      async readBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const skipBytes = normOptions.position - this.position;
        if (skipBytes > 0) {
          await this.ignore(skipBytes);
          return this.readBuffer(uint8Array, options);
        }
        if (skipBytes < 0) {
          throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
        }
        if (normOptions.length === 0) {
          return 0;
        }
        const bytesRead = await this.streamReader.read(uint8Array.subarray(0, normOptions.length), normOptions.mayBeLess);
        this.position += bytesRead;
        if ((!options || !options.mayBeLess) && bytesRead < normOptions.length) {
          throw new EndOfStreamError();
        }
        return bytesRead;
      }
      /**
       * Peek (read ahead) buffer from tokenizer
       * @param uint8Array - Uint8Array (or Buffer) to write data to
       * @param options - Read behaviour options
       * @returns Promise with number of bytes peeked
       */
      async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        let bytesRead = 0;
        if (normOptions.position) {
          const skipBytes = normOptions.position - this.position;
          if (skipBytes > 0) {
            const skipBuffer = new Uint8Array(normOptions.length + skipBytes);
            bytesRead = await this.peekBuffer(skipBuffer, { mayBeLess: normOptions.mayBeLess });
            uint8Array.set(skipBuffer.subarray(skipBytes));
            return bytesRead - skipBytes;
          }
          if (skipBytes < 0) {
            throw new Error("Cannot peek from a negative offset in a stream");
          }
        }
        if (normOptions.length > 0) {
          try {
            bytesRead = await this.streamReader.peek(uint8Array.subarray(0, normOptions.length), normOptions.mayBeLess);
          } catch (err) {
            if (options?.mayBeLess && err instanceof EndOfStreamError) {
              return 0;
            }
            throw err;
          }
          if (!normOptions.mayBeLess && bytesRead < normOptions.length) {
            throw new EndOfStreamError();
          }
        }
        return bytesRead;
      }
      /**
       * @param length Number of bytes to ignore. Must be ≥ 0.
       */
      async ignore(length) {
        if (length < 0) {
          throw new RangeError("ignore length must be \u2265 0 bytes");
        }
        const bufSize = Math.min(maxBufferSize, length);
        const buf = new Uint8Array(bufSize);
        let totBytesRead = 0;
        while (totBytesRead < length) {
          const remaining = length - totBytesRead;
          const bytesRead = await this.readBuffer(buf, { length: Math.min(bufSize, remaining) });
          if (bytesRead < 0) {
            return bytesRead;
          }
          totBytesRead += bytesRead;
        }
        return totBytesRead;
      }
      abort() {
        return this.streamReader.abort();
      }
      async close() {
        return this.streamReader.close();
      }
      supportsRandomAccess() {
        return false;
      }
    };
  }
});

// node_modules/strtok3/lib/BufferTokenizer.js
var BufferTokenizer;
var init_BufferTokenizer = __esm({
  "node_modules/strtok3/lib/BufferTokenizer.js"() {
    init_stream();
    init_AbstractTokenizer();
    BufferTokenizer = class extends AbstractTokenizer {
      /**
       * Construct BufferTokenizer
       * @param uint8Array - Uint8Array to tokenize
       * @param options Tokenizer options
       */
      constructor(uint8Array, options) {
        super(options);
        this.uint8Array = uint8Array;
        this.fileInfo = { ...options?.fileInfo ?? {}, ...{ size: uint8Array.length } };
      }
      /**
       * Read buffer from tokenizer
       * @param uint8Array - Uint8Array to tokenize
       * @param options - Read behaviour options
       * @returns {Promise<number>}
       */
      async readBuffer(uint8Array, options) {
        if (options?.position) {
          this.position = options.position;
        }
        const bytesRead = await this.peekBuffer(uint8Array, options);
        this.position += bytesRead;
        return bytesRead;
      }
      /**
       * Peek (read ahead) buffer from tokenizer
       * @param uint8Array
       * @param options - Read behaviour options
       * @returns {Promise<number>}
       */
      async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const bytes2read = Math.min(this.uint8Array.length - normOptions.position, normOptions.length);
        if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
          throw new EndOfStreamError();
        }
        uint8Array.set(this.uint8Array.subarray(normOptions.position, normOptions.position + bytes2read));
        return bytes2read;
      }
      close() {
        return super.close();
      }
      supportsRandomAccess() {
        return true;
      }
      setPosition(position) {
        this.position = position;
      }
    };
  }
});

// node_modules/strtok3/lib/BlobTokenizer.js
var BlobTokenizer;
var init_BlobTokenizer = __esm({
  "node_modules/strtok3/lib/BlobTokenizer.js"() {
    init_stream();
    init_AbstractTokenizer();
    BlobTokenizer = class extends AbstractTokenizer {
      /**
       * Construct BufferTokenizer
       * @param blob - Uint8Array to tokenize
       * @param options Tokenizer options
       */
      constructor(blob, options) {
        super(options);
        this.blob = blob;
        this.fileInfo = { ...options?.fileInfo ?? {}, ...{ size: blob.size, mimeType: blob.type } };
      }
      /**
       * Read buffer from tokenizer
       * @param uint8Array - Uint8Array to tokenize
       * @param options - Read behaviour options
       * @returns {Promise<number>}
       */
      async readBuffer(uint8Array, options) {
        if (options?.position) {
          this.position = options.position;
        }
        const bytesRead = await this.peekBuffer(uint8Array, options);
        this.position += bytesRead;
        return bytesRead;
      }
      /**
       * Peek (read ahead) buffer from tokenizer
       * @param buffer
       * @param options - Read behaviour options
       * @returns {Promise<number>}
       */
      async peekBuffer(buffer, options) {
        const normOptions = this.normalizeOptions(buffer, options);
        const bytes2read = Math.min(this.blob.size - normOptions.position, normOptions.length);
        if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
          throw new EndOfStreamError();
        }
        const arrayBuffer = await this.blob.slice(normOptions.position, normOptions.position + bytes2read).arrayBuffer();
        buffer.set(new Uint8Array(arrayBuffer));
        return bytes2read;
      }
      close() {
        return super.close();
      }
      supportsRandomAccess() {
        return true;
      }
      setPosition(position) {
        this.position = position;
      }
    };
  }
});

// node_modules/strtok3/lib/core.js
function fromWebStream(webStream, options) {
  const webStreamReader = makeWebStreamReader(webStream);
  const _options = options ?? {};
  const chainedClose = _options.onClose;
  _options.onClose = async () => {
    await webStreamReader.close();
    if (chainedClose) {
      return chainedClose();
    }
  };
  return new ReadStreamTokenizer(webStreamReader, _options);
}
function fromBuffer(uint8Array, options) {
  return new BufferTokenizer(uint8Array, options);
}
function fromBlob(blob, options) {
  return new BlobTokenizer(blob, options);
}
var init_core = __esm({
  "node_modules/strtok3/lib/core.js"() {
    init_stream();
    init_ReadStreamTokenizer();
    init_BufferTokenizer();
    init_BlobTokenizer();
    init_stream();
    init_AbstractTokenizer();
  }
});

// node_modules/strtok3/lib/FileTokenizer.js
var import_promises, FileTokenizer;
var init_FileTokenizer = __esm({
  "node_modules/strtok3/lib/FileTokenizer.js"() {
    init_AbstractTokenizer();
    init_stream();
    import_promises = require("node:fs/promises");
    FileTokenizer = class _FileTokenizer extends AbstractTokenizer {
      /**
       * Create tokenizer from provided file path
       * @param sourceFilePath File path
       */
      static async fromFile(sourceFilePath) {
        const fileHandle = await (0, import_promises.open)(sourceFilePath, "r");
        const stat = await fileHandle.stat();
        return new _FileTokenizer(fileHandle, { fileInfo: { path: sourceFilePath, size: stat.size } });
      }
      constructor(fileHandle, options) {
        super(options);
        this.fileHandle = fileHandle;
        this.fileInfo = options.fileInfo;
      }
      /**
       * Read buffer from file
       * @param uint8Array - Uint8Array to write result to
       * @param options - Read behaviour options
       * @returns Promise number of bytes read
       */
      async readBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        this.position = normOptions.position;
        if (normOptions.length === 0)
          return 0;
        const res = await this.fileHandle.read(uint8Array, 0, normOptions.length, normOptions.position);
        this.position += res.bytesRead;
        if (res.bytesRead < normOptions.length && (!options || !options.mayBeLess)) {
          throw new EndOfStreamError();
        }
        return res.bytesRead;
      }
      /**
       * Peek buffer from file
       * @param uint8Array - Uint8Array (or Buffer) to write data to
       * @param options - Read behaviour options
       * @returns Promise number of bytes read
       */
      async peekBuffer(uint8Array, options) {
        const normOptions = this.normalizeOptions(uint8Array, options);
        const res = await this.fileHandle.read(uint8Array, 0, normOptions.length, normOptions.position);
        if (!normOptions.mayBeLess && res.bytesRead < normOptions.length) {
          throw new EndOfStreamError();
        }
        return res.bytesRead;
      }
      async close() {
        await this.fileHandle.close();
        return super.close();
      }
      setPosition(position) {
        this.position = position;
      }
      supportsRandomAccess() {
        return true;
      }
    };
  }
});

// node_modules/strtok3/lib/index.js
var fromFile;
var init_lib = __esm({
  "node_modules/strtok3/lib/index.js"() {
    init_core();
    init_FileTokenizer();
    init_FileTokenizer();
    init_core();
    fromFile = FileTokenizer.fromFile;
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports2, module2) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug31(...args) {
          if (!debug31.enabled) {
            return;
          }
          const self = debug31;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug31.namespace = namespace;
        debug31.useColors = createDebug.useColors();
        debug31.color = createDebug.selectColor(namespace);
        debug31.extend = extend;
        debug31.destroy = createDebug.destroy;
        Object.defineProperty(debug31, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug31);
        }
        return debug31;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports2, module2) {
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.storage = localstorage();
    exports2.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports2.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports2.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports2.storage.setItem("debug", namespaces);
        } else {
          exports2.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports2.storage.getItem("debug") || exports2.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "node_modules/has-flag/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (flag, argv = process.argv) => {
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const position = argv.indexOf(prefix + flag);
      const terminatorPosition = argv.indexOf("--");
      return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
    };
  }
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "node_modules/supports-color/index.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var tty = require("tty");
    var hasFlag = require_has_flag();
    var { env } = process;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      forceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = 1;
    }
    if ("FORCE_COLOR" in env) {
      if (env.FORCE_COLOR === "true") {
        forceColor = 1;
      } else if (env.FORCE_COLOR === "false") {
        forceColor = 0;
      } else {
        forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
      }
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(haveStream, streamIsTTY) {
      if (forceColor === 0) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (haveStream && !streamIsTTY && forceColor === void 0) {
        return 0;
      }
      const min = forceColor || 0;
      if (env.TERM === "dumb") {
        return min;
      }
      if (process.platform === "win32") {
        const osRelease = os.release().split(".");
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream, stream && stream.isTTY);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: translateLevel(supportsColor(true, tty.isatty(1))),
      stderr: translateLevel(supportsColor(true, tty.isatty(2)))
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports2, module2) {
    var tty = require("tty");
    var util = require("util");
    exports2.init = init;
    exports2.log = log;
    exports2.formatArgs = formatArgs;
    exports2.save = save;
    exports2.load = load;
    exports2.useColors = useColors;
    exports2.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports2.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = require_supports_color();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports2.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports2.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports2.inspectOpts ? Boolean(exports2.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports2.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports2.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug31) {
      debug31.inspectOpts = {};
      const keys = Object.keys(exports2.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug31.inspectOpts[keys[i]] = exports2.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common()(exports2);
    var { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports2, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports2) {
    exports2.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports2.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// node_modules/@borewit/text-codec/lib/index.js
function utf8Decoder() {
  if (typeof globalThis.TextDecoder === "undefined")
    return void 0;
  return _utf8Decoder !== null && _utf8Decoder !== void 0 ? _utf8Decoder : _utf8Decoder = new globalThis.TextDecoder("utf-8");
}
function utf8Encoder() {
  if (typeof globalThis.TextEncoder === "undefined")
    return void 0;
  return _utf8Encoder !== null && _utf8Encoder !== void 0 ? _utf8Encoder : _utf8Encoder = new globalThis.TextEncoder();
}
function textDecode(bytes, encoding = "utf-8") {
  switch (encoding.toLowerCase()) {
    case "utf-8":
    case "utf8": {
      const dec = utf8Decoder();
      return dec ? dec.decode(bytes) : decodeUTF8(bytes);
    }
    case "utf-16le":
      return decodeUTF16LE(bytes);
    case "us-ascii":
    case "ascii":
      return decodeASCII(bytes);
    case "latin1":
    case "iso-8859-1":
      return decodeLatin1(bytes);
    case "windows-1252":
      return decodeWindows1252(bytes);
    default:
      throw new RangeError(`Encoding '${encoding}' not supported`);
  }
}
function textEncode(input = "", encoding = "utf-8") {
  switch (encoding.toLowerCase()) {
    case "utf-8":
    case "utf8": {
      const enc = utf8Encoder();
      return enc ? enc.encode(input) : encodeUTF8(input);
    }
    case "utf-16le":
      return encodeUTF16LE(input);
    case "us-ascii":
    case "ascii":
      return encodeASCII(input);
    case "latin1":
    case "iso-8859-1":
      return encodeLatin1(input);
    case "windows-1252":
      return encodeWindows1252(input);
    default:
      throw new RangeError(`Encoding '${encoding}' not supported`);
  }
}
function flushChunk(parts, chunk) {
  if (chunk.length === 0)
    return;
  parts.push(String.fromCharCode.apply(null, chunk));
  chunk.length = 0;
}
function pushCodeUnit(parts, chunk, codeUnit) {
  chunk.push(codeUnit);
  if (chunk.length >= CHUNK)
    flushChunk(parts, chunk);
}
function pushCodePoint(parts, chunk, cp) {
  if (cp <= 65535) {
    pushCodeUnit(parts, chunk, cp);
    return;
  }
  cp -= 65536;
  pushCodeUnit(parts, chunk, 55296 + (cp >> 10));
  pushCodeUnit(parts, chunk, 56320 + (cp & 1023));
}
function decodeUTF8(bytes) {
  const parts = [];
  const chunk = [];
  let i = 0;
  if (bytes.length >= 3 && bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191) {
    i = 3;
  }
  while (i < bytes.length) {
    const b1 = bytes[i];
    if (b1 <= 127) {
      pushCodeUnit(parts, chunk, b1);
      i++;
      continue;
    }
    if (b1 < 194 || b1 > 244) {
      pushCodeUnit(parts, chunk, REPLACEMENT);
      i++;
      continue;
    }
    if (b1 <= 223) {
      if (i + 1 >= bytes.length) {
        pushCodeUnit(parts, chunk, REPLACEMENT);
        i++;
        continue;
      }
      const b22 = bytes[i + 1];
      if ((b22 & 192) !== 128) {
        pushCodeUnit(parts, chunk, REPLACEMENT);
        i++;
        continue;
      }
      const cp2 = (b1 & 31) << 6 | b22 & 63;
      pushCodeUnit(parts, chunk, cp2);
      i += 2;
      continue;
    }
    if (b1 <= 239) {
      if (i + 2 >= bytes.length) {
        pushCodeUnit(parts, chunk, REPLACEMENT);
        i++;
        continue;
      }
      const b22 = bytes[i + 1];
      const b32 = bytes[i + 2];
      const valid2 = (b22 & 192) === 128 && (b32 & 192) === 128 && !(b1 === 224 && b22 < 160) && // overlong
      !(b1 === 237 && b22 >= 160);
      if (!valid2) {
        pushCodeUnit(parts, chunk, REPLACEMENT);
        i++;
        continue;
      }
      const cp2 = (b1 & 15) << 12 | (b22 & 63) << 6 | b32 & 63;
      pushCodeUnit(parts, chunk, cp2);
      i += 3;
      continue;
    }
    if (i + 3 >= bytes.length) {
      pushCodeUnit(parts, chunk, REPLACEMENT);
      i++;
      continue;
    }
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];
    const b4 = bytes[i + 3];
    const valid = (b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128 && !(b1 === 240 && b2 < 144) && // overlong
    !(b1 === 244 && b2 > 143);
    if (!valid) {
      pushCodeUnit(parts, chunk, REPLACEMENT);
      i++;
      continue;
    }
    const cp = (b1 & 7) << 18 | (b2 & 63) << 12 | (b3 & 63) << 6 | b4 & 63;
    pushCodePoint(parts, chunk, cp);
    i += 4;
  }
  flushChunk(parts, chunk);
  return parts.join("");
}
function decodeUTF16LE(bytes) {
  const parts = [];
  const chunk = [];
  const len = bytes.length;
  let i = 0;
  while (i + 1 < len) {
    const u1 = bytes[i] | bytes[i + 1] << 8;
    i += 2;
    if (u1 >= 55296 && u1 <= 56319) {
      if (i + 1 < len) {
        const u2 = bytes[i] | bytes[i + 1] << 8;
        if (u2 >= 56320 && u2 <= 57343) {
          pushCodeUnit(parts, chunk, u1);
          pushCodeUnit(parts, chunk, u2);
          i += 2;
        } else {
          pushCodeUnit(parts, chunk, REPLACEMENT);
        }
      } else {
        pushCodeUnit(parts, chunk, REPLACEMENT);
      }
      continue;
    }
    if (u1 >= 56320 && u1 <= 57343) {
      pushCodeUnit(parts, chunk, REPLACEMENT);
      continue;
    }
    pushCodeUnit(parts, chunk, u1);
  }
  if (i < len) {
    pushCodeUnit(parts, chunk, REPLACEMENT);
  }
  flushChunk(parts, chunk);
  return parts.join("");
}
function decodeASCII(bytes) {
  const parts = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const end = Math.min(bytes.length, i + CHUNK);
    const codes = new Array(end - i);
    for (let j = i, k = 0; j < end; j++, k++) {
      codes[k] = bytes[j] & 127;
    }
    parts.push(String.fromCharCode.apply(null, codes));
  }
  return parts.join("");
}
function decodeLatin1(bytes) {
  const parts = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const end = Math.min(bytes.length, i + CHUNK);
    const codes = new Array(end - i);
    for (let j = i, k = 0; j < end; j++, k++) {
      codes[k] = bytes[j];
    }
    parts.push(String.fromCharCode.apply(null, codes));
  }
  return parts.join("");
}
function decodeWindows1252(bytes) {
  const parts = [];
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const extra = b >= 128 && b <= 159 ? WINDOWS_1252_EXTRA[b] : void 0;
    out += extra !== null && extra !== void 0 ? extra : String.fromCharCode(b);
    if (out.length >= CHUNK) {
      parts.push(out);
      out = "";
    }
  }
  if (out)
    parts.push(out);
  return parts.join("");
}
function encodeUTF8(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let cp = str.charCodeAt(i);
    if (cp >= 55296 && cp <= 56319) {
      if (i + 1 < str.length) {
        const lo = str.charCodeAt(i + 1);
        if (lo >= 56320 && lo <= 57343) {
          cp = 65536 + (cp - 55296 << 10) + (lo - 56320);
          i++;
        } else {
          cp = REPLACEMENT;
        }
      } else {
        cp = REPLACEMENT;
      }
    } else if (cp >= 56320 && cp <= 57343) {
      cp = REPLACEMENT;
    }
    if (cp < 128) {
      out.push(cp);
    } else if (cp < 2048) {
      out.push(192 | cp >> 6, 128 | cp & 63);
    } else if (cp < 65536) {
      out.push(224 | cp >> 12, 128 | cp >> 6 & 63, 128 | cp & 63);
    } else {
      out.push(240 | cp >> 18, 128 | cp >> 12 & 63, 128 | cp >> 6 & 63, 128 | cp & 63);
    }
  }
  return new Uint8Array(out);
}
function encodeUTF16LE(str) {
  const units = [];
  for (let i = 0; i < str.length; i++) {
    const u = str.charCodeAt(i);
    if (u >= 55296 && u <= 56319) {
      if (i + 1 < str.length) {
        const lo = str.charCodeAt(i + 1);
        if (lo >= 56320 && lo <= 57343) {
          units.push(u, lo);
          i++;
        } else {
          units.push(REPLACEMENT);
        }
      } else {
        units.push(REPLACEMENT);
      }
      continue;
    }
    if (u >= 56320 && u <= 57343) {
      units.push(REPLACEMENT);
      continue;
    }
    units.push(u);
  }
  const out = new Uint8Array(units.length * 2);
  for (let i = 0; i < units.length; i++) {
    const code = units[i];
    const o = i * 2;
    out[o] = code & 255;
    out[o + 1] = code >>> 8;
  }
  return out;
}
function encodeASCII(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++)
    out[i] = str.charCodeAt(i) & 127;
  return out;
}
function encodeLatin1(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++)
    out[i] = str.charCodeAt(i) & 255;
  return out;
}
function encodeWindows1252(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = ch.charCodeAt(0);
    if (WINDOWS_1252_REVERSE[ch] !== void 0) {
      out[i] = WINDOWS_1252_REVERSE[ch];
      continue;
    }
    if (code >= 0 && code <= 127 || code >= 160 && code <= 255) {
      out[i] = code;
      continue;
    }
    out[i] = 63;
  }
  return out;
}
var WINDOWS_1252_EXTRA, WINDOWS_1252_REVERSE, _utf8Decoder, _utf8Encoder, CHUNK, REPLACEMENT;
var init_lib2 = __esm({
  "node_modules/@borewit/text-codec/lib/index.js"() {
    WINDOWS_1252_EXTRA = {
      128: "\u20AC",
      130: "\u201A",
      131: "\u0192",
      132: "\u201E",
      133: "\u2026",
      134: "\u2020",
      135: "\u2021",
      136: "\u02C6",
      137: "\u2030",
      138: "\u0160",
      139: "\u2039",
      140: "\u0152",
      142: "\u017D",
      145: "\u2018",
      146: "\u2019",
      147: "\u201C",
      148: "\u201D",
      149: "\u2022",
      150: "\u2013",
      151: "\u2014",
      152: "\u02DC",
      153: "\u2122",
      154: "\u0161",
      155: "\u203A",
      156: "\u0153",
      158: "\u017E",
      159: "\u0178"
    };
    WINDOWS_1252_REVERSE = {};
    for (const [code, char] of Object.entries(WINDOWS_1252_EXTRA)) {
      WINDOWS_1252_REVERSE[char] = Number.parseInt(code, 10);
    }
    CHUNK = 32 * 1024;
    REPLACEMENT = 65533;
  }
});

// node_modules/token-types/lib/index.js
var lib_exports = {};
__export(lib_exports, {
  AnsiStringType: () => AnsiStringType,
  Float16_BE: () => Float16_BE,
  Float16_LE: () => Float16_LE,
  Float32_BE: () => Float32_BE,
  Float32_LE: () => Float32_LE,
  Float64_BE: () => Float64_BE,
  Float64_LE: () => Float64_LE,
  Float80_BE: () => Float80_BE,
  Float80_LE: () => Float80_LE,
  INT16_BE: () => INT16_BE,
  INT16_LE: () => INT16_LE,
  INT24_BE: () => INT24_BE,
  INT24_LE: () => INT24_LE,
  INT32_BE: () => INT32_BE,
  INT32_LE: () => INT32_LE,
  INT64_BE: () => INT64_BE,
  INT64_LE: () => INT64_LE,
  INT8: () => INT8,
  IgnoreType: () => IgnoreType,
  StringType: () => StringType,
  UINT16_BE: () => UINT16_BE,
  UINT16_LE: () => UINT16_LE,
  UINT24_BE: () => UINT24_BE,
  UINT24_LE: () => UINT24_LE,
  UINT32_BE: () => UINT32_BE,
  UINT32_LE: () => UINT32_LE,
  UINT64_BE: () => UINT64_BE,
  UINT64_LE: () => UINT64_LE,
  UINT8: () => UINT8,
  Uint8ArrayType: () => Uint8ArrayType
});
function dv(array) {
  return new DataView(array.buffer, array.byteOffset);
}
var ieee754, UINT8, UINT16_LE, UINT16_BE, UINT24_LE, UINT24_BE, UINT32_LE, UINT32_BE, INT8, INT16_BE, INT16_LE, INT24_LE, INT24_BE, INT32_BE, INT32_LE, UINT64_LE, INT64_LE, UINT64_BE, INT64_BE, Float16_BE, Float16_LE, Float32_BE, Float32_LE, Float64_BE, Float64_LE, Float80_BE, Float80_LE, IgnoreType, Uint8ArrayType, StringType, AnsiStringType;
var init_lib3 = __esm({
  "node_modules/token-types/lib/index.js"() {
    ieee754 = __toESM(require_ieee754(), 1);
    init_lib2();
    UINT8 = {
      len: 1,
      get(array, offset) {
        return dv(array).getUint8(offset);
      },
      put(array, offset, value) {
        dv(array).setUint8(offset, value);
        return offset + 1;
      }
    };
    UINT16_LE = {
      len: 2,
      get(array, offset) {
        return dv(array).getUint16(offset, true);
      },
      put(array, offset, value) {
        dv(array).setUint16(offset, value, true);
        return offset + 2;
      }
    };
    UINT16_BE = {
      len: 2,
      get(array, offset) {
        return dv(array).getUint16(offset);
      },
      put(array, offset, value) {
        dv(array).setUint16(offset, value);
        return offset + 2;
      }
    };
    UINT24_LE = {
      len: 3,
      get(array, offset) {
        const dataView = dv(array);
        return dataView.getUint8(offset) + (dataView.getUint16(offset + 1, true) << 8);
      },
      put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint8(offset, value & 255);
        dataView.setUint16(offset + 1, value >> 8, true);
        return offset + 3;
      }
    };
    UINT24_BE = {
      len: 3,
      get(array, offset) {
        const dataView = dv(array);
        return (dataView.getUint16(offset) << 8) + dataView.getUint8(offset + 2);
      },
      put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint16(offset, value >> 8);
        dataView.setUint8(offset + 2, value & 255);
        return offset + 3;
      }
    };
    UINT32_LE = {
      len: 4,
      get(array, offset) {
        return dv(array).getUint32(offset, true);
      },
      put(array, offset, value) {
        dv(array).setUint32(offset, value, true);
        return offset + 4;
      }
    };
    UINT32_BE = {
      len: 4,
      get(array, offset) {
        return dv(array).getUint32(offset);
      },
      put(array, offset, value) {
        dv(array).setUint32(offset, value);
        return offset + 4;
      }
    };
    INT8 = {
      len: 1,
      get(array, offset) {
        return dv(array).getInt8(offset);
      },
      put(array, offset, value) {
        dv(array).setInt8(offset, value);
        return offset + 1;
      }
    };
    INT16_BE = {
      len: 2,
      get(array, offset) {
        return dv(array).getInt16(offset);
      },
      put(array, offset, value) {
        dv(array).setInt16(offset, value);
        return offset + 2;
      }
    };
    INT16_LE = {
      len: 2,
      get(array, offset) {
        return dv(array).getInt16(offset, true);
      },
      put(array, offset, value) {
        dv(array).setInt16(offset, value, true);
        return offset + 2;
      }
    };
    INT24_LE = {
      len: 3,
      get(array, offset) {
        const unsigned = UINT24_LE.get(array, offset);
        return unsigned > 8388607 ? unsigned - 16777216 : unsigned;
      },
      put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint8(offset, value & 255);
        dataView.setUint16(offset + 1, value >> 8, true);
        return offset + 3;
      }
    };
    INT24_BE = {
      len: 3,
      get(array, offset) {
        const unsigned = UINT24_BE.get(array, offset);
        return unsigned > 8388607 ? unsigned - 16777216 : unsigned;
      },
      put(array, offset, value) {
        const dataView = dv(array);
        dataView.setUint16(offset, value >> 8);
        dataView.setUint8(offset + 2, value & 255);
        return offset + 3;
      }
    };
    INT32_BE = {
      len: 4,
      get(array, offset) {
        return dv(array).getInt32(offset);
      },
      put(array, offset, value) {
        dv(array).setInt32(offset, value);
        return offset + 4;
      }
    };
    INT32_LE = {
      len: 4,
      get(array, offset) {
        return dv(array).getInt32(offset, true);
      },
      put(array, offset, value) {
        dv(array).setInt32(offset, value, true);
        return offset + 4;
      }
    };
    UINT64_LE = {
      len: 8,
      get(array, offset) {
        return dv(array).getBigUint64(offset, true);
      },
      put(array, offset, value) {
        dv(array).setBigUint64(offset, value, true);
        return offset + 8;
      }
    };
    INT64_LE = {
      len: 8,
      get(array, offset) {
        return dv(array).getBigInt64(offset, true);
      },
      put(array, offset, value) {
        dv(array).setBigInt64(offset, value, true);
        return offset + 8;
      }
    };
    UINT64_BE = {
      len: 8,
      get(array, offset) {
        return dv(array).getBigUint64(offset);
      },
      put(array, offset, value) {
        dv(array).setBigUint64(offset, value);
        return offset + 8;
      }
    };
    INT64_BE = {
      len: 8,
      get(array, offset) {
        return dv(array).getBigInt64(offset);
      },
      put(array, offset, value) {
        dv(array).setBigInt64(offset, value);
        return offset + 8;
      }
    };
    Float16_BE = {
      len: 2,
      get(dataView, offset) {
        return ieee754.read(dataView, offset, false, 10, this.len);
      },
      put(dataView, offset, value) {
        ieee754.write(dataView, value, offset, false, 10, this.len);
        return offset + this.len;
      }
    };
    Float16_LE = {
      len: 2,
      get(array, offset) {
        return ieee754.read(array, offset, true, 10, this.len);
      },
      put(array, offset, value) {
        ieee754.write(array, value, offset, true, 10, this.len);
        return offset + this.len;
      }
    };
    Float32_BE = {
      len: 4,
      get(array, offset) {
        return dv(array).getFloat32(offset);
      },
      put(array, offset, value) {
        dv(array).setFloat32(offset, value);
        return offset + 4;
      }
    };
    Float32_LE = {
      len: 4,
      get(array, offset) {
        return dv(array).getFloat32(offset, true);
      },
      put(array, offset, value) {
        dv(array).setFloat32(offset, value, true);
        return offset + 4;
      }
    };
    Float64_BE = {
      len: 8,
      get(array, offset) {
        return dv(array).getFloat64(offset);
      },
      put(array, offset, value) {
        dv(array).setFloat64(offset, value);
        return offset + 8;
      }
    };
    Float64_LE = {
      len: 8,
      get(array, offset) {
        return dv(array).getFloat64(offset, true);
      },
      put(array, offset, value) {
        dv(array).setFloat64(offset, value, true);
        return offset + 8;
      }
    };
    Float80_BE = {
      len: 10,
      get(array, offset) {
        return ieee754.read(array, offset, false, 63, this.len);
      },
      put(array, offset, value) {
        ieee754.write(array, value, offset, false, 63, this.len);
        return offset + this.len;
      }
    };
    Float80_LE = {
      len: 10,
      get(array, offset) {
        return ieee754.read(array, offset, true, 63, this.len);
      },
      put(array, offset, value) {
        ieee754.write(array, value, offset, true, 63, this.len);
        return offset + this.len;
      }
    };
    IgnoreType = class {
      /**
       * @param len number of bytes to ignore
       */
      constructor(len) {
        this.len = len;
      }
      // ToDo: don't read, but skip data
      get(_array, _off) {
      }
    };
    Uint8ArrayType = class {
      constructor(len) {
        this.len = len;
      }
      get(array, offset) {
        return array.subarray(offset, offset + this.len);
      }
    };
    StringType = class {
      constructor(len, encoding) {
        this.len = len;
        this.encoding = encoding;
      }
      get(data, offset = 0) {
        const bytes = data.subarray(offset, offset + this.len);
        return textDecode(bytes, this.encoding);
      }
    };
    AnsiStringType = class extends StringType {
      constructor(len) {
        super(len, "windows-1252");
      }
    };
  }
});

// node_modules/uint8array-extras/index.js
function isType(value, typeConstructor, typeStringified) {
  if (!value) {
    return false;
  }
  if (value.constructor === typeConstructor) {
    return true;
  }
  return objectToString.call(value) === typeStringified;
}
function isUint8Array(value) {
  return isType(value, Uint8Array, uint8ArrayStringified);
}
function assertUint8Array(value) {
  if (!isUint8Array(value)) {
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
  }
}
function uint8ArrayToHex(array) {
  assertUint8Array(array);
  let hexString = "";
  for (let index = 0; index < array.length; index++) {
    hexString += byteToHexLookupTable[array[index]];
  }
  return hexString;
}
function getUintBE(view) {
  const { byteLength } = view;
  if (byteLength === 6) {
    return view.getUint16(0) * 2 ** 32 + view.getUint32(2);
  }
  if (byteLength === 5) {
    return view.getUint8(0) * 2 ** 32 + view.getUint32(1);
  }
  if (byteLength === 4) {
    return view.getUint32(0);
  }
  if (byteLength === 3) {
    return view.getUint8(0) * 2 ** 16 + view.getUint16(1);
  }
  if (byteLength === 2) {
    return view.getUint16(0);
  }
  if (byteLength === 1) {
    return view.getUint8(0);
  }
}
var objectToString, uint8ArrayStringified, cachedDecoders, cachedEncoder, byteToHexLookupTable;
var init_uint8array_extras = __esm({
  "node_modules/uint8array-extras/index.js"() {
    objectToString = Object.prototype.toString;
    uint8ArrayStringified = "[object Uint8Array]";
    cachedDecoders = {
      utf8: new globalThis.TextDecoder("utf8")
    };
    cachedEncoder = new globalThis.TextEncoder();
    byteToHexLookupTable = Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));
  }
});

// node_modules/content-type/index.js
var require_content_type = __commonJS({
  "node_modules/content-type/index.js"(exports2) {
    "use strict";
    var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;
    var TEXT_REGEXP = /^[\u000b\u0020-\u007e\u0080-\u00ff]+$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    var QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g;
    var QUOTE_REGEXP = /([\\"])/g;
    var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    exports2.format = format;
    exports2.parse = parse;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var parameters = obj.parameters;
      var type = obj.type;
      if (!type || !TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      var string = type;
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          if (!TOKEN_REGEXP.test(param)) {
            throw new TypeError("invalid parameter name");
          }
          string += "; " + param + "=" + qstring(parameters[param]);
        }
      }
      return string;
    }
    function parse(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      var header = typeof string === "object" ? getcontenttype(string) : string;
      if (typeof header !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var index = header.indexOf(";");
      var type = index !== -1 ? header.slice(0, index).trim() : header.trim();
      if (!TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid media type");
      }
      var obj = new ContentType2(type.toLowerCase());
      if (index !== -1) {
        var key;
        var match;
        var value;
        PARAM_REGEXP.lastIndex = index;
        while (match = PARAM_REGEXP.exec(header)) {
          if (match.index !== index) {
            throw new TypeError("invalid parameter format");
          }
          index += match[0].length;
          key = match[1].toLowerCase();
          value = match[2];
          if (value.charCodeAt(0) === 34) {
            value = value.slice(1, -1);
            if (value.indexOf("\\") !== -1) {
              value = value.replace(QESC_REGEXP, "$1");
            }
          }
          obj.parameters[key] = value;
        }
        if (index !== header.length) {
          throw new TypeError("invalid parameter format");
        }
      }
      return obj;
    }
    function getcontenttype(obj) {
      var header;
      if (typeof obj.getHeader === "function") {
        header = obj.getHeader("content-type");
      } else if (typeof obj.headers === "object") {
        header = obj.headers && obj.headers["content-type"];
      }
      if (typeof header !== "string") {
        throw new TypeError("content-type header is missing from object");
      }
      return header;
    }
    function qstring(val) {
      var str = String(val);
      if (TOKEN_REGEXP.test(str)) {
        return str;
      }
      if (str.length > 0 && !TEXT_REGEXP.test(str)) {
        throw new TypeError("invalid parameter value");
      }
      return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    function ContentType2(type) {
      this.parameters = /* @__PURE__ */ Object.create(null);
      this.type = type;
    }
  }
});

// node_modules/media-typer/index.js
var require_media_typer = __commonJS({
  "node_modules/media-typer/index.js"(exports2) {
    "use strict";
    var SUBTYPE_NAME_REGEXP = /^[A-Za-z0-9][A-Za-z0-9!#$&^_.-]{0,126}$/;
    var TYPE_NAME_REGEXP = /^[A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126}$/;
    var TYPE_REGEXP = /^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$/;
    exports2.format = format;
    exports2.parse = parse;
    exports2.test = test;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var subtype = obj.subtype;
      var suffix = obj.suffix;
      var type = obj.type;
      if (!type || !TYPE_NAME_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      if (!subtype || !SUBTYPE_NAME_REGEXP.test(subtype)) {
        throw new TypeError("invalid subtype");
      }
      var string = type + "/" + subtype;
      if (suffix) {
        if (!TYPE_NAME_REGEXP.test(suffix)) {
          throw new TypeError("invalid suffix");
        }
        string += "+" + suffix;
      }
      return string;
    }
    function test(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      if (typeof string !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      return TYPE_REGEXP.test(string.toLowerCase());
    }
    function parse(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      if (typeof string !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var match = TYPE_REGEXP.exec(string.toLowerCase());
      if (!match) {
        throw new TypeError("invalid media type");
      }
      var type = match[1];
      var subtype = match[2];
      var suffix;
      var index = subtype.lastIndexOf("+");
      if (index !== -1) {
        suffix = subtype.substr(index + 1);
        subtype = subtype.substr(0, index);
      }
      return new MediaType(type, subtype, suffix);
    }
    function MediaType(type, subtype, suffix) {
      this.type = type;
      this.subtype = subtype;
      this.suffix = suffix;
    }
  }
});

// node_modules/music-metadata/lib/matroska/types.js
var TargetType, TrackType, TrackTypeValueToKeyMap;
var init_types = __esm({
  "node_modules/music-metadata/lib/matroska/types.js"() {
    TargetType = {
      10: "shot",
      20: "scene",
      30: "track",
      40: "part",
      50: "album",
      60: "edition",
      70: "collection"
    };
    TrackType = {
      video: 1,
      audio: 2,
      complex: 3,
      logo: 4,
      subtitle: 17,
      button: 18,
      control: 32
    };
    TrackTypeValueToKeyMap = {
      [TrackType.video]: "video",
      [TrackType.audio]: "audio",
      [TrackType.complex]: "complex",
      [TrackType.logo]: "logo",
      [TrackType.subtitle]: "subtitle",
      [TrackType.button]: "button",
      [TrackType.control]: "control"
    };
  }
});

// node_modules/music-metadata/lib/ParseError.js
var makeParseError, CouldNotDetermineFileTypeError, UnsupportedFileTypeError, UnexpectedFileContentError, FieldDecodingError, InternalParserError, makeUnexpectedFileContentError;
var init_ParseError = __esm({
  "node_modules/music-metadata/lib/ParseError.js"() {
    makeParseError = (name) => {
      return class ParseError extends Error {
        constructor(message) {
          super(message);
          this.name = name;
        }
      };
    };
    CouldNotDetermineFileTypeError = class extends makeParseError("CouldNotDetermineFileTypeError") {
    };
    UnsupportedFileTypeError = class extends makeParseError("UnsupportedFileTypeError") {
    };
    UnexpectedFileContentError = class extends makeParseError("UnexpectedFileContentError") {
      constructor(fileType, message) {
        super(message);
        this.fileType = fileType;
      }
      // Override toString to include file type information.
      toString() {
        return `${this.name} (FileType: ${this.fileType}): ${this.message}`;
      }
    };
    FieldDecodingError = class extends makeParseError("FieldDecodingError") {
    };
    InternalParserError = class extends makeParseError("InternalParserError") {
    };
    makeUnexpectedFileContentError = (fileType) => {
      return class extends UnexpectedFileContentError {
        constructor(message) {
          super(fileType, message);
        }
      };
    };
  }
});

// node_modules/music-metadata/lib/common/Util.js
function getBit(buf, off, bit) {
  return (buf[off] & 1 << bit) !== 0;
}
function findZero(uint8Array, encoding) {
  const len = uint8Array.length;
  if (encoding === "utf-16le") {
    for (let i = 0; i + 1 < len; i += 2) {
      if (uint8Array[i] === 0 && uint8Array[i + 1] === 0)
        return i;
    }
    return len;
  }
  for (let i = 0; i < len; i++) {
    if (uint8Array[i] === 0)
      return i;
  }
  return len;
}
function trimRightNull(x) {
  const pos0 = x.indexOf("\0");
  return pos0 === -1 ? x : x.substring(0, pos0);
}
function swapBytes(uint8Array) {
  const l = uint8Array.length;
  if ((l & 1) !== 0)
    throw new FieldDecodingError("Buffer length must be even");
  for (let i = 0; i < l; i += 2) {
    const a = uint8Array[i];
    uint8Array[i] = uint8Array[i + 1];
    uint8Array[i + 1] = a;
  }
  return uint8Array;
}
function decodeString(uint8Array, encoding) {
  if (uint8Array[0] === 255 && uint8Array[1] === 254) {
    return decodeString(uint8Array.subarray(2), encoding);
  }
  if (encoding === "utf-16le" && uint8Array[0] === 254 && uint8Array[1] === 255) {
    if ((uint8Array.length & 1) !== 0)
      throw new FieldDecodingError("Expected even number of octets for 16-bit unicode string");
    return decodeString(swapBytes(uint8Array), encoding);
  }
  return new StringType(uint8Array.length, encoding).get(uint8Array, 0);
}
function stripNulls(str) {
  str = str.replace(/^\x00+/g, "");
  str = str.replace(/\x00+$/g, "");
  return str;
}
function getBitAllignedNumber(source, byteOffset, bitOffset, len) {
  const byteOff = byteOffset + ~~(bitOffset / 8);
  const bitOff = bitOffset % 8;
  let value = source[byteOff];
  value &= 255 >> bitOff;
  const bitsRead = 8 - bitOff;
  const bitsLeft = len - bitsRead;
  if (bitsLeft < 0) {
    value >>= 8 - bitOff - len;
  } else if (bitsLeft > 0) {
    value <<= bitsLeft;
    value |= getBitAllignedNumber(source, byteOffset, bitOffset + bitsRead, bitsLeft);
  }
  return value;
}
function isBitSet(source, byteOffset, bitOffset) {
  return getBitAllignedNumber(source, byteOffset, bitOffset, 1) === 1;
}
function a2hex(str) {
  const arr = [];
  for (let i = 0, l = str.length; i < l; i++) {
    const hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex.length === 1 ? `0${hex}` : hex);
  }
  return arr.join(" ");
}
function ratioToDb(ratio) {
  return 10 * Math.log10(ratio);
}
function dbToRatio(dB) {
  return 10 ** (dB / 10);
}
function toRatio(value) {
  const ps = value.split(" ").map((p) => p.trim().toLowerCase());
  if (ps.length >= 1) {
    const v = Number.parseFloat(ps[0]);
    return ps.length === 2 && ps[1] === "db" ? {
      dB: v,
      ratio: dbToRatio(v)
    } : {
      dB: ratioToDb(v),
      ratio: v
    };
  }
}
function decodeUintBE(uint8Array) {
  if (uint8Array.length === 0) {
    throw new Error("decodeUintBE: empty Uint8Array");
  }
  const view = new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);
  return getUintBE(view);
}
var init_Util = __esm({
  "node_modules/music-metadata/lib/common/Util.js"() {
    init_lib3();
    init_ParseError();
    init_uint8array_extras();
  }
});

// node_modules/music-metadata/lib/id3v2/ID3v2Token.js
var AttachedPictureType, LyricsContentType, TimestampFormat, UINT32SYNCSAFE, ID3v2Header, ExtendedHeader, TextEncodingToken, TextHeader, SyncTextHeader;
var init_ID3v2Token = __esm({
  "node_modules/music-metadata/lib/id3v2/ID3v2Token.js"() {
    init_lib3();
    init_Util();
    AttachedPictureType = {
      0: "Other",
      1: "32x32 pixels 'file icon' (PNG only)",
      2: "Other file icon",
      3: "Cover (front)",
      4: "Cover (back)",
      5: "Leaflet page",
      6: "Media (e.g. label side of CD)",
      7: "Lead artist/lead performer/soloist",
      8: "Artist/performer",
      9: "Conductor",
      10: "Band/Orchestra",
      11: "Composer",
      12: "Lyricist/text writer",
      13: "Recording Location",
      14: "During recording",
      15: "During performance",
      16: "Movie/video screen capture",
      17: "A bright coloured fish",
      18: "Illustration",
      19: "Band/artist logotype",
      20: "Publisher/Studio logotype"
    };
    LyricsContentType = {
      other: 0,
      lyrics: 1,
      text: 2,
      movement_part: 3,
      events: 4,
      chord: 5,
      trivia_pop: 6
    };
    TimestampFormat = {
      notSynchronized: 0,
      mpegFrameNumber: 1,
      milliseconds: 2
    };
    UINT32SYNCSAFE = {
      get: (buf, off) => {
        return buf[off + 3] & 127 | buf[off + 2] << 7 | buf[off + 1] << 14 | buf[off] << 21;
      },
      len: 4
    };
    ID3v2Header = {
      len: 10,
      get: (buf, off) => {
        return {
          // ID3v2/file identifier   "ID3"
          fileIdentifier: new StringType(3, "ascii").get(buf, off),
          // ID3v2 versionIndex
          version: {
            major: INT8.get(buf, off + 3),
            revision: INT8.get(buf, off + 4)
          },
          // ID3v2 flags
          flags: {
            // Unsynchronisation
            unsynchronisation: getBit(buf, off + 5, 7),
            // Extended header
            isExtendedHeader: getBit(buf, off + 5, 6),
            // Experimental indicator
            expIndicator: getBit(buf, off + 5, 5),
            footer: getBit(buf, off + 5, 4)
          },
          size: UINT32SYNCSAFE.get(buf, off + 6)
        };
      }
    };
    ExtendedHeader = {
      len: 10,
      get: (buf, off) => {
        return {
          // Extended header size
          size: UINT32_BE.get(buf, off),
          // Extended Flags
          extendedFlags: UINT16_BE.get(buf, off + 4),
          // Size of padding
          sizeOfPadding: UINT32_BE.get(buf, off + 6),
          // CRC data present
          crcDataPresent: getBit(buf, off + 4, 31)
        };
      }
    };
    TextEncodingToken = {
      len: 1,
      get: (uint8Array, off) => {
        switch (uint8Array[off]) {
          case 0:
            return { encoding: "latin1" };
          // binary
          case 1:
            return { encoding: "utf-16le", bom: true };
          case 2:
            return { encoding: "utf-16le", bom: false };
          case 3:
            return { encoding: "utf8", bom: false };
          default:
            return { encoding: "utf8", bom: false };
        }
      }
    };
    TextHeader = {
      len: 4,
      get: (uint8Array, off) => {
        return {
          encoding: TextEncodingToken.get(uint8Array, off),
          language: new StringType(3, "latin1").get(uint8Array, off + 1)
        };
      }
    };
    SyncTextHeader = {
      len: 6,
      get: (uint8Array, off) => {
        const text = TextHeader.get(uint8Array, off);
        return {
          encoding: text.encoding,
          language: text.language,
          timeStampFormat: UINT8.get(uint8Array, off + 4),
          contentType: UINT8.get(uint8Array, off + 5)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/type.js
var init_type = __esm({
  "node_modules/music-metadata/lib/type.js"() {
    init_types();
    init_ID3v2Token();
  }
});

// node_modules/music-metadata/lib/common/BasicParser.js
var BasicParser;
var init_BasicParser = __esm({
  "node_modules/music-metadata/lib/common/BasicParser.js"() {
    BasicParser = class {
      /**
       * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
       * @param {INativeMetadataCollector} metadata Output
       * @param {ITokenizer} tokenizer Input
       * @param {IOptions} options Parsing options
       */
      constructor(metadata, tokenizer, options) {
        this.metadata = metadata;
        this.tokenizer = tokenizer;
        this.options = options;
      }
    };
  }
});

// node_modules/music-metadata/lib/common/FourCC.js
var validFourCC, FourCcToken;
var init_FourCC = __esm({
  "node_modules/music-metadata/lib/common/FourCC.js"() {
    init_lib2();
    init_Util();
    init_ParseError();
    validFourCC = /^[\x21-\x7e©][\x20-\x7e\x00()]{3}/;
    FourCcToken = {
      len: 4,
      get: (buf, off) => {
        const id = textDecode(buf.subarray(off, off + FourCcToken.len), "latin1");
        if (!id.match(validFourCC)) {
          throw new FieldDecodingError(`FourCC contains invalid characters: ${a2hex(id)} "${id}"`);
        }
        return id;
      },
      put: (buffer, offset, id) => {
        const str = textEncode(id, "latin1");
        if (str.length !== 4)
          throw new InternalParserError("Invalid length");
        buffer.set(str, offset);
        return offset + 4;
      }
    };
  }
});

// node_modules/music-metadata/lib/apev2/APEv2Token.js
function parseTagFlags(flags) {
  return {
    containsHeader: isBitSet2(flags, 31),
    containsFooter: isBitSet2(flags, 30),
    isHeader: isBitSet2(flags, 29),
    readOnly: isBitSet2(flags, 0),
    dataType: (flags & 6) >> 1
  };
}
function isBitSet2(num, bit) {
  return (num & 1 << bit) !== 0;
}
var DataType, DescriptorParser, Header, TagFooter, TagItemHeader;
var init_APEv2Token = __esm({
  "node_modules/music-metadata/lib/apev2/APEv2Token.js"() {
    init_lib3();
    init_FourCC();
    DataType = {
      text_utf8: 0,
      binary: 1,
      external_info: 2,
      reserved: 3
    };
    DescriptorParser = {
      len: 52,
      get: (buf, off) => {
        return {
          // should equal 'MAC '
          ID: FourCcToken.get(buf, off),
          // versionIndex number * 1000 (3.81 = 3810) (remember that 4-byte alignment causes this to take 4-bytes)
          version: UINT32_LE.get(buf, off + 4) / 1e3,
          // the number of descriptor bytes (allows later expansion of this header)
          descriptorBytes: UINT32_LE.get(buf, off + 8),
          // the number of header APE_HEADER bytes
          headerBytes: UINT32_LE.get(buf, off + 12),
          // the number of header APE_HEADER bytes
          seekTableBytes: UINT32_LE.get(buf, off + 16),
          // the number of header data bytes (from original file)
          headerDataBytes: UINT32_LE.get(buf, off + 20),
          // the number of bytes of APE frame data
          apeFrameDataBytes: UINT32_LE.get(buf, off + 24),
          // the high order number of APE frame data bytes
          apeFrameDataBytesHigh: UINT32_LE.get(buf, off + 28),
          // the terminating data of the file (not including tag data)
          terminatingDataBytes: UINT32_LE.get(buf, off + 32),
          // the MD5 hash of the file (see notes for usage... it's a little tricky)
          fileMD5: new Uint8ArrayType(16).get(buf, off + 36)
        };
      }
    };
    Header = {
      len: 24,
      get: (buf, off) => {
        return {
          // the compression level (see defines I.E. COMPRESSION_LEVEL_FAST)
          compressionLevel: UINT16_LE.get(buf, off),
          // any format flags (for future use)
          formatFlags: UINT16_LE.get(buf, off + 2),
          // the number of audio blocks in one frame
          blocksPerFrame: UINT32_LE.get(buf, off + 4),
          // the number of audio blocks in the final frame
          finalFrameBlocks: UINT32_LE.get(buf, off + 8),
          // the total number of frames
          totalFrames: UINT32_LE.get(buf, off + 12),
          // the bits per sample (typically 16)
          bitsPerSample: UINT16_LE.get(buf, off + 16),
          // the number of channels (1 or 2)
          channel: UINT16_LE.get(buf, off + 18),
          // the sample rate (typically 44100)
          sampleRate: UINT32_LE.get(buf, off + 20)
        };
      }
    };
    TagFooter = {
      len: 32,
      get: (buf, off) => {
        return {
          // should equal 'APETAGEX'
          ID: new StringType(8, "ascii").get(buf, off),
          // equals CURRENT_APE_TAG_VERSION
          version: UINT32_LE.get(buf, off + 8),
          // the complete size of the tag, including this footer (excludes header)
          size: UINT32_LE.get(buf, off + 12),
          // the number of fields in the tag
          fields: UINT32_LE.get(buf, off + 16),
          // reserved for later use (must be zero),
          flags: parseTagFlags(UINT32_LE.get(buf, off + 20))
        };
      }
    };
    TagItemHeader = {
      len: 8,
      get: (buf, off) => {
        return {
          // Length of assigned value in bytes
          size: UINT32_LE.get(buf, off),
          // reserved for later use (must be zero),
          flags: parseTagFlags(UINT32_LE.get(buf, off + 4))
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/apev2/APEv2Parser.js
var APEv2Parser_exports = {};
__export(APEv2Parser_exports, {
  APEv2Parser: () => APEv2Parser,
  ApeContentError: () => ApeContentError,
  tryParseApeHeader: () => tryParseApeHeader
});
function tryParseApeHeader(metadata, tokenizer, options) {
  const apeParser = new APEv2Parser(metadata, tokenizer, options);
  return apeParser.tryParseApeHeader();
}
var import_debug3, debug3, tagFormat, preamble, ApeContentError, APEv2Parser;
var init_APEv2Parser = __esm({
  "node_modules/music-metadata/lib/apev2/APEv2Parser.js"() {
    import_debug3 = __toESM(require_src(), 1);
    init_lib();
    init_lib3();
    init_Util();
    init_BasicParser();
    init_APEv2Token();
    init_ParseError();
    init_lib2();
    debug3 = (0, import_debug3.default)("music-metadata:parser:APEv2");
    tagFormat = "APEv2";
    preamble = "APETAGEX";
    ApeContentError = class extends makeUnexpectedFileContentError("APEv2") {
    };
    APEv2Parser = class _APEv2Parser extends BasicParser {
      constructor() {
        super(...arguments);
        this.ape = {};
      }
      /**
       * Calculate the media file duration
       * @param ah ApeHeader
       * @return {number} duration in seconds
       */
      static calculateDuration(ah) {
        let duration = ah.totalFrames > 1 ? ah.blocksPerFrame * (ah.totalFrames - 1) : 0;
        duration += ah.finalFrameBlocks;
        return duration / ah.sampleRate;
      }
      /**
       * Calculates the APEv1 / APEv2 first field offset
       * @param tokenizer
       * @param offset
       */
      static async findApeFooterOffset(tokenizer, offset) {
        const apeBuf = new Uint8Array(TagFooter.len);
        const position = tokenizer.position;
        if (offset <= TagFooter.len) {
          debug3(`Offset is too small to read APE footer: offset=${offset}`);
          return void 0;
        }
        if (offset > TagFooter.len) {
          await tokenizer.readBuffer(apeBuf, { position: offset - TagFooter.len });
          tokenizer.setPosition(position);
          const tagFooter = TagFooter.get(apeBuf, 0);
          if (tagFooter.ID === "APETAGEX") {
            if (tagFooter.flags.isHeader) {
              debug3(`APE Header found at offset=${offset - TagFooter.len}`);
            } else {
              debug3(`APE Footer found at offset=${offset - TagFooter.len}`);
              offset -= tagFooter.size;
            }
            return { footer: tagFooter, offset };
          }
        }
      }
      static parseTagFooter(metadata, buffer, options) {
        const footer = TagFooter.get(buffer, buffer.length - TagFooter.len);
        if (footer.ID !== preamble)
          throw new ApeContentError("Unexpected APEv2 Footer ID preamble value");
        fromBuffer(buffer);
        const apeParser = new _APEv2Parser(metadata, fromBuffer(buffer), options);
        return apeParser.parseTags(footer);
      }
      /**
       * Parse APEv1 / APEv2 header if header signature found
       */
      async tryParseApeHeader() {
        if (this.tokenizer.fileInfo.size && this.tokenizer.fileInfo.size - this.tokenizer.position < TagFooter.len) {
          debug3("No APEv2 header found, end-of-file reached");
          return;
        }
        const footer = await this.tokenizer.peekToken(TagFooter);
        if (footer.ID === preamble) {
          await this.tokenizer.ignore(TagFooter.len);
          return this.parseTags(footer);
        }
        debug3(`APEv2 header not found at offset=${this.tokenizer.position}`);
        if (this.tokenizer.fileInfo.size) {
          const remaining = this.tokenizer.fileInfo.size - this.tokenizer.position;
          const buffer = new Uint8Array(remaining);
          await this.tokenizer.readBuffer(buffer);
          return _APEv2Parser.parseTagFooter(this.metadata, buffer, this.options);
        }
      }
      async parse() {
        const descriptor = await this.tokenizer.readToken(DescriptorParser);
        if (descriptor.ID !== "MAC ")
          throw new ApeContentError("Unexpected descriptor ID");
        this.ape.descriptor = descriptor;
        const lenExp = descriptor.descriptorBytes - DescriptorParser.len;
        const header = await (lenExp > 0 ? this.parseDescriptorExpansion(lenExp) : this.parseHeader());
        this.metadata.setAudioOnly();
        await this.tokenizer.ignore(header.forwardBytes);
        return this.tryParseApeHeader();
      }
      async parseTags(footer) {
        const keyBuffer = new Uint8Array(256);
        let bytesRemaining = footer.size - TagFooter.len;
        debug3(`Parse APE tags at offset=${this.tokenizer.position}, size=${bytesRemaining}`);
        for (let i = 0; i < footer.fields; i++) {
          if (bytesRemaining < TagItemHeader.len) {
            this.metadata.addWarning(`APEv2 Tag-header: ${footer.fields - i} items remaining, but no more tag data to read.`);
            break;
          }
          const tagItemHeader = await this.tokenizer.readToken(TagItemHeader);
          bytesRemaining -= TagItemHeader.len + tagItemHeader.size;
          await this.tokenizer.peekBuffer(keyBuffer, { length: Math.min(keyBuffer.length, bytesRemaining) });
          let zero = findZero(keyBuffer);
          const key = await this.tokenizer.readToken(new StringType(zero, "ascii"));
          await this.tokenizer.ignore(1);
          bytesRemaining -= key.length + 1;
          switch (tagItemHeader.flags.dataType) {
            case DataType.text_utf8: {
              const value = await this.tokenizer.readToken(new StringType(tagItemHeader.size, "utf8"));
              const values = value.split(/\x00/g);
              await Promise.all(values.map((val) => this.metadata.addTag(tagFormat, key, val)));
              break;
            }
            case DataType.binary:
              if (this.options.skipCovers) {
                await this.tokenizer.ignore(tagItemHeader.size);
              } else {
                const picData = new Uint8Array(tagItemHeader.size);
                await this.tokenizer.readBuffer(picData);
                zero = findZero(picData);
                const description = textDecode(picData.subarray(0, zero), "utf-8");
                const data = picData.subarray(zero + 1);
                await this.metadata.addTag(tagFormat, key, {
                  description,
                  data
                });
              }
              break;
            case DataType.external_info:
              debug3(`Ignore external info ${key}`);
              await this.tokenizer.ignore(tagItemHeader.size);
              break;
            case DataType.reserved:
              debug3(`Ignore external info ${key}`);
              this.metadata.addWarning(`APEv2 header declares a reserved datatype for "${key}"`);
              await this.tokenizer.ignore(tagItemHeader.size);
              break;
          }
        }
      }
      async parseDescriptorExpansion(lenExp) {
        await this.tokenizer.ignore(lenExp);
        return this.parseHeader();
      }
      async parseHeader() {
        const header = await this.tokenizer.readToken(Header);
        this.metadata.setFormat("lossless", true);
        this.metadata.setFormat("container", "Monkey's Audio");
        this.metadata.setFormat("bitsPerSample", header.bitsPerSample);
        this.metadata.setFormat("sampleRate", header.sampleRate);
        this.metadata.setFormat("numberOfChannels", header.channel);
        this.metadata.setFormat("duration", _APEv2Parser.calculateDuration(header));
        if (!this.ape.descriptor) {
          throw new ApeContentError("Missing APE descriptor");
        }
        return {
          forwardBytes: this.ape.descriptor.seekTableBytes + this.ape.descriptor.headerDataBytes + this.ape.descriptor.apeFrameDataBytes + this.ape.descriptor.terminatingDataBytes
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/id3v1/ID3v1Parser.js
async function hasID3v1Header(tokenizer) {
  if (tokenizer.fileInfo.size >= 128) {
    const tag = new Uint8Array(3);
    const position = tokenizer.position;
    await tokenizer.readBuffer(tag, { position: tokenizer.fileInfo.size - 128 });
    tokenizer.setPosition(position);
    return textDecode(tag, "latin1") === "TAG";
  }
  return false;
}
var import_debug4, debug4, Genres, Iid3v1Token, Id3v1StringType, ID3v1Parser;
var init_ID3v1Parser = __esm({
  "node_modules/music-metadata/lib/id3v1/ID3v1Parser.js"() {
    import_debug4 = __toESM(require_src(), 1);
    init_lib3();
    init_Util();
    init_BasicParser();
    init_APEv2Parser();
    init_lib2();
    debug4 = (0, import_debug4.default)("music-metadata:parser:ID3v1");
    Genres = [
      "Blues",
      "Classic Rock",
      "Country",
      "Dance",
      "Disco",
      "Funk",
      "Grunge",
      "Hip-Hop",
      "Jazz",
      "Metal",
      "New Age",
      "Oldies",
      "Other",
      "Pop",
      "R&B",
      "Rap",
      "Reggae",
      "Rock",
      "Techno",
      "Industrial",
      "Alternative",
      "Ska",
      "Death Metal",
      "Pranks",
      "Soundtrack",
      "Euro-Techno",
      "Ambient",
      "Trip-Hop",
      "Vocal",
      "Jazz+Funk",
      "Fusion",
      "Trance",
      "Classical",
      "Instrumental",
      "Acid",
      "House",
      "Game",
      "Sound Clip",
      "Gospel",
      "Noise",
      "Alt. Rock",
      "Bass",
      "Soul",
      "Punk",
      "Space",
      "Meditative",
      "Instrumental Pop",
      "Instrumental Rock",
      "Ethnic",
      "Gothic",
      "Darkwave",
      "Techno-Industrial",
      "Electronic",
      "Pop-Folk",
      "Eurodance",
      "Dream",
      "Southern Rock",
      "Comedy",
      "Cult",
      "Gangsta Rap",
      "Top 40",
      "Christian Rap",
      "Pop/Funk",
      "Jungle",
      "Native American",
      "Cabaret",
      "New Wave",
      "Psychedelic",
      "Rave",
      "Showtunes",
      "Trailer",
      "Lo-Fi",
      "Tribal",
      "Acid Punk",
      "Acid Jazz",
      "Polka",
      "Retro",
      "Musical",
      "Rock & Roll",
      "Hard Rock",
      "Folk",
      "Folk/Rock",
      "National Folk",
      "Swing",
      "Fast-Fusion",
      "Bebob",
      "Latin",
      "Revival",
      "Celtic",
      "Bluegrass",
      "Avantgarde",
      "Gothic Rock",
      "Progressive Rock",
      "Psychedelic Rock",
      "Symphonic Rock",
      "Slow Rock",
      "Big Band",
      "Chorus",
      "Easy Listening",
      "Acoustic",
      "Humour",
      "Speech",
      "Chanson",
      "Opera",
      "Chamber Music",
      "Sonata",
      "Symphony",
      "Booty Bass",
      "Primus",
      "Porn Groove",
      "Satire",
      "Slow Jam",
      "Club",
      "Tango",
      "Samba",
      "Folklore",
      "Ballad",
      "Power Ballad",
      "Rhythmic Soul",
      "Freestyle",
      "Duet",
      "Punk Rock",
      "Drum Solo",
      "A Cappella",
      "Euro-House",
      "Dance Hall",
      "Goa",
      "Drum & Bass",
      "Club-House",
      "Hardcore",
      "Terror",
      "Indie",
      "BritPop",
      "Negerpunk",
      "Polsk Punk",
      "Beat",
      "Christian Gangsta Rap",
      "Heavy Metal",
      "Black Metal",
      "Crossover",
      "Contemporary Christian",
      "Christian Rock",
      "Merengue",
      "Salsa",
      "Thrash Metal",
      "Anime",
      "JPop",
      "Synthpop",
      "Abstract",
      "Art Rock",
      "Baroque",
      "Bhangra",
      "Big Beat",
      "Breakbeat",
      "Chillout",
      "Downtempo",
      "Dub",
      "EBM",
      "Eclectic",
      "Electro",
      "Electroclash",
      "Emo",
      "Experimental",
      "Garage",
      "Global",
      "IDM",
      "Illbient",
      "Industro-Goth",
      "Jam Band",
      "Krautrock",
      "Leftfield",
      "Lounge",
      "Math Rock",
      "New Romantic",
      "Nu-Breakz",
      "Post-Punk",
      "Post-Rock",
      "Psytrance",
      "Shoegaze",
      "Space Rock",
      "Trop Rock",
      "World Music",
      "Neoclassical",
      "Audiobook",
      "Audio Theatre",
      "Neue Deutsche Welle",
      "Podcast",
      "Indie Rock",
      "G-Funk",
      "Dubstep",
      "Garage Rock",
      "Psybient"
    ];
    Iid3v1Token = {
      len: 128,
      /**
       * @param buf Buffer possibly holding the 128 bytes ID3v1.1 metadata header
       * @param off Offset in buffer in bytes
       * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
       */
      get: (buf, off) => {
        const header = new Id3v1StringType(3).get(buf, off);
        return header === "TAG" ? {
          header,
          title: new Id3v1StringType(30).get(buf, off + 3),
          artist: new Id3v1StringType(30).get(buf, off + 33),
          album: new Id3v1StringType(30).get(buf, off + 63),
          year: new Id3v1StringType(4).get(buf, off + 93),
          comment: new Id3v1StringType(28).get(buf, off + 97),
          // ID3v1.1 separator for track
          zeroByte: UINT8.get(buf, off + 127),
          // track: ID3v1.1 field added by Michael Mutschler
          track: UINT8.get(buf, off + 126),
          genre: UINT8.get(buf, off + 127)
        } : null;
      }
    };
    Id3v1StringType = class {
      constructor(len) {
        this.len = len;
        this.stringType = new StringType(len, "latin1");
      }
      get(buf, off) {
        let value = this.stringType.get(buf, off);
        value = trimRightNull(value);
        value = value.trim();
        return value.length > 0 ? value : void 0;
      }
    };
    ID3v1Parser = class _ID3v1Parser extends BasicParser {
      constructor(metadata, tokenizer, options) {
        super(metadata, tokenizer, options);
        this.apeHeader = options.apeHeader;
      }
      static getGenre(genreIndex) {
        if (genreIndex < Genres.length) {
          return Genres[genreIndex];
        }
        return void 0;
      }
      async parse() {
        if (!this.tokenizer.fileInfo.size) {
          debug4("Skip checking for ID3v1 because the file-size is unknown");
          return;
        }
        if (this.apeHeader) {
          this.tokenizer.ignore(this.apeHeader.offset - this.tokenizer.position);
          const apeParser = new APEv2Parser(this.metadata, this.tokenizer, this.options);
          await apeParser.parseTags(this.apeHeader.footer);
        }
        const offset = this.tokenizer.fileInfo.size - Iid3v1Token.len;
        if (this.tokenizer.position > offset) {
          debug4("Already consumed the last 128 bytes");
          return;
        }
        const header = await this.tokenizer.readToken(Iid3v1Token, offset);
        if (header) {
          debug4("ID3v1 header found at: pos=%s", this.tokenizer.fileInfo.size - Iid3v1Token.len);
          const props = ["title", "artist", "album", "comment", "track", "year"];
          for (const id of props) {
            if (header[id] && header[id] !== "")
              await this.addTag(id, header[id]);
          }
          const genre = _ID3v1Parser.getGenre(header.genre);
          if (genre)
            await this.addTag("genre", genre);
        } else {
          debug4("ID3v1 header not found at: pos=%s", this.tokenizer.fileInfo.size - Iid3v1Token.len);
        }
      }
      async addTag(id, value) {
        await this.metadata.addTag("ID3v1", id, value);
      }
    };
  }
});

// node_modules/music-metadata/lib/id3v2/ID3v2ChapterToken.js
var ChapterInfo;
var init_ID3v2ChapterToken = __esm({
  "node_modules/music-metadata/lib/id3v2/ID3v2ChapterToken.js"() {
    init_lib3();
    ChapterInfo = {
      len: 16,
      get: (buf, off) => {
        const startOffset = UINT32_BE.get(buf, off + 8);
        const endOffset = UINT32_BE.get(buf, off + 12);
        return {
          startTime: UINT32_BE.get(buf, off),
          endTime: UINT32_BE.get(buf, off + 4),
          startOffset: startOffset === 4294967295 ? void 0 : startOffset,
          endOffset: endOffset === 4294967295 ? void 0 : endOffset
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/id3v2/FrameHeader.js
function getFrameHeaderLength(majorVer) {
  switch (majorVer) {
    case 2:
      return 6;
    case 3:
    case 4:
      return 10;
    default:
      throw makeUnexpectedMajorVersionError(majorVer);
  }
}
function readFrameFlags(b) {
  return {
    status: {
      tag_alter_preservation: getBit(b, 0, 6),
      file_alter_preservation: getBit(b, 0, 5),
      read_only: getBit(b, 0, 4)
    },
    format: {
      grouping_identity: getBit(b, 1, 7),
      compression: getBit(b, 1, 3),
      encryption: getBit(b, 1, 2),
      unsynchronisation: getBit(b, 1, 1),
      data_length_indicator: getBit(b, 1, 0)
    }
  };
}
function readFrameHeader(uint8Array, majorVer, warningCollector) {
  switch (majorVer) {
    case 2:
      return parseFrameHeaderV22(uint8Array, majorVer, warningCollector);
    case 3:
    case 4:
      return parseFrameHeaderV23V24(uint8Array, majorVer, warningCollector);
    default:
      throw makeUnexpectedMajorVersionError(majorVer);
  }
}
function parseFrameHeaderV22(uint8Array, majorVer, warningCollector) {
  const header = {
    id: textDecode(uint8Array.subarray(0, 3), "ascii"),
    length: UINT24_BE.get(uint8Array, 3)
  };
  if (!header.id.match(/^[A-Z0-9]{3}$/)) {
    warningCollector.addWarning(`Invalid ID3v2.${majorVer} frame-header-ID: ${header.id}`);
  }
  return header;
}
function parseFrameHeaderV23V24(uint8Array, majorVer, warningCollector) {
  const header = {
    id: textDecode(uint8Array.subarray(0, 4), "ascii"),
    length: (majorVer === 4 ? UINT32SYNCSAFE : UINT32_BE).get(uint8Array, 4),
    flags: readFrameFlags(uint8Array.subarray(8, 10))
  };
  if (!header.id.match(/^[A-Z0-9]{4}$/)) {
    warningCollector.addWarning(`Invalid ID3v2.${majorVer} frame-header-ID: ${header.id}`);
  }
  return header;
}
function makeUnexpectedMajorVersionError(majorVer) {
  throw new Id3v2ContentError(`Unexpected majorVer: ${majorVer}`);
}
var init_FrameHeader = __esm({
  "node_modules/music-metadata/lib/id3v2/FrameHeader.js"() {
    init_lib3();
    init_Util();
    init_ID3v2Token();
    init_lib2();
    init_FrameParser();
  }
});

// node_modules/music-metadata/lib/id3v2/FrameParser.js
function parseGenre(origVal) {
  const genres = [];
  let code;
  let word = "";
  for (const c of origVal) {
    if (typeof code === "string") {
      if (c === "(" && code === "") {
        word += "(";
        code = void 0;
      } else if (c === ")") {
        if (word !== "") {
          genres.push(word);
          word = "";
        }
        const genre = parseGenreCode(code);
        if (genre) {
          genres.push(genre);
        }
        code = void 0;
      } else
        code += c;
    } else if (c === "(") {
      code = "";
    } else {
      word += c;
    }
  }
  if (word) {
    if (genres.length === 0 && word.match(/^\d*$/)) {
      word = parseGenreCode(word);
    }
    if (word) {
      genres.push(word);
    }
  }
  return genres;
}
function parseGenreCode(code) {
  if (code === "RX")
    return "Remix";
  if (code === "CR")
    return "Cover";
  if (code.match(/^\d*$/)) {
    return Genres[Number.parseInt(code, 10)];
  }
}
function makeUnexpectedMajorVersionError2(majorVer) {
  throw new Id3v2ContentError(`Unexpected majorVer: ${majorVer}`);
}
var import_debug5, debug5, defaultEnc, urlEnc, FrameParser, Id3v2ContentError;
var init_FrameParser = __esm({
  "node_modules/music-metadata/lib/id3v2/FrameParser.js"() {
    import_debug5 = __toESM(require_src(), 1);
    init_lib3();
    init_Util();
    init_ID3v2Token();
    init_ID3v1Parser();
    init_ParseError();
    init_Util();
    init_ID3v2ChapterToken();
    init_FrameHeader();
    debug5 = (0, import_debug5.default)("music-metadata:id3v2:frame-parser");
    defaultEnc = "latin1";
    urlEnc = { encoding: defaultEnc, bom: false };
    FrameParser = class _FrameParser {
      /**
       * Create id3v2 frame parser
       * @param major - Major version, e.g. (4) for  id3v2.4
       * @param warningCollector - Used to collect decode issue
       */
      constructor(major, warningCollector) {
        this.major = major;
        this.warningCollector = warningCollector;
      }
      readData(uint8Array, type, includeCovers) {
        if (uint8Array.length === 0) {
          this.warningCollector.addWarning(`id3v2.${this.major} header has empty tag type=${type}`);
          return;
        }
        const { encoding, bom } = TextEncodingToken.get(uint8Array, 0);
        const length = uint8Array.length;
        let offset = 0;
        let output = [];
        const nullTerminatorLength = _FrameParser.getNullTerminatorLength(encoding);
        let fzero;
        debug5(`Parsing tag type=${type}, encoding=${encoding}, bom=${bom}`);
        switch (type !== "TXXX" && type[0] === "T" ? "T*" : type) {
          case "T*":
          // 4.2.1. Text information frames - details
          case "GRP1":
          // iTunes-specific ID3v2 grouping field
          case "GP1":
          // iTunes-specific ID3v2.2 grouping field
          case "IPLS":
          // v2.3: Involved people list
          case "MVIN":
          case "MVNM":
          case "PCS":
          case "PCST": {
            let text;
            try {
              text = _FrameParser.trimNullPadding(decodeString(uint8Array.subarray(1), encoding));
            } catch (error) {
              if (error instanceof Error) {
                this.warningCollector.addWarning(`id3v2.${this.major} type=${type} header has invalid string value: ${error.message}`);
                break;
              }
              throw error;
            }
            switch (type) {
              case "TMCL":
              // Musician credits list
              case "TIPL":
              // Involved people list
              case "IPLS":
                output = _FrameParser.functionList(this.splitValue(type, text));
                break;
              case "TRK":
              case "TRCK":
              case "TPOS":
              case "TIT1":
              case "TIT2":
              case "TIT3":
                output = text;
                break;
              case "TCOM":
              case "TEXT":
              case "TOLY":
              case "TOPE":
              case "TPE1":
              case "TSRC":
                output = this.splitValue(type, text);
                break;
              case "TCO":
              case "TCON":
                output = this.splitValue(type, text).map((v) => parseGenre(v)).reduce((acc, val) => acc.concat(val), []);
                break;
              case "PCS":
              case "PCST":
                output = this.major >= 4 ? this.splitValue(type, text) : [text];
                output = Array.isArray(output) && output[0] === "" ? 1 : 0;
                break;
              default:
                output = this.major >= 4 ? this.splitValue(type, text) : [text];
            }
            break;
          }
          case "TXXX": {
            const idAndData = _FrameParser.readIdentifierAndData(uint8Array.subarray(1), encoding);
            output = {
              description: idAndData.id,
              text: this.splitValue(type, decodeString(idAndData.data, encoding).replace(/\x00+$/, ""))
            };
            break;
          }
          case "PIC":
          case "APIC":
            if (includeCovers) {
              const pic = {};
              uint8Array = uint8Array.subarray(1);
              switch (this.major) {
                case 2:
                  pic.format = decodeString(uint8Array.subarray(0, 3), "latin1");
                  uint8Array = uint8Array.subarray(3);
                  break;
                case 3:
                case 4:
                  fzero = findZero(uint8Array, defaultEnc);
                  pic.format = decodeString(uint8Array.subarray(0, fzero), defaultEnc);
                  uint8Array = uint8Array.subarray(fzero + 1);
                  break;
                default:
                  throw makeUnexpectedMajorVersionError2(this.major);
              }
              pic.format = _FrameParser.fixPictureMimeType(pic.format);
              pic.type = AttachedPictureType[uint8Array[0]];
              uint8Array = uint8Array.subarray(1);
              fzero = findZero(uint8Array, encoding);
              pic.description = decodeString(uint8Array.subarray(0, fzero), encoding);
              uint8Array = uint8Array.subarray(fzero + nullTerminatorLength);
              pic.data = uint8Array;
              output = pic;
            }
            break;
          case "CNT":
          case "PCNT":
            output = decodeUintBE(uint8Array);
            break;
          case "SYLT": {
            const syltHeader = SyncTextHeader.get(uint8Array, 0);
            uint8Array = uint8Array.subarray(SyncTextHeader.len);
            const result = {
              descriptor: "",
              language: syltHeader.language,
              contentType: syltHeader.contentType,
              timeStampFormat: syltHeader.timeStampFormat,
              syncText: []
            };
            let readSyllables = false;
            while (uint8Array.length > 0) {
              const nullStr = _FrameParser.readNullTerminatedString(uint8Array, syltHeader.encoding);
              uint8Array = uint8Array.subarray(nullStr.len);
              if (readSyllables) {
                const timestamp = UINT32_BE.get(uint8Array, 0);
                uint8Array = uint8Array.subarray(UINT32_BE.len);
                result.syncText.push({
                  text: nullStr.text,
                  timestamp
                });
              } else {
                result.descriptor = nullStr.text;
                readSyllables = true;
              }
            }
            output = result;
            break;
          }
          case "ULT":
          case "USLT":
          case "COM":
          case "COMM": {
            const textHeader = TextHeader.get(uint8Array, offset);
            offset += TextHeader.len;
            const descriptorStr = _FrameParser.readNullTerminatedString(uint8Array.subarray(offset), textHeader.encoding);
            offset += descriptorStr.len;
            const textStr = _FrameParser.readNullTerminatedString(uint8Array.subarray(offset), textHeader.encoding);
            const comment = {
              language: textHeader.language,
              descriptor: descriptorStr.text,
              text: textStr.text
            };
            output = comment;
            break;
          }
          case "UFID": {
            const ufid = _FrameParser.readIdentifierAndData(uint8Array, defaultEnc);
            output = { owner_identifier: ufid.id, identifier: ufid.data };
            break;
          }
          case "PRIV": {
            const priv = _FrameParser.readIdentifierAndData(uint8Array, defaultEnc);
            output = { owner_identifier: priv.id, data: priv.data };
            break;
          }
          case "POPM": {
            uint8Array = uint8Array.subarray(offset);
            const emailStr = _FrameParser.readNullTerminatedString(uint8Array, urlEnc);
            const email = emailStr.text;
            uint8Array = uint8Array.subarray(emailStr.len);
            if (uint8Array.length === 0) {
              this.warningCollector.addWarning(`id3v2.${this.major} type=${type} POPM frame missing rating byte`);
              output = { email, rating: 0, counter: void 0 };
              break;
            }
            const rating = UINT8.get(uint8Array, 0);
            const counterBytes = uint8Array.subarray(UINT8.len);
            output = {
              email,
              rating,
              counter: counterBytes.length > 0 ? decodeUintBE(counterBytes) : void 0
            };
            break;
          }
          case "GEOB": {
            const encoding2 = TextEncodingToken.get(uint8Array, 0);
            uint8Array = uint8Array.subarray(1);
            const mimeTypeStr = _FrameParser.readNullTerminatedString(uint8Array, urlEnc);
            const mimeType = mimeTypeStr.text;
            uint8Array = uint8Array.subarray(mimeTypeStr.len);
            const filenameStr = _FrameParser.readNullTerminatedString(uint8Array, encoding2);
            const filename = filenameStr.text;
            uint8Array = uint8Array.subarray(filenameStr.len);
            const descriptionStr = _FrameParser.readNullTerminatedString(uint8Array, encoding2);
            const description = descriptionStr.text;
            uint8Array = uint8Array.subarray(descriptionStr.len);
            const geob = {
              type: mimeType,
              filename,
              description,
              data: uint8Array
            };
            output = geob;
            break;
          }
          // W-Frames:
          case "WCOM":
          case "WCOP":
          case "WOAF":
          case "WOAR":
          case "WOAS":
          case "WORS":
          case "WPAY":
          case "WPUB":
            output = _FrameParser.readNullTerminatedString(uint8Array, urlEnc).text;
            break;
          case "WXXX": {
            const encoding2 = TextEncodingToken.get(uint8Array, 0);
            uint8Array = uint8Array.subarray(1);
            const descriptionStr = _FrameParser.readNullTerminatedString(uint8Array, encoding2);
            const description = descriptionStr.text;
            uint8Array = uint8Array.subarray(descriptionStr.len);
            output = { description, url: _FrameParser.trimNullPadding(decodeString(uint8Array, defaultEnc)) };
            break;
          }
          case "WFD":
          case "WFED": {
            const encoding2 = TextEncodingToken.get(uint8Array, 0);
            uint8Array = uint8Array.subarray(1);
            output = _FrameParser.readNullTerminatedString(uint8Array, encoding2).text;
            break;
          }
          case "MCDI": {
            output = uint8Array.subarray(0, length);
            break;
          }
          // ID3v2 Chapters 1.0
          // https://mutagen-specs.readthedocs.io/en/latest/id3/id3v2-chapters-1.0.html#chapter-frame
          case "CHAP": {
            debug5("Reading CHAP");
            fzero = findZero(uint8Array, defaultEnc);
            const chapter = {
              label: decodeString(uint8Array.subarray(0, fzero), defaultEnc),
              info: ChapterInfo.get(uint8Array, fzero + 1),
              frames: /* @__PURE__ */ new Map()
            };
            offset += fzero + 1 + ChapterInfo.len;
            while (offset < length) {
              const subFrame = readFrameHeader(uint8Array.subarray(offset), this.major, this.warningCollector);
              const headerSize = getFrameHeaderLength(this.major);
              offset += headerSize;
              const subOutput = this.readData(uint8Array.subarray(offset, offset + subFrame.length), subFrame.id, includeCovers);
              offset += subFrame.length;
              chapter.frames.set(subFrame.id, subOutput);
            }
            output = chapter;
            break;
          }
          // ID3v2 Chapters 1.0
          // https://mutagen-specs.readthedocs.io/en/latest/id3/id3v2-chapters-1.0.html#table-of-contents-frame
          case "CTOC": {
            debug5("Reading CTOC");
            const idEnd = findZero(uint8Array, defaultEnc);
            const label = decodeString(uint8Array.subarray(0, idEnd), defaultEnc);
            offset = idEnd + 1;
            const flags = uint8Array[offset++];
            const topLevel = (flags & 2) !== 0;
            const ordered = (flags & 1) !== 0;
            const entryCount = uint8Array[offset++];
            const childElementIds = [];
            for (let i = 0; i < entryCount && offset < length; i++) {
              const end = findZero(uint8Array.subarray(offset), defaultEnc);
              const childId = decodeString(uint8Array.subarray(offset, offset + end), defaultEnc);
              childElementIds.push(childId);
              offset += end + 1;
            }
            const toc = {
              label,
              flags: { topLevel, ordered },
              childElementIds,
              frames: /* @__PURE__ */ new Map()
            };
            while (offset < length) {
              const subFrame = readFrameHeader(uint8Array.subarray(offset), this.major, this.warningCollector);
              const headerSize = getFrameHeaderLength(this.major);
              offset += headerSize;
              const subOutput = this.readData(uint8Array.subarray(offset, offset + subFrame.length), subFrame.id, includeCovers);
              offset += subFrame.length;
              toc.frames.set(subFrame.id, subOutput);
            }
            output = toc;
            break;
          }
          default:
            debug5(`Warning: unsupported id3v2-tag-type: ${type}`);
            break;
        }
        return output;
      }
      static readNullTerminatedString(uint8Array, encoding) {
        const bomSize = encoding.bom ? 2 : 0;
        const originalLen = uint8Array.length;
        const valueArray = uint8Array.subarray(bomSize);
        const zeroIndex = findZero(valueArray, encoding.encoding);
        if (zeroIndex >= valueArray.length) {
          return {
            text: decodeString(valueArray, encoding.encoding),
            len: originalLen
          };
        }
        const txt = valueArray.subarray(0, zeroIndex);
        return {
          text: decodeString(txt, encoding.encoding),
          len: bomSize + zeroIndex + _FrameParser.getNullTerminatorLength(encoding.encoding)
        };
      }
      static fixPictureMimeType(pictureType) {
        pictureType = pictureType.toLocaleLowerCase();
        switch (pictureType) {
          case "jpg":
            return "image/jpeg";
          case "png":
            return "image/png";
        }
        return pictureType;
      }
      /**
       * Converts TMCL (Musician credits list) or TIPL (Involved people list)
       * @param entries
       */
      static functionList(entries) {
        const res = {};
        for (let i = 0; i + 1 < entries.length; i += 2) {
          const names = entries[i + 1].split(",");
          res[entries[i]] = res[entries[i]] ? res[entries[i]].concat(names) : names;
        }
        return res;
      }
      /**
       * id3v2.4 defines that multiple T* values are separated by 0x00
       * id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
       * @param tag - Tag name
       * @param text - Concatenated tag value
       * @returns Split tag value
       */
      splitValue(tag, text) {
        let values;
        if (this.major < 4) {
          values = text.split(/\x00/g);
          if (values.length > 1) {
            this.warningCollector.addWarning(`ID3v2.${this.major} ${tag} uses non standard null-separator.`);
          } else {
            values = text.split(/\//g);
          }
        } else {
          values = text.split(/\x00/g);
        }
        return _FrameParser.trimArray(values);
      }
      static trimArray(values) {
        return values.map((value) => _FrameParser.trimNullPadding(value).trim());
      }
      static trimNullPadding(value) {
        let end = value.length;
        while (end > 0 && value.charCodeAt(end - 1) === 0) {
          end--;
        }
        return end === value.length ? value : value.slice(0, end);
      }
      static readIdentifierAndData(uint8Array, encoding) {
        const idStr = _FrameParser.readNullTerminatedString(uint8Array, { encoding, bom: false });
        return { id: idStr.text, data: uint8Array.subarray(idStr.len) };
      }
      static getNullTerminatorLength(enc) {
        return enc.startsWith("utf-16") ? 2 : 1;
      }
    };
    Id3v2ContentError = class extends makeUnexpectedFileContentError("id3v2") {
    };
  }
});

// node_modules/music-metadata/lib/id3v2/ID3v2Parser.js
function makeUnexpectedMajorVersionError3(majorVer) {
  throw new Id3v2ContentError(`Unexpected majorVer: ${majorVer}`);
}
var ID3v2Parser;
var init_ID3v2Parser = __esm({
  "node_modules/music-metadata/lib/id3v2/ID3v2Parser.js"() {
    init_lib3();
    init_FrameParser();
    init_ID3v2Token();
    init_FrameHeader();
    ID3v2Parser = class _ID3v2Parser {
      constructor() {
        this.tokenizer = void 0;
        this.id3Header = void 0;
        this.metadata = void 0;
        this.headerType = void 0;
        this.options = void 0;
      }
      static removeUnsyncBytes(buffer) {
        let readI = 0;
        let writeI = 0;
        while (readI < buffer.length - 1) {
          if (readI !== writeI) {
            buffer[writeI] = buffer[readI];
          }
          readI += buffer[readI] === 255 && buffer[readI + 1] === 0 ? 2 : 1;
          writeI++;
        }
        if (readI < buffer.length) {
          buffer[writeI++] = buffer[readI];
        }
        return buffer.subarray(0, writeI);
      }
      static readFrameData(uint8Array, frameHeader, majorVer, includeCovers, warningCollector) {
        const frameParser = new FrameParser(majorVer, warningCollector);
        switch (majorVer) {
          case 2:
            return frameParser.readData(uint8Array, frameHeader.id, includeCovers);
          case 3:
          case 4:
            if (frameHeader.flags?.format.unsynchronisation) {
              uint8Array = _ID3v2Parser.removeUnsyncBytes(uint8Array);
            }
            if (frameHeader.flags?.format.data_length_indicator) {
              uint8Array = uint8Array.subarray(4, uint8Array.length);
            }
            return frameParser.readData(uint8Array, frameHeader.id, includeCovers);
          default:
            throw makeUnexpectedMajorVersionError3(majorVer);
        }
      }
      /**
       * Create a combined tag key, of tag & description
       * @param tag e.g.: COM
       * @param description e.g. iTunPGAP
       * @returns string e.g. COM:iTunPGAP
       */
      static makeDescriptionTagName(tag, description) {
        return tag + (description ? `:${description}` : "");
      }
      async parse(metadata, tokenizer, options) {
        this.tokenizer = tokenizer;
        this.metadata = metadata;
        this.options = options;
        const id3Header = await this.tokenizer.readToken(ID3v2Header);
        if (id3Header.fileIdentifier !== "ID3") {
          throw new Id3v2ContentError("expected ID3-header file-identifier 'ID3' was not found");
        }
        this.id3Header = id3Header;
        this.headerType = `ID3v2.${id3Header.version.major}`;
        await (id3Header.flags.isExtendedHeader ? this.parseExtendedHeader() : this.parseId3Data(id3Header.size));
        const chapters = _ID3v2Parser.mapId3v2Chapters(this.metadata.native[this.headerType]);
        this.metadata.setFormat("chapters", chapters);
      }
      async parseExtendedHeader() {
        const extendedHeader = await this.tokenizer.readToken(ExtendedHeader);
        const dataRemaining = extendedHeader.size - ExtendedHeader.len;
        return dataRemaining > 0 ? this.parseExtendedHeaderData(dataRemaining, extendedHeader.size) : this.parseId3Data(this.id3Header.size - extendedHeader.size);
      }
      async parseExtendedHeaderData(dataRemaining, extendedHeaderSize) {
        await this.tokenizer.ignore(dataRemaining);
        return this.parseId3Data(this.id3Header.size - extendedHeaderSize);
      }
      async parseId3Data(dataLen) {
        const uint8Array = await this.tokenizer.readToken(new Uint8ArrayType(dataLen));
        for (const tag of this.parseMetadata(uint8Array)) {
          switch (tag.id) {
            case "TXXX":
              if (tag.value) {
                await this.handleTag(tag, tag.value.text, () => tag.value.description);
              }
              break;
            default:
              await (Array.isArray(tag.value) ? Promise.all(tag.value.map((value) => this.addTag(tag.id, value))) : this.addTag(tag.id, tag.value));
          }
        }
      }
      async handleTag(tag, values, descriptor, resolveValue = (value) => value) {
        await Promise.all(values.map((value) => this.addTag(_ID3v2Parser.makeDescriptionTagName(tag.id, descriptor(value)), resolveValue(value))));
      }
      async addTag(id, value) {
        await this.metadata.addTag(this.headerType, id, value);
      }
      parseMetadata(data) {
        let offset = 0;
        const tags = [];
        while (true) {
          if (offset === data.length)
            break;
          const frameHeaderLength = getFrameHeaderLength(this.id3Header.version.major);
          if (offset + frameHeaderLength > data.length) {
            this.metadata.addWarning("Illegal ID3v2 tag length");
            break;
          }
          const frameHeaderBytes = data.subarray(offset, offset + frameHeaderLength);
          offset += frameHeaderLength;
          const frameHeader = readFrameHeader(frameHeaderBytes, this.id3Header.version.major, this.metadata);
          const frameDataBytes = data.subarray(offset, offset + frameHeader.length);
          offset += frameHeader.length;
          const values = _ID3v2Parser.readFrameData(frameDataBytes, frameHeader, this.id3Header.version.major, !this.options.skipCovers, this.metadata);
          if (values) {
            tags.push({ id: frameHeader.id, value: values });
          }
        }
        return tags;
      }
      /**
       * Convert parsed ID3v2 chapter frames (CHAP / CTOC) to generic `format.chapters`.
       *
       * This function expects the `native` tags already to contain parsed `CHAP` and `CTOC` frame values,
       * as produced by `FrameParser.readData`.
       */
      static mapId3v2Chapters(id3Tags) {
        if (!id3Tags)
          return;
        const chapFrames = id3Tags.filter((t) => t.id === "CHAP");
        if (!chapFrames?.length)
          return;
        const tocFrames = id3Tags.filter((t) => t.id === "CTOC");
        const topLevelToc = tocFrames?.find((t) => t.value.flags?.topLevel);
        const chapterById = /* @__PURE__ */ new Map();
        for (const chap of chapFrames) {
          chapterById.set(chap.value.label, chap.value);
        }
        const orderedIds = topLevelToc?.value.childElementIds;
        const chapters = [];
        const source = orderedIds ?? [...chapterById.keys()];
        for (const id of source) {
          const chap = chapterById.get(id);
          if (!chap)
            continue;
          const frames = chap.frames;
          const title = frames.get("TIT2");
          if (!title)
            continue;
          chapters.push({
            id,
            title,
            url: frames.get("WXXX"),
            start: chap.info.startTime / 1e3,
            end: chap.info.endTime / 1e3,
            image: frames.get("APIC")
          });
        }
        if (!orderedIds) {
          chapters.sort((a, b) => a.start - b.start);
        }
        return chapters.length ? chapters : void 0;
      }
    };
  }
});

// node_modules/music-metadata/lib/id3v2/AbstractID3Parser.js
var import_debug6, debug6, AbstractID3Parser;
var init_AbstractID3Parser = __esm({
  "node_modules/music-metadata/lib/id3v2/AbstractID3Parser.js"() {
    init_lib();
    import_debug6 = __toESM(require_src(), 1);
    init_ID3v2Token();
    init_ID3v2Parser();
    init_ID3v1Parser();
    init_BasicParser();
    debug6 = (0, import_debug6.default)("music-metadata:parser:ID3");
    AbstractID3Parser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.id3parser = new ID3v2Parser();
      }
      static async startsWithID3v2Header(tokenizer) {
        return (await tokenizer.peekToken(ID3v2Header)).fileIdentifier === "ID3";
      }
      async parse() {
        try {
          await this.parseID3v2();
        } catch (err) {
          if (err instanceof EndOfStreamError) {
            debug6("End-of-stream");
          } else {
            throw err;
          }
        }
      }
      finalize() {
        return;
      }
      async parseID3v2() {
        await this.tryReadId3v2Headers();
        debug6("End of ID3v2 header, go to MPEG-parser: pos=%s", this.tokenizer.position);
        await this.postId3v2Parse();
        if (this.options.skipPostHeaders && this.metadata.hasAny()) {
          this.finalize();
        } else {
          const id3v1parser = new ID3v1Parser(this.metadata, this.tokenizer, this.options);
          await id3v1parser.parse();
          this.finalize();
        }
      }
      async tryReadId3v2Headers() {
        const id3Header = await this.tokenizer.peekToken(ID3v2Header);
        if (id3Header.fileIdentifier === "ID3") {
          debug6("Found ID3v2 header, pos=%s", this.tokenizer.position);
          await this.id3parser.parse(this.metadata, this.tokenizer, this.options);
          return this.tryReadId3v2Headers();
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/mpeg/ReplayGainDataFormat.js
var ReplayGain;
var init_ReplayGainDataFormat = __esm({
  "node_modules/music-metadata/lib/mpeg/ReplayGainDataFormat.js"() {
    init_Util();
    ReplayGain = {
      len: 2,
      get: (buf, off) => {
        const gain_type = getBitAllignedNumber(buf, off, 0, 3);
        const sign = getBitAllignedNumber(buf, off, 6, 1);
        const gain_adj = getBitAllignedNumber(buf, off, 7, 9) / 10;
        if (gain_type > 0) {
          return {
            type: getBitAllignedNumber(buf, off, 0, 3),
            origin: getBitAllignedNumber(buf, off, 3, 3),
            adjustment: sign ? -gain_adj : gain_adj
          };
        }
        return void 0;
      }
    };
  }
});

// node_modules/music-metadata/lib/mpeg/ExtendedLameHeader.js
var ExtendedLameHeader;
var init_ExtendedLameHeader = __esm({
  "node_modules/music-metadata/lib/mpeg/ExtendedLameHeader.js"() {
    init_lib3();
    init_Util();
    init_ReplayGainDataFormat();
    ExtendedLameHeader = {
      len: 27,
      get: (buf, off) => {
        const track_peak = UINT32_BE.get(buf, off + 2);
        return {
          revision: getBitAllignedNumber(buf, off, 0, 4),
          vbr_method: getBitAllignedNumber(buf, off, 4, 4),
          lowpass_filter: 100 * UINT8.get(buf, off + 1),
          track_peak: track_peak === 0 ? null : track_peak / 2 ** 23,
          track_gain: ReplayGain.get(buf, 6),
          album_gain: ReplayGain.get(buf, 8),
          music_length: UINT32_BE.get(buf, off + 20),
          music_crc: UINT8.get(buf, off + 24),
          header_crc: UINT16_BE.get(buf, off + 24)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/mpeg/XingTag.js
async function readXingHeader(tokenizer) {
  const flags = await tokenizer.readToken(XingHeaderFlags);
  const xingInfoTag = { numFrames: null, streamSize: null, vbrScale: null };
  if (flags.frames) {
    xingInfoTag.numFrames = await tokenizer.readToken(UINT32_BE);
  }
  if (flags.bytes) {
    xingInfoTag.streamSize = await tokenizer.readToken(UINT32_BE);
  }
  if (flags.toc) {
    xingInfoTag.toc = new Uint8Array(100);
    await tokenizer.readBuffer(xingInfoTag.toc);
  }
  if (flags.vbrScale) {
    xingInfoTag.vbrScale = await tokenizer.readToken(UINT32_BE);
  }
  const lameTag = await tokenizer.peekToken(new StringType(4, "ascii"));
  if (lameTag === "LAME") {
    await tokenizer.ignore(4);
    xingInfoTag.lame = {
      version: await tokenizer.readToken(new StringType(5, "ascii"))
    };
    const match = xingInfoTag.lame.version.match(/\d+.\d+/g);
    if (match !== null) {
      const majorMinorVersion = match[0];
      const version = majorMinorVersion.split(".").map((n) => Number.parseInt(n, 10));
      if (version[0] >= 3 && version[1] >= 90) {
        xingInfoTag.lame.extended = await tokenizer.readToken(ExtendedLameHeader);
      }
    }
  }
  return xingInfoTag;
}
var InfoTagHeaderTag, LameEncoderVersion, XingHeaderFlags;
var init_XingTag = __esm({
  "node_modules/music-metadata/lib/mpeg/XingTag.js"() {
    init_lib3();
    init_Util();
    init_ExtendedLameHeader();
    InfoTagHeaderTag = new StringType(4, "ascii");
    LameEncoderVersion = new StringType(6, "ascii");
    XingHeaderFlags = {
      len: 4,
      get: (buf, off) => {
        return {
          frames: isBitSet(buf, off, 31),
          bytes: isBitSet(buf, off, 30),
          toc: isBitSet(buf, off, 29),
          vbrScale: isBitSet(buf, off, 28)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/mpeg/MpegParser.js
var MpegParser_exports = {};
__export(MpegParser_exports, {
  MpegContentError: () => MpegContentError,
  MpegParser: () => MpegParser
});
function getVbrCodecProfile(vbrScale) {
  return `V${Math.floor((100 - vbrScale) / 10)}`;
}
var import_debug7, debug7, MpegContentError, maxPeekLen, MPEG4, MPEG4_ChannelConfigurations, MpegFrameHeader, FrameHeader, MpegParser;
var init_MpegParser = __esm({
  "node_modules/music-metadata/lib/mpeg/MpegParser.js"() {
    init_lib3();
    init_lib();
    import_debug7 = __toESM(require_src(), 1);
    init_Util();
    init_AbstractID3Parser();
    init_XingTag();
    init_ParseError();
    debug7 = (0, import_debug7.default)("music-metadata:parser:mpeg");
    MpegContentError = class extends makeUnexpectedFileContentError("MPEG") {
    };
    maxPeekLen = 1024;
    MPEG4 = {
      /**
       * Audio Object Types
       */
      AudioObjectTypes: [
        "AAC Main",
        "AAC LC",
        // Low Complexity
        "AAC SSR",
        // Scalable Sample Rate
        "AAC LTP"
        // Long Term Prediction
      ],
      /**
       * Sampling Frequencies
       * https://wiki.multimedia.cx/index.php/MPEG-4_Audio#Sampling_Frequencies
       */
      SamplingFrequencies: [
        96e3,
        88200,
        64e3,
        48e3,
        44100,
        32e3,
        24e3,
        22050,
        16e3,
        12e3,
        11025,
        8e3,
        7350,
        null,
        null,
        -1
      ]
      /**
       * Channel Configurations
       */
    };
    MPEG4_ChannelConfigurations = [
      void 0,
      ["front-center"],
      ["front-left", "front-right"],
      ["front-center", "front-left", "front-right"],
      ["front-center", "front-left", "front-right", "back-center"],
      ["front-center", "front-left", "front-right", "back-left", "back-right"],
      ["front-center", "front-left", "front-right", "back-left", "back-right", "LFE-channel"],
      ["front-center", "front-left", "front-right", "side-left", "side-right", "back-left", "back-right", "LFE-channel"]
    ];
    MpegFrameHeader = class _MpegFrameHeader {
      constructor(buf, off) {
        this.bitrateIndex = null;
        this.sampRateFreqIndex = null;
        this.padding = null;
        this.privateBit = null;
        this.channelModeIndex = null;
        this.modeExtension = null;
        this.isOriginalMedia = null;
        this.version = null;
        this.bitrate = null;
        this.samplingRate = null;
        this.frameLength = 0;
        this.versionIndex = getBitAllignedNumber(buf, off + 1, 3, 2);
        this.layer = _MpegFrameHeader.LayerDescription[getBitAllignedNumber(buf, off + 1, 5, 2)];
        if (this.versionIndex > 1 && this.layer === 0) {
          this.parseAdtsHeader(buf, off);
        } else {
          this.parseMpegHeader(buf, off);
        }
        this.isProtectedByCRC = !isBitSet(buf, off + 1, 7);
      }
      calcDuration(numFrames) {
        return this.samplingRate == null ? null : numFrames * this.calcSamplesPerFrame() / this.samplingRate;
      }
      calcSamplesPerFrame() {
        return _MpegFrameHeader.samplesInFrameTable[this.version === 1 ? 0 : 1][this.layer];
      }
      calculateSideInfoLength() {
        if (this.layer !== 3)
          return 2;
        if (this.channelModeIndex === 3) {
          if (this.version === 1) {
            return 17;
          }
          if (this.version === 2 || this.version === 2.5) {
            return 9;
          }
        } else {
          if (this.version === 1) {
            return 32;
          }
          if (this.version === 2 || this.version === 2.5) {
            return 17;
          }
        }
        return null;
      }
      calcSlotSize() {
        return [null, 4, 1, 1][this.layer];
      }
      parseMpegHeader(buf, off) {
        this.container = "MPEG";
        this.bitrateIndex = getBitAllignedNumber(buf, off + 2, 0, 4);
        this.sampRateFreqIndex = getBitAllignedNumber(buf, off + 2, 4, 2);
        this.padding = isBitSet(buf, off + 2, 6);
        this.privateBit = isBitSet(buf, off + 2, 7);
        this.channelModeIndex = getBitAllignedNumber(buf, off + 3, 0, 2);
        this.modeExtension = getBitAllignedNumber(buf, off + 3, 2, 2);
        this.isCopyrighted = isBitSet(buf, off + 3, 4);
        this.isOriginalMedia = isBitSet(buf, off + 3, 5);
        this.emphasis = getBitAllignedNumber(buf, off + 3, 7, 2);
        this.version = _MpegFrameHeader.VersionID[this.versionIndex];
        this.channelMode = _MpegFrameHeader.ChannelMode[this.channelModeIndex];
        this.codec = `MPEG ${this.version} Layer ${this.layer}`;
        const bitrateInKbps = this.calcBitrate();
        if (!bitrateInKbps) {
          throw new MpegContentError("Cannot determine bit-rate");
        }
        this.bitrate = bitrateInKbps * 1e3;
        this.samplingRate = this.calcSamplingRate();
        if (this.samplingRate == null) {
          throw new MpegContentError("Cannot determine sampling-rate");
        }
      }
      parseAdtsHeader(buf, off) {
        debug7("layer=0 => ADTS");
        this.version = this.versionIndex === 2 ? 4 : 2;
        this.container = `ADTS/MPEG-${this.version}`;
        const profileIndex = getBitAllignedNumber(buf, off + 2, 0, 2);
        this.codec = "AAC";
        this.codecProfile = MPEG4.AudioObjectTypes[profileIndex];
        debug7(`MPEG-4 audio-codec=${this.codec}`);
        const samplingFrequencyIndex = getBitAllignedNumber(buf, off + 2, 2, 4);
        this.samplingRate = MPEG4.SamplingFrequencies[samplingFrequencyIndex];
        debug7(`sampling-rate=${this.samplingRate}`);
        const channelIndex = getBitAllignedNumber(buf, off + 2, 7, 3);
        this.mp4ChannelConfig = MPEG4_ChannelConfigurations[channelIndex];
        debug7(`channel-config=${this.mp4ChannelConfig ? this.mp4ChannelConfig.join("+") : "?"}`);
        this.frameLength = getBitAllignedNumber(buf, off + 3, 6, 2) << 11;
      }
      calcBitrate() {
        if (this.bitrateIndex === 0 || // free
        this.bitrateIndex === 15) {
          return null;
        }
        if (this.version && this.bitrateIndex) {
          const codecIndex = 10 * Math.floor(this.version) + this.layer;
          return _MpegFrameHeader.bitrate_index[this.bitrateIndex][codecIndex];
        }
        return null;
      }
      calcSamplingRate() {
        if (this.sampRateFreqIndex === 3 || this.version === null || this.sampRateFreqIndex == null)
          return null;
        return _MpegFrameHeader.sampling_rate_freq_index[this.version][this.sampRateFreqIndex];
      }
    };
    MpegFrameHeader.SyncByte1 = 255;
    MpegFrameHeader.SyncByte2 = 224;
    MpegFrameHeader.VersionID = [2.5, null, 2, 1];
    MpegFrameHeader.LayerDescription = [0, 3, 2, 1];
    MpegFrameHeader.ChannelMode = ["stereo", "joint_stereo", "dual_channel", "mono"];
    MpegFrameHeader.bitrate_index = {
      1: { 11: 32, 12: 32, 13: 32, 21: 32, 22: 8, 23: 8 },
      2: { 11: 64, 12: 48, 13: 40, 21: 48, 22: 16, 23: 16 },
      3: { 11: 96, 12: 56, 13: 48, 21: 56, 22: 24, 23: 24 },
      4: { 11: 128, 12: 64, 13: 56, 21: 64, 22: 32, 23: 32 },
      5: { 11: 160, 12: 80, 13: 64, 21: 80, 22: 40, 23: 40 },
      6: { 11: 192, 12: 96, 13: 80, 21: 96, 22: 48, 23: 48 },
      7: { 11: 224, 12: 112, 13: 96, 21: 112, 22: 56, 23: 56 },
      8: { 11: 256, 12: 128, 13: 112, 21: 128, 22: 64, 23: 64 },
      9: { 11: 288, 12: 160, 13: 128, 21: 144, 22: 80, 23: 80 },
      10: { 11: 320, 12: 192, 13: 160, 21: 160, 22: 96, 23: 96 },
      11: { 11: 352, 12: 224, 13: 192, 21: 176, 22: 112, 23: 112 },
      12: { 11: 384, 12: 256, 13: 224, 21: 192, 22: 128, 23: 128 },
      13: { 11: 416, 12: 320, 13: 256, 21: 224, 22: 144, 23: 144 },
      14: { 11: 448, 12: 384, 13: 320, 21: 256, 22: 160, 23: 160 }
    };
    MpegFrameHeader.sampling_rate_freq_index = {
      1: { 0: 44100, 1: 48e3, 2: 32e3 },
      2: { 0: 22050, 1: 24e3, 2: 16e3 },
      2.5: { 0: 11025, 1: 12e3, 2: 8e3 }
    };
    MpegFrameHeader.samplesInFrameTable = [
      /* Layer   I    II   III */
      [0, 384, 1152, 1152],
      // MPEG-1
      [0, 384, 1152, 576]
      // MPEG-2(.5
    ];
    FrameHeader = {
      len: 4,
      get: (buf, off) => {
        return new MpegFrameHeader(buf, off);
      }
    };
    MpegParser = class extends AbstractID3Parser {
      constructor() {
        super(...arguments);
        this.frameCount = 0;
        this.syncFrameCount = -1;
        this.totalDataLength = 0;
        this.bitrates = [];
        this.offset = 0;
        this.frame_size = 0;
        this.calculateEofDuration = false;
        this.samplesPerFrame = null;
        this.buf_frame_header = new Uint8Array(4);
        this.mpegOffset = null;
        this.syncPeek = {
          buf: new Uint8Array(maxPeekLen),
          len: 0
        };
      }
      /**
       * Called after ID3 headers have been parsed
       */
      async postId3v2Parse() {
        this.metadata.setFormat("lossless", false);
        this.metadata.setAudioOnly();
        try {
          let quit = false;
          while (!quit) {
            await this.sync();
            quit = await this.parseCommonMpegHeader();
          }
        } catch (err) {
          if (err instanceof EndOfStreamError) {
            debug7("End-of-stream");
            if (this.calculateEofDuration) {
              if (this.samplesPerFrame !== null) {
                const numberOfSamples = this.frameCount * this.samplesPerFrame;
                this.metadata.setFormat("numberOfSamples", numberOfSamples);
                if (this.metadata.format.sampleRate) {
                  const duration = numberOfSamples / this.metadata.format.sampleRate;
                  debug7(`Calculate duration at EOF: ${duration} sec.`, duration);
                  this.metadata.setFormat("duration", duration);
                }
              }
            }
          } else {
            throw err;
          }
        }
      }
      /**
       * Called after file has been fully parsed, this allows, if present, to exclude the ID3v1.1 header length
       */
      finalize() {
        const format = this.metadata.format;
        const hasID3v1 = !!this.metadata.native.ID3v1;
        if (this.mpegOffset !== null) {
          if (format.duration && this.tokenizer.fileInfo.size) {
            const mpegSize = this.tokenizer.fileInfo.size - this.mpegOffset - (hasID3v1 ? 128 : 0);
            if (format.codecProfile && format.codecProfile[0] === "V") {
              this.metadata.setFormat("bitrate", mpegSize * 8 / format.duration);
            }
          }
          if (this.tokenizer.fileInfo.size && format.codecProfile === "CBR") {
            const mpegSize = this.tokenizer.fileInfo.size - this.mpegOffset - (hasID3v1 ? 128 : 0);
            if (this.frame_size !== null && this.samplesPerFrame !== null) {
              const numberOfSamples = Math.round(mpegSize / this.frame_size) * this.samplesPerFrame;
              this.metadata.setFormat("numberOfSamples", numberOfSamples);
              if (format.sampleRate && !format.duration) {
                const duration = numberOfSamples / format.sampleRate;
                debug7("Calculate CBR duration based on file size: %s", duration);
                this.metadata.setFormat("duration", duration);
              }
            }
          }
        }
      }
      async sync() {
        let gotFirstSync = false;
        while (true) {
          let bo = 0;
          this.syncPeek.len = await this.tokenizer.peekBuffer(this.syncPeek.buf, { length: maxPeekLen, mayBeLess: true });
          if (this.syncPeek.len <= 163) {
            throw new EndOfStreamError();
          }
          while (true) {
            if (gotFirstSync && (this.syncPeek.buf[bo] & 224) === 224) {
              this.buf_frame_header[0] = MpegFrameHeader.SyncByte1;
              this.buf_frame_header[1] = this.syncPeek.buf[bo];
              await this.tokenizer.ignore(bo);
              debug7(`Sync at offset=${this.tokenizer.position - 1}, frameCount=${this.frameCount}`);
              if (this.syncFrameCount === this.frameCount) {
                debug7(`Re-synced MPEG stream, frameCount=${this.frameCount}`);
                this.frameCount = 0;
                this.frame_size = 0;
              }
              this.syncFrameCount = this.frameCount;
              return;
            }
            gotFirstSync = false;
            bo = this.syncPeek.buf.indexOf(MpegFrameHeader.SyncByte1, bo);
            if (bo === -1) {
              if (this.syncPeek.len < this.syncPeek.buf.length) {
                throw new EndOfStreamError();
              }
              await this.tokenizer.ignore(this.syncPeek.len);
              break;
            }
            ++bo;
            gotFirstSync = true;
          }
        }
      }
      /**
       * Combined ADTS & MPEG (MP2 & MP3) header handling
       * @return {Promise<boolean>} true if parser should quit
       */
      async parseCommonMpegHeader() {
        if (this.frameCount === 0) {
          this.mpegOffset = this.tokenizer.position - 1;
        }
        await this.tokenizer.peekBuffer(this.buf_frame_header.subarray(1), { length: 3 });
        let header;
        try {
          header = FrameHeader.get(this.buf_frame_header, 0);
        } catch (err) {
          await this.tokenizer.ignore(1);
          if (err instanceof Error) {
            this.metadata.addWarning(`Parse error: ${err.message}`);
            return false;
          }
          throw err;
        }
        await this.tokenizer.ignore(3);
        this.metadata.setFormat("container", header.container);
        this.metadata.setFormat("codec", header.codec);
        this.metadata.setFormat("lossless", false);
        this.metadata.setFormat("sampleRate", header.samplingRate);
        this.frameCount++;
        return header.version !== null && header.version >= 2 && header.layer === 0 ? this.parseAdts(header) : this.parseAudioFrameHeader(header);
      }
      /**
       * @return {Promise<boolean>} true if parser should quit
       */
      async parseAudioFrameHeader(header) {
        this.metadata.setFormat("numberOfChannels", header.channelMode === "mono" ? 1 : 2);
        this.metadata.setFormat("bitrate", header.bitrate);
        if (this.frameCount < 20 * 1e4) {
          debug7("offset=%s MP%s bitrate=%s sample-rate=%s", this.tokenizer.position - 4, header.layer, header.bitrate, header.samplingRate);
        }
        const slot_size = header.calcSlotSize();
        if (slot_size === null) {
          throw new MpegContentError("invalid slot_size");
        }
        const samples_per_frame = header.calcSamplesPerFrame();
        debug7(`samples_per_frame=${samples_per_frame}`);
        const bps = samples_per_frame / 8;
        if (header.bitrate !== null && header.samplingRate != null) {
          const fsize = bps * header.bitrate / header.samplingRate + (header.padding ? slot_size : 0);
          this.frame_size = Math.floor(fsize);
        }
        this.audioFrameHeader = header;
        if (header.bitrate !== null) {
          this.bitrates.push(header.bitrate);
        }
        if (this.frameCount === 1) {
          this.offset = FrameHeader.len;
          await this.skipSideInformation();
          return false;
        }
        if (this.frameCount === 4) {
          if (this.areAllSame(this.bitrates)) {
            this.samplesPerFrame = samples_per_frame;
            this.metadata.setFormat("codecProfile", "CBR");
            if (this.tokenizer.fileInfo.size)
              return true;
          } else if (this.metadata.format.duration) {
            return true;
          }
          if (!this.options.duration) {
            return true;
          }
        }
        if (this.options.duration && this.frameCount === 4) {
          this.samplesPerFrame = samples_per_frame;
          this.calculateEofDuration = true;
        }
        this.offset = 4;
        if (header.isProtectedByCRC) {
          await this.parseCrc();
          return false;
        }
        await this.skipSideInformation();
        return false;
      }
      async parseAdts(header) {
        const buf = new Uint8Array(3);
        await this.tokenizer.readBuffer(buf);
        header.frameLength += getBitAllignedNumber(buf, 0, 0, 11);
        this.totalDataLength += header.frameLength;
        this.samplesPerFrame = 1024;
        if (header.samplingRate !== null) {
          const framesPerSec = header.samplingRate / this.samplesPerFrame;
          const bytesPerFrame = this.frameCount === 0 ? 0 : this.totalDataLength / this.frameCount;
          const bitrate = 8 * bytesPerFrame * framesPerSec + 0.5;
          this.metadata.setFormat("bitrate", bitrate);
          debug7(`frame-count=${this.frameCount}, size=${header.frameLength} bytes, bit-rate=${bitrate}`);
        }
        await this.tokenizer.ignore(header.frameLength > 7 ? header.frameLength - 7 : 1);
        if (this.frameCount === 3) {
          this.metadata.setFormat("codecProfile", header.codecProfile);
          if (header.mp4ChannelConfig) {
            this.metadata.setFormat("numberOfChannels", header.mp4ChannelConfig.length);
          }
          if (this.options.duration) {
            this.calculateEofDuration = true;
          } else {
            return true;
          }
        }
        return false;
      }
      async parseCrc() {
        await this.tokenizer.ignore(INT16_BE.len);
        this.offset += INT16_BE.len;
        return this.skipSideInformation();
      }
      async skipSideInformation() {
        if (this.audioFrameHeader) {
          const sideinfo_length = this.audioFrameHeader.calculateSideInfoLength();
          if (sideinfo_length !== null) {
            await this.tokenizer.readToken(new Uint8ArrayType(sideinfo_length));
            this.offset += sideinfo_length;
            await this.readXtraInfoHeader();
            return;
          }
        }
      }
      async readXtraInfoHeader() {
        const headerTag = await this.tokenizer.readToken(InfoTagHeaderTag);
        this.offset += InfoTagHeaderTag.len;
        switch (headerTag) {
          case "Info":
            this.metadata.setFormat("codecProfile", "CBR");
            return this.readXingInfoHeader();
          case "Xing": {
            const infoTag = await this.readXingInfoHeader();
            if (infoTag.vbrScale !== null) {
              const codecProfile = getVbrCodecProfile(infoTag.vbrScale);
              this.metadata.setFormat("codecProfile", codecProfile);
            }
            return null;
          }
          case "Xtra":
            break;
          case "LAME": {
            const version = await this.tokenizer.readToken(LameEncoderVersion);
            if (this.frame_size !== null && this.frame_size >= this.offset + LameEncoderVersion.len) {
              this.offset += LameEncoderVersion.len;
              this.metadata.setFormat("tool", `LAME ${version}`);
              await this.skipFrameData(this.frame_size - this.offset);
              return null;
            }
            this.metadata.addWarning("Corrupt LAME header");
            break;
          }
        }
        const frameDataLeft = this.frame_size - this.offset;
        if (frameDataLeft < 0) {
          this.metadata.addWarning(`Frame ${this.frameCount}corrupt: negative frameDataLeft`);
        } else {
          await this.skipFrameData(frameDataLeft);
        }
        return null;
      }
      /**
       * Ref: http://gabriel.mp3-tech.org/mp3infotag.html
       * @returns {Promise<string>}
       */
      async readXingInfoHeader() {
        const offset = this.tokenizer.position;
        const infoTag = await readXingHeader(this.tokenizer);
        this.offset += this.tokenizer.position - offset;
        if (infoTag.lame) {
          this.metadata.setFormat("tool", `LAME ${stripNulls(infoTag.lame.version)}`);
          if (infoTag.lame.extended) {
            this.metadata.setFormat("trackPeakLevel", infoTag.lame.extended.track_peak);
            if (infoTag.lame.extended.track_gain) {
              this.metadata.setFormat("trackGain", infoTag.lame.extended.track_gain.adjustment);
            }
            if (infoTag.lame.extended.album_gain) {
              this.metadata.setFormat("albumGain", infoTag.lame.extended.album_gain.adjustment);
            }
            this.metadata.setFormat("duration", infoTag.lame.extended.music_length / 1e3);
          }
        }
        if (infoTag.streamSize && this.audioFrameHeader && infoTag.numFrames !== null) {
          const duration = this.audioFrameHeader.calcDuration(infoTag.numFrames);
          this.metadata.setFormat("duration", duration);
          debug7("Get duration from Xing header: %s", this.metadata.format.duration);
          return infoTag;
        }
        const frameDataLeft = this.frame_size - this.offset;
        await this.skipFrameData(frameDataLeft);
        return infoTag;
      }
      async skipFrameData(frameDataLeft) {
        if (frameDataLeft < 0)
          throw new MpegContentError("frame-data-left cannot be negative");
        await this.tokenizer.ignore(frameDataLeft);
      }
      areAllSame(array) {
        const first = array[0];
        return array.every((element) => {
          return element === first;
        });
      }
    };
  }
});

// node_modules/win-guid/lib/guid.js
function parseWindowsGuid(guid) {
  let s = guid.trim();
  if (s.length !== 36 || s[8] !== "-" || s[13] !== "-" || s[18] !== "-" || s[23] !== "-") {
    throw new Error(`Invalid GUID format: ${guid}`);
  }
  let v;
  const out = new Uint8Array(16);
  v = parseInt(s.slice(0, 8), 16);
  out[0] = v & 255;
  out[1] = v >>> 8 & 255;
  out[2] = v >>> 16 & 255;
  out[3] = v >>> 24 & 255;
  v = parseInt(s.slice(9, 13), 16);
  out[4] = v & 255;
  out[5] = v >>> 8 & 255;
  v = parseInt(s.slice(14, 18), 16);
  out[6] = v & 255;
  out[7] = v >>> 8 & 255;
  v = parseInt(s.slice(19, 23), 16);
  out[8] = v >>> 8 & 255;
  out[9] = v & 255;
  v = parseInt(s.slice(24, 32), 16);
  out[10] = v >>> 24 & 255;
  out[11] = v >>> 16 & 255;
  out[12] = v >>> 8 & 255;
  out[13] = v & 255;
  v = parseInt(s.slice(32, 36), 16);
  out[14] = v >>> 8 & 255;
  out[15] = v & 255;
  for (let i = 0; i < 16; i++) {
    if (!Number.isFinite(out[i])) {
      throw new Error(`Invalid GUID format: ${guid}`);
    }
  }
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s)) {
    throw new Error(`Invalid GUID format: ${guid}`);
  }
  return out;
}
var Guid;
var init_guid = __esm({
  "node_modules/win-guid/lib/guid.js"() {
    Guid = class _Guid {
      constructor(bytes) {
        if (bytes.length !== 16)
          throw new Error("GUID must be exactly 16 bytes");
        this.bytes = bytes;
      }
      static fromString(guid) {
        return new _Guid(parseWindowsGuid(guid));
      }
      /**
       * Convert Windows / CFBF byte order into canonical GUID string:
       * xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
       */
      toString() {
        const b = this.bytes;
        const hx = (n) => n.toString(16).padStart(2, "0");
        const g1 = hx(b[3]) + hx(b[2]) + hx(b[1]) + hx(b[0]);
        const g2 = hx(b[5]) + hx(b[4]);
        const g3 = hx(b[7]) + hx(b[6]);
        const g4 = hx(b[8]) + hx(b[9]);
        const g5 = hx(b[10]) + hx(b[11]) + hx(b[12]) + hx(b[13]) + hx(b[14]) + hx(b[15]);
        return `${g1}-${g2}-${g3}-${g4}-${g5}`.toUpperCase();
      }
      /**
       * Compare against a Uint8Array containing GUID bytes
       * in Windows / CFBF layout.
       */
      equals(buf, offset = 0) {
        if (offset < 0 || buf.length - offset < 16)
          return false;
        const a = this.bytes;
        for (let i = 0; i < 16; i++) {
          if (buf[offset + i] !== a[i])
            return false;
        }
        return true;
      }
    };
  }
});

// node_modules/music-metadata/lib/asf/AsfGuid.js
var AsfGuid, AsfGuid_default;
var init_AsfGuid = __esm({
  "node_modules/music-metadata/lib/asf/AsfGuid.js"() {
    init_guid();
    AsfGuid = class _AsfGuid {
      static fromBin(bin, offset = 0) {
        return new _AsfGuid(_AsfGuid.decode(bin, offset));
      }
      /**
       * Decode GUID in format like "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
       * @param objectId Binary GUID
       * @param offset Read offset in bytes, default 0
       * @returns GUID as dashed hexadecimal representation
       */
      static decode(objectId, offset = 0) {
        return new Guid(objectId.subarray(offset, offset + 16)).toString();
      }
      /**
       * Decode stream type
       * @param mediaType Media type GUID
       * @returns Media type
       */
      static decodeMediaType(mediaType) {
        switch (mediaType.str) {
          case _AsfGuid.AudioMedia.str:
            return "audio";
          case _AsfGuid.VideoMedia.str:
            return "video";
          case _AsfGuid.CommandMedia.str:
            return "command";
          case _AsfGuid.Degradable_JPEG_Media.str:
            return "degradable-jpeg";
          case _AsfGuid.FileTransferMedia.str:
            return "file-transfer";
          case _AsfGuid.BinaryMedia.str:
            return "binary";
        }
      }
      /**
       * Encode GUID
       * @param guid GUID like: "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
       * @returns Encoded Binary GUID
       */
      static encode(guid) {
        return parseWindowsGuid(guid);
      }
      constructor(str) {
        this.str = str;
      }
      equals(guid) {
        return this.str === guid.str;
      }
      toBin() {
        return _AsfGuid.encode(this.str);
      }
    };
    AsfGuid.HeaderObject = new AsfGuid("75B22630-668E-11CF-A6D9-00AA0062CE6C");
    AsfGuid.DataObject = new AsfGuid("75B22636-668E-11CF-A6D9-00AA0062CE6C");
    AsfGuid.SimpleIndexObject = new AsfGuid("33000890-E5B1-11CF-89F4-00A0C90349CB");
    AsfGuid.IndexObject = new AsfGuid("D6E229D3-35DA-11D1-9034-00A0C90349BE");
    AsfGuid.MediaObjectIndexObject = new AsfGuid("FEB103F8-12AD-4C64-840F-2A1D2F7AD48C");
    AsfGuid.TimecodeIndexObject = new AsfGuid("3CB73FD0-0C4A-4803-953D-EDF7B6228F0C");
    AsfGuid.FilePropertiesObject = new AsfGuid("8CABDCA1-A947-11CF-8EE4-00C00C205365");
    AsfGuid.StreamPropertiesObject = new AsfGuid("B7DC0791-A9B7-11CF-8EE6-00C00C205365");
    AsfGuid.HeaderExtensionObject = new AsfGuid("5FBF03B5-A92E-11CF-8EE3-00C00C205365");
    AsfGuid.CodecListObject = new AsfGuid("86D15240-311D-11D0-A3A4-00A0C90348F6");
    AsfGuid.ScriptCommandObject = new AsfGuid("1EFB1A30-0B62-11D0-A39B-00A0C90348F6");
    AsfGuid.MarkerObject = new AsfGuid("F487CD01-A951-11CF-8EE6-00C00C205365");
    AsfGuid.BitrateMutualExclusionObject = new AsfGuid("D6E229DC-35DA-11D1-9034-00A0C90349BE");
    AsfGuid.ErrorCorrectionObject = new AsfGuid("75B22635-668E-11CF-A6D9-00AA0062CE6C");
    AsfGuid.ContentDescriptionObject = new AsfGuid("75B22633-668E-11CF-A6D9-00AA0062CE6C");
    AsfGuid.ExtendedContentDescriptionObject = new AsfGuid("D2D0A440-E307-11D2-97F0-00A0C95EA850");
    AsfGuid.ContentBrandingObject = new AsfGuid("2211B3FA-BD23-11D2-B4B7-00A0C955FC6E");
    AsfGuid.StreamBitratePropertiesObject = new AsfGuid("7BF875CE-468D-11D1-8D82-006097C9A2B2");
    AsfGuid.ContentEncryptionObject = new AsfGuid("2211B3FB-BD23-11D2-B4B7-00A0C955FC6E");
    AsfGuid.ExtendedContentEncryptionObject = new AsfGuid("298AE614-2622-4C17-B935-DAE07EE9289C");
    AsfGuid.DigitalSignatureObject = new AsfGuid("2211B3FC-BD23-11D2-B4B7-00A0C955FC6E");
    AsfGuid.PaddingObject = new AsfGuid("1806D474-CADF-4509-A4BA-9AABCB96AAE8");
    AsfGuid.ExtendedStreamPropertiesObject = new AsfGuid("14E6A5CB-C672-4332-8399-A96952065B5A");
    AsfGuid.AdvancedMutualExclusionObject = new AsfGuid("A08649CF-4775-4670-8A16-6E35357566CD");
    AsfGuid.GroupMutualExclusionObject = new AsfGuid("D1465A40-5A79-4338-B71B-E36B8FD6C249");
    AsfGuid.StreamPrioritizationObject = new AsfGuid("D4FED15B-88D3-454F-81F0-ED5C45999E24");
    AsfGuid.BandwidthSharingObject = new AsfGuid("A69609E6-517B-11D2-B6AF-00C04FD908E9");
    AsfGuid.LanguageListObject = new AsfGuid("7C4346A9-EFE0-4BFC-B229-393EDE415C85");
    AsfGuid.MetadataObject = new AsfGuid("C5F8CBEA-5BAF-4877-8467-AA8C44FA4CCA");
    AsfGuid.MetadataLibraryObject = new AsfGuid("44231C94-9498-49D1-A141-1D134E457054");
    AsfGuid.IndexParametersObject = new AsfGuid("D6E229DF-35DA-11D1-9034-00A0C90349BE");
    AsfGuid.MediaObjectIndexParametersObject = new AsfGuid("6B203BAD-3F11-48E4-ACA8-D7613DE2CFA7");
    AsfGuid.TimecodeIndexParametersObject = new AsfGuid("F55E496D-9797-4B5D-8C8B-604DFE9BFB24");
    AsfGuid.CompatibilityObject = new AsfGuid("26F18B5D-4584-47EC-9F5F-0E651F0452C9");
    AsfGuid.AdvancedContentEncryptionObject = new AsfGuid("43058533-6981-49E6-9B74-AD12CB86D58C");
    AsfGuid.AudioMedia = new AsfGuid("F8699E40-5B4D-11CF-A8FD-00805F5C442B");
    AsfGuid.VideoMedia = new AsfGuid("BC19EFC0-5B4D-11CF-A8FD-00805F5C442B");
    AsfGuid.CommandMedia = new AsfGuid("59DACFC0-59E6-11D0-A3AC-00A0C90348F6");
    AsfGuid.JFIF_Media = new AsfGuid("B61BE100-5B4E-11CF-A8FD-00805F5C442B");
    AsfGuid.Degradable_JPEG_Media = new AsfGuid("35907DE0-E415-11CF-A917-00805F5C442B");
    AsfGuid.FileTransferMedia = new AsfGuid("91BD222C-F21C-497A-8B6D-5AA86BFC0185");
    AsfGuid.BinaryMedia = new AsfGuid("3AFB65E2-47EF-40F2-AC2C-70A90D71D343");
    AsfGuid.ASF_Index_Placeholder_Object = new AsfGuid("D9AADE20-7C17-4F9C-BC28-8555DD98E2A2");
    AsfGuid_default = AsfGuid;
  }
});

// node_modules/music-metadata/lib/asf/AsfUtil.js
function getParserForAttr(i) {
  return attributeParsers[i];
}
function parseUnicodeAttr(uint8Array) {
  return stripNulls(decodeString(uint8Array, "utf-16le"));
}
function parseByteArrayAttr(buf) {
  return new Uint8Array(buf);
}
function parseBoolAttr(buf, offset = 0) {
  return parseWordAttr(buf, offset) === 1;
}
function parseDWordAttr(buf, offset = 0) {
  return UINT32_LE.get(buf, offset);
}
function parseQWordAttr(buf, offset = 0) {
  return UINT64_LE.get(buf, offset);
}
function parseWordAttr(buf, offset = 0) {
  return UINT16_LE.get(buf, offset);
}
var attributeParsers;
var init_AsfUtil = __esm({
  "node_modules/music-metadata/lib/asf/AsfUtil.js"() {
    init_lib3();
    init_Util();
    attributeParsers = [
      parseUnicodeAttr,
      parseByteArrayAttr,
      parseBoolAttr,
      parseDWordAttr,
      parseQWordAttr,
      parseWordAttr,
      parseByteArrayAttr
    ];
  }
});

// node_modules/music-metadata/lib/asf/AsfObject.js
async function readString(tokenizer) {
  const length = await tokenizer.readNumber(UINT16_LE);
  return (await tokenizer.readToken(new StringType(length * 2, "utf-16le"))).replace("\0", "");
}
async function readCodecEntries(tokenizer) {
  const codecHeader = await tokenizer.readToken(CodecListObjectHeader);
  const entries = [];
  for (let i = 0; i < codecHeader.entryCount; ++i) {
    entries.push(await readCodecEntry(tokenizer));
  }
  return entries;
}
async function readInformation(tokenizer) {
  const length = await tokenizer.readNumber(UINT16_LE);
  const buf = new Uint8Array(length);
  await tokenizer.readBuffer(buf);
  return buf;
}
async function readCodecEntry(tokenizer) {
  const type = await tokenizer.readNumber(UINT16_LE);
  return {
    type: {
      videoCodec: (type & 1) === 1,
      audioCodec: (type & 2) === 2
    },
    codecName: await readString(tokenizer),
    description: await readString(tokenizer),
    information: await readInformation(tokenizer)
  };
}
var AsfContentParseError, TopLevelHeaderObjectToken, HeaderObjectToken, State, IgnoreObjectState, FilePropertiesObject, StreamPropertiesObject, HeaderExtensionObject, CodecListObjectHeader, ContentDescriptionObjectState, ExtendedContentDescriptionObjectState, ExtendedStreamPropertiesObjectState, MetadataObjectState, MetadataLibraryObjectState, WmPictureToken;
var init_AsfObject = __esm({
  "node_modules/music-metadata/lib/asf/AsfObject.js"() {
    init_lib3();
    init_Util();
    init_AsfGuid();
    init_AsfUtil();
    init_ID3v2Token();
    init_ParseError();
    AsfContentParseError = class extends makeUnexpectedFileContentError("ASF") {
    };
    TopLevelHeaderObjectToken = {
      len: 30,
      get: (buf, off) => {
        return {
          objectId: AsfGuid_default.fromBin(buf, off),
          objectSize: Number(UINT64_LE.get(buf, off + 16)),
          numberOfHeaderObjects: UINT32_LE.get(buf, off + 24)
          // Reserved: 2 bytes
        };
      }
    };
    HeaderObjectToken = {
      len: 24,
      get: (buf, off) => {
        return {
          objectId: AsfGuid_default.fromBin(buf, off),
          objectSize: Number(UINT64_LE.get(buf, off + 16))
        };
      }
    };
    State = class {
      constructor(header) {
        this.len = Number(header.objectSize) - HeaderObjectToken.len;
      }
      postProcessTag(tags, name, valueType, data) {
        if (name === "WM/Picture") {
          tags.push({ id: name, value: WmPictureToken.fromBuffer(data) });
        } else {
          const parseAttr = getParserForAttr(valueType);
          if (!parseAttr) {
            throw new AsfContentParseError(`unexpected value headerType: ${valueType}`);
          }
          tags.push({ id: name, value: parseAttr(data) });
        }
      }
    };
    IgnoreObjectState = class extends State {
      get(_buf, _off) {
        return null;
      }
    };
    FilePropertiesObject = class extends State {
      get(buf, off) {
        return {
          fileId: AsfGuid_default.fromBin(buf, off),
          fileSize: UINT64_LE.get(buf, off + 16),
          creationDate: UINT64_LE.get(buf, off + 24),
          dataPacketsCount: UINT64_LE.get(buf, off + 32),
          playDuration: UINT64_LE.get(buf, off + 40),
          sendDuration: UINT64_LE.get(buf, off + 48),
          preroll: UINT64_LE.get(buf, off + 56),
          flags: {
            broadcast: getBit(buf, off + 64, 24),
            seekable: getBit(buf, off + 64, 25)
          },
          // flagsNumeric: Token.UINT32_LE.get(buf, off + 64),
          minimumDataPacketSize: UINT32_LE.get(buf, off + 68),
          maximumDataPacketSize: UINT32_LE.get(buf, off + 72),
          maximumBitrate: UINT32_LE.get(buf, off + 76)
        };
      }
    };
    FilePropertiesObject.guid = AsfGuid_default.FilePropertiesObject;
    StreamPropertiesObject = class extends State {
      get(buf, off) {
        return {
          streamType: AsfGuid_default.decodeMediaType(AsfGuid_default.fromBin(buf, off)),
          errorCorrectionType: AsfGuid_default.fromBin(buf, off + 8)
          // ToDo
        };
      }
    };
    StreamPropertiesObject.guid = AsfGuid_default.StreamPropertiesObject;
    HeaderExtensionObject = class {
      constructor() {
        this.len = 22;
      }
      get(buf, off) {
        const view = new DataView(buf.buffer, off);
        return {
          reserved1: AsfGuid_default.fromBin(buf, off),
          reserved2: view.getUint16(16, true),
          extensionDataSize: view.getUint16(18, true)
        };
      }
    };
    HeaderExtensionObject.guid = AsfGuid_default.HeaderExtensionObject;
    CodecListObjectHeader = {
      len: 20,
      get: (buf, off) => {
        const view = new DataView(buf.buffer, off);
        return {
          entryCount: view.getUint16(16, true)
        };
      }
    };
    ContentDescriptionObjectState = class _ContentDescriptionObjectState extends State {
      get(buf, off) {
        const tags = [];
        const view = new DataView(buf.buffer, off);
        let pos = 10;
        for (let i = 0; i < _ContentDescriptionObjectState.contentDescTags.length; ++i) {
          const length = view.getUint16(i * 2, true);
          if (length > 0) {
            const tagName = _ContentDescriptionObjectState.contentDescTags[i];
            const end = pos + length;
            tags.push({ id: tagName, value: parseUnicodeAttr(buf.subarray(off + pos, off + end)) });
            pos = end;
          }
        }
        return tags;
      }
    };
    ContentDescriptionObjectState.guid = AsfGuid_default.ContentDescriptionObject;
    ContentDescriptionObjectState.contentDescTags = ["Title", "Author", "Copyright", "Description", "Rating"];
    ExtendedContentDescriptionObjectState = class extends State {
      get(buf, off) {
        const tags = [];
        const view = new DataView(buf.buffer, off);
        const attrCount = view.getUint16(0, true);
        let pos = 2;
        for (let i = 0; i < attrCount; i += 1) {
          const nameLen = view.getUint16(pos, true);
          pos += 2;
          const name = parseUnicodeAttr(buf.subarray(off + pos, off + pos + nameLen));
          pos += nameLen;
          const valueType = view.getUint16(pos, true);
          pos += 2;
          const valueLen = view.getUint16(pos, true);
          pos += 2;
          const value = buf.subarray(off + pos, off + pos + valueLen);
          pos += valueLen;
          this.postProcessTag(tags, name, valueType, value);
        }
        return tags;
      }
    };
    ExtendedContentDescriptionObjectState.guid = AsfGuid_default.ExtendedContentDescriptionObject;
    ExtendedStreamPropertiesObjectState = class extends State {
      get(buf, off) {
        const view = new DataView(buf.buffer, off);
        return {
          startTime: UINT64_LE.get(buf, off),
          endTime: UINT64_LE.get(buf, off + 8),
          dataBitrate: view.getInt32(12, true),
          bufferSize: view.getInt32(16, true),
          initialBufferFullness: view.getInt32(20, true),
          alternateDataBitrate: view.getInt32(24, true),
          alternateBufferSize: view.getInt32(28, true),
          alternateInitialBufferFullness: view.getInt32(32, true),
          maximumObjectSize: view.getInt32(36, true),
          flags: {
            reliableFlag: getBit(buf, off + 40, 0),
            seekableFlag: getBit(buf, off + 40, 1),
            resendLiveCleanpointsFlag: getBit(buf, off + 40, 2)
          },
          // flagsNumeric: Token.UINT32_LE.get(buf, off + 64),
          streamNumber: view.getInt16(42, true),
          streamLanguageId: view.getInt16(44, true),
          averageTimePerFrame: view.getInt32(52, true),
          streamNameCount: view.getInt32(54, true),
          payloadExtensionSystems: view.getInt32(56, true),
          streamNames: [],
          // ToDo
          streamPropertiesObject: null
        };
      }
    };
    ExtendedStreamPropertiesObjectState.guid = AsfGuid_default.ExtendedStreamPropertiesObject;
    MetadataObjectState = class extends State {
      get(uint8Array, off) {
        const tags = [];
        const view = new DataView(uint8Array.buffer, off);
        const descriptionRecordsCount = view.getUint16(0, true);
        let pos = 2;
        for (let i = 0; i < descriptionRecordsCount; i += 1) {
          pos += 4;
          const nameLen = view.getUint16(pos, true);
          pos += 2;
          const dataType = view.getUint16(pos, true);
          pos += 2;
          const dataLen = view.getUint32(pos, true);
          pos += 4;
          const name = parseUnicodeAttr(uint8Array.subarray(off + pos, off + pos + nameLen));
          pos += nameLen;
          const data = uint8Array.subarray(off + pos, off + pos + dataLen);
          pos += dataLen;
          this.postProcessTag(tags, name, dataType, data);
        }
        return tags;
      }
    };
    MetadataObjectState.guid = AsfGuid_default.MetadataObject;
    MetadataLibraryObjectState = class extends MetadataObjectState {
    };
    MetadataLibraryObjectState.guid = AsfGuid_default.MetadataLibraryObject;
    WmPictureToken = class _WmPictureToken {
      static fromBuffer(buffer) {
        const pic = new _WmPictureToken(buffer.length);
        return pic.get(buffer, 0);
      }
      constructor(len) {
        this.len = len;
      }
      get(buffer, offset) {
        const view = new DataView(buffer.buffer, offset);
        const typeId = view.getUint8(0);
        const size = view.getInt32(1, true);
        let index = 5;
        while (view.getUint16(index) !== 0) {
          index += 2;
        }
        const format = new StringType(index - 5, "utf-16le").get(buffer, 5);
        while (view.getUint16(index) !== 0) {
          index += 2;
        }
        const description = new StringType(index - 5, "utf-16le").get(buffer, 5);
        return {
          type: AttachedPictureType[typeId],
          format,
          description,
          size,
          data: buffer.slice(index + 4)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/asf/AsfParser.js
var AsfParser_exports = {};
__export(AsfParser_exports, {
  AsfParser: () => AsfParser
});
var import_debug8, debug8, headerType, AsfParser;
var init_AsfParser = __esm({
  "node_modules/music-metadata/lib/asf/AsfParser.js"() {
    import_debug8 = __toESM(require_src(), 1);
    init_type();
    init_AsfGuid();
    init_AsfObject();
    init_BasicParser();
    init_AsfObject();
    debug8 = (0, import_debug8.default)("music-metadata:parser:ASF");
    headerType = "asf";
    AsfParser = class extends BasicParser {
      async parse() {
        const header = await this.tokenizer.readToken(TopLevelHeaderObjectToken);
        if (!header.objectId.equals(AsfGuid_default.HeaderObject)) {
          throw new AsfContentParseError(`expected asf header; but was not found; got: ${header.objectId.str}`);
        }
        await this.parseObjectHeader(header.numberOfHeaderObjects);
      }
      async parseObjectHeader(numberOfObjectHeaders) {
        let tags;
        do {
          const header = await this.tokenizer.readToken(HeaderObjectToken);
          debug8("header GUID=%s", header.objectId.str);
          switch (header.objectId.str) {
            case FilePropertiesObject.guid.str: {
              const fpo = await this.tokenizer.readToken(new FilePropertiesObject(header));
              this.metadata.setFormat("duration", Number(fpo.playDuration / BigInt(1e3)) / 1e4 - Number(fpo.preroll) / 1e3);
              this.metadata.setFormat("bitrate", fpo.maximumBitrate);
              break;
            }
            case StreamPropertiesObject.guid.str: {
              const spo = await this.tokenizer.readToken(new StreamPropertiesObject(header));
              this.metadata.setFormat("container", `ASF/${spo.streamType}`);
              break;
            }
            case HeaderExtensionObject.guid.str: {
              const extHeader = await this.tokenizer.readToken(new HeaderExtensionObject());
              await this.parseExtensionObject(extHeader.extensionDataSize);
              break;
            }
            case ContentDescriptionObjectState.guid.str:
              tags = await this.tokenizer.readToken(new ContentDescriptionObjectState(header));
              await this.addTags(tags);
              break;
            case ExtendedContentDescriptionObjectState.guid.str:
              tags = await this.tokenizer.readToken(new ExtendedContentDescriptionObjectState(header));
              await this.addTags(tags);
              break;
            case AsfGuid_default.CodecListObject.str: {
              const codecs = await readCodecEntries(this.tokenizer);
              codecs.forEach((codec) => {
                this.metadata.addStreamInfo({
                  type: codec.type.videoCodec ? TrackType.video : TrackType.audio,
                  codecName: codec.codecName
                });
              });
              const audioCodecs = codecs.filter((codec) => codec.type.audioCodec).map((codec) => codec.codecName).join("/");
              this.metadata.setFormat("codec", audioCodecs);
              break;
            }
            case AsfGuid_default.StreamBitratePropertiesObject.str:
              await this.tokenizer.ignore(header.objectSize - HeaderObjectToken.len);
              break;
            case AsfGuid_default.PaddingObject.str:
              debug8("Padding: %s bytes", header.objectSize - HeaderObjectToken.len);
              await this.tokenizer.ignore(header.objectSize - HeaderObjectToken.len);
              break;
            default:
              this.metadata.addWarning(`Ignore ASF-Object-GUID: ${header.objectId.str}`);
              debug8("Ignore ASF-Object-GUID: %s", header.objectId.str);
              await this.tokenizer.readToken(new IgnoreObjectState(header));
          }
        } while (--numberOfObjectHeaders);
      }
      async addTags(tags) {
        await Promise.all(tags.map(({ id, value }) => this.metadata.addTag(headerType, id, value)));
      }
      async parseExtensionObject(extensionSize) {
        do {
          const header = await this.tokenizer.readToken(HeaderObjectToken);
          const remaining = header.objectSize - HeaderObjectToken.len;
          if (remaining < 0) {
            throw new AsfContentParseError(`Invalid ASF header object size: ${header.objectSize}`);
          }
          switch (header.objectId.str) {
            case ExtendedStreamPropertiesObjectState.guid.str:
              await this.tokenizer.readToken(new ExtendedStreamPropertiesObjectState(header));
              break;
            case MetadataObjectState.guid.str: {
              const moTags = await this.tokenizer.readToken(new MetadataObjectState(header));
              await this.addTags(moTags);
              break;
            }
            case MetadataLibraryObjectState.guid.str: {
              const mlTags = await this.tokenizer.readToken(new MetadataLibraryObjectState(header));
              await this.addTags(mlTags);
              break;
            }
            case AsfGuid_default.PaddingObject.str:
              await this.tokenizer.ignore(remaining);
              break;
            case AsfGuid_default.CompatibilityObject.str:
              await this.tokenizer.ignore(remaining);
              break;
            case AsfGuid_default.ASF_Index_Placeholder_Object.str:
              await this.tokenizer.ignore(remaining);
              break;
            default:
              this.metadata.addWarning(`Ignore ASF-Object-GUID: ${header.objectId.str}`);
              await this.tokenizer.readToken(new IgnoreObjectState(header));
              break;
          }
          extensionSize -= header.objectSize;
        } while (extensionSize > 0);
      }
    };
  }
});

// node_modules/music-metadata/lib/dsdiff/DsdiffToken.js
var ChunkHeader64;
var init_DsdiffToken = __esm({
  "node_modules/music-metadata/lib/dsdiff/DsdiffToken.js"() {
    init_lib3();
    init_FourCC();
    ChunkHeader64 = {
      len: 12,
      get: (buf, off) => {
        return {
          // Group-ID
          chunkID: FourCcToken.get(buf, off),
          // Size
          chunkSize: INT64_BE.get(buf, off + 4)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/dsdiff/DsdiffParser.js
var DsdiffParser_exports = {};
__export(DsdiffParser_exports, {
  DsdiffContentParseError: () => DsdiffContentParseError,
  DsdiffParser: () => DsdiffParser
});
var import_debug9, debug9, DsdiffContentParseError, DsdiffParser;
var init_DsdiffParser = __esm({
  "node_modules/music-metadata/lib/dsdiff/DsdiffParser.js"() {
    init_lib3();
    import_debug9 = __toESM(require_src(), 1);
    init_lib();
    init_FourCC();
    init_BasicParser();
    init_ID3v2Parser();
    init_DsdiffToken();
    init_ParseError();
    debug9 = (0, import_debug9.default)("music-metadata:parser:aiff");
    DsdiffContentParseError = class extends makeUnexpectedFileContentError("DSDIFF") {
    };
    DsdiffParser = class extends BasicParser {
      async parse() {
        const header = await this.tokenizer.readToken(ChunkHeader64);
        if (header.chunkID !== "FRM8")
          throw new DsdiffContentParseError("Unexpected chunk-ID");
        this.metadata.setAudioOnly();
        const type = (await this.tokenizer.readToken(FourCcToken)).trim();
        switch (type) {
          case "DSD":
            this.metadata.setFormat("container", `DSDIFF/${type}`);
            this.metadata.setFormat("lossless", true);
            return this.readFmt8Chunks(header.chunkSize - BigInt(FourCcToken.len));
          default:
            throw new DsdiffContentParseError(`Unsupported DSDIFF type: ${type}`);
        }
      }
      async readFmt8Chunks(remainingSize) {
        while (remainingSize >= ChunkHeader64.len) {
          const chunkHeader = await this.tokenizer.readToken(ChunkHeader64);
          debug9(`Chunk id=${chunkHeader.chunkID}`);
          await this.readData(chunkHeader);
          remainingSize -= BigInt(ChunkHeader64.len) + chunkHeader.chunkSize;
        }
      }
      async readData(header) {
        debug9(`Reading data of chunk[ID=${header.chunkID}, size=${header.chunkSize}]`);
        const p0 = this.tokenizer.position;
        switch (header.chunkID.trim()) {
          case "FVER": {
            const version = await this.tokenizer.readToken(UINT32_LE);
            debug9(`DSDIFF version=${version}`);
            break;
          }
          case "PROP": {
            const propType = await this.tokenizer.readToken(FourCcToken);
            if (propType !== "SND ")
              throw new DsdiffContentParseError("Unexpected PROP-chunk ID");
            await this.handleSoundPropertyChunks(header.chunkSize - BigInt(FourCcToken.len));
            break;
          }
          case "ID3": {
            const id3_data = await this.tokenizer.readToken(new Uint8ArrayType(Number(header.chunkSize)));
            const rst = fromBuffer(id3_data);
            await new ID3v2Parser().parse(this.metadata, rst, this.options);
            break;
          }
          case "DSD":
            if (this.metadata.format.numberOfChannels) {
              this.metadata.setFormat("numberOfSamples", Number(header.chunkSize * BigInt(8) / BigInt(this.metadata.format.numberOfChannels)));
            }
            if (this.metadata.format.numberOfSamples && this.metadata.format.sampleRate) {
              this.metadata.setFormat("duration", this.metadata.format.numberOfSamples / this.metadata.format.sampleRate);
            }
            break;
          default:
            debug9(`Ignore chunk[ID=${header.chunkID}, size=${header.chunkSize}]`);
            break;
        }
        const remaining = header.chunkSize - BigInt(this.tokenizer.position - p0);
        if (remaining > 0) {
          debug9(`After Parsing chunk, remaining ${remaining} bytes`);
          await this.tokenizer.ignore(Number(remaining));
        }
      }
      async handleSoundPropertyChunks(remainingSize) {
        debug9(`Parsing sound-property-chunks, remainingSize=${remainingSize}`);
        while (remainingSize > 0) {
          const sndPropHeader = await this.tokenizer.readToken(ChunkHeader64);
          debug9(`Sound-property-chunk[ID=${sndPropHeader.chunkID}, size=${sndPropHeader.chunkSize}]`);
          const p0 = this.tokenizer.position;
          switch (sndPropHeader.chunkID.trim()) {
            case "FS": {
              const sampleRate = await this.tokenizer.readToken(UINT32_BE);
              this.metadata.setFormat("sampleRate", sampleRate);
              break;
            }
            case "CHNL": {
              const numChannels = await this.tokenizer.readToken(UINT16_BE);
              this.metadata.setFormat("numberOfChannels", numChannels);
              await this.handleChannelChunks(sndPropHeader.chunkSize - BigInt(UINT16_BE.len));
              break;
            }
            case "CMPR": {
              const compressionIdCode = (await this.tokenizer.readToken(FourCcToken)).trim();
              const count = await this.tokenizer.readToken(UINT8);
              const compressionName = await this.tokenizer.readToken(new StringType(count, "ascii"));
              if (compressionIdCode === "DSD") {
                this.metadata.setFormat("lossless", true);
                this.metadata.setFormat("bitsPerSample", 1);
              }
              this.metadata.setFormat("codec", `${compressionIdCode} (${compressionName})`);
              break;
            }
            case "ABSS": {
              const hours = await this.tokenizer.readToken(UINT16_BE);
              const minutes = await this.tokenizer.readToken(UINT8);
              const seconds = await this.tokenizer.readToken(UINT8);
              const samples = await this.tokenizer.readToken(UINT32_BE);
              debug9(`ABSS ${hours}:${minutes}:${seconds}.${samples}`);
              break;
            }
            case "LSCO": {
              const lsConfig = await this.tokenizer.readToken(UINT16_BE);
              debug9(`LSCO lsConfig=${lsConfig}`);
              break;
            }
            default:
              debug9(`Unknown sound-property-chunk[ID=${sndPropHeader.chunkID}, size=${sndPropHeader.chunkSize}]`);
              await this.tokenizer.ignore(Number(sndPropHeader.chunkSize));
          }
          const remaining = sndPropHeader.chunkSize - BigInt(this.tokenizer.position - p0);
          if (remaining > 0) {
            debug9(`After Parsing sound-property-chunk ${sndPropHeader.chunkSize}, remaining ${remaining} bytes`);
            await this.tokenizer.ignore(Number(remaining));
          }
          remainingSize -= BigInt(ChunkHeader64.len) + sndPropHeader.chunkSize;
          debug9(`Parsing sound-property-chunks, remainingSize=${remainingSize}`);
        }
        if (this.metadata.format.lossless && this.metadata.format.sampleRate && this.metadata.format.numberOfChannels && this.metadata.format.bitsPerSample) {
          const bitrate = this.metadata.format.sampleRate * this.metadata.format.numberOfChannels * this.metadata.format.bitsPerSample;
          this.metadata.setFormat("bitrate", bitrate);
        }
      }
      async handleChannelChunks(remainingSize) {
        debug9(`Parsing channel-chunks, remainingSize=${remainingSize}`);
        const channels = [];
        while (remainingSize >= FourCcToken.len) {
          const channelId = await this.tokenizer.readToken(FourCcToken);
          debug9(`Channel[ID=${channelId}]`);
          channels.push(channelId);
          remainingSize -= BigInt(FourCcToken.len);
        }
        debug9(`Channels: ${channels.join(", ")}`);
        return channels;
      }
    };
  }
});

// node_modules/music-metadata/lib/aiff/AiffToken.js
var compressionTypes, AiffContentError, Common;
var init_AiffToken = __esm({
  "node_modules/music-metadata/lib/aiff/AiffToken.js"() {
    init_lib3();
    init_FourCC();
    init_ParseError();
    compressionTypes = {
      NONE: "not compressed	PCM	Apple Computer",
      sowt: "PCM (byte swapped)",
      fl32: "32-bit floating point IEEE 32-bit float",
      fl64: "64-bit floating point IEEE 64-bit float	Apple Computer",
      alaw: "ALaw 2:1	8-bit ITU-T G.711 A-law",
      ulaw: "\xB5Law 2:1	8-bit ITU-T G.711 \xB5-law	Apple Computer",
      ULAW: "CCITT G.711 u-law 8-bit ITU-T G.711 \xB5-law",
      ALAW: "CCITT G.711 A-law 8-bit ITU-T G.711 A-law",
      FL32: "Float 32	IEEE 32-bit float "
    };
    AiffContentError = class extends makeUnexpectedFileContentError("AIFF") {
    };
    Common = class {
      constructor(header, isAifc) {
        this.isAifc = isAifc;
        const minimumChunkSize = isAifc ? 22 : 18;
        if (header.chunkSize < minimumChunkSize)
          throw new AiffContentError(`COMMON CHUNK size should always be at least ${minimumChunkSize}`);
        this.len = header.chunkSize;
      }
      get(buf, off) {
        const shift = UINT16_BE.get(buf, off + 8) - 16398;
        const baseSampleRate = UINT16_BE.get(buf, off + 8 + 2);
        const res = {
          numChannels: UINT16_BE.get(buf, off),
          numSampleFrames: UINT32_BE.get(buf, off + 2),
          sampleSize: UINT16_BE.get(buf, off + 6),
          sampleRate: shift < 0 ? baseSampleRate >> Math.abs(shift) : baseSampleRate << shift
        };
        if (this.isAifc) {
          res.compressionType = FourCcToken.get(buf, off + 18);
          if (this.len > 22) {
            const strLen = UINT8.get(buf, off + 22);
            if (strLen > 0) {
              const padding = (strLen + 1) % 2;
              if (23 + strLen + padding === this.len) {
                res.compressionName = new StringType(strLen, "latin1").get(buf, off + 23);
              } else {
                throw new AiffContentError("Illegal pstring length");
              }
            } else {
              res.compressionName = void 0;
            }
          }
        } else {
          res.compressionName = "PCM";
        }
        return res;
      }
    };
  }
});

// node_modules/music-metadata/lib/iff/index.js
var Header2;
var init_iff = __esm({
  "node_modules/music-metadata/lib/iff/index.js"() {
    init_lib3();
    init_FourCC();
    Header2 = {
      len: 8,
      get: (buf, off) => {
        return {
          // Chunk type ID
          chunkID: FourCcToken.get(buf, off),
          // Chunk size
          chunkSize: Number(BigInt(UINT32_BE.get(buf, off + 4)))
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/aiff/AiffParser.js
var AiffParser_exports = {};
__export(AiffParser_exports, {
  AIFFParser: () => AIFFParser
});
var import_debug10, debug10, AIFFParser;
var init_AiffParser = __esm({
  "node_modules/music-metadata/lib/aiff/AiffParser.js"() {
    init_lib3();
    import_debug10 = __toESM(require_src(), 1);
    init_lib();
    init_ID3v2Parser();
    init_FourCC();
    init_BasicParser();
    init_AiffToken();
    init_AiffToken();
    init_iff();
    debug10 = (0, import_debug10.default)("music-metadata:parser:aiff");
    AIFFParser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.isCompressed = null;
      }
      async parse() {
        const header = await this.tokenizer.readToken(Header2);
        if (header.chunkID !== "FORM")
          throw new AiffContentError("Invalid Chunk-ID, expected 'FORM'");
        const type = await this.tokenizer.readToken(FourCcToken);
        switch (type) {
          case "AIFF":
            this.metadata.setFormat("container", type);
            this.isCompressed = false;
            break;
          case "AIFC":
            this.metadata.setFormat("container", "AIFF-C");
            this.isCompressed = true;
            break;
          default:
            throw new AiffContentError(`Unsupported AIFF type: ${type}`);
        }
        this.metadata.setFormat("lossless", !this.isCompressed);
        this.metadata.setAudioOnly();
        try {
          while (!this.tokenizer.fileInfo.size || this.tokenizer.fileInfo.size - this.tokenizer.position >= Header2.len) {
            debug10(`Reading AIFF chunk at offset=${this.tokenizer.position}`);
            const chunkHeader = await this.tokenizer.readToken(Header2);
            const nextChunk = 2 * Math.round(chunkHeader.chunkSize / 2);
            const bytesRead = await this.readData(chunkHeader);
            await this.tokenizer.ignore(nextChunk - bytesRead);
          }
        } catch (err) {
          if (err instanceof EndOfStreamError) {
            debug10("End-of-stream");
          } else {
            throw err;
          }
        }
      }
      async readData(header) {
        switch (header.chunkID) {
          case "COMM": {
            if (this.isCompressed === null) {
              throw new AiffContentError("Failed to parse AIFF.COMM chunk when compression type is unknown");
            }
            const common = await this.tokenizer.readToken(new Common(header, this.isCompressed));
            this.metadata.setFormat("bitsPerSample", common.sampleSize);
            this.metadata.setFormat("sampleRate", common.sampleRate);
            this.metadata.setFormat("numberOfChannels", common.numChannels);
            this.metadata.setFormat("numberOfSamples", common.numSampleFrames);
            this.metadata.setFormat("duration", common.numSampleFrames / common.sampleRate);
            if (common.compressionName || common.compressionType) {
              this.metadata.setFormat("codec", common.compressionName ?? compressionTypes[common.compressionType]);
            }
            return header.chunkSize;
          }
          case "ID3 ": {
            const id3_data = await this.tokenizer.readToken(new Uint8ArrayType(header.chunkSize));
            const rst = fromBuffer(id3_data);
            await new ID3v2Parser().parse(this.metadata, rst, this.options);
            return header.chunkSize;
          }
          case "SSND":
            if (this.metadata.format.duration) {
              this.metadata.setFormat("bitrate", 8 * header.chunkSize / this.metadata.format.duration);
            }
            return 0;
          case "NAME":
          // Sample name chunk
          case "AUTH":
          // Author chunk
          case "(c) ":
          // Copyright chunk
          case "ANNO":
            return this.readTextChunk(header);
          default:
            debug10(`Ignore chunk id=${header.chunkID}, size=${header.chunkSize}`);
            return 0;
        }
      }
      async readTextChunk(header) {
        const value = await this.tokenizer.readToken(new StringType(header.chunkSize, "ascii"));
        const values = value.split("\0").map((v) => v.trim()).filter((v) => v?.length);
        await Promise.all(values.map((v) => this.metadata.addTag("AIFF", header.chunkID, v)));
        return header.chunkSize;
      }
    };
  }
});

// node_modules/music-metadata/lib/dsf/DsfChunk.js
var ChunkHeader, DsdChunk, FormatChunk;
var init_DsfChunk = __esm({
  "node_modules/music-metadata/lib/dsf/DsfChunk.js"() {
    init_lib3();
    init_FourCC();
    ChunkHeader = {
      len: 12,
      get: (buf, off) => {
        return { id: FourCcToken.get(buf, off), size: UINT64_LE.get(buf, off + 4) };
      }
    };
    DsdChunk = {
      len: 16,
      get: (buf, off) => {
        return {
          fileSize: INT64_LE.get(buf, off),
          metadataPointer: INT64_LE.get(buf, off + 8)
        };
      }
    };
    FormatChunk = {
      len: 40,
      get: (buf, off) => {
        return {
          formatVersion: INT32_LE.get(buf, off),
          formatID: INT32_LE.get(buf, off + 4),
          channelType: INT32_LE.get(buf, off + 8),
          channelNum: INT32_LE.get(buf, off + 12),
          samplingFrequency: INT32_LE.get(buf, off + 16),
          bitsPerSample: INT32_LE.get(buf, off + 20),
          sampleCount: INT64_LE.get(buf, off + 24),
          blockSizePerChannel: INT32_LE.get(buf, off + 32)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/dsf/DsfParser.js
var DsfParser_exports = {};
__export(DsfParser_exports, {
  DsdContentParseError: () => DsdContentParseError,
  DsfParser: () => DsfParser
});
var import_debug11, debug11, DsdContentParseError, DsfParser;
var init_DsfParser = __esm({
  "node_modules/music-metadata/lib/dsf/DsfParser.js"() {
    import_debug11 = __toESM(require_src(), 1);
    init_AbstractID3Parser();
    init_DsfChunk();
    init_ID3v2Parser();
    init_ParseError();
    debug11 = (0, import_debug11.default)("music-metadata:parser:DSF");
    DsdContentParseError = class extends makeUnexpectedFileContentError("DSD") {
    };
    DsfParser = class extends AbstractID3Parser {
      async postId3v2Parse() {
        const p0 = this.tokenizer.position;
        const chunkHeader = await this.tokenizer.readToken(ChunkHeader);
        if (chunkHeader.id !== "DSD ")
          throw new DsdContentParseError("Invalid chunk signature");
        this.metadata.setFormat("container", "DSF");
        this.metadata.setFormat("lossless", true);
        this.metadata.setAudioOnly();
        const dsdChunk = await this.tokenizer.readToken(DsdChunk);
        if (dsdChunk.metadataPointer === BigInt(0)) {
          debug11("No ID3v2 tag present");
        } else {
          debug11(`expect ID3v2 at offset=${dsdChunk.metadataPointer}`);
          await this.parseChunks(dsdChunk.fileSize - chunkHeader.size);
          await this.tokenizer.ignore(Number(dsdChunk.metadataPointer) - this.tokenizer.position - p0);
          return new ID3v2Parser().parse(this.metadata, this.tokenizer, this.options);
        }
      }
      async parseChunks(bytesRemaining) {
        while (bytesRemaining >= ChunkHeader.len) {
          const chunkHeader = await this.tokenizer.readToken(ChunkHeader);
          debug11(`Parsing chunk name=${chunkHeader.id} size=${chunkHeader.size}`);
          switch (chunkHeader.id) {
            case "fmt ": {
              const formatChunk = await this.tokenizer.readToken(FormatChunk);
              this.metadata.setFormat("numberOfChannels", formatChunk.channelNum);
              this.metadata.setFormat("sampleRate", formatChunk.samplingFrequency);
              this.metadata.setFormat("bitsPerSample", formatChunk.bitsPerSample);
              this.metadata.setFormat("numberOfSamples", formatChunk.sampleCount);
              this.metadata.setFormat("duration", Number(formatChunk.sampleCount) / formatChunk.samplingFrequency);
              const bitrate = formatChunk.bitsPerSample * formatChunk.samplingFrequency * formatChunk.channelNum;
              this.metadata.setFormat("bitrate", bitrate);
              return;
            }
            default:
              this.tokenizer.ignore(Number(chunkHeader.size) - ChunkHeader.len);
              break;
          }
          bytesRemaining -= chunkHeader.size;
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/vorbis/Vorbis.js
var VorbisPictureToken, CommonHeader, IdentificationHeader;
var init_Vorbis = __esm({
  "node_modules/music-metadata/lib/ogg/vorbis/Vorbis.js"() {
    init_lib3();
    init_ID3v2Token();
    VorbisPictureToken = class _VorbisPictureToken {
      static fromBase64(base64str) {
        return _VorbisPictureToken.fromBuffer(Uint8Array.from(atob(base64str), (c) => c.charCodeAt(0)));
      }
      static fromBuffer(buffer) {
        const pic = new _VorbisPictureToken(buffer.length);
        return pic.get(buffer, 0);
      }
      constructor(len) {
        this.len = len;
      }
      get(buffer, offset) {
        const type = AttachedPictureType[UINT32_BE.get(buffer, offset)];
        offset += 4;
        const mimeLen = UINT32_BE.get(buffer, offset);
        offset += 4;
        const format = new StringType(mimeLen, "utf-8").get(buffer, offset);
        offset += mimeLen;
        const descLen = UINT32_BE.get(buffer, offset);
        offset += 4;
        const description = new StringType(descLen, "utf-8").get(buffer, offset);
        offset += descLen;
        const width = UINT32_BE.get(buffer, offset);
        offset += 4;
        const height = UINT32_BE.get(buffer, offset);
        offset += 4;
        const colour_depth = UINT32_BE.get(buffer, offset);
        offset += 4;
        const indexed_color = UINT32_BE.get(buffer, offset);
        offset += 4;
        const picDataLen = UINT32_BE.get(buffer, offset);
        offset += 4;
        const data = buffer.slice(offset, offset + picDataLen);
        return {
          type,
          format,
          description,
          width,
          height,
          colour_depth,
          indexed_color,
          data
        };
      }
    };
    CommonHeader = {
      len: 7,
      get: (buf, off) => {
        return {
          packetType: UINT8.get(buf, off),
          vorbis: new StringType(6, "ascii").get(buf, off + 1)
        };
      }
    };
    IdentificationHeader = {
      len: 23,
      get: (uint8Array, off) => {
        return {
          version: UINT32_LE.get(uint8Array, off + 0),
          channelMode: UINT8.get(uint8Array, off + 4),
          sampleRate: UINT32_LE.get(uint8Array, off + 5),
          bitrateMax: UINT32_LE.get(uint8Array, off + 9),
          bitrateNominal: UINT32_LE.get(uint8Array, off + 13),
          bitrateMin: UINT32_LE.get(uint8Array, off + 17)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/vorbis/VorbisDecoder.js
var VorbisDecoder;
var init_VorbisDecoder = __esm({
  "node_modules/music-metadata/lib/ogg/vorbis/VorbisDecoder.js"() {
    init_lib3();
    init_lib2();
    VorbisDecoder = class {
      constructor(data, offset) {
        this.data = data;
        this.offset = offset;
      }
      readInt32() {
        const value = UINT32_LE.get(this.data, this.offset);
        this.offset += 4;
        return value;
      }
      readStringUtf8() {
        const len = this.readInt32();
        const value = textDecode(this.data.subarray(this.offset, this.offset + len), "utf-8");
        this.offset += len;
        return value;
      }
      parseUserComment() {
        const offset0 = this.offset;
        const v = this.readStringUtf8();
        const idx = v.indexOf("=");
        return {
          key: v.substring(0, idx).toUpperCase(),
          value: v.substring(idx + 1),
          len: this.offset - offset0
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/vorbis/VorbisStream.js
var import_debug12, debug12, VorbisContentError, VorbisStream;
var init_VorbisStream = __esm({
  "node_modules/music-metadata/lib/ogg/vorbis/VorbisStream.js"() {
    init_lib3();
    import_debug12 = __toESM(require_src(), 1);
    init_VorbisDecoder();
    init_Vorbis();
    init_ParseError();
    debug12 = (0, import_debug12.default)("music-metadata:parser:ogg:vorbis1");
    VorbisContentError = class extends makeUnexpectedFileContentError("Vorbis") {
    };
    VorbisStream = class _VorbisStream {
      constructor(metadata, options) {
        this.pageSegments = [];
        this.durationOnLastPage = true;
        this.metadata = metadata;
        this.options = options;
      }
      /**
       * Vorbis 1 parser
       * @param header Ogg Page Header
       * @param pageData Page data
       */
      async parsePage(header, pageData) {
        this.lastPageHeader = header;
        if (header.headerType.firstPage) {
          this.parseFirstPage(header, pageData);
        } else {
          if (header.headerType.continued) {
            if (this.pageSegments.length === 0) {
              throw new VorbisContentError("Cannot continue on previous page");
            }
            this.pageSegments.push(pageData);
          }
          if (header.headerType.lastPage || !header.headerType.continued) {
            if (this.pageSegments.length > 0) {
              const fullPage = _VorbisStream.mergeUint8Arrays(this.pageSegments);
              await this.parseFullPage(fullPage);
            }
            this.pageSegments = header.headerType.lastPage ? [] : [pageData];
          }
        }
      }
      static mergeUint8Arrays(arrays) {
        const totalSize = arrays.reduce((acc, e) => acc + e.length, 0);
        const merged = new Uint8Array(totalSize);
        arrays.forEach((array, i, _arrays) => {
          const offset = _arrays.slice(0, i).reduce((acc, e) => acc + e.length, 0);
          merged.set(array, offset);
        });
        return merged;
      }
      async flush() {
        await this.parseFullPage(_VorbisStream.mergeUint8Arrays(this.pageSegments));
      }
      async parseUserComment(pageData, offset) {
        const decoder = new VorbisDecoder(pageData, offset);
        const tag = decoder.parseUserComment();
        await this.addTag(tag.key, tag.value);
        return tag.len;
      }
      async addTag(id, value) {
        if (id === "METADATA_BLOCK_PICTURE" && typeof value === "string") {
          if (this.options.skipCovers) {
            debug12("Ignore picture");
            return;
          }
          value = VorbisPictureToken.fromBase64(value);
          debug12(`Push picture: id=${id}, format=${value.format}`);
        } else {
          debug12(`Push tag: id=${id}, value=${value}`);
        }
        await this.metadata.addTag("vorbis", id, value);
      }
      calculateDuration(enfOfStream) {
        if (this.lastPageHeader && (enfOfStream || this.lastPageHeader.headerType.lastPage) && this.metadata.format.sampleRate && this.lastPageHeader.absoluteGranulePosition >= 0) {
          this.metadata.setFormat("numberOfSamples", this.lastPageHeader.absoluteGranulePosition);
          this.metadata.setFormat("duration", this.lastPageHeader.absoluteGranulePosition / this.metadata.format.sampleRate);
        }
      }
      /**
       * Parse first Ogg/Vorbis page
       * @param _header
       * @param pageData
       */
      parseFirstPage(_header, pageData) {
        this.metadata.setFormat("codec", "Vorbis I");
        this.metadata.setFormat("hasAudio", true);
        debug12("Parse first page");
        const commonHeader = CommonHeader.get(pageData, 0);
        if (commonHeader.vorbis !== "vorbis")
          throw new VorbisContentError("Metadata does not look like Vorbis");
        if (commonHeader.packetType === 1) {
          const idHeader = IdentificationHeader.get(pageData, CommonHeader.len);
          this.metadata.setFormat("sampleRate", idHeader.sampleRate);
          this.metadata.setFormat("bitrate", idHeader.bitrateNominal);
          this.metadata.setFormat("numberOfChannels", idHeader.channelMode);
          debug12("sample-rate=%s[hz], bitrate=%s[b/s], channel-mode=%s", idHeader.sampleRate, idHeader.bitrateNominal, idHeader.channelMode);
        } else
          throw new VorbisContentError("First Ogg page should be type 1: the identification header");
      }
      async parseFullPage(pageData) {
        const commonHeader = CommonHeader.get(pageData, 0);
        debug12("Parse full page: type=%s, byteLength=%s", commonHeader.packetType, pageData.byteLength);
        switch (commonHeader.packetType) {
          case 3:
            return this.parseUserCommentList(pageData, CommonHeader.len);
          case 1:
          // type 1: the identification header
          case 5:
            break;
        }
      }
      /**
       * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-840005.2
       */
      async parseUserCommentList(pageData, offset) {
        const strLen = UINT32_LE.get(pageData, offset);
        offset += 4;
        offset += strLen;
        let userCommentListLength = UINT32_LE.get(pageData, offset);
        offset += 4;
        while (userCommentListLength-- > 0) {
          offset += await this.parseUserComment(pageData, offset);
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/flac/FlacToken.js
var BlockType, BlockHeader, BlockStreamInfo;
var init_FlacToken = __esm({
  "node_modules/music-metadata/lib/flac/FlacToken.js"() {
    init_Util();
    init_lib3();
    BlockType = {
      STREAMINFO: 0,
      // STREAMINFO
      PADDING: 1,
      // PADDING
      APPLICATION: 2,
      // APPLICATION
      SEEKTABLE: 3,
      // SEEKTABLE
      VORBIS_COMMENT: 4,
      // VORBIS_COMMENT
      CUESHEET: 5,
      // CUESHEET
      PICTURE: 6
      // PICTURE
    };
    BlockHeader = {
      len: 4,
      get: (buf, off) => {
        return {
          lastBlock: getBit(buf, off, 7),
          type: getBitAllignedNumber(buf, off, 1, 7),
          length: UINT24_BE.get(buf, off + 1)
        };
      }
    };
    BlockStreamInfo = {
      len: 34,
      get: (buf, off) => {
        return {
          // The minimum block size (in samples) used in the stream.
          minimumBlockSize: UINT16_BE.get(buf, off),
          // The maximum block size (in samples) used in the stream.
          // (Minimum blocksize == maximum blocksize) implies a fixed-blocksize stream.
          maximumBlockSize: UINT16_BE.get(buf, off + 2) / 1e3,
          // The minimum frame size (in bytes) used in the stream.
          // May be 0 to imply the value is not known.
          minimumFrameSize: UINT24_BE.get(buf, off + 4),
          // The maximum frame size (in bytes) used in the stream.
          // May be 0 to imply the value is not known.
          maximumFrameSize: UINT24_BE.get(buf, off + 7),
          // Sample rate in Hz. Though 20 bits are available,
          // the maximum sample rate is limited by the structure of frame headers to 655350Hz.
          // Also, a value of 0 is invalid.
          sampleRate: UINT24_BE.get(buf, off + 10) >> 4,
          // probably slower: sampleRate: common.getBitAllignedNumber(buf, off + 10, 0, 20),
          // (number of channels)-1. FLAC supports from 1 to 8 channels
          channels: getBitAllignedNumber(buf, off + 12, 4, 3) + 1,
          // bits per sample)-1.
          // FLAC supports from 4 to 32 bits per sample. Currently the reference encoder and decoders only support up to 24 bits per sample.
          bitsPerSample: getBitAllignedNumber(buf, off + 12, 7, 5) + 1,
          // Total samples in stream.
          // 'Samples' means inter-channel sample, i.e. one second of 44.1Khz audio will have 44100 samples regardless of the number of channels.
          // A value of zero here means the number of total samples is unknown.
          totalSamples: getBitAllignedNumber(buf, off + 13, 4, 36),
          // the MD5 hash of the file (see notes for usage... it's a littly tricky)
          fileMD5: new Uint8ArrayType(16).get(buf, off + 18)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/flac/FlacParser.js
var FlacParser_exports = {};
__export(FlacParser_exports, {
  FlacParser: () => FlacParser
});
var import_debug13, debug13, FlacContentError, FlacParser;
var init_FlacParser = __esm({
  "node_modules/music-metadata/lib/flac/FlacParser.js"() {
    import_debug13 = __toESM(require_src(), 1);
    init_lib3();
    init_Vorbis();
    init_AbstractID3Parser();
    init_FourCC();
    init_VorbisStream();
    init_VorbisDecoder();
    init_ParseError();
    init_FlacToken();
    debug13 = (0, import_debug13.default)("music-metadata:parser:FLAC");
    FlacContentError = class extends makeUnexpectedFileContentError("FLAC") {
    };
    FlacParser = class extends AbstractID3Parser {
      constructor() {
        super(...arguments);
        this.vorbisParser = new VorbisStream(this.metadata, this.options);
      }
      async postId3v2Parse() {
        const fourCC = await this.tokenizer.readToken(FourCcToken);
        if (fourCC.toString() !== "fLaC") {
          throw new FlacContentError("Invalid FLAC preamble");
        }
        let blockHeader;
        do {
          blockHeader = await this.tokenizer.readToken(BlockHeader);
          await this.parseDataBlock(blockHeader);
        } while (!blockHeader.lastBlock);
        if (this.tokenizer.fileInfo.size && this.metadata.format.duration) {
          const dataSize = this.tokenizer.fileInfo.size - this.tokenizer.position;
          this.metadata.setFormat("bitrate", 8 * dataSize / this.metadata.format.duration);
        }
      }
      async parseDataBlock(blockHeader) {
        debug13(`blockHeader type=${blockHeader.type}, length=${blockHeader.length}`);
        switch (blockHeader.type) {
          case BlockType.STREAMINFO:
            return this.readBlockStreamInfo(blockHeader.length);
          case BlockType.PADDING:
            break;
          case BlockType.APPLICATION:
            break;
          case BlockType.SEEKTABLE:
            break;
          case BlockType.VORBIS_COMMENT:
            return this.readComment(blockHeader.length);
          case BlockType.CUESHEET:
            break;
          case BlockType.PICTURE:
            await this.parsePicture(blockHeader.length);
            return;
          default:
            this.metadata.addWarning(`Unknown block type: ${blockHeader.type}`);
        }
        return this.tokenizer.ignore(blockHeader.length).then();
      }
      /**
       * Parse STREAMINFO
       */
      async readBlockStreamInfo(dataLen) {
        if (dataLen !== BlockStreamInfo.len)
          throw new FlacContentError("Unexpected block-stream-info length");
        const streamInfo = await this.tokenizer.readToken(BlockStreamInfo);
        this.metadata.setFormat("container", "FLAC");
        this.processsStreamInfo(streamInfo);
      }
      /**
       * Parse STREAMINFO
       */
      processsStreamInfo(streamInfo) {
        this.metadata.setFormat("codec", "FLAC");
        this.metadata.setFormat("hasAudio", true);
        this.metadata.setFormat("lossless", true);
        this.metadata.setFormat("numberOfChannels", streamInfo.channels);
        this.metadata.setFormat("bitsPerSample", streamInfo.bitsPerSample);
        this.metadata.setFormat("sampleRate", streamInfo.sampleRate);
        if (streamInfo.totalSamples > 0) {
          this.metadata.setFormat("duration", streamInfo.totalSamples / streamInfo.sampleRate);
        }
      }
      /**
       * Read VORBIS_COMMENT from tokenizer
       * Ref: https://www.xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-640004.2.3
       */
      async readComment(dataLen) {
        const data = await this.tokenizer.readToken(new Uint8ArrayType(dataLen));
        return this.parseComment(data);
      }
      /**
       * Parse VORBIS_COMMENT
       * Ref: https://www.xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-640004.2.3
       */
      async parseComment(data) {
        const decoder = new VorbisDecoder(data, 0);
        const vendor = decoder.readStringUtf8();
        if (vendor.length > 0) {
          this.metadata.setFormat("tool", vendor);
        }
        const commentListLength = decoder.readInt32();
        const tags = new Array(commentListLength);
        for (let i = 0; i < commentListLength; i++) {
          tags[i] = decoder.parseUserComment();
        }
        await Promise.all(tags.map((tag) => {
          if (tag.key === "ENCODER") {
            this.metadata.setFormat("tool", tag.value);
          }
          return this.addTag(tag.key, tag.value);
        }));
      }
      async parsePicture(dataLen) {
        if (this.options.skipCovers) {
          return this.tokenizer.ignore(dataLen);
        }
        return this.addPictureTag(await this.tokenizer.readToken(new VorbisPictureToken(dataLen)));
      }
      addPictureTag(picture) {
        return this.addTag("METADATA_BLOCK_PICTURE", picture);
      }
      addTag(id, value) {
        return this.vorbisParser.addTag(id, value);
      }
    };
  }
});

// node_modules/music-metadata/lib/ebml/types.js
var DataType2;
var init_types2 = __esm({
  "node_modules/music-metadata/lib/ebml/types.js"() {
    DataType2 = {
      string: 0,
      uint: 1,
      uid: 2,
      bool: 3,
      binary: 4,
      float: 5
    };
  }
});

// node_modules/music-metadata/lib/matroska/MatroskaDtd.js
var matroskaDtd;
var init_MatroskaDtd = __esm({
  "node_modules/music-metadata/lib/matroska/MatroskaDtd.js"() {
    init_types2();
    matroskaDtd = {
      name: "dtd",
      container: {
        440786851: {
          name: "ebml",
          container: {
            17030: { name: "ebmlVersion", value: DataType2.uint },
            // 5.1.1
            17143: { name: "ebmlReadVersion", value: DataType2.uint },
            // 5.1.2
            17138: { name: "ebmlMaxIDWidth", value: DataType2.uint },
            // 5.1.3
            17139: { name: "ebmlMaxSizeWidth", value: DataType2.uint },
            // 5.1.4
            17026: { name: "docType", value: DataType2.string },
            // 5.1.5
            17031: { name: "docTypeVersion", value: DataType2.uint },
            // 5.1.6
            17029: { name: "docTypeReadVersion", value: DataType2.uint }
            // 5.1.7
          }
        },
        // Matroska segments
        408125543: {
          name: "segment",
          container: {
            // Meta Seek Information (also known as MetaSeek)
            290298740: {
              name: "seekHead",
              container: {
                19899: {
                  name: "seek",
                  multiple: true,
                  container: {
                    21419: { name: "id", value: DataType2.binary },
                    21420: { name: "position", value: DataType2.uint }
                  }
                }
              }
            },
            // Segment Information
            357149030: {
              name: "info",
              container: {
                29604: { name: "uid", value: DataType2.uid },
                29572: { name: "filename", value: DataType2.string },
                3979555: { name: "prevUID", value: DataType2.uid },
                3965867: { name: "prevFilename", value: DataType2.string },
                4110627: { name: "nextUID", value: DataType2.uid },
                4096955: { name: "nextFilename", value: DataType2.string },
                2807729: { name: "timecodeScale", value: DataType2.uint },
                17545: { name: "duration", value: DataType2.float },
                17505: { name: "dateUTC", value: DataType2.uint },
                31657: { name: "title", value: DataType2.string },
                19840: { name: "muxingApp", value: DataType2.string },
                22337: { name: "writingApp", value: DataType2.string }
              }
            },
            // Cluster
            524531317: {
              name: "cluster",
              multiple: true,
              container: {
                231: { name: "timecode", value: DataType2.uid },
                22743: { name: "silentTracks ", multiple: true },
                167: { name: "position", value: DataType2.uid },
                171: { name: "prevSize", value: DataType2.uid },
                160: { name: "blockGroup" },
                163: { name: "simpleBlock" }
              }
            },
            // Track
            374648427: {
              name: "tracks",
              container: {
                174: {
                  name: "entries",
                  multiple: true,
                  container: {
                    215: { name: "trackNumber", value: DataType2.uint },
                    29637: { name: "uid", value: DataType2.uid },
                    131: { name: "trackType", value: DataType2.uint },
                    185: { name: "flagEnabled", value: DataType2.bool },
                    136: { name: "flagDefault", value: DataType2.bool },
                    21930: { name: "flagForced", value: DataType2.bool },
                    // extended
                    156: { name: "flagLacing", value: DataType2.bool },
                    28135: { name: "minCache", value: DataType2.uint },
                    28136: { name: "maxCache", value: DataType2.uint },
                    2352003: { name: "defaultDuration", value: DataType2.uint },
                    2306383: { name: "timecodeScale", value: DataType2.float },
                    21358: { name: "name", value: DataType2.string },
                    2274716: { name: "language", value: DataType2.string },
                    134: { name: "codecID", value: DataType2.string },
                    25506: { name: "codecPrivate", value: DataType2.binary },
                    2459272: { name: "codecName", value: DataType2.string },
                    3839639: { name: "codecSettings", value: DataType2.string },
                    3883072: { name: "codecInfoUrl", value: DataType2.string },
                    2536e3: { name: "codecDownloadUrl", value: DataType2.string },
                    170: { name: "codecDecodeAll", value: DataType2.bool },
                    28587: { name: "trackOverlay", value: DataType2.uint },
                    // Video
                    224: {
                      name: "video",
                      container: {
                        154: { name: "flagInterlaced", value: DataType2.bool },
                        21432: { name: "stereoMode", value: DataType2.uint },
                        176: { name: "pixelWidth", value: DataType2.uint },
                        186: { name: "pixelHeight", value: DataType2.uint },
                        21680: { name: "displayWidth", value: DataType2.uint },
                        21690: { name: "displayHeight", value: DataType2.uint },
                        21683: { name: "aspectRatioType", value: DataType2.uint },
                        3061028: { name: "colourSpace", value: DataType2.uint },
                        3126563: { name: "gammaValue", value: DataType2.float }
                      }
                    },
                    // Audio
                    225: {
                      name: "audio",
                      container: {
                        181: { name: "samplingFrequency", value: DataType2.float },
                        30901: { name: "outputSamplingFrequency", value: DataType2.float },
                        159: { name: "channels", value: DataType2.uint },
                        // https://www.matroska.org/technical/specs/index.html
                        148: { name: "channels", value: DataType2.uint },
                        32123: { name: "channelPositions", value: DataType2.binary },
                        25188: { name: "bitDepth", value: DataType2.uint }
                      }
                    },
                    // Content Encoding
                    28032: {
                      name: "contentEncodings",
                      container: {
                        25152: {
                          name: "contentEncoding",
                          container: {
                            20529: { name: "order", value: DataType2.uint },
                            20530: { name: "scope", value: DataType2.bool },
                            20531: { name: "type", value: DataType2.uint },
                            20532: {
                              name: "contentEncoding",
                              container: {
                                16980: { name: "contentCompAlgo", value: DataType2.uint },
                                16981: { name: "contentCompSettings", value: DataType2.binary }
                              }
                            },
                            20533: {
                              name: "contentEncoding",
                              container: {
                                18401: { name: "contentEncAlgo", value: DataType2.uint },
                                18402: { name: "contentEncKeyID", value: DataType2.binary },
                                18403: { name: "contentSignature ", value: DataType2.binary },
                                18404: { name: "ContentSigKeyID  ", value: DataType2.binary },
                                18405: { name: "contentSigAlgo ", value: DataType2.uint },
                                18406: { name: "contentSigHashAlgo ", value: DataType2.uint }
                              }
                            },
                            25188: { name: "bitDepth", value: DataType2.uint }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            // Cueing Data
            475249515: {
              name: "cues",
              container: {
                187: {
                  name: "cuePoint",
                  container: {
                    179: { name: "cueTime", value: DataType2.uid },
                    183: {
                      name: "positions",
                      container: {
                        247: { name: "track", value: DataType2.uint },
                        241: { name: "clusterPosition", value: DataType2.uint },
                        21368: { name: "blockNumber", value: DataType2.uint },
                        234: { name: "codecState", value: DataType2.uint },
                        219: {
                          name: "reference",
                          container: {
                            150: { name: "time", value: DataType2.uint },
                            151: { name: "cluster", value: DataType2.uint },
                            21343: { name: "number", value: DataType2.uint },
                            235: { name: "codecState", value: DataType2.uint }
                          }
                        },
                        240: { name: "relativePosition", value: DataType2.uint }
                        // extended
                      }
                    }
                  }
                }
              }
            },
            // Attachment
            423732329: {
              name: "attachments",
              container: {
                24999: {
                  name: "attachedFiles",
                  multiple: true,
                  container: {
                    18046: { name: "description", value: DataType2.string },
                    18030: { name: "name", value: DataType2.string },
                    18016: { name: "mimeType", value: DataType2.string },
                    18012: { name: "data", value: DataType2.binary },
                    18094: { name: "uid", value: DataType2.uid }
                  }
                }
              }
            },
            // Chapters
            272869232: {
              name: "chapters",
              container: {
                17849: {
                  name: "editionEntry",
                  container: {
                    182: {
                      name: "chapterAtom",
                      container: {
                        29636: { name: "uid", value: DataType2.uid },
                        145: { name: "timeStart", value: DataType2.uint },
                        146: { name: "timeEnd", value: DataType2.uid },
                        152: { name: "hidden", value: DataType2.bool },
                        17816: { name: "enabled", value: DataType2.uid },
                        143: {
                          name: "track",
                          container: {
                            137: { name: "trackNumber", value: DataType2.uid },
                            128: {
                              name: "display",
                              container: {
                                133: { name: "string", value: DataType2.string },
                                17276: { name: "language ", value: DataType2.string },
                                17278: { name: "country ", value: DataType2.string }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            // Tagging
            307544935: {
              name: "tags",
              container: {
                29555: {
                  name: "tag",
                  multiple: true,
                  container: {
                    25536: {
                      name: "target",
                      container: {
                        25541: { name: "tagTrackUID", value: DataType2.uid },
                        25540: { name: "tagChapterUID", value: DataType2.uint },
                        25542: { name: "tagAttachmentUID", value: DataType2.uid },
                        25546: { name: "targetType", value: DataType2.string },
                        // extended
                        26826: { name: "targetTypeValue", value: DataType2.uint },
                        // extended
                        25545: { name: "tagEditionUID", value: DataType2.uid }
                        // extended
                      }
                    },
                    26568: {
                      name: "simpleTags",
                      multiple: true,
                      container: {
                        17827: { name: "name", value: DataType2.string },
                        17543: { name: "string", value: DataType2.string },
                        17541: { name: "binary", value: DataType2.binary },
                        17530: { name: "language", value: DataType2.string },
                        // extended
                        17531: { name: "languageIETF", value: DataType2.string },
                        // extended
                        17540: { name: "default", value: DataType2.bool }
                        // extended
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/ebml/EbmlIterator.js
function readUIntBE(buf, len) {
  return Number(readUIntBeAsBigInt(buf, len));
}
function readUIntBeAsBigInt(buf, len) {
  const normalizedNumber = new Uint8Array(8);
  const cleanNumber = buf.subarray(0, len);
  try {
    normalizedNumber.set(cleanNumber, 8 - len);
    return UINT64_BE.get(normalizedNumber, 0);
  } catch (_error) {
    return BigInt(-1);
  }
}
function linkParents(element) {
  if (element.container) {
    Object.keys(element.container).map((id) => {
      const child = element.container[id];
      child.id = Number.parseInt(id, 10);
      return child;
    }).forEach((child) => {
      child.parent = element;
      linkParents(child);
    });
  }
  return element;
}
function getElementPath(element) {
  let path4 = "";
  if (element.parent && element.parent.name !== "dtd") {
    path4 += `${getElementPath(element.parent)}/`;
  }
  return path4 + element.name;
}
var import_debug14, debug14, EbmlContentError, ParseAction, EbmlIterator;
var init_EbmlIterator = __esm({
  "node_modules/music-metadata/lib/ebml/EbmlIterator.js"() {
    init_lib3();
    import_debug14 = __toESM(require_src(), 1);
    init_lib();
    init_types2();
    init_lib3();
    init_ParseError();
    debug14 = (0, import_debug14.default)("music-metadata:parser:ebml");
    EbmlContentError = class extends makeUnexpectedFileContentError("EBML") {
    };
    ParseAction = {
      ReadNext: 0,
      // Continue reading the next elements
      IgnoreElement: 2,
      // Ignore (do not read) this element
      SkipSiblings: 3,
      // Skip all remaining elements at the same level
      TerminateParsing: 4,
      // Terminate the parsing process
      SkipElement: 5
      // Consider the element has read, assume position is at the next element
    };
    EbmlIterator = class {
      /**
       * @param {ITokenizer} tokenizer Input
       * @param tokenizer
       */
      constructor(tokenizer) {
        this.parserMap = /* @__PURE__ */ new Map();
        this.ebmlMaxIDLength = 4;
        this.ebmlMaxSizeLength = 8;
        this.tokenizer = tokenizer;
        this.parserMap.set(DataType2.uint, (e) => this.readUint(e));
        this.parserMap.set(DataType2.string, (e) => this.readString(e));
        this.parserMap.set(DataType2.binary, (e) => this.readBuffer(e));
        this.parserMap.set(DataType2.uid, async (e) => this.readBuffer(e));
        this.parserMap.set(DataType2.bool, (e) => this.readFlag(e));
        this.parserMap.set(DataType2.float, (e) => this.readFloat(e));
      }
      async iterate(dtdElement, posDone, listener) {
        return this.parseContainer(linkParents(dtdElement), posDone, listener);
      }
      async parseContainer(dtdElement, posDone, listener) {
        const tree = {};
        while (this.tokenizer.position < posDone) {
          let element;
          const elementPosition = this.tokenizer.position;
          try {
            element = await this.readElement();
          } catch (error) {
            if (error instanceof EndOfStreamError) {
              break;
            }
            throw error;
          }
          const child = dtdElement.container[element.id];
          if (child) {
            const action = listener.startNext(child);
            switch (action) {
              case ParseAction.ReadNext:
                {
                  if (element.id === 524531317) {
                  }
                  debug14(`Read element: name=${getElementPath(child)}{id=0x${element.id.toString(16)}, container=${!!child.container}} at position=${elementPosition}`);
                  if (child.container) {
                    const res = await this.parseContainer(child, element.len >= 0 ? this.tokenizer.position + element.len : -1, listener);
                    if (child.multiple) {
                      if (!tree[child.name]) {
                        tree[child.name] = [];
                      }
                      tree[child.name].push(res);
                    } else {
                      tree[child.name] = res;
                    }
                    await listener.elementValue(child, res, elementPosition);
                  } else {
                    const parser = this.parserMap.get(child.value);
                    if (typeof parser === "function") {
                      const value = await parser(element);
                      tree[child.name] = value;
                      await listener.elementValue(child, value, elementPosition);
                    }
                  }
                }
                break;
              case ParseAction.SkipElement:
                debug14(`Go to next element: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
                break;
              case ParseAction.IgnoreElement:
                debug14(`Ignore element: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
                await this.tokenizer.ignore(element.len);
                break;
              case ParseAction.SkipSiblings:
                debug14(`Ignore remaining container, at: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
                await this.tokenizer.ignore(posDone - this.tokenizer.position);
                break;
              case ParseAction.TerminateParsing:
                debug14(`Terminate parsing at element: name=${getElementPath(child)}, element.id=0x${element.id}, container=${!!child.container} at position=${elementPosition}`);
                return tree;
            }
          } else {
            switch (element.id) {
              case 236:
                await this.tokenizer.ignore(element.len);
                break;
              default:
                debug14(`parseEbml: parent=${getElementPath(dtdElement)}, unknown child: id=${element.id.toString(16)} at position=${elementPosition}`);
                await this.tokenizer.ignore(element.len);
            }
          }
        }
        return tree;
      }
      async readVintData(maxLength) {
        const msb = await this.tokenizer.peekNumber(UINT8);
        let mask = 128;
        let oc = 1;
        while ((msb & mask) === 0) {
          if (oc > maxLength) {
            throw new EbmlContentError("VINT value exceeding maximum size");
          }
          ++oc;
          mask >>= 1;
        }
        const id = new Uint8Array(oc);
        await this.tokenizer.readBuffer(id);
        return id;
      }
      async readElement() {
        const id = await this.readVintData(this.ebmlMaxIDLength);
        const lenField = await this.readVintData(this.ebmlMaxSizeLength);
        lenField[0] ^= 128 >> lenField.length - 1;
        return {
          id: readUIntBE(id, id.length),
          len: readUIntBE(lenField, lenField.length)
        };
      }
      async readFloat(e) {
        switch (e.len) {
          case 0:
            return 0;
          case 4:
            return this.tokenizer.readNumber(Float32_BE);
          case 8:
            return this.tokenizer.readNumber(Float64_BE);
          case 10:
            return this.tokenizer.readNumber(Float64_BE);
          default:
            throw new EbmlContentError(`Invalid IEEE-754 float length: ${e.len}`);
        }
      }
      async readFlag(e) {
        return await this.readUint(e) === 1;
      }
      async readUint(e) {
        const buf = await this.readBuffer(e);
        return readUIntBE(buf, e.len);
      }
      async readString(e) {
        const rawString = await this.tokenizer.readToken(new StringType(e.len, "utf-8"));
        return rawString.replace(/\x00.*$/g, "");
      }
      async readBuffer(e) {
        const buf = new Uint8Array(e.len);
        await this.tokenizer.readBuffer(buf);
        return buf;
      }
    };
  }
});

// node_modules/music-metadata/lib/matroska/MatroskaParser.js
var MatroskaParser_exports = {};
__export(MatroskaParser_exports, {
  MatroskaParser: () => MatroskaParser
});
var import_debug15, debug15, MatroskaParser;
var init_MatroskaParser = __esm({
  "node_modules/music-metadata/lib/matroska/MatroskaParser.js"() {
    import_debug15 = __toESM(require_src(), 1);
    init_BasicParser();
    init_MatroskaDtd();
    init_types();
    init_EbmlIterator();
    debug15 = (0, import_debug15.default)("music-metadata:parser:matroska");
    MatroskaParser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.seekHeadOffset = 0;
        this.flagUseIndexToSkipClusters = this.options.mkvUseIndex ?? false;
      }
      async parse() {
        const containerSize = this.tokenizer.fileInfo.size ?? Number.MAX_SAFE_INTEGER;
        const matroskaIterator = new EbmlIterator(this.tokenizer);
        debug15("Initializing DTD end MatroskaIterator");
        await matroskaIterator.iterate(matroskaDtd, containerSize, {
          startNext: (element) => {
            switch (element.id) {
              // case 0x1f43b675: // cluster
              case 475249515:
                debug15(`Skip element: name=${element.name}, id=0x${element.id.toString(16)}`);
                return ParseAction.IgnoreElement;
              case 524531317:
                if (this.flagUseIndexToSkipClusters && this.seekHead) {
                  const index = this.seekHead.seek.find((index2) => index2.position + this.seekHeadOffset > this.tokenizer.position);
                  if (index) {
                    const ignoreSize = index.position + this.seekHeadOffset - this.tokenizer.position;
                    debug15(`Use index to go to next position, ignoring ${ignoreSize} bytes`);
                    this.tokenizer.ignore(ignoreSize);
                    return ParseAction.SkipElement;
                  }
                }
                return ParseAction.IgnoreElement;
              default:
                return ParseAction.ReadNext;
            }
          },
          elementValue: async (element, value, offset) => {
            debug15(`Received: name=${element.name}, value=${value}`);
            switch (element.id) {
              case 17026:
                this.metadata.setFormat("container", `EBML/${value}`);
                break;
              case 290298740:
                this.seekHead = value;
                this.seekHeadOffset = offset;
                break;
              case 357149030:
                {
                  const info = value;
                  const timecodeScale = info.timecodeScale ? info.timecodeScale : 1e6;
                  if (typeof info.duration === "number") {
                    const duration = info.duration * timecodeScale / 1e9;
                    await this.addTag("segment:title", info.title);
                    this.metadata.setFormat("duration", Number(duration));
                  }
                }
                break;
              case 374648427:
                {
                  const audioTracks = value;
                  if (audioTracks?.entries) {
                    audioTracks.entries.forEach((entry) => {
                      const stream = {
                        codecName: entry.codecID.replace("A_", "").replace("V_", ""),
                        codecSettings: entry.codecSettings,
                        flagDefault: entry.flagDefault,
                        flagLacing: entry.flagLacing,
                        flagEnabled: entry.flagEnabled,
                        language: entry.language,
                        name: entry.name,
                        type: entry.trackType,
                        audio: entry.audio,
                        video: entry.video
                      };
                      this.metadata.addStreamInfo(stream);
                    });
                    const audioTrack = audioTracks.entries.filter((entry) => entry.trackType === TrackType.audio).reduce((acc, cur) => {
                      if (!acc)
                        return cur;
                      if (cur.flagDefault && !acc.flagDefault)
                        return cur;
                      if (cur.trackNumber < acc.trackNumber)
                        return cur;
                      return acc;
                    }, null);
                    if (audioTrack) {
                      this.metadata.setFormat("codec", audioTrack.codecID.replace("A_", ""));
                      this.metadata.setFormat("sampleRate", audioTrack.audio.samplingFrequency);
                      this.metadata.setFormat("numberOfChannels", audioTrack.audio.channels);
                    }
                  }
                }
                break;
              case 307544935:
                {
                  const tags = value;
                  await Promise.all(tags.tag.map(async (tag) => {
                    const target = tag.target;
                    const targetType = target?.targetTypeValue ? TargetType[target.targetTypeValue] : target?.targetType ? target.targetType : "track";
                    await Promise.all(tag.simpleTags.map(async (simpleTag) => {
                      const value2 = simpleTag.string ? simpleTag.string : simpleTag.binary;
                      await this.addTag(`${targetType}:${simpleTag.name}`, value2);
                    }));
                  }));
                }
                break;
              case 423732329:
                {
                  const attachments = value;
                  await Promise.all(attachments.attachedFiles.filter((file) => file.mimeType.startsWith("image/")).map((file) => this.addTag("picture", {
                    data: file.data,
                    format: file.mimeType,
                    description: file.description,
                    name: file.name
                  })));
                }
                break;
            }
          }
        });
      }
      async addTag(tagId, value) {
        await this.metadata.addTag("matroska", tagId, value);
      }
    };
  }
});

// node_modules/music-metadata/lib/mp4/AtomToken.js
function readTokenTable(buf, token, off, remainingLen, numberOfEntries) {
  debug16(`remainingLen=${remainingLen}, numberOfEntries=${numberOfEntries} * token-len=${token.len}`);
  if (remainingLen === 0)
    return [];
  if (remainingLen !== numberOfEntries * token.len)
    throw new Mp4ContentError("mismatch number-of-entries with remaining atom-length");
  const entries = [];
  for (let n = 0; n < numberOfEntries; ++n) {
    entries.push(token.get(buf, off));
    off += token.len;
  }
  return entries;
}
var import_debug16, debug16, Mp4ContentError, Header3, ExtendedSize, ftyp, FixedLengthAtom, SecondsSinceMacEpoch, MdhdAtom, MvhdAtom, DataAtom, NameAtom, TrackHeaderAtom, stsdHeader, SampleDescriptionTable, StsdAtom, SoundSampleDescriptionVersion, SoundSampleDescriptionV0, SimpleTableAtom, TimeToSampleToken, SttsAtom, SampleToChunkToken, StscAtom, StszAtom, StcoAtom, ChapterText, TrackFragmentHeaderBox, TrackRunBox, HandlerBox, ChapterTrackReferenceBox;
var init_AtomToken = __esm({
  "node_modules/music-metadata/lib/mp4/AtomToken.js"() {
    init_lib3();
    import_debug16 = __toESM(require_src(), 1);
    init_FourCC();
    init_ParseError();
    init_Util();
    debug16 = (0, import_debug16.default)("music-metadata:parser:MP4:atom");
    Mp4ContentError = class extends makeUnexpectedFileContentError("MP4") {
    };
    Header3 = {
      len: 8,
      get: (buf, off) => {
        const length = UINT32_BE.get(buf, off);
        if (length < 0)
          throw new Mp4ContentError("Invalid atom header length");
        return {
          length: BigInt(length),
          name: new StringType(4, "latin1").get(buf, off + 4)
        };
      },
      put: (buf, off, hdr) => {
        UINT32_BE.put(buf, off, Number(hdr.length));
        return FourCcToken.put(buf, off + 4, hdr.name);
      }
    };
    ExtendedSize = UINT64_BE;
    ftyp = {
      len: 4,
      get: (buf, off) => {
        return {
          type: new StringType(4, "ascii").get(buf, off)
        };
      }
    };
    FixedLengthAtom = class {
      /**
       *
       * @param {number} len Length as specified in the size field
       * @param {number} expLen Total length of sum of specified fields in the standard
       * @param atomId Atom ID
       */
      constructor(len, expLen, atomId) {
        if (len < expLen) {
          throw new Mp4ContentError(`Atom ${atomId} expected to be ${expLen}, but specifies ${len} bytes long.`);
        }
        if (len > expLen) {
          debug16(`Warning: atom ${atomId} expected to be ${expLen}, but was actually ${len} bytes long.`);
        }
        this.len = len;
      }
    };
    SecondsSinceMacEpoch = {
      len: 4,
      get: (buf, off) => {
        const secondsSinceUnixEpoch = UINT32_BE.get(buf, off) - 2082844800;
        return new Date(secondsSinceUnixEpoch * 1e3);
      }
    };
    MdhdAtom = class extends FixedLengthAtom {
      constructor(len) {
        super(len, 24, "mdhd");
      }
      get(buf, off) {
        return {
          version: UINT8.get(buf, off + 0),
          flags: UINT24_BE.get(buf, off + 1),
          creationTime: SecondsSinceMacEpoch.get(buf, off + 4),
          modificationTime: SecondsSinceMacEpoch.get(buf, off + 8),
          timeScale: UINT32_BE.get(buf, off + 12),
          duration: UINT32_BE.get(buf, off + 16),
          language: UINT16_BE.get(buf, off + 20),
          quality: UINT16_BE.get(buf, off + 22)
        };
      }
    };
    MvhdAtom = class extends FixedLengthAtom {
      constructor(len) {
        super(len, 100, "mvhd");
      }
      get(buf, off) {
        return {
          version: UINT8.get(buf, off),
          flags: UINT24_BE.get(buf, off + 1),
          creationTime: SecondsSinceMacEpoch.get(buf, off + 4),
          modificationTime: SecondsSinceMacEpoch.get(buf, off + 8),
          timeScale: UINT32_BE.get(buf, off + 12),
          duration: UINT32_BE.get(buf, off + 16),
          preferredRate: UINT32_BE.get(buf, off + 20),
          preferredVolume: UINT16_BE.get(buf, off + 24),
          // ignore reserver: 10 bytes
          // ignore matrix structure: 36 bytes
          previewTime: UINT32_BE.get(buf, off + 72),
          previewDuration: UINT32_BE.get(buf, off + 76),
          posterTime: UINT32_BE.get(buf, off + 80),
          selectionTime: UINT32_BE.get(buf, off + 84),
          selectionDuration: UINT32_BE.get(buf, off + 88),
          currentTime: UINT32_BE.get(buf, off + 92),
          nextTrackID: UINT32_BE.get(buf, off + 96)
        };
      }
    };
    DataAtom = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        return {
          type: {
            set: UINT8.get(buf, off + 0),
            type: UINT24_BE.get(buf, off + 1)
          },
          locale: UINT24_BE.get(buf, off + 4),
          value: new Uint8ArrayType(this.len - 8).get(buf, off + 8)
        };
      }
    };
    NameAtom = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        return {
          version: UINT8.get(buf, off),
          flags: UINT24_BE.get(buf, off + 1),
          name: new StringType(this.len - 4, "utf-8").get(buf, off + 4)
        };
      }
    };
    TrackHeaderAtom = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        return {
          version: UINT8.get(buf, off),
          flags: UINT24_BE.get(buf, off + 1),
          creationTime: SecondsSinceMacEpoch.get(buf, off + 4),
          modificationTime: SecondsSinceMacEpoch.get(buf, off + 8),
          trackId: UINT32_BE.get(buf, off + 12),
          // reserved 4 bytes
          duration: UINT32_BE.get(buf, off + 20),
          layer: UINT16_BE.get(buf, off + 24),
          alternateGroup: UINT16_BE.get(buf, off + 26),
          volume: UINT16_BE.get(buf, off + 28)
          // ToDo: fixed point
          // ToDo: add remaining fields
        };
      }
    };
    stsdHeader = {
      len: 8,
      get: (buf, off) => {
        return {
          version: UINT8.get(buf, off),
          flags: UINT24_BE.get(buf, off + 1),
          numberOfEntries: UINT32_BE.get(buf, off + 4)
        };
      }
    };
    SampleDescriptionTable = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        const descrLen = this.len - 12;
        return {
          dataFormat: FourCcToken.get(buf, off),
          dataReferenceIndex: UINT16_BE.get(buf, off + 10),
          description: descrLen > 0 ? new Uint8ArrayType(descrLen).get(buf, off + 12) : void 0
        };
      }
    };
    StsdAtom = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        const header = stsdHeader.get(buf, off);
        off += stsdHeader.len;
        const table = [];
        for (let n = 0; n < header.numberOfEntries; ++n) {
          const size = UINT32_BE.get(buf, off);
          off += UINT32_BE.len;
          table.push(new SampleDescriptionTable(size - UINT32_BE.len).get(buf, off));
          off += size;
        }
        return {
          header,
          table
        };
      }
    };
    SoundSampleDescriptionVersion = {
      len: 8,
      get(buf, off) {
        return {
          version: INT16_BE.get(buf, off),
          revision: INT16_BE.get(buf, off + 2),
          vendor: INT32_BE.get(buf, off + 4)
        };
      }
    };
    SoundSampleDescriptionV0 = {
      len: 12,
      get(buf, off) {
        return {
          numAudioChannels: INT16_BE.get(buf, off + 0),
          sampleSize: INT16_BE.get(buf, off + 2),
          compressionId: INT16_BE.get(buf, off + 4),
          packetSize: INT16_BE.get(buf, off + 6),
          sampleRate: UINT16_BE.get(buf, off + 8) + UINT16_BE.get(buf, off + 10) / 1e4
        };
      }
    };
    SimpleTableAtom = class {
      constructor(len, token) {
        this.len = len;
        this.token = token;
      }
      get(buf, off) {
        const nrOfEntries = INT32_BE.get(buf, off + 4);
        return {
          version: INT8.get(buf, off + 0),
          flags: INT24_BE.get(buf, off + 1),
          numberOfEntries: nrOfEntries,
          entries: readTokenTable(buf, this.token, off + 8, this.len - 8, nrOfEntries)
        };
      }
    };
    TimeToSampleToken = {
      len: 8,
      get(buf, off) {
        return {
          count: INT32_BE.get(buf, off + 0),
          duration: INT32_BE.get(buf, off + 4)
        };
      }
    };
    SttsAtom = class extends SimpleTableAtom {
      constructor(len) {
        super(len, TimeToSampleToken);
      }
    };
    SampleToChunkToken = {
      len: 12,
      get(buf, off) {
        return {
          firstChunk: INT32_BE.get(buf, off),
          samplesPerChunk: INT32_BE.get(buf, off + 4),
          sampleDescriptionId: INT32_BE.get(buf, off + 8)
        };
      }
    };
    StscAtom = class extends SimpleTableAtom {
      constructor(len) {
        super(len, SampleToChunkToken);
      }
    };
    StszAtom = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        const nrOfEntries = INT32_BE.get(buf, off + 8);
        return {
          version: INT8.get(buf, off),
          flags: INT24_BE.get(buf, off + 1),
          sampleSize: INT32_BE.get(buf, off + 4),
          numberOfEntries: nrOfEntries,
          entries: readTokenTable(buf, INT32_BE, off + 12, this.len - 12, nrOfEntries)
        };
      }
    };
    StcoAtom = class extends SimpleTableAtom {
      constructor(len) {
        super(len, INT32_BE);
        this.len = len;
      }
    };
    ChapterText = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        const titleLen = INT16_BE.get(buf, off + 0);
        const str = new StringType(titleLen, "utf-8");
        return str.get(buf, off + 2);
      }
    };
    TrackFragmentHeaderBox = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        const flagOffset = off + 1;
        const header = {
          version: INT8.get(buf, off),
          flags: {
            baseDataOffsetPresent: getBit(buf, flagOffset + 2, 0),
            sampleDescriptionIndexPresent: getBit(buf, flagOffset + 2, 1),
            defaultSampleDurationPresent: getBit(buf, flagOffset + 2, 3),
            defaultSampleSizePresent: getBit(buf, flagOffset + 2, 4),
            defaultSampleFlagsPresent: getBit(buf, flagOffset + 2, 5),
            defaultDurationIsEmpty: getBit(buf, flagOffset, 0),
            defaultBaseIsMoof: getBit(buf, flagOffset, 1)
          },
          trackId: UINT32_BE.get(buf, 4)
        };
        let dynOffset = 8;
        if (header.flags.baseDataOffsetPresent) {
          header.baseDataOffset = UINT64_BE.get(buf, dynOffset);
          dynOffset += 8;
        }
        if (header.flags.sampleDescriptionIndexPresent) {
          header.sampleDescriptionIndex = UINT32_BE.get(buf, dynOffset);
          dynOffset += 4;
        }
        if (header.flags.defaultSampleDurationPresent) {
          header.defaultSampleDuration = UINT32_BE.get(buf, dynOffset);
          dynOffset += 4;
        }
        if (header.flags.defaultSampleSizePresent) {
          header.defaultSampleSize = UINT32_BE.get(buf, dynOffset);
          dynOffset += 4;
        }
        if (header.flags.defaultSampleFlagsPresent) {
          header.defaultSampleFlags = UINT32_BE.get(buf, dynOffset);
        }
        return header;
      }
    };
    TrackRunBox = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        const flagOffset = off + 1;
        const trun = {
          version: INT8.get(buf, off),
          flags: {
            dataOffsetPresent: getBit(buf, flagOffset + 2, 0),
            firstSampleFlagsPresent: getBit(buf, flagOffset + 2, 2),
            sampleDurationPresent: getBit(buf, flagOffset + 1, 0),
            sampleSizePresent: getBit(buf, flagOffset + 1, 1),
            sampleFlagsPresent: getBit(buf, flagOffset + 1, 2),
            sampleCompositionTimeOffsetsPresent: getBit(buf, flagOffset + 1, 3)
          },
          sampleCount: UINT32_BE.get(buf, off + 4),
          samples: []
        };
        let dynOffset = off + 8;
        if (trun.flags.dataOffsetPresent) {
          trun.dataOffset = UINT32_BE.get(buf, dynOffset);
          dynOffset += 4;
        }
        if (trun.flags.firstSampleFlagsPresent) {
          trun.firstSampleFlags = UINT32_BE.get(buf, dynOffset);
          dynOffset += 4;
        }
        for (let n = 0; n < trun.sampleCount; ++n) {
          if (dynOffset >= this.len) {
            debug16("TrackRunBox size mismatch");
            break;
          }
          const sample = {};
          if (trun.flags.sampleDurationPresent) {
            sample.sampleDuration = UINT32_BE.get(buf, dynOffset);
            dynOffset += 4;
          }
          if (trun.flags.sampleSizePresent) {
            sample.sampleSize = UINT32_BE.get(buf, dynOffset);
            dynOffset += 4;
          }
          if (trun.flags.sampleFlagsPresent) {
            sample.sampleFlags = UINT32_BE.get(buf, dynOffset);
            dynOffset += 4;
          }
          if (trun.flags.sampleCompositionTimeOffsetsPresent) {
            sample.sampleCompositionTimeOffset = UINT32_BE.get(buf, dynOffset);
            dynOffset += 4;
          }
          trun.samples.push(sample);
        }
        return trun;
      }
    };
    HandlerBox = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        const _flagOffset = off + 1;
        const charTypeToken = new StringType(4, "utf-8");
        return {
          version: INT8.get(buf, off),
          flags: UINT24_BE.get(buf, off + 1),
          componentType: charTypeToken.get(buf, off + 4),
          handlerType: charTypeToken.get(buf, off + 8),
          componentName: new StringType(this.len - 28, "utf-8").get(buf, off + 28)
        };
      }
    };
    ChapterTrackReferenceBox = class {
      constructor(len) {
        this.len = len;
      }
      get(buf, off) {
        let dynOffset = 0;
        const trackIds = [];
        while (dynOffset < this.len) {
          trackIds.push(UINT32_BE.get(buf, off + dynOffset));
          dynOffset += 4;
        }
        return trackIds;
      }
    };
  }
});

// node_modules/music-metadata/lib/mp4/Atom.js
var import_debug17, debug17, Atom;
var init_Atom = __esm({
  "node_modules/music-metadata/lib/mp4/Atom.js"() {
    import_debug17 = __toESM(require_src(), 1);
    init_AtomToken();
    init_AtomToken();
    debug17 = (0, import_debug17.default)("music-metadata:parser:MP4:Atom");
    Atom = class _Atom {
      static async readAtom(tokenizer, dataHandler, parent, remaining) {
        const offset = tokenizer.position;
        debug17(`Reading next token on offset=${offset}...`);
        const header = await tokenizer.readToken(Header3);
        const extended = header.length === 1n;
        if (extended) {
          header.length = await tokenizer.readToken(ExtendedSize);
        }
        const atomBean = new _Atom(header, extended, parent);
        const payloadLength = atomBean.getPayloadLength(remaining);
        debug17(`parse atom name=${atomBean.atomPath}, extended=${atomBean.extended}, offset=${offset}, len=${atomBean.header.length}`);
        await atomBean.readData(tokenizer, dataHandler, payloadLength);
        return atomBean;
      }
      constructor(header, extended, parent) {
        this.header = header;
        this.extended = extended;
        this.parent = parent;
        this.children = [];
        this.atomPath = (this.parent ? `${this.parent.atomPath}.` : "") + this.header.name;
      }
      getHeaderLength() {
        return this.extended ? 16 : 8;
      }
      getPayloadLength(remaining) {
        return (this.header.length === 0n ? remaining : Number(this.header.length)) - this.getHeaderLength();
      }
      async readAtoms(tokenizer, dataHandler, size) {
        while (size > 0) {
          const atomBean = await _Atom.readAtom(tokenizer, dataHandler, this, size);
          this.children.push(atomBean);
          size -= atomBean.header.length === 0n ? size : Number(atomBean.header.length);
        }
      }
      async readData(tokenizer, dataHandler, remaining) {
        switch (this.header.name) {
          // "Container" atoms, contains nested atoms
          case "moov":
          // The Movie Atom: contains other atoms
          case "udta":
          // User defined atom
          case "mdia":
          // Media atom
          case "minf":
          // Media Information Atom
          case "stbl":
          // The Sample Table Atom
          case "<id>":
          case "ilst":
          case "tref":
          case "moof":
            return this.readAtoms(tokenizer, dataHandler, this.getPayloadLength(remaining));
          case "meta": {
            const peekHeader = await tokenizer.peekToken(Header3);
            const paddingLength = peekHeader.name === "hdlr" ? 0 : 4;
            await tokenizer.ignore(paddingLength);
            return this.readAtoms(tokenizer, dataHandler, this.getPayloadLength(remaining) - paddingLength);
          }
          default:
            return dataHandler(this, remaining);
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/mp4/MP4Parser.js
var MP4Parser_exports = {};
__export(MP4Parser_exports, {
  MP4Parser: () => MP4Parser
});
function distinct(value, index, self) {
  return self.indexOf(value) === index;
}
var import_debug18, debug18, tagFormat2, encoderDict, MP4Parser;
var init_MP4Parser = __esm({
  "node_modules/music-metadata/lib/mp4/MP4Parser.js"() {
    import_debug18 = __toESM(require_src(), 1);
    init_lib3();
    init_BasicParser();
    init_ID3v1Parser();
    init_Atom();
    init_AtomToken();
    init_AtomToken();
    init_type();
    init_uint8array_extras();
    init_lib2();
    debug18 = (0, import_debug18.default)("music-metadata:parser:MP4");
    tagFormat2 = "iTunes";
    encoderDict = {
      raw: {
        lossy: false,
        format: "raw"
      },
      MAC3: {
        lossy: true,
        format: "MACE 3:1"
      },
      MAC6: {
        lossy: true,
        format: "MACE 6:1"
      },
      ima4: {
        lossy: true,
        format: "IMA 4:1"
      },
      ulaw: {
        lossy: true,
        format: "uLaw 2:1"
      },
      alaw: {
        lossy: true,
        format: "uLaw 2:1"
      },
      Qclp: {
        lossy: true,
        format: "QUALCOMM PureVoice"
      },
      ".mp3": {
        lossy: true,
        format: "MPEG-1 layer 3"
      },
      alac: {
        lossy: false,
        format: "ALAC"
      },
      "ac-3": {
        lossy: true,
        format: "AC-3"
      },
      mp4a: {
        lossy: true,
        format: "MPEG-4/AAC"
      },
      mp4s: {
        lossy: true,
        format: "MP4S"
      },
      // Closed Captioning Media, https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-SW87
      c608: {
        lossy: true,
        format: "CEA-608"
      },
      c708: {
        lossy: true,
        format: "CEA-708"
      }
    };
    MP4Parser = class _MP4Parser extends BasicParser {
      constructor() {
        super(...arguments);
        this.tracks = /* @__PURE__ */ new Map();
        this.hasVideoTrack = false;
        this.hasAudioTrack = true;
        this.atomParsers = {
          /**
           * Parse movie header (mvhd) atom
           * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-56313
           */
          mvhd: async (len) => {
            const mvhd = await this.tokenizer.readToken(new MvhdAtom(len));
            this.metadata.setFormat("creationTime", mvhd.creationTime);
            this.metadata.setFormat("modificationTime", mvhd.modificationTime);
          },
          chap: async (len) => {
            const td = this.getTrackDescription();
            const trackIds = [];
            while (len >= UINT32_BE.len) {
              trackIds.push(await this.tokenizer.readNumber(UINT32_BE));
              len -= UINT32_BE.len;
            }
            td.chapterList = trackIds;
          },
          /**
           * Parse mdat atom.
           * Will scan for chapters
           */
          mdat: async (len) => {
            if (this.options.includeChapters) {
              const trackWithChapters = [...this.tracks.values()].filter((track) => track.chapterList);
              if (trackWithChapters.length === 1) {
                const chapterTrackIds = trackWithChapters[0].chapterList;
                const chapterTracks = [...this.tracks.values()].filter((track) => chapterTrackIds.indexOf(track.header.trackId) !== -1);
                if (chapterTracks.length === 1) {
                  return this.parseChapterTrack(chapterTracks[0], trackWithChapters[0], len);
                }
              }
            }
            await this.tokenizer.ignore(len);
          },
          ftyp: async (len) => {
            const types = [];
            while (len > 0) {
              const ftype = await this.tokenizer.readToken(ftyp);
              len -= ftyp.len;
              const value = ftype.type.replace(/\W/g, "");
              if (value.length > 0) {
                types.push(value);
              }
            }
            debug18(`ftyp: ${types.join("/")}`);
            const x = types.filter(distinct).join("/");
            this.metadata.setFormat("container", x);
          },
          /**
           * Parse sample description atom
           */
          stsd: async (len) => {
            const stsd = await this.tokenizer.readToken(new StsdAtom(len));
            const trackDescription = this.getTrackDescription();
            trackDescription.soundSampleDescription = stsd.table.map((dfEntry) => this.parseSoundSampleDescription(dfEntry));
          },
          /**
           * Parse sample-sizes atom ('stsz')
           */
          stsz: async (len) => {
            const stsz = await this.tokenizer.readToken(new StszAtom(len));
            const td = this.getTrackDescription();
            td.sampleSize = stsz.sampleSize;
            td.sampleSizeTable = stsz.entries;
          },
          date: async (len) => {
            const date = await this.tokenizer.readToken(new StringType(len, "utf-8"));
            await this.addTag("date", date);
          }
        };
      }
      static read_BE_Integer(array, signed) {
        const integerType = (signed ? "INT" : "UINT") + array.length * 8 + (array.length > 1 ? "_BE" : "");
        const token = lib_exports[integerType];
        if (!token) {
          throw new Mp4ContentError(`Token for integer type not found: "${integerType}"`);
        }
        return Number(token.get(array, 0));
      }
      async parse() {
        this.hasVideoTrack = false;
        this.hasAudioTrack = true;
        this.tracks.clear();
        let remainingFileSize = this.tokenizer.fileInfo.size || 0;
        while (!this.tokenizer.fileInfo.size || remainingFileSize > 0) {
          try {
            const token = await this.tokenizer.peekToken(Header3);
            if (token.name === "\0\0\0\0") {
              const errMsg = `Error at offset=${this.tokenizer.position}: box.id=0`;
              debug18(errMsg);
              this.addWarning(errMsg);
              break;
            }
          } catch (error) {
            if (error instanceof Error) {
              const errMsg = `Error at offset=${this.tokenizer.position}: ${error.message}`;
              debug18(errMsg);
              this.addWarning(errMsg);
            } else
              throw error;
            break;
          }
          const rootAtom = await Atom.readAtom(this.tokenizer, (atom, remaining) => this.handleAtom(atom, remaining), null, remainingFileSize);
          remainingFileSize -= rootAtom.header.length === BigInt(0) ? remainingFileSize : Number(rootAtom.header.length);
        }
        const formatList = [];
        this.tracks.forEach((track) => {
          const trackFormats = [];
          track.soundSampleDescription.forEach((ssd) => {
            const streamInfo = {};
            const encoderInfo = encoderDict[ssd.dataFormat];
            if (encoderInfo) {
              trackFormats.push(encoderInfo.format);
              streamInfo.codecName = encoderInfo.format;
            } else {
              streamInfo.codecName = `<${ssd.dataFormat}>`;
            }
            if (ssd.description) {
              const { description } = ssd;
              if (description.sampleRate > 0) {
                streamInfo.type = TrackType.audio;
                streamInfo.audio = {
                  samplingFrequency: description.sampleRate,
                  bitDepth: description.sampleSize,
                  channels: description.numAudioChannels
                };
              }
            }
            this.metadata.addStreamInfo(streamInfo);
          });
          if (trackFormats.length >= 1) {
            formatList.push(trackFormats.join("/"));
          }
        });
        if (formatList.length > 0) {
          this.metadata.setFormat("codec", formatList.filter(distinct).join("+"));
        }
        const audioTracks = [...this.tracks.values()].filter((track) => {
          return track.soundSampleDescription.length >= 1 && track.soundSampleDescription[0].description && track.soundSampleDescription[0].description.numAudioChannels > 0;
        });
        for (const audioTrack of audioTracks) {
          if (audioTrack.media.header && audioTrack.media.header.timeScale > 0) {
            audioTrack.sampleRate = audioTrack.media.header.timeScale;
            if (audioTrack.media.header.duration > 0) {
              debug18("Using duration defined on audio track");
              audioTrack.samples = audioTrack.media.header.duration;
              audioTrack.duration = audioTrack.samples / audioTrack.sampleRate;
            }
            if (audioTrack.fragments.length > 0) {
              debug18("Calculate duration defined in track fragments");
              let totalTimeUnits = 0;
              audioTrack.sizeInBytes = 0;
              for (const fragment of audioTrack.fragments) {
                for (const sample of fragment.trackRun.samples) {
                  const dur = sample.sampleDuration ?? fragment.header.defaultSampleDuration ?? 0;
                  const size = sample.sampleSize ?? fragment.header.defaultSampleSize ?? 0;
                  if (dur === 0) {
                    throw new Error("Missing sampleDuration and no defaultSampleDuration in track fragment header");
                  }
                  if (size === 0) {
                    throw new Error("Missing sampleSize and no defaultSampleSize in track fragment header");
                  }
                  totalTimeUnits += dur;
                  audioTrack.sizeInBytes += size;
                }
              }
              if (!audioTrack.samples) {
                audioTrack.samples = totalTimeUnits;
              }
              if (!audioTrack.duration) {
                audioTrack.duration = totalTimeUnits / audioTrack.sampleRate;
              }
            } else if (audioTrack.sampleSizeTable.length > 0) {
              audioTrack.sizeInBytes = audioTrack.sampleSizeTable.reduce((sum, n) => sum + n, 0);
            }
          }
          const ssd = audioTrack.soundSampleDescription[0];
          if (ssd.description && audioTrack.media.header) {
            this.metadata.setFormat("sampleRate", ssd.description.sampleRate);
            this.metadata.setFormat("bitsPerSample", ssd.description.sampleSize);
            this.metadata.setFormat("numberOfChannels", ssd.description.numAudioChannels);
            if (audioTrack.media.header.timeScale === 0 && audioTrack.timeToSampleTable.length > 0) {
              const totalSampleSize = audioTrack.timeToSampleTable.map((ttstEntry) => ttstEntry.count * ttstEntry.duration).reduce((total, sampleSize) => total + sampleSize);
              audioTrack.duration = totalSampleSize / ssd.description.sampleRate;
            }
          }
          const encoderInfo = encoderDict[ssd.dataFormat];
          if (encoderInfo) {
            this.metadata.setFormat("lossless", !encoderInfo.lossy);
          }
        }
        if (audioTracks.length >= 1) {
          const firstAudioTrack = audioTracks[0];
          if (firstAudioTrack.duration) {
            this.metadata.setFormat("duration", firstAudioTrack.duration);
            if (firstAudioTrack.sizeInBytes) {
              this.metadata.setFormat("bitrate", 8 * firstAudioTrack.sizeInBytes / firstAudioTrack.duration);
            }
          }
        }
        this.metadata.setFormat("hasAudio", this.hasAudioTrack);
        this.metadata.setFormat("hasVideo", this.hasVideoTrack);
      }
      async handleAtom(atom, remaining) {
        if (atom.parent) {
          switch (atom.parent.header.name) {
            case "ilst":
            case "<id>":
              return this.parseMetadataItemData(atom);
            case "moov":
              switch (atom.header.name) {
                case "trak":
                  return this.parseTrackBox(atom);
                case "udta":
                  return this.parseTrackBox(atom);
              }
              break;
            case "moof":
              switch (atom.header.name) {
                case "traf":
                  return this.parseTrackFragmentBox(atom);
              }
          }
        }
        if (this.atomParsers[atom.header.name]) {
          return this.atomParsers[atom.header.name](remaining);
        }
        debug18(`No parser for atom path=${atom.atomPath}, payload-len=${remaining}, ignoring atom`);
        await this.tokenizer.ignore(remaining);
      }
      getTrackDescription() {
        const tracks = [...this.tracks.values()];
        return tracks[tracks.length - 1];
      }
      async addTag(id, value) {
        await this.metadata.addTag(tagFormat2, id, value);
      }
      addWarning(message) {
        debug18(`Warning: ${message}`);
        this.metadata.addWarning(message);
      }
      /**
       * Parse data of Meta-item-list-atom (item of 'ilst' atom)
       * @param metaAtom
       * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW8
       */
      parseMetadataItemData(metaAtom) {
        let tagKey = metaAtom.header.name;
        return metaAtom.readAtoms(this.tokenizer, async (child, remaining) => {
          const payLoadLength = child.getPayloadLength(remaining);
          switch (child.header.name) {
            case "data":
              return this.parseValueAtom(tagKey, child);
            case "name":
            // name atom (optional)
            case "mean":
            case "rate": {
              const name = await this.tokenizer.readToken(new NameAtom(payLoadLength));
              tagKey += `:${name.name}`;
              break;
            }
            default: {
              const uint8Array = await this.tokenizer.readToken(new Uint8ArrayType(payLoadLength));
              this.addWarning(`Unsupported meta-item: ${tagKey}[${child.header.name}] => value=${uint8ArrayToHex(uint8Array)} ascii=${textDecode(uint8Array, "ascii")}`);
            }
          }
        }, metaAtom.getPayloadLength(0));
      }
      async parseValueAtom(tagKey, metaAtom) {
        const dataAtom = await this.tokenizer.readToken(new DataAtom(Number(metaAtom.header.length) - Header3.len));
        if (dataAtom.type.set !== 0) {
          throw new Mp4ContentError(`Unsupported type-set != 0: ${dataAtom.type.set}`);
        }
        switch (dataAtom.type.type) {
          case 0:
            switch (tagKey) {
              case "trkn":
              case "disk": {
                const num = UINT8.get(dataAtom.value, 3);
                const of = UINT8.get(dataAtom.value, 5);
                await this.addTag(tagKey, `${num}/${of}`);
                break;
              }
              case "gnre": {
                const genreInt = UINT8.get(dataAtom.value, 1);
                const genreStr = Genres[genreInt - 1];
                await this.addTag(tagKey, genreStr);
                break;
              }
              case "rate": {
                const rate = textDecode(dataAtom.value, "ascii");
                await this.addTag(tagKey, rate);
                break;
              }
              default:
                debug18(`unknown proprietary value type for: ${metaAtom.atomPath}`);
            }
            break;
          case 1:
          // UTF-8: Without any count or NULL terminator
          case 18:
            await this.addTag(tagKey, textDecode(dataAtom.value));
            break;
          case 13:
            if (this.options.skipCovers)
              break;
            await this.addTag(tagKey, {
              format: "image/jpeg",
              data: Uint8Array.from(dataAtom.value)
            });
            break;
          case 14:
            if (this.options.skipCovers)
              break;
            await this.addTag(tagKey, {
              format: "image/png",
              data: Uint8Array.from(dataAtom.value)
            });
            break;
          case 21:
            await this.addTag(tagKey, _MP4Parser.read_BE_Integer(dataAtom.value, true));
            break;
          case 22:
            await this.addTag(tagKey, _MP4Parser.read_BE_Integer(dataAtom.value, false));
            break;
          case 65:
            await this.addTag(tagKey, UINT8.get(dataAtom.value, 0));
            break;
          case 66:
            await this.addTag(tagKey, UINT16_BE.get(dataAtom.value, 0));
            break;
          case 67:
            await this.addTag(tagKey, UINT32_BE.get(dataAtom.value, 0));
            break;
          default:
            this.addWarning(`atom key=${tagKey}, has unknown well-known-type (data-type): ${dataAtom.type.type}`);
        }
      }
      async parseTrackBox(trakBox) {
        const track = {
          media: {},
          fragments: []
        };
        await trakBox.readAtoms(this.tokenizer, async (child, remaining) => {
          const payLoadLength = child.getPayloadLength(remaining);
          switch (child.header.name) {
            case "chap": {
              const chap = await this.tokenizer.readToken(new ChapterTrackReferenceBox(remaining));
              track.chapterList = chap;
              break;
            }
            case "tkhd":
              track.header = await this.tokenizer.readToken(new TrackHeaderAtom(payLoadLength));
              break;
            case "hdlr":
              track.handler = await this.tokenizer.readToken(new HandlerBox(payLoadLength));
              track.isAudio = () => track.handler.handlerType === "audi" || track.handler.handlerType === "soun";
              track.isVideo = () => track.handler.handlerType === "vide";
              if (track.isAudio()) {
                this.hasAudioTrack = true;
              } else if (track.isVideo()) {
                this.hasVideoTrack = true;
              }
              break;
            case "mdhd": {
              const mdhd_data = await this.tokenizer.readToken(new MdhdAtom(payLoadLength));
              track.media.header = mdhd_data;
              break;
            }
            case "stco": {
              const stco = await this.tokenizer.readToken(new StcoAtom(payLoadLength));
              track.chunkOffsetTable = stco.entries;
              break;
            }
            case "stsc": {
              const stsc = await this.tokenizer.readToken(new StscAtom(payLoadLength));
              track.sampleToChunkTable = stsc.entries;
              break;
            }
            case "stsd": {
              const stsd = await this.tokenizer.readToken(new StsdAtom(payLoadLength));
              track.soundSampleDescription = stsd.table.map((dfEntry) => this.parseSoundSampleDescription(dfEntry));
              break;
            }
            case "stts": {
              const stts = await this.tokenizer.readToken(new SttsAtom(payLoadLength));
              track.timeToSampleTable = stts.entries;
              break;
            }
            case "stsz": {
              const stsz = await this.tokenizer.readToken(new StszAtom(payLoadLength));
              track.sampleSize = stsz.sampleSize;
              track.sampleSizeTable = stsz.entries;
              break;
            }
            case "dinf":
            case "vmhd":
            case "smhd":
              debug18(`Ignoring: ${child.header.name}`);
              await this.tokenizer.ignore(payLoadLength);
              break;
            default: {
              debug18(`Unexpected track box: ${child.header.name}`);
              await this.tokenizer.ignore(payLoadLength);
            }
          }
        }, trakBox.getPayloadLength(0));
        this.tracks.set(track.header.trackId, track);
      }
      parseTrackFragmentBox(trafBox) {
        let tfhd;
        return trafBox.readAtoms(this.tokenizer, async (child, remaining) => {
          const payLoadLength = child.getPayloadLength(remaining);
          switch (child.header.name) {
            case "tfhd": {
              const fragmentHeaderBox = new TrackFragmentHeaderBox(child.getPayloadLength(remaining));
              tfhd = await this.tokenizer.readToken(fragmentHeaderBox);
              break;
            }
            case "tfdt":
              await this.tokenizer.ignore(payLoadLength);
              break;
            case "trun": {
              const trackRunBox = new TrackRunBox(payLoadLength);
              const trun = await this.tokenizer.readToken(trackRunBox);
              if (tfhd) {
                const track = this.tracks.get(tfhd.trackId);
                track?.fragments.push({ header: tfhd, trackRun: trun });
              }
              break;
            }
            default: {
              debug18(`Unexpected box: ${child.header.name}`);
              await this.tokenizer.ignore(payLoadLength);
            }
          }
        }, trafBox.getPayloadLength(0));
      }
      /**
       * @param sampleDescription
       * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-128916
       */
      parseSoundSampleDescription(sampleDescription) {
        const ssd = {
          dataFormat: sampleDescription.dataFormat,
          dataReferenceIndex: sampleDescription.dataReferenceIndex
        };
        let offset = 0;
        if (sampleDescription.description) {
          const version = SoundSampleDescriptionVersion.get(sampleDescription.description, offset);
          offset += SoundSampleDescriptionVersion.len;
          if (version.version === 0 || version.version === 1) {
            ssd.description = SoundSampleDescriptionV0.get(sampleDescription.description, offset);
          } else {
            debug18(`Warning: sound-sample-description ${version} not implemented`);
          }
        }
        return ssd;
      }
      async parseChapterTrack(chapterTrack, track, len) {
        if (!chapterTrack.sampleSize) {
          if (chapterTrack.chunkOffsetTable.length !== chapterTrack.sampleSizeTable.length)
            throw new Error("Expected equal chunk-offset-table & sample-size-table length.");
        }
        const chapters = [];
        for (let i = 0; i < chapterTrack.chunkOffsetTable.length && len > 0; ++i) {
          const start = chapterTrack.timeToSampleTable.slice(0, i).reduce((acc, cur) => acc + cur.duration, 0);
          const chunkOffset = chapterTrack.chunkOffsetTable[i];
          const nextChunkLen = chunkOffset - this.tokenizer.position;
          const sampleSize = chapterTrack.sampleSize > 0 ? chapterTrack.sampleSize : chapterTrack.sampleSizeTable[i];
          len -= nextChunkLen + sampleSize;
          if (len < 0)
            throw new Mp4ContentError("Chapter chunk exceeding token length");
          await this.tokenizer.ignore(nextChunkLen);
          const title = await this.tokenizer.readToken(new ChapterText(sampleSize));
          debug18(`Chapter ${i + 1}: ${title}`);
          const chapter = {
            title,
            timeScale: chapterTrack.media.header ? chapterTrack.media.header.timeScale : 0,
            start,
            sampleOffset: this.findSampleOffset(track, this.tokenizer.position)
          };
          debug18(`Chapter title=${chapter.title}, offset=${chapter.sampleOffset}/${track.header.duration}`);
          chapters.push(chapter);
        }
        this.metadata.setFormat("chapters", chapters);
        await this.tokenizer.ignore(len);
      }
      findSampleOffset(track, chapterOffset) {
        let chunkIndex = 0;
        while (chunkIndex < track.chunkOffsetTable.length && track.chunkOffsetTable[chunkIndex] < chapterOffset) {
          ++chunkIndex;
        }
        return this.getChunkDuration(chunkIndex + 1, track);
      }
      getChunkDuration(chunkId, track) {
        let ttsi = 0;
        let ttsc = track.timeToSampleTable[ttsi].count;
        let ttsd = track.timeToSampleTable[ttsi].duration;
        let curChunkId = 1;
        let samplesPerChunk = this.getSamplesPerChunk(curChunkId, track.sampleToChunkTable);
        let totalDuration = 0;
        while (curChunkId < chunkId) {
          const nrOfSamples = Math.min(ttsc, samplesPerChunk);
          totalDuration += nrOfSamples * ttsd;
          ttsc -= nrOfSamples;
          samplesPerChunk -= nrOfSamples;
          if (samplesPerChunk === 0) {
            ++curChunkId;
            samplesPerChunk = this.getSamplesPerChunk(curChunkId, track.sampleToChunkTable);
          } else {
            ++ttsi;
            ttsc = track.timeToSampleTable[ttsi].count;
            ttsd = track.timeToSampleTable[ttsi].duration;
          }
        }
        return totalDuration;
      }
      getSamplesPerChunk(chunkId, stcTable) {
        for (let i = 0; i < stcTable.length - 1; ++i) {
          if (chunkId >= stcTable[i].firstChunk && chunkId < stcTable[i + 1].firstChunk) {
            return stcTable[i].samplesPerChunk;
          }
        }
        return stcTable[stcTable.length - 1].samplesPerChunk;
      }
    };
  }
});

// node_modules/music-metadata/lib/musepack/sv8/StreamVersion8.js
var import_debug19, debug19, PacketKey, SH_part1, SH_part3, StreamReader2;
var init_StreamVersion8 = __esm({
  "node_modules/music-metadata/lib/musepack/sv8/StreamVersion8.js"() {
    init_lib3();
    import_debug19 = __toESM(require_src(), 1);
    init_Util();
    debug19 = (0, import_debug19.default)("music-metadata:parser:musepack:sv8");
    PacketKey = new StringType(2, "latin1");
    SH_part1 = {
      len: 5,
      get: (buf, off) => {
        return {
          crc: UINT32_LE.get(buf, off),
          streamVersion: UINT8.get(buf, off + 4)
        };
      }
    };
    SH_part3 = {
      len: 2,
      get: (buf, off) => {
        return {
          sampleFrequency: [44100, 48e3, 37800, 32e3][getBitAllignedNumber(buf, off, 0, 3)],
          maxUsedBands: getBitAllignedNumber(buf, off, 3, 5),
          channelCount: getBitAllignedNumber(buf, off + 1, 0, 4) + 1,
          msUsed: isBitSet(buf, off + 1, 4),
          audioBlockFrames: getBitAllignedNumber(buf, off + 1, 5, 3)
        };
      }
    };
    StreamReader2 = class {
      get tokenizer() {
        return this._tokenizer;
      }
      set tokenizer(value) {
        this._tokenizer = value;
      }
      constructor(_tokenizer) {
        this._tokenizer = _tokenizer;
      }
      async readPacketHeader() {
        const key = await this.tokenizer.readToken(PacketKey);
        const size = await this.readVariableSizeField();
        return {
          key,
          payloadLength: size.value - 2 - size.len
        };
      }
      async readStreamHeader(size) {
        const streamHeader = {};
        debug19(`Reading SH at offset=${this.tokenizer.position}`);
        const part1 = await this.tokenizer.readToken(SH_part1);
        size -= SH_part1.len;
        Object.assign(streamHeader, part1);
        debug19(`SH.streamVersion = ${part1.streamVersion}`);
        const sampleCount = await this.readVariableSizeField();
        size -= sampleCount.len;
        streamHeader.sampleCount = sampleCount.value;
        const bs = await this.readVariableSizeField();
        size -= bs.len;
        streamHeader.beginningOfSilence = bs.value;
        const part3 = await this.tokenizer.readToken(SH_part3);
        size -= SH_part3.len;
        Object.assign(streamHeader, part3);
        await this.tokenizer.ignore(size);
        return streamHeader;
      }
      async readVariableSizeField(len = 1, hb = 0) {
        let n = await this.tokenizer.readNumber(UINT8);
        if ((n & 128) === 0) {
          return { len, value: hb + n };
        }
        n &= 127;
        n += hb;
        return this.readVariableSizeField(len + 1, n << 7);
      }
    };
  }
});

// node_modules/music-metadata/lib/musepack/MusepackConentError.js
var MusepackContentError;
var init_MusepackConentError = __esm({
  "node_modules/music-metadata/lib/musepack/MusepackConentError.js"() {
    init_ParseError();
    MusepackContentError = class extends makeUnexpectedFileContentError("Musepack") {
    };
  }
});

// node_modules/music-metadata/lib/musepack/sv8/MpcSv8Parser.js
var import_debug20, debug20, MpcSv8Parser;
var init_MpcSv8Parser = __esm({
  "node_modules/music-metadata/lib/musepack/sv8/MpcSv8Parser.js"() {
    import_debug20 = __toESM(require_src(), 1);
    init_BasicParser();
    init_APEv2Parser();
    init_FourCC();
    init_StreamVersion8();
    init_MusepackConentError();
    debug20 = (0, import_debug20.default)("music-metadata:parser:musepack");
    MpcSv8Parser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.audioLength = 0;
      }
      async parse() {
        const signature = await this.tokenizer.readToken(FourCcToken);
        if (signature !== "MPCK")
          throw new MusepackContentError("Invalid Magic number");
        this.metadata.setFormat("container", "Musepack, SV8");
        return this.parsePacket();
      }
      async parsePacket() {
        const sv8reader = new StreamReader2(this.tokenizer);
        do {
          const header = await sv8reader.readPacketHeader();
          debug20(`packet-header key=${header.key}, payloadLength=${header.payloadLength}`);
          switch (header.key) {
            case "SH": {
              const sh = await sv8reader.readStreamHeader(header.payloadLength);
              this.metadata.setFormat("numberOfSamples", sh.sampleCount);
              this.metadata.setFormat("sampleRate", sh.sampleFrequency);
              this.metadata.setFormat("duration", sh.sampleCount / sh.sampleFrequency);
              this.metadata.setFormat("numberOfChannels", sh.channelCount);
              break;
            }
            case "AP":
              this.audioLength += header.payloadLength;
              await this.tokenizer.ignore(header.payloadLength);
              break;
            case "RG":
            // Replaygain
            case "EI":
            // Encoder Info
            case "SO":
            // Seek Table Offset
            case "ST":
            // Seek Table
            case "CT":
              await this.tokenizer.ignore(header.payloadLength);
              break;
            case "SE":
              if (this.metadata.format.duration) {
                this.metadata.setFormat("bitrate", this.audioLength * 8 / this.metadata.format.duration);
              }
              return tryParseApeHeader(this.metadata, this.tokenizer, this.options);
            default:
              throw new MusepackContentError(`Unexpected header: ${header.key}`);
          }
        } while (true);
      }
    };
  }
});

// node_modules/music-metadata/lib/musepack/sv7/BitReader.js
var BitReader;
var init_BitReader = __esm({
  "node_modules/music-metadata/lib/musepack/sv7/BitReader.js"() {
    init_lib3();
    BitReader = class {
      constructor(tokenizer) {
        this.pos = 0;
        this.dword = null;
        this.tokenizer = tokenizer;
      }
      /**
       *
       * @param bits 1..30 bits
       */
      async read(bits) {
        while (this.dword === null) {
          this.dword = await this.tokenizer.readToken(UINT32_LE);
        }
        let out = this.dword;
        this.pos += bits;
        if (this.pos < 32) {
          out >>>= 32 - this.pos;
          return out & (1 << bits) - 1;
        }
        this.pos -= 32;
        if (this.pos === 0) {
          this.dword = null;
          return out & (1 << bits) - 1;
        }
        this.dword = await this.tokenizer.readToken(UINT32_LE);
        if (this.pos) {
          out <<= this.pos;
          out |= this.dword >>> 32 - this.pos;
        }
        return out & (1 << bits) - 1;
      }
      async ignore(bits) {
        if (this.pos > 0) {
          const remaining = 32 - this.pos;
          this.dword = null;
          bits -= remaining;
          this.pos = 0;
        }
        const remainder = bits % 32;
        const numOfWords = (bits - remainder) / 32;
        await this.tokenizer.ignore(numOfWords * 4);
        return this.read(remainder);
      }
    };
  }
});

// node_modules/music-metadata/lib/musepack/sv7/StreamVersion7.js
var Header4;
var init_StreamVersion7 = __esm({
  "node_modules/music-metadata/lib/musepack/sv7/StreamVersion7.js"() {
    init_lib3();
    init_Util();
    init_lib2();
    Header4 = {
      len: 6 * 4,
      get: (buf, off) => {
        const header = {
          // word 0
          signature: textDecode(buf.subarray(off, off + 3), "latin1"),
          // versionIndex number * 1000 (3.81 = 3810) (remember that 4-byte alignment causes this to take 4-bytes)
          streamMinorVersion: getBitAllignedNumber(buf, off + 3, 0, 4),
          streamMajorVersion: getBitAllignedNumber(buf, off + 3, 4, 4),
          // word 1
          frameCount: UINT32_LE.get(buf, off + 4),
          // word 2
          maxLevel: UINT16_LE.get(buf, off + 8),
          sampleFrequency: [44100, 48e3, 37800, 32e3][getBitAllignedNumber(buf, off + 10, 0, 2)],
          link: getBitAllignedNumber(buf, off + 10, 2, 2),
          profile: getBitAllignedNumber(buf, off + 10, 4, 4),
          maxBand: getBitAllignedNumber(buf, off + 11, 0, 6),
          intensityStereo: isBitSet(buf, off + 11, 6),
          midSideStereo: isBitSet(buf, off + 11, 7),
          // word 3
          titlePeak: UINT16_LE.get(buf, off + 12),
          titleGain: UINT16_LE.get(buf, off + 14),
          // word 4
          albumPeak: UINT16_LE.get(buf, off + 16),
          albumGain: UINT16_LE.get(buf, off + 18),
          // word
          lastFrameLength: UINT32_LE.get(buf, off + 20) >>> 20 & 2047,
          trueGapless: isBitSet(buf, off + 23, 0)
        };
        header.lastFrameLength = header.trueGapless ? UINT32_LE.get(buf, 20) >>> 20 & 2047 : 0;
        return header;
      }
    };
  }
});

// node_modules/music-metadata/lib/musepack/sv7/MpcSv7Parser.js
var import_debug21, debug21, MpcSv7Parser;
var init_MpcSv7Parser = __esm({
  "node_modules/music-metadata/lib/musepack/sv7/MpcSv7Parser.js"() {
    import_debug21 = __toESM(require_src(), 1);
    init_BasicParser();
    init_APEv2Parser();
    init_BitReader();
    init_StreamVersion7();
    init_MusepackConentError();
    debug21 = (0, import_debug21.default)("music-metadata:parser:musepack");
    MpcSv7Parser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.bitreader = null;
        this.audioLength = 0;
        this.duration = null;
      }
      async parse() {
        const header = await this.tokenizer.readToken(Header4);
        if (header.signature !== "MP+")
          throw new MusepackContentError("Unexpected magic number");
        debug21(`stream-version=${header.streamMajorVersion}.${header.streamMinorVersion}`);
        this.metadata.setFormat("container", "Musepack, SV7");
        this.metadata.setFormat("sampleRate", header.sampleFrequency);
        const numberOfSamples = 1152 * (header.frameCount - 1) + header.lastFrameLength;
        this.metadata.setFormat("numberOfSamples", numberOfSamples);
        this.duration = numberOfSamples / header.sampleFrequency;
        this.metadata.setFormat("duration", this.duration);
        this.bitreader = new BitReader(this.tokenizer);
        this.metadata.setFormat("numberOfChannels", header.midSideStereo || header.intensityStereo ? 2 : 1);
        const version = await this.bitreader.read(8);
        this.metadata.setFormat("codec", (version / 100).toFixed(2));
        await this.skipAudioData(header.frameCount);
        debug21(`End of audio stream, switching to APEv2, offset=${this.tokenizer.position}`);
        return tryParseApeHeader(this.metadata, this.tokenizer, this.options);
      }
      async skipAudioData(frameCount) {
        while (frameCount-- > 0) {
          const frameLength = await this.bitreader.read(20);
          this.audioLength += 20 + frameLength;
          await this.bitreader.ignore(frameLength);
        }
        const lastFrameLength = await this.bitreader.read(11);
        this.audioLength += lastFrameLength;
        if (this.duration !== null) {
          this.metadata.setFormat("bitrate", this.audioLength / this.duration);
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/musepack/MusepackParser.js
var MusepackParser_exports = {};
__export(MusepackParser_exports, {
  MusepackParser: () => MusepackParser
});
var import_debug22, debug22, MusepackParser;
var init_MusepackParser = __esm({
  "node_modules/music-metadata/lib/musepack/MusepackParser.js"() {
    import_debug22 = __toESM(require_src(), 1);
    init_lib3();
    init_AbstractID3Parser();
    init_MpcSv8Parser();
    init_MpcSv7Parser();
    init_MusepackConentError();
    debug22 = (0, import_debug22.default)("music-metadata:parser:musepack");
    MusepackParser = class extends AbstractID3Parser {
      async postId3v2Parse() {
        const signature = await this.tokenizer.peekToken(new StringType(3, "latin1"));
        let mpcParser;
        switch (signature) {
          case "MP+": {
            debug22("Stream-version 7");
            mpcParser = new MpcSv7Parser(this.metadata, this.tokenizer, this.options);
            break;
          }
          case "MPC": {
            debug22("Stream-version 8");
            mpcParser = new MpcSv8Parser(this.metadata, this.tokenizer, this.options);
            break;
          }
          default: {
            throw new MusepackContentError("Invalid signature prefix");
          }
        }
        this.metadata.setAudioOnly();
        return mpcParser.parse();
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/opus/Opus.js
var OpusContentError, IdHeader;
var init_Opus = __esm({
  "node_modules/music-metadata/lib/ogg/opus/Opus.js"() {
    init_lib3();
    init_ParseError();
    OpusContentError = class extends makeUnexpectedFileContentError("Opus") {
    };
    IdHeader = class {
      constructor(len) {
        if (len < 19) {
          throw new OpusContentError("ID-header-page 0 should be at least 19 bytes long");
        }
        this.len = len;
      }
      get(buf, off) {
        return {
          magicSignature: new StringType(8, "ascii").get(buf, off + 0),
          version: UINT8.get(buf, off + 8),
          channelCount: UINT8.get(buf, off + 9),
          preSkip: UINT16_LE.get(buf, off + 10),
          inputSampleRate: UINT32_LE.get(buf, off + 12),
          outputGain: UINT16_LE.get(buf, off + 16),
          channelMapping: UINT8.get(buf, off + 18)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/opus/OpusStream.js
var OpusStream;
var init_OpusStream = __esm({
  "node_modules/music-metadata/lib/ogg/opus/OpusStream.js"() {
    init_lib3();
    init_VorbisStream();
    init_Opus();
    init_Opus();
    OpusStream = class extends VorbisStream {
      constructor(metadata, options, tokenizer) {
        super(metadata, options);
        this.idHeader = null;
        this.lastPos = -1;
        this.tokenizer = tokenizer;
        this.durationOnLastPage = true;
      }
      /**
       * Parse first Opus Ogg page
       * @param {IPageHeader} header
       * @param {Uint8Array} pageData
       */
      parseFirstPage(_header, pageData) {
        this.metadata.setFormat("codec", "Opus");
        this.idHeader = new IdHeader(pageData.length).get(pageData, 0);
        if (this.idHeader.magicSignature !== "OpusHead")
          throw new OpusContentError("Illegal ogg/Opus magic-signature");
        this.metadata.setFormat("sampleRate", this.idHeader.inputSampleRate);
        this.metadata.setFormat("numberOfChannels", this.idHeader.channelCount);
        this.metadata.setAudioOnly();
      }
      async parseFullPage(pageData) {
        const magicSignature = new StringType(8, "ascii").get(pageData, 0);
        switch (magicSignature) {
          case "OpusTags":
            await this.parseUserCommentList(pageData, 8);
            this.lastPos = this.tokenizer.position - pageData.length;
            break;
          default:
            break;
        }
      }
      calculateDuration(enfOfStream) {
        if (this.lastPageHeader && (enfOfStream || this.lastPageHeader.headerType.lastPage) && this.metadata.format.sampleRate && this.lastPageHeader.absoluteGranulePosition >= 0) {
          const pos_48bit = this.lastPageHeader.absoluteGranulePosition - this.idHeader.preSkip;
          this.metadata.setFormat("numberOfSamples", pos_48bit);
          this.metadata.setFormat("duration", pos_48bit / 48e3);
          if (this.lastPos !== -1 && this.tokenizer.fileInfo.size && this.metadata.format.duration) {
            const dataSize = this.tokenizer.fileInfo.size - this.lastPos;
            this.metadata.setFormat("bitrate", 8 * dataSize / this.metadata.format.duration);
          }
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/speex/Speex.js
var Header5;
var init_Speex = __esm({
  "node_modules/music-metadata/lib/ogg/speex/Speex.js"() {
    init_lib3();
    init_Util();
    Header5 = {
      len: 80,
      get: (buf, off) => {
        return {
          speex: new StringType(8, "ascii").get(buf, off + 0),
          version: trimRightNull(new StringType(20, "ascii").get(buf, off + 8)),
          version_id: INT32_LE.get(buf, off + 28),
          header_size: INT32_LE.get(buf, off + 32),
          rate: INT32_LE.get(buf, off + 36),
          mode: INT32_LE.get(buf, off + 40),
          mode_bitstream_version: INT32_LE.get(buf, off + 44),
          nb_channels: INT32_LE.get(buf, off + 48),
          bitrate: INT32_LE.get(buf, off + 52),
          frame_size: INT32_LE.get(buf, off + 56),
          vbr: INT32_LE.get(buf, off + 60),
          frames_per_packet: INT32_LE.get(buf, off + 64),
          extra_headers: INT32_LE.get(buf, off + 68),
          reserved1: INT32_LE.get(buf, off + 72),
          reserved2: INT32_LE.get(buf, off + 76)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/speex/SpeexStream.js
var import_debug23, debug23, SpeexStream;
var init_SpeexStream = __esm({
  "node_modules/music-metadata/lib/ogg/speex/SpeexStream.js"() {
    import_debug23 = __toESM(require_src(), 1);
    init_VorbisStream();
    init_Speex();
    debug23 = (0, import_debug23.default)("music-metadata:parser:ogg:speex");
    SpeexStream = class extends VorbisStream {
      constructor(metadata, options, _tokenizer) {
        super(metadata, options);
      }
      /**
       * Parse first Speex Ogg page
       * @param {IPageHeader} header
       * @param {Uint8Array} pageData
       */
      parseFirstPage(_header, pageData) {
        debug23("First Ogg/Speex page");
        const speexHeader = Header5.get(pageData, 0);
        this.metadata.setFormat("codec", `Speex ${speexHeader.version}`);
        this.metadata.setFormat("numberOfChannels", speexHeader.nb_channels);
        this.metadata.setFormat("sampleRate", speexHeader.rate);
        if (speexHeader.bitrate !== -1) {
          this.metadata.setFormat("bitrate", speexHeader.bitrate);
        }
        this.metadata.setAudioOnly();
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/theora/Theora.js
var IdentificationHeader2;
var init_Theora = __esm({
  "node_modules/music-metadata/lib/ogg/theora/Theora.js"() {
    init_lib3();
    IdentificationHeader2 = {
      len: 42,
      get: (buf, off) => {
        return {
          id: new StringType(7, "ascii").get(buf, off),
          vmaj: UINT8.get(buf, off + 7),
          vmin: UINT8.get(buf, off + 8),
          vrev: UINT8.get(buf, off + 9),
          vmbw: UINT16_BE.get(buf, off + 10),
          vmbh: UINT16_BE.get(buf, off + 17),
          nombr: UINT24_BE.get(buf, off + 37),
          nqual: UINT8.get(buf, off + 40)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/theora/TheoraStream.js
var import_debug24, debug24, TheoraStream;
var init_TheoraStream = __esm({
  "node_modules/music-metadata/lib/ogg/theora/TheoraStream.js"() {
    import_debug24 = __toESM(require_src(), 1);
    init_Theora();
    debug24 = (0, import_debug24.default)("music-metadata:parser:ogg:theora");
    TheoraStream = class {
      constructor(metadata, _options, _tokenizer) {
        this.durationOnLastPage = false;
        this.metadata = metadata;
      }
      /**
       * Vorbis 1 parser
       * @param header Ogg Page Header
       * @param pageData Page data
       */
      async parsePage(header, pageData) {
        if (header.headerType.firstPage) {
          await this.parseFirstPage(header, pageData);
        }
      }
      calculateDuration() {
        debug24("duration calculation not implemented");
      }
      /**
       * Parse first Theora Ogg page. the initial identification header packet
       */
      async parseFirstPage(_header, pageData) {
        debug24("First Ogg/Theora page");
        this.metadata.setFormat("codec", "Theora");
        const idHeader = IdentificationHeader2.get(pageData, 0);
        this.metadata.setFormat("bitrate", idHeader.nombr);
        this.metadata.setFormat("hasVideo", true);
      }
      flush() {
        return Promise.resolve();
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/OggToken.js
var PageHeader, SegmentTable;
var init_OggToken = __esm({
  "node_modules/music-metadata/lib/ogg/OggToken.js"() {
    init_lib3();
    init_Util();
    init_lib3();
    PageHeader = {
      len: 27,
      get: (buf, off) => {
        return {
          capturePattern: new StringType(4, "latin1").get(buf, off),
          version: UINT8.get(buf, off + 4),
          headerType: {
            continued: getBit(buf, off + 5, 0),
            firstPage: getBit(buf, off + 5, 1),
            lastPage: getBit(buf, off + 5, 2)
          },
          // packet_flag: Token.UINT8.get(buf, off + 5),
          absoluteGranulePosition: Number(UINT64_LE.get(buf, off + 6)),
          streamSerialNumber: UINT32_LE.get(buf, off + 14),
          pageSequenceNo: UINT32_LE.get(buf, off + 18),
          pageChecksum: UINT32_LE.get(buf, off + 22),
          page_segments: UINT8.get(buf, off + 26)
        };
      }
    };
    SegmentTable = class _SegmentTable {
      static sum(buf, off, len) {
        const dv2 = new DataView(buf.buffer, 0);
        let s = 0;
        for (let i = off; i < off + len; ++i) {
          s += dv2.getUint8(i);
        }
        return s;
      }
      constructor(header) {
        this.len = header.page_segments;
      }
      get(buf, off) {
        return {
          totalPageSize: _SegmentTable.sum(buf, off, this.len)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/flac/FlacStream.js
var import_debug25, debug25, FlacStream;
var init_FlacStream = __esm({
  "node_modules/music-metadata/lib/ogg/flac/FlacStream.js"() {
    import_debug25 = __toESM(require_src(), 1);
    init_FlacToken();
    init_FlacParser();
    init_FourCC();
    init_Vorbis();
    debug25 = (0, import_debug25.default)("music-metadata:parser:ogg:theora");
    FlacStream = class {
      constructor(metadata, options, tokenizer) {
        this.durationOnLastPage = false;
        this.metadata = metadata;
        this.options = options;
        this.tokenizer = tokenizer;
        this.flacParser = new FlacParser(this.metadata, this.tokenizer, options);
      }
      /**
       * Vorbis 1 parser
       * @param header Ogg Page Header
       * @param pageData Page data
       */
      async parsePage(header, pageData) {
        if (header.headerType.firstPage) {
          await this.parseFirstPage(header, pageData);
        }
      }
      calculateDuration() {
        debug25("duration calculation not implemented");
      }
      /**
       * Parse first Theora Ogg page. the initial identification header packet
       */
      async parseFirstPage(_header, pageData) {
        debug25("First Ogg/FLAC page");
        const fourCC = await FourCcToken.get(pageData, 9);
        if (fourCC.toString() !== "fLaC") {
          throw new Error("Invalid FLAC preamble");
        }
        const blockHeader = await BlockHeader.get(pageData, 13);
        await this.parseDataBlock(blockHeader, pageData.subarray(13 + BlockHeader.len));
      }
      async parseDataBlock(blockHeader, pageData) {
        debug25(`blockHeader type=${blockHeader.type}, length=${blockHeader.length}`);
        switch (blockHeader.type) {
          case BlockType.STREAMINFO: {
            const streamInfo = BlockStreamInfo.get(pageData, 0);
            return this.flacParser.processsStreamInfo(streamInfo);
          }
          case BlockType.PADDING:
            break;
          case BlockType.APPLICATION:
            break;
          case BlockType.SEEKTABLE:
            break;
          case BlockType.VORBIS_COMMENT:
            return this.flacParser.parseComment(pageData);
          case BlockType.PICTURE:
            if (!this.options.skipCovers) {
              const picture = new VorbisPictureToken(pageData.length).get(pageData, 0);
              return this.flacParser.addPictureTag(picture);
            }
            break;
          default:
            this.metadata.addWarning(`Unknown block type: ${blockHeader.type}`);
        }
        return this.tokenizer.ignore(blockHeader.length).then();
      }
      flush() {
        return Promise.resolve();
      }
    };
  }
});

// node_modules/music-metadata/lib/ogg/OggParser.js
var OggParser_exports = {};
__export(OggParser_exports, {
  OggContentError: () => OggContentError,
  OggParser: () => OggParser
});
var import_debug26, OggContentError, debug26, OggStream, OggParser;
var init_OggParser = __esm({
  "node_modules/music-metadata/lib/ogg/OggParser.js"() {
    init_lib3();
    init_lib();
    import_debug26 = __toESM(require_src(), 1);
    init_BasicParser();
    init_VorbisStream();
    init_OpusStream();
    init_SpeexStream();
    init_TheoraStream();
    init_ParseError();
    init_OggToken();
    init_FlacStream();
    OggContentError = class extends makeUnexpectedFileContentError("Ogg") {
    };
    debug26 = (0, import_debug26.default)("music-metadata:parser:ogg");
    OggStream = class {
      constructor(metadata, streamSerial, options) {
        this.pageNumber = 0;
        this.closed = false;
        this.metadata = metadata;
        this.streamSerial = streamSerial;
        this.options = options;
      }
      async parsePage(tokenizer, header) {
        this.pageNumber = header.pageSequenceNo;
        debug26("serial=%s page#=%s, Ogg.id=%s", header.streamSerialNumber, header.pageSequenceNo, header.capturePattern);
        const segmentTable = await tokenizer.readToken(new SegmentTable(header));
        debug26("totalPageSize=%s", segmentTable.totalPageSize);
        const pageData = await tokenizer.readToken(new Uint8ArrayType(segmentTable.totalPageSize));
        debug26("firstPage=%s, lastPage=%s, continued=%s", header.headerType.firstPage, header.headerType.lastPage, header.headerType.continued);
        if (header.headerType.firstPage) {
          this.metadata.setFormat("container", "Ogg");
          const idData = pageData.subarray(0, 7);
          const asciiId = Array.from(idData).filter((b) => b >= 32 && b <= 126).map((b) => String.fromCharCode(b)).join("");
          switch (asciiId) {
            case "vorbis":
              debug26(`Set Ogg stream serial ${header.streamSerialNumber}, codec=Vorbis`);
              this.pageConsumer = new VorbisStream(this.metadata, this.options);
              break;
            case "OpusHea":
              debug26("Set page consumer to Ogg/Opus");
              this.pageConsumer = new OpusStream(this.metadata, this.options, tokenizer);
              break;
            case "Speex  ":
              debug26("Set page consumer to Ogg/Speex");
              this.pageConsumer = new SpeexStream(this.metadata, this.options, tokenizer);
              break;
            case "fishead":
            case "theora":
              debug26("Set page consumer to Ogg/Theora");
              this.pageConsumer = new TheoraStream(this.metadata, this.options, tokenizer);
              break;
            case "FLAC":
              debug26("Set page consumer to Vorbis");
              this.pageConsumer = new FlacStream(this.metadata, this.options, tokenizer);
              break;
            default:
              throw new OggContentError(`Ogg codec not recognized (id=${asciiId}`);
          }
        }
        if (header.headerType.lastPage) {
          this.closed = true;
        }
        if (this.pageConsumer) {
          await this.pageConsumer.parsePage(header, pageData);
        } else
          throw new Error("pageConsumer should be initialized");
      }
    };
    OggParser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.streams = /* @__PURE__ */ new Map();
      }
      /**
       * Parse page
       * @returns {Promise<void>}
       */
      async parse() {
        this.streams = /* @__PURE__ */ new Map();
        let enfOfStream = false;
        let header;
        try {
          do {
            header = await this.tokenizer.readToken(PageHeader);
            if (header.capturePattern !== "OggS")
              throw new OggContentError("Invalid Ogg capture pattern");
            let stream = this.streams.get(header.streamSerialNumber);
            if (!stream) {
              stream = new OggStream(this.metadata, header.streamSerialNumber, this.options);
              this.streams.set(header.streamSerialNumber, stream);
            }
            await stream.parsePage(this.tokenizer, header);
            if (stream.pageNumber > 12 && !(this.options.duration && [...this.streams.values()].find((stream2) => stream2.pageConsumer?.durationOnLastPage))) {
              debug26("Stop processing Ogg stream");
              break;
            }
          } while (![...this.streams.values()].every((item) => item.closed));
        } catch (err) {
          if (err instanceof EndOfStreamError) {
            debug26("Reached end-of-stream");
            enfOfStream = true;
          } else if (err instanceof OggContentError) {
            this.metadata.addWarning(`Corrupt Ogg content at ${this.tokenizer.position}`);
          } else
            throw err;
        }
        for (const stream of this.streams.values()) {
          if (!stream.closed) {
            this.metadata.addWarning(`End-of-stream reached before reaching last page in Ogg stream serial=${stream.streamSerial}`);
            await stream.pageConsumer?.flush();
          }
          stream.pageConsumer?.calculateDuration(enfOfStream);
        }
      }
    };
  }
});

// node_modules/music-metadata/lib/wavpack/WavPackToken.js
function isBitSet3(flags, bitOffset) {
  return getBitAllignedNumber2(flags, bitOffset, 1) === 1;
}
function getBitAllignedNumber2(flags, bitOffset, len) {
  return flags >>> bitOffset & 4294967295 >>> 32 - len;
}
var SampleRates, BlockHeaderToken, MetadataIdToken;
var init_WavPackToken = __esm({
  "node_modules/music-metadata/lib/wavpack/WavPackToken.js"() {
    init_lib3();
    init_FourCC();
    SampleRates = [
      6e3,
      8e3,
      9600,
      11025,
      12e3,
      16e3,
      22050,
      24e3,
      32e3,
      44100,
      48e3,
      64e3,
      88200,
      96e3,
      192e3,
      -1
    ];
    BlockHeaderToken = {
      len: 32,
      get: (buf, off) => {
        const flags = UINT32_LE.get(buf, off + 24);
        const res = {
          // should equal 'wvpk'
          BlockID: FourCcToken.get(buf, off),
          //  0x402 to 0x410 are valid for decode
          blockSize: UINT32_LE.get(buf, off + 4),
          //  0x402 (1026) to 0x410 are valid for decode
          version: UINT16_LE.get(buf, off + 8),
          //  40-bit total samples for entire file (if block_index == 0 and a value of -1 indicates an unknown length)
          totalSamples: (
            /* replace with bigint? (Token.UINT8.get(buf, off + 11) << 32) + */
            UINT32_LE.get(buf, off + 12)
          ),
          // 40-bit block_index
          blockIndex: (
            /* replace with bigint? (Token.UINT8.get(buf, off + 10) << 32) + */
            UINT32_LE.get(buf, off + 16)
          ),
          // 40-bit total samples for entire file (if block_index == 0 and a value of -1 indicates an unknown length)
          blockSamples: UINT32_LE.get(buf, off + 20),
          // various flags for id and decoding
          flags: {
            bitsPerSample: (1 + getBitAllignedNumber2(flags, 0, 2)) * 8,
            isMono: isBitSet3(flags, 2),
            isHybrid: isBitSet3(flags, 3),
            isJointStereo: isBitSet3(flags, 4),
            crossChannel: isBitSet3(flags, 5),
            hybridNoiseShaping: isBitSet3(flags, 6),
            floatingPoint: isBitSet3(flags, 7),
            samplingRate: SampleRates[getBitAllignedNumber2(flags, 23, 4)],
            isDSD: isBitSet3(flags, 31)
          },
          // crc for actual decoded data
          crc: new Uint8ArrayType(4).get(buf, off + 28)
        };
        if (res.flags.isDSD) {
          res.totalSamples *= 8;
        }
        return res;
      }
    };
    MetadataIdToken = {
      len: 1,
      get: (buf, off) => {
        return {
          functionId: getBitAllignedNumber2(buf[off], 0, 6),
          // functionId overlaps with isOptional flag
          isOptional: isBitSet3(buf[off], 5),
          isOddSize: isBitSet3(buf[off], 6),
          largeBlock: isBitSet3(buf[off], 7)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/wavpack/WavPackParser.js
var WavPackParser_exports = {};
__export(WavPackParser_exports, {
  WavPackContentError: () => WavPackContentError,
  WavPackParser: () => WavPackParser
});
var import_debug27, debug27, WavPackContentError, WavPackParser;
var init_WavPackParser = __esm({
  "node_modules/music-metadata/lib/wavpack/WavPackParser.js"() {
    init_lib3();
    init_APEv2Parser();
    init_FourCC();
    init_BasicParser();
    init_WavPackToken();
    import_debug27 = __toESM(require_src(), 1);
    init_uint8array_extras();
    init_ParseError();
    debug27 = (0, import_debug27.default)("music-metadata:parser:WavPack");
    WavPackContentError = class extends makeUnexpectedFileContentError("WavPack") {
    };
    WavPackParser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.audioDataSize = 0;
      }
      async parse() {
        this.metadata.setAudioOnly();
        this.audioDataSize = 0;
        await this.parseWavPackBlocks();
        return tryParseApeHeader(this.metadata, this.tokenizer, this.options);
      }
      async parseWavPackBlocks() {
        do {
          const blockId = await this.tokenizer.peekToken(FourCcToken);
          if (blockId !== "wvpk")
            break;
          const header = await this.tokenizer.readToken(BlockHeaderToken);
          if (header.BlockID !== "wvpk")
            throw new WavPackContentError("Invalid WavPack Block-ID");
          debug27(`WavPack header blockIndex=${header.blockIndex}, len=${BlockHeaderToken.len}`);
          if (header.blockIndex === 0 && !this.metadata.format.container) {
            this.metadata.setFormat("container", "WavPack");
            this.metadata.setFormat("lossless", !header.flags.isHybrid);
            this.metadata.setFormat("bitsPerSample", header.flags.bitsPerSample);
            if (!header.flags.isDSD) {
              this.metadata.setFormat("sampleRate", header.flags.samplingRate);
              this.metadata.setFormat("duration", header.totalSamples / header.flags.samplingRate);
            }
            this.metadata.setFormat("numberOfChannels", header.flags.isMono ? 1 : 2);
            this.metadata.setFormat("numberOfSamples", header.totalSamples);
            this.metadata.setFormat("codec", header.flags.isDSD ? "DSD" : "PCM");
          }
          const ignoreBytes = header.blockSize - (BlockHeaderToken.len - 8);
          await (header.blockIndex === 0 ? this.parseMetadataSubBlock(header, ignoreBytes) : this.tokenizer.ignore(ignoreBytes));
          if (header.blockSamples > 0) {
            this.audioDataSize += header.blockSize;
          }
        } while (!this.tokenizer.fileInfo.size || this.tokenizer.fileInfo.size - this.tokenizer.position >= BlockHeaderToken.len);
        if (this.metadata.format.duration) {
          this.metadata.setFormat("bitrate", this.audioDataSize * 8 / this.metadata.format.duration);
        }
      }
      /**
       * Ref: http://www.wavpack.com/WavPack5FileFormat.pdf, 3.0 Metadata Sub-blocks
       * @param header Header
       * @param remainingLength Remaining length
       */
      async parseMetadataSubBlock(header, remainingLength) {
        let remaining = remainingLength;
        while (remaining > MetadataIdToken.len) {
          const id = await this.tokenizer.readToken(MetadataIdToken);
          const dataSizeInWords = await this.tokenizer.readNumber(id.largeBlock ? UINT24_LE : UINT8);
          const data = new Uint8Array(dataSizeInWords * 2 - (id.isOddSize ? 1 : 0));
          await this.tokenizer.readBuffer(data);
          debug27(`Metadata Sub-Blocks functionId=0x${id.functionId.toString(16)}, id.largeBlock=${id.largeBlock},data-size=${data.length}`);
          switch (id.functionId) {
            case 0:
              break;
            case 14: {
              debug27("ID_DSD_BLOCK");
              const mp = 1 << UINT8.get(data, 0);
              const samplingRate = header.flags.samplingRate * mp * 8;
              if (!header.flags.isDSD)
                throw new WavPackContentError("Only expect DSD block if DSD-flag is set");
              this.metadata.setFormat("sampleRate", samplingRate);
              this.metadata.setFormat("duration", header.totalSamples / samplingRate);
              break;
            }
            case 36:
              debug27("ID_ALT_TRAILER: trailer for non-wav files");
              break;
            case 38:
              this.metadata.setFormat("audioMD5", data);
              break;
            case 47:
              debug27(`ID_BLOCK_CHECKSUM: checksum=${uint8ArrayToHex(data)}`);
              break;
            default:
              debug27(`Ignore unsupported meta-sub-block-id functionId=0x${id.functionId.toString(16)}`);
              break;
          }
          remaining -= MetadataIdToken.len + (id.largeBlock ? UINT24_LE.len : UINT8.len) + dataSizeInWords * 2;
          debug27(`remainingLength=${remaining}`);
          if (id.isOddSize)
            this.tokenizer.ignore(1);
        }
        if (remaining !== 0)
          throw new WavPackContentError("metadata-sub-block should fit it remaining length");
      }
    };
  }
});

// node_modules/music-metadata/lib/riff/RiffChunk.js
var Header6, ListInfoTagValue;
var init_RiffChunk = __esm({
  "node_modules/music-metadata/lib/riff/RiffChunk.js"() {
    init_lib3();
    Header6 = {
      len: 8,
      get: (buf, off) => {
        return {
          // Group-ID
          chunkID: new StringType(4, "latin1").get(buf, off),
          // Size
          chunkSize: UINT32_LE.get(buf, off + 4)
        };
      }
    };
    ListInfoTagValue = class {
      constructor(tagHeader) {
        this.tagHeader = tagHeader;
        this.len = tagHeader.chunkSize;
        this.len += this.len & 1;
      }
      get(buf, off) {
        return new StringType(this.tagHeader.chunkSize, "ascii").get(buf, off);
      }
    };
  }
});

// node_modules/music-metadata/lib/wav/WaveChunk.js
var WaveContentError, WaveFormat, WaveFormatNameMap, Format, FactChunk;
var init_WaveChunk = __esm({
  "node_modules/music-metadata/lib/wav/WaveChunk.js"() {
    init_lib3();
    init_ParseError();
    WaveContentError = class extends makeUnexpectedFileContentError("Wave") {
    };
    WaveFormat = {
      PCM: 1,
      // MPEG-4 and AAC Audio Types
      ADPCM: 2,
      IEEE_FLOAT: 3,
      MPEG_ADTS_AAC: 5632,
      MPEG_LOAS: 5634,
      RAW_AAC1: 255,
      // Dolby Audio Types
      DOLBY_AC3_SPDIF: 146,
      DVM: 8192,
      RAW_SPORT: 576,
      ESST_AC3: 577,
      DRM: 9,
      DTS2: 8193,
      MPEG: 80
    };
    WaveFormatNameMap = {
      [WaveFormat.PCM]: "PCM",
      [WaveFormat.ADPCM]: "ADPCM",
      [WaveFormat.IEEE_FLOAT]: "IEEE_FLOAT",
      [WaveFormat.MPEG_ADTS_AAC]: "MPEG_ADTS_AAC",
      [WaveFormat.MPEG_LOAS]: "MPEG_LOAS",
      [WaveFormat.RAW_AAC1]: "RAW_AAC1",
      [WaveFormat.DOLBY_AC3_SPDIF]: "DOLBY_AC3_SPDIF",
      [WaveFormat.DVM]: "DVM",
      [WaveFormat.RAW_SPORT]: "RAW_SPORT",
      [WaveFormat.ESST_AC3]: "ESST_AC3",
      [WaveFormat.DRM]: "DRM",
      [WaveFormat.DTS2]: "DTS2",
      [WaveFormat.MPEG]: "MPEG"
    };
    Format = class {
      constructor(header) {
        if (header.chunkSize < 16)
          throw new WaveContentError("Invalid chunk size");
        this.len = header.chunkSize;
      }
      get(buf, off) {
        return {
          wFormatTag: UINT16_LE.get(buf, off),
          nChannels: UINT16_LE.get(buf, off + 2),
          nSamplesPerSec: UINT32_LE.get(buf, off + 4),
          nAvgBytesPerSec: UINT32_LE.get(buf, off + 8),
          nBlockAlign: UINT16_LE.get(buf, off + 12),
          wBitsPerSample: UINT16_LE.get(buf, off + 14)
        };
      }
    };
    FactChunk = class {
      constructor(header) {
        if (header.chunkSize < 4) {
          throw new WaveContentError("Invalid fact chunk size.");
        }
        this.len = header.chunkSize;
      }
      get(buf, off) {
        return {
          dwSampleLength: UINT32_LE.get(buf, off)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/wav/BwfChunk.js
var BroadcastAudioExtensionChunk;
var init_BwfChunk = __esm({
  "node_modules/music-metadata/lib/wav/BwfChunk.js"() {
    init_lib3();
    init_Util();
    BroadcastAudioExtensionChunk = {
      len: 420,
      get: (uint8array, off) => {
        return {
          description: stripNulls(new StringType(256, "ascii").get(uint8array, off)).trim(),
          originator: stripNulls(new StringType(32, "ascii").get(uint8array, off + 256)).trim(),
          originatorReference: stripNulls(new StringType(32, "ascii").get(uint8array, off + 288)).trim(),
          originationDate: stripNulls(new StringType(10, "ascii").get(uint8array, off + 320)).trim(),
          originationTime: stripNulls(new StringType(8, "ascii").get(uint8array, off + 330)).trim(),
          timeReferenceLow: UINT32_LE.get(uint8array, off + 338),
          timeReferenceHigh: UINT32_LE.get(uint8array, off + 342),
          version: UINT16_LE.get(uint8array, off + 346),
          umid: new Uint8ArrayType(64).get(uint8array, off + 348),
          loudnessValue: UINT16_LE.get(uint8array, off + 412),
          maxTruePeakLevel: UINT16_LE.get(uint8array, off + 414),
          maxMomentaryLoudness: UINT16_LE.get(uint8array, off + 416),
          maxShortTermLoudness: UINT16_LE.get(uint8array, off + 418)
        };
      }
    };
  }
});

// node_modules/music-metadata/lib/wav/WaveParser.js
var WaveParser_exports = {};
__export(WaveParser_exports, {
  WaveParser: () => WaveParser
});
var import_debug28, debug28, WaveParser;
var init_WaveParser = __esm({
  "node_modules/music-metadata/lib/wav/WaveParser.js"() {
    init_lib();
    init_lib3();
    import_debug28 = __toESM(require_src(), 1);
    init_RiffChunk();
    init_WaveChunk();
    init_ID3v2Parser();
    init_Util();
    init_FourCC();
    init_BasicParser();
    init_BwfChunk();
    init_WaveChunk();
    debug28 = (0, import_debug28.default)("music-metadata:parser:RIFF");
    WaveParser = class extends BasicParser {
      constructor() {
        super(...arguments);
        this.blockAlign = 0;
      }
      async parse() {
        const riffHeader = await this.tokenizer.readToken(Header6);
        debug28(`pos=${this.tokenizer.position}, parse: chunkID=${riffHeader.chunkID}`);
        if (riffHeader.chunkID !== "RIFF")
          return;
        this.metadata.setAudioOnly();
        return this.parseRiffChunk(riffHeader.chunkSize).catch((err) => {
          if (!(err instanceof EndOfStreamError)) {
            throw err;
          }
        });
      }
      async parseRiffChunk(chunkSize) {
        const type = await this.tokenizer.readToken(FourCcToken);
        this.metadata.setFormat("container", type);
        switch (type) {
          case "WAVE":
            return this.readWaveChunk(chunkSize - FourCcToken.len);
          default:
            throw new WaveContentError(`Unsupported RIFF format: RIFF/${type}`);
        }
      }
      async readWaveChunk(remaining) {
        while (remaining >= Header6.len) {
          const header = await this.tokenizer.readToken(Header6);
          remaining -= Header6.len + header.chunkSize;
          if (header.chunkSize > remaining) {
            this.metadata.addWarning("Data chunk size exceeds file size");
          }
          this.header = header;
          debug28(`pos=${this.tokenizer.position}, readChunk: chunkID=RIFF/WAVE/${header.chunkID}`);
          switch (header.chunkID) {
            case "LIST":
              await this.parseListTag(header);
              break;
            case "fact":
              this.metadata.setFormat("lossless", false);
              this.fact = await this.tokenizer.readToken(new FactChunk(header));
              break;
            case "fmt ": {
              const fmt = await this.tokenizer.readToken(new Format(header));
              let subFormat = WaveFormatNameMap[fmt.wFormatTag];
              if (!subFormat) {
                debug28(`WAVE/non-PCM format=${fmt.wFormatTag}`);
                subFormat = `non-PCM (${fmt.wFormatTag})`;
              }
              this.metadata.setFormat("codec", subFormat);
              this.metadata.setFormat("bitsPerSample", fmt.wBitsPerSample);
              this.metadata.setFormat("sampleRate", fmt.nSamplesPerSec);
              this.metadata.setFormat("numberOfChannels", fmt.nChannels);
              this.metadata.setFormat("bitrate", fmt.nBlockAlign * fmt.nSamplesPerSec * 8);
              this.blockAlign = fmt.nBlockAlign;
              break;
            }
            case "id3 ":
            // The way Picard, FooBar currently stores, ID3 meta-data
            case "ID3 ": {
              const id3_data = await this.tokenizer.readToken(new Uint8ArrayType(header.chunkSize));
              const rst = fromBuffer(id3_data);
              await new ID3v2Parser().parse(this.metadata, rst, this.options);
              break;
            }
            case "data": {
              if (this.metadata.format.lossless !== false) {
                this.metadata.setFormat("lossless", true);
              }
              let chunkSize = header.chunkSize;
              if (this.tokenizer.fileInfo.size) {
                const calcRemaining = this.tokenizer.fileInfo.size - this.tokenizer.position;
                if (calcRemaining < chunkSize) {
                  this.metadata.addWarning("data chunk length exceeding file length");
                  chunkSize = calcRemaining;
                }
              }
              const numberOfSamples = this.fact ? this.fact.dwSampleLength : chunkSize === 4294967295 ? void 0 : chunkSize / this.blockAlign;
              if (numberOfSamples) {
                this.metadata.setFormat("numberOfSamples", numberOfSamples);
                if (this.metadata.format.sampleRate) {
                  this.metadata.setFormat("duration", numberOfSamples / this.metadata.format.sampleRate);
                }
              }
              if (this.metadata.format.codec === "ADPCM") {
                this.metadata.setFormat("bitrate", 352e3);
              } else if (this.metadata.format.sampleRate) {
                this.metadata.setFormat("bitrate", this.blockAlign * this.metadata.format.sampleRate * 8);
              }
              await this.tokenizer.ignore(header.chunkSize);
              break;
            }
            case "bext": {
              const bext = await this.tokenizer.readToken(BroadcastAudioExtensionChunk);
              Object.keys(bext).forEach((key) => {
                this.metadata.addTag("exif", `bext.${key}`, bext[key]);
              });
              const bextRemaining = header.chunkSize - BroadcastAudioExtensionChunk.len;
              await this.tokenizer.ignore(bextRemaining);
              break;
            }
            case "\0\0\0\0":
              debug28(`Ignore padding chunk: RIFF/${header.chunkID} of ${header.chunkSize} bytes`);
              this.metadata.addWarning(`Ignore chunk: RIFF/${header.chunkID}`);
              await this.tokenizer.ignore(header.chunkSize);
              break;
            default:
              debug28(`Ignore chunk: RIFF/${header.chunkID} of ${header.chunkSize} bytes`);
              this.metadata.addWarning(`Ignore chunk: RIFF/${header.chunkID}`);
              await this.tokenizer.ignore(header.chunkSize);
          }
          if (this.header.chunkSize % 2 === 1) {
            debug28("Read odd padding byte");
            await this.tokenizer.ignore(1);
          }
        }
      }
      async parseListTag(listHeader) {
        const listType = await this.tokenizer.readToken(new StringType(4, "latin1"));
        debug28("pos=%s, parseListTag: chunkID=RIFF/WAVE/LIST/%s", this.tokenizer.position, listType);
        switch (listType) {
          case "INFO":
            return this.parseRiffInfoTags(listHeader.chunkSize - 4);
          default:
            this.metadata.addWarning(`Ignore chunk: RIFF/WAVE/LIST/${listType}`);
            debug28(`Ignoring chunkID=RIFF/WAVE/LIST/${listType}`);
            return this.tokenizer.ignore(listHeader.chunkSize - 4).then();
        }
      }
      async parseRiffInfoTags(chunkSize) {
        while (chunkSize >= 8) {
          const header = await this.tokenizer.readToken(Header6);
          const valueToken = new ListInfoTagValue(header);
          const value = await this.tokenizer.readToken(valueToken);
          this.addTag(header.chunkID, stripNulls(value));
          chunkSize -= 8 + valueToken.len;
        }
        if (chunkSize !== 0) {
          throw new WaveContentError(`Illegal remaining size: ${chunkSize}`);
        }
      }
      addTag(id, value) {
        this.metadata.addTag("exif", id, value);
      }
    };
  }
});

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.regexpCode = exports2.getEsmExportName = exports2.getProperty = exports2.safeStringify = exports2.stringify = exports2.strConcat = exports2.addCodeArg = exports2.str = exports2._ = exports2.nil = exports2._Code = exports2.Name = exports2.IDENTIFIER = exports2._CodeOrName = void 0;
    var _CodeOrName = class {
    };
    exports2._CodeOrName = _CodeOrName;
    exports2.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      constructor(s) {
        super();
        if (!exports2.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports2.Name = Name;
    var _Code = class extends _CodeOrName {
      constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a;
        return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a;
        return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports2._Code = _Code;
    exports2.nil = new _Code("");
    function _(strs, ...args) {
      const code = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
      }
      return new _Code(code);
    }
    exports2._ = _;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    exports2.str = str;
    function addCodeArg(code, arg) {
      if (arg instanceof _Code)
        code.push(...arg._items);
      else if (arg instanceof Name)
        code.push(arg);
      else
        code.push(interpolate(arg));
    }
    exports2.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    function mergeExprItems(a, b) {
      if (b === '""')
        return a;
      if (a === '""')
        return b;
      if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b != "string")
          return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
          return a.slice(0, -1) + b.slice(1);
        return;
      }
      if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
      return;
    }
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    exports2.strConcat = strConcat;
    function interpolate(x) {
      return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
    }
    function stringify(x) {
      return new _Code(safeStringify(x));
    }
    exports2.stringify = stringify;
    function safeStringify(x) {
      return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    exports2.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports2.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
    }
    exports2.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports2.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    exports2.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    exports2.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ValueScope = exports2.ValueScopeName = exports2.Scope = exports2.varKinds = exports2.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState || (exports2.UsedValueState = UsedValueState = {}));
    exports2.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix) {
        return new code_1.Name(this._newName(prefix));
      }
      _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
      }
      _nameGroup(prefix) {
        var _a, _b;
        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
          throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return this._names[prefix] = { prefix, index: 0 };
      }
    };
    exports2.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports2.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
      }
      value(nameOrPrefix, value) {
        var _a;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix } = name;
        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
        let vs = this._values[prefix];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix, itemIndex });
        return name;
      }
      getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
          if (name.scopePath === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return (0, code_1._)`${scopeName}${name.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
          if (name.value === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return name.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix in values) {
          const vs = values[prefix];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
          vs.forEach((name) => {
            if (nameSet.has(name))
              return;
            nameSet.set(name, UsedValueState.Started);
            let c = valueCode(name);
            if (c) {
              const def = this.opts.es5 ? exports2.varKinds.var : exports2.varKinds.const;
              code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
              code = (0, code_1._)`${code}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name);
            }
            nameSet.set(name, UsedValueState.Completed);
          });
        }
        return code;
      }
    };
    exports2.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.or = exports2.and = exports2.not = exports2.CodeGen = exports2.operators = exports2.varKinds = exports2.ValueScopeName = exports2.ValueScope = exports2.Scope = exports2.Name = exports2.regexpCode = exports2.stringify = exports2.getProperty = exports2.nil = exports2.strConcat = exports2.str = exports2._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports2, "_", { enumerable: true, get: function() {
      return code_2._;
    } });
    Object.defineProperty(exports2, "str", { enumerable: true, get: function() {
      return code_2.str;
    } });
    Object.defineProperty(exports2, "strConcat", { enumerable: true, get: function() {
      return code_2.strConcat;
    } });
    Object.defineProperty(exports2, "nil", { enumerable: true, get: function() {
      return code_2.nil;
    } });
    Object.defineProperty(exports2, "getProperty", { enumerable: true, get: function() {
      return code_2.getProperty;
    } });
    Object.defineProperty(exports2, "stringify", { enumerable: true, get: function() {
      return code_2.stringify;
    } });
    Object.defineProperty(exports2, "regexpCode", { enumerable: true, get: function() {
      return code_2.regexpCode;
    } });
    Object.defineProperty(exports2, "Name", { enumerable: true, get: function() {
      return code_2.Name;
    } });
    var scope_2 = require_scope();
    Object.defineProperty(exports2, "Scope", { enumerable: true, get: function() {
      return scope_2.Scope;
    } });
    Object.defineProperty(exports2, "ValueScope", { enumerable: true, get: function() {
      return scope_2.ValueScope;
    } });
    Object.defineProperty(exports2, "ValueScopeName", { enumerable: true, get: function() {
      return scope_2.ValueScopeName;
    } });
    Object.defineProperty(exports2, "varKinds", { enumerable: true, get: function() {
      return scope_2.varKinds;
    } });
    exports2.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      constructor(error) {
        super();
        this.error = error;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      constructor(code) {
        super();
        this.code = code;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
    };
    var Else = class extends BlockNode {
    };
    Else.kind = "else";
    var If = class _If extends BlockNode {
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code += "else " + this.else.render(opts);
        return code;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof _If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants) {
        var _a;
        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
    };
    For.kind = "for";
    var ForLoop = class extends For {
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
          code += this.catch.render(opts);
        if (this.finally)
          code += this.finally.render(opts);
        return code;
      }
      optimizeNodes() {
        var _a, _b;
        super.optimizeNodes();
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants) {
        var _a, _b;
        super.optimizeNames(names, constants);
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      constructor(error) {
        super();
        this.error = error;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(prefix) {
        return this._scope.name(prefix);
      }
      // reserves unique name in the external scope
      scopeName(prefix) {
        return this._extScope.name(prefix);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
        vs.add(name);
        return name;
      }
      getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant)
          this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
      }
      // `const` declaration (`var` in es5 mode)
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      // `var` declaration with optional assignment
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      // assignment code
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      // `+=` code
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports2.operators.ADD, rhs));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
          if (code.length > 1)
            code.push(",");
          code.push(key);
          if (key !== value || this.opts.es5) {
            code.push(":");
            (0, code_1.addCodeArg)(code, value);
          }
        }
        code.push("}");
        return new code_1._Code(code);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new Else());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      // `for` statement for a range of values
      forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name, (0, code_1._)`${arr}[${i}]`);
            forBody(name);
          });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(For);
      }
      // `label` statement
      label(label) {
        return this._leafNode(new Label(label));
      }
      // `break` statement
      break(label) {
        return this._leafNode(new Break(label));
      }
      // `return` statement
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      // `try` statement
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error = this.name("e");
          this._currNode = node.catch = new Catch(error);
          catchCode(error);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      // `throw` statement
      throw(error) {
        return this._leafNode(new Throw(error));
      }
      // start self-balancing block
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      // end the current self-balancing block
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports2.CodeGen = CodeGen;
    function addNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
      return names;
    }
    function addExprNames(names, from) {
      return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
    }
    function optimizeExpr(expr, names, constants) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0);
      }
    }
    function subtractNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
    }
    function not(x) {
      return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
    }
    exports2.not = not;
    var andCode = mappend(exports2.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    exports2.and = and;
    var orCode = mappend(exports2.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    exports2.or = or;
    function mappend(op) {
      return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
    }
    function par(x) {
      return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
    }
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.checkStrictMode = exports2.getErrorPath = exports2.Type = exports2.useFunc = exports2.setEvaluated = exports2.evaluatedPropsToName = exports2.mergeEvaluated = exports2.eachItem = exports2.unescapeJsonPointer = exports2.escapeJsonPointer = exports2.escapeFragment = exports2.unescapeFragment = exports2.schemaRefOrVal = exports2.schemaHasRulesButRef = exports2.schemaHasRules = exports2.checkUnknownRules = exports2.alwaysValidSchema = exports2.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash = {};
      for (const item of arr)
        hash[item] = true;
      return hash;
    }
    exports2.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    exports2.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    exports2.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    exports2.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    exports2.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    exports2.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    exports2.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    exports2.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    exports2.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    exports2.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x of xs)
          f(x);
      } else {
        f(xs);
      }
    }
    exports2.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
      return (gen, from, to, toName) => {
        const res = to === void 0 ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    exports2.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
        }),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
          if (from === true) {
            gen.assign(to, true);
          } else {
            gen.assign(to, (0, codegen_1._)`${to} || {}`);
            setEvaluated(gen, to, from);
          }
        }),
        mergeValues: (from, to) => from === true ? true : { ...from, ...to },
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)),
        mergeValues: (from, to) => from === true ? true : Math.max(from, to),
        resultToName: (gen, items) => gen.var("items", items)
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    exports2.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true));
    }
    exports2.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    exports2.useFunc = useFunc;
    var Type;
    (function(Type2) {
      Type2[Type2["Num"] = 0] = "Num";
      Type2[Type2["Str"] = 1] = "Str";
    })(Type || (exports2.Type = Type = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    exports2.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    exports2.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      // validation function arguments
      data: new codegen_1.Name("data"),
      // data passed to validation function
      // args passed from referencing schema
      valCxt: new codegen_1.Name("valCxt"),
      // validation/data context - should not be used directly, it is destructured to the names below
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      // root data - same as the data passed to the first/top validation function
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      // used to support recursiveRef and dynamicRef
      // function scoped variables
      vErrors: new codegen_1.Name("vErrors"),
      // null or array of validation errors
      errors: new codegen_1.Name("errors"),
      // counter of validation errors
      this: new codegen_1.Name("this"),
      // "globals"
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      // JTD serialize/parse name for JSON string and position
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports2.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.extendErrors = exports2.resetErrorsCount = exports2.reportExtraError = exports2.reportError = exports2.keyword$DataError = exports2.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports2.keywordError = {
      message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
    };
    exports2.keyword$DataError = {
      message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
    };
    function reportError(cxt, error = exports2.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    exports2.reportError = reportError;
    function reportExtraError(cxt, error = exports2.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    exports2.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    exports2.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err}.data`, data);
        }
      });
    }
    exports2.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    var E = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      // also used in JTD errors
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error, errorPaths);
    }
    function errorObject(cxt, error, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error, keyValues);
      return gen.object(...keyValues);
    }
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E.schemaPath, schPath];
    }
    function extraErrorProps(cxt, { params, message }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
      }
      if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
    }
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.boolOrEmptySchema = exports2.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    exports2.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid, false);
        falseSchemaError(it);
      } else {
        gen.var(valid, true);
      }
    }
    exports2.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getRules = exports2.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x) {
      return typeof x == "string" && jsonTypes.has(x);
    }
    exports2.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    exports2.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.shouldUseRule = exports2.shouldUseGroup = exports2.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self }, type) {
      const group = self.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    exports2.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    exports2.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a;
      return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
    }
    exports2.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reportTypeError = exports2.checkDataTypes = exports2.checkDataType = exports2.coerceAndCheckDataType = exports2.getJSONTypes = exports2.getSchemaTypes = exports2.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType3;
    (function(DataType4) {
      DataType4[DataType4["Correct"] = 0] = "Correct";
      DataType4[DataType4["Wrong"] = 1] = "Wrong";
    })(DataType3 || (exports2.DataType = DataType3 = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    exports2.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    exports2.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType3.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    exports2.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
    }
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    function checkDataType(dataType, data, strictNums, correct = DataType3.Correct) {
      const EQ = correct === DataType3.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType3.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
    }
    exports2.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    exports2.checkDataTypes = checkDataTypes;
    var typeError = {
      message: ({ schema }) => `must be ${schema}`,
      params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    exports2.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    exports2.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateUnion = exports2.validateArray = exports2.usePattern = exports2.callValidateCode = exports2.schemaProperties = exports2.allSchemaProperties = exports2.noPropertyInData = exports2.propertyInData = exports2.isOwnProperty = exports2.hasPropFunc = exports2.reportMissingProp = exports2.checkMissingProp = exports2.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    exports2.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    exports2.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    exports2.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    exports2.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    exports2.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    exports2.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    exports2.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
    }
    exports2.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
    }
    exports2.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    exports2.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    exports2.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid, true);
      validateItems(() => gen.break());
      return valid;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid);
          gen.if((0, codegen_1.not)(valid), notValid);
        });
      }
    }
    exports2.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged)
          gen.if((0, codegen_1.not)(valid));
      }));
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    }
    exports2.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateKeywordUsage = exports2.validSchemaType = exports2.funcKeywordCode = exports2.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid);
      cxt.pass(valid, () => cxt.error(true));
    }
    exports2.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate);
      const valid = gen.let("valid");
      cxt.block$data(valid, validateKeyword);
      cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      function reportErrs(errors) {
        var _a2;
        gen.if((0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== void 0 ? _a2 : valid), errors);
      }
    }
    exports2.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    exports2.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    exports2.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.extendSubschemaMode = exports2.extendSubschemaData = exports2.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    exports2.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
    }
    exports2.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    exports2.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports2, module2) {
    "use strict";
    var traverse = module2.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getSchemaRefs = exports2.resolveUrl = exports2.normalizeId = exports2._getFullPath = exports2.getFullPath = exports2.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    exports2.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p = resolver.parse(id);
      return _getFullPath(resolver, p);
    }
    exports2.getFullPath = getFullPath;
    function _getFullPath(resolver, p) {
      const serialized = resolver.serialize(p);
      return serialized.split("#")[0] + "#";
    }
    exports2._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    exports2.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    exports2.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let innerBaseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          innerBaseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = innerBaseId;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
    }
    exports2.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getData = exports2.KeywordCxt = exports2.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    exports2.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    function subschemaCode(it, valid) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid);
    }
    function schemaCxtHasRules({ schema, self }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self.RULES.all[key])
          return true;
      return false;
    }
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    function subSchemaObjCode(it, valid) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self } = it;
      const { RULES } = self;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
    }
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      narrowSchemaTypes(it, types);
    }
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    function narrowSchemaTypes(it, withTypes) {
      const ts = [];
      for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
          ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
          ts.push("integer");
      }
      it.dataTypes = ts;
    }
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    var KeywordCxt = class {
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid, $dataValid);
          codeBlock();
        });
      }
      check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
          gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid !== codegen_1.nil)
            gen.assign(valid, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
      }
      subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports2.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
    }
    exports2.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var ValidationError = class extends Error {
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports2.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports2.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveSchema = exports2.getCompilingSchema = exports2.resolveRef = exports2.compileSchema = exports2.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports2.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        // TODO can its length be used as dataLevel if nil is removed?
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate });
        validate.errors = null;
        validate.schema = sch.schema;
        validate.schemaEnv = sch;
        if (sch.$async)
          validate.$async = true;
        if (this.opts.code.source === true) {
          validate.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate.source)
            validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
        }
        sch.validate = validate;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    exports2.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    exports2.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    exports2.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    function resolve(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    function resolveSchema(root, ref) {
      const p = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p, schOrRef);
    }
    exports2.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a;
      if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports2, module2) {
    module2.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fast-uri/lib/utils.js"(exports2, module2) {
    "use strict";
    var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
    var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
    var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
    var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
    var isPathCharacter = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
    function stringArrayToHexStripped(input) {
      let acc = "";
      let code = 0;
      let i = 0;
      for (i = 0; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (code === 48) {
          continue;
        }
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
        break;
      }
      for (i += 1; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
      }
      return acc;
    }
    var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
    function consumeIsZone(buffer) {
      buffer.length = 0;
      return true;
    }
    function consumeHextets(buffer, address, output) {
      if (buffer.length) {
        const hex = stringArrayToHexStripped(buffer);
        if (hex !== "") {
          address.push(hex);
        } else {
          output.error = true;
          return false;
        }
        buffer.length = 0;
      }
      return true;
    }
    function getIPV6(input) {
      let tokenCount = 0;
      const output = { error: false, address: "", zone: "" };
      const address = [];
      const buffer = [];
      let endipv6Encountered = false;
      let endIpv6 = false;
      let consume = consumeHextets;
      for (let i = 0; i < input.length; i++) {
        const cursor = input[i];
        if (cursor === "[" || cursor === "]") {
          continue;
        }
        if (cursor === ":") {
          if (endipv6Encountered === true) {
            endIpv6 = true;
          }
          if (!consume(buffer, address, output)) {
            break;
          }
          if (++tokenCount > 7) {
            output.error = true;
            break;
          }
          if (i > 0 && input[i - 1] === ":") {
            endipv6Encountered = true;
          }
          address.push(":");
          continue;
        } else if (cursor === "%") {
          if (!consume(buffer, address, output)) {
            break;
          }
          consume = consumeIsZone;
        } else {
          buffer.push(cursor);
          continue;
        }
      }
      if (buffer.length) {
        if (consume === consumeIsZone) {
          output.zone = buffer.join("");
        } else if (endIpv6) {
          address.push(buffer.join(""));
        } else {
          address.push(stringArrayToHexStripped(buffer));
        }
      }
      output.address = address.join("");
      return output;
    }
    function normalizeIPv6(host) {
      if (findToken(host, ":") < 2) {
        return { host, isIPV6: false };
      }
      const ipv6 = getIPV6(host);
      if (!ipv6.error) {
        let newHost = ipv6.address;
        let escapedHost = ipv6.address;
        if (ipv6.zone) {
          newHost += "%" + ipv6.zone;
          escapedHost += "%25" + ipv6.zone;
        }
        return { host: newHost, isIPV6: true, escapedHost };
      } else {
        return { host, isIPV6: false };
      }
    }
    function findToken(str, token) {
      let ind = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === token) ind++;
      }
      return ind;
    }
    function removeDotSegments(path4) {
      let input = path4;
      const output = [];
      let nextSlash = -1;
      let len = 0;
      while (len = input.length) {
        if (len === 1) {
          if (input === ".") {
            break;
          } else if (input === "/") {
            output.push("/");
            break;
          } else {
            output.push(input);
            break;
          }
        } else if (len === 2) {
          if (input[0] === ".") {
            if (input[1] === ".") {
              break;
            } else if (input[1] === "/") {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === "/") {
            if (input[1] === "." || input[1] === "/") {
              output.push("/");
              break;
            }
          }
        } else if (len === 3) {
          if (input === "/..") {
            if (output.length !== 0) {
              output.pop();
            }
            output.push("/");
            break;
          }
        }
        if (input[0] === ".") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(3);
              continue;
            }
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(2);
              continue;
            } else if (input[2] === ".") {
              if (input[3] === "/") {
                input = input.slice(3);
                if (output.length !== 0) {
                  output.pop();
                }
                continue;
              }
            }
          }
        }
        if ((nextSlash = input.indexOf("/", 1)) === -1) {
          output.push(input);
          break;
        } else {
          output.push(input.slice(0, nextSlash));
          input = input.slice(nextSlash);
        }
      }
      return output.join("");
    }
    var HOST_DELIMS = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" };
    var HOST_DELIM_RE = /[@/?#:]/g;
    var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
    function reescapeHostDelimiters(host, isIP) {
      const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
      re.lastIndex = 0;
      return host.replace(re, (ch) => HOST_DELIMS[ch]);
    }
    function normalizePercentEncoding(input, decodeUnreserved = false) {
      if (input.indexOf("%") === -1) {
        return input;
      }
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decodeUnreserved && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        output += input[i];
      }
      return output;
    }
    function normalizePathEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decoded !== "." && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isPathCharacter(input[i])) {
          output += input[i];
        } else {
          output += escape(input[i]);
        }
      }
      return output;
    }
    function escapePreservingEscapes(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        output += escape(input[i]);
      }
      return output;
    }
    function recomposeAuthority(component) {
      const uriTokens = [];
      if (component.userinfo !== void 0) {
        uriTokens.push(component.userinfo);
        uriTokens.push("@");
      }
      if (component.host !== void 0) {
        let host = unescape(component.host);
        if (!isIPv4(host)) {
          const ipV6res = normalizeIPv6(host);
          if (ipV6res.isIPV6 === true) {
            host = `[${ipV6res.escapedHost}]`;
          } else {
            host = reescapeHostDelimiters(host, false);
          }
        }
        uriTokens.push(host);
      }
      if (typeof component.port === "number" || typeof component.port === "string") {
        uriTokens.push(":");
        uriTokens.push(String(component.port));
      }
      return uriTokens.length ? uriTokens.join("") : void 0;
    }
    module2.exports = {
      nonSimpleDomain,
      recomposeAuthority,
      reescapeHostDelimiters,
      normalizePercentEncoding,
      normalizePathEncoding,
      escapePreservingEscapes,
      removeDotSegments,
      isIPv4,
      isUUID,
      normalizeIPv6,
      stringArrayToHexStripped
    };
  }
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({
  "node_modules/fast-uri/lib/schemes.js"(exports2, module2) {
    "use strict";
    var { isUUID } = require_utils();
    var URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
    var supportedSchemeNames = (
      /** @type {const} */
      [
        "http",
        "https",
        "ws",
        "wss",
        "urn",
        "urn:uuid"
      ]
    );
    function isValidSchemeName(name) {
      return supportedSchemeNames.indexOf(
        /** @type {*} */
        name
      ) !== -1;
    }
    function wsIsSecure(wsComponent) {
      if (wsComponent.secure === true) {
        return true;
      } else if (wsComponent.secure === false) {
        return false;
      } else if (wsComponent.scheme) {
        return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
      } else {
        return false;
      }
    }
    function httpParse(component) {
      if (!component.host) {
        component.error = component.error || "HTTP URIs must have a host.";
      }
      return component;
    }
    function httpSerialize(component) {
      const secure = String(component.scheme).toLowerCase() === "https";
      if (component.port === (secure ? 443 : 80) || component.port === "") {
        component.port = void 0;
      }
      if (!component.path) {
        component.path = "/";
      }
      return component;
    }
    function wsParse(wsComponent) {
      wsComponent.secure = wsIsSecure(wsComponent);
      wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
      wsComponent.path = void 0;
      wsComponent.query = void 0;
      return wsComponent;
    }
    function wsSerialize(wsComponent) {
      if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
        wsComponent.port = void 0;
      }
      if (typeof wsComponent.secure === "boolean") {
        wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
        wsComponent.secure = void 0;
      }
      if (wsComponent.resourceName) {
        const [path4, query] = wsComponent.resourceName.split("?");
        wsComponent.path = path4 && path4 !== "/" ? path4 : void 0;
        wsComponent.query = query;
        wsComponent.resourceName = void 0;
      }
      wsComponent.fragment = void 0;
      return wsComponent;
    }
    function urnParse(urnComponent, options) {
      if (!urnComponent.path) {
        urnComponent.error = "URN can not be parsed";
        return urnComponent;
      }
      const matches = urnComponent.path.match(URN_REG);
      if (matches) {
        const scheme = options.scheme || urnComponent.scheme || "urn";
        urnComponent.nid = matches[1].toLowerCase();
        urnComponent.nss = matches[2];
        const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        urnComponent.path = void 0;
        if (schemeHandler) {
          urnComponent = schemeHandler.parse(urnComponent, options);
        }
      } else {
        urnComponent.error = urnComponent.error || "URN can not be parsed.";
      }
      return urnComponent;
    }
    function urnSerialize(urnComponent, options) {
      if (urnComponent.nid === void 0) {
        throw new Error("URN without nid cannot be serialized");
      }
      const scheme = options.scheme || urnComponent.scheme || "urn";
      const nid = urnComponent.nid.toLowerCase();
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      if (schemeHandler) {
        urnComponent = schemeHandler.serialize(urnComponent, options);
      }
      const uriComponent = urnComponent;
      const nss = urnComponent.nss;
      uriComponent.path = `${nid || options.nid}:${nss}`;
      options.skipEscape = true;
      return uriComponent;
    }
    function urnuuidParse(urnComponent, options) {
      const uuidComponent = urnComponent;
      uuidComponent.uuid = uuidComponent.nss;
      uuidComponent.nss = void 0;
      if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
        uuidComponent.error = uuidComponent.error || "UUID is not valid.";
      }
      return uuidComponent;
    }
    function urnuuidSerialize(uuidComponent) {
      const urnComponent = uuidComponent;
      urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
      return urnComponent;
    }
    var http = (
      /** @type {SchemeHandler} */
      {
        scheme: "http",
        domainHost: true,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var https = (
      /** @type {SchemeHandler} */
      {
        scheme: "https",
        domainHost: http.domainHost,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var ws = (
      /** @type {SchemeHandler} */
      {
        scheme: "ws",
        domainHost: true,
        parse: wsParse,
        serialize: wsSerialize
      }
    );
    var wss = (
      /** @type {SchemeHandler} */
      {
        scheme: "wss",
        domainHost: ws.domainHost,
        parse: ws.parse,
        serialize: ws.serialize
      }
    );
    var urn = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn",
        parse: urnParse,
        serialize: urnSerialize,
        skipNormalize: true
      }
    );
    var urnuuid = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn:uuid",
        parse: urnuuidParse,
        serialize: urnuuidSerialize,
        skipNormalize: true
      }
    );
    var SCHEMES = (
      /** @type {Record<SchemeName, SchemeHandler>} */
      {
        http,
        https,
        ws,
        wss,
        urn,
        "urn:uuid": urnuuid
      }
    );
    Object.setPrototypeOf(SCHEMES, null);
    function getSchemeHandler(scheme) {
      return scheme && (SCHEMES[
        /** @type {SchemeName} */
        scheme
      ] || SCHEMES[
        /** @type {SchemeName} */
        scheme.toLowerCase()
      ]) || void 0;
    }
    module2.exports = {
      wsIsSecure,
      SCHEMES,
      isValidSchemeName,
      getSchemeHandler
    };
  }
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({
  "node_modules/fast-uri/index.js"(exports2, module2) {
    "use strict";
    var { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizePercentEncoding, normalizePathEncoding, escapePreservingEscapes, reescapeHostDelimiters, isIPv4, nonSimpleDomain } = require_utils();
    var { SCHEMES, getSchemeHandler } = require_schemes();
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = /** @type {T} */
        normalizeString(uri, options);
      } else if (typeof uri === "object") {
        uri = /** @type {T} */
        parse(serialize(uri, options), options);
      }
      return uri;
    }
    function resolve(baseURI, relativeURI, options) {
      const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
      const { parsed: baseParsed, malformedAuthorityOrPort: baseMalformed } = parseWithStatus(baseURI, schemelessOptions);
      const { parsed: relativeParsed, malformedAuthorityOrPort: relativeMalformed } = parseWithStatus(relativeURI, schemelessOptions);
      if (baseMalformed || relativeMalformed) {
        throw new Error(baseParsed.error || relativeParsed.error || "URI is malformed.");
      }
      const resolved = resolveComponent(baseParsed, relativeParsed, schemelessOptions, true);
      schemelessOptions.skipEscape = true;
      return serialize(resolved, schemelessOptions);
    }
    function resolveComponent(base, relative, options, skipNormalization) {
      const target = {};
      if (!skipNormalization) {
        base = parse(serialize(base, options), options);
        relative = parse(serialize(relative, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
      } else {
        if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (!relative.path) {
            target.path = base.path;
            if (relative.query !== void 0) {
              target.query = relative.query;
            } else {
              target.query = base.query;
            }
          } else {
            if (relative.path[0] === "/") {
              target.path = removeDotSegments(relative.path);
            } else {
              if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) {
                target.path = "/" + relative.path;
              } else if (!base.path) {
                target.path = relative.path;
              } else {
                target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
              }
              target.path = removeDotSegments(target.path);
            }
            target.query = relative.query;
          }
          target.userinfo = base.userinfo;
          target.host = base.host;
          target.port = base.port;
        }
        target.scheme = base.scheme;
      }
      target.fragment = relative.fragment;
      return target;
    }
    function equal(uriA, uriB, options) {
      const normalizedA = normalizeComparableURI(uriA, options);
      const normalizedB = normalizeComparableURI(uriB, options);
      return normalizedA !== void 0 && normalizedB !== void 0 && normalizedA.toLowerCase() === normalizedB.toLowerCase();
    }
    function serialize(cmpts, opts) {
      const component = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ""
      };
      const options = Object.assign({}, opts);
      const uriTokens = [];
      const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
      if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
      if (component.path !== void 0) {
        if (!options.skipEscape) {
          component.path = escapePreservingEscapes(component.path);
          if (component.scheme !== void 0) {
            component.path = component.path.split("%3A").join(":");
          }
        } else {
          component.path = normalizePercentEncoding(component.path);
        }
      }
      if (options.reference !== "suffix" && component.scheme) {
        uriTokens.push(component.scheme, ":");
      }
      const authority = recomposeAuthority(component);
      if (authority !== void 0) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (component.path && component.path[0] !== "/") {
          uriTokens.push("/");
        }
      }
      if (component.path !== void 0) {
        let s = component.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
          s = removeDotSegments(s);
        }
        if (authority === void 0 && s[0] === "/" && s[1] === "/") {
          s = "/%2F" + s.slice(2);
        }
        uriTokens.push(s);
      }
      if (component.query !== void 0) {
        uriTokens.push("?", component.query);
      }
      if (component.fragment !== void 0) {
        uriTokens.push("#", component.fragment);
      }
      return uriTokens.join("");
    }
    var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    var AUTHORITY_PREFIX = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
    var AUTHORITY_INTRODUCER_REGION = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
    function getParseError(parsed, matches) {
      if (matches[2] !== void 0 && parsed.path && parsed.path[0] !== "/") {
        return 'URI path must start with "/" when authority is present.';
      }
      if (typeof parsed.port === "number" && (parsed.port < 0 || parsed.port > 65535)) {
        return "URI port is malformed.";
      }
      return void 0;
    }
    function parseWithStatus(uri, opts) {
      const options = Object.assign({}, opts);
      const parsed = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0
      };
      let malformedAuthorityOrPort = false;
      let isIP = false;
      if (options.reference === "suffix") {
        if (options.scheme) {
          uri = options.scheme + ":" + uri;
        } else {
          uri = "//" + uri;
        }
      }
      const authorityMatch = uri.match(AUTHORITY_PREFIX);
      if (authorityMatch !== null && authorityMatch[1].indexOf("\\") !== -1) {
        parsed.error = "URI authority must not contain a literal backslash.";
        malformedAuthorityOrPort = true;
      }
      const introducerMatch = uri.match(AUTHORITY_INTRODUCER_REGION);
      if (introducerMatch !== null) {
        const region = introducerMatch[1];
        const normalizedRegion = region.replace(/[\t\n\r]/g, "");
        if (normalizedRegion.length >= 2) {
          if (normalizedRegion.slice(0, 2) !== "//") {
            parsed.error = parsed.error || "URI authority must not contain a literal backslash.";
            malformedAuthorityOrPort = true;
          } else if (region.length !== normalizedRegion.length) {
            parsed.error = parsed.error || "URI authority introducer must not contain whitespace.";
            malformedAuthorityOrPort = true;
          }
        }
      }
      const matches = uri.match(URI_PARSE);
      if (matches) {
        parsed.scheme = matches[1];
        parsed.userinfo = matches[3];
        parsed.host = matches[4];
        parsed.port = parseInt(matches[5], 10);
        parsed.path = matches[6] || "";
        parsed.query = matches[7];
        parsed.fragment = matches[8];
        if (isNaN(parsed.port)) {
          parsed.port = matches[5];
        }
        const parseError = getParseError(parsed, matches);
        if (parseError !== void 0) {
          parsed.error = parsed.error || parseError;
          malformedAuthorityOrPort = true;
        }
        if (parsed.host) {
          const ipv4result = isIPv4(parsed.host);
          if (ipv4result === false) {
            const ipv6result = normalizeIPv6(parsed.host);
            parsed.host = ipv6result.host.toLowerCase();
            isIP = ipv6result.isIPV6;
          } else {
            isIP = true;
          }
        }
        if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
          parsed.reference = "same-document";
        } else if (parsed.scheme === void 0) {
          parsed.reference = "relative";
        } else if (parsed.fragment === void 0) {
          parsed.reference = "absolute";
        } else {
          parsed.reference = "uri";
        }
        if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
          parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
        }
        const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
        if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
          if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
            try {
              parsed.host = new URL("http://" + parsed.host).hostname;
            } catch (e) {
              parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
            }
          }
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
          if (uri.indexOf("%") !== -1) {
            if (parsed.scheme !== void 0) {
              parsed.scheme = unescape(parsed.scheme);
            }
            if (parsed.host !== void 0) {
              parsed.host = reescapeHostDelimiters(unescape(parsed.host), isIP);
            }
          }
          if (parsed.path) {
            parsed.path = normalizePathEncoding(parsed.path);
          }
          if (parsed.fragment) {
            try {
              parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
            } catch {
              parsed.error = parsed.error || "URI malformed";
            }
          }
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(parsed, options);
        }
      } else {
        parsed.error = parsed.error || "URI can not be parsed.";
      }
      return { parsed, malformedAuthorityOrPort };
    }
    function parse(uri, opts) {
      return parseWithStatus(uri, opts).parsed;
    }
    function normalizeString(uri, opts) {
      return normalizeStringWithStatus(uri, opts).normalized;
    }
    function normalizeStringWithStatus(uri, opts) {
      const { parsed, malformedAuthorityOrPort } = parseWithStatus(uri, opts);
      return {
        normalized: malformedAuthorityOrPort ? uri : serialize(parsed, opts),
        malformedAuthorityOrPort
      };
    }
    function normalizeComparableURI(uri, opts) {
      if (typeof uri === "string") {
        const { normalized, malformedAuthorityOrPort } = normalizeStringWithStatus(uri, opts);
        return malformedAuthorityOrPort ? void 0 : normalized;
      }
      if (typeof uri === "object") {
        return serialize(uri, opts);
      }
    }
    var fastUri = {
      SCHEMES,
      normalize,
      resolve,
      resolveComponent,
      equal,
      serialize,
      parse
    };
    module2.exports = fastUri;
    module2.exports.default = fastUri;
    module2.exports.fastUri = fastUri;
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var uri = require_fast_uri();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports2.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CodeGen = exports2.Name = exports2.nil = exports2.stringify = exports2.str = exports2._ = exports2.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports2, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports2, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports2, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports2, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports2, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports2, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports2, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv2 = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = /* @__PURE__ */ Object.create(null);
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta);
        }
        async function _loadSchema(ref) {
          const p = this._loading[ref];
          if (p)
            return p;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey = schemaKeyRef;
            this._cache.delete(cacheKey);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv2.ValidationError = validation_error_1.default;
    Ajv2.MissingRefError = ref_error_1.default;
    exports2.default = Ajv2;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.callRef = exports2.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
          const v = getValidate(cxt, sch);
          callRef(cxt, v, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid);
        }
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    exports2.getValidate = getValidate;
    function callRef(cxt, v, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
          addEvaluatedFrom(v);
          if (!allErrors)
            gen.assign(valid, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid, false);
        });
        cxt.ok(valid);
      }
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
      }
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      function addEvaluatedFrom(source) {
        var _a;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
    }
    exports2.callRef = callRef;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports2.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
      params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports2.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var util_1 = require_util();
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        if ($data) {
          const { regExp } = it.opts.code;
          const regExpCode = regExp.code === "new RegExp" ? (0, codegen_1._)`new RegExp` : (0, util_1.useFunc)(gen, regExp);
          const valid = gen.let("valid");
          gen.try(() => gen.assign(valid, (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`), () => gen.assign(valid, false));
          cxt.fail$data((0, codegen_1._)`!${valid}`);
        } else {
          const regExp = (0, code_1.usePattern)(cxt, schema);
          cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
      params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid = gen.let("valid", true);
            cxt.block$data(valid, () => loopUntilMissing(missing, valid));
            cxt.ok(valid);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        function loopUntilMissing(missing, valid) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports2.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: ({ params: { i, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
      params: ({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j = gen.let("j");
          cxt.setParams({ i, j });
          gen.assign(valid, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        function loopN2(i, j) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
            cxt.error();
            gen.assign(valid, false).break(outer);
          })));
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to constant",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
    };
    var def = {
      keyword: "const",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
        let valid;
        if (useLoop || $data) {
          valid = gen.let("valid");
          cxt.block$data(valid, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
          gen.assign(valid, false);
          gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      // number
      limitNumber_1.default,
      multipleOf_1.default,
      // string
      limitLength_1.default,
      pattern_1.default,
      // object
      limitProperties_1.default,
      required_1.default,
      // array
      limitItems_1.default,
      uniqueItems_1.default,
      // any
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports2.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
      }
      function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
      }
    }
    exports2.validateAdditionalItems = validateAdditionalItems;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid));
        cxt.ok(valid);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
    }
    exports2.validateTuple = validateTuple;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
      params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid, () => gen.if(valid, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid, false);
          validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
            if (min === 1)
              gen.assign(valid, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
          }
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateSchemaDeps = exports2.validatePropertyDeps = exports2.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports2.error = {
      message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      },
      params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
      // TODO change to reference
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports2.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    exports2.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if(
          (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
          () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
          },
          () => gen.var(valid, true)
          // TODO var
        );
        cxt.ok(valid);
      }
    }
    exports2.validateSchemaDeps = validateSchemaDeps;
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "property name must be valid",
      params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid);
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error = {
      message: "must NOT have additional properties",
      params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._)`${key} === ${p}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid, false);
              gen.if((0, codegen_1.not)(valid), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          }
        }
        function applyAdditionalSchema(key, valid, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
        if (properties.length === 0)
          return;
        const valid = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid);
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid, true);
              validateProperties(pat);
              gen.if(valid);
            }
          }
        }
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid), () => gen.break());
              }
            });
          });
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "must match exactly one schema in oneOf",
      params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
          cxt.ok(valid);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
      params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid, schValid);
            cxt.mergeValidEvaluated(schCxt, valid);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    exports2.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
        }
        function validateFormat() {
          const formatDef = self.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
          }
          function getFormat(fmtDef) {
            const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports2.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.contentVocabulary = exports2.metadataVocabulary = void 0;
    exports2.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports2.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft7.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft7Vocabularies = [
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary
    ];
    exports2.default = draft7Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError || (exports2.DiscrError = DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var ref_error_1 = require_ref_error();
    var util_1 = require_util();
    var error = {
      message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
      params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
            gen.assign(valid, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
          gen.endIf();
        }
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        function getMapping() {
          var _a;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              const ref = sch.$ref;
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
              if (sch === void 0)
                throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
            }
            const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required }) {
            return Array.isArray(required) && required.includes(tagName);
          }
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
        }
      }
    };
    exports2.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports2, module2) {
    module2.exports = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "http://json-schema.org/draft-07/schema#",
      title: "Core schema meta-schema",
      definitions: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $ref: "#" }
        },
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      },
      type: ["object", "boolean"],
      properties: {
        $id: {
          type: "string",
          format: "uri-reference"
        },
        $schema: {
          type: "string",
          format: "uri"
        },
        $ref: {
          type: "string",
          format: "uri-reference"
        },
        $comment: {
          type: "string"
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        readOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/definitions/nonNegativeInteger" },
        minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        additionalItems: { $ref: "#" },
        items: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
          default: true
        },
        maxItems: { $ref: "#/definitions/nonNegativeInteger" },
        minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        contains: { $ref: "#" },
        maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
        minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: { $ref: "#" },
        definitions: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependencies: {
          type: "object",
          additionalProperties: {
            anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
          }
        },
        propertyNames: { $ref: "#" },
        const: true,
        enum: {
          type: "array",
          items: true,
          minItems: 1,
          uniqueItems: true
        },
        type: {
          anyOf: [
            { $ref: "#/definitions/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/definitions/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        format: { type: "string" },
        contentMediaType: { type: "string" },
        contentEncoding: { type: "string" },
        if: { $ref: "#" },
        then: { $ref: "#" },
        else: { $ref: "#" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" }
      },
      default: true
    };
  }
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({
  "node_modules/ajv/dist/ajv.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MissingRefError = exports2.ValidationError = exports2.CodeGen = exports2.Name = exports2.nil = exports2.stringify = exports2.str = exports2._ = exports2.KeywordCxt = exports2.Ajv = void 0;
    var core_1 = require_core();
    var draft7_1 = require_draft7();
    var discriminator_1 = require_discriminator();
    var draft7MetaSchema = require_json_schema_draft_07();
    var META_SUPPORT_DATA = ["/properties"];
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
    var Ajv2 = class extends core_1.default {
      _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
          return;
        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports2.Ajv = Ajv2;
    module2.exports = exports2 = Ajv2;
    module2.exports.Ajv = Ajv2;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = Ajv2;
    var validate_1 = require_validate();
    Object.defineProperty(exports2, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports2, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports2, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports2, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports2, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports2, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports2, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports2, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports2, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// ../nexus-plugins/musica/src/backend.ts
var backend_exports = {};
__export(backend_exports, {
  default: () => backend_default
});
module.exports = __toCommonJS(backend_exports);
var import_node_fs2 = __toESM(require("node:fs"));
var import_promises3 = __toESM(require("node:fs/promises"));

// ../nexus-plugins/musica/src/audio-indexing.ts
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));

// node_modules/music-metadata/lib/index.js
init_lib();
var import_debug30 = __toESM(require_src(), 1);

// node_modules/music-metadata/lib/core.js
init_lib();

// node_modules/file-type/index.js
init_lib();

// node_modules/file-type/core.js
init_lib3();
init_core();

// node_modules/@tokenizer/inflate/lib/ZipHandler.js
init_lib3();
var import_debug = __toESM(require_src(), 1);

// node_modules/@tokenizer/inflate/lib/ZipToken.js
init_lib3();
var Signature = {
  LocalFileHeader: 67324752,
  DataDescriptor: 134695760,
  CentralFileHeader: 33639248,
  EndOfCentralDirectory: 101010256
};
var DataDescriptor = {
  get(array) {
    return {
      signature: UINT32_LE.get(array, 0),
      compressedSize: UINT32_LE.get(array, 8),
      uncompressedSize: UINT32_LE.get(array, 12)
    };
  },
  len: 16
};
var LocalFileHeaderToken = {
  get(array) {
    const flags = UINT16_LE.get(array, 6);
    return {
      signature: UINT32_LE.get(array, 0),
      minVersion: UINT16_LE.get(array, 4),
      dataDescriptor: !!(flags & 8),
      compressedMethod: UINT16_LE.get(array, 8),
      compressedSize: UINT32_LE.get(array, 18),
      uncompressedSize: UINT32_LE.get(array, 22),
      filenameLength: UINT16_LE.get(array, 26),
      extraFieldLength: UINT16_LE.get(array, 28),
      filename: null
    };
  },
  len: 30
};
var EndOfCentralDirectoryRecordToken = {
  get(array) {
    return {
      signature: UINT32_LE.get(array, 0),
      nrOfThisDisk: UINT16_LE.get(array, 4),
      nrOfThisDiskWithTheStart: UINT16_LE.get(array, 6),
      nrOfEntriesOnThisDisk: UINT16_LE.get(array, 8),
      nrOfEntriesOfSize: UINT16_LE.get(array, 10),
      sizeOfCd: UINT32_LE.get(array, 12),
      offsetOfStartOfCd: UINT32_LE.get(array, 16),
      zipFileCommentLength: UINT16_LE.get(array, 20)
    };
  },
  len: 22
};
var FileHeader = {
  get(array) {
    const flags = UINT16_LE.get(array, 8);
    return {
      signature: UINT32_LE.get(array, 0),
      minVersion: UINT16_LE.get(array, 6),
      dataDescriptor: !!(flags & 8),
      compressedMethod: UINT16_LE.get(array, 10),
      compressedSize: UINT32_LE.get(array, 20),
      uncompressedSize: UINT32_LE.get(array, 24),
      filenameLength: UINT16_LE.get(array, 28),
      extraFieldLength: UINT16_LE.get(array, 30),
      fileCommentLength: UINT16_LE.get(array, 32),
      relativeOffsetOfLocalHeader: UINT32_LE.get(array, 42),
      filename: null
    };
  },
  len: 46
};

// node_modules/@tokenizer/inflate/lib/ZipHandler.js
function signatureToArray(signature) {
  const signatureBytes = new Uint8Array(UINT32_LE.len);
  UINT32_LE.put(signatureBytes, 0, signature);
  return signatureBytes;
}
var debug = (0, import_debug.default)("tokenizer:inflate");
var syncBufferSize = 256 * 1024;
var ddSignatureArray = signatureToArray(Signature.DataDescriptor);
var eocdSignatureBytes = signatureToArray(Signature.EndOfCentralDirectory);
var ZipHandler = class _ZipHandler {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.syncBuffer = new Uint8Array(syncBufferSize);
  }
  async isZip() {
    return await this.peekSignature() === Signature.LocalFileHeader;
  }
  peekSignature() {
    return this.tokenizer.peekToken(UINT32_LE);
  }
  async findEndOfCentralDirectoryLocator() {
    const randomReadTokenizer = this.tokenizer;
    const chunkLength = Math.min(16 * 1024, randomReadTokenizer.fileInfo.size);
    const buffer = this.syncBuffer.subarray(0, chunkLength);
    await this.tokenizer.readBuffer(buffer, { position: randomReadTokenizer.fileInfo.size - chunkLength });
    for (let i = buffer.length - 4; i >= 0; i--) {
      if (buffer[i] === eocdSignatureBytes[0] && buffer[i + 1] === eocdSignatureBytes[1] && buffer[i + 2] === eocdSignatureBytes[2] && buffer[i + 3] === eocdSignatureBytes[3]) {
        return randomReadTokenizer.fileInfo.size - chunkLength + i;
      }
    }
    return -1;
  }
  async readCentralDirectory() {
    if (!this.tokenizer.supportsRandomAccess()) {
      debug("Cannot reading central-directory without random-read support");
      return;
    }
    debug("Reading central-directory...");
    const pos = this.tokenizer.position;
    const offset = await this.findEndOfCentralDirectoryLocator();
    if (offset > 0) {
      debug("Central-directory 32-bit signature found");
      const eocdHeader = await this.tokenizer.readToken(EndOfCentralDirectoryRecordToken, offset);
      const files = [];
      this.tokenizer.setPosition(eocdHeader.offsetOfStartOfCd);
      for (let n = 0; n < eocdHeader.nrOfEntriesOfSize; ++n) {
        const entry = await this.tokenizer.readToken(FileHeader);
        if (entry.signature !== Signature.CentralFileHeader) {
          throw new Error("Expected Central-File-Header signature");
        }
        entry.filename = await this.tokenizer.readToken(new StringType(entry.filenameLength, "utf-8"));
        await this.tokenizer.ignore(entry.extraFieldLength);
        await this.tokenizer.ignore(entry.fileCommentLength);
        files.push(entry);
        debug(`Add central-directory file-entry: n=${n + 1}/${files.length}: filename=${files[n].filename}`);
      }
      this.tokenizer.setPosition(pos);
      return files;
    }
    this.tokenizer.setPosition(pos);
  }
  async unzip(fileCb) {
    const entries = await this.readCentralDirectory();
    if (entries) {
      return this.iterateOverCentralDirectory(entries, fileCb);
    }
    let stop = false;
    do {
      const zipHeader = await this.readLocalFileHeader();
      if (!zipHeader)
        break;
      const next = fileCb(zipHeader);
      stop = !!next.stop;
      let fileData;
      await this.tokenizer.ignore(zipHeader.extraFieldLength);
      if (zipHeader.dataDescriptor && zipHeader.compressedSize === 0) {
        const chunks = [];
        let len = syncBufferSize;
        debug("Compressed-file-size unknown, scanning for next data-descriptor-signature....");
        let nextHeaderIndex = -1;
        while (nextHeaderIndex < 0 && len === syncBufferSize) {
          len = await this.tokenizer.peekBuffer(this.syncBuffer, { mayBeLess: true });
          nextHeaderIndex = indexOf(this.syncBuffer.subarray(0, len), ddSignatureArray);
          const size = nextHeaderIndex >= 0 ? nextHeaderIndex : len;
          if (next.handler) {
            const data = new Uint8Array(size);
            await this.tokenizer.readBuffer(data);
            chunks.push(data);
          } else {
            await this.tokenizer.ignore(size);
          }
        }
        debug(`Found data-descriptor-signature at pos=${this.tokenizer.position}`);
        if (next.handler) {
          await this.inflate(zipHeader, mergeArrays(chunks), next.handler);
        }
      } else {
        if (next.handler) {
          debug(`Reading compressed-file-data: ${zipHeader.compressedSize} bytes`);
          fileData = new Uint8Array(zipHeader.compressedSize);
          await this.tokenizer.readBuffer(fileData);
          await this.inflate(zipHeader, fileData, next.handler);
        } else {
          debug(`Ignoring compressed-file-data: ${zipHeader.compressedSize} bytes`);
          await this.tokenizer.ignore(zipHeader.compressedSize);
        }
      }
      debug(`Reading data-descriptor at pos=${this.tokenizer.position}`);
      if (zipHeader.dataDescriptor) {
        const dataDescriptor = await this.tokenizer.readToken(DataDescriptor);
        if (dataDescriptor.signature !== 134695760) {
          throw new Error(`Expected data-descriptor-signature at position ${this.tokenizer.position - DataDescriptor.len}`);
        }
      }
    } while (!stop);
  }
  async iterateOverCentralDirectory(entries, fileCb) {
    for (const fileHeader of entries) {
      const next = fileCb(fileHeader);
      if (next.handler) {
        this.tokenizer.setPosition(fileHeader.relativeOffsetOfLocalHeader);
        const zipHeader = await this.readLocalFileHeader();
        if (zipHeader) {
          await this.tokenizer.ignore(zipHeader.extraFieldLength);
          const fileData = new Uint8Array(fileHeader.compressedSize);
          await this.tokenizer.readBuffer(fileData);
          await this.inflate(zipHeader, fileData, next.handler);
        }
      }
      if (next.stop)
        break;
    }
  }
  async inflate(zipHeader, fileData, cb) {
    if (zipHeader.compressedMethod === 0) {
      return cb(fileData);
    }
    if (zipHeader.compressedMethod !== 8) {
      throw new Error(`Unsupported ZIP compression method: ${zipHeader.compressedMethod}`);
    }
    debug(`Decompress filename=${zipHeader.filename}, compressed-size=${fileData.length}`);
    const uncompressedData = await _ZipHandler.decompressDeflateRaw(fileData);
    return cb(uncompressedData);
  }
  static async decompressDeflateRaw(data) {
    const input = new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      }
    });
    const ds = new DecompressionStream("deflate-raw");
    const output = input.pipeThrough(ds);
    try {
      const response = new Response(output);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (err) {
      const message = err instanceof Error ? `Failed to deflate ZIP entry: ${err.message}` : "Unknown decompression error in ZIP entry";
      throw new TypeError(message);
    }
  }
  async readLocalFileHeader() {
    const signature = await this.tokenizer.peekToken(UINT32_LE);
    if (signature === Signature.LocalFileHeader) {
      const header = await this.tokenizer.readToken(LocalFileHeaderToken);
      header.filename = await this.tokenizer.readToken(new StringType(header.filenameLength, "utf-8"));
      return header;
    }
    if (signature === Signature.CentralFileHeader) {
      return false;
    }
    if (signature === 3759263696) {
      throw new Error("Encrypted ZIP");
    }
    throw new Error("Unexpected signature");
  }
};
function indexOf(buffer, portion) {
  const bufferLength = buffer.length;
  const portionLength = portion.length;
  if (portionLength > bufferLength)
    return -1;
  for (let i = 0; i <= bufferLength - portionLength; i++) {
    let found = true;
    for (let j = 0; j < portionLength; j++) {
      if (buffer[i + j] !== portion[j]) {
        found = false;
        break;
      }
    }
    if (found) {
      return i;
    }
  }
  return -1;
}
function mergeArrays(chunks) {
  const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
  const mergedArray = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    mergedArray.set(chunk, offset);
    offset += chunk.length;
  }
  return mergedArray;
}

// node_modules/@tokenizer/inflate/lib/GzipHandler.js
var GzipHandler = class {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
  }
  inflate() {
    const tokenizer = this.tokenizer;
    return new ReadableStream({
      async pull(controller) {
        const buffer = new Uint8Array(1024);
        const size = await tokenizer.readBuffer(buffer, { mayBeLess: true });
        if (size === 0) {
          controller.close();
          return;
        }
        controller.enqueue(buffer.subarray(0, size));
      }
    }).pipeThrough(new DecompressionStream("gzip"));
  }
};

// node_modules/file-type/core.js
init_uint8array_extras();

// node_modules/file-type/util.js
init_lib3();
function stringToBytes(string, encoding) {
  if (encoding === "utf-16le") {
    const bytes = [];
    for (let index = 0; index < string.length; index++) {
      const code = string.charCodeAt(index);
      bytes.push(code & 255, code >> 8 & 255);
    }
    return bytes;
  }
  if (encoding === "utf-16be") {
    const bytes = [];
    for (let index = 0; index < string.length; index++) {
      const code = string.charCodeAt(index);
      bytes.push(code >> 8 & 255, code & 255);
    }
    return bytes;
  }
  return [...string].map((character) => character.charCodeAt(0));
}
function tarHeaderChecksumMatches(arrayBuffer, offset = 0) {
  const readSum = Number.parseInt(new StringType(6).get(arrayBuffer, 148).replace(/\0.*$/, "").trim(), 8);
  if (Number.isNaN(readSum)) {
    return false;
  }
  let sum = 8 * 32;
  for (let index = offset; index < offset + 148; index++) {
    sum += arrayBuffer[index];
  }
  for (let index = offset + 156; index < offset + 512; index++) {
    sum += arrayBuffer[index];
  }
  return readSum === sum;
}
var uint32SyncSafeToken = {
  get: (buffer, offset) => buffer[offset + 3] & 127 | buffer[offset + 2] << 7 | buffer[offset + 1] << 14 | buffer[offset] << 21,
  len: 4
};

// node_modules/file-type/supported.js
var extensions = [
  "jpg",
  "png",
  "apng",
  "gif",
  "webp",
  "flif",
  "xcf",
  "cr2",
  "cr3",
  "orf",
  "arw",
  "dng",
  "nef",
  "rw2",
  "raf",
  "tif",
  "bmp",
  "icns",
  "jxr",
  "psd",
  "indd",
  "zip",
  "tar",
  "rar",
  "gz",
  "bz2",
  "7z",
  "dmg",
  "mp4",
  "mid",
  "mkv",
  "webm",
  "mov",
  "avi",
  "mpg",
  "mp2",
  "mp3",
  "m4a",
  "oga",
  "ogg",
  "ogv",
  "opus",
  "flac",
  "wav",
  "spx",
  "amr",
  "pdf",
  "epub",
  "elf",
  "macho",
  "exe",
  "swf",
  "rtf",
  "wasm",
  "woff",
  "woff2",
  "eot",
  "ttf",
  "otf",
  "ttc",
  "ico",
  "flv",
  "ps",
  "xz",
  "sqlite",
  "nes",
  "crx",
  "xpi",
  "cab",
  "deb",
  "ar",
  "rpm",
  "Z",
  "lz",
  "cfb",
  "mxf",
  "mts",
  "blend",
  "bpg",
  "docx",
  "pptx",
  "xlsx",
  "3gp",
  "3g2",
  "j2c",
  "jp2",
  "jpm",
  "jpx",
  "mj2",
  "aif",
  "qcp",
  "odt",
  "ods",
  "odp",
  "xml",
  "mobi",
  "heic",
  "cur",
  "ktx",
  "ape",
  "wv",
  "dcm",
  "ics",
  "glb",
  "pcap",
  "dsf",
  "lnk",
  "alias",
  "voc",
  "ac3",
  "m4v",
  "m4p",
  "m4b",
  "f4v",
  "f4p",
  "f4b",
  "f4a",
  "mie",
  "asf",
  "ogm",
  "ogx",
  "mpc",
  "arrow",
  "shp",
  "aac",
  "mp1",
  "it",
  "s3m",
  "xm",
  "skp",
  "avif",
  "eps",
  "lzh",
  "pgp",
  "asar",
  "stl",
  "chm",
  "3mf",
  "zst",
  "jxl",
  "vcf",
  "jls",
  "pst",
  "dwg",
  "parquet",
  "class",
  "arj",
  "cpio",
  "ace",
  "avro",
  "icc",
  "fbx",
  "vsdx",
  "vtt",
  "apk",
  "drc",
  "lz4",
  "potx",
  "xltx",
  "dotx",
  "xltm",
  "ott",
  "ots",
  "otp",
  "odg",
  "otg",
  "xlsm",
  "docm",
  "dotm",
  "potm",
  "pptm",
  "jar",
  "jmp",
  "rm",
  "sav",
  "ppsm",
  "ppsx",
  "tar.gz",
  "reg",
  "dat"
];
var mimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/flif",
  "image/x-xcf",
  "image/x-canon-cr2",
  "image/x-canon-cr3",
  "image/tiff",
  "image/bmp",
  "image/vnd.ms-photo",
  "image/vnd.adobe.photoshop",
  "application/x-indesign",
  "application/epub+zip",
  "application/x-xpinstall",
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  "application/zip",
  "application/x-tar",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-bzip2",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/vnd.apache.arrow.file",
  "video/mp4",
  "audio/midi",
  "video/matroska",
  "video/webm",
  "video/quicktime",
  "video/vnd.avi",
  "audio/wav",
  "audio/qcelp",
  "audio/x-ms-asf",
  "video/x-ms-asf",
  "application/vnd.ms-asf",
  "video/mpeg",
  "video/3gpp",
  "audio/mpeg",
  "audio/mp4",
  // RFC 4337
  "video/ogg",
  "audio/ogg",
  "audio/ogg; codecs=opus",
  "application/ogg",
  "audio/flac",
  "audio/ape",
  "audio/wavpack",
  "audio/amr",
  "application/pdf",
  "application/x-elf",
  "application/x-mach-binary",
  "application/x-msdownload",
  "application/x-shockwave-flash",
  "application/rtf",
  "application/wasm",
  "font/woff",
  "font/woff2",
  "application/vnd.ms-fontobject",
  "font/ttf",
  "font/otf",
  "font/collection",
  "image/x-icon",
  "video/x-flv",
  "application/postscript",
  "application/eps",
  "application/x-xz",
  "application/x-sqlite3",
  "application/x-nintendo-nes-rom",
  "application/x-google-chrome-extension",
  "application/vnd.ms-cab-compressed",
  "application/x-deb",
  "application/x-unix-archive",
  "application/x-rpm",
  "application/x-compress",
  "application/x-lzip",
  "application/x-cfb",
  "application/x-mie",
  "application/mxf",
  "video/mp2t",
  "application/x-blender",
  "image/bpg",
  "image/j2c",
  "image/jp2",
  "image/jpx",
  "image/jpm",
  "image/mj2",
  "audio/aiff",
  "application/xml",
  "application/x-mobipocket-ebook",
  "image/heif",
  "image/heif-sequence",
  "image/heic",
  "image/heic-sequence",
  "image/icns",
  "image/ktx",
  "application/dicom",
  "audio/x-musepack",
  "text/calendar",
  "text/vcard",
  "text/vtt",
  "model/gltf-binary",
  "application/vnd.tcpdump.pcap",
  "audio/x-dsf",
  // Non-standard
  "application/x.ms.shortcut",
  // Invented by us
  "application/x.apple.alias",
  // Invented by us
  "audio/x-voc",
  "audio/vnd.dolby.dd-raw",
  "audio/x-m4a",
  "image/apng",
  "image/x-olympus-orf",
  "image/x-sony-arw",
  "image/x-adobe-dng",
  "image/x-nikon-nef",
  "image/x-panasonic-rw2",
  "image/x-fujifilm-raf",
  "video/x-m4v",
  "video/3gpp2",
  "application/x-esri-shape",
  "audio/aac",
  "audio/x-it",
  "audio/x-s3m",
  "audio/x-xm",
  "video/MP1S",
  "video/MP2P",
  "application/vnd.sketchup.skp",
  "image/avif",
  "application/x-lzh-compressed",
  "application/pgp-encrypted",
  "application/x-asar",
  "model/stl",
  "application/vnd.ms-htmlhelp",
  "model/3mf",
  "image/jxl",
  "application/zstd",
  "image/jls",
  "application/vnd.ms-outlook",
  "image/vnd.dwg",
  "application/vnd.apache.parquet",
  "application/java-vm",
  "application/x-arj",
  "application/x-cpio",
  "application/x-ace-compressed",
  "application/avro",
  "application/vnd.iccprofile",
  "application/x.autodesk.fbx",
  // Invented by us
  "application/vnd.visio",
  "application/vnd.android.package-archive",
  "application/vnd.google.draco",
  // Invented by us
  "application/x-lz4",
  // Invented by us
  "application/vnd.openxmlformats-officedocument.presentationml.template",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  "application/vnd.ms-excel.template.macroenabled.12",
  "application/vnd.oasis.opendocument.text-template",
  "application/vnd.oasis.opendocument.spreadsheet-template",
  "application/vnd.oasis.opendocument.presentation-template",
  "application/vnd.oasis.opendocument.graphics",
  "application/vnd.oasis.opendocument.graphics-template",
  "application/vnd.ms-excel.sheet.macroenabled.12",
  "application/vnd.ms-word.document.macroenabled.12",
  "application/vnd.ms-word.template.macroenabled.12",
  "application/vnd.ms-powerpoint.template.macroenabled.12",
  "application/vnd.ms-powerpoint.presentation.macroenabled.12",
  "application/java-archive",
  "application/vnd.rn-realmedia",
  "application/x-spss-sav",
  "application/x-ms-regedit",
  "application/x-ft-windows-registry-hive",
  "application/x-jmp-data"
];

// node_modules/file-type/core.js
var reasonableDetectionSizeInBytes = 4100;
var maximumMpegOffsetTolerance = reasonableDetectionSizeInBytes - 2;
var maximumZipEntrySizeInBytes = 1024 * 1024;
var maximumZipEntryCount = 1024;
var maximumZipBufferedReadSizeInBytes = 2 ** 31 - 1;
var maximumUntrustedSkipSizeInBytes = 16 * 1024 * 1024;
var maximumUnknownSizePayloadProbeSizeInBytes = maximumZipEntrySizeInBytes;
var maximumZipTextEntrySizeInBytes = maximumZipEntrySizeInBytes;
var maximumNestedGzipDetectionSizeInBytes = maximumUntrustedSkipSizeInBytes;
var maximumNestedGzipProbeDepth = 1;
var unknownSizeGzipProbeTimeoutInMilliseconds = 100;
var maximumId3HeaderSizeInBytes = maximumUntrustedSkipSizeInBytes;
var maximumEbmlDocumentTypeSizeInBytes = 64;
var maximumEbmlElementPayloadSizeInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
var maximumEbmlElementCount = 256;
var maximumPngChunkCount = 512;
var maximumPngStreamScanBudgetInBytes = maximumUntrustedSkipSizeInBytes;
var maximumAsfHeaderObjectCount = 512;
var maximumTiffTagCount = 512;
var maximumDetectionReentryCount = 256;
var maximumPngChunkSizeInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
var maximumAsfHeaderPayloadSizeInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
var maximumTiffStreamIfdOffsetInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
var maximumTiffIfdOffsetInBytes = maximumUntrustedSkipSizeInBytes;
var recoverableZipErrorMessages = /* @__PURE__ */ new Set([
  "Unexpected signature",
  "Encrypted ZIP",
  "Expected Central-File-Header signature"
]);
var recoverableZipErrorMessagePrefixes = [
  "ZIP entry count exceeds ",
  "Unsupported ZIP compression method:",
  "ZIP entry compressed data exceeds ",
  "ZIP entry decompressed data exceeds ",
  "Expected data-descriptor-signature at position "
];
var recoverableZipErrorCodes = /* @__PURE__ */ new Set([
  "Z_BUF_ERROR",
  "Z_DATA_ERROR",
  "ERR_INVALID_STATE"
]);
var ParserHardLimitError = class extends Error {
};
function patchWebByobTokenizerClose(tokenizer) {
  const streamReader = tokenizer?.streamReader;
  if (streamReader?.constructor?.name !== "WebStreamByobReader") {
    return tokenizer;
  }
  const { reader } = streamReader;
  const cancelAndRelease = async () => {
    await reader.cancel();
    reader.releaseLock();
  };
  streamReader.close = cancelAndRelease;
  streamReader.abort = async () => {
    streamReader.interrupted = true;
    await cancelAndRelease();
  };
  return tokenizer;
}
function getSafeBound(value, maximum, reason) {
  if (!Number.isFinite(value) || value < 0 || value > maximum) {
    throw new ParserHardLimitError(`${reason} has invalid size ${value} (maximum ${maximum} bytes)`);
  }
  return value;
}
async function safeIgnore(tokenizer, length, { maximumLength = maximumUntrustedSkipSizeInBytes, reason = "skip" } = {}) {
  const safeLength = getSafeBound(length, maximumLength, reason);
  await tokenizer.ignore(safeLength);
}
async function safeReadBuffer(tokenizer, buffer, options, { maximumLength = buffer.length, reason = "read" } = {}) {
  const length = options?.length ?? buffer.length;
  const safeLength = getSafeBound(length, maximumLength, reason);
  return tokenizer.readBuffer(buffer, {
    ...options,
    length: safeLength
  });
}
async function decompressDeflateRawWithLimit(data, { maximumLength = maximumZipEntrySizeInBytes } = {}) {
  const input = new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    }
  });
  const output = input.pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = output.getReader();
  const chunks = [];
  let totalLength = 0;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      totalLength += value.length;
      if (totalLength > maximumLength) {
        await reader.cancel();
        throw new Error(`ZIP entry decompressed data exceeds ${maximumLength} bytes`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const uncompressedData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    uncompressedData.set(chunk, offset);
    offset += chunk.length;
  }
  return uncompressedData;
}
var zipDataDescriptorSignature = 134695760;
var zipDataDescriptorLengthInBytes = 16;
var zipDataDescriptorOverlapLengthInBytes = zipDataDescriptorLengthInBytes - 1;
function findZipDataDescriptorOffset(buffer, bytesConsumed) {
  if (buffer.length < zipDataDescriptorLengthInBytes) {
    return -1;
  }
  const lastPossibleDescriptorOffset = buffer.length - zipDataDescriptorLengthInBytes;
  for (let index = 0; index <= lastPossibleDescriptorOffset; index++) {
    if (UINT32_LE.get(buffer, index) === zipDataDescriptorSignature && UINT32_LE.get(buffer, index + 8) === bytesConsumed + index) {
      return index;
    }
  }
  return -1;
}
function isPngAncillaryChunk(type) {
  return (type.codePointAt(0) & 32) !== 0;
}
function mergeByteChunks(chunks, totalLength) {
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
async function readZipDataDescriptorEntryWithLimit(zipHandler, { shouldBuffer, maximumLength = maximumZipEntrySizeInBytes } = {}) {
  const { syncBuffer } = zipHandler;
  const { length: syncBufferLength } = syncBuffer;
  const chunks = [];
  let bytesConsumed = 0;
  for (; ; ) {
    const length = await zipHandler.tokenizer.peekBuffer(syncBuffer, { mayBeLess: true });
    const dataDescriptorOffset = findZipDataDescriptorOffset(syncBuffer.subarray(0, length), bytesConsumed);
    const retainedLength = dataDescriptorOffset >= 0 ? 0 : length === syncBufferLength ? Math.min(zipDataDescriptorOverlapLengthInBytes, length - 1) : 0;
    const chunkLength = dataDescriptorOffset >= 0 ? dataDescriptorOffset : length - retainedLength;
    if (chunkLength === 0) {
      break;
    }
    bytesConsumed += chunkLength;
    if (bytesConsumed > maximumLength) {
      throw new Error(`ZIP entry compressed data exceeds ${maximumLength} bytes`);
    }
    if (shouldBuffer) {
      const data = new Uint8Array(chunkLength);
      await zipHandler.tokenizer.readBuffer(data);
      chunks.push(data);
    } else {
      await zipHandler.tokenizer.ignore(chunkLength);
    }
    if (dataDescriptorOffset >= 0) {
      break;
    }
  }
  if (!hasUnknownFileSize(zipHandler.tokenizer)) {
    zipHandler.knownSizeDescriptorScannedBytes += bytesConsumed;
  }
  if (!shouldBuffer) {
    return;
  }
  return mergeByteChunks(chunks, bytesConsumed);
}
function getRemainingZipScanBudget(zipHandler, startOffset) {
  if (hasUnknownFileSize(zipHandler.tokenizer)) {
    return Math.max(0, maximumUntrustedSkipSizeInBytes - (zipHandler.tokenizer.position - startOffset));
  }
  return Math.max(0, maximumZipEntrySizeInBytes - zipHandler.knownSizeDescriptorScannedBytes);
}
async function readZipEntryData(zipHandler, zipHeader, { shouldBuffer, maximumDescriptorLength = maximumZipEntrySizeInBytes } = {}) {
  if (zipHeader.dataDescriptor && zipHeader.compressedSize === 0) {
    return readZipDataDescriptorEntryWithLimit(zipHandler, {
      shouldBuffer,
      maximumLength: maximumDescriptorLength
    });
  }
  if (!shouldBuffer) {
    await safeIgnore(zipHandler.tokenizer, zipHeader.compressedSize, {
      maximumLength: hasUnknownFileSize(zipHandler.tokenizer) ? maximumZipEntrySizeInBytes : zipHandler.tokenizer.fileInfo.size,
      reason: "ZIP entry compressed data"
    });
    return;
  }
  const maximumLength = getMaximumZipBufferedReadLength(zipHandler.tokenizer);
  if (!Number.isFinite(zipHeader.compressedSize) || zipHeader.compressedSize < 0 || zipHeader.compressedSize > maximumLength) {
    throw new Error(`ZIP entry compressed data exceeds ${maximumLength} bytes`);
  }
  const fileData = new Uint8Array(zipHeader.compressedSize);
  await zipHandler.tokenizer.readBuffer(fileData);
  return fileData;
}
ZipHandler.prototype.inflate = async function(zipHeader, fileData, callback) {
  if (zipHeader.compressedMethod === 0) {
    return callback(fileData);
  }
  if (zipHeader.compressedMethod !== 8) {
    throw new Error(`Unsupported ZIP compression method: ${zipHeader.compressedMethod}`);
  }
  const uncompressedData = await decompressDeflateRawWithLimit(fileData, { maximumLength: maximumZipEntrySizeInBytes });
  return callback(uncompressedData);
};
ZipHandler.prototype.unzip = async function(fileCallback) {
  let stop = false;
  let zipEntryCount = 0;
  const zipScanStart = this.tokenizer.position;
  this.knownSizeDescriptorScannedBytes = 0;
  do {
    if (hasExceededUnknownSizeScanBudget(this.tokenizer, zipScanStart, maximumUntrustedSkipSizeInBytes)) {
      throw new ParserHardLimitError(`ZIP stream probing exceeds ${maximumUntrustedSkipSizeInBytes} bytes`);
    }
    const zipHeader = await this.readLocalFileHeader();
    if (!zipHeader) {
      break;
    }
    zipEntryCount++;
    if (zipEntryCount > maximumZipEntryCount) {
      throw new Error(`ZIP entry count exceeds ${maximumZipEntryCount}`);
    }
    const next = fileCallback(zipHeader);
    stop = Boolean(next.stop);
    await this.tokenizer.ignore(zipHeader.extraFieldLength);
    const fileData = await readZipEntryData(this, zipHeader, {
      shouldBuffer: Boolean(next.handler),
      maximumDescriptorLength: Math.min(maximumZipEntrySizeInBytes, getRemainingZipScanBudget(this, zipScanStart))
    });
    if (next.handler) {
      await this.inflate(zipHeader, fileData, next.handler);
    }
    if (zipHeader.dataDescriptor) {
      const dataDescriptor = new Uint8Array(zipDataDescriptorLengthInBytes);
      await this.tokenizer.readBuffer(dataDescriptor);
      if (UINT32_LE.get(dataDescriptor, 0) !== zipDataDescriptorSignature) {
        throw new Error(`Expected data-descriptor-signature at position ${this.tokenizer.position - dataDescriptor.length}`);
      }
    }
    if (hasExceededUnknownSizeScanBudget(this.tokenizer, zipScanStart, maximumUntrustedSkipSizeInBytes)) {
      throw new ParserHardLimitError(`ZIP stream probing exceeds ${maximumUntrustedSkipSizeInBytes} bytes`);
    }
  } while (!stop);
};
function createByteLimitedReadableStream(stream, maximumBytes) {
  const reader = stream.getReader();
  let emittedBytes = 0;
  let sourceDone = false;
  let sourceCanceled = false;
  const cancelSource = async (reason) => {
    if (sourceDone || sourceCanceled) {
      return;
    }
    sourceCanceled = true;
    await reader.cancel(reason);
  };
  return new ReadableStream({
    async pull(controller) {
      if (emittedBytes >= maximumBytes) {
        controller.close();
        await cancelSource();
        return;
      }
      const { done, value } = await reader.read();
      if (done || !value) {
        sourceDone = true;
        controller.close();
        return;
      }
      const remainingBytes = maximumBytes - emittedBytes;
      if (value.length > remainingBytes) {
        controller.enqueue(value.subarray(0, remainingBytes));
        emittedBytes += remainingBytes;
        controller.close();
        await cancelSource();
        return;
      }
      controller.enqueue(value);
      emittedBytes += value.length;
    },
    async cancel(reason) {
      await cancelSource(reason);
    }
  });
}
async function fileTypeFromBuffer(input, options) {
  return new FileTypeParser(options).fromBuffer(input);
}
function getFileTypeFromMimeType(mimeType) {
  mimeType = mimeType.toLowerCase();
  switch (mimeType) {
    case "application/epub+zip":
      return {
        ext: "epub",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.text":
      return {
        ext: "odt",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.text-template":
      return {
        ext: "ott",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.spreadsheet":
      return {
        ext: "ods",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.spreadsheet-template":
      return {
        ext: "ots",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.presentation":
      return {
        ext: "odp",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.presentation-template":
      return {
        ext: "otp",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.graphics":
      return {
        ext: "odg",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.graphics-template":
      return {
        ext: "otg",
        mime: mimeType
      };
    case "application/vnd.openxmlformats-officedocument.presentationml.slideshow":
      return {
        ext: "ppsx",
        mime: mimeType
      };
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return {
        ext: "xlsx",
        mime: mimeType
      };
    case "application/vnd.ms-excel.sheet.macroenabled":
      return {
        ext: "xlsm",
        mime: "application/vnd.ms-excel.sheet.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.template":
      return {
        ext: "xltx",
        mime: mimeType
      };
    case "application/vnd.ms-excel.template.macroenabled":
      return {
        ext: "xltm",
        mime: "application/vnd.ms-excel.template.macroenabled.12"
      };
    case "application/vnd.ms-powerpoint.slideshow.macroenabled":
      return {
        ext: "ppsm",
        mime: "application/vnd.ms-powerpoint.slideshow.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return {
        ext: "docx",
        mime: mimeType
      };
    case "application/vnd.ms-word.document.macroenabled":
      return {
        ext: "docm",
        mime: "application/vnd.ms-word.document.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.template":
      return {
        ext: "dotx",
        mime: mimeType
      };
    case "application/vnd.ms-word.template.macroenabledtemplate":
      return {
        ext: "dotm",
        mime: "application/vnd.ms-word.template.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.presentationml.template":
      return {
        ext: "potx",
        mime: mimeType
      };
    case "application/vnd.ms-powerpoint.template.macroenabled":
      return {
        ext: "potm",
        mime: "application/vnd.ms-powerpoint.template.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return {
        ext: "pptx",
        mime: mimeType
      };
    case "application/vnd.ms-powerpoint.presentation.macroenabled":
      return {
        ext: "pptm",
        mime: "application/vnd.ms-powerpoint.presentation.macroenabled.12"
      };
    case "application/vnd.ms-visio.drawing":
      return {
        ext: "vsdx",
        mime: "application/vnd.visio"
      };
    case "application/vnd.ms-package.3dmanufacturing-3dmodel+xml":
      return {
        ext: "3mf",
        mime: "model/3mf"
      };
    default:
  }
}
function _check(buffer, headers, options) {
  options = {
    offset: 0,
    ...options
  };
  for (const [index, header] of headers.entries()) {
    if (options.mask) {
      if (header !== (options.mask[index] & buffer[index + options.offset])) {
        return false;
      }
    } else if (header !== buffer[index + options.offset]) {
      return false;
    }
  }
  return true;
}
function normalizeSampleSize(sampleSize) {
  if (!Number.isFinite(sampleSize)) {
    return reasonableDetectionSizeInBytes;
  }
  return Math.max(1, Math.trunc(sampleSize));
}
function readByobReaderWithSignal(reader, buffer, signal) {
  if (signal === void 0) {
    return reader.read(buffer);
  }
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      const abortReason = signal.reason;
      cleanup();
      (async () => {
        try {
          await reader.cancel(abortReason);
        } catch {
        }
      })();
      reject(abortReason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    (async () => {
      try {
        const result = await reader.read(buffer);
        cleanup();
        resolve(result);
      } catch (error) {
        cleanup();
        reject(error);
      }
    })();
  });
}
function normalizeMpegOffsetTolerance(mpegOffsetTolerance) {
  if (!Number.isFinite(mpegOffsetTolerance)) {
    return 0;
  }
  return Math.max(0, Math.min(maximumMpegOffsetTolerance, Math.trunc(mpegOffsetTolerance)));
}
function getKnownFileSizeOrMaximum(fileSize) {
  if (!Number.isFinite(fileSize)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.max(0, fileSize);
}
function hasUnknownFileSize(tokenizer) {
  const fileSize = tokenizer.fileInfo.size;
  return !Number.isFinite(fileSize) || fileSize === Number.MAX_SAFE_INTEGER;
}
function hasExceededUnknownSizeScanBudget(tokenizer, startOffset, maximumBytes) {
  return hasUnknownFileSize(tokenizer) && tokenizer.position - startOffset > maximumBytes;
}
function getMaximumZipBufferedReadLength(tokenizer) {
  const fileSize = tokenizer.fileInfo.size;
  const remainingBytes = Number.isFinite(fileSize) ? Math.max(0, fileSize - tokenizer.position) : Number.MAX_SAFE_INTEGER;
  return Math.min(remainingBytes, maximumZipBufferedReadSizeInBytes);
}
function isRecoverableZipError(error) {
  if (error instanceof EndOfStreamError) {
    return true;
  }
  if (error instanceof ParserHardLimitError) {
    return true;
  }
  if (!(error instanceof Error)) {
    return false;
  }
  if (recoverableZipErrorMessages.has(error.message)) {
    return true;
  }
  if (recoverableZipErrorCodes.has(error.code)) {
    return true;
  }
  for (const prefix of recoverableZipErrorMessagePrefixes) {
    if (error.message.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}
function canReadZipEntryForDetection(zipHeader, maximumSize = maximumZipEntrySizeInBytes) {
  const sizes = [zipHeader.compressedSize, zipHeader.uncompressedSize];
  for (const size of sizes) {
    if (!Number.isFinite(size) || size < 0 || size > maximumSize) {
      return false;
    }
  }
  return true;
}
function createOpenXmlZipDetectionState() {
  return {
    hasContentTypesEntry: false,
    hasParsedContentTypesEntry: false,
    isParsingContentTypes: false,
    hasUnparseableContentTypes: false,
    hasWordDirectory: false,
    hasPresentationDirectory: false,
    hasSpreadsheetDirectory: false,
    hasThreeDimensionalModelEntry: false
  };
}
function updateOpenXmlZipDetectionStateFromFilename(openXmlState, filename) {
  if (filename.startsWith("word/")) {
    openXmlState.hasWordDirectory = true;
  }
  if (filename.startsWith("ppt/")) {
    openXmlState.hasPresentationDirectory = true;
  }
  if (filename.startsWith("xl/")) {
    openXmlState.hasSpreadsheetDirectory = true;
  }
  if (filename.startsWith("3D/") && filename.endsWith(".model")) {
    openXmlState.hasThreeDimensionalModelEntry = true;
  }
}
function getOpenXmlFileTypeFromZipEntries(openXmlState) {
  if (!openXmlState.hasContentTypesEntry || openXmlState.hasUnparseableContentTypes || openXmlState.isParsingContentTypes || openXmlState.hasParsedContentTypesEntry) {
    return;
  }
  if (openXmlState.hasWordDirectory) {
    return {
      ext: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
  }
  if (openXmlState.hasPresentationDirectory) {
    return {
      ext: "pptx",
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    };
  }
  if (openXmlState.hasSpreadsheetDirectory) {
    return {
      ext: "xlsx",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    };
  }
  if (openXmlState.hasThreeDimensionalModelEntry) {
    return {
      ext: "3mf",
      mime: "model/3mf"
    };
  }
}
function getOpenXmlMimeTypeFromContentTypesXml(xmlContent) {
  const endPosition = xmlContent.indexOf('.main+xml"');
  if (endPosition === -1) {
    const mimeType = "application/vnd.ms-package.3dmanufacturing-3dmodel+xml";
    if (xmlContent.includes(`ContentType="${mimeType}"`)) {
      return mimeType;
    }
    return;
  }
  const truncatedContent = xmlContent.slice(0, endPosition);
  const firstQuotePosition = truncatedContent.lastIndexOf('"');
  return truncatedContent.slice(firstQuotePosition + 1);
}
var FileTypeParser = class _FileTypeParser {
  constructor(options) {
    const normalizedMpegOffsetTolerance = normalizeMpegOffsetTolerance(options?.mpegOffsetTolerance);
    this.options = {
      ...options,
      mpegOffsetTolerance: normalizedMpegOffsetTolerance
    };
    this.detectors = [
      ...this.options.customDetectors ?? [],
      { id: "core", detect: this.detectConfident },
      { id: "core.imprecise", detect: this.detectImprecise }
    ];
    this.tokenizerOptions = {
      abortSignal: this.options.signal
    };
    this.gzipProbeDepth = 0;
  }
  getTokenizerOptions() {
    return {
      ...this.tokenizerOptions
    };
  }
  createTokenizerFromWebStream(stream) {
    return patchWebByobTokenizerClose(fromWebStream(stream, this.getTokenizerOptions()));
  }
  async parseTokenizer(tokenizer, detectionReentryCount = 0) {
    this.detectionReentryCount = detectionReentryCount;
    const initialPosition = tokenizer.position;
    for (const detector of this.detectors) {
      let fileType;
      try {
        fileType = await detector.detect(tokenizer);
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        if (error instanceof ParserHardLimitError) {
          return;
        }
        throw error;
      }
      if (fileType) {
        return fileType;
      }
      if (initialPosition !== tokenizer.position) {
        return void 0;
      }
    }
  }
  async fromTokenizer(tokenizer) {
    try {
      return await this.parseTokenizer(tokenizer);
    } finally {
      await tokenizer.close();
    }
  }
  async fromBuffer(input) {
    if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
      throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof input}\``);
    }
    const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (!(buffer?.length > 1)) {
      return;
    }
    return this.fromTokenizer(fromBuffer(buffer, this.getTokenizerOptions()));
  }
  async fromBlob(blob) {
    this.options.signal?.throwIfAborted();
    const tokenizer = fromBlob(blob, this.getTokenizerOptions());
    return this.fromTokenizer(tokenizer);
  }
  async fromStream(stream) {
    this.options.signal?.throwIfAborted();
    const tokenizer = this.createTokenizerFromWebStream(stream);
    return this.fromTokenizer(tokenizer);
  }
  async toDetectionStream(stream, options) {
    const sampleSize = normalizeSampleSize(options?.sampleSize ?? reasonableDetectionSizeInBytes);
    let detectedFileType;
    let firstChunk;
    const reader = stream.getReader({ mode: "byob" });
    try {
      const { value: chunk, done } = await readByobReaderWithSignal(reader, new Uint8Array(sampleSize), this.options.signal);
      firstChunk = chunk;
      if (!done && chunk) {
        try {
          detectedFileType = await this.fromBuffer(chunk.subarray(0, sampleSize));
        } catch (error) {
          if (!(error instanceof EndOfStreamError)) {
            throw error;
          }
          detectedFileType = void 0;
        }
      }
      firstChunk = chunk;
    } finally {
      reader.releaseLock();
    }
    const transformStream = new TransformStream({
      async start(controller) {
        controller.enqueue(firstChunk);
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      }
    });
    const newStream = stream.pipeThrough(transformStream);
    newStream.fileType = detectedFileType;
    return newStream;
  }
  async detectGzip(tokenizer) {
    if (this.gzipProbeDepth >= maximumNestedGzipProbeDepth) {
      return {
        ext: "gz",
        mime: "application/gzip"
      };
    }
    const gzipHandler = new GzipHandler(tokenizer);
    const limitedInflatedStream = createByteLimitedReadableStream(gzipHandler.inflate(), maximumNestedGzipDetectionSizeInBytes);
    const hasUnknownSize = hasUnknownFileSize(tokenizer);
    let timeout;
    let probeSignal;
    let probeParser;
    let compressedFileType;
    if (hasUnknownSize) {
      const timeoutController = new AbortController();
      timeout = setTimeout(() => {
        timeoutController.abort(new DOMException(`Operation timed out after ${unknownSizeGzipProbeTimeoutInMilliseconds} ms`, "TimeoutError"));
      }, unknownSizeGzipProbeTimeoutInMilliseconds);
      probeSignal = this.options.signal === void 0 ? timeoutController.signal : AbortSignal.any([this.options.signal, timeoutController.signal]);
      probeParser = new _FileTypeParser({
        ...this.options,
        signal: probeSignal
      });
      probeParser.gzipProbeDepth = this.gzipProbeDepth + 1;
    } else {
      this.gzipProbeDepth++;
    }
    try {
      compressedFileType = await (probeParser ?? this).fromStream(limitedInflatedStream);
    } catch (error) {
      if (error?.name === "AbortError" && probeSignal?.reason?.name !== "TimeoutError") {
        throw error;
      }
    } finally {
      clearTimeout(timeout);
      if (!hasUnknownSize) {
        this.gzipProbeDepth--;
      }
    }
    if (compressedFileType?.ext === "tar") {
      return {
        ext: "tar.gz",
        mime: "application/gzip"
      };
    }
    return {
      ext: "gz",
      mime: "application/gzip"
    };
  }
  check(header, options) {
    return _check(this.buffer, header, options);
  }
  checkString(header, options) {
    return this.check(stringToBytes(header, options?.encoding), options);
  }
  // Detections with a high degree of certainty in identifying the correct file type
  detectConfident = async (tokenizer) => {
    this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);
    if (tokenizer.fileInfo.size === void 0) {
      tokenizer.fileInfo.size = Number.MAX_SAFE_INTEGER;
    }
    this.tokenizer = tokenizer;
    if (hasUnknownFileSize(tokenizer)) {
      await tokenizer.peekBuffer(this.buffer, { length: 3, mayBeLess: true });
      if (this.check([31, 139, 8])) {
        return this.detectGzip(tokenizer);
      }
    }
    await tokenizer.peekBuffer(this.buffer, { length: 32, mayBeLess: true });
    if (this.check([66, 77])) {
      return {
        ext: "bmp",
        mime: "image/bmp"
      };
    }
    if (this.check([11, 119])) {
      return {
        ext: "ac3",
        mime: "audio/vnd.dolby.dd-raw"
      };
    }
    if (this.check([120, 1])) {
      return {
        ext: "dmg",
        mime: "application/x-apple-diskimage"
      };
    }
    if (this.check([77, 90])) {
      return {
        ext: "exe",
        mime: "application/x-msdownload"
      };
    }
    if (this.check([37, 33])) {
      await tokenizer.peekBuffer(this.buffer, { length: 24, mayBeLess: true });
      if (this.checkString("PS-Adobe-", { offset: 2 }) && this.checkString(" EPSF-", { offset: 14 })) {
        return {
          ext: "eps",
          mime: "application/eps"
        };
      }
      return {
        ext: "ps",
        mime: "application/postscript"
      };
    }
    if (this.check([31, 160]) || this.check([31, 157])) {
      return {
        ext: "Z",
        mime: "application/x-compress"
      };
    }
    if (this.check([199, 113])) {
      return {
        ext: "cpio",
        mime: "application/x-cpio"
      };
    }
    if (this.check([96, 234])) {
      return {
        ext: "arj",
        mime: "application/x-arj"
      };
    }
    if (this.check([239, 187, 191])) {
      if (this.detectionReentryCount >= maximumDetectionReentryCount) {
        return;
      }
      this.detectionReentryCount++;
      await this.tokenizer.ignore(3);
      return this.detectConfident(tokenizer);
    }
    if (this.check([71, 73, 70])) {
      return {
        ext: "gif",
        mime: "image/gif"
      };
    }
    if (this.check([73, 73, 188])) {
      return {
        ext: "jxr",
        mime: "image/vnd.ms-photo"
      };
    }
    if (this.check([31, 139, 8])) {
      return this.detectGzip(tokenizer);
    }
    if (this.check([66, 90, 104])) {
      return {
        ext: "bz2",
        mime: "application/x-bzip2"
      };
    }
    if (this.checkString("ID3")) {
      await safeIgnore(tokenizer, 6, {
        maximumLength: 6,
        reason: "ID3 header prefix"
      });
      const id3HeaderLength = await tokenizer.readToken(uint32SyncSafeToken);
      const isUnknownFileSize = hasUnknownFileSize(tokenizer);
      if (!Number.isFinite(id3HeaderLength) || id3HeaderLength < 0 || isUnknownFileSize && (id3HeaderLength > maximumId3HeaderSizeInBytes || tokenizer.position + id3HeaderLength > maximumId3HeaderSizeInBytes)) {
        return;
      }
      if (tokenizer.position + id3HeaderLength > tokenizer.fileInfo.size) {
        if (isUnknownFileSize) {
          return;
        }
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      }
      try {
        await safeIgnore(tokenizer, id3HeaderLength, {
          maximumLength: isUnknownFileSize ? maximumId3HeaderSizeInBytes : tokenizer.fileInfo.size,
          reason: "ID3 payload"
        });
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        throw error;
      }
      if (this.detectionReentryCount >= maximumDetectionReentryCount) {
        return;
      }
      this.detectionReentryCount++;
      return this.parseTokenizer(tokenizer, this.detectionReentryCount);
    }
    if (this.checkString("MP+")) {
      return {
        ext: "mpc",
        mime: "audio/x-musepack"
      };
    }
    if ((this.buffer[0] === 67 || this.buffer[0] === 70) && this.check([87, 83], { offset: 1 })) {
      return {
        ext: "swf",
        mime: "application/x-shockwave-flash"
      };
    }
    if (this.check([255, 216, 255])) {
      if (this.check([247], { offset: 3 })) {
        return {
          ext: "jls",
          mime: "image/jls"
        };
      }
      return {
        ext: "jpg",
        mime: "image/jpeg"
      };
    }
    if (this.check([79, 98, 106, 1])) {
      return {
        ext: "avro",
        mime: "application/avro"
      };
    }
    if (this.checkString("FLIF")) {
      return {
        ext: "flif",
        mime: "image/flif"
      };
    }
    if (this.checkString("8BPS")) {
      return {
        ext: "psd",
        mime: "image/vnd.adobe.photoshop"
      };
    }
    if (this.checkString("MPCK")) {
      return {
        ext: "mpc",
        mime: "audio/x-musepack"
      };
    }
    if (this.checkString("FORM")) {
      return {
        ext: "aif",
        mime: "audio/aiff"
      };
    }
    if (this.checkString("icns", { offset: 0 })) {
      return {
        ext: "icns",
        mime: "image/icns"
      };
    }
    if (this.check([80, 75, 3, 4])) {
      let fileType;
      const openXmlState = createOpenXmlZipDetectionState();
      try {
        await new ZipHandler(tokenizer).unzip((zipHeader) => {
          updateOpenXmlZipDetectionStateFromFilename(openXmlState, zipHeader.filename);
          const isOpenXmlContentTypesEntry = zipHeader.filename === "[Content_Types].xml";
          const openXmlFileTypeFromEntries = getOpenXmlFileTypeFromZipEntries(openXmlState);
          if (!isOpenXmlContentTypesEntry && openXmlFileTypeFromEntries) {
            fileType = openXmlFileTypeFromEntries;
            return {
              stop: true
            };
          }
          switch (zipHeader.filename) {
            case "META-INF/mozilla.rsa":
              fileType = {
                ext: "xpi",
                mime: "application/x-xpinstall"
              };
              return {
                stop: true
              };
            case "META-INF/MANIFEST.MF":
              fileType = {
                ext: "jar",
                mime: "application/java-archive"
              };
              return {
                stop: true
              };
            case "mimetype":
              if (!canReadZipEntryForDetection(zipHeader, maximumZipTextEntrySizeInBytes)) {
                return {};
              }
              return {
                async handler(fileData) {
                  const mimeType = new TextDecoder("utf-8").decode(fileData).trim();
                  fileType = getFileTypeFromMimeType(mimeType);
                },
                stop: true
              };
            case "[Content_Types].xml": {
              openXmlState.hasContentTypesEntry = true;
              if (!canReadZipEntryForDetection(zipHeader, maximumZipTextEntrySizeInBytes)) {
                openXmlState.hasUnparseableContentTypes = true;
                return {};
              }
              openXmlState.isParsingContentTypes = true;
              return {
                async handler(fileData) {
                  const xmlContent = new TextDecoder("utf-8").decode(fileData);
                  const mimeType = getOpenXmlMimeTypeFromContentTypesXml(xmlContent);
                  if (mimeType) {
                    fileType = getFileTypeFromMimeType(mimeType);
                  }
                  openXmlState.hasParsedContentTypesEntry = true;
                  openXmlState.isParsingContentTypes = false;
                },
                stop: true
              };
            }
            default:
              if (/classes\d*\.dex/.test(zipHeader.filename)) {
                fileType = {
                  ext: "apk",
                  mime: "application/vnd.android.package-archive"
                };
                return { stop: true };
              }
              return {};
          }
        });
      } catch (error) {
        if (!isRecoverableZipError(error)) {
          throw error;
        }
        if (openXmlState.isParsingContentTypes) {
          openXmlState.isParsingContentTypes = false;
          openXmlState.hasUnparseableContentTypes = true;
        }
      }
      return fileType ?? getOpenXmlFileTypeFromZipEntries(openXmlState) ?? {
        ext: "zip",
        mime: "application/zip"
      };
    }
    if (this.checkString("OggS")) {
      await tokenizer.ignore(28);
      const type = new Uint8Array(8);
      await tokenizer.readBuffer(type);
      if (_check(type, [79, 112, 117, 115, 72, 101, 97, 100])) {
        return {
          ext: "opus",
          mime: "audio/ogg; codecs=opus"
        };
      }
      if (_check(type, [128, 116, 104, 101, 111, 114, 97])) {
        return {
          ext: "ogv",
          mime: "video/ogg"
        };
      }
      if (_check(type, [1, 118, 105, 100, 101, 111, 0])) {
        return {
          ext: "ogm",
          mime: "video/ogg"
        };
      }
      if (_check(type, [127, 70, 76, 65, 67])) {
        return {
          ext: "oga",
          mime: "audio/ogg"
        };
      }
      if (_check(type, [83, 112, 101, 101, 120, 32, 32])) {
        return {
          ext: "spx",
          mime: "audio/ogg"
        };
      }
      if (_check(type, [1, 118, 111, 114, 98, 105, 115])) {
        return {
          ext: "ogg",
          mime: "audio/ogg"
        };
      }
      return {
        ext: "ogx",
        mime: "application/ogg"
      };
    }
    if (this.check([80, 75]) && (this.buffer[2] === 3 || this.buffer[2] === 5 || this.buffer[2] === 7) && (this.buffer[3] === 4 || this.buffer[3] === 6 || this.buffer[3] === 8)) {
      return {
        ext: "zip",
        mime: "application/zip"
      };
    }
    if (this.checkString("MThd")) {
      return {
        ext: "mid",
        mime: "audio/midi"
      };
    }
    if (this.checkString("wOFF") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 }))) {
      return {
        ext: "woff",
        mime: "font/woff"
      };
    }
    if (this.checkString("wOF2") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 }))) {
      return {
        ext: "woff2",
        mime: "font/woff2"
      };
    }
    if (this.check([212, 195, 178, 161]) || this.check([161, 178, 195, 212])) {
      return {
        ext: "pcap",
        mime: "application/vnd.tcpdump.pcap"
      };
    }
    if (this.checkString("DSD ")) {
      return {
        ext: "dsf",
        mime: "audio/x-dsf"
        // Non-standard
      };
    }
    if (this.checkString("LZIP")) {
      return {
        ext: "lz",
        mime: "application/x-lzip"
      };
    }
    if (this.checkString("fLaC")) {
      return {
        ext: "flac",
        mime: "audio/flac"
      };
    }
    if (this.check([66, 80, 71, 251])) {
      return {
        ext: "bpg",
        mime: "image/bpg"
      };
    }
    if (this.checkString("wvpk")) {
      return {
        ext: "wv",
        mime: "audio/wavpack"
      };
    }
    if (this.checkString("%PDF")) {
      return {
        ext: "pdf",
        mime: "application/pdf"
      };
    }
    if (this.check([0, 97, 115, 109])) {
      return {
        ext: "wasm",
        mime: "application/wasm"
      };
    }
    if (this.check([73, 73])) {
      const fileType = await this.readTiffHeader(false);
      if (fileType) {
        return fileType;
      }
    }
    if (this.check([77, 77])) {
      const fileType = await this.readTiffHeader(true);
      if (fileType) {
        return fileType;
      }
    }
    if (this.checkString("MAC ")) {
      return {
        ext: "ape",
        mime: "audio/ape"
      };
    }
    if (this.check([26, 69, 223, 163])) {
      async function readField() {
        const msb = await tokenizer.peekNumber(UINT8);
        let mask = 128;
        let ic = 0;
        while ((msb & mask) === 0 && mask !== 0) {
          ++ic;
          mask >>= 1;
        }
        const id = new Uint8Array(ic + 1);
        await safeReadBuffer(tokenizer, id, void 0, {
          maximumLength: id.length,
          reason: "EBML field"
        });
        return id;
      }
      async function readElement() {
        const idField = await readField();
        const lengthField = await readField();
        lengthField[0] ^= 128 >> lengthField.length - 1;
        const nrLength = Math.min(6, lengthField.length);
        const idView = new DataView(idField.buffer);
        const lengthView = new DataView(lengthField.buffer, lengthField.length - nrLength, nrLength);
        return {
          id: getUintBE(idView),
          len: getUintBE(lengthView)
        };
      }
      async function readChildren(children) {
        let ebmlElementCount = 0;
        while (children > 0) {
          ebmlElementCount++;
          if (ebmlElementCount > maximumEbmlElementCount) {
            return;
          }
          if (hasExceededUnknownSizeScanBudget(tokenizer, ebmlScanStart, maximumUntrustedSkipSizeInBytes)) {
            return;
          }
          const previousPosition = tokenizer.position;
          const element = await readElement();
          if (element.id === 17026) {
            if (element.len > maximumEbmlDocumentTypeSizeInBytes) {
              return;
            }
            const documentTypeLength = getSafeBound(element.len, maximumEbmlDocumentTypeSizeInBytes, "EBML DocType");
            const rawValue = await tokenizer.readToken(new StringType(documentTypeLength));
            return rawValue.replaceAll(/\00.*$/g, "");
          }
          if (hasUnknownFileSize(tokenizer) && (!Number.isFinite(element.len) || element.len < 0 || element.len > maximumEbmlElementPayloadSizeInBytes)) {
            return;
          }
          await safeIgnore(tokenizer, element.len, {
            maximumLength: hasUnknownFileSize(tokenizer) ? maximumEbmlElementPayloadSizeInBytes : tokenizer.fileInfo.size,
            reason: "EBML payload"
          });
          --children;
          if (tokenizer.position <= previousPosition) {
            return;
          }
        }
      }
      const rootElement = await readElement();
      const ebmlScanStart = tokenizer.position;
      const documentType = await readChildren(rootElement.len);
      switch (documentType) {
        case "webm":
          return {
            ext: "webm",
            mime: "video/webm"
          };
        case "matroska":
          return {
            ext: "mkv",
            mime: "video/matroska"
          };
        default:
          return;
      }
    }
    if (this.checkString("SQLi")) {
      return {
        ext: "sqlite",
        mime: "application/x-sqlite3"
      };
    }
    if (this.check([78, 69, 83, 26])) {
      return {
        ext: "nes",
        mime: "application/x-nintendo-nes-rom"
      };
    }
    if (this.checkString("Cr24")) {
      return {
        ext: "crx",
        mime: "application/x-google-chrome-extension"
      };
    }
    if (this.checkString("MSCF") || this.checkString("ISc(")) {
      return {
        ext: "cab",
        mime: "application/vnd.ms-cab-compressed"
      };
    }
    if (this.check([237, 171, 238, 219])) {
      return {
        ext: "rpm",
        mime: "application/x-rpm"
      };
    }
    if (this.check([197, 208, 211, 198])) {
      return {
        ext: "eps",
        mime: "application/eps"
      };
    }
    if (this.check([40, 181, 47, 253])) {
      return {
        ext: "zst",
        mime: "application/zstd"
      };
    }
    if (this.check([127, 69, 76, 70])) {
      return {
        ext: "elf",
        mime: "application/x-elf"
      };
    }
    if (this.check([33, 66, 68, 78])) {
      return {
        ext: "pst",
        mime: "application/vnd.ms-outlook"
      };
    }
    if (this.checkString("PAR1") || this.checkString("PARE")) {
      return {
        ext: "parquet",
        mime: "application/vnd.apache.parquet"
      };
    }
    if (this.checkString("ttcf")) {
      return {
        ext: "ttc",
        mime: "font/collection"
      };
    }
    if (this.check([254, 237, 250, 206]) || this.check([254, 237, 250, 207]) || this.check([206, 250, 237, 254]) || this.check([207, 250, 237, 254])) {
      return {
        ext: "macho",
        mime: "application/x-mach-binary"
      };
    }
    if (this.check([4, 34, 77, 24])) {
      return {
        ext: "lz4",
        mime: "application/x-lz4"
        // Invented by us
      };
    }
    if (this.checkString("regf")) {
      return {
        ext: "dat",
        mime: "application/x-ft-windows-registry-hive"
      };
    }
    if (this.checkString("$FL2") || this.checkString("$FL3")) {
      return {
        ext: "sav",
        mime: "application/x-spss-sav"
      };
    }
    if (this.check([79, 84, 84, 79, 0])) {
      return {
        ext: "otf",
        mime: "font/otf"
      };
    }
    if (this.checkString("#!AMR")) {
      return {
        ext: "amr",
        mime: "audio/amr"
      };
    }
    if (this.checkString("{\\rtf")) {
      return {
        ext: "rtf",
        mime: "application/rtf"
      };
    }
    if (this.check([70, 76, 86, 1])) {
      return {
        ext: "flv",
        mime: "video/x-flv"
      };
    }
    if (this.checkString("IMPM")) {
      return {
        ext: "it",
        mime: "audio/x-it"
      };
    }
    if (this.checkString("-lh0-", { offset: 2 }) || this.checkString("-lh1-", { offset: 2 }) || this.checkString("-lh2-", { offset: 2 }) || this.checkString("-lh3-", { offset: 2 }) || this.checkString("-lh4-", { offset: 2 }) || this.checkString("-lh5-", { offset: 2 }) || this.checkString("-lh6-", { offset: 2 }) || this.checkString("-lh7-", { offset: 2 }) || this.checkString("-lzs-", { offset: 2 }) || this.checkString("-lz4-", { offset: 2 }) || this.checkString("-lz5-", { offset: 2 }) || this.checkString("-lhd-", { offset: 2 })) {
      return {
        ext: "lzh",
        mime: "application/x-lzh-compressed"
      };
    }
    if (this.check([0, 0, 1, 186])) {
      if (this.check([33], { offset: 4, mask: [241] })) {
        return {
          ext: "mpg",
          // May also be .ps, .mpeg
          mime: "video/MP1S"
        };
      }
      if (this.check([68], { offset: 4, mask: [196] })) {
        return {
          ext: "mpg",
          // May also be .mpg, .m2p, .vob or .sub
          mime: "video/MP2P"
        };
      }
    }
    if (this.checkString("ITSF")) {
      return {
        ext: "chm",
        mime: "application/vnd.ms-htmlhelp"
      };
    }
    if (this.check([202, 254, 186, 190])) {
      const machOArchitectureCount = UINT32_BE.get(this.buffer, 4);
      const javaClassFileMajorVersion = UINT16_BE.get(this.buffer, 6);
      if (machOArchitectureCount > 0 && machOArchitectureCount <= 30) {
        return {
          ext: "macho",
          mime: "application/x-mach-binary"
        };
      }
      if (javaClassFileMajorVersion > 30) {
        return {
          ext: "class",
          mime: "application/java-vm"
        };
      }
    }
    if (this.checkString(".RMF")) {
      return {
        ext: "rm",
        mime: "application/vnd.rn-realmedia"
      };
    }
    if (this.checkString("DRACO")) {
      return {
        ext: "drc",
        mime: "application/vnd.google.draco"
        // Invented by us
      };
    }
    if (this.check([253, 55, 122, 88, 90, 0])) {
      return {
        ext: "xz",
        mime: "application/x-xz"
      };
    }
    if (this.checkString("<?xml ")) {
      return {
        ext: "xml",
        mime: "application/xml"
      };
    }
    if (this.check([55, 122, 188, 175, 39, 28])) {
      return {
        ext: "7z",
        mime: "application/x-7z-compressed"
      };
    }
    if (this.check([82, 97, 114, 33, 26, 7]) && (this.buffer[6] === 0 || this.buffer[6] === 1)) {
      return {
        ext: "rar",
        mime: "application/x-rar-compressed"
      };
    }
    if (this.checkString("solid ")) {
      return {
        ext: "stl",
        mime: "model/stl"
      };
    }
    if (this.checkString("AC")) {
      const version = new StringType(4, "latin1").get(this.buffer, 2);
      if (version.match("^d*") && version >= 1e3 && version <= 1050) {
        return {
          ext: "dwg",
          mime: "image/vnd.dwg"
        };
      }
    }
    if (this.checkString("070707")) {
      return {
        ext: "cpio",
        mime: "application/x-cpio"
      };
    }
    if (this.checkString("BLENDER")) {
      return {
        ext: "blend",
        mime: "application/x-blender"
      };
    }
    if (this.checkString("!<arch>")) {
      await tokenizer.ignore(8);
      const string = await tokenizer.readToken(new StringType(13, "ascii"));
      if (string === "debian-binary") {
        return {
          ext: "deb",
          mime: "application/x-deb"
        };
      }
      return {
        ext: "ar",
        mime: "application/x-unix-archive"
      };
    }
    if (this.checkString("WEBVTT") && // One of LF, CR, tab, space, or end of file must follow "WEBVTT" per the spec (see `fixture/fixture-vtt-*.vtt` for examples). Note that `\0` is technically the null character (there is no such thing as an EOF character). However, checking for `\0` gives us the same result as checking for the end of the stream.
    ["\n", "\r", "	", " ", "\0"].some((char7) => this.checkString(char7, { offset: 6 }))) {
      return {
        ext: "vtt",
        mime: "text/vtt"
      };
    }
    if (this.check([137, 80, 78, 71, 13, 10, 26, 10])) {
      const pngFileType = {
        ext: "png",
        mime: "image/png"
      };
      const apngFileType = {
        ext: "apng",
        mime: "image/apng"
      };
      await tokenizer.ignore(8);
      async function readChunkHeader() {
        return {
          length: await tokenizer.readToken(INT32_BE),
          type: await tokenizer.readToken(new StringType(4, "latin1"))
        };
      }
      const isUnknownPngStream = hasUnknownFileSize(tokenizer);
      const pngScanStart = tokenizer.position;
      let pngChunkCount = 0;
      let hasSeenImageHeader = false;
      do {
        pngChunkCount++;
        if (pngChunkCount > maximumPngChunkCount) {
          break;
        }
        if (hasExceededUnknownSizeScanBudget(tokenizer, pngScanStart, maximumPngStreamScanBudgetInBytes)) {
          break;
        }
        const previousPosition = tokenizer.position;
        const chunk = await readChunkHeader();
        if (chunk.length < 0) {
          return;
        }
        if (chunk.type === "IHDR") {
          if (chunk.length !== 13) {
            return;
          }
          hasSeenImageHeader = true;
        }
        switch (chunk.type) {
          case "IDAT":
            return pngFileType;
          case "acTL":
            return apngFileType;
          default:
            if (!hasSeenImageHeader && chunk.type !== "CgBI") {
              return;
            }
            if (isUnknownPngStream && chunk.length > maximumPngChunkSizeInBytes) {
              return hasSeenImageHeader && isPngAncillaryChunk(chunk.type) ? pngFileType : void 0;
            }
            try {
              await safeIgnore(tokenizer, chunk.length + 4, {
                maximumLength: isUnknownPngStream ? maximumPngChunkSizeInBytes + 4 : tokenizer.fileInfo.size,
                reason: "PNG chunk payload"
              });
            } catch (error) {
              if (!isUnknownPngStream && (error instanceof ParserHardLimitError || error instanceof EndOfStreamError)) {
                return pngFileType;
              }
              throw error;
            }
        }
        if (tokenizer.position <= previousPosition) {
          break;
        }
      } while (tokenizer.position + 8 < tokenizer.fileInfo.size);
      return pngFileType;
    }
    if (this.check([65, 82, 82, 79, 87, 49, 0, 0])) {
      return {
        ext: "arrow",
        mime: "application/vnd.apache.arrow.file"
      };
    }
    if (this.check([103, 108, 84, 70, 2, 0, 0, 0])) {
      return {
        ext: "glb",
        mime: "model/gltf-binary"
      };
    }
    if (this.check([102, 114, 101, 101], { offset: 4 }) || this.check([109, 100, 97, 116], { offset: 4 }) || this.check([109, 111, 111, 118], { offset: 4 }) || this.check([119, 105, 100, 101], { offset: 4 })) {
      return {
        ext: "mov",
        mime: "video/quicktime"
      };
    }
    if (this.check([73, 73, 82, 79, 8, 0, 0, 0, 24])) {
      return {
        ext: "orf",
        mime: "image/x-olympus-orf"
      };
    }
    if (this.checkString("gimp xcf ")) {
      return {
        ext: "xcf",
        mime: "image/x-xcf"
      };
    }
    if (this.checkString("ftyp", { offset: 4 }) && (this.buffer[8] & 96) !== 0) {
      const brandMajor = new StringType(4, "latin1").get(this.buffer, 8).replace("\0", " ").trim();
      switch (brandMajor) {
        case "avif":
        case "avis":
          return { ext: "avif", mime: "image/avif" };
        case "mif1":
          return { ext: "heic", mime: "image/heif" };
        case "msf1":
          return { ext: "heic", mime: "image/heif-sequence" };
        case "heic":
        case "heix":
          return { ext: "heic", mime: "image/heic" };
        case "hevc":
        case "hevx":
          return { ext: "heic", mime: "image/heic-sequence" };
        case "qt":
          return { ext: "mov", mime: "video/quicktime" };
        case "M4V":
        case "M4VH":
        case "M4VP":
          return { ext: "m4v", mime: "video/x-m4v" };
        case "M4P":
          return { ext: "m4p", mime: "video/mp4" };
        case "M4B":
          return { ext: "m4b", mime: "audio/mp4" };
        case "M4A":
          return { ext: "m4a", mime: "audio/x-m4a" };
        case "F4V":
          return { ext: "f4v", mime: "video/mp4" };
        case "F4P":
          return { ext: "f4p", mime: "video/mp4" };
        case "F4A":
          return { ext: "f4a", mime: "audio/mp4" };
        case "F4B":
          return { ext: "f4b", mime: "audio/mp4" };
        case "crx":
          return { ext: "cr3", mime: "image/x-canon-cr3" };
        default:
          if (brandMajor.startsWith("3g")) {
            if (brandMajor.startsWith("3g2")) {
              return { ext: "3g2", mime: "video/3gpp2" };
            }
            return { ext: "3gp", mime: "video/3gpp" };
          }
          return { ext: "mp4", mime: "video/mp4" };
      }
    }
    if (this.checkString("REGEDIT4\r\n")) {
      return {
        ext: "reg",
        mime: "application/x-ms-regedit"
      };
    }
    if (this.check([82, 73, 70, 70])) {
      if (this.checkString("WEBP", { offset: 8 })) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (this.check([65, 86, 73], { offset: 8 })) {
        return {
          ext: "avi",
          mime: "video/vnd.avi"
        };
      }
      if (this.check([87, 65, 86, 69], { offset: 8 })) {
        return {
          ext: "wav",
          mime: "audio/wav"
        };
      }
      if (this.check([81, 76, 67, 77], { offset: 8 })) {
        return {
          ext: "qcp",
          mime: "audio/qcelp"
        };
      }
    }
    if (this.check([73, 73, 85, 0, 24, 0, 0, 0, 136, 231, 116, 216])) {
      return {
        ext: "rw2",
        mime: "image/x-panasonic-rw2"
      };
    }
    if (this.check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
      let isMalformedAsf = false;
      try {
        async function readHeader() {
          const guid = new Uint8Array(16);
          await safeReadBuffer(tokenizer, guid, void 0, {
            maximumLength: guid.length,
            reason: "ASF header GUID"
          });
          return {
            id: guid,
            size: Number(await tokenizer.readToken(UINT64_LE))
          };
        }
        await safeIgnore(tokenizer, 30, {
          maximumLength: 30,
          reason: "ASF header prelude"
        });
        const isUnknownFileSize = hasUnknownFileSize(tokenizer);
        const asfHeaderScanStart = tokenizer.position;
        let asfHeaderObjectCount = 0;
        while (tokenizer.position + 24 < tokenizer.fileInfo.size) {
          asfHeaderObjectCount++;
          if (asfHeaderObjectCount > maximumAsfHeaderObjectCount) {
            break;
          }
          if (hasExceededUnknownSizeScanBudget(tokenizer, asfHeaderScanStart, maximumUntrustedSkipSizeInBytes)) {
            break;
          }
          const previousPosition = tokenizer.position;
          const header = await readHeader();
          let payload = header.size - 24;
          if (!Number.isFinite(payload) || payload < 0) {
            isMalformedAsf = true;
            break;
          }
          if (_check(header.id, [145, 7, 220, 183, 183, 169, 207, 17, 142, 230, 0, 192, 12, 32, 83, 101])) {
            const typeId = new Uint8Array(16);
            payload -= await safeReadBuffer(tokenizer, typeId, void 0, {
              maximumLength: typeId.length,
              reason: "ASF stream type GUID"
            });
            if (_check(typeId, [64, 158, 105, 248, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43])) {
              return {
                ext: "asf",
                mime: "audio/x-ms-asf"
              };
            }
            if (_check(typeId, [192, 239, 25, 188, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43])) {
              return {
                ext: "asf",
                mime: "video/x-ms-asf"
              };
            }
            break;
          }
          if (isUnknownFileSize && payload > maximumAsfHeaderPayloadSizeInBytes) {
            isMalformedAsf = true;
            break;
          }
          await safeIgnore(tokenizer, payload, {
            maximumLength: isUnknownFileSize ? maximumAsfHeaderPayloadSizeInBytes : tokenizer.fileInfo.size,
            reason: "ASF header payload"
          });
          if (tokenizer.position <= previousPosition) {
            isMalformedAsf = true;
            break;
          }
        }
      } catch (error) {
        if (error instanceof EndOfStreamError || error instanceof ParserHardLimitError) {
          if (hasUnknownFileSize(tokenizer)) {
            isMalformedAsf = true;
          }
        } else {
          throw error;
        }
      }
      if (isMalformedAsf) {
        return;
      }
      return {
        ext: "asf",
        mime: "application/vnd.ms-asf"
      };
    }
    if (this.check([171, 75, 84, 88, 32, 49, 49, 187, 13, 10, 26, 10])) {
      return {
        ext: "ktx",
        mime: "image/ktx"
      };
    }
    if ((this.check([126, 16, 4]) || this.check([126, 24, 4])) && this.check([48, 77, 73, 69], { offset: 4 })) {
      return {
        ext: "mie",
        mime: "application/x-mie"
      };
    }
    if (this.check([39, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { offset: 2 })) {
      return {
        ext: "shp",
        mime: "application/x-esri-shape"
      };
    }
    if (this.check([255, 79, 255, 81])) {
      return {
        ext: "j2c",
        mime: "image/j2c"
      };
    }
    if (this.check([0, 0, 0, 12, 106, 80, 32, 32, 13, 10, 135, 10])) {
      await tokenizer.ignore(20);
      const type = await tokenizer.readToken(new StringType(4, "ascii"));
      switch (type) {
        case "jp2 ":
          return {
            ext: "jp2",
            mime: "image/jp2"
          };
        case "jpx ":
          return {
            ext: "jpx",
            mime: "image/jpx"
          };
        case "jpm ":
          return {
            ext: "jpm",
            mime: "image/jpm"
          };
        case "mjp2":
          return {
            ext: "mj2",
            mime: "image/mj2"
          };
        default:
          return;
      }
    }
    if (this.check([255, 10]) || this.check([0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10])) {
      return {
        ext: "jxl",
        mime: "image/jxl"
      };
    }
    if (this.check([254, 255])) {
      if (this.checkString("<?xml ", { offset: 2, encoding: "utf-16be" })) {
        return {
          ext: "xml",
          mime: "application/xml"
        };
      }
      return void 0;
    }
    if (this.check([208, 207, 17, 224, 161, 177, 26, 225])) {
      return {
        ext: "cfb",
        mime: "application/x-cfb"
      };
    }
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(256, tokenizer.fileInfo.size), mayBeLess: true });
    if (this.check([97, 99, 115, 112], { offset: 36 })) {
      return {
        ext: "icc",
        mime: "application/vnd.iccprofile"
      };
    }
    if (this.checkString("**ACE", { offset: 7 }) && this.checkString("**", { offset: 12 })) {
      return {
        ext: "ace",
        mime: "application/x-ace-compressed"
      };
    }
    if (this.checkString("BEGIN:")) {
      if (this.checkString("VCARD", { offset: 6 })) {
        return {
          ext: "vcf",
          mime: "text/vcard"
        };
      }
      if (this.checkString("VCALENDAR", { offset: 6 })) {
        return {
          ext: "ics",
          mime: "text/calendar"
        };
      }
    }
    if (this.checkString("FUJIFILMCCD-RAW")) {
      return {
        ext: "raf",
        mime: "image/x-fujifilm-raf"
      };
    }
    if (this.checkString("Extended Module:")) {
      return {
        ext: "xm",
        mime: "audio/x-xm"
      };
    }
    if (this.checkString("Creative Voice File")) {
      return {
        ext: "voc",
        mime: "audio/x-voc"
      };
    }
    if (this.check([4, 0, 0, 0]) && this.buffer.length >= 16) {
      const jsonSize = new DataView(this.buffer.buffer).getUint32(12, true);
      if (jsonSize > 12 && this.buffer.length >= jsonSize + 16) {
        try {
          const header = new TextDecoder().decode(this.buffer.subarray(16, jsonSize + 16));
          const json = JSON.parse(header);
          if (json.files) {
            return {
              ext: "asar",
              mime: "application/x-asar"
            };
          }
        } catch {
        }
      }
    }
    if (this.check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2])) {
      return {
        ext: "mxf",
        mime: "application/mxf"
      };
    }
    if (this.checkString("SCRM", { offset: 44 })) {
      return {
        ext: "s3m",
        mime: "audio/x-s3m"
      };
    }
    if (this.check([71]) && this.check([71], { offset: 188 })) {
      return {
        ext: "mts",
        mime: "video/mp2t"
      };
    }
    if (this.check([71], { offset: 4 }) && this.check([71], { offset: 196 })) {
      return {
        ext: "mts",
        mime: "video/mp2t"
      };
    }
    if (this.check([66, 79, 79, 75, 77, 79, 66, 73], { offset: 60 })) {
      return {
        ext: "mobi",
        mime: "application/x-mobipocket-ebook"
      };
    }
    if (this.check([68, 73, 67, 77], { offset: 128 })) {
      return {
        ext: "dcm",
        mime: "application/dicom"
      };
    }
    if (this.check([76, 0, 0, 0, 1, 20, 2, 0, 0, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 70])) {
      return {
        ext: "lnk",
        mime: "application/x.ms.shortcut"
        // Invented by us
      };
    }
    if (this.check([98, 111, 111, 107, 0, 0, 0, 0, 109, 97, 114, 107, 0, 0, 0, 0])) {
      return {
        ext: "alias",
        mime: "application/x.apple.alias"
        // Invented by us
      };
    }
    if (this.checkString("Kaydara FBX Binary  \0")) {
      return {
        ext: "fbx",
        mime: "application/x.autodesk.fbx"
        // Invented by us
      };
    }
    if (this.check([76, 80], { offset: 34 }) && (this.check([0, 0, 1], { offset: 8 }) || this.check([1, 0, 2], { offset: 8 }) || this.check([2, 0, 2], { offset: 8 }))) {
      return {
        ext: "eot",
        mime: "application/vnd.ms-fontobject"
      };
    }
    if (this.check([6, 6, 237, 245, 216, 29, 70, 229, 189, 49, 239, 231, 254, 116, 183, 29])) {
      return {
        ext: "indd",
        mime: "application/x-indesign"
      };
    }
    if (this.check([255, 255, 0, 0, 7, 0, 0, 0, 4, 0, 0, 0, 1, 0, 1, 0]) || this.check([0, 0, 255, 255, 0, 0, 0, 7, 0, 0, 0, 4, 0, 1, 0, 1])) {
      return {
        ext: "jmp",
        mime: "application/x-jmp-data"
      };
    }
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(512, tokenizer.fileInfo.size), mayBeLess: true });
    if (this.checkString("ustar", { offset: 257 }) && (this.checkString("\0", { offset: 262 }) || this.checkString(" ", { offset: 262 })) || this.check([0, 0, 0, 0, 0, 0], { offset: 257 }) && tarHeaderChecksumMatches(this.buffer)) {
      return {
        ext: "tar",
        mime: "application/x-tar"
      };
    }
    if (this.check([255, 254])) {
      const encoding = "utf-16le";
      if (this.checkString("<?xml ", { offset: 2, encoding })) {
        return {
          ext: "xml",
          mime: "application/xml"
        };
      }
      if (this.check([255, 14], { offset: 2 }) && this.checkString("SketchUp Model", { offset: 4, encoding })) {
        return {
          ext: "skp",
          mime: "application/vnd.sketchup.skp"
        };
      }
      if (this.checkString("Windows Registry Editor Version 5.00\r\n", { offset: 2, encoding })) {
        return {
          ext: "reg",
          mime: "application/x-ms-regedit"
        };
      }
      return void 0;
    }
    if (this.checkString("-----BEGIN PGP MESSAGE-----")) {
      return {
        ext: "pgp",
        mime: "application/pgp-encrypted"
      };
    }
  };
  // Detections with limited supporting data, resulting in a higher likelihood of false positives
  detectImprecise = async (tokenizer) => {
    this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);
    const fileSize = getKnownFileSizeOrMaximum(tokenizer.fileInfo.size);
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(8, fileSize), mayBeLess: true });
    if (this.check([0, 0, 1, 186]) || this.check([0, 0, 1, 179])) {
      return {
        ext: "mpg",
        mime: "video/mpeg"
      };
    }
    if (this.check([0, 1, 0, 0, 0])) {
      return {
        ext: "ttf",
        mime: "font/ttf"
      };
    }
    if (this.check([0, 0, 1, 0])) {
      return {
        ext: "ico",
        mime: "image/x-icon"
      };
    }
    if (this.check([0, 0, 2, 0])) {
      return {
        ext: "cur",
        mime: "image/x-icon"
      };
    }
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(2 + this.options.mpegOffsetTolerance, fileSize), mayBeLess: true });
    if (this.buffer.length >= 2 + this.options.mpegOffsetTolerance) {
      for (let depth = 0; depth <= this.options.mpegOffsetTolerance; ++depth) {
        const type = this.scanMpeg(depth);
        if (type) {
          return type;
        }
      }
    }
  };
  async readTiffTag(bigEndian) {
    const tagId = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
    await this.tokenizer.ignore(10);
    switch (tagId) {
      case 50341:
        return {
          ext: "arw",
          mime: "image/x-sony-arw"
        };
      case 50706:
        return {
          ext: "dng",
          mime: "image/x-adobe-dng"
        };
      default:
    }
  }
  async readTiffIFD(bigEndian) {
    const numberOfTags = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
    if (numberOfTags > maximumTiffTagCount) {
      return;
    }
    if (hasUnknownFileSize(this.tokenizer) && 2 + numberOfTags * 12 > maximumTiffIfdOffsetInBytes) {
      return;
    }
    for (let n = 0; n < numberOfTags; ++n) {
      const fileType = await this.readTiffTag(bigEndian);
      if (fileType) {
        return fileType;
      }
    }
  }
  async readTiffHeader(bigEndian) {
    const tiffFileType = {
      ext: "tif",
      mime: "image/tiff"
    };
    const version = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 2);
    const ifdOffset = (bigEndian ? UINT32_BE : UINT32_LE).get(this.buffer, 4);
    if (version === 42) {
      if (ifdOffset >= 6) {
        if (this.checkString("CR", { offset: 8 })) {
          return {
            ext: "cr2",
            mime: "image/x-canon-cr2"
          };
        }
        if (ifdOffset >= 8) {
          const someId1 = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 8);
          const someId2 = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 10);
          if (someId1 === 28 && someId2 === 254 || someId1 === 31 && someId2 === 11) {
            return {
              ext: "nef",
              mime: "image/x-nikon-nef"
            };
          }
        }
      }
      if (hasUnknownFileSize(this.tokenizer) && ifdOffset > maximumTiffStreamIfdOffsetInBytes) {
        return tiffFileType;
      }
      const maximumTiffOffset = hasUnknownFileSize(this.tokenizer) ? maximumTiffIfdOffsetInBytes : this.tokenizer.fileInfo.size;
      try {
        await safeIgnore(this.tokenizer, ifdOffset, {
          maximumLength: maximumTiffOffset,
          reason: "TIFF IFD offset"
        });
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        throw error;
      }
      let fileType;
      try {
        fileType = await this.readTiffIFD(bigEndian);
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        throw error;
      }
      return fileType ?? tiffFileType;
    }
    if (version === 43) {
      return tiffFileType;
    }
  }
  /**
  	Scan check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE).
  
  	@param offset - Offset to scan for sync-preamble.
  	@returns {{ext: string, mime: string}}
  	*/
  scanMpeg(offset) {
    if (this.check([255, 224], { offset, mask: [255, 224] })) {
      if (this.check([16], { offset: offset + 1, mask: [22] })) {
        if (this.check([8], { offset: offset + 1, mask: [8] })) {
          return {
            ext: "aac",
            mime: "audio/aac"
          };
        }
        return {
          ext: "aac",
          mime: "audio/aac"
        };
      }
      if (this.check([2], { offset: offset + 1, mask: [6] })) {
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      }
      if (this.check([4], { offset: offset + 1, mask: [6] })) {
        return {
          ext: "mp2",
          mime: "audio/mpeg"
        };
      }
      if (this.check([6], { offset: offset + 1, mask: [6] })) {
        return {
          ext: "mp1",
          mime: "audio/mpeg"
        };
      }
    }
  }
};
var supportedExtensions = new Set(extensions);
var supportedMimeTypes = new Set(mimeTypes);

// node_modules/music-metadata/lib/ParserFactory.js
var import_content_type = __toESM(require_content_type(), 1);
var import_media_typer = __toESM(require_media_typer(), 1);
var import_debug29 = __toESM(require_src(), 1);

// node_modules/music-metadata/lib/common/MetadataCollector.js
init_type();
var import_debug2 = __toESM(require_src(), 1);

// node_modules/music-metadata/lib/common/GenericTagTypes.js
var defaultTagInfo = {
  multiple: false
};
var commonTags = {
  year: defaultTagInfo,
  track: defaultTagInfo,
  disk: defaultTagInfo,
  title: defaultTagInfo,
  artist: defaultTagInfo,
  artists: { multiple: true, unique: true },
  albumartist: defaultTagInfo,
  albumartists: { multiple: true, unique: true },
  album: defaultTagInfo,
  date: defaultTagInfo,
  originaldate: defaultTagInfo,
  originalyear: defaultTagInfo,
  releasedate: defaultTagInfo,
  comment: { multiple: true, unique: false },
  genre: { multiple: true, unique: true },
  picture: { multiple: true, unique: true },
  composer: { multiple: true, unique: true },
  lyrics: { multiple: true, unique: false },
  albumsort: { multiple: false, unique: true },
  titlesort: { multiple: false, unique: true },
  work: { multiple: false, unique: true },
  artistsort: { multiple: false, unique: true },
  albumartistsort: { multiple: false, unique: true },
  composersort: { multiple: false, unique: true },
  lyricist: { multiple: true, unique: true },
  writer: { multiple: true, unique: true },
  conductor: { multiple: true, unique: true },
  remixer: { multiple: true, unique: true },
  arranger: { multiple: true, unique: true },
  engineer: { multiple: true, unique: true },
  producer: { multiple: true, unique: true },
  technician: { multiple: true, unique: true },
  djmixer: { multiple: true, unique: true },
  mixer: { multiple: true, unique: true },
  label: { multiple: true, unique: true },
  grouping: defaultTagInfo,
  subtitle: { multiple: true },
  discsubtitle: defaultTagInfo,
  totaltracks: defaultTagInfo,
  totaldiscs: defaultTagInfo,
  compilation: defaultTagInfo,
  rating: { multiple: true },
  bpm: defaultTagInfo,
  mood: defaultTagInfo,
  media: defaultTagInfo,
  catalognumber: { multiple: true, unique: true },
  tvShow: defaultTagInfo,
  tvShowSort: defaultTagInfo,
  tvSeason: defaultTagInfo,
  tvEpisode: defaultTagInfo,
  tvEpisodeId: defaultTagInfo,
  tvNetwork: defaultTagInfo,
  podcast: defaultTagInfo,
  podcasturl: defaultTagInfo,
  releasestatus: defaultTagInfo,
  releasetype: { multiple: true },
  releasecountry: defaultTagInfo,
  script: defaultTagInfo,
  language: defaultTagInfo,
  copyright: defaultTagInfo,
  license: defaultTagInfo,
  encodedby: defaultTagInfo,
  encodersettings: defaultTagInfo,
  gapless: defaultTagInfo,
  barcode: defaultTagInfo,
  isrc: { multiple: true },
  asin: defaultTagInfo,
  musicbrainz_recordingid: defaultTagInfo,
  musicbrainz_trackid: defaultTagInfo,
  musicbrainz_albumid: defaultTagInfo,
  musicbrainz_artistid: { multiple: true },
  musicbrainz_albumartistid: { multiple: true },
  musicbrainz_releasegroupid: defaultTagInfo,
  musicbrainz_workid: defaultTagInfo,
  musicbrainz_trmid: defaultTagInfo,
  musicbrainz_discid: defaultTagInfo,
  acoustid_id: defaultTagInfo,
  acoustid_fingerprint: defaultTagInfo,
  musicip_puid: defaultTagInfo,
  musicip_fingerprint: defaultTagInfo,
  website: defaultTagInfo,
  "performer:instrument": { multiple: true, unique: true },
  averageLevel: defaultTagInfo,
  peakLevel: defaultTagInfo,
  notes: { multiple: true, unique: false },
  key: defaultTagInfo,
  originalalbum: defaultTagInfo,
  originalartist: defaultTagInfo,
  discogs_artist_id: { multiple: true, unique: true },
  discogs_release_id: defaultTagInfo,
  discogs_label_id: defaultTagInfo,
  discogs_master_release_id: defaultTagInfo,
  discogs_votes: defaultTagInfo,
  discogs_rating: defaultTagInfo,
  replaygain_track_peak: defaultTagInfo,
  replaygain_track_gain: defaultTagInfo,
  replaygain_album_peak: defaultTagInfo,
  replaygain_album_gain: defaultTagInfo,
  replaygain_track_minmax: defaultTagInfo,
  replaygain_album_minmax: defaultTagInfo,
  replaygain_undo: defaultTagInfo,
  description: { multiple: true },
  longDescription: defaultTagInfo,
  category: { multiple: true },
  hdVideo: defaultTagInfo,
  keywords: { multiple: true },
  movement: defaultTagInfo,
  movementIndex: defaultTagInfo,
  movementTotal: defaultTagInfo,
  podcastId: defaultTagInfo,
  showMovement: defaultTagInfo,
  stik: defaultTagInfo,
  playCounter: defaultTagInfo
};
function isSingleton(alias) {
  return commonTags[alias] && !commonTags[alias].multiple;
}
function isUnique(alias) {
  return !commonTags[alias].multiple || commonTags[alias].unique || false;
}

// node_modules/music-metadata/lib/common/GenericTagMapper.js
var CommonTagMapper = class {
  static toIntOrNull(str) {
    const cleaned = Number.parseInt(str, 10);
    return Number.isNaN(cleaned) ? null : cleaned;
  }
  // TODO: a string of 1of1 would fail to be converted
  // converts 1/10 to no : 1, of : 10
  // or 1 to no : 1, of : 0
  static normalizeTrack(origVal) {
    const split = origVal.toString().split("/");
    return {
      no: Number.parseInt(split[0], 10) || null,
      of: Number.parseInt(split[1], 10) || null
    };
  }
  constructor(tagTypes, tagMap2) {
    this.tagTypes = tagTypes;
    this.tagMap = tagMap2;
  }
  /**
   * Process and set common tags
   * write common tags to
   * @param tag Native tag
   * @param warnings Register warnings
   * @return common name
   */
  mapGenericTag(tag, warnings) {
    tag = { id: tag.id, value: tag.value };
    this.postMap(tag, warnings);
    const id = this.getCommonName(tag.id);
    return id ? { id, value: tag.value } : null;
  }
  /**
   * Convert native tag key to common tag key
   * @param tag Native header tag
   * @return common tag name (alias)
   */
  getCommonName(tag) {
    return this.tagMap[tag];
  }
  /**
   * Handle post mapping exceptions / correction
   * @param tag Tag e.g. {"©alb", "Buena Vista Social Club")
   * @param warnings Used to register warnings
   */
  postMap(_tag, _warnings) {
    return;
  }
};
CommonTagMapper.maxRatingScore = 1;

// node_modules/music-metadata/lib/id3v1/ID3v1TagMap.js
var id3v1TagMap = {
  title: "title",
  artist: "artist",
  album: "album",
  year: "year",
  comment: "comment",
  track: "track",
  genre: "genre"
};
var ID3v1TagMapper = class extends CommonTagMapper {
  constructor() {
    super(["ID3v1"], id3v1TagMap);
  }
};

// node_modules/music-metadata/lib/id3v2/ID3v24TagMapper.js
init_lib3();

// node_modules/music-metadata/lib/common/CaseInsensitiveTagMap.js
var CaseInsensitiveTagMap = class extends CommonTagMapper {
  constructor(tagTypes, tagMap2) {
    const upperCaseMap = {};
    for (const tag of Object.keys(tagMap2)) {
      upperCaseMap[tag.toUpperCase()] = tagMap2[tag];
    }
    super(tagTypes, upperCaseMap);
  }
  /**
   * @tag  Native header tag
   * @return common tag name (alias)
   */
  getCommonName(tag) {
    return this.tagMap[tag.toUpperCase()];
  }
};

// node_modules/music-metadata/lib/id3v2/ID3v24TagMapper.js
init_Util();
var id3v24TagMap = {
  // id3v2.3
  TIT2: "title",
  TPE1: "artist",
  "TXXX:Artists": "artists",
  TPE2: "albumartist",
  TALB: "album",
  TDRV: "date",
  // [ 'date', 'year' ] ToDo: improve 'year' mapping
  /**
   * Original release year
   */
  TORY: "originalyear",
  TPOS: "disk",
  TCON: "genre",
  APIC: "picture",
  TCOM: "composer",
  USLT: "lyrics",
  TSOA: "albumsort",
  TSOT: "titlesort",
  TOAL: "originalalbum",
  TSOP: "artistsort",
  TSO2: "albumartistsort",
  TSOC: "composersort",
  TEXT: "lyricist",
  "TXXX:Writer": "writer",
  TPE3: "conductor",
  // 'IPLS:instrument': 'performer:instrument', // ToDo
  TPE4: "remixer",
  "IPLS:arranger": "arranger",
  "IPLS:engineer": "engineer",
  "IPLS:producer": "producer",
  "IPLS:DJ-mix": "djmixer",
  "IPLS:mix": "mixer",
  TPUB: "label",
  TIT1: "grouping",
  TIT3: "subtitle",
  TRCK: "track",
  TCMP: "compilation",
  POPM: "rating",
  TBPM: "bpm",
  TMED: "media",
  "TXXX:CATALOGNUMBER": "catalognumber",
  "TXXX:MusicBrainz Album Status": "releasestatus",
  "TXXX:MusicBrainz Album Type": "releasetype",
  /**
   * Release country as documented: https://picard.musicbrainz.org/docs/mappings/#cite_note-0
   */
  "TXXX:MusicBrainz Album Release Country": "releasecountry",
  /**
   * Release country as implemented // ToDo: report
   */
  "TXXX:RELEASECOUNTRY": "releasecountry",
  "TXXX:SCRIPT": "script",
  TLAN: "language",
  TCOP: "copyright",
  WCOP: "license",
  TENC: "encodedby",
  TSSE: "encodersettings",
  "TXXX:BARCODE": "barcode",
  "TXXX:ISRC": "isrc",
  TSRC: "isrc",
  "TXXX:ASIN": "asin",
  "TXXX:originalyear": "originalyear",
  "UFID:http://musicbrainz.org": "musicbrainz_recordingid",
  "TXXX:MusicBrainz Release Track Id": "musicbrainz_trackid",
  "TXXX:MusicBrainz Album Id": "musicbrainz_albumid",
  "TXXX:MusicBrainz Artist Id": "musicbrainz_artistid",
  "TXXX:MusicBrainz Album Artist Id": "musicbrainz_albumartistid",
  "TXXX:MusicBrainz Release Group Id": "musicbrainz_releasegroupid",
  "TXXX:MusicBrainz Work Id": "musicbrainz_workid",
  "TXXX:MusicBrainz TRM Id": "musicbrainz_trmid",
  "TXXX:MusicBrainz Disc Id": "musicbrainz_discid",
  "TXXX:ACOUSTID_ID": "acoustid_id",
  "TXXX:Acoustid Id": "acoustid_id",
  "TXXX:Acoustid Fingerprint": "acoustid_fingerprint",
  "TXXX:MusicIP PUID": "musicip_puid",
  "TXXX:MusicMagic Fingerprint": "musicip_fingerprint",
  WOAR: "website",
  // id3v2.4
  // ToDo: In same sequence as defined at http://id3.org/id3v2.4.0-frames
  TDRC: "date",
  // date YYYY-MM-DD
  TYER: "year",
  TDOR: "originaldate",
  // 'TMCL:instrument': 'performer:instrument',
  "TIPL:arranger": "arranger",
  "TIPL:engineer": "engineer",
  "TIPL:producer": "producer",
  "TIPL:DJ-mix": "djmixer",
  "TIPL:mix": "mixer",
  TMOO: "mood",
  // additional mappings:
  SYLT: "lyrics",
  TSST: "discsubtitle",
  TKEY: "key",
  COMM: "comment",
  TOPE: "originalartist",
  // Windows Media Player
  "PRIV:AverageLevel": "averageLevel",
  "PRIV:PeakLevel": "peakLevel",
  // Discogs
  "TXXX:DISCOGS_ARTIST_ID": "discogs_artist_id",
  "TXXX:DISCOGS_ARTISTS": "artists",
  "TXXX:DISCOGS_ARTIST_NAME": "artists",
  "TXXX:DISCOGS_ALBUM_ARTISTS": "albumartist",
  "TXXX:DISCOGS_CATALOG": "catalognumber",
  "TXXX:DISCOGS_COUNTRY": "releasecountry",
  "TXXX:DISCOGS_DATE": "originaldate",
  "TXXX:DISCOGS_LABEL": "label",
  "TXXX:DISCOGS_LABEL_ID": "discogs_label_id",
  "TXXX:DISCOGS_MASTER_RELEASE_ID": "discogs_master_release_id",
  "TXXX:DISCOGS_RATING": "discogs_rating",
  "TXXX:DISCOGS_RELEASED": "date",
  "TXXX:DISCOGS_RELEASE_ID": "discogs_release_id",
  "TXXX:DISCOGS_VOTES": "discogs_votes",
  "TXXX:CATALOGID": "catalognumber",
  "TXXX:STYLE": "genre",
  "TXXX:REPLAYGAIN_TRACK_PEAK": "replaygain_track_peak",
  "TXXX:REPLAYGAIN_TRACK_GAIN": "replaygain_track_gain",
  "TXXX:REPLAYGAIN_ALBUM_PEAK": "replaygain_album_peak",
  "TXXX:REPLAYGAIN_ALBUM_GAIN": "replaygain_album_gain",
  "TXXX:MP3GAIN_MINMAX": "replaygain_track_minmax",
  "TXXX:MP3GAIN_ALBUM_MINMAX": "replaygain_album_minmax",
  "TXXX:MP3GAIN_UNDO": "replaygain_undo",
  MVNM: "movement",
  MVIN: "movementIndex",
  PCST: "podcast",
  TCAT: "category",
  TDES: "description",
  TDRL: "releasedate",
  TGID: "podcastId",
  TKWD: "keywords",
  WFED: "podcasturl",
  GRP1: "grouping",
  PCNT: "playCounter"
};
var ID3v24TagMapper = class _ID3v24TagMapper extends CaseInsensitiveTagMap {
  static toRating(popm) {
    return {
      source: popm.email,
      rating: popm.rating > 0 ? (popm.rating - 1) / 254 * CommonTagMapper.maxRatingScore : void 0
    };
  }
  constructor() {
    super(["ID3v2.3", "ID3v2.4"], id3v24TagMap);
  }
  /**
   * Handle post mapping exceptions / correction
   * @param tag to post map
   * @param warnings Wil be used to register (collect) warnings
   */
  postMap(tag, warnings) {
    switch (tag.id) {
      case "UFID":
        {
          const idTag = tag.value;
          if (idTag.owner_identifier === "http://musicbrainz.org") {
            tag.id += `:${idTag.owner_identifier}`;
            tag.value = decodeString(idTag.identifier, "latin1");
          }
        }
        break;
      case "PRIV":
        {
          const customTag = tag.value;
          switch (customTag.owner_identifier) {
            // decode Windows Media Player
            case "AverageLevel":
            case "PeakValue":
              tag.id += `:${customTag.owner_identifier}`;
              tag.value = customTag.data.length === 4 ? UINT32_LE.get(customTag.data, 0) : null;
              if (tag.value === null) {
                warnings.addWarning("Failed to parse PRIV:PeakValue");
              }
              break;
            default:
              warnings.addWarning(`Unknown PRIV owner-identifier: ${customTag.data}`);
          }
        }
        break;
      case "POPM":
        tag.value = _ID3v24TagMapper.toRating(tag.value);
        break;
      default:
        break;
    }
  }
};

// node_modules/music-metadata/lib/asf/AsfTagMapper.js
var asfTagMap = {
  Title: "title",
  Author: "artist",
  "WM/AlbumArtist": "albumartist",
  "WM/AlbumTitle": "album",
  "WM/Year": "date",
  // changed to 'year' to 'date' based on Picard mappings; ToDo: check me
  "WM/OriginalReleaseTime": "originaldate",
  "WM/OriginalReleaseYear": "originalyear",
  Description: "comment",
  "WM/TrackNumber": "track",
  "WM/PartOfSet": "disk",
  "WM/Genre": "genre",
  "WM/Composer": "composer",
  "WM/Lyrics": "lyrics",
  "WM/AlbumSortOrder": "albumsort",
  "WM/TitleSortOrder": "titlesort",
  "WM/ArtistSortOrder": "artistsort",
  "WM/AlbumArtistSortOrder": "albumartistsort",
  "WM/ComposerSortOrder": "composersort",
  "WM/Writer": "lyricist",
  "WM/Conductor": "conductor",
  "WM/ModifiedBy": "remixer",
  "WM/Engineer": "engineer",
  "WM/Producer": "producer",
  "WM/DJMixer": "djmixer",
  "WM/Mixer": "mixer",
  "WM/Publisher": "label",
  "WM/ContentGroupDescription": "grouping",
  "WM/SubTitle": "subtitle",
  "WM/SetSubTitle": "discsubtitle",
  // 'WM/PartOfSet': 'totaldiscs',
  "WM/IsCompilation": "compilation",
  "WM/SharedUserRating": "rating",
  "WM/BeatsPerMinute": "bpm",
  "WM/Mood": "mood",
  "WM/Media": "media",
  "WM/CatalogNo": "catalognumber",
  "MusicBrainz/Album Status": "releasestatus",
  "MusicBrainz/Album Type": "releasetype",
  "MusicBrainz/Album Release Country": "releasecountry",
  "WM/Script": "script",
  "WM/Language": "language",
  Copyright: "copyright",
  LICENSE: "license",
  "WM/EncodedBy": "encodedby",
  "WM/EncodingSettings": "encodersettings",
  "WM/Barcode": "barcode",
  "WM/ISRC": "isrc",
  "MusicBrainz/Track Id": "musicbrainz_recordingid",
  "MusicBrainz/Release Track Id": "musicbrainz_trackid",
  "MusicBrainz/Album Id": "musicbrainz_albumid",
  "MusicBrainz/Artist Id": "musicbrainz_artistid",
  "MusicBrainz/Album Artist Id": "musicbrainz_albumartistid",
  "MusicBrainz/Release Group Id": "musicbrainz_releasegroupid",
  "MusicBrainz/Work Id": "musicbrainz_workid",
  "MusicBrainz/TRM Id": "musicbrainz_trmid",
  "MusicBrainz/Disc Id": "musicbrainz_discid",
  "Acoustid/Id": "acoustid_id",
  "Acoustid/Fingerprint": "acoustid_fingerprint",
  "MusicIP/PUID": "musicip_puid",
  "WM/ARTISTS": "artists",
  "WM/InitialKey": "key",
  ASIN: "asin",
  "WM/Work": "work",
  "WM/AuthorURL": "website",
  "WM/Picture": "picture"
};
var AsfTagMapper = class _AsfTagMapper extends CommonTagMapper {
  static toRating(rating) {
    return {
      rating: Number.parseFloat(rating + 1) / 5
    };
  }
  constructor() {
    super(["asf"], asfTagMap);
  }
  postMap(tag) {
    switch (tag.id) {
      case "WM/SharedUserRating": {
        const keys = tag.id.split(":");
        tag.value = _AsfTagMapper.toRating(tag.value);
        tag.id = keys[0];
        break;
      }
    }
  }
};

// node_modules/music-metadata/lib/id3v2/ID3v22TagMapper.js
var id3v22TagMap = {
  TT2: "title",
  TP1: "artist",
  TP2: "albumartist",
  TAL: "album",
  TYE: "year",
  COM: "comment",
  TRK: "track",
  TPA: "disk",
  TCO: "genre",
  PIC: "picture",
  TCM: "composer",
  TOR: "originaldate",
  TOT: "originalalbum",
  TXT: "lyricist",
  TP3: "conductor",
  TPB: "label",
  TT1: "grouping",
  TT3: "subtitle",
  TLA: "language",
  TCR: "copyright",
  WCP: "license",
  TEN: "encodedby",
  TSS: "encodersettings",
  WAR: "website",
  PCS: "podcast",
  TCP: "compilation",
  TDR: "date",
  TS2: "albumartistsort",
  TSA: "albumsort",
  TSC: "composersort",
  TSP: "artistsort",
  TST: "titlesort",
  WFD: "podcasturl",
  TBP: "bpm",
  GP1: "grouping"
};
var ID3v22TagMapper = class extends CaseInsensitiveTagMap {
  constructor() {
    super(["ID3v2.2"], id3v22TagMap);
  }
};

// node_modules/music-metadata/lib/apev2/APEv2TagMapper.js
var apev2TagMap = {
  Title: "title",
  Artist: "artist",
  Artists: "artists",
  "Album Artist": "albumartist",
  Album: "album",
  Year: "date",
  Originalyear: "originalyear",
  Originaldate: "originaldate",
  Releasedate: "releasedate",
  Comment: "comment",
  Track: "track",
  Disc: "disk",
  DISCNUMBER: "disk",
  // ToDo: backwards compatibility', valid tag?
  Genre: "genre",
  "Cover Art (Front)": "picture",
  "Cover Art (Back)": "picture",
  Composer: "composer",
  Lyrics: "lyrics",
  ALBUMSORT: "albumsort",
  TITLESORT: "titlesort",
  WORK: "work",
  ARTISTSORT: "artistsort",
  ALBUMARTISTSORT: "albumartistsort",
  COMPOSERSORT: "composersort",
  Lyricist: "lyricist",
  Writer: "writer",
  Conductor: "conductor",
  // 'Performer=artist (instrument)': 'performer:instrument',
  MixArtist: "remixer",
  Arranger: "arranger",
  Engineer: "engineer",
  Producer: "producer",
  DJMixer: "djmixer",
  Mixer: "mixer",
  Label: "label",
  Grouping: "grouping",
  Subtitle: "subtitle",
  DiscSubtitle: "discsubtitle",
  Compilation: "compilation",
  BPM: "bpm",
  Mood: "mood",
  Media: "media",
  CatalogNumber: "catalognumber",
  MUSICBRAINZ_ALBUMSTATUS: "releasestatus",
  MUSICBRAINZ_ALBUMTYPE: "releasetype",
  RELEASECOUNTRY: "releasecountry",
  Script: "script",
  Language: "language",
  Copyright: "copyright",
  LICENSE: "license",
  EncodedBy: "encodedby",
  EncoderSettings: "encodersettings",
  Barcode: "barcode",
  ISRC: "isrc",
  ASIN: "asin",
  musicbrainz_trackid: "musicbrainz_recordingid",
  musicbrainz_releasetrackid: "musicbrainz_trackid",
  MUSICBRAINZ_ALBUMID: "musicbrainz_albumid",
  MUSICBRAINZ_ARTISTID: "musicbrainz_artistid",
  MUSICBRAINZ_ALBUMARTISTID: "musicbrainz_albumartistid",
  MUSICBRAINZ_RELEASEGROUPID: "musicbrainz_releasegroupid",
  MUSICBRAINZ_WORKID: "musicbrainz_workid",
  MUSICBRAINZ_TRMID: "musicbrainz_trmid",
  MUSICBRAINZ_DISCID: "musicbrainz_discid",
  Acoustid_Id: "acoustid_id",
  ACOUSTID_FINGERPRINT: "acoustid_fingerprint",
  MUSICIP_PUID: "musicip_puid",
  Weblink: "website",
  REPLAYGAIN_TRACK_GAIN: "replaygain_track_gain",
  REPLAYGAIN_TRACK_PEAK: "replaygain_track_peak",
  MP3GAIN_MINMAX: "replaygain_track_minmax",
  MP3GAIN_UNDO: "replaygain_undo"
};
var APEv2TagMapper = class extends CaseInsensitiveTagMap {
  constructor() {
    super(["APEv2"], apev2TagMap);
  }
};

// node_modules/music-metadata/lib/mp4/MP4TagMapper.js
var mp4TagMap = {
  "\xA9nam": "title",
  "\xA9ART": "artist",
  aART: "albumartist",
  /**
   * ToDo: Album artist seems to be stored here while Picard documentation says: aART
   */
  "----:com.apple.iTunes:Band": "albumartist",
  "\xA9alb": "album",
  "\xA9day": "date",
  "\xA9cmt": "comment",
  "\xA9com": "comment",
  trkn: "track",
  disk: "disk",
  "\xA9gen": "genre",
  covr: "picture",
  "\xA9wrt": "composer",
  "\xA9lyr": "lyrics",
  soal: "albumsort",
  sonm: "titlesort",
  soar: "artistsort",
  soaa: "albumartistsort",
  soco: "composersort",
  "----:com.apple.iTunes:LYRICIST": "lyricist",
  "----:com.apple.iTunes:CONDUCTOR": "conductor",
  "----:com.apple.iTunes:REMIXER": "remixer",
  "----:com.apple.iTunes:ENGINEER": "engineer",
  "----:com.apple.iTunes:PRODUCER": "producer",
  "----:com.apple.iTunes:DJMIXER": "djmixer",
  "----:com.apple.iTunes:MIXER": "mixer",
  "----:com.apple.iTunes:LABEL": "label",
  "\xA9grp": "grouping",
  "----:com.apple.iTunes:SUBTITLE": "subtitle",
  "----:com.apple.iTunes:DISCSUBTITLE": "discsubtitle",
  cpil: "compilation",
  tmpo: "bpm",
  "----:com.apple.iTunes:MOOD": "mood",
  "----:com.apple.iTunes:MEDIA": "media",
  "----:com.apple.iTunes:CATALOGNUMBER": "catalognumber",
  tvsh: "tvShow",
  tvsn: "tvSeason",
  tves: "tvEpisode",
  sosn: "tvShowSort",
  tven: "tvEpisodeId",
  tvnn: "tvNetwork",
  pcst: "podcast",
  purl: "podcasturl",
  "----:com.apple.iTunes:MusicBrainz Album Status": "releasestatus",
  "----:com.apple.iTunes:MusicBrainz Album Type": "releasetype",
  "----:com.apple.iTunes:MusicBrainz Album Release Country": "releasecountry",
  "----:com.apple.iTunes:SCRIPT": "script",
  "----:com.apple.iTunes:LANGUAGE": "language",
  cprt: "copyright",
  "\xA9cpy": "copyright",
  "----:com.apple.iTunes:LICENSE": "license",
  "\xA9too": "encodedby",
  pgap: "gapless",
  "----:com.apple.iTunes:BARCODE": "barcode",
  "----:com.apple.iTunes:ISRC": "isrc",
  "----:com.apple.iTunes:ASIN": "asin",
  "----:com.apple.iTunes:NOTES": "comment",
  "----:com.apple.iTunes:MusicBrainz Track Id": "musicbrainz_recordingid",
  "----:com.apple.iTunes:MusicBrainz Release Track Id": "musicbrainz_trackid",
  "----:com.apple.iTunes:MusicBrainz Album Id": "musicbrainz_albumid",
  "----:com.apple.iTunes:MusicBrainz Artist Id": "musicbrainz_artistid",
  "----:com.apple.iTunes:MusicBrainz Album Artist Id": "musicbrainz_albumartistid",
  "----:com.apple.iTunes:MusicBrainz Release Group Id": "musicbrainz_releasegroupid",
  "----:com.apple.iTunes:MusicBrainz Work Id": "musicbrainz_workid",
  "----:com.apple.iTunes:MusicBrainz TRM Id": "musicbrainz_trmid",
  "----:com.apple.iTunes:MusicBrainz Disc Id": "musicbrainz_discid",
  "----:com.apple.iTunes:Acoustid Id": "acoustid_id",
  "----:com.apple.iTunes:Acoustid Fingerprint": "acoustid_fingerprint",
  "----:com.apple.iTunes:MusicIP PUID": "musicip_puid",
  "----:com.apple.iTunes:fingerprint": "musicip_fingerprint",
  "----:com.apple.iTunes:replaygain_track_gain": "replaygain_track_gain",
  "----:com.apple.iTunes:replaygain_track_peak": "replaygain_track_peak",
  "----:com.apple.iTunes:replaygain_album_gain": "replaygain_album_gain",
  "----:com.apple.iTunes:replaygain_album_peak": "replaygain_album_peak",
  "----:com.apple.iTunes:replaygain_track_minmax": "replaygain_track_minmax",
  "----:com.apple.iTunes:replaygain_album_minmax": "replaygain_album_minmax",
  "----:com.apple.iTunes:replaygain_undo": "replaygain_undo",
  // Additional mappings:
  gnre: "genre",
  // ToDo: check mapping
  "----:com.apple.iTunes:ALBUMARTISTSORT": "albumartistsort",
  "----:com.apple.iTunes:ARTISTS": "artists",
  "----:com.apple.iTunes:ORIGINALDATE": "originaldate",
  "----:com.apple.iTunes:ORIGINALYEAR": "originalyear",
  "----:com.apple.iTunes:RELEASEDATE": "releasedate",
  // '----:com.apple.iTunes:PERFORMER': 'performer'
  desc: "description",
  ldes: "longDescription",
  "\xA9mvn": "movement",
  "\xA9mvi": "movementIndex",
  "\xA9mvc": "movementTotal",
  "\xA9wrk": "work",
  catg: "category",
  egid: "podcastId",
  hdvd: "hdVideo",
  keyw: "keywords",
  shwm: "showMovement",
  stik: "stik",
  rate: "rating"
};
var tagType = "iTunes";
var MP4TagMapper = class extends CaseInsensitiveTagMap {
  constructor() {
    super([tagType], mp4TagMap);
  }
  postMap(tag, _warnings) {
    switch (tag.id) {
      case "rate":
        tag.value = {
          source: void 0,
          rating: Number.parseFloat(tag.value) / 100
        };
        break;
    }
  }
};

// node_modules/music-metadata/lib/ogg/vorbis/VorbisTagMapper.js
var vorbisTagMap = {
  TITLE: "title",
  ARTIST: "artist",
  ARTISTS: "artists",
  ALBUMARTIST: "albumartist",
  "ALBUM ARTIST": "albumartist",
  ALBUM: "album",
  DATE: "date",
  ORIGINALDATE: "originaldate",
  ORIGINALYEAR: "originalyear",
  RELEASEDATE: "releasedate",
  COMMENT: "comment",
  TRACKNUMBER: "track",
  DISCNUMBER: "disk",
  GENRE: "genre",
  METADATA_BLOCK_PICTURE: "picture",
  COMPOSER: "composer",
  LYRICS: "lyrics",
  ALBUMSORT: "albumsort",
  TITLESORT: "titlesort",
  WORK: "work",
  ARTISTSORT: "artistsort",
  ALBUMARTISTSORT: "albumartistsort",
  COMPOSERSORT: "composersort",
  LYRICIST: "lyricist",
  WRITER: "writer",
  CONDUCTOR: "conductor",
  // 'PERFORMER=artist (instrument)': 'performer:instrument', // ToDo
  REMIXER: "remixer",
  ARRANGER: "arranger",
  ENGINEER: "engineer",
  PRODUCER: "producer",
  DJMIXER: "djmixer",
  MIXER: "mixer",
  LABEL: "label",
  GROUPING: "grouping",
  SUBTITLE: "subtitle",
  DISCSUBTITLE: "discsubtitle",
  TRACKTOTAL: "totaltracks",
  DISCTOTAL: "totaldiscs",
  COMPILATION: "compilation",
  RATING: "rating",
  BPM: "bpm",
  KEY: "key",
  MOOD: "mood",
  MEDIA: "media",
  CATALOGNUMBER: "catalognumber",
  RELEASESTATUS: "releasestatus",
  RELEASETYPE: "releasetype",
  RELEASECOUNTRY: "releasecountry",
  SCRIPT: "script",
  LANGUAGE: "language",
  COPYRIGHT: "copyright",
  LICENSE: "license",
  ENCODEDBY: "encodedby",
  ENCODERSETTINGS: "encodersettings",
  BARCODE: "barcode",
  ISRC: "isrc",
  ASIN: "asin",
  MUSICBRAINZ_TRACKID: "musicbrainz_recordingid",
  MUSICBRAINZ_RELEASETRACKID: "musicbrainz_trackid",
  MUSICBRAINZ_ALBUMID: "musicbrainz_albumid",
  MUSICBRAINZ_ARTISTID: "musicbrainz_artistid",
  MUSICBRAINZ_ALBUMARTISTID: "musicbrainz_albumartistid",
  MUSICBRAINZ_RELEASEGROUPID: "musicbrainz_releasegroupid",
  MUSICBRAINZ_WORKID: "musicbrainz_workid",
  MUSICBRAINZ_TRMID: "musicbrainz_trmid",
  MUSICBRAINZ_DISCID: "musicbrainz_discid",
  ACOUSTID_ID: "acoustid_id",
  ACOUSTID_ID_FINGERPRINT: "acoustid_fingerprint",
  MUSICIP_PUID: "musicip_puid",
  // 'FINGERPRINT=MusicMagic Fingerprint {fingerprint}': 'musicip_fingerprint', // ToDo
  WEBSITE: "website",
  NOTES: "notes",
  TOTALTRACKS: "totaltracks",
  TOTALDISCS: "totaldiscs",
  // Discogs
  DISCOGS_ARTIST_ID: "discogs_artist_id",
  DISCOGS_ARTISTS: "artists",
  DISCOGS_ARTIST_NAME: "artists",
  DISCOGS_ALBUM_ARTISTS: "albumartist",
  DISCOGS_CATALOG: "catalognumber",
  DISCOGS_COUNTRY: "releasecountry",
  DISCOGS_DATE: "originaldate",
  DISCOGS_LABEL: "label",
  DISCOGS_LABEL_ID: "discogs_label_id",
  DISCOGS_MASTER_RELEASE_ID: "discogs_master_release_id",
  DISCOGS_RATING: "discogs_rating",
  DISCOGS_RELEASED: "date",
  DISCOGS_RELEASE_ID: "discogs_release_id",
  DISCOGS_VOTES: "discogs_votes",
  CATALOGID: "catalognumber",
  STYLE: "genre",
  //
  REPLAYGAIN_TRACK_GAIN: "replaygain_track_gain",
  REPLAYGAIN_TRACK_PEAK: "replaygain_track_peak",
  REPLAYGAIN_ALBUM_GAIN: "replaygain_album_gain",
  REPLAYGAIN_ALBUM_PEAK: "replaygain_album_peak",
  // To Sure if these (REPLAYGAIN_MINMAX, REPLAYGAIN_ALBUM_MINMAX & REPLAYGAIN_UNDO) are used for Vorbis:
  REPLAYGAIN_MINMAX: "replaygain_track_minmax",
  REPLAYGAIN_ALBUM_MINMAX: "replaygain_album_minmax",
  REPLAYGAIN_UNDO: "replaygain_undo"
};
var VorbisTagMapper = class _VorbisTagMapper extends CommonTagMapper {
  static toRating(email, rating, maxScore) {
    return {
      source: email ? email.toLowerCase() : void 0,
      rating: Number.parseFloat(rating) / maxScore * CommonTagMapper.maxRatingScore
    };
  }
  constructor() {
    super(["vorbis"], vorbisTagMap);
  }
  postMap(tag) {
    if (tag.id === "RATING") {
      tag.value = _VorbisTagMapper.toRating(void 0, tag.value, 100);
    } else if (tag.id.indexOf("RATING:") === 0) {
      const keys = tag.id.split(":");
      tag.value = _VorbisTagMapper.toRating(keys[1], tag.value, 1);
      tag.id = keys[0];
    }
  }
};

// node_modules/music-metadata/lib/riff/RiffInfoTagMap.js
var riffInfoTagMap = {
  IART: "artist",
  // Artist
  ICRD: "date",
  // DateCreated
  INAM: "title",
  // Title
  TITL: "title",
  IPRD: "album",
  // Product
  ITRK: "track",
  IPRT: "track",
  // Additional tag for track index
  COMM: "comment",
  // Comments
  ICMT: "comment",
  // Country
  ICNT: "releasecountry",
  GNRE: "genre",
  // Genre
  IWRI: "writer",
  // WrittenBy
  RATE: "rating",
  YEAR: "year",
  ISFT: "encodedby",
  // Software
  CODE: "encodedby",
  // EncodedBy
  TURL: "website",
  // URL,
  IGNR: "genre",
  // Genre
  IENG: "engineer",
  // Engineer
  ITCH: "technician",
  // Technician
  IMED: "media",
  // Original Media
  IRPD: "album"
  // Product, where the file was intended for
};
var RiffInfoTagMapper = class extends CommonTagMapper {
  constructor() {
    super(["exif"], riffInfoTagMap);
  }
};

// node_modules/music-metadata/lib/matroska/MatroskaTagMapper.js
var ebmlTagMap = {
  "segment:title": "title",
  "album:ARTIST": "albumartist",
  "album:ARTISTSORT": "albumartistsort",
  "album:TITLE": "album",
  "album:DATE_RECORDED": "originaldate",
  "album:DATE_RELEASED": "releasedate",
  "album:PART_NUMBER": "disk",
  "album:TOTAL_PARTS": "totaltracks",
  "track:ARTIST": "artist",
  "track:ARTISTSORT": "artistsort",
  "track:TITLE": "title",
  "track:PART_NUMBER": "track",
  "track:MUSICBRAINZ_TRACKID": "musicbrainz_recordingid",
  "track:MUSICBRAINZ_ALBUMID": "musicbrainz_albumid",
  "track:MUSICBRAINZ_ARTISTID": "musicbrainz_artistid",
  "track:PUBLISHER": "label",
  "track:GENRE": "genre",
  "track:ENCODER": "encodedby",
  "track:ENCODER_OPTIONS": "encodersettings",
  "edition:TOTAL_PARTS": "totaldiscs",
  picture: "picture"
};
var MatroskaTagMapper = class extends CaseInsensitiveTagMap {
  constructor() {
    super(["matroska"], ebmlTagMap);
  }
};

// node_modules/music-metadata/lib/aiff/AiffTagMap.js
var tagMap = {
  NAME: "title",
  AUTH: "artist",
  "(c) ": "copyright",
  ANNO: "comment"
};
var AiffTagMapper = class extends CommonTagMapper {
  constructor() {
    super(["AIFF"], tagMap);
  }
};

// node_modules/music-metadata/lib/common/CombinedTagMapper.js
init_ParseError();
var CombinedTagMapper = class {
  constructor() {
    this.tagMappers = {};
    [
      new ID3v1TagMapper(),
      new ID3v22TagMapper(),
      new ID3v24TagMapper(),
      new MP4TagMapper(),
      new MP4TagMapper(),
      new VorbisTagMapper(),
      new APEv2TagMapper(),
      new AsfTagMapper(),
      new RiffInfoTagMapper(),
      new MatroskaTagMapper(),
      new AiffTagMapper()
    ].forEach((mapper) => {
      this.registerTagMapper(mapper);
    });
  }
  /**
   * Convert native to generic (common) tags
   * @param tagType Originating tag format
   * @param tag     Native tag to map to a generic tag id
   * @param warnings
   * @return Generic tag result (output of this function)
   */
  mapTag(tagType2, tag, warnings) {
    const tagMapper = this.tagMappers[tagType2];
    if (tagMapper) {
      return this.tagMappers[tagType2].mapGenericTag(tag, warnings);
    }
    throw new InternalParserError(`No generic tag mapper defined for tag-format: ${tagType2}`);
  }
  registerTagMapper(genericTagMapper) {
    for (const tagType2 of genericTagMapper.tagTypes) {
      this.tagMappers[tagType2] = genericTagMapper;
    }
  }
};

// node_modules/music-metadata/lib/common/MetadataCollector.js
init_Util();

// node_modules/music-metadata/lib/lrc/LyricsParser.js
init_type();
var TIMESTAMP_REGEX = /\[(\d{2}):(\d{2})\.(\d{2,3})]/;
function parseLyrics(input) {
  if (TIMESTAMP_REGEX.test(input)) {
    return parseLrc(input);
  }
  return toUnsyncedLyrics(input);
}
function toUnsyncedLyrics(lyrics) {
  return {
    contentType: LyricsContentType.lyrics,
    timeStampFormat: TimestampFormat.notSynchronized,
    text: lyrics.trim(),
    syncText: []
  };
}
function parseLrc(lrcString) {
  const lines = lrcString.split("\n");
  const syncText = [];
  for (const line of lines) {
    const match = line.match(TIMESTAMP_REGEX);
    if (match) {
      const minutes = Number.parseInt(match[1], 10);
      const seconds = Number.parseInt(match[2], 10);
      const ms = match[3].length === 3 ? Number.parseInt(match[3], 10) : Number.parseInt(match[3], 10) * 10;
      const timestamp = (minutes * 60 + seconds) * 1e3 + ms;
      const text = line.replace(TIMESTAMP_REGEX, "").trim();
      syncText.push({ timestamp, text });
    }
  }
  return {
    contentType: LyricsContentType.lyrics,
    timeStampFormat: TimestampFormat.milliseconds,
    text: syncText.map((line) => line.text).join("\n"),
    syncText
  };
}

// node_modules/music-metadata/lib/common/MetadataCollector.js
var debug2 = (0, import_debug2.default)("music-metadata:collector");
var TagPriority = ["matroska", "APEv2", "vorbis", "ID3v2.4", "ID3v2.3", "ID3v2.2", "exif", "asf", "iTunes", "AIFF", "ID3v1"];
var MetadataCollector = class {
  constructor(opts) {
    this.format = {
      tagTypes: [],
      trackInfo: []
    };
    this.native = {};
    this.common = {
      track: { no: null, of: null },
      disk: { no: null, of: null },
      movementIndex: { no: null, of: null }
    };
    this.quality = {
      warnings: []
    };
    this.commonOrigin = {};
    this.originPriority = {};
    this.tagMapper = new CombinedTagMapper();
    this.opts = opts;
    let priority = 1;
    for (const tagType2 of TagPriority) {
      this.originPriority[tagType2] = priority++;
    }
    this.originPriority.artificial = 500;
    this.originPriority.id3v1 = 600;
  }
  /**
   * @returns {boolean} true if one or more tags have been found
   */
  hasAny() {
    return Object.keys(this.native).length > 0;
  }
  addStreamInfo(streamInfo) {
    debug2(`streamInfo: type=${streamInfo.type ? TrackTypeValueToKeyMap[streamInfo.type] : "?"}, codec=${streamInfo.codecName}`);
    this.format.trackInfo.push(streamInfo);
  }
  setFormat(key, value) {
    debug2(`format: ${key} = ${value}`);
    this.format[key] = value;
    if (this.opts?.observer) {
      this.opts.observer({ metadata: this, tag: { type: "format", id: key, value } });
    }
  }
  setAudioOnly() {
    this.setFormat("hasAudio", true);
    this.setFormat("hasVideo", false);
  }
  async addTag(tagType2, tagId, value) {
    debug2(`tag ${tagType2}.${tagId} = ${value}`);
    if (!this.native[tagType2]) {
      this.format.tagTypes.push(tagType2);
      this.native[tagType2] = [];
    }
    this.native[tagType2].push({ id: tagId, value });
    await this.toCommon(tagType2, tagId, value);
  }
  addWarning(warning) {
    this.quality.warnings.push({ message: warning });
  }
  async postMap(tagType2, tag) {
    switch (tag.id) {
      case "artist":
        return this.handleSingularArtistTag(tagType2, tag, "artist", "artists");
      case "albumartist":
        return this.handleSingularArtistTag(tagType2, tag, "albumartist", "albumartists");
      case "artists":
        return this.handlePluralArtistTag(tagType2, tag, "artist", "artists");
      case "albumartists":
        return this.handlePluralArtistTag(tagType2, tag, "albumartist", "albumartists");
      case "picture":
        return this.postFixPicture(tag.value).then((picture) => {
          if (picture !== null) {
            tag.value = picture;
            this.setGenericTag(tagType2, tag);
          }
        });
      case "totaltracks":
        this.common.track.of = CommonTagMapper.toIntOrNull(tag.value);
        return;
      case "totaldiscs":
        this.common.disk.of = CommonTagMapper.toIntOrNull(tag.value);
        return;
      case "movementTotal":
        this.common.movementIndex.of = CommonTagMapper.toIntOrNull(tag.value);
        return;
      case "track":
      case "disk":
      case "movementIndex": {
        const of = this.common[tag.id].of;
        this.common[tag.id] = CommonTagMapper.normalizeTrack(tag.value);
        this.common[tag.id].of = of != null ? of : this.common[tag.id].of;
        return;
      }
      case "bpm":
      case "year":
      case "originalyear":
        tag.value = Number.parseInt(tag.value, 10);
        break;
      case "date": {
        const year = Number.parseInt(tag.value.substr(0, 4), 10);
        if (!Number.isNaN(year)) {
          this.common.year = year;
        }
        break;
      }
      case "discogs_label_id":
      case "discogs_release_id":
      case "discogs_master_release_id":
      case "discogs_artist_id":
      case "discogs_votes":
        tag.value = typeof tag.value === "string" ? Number.parseInt(tag.value, 10) : tag.value;
        break;
      case "replaygain_track_gain":
      case "replaygain_track_peak":
      case "replaygain_album_gain":
      case "replaygain_album_peak":
        tag.value = toRatio(tag.value);
        break;
      case "replaygain_track_minmax":
        tag.value = tag.value.split(",").map((v) => Number.parseInt(v, 10));
        break;
      case "replaygain_undo": {
        const minMix = tag.value.split(",").map((v) => Number.parseInt(v, 10));
        tag.value = {
          leftChannel: minMix[0],
          rightChannel: minMix[1]
        };
        break;
      }
      case "gapless":
      // iTunes gap-less flag
      case "compilation":
      case "podcast":
      case "showMovement":
        tag.value = tag.value === "1" || tag.value === 1;
        break;
      case "isrc": {
        const commonTag = this.common[tag.id];
        if (commonTag && commonTag.indexOf(tag.value) !== -1)
          return;
        break;
      }
      case "comment":
        if (typeof tag.value === "string") {
          tag.value = { text: tag.value };
        }
        if (tag.value.descriptor === "iTunPGAP") {
          this.setGenericTag(tagType2, { id: "gapless", value: tag.value.text === "1" });
        }
        break;
      case "lyrics":
        if (typeof tag.value === "string") {
          tag.value = parseLyrics(tag.value);
        }
        break;
      default:
    }
    if (tag.value !== null) {
      this.setGenericTag(tagType2, tag);
    }
  }
  /**
   * Convert native tags to common tags
   * @returns {IAudioMetadata} Native + common tags
   */
  toCommonMetadata() {
    return {
      format: this.format,
      native: this.native,
      quality: this.quality,
      common: this.common
    };
  }
  /**
   * Handle singular artist tags (artist, albumartist) and cross-populate to plural form
   */
  handleSingularArtistTag(tagType2, tag, singularId, pluralId) {
    if (this.commonOrigin[singularId] === this.originPriority[tagType2]) {
      return this.postMap("artificial", { id: pluralId, value: tag.value });
    }
    if (!this.common[pluralId]) {
      this.setGenericTag("artificial", { id: pluralId, value: tag.value });
    }
    this.setGenericTag(tagType2, tag);
  }
  /**
   * Handle plural artist tags (artists, albumartists) and cross-populate to singular form
   */
  handlePluralArtistTag(tagType2, tag, singularId, pluralId) {
    if (!this.common[singularId] || this.commonOrigin[singularId] === this.originPriority.artificial) {
      if (!this.common[pluralId] || this.common[pluralId].indexOf(tag.value) === -1) {
        const values = (this.common[pluralId] || []).concat([tag.value]);
        const value = joinArtists(values);
        this.setGenericTag("artificial", { id: singularId, value });
      }
    }
    this.setGenericTag(tagType2, tag);
  }
  /**
   * Fix some common issues with picture object
   * @param picture Picture
   */
  async postFixPicture(picture) {
    if (picture.data && picture.data.length > 0) {
      if (!picture.format) {
        const fileType = await fileTypeFromBuffer(Uint8Array.from(picture.data));
        if (fileType) {
          picture.format = fileType.mime;
        } else {
          return null;
        }
      }
      picture.format = picture.format.toLocaleLowerCase();
      switch (picture.format) {
        case "image/jpg":
          picture.format = "image/jpeg";
      }
      return picture;
    }
    this.addWarning("Empty picture tag found");
    return null;
  }
  /**
   * Convert native tag to common tags
   */
  async toCommon(tagType2, tagId, value) {
    const tag = { id: tagId, value };
    const genericTag = this.tagMapper.mapTag(tagType2, tag, this);
    if (genericTag) {
      await this.postMap(tagType2, genericTag);
    }
  }
  /**
   * Set generic tag
   */
  setGenericTag(tagType2, tag) {
    debug2(`common.${tag.id} = ${tag.value}`);
    const prio0 = this.commonOrigin[tag.id] || 1e3;
    const prio1 = this.originPriority[tagType2];
    if (isSingleton(tag.id)) {
      if (prio1 <= prio0) {
        this.common[tag.id] = tag.value;
        this.commonOrigin[tag.id] = prio1;
      } else {
        return debug2(`Ignore native tag (singleton): ${tagType2}.${tag.id} = ${tag.value}`);
      }
    } else {
      if (prio1 === prio0) {
        if (!isUnique(tag.id) || this.common[tag.id].indexOf(tag.value) === -1) {
          this.common[tag.id].push(tag.value);
        } else {
          debug2(`Ignore duplicate value: ${tagType2}.${tag.id} = ${tag.value}`);
        }
      } else if (prio1 < prio0) {
        this.common[tag.id] = [tag.value];
        this.commonOrigin[tag.id] = prio1;
      } else {
        return debug2(`Ignore native tag (list): ${tagType2}.${tag.id} = ${tag.value}`);
      }
    }
    if (this.opts?.observer) {
      this.opts.observer({ metadata: this, tag: { type: "common", id: tag.id, value: tag.value } });
    }
  }
};
function joinArtists(artists) {
  if (artists.length > 2) {
    return `${artists.slice(0, artists.length - 1).join(", ")} & ${artists[artists.length - 1]}`;
  }
  return artists.join(" & ");
}

// node_modules/music-metadata/lib/ParserFactory.js
init_type();

// node_modules/music-metadata/lib/mpeg/MpegLoader.js
var mpegParserLoader = {
  parserType: "mpeg",
  extensions: [".mp2", ".mp3", ".m2a", ".aac", "aacp"],
  mimeTypes: ["audio/mpeg", "audio/mp3", "audio/aacs", "audio/aacp"],
  async load() {
    return (await Promise.resolve().then(() => (init_MpegParser(), MpegParser_exports))).MpegParser;
  }
};

// node_modules/music-metadata/lib/ParserFactory.js
init_ParseError();

// node_modules/music-metadata/lib/apev2/Apev2Loader.js
var apeParserLoader = {
  parserType: "apev2",
  extensions: [".ape"],
  mimeTypes: ["audio/ape", "audio/monkeys-audio"],
  async load() {
    return (await Promise.resolve().then(() => (init_APEv2Parser(), APEv2Parser_exports))).APEv2Parser;
  }
};

// node_modules/music-metadata/lib/asf/AsfLoader.js
var asfParserLoader = {
  parserType: "asf",
  extensions: [".asf", ".wma", ".wmv"],
  mimeTypes: ["audio/ms-wma", "video/ms-wmv", "audio/ms-asf", "video/ms-asf", "application/vnd.ms-asf"],
  async load() {
    return (await Promise.resolve().then(() => (init_AsfParser(), AsfParser_exports))).AsfParser;
  }
};

// node_modules/music-metadata/lib/dsdiff/DsdiffLoader.js
var dsdiffParserLoader = {
  parserType: "dsdiff",
  extensions: [".dff"],
  mimeTypes: ["audio/dsf", "audio/dsd"],
  async load() {
    return (await Promise.resolve().then(() => (init_DsdiffParser(), DsdiffParser_exports))).DsdiffParser;
  }
};

// node_modules/music-metadata/lib/aiff/AiffLoader.js
var aiffParserLoader = {
  parserType: "aiff",
  extensions: [".aif", "aiff", "aifc"],
  mimeTypes: ["audio/aiff", "audio/aif", "audio/aifc", "application/aiff"],
  async load() {
    return (await Promise.resolve().then(() => (init_AiffParser(), AiffParser_exports))).AIFFParser;
  }
};

// node_modules/music-metadata/lib/dsf/DsfLoader.js
var dsfParserLoader = {
  parserType: "dsf",
  extensions: [".dsf"],
  mimeTypes: ["audio/dsf"],
  async load() {
    return (await Promise.resolve().then(() => (init_DsfParser(), DsfParser_exports))).DsfParser;
  }
};

// node_modules/music-metadata/lib/flac/FlacLoader.js
var flacParserLoader = {
  parserType: "flac",
  extensions: [".flac"],
  mimeTypes: ["audio/flac"],
  async load() {
    return (await Promise.resolve().then(() => (init_FlacParser(), FlacParser_exports))).FlacParser;
  }
};

// node_modules/music-metadata/lib/matroska/MatroskaLoader.js
var matroskaParserLoader = {
  parserType: "matroska",
  extensions: [".mka", ".mkv", ".mk3d", ".mks", "webm"],
  mimeTypes: ["audio/matroska", "video/matroska", "audio/webm", "video/webm"],
  async load() {
    return (await Promise.resolve().then(() => (init_MatroskaParser(), MatroskaParser_exports))).MatroskaParser;
  }
};

// node_modules/music-metadata/lib/mp4/Mp4Loader.js
var mp4ParserLoader = {
  parserType: "mp4",
  extensions: [".mp4", ".m4a", ".m4b", ".m4pa", "m4v", "m4r", "3gp", ".mov", ".movie", ".qt"],
  mimeTypes: ["audio/mp4", "audio/m4a", "video/m4v", "video/mp4", "video/quicktime"],
  async load() {
    return (await Promise.resolve().then(() => (init_MP4Parser(), MP4Parser_exports))).MP4Parser;
  }
};

// node_modules/music-metadata/lib/musepack/MusepackLoader.js
var musepackParserLoader = {
  parserType: "musepack",
  extensions: [".mpc"],
  mimeTypes: ["audio/musepack"],
  async load() {
    return (await Promise.resolve().then(() => (init_MusepackParser(), MusepackParser_exports))).MusepackParser;
  }
};

// node_modules/music-metadata/lib/ogg/OggLoader.js
var oggParserLoader = {
  parserType: "ogg",
  extensions: [".ogg", ".ogv", ".oga", ".ogm", ".ogx", ".opus", ".spx"],
  mimeTypes: ["audio/ogg", "audio/opus", "audio/speex", "video/ogg"],
  // RFC 7845, RFC 6716, RFC 5574
  async load() {
    return (await Promise.resolve().then(() => (init_OggParser(), OggParser_exports))).OggParser;
  }
};

// node_modules/music-metadata/lib/wavpack/WavPackLoader.js
var wavpackParserLoader = {
  parserType: "wavpack",
  extensions: [".wv", ".wvp"],
  mimeTypes: ["audio/wavpack"],
  async load() {
    return (await Promise.resolve().then(() => (init_WavPackParser(), WavPackParser_exports))).WavPackParser;
  }
};

// node_modules/music-metadata/lib/wav/WaveLoader.js
var riffParserLoader = {
  parserType: "riff",
  extensions: [".wav", "wave", ".bwf"],
  mimeTypes: ["audio/vnd.wave", "audio/wav", "audio/wave"],
  async load() {
    return (await Promise.resolve().then(() => (init_WaveParser(), WaveParser_exports))).WaveParser;
  }
};

// node_modules/music-metadata/lib/ParserFactory.js
var debug29 = (0, import_debug29.default)("music-metadata:parser:factory");
function parseHttpContentType(contentType) {
  const type = import_content_type.default.parse(contentType);
  const mime = (0, import_media_typer.parse)(type.type);
  return {
    type: mime.type,
    subtype: mime.subtype,
    suffix: mime.suffix,
    parameters: type.parameters
  };
}
var ParserFactory = class {
  constructor() {
    this.parsers = [];
    [
      flacParserLoader,
      mpegParserLoader,
      apeParserLoader,
      mp4ParserLoader,
      matroskaParserLoader,
      riffParserLoader,
      oggParserLoader,
      asfParserLoader,
      aiffParserLoader,
      wavpackParserLoader,
      musepackParserLoader,
      dsfParserLoader,
      dsdiffParserLoader
    ].forEach((parser) => {
      this.registerParser(parser);
    });
  }
  registerParser(parser) {
    this.parsers.push(parser);
  }
  async parse(tokenizer, parserLoader, opts) {
    if (tokenizer.supportsRandomAccess()) {
      debug29("tokenizer supports random-access, scanning for appending headers");
      await scanAppendingHeaders(tokenizer, opts);
    } else {
      debug29("tokenizer does not support random-access, cannot scan for appending headers");
    }
    if (!parserLoader) {
      const buf = new Uint8Array(4100);
      if (tokenizer.fileInfo.mimeType) {
        parserLoader = this.findLoaderForContentType(tokenizer.fileInfo.mimeType);
      }
      if (!parserLoader && tokenizer.fileInfo.path) {
        parserLoader = this.findLoaderForExtension(tokenizer.fileInfo.path);
      }
      if (!parserLoader) {
        debug29("Guess parser on content...");
        await tokenizer.peekBuffer(buf, { mayBeLess: true });
        const guessedType = await fileTypeFromBuffer(buf, { mpegOffsetTolerance: 10 });
        if (!guessedType || !guessedType.mime) {
          throw new CouldNotDetermineFileTypeError("Failed to determine audio format");
        }
        debug29(`Guessed file type is mime=${guessedType.mime}, extension=${guessedType.ext}`);
        parserLoader = this.findLoaderForContentType(guessedType.mime);
        if (!parserLoader) {
          throw new UnsupportedFileTypeError(`Guessed MIME-type not supported: ${guessedType.mime}`);
        }
      }
    }
    debug29(`Loading ${parserLoader.parserType} parser...`);
    const metadata = new MetadataCollector(opts);
    const ParserImpl = await parserLoader.load();
    const parser = new ParserImpl(metadata, tokenizer, opts ?? {});
    debug29(`Parser ${parserLoader.parserType} loaded`);
    await parser.parse();
    if (metadata.format.trackInfo) {
      if (metadata.format.hasAudio === void 0) {
        metadata.setFormat("hasAudio", !!metadata.format.trackInfo.find((track) => track.type === TrackType.audio));
      }
      if (metadata.format.hasVideo === void 0) {
        metadata.setFormat("hasVideo", !!metadata.format.trackInfo.find((track) => track.type === TrackType.video));
      }
    }
    return metadata.toCommonMetadata();
  }
  /**
   * @param filePath - Path, filename or extension to audio file
   * @return Parser submodule name
   */
  findLoaderForExtension(filePath) {
    if (!filePath)
      return;
    const extension = getExtension(filePath).toLocaleLowerCase() || filePath;
    return this.parsers.find((parser) => parser.extensions.indexOf(extension) !== -1);
  }
  findLoaderForContentType(httpContentType) {
    let mime;
    if (!httpContentType)
      return;
    try {
      mime = parseHttpContentType(httpContentType);
    } catch (_err) {
      debug29(`Invalid HTTP Content-Type header value: ${httpContentType}`);
      return;
    }
    const subType = mime.subtype.indexOf("x-") === 0 ? mime.subtype.substring(2) : mime.subtype;
    return this.parsers.find((parser) => parser.mimeTypes.find((loader) => loader.indexOf(`${mime.type}/${subType}`) !== -1));
  }
  getSupportedMimeTypes() {
    const mimeTypeSet = /* @__PURE__ */ new Set();
    this.parsers.forEach((loader) => {
      loader.mimeTypes.forEach((mimeType) => {
        mimeTypeSet.add(mimeType);
        mimeTypeSet.add(mimeType.replace("/", "/x-"));
      });
    });
    return Array.from(mimeTypeSet);
  }
};
function getExtension(fname) {
  const i = fname.lastIndexOf(".");
  return i === -1 ? "" : fname.substring(i);
}

// node_modules/music-metadata/lib/core.js
init_APEv2Parser();
init_ID3v1Parser();

// node_modules/music-metadata/lib/lyrics3/Lyrics3.js
init_lib2();
var endTag2 = "LYRICS200";
async function getLyricsHeaderLength(tokenizer) {
  const fileSize = tokenizer.fileInfo.size;
  if (fileSize >= 143) {
    const buf = new Uint8Array(15);
    const position = tokenizer.position;
    await tokenizer.readBuffer(buf, { position: fileSize - 143 });
    tokenizer.setPosition(position);
    const txt = textDecode(buf, "latin1");
    const tag = txt.substring(6);
    if (tag === endTag2) {
      return Number.parseInt(txt.substring(0, 6), 10) + 15;
    }
  }
  return 0;
}

// node_modules/music-metadata/lib/core.js
init_ParseError();
init_ParseError();
async function scanAppendingHeaders(tokenizer, options = {}) {
  let apeOffset = tokenizer.fileInfo.size;
  if (await hasID3v1Header(tokenizer)) {
    apeOffset -= 128;
    const lyricsLen = await getLyricsHeaderLength(tokenizer);
    apeOffset -= lyricsLen;
  }
  options.apeHeader = await APEv2Parser.findApeFooterOffset(tokenizer, apeOffset);
}

// node_modules/music-metadata/lib/index.js
var debug30 = (0, import_debug30.default)("music-metadata:parser");
async function parseFile(filePath, options = {}) {
  debug30(`parseFile: ${filePath}`);
  const fileTokenizer = await fromFile(filePath);
  const parserFactory = new ParserFactory();
  try {
    const parserLoader = parserFactory.findLoaderForExtension(filePath);
    if (!parserLoader)
      debug30("Parser could not be determined by file extension");
    try {
      return await parserFactory.parse(fileTokenizer, parserLoader, options);
    } catch (error) {
      if (error instanceof CouldNotDetermineFileTypeError || error instanceof UnsupportedFileTypeError) {
        error.message += `: ${filePath}`;
      }
      throw error;
    }
  } finally {
    await fileTokenizer.close();
  }
}

// src/plugins/state-keys.ts
function getPluginSettingsStateKey(pluginId) {
  return `plugins.settings.${pluginId}`;
}

// ../nexus-plugins/musica/src/audio-repository.ts
function toDateText(value) {
  if (value == null || value === "") {
    return null;
  }
  return value instanceof Date ? value.toISOString() : String(value);
}
var MusicaAudioRepository = class {
  constructor(sqlite) {
    this.sqlite = sqlite;
  }
  sqlite;
  normalizeTrack(row) {
    if (!row) {
      return null;
    }
    return {
      ...row,
      metadataCompleted: Boolean(row.metadataCompleted),
      authors: this.getAuthorsForTrackSync(String(row.id))
    };
  }
  getAuthorsForTrackSync(trackId) {
    return this.sqlite.prepare(`
      SELECT aa.id, aa.name, ata.position
      FROM audio_authors aa
      INNER JOIN audio_track_authors ata ON ata.authorId = aa.id
      WHERE ata.audioTrackId = ?
      ORDER BY ata.position ASC, aa.name ASC
    `).all(trackId);
  }
  async findTrackWithAuthors(itemId) {
    const row = this.sqlite.prepare("SELECT * FROM audio_tracks WHERE id = ?").get(itemId);
    return this.normalizeTrack(row);
  }
  async deleteTrack(itemId) {
    this.sqlite.prepare("DELETE FROM audio_tracks WHERE id = ?").run(itemId);
  }
  async upsertTrack(payload) {
    const normalized = {
      kind: "song",
      duration: null,
      genre: null,
      album: null,
      year: null,
      trackNumber: null,
      discNumber: null,
      mimeType: null,
      bitrate: null,
      sampleRate: null,
      bitsPerSample: null,
      cover: null,
      coverMimeType: null,
      ...payload,
      metadataCompleted: payload.metadataCompleted ? 1 : 0,
      lastScannedAt: toDateText(payload.lastScannedAt)
    };
    this.sqlite.prepare(`
      INSERT INTO audio_tracks (
        id, kind, name, duration, genre, album, year, trackNumber, discNumber,
        mimeType, bitrate, sampleRate, bitsPerSample, cover, coverMimeType,
        metadataCompleted, lastScannedAt
      ) VALUES (
        @id, @kind, @name, @duration, @genre, @album, @year, @trackNumber, @discNumber,
        @mimeType, @bitrate, @sampleRate, @bitsPerSample, @cover, @coverMimeType,
        @metadataCompleted, @lastScannedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        kind = excluded.kind,
        name = excluded.name,
        duration = excluded.duration,
        genre = excluded.genre,
        album = excluded.album,
        year = excluded.year,
        trackNumber = excluded.trackNumber,
        discNumber = excluded.discNumber,
        mimeType = excluded.mimeType,
        bitrate = excluded.bitrate,
        sampleRate = excluded.sampleRate,
        bitsPerSample = excluded.bitsPerSample,
        cover = excluded.cover,
        coverMimeType = excluded.coverMimeType,
        metadataCompleted = excluded.metadataCompleted,
        lastScannedAt = excluded.lastScannedAt
    `).run(normalized);
    return this.findTrackWithAuthors(payload.id);
  }
  async replaceTrackAuthors(trackId, authorNames) {
    const transaction = this.sqlite.transaction((names) => {
      this.sqlite.prepare("DELETE FROM audio_track_authors WHERE audioTrackId = ?").run(trackId);
      const insertAuthor = this.sqlite.prepare(`
        INSERT INTO audio_authors (name)
        VALUES (?)
        ON CONFLICT(name) DO NOTHING
      `);
      const findAuthor = this.sqlite.prepare("SELECT id FROM audio_authors WHERE name = ?");
      const insertJoin = this.sqlite.prepare(`
        INSERT INTO audio_track_authors (audioTrackId, authorId, position)
        VALUES (?, ?, ?)
      `);
      for (const [index, name] of names.entries()) {
        insertAuthor.run(name);
        const author = findAuthor.get(name);
        if (author?.id != null) {
          insertJoin.run(trackId, author.id, index);
        }
      }
    });
    transaction(authorNames);
  }
};

// ../nexus-plugins/musica/src/plugin-settings.js
var MUSICA_ENGINE_ID = "nexus.musica.audio";
var MUSICA_SETTINGS_DEFAULTS = Object.freeze({
  extractEmbeddedCoverArt: true,
  engineAssignments: []
});
function normalizeItemId(value) {
  const normalized = String(value || "").trim();
  return normalized || "";
}
function normalizeRelativePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+/g, "/").replace(/\/$/, "").trim();
}
function normalizeMusicaSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...MUSICA_SETTINGS_DEFAULTS
    };
  }
  return {
    ...MUSICA_SETTINGS_DEFAULTS,
    ...value
  };
}
function isMusicaEmbeddedCoverArtEnabled(value) {
  return normalizeMusicaSettings(value).extractEmbeddedCoverArt !== false;
}
function normalizeMusicaAssignment(assignment) {
  return {
    engineId: MUSICA_ENGINE_ID,
    rootItemId: normalizeItemId(assignment?.rootItemId),
    rootPath: normalizeRelativePath(assignment?.rootPath),
    recursive: typeof assignment?.recursive === "boolean" ? assignment.recursive : true
  };
}
function readMusicaEngineAssignments(settingsValue) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const assignments = Array.isArray(normalizedSettings.engineAssignments) ? normalizedSettings.engineAssignments : [];
  return assignments.filter((assignment) => assignment?.engineId === MUSICA_ENGINE_ID).map(normalizeMusicaAssignment).filter((assignment) => assignment.rootItemId || assignment.rootPath);
}
function writeMusicaEngineAssignments(settingsValue, assignments) {
  const normalizedSettings = normalizeMusicaSettings(settingsValue);
  const retainedAssignments = Array.isArray(normalizedSettings.engineAssignments) ? normalizedSettings.engineAssignments.filter(
    (assignment) => assignment?.engineId !== MUSICA_ENGINE_ID
  ) : [];
  return {
    ...normalizedSettings,
    engineAssignments: [
      ...retainedAssignments,
      ...assignments.map(normalizeMusicaAssignment).filter((assignment) => assignment.rootItemId || assignment.rootPath)
    ]
  };
}
function resolveEmbeddedCoverPayload({
  enabled = true,
  cover = null,
  coverMimeType = null
} = {}) {
  if (!enabled) {
    return {
      cover: null,
      coverMimeType: null
    };
  }
  return {
    cover: cover ?? null,
    coverMimeType: coverMimeType ?? null
  };
}

// ../nexus-plugins/musica/src/audio-indexing.ts
var AUDIO_EXTENSIONS = /* @__PURE__ */ new Set([
  "aac",
  "aif",
  "aiff",
  "alac",
  "flac",
  "m4a",
  "mp3",
  "ogg",
  "oga",
  "opus",
  "wav",
  "webm",
  "wma"
]);
function getMusicaAudioRepository(repositories) {
  return new MusicaAudioRepository(repositories.sqlite);
}
function bufferToDataUrl(data, mime = "image/jpeg") {
  if (!data) {
    return null;
  }
  return `data:${mime};base64,${Buffer.from(data).toString("base64")}`;
}
function getModelValue(record, field) {
  if (record && typeof record.get === "function") {
    return record.get(field);
  }
  return record?.[field];
}
function getAudioItemName(item) {
  const itemName = getModelValue(item, "name");
  if (typeof itemName === "string" && itemName) {
    return import_node_path.default.basename(itemName, import_node_path.default.extname(itemName));
  }
  const filePath = getModelValue(item, "path");
  if (typeof filePath === "string" && filePath) {
    return import_node_path.default.basename(filePath, import_node_path.default.extname(filePath));
  }
  return String(getModelValue(item, "id") ?? "");
}
function isSupportedAudioItem(item) {
  if (!item || getModelValue(item, "type") !== "file") {
    return false;
  }
  const extension = String(getModelValue(item, "extension") ?? "").replace(/^\./, "").toLowerCase();
  if (extension) {
    return AUDIO_EXTENSIONS.has(extension);
  }
  const filePath = getModelValue(item, "path");
  if (typeof filePath !== "string" || !filePath) {
    return false;
  }
  return AUDIO_EXTENSIONS.has(import_node_path.default.extname(filePath).replace(/^\./, "").toLowerCase());
}
function getContentRelativePath(contentPath, itemPath) {
  const normalizedContentPath = String(contentPath || "").replace(/\\/g, "/").replace(/\/$/, "");
  const normalizedItemPath = String(itemPath || "").replace(/\\/g, "/");
  if (!normalizedContentPath || !normalizedItemPath) {
    return "";
  }
  if (normalizedItemPath.startsWith(`${normalizedContentPath}/`)) {
    return normalizedItemPath.slice(normalizedContentPath.length + 1);
  }
  return "";
}
async function assignmentMatchesItemById(repositories, item, assignment) {
  const rootItemId = String(assignment?.rootItemId || "").trim();
  if (!rootItemId) {
    return false;
  }
  let currentParentId = String(getModelValue(item, "parentId") ?? "").trim();
  let depth = 1;
  while (currentParentId) {
    if (currentParentId === rootItemId) {
      return assignment.recursive !== false || depth === 1;
    }
    const parentItem = await repositories.items.findById(currentParentId);
    currentParentId = String(getModelValue(parentItem, "parentId") ?? "").trim();
    depth += 1;
  }
  return false;
}
function assignmentMatchesPath(assignment, relativeItemPath) {
  const normalizedRoot = normalizeRelativePath(assignment.rootPath);
  const normalizedItemPath = normalizeRelativePath(relativeItemPath);
  if (!normalizedRoot || !normalizedItemPath) {
    return false;
  }
  if (normalizedItemPath === normalizedRoot) {
    return true;
  }
  if (!normalizedItemPath.startsWith(`${normalizedRoot}/`)) {
    return false;
  }
  if (assignment.recursive !== false) {
    return true;
  }
  const suffix = normalizedItemPath.slice(normalizedRoot.length + 1);
  return !suffix.includes("/");
}
async function getMusicaEngineAssignments(ctx) {
  const rawSettingsValue = ctx.settings?.get ? await ctx.settings.get() : await ctx.state.get(
    getPluginSettingsStateKey(ctx.pluginId || "nexus.musica")
  );
  return readMusicaEngineAssignments(normalizeMusicaSettings(rawSettingsValue));
}
async function getMusicaPluginSettings(ctx) {
  const rawSettingsValue = ctx.settings?.get ? await ctx.settings.get() : await ctx.state.get(
    getPluginSettingsStateKey(ctx.pluginId || "nexus.musica")
  );
  return normalizeMusicaSettings(rawSettingsValue);
}
async function isMusicaCoverArtEnabled(ctx) {
  return isMusicaEmbeddedCoverArtEnabled(await getMusicaPluginSettings(ctx));
}
async function isMusicaAssignedItem(ctx, item) {
  if (!isSupportedAudioItem(item)) {
    return false;
  }
  const relativeItemPath = getContentRelativePath(
    ctx.vault.contentPath,
    String(getModelValue(item, "path") ?? "")
  );
  if (!relativeItemPath) {
    return false;
  }
  const assignments = await getMusicaEngineAssignments(ctx);
  const repositories = ctx.requireRepositories();
  for (const assignment of assignments) {
    if (await assignmentMatchesItemById(repositories, item, assignment)) {
      return true;
    }
    if (!assignment?.rootItemId && assignmentMatchesPath(assignment, relativeItemPath)) {
      return true;
    }
  }
  return false;
}
function dedupeStrings(values) {
  const unique = /* @__PURE__ */ new Set();
  for (const value of values) {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (normalized) {
      unique.add(normalized);
    }
  }
  return [...unique];
}
function extractAuthors(metadata) {
  const fromArtists = Array.isArray(metadata?.common?.artists) ? metadata.common.artists : [];
  const fromArtist = typeof metadata?.common?.artist === "string" ? [metadata.common.artist] : [];
  return dedupeStrings([...fromArtists, ...fromArtist]);
}
async function parseAudioMetadata(filePath, { includeCovers = true } = {}) {
  if (!filePath || !import_node_fs.default.existsSync(filePath)) {
    return null;
  }
  try {
    return await parseFile(filePath, { skipCovers: !includeCovers });
  } catch (error) {
    console.warn("music-metadata fallo para", filePath, error);
    return null;
  }
}
function getMetadataMimeType(metadata) {
  return metadata?.format ? metadata.format.mimeType ?? null : null;
}
function getAudioTrackAuthorNames(track) {
  const authors = Array.isArray(track?.authors) ? [...track.authors] : [];
  return authors.sort((left, right) => Number(left.position ?? 0) - Number(right.position ?? 0)).map((author) => {
    const name = getModelValue(author, "name");
    return typeof name === "string" ? name.trim() : "";
  }).filter(Boolean);
}
async function findAudioTrackWithAuthors(repositories, itemId) {
  if (!itemId) {
    return null;
  }
  return getMusicaAudioRepository(repositories).findTrackWithAuthors(itemId);
}
async function replaceAudioAuthors(repositories, audioId, authorNames) {
  await getMusicaAudioRepository(repositories).replaceTrackAuthors(audioId, authorNames);
}
async function ensureAudioTrackWithAuthors(repositories, item, options = {
  structuralChanged: true,
  contentChanged: true,
  extractEmbeddedCoverArt: true
}) {
  const itemId = String(getModelValue(item, "id") ?? "");
  let track = await findAudioTrackWithAuthors(repositories, itemId);
  if (track) {
    return track;
  }
  await syncAudioTrackRecord(repositories, item, options);
  track = await findAudioTrackWithAuthors(repositories, itemId);
  return track;
}
async function syncAudioTrackRecord(repositories, item, options) {
  const itemId = String(getModelValue(item, "id") ?? "");
  const existingTrack = itemId ? await findAudioTrackWithAuthors(repositories, itemId) : null;
  if (!isSupportedAudioItem(item)) {
    if (existingTrack) {
      await getMusicaAudioRepository(repositories).deleteTrack(itemId);
    }
    return null;
  }
  if (existingTrack && !options.structuralChanged && !options.contentChanged) {
    return existingTrack;
  }
  const filePath = getModelValue(item, "path");
  const extractEmbeddedCoverArt = options.extractEmbeddedCoverArt !== false;
  const metadata = typeof filePath === "string" && filePath ? await parseAudioMetadata(filePath, {
    includeCovers: extractEmbeddedCoverArt
  }) : null;
  const metadataCompleted = Boolean(getModelValue(existingTrack, "metadataCompleted"));
  const picture = extractEmbeddedCoverArt ? metadata?.common?.picture?.[0] : null;
  const authorNames = extractAuthors(metadata);
  const currentTrackName = getModelValue(existingTrack, "name");
  const shouldRefreshNameFromFile = options.structuralChanged || !metadataCompleted && !currentTrackName;
  const technicalPayload = {
    duration: Number.isFinite(metadata?.format?.duration) ? metadata.format.duration : null,
    mimeType: getMetadataMimeType(metadata),
    bitrate: Number.isFinite(metadata?.format?.bitrate) ? metadata.format.bitrate : null,
    sampleRate: Number.isFinite(metadata?.format?.sampleRate) ? metadata.format.sampleRate : null,
    bitsPerSample: Number.isFinite(metadata?.format?.bitsPerSample) ? metadata.format.bitsPerSample : null,
    lastScannedAt: /* @__PURE__ */ new Date()
  };
  const embeddedCoverPayload = resolveEmbeddedCoverPayload({
    enabled: extractEmbeddedCoverArt,
    cover: picture ? bufferToDataUrl(picture.data, picture.format) : null,
    coverMimeType: picture?.format ?? null
  });
  const editablePayload = {
    name: getAudioItemName(item),
    genre: Array.isArray(metadata?.common?.genre) ? metadata.common.genre.filter(Boolean).join(", ") : null,
    album: metadata?.common?.album ?? null,
    year: Number.isFinite(metadata?.common?.year) ? metadata.common.year : null,
    trackNumber: Number.isFinite(metadata?.common?.track?.no) ? metadata.common.track.no : null,
    discNumber: Number.isFinite(metadata?.common?.disk?.no) ? metadata.common.disk.no : null,
    ...embeddedCoverPayload
  };
  const payload = existingTrack ? {
    id: itemId,
    kind: getModelValue(existingTrack, "kind") ?? "song",
    name: shouldRefreshNameFromFile ? editablePayload.name : getModelValue(existingTrack, "name"),
    genre: getModelValue(existingTrack, "genre"),
    album: getModelValue(existingTrack, "album"),
    year: getModelValue(existingTrack, "year"),
    trackNumber: getModelValue(existingTrack, "trackNumber"),
    discNumber: getModelValue(existingTrack, "discNumber"),
    cover: extractEmbeddedCoverArt ? !metadataCompleted && !getModelValue(existingTrack, "cover") && editablePayload.cover ? editablePayload.cover : getModelValue(existingTrack, "cover") : null,
    coverMimeType: extractEmbeddedCoverArt ? !metadataCompleted && !getModelValue(existingTrack, "coverMimeType") && editablePayload.coverMimeType ? editablePayload.coverMimeType : getModelValue(existingTrack, "coverMimeType") : null,
    metadataCompleted,
    ...technicalPayload
  } : {
    id: itemId,
    kind: "song",
    metadataCompleted: false,
    ...editablePayload,
    ...technicalPayload
  };
  const track = await getMusicaAudioRepository(repositories).upsertTrack(payload);
  if (!existingTrack) {
    await replaceAudioAuthors(repositories, itemId, authorNames);
  }
  return track;
}

// ../nexus-plugins/musica/src/metadata-resource.ts
var import_node_path3 = __toESM(require("node:path"));

// src/backend/vault-runtime/file-system/operations/rename-item.ts
var import_node_path2 = __toESM(require("node:path"), 1);

// src/backend/vault-runtime/file-system/operations/fs-rename.ts
var import_promises2 = __toESM(require("node:fs/promises"), 1);

// src/main/contract-ipc-main.ts
var import_ajv = __toESM(require_ajv(), 1);

// src/shared/ipc-contracts.ts
var IPC_TIMEOUTS = {
  control: 1e4,
  io: 3e4,
  long: 12e4,
  interactive: null
};
var VAULT_SCOPED_NAMESPACES = /* @__PURE__ */ new Set([
  "concepts",
  "items",
  "markdown",
  "markdown-links",
  "metadata",
  "preview",
  "search",
  "state",
  "trash",
  "vault",
  "vaultManager",
  "views"
]);
var IO_NAMESPACES = /* @__PURE__ */ new Set([
  "dialog",
  "items",
  "markdown",
  "metadata",
  "preview",
  "trash",
  "vault",
  "vaultManager",
  "views"
]);
var LONG_OPERATION_PATTERN = /(reindex|rescan|import|export|install|update|reload|clear-data)/i;
var INTERACTIVE_OPERATION_PATTERN = /(choose|dialog|open-directory|open-image-file|open-media-file)/i;
function splitContractKey(key) {
  const normalizedKey = String(key || "").trim();
  const separatorIndex = normalizedKey.indexOf(":");
  if (separatorIndex < 0) {
    return {
      namespace: "legacy",
      operation: normalizedKey
    };
  }
  return {
    namespace: normalizedKey.slice(0, separatorIndex),
    operation: normalizedKey.slice(separatorIndex + 1)
  };
}
function toIdentifierSegment(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}
function inferIpcContractScope(key) {
  const { namespace } = splitContractKey(key);
  if (namespace.startsWith("dev-") || namespace.startsWith("nexus:dev")) {
    return "development";
  }
  if (VAULT_SCOPED_NAMESPACES.has(namespace) || key.startsWith("nexus:files:")) {
    return "vault";
  }
  return "host";
}
function inferIpcTimeoutClass(key) {
  const { namespace, operation } = splitContractKey(key);
  if (INTERACTIVE_OPERATION_PATTERN.test(key)) {
    return "interactive";
  }
  if (LONG_OPERATION_PATTERN.test(operation)) {
    return "long";
  }
  if (IO_NAMESPACES.has(namespace) || key.startsWith("nexus:files:")) {
    return "io";
  }
  return "control";
}
function getCoreIpcContractId(key) {
  const { namespace, operation } = splitContractKey(key);
  return `core.${toIdentifierSegment(namespace)}.${toIdentifierSegment(operation)}`;
}
function getPluginIpcContractId(pluginId, operation) {
  return `plugin.${toIdentifierSegment(pluginId)}.${toIdentifierSegment(operation)}`;
}
function getIpcWireChannel(contractId) {
  return `nexus:v2:${contractId}`;
}
function defineIpcContract(input) {
  const key = String(input.key || "").trim();
  if (!key) {
    throw new Error("IPC_CONTRACT_KEY_REQUIRED");
  }
  const pluginMatch = /^plugin:([^:]+):(.+)$/.exec(key);
  const id = pluginMatch ? getPluginIpcContractId(pluginMatch[1], pluginMatch[2]) : getCoreIpcContractId(key);
  const namespace = pluginMatch ? `plugin.${toIdentifierSegment(pluginMatch[1])}` : splitContractKey(key).namespace;
  const timeoutClass = input.timeoutClass || inferIpcTimeoutClass(key);
  return Object.freeze({
    id,
    key,
    wireChannel: getIpcWireChannel(id),
    owner: input.owner || (pluginMatch ? pluginMatch[1] : `core.${namespace}`),
    namespace,
    direction: input.direction || "invoke",
    scope: input.scope || (pluginMatch ? "plugin" : inferIpcContractScope(key)),
    timeoutClass,
    timeoutMs: IPC_TIMEOUTS[timeoutClass],
    requestSchema: input.requestSchema || { type: "array" },
    responseSchema: input.responseSchema ?? true
  });
}

// src/backend/vault-runtime/session.ts
var currentVaultRuntimeSession = null;
function getCurrentVaultRuntimeSession() {
  return currentVaultRuntimeSession;
}

// src/main/contract-ipc-main.ts
var ajv = new import_ajv.Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
var contractByKey = /* @__PURE__ */ new Map();
var contractById = /* @__PURE__ */ new Map();
var requestContextByEvent = /* @__PURE__ */ new WeakMap();
function createFailure(code, message, retryable = false) {
  return {
    ok: false,
    error: { code, message, retryable }
  };
}
function sanitizeError(error) {
  if (error instanceof Error) {
    return (error.message || "La operacion IPC fallo.").replace(/(?:[a-zA-Z]:[\\/]|\\\\)[^\s"']+/g, "[ruta privada]");
  }
  return "La operacion IPC fallo.";
}
function isTrustedSender(event) {
  const frame = event.senderFrame;
  if (!frame || frame !== frame.top) {
    return false;
  }
  const rawUrl = frame.url || event.sender.getURL();
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "file:" || parsed.protocol === "data:") {
      return true;
    }
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost");
  } catch {
    return false;
  }
}
function registerIpcContract(input) {
  const definition = defineIpcContract(input);
  const existingById = contractById.get(definition.id);
  if (existingById && existingById.definition.key !== definition.key) {
    throw new Error(`IPC_CONTRACT_COLLISION:${definition.id}`);
  }
  const existing = contractByKey.get(definition.key);
  if (existing) {
    return existing.definition;
  }
  const registered = {
    definition,
    validateRequest: ajv.compile(definition.requestSchema),
    validateResponse: ajv.compile(definition.responseSchema)
  };
  contractByKey.set(definition.key, registered);
  contractById.set(definition.id, registered);
  return definition;
}
async function runWithDeadline(contract, task, abortController, cleanups) {
  if (contract.timeoutMs == null) {
    return task;
  }
  let timeoutId = null;
  const timeout = new Promise((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      abortController.abort(new Error("IPC_TIMEOUT"));
      for (const cleanup of cleanups.splice(0)) {
        void Promise.resolve().then(cleanup).catch(() => void 0);
      }
      const error = new Error(`La operacion ${contract.id} excedio ${contract.timeoutMs} ms.`);
      error.name = "IpcContractTimeoutError";
      reject(error);
    }, contract.timeoutMs);
    timeoutId.unref?.();
  });
  try {
    return await Promise.race([task, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
function createContractIpcMain(realIpcMain) {
  return new Proxy(realIpcMain, {
    get(target, property, receiver) {
      if (property === "handle") {
        return (key, listener) => {
          const registered = contractByKey.get(key);
          const contract = registered?.definition || registerIpcContract({ key });
          const validators = contractByKey.get(key);
          return target.handle(contract.wireChannel, async (event, ...args) => {
            if (!isTrustedSender(event)) {
              return createFailure("IPC_SENDER_REJECTED", "El origen de la solicitud no esta autorizado.");
            }
            if (!validators.validateRequest(args)) {
              return createFailure("IPC_INVALID_PAYLOAD", "La solicitud no cumple el contrato IPC.");
            }
            const capturedSession = contract.scope === "vault" || contract.scope === "plugin" ? getCurrentVaultRuntimeSession() : null;
            if ((contract.scope === "vault" || contract.scope === "plugin") && !capturedSession?.acceptingWork) {
              return createFailure("VAULT_RUNTIME_UNAVAILABLE", "El vault activo no admite trabajo nuevo.", true);
            }
            const abortController = new AbortController();
            const cleanups = [];
            requestContextByEvent.set(event, {
              signal: abortController.signal,
              generation: capturedSession?.generation ?? null,
              onCleanup(cleanup) {
                if (typeof cleanup === "function") cleanups.push(cleanup);
              }
            });
            try {
              const data = await runWithDeadline(
                contract,
                Promise.resolve().then(() => listener(event, ...args)),
                abortController,
                cleanups
              );
              if (capturedSession && !capturedSession.canPublish()) {
                return createFailure("VAULT_GENERATION_STALE", "La operacion pertenece a una generacion anterior del vault.", true);
              }
              if (!validators.validateResponse(data)) {
                return createFailure("IPC_INVALID_RESPONSE", "La respuesta no cumple el contrato IPC.");
              }
              return { ok: true, data };
            } catch (error) {
              const timedOut = error instanceof Error && error.name === "IpcContractTimeoutError";
              return createFailure(
                timedOut ? "IPC_TIMEOUT" : "IPC_HANDLER_FAILED",
                sanitizeError(error),
                timedOut
              );
            } finally {
              requestContextByEvent.delete(event);
            }
          });
        };
      }
      if (property === "on") {
        return (key, listener) => {
          const registered = contractByKey.get(key);
          const contract = registered?.definition || registerIpcContract({
            key,
            direction: "send",
            timeoutClass: "control"
          });
          const validators = contractByKey.get(key);
          return target.on(contract.wireChannel, (event, ...args) => {
            if (!isTrustedSender(event) || !validators.validateRequest(args)) {
              return;
            }
            listener(event, ...args);
          });
        };
      }
      if (property === "removeHandler") {
        return (key) => {
          const contract = contractByKey.get(key)?.definition || defineIpcContract({ key });
          return target.removeHandler(contract.wireChannel);
        };
      }
      return Reflect.get(target, property, receiver);
    }
  });
}

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
var contractIpcMain = electronMain.ipcMain && typeof electronMain.ipcMain === "object" ? createContractIpcMain(electronMain.ipcMain) : electronMain.ipcMain;
var electron = new Proxy(electronMain, {
  get(target, property, receiver) {
    if (property === "ipcMain") {
      return contractIpcMain;
    }
    return Reflect.get(target, property, receiver);
  }
});

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

// src/backend/vault-runtime/file-system/operations/fs-rename.ts
var renameLogger = createDevLogger("backend.filesystem");
var RETRIABLE_RENAME_ERROR_CODES = /* @__PURE__ */ new Set(["EPERM", "EBUSY"]);
var FILE_RETRY_DELAYS_MS = [60, 160, 320];
var DIRECTORY_RETRY_DELAYS_MS = [120, 260, 520, 1200, 2400];
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function describePathState(targetPath, fsApi) {
  try {
    const stats = await fsApi.lstat(targetPath);
    return {
      exists: true,
      kind: stats.isDirectory() ? "directory" : stats.isFile() ? "file" : stats.isSymbolicLink() ? "symlink" : "other",
      size: Number.isFinite(stats.size) ? stats.size : null,
      mtimeMs: Number.isFinite(stats.mtimeMs) ? Number(stats.mtimeMs.toFixed(3)) : null
    };
  } catch (error) {
    const errorCode = error?.code ?? null;
    if (errorCode === "ENOENT") {
      return { exists: false };
    }
    return {
      exists: null,
      errorCode,
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}
function buildMissingSourceError(sourcePath) {
  const error = new Error(`No existe la ruta origen actual: ${sourcePath}`);
  error.code = "ENOENT";
  return error;
}
function buildDestinationExistsError(targetPath) {
  const error = new Error(`Ya existe un item en destino: ${targetPath}`);
  error.code = "EEXIST";
  return error;
}
function isRetriableRenameError(error) {
  const code = error?.code;
  return RETRIABLE_RENAME_ERROR_CODES.has(String(code || "").toUpperCase());
}
async function renamePathWithRetry(options) {
  const {
    from,
    to,
    operation,
    itemId = null,
    retryDelaysMs,
    fsApi = import_promises2.default
  } = options;
  const initialSourceState = await describePathState(from, fsApi);
  const initialDestinationState = await describePathState(to, fsApi);
  if (initialSourceState.exists === false) {
    throw buildMissingSourceError(from);
  }
  if (initialDestinationState.exists === true) {
    throw buildDestinationExistsError(to);
  }
  const sourceKind = "kind" in initialSourceState ? initialSourceState.kind : "unknown";
  const effectiveRetryDelaysMs = Array.isArray(retryDelaysMs) && retryDelaysMs.length > 0 ? retryDelaysMs : sourceKind === "directory" ? DIRECTORY_RETRY_DELAYS_MS : FILE_RETRY_DELAYS_MS;
  for (let attempt = 0; attempt <= effectiveRetryDelaysMs.length; attempt += 1) {
    try {
      await fsApi.rename(from, to);
      if (attempt > 0) {
        renameLogger.info(
          "items.rename.retry.succeeded",
          "El rename termino bien despues de un lock transitorio.",
          {
            operation,
            itemId,
            from,
            to,
            sourceKind,
            attempt: attempt + 1,
            maxAttempts: effectiveRetryDelaysMs.length + 1
          }
        );
      }
      return;
    } catch (error) {
      const sourceState = await describePathState(from, fsApi);
      const destinationState = await describePathState(to, fsApi);
      const attemptNumber = attempt + 1;
      const maxAttempts = effectiveRetryDelaysMs.length + 1;
      const errorCode = error?.code ?? null;
      if (destinationState.exists === true) {
        renameLogger.error(
          "items.rename.collision",
          "El rename fallo porque el destino ya existe al momento de ejecutar la operacion.",
          {
            operation,
            itemId,
            from,
            to,
            sourceKind,
            attempt: attemptNumber,
            maxAttempts,
            errorCode,
            sourceState,
            destinationState
          }
        );
        throw buildDestinationExistsError(to);
      }
      if (sourceState.exists === false) {
        renameLogger.error(
          "items.rename.source-missing",
          "El rename fallo porque la ruta origen desaparecio durante la operacion.",
          {
            operation,
            itemId,
            from,
            to,
            sourceKind,
            attempt: attemptNumber,
            maxAttempts,
            errorCode,
            sourceState,
            destinationState
          }
        );
        throw buildMissingSourceError(from);
      }
      if (!isRetriableRenameError(error) || attempt >= effectiveRetryDelaysMs.length) {
        renameLogger.error(
          "items.rename.failed",
          "El rename filesystem fallo y no se pudo recuperar.",
          {
            operation,
            itemId,
            from,
            to,
            sourceKind,
            attempt: attemptNumber,
            maxAttempts,
            errorCode,
            errorMessage: error instanceof Error ? error.message : String(error),
            sourceState,
            destinationState
          }
        );
        throw error;
      }
      const delayMs = effectiveRetryDelaysMs[attempt];
      renameLogger.warn(
        "items.rename.retry",
        "El rename filesystem devolvio un lock transitorio; se reintentara.",
        {
          operation,
          itemId,
          from,
          to,
          sourceKind,
          attempt: attemptNumber,
          maxAttempts,
          delayMs,
          errorCode,
          errorMessage: error instanceof Error ? error.message : String(error),
          sourceState,
          destinationState
        }
      );
      await wait(delayMs);
    }
  }
}

// src/backend/vault-runtime/file-system/operations/rename-item.ts
var WINDOWS_RESERVED_NAMES = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9"
]);
function assertValidItemName(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (!value) {
    throw new Error("El nombre no puede estar vac\xEDo.");
  }
  if (value === "." || value === "..") {
    throw new Error("El nombre ingresado no es v\xE1lido.");
  }
  if (/[<>:"/\\|?*\u0000-\u001F]/.test(value)) {
    throw new Error("El nombre contiene caracteres no permitidos.");
  }
  if (/[. ]$/.test(value)) {
    throw new Error("El nombre no puede terminar con punto o espacio.");
  }
  const baseName = import_node_path2.default.parse(value).name.toUpperCase();
  if (WINDOWS_RESERVED_NAMES.has(baseName)) {
    throw new Error("El nombre ingresado est\xE1 reservado por el sistema.");
  }
  return value;
}
function buildFileNameFromBaseName(baseName, extension) {
  const validBaseName = assertValidItemName(baseName);
  const normalizedExtension = String(extension ?? "").replace(/^\./, "").trim();
  return normalizedExtension ? `${validBaseName}.${normalizedExtension}` : validBaseName;
}
async function renameVaultItem(item, nextNameInput, options = {}) {
  const nextName = assertValidItemName(nextNameInput);
  const currentPath = String(options.currentPath || item.path || "").trim();
  if (nextName === item.name) {
    return {
      renamed: false,
      oldName: item.name,
      oldPath: currentPath,
      oldExtension: item.extension ?? null,
      newName: item.name,
      newPath: currentPath
    };
  }
  if (!currentPath) {
    throw new Error("No se pudo resolver la ruta actual del item a renombrar.");
  }
  const oldName = item.name;
  const oldPath = currentPath;
  const oldExtension = item.extension ?? (import_node_path2.default.extname(String(oldName || "")).replace(/^\./, "") || null);
  const newPath = import_node_path2.default.join(import_node_path2.default.dirname(oldPath), nextName);
  await renamePathWithRetry({
    from: oldPath,
    to: newPath,
    operation: "update-item",
    itemId: item?.id ?? null
  });
  item.name = nextName;
  item.path = newPath;
  if (!item.type || item.type === "file") {
    item.extension = import_node_path2.default.extname(nextName).replace(/^\./, "") || null;
  }
  return {
    renamed: true,
    oldName,
    oldPath,
    oldExtension,
    newName: nextName,
    newPath
  };
}
function restoreRenamedVaultItem(item, renameResult) {
  if (!renameResult?.renamed) {
    return;
  }
  item.name = renameResult.oldName;
  item.path = renameResult.oldPath;
  item.extension = renameResult.oldExtension ?? null;
}
async function rollbackRenamedVaultItem(item, renameResult) {
  if (!renameResult?.renamed) {
    return;
  }
  await renamePathWithRetry({
    from: renameResult.newPath,
    to: renameResult.oldPath,
    operation: "update-item:rollback",
    itemId: item?.id ?? null,
    retryDelaysMs: [80, 180]
  });
  restoreRenamedVaultItem(item, renameResult);
}

// ../nexus-plugins/musica/src/metadata-resource.ts
var AUDIO_TRACK_RESOURCE_ID = "audio.track";
var AUDIO_TRACK_VARIANT_ID = "basic";
var AUDIO_TRACK_FIELDS = [
  {
    name: "name",
    type: "text",
    label: "Nombre",
    description: "Este valor se guarda sin extension y renombra el archivo real al guardar.",
    placeholder: "Nombre de la cancion",
    required: true
  },
  {
    name: "authors",
    type: "string-list",
    label: "Autores",
    description: "Uno o mas autores. Se preserva el orden para colaboraciones.",
    addLabel: "Agregar autor"
  },
  {
    name: "genre",
    type: "text",
    label: "Genero",
    placeholder: "Ej. Synthwave"
  },
  {
    name: "album",
    type: "text",
    label: "Album",
    placeholder: "Nombre del album"
  },
  {
    name: "year",
    type: "number",
    label: "Anio",
    placeholder: "2026"
  },
  {
    name: "trackNumber",
    type: "number",
    label: "Pista",
    placeholder: "1"
  },
  {
    name: "discNumber",
    type: "number",
    label: "Disco",
    placeholder: "1"
  },
  {
    name: "metadataCompleted",
    type: "boolean",
    label: "Metadata completada",
    description: "Marcala cuando ya corregiste nombre, autores y demas campos curados manualmente."
  }
];
function ensureVariantId(variantId) {
  if (variantId !== AUDIO_TRACK_VARIANT_ID) {
    throw new Error(`Variant no soportada: ${variantId}`);
  }
}
function normalizeOptionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const normalizedValues = [];
  for (const entry of value) {
    const normalized = String(entry ?? "").trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    normalizedValues.push(normalized);
  }
  return normalizedValues;
}
function normalizeOptionalInteger(value, label, { allowZero = false } = {}) {
  if (value == null || value === "") {
    return null;
  }
  const numericValue = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(numericValue)) {
    throw new Error(`${label} debe ser un numero entero.`);
  }
  if (!allowZero && numericValue <= 0) {
    throw new Error(`${label} debe ser mayor a 0.`);
  }
  return numericValue;
}
function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "" || normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return Boolean(value);
}
function normalizeTrackFormValues(item, values) {
  const extension = String(getModelValue(item, "extension") ?? "").replace(/^\./, "").trim() || import_node_path3.default.extname(String(getModelValue(item, "name") ?? "")).replace(/^\./, "");
  const baseName = String(values?.name ?? "").trim();
  const fullFileName = buildFileNameFromBaseName(baseName, extension);
  const normalizedBaseName = extension ? fullFileName.slice(0, fullFileName.length - extension.length - 1) : fullFileName;
  return {
    name: normalizedBaseName,
    fullFileName,
    authors: normalizeStringList(values?.authors),
    genre: normalizeOptionalText(values?.genre),
    album: normalizeOptionalText(values?.album),
    year: normalizeOptionalInteger(values?.year, "Anio"),
    trackNumber: normalizeOptionalInteger(values?.trackNumber, "Pista"),
    discNumber: normalizeOptionalInteger(values?.discNumber, "Disco"),
    metadataCompleted: normalizeBoolean(values?.metadataCompleted)
  };
}
function buildTrackFormValues(item, track) {
  return {
    name: String(getModelValue(track, "name") ?? getAudioItemName(item) ?? "").trim(),
    authors: getAudioTrackAuthorNames(track),
    genre: getModelValue(track, "genre") ?? "",
    album: getModelValue(track, "album") ?? "",
    year: getModelValue(track, "year") ?? null,
    trackNumber: getModelValue(track, "trackNumber") ?? null,
    discNumber: getModelValue(track, "discNumber") ?? null,
    metadataCompleted: Boolean(getModelValue(track, "metadataCompleted"))
  };
}
async function requireAudioItem(models, itemId) {
  const item = await models.items.findById(itemId);
  if (!item) {
    throw new Error(`Item no encontrado: ${itemId}`);
  }
  if (!isSupportedAudioItem(item)) {
    throw new Error("El item solicitado no es un audio soportado.");
  }
  return item;
}
function toVaultRelativePath(ctx, value) {
  if (value == null) {
    return value;
  }
  const normalizedValue = import_node_path3.default.normalize(value);
  const relativePath = import_node_path3.default.relative(import_node_path3.default.normalize(ctx.vault.contentPath), normalizedValue);
  return relativePath === "." ? "" : relativePath.replace(/\\/g, "/");
}
function serializePluginItem(ctx, item) {
  if (!item) {
    return item;
  }
  const plainItem = typeof item.get === "function" ? item.get({ plain: true }) : { ...item };
  delete plainItem.repo;
  if ("path" in plainItem) {
    plainItem.path = getModelValue(item, "path") ?? plainItem.path;
    plainItem.relative_path = toVaultRelativePath(ctx, plainItem.path);
  }
  if ("folder_note_path" in plainItem && plainItem.folder_note_path) {
    plainItem.relative_folder_note_path = toVaultRelativePath(ctx, plainItem.folder_note_path);
  }
  return plainItem;
}
var audioTrackMetadataResource = {
  resourceId: AUDIO_TRACK_RESOURCE_ID,
  supportsItem: async (ctx, item) => isSupportedAudioItem(item) && await isMusicaAssignedItem(ctx, item),
  listVariants: async () => [
    {
      resourceId: AUDIO_TRACK_RESOURCE_ID,
      variantId: AUDIO_TRACK_VARIANT_ID,
      title: "Metadata musical",
      description: "Edita el nombre real del archivo y la metadata curada de la cancion.",
      rendererMode: "auto",
      fields: AUDIO_TRACK_FIELDS
    }
  ],
  getFormInstance: async (ctx, itemId, variantId) => {
    ensureVariantId(variantId);
    const repositories = ctx.requireRepositories();
    const item = await requireAudioItem(repositories, itemId);
    const track = await ensureAudioTrackWithAuthors(repositories, item, {
      structuralChanged: true,
      contentChanged: true,
      extractEmbeddedCoverArt: await isMusicaCoverArtEnabled(ctx)
    });
    if (!track) {
      throw new Error("No se pudo inicializar el registro derivado de audio.");
    }
    return {
      definition: {
        resourceId: AUDIO_TRACK_RESOURCE_ID,
        variantId: AUDIO_TRACK_VARIANT_ID,
        title: "Metadata musical",
        description: "Edita el nombre real del archivo y la metadata curada de la cancion.",
        rendererMode: "auto",
        fields: AUDIO_TRACK_FIELDS
      },
      values: buildTrackFormValues(item, track)
    };
  },
  submitForm: async (ctx, itemId, variantId, values) => {
    ensureVariantId(variantId);
    const repositories = ctx.requireRepositories();
    const item = await requireAudioItem(repositories, itemId);
    const extractEmbeddedCoverArt = await isMusicaCoverArtEnabled(ctx);
    const normalizedValues = normalizeTrackFormValues(item, values);
    const track = await ensureAudioTrackWithAuthors(repositories, item, {
      structuralChanged: true,
      contentChanged: true,
      extractEmbeddedCoverArt
    }) ?? null;
    let renameResult = null;
    try {
      if (normalizedValues.fullFileName !== getModelValue(item, "name")) {
        renameResult = await renameVaultItem(item, normalizedValues.fullFileName);
      }
      item.name = normalizedValues.fullFileName;
      await item.save();
      const trackPayload = {
        name: normalizedValues.name,
        genre: normalizedValues.genre,
        album: normalizedValues.album,
        year: normalizedValues.year,
        trackNumber: normalizedValues.trackNumber,
        discNumber: normalizedValues.discNumber,
        metadataCompleted: normalizedValues.metadataCompleted
      };
      if (track) {
        await getMusicaAudioRepository(repositories).upsertTrack({
          id: itemId,
          kind: getModelValue(track, "kind") ?? "song",
          duration: getModelValue(track, "duration") ?? null,
          mimeType: getModelValue(track, "mimeType") ?? null,
          bitrate: getModelValue(track, "bitrate") ?? null,
          sampleRate: getModelValue(track, "sampleRate") ?? null,
          bitsPerSample: getModelValue(track, "bitsPerSample") ?? null,
          cover: extractEmbeddedCoverArt ? getModelValue(track, "cover") ?? null : null,
          coverMimeType: extractEmbeddedCoverArt ? getModelValue(track, "coverMimeType") ?? null : null,
          lastScannedAt: getModelValue(track, "lastScannedAt") ?? null,
          ...trackPayload
        });
      } else {
        await getMusicaAudioRepository(repositories).upsertTrack({
          id: itemId,
          kind: "song",
          ...trackPayload
        });
      }
      await replaceAudioAuthors(repositories, itemId, normalizedValues.authors);
      return {
        values: {
          name: normalizedValues.name,
          authors: normalizedValues.authors,
          genre: normalizedValues.genre ?? "",
          album: normalizedValues.album ?? "",
          year: normalizedValues.year,
          trackNumber: normalizedValues.trackNumber,
          discNumber: normalizedValues.discNumber,
          metadataCompleted: normalizedValues.metadataCompleted
        },
        item: serializePluginItem(ctx, item),
        notices: renameResult?.renamed ? ["El archivo se renombro y la metadata se guardo correctamente."] : ["Metadata guardada correctamente."]
      };
    } catch (error) {
      if (renameResult?.renamed) {
        try {
          await rollbackRenamedVaultItem(item, renameResult);
        } catch (rollbackError) {
          console.error("Error revirtiendo rename del audio:", rollbackError);
        }
      }
      throw error;
    }
  }
};
function registerMusicaMetadataResources(ctx) {
  ctx.registerMetadataResource(audioTrackMetadataResource);
}

// ../nexus-plugins/musica/src/backend.ts
async function hydrateResolvedItem(ctx, item) {
  if (!item?.id) {
    return item;
  }
  const location = await ctx.resolveItemLocation(String(item.id));
  if (!location) {
    return item;
  }
  return {
    ...item,
    path: location.path,
    relative_path: location.relativePath,
    contentRelativePath: location.contentRelativePath
  };
}
async function migrateMusicaAssignmentIdsIfNeeded(ctx, settingsValue) {
  const assignments = readMusicaEngineAssignments(settingsValue);
  if (!assignments.some((assignment) => !assignment.rootItemId && assignment.rootPath)) {
    return null;
  }
  const items = await ctx.requireRepositories().items.findAll();
  const folderEntries = await Promise.all(
    items.filter((item) => item?.type === "folder").map(async (item) => {
      const location = await ctx.resolveItemLocation(String(item.id || ""));
      return [
        normalizeRelativePath(location?.contentRelativePath || ""),
        String(item.id || "")
      ];
    })
  );
  const folderIdByRelativePath = new Map(
    folderEntries.filter(([relativePath, itemId]) => relativePath && itemId)
  );
  let changed = false;
  const migratedAssignments = assignments.map((assignment) => {
    if (assignment.rootItemId || !assignment.rootPath) {
      return assignment;
    }
    const resolvedRootItemId = folderIdByRelativePath.get(
      normalizeRelativePath(assignment.rootPath)
    );
    if (!resolvedRootItemId) {
      return assignment;
    }
    changed = true;
    return {
      ...assignment,
      rootItemId: resolvedRootItemId
    };
  });
  return changed ? writeMusicaEngineAssignments(settingsValue, migratedAssignments) : null;
}
async function reconcileMusicaAssignments(ctx) {
  const repositories = ctx.requireRepositories();
  const items = await repositories.items.findAll();
  const extractEmbeddedCoverArt = await isMusicaCoverArtEnabled(ctx);
  for (const item of items) {
    ctx.lifecycle.throwIfAborted();
    const resolvedItem = await hydrateResolvedItem(ctx, item);
    if (!isSupportedAudioItem(resolvedItem)) {
      continue;
    }
    const assignedToMusica = await isMusicaAssignedItem(ctx, resolvedItem);
    if (!assignedToMusica) {
      await getMusicaAudioRepository(repositories).deleteTrack(String(getModelValue(item, "id") ?? ""));
      continue;
    }
    await syncAudioTrackRecord(repositories, resolvedItem, {
      structuralChanged: true,
      contentChanged: false,
      extractEmbeddedCoverArt
    });
  }
}
var musicaPlugin = {
  ensureSchema: ({ requireRepositories }) => {
    requireRepositories().sqlite.exec(`
      CREATE TABLE IF NOT EXISTS audio_tracks (
        id TEXT PRIMARY KEY NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        kind TEXT NOT NULL DEFAULT 'song',
        name TEXT NOT NULL,
        duration REAL,
        genre TEXT,
        album TEXT,
        year INTEGER,
        trackNumber INTEGER,
        discNumber INTEGER,
        mimeType TEXT,
        bitrate INTEGER,
        sampleRate INTEGER,
        bitsPerSample INTEGER,
        cover TEXT,
        coverMimeType TEXT,
        metadataCompleted INTEGER NOT NULL DEFAULT 0,
        lastScannedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS audio_authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS audio_track_authors (
        audioTrackId TEXT NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
        authorId INTEGER NOT NULL REFERENCES audio_authors(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (audioTrackId, authorId)
      );

      CREATE TABLE IF NOT EXISTS audio_playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS audio_track_playlists (
        audioTrackId TEXT NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
        playlistId INTEGER NOT NULL REFERENCES audio_playlists(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (audioTrackId, playlistId)
      );
    `);
  },
  activate: (ctx) => {
    registerMusicaMetadataResources(ctx);
    ctx.ipc.handle("get-by-item-id", async (_event, itemId, request) => {
      try {
        request.throwIfAborted();
        const repositories = ctx.getRepositories();
        const extractEmbeddedCoverArt = await isMusicaCoverArtEnabled(ctx);
        if (!repositories?.items) {
          return {
            ok: false,
            error: "No hay un vault activo con repositorios inicializados."
          };
        }
        const item = await hydrateResolvedItem(ctx, await repositories.items.findById(itemId));
        if (!item) {
          return {
            ok: false,
            error: "Item no encontrado"
          };
        }
        const filePath = getModelValue(item, "path");
        if (typeof filePath !== "string" || !filePath || !import_node_fs2.default.existsSync(filePath)) {
          return {
            ok: false,
            error: "Archivo no encontrado"
          };
        }
        const itemAssignedToMusica = await isMusicaAssignedItem(ctx, item);
        const audioTrack = itemAssignedToMusica ? await ensureAudioTrackWithAuthors(repositories, item, {
          structuralChanged: true,
          contentChanged: true,
          extractEmbeddedCoverArt
        }) : await getMusicaAudioRepository(repositories).findTrackWithAuthors(itemId);
        const metadata = audioTrack ? null : await parseAudioMetadata(filePath, {
          includeCovers: extractEmbeddedCoverArt
        });
        request.throwIfAborted();
        const metadataMimeType = metadata?.format ? metadata.format.mimeType ?? null : null;
        const picture = extractEmbeddedCoverArt ? metadata?.common?.picture?.[0] : null;
        const authors = getAudioTrackAuthorNames(audioTrack);
        const audioFile = {
          id: String(getModelValue(item, "id") ?? itemId),
          path: filePath,
          title: getModelValue(audioTrack, "name") || getAudioItemName(item),
          duration: getModelValue(audioTrack, "duration") ?? metadata?.format?.duration ?? null,
          mimeType: getModelValue(audioTrack, "mimeType") ?? metadataMimeType,
          cover: extractEmbeddedCoverArt ? getModelValue(audioTrack, "cover") ?? (picture ? bufferToDataUrl(picture.data, picture.format) : null) : null,
          genre: getModelValue(audioTrack, "genre") ?? null,
          album: getModelValue(audioTrack, "album") ?? null,
          authors,
          metadataCompleted: Boolean(getModelValue(audioTrack, "metadataCompleted"))
        };
        const buffer = await import_promises3.default.readFile(filePath, { signal: request.signal });
        return {
          ok: true,
          data: {
            audioFile,
            buffer
          }
        };
      } catch (error) {
        console.error("Error en audio:getByItemId:", error);
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Error desconocido"
        };
      }
    });
    let reconcileQueue = Promise.resolve();
    ctx.settings.subscribe(
      async (settingsValue) => {
        reconcileQueue = reconcileQueue.then(async () => {
          ctx.lifecycle.throwIfAborted();
          const migratedSettings = await migrateMusicaAssignmentIdsIfNeeded(ctx, settingsValue);
          if (migratedSettings) {
            await ctx.settings.set(migratedSettings);
            return;
          }
          ctx.lifecycle.throwIfAborted();
          await reconcileMusicaAssignments(ctx);
        }).catch((error) => {
          console.error("[musica] Error reconciliando assignments live:", error);
        });
        await reconcileQueue;
      },
      { emitCurrent: true }
    );
  },
  onItemSync: async (ctx, payload) => {
    const resolvedItem = await hydrateResolvedItem(ctx, payload.item);
    const assignedToMusica = await isMusicaAssignedItem(ctx, resolvedItem);
    const extractEmbeddedCoverArt = await isMusicaCoverArtEnabled(ctx);
    if (!assignedToMusica) {
      await getMusicaAudioRepository(ctx.requireRepositories()).deleteTrack(String(getModelValue(resolvedItem, "id") ?? ""));
      return;
    }
    await syncAudioTrackRecord(ctx.requireRepositories(), resolvedItem, {
      structuralChanged: payload.structuralChanged,
      contentChanged: payload.contentChanged,
      extractEmbeddedCoverArt
    });
  }
};
var backend_default = musicaPlugin;
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

content-type/index.js:
  (*!
   * content-type
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

media-typer/index.js:
  (*!
   * media-typer
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=backend.cjs.map
