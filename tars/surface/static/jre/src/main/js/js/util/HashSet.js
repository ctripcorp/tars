/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

$import("js.util.Set", "BootstrapClassLoader");
$import("js.util.HashMap", "BootstrapClassLoader");

Class.forName({
  name: "class js.util.HashSet extends js.util.Set",

  "private _table": null,
  HashSet: function() {
    this._table = new js.util.HashMap();
  },

  iterator: function() {
    return this._table.keySet().iterator();
  },

  size: function() {
    return this._table.size();
  },

  isEmpty: function() {
    return this._table.isEmpty();
  },

  contains: function(o) {
    return this._table.containsKey(o);
  },

  add: function(e) {
    return this._table.put(e, null);
  },

  remove: function(o) {
    this._table.remove(o);
    return o;
  },

  clear: function() {
    this._table.clear();
  }
});

