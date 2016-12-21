/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 11, 2014
 */

$import("js.util.Map", "BootstrapClassLoader");
$import("js.util.Entry", "BootstrapClassLoader");
$import("js.util.EntrySet", "BootstrapClassLoader");

Class
  .forName({
    name: "class js.util.HashMap extends js.util.Map",
    "private _table": [],

    /**
     * 根据_hash和_hashCache确定hash值
     */
    "private _hash": {},
    "private _hashCache": [],
    "private _hashArray": [], // _hash的实时拷贝

    "private hash": function(key) {
      var hash = this._hash[key];
      if (Object.isEmpty(hash)) {
        if (this._hashCache.length <= 0) {
          hash = this._table.length;
        } else {
          hash = this._hashCache.pop();
        }
        this._hashArray.push(hash);
      }
      if (hash < 0 || hash > this._table.length)
        throw new js.lang.UnsupportedOperationException();
      return hash;
    },

    /**
     * put(entry) put(key,value)
     */
    put: function(key, value) {
      var entry = key;
      if (!Object.isNull(entry) && entry instanceof js.util.Entry) {
        key = entry.getKey();
        value = entry.getValue();
      } else {
        entry = new js.util.Entry(key, value);
      }

      var oldValue = null;
      var hash = this.hash(key);
      if (hash < this._table.length && hash >= 0) {
        oldValue = this._table[hash];
      }
      this._hash[key] = hash;
      this._table[hash] = entry;
      return oldValue;
    },
    "get": function(key) {
      var hash = this._hash[key];
      return (!Object.isNull(hash) && hash >= 0 && hash < this._table.length && this._table[hash]) ? this._table[hash]
        .getValue() : null;
    },
    entrySet: function() {
      // size(),remove()
      return new js.util.EntrySet(this);
    },
    size: function() {
      return this._table.length - this._hashCache.length;
    },
    remove: function(key) {
      var hash = this._hash[key];
      var oldObj = null;

      if (!Object.isNull(hash) && hash >= 0 && hash < this._table.length && this._table[hash]) {
        oldObj = this._table[hash].getValue();
        this._table[hash] = null;
        this._hashCache.push(hash);
      }
      var hai = this._hashArray.indexOf(hash);
      if (hai >= 0) {
        this._hashArray.splice(hai, 1);
      }
      delete this._hash[key];

      return oldObj;
    },
    clear: function() {
      Object.each(this._hash, function(i, v, o) {
        this.remove(i);
      }, this);
      /*
       * for (var i in this._hash) { this.remove(i); }
       */
    }
  });

