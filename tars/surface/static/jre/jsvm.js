/*
 * ! JSRT JavaScript Library 0.1.5 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 10, 2014
 */

(function() {
  var USEECMA = !!Object.defineProperties;

  var extend = (function() {
    var copy = function(d, s, k, m, pros) {
      pros = pros || {};
      var writable = !!pros.writable,
        enumerable = !!pros.enumerable,
        configurable = !!pros.configurable;
      if (Object.prototype.toString.apply(d) !== "[object Array]") {
        for (var i in s) {
          if (s.hasOwnProperty(i)) {
            if (k) {
              if (!d[k]) {
                d[k] = {};
              }

              if (USEECMA) {
                Object.defineProperty(d[k], i, {
                  value: m ? s[i][m] : s[i],
                  writable: writable,
                  enumerable: enumerable,
                  configurable: configurable
                });
              } else {

                d[k][i] = m ? s[i][m] : s[i];
              }
            } else {
              if (USEECMA) {
                Object.defineProperty(d, i, {
                  value: m ? (s[i] ? s[i][m] : null) : s[i],
                  writable: writable,
                  enumerable: enumerable,
                  configurable: configurable
                });
              } else {
                d[i] = m ? (s[i] ? s[i][m] : null) : s[i];
              }
            }
          }
        }
      } else {
        for (var j = 0, len = d.length; j < len; j++) {
          for (var t in s) {
            if (s.hasOwnProperty(t)) {
              if (!d[j]) {
                d[j] = {};
              }
              if (k) {
                if (!d[j][k]) {
                  d[j][k] = {};
                }
                if (USEECMA) {
                  Object.defineProperty(d[j][k], t, {
                    value: m ? s[t][m] : s[t],
                    writable: writable,
                    enumerable: enumerable,
                    configurable: configurable
                  });
                } else {
                  d[j][k][t] = m ? s[t][m] : s[t];
                }
              } else {

                if (USEECMA) {
                  Object.defineProperty(d[j], t, {
                    value: m ? (s[t] ? s[t][m] : null) : s[t],
                    writable: writable,
                    enumerable: enumerable,
                    configurable: configurable
                  });
                } else {

                  d[j][t] = m ? (s[t] ? s[t][m] : null) : s[t];
                }
              }
            }
          }
        }
      }
    };
    return function(d, s, k, m, pros) {


      if (d === null || s === null || d === undefined || s === undefined || typeof d === "number" || typeof s === "number" || typeof d === "string" || typeof s === "string" || typeof d === "boolean" || typeof s === "boolean") {
        return d;
      }
      if (Object.prototype.toString.apply(s) !== "[object Array]") {
        copy(d, s, k, m, pros);
      } else {
        for (var j = 0, len = s.length; j < len; j++) {
          copy(d, s[j], k, m, pros);
        }
      }
      return d;
    };
  })();
  if (USEECMA) {
    Object.defineProperties(Object, {
      "extend": {
        value: extend,
        writable: false,
        enumerable: false,
        configurable: false
      },

      "USEECMA": {
        value: USEECMA,
        writable: false,
        enumerable: false,
        configurable: false
      }

    });
  } else {
    Object.extend = extend;
    Object.USEECMA = USEECMA;
  }
})();

Object
  .extend(
    Object,
    function() {
      return {
        // TODO 增加isNull和isEmpty的区分
        isNull: function(v) {
          return v === null || v === undefined;
        },

        isEmpty: function(v) {
          return v === null || v === undefined || ((Object.isArray(v) && !v.length)) || (Object.isString(v) && !(v.trim ? v.trim() : v.replace(/^\s+|\s+$/g, "")));
        },

        isArray: function(v) {
          return Object.prototype.toString.apply(v) === "[object Array]";
        },

        isDate: function(v) {
          return Object.prototype.toString.apply(v) === "[object Date]";
        },

        isObject: function(v) {
          return !!v && Object.prototype.toString.call(v) === "[object Object]";
        },

        isFunction: function(v) {
          return Object.prototype.toString.apply(v) === "[object Function]";
        },

        isNumber: function(v) {
          return typeof v === "number" && isFinite(v);
        },

        isString: function(v) {
          return typeof v === "string";
        },

        isBoolean: function(v) {
          return typeof v === "boolean";
        },

        isDefined: function(v) {
          return typeof v !== "undefined";
        },

        isInstanceof: function(sub, sup) {
          return sub instanceof sup;
        },
        /*
         * extend2 : function(d, s) { if (!Object.isEmpty(d) &&
         * Object.isArray(d)) { for (var i = 0; i < d.length;
         * i++) { Object.each(s, function(j, v, o) {
         * d[i].prototype[j] = v.value; }); } } return d; },
         */
        each: function(obj, fn, scope) {
          return Object.enumerate(obj, fn, scope, false);
        },
        enumerate: function(obj, fn, scope, pt) {
          if (Object.isEmpty(obj) || Object.isNumber(obj) || Object.isString(obj) || Object.isBoolean(obj)) {
            return;
          }
          if (Object.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {

              if (fn
                .call(scope || obj[i], i, obj[i],
                  obj) === false) {
                return i;
              }
            }
          } else {
            for (var p in obj) {
              if (pt || obj.hasOwnProperty(p)) {
                if (fn.call(scope || obj[p], p, obj[p],
                    obj) === false) {
                  return p;
                }
              }
            }
          }
          return true;
        }
      };
    }(), null, null, {
      writable: false,
      enumerable: false,
      configurable: false
    });

