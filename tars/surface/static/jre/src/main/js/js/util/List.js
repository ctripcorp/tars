/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 11, 2014
 */

$import("js.util.Collection", "BootstrapClassLoader");
$import("js.util.LinkIterator", "BootstrapClassLoader");
$import("js.util.Iterator", "BootstrapClassLoader");
$import("js.lang.IndexOutOfBoundsException", "BootstrapClassLoader");
$import("js.lang.UnsupportedOperationException", "BootstrapClassLoader");

Class.forName({
  name: "class js.util.List extends js.util.Collection",

  listIterator: function() {
    var index = arguments[0] || 0;
    if (index < 0 || index > this.size())
      throw new new js.lang.IndexOutOfBoundsException("Index: " + index);

    return new js.util.LinkIterator(this, index);

  },

  "protected rangeCheck": function(index) {
    if (index < 0 || index >= this.size()) {
      throw new js.lang.IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
  },

  // get(number),size(),remove()
  iterator: function() {
    return new js.util.Iterator(this);
  },

  "abstract removeAt": function(index) {},
  /** 返回此列表中指定位置处的元素。 */
  "abstract get": function(index) {},

  /** 返回此列表 fromIndex（包括）和 toIndex（不包括）之间部分的视图。 */
  "abstract subList": function(fromIndex, toIndex) {
    throw new js.lang.UnsupportedOperationException();
  },

  /** 将此列表中指定位置的元素替换为指定的元素（可选操作）。 */
  "abstract set": function(index, element) {
    throw new js.lang.UnsupportedOperationException();
  },

  /** 返回此列表中首次出现指定元素的索引，如果列表中不包含此元素，则返回 -1。 */
  "indexOf": function(o) {
    var e = this.listIterator();
    while (e.hasNext()) {
      var n = e.next();
      if (n === o) {
        return e.previousIndex();
      } else if (!Object.isEmpty(o) && !Object.isEmpty(o.equals) && Object.isFunction(o.equals) && o.equals(n)) {
        return e.previousIndex();
      }
    }
    return -1;
  },

  "lastIndexOf": function(o) {
    var e = this.listIterator(this.size());
    while (e.hasPrevious()) {
      var p = e.previous();
      if (p === o) {
        return e.nextIndex();
      } else if (!Object.isEmpty(o) && !Object.isEmpty(o.equals) && Object.isFunction(o.equals) && o.equals(p)) {
        return e.nextIndex();
      }
    }
    return -1;
  }
});

