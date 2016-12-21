/**
 * Created by liujc on 2015/2/28.
 */
$import("com.ctrip.tars.group.Command");
Class.forName({
  name: "class com.ctrip.tars.group.rollout.Previous extends com.ctrip.tars.group.Command",

  "icon": "arrow-left",
  "text": "上一步",
  "title": "上一步",
  "@Getter @Setter position": "pull-left",
  "@Getter @Setter theme": "default",
  "@Getter @Setter status": 0,

  Previous: function(status) {
    this.status = status;
  },

  "click": function($scope, $event) {
    var scope = this;

    scope.$super.click.call(scope);
    scope.disabled = true;

    window.setTimeout(function() {
      //var ele = $event.target;
      var status = $scope.command.status;
      var steps = $scope.steps;
      if (status > 0 && status < steps.length) {
        steps[status].progress = "todo";
        steps[status - 1].progress = "doing";
      }
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      scope.disabled = false;
    }, 300);
  }
});