(function() {

  var fetch = function(name, callback, scope) {
    if (Object.isEmpty(name)) {
      return null;
    }
    var emp = name.split("."),
      length = emp.length,
      temp = window;
    for (var j = 0; j < length - 1; j++) {
      if (!temp[emp[j]]) {
        temp[emp[j]] = {};
      }
      temp = temp[emp[j]];
    }
    return callback.call(scope, emp[j], temp);
  };

  var format = (function() {
    var regx1 = /(\s+$|^\s+)/g,
      regx2 = /\s*([,(=])\s*/g,
      regx3 = /\s*[)]\s*/g,
      regx4 = /\s{2,}/g;
    return function(str) {
      return str.replace(regx1, "").replace(regx2, "$1").replace(regx3,
        ") ").replace(regx4, " ");
    };
  })();


  var FEATURE = {
    "CLASS": "class",
    "INTERFACE": "interface",
    "CONSTRUCTOR": "constructor",
    "FIELD": "field",
    "METHOD": "method",
    "UNKNOWN": "unknown"
  };
  var Attribute = function(name, value, declaringClass, modifiers,
    annotations) {
    this._name = name;
    this._value = value;
    this._declaringClass = declaringClass;
    this._modifiers = modifiers;
    this._annotations = annotations;
  };
  Attribute.prototype = {
    getName: function() {
      return this._name;
    },
    setName: function(name) {
      this._name = name;
    },
    getValue: function() {
      return this._value;
    },
    setValue: function(value) {
      this._value = value;
    },
    getDeclaringClass: function() {
      return this._declaringClass;
    },
    setDeclaringClass: function(declaringClass) {
      this._declaringClass = declaringClass;
    },
    getModifiers: function() {
      return this._modifiers;
    },
    setModifiers: function(modifiers) {
      this._modifiers = modifiers;
    },
    getAnnotations: function() {
      return this._annotations;
    },
    setAnnotations: function(annotation) {
      this._annotations = annotation;
    }
  };
  var convert = function(m, props) {

    m = format(m);

    var modify = null,
      feature = null,
      n = null,
      extend = null,
      implement = null;
    var index = null;
    if (props) {
      // method,field,constructor
      index = m.lastIndexOf(" ");
      modify = (index === -1 ? "" : m.substring(0, index + 1));
      n = m.substring(index + 1);

      if (n == props.belongsTo) {
        feature = FEATURE.CONSTRUCTOR;
      } else if (Object.isFunction(props.value)) {
        feature = FEATURE.METHOD;
      } else {
        feature = FEATURE.FIELD;
      }

    } else {

      var index1 = m.indexOf("class ");
      var index2 = m.indexOf("interface ");

      index = null;
      if (index1 != -1) {
        index = index1;
        feature = FEATURE.CLASS;
      } else {
        index = index2;
        feature = FEATURE.INTERFACE;
      }
      modify = m.substring(0, index);
      // FIXME var defs = m.substring(index + 1).split(" ")
      var defs = m.substring(index).split(" "),
        len = defs.length;
      n = defs[1];
      if (len >= 4) {
        if (defs[2] === "extends") {
          extend = defs[3];
        } else {
          extend = "Object";
          implement = defs[3].split(",");
        }
        if (len >= 6) {
          implement = defs[5].split(",");
        }
      }
    }

    var regx = /@\S*/g;
    var isAbstract = modify.indexOf("abstract ") != -1,
      isInterface = modify
      .indexOf("interface ") != -1,
      isFinal = modify
      .indexOf("final ") != -1,
      isStatic = modify.indexOf("static ") != -1,
      isProtected = modify
      .indexOf("protected ") != -1,
      isPrivate = modify
      .indexOf("private ") != -1,
      isDefault = modify
      .indexOf("default ") != -1,
      isPublic = (modify
        .indexOf("public ") != -1 || (!isPrivate && !isDefault && !isProtected)),
      isNonWritable = modify
      .indexOf("non-writable ") != -1,
      isNonEnumerable = modify
      .indexOf("non-enumerable ") != -1,
      isNonConfigurable = modify
      .indexOf("non-configurable ") != -1,
      isNonProxy = modify
      .indexOf("non-proxy ") != -1,
      isWritable = !isNonWritable && modify.indexOf("writable ") != -1,
      isEnumerable = !isNonEnumerable && modify.indexOf("enumerable ") != -1,
      isConfigurable = !isNonConfigurable && modify.indexOf("configurable ") != -1,
      isProxy = !isNonProxy && modify.indexOf("proxy ") != -1;

    /*
     * abstract 1024, interface 512, final 16, static 8, protected 4,
     * private 2 ,public 1,default 0
     */

    /*
     * 默认public
     *
     * non前缀的优先级更高
     *
     * 构造器不允许手动设置
     *
     * 提供三种模式
     * 1.系统默认
     * 		属性默认为writable,enumerable,non-configurable,non-proxy
     * 		方法默认为writable,non-enumerable,non-configurable,non-proxy, 如果final方法则为non-writable,non-enumerable,non-configurable,non-proxy
     * 		构造器默认为non-writable,non-enumerable,non-configurable,proxy
     * 2.手动设置writable，enumerable，configurable，proxy
     * 3.手动设置non-writable，non-enumerable，non-configurable，non-proxy
     */
    var modifiers = 0;

    if (isAbstract) {
      modifiers += Modifier.abstractBit;
    }
    if (isInterface) {
      modifiers += Modifier.interfaceBit;
    }
    if (isFinal) {
      modifiers += Modifier.finalBit;
    }
    if (isStatic) {
      modifiers += Modifier.staticBit;
    }
    if (isProtected) {
      modifiers += Modifier.protectedBit;
    }
    if (isPrivate) {
      modifiers += Modifier.privateBit;
    }
    if (isPublic) {
      modifiers += Modifier.publicBit;
    }

    switch (feature) {
      case FEATURE.CONSTRUCTOR:
        modifiers += Modifier.publicBit;
        modifiers += Modifier.proxyBit;
        break;
      case FEATURE.METHOD:
        if (isProxy) {
          modifiers += Modifier.proxyBit;
        }

        if (!isFinal && !isNonWritable) {
          modifiers += Modifier.writableBit;
        }

        if (!isFinal && !isNonEnumerable && isEnumerable) {
          modifiers += Modifier.enumerableBit;
        }

        if (!isFinal && !isNonConfigurable && isConfigurable) {
          modifiers += Modifier.configurableBit;
        }
        break;
      case FEATURE.FIELD:

        if (!isFinal && !isNonWritable) {
          modifiers += Modifier.writableBit;
        }

        if (!isFinal && !isNonEnumerable) {
          modifiers += Modifier.enumerableBit;
        }

        if (!isFinal && !isNonConfigurable && isConfigurable) {
          modifiers += Modifier.configurableBit;
        }
        break;
      default:
        break;
    }

    return {
      annotations: m.match(regx) || [],
      modifiers: modifiers,
      feature: feature || FEATURE.UNKNOWN,
      name: n,
      extend: extend || 'Object',
      implement: implement
    };
  };

  var Modifier = function() {};

  Object
    .extend(
      Modifier,
      function() {
        return {
          abstractBit: 1024,
          interfaceBit: 512,

          writableBit: 256,
          enumerableBit: 128,
          configurableBit: 64,
          proxyBit: 32,

          finalBit: 16,
          staticBit: 8,
          protectedBit: 4,
          privateBit: 2,
          publicBit: 1,

          isProxy: function(modifiers) {
            return (modifiers & Modifier.proxyBit) !== 0;
          },
          isWritable: function(modifiers) {
            return (modifiers & Modifier.writableBit) !== 0;
          },
          isEnumerable: function(modifiers) {
            return (modifiers & Modifier.enumerableBit) !== 0;
          },
          isConfigurable: function(modifiers) {
            return (modifiers & Modifier.configurableBit) !== 0;
          },
          isAbstract: function(modifiers) {
            return (modifiers & Modifier.abstractBit) !== 0;
          },
          isInterface: function(modifiers) {
            return (modifiers & Modifier.interfaceBit) !== 0;
          },
          isFinal: function(modifiers) {
            return (modifiers & Modifier.finalBit) !== 0;
          },
          isStatic: function(modifiers) {
            return (modifiers & Modifier.staticBit) !== 0;
          },
          isProtected: function(modifiers) {
            return (modifiers & Modifier.protectedBit) !== 0;
          },
          isPrivate: function(modifiers) {
            return (modifiers & Modifier.privateBit) !== 0;
          },
          isPublic: function(modifiers) {
            return (modifiers & Modifier.publicBit) !== 0;
          }
        };
      }(), null, null, {
        writable: false,
        enumerable: false,
        configurable: false
      });


  var proxy = function(m, b, t, a) {
    var f = m.getValue(),
      modifiers = m.getModifiers(),
      isStatic = Modifier.isStatic(modifiers),
      isProxy = Modifier.isProxy(modifiers);

    return (Object.isEmpty(b) && Object.isEmpty(t) && Object.isEmpty(a) && !isProxy) ? f : function() {
      // TODO 判断权限private,default,protected,public
      // TODO 判断是否可以被重写final

      var thisClass = this.getClass(),
        superClass = thisClass.getSuperClass();
      var $this = isStatic ? thisClass.getClassConstructor() : this;
      $this.$super = superClass ? (isStatic ? superClass.getClassConstructor() : superClass.getClassConstructor().prototype) : null;

      //var args = Array.prototype.slice.call(arguments,0).concat([$super,$this]);

      // before
      if (!Object.isEmpty(b) && Object.isFunction(b)) {
        b.apply($this, arguments);
      }

      var result = null;
      try {
        result = (!Object.isEmpty(f) && Object.isFunction(f)) ? f.apply($this, arguments) : f;
      } catch (e) {
        if (Object.isEmpty(t)) {
          throw e;
        } else {
          // throw
          if (Object.isFunction(t)) {
            t.apply($this, arguments);
          }
        }
      }

      // after
      if (!Object.isEmpty(a) && Object.isFunction(a)) {
        a.apply($this, arguments);
      }

      return result;
    };
  };
  var doAnnotations = function(self, m) {
    if (Object.isFunction(m.getValue())) {
      // 方法上的注解
    } else {
      // 属性上的注解
      if (m.getName() && m.getName().length > 1 && m.getName().length != "_") {
        var name = m.getName().indexOf("_") === 0 ? m.getName()
          .substring(1) : m.getName();
        name = name.charAt(0).toUpperCase() + name.substring(1);

        var modifier = m.getModifiers();
        //(((m.getModifiers() & 8) != 0) ? 8 : 0) + 1;

        if (m.getAnnotations().indexOf("@Getter") != -1) {
          var getName = "get" + name;
          if (!self.hasMethod(getName)) {
            self.addMethod(new Attribute(getName, function() {
              return this[m.getName()];
            }, self, modifier, []));
          }
        }
        if (m.getAnnotations().indexOf("@Setter") != -1) {
          var setName = "set" + name;
          if (!self.hasMethod(setName)) {
            self.addMethod(new Attribute(setName, function(value) {
              this[m.getName()] = value;
            }, self, modifier, []));
          }
        }
      }
    }
  };

  var empty = function() {};

  var CodeHeap = function() {
    this.heap = [];
  };
  CodeHeap.prototype = {
    find: function(elem) {
      for (var i = 0, len = this.heap.length; i < len; i++) {
        if (this.heap[i].key === elem) {
          return this.heap[i].value || null;
        }
      }
      return undefined;
    },
    get: function($class, key, subKey) {
      var code = this.find($class);
      if (Object.isDefined(code)) {
        var values = code[key];
        if (subKey) {
          if (values) {
            for (var i = 0, len = values.length; i < len; i++) {
              if (values[i].getName() === subKey) {
                return values[i] || null;
              }
            }
          }
          return undefined;
        }
        return values;
      }
      throw new Error("illegal code heap states.");
    },
    set: function($class, key, value) {
      var code = this.find($class);
      if (code) {
        if (Object.isArray(key)) {
          Object.each(key, function(i, v, o) {
            code[v] = value;
          });
        } else {
          code[key] = value;
        }
      }
    },
    create: function($class, name, fullName, alias, packages, feature,
      modifiers, annotations, fields, methods, superClass,
      superInterfaces, classloader, instanceClass, classConstructor) {

      if (this.find($class)) {
        throw new Error("class or interface <" + fullName + "> have already loaded!");
      }
      this.heap.push({
        key: $class,
        value: {
          name: name,
          fullName: fullName,
          alias: alias,

          packages: packages,
          feature: feature,
          modifiers: modifiers,
          annotations: annotations,

          // 自身method和fields,不包含从父类继承来的
          // FIXME 从{}更改成[]，以防止内部元素与Object原生属性及方法的重名问题
          fields: fields || [],
          methods: methods || [],

          superClass: superClass,
          superInterfaces: superInterfaces || [],

          classloader: classloader,
          instanceClass: instanceClass || function() {},
          instance: classConstructor,
          classConstructor: classConstructor

        }
      });

    }
  };

  var heap = new CodeHeap();

  var $class = function(classDef, classloader) {
    // TODO 判断extend合法,判断name合法+判断类是否已经存在 class xxx extends yyy
    // implements
    // zzz,ttt
    var modify = convert(classDef.name),
      fullName = modify.name,
      alias = classDef.alias,
      packages = null,
      isRoot = false,
      isKernel = true,
      superClassDef = modify.extend,
      superInterfacesDef = modify.implement,
      classObj = this,
      classConstructor = null;

    heap.create(this, null, fullName, alias, packages, modify.feature,
      modify.modifiers, modify.annotations, null, null, null, null,
      classloader, null, null);

    switch (fullName) {

      case 'Object':
        isRoot = true;
        classConstructor = Object;
        break;
      case 'Function':
        classConstructor = Function;
        break;
      case 'Array':
        classConstructor = Array;
        break;
      case 'String':
        classConstructor = String;
        break;
      case 'Boolean':
        classConstructor = Boolean;
        break;
      case 'Number':
        classConstructor = Number;
        break;
      case 'Date':
        classConstructor = Date;
        break;
      case 'RegExp':
        classConstructor = RegExp;
        break;
      case 'Error':
        classConstructor = Error;
        break;
      case 'EvalError':
        classConstructor = EvalError;
        break;
      case 'RangeError':
        classConstructor = RangeError;
        break;
      case 'ReferenceError':
        classConstructor = ReferenceError;
        break;
      case 'SyntaxError':
        classConstructor = SyntaxError;
        break;
      case 'TypeError':
        classConstructor = TypeError;
        break;
      case 'URIError':
        classConstructor = URIError;
        break;

      default:
        isKernel = false;

        classConstructor = function() {
          // 原始构造器
          // 1.设置class对象和hashCode值

          if (Object.USEECMA) {
            Object.defineProperty(this, "$class", {
              value: classObj,
              writable: false,
              enumerable: false,
              configurable: false
            });
          } else {
            this.$class = classObj;
          }

          // 2.2初始化继承父类属性
          // TODO protected以上的属性
          var each = function(j, v, o) {
            var i = v.getName();
            if (!classObj.hasField(i)) {
              var value = v.getValue(),
                modifiers = v.getModifiers();

              value = value ? value.clone() : value;

              if (Object.USEECMA) {
                Object
                  .defineProperty(
                    this,
                    i, {
                      value: value,
                      writable: Modifier.isWritable(modifiers),
                      enumerable: Modifier.isEnumerable(modifiers),
                      configurable: Modifier.isConfigurable(modifiers)
                    });
              } else {
                this[i] = value;
              }
            }
          };
          var sc = classObj.getSuperClass(),
            superClasses = [];
          while (sc) {
            superClasses.unshift(sc);
            sc = sc.getSuperClass();
          }
          Object.each(superClasses, function(j, sc, o) {
            var f = sc.getFields();
            Object.each(f, each, this);
            // sc.getConstructor().apply(this, arguments);
          }, this);

          // 3.初始化自身定义属性
          Object.each(classObj.getFields(), function(j, v, o) {
            var i = v.getName();
            var value = v.getValue(),
              modifiers = v.getModifiers();
            value = value ? value.clone() : value;
            if (Object.USEECMA) {
              Object.defineProperty(this, i, {
                value: value,
                writable: Modifier.isWritable(modifiers),
                enumerable: Modifier.isEnumerable(modifiers),
                configurable: Modifier.isConfigurable(modifiers)
              });
            } else {
              this[i] = value;
            }
          }, this);

          // 4.用户构造器,先调用父类构造器以及constructor2方法
          var constructor2 = classObj.getConstructor();
          if (constructor2) {
            constructor2.apply(this, arguments);
          }

          // 5.执行默认初始化方法
          var initial = classObj.getInitial();
          (initial = initial || this.initial || empty).apply(this,
            arguments);

          // 6.防止用户构造器修改class对象
          if (!Object.USEECMA && this.$class != classObj) {
            this.$class = classObj;
          }
        };

        break;
    }

    heap.set(this, ["classConstructor", "instance"], classConstructor);

    var name = fetch(fullName, function(name, value) {
      value[name] = classConstructor;

      if (Object.USEECMA) {
        Object.defineProperty(value[name], "$class", {
          value: this,
          writable: false,
          enumerable: false,
          configurable: false
        });
      } else {
        value[name].$class = this;
      }

      packages = value;
      return name;
    }, this);

    heap.set(this, "packages", packages);
    heap.set(this, "name", name);

    if (!isRoot) {

      if (superInterfacesDef) {
        var len = superInterfacesDef.length;

        var superInterfaces = heap.get(this, "superInterfaces");
        for (var i = 0; i < len; i++) {

          superInterfaces[i] = fetch(superInterfacesDef[i], function(
            name, value) {
            return value[name];
          }).$class;
        }
      }

      var superClass = (fetch(superClassDef, function(name, value) {
        return value[name];
      })).$class;

      heap.set(this, "superClass", superClass);

      // TODO 判断父类是否final
      if (!isKernel) {
        var instanceClass = heap.get(this, "instanceClass");
        instanceClass.prototype = ((superClass) ? heap.get(superClass,
          "instance") : Object).prototype;

        if (Object.USEECMA) {
          classConstructor.prototype = Object
            .create(instanceClass.prototype);

          Object.defineProperty(classConstructor.prototype,
            "constructor", {
              value: classConstructor,
              writable: false,
              enumerable: false,
              configurable: false
            });

        } else {
          classConstructor.prototype = new instanceClass();

          classConstructor.prototype.constructor = classConstructor;
        }

        if (superClass == Object.$class) {

          // TODO 拷贝js.lang.Object.$class中的toString方法
          if (Object.USEECMA) {
            var m = Object.$class.getMethod("toString"),
              modifiers = m.getModifiers();
            Object
              .defineProperty(
                classConstructor.prototype,
                "toString", {
                  value: m.getValue(),
                  writable: Modifier.isWritable(modifiers),
                  enumerable: Modifier.isEnumerable(modifiers),
                  configurable: Modifier.isConfigurable(modifiers)
                });
          } else {

            classConstructor.prototype.toString = Object.$class
              .getMethod("toString").getValue();
          }
        }
      }
    }

    Object.each(classDef, function(i, v, o) {
      if (i != "name" && i != "alias") {
        var m = convert(i, {
            belongsTo: name,
            value: v
          }),
          feature = m.feature;
        m = new Attribute(m.name, v, this, m.modifiers, m.annotations);

        switch (feature) {
          case FEATURE.CONSTRUCTOR:
            if (name === "Object") {
              heap.set(this, "constructor2", m.getValue());
            } else {
              // 将构造器代理，默认调用父类构造器
              heap.set(this, "constructor2", proxy(m, this
                .getSuperClass().getConstructor()));
            }
            break;

          case FEATURE.METHOD:
            // 确保toString为原生
            if (isKernel && m.getName() === "toString") {
              this.getMethods().push(m);
              return true;
            }
            this.addMethod(m);
            break;

          case FEATURE.FIELD:
            this.addField(m);
            break;
          default:
            this.addField(m);
            break;
        }
      }
    }, this);

    // 默认无参构造函数
    if (!heap.get(this, "constructor2")) {
      heap.set(this, "constructor2", proxy(new Attribute(name, empty,
        this, 1, []), this.getSuperClass().getConstructor()));
    }

    fetch(alias, function(name, value) {
      value[name] = classConstructor;
    }, this);

    return this;
  };
  $class.prototype = {
    getClassLoader: function() {

      return heap.get(this, "classloader") || (window.js.lang.ClassLoader ? js.lang.ClassLoader
        .getSystemClassLoader() : null);
    },

    getClassConstructor: function() {
      return heap.get(this, "classConstructor");
    },
    getConstructor: function() {
      return heap.get(this, "constructor2");
    },
    getInitial: function() {
      return heap.get(this, "initial");
    },
    getPackage: function() {
      return heap.get(this, "packages");
    },

    getDeclaredField: function(name) {
      return this.getField(name);
    },
    getDeclaredFields: function() {
      return this.getFields();
    },
    hasField: function(name) {
      return Object.isDefined(heap.get(this, "fields", name));
    },
    getField: function(name) {
      var v = heap.get(this, "fields", name);
      if (Object.isDefined(v)) {
        return v;
      }
      throw new js.lang.NoSuchFieldException();
    },
    getFields: function() {
      return heap.get(this, "fields");
    },
    getDeclaredMethod: function(name) {
      return this.getMethod(name);
    },
    getDeclaredMethods: function() {
      return this.getMethods();
    },
    hasMethod: function(name) {
      return Object.isDefined(heap.get(this, "methods", name));
    },
    getMethod: function(name) {
      var v = heap.get(this, "methods", name);
      if (Object.isDefined(v)) {
        return v;
      }
      throw new js.lang.NoSuchMethodException();
    },
    getMethods: function() {
      return heap.get(this, "methods");
    },
    getName: function() {
      return heap.get(this, "name");
    },
    getFullName: function() {
      return heap.get(this, "fullName");
    },
    getSuperClass: function() {
      return heap.get(this, "superClass");
    },
    getModifiers: function() {
      return heap.get(this, "modifiers");
    },
    getAnnotations: function() {
      return heap.get(this, "annotations");
    },

    // 构造器必须公有静态方法必须公有
    addMethod: function(m) {
      if (!Object.isEmpty(m) && Object.isFunction(m.getValue())) {
        if (m.getAnnotations() && m.getAnnotations().length) {
          doAnnotations(this, m);
        }
        // 不允许更改构造器
        var n = m.getName(),
          name = heap.get(this, "name");
        if (n === name) {
          return;
        }

        m.setValue(proxy(m));
        m.setDeclaringClass(this);

        if (window.js && window.js.lang && window.js.lang.reflect && window.js.lang.reflect.Method && window.js.lang.reflect.Method.loaded) {
          m = new window.js.lang.reflect.Method(n, m.getValue(),
            this, m.getModifiers(), m.getAnnotations());
        }
        var modifiers = m.getModifiers(),
          isStatic = Modifier.isStatic(modifiers);
        if (isStatic) {

          if (Object.USEECMA) {
            Object.defineProperty(this.getClassConstructor(), n, {
              value: m.getValue(),
              writable: Modifier.isWritable(modifiers),
              enumerable: Modifier.isEnumerable(modifiers),
              configurable: Modifier.isConfigurable(modifiers)
            });
          } else {
            this.getClassConstructor()[n] = m.getValue();
          }
        } else {
          if (Object.USEECMA) {
            Object
              .defineProperty(
                this.getClassConstructor().prototype,
                n, {
                  value: m.getValue(),

                  writable: Modifier.isWritable(modifiers),
                  enumerable: Modifier.isEnumerable(modifiers),
                  configurable: Modifier.isConfigurable(modifiers)
                });
          } else {
            this.getClassConstructor().prototype[n] = m.getValue();
          }
        }
        this.getMethods().push(m);

        if (n === "initial") {
          heap.set(this, "initial", m.getValue());
        }
      }
    },
    addField: function(m) {
      if (!Object.isEmpty(m) && !Object.isFunction(m.getValue())) {
        if (m.getAnnotations() && m.getAnnotations().length) {
          doAnnotations(this, m);
        }
        m.setDeclaringClass(this);
        if (window.js && window.js.lang && window.js.lang.reflect && window.js.lang.reflect.Field && window.js.lang.reflect.Field.loaded) {
          m = new window.js.lang.reflect.Field(m.getName(), m
            .getValue(), this, m.getModifiers(), m
            .getAnnotations());
        }
        var modifiers = m.getModifiers(),
          isStatic = Modifier.isStatic(modifiers);
        if (isStatic) {
          if (Object.USEECMA) {
            Object.defineProperty(this.getClassConstructor(), m
              .getName(), {
                value: m.getValue(),

                writable: Modifier.isWritable(modifiers),
                enumerable: Modifier.isEnumerable(modifiers),
                configurable: Modifier.isConfigurable(modifiers)
              });
          } else {
            this.getClassConstructor()[m.getName()] = m.getValue();
          }
        }
        this.getFields().push(m);
      }
    },
    getInstance: function() {
      return heap.get(this, "instance");
    },
    isInstance: function(obj) {
      return Object.isNull(obj) ? false : obj.getClass() == this;
    },
    newInstance: function() {
      return new(heap.get(this, "classConstructor"))();
    },
    clone: function() {
      return this;
    },

    isAssignableFrom: function() {
      // TODO
      return false;
    },

    isInterface: function() {
      // TODO
      return heap.get(this, "feature") === "interface";
    },

    isArray: function() {
      // TODO
      return false;
    },
    isPrimitive: function() {
      // TODO
      return false;
    },
    isAnnotation: function() {
      // TODO
      return false;
    }
  };

  Class = function() {};
  Class.forName = function(cls, classloader) {
    return new $class(cls, classloader);
  };
})();

