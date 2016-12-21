$import("com.ctrip.tars.base.Service");

Class.forName({
  name: "class com.ctrip.tars.base.DefaultService extends com.ctrip.tars.base.Service",

  "public static final REPLACE": 0,
  "public static final ISOLATE": 1,

  DefaultService: function() {},

  "protected absolute parse": function(data, params, mode) {
    if (mode !== com.ctrip.tars.base.DefaultService.ISOLATE) {
      this.data = data || result;
    }
  },

  "public load": function(path, filters, callback, exception) {
    this.loadData(this.getUrl(path), filters, null, null, function() {
      this.update(callback);
    }, com.ctrip.tars.base.DefaultService.REPLACE, exception);
  },

  "public get": function(path, filters, callback, exception) {
    this.loadData(this.getUrl(path), filters, null, null, callback, com.ctrip.tars.base.DefaultService.ISOLATE, exception);
  }
});

