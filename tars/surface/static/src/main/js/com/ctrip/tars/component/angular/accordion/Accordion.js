var action = angular.module("com.ctrip.tars.component.angular.accordion", [])
  .service('com.ctrip.tars.component.angular.accordion.Service', ['$rootScope', '$http', function($rootScope, $http) {
    return {};
  }]).controller("com.ctrip.tars.component.angular.accordion.Controller", ['$scope', 'com.ctrip.tars.component.angular.accordion.Service', function($scope, service) {

  }])
  .directive("accordions", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: false,
      template: [
        '<div class="liteAccordion blind" style="height: 100%;">',
        '<div class="ol" style="margin-bottom: 0px; padding: 0px;" ng-transclude>',

        '</div></div>'
      ].join(""),
      link: function(scope, element, attributes, actionController) {
        scope.element = element;
      },
      /*
		compile: function(element, attributes) {
			return {
				pre: function preLink(scope, element, attributes) {

				},
				post: function postLink(scope, element, attributes) {

				}
			};
		},
    */
      controller: ["$scope", function($scope) {


        var refersh = function() {
          var urlParams = $scope.getURLParams(),
            active = null;
          for (var i = $scope.groups.length - 1; i >= 0; i--) {
            if ($scope.groups[i].active) {
              active = $scope.groups[i];
            } else if (active) {
              $scope.groups[i].active = false;
            } else if ($scope.groups[i].id == urlParams.group) {
              $scope.groups[i].active = true;
              active = $scope.groups[i];
            } else if (!active && i === 0) {
              $scope.groups[i].active = true;
              active = $scope.groups[i];
            } else {
              $scope.groups[i].active = false;
            }
          }
        };
        $scope.$on('accordion.refersh', function(event) {
          refersh();
        });

        $scope.getLength = function() {
          return $scope.groups.length;
        };

        $scope.getAction = function() {
          for (var i = 0, len = $scope.getLength(); i < len; i++) {
            if ($scope.groups[i].active) {
              return i;
            }
          }
          return 0;
        };

        $scope.getLeft = function($index) {
          if ($scope.getAction() >= $index) {
            return $index * 48;
          } else {
            return $index * 48 + $scope.getWindowSize().w;
          }
        };

        $scope.getWindowSize = function() {
          var w = $scope.element.parent().width() - 5,
            h = $scope.element.parent().height(),
            len = $scope.getLength();

          return {
            w: w - 48 * len,
            h: h
          };
        };
      }]
    };
  }).directive('accordion2', function() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      require: '^?accordions',
      template: [
        '<div class="li slide" style="height: 100%;">',
        '<h2 ng-class="{true:\'selected\'}[group.active]" ng-click="select()" ng-style="{\'left\': \'{{getLeft($index)}}px\',\'width\': \'{{getWindowSize().h}}px\'}" style="left: {{getLeft($index)}}px; height: 40px; width: {{getWindowSize().h}}px;">',
        '<span class="text-overflow">{{group.name}}</span><b>{{$index+1}}</b>',
        '</h2>',
        '<div ng-if="group.active" ng-style="{\'left\':\'{{getLeft($index)+48}}px\',\'width\':\'{{getWindowSize().w}}px\'}" style="left:{{getLeft($index)+48}}px; width: {{getWindowSize().w}}px;" ng-transclude></div>',
        '</div>'
      ].join(""),
      scope: false,
      controller: ["$scope", "$timeout", function($scope, $timeout) {
        $scope.$on('window.resize', function(event, data) {
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });

        $scope.select = function() {
          for (var i = 0, len = $scope.$parent.$parent.getLength(); i < len; i++) {
            if ($scope.group === $scope.$parent.$parent.groups[i]) {
              //if (!$scope.group.active) {
              $scope.$parent.$parent.groups[i].active = true;
              $scope.$parent.$broadcast('accordion.active', $scope.group);
              //}
            } else {
              $scope.$parent.$parent.groups[i].active = false;
            }
          }
        };

        if ($scope.group.active) {
          $scope.$broadcast('accordion.active', $scope.group);
        }

      }]
    };
  });

