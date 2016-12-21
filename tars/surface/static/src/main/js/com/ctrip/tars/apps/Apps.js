$import("com.ctrip.tars.component.IScroll");
$import("com.ctrip.tars.component.ISearch");
$import("com.ctrip.tars.util.Fridge");
$import("com.ctrip.tars.util.Id");

$import("com.ctrip.tars.apps.Service");

angular
  .module("com.ctrip.tars.apps")
  .controller("com.ctrip.tars.apps.Controller", ['$scope', '$rootScope', '$timeout', 'com.ctrip.tars.apps.Service', function($scope, $rootScope, $timeout, service) {
    $scope.scroller = null;
    $scope.filters = null;

    service.reset();
    service.clear();
    service.first(null, {
      "search": $scope.filters
    });

    $scope.$on('search.apps', function(event, filters) {
      if ($scope.filters === filters || ($scope.filters && filters && $scope.filters.trim().equals(filters.trim()))) {
        return;
      }
      $scope.filters = filters;
      service.reset();
      service.clear();
      service.first(null, {
        "search": filters
      });
    });

    $scope.apps = service.getData().toArray("$$index", false);
    $scope.$on('com.ctrip.tars.apps.service.update', function(event, data) {
      $scope.apps = service.getData().toArray("$$index", false);
      $scope.popouts = $scope.apps;

      if (!$scope.$$phase) {
        $scope.$apply();
      }

      if (!$scope.scroller) {
        $scope.scroller = new com.ctrip.tars.component.IScroll("#apps-scroller", {
          top: 0,
          bottom: 0,
          sensitive: {}
        }, function(callback) {
          service.next(callback);
        }, function(callback) {
          // service.refresh(null, {
          //   "search": $scope.filters
          // });
          callback();
        });
      }

      $timeout(function() {
        if ($scope.scroller) {
          $scope.scroller.refresh();
        }
      }, 1000, false, null);

      return false;
    });

    $scope.$on('tab.apps.show', function(event, data) {
      return false;
    });

    $scope.favorite = function(app) {
      $rootScope.$broadcast('subscriptions.favorite.send', app);
    };

    $scope.$on('subscriptions.favorite.feedback', function(event, data) {
      var flag = false;
      if (data.favorite) {
        service.filterData({
          webId: data.webId
        }, function(i, v, vs) {
          v.favorite = "active";
          v.subscribed = true;

          flag = true;
        });

        if (flag) {
          service.update();
        }
      } else {
        service.filterData({
          webId: data.webId
        }, function(i, v, vs) {
          v.favorite = "";
          v.subscribed = false;

          flag = true;
        });

        if (flag) {
          service.update();
        }
      }
      return false;
    });
    /*
    $scope.isearch = new com.ctrip.tars.component.ISearch(".global-search", {
      store: {
        type: "GET",
        contentType: 'application/json',
        local: false,
        url: [TEST_URL, 'common/clusters'].join(""),
        data: {
          start: 1,
          end: 10
        }
      },
      setUpBefore: function(data) {
        return data.data;
      },
      setUp: function(data) {
        data.favorite = data.subscribed ? "active" : "";
        data.healthLevel = data.healthLevel > 0 ? 1 : 0;
        return data;
      },
      template: [ // resource.status experimental updated new
        '<li class="list-group-item">', '<h5 class="list-group-item-heading"><span class="global-search-suggest-keyword">{{ name }}</span>',

        '<span class="pull-right {{favorite}}" ng-click="favorite();"><i class="fa fa-heart"></i></span></h5>',

        '<p class="list-group-item-text" style="color: #616161;font-size: 12px;padding: 8px 16px;">AppId ( {{id}} ).</p>', '</li>'

      ],
      listeners: {
        favorite: function(data, e) {
          $(this).toggleClass("active");
          $rootScope.$broadcast('subscriptions.favorite.send', data);

          e.stopPropagation();
          return false;
        }
      }
    });
    */
  }])
  .directive(
    "liApp",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          name: "@dataname",
          id: "@dataid",
          importance: "@dataimportance",
          appVersion: "@dataappversion",
          productLine: "@dataproductline",
          product: "@dataproduct",
          owner: "@dataowner",
          organization: "@dataorganization",
          manager: "@datamanager",
          description: "@datadescription",
          health: "@datahealth",
          favorite: "@datafavorite",
          onMore: "&",
          onFavorite: "&"
        },
        template: [

          '<a href="javascript:void(0);" class="list-group-item" style="margin: 0px 16px 0px 64px; padding: 8px 0px 7px 8px;">',

          '<div class="pull-left">',
          '<div class="img-circle photo-tip active">',
          '<i class="fa fa-sitemap"></i>',
          '</div>',
          '</div>',

          '<expander name="apps">',
          '<expander-head>',
          '<div class="list-group-item-heading">',

          '<div class="container-fluid">',
          '<div class="row">',
          '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">',
          '<h5>{{name}}</h5>',
          '</div>',
          '<div class="col-lg-6 col-md-6 col-sm-6 col-xs-6">',
          '<p ng-click="onMore()" style="margin-right:16px;" class="pull-right"><i class="fa fa-hand-o-right"></i>更多... </p>',
          '<p ng-click="onFavorite()" style="margin-right:16px;" class="pull-right"><i class="fa fa-heart"></i></p>',
          '</div>',
          '</div>',
          '</div>',

          '</div>',

          '<p class="list-group-item-text details" style="color: #757575; font-size: 11px; line-height: 18px;">',
          'AppId： {{id}}',
          '</p>',

          '</expander-head>',

          '<expander-body>',
          '</expander-body>',

          '</expander>',

          '</a>'
        ].join("")
      };
    });

