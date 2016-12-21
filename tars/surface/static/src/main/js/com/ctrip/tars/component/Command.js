/**
 * Created by lico on 15-1-20.
 */

Class.forName({
  name: "class com.ctrip.tars.component.Command extends Object",

  "@Getter @Setter icon": "",
  "@Getter @Setter text": "",
  "@Getter @Setter title": "",
  "@Getter @Setter disabled": false,
  "@Getter @Setter active": true,

  "abstract click": function() {},
  "abstract after": function() {}
});

//Waiting
Class.forName({
  name: "class com.ctrip.tars.component.Waiting extends com.ctrip.tars.component.Command",
  //"icon": "logo-1",
  "@Getter @Setter status": {},
  "@Getter @Setter size": "",
  "@Getter @Setter left": "",
  "@Getter @Setter marginLeft": "",

  "@Getter @Setter waiting": true,

  Waiting: function(status, size, left, marginLeft) {
    this.status = status;
    this.size = size;
    this.left = left;
    this.marginLeft = marginLeft;
  },

  "click": function($scope) {
    return false;
  },
  "show": function($scope) {
    //var id = $scope.status.battle;
    //$("#" + id).licoLoading({
    //	logo: this.icon,
    //	desc: id
    //});

    return false;
  },
  "hide": function($scope) {
    return false;
  }
});

