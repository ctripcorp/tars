$import("com.ctrip.tars.util.Slot");

var popouts = angular.module("com.ctrip.tars.component.angular.popouts", []).directive('popouts', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    template: '<div class="popouts" ng-transclude></div>',
    scope: false,
    controller: ["$scope", function($scope) {

    }]
  };
}).directive('popout', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: '^?popouts',
    template: '<div class="popout" ng-class="{true: \'active\'}[popout.active]" ng-transclude></div>',
    scope: false,
    controller: ["$scope", "$timeout", function($scope, $timeout) {
      //$scope.popout.active = false;
      var popoutBody = null,
        popoutHead = null;
      this.getOpened = function(selected) {
        if (selected === popoutHead) {
          $scope.popout.active = !$scope.popout.active;
          if ($scope.popout.active) {
            $scope.$broadcast('popout.active', $scope.popout);
            var popouts = $scope.$parent.popouts;
            for (var i = 0, len = popouts.length; i < len; i++) {
              if (popouts[i] !== $scope.popout) {
                popouts[i].active = false;
              }
            }
          }
        }
      };
      this.addHead = function(head) {
        popoutHead = head;
      };
      this.addBody = function(body) {
        popoutBody = body;
      };

      if ($scope.$last) {
        var flag = false,
          popout = null;
        var active = null;
        for (var i = 0, len = $scope.$parent.popouts.length; i < len; i++) {
          popout = $scope.$parent.popouts[i];
          if (!flag && popout.active) {
            flag = true;
            active = popout;
          } else {
            popout.active = false;
          }
        }
        if (active) {
          $timeout(function() {
            $scope.$broadcast('popout.active', active);
          }, 1000, false, null);
        }
      }
    }]
  };
}).directive('popoutHead', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: '^?popout',
    template: '<div class="popout-title" ng-click="toggle()" ng-transclude></div>',
    link: function(scope, element, attrs, popoutController) {
      popoutController.addHead(scope);
      scope.toggle = function toggle() {
        popoutController.getOpened(scope);
      };
    }
  };
}).directive('popoutBody', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: '^?popout',
    template: '<div class="popout-body" ng-show="popout.active" ng-transclude></div>',
    link: function(scope, element, attrs, popoutController) {
      popoutController.addBody(scope);
    }
  };
}).directive('popouts2', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    template: '<div class="popouts3" ng-transclude></div>',
    scope: false,
    controller: ["$scope", function($scope) {
      $scope.popouts = [];
      $scope.addPopouts = function(popout) {
        $scope.popouts.push(popout);
      };
      $scope.removePopouts = function(popout) {
        for (var i = 0, len = $scope.popouts.length; i < len; i++) {
          if ($scope.popouts[i] == popout) {
            $scope.popouts.splice(i, 1);
            break;
          }
        }
      };
      $scope.getPopouts = function(popout) {
        return $scope.popouts;
      };
      $scope.selected = new com.ctrip.tars.util.Slot();

      $scope.isSelected = function(popout) {
        return $scope.selected.search(popout) !== -1;
      };
    }]
  };
}).directive('popout2', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: '^?popouts2',
    template: '<div class="popout3" ng-click="toggle()" ng-class="{true: \'selected active\'}[isSelected(popout)]" ng-transclude></div>',
    scope: false,
    controller: ["$scope", "$timeout", function($scope, $timeout) {

      $scope.$on("$destroy", function() {
        // $scope.selected.erase($scope.popout.id);
        $scope.removePopouts($scope.popout);
      });

      $scope.addPopouts($scope.popout);

      $scope.toggle = function() {
        if ($scope.isSelected($scope.popout.id)) {
          /*
          if ($scope.selected.length() > 1) {
            $scope.selected.erase($scope.popout.id);
            $scope.$emit('popout.unactive', $scope.popout.id);

            var popout = $scope.selected.peek();
            $scope.$emit('popout.active', popout);
          }
          */
        } else {
          //单选
          while ($scope.selected.size() > 0) {
            var selected = $scope.selected.pop();

            var popouts = $scope.getPopouts();
            for (var i = 0, len = popouts.length; i < len; i++) {
              if (popouts[i].id == selected) {
                $scope.$emit('popout.unactive', popouts[i]);
              }
            }
          }

          $scope.selected.push($scope.popout.id);
          $scope.$emit('popout.active', $scope.popout);
        }
      };
      /*
      if ($scope.$last) {
        var popout = null;
        if ($scope.selected.empty()) {
          for (var len = $scope.popouts.length, i = len - 1; i >= 0; i--) {
            popout = $scope.popouts[i];
            if (popout.selected) {
              $scope.selected.push(popout);
              $scope.$emit('popout.active', popout);
            }
          }
        }
        //if (!$scope.selected.empty()) {
        //$timeout(function() {
        //popout = $scope.selected.peek();
        //popout.active = "active";
        //$scope.$emit('popout.active', popout);
        //}, 1000, false, null);
        //}
      }
      */
    }]
  };
});

