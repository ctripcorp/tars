/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 11, 2014
 */

/**
 * 测试集合框架 js.util.Collection |
 * ----------------------------------------------------- | | js.util.List
 * js.util.Set | | ------------------------------
 * ------------------------------- | | | | js.util.ArrayList js.util.Stack
 * js.util.HashSet js.util.TreeSet
 *
 *
 *
 *
 * js.util.Map | -------------------------------------------------------- | |
 * js.util.HashMap js.util.TreeMap
 *
 */
Class.forName({
  name: "abstract class js.util.Collection extends Object",

  "clone": function() {
    var c = this.getClass().newInstance();
    var it = this.iterator();
    while (it.hasNext()) {
      var next = it.next();
      c.add(next ? next.clone() : next);
    }
    return c;
  },

  /**
   * 返回此 collection 中的元素数。
   */
  "abstract size": function() {},

  /**
   * 返回在此 collection 中的元素上进行迭代的迭代器。
   */
  "abstract iterator": function() {},

  /**
   * 确保此 collection 包含指定的元素（可选操作）。
   */
  add: function(o) {
    throw new js.lang.UnsupportedOperationException();
  },

  /**
   * 将指定 collection 中的所有元素添加到此 collection 中（可选操作）。
   */
  addAll: function(c) {
    var modified = false;
    var e = c.iterator();
    while (e.hasNext()) {
      if (this.add(e.next()))
        modified = true;
    }
    return modified;
  },

  /**
   * 如果此 collection 包含指定的元素，则返回 true。
   */
  contains: function(o) {
    var e = this.iterator();
    while (e.hasNext()) {
      var n = e.next();
      if (n == o) {
        return true;
      } else if (!Object.isEmpty(o) && !Object.isEmpty(o.equals) && Object.isFunction(o.equals) && o.equals(n)) {
        return true;
      }
    }
    return false;
  },

  /** 从此 collection 中移除所有元素（可选操作）。 */
  clear: function() {
    var e = this.iterator();
    while (e.hasNext()) {
      e.next();
      e.remove();
    }

  },

  /** 如果此 collection 包含指定 collection 中的所有元素，则返回 true。 */
  containsAll: function(c) {
    var e = c.iterator();
    while (e.hasNext()) {
      if (!this.contains(e.next())) {
        return false;
      }
    }
    return true;
  },

  /**
   * 如果此 collection 不包含元素，则返回 true。
   */
  isEmpty: function() {
    return this.size() <= 0;
  },

  /**
   * 从此 collection 中移除指定元素的单个实例（如果存在）（可选操作）。
   */
  remove: function(o) {
    var e = this.iterator();
    while (e.hasNext()) {
      var n = e.next();
      if (n == o) {
        e.remove();
        return true;
      } else if (!Object.isEmpty(o) && !Object.isEmpty(o.equals) && Object.isFunction(o.equals) && o.equals(n)) {
        e.remove();
        return true;
      }
    }
    return false;
  },

  /**
   * 从此 collection 中移除包含在指定 collection 中的所有元素（可选操作）。
   */
  removeAll: function(c) {
    var modified = false;
    var e = this.iterator();
    while (e.hasNext()) {
      if (c.contains(e.next())) {
        e.remove();
        modified = true;
      }
    }
    return modified;
  },

  /**
   * 仅在此 collection 中保留指定 collection 中所包含的元素（可选操作）。
   */
  retainAll: function(c) {
    var modified = false;
    var e = this.iterator();
    while (e.hasNext()) {
      if (!c.contains(e.next())) {
        e.remove();
        modified = true;
      }
    }
    return modified;
  },

  /**
   * 返回包含此 collection 中所有元素的数组。
   */
  toArray: function() {
    var r = [],
      it = this.iterator(),
      i = 0;
    while (it.hasNext()) {
      r[i++] = it.next();
    }
    return r;
  }
});

