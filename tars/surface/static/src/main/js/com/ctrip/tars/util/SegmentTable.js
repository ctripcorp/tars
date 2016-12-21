$import("js.util.HashMap", "BootstrapClassLoader");
$import("js.util.HashSet", "BootstrapClassLoader");
Class.forName({
  name: "class com.ctrip.tars.util.SegmentTable extends Object",

  "private table": [],

  "@Getter public protectedAttributes": new js.util.HashSet(),

  "@Setter @Getter public protectedAttributesParser": null,

  clone: function() {
    var c = this.getClass().newInstance();
    c.table = this.table.clone();
    c.protectedAttributes = this.protectedAttributes.clone();
    return c;
  },

  isEmpty: function() {
    return this.size() <= 0;
  },

  size: function() {
    var length = 0;
    for (var i = 0, len = this.table.length; i < len; i++) {
      length += this.table[i].size();
    }
    return length;
  },

  containsKey: function(key) {
    var exist = false;
    for (var i = 0, len = this.table.length; i < len && !exist; i++) {
      exist = this.table[i].containsKey(key);
    }
    return exist;
  },

  each: function(callback) {
    var iter = null,
      key = null,
      value = null,
      segment = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      segment = this.table[i];
      if (segment) {
        iter = segment.keySet().iterator();
        while (iter.hasNext()) {
          key = iter.next();
          value = segment.get(key);

          callback.call(this, key, value, segment, i);
        }
      }
    }
  },

  clear: function() {
    this.table.clear();
  },

  setIdentical: function(key, attr, value) {
    var iter = null,
      name = null,
      ele = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      var segment = this.table[i];
      if (segment) {
        if (value) {
          iter = segment.keySet().iterator();
          while (iter.hasNext()) {
            name = iter.next();
            ele = segment.get(name);
            if (ele) {
              ele[attr] = name === key;
            }
          }
        } else {
          ele = segment.get(key);
          if (ele) {
            ele[attr] = false;
            break;
          }
        }
      }
    }
    this.protectedAttributes.add(attr);
  },

  setFirstIdentical: function(attr, value) {
    var iter = null,
      name = null,
      ele = null,
      flag = false;
    for (var i = 0, len = this.table.length; i < len; i++) {
      var segment = this.table[i];
      if (segment) {
        iter = segment.keySet().iterator();
        while (iter.hasNext()) {
          name = iter.next();
          ele = segment.get(name);
          if (ele) {
            ele[attr] = !flag ? value : false;
            flag = true;
            if (!value) {
              return;
            }
          }
        }
      }
    }
    this.protectedAttributes.add(attr);
  },

  setLastIdentical: function(attr, value) {
    var iter = null,
      name = null,
      ele = null,
      last = null,
      flag = false;
    for (var len = this.table.length, i = len - 1; i >= 0; i--) {
      var segment = this.table[i];
      if (segment) {
        iter = segment.keySet().iterator();
        while (iter.hasNext()) {
          name = iter.next();
          ele = segment.get(name);
          if (ele) {
            last = ele;
            if (value) {
              ele[attr] = false;
            }
          }
        }
        if (!flag && last) {
          last[attr] = value;
          flag = true;
        }
      }
    }
    this.protectedAttributes.add(attr);
  },

  getFirst: function() {
    var segment = null,
      ele = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      segment = this.table[i];
      if (segment) {
        var iter = segment.keySet().iterator();
        while (iter.hasNext()) {
          ele = segment.get(iter.next());
          if (ele) {
            return ele;
          }
        }
      }
    }
    return null;
  },

  setFirst: function(attr, value) {
    var ele = this.getFirst();
    if (ele) {
      ele[attr] = value;
    }
    this.protectedAttributes.add(attr);
  },

  getLast: function() {
    var iter = null,
      ele = null,
      key = null;
    for (var len = this.table.length, i = len - 1; i >= 0; i--) {
      var segment = this.table[i];
      if (segment) {
        iter = segment.keySet().iterator();
        while (iter.hasNext()) {
          key = iter.next();

          ele = segment.get(key);
          if (ele) {
            last = ele;
          }
        }
        if (last) {
          return last;
        }
      }
    }
    return null;
  },

  setLast: function(attr, value) {
    var ele = this.getLast();
    if (ele) {
      ele[attr] = value;
    }
    this.protectedAttributes.add(attr);
  },

  getSegment: function(serial) {
    if (serial >= 0 && serial < this.table.length) {
      return this.table[serial];
    }
    return null;
  },

  getSerialByValue: function(value) {
    if (!value && !Object.isNull(value.$$serial)) {
      return value.$$serial;
    }

    var segment = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      segment = this.table[i];
      if (segment && segment.containsValue(value)) {
        return i;
      }
    }
    return -1;
  },

  getSerial: function(key) {
    var segment = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      segment = this.table[i];
      if (segment && segment.containsKey(key)) {
        return i;
      }
    }
    return -1;
  },

  get: function(key) {
    var segment = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      segment = this.table[i];
      if (segment && segment.containsKey(key)) {
        return segment.get(key);
      }
    }
    return null;
  },

  set: function(key, attr, value) {
    var segment = null,
      ele = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      segment = this.table[i];
      if (segment && segment.containsKey(key)) {
        ele = segment.get(key);
        if (ele) {
          ele[attr] = value;
        }
        break;
      }
    }
    this.protectedAttributes.add(attr);
  },

  put: function(key, value) {
    var length = this.table.length;
    if (length <= 0) {
      this.table.push(new js.util.HashMap());
      length = 1;
    }
    var segment = null,
      attr = null,
      ele = null,
      iter = null;
    for (var i = 0; i < length; i++) {
      segment = this.table[i];

      if (segment.containsKey(key) && value) {

        ele = segment.get(key);
        iter = this.protectedAttributes.iterator();

        if (ele) {
          while (iter.hasNext()) {
            attr = iter.next();
            value[attr] = ele[attr];
          }
        }

        segment.put(key, value);
        break;
      } else if (i === length - 1) {
        segment.put(key, value);
      }
    }
  },

  remove: function(key) {
    var segment = null;
    for (var i = 0, len = this.table.length; i < len; i++) {
      segment = this.table[i];
      if (segment && segment.containsKey(key)) {
        return segment.remove(key);
      }
    }
  },

  update: function(serial, data) {
    if (Object.isNull(data) || !Object.isArray(data)) {
      throw new js.lang.IllegalArgumentException("The method named update only accept a not-null array parameter.");
    }
    var segment = this.table[serial];

    var i = 0,
      len = 0;

    if (segment) {

      var dest = new js.util.HashMap();

      for (i = 0, len = data.length; i < len; i++) {
        data[i].$$index = i;
        data[i].$$serial = serial;
        dest.put(data[i].id || i, data[i]);
      }

      var iter = segment.keySet().iterator(),
        iterator = null,
        key = null,
        value = null,
        attr = null,
        ele = null,
        parser = this.getProtectedAttributesParser();
      while (iter.hasNext()) {
        key = iter.next();
        value = segment.get(key);

        if (dest.containsKey(key)) {
          ele = dest.get(key);

          if (value) {
            iterator = this.protectedAttributes.iterator();
            while (iterator.hasNext()) {
              attr = iterator.next();
              ele[attr] = parser && Object.isFunction(parser) ? parser(ele[attr], value[attr], attr) : value[attr];
            }
          }

          segment.put(key, ele);
          dest.remove(key);
        } else {
          // segment.remove(key);
          iter.remove();
        }
      }

      if (dest.size() > 0) {
        iter = dest.keySet().iterator();
        while (iter.hasNext()) {
          key = iter.next();
          ele = dest.get(key);

          // 判断其他段中是否含有此key，确保不重复
          if (this.containsKey(key)) {
            value = this.remove(key);

            if (value) {
              iterator = this.protectedAttributes.iterator();
              while (iterator.hasNext()) {
                attr = iterator.next();
                ele[attr] = value[attr];
              }
            }
          }

          segment.put(key, ele);
        }
        dest.clear();
      }
    } else {
      segment = new js.util.HashMap();

      for (i = 0, len = data.length; i < len; i++) {
        segment.put(data[i].id || i, data[i]);
      }

      this.table.push(segment);
    }

    return this;
  },

  toArray: function(predicate, reverse) {
    var segments = [],
      segment = null;
    for (var i = 0, length = this.table.length; i < length; i++) {
      segment = this.table[i];
      if (segment && segment.size() > 0) {
        if (predicate && Object.isString(predicate)) {
          var itr = segment.values().iterator(),
            value = null,
            isIndex = predicate === "$$index",
            serial = null,
            index = null,
            attr = null;
          while (itr.hasNext()) {
            value = itr.next();
            serial = value["$$serial"];
            index = value["$$index"];
            attr = value[predicate];

            if (segments.length === 0) {
              segments.push(value);
              continue;
            }

            if (Object.isNull(value)) {
              if (reverse) {
                segments.unshift(value);
              } else {
                segments.push(value);
              }
              continue;
            }
            var ele = null,
              eleSerial = null,
              eleIndex = null,
              eleAttr = null;
            for (var j = 0, len = segments.length; j < len; j++) {
              ele = segments[j];
              eleSerial = ele["$$serial"];
              eleIndex = ele["$$index"];
              eleAttr = ele[predicate];
              if (reverse) {
                if (!ele ||

                  (isIndex &&
                    serial >= eleSerial &&
                    index >= eleIndex) ||

                  (!isIndex && attr >= eleAttr)) {

                  segments.splice(j, 0, value);
                  break;
                } else if (j == len - 1) {
                  segments.push(value);
                }
              } else {
                if (!ele ||
                  (isIndex &&
                    serial <= eleSerial &&
                    index <= eleIndex) ||

                  (!isIndex && attr <= eleAttr)) {

                  segments.splice(j, 0, value);
                  break;
                } else if (j == len - 1) {
                  segments.push(value);
                }
              }
            }
          }
        } else {
          segments.append(segment.values().toArray());
        }
      }
    }
    return segments;
  }
});

