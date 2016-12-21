Class.forName({
  name: "class com.ctrip.tars.util.Watch extends Object",
  "@Getter private data": null,
  "private listener": null,
  "private attrs": null,
  Watch: function(data, listener, attrs) {
    this.data = data;
    this.listener = listener;

    if (Object.isString(attrs)) {
      this.attrs = [attrs];
    } else if (Object.isArray(attrs)) {
      this.attrs = attrs;
    }
  },

  setData: function(data, force) {
    if (!Object.isFunction(this.listener)) {
      return;
    }

    //var time = new Date().getTime();
    if (force || !com.ctrip.tars.util.Watch.equals(data, this.data)) {
      this.listener(data, this.data);
      this.data = data;
    }
    //time = new Date().getTime() - time;
    //console.log("watch:" + time / 1000);

  },

  "static equals": function(d1, d2) {

    //TODO equals()
    if (d1 === d2) {
      return true;
    }

    if ((d1 && !d2) || (!d1 && d2)) {
      return false;
    }

    if (d1 instanceof Number || d1 instanceof String || d1 instanceof Boolean ||
      d1 instanceof Function || d1 instanceof RegExp || d1 instanceof Error ||
      d1 instanceof EvalError || d1 instanceof RangeError || d1 instanceof ReferenceError ||
      d1 instanceof SyntaxError || d1 instanceof TypeError || d1 instanceof URIError ||
      Object.isNumber(d1) || Object.isString(d1) || Object.isBoolean(d1)) {
      return d1 == d2;
    } else if (d1 instanceof Date) {
      return d2 instanceof Date ? d1.getTime() === d2.getTime() : false;
    } else if (d1 instanceof Array) {
      var length = d1.length;
      if (d2.length !== length) {
        return false;
      }

      for (var i = 0; i < length; i++) {
        var o1 = d1[i];
        var o2 = d2[i];
        if ((!o1 && o2) || (o1 && !o2)) {
          return false;
        }
        if (!com.ctrip.tars.util.Watch.equals(o1, o2)) {
          return false;
        }
      }
    } else {
      if (this.attrs) {
        var attr = null;
        for (var j = 0, len = this.attrs.length; j < len; j++) {
          attr = this.attrs[j];
          if (d1[attr] !== d2[attr]) {
            return false;
          }
        }
      } else {
        for (var p in d1) {
          if (d1.hasOwnProperty(p) && !Object.isFunction(d1[p])) {
            if (!com.ctrip.tars.util.Watch.equals(d1[p], d2[p])) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

});

