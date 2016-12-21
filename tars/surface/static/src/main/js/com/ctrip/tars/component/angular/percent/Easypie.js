//$import("js.lang.System", "BootstrapClassLoader");

var easypie = angular
  .module("com.ctrip.tars.component.angular.percent", ['easypiechart'])
  .service('com.ctrip.tars.component.angular.percent.Service', ['$rootScope', '$http', function($rootScope, $http) {

    var validate = function(d) {
      return d;
    };

    var loadData = function(start, end, callback) {};

    var service = {
      easypie: [],

      update: function(d, callback) {
        $rootScope.$broadcast('easypie.update');
        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback.call(this, d);
        }
      },
      load: function(callback) {
        this.easypie.clear();
        loadData(function(d) {
          service.update(d, callback);
        });
      }
    };
    return service;
  }])
  .controller("com.ctrip.tars.component.angular.percent.Controller", ['$scope', 'com.ctrip.tars.component.angular.percent.Service', function($scope, service) {

    $scope.percent = 0;
    $scope.origin = true;

    $scope.$on('deployment.progress.update', function(event, percent, origin) {
      if (!Object.isNumber(percent)) {
        //percent = 0;
        //js.lang.System.out.println("The deployment's progress was updated by a not number value.");
        return false;
      }
      if (percent > 100) {
        percent = 100;
        //js.lang.System.out.println("The deployment's progress was updated by a value which is bigger than 100.")
      }

      $scope.percent = Math.floor(percent * 100);
      $scope.origin = !!origin;

      if (!$scope.$$phase) {
        $scope.$apply();
      }

      return false;
    });

    $scope.$on("theme.skin.change", function(event, skin) {
      var colors = $scope.getColors();

      $scope.options.barColor = colors.barColor;
      $scope.options.trackColor = colors.trackColor;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });

    var colors = $scope.getColors();

    $scope.options = {
      barColor: colors.barColor,
      trackColor: colors.trackColor,
      scaleLength: 0,
      lineCap: 'round',
      lineWidth: 4,
      size: 96,
      rotate: 0,
      animate: {
        duration: 1000,
        enabled: true
      }
    };
    //$scope.options = { animate:true, barColor:'#E67E22', scaleColor:false, lineWidth:3, lineCap:'butt' };
  }]);

