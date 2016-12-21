Class.forName({

  name: "class com.ctrip.tars.model.Flowstep extend Object",

  "@Getter @Setter private name": 0,
  "@Getter @Setter private time": "",
  "@Getter @Setter private progress": "todo", // doing done todo error
  "@Getter @Setter private data": {},


  Flowstep: function(name, progress, time, data, handler) {

    this.name = name;
    this.progress = progress || "todo";
    this.time = time;
    this.data = data;
    if (handler && Object.isFunction(handler)) {
      this.handler = handler;
    }
  },

  "handler": function() {
    var events = angular.element($("#com-ctrip-tars-console-Controller")).scope();
    events.filter({
      deploy_target_status: this.data.status,
      deploy_target: this.data.id
    });

    $("li[name='console']").click();
  }
});

