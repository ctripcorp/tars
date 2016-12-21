$import("js.lang.System", "BootstrapClassLoader");
$import("js.lang.StringBuffer", "BootstrapClassLoader");

$import("com.ctrip.tars.group.rollback.CommandGroup");
$import("com.ctrip.tars.util.Angular");

$import("com.ctrip.tars.group.rollback.Service");

angular.module("com.ctrip.tars.group.rollback")
  .controller("com.ctrip.tars.group.rollback.Controller", ['$scope', '$rootScope', '$location',
    'com.ctrip.tars.group.rollback.Service',
    'com.ctrip.tars.batch.Service',
    function($scope, $rootScope, $location, service, batchService) {
      $scope.configration = false;
      $scope.size = {
        height: 0
      };
      $scope.config = {};

      $scope.getLocation = function() {
        return $location;
      };

      $scope.getPostData = function() {
        var data = service.getData() || {},
          config = $scope.config || {};
        return {
          application: data.application,
          config: {
            batchPattern: config.batchPattern,
            pauseTime: config.pauseTime * 60,
            startupTimeout: config.startupTimeout * 60,
            verifyTimeout: config.verifyTimeout * 60,
            ignoreVerifyResult: !!config.ignoreVerifyResult,
            restartAppPool: !!config.restartAppPool
          },
          id: data.id,
          flavor: "rollback",
          package: data.package ? data.package.id : null,
          group: data.group ? data.group.id : null
        };
      };

      $scope.getSelectedBuilder = function() {
        return service.getData().package;
      };

      $scope.setConfig = function() {
        var config = service.getData().config;
        $scope.config = {
          batchPattern: config.batchPattern,
          pauseTime: config.pauseTime / 60,
          startupTimeout: config.startupTimeout / 60,
          verifyTimeout: config.verifyTimeout / 60,
          ignoreVerifyResult: !!config.ignoreVerifyResult,
          restartAppPool: !!config.restartAppPool,
          group: service.getData().group
        };
      };

      $scope.isActive = function() {
        var disabled = false,
          validateMsg = new js.lang.StringBuffer();

        $scope.validateMsg = validateMsg.toString();
        return {
          active: !disabled,
          msg: validateMsg
        };
      };

      $scope.getActiveCommands = function() {
        var commandGroup = com.ctrip.tars.group.rollback.CommandGroup.getInstance(),

          commands = commandGroup.getCommands("step-0") || [];

        var validate = $scope.isActive();
        commands[0].setActive(validate.active);
        return commands;
      };

      $scope.previewBatches = function() {
        var params = $scope.getValidParams();
        batchService.load({
            group: params.group
          }, {
            flavor: "rollback",
            batch_pattern: service.getData().config.batchPattern
          },
          //service.rollback.group,
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

      $scope.$on('dialog.rollback.config.begin', function(event, data) {
        $scope.configration = true;
        $scope.size.height = data.attrs.height - 192 - 24 - 48 - 16;

        var params = $scope.getValidParams();
        service.load({
          group: params.group
        }, null, function(rollback) {
          $scope.previewBatches();
          $scope.setConfig();
        });

        if (!$scope.$$phase) {
          $scope.$apply();
        }

        return false;
      });

      $scope.$on('dialog.rollback.config.end', function(event, data) {
        $scope.configration = false;
        return false;
      });


      $scope.getPreviewBatches = function(scope) {

        var config = service.getData().config;

        if (Object.isNull(scope) || Object.isNull(config)) {
          return "";
        }

        var batches = new js.lang.StringBuffer(),
          flag = false;

        var batchPattern = config.batchPattern; //scope.batches.batchPattern;
        if (batchPattern) {
          flag = true;
          batches.append("批次划分设置： ").append(batchPattern);
        }

        var group = service.getData().group;
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

