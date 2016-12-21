$import("com.ctrip.tars.component.IContentFlow");

var contentflow = angular.module("com.ctrip.tars.component.angular.contentflow", [])
  .directive("contentflow", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: false,
      template: [
        '<div class="ContentFlow" style="height: 100%; overflow: visible;">',
        '<div class="loadIndicator"><div class="indicator"></div></div>',

        '<div class="flow" ng-transclude></div>',

        '<div class="globalCaption" style="position: absolute; width: 100%; bottom: 16px; height: 24px; margin: 0px;"></div>',

        //'<div class="scrollbar" style="position: absolute; left: 25%; bottom: 0px; margin: 0px;">',
        //'<div class="preButton"></div>',
        //'<div class="nextButton"></div>',
        //'<div class="slider">',
        //'<div class="position"></div>',
        //'</div>',
        '</div>',

        '</div>',
      ].join(""),
      link: function(scope, element, attributes, controller) {
        scope.element = element;

        ContentFlowGlobal.Flows.clear();
        scope.contentflow = new ContentFlow(element[0], {
          reflectionHeight: 0,
          reflectionGap: 0,
          reflectionColor: "#000000",
          circularFlow: false,
          visibleItems: -1,
          maxVisibleItems: 2,
          endOpacity: 1,
          scaleFactor: 1,
          scaleFactorLandscape: 1.5,
          scaleFactorPortrait: 1,
          fixItemSize: false,
          loadingTimeout: 0,
          scrollInFrom: 'none',
          flowSpeedFactor: 1.38,
          flowDragFriction: 0,
          scrollWheelSpeed: 0,
          relativeItemPosition: 'top center',
          relativeZIndex: 990,
          onMoveTo: function(item) {},
          onDrawItem: function(item) {},
          onMakeActive: function(item) {
            /*
            var scope = angular.element(item.element).scope();
            if (scope && scope.group) {
              scope.$apply(function() {
                scope.group.active = true;
              });
            }
            */
          },
          onReachTarget: function(item) {
            var scope = angular.element(item.element).scope();
            if (scope && scope.group) {
              scope.$apply(function() {
                scope.group.active = true;
              });
            }
          },
          onMakeInactive: function(item) {
            var scope = angular.element(item.element).scope();
            if (scope && scope.group) {
              scope.$apply(function() {
                scope.group.active = false;
              });
            }
          },
          calcSize: function(item) {
            var rP = item.relativePosition;
            //var rPN = relativePositionNormed;
            //var vI = rPN != 0 ? rP/rPN : 0 ; visible Items
            //var items = this.getNumberOfItems();

            var h = 1;

            var s = 0.42;
            var dH = 0.46;
            h *= (Math.normDist(rP, s) + dH) / (Math.normDist(0, s) + dH);

            var w = h;

            //items === 1 ? element.parent().width() / (this.maxHeight + 8) : 
            var k = 1 / (Math.abs(rP) + 1) * element.parent().width() / element.parent().height() * dH;

            return {
              width: 1.5 * k * w,
              height: Math.min((Math.abs(rP), 1)) * h
            };
          },
          calcCoordinates: function(item) {
            var rP = item.relativePosition;
            var rPN = item.relativePositionNormed;
            var vI = rPN !== 0 ? rP / rPN : 0; // visible Items

            var items = this.getNumberOfItems();
            if (items === 2) {
              vI *= 2;
            }

            var k = Math.pow(1.8, Math.abs(rP));

            var z = item.side * (1 - Math.normedNormDist(rP, 0.5)) / k; // runs from -0.25 ... 0 ... 0.25

            var f = Math.sqrt(Math.erf2(rP)) * 1.3;

            var x = rP / (vI + 1) * f + z; // normalized to (vI+1)
            var y = 1;

            return {
              x: x,
              y: y
            };
          }
        });

        scope.contentflow.scope = scope;
        scope.contentflow.init();
      },
      controller: ["$scope", "$compile", "$interval", "$timeout", function($scope, $compile, $interval, $timeout) {
        var refersh = function(index) {
          var value = null,
            flag = false,
            items = null;
          for (var i = 0; i < $scope.rmQueue.size();) {
            value = $scope.rmQueue.get(i);
            flag = false;
            for (var j = 0, len = $scope.contentflow.getNumberOfItems(); j < len; j++) {
              if ($scope.contentflow.getItem(j).element.hasClassName("item-" + value.id)) {
                $scope.contentflow.rmItem(j);
                $scope.rmQueue.removeAt(i);
                flag = true;
                break;
              }
            }
            if (!flag) {
              i++;
            }
          }

          for (i = 0; i < $scope.addQueue.size();) {
            value = $scope.addQueue.get(i);
            items = $scope.contentflow.Flow.getChildrenByClassName('item-' + value.id);
            if (items && items.length > 0) {
              $scope.contentflow.addItem(items[0], "last");
              $scope.addQueue.removeAt(i);
              continue;
            }
            i++;
          }

          if ($scope.addQueue.size() > 0 || $scope.rmQueue.size() > 0 || $scope.contentflow.getNumberOfItems() <= index) {
            $timeout(function(index) {
              refersh(index);
            }, 100, true, index);
          } else {
            if ($scope.contentflow.getNumberOfItems() > index) {
              var active = $scope.contentflow.getActiveItem();
              if (active && active.index == index) {
                return;
              } else {
                $scope.contentflow._currentPosition = index;
                $scope.contentflow._activeItem = $scope.contentflow.getItem(index);
                if ($scope.contentflow._activeItem) {
                  $scope.contentflow._activeItem.makeActive();
                  $scope.contentflow._setCaptionLabel($scope.contentflow._activeItem.index);
                }
                $scope.contentflow.moveTo(index);
                $scope.contentflow.resize();
              }
            }
          }
        };
        $scope.$on("accordion.refersh", function(event, data) {
          var urlParams = $scope.getURLParams(),
            active = null,
            index = 0;
          for (var i = $scope.groups.length - 1; i >= 0; i--) {
            if ($scope.groups[i].active) {
              active = $scope.groups[i];
              index = i;
            } else if (active) {
              $scope.groups[i].active = false;
            } else if ($scope.groups[i].id == urlParams.group) {
              $scope.groups[i].active = true;
              active = $scope.groups[i];
              index = i;
            } else if (!active && i === 0) {
              $scope.groups[i].active = true;
              active = $scope.groups[i];
              index = i;
            } else {
              $scope.groups[i].active = false;
            }
          }
          refersh(index);
        });

        $scope.$on("sidebar.collapse.running", function(event, on, ratio) {
          $scope.contentflow.resize();
        });

        $scope.$on("sidebar.collapse.on", function(event, on) {
          $scope.contentflow.resize();
        });

        $scope.$on("concern.watching.on", function(event, offset) {
          $scope.contentflow.resize();
        });

        $scope.$on('window.resize', function(event, data) {
          $scope.contentflow.resize();
        });

        //$interval(function() {}, 100, 0, true);
      }]
    };
  }).directive("contentflowItem", function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: true,
      template: [
        '<div class="item item-{{group.id}}" active="{{group.active}}" style="border: 0px none; padding: 8px;">', //flat-card
        '<div class="content" style="border: 0px none; background: transparent;" ng-transclude></div>',
        //ng-class="{true: \'flat-card\'}[group.active]" border-radius: 8px; -webkit-border-radius: 8px;
        '<div class="caption">{{group.name}}（GroupId：{{group.id}}）</div>',
        '<div style="height:10px;width:1px;"></div>',
        '</div>'
      ].join(""),
      link: function(scope, element, attributes, controller) {},
      controller: ["$scope", function($scope) {}]
    };
  });

