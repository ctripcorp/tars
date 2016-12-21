tarsPortal.controller("com.ctrip.tars.deployments.tabs.Controller", ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.tabs = new js.util.HashMap();

  $scope.tabs.put("app", {
    active: true,
    id: "app",
    name: "应用发布"
  });
  /*
	$scope.tabs.put("pools", {
		active: false,
		id: "pools",
		name: "Pools"
	});
	$scope.tabs.put("cis", {
		active: false,
		id: "cis",
		name: "CIs"
	});
	*/
  $scope.switchTab = function(name) {
    var tabs = $scope.tabs,
      tab = tabs.get(name);
    if (tab && !tab.active) {
      tab.active = true;
      var it = tabs.keySet().iterator();
      while (it.hasNext()) {
        var key = it.next(),
          value = tabs.get(key);
        if (!key.equals(name)) {
          value.active = false;
        }
      }
    }
  };

  $scope.isActiveTab = function(name) {
    var tab = $scope.tabs.get(name);
    return tab && tab.active;
  };

  $scope.getTabValues = function() {
    return $scope.tabs.values().toArray();
  };

}]);

