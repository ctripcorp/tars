$import("com.ctrip.tars.base.DefaultService");

Class.forName({
  name: "class com.ctrip.tars.deployment.Service extends com.ctrip.tars.base.DefaultService",
  Service: function() {
    var targetSteps = new js.util.HashMap();
    targetSteps.put("PENDING", 0);

    targetSteps.put("DISABLING", 1);
    targetSteps.put("DISABLE_FAILURE", 2);
    targetSteps.put("DISABLE_SUCCESS", 3);

    targetSteps.put("DOWNLOADING", 4);
    targetSteps.put("DOWNLOAD_FAILURE", 5);
    targetSteps.put("DOWNLOAD_SUCCESS", 6);

    targetSteps.put("INSTALLING", 7);
    targetSteps.put("INSTALL_FAILURE", 8);
    targetSteps.put("INSTALL_SUCCESS", 9);

    targetSteps.put("VERIFYING", 10);
    targetSteps.put("VERIFY_FAILURE", 11);
    targetSteps.put("VERIFY_SUCCESS", 12);

    targetSteps.put("ENABLING", 13);
    targetSteps.put("ENABLE_FAILURE", 14);
    targetSteps.put("ENABLE_SUCCESS", 15);

    targetSteps.put("FAILURE", 16);
    //targetSteps.put("REVOKED", 0);
    targetSteps.put("SUCCESS", 17);

    this.targetSteps = targetSteps;
  },
  validate: function(data, params) {
    if (data.category === "scaleout") {
      data.flavor = data.category;
    }
  },
  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.deployment)) {
      return null;
    }
    return [BASE_URL, "deployments/", path.deployment].join("");
  },
  getLastSuccessConfig: function(path, callback, exception) {
    if (!com.ctrip.tars.util.Id.isValid(path.group)) {
      return null;
    }

    var url = [BASE_URL, "groups/", path.group, "/deployments?last_success=True"].join("");

    this.loadData(url, null, null, null, function(result) {
      if (Object.isFunction(callback)) {
        callback(result);
      }
    }, com.ctrip.tars.base.DefaultService.ISOLATE, exception);
  },
  getSummary: function(path, callback, exception) {
    if (!com.ctrip.tars.util.Id.isValid(path.deployment)) {
      return null;
    }

    var url = [BASE_URL, "deployments/", path.deployment, "/summary"].join("");

    var targetSteps = this.targetSteps;

    this.loadData(url, null, null, null, function(result) {

      var groups = result.groups || [];

      var doneTargetSteps = 0,
        allServers = 0;

      var vip = {
        id: result.id,
        type: "deployment",
        data: [],
        children: [],
        groups: groups
      };

      for (var i = 0, len = groups.length; i < len; i++) {

        var group = groups[i];

        var groupJson = {
          id: group.id,
          type: "group",
          data: [group.healthCheckUrl]

        };

        var bastion = {
            summary: {},
            status: null,
            enabled: false,
            statusDetail: '',
            batches: 0,
            failure: 0,
            servers: 0,
            success: 0,
            revoked: 0
          },
          pending = {
            batches: 0,
            failure: 0,
            servers: 0
          },
          deploying = {
            batches: 0,
            failure: 0,
            servers: 0,
            success: 0,
            revoked: 0,
            index: 0
          },
          executed = {
            batches: 0,
            failure: 0,
            servers: 0,
            success: 0,
            revoked: 0
          };

        var batches = group.batches || [];
        for (var j = 0, length = batches.length; j < length; j++) {
          var batch = batches[j];

          var servers = 0;
          for (var m in batch.summary) {
            servers += batch.summary[m];
            doneTargetSteps += (batch.summary[m] * targetSteps.get(m)) || 0;
          }
          allServers += servers;

          if (batch.fortBatch) {


            if (bastion.servers === 0) {
              bastion.summary = {
                hostname: group.fort ? group.fort.hostname : "",
                ipAddress: group.fort ? group.fort.ipAddress : ""
              };
              for (var n in batch.summary) {
                bastion.statusDetail = n;
              }
            } else {
              bastion.summary = {};
              bastion.statusDetail = '';
            }

            bastion.batches++;
            bastion.servers += servers;

            bastion.status = batch.status == 'PENDING' ? 'todo' : batch.status == 'DEPLOYING' ? 'doing' : 'done';

            if (batch.summary.PENDING || batch.summary.SUCCESS || batch.summary.ENABLE_SUCCESS > 0) {
              bastion.enabled = true;
            }

            bastion.failure += (batch.summary.DISABLE_FAILURE || 0) + (batch.summary.DOWNLOAD_FAILURE || 0) + (batch.summary.INSTALL_FAILURE || 0) + (batch.summary.VERIFY_FAILURE || 0) + (batch.summary.ENABLE_FAILURE || 0) + (batch.summary.FAILURE || 0);
            bastion.success += batch.summary.SUCCESS || 0;
            bastion.revoked += batch.summary.REVOKED || 0;
          }

          switch (batch.status) {
            case "PENDING":
              pending.batches++;
              pending.servers += servers;
              break;
            case "DEPLOYING":
              deploying.batches++;
              deploying.servers += servers;
              deploying.failure += (batch.summary.DISABLE_FAILURE || 0) + (batch.summary.DOWNLOAD_FAILURE || 0) + (batch.summary.INSTALL_FAILURE || 0) + (batch.summary.VERIFY_FAILURE || 0) + (batch.summary.ENABLE_FAILURE || 0) + (batch.summary.FAILURE || 0);
              deploying.success += batch.summary.SUCCESS || 0;
              deploying.revoked += batch.summary.REVOKED || 0;
              deploying.index = batch.index;
              break;
            case "SUCCESS":
            case "FAILURE":
            default:
              executed.batches++;
              executed.servers += servers;
              executed.failure += (batch.summary.DISABLE_FAILURE || 0) + (batch.summary.DOWNLOAD_FAILURE || 0) + (batch.summary.INSTALL_FAILURE || 0) + (batch.summary.VERIFY_FAILURE || 0) + (batch.summary.ENABLE_FAILURE || 0) + (batch.summary.FAILURE || 0);
              executed.success += batch.summary.SUCCESS || 0;
              executed.revoked += batch.summary.REVOKED || 0;
              break;
          }
        }

        var _servers = allServers;
        var _pending = pending.servers;
        var _deploying = deploying.servers;
        var _failure = deploying.failure + executed.failure;
        var _success = deploying.success + executed.success;
        var _revoked = deploying.revoked + executed.revoked;

        groupJson.servers = _servers;
        groupJson.pending = _pending;
        groupJson.deploying = _deploying;
        groupJson.failure = _failure;
        groupJson.success = _success;
        groupJson.revoked = _revoked;

        groupJson.batches = [bastion.batches, "批次堡垒（", bastion.servers, "台）  +    ", (batches.length - bastion.batches), '批次'].join("");

        vip.children.push(groupJson);
      }

      var allTargetSteps = allServers * (targetSteps.size() - 1);
      vip.percent = doneTargetSteps / allTargetSteps;

      if (Object.isFunction(callback)) {
        callback(vip);
      }
    }, com.ctrip.tars.base.DefaultService.ISOLATE, exception);
  }
});

