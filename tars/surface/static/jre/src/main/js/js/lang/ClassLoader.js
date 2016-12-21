/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 17, 2014
 */

Class.forName({
  name: "abstract class js.lang.ClassLoader extends Object",

  '@Setter @Getter private parent': null,

  '@Setter @Getter private classes': [],

  "abstract loadClass": function(scriptUrl, callback, scope, showBusy) {},
  'static getSystemClassLoader': function(scriptUrl) {
    return atom.misc.Launcher.getLauncher().getClassLoader();
  }
});

