var tabpanel = angular.module("com.ctrip.tars.component.angular.tabpanel", []).service('com.ctrip.tars.component.angular.tabpanel.Service', ['$rootScope', '$http', function($rootScope, $http) {
  return {};
}]).controller("com.ctrip.tars.component.angular.tabpanel.Controller", ['$scope', 'com.ctrip.tars.component.angular.tabpanel.Service', function($scope, service) {

}]).directive("tabpanel", function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      classes: '@dataclasses',
      type: '@datatype'
    },
    template: '<div class="nav-tabpanels {{type}} {{classes}}" ng-transclude></div>',
    link: function(scope, element, attrs, tabpanelController) {
      tabpanelController.activeTab();

      //scope.$watch("preference", function(newValue, oldValue) {
      //  tabpanelController.activeTab();
      //});
    },
    controller: ["$scope", function($scope) {

      var headers = [],
        contents = [];

      this.activeTab = function(selectedHeader) {
        var flag = false,
          i = 0,
          len = headers.length;

        if (len <= 0) {
          return;
        }
        for (; i < len; i++) {
          var header = headers[i],
            content = contents[i];

          if (!selectedHeader) {
            if (!flag && header.preference) {
              if (!header.isActive()) {
                $scope.$root.$broadcast('tab.' + header.name + '.show');
              }
              header.active = 'active';
              content.active = 'active';
              flag = true;
            } else {
              header.active = '';
              content.active = '';
            }
            continue;
          }

          if (selectedHeader.disabled) {
            continue;
          }

          if (selectedHeader != header) {
            if (header.isActive()) {
              $scope.$root.$broadcast('tab.' + header.name + '.hide');
            }
            header.active = '';
            content.active = '';
          } else {
            flag = true;
            if (!header.isActive()) {
              $scope.$root.$broadcast('tab.' + header.name + '.show');
            }
            header.active = 'active';
            content.active = 'active';
          }
        }
        if (!flag) {
          if (!headers[0].isActive()) {
            $scope.$root.$broadcast('tab.' + headers[0].name + '.show');
          }
          headers[0].active = 'active';
          contents[0].active = 'active';
        }
      };
      this.addHeader = function(header) {
        headers.push(header);
      };

      this.addContent = function(content) {
        contents.push(content);
      };

    }]
  };
}).directive("tabheaders", function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    require: '^?tabpanel',
    scope: {
      classes: '@dataclasses'
    },
    template: '<ul class="nav nav-tabs tab-header {{classes}}" ng-transclude></ul>'
  };
}).directive("tabheader", function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    require: '^?tabpanel',
    scope: {
      preference: '@active',
      disabled: '@disabled',
      name: '@name',
      classes: '@dataclasses'
    },
    template: '<li class="{{active}} {{classes}}" ng-click="toggle()"><a href="javascript:void(0)" ng-transclude></a></li>',

    link: function(scope, element, attrs, tabpanelController) {
      tabpanelController.addHeader(scope);
      scope.toggle = function() {
        tabpanelController.activeTab(scope);
      };
    },
    controller: ["$scope", function($scope) {
      $scope.isActive = function() {
        return $scope.active == 'active';
      };
    }]
  };
}).directive("tabcontents", function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    require: '^?tabpanel',
    scope: true,
    template: '<div class="tab-content" ng-transclude></div>'
  };
}).directive("tabcontent", function() {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    require: '^?tabpanel',
    scope: true,
    template: '<div class="tab-pane {{active}}" ng-transclude></div>',
    link: function(scope, element, attrs, tabpanelController) {
      tabpanelController.addContent(scope);
    },
    controller: ["$scope", function($scope) {
      $scope.isActive = function() {
        return $scope.active == 'active';
      };
    }]
  };
});

