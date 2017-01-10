/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

$import("js.util.List", "BootstrapClassLoader");
$import("js.util.ValueIterator", "BootstrapClassLoader");

Class.forName({
  name: "class js.util.ValueList extends js.util.List",

  "private _element": null,
  ValueList: function(element) {
    this._element = element;
  },
  iterator: function() {
    return new js.util.ValueIterator(this._element);
  },
  size: function() {
    return this._element.size();
  },

  "removeAt": function(index) {
    this.rangeCheck();
    return this._element._table.splice(index, 1);
  },

  "get": function(index) {
    this.rangeCheck();
    return this._element._table[index];
  },

  "subList": function(fromIndex, toIndex) {
    return this._element._table.slice(fromIndex, toIndex);
  },

  "set": function(index, element) {
    this.rangeCheck(index);
    var oldValue = this._element._table[index];
    this._element._table[index] = element;
    return oldValue;
  }

});

