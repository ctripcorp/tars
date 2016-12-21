$import("com.ctrip.tars.util.Common");
$import("com.ctrip.tars.component.chart.Pie");
var easypie = angular
  .module("com.ctrip.tars.component.angular.percent.pie", []).directive('pie', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      template: '<div class="pie" ng-transclude></div>',
      scope: false,
      link: function(scope, element, attrs, controller) {
        var id = com.ctrip.tars.util.Common.stripscript(scope.hashCode());
        element.attr("id", "high-chart-" + id).css("height", element.width());
        new com.ctrip.tars.component.chart.Pie(id).render();
      },
      controller: ["$scope", function($scope) {

      }]
    };
  });

