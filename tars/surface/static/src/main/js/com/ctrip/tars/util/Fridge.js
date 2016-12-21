$import("js.lang.IllegalArgumentException", "BootstrapClassLoader");

Class.forName({
  name: "class com.ctrip.tars.util.Fridge extends Array",

  Fridge: function() {},

  clone: function() {
    var c = this.getClass().newInstance();
    for (var i = 0, len = this.length; i < len; i++) {
      c.push(this[i].clone());
    }
    return c;
  },

  scour: function(array, override, excludes, callback) {
    if (Object.isNull(array) || !Object.isArray(array)) {
      throw new js.lang.IllegalArgumentException("The method named replace only accept a not-null array parameter.");
    }

    var path = new js.util.HashMap();

    var i = 0,
      length = 0,
      key = null;

    for (i = 0, length = array.length; i < length; i++) {
      path.put(override && array[i][override] ? array[i][override] : i, i);
    }


    if (!excludes || !Object.isArray(excludes)) {
      excludes = [];
    }

    for (i = 0, length = this.length; i < length;) {

      var p = override && this[i][override] ? this[i][override] : i;

      if (path.containsKey(p)) {
        var k = path.get(p);
        for (key in array[k]) {
          if (!excludes.contains(key)) {
            if (!Object.isNull(callback) && Object.isFunction(callback)) {
              callback(key, 0, this[i], array[k]);
            }
            this[i][key] = array[k][key];
          }
        }
        path.remove(p);
        i++;
      } else {

        var d = this.splice(i, 1);
        length = this.length;

        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback(d[0], -1);
        }
      }
    }

    if (path.size() > 0) {
      var iter = path.keySet().iterator();
      while (iter.hasNext()) {
        var index = iter.next();
        var m = path.get(index);

        var value = {};

        for (key in array[m]) {
          if (!excludes.contains(key)) {
            value[key] = array[m][key];
          }
        }

        this.splice(m, 0, value);

        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback(value, 1);
        }
      }
    }
  },

  replace: function(array, override, excludes) {
    this.clear();
    this.append(array);
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

  toArray: function() {
    return this.slice(0);
  }
});

