$import("com.ctrip.tars.component.IFlow2");
$import("com.ctrip.tars.util.Watch");

$import("com.ctrip.tars.progress.Progress");

angular.module("com.ctrip.tars.progress")
  .directive(
    "deploying",
    function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: true,
        template: [
          '<div>',

          '<div class="iflow-palette" style="position: relative; overflow: hidden; height: 182px; color: black;">',
          '<div class="iflow-container" style="width: 100%; height: 100%; position: relative; overflow: hidden;"></div>',
          '</div>',

          //'<p class="track" style="font-size: 16px;">',
          //'<i>版本变更至：</i>{{ getDeploymentVersion(deployment.package) }}<br>',
          //'</p>',
          //'<p class="track" style="font-size: 16px;">',
          //'<i>批次划分：</i>{{ summary.batches }}<br>',
          //'</p>',
          '<div class="container-fluid">',
          '<div class="row">',

          '<div class="col-lg-1 col-md-1 col-sm-1 col-xs-1"></div>',

          '<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2" style="text-align: center;">',
          '总数',
          '<p class="sum" style="font-size: 24px; color: rgba(0, 0, 0, 0.8);"> {{summary.servers}} <i class="fa fa-sitemap unit" style="font-size: 12px;"></i></p>',
          '</div>',
          '<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2" style="border-left: 1px dashed #ccc; text-align: center;">',
          '待执行',
          '<p class="pending" style="font-size: 24px; color: rgba(147, 147, 147, 0.8);"> {{summary.pending}} <i class="fa fa-sitemap unit" style="font-size: 12px;"></i></p>',
          '</div>',
          '<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2" style="border-left: 1px dashed #ccc; text-align: center;">',
          '执行中',
          '<p class="deploying" style="font-size: 24px;"> {{summary.deploying}} <i class="fa fa-sitemap unit" style="font-size: 12px;"></i></p>',
          '</div>',
          '<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2" style="border-left: 1px dashed #ccc; text-align: center;">',
          '已完成',
          '<p class="success" style="font-size: 24px; color: rgba(37, 155, 36, 0.8);"> {{summary.success}} <i class="fa fa-sitemap unit" style="font-size: 12px;"></i></p>',
          '</div>',
          '<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2" style="border-left: 1px dashed #ccc; text-align: center;">',
          '失败数',
          '<p class="failure" style="font-size: 24px; color: rgba(229, 28, 35, 0.8)"> {{summary.failure}} <i class="fa fa-sitemap unit" style="font-size: 12px;"></i></p>',
          '</div>',
          //'<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2" style="border-left: 1px dashed #ccc; text-align: center;">',
          //'revoked',
          //'<p class="revoked" style="font-size: 24px; color: rgba(249, 168, 37, 0.8)"> {{summary.revoked}} <i class="fa fa-sitemap unit" style="font-size: 12px;"></i></p>',
          //'</div>',
          '<div class="col-lg-1 col-md-1 col-sm-1 col-xs-1"></div>',
          '</div>',
          '</div>',

          '</div>'
        ].join(""),
        controller: ["$scope", '$rootScope', '$compile', 'com.ctrip.tars.deployment.Service',
          function($scope, $rootScope, $compile, deploymentService) {
            var scope = this;

            this.create = function(element) {

              this.iflow = new com.ctrip.tars.component.IFlow2({
                Palette: element.find(".iflow-palette").get(0),
                Container: element.find(".iflow-container").get(0)
              }, $scope, $compile);

              this.watch = new com.ctrip.tars.util.Watch([], function(newData, oldData) {
                scope.iflow.draw(newData);
              });

              element.on("$destroy", function() {
                scope.iflow.destroy();
              });

              this.refresh = function(force) {
                var vip = $scope.vip,
                  data = null;

                if (vip && vip.children && vip.children.length > 0) {
                  var group = vip.children[0];
                  $scope.summary = group;
                }

                if (Object.isNull(vip) || Object.isNull(vip.groups) || vip.groups.length < 1) {
                  data = [];
                } else {
                  data = vip.groups[0].batches;
                }
                this.watch.setData(data, force);
              };

              //$scope.$on('dispatcher.interval.timer', scope.refresh);

              $scope.$on('deploying.redraw', function(event, data) {
                //var time = new Date().getTime();
                deploymentService.getSummary(data, function(vip) {
                  $rootScope.$broadcast('deployment.progress.update', vip.percent, false);
                  $scope.vip = vip;
                  scope.refresh();
                  //time = new Date().getTime() - time;
                  //console.log("watch:" + time / 1000);
                });
              });

              $scope.$on("sidebar.collapse.on", function() {
                scope.refresh(true);
              });

              $scope.$on('window.resize', function() {
                scope.refresh(true);
              });

              $scope.getSize = function() {
                return element.width() + element.height();
              };

              $scope.$watch("getSize()", function(newWidth, oldWidth) {
                scope.refresh(true);
              });

            };
          }
        ],
        link: function($scope, element, attrs, controller) {
          controller.create(element);
        }
      };
    });

