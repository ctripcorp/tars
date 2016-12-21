$import("com.ctrip.tars.component.IFlow");
$import("com.ctrip.tars.util.Watch");

$import("com.ctrip.tars.progress.Progress");

angular.module("com.ctrip.tars.progress")

.service('com.ctrip.tars.progress.Service', ['$rootScope', '$http', function($rootScope, $http) {

  var loadGroupProgress = function(groupId, callback) {
    if (!com.ctrip.tars.util.Id.isValid(groupId)) {
      return;
    }

    $http({
      method: 'GET',
      url: [BASE_URL, "groups/", groupId, "/summary"].join("")
    }).success(function(data, status, headers, config) {
      if ((data.status >= 200 && data.status < 300) || (data.status === 304)) {
        var group = data.data;

        var vip = {
          id: group.id,
          type: "group",
          data: [],
          children: []
        };

        var groupJson = {
          id: group.id,
          type: "group",
          data: [group.healthCheckUrl],
          children: []
        };

        var packages = group.packages || [];
        var servers = 0,
          version = "";
        for (var j = 0, len2 = packages.length; j < len2; j++) {
          var pack = packages[j];
          groupJson.children.push({
            id: pack.id,
            type: "package",
            version: pack.version,
            createdAt: pack.createdAt,
            serverNum: pack.serverNum,
            data: []
          });
          servers += pack.serverNum;
        }

        if (group.serverNum > servers) {

          groupJson.children.push({
            id: null,
            type: "package",
            version: "无版本", //deploying.batches
            serverNum: group.serverNum - servers,
            data: []
          });
        }
        vip.children.push(groupJson);
        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback(vip);
        }
      }
    }).error(function(data, status, headers, config) {
      callback({
        error: true,
        status: status
      });
    });
  };
  var loadAppProgress = function(appId, callback) {};

  var service = {
    loadGroupProgress: function(groupId, callback) {
      loadGroupProgress(groupId, callback);
    }
  };

  return service;
}])

.directive(
  "working",
  function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      template: [
        '<div>',

        '<div class="iflow-palette" style="position: relative; overflow: hidden; height: 182px; color: black;">',
        '<div class="iflow-container" style="width: 100%; height: 100%; position: relative; overflow: hidden;"></div>',
        '</div>',

        //'<ul class="track" style="padding-left: 8px; list-style: disc; font-size: 16px;">',
        //'<i>集群内存在的版本：<i>',
        //'<li ng-repeat="package in packages track by $index" style="list-style: disc; text-indent: 16px;"> ',
        //'{{getDeploymentVersion(package)}}（{{package.serverNum}}台）',
        //'</li>',
        //'</ul>',

        '<div ng-if="packages.length > 0" class="container-fluid" style="font-size: 12px; border: 1px dashed #ccc; line-height: 24px;">',

        '<div class="row" style="text-align: center;">',
        '<div class="col-lg-9 col-md-9 col-sm-8 col-xs-8">',
        '版本号（时间戳）',
        '</div>',
        '<div class="col-lg-3 col-md-3 col-sm-4 col-xs-4" style="border-left: 1px dashed #ccc;">',
        '服务器台数',
        '</div>',
        '</div>',

        '<div class="row" ng-repeat="package in packages track by $index" style="border-top: 1px dashed #ccc; text-align: center;">',
        '<div class="col-lg-9 col-md-9 col-sm-8 col-xs-8">',
        '{{getDeploymentVersion(package)}}',
        '</div>',
        '<div class="col-lg-3 col-md-3 col-sm-4 col-xs-4 pending" style="border-left: 1px dashed #ccc; font-size: 20px; color: rgba(147, 147, 147, 0.8);">',
        ' {{package.serverNum}} <i class="fa fa-sitemap unit" style="font-size: 12px;"></i>',
        '</div>',
        '</div>',
        '</div>',

        '</div>'
      ].join(""),
      controller: ["$scope", '$rootScope', '$compile',
        'com.ctrip.tars.progress.Service',
        'com.ctrip.tars.histories.Service',
        'com.ctrip.tars.deployment.Service',
        function($scope, $rootScope, $compile, progressService, historieService, deploymentService) {

          // TODO 当发布历史tab隐藏，发布历史不刷新，working progress也不刷新，需改正
          var scope = this;

          $scope.packages = [];

          this.create = function(element) {

            this.iflow = new com.ctrip.tars.component.IFlow({
              Palette: element.get(0),
              Container: element.find(".iflow-container").get(0)
            }, $scope, $compile);

            this.watch = new com.ctrip.tars.util.Watch([], function(newData, oldData) {
              scope.iflow.draw(newData);
            }, "id");

            this.refresh = function(force) {
              this.watch.setData($scope.histories, force);
              return true;
            };

            element.on("$destroy", function() {
              scope.iflow.destroy();
            });

            $scope.$on('com.ctrip.tars.histories.service.update', function(event, data) {
              var segment = data.getSegment(0);
              var histories = [];
              if (segment) {
                var itr = segment.values().iterator();
                while (itr.hasNext()) {
                  var value = itr.next();
                  if (!value) {
                    continue;
                  }
                  if (histories.length === 0) {
                    histories.push(value);
                    continue;
                  }
                  for (var i = 0, len = histories.length; i < len; i++) {
                    if (value.id >= histories[i].id) {
                      histories.splice(i, 0, value);
                      break;
                    } else if (i == len - 1) {
                      histories.push(value);
                    }
                  }
                }
                histories = histories.slice(0, 5);
              }

              var now = histories[0],
                skip = false;
              if (Object.isNull(now)) {

                scope.refresh({
                  error: true,
                  status: "此group从未进行过发布。"
                });
                return;
              }

              var id = now.parent,
                rollback = null;
              if (!Object.isNull(id)) {
                for (var j = 0, length = histories.length; j < length; j++) {
                  if (histories[j].id === id) {
                    rollback = histories[j];
                    rollback.index = j;
                    break;
                  }
                }
                if (Object.isNull(rollback)) {
                  skip = true;
                  deploymentService.get({
                    deployment: id
                  }, null, function(data) {
                    now.rollback = data;
                    $scope.histories = histories;
                    scope.refresh();
                    //scope.iflow.draw(histories);
                  });
                }
              }
              if (!skip) {
                now.rollback = rollback;
                $scope.histories = histories;
                scope.refresh();
                //scope.iflow.draw(histories);
              }
            });

            // $scope.$on('dispatcher.interval.timer', this.refresh);
            $scope.$on('working.redraw', function(event, data) {
              $rootScope.$broadcast('deployment.progress.update', 0, true);

              var params = $scope.getValidParams();
              historieService.refresh({
                app: params.app
              }, {
                page: 1,
                //running: "False"
                group: params.group
              });

              //var time = new Date().getTime();
              progressService.loadGroupProgress(data.group, function(vip) {
                var packages = [];
                if (vip && vip.children && vip.children.length > 0) {
                  packages = vip.children[0].children;
                }
                $scope.packages = packages;
                //time = new Date().getTime() - time;
                //console.log("watch:" + time / 1000);
              });
            });

            $scope.$on("sidebar.collapse.on", function() {
              scope.refresh(true);
            });

            $scope.$on('window.resize', function() {
              scope.refresh(true);
            });

            $scope.getSize = function() {
              return element.width() + element.height();
            };

            $scope.$watch("getSize()", function(newWidth, oldWidth) {
              scope.refresh(true);
            });

          };
        }
      ],
      link: function($scope, element, attrs, controller) {
        controller.create(element);
      }
    };
  });

