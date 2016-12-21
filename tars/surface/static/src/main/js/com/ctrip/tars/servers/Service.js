$import("com.ctrip.tars.base.SegmentService");
$import("com.ctrip.tars.util.SegmentTable");

Class.forName({
  name: "class com.ctrip.tars.servers.Service extends com.ctrip.tars.base.SegmentService",
  Service: function() {},

  validate: function(data, params) {
    var results = data.results || [];
    for (var i = 0, len = results.length; i < len; i++) {
      var d = results[i];
      if (d.server) {
        var server = d.server;
        delete d.server;
        server.target = d;
        results[i] = server;
      } else {
        d.target = {};
      }

      d = results[i];
      d.hostname = d.hostname || '';
      d.ip = d.ipAddress;
      d.hashcode = com.ctrip.tars.util.Common.stripscript(d.hashCode());
      d.steps = new com.ctrip.tars.model.DeploymentTargetSteps().build(d.target.status, d.target.id);
    }
  },
  getUrl: function(path) {
    if (!Object.isNull(path.group) && !com.ctrip.tars.util.Id.isValid(path.group)) {
      return null;
    }

    if (!Object.isNull(path.deployment) && !com.ctrip.tars.util.Id.isValid(path.deployment)) {
      return null;
    }

    if (!Object.isNull(path.deployment)) {
      return [BASE_URL, "deployments/", path.deployment, "/targets"].join("");
    } else if (!Object.isNull(path.group)) {
      return [BASE_URL, "groups/", path.group, "/servers"].join("");
    }
  }
});

angular
  .module("com.ctrip.tars.servers", [])
  .service('com.ctrip.tars.servers.Service', com.ctrip.tars.servers.Service);

