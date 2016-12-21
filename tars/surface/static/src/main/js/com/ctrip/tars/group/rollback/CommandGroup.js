/**
 * Created by liujc on 2015/2/28.
 */

$import("com.ctrip.tars.group.rollback.Cancel");
$import("com.ctrip.tars.group.rollback.Confirm");

$import("js.util.HashMap", "BootstrapClassLoader");
Class.forName({
  name: "class com.ctrip.tars.group.rollback.CommandGroup extends Object",

  "private groups": new js.util.HashMap(),

  "CommandGroup": function() {
    this.groups.put("step-0", [new com.ctrip.tars.group.rollback.Confirm(0),
      new com.ctrip.tars.group.rollback.Cancel(0)
    ]);
  },
  "static getInstance": function() {
    if (Object.isNull(com.ctrip.tars.group.rollback.CommandGroup.instance)) {
      com.ctrip.tars.group.rollback.CommandGroup.instance = new com.ctrip.tars.group.rollback.CommandGroup();
    }
    return com.ctrip.tars.group.rollback.CommandGroup.instance;
  },

  "getCommands": function(key) {
    return this.groups.get(key);
  }
});