// TODO
// Function,Array,String,Boolean,Number,Date,RegExp,Error,EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError对象的$class属性


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 10, 2014
 */
"use strict";
(function() {
  var currentTimeMillis = function() {
    return new Date().getTime();
  };
  var $class = Class.forName({
    name: "class Object",
    alias: "js.lang.Object",
    Object: function() {
      var _hashCode = (currentTimeMillis() + Math.random()).toString(16);
      if (Object.USEECMA) {
        Object.defineProperty(this, "_hashCode", {
          value: _hashCode,
          writable: false,
          enumerable: false,
          configurable: false
        });
      } else {
        this._hashCode = _hashCode;
      }
    },

    "non-writable non-enumerable non-configurable non-proxy getClass": function() {
      return this.$class || Object.$class;
    },

    "non-writable non-enumerable non-configurable non-proxy getVersion": (function() {
      /** 主版本号 . 子版本号 [ 修正版本号 [. 编译版本号 ]] */
      var version = "0.1.1.0001";
      return function() {
        return this.version || version;
      };
    })(),

    /** 指示某个其他对象是否与此对象“相等”。 */
    "equals": function(obj) {
      return obj === this;
    },

    "hashCode": function() {
      if (!this._hashCode) {
        this._hashCode = (currentTimeMillis() + Math.random()).toString(16);
      }
      return this._hashCode;
    },

    "toString": function() {
      // TODO String,Number,Boolean,Array等的toString()方法
      return this.getClass().getFullName() + "<" + this.hashCode() + ">";
    },

    "clone": function() {
      var b = null;
      if (this instanceof Number || this instanceof String || this instanceof Boolean) {
        return this.valueOf();
      } else if (this instanceof Function || this instanceof RegExp || this instanceof Error || this instanceof EvalError || this instanceof RangeError || this instanceof ReferenceError || this instanceof SyntaxError || this instanceof TypeError || this instanceof URIError) {
        return this;
      } else if (this instanceof Date) {
        b = new Date();
        b.setTime(this.getTime());
        return b;
      } else if (Object.isNumber(this) || Object.isString(this) || Object.isBoolean(this)) {
        //FIXME
        return this;
      } else if (this instanceof Array) {
        b = [];
        var parameter = Array.prototype.slice.call(this, 0, this.length);
        Array.prototype.splice.call(parameter, 0, 0, 0, 0);
        Array.prototype.splice.apply(b, parameter);
        return b;
      } else {
        b = this.$class ? this.$class.newInstance() : {};
        for (var a in this) {
          if (a === "_hashCode") {
            b[a] = currentTimeMillis().toString(16);
            continue;
          }
          if (this.hasOwnProperty(a)) {
            b[a] = this[a] ? this[a].clone() : this[a];
          }
        }
        return b;
      }
    },

    "toJson": (function() {
      var NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON && typeof JSON.stringify === "function" && JSON.stringify(0) === "0" && typeof JSON.stringify(function() {}) === "undefined";
      return function() {
        if (NATIVE_JSON_STRINGIFY_SUPPORT) {
          // TODO 只取public属性

          return this;
          // return JSON.stringify(this);
        }
        return this;
      };
    })(),

    "toQueryString": function() {
      // TODO
      var queryString = [];
      for (var attr in this) {
        if (this[attr]) {
          queryString.push(attr + "=" + this[attr]);
        }
      }
      return queryString.join("&");
    }
  });
  if (Object.USEECMA) {
    Object.defineProperty(Object, "$class", {
      value: $class,
      writable: false,
      enumerable: false,
      configurable: false
    });
  } else {
    Object.$class = $class;
  }
})();


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 10, 2014
 */
