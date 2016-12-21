$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.util.Id");

$import("js.util.HashMap", "BootstrapClassLoader");
//$import("js.util.Arrays", "BootstrapClassLoader");

$import("com.ctrip.tars.console.Service");

angular
  .module("com.ctrip.tars.console")
  .controller(
    "com.ctrip.tars.console.Controller", [
      '$scope', '$timeout',
      'com.ctrip.tars.console.Service',
      function($scope, $timeout, service) {
        $scope.scroller = null;
        $scope.logs = service.getData();
        $scope.$on('com.ctrip.tars.console.service.update', function(event, data) {
          $scope.logs = service.getData();

          if (!$scope.$$phase) {
            $scope.$apply();
          }

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

        $scope.$on('app.current.deployment.id.change', function(event, data) {
          //if ($scope.isActive()) {
          service.reset();
          service.first(null, $.extend(true, {
            deploy_id: data.id
          }, $scope.getFilters()), $scope.getSorters());
          //}
          $scope.clearFilters();
          return false;
        });

        //$scope.$on('tab.console.hide', function(event, data) {});
        $scope.$on('tab.console.show', function(event, data) {
          var params = $scope.getValidParams();
          service.refresh(null, $.extend(true, {
            deploy_id: params.deployment
          }, $scope.getFilters()), $scope.getSorters(), function(d, scroll) {
            if (scroll && $scope.scroller) {
              $scope.scroller.scrollBottom();
            }
          });
          if (!$scope.scroller) {
            $scope.scroller = new com.ctrip.tars.component.IScroll("#console-scroller", {
              bottom: 8,
              innerHeight: 32,
              // pageHeight: $scope.size.height || 0,
              sensitive: {
                top: 0,
                bottom: 0
              }
            }, function(callback) {
              var params = $scope.getValidParams();
              service.append(null, $.extend(true, {
                deploy_id: params.deployment
              }, $scope.getFilters()), $scope.getSorters(), callback);
            }, function(callback) {
              var params = $scope.getValidParams();
              service.insert(null, $.extend(true, {
                deploy_id: params.deployment
              }, $scope.getFilters()), $scope.getSorters(), callback);

            });
          }

          $timeout(function() {
            if ($scope.scroller) {
              $scope.scroller.refresh();
            }
          }, 1000, false, null);

          return false;
        });

        $scope.autofresh = new com.ctrip.tars.component.ICheckbox(!$scope.getIntervalTimerTerminator(),
          $scope.getIntervalTimerTerminator());

        $scope.$on('dispatcher.interval.timer', function(event, data) {
          $scope.autofresh.setDisabled($scope.getIntervalTimerTerminator());

          if (!$scope.$$phase) {
            $scope.$apply();
          }

          if ($scope.autofresh.isChecked() && $scope.isActive() && !$scope.getIntervalTimerTerminator() && !service.isLoading()) {
            var params = $scope.getValidParams();
            service.refresh(null, $.extend(true, {
              deploy_id: params.deployment
            }, $scope.getFilters()), $scope.getSorters(), function(d, scroll) {
              if (scroll && $scope.scroller) {
                $scope.scroller.scrollBottom();
              }
            });
          }
          return false;
        });

        //$scope.$on('expander.console.expand', function(event, data) {});

        $scope.filters = {};
        $scope.sorters = {
          sort: 'log_timestamp',
          sort_order: 'asc'
        };
        var stepNames = new js.util.HashMap();
        stepNames.put('DISABLING', {
          name: '拉出',
          maps: ["DISABLING", "DISABLE_SUCCESS", "DISABLE_FAILURE"]
        });
        stepNames.put('DOWNLOADING', {
          name: '下载',
          maps: ["DOWNLOADING", "DOWNLOAD_SUCCESS", "DOWNLOAD_FAILURE"]
        });
        stepNames.put('INSTALLING', {
          name: '部署',
          maps: ["INSTALLING", "INSTALL_SUCCESS", "INSTALL_FAILURE"]
        });
        stepNames.put('VERIFYING', {
          name: '点火',
          maps: ["VERIFYING", "VERIFY_SUCCESS", "VERIFY_FAILURE"]
        });
        stepNames.put('ENABLING', {
          name: '拉入',
          maps: ["ENABLING", "ENABLE_SUCCESS", "ENABLE_FAILURE"]
        });
        $scope.setFiltersOfStep = function(value) {
          if (stepNames.get(value)) {
            $scope.filters.deploy_target_status = stepNames.get(value).maps.join(",");
            $scope.stepName = stepNames.get(value).name;
          } else {
            $scope.filters.deploy_target_status = null;
            $scope.stepName = null;
          }
          $scope.query();
        };
        $scope.clearFilters = function(filters) {
          $scope.filters = {};
          $scope.stepName = null;
        };
        $scope.setFilters = function(filters) {
          $scope.filters = $.extend($scope.filters, filters);
          $scope.setFiltersOfStep(filters.deploy_target_status);
        };
        $scope.getFilters = function() {
          return $scope.filters;
        };
        $scope.setSorters = function(sorters) {
          $scope.sorters = $.extend($scope.sorters, sorters);
          //$scope.query();
          service.sort($scope.sorters);
        };
        $scope.getSorters = function() {
          return $scope.sorters;
        };
        $scope.filter = function(filters) {
          $scope.setFilters(filters);
        };
        $scope.sorter = function(column) {
          $scope.setSorters({
            sort: column,
            sort_order: $scope.sorters.sort_order === 'desc' ? 'asc' : 'desc'
          });
        };
        $scope.query = function() {
          var params = $scope.getValidParams();
          service.first(null, $.extend(true, {
            deploy_id: params.deployment
          }, $scope.getFilters()), $scope.getSorters());
        };

        $scope.$emit("deployment.window.ready", "Console");
      }
    ])

.directive(
  "liEvent",
  function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: ["$scope", function($scope) {
        //$scope.log = $scope.$parent.logs[$scope.index];
        $scope.getDeployTargetInfo = function() {
          return $scope.log.deployTargetName ? "『  " + $scope.log.deployTargetName + " ＜ " + $scope.log.deployTargetIp + " ＞ 』" : "";
        };
      }],
      template: [
        //'<li class="event {{ log.levelClass }}">',
        //'<div class="content {{ log.direction }}">',
        //'<div class="desc"><div class="thumb event-1">{{ log.logModule }}</div><div class="text">{{ log.logLevel }}</div></div>',
        //'<div class="content-inner">',
        //'<h3>{{log.logTimestamp}} -- [{{ log.deployTargetName }}] &nbsp;&nbsp; [{{ log.deployStatus }}] &nbsp;&nbsp; [{{ log.deployTargetStatus }}] &nbsp;&nbsp; [{{ log.logLevel }}] </h3>',
        //'<p>{{ log.detail }}</p>',
        //'</div>',
        //'</div>',
        //'</li>'



        '<div class="item details console Mon animate-session firstItem container-fluid">',

        //'<div class="border"></div>',
        '<div class="row">',
        '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',

        '<div style="padding: 0px 8px 0px 72px;">',

        '<div class="pull-left" style="position: absolute; top: 50%; margin: -20px auto auto -72px; width: 72px;">',
        '<div class="column status {{ log.levelClass }}">',
        '{{statusSymbol}}',
        '</div>',
        '<div class="text {{ log.levelClass }}">{{ log.logLevel }}</div>',
        '</div>',

        '<div class="column last details item-content {{ log.levelClass }}" style="cursor: default; padding-left: 16px; padding-right: 8px;">',
        '<expander name="console" style="cursor: default;">',
        '<expander-head>',
        '<h5 class="">『 {{log.logTimestamp}} 』{{ getDeployTargetInfo() }}&nbsp;&nbsp;&nbsp;&nbsp;{{log.detail}}</h5>',
        '<p class="track">',
        '发布单状态：{{ log.deployStatus }}<br>',
        '主机状态：{{ log.deployTargetStatus }}<br>',
        '</p>',
        '</expander-head>',
        '<expander-body>',
        '<p class="track">',
        'Log Id：{{log.logId}} <br>',
        'Log Module：{{log.logModule.toUpperCase()}} <br>',
        '{{ log.stacktrace }}',
        '</p>',
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

