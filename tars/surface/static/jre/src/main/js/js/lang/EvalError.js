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
  name: "class EvalError",
  alias: "js.lang.EvalError",

  "private name": "js.lang.EvalError", // 错误名
  "private number": 2,

  EvalError: function() {}
});

