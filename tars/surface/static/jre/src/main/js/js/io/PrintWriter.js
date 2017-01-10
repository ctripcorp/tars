/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 14, 2014
 */
$import("js.io.Writer", "BootstrapClassLoader");
Class.forName({
  name: "class js.io.PrintWriter extends js.io.Writer",
  PrintWriter: function() {},
  print: function(cbuf, off, len, ln) {},
  println: function(cbuf, off, len) {
    this.print(cbuf, off, len, true);
  }
});

