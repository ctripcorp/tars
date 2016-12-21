/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年6月25日
 */
Class.forName({
  name: "class Error",
  alias: "js.lang.Error",

  "private name": "js.lang.Error", // 错误名
  "private number": 1,

  Error: function(message, fileName, lineNumber, stack) {
    this.message = message;
    this.fileName = fileName;
    this.stack = stack;
    this.lineNumber = lineNumber;
  },
  'static init': function() {
    var methods = {},
      __methods = js.lang.Throwable.$class.getMethods(),
      __length = __methods.length,
      __index = 0;
    for (; __index < __length; __index++) {
      methods[__methods[__index]._name] = __methods[__index]._value;
    }
    Object.extend(Error.prototype, methods);
  }
});

js.lang.Error.init();

