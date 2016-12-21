$import("js.lang.System", "BootstrapClassLoader");
$import("js.lang.StringBuffer", "BootstrapClassLoader");

$import("com.ctrip.tars.group.rollout.CommandGroup");
$import("com.ctrip.tars.group.rollout.Settings");
$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.util.Id.isValid");

angular.module("com.ctrip.tars.group.rollout", [])
  .controller("com.ctrip.tars.group.rollout.Controller", ['$scope', '$rootScope', '$location',
    'com.ctrip.tars.app.Service',
    'com.ctrip.tars.batch.Service',
    'com.ctrip.tars.deployment.Service',
    function($scope, $rootScope, $location, service, batchService, deploymentService) {
      $scope.configration = false;
      $scope.steps = [{
        name: "选择发布包",
        progress: "doing" // doing done todo error
      }, {
        name: "填写发布配置",
        progress: "todo" // doing done todo error
      }, {
        name: "确认发布",
        progress: "todo" // doing done todo error
      }];

      // 填写发布配置
      $scope.settings = new com.ctrip.tars.group.rollout.Settings();

      $scope.size = {
        height: 0
      };

      $scope.getLocation = function() {
        return $location;
      };

      $scope.resetStep = function() {
        $scope.steps[0].progress = "doing";
        $scope.steps[0].status = '';
        for (var i = 1, len = $scope.steps.length; i < len; i++) {
          $scope.steps[i].progress = "todo";
          $scope.steps[i].status = '';
        }
      };

      $scope.disabledStep = function(index) {
        for (var i = 0, len = $scope.steps.length; i < len; i++) {
          $scope.steps[i].status = (i == index) ? 'error' : '';
        }
      };
      $scope.isActive = function() {
        var indexOfDoing = $scope.getIndexOfDoing();
        var dispatcherContrl = angular.element($("#com-ctrip-tars-dispatcher-Controller")).scope();
        var packagesContrl = angular.element($("#com-ctrip-tars-packages-Controller")).scope();

        var disabled = false,
          validateMsg = new js.lang.StringBuffer(),
          steps = $scope.steps,
          d = null,
          params = dispatcherContrl.getURLParams();

        map = new js.util.HashMap();
        map.put(0, 0);
        map.put(1, 1);
        map.put(2, 1);
        switch (indexOfDoing) {
          case 2:
          case 1:
            d = !$scope.settings.isValidAll();
            disabled = disabled || d;

            if (d) {
              validateMsg.append("发布配置填写不正确；");
              $scope.disabledStep(1);
            } else if (!disabled) {
              steps[indexOfDoing].status = '';
            }

          case 0:
            d = !packagesContrl || !packagesContrl.getSelectedBuilder().id;
            disabled = disabled || d;

            if (d) {
              validateMsg.append("请选择有效的发布包；");
              $scope.disabledStep(0);
            } else if (!disabled) {
              steps[indexOfDoing].status = '';
            }

          default:
            d = !($scope.app && $scope.app.id) && !params[URL_PARAMS.APP]; //!appContrl.app.id;
            disabled = disabled || d;
            if (d) {
              validateMsg.append("请在url中输入application的主键id；");
            } else if (!disabled) {
              steps[indexOfDoing].status = '';
            }
        }

        $scope.validateMsg = validateMsg.toString();
        return {
          active: !disabled,
          msg: validateMsg
        };
      };

      $scope.getActiveCommands = function() {
        var commandGroup = com.ctrip.tars.group.rollout.CommandGroup.getInstance(),

          indexOfDoing = $scope.getIndexOfDoing(),
          commands = commandGroup.getCommands("step-" + indexOfDoing) || [];

        var validate = $scope.isActive();
        commands[map.get(indexOfDoing)].setActive(validate.active);
        return commands;
      };

      $scope.getIndexOfDoing = function() {
        var steps = $scope.steps;
        if (steps && steps.length > 0) {
          for (var i = 0, len = steps.length; i < len; i++) {
            if (steps[i].progress == 'doing') {
              return i;
            }
          }
        }
        return 0;
      };

      $scope.getDoingError = function() {
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


      $scope.getDoingSuccess = function() {
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
          /*
    			var i = $scope.getIndexOfDoing(),
    				len = steps.length;
    			percent = 100 * i / (len - 1);
    			*/
        }
        if (js.lang.System.getEnv("isIE")) {
          $(".flowstep-wapper.scope-" + $scope.$id).find(".success").css({
            "width": percent + "%"
          });
        }
        return percent;
      };

      $scope.previewBatches = function() {
        var params = $scope.getValidParams();
        batchService.load({
            group: params.group
          }, {
            flavor: $scope.settings.values.flavor,
            batch_pattern: $scope.settings.getTranslatedValue("batch_pattern")
          },
          //$scope.settings.values.group,
          function(batches) {
            $scope.batches = batches;
            $scope.errors = null;
            //$scope.originBatchPattern = originBatchPattern;
            //$scope.originGroup = group;
          },
          function(errors) {
            $scope.batches = {};
            $scope.errors = errors;
            //$scope.originBatchPattern = originBatchPattern;
            //$scope.originGroup = group;
          });
      };
      $scope.getSelectedBuilder = function() {
        var packagesContrl = null;
        var pc = $("#com-ctrip-tars-packages-Controller");
        if (pc.length > 0) {
          packagesContrl = angular.element(pc).scope();
        }
        return packagesContrl ? packagesContrl.getSelectedBuilder() : {};
      };

      $scope.$on('dialog.rollout.config.begin', function(event, data) {
        $scope.configration = true;

        var params = $scope.getValidParams();

        //reset step.
        $scope.resetStep();

        //reset settings.
        $scope.settings.reset();

        //last success config
        deploymentService.getLastSuccessConfig(params, function(data) {
          if (data && data.results && data.results.length >= 1) {
            var values = data.results[0].config;
            if (values) {
              $scope.settings.reset({
                batchPattern: parseInt(values.batchPattern),
                pauseTime: values.pauseTime / 60,
                startupTimeout: values.startupTimeout / 60,
                verifyTimeout: values.verifyTimeout / 60,
                ignoreVerifyResult: values.ignoreVerifyResult,
                restartAppPool: values.restartAppPool,
                manual: values.mode == 'm'
              });
            }
          }
        });

        var params = $scope.getValidParams();

        //last success config
        deploymentService.getLastSuccessConfig(params, function(data) {
          if (data && data.results && data.results.length >= 1) {
            var values = data.results[0].config;
            if (values) {
              $scope.settings.values.batchPattern = parseInt(values.batchPattern);
              $scope.settings.values.pauseTime = values.pauseTime / 60;
              $scope.settings.values.startupTimeout = values.startupTimeout / 60;
              $scope.settings.values.verifyTimeout = values.verifyTimeout / 60;
              $scope.settings.values.ignoreVerifyResult = values.ignoreVerifyResult;
              $scope.settings.values.restartAppPool = values.restartAppPool;
            }
          }
        });

        $scope.settings.values.flavor = data.flavor;

        $scope.size.height = data.attrs.height - 192 - 24 - 48 - 16;

        $scope.$broadcast('dialog.rollout.builders.open', data);

        var groups = service.getData().groups;
        $scope.groups = groups.values().toArray();

        $scope.settings.values.group = groups.get(params.group);
        $scope.settings.validate("group");

        $scope.previewBatches();

        if (!$scope.$$phase) {
          $scope.$apply();
        }

        if (js.lang.System.getEnv("isIE")) {
          var height = $scope.size.height;
          data.layout.find(".box-body").css("height", height);

          var buildersScroller = data.layout.find("#builders-scroller");
          buildersScroller.find(".iscroll-scroller").css({
            'minHeight': (height + 32) + 'px'
          });
          buildersScroller.find(".none-builders").css({
            'lineHeight': height + 'px'
          });
        }
        /*
        $("input[name='batchPattern']").ionRangeSlider({
          type: "single",
          grid: true,
          min: 5,
          max: 25,
          step: 5,
          postfix: "%",
          force_edges: false,
          prettify_enabled: true
        });

        $("input[name='pauseTime']").ionRangeSlider({
          type: "single",
          grid: false,
          min: 0,
          max: 30,
          step: 1,
          postfix: "分钟",
          force_edges: false,
          prettify_enabled: true
        });

        $("input[name='startupTimeout']").ionRangeSlider({
          type: "single",
          grid: false,
          min: 0,
          max: 30,
          step: 1,
          postfix: "分钟",
          force_edges: false,
          prettify_enabled: true
        });
        */
        return false;
      });
      $scope.$on('dialog.rollout.config.end', function(event, data) {
        $scope.configration = false;
        return false;
      });

      $scope.getPreviewBatches = function(scope) {

        if (!scope) {
          return "";
        }

        var batches = new js.lang.StringBuffer(),
          flag = false;

        var batchPattern = $scope.settings.getTranslatedValue("batch_pattern"); //scope.batches.batchPattern;
        if (batchPattern) {
          flag = true;
          batches.append("批次划分设置： ").append(batchPattern);
        }

        var group = $scope.settings.values.group;
        if (group) {
          if (flag) {
            batches.append("； ");
          }
          flag = true;
          batches.append("发布至group： ").append(group.name);
        }

        var errors = scope.errors;
        if (errors) {
          if (flag) {
            batches.append("； ");
          }
          batches.append("各批次服务器结果： ").append(errors);
        } else if (scope.batches) {
          var batchServers = scope.batches.result;
          if (batchServers) {
            var len = batchServers.length;
            if (len > 0) {
              if (flag) {
                batches.append("； ");
              }
              flag = true;
              batches.append("各批次服务器结果： ");

              var batchServer = null;
              for (var i = 0; i < len; i++) {
                batchServer = batchServers[i];
                if (i > 0) {
                  batches.append(" + ");
                }

                batches.append(batchServer.count);

                if (batchServer.isFort) {
                  batches.append(" 台堡垒 ");
                } else {
                  batches.append(" 台 ");
                }
              }
            }
          }
        }

        if (flag) {
          batches.append(" 。");
        }
        if (batches.length() > 256) {
          batches.remove(250).append("......");
        }
        return batches.toString();
      };
    }
  ]);

