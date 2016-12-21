/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

$import("js.util.Set", "BootstrapClassLoader");

Class.forName({
  name: "class js.util.EntrySet extends js.util.Set",
  "private _element": null,
  EntrySet: function(element) {
    this._element = element;
  },
  iterator: function() {
    return new js.util.HashIterator(this._element);
  },
  size: function() {
    return this._element.size();
  }
});

