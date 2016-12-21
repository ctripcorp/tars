var progress = angular.module("com.ctrip.tars.progress", [])
  .directive(
    "progressHide",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<div name="progress-step-hide" class="progress-step" style="left: 0px; top: 24%; border: 0px none #0b8284;"></div>',
        ].join(""),
        controller: ["$scope", function($scope) {
          this.create = function(element) {};
        }],
        link: function($scope, element, attrs, controller) {
          controller.create(element);
        }
      };
    })
  .directive(
    "progressStart",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<div name="progress-step-start" class="progress-step {{data.status | lowercase}}" style="left: 0px; top: 24%;">',
          '<div style="position: absolute; top: 14px; left: -36px; width: 80px; font-weight: 900;">开始</div>',
          '</div>',
        ].join(""),
        controller: ["$scope", function($scope) {
          this.create = function(element) {};
        }],
        link: function($scope, element, attrs, controller) {
          controller.create(element);
        }
      };
    })
  .directive(
    "progressEnd",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<div name="progress-step-end" class="progress-step {{data.status | lowercase}}" style="right: 0px; top: 24%;">',
          '<div style="position: absolute; top: 14px; left: -36px; width: 80px; font-weight: 900;">结束</div>',
          '</div>',
        ].join(""),
        controller: ["$scope", function($scope) {
          this.create = function(element) {};
        }],
        link: function($scope, element, attrs, controller) {
          controller.create(element);
        }
      };
    })
  .directive(
    "progressStep",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<a name="progress-step-{{data.key}}" class="progress-step" href="{{getHistoryUrl()}}" target="_blank" ng-class="{true:\'success\', false:\'revoked\'}[isSuccess()]" tooltip data-title="版本标识：{{data.package.version}}">', // tooltip data-title="{{getDeploymentVersion(data.package)}}"
          '<div style="position: absolute; top: -28px; left: -36px; width: 80px; font-weight: 900;" ng-bind="data.package.id"></div>',
          '<div style="position: absolute; top: 8px; left: -36px; width: 80px; font-weight: 100;" ng-bind="data.updatedAt.substring(0, 10)"></div>',
          '<div style="position: absolute; top: 20px; left: -36px; width: 80px; font-weight: 100;" ng-bind="data.updatedAt.substring(11, 19)"></div>',
          '</a>',
        ].join(""),
        controller: ["$scope", function($scope) {
          this.create = function(element) {
            $scope.isSuccess = function() {
              return $scope.data.status === 'SUCCESS';
            };
            $scope.getHistoryUrl = function() {
              var history = $scope.data || {},
                group = history.group || {};
              return ["/#/view/deployments/single?", URL_PARAMS.APP, "=", history.application, "&", URL_PARAMS.GROUP, "=", group.id, "&", URL_PARAMS.DEPLOYMENT, "=", history.id].join("");
            };
          };
        }],
        link: function($scope, element, attrs, controller) {
          controller.create(element);
        }
      };
    }).directive(
    "progressStep2",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<div name="progress-step-{{data.key}}" class="progress-step {{data.status | lowercase}}" ng-click="showBatchDetails(data)" style="cursor: pointer;">',
          '<div style="position: absolute; top: 14px; left: -36px; width: 80px; font-weight: 900;" ng-bind="data.index"></div>',
          '</div>',
        ].join(""),
        controller: ["$scope", function($scope) {
          this.create = function(element) {
            $scope.showBatchDetails = function(data) {

              var target = {
                id: data.id,
                name: null
              };

              if (data.forBatch) {
                target.name = "bastion";
              } else if (data.status === 'PENDING') {
                target.name = "pending";
              } else if (data.status === 'DEPLOYING') {
                target.name = "deploying";
              } else {
                target.name = "executed";
              }

              $.licoDialog({
                level: -1,
                destory: false,
                blur: false,
                offset: {
                  top: 0
                },
                show: function(w, layout, attrs) {
                  $scope.$root.$broadcast('dialog.batches.open', {
                    dialog: w,
                    layout: layout,
                    target: target
                  });
                },
                close: function(w, layout, attrs) {
                  $scope.$root.$broadcast('dialog.batches.close', {
                    layout: layout,
                    target: target
                  });
                }
              });
            };
          };
        }],
        link: function($scope, element, attrs, controller) {
          controller.create(element);
        }
      };
    }).directive(
    "coordinate",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<div name="progress-step-coordinate" class="coordinate tooltip fade top in" role="tooltip" style="padding: 0px;">',
          '<div class="tooltip-arrow" style="border-width: 12px 9px 0px 9px; border-top-color: #0b8284; bottom: -8px; margin-left: -9px;"></div>',
          '<div class="tooltip-inner" style="border-radius: 24px; line-height: 24px; height: 24px; width: 24px; background-color:#0b8284; margin: 0px; padding: 0px;">',
          '<b style="letter-spacing: -1.5px; word-break: normal;">now</b>',
          '</div>',
          '</div>'
        ].join(""),
        controller: ["$scope", function($scope) {
          this.create = function(element) {};
        }],
        link: function($scope, element, attrs, controller) {
          controller.create(element);
        }
      };
    });

