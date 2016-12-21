tarsPortal.controller("com.ctrip.tars.navigator.Controller", ['$scope', '$rootScope', '$location',
  function($scope, $rootScope, $location) {
    $scope.init = function() {
      /* Sidebar tree view */
      $(".sidebar-menu .treeview").tree();
    };

    $scope.init();
  }
]);

