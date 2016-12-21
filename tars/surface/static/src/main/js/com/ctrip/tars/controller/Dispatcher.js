/**
 * Menu select controller
 */
tarsPortal.controller("com.ctrip.tars.dispatcher.Controller", ['$scope', '$rootScope', '$timeout', '$interval', '$location', 'com.ctrip.tars.security.Service',
  function($scope, $rootScope, $timeout, $interval, $location, service) {

    var refers = {
      params: {},
      path: null
    };
    $scope.$on("$locationChangeStart", function(e, url, refer) {
      $scope.filter(e, url, refer);
      //if ($.licoMsgbox.isMasking() || $.licoDialog.isMasking()) {
      //  e.preventDefault();
      //  window.loading.hide();
      //}
      return false;
    });
    $scope.$on("$locationChangeSuccess", function(e, url, refer) {
      /*
      var refers = {};
      try {
        var search = decodeURIComponent(refer),
          i = search.indexOf('?');
        if (i !== -1) {
          search = search.substring(i + 1);
          var searches = search.split("&"),
            index = -1,
            key = null,
            value = null;

          for (var kv in searches) {
            kv = searches[kv];
            len = kv.length;
            index = kv.indexOf("=");

            if (index < len - 1 && index > 0) {
              key = kv.substring(0, index);
              value = kv.substring(index + 1, len);
              refers[key] = value;
            } else if (index === -1) {
              key = kv;
              refers[key] = true;
            } else if (index === len - 1) {
              key = kv.substring(0, len - 1);
              refers[key] = true;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
      */
      var params = $scope.getURLParams();
      var path = $scope.getPath();

      if (path !== refers.path) {
        $rootScope.$broadcast('curr.url.change', path, refers.path);
        refers.params = {};
        refers.path = path;

        if (refers.path === null) {
          $rootScope.$broadcast('curr.url.params.change', params, refers.params);
          refers.params = params;
        }
      } else {
        /*
        var flag = false;
        angular.forEach(params, function(value, key) {
          if (this[key] != value) {
            flag = true;
          }
        }, refers.params);
        if (flag) {
          $rootScope.$broadcast('curr.url.params.change', params, refers.params);
        }
        refers.params = params;
        */
        $rootScope.$broadcast('curr.url.params.change', params, refers.params);
        refers.params = params;
      }
    });

    $scope.$on("$routeChangeStart", function(e) {
      window.loading.show({
        desc: "正在定位，请稍后"
      });
      return false;
    });
    $scope.$on("$routeChangeSuccess", function(e) {
      $timeout(function() {
        window.loading.hide();
        $scope.welcome();
      }, 1000, false, null);
      return false;
    });

    $scope.getQueryString = function() {
      return $.param(this.getURLParams());
    };

    $scope.getURLParams = function() {
      return $location.search();
    };
    /*
    $scope.forceSearch = (function() {
      var $promise = null,
        params = {},
        execute = function() {
          var flag = false,
            urlParams = $scope.getURLParams(),
            destParams = angular.extend(urlParams, params);

          $location.search(destParams);

          urlParams = $scope.getURLParams();
          angular.forEach(params, function(value, key) {
            if (urlParams[key] != value) {
              flag = true;
            }
          });

          if (!flag && $promise) {
            $interval.cancel($promise);
          }
        };

      return function(p) {
        params = angular.extend(params, p);
        execute();
        if (!$promise || $promise.$$state.status > 0) {
          $promise = $interval(execute, 250, 0, false);
        }
      };
    })();
    */

    $scope.forceSearch = function(params) {
      $location.search(angular.extend($scope.getURLParams(), params));
    };

    $scope.getPath = function() {
      return $location.path();
    };

    $scope.setBreadcrumb = function(crumb) {
      $scope.breadcrumb = crumb;
    };
    $scope.$on('security.user.logout', function(e) {
      service.user.remove();
      $scope.user = service.user;

      $location.path("");

      // document.location.href = path;

      return false;
    });

    $scope.logout = function() {
      $rootScope.$broadcast('security.user.logout');
    };

    $scope.welcome = function() {
      var runtime = com.ctrip.tars.model.Runtime.getInstance();
      var path = $scope.getPath();
      runtime.setPath(path);

      if (runtime.isWelcome()) {
        $scope.$root.$broadcast("welcome");
      }
    };

    $scope.filter = function(e, url, refer) {
      if (!service.isLogin()) {
        // e.preventDefault();
        $rootScope.$broadcast('security.user.logout');
      } else {
        service.user.load();

        $scope.user = service.user;

        if (url.indexOf("#") == -1) {
          $location.path("/view/index");
        } else {
          $location.path(url.substring(url.indexOf("#") + 1, url.indexOf("?") == -1 ? url.length : url.indexOf("?")));
        }

      }
    };
  }
]);

