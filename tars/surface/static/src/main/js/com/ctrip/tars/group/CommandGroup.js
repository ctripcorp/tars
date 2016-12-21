$import("js.util.HashMap", "BootstrapClassLoader");
$import("com.ctrip.tars.group.Command");

Class.forName({
  name: "class com.ctrip.tars.group.CommandGroup extends Object",

  "private groups": [],
  "private global": null,

  "CommandGroup": function() {

    var reroll = new js.util.HashMap();
    var rollback = new js.util.HashMap();

    var rollout = new js.util.HashMap();

    rollout.put("APP_DEPLOYING_FAILURE", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_SUCCESS", []);

    rollout.put("APP_DEPLOYING_REVOKED", []);

    rollout.put("APP_DEPLOYING_SMOKE_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_BAKE_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_ROLLOUT_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_SMOKE_SUCCESS_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_SUCCESS_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_SUCCESS_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_BAKE_SUCCESS_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_SUCCESS_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_SUCCESS_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_ROLLOUT_SUCCESS_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_SUCCESS_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_SUCCESS_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_SMOKE_FAILURE_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_FAILURE_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_FAILURE_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_BAKE_FAILURE_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_FAILURE_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_FAILURE_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_ROLLOUT_FAILURE_BRAKED", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_FAILURE_BRAKED"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Resume({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_FAILURE_BRAKED"
      }, 40, "67%", "-20px", false, true)
    ]);

    rollout.put("APP_DEPLOYING_ROLLOUT_SUCCESS", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_SUCCESS"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.RollingOut({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_SUCCESS"
      }, 40, "67%", "-20px", false, true)
      //new com.ctrip.tars.group.Rollback({ warZone: "APP", warStage: "DEPLOYING", battle: "ROLLOUT_SUCCESS" }, 40, "50%", "-20px")
    ]);
    rollout.put("APP_DEPLOYING_ROLLOUT_FAILURE", [
      //new com.ctrip.tars.group.Rollback({ warZone: "APP", warStage: "DEPLOYING", battle: "BAKING" }, 40, "33%", "-20px"),
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_ROLLING_OUT", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLING_OUT"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.component.Waiting({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLING_OUT"
      }, 40, "67%", "-20px", false)
      //new com.ctrip.tars.group.Pause({ warZone: "APP", warStage: "DEPLOYING", battle: "ROLLING_OUT" }, 40, "50%", "-20px")
    ]);
    rollout.put("APP_DEPLOYING_BAKE_SUCCESS", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_SUCCESS"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.RollingOut({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_SUCCESS"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_BAKE_FAILURE", [
      //new com.ctrip.tars.group.Rollback({ warZone: "APP", warStage: "DEPLOYING", battle: "BAKING_FAILURE" }, 40, "33%", "-20px"),
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_BAKING", [
      //disabled
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKING"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.component.Waiting({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKING"
      }, 40, "67%", "-20px", false)
      //new com.ctrip.tars.group.Pause({ warZone: "APP", warStage: "DEPLOYING", battle: "BAKING" }, 40, "50%", "-20px")
    ]);
    rollout.put("APP_DEPLOYING_SMOKE_SUCCESS", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_SUCCESS"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Baking({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_SUCCESS"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_SMOKE_FAILURE", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_SMOKING", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKING"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.component.Waiting({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKING"
      }, 40, "67%", "-20px", false)
    ]);
    rollout.put("APP_DEPLOYING_PENDING", [
      new com.ctrip.tars.group.Revoke({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "PENDING"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Smoking({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "PENDING"
      }, 40, "67%", "-20px", false, true)
    ]);

    rollout.put("APP_WORKING", [
      //new com.ctrip.tars.group.Rollback(-1, 40, "33%", "-20px"),
      //new com.ctrip.tars.group.StartRollout(-1, 40, "67%", "-20px")
      new com.ctrip.tars.group.StartRollout({
        warZone: "APP",
        warStage: "WORKING",
        battle: "NONE"
      }, 40, "50%", "-20px", false, true)
    ]);

    rollout.put("APP_DEPLOYING_NONE", [
      //new com.ctrip.tars.group.ProdRolling({ warZone: "APP", warStage: "DEPLOYING", battle: "NONE" }, 40, "50%", "-20px", false)
    ]);

    rollout.put("APP_DEPLOYING_FAILURE_ALLIES", [
      new com.ctrip.tars.group.RevokeAndStartRollout({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);

    rollout.put("APP_DEPLOYING_ROLLOUT_SUCCESS_ALLIES", [
      new com.ctrip.tars.group.RevokeAndStartRollout({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_SUCCESS"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.RollingOut({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_SUCCESS"
      }, 40, "67%", "-20px", false, true)
      //new com.ctrip.tars.group.Rollback({ warZone: "APP", warStage: "DEPLOYING", battle: "ROLLOUT_SUCCESS" }, 40, "50%", "-20px")
    ]);
    rollout.put("APP_DEPLOYING_ROLLOUT_FAILURE_ALLIES", [
      //new com.ctrip.tars.group.Rollback({ warZone: "APP", warStage: "DEPLOYING", battle: "BAKING" }, 40, "33%", "-20px"),
      new com.ctrip.tars.group.RevokeAndStartRollout({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "ROLLOUT_FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_BAKE_SUCCESS_ALLIES", [
      new com.ctrip.tars.group.RevokeAndStartRollout({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_SUCCESS"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.RollingOut({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_SUCCESS"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_BAKE_FAILURE_ALLIES", [
      //new com.ctrip.tars.group.Rollback({ warZone: "APP", warStage: "DEPLOYING", battle: "BAKING_FAILURE" }, 40, "33%", "-20px"),
      new com.ctrip.tars.group.RevokeAndStartRollout({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "BAKE_FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_SMOKE_SUCCESS_ALLIES", [
      new com.ctrip.tars.group.RevokeAndStartRollout({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_SUCCESS"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Baking({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_SUCCESS"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_DEPLOYING_SMOKE_FAILURE_ALLIES", [
      new com.ctrip.tars.group.RevokeAndStartRollout({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_FAILURE"
      }, 40, "33%", "-20px", false),
      new com.ctrip.tars.group.Retry({
        warZone: "APP",
        warStage: "DEPLOYING",
        battle: "SMOKE_FAILURE"
      }, 40, "67%", "-20px", false, true)
    ]);
    rollout.put("APP_WORKING_ARMISTICE", []);

    this.groups.push(rollback);
    this.groups.push(reroll);
    this.groups.push(rollout);

    this.global = new com.ctrip.tars.group.Rollback({
      tactics: 'ROLLBACK',
      warZone: "APP",
      warStage: "",
      battle: ""
    }, 56, null, null, false);
  },
  "static getInstance": function() {
    if (Object.isNull(com.ctrip.tars.group.CommandGroup.instance)) {
      com.ctrip.tars.group.CommandGroup.instance = new com.ctrip.tars.group.CommandGroup();
    }
    return com.ctrip.tars.group.CommandGroup.instance;
  },
  "reset": function(commands) {
    if (commands) {
      for (var i = 0, len = commands.length; i < len; i++) {
        commands[i].setDisabled(false);
      }
    }
  },
  getGlobal: function() {
    return this.global;
  },
  "getCommands": function(mode, key) {
    var index = 0;
    switch (mode) {
      case 'rollback':
        index = 0;
        break;
      case 'reroll':
        index = 1;
        break;
      case 'rollout':
      default:
        index = 2;
        break;
    }

    var commands = [];
    for (var i = index, len = this.groups.length; i < len; i++) {

      if (this.groups[i].containsKey(key)) {
        commands = this.groups[i].get(key);
        //this.reset(commands);
        break;
      }

    }

    return commands;
  }
});