Class.forName({
  name: "class com.ctrip.tars.group.Service extends com.ctrip.tars.base.DefaultService",
  Service: function() {},

  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.group)) {
      return null;
    }
    return [BASE_URL, "groups/", path.group].join("");
  }
});

Class.forName({
  name: "class com.ctrip.tars.app.Service extends com.ctrip.tars.base.DefaultService",
  Service: function() {},

  "private data": {
    groups: new js.util.HashMap()
  },

  clear: function() {
    this.data = {
      groups: new js.util.HashMap()
    };
  },

  "protected absolute parse": function(data, params, mode) {
    if (mode !== com.ctrip.tars.base.DefaultService.ISOLATE) {
      var result = data || {};

      var groups = result.groups || [],
        gm = new js.util.HashMap();

      for (var i = 0, len = groups.length; i < len; i++) {
        group = groups[i];
        gm.put(group.id, group);
      }

      result.groups = gm;

      this.data = result;
    }
  },

  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.app)) {
      return null;
    }
    return [BASE_URL, "applications/", path.app].join("");
  }
});

Class.forName({
  name: "class com.ctrip.tars.batch.Service extends com.ctrip.tars.base.DefaultService",
  Service: function() {},

  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.group)) {
      return null;
    }
    return [BASE_URL, "groups/", path.group, "/preview_batches"].join("");
  }
});

var group = angular.module("com.ctrip.tars.group", [])
  .service('com.ctrip.tars.group.Service', com.ctrip.tars.group.Service)
  .service('com.ctrip.tars.deployment.Service', com.ctrip.tars.deployment.Service)
  .service('com.ctrip.tars.app.Service', com.ctrip.tars.app.Service)
  .service('com.ctrip.tars.batch.Service', com.ctrip.tars.batch.Service);

