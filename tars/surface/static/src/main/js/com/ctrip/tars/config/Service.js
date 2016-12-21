$import("com.ctrip.tars.base.DefaultService");

Class.forName({
  name: "class com.ctrip.tars.config.Service extends com.ctrip.tars.base.DefaultService",
  Service: function() {},

  getUrl: function(path) {
    return ["/surface/config/"].join("");
  }
});

var header = angular.module("com.ctrip.tars.config", [])
  .service('com.ctrip.tars.config.Service', com.ctrip.tars.config.Service);

