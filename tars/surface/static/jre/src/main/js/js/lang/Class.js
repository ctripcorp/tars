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

