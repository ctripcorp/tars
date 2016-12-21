angular.module("com.ctrip.tars.header", ['com.ctrip.tars.component.angular.tooltip'])
  .controller("com.ctrip.tars.header.Controller", ['$scope', '$rootScope', '$location',
    function($scope, $rootScope, $location, service) {

      $scope.init = function() {
        /*
        $('a[data-toggle="tooltip"]').tooltip({
          container: 'body'
        });
        */
      };
    }
  ]);