Class.forName({
  name: "class Array",
  alias: "js.lang.Array",
  Array: function() {},
  clear: function() {
    this.splice(0, this.length);
  },
  contains: function(elem) {
    return (this.indexOf(elem) !== -1);
  },
  remove: function(elem) {
    var index = this.indexOf(elem);
    if (index > -1) {
      this.splice(index, 1);
      return true;
    }
    return false;
  },
  peek: function() {
    return this.slice(-1)[0];
  },
  last: function() {
    return this[this.length - 1];
  },
  first: function() {
    return this[0];
  },
  indexOf: function(elem, start, end) {
    for (var i = start || 0, len = Math.min(end || this.length, this.length); i < len; i++) {
      if (this[i] === elem) {
        return i;
      }
    }
    return -1;
  },
  append: function(array, start, end) {
    if (!Object.isEmpty(array) && Object.isArray(array)) {
      start = start || 0;
      end = Math.min(end || array.length, array.length);

      if (end > start) {
        //end = (end && end > start && end < array.length) ? end : array.length;
        var parameter = Array.prototype.slice.call(array, start, end);
        Array.prototype.splice.call(parameter, 0, 0, this.length, 0);
        Array.prototype.splice.apply(this, parameter);
      }
    }
    return this;
  },
  insert: function(array, start, end) {
    if (!Object.isEmpty(array) && Object.isArray(array)) {
      start = start || 0;
      end = Math.min(end || array.length, array.length);

      if (end > start) {
        //end = (end && end > start && end < array.length) ? end : array.length;
        var parameter = Array.prototype.slice.call(array, start, end);
        Array.prototype.splice.call(parameter, 0, 0, 0, 0);
        Array.prototype.splice.apply(this, parameter);
      }
    }
    return this;
  },
  getLength: function() {
    return this.length;
  }
});


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
  name: "class Boolean",
  alias: "js.lang.Boolean",
  Boolean: function() {},
  "public equals": function(s) {
    return Object.isBoolean(s) && this == s;
  }
});


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
  name: "class Function",
  alias: "js.lang.Function",
  Function: function() {}
});


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
  name: "class RegExp",
  alias: "js.lang.RegExp",
  RegExp: function() {}
});


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 10, 2014
 */

