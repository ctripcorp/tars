$import("com.ctrip.tars.util.Common");
$import("com.ctrip.tars.component.chart.Bar");

$import("com.ctrip.tars.base.DefaultService");

Class.forName({
  name: "class com.ctrip.tars.component.angular.percent.bar2.Service extends com.ctrip.tars.base.DefaultService",
  Service: function() {},

  getUrl: function(path) {
    if (!com.ctrip.tars.util.Id.isValid(path.app)) {
      return null;
    }
    return [BASE_URL, "applications/", path.app, "/summary"].join("");
  },

  "private data": []
});

var easybar = angular
  .module("com.ctrip.tars.component.angular.percent.bar2", [])
  .service('com.ctrip.tars.component.angular.percent.bar2.Service', com.ctrip.tars.component.angular.percent.bar2.Service)
  .directive('bar2', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      template: '<div class="bar" ng-transclude></div>',
      scope: false,
      link: function(scope, element, attrs, controller) {
        var id = com.ctrip.tars.util.Common.stripscript(scope.hashCode());
        element.attr("id", "high-chart-" + id); //.css("height", element.width());
        scope.bar = new com.ctrip.tars.component.chart.Bar(id);

        scope.$on("bar.redraw", function(e, data) {
          //TODO  render方法
        });
      },
      controller: ["$scope", "com.ctrip.tars.component.angular.percent.bar2.Service", function($scope, service) {
        service.load({
          app: $scope.app.id
        }, null, function(data) {
          scope.bar.redraw(data);
        });

      }]
    };
  });

