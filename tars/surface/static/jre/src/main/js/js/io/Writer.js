/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 14, 2014
 */

Class.forName({
  name: "abstract class js.io.Writer extends Object",
  "protected _writer": null,
  Writer: function(writer) {
    this._writer = writer;
  },

  /** 将指定字符追加到此 writer。 */
  append: function(c) {
    return this;
  },
  /** 写入字符数组,字符,字符串或某一部分 */
  write: function(cbuf, off, len) {}
});

