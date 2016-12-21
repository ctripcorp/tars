$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.util.Fridge");
$import("com.ctrip.tars.util.Id");

$import("com.ctrip.tars.packages.Service");

$import("js.text.SimpleDateFormat", "BootstrapClassLoader");

angular
  .module("com.ctrip.tars.packages")
  .controller("com.ctrip.tars.packages.Controller", ['$scope', '$rootScope', '$timeout', 'com.ctrip.tars.packages.Service', function($scope, $rootScope, $timeout, service) {
    $scope.$on('com.ctrip.tars.packages.service.update', function(event, data) {
      $scope.builders = service.getData().toArray("$$index", false);

      if (!$scope.$$phase) {
        $scope.$apply();

      }

      $scope.$broadcast("pagination.refresh");

      $timeout(function() {
        if ($scope.scroller) {
          $scope.scroller.refresh();
        }
      }, 1000, false, null);

      return false;
    });

    $scope.builders = service.getData().toArray("$$index", false);
    $scope.scroller = null;

    $scope.viewBuilder = null;
    $scope.packageFormDialog = null;

    var timerFlag = false;
    var skip = 1;

    $scope.reroll = {
      is: false,
      deploymentId: null
    };

    $scope.$on('dialog.rollout.builders.open', function(event, data) {

      var params = $scope.getValidParams(),
        selectedGroup = $scope.selectedGroup;

      if (selectedGroup) {
        service.setGroupValidator(selectedGroup.category);
      }

      timerFlag = true;

      $scope.reroll = {
        is: data.flavor === "reroll",
        deploymentId: data.params.deploymentId
      };

      service.first({
        app: params.app
      }, {
        deployment: $scope.reroll.deploymentId
      });

      if (!$scope.scroller) {
        $scope.scroller = new com.ctrip.tars.component.IScroll("#builders-scroller", {
          bottom: 8,
          innerHeight: 32,
          // pageHeight: $scope.size.height || 0,
          sensitive: {}
        }, function(callback) {
          service.next(callback);
        }, function(callback) {
          $scope.refreshByVisibleScroller(callback);
        });
      }

      $scope.packageFormDialog = TweenMax.fromTo($("#com-ctrip-tars-packages-Controller .package-form"), 0.5, {
        bottom: 0,
        opacity: 1
      }, {
        bottom: -200,
        opacity: 0
      });

      $timeout(function() {
        if ($scope.scroller) {
          $scope.scroller.refresh();
        }
      }, 1000, false, null);

      return false;
    });

    $scope.$on('dialog.rollout.config.end', function(event, data) {
      $scope.reroll = {
        is: false,
        deploymentId: null
      };
      timerFlag = false;
      service.clear();

      service.setGroupValidator(null);
      return false;
    });

    $scope.$emit("dialog.rollout.config.ready");


    $scope.refreshByVisibleScroller = function(callback) {
      var pages = [];
      if ($scope.scroller) {
        var top = $scope.scroller.getVisibleTopEle(),
          bottom = $scope.scroller.getVisibleBottomEle();
        var data = service.getData();
        var start = 0,
          end = 0;

        var scope = com.ctrip.tars.util.Angular.getScope(top);
        if (scope && scope.builder) {
          start = data.getSerialByValue(scope.builder);
        }
        scope = com.ctrip.tars.util.Angular.getScope(bottom);
        if (scope && scope.builder) {
          end = data.getSerialByValue(scope.builder);
        }
        if (end < start) {
          if (start >= 0) {
            pages.push(start + 1);
          }
          if (end >= 0) {
            pages.push(end + 1);
          }
        } else {
          for (var j = start; j <= end; j++) {
            if (j >= 0) {
              pages.push(j + 1);
            }
          }
        }

      } else {
        pages.push(1);
      }
      var params = $scope.getValidParams();
      for (var i = 0, len = pages.length; i < len; i++) {
        service.refresh({
          app: $scope.app.id
        }, {
          deployment: $scope.reroll.deploymentId,
          page: pages[i]
        }, null, (i == len - 1 && Object.isFunction(callback)) ? callback : null);
      }
    };

    $scope.$on('dispatcher.interval.timer', function(event, data) {
      if (skip === 2 && timerFlag && !service.isLoading() && $scope.getIndexOfDoing() === 0) {
        $scope.refreshByVisibleScroller();
      }
      if (skip >= 2) {
        skip = 0;
      }
      skip++;
      return false;
    });

    $scope.getSelectedBuilder = function() {

      if ($scope.builders) {
        for (var i = 0, len = $scope.builders.length; i < len; i++) {
          var builder = $scope.builders[i];
          if (builder.active && builder.status === 'SUCCESS') {
            return builder;
          }
        }
      }
      return {};
    };

    $scope.selectBulider = function(builder) {
      if ($scope.builders) {
        for (var i = 0, len = $scope.builders.length; i < len; i++) {
          var b = $scope.builders[i];
          if (b.status === 'SUCCESS') {
            $scope.builders[i].active = ((b == builder || b.id == builder.id) && !builder.active);
          } else {
            $scope.builders[i].active = false;
          }
        }
      }
    };

    $scope.repack = function(builder) {
      var params = $scope.getValidParams();
      if (builder.id) {
        com.ctrip.tars.component.IAjax.post([BASE_URL, 'packages/', builder.id, '/repack_retry'].join(""), {
          success: function() {
            $scope.refreshByVisibleScroller();
          }
        });
      }
    };

    $scope.download = function() {

    };

    $scope.closePackageForm = function() {
      if ($scope.packageFormDialog) {
        $scope.packageFormDialog.play();
      }

      $scope.resetPackageForm();
    };
    $scope.openPackageForm = function() {
      if ($scope.packageFormDialog) {
        $scope.packageFormDialog.reverse();
      }
    };

    $scope.packageForm = {
      version: "",
      name: "",
      location: "",
      application: $scope.app.id
    };

    var sdf = new js.text.SimpleDateFormat("yyyyMMddHHmmss");
    $scope.resetPackageForm = function() {
      $scope.packageForm.version = sdf.format(new Date());
      $scope.packageForm.name = "";
      $scope.packageForm.location = "http://tomcat.apache.org/tomcat-6.0-doc/appdev/sample/sample.war";
    };
    $scope.resetPackageForm();

    $scope.validatePackageForm = function() {
      return $scope.packageForm.name && $scope.packageForm.location && $scope.packageForm.version;
    };
    $scope.savePackage = function() {
      if ($scope.validatePackageForm()) {
        service.save($scope.packageForm, function() {
          $scope.refreshByVisibleScroller();
          $scope.closePackageForm();
        });
      }
    };
    $scope.delPackage = function(package) {
      service.remove(package.id, function() {
        $scope.refreshByVisibleScroller();
      });

    };

    /*pagination*/
    $scope.setCurrentPage = function(page, currentPage, pageSize) {
      if ($scope.scroller) {
        if (page > currentPage) {
          $scope.scroller.next();
        } else if (page < currentPage) {
          $scope.scroller.previous();
        }
      }
    };
    $scope.getPagination = function() {
      var pageSize = service.getPageSize(),
        total = service.count(),
        length = service.size();
      return {
        pageSize: pageSize,
        total: total > length ? total : length,
        from: length ? 1 : 0,
        to: length || 0
      };
    };
    $scope.reload = function(currentPage, pageSize) {
      if ($scope.scroller) {
        $scope.scroller.reload();
      }
    };
    $scope.isLoading = function() {
      return service.isLoading();
    };

  }])
  .directive(
    "liPackage",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        /*
        scope: {
          id: "@dataid",
          index: "@dataindex",
          active: "@dataactive"
          //,onSelect: "&"
        },
        */
        controller: ["$scope", function($scope) {
          //$scope.builder = $scope.$parent.builders[$scope.index];
        }],
        template: [

          '<div class="item details events Mon animate-session firstItem builders {{ builder.availableStatus }} container-fluid iscroll-item" ng-click="selectBulider(builder)" ng-class="{true:\'active\'}[builder.active]">',
          //'<div class="border"></div>',
          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<div style="padding: 0px 0px 0px 72px;">',

          '<div class="pull-left" style="position: absolute; top: 50%; margin: -22px auto auto -72px; width: 72px;">',
          //'<div class="pull-left" style="margin-left: -96px;margin-top: 8px;width: 88px;">',
          //'<div class="img-circle photo-tip">',
          //'<i class="fa fa-file-archive-o"></i>',
          //'</div>',
          '<div class="column status {{ builder.statusClass }}">',
          '{{ builder.statusSymbol }}',
          '</div>',
          '<div class="text {{ builder.statusClass }}">{{ builder.statusText }}</div>',
          '</div>',

          '<div class="column last item-content {{ builder.statusClass }}" style="cursor: default; border-left: 0px none; padding-left: 12px; padding-right: 96px;">',

          '<div class="room t_type builders" style="right: 15px;">',
          // '<button ng-click="viewLog(builder)" class="pull-right btn btn-default {{ builder.repackStatus }}" style="margin: auto 8px;"><i class="fa fa-file"></i> &nbsp;查看日志</button>',
          // '<button ng-click="repack(builder)" class="pull-right btn btn-default {{ builder.repackStatus }}" style="margin: auto 8px;"><i class="fa fa-briefcase"></i>&nbsp;重新整理</button>',
          // '<button ng-click="download()" class="pull-right btn" style="margin: auto 8px;"><i class="fa fa-download"></i>&nbsp;下载</button>',
          '<button ng-click="$event.stopPropagation(); delPackage(builder)" class="pull-right btn btn-default" style="margin: auto 8px;"><i class="fa fa-cross"></i>&nbsp;删除</button>',
          '<button class="pull-right selected btn btn-default disabled" style="margin: auto 8px;"><i class="fa fa-check"></i>&nbsp;选中</button>',
          '</div>',

          '<h5>{{ builder.name }}</h5>',

          '<p class="track">',
          '版本名称：{{ builder.version }} <br>',
          '时间：{{ builder.createdAt }} <br>',
          '版本标识：{{ getDeploymentVersion(builder) }} <br>',
          'location：{{ builder.location }} <br>',
          '</p>',

          '</div>',

          '</div>',
          '</div>',
          '</div>',
          '</div>'

        ].join("")
      };
    })
  .directive(
    "liBuild",
    function() {
      return {
        estrict: 'E',
        replace: true,
        transclude: true,
        scope: true,

        controller: ["$scope", function($scope) {}],
        template: [
          '<div class="item details build Mon animate-session firstItem {{ viewBuilder.availableStatus }} container-fluid iscroll-item">',

          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',

          '<div style="padding: 0px 8px 0px 72px;">',


          '<div class="pull-left" style="position: absolute; top: 50%; margin: -20px auto auto -72px; width: 72px;">',
          '<div class="column status {{ viewBuilder.statusClass }}">',
          '{{ viewBuilder.statusSymbol }}',
          '</div>',
          '<div class="text {{ viewBuilder.statusClass }}">{{ viewBuilder.statusText }}</div>',
          '</div>',

          '<div class="column last details item-content {{ viewBuilder.statusClass }}" style="cursor: default; padding-left: 16px; padding-right: 8px;">',

          '<h5 class="">『 {{ viewBuilder.name }} 』 &nbsp;&nbsp;&nbsp;&nbsp;</h5>',

          '<p class="track">',
          '版本标识：{{ getDeploymentVersion(viewBuilder) }}',
          '</p>',

          '<p class="track" style="white-space: pre;">',
          '日志输出: \n{{ viewBuilder.buildLog }}',
          '</p>',

          '</div>',

          '</div>',
          '</div>',
          '</div>',
          '</div>'
        ].join("")
      };
    });

