var countdown = angular
  .module("com.ctrip.tars.component.angular.countdown", ['easypiechart'])
  .service('com.ctrip.tars.component.angular.countdown.Service', ['$rootScope', '$http', function($rootScope, $http) {
    return {};
  }]).directive(
    "countdown",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: false,
        template: [

          '<div class="countdown" ng-show="percent >= 0 && percent < 100">',

          '<div class="shadow" style="width:100%;height:100%;"></div>',

          '<div class="content">',
          '<span class="easypie lg" easypiechart ng-init="" percent="percent" options="options">',
          '<span class="second" ng-bind="resttime/1000"></span>',
          '</span>',

          '<div class="title"><span class="logo"></span><span class="name">{{options.title}}</span></div>',

          '<div class="desc">',
          '<span class="text">{{options.desc}}</span>',
          '<span class="point"></span>',
          '</div>',

          '<div class="tools">',
          '<button ng-repeat="btn in options.buttons" role="countdown" type="button" class="btn btn-{{btn.cls}}" ng-click="handler(btn, $index)">',
          '<i class="fa fa-{{btn.icon}}"></i>&nbsp;&nbsp;{{btn.text}}',
          '</button>',
          '</div>',

          '</div>',

          '</div>'

        ].join(""),
        link: function(scope, element, attrs) {
          if (element.parent() == $("body")) {
            var width = Math.max($(window).width(), $("body").width());
            var height = Math.max($(window).height(), $("body").height());

            element.css({
              top: 0,
              left: 0,
              width: width,
              height: height
            });
          }

          scope.element = element;
        },
        controller: ['$scope', '$interval',
          'com.ctrip.tars.component.angular.countdown.Service',
          function($scope, $interval, service) {

            $scope.percent = -1;
            $scope.resttime = 0;
            $scope.promise = null;

            $scope.options = {
              barColor: "#ffffff",
              trackColor: "#212121",
              scaleLength: 0,
              lineCap: 'round',
              lineWidth: 3,
              size: 196,
              rotate: 0,
              animate: {
                duration: 1000,
                enabled: true
              },
              title: 'Tars'
            };

            $scope.cancel = function() {
              $scope.resttime = 0;
              $scope.percent = -1;

              if ($scope.promise) {
                $interval.cancel($scope.promise);
              }
            };

            $scope.flush = function() {
              if ($scope.resttime <= 0) {
                $scope.cancel();

                if ($scope.options.handler) {
                  $scope.options.handler();
                }
              }

              $scope.resttime -= 1000;
              $scope.percent = Math.floor($scope.resttime * 100 / $scope.seconds);
            };

            $scope.handler = function(btn, index) {

              $scope.cancel();

              if (index === 0) {
                if ($scope.options.handler) {
                  $scope.options.handler();
                }
              } else {
                btn.handler();
              }
            };

            $scope.$on('countdown.update', function(event, seconds, options) {

              if (!Object.isNumber(seconds) || seconds <= 0) {
                return false;
              }

              if ($scope.promise) {
                $interval.cancel($scope.promise);
              }

              if (seconds > 1000 * 100) {
                seconds = 1000 * 100;
              }

              $.extend(true, $scope.options, options);
              $scope.resttime = seconds;
              $scope.seconds = seconds;
              $scope.percent = 100;

              $scope.promise = $interval($scope.flush, 1000, 0, true, $scope.options);

              event.stopPropagation();
              return false;
            });

            //$scope.options = { animate:true, barColor:'#E67E22', scaleColor:false, lineWidth:3, lineCap:'butt' };


          }
        ]
      };
    });

