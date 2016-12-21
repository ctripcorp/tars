$import("com.ctrip.tars.util.Chart");
$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.component.chart.Stock");
$import("com.ctrip.tars.util.Common");
$import("com.ctrip.tars.component.ICheckbox");
$import("com.ctrip.tars.model.DeploymentTargetSteps");
$import("com.ctrip.tars.util.Id");
$import("com.ctrip.tars.component.ISlider");

$import("com.ctrip.tars.servers.Service");

angular
  .module("com.ctrip.tars.servers")
  .controller(
    "com.ctrip.tars.servers.Controller", [
      '$scope', '$timeout',
      'com.ctrip.tars.servers.Service',
      function($scope, $timeout, service) {
        $scope.scroller = null;
        $scope.appHostsCharts = new js.util.HashMap();
        $scope.sliders = new js.util.HashMap();

        $scope.servers = service.getData().toArray("$$index", false);
        $scope.$on('com.ctrip.tars.servers.service.update', function(event, data) {
          $scope.servers = service.getData().toArray("$$index", false);

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

        $scope.isActive = function() {
          return $scope.$parent.$parent.isActive();
        };

        $scope.autofresh = new com.ctrip.tars.component.ICheckbox(!$scope.getIntervalTimerTerminator(),
          $scope.getIntervalTimerTerminator());

        $scope.$on('dispatcher.interval.timer', function(event, data) {
          $scope.autofresh.setDisabled($scope.getIntervalTimerTerminator());
          /*
          if (!$scope.$$phase) {
            $scope.$apply();
          }
          */

          if ($scope.autofresh.isChecked() && $scope.isActive() && !$scope.getIntervalTimerTerminator()) {
            /*
            var params = $scope.getValidParams();
            service.refresh({
              group: params.group,
              deployment: params.deployment
            });
            */
            $scope.refreshByVisibleScroller();
          }
          return false;
        });

        $scope.$on('app.current.deployment.id.change', function(event, data) {
          //if ($scope.isActive()) {
          service.reset();
          //var params = $scope.getValidParams(); params.app
          service.first({
            group: data.group,
            deployment: data.id
          });
          //}
          return false;
        });

        $scope.refreshByVisibleScroller = function(callback) {
          var pages = [];
          if ($scope.scroller) {
            var top = $scope.scroller.getVisibleTopEle(),
              bottom = $scope.scroller.getVisibleBottomEle();
            var data = service.getData();
            var start = 0,
              end = 0;

            var scope = com.ctrip.tars.util.Angular.getScope(top);
            if (scope && scope.host) {
              start = data.getSerialByValue(scope.host);
            }
            scope = com.ctrip.tars.util.Angular.getScope(bottom);
            if (scope && scope.host) {
              end = data.getSerialByValue(scope.host);
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
              group: params.group,
              deployment: params.deployment
            }, {
              page: pages[i]
            }, null, (i == len - 1 && Object.isFunction(callback)) ? callback : null);
          }
        };

        //$scope.$on('tab.servers.hide', function(event, data) {});
        $scope.$on('tab.servers.show', function(event, data) {
          /*
          var params = $scope.getValidParams();
          service.refresh({
            group: params.group,
            deployment: params.deployment
          });
          */

          if (!$scope.scroller) {
            $scope.scroller = new com.ctrip.tars.component.IScroll("#servers-scroller", {
              bottom: 8,
              innerHeight: 32,
              // pageHeight: $scope.size.height || 0,
              sensitive: {}
            }, function(callback) {
              service.next(callback);
            }, function(callback) {
              /*
              var params = $scope.getValidParams();
              service.refresh({
                group: params.group,
                deployment: params.deployment
              }, null, null, callback);
              */
              $scope.refreshByVisibleScroller(callback);
            });
          }

          // $scope.refreshByVisibleScroller();

          $timeout(function() {
            if ($scope.scroller) {
              $scope.scroller.refresh();
            }
          }, 1000, false, null);

          return false;
        });

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

        $scope.$emit("deployment.window.ready", "Servers");
      }
    ])
  .directive(
    "liServer",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        /*scope: {
					id: "@dataid",
					index: "@dataindex",
					hashcode: "@datahashcode",
					onMore: "&"

					//ip: "@dataip",
					//hostname: "@datahostname",
					//status: "@datastatus",
					//costCurr: "@datacostcurr",
					//visitCurr: "@datavisitcurr",
					//fatalLogCurr: "@datafatallogcurr",
					//errLogCurr: "@dataerrlogcurr",
					//memCurr: "@datamemcurr",
					//cpuCurr: "@datacpucurr"
				},*/

        controller: ["$scope", function($scope) {
          $scope.getFlowsteps = function() {
            return $scope.host.steps;
          };

          $scope.$watch("host.steps", function(newData, oldData) {
            $scope.$broadcast("flowstep.update", newData);
          });

        }],

        template: [
          '<div class="item details container-fluid iscroll-item">',
          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',

          '<div style="padding: 0px 8px 0px 72px;">',

          '<div class="pull-left img-circle photo-tip active" style="position: absolute; top: 50%; margin: -20px auto auto -56px;">', //ng-class="{true: \'active\'}[host.target.isFort]"
          '<i class="fa fa-sitemap"></i>',
          '</div>',

          '<div class="column details item-content" style="border-left: 0px none; padding-left: 0px; padding-right: 8px;">',
          '<expander name="servers">',
          '<expander-head>',

          '<div class="container-fluid">',
          '<div class="row">',
          '<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12" style="padding: 0px;">',
          '<h5 style="font-size: 16px;">{{ host.hostname }}＜{{ host.ip }}＞<span ng-if="host.target.isFort" class="badge badge-fort">堡垒机</span></h5>',
          '</div>',
          '<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12" style="padding: 0px;">',
          '<flowstep></flowstep>',
          '</div>',
          '</div>',
          '</div>',
          '<p class="track">',
          // 'Group id：{{host.group}}<br>',
          // 'ip address：{{host.ipAddress}}<br>',
          'client：{{host.saltClient}}<br>',
          //'$$serial：{{host.$$serial}}<br>',
          //'$$index：{{host.$$index}}<br>',
          '</p>',
          // '<p class="list-group-item-text summary"
          // style="color: #757575; font-size: 12px;
          // line-height: 20px;">',
          // '错误数({{dataerrlogcurr}})；访问数({{datavisitcurr}})；HTTP访问...</p>',
          '</expander-head>',
          '<expander-body>',
          //'<div class="details"><p>',
          //'group name：{{host.group.name}}<br>',
          //'group siteName：{{host.group.siteName}}<br>',
          //'group vdirPath：{{host.group.vdirPath}}<br>',
          //'group appPoolName：{{host.group.appPoolName}}<br>',
          //'group physicPath：{{host.group.physicPath}}<br>',
          //'</p></div>',
          //<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> {{monitorTime}}</small>
          /*
          '<ul class="bxslider bxslider-app-detail-server-{{host.hashcode}}" style="width: 100%; height: 96px; margin-bottom: 0px; padding: 0px;">',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-detail-server-{{host.hashcode}}-errorVisit" style="height:96px"></div></li>',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-detail-server-{{host.hashcode}}-visit" style="height:96px"></div></li>',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-detail-server-{{host.hashcode}}-log" style="height:96px"></div></li>',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-detail-server-{{host.hashcode}}-amount" style="height:96px"></div></li>',
          '</ul>',
          */
          //'<em role="expand-fullscreen" data-echo-type="app-detail-server" data-echo-key="app-detail-server" style="position: absolute; right: 0px; margin-top: -12px; z-index: 999; font-size: 12px; line-height: 12px;" class="text-muted pull-right">',
          //'<i class="fa fa-expand"></i>', '</em>',
          '</expander-body>',
          '</expander>',
          '</div>',
          '</div>',

          '</div>',
          '</div>',
          '</div>'
        ].join("")

      };
    });

