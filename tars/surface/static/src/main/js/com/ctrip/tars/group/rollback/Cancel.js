/**
 * Created by liujc on 2015/2/28.
 */
$import("com.ctrip.tars.group.Command");

Class.forName({
  name: "class com.ctrip.tars.group.rollback.Cancel extends com.ctrip.tars.group.Command",

  "icon": "times",
  "text": "取消",
  "title": "取消",
  "@Getter @Setter position": "pull-right",
  "@Getter @Setter theme": "default",
  "@Getter @Setter status": 0,

  Cancel: function(status) {
    this.status = status;
  },

  "click": function($scope, $event) {
    var scope = this;

    scope.$super.click.call(scope);
    scope.disabled = true;

    window.setTimeout(function() {
      $("#window--3").find(".au-dialog-close").click();
      scope.disabled = false;
    }, 300);
  }
});

