/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年6月25日
 */
$import("js.lang.Throwable", "BootstrapClassLoader");
Class.forName({
  name: "class ReferenceError",
  alias: "js.lang.ReferenceError",

  "private name": "js.lang.ReferenceError", // 错误名
  "private number": 4,

  ReferenceError: function() {}
});

