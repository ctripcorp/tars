/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 10, 2014
 */
"use strict";
(function() {
  var currentTimeMillis = function() {
    return new Date().getTime();
  };
  var $class = Class.forName({
    name: "class Object",
    alias: "js.lang.Object",
    Object: function() {
      var _hashCode = (currentTimeMillis() + Math.random()).toString(16);
      if (Object.USEECMA) {
        Object.defineProperty(this, "_hashCode", {
          value: _hashCode,
          writable: false,
          enumerable: false,
          configurable: false
        });
      } else {
        this._hashCode = _hashCode;
      }
    },

    "non-writable non-enumerable non-configurable non-proxy getClass": function() {
      return this.$class || Object.$class;
    },

    "non-writable non-enumerable non-configurable non-proxy getVersion": (function() {
      /** 主版本号 . 子版本号 [ 修正版本号 [. 编译版本号 ]] */
      var version = "0.1.1.0001";
      return function() {
        return this.version || version;
      };
    })(),

    /** 指示某个其他对象是否与此对象“相等”。 */
    "equals": function(obj) {
      return obj === this;
    },

    "hashCode": function() {
      if (!this._hashCode) {
        this._hashCode = (currentTimeMillis() + Math.random()).toString(16);
      }
      return this._hashCode;
    },

    "toString": function() {
      // TODO String,Number,Boolean,Array等的toString()方法
      return this.getClass().getFullName() + "<" + this.hashCode() + ">";
    },

    "clone": function() {
      var b = null;
      if (this instanceof Number || this instanceof String || this instanceof Boolean) {
        return this.valueOf();
      } else if (this instanceof Function || this instanceof RegExp || this instanceof Error || this instanceof EvalError || this instanceof RangeError || this instanceof ReferenceError || this instanceof SyntaxError || this instanceof TypeError || this instanceof URIError) {
        return this;
      } else if (this instanceof Date) {
        b = new Date();
        b.setTime(this.getTime());
        return b;
      } else if (Object.isNumber(this) || Object.isString(this) || Object.isBoolean(this)) {
        //FIXME
        return this;
      } else if (this instanceof Array) {
        b = [];
        var parameter = Array.prototype.slice.call(this, 0, this.length);
        Array.prototype.splice.call(parameter, 0, 0, 0, 0);
        Array.prototype.splice.apply(b, parameter);
        return b;
      } else {
        b = this.$class ? this.$class.newInstance() : {};
        for (var a in this) {
          if (a === "_hashCode") {
            b[a] = currentTimeMillis().toString(16);
            continue;
          }
          if (this.hasOwnProperty(a)) {
            b[a] = this[a] ? this[a].clone() : this[a];
          }
        }
        return b;
      }
    },

    "toJson": (function() {
      var NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON && typeof JSON.stringify === "function" && JSON.stringify(0) === "0" && typeof JSON.stringify(function() {}) === "undefined";
      return function() {
        if (NATIVE_JSON_STRINGIFY_SUPPORT) {
          // TODO 只取public属性

          return this;
          // return JSON.stringify(this);
        }
        return this;
      };
    })(),

    "toQueryString": function() {
      // TODO
      var queryString = [];
      for (var attr in this) {
        if (this[attr]) {
          queryString.push(attr + "=" + this[attr]);
        }
      }
      return queryString.join("&");
    }
  });
  if (Object.USEECMA) {
    Object.defineProperty(Object, "$class", {
      value: $class,
      writable: false,
      enumerable: false,
      configurable: false
    });
  } else {
    Object.$class = $class;
  }
})();

