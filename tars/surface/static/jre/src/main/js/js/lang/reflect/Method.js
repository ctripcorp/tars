/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 14, 2014
 */

$import("js.lang.NullPointerException", "BootstrapClassLoader");
$import("js.lang.IllegalArgumentException", "BootstrapClassLoader");
$import("js.lang.reflect.InvocationTargetException", "BootstrapClassLoader");

Class.forName({
  name: "public final class js.lang.reflect.Method extends Object",

  "@Setter @Getter private _declaringClass": null,
  "@Setter @Getter private _name": null,
  "@Setter @Getter private _modifiers": null,
  "@Setter @Getter private _annotations": null,
  "@Setter @Getter private _value": null,
  Method: function(name, methodAccessor, declaringClass, modifiers,
    annotations) {
    this._name = name;
    this._declaringClass = declaringClass;
    this._modifiers = modifiers;
    this._annotations = annotations;
    this._value = methodAccessor;
  },
  clone: function() {
    return this;
  },
  /** 对带有指定参数的指定对象调用由此 Method 对象表示的基础方法。 */
  invoke: function() {
    if (arguments.length > 0) {
      var obj = arguments[0];
      if (!obj || !this._value) {
        throw new js.lang.NullPointerException();
      } else if (obj[this._name]) {
        // TODO 判断权限是否可以被调用
        try {
          return this._value.apply(obj, Array.prototype.slice.call(
            arguments, 1));
        } catch (e) {
          throw new js.lang.reflect.InvocationTargetException(e
            .getMessage());
        }
      }
    }
    throw new js.lang.IllegalArgumentException();
  }
});
js.lang.reflect.Method.loaded = true;

