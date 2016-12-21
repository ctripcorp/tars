var app = angular.module("com.ctrip.tars.app", [])
  .controller("com.ctrip.tars.app.Controller", ['$scope', '$rootScope', 'com.ctrip.tars.app.Service', 'com.ctrip.tars.deployment.Service',
    function($scope, $rootScope, service, deploymentService) {

      $scope.getAppScope = function() {
        return $scope;
      };
      $scope.$on('com.ctrip.tars.group.service.update', function(event, group) {
        $scope.selectedGroup = group;
        return false;
      });
      $scope.getDeploymentVersion = function(package) {

        var version = [];

        if (package) {
          if (package.version) {
            version.push(package.version);
          }
          if (package.createdAt) {
            version.push("(");
            version.push(package.createdAt);
            version.push(")");
          }
        }

        return version.join("");
      };
      $scope.getServersCount = function() {
        if (Object.isNull($scope.selectedGroup)) {
          //count += groups[i].serverNum;
          return 0;
        } else {
          return $scope.selectedGroup.serverNum;
        }
      };

      $scope.getLastSuccessfulBuilderVersion = function() {
        if (Object.isNull($scope.selectedGroup) || Object.isNull($scope.selectedGroup.lastSuccessPackage)) {
          return "无版本";
        } else {
          return $scope.getDeploymentVersion($scope.selectedGroup.lastSuccessPackage);
        }
      };

      $scope.getValidParams = function() {
        var urlParams = $scope.getURLParams(),
          group = $scope.selectedGroup || {},
          deployment = group.currentDeployment || {};
        return {
          app: $scope.app.id || urlParams[URL_PARAMS.APP],
          deployment: urlParams[URL_PARAMS.DEPLOYMENT] || deployment.id,
          group: urlParams[URL_PARAMS.GROUP] || group.id
        };
      };

      $scope.isSingle = function() {
        switch ($scope.getPath()) {
          case "/view/details":
          case "/view/multi-app":
          case "/view/multi-app-groups":
          case "/view/deployments/serial":
          case "/view/deployments/parallel":
            return false;
          default:
            return true;
        }
      };

      var urlParams = $scope.getURLParams();
      $scope.app = {
        id: urlParams[URL_PARAMS.APP],
        initial: false
      };

      $scope.$on('com.ctrip.tars.app.service.update', function(event, data) {
        data.initial = true;
        data.importance = "重要";
        //data.appVersion = $scope.getLastSuccessfulBuilderVersion() || "1.0.1";
        data.description = "1.IIS容器部署; 2.按单个应用拉入拉出发布；3.可视化及监控数据辅助显示；";
        data.organization = "R&D 系统研发部";
        data.productLine = "发布工具";
        data.product = "Tars";
        data.owner = "Tars";
        data.ownerMail = "tars@Ctrip.com";
        data.supporter = "tars@Ctrip.com";
        data.supportMail = "tars@Ctrip.com";

        var appChange = false;
        if ($scope.app.id != data.id) {
          /*
          $scope.$root.$broadcast("app.id.change", {
            id: service.app.id,
            origin: $scope.app.id
          });
          */
          appChange = true;
        }

        $scope.app = data;

        $scope.$broadcast("deployment.app.update", data);
      });

      var appWorker = function() {
        var urlParams = $scope.getURLParams();
        service.load({
          app: urlParams.app,
          group: urlParams.group
        }, null, function(app) {});
      };

      $scope.$on('dispatcher.interval.timer', function(event, data) {
        appWorker();
        return false;
      });

      $scope.$on('curr.url.params.change', function(event, urlParams, refers) {
        if ($scope.app.id != urlParams.app) {
          $scope.$root.$broadcast("app.id.change", {
            id: urlParams.app,
            origin: $scope.app.id
          });
        } else if ($scope.selectedGroup && $scope.selectedGroup.id != urlParams.group) {
          $scope.$broadcast('group.id.change', {
            id: urlParams.group,
            origin: $scope.selectedGroup.id
          });
        }
      });

      $scope.$on('app.id.change', function(event, data) {
        appWorker();
      });

      $scope.$on('deployment.ready', function(event, data) {

        if (!urlParams[URL_PARAMS.APP] && !urlParams[URL_PARAMS.GROUP] && urlParams[URL_PARAMS.DEPLOYMENT]) {
          deploymentService.load({
            deployment: urlParams[URL_PARAMS.DEPLOYMENT]
          }, null, function(deployment) {
            var params = {};

            if (urlParams[URL_PARAMS.APPS]) {
              var apps = urlParams[URL_PARAMS.APPS].split(",");

              if (!apps.contains("" + deployment.application)) {
                apps.push("" + deployment.application);
              }
              params.apps = apps.join(",");
            }

            params.app = deployment.application;
            params.deployment = deployment.id;
            params.rop = deployment.ropId;
            params.group = deployment.group;

            $scope.forceSearch(params);
            appWorker();
          });
        } else {
          appWorker();
        }
      });
    }
  ]);

