/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 11, 2014
 */

$import("js.util.Iterator", "BootstrapClassLoader");
$import("js.util.KeySet", "BootstrapClassLoader");
$import("js.util.ValueList", "BootstrapClassLoader");
$import("js.lang.UnsupportedOperationException", "BootstrapClassLoader");
Class
  .forName({
    name: "class js.util.Map extends Object",

    "clone": function() {
      var c = this.getClass().newInstance();
      var it = this.entrySet().iterator();
      while (it.hasNext()) {
        var next = it.next();
        if (next === null || next === undefined) {
          c.put(null, null);
        } else {
          c.put(next.clone());
          // var e = next.clone();
          // c.put(e.getKey(), e.getValue());
        }
      }
      return c;
    },

    /** 从此映射中移除所有映射关系（可选操作）。 */
    clear: function() {
      this.entrySet().clear();
    },

    /** 如果此映射包含指定键的映射关系，则返回 true。 */
    containsKey: function(key) {
      var e = this.entrySet().iterator();
      while (e.hasNext()) {
        var k = e.next().getKey();
        if (key === k) {
          return true;
        } else if (!Object.isEmpty(key) && !Object.isEmpty(key.equals) && Object.isFunction(key.equals) && key.equals(k)) {
          return true;
        }
      }
      return false;
    },

    /** 如果此映射为指定值映射一个或多个键，则返回 true。 */
    containsValue: function(value) {
      var e = this.entrySet().iterator();
      while (e.hasNext()) {
        var v = e.next().getValue();
        if (value === v) {
          return true;
        } else if (!Object.isEmpty(value) && !Object.isEmpty(value.equals) && Object.isFunction(value.equals) && value.equals(v)) {
          return true;
        }
      }
      return false;
    },

    /** 返回此映射中映射到指定键的值。 */
    "get": function(key) {
      var i = this.entrySet().iterator();
      while (i.hasNext()) {
        var e = i.next();
        var k = e.getKey();
        if (key === k) {
          return e.getValue();
        } else if (!Object.isEmpty(key) && !Object.isEmpty(key.equals) && Object.isFunction(key.equals) && key.equals(k)) {
          return e.getValue();
        }
      }
      return null;
    },

    /** 如果此映射未包含键-值映射关系，则返回 true。 */
    isEmpty: function() {
      return this.size() <= 0;
    },

    /** 将指定的值与此映射中的指定键相关联（可选操作）。 */
    put: function(key, value) {
      throw new js.lang.UnsupportedOperationException();
    },

    /** 从指定映射中将所有映射关系复制到此映射中（可选操作）。 */
    putAll: function(m) {
      var i = m.entrySet();
      while (i.hasNext()) {
        var e = i.next();
        this.put(e.getKey, e.getValue());
      }
    },

    /** 如果存在此键的映射关系，则将其从映射中移除（可选操作）。 */
    remove: function(key) {
      var i = entrySet().iterator(),
        correctEntry = null;
      while (correctEntry === null && i.hasNext()) {
        var e = i.next();

        if (key === e.getKey()) {
          correctEntry = e;
        } else if (!Object.isEmpty(key) && !Object.isEmpty(key.equals) && Object.isFunction(key.equals) && key.equals(e.getKey())) {
          correctEntry = e;
        }
      }
      var oldValue = null;
      if (!Object.isNull(correctEntry)) {
        oldValue = correctEntry.getValue();
        i.remove();
      }
      return oldValue;
    },

    /** 返回此映射中的键-值映射关系数。 */
    size: function() {
      return this.entrySet().size();
    },

    /** 返回此映射中包含的映射关系的 set 视图。 */
    "abstract entrySet": function() {},

    keySet: function() {
      return new js.util.KeySet(this);
    },

    values: function() {
      return new js.util.ValueList(this);
    },

    /** 比较指定的对象与此映射是否相等。 */
    equals: function(o) {}
  });

