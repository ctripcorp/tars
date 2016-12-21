/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 13, 2014
 */

$import("js.io.Console", "BootstrapClassLoader");

Class.forName({
  name: "class js.lang.System extends Object",
  "static err": null, // 错误流
  "static out": new js.io.Console(window.console), // 输出流
  "static properties": null,
  "private static _env": (function() {
    var userAgent = navigator.userAgent,
      ua = userAgent.toLowerCase(),
      check = function(r) {
        return r.test(ua);
      },
      DOC = document,
      docMode = DOC.documentMode,
      isStrict = DOC.compatMode === "CSS1Compat",
      isOpera = check(/opera/),
      isChrome = check(/\bchrome\b/),
      isWebKit = check(/webkit/),
      isSafari = !isChrome && check(/safari/),
      isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
      isSafari3 = isSafari && check(/version\/3/),
      isSafari4 = isSafari && check(/version\/4/),
      isIE = !isOpera && check(/msie/),
      isIE7 = isIE && (check(/msie 7/) || docMode === 7),
      isIE8 = isIE && (check(/msie 8/) && docMode !== 7),
      isIE6 = isIE && !isIE7 && !isIE8,
      isGecko = !isWebKit && check(/gecko/),
      isGecko2 = isGecko && check(/rv:1\.8/),
      isGecko3 = isGecko && check(/rv:1\.9/),
      isBorderBox = isIE && !isStrict,
      isWindows = check(/windows|win32/),
      isMac = check(/macintosh|mac os x/),
      isAir = check(/adobeair/),
      isLinux = check(/linux/),
      isSecure = /^https/i.test(window.location.protocol),
      isIE9 = isIE && (check(/msie 9/) || docMode === 7),
      isIE10 = isIE && (check(/msie 10/) || docMode === 7),
      isIETrident = /(msie\s|trident.*rv:)([\w.]+)/.exec(ua);

    return {
      userAgent: userAgent,
      isStrict: isStrict,
      isOpera: isOpera,
      isChrome: isChrome,
      isWebkit: isWebKit,

      isSafari: isSafari,
      safariVersion: isSafari4 ? '4' : (isSafari3 ? '3' : (isSafari2 ? '2' : null)),

      isIE: isIE || !!isIETrident,
      ieVersion: isIE6 ? '6' : (isIE7 ? '7' : (isIE8 ? '8' : (isIE9 ? '9' : (isIE10 ? '10' : (!!isIETrident && Object.isArray(isIETrident) && isIETrident.length > 2 ? isIETrident[2] : null))))),

      isGecko: isGecko,
      geckoVesion: isGecko3 ? '3' : (isGecko2 ? '2' : (isGecko ? '1' : null)),

      isBorderBox: isBorderBox,
      isWindows: isWindows,
      isMac: isMac,
      isAir: isAir,
      isLinux: isLinux,
      isSecure: isSecure
    };
  })(),

  /**
   * 获得指定的环境变量值
   */
  "static getEnv": function(env) {
    return (env) ? this._env[env] : this._env;
  },

  "public static currentTimeMillis": function() {
    return new Date().getTime();
  },

  "public static native arraycopy": function(src, srcPos, dest, destPos, length) {
    var parameter = Array.prototype.slice.call(src, srcPos, srcPos + length);
    Array.prototype.splice.call(parameter, 0, 0, destPos, 0);
    Array.prototype.splice.apply(dest, parameter);
  },

  "public static setProperty": function(name, value) {
    return js.lang.System.properties.setProperty(name, value);
  },

  "public static getProperty": function(name) {
    return js.lang.System.properties.getProperty(name);
  },

  "public static setProperties": function(props) {
    js.lang.System.properties = props;
  },

  "public static Properties getProperties": function() {
    return js.lang.System.properties;
  }
});

