var action = angular.module("com.ctrip.tars.component.angular.action", [
  "com.ctrip.tars.component.angular.tooltip",
  "com.ctrip.tars.component.angular.ink.Ink"
]).directive("action", function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      size: '@datasize',
      left: '@dataleft',
      marginLeft: '@datamarginleft',
      title: '@datatitle',
      icon: '@dataicon',
      text: '@datatext',
      disabled: '@datadisabled',
      effect: '@dataeffect',
      active: '@dataactive',
      onHandle: '&'
    },
    template: [
      '<div shine ink data-toggle="tooltip" tooltip role="button" ',
      'ng-disabled="{ true: \'disabled\' }[ disabled ]" ',
      'ng-class="{true: \'active\'}[active]" class="img-circle action-button action-button-{{size}}" ',
      'ng-style="{ \'left\': \'{{left}}\', \'marginLeft\': \'{{marginLeft}}\' }" data-title="{{title}}" ',
      'style="left: {{left}}; margin-left: {{marginLeft}};" ',
      'ng-click="handle()">',
      '<i class="fa fa-{{icon}}"></i>',
      '<span>{{text}}</span>',
      '<span ng-transclude></span>',
      '</div>'
    ].join(""),
    link: function(scope, element, attributes, controller) {},
    /*
		compile: function(element, attributes) {
			return {
				pre: function preLink(scope, element, attributes) {

				},
				post: function postLink(scope, element, attributes) {
          element.tooltip({
						title: attributes.title
					});
				}
			};
		},
    */
    controller: ["$scope", function($scope) {
      $scope.shine = $scope.effect;
      $scope.handle = function() {
        if ($scope.disabled == 'true') {
          return;
        }
        $scope.onHandle();
      };
    }]
  };
}).directive("waiting", function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      size: '@datasize',
      left: '@dataleft',
      marginLeft: '@datamarginleft',
      title: '@datatitle',
      onHandle: '&'
    },
    template: [
      '<div data-toggle="tooltip" tooltip class="img-circle action-button-rotate action-button-{{size}} spinner light" data-title="{{title}}" ',
      'ng-style="{ \'left\': \'{{left}}\', \'marginLeft\': \'{{marginLeft}}\' }" ',
      'style="left: {{left}}; margin-left: {{marginLeft}};position: absolute;">',
      '<div class="spinner-container container-1">',
      '<div class="circle-1"></div><div class="circle-2"></div><div class="circle-3"></div><div class="circle-4"></div>',
      '</div>',
      '<div class="spinner-container container-2">',
      '<div class="circle-1"></div><div class="circle-2"></div><div class="circle-3"></div><div class="circle-4"></div>',
      '</div>',
      '<div class="spinner-container container-3">',
      '<div class="circle-1"></div><div class="circle-2"></div><div class="circle-3"></div><div class="circle-4"></div>',
      '</div>',
      '</div>',
    ].join(""),
    link: function(scope, element, attributes, controller) {},
    /*
		compile: function(element, attributes) {
			return {
				pre: function preLink(scope, element, attributes) {

				},
				post: function postLink(scope, element, attributes) {
          element.tooltip({
						title: attributes.title
					});
				}
			};
		},
    */
    controller: ["$scope", function($scope) {}]
  };
});

