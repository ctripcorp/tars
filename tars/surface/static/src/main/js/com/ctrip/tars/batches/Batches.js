//$import("com.ctrip.tars.util.Jquery");
//$import("com.ctrip.tars.util.Angular");
//$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.component.chart.Stock");
$import("com.ctrip.tars.util.Chart");
$import("com.ctrip.tars.util.Common");
$import("com.ctrip.tars.model.DeploymentTargetSteps");
$import("com.ctrip.tars.util.Id");
$import("com.ctrip.tars.component.ISlider");

var batches = angular
  .module("com.ctrip.tars.batches", [])
  .service('com.ctrip.tars.batches.Service', ['$rootScope', '$http', function($rootScope, $http) {

    var validate = function(d) {
      d.hashcode = com.ctrip.tars.util.Common.stripscript(d.hashCode());

      d.cpuCurr = d.cpuCurr || 0;
      d.cpuRound = d.cpuRound || 0;
      d.memCurr = d.memCurr || 0;
      d.memRound = d.memRound || 0;
      d.errLogCurr = d.errLogCurr || 0;
      d.errLogRound = d.errLogRound || 0;
      d.fatalLogCurr = d.fatalLogCurr || 0;
      d.fatalLogRound = d.fatalLogRound || 0;
      d.visitCurr = d.visitCurr || 0;
      d.visitRound = d.visitRound || 0;
      d.errorVisitCurr = d.errorVisitCurr || 0;
      d.erBaseline = d.erBaseline || 0;
      d.erBaselineWarning = d.erBaselineWarning || 0;
      d.erBaselineError = d.erBaselineError || 0;
      d.costCurr = d.costCurr || 0;
      d.costRound = d.costRound || 0;

      d.errorVisitCurr = d.visitCurr ? d.errLogCurr / d.visitCurr : 0;

      d.erBaseline = d.erBaseline || 0;
      d.erBaselineWarning = d.erBaseline * 2;
      d.erBaselineError = d.erBaseline * 4;
      return d;
    };

    var override = function(data, target) {
      if (target && target.id) {
        for (var i = 0, len = data.length; i < len; i++) {
          if (data[i].id === target.id) {
            data[i].preference = true;
          }
        }
      }
      return data;
    };

    var overrideTarget = function(data) {
      for (var i = 0, len = data.length; i < len; i++) {
        var d = data[i];
        d.hashcode = com.ctrip.tars.util.Common.stripscript(d.hashCode());

        d.steps = new com.ctrip.tars.model.DeploymentTargetSteps().build(d.status, d.id);
      }
      return data;
    };

    var loadRangeData = function(hostIp, startTime, endTime, callback) {
      $http({
        method: 'GET',

        url: [TEST_URL, "common/chart/host"].join("") //本地测试
      }).success(function(data, status, headers, config) {
        if (data.success) {
          var d = data.data || [];
          for (var i = 0, len = d.length; i < len; i++) {
            d[i] = validate(d[i], data);
          }
          callback(data);
        }
      });
    };

    var loadData = function(deploymentId, filters, callback, target) {
      if (!com.ctrip.tars.util.Id.isValid(deploymentId)) {
        callback([]);
        return;
      }
      $http({
        method: 'GET',
        url: [BASE_URL, "deployments/", deploymentId, "/batches?page=1&page_size=1000&", filters.toQueryString()].join("")
      }).success(function(data, status, headers, config) {
        if ((data.status >= 200 && data.status < 300) || (data.status === 304)) {
          var d = override(data.data.results || [], target);
          service.batches.scour(d, "id");
          callback(d);
        }
      });
    };

    var getTargetsUrl = function(batchId, filter, sorter) {
      if (!batchId) {
        return null;
      }

      var filterQueryString = "";
      if (filter) {
        filterQueryString = "&" + filter.toQueryString();
      }

      var sortersQueryString = "";
      if (sorter) {
        sortersQueryString = "&" + sorter.toQueryString();
      }

      return [BASE_URL, "batches/", batchId, "/targets?page=1&page_size=", getTargetsPageSize(batchId), filterQueryString, sortersQueryString].join("");
    };

    var getTargetsPageSize = function(batchId) {
      var pageSize = 0;
      var deploymentBatch = service.getBatchById(batchId);
      if (deploymentBatch && deploymentBatch.targets) {
        pageSize = deploymentBatch.targets.length;
      }

      pageSize = pageSize || PAGE_SIZE;

      if (pageSize < PAGE_SIZE) {
        return PAGE_SIZE;
      }

      return pageSize;
    };

    var loadTargets = function(url, callback) {
      if (!url) {
        callback({
          count: 0,
          next: null,
          targets: []
        });
        return;
      }
      $http({
        method: 'GET',
        url: url
      }).success(function(data, status, headers, config) {
        if ((data.status >= 200 && data.status < 300) || (data.status === 304)) {
          var d = {
            count: data.data.count,
            next: data.data.next,
            targets: overrideTarget(data.data.results || [])
          };
          callback(d);
        }
      });
    };

    var service = {
      batches: new com.ctrip.tars.util.Fridge(),
      getBatchById: function(id) {
        for (var i = 0, len = this.batches.length; i < len; i++) {
          if (this.batches[i].id == id) {
            return this.batches[i];
          }
        }
        return null;
      },
      clear: function() {
        this.batches.clear();
      },
      update: function(d, callback) {
        $rootScope.$broadcast('batches.update');
        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback.call(this, d);
        }
      },
      loadData: function(deploymentId, filters, callback, target) {
        loadData(deploymentId, filters, function(d) {
          service.update(d, callback);
        }, target);
      },
      updateTargets: function(batch, d, callback) {
        $rootScope.$broadcast('batches.targets.update', batch);
        if (!Object.isNull(callback) && Object.isFunction(callback)) {
          callback.call(this, d);
        }
      },
      firstTargets: function(batch, callback) {
        if (!batch || !batch.id) {
          return;
        }
        var deploymentBatch = this.getBatchById(batch.id);

        if (!deploymentBatch) {
          return;
        }

        if (!deploymentBatch.targets) {
          deploymentBatch.targets = new com.ctrip.tars.util.Fridge();
        } else {
          deploymentBatch.targets.clear();
        }

        deploymentBatch.isLoading = true;
        loadTargets(getTargetsUrl(batch.id, {}), function(d) {
          deploymentBatch.targets.append(d.targets);
          deploymentBatch.next = d.next;
          deploymentBatch.count = d.count;
          service.updateTargets(deploymentBatch, d, callback);
          deploymentBatch.isLoading = false;
        });
      },

      refreshTargets: function(batch, callback) {
        if (!batch || !batch.id) {
          return;
        }

        var deploymentBatch = this.getBatchById(batch.id);

        if (!deploymentBatch) {
          return;
        }

        deploymentBatch.isLoading = true;
        loadTargets(getTargetsUrl(batch.id, {}), function(d) {
          deploymentBatch.targets.scour(d.targets, "id");
          deploymentBatch.next = d.next;
          deploymentBatch.count = d.count;
          service.updateTargets(deploymentBatch, d, callback);
          deploymentBatch.isLoading = false;
        });
      },

      nextTargets: function(batch, callback) {
        if (!batch || !batch.id) {
          return;
        }
        var deploymentBatch = this.getBatchById(batch.id);

        if (!deploymentBatch) {
          return;
        }

        deploymentBatch.isLoading = true;
        loadTargets(deploymentBatch.next, function(d) {
          deploymentBatch.targets.append(d.targets, "id");
          deploymentBatch.next = d.next;
          deploymentBatch.count = d.count;
          service.updateTargets(deploymentBatch, d, callback);
          deploymentBatch.isLoading = false;
        });
      },
      isTargetLoading: function(batch) {
        if (!batch || !batch.id) {
          return;
        }
        var deploymentBatch = this.getBatchById(batch.id);

        if (!deploymentBatch) {
          return;
        }

        return deploymentBatch.isLoading;
      },
      loadRangeData: loadRangeData,
      getTargetsPageSize: getTargetsPageSize
    };
    return service;
  }])
  .controller(
    "com.ctrip.tars.batches.Controller", [
      '$scope', '$timeout',
      'com.ctrip.tars.batches.Service',
      function($scope, $timeout, service) {

        $scope.appBatchsCharts = new js.util.HashMap();
        $scope.sliders = new js.util.HashMap();

        $scope.batches = service.batches;

        $scope.loadData = function(target, callback) {
          var batch_status = "",
            fort_batch = "False";
          switch (target.name) {
            case "pending":
              batch_status = "PENDING";
              break;
            case "deploying":
              batch_status = "DEPLOYING";
              break;
            case "executed":
              batch_status = "SUCCESS,FAILURE";
              break;
            case "bastion":
              fort_batch = "True";
              break;
            default:
              break;
          }
          var params = $scope.getValidParams();
          if (params.deployment) {
            service.loadData(params.deployment, {
              batch_status: batch_status,
              fort_batch: fort_batch
            }, callback, {
              id: target.id,
              name: target.name
            });
          }
        };

        $scope.$on('batches.update', function(event) {
          $scope.batches = service.batches;
          $scope.toggle();

          if (!$scope.$$phase) {
            $scope.$apply();
          }

          return false;
        });
        $scope.$on('batches.targets.update', function(event, batch) {
          $scope.$broadcast("pagination.refresh");
          $timeout(function() {
            if ($scope.scroller["batch-" + batch.id]) {
              $scope.scroller["batch-" + batch.id].refresh();
            }
          }, 1000, false, null);

          return false;
        });
        var timerFlag = false,
          selectedBatch = null,
          target = null;
        $scope.$on('dispatcher.interval.timer', function(event, data) {
          if (!$scope.getIntervalTimerTerminator()) {
            if (timerFlag && target) {
              $scope.loadData(target, function() {
                if (selectedBatch) {
                  service.refreshTargets(selectedBatch);
                }
              });
            }
          }
          event.preventDefault();
          return false;
        });

        $scope.scroller = {};
        $scope.$on('tab.batches.show', function(event, data) {
          selectedBatch = data;
          if (selectedBatch) {
            service.firstTargets(selectedBatch, function() {
              if (!$scope.scroller["batch-" + selectedBatch.id]) {
                $scope.scroller["batch-" + selectedBatch.id] = new com.ctrip.tars.component.IScroll("#batch-" + selectedBatch.id + "-batch-scroller", {
                  bottom: 8,
                  innerHeight: 32,
                  // pageHeight: $scope.size.height || 0,
                  sensitive: {}
                }, function(callback) {
                  service.nextTargets(selectedBatch, callback);
                }, function(callback) {
                  service.refreshTargets(selectedBatch, callback);
                });
              }
              $timeout(function() {
                if ($scope.scroller["batch-" + selectedBatch.id]) {
                  $scope.scroller["batch-" + selectedBatch.id].refresh();
                }
              }, 1000, false, null);
            });
          }
          return false;
        });


        $scope.size = {};

        $scope.$on('dialog.batches.open', function(event, data) {
          timerFlag = true;
          target = data.target;

          $scope.size = {
            height: data.dialog.height() - 152
          };

          $scope.loadData(data.target, function() {
            $scope.toggle();
          });
          return false;
        });
        $scope.$on('dialog.batches.close', function(event, data) {
          timerFlag = false;
          selectedBatch = null;
          target = null;

          for (var i = 0, len = $scope.batches.length; i < len; i++) {
            if ($scope.batches[i].active) {
              $scope.batches[i].active = false;
            }
          }

          for (var name in $scope.scroller) {
            if (name.indexOf("batch-") === 0) {
              $scope.scroller[name].destroy();
            }
          }

          $scope.scroller = {};

          service.clear();

          return false;
        });

        $scope.toggle = function(index) {
          var flag = false,
            batches = $scope.batches,
            len = batches.length;

          //赋予index初始值
          var preference = 0;

          if (Object.isNull(index)) {
            for (var j = 0; j < len; j++) {
              if (batches[j].preference) {
                preference = j;
              }
              if (batches[j].active) {
                index = j;
                break;
              }
            }
          }
          if (Object.isNull(index)) {
            index = preference || 0;
          }

          //判断index合法性
          if (len <= 0 || len <= index) {
            return;
          }

          //判断是否点击已active的tab
          if (batches[index].active) {
            return;
          }

          for (i = 0; i < len; i++) {
            var batch = batches[i];

            if (i === index) {
              batch.active = 'active';
              $scope.$root.$broadcast('tab.batches.show', batch);
            } else {
              batch.active = '';
            }
          }
        };
        /*
        $scope.$on('expander.targets.expand', function(event, data) {
          var urlParams = com.ctrip.tars.util.Angular.getParent($scope, "#com-ctrip-tars-dispatcher-Controller").getURLParams();
          service.loadRangeData(data.target.ip, urlParams[URL_PARAMS.FROM_DATE], urlParams[URL_PARAMS.TO_DATE], function(rd) {

            var cp = com.ctrip.tars.util.Chart.buildSeries(rd, [SERIES.MEMORY, SERIES.CPU, SERIES.FATAL, SERIES.ERROR, SERIES.VISIT,
              SERIES.ERRORVISIT, SERIES.COST
            ]);

            var hashcode = data.target.hashcode;
            if ($scope.appBatchsCharts.get(hashcode)) {
              // $scope.appBatchsCharts[hashcode][0].getChart().redraw();
              // $scope.appBatchsCharts[hashcode][1].getChart().redraw();
              // $scope.appBatchsCharts[hashcode][2].getChart().redraw();
            } else {

              var hostChart = [];

              hostChart[0] = new com.ctrip.tars.component.chart.Stock("app-deployment-batch-target-" + hashcode + "-errorVisit");
              hostChart[0].render(cp.series.get(SERIES.ERRORVISIT), {
                plotLines: cp.plotLines,
                plotBands: cp.plotBands
              });

              hostChart[1] = new com.ctrip.tars.component.chart.Stock("app-deployment-batch-target-" + hashcode + "-visit");
              hostChart[1].render(cp.series.get(SERIES.VISIT), {
                plotLines: [],
                plotBands: []
              });

              hostChart[2] = new com.ctrip.tars.component.chart.Stock("app-deployment-batch-target-" + hashcode + "-log");
              hostChart[2].render(cp.series.get(SERIES.ERROR).concat(cp.series.get(SERIES.FATAL)).concat(
                cp.series.get(SERIES.COST)), {
                plotLines: [],
                plotBands: []
              });

              hostChart[3] = new com.ctrip.tars.component.chart.Stock("app-deployment-batch-target-" + hashcode + "-amount");
              hostChart[3].render(cp.series.get(SERIES.CPU).concat(cp.series.get(SERIES.MEMORY)), {
                plotLines: [],
                plotBands: []
              });

              $scope.appBatchsCharts.put(hashcode, hostChart);

              if ($scope.sliders.get(hashcode)) {
                $scope.sliders.get(hashcode).reflow();
              } else {
                $scope.sliders.put(hashcode, new com.ctrip.tars.component.ISlider(
                  $(".bxslider-app-deployment-batch-target-" + hashcode),
                  {
                    infiniteLoop: false,
                    hideControlOnEnd: true
                }));
              }

            }
            if ($scope.scroller) {
              //$scope.scroller.scroller.refresh();
            }
          });
          return false;
        });

        $scope.$on('expand.fullscreen.host', function(event, data) {
          var currentSlideIndex = $scope.sliders.get(data.key).getCurrentSlide();
          data.component.append($('.bxslider-app-deployment-batch-target-' + data.key + ' li:nth-child(' + (currentSlideIndex + 1) + ')').children());

          $scope.appBatchsCharts.get(data.key)[currentSlideIndex].getChart().setSize(data.width, data.height, true);
          return false;
        });

        $scope.$on('compress.original.host', function(event, data) {
          var currentSlideIndex = $scope.sliders.get(data.key).getCurrentSlide();

          var slider = $('.bxslider-app-deployment-batch-target-' + data.key + ' li:nth-child(' + (currentSlideIndex + 1) + ')');

          var width = slider.width(),
            height = slider.height();

          $scope.appBatchsCharts.get(data.key)[currentSlideIndex].getChart().setSize(width, height, true);

          data.component.children().appendTo(slider);
          return false;
        });
        */

        /*pagination*/
        $scope.setCurrentPage = function(page, currentPage, pageSize, batchId) {
          if ($scope.scroller && $scope.scroller["batch-" + batchId]) {
            if (page > currentPage) {
              $scope.scroller["batch-" + batchId].next();
            } else if (page < currentPage) {
              $scope.scroller["batch-" + batchId].previous();
            }
          }
        };
        $scope.getPagination = function(batchId) {
          var data = service.getBatchById(batchId);
          var pageSize = service.getTargetsPageSize(batchId),
            total = 0,
            length = 0;
          if (data && data.targets) {
            total = data.count;
            length = data.targets.length;
          }
          return {
            pageSize: pageSize,
            total: total > length ? total : length,
            from: length ? 1 : 0,
            to: length || 0
          };
        };
        $scope.reload = function(currentPage, pageSize, batchId) {
          if ($scope.scroller && $scope.scroller["batch-" + batchId]) {
            $scope.scroller["batch-" + batchId].reload();
          }
        };
        $scope.isLoading = function(batchId) {
          return service.isTargetLoading(batchId);
        };

        //$scope.$parent.$parent.$parent.$parent.state++;
      }
    ])
  .directive(
    "liTarget",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        /*scope: {
					id: "@dataid",
					index: "@dataindex",
					hashcode: "@datahashcode",
					onMore: "&"

					//ip: "@dataip",
					//hostname: "@datahostname",
					//status: "@datastatus",
					//costCurr: "@datacostcurr",
					//visitCurr: "@datavisitcurr",
					//fatalLogCurr: "@datafatallogcurr",
					//errLogCurr: "@dataerrlogcurr",
					//memCurr: "@datamemcurr",
					//cpuCurr: "@datacpucurr"
				},
				*/
        controller: ["$scope", function($scope) {
          //$scope.target = $scope.$parent.batch.targets[$scope.index];

          $scope.getFlowsteps = function() {
            return $scope.target.steps;
          };

          $scope.$watch("target.steps", function(newData, oldData) {
            $scope.$broadcast("flowstep.update", newData);
          });
        }],

        template: [

          '<div class="item details container-fluid">',

          '<div class="row">',
          '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">',

          '<div style="padding: 0px 8px 0px 72px;">',

          '<div class="pull-left img-circle photo-tip active" style="position: absolute; top: 50%; margin: -20px auto auto -56px;">',
          '<i class="fa fa-sitemap"></i>',
          '</div>',

          '<div class="column details item-content" style="border-left: 0px none; padding-left: 0px; padding-right: 8px;">',
          '<expander name="targets">',
          '<expander-head>',


          '<div class="container-fluid">',
          '<div class="row">',
          '<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12" style="padding: 0px;">',
          '<h5>{{target.server.ipAddress}}＜{{target.server.hostname}}＞</h5>',
          '</div>',
          '<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12" style="padding: 0px;">',
          '<flowstep></flowstep>',
          '</div>',
          '</div>',
          '</div>',

          '<p class="track">',
          'Group id：{{target.server.group}}<br>',
          '</p>',
          //'<p class="list-group-item-text details" style="color: #757575; font-size: 11px; line-height: 18px;">',
          //'<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> {{monitorTime}}</small>',
          //'</p>',
          '</expander-head>',
          '<expander-body>',
          //'<div class="details"><p style="padding-left: 15px;">',
          //'group id：{{target.server.group}}<br>',
          //'group name：{{target.server.group.name}}<br>',
          //'group siteName：{{target.server.group.siteName}}<br>',
          //'group vdirPath：{{target.server.group.vdirPath}}<br>',
          //'group appPoolName：{{target.server.group.appPoolName}}<br>',
          //'group physicPath：{{target.server.group.physicPath}}<br>',
          //'</p></div>',
          /*
          '<ul class="bxslider bxslider-app-deployment-batch-target-{{target.hashcode}}" style="width: 100%; height: 96px; margin-bottom: 0px; padding: 0px;">',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-deployment-batch-target-{{target.hashcode}}-errorVisit" style="height:96px"></div></li>',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-deployment-batch-target-{{target.hashcode}}-visit" style="height:96px"></div></li>',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-deployment-batch-target-{{target.hashcode}}-log" style="height:96px"></div></li>',
          '<li style="height: 96px;"><div class="chart" id="high-chart-app-deployment-batch-target-{{target.hashcode}}-amount" style="height:96px"></div></li>',
          '</ul>',

          //'<em role="expand-fullscreen" data-echo-type="app-deployment-batch-target" data-echo-key="app-deployment-batch-target" style="position: absolute; right: 0px; margin-top: -12px; z-index: 999; font-size: 12px; line-height: 12px;" class="text-muted pull-right">',
          //'<i class="fa fa-expand"></i>', '</em>',
          */
          '</expander-body>',

          '</expander>',
          '</div>',
          '</div>',
          '</div>',
          '</div>',
          '</div>'
        ].join("")

      };
    })
  .directive(
    "tabBatch",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        controller: ["$scope", function($scope) {

        }],
        template: [
          '<div class="nav-tabpanels"> ',

          '<ul class="nav nav-tabs tab-header">',
          '<li class="{{ batch.active }}" ng-repeat="batch in batches track by $index" ng-click="toggle($index)" name="batch-{{ batch.id }}">',
          '<a href="javascript:void(0)">',
          '<span class="">批次 {{ batch.index }} <span ng-if="batch.fortBatch == true">【堡垒】</span></span>',
          '</a>',
          '</li>',
          '</ul>',

          '<div class="tab-content">',
          '<div class="tab-pane {{ batch.active }}" ng-repeat="batch in $parent.batches">',


          '<div class="box" style="margin-bottom: 0px; background-color: #f5f5f5;" >',
          '<div class="box-header container-fluid">',
          '<div class="row">',
          '<div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">',
          '<h3 class="box-title">',
          '<i class="fa fa-sitemap"></i>&nbsp;主机列表 - 批次{{ batch.index }} ',

          '</h3>',
          '</div>',
          '<div class="col-lg-8 col-md-8 col-sm-12 col-xs-12">',

          '<div class="box-pager navbar-form hidden-sm hidden-xs" role="pagination" style="margin: 0px -10px 0px 0px;">',
          '<div class="form-group has-feedback" ng-controller="com.ctrip.tars.component.angular.pagination.Controller">',
          '<pagination2 data="{{ batch.id }}"></pagination2>',
          '</div>',
          '</div>',
          '</div>',
          '</div>',
          '</div>',

          '<div class="box-body">',
          '<div id="batch-{{ batch.id }}-batch-scroller" style="height: {{ size.height }}px;" ng-style="{ \'height\': \'{{ size.height }}px\' }" class="scroller bg-wall">',
          '<div class="gridster ready iscroll-scroller" style="min-height: {{ size.height + 32 }}px;" ng-style="{ \'minHeight\': \'{{ size.height + 32 }}px\' }">',
          '<div class="timeline-items">',

          '<li-target ng-repeat="target in batch.targets track by target.id" dataid="{{ target.id }}" dataindex="{{ $index }}" datahashcode="{{target.hashcode}}">',
          //datahostname="{{host.server.hostname}}" ',
          //'dataip="{{host.server.ipAddress}}" datastatus="{{ host.status }}" dataerrlogcurr="{{host.errLogCurr}}" ',
          //'datavisitcurr="{{host.visitCurr}}" datacostcurr="{{host.costCurr}}" datacpucurr="{{host.cpuCurr}}"',
          //'datamemcurr="{{host.memCurr}}" datamonitertime="{{host.moniterTime}}" on-more="alert(1);"
          '</li-target>',

          '<div ng-if="batch.targets.length<=0" style="color: #555; height: 332px; text-align: center; line-height: 332px;">',
          '对不起，当前没有集群信息供查看。 </div>',
          '</div>',
          '</div>',
          '</div>',
          '</div>',

          '</div>',
          '</div> ',
          '</div>',
          '</div>',
        ].join("")
      };
    });

