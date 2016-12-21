tarsPortal.controller("com.ctrip.tars.root.Controller", ['$scope', '$rootScope', '$interval', '$location', function($scope, $rootScope, $interval, $location) {
  var scope = this;
  $scope.skins = ["default", "local", "test", "uat", "production_uat", "production"];
  $scope.skin = atom.misc.Launcher.CSSClassLoader.getCSSClassLoader().getSkin();

  $scope.setSkin = function(skin) {
    var origin = $scope.skin,
      dest = null;

    if (Object.isNumber(skin) && skin >= 0 && skin < $scope.skins.length) {
      dest = $scope.skins[skin];

      if (dest == origin) {
        return;
      }

      $scope.skin = dest;
      atom.misc.Launcher.CSSClassLoader.getCSSClassLoader().setSkin(dest);
    } else {
      if ($scope.skins.contains(skin)) {
        dest = skin;

        if (dest == origin) {
          return;
        }

        $scope.skin = dest;
        atom.misc.Launcher.CSSClassLoader.getCSSClassLoader().setSkin(dest);
      }
    }

    if (origin !== dest) {
      $scope.$broadcast("theme.skin.change", {
        dest: dest,
        origin: origin
      });
    }
  };

  $scope.getSkin = function() {
    return $scope.skin;
  };

  $scope.getColors = function() {
    var barColor = null,
      trackColor = null,
      strokeStyle = null,
      fillStyle = null;

    var skin = $scope.getSkin();

    switch (skin) {
      case "skin-black":
      case "production_uat":
      case "uat":
        barColor = "#000000";
        trackColor = "#757575";
        strokeStyle = "#424242";
        fillStyle = "#424242";
        break;

      case "production":

      case "test":

      case "skin-tiffany":
      case "local":
      case "default":
      default:
        barColor = "#085D5E";
        trackColor = "#0C9597";
        strokeStyle = "#0b8284";
        fillStyle = "#0b8284";
        break;
    }

    return {
      barColor: barColor,
      trackColor: trackColor,
      strokeStyle: strokeStyle,
      fillStyle: fillStyle
    };
  };

  $scope.getRootUrl = function() {
    return ROOT_URL;
  };

  $scope.notSupport = function(event) {
    alert('暂不支持');
    event.stopPropagation();
  };

  var layout = function() {
    $scope.size = {
      width: $(window).width(),
      height: $(window).height()
    };
  };
  layout();

  $(window).resize(function() {
    layout();
    $rootScope.$broadcast('window.resize', arguments);
  });

  this.hidden = document.hidden || document.webkitHidden;

  $(document).bind("visibilitychange", function() {
    scope.hidden = document.hidden;
  });

  /*
  $scope.timer = 0;
  $rootScope.promise = $interval(function() {
    var t = $scope.timer % Math.floor((ROMOTE_CONNECTION / 1000));
    if (t === 0) {
      $rootScope.$broadcast('dispatcher.interval.timer', arguments);
    }
    $rootScope.$broadcast('dispatcher.interval.timer.' + t, arguments);
    $scope.timer++;
  }, 1000, 0, false, null);
  */

  $rootScope.promise = $interval(function() {
    if (scope.hidden) {
      return;
    }
    $rootScope.$broadcast('dispatcher.interval.timer', arguments);
  }, INTERVAL_TIMER, 0, false, null);

}]);

