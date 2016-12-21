/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 14, 2014
 */

Class.forName({
  name: "class js.net.http.Rest extends Object",
  Rest: function() {},
  build: (function() {
    var regx1 = /\/{2,}/g,
      regx2 = /\/$/g;
    return function() {
      if (arguments.length > 0) {
        if (!Object.isEmpty(arguments[0]) && Object.isString(arguments[0])) {
          var _method = arguments[0].toUpperCase();
          if (com.js.net.http.HTTP.REQUEST.TYPE.contains(_method)) {
            var temp = new StringBuffer();
            var url = temp.append("").applys(
                Array.prototype.slice.call(arguments, 1))
              .toString("/");
            temp.clear();
            temp.append(
                url.trim().replace(regx1, "/").replace(regx2,
                  "")).append("?_method=")
              .append(_method);
            return temp.toString();
          }
        }
      }
      return null;
    };
  })()
});

