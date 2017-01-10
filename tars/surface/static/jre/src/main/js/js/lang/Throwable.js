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
  name: "class js.lang.Throwable extends Object",
  "private message": null, // 错误信息,多同description
  "private name": "js.lang.Throwable", // 错误名
  "private number": null, // 错误号
  "private description": null, // 描述
  "private fileName": null, // 错误发生的文件( Only in FF )
  "private stack": null, // 错误发生时的调用堆栈 FF Only 属性
  "private lineNumber": null,
  Throwable: function(message, fileName, lineNumber, stack) {
    this.message = message;
    this.fileName = fileName;
    this.stack = stack;
    this.lineNumber = lineNumber;
  },
  getName: function() {
    return this.name;
  },
  getMessage: function() {
    return this.message;
  },
  getNumber: function() {
    return this.number;
  },
  getDescription: function() {
    return this.description;
  },
  getFileName: function() {
    return this.fileName;
  },
  getStack: function() {
    return this.stack;
  },
  getLineNumber: function() {
    return this.lineNumber;
  }
});
/*Object.extend([ Error, EvalError, RangeError, ReferenceError, SyntaxError,
TypeError, URIError ], js.lang.Throwable.$class.getMethods(),
'prototype', '_value');*/

