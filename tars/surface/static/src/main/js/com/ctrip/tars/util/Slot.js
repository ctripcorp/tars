$import("js.util.Stack", "BootstrapClassLoader");

Class.forName({
  name: "class com.ctrip.tars.util.Slot extends js.util.Stack",

  Slot: function() {},
  push: function(ele) {
    var index = this.search(ele);
    if (index !== -1) {
      if (index === this.length() - 1) {
        return;
      }
      //移动到最顶端
      this._table.splice(index, 1);
    }
    this.$super.push.call(this, ele);
  },

  "set": function(index, element) {
    //不允许重复
    throw new js.lang.UnsupportedOperationException();
  },

  add: function(o) {
    //不允许重复
    throw new js.lang.UnsupportedOperationException();
  },
  addAll: function(c) {
    //不允许重复
    throw new js.lang.UnsupportedOperationException();
  },
  erase: function(ele) {
    var index = this.search(ele);
    if (index === -1) {
      return null;
    }
    return this._table.splice(index, 1);
  }

});

