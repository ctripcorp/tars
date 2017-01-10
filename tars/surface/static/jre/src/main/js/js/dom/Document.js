/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 10, 2014
 */

Class.forName({
  name: "class js.dom.Document",

  Document: function() {},

  "static ready": (function() {

    var isReady = false,
      isReadyListen = false;
    var readyQueue = [];
    var completed = function() {
      document.removeEventListener("DOMContentLoaded", completed);
      window.removeEventListener("load", completed);

      onload();
    };
    var onload = function() {
      for (var i = 0, len = readyQueue.length; i < len; i++) {
        if (readyQueue[i] && readyQueue[i].ready && Object.isFunction(readyQueue[i].ready)) {
          readyQueue[i].ready.apply(readyQueue[i].scope || window);
        }
      }

      readyQueue.clear();
    };

    return function(ready, scope) {

      if (Object.isNull(ready) || !Object.isFunction(ready)) {
        throw new js.lang.IllegalArgumentException("You should give me a valid function, that i will execute it as a callback when the document loaded.");
      }

      readyQueue.push({
        ready: ready,
        scope: scope || window
      });

      if (document.readyState === "complete") {
        // Handle it asynchronously to allow scripts the opportunity to delay ready
        setTimeout(onload);

      } else if (!isReadyListen) {
        // Use the handy event callback
        document.addEventListener("DOMContentLoaded", completed);
        // A fallback to window.onload, that will always work
        window.addEventListener("load", completed);

        isReadyListen = true;
      }
    };
  })(),

  "static getDocument": function() {
    return document;
  }
});

