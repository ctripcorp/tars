/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

$import("js.util.Iterator", "BootstrapClassLoader");

Class.forName({
  name: "class js.util.LinkIterator extends js.util.Iterator",

  LinkIterator: function(element, index) {
    this._element = element;
    this._cursor = index || 0;
  },

  "hasPrevious": function() {
    return this._cursor > 0;
  },

  "previous": function() {
    try {
      var i = this._cursor - 1,
        previous = this._element.get(i);
      this._lastRet = this._cursor = i;
      return previous;
    } catch (e) {
      throw new js.lang.IndexOutOfBoundsException();
    }
  },

  "nextIndex": function() {
    return this._cursor;
  },

  "previousIndex": function() {
    return this._cursor - 1;
  }
});

