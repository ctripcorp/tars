$import("com.ctrip.tars.util.Angular");

var tabpanel = angular.module("com.ctrip.tars.component.angular.layout.Concern", [])
  .directive("concern", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: false,
      template: '<div class="concern" style="overflow: hidden; width: 100%; height: 100%;" ng-transclude></div>',
      link: function(scope, element, attrs, controller) {},
      controller: ["$scope", function($scope) {

        this.setSouth = function(element) {
          $scope.south = element;
        };

        this.setCenter = function(element) {
          $scope.center = element;
        };
        this.setCtrlUpDown = function(element) {
          $scope.ctrlUpDown = element;
        };

        $scope.ratio = 0;
        var offset = $scope.isSingle() ? CONCERN[0] : CONCERN[1],
          expand = null,
          state = null,
          create = function() {
            var ch = $scope.center.height(),
              nh = $scope.south.height(),
              step = ch;
            return TweenMax.to($scope.center, 0.5, {
              height: ch - offset,
              onUpdate: function() {
                var height = this.target.height(),
                  delta = height - ch;
                $scope.$broadcast("concern.watching.on", {
                  delta: delta,
                  step: {
                    height: height - step
                  },
                  origin: {
                    center: {
                      height: ch
                    },
                    south: {
                      height: nh
                    }
                  }
                });
                step = height;
                $scope.ratio = Math.floor(this.ratio * 10);
              },
              onStart: function() {
                $scope.ratio = 0;
              },
              onComplete: function() {
                $scope.ratio = 10;
              },
              onReverseComplete: function() {
                $scope.ratio = 0;
              }
            });
          },
          watching = function(hover) {
            state = hover;
            if (hover) {
              if (expand) {
                expand.play();
              } else {
                expand = create();
              }
            } else if (!hover && expand && !expand.reversed()) {
              expand.reverse();
            }
          };

        $scope.$on("concern.watching", function(event, hover) {
          watching(hover);
        });
      }]
    };
  }).directive("concernSouth", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      require: '^?concern',
      template: '<div class="concern-south" ng-transclude></div>',
      controller: ['$scope', function($scope) {
        $scope.move = function(event) {
          if ($(window).width() < 768 ||
            $(event.target).hasClass("no-monitor")) {
            event.stopPropagation();
            return false;
          }

          //Fixme 判断父级元素中monitor和no-monitor的级别
          if ($(event.target).hasClass("monitor") ||
            $(event.target).parents(".monitor").length > 0) {
            $scope.$emit("concern.watching", true);
          }

          //if (
          //  $(event.relatedTarget).hasClass("no-monitor") ||
          //  $(event.target).parents("no-monitor").length > 0 ||
          //  $(event.relatedTarget).parents(".no-monitor").length > 0
          //) {
          //  event.stopPropagation();
          //  return false;
          //}
        };
      }],
      link: function(scope, element, attrs, controller) {
        controller.setSouth(element);
        /*
        element.mouseover(function(event) {
          scope.move(event);
        }, null);
        */
      }
    };
  }).directive("concernCenter", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      require: '^?concern',
      template: '<div class="concern-center" ng-transclude></div>',
      controller: ["$scope", function($scope) {
        $scope.move = function(event) {
          if ($(window).width() < 768 ||
            $(event.target).hasClass("no-monitor")) {
            event.stopPropagation();
            return false;
          }

          if ($(event.target).hasClass("monitor") ||
            $(event.target).parents(".monitor").length > 0) {
            $scope.$emit("concern.watching", false);
          }
        };
      }],
      link: function(scope, element, attrs, controller) {
        controller.setCenter(element);
        /*
        element.mouseover(function(event) {
          scope.move(event);
        });
        */
      }
    };
  }).directive("controlUpDown", function() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      require: '^?concern',
      template: ['<div class="monitor ctrl-up-down ctrl-up">',
        '<p class="arrow"></p>',
        '<p class="arrow"></p>',
        '<p class="arrow"></p>',
        '<p class="arrow"></p>',
        '</div>'
      ].join(''),
      link: function(scope, element, attrs, controller) {
        controller.setCtrlUpDown(element);
        element.click(function(event) {
          if ($(window).width() < 768) {
            event.stopPropagation();
            return false;
          } else {
            if (scope.ratio === 0) {
              $(element).addClass('ctrl-down').removeClass('ctrl-up');
              com.ctrip.tars.util.Angular.getScope(".concern-south").move(event);
            } else if (scope.ratio === 10) {
              $(element).addClass('ctrl-up').removeClass('ctrl-down');
              com.ctrip.tars.util.Angular.getScope(".concern-center").move(event);

            }
          }
        });
      }
    };
  });

