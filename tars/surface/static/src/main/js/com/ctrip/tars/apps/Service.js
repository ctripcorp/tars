$import("com.ctrip.tars.base.SegmentService");

Class.forName({
  name: "class com.ctrip.tars.apps.Service extends com.ctrip.tars.base.SegmentService",
  Service: function() {
    this.data.data.protectedAttributes.add("groups")
    this.data.data.setProtectedAttributesParser(function(newValue, oldValue, attr) {
      if (attr === 'groups') {
        var fridge = new com.ctrip.tars.util.Fridge();
        fridge.clear();
        fridge.append(oldValue);
        fridge.scour(newValue);
        return fridge.toArray();
      }

      return oldValue;
    });
  },

  // parse: (function() {
  //   var fridge = new com.ctrip.tars.util.Fridge();
  //   return function(data, params, mode) {
  //     if (params.app_id) {
  //       this.data.data.scour(data.results, "id", null, function(key, type, dest, origin) {
  //         if (type === 0 && key === 'groups') {
  //           fridge.clear();
  //           fridge.append(dest.groups);
  //           fridge.scour(origin.groups);
  //           origin.groups = fridge.toArray();
  //         }
  //       });
  //     } else {
  //       this.$super.parse.call(this, data, params);
  //     }
  //   };
  // })(),

  getUrl: function() {
    return [BASE_URL, "applications"].join("");
  }
});

angular
  .module("com.ctrip.tars.apps", [])
  .service('com.ctrip.tars.apps.Service', com.ctrip.tars.apps.Service);

