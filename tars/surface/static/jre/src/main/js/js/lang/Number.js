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
  name: "class Number",

  alias: "js.lang.Number",
  Number: function() {},
  "public equals": function(s) {
    return Object.isNumber(s) && this == s;
  }

});

