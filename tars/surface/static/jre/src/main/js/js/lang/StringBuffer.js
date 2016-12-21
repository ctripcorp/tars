/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 13, 2014
 */
$import("js.lang.IndexOutOfBoundsException", "BootstrapClassLoader");
Class.forName({
  name: "class js.lang.StringBuffer extends Object",
  "private _strings": [],
  StringBuffer: function() {},
  append: function() {
    this._strings.append(Array.prototype.slice.call(arguments, 0));
    return this;
  },

  insert: function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.reverse();
    Array.prototype.splice.call(args, 0, 0, 0, 0);
    Array.prototype.splice.apply(this._strings, args);
    return this;
  },

  applys: function(array) {
    this._strings.append(array);
    return this;
  },

  clear: function() {
    this._strings.splice(0, this._strings.length);
  },

  remove: function(start, end) {
    var size = this.length();
    if (start < 0 || start > size || start > end) {
      throw new js.lang.IndexOutOfBoundsException();
    }

    if (!end || end > size) {
      end = size;
    }

    var cursor = 0,
      ele = null;
    for (var i = 0, len = this._strings.length; i < len; i++) {
      ele = this._strings[i];

      if (Object.isNull(ele)) {
        continue;
      }

      if (!Object.isString(ele)) {
        ele = "" + ele;
      }

      var length = ele.length;

      cursor += length;
      if (cursor > start) {
        var index = length - cursor + start;
        if (end <= cursor) {
          this._strings[i] = [
            ele.substring(0, index),
            ele.substring(end - start, length)
          ].join("");
          break;
        } else {
          start = cursor;
          this._strings[i] = ele.substring(0, index);
        }
      }
    }

    return this;
  },

  substring: function(start, end) {
    var size = this.length();
    if (start < 0 || start > size || start > end) {
      throw new js.lang.IndexOutOfBoundsException();
    }

    if (!end || end > size) {
      end = size;
    }

    var cursor = 0,
      substring = [],
      ele = null;
    for (var i = 0, len = this._strings.length; i < len; i++) {

      ele = this._strings[i];

      if (Object.isNull(ele)) {
        continue;
      }

      if (!Object.isString(ele)) {
        ele = "" + ele;
      }

      var length = ele.length;
      cursor += length;
      if (cursor > start) {
        var index = length - cursor + start;
        if (end <= cursor) {
          substring.push(ele.substring(index, end - start));
          break;
        } else {
          start = cursor;
          substring.push(ele.substring(index, length));
        }
      }
    }

    return substring.join("");
  },

  charAt: function(index) {
    var cursor = 0,
      ele = null;
    for (var i = 0, len = this._strings.length; i < len; i++) {
      ele = this._strings[i];

      if (Object.isNull(ele)) {
        continue;
      }

      if (!Object.isString(ele)) {
        ele = "" + ele;
      }

      var length = ele.length;
      cursor += length;
      if (cursor > index) {
        return ele.charAt(length - cursor + index);
      }
    }
    throw new js.lang.IndexOutOfBoundsException();
  },

  indexOf: function(string) {
    return this._strings.join("").indexOf(string);
  },

  length: function() {
    var cursor = 0,
      ele = null;
    for (var i = 0, len = this._strings.length; i < len; i++) {
      ele = this._strings[i];
      if (Object.isNull(ele)) {
        continue;
      }

      if (!Object.isString(ele)) {
        ele = "" + ele;
      }

      cursor += ele.length;
    }
    return cursor;
  },

  getLength: function() {
    return this.length();
  },
  toString: function(sp) {
    return this._strings.join(sp || "");
  }
});

