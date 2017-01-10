/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

$import("js.util.HashIterator", "BootstrapClassLoader");

Class
  .forName({
    name: "class js.util.ValueIterator extends js.util.HashIterator",
    next: function() {
      try {
        var next = this._element._table[this._element._hashArray[this._cursor]];
        this._lastRet = this._cursor++;
        return next.getValue();
      } catch (e) {
        throw new js.lang.IndexOutOfBoundsException("Index: " + this._cursor + ", Size: " + this._element.size() + ",Message:" + e.getMessage());
      }
    }
  });

