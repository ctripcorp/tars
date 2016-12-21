Class.forName({
  name: "class com.ctrip.tars.util.Jquery extends Object",

  Jquery: function() {},

  "static getOffset": function(target, origin) {
    var to = $(target).offset(),
      oo = $(origin).offset();
    return {
      left: to.left - oo.left,
      top: to.top - oo.top
    };
  }
});

