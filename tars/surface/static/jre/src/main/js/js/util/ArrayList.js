/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 11, 2014
 */

$import("js.util.List", "BootstrapClassLoader");
$import("js.lang.IndexOutOfBoundsException", "BootstrapClassLoader");

Class.forName({
  name: "class js.util.ArrayList extends js.util.List",
  "private _table": [],

  /** 在此列表中指定的位置插入指定的元素（可选操作）。 */
  "add": function() {
    // index, element
    var index = null,
      element = null;
    if (arguments.length >= 2 && !Object.isEmpty(arguments[0]) && Object.isNumber(arguments[0])) {
      index = arguments[0];
      element = arguments[1];
    } else if (arguments.length > 0) {
      element = arguments[0];
      index = this.size();
    }
    if (index != this.size()) {
      this.rangeCheck(index);
    }
    this._table.splice(index, 0, element);
  },

  /** 返回此列表 fromIndex（包括）和 toIndex（不包括）之间部分的视图。 */
  subList: function(fromIndex, toIndex) {
    return this._table.slice(fromIndex, toIndex);
  },

  "set": function(index, element) {
    this.rangeCheck(index);
    var oldValue = this._table[index];
    this._table[index] = element;
    return oldValue;
  },
  /** 返回此列表中指定位置处的元素。 */
  "get": function(index) {
    this.rangeCheck(index);
    return this._table[index];
  },

  removeAt: function(index) {
    return this._table.splice(index, 1)[0];
  },

  "size": function() {
    return this._table.length;
  }
});

