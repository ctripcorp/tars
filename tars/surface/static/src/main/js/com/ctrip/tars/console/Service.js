$import("com.ctrip.tars.base.PaginationService");

Class.forName({
  name: "class com.ctrip.tars.console.Service extends com.ctrip.tars.base.PaginationService",
  Service: function() {},

  validate: function(data, params) {
    var results = data.results || [];
    for (var i = 0, len = results.length; i < len; i++) {
      var d = results[i];
      d.levelClass = d.logLevel.toLowerCase();
    }
  },

  getUrl: function(path) {
    return [BASE_URL, "logs"].join("");
  },

  update: function(callback, scroll) {
    var $rootScope = com.ctrip.tars.util.Angular.getRootScope();
    var d = this.data.data;
    $rootScope.$broadcast(this.getClass().getFullName().toLowerCase() + '.update', d, scroll);
    if (!Object.isNull(callback) && Object.isFunction(callback)) {
      callback(d, scroll);
    }
  },

  sort: function(sorter) {
    var asc = sorter.sort_order === 'asc';
    if (asc) {
      this.data.data.sort(function(a, b) {
        return (a.logTimestamp > b.logTimestamp) ? 1 : -1;
      });
    } else {
      this.data.data.sort(function(a, b) {
        return (a.logTimestamp < b.logTimestamp) ? 1 : -1;
      });
    }
  },

  get: function(callback) {
    this.data.data.clear();

    if (!Object.isNull(callback) && Object.isFunction(callback)) {
      callback.call(this, []);
    }
  },

  first: function(path, filter, sorter, callback) {
    if (!com.ctrip.tars.util.Id.isValid(filter.deploy_id)) {
      this.get(callback);
      return;
    }

    filter.direction = 'backward';
    filter.timestamp = null;

    this.$super.first.call(this, path, filter, sorter, callback);
  },

  refresh: function(path, filter, sorter, callback) {
    var desc = sorter.sort_order !== 'asc';
    if (desc) {
      this.insert(path, filter, sorter, callback);
    } else {
      this.append(path, filter, sorter, callback);
    }
  },

  insert: function(path, filter, sorter, callback) {
    if (!com.ctrip.tars.util.Id.isValid(filter.deploy_id)) {
      this.get(callback);
      return;
    }

    var desc = sorter.sort_order !== 'asc';

    var pager = {};

    if (desc) {
      filter.direction = 'forward';
      //pager.pageSize = 1000;
    } else {
      filter.direction = 'backward';
      pager.pageSize = this.getPageSize();
      pager.page = 1;
    }

    var length = this.size();
    if (length > 0 && this.data.data[0]) {
      filter.timestamp = this.data.data[0].logTimestamp;
    } else {
      filter.timestamp = null;
      filter.direction = null;
    }

    this.loadData(this.getUrl(path), filter, sorter, pager, function() {
      this.update(callback);
    }, com.ctrip.tars.base.PaginationService.INSERT);
  },

  append: function(path, filter, sorter, callback) {
    if (!com.ctrip.tars.util.Id.isValid(filter.deploy_id)) {
      this.get(callback);
      return;
    }

    var asc = sorter.sort_order === 'asc';

    var pager = {};

    if (asc) {
      filter.direction = 'forward';
      //pager.pageSize = 1000;
    } else {
      filter.direction = 'backward';
      pager.pageSize = this.getPageSize();
      pager.page = 1;
    }

    var length = this.size();
    if (length > 0 && this.data.data[length - 1]) {
      filter.timestamp = this.data.data[length - 1].logTimestamp;
    } else {
      filter.timestamp = null;
      filter.direction = null;
    }

    this.loadData(this.getUrl(path), filter, sorter, pager, function(d) {
      this.update(callback, asc && (d.results && d.results.length > 0));
    }, com.ctrip.tars.base.PaginationService.APPEND);
  }
});

angular
  .module("com.ctrip.tars.console", [])
  .service('com.ctrip.tars.console.Service', com.ctrip.tars.console.Service);

