$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.component.IAjax");

Class.forName({
  name: "absolute class com.ctrip.tars.base.Service extends Object",

  Service: function() {},

  "private loading": false,

  "private data": {},

  clear: function() {
    this.data = {};
    this.update();
  },

  getData: function() {
    return this.data;
  },

  reset: function() {
    this.loading = false;
  },
  isLoading: function() {
    return this.loading;
  },

  "protected absolute validate": function() {},

  "protected absolute getUrl": function(path) {},

  "protected absolute parse": function(data, params, mode) {},

  "protected loadData": function(url, filters, sorters, pages, callback, mode, exception) {

    var scope = this;

    //if (scope.isLoading()) {
    //  return;
    //}

    scope.loading = true;

    if (!url) {
      if (!Object.isNull(mode) && mode <= 0) {
        scope.clear();
      }

      scope.loading = false;
      if (!Object.isNull(callback) && Object.isFunction(callback)) {
        callback.call(scope, {});
      }
      return;
    }

    var queryString = {},
      servletPath = url,
      indexOf = url.indexOf("?");

    if (indexOf != -1) {
      servletPath = url.substring(0, indexOf);
      var qs = decodeURIComponent(url.substring(indexOf + 1)).split("&"),
        qsv = null;
      for (var i = 0, len = qs.length; i < len; i++) {
        if (qs[i] && !"".equals(qs[i].trim())) {
          qsv = qs[i].split("=");
          if (qsv.length == 1) {
            queryString[qsv[0]] = true;
          } else if (qsv.length >= 2) {
            queryString[qsv[0]] = qsv[1];
          }
        }
      }
    }

    var params = $.extend(true, queryString, filters, sorters, pages);
    com.ctrip.tars.component.IAjax.get(servletPath, {
      ignore: true,
      data: params,
      success: function() {
        //validate
        scope.validate(this || {}, params);

        //parse
        scope.parse(this || {}, params, mode);

        scope.loading = false;
        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback.call(scope, this);
        }
      },
      failure: function() {
        scope.loading = false;
        if (!Object.isNull(exception) && Object.isFunction(exception)) {
          exception.call(scope, this);
        }
      },
      exception: function() {
        scope.loading = false;
        if (!Object.isNull(exception) && Object.isFunction(exception)) {
          exception.call(scope, this);
        }
      },
      error: function() {
        scope.loading = false;
        if (!Object.isNull(exception) && Object.isFunction(exception)) {
          exception.call(scope, this);
        }
      }
    });
  },

  "protected update": function(callback) {
    var $rootScope = com.ctrip.tars.util.Angular.getRootScope();
    var d = this.getData();
    if (!Object.isNull(callback) && Object.isFunction(callback)) {
      callback(d);
    }
    $rootScope.$broadcast(this.getClass().getFullName().toLowerCase() + '.update', d);
  }
});

