/**
 * Created by liujc on 2015/2/28.
 */
$import("com.ctrip.tars.group.Command");
Class.forName({
  name: "class com.ctrip.tars.group.rollout.Next extends com.ctrip.tars.group.Command",

  "icon": "arrow-right",
  "text": "下一步",
  "title": "下一步",
  "@Getter @Setter position": "pull-right",
  "@Getter @Setter theme": "primary",
  "@Getter @Setter status": 0,

  Next: function(status) {
    this.status = status;
    this.active = false;
  },

  "click": function($scope, $event) {
    var scope = this;

    scope.$super.click.call(scope);
    scope.disabled = true;

    window.setTimeout(function() {
      //var ele = $event.target;
      var status = $scope.command.status;
      var steps = $scope.steps;
      if (status >= 0 && status < steps.length - 1) {
        steps[status].progress = "done";
        steps[status + 1].progress = "doing";
      }

      if (!$scope.$$phase) {
        $scope.$apply();
      }

      scope.disabled = false;
    }, 300);

  }
});