Class.forName({
  name: "class String",
  alias: "js.lang.String",
  String: function() {},
  "public trim": function() {
    var re = /^\s+|\s+$/g;
    return function() {
      return this.replace(re, "");
    };
  }(),
  "public equals": function(s) {
    return Object.isString(s) && this == s;
  },
  getLength: function() {
    return this.length;
  }

});


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
  name: "class js.lang.Throwable extends Object",
  "private message": null, // 错误信息,多同description
  "private name": "js.lang.Throwable", // 错误名
  "private number": null, // 错误号
  "private description": null, // 描述
  "private fileName": null, // 错误发生的文件( Only in FF )
  "private stack": null, // 错误发生时的调用堆栈 FF Only 属性
  "private lineNumber": null,
  Throwable: function(message, fileName, lineNumber, stack) {
    this.message = message;
    this.fileName = fileName;
    this.stack = stack;
    this.lineNumber = lineNumber;
  },
  getName: function() {
    return this.name;
  },
  getMessage: function() {
    return this.message;
  },
  getNumber: function() {
    return this.number;
  },
  getDescription: function() {
    return this.description;
  },
  getFileName: function() {
    return this.fileName;
  },
  getStack: function() {
    return this.stack;
  },
  getLineNumber: function() {
    return this.lineNumber;
  }
});
/*Object.extend([ Error, EvalError, RangeError, ReferenceError, SyntaxError,
TypeError, URIError ], js.lang.Throwable.$class.getMethods(),
'prototype', '_value');*/


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 12, 2014
 */
