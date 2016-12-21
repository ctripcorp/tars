/**
 * Created by liujc on 2015/2/28.
 */
$import("com.ctrip.tars.group.Command");
$import("com.ctrip.tars.component.IAjax");
$import("com.ctrip.tars.util.Id");

Class.forName({
  name: "class com.ctrip.tars.group.rollback.Confirm extends com.ctrip.tars.group.Command",

  "icon": "check",
  "text": "确认",
  "title": "确认",
  "@Getter @Setter position": "pull-right",
  "@Getter @Setter theme": "warning",
  "@Getter @Setter status": 0,

  Confirm: function(status) {
    this.status = status;
    this.disabled = false;
    this.active = false;
  },

  "after": function($scope, deployment) {
    //更改
    $("#window--3").find(".au-dialog-close").click();

    var params = {};
    params[URL_PARAMS.DEPLOYMENT] = deployment.id;
    $scope.forceSearch(params);

    this.$super.after.call(this, $scope);
  },

  "click": function($scope, $event) {
    var scope = this;

    if (!scope.active) {
      return;
    }

    scope.$super.click.call(scope);
    scope.disabled = true;

    //var ele = $event.target;

    // TODO 持久化操作
    // js.lang.System.out.println("use restful api for saving data to server.");
    var url = [BASE_URL, 'deployments'].join(""); //"surface/ticket/?_method=POST",//

    $scope.$root.$broadcast("status.rank.update", {
      tactics: "ROLLBACK",
      warZone: "APP",
      warStage: "DEPLOYING",
      battle: "BEFORE_CREATE"
    });

    com.ctrip.tars.component.IAjax.post(url, {
      data: $scope.getPostData(),
      exception: function() {
        scope.disabled = false;
        $scope.$root.$broadcast("status.rank.update", {
          tactics: "ROLLBACK",
          warZone: "APP",
          warStage: "DEPLOYING",
          battle: "CREATE_FAILURE"
        });
      },
      success: function() {
        $scope.$root.$broadcast("status.rank.update", {
          tactics: "ROLLBACK",
          warZone: "APP",
          warStage: "DEPLOYING",
          battle: "CREATE_SUCCESS",
          deployment: this
        });
        //等待返回状态成功后执行
        if (com.ctrip.tars.util.Id.isValid(this.id)) {
          com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', this.id, '/start'].join(""), {
            success: function() {
              scope.after($scope, this);
              scope.disabled = false;
            },
            exception: function() {
              scope.disabled = false;
            }
          });
        } else {
          scope.disabled = false;
        }
      }
    });

  }
});

