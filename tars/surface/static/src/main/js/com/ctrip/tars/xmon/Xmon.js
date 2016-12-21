$import("com.ctrip.tars.util.Id");
$import("com.ctrip.tars.component.ISlider");

var xmon = angular.module("com.ctrip.tars.xmon", [])
  .service('com.ctrip.tars.xmon.Service', ['$rootScope', '$http', function($rootScope, $http) {
    var validate = function(d, data) {
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
      d.erBaselineWarning = d.erBaseline * data.erBaselineWarning;
      d.erBaselineError = d.erBaseline * data.erBaselineError;
      return d;
    };

    var loadChartData = function(startTime, endTime, callback) {
      $http({
        method: 'GET',
        url: [TEST_URL, "common/chart/data"].join("")
      }).success(function(data, status, headers, config) {
        if (data.success) {

          service.lastMonitorTime = data.lastMonitorTime;
          service.errorThreshold = data.errorThreshold;
          service.erBaselineWarning = data.erBaselineWarning;
          service.erBaselineError = data.erBaselineError;

          var d = data.data || [];
          for (var i = 0, len = d.length; i < len; i++) {
            d[i] = validate(d[i], data);
          }
          if (!Object.isNull(callback) && Object.isFunction(callback)) {
            callback(data);
          }
        }
      });
    };
    var service = {
      loadChartData: loadChartData
    };

    return service;
  }]).directive(
    "xmon",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: false,
        template: [
          '<div style="width: 100%; height: 102px; margin-bottom: 10px;">',
          '<ul class="bxslider bxslider-app-detail" style="width: 100%; height: 100%; margin-bottom: 0px; padding: 0px; overflow: hidden;">',
          '<li>',
          '<div class="chart" id="high-chart-app-detail-errorVisit" style="width: 100%; height: 102px;"></div>',
          '</li>',
          '<li>',
          '<div class="chart" id="high-chart-app-detail-visit" style="width: 100%; height: 102px;"></div>',
          '</li>',
          '<li>',
          '<div class="chart" id="high-chart-app-detail-log" style="width: 100%; height: 102px;"></div>',
          '</li>',
          '</ul>',
          '</div>'
        ].join(""),
        controller: ["$scope", 'com.ctrip.tars.xmon.Service', function($scope, service) {
          //if ($scope.isSingle()) {
          var urlParams = $scope.getURLParams();
          service.loadChartData(urlParams[URL_PARAMS.FROM_DATE], urlParams[URL_PARAMS.TO_DATE], function(data) {

            var cp = com.ctrip.tars.util.Chart.buildSeries(data, [SERIES.FATAL, SERIES.ERROR, SERIES.VISIT, SERIES.ERRORVISIT, SERIES.COST]);

            $scope.appCharts[0] = new com.ctrip.tars.component.chart.Stock("app-detail-errorVisit", service.lastMonitorTime);
            $scope.appCharts[0].render(cp.series.get(SERIES.ERRORVISIT), {
              plotLines: cp.plotLines,
              plotBands: cp.plotBands
            });

            $scope.appCharts[1] = new com.ctrip.tars.component.chart.Stock("app-detail-visit", service.lastMonitorTime);
            $scope.appCharts[1].render(cp.series.get(SERIES.VISIT), {
              plotLines: [],
              plotBands: []
            });

            $scope.appCharts[2] = new com.ctrip.tars.component.chart.Stock("app-detail-log", service.lastMonitorTime);
            $scope.appCharts[2].render(cp.series.get(SERIES.ERROR).concat(cp.series.get(SERIES.FATAL)).concat(cp.series.get(SERIES.COST)), {
              plotLines: [],
              plotBands: []
            });


            //$scope.appCharts[3] = new com.ctrip.tars.component.chart.Pie("app-servers-status");
            //$scope.appCharts[3].render();

            if (!$scope.slider) {
              $scope.slider = new com.ctrip.tars.component.ISlider($scope.element.find("ul"), {
                mode: 'fade',
                speed: 500,
                infiniteLoop: false,
                hideControlOnEnd: true
              });
            } else {
              $scope.slider.reflow();
            }
          });
          //}

          var resize = function() {
            var element = $scope.element;
            if (element.is(":hidden")) {
              return;
            }
            var size = $scope.size,
              width = element.width(),
              height = element.height();

            if (width !== size.width || height !== size.height) {
              $scope.size = {
                width: width,
                height: height
              };

              if ($scope.slider) {
                $scope.slider.reflow({
                  onSlideAfter: function($slideElement, oldIndex, newIndex) {
                    var len = $scope.appCharts.length;
                    if (newIndex < len && newIndex >= 0) {
                      $scope.appCharts[newIndex].reflow();
                    }
                  },
                  onSliderLoad: function(currentIndex) {
                    var len = $scope.appCharts.length;
                    if (currentIndex < len && currentIndex >= 0) {
                      $scope.appCharts[currentIndex].reflow();
                    }
                  }
                });
              }
            }
          };

          $scope.$on("sidebar.collapse.on", resize);

          $scope.$on('window.resize', resize);

        }],
        link: function($scope, element, attrs, controller) {
          $scope.element = element;
          $scope.size = {
            width: element.width(),
            height: element.height()
          };
        }
      };
    });

