Class.forName({
  name: "class com.ctrip.tars.util.LocalStorage extend Object",

  "public static instance": null,

  "private LocalStorage": function() {},

  "public static getInstance": function() {
    if (!com.ctrip.tars.util.LocalStorage.instance) {
      com.ctrip.tars.util.LocalStorage.instance = new com.ctrip.tars.util.LocalStorage();
    }
    return com.ctrip.tars.util.LocalStorage.instance;
  },

  put: function(key, value) {
    localStorage[key] = JSON.stringify(value);
  },

  get: function(key) {
    var value = localStorage[key];
    return value ? JSON.parse(value) : null;
  },

  remove: function(key) {
    delete localStorage[key];
  },

  clear: function() {
    for (var key in localStorage) {
      delete localStorage[key];
    }
  },

  length: function() {
    return localStorage.length;
  },

  size: function() {
    return this.length();
  }
});

