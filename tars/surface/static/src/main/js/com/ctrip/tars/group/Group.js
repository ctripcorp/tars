$import("js.util.HashMap", "BootstrapClassLoader");

$import("com.ctrip.tars.group.Contribution");
$import("com.ctrip.tars.util.Chart");
$import("com.ctrip.tars.model.Notification");
$import("com.ctrip.tars.component.chart.Stock");
$import("com.ctrip.tars.util.Id");

//$import("com.ctrip.tars.component.chart.Pie");

$import("com.ctrip.tars.group.Service");

angular.module("com.ctrip.tars.group")
  .controller("com.ctrip.tars.group.Controller", ['$scope', '$rootScope', '$timeout', '$location',
    'com.ctrip.tars.group.Service',
    'com.ctrip.tars.app.Service',
    'com.ctrip.tars.deployment.Service',
    'com.ctrip.tars.component.angular.notification.Service',
    '$filter',
    function($scope, $rootScope, $timeout, $location,
      groupService, appService, deploymentService,
      notifications, $filter) {
      //'com.ctrip.tars.subscriptions.Service',subscriptions,

      $scope.appCharts = [];

      $scope.contribution = new com.ctrip.tars.group.Contribution();

      var urlParams = $scope.getURLParams();

      if (!$scope.group) {
        $scope.group = {
          id: urlParams[URL_PARAMS.GROUP],
          currentDeployment: null //urlParams[URL_PARAMS.DEPLOYMENT]
        };
      }

      $scope.deployment = null;

      $scope.countdownSwitch = false;

      $scope.$on('deployment.group.update', function(event, data) {
        var urlParams = $scope.getURLParams();

        if (urlParams[URL_PARAMS.GROUP] != data.id) {
          return;
        }

        groupService.load({
          group: data.id
        }, {}, function(group) {

          if (group.id && $scope.app.groups.containsKey(group.id)) {
            $scope.app.groups.put(group.id, group);
          }

          var urlParams = $scope.getURLParams();
          if (urlParams[URL_PARAMS.GROUP] == data.id && data.active && group.currentDeployment && !urlParams[URL_PARAMS.DEPLOYMENT] &&
            (($scope.deployment && $scope.deployment.id && group.currentDeployment.id == $scope.deployment.id) || !$scope.deployment)) {
            var params = {};
            params[URL_PARAMS.DEPLOYMENT] = group.currentDeployment.id;
            $scope.forceSearch(params);
            $location.replace();
          }

          group.active = data.active;
          // $scope.$emit('com.ctrip.tars.group.service.update', group);
        });

      });

      if ($scope.group.active) {
        $scope.$parent.$broadcast('deployment.group.update', $scope.group);
      }

      $scope.$on('com.ctrip.tars.group.service.update', function(event, group) {
        var groupChange = (!$scope.group.initial || $scope.group.active != group.active || $scope.group.id != group.id);
        //if (groupChange) {
        //  $scope.getAppScope().$broadcast("group.id.change", {
        //    id: group.id,
        //    origin: $scope.group.id
        //  });
        //}

        var urlParams = $scope.getURLParams();
        if (group.id != urlParams[URL_PARAMS.GROUP]) {
          return;
        }

        $scope.group = group;

        var arimobile = $scope.contribution.getAirmobile();
        if ($scope.group.rollbackable) {
          arimobile.setDisabled(false);
          arimobile.setTitle("回退");
        } else {
          arimobile.setDisabled(true);
          arimobile.setTitle("当前版本之前不存在正确的版本，无法回退。");
        }

        if (!$scope.group.initial) {
          $scope.group.initial = true;
        }

        var currentDeployment = $scope.group.currentDeployment,
          urlParams = $scope.getURLParams(),
          deploymentId = urlParams[URL_PARAMS.DEPLOYMENT];

        if (deploymentId && (!currentDeployment || (currentDeployment && currentDeployment.id != deploymentId))) {
          deploymentService.load({
            deployment: deploymentId
          }, null, function(deployment) {
            deployment.groupChange = groupChange;
            $scope.$parent.$broadcast("com.ctrip.tars.deployment.service.update", deployment);
          });
        } else {
          if (!deploymentId) {
            currentDeployment = {
              id: null,
              running: null,
              application: group.application || urlParams[URL_PARAMS.APP],
              group: group.id || urlParams[URL_PARAMS.GROUP]
            };
          }
          currentDeployment.groupChange = groupChange;
          $scope.$parent.$broadcast('com.ctrip.tars.deployment.service.update', currentDeployment);
        }

        /*
		if (!$scope.$$phase) {
			$scope.$apply();
		}*/

        if ($scope.$parent) {
          $scope.$parent.$broadcast("status.rank.update", {
            armistice: false
          });
        }

        return false;
      });

      var statusWatcher = true;
      var statusWatchers = new js.util.HashMap();
      $scope.$on('com.ctrip.tars.deployment.service.update', function(event, data) {

        var urlParams = $scope.getURLParams(),
          deployment = data;
        if (!deployment) {
          deployment = {
            id: urlParams[URL_PARAMS.DEPLOYMENT],
            running: null
          };
        }

        var deploymentChange = (!$scope.deployment && deployment) || ($scope.deployment && !deployment) || ($scope.deployment && deployment && $scope.deployment.id != deployment.id);

        if ($scope.group.active && (data.appChange || data.groupChange || deploymentChange)) {
          $scope.getAppScope().$broadcast("app.current.deployment.id.change", {
            id: deployment.id,
            origin: $scope.deployment ? $scope.deployment.id : null,
            app: deployment.application,
            group: deployment.group
          });

          //var params = {};
          //params[URL_PARAMS.DEPLOYMENT] = deployment.id;
          //$scope.forceSearch(params);
        }

        if (data.appChange || data.groupChange || ((!$scope.deployment || !$scope.deployment.id) && $scope.group.currentDeployment) || deploymentChange) {

          if (!(deployment && deployment.running === false && !$scope.countdownSwitch) && !!($scope.group.currentDeployment && $scope.group.currentDeployment.running)) {

            if (!$scope.$$phase) {
              $scope.$apply();
            }

            var currentDeployment = $scope.group.currentDeployment || {};

            if ($scope.group.active && currentDeployment.id && statusWatcher && !statusWatchers.containsKey(currentDeployment.id)) {

              var content = null,
                text = null,
                buttons = [];

              switch ((currentDeployment.category || "").trim().toLowerCase()) {
                case 'scaleout':
                  content = "正在扩容，请耐心等待扩容完成...";
                  text = "前往正在扩容的发布单<sub>（" + currentDeployment.status + "）</sub>";
                  buttons = [{
                    cls: 'btn-default',
                    text: text,
                    icon: 'external-link',
                    value: 0
                  }];
                  break;
                default:
                  content = "该应用当前正在发布 <sub>（" + currentDeployment.status + "）</sub>";
                  text = "前往发布单<sub>（" + currentDeployment.status + "）</sub>";

                  buttons = [{
                    cls: 'btn-default',
                    text: text,
                    icon: 'external-link',
                    value: 0
                  }];
                  break;
              }

              $.licoMsgbox({
                title: "警告信息",
                content: content,
                icon: 'warning',
                wait: false,
                buttons: buttons,
                handler: function(value, msgbox) {
                  statusWatcher = true;
                  var params = {};
                  switch (value) {
                    case "1":
                      params[URL_PARAMS.DEPLOYMENT] = null;
                      $scope.forceSearch(params);
                      break;
                    case "0":
                    default:
                      var currentDeployment = $scope.group.currentDeployment || {};

                      params[URL_PARAMS.DEPLOYMENT] = currentDeployment.id;
                      $scope.forceSearch(params);

                      $scope.$parent.$broadcast('deployment.group.update', $scope.group);
                      break;
                  }
                }
              });
              statusWatcher = false;
            }
          }
        }
        if (!($scope.deployment && data && $scope.deployment.id != data.id)) {
          data.countdown = false;
          if (data.running) {
            data.countdown = true;
          } else if ($scope.deployment && $scope.deployment.countdown) {
            //countdown
            var Contribution = com.ctrip.tars.group.Contribution,
              Notification = com.ctrip.tars.model.Notification;

            //倒计时
            $scope.countdownSwitch = true;

            if ($scope.getCoolDownSection()) {
              $scope.setCoolDownSection();

              $scope.countdownSwitch = false;

              var params = {};
              params[URL_PARAMS.DEPLOYMENT] = null;
              $scope.forceSearch(params);

              $scope.$parent.$broadcast('deployment.group.update', $scope.group);

              notifications.add(new Notification(Notification.MESSAGE, $scope.app.name, Contribution[data.status], function() {}));
            } else {
              $scope.$emit("countdown.update", 3000, {
                handler: function() {
                  $scope.countdownSwitch = false;

                  var params = {};
                  params[URL_PARAMS.DEPLOYMENT] = null;
                  $scope.forceSearch(params);

                  $scope.$parent.$broadcast('deployment.group.update', $scope.group);

                  notifications.add(new Notification(Notification.MESSAGE, $scope.app.name, Contribution[data.status], function() {}));
                },
                desc: '发布结束（ ' + data.status + ' ），即将返回工作中状态，请稍后',
                buttons: [{
                  cls: 'default',
                  icon: 'hand-o-right',
                  text: '返回工作中'
                }, {
                  cls: 'warning',
                  icon: 'history',
                  text: '穿越回历史',
                  handler: function() {
                    $scope.countdownSwitch = false;

                    var timestamp = new Date().getTime();

                    var params = {};
                    params[URL_PARAMS.DEPLOYMENT] = $scope.deployment.id;
                    params[URL_PARAMS.TIMESTAMP] = timestamp;
                    $scope.forceSearch(params);

                    $scope.$parent.$broadcast('deployment.group.update', $scope.group);

                    notifications.add(new Notification(Notification.MESSAGE, $scope.app.name, Contribution[data.status], function() {}));
                  }
                }]
              });
            }
          }
        }
        $scope.deployment = data;

        /*
    		if (!$scope.$$phase) {
    			$scope.$apply();
    		}*/

        if (!$scope.countdownSwitch) {
          var history = $scope.isHistoryView();
          urlParams = $scope.getURLParams();

          /*
          if (history) {
            $scope.setSkin("skin-history skin-blue");
          } else {
            $scope.setSkin();
          }
          */

          $scope.setBreadcrumb([{
            text: history ? "发布历史" : "应用发布"
          }, {
            text: $scope.app.name + ' (AppId：' + $scope.app.id + ')' //$filter('short2')($scope.app.name)
          }]);

          if (deployment && deployment.id) {
            if ($scope.$root) {
              $scope.$root.$broadcast("status.rank.update", {
                warZone: "APP",
                tactics: deployment.flavor,
                warStage: (($scope.group.currentDeployment && $scope.group.currentDeployment.id === deployment.id) && (deployment.status === 'SUCCESS' || deployment.status === 'REVOKED')) || deployment.running ? "DEPLOYING" : (history ? "HISTORY" : "WORKING"),
                battle: deployment.status,
                deployment: deployment
              });
            }
            $scope.$broadcast('plumb.refresh', {
              app: deployment.application,
              deployment: deployment.id,
              status: $scope.contribution
            });
          } else {
            if ($scope.$root) {
              $scope.$root.$broadcast("status.rank.update", {
                tactics: "ROLLOUT",
                warZone: "APP",
                warStage: "WORKING",
                battle: "NONE"
              });
            }
            $scope.$broadcast('plumb.refresh', {
              app: $scope.app.id,
              group: $scope.group.id,
              deployment: null,
              status: $scope.contribution
            });
          }
        }
        return false;
      });

      $scope.getValidParams = function() {
        var urlParams = $scope.getURLParams();
        var group = $scope.group || {};
        var deployment = $scope.deployment || {};
        return {
          app: deployment.application || $scope.app.id || urlParams[URL_PARAMS.APP],
          deployment: deployment.id || urlParams[URL_PARAMS.DEPLOYMENT] || (group.currentDeployment || {}).id,
          group: deployment.group || group.id || urlParams[URL_PARAMS.GROUP]
        };
      };

      $scope.isHistoryView = function() {
        //var urlParams = $scope.getURLParams();
        //return (!!urlParams[URL_PARAMS.DEPLOYMENT] && urlParams[URL_PARAMS.DEPLOYMENT] != $scope.app.currentDeployment);
        return $scope.deployment && $scope.deployment.running === false && !$scope.countdownSwitch;
      };

      $scope.hasRunningDeployment = function() {
        return !!$scope.group.currentDeployment;
      };

      $scope.setCoolDownSection = function(flag) {
        $scope.cooldown = !!flag;
      };
      $scope.getCoolDownSection = function(flag) {
        return !!$scope.cooldown;
      };

      $scope.getIntervalTimerTerminator = function() {
        return $scope.isHistoryView();
      };

      $scope.$on('status.rank.update', function(event, data) {

        /*
    		if (data.warZone != null) {
    			$scope.contribution.setWarZone(data.warZone);
    		}
    		if (data.warStage != null) {
    			$scope.contribution.setWarStage(data.warStage);
    		}
    		if (data.battle != null) {
    			$scope.contribution.setBattle(data.battle);
    		}
    		*/
        if (!Object.isNull(data.warZone) && !Object.isNull(data.warStage) && !Object.isNull(data.battle)) {
          $scope.contribution.update(data, function() {
            if (this.isWithdrawal()) {}

            if (this.isBraked()) {
              $scope.$emit("cover.show");
              $scope.$emit("ripple.start");
            } else {
              $scope.$emit("cover.hide");
              $scope.$emit("ripple.stop");
            }
          });
        }

        if (!Object.isNull(data.allies)) {
          $scope.contribution.setAllies(data.battle, data.allies);
        }
        if (!Object.isNull(data.armistice)) {
          $scope.contribution.setArmistice(data.armistice);
        }

        if (data.battle === 'BEFORE_CREATE') {
          statusWatcher = false;
        }

        if (data.battle === 'CREATE_FAILURE') {
          statusWatcher = true;
        } else if (data.battle === 'CREATE_SUCCESS') {
          if (!Object.isNull(data.deployment)) {
            statusWatchers.put(data.deployment.id, data.battle);
          }
          statusWatcher = true;
        }

        return false;
      });

      $scope.favorite = function() {
        var username = $scope.user.getUsername();
        var app = appService.getData();
        // $rootScope.$broadcast('subscriptions.favorite.send', app);
        if (app.favorite) {
          subscriptions.unfavorite(app.webId, username, function() {
            app.favorite = "";
            app.subscribed = false;
            $rootScope.$broadcast('com.ctrip.tars.app.service.update', app);
          });
        } else {
          subscriptions.favorite(app.webId, username, function() {
            app.favorite = "active";
            app.subscribed = true;
            $rootScope.$broadcast('com.ctrip.tars.app.service.update', app);
          });
        }
      };

      $scope.initial = function() {
        /*
        $scope.$on('expand.fullscreen.app', function(event, data) {
          var currentSlideIndex = $scope.slider.getCurrentSlide();
          data.component.append($('.bxslider-app-detail li:nth-child(' + (currentSlideIndex + 1) + ')').children());

          $scope.appCharts[currentSlideIndex].getChart().setSize(data.width, data.height, true);
          return false;
        });

        $scope.$on('compress.original.app', function(event, data) {
          var currentSlideIndex = $scope.slider.getCurrentSlide();

          var slider = $('.bxslider-app-detail li:nth-child(' + (currentSlideIndex + 1) + ')');

          var width = slider.width() || slider.parent().width(),
            height = slider.height() || slider.parent().height();

          $scope.appCharts[currentSlideIndex].getChart().setSize(width, height, true);

          data.component.children().appendTo(slider);

          return false;
        });

        $(".jumbotron .component").css({
          width: $(".jumbotron").height(),
          height: $(".jumbotron").width()
        });

        var getEchoType = function(echo) {
          var type = null;
          switch (echo) {
            case 'app-detail':
              type = 'detail';
              break;
            case 'app-detail-exception':
              type = 'exception';
              break;
            case 'app-detail-server':
              type = 'host';
              break;
            default:
              break;
          }
          return type;
        };
        $(document).on("click", "em[role='expand-fullscreen']", function() {

          var echo = $(this).attr("data-echo-type");
          var key = $(this).attr("data-echo-key");

          $(".jumbotron").fadeIn(function() {

            var component = $(this).find(".component");

            var height = $(this).height(),
              width = $(this).width();

            var type = getEchoType(echo);
            if (type) {
              $rootScope.$broadcast('expand.fullscreen.' + type, {
                component: component,
                height: width,
                width: height,
                key: key
              });
            }

          });

          $(".jumbotron em[role='compress-original']").attr({
            "data-echo-type": echo,
            "data-echo-key": key
          });
        });

        $(".jumbotron").on("click", "em[role='compress-original']", function() {

          var echo = $(this).attr("data-echo-type");
          var key = $(this).attr("data-echo-key");

          $(".jumbotron").fadeOut(function() {

            var component = $(this).find(".component");

            var type = getEchoType(echo);
            if (type) {
              $rootScope.$broadcast('compress.original.' + type, {
                component: component,
                key: key
              });
            }

          });

          $(this).attr({
            "data-echo-type": null,
            "data-echo-key": null
          });
        });*/
      };

      $scope.getPos = function() {
        var position = null,
          top = 0,
          right = 0;

        if ($scope.isSingle()) {
          position = "absolute";
          top = 20;
          right = 16;
        } else {
          position = "absolute";
          top = 28;
          var item = $(".airmobile").parents(".item"),
            flow = item.parents(".flow");

          var width = flow.width(),
            w = item.width(),
            pos = item.position() || {
              left: 0
            },
            left = pos.left;

          right = -width + left + w + 24;
        }

        return {
          position: position, //"fixed",
          top: top,
          right: right
        };
      };

      $scope.monitors = (function() {
        var monitors = new js.util.HashMap();
        monitors.put("Console", false);
        monitors.put("Servers", false);
        monitors.put("Histories", false);
        monitors.put("Exceptions", true);
        monitors.put("Events", true);
        return monitors;
      })();

      $scope.isReady = function() {
        var itr = $scope.monitors.values().iterator();
        while (itr.hasNext()) {
          if (!itr.next()) {
            return false;
          }
        }
        return true;
      };

      $scope.$on("deployment.window.ready", function(e, name) {
        $scope.monitors.put(name, true);
      });

      $scope.wakeup = function() {
        $timeout(function() {
          if ($scope.isReady()) {
            $scope.initial();
          } else {
            $scope.wakeup();
          }
        }, 100, false, null);
      };

      $scope.wakeup();

    }
  ]);

