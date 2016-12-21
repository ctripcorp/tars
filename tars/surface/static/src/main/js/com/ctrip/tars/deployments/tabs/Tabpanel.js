$import("com.ctrip.tars.util.Angular");
$import("js.lang.System", "BootstrapClassLoader");

tarsPortal.controller("com.ctrip.tars.deployments.tabs.Controller", ['$scope', '$rootScope', function($scope, $rootScope) {

  var layout = function(on, ratio) {
    var origin = {
      width: 0,
      height: 0
    };

    var size = {
      width: 0,
      height: 0
    };

    var width = $(window).width(),
      height = $(window).height(),
      w = 0,
      h = 0;


    if (width < 768) {
      h = height - 48 - 48;
    } else {
      h = height - $(".concern-center").height() - 48 * 3 - 32;
    }

    if (h < 56) {
      origin.height = 56 - h;
    }

    h += origin.height;

    var parallel = com.ctrip.tars.util.Angular.getScope("#com-ctrip-tars-app-Controller");
    if (parallel) {

      if (on) {
        h -= 16 - 16 * (ratio || 0);
      } else {
        h += 16 * (ratio || 1) - 16;
      }

      parallel.$broadcast("parallel.apps.layout.update", {
        width: size.width,
        height: h,
        win: {
          height: height,
          width: width
        },
        origin: {
          height: origin.height
        }
      });
    }

    size.height = h;

    return size;
  };

  var refresh = function() {
    if (!$scope.$$phase) {
      $scope.$apply();
    }

    if (js.lang.System.getEnv("isIE")) {
      var scroller = $("#servers-scroller, #console-scroller, #histories-scroller");
      scroller.css("height", $scope.size.height);
      scroller.find(".iscroll-scroller").css({
        'minHeight': ($scope.size.height + 32) + 'px'
      });
      scroller.find(".none-data").css({
        'lineHeight': $scope.size.height + 'px'
      });
    }
  };

  var collapse = true;
  $scope.size = layout(collapse);
  refresh();

  $scope.$on("sidebar.collapse.running", function(event, on, ratio) {
    collapse = on;
    $scope.size = layout(on, ratio);
    refresh();
  });

  $scope.$on("sidebar.collapse.on", function(event, on) {
    collapse = on;
    $scope.size = layout(on);
    refresh();
  });

  $scope.$on("concern.watching.on", function(event, offset) {
    $scope.size.height = $scope.size.height - offset.step.height;
    refresh();
  });

  $scope.$on('window.resize', function(event, data) {
    $scope.size = layout(collapse);
    refresh();
    return false;
  });

}]);

