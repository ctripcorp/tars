var sidebar = angular.module("com.ctrip.tars.component.angular.sidebar", [])
  .service('com.ctrip.tars.component.angular.sidebar.Service', [
    '$rootScope', '$http',
    function($rootScope, $http) {
      return {};
    }
  ])
  .controller("com.ctrip.tars.component.angular.sidebar.Controller", [
    '$scope', 'com.ctrip.tars.component.angular.sidebar.Service',
    function($scope, service) {}
  ])
  .directive("sidebar", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: false,
      template: [
        '<div class="sidebar" ng-class="{true:\'open\'}[open]" ng-transclude>',
        // '<div class="row" ></div>'  container-fluid,
        '</div>',
      ].join(""),
      link: function(scope, element, attributes, sidebarController) {
        sidebarController.init(element);
      },
      controller: ["$scope", function($scope) {
        $scope.open = true;

        var expand = null,
          collapse = null,
          scope = this;

        $scope.toggle = function() {
          $scope.open = !$scope.open;
          $scope.animate($scope.open);
        };

        $scope.animate = function(open) {
          $scope.open = open;

          var padding = scope.config.padding;
          var position = scope.config.position;
          var split = scope.config.split;

          if ($(window).width() >= 992) {
            var centerFrom = {
                width: "100%",
                padding: "0px 0px 0px 0px",
                marginLeft: "0%",
                onUpdate: function() {
                  $scope.$broadcast("sidebar.collapse.running", this.reversed(), this.ratio);
                },
                onComplete: function() {
                  $scope.$broadcast("sidebar.collapse.on", false);
                },
                onReverseComplete: function() {
                  $scope.$broadcast("sidebar.collapse.on", true);
                }
              },
              centerTo = {
                width: (100 - split) + "%",
                padding: padding + " " + padding + " " + padding + " 0px",
                marginLeft: position === "fixed" ? split + "%" : "0%"
              },
              leftFrom = {
                width: "0%",
                opacity: 0,
                padding: "0px 0px 0px 0px"
              },
              leftTo = {
                width: split + "%",
                opacity: 1,
                padding: padding + " " + padding + " " + padding + " " + padding
              };
            if (scope.config.mode != 'md') {
              if (open) {
                expand = TweenMax.to($scope.center, 0.5, centerTo);
                collapse = TweenMax.to($scope.left, 0.5, leftTo);
              } else {
                expand = TweenMax.to($scope.center, 0.5, centerFrom);
                collapse = TweenMax.to($scope.left, 0.5, leftFrom);
              }
              expand = null;
              collapse = null;
            } else if (open) {
              if (expand) {
                if (expand.vars.css.width === '100%' && !expand.reversed()) {
                  expand.reverse();
                } else {
                  expand.play();
                }
              } else {
                expand = TweenMax.fromTo($scope.center, 0.5, centerFrom, centerTo);
              }
              if (collapse) {
                if (collapse.vars.css.width === '0%' && !collapse.reversed()) {
                  collapse.reverse();
                } else {
                  collapse.play();
                }
              } else {
                collapse = TweenMax.fromTo($scope.left, 0.5, leftFrom, leftTo);
              }
            } else {
              if (expand) {
                if (expand.vars.css.width === ((100 - split) + "%") && !expand.reversed()) {
                  expand.reverse();
                } else {
                  expand.play();
                }
              } else {
                expand = TweenMax.fromTo($scope.center, 0.5, centerTo, centerFrom);
              }
              if (collapse) {
                if (collapse.vars.css.width === (split + '%') && !collapse.reversed()) {
                  collapse.reverse();
                } else {
                  collapse.play();
                }
              } else {
                collapse = TweenMax.fromTo($scope.left, 0.5, leftTo, leftFrom);
              }
            }
          } else {
            var centerFrom = {
                left: "0px",
                padding: "0px 0px 0px 0px"
              },
              centerTo = {
                left: "280px",
                padding: padding + " " + padding + " " + padding + " 0px"
              },
              leftFrom = {
                width: "0px",
                opacity: 0,
                padding: "0px 0px 0px 0px"
              },
              leftTo = {
                width: "280px",
                opacity: 1,
                padding: padding + " " + padding + " " + padding + " " + padding
              };
            if (scope.config.mode != 'xs') {
              if (open) {
                expand = TweenMax.to($scope.center, 0.5, centerTo);
                collapse = TweenMax.to($scope.left, 0.5, leftTo);
              } else {
                expand = TweenMax.to($scope.center, 0.5, centerFrom);
                collapse = TweenMax.to($scope.left, 0.5, leftFrom);
              }
              expand = null;
              collapse = null;
            } else if (open) {
              if (expand) {
                if (expand.vars.css.left === '0px' && !expand.reversed()) {
                  expand.reverse();
                } else {
                  expand.play();
                }
              } else {
                expand = TweenMax.fromTo($scope.center, 0.5, centerFrom, centerTo);
              }
              if (collapse) {
                if (collapse.vars.css.width === '0px' && !collapse.reversed()) {
                  collapse.reverse();
                } else {
                  collapse.play();
                }
              } else {
                collapse = TweenMax.fromTo($scope.left, 0.5, leftFrom, leftTo);
              }
            } else {
              if (expand) {
                if (expand.vars.css.left === '280px' && !expand.reversed()) {
                  expand.reverse();
                } else {
                  expand.play();
                }
              } else {
                expand = TweenMax.fromTo($scope.center, 0.5, centerTo, centerFrom);
              }
              if (collapse) {
                if (collapse.vars.css.width === '280px' && !collapse.reversed()) {
                  collapse.reverse();
                } else {
                  collapse.play();
                }
              } else {
                collapse = TweenMax.fromTo($scope.left, 0.5, leftTo, leftFrom);
              }
            }
          }
        };

        this.setLeft = function(element) {
          $scope.left = element;
        };

        this.setCenter = function(element) {
          $scope.center = element;
        };

        this.config = {
          mode: $(window).width() >= 992 ? 'md' : 'xs'
        };

        this.init = function(element) {
          $scope.element = element;

          this.config.position = element.attr("position");
          this.config.padding = parseInt(element.attr("padding")) || 0;
          this.config.split = parseInt(element.attr("split")) || 15;

          $scope.animate(true);

          $(window).resize(function() {

            var mode = $(window).width() >= 992 ? 'md' : 'xs';

            if (mode != scope.config.mode) {
              $scope.animate($scope.open);
            }

            scope.config.mode = mode;
          });
        };
      }]
    };
  }).directive("sidebarLeft", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      require: '^?sidebar',
      template: [
        //{{getPadding()}}; {{getWidth()}}; 
        '<div class="left" style="{{getPosition()}};" ng-transclude></div>' //ng-show="open" ng-style="{ \'padding\': \'{{getPadding()}}\' }" 
      ].join(""),
      link: function(scope, element, attributes, controller) {
        controller.setLeft(element);

        scope.getPosition = function() {
          if (controller.config.position === 'fixed') {
            return "position: fixed; float: left; left: 0;";
          } else {
            return "position: relative; float: left;"
          }
        };

        /**@deprecated*/
        scope.getPadding = function() {
          if (scope.open) {
            return "padding: " + controller.config.padding + "px";
          } else {
            return "padding: 0px";
          }
        };

        /**@deprecated*/
        scope.getWidth = function() {
          if (!scope.open) {
            return "width: 0%";
          } else if ($(window).width() < 992) {
            return "width: 280px;";
          } else {
            return "width: " + controller.config.split + "%";
          }
        };
      }
    };
  }).directive("sidebarCenter", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      require: '^?sidebar',
      template: [
        //{{getPadding()}}; {{getWidth()}}; 
        '<div class="center" style="{{getMarginLeft()}};">', // ng-style="{ \'padding\': \'{{getPadding()}}\' }" 

        '<a href="javascript: void(0);" ng-click="toggle()" class="cd-nav-trigger" style="transform: {{getTransform()}}">Menu',
        '<span class="cd-nav-icon"></span>',
        '<svg x="0px" y="0px" width="40px" height="40px" viewBox="0 0 40 40">',
        '<circle fill="transparent" stroke="transparent" stroke-width="1" cx="20" cy="20" r="20" stroke-dasharray="126 126" stroke-dashoffset="126"></circle>',
        '</svg>',
        '</a>',

        '<div ng-transclude></div>',

        '</div>'
      ].join(""),
      link: function(scope, element, attributes, controller) {
        controller.setCenter(element);

        scope.getMarginLeft = function() {
          var position = controller.config.position;
          var split = controller.config.split;
          if ($(window).width() >= 992) {
            return "position: relative; float: left; margin-left: " + (position === "fixed" ? split + "%" : "0%");
          } else {
            return "position: absolute; top: 0px; margin-left: 0px;";
          }
        };

        scope.getTransform = function() {
          var padding = controller.config.padding;
          if (scope.open) {
            // return "rotate(180deg) translateX(-" + padding + "px) translateY(-" + padding + "px)";
          }
          return null;
        };

        /**@deprecated*/
        scope.getPadding = function() {
          if (scope.open) {
            var padding = controller.config.padding;
            return "padding: " + padding + "px " + padding + "px " + padding + "px 0px";
          } else {
            return "padding: 0px";
          }
        };

        /**@deprecated*/
        scope.getWidth = function() {
          if (!scope.open || $(window).width() < 992) {
            return "width: 100%";
          } else {
            return "width: " + (100 - controller.config.split) + "%";
          }
        };
      }
    };
  });

