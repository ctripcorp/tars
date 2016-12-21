var expander = angular.module("com.ctrip.tars.component.angular.tooltip", [])
  .directive('tooltip', function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      link: function(scope, element, attributes, controller) {
        controller.create(element, attributes);
      },
      controller: ["$scope", function($scope) {
        this.create = function(element, attributes) {
          element.tooltip({
            title: attributes.title || attributes.datatitle,
            trigger: "hover focus",
            container: 'body'
          });

          element.mousedown(function() {
            $(this).tooltip("hide");
          });

          /*
          element.hover(function() {
            $(this).tooltip("show");
          }, function() {
            $(this).tooltip("hide");
          });
          */

          $scope.$watch("title || datatitle", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              element.tooltip("destroy");
              window.setTimeout(function() {
                element.tooltip({
                  title: newValue,
                  trigger: "hover focus",
                  container: 'body'
                });
              }, 300);
            }
          });

          //在DOM对象销毁时注销定时器
          element.on("$destroy", function() {
            $(this).tooltip("destroy");
          });
        };
      }]
    };
  });

