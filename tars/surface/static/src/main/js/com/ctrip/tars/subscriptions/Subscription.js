//$import("com.ctrip.tars.component.IScroll");
var subscriptions = angular
  .module("com.ctrip.tars.subscriptions", [])
  .service('com.ctrip.tars.subscriptions.Service', ['$rootScope', '$http', function($rootScope, $http) {

    var validate = function(d) {
      d.favorite = d.subscribed ? "active" : "";
      d.healthLevel = d.healthLevel > 0 ? 1 : 0;

      return d;
    };

    var loadData = function(start, end, username, fn) {
      end = end || (start + PAGE_SIZE);
      $http({
        method: 'GET',
        // 本地测试
        url: [TEST_URL, "common/clusters"].join("")
      }).success(function(data, status, headers, config) {
        if (data.success) {
          var d = data.data || [];
          for (var i = 0, len = d.length; i < len; i++) {
            if (start > 1) {
              service.subscriptions.push(validate(d[i]));
            } else {
              service.subscriptions[i] = validate(d[i]);
            }
          }
          if (fn) {
            fn(d);
          }
        }
      });
    };
    // 添加订阅
    var favorite = function(flag, webId, username, fn) {
      $http({
        method: 'POST',

        // 本地测试
        url: [TEST_URL, "common/sub/", username].join("")

        // 生产测试
        // url : [ TEST_URL, (flag ? 'sub' : 'rmsub'), webId, username
        // ].join("/")

      }).success(function(data, status, headers, config) {
        if (data.success) {
          if (fn) {
            fn(data);
          }

          $rootScope.$broadcast('subscriptions.favorite.feedback', {
            data: data,
            favorite: flag,
            webId: webId
          });
        }
      });
    };

    var service = {
      subscriptions: [],

      favorite: function(webId, username, fn) {
        favorite(true, webId, username, fn);
      },

      unfavorite: function(webId, username, fn) {
        favorite(false, webId, username, fn);
      },

      update: function(d, fn) {
        $rootScope.$broadcast('subscriptions.update');
        if (fn) {
          fn.call(this, d);
        }
      },
      first: function(username, fn) {
        this.subscriptions.clear();
        loadData(1, null, username, function(d) {
          service.update(d, fn);
        });
      },

      refresh: function(username, fn) {
        loadData(1, this.subscriptions.length, username, function(d) {
          service.update(d, fn);
        });
      },

      next: function(username, fn) {
        loadData(this.subscriptions.length + 1, null, username, function(d) {
          service.update(d, fn);
        });
      },

      filterData: function(map, fn) {

        var data = [];
        for (var i = 0, len = this.subscriptions.length; i < len; i++) {
          var app = this.subscriptions[i];

          if (app) {
            for (var key in map) {
              var value = map[key];

              if (app[key] !== value) {
                app = null;
                break;
              }
            }
          }

          if (app) {
            data.push(app);
            if (fn) {
              var flag = fn(i, app, this.subscriptions);

              if (flag) {
                return this.filterData(map, fn);
              } else if (false === flag) {
                return data;
              }
            }
          }
        }
        return data;
      }
    };

    return service;
  }])
  .controller("com.ctrip.tars.subscriptions.Controller", ['$scope', '$rootScope', '$timeout', 'com.ctrip.tars.subscriptions.Service', function($scope, $rootScope, $timeout, service) {
    var username = $scope.user.getUsername();
    $scope.scroller = null;
    $scope.$on('subscriptions.update', function(event) {
      $scope.subscriptions = service.subscriptions;
      /*
               if (!$scope.$$phase) {
                   $scope.$apply();
               }*/

      if ($scope.scroller) {
        // $scope.scroller.refresh();
      } else {
        /*
				$scope.scroller = new com.ctrip.tars.component.IScroll("#subscriptions-scroller", {
					top : 8,
					bottom : 8,
					innerHeight: 32,
					sensitive: {}
				}, function(fn) {
					service.next(username, fn);
				}, function(fn) {
					service.refresh(username, fn);
				});

                $timeout(function() {
                    if ($scope.scroller) {
                        $scope.scroller.refresh();
                    }
                }, 1000, false, null);

                */
      }
      return false;
    });

    $scope.$on('subscriptions.favorite.send', function(event, subscription) {
      if (subscription.favorite) {
        service.unfavorite(subscription.webId, username);
      } else {
        service.favorite(subscription.webId, username);
      }
      return false;
    });

    $scope.$on('subscriptions.favorite.feedback', function(event, data) {
      if (!data.favorite) {
        var flag = false;

        service.filterData({
          webId: data.webId
        }, function(i, v, vs) {
          vs.splice(i, 1);
          flag = true;
          return true;
        });

        if (flag) {
          service.update();
        }
      }
      return false;
    });

    $scope.favorite = function(subscription) {
      $rootScope.$broadcast('subscriptions.favorite.send', subscription);
    };

    service.first(username);
    $scope.subscriptions = service.subscriptions;
  }])
  .directive(
    "liSubscription",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          name: "@dataname",
          errLogCurr: "@dataerrlogcurr",
          visitCurr: "@datavisitcurr",
          costCurr: "@datacostcurr",
          releaseNumber: "@datareleasenumber",
          domainName: "@datadomainname",
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

          '<expander name="subscriptions">',
          '<expander-head>',
          '<div class="list-group-item-heading">',
          '<h5>{{name}}</h5>',
          '<h4 ng-click="onFavorite()" class="pull-right"><i class="fa fa-heart"></i></h4>',
          '<p ng-click="onMore()" class="pull-right">更多信息 <i class="glyphicon glyphicon-play-circle"></i></p>',
          '</div>',

          '<p class="list-group-item-text details" style="color: #757575; font-size: 11px; line-height: 18px;">',
          '错误数：{{errLogCurr}}&nbsp;&nbsp;&nbsp;&nbsp;访问数：{{visitCurr}} &nbsp;&nbsp;&nbsp;&nbsp; HTTP访问时间：{{costCurr}}毫秒 &nbsp;&nbsp;&nbsp;&nbsp; 最后一次发布单：{{releaseNumber}} &nbsp;&nbsp;&nbsp;&nbsp; 发布节点名：{{domainName}}',

          '<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> {{monitorTime}}</small>', '</p>',

          '</expander-head>', '<expander-body>', '</expander-body>',

          '</expander>', '</a>'

        ].join("")
      };
    });

