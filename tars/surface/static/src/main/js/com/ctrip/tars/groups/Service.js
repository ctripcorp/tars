$import("com.ctrip.tars.base.PaginationService");

Class.forName({
  name: "class com.ctrip.tars.groups.Service extends com.ctrip.tars.base.PaginationService",
  Service: function() {},

  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.app)) {
      return null;
    }
    return [BASE_URL, "applications/", path.app, "/groups"].join("");
  }
});


angular
  .module("com.ctrip.tars.groups", [])
  .service('com.ctrip.tars.groups.Service', com.ctrip.tars.groups.Service);

