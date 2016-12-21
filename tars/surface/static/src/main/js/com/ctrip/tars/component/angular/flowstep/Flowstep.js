var flowstep = angular.module("com.ctrip.tars.component.angular.flowstep", [])
  .directive(
    "liStep",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          name: "@dataname",
          no: "@datano",
          time: "@datatime",
          progress: "@dataprogress",
          doing: "@datadoing",
          done: "@datadone",
          todo: "@datatodo",
          first: "@datafirst",
          last: "@datalast",
          onMore: "&"
        },
        template: [
          '<li class="step-{{progress}}">',
          '<div class="step-name">{{name}}</div>',
          '<div class="step-no">{{_no}}</div>',
          '<div class="step-time">',
          '<div class="step-time-wraper">{{time}}</div>',
          '</div>',
          '</li>'
        ].join(""),
        controller: ["$scope", function($scope) {
          if (!$scope.no) {
            $scope.$watch("progress", function() {
              switch ($scope.progress) {
                case "error":
                  $scope._no = "×";
                  break;
                case "done":
                  $scope._no = "✓";
                  break;
                default:
                  $scope._no = $scope.$parent.$index + 1;
              }
            });
          } else {
            $scope._no = $scope.no;
          }
        }],
        link: function(scope, element, attrs, controller) {
          element.bind("click", function(event) {
            scope.onMore();
            event.stopPropagation();
            event.preventDefault();
            return false;
          });
        }
      };
    })
  .directive("flowstep", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        type: '@datagridprefix'
      },
      template: [
        '<div class="flowstep-wapper flowstep-wapper-{{gridPrefix}}" ng-show="flowsteps">',

        '<div class="flowstep flowstep-{{gridPrefix}}">',
        '<ol class="flowstep-steps">',
        '<li-step ng-repeat="step in steps track by $index" dataname="{{step.name}}" datatime="{{step.time}}" dataprogress="{{step.progress}}" datafirst="{{$index == 0}}" datalast="{{$index == steps.length -1}}" ',
        'ng-style="{ \'left\': \'{{100 * $index / (steps.length - 1)}}%\'}" on-more="step.handler()" >',
        '</li-step>',
        '</ol>',
        '<div class="flowstep-progress">',
        '<p class="flowstep-progress-bar">',
        '<span class="flowstep-progress-highlight error" style="width:{{doingError}}%;" ng-style="{\'width\': \'{{doingError}}%\'}"></span>', //
        '<span class="flowstep-progress-highlight success" style="width:{{doingSuccess}}%;" ng-style="{ \'width\': \'{{doingSuccess}}%\'}"></span>', //
        '</p>',
        '</div>',
        '</div>',
        '</div>',
        //'<div ng-if="$parent.getFlowsteps().length <= 0">no steps.</div>',
      ].join(""),
      link: function(scope, element, attrs, controller) {

        var gridPrefix = scope.type;

        if (!gridPrefix) {
          var width = Math.max(element.parent().width());
          if (width >= 768) {
            //小屏幕 平板 (≥768px) sm
            gridPrefix = 'sm';
          } else if (width >= 992) {
            //中等屏幕 桌面显示器 (≥992px) md
            gridPrefix = 'md';
          } else if (width > 1200) {
            //大屏幕 大桌面显示器 (≥1200px) lg
            gridPrefix = 'lg';
          } else {
            //超小屏幕 手机 (<768px) xs
            gridPrefix = 'xs';
          }
        }

        scope.gridPrefix = gridPrefix;
      },
      controller: ["$scope", "$interval", function($scope, $interval) {

        this.hasFlowsteps = function() {
          return $scope.steps && $scope.steps.length > 0;
        };

        this.getDoingError = function() {
          var percent = 0;
          var steps = $scope.steps;
          if (steps && steps.length > 0) {
            for (var i = 0, len = steps.length; i < len; i++) {
              if (steps[i].progress == 'error') {
                percent = 100 * i / (len - 1);
                break;
              }
            }
          }

          if (js.lang.System.getEnv("isIE")) {
            $(".flowstep-wapper.scope-" + $scope.$id).find(".error").css({
              "width": percent + "%"
            });
          }

          return percent;
        };

        this.getDoingSuccess = function() {
          var percent = 0;
          var steps = $scope.steps;
          if (steps && steps.length > 0) {
            for (var i = 0, len = steps.length; i < len; i++) {
              if (steps[i].progress == 'doing') {
                percent = 100 * i / (len - 1);
                break;
              } else if (steps[i].progress == 'error') {
                percent = 100 * (i - 1) / (len - 1);
                break;
              } else if (i == len - 1 && steps[i].progress == 'done') {
                percent = 100;
                break;
              } else if (steps[i].progress == 'done' && i < len - 1 && steps[i + 1].progress == 'todo') {
                percent = 100 * i / (len - 1);
                break;
              }
            }
          }

          if (js.lang.System.getEnv("isIE")) {
            $(".flowstep-wapper.scope-" + $scope.$id).find(".success").css({
              "width": percent + "%"
            });
          }

          return percent;
        };

        $scope.steps = [];
        $scope.flowsteps = false;
        $scope.doingError = null;
        $scope.doingSuccess = null;

        var scope = this;
        $scope.$on("flowstep.update", function(event, data) {
          $scope.steps = data || [];
          $scope.flowsteps = scope.hasFlowsteps();
          $scope.doingError = scope.getDoingError();
          $scope.doingSuccess = scope.getDoingSuccess();
        });
      }]
    };
  });

