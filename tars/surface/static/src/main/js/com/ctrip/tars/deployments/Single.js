tarsPortal.controller("com.ctrip.tars.deployments.single.Controller", ['$scope', '$rootScope', function($scope, $rootScope) {

  var deployByGroup = function() {
    var urlParams = $scope.getURLParams();
    $scope.group = {
      id: urlParams[URL_PARAMS.GROUP],
      active: true
    };
    $scope.$broadcast('deployment.group.update', $scope.group);
  };

  $scope.$on('deployment.app.update', function(event, data) {
    deployByGroup();
  });

  $scope.$on('group.id.change', function(event, data) {
    deployByGroup();
  });

  $scope.$emit('deployment.ready');

  /*
  	var layout = function() {
  		var origin = {
  			width: 0,
  			height: 0
  		};

  		var size = {
  			width: 0,
  			height: 0
  		};

  		var width = $(window).width(),
  			height = $(window).height(),
  			w = 0,
  			h = 0;

  		if (width < 768) {
  			h = height - 48 - 48 + 8;
  		} else if (width < 992) {
  			h = height - 560;
  		} else if (width < 1200) {
  			h = height - 560;
  		} else {
  			h = height - 560;
  		}
  		h += 32;
  		if (!$scope.isSingle()) {
  			h -= 40;
  		}

  		//if (h < 272) {
  		//  origin.height = 272 - h;
  		//}

  		size.height = h + origin.height;

  		return size;
  	};

  	$scope.size = layout();

  	$scope.$on('window.resize', function(event, data) {
  		$scope.size = layout();
  		
  		//if (!$scope.$$phase) {
  		//	$scope.$apply();
  		//}
  		return false;
  	});
  */

}]);

