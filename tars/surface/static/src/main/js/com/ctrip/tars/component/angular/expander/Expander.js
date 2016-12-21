var expander = angular.module("com.ctrip.tars.component.angular.expander", []).directive('expander', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    template: '<div ng-transclude></div>',
    scope: {
      name: '@name'
    },
    controller: ["$scope", function($scope) {
      var expanderBodys = [],
        expanderHeads = [];
      this.getOpened = function(selected) {

        for (var i = 0, len = expanderHeads.length; i < len; i++) {
          if (selected == expanderHeads[i]) {
            expanderBodys[i].showMe = !expanderBodys[i].showMe;

            $scope.$root.$broadcast('expander.' + $scope.name + (expanderBodys[i].showMe ? '.expand' : '.collapse'), selected);
          }
        }
      };
      this.addHead = function(expanderHead) {
        expanderHeads.push(expanderHead);
      };
      this.addBody = function(expanderBody) {
        expanderBodys.push(expanderBody);
      };
    }]
  };
}).directive('expanderHead', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: '^?expander',
    template: '<div class="expander-title" ng-click="toggle()" ng-transclude></div>',
    link: function(scope, element, attrs, expanderController) {
      expanderController.addHead(scope);
      scope.toggle = function toggle() {
        expanderController.getOpened(scope);
      };
    }
  };
}).directive('expanderBody', function() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: '^?expander',
    template: '<div class="expander-body" ng-show="showMe" ng-transclude></div>',
    link: function(scope, element, attrs, expanderController) {
      scope.showMe = false;
      expanderController.addBody(scope);
    }
  };
});

