var bubble = angular.module("com.ctrip.tars.component.angular.bubble", []).directive('bubbles', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    template: "<div ng-transclude></div>",
    scope: false,
    controller: ["$scope", function($scope) {
      $scope.bubbles = [];
      $scope.addBubble = function(scope) {
        $scope.bubbles.push(scope);
      };
      $scope.hideBubbles = function() {
        for (var i = 0, len = $scope.bubbles.length; i < len; i++) {
          $scope.bubbles[i].showMe = false;
        }
      };
    }]
  };
}).directive('bubble', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: "^bubbles",
    template: [
      '<ul class="bubbles bubbles-popover" ',
      'style="position: absolute; z-index: 9999; width: {{ width }}px; top: {{ top }}px; left: {{ left }}px;" ',
      'ng-style="{\'top\': \'{{ top }}px\', \'left\': \'{{ left }}px\'}" ',
      'ng-show="showMe">',
      '<li class="bubble">',
      '<div class="content {{position.horizontal}} {{position.vertical}}">',
      '<div class="content-inner flat-card" ',
      'style="background-color: rgba(255, 255, 255, 1); background-image: none; ',
      '-moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.16), 0 3px 10px 0 rgba(0, 0, 0, 0.12); ',
      '-webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.16), 0 3px 10px 0 rgba(0, 0, 0, 0.12); ',
      'box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.16), 0 3px 10px 0 rgba(0, 0, 0, 0.12);">',
      '<div ng-transclude></div>',
      '</div>',
      '<div class="before" style="border-color: transparent #ffffff transparent transparent;"></div>',
      '</div>',
      '</li>',
      '</ul>'
    ].join(""),
    scope: false,
    link: function(scope, element, attributes, controller) {
      var parent = element.parent();

      var show = function(e) {
        scope.hideBubbles();
        scope.showMe = true;
        if (!scope.$$phase) {
          scope.$apply();
        }
        e.stopPropagation();

        var offset = parent.offset(),
          size = {
            width: element.width(),
            height: element.height()
          },
          containerSize = {
            width: $("body").width(),
            height: $("body").height()
          },
          parentSize = {
            width: parent.width(),
            height: parent.height()
          },
          left = 0,
          top = 0;

        if (offset.top + size.height > containerSize.height && offset.top - size.height > 0) {
          scope.position.vertical = "bottom";
          top = offset.top - size.height + parentSize.height;
        } else if (offset.top + size.height <= containerSize.height) {
          scope.position.vertical = "top";
          top = offset.top;
        } else {
          scope.position.vertical = "center";
          top = offset.top - (size.height - parentSize.height) / 2;
        }

        if (offset.left + parentSize.width + size.width > containerSize.width) {
          scope.position.horizontal = "right";
          left = offset.left - size.width;
        } else {
          scope.position.horizontal = "left";
          left = offset.left + parentSize.width;
        }

        scope.width = parentSize.width;
        scope.left = left;
        scope.top = top;

        if (!scope.$$phase) {
          scope.$apply();
        }
        return false;
      };

      var hide = function(target) {
        if (element.has($(target)).length > 0 || parent.has($(target)).length > 0) {
          return;
        }
        scope.showMe = false;
        if (!scope.$$phase) {
          scope.$apply();
        }
        return false;
      };

      var timeout = null;

      parent.hover(show, null);

      $("body").click(function(e) {
        e.stopPropagation();
        hide(e.target);
      }).mouseover(function(e) {
        e.stopPropagation();
        if (timeout) {
          window.clearTimeout(timeout);
          timeout = null;
        }
        var target = e.target;
        timeout = window.setTimeout(function() {
          hide(target);
        }, 300);
      });

      element.appendTo("body");
    },
    controller: ["$scope", function($scope) {
      $scope.showMe = false;
      $scope.left = 0;
      $scope.top = 0;
      $scope.position = {
        vertical: "top",
        horizontal: "left"
      };
      $scope.addBubble($scope);
    }]
  };
});