Class.forName({
  name: "class js.lang.Exception extends js.lang.Throwable",

  "private name": "js.lang.Exception", // 错误名
  "private number": 0, // 错误号

  Exception: function(message, fileName, lineNumber, stack) {
    this.message = message;
    this.fileName = fileName;
    this.stack = stack;
    this.lineNumber = lineNumber;
  }

});


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
  name: "class Error",
  alias: "js.lang.Error",

  "private name": "js.lang.Error", // 错误名
  "private number": 1,

  Error: function(message, fileName, lineNumber, stack) {
    this.message = message;
    this.fileName = fileName;
    this.stack = stack;
    this.lineNumber = lineNumber;
  },
  'static init': function() {
    var methods = {},
      __methods = js.lang.Throwable.$class.getMethods(),
      __length = __methods.length,
      __index = 0;
    for (; __index < __length; __index++) {
      methods[__methods[__index]._name] = __methods[__index]._value;
    }
    Object.extend(Error.prototype, methods);
  }
});

js.lang.Error.init();


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 19, 2014
 */
Class.forName({
  name: "class js.lang.ClassNotFoundException extends js.lang.Exception",
  "private name": "js.lang.ClassNotFoundException", // 错误名
  "private number": 100
    // 错误号
});


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 12, 2014
 */
