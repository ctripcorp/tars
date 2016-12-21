$import("com.ctrip.tars.base.SegmentService");

Class.forName({
  name: "class com.ctrip.tars.histories.Service extends com.ctrip.tars.base.SegmentService",
  Service: function() {},
  validate: function(data, params) {
    var results = data.results || [];
    for (var i = 0, len = results.length; i < len; i++) {
      var d = results[i];
      //var random = Math.random();
      //d.status = random < 0.3 ? "FAILURE" : random < 0.6 ? "SUCCESS" : "REVOKED";

      switch (d.status) {
        case "REVOKED":
          d.statusSymbol = "||";
          d.statusClass = "revoked";
          break;
        case "SMOKE_FAILURE":
        case "BAKE_FAILURE":
        case "ROLLOUT_FAILURE":
        case "FAILURE":
          d.statusSymbol = "×";
          d.statusClass = "failure";
          break;
        case "SUCCESS":
          d.statusSymbol = "✓";
          d.statusClass = "success";
          break;
        default:
          d.statusSymbol = "...";
          d.statusClass = "pending";
          break;
      }

      if (d.category === "scaleout") {
        d.flavor = d.category;
      }
    }
  },
  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.app)) {
      return null;
    }

    return [BASE_URL, "applications/", path.app, "/deployments"].join("");
  },
  refresh: (function() {
    var interval = 0;
    return function(path, filters, sorters, callback) {
      var now = new Date().getTime();
      if (now - interval < INTERVAL_TIMER) {
        return;
      }
      interval = now;
      this.loadData(this.getUrl(path), filters, sorters, {
        page_size: this.pageSize,
        page: filters.page
      }, function() {
        this.update(callback);
      }, com.ctrip.tars.base.PaginationService.SCOUR);
    };
  })()
});

var histories = angular
  .module("com.ctrip.tars.histories", [])
  .service('com.ctrip.tars.histories.Service', com.ctrip.tars.histories.Service);

