/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

Class.forName({
  name: "class js.util.Iterator extends Object",
  "private _element": null,
  "private _cursor": 0,
  "private _lastRet": -1,
  Iterator: function(element) {
    this._element = element || [];
  },

  hasNext: function() {
    return this._cursor < this._element.size();
  },

  next: function() {
    try {
      var next = this._element.get(this._cursor);
      this._lastRet = this._cursor++;
      return next;
    } catch (e) {
      throw new js.lang.IndexOutOfBoundsException("Index: " + this._cursor + ", Size: " + this._element.size() + ",Message:" + e.getMessage());
    }
  },
  remove: function() {
    if (this._lastRet === -1)
      throw new js.lang.IllegalStateException();
    try {
      this._element.removeAt(this._lastRet);
      if (this._lastRet < this._cursor)
        this._cursor--;
      this._lastRet = -1;
    } catch (e) {
      throw new js.lang.IndexOutOfBoundsException();
    }
  }
});

