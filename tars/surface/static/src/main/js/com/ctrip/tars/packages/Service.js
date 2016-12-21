$import("com.ctrip.tars.base.SegmentService");

var PACKAGE_PAGE_SIZE = 5;

Class.forName({
  name: "class com.ctrip.tars.packages.Service extends com.ctrip.tars.base.SegmentService",

  "@Setter @Getter private pageSize": PACKAGE_PAGE_SIZE,

  Service: function() {
    this.getData().getProtectedAttributes().add("active");
  },

  "setGroupValidator": function(groupValidator) {
    this.groupValidator = groupValidator;
  },

  validate: function(data, params) {
    var results = data.results || [];
    for (var i = 0, len = results.length; i < len; i++) {
      var builder = results[i];

      if (Object.isNull(builder.status)) {
        builder.status = 'SUCCESS';
      }

      //TODO 属性验证
      builder.success = true;
      builder.failure = false;
      builder.pending = false;
      builder.packing = false;
      builder.error = false;
      builder.connect_error = false;
      builder.image_error = false;
      builder.imaging = false;

      builder.repackStatus = 'disabled';
      builder.availableStatus = '';

      builder.statusSymbol = '✓';
      builder.statusClass = 'success';
      builder.statusText = "整理成功";
    }
  },
  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.app)) {
      return null;
    }

    return [BASE_URL, "applications/", path.app, "/packages"].join("");
  },

  first: function(path, filter, sorter, callback) {
    this.$super.first.call(this, path, filter, sorter, callback);
  },

  refresh: function(path, filter, sorter, callback) {
    this.$super.refresh.call(this, path, filter, sorter, callback);

  },

  save: function(package, success) {
    com.ctrip.tars.component.IAjax.post([BASE_URL, 'packages'].join(""), {
      data: package,
      success: success
    });
  },

  remove: function(id, success) {
    com.ctrip.tars.component.IAjax.ajax([BASE_URL, 'packages/', id].join(""), {
      method: 'DELETE',
      success: success
    });
  }
});

var histories = angular
  .module("com.ctrip.tars.packages", [])
  .service('com.ctrip.tars.packages.Service', com.ctrip.tars.packages.Service);

