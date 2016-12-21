$import("com.ctrip.tars.component.IPlumb");
$import("js.util.HashMap", "BootstrapClassLoader");
$import("js.lang.StringBuffer", "BootstrapClassLoader");
$import("com.ctrip.tars.util.Id");

var plumb = angular.module("com.ctrip.tars.plumb", []).service('com.ctrip.tars.plumb.Service', ['$rootScope', '$http', function($rootScope, $http) {

  var validate = function(d) {
    return d;
  };

  var targetSteps = new js.util.HashMap();
  targetSteps.put("PENDING", 0);

  targetSteps.put("DISABLING", 1);
  targetSteps.put("DISABLE_FAILURE", 2);
  targetSteps.put("DISABLE_SUCCESS", 3);

  targetSteps.put("DOWNLOADING", 4);
  targetSteps.put("DOWNLOAD_FAILURE", 5);
  targetSteps.put("DOWNLOAD_SUCCESS", 6);

  targetSteps.put("INSTALLING", 7);
  targetSteps.put("INSTALL_FAILURE", 8);
  targetSteps.put("INSTALL_SUCCESS", 9);

  targetSteps.put("VERIFYING", 10);
  targetSteps.put("VERIFY_FAILURE", 11);
  targetSteps.put("VERIFY_SUCCESS", 12);

  targetSteps.put("ENABLING", 13);
  targetSteps.put("ENABLE_FAILURE", 14);
  targetSteps.put("ENABLE_SUCCESS", 15);

  targetSteps.put("FAILURE", 16);
  //targetSteps.put("REVOKED", 0);
  targetSteps.put("SUCCESS", 17);

  var loadDeploymentPlumb = function(deploymentId, callback) {
    if (!com.ctrip.tars.util.Id.isValid(deploymentId)) {
      return;
    }
    $http({
      method: 'GET',
      url: [BASE_URL, "deployments/", deploymentId, "/summary"].join("")
    }).success(function(data, status, headers, config) {
      if ((data.status >= 200 && data.status < 300) || (data.status === 304)) {
        var result = data.data;

        var deploymentJson = {
          children: []
        };

        var doneTargetSteps = 0,
          allServers = 0;

        var vip = {
          id: "element-deployment-" + result.id,
          type: "vip",
          title: "vip",
          text: "", //
          data: [],
          children: []
        };

        var groups = result.groups || [];
        for (var i = 0, len = groups.length; i < len; i++) {

          var group = groups[i];

          var siteName = group.siteName || "";
          if (siteName.length > 20) {
            siteName = siteName.substring(0, 17) + "...";
          }
          var groupJson = {
            id: "element-group-" + group.id,
            type: "ld",
            title: "Group",
            text: siteName,
            connect: {
              reverse: false,
              positive: false,
              style: "solid", //dashed
              text: "100%"
            },
            data: [group.healthCheckUrl],
            children: []
          };

          var bastion = {
              summary: {},
              status: null,
              enabled: false,
              statusDetail: '',
              batches: 0,
              failure: 0,
              servers: 0,
              success: 0,
              revoked: 0
            },
            pending = {
              batches: 0,
              failure: 0,
              servers: 0
            },
            deploying = {
              batches: 0,
              failure: 0,
              servers: 0,
              success: 0,
              revoked: 0,
              index: 0
            },
            executed = {
              batches: 0,
              failure: 0,
              servers: 0,
              success: 0,
              revoked: 0
            };

          var batches = group.batches || [];
          for (var j = 0, length = batches.length; j < length; j++) {
            var batch = batches[j];

            var servers = 0;
            for (var m in batch.summary) {
              servers += batch.summary[m];
              doneTargetSteps += (batch.summary[m] * targetSteps.get(m)) || 0;
            }
            allServers += servers;

            if (batch.fortBatch) {


              if (bastion.servers === 0) {
                bastion.summary = {
                  hostname: group.fort ? group.fort.hostname : "",
                  ipAddress: group.fort ? group.fort.ipAddress : ""
                };
                for (var n in batch.summary) {
                  bastion.statusDetail = n;
                }
              } else {
                bastion.summary = {};
                bastion.statusDetail = '';
              }

              bastion.batches++;
              bastion.servers += servers;

              bastion.status = batch.status == 'PENDING' ? 'todo' : batch.status == 'DEPLOYING' ? 'doing' : 'done';

              if (batch.summary.PENDING || batch.summary.SUCCESS || batch.summary.ENABLE_SUCCESS > 0) {
                bastion.enabled = true;
              }

              bastion.failure += (batch.summary.DISABLE_FAILURE || 0) + (batch.summary.DOWNLOAD_FAILURE || 0) + (batch.summary.INSTALL_FAILURE || 0) + (batch.summary.VERIFY_FAILURE || 0) + (batch.summary.ENABLE_FAILURE || 0) + (batch.summary.FAILURE || 0);
              bastion.success += batch.summary.SUCCESS || 0;
              bastion.revoked += batch.summary.REVOKED || 0;

              continue;
            }

            switch (batch.status) {
              case "PENDING":
                pending.batches++;
                pending.servers += servers;
                break;
              case "DEPLOYING":
                deploying.batches++;
                deploying.servers += servers;
                deploying.failure += (batch.summary.DISABLE_FAILURE || 0) + (batch.summary.DOWNLOAD_FAILURE || 0) + (batch.summary.INSTALL_FAILURE || 0) + (batch.summary.VERIFY_FAILURE || 0) + (batch.summary.ENABLE_FAILURE || 0) + (batch.summary.FAILURE || 0);
                deploying.success += batch.summary.SUCCESS || 0;
                deploying.revoked += batch.summary.REVOKED || 0;
                deploying.index = batch.index;
                break;
              case "SUCCESS":
              case "FAILURE":
              default:
                executed.batches++;
                executed.servers += servers;
                executed.failure += (batch.summary.DISABLE_FAILURE || 0) + (batch.summary.DOWNLOAD_FAILURE || 0) + (batch.summary.INSTALL_FAILURE || 0) + (batch.summary.VERIFY_FAILURE || 0) + (batch.summary.ENABLE_FAILURE || 0) + (batch.summary.FAILURE || 0);
                executed.success += batch.summary.SUCCESS || 0;
                executed.revoked += batch.summary.REVOKED || 0;
                break;
            }
          }

          var text = new js.lang.StringBuffer();
          if (bastion.batches > 0) {

            text.clear();

            if (bastion.servers > 1) {
              text.append("<p class='bastion'><span class='success'>")
                .append(bastion.success)
                .append("</span><span class='count'>&nbsp;/&nbsp;")
                .append(bastion.servers)
                .append("<i class='fa fa-sitemap unit'></i></span>");
            } else {
              text.append("<ol><li class='text-overflow'>")
                .append(bastion.summary.hostname)
                .append("</li><li class='text-overflow'>")
                .append(bastion.summary.ipAddress)
                .append("</li></ol>");
            }

            if (bastion.revoked > 0) {
              text.append("<p class='deploying'><span class='revoked badge-count'>")
                .append("<span class='unit'>终止</span>")
                //.append(bastion.revoked)
                .append("</span></p>");
            }

            if (bastion.failure > 0) {
              text.append("<p class='deploying'><span class='failure badge-count'>")
                .append("<span class='unit'>错误</span>")
                //.append(bastion.failure)
                .append("</span></p>");
            }

            groupJson.children.push({
              id: "element-group-bastion-" + group.id,
              type: "vm",
              name: "bastion",
              status: bastion.status,
              title: "堡垒机",
              text: text.toString(),
              connect: {
                reverse: false,
                positive: false,
                style: bastion.enabled ? "solid" : "dashed", //none
                text: bastion.statusDetail || ""
              },
              data: []
            });
          }

          if (pending.batches > 0) {
            groupJson.children.push({
              id: "element-group-pending-" + group.id,
              type: "task",
              name: "pending",

              status: "todo",
              title: "待执行 <span class='todo'>" + pending.batches + "<span class='unit'>批</span></span>",
              text: "<p class='pending'>" + pending.servers + "<i class='fa fa-sitemap unit'></i></p>",

              connect: {
                reverse: false,
                positive: false,
                style: "solid",
                text: ""
              },
              data: []
            });
          }

          if (deploying.batches > 0) {
            text.clear();

            text.append("<p class='deploying'><span class='success'>")
              .append(deploying.success)
              .append("</span><span class='count'>&nbsp;/&nbsp;")
              .append(deploying.servers)
              .append("<i class='fa fa-sitemap unit'></i></span>");

            if (deploying.revoked > 0) {
              text.append("<span class='revoked badge-count'>")
                .append("<span class='unit'>终止:</span>")
                .append(deploying.revoked).append("</span>");
            }

            if (deploying.failure > 0) {
              text.append("<span class='failure badge-count'>")
                .append("<span class='unit'>错误:</span>")
                .append(deploying.failure)
                .append("</span>");
            }

            text.append("</p>");

            groupJson.children.push({
              id: "element-group-deploying-" + group.id,
              type: "task",
              name: "deploying",
              status: "doing",
              title: "执行中 <span class='doing'><span class='unit'>第</span>" + deploying.index + "<span class='unit'>批</span></span>", //deploying.batches
              text: text.toString(),
              connect: {
                reverse: false,
                positive: false,
                style: "dashed",
                text: "拉出"
              },
              data: []
            });
          }

          if (executed.batches > 0) {
            text.clear();

            text.append("<p class='executed'><span class='success'>")
              .append(executed.success)
              .append("</span><span class='count'>&nbsp;/&nbsp;")
              .append(executed.servers)
              .append("<i class='fa fa-sitemap unit'></i></span>");
            if (executed.revoked > 0) {
              text.append("<span class='revoked badge-count'>")
                .append("<span class='unit'>终止:</span>")
                .append(executed.revoked)
                .append("</span>");
            }

            if (executed.failure > 0) {
              text.append("<span class='failure badge-count'>")
                .append("<span class='unit'>错误:</span>")
                .append(executed.failure)
                .append("</span>");
            }

            text.append("</p>");

            groupJson.children.push({
              id: "element-group-executed-" + group.id,
              type: "task",
              name: "executed",
              status: "done",
              title: "已完成 <span class='done'>" + executed.batches + "<span class='unit'>批</span></span>",
              text: text.toString(),
              connect: {
                reverse: false,
                positive: false,
                style: "solid",
                text: ""
              },
              data: []
            });
          }
          vip.children.push(groupJson);
        }
        deploymentJson.children.push(vip);
        callback(validate(deploymentJson));

        var allTargetSteps = allServers * (targetSteps.size() - 1);
        $rootScope.$broadcast('deployment.progress.update', doneTargetSteps / allTargetSteps, false);
      }
    }).error(function(data, status, headers, config) {
      callback({
        error: true,
        status: status
      });
    });
  };
  var loadGroupPlumb = function(groupId, callback) {
    if (!com.ctrip.tars.util.Id.isValid(groupId)) {
      return;
    }

    $http({
      method: 'GET',
      url: [BASE_URL, "groups/", groupId, "/summary"].join("")
    }).success(function(data, status, headers, config) {
      if ((data.status >= 200 && data.status < 300) || (data.status === 304)) {
        var group = data.data;

        var applicationJson = {
          children: []
        };
        var vip = {
          id: "element-application-" + group.id,
          type: "vip",
          title: "vip",
          text: "", //
          data: [],
          children: []
        };
        var text = new js.lang.StringBuffer();

        var siteName = group.siteName || "";
        if (siteName.length > 20) {
          siteName = siteName.substring(0, 17) + "...";
        }
        var groupJson = {
          id: "element-group-" + group.id,
          type: "ld",
          title: "Group",
          text: siteName,
          connect: {
            reverse: false,
            positive: false,
            style: "solid", //dashed
            text: "100%"
          },
          data: [group.healthCheckUrl],
          children: []
        };

        var packages = group.packages || [];
        var servers = 0,
          version = "";
        for (var j = 0, len2 = packages.length; j < len2; j++) {
          var pack = packages[j];

          text.clear();

          text.append("<p class='deploying'><span class='success'>")
            .append(pack.serverNum)
            .append("</span><span class='count'>&nbsp;&nbsp;")
            .append("<i class='fa fa-sitemap unit'></i></span>")
            .append("</p>");

          version = [pack.version, "(", pack.updatedAt, ")"].join("");
          if (version.length > 18) {
            version = version.substring(0, 15) + "...";
          }
          groupJson.children.push({
            id: "element-group-package-" + group.id + "-" + pack.id,
            type: "task",
            name: "working",
            status: "working",
            title: version, //deploying.batches
            text: text.toString(),
            connect: {
              reverse: false,
              positive: false,
              style: "solid",
              text: ""
            },
            data: []
          });

          servers += pack.serverNum;
        }

        if (group.serverNum > servers) {
          text.clear();
          text.append("<p class='deploying'><span class='success'>")
            .append(group.serverNum - servers)
            .append("</span><span class='count'>&nbsp;&nbsp;")
            .append("<i class='fa fa-sitemap unit'></i></span>")
            .append("</p>");

          groupJson.children.push({
            id: "element-group-package-" + group.id + "-null",
            type: "task",
            name: "working",
            status: "working",
            title: "无版本", //deploying.batches
            text: text.toString(),
            connect: {
              reverse: false,
              positive: false,
              style: "solid",
              text: ""
            },
            data: []
          });
        }
        vip.children.push(groupJson);

        applicationJson.children.push(vip);
        callback(applicationJson);
      }
      $rootScope.$broadcast('deployment.progress.update', 0, true);
    }).error(function(data, status, headers, config) {
      callback({
        error: true,
        status: status
      });
    });
  };
  var loadAppPlumb = function(appId, callback) {
    if (!com.ctrip.tars.util.Id.isValid(appId)) {
      return;
    }

    $http({
      method: 'GET',
      url: [BASE_URL, "applications/", appId, "/summary"].join("")
    }).success(function(data, status, headers, config) {
      if ((data.status >= 200 && data.status < 300) || (data.status === 304)) {
        var result = data.data;

        var applicationJson = {
          children: []
        };

        var vip = {
          id: "element-application-" + result.id,
          type: "vip",
          title: "vip",
          text: "", //
          data: [],
          children: []
        };

        var groups = result.groups || [];
        var text = new js.lang.StringBuffer();
        for (var i = 0, len = groups.length; i < len; i++) {
          var group = groups[i];

          var siteName = group.siteName || '';
          if (siteName.length > 20) {
            siteName = siteName.substring(0, 17) + "...";
          }
          var groupJson = {
            id: "element-group-" + group.id,
            type: "ld",
            title: "Group",
            text: siteName,
            connect: {
              reverse: false,
              positive: false,
              style: "solid", //dashed
              text: "100%"
            },
            data: [group.healthCheckUrl],
            children: []
          };

          var packages = group.packages || [];
          var servers = 0,
            version = "";
          for (var j = 0, len2 = packages.length; j < len2; j++) {
            var pack = packages[j];

            text.clear();

            text.append("<p class='deploying'><span class='success'>")
              .append(pack.serverNum)
              .append("</span><span class='count'>&nbsp;&nbsp;")
              .append("<i class='fa fa-sitemap unit'></i></span>")
              .append("</p>");

            version = [pack.version, "(", pack.updatedAt, ")"].join("");
            if (version.length > 18) {
              version = version.substring(0, 15) + "...";
            }
            groupJson.children.push({
              id: "element-group-package-" + group.id + "-" + pack.id,
              type: "task",
              name: "working",
              status: "working",
              title: version, //deploying.batches
              text: text.toString(),
              connect: {
                reverse: false,
                positive: false,
                style: "solid",
                text: ""
              },
              data: []
            });

            servers += pack.serverNum;
          }

          if (group.serverNum > servers) {
            text.clear();
            text.append("<p class='deploying'><span class='success'>")
              .append(group.serverNum - servers)
              .append("</span><span class='count'>&nbsp;&nbsp;")
              .append("<i class='fa fa-sitemap unit'></i></span>")
              .append("</p>");

            groupJson.children.push({
              id: "element-group-package-" + group.id + "-null",
              type: "task",
              name: "working",
              status: "working",
              title: "无版本", //deploying.batches
              text: text.toString(),
              connect: {
                reverse: false,
                positive: false,
                style: "solid",
                text: ""
              },
              data: []
            });
          }
          vip.children.push(groupJson);
        }
        applicationJson.children.push(vip);
        callback(applicationJson);
      }
      $rootScope.$broadcast('deployment.progress.update', 0, true);
    }).error(function(data, status, headers, config) {
      callback({
        error: true,
        status: status
      });
    });
  };
  var service = {
    data: null,
    update: function(d, callback) {
      $rootScope.$broadcast('plumb.update');
      if (!Object.isNull(callback) && Object.isFunction(callback)) {
        callback.call(this, d);
      }
    },
    loadDeploymentPlumb: function(deploymentId, callback) {
      loadDeploymentPlumb(deploymentId, function(d) {
        service.data = d;
        service.update(d, callback);
      });
    },
    loadGroupPlumb: function(groupId, callback) {
      loadGroupPlumb(groupId, function(d) {
        service.data = d;
        service.update(d, callback);
      });
    },
    loadAppPlumb: function(appId, callback) {

      loadAppPlumb(appId, function(d) {
        service.data = d;
        service.update(d, callback);
      });
    }
  };

  return service;
}]).directive(
  "plumb",
  function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {},
      template: ['<div class="topology jsPlumb" ',
        'style="height: {{ size.height }}px" ng-style="{ \'height\': \'{{ size.height }}px\' }">',
        '</div>'
      ].join(""),
      controller: ["$scope", '$rootScope', '$interval', 'com.ctrip.tars.plumb.Service', function($scope, $rootScope, $interval, service) {
        var height = 376;
        //if ($scope.isSingle()) {
        //  height -= 134;
        //}

        height -= 134;

        $scope.size = {
          height: height
        };

        this.create = function() {
          var colors = $scope.$parent.getColors();
          $scope.iplumb = new com.ctrip.tars.component.IPlumb({
            Container: $scope.element,
            PaintStyle: {
              strokeStyle: colors.strokeStyle,
              lineWidth: 2
            },
            EndpointStyle: {
              fillStyle: colors.fillStyle,
              radius: 1
            }
          }, $scope);
        };

        $scope.redraw = function() {
          if ($scope.iplumb) {
            $scope.iplumb.draw(service.data);
          }
        };

        $scope.$on('plumb.update', function(event) {
          $scope.redraw();
          /*
          if (!$scope.$$phase) {
            $scope.$apply();
          }*/
          return false;
        });

        $scope.$on('plumb.refresh', function(event, data) {
          //$scope.layout();
          if (data.status.warStage.id == "WORKING") {
            if (data.group) {
              service.loadGroupPlumb(data.group);
            } else {
              service.loadAppPlumb(data.app);
            }
          } else if (data.status.warStage.id == "DEPLOYING" || data.status.warStage.id == "HISTORY") {
            service.loadDeploymentPlumb(data.deployment);
          }
          return false;
        });

        $scope.layout = function() {
          var container = $scope.element,
            palette = container.find(".palette"),
            parent = palette.parent(),

            cw = container.width(),
            ch = container.height(),
            pw = palette.width(),
            ph = palette.height(),
            ppw = parent.width(),
            pph = parent.height();

          if (ch >= ph || cw >= pw) {
            container.mCustomScrollbar("update");
            container.mCustomScrollbar("scrollTo", [(ch - ph) / 2, (cw - pw) / 2]);
          }

          if (ppw !== cw || pph !== ch) {
            palette.parent().css({
              width: cw,
              height: ch
            });
          }

          return palette.parent().width() === cw && palette.parent().height() === ch;
        };

        $scope.$on("theme.skin.change", function(event, skin) {
          if ($scope.iplumb) {
            var strokeStyle = null,
              fillStyle = null;
            switch (skin.dest) {
              case "skin-gray":
                strokeStyle = "#212121";
                fillStyle = "#212121";
                break;
              case "skin-blue":
              default:
                strokeStyle = "#0b8284";
                fillStyle = "#0b8284";
                break;
            }
            $scope.iplumb.setOptions({
              PaintStyle: {
                strokeStyle: strokeStyle,
                lineWidth: 2
              },
              EndpointStyle: {
                fillStyle: fillStyle,
                radius: 1
              }
            });
          }
        });

        var refresh = function() {
          var force = $scope.layout();
          $scope.redraw();
          /*
          if (!force) {
            $scope.promise = $interval(function() {
              force = $scope.layout();
              if (force) {
                $interval.cancel($scope.promise);
              }
            }, RESIZE_LISTENER, 0, false, null);
          }
          */
          return true;
        };

        $scope.$on("sidebar.collapse.on", refresh);


        $scope.$on('window.resize', refresh);

      }],
      link: function($scope, element, attrs, controller) {
        $scope.element = element;
        element.css($scope.size);
        controller.create(element);
      }
    };
  });

