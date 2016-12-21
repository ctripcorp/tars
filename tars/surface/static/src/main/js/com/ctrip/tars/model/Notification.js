Class.forName({

  name: "class com.ctrip.tars.model.Notification extend Object",

  "public static final ERROR": 2,
  "public static final MESSAGE": 1,
  "public static final Notice": 0,

  "@Getter @Setter private level": 0,
  "@Getter @Setter private title": "",
  "@Getter @Setter private content": "",
  "handler": function() {},

  Notification: function(level, title, content, handler) {
    this.level = level || 1;
    this.title = title;
    this.content = content;
    if (handler && Object.isFunction(handler)) {
      this.handler = handler;
    }
  }

});

