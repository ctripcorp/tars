Class.forName({
  name: "class com.ctrip.tars.util.Angular extends Object",

  Angular: function() {},

  "static getParent": function(scope, selector) {
    if (!scope) {
      throw new js.lang.IllegalArgumentException("Parameter named scope can not be null.");
    }

    var $parent = scope.$parent;
    if (!selector) {
      return $parent;
    }

    var parent = com.ctrip.tars.util.Angular.getScope(selector);
    while ($parent && $parent != parent) {
      $parent = $parent.$parent;
    }
    return $parent;
  },

  "static getScope": function(target) {
    var ele = $(target);
    if (ele.length < 0) {
      throw new js.lang.IllegalArgumentException("The element doesn't exist with selector of '" + target + "'");
    } else if (ele.length > 1) {
      throw new js.lang.IllegalArgumentException("Exist more than one element with selector of '" + target + "'");
    }
    return angular.element(ele).scope();
  },

  "static getRootScope": function() {
    return angular.element(document).scope();
  }
});

