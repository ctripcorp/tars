/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 12, 2014
 */
Class.forName({
  name: "class js.lang.Exception extends js.lang.Throwable",

  "private name": "js.lang.Exception", // 错误名
  "private number": 0, // 错误号

  Exception: function(message, fileName, lineNumber, stack) {
    this.message = message;
    this.fileName = fileName;
    this.stack = stack;
    this.lineNumber = lineNumber;
  }

});

