$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.component.Command");
$import("com.ctrip.tars.util.Id");

$import("com.ctrip.tars.histories.Service");

angular
  .module("com.ctrip.tars.histories")
  .controller(
    "com.ctrip.tars.histories.Controller", [
      '$scope', '$timeout',
      'com.ctrip.tars.histories.Service',
      function($scope, $timeout, service) {
        $scope.scroller = null;
        $scope.histories = service.getData().toArray("$$index", false);
        $scope.$on('com.ctrip.tars.histories.service.update', function(event, data) {
          $scope.histories = service.getData().toArray("$$index", false);

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

        $scope.$on('app.current.deployment.id.change', function(event, data) {
          //if ($scope.isActive()) {
          var params = $scope.getValidParams();
          service.reset();
          service.first({
            app: params.app
          }, {
            //running: "False"
            group: params.group
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
            if (scope && scope.history) {
              start = data.getSerialByValue(scope.history);
            }
            scope = com.ctrip.tars.util.Angular.getScope(bottom);
            if (scope && scope.history) {
              end = data.getSerialByValue(scope.history);
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

            // if (start > 0) {
            //   pages.push(1);
            // }

          } else {
            pages.push(1);
          }
          var params = $scope.getValidParams();
          for (var i = 0, len = pages.length; i < len; i++) {
            service.refresh({
              app: params[URL_PARAMS.APP]
            }, {
              page: pages[i],
              group: params[URL_PARAMS.GROUP]
            }, null, (i == len - 1 && Object.isFunction(callback)) ? callback : null);
          }
        };

        //$scope.$on('tab.histories.hide', function(event, data) {});
        $scope.$on('tab.histories.show', function(event, data) {

          if (!$scope.scroller) {
            $scope.scroller = new com.ctrip.tars.component.IScroll("#histories-scroller", {
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
          $scope.refreshByVisibleScroller();

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

          if ($scope.autofresh.isChecked() && $scope.isActive() && !$scope.getIntervalTimerTerminator()) {
            $scope.refreshByVisibleScroller();
          }
          return false;
        });

        //$scope.$on('expander.histories.expand', function(event, data) {});

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

        $scope.$emit("deployment.window.ready", "Histories");
        return false;
      }
    ])
  .directive(
    "liHistory",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        /*scope: {
					name: "@dataname",
					datetime: "@datadatetime",
					id: "@dataid",
					application: "@dataapplication",
					datetime: "@datadatetime",
					status: "@datastatus",
					batchPattern: "@databatchpattern",
					pauseTime: "@datapausetime",
					verifyTimeout: "@dataverifytimeout",
					startupTimeout: "@datastartuptimeout",
					statusSymbol: "@datastatussymbol",
					statusClass: "@datastatusclass",

					rerollable: "@datarerollable",
					flavor: "@dataflavor",

					packageName: "@datapackagename",
					packageVersion: "@datapackageversion",
					packageTimestamp: "@datapackagetimestamp",

					onMore: "&"
				},*/
        controller: ["$scope", function($scope) {

          $scope.getHistoryUrl = function() {
            var history = $scope.history || {},
              group = history.group || {};
            return ["/#/view/deployments/single?", URL_PARAMS.APP, "=", history.application, "&", URL_PARAMS.GROUP, "=", group.id, "&", URL_PARAMS.DEPLOYMENT, "=", history.id].join("");
          };

          $scope.commands = {
            reroll: new com.ctrip.tars.group.ReRoll({

              warZone: "APP",
              warStage: "DEPLOYING",
              battle: "NONE"
            }, 40, "0px", "0px", false)
          };

          $scope.isRerollable = function() {
            var history = $scope.history;
            return (history.rerollable === true || history.rerollable == "true");
          };
        }],
        link: function(scope, element, attributes, actionController) {
          /*
					element.hover(function() {
						scope.hover = true;
					}, function() {
						scope.hover = false;
					});
					*/
        },
        template: [

          '<div class="item details histories Mon animate-session firstItem container-fluid iscroll-item">',

          //'<div class="border"></div>',
          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',

          '<div style="padding: 0px 8px 0px 72px;">',

          '<div class="pull-left" style="position: absolute; top: 50%; margin: -20px auto auto -72px; width: 72px;">',
          '<div class="column status {{ history.statusClass }}">',
          '{{history.statusSymbol}}',
          '</div>',
          '<div class="text {{ history.statusClass }}">{{ history.status }}</div>',
          '</div>',

          '<div class="column last details item-content {{ history.statusClass }}" style="padding-left: 16px; padding-right: 108px;">',

          //'<div class="t_type" style="position: absolute;right: 4px;top: 4px;color: #52575f;font-size: 18px;"><a href="{{getHistoryUrl()}}" target="_blank"><i class="fa fa-link"></i>&nbsp;{{history.id}}</a></div>',
          //'<div class="room t_type"><a href="{{getHistoryUrl()}}" target="_blank">{{id}}</a></div>', //href="javascript:void(0)" target="_blank" {{getHistoryUrl()}}
          //'<div class="room t_type"><action ng-if="isRerollable()" style="position:relative;" datasize="{{commands.reroll.size}}" dataleft="{{commands.reroll.left}}" ',
          //' datamarginleft="{{commands.reroll.marginLeft}}" datatitle="{{commands.reroll.title}}" dataicon="{{commands.reroll.icon}}" ',
          //' datadisabled="{{ commands.reroll.disabled }}" on-handle="commands.reroll.click(this, $event)"></action></div>',
          //'<div class="room t_type builders"><button class="btn btn-default" ng-if="isRerollable()" ng-click="commands.reroll.click(this, $event)" style="margin:0px;"><i class="fa fa-{{commands.reroll.icon}}"></i>&nbsp;{{commands.reroll.text}}</button></div>',

          '<div class="room t_type builders">',
          '<button class="btn btn-default" tooltip ng-if="isRerollable()" ng-click="commands.reroll.click(this, $event)" datatitle="{{commands.reroll.title}}" style="margin:0px;">',
          '<i class="fa fa-{{commands.reroll.icon}}"></i>&nbsp;{{commands.reroll.text}}',
          '</button>',
          '</div>',

          '<expander name="histories">',
          '<expander-head>',

          '<h5>『 {{ history.updatedAt }} 』『 {{ history.flavor }} 』『 {{ history.package.name }} 』</h5>',
          '<p class="track" style="font-size: 12px;">',
          '<a href="{{getHistoryUrl()}}" target="_blank" style="font-weight: 900; font-size: 14px;">Id：&nbsp;{{history.id}} &nbsp;&nbsp;<span style="font-size:12px;"><i class="fa fa-hand-o-left"></i>&nbsp;更多</span></a><br>',
          'groupId：{{history.group.id}}<br>',
          'groupName：{{history.group.name}}<br>',
          '</p>',

          '</expander-head>',
          '<expander-body>',
          '<p class="track">',

          '忽略点火：{{history.config.ignoreVerifyResult}}<br>',
          '重启应用程序池：{{history.config.restartAppPool}}<br>',
          '单个批次拉出上限：{{history.config.batchPattern}}<br>',
          '批次间等待时间：{{history.config.pauseTime/60}}分钟<br>',
          '应用启动超时时间：{{history.config.startupTimeout/60}}分钟<br>',
          //点火验证耗时：{{history.config.verifyTimeout}}<br>
          '手动按批次执行rollout：{{history.config.mode == "m"}}<br>',
          '编译包名称：{{history.package.name}}<br>',
          '编译包版本：{{history.package.version}}<br>',
          '编译包标识：{{ getDeploymentVersion(history.package) }}',
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

