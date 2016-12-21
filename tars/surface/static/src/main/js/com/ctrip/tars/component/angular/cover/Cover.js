$import("com.ctrip.tars.util.Angular");
var countdown = angular
  .module("com.ctrip.tars.component.angular.cover", [])
  .directive(
    "cover",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: false,
        template: [
          '<div class="cover" style="display: none;">',
          '<div class="shadow" style="width:100%; height:100%;"></div>',
          '<div class="content" ng-style="{true: {\'marginTop\': \'10%\'}, false: {\'marginTop\': \'30%\'} }[isSingle()]">',
          '<div class="title">被刹车啦！</div>',
          '<div class="tools">',
          '<button ng-click="close()" class="btn btn-default btn-xs" style="-webkit-border-radius: 0px; border-radius: 0px; margin: 4px;">',
          '红色波纹代表被刹车哦！&nbsp;&nbsp;关闭提示&nbsp;<i class="fa fa-close"></i>',
          '</button>',
          '</div>',
          '<div class="desc">',
          '<p style="margin-left: 0px;">当前发布被刹车：</p>',
          '<p>1.集群内提供线上服务的机器数量已少于即将执行发布的机器数量，请关注拉入拉出状态；</p>',
          '<p>2.如果您确认需要继续发布应用，可点击操作区继续发布按钮；</p>',
          '<p>3.如果继续发布后仍旧被刹车，代表您的应用已经被拉出超过25%的机器，如仍旧需要发布，请终止当前发布并选择5%的并发拉出比例重新发布。</p>',
          '</div>',
          '</div>',
          '<div class="tips">',
          '<div class="tip tip-1"><div class="arrow-top-right2 arrow"/><div class="summary">回退此次发布</div></div>',
          '<div class="tip tip-2"><div class="summary">忽略刹车</div><div class="summary">继续发布</div><div class="arrow arrow-bottom-left2"/></div>',
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

          element.find(".title").textillate({
            autoStart: false,
            in: {
              effect: 'bounceInDown'
            },
            out: {
              effect: 'hinge',
              shuffle: true
            }
          });

          element.find(".desc").textillate({
            autoStart: false,
            in: {
              effect: 'pulse'
            },
            out: {
              effect: 'hinge',
              shuffle: true
            }
          });

          element.find(".summary").textillate({
            autoStart: true,
            loop: true,
            in: {
              effect: 'tada'
            },
            out: {
              effect: 'tada'
            }
          });

          element.find(".title").textillate('start');
          element.find(".desc p").textillate('start');

          scope.element = element;
        },
        controller: ['$scope', '$interval', function($scope, $interval) {

          var origin2 = ".app-status-toolbar",
            origin1 = ".airmobile",
            wait = 0;

          $scope.cover = function() {

            var welcome = com.ctrip.tars.util.Angular.getScope("#com-ctrip-tars-welcome");

            if (welcome.show || $(origin1).length <= 0 || $(origin2).length <= 0 || (!$scope.isSingle() && $(".ContentFlow>.flow>.item.active").length <= 0)) {
              return false;
            }

            $scope.element.show();

            var reference = $scope.element.parent().offset(),
              tip2 = $scope.element.find(".tip.tip-2"),
              tip1 = $scope.element.find(".tip.tip-1");

            var offset = $(origin2).offset(),
              width = $(origin2).width(),
              height = $(origin2).height();

            var origin = {
              left: 0,
              top: 0
            };

            if (!$scope.isSingle()) {
              origin.left = 108;
              origin.top = 24;
            }

            tip2.css({
              top: offset.top - reference.top - height - 56 + origin.top,
              left: offset.left - reference.left + width / 2 + origin.left
            });

            offset = $(origin1).offset();
            width = $(origin1).width();
            height = $(origin1).height();


            tip1.css({
              top: offset.top - reference.top + height,
              left: offset.left - reference.left + width / 2 - tip1.width() + 32
            });

            $(origin1).addClass("cover-ref cover-ref-z");
            $(origin2).addClass("cover-ref cover-ref-z");
            $(".ContentFlow>.flow>.item.active").addClass("cover-ref-z");
          };

          $scope.close = function() {
            if ($scope.promise) {
              $interval.cancel($scope.promise);
              $scope.promise = null;
            }
            $scope.element.hide();
            $scope.element.find(".title").textillate('stop');
            $scope.element.find(".desc").textillate('stop');
            $(origin1).removeClass("cover-ref cover-ref-z");
            $(origin2).removeClass("cover-ref cover-ref-z");
            $(".ContentFlow>.flow>.item").removeClass("cover-ref-z");
          };

          $scope.$on('cover.show', function(event, data) {
            if ($scope.promise) {
              $interval.cancel($scope.promise);
              $scope.promise = null;
            }
            $scope.promise = $interval($scope.cover, 1000, 0, false);
          });

          $scope.$on('cover.hide', function(event) {
            $scope.close();
          });
        }]
      };
    });

