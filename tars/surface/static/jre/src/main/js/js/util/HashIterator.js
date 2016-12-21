/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

$import("js.util.Iterator", "BootstrapClassLoader");
Class
  .forName({
    name: "class js.util.HashIterator extends js.util.Iterator",

    hasNext: function() {
      return this._cursor < this._element._hashArray.length;
    },
    next: function() {
      try {
        // TODO
        var next = this._element._table[this._element._hashArray[this._cursor]];
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
        var keys = this._element._hash;

        Object.each(keys, function(i, v, o) {
          if (v === this._element._hashArray[this._lastRet]) {
            this._element.remove(i);
            return false;
          }
        }, this);

        if (this._lastRet < this._cursor)
          this._cursor--;
        this._lastRet = -1;
      } catch (e) {
        throw new js.lang.IndexOutOfBoundsException();
      }
    }

  });

