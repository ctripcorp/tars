$import("js.util.ArrayList", "BootstrapClassLoader");
var notification = angular.module("com.ctrip.tars.component.angular.notification", []).service(
    'com.ctrip.tars.component.angular.notification.Service', ['$rootScope', '$http', function($rootScope, $http) {
      return {
        //Inserts the specified element into this queue if it is possible to do so immediately without violating capacity restrictions, returning true upon success and throwing an IllegalStateException if no space is currently available.
        add: function(e) {
          if (this.notifications.size() >= 100) {
            this.notifications.removeAt(0);
          }
          this.notifications.add(e);
        },
        //Retrieves and removes the head of this queue, or returns null if this queue is empty.
        poll: function() {
          return (this.notifications.size() > 0) ? this.notifications.removeAt(0) : null;
        },

        remove: function(value) {
          if (this.notifications.contains(value)) {
            this.notifications.remove(value);
          }
        },
        notifications: new js.util.ArrayList()
      };
    }]).controller(
    "com.ctrip.tars.component.angular.notification.Controller", ['$scope', 'com.ctrip.tars.component.angular.notification.Service',
      function($scope, service) {

        $scope.poll = function(index) {
          var notification = null;
          if (!Object.isNull(index)) {
            if (index >= 0 && index <= $scope.notifications.length - 1) {
              notification = $scope.notifications[index];
              service.remove(notification);
              $scope.notifications.splice(index, 1);
            }
            return;
          }

          if ($scope.notifications.length > 0) {
            $scope.notifications.splice(0, 1);
          }

          notification = service.poll();

          if (!!notification) {
            $scope.notifications.push(notification);
          }
        };

        var flag = false;

        $scope.$on('dispatcher.interval.timer', function(event, data) {
          $scope.poll();
          /*
                      if (!$scope.$$phase) {
                          $scope.$apply();
                      }*/
        });

        $scope.notifications = [];
      }
    ])

  .directive("notification", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        title: "@datatitle",
        content: "@datacontent",
        onHandle: '&',
        onClose: '&'
      },
      template: [
        '<div class="cbp-spmenu cbp-spmenu-horizontal cbp-spmenu-top cbp-spmenu-open">',
        '<a class="cbp-spmenu-row" href="javascript:void(0);" ng-click="onHandle()">',
        '<h3>{{title}}</h3> <p>{{content}}</p>',
        '<div ng-click="onClose();" class="cbp-spmenu-remove"></div>',
        '</a>',
        '</div>'
      ].join(""),
      controller: ["$scope", function($scope) {

      }]
    };
  })
  .directive("notifications", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {

      },
      template: [
        '<div class="cbp-spmenu cbp-spmenu-horizontal cbp-spmenu-top cbp-spmenu-open">',
        '<notification ng-repeat="notification in $parent.notifications track by $index"',
        'datatitle="{{notification.title}}" datacontent="{{notification.content}}"',
        'on-handle="notification.handler()" on-close="$parent.$parent.poll($index);">',
        '</notification>',
        '</div>'
      ].join(""),
      controller: ["$scope", function($scope) {

      }]
    };
  });

