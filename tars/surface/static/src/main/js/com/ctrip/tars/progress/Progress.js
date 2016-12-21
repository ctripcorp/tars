$import("js.util.HashMap", "BootstrapClassLoader");
$import("js.lang.StringBuffer", "BootstrapClassLoader");
$import("com.ctrip.tars.util.Id");
$import("com.ctrip.tars.util.Angular");

$import("com.ctrip.tars.progress.Components");
$import("com.ctrip.tars.progress.Working");
$import("com.ctrip.tars.progress.Deploying");

var progress = angular.module("com.ctrip.tars.progress")
  .directive(
    "iFlow",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: false,
        template: [ //topology  
          '<div class="jsProgress" style="position: relative; height: {{ size.height  }}px" ng-style="{ \'height\': \'{{ size.height  }}px\' }" >',

          '<div class="column details" style="border-left: 0px; padding: 0px 8px 0px 8px; margin: 0px 0px; word-break: break-all; font-size: 16px; line-height: 32px; word-spacing: .01em; color: #757575;">',
          '<h5 class="text-overflow" style="font-size: 24px; margin-bottom: 0px;">{{ group.name }}<span style="font-size: 14px;">&nbsp;(groupId: {{ group.id }})</span></h5>',

          //'<p class="track animate" style="font-size: 16px;" tween-show="app.id != null && ratio <= 2" duration="0.5" y="true">',
          //'<i>GroupId：</i>{{ group.id }}</p>',

          //'<p class="track" style="font-size: 16px;">',
          //'<i>SiteName：</i><a href="http://{{ group.siteName }}" target="_blank" style="text-decoration: underline;">{{ group.siteName }}</a></p>',

          //'<p class="track" style="font-size: 16px;">',
          //'<i>上一次成功发布版本：</i>{{getLastSuccessfulBuilderVersion()}}<br>',
          //'</p>',

          '<deploying ng-if="type === 2"></deploying>',

          '<working ng-if="type === 1"></working>',

          '</div>',
          '</div>'
        ].join(""),
        controller: [
          "$scope", '$rootScope', '$interval',
          'com.ctrip.tars.deployment.Service',
          function($scope, $rootScope, $interval, deploymentService) {
            var height = MAIN_VIEW_POINT;
            //if ($scope.isSingle()) {
            //  height -= 134;
            //}
            //height -= $scope.isSingle() ? CONCERN[0] : CONCERN[1];

            $scope.size = {
              height: height - 16
            };

            this.create = function() {
              $scope.element.mCustomScrollbar({
                theme: "minimal-dark", //"rounded-dots" "minimal-dark" "default" "rounded" "light-3"
                axis: "y",
                mouseWheel: {
                  enable: true,
                  axis: "y",
                  preventDefault: true
                },
                autoHideScrollbar: false,
                callbacks: {
                  whileScrolling: function() {}
                }
              });
            };

            $scope.type = 0;
            $scope.$on('plumb.refresh', function(event, data) {
              //$scope.layout();
              if (data.status.warStage.id == "WORKING") {
                if (data.group) {
                  $scope.type = 1;
                  $scope.$broadcast('working.redraw', data);
                } else {
                  //service.loadAppProgress(data.app);
                }
              } else if (data.status.warStage.id == "DEPLOYING" || data.status.warStage.id == "HISTORY") {
                $scope.type = 2;
                $scope.$broadcast('deploying.redraw', data);
              }
              return false;
            });

            $scope.$on('app.current.deployment.id.change', function(event, data) {
              deploymentService.reset();
              if (data.id) {
                $scope.$apply(function() {
                  $scope.type = 2;
                  $scope.$broadcast('deploying.redraw', {
                    deployment: data.id
                  });
                });
              } else {
                $scope.$apply(function() {
                  $scope.type = 1;
                  $scope.$broadcast('working.redraw', data);
                });
              }
            });
          }
        ],
        link: function($scope, element, attrs, controller) {
          $scope.element = element;
          element.css($scope.size);
          controller.create(element);
        }
      };
    }).directive(
    "summary",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: false,
        template: [
          '<div class="column details" style="width: 100%; height: 100%; border-left: 0px; padding: 0px 0px; margin: 0px 0px; word-break: break-all;">',
          '<div style="padding: 8px 8px;">',
          '<h5 class="text-overflow" style="font-size: 12px;">{{ group.name }}（groupId：{{ group.id }}）</h5>',
          '<p class="track" style="font-size: 12px; margin-top: 8px;">',
          //'{{ contribution.getBriefing() }}',
          '</p>',
          '</div>',
          '<div style="position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px; background: rgba(255, 255, 255, 0.1);"></div>',
          '</div>'
        ].join(""),
        controller: ["$scope", '$rootScope', '$interval', function($scope, $rootScope, $interval) {

          $scope.contribution = new com.ctrip.tars.group.Contribution();
          $scope.$watch("group.currentDeployment", function(deployment, oldValue) {
            var status = null;
            if (!deployment) {
              status = {
                tactics: "ROLLOUT",
                warZone: "APP",
                warStage: "WORKING",
                battle: "NONE"
              };
            } else {
              var scope = com.ctrip.tars.util.Angular.getScope(".com-ctrip-tars-group-Controller");
              var history = scope ? scope.isHistoryView() : false;
              status = {
                warZone: "APP",
                tactics: deployment.flavor,
                warStage: (deployment.status === 'SUCCESS' || deployment.status === 'REVOKED') || deployment.running ? "DEPLOYING" : (history ? "HISTORY" : "WORKING"),
                battle: deployment.status
              };
            }
            $scope.contribution.update(status);
          });
        }],
        link: function($scope, element, attrs, controller) {}
      };
    });

