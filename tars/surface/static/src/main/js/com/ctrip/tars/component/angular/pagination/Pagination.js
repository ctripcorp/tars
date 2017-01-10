var pagination = angular.module("com.ctrip.tars.component.angular.pagination", []).service(
    'com.ctrip.tars.component.angular.pagination.Service', ['$rootScope', '$http', function($rootScope, $http) {
      return {};
    }]).controller(
    "com.ctrip.tars.component.angular.pagination.Controller", ['$scope', 'com.ctrip.tars.component.angular.pagination.Service',
      function($scope, service) {

        $scope.currentPage = 0;
        $scope.total = 0;
        $scope.pageSize = 10;
        $scope.currentNum = 0;
        $scope.endNum = 0;

        $scope.pageNos = [];

        $scope.refresh = function(data) {

          var pageination = $scope.$parent.getPagination(data) || {};

          var total = pageination.total,
            pageSize = pageination.pageSize,
            from = pageination.from,
            to = pageination.to;

          if (!total) {
            total = 0;
          }
          $scope.pageSize = pageSize || $scope.pageSize;

          if (total <= 0) {
            $scope.currentPage = 0;
            $scope.currentNum = 0;
            $scope.total = 0;
            $scope.endNum = 0;
            $scope.pageNos = [];
            return [];
          }

          if (to >= 0) {
            $scope.currentNum = from || 0;
            $scope.endNum = to;
            $scope.total = total;
            return;
          }

          var x = $scope.currentPage;
          $scope.total = total;

          var pages = [],
            max = Math.ceil(total / pageSize) - 1,
            min = 0;

          if (min > max) {
            x = min;
            $scope.currentPage = 0;
            $scope.currentNum = 0;
            $scope.total = 0;
            $scope.endNum = 0;
            $scope.pageNos = pages;
            return pages;
          }

          if (x < min) {
            x = min;
            $scope.currentPage = min;
          }
          if (x > max) {
            x = max;
            $scope.currentPage = max;
          }

          var cn = x * pageSize;
          $scope.currentNum = cn + 1;

          $scope.endNum = (cn + pageSize >= total) ? total : cn + pageSize;

          if (max - min <= 5) {
            for (var i = min; i <= max; i++) {
              pages.push(i);
            }
          } else {
            if (x - min > 2 && max - x > 2) {
              pages.push(min);
              pages.push(-1);
              for (var j = x - 2; j <= x + 2; j++) {
                pages.push(j);
              }
              pages.push(-1);
              pages.push(max);
            } else if (max - x <= 2) {

              pages.push(min);
              pages.push(-1);

              for (var m = x - 2; m <= max; m++) {
                pages.push(m);
              }

            } else {
              for (var n = min; n <= x + 2; n++) {
                pages.push(n);
              }

              pages.push(-1);
              pages.push(max);
            }
          }
          $scope.pageNos = pages;
          return pages;
        };

        $scope.setCurrentPage = function(page, data) {
          var currentPage = $scope.currentPage;
          $scope.currentPage = page;
          $("button[role='page']").blur();
          $scope.$parent.setCurrentPage(page, currentPage, $scope.pageSize, data);
          /*
				$scope.refresh(data);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
				*/
        };

        $scope.previous = function(data) {
          return $scope.setCurrentPage($scope.currentPage - 1, data);
        };

        $scope.next = function(data) {
          return $scope.setCurrentPage($scope.currentPage + 1, data);
        };

        $scope.reload = function(data) {
          return $scope.$parent.reload($scope.currentPage, $scope.pageSize, data);
        };

        $scope.isLoading = function(data) {
          return $scope.$parent.isLoading(data);
        };

      }
    ])

  .directive("pagination", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {},
      template: [
        '<table border="0" width="100%" align="center" cellpadding="0" cellspacing="0" ng-init="$parent.refresh()">',
        '<tr class="page-no">',
        '<td class="page-summary">从 {currentNum} 到 {endNum} / 共 {total} 条数据</td>',
        '<td width="30" ng-repeat="page in $parent.pageNos track by $index">',
        '<button type="button" class="btn btn-default active" role="page" ng-disabled="$parent.isLoading()" ',
        'ng-class="{active: $parent.currentPage == page}" ng-click="$parent.setCurrentPage(page)" ng-if="page > -1">',
        '{{page}}',
        '</button>',
        '</td>',
        '</tr>',
        '</table>'
      ].join(""),
      controller: ["$scope", function($scope) {

      }]
    };
  }).directive("pagination2", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        data: "@data"
      },
      template: [
        '<div class="btn-group btn-group-sm" ng-init="$parent.refresh(data)">',

        '<button class="btn btn-sorter" ng-click="$parent.previous(data)"><i class="fa fa-backward"></i></button>',
        '<button class="btn btn-sorter disabled" style="background: #efefef; min-width: 224px;"> 从 {{$parent.currentNum}} 到 {{$parent.endNum}}, 每页{{$parent.pageSize}}条 / 共 {{$parent.total}} 条数据</button>',
        '<button class="btn btn-sorter" ng-disabled="$parent.isLoading(data)" ng-click="$parent.next(data)"><i class="fa fa-forward"></i></button>',
        '<button class="btn btn-sorter" ng-disabled="$parent.isLoading(data)" ng-click="$parent.reload(data)"><i class="fa fa-refresh"></i></button>',

        '</div>'
      ].join(""),
      controller: ["$scope", function($scope) {
        $scope.$on('pagination.refresh', function(event) {
          $scope.$parent.refresh($scope.data);
        });
      }]
    };
  });

