var ink = angular.module("com.ctrip.tars.component.angular.ink.Ink", [])
  .directive("ink", function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      link: function(scope, element, attributes) {
        element.click(function(event) {
          //create .ink element if it doesn't exist
          if (scope.disabled === true || scope.disabled === 'true') {
            return false;
          }

          if (element.css("position") !== "absolute" && element.css("position") !== "fixed") {
            element.css({
              "position": "relative"
            });
          }

          if (element.css("overflow") !== "hidden") {
            element.css({
              "overflow": "hidden"
            });
          }

          if (element.children(".ink.wave").length === 0) {
            element.prepend("<span class='ink wave'></span>");
          }

          var ink = element.children(".ink.wave");
          //incase of quick double clicks stop the previous animation
          ink.removeClass("wave");

          //set size of .ink
          if (!ink.height() && !ink.width()) {
            //use element's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
            var d = Math.max(element.outerWidth(), element.outerHeight());
            ink.css({
              height: d,
              width: d
            });
          }

          //get click coordinates
          //logic = click coordinates relative to page - element's position relative to page - half of self height/width to make it controllable from the center;
          var offset = element.css("position") === "absolute" ? {
            left: event.offsetX,
            top: event.offsetY
          } : {
            left: event.pageX - element.offset().left,
            top: event.pageY - element.offset().top
          };
          var x = offset.left - ink.width() / 2;
          var y = offset.top - ink.height() / 2;

          //set the position and add class .ripple
          ink.css({
            top: y + 'px',
            left: x + 'px'
          }).addClass("wave");

          //event.stopPropagation();
          //return false;
        });

      },
      controller: ["$scope", function($scope) {}]
    };
  })
  .directive("shine", function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      link: function(scope, element, attributes) {
        if (element.css("position") !== "absolute" && element.css("position") !== "fixed") {
          element.css({
            "position": "relative"
          });
        }
        var classname = element.hasClass("square") ? " square" : "";

        if (element.children(".ink.shine").length === 0) {
          element.prepend("<span class='ink shine" + classname + "'></span>");
        }

        var ink = element.children(".ink.shine");
        ink.css({
          background: "transparent",
          borderStyle: "solid",
          top: 0,
          left: 0,
          opacity: 0
        });

        var scale = 8,
          interval = 1600;

        var run = function() {
          if (!element) {
            return;
          }

          var width = element.outerWidth(),
            height = element.outerHeight();

          if (!width || !height) {
            window.setTimeout(function() {
              if (scope.promise) {
                run();
              }
            }, interval);
            return;
          }

          var ink = element.children(".ink.shine");
          ink.css({
            top: 0,
            left: 0,
            borderWidth: 0,
            opacity: 1,
            height: height,
            width: width,
          }).animate({
            top: -scale,
            left: -scale,
            borderWidth: scale,
            opacity: 0,
            height: height + 2 * scale,
            width: width + 2 * scale
          }, interval, "easeOutQuart", function() {
            ink.css({
              top: 0,
              left: 0,
              borderWidth: 0,
              opacity: 1,
              height: width,
              width: height
            });
            if (scope.promise) {
              run();
            }
          });
        };
        var start = function(e) {
            if (scope.disabled === true || scope.disabled === 'true') {
              return false;
            }

            scope.promise = true;
            run();
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            return false;
          },
          stop = function(e) {
            if (scope.promise) {
              scope.promise = false;
            }

            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            return false;
          };

        scope.$on("shine.start", start);
        scope.$on("shine.stop", stop);

        if (scope.shine === 'true') {
          start();
        }

      },
      controller: ["$scope", function($scope) {

      }]
    };
  }).directive("ripple", function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      link: function(scope, element, attributes) {

        var start = function() {
          if (scope.disabled === true || scope.disabled === 'true') {
            return false;
          }

          if (element.css("position") !== "absolute" && element.css("position") !== "fixed") {
            /*element.css({
              "position": "relative"
            });*/
          }

          if (element.css("overflow") !== "visible") {
            element.css({
              "overflow": "hidden"
            });
          }
          var classname = element.hasClass("square") ? " square" : "";

          if (element.children(".ink.ripple").length === 0) {
            element.prepend("<span class='ink ripple no-monitor " + classname + "'></span>");
          }

          var ink = element.children(".ink.ripple");
          //incase of quick double clicks stop the previous animation
          ink.removeClass("ripple");

          //set size of .ink
          if (!ink.height() && !ink.width()) {
            //use element's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
            var d = Math.max(element.outerWidth(), element.outerHeight());
            ink.css({
              height: d,
              width: d
            });
          }

          //get click coordinates
          //logic = click coordinates relative to page - element's position relative to page - half of self height/width to make it controllable from the center;
          var offset = element.css("position") === "absolute" ? {
            left: element.outerWidth() / 2,
            top: element.outerHeight() / 2
          } : {
            left: element.outerWidth() / 2, //+ element.offset().left,
            top: element.outerHeight() / 2 //+ element.offset().top
          };

          var x = offset.left - ink.width() / 2;
          var y = offset.top - ink.height() / 2;

          //set the position and add class .ripple
          ink.css({
            top: y + 'px',
            left: x + 'px'
          }).addClass("ripple");
        };
        var stop = function() {
          element.children(".ink.ripple").remove();
        };

        scope.$on("ripple.start", start);
        scope.$on("ripple.stop", stop);

        if (scope.ripple === 'true') {
          start();
        }

      },
      controller: ["$scope", function($scope) {}]
    };
  }).directive("warning", function() {
    return {
      restrict: 'A',
      replace: false,
      transclude: false,
      scope: false,
      link: function(scope, element, attributes) {
        //create .ink element if it doesn't exist

        if (element.css("position") !== "absolute" && element.css("position") !== "fixed") {
          element.css({
            "position": "relative"
          });
        }

        var classname = element.hasClass("square") ? " square" : "";

        if (element.children(".ink.warning").length === 0) {
          element.prepend("<span class='ink warning " + classname + "'></span>");
        }

        var ink = element.children(".ink.warning");
        ink.css({
          background: "transparent",
          borderStyle: "solid",
          top: 0,
          left: 0,
          opacity: 0
        });

        var scale = 8,
          interval = 2400;
        var run = function() {
          if (!element) {
            return;
          }

          var width = element.outerWidth(),
            height = element.outerHeight();

          if (!width || !height) {
            window.setTimeout(function() {
              if (scope.promise) {
                run();
              }
            }, interval);
            return;
          }

          var ink = element.children(".ink.warning");
          ink.css({
            opacity: 1,
            borderWidth: 0,
            top: 0,
            left: 0,
            height: height,
            width: width
          }).animate({
            opacity: 0,
            borderWidth: scale,
            top: scale,
            left: scale,
            height: height - 2 * scale,
            width: width - 2 * scale,
          }, interval / 2, "easeInBounce", function() {
            if (scope.promise) {
              ink.animate({
                opacity: 1,
                borderWidth: 0,
                top: 0,
                left: 0,
                height: height,
                width: width
              }, interval / 2, "easeOutBounce", function() {
                if (scope.promise) {
                  run();
                }
              });
            } else {
              ink.css({
                top: 0,
                left: 0,
                borderWidth: 0,
                opacity: 1,
                height: height - 2 * scale,
              });
            }
          });
        };
        var start = function(e) {
            if (scope.disabled === true || scope.disabled === 'true') {
              return false;
            }

            scope.promise = true;
            run();

            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            return false;
          },
          stop = function(e) {
            if (scope.promise) {
              scope.promise = false;
            }

            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            return false;
          };

        scope.$on("warning.start", start);
        scope.$on("warning.stop", stop);

        if (scope.warning === 'true') {
          start();
        }

      },
      controller: ["$scope", function($scope) {


      }]
    };
  });

