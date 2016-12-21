/**
 * Created by liujc on 2015/2/28.
 */

$import("com.ctrip.tars.group.rollout.Cancel");
$import("com.ctrip.tars.group.rollout.Confirm");
$import("com.ctrip.tars.group.rollout.Next");
$import("com.ctrip.tars.group.rollout.Previous");

$import("js.util.HashMap", "BootstrapClassLoader");
Class.forName({
  name: "class com.ctrip.tars.group.rollout.CommandGroup extends Object",

  "private groups": new js.util.HashMap(),

  "CommandGroup": function() {
    this.groups.put("step-0", [new com.ctrip.tars.group.rollout.Next(0), new com.ctrip.tars.group.rollout.Cancel(0)]);

    this.groups.put("step-1", [new com.ctrip.tars.group.rollout.Previous(1), new com.ctrip.tars.group.rollout.Next(1),
      new com.ctrip.tars.group.rollout.Cancel(1)
    ]);

    this.groups.put("step-2", [new com.ctrip.tars.group.rollout.Previous(2), new com.ctrip.tars.group.rollout.Confirm(2),
      new com.ctrip.tars.group.rollout.Cancel(2)
    ]);
  },
  "static getInstance": function() {
    if (Object.isNull(com.ctrip.tars.group.rollout.CommandGroup.instance)) {
      com.ctrip.tars.group.rollout.CommandGroup.instance = new com.ctrip.tars.group.rollout.CommandGroup();

    }
    return com.ctrip.tars.group.rollout.CommandGroup.instance;
  },

  "getCommands": function(key) {
    return this.groups.get(key);
  }
});

