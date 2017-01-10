/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2015 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2015年2月11日
 */
$import("js.util.HashMap", "BootstrapClassLoader");

Class.forName({
  name: "public class js.util.Properties extends js.util.HashMap",

  "protected defaults": null,

  /**
   * Creates an empty property list with the specified defaults.
   *
   * @param   defaults   the defaults.
   */
  "public Properties": function(defaults) {
    if (Object.isInstanceof(defaults, js.util.Properties)) {
      this.defaults = defaults;
    } else {
      this.load(defaults);
    }
  },

  /**
   * Searches for the property with the specified key in this property list.
   * If the key is not found in this property list, the default property list,
   * and its defaults, recursively, are then checked. The method returns the
   * default value argument if the property is not found.
   *
   * @param   key            the hashtable key.
   * @param   defaultValue   a default value.
   *
   * @return  the value in this property list with the specified key value.
   * @see     #setProperty
   * @see     #defaults
   */
  "public getProperty": function(key, defaultValue) {
    var oval = this.get(key);
    var sval = Object.isString(oval) ? oval : null;
    var val = (Object.isNull(sval) && !Object.isNull(defaults)) ? defaults.getProperty(key) : sval;
    return Object.isNull(val) ? defaultValue : val;
  },

  "public setProperty": function(key, value) {
    return this.put(key, value);
  },

  "public load": function(json) {
    for (var i in json) {
      this.put(i, json[i]);
    }
  }
});

