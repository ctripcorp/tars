$import("com.ctrip.tars.component.Dragmove");

var postmark = angular.module("com.ctrip.tars.component.angular.postmark", []).service('com.ctrip.tars.component.angular.postmark.Service', ['$rootScope', '$http', function($rootScope, $http) {
    return {};
  }])
  .controller("com.ctrip.tars.component.angular.postmark.Controller", ['$scope', 'com.ctrip.tars.component.angular.postmark.Service',
    function($scope, service) {}
  ])
  .directive("postmark", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: false,
      template: ['<div class="postmark"><div class="mark"><div class="date">{{ date }}</div><div class="time">{{ time }}</div></div></div>'].join(""),
      link: function(scope, element, attributes, postmarkController) {
        element.dragmove();
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
      controller: ["$scope", function($scope) {}]
    };
  });

