$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.util.Fridge");
$import("com.ctrip.tars.util.Id");
$import("com.ctrip.tars.util.Angular");

$import("com.ctrip.tars.groups.Service");

var groups = angular
  .module("com.ctrip.tars.groups")
  .service('com.ctrip.tars.groups.Service', ['$rootScope', '$http', function($rootScope, $http) {
    return new com.ctrip.tars.groups.Service();
  }])
  .controller("com.ctrip.tars.groups.Controller", ['$scope', '$rootScope', '$timeout', 'com.ctrip.tars.groups.Service', function($scope, $rootScope, $timeout, service) {
    $scope.scroller = null;
    $scope.groups = new com.ctrip.tars.util.Fridge();
    $scope.filters = null;

    var refersh = function() {
      var urlParams = $scope.getURLParams(),
        active = null;
      for (var i = $scope.groups.length - 1; i >= 0; i--) {
        if (!active && $scope.groups[i].active) {
          active = $scope.groups[i];
        } else if (active) {
          $scope.groups[i].active = false;
        } else if ($scope.groups[i].id == urlParams.group) {
          $scope.groups[i].active = true;
          active = $scope.groups[i];
        } else if (!active && i === 0) {
          $scope.groups[i].active = true;
          active = $scope.groups[i];
        } else {
          $scope.groups[i].active = false;
        }
      }
    };

    $scope.addQueue = new js.util.ArrayList();
    $scope.rmQueue = new js.util.ArrayList();

    $scope.$on('deployment.app.update', function(event, app) {

      var groups = app.groups.values().toArray();

      if (groups.length <= 0) {
        groups.push({
          id: 0
        });
      }

      $scope.groups.scour(groups, "id", null, function(value, type) {
        if (type > 0) {
          $scope.addQueue.add(value);
        } else if (type < 0) {
          $scope.rmQueue.add(value);
        }
      });

      refersh();

      if (!$scope.$$phase) {
        $scope.$apply();
      }

      $scope.$broadcast('accordion.refersh');
    });

    $scope.$emit('deployment.ready');

    $scope.$on('group.id.change', function(event, data) {
      var index = -1,
        active = 0;
      for (var i = $scope.groups.length - 1; i >= 0; i--) {
        if ($scope.groups[i].id == data.id) {
          index = i;
        }
        if ($scope.groups[i].active) {
          active = i;
        }
      }

      if (index === -1) {
        return;
      }

      if (index !== active) {
        $scope.groups[active].active = false;
        $scope.groups[index].active = true;
      }

      refersh();
      $scope.$broadcast('accordion.refersh');

      //$scope.$broadcast('deployment.group.update', $scope.groups[index]);
    });

    $scope.getIntervalTimerTerminator = function() {
      var scope = angular.element(".com-ctrip-tars-group-Controller").scope();
      return scope && scope.getIntervalTimerTerminator();
    };

    $("#sidebar-toggle").append($(".sidebar .cd-nav-trigger"));

    if ($(window).width() < 768) {
      $scope.layout = {
        height: MAIN_VIEW_POINT * 2
      };
    } else {
      $scope.layout = {
        height: MAIN_VIEW_POINT
      };
    }

  }])

.controller("com.ctrip.tars.groups.group.Controller", ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {

  $scope.$on('dispatcher.interval.timer', function(event, data) {
    $scope.$broadcast('deployment.group.update', $scope.group);
  });

  /*
    $scope.$on('accordion.active', function(event, group) {
      //$location.search(URL_PARAMS.GROUP, group.id).search(URL_PARAMS.DEPLOYMENT, null);
      //$scope.$broadcast('deployment.group.update', $scope.group);
    });
  */
  var urlParams = $scope.getURLParams();
  if ($scope.group.active && urlParams[URL_PARAMS.GROUP] != $scope.group.id) {
    var params = {};
    params[URL_PARAMS.GROUP] = $scope.group.id;
    params[URL_PARAMS.DEPLOYMENT] = null;
    $scope.forceSearch(params);
    //$scope.$broadcast('deployment.group.update', $scope.group);
  }

}]);

