$import("com.ctrip.tars.util.LocalStorage");
Class.forName({
  name: "class com.ctrip.tars.model.Runtime extend Object",

  "private storage": com.ctrip.tars.util.LocalStorage.getInstance(),

  "public static final FIRST_VERSION": "1.0.000",

  "@Getter @Setter private version": null,
  "@Getter @Setter private debug": false,
  "@Getter @Setter private path": null,
  "@Getter @Setter private target": null,

  "private Runtime": function() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0, len = scripts.length; i < len; i++) {
      var script = scripts[i],
        jsvm = script.getAttribute("jsvm");

      if (jsvm && jsvm === 'true') {
        this.target = script.getAttribute("target");
        break;
      }
    }
  },

  "public static getInstance": function() {
    if (!com.ctrip.tars.model.Runtime.instance) {
      com.ctrip.tars.model.Runtime.instance = new com.ctrip.tars.model.Runtime();
    }
    return com.ctrip.tars.model.Runtime.instance;
  },

  "public isWelcome": function(version) {
    if (version) {
      return this.getLocalVersion() < version;
    } else {
      return this.getLocalVersion() < this.version;
    }
  },

  "public welcome": function(version) {
    this.storage.put("version", version);
  },

  "public getLocalVersion": function() {
    return this.storage.get("version") || com.ctrip.tars.model.Runtime.FIRST_VERSION;
  }

});

com.ctrip.tars.model.Runtime.getInstance().setVersion(js.lang.ClassLoader.getSystemClassLoader().getVersion());
com.ctrip.tars.model.Runtime.getInstance().setDebug(js.lang.ClassLoader.getSystemClassLoader().getDebug());

