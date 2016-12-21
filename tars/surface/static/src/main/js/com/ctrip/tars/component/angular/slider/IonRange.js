var expander = angular.module("com.ctrip.tars.component.angular.slider", []).directive('ionRange', function() {
  return {
    restrict: 'A',
    replace: false,
    transclude: false,
    scope: true,
    link: function(scope, element, attributes, controller) {
      controller.create(element, attributes);
    },
    controller: ["$scope", '$interval', '$parse', function($scope, $interval, $parse) {
      this.create = function(element, attributes) {
        var model = element.attr("ng-model");

        // var freezing = false;
        element.ionRangeSlider({
          type: attributes.style || "single",
          min: attributes.min * 1 || 0,
          max: attributes.max * 1 || 10,
          step: attributes.step * 1 || 1,
          grid: attributes.grid === 'true' || false,
          postfix: attributes.postfix || '',
          force_edges: false,
          prettify_enabled: true,
          from: $parse(model)($scope),
          onStart: function(data) {},
          onChange: function(data) {
            // freezing = true;
          },
          onUpdate: function(data) {},
          onFinish: function(data) {
            // freezing = false;
          }
        });

        $scope.slider = element.data("ionRangeSlider");

        // if (model) {
        //   $scope.$watch(model, function(newValue, oldValue) {
        //     if (!freezing && (newValue != $scope.slider.result.from || newValue !== oldValue)) {
        //       $scope.update({
        //         from: newValue * 1
        //       });
        //     }
        //   });
        // }
      };

      $scope.reset = function() {
        $scope.slider.reset();
      };

      $scope.destroy = function() {
        $scope.slider.destroy();
      };

      $scope.update = function(data) {
        $scope.slider.update(data);
      };

    }]
  };
});

