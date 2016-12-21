$import("com.ctrip.tars.base.DefaultService");

Class.forName({
  name: "class com.ctrip.tars.group.rollback.Service extends com.ctrip.tars.base.DefaultService",
  Service: function() {},

  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.group)) {
      return null;
    }
    return [BASE_URL, "groups/", path.group, "/rollback_deployment"].join("");
  },

  getData: function() {
    if (!this.data.config) {
      this.data.config = {
        batchPattern: '50%',
        pauseTime: 0,
        startupTimeout: 0,
        verifyTimeout: 0,
        ignoreVerifyResult: false,
        restartAppPool: false
      };
    }
    return this.data;
  }
});

angular.module("com.ctrip.tars.group.rollback", [])
  .service('com.ctrip.tars.group.rollback.Service', com.ctrip.tars.group.rollback.Service);

