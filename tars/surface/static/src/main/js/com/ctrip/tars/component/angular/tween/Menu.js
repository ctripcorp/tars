var tweenMenu = angular.module("com.ctrip.tars.tween.menu", []).directive("tweenMenu", function() {
  return {
    restrict: 'A',
    replace: false,
    transclude: false,
    scope: {},
    /*
		template: [
			'<div class="tween-menu" ng-init="init()">',
			'<ul class="tween-menu-items">',


			'</ul>',

			'<button class="tween-menu-toggle-button">',
			'<i class="fa fa-plus tween-menu-toggle-icon"></i>',
			'</button>',

			'</div>'
		].join(""),*/
    link: function(scope, element, attributes, controller) {
      /*
			var buttons = scope.buttons;
			if (!buttons || buttons.length <= 0) {
				return;
			}

			var length = buttons.length;
			for (var i = 0; i < length; i++) {
				var button = buttons[i];
				var li = $(['<li class="tween-menu-item">',
					'<button class="tween-menu-item-button">',
					'<i class="tween-menu-item-icon icon icon-', button.icon, '"></i>',
					'</button>',
					'<div class="tween-menu-item-bounce"></div>',
					'</li>'
				].join(""));

				li.find("button").on("click", function() {
					button.handler.call(button)
				});
				element.find("ul").append(li);
			}
			*/

      var menuItemNum = element.find(".tween-menu-item").length;
      var angle = 120;
      var distance = 40;
      var startingAngle = 180 + (-angle / 2);
      var slice = angle / (menuItemNum - 1);
      TweenMax.globalTimeScale(0.8);
      element.find(".tween-menu-item").each(function(i) {
        var angle = startingAngle + (slice * i);
        $(this).css({
          transform: "rotate(" + (angle) + "deg)"
        });
        $(this).find(".tween-menu-item-icon").css({
          transform: "rotate(" + (-angle) + "deg)"
        });
      });
      var on = false;

      element.find(".tween-menu-toggle-button").mousedown(function() {
        TweenMax.to($(".tween-menu-toggle-icon"), 0.1, {
          scale: 0.65
        });
      });
      element.find(document).mouseup(function() {
        TweenMax.to($(".tween-menu-toggle-icon"), 0.1, {
          scale: 1
        });
      });

      $(document).on("touchend", function() {
        $(document).trigger("mouseup");
      });
      element.find(".tween-menu-toggle-button").on("mousedown", pressHandler);

      element.find(".tween-tween-menu-toggle-button").on("touchstart", function(event) {
        $(this).trigger("mousedown");
        event.preventDefault();
        event.stopPropagation();
      });

      /*
			element.hover(function() {
				openMenu()
			}, function() {
				closeMenu()
			});*/

      function pressHandler(event) {
        on = !on;

        TweenMax.to($(this).children('.tween-menu-toggle-icon'), 0.4, {
          rotation: on ? 45 : 0,
          ease: Quint.easeInOut,
          force3D: true
        });

        if (on) {
          openMenu();
        } else {
          closeMenu();
        }

      }

      function openMenu() {
        $(".tween-menu-item").each(function(i) {
          var delay = i * 0.08;

          var $bounce = $(this).children(".tween-menu-item-bounce");

          TweenMax.fromTo($bounce, 0.2, {
            transformOrigin: "50% 50%"
          }, {
            delay: delay,
            scaleX: 0.8,
            scaleY: 1.2,
            force3D: true,
            ease: Quad.easeInOut,
            onComplete: function() {
              TweenMax.to($bounce, 0.15, {
                // scaleX:1.2,
                scaleY: 0.7,
                force3D: true,
                ease: Quad.easeInOut,
                onComplete: function() {
                  TweenMax.to($bounce, 3, {
                    // scaleX:1,
                    scaleY: 0.8,
                    force3D: true,
                    ease: Elastic.easeOut,
                    easeParams: [1.1, 0.12]
                  });
                }
              });
            }
          });

          TweenMax.to($(this).children(".tween-menu-item-button"), 0.5, {
            delay: delay,
            y: distance,
            force3D: true,
            ease: Quint.easeInOut
          });
        });
      }

      function closeMenu() {
        $(".tween-menu-item").each(function(i) {
          var delay = i * 0.08;

          var $bounce = $(this).children(".tween-menu-item-bounce");

          TweenMax.fromTo($bounce, 0.2, {
            transformOrigin: "50% 50%"
          }, {
            delay: delay,
            scaleX: 1,
            scaleY: 0.8,
            force3D: true,
            ease: Quad.easeInOut,
            onComplete: function() {
              TweenMax.to($bounce, 0.15, {
                // scaleX:1.2,
                scaleY: 1.2,
                force3D: true,
                ease: Quad.easeInOut,
                onComplete: function() {
                  TweenMax.to($bounce, 3, {
                    // scaleX:1,
                    scaleY: 1,
                    force3D: true,
                    ease: Elastic.easeOut,
                    easeParams: [1.1, 0.12]
                  });
                }
              });
            }
          });

          TweenMax.to($(this).children(".tween-menu-item-button"), 0.3, {
            delay: delay,
            y: 0,
            force3D: true,
            ease: Quint.easeIn
          });
        });
      }
    },
    /*
		compile: function(element, attributes) {
			return {
				pre: function preLink(scope, element, attributes) {

				},
				post: function postLink(scope, element, attributes) {}
			};
		},*/
    controller: ["$scope", function($scope) {
      $scope.init = function() {
        $scope.buttons = $scope.$parent.buttons;
      };
    }]
  };

});

