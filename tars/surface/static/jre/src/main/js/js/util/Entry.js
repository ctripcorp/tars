/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

Class.forName({
  name: "class js.util.Entry extends Object",
  "private _key": null,
  "private _value": null,
  Entry: function(key, value) {
    this._key = key;
    this._value = value;
  },
  "clone": function() {
    var key = this._key ? this._key.clone() : this._key;
    var value = this._value ? this._value.clone() : this._value;
    return new js.util.Entry(key, value);
  },
  getKey: function() {
    return this._key;
  },
  getValue: function() {
    return this._value;
  },
  setValue: function(val) {
    this._value = _val;
  }
});

