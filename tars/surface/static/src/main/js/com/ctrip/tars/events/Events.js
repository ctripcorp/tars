$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.component.IScroll");

$import("js.util.HashMap", "BootstrapClassLoader");

var events = angular
  .module("com.ctrip.tars.events", [])
  .service('com.ctrip.tars.events.Service', ['$rootScope', '$http', function($rootScope, $http) {

    var override = function(d) {
      for (var i = 0, len = d.length; i < len; i++) {
        var event = d[i];
        /*if (event.logModule == "agent") {
					event.direction = "left";
				} else {
					event.logModule = event.logModule.substring(0, 7);
					event.direction = "right";
				}
				if (i == 0) {
					event.logLevel = "DEBUG";
				} else if (i == 1) {
					event.logLevel = "INFO";

				} else if (i == 2) {
					event.logLevel = "ERROR";
				} else if (i == 3) {
					event.logLevel = "WARNING";
				} else if (i == 4) {
					event.logLevel = "CRITICAL";

				} else {
					event.logLevel = "";
				}
				*/
        event.levelClass = event.logLevel.toLowerCase();
      }
      return d;
    };

    var getUrl = function(deploymentId, filter, sorter) {
      if (!deploymentId) {
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

      return [BASE_URL, "logs?deploy_id=", deploymentId, "&page=1&page_size=", getPageSize(), filterQueryString, sortersQueryString].join("");
    };

    var getPageSize = function() {
      return service.events.data.length || PAGE_SIZE;
    };

    var loadData = function(url, fn, force) {
      if (!url) {
        fn([]);
        return;
      }
      service.events.isLoading = true;

      $http({
        method: 'GET',
        url: url
      }).success(function(data, status, headers, config) {

        if ((data.status >= 200 && data.status < 300) || (data.status === 304)) {

          service.events.count = data.data.count;
          service.events.next = data.data.next;

          var d = override(data.data.results || []);

          if (!force) {
            service.events.data.append(d);
          } else {
            service.events.data.replace(d, "logId");
          }
          fn(d);
        }

        service.events.isLoading = false;

      });
    };

    var service = {
      events: {
        count: 0,
        next: null,
        isLoading: false,
        data: new com.ctrip.tars.util.Fridge()
      },
      clear: function() {
        this.events.count = 0;
        this.events.next = null;
        this.events.data.clear();
      },

      update: function(d, fn) {
        $rootScope.$broadcast('events.update');
        if (fn) {
          fn.call(this, d);
        }
      },

      first: function(deploymentId, filter, sorter, fn) {
        this.clear();
        loadData(getUrl(deploymentId, filter, sorter), function(d) {
          service.update(d, fn);
        }, true);
      },

      refresh: function(deploymentId, filter, sorter, fn) {
        loadData(getUrl(deploymentId, filter, sorter), function(d) {
          service.update(d, fn);
        }, true);
      },

      next: function(fn) {
        loadData(this.events.next, function(d) {
          service.update(d, fn);
        });
      },
      isLoading: function() {
        return this.events.isLoading;
      },
      getPageSize: getPageSize
    };

    return service;
  }])
  .controller(
    "com.ctrip.tars.events.Controller", [
      '$scope', '$timeout',
      'com.ctrip.tars.events.Service',
      function($scope, $timeout, service) {
        $scope.scroller = null;
        $scope.events = service.events.data;
        $scope.$on('events.update', function(event) {
          $scope.events = service.events.data;

          $scope.$broadcast("pagination.refresh");

          $timeout(function() {
            if ($scope.scroller) {
              $scope.scroller.refresh();
            }
          }, 1000, false, null);

          return false;
        });

        $scope.$on('app.current.deployment.id.change', function(event, data) {
          service.reset();
          service.first(data.id, $scope.getFilters(), $scope.getSorters());
          return false;
        });

        var timerFlag = false;
        $scope.$on('tab.events.hide', function(event, data) {
          timerFlag = false;
        });
        $scope.$on('tab.events.show', function(event, data) {
          timerFlag = true;
          if (!$scope.scroller) {
            $scope.scroller = new com.ctrip.tars.component.IScroll("#events-scroller", {
              bottom: 8,
              innerHeight: 32,
              // pageHeight: $scope.size.height || 0,
              sensitive: {}
            }, function(fn) {
              service.next(fn);
            }, function(fn) {
              var params = $scope.getValidParams();
              service.refresh(params.deployment, $scope.getFilters(), $scope.getSorters(), fn);
            });
          }

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

          if ($scope.autofresh.isChecked() && timerFlag && !$scope.getIntervalTimerTerminator() && !service.isLoading()) {
            var params = $scope.getValidParams();
            service.refresh(params.deployment, $scope.getFilters(), $scope.getSorters());
          }
          return false;
        });

        $scope.$on('expander.events.expand', function(event, data) {
          return false;
        });

        $scope.filters = {};
        $scope.sorters = {
          sort: 'log_timestamp',
          sort_order: 'desc'
        };
        var stepNames = new js.util.HashMap();
        stepNames.put('DISABLING', {
          name: '拉出',
          maps: ["DISABLING", "DISABLE_SUCCESS", "DISABLE_FAILURE"]
        });
        stepNames.put('DOWNLOADING', {
          name: '下载',
          maps: ["DOWNLOADING", "DOWNLOAD_SUCCESS", "DOWNLOAD_FAILURE"]
        });
        stepNames.put('INSTALLING', {
          name: '部署',
          maps: ["INSTALLING", "INSTALL_SUCCESS", "INSTALL_FAILURE"]
        });
        stepNames.put('VERIFYING', {
          name: '点火',
          maps: ["VERIFYING", "VERIFY_SUCCESS", "VERIFY_FAILURE"]
        });
        stepNames.put('ENABLING', {
          name: '拉入',
          maps: ["ENABLING", "ENABLE_SUCCESS", "ENABLE_FAILURE"]
        });
        $scope.setFiltersOfStep = function(value) {
          if (stepNames.get(value)) {
            $scope.filters.deploy_target_status = stepNames.get(value).maps.join(",");
            $scope.stepName = stepNames.get(value).name;
          } else {
            $scope.filters.deploy_target_status = null;
            $scope.stepName = null;
          }
          $scope.query();
        };
        $scope.setFilters = function(filters) {
          $scope.filters = $.extend($scope.filters, filters);
          $scope.setFiltersOfStep(filters.deploy_target_status);
        };
        $scope.getFilters = function() {
          return $scope.filters;
        };
        $scope.setSorters = function(sorters) {
          $scope.sorters = $.extend($scope.sorters, sorters);
          $scope.query();
        };
        $scope.getSorters = function() {
          return $scope.sorters;
        };
        $scope.filter = function(filters) {
          $scope.setFilters(filters);
        };
        $scope.sorter = function(column) {
          $scope.setSorters({
            sort: column,
            sort_order: $scope.sorters.sort_order == 'desc' ? 'asc' : 'desc'
          });
        };
        $scope.query = function() {
          var params = $scope.getValidParams();
          service.first(params.deployment, $scope.getFilters(), $scope.getSorters());
        };


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
            total = service.events.count,
            length = service.events.data.length;
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

        $scope.$emit("deployment.window.ready", "Events");
      }
    ])

.directive(
  "liEvent",
  function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        //appId: "@dataappid",
        //deployId: "@datadeployid",
        //deployStatus: "@datadeploystatus",
        //deployTarget: "@datadeploytarget",
        //deployTargetStatus: "@datadeploytargetstatus",
        //detail: "@datadetail",
        //logLevel: "@datalogLevel",
        //logTimestamp: "@datalogtimestamp",

        id: "@dataid",
        index: "@dataindex"
      },
      controller: ["$scope", function($scope) {
        $scope.event = $scope.$parent.events[$scope.index];
      }],
      template: [
        //'<li class="event {{ event.levelClass }}">',
        //'<div class="content {{ event.direction }}">',
        //'<div class="desc"><div class="thumb event-1">{{ event.logModule }}</div><div class="text">{{ event.logLevel }}</div></div>',
        //'<div class="content-inner">',
        //'<h3>{{event.logTimestamp}} -- [{{ event.deployTargetName }}] &nbsp;&nbsp; [{{ event.deployStatus }}] &nbsp;&nbsp; [{{ event.deployTargetStatus }}] &nbsp;&nbsp; [{{ event.logLevel }}] </h3>',
        //'<p>{{ event.detail }}</p>',
        //'</div>',
        //'</div>',
        //'</li>'



        '<div class="item details events Mon animate-session firstItem">',

        '<div class="border"></div>',

        '<div class="container-fluid">',
        '<div class="row">',
        '<div class="col-lg-1 col-md-2 col-sm-3 col-xs-3">',
        '<div class="column status {{ event.levelClass }}" style="margin: 14% auto auto auto;">',
        '{{statusSymbol}}',
        '</div>',
        '<div class="text {{ event.levelClass }}">{{ event.logLevel }}</div>',
        '</div>',

        '<div class="col-lg-11 col-md-10 col-sm-9 col-xs-9">',
        '<div class="column last details item-content {{ event.levelClass }}" style="cursor: default;">',
        '<expander name="events" style="cursor: default;">',
        '<expander-head>',

        '<div>',
        '<h5 class="">『 {{event.logTimestamp}} 』『 {{ event.deployTargetName }} 』『 {{event.logModule.toUpperCase()}} 』『 发布单状态：{{ event.deployStatus }} 』『 主机状态：{{ event.deployTargetStatus }} 』</h5>',
        '<p class="track">',
        '{{event.detail }}',
        '</p>',
        '</div>',

        '</expander-head>',
        '<expander-body>',
        '<div class="details">',
        '</div>',
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

