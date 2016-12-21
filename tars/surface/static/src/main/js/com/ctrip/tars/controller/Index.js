$import("js.lang.StringBuffer", "BootstrapClassLoader");
//$import("js.util.Date", "BootstrapClassLoader");
$import("js.util.HashMap", "BootstrapClassLoader");
//$import("js.util.GregorianCalendar", "BootstrapClassLoader");
//$import("js.text.SimpleDateFormat", "BootstrapClassLoader");

tarsPortal.controller("com.ctrip.tars.index.Controller", ['$scope', '$rootScope', '$timeout', '$location', function($scope, $rootScope, $timeout, $location) {
  $scope.gotoSingleDeployment = function(app) {

    var group = $scope.getSelectedGroup(app);

    if (!group) {
      return;
    }

    //var sdf = new js.text.SimpleDateFormat(URL_DATE_FORMAT),
    //  cal = new js.util.GregorianCalendar(),
    //  now = new js.util.Date();
    //cal.setTime(now);

    //cal.add(js.util.Calendar.MINUTE, -30);

    var params = {};
    params[URL_PARAMS.APPS] = null;
    params[URL_PARAMS.APP] = app.id;
    params[URL_PARAMS.DEPLOYMENT] = null;
    //params[URL_PARAMS.FROM_DATE] = "" + sdf.format(cal.getTime());
    //params[URL_PARAMS.TO_DATE] = "" + sdf.format(now);
    params[URL_PARAMS.GROUP] = group.id;

    $location.path("/view/deployments/single").search(params);
  };

  $scope.gotoParallelDeployment = function() {
    if (selectedApps.size() <= 0) {
      alert("请点击左面列表上的“+”按钮添加应用！");
      return;
    }

    /*
    if (selectedApps.size() === 1) {
      $scope.gotoSingleDeployment(selectedApps.get(appId));
      return;
    }
    */

    var sb = new js.lang.StringBuffer();
    var iter = selectedApps.keySet().iterator();

    var appId = null;
    while (iter.hasNext()) {
      appId = iter.next();
      sb.append(appId).append(",");
    }

    sb.remove(sb.length() - 1, sb.length);

    var params = {};
    params[URL_PARAMS.APPS] = sb.toString();
    params[URL_PARAMS.APP] = appId;
    params[URL_PARAMS.DEPLOYMENT] = null;
    params[URL_PARAMS.FROM_DATE] = null;
    params[URL_PARAMS.TO_DATE] = null;
    params[URL_PARAMS.GROUP] = null;

    $location.path("/view/deployments/parallel").search(params);
  };

  var selectedApps = new js.util.HashMap();
  $scope.addOrRemove = function(event, app) {


    var offset = $('#selected-apps').offset(),
      origin = $("#btn-add-" + app.id),
      page = origin.offset(),
      flyer = origin.clone();

    if ($scope.getSelectedType(app) == "plus") {
      flyer.fly({
        start: {
          left: page.left,
          top: page.top
        },
        end: {
          left: offset.left,
          top: offset.top,
          width: 0,
          height: 0
        },
        speed: 2,
        vertex_Rtop: 64,
        onEnd: function() {
          flyer.remove();
          selectedApps.put(app.id, app);
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    } else {
      flyer.fly({
        start: {
          left: offset.left,
          top: offset.top
        },
        end: {
          left: page.left,
          top: page.top,
          width: 0,
          height: 0
        },
        speed: 2,
        vertex_Rtop: 64,
        onEnd: function() {
          flyer.remove();
          selectedApps.remove(app.id);
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        }
      });
    }
    event.stopPropagation();
  };
  $scope.getSelectedType = function(app) {
    return selectedApps.containsKey(app.id) ? "minus" : "plus";
  };
  $scope.getSelectedCount = function() {
    return selectedApps.size();
  };

  $scope.selectGroup = function(app, group) {
    for (var i = app.groups.length - 1; i >= 0; i--) {
      if (!group.active && (group === app.groups[i] || group.id === app.groups[i].id)) {
        group.active = true;
      } else {
        app.groups[i].active = false;
      }
    }
  };
  $scope.getSelectedGroup = function(app) {
    for (var i = app.groups.length - 1; i >= 0; i--) {
      if (app.groups[i].active) {
        return app.groups[i];
      }
    }
    return null;
  };
  $scope.hasSelectedGroup = function(app) {
    return !!$scope.getSelectedGroup(app);
  };

  $scope.init = function() {
    /*
    $("[data-toggle='offcanvas']").click(function(e) {

      e.preventDefault();

      // If window is small enough, enable sidebar push menu
      if ($(window).width() <= 992) {
        $('.row-offcanvas').toggleClass('active');
        $('.left-side').removeClass("collapse-left");
        $(".right-side").removeClass("strech");
        $('.row-offcanvas').toggleClass("relative");
      } else {
        // Else, enable content streching
        $('.left-side').toggleClass("collapse-left");
        $(".right-side").toggleClass("strech");
      }
    });
    */
    var expand = null;
    $scope.$watch("search", function(value) {
      if (!expand) {
        expand = TweenMax.fromTo($(".global-search-keyword"), 0.5, {
          width: "0%",
          padding: "0px 0px"
        }, {
          width: "100%",
          padding: "8px 16px",
          onComplete: function() {
            this.target.focus();
          },
          onReverseComplete: function() {
            this.target.blur();
            $scope.filters = null;
          }
        });
      }
      if (value === true) {
        expand.play();
      } else {
        expand.reverse();
      }
    });
  };

  $scope.filters = null;
  $scope.filter = function() {
    $scope.$broadcast("search.apps", $scope.filters);
  };

  var layout = function() {
    var size = {
      width: 0,
      height: 0
    };
    var width = $(window).width(),
      height = $(window).height();

    size.height = height;

    if (size.height < 232) {
      size.height = 232;
    }

    size.height -= 184 - 80;
    return size;
  };

  $scope.size = layout();

  $scope.$on('window.resize', function(event, data) {
    $scope.size = layout();
    /*
		if (!$scope.$$phase) {
			$scope.$apply();
		}*/
    return false;
  });

  $timeout(function() {
    $scope.init();
  }, 1000, false, null);

}]);

