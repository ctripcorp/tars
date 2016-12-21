$import("com.ctrip.tars.util.Id");
$import("com.ctrip.tars.apps.multi.filter.MonitorStatus");
$import("js.util.HashMap", "BootstrapClassLoader");

angular.module("com.ctrip.tars.apps.multi", [])
  .controller("com.ctrip.tars.apps.multi.Controller", ['$scope', '$rootScope', '$timeout', '$interval', '$location',
    'com.ctrip.tars.apps.Service',
    '$filter',
    function($scope, $rootScope, $timeout, $interval, $location, service, $filter) {
      service.clear();
      $scope.apps = service.getData().toArray("$$index", false);

      $scope.criteria = {};

      $scope.monitorStatuses = new js.util.HashMap();
      $scope.monitorStatuses.put("idle",
        new com.ctrip.tars.apps.multi.filter.MonitorStatus("idle", "check", "工作中", 32, "20%", "-20px", false, false, false, "#9e9e9e"));
      $scope.monitorStatuses.put("running",
        new com.ctrip.tars.apps.multi.filter.MonitorStatus("running", "spinner", "发布中", 32, "40%", "-20px", false, false, false, "#0b8284"));
      $scope.monitorStatuses.put("failure",
        new com.ctrip.tars.apps.multi.filter.MonitorStatus("failure", "times", "发布失败", 32, "60%", "-20px", false, false, false, "#e51c23"));
      $scope.monitorStatuses.put("braked",
        new com.ctrip.tars.apps.multi.filter.MonitorStatus("braked", "bell", "刹车", 32, "80%", "-20px", false, false, false, "#f39c12"));

      $scope.monitors = $scope.monitorStatuses.values().toArray();
      /* update status i-button count
      var genCountFuncByStatus = function(status) {
        return function reduceCallback(preVal, app) {
          var subStatus = DEPLOYMENT_STATUS[status] || [],
            curDeploy = app.currentDeployment;
          if (!curDeploy && status === 'idle') {
            return preVal + 1;
          } else if (curDeploy && subStatus.indexOf(curDeploy.status) !== -1) {
            return preVal + 1;
          } else {
            return preVal;
          }
        };
      };

      $scope.countFailed = $scope.apps.reduce(genCountFuncByStatus('failure'), 0);
      $scope.countRunning = $scope.apps.reduce(genCountFuncByStatus('running'), 0);
      $scope.countPause = $scope.apps.reduce(genCountFuncByStatus('braked'), 0);
      */

      $scope.monitor = function() {
        var it = $scope.monitorStatuses.values().iterator();
        while (it.hasNext()) {
          it.next().setValue(0);
        }

        $scope.apps.forEach(function(app) {
          var statuses = app.statuses || [],
            monitor = null,
            type = null,
            status = null;

          for (var i = statuses.length - 1; i >= 0; i--) {
            monitor = $scope.monitorStatuses.get(statuses[i]);
            if (monitor) {
              monitor.plus(1);
            }
          }
        });
      };

      $scope.filters = function(data) {
        // filter functions to filter application list
        var allPass = true,
          filters = {
            searchNameAndId: function(data) {
              var search = $scope.criteria.name;
              if (!search || "".equals(search.trim())) {
                return true;
              }
              search = search.trim();
              if (data.name && ("" + data.name).toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                return true;
              } else if (("" + data.id).indexOf(search) !== -1) {
                return true;
              }
              return false;
            },

            statusFilter: function(data) {
              var statusWanted = $scope.criteria.status,
                statuses = data.statuses || [];
              if (!statusWanted || statusWanted === 'all' || statuses.contains(statusWanted)) {
                return true;
              }
              return false;
            }
          };

        Object.keys(filters).forEach(function(ea) {
          allPass = allPass && filters[ea](data);
        });

        return allPass;
      };

      // Bind filter buttons
      $scope.toggleStatusWanted = function(status) {
        if (status === $scope.criteria.status) {
          $scope.criteria.status = 'all';
        } else {
          $scope.criteria.status = status;
        }

        $scope.monitors.forEach(function(ms) {
          ms.setActive(ms.name === $scope.criteria.status);
        });

        $scope.scrollTo();
      };

      $scope.sorters = {
        sort: '$index',
        sort_order: false //true: 'desc', false: 'asc'
      };

      $scope.sorter = function(col) {
        $scope.sorters.sort = col;
        $scope.sorters.sort_order = !$scope.sorters.sort_order;
      };

      $scope.sort = function(data) {
        switch ($scope.sorters.sort) {
          case 'name':
            return data.name;
          default:
            break;
        }
        return data.id;
      };

      //service.first({}, {});
      var appsUpdate = function(apps) {
        $scope.monitor();

        var selected = null,
          active = null;

        if (apps && apps.length > 0 && $scope.selected.size() <= 0) {
          var urlParams = $scope.getURLParams();
          for (var i = apps.length - 1; i >= 0; i--) {
            if (!selected && apps[i].active) {
              selected = apps[i];
            } else if (selected) {} else if (apps[i].id == urlParams.app) {
              selected = apps[i];
            } else if (!selected && i === 0) {
              selected = apps[i];
            } else {}
          }

          if (selected && selected.id && !$scope.isSelected(selected.id)) {
            $scope.selected.push(selected.id);
          }

          if (selected && selected.groups) {
            for (i = selected.groups.length - 1; i >= 0; i--) {
              if (!active && selected.groups[i].active) {
                active = selected.groups[i];
              } else if (active) {
                selected.groups[i].active = false;
              } else if (selected.groups[i].id == urlParams.group) {
                selected.groups[i].active = true;
                active = selected.groups[i];
              } else if (!active && i === 0) {
                selected.groups[i].active = true;
                active = selected.groups[i];
              } else {
                selected.groups[i].active = false;
              }
            }
          }
        }

        $timeout(function() {
          if ($scope.scroller) {
            $scope.scroller.refresh();
            if (selected && active) {
              $scope.scrollTo("#app-" + selected.id + "-group-" + active.id);
            }
          }
        }, 1000, false, null);

        return false;
      };

      // init scroller
      if (!$scope.scroller) {
        $timeout(function() {
          $scope.scroller = new com.ctrip.tars.component.IScroll("div[role='multi-apps-scroller']", {
            top: 0,
            bottom: 0,
            innerHeight: 32,
            sensitive: {}
          }, function(callback) {
            service.next(callback);
          }, function(callback) {
            var app_id = $scope.getURLParams()[URL_PARAMS.APPS] || $scope.getURLParams()[URL_PARAMS.APP];
            if (com.ctrip.tars.util.Id.isValidIds(app_id)) {
              $scope.refreshByVisibleScroller(callback);
            }
          });
        }, 1000, false, null);
      }

      $scope.refreshByVisibleScroller = function(callback) {
        var pages = [];
        if ($scope.scroller) {
          var top = $scope.scroller.getVisibleTopEle(),
            bottom = $scope.scroller.getVisibleBottomEle();
          var data = service.getData();
          var start = 0,
            end = 0;

          var scope = com.ctrip.tars.util.Angular.getScope(top);
          if (scope && scope.app) {
            start = data.getSerialByValue(scope.app);
          }
          scope = com.ctrip.tars.util.Angular.getScope(bottom);
          if (scope && scope.app) {
            end = data.getSerialByValue(scope.app);
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
        } else {
          pages.push(1);
        }

        var app_id = $scope.getURLParams()[URL_PARAMS.APPS] || $scope.getURLParams()[URL_PARAMS.APP];
        for (var i = 0, len = pages.length; i < len; i++) {
          service.refresh(null, {
            app_id: app_id,
            page: pages[i]
          }, null, (i == len - 1 && Object.isFunction(callback)) ? callback : null);
        }
      };

      $scope.scrollTo = function(el) {
        if ($scope.scroller) {
          if (el && !$(el).is(":hidden")) {
            $scope.scroller.scroller.scrollTo(0, -$(el).parents(".app-item").position().top - $(el).position().top + 56, 500);
          } else {
            $scope.scroller.scroller.scrollTo(0, 0, 500);
          }
        }
      };

      $scope.nextAll = function() {
        if (!service.data.next) {
          return;
        }
        service.next($scope.nextAll);
      };

      $scope.$on('com.ctrip.tars.apps.service.update', function(event, data) {
        $scope.apps = service.getData().toArray("$$index", false);

        appsUpdate($scope.apps);

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

      $scope.$on('popout.active', function(event, data) {
        var params = {},
          group = null;
        for (var i = data.groups.length - 1; i >= 0; i--) {
          if (data.groups[i].active) {
            group = data.groups[i].id;
            break;
          }
        }

        params[URL_PARAMS.APP] = data.id;
        params[URL_PARAMS.DEPLOYMENT] = null;
        params[URL_PARAMS.GROUP] = group;
        $scope.forceSearch(params);
        //$rootScope.$broadcast('app.id.change');
      });

      $scope.$on('popout.unactive', function(event, data) {
        for (var i = data.groups.length - 1; i >= 0; i--) {
          data.groups[i].active = false;
        }
      });

      $scope.$watch("criteria.name", function(value, oldValue) {
        if (value !== oldValue) {
          $scope.scrollTo();
        }
      });

      var app_id = $scope.getURLParams()[URL_PARAMS.APPS] || $scope.getURLParams()[URL_PARAMS.APP];
      if (com.ctrip.tars.util.Id.isValidIds(app_id)) {
        service.reset();
        service.first(null, {
          app_id: app_id
        }, null, $scope.nextAll);
      }

      $scope.$on('dispatcher.interval.timer', function(event, data) {
        var app_id = $scope.getURLParams()[URL_PARAMS.APPS] || $scope.getURLParams()[URL_PARAMS.APP];
        if (com.ctrip.tars.util.Id.isValidIds(app_id)) {
          // service.refresh(null, {
          //   app_id: app_id
          // }, {}, function(data) {
          //   appsUpdate(data);
          // });
          $scope.refreshByVisibleScroller();
        }
        return false;
      });

      var layout = function(size) {
        var win = size.win,
          winWidth = win.width,
          origin = size.origin,
          h = 0;

        if (winWidth < 768) {
          h = MAIN_VIEW_POINT + MAIN_VIEW_POINT;
        } else if (winWidth < 992) {
          h = MAIN_VIEW_POINT;
        } else if (winWidth < 1200) {
          h = MAIN_VIEW_POINT;
        } else {
          h = MAIN_VIEW_POINT;
        }

        $scope.size = {
          height: size.win.height - 192 + size.origin.height
        };

        /*
        console.log((h + size.height + 48 * 3 - 64 - 48 - 32) + "********" + (size.win.height - 32 - 40 + 24 + size.origin.height - 64 - 48 - 32));
        */

        return false;
      };

      $scope.$on('parallel.apps.layout.update', function(event, data) {
        layout(data);

        if (!$scope.$$phase) {
          $scope.$apply();
        }

        return false;
      });

      $scope.$emit('parallel.apps.layout.watching', true);

      layout({
        win: {
          width: $(window).width(),
          height: $(window).height()
        },
        origin: {
          width: 0,
          height: 0
        }
      });
    }
  ]).directive(
    "multiAppConfig",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        link: function(scope, element, attributes, actionController) {},
        controller: ["$scope", 'com.ctrip.tars.packages.Service', function($scope, packages) {
          $scope.settings = new com.ctrip.tars.group.rollout.Settings();

          var deployment = $scope.app.currentDeployment;
          var config = deployment ? deployment.config : {};

          packages.first($scope.app.id, null, function(d) {
            for (var i = 0, len = d.length; i < len; i++) {
              d[i].disabled = d[i].status == "SUCCESS" ? false : true;
            }
            $scope.packages = d;
          });

          $scope.settings.setValues({
            package: deployment ? "" + deployment.package : null,
            batchPattern: parseInt(config.batchPattern || '25%'),
            pauseTime: config.pauseTime / 60 || 0,
            startupTimeout: config.startupTimeout / 60 || 0,
            verifyTimeout: config.verifyTimeout / 60 || 0,
            flavor: 'rollout'
          });

          $scope.isValid = function() {
            return !$scope.disabled && $scope.app.id && parseInt($scope.settings.values.package || 0) > 0 && $scope.settings.isValidAll();
          };

          $scope.save = function() {
            $scope.disabled = true;

            var values = $scope.settings.getTranslatedValues();
            var data = {
              application: $scope.app.id,
              package: parseInt($scope.settings.values.package || 0),
              config: values,
              flavor: $scope.settings.values.flavor || "rollout"
            };

            $scope.$root.$broadcast("status.rank.update", {
              tactics: data.flavor.toUpperCase(),
              warZone: "APP",
              warStage: "DEPLOYING",
              battle: "BEFORE_CREATE"
            });

            com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments'].join(""), {
              data: data,
              success: function() {
                $scope.$root.$broadcast("status.rank.update", {
                  tactics: data.flavor.toUpperCase(),
                  warZone: "APP",
                  warStage: "DEPLOYING",
                  battle: "CREATE_SUCCESS",
                  deployment: this
                });
                //等待返回状态成功后执行
                if (com.ctrip.tars.util.Id.isValid(this.id)) {
                  com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', this.id, '/start'].join(""), {
                    success: function() {

                    },
                    exception: function() {
                      $scope.disabled = false;
                    }
                  });
                }
              },
              exception: function() {
                $scope.disabled = false;
                $scope.$root.$broadcast("status.rank.update", {
                  tactics: data.flavor.toUpperCase(),
                  warZone: "APP",
                  warStage: "DEPLOYING",
                  battle: "CREATE_FAILURE"
                });
              }
            });
          };
        }],
        template: [

          '<div class="box ng-scope" style="margin-bottom: 0px; color: #757575; font-size: 12px; font-family: Arial, \'Microsoft YaHei\', Helvetica, sans-serif;">',
          '<div class="box-header">',
          '<h3 class="box-title" style="line-height: 2;"><i class="fa fa-paste"></i>&nbsp;填写发布配置</h3>',
          '</div>',
          '<div class="box-body container-fluid">',

          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<label>AppId：</label>{{ app.id }}',
          '</div>',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<label>共发布至：</label>{{ app.serverNum }} 台服务器',
          '</div>',
          '</div>',

          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<form role="form" class="container-fluid" style="padding: 0px;">',

          '<div class="form-group row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<label for="package">版本选择：</label>',
          '<div>',
          '<select class="form-control" name="package" placeholder="发布版本选择" ',
          'ng-model="settings.values.package">',
          '<option ng-repeat="package in packages track by $index" ng-disabled="{{package.disabled}}" value="{{package.id}}">{{package.version}}({{package.updatedAt}})</option>',
          '</select>',
          '</div>',
          '<div ng-if="!settings.isValid(\'package\')" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 errormsg">',
          '{{ settings.getValidMsg(\'package\') }}',
          '</div>',
          '</div>',
          '</div>',

          /*
          '<div class="form-group row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<label for="batchPattern">发布范围：</label>',
          '<div ng-class="{ false: \'errorarea\' }[settings.isValid(\'group\')]">',
          '<select class="form-control" name="group" placeholder="发布范围选择" ',
          'ng-model="settings.values.group" ng-focus="settings.setActive($event,\'group\')" ng-change="settings.validate(\'group\')">',
          '<option selected="" value="group-1">group-1</option>',
          '<option value="group-2">group-2</option>',
          '<option value="group-3">group-3</option>',
          '</select>',
          '</div>',
          '<div ng-if="!settings.isValid(\'group\')" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 errormsg">',
          '{{ settings.getValidMsg(\'group\') }}',
          '</div>',
          '</div>',
          '</div>',
          */

          '<div class="form-group row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<label for="batchPattern">单个批次拉出上限：</label>',
          '<div ng-class="{ false: \'errorarea\' }[settings.isValid(\'batchPattern\')]">',
          '<input ion-range type="number" class="form-control" name="batchPattern" grid="false" min="5" max="50" step="5" postfix="%" placeholder="单个批次拉出上限（5%~50%）" ng-model="settings.values.batchPattern" ng-change="settings.validate(\'batchPattern\');">',
          '</div>',
          '<div ng-if="!settings.isValid(\'batchPattern\')" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 errormsg">',
          '{{ settings.getValidMsg(\'batchPattern\') }}',
          '</div>',
          '</div>',
          '</div>',

          '<div class="form-group row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<label for="pauseTime">批次间等待时间：</label>',
          '<div ng-class="{ false: \'errorarea\' }[settings.isValid(\'pauseTime\')]">',
          '<input ion-range type="number" class="form-control" name="pauseTime" min="0" max="30" step="1" postfix="分钟" placeholder="批次间等待时间（0~30分钟）" ng-model="settings.values.pauseTime" ng-change="settings.validate(\'pauseTime\')">',
          '</div>',
          '<div ng-if="!settings.isValid(\'pauseTime\')" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 errormsg">',
          '{{ settings.getValidMsg(\'pauseTime\') }}',
          '</div>',
          '</div>',
          '</div>',

          '<div class="form-group row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<label for="startupTimeout">应用启动超时时间：</label>',
          '<div ng-class="{ false: \'errorarea\' }[settings.isValid(\'startupTimeout\')]">',
          '<input ion-range type="number" class="form-control" name="startupTimeout" min="0" max="30" step="1" postfix="分钟" placeholder="应用启动超时时间（0~30分钟）" ng-model="settings.values.startupTimeout" ng-change="settings.validate(\'startupTimeout\')">',
          '</div>',
          '<div ng-if="!settings.isValid(\'startupTimeout\')" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 errormsg">',
          '{{ settings.getValidMsg(\'startupTimeout\') }}',
          '</div>',
          '</div>',
          '</div>',

          '</form>',
          '</div>',
          '</div>',

          '<div class="row" style="text-align: right;">',
          '<div ng-if="!app.currentDeployment" class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<a ink href="javascript:void(0)" ng-click="save()" ng-disabled="!isValid()" ng-class="{false:\'disabled\'}[isValid()]" class="btn btn-warning" role="button" style="margin: 8px 0px 0px 0px; border-radius: 0px;"><i class="fa fa-paper-plane-o"></i> &nbsp; 生产发布</a>',
          '</div>',
          '</div>',


          '</div>',
          '</div>'
        ].join("")
      };
    }).directive(
    "multiApp",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        controller: ["$scope", '$rootScope', '$location', function($scope, $rootScope, $location) {
          $scope.$watch("app.currentDeployment", function(newValue, oldValue) {
            if (com.ctrip.tars.group.Contribution.isBraked({
                warStage: newValue && newValue.running ? "DEPLOYING" : "",
                battle: newValue ? newValue.status : ""
              })) {
              $scope.$emit("ripple.start");
            } else {
              $scope.$emit("ripple.stop");
            }
          });

          $scope.getBriefing = function() {
            var contribution = com.ctrip.tars.group.Contribution;
            var sb = new js.lang.StringBuffer();
            if ($scope.app.currentDeployment && $scope.app.currentDeployment.running) {
              sb.append(contribution.DEPLOYING)
                .append("（")
                .append(contribution[$scope.app.currentDeployment.status])
                .append("）");
            } else {
              sb.append(contribution.WORKING);
            }
            return sb.toString();
          };

          $scope.getTacticsName = function() {
            var contribution = com.ctrip.tars.group.Contribution;
            var sb = new js.lang.StringBuffer();
            if ($scope.app.currentDeployment && $scope.app.currentDeployment.running) {
              sb.append($scope.app.currentDeployment.id)
                .append("（")
                .append(contribution[("" + $scope.app.currentDeployment.flavor).toUpperCase()])
                .append("）");
            }
            return sb.toString();
          };

          $scope.selectGroup = function(group) {
            if (group.active) {
              return;
            }
            var groups = $scope.app.groups;
            for (var i = groups.length - 1; i >= 0; i--) {
              if (group === groups[i] || group.id === groups[i].id) {
                group.active = true;
                $scope.$emit("popout.active", $scope.app);
              } else {
                groups[i].active = false;
              }
            }
          };

          $scope.$on('group.id.change', function(event, data) {
            var index = -1,
              active = 0,
              groups = $scope.app.groups;

            for (var i = groups.length - 1; i >= 0; i--) {
              if (groups[i].id == data.id) {
                index = i;
              }
              if (groups[i].active) {
                active = i;
              }
            }

            if (index === -1) {
              return;
            }

            if (index !== active) {
              groups[active].active = false;
              groups[index].active = true;

              $scope.scrollTo("#app-" + $scope.app.id + "-group-" + groups[index].id);
            }
          });

          /*
          $scope.options = {
            'size': 40,
            'barColor': 'rgb(11, 130, 132)',
            'trackColor': '#bdbdbd',
            'scaleLength': 0,
            'lineCap': 'round',
            'lineWidth': 4,
            'rotate': 0,
            'animate': {
              'duration': 1000,
              'enabled': true
            }
          };
          */
        }],
        template: [
          '<div class="item container-fluid app-item" style="border: 0px; padding: 8px 8px 16px 8px;">',

          //'<div class="row">',
          //'<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          //'<div style="font-size: 100%; color: #757575; text-align: right;">',
          //'<a href="javascript:void(0);" ng-click="notSupport($event);" title="关注此应用（暂未支持）" tooltip style="margin-left: 16px; width: 14px; display: inline-block;"><i class="fa fa-heart"></i></a>',
          //'<a href="javascript:void(0);" ng-click="notSupport($event);" title="分享（暂未支持）" tooltip style="margin-left: 16px; width: 14px; display: inline-block;"><i class="fa fa-share-alt"></i></a>',
          //'<a href="javascript:void(0);" title="更多（暂未支持）" tooltip style="margin-left: 16px; width: 14px; display: inline-block;"><i class="fa fa-ellipsis-v"></i></a>',
          //'</div>',
          //'</div>',
          //'</div>',

          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',
          '<div class="column details" style="border-left: 0px; padding: 0px 8px 0px 16px;">', // padding: 0px 32px 0px 8px;
          '<h5 style="font-size: 16px; word-break: break-word;">{{app.name}} <span style="font-size: 12px;">(AppId：{{app.id}})</span></h5>',

          //'<div ng-if="app.currentDeployment != null" class="track" style="position: relative; font-size: 75%; word-break: break-word;">',
          //'<div style="width: 40px; height: 40px; margin-top: -20px; top: 50%; position: absolute; left: 8px;">',
          //'<span class="easypie" easypiechart percent="percent" options="options" ',
          //'ng-init="percent = app.currentDeployment.percent;">',
          //'<span class="percent" ng-bind="percent" ng-if="origin != true" style="line-height: 40px; font-size: 1em;"></span>',
          //'</span>',
          //'</div>',
          //'<div>', //style="margin-left: 56px;"
          //'<p>Group： {{ app.currentDeployment.group }}<br>',
          //'Deploy： {{ getTacticsName() }}<br>',
          //'待发布版本：{{app.appVersion}} <br>',
          //'待发布范围：{{""}} <br>',
          //'</p>',
          //'<p ng-if="app.currentDeployment != null" class="bage-container" style="padding: 0px; text-align: left;">',
          //'<span class="badge badge-default" style="padding: 1px; background: #bdbdbd; color: #ffffff;" >',
          //'{{ getBriefing() }} ',
          //'</span>',
          //'</p>',
          //'</div>',
          //'</div>',

          //'<bar2 style="margin: auto; width: 100%; padding-left: 8px; height: 24px;"></bar2>',

          //'<div class="pull-right" style="position: absolute; right: 24px; top: 50%; margin-top: -8px;">',
          //'<input class="cycle" type="checkbox" ng-checked="isSelected(popout.id)"><label></label>',
          //'</div>',

          '<p style="color: #757575; font-size: 14px;" ng-if="app.groups.length > 0">',
          'Groups：',
          '</p>',
          '<div id="app-{{app.id}}-group-{{group.id}}" ng-class="{true:\'active\'}[group.active]" ng-click="selectGroup(group)" ng-repeat="group in app.groups track by group.id" class="column last details item-content sub-items" style="min-height: 68px; padding-right: 32px; padding-left: 8px; margin: 4px 4px 4px 24px; word-break: break-all;">',
          '<h5 class="ng-binding ng-scope">{{group.name}}</h5>',
          '<p class="track" style="padding-left: 8px; font-size: 12px;">',
          'groupId： {{group.id}}',
          //'<br/>',
          //'siteName： {{group.siteName}}',
          //'<br/>',
          '</p>',
          '<div class="pull-right" style="position: absolute; right: 24px; top: 50%; margin-top: -8px;">',
          '<input class="cycle" type="checkbox" ng-checked="isSelected(app.id) && group.active">',
          '<label></label>',
          '</div>',
          '</div>',

          '</div>',
          '<div class="consistence" ng-if="!app.consistence" data-toggle="tooltip" tooltip title="此应用下各group中版本不一致"></div>',
          '</div>',
          '</div>',

          '</div>'
        ].join("")
      };
    });

