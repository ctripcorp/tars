/**
 * Created by liujc on 2015/2/28.
 */
$import("com.ctrip.tars.group.Command");
$import("com.ctrip.tars.component.IAjax");
$import("com.ctrip.tars.util.Id");

Class.forName({
  name: "class com.ctrip.tars.group.rollout.Confirm extends com.ctrip.tars.group.Command",

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
    $("#window--2").find(".au-dialog-close").click();

    var params = {};
    params[URL_PARAMS.DEPLOYMENT] = deployment.id;
    $scope.forceSearch(params);

    var steps = $scope.steps,
      appRollingCotrl = angular.element($("#com-ctrip-tars-group-rollout-Controller")).scope();

    // reset to step 1.
    if (steps && steps.length > 0) {
      steps[0].progress = 'doing';
      for (var i = 1, len = steps.length; i < len; i++) {
        steps[i].progress = 'todo';
      }
    }
    // reset form.
    appRollingCotrl.settings.reset();

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
    var status = $scope.command.status;
    var steps = $scope.steps;
    if (status >= 0 && status < steps.length - 1) {
      steps[status].progress = "done";
    }

    // TODO 持久化操作
    // js.lang.System.out.println("use restful api for saving data to server.");
    var url = [BASE_URL, 'deployments'].join(""), //"surface/ticket/?_method=POST",//
      appRollingCotrl = angular.element($("#com-ctrip-tars-group-rollout-Controller")).scope(),
      builderCotrl = angular.element($("#com-ctrip-tars-packages-Controller")).scope(),
      dispatcherContrl = angular.element($("#com-ctrip-tars-dispatcher-Controller")).scope();

    var params = appRollingCotrl.getValidParams(),
      urlParams = dispatcherContrl.getURLParams(),
      settings = appRollingCotrl.settings,
      config = settings.getTranslatedValues(),
      group = settings.getValues().group;

    var data = {
      application: params.app || urlParams[URL_PARAMS.APP],
      package: builderCotrl.getSelectedBuilder().id,
      config: config,
      flavor: $scope.settings.values.flavor || "rollout",
      id: builderCotrl.reroll.deploymentId,
      group: group ? group.id : null
    };

    $scope.$root.$broadcast("status.rank.update", {
      tactics: data.flavor.toUpperCase(),
      warZone: "APP",
      warStage: "DEPLOYING",
      battle: "BEFORE_CREATE"
    });

    com.ctrip.tars.component.IAjax.post(url, {
      data: data,
      exception: function() {
        scope.disabled = false;
        $scope.$root.$broadcast("status.rank.update", {
          tactics: data.flavor.toUpperCase(),
          warZone: "APP",
          warStage: "DEPLOYING",
          battle: "CREATE_FAILURE"
        });
      },
      success: function() {
        $scope.$root.$broadcast("status.rank.update", {
          tactics: data.flavor.toUpperCase(),
          warZone: "APP",
          warStage: "DEPLOYING",
          battle: "CREATE_SUCCESS",
          deployment: this
        });
        //等待返回状态成功后执行
        if (com.ctrip.tars.util.Id.isValid(this.id)) {
          com.ctrip.tars.component.IAjax.post([BASE_URL, 'deployments/', this.id, '/start'].join(""), {
            exception: function() {
              scope.disabled = false;
            },
            success: function() {
              scope.after($scope, this);
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