Class.forName({
  name: "class js.lang.NoSuchMethodException extends js.lang.Exception",
  "private name": "js.lang.NoSuchMethodException",
  "private number": 106
});


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 12, 2014
 */
Class.forName({
  name: "class js.lang.NoSuchFieldException extends js.lang.Exception",
  "private name": "js.lang.NoSuchFieldException",
  "private number": 105
});


/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2015 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2015年2月10日
 */
Class.forName({
  name: "class js.lang.InternalError extends js.lang.Error",

  "private name": "js.lang.InternalError", // 错误名
  "private number": 99,


});


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 17, 2014
 */

Class.forName({
  name: "abstract class js.lang.ClassLoader extends Object",

  '@Setter @Getter private parent': null,

  '@Setter @Getter private classes': [],

  "abstract loadClass": function(scriptUrl, callback, scope, showBusy) {},
  'static getSystemClassLoader': function(scriptUrl) {
    return atom.misc.Launcher.getLauncher().getClassLoader();
  }
});


/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 14, 2014
 */

Class.forName({
  name: "class js.net.URLClassLoader extends js.lang.ClassLoader",

  '@Setter @Getter loadedScripts': {},
  '@Setter @Getter waitingList': {},
  '@Setter @Getter path': [],
  '@Setter @Getter root': "",
  '@Setter @Getter version': null,
  '@Setter @Getter debug': false,

  URLClassLoader: function(parent) {
    this.parent = parent;

    var root = [window.location.origin],
      version = null,
      isDebug = false,
      scripts = document.getElementsByTagName("script");

    for (var i = 0, len = scripts.length; i < len; i++) {
      var script = scripts[i],
        jsvm = script.getAttribute("jsvm"),
        servletpath = script.getAttribute("servletpath"),
        hasDebug = script.hasAttribute("debug"),
        debug = script.getAttribute("debug"),
        v = script.getAttribute("version");

      if (jsvm && jsvm === 'true') {
        if (servletpath) {
          root.push(servletpath);
        }

        if (hasDebug && debug.toLowerCase() !== 'false') {
          isDebug = true;
        }

        version = v;
        break;
      }
    }

    this.debug = isDebug;
    this.version = version;
    this.root = root.join("/");
  },

  findClass: function(scriptUrl, notModify) {
    var isString = (Object.isString(scriptUrl));

    if (isString)
      scriptUrl = [scriptUrl];

    var classes = {},
      path = this.path,
      querys = [];
    if (!Object.isArray(scriptUrl)) {
      return classes;
    }

    for (var i = 0; i < scriptUrl.length; i++) {
      var src = scriptUrl[i],
        url = src;

      for (var j = 0; j < path.length; j++) {
        if (path[j] && path[j].name && path[j].url) {
          if (src.indexOf(path[j].name) === 0) {
            src = path[j].url + src.substring(path[j].name.length);
            break;
          }
        }
      }
      src = src.replace(/[.]/g, "/") + ".js";

      if (this.version) {
        querys.push("v=" + this.version);
      }

      if (notModify) {
        querys.push("t=" + new Date().getTime());
      }

      if (querys.length > 0) {
        src += "?" + querys.join("&");
      }

      classes[url] = this.root + src;
    }
    return classes;
  },
  /**
   * Loads one or more external script checking if not already loaded
   * previously by this function.
   *
   * @param {String|Array}
   *            scriptUrl One or more URLs pointing to the scripts to
   *            be loaded.
   * @param {Function}
   *            [callback] A function to be called when the script is
   *            loaded and executed. If a string is passed to
   *            "scriptUrl", a boolean parameter is passed to the
   *            callback, indicating the success of the load. If an
   *            array is passed instead, two array parameters are
   *            passed to the callback; the first contains the URLs
   *            that have been properly loaded, and the second the
   *            failed ones.
   * @param {Object}
   *            [$scope] The $scope ("this" reference) to be used for
   *            the callback call. Default to {@link Mclipse}.
   * @param {Boolean}
   *            [showBusy] Changes the cursor of the document while + *
   *            the script is loaded.
   * @example new js.net.URLClassLoader().load( '/myscript.js' );
   * @example new js.net.URLClassLoader().load( '/myscript.js',
   *          function( success ) { // Alerts "true" if the script has
   *          been properly loaded. // HTTP error 404 should return
   *          "false". alert( success ); });
   * @example new js.net.URLClassLoader().load( [ '/myscript1.js',
   *          '/myscript2.js' ], function( completed, failed ) {
   *          alert( 'Number of scripts loaded: ' + completed.length );
   *          alert( 'Number of failures: ' + failed.length ); });
   */
  loadClass: function(scriptUrl, synchronous, notModify, callback, $scope, showBusy) {

    var isString = (Object.isString(scriptUrl));

    if (isString)
      scriptUrl = [scriptUrl];

    if (!Object.isArray(scriptUrl)) {
      return false;
    }

    var scriptCount = scriptUrl.length,
      completed = [],
      failed = [];

    if (!$scope) {
      $scope = this;
    }

    if (scriptCount === 0) {
      doCallback(true);
      return true;
    }

    for (var i = 0; i < scriptCount; i++) {

      var url = scriptUrl[i];

      this.loadClassInternal(url, synchronous, notModify, callback, $scope, showBusy);
    }
  },
  "protected loadClassInternal": function(scriptUrl, synchronous, notModify, callback, $scope, showBusy) {

    var isString = (Object.isString(scriptUrl));

    if (!isString) {
      return false;
    }

    var loadedScripts = this.loadedScripts,
      waitingList = this.waitingList,
      completed = [],
      failed = [],
      scope = this;

    if (showBusy) {
      document.setStyle('cursor', 'wait');
    }

    if (!$scope) {
      $scope = this;
    }

    var doCallback = function(success) {
      if (callback) {
        if (isString)
          callback.call($scope, success);
        else
          callback.call($scope, completed, failed);
      }
      if (failed.length > 0) {
        throw new js.lang.ClassNotFoundException("Can't find Class named (" + failed.join(",") + ")");
      }
    };

    var checkLoaded = function(url, success) {
      (success ? completed : failed).push(url);

      if (showBusy) {
        document.getDocumentElement().removeStyle('cursor');
      }
      doCallback(success);

    };

    var onLoad = function(url, success) {
      // Mark this script as loaded.

      if (success) {
        loadedScripts[url] = 1;

        if (waitingList[url]) {
          // Get the list of callback checks waiting for this
          // file.
          var waitingInfo = waitingList[url];
          delete waitingList[url];

          // Check all callbacks waiting for this file.
          for (var i = 0; i < waitingInfo.length; i++) {
            waitingInfo[i](url, success);
          }
        }
      } else {
        scope.parent.loadClassInternal(url, synchronous, notModify, callback, $scope, showBusy);
      }
    };

    var loadScript = function(url, src) {

      // Create the <script> element.
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;

      if (script) {
        if ('addEventListener' in script) {
          script.onload = function() {
            onLoad(url, true);
          };
        } else if ('readyState' in script) { // for <IE9
          // Compatability
          script.onreadystatechange = function() {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              onLoad(url, true);
            }
          };
        } else {
          /** @ignore */
          script.onload = function() {
            // Some browsers, such as Safari, may call the
            // onLoad function
            // immediately. Which will break the loading
            // sequence. (#3661)
            setTimeout(function() {
              onLoad(url, true);
            }, 0);
          };

          // FIXME: Opera and Safari will not fire onerror.
          /** @ignore */
          script.onerror = function() {
            onLoad(url, false);
          };
        }
        // }

        // Append it to <head>.
        (document.head || document.getElementsByTagName("head")[0]).appendChild(script);
      }

    };

    var synchronousScript = function(url, src) {
      var isCrossOriginRestricted = false,
        xhr, status, isIE = /msie/.test(navigator.userAgent.toLowerCase()),
        debugSourceURL = isIE ? "" : ("\n//# sourceURL=" + src);

      if (typeof XMLHttpRequest != 'undefined') {
        xhr = new XMLHttpRequest();
      } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }

      try {
        xhr.open('GET', src, false);
        xhr.send(null);
      } catch (e) {
        isCrossOriginRestricted = true;
      }

      status = (xhr.status === 1223) ? 204 : (xhr.status === 0 && ((self.location || {}).protocol === 'file:' || (self.location || {}).protocol === 'ionp:')) ? 200 : xhr.status;

      isCrossOriginRestricted = isCrossOriginRestricted || (status === 0);

      if (isCrossOriginRestricted) {
        onLoad(url, false);
      } else if ((status >= 200 && status < 300) || (status === 304)) {

        //eval(xhr.responseText + debugSourceURL);
        new Function(xhr.responseText + debugSourceURL)();

        onLoad(url, true);
      } else {
        onLoad(url, false);
      }
      xhr = null;
    };

    var url = scriptUrl;

    // 1.判断内存中是否存在
    var u = url.split("."),
      ref = window;
    for (var j = 0, len = u.length; j < len; j++) {
      if (ref) {
        ref = ref[u[j]];
      } else {
        break;
      }
    }
    if (ref && !ref.equals(window)) {
      return;
    }

    // 2.判断当前ClassLoader是否加载过。
    if (loadedScripts[url]) {
      checkLoaded(url, true);
      return;
    }

    var waitingInfo = waitingList[url] || (waitingList[url] = []);
    waitingInfo.push(checkLoaded);

    // 3.Load it only for the first request.
    if (waitingInfo.length > 1) {
      return;
    }

    var classes = this.findClass(url, notModify);

    if (synchronous) {
      loadScript(url, classes[url]);
    } else {
      synchronousScript(url, classes[url]);
    }

    // 4.委托父加载器加载

  }
});


window.$import = function(name, classloader, async, callback) {
  if (Object.isNull(classloader)) {
    classloader = js.lang.ClassLoader.getSystemClassLoader();
  } else if (!Object.isInstanceof(classloader, js.lang.ClassLoader)) {
    switch (classloader) {
      case 'BootstrapClassLoader':
        classloader = atom.misc.Launcher.BootstrapClassLoader.getBootstrapClassLoader();
        break;
      case 'ExtClassLoader':
        classloader = atom.misc.Launcher.ExtClassLoader.getExtClassLoader();
        break;
      case 'CSSClassLoader':
        classloader = atom.misc.Launcher.CSSClassLoader.getCSSClassLoader();
        break;
      default:
        classloader = js.lang.ClassLoader.getSystemClassLoader();
        break;
    }
  }
  // 1判断内存中是否存在 ， 2判断当前ClassLoader是否加载过。classloader.getDebug()
  return classloader.loadClass(name, async, false, callback);
};


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

