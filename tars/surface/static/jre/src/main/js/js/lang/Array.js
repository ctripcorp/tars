/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 10, 2014
 */
Class.forName({
  name: "class Array",
  alias: "js.lang.Array",
  Array: function() {},
  clear: function() {
    this.splice(0, this.length);
  },
  contains: function(elem) {
    return (this.indexOf(elem) !== -1);
  },
  remove: function(elem) {
    var index = this.indexOf(elem);
    if (index > -1) {
      this.splice(index, 1);
      return true;
    }
    return false;
  },
  peek: function() {
    return this.slice(-1)[0];
  },
  last: function() {
    return this[this.length - 1];
  },
  first: function() {
    return this[0];
  },
  indexOf: function(elem, start, end) {
    for (var i = start || 0, len = Math.min(end || this.length, this.length); i < len; i++) {
      if (this[i] === elem) {
        return i;
      }
    }
    return -1;
  },
  append: function(array, start, end) {
    if (!Object.isEmpty(array) && Object.isArray(array)) {
      start = start || 0;
      end = Math.min(end || array.length, array.length);

      if (end > start) {
        //end = (end && end > start && end < array.length) ? end : array.length;
        var parameter = Array.prototype.slice.call(array, start, end);
        Array.prototype.splice.call(parameter, 0, 0, this.length, 0);
        Array.prototype.splice.apply(this, parameter);
      }
    }
    return this;
  },
  insert: function(array, start, end) {
    if (!Object.isEmpty(array) && Object.isArray(array)) {
      start = start || 0;
      end = Math.min(end || array.length, array.length);

      if (end > start) {
        //end = (end && end > start && end < array.length) ? end : array.length;
        var parameter = Array.prototype.slice.call(array, start, end);
        Array.prototype.splice.call(parameter, 0, 0, 0, 0);
        Array.prototype.splice.apply(this, parameter);
      }
    }
    return this;
  },
  getLength: function() {
    return this.length;
  }
});

