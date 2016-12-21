Class.forName({
  name: "class atom.misc.Launcher extends Object",
  "private static launcher": null,
  "@Getter private loader": null,

  "public getClassLoader": function() {
    return this.loader;
  },

  "public Launcher": function() {
    var bootstrap;
    try {
      bootstrap = atom.misc.Launcher.BootstrapClassLoader.getBootstrapClassLoader();
    } catch (e) {
      throw new js.lang.InternalError("Could not create bootstrap class loader");
    }

    var extcl;
    try {
      extcl = atom.misc.Launcher.ExtClassLoader.getExtClassLoader(bootstrap);
    } catch (e) {
      throw new js.lang.InternalError("Could not create extension class loader");
    }
    // Now create the class loader to use to launch the application
    try {
      this.loader = atom.misc.Launcher.AppClassLoader.getAppClassLoader(extcl);
    } catch (e) {
      throw new js.lang.InternalError("Could not create application class loader");
    }

    var csscl;
    try {
      csscl = atom.misc.Launcher.CSSClassLoader.getCSSClassLoader();
    } catch (e) {
      throw new js.lang.InternalError("Could not create css class loader");
    }
  },

  "public static getLauncher": function() {
    var launcher = atom.misc.Launcher.launcher;
    if (!launcher) {
      launcher = new atom.misc.Launcher();
      atom.misc.Launcher.launcher = launcher;
    }
    return launcher;
  }
});

Class.forName({
  name: "class atom.misc.Launcher.BootstrapClassLoader extends js.net.URLClassLoader",

  "private static bootstrapClassLoader": null,

  "private BootstrapClassLoader": function() {
    //System.getProperty("atom.boot.class.path")
    this.setRoot(this.getRoot() + (this.debug ? '/jre/src/main/js/' : "/jre/classes/js/"));
  },

  "public static getBootstrapClassLoader": function() {
    var loader = atom.misc.Launcher.BootstrapClassLoader.bootstrapClassLoader;
    if (!loader) {
      loader = new atom.misc.Launcher.BootstrapClassLoader();
      atom.misc.Launcher.BootstrapClassLoader.bootstrapClassLoader = loader;
    }
    return loader;
  }
});

Class.forName({
  name: "class atom.misc.Launcher.ExtClassLoader extends js.net.URLClassLoader",

  "private static extClassLoader": null,

  "private ExtClassLoader": function(parent) {
    this.parent = parent;
    //System.getProperty("js.ext.dirs")
    this.setRoot(this.getRoot() + "/lib/");
  },

  "public static getExtClassLoader": function(cl) {
    var loader = atom.misc.Launcher.ExtClassLoader.extClassLoader;
    if (!loader) {
      loader = new atom.misc.Launcher.ExtClassLoader(cl);
      atom.misc.Launcher.ExtClassLoader.extClassLoader = loader;
    }
    return loader;
  }
});

Class.forName({
  name: "class atom.misc.Launcher.CSSClassLoader extends js.net.URLClassLoader",

  "private static cssClassLoader": null,
  "public static final BOOT": "BOOT",
  "public static final EXT": "EXT",
  "public static final APP": "APP",
  "public static final SKIN": "SKIN",
  "@Setter @Getter private skin": null,

  "private CSSClassLoader": function() {
    var skin = null,
      scripts = document.getElementsByTagName("script");
    for (var i = 0, len = scripts.length; i < len; i++) {
      var script = scripts[i],
        jsvm = script.getAttribute("jsvm"),
        s = script.getAttribute("skin");

      if (jsvm && jsvm === 'true') {
        skin = s;
        break;
      }
    }
    this.skin = skin;
  },

  "public static getCSSClassLoader": function() {
    var loader = atom.misc.Launcher.CSSClassLoader.cssClassLoader;
    if (!loader) {
      loader = new atom.misc.Launcher.CSSClassLoader();
      atom.misc.Launcher.CSSClassLoader.cssClassLoader = loader;
    }
    return loader;
  },

  findClass: function(linkUrl, notModify, type) {
    var isString = (Object.isString(linkUrl));

    if (isString)
      linkUrl = [linkUrl];

    var classes = {},
      path = this.path,
      querys = [],
      relative = null;
    if (!Object.isArray(linkUrl)) {
      return classes;
    }

    for (var i = 0; i < linkUrl.length; i++) {
      var src = linkUrl[i],
        url = src;

      for (var j = 0; j < path.length; j++) {
        if (path[j] && path[j].name && path[j].url) {
          if (src.indexOf(path[j].name) === 0) {
            src = path[j].url + src.substring(path[j].name.length);
            break;
          }
        }
      }
      src = src.replace(/[.]/g, "/") + ".css";

      if (notModify) {
        querys.push("t=" + new Date().getTime());
      }

      if (this.version) {
        querys.push("v=" + this.version);
      }

      if (querys.length > 0) {
        src += "?" + querys.join("&");
      }

      switch (type) {
        case atom.misc.Launcher.CSSClassLoader.EXT:
          relative = '/lib/';
          break;
        case atom.misc.Launcher.CSSClassLoader.SKIN:
          relative = (this.debug ? '/src/main/skin/' : "/classes/skin/") + this.skin + "/css/";
          break;
        case atom.misc.Launcher.CSSClassLoader.BOOT:
          relative = "";
          break;
        case atom.misc.Launcher.CSSClassLoader.APP:
        default:
          relative = (this.debug ? '/src/main/css/' : "/classes/css/");
          break;
      }

      classes[url] = this.root + relative + src;
    }
    return classes;
  },

  "protected loadClassInternal": function(linkUrl, type, notModify) {
    if (!Object.isString(linkUrl)) {
      return false;
    }
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = this.findClass(linkUrl, notModify, type)[linkUrl];
    (document.head || document.getElementsByTagName("head")[0]).appendChild(link);
  }
});

Class.forName({
  name: "class atom.misc.Launcher.AppClassLoader extends js.net.URLClassLoader",

  "private static appClassLoader": null,
  '@Setter @Getter mainClass': null,

  "private AppClassLoader": function(parent) {
    this.parent = parent;

    var mainClass = null,
      scripts = document.getElementsByTagName("script");

    for (var i = 0, len = scripts.length; i < len; i++) {
      var script = scripts[i],
        jsvm = script.getAttribute("jsvm"),
        main = script.getAttribute("main");

      if (jsvm && jsvm === 'true') {
        if (main) {
          mainClass = main;
        }
        break;
      }
    }

    this.mainClass = mainClass;

    //System.getProperty("js.class.path")
    this.setRoot(this.getRoot() + (this.debug ? '/src/main/js/' : "/classes/js/"));
  },

  "public static getAppClassLoader": function(cl) {
    var loader = atom.misc.Launcher.AppClassLoader.appClassLoader;
    if (!loader) {
      loader = new atom.misc.Launcher.AppClassLoader(cl);
      atom.misc.Launcher.AppClassLoader.appClassLoader = loader;
    }
    return loader;
  },

  "public main": function() {
    if (this.mainClass) {
      this.loadClass(this.mainClass);
    }
  }
});
/*
$import([
    "js.lang.ClassNotFoundException",
    "js.lang.reflect.Field",
    "js.lang.reflect.Method"
], "BootstrapClassLoader");
*/
js.dom.Document.ready(atom.misc.Launcher.getLauncher().getLoader().main, atom.misc.Launcher.getLauncher().getLoader());

