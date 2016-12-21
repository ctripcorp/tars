$import("com.ctrip.tars.util.Chart");
$import("com.ctrip.tars.util.Angular");
$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.component.chart.Stock");
$import("com.ctrip.tars.util.Common");
var exceptions = angular
  .module("com.ctrip.tars.exceptions", [])
  .service('com.ctrip.tars.exceptions.Service', ['$rootScope', '$http', function($rootScope, $http) {

    var validate = function(d) {
      d.name = com.ctrip.tars.util.Common.stripscript(d.hashCode());
      d.exceptionType = d.exceptType || '';
      return d;
    };

    var loadData = function(start, end, fn) {


      end = end || (start + PAGE_SIZE);
      $http({
        method: 'GET',

        url: [TEST_URL, "common/clusterException/1972"].join("") //本地测试
      }).success(function(data, status, headers, config) {
        if (data.success) {
          var d = data.data || [];
          for (var i = 0, len = d.length; i < len; i++) {
            if (start > 1) {
              service.exceptions.push(validate(d[i]));
            } else {
              service.exceptions[i] = validate(d[i]);
            }
          }
          fn(d);
        }
      });
    };

    var loadRangeData = function(exceptionType, startTime, endTime, fn) {


      $http({
        method: 'GET',
        url: [TEST_URL, "common/chart/exception"].join("") //本地测试
      }).success(function(data, status, headers, config) {
        if (data.success) {
          var d = data.data || [];
          for (var i = 0, len = d.length; i < len; i++) {
            d[i] = validate(d[i]);
          }
          fn(data);
        }
      });
    };

    var service = {
      exceptions: [],

      update: function(d, fn) {
        $rootScope.$broadcast('exceptions.update');
        if (fn) {
          fn.call(this, d);
        }
      },
      first: function(fn) {
        this.exceptions.clear();
        loadData(1, null, function(d) {
          service.update(d, fn);
        });
      },

      refresh: function(fn) {

        loadData(1, this.exceptions.length, function(d) {
          service.update(d, fn);
        });

      },

      next: function(fn) {
        loadData(this.exceptions.length + 1, null, function(d) {
          service.update(d, fn);
        });
      },
      loadRangeData: loadRangeData
    };
    return service;
  }])
  .controller("com.ctrip.tars.exceptions.Controller", ['$scope', '$timeout', 'com.ctrip.tars.exceptions.Service', function($scope, $timeout, service) {
    $scope.scroller = null;
    $scope.appExceptionCharts = new js.util.HashMap();

    $scope.$on('exceptions.update', function(event) {
      $scope.exceptions = service.exceptions;

      return false;
    });

    $scope.$on('tab.exceptions.show', function(event, data) {

      if ($scope.scroller) {
        //$scope.scroller.refresh();
      } else {
        $scope.scroller = new com.ctrip.tars.component.IScroll("#exceptions-scroller", {
          bottom: 8,
          innerHeight: 32,
          // pageHeight: $scope.size.height || 0,
          sensitive: {}
        }, function(fn) {
          service.next(fn);
        }, function(fn) {
          service.refresh(fn);
        });

        $timeout(function() {
          if ($scope.scroller) {
            $scope.scroller.refresh();
          }
        }, 1000, false, null);

      }
      return false;
    });

    $scope.$on('expander.exceptions.expand', function(event, data) {

      service.loadRangeData(data.exceptionType, $scope.urlParams[URL_PARAMS.FROM_DATE], $scope.urlParams[URL_PARAMS.TO_DATE], function(rd) {

        var cp = com.ctrip.tars.util.Chart.buildSeries(rd, [SERIES.EXCEPTION]);

        if ($scope.appExceptionCharts.get(data.name)) {
          //$scope.appExceptionCharts.get(data.name).getChart().redraw();
        } else {

          var exceptionChart = new com.ctrip.tars.component.chart.Stock("app-detail-exception-" + data.name);
          exceptionChart.render(cp.series.get(SERIES.EXCEPTION), {
            plotLines: cp.plotLines,
            plotBands: cp.plotBands
          });
          $scope.appExceptionCharts.put(data.name, exceptionChart);
        }
        if ($scope.scroller) {
          //$scope.scroller.scroller.refresh();
        }
      });
      return false;
    });

    $scope.$on('expand.fullscreen.exception', function(event, data) {
      data.component.append($('.wapper-app-detail-exception-' + data.key).children());

      $scope.appExceptionCharts.get(data.key).getChart().setSize(data.width, data.height, true);
      return false;
    });

    $scope.$on('compress.original.exception', function(event, data) {

      var slider = $('.wapper-app-detail-exception-' + data.key);

      var width = slider.width(),
        height = slider.height();

      $scope.appExceptionCharts.get(data.key).getChart().setSize(width, height, true);

      data.component.children().appendTo(slider);
      return false;
    });
    $scope.exceptions = service.exceptions;

    $scope.$emit("deployment.window.ready", "Exceptions");
  }])
  .directive(
    "liException",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          name: "@dataname",
          exceptionType: "@dataexceptiontype",
          currentCount: "@datacurrentcount",
          roundCount: "@dataroundcount",
          monitorTime: "@datamonitortime",
          onMore: "&"
        },
        template: [
          '<div class="item details" style="margin: 0px 16px 0px 64px; padding: 8px 0px 7px 8px;">',

          '<div class="pull-left">',
          '<div class="img-circle photo-tip active">',
          '<i class="fa fa-exclamation-triangle"></i>',
          '</div>',
          '</div>',

          '<expander name="exceptions">',
          '<expander-head>',

          '<h5 class="list-group-item-heading" style="line-height: 28px;">',
          '{{exceptionType}}',
          '<small class="text-muted pull-right"><i class="fa fa-clock-o"></i>{{monitorTime}}</small>',
          '</h5>',
          '<p class="list-group-item-text summary" style="color: #757575; font-size: 12px; line-height: 24px;">',
          '当前({{currentCount}})；环比({{roundCount}})；</p>',

          '</expander-head>',
          '<expander-body>',

          '<div class="wapper-app-detail-exception-{{name}}" style="height:96px"><div class="chart" id="high-chart-app-detail-exception-{{name}}" style="height:96px"></div></div>',

          //'<em role="expand-fullscreen" data-echo-type="app-detail-exception" data-echo-key="{{name}}" style="position: absolute; right: 0px; margin-top: -12px; z-index: 999; font-size: 12px; line-height: 12px;" class="text-muted pull-right">',
          //'<i class="fa fa-expand"></i>', '</em>',

          '</expander-body>',

          '</expander>', '</div>'
        ].join("")
      };
    });

