Class.forName({
  name: "class com.ctrip.tars.util.Id extends Object",

  Id: function() {},

  "public static isValid": function(id) {
    return !Object.isNull(id) && ((Object.isNumber(id) && id > 0) || (Object.isNumber(id * 1) && id * 1 > 0));
  },

  "public static isValidIds": function(ids) {
    if (!Object.isNull(ids)) {

      if (Object.isNumber(ids) && ids > 0) {
        return true;
      } else if (Object.isNumber(ids * 1) && ids * 1 > 0) {
        return true;
      } else {
        var idA = ("" + ids).split(",");
        for (var i = 0, len = idA.length; i < len; i++) {
          if (!Object.isNumber(idA[i] * 1) || idA[i] * 1 <= 0) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
});

