/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 16, 2014
 */

Class.forName({
  name: "abstract class js.text.Format extends Object",
  Format: function() {},

  /** 格式化一个对象以生成一个字符串。 */
  'abstract format': function(obj) {},

  /** 从给定字符串的开始处分析文本以生成一个对象。 */
  'abstract parse': function(source) {}
});

