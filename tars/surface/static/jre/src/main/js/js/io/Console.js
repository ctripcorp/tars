/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 * 
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 * 
 * Date: Feb 14, 2014
 */

$import("js.io.PrintWriter", "BootstrapClassLoader");

Class
  .forName({
    name: "class js.io.Console extends js.io.PrintWriter",
    Console: function(writer) {
      if (writer && writer.log && typeof writer.log != 'function') {
        this._ie = true;
      }
      this._writer = writer;
    },
    "private unsupport": function() {
      var msg = null;
      if (arguments.length <= 0) {
        msg = "Your browser console don\'t support the output instruction. Please check your browser version:\"" + js.lang.System.getEnv("userAgent") + "\"";
      } else {
        msg = Array.prototype.slice.call(arguments).join(' ; ');
      }
      alert(msg);
    },
    print: function(buf, off, len, ln) {
      var cbuf = buf;
      if (!Object.isEmpty(cbuf)) {
        if (!Object.isString(cbuf) && !Object.isArray(cbuf)) {
          cbuf = cbuf.toString();
        }
        var str = null;
        if (!off || off < 0)
          off = 0;
        if (!len) {
          len = cbuf.length - off;
        } else if (off + len > cbuf.length)
          len = cbuf.length - off;

        if (Object.isString(cbuf)) {
          str = cbuf.substring(off, len + off);
        } else {
          str = cbuf.slice(off, len + off);
        }
        this.log("%s", ln ? str + "\n" : str);

      }
    },
    /** 判断一个表达式或变量是否为真。如果结果为否，则在控制台输出一条相应信息，并且抛出一个异常 */
    assert: function() {
      return (this._writer.assert || this.unsupport).apply(
        this._writer, arguments);
    },

    /**
     * 打印日志信息，支持printf风格的占位符。只支持字符（%s）、整数（%d或%i）、浮点数（%f）和对象（%o）四种。 比如，
     * log("%d年%d月%d日",2011,3,26); log("圆周率是%f",3.1415926);
     */
    log: function() {

      if (this._ie && this._writer.log) {
        if (arguments.length === 1) {
          this._writer.log(arguments[0]);
        } else if (arguments.length > 1) {
          this._writer.log(arguments[0], arguments[1]);
        }
        return;
      }

      return (this._writer.log || this.unsupport).apply(this._writer,
        arguments);

    },

    /**
     * 打印一般信息，支持printf风格的占位符。
     */
    info: function() {

      if (this._ie && this._writer.info) {
        if (arguments.length === 1) {
          this._writer.info(arguments[0]);
        } else if (arguments.length > 1) {
          this._writer.info(arguments[0], arguments[1]);
        }
        return;
      }

      return (this._writer.info || this.unsupport).apply(
        this._writer, arguments);
    },

    /**
     * 打印警告提示，支持printf风格的占位符。
     */
    warn: function() {

      if (this._ie && this._writer.warn) {
        if (arguments.length === 1) {
          this._writer.warn(arguments[0]);
        } else if (arguments.length > 1) {
          this._writer.warn(arguments[0], arguments[1]);
        }
        return;
      }

      return (this._writer.warn || this.unsupport).apply(
        this._writer, arguments);
    },

    /**
     * 打印误提示，支持printf风格的占位符。
     */
    error: function() {

      if (this._ie && this._writer.error) {
        if (arguments.length === 1) {
          this._writer.error(arguments[0]);
        } else if (arguments.length > 1) {
          this._writer.error(arguments[0], arguments[1]);
        }
        return;
      }

      return (this._writer.error || this.unsupport).apply(
        this._writer, arguments);
    },

    /**
     * 可以显示一个对象所有的属性和方法。
     */
    dir: function() {
      return (this._writer.dir || this.unsupport).apply(this._writer,
        arguments);
    },

    /**
     * profile()和profileEnd()，用来显示代码的性能分析。
     * 
     * profile("性能分析器一"); ----待检测的代码---- profileEnd();
     */
    profile: function() {
      return (this._writer.profile || this.unsupport).apply(
        this._writer, arguments);
    },

    profileEnd: function() {
      return (this._writer.profileEnd || this.unsupport).apply(
        this._writer, arguments);
    },

    /** ie9,firfox */
    clear: function() {
      if (this._ie && this._writer.clear) {
        return this._writer.clear();
      }
      return (this._writer.clear || this.unsupport).apply(
        this._writer, arguments);
    },

    /**
     * 用来追踪函数的调用轨迹。
     * 
     * 
     * 比如，有一个加法器函数。
     * 
     * <pre>
     * function add(a, b) {
     * 	return a + b;
     * }
     * </pre>
     * 
     * 如果想知道这个函数是如何被调用的，在其中加入console.trace()方法就可以了。
     * 
     * <pre>
     * function add(a, b) {
     * 	console.trace();
     * 	return a + b;
     * }
     * </pre>
     * 
     * 假定这个函数的调用代码如下：
     * 
     * <pre>
     * var x = add3(1, 1);
     * function add3(a, b) {
     * 	return add2(a, b);
     * }
     * function add2(a, b) {
     * 	return add1(a, b);
     * }
     * function add1(a, b) {
     * 	return add(a, b);
     * }
     * </pre>
     * 
     * 运行后，会显示add()的调用轨迹，从上到下依次为add()、add1()、add2()、add3()。
     * 
     */
    trace: function() {
      return (this._writer.trace || this.unsupport).apply(
        this._writer, arguments);
    },
    /**
     * 打印调试信息，支持printf风格的占位符。
     */
    debug: function() {
      return (this._writer.debug || this.unsupport).apply(
        this._writer, arguments);
    },

    /**
     * 用来显示网页的某个节点（node）所包含的html/xml代码。比如，先获取一个表格节点，然后，显示该节点包含的代码。
     * dirxml(document.getElementById("ID"));
     */
    dirxml: function() {
      return (this._writer.dirxml || this.unsupport).apply(
        this._writer, arguments);
    },

    /**
     * 如果信息太多，可以分组显示，用到的方法是console.group()和console.groupEnd()。
     */
    group: function() {
      if (this._ie) {
        return this.println(arguments[0] || "***************start*****************");
      }
      return (this._writer.group || this.unsupport).apply(
        this._writer, arguments);
    },
    groupCollapsed: function() {
      return (this._writer.groupCollapsed || this.unsupport).apply(
        this._writer, arguments);
    },
    /**
     * 如果信息太多，可以分组显示，用到的方法是console.group()和console.groupEnd()。
     */
    groupEnd: function() {
      if (this._ie) {
        return this.println(arguments[0] || "***************end*****************");
      }
      return (this._writer.groupEnd || this.unsupport).apply(
        this._writer, arguments);
    },
    markTimeline: function() {
      return (this._writer.markTimeline || this.unsupport).apply(
        this._writer, arguments);
    },
    /**
     * time()和timeEnd()，用来显示代码的运行时间。
     * 
     * time("计时器一"); ----待检测的代码---- timeEnd("计时器一");
     */
    time: function() {
      return (this._writer.time || this.unsupport).apply(
        this._writer, arguments);
    },
    timeEnd: function() {
      return (this._writer.timeEnd || this.unsupport).apply(
        this._writer, arguments);
    },
    timeStamp: function() {
      return (this._writer.timeStamp || this.unsupport).apply(
        this._writer, arguments);
    },
    count: function() {
      return (this._writer.count || this.unsupport).apply(
        this._writer, arguments);
    }
  });

