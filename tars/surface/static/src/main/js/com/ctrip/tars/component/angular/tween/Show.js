var easybar = angular
  .module("com.ctrip.tars.component.angular.tween.show", [])
  .directive('tweenShow', function() {
    return {
      restrict: 'A',
      multiElement: true,
      link: function(scope, element, attr) {
        var animate = null;

        scope.$watch(attr.tweenShow, function(value) {
          if (!value) {
            if (animate) {
              animate.play();
            } else {
              var duration = attr.duration || 0.5,
                options = {
                  opacity: 0,
                  onReverseComplete: function() {
                    element.css("height", "auto").show();
                  },
                  onComplete: function() {
                    element.hide();
                  }
                };
              if (attr.x === 'true' || attr.xy === 'true') {
                options.width = "0px";
              }

              if (attr.y === 'true' || attr.xy === 'true') {
                options.height = "0px";
              }
              animate = TweenMax.to(element, duration, options);
            }
          } else {
            if (animate && !animate.reversed()) {
              animate.reverse();
            }
          }
        });
      }
    };
  });

