$import("js.util.HashSet", "BootstrapClassLoader");
$import("js.lang.StringBuffer", "BootstrapClassLoader");

$import("com.ctrip.tars.group.CommandGroup");

Class.forName({
  name: "class com.ctrip.tars.group.Contribution extends Object",

  "@Getter warZone": {
    id: "APP"
  }, // Application, ...

  "@Getter warStage": {
    id: "NONE"
  }, // 工作中, 生产发布中

  "@Getter battle": {
    id: "NONE"
  },

  "@Getter tactics": {
    id: "ROLLOUT"
  }, //reroll,rollback

  "@Getter allies": false,
  "@Getter armistice": false,

  //tactics
  'public static final ROLLBACK': "回退",
  'public static final REROLL': "重发",
  'public static final ROLLOUT': "rollout",
  'public static final SCALEOUT': "扩容",

  //warZone
  'public static final APP': "Application",

  //warStage
  'public static final DEPLOYING': "发布中",
  'public static final WORKING': "工作中",
  'public static final HISTORY': "发布历史",

  //battle
  'public static final SMOKE_BRAKED': "Smoke braked",
  'public static final BAKE_BRAKED': "Bake braked",
  'public static final ROLLOUT_BRAKED': "Roll out braked",

  'public static final REVOKED': "Revoked",
  'public static final SUCCESS': "Success",
  'public static final FAILURE': "Failure",
  'public static final ROLLOUT_SUCCESS': "Roll out success",
  'public static final ROLLOUT_FAILURE': "Roll out failure",
  'public static final ROLLING_OUT': "Rolling out",
  'public static final BAKE_SUCCESS': "Bake success",
  'public static final BAKE_FAILURE': "Bake failure",
  'public static final BAKING': "Baking",
  'public static final SMOKE_SUCCESS': "Smoke success",
  'public static final SMOKE_FAILURE': "Smoke failure",
  'public static final SMOKING': "Smoking",
  'public static final PENDING': "待发布",
  'public static final NONE': "...",

  'public static final BRAKED': [
    "SMOKE_BRAKED", "BAKE_BRAKED", "ROLLOUT_BRAKED",
    "SMOKE_SUCCESS_BRAKED", "BAKE_SUCCESS_BRAKED", "ROLLOUT_SUCCESS_BRAKED",
    "SMOKE_FAILURE_BRAKED", "BAKE_FAILURE_BRAKED", "ROLLOUT_FAILURE_BRAKED"
  ],

  'public static final ALLIES_CONTAINER': new js.util.HashSet(),
  Contribution: function() {
    var ALLIES_CONTAINER = com.ctrip.tars.group.Contribution.ALLIES_CONTAINER;
    ALLIES_CONTAINER.add("FAILURE");
    ALLIES_CONTAINER.add("ROLLOUT_SUCCESS");
    ALLIES_CONTAINER.add("ROLLOUT_FAILURE");
    ALLIES_CONTAINER.add("BAKE_SUCCESS");
    ALLIES_CONTAINER.add("BAKE_FAILURE");
    ALLIES_CONTAINER.add("SMOKE_SUCCESS");
    ALLIES_CONTAINER.add("SMOKE_FAILURE");
  },
  getBriefing: function() {
    var contribution = com.ctrip.tars.group.Contribution;
    var sb = new js.lang.StringBuffer();

    sb.append(contribution[this.warStage.id]);
    if (this.warStage.id == "DEPLOYING" || this.warStage.id == "HISTORY") {
      sb.append("（")
        .append(this.isBraked() ? "braked" : contribution[this.battle.id])
        .append("）");
    }

    return sb.toString();
  },
  getTacticsName: function(id) {
    var contribution = com.ctrip.tars.group.Contribution;
    var sb = new js.lang.StringBuffer();

    sb.append("（")
      .append(contribution[(id || this.tactics.id || 'rollout').toUpperCase()])
      .append("）");

    return sb.toString();
  },
  getAirmobile: function() {
    return com.ctrip.tars.group.CommandGroup.getInstance().getGlobal();
  },
  getGroupArmy: function() {
    var commands = null,
      commandGroup = com.ctrip.tars.group.CommandGroup.getInstance();
    if (this.warStage.id == "WORKING") {
      commands = commandGroup.getCommands(this.tactics.id, "APP_WORKING" /*+ (this.armistice ? "_ARMISTICE" : "")*/ );
    } else if (this.warStage.id == "DEPLOYING") {
      commands = commandGroup.getCommands(this.tactics.id, "APP_DEPLOYING_" + this.battle.id + (this.allies ? "_ALLIES" : ""));
    }
    return commands || [];
  },
  setWarZone: function(id) {
    this.warZone.id = id;
    this.warZone.name = com.ctrip.tars.group.Contribution[id];
  },
  setWarStage: function(id) {
    this.warStage.id = id;
    this.warStage.name = com.ctrip.tars.group.Contribution[id];
  },
  setBattle: function(id) {
    this.battle.id = id;
    this.battle.name = com.ctrip.tars.group.Contribution[id];
  },
  update: function(status, callback) {
    var flag = false;
    if (this.warZone.id != status.warZone) {
      this.setWarZone(status.warZone);
      flag = true;
    }
    if (this.warStage.id != status.warStage) {
      this.setWarStage(status.warStage);
      flag = true;
    }
    if (this.battle.id != status.battle) {
      this.setBattle(status.battle);
      flag = true;
    }

    if (flag && callback) {
      callback.call(this);
    }
  },
  setAllies: function(battle, allies) {
    var ALLIES_CONTAINER = com.ctrip.tars.group.Contribution.ALLIES_CONTAINER;
    if (battle && ALLIES_CONTAINER.contains(battle)) {
      this.allies = allies;
    } else {
      this.allies = false;
    }
  },
  setArmistice: function(armistice) {
    this.armistice = armistice;
  },

  'public static isWithdrawal': function(status) {
    return status && status.warStage === "DEPLOYING" && (status.battle === 'SUCCESS' || status.battle === 'REVOKED');
  },

  isWithdrawal: function() {
    return com.ctrip.tars.group.Contribution.isWithdrawal({
      warStage: this.warStage.id,
      battle: this.battle.id
    });
  },

  'public static isSuccess': function(status) {
    return status && status.warStage === "DEPLOYING" && (status.battle === 'SUCCESS');
  },

  isSuccess: function() {
    return com.ctrip.tars.group.Contribution.isSuccess({
      warStage: this.warStage.id,
      battle: this.battle.id
    });
  },

  'public static isBraked': function(status) {
    return status && status.warStage === "DEPLOYING" && (com.ctrip.tars.group.Contribution.BRAKED.contains(status.battle));
  },

  isBraked: function() {
    return com.ctrip.tars.group.Contribution.isBraked({
      warStage: this.warStage.id,
      battle: this.battle.id
    });
  }
});

