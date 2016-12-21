Class.forName({
  name: "class com.ctrip.tars.util.Common extends Object",

  Common: function() {},

  "static assert": function(bCondition) {
    if (!bCondition) {
      console.log($.makeArray(arguments).slice(1));
    }
  },
  "static roundN": function(x, n) {
    if (!n)
      n = 5;

    if (isNaN(x) || !x) {
      return 0;
    } else {
      var y = Math.pow(10, n);
      return Math.round(x * y) / y;
    }
  },
  "static ercn": function(input) {
    if (isNaN(input)) {
      return 0;
    } else if (!input) {
      return 0;
    } else if (Math.abs(input) >= 1) {
      return input;
    } else if (Math.abs(input * 10) >= 1) {
      return roundN((input * 10), 5) + "/拾";
    } else if (Math.abs(input * 100) >= 1) {
      return roundN((input * 100), 5) + "/佰";
    } else if (Math.abs(input * 1000) >= 1) {
      return roundN((input * 1000), 5) + "/仟";
    } else if (Math.abs(input * 10000) >= 1) {
      return roundN((input * 10000), 5) + "/万";
    } else {
      return roundN((input * 100000000), 5) + "/亿";
    }
  },
  "static stripscript": function(s) {
    var pattern = new RegExp(
      "[ `~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
    var rs = "";
    for (var i = 0; i < s.length; i++) {
      rs = rs + s.substr(i, 1).replace(pattern, '_');
    }
    return rs;
  }
});

